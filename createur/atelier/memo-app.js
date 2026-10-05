/* ================================================================
   memo-app.js — BDB Atelier / Mémo v3.1.0
   Onglet Antisèche : clipboard + impression
   Onglet Mémos : CRUD Supabase → table atelier_memo
   CDS Compliant | escHtml | 3 états | bdbShellReady
   data-login-mode="modal" : écoute CustomEvent 'bdb:auth-required'
   ================================================================ */

/* ================================================================
   CATÉGORIES — config JS (Option A — L3 créateur uniquement)
   Slug = valeur stockée en DB (categorie)
   Color = auto-injectée dans couleur + bordure carte
   ================================================================ */
const MEMO_CATS = [
  { slug: 'sql',      label: 'SQL / Migration',  icon: 'bi-database',         color: '#0d6efd' },
  { slug: 'js',       label: 'JavaScript',        icon: 'bi-braces',           color: '#f59e0b' },
  { slug: 'css',      label: 'CSS / Design',      icon: 'bi-palette',          color: '#8b5cf6' },
  { slug: 'archi',    label: 'Architecture',       icon: 'bi-diagram-3',        color: '#06b6d4' },
  { slug: 'workflow', label: 'Workflow',           icon: 'bi-arrow-repeat',     color: '#10b981' },
  { slug: 'supabase', label: 'Supabase',           icon: 'bi-cloud',            color: '#3ecf8e' },
  { slug: 'module',   label: 'Module BDB',         icon: 'bi-box',              color: '#f97316' },
  { slug: 'debug',    label: 'Debug / Erreur',     icon: 'bi-bug',              color: '#ef4444' },
  { slug: 'deploy',   label: 'Déploiement',        icon: 'bi-send',             color: '#6b7280' },
  { slug: 'prompt',   label: 'Prompt / Skill',     icon: 'bi-chat-square-dots', color: '#ec4899' },
  { slug: 'ref',      label: 'Référence',          icon: 'bi-bookmark-star',    color: '#16a34a' },
  { slug: 'decision', label: 'Décision',           icon: 'bi-check2-circle',    color: '#eab308' },
];

/* --- État CRUD --- */
const memoState = {
  items:  [],
  modal:  null,
  editId: null
};

/* --- Utilitaires DOM --- */
function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none'); }

function showFeedback(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert alert-' + type + ' mx-3 mb-3 py-2 small';
  el.textContent = msg;
  show(id);
  if (type === 'success') setTimeout(() => hide(id), 2500);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ================================================================
   CATÉGORIE DROPDOWN — construction + sélection + reset
   ================================================================ */

function _buildCatDropdown() {
  const menu = document.getElementById('memo-cat-menu');
  menu.innerHTML = MEMO_CATS.map(c =>
    '<li>' +
    '<button class="dropdown-item d-flex align-items-center gap-2 small" type="button" data-cat-item="1"' +
    ' data-slug="' + escHtml(c.slug) + '" data-color="' + escHtml(c.color) + '">' +
    '<span class="d-inline-block rounded-circle" style="width:10px;height:10px;background:' + escHtml(c.color) + ';"></span>' +
    '<i class="bi ' + escHtml(c.icon) + '" style="color:' + escHtml(c.color) + ';"></i>' +
    escHtml(c.label) +
    '</button>' +
    '</li>'
  ).join('');

  menu.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat-item]');
    if (!btn) return;
    _setCat(btn.dataset.slug);
  });
}

function _setCat(slug) {
  const cat    = MEMO_CATS.find(c => c.slug === slug);
  const swatch = document.getElementById('memo-cat-swatch');
  const label  = document.getElementById('memo-cat-btn-label');
  if (cat) {
    swatch.style.background = cat.color;
    swatch.classList.remove('border', 'border-secondary');
    label.textContent = cat.label;
    document.getElementById('memo-modal-cat').value     = cat.slug;
    document.getElementById('memo-modal-couleur').value = cat.color;
  } else {
    _resetCatDropdown();
    if (slug) {
      // Valeur legacy DB non reconnue — afficher brut, sans couleur
      label.textContent = slug;
      document.getElementById('memo-modal-cat').value = slug;
    }
  }
}

function _resetCatDropdown() {
  const swatch = document.getElementById('memo-cat-swatch');
  swatch.style.background = 'transparent';
  swatch.classList.add('border', 'border-secondary');
  document.getElementById('memo-cat-btn-label').textContent = 'Choisir une catégorie…';
  document.getElementById('memo-modal-cat').value     = '';
  document.getElementById('memo-modal-couleur').value = '';
}

/* ================================================================
   ONGLET ANTISÈCHE — clipboard + impression
   ================================================================ */

function initAntisech() {
  const toast = new bootstrap.Toast(document.getElementById('toastCopied'), { delay: 1500 });

  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.show();
    } catch (_) {
      // clipboard non disponible (file://) — silencieux
    }
  });

  document.getElementById('memo-btn-print')
    .addEventListener('click', () => window.print());
}

/* ================================================================
   ONGLET MÉMOS — CRUD atelier_memo
   ================================================================ */

async function loadMemos() {
  show('memo-epingles-loading');
  show('memo-loading-list');
  hide('memo-epingles-list');
  hide('memo-epingles-empty');
  hide('memo-list');
  hide('memo-empty');
  hide('memo-error');

  const { data, error } = await window.bdb
    .from('atelier_memo')
    .select('*')
    .order('is_epingle', { ascending: false })
    .order('updated_at',  { ascending: false });

  hide('memo-epingles-loading');
  hide('memo-loading-list');

  if (error) {
    const el = document.getElementById('memo-error');
    el.innerHTML =
      '<i class="bi bi-exclamation-triangle me-1"></i>' +
      escHtml(error.message) +
      ' <button class="btn btn-sm btn-outline-danger ms-2" id="memo-btn-retry">Réessayer</button>';
    show('memo-error');
    document.getElementById('memo-btn-retry')
      ?.addEventListener('click', loadMemos);
    return;
  }

  memoState.items = data || [];

  // Filtre catégorie — peuplé depuis MEMO_CATS (ordre canonique)
  const catFiltre = document.getElementById('memo-filtre-cat');
  const sel = catFiltre.value;
  catFiltre.innerHTML = '<option value="">Toutes catégories</option>' +
    MEMO_CATS.map(c =>
      '<option value="' + escHtml(c.slug) + '"' +
      (c.slug === sel ? ' selected' : '') + '>' +
      escHtml(c.label) + '</option>'
    ).join('');

  renderMemos();
}

function renderMemos() {
  const q   = document.getElementById('memo-search').value.toLowerCase().trim();
  const cat = document.getElementById('memo-filtre-cat').value;

  const filtered = memoState.items.filter(m =>
    (!q   || m.titre.toLowerCase().includes(q) || (m.contenu || '').toLowerCase().includes(q)) &&
    (!cat || m.categorie === cat)
  );

  const epingles = filtered.filter(m => m.is_epingle === true);
  const autres   = filtered.filter(m => m.is_epingle !== true);

  // Épinglés
  if (epingles.length) {
    document.getElementById('memo-epingles-list').innerHTML = epingles.map(cardHtml).join('');
    show('memo-epingles-list'); hide('memo-epingles-empty');
  } else {
    hide('memo-epingles-list'); show('memo-epingles-empty');
  }

  // Tous
  if (autres.length) {
    document.getElementById('memo-list').innerHTML = autres.map(cardHtml).join('');
    show('memo-list'); hide('memo-empty');
  } else if (!filtered.length) {
    hide('memo-list');
    document.getElementById('memo-empty').innerHTML =
      '<i class="bi bi-search d-block mb-2 fs-1"></i>Aucun résultat.';
    show('memo-empty');
  } else {
    hide('memo-list');
    show('memo-empty');
  }
}

function cardHtml(m) {
  const catObj   = MEMO_CATS.find(c => c.slug === m.categorie);
  const catLabel = catObj ? catObj.label : escHtml(m.categorie || '—');
  const catColor = catObj ? catObj.color : (m.couleur ?? '#6610f2');
  const couleur  = escHtml(catColor);
  const pin = m.is_epingle
    ? '<i class="bi bi-pin-fill text-warning" title="Épinglé"></i>'
    : '';
  return '<div class="card bo-card mb-2 p-3 small flex-fill" style="min-width:240px;border-left:4px solid ' + couleur + ';"' +
    ' data-id="' + escHtml(m.id) + '" role="button" tabindex="0"' +
    ' aria-label="Éditer : ' + escHtml(m.titre) + '">' +
    '<div class="small fw-semibold text-uppercase text-muted d-flex align-items-center gap-2 mb-1">' +
      '<span class="d-inline-block rounded-circle" style="width:7px;height:7px;background:' + couleur + ';"></span>' +
      escHtml(catLabel) +
    '</div>' +
    '<div class="fw-bold d-flex align-items-center justify-content-between gap-2">' + escHtml(m.titre) + pin + '</div>' +
    '<div class="small text-secondary mt-1" style="white-space:pre-wrap;word-break:break-word;max-height:5.5rem;overflow:hidden">' + escHtml(m.contenu || '') + '</div>' +
    '<div class="small text-muted mt-2"><i class="bi bi-clock me-1"></i>' + formatDate(m.updated_at) + '</div>' +
  '</div>';
}

function openNew() {
  memoState.editId = null;
  document.getElementById('memo-modal-id').value      = '';
  document.getElementById('memo-modal-titre').value   = '';
  document.getElementById('memo-modal-epingle').checked = false;
  document.getElementById('memo-modal-contenu').value  = '';
  document.getElementById('memoModalLabel').innerHTML  =
    '<i class="bi bi-plus-lg me-2"></i>Nouveau mémo';
  _resetCatDropdown();
  hide('memo-btn-delete');
  hide('memo-modal-feedback');
  memoState.modal.show();
}

function openEdit(id) {
  const m = memoState.items.find(x => x.id === id);
  if (!m) return;
  memoState.editId = m.id;
  document.getElementById('memo-modal-id').value      = m.id;
  document.getElementById('memo-modal-titre').value   = m.titre;
  document.getElementById('memo-modal-epingle').checked = m.is_epingle === true;
  document.getElementById('memo-modal-contenu').value  = m.contenu ?? '';
  document.getElementById('memoModalLabel').innerHTML  =
    '<i class="bi bi-pencil me-2"></i>Éditer mémo';
  _setCat(m.categorie);
  show('memo-btn-delete');
  hide('memo-modal-feedback');
  memoState.modal.show();
}

async function saveMemo() {
  const titre   = document.getElementById('memo-modal-titre').value.trim();
  const cat     = document.getElementById('memo-modal-cat').value.trim() || 'ref';
  const couleur = document.getElementById('memo-modal-couleur').value ||
    (MEMO_CATS.find(c => c.slug === cat)?.color ?? '#6610f2');
  const epingle = document.getElementById('memo-modal-epingle').checked;
  const contenu = document.getElementById('memo-modal-contenu').value.trim();

  if (!titre) {
    showFeedback('memo-modal-feedback', 'Un titre est nécessaire pour continuer.', 'warning');
    return;
  }

  const payload = { titre, categorie: cat, couleur, is_epingle: epingle, contenu };

  try {
    if (memoState.editId) {
      const { error } = await window.bdb
        .from('atelier_memo')
        .update(payload)
        .eq('id', memoState.editId)
        .select();
      if (error) throw error;
    } else {
      const { error } = await window.bdb
        .from('atelier_memo')
        .insert(payload)
        .select();
      if (error) throw error;
    }
    memoState.modal.hide();
    await loadMemos();
  } catch (_) {
    showFeedback('memo-modal-feedback', "La sauvegarde n'a pu aboutir — réessayez dans un instant.", 'danger');
  }
}

async function deleteMemo() {
  if (!memoState.editId) return;
  if (!confirm('Retirer ce mémo définitivement ? Cette action ne peut pas être annulée.')) return;
  try {
    const { error } = await window.bdb
      .from('atelier_memo')
      .delete()
      .eq('id', memoState.editId)
      .select();
    if (error) throw error;
    memoState.modal.hide();
    await loadMemos();
  } catch (_) {
    showFeedback('memo-modal-feedback', "La sauvegarde n'a pu aboutir — réessayez dans un instant.", 'danger');
  }
}

/* ================================================================
   POINT D'ENTRÉE
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  (async () => {
    await window.bdbShellReady;
    if (!window.bdbUser) return;

    if (!window.bdbUser.isAdmin) {
      hide('memo-loading');
      show('memo-denied');
      return;
    }

    memoState.modal = new bootstrap.Modal(document.getElementById('memoModal'));
    _buildCatDropdown();

    hide('memo-loading');
    show('memo-content');

    initAntisech();

    let memosLoaded = false;
    document.getElementById('tab-memos-btn').addEventListener('shown.bs.tab', async () => {
      if (!memosLoaded) { memosLoaded = true; await loadMemos(); }
    });

    /* --- Listeners CRUD --- */

    document.getElementById('memo-btn-new')
      .addEventListener('click', openNew);

    document.getElementById('memo-btn-new-empty')
      .addEventListener('click', openNew);

    document.getElementById('memo-btn-save')
      .addEventListener('click', saveMemo);

    document.getElementById('memo-btn-delete')
      .addEventListener('click', deleteMemo);

    document.getElementById('memo-search')
      .addEventListener('input', renderMemos);

    document.getElementById('memo-filtre-cat')
      .addEventListener('change', renderMemos);

    // Délégation clic cards
    ['memo-epingles-list', 'memo-list'].forEach(cid => {
      const container = document.getElementById(cid);
      container.addEventListener('click', e => {
        const card = e.target.closest('[data-id]');
        if (card) openEdit(card.dataset.id);
      });
      container.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-id]');
        if (card) { e.preventDefault(); openEdit(card.dataset.id); }
      });
    });

  })();
});
