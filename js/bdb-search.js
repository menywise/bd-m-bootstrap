/* ================================================================
   bdb-search.js — Bible de Bloc v1.0.0
   Composant partagé — recherche globale cross-modules
   Sources : thesaurus_protocoles · site_faq · glossaire
   CDS Compliant | escHtml | zero onclick inline
   Session #53 — 2026-04-09
   ================================================================ */

var BdbSearch = (function () {

  'use strict';

  // --- État interne ---
  var _ready    = false;
  var _options  = {};
  var _data     = { protocoles: [], faq: [], glossaire: [] };
  var _debTimer = null;

  // --- Sécurité XSS ---
  function _esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Chargement données ---
  async function _loadProtocoles() {
    var cached = sessionStorage.getItem('bdb_search_protocoles');
    if (cached) { _data.protocoles = JSON.parse(cached); return; }
    var r = await window.bdb
      .from('thesaurus_protocoles')
      .select('id, libelle_cible, synonymes_recherche, pathologie, zone_anat, specialite')
      .limit(2000);
    if (r.error) return;
    _data.protocoles = r.data || [];
    sessionStorage.setItem('bdb_search_protocoles', JSON.stringify(_data.protocoles));
  }

  async function _loadFaq() {
    var cached = sessionStorage.getItem('bdb_search_faq');
    if (cached) { _data.faq = JSON.parse(cached); return; }
    var r = await window.bdb
      .from('site_faq')
      .select('id, question, reponse, categorie, module_key')
      .eq('statut', 'active')
      .limit(500);
    if (r.error) return;
    _data.faq = r.data || [];
    sessionStorage.setItem('bdb_search_faq', JSON.stringify(_data.faq));
  }

  async function _loadGlossaire() {
    var cached = sessionStorage.getItem('bdb_search_glossaire');
    if (cached) { _data.glossaire = JSON.parse(cached); return; }
    var r = await window.bdb
      .from('glossaire')
      .select('id, abbreviation, definition, variantes, categorie')
      .eq('show_in_module', true)
      .limit(500);
    if (r.error) return;
    _data.glossaire = r.data || [];
    sessionStorage.setItem('bdb_search_glossaire', JSON.stringify(_data.glossaire));
  }

  // --- Recherche ---
  function _search(terme) {
    if (!terme || terme.length < 2) return { protocoles: [], faq: [], glossaire: [] };
    var q = terme.toLowerCase();

    var protocoles = _data.protocoles.filter(function (p) {
      var hay = [p.libelle_cible, p.synonymes_recherche, p.pathologie, p.zone_anat]
        .join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 10);

    var faq = _data.faq.filter(function (f) {
      var hay = [f.question, f.reponse].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 5);

    var glossaire = _data.glossaire.filter(function (g) {
      var hay = [g.abbreviation, g.definition, g.variantes].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 5);

    return { protocoles: protocoles, faq: faq, glossaire: glossaire };
  }

  // --- Rendu résultats ---
  function _renderResults(container, resultats, terme) {
    if (!container) return;

    var total = resultats.protocoles.length + resultats.faq.length + resultats.glossaire.length;

    if (total === 0) {
      container.innerHTML =
        '<div class="text-center text-muted py-4">' +
        '<i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>' +
        'Aucun r\u00e9sultat pour \u00ab\u00a0' + _esc(terme) + '\u00a0\u00bb' +
        ' \u2014 essayez avec d\'autres mots.' +
        '</div>';
      return;
    }

    var html = '';

    if (resultats.protocoles.length) {
      html += '<div class="mb-3">' +
        '<div class="cds-label-section mb-2">' +
        '<i class="bi bi-journal-medical me-1"></i>Protocoles (' + resultats.protocoles.length + ')' +
        '</div>';
      resultats.protocoles.forEach(function (p) {
        html +=
          '<a href="../../modules/thesaurus/index.html" class="d-flex align-items-center gap-2 p-2 rounded text-decoration-none cds-clickable hover-bg mb-1" ' +
          'data-search-type="protocole" data-search-id="' + _esc(p.id) + '">' +
          '<i class="bi bi-journal-medical text-primary flex-shrink-0"></i>' +
          '<div class="overflow-hidden">' +
          '<div class="fw-semibold text-truncate" style="font-size:.85rem;">' + _esc(p.libelle_cible) + '</div>' +
          (p.pathologie ? '<div class="text-muted text-truncate" style="font-size:.75rem;">' + _esc(p.pathologie) + '</div>' : '') +
          '</div></a>';
      });
      html += '</div>';
    }

    if (resultats.faq.length) {
      html += '<div class="mb-3">' +
        '<div class="cds-label-section mb-2">' +
        '<i class="bi bi-question-circle me-1"></i>FAQ (' + resultats.faq.length + ')' +
        '</div>';
      resultats.faq.forEach(function (f) {
        html +=
          '<a href="../../modules/faq/index.html" class="d-flex align-items-center gap-2 p-2 rounded text-decoration-none cds-clickable mb-1" ' +
          'data-search-type="faq" data-search-id="' + _esc(f.id) + '">' +
          '<i class="bi bi-question-circle text-warning flex-shrink-0"></i>' +
          '<div class="overflow-hidden">' +
          '<div class="fw-semibold text-truncate" style="font-size:.85rem;">' + _esc(f.question) + '</div>' +
          (f.categorie ? '<div class="text-muted text-truncate" style="font-size:.75rem;">' + _esc(f.categorie) + '</div>' : '') +
          '</div></a>';
      });
      html += '</div>';
    }

    if (resultats.glossaire.length) {
      html += '<div class="mb-3">' +
        '<div class="cds-label-section mb-2">' +
        '<i class="bi bi-book me-1"></i>Glossaire (' + resultats.glossaire.length + ')' +
        '</div>';
      resultats.glossaire.forEach(function (g) {
        html +=
          '<a href="../../modules/glossaire/index.html" class="d-flex align-items-center gap-2 p-2 rounded text-decoration-none cds-clickable mb-1" ' +
          'data-search-type="glossaire" data-search-id="' + _esc(g.id) + '">' +
          '<i class="bi bi-book text-success flex-shrink-0"></i>' +
          '<div class="overflow-hidden">' +
          '<div class="fw-semibold text-truncate" style="font-size:.85rem;">' + _esc(g.abbreviation) + '</div>' +
          (g.definition ? '<div class="text-muted text-truncate" style="font-size:.75rem;">' + _esc(g.definition) + '</div>' : '') +
          '</div></a>';
      });
      html += '</div>';
    }

    container.innerHTML = html;
  }

  // --- Rendu barre de recherche ---
  function _renderSearchBar(container) {
    if (!container) return;

    container.innerHTML =
      '<div class="position-relative">' +
      '<i class="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted" style="z-index:1;"></i>' +
      '<input type="search" id="bdbSearchInput" class="form-control cds-search-input" ' +
      'placeholder="Rechercher un protocole, une question, un terme\u2026" ' +
      'autocomplete="off" aria-label="Recherche globale BDB"/>' +
      '</div>' +
      '<div id="bdbSearchResults" class="mt-3"></div>';

    var input   = container.querySelector('#bdbSearchInput');
    var results = container.querySelector('#bdbSearchResults');

    input.addEventListener('input', function () {
      var terme = input.value.trim();
      clearTimeout(_debTimer);
      if (terme.length < 2) {
        results.innerHTML = '';
        return;
      }
      _debTimer = setTimeout(function () {
        var res = _search(terme);
        _renderResults(results, res, terme);
      }, 250);
    });
  }

  // --- API publique ---
  return {

    /**
     * Initialise BdbSearch dans un conteneur hôte.
     * Appeler APRÈS window.bdbShellReady dans l'hôte.
     * @param {Object} opts
     * @param {string|Element} opts.container - sélecteur ou élément DOM
     * @param {boolean} [opts.showBar=true]   - afficher la barre de recherche
     */
    async init(opts) {
      _options = opts || {};
      await Promise.all([_loadProtocoles(), _loadFaq(), _loadGlossaire()]);

      var el = typeof _options.container === 'string'
        ? document.querySelector(_options.container)
        : _options.container;

      if (_options.showBar !== false) {
        _renderSearchBar(el);
      }
      _ready = true;
    },

    /**
     * Recherche programmatique — retourne { protocoles, faq, glossaire }
     * @param {string} terme
     */
    search: function (terme) {
      return _search(terme);
    },

    /**
     * Affiche les résultats dans un conteneur externe
     * @param {Element} container
     * @param {string} terme
     */
    renderResults: function (container, terme) {
      _renderResults(container, _search(terme), terme);
    },

    isReady: function () { return _ready; },

    clearCache: function () {
      sessionStorage.removeItem('bdb_search_protocoles');
      sessionStorage.removeItem('bdb_search_faq');
      sessionStorage.removeItem('bdb_search_glossaire');
      _data = { protocoles: [], faq: [], glossaire: [] };
      _ready = false;
    }
  };

})();
