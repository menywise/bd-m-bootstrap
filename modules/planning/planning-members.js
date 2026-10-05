// =====================================================================
// PLANNING MEMBERS V2.0.0
// Source : planning_membres (Supabase) au lieu de MEMBERS_TABLE hardcodé
// Dépendances : window.bdb (supabase-client.js)
// Expose : window.PlanningMembers
// =====================================================================

const PlanningMembers = (() => {
  'use strict';

  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  let _table   = [];   // planning_membres depuis Supabase
  let _byCode  = {};   // index O(1) : code.toUpperCase() → membre
  let _loaded  = false;

  // ------------------------------------------------------------------
  // ALIAS MAP STATIQUE — résout les codes CSV historiques
  // Nécessaire pour l'import des anciens fichiers CSV
  // ------------------------------------------------------------------
  const ALIAS_MAP = {
    'LAMARCHE_C':          'NORMAND_C',
    'LAMARCHE-NORMAND_C':  'NORMAND_C',
    'LAMARCHE':            'NORMAND_C',
    'NORMAND':             'NORMAND_C',
    'MONZAUGE_S':          'VISCERAL',
    'MONZAUGE':            'VISCERAL',
    'SANDRINE':            'INTERIMAIRE',
    'OCEANE':              'VISCERAL',
    'OCÉANE':              'VISCERAL',
    'OCEANE_P':            'VISCERAL',
    'LATHIERE_O':          'VISCERAL',
    'LATHIERE':            'VISCERAL',
    'OPHELIE':             'VISCERAL',
    'OPHÉLIE':             'VISCERAL',
    'ARTHUR':              'VISCERAL',
    'HELENE':              'VISCERAL',
    'HÉLÈNE':              'VISCERAL',
    'HELENE_':             'VISCERAL',
    'GUILLAUME_S':         'INTERIMAIRE',
    'GUILLAUME':           'INTERIMAIRE',
    'INTERIM':             'INTERIMAIRE',
    'AUDE':                'ETUDIANT',
    'DA_COSTA_E':          'DA_COSTA',
    'DACOSTA_E':           'DA_COSTA',
    'DACOSTA':             'DA_COSTA',
    'MERIC_DE_BELFON_Q':   'MERIC_Q',
    'MERIC':               'MERIC_Q'
  };

  // ------------------------------------------------------------------
  // ALIAS CUSTOM (admin) — localStorage autorisé
  // Exception documentée 2026-02-26 : préférences UI locales
  // NE PAS migrer vers Supabase — comportement intentionnel
  // ------------------------------------------------------------------
  let _customAliases = {};

  function _loadCustomAliases() {
    try {
      const raw = localStorage.getItem('planning_custom_aliases');
      _customAliases = raw ? JSON.parse(raw) : {};
    } catch (e) {
      _customAliases = {};
    }
  }

  function _saveCustomAliases() {
    try {
      localStorage.setItem('planning_custom_aliases', JSON.stringify(_customAliases));
    } catch (e) {}
  }

  // ------------------------------------------------------------------
  // INIT — charge depuis Supabase
  // ------------------------------------------------------------------
  async function init() {
    if (_loaded) return;

    const DB = window.bdb;
    const { data, error } = await DB
      .from('planning_membres')
      .select('*')
      .eq('actif', true)
      .order('nom');

    if (error) {
      console.error('planning_membres : erreur chargement', error);
      return;
    }

    _table  = data || [];
    _byCode = {};
    for (const m of _table) {
      _byCode[m.code.toUpperCase()] = m;
    }

    _loaded = true;
    _loadCustomAliases();
  }

  function isLoaded() { return _loaded; }

  // ------------------------------------------------------------------
  // PRÉNOMS EN DOUBLON — calculé après chargement
  // ------------------------------------------------------------------
  function _getDuplicatedFirstnames() {
    const counts = {};
    for (const m of _table) {
      if (m.fonction === 'placeholder') continue;
      const p = m.prenom || m.nom;
      counts[p] = (counts[p] || 0) + 1;
    }
    const dupes = new Set();
    for (const [p, n] of Object.entries(counts)) {
      if (n > 1) dupes.add(p);
    }
    return dupes;
  }

  // ------------------------------------------------------------------
  // RESOLVE — code CSV → membre (avec alias custom prioritaires)
  // ------------------------------------------------------------------
  function resolve(code) {
    if (!code) return null;
    const upper = String(code).trim().toUpperCase();

    // 1. Direct
    if (_byCode[upper]) return _byCode[upper];

    // 2. Alias custom admin (localStorage)
    const ca = _customAliases[upper];
    if (ca) {
      const target = String(ca).trim().toUpperCase();
      if (_byCode[target]) return _byCode[target];
      const ca2 = ALIAS_MAP[target];
      if (ca2 && _byCode[ca2.toUpperCase()]) return _byCode[ca2.toUpperCase()];
    }

    // 3. ALIAS_MAP statique
    const canonical = ALIAS_MAP[upper];
    if (canonical && _byCode[canonical.toUpperCase()]) {
      return _byCode[canonical.toUpperCase()];
    }

    return null;
  }

  // ------------------------------------------------------------------
  // DISPLAY — texte matrice
  // ------------------------------------------------------------------
  function display(code) {
    const m = resolve(code);
    if (!m) return code; // inconnu → affiché tel quel (rouge dans matrice)

    if (m.fonction === 'medecin') {
      return 'Dr ' + m.nom.toUpperCase();
    }

    if (m.fonction === 'placeholder') {
      if (m.code === 'INTERIMAIRE') return 'Intérim';
      if (m.code === 'VISCERAL')    return 'Viscéral';
      if (m.code === 'ETUDIANT')    return 'Étudiant';
      return m.code;
    }

    // IDE / cadre / aide-soignant — prénom, avec initiale si doublon
    const prenom = m.prenom || m.nom;
    const dupes = _getDuplicatedFirstnames();
    if (dupes.has(prenom)) {
      return prenom + ' ' + m.nom.charAt(0) + '.';
    }
    return prenom;
  }

  // ------------------------------------------------------------------
  // LISTES POUR LES SELECTS
  // ------------------------------------------------------------------
  function getMedecins(inclureInactifs = true) {
    return _table
      .filter(m => m.fonction === 'medecin' && (inclureInactifs || m.actif))
      .map(m => m.code);
  }

  function getIDEs(inclureInactifs = true) {
    return _table
      .filter(m => m.fonction === 'infirmier' && (inclureInactifs || m.actif))
      .sort((a, b) => (a.prenom || '').localeCompare(b.prenom || '', 'fr', { sensitivity: 'base' }))
      .map(m => m.code);
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  function isPlaceholder(code) { return resolve(code)?.fonction === 'placeholder'; }
  function isKnown(code)       { return resolve(code) !== null; }

  // ------------------------------------------------------------------
  // ADMIN — custom aliases
  // ------------------------------------------------------------------
  function addCustomAlias(badCode, canonicalCode) {
    _customAliases[String(badCode).trim().toUpperCase()] =
      String(canonicalCode).trim().toUpperCase();
    _saveCustomAliases();
  }

  function removeCustomAlias(badCode) {
    delete _customAliases[String(badCode).trim().toUpperCase()];
    _saveCustomAliases();
  }

  function getCustomAliases() { return { ..._customAliases }; }

  // ------------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------------
  return {
    init,
    isLoaded,
    resolve,
    display,
    getMedecins,
    getIDEs,
    isPlaceholder,
    isKnown,
    addCustomAlias,
    removeCustomAlias,
    getCustomAliases,
    get MEMBERS_TABLE() { return _table; },
    get ALIAS_MAP()     { return ALIAS_MAP; }
  };

})();
