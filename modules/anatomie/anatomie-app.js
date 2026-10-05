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
  liaisons: [],
};

let quill, modalAnat, modalAnatView, modalLightbox;

/* ─── TOAST ──────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  document.getElementById('toastMsg').textContent = msg;
  const iconMap = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className = 'bi me-2 ' + (iconMap[type] || iconMap.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Attention' : type === 'success' ? 'Enregistré' : 'À noter';
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
  await DB.from('tag_links').delete().eq('content_id', recordId).eq('content_type', 'anatomie').select(); // UX06 : caller confirms
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
    `<button type="button" class="btn btn-sm btn-outline-secondary" data-tag-id="${escHtml(t.id)}">${escHtml(t.label_display)} <span class="badge bg-light text-muted cds-text-micro">${escHtml(t.type)}</span></button>`).join('');
  document.querySelectorAll('#aTagResults [data-tag-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.formTagIds.length >= 5) { showToast("5 tags maximum — retirez-en un pour continuer", 'error'); return; }
      state.formTagIds.push(btn.dataset.tagId);
      document.getElementById('aTagSearch').value = '';
      renderTagSelector();
    });
  });
  const selected = state.allTags.filter(t => state.formTagIds.includes(t.id));
  const el = document.getElementById('aSelectedTags');
  el.innerHTML = !selected.length ? '<span class="text-muted small">Aucun tag</span>'
    : selected.map(t => `<span class="badge bg-danger d-flex align-items-center gap-1">${escHtml(t.label_display)}
        <button type="button" class="btn-close btn-close-white p-0 cds-text-micro" data-remove="${escHtml(t.id)}"></button>
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
      <img src="${escHtml(img.url || img._local || '')}" alt="" class="cds-thumbnail-lg rounded border"/>
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
  if (remaining <= 0) { showToast("3 images maximum — retirez-en une pour continuer", 'error'); return; }
  const toProcess = Array.from(files).slice(0, remaining);
  for (const file of toProcess) {
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} dépasse 5 Mo — choisissez un fichier plus léger`, 'error'); continue; }
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
  if (toDelete.length) await DB.from('content_images').delete().in('id', toDelete.map(i => i.id)).select(); // UX06 : caller confirms
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
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_anatomie').select('*');
    state.items = data || [];
    const grid = document.getElementById('anatomieGrid');
    if (!state.items.length) { grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">Aucune fiche anatomie démo</div>'; return; }
    grid.innerHTML = state.items.map(item => renderCard(item)).join('');
    return;
  }
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
    cdsShowGridError(grid, 'Les fiches anatomie tardent à arriver — réessayez dans un instant.', loadItems);
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
    ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${escHtml(item.category.label)}</span>` /* style= toléré D-2026-03-15-T04 — couleur dynamique base */ : '';
  const regionBadge = item.region
    ? `<span class="badge bg-light text-secondary border"><i class="bi bi-geo-alt me-1"></i>${escHtml(item.region)}</span>` : '';
  const tags = Array.isArray(item.tags) && item.tags.length
    ? item.tags.slice(0,3).map(t=>`<span class="badge bg-light text-dark border">#${escHtml(t)}</span>`).join('') : '';
  const menu = state.isAdmin ? `
    <div class="dropdown">
      <button class="btn btn-sm anat-card-menu" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><button class="dropdown-item" data-edit="${escHtml(item.id)}"><i class="bi bi-pencil me-2"></i>Modifier</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" data-del="${escHtml(item.id)}"><i class="bi bi-trash me-2"></i>Supprimer</button></li>
      </ul>
    </div>` : '';

  return `<div class="col-12 col-md-6 col-lg-4">
    <div class="card border-0 shadow-sm anat-card h-100 cds-clickable" data-open="${escHtml(item.id)}">
      <div class="anat-card-accent"></div>
      <div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <div class="anat-icon-wrap flex-shrink-0"><i class="bi bi-diagram-3 text-danger"></i></div>
          <div class="flex-grow-1 min-w-0">
            <h6 class="mb-1 fw-semibold text-truncate">${escHtml(item.titre)}</h6>
            <div class="d-flex flex-wrap gap-1">${regionBadge}${catBadge}</div>
          </div>
          ${menu}
        </div>
        ${item.description ? `<p class="text-muted small anat-desc mb-2">${escHtml(item.description)}</p>` : ''}
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

  document.getElementById('modalViewLabel').innerHTML = `<i class="bi bi-diagram-3 me-2 text-danger"></i>${escHtml(item.titre)}`;

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
          ? `<img src="${escHtml(urls[p])}" alt="" class="rounded border anat-view-img cds-clickable" data-src="${escHtml(urls[p])}">`
          : '').join('')}</div>
      </div>`;
    }
  }

  const catBadge = item.category ? `<span class="badge" style="background:${item.category.color}20;color:${item.category.color};border:1px solid ${item.category.color}">${escHtml(item.category.label)}</span>` /* style= toléré D-2026-03-15-T04 — couleur dynamique base */ : '';
  const regionBadge = item.region ? `<span class="badge bg-light text-secondary border"><i class="bi bi-geo-alt me-1"></i>${escHtml(item.region)}</span>` : '';
  const tagsHtml = tags.length ? `<div class="border-top pt-3"><p class="small text-muted text-uppercase fw-semibold mb-2">Tags</p><div class="d-flex flex-wrap gap-1">${tags.map(t=>`<span class="badge bg-light text-dark border">${escHtml(t.label_display)}</span>`).join('')}</div></div>` : '';

  body.innerHTML = `
    <div class="d-flex flex-wrap gap-2 mb-3">${regionBadge}${catBadge}</div>
    ${imagesHtml}
    ${item.description ? `<p class="text-muted mb-3">${escHtml(item.description)}</p>` : ''}
    ${tagsHtml}`;

  body.querySelectorAll('.anat-view-img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = img.dataset.src;
      modalLightbox.show();
    });
  });

  footer.innerHTML = `
    ${state.isAdmin ? `<button class="btn btn-outline-danger me-auto" data-edit-view="${escHtml(id)}"><i class="bi bi-pencil me-1"></i>Modifier</button>` : ''}
    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>`;
  footer.querySelector('[data-edit-view]')?.addEventListener('click', (e) => { e.currentTarget.blur(); modalAnatView.hide(); openAnatModal(id); });
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

  // Liaisons : visible seulement en mode édition
  const liaisonsSection = document.getElementById('aLiaisonsSection');
  if (liaisonsSection) liaisonsSection.classList.toggle('d-none', !id);
  renderLiaisonTokens([]);
  const resultsEl = document.getElementById('anatomie-protocole-results');
  if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.classList.add('d-none'); }
  const searchEl = document.getElementById('anatomie-protocole-search');
  if (searchEl) searchEl.value = '';

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

    // Liaisons protocoles
    await loadLiaisonsAndRender(id);

    document.getElementById('aBtnSave').disabled = false;
  }

  modalAnat.show();
}

async function saveItem() {
  const titre = document.getElementById('aTitre').value.trim();
  if (!titre) {
    document.getElementById('aFormError').textContent = 'Un titre est nécessaire pour continuer.';
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
    tags: state.allTags.filter(t => state.formTagIds.includes(t.id)).map(t => t.label_display),
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
    const { error } = await DB.from('anatomie').delete().eq('id', id).select();
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Fiche supprimée.', 'success');
    loadItems();
  };
  btn.addEventListener('click', handler);
  document.getElementById('modalConfirmAnat').addEventListener('hidden.bs.modal', () => {
    btn.removeEventListener('click', handler);
  }, { once: true });
}

/* ─── LIAISONS (bdb_liaisons ↔ thesaurus_protocoles) ─────── */
async function loadLiaisons(anatomieId) {
  const { data, error } = await DB
    .from('bdb_liaisons')
    .select('id, protocole_id, thesaurus_protocoles(id_protocole, libelle_cible)')
    .eq('source_module', 'anatomie')
    .eq('source_id', anatomieId);
  if (error) throw new Error('Liaisons : ' + error.message);
  return data || [];
}

async function loadLiaisonsAndRender(anatomieId) {
  state.liaisons = await loadLiaisons(anatomieId);
  renderLiaisonTokens(state.liaisons);
}

async function lierProtocole(anatomieId, protocoleId) {
  const { data, error } = await DB
    .from('bdb_liaisons')
    .insert({ source_module: 'anatomie', source_id: anatomieId, protocole_id: protocoleId, created_by: state.user?.id })
    .select();
  if (error) throw new Error('Liaison : ' + error.message);
  return data;
}

async function delierProtocole(liaisonId) {
  const { data, error } = await DB
    .from('bdb_liaisons')
    .delete()
    .eq('id', liaisonId)
    .select();
  if (error) throw new Error('Délier : ' + error.message);
  return data;
}

async function rechercherProtocoles(query) {
  const { data, error } = await DB
    .from('thesaurus_protocoles')
    .select('id, id_protocole, libelle_cible')
    .ilike('libelle_cible', `%${query}%`)
    .order('libelle_cible')
    .limit(10);
  if (error) throw new Error('Recherche protocoles : ' + error.message);
  return data || [];
}

function renderLiaisonTokens(liaisons) {
  const list = document.getElementById('anatomie-liaisons-list');
  const empty = document.getElementById('anatomie-liaisons-empty');
  if (!list) return;
  if (!liaisons.length) {
    list.innerHTML = '';
    if (empty) { empty.classList.remove('d-none'); list.appendChild(empty); }
    return;
  }
  if (empty) empty.classList.add('d-none');
  list.innerHTML = liaisons.map(l => {
    const p = l.thesaurus_protocoles;
    const lbl = p ? `${escHtml(p.libelle_cible)} (${escHtml(p.id_protocole)})` : escHtml(l.protocole_id);
    return `<span class="badge bg-primary d-inline-flex align-items-center gap-1 me-1 mb-1 anat-liaison-token" data-liaison-id="${escHtml(l.id)}">
      ${lbl}
      <button class="btn-close btn-close-white"
              data-action="unlink" data-liaison-id="${escHtml(l.id)}" aria-label="Délier"></button>
    </span>`;
  }).join('');
}

function renderProtocoleResults(results) {
  const container = document.getElementById('anatomie-protocole-results');
  if (!container) return;
  if (!results.length) {
    container.innerHTML = `<div class="list-group-item text-muted small">Aucun résultat</div>`;
    container.classList.remove('d-none');
    return;
  }
  container.innerHTML = results.map(p =>
    `<button type="button" class="list-group-item list-group-item-action py-1 small"
             data-action="link-protocole" data-protocole-id="${escHtml(p.id)}">
      <strong>${escHtml(p.libelle_cible)}</strong>
      <span class="text-muted ms-1">${escHtml(p.id_protocole)}</span>
    </button>`
  ).join('');
  container.classList.remove('d-none');
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

  // Liaisons — délégation sur #modalAnat
  document.getElementById('modalAnat').addEventListener('click', async e => {
    const unlinkBtn = e.target.closest('[data-action="unlink"]');
    if (unlinkBtn) {
      const liaisonId = unlinkBtn.dataset.liaisonId;
      try {
        await delierProtocole(liaisonId);
        await loadLiaisonsAndRender(state.editingId);
      } catch (err) { showToast(err.message, 'error'); }
      return;
    }
    const linkBtn = e.target.closest('[data-action="link-protocole"]');
    if (linkBtn) {
      const protocoleId = linkBtn.dataset.protocoleId;
      try {
        await lierProtocole(state.editingId, protocoleId);
        await loadLiaisonsAndRender(state.editingId);
        const resultsEl = document.getElementById('anatomie-protocole-results');
        if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.classList.add('d-none'); }
        const searchEl = document.getElementById('anatomie-protocole-search');
        if (searchEl) searchEl.value = '';
      } catch (err) { showToast(err.message, 'error'); }
      return;
    }
  });

  // Picker protocoles — debounce
  let protocoleDebounce;
  document.getElementById('anatomie-protocole-search')?.addEventListener('input', e => {
    clearTimeout(protocoleDebounce);
    const q = e.target.value.trim();
    if (!q) {
      const c = document.getElementById('anatomie-protocole-results');
      if (c) { c.innerHTML = ''; c.classList.add('d-none'); }
      return;
    }
    protocoleDebounce = setTimeout(async () => {
      try {
        const results = await rechercherProtocoles(q);
        renderProtocoleResults(results);
      } catch (err) { showToast(err.message, 'error'); }
    }, 350);
  });

  document.getElementById('btn-protocole-search')?.addEventListener('click', async () => {
    const q = document.getElementById('anatomie-protocole-search')?.value.trim();
    if (!q) return;
    try {
      const results = await rechercherProtocoles(q);
      renderProtocoleResults(results);
    } catch (err) { showToast(err.message, 'error'); }
  });

  document.getElementById('modalAnat').addEventListener('hidden.bs.modal', () => {
    state.formTagIds = []; state.formImages = []; state.liaisons = [];
    const resultsEl = document.getElementById('anatomie-protocole-results');
    if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.classList.add('d-none'); }
  });

  // ============================================================
  // SECTION IA — Générateur de prompt anatomique
  // ============================================================

  const iaState = {
    protocoleId:    null,
    protocoleLabel: null,
    protocoleCode:  null,
    htmlGenere:     null,
  };

  // --- Picker protocole ---
  let iaSearchTimer;
  document.getElementById('ia-protocole-search')
    ?.addEventListener('input', (e) => {
      clearTimeout(iaSearchTimer);
      const q = e.target.value.trim();
      const resultsEl = document.getElementById('ia-protocole-results');
      if (q.length < 2) { resultsEl.classList.add('d-none'); return; }
      iaSearchTimer = setTimeout(async () => {
        const { data } = await DB
          .from('thesaurus_protocoles')
          .select('id, id_protocole, libelle_cible, zone_anat')
          .ilike('libelle_cible', `%${q}%`)
          .order('libelle_cible')
          .limit(8);
        if (!data?.length) {
          resultsEl.innerHTML =
            '<div class="list-group-item text-muted small">Aucun résultat</div>';
          resultsEl.classList.remove('d-none');
          return;
        }
        resultsEl.innerHTML = data.map(p =>
          `<button class="list-group-item list-group-item-action small"
                  data-action="ia-select-protocole"
                  data-id="${escHtml(p.id)}"
                  data-label="${escHtml(p.libelle_cible)}"
                  data-code="${escHtml(p.id_protocole)}">
            <span class="badge bg-secondary me-2">${escHtml(p.id_protocole)}</span>
            ${escHtml(p.libelle_cible)}
            ${p.zone_anat
              ? `<span class="text-muted ms-2 small">— ${escHtml(p.zone_anat)}</span>`
              : ''}
          </button>`
        ).join('');
        resultsEl.classList.remove('d-none');
      }, 300);
    });

  // Sélection
  document.getElementById('ia-protocole-results')
    ?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="ia-select-protocole"]');
      if (!btn) return;
      iaState.protocoleId    = btn.dataset.id;
      iaState.protocoleLabel = btn.dataset.label;
      iaState.protocoleCode  = btn.dataset.code;
      document.getElementById('ia-protocole-search').value = '';
      document.getElementById('ia-protocole-search').classList.add('d-none');
      document.getElementById('ia-protocole-results').classList.add('d-none');
      document.getElementById('ia-protocole-badge').textContent =
        `${btn.dataset.code} — ${btn.dataset.label}`;
      document.getElementById('ia-protocole-selected').classList.remove('d-none');
      document.getElementById('btn-ia-preparer').disabled = false;
      document.getElementById('ia-prompt-result').classList.add('d-none');
    });

  // Reset picker
  document.getElementById('btn-ia-protocole-clear')?.addEventListener('click', () => {
    iaState.protocoleId    = null;
    iaState.protocoleLabel = null;
    iaState.protocoleCode  = null;
    document.getElementById('ia-protocole-selected').classList.add('d-none');
    document.getElementById('ia-protocole-search').classList.remove('d-none');
    document.getElementById('ia-protocole-search').value = '';
    document.getElementById('btn-ia-preparer').disabled = true;
    document.getElementById('ia-prompt-result').classList.add('d-none');
    document.getElementById('ia-error').classList.add('d-none');
  });

  // --- Préparer le prompt ---
  document.getElementById('btn-ia-preparer')?.addEventListener('click', async () => {
    if (!iaState.protocoleId) return;

    document.getElementById('ia-loading').classList.remove('d-none');
    document.getElementById('ia-error').classList.add('d-none');
    document.getElementById('ia-prompt-result').classList.add('d-none');

    try {
      // 1. Fetch protocole complet
      const { data: p, error: pErr } = await DB
        .from('thesaurus_protocoles')
        .select(`
          id_protocole, libelle_cible, zone_anat, cat_parent,
          specialite, pathologie, alertes, synonymes_recherche,
          codes_ccam, definition_expert, pareto
        `)
        .eq('id', iaState.protocoleId)
        .single();
      if (pErr) throw new Error('Protocole : ' + pErr.message);

      // 2. Fetch détails CCAM
      let ccamLines = 'Aucun code CCAM associé';
      if (p.codes_ccam) {
        const codes = p.codes_ccam.split(/[,|]/).map(c => c.trim()).filter(Boolean);
        if (codes.length) {
          const { data: ccamData } = await DB
            .from('referentiel_ccam')
            .select('code_ccam, libelle, chapitre_libelle, section')
            .in('code_ccam', codes);
          if (ccamData?.length) {
            ccamLines = ccamData
              .map(c => `  - ${c.code_ccam} : ${c.libelle}\n    (${c.chapitre_libelle}${c.section ? ' > ' + c.section : ''})`)
              .join('\n');
          }
        }
      }

      // 3. Fetch fiches anatomie déjà liées (pour info)
      const { data: liaisonsExist } = await DB
        .from('bdb_liaisons')
        .select('source_id, anatomie(titre)')
        .eq('source_module', 'anatomie')
        .eq('protocole_id', iaState.protocoleId);
      const liaisonsInfo = liaisonsExist?.length
        ? liaisonsExist.map(l => `  - ${l.anatomie?.titre || 'sans titre'}`).join('\n')
        : '  Aucune fiche anatomique encore liée à ce protocole.';

      // 4. Construire le prompt
      const prompt = `# Génération d'une fiche de rappel anatomique BDB

## Contexte projet
BDB (Bible de Bloc) — application knowledge management bloc opératoire.
Stack : HTML/CSS vanilla + Bootstrap 5.3.2 + Supabase.
Chaque module a un périmètre strict. Ce prompt génère UNIQUEMENT du contenu anatomique.

## Protocole source
- **Identifiant** : ${p.id_protocole}
- **Libellé** : ${p.libelle_cible}
- **Zone anatomique** : ${p.zone_anat || 'non précisée'}
- **Catégorie** : ${p.cat_parent || 'non précisée'}
- **Spécialité** : ${p.specialite || 'non précisée'}
- **Fréquence** : ${p.pareto || 'non précisée'}
- **Pathologie traitée** : ${p.pathologie || 'non précisée'}
- **Alertes connues** : ${p.alertes || 'aucune'}
- **Synonymes / jargon** : ${p.synonymes_recherche || 'aucun'}
- **Définition expert** : ${p.definition_expert || 'non renseignée'}

## Codes CCAM associés
${ccamLines}

## Fiches anatomiques déjà existantes sur ce protocole
${liaisonsInfo}

---

## BLOC A — Fiche anatomique (HTML)

Produis UNIQUEMENT le contenu anatomique pur pour ce protocole.

**Public cible** : IBODE expérimenté. Ton clinique, précis, opérationnel.
**Format** : HTML Bootstrap 5.3.2 + bi-* icons. Pas de html/head/body. Pas de markdown.

**Contenu attendu :**
1. **Anatomie régionale** — structures de la région POUR CE protocole spécifique.
   Pas une anatomie générale. Ce qui est utile pour comprendre CE geste.
2. **Repères anatomiques** — osseux, tendineux, vasculaires, nerveux.
   Ceux utilisés pour l'abord et la navigation chirurgicale.
3. **Structures à risque anatomiques** — ce qui EXISTE dans la région et peut être lésé.
   3 colonnes Bootstrap : Vaisseaux | Nerfs | Autres structures.
4. **Variantes anatomiques** — si pertinentes pour ce protocole.

**NE PAS INCLURE dans ce bloc :**
- Installation du patient (décubitus, garrot, table) → appartient au module Installation
- Instruments et matériel (stripper, foret, implants) → appartient au module Arsenal
- Étapes opératoires et gestes chirurgicaux → appartient au module Fiches
- Vigilances instrumentiste/panseur per-op → appartient au module Fiches
- Voies d'abord chirurgicales → appartient au module Fiches

**Classes Bootstrap** : card, card-header, card-body, mb-4, list-group,
list-group-item, table table-sm table-hover, row, col-md-4, g-3,
alert alert-warning, bi bi-geo-alt, bi bi-crosshair, bi bi-exclamation-triangle

---

## BLOC B — JSON harvest (candidats pour les autres modules)

RÈGLE ABSOLUE SUR LE SÉPARATEUR :
Après le HTML du Bloc A, insère EXACTEMENT cette ligne seule sur une ligne vide :
---JSON---
(trois tirets, le mot JSON en majuscules, trois tirets — pas de commentaire HTML,
pas de backticks, pas d'espace avant ou après, sur sa propre ligne)

Puis produis le JSON harvest.
Identifie tout ce qui appartient aux AUTRES modules BDB.

Format STRICT :
\`\`\`json
{
  "installation": [
    "description courte d un element installation (position, garrot, table...)"
  ],
  "arsenal": [
    "nom d un instrument, implant ou materiel identifie"
  ],
  "fiches": [
    "etape operatoire ou geste chirurgical identifie"
  ],
  "glossaire": [
    { "terme": "terme a definir", "categorie": "ANATOMIE|MATERIEL|TECHNIQUE|EPONYME" }
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "synonymes_thesaurus": ["synonyme a ajouter au thesaurus"],
  "alertes_thesaurus": "texte court si alerte utile a ajouter au protocole ou vide",
  "ambigus": [
    { "contenu": "ce contenu", "modules_possibles": ["module1", "module2"], "raison": "pourquoi ambigu" }
  ],
  "orphelins": [
    { "contenu": "ce contenu", "raison": "aucun module BDB existant ne couvre ceci" }
  ]
}
\`\`\`

**Règle absolue :** tout ce qui n est pas purement anatomique DOIT apparaître dans le JSON.
Les listes peuvent être vides [] si rien identifié pour ce module.
---JSON--- doit séparer le HTML du JSON.`;

      document.getElementById('ia-prompt-textarea').value = prompt;
      document.getElementById('ia-prompt-result').classList.remove('d-none');

    } catch (err) {
      const errEl = document.getElementById('ia-error');
      errEl.textContent = 'Erreur : ' + err.message;
      errEl.classList.remove('d-none');
    } finally {
      document.getElementById('ia-loading').classList.add('d-none');
    }
  });

  // --- Copier ---
  document.getElementById('btn-ia-copier')?.addEventListener('click', () => {
    const ta = document.getElementById('ia-prompt-textarea');
    navigator.clipboard.writeText(ta.value).then(() => {
      const confirm = document.getElementById('ia-copie-confirm');
      confirm.classList.remove('d-none');
      setTimeout(() => confirm.classList.add('d-none'), 3000);
    });
  });

  // --- Activer parser quand du texte est collé ---
  document.getElementById('ia-retour-textarea')
    ?.addEventListener('input', (e) => {
      const hasContent = e.target.value.trim().length > 20;
      document.getElementById('btn-ia-parser').disabled = !hasContent;
    });

  // --- Parser le retour Claude (HTML + ---JSON--- + JSON) ---
  document.getElementById('btn-ia-parser')?.addEventListener('click', () => {
    const retour = document.getElementById('ia-retour-textarea').value;
    // Accepter les deux formes de séparateur
    const separateur = retour.includes('---JSON---') ? '---JSON---'
                     : retour.includes('<!--JSON-->') ? '<!--JSON-->'
                     : null;

    if (!separateur) {
      // Pas de séparateur — tout en HTML
      afficherBlocHtml(retour.trim(), '');
      document.getElementById('ia-bloc-harvest').classList.add('d-none');
      return;
    }

    const idx = retour.indexOf(separateur);

    const htmlBrut = retour.substring(0, idx).trim();
    const jsonBrut = retour.substring(idx + separateur.length).trim();
    afficherBlocHtml(htmlBrut, jsonBrut);
  });

  function afficherBlocHtml(html, jsonBrut) {
    document.getElementById('ia-titre').value =
      `Rappel anatomique — ${iaState.protocoleLabel || ''}`;
    document.getElementById('ia-region').value = '';
    // Injection directe — admin uniquement
    document.getElementById('ia-preview').innerHTML = html;
    document.getElementById('ia-bloc-html').classList.remove('d-none');
    iaState.htmlGenere = html;

    if (jsonBrut) {
      try {
        const jsonClean = jsonBrut
          .replace(/^```json\s*/i, '')
          .replace(/```\s*$/, '')
          .trim();
        const harvest = JSON.parse(jsonClean);
        afficherHarvest(harvest);
      } catch (e) {
        document.getElementById('ia-harvest-content').innerHTML =
          `<pre class="small text-muted">${escHtml(jsonBrut)}</pre>`;
        document.getElementById('ia-bloc-harvest').classList.remove('d-none');
      }
    }
  }

  function afficherHarvest(h) {
    const modules = [
      { key: 'installation',        label: 'Installation',          icon: 'bi-person-standing', color: 'info' },
      { key: 'arsenal',             label: 'Arsenal',               icon: 'bi-box-seam',        color: 'secondary' },
      { key: 'fiches',              label: 'Fiches',                icon: 'bi-journal-text',    color: 'primary' },
      { key: 'tags',                label: 'Tags',                  icon: 'bi-tags',            color: 'success' },
      { key: 'synonymes_thesaurus', label: 'Synonymes thésaurus',   icon: 'bi-link-45deg',      color: 'warning' },
    ];

    let html = '';

    for (const m of modules) {
      const items = h[m.key];
      if (!items?.length) continue;
      html += `
        <div class="mb-3">
          <h6 class="text-${escHtml(m.color)}">
            <i class="bi ${escHtml(m.icon)} me-1"></i>${escHtml(m.label)}
          </h6>
          <ul class="list-group list-group-flush">
            ${items.map(item => `
              <li class="list-group-item py-1 small">
                ${typeof item === 'string'
                  ? escHtml(item)
                  : `<strong>${escHtml(item.terme)}</strong>
                     <span class="badge bg-light text-dark border ms-1">${escHtml(item.categorie || '')}</span>`}
              </li>`).join('')}
          </ul>
        </div>`;
    }

    if (h.glossaire?.length) {
      html += `
        <div class="mb-3">
          <h6 class="text-dark"><i class="bi bi-book me-1"></i>Glossaire</h6>
          <ul class="list-group list-group-flush">
            ${h.glossaire.map(g => `
              <li class="list-group-item py-1 small">
                <strong>${escHtml(g.terme)}</strong>
                <span class="badge bg-light text-dark border ms-1">${escHtml(g.categorie || '')}</span>
              </li>`).join('')}
          </ul>
        </div>`;
    }

    if (h.alertes_thesaurus) {
      html += `
        <div class="alert alert-warning py-2 small mb-3">
          <i class="bi bi-exclamation-triangle me-1"></i>
          <strong>Alerte thésaurus :</strong> ${escHtml(h.alertes_thesaurus)}
        </div>`;
    }

    if (h.ambigus?.length) {
      html += `
        <div class="mb-3">
          <h6 class="text-warning"><i class="bi bi-question-circle me-1"></i>Ambigus — décision Manu</h6>
          ${h.ambigus.map(a => `
            <div class="alert alert-warning py-2 small">
              <strong>${escHtml(a.contenu)}</strong><br>
              Modules possibles : ${escHtml((a.modules_possibles || []).join(', '))}<br>
              <em>${escHtml(a.raison || '')}</em>
            </div>`).join('')}
        </div>`;
    }

    if (h.orphelins?.length) {
      html += `
        <div class="mb-3">
          <h6 class="text-danger"><i class="bi bi-exclamation-octagon me-1"></i>Orphelins — module émergent ?</h6>
          ${h.orphelins.map(o => `
            <div class="alert alert-danger py-2 small">
              <strong>${escHtml(o.contenu)}</strong><br>
              <em>${escHtml(o.raison || '')}</em>
            </div>`).join('')}
        </div>`;
    }

    if (!html) {
      html = '<p class="text-muted small">Aucun candidat identifié pour les autres modules.</p>';
    }

    document.getElementById('ia-harvest-content').innerHTML = html;
    document.getElementById('ia-bloc-harvest').classList.remove('d-none');
  }

  // --- Insérer en base (Bloc A) ---
  document.getElementById('btn-ia-insert')?.addEventListener('click', async () => {
    if (!iaState.htmlGenere || !iaState.protocoleId) return;

    const titre = document.getElementById('ia-titre').value.trim();
    const region = document.getElementById('ia-region').value.trim();
    if (!titre) { showToast('Le titre est obligatoire.', 'error'); return; }

    const { data, error } = await DB
      .from('anatomie')
      .insert({
        user_id: state.user?.id,
        titre,
        region: region || null,
        description: iaState.htmlGenere,
        tags: [],
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      document.getElementById('ia-error').textContent = 'Erreur insertion : ' + error.message;
      document.getElementById('ia-error').classList.remove('d-none');
      return;
    }

    if (data?.[0]?.id) {
      await DB.from('bdb_liaisons').insert({
        source_module: 'anatomie',
        source_id: data[0].id,
        protocole_id: iaState.protocoleId,
        created_by: state.user?.id,
      }).select();
    }

    showToast('Fiche anatomique insérée et liée au protocole.', 'success');
    iaState.htmlGenere = null;
    document.getElementById('ia-bloc-html').classList.add('d-none');
    await loadItems();
  });

});



