/* ═══════════════════════════════════════════════════════════════════
   BDB-GLOSSAIRE-TOOLTIP.JS — Utilitaire tooltip cross-module
   Expose : BdbGlossaire.init() · .enrich(container) · .lookup(term)
   Chargé avant le JS de chaque module qui veut les tooltips.
   ═══════════════════════════════════════════════════════════════════ */

var BdbGlossaire = (function () {
  'use strict';

  var CACHE_KEY = 'bdb_glos_entries';
  var SKIP_TAGS = new Set(['INPUT', 'TEXTAREA', 'CODE', 'SCRIPT', 'STYLE', 'ABBR', 'PRE', 'BUTTON', 'SELECT']);

  var _entries = [];
  var _regex = null;
  var _ready = false;

  // ─── Helpers ──────────────────────────────────────────────────────

  function _escRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function _escHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _buildRegex() {
    var terms = [];
    _entries.forEach(function (e) {
      if (e.abbreviation && e.abbreviation.length >= 2) {
        terms.push(_escRegex(e.abbreviation));
      }
      if (e.variantes) {
        e.variantes.split('|').forEach(function (v) {
          v = v.trim();
          if (v.length >= 2) terms.push(_escRegex(v));
        });
      }
    });

    if (terms.length === 0) return;

    // Trier du plus long au plus court pour éviter les correspondances partielles
    terms.sort(function (a, b) { return b.length - a.length; });

    // Dédupliquer
    var seen = {};
    terms = terms.filter(function (t) {
      if (seen[t]) return false;
      seen[t] = true;
      return true;
    });

    _regex = new RegExp('\\b(' + terms.join('|') + ')\\b', 'gi');
  }

  // ─── Remplacement dans un nœud texte ─────────────────────────────

  function _replaceInTextNode(textNode) {
    var text = textNode.textContent;
    _regex.lastIndex = 0;
    if (!_regex.test(text)) return;

    _regex.lastIndex = 0;
    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    var match;

    while ((match = _regex.exec(text)) !== null) {
      var matchedTerm = match[1];
      var start = match.index;

      // Texte avant le match
      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      // Chercher l'entrée correspondante
      var entry = _lookupEntry(matchedTerm);
      var abbr = document.createElement('abbr');
      abbr.className = 'bdb-glos-term';
      abbr.textContent = matchedTerm;
      if (entry) {
        abbr.title = _escHtml(entry.definition);
        abbr.setAttribute('data-bs-toggle', 'tooltip');
        abbr.setAttribute('data-bs-placement', 'top');
        abbr.setAttribute('data-bs-trigger', 'hover focus');
      }
      frag.appendChild(abbr);

      lastIndex = start + matchedTerm.length;
    }

    // Texte restant
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  }

  // ─── Lookup interne (par abréviation ou variante) ────────────────

  function _lookupEntry(term) {
    if (!term) return null;
    var t = term.toLowerCase().trim();
    return _entries.find(function (e) {
      if (e.abbreviation && e.abbreviation.toLowerCase() === t) return true;
      if (e.variantes) {
        return e.variantes.split('|').some(function (v) {
          return v.trim().toLowerCase() === t;
        });
      }
      return false;
    }) || null;
  }

  // ─── API publique ─────────────────────────────────────────────────

  async function init() {
    if (_ready) return;

    // 1. Tentative depuis le cache sessionStorage
    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (cached && Array.isArray(cached) && cached.length > 0) {
        _entries = cached;
      }
    } catch (_) {}

    // 2. Fallback Supabase si cache vide
    if (_entries.length === 0 && window.bdb) {
      var r = await window.bdb
        .from('glossaire')
        .select('abbreviation,definition,variantes')
        .order('abbreviation');
      if (!r.error && r.data && r.data.length > 0) {
        _entries = r.data;
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(_entries)); } catch (_) {}
      }
    }

    if (_entries.length === 0) return;

    _buildRegex();
    if (_regex) _ready = true;
  }

  function enrich(container) {
    if (!_ready || !_regex || !container) return;

    // Réinitialiser le regex (stateful lastIndex)
    _regex.lastIndex = 0;

    var walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('abbr.bdb-glos-term')) return NodeFilter.FILTER_REJECT;
          _regex.lastIndex = 0;
          return _regex.test(node.textContent)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    // Remplacer en ordre inverse pour ne pas invalider les références
    for (var i = nodes.length - 1; i >= 0; i--) {
      _replaceInTextNode(nodes[i]);
    }

    // Initialiser les tooltips Bootstrap sur les abbr nouvellement créés
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
      container.querySelectorAll('abbr.bdb-glos-term[data-bs-toggle="tooltip"]').forEach(function (el) {
        bootstrap.Tooltip.getOrCreateInstance(el);
      });
    }
  }

  function lookup(term) {
    return _lookupEntry(term);
  }

  return { init: init, enrich: enrich, lookup: lookup };

})();
