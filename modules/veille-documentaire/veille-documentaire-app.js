/* ================================================================
   DORK BUILDER — veille-documentaire-app.js
   Actions, CRUD profil/source, événements, initialisation
   Dépend de : veille-documentaire-data.js, veille-documentaire-state.js, veille-documentaire-engine.js, veille-documentaire-render.js
   ================================================================ */

// ── Actions Mode Assisté ─────────────────────────────────────────

async function handleBuildAssisted() {
  const query = buildAssisted();
  if (!query) return;
  renderResult(query);
  await saveDork({
    user_id:    state.userId,
    profile_id: state.currentProfileId,
    label:      'Dork assisté',
    query,
    url:        buildGoogleUrl(query),
    config:     { mode: 'assisted', themes: [...state.selectedThemeIds] },
    rating:     0,
    validated:  false,
    tags:       [...state.selectedThemeIds]
  });
  showToast('Requête construite', 'ok');
}

async function handleVariantesAssisted() {
  const query = buildAssisted();
  if (!query) return;
  const patterns = generatePatternDorks(query);
  for (const p of patterns) {
    await saveDork({
      user_id:    state.userId,
      profile_id: state.currentProfileId,
      label:      p.label,
      query:      p.query,
      url:        p.url,
      rating:     0,
      validated:  false,
      tags:       p.tags
    });
  }
  showToast(patterns.length + ' variantes générées', 'ok');
}

// ── Actions Mode Expert ──────────────────────────────────────────

async function handleBuild() {
  const base = document.getElementById('baseQuery').value;
  if (!base.trim()) { showToast('Un terme de recherche est nécessaire pour continuer', 'warn'); return; }
  const query = buildCustomDork(base);
  if (!query) { showToast('La génération n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  renderResult(query);
  await saveDork({
    user_id:    state.userId,
    profile_id: state.currentProfileId,
    label:      'Dork personnalisé',
    query,
    url:        buildGoogleUrl(query),
    config:     { base, operators: [...state.selectedOperatorIds], fileTypes: [...state.selectedFiletypeIds], sources: [...state.selectedSourceIds], keywords: [...state.selectedKeywords] },
    rating:     0,
    validated:  false,
    tags:       [...state.selectedKeywords]
  });
  showToast('Requête construite', 'ok');
}

async function handlePatterns() {
  const base = document.getElementById('baseQuery').value;
  if (!base.trim()) { showToast('Un terme de recherche est nécessaire pour continuer', 'warn'); return; }
  let searchBase = base.trim();
  if (state.selectedKeywords.length > 0) {
    const terms  = [searchBase, ...state.selectedKeywords];
    const unique = [...new Set(terms)];
    if (unique.length > 1) searchBase = '(' + unique.map(t => '"' + t + '"').join(' OR ') + ')';
  }
  const patterns = generatePatternDorks(searchBase);
  for (const p of patterns) {
    await saveDork({ user_id: state.userId, profile_id: state.currentProfileId, label: p.label, query: p.query, url: p.url, rating: 0, validated: false, tags: p.tags });
  }
  showToast(patterns.length + ' requêtes générées', 'ok');
}

// ── Persistance dork ─────────────────────────────────────────────

async function saveDork(dork) {
  const { data, error } = await DB.from('dork_history').insert(dork).select().single();
  if (error) { showToast('La sauvegarde n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.history.unshift(data);
  if (state.history.length > MAX_HISTORY) {
    const toDelete = state.history.splice(MAX_HISTORY);
    for (const d of toDelete) {
      await DB.from('dork_history').delete().eq('id', d.id).select(); // UX06 : caller confirms
    }
  }
  renderHistory();
}

async function removeDork(id) {
  if (!confirm('Retirer définitivement ce dork ?')) return;
  const { error } = await DB.from('dork_history').delete().eq('id', id).select();
  if (error) { showToast('La suppression n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.history = state.history.filter(d => d.id !== id);
  renderHistory();
  showToast('Dork retiré', 'info');
}

// ── Validation & annotation ──────────────────────────────────────

function showAnnotationPrompt(id) {
  const card = document.querySelector('.dk-card[data-dork-id="' + id + '"]');
  if (!card) return;
  const body     = card.querySelector('.dk-card-body');
  const existing = body.querySelector('.dk-annotation-wrap');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.className = 'dk-annotation-wrap';
  wrap.innerHTML =
    '<textarea class="dk-annotation-area" rows="2" placeholder="Pourquoi ce dork est-il utile ? (requis)"></textarea>' +
    '<button class="dk-annotation-confirm"><i class="bi bi-check2 me-1"></i>Valider ce dork</button>';
  body.appendChild(wrap);

  wrap.querySelector('.dk-annotation-confirm').addEventListener('click', async () => {
    const notes = wrap.querySelector('.dk-annotation-area').value.trim();
    if (!notes) { showToast('Une note est nécessaire pour continuer', 'warn'); return; }
    await confirmDorkValidation(id, notes);
  });
  wrap.querySelector('.dk-annotation-area').focus();
}

async function confirmDorkValidation(id, notes) {
  const { error } = await DB.from('dork_history')
    .update({ validated: true, notes }).eq('id', id).select();
  if (error) { showToast('La validation n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  const d = state.history.find(h => h.id === id);
  if (d) { d.validated = true; d.notes = notes; }
  renderHistory();
  showToast('Dork ajouté à la bibliothèque', 'ok');
}

async function toggleDorkValidation(id) {
  const d = state.history.find(h => h.id === id);
  if (!d) return;
  if (!d.validated) { showAnnotationPrompt(id); return; }
  const { error } = await DB.from('dork_history')
    .update({ validated: false }).eq('id', id).select();
  if (error) { showToast('La dévalidation n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  d.validated = false;
  renderHistory();
}

async function setDorkRating(id, rating) {
  const clamped = Math.max(0, Math.min(5, rating));
  const { error } = await DB.from('dork_history')
    .update({ rating: clamped }).eq('id', id).select();
  if (error) return;
  const d = state.history.find(h => h.id === id);
  if (d) d.rating = clamped;
  renderHistory();
}

// ── Label éditable inline ────────────────────────────────────────

async function saveLabelUser(id, label) {
  const { error } = await DB.from('dork_history')
    .update({ label_user: label }).eq('id', id).select();
  if (error) { showToast('Le label n\'a pu être sauvegardé — réessayez dans un instant', 'err'); return; }
  const d = state.history.find(h => h.id === id);
  if (d) d.label_user = label;
  renderHistory();
}

function activateLabelEdit(labelEl, id) {
  if (labelEl.querySelector('input')) return;
  const d = state.history.find(h => h.id === id);
  const input = document.createElement('input');
  input.type        = 'text';
  input.className   = 'dk-label-input';
  input.value       = d ? (d.label_user || '') : '';
  input.placeholder = 'Nommer ce dork…';
  labelEl.innerHTML = '';
  labelEl.appendChild(input);
  input.focus();
  input.select();
  const commit = async () => { await saveLabelUser(id, input.value.trim()); };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { renderHistory(); }
  });
}

async function clearHistory() {
  if (!confirm('Effacer tout l\'historique ? Cette opération est définitive.')) return;
  const { error } = await DB.from('dork_history').delete().eq('user_id', state.userId).select();
  if (error) { showToast('La suppression n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.history = [];
  renderHistory();
  renderResult(null);
  showToast('Historique vidé', 'info');
}

// ── Profil CRUD ──────────────────────────────────────────────────

async function selectProfile(id) {
  state.currentProfileId = id;
  state.selectedKeywords  = [];
  state.selectedSourceIds.clear();
  state.selectedOperatorIds.clear();
  state.selectedFiletypeIds.clear();
  state.beforeDate  = ''; state.afterDate = ''; state.aroundTermB = ''; state.aroundN = 3;
  await loadSourcesForProfile(id);
  renderProfileCard(); renderProfileDropdown(); renderSources(); renderKeywords(); renderOperators(); renderFiletypes();
  toggleDropdown(false);
}

function openProfileModal(profileId) {
  ['profileId','profileLabel','profileIcon','profileDescription','profileKeywordsInput','profileExclusions'].forEach(id =>
    document.getElementById(id).value = ''
  );
  if (profileId) {
    const p = state.profiles.find(pr => pr.id === profileId);
    if (p) {
      document.getElementById('profileId').value             = profileId;
      document.getElementById('profileLabel').value          = p.label        || '';
      document.getElementById('profileIcon').value           = p.icon         || '📁';
      document.getElementById('profileDescription').value    = p.description  || '';
      document.getElementById('profileKeywordsInput').value  = (p.keywords    || []).join('\n');
      document.getElementById('profileExclusions').value     = (p.exclusions  || []).join('\n');
    }
  }
  new bootstrap.Modal(document.getElementById('modalProfile')).show();
}

async function saveProfile() {
  const id    = document.getElementById('profileId').value;
  const label = document.getElementById('profileLabel').value.trim();
  if (!label) { showToast('Un label est nécessaire pour continuer', 'warn'); return; }
  const payload = {
    label,
    icon:        document.getElementById('profileIcon').value.trim() || '📁',
    description: document.getElementById('profileDescription').value.trim(),
    keywords:    document.getElementById('profileKeywordsInput').value.split('\n').map(k => k.trim()).filter(Boolean),
    exclusions:  document.getElementById('profileExclusions').value.split('\n').map(e => e.trim()).filter(Boolean),
    updated_at:  new Date().toISOString()
  };
  if (id) {
    const { error } = await DB.from('dork_profiles').update(payload).eq('id', id).select();
    if (error) { showToast('La mise à jour n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
    const idx = state.profiles.findIndex(p => p.id === id);
    if (idx !== -1) Object.assign(state.profiles[idx], payload);
    showToast('Profil mis à jour', 'ok');
  } else {
    payload.user_id  = state.userId;
    payload.position = state.profiles.length;
    const { data, error } = await DB.from('dork_profiles').insert(payload).select().single();
    if (error) { showToast('La création n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
    state.profiles.push(data);
    state.currentProfileId = data.id;
    await loadSourcesForProfile(data.id);
    showToast('Profil créé', 'ok');
  }
  bootstrap.Modal.getInstance(document.getElementById('modalProfile')).hide();
  renderProfileCard(); renderProfileDropdown(); renderKeywords();
}

async function deleteProfile(id) {
  if (state.profiles.length <= 1) { showToast('Ce profil est le dernier — il ne peut pas être retiré', 'warn'); return; }
  if (!confirm('Retirer définitivement ce profil ?')) return;
  const { error } = await DB.from('dork_profiles').delete().eq('id', id).select();
  if (error) { showToast('La suppression n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.profiles = state.profiles.filter(p => p.id !== id);
  if (state.currentProfileId === id) {
    state.currentProfileId = state.profiles[0]?.id || null;
    await loadSourcesForProfile(state.currentProfileId);
  }
  renderProfileCard(); renderProfileDropdown(); renderSources(); renderKeywords();
  showToast('Profil retiré', 'info');
}

function exportProfile(id) {
  const p = state.profiles.find(pr => pr.id === id);
  if (!p) return;
  const blob = new Blob([JSON.stringify({ ...p, sources: state.sources.filter(s => s.profile_id === id) }, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'dork_profile_' + p.label.replace(/\s+/g, '_') + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProfileFromFile(file) {
  if (!file) return;
  let data;
  try { data = JSON.parse(await file.text()); } catch (_) { showToast('Ce fichier ne semble pas être un JSON valide', 'err'); return; }
  if (!data.label) { showToast('Le format de ce profil n\'est pas reconnu', 'err'); return; }
  const payload = {
    user_id: state.userId, label: data.label + ' (importé)', icon: data.icon || '📁',
    description: data.description || '', keywords: data.keywords || [],
    exclusions: data.exclusions || [], position: state.profiles.length
  };
  const { data: prof, error } = await DB.from('dork_profiles').insert(payload).select().single();
  if (error) { showToast('L\'import n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.profiles.push(prof);
  if (Array.isArray(data.sources)) {
    for (const src of data.sources) {
      await DB.from('dork_sources').insert({ profile_id: prof.id, label: src.label || '', domains: src.domains || [], weight: src.weight || 2, category: src.category || 'other', position: 0 }).select();
    }
  }
  state.currentProfileId = prof.id;
  await loadSourcesForProfile(prof.id);
  renderAll();
  showToast('Profil importé : ' + prof.label, 'ok');
}

// ── Source CRUD ──────────────────────────────────────────────────

function openSourceModal(sourceId) {
  document.getElementById('sourceId').value = sourceId || '';
  ['sourceLabel','sourceDomains'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sourceCategory').value = 'other';
  document.getElementById('sourceWeight').value   = '2';
  if (sourceId) {
    const src = state.sources.find(s => s.id === sourceId);
    if (src) {
      document.getElementById('sourceLabel').value    = src.label;
      document.getElementById('sourceDomains').value  = (src.domains || []).join('\n');
      document.getElementById('sourceCategory').value = src.category;
      document.getElementById('sourceWeight').value   = src.weight;
    }
  }
  new bootstrap.Modal(document.getElementById('modalSource')).show();
}

async function saveSource() {
  const id    = document.getElementById('sourceId').value;
  const label = document.getElementById('sourceLabel').value.trim();
  if (!label) { showToast('Un label est nécessaire pour continuer', 'warn'); return; }
  const domains = document.getElementById('sourceDomains').value
    .split('\n').map(d => d.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')).filter(Boolean);
  if (domains.length === 0) { showToast('Au moins un domaine est nécessaire pour continuer', 'warn'); return; }
  const bad = domains.find(d => !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d));
  if (bad) { showToast('Ce domaine ne semble pas valide : ' + bad, 'err'); return; }
  const payload = {
    label, domains,
    category:   document.getElementById('sourceCategory').value,
    weight:     parseInt(document.getElementById('sourceWeight').value) || 2,
    updated_at: new Date().toISOString()
  };
  if (id) {
    const { error } = await DB.from('dork_sources').update(payload).eq('id', id).select();
    if (error) { showToast('La mise à jour n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
    const idx = state.sources.findIndex(s => s.id === id);
    if (idx !== -1) Object.assign(state.sources[idx], payload);
    showToast('Source mise à jour', 'ok');
  } else {
    payload.profile_id = state.currentProfileId;
    payload.position   = state.sources.length;
    const { data, error } = await DB.from('dork_sources').insert(payload).select().single();
    if (error) { showToast('La création n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
    state.sources.push(data);
    showToast('Source créée', 'ok');
  }
  bootstrap.Modal.getInstance(document.getElementById('modalSource')).hide();
  renderSources();
}

async function deleteSource(id) {
  if (!confirm('Retirer définitivement cette source ?')) return;
  const { error } = await DB.from('dork_sources').delete().eq('id', id).select();
  if (error) { showToast('La suppression n\'a pu aboutir — réessayez dans un instant', 'err'); return; }
  state.sources = state.sources.filter(s => s.id !== id);
  state.selectedSourceIds.delete(id);
  renderSources();
  showToast('Source retirée', 'info');
}

// ── Export & copy ────────────────────────────────────────────────

function exportHistory() {
  if (state.history.length === 0) { showToast('L\'historique est vide', 'warn'); return; }
  downloadJson(state.history, 'dorks_history');
}
function exportValidated() {
  const validated = state.history.filter(d => d.validated === true);
  if (validated.length === 0) { showToast('Aucun dork validé dans la bibliothèque', 'warn'); return; }
  downloadJson(validated, 'dorks_validated');
}
function downloadJson(data, prefix) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = prefix + '_' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Requête copiée', 'ok');
  } catch (_) {
    showToast('La copie n\'a pu aboutir — réessayez dans un instant', 'err');
  }
}

// ── Dropdown profil ──────────────────────────────────────────────

function toggleDropdown(forceState) {
  const card   = document.getElementById('dkProfileCard');
  const dd     = document.getElementById('dkDropdown');
  const isOpen = forceState !== undefined ? forceState : !dd.classList.contains('open');
  dd.classList.toggle('open', isOpen);
  card.classList.toggle('open', isOpen);
  card.setAttribute('aria-expanded', isOpen);
}

// ── Événements ───────────────────────────────────────────────────

function attachEvents() {
  // Profil dropdown
  document.getElementById('dkProfileCard').addEventListener('click', () => toggleDropdown());
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#dkProfileCard') && !e.target.closest('#dkDropdown')) toggleDropdown(false);
  });
  document.getElementById('dkDropdown').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit-profile"]');
    const expBtn  = e.target.closest('[data-action="export-profile"]');
    const delBtn  = e.target.closest('[data-action="del-profile"]');
    const newBtn  = e.target.closest('[data-action="new-profile"]');
    const row     = e.target.closest('[data-action="select-profile"]');
    if (editBtn) { e.stopPropagation(); openProfileModal(editBtn.dataset.id); return; }
    if (expBtn)  { e.stopPropagation(); exportProfile(expBtn.dataset.id);     return; }
    if (delBtn)  { e.stopPropagation(); deleteProfile(delBtn.dataset.id);     return; }
    if (newBtn)  { openProfileModal(); return; }
    if (row && !editBtn && !expBtn && !delBtn) { selectProfile(row.dataset.id); }
  });

  // Sources
  document.getElementById('dkSources').addEventListener('click', (e) => {
    const delX   = e.target.closest('[data-action="del-source"]');
    if (delX) { e.stopPropagation(); deleteSource(delX.dataset.id); return; }
    const toggle = e.target.closest('[data-action="toggle-source"]');
    if (toggle) {
      const id = toggle.dataset.id;
      if (state.selectedSourceIds.has(id)) state.selectedSourceIds.delete(id);
      else state.selectedSourceIds.add(id);
      renderSources(); return;
    }
    const add = e.target.closest('[data-action="new-source"]');
    if (add) openSourceModal();
  });

  // Keywords
  document.getElementById('dkKeywords').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-action="toggle-kw"]');
    if (!chip) return;
    const kw  = chip.dataset.kw;
    const idx = state.selectedKeywords.indexOf(kw);
    if (idx !== -1) { state.selectedKeywords.splice(idx, 1); }
    else if (state.selectedKeywords.length < MAX_KEYWORDS) { state.selectedKeywords.push(kw); }
    else { showToast('Maximum ' + MAX_KEYWORDS + ' mots-clés sélectionnables', 'warn'); return; }
    renderKeywords();
  });

  // Operators & filetypes
  document.getElementById('dkOps').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-op"]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (state.selectedOperatorIds.has(id)) state.selectedOperatorIds.delete(id);
    else state.selectedOperatorIds.add(id);
    renderOperators();
  });
  document.getElementById('dkFts').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-ft"]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (state.selectedFiletypeIds.has(id)) state.selectedFiletypeIds.delete(id);
    else state.selectedFiletypeIds.add(id);
    renderFiletypes();
  });

  // Mode toggle
  document.getElementById('btnModeAssisted').addEventListener('click', () => setUiMode('assisted'));
  document.getElementById('btnModeExpert').addEventListener('click',   () => setUiMode('expert'));

  // Recettes rapides
  document.getElementById('dkRecipes').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="apply-recipe"]');
    if (btn) applyRecipe(parseInt(btn.dataset.idx));
  });

  // Thèmes BDB
  document.getElementById('dkThemes').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-action="toggle-theme"]');
    if (!chip) return;
    const id = chip.dataset.id;
    if (state.selectedThemeIds.has(id)) state.selectedThemeIds.delete(id);
    else state.selectedThemeIds.add(id);
    renderThemes();
  });

  // Mode Assisté — boutons
  document.getElementById('btnBuildAssisted').addEventListener('click', handleBuildAssisted);
  document.getElementById('btnVariantesAssisted').addEventListener('click', handleVariantesAssisted);
  document.getElementById('btnClearAssisted').addEventListener('click', () => {
    clearAssistedForm(); renderResult(null); showToast('Formulaire vidé', 'info');
  });
  ['asAllWords','asExact','asAnyWords','asNone','asSite'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleBuildAssisted(); });
  });

  // Mode Expert — boutons
  document.getElementById('btnBuild').addEventListener('click', handleBuild);
  document.getElementById('btnPatterns').addEventListener('click', handlePatterns);
  document.getElementById('baseQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleBuild(); });

  // Zone extras opérateurs avancés
  const extrasZone = document.createElement('div');
  extrasZone.id        = 'dkOpExtras';
  extrasZone.className = 'dk-op-extras d-none';
  document.querySelector('.dk-controls').insertAdjacentElement('afterend', extrasZone);

  // Copy result
  document.getElementById('btnCopy').addEventListener('click', () => {
    const q = document.getElementById('dkResultText').textContent;
    if (q) copyToClipboard(q);
  });

  // Historique — délégation
  document.getElementById('dorksHistory').addEventListener('click', (e) => {
    const copyQ = e.target.closest('[data-action="copy-query"]');
    if (copyQ) { copyToClipboard(copyQ.dataset.query); return; }
    const val  = e.target.closest('[data-action="toggle-val"]');
    if (val)   { toggleDorkValidation(val.dataset.id); return; }
    const rem  = e.target.closest('[data-action="rem-dork"]');
    if (rem)   { removeDork(rem.dataset.id); return; }
    const star = e.target.closest('[data-action="set-rating"]');
    if (star)  { setDorkRating(star.dataset.id, parseInt(star.dataset.star)); }
  });
  document.getElementById('dorksHistory').addEventListener('dblclick', (e) => {
    const labelEl = e.target.closest('[data-action="edit-label"]');
    if (labelEl) activateLabelEdit(labelEl, labelEl.dataset.id);
  });

  // Historique — toolbar
  document.getElementById('btnClearHistory').addEventListener('click', clearHistory);
  document.getElementById('btnExportHistory').addEventListener('click', exportHistory);
  document.getElementById('btnExportValidated').addEventListener('click', exportValidated);

  // Import profil
  document.getElementById('importProfileFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) { importProfileFromFile(e.target.files[0]); e.target.value = ''; }
  });

  // Modals
  document.getElementById('btnSaveProfile').addEventListener('click', saveProfile);
  document.getElementById('btnSaveSource').addEventListener('click', saveSource);

  // Filtres bibliothèque — injectés dynamiquement
  const histBar    = document.querySelector('.dk-history-bar');
  const filterWrap = document.createElement('div');
  filterWrap.className = 'd-flex gap-1';
  filterWrap.innerHTML =
    '<button class="dk-clear-btn dk-filter-active" id="btnFilterAll">Tout</button>' +
    '<button class="dk-clear-btn" id="btnFilterLib"><i class="bi bi-bookmark-check me-1"></i>Bibliothèque</button>';
  histBar.insertBefore(filterWrap, histBar.querySelector('.d-flex.align-items-center'));
  document.getElementById('btnFilterAll').addEventListener('click', () => {
    state.libraryMode = false;
    document.getElementById('btnFilterAll').classList.add('dk-filter-active');
    document.getElementById('btnFilterLib').classList.remove('dk-filter-active');
    renderHistory();
  });
  document.getElementById('btnFilterLib').addEventListener('click', () => {
    state.libraryMode = true;
    document.getElementById('btnFilterAll').classList.remove('dk-filter-active');
    document.getElementById('btnFilterLib').classList.add('dk-filter-active');
    renderHistory();
  });
}

// ── Point d'entrée ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();

  try {
    await loadReferentiels();
  } catch (_) {
    document.getElementById('loadingState').classList.add('d-none');
    showError('Les référentiels n\'ont pu être chargés — réessayez dans un instant');
    return;
  }

  try {
    await loadProfiles();
    await loadSourcesForProfile(state.currentProfileId);
    await loadHistory();
  } catch (_) {
    document.getElementById('loadingState').classList.add('d-none');
    showError('Les données n\'ont pu être chargées — réessayez dans un instant');
    return;
  }

  showState('dorkApp');
  renderAll();
  setUiMode('assisted');
  attachEvents();
});
