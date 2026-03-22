/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT: Consensus Design System
   FILE: app.js v1.0.0
   CONTEXT: CDS Framework - DORK_DASHBOARD
   STACK: HTML5 / CSS3 / JS Vanilla
   LEAD: Claude (Mode B)
   LAST UPDATE: 2026-01-13
   DISC: D (Manu)
   UX: Compatible D/I/S/C
   DEPENDENCIES: data.js, engine.js
   RAU: 1-8 actifs (6 non applicable)
   ═══════════════════════════════════════════════════════════════════════════ */

let currentProfileId = null;
let currentModalEditId = null;
let selectedKeywords = [];

// ============================================================================
// INIT
// ============================================================================

function init() {
  console.log('Init Dork Dashboard v2.0-CDS...');
  
  initDefaults();
  currentProfileId = safeGetStorage(STORAGE_KEYS.CURRENT_PROFILE, 'ibode');
  selectedKeywords = [];
  
  renderProfiles();
  renderOperators();
  renderFiletypes();
  renderSourcesForCurrentProfile();
  renderDorksHistory();
  renderProfileKeywords();
  
  attachEvents();
  console.log('Init terminée.');
}

// ============================================================================
// RENDER PROFILS
// ============================================================================

function renderProfiles() {
  const container = document.getElementById('profilesList');
  if (!container) return;
  
  const profiles = listProfiles();
  
  if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
    container.innerHTML = '<p class="text-muted small">Aucun profil</p>';
    return;
  }
  
  container.innerHTML = profiles.map(p => `
    <div class="profile-card ${p.id === currentProfileId ? 'active' : ''}" 
         onclick="selectProfile('${p.id}')">
      <div class="profile-icon">${escapeHtml(p.icon)}</div>
      <div class="profile-info">
        <div class="profile-label">${escapeHtml(p.label)}</div>
        <small class="text-muted">${(p.sources_fiables || []).length} sources</small>
      </div>
	  <div class="profile-actions" onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-link" onclick="openProfileModal('${p.id}')" title="Modifier">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-link" onclick="duplicateProfileUI('${p.id}')" title="Dupliquer">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn btn-sm btn-link" onclick="exportProfile('${p.id}')" title="Exporter">
          <i class="fas fa-download"></i>
        </button>
        <button class="btn btn-sm btn-link text-danger" onclick="deleteProfileUI('${p.id}')" title="Supprimer">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function selectProfile(profileId) {
  currentProfileId = profileId;
  safeSetStorage(STORAGE_KEYS.CURRENT_PROFILE, profileId);
  selectedKeywords = [];
  renderProfiles();
  renderSourcesForCurrentProfile();
  renderProfileKeywords();
}

function deleteProfileUI(profileId) {
  if (!confirm('Supprimer profil ?')) return;
  if (deleteProfile(profileId)) {
    renderProfiles();
    currentProfileId = safeGetStorage(STORAGE_KEYS.CURRENT_PROFILE);
    renderSourcesForCurrentProfile();
  }
}

function duplicateProfileUI(profileId) {
  const dup = duplicateProfile(profileId);
  if (dup) {
    renderProfiles();
    alert('Profil dupliqué: ' + dup.label);
  }
}

// ============================================================================
// RENDER OPERATEURS
// ============================================================================

function renderOperators() {
  const container = document.getElementById('operatorsList');
  if (!container) return;
  
  const ops = listOperators(true);
  
  container.innerHTML = ops.map(op => `
    <label class="checkbox-item">
      <input type="checkbox" 
             data-operator-id="${op.id}" 
             class="operator-checkbox form-check-input">
      <span class="checkbox-content">
        <i class="fas ${op.icon} me-1"></i>
        <strong>${escapeHtml(op.label)}</strong>
        <small class="text-muted d-block">${escapeHtml(op.description)}</small>
      </span>
    </label>
  `).join('');
}

// ============================================================================
// RENDER FILETYPES
// ============================================================================

function renderFiletypes() {
  const container = document.getElementById('filetypesList');
  if (!container) return;
  
  const fts = listFiletypes(true);
  
  container.innerHTML = fts.map(ft => `
    <label class="filetype-badge ${ft.color}">
      <input type="checkbox" 
             data-filetype-id="${ft.id}" 
             class="filetype-checkbox">
      <span>${escapeHtml(ft.label)}</span>
    </label>
  `).join('');
}

// ============================================================================
// RENDER SOURCES (Profil actif)
// ============================================================================

function renderSourcesForCurrentProfile() {
  const container = document.getElementById('sourcesList');
  if (!container) return;
  
  const profile = getProfile(currentProfileId);
  if (!profile) {
    container.innerHTML = '<p class="text-muted small">Profil introuvable</p>';
    return;
  }
  
  migrateDefaultSourcesToProfile(currentProfileId);
  
  const sources = profile.sources || [];
  
  if (sources.length === 0) {
    container.innerHTML = '<p class="text-muted small">Aucune source</p>';
    return;
  }
  
  container.innerHTML = sources.map(src => {
    const cat = getCategoryInfo(src.category);
    return `
      <label class="checkbox-item">
        <input type="checkbox" 
               data-source-id="${src.id}" 
               class="source-checkbox form-check-input">
        <span class="checkbox-content">
          <i class="fas ${cat.icon} me-1 text-${cat.color}"></i>
          <strong>${escapeHtml(src.label)}</strong>
          <small class="text-muted d-block">${src.domains.join(', ')}</small>
          <span class="badge bg-${cat.color} bg-opacity-10 text-${cat.color}">
            ${cat.label}
          </span>
        </span>
        <div class="ms-2" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-link p-0" onclick="openSourceModal('${src.id}')" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-link p-0 text-danger" onclick="deleteSourceUI('${src.id}')" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </label>
    `;
  }).join('');
}

// ============================================================================
// RENDER MOTS-CLÉS PROFIL
// ============================================================================

function renderProfileKeywords() {
  const container = document.getElementById('profileKeywords');
  const counter = document.getElementById('keywordCounter');
  
  if (!container) return;
  
  const profile = getProfile(currentProfileId);
  if (!profile || !profile.keywords || profile.keywords.length === 0) {
    container.innerHTML = '<small class="text-muted">Aucun mot-clé</small>';
    if (counter) {
      counter.textContent = '0/3';
      counter.className = 'keyword-counter';
    }
    return;
  }
  
  const maxKeywords = 3;
  const atMax = selectedKeywords.length >= maxKeywords;
  
  container.innerHTML = profile.keywords.map(kw => {
    const isSelected = selectedKeywords.includes(kw);
    const isDisabled = atMax && !isSelected;
    const classes = ['keyword-badge'];
    if (isSelected) classes.push('selected');
    if (isDisabled) classes.push('disabled');
    
    return `
      <span class="${classes.join(' ')}" 
            onclick="toggleKeyword('${escapeHtml(kw)}', ${isDisabled})"
            title="${isDisabled ? 'Maximum 3 keywords' : 'Cliquer pour activer/désactiver'}">
        ${escapeHtml(kw)}
      </span>
    `;
  }).join(' ');
  
  if (counter) {
    counter.textContent = `${selectedKeywords.length}/3`;
    counter.className = atMax ? 'keyword-counter max' : 'keyword-counter';
  }
}

function toggleKeyword(keyword, isDisabled) {
  if (isDisabled) {
    showToast('Maximum 3 keywords', 'warning');
    return;
  }
  
  const idx = selectedKeywords.indexOf(keyword);
  
  if (idx === -1) {
    if (selectedKeywords.length >= 3) {
      showToast('Maximum 3 keywords', 'warning');
      return;
    }
    selectedKeywords.push(keyword);
    showToast(`"${keyword}" activé`, 'success');
  } else {
    selectedKeywords.splice(idx, 1);
    showToast(`"${keyword}" désactivé`, 'info');
  }
  
  renderProfileKeywords();
}

function clearSelectedKeywords() {
  selectedKeywords = [];
  renderProfileKeywords();
}
// ============================================================================
// BUILD DORK
// ============================================================================

function handleBuildDork() {
  const base = document.getElementById('baseQuery')?.value || '';
  
  if (!base.trim()) {
    alert('Saisir recherche base');
    return;
  }
  
  const selectedOps = Array.from(
    document.querySelectorAll('.operator-checkbox:checked')
  ).map(cb => cb.dataset.operatorId);
  
  const selectedFts = Array.from(
    document.querySelectorAll('.filetype-checkbox:checked')
  ).map(cb => cb.dataset.filetypeId);
  
  const profile = getProfile(currentProfileId);
  const selectedSourceObjs = Array.from(
    document.querySelectorAll('.source-checkbox:checked')
  ).map(cb => {
    const srcId = cb.dataset.sourceId;
    return profile && profile.sources 
      ? profile.sources.find(s => s.id === srcId) 
      : null;
  }).filter(s => s);
  
  const query = buildCustomDork({
    base,
    operators: selectedOps,
    fileTypes: selectedFts,
    sources: selectedSourceObjs,
    profileId: currentProfileId,
    keywords: selectedKeywords
  });
  
  if (!query) {
    alert('Impossible construire dork');
    return;
  }
  
  const dork = {
    id: generateId(),
    label: "Dork personnalisé",
    query,
    url: buildGoogleUrl(query),
    profile_id: currentProfileId,
    config: {
      base,
      operators: selectedOps,
      fileTypes: selectedFts,
      sources: selectedSourceObjs.map(s => s.label),
      keywords: [...selectedKeywords]
    },
    rating: 0,
    validated: false,
    tags: [...selectedOps, ...selectedFts, ...selectedKeywords]
  };
  
  saveDorkToHistory(dork);
  renderDorksHistory();
  showToast('Dork généré', 'success');
}

// ============================================================================
// GENERATE PATTERNS
// ============================================================================

function handleGeneratePatterns() {
  const base = document.getElementById('baseQuery')?.value || '';
  
  if (!base.trim()) {
    alert('Saisir recherche base');
    return;
  }
  
  let searchBase = base.trim();
  
  if (selectedKeywords.length > 0) {
    const terms = [searchBase, ...selectedKeywords];
    const uniqueTerms = [...new Set(terms)];
    if (uniqueTerms.length > 1) {
      searchBase = `(${uniqueTerms.map(t => `"${t}"`).join(' OR ')})`;
    }
  }
  
  const patterns = generatePatterns(searchBase);
  
  patterns.forEach(dork => {
    dork.profile_id = currentProfileId;
    if (selectedKeywords.length > 0) {
      dork.tags = [...(dork.tags || []), ...selectedKeywords];
    }
    saveDorkToHistory(dork);
  });
  
  renderDorksHistory();
  showToast(`${patterns.length} dorks générés`, 'success');
}

// ============================================================================
// RENDER HISTORIQUE
// ============================================================================

function renderDorksHistory() {
  const container = document.getElementById('dorksHistory');
  const counter = document.getElementById('dorksCount');
  
  if (!container) return;
  
  const history = getDorksHistory();
  
  if (counter) counter.textContent = `${history.length}/25`;
  
  if (history.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="fas fa-search fa-2x mb-2 opacity-50"></i>
        <p class="small">Aucun dork</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = history.map(dork => {
    const prof = getProfile(dork.profile_id);
    const profLabel = prof ? prof.label : 'Profil inconnu';
    const profIcon = prof ? prof.icon : '📁';
    
    return `
      <div class="dork-card ${dork.validated ? 'validated' : ''}" data-dork-id="${dork.id}">
        <div class="dork-header">
          <div>
            <strong>${escapeHtml(dork.label)}</strong>
            ${dork.validated ? '<span class="badge bg-success ms-1">Validé</span>' : ''}
          </div>
          <small class="text-muted">${profIcon} ${escapeHtml(profLabel)}</small>
        </div>
        
        <div class="dork-query">${escapeHtml(dork.query)}</div>
        
        <div class="dork-tags">
          ${(dork.tags || []).map(tag => `
            <span class="badge bg-light text-dark">${escapeHtml(tag)}</span>
          `).join('')}
        </div>
        
        <div class="dork-rating">
          ${renderStars(dork.rating, dork.id)}
        </div>
        
        <div class="dork-meta">
          <small class="text-muted">${formatDate(dork.created_at)}</small>
        </div>
        
        <div class="dork-actions">
          <a href="${dork.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
            <i class="fas fa-external-link-alt"></i> Ouvrir
          </a>
          <button class="btn btn-sm ${dork.validated ? 'btn-success' : 'btn-outline-success'}" 
                  onclick="toggleDorkValidationUI('${dork.id}')">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeDorkUI('${dork.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderStars(rating, dorkId) {
  let html = '<div class="rating-stars">';
  for (let i = 1; i <= 5; i++) {
    const active = i <= rating ? 'active' : '';
    const icon = i <= rating ? 'fas fa-star' : 'far fa-star';
    html += `<i class="${icon} ${active}" onclick="setDorkRatingUI('${dorkId}', ${i})"></i>`;
  }
  html += '</div>';
  return html;
}

function setDorkRatingUI(id, rating) {
  setDorkRating(id, rating);
  renderDorksHistory();
}

function toggleDorkValidationUI(id) {
  toggleDorkValidation(id);
  renderDorksHistory();
}

function removeDorkUI(id) {
  if (!confirm('Supprimer dork ?')) return;
  removeDorkFromHistory(id);
  renderDorksHistory();
}

function clearHistoryUI() {
  if (clearDorksHistory()) {
    renderDorksHistory();
    showToast('Historique effacé', 'info');
  }
}

// ============================================================================
// MODALS
// ============================================================================

function openProfileModal(profileId = null) {
  const modal = document.getElementById('modalProfile');
  if (!modal) return;
  
  currentModalEditId = profileId;
  
  document.getElementById('profileId').value = profileId || '';
  document.getElementById('profileLabel').value = '';
  document.getElementById('profileIcon').value = '';
  document.getElementById('profileDescription').value = '';
  document.getElementById('profileKeywords').value = '';
  document.getElementById('profileExclusions').value = '';
  
  const srcSelect = document.getElementById('profileSources');
  const allSrcs = listSources();
  srcSelect.innerHTML = allSrcs.map(s => `
    <option value="${s.id}">${escapeHtml(s.label)}</option>
  `).join('');
  
  if (profileId) {
    const p = getProfile(profileId);
    if (p) {
      document.getElementById('profileLabel').value = p.label || '';
      document.getElementById('profileIcon').value = p.icon || '📁';
      document.getElementById('profileDescription').value = p.description || '';
      document.getElementById('profileKeywords').value = (p.keywords || []).join('\n');
      document.getElementById('profileExclusions').value = (p.exclusions || []).join('\n');
      
      const sources = p.sources_fiables || p.sources || [];
      Array.from(srcSelect.options).forEach(opt => {
        opt.selected = sources.includes(opt.value);
      });
    }
  }
  
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function saveProfileModal() {
  const id = document.getElementById('profileId').value;
  const label = document.getElementById('profileLabel').value.trim();
  
  if (!label) {
    alert('Label obligatoire');
    return;
  }
  
  const data = {
    label,
    icon: document.getElementById('profileIcon').value.trim() || '📁',
    description: document.getElementById('profileDescription').value.trim(),
    keywords: document.getElementById('profileKeywords').value
      .split('\n')
      .map(k => k.trim())
      .filter(k => k),
    exclusions: document.getElementById('profileExclusions').value
      .split('\n')
      .map(e => e.trim())
      .filter(e => e),
    sources_fiables: Array.from(document.getElementById('profileSources').selectedOptions)
      .map(opt => opt.value)
  };
  
  if (id) {
    updateProfile(id, data);
    showToast('Profil MAJ', 'success');
  } else {
    const newProf = createProfile(data);
    currentProfileId = newProf.id;
    safeSetStorage(STORAGE_KEYS.CURRENT_PROFILE, newProf.id);
    showToast('Profil créé', 'success');
  }
  
  renderProfiles();
  renderSourcesForCurrentProfile();
  bootstrap.Modal.getInstance(document.getElementById('modalProfile')).hide();
}

function openSourceModal(sourceId = null) {
  const modal = document.getElementById('modalSource');
  if (!modal) return;
  
  document.getElementById('sourceId').value = sourceId || '';
  document.getElementById('sourceProfileId').value = currentProfileId;
  document.getElementById('sourceLabel').value = '';
  document.getElementById('sourceDomains').value = '';
  document.getElementById('sourceCategory').value = 'other';
  document.getElementById('sourceWeight').value = '2';
  
  if (sourceId) {
    const src = getSourceFromProfile(currentProfileId, sourceId);
    if (src) {
      document.getElementById('sourceLabel').value = src.label;
      document.getElementById('sourceDomains').value = src.domains.join('\n');
      document.getElementById('sourceCategory').value = src.category;
      document.getElementById('sourceWeight').value = src.weight;
    }
  }
  
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function saveSourceModal() {
  const sourceId = document.getElementById('sourceId').value;
  const profileId = document.getElementById('sourceProfileId').value;
  const label = document.getElementById('sourceLabel').value.trim();
  
  if (!label) {
    alert('Label obligatoire');
    return;
  }
  
  const domainsRaw = document.getElementById('sourceDomains').value;
  const domains = domainsRaw
    .split('\n')
    .map(d => d.trim())
    .filter(d => d)
    .map(d => d.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  
  if (domains.length === 0) {
    alert('Au moins 1 domaine requis');
    return;
  }
  
  const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
  const invalid = domains.find(d => !domainRegex.test(d));
  if (invalid) {
    alert(`Domaine invalide: ${invalid}`);
    return;
  }
  
  const data = {
    label,
    domains,
    category: document.getElementById('sourceCategory').value,
    weight: parseInt(document.getElementById('sourceWeight').value) || 2
  };
  
  if (sourceId) {
    updateSourceInProfile(profileId, sourceId, data);
    showToast('Source MAJ', 'success');
  } else {
    createSourceInProfile(profileId, data);
    showToast('Source créée', 'success');
  }
  
  renderSourcesForCurrentProfile();
  bootstrap.Modal.getInstance(document.getElementById('modalSource')).hide();
}

function deleteSourceUI(sourceId) {
  if (!confirm('Supprimer source ?')) return;
  if (deleteSourceFromProfile(currentProfileId, sourceId)) {
    renderSourcesForCurrentProfile();
    showToast('Source supprimée', 'info');
  }
}

function addCustomCategory() {
  const cat = prompt('Nouvelle catégorie:');
  if (!cat || !cat.trim()) return;
  
  const select = document.getElementById('sourceCategory');
  const opt = document.createElement('option');
  opt.value = cat.trim().toLowerCase().replace(/\s+/g, '_');
  opt.textContent = cat.trim();
  select.appendChild(opt);
  select.value = opt.value;
}
// ============================================================================
// EVENTS
// ============================================================================

function attachEvents() {
  const el = (id) => document.getElementById(id);
  
  el('btnBuildDork')?.addEventListener('click', handleBuildDork);
  el('btnGeneratePatterns')?.addEventListener('click', handleGeneratePatterns);
  el('btnClearHistory')?.addEventListener('click', clearHistoryUI);
  el('btnNewProfile')?.addEventListener('click', () => openProfileModal());
  el('btnSaveProfile')?.addEventListener('click', saveProfileModal);
  el('btnNewSource')?.addEventListener('click', () => openSourceModal());
  el('btnSaveSource')?.addEventListener('click', saveSourceModal);

  
  const importInput = el('importProfileFile');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importProfile(e.target.files[0]);
        e.target.value = '';
      }
    });
  }
}

// ============================================================================
// TOAST
// ============================================================================

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(msg)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  }
}

// ============================================================================
// INIT ON LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (typeof init === 'function') init();
});