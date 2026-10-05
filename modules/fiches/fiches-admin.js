/* =========================================================
   fiches-admin.js — Administration des fiches d'intervention
   Tables  : fiches_intervention, categories, content_types,
             tag_suggestions, tags
   Guard   : admin only — redirect to ../../index.html si non-admin
   ========================================================= */

/* ── escHtml (scope module — non global) ────────────────── */
const _escEl = document.createElement('span');
function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

/* ── État module ─────────────────────────────────────────── */
let _quillEditor       = null;
let _categories        = [];
let _statsLoaded       = false;
let _tagsTabLoaded     = false;
let _listenerAttached  = false;

/* ── Utility : bascule les états d'un préfixe ───────────── */
function showAdminState(prefix, state) {
  ['loading', 'empty', 'error', 'table', 'content', 'list'].forEach(s => {
    const el = document.getElementById(`${prefix}-${s}`);
    if (el) el.classList.toggle('d-none', s !== state);
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  if (!window.bdbUser?.isAdmin) {
    location.href = '../../index.html';
    return;
  }
  initFichesAdmin();
});

async function initFichesAdmin() {
  /* --- Catégories filtre ---------------------------------- */
  await loadCategories();

  /* --- Premier chargement : liste fiches ----------------- */
  await loadFichesList();

  /* --- Badge tags en attente ----------------------------- */
  await loadTagSuggestionsCount();

  /* --- Listeners filtres --------------------------------- */
  document.getElementById('filter-fiche-status')
    .addEventListener('change', () => loadFichesList());
  document.getElementById('filter-fiche-cat')
    .addEventListener('change', () => loadFichesList());

  /* --- Nouvelle fiche ------------------------------------ */
  document.getElementById('btn-fiche-new')
    .addEventListener('click', () => openFicheModal(null));

  /* --- Enregistrer fiche (modale) ----------------------- */
  document.getElementById('btn-fiche-save')
    .addEventListener('click', saveFiche);

  /* --- Export CSV --------------------------------------- */
  document.getElementById('btn-fiche-export')
    .addEventListener('click', exportFichesCSV);

  /* --- Retry liste -------------------------------------- */
  document.getElementById('btn-fiches-list-retry')
    .addEventListener('click', () => loadFichesList());

  /* --- Tab tags : chargement paresseux ------------------ */
  document.getElementById('tab-fiches-tags')
    .addEventListener('shown.bs.tab', () => {
      if (!_tagsTabLoaded) { loadTagSuggestions(); _tagsTabLoaded = true; }
    });

  /* --- Retry tags --------------------------------------- */
  document.getElementById('btn-fiches-tags-retry')
    .addEventListener('click', () => { _tagsTabLoaded = false; loadTagSuggestions(); _tagsTabLoaded = true; });

  /* --- Tab stats : chargement paresseux ----------------- */
  document.getElementById('tab-fiches-stats')
    .addEventListener('shown.bs.tab', () => {
      if (!_statsLoaded) loadFichesStats();
    });
}

/* =========================================================
   CATEGORIES
   ========================================================= */
async function loadCategories() {
  const { data: ctData } = await window.bdb
    .from('content_types').select('id').eq('code', 'fiches').single();
  if (!ctData) return;

  const { data, error } = await window.bdb
    .from('categories')
    .select('id, label, color')
    .eq('content_type_id', ctData.id)
    .order('label');

  if (error) { console.error('loadCategories:', error); return; }
  _categories = data || [];

  const filterSel = document.getElementById('filter-fiche-cat');
  const editSel   = document.getElementById('fiche-edit-category');
  _categories.forEach(c => {
    filterSel.add(new Option(escHtml(c.label), c.id));
    editSel.add(new Option(escHtml(c.label), c.id));
  });
}

/* =========================================================
   LISTE FICHES
   ========================================================= */
async function loadFichesList() {
  showAdminState('fiches-list', 'loading');

  const status  = document.getElementById('filter-fiche-status').value;
  const catId   = document.getElementById('filter-fiche-cat').value;

  try {
    let q = window.bdb
      .from('fiches_intervention')
      .select('id, titre, category_id, status, duree_estimee, created_at')
      .order('titre')
      .limit(100);

    if (status) q = q.eq('status', status);
    if (catId)  q = q.eq('category_id', catId);

    const { data, error } = await q;
    if (error) throw error;

    if (!data || data.length === 0) {
      showAdminState('fiches-list', 'empty');
      return;
    }
    renderFichesList(data);
  } catch (err) {
    console.error('loadFichesList:', err);
    document.getElementById('fiches-list-error-msg').textContent = err.message;
    showAdminState('fiches-list', 'error');
  }
}

function renderFichesList(fiches) {
  const tbody = document.getElementById('fiches-list-tbody');

  const catMap = Object.fromEntries(_categories.map(c => [c.id, c]));

  tbody.innerHTML = fiches.map(f => {
    const cat    = catMap[f.category_id];
    /* style= OK : couleur dynamique issue de DB D-2026-03-15-T04 */
    const catBadge = cat
      ? `<span class="badge rounded-pill" style="background-color:${escHtml(cat.color || '#6c757d')}">${escHtml(cat.label)}</span>`
      : '<span class="text-muted small">—</span>';

    const statusBadge = f.status === 'published'
      ? '<span class="badge bg-success">Publiée</span>'
      : '<span class="badge bg-warning text-dark">Brouillon</span>';

    const duree = f.duree_estimee ? `${escHtml(String(f.duree_estimee))} min` : '—';

    return `<tr>
      <td>${escHtml(f.titre)}</td>
      <td>${catBadge}</td>
      <td>${statusBadge}</td>
      <td class="text-end">${duree}</td>
      <td>
        <button class="btn btn-xs btn-outline-primary me-1"
                data-action="edit" data-id="${escHtml(f.id)}"
                title="Modifier"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-xs btn-outline-secondary me-1"
                data-action="toggle" data-id="${escHtml(f.id)}"
                data-status="${escHtml(f.status)}"
                title="${f.status === 'published' ? 'Dépublier' : 'Publier'}">
          <i class="bi ${f.status === 'published' ? 'bi-eye-slash' : 'bi-eye'}"></i>
        </button>
        <button class="btn btn-xs btn-outline-danger"
                data-action="delete" data-id="${escHtml(f.id)}"
                data-titre="${escHtml(f.titre)}"
                title="Supprimer"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');

  /* Délégation d'événements — une seule fois */
  if (!_listenerAttached) {
    tbody.addEventListener('click', handleFichesListClick);
    _listenerAttached = true;
  }

  showAdminState('fiches-list', 'table');
}

function handleFichesListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, status, titre } = btn.dataset;
  if (action === 'edit')   openFicheModal(id);
  if (action === 'toggle') toggleFicheStatus(id, status);
  if (action === 'delete') deleteFiche(id, titre);
}

/* =========================================================
   MODALE CREATE / EDIT
   ========================================================= */
async function openFicheModal(ficheId) {
  /* Initialisation Quill (une seule fois) */
  if (!_quillEditor) {
    _quillEditor = new Quill('#fiche-edit-quill', {
      theme: 'snow',
      modules: { toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ]},
    });
  }

  const titleEl = document.getElementById('modal-fiche-edit-title');
  const idEl    = document.getElementById('fiche-edit-id');
  const titreEl = document.getElementById('fiche-edit-titre');
  const catEl   = document.getElementById('fiche-edit-category');
  const statusEl= document.getElementById('fiche-edit-status');
  const dureeEl = document.getElementById('fiche-edit-duree');

  if (!ficheId) {
    /* Création */
    titleEl.textContent = 'Nouvelle fiche';
    idEl.value     = '';
    titreEl.value  = '';
    catEl.value    = '';
    statusEl.value = 'draft';
    dureeEl.value  = '';
    _quillEditor.root.innerHTML = '';
  } else {
    /* Édition : chargement */
    titleEl.textContent = 'Modifier la fiche';
    const { data, error } = await window.bdb
      .from('fiches_intervention')
      .select('id, titre, category_id, status, duree_estimee, description')
      .eq('id', ficheId)
      .single();

    if (error || !data) {
      console.error('openFicheModal:', error);
      bdbToast('Impossible de charger la fiche.');
      return;
    }

    idEl.value     = data.id;
    titreEl.value  = data.titre  || '';
    catEl.value    = data.category_id || '';
    statusEl.value = data.status || 'draft';
    dureeEl.value  = data.duree_estimee ?? '';
    /* DOMPurify : description Quill admin-only (exception INTERDIT-C6) */
    _quillEditor.root.innerHTML = DOMPurify.sanitize(data.description || '');
  }

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById('modal-fiche-edit')
  ).show();
}

/* =========================================================
   SAVE FICHE (create / update)
   ========================================================= */
async function saveFiche() {
  const id      = document.getElementById('fiche-edit-id').value.trim();
  const titre   = document.getElementById('fiche-edit-titre').value.trim();
  const catId   = document.getElementById('fiche-edit-category').value || null;
  const status  = document.getElementById('fiche-edit-status').value;
  const duree   = parseInt(document.getElementById('fiche-edit-duree').value, 10) || null;
  const descHtml= _quillEditor ? _quillEditor.root.innerHTML : '';

  if (!titre) {
    document.getElementById('fiche-edit-titre').focus();
    bdbToast('Le titre est obligatoire.');
    return;
  }

  const payload = {
    titre,
    category_id  : catId,
    status,
    duree_estimee    : duree,
    description  : descHtml,
  };

  try {
    let error;
    if (id) {
      ({ error } = await window.bdb
        .from('fiches_intervention')
        .update(payload)
        .eq('id', id)
        .select());
    } else {
      ({ error } = await window.bdb
        .from('fiches_intervention')
        .insert(payload)
        .select());
    }

    if (error) throw error;

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modal-fiche-edit')
    ).hide();

    bdbToast(id ? 'Fiche mise à jour.' : 'Fiche créée.');
    await loadFichesList();
    if (_statsLoaded) { _statsLoaded = false; loadFichesStats(); }
  } catch (err) {
    console.error('saveFiche:', err);
    bdbToast('Erreur : ' + err.message);
  }
}

/* =========================================================
   TOGGLE STATUS
   ========================================================= */
async function toggleFicheStatus(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    const { error } = await window.bdb
      .from('fiches_intervention')
      .update({ status: newStatus })
      .eq('id', id)
      .select();
    if (error) throw error;
    bdbToast(newStatus === 'published' ? 'Fiche publiée.' : 'Fiche repassée en brouillon.');
    await loadFichesList();
    if (_statsLoaded) { _statsLoaded = false; loadFichesStats(); }
  } catch (err) {
    console.error('toggleFicheStatus:', err);
    bdbToast('Erreur : ' + err.message);
  }
}

/* =========================================================
   DELETE FICHE
   ========================================================= */
async function deleteFiche(id, titre) {
  if (!confirm(`Supprimer définitivement la fiche "${titre}" ?`)) return;
  try {
    const { error } = await window.bdb
      .from('fiches_intervention')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    bdbToast('Fiche supprimée.');
    await loadFichesList();
    if (_statsLoaded) { _statsLoaded = false; loadFichesStats(); }
  } catch (err) {
    console.error('deleteFiche:', err);
    bdbToast('Erreur : ' + err.message);
  }
}

/* =========================================================
   TAG SUGGESTIONS — BADGE COUNT
   ========================================================= */
async function loadTagSuggestionsCount() {
  const { count, error } = await window.bdb
    .from('tag_suggestions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) { console.error('loadTagSuggestionsCount:', error); return; }

  const badge = document.getElementById('badge-tags-count');
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }
}

/* =========================================================
   TAG SUGGESTIONS — LISTE COMPLÈTE
   ========================================================= */
async function loadTagSuggestions() {
  showAdminState('fiches-tags', 'loading');

  try {
    const { data, error } = await window.bdb
      .from('tag_suggestions')
      .select('id, label, label_normalized, created_at')
      .eq('status', 'pending')
      .order('created_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      showAdminState('fiches-tags', 'empty');
      return;
    }
    renderTagSuggestions(data);
  } catch (err) {
    console.error('loadTagSuggestions:', err);
    document.getElementById('fiches-tags-error-msg').textContent = err.message;
    showAdminState('fiches-tags', 'error');
  }
}

function renderTagSuggestions(suggestions) {
  const container = document.getElementById('fiches-tags-list');

  container.innerHTML = `<div class="list-group">` +
    suggestions.map(s => {
      const dateStr = new Date(s.created_at).toLocaleDateString('fr-FR');
      return `<div class="list-group-item d-flex justify-content-between align-items-center" data-suggestion-id="${escHtml(s.id)}">
        <div>
          <span class="fw-medium">${escHtml(s.label)}</span>
          <span class="text-muted small ms-2">${escHtml(s.label_normalized || '')}</span>
          <div class="text-muted small">Proposé le ${dateStr}</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-success" data-action="approve" data-id="${escHtml(s.id)}" data-label="${escHtml(s.label)}" data-normalized="${escHtml(s.label_normalized || '')}">
            <i class="bi bi-check-lg me-1"></i>Approuver
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="reject" data-id="${escHtml(s.id)}">
            <i class="bi bi-x-lg me-1"></i>Rejeter
          </button>
        </div>
      </div>`;
    }).join('') +
  `</div>`;

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, label, normalized } = btn.dataset;
    if (action === 'approve') await approveTagSuggestion(id, label, normalized);
    if (action === 'reject')  await rejectTagSuggestion(id);
  });

  showAdminState('fiches-tags', 'list');
}

/* =========================================================
   APPROVE TAG SUGGESTION
   ========================================================= */
async function approveTagSuggestion(suggestionId, label, labelNormalized) {
  try {
    /* 1. Vérifier si le tag existe déjà (label_normalized) */
    const { data: existing } = await window.bdb
      .from('tags')
      .select('id')
      .eq('label_normalized', labelNormalized)
      .maybeSingle();

    if (!existing) {
      /* 2a. Créer le tag */
      const { error: insertErr } = await window.bdb
        .from('tags')
        .insert({
          label_display    : label,
          label_normalized : labelNormalized,
          type             : 'libre',
          locked           : false,
        })
        .select();
      if (insertErr) throw insertErr;
    }

    /* 3. Mettre à jour la suggestion */
    const { error: updateErr } = await window.bdb
      .from('tag_suggestions')
      .update({
        status     : 'approved',
        reviewed_by: window.bdbUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .select();
    if (updateErr) throw updateErr;

    bdbToast(`Tag "${label}" approuvé.`);
    _tagsTabLoaded = false;
    await loadTagSuggestions();
    _tagsTabLoaded = true;
    await loadTagSuggestionsCount();
  } catch (err) {
    console.error('approveTagSuggestion:', err);
    bdbToast('Erreur : ' + err.message);
  }
}

/* =========================================================
   REJECT TAG SUGGESTION
   ========================================================= */
async function rejectTagSuggestion(suggestionId) {
  try {
    const { error } = await window.bdb
      .from('tag_suggestions')
      .update({
        status     : 'rejected',
        reviewed_by: window.bdbUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', suggestionId)
      .select();
    if (error) throw error;

    bdbToast('Tag rejeté.');
    _tagsTabLoaded = false;
    await loadTagSuggestions();
    _tagsTabLoaded = true;
    await loadTagSuggestionsCount();
  } catch (err) {
    console.error('rejectTagSuggestion:', err);
    bdbToast('Erreur : ' + err.message);
  }
}

/* =========================================================
   STATS
   ========================================================= */
async function loadFichesStats() {
  showAdminState('fiches-stats', 'loading');

  try {
    const [
      { count: total,     error: e1 },
      { count: published, error: e2 },
      { count: draft,     error: e3 },
      { count: dev,       error: e4 },
    ] = await Promise.all([
      window.bdb.from('fiches_intervention').select('*', { count: 'exact', head: true }),
      window.bdb.from('fiches_intervention').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      window.bdb.from('fiches_intervention').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      window.bdb.from('fiches_intervention').select('*', { count: 'exact', head: true }).eq('status', 'dev'),
    ]);

    if (e1 || e2 || e3 || e4) throw e1 || e2 || e3 || e4;

    document.getElementById('kpi-total').textContent     = total     ?? '—';
    document.getElementById('kpi-published').textContent = published ?? '—';
    document.getElementById('kpi-draft').textContent     = draft     ?? '—';
    document.getElementById('kpi-dev').textContent       = dev       ?? '—';

    showAdminState('fiches-stats', 'content');
    _statsLoaded = true;
  } catch (err) {
    console.error('loadFichesStats:', err);
    document.getElementById('fiches-stats-error-msg').textContent = err.message;
    showAdminState('fiches-stats', 'error');
  }
}

/* =========================================================
   EXPORT CSV
   ========================================================= */
async function exportFichesCSV() {
  try {
    const { data, error } = await window.bdb
      .from('fiches_intervention')
      .select('id, titre, status, duree_estimee, created_at, category_id')
      .order('titre');

    if (error) throw error;

    const catMap = Object.fromEntries(_categories.map(c => [c.id, c.label]));

    const header  = ['ID', 'Titre', 'Catégorie', 'Statut', 'Durée (min)', 'Créée le'];
    const rows    = (data || []).map(f => [
      f.id,
      f.titre || '',
      catMap[f.category_id] || '',
      f.status || '',
      f.duree_estimee ?? '',
      f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : '',
    ]);

    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');

    /* BOM UTF-8 pour Excel */
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fiches-intervention-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    bdbToast('Export CSV lancé.');
  } catch (err) {
    console.error('exportFichesCSV:', err);
    bdbToast('Erreur export : ' + err.message);
  }
}
