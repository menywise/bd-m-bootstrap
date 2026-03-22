/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT: Consensus Design System
   FILE: engine.js v1.0.0
   CONTEXT: CDS Framework - DORK_DASHBOARD
   STACK: HTML5 / CSS3 / JS Vanilla
   LEAD: Claude (Mode B)
   LAST UPDATE: 2026-01-13
   DISC: D (Manu)
   UX: Compatible D/I/S/C
   DEPENDENCIES: data.js
   RAU: 1-8 actifs (6 non applicable)
   ═══════════════════════════════════════════════════════════════════════════ */

// ============================================================================
// CONSTRUCTEUR DORK
// ============================================================================

function buildCustomDork(config) {
  const {
    base,
    operators = [],
    fileTypes = [],
    sources = [],
    profileId = null,
    keywords = []
  } = config;
  
  if (!base || !base.trim()) return null;
  
  let dork = base.trim();
  const operatorsData = getOperators();
  const filetypesData = getFiletypes();
  
  // Construire base avec keywords
  if (keywords && keywords.length > 0) {
    const terms = [base.trim(), ...keywords.slice(0, 3)];
    const uniqueTerms = [...new Set(terms)];
    if (uniqueTerms.length > 1) {
      dork = `(${uniqueTerms.map(t => `"${t}"`).join(' OR ')})`;
    }
  }
  
  // Appliquer opérateurs
  for (const opId of operators) {
    const op = operatorsData[opId];
    if (!op || !op.enabled) continue;
    
    if (opId === 'intitle') {
      dork = `intitle:"${base.trim()}"`;
    } else if (opId === 'inurl') {
      const urlBase = base.trim().toLowerCase().replace(/\s+/g, '-');
      dork += ` inurl:${urlBase}`;
    } else if (opId === 'intext') {
      dork += ` intext:"${base.trim()}"`;
    }
  }
  
  // Appliquer filetypes
  if (fileTypes.length > 0) {
    const ftList = fileTypes
      .map(ftId => filetypesData[ftId])
      .filter(ft => ft && ft.enabled)
      .map(ft => `filetype:${ft.extension}`);
    
    if (ftList.length > 0) {
      if (ftList.length === 1) {
        dork += ` ${ftList[0]}`;
      } else {
        dork += ` (${ftList.join(' OR ')})`;
      }
    }
  }
  
  // Appliquer sources (objets directs depuis profil)
  if (sources.length > 0) {
    const siteList = sources
      .filter(src => src && src.domains)
      .flatMap(src => src.domains.map(d => `site:${d}`));
    
    if (siteList.length > 0) {
      if (siteList.length === 1) {
        dork += ` ${siteList[0]}`;
      } else {
        dork += ` (${siteList.join(' OR ')})`;
      }
    }
  }

  
  // Appliquer exclusions profil
  if (profileId) {
    const profile = getProfile(profileId);
    if (profile && profile.exclusions && profile.exclusions.length > 0) {
      dork += ' ' + profile.exclusions.join(' ');
    }
  }
  
  return dork.trim();
}

function buildDorkFromProfile(base, profileId) {
  const profile = getProfile(profileId);
  if (!profile) return null;
  
  return buildCustomDork({
    base,
    operators: ['intitle'],
    fileTypes: ['pdf'],
    sources: profile.sources_fiables || [],
    profileId
  });
}

// ============================================================================
// PATTERNS PRÉDÉFINIS
// ============================================================================

const DORK_PATTERNS = [
  { label: 'PDF générique', template: '{base} filetype:pdf' },
  { label: 'DOC générique', template: '{base} filetype:doc OR filetype:docx' },
  { label: 'Index de fichiers', template: 'intitle:"index of" {base} filetype:pdf' },
  { label: 'Sites institutionnels FR', template: '{base} filetype:pdf site:*.gouv.fr OR site:*.chu.fr' },
  { label: 'Revues / magazines', template: '{base} (intitle:revue OR intitle:magazine)' },
  { label: 'Études / thèses', template: '{base} (intitle:thèse OR intitle:mémoire OR intitle:dissertation) filetype:pdf' },
  { label: 'Guides / protocoles', template: '{base} (intitle:procédure OR intitle:protocole) filetype:pdf' },
  { label: 'Citations & biblios', template: '"{base}" intext:bibliographie filetype:pdf' },
  { label: 'Sites commerciaux', template: '{base} filetype:pdf -site:*.gouv.fr -site:*.edu -site:*.org' },
  { label: 'Archives / anciens', template: '{base} (intitle:archive OR inurl:archive OR inurl:old)' }
];

function generatePatterns(base) {
  const trimmed = base.trim();
  if (!trimmed) return [];
  
  const baseClean = trimmed.replace(/filetype:\w+/gi, '').trim();
  
  return DORK_PATTERNS.map((p, idx) => {
    const query = p.template.replace(/\{base\}/g, baseClean);
    return {
      id: generateId() + '_' + idx,
      label: p.label,
      query: query,
      url: buildGoogleUrl(query),
      rating: 0,
      validated: false,
      tags: ['pattern'],
      created_at: new Date().toISOString()
    };
  });
}

// ============================================================================
// HISTORIQUE DORKS (Max 25)
// ============================================================================

function saveDorkToHistory(dork) {
  let history = safeGetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
  
  history.unshift({
    ...dork,
    created_at: dork.created_at || new Date().toISOString(),
    last_used: new Date().toISOString()
  });
  
  history = history.slice(0, 25);
  safeSetStorage(STORAGE_KEYS.DORKS_HISTORY, history);
  return history;
}

function getDorksHistory() {
  return safeGetStorage(STORAGE_KEYS.DORKS_HISTORY, []);
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

// ============================================================================
// EXPORT
// ============================================================================

function exportDorksHistory() {
  const history = getDorksHistory();
  if (history.length === 0) {
    alert('Aucun dork à exporter');
    return;
  }
  
  const blob = new Blob([JSON.stringify(history, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dorks_history_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportValidatedDorks() {
  const history = getDorksHistory();
  const validated = history.filter(d => d.validated);
  
  if (validated.length === 0) {
    alert('Aucun dork validé');
    return;
  }
  
  const blob = new Blob([JSON.stringify(validated, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dorks_validated_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}