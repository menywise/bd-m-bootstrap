/* =========================================================
   MODULE COURS — BDB v2.0.0
   Table  : cours · categories · content_images · tag_links · tags
   Bucket : content-images (sous-dossier cours/)
   Shell  : bdb-shell.js v1.4.0 — window.bdbUser source unique
   ========================================================= */

const DB     = window.bdb;
const BUCKET = 'content-images';

const NIVEAU_LABELS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
const NIVEAU_COLORS = { debutant: '#198754', intermediaire: '#fd7e14', avance: '#dc3545' };
const STATUS_LABELS = { draft: 'Brouillon', published: 'Publié', archived: 'Archivé' };

const state = {
  isAdmin: false,
  items: [], categories: [], allTags: [],
  editingId: null, formTagIds: [], formImages: [],
  contentTypeId: null,
};

let quill, modalCours, modalCoursView, modalLightbox;

/* ─── SÉCURITÉ — escHtml (INTERDIT-C6) ───────────────────── */
function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ─── TOAST ──────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  document.getElementById('toastMsg').textContent = msg;
  const iconMap = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className  = 'bi me-2 ' + (iconMap[type] || iconMap.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Info';
  bootstrap.Toast.getOrCreateInstance(document.getElementById('toastInfo')).show();
}

/* ─── CONTENT TYPE + CATEGORIES
     B-08 corrigé : 2 requêtes content_types fusionnées en 1 ── */
async function loadContentTypeAndCategories() {
  const { data: ct, error: ctErr } = await DB.from('content_types').select('id').eq('code', 'cours').maybeSingle();
  if (ctErr) throw ctErr;
  if (!ct) return;
  state.contentTypeId = ct.id;
  const { data, error } = await DB.from('categories').select('id, label, color').eq('content_type_id', ct.id).order('label');
  if (error) throw error;
  state.categories = data || [];
  [document.getElementById('cCategory'), document.getElementById('cFormCategory')].forEach(sel => {
    if (!sel) return;
    const first = sel.options[0];
    sel.innerHTML = ''; sel.add(first);
    state.categories.forEach(c => sel.add(new Option(c.label, c.id)));
  });
}

/* ─── TAGS ───────────────────────────────────────────────── */
async function loadTags() {
  const { data, error } = await DB.from('tags').select('id, label_display, type').order('label_display');
  if (error) throw error;
  state.allTags = (data || []).filter(t => ['fonction','acronyme','libre'].includes(t.type));
}

async function loadTagsForRecord(id) {
  const { data } = await DB.from('tag_links')
    .select('tag_id, tags(id, label_display, type)')
    .eq('content_id', id).eq('content_type', 'cours');
  return (data || []).map(r => r.tags).filter(Boolean);
}

async function syncTags(recordId) {
  await DB.from('tag_links').delete().eq('content_id', recordId).eq('content_type', 'cours');
  if (state.formTagIds.length > 0) {
    await DB.from('tag_links').insert(
      state.formTagIds.map(tagId => ({ content_id: recordId, content_type: 'cours', tag_id: tagId }))
    );
  }
}

function renderTagSelector() {
  const search   = document.getElementById('cTagSearch').value.toLowerCase();
  const filtered = state.allTags
    .filter(t => !state.formTagIds.includes(t.id) && (!search || t.label_display.toLowerCase().includes(search)))
    .slice(0, 10);

  /* V3 corrigé : style="font-size:0.6rem" → class="cds-text-micro" (INTERDIT-C2) */
  document.getElementById('cTagResults').innerHTML = filtered.map(t =>
    `<button type="button" class="btn btn-sm btn-outline-secondary" data-tag-id="${t.id}">${escHtml(t.label_display)} <span class="badge bg-light text-muted cds-text-micro">${escHtml(t.type)}</span></button>`
  ).join('');

  document.querySelectorAll('#cTagResults [data-tag-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.formTagIds.length >= 5) { showToast('Max 5 tags', 'error'); return; }
      state.formTagIds.push(btn.dataset.tagId);
      document.getElementById('cTagSearch').value = '';
      renderTagSelector();
    });
  });

  const selected = state.allTags.filter(t => state.formTagIds.includes(t.id));
  const el = document.getElementById('cSelectedTags');
  /* V3 corrigé : style="font-size:0.6rem" → class="cds-text-micro" (INTERDIT-C2) */
  el.innerHTML = !selected.length
    ? '<span class="text-muted small">Aucun tag</span>'
    : selected.map(t => `<span class="badge bg-warning text-dark d-flex align-items-center gap-1">${escHtml(t.label_display)}
        <button type="button" class="btn-close p-0 cds-text-micro" data-remove="${t.id}"></button>
      </span>`).join('');

  el.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.formTagIds = state.formTagIds.filter(id => id !== btn.dataset.remove);
      renderTagSelector();
    });
  });
}

/* ─── IMAGES ─────────────────────────────────────────────── */
function renderImagePreviews() {
  const container = document.getElementById('cImagePreviews');
  if (!state.formImages.length) { container.innerHTML = ''; return; }
  /* V3 corrigé :
     style="width:90px;height:70px;object-fit:cover" → class="cds-thumbnail-lg rounded"
     style="width:20px;height:20px;font-size:0.65rem" → class="cds-img-remove-btn"
     (INTERDIT-C2) */
  container.innerHTML = state.formImages.map((img, i) =>
    `<div class="position-relative">
      <img src="${img.url || img._local}" alt="" class="cds-thumbnail-lg rounded border"/>
      <button type="button" class="btn btn-danger cds-img-remove-btn position-absolute top-0 end-0 p-0" data-idx="${i}">×</button>
    </div>`
  ).join('');
  container.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.formImages.splice(Number(btn.dataset.idx), 1);
      renderImagePreviews();
    });
  });
}

async function handleImageFiles(files) {
  const remaining = 3 - state.formImages.length;
  if (remaining <= 0) { showToast('Max 3 images', 'error'); return; }
  for (const file of Array.from(files).slice(0, remaining)) {
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} trop lourd`, 'error'); continue; }
    state.formImages.push({ storage_path: '', position: state.formImages.length, _file: file, _local: URL.createObjectURL(file) });
  }
  renderImagePreviews();
}

async function uploadPendingImages(recordId) {
  for (let i = 0; i < state.formImages.length; i++) {
    const img = state.formImages[i];
    if (!img._file) continue;
    const ext  = img._file.name.split('.').pop();
    const path = `cours/${recordId}/${Date.now()}_${i}.${ext}`;
    const { error } = await DB.storage.from(BUCKET).upload(path, img._file, { upsert: true });
    if (error) { showToast('Erreur upload : ' + error.message, 'error'); continue; }
    img.storage_path = path; delete img._file; delete img._local;
  }
}

async function syncImages(recordId) {
  if (!state.contentTypeId) return;
  await uploadPendingImages(recordId);
  /* Stratégie : delete all + re-insert all pour ce record.
     Élimine les conflits position (409 Conflict) et gère le réordonnancement. */
  await DB.from('content_images').delete()
    .eq('content_type_id', state.contentTypeId).eq('content_id', recordId);
  const toInsert = state.formImages.filter(i => i.storage_path);
  /* position 1-based — CHECK constraint content_images_position_check */
  if (toInsert.length) await DB.from('content_images').insert(
    toInsert.map((img, idx) => ({ content_type_id: state.contentTypeId, content_id: recordId, storage_path: img.storage_path, position: idx + 1 }))
  );
}

async function getSignedUrls(paths) {
  if (!paths.length) return {};
  const { data } = await DB.storage.from(BUCKET).createSignedUrls(paths, 900);
  const map = {};
  (data || []).forEach(r => { if (r.signedUrl) map[r.path] = r.signedUrl; });
  return map;
}

/* ─── SKELETON GRID (V6 — remplace spinner-border dans loadItems) ── */
function renderGridSkeleton() {
  return Array.from({ length: 6 }).map(() => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="placeholder-glow card-body">
          <div class="d-flex gap-2 mb-2">
            <span class="placeholder rounded" style="width:38px;height:38px;flex-shrink:0"></span><!-- style= OK : valeur fixe skeleton D-2026-03-15-T04 -->
            <div class="flex-grow-1">
              <span class="placeholder col-8 rounded d-block mb-1"></span>
              <span class="placeholder col-5 rounded d-block"></span>
            </div>
          </div>
          <span class="placeholder col-12 rounded d-block mb-1"></span>
          <span class="placeholder col-9 rounded d-block"></span>
        </div>
      </div>
    </div>`).join('');
}

/* ─── LOAD ───────────────────────────────────────────────── */
async function loadItems() {
  const grid = document.getElementById('coursGrid');
  /* V6 corrigé : spinner → skeleton */
  grid.innerHTML = renderGridSkeleton();

  let q = DB.from('cours')
    .select('*, category:categories(id, label, color)')
    .order('created_at', { ascending: false })
    .limit(100);

  const search = document.getElementById('cSearch').value.trim();
  const niveau = document.getElementById('cNiveau').value;
  const status = document.getElementById('cStatus').value;
  const cat    = document.getElementById('cCategory').value;

  if (search) q = q.or(`titre.ilike.%${search}%,description.ilike.%${search}%`);
  if (niveau) q = q.eq('niveau', niveau);
  if (status) q = q.eq('status', status);
  if (cat)    q = q.eq('category_id', cat);

  const { data, error } = await q;

  if (error) {
    /* B-07 corrigé : cdsShowGridError + offline banner */
    cdsShowGridError(grid, 'Impossible de charger les cours.', loadItems);
    if (error.message?.includes('fetch') || error.code === 'PGRST301') {
      document.getElementById('offlineBanner').classList.add('show');
    }
    return;
  }

  state.items = data || [];

  if (!state.items.length) {
    grid.innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center py-5 text-muted">
      <i class="bi bi-mortarboard fs-1 d-block mb-3"></i><p class="mb-0">Aucun cours trouvé</p>
      ${state.isAdmin ? `<button class="btn btn-outline-warning mt-3" id="btnNewEmpty"><i class="bi bi-plus-lg me-1"></i>Créer un cours</button>` : ''}
    </div></div></div>`;
    document.getElementById('btnNewEmpty')?.addEventListener('click', () => openCoursModal());
    return;
  }

  grid.innerHTML = state.items.map(c => renderCard(c)).join('');
  grid.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => {
      if (state.isAdmin) openCoursModal(el.dataset.open);
      else openCoursView(el.dataset.open);
    });
  });
  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openCoursModal(btn.dataset.edit); });
  });
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteItem(btn.dataset.del); });
  });
}

function renderCard(c) {
  const niveauColor = NIVEAU_COLORS[c.niveau] || '#6c757d'; /* couleur dynamique JS D-2026-03-15-T04 */
  const niveauLabel = NIVEAU_LABELS[c.niveau] || c.niveau;
  const statusBadge = c.status === 'published'
    ? '<span class="badge bg-success">Publié</span>'
    : '<span class="badge bg-secondary">Brouillon</span>';
  /* style= OK : couleur dynamique Supabase D-2026-03-15-T04 */
  const catBadge = c.category
    ? `<span class="badge" style="background:${c.category.color}20;color:${c.category.color};border:1px solid ${c.category.color}">${escHtml(c.category.label)}</span>`
    : '';
  const tags = Array.isArray(c.tags) && c.tags.length
    ? c.tags.slice(0,3).map(t => `<span class="badge bg-light text-dark border">#${escHtml(t)}</span>`).join('')
    : '';
  const menu = state.isAdmin ? `
    <div class="dropdown">
      <button class="btn btn-sm cours-card-menu" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><button class="dropdown-item" data-edit="${c.id}"><i class="bi bi-pencil me-2"></i>Modifier</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" data-del="${c.id}"><i class="bi bi-trash me-2"></i>Supprimer</button></li>
      </ul>
    </div>` : '';

  /* V3 corrigé : style="cursor:pointer" → class="cds-clickable" (INTERDIT-C2) */
  return `<div class="col-12 col-md-6 col-lg-4">
    <div class="card border-0 shadow-sm cours-card h-100 cds-clickable" data-open="${c.id}">
      <div class="cours-card-accent" style="background:${niveauColor}"></div><!-- style= OK : couleur dynamique JS D-2026-03-15-T04 -->
      <div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <div class="cours-icon-wrap flex-shrink-0" style="background:${niveauColor}18"><!-- style= OK : couleur dynamique JS D-2026-03-15-T04 -->
            <i class="bi bi-mortarboard" style="color:${niveauColor}"></i><!-- style= OK -->
          </div>
          <div class="flex-grow-1 min-w-0">
            <h6 class="mb-1 fw-semibold text-truncate">${escHtml(c.titre)}</h6>
            <div class="d-flex flex-wrap gap-1">
              <span class="badge text-white" style="background:${niveauColor}">${niveauLabel}</span><!-- style= OK : couleur dynamique JS D-2026-03-15-T04 -->
              ${statusBadge}
              ${catBadge}
            </div>
          </div>
          ${menu}
        </div>
        ${c.description ? `<p class="text-muted small cours-desc mb-2">${escHtml(c.description)}</p>` : ''}
        ${tags ? `<div class="d-flex flex-wrap gap-1">${tags}</div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ─── VIEW ───────────────────────────────────────────────── */
async function openCoursView(id) {
  const body   = document.getElementById('modalViewBody');
  const footer = document.getElementById('modalViewFooter');
  /* V6 corrigé : spinner → skeleton */
  body.innerHTML = `<div class="placeholder-glow">
    <span class="placeholder col-4 mb-2 rounded d-block"></span>
    <span class="placeholder col-8 mb-3 rounded d-block"></span>
    <span class="placeholder col-12 mb-1 rounded d-block"></span>
    <span class="placeholder col-10 rounded d-block"></span>
  </div>`;
  footer.innerHTML = '';
  modalCoursView.show();

  const { data: c } = await DB.from('cours').select('*, category:categories(id, label, color)').eq('id', id).maybeSingle();
  if (!c) { body.innerHTML = '<p class="text-danger">Erreur de chargement.</p>'; return; }

  document.getElementById('modalViewLabel').innerHTML = `<i class="bi bi-mortarboard me-2 text-warning"></i>${escHtml(c.titre)}`;

  const tags = await loadTagsForRecord(id);
  let imagesHtml = '';
  if (state.contentTypeId) {
    const { data: imgRows } = await DB.from('content_images').select('storage_path')
      .eq('content_type_id', state.contentTypeId).eq('content_id', id).order('position');
    const paths = (imgRows || []).map(r => r.storage_path);
    const urls  = await getSignedUrls(paths);
    if (paths.length) {
      /* V3 corrigé : style="height:110px;...cursor:pointer" → class="cours-view-thumb cds-clickable" (INTERDIT-C2) */
      imagesHtml = `<div class="border-top pt-3 mb-3">
        <p class="small text-muted text-uppercase fw-semibold mb-2">Images</p>
        <div class="d-flex flex-wrap gap-2">${paths.map(p => urls[p]
          ? `<img src="${urls[p]}" alt="" class="cours-view-thumb cds-clickable rounded border" data-src="${urls[p]}">`
          : '').join('')}</div>
      </div>`;
    }
  }

  const niveauColor = NIVEAU_COLORS[c.niveau] || '#6c757d'; /* couleur dynamique JS D-2026-03-15-T04 */
  const tagsHtml = tags.length
    ? `<div class="border-top pt-3 mt-3"><p class="small text-muted text-uppercase fw-semibold mb-2">Tags</p><div class="d-flex flex-wrap gap-1">${tags.map(t=>`<span class="badge bg-light text-dark border">${escHtml(t.label_display)}</span>`).join('')}</div></div>`
    : '';

  body.innerHTML = `
    <div class="d-flex flex-wrap gap-2 mb-3">
      <span class="badge text-white" style="background:${niveauColor}">${NIVEAU_LABELS[c.niveau]||escHtml(c.niveau)}</span><!-- style= OK : couleur dynamique JS D-2026-03-15-T04 -->
      ${c.status === 'published' ? '<span class="badge bg-success">Publié</span>' : '<span class="badge bg-secondary">Brouillon</span>'}
      ${c.category ? `<span class="badge" style="background:${c.category.color}20;color:${c.category.color};border:1px solid ${c.category.color}">${escHtml(c.category.label)}</span>` : ''}<!-- style= OK : couleur dynamique Supabase D-2026-03-15-T04 -->
    </div>
    ${imagesHtml}
    ${c.description ? `<p class="text-muted mb-3">${escHtml(c.description)}</p>` : ''}
    ${c.contenu ? `<div class="cours-view-content border-top pt-3">${DOMPurify.sanitize(c.contenu)}</div>` : ''}
    ${tagsHtml}`;

  body.querySelectorAll('img[data-src]').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = img.dataset.src;
      modalLightbox.show();
    });
  });

  footer.innerHTML = `
    ${state.isAdmin ? `<button class="btn btn-outline-warning me-auto" data-edit-view="${id}"><i class="bi bi-pencil me-1"></i>Modifier</button>` : ''}
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>`;
  footer.querySelector('[data-edit-view]')?.addEventListener('click', () => { modalCoursView.hide(); openCoursModal(id); });
}

/* ─── FORM ───────────────────────────────────────────────── */
async function openCoursModal(id = null) {
  state.editingId = id;
  state.formTagIds = []; state.formImages = [];
  document.getElementById('cFormError').classList.add('d-none');
  document.getElementById('cTitre').value        = '';
  document.getElementById('cDesc').value         = '';
  document.getElementById('cFormNiveau').value   = 'debutant';
  document.getElementById('cFormCategory').value = '';
  document.getElementById('cFormStatus').value   = 'draft';
  document.getElementById('cTagSearch').value    = '';
  document.getElementById('cImagePreviews').innerHTML = '';
  if (quill) quill.setContents([]);
  renderTagSelector();

  document.getElementById('modalCoursLabel').textContent = id ? 'Modifier le cours' : 'Nouveau cours';

  if (id) {
    document.getElementById('cBtnSave').disabled = true;
    const { data: c } = await DB.from('cours').select('*').eq('id', id).maybeSingle();
    if (!c) { showToast('Cours introuvable', 'error'); return; }

    document.getElementById('cTitre').value        = c.titre        || '';
    document.getElementById('cDesc').value         = c.description  || '';
    document.getElementById('cFormNiveau').value   = c.niveau       || 'debutant';
    document.getElementById('cFormCategory').value = c.category_id  || '';
    document.getElementById('cFormStatus').value   = c.status       || 'draft';
    if (quill && c.contenu) quill.clipboard.dangerouslyPasteHTML(c.contenu);

    if (state.contentTypeId) {
      const { data: imgRows } = await DB.from('content_images').select('*')
        .eq('content_type_id', state.contentTypeId).eq('content_id', id).order('position');
      const paths = (imgRows || []).map(r => r.storage_path);
      const urls  = await getSignedUrls(paths);
      state.formImages = (imgRows || []).map(r => ({ storage_path: r.storage_path, position: r.position, url: urls[r.storage_path] || '' }));
      renderImagePreviews();
    }

    const { data: tagLinks } = await DB.from('tag_links').select('tag_id').eq('content_id', id).eq('content_type', 'cours');
    state.formTagIds = (tagLinks || []).map(t => t.tag_id);
    renderTagSelector();
    document.getElementById('cBtnSave').disabled = false;
  }

  modalCours.show();
}

async function saveItem() {
  const titre = document.getElementById('cTitre').value.trim();
  if (!titre) {
    document.getElementById('cFormError').textContent = 'Le titre est obligatoire.';
    document.getElementById('cFormError').classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('cBtnSave');
  /* spinner dans bouton d'action = acceptable (state d'action, pas de chargement données) */
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement...';

  const payload = {
    titre,
    description : document.getElementById('cDesc').value.trim() || null,
    contenu     : quill ? quill.root.innerHTML : '',
    niveau      : document.getElementById('cFormNiveau').value,
    category_id : document.getElementById('cFormCategory').value || null,
    status      : document.getElementById('cFormStatus').value,
    tags        : [],
    updated_at  : new Date().toISOString(),
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('cours').update(payload).eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
    } else {
      /* B-09 corrigé : window.bdbUser?.id null-safe (INTERDIT-B2) */
      const { data, error } = await DB.from('cours').insert([{ ...payload, user_id: window.bdbUser?.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
    }
    await syncImages(recordId);
    await syncTags(recordId);
    modalCours.hide();
    showToast(state.editingId ? 'Cours mis à jour.' : 'Cours créé.', 'success');
    loadItems();
  } catch (err) {
    document.getElementById('cFormError').textContent = err.message;
    document.getElementById('cFormError').classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

/* ─── DELETE — confirm() natif → modale Bootstrap ────────── */
function deleteItem(id) {
  const item  = state.items.find(c => c.id === id);
  const label = item?.titre?.substring(0, 60) || 'ce cours';
  document.getElementById('coursConfirmMsg').textContent = `Supprimer "${label}" ? Cette action est irréversible.`;
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCoursConfirm'));
  modal.show();
  const btn = document.getElementById('btnCoursConfirmDel');
  const handler = async () => {
    modal.hide();
    btn.removeEventListener('click', handler);
    const { error } = await DB.from('cours').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Cours supprimé.', 'success');
    loadItems();
  };
  btn.addEventListener('click', handler);
  document.getElementById('modalCoursConfirm').addEventListener('hidden.bs.modal', () => {
    btn.removeEventListener('click', handler);
  }, { once: true });
}

/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  /* V1 corrigé : bdb-shell.js gère auth + header + offcanvas.
     initAuth() local supprimé. BDB header inline supprimé.
     window.bdbUser = source unique (INTERDIT-B1/B2/B3). */
  await window.bdbShellReady;
  state.isAdmin = window.bdbUser?.isAdmin ?? false;

  /* V2 corrigé : slot #adminActions dans toolbar — pas d'injection innerHTML (INTERDIT-C4) */
  if (state.isAdmin) {
    document.getElementById('adminActions').classList.remove('d-none');
    document.getElementById('cStatusWrapper').classList.remove('d-none');
    document.getElementById('btnNew').addEventListener('click', () => openCoursModal());
  }

  modalCours     = new bootstrap.Modal(document.getElementById('modalCours'));
  modalCoursView = new bootstrap.Modal(document.getElementById('modalCoursView'));
  modalLightbox  = new bootstrap.Modal(document.getElementById('modalLightbox'));

  quill = new Quill('#cQuill', {
    theme: 'snow',
    placeholder: 'Rédigez le contenu du cours...',
    modules: { toolbar: [[{ header: [2, 3, false] }], ['bold','italic','underline'], [{ list:'ordered'},{list:'bullet'}], ['blockquote','link'], ['clean']] },
  });
  /* Fix Quill-in-modal : height:100% collapse quand modal=display:none */
  document.querySelectorAll('.ql-container').forEach(c => c.style.height = 'auto');
  document.querySelectorAll('.ql-editor').forEach(e => { e.style.height = 'auto'; e.style.minHeight = '120px'; });

  document.querySelectorAll('.dropdown').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  /* C.9 — référentiels : throw + catch centralisé. Si les fondations cassent, le module s'arrête. */
  try {
    await Promise.all([loadContentTypeAndCategories(), loadTags()]);
  } catch (err) {
    cdsShowGridError(document.getElementById('coursGrid'),
      'Impossible de charger les référentiels. Rechargez la page.', () => location.reload());
    return;
  }
  await loadItems();

  let debounce;
  document.getElementById('cSearch').addEventListener('input',    () => { clearTimeout(debounce); debounce = setTimeout(loadItems, 400); });
  document.getElementById('cNiveau').addEventListener('change',   loadItems);
  document.getElementById('cStatus').addEventListener('change',   loadItems);
  document.getElementById('cCategory').addEventListener('change', loadItems);
  document.getElementById('cTagSearch').addEventListener('input', renderTagSelector);

  const zone = document.getElementById('cImageUploadZone');
  zone.addEventListener('click',     () => document.getElementById('cFileInput').click());
  zone.addEventListener('dragover',  e  => { e.preventDefault(); zone.classList.add('cours-upload-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('cours-upload-over'));
  zone.addEventListener('drop',      e  => { e.preventDefault(); zone.classList.remove('cours-upload-over'); handleImageFiles(e.dataTransfer.files); });
  document.getElementById('cFileInput').addEventListener('change', e => { handleImageFiles(e.target.files); e.target.value = ''; });

  document.getElementById('cBtnSave').addEventListener('click', saveItem);
  document.getElementById('modalCours').addEventListener('hidden.bs.modal', () => { state.formTagIds = []; state.formImages = []; });
});

/* ── CDS resilience helpers ─────────────────────────────── */
function cdsShowGridError(el, msg, retryFn) {
  if (!el) return;
  const retryBtn = retryFn
    ? `<button class="btn btn-sm btn-outline-danger cds-error-retry" id="cdsRetryBtn">
         <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
       </button>`
    : '';
  el.innerHTML = `<div class="cds-error-state col-12">
    <i class="bi bi-wifi-off cds-error-icon"></i>
    <div class="cds-error-title">Données non chargées</div>
    <div class="cds-error-msg">${msg || 'Impossible de contacter le serveur. Vérifiez votre connexion.'}</div>
    ${retryBtn}
  </div>`;
  if (retryFn) {
    const btn = el.querySelector('#cdsRetryBtn');
    if (btn) btn.addEventListener('click', retryFn);
  }
}
/* ── Fin CDS resilience helpers ─────────────────────────── */
