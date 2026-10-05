/**
 * bdb-fonctions.js — Chargement dynamique des fonctions métier
 *
 * Usage :
 *   <script src="../../js/bdb-fonctions.js"></script>
 *   await window.bdbFonctions.populate(selectElement, options)
 *
 * API exposée sur window.bdbFonctions :
 *   .load()                → Promise<Array> — charge et cache les fonctions
 *   .populate(el, opts)    → Promise<void>  — remplit un <select>
 *   .clearCache()          → void           — vide le cache (après CRUD admin)
 *
 * Options de populate :
 *   selected   : string    — code à pré-sélectionner
 *   categorie  : string    — filtrer par catégorie ('soignant','medical','encadrement','externe','formation')
 *   placeholder: boolean   — ajouter "Sélectionner…" (défaut: true)
 *   grouped    : boolean   — optgroup par catégorie (défaut: false)
 *
 * Référence : Migration 071 — fonctions_metier
 */
(function () {
  'use strict';

  var _cache = null;

  var CAT_LABELS = {
    soignant:     'Soignant',
    medical:      'Médical',
    encadrement:  'Encadrement',
    externe:      'Externe',
    formation:    'Formation'
  };

  /**
   * Charge les fonctions depuis Supabase (cache en mémoire).
   * @returns {Promise<Array>}
   */
  async function loadFonctions() {
    if (_cache) return _cache;
    var result = await window.bdb
      .from('fonctions_metier')
      .select('code, label, categorie, parent, icon, color, is_active')
      .eq('is_active', true)
      .order('position');
    if (result.error || !result.data) return [];
    _cache = result.data;
    return _cache;
  }

  /**
   * Remplit un <select> avec les fonctions métier.
   * @param {HTMLSelectElement} selectEl
   * @param {object} [options]
   */
  async function populate(selectEl, options) {
    if (!selectEl) return;
    var opts = options || {};
    var fonctions = await loadFonctions();

    // Filtre catégorie
    if (opts.categorie) {
      fonctions = fonctions.filter(function (f) {
        return f.categorie === opts.categorie;
      });
    }

    selectEl.innerHTML = '';

    // Placeholder
    if (opts.placeholder !== false) {
      var ph = document.createElement('option');
      ph.value = '';
      ph.textContent = 'Sélectionner une fonction\u2026';
      ph.disabled = true;
      ph.selected = !opts.selected;
      selectEl.appendChild(ph);
    }

    if (opts.grouped) {
      // Grouper par catégorie
      var groups = {};
      fonctions.forEach(function (f) {
        var cat = f.categorie || 'autre';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(f);
      });
      Object.keys(groups).forEach(function (cat) {
        var og = document.createElement('optgroup');
        og.label = CAT_LABELS[cat] || cat;
        groups[cat].forEach(function (f) {
          og.appendChild(_makeOption(f, opts.selected));
        });
        selectEl.appendChild(og);
      });
    } else {
      fonctions.forEach(function (f) {
        selectEl.appendChild(_makeOption(f, opts.selected));
      });
    }
  }

  /**
   * Crée un élément <option>.
   * @param {object} f — ligne fonctions_metier
   * @param {string} [selectedCode]
   * @returns {HTMLOptionElement}
   */
  function _makeOption(f, selectedCode) {
    var o = document.createElement('option');
    o.value = f.code;
    o.textContent = f.label;
    if (selectedCode === f.code) o.selected = true;
    return o;
  }

  /** Vide le cache (appeler après un CRUD admin sur fonctions_metier). */
  function clearCache() {
    _cache = null;
  }

  /* ── Exposition globale ── */
  window.bdbFonctions = {
    load: loadFonctions,
    populate: populate,
    clearCache: clearCache
  };
})();
