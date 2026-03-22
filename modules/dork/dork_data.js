/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT: Consensus Design System
   FILE: data.js v1.0.0
   CONTEXT: CDS Framework - DORK_DASHBOARD
   STACK: HTML5 / CSS3 / JS Vanilla
   LEAD: Claude (Mode B)
   LAST UPDATE: 2026-01-13
   DISC: D (Manu)
   UX: Compatible D/I/S/C
   DEPENDENCIES: Aucune
   RAU: 1-8 actifs (6 non applicable)
   ═══════════════════════════════════════════════════════════════════════════ */

// ============================================================================
// STORAGE KEYS & CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  PROFILES: 'dorkDashboard_profiles_v2',
  SOURCES: 'dorkDashboard_sources_v2',
  OPERATORS: 'dorkDashboard_operators_v2',
  FILETYPES: 'dorkDashboard_filetypes_v2',
  DORKS_HISTORY: 'dorkDashboard_dorks_history_v2',
  CURRENT_PROFILE: 'dorkDashboard_current_profile',
  APP_VERSION: 'dorkDashboard_version'
};

const APP_VERSION = '2.0.0-CDS';

// ============================================================================
// STORAGE HELPERS (Sécurisé)
// ============================================================================

function safeGetStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch(e) {
    console.warn('Storage read error:', key, e);
    return defaultValue;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch(e) {
    console.warn('Storage write error:', key, e);
    if (e.name === 'QuotaExceededError') {
      alert('Espace stockage insuffisant');
    }
    return false;
  }
}

// ============================================================================
// UTILS
// ============================================================================

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function buildGoogleUrl(query) {
  return 'https://www.google.com/search?q=' + encodeURIComponent(query);
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
  } catch(e) {
    return iso;
  }
}

// ============================================================================
// DEFAULTS DATA
// ============================================================================

const DEFAULT_PROFILES = {
  ibode: {
    id: "ibode",
    label: "IBODE / Bloc opératoire",
    icon: "🏥",
    description: "Recherches bloc opératoire",
    sources_fiables: ["has", "interbloc", "sf2h"],
    keywords: ["instrumentation", "asepsie", "protocole bloc"],
    exclusions: ["-forum", "-blog"],
    created_at: "2026-01-13T00:00:00Z",
    updated_at: "2026-01-13T00:00:00Z"
  }
};

const DEFAULT_SOURCES = {
  has: {
    id: "has",
    label: "HAS",
    domains: ["has-sante.fr"],
    weight: 3,
    category: "institutional"
  },
  interbloc: {
    id: "interbloc",
    label: "Inter Bloc",
    domains: ["interbloc.com"],
    weight: 3,
    category: "professional"
  },
  sf2h: {
    id: "sf2h",
    label: "SF2H",
    domains: ["sf2h.net"],
    weight: 3,
    category: "professional"
  }
};

const DEFAULT_OPERATORS = {
  intitle: {
    id: "intitle",
    label: "intitle:",
    description: "Dans le titre",
    syntax: "intitle:{query}",
    icon: "fa-heading",
    enabled: true
  },
  inurl: {
    id: "inurl",
    label: "inurl:",
    description: "Dans l'URL",
    syntax: "inurl:{query}",
    icon: "fa-link",
    enabled: true
  },
  intext: {
    id: "intext",
    label: "intext:",
    description: "Dans le texte",
    syntax: "intext:{query}",
    icon: "fa-file-alt",
    enabled: true
  },
  site: {
    id: "site",
    label: "site:",
    description: "Site spécifique",
    syntax: "site:{domain}",
    icon: "fa-globe",
    enabled: true
  }
};

const DEFAULT_FILETYPES = {
  pdf: {id:"pdf", label:"PDF", extension:"pdf", color:"bg-danger bg-opacity-10 text-danger", enabled:true},
  doc: {id:"doc", label:"DOC", extension:"doc", color:"bg-primary bg-opacity-10 text-primary", enabled:true},
  docx: {id:"docx", label:"DOCX", extension:"docx", color:"bg-primary bg-opacity-10 text-primary", enabled:true},
  xls: {id:"xls", label:"XLS", extension:"xls", color:"bg-success bg-opacity-10 text-success", enabled:true},
  xlsx: {id:"xlsx", label:"XLSX", extension:"xlsx", color:"bg-success bg-opacity-10 text-success", enabled:true},
  ppt: {id:"ppt", label:"PPT", extension:"ppt", color:"bg-warning bg-opacity-10 text-warning", enabled:true},
  pptx: {id:"pptx", label:"PPTX", extension:"pptx", color:"bg-warning bg-opacity-10 text-warning", enabled:true}
};

const SOURCE_CATEGORIES = {
  institutional: {label:'Institutionnel', icon:'fa-university', color:'primary'},
  academic: {label:'Académique', icon:'fa-graduation-cap', color:'info'},
  professional: {label:'Professionnel', icon:'fa-briefcase', color:'success'},
  other: {label:'Autre', icon:'fa-folder', color:'secondary'}
};

// ============================================================================
// INIT
// ============================================================================

function initDefaults() {
  const v = safeGetStorage(STORAGE_KEYS.APP_VERSION);
  const forceReinit = v !== APP_VERSION;
  
  if (forceReinit) {
    console.log('Migration v2.0 - Réinit données');
    safeSetStorage(STORAGE_KEYS.APP_VERSION, APP_VERSION);
    safeSetStorage(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    safeSetStorage(STORAGE_KEYS.SOURCES, DEFAULT_SOURCES);
    safeSetStorage(STORAGE_KEYS.OPERATORS, DEFAULT_OPERATORS);
    safeSetStorage(STORAGE_KEYS.FILETYPES, DEFAULT_FILETYPES);
    safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
    safeSetStorage(STORAGE_KEYS.CURRENT_PROFILE, 'ibode');
    return;
  }
  
  if (!safeGetStorage(STORAGE_KEYS.PROFILES)) {
    safeSetStorage(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
  }
  if (!safeGetStorage(STORAGE_KEYS.SOURCES)) {
    safeSetStorage(STORAGE_KEYS.SOURCES, DEFAULT_SOURCES);
  }
  if (!safeGetStorage(STORAGE_KEYS.OPERATORS)) {
    safeSetStorage(STORAGE_KEYS.OPERATORS, DEFAULT_OPERATORS);
  }
  if (!safeGetStorage(STORAGE_KEYS.FILETYPES)) {
    safeSetStorage(STORAGE_KEYS.FILETYPES, DEFAULT_FILETYPES);
  }
  if (!safeGetStorage(STORAGE_KEYS.DORKS_HISTORY)) {
    safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
  }
  if (!safeGetStorage(STORAGE_KEYS.CURRENT_PROFILE)) {
    safeSetStorage(STORAGE_KEYS.CURRENT_PROFILE, 'ibode');
  }
}

// ============================================================================
// CRUD PROFILES
// ============================================================================

function createProfile(data) {
  const profiles = safeGetStorage(STORAGE_KEYS.PROFILES, {});
  const id = data.id || generateId();
  
  const p = {
    id,
    label: data.label || "Nouveau profil",
    icon: data.icon || "📁",
    description: data.description || "",
    sources_fiables: data.sources_fiables || [],
    keywords: data.keywords || [],
    exclusions: data.exclusions || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  profiles[id] = p;
  safeSetStorage(STORAGE_KEYS.PROFILES, profiles);
  return p;
}

function getProfiles() {
  return safeGetStorage(STORAGE_KEYS.PROFILES, {});
}

function getProfile(id) {
  const profiles = getProfiles();
  return profiles[id] || null;
}

function listProfiles() {
  const profiles = getProfiles();
  if (!profiles || typeof profiles !== 'object') return [];
  return Object.values(profiles).sort((a,b) => a.label.localeCompare(b.label));
}

function updateProfile(id, updates) {
  const profiles = getProfiles();
  if (!profiles[id]) return null;
  
  profiles[id] = {
    ...profiles[id],
    ...updates,
    id: profiles[id].id,
    created_at: profiles[id].created_at,
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.PROFILES, profiles);
  return profiles[id];
}

function deleteProfile(id) {
  const profiles = getProfiles();
  if (!profiles[id]) return false;
  
  if (Object.keys(profiles).length === 1) {
    alert('Impossible supprimer dernier profil');
    return false;
  }
  
  const curr = safeGetStorage(STORAGE_KEYS.CURRENT_PROFILE);
  if (curr === id) {
    const remaining = Object.keys(profiles).filter(pid => pid !== id);
    safeSetStorage(STORAGE_KEYS.CURRENT_PROFILE, remaining[0]);
  }
  
  delete profiles[id];
  safeSetStorage(STORAGE_KEYS.PROFILES, profiles);
  return true;
}

function duplicateProfile(id) {
  const p = getProfile(id);
  if (!p) return null;
  
  return createProfile({
    ...p,
    id: generateId(),
    label: p.label + ' (copie)'
  });
}

function exportProfile(id) {
  const p = getProfile(id);
  if (!p) {
    alert('Profil introuvable');
    return;
  }
  
  const blob = new Blob([JSON.stringify(p, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dork_profile_${p.id}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProfile(file) {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const p = JSON.parse(e.target.result);
      if (!p.label) throw new Error('Format invalide');
      
      p.id = generateId();
      p.created_at = new Date().toISOString();
      p.updated_at = new Date().toISOString();
      
      createProfile(p);
      alert('Profil importé: ' + p.label);
      
      if (typeof renderProfiles === 'function') renderProfiles();
    } catch(err) {
      alert('Erreur import: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ============================================================================
// CRUD SOURCES PROFIL
// ============================================================================

function createSourceInProfile(profileId, data) {
  const profile = getProfile(profileId);
  if (!profile) return null;
  
  const id = generateId();
  const source = {
    id,
    label: data.label || "Nouvelle source",
    domains: Array.isArray(data.domains) ? data.domains : [],
    category: data.category || "other",
    weight: data.weight || 2,
    created_at: new Date().toISOString()
  };
  
  if (!profile.sources) profile.sources = [];
  profile.sources.push(source);
  
  updateProfile(profileId, {sources: profile.sources});
  return source;
}

function getSourceFromProfile(profileId, sourceId) {
  const profile = getProfile(profileId);
  if (!profile || !profile.sources) return null;
  return profile.sources.find(s => s.id === sourceId) || null;
}

function updateSourceInProfile(profileId, sourceId, updates) {
  const profile = getProfile(profileId);
  if (!profile || !profile.sources) return null;
  
  const idx = profile.sources.findIndex(s => s.id === sourceId);
  if (idx === -1) return null;
  
  profile.sources[idx] = {
    ...profile.sources[idx],
    ...updates,
    id: profile.sources[idx].id,
    created_at: profile.sources[idx].created_at
  };
  
  updateProfile(profileId, {sources: profile.sources});
  return profile.sources[idx];
}

function deleteSourceFromProfile(profileId, sourceId) {
  const profile = getProfile(profileId);
  if (!profile || !profile.sources) return false;
  
  profile.sources = profile.sources.filter(s => s.id !== sourceId);
  updateProfile(profileId, {sources: profile.sources});
  return true;
}

function migrateDefaultSourcesToProfile(profileId) {
  const profile = getProfile(profileId);
  if (!profile) return false;
  
  if (profile.sources && profile.sources.length > 0) return false;
  
  const oldRefs = profile.sources_fiables || [];
  if (oldRefs.length === 0) return false;
  
  const sources = oldRefs
    .map(refId => DEFAULT_SOURCES[refId])
    .filter(s => s)
    .map(s => ({
      id: generateId(),
      label: s.label,
      domains: s.domains,
      category: s.category,
      weight: s.weight,
      created_at: new Date().toISOString()
    }));
  
  updateProfile(profileId, {sources});
  return true;
}

// ============================================================================
// CRUD SOURCES
// ============================================================================

function createSource(data) {
  const sources = safeGetStorage(STORAGE_KEYS.SOURCES, {});
  const id = data.id || generateId();
  
  sources[id] = {
    id,
    label: data.label || "Nouvelle source",
    domains: Array.isArray(data.domains) ? data.domains : [],
    weight: data.weight || 2,
    category: data.category || "other",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.SOURCES, sources);
  return sources[id];
}

function getSources() {
  return safeGetStorage(STORAGE_KEYS.SOURCES, {});
}

function getSource(id) {
  const sources = getSources();
  return sources[id] || null;
}

function listSources(category = null) {
  const sources = getSources();
  let list = Object.values(sources);
  if (category) list = list.filter(s => s.category === category);
  return list.sort((a,b) => b.weight - a.weight || a.label.localeCompare(b.label));
}

function updateSource(id, updates) {
  const sources = getSources();
  if (!sources[id]) return null;
  
  sources[id] = {
    ...sources[id],
    ...updates,
    id: sources[id].id,
    created_at: sources[id].created_at,
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.SOURCES, sources);
  return sources[id];
}

function deleteSource(id) {
  const sources = getSources();
  if (!sources[id]) return false;
  
  const profiles = getProfiles();
  const usedBy = Object.values(profiles).filter(p => 
    p.sources_fiables && p.sources_fiables.includes(id)
  );
  
  if (usedBy.length > 0) {
    const names = usedBy.map(p => p.label).join(', ');
    if (!confirm(`Source utilisée par ${usedBy.length} profil(s) (${names}). Supprimer?`)) return false;
    
    usedBy.forEach(p => {
      p.sources_fiables = p.sources_fiables.filter(sid => sid !== id);
      updateProfile(p.id, {sources_fiables: p.sources_fiables});
    });
  }
  
  delete sources[id];
  safeSetStorage(STORAGE_KEYS.SOURCES, sources);
  return true;
}

function getCategoryInfo(catId) {
  return SOURCE_CATEGORIES[catId] || SOURCE_CATEGORIES.other;
}

// ============================================================================
// CRUD OPERATORS
// ============================================================================

function createOperator(data) {
  const ops = safeGetStorage(STORAGE_KEYS.OPERATORS, {});
  const id = data.id || generateId();
  
  ops[id] = {
    id,
    label: data.label || "operator:",
    description: data.description || "",
    syntax: data.syntax || "{query}",
    icon: data.icon || "fa-cog",
    enabled: data.enabled !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.OPERATORS, ops);
  return ops[id];
}

function getOperators() {
  return safeGetStorage(STORAGE_KEYS.OPERATORS, {});
}

function getOperator(id) {
  const ops = getOperators();
  return ops[id] || null;
}

function listOperators(enabledOnly = false) {
  const ops = getOperators();
  let list = Object.values(ops);
  if (enabledOnly) list = list.filter(o => o.enabled);
  return list.sort((a,b) => a.label.localeCompare(b.label));
}

function updateOperator(id, updates) {
  const ops = getOperators();
  if (!ops[id]) return null;
  
  ops[id] = {
    ...ops[id],
    ...updates,
    id: ops[id].id,
    created_at: ops[id].created_at,
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.OPERATORS, ops);
  return ops[id];
}

function deleteOperator(id) {
  const ops = getOperators();
  if (!ops[id]) return false;
  delete ops[id];
  safeSetStorage(STORAGE_KEYS.OPERATORS, ops);
  return true;
}

function toggleOperatorEnabled(id) {
  const op = getOperator(id);
  if (!op) return null;
  return updateOperator(id, {enabled: !op.enabled});
}

// ============================================================================
// CRUD FILETYPES
// ============================================================================

function createFiletype(data) {
  const fts = safeGetStorage(STORAGE_KEYS.FILETYPES, {});
  const id = data.id || generateId();
  
  fts[id] = {
    id,
    label: data.label || "EXT",
    extension: data.extension || "ext",
    color: data.color || "bg-secondary bg-opacity-10 text-secondary",
    enabled: data.enabled !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.FILETYPES, fts);
  return fts[id];
}

function getFiletypes() {
  return safeGetStorage(STORAGE_KEYS.FILETYPES, {});
}

function getFiletype(id) {
  const fts = getFiletypes();
  return fts[id] || null;
}

function listFiletypes(enabledOnly = false) {
  const fts = getFiletypes();
  let list = Object.values(fts);
  if (enabledOnly) list = list.filter(ft => ft.enabled);
  return list.sort((a,b) => a.label.localeCompare(b.label));
}

function updateFiletype(id, updates) {
  const fts = getFiletypes();
  if (!fts[id]) return null;
  
  fts[id] = {
    ...fts[id],
    ...updates,
    id: fts[id].id,
    created_at: fts[id].created_at,
    updated_at: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.FILETYPES, fts);
  return fts[id];
}

function deleteFiletype(id) {
  const fts = getFiletypes();
  if (!fts[id]) return false;
  delete fts[id];
  safeSetStorage(STORAGE_KEYS.FILETYPES, fts);
  return true;
}

function toggleFiletypeEnabled(id) {
  const ft = getFiletype(id);
  if (!ft) return null;
  return updateFiletype(id, {enabled: !ft.enabled});
}

// ============================================================================
// CRUD DORKS HISTORY
// ============================================================================

function getDorksHistory() {
  return safeGetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
}

function saveDorkToHistory(dork) {
  let history = getDorksHistory();
  
  history.unshift({
    ...dork,
    created_at: dork.created_at || new Date().toISOString(),
    last_used: new Date().toISOString()
  });
  
  history = history.slice(0, 25);
  safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, history);
  return history;
}

function clearDorksHistory() {
  if (!confirm('Effacer historique complet ?')) return false;
  safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
  return true;
}

function removeDorkFromHistory(id) {
  let history = getDorksHistory();
  history = history.filter(d => d.id !== id);
  safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, history);
  return history;
}

function updateDorkInHistory(id, updates) {
  let history = getDorksHistory();
  const idx = history.findIndex(d => d.id === id);
  if (idx === -1) return null;
  
  history[idx] = {
    ...history[idx],
    ...updates,
    last_used: new Date().toISOString()
  };
  
  safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, history);
  return history[idx];
}

function getDorkFromHistory(id) {
  const history = getDorksHistory();
  return history.find(d => d.id === id) || null;
}

function setDorkRating(id, rating) {
  const clamped = Math.max(0, Math.min(5, rating));
  return updateDorkInHistory(id, { rating: clamped });
}

function toggleDorkValidation(id) {
  const dork = getDorkFromHistory(id);
  if (!dork) return null;
  return updateDorkInHistory(id, { validated: !dork.validated });
}