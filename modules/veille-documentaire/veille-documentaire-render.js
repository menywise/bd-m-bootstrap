/* ================================================================
   DORK BUILDER — veille-documentaire-render.js
   Renderers DOM — sidebar, workspace, historique, mode assisté
   Dépend de : veille-documentaire-data.js, veille-documentaire-state.js
   ================================================================ */

// ── Profil ───────────────────────────────────────────────────────

function renderProfileCard() {
  const p = state.profiles.find(pr => pr.id === state.currentProfileId);
  if (!p) return;
  document.getElementById('dkEmoji').textContent = p.icon || '📁';
  document.getElementById('dkName').textContent  = p.label;
  document.getElementById('dkHint').textContent  = p.description || '';
}

function renderProfileDropdown() {
  const el  = document.getElementById('dkDropdown');
  let html  = state.profiles.map(p => {
    const isCurrent = p.id === state.currentProfileId;
    return `
      <div class="dk-profile-row ${isCurrent ? 'current' : ''}" data-action="select-profile" data-id="${escHtml(p.id)}">
        <span class="dk-prow-emoji">${escHtml(p.icon || '📁')}</span>
        <span class="dk-prow-label">${escHtml(p.label)}</span>
        <div class="dk-prow-acts">
          <button class="dk-prow-btn" data-action="edit-profile"   data-id="${escHtml(p.id)}" title="Modifier"><i class="bi bi-pencil"></i></button>
          <button class="dk-prow-btn" data-action="export-profile" data-id="${escHtml(p.id)}" title="Exporter"><i class="bi bi-download"></i></button>
          <button class="dk-prow-btn danger" data-action="del-profile" data-id="${escHtml(p.id)}" title="Supprimer"><i class="bi bi-trash"></i></button>
        </div>
      </div>`;
  }).join('');
  html += `<div class="dk-new-profile-btn" data-action="new-profile"><i class="bi bi-plus-circle"></i> Nouveau profil</div>`;
  el.innerHTML = html;
}

// ── Sidebar ──────────────────────────────────────────────────────

function renderSources() {
  const el = document.getElementById('dkSources');
  if (state.sources.length === 0) {
    el.innerHTML = '<span class="dk-kw-chip dk-no-data">Aucune source</span>';
    return;
  }
  let html = state.sources.map(src => {
    const cat = SOURCE_CATEGORIES[src.category] || SOURCE_CATEGORIES.other;
    const on  = state.selectedSourceIds.has(src.id) ? ' on' : '';
    return `<span class="${escHtml(cat.css)} dk-src-chip${on}" data-action="toggle-source" data-id="${escHtml(src.id)}"
      title="${escHtml((src.domains || []).join(', '))}">${escHtml(src.label)}<i class="bi bi-x dk-src-x" data-action="del-source" data-id="${escHtml(src.id)}"></i></span>`;
  }).join('');
  html += `<span class="dk-src-chip dk-src-add" data-action="new-source"><i class="bi bi-plus"></i></span>`;
  el.innerHTML = html;
}

function renderKeywords() {
  const el      = document.getElementById('dkKeywords');
  const counter = document.getElementById('dkKwCount');
  const p       = state.profiles.find(pr => pr.id === state.currentProfileId);
  const kws     = p?.keywords || [];

  if (kws.length === 0) {
    el.innerHTML      = '<span class="dk-kw-chip dk-no-data">Aucun mot-clé</span>';
    counter.textContent = '0/3';
    counter.classList.remove('full');
    return;
  }

  const atMax  = state.selectedKeywords.length >= MAX_KEYWORDS;
  el.innerHTML = kws.map(kw => {
    const isOn = state.selectedKeywords.includes(kw);
    const isDim = atMax && !isOn;
    let cls = 'dk-kw-chip';
    if (isOn)  cls += ' on';
    if (isDim) cls += ' dim';
    return `<span class="${cls}" data-action="toggle-kw" data-kw="${escHtml(kw)}">${escHtml(kw)}</span>`;
  }).join('');

  counter.textContent = state.selectedKeywords.length + '/' + MAX_KEYWORDS;
  counter.classList.toggle('full', atMax);
}

function renderQuickRecipes() {
  const el = document.getElementById('dkRecipes');
  if (!el) return;
  el.innerHTML = QUICK_RECIPES.map((r, i) => `
    <button class="dk-recipe-btn" data-action="apply-recipe" data-idx="${i}" title="${escHtml(r.hint)}">
      <span class="dk-recipe-icon">${escHtml(r.icon)}</span>
      <span class="dk-recipe-label">${escHtml(r.label)}</span>
      <span class="dk-recipe-hint">${escHtml(r.hint)}</span>
    </button>`
  ).join('');
}

// ── Mode Expert — opérateurs & filetypes ─────────────────────────

function renderOperators() {
  const el = document.getElementById('dkOps');
  if (!el) return;
  el.innerHTML = state.operators.map(op => {
    const on = state.selectedOperatorIds.has(op.id) ? ' on' : '';
    return `<span class="dk-op-btn${on}" data-action="toggle-op" data-id="${escHtml(op.id)}"
      title="${escHtml(op.description)}"><i class="bi ${escHtml(op.icon)} me-1"></i>${escHtml(op.label)}</span>`;
  }).join('');
  renderOpExtras();
}

function renderOpExtras() {
  const zone = document.getElementById('dkOpExtras');
  if (!zone) return;

  const selectedLabels = [...state.selectedOperatorIds].map(id => {
    const op = state.operators.find(o => o.id === id);
    return op ? op.label : null;
  }).filter(Boolean);

  const needsBefore = selectedLabels.includes('before');
  const needsAfter  = selectedLabels.includes('after');
  const needsAround = selectedLabels.includes('AROUND');
  const hasExtras   = needsBefore || needsAfter || needsAround;

  zone.classList.toggle('d-none', !hasExtras);
  if (!hasExtras) { zone.innerHTML = ''; return; }

  let html = '';
  if (needsBefore) html += `
    <div class="dk-op-extra-field">
      <i class="bi bi-calendar-minus"></i>
      <label class="dk-op-extra-label">Avant</label>
      <input type="date" id="dkBeforeDate" class="form-control form-control-sm dk-op-extra-date"
             value="${escHtml(state.beforeDate)}">
    </div>`;
  if (needsAfter) html += `
    <div class="dk-op-extra-field">
      <i class="bi bi-calendar-plus"></i>
      <label class="dk-op-extra-label">Après</label>
      <input type="date" id="dkAfterDate" class="form-control form-control-sm dk-op-extra-date"
             value="${escHtml(state.afterDate)}">
    </div>`;
  if (needsAround) html += `
    <div class="dk-op-extra-field">
      <i class="bi bi-arrows-collapse"></i>
      <label class="dk-op-extra-label">AROUND</label>
      <input type="number" id="dkAroundN" class="form-control form-control-sm dk-op-extra-n"
             value="${state.aroundN}" min="1" max="10">
      <span class="dk-op-extra-sep">mots de</span>
      <input type="text" id="dkAroundB" class="form-control form-control-sm dk-op-extra-term"
             value="${escHtml(state.aroundTermB)}" placeholder="second terme">
    </div>`;
  zone.innerHTML = html;

  if (needsBefore)  document.getElementById('dkBeforeDate').addEventListener('input', e => { state.beforeDate  = e.target.value; });
  if (needsAfter)   document.getElementById('dkAfterDate').addEventListener('input',  e => { state.afterDate   = e.target.value; });
  if (needsAround) {
    document.getElementById('dkAroundN').addEventListener('input', e => { state.aroundN     = parseInt(e.target.value) || 3; });
    document.getElementById('dkAroundB').addEventListener('input', e => { state.aroundTermB = e.target.value.trim(); });
  }
}

function renderFiletypes() {
  const el = document.getElementById('dkFts');
  if (!el) return;
  el.innerHTML = state.filetypes.map(ft => {
    const on     = state.selectedFiletypeIds.has(ft.id) ? ' on' : '';
    const extCls = 'dk-ft-' + ft.extension.toLowerCase();
    return `<span class="dk-ft-btn ${extCls}${on}" data-action="toggle-ft" data-id="${escHtml(ft.id)}">${escHtml(ft.label)}</span>`;
  }).join('');
}

// ── Mode Assisté — thèmes ────────────────────────────────────────

function renderThemes() {
  const el = document.getElementById('dkThemes');
  if (!el) return;
  el.innerHTML = BDB_THEMES.map(t => {
    const on = state.selectedThemeIds.has(t.id) ? ' on' : '';
    return `<span class="dk-theme-chip${on}" data-action="toggle-theme" data-id="${escHtml(t.id)}"
      title="${escHtml(t.dork)}">${escHtml(t.icon)} ${escHtml(t.label)}</span>`;
  }).join('');
}

// ── Zone résultat ────────────────────────────────────────────────

function renderResult(query) {
  const textEl = document.getElementById('dkResultText');
  const btnsEl = document.getElementById('dkResultBtns');
  if (!query) {
    textEl.textContent = 'Saisissez une requête puis cliquez sur Générer';
    textEl.classList.add('empty');
    btnsEl.classList.add('hidden');
    return;
  }
  textEl.textContent = query;
  textEl.classList.remove('empty');
  textEl.classList.add('flash');
  setTimeout(() => textEl.classList.remove('flash'), 400);
  btnsEl.classList.remove('hidden');
  document.getElementById('btnOpenDork').href = buildGoogleUrl(query);
}

// ── Historique ───────────────────────────────────────────────────

function renderHistory() {
  const container = document.getElementById('dorksHistory');
  const counter   = document.getElementById('dorksCount');
  counter.textContent = state.history.length + '/' + MAX_HISTORY;

  const displayed = state.libraryMode
    ? [...state.history].filter(d => d.validated === true).sort((a, b) => (b.rating || 0) - (a.rating || 0))
    : state.history;

  if (displayed.length === 0) {
    container.innerHTML = `
      <div class="dk-empty-state">
        <i class="bi bi-search"></i>
        <p>${state.libraryMode
          ? 'Votre bibliothèque est vide — validez un dork pour le retrouver ici.'
          : 'Aucune requête enregistrée.<br>Saisissez un terme pour commencer.'}</p>
      </div>`;
    return;
  }

  container.innerHTML = displayed.map(d => {
    const prof          = state.profiles.find(p => p.id === d.profile_id);
    const profLabel     = prof ? prof.label : 'Profil retiré';
    const profIcon      = prof ? (prof.icon || '📁') : '📁';
    const validatedCls  = d.validated ? ' validated' : '';
    const validatedTag  = d.validated
      ? `<span class="dk-validated-tag"><i class="bi bi-check-circle-fill"></i>Validé</span>`
      : '';
    const validatedBtnCls = d.validated ? ' validated-state' : '';

    const labelUserHtml = d.validated
      ? `<div class="dk-label-user" data-action="edit-label" data-id="${escHtml(d.id)}" title="Double-clic pour nommer">${
          d.label_user
            ? escHtml(d.label_user)
            : '<span class="dk-label-ph">Nommer ce dork…</span>'
        }</div>`
      : '';

    const notesHtml = d.validated && d.notes
      ? `<div class="dk-card-notes"><i class="bi bi-chat-text me-1"></i>${escHtml(d.notes)}</div>`
      : '';

    return `
      <div class="dk-card${validatedCls}" data-dork-id="${escHtml(d.id)}">
        <div class="dk-card-inner">
          <div class="dk-card-strip"></div>
          <div class="dk-card-body">
            <div class="dk-card-query" data-action="copy-query" data-query="${escHtml(d.query)}" title="Cliquer pour copier">${escHtml(d.query)}</div>
            <div class="dk-card-meta">
              <span class="dk-card-date">${escHtml(fmtDate(d.created_at))}</span>
              <span class="dk-prof-tag">${escHtml(profIcon)} ${escHtml(profLabel)}</span>
              ${validatedTag}
              <div class="dk-stars">${renderStars(d.rating || 0, d.id)}</div>
            </div>
            ${labelUserHtml}
            ${notesHtml}
          </div>
          <div class="dk-card-actions">
            <a class="dk-act-btn open" href="${escHtml(d.url)}" target="_blank" rel="noopener noreferrer" title="Ouvrir dans Google"><i class="bi bi-box-arrow-up-right"></i></a>
            <button class="dk-act-btn validate${validatedBtnCls}" data-action="toggle-val" data-id="${escHtml(d.id)}" title="${d.validated ? 'Dévalider' : 'Valider'}"><i class="bi bi-check-lg"></i></button>
            <button class="dk-act-btn del" data-action="rem-dork" data-id="${escHtml(d.id)}" title="Retirer"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderStars(rating, dorkId) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const lit  = i <= rating ? ' lit' : '';
    const icon = i <= rating ? 'bi-star-fill' : 'bi-star';
    html += `<i class="bi ${icon}${lit}" data-action="set-rating" data-id="${escHtml(dorkId)}" data-star="${i}" title="${i} étoile${i > 1 ? 's' : ''}"></i>`;
  }
  return html;
}

// ── renderAll ────────────────────────────────────────────────────

function renderAll() {
  renderProfileCard();
  renderProfileDropdown();
  renderSources();
  renderKeywords();
  renderOperators();
  renderFiletypes();
  renderHistory();
  renderThemes();
  renderQuickRecipes();
}
