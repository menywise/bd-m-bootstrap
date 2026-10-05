/* =========================================================
   VIEW-APP — Cours Topographique BDB (lecture)
   Table   : cours · cours_topo_blocs · cours_zones_anatomiques
             tag_links · tags
   Session : #90 — 2026-04-18
   ========================================================= */

const DB = window.bdb;

const NIVEAU_LABELS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Expert' };
const NIVEAU_COLORS = { debutant: 'success', intermediaire: 'warning', avance: 'danger' };
const STATUS_LABELS = { draft: 'Brouillon', published: 'Publié' };
const MEMBRE_LABELS = {
  superieur : 'Membre supérieur',
  inferieur : 'Membre inférieur',
  rachis    : 'Rachis',
  tronc     : 'Tronc',
};

/* ── Utilitaires ───────────────────────────────────────── */

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeHtml(html) {
  return DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true } });
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function showState(which) {
  ['stateLoading', 'stateError', 'stateContent'].forEach(id => {
    document.getElementById(id).classList.toggle('d-none', id !== which);
  });
}

function showError(msg) {
  document.getElementById('stateErrorMsg').textContent = msg;
  showState('stateError');
}

/* ── Rendu des blocs ───────────────────────────────────── */

function renderBlocSituation(b) {
  const div = document.createElement('div');
  div.className = 'card border-0 shadow-sm topo-view-situation';
  div.innerHTML = `
    <div class="card-header bg-primary bg-opacity-10 d-flex align-items-center gap-2">
      <i class="bi bi-play-circle text-primary"></i>
      <span class="fw-semibold">Situation déclenchante</span>
      <span class="badge bg-primary ms-2 small fw-normal">Entrée Kolb</span>
    </div>
    <div class="card-body topo-view-content p-4">
      ${safeHtml(b.contenu)}
    </div>`;
  return div;
}

function renderBlocRegion(b) {
  const div = document.createElement('div');
  div.className = 'card border-0 shadow-sm topo-view-region';
  div.innerHTML = `
    <div class="card-header bg-warning bg-opacity-10 d-flex align-items-center gap-2">
      <i class="bi bi-geo-alt text-warning"></i>
      <span class="fw-semibold">${escHtml(b.titre || 'Région')}</span>
    </div>
    <div class="card-body p-3">
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <p class="small fw-semibold text-muted mb-1">
            <i class="bi bi-box me-1"></i>Cadre osseux
          </p>
          <div class="topo-view-content small">${safeHtml(b.cadre_osseux)}</div>
        </div>
        <div class="col-12 col-md-6">
          <p class="small fw-semibold text-muted mb-1">
            <i class="bi bi-layout-split me-1"></i>Parois musculaires
          </p>
          <div class="topo-view-content small">${safeHtml(b.parois)}</div>
        </div>
        <div class="col-12 col-md-6">
          <p class="small fw-semibold text-muted mb-1">
            <i class="bi bi-activity me-1"></i>Contenu vasculo-nerveux
          </p>
          <div class="topo-view-content small">${safeHtml(b.contenu_vn)}</div>
        </div>
        <div class="col-12 col-md-6">
          <div class="p-3 rounded topo-view-risque">
            <p class="small fw-semibold mb-1" style="color:#fd7e14">
              <i class="bi bi-exclamation-triangle-fill me-1" style="color:#fd7e14"></i>Structures à risque
            </p>
            <div class="topo-view-content small">${safeHtml(b.structures_risque)}</div>
          </div>
        </div>
      </div>
    </div>`;
  return div;
}

function renderBlocPoints(b) {
  const div = document.createElement('div');
  div.className = 'card border-0 shadow-sm';
  div.innerHTML = `
    <div class="card-header bg-success bg-opacity-10 d-flex align-items-center gap-2">
      <i class="bi bi-star text-success"></i>
      <span class="fw-semibold">Points clés bloc</span>
    </div>
    <div class="card-body topo-view-content p-4">${safeHtml(b.contenu)}</div>`;
  return div;
}

function renderBlocVariantes(b) {
  const div = document.createElement('div');
  div.className = 'card border-0 shadow-sm';
  div.innerHTML = `
    <div class="card-header bg-warning bg-opacity-10 d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle text-warning"></i>
      <span class="fw-semibold">Variantes &amp; exceptions</span>
    </div>
    <div class="card-body topo-view-content p-4">${safeHtml(b.contenu)}</div>`;
  return div;
}

function renderBlocLiens(b) {
  const div = document.createElement('div');
  div.className = 'card border-0 shadow-sm';
  div.innerHTML = `
    <div class="card-header bg-secondary bg-opacity-10 d-flex align-items-center gap-2">
      <i class="bi bi-link-45deg text-secondary"></i>
      <span class="fw-semibold">Liens vers autres modules BDB</span>
    </div>
    <div class="card-body topo-view-content p-4">${safeHtml(b.contenu)}</div>`;
  return div;
}

function renderBloc(b) {
  switch (b.type_bloc) {
    case 'situation_declenchante': return renderBlocSituation(b);
    case 'region':                 return renderBlocRegion(b);
    case 'points_cles_bloc':       return renderBlocPoints(b);
    case 'variantes_exceptions':   return renderBlocVariantes(b);
    case 'liens_modules':          return renderBlocLiens(b);
    default:                       return null;
  }
}

/* ── Chargement et rendu ───────────────────────────────── */

async function loadAndRender(coursId) {
  // Cours + zone
  const { data: c, error } = await DB
    .from('cours')
    .select('*, cours_zones_anatomiques(id, code, label, membre)')
    .eq('id', coursId)
    .maybeSingle();

  if (error || !c) { showError('Cours introuvable.'); return; }
  if (c.status !== 'published' && !window.bdbUser?.isAdmin) {
    showError('Ce cours n\'est pas encore publié.'); return;
  }
  if (c.type_cours !== 'topo') {
    showError('Ce cours n\'est pas un cours topographique.'); return;
  }

  // En-tête
  document.title = `${c.titre} | BDB`;
  document.getElementById('vBreadcrumb').textContent = c.titre;
  document.getElementById('vTitre').textContent = c.titre;
  if (c.description) {
    document.getElementById('vDesc').textContent = c.description;
  }

  // Badges
  const badgesEl = document.getElementById('vBadges');
  const niveau   = NIVEAU_LABELS[c.niveau] || c.niveau;
  const nColor   = NIVEAU_COLORS[c.niveau] || 'secondary';
  const zone     = c.cours_zones_anatomiques;
  const membre   = zone ? MEMBRE_LABELS[zone.membre] || zone.membre : null;

  badgesEl.innerHTML = `
    <span class="badge bg-${nColor} bg-opacity-75">${escHtml(niveau)}</span>
    ${zone ? `<span class="badge bg-warning text-dark topo-badge-zone">${escHtml(zone.label)}</span>` : ''}
    ${membre ? `<span class="badge bg-light text-muted border topo-badge-zone">${escHtml(membre)}</span>` : ''}
    ${c.status === 'draft' ? '<span class="badge bg-secondary">Brouillon</span>' : ''}
  `;

  // Tags
  const { data: tagLinks } = await DB
    .from('tag_links')
    .select('tags(label_display)')
    .eq('content_id', coursId)
    .eq('content_type', 'cours');
  (tagLinks || []).forEach(tl => {
    if (!tl.tags) return;
    const span = document.createElement('span');
    span.className = 'badge bg-light text-dark border';
    span.textContent = tl.tags.label_display;
    badgesEl.appendChild(span);
  });

  // Blocs
  const { data: blocs, error: blocsErr } = await DB
    .from('cours_topo_blocs')
    .select('*')
    .eq('cours_id', coursId)
    .order('ordre');

  if (blocsErr) { showError('Erreur chargement des blocs.'); return; }

  const vBlocs = document.getElementById('vBlocs');
  vBlocs.innerHTML = '';
  (blocs || []).forEach(b => {
    const el = renderBloc(b);
    if (el) vBlocs.appendChild(el);
  });

  if (!blocs?.length) {
    vBlocs.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-file-earmark fs-1 d-block mb-2 opacity-25"></i>
        <p>Ce cours n'a pas encore de contenu.</p>
      </div>`;
  }

  // Footer admin
  if (window.bdbUser?.isAdmin) {
    document.getElementById('vEditLink').href = `edit.html?id=${coursId}`;
    document.getElementById('vAdminFooter').classList.remove('d-none');
  }

  showState('stateContent');
}

/* ── Init ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;

  const coursId = getParam('id');
  if (!coursId) { showError('Aucun identifiant de cours fourni.'); return; }

  showState('stateLoading');
  try {
    await loadAndRender(coursId);
  } catch (err) {
    showError('Erreur : ' + err.message);
  }
});
