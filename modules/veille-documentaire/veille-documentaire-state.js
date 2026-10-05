/* ================================================================
   DORK BUILDER — veille-documentaire-state.js
   State applicatif partagé + utilitaires DOM
   Dépend de : veille-documentaire-data.js
   ================================================================ */

const state = {
  isAdmin:            false,
  userId:             null,
  profiles:           [],
  currentProfileId:   null,
  sources:            [],
  operators:          [],
  filetypes:          [],
  history:            [],
  selectedKeywords:   [],
  selectedOperatorIds: new Set(),
  selectedFiletypeIds: new Set(),
  selectedSourceIds:   new Set(),
  selectedThemeIds:    new Set(),
  libraryMode: false,
  uiMode:      'assisted',  // 'assisted' | 'expert'
  // Paramètres opérateurs avancés (mode Expert)
  beforeDate:  '',
  afterDate:   '',
  aroundTermB: '',
  aroundN:     3
};

// ── XSS — fallback si bdb-ui.js non chargé ───────────────────────

if (typeof escHtml !== 'function') {
  window.escHtml = function escHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
}

// ── Utils ────────────────────────────────────────────────────────

function buildGoogleUrl(query) {
  return 'https://www.google.com/search?q=' + encodeURIComponent(query);
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR') + ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

// ── UI Helpers ───────────────────────────────────────────────────

function showState(id) {
  ['loadingState', 'emptyState', 'errorState', 'dorkApp'].forEach(s => {
    document.getElementById(s).classList.toggle('d-none', s !== id);
  });
}

function showError(msg) {
  const el = document.getElementById('errorState');
  el.classList.remove('d-none');
  el.innerHTML = `
    <div class="text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-danger d-block mb-2"></i>
      <p class="text-muted">${escHtml(msg)}</p>
      <button class="btn btn-outline-primary btn-sm" id="btnRetry">
        <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
      </button>
    </div>`;
  // UX32 : reload justifié — bouton récupération erreur fatale
  document.getElementById('btnRetry').addEventListener('click', () => location.reload());
}

function showToast(msg, type = 'info') {
  const icons = {
    ok:   'bi-check-circle-fill',
    warn: 'bi-exclamation-triangle-fill',
    err:  'bi-x-circle-fill',
    info: 'bi-info-circle-fill'
  };
  const container = document.getElementById('dkToasts');
  const el = document.createElement('div');
  el.className = 'dk-toast ' + type;
  el.innerHTML = `<i class="bi ${escHtml(icons[type] || icons.info)}"></i><span>${escHtml(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); }, 2500);
}
