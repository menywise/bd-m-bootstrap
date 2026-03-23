/* =========================================================
   MODULE ANATOMIE — BDB v1.1.0
   Table  : anatomie
   Liées  : categories (code='anatomie'), content_images, tag_links, tags
   Bucket : content-images (signed URLs)
   ========================================================= */

const DB = window.bdb;
const BUCKET = 'content-images';

const state = {
  user: null, isAdmin: false,
  items: [], categories: [], allTags: [],
  editingId: null, formTagIds: [],
  formImages: [],   // { storage_path, position, url?, _file?, _local? }
  contentTypeId: null,
};

let quill, modalAnat, modalAnatView, modalLightbox;

/* ─── TOAST ──────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  document.getElementById('toastMsg').textContent = msg;
  const iconMap = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className = 'bi me-2 ' + (iconMap[type] || iconMap.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Info';
  bootstrap.Toast.getOrCreateInstance(document.getElementById('toastInfo')).show();
}

/* ─── AUTH → SHELL ───────────────────────────────────────── */
function initFromShell() {
  /* window.bdbUser fourni par bdb-shell.js — zéro requête SQL ici */
  /* null-safe : window.bdbUser peut être null en mode démo non connecté */
  state.user    = window.bdbUser ? { id: window.bdbUser.id } : null;
  state.isAdmin = window.bdbUser?.isAdmin ?? false;
  if (state.isAdmin) {
    document.getElementById('aToolbarAdminSlot').classList.remove('d-none');
    document.getElementById('btnNew').addEventListener('click', () => openAnatModal());
  }
}

/* ─── CONTENT TYPE + CATEGORIES (1 seule requête) ───────────── */
async function loadContentTypeAndCategories() {
  const { data: ct } = await DB.from('content_types').select('id').eq('code', 'anatomie').maybeSingle();
  if (!ct) return;
  state.contentTypeId = ct.id;
  const { data } = await DB.from('categories').select('id, label, color').eq('content_type_id', ct.id).order('label');
  state.categories = data || [];
  [document.getElementById('aCategory'), document.getElementById('aFormCategory')].forEach(sel => {
    if (!sel) return;
    const base = sel.options[0];
    sel.innerHTML = '';
    sel.add(base);
    state.categories.forEach(c => sel.add(new Option(c.label, c.id)));
  });
}

/* ─── TAGS ───────────────────────────────────────────────── */
async function loadTags() {
  const { data } = await DB.from('tags').select('id, label_display, type').order('label_display');
  state.allTags = (data || []).filter(t => ['anatomie','acronyme','libre'].includes(t.type));
}

async function loadTagsForRecord(id) {
  const { data } = await DB.from('tag_links')
    .select('tag_id, tags(id, label_display, type)')
    .eq('content_id', id).eq('content_type', 'anatomie');
  return (data || []).map(r => r.tags).filter(Boolean);
}

async function syncTags(recordId) {
  await DB.from('tag_links').delete().eq('content_id', recordId).eq('content_type', 'anatomie');
  if (state.formTagIds.length > 0) {
    await DB.from('tag_links').insert(state.formTagIds.map(tagId => ({
      content_id: recordId, content_type: 'anatomie', tag_id: tagId,
    })));
  }
}

function renderTagSelector() {
  const search = document.getElementById('aTagSearch').value.toLowerCase();
  const filtered = state.allTags.filter(t => !state.formTagIds.includes(t.id) && (!search || t.label_display.toLowerCase().includes(search))).slice(0, 10);
  document.getElementById('aTagResults').innerHTML = filtered.map(t =>
    `<button type="button" class="btn btn-sm btn-outline-secondary" data-tag-id="${t.id}">${t.label_display} <span class="badge bg-light text-muted cds-text-micro">${t.type}</span></button>`).join('');
  document.querySelectorAll('#aTagResults [data-tag-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.formTagIds.length >= 5) { showToast('Max 5 tags', 'error'); return; }
      state.formTagIds.push(btn.dataset.tagId);
      document.getElementById('aTagSearch').value = '';
      renderTagSelector();
    });
  });
  const selected = state.allTags.filter(t => state.formTagIds.includes(t.id));
  const el = document.getElementById('aSelectedTags');
  el.innerHTML = !selected.length ? '<span class="text-muted small">Aucun tag</span>'
    : selected.map(t => `<span class="badge bg-danger d-flex align-items-center gap-1">${t.label_display}
        <button type="button" class="btn-close btn-close-white p-0 cds-text-micro" data-remove="${t.id}"></button>
      </span>`).join('');
  el.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => { state.formTagIds = state.formTagIds.filter(id => id !== btn.dataset.remove); renderTagSelector(); });
  });
}

/* ─── IMAGE UPLOAD ───────────────────────────────────────── */
function renderImagePreviews() {
  const container = document.getElementById('aImagePreviews');
  if (!state.formImages.length) { container.innerHTML = ''; return; }
  container.innerHTML = state.formImages.map((img, i) =>
    `<div class="position-relative anat-img-thumb">
      <img src="${img.url || img._local}" alt="" class="cds-thumbnail-lg rounded border"/>
      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 cds-img-remove-btn anat-img-remove" data-idx="${i}">×</button>
    </div>`).join('');
  container.querySelectorAll('.anat-img-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.formImages.splice(Number(btn.dataset.idx), 1);
      state.formImages.forEach((img, j) => img.position = j);
      renderImagePreviews();
    });
  });
}

async function handleImageFiles(files) {
  const remaining = 3 - state.formImages.length;
  if (remaining <= 0) { showToast('Max 3 images', 'error'); return; }
  const toProcess = Array.from(files).slice(0, remaining);
  for (const file of toProcess) {
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} trop lourd (max 5 Mo)`, 'error'); continue; }
    const local = URL.createObjectURL(file);
    state.formImages.push({ storage_path: '', position: state.formImages.length, _file: file, _local: local });
  }
  renderImagePreviews();
}

async function uploadPendingImages(recordId) {
  for (let i = 0; i < state.formImages.length; i++) {
    const img = state.formImages[i];
    if (!img._file) continue;
    const ext = img._file.name.split('.').pop();
    const path = `anatomie/${recordId}/${Date.now()}_${i}.${ext}`;
    const { error } = await DB.storage.from(BUCKET).upload(path, img._file, { upsert: true });
    if (error) { showToast('Erreur upload image : ' + error.message, 'error'); continue; }
    img.storage_path = path;
    delete img._file; delete img._local;
  }
}

async function syncImages(recordId) {
  if (!state.contentTypeId) return;
  await uploadPendingImages(recordId);
  // Lire existantes
  const { data: existing } = await DB.from('content_images').select('id, storage_path').eq('content_type_id', state.contentTypeId).eq('content_id', recordId);
  const existingPaths = new Set((existing || []).map(i => i.storage_path));
  const newPaths = new Set(state.formImages.map(i => i.storage_path).filter(Boolean));
  // Supprimer orphelines
  const toDelete = (existing || []).filter(i => !newPaths.has(i.storage_path));
  if (toDelete.length) await DB.from('content_images').delete().in('id', toDelete.map(i => i.id));
  // Insérer nouvelles
  const toInsert = state.formImages.filter(i => i.storage_path && !existingPaths.has(i.storage_path));
  if (toInsert.length) await DB.from('content_images').insert(toInsert.map(i => ({
    content_type_id: state.contentTypeId, content_id: recordId, storage_path: i.storage_path, position: i.position,
  })));
}

async function getSignedUrls(paths) {
  if (!paths.length) return {};
  const { data } = await DB.storage.from(BUCKET).createSignedUrls(paths, 900);
  const map = {};
  (data || []).forEach(r => { if (r.signedUrl) map[r.path] = r.signedUrl; });
  return map;
}

/* ─── LOAD ITEMS ─────────────────────────────────────────── */
async function loadItems() {
  const grid = document.getElementById('anatomieGrid');
  grid.innerHTML = `<div class="col-12 text-center py-5 text-muted"><div class="spinner-border spinner-border-sm me-2"></div>Chargement...</div>`;

  let q = DB.from('anatomie').select('*, category:categories(id, label, color)').order('created_at', { ascending: false }).limit(100);
  const search = document.getElementById('aSearch').value.trim();
  const region = document.getElementById('aRegion').value;
  const cat = document.getElementById('aCategory').value;
  if (search) q = q.or(`titre.ilike.%${search}%,description.ilike.%${search}%`);
  if (region) q = q.eq('region', region);
  if (cat) q = q.eq('category_id', cat);

  const { data, error } = await q;
  if (error) {
    cdsShowGridError(grid, 'Impossible de charger les fiches anatomie.', loadItems);
    return;
  }
  state.items = data || [];

  if (!state.items.length) {
    grid.innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center py-5 text-muted">
      <i class="bi bi-diagram-3 fs-1 d-block mb-3"></i><p class="mb-0">Aucune fiche anatomie</p>
      ${state.isAdmin ? `<button class="btn btn-outline-danger mt-3" id="btnNewEmpty"><i class="bi bi-plus-lg me-1"></i>Créer une fiche</button>` : ''}
    </div></div></div>`;
    document.getElementById('btnNewEmpty')?.addEventListener('click', () => openAnatModal());
    return;
  }

  grid.innerHTML = state.items.map(item => renderCard(item)).join('');
  grid.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => {
      const item = state.items.find(x => x.id === el.dataset.open);
      if (item && state.isAdmin) openAnatModal(item.id);
      else openAnatView(el.dataset.open);
    });
  });
  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openAnatModal(btn.dataset.edit); });
  });
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteItem(btn.dataset.del); });
  });
}

function renderCard(item) {
  const catBadge = item.category
    ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${item.category.label}</span>` /* style= toléré D-2026-03-15-T04 — couleur dynamique base */ : '';
  const regionBadge = item.region
    ? `<span class="badge bg-light text-secondary border"><i class="bi bi-geo-alt me-1"></i>${item.region}</span>` : '';
  const tags = Array.isArray(item.tags) && item.tags.length
    ? item.tags.slice(0,3).map(t=>`<span class="badge bg-light text-dark border">#${t}</span>`).join('') : '';
  const menu = state.isAdmin ? `
    <div class="dropdown">
      <button class="btn btn-sm anat-card-menu" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><button class="dropdown-item" data-edit="${item.id}"><i class="bi bi-pencil me-2"></i>Modifier</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" data-del="${item.id}"><i class="bi bi-trash me-2"></i>Supprimer</button></li>
      </ul>
    </div>` : '';

  return `<div class="col-12 col-md-6 col-lg-4">
    <div class="card border-0 shadow-sm anat-card h-100 cds-clickable" data-open="${item.id}">
      <div class="anat-card-accent"></div>
      <div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <div class="anat-icon-wrap flex-shrink-0"><i class="bi bi-diagram-3 text-danger"></i></div>
          <div class="flex-grow-1 min-w-0">
            <h6 class="mb-1 fw-semibold text-truncate">${item.titre}</h6>
            <div class="d-flex flex-wrap gap-1">${regionBadge}${catBadge}</div>
          </div>
          ${menu}
        </div>
        ${item.description ? `<p class="text-muted small anat-desc mb-2">${item.description}</p>` : ''}
        ${tags ? `<div class="d-flex flex-wrap gap-1">${tags}</div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ─── VIEW MODAL ─────────────────────────────────────────── */
async function openAnatView(id) {
  const body = document.getElementById('modalViewBody');
  const footer = document.getElementById('modalViewFooter');
  body.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-danger"></div></div>`;
  footer.innerHTML = '';
  modalAnatView.show();

  const { data: item } = await DB.from('anatomie').select('*, category:categories(id, label, color)').eq('id', id).maybeSingle();
  if (!item) { body.innerHTML = '<p class="text-danger">Erreur de chargement.</p>'; return; }

  document.getElementById('modalViewLabel').innerHTML = `<i class="bi bi-diagram-3 me-2 text-danger"></i>${item.titre}`;

  const tags = await loadTagsForRecord(id);
  let imagesHtml = '';
  if (state.contentTypeId) {
    const { data: imgRows } = await DB.from('content_images').select('storage_path').eq('content_type_id', state.contentTypeId).eq('content_id', id).order('position');
    const paths = (imgRows || []).map(r => r.storage_path);
    const urls = await getSignedUrls(paths);
    if (paths.length) {
      imagesHtml = `<div class="border-top pt-3 mb-3">
        <p class="small text-muted text-uppercase fw-semibold mb-2">Images / Schémas</p>
        <div class="d-flex flex-wrap gap-2">${paths.map(p => urls[p]
          ? `<img src="${urls[p]}" alt="" class="rounded border anat-view-img cds-clickable" data-src="${urls[p]}">`
          : '').join('')}</div>
      </div>`;
    }
  }

  const catBadge = item.category ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${item.category.label}</span>` /* style= toléré D-2026-03-15-T04 — couleur dynamique base */ : '';
  const regionBadge = item.region ? `<span class="badge bg-light text-secondary border"><i class="bi bi-geo-alt me-1"></i>${item.region}</span>` : '';
  const tagsHtml = tags.length ? `<div class="border-top pt-3"><p class="small text-muted text-uppercase fw-semibold mb-2">Tags</p><div class="d-flex flex-wrap gap-1">${tags.map(t=>`<span class="badge bg-light text-dark border">${t.label_display}</span>`).join('')}</div></div>` : '';

  body.innerHTML = `
    <div class="d-flex flex-wrap gap-2 mb-3">${regionBadge}${catBadge}</div>
    ${imagesHtml}
    ${item.description ? `<p class="text-muted mb-3">${item.description}</p>` : ''}
    ${tagsHtml}`;

  body.querySelectorAll('.anat-view-img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = img.dataset.src;
      modalLightbox.show();
    });
  });

  footer.innerHTML = `
    ${state.isAdmin ? `<button class="btn btn-outline-danger me-auto" data-edit-view="${id}"><i class="bi bi-pencil me-1"></i>Modifier</button>` : ''}
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>`;
  footer.querySelector('[data-edit-view]')?.addEventListener('click', () => { modalAnatView.hide(); openAnatModal(id); });
}

/* ─── FORM MODAL ─────────────────────────────────────────── */
async function openAnatModal(id = null) {
  state.editingId = id;
  state.formTagIds = [];
  state.formImages = [];
  document.getElementById('aFormError').classList.add('d-none');
  document.getElementById('aTitre').value = '';
  document.getElementById('aDesc').value = '';
  document.getElementById('aFormRegion').value = '';
  document.getElementById('aFormCategory').value = '';
  document.getElementById('aTagSearch').value = '';
  document.getElementById('aImagePreviews').innerHTML = '';
  if (quill) quill.setContents([]);
  renderTagSelector();

  document.getElementById('modalAnatLabel').textContent = id ? 'Modifier la fiche anatomie' : 'Nouvelle fiche anatomie';

  if (id) {
    document.getElementById('aBtnSave').disabled = true;
    const { data: item } = await DB.from('anatomie').select('*').eq('id', id).maybeSingle();
    if (!item) { showToast('Fiche introuvable', 'error'); return; }

    document.getElementById('aTitre').value = item.titre || '';
    document.getElementById('aDesc').value = item.description || '';
    document.getElementById('aFormRegion').value = item.region || '';
    document.getElementById('aFormCategory').value = item.category_id || '';
    if (quill && item.content) quill.clipboard.dangerouslyPasteHTML(item.content);

    // Images existantes
    if (state.contentTypeId) {
      const { data: imgRows } = await DB.from('content_images').select('*').eq('content_type_id', state.contentTypeId).eq('content_id', id).order('position');
      const paths = (imgRows || []).map(r => r.storage_path);
      const urls = await getSignedUrls(paths);
      state.formImages = (imgRows || []).map(r => ({ storage_path: r.storage_path, position: r.position, url: urls[r.storage_path] || '' }));
      renderImagePreviews();
    }

    // Tags
    const { data: tagLinks } = await DB.from('tag_links').select('tag_id').eq('content_id', id).eq('content_type', 'anatomie');
    state.formTagIds = (tagLinks || []).map(t => t.tag_id);
    renderTagSelector();
    document.getElementById('aBtnSave').disabled = false;
  }

  modalAnat.show();
}

async function saveItem() {
  const titre = document.getElementById('aTitre').value.trim();
  if (!titre) {
    document.getElementById('aFormError').textContent = 'Le titre est obligatoire.';
    document.getElementById('aFormError').classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('aBtnSave');
  btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement...';

  const payload = {
    titre,
    description: document.getElementById('aDesc').value.trim() || null,
    region: document.getElementById('aFormRegion').value || null,
    category_id: document.getElementById('aFormCategory').value || null,
    tags: [],
    updated_at: new Date().toISOString(),
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('anatomie').update(payload).eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
    } else {
      const { data, error } = await DB.from('anatomie').insert([{ ...payload, user_id: state.user?.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
    }
    await syncImages(recordId);
    await syncTags(recordId);
    modalAnat.hide();
    showToast(state.editingId ? 'Fiche mise à jour.' : 'Fiche créée.', 'success');
    loadItems();
  } catch (err) {
    document.getElementById('aFormError').textContent = err.message;
    document.getElementById('aFormError').classList.remove('d-none');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

async function deleteItem(id) {
  const item = state.items.find(x => x.id === id);
  const label = item?.titre || 'cette fiche';
  document.getElementById('confirmAnatMsg').textContent = `Supprimer "${label}" ? Cette action est irréversible.`;
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmAnat'));
  modal.show();
  const btn = document.getElementById('btnConfirmAnat');
  const handler = async () => {
    modal.hide();
    btn.removeEventListener('click', handler);
    const { error } = await DB.from('anatomie').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Fiche supprimée.', 'success');
    loadItems();
  };
  btn.addEventListener('click', handler);
  document.getElementById('modalConfirmAnat').addEventListener('hidden.bs.modal', () => {
    btn.removeEventListener('click', handler);
  }, { once: true });
}

/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  await window.bdbShellReady;
  initFromShell();

  modalAnat = new bootstrap.Modal(document.getElementById('modalAnat'));
  modalAnatView = new bootstrap.Modal(document.getElementById('modalAnatView'));
  modalLightbox = new bootstrap.Modal(document.getElementById('modalLightbox'));

  quill = new Quill('#aQuill', {
    theme: 'snow',
    placeholder: 'Contenu anatomique détaillé...',
    modules: { toolbar: [[{ header: [2, 3, false] }], ['bold','italic','underline'], [{ list:'ordered' },{ list:'bullet' }], ['blockquote','link'], ['clean']] },
  });
  /* Fix Quill-in-modal : height:100% collapse quand modal=display:none */
  document.querySelectorAll('.ql-container').forEach(c => c.style.height = 'auto');
  document.querySelectorAll('.ql-editor').forEach(e => { e.style.height = 'auto'; e.style.minHeight = '120px'; });

  // stopPropagation dropdowns
  document.querySelectorAll('.dropdown').forEach(el => el.addEventListener('click', e => e.stopPropagation()));

  await Promise.all([loadContentTypeAndCategories(), loadTags()]);
  await loadItems();

  // Filtres
  let debounce;
  document.getElementById('aSearch').addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(loadItems, 400); });
  document.getElementById('aRegion').addEventListener('change', loadItems);
  document.getElementById('aCategory').addEventListener('change', loadItems);

  // Tags
  document.getElementById('aTagSearch').addEventListener('input', renderTagSelector);

  // Upload zone
  const zone = document.getElementById('aImageUploadZone');
  zone.addEventListener('click', () => document.getElementById('aFileInput').click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('anat-upload-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('anat-upload-over'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('anat-upload-over'); handleImageFiles(e.dataTransfer.files); });
  document.getElementById('aFileInput').addEventListener('change', e => { handleImageFiles(e.target.files); e.target.value = ''; });

  // Save
  document.getElementById('aBtnSave').addEventListener('click', saveItem);

  document.getElementById('modalAnat').addEventListener('hidden.bs.modal', () => {
    state.formTagIds = []; state.formImages = [];
  });
});

  // ── CDS resilience helpers ─────────────────────────────────────────────
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

  function cdsShowOfflineBanner(msg) {
    let banner = document.getElementById('cdsOfflineBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cdsOfflineBanner';
      banner.className = 'cds-offline-banner';
      document.body.prepend(banner);
    }
    banner.textContent = msg || 'Service indisponible — vérifiez votre connexion.';
    banner.classList.add('show');
  }
  // ── Fin CDS resilience helpers ──────────────────────────────────────────

