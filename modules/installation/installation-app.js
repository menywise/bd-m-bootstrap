/* =========================================================
   MODULE INSTALLATION PATIENT — BDB
   Table  : installation_patient
   Liées  : categories · content_images · content_relations (fiches)
            tag_links · tags · content_types
   Bucket : content-images
   Shell  : bdb-shell.js v1.4.0 — window.bdbUser (INTERDIT-B2)
   ========================================================= */

const DB = window.bdb;
const BUCKET = 'content-images';

const POSITION_LABELS = {
  decubitus_dorsal: 'Décubitus dorsal',
  decubitus_ventral: 'Décubitus ventral',
  decubitus_lateral_droit: 'Décubitus latéral droit',
  decubitus_lateral_gauche: 'Décubitus latéral gauche',
  position_assise: 'Position assise',
  position_gynecologique: 'Position gynécologique',
  position_trendelenburg: 'Trendelenburg',
  position_anti_trendelenburg: 'Anti-Trendelenburg',
  position_genu_pectorale: 'Genu-pectorale',
  autre: 'Autre',
};

const state = {
  user: null, isAdmin: false,
  items: [], categories: [], allTags: [], allFiches: [],
  editingId: null, formTagIds: [], formImages: [], formFicheIds: [],
  contentTypeId: null, ficheContentTypeId: null,
};

let quillDesc, quillPrec, modalInstall, modalInstallView, modalLightbox;

/* ─── UTILS ─────────────────────────────────────────────── */


function showToast(msg, type = 'info') {
  const iconMap = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className = 'bi me-2 ' + (iconMap[type] || iconMap.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Attention' : type === 'success' ? 'Enregistré' : 'À noter';
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(document.getElementById('toastInfo')).show();
}

/* ─── C.9 STATES ────────────────────────────────────────── */

function setGridState(s, errMsg) {
  document.getElementById('gridLoading').classList.toggle('d-none', s !== 'loading');
  document.getElementById('gridEmpty').classList.toggle('d-none', s !== 'empty');
  document.getElementById('gridError').classList.toggle('d-none', s !== 'error');
  document.getElementById('installGrid').classList.toggle('d-none', s !== 'data');
  if (s === 'error' && errMsg) {
    document.getElementById('gridErrorMsg').textContent = errMsg;
  }
  if (s === 'empty' && state.isAdmin) {
    document.getElementById('btnNewEmpty').classList.remove('d-none');
  }
}

/* ─── CONTENT TYPES ─────────────────────────────────────── */

async function loadContentTypes() {
  const { data } = await DB.from('content_types').select('id, code');
  (data || []).forEach(ct => {
    if (ct.code === 'installation_patient') state.contentTypeId = ct.id;
    if (ct.code === 'fiches') state.ficheContentTypeId = ct.id;
  });
}

/* ─── CATEGORIES ────────────────────────────────────────── */

async function loadCategories() {
  if (!state.contentTypeId) return;
  const { data } = await DB.from('categories')
    .select('id, label, color')
    .eq('content_type_id', state.contentTypeId)
    .order('label');
  state.categories = data || [];
  [document.getElementById('iCategory'), document.getElementById('iFormCategory')].forEach(sel => {
    if (!sel) return;
    const first = sel.options[0];
    sel.innerHTML = ''; sel.add(first);
    state.categories.forEach(c => sel.add(new Option(c.label, c.id)));
  });
}

/* ─── FICHES ────────────────────────────────────────────── */

async function loadFiches() {
  const { data } = await DB.from('fiches_intervention')
    .select('id, titre')
    .eq('status', 'published')
    .order('titre');
  state.allFiches = data || [];
}

function renderFichesList() {
  const container = document.getElementById('iFichesContainer');
  if (!state.allFiches.length) {
    container.innerHTML = '<p class="text-muted small text-center py-3 mb-0">Aucune fiche publiée disponible</p>';
    return;
  }
  container.innerHTML = state.allFiches.map(f => {
    const checked = state.formFicheIds.includes(f.id);
    return `<label class="install-fiche-item d-flex align-items-center gap-2 p-2 rounded ${checked ? 'install-fiche-selected' : ''}">
      <input type="checkbox" class="form-check-input m-0 flex-shrink-0" ${checked ? 'checked' : ''} data-fiche-id="${escHtml(f.id)}"/>
      <i class="bi bi-file-earmark-medical text-muted small"></i>
      <span class="small">${escHtml(f.titre)}</span>
    </label>`;
  }).join('');
  container.querySelectorAll('[data-fiche-id]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.ficheId;
      if (cb.checked) { if (!state.formFicheIds.includes(id)) state.formFicheIds.push(id); }
      else state.formFicheIds = state.formFicheIds.filter(x => x !== id);
      cb.closest('label').classList.toggle('install-fiche-selected', cb.checked);
      document.getElementById('iFichesCount').textContent =
        state.formFicheIds.length > 0 ? `${state.formFicheIds.length} fiche(s) sélectionnée(s)` : '';
    });
  });
  document.getElementById('iFichesCount').textContent =
    state.formFicheIds.length > 0 ? `${state.formFicheIds.length} fiche(s) sélectionnée(s)` : '';
}

async function loadRelatedFiches(installId) {
  if (!state.contentTypeId || !state.ficheContentTypeId) return [];
  const { data } = await DB.from('content_relations')
    .select('target_id')
    .eq('source_type_id', state.contentTypeId)
    .eq('source_id', installId)
    .eq('target_type_id', state.ficheContentTypeId);
  return (data || []).map(r => r.target_id);
}

async function syncRelations(installId) {
  if (!state.contentTypeId || !state.ficheContentTypeId) return;
  await DB.from('content_relations')
    .delete() // UX06 : caller confirms
    .eq('source_type_id', state.contentTypeId)
    .eq('source_id', installId)
    .eq('target_type_id', state.ficheContentTypeId).select();
  if (state.formFicheIds.length) {
    await DB.from('content_relations').insert(state.formFicheIds.map(fId => ({
      source_type_id: state.contentTypeId, source_id: installId,
      target_type_id: state.ficheContentTypeId, target_id: fId,
    })));
  }
}

/* ─── TAGS ──────────────────────────────────────────────── */

async function loadTags() {
  const { data } = await DB.from('tags')
    .select('id, label_display, type')
    .order('label_display');
  state.allTags = (data || []).filter(t =>
    ['fonction', 'personne', 'libre'].includes(t.type)
  );
}

async function loadTagsForRecord(id) {
  const { data } = await DB.from('tag_links')
    .select('tag_id, tags(id, label_display, type)')
    .eq('content_id', id)
    .eq('content_type', 'installation_patient');
  return (data || []).map(r => r.tags).filter(Boolean);
}

async function syncTags(recordId) {
  await DB.from('tag_links')
    .delete() // UX06 : caller confirms
    .eq('content_id', recordId)
    .eq('content_type', 'installation_patient').select();
  if (state.formTagIds.length > 0) {
    await DB.from('tag_links').insert(state.formTagIds.map(tagId => ({
      content_id: recordId, content_type: 'installation_patient', tag_id: tagId,
    })));
  }
}

function renderTagSelector() {
  const search = document.getElementById('iTagSearch').value.toLowerCase();
  const filtered = state.allTags
    .filter(t => !state.formTagIds.includes(t.id) &&
      (!search || t.label_display.toLowerCase().includes(search)))
    .slice(0, 10);

  document.getElementById('iTagResults').innerHTML = filtered.map(t =>
    `<button type="button" class="btn btn-sm btn-outline-secondary" data-tag-id="${escHtml(t.id)}">
      ${escHtml(t.label_display)}
      <span class="badge bg-light text-muted ms-1 install-tag-type">${escHtml(t.type)}</span>
    </button>`).join('');

  document.querySelectorAll('#iTagResults [data-tag-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.formTagIds.length >= 5) { showToast('Max 5 tags', 'error'); return; }
      state.formTagIds.push(btn.dataset.tagId);
      document.getElementById('iTagSearch').value = '';
      renderTagSelector();
    });
  });

  const selected = state.allTags.filter(t => state.formTagIds.includes(t.id));
  const el = document.getElementById('iSelectedTags');
  if (!selected.length) {
    el.innerHTML = '<span class="text-muted small">Aucun tag</span>';
  } else {
    el.innerHTML = selected.map(t =>
      `<span class="badge bg-info text-white d-flex align-items-center gap-1">
        ${escHtml(t.label_display)}
        <button type="button" class="btn-close btn-close-white p-0 install-tag-remove" data-remove="${escHtml(t.id)}"></button>
      </span>`).join('');
    el.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.formTagIds = state.formTagIds.filter(id => id !== btn.dataset.remove);
        renderTagSelector();
      });
    });
  }
}

/* ─── IMAGES ────────────────────────────────────────────── */

function renderImagePreviews() {
  const container = document.getElementById('iImagePreviews');
  if (!state.formImages.length) { container.innerHTML = ''; return; }
  container.innerHTML = state.formImages.map((img, i) =>
    `<div class="position-relative">
      <img src="${img.url || img._local}" alt="" class="rounded border install-img-preview"/>
      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 install-img-remove-btn" data-idx="${i}">&times;</button>
    </div>`).join('');
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
    state.formImages.push({
      storage_path: '', position: state.formImages.length,
      _file: file, _local: URL.createObjectURL(file),
    });
  }
  renderImagePreviews();
}

async function uploadPendingImages(recordId) {
  for (let i = 0; i < state.formImages.length; i++) {
    const img = state.formImages[i];
    if (!img._file) continue;
    const ext = img._file.name.split('.').pop();
    const path = `installation_patient/${recordId}/${Date.now()}_${i}.${ext}`;
    const { error } = await DB.storage.from(BUCKET).upload(path, img._file, { upsert: true });
    if (error) { showToast('Erreur upload : ' + error.message, 'error'); continue; }
    img.storage_path = path; delete img._file; delete img._local;
  }
}

async function syncImages(recordId) {
  if (!state.contentTypeId) return;
  await uploadPendingImages(recordId);
  const { data: existing } = await DB.from('content_images')
    .select('id, storage_path')
    .eq('content_type_id', state.contentTypeId)
    .eq('content_id', recordId);
  const existingPaths = new Set((existing || []).map(i => i.storage_path));
  const newPaths = new Set(state.formImages.map(i => i.storage_path).filter(Boolean));
  const toDelete = (existing || []).filter(i => !newPaths.has(i.storage_path));
  if (toDelete.length) await DB.from('content_images').delete().in('id', toDelete.map(i => i.id)).select(); // UX06 : caller confirms
  const toInsert = state.formImages.filter(i => i.storage_path && !existingPaths.has(i.storage_path));
  if (toInsert.length) await DB.from('content_images').insert(toInsert.map(i => ({
    content_type_id: state.contentTypeId, content_id: recordId,
    storage_path: i.storage_path, position: i.position,
  })));
}

/** AUDIT S9 : signed URLs réduites de 3600s → 900s */
async function getSignedUrls(paths) {
  if (!paths.length) return {};
  const { data } = await DB.storage.from(BUCKET).createSignedUrls(paths, 900);
  const map = {};
  (data || []).forEach(r => { if (r.signedUrl) map[r.path] = r.signedUrl; });
  return map;
}

/* ─── LOAD ──────────────────────────────────────────────── */

async function loadItems() {
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_installation').select('*');
    state.items = data || [];
    if (!state.items.length) { setGridState('empty'); return; }
    const grid = document.getElementById('installGrid');
    grid.innerHTML = state.items.map(item => renderCard(item)).join('');
    setGridState('data');
    return;
  }
  setGridState('loading');

  let q = DB.from('installation_patient')
    .select('*, category:categories(id, label, color)')
    .order('created_at', { ascending: false })
    .limit(100);

  const search = document.getElementById('iSearch').value.trim();
  const position = document.getElementById('iPosition').value;
  const cat = document.getElementById('iCategory').value;
  if (search) q = q.or(`titre.ilike.%${search}%,description.ilike.%${search}%`);
  if (position) q = q.eq('position', position);
  if (cat) q = q.eq('category_id', cat);

  const { data, error } = await q;
  if (error) {
    setGridState('error', error.message);
    return;
  }
  state.items = data || [];

  if (!state.items.length) {
    setGridState('empty');
    return;
  }

  const grid = document.getElementById('installGrid');
  grid.innerHTML = state.items.map(item => renderCard(item)).join('');

  grid.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => {
      if (state.isAdmin) openModal(el.dataset.open);
      else openView(el.dataset.open);
    });
  });
  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.dataset.edit); });
  });
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteItem(btn.dataset.del); });
  });

  setGridState('data');
}

/* ─── RENDER CARD ───────────────────────────────────────── */

function renderCard(item) {
  const posLabel = POSITION_LABELS[item.position] || item.position || '—';
  /* category.color = exception tolérée INTERDIT-C2 */
  const catBadge = item.category
    ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${escHtml(item.category.label)}</span>`
    : '';
  const tags = Array.isArray(item.tags) && item.tags.length
    ? item.tags.slice(0, 3).map(t => `<span class="badge bg-light text-dark border">#${escHtml(t)}</span>`).join('')
    : '';
  const menu = state.isAdmin ? `
    <div class="dropdown">
      <button class="btn btn-sm install-card-menu" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><button class="dropdown-item" data-edit="${escHtml(item.id)}"><i class="bi bi-pencil me-2"></i>Modifier</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" data-del="${escHtml(item.id)}"><i class="bi bi-trash me-2"></i>Supprimer</button></li>
      </ul>
    </div>` : '';

  const rawDesc = item.description ? item.description.replace(/<[^>]*>/g, '') : '';
  const desc = rawDesc
    ? `<p class="text-muted small install-desc mb-2">${escHtml(rawDesc.slice(0, 150))}</p>`
    : '';

  return `<div class="col-12 col-md-6 col-lg-4">
    <div class="card border-0 shadow-sm install-card h-100" data-open="${escHtml(item.id)}">
      <div class="install-card-accent"></div>
      <div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <div class="install-icon-wrap flex-shrink-0"><i class="bi bi-hospital text-info"></i></div>
          <div class="flex-grow-1 min-w-0">
            <h6 class="mb-1 fw-semibold text-truncate">${escHtml(item.titre)}</h6>
            <div class="d-flex flex-wrap gap-1">
              ${item.position ? `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25"><i class="bi bi-person-arms-up me-1"></i>${escHtml(posLabel)}</span>` : ''}
              ${catBadge}
            </div>
          </div>
          ${menu}
        </div>
        ${desc}
        ${item.precautions ? `<div class="install-precaution-badge"><i class="bi bi-exclamation-triangle me-1"></i>Précautions</div>` : ''}
        ${tags ? `<div class="d-flex flex-wrap gap-1 mt-2">${tags}</div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ─── VIEW ──────────────────────────────────────────────── */

async function openView(id) {
  const body = document.getElementById('modalViewBody');
  const footer = document.getElementById('modalViewFooter');
  body.innerHTML = `<div class="placeholder-glow p-3">
    <div class="placeholder col-5 rounded mb-3"></div>
    <div class="placeholder col-8 rounded mb-2"></div>
    <div class="placeholder col-6 rounded"></div>
  </div>`;
  footer.innerHTML = '';
  modalInstallView.show();

  const { data: item } = await DB.from('installation_patient')
    .select('*, category:categories(id, label, color)')
    .eq('id', id).maybeSingle();
  if (!item) { body.innerHTML = '<p class="text-danger">Erreur de chargement.</p>'; return; }

  document.getElementById('modalViewLabel').textContent = item.titre;

  const tags = await loadTagsForRecord(id);
  let imagesHtml = '';
  if (state.contentTypeId) {
    const { data: imgRows } = await DB.from('content_images')
      .select('storage_path')
      .eq('content_type_id', state.contentTypeId)
      .eq('content_id', id)
      .order('position');
    const paths = (imgRows || []).map(r => r.storage_path);
    const urls = await getSignedUrls(paths);
    if (paths.length) {
      imagesHtml = `<div class="mb-3">
        <p class="small text-muted text-uppercase fw-semibold mb-2">Images</p>
        <div class="d-flex flex-wrap gap-2">${paths.map(p => urls[p]
          ? `<img src="${urls[p]}" alt="" class="rounded border install-view-thumb" data-src="${urls[p]}">`
          : '').join('')}</div>
      </div>`;
    }
  }

  const relatedFicheIds = await loadRelatedFiches(id);
  let fichesHtml = '';
  if (relatedFicheIds.length) {
    const { data: fiches } = await DB.from('fiches_intervention')
      .select('id, titre').in('id', relatedFicheIds);
    if (fiches?.length) {
      fichesHtml = `<div class="border-top pt-3 mt-3">
        <p class="small text-muted text-uppercase fw-semibold mb-2"><i class="bi bi-link-45deg me-1"></i>Fiches liées</p>
        <div class="d-flex flex-column gap-1">${fiches.map(f =>
          `<span class="badge bg-light text-dark border text-start p-2"><i class="bi bi-file-earmark-medical me-1 text-primary"></i>${escHtml(f.titre)}</span>`
        ).join('')}</div>
      </div>`;
    }
  }

  const posLabel = POSITION_LABELS[item.position] || item.position || null;
  /* category.color = exception tolérée INTERDIT-C2 */
  const catBadge = item.category
    ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${escHtml(item.category.label)}</span>`
    : '';
  const tagsHtml = tags.length
    ? `<div class="border-top pt-3 mt-3"><p class="small text-muted text-uppercase fw-semibold mb-2">Tags</p><div class="d-flex flex-wrap gap-1">${tags.map(t =>
        `<span class="badge bg-light text-dark border">${escHtml(t.label_display)}</span>`
      ).join('')}</div></div>`
    : '';

  body.innerHTML = `
    <div class="d-flex flex-wrap gap-2 mb-3">
      ${posLabel ? `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25"><i class="bi bi-person-arms-up me-1"></i>${escHtml(posLabel)}</span>` : ''}
      ${catBadge}
    </div>
    ${imagesHtml}
    ${item.description ? `<div class="install-view-content mb-3">${DOMPurify.sanitize(item.description)}</div>` : ''}
    ${item.precautions ? `<div class="alert alert-warning"><p class="small fw-semibold text-uppercase mb-1"><i class="bi bi-exclamation-triangle me-1"></i>Précautions</p><div class="install-view-content">${DOMPurify.sanitize(item.precautions)}</div></div>` : ''}
    ${fichesHtml}${tagsHtml}`;

  body.querySelectorAll('img[data-src]').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = img.dataset.src;
      modalLightbox.show();
    });
  });

  footer.innerHTML = `
    ${state.isAdmin ? `<button class="btn btn-outline-info me-auto" data-edit-view="${escHtml(id)}"><i class="bi bi-pencil me-1"></i>Modifier</button>` : ''}
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>`;
  footer.querySelector('[data-edit-view]')?.addEventListener('click', (e) => {
    e.currentTarget.blur();
    modalInstallView.hide(); openModal(id);
  });
}

/* ─── FORM ──────────────────────────────────────────────── */

async function openModal(id = null) {
  state.editingId = id;
  state.formTagIds = []; state.formImages = []; state.formFicheIds = [];
  document.getElementById('iFormError').classList.add('d-none');
  document.getElementById('iTitre').value = '';
  document.getElementById('iFormPosition').value = '';
  document.getElementById('iFormCategory').value = '';
  document.getElementById('iTagSearch').value = '';
  document.getElementById('iImagePreviews').innerHTML = '';
  if (quillDesc) quillDesc.setContents([]);
  if (quillPrec) quillPrec.setContents([]);
  renderTagSelector();
  renderFichesList();

  document.getElementById('modalInstallLabel').textContent =
    id ? "Modifier l'installation" : 'Nouvelle installation patient';

  if (id) {
    document.getElementById('iBtnSave').disabled = true;
    const { data: item } = await DB.from('installation_patient')
      .select('*').eq('id', id).maybeSingle();
    if (!item) { showToast('Installation introuvable', 'error'); return; }

    document.getElementById('iTitre').value = item.titre || '';
    document.getElementById('iFormPosition').value = item.position || '';
    document.getElementById('iFormCategory').value = item.category_id || '';
    if (quillDesc && item.description) quillDesc.clipboard.dangerouslyPasteHTML(item.description);
    if (quillPrec && item.precautions) quillPrec.clipboard.dangerouslyPasteHTML(item.precautions);

    if (state.contentTypeId) {
      const { data: imgRows } = await DB.from('content_images')
        .select('*')
        .eq('content_type_id', state.contentTypeId)
        .eq('content_id', id)
        .order('position');
      const paths = (imgRows || []).map(r => r.storage_path);
      const urls = await getSignedUrls(paths);
      state.formImages = (imgRows || []).map(r => ({
        storage_path: r.storage_path, position: r.position,
        url: urls[r.storage_path] || '',
      }));
      renderImagePreviews();
    }

    state.formFicheIds = await loadRelatedFiches(id);
    renderFichesList();

    const { data: tagLinks } = await DB.from('tag_links')
      .select('tag_id')
      .eq('content_id', id)
      .eq('content_type', 'installation_patient');
    state.formTagIds = (tagLinks || []).map(t => t.tag_id);
    renderTagSelector();
    document.getElementById('iBtnSave').disabled = false;
  }

  modalInstall.show();
}

/* ─── SAVE ──────────────────────────────────────────────── */

async function saveItem() {
  const titre = document.getElementById('iTitre').value.trim();
  if (!titre) {
    document.getElementById('iFormError').textContent = 'Un titre est nécessaire pour continuer.';
    document.getElementById('iFormError').classList.remove('d-none');
    return;
  }

  const btn = document.getElementById('iBtnSave');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement...';

  const payload = {
    titre,
    description: quillDesc ? quillDesc.root.innerHTML : null,
    precautions: quillPrec ? quillPrec.root.innerHTML : null,
    position: document.getElementById('iFormPosition').value || null,
    category_id: document.getElementById('iFormCategory').value || null,
    tags: [],
    updated_at: new Date().toISOString(),
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('installation_patient')
        .update(payload).eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
    } else {
      const { data, error } = await DB.from('installation_patient')
        .insert([{ ...payload, user_id: state.user.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
    }
    await syncImages(recordId);
    await syncRelations(recordId);
    await syncTags(recordId);
    modalInstall.hide();
    showToast(state.editingId ? 'Installation mise à jour.' : 'Installation créée.', 'success');
    loadItems();
  } catch (err) {
    document.getElementById('iFormError').textContent = err.message;
    document.getElementById('iFormError').classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

/* ─── DELETE ────────────────────────────────────────────── */

async function deleteItem(id) {
  if (!confirm("Retirer cette installation définitivement ?")) return;
  const { error } = await DB.from('installation_patient').delete().eq('id', id).select();
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Installation supprimée.', 'success');
  loadItems();
}

/* ─── INIT ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {

  /* ── bdb-shell — INTERDIT-B2 : window.bdbUser seul accès ── */
  await window.bdbShellReady;
  const u = window.bdbUser;
  if (!u) return;

  state.user = { id: u.id, email: u.email };
  state.isAdmin = u.isAdmin ?? false;

  /* ── Admin slot — pattern C.6 ── */
  if (state.isAdmin) {
    const slot = document.getElementById('headerAdminSlot');
    slot.classList.remove('d-none');
    slot.innerHTML = `<button class="btn btn-primary btn-sm" id="btnNew">
      <i class="bi bi-plus-lg me-1"></i>Nouvelle installation
    </button>`;
    document.getElementById('btnNew').addEventListener('click', () => openModal());
  }

  /* ── Modals + Quill ── */
  modalInstall = new bootstrap.Modal(document.getElementById('modalInstall'));
  modalInstallView = new bootstrap.Modal(document.getElementById('modalInstallView'));
  modalLightbox = new bootstrap.Modal(document.getElementById('modalLightbox'));

  const quillOpts = {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['clean'],
      ],
    },
  };
  quillDesc = new Quill('#iQuillDesc', { ...quillOpts, placeholder: "Décrivez l'installation en détail..." });
  quillPrec = new Quill('#iQuillPrec', { ...quillOpts, placeholder: 'Points de vigilance, risques à surveiller...' });
  /* Fix Quill-in-modal : height:100% collapse quand modal = display:none à l'init */
  [quillDesc, quillPrec].forEach(q => {
    q.root.style.height = 'auto';
    q.root.style.minHeight = '120px';
  });
  document.querySelector('#iQuillDesc').style.height = 'auto';
  document.querySelector('#iQuillPrec').style.height = 'auto';

  /* ── Données référentielles ── */
  await loadContentTypes();
  await Promise.all([loadCategories(), loadFiches(), loadTags()]);
  await loadItems();

  /* ── Filtres ── */
  let debounce;
  document.getElementById('iSearch').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(loadItems, 400);
  });
  document.getElementById('iPosition').addEventListener('change', loadItems);
  document.getElementById('iCategory').addEventListener('change', loadItems);
  document.getElementById('iTagSearch').addEventListener('input', renderTagSelector);

  /* ── Upload zone ── */
  const zone = document.getElementById('iImageUploadZone');
  zone.addEventListener('click', () => document.getElementById('iFileInput').click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('install-upload-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('install-upload-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('install-upload-over');
    handleImageFiles(e.dataTransfer.files);
  });
  document.getElementById('iFileInput').addEventListener('change', e => {
    handleImageFiles(e.target.files); e.target.value = '';
  });

  /* ── Save ── */
  document.getElementById('iBtnSave').addEventListener('click', saveItem);

  /* ── Cleanup modal state ── */
  document.getElementById('modalInstall').addEventListener('hidden.bs.modal', () => {
    state.formTagIds = []; state.formImages = []; state.formFicheIds = [];
  });

  /* ── Empty state : bouton créer ── */
  document.getElementById('btnNewEmpty').addEventListener('click', () => openModal());

  /* ── Retry error ── */
  document.getElementById('gridRetryBtn').addEventListener('click', loadItems);
});
