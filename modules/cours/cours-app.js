/* =========================================================
   MODULE COURS — BDB v2.1.0
   Table  : cours · categories · content_images · tag_links · tags
            cours_zones_anatomiques
   Bucket : content-images (sous-dossier cours/)
   Shell  : bdb-shell.js — window.bdbUser source unique
   Delta  : v2.1.0 — zones anatomiques + filtre type_cours
            + liens view.html/edit.html pour cours topo
   ========================================================= */

const DB     = window.bdb;
const BUCKET = 'content-images';

const NIVEAU_LABELS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Expert' };
const NIVEAU_COLORS = { debutant: '#198754', intermediaire: '#fd7e14', avance: '#dc3545' };
const STATUS_LABELS = { draft: 'Brouillon', published: 'Publié', archived: 'Archivé' };
const TYPE_LABELS   = { libre: 'Cours libre', topo: 'Topographie', protocole: 'Protocole', procedure: 'Procédure' };

const state = {
  isAdmin: false,
  items: [], categories: [], zones: [], allTags: [],
  editingId: null, formTagIds: [], formImages: [],
  contentTypeId: null,
};

let quill, modalCours, modalCoursView, modalLightbox;

/* ─── TOAST ──────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  document.getElementById('toastMsg').textContent = msg;
  const iconMap = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className  = 'bi me-2 ' + (iconMap[type] || iconMap.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Attention' : type === 'success' ? 'Enregistré' : 'À noter';
  bootstrap.Toast.getOrCreateInstance(document.getElementById('toastInfo')).show();
}

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ─── ZONES ANATOMIQUES (v2.1.0) ─────────────────────────── */
async function loadZones() {
  const { data, error } = await DB
    .from('cours_zones_anatomiques')
    .select('id, label, membre')
    .order('membre').order('ordre');
  if (error) throw new Error('zones : ' + error.message);
  state.zones = data || [];

  const sel = document.getElementById('cZone');
  if (!sel) return;
  const MEMBRE_LABELS = { superieur: 'Membre supérieur', inferieur: 'Membre inférieur', rachis: 'Rachis', tronc: 'Tronc' };
  sel.innerHTML = '<option value="">Toutes zones</option>';
  let currentMembre = null;
  let group = null;
  state.zones.forEach(z => {
    if (z.membre !== currentMembre) {
      currentMembre = z.membre;
      group = document.createElement('optgroup');
      group.label = MEMBRE_LABELS[z.membre] || z.membre;
      sel.appendChild(group);
    }
    group.appendChild(new Option(z.label, z.id));
  });
}

/* ─── CONTENT TYPE + CATEGORIES ─────────────────────────── */
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
  await DB.from('tag_links').delete().eq('content_id', recordId).eq('content_type', 'cours').select(); // UX06 : caller confirms
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
  container.innerHTML = state.formImages.map((img, i) =>
    `<div class="position-relative">
      <img src="${img.url || img._local}" alt="" class="cds-thumbnail-lg rounded border"/>
      <button type="button" class="btn btn-danger cours-img-remove-btn position-absolute top-0 end-0 p-0" data-idx="${i}">×</button>
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
  await DB.from('content_images').delete()
    .eq('content_type_id', state.contentTypeId).eq('content_id', recordId).select();
  const toInsert = state.formImages.filter(i => i.storage_path);
  if (toInsert.length) await DB.from('content_images').insert(
    toInsert.map((img, idx) => ({ content_type_id: state.contentTypeId, content_id: recordId, storage_path: img.storage_path, position: idx + 1 }))
  );
}

async function getSignedUrls(paths) {
  if (!paths.length) return {};
  const { data } = await DB.storage.from(BUCKET).createSignedUrls(paths, 3600);
  const map = {};
  (data || []).forEach(r => { if (r.signedUrl) map[r.path] = r.signedUrl; });
  return map;
}

/* ─── RENDU CARTE ─────────────────────────────────────────── */
function renderCard(c) {
  const isTopo  = c.type_cours === 'topo';
  const zone    = c.cours_zones_anatomiques;
  const nColor  = { debutant: '#198754', intermediaire: '#fd7e14', avance: '#dc3545' }[c.niveau] || '#6c757d';
  const nLabel  = NIVEAU_LABELS[c.niveau] || c.niveau || '';

  const viewHref = isTopo ? `view.html?id=${c.id}` : null;
  const editHref = isTopo ? `edit.html?id=${c.id}`  : null;

  // Badge type pour cours non-libre
  const typeBadge = isTopo
    ? `<span class="badge bg-warning text-dark me-1 small">Topographie</span>`
    : '';

  // Badge zone pour topo
  const zoneBadge = zone
    ? `<span class="badge bg-light text-muted border small">${escHtml(zone.label)}</span>`
    : '';

  const cardEl = document.createElement('div');
  cardEl.className = 'col-12 col-sm-6 col-xl-4';
  cardEl.innerHTML = `
    <div class="card border-0 shadow-sm h-100 ${isTopo ? 'border-start border-warning border-3' : ''}">
      <div class="card-body d-flex flex-column gap-2 p-3">
        <div class="d-flex align-items-start justify-content-between gap-2">
          <div class="flex-fill">
            ${typeBadge}${zoneBadge}
            <h6 class="mb-0 mt-1">${escHtml(c.titre)}</h6>
          </div>
          <span class="badge rounded-pill text-white flex-shrink-0" style="background:${nColor}">${escHtml(nLabel)}</span>
        </div>
        ${c.description ? `<p class="text-muted small mb-0 line-clamp-2">${escHtml(c.description)}</p>` : ''}
        <div class="mt-auto d-flex gap-2 pt-1">
          ${isTopo
            ? `<a href="${viewHref}" class="btn btn-sm btn-outline-warning flex-fill">
                 <i class="bi bi-eye me-1"></i>Consulter
               </a>
               ${state.isAdmin ? `<a href="${editHref}" class="btn btn-sm btn-outline-secondary">
                 <i class="bi bi-pencil"></i>
               </a>` : ''}`
            : `<button class="btn btn-sm btn-outline-warning flex-fill" data-view-id="${c.id}">
                 <i class="bi bi-eye me-1"></i>Consulter
               </button>
               ${state.isAdmin ? `<button class="btn btn-sm btn-outline-secondary" data-edit-id="${c.id}">
                 <i class="bi bi-pencil"></i>
               </button>` : ''}`
          }
          ${state.isAdmin ? `<button class="btn btn-sm btn-outline-danger" data-del-id="${c.id}">
            <i class="bi bi-trash"></i>
          </button>` : ''}
        </div>
      </div>
    </div>`;

  // Events pour cours libre uniquement
  cardEl.querySelector('[data-view-id]')?.addEventListener('click', () => openCoursView(c.id));
  cardEl.querySelector('[data-edit-id]')?.addEventListener('click', () => openCoursModal(c.id));
  cardEl.querySelector('[data-del-id]')?.addEventListener('click', () => deleteItem(c.id));

  return cardEl;
}

/* ─── CHARGEMENT LISTE ───────────────────────────────────── */
async function loadItems() {
  const grid = document.getElementById('coursGrid');
  grid.innerHTML = `<div class="col-12"><div class="placeholder-glow row g-3">
    ${Array(3).fill(`<div class="col-12 col-sm-6 col-xl-4"><div class="placeholder rounded" style="height:140px"></div></div>`).join('')}
  </div></div>`;

  const search   = document.getElementById('cSearch').value.trim();
  const niveau   = document.getElementById('cNiveau').value;
  const status   = document.getElementById('cStatus')?.value || '';
  const category = document.getElementById('cCategory').value;
  const typeFilt = document.getElementById('cType')?.value || '';
  const zoneFilt = document.getElementById('cZone')?.value || '';

  let q = DB.from('cours')
    .select('*, cours_zones_anatomiques(id, label, membre)')
    .order('updated_at', { ascending: false });

  if (search)   q = q.ilike('titre', `%${search}%`);
  if (niveau)   q = q.eq('niveau', niveau);
  if (status)   q = q.eq('status', status);
  if (category) q = q.eq('category_id', category);
  if (typeFilt) q = q.eq('type_cours', typeFilt);
  if (zoneFilt) q = q.eq('zone_id', zoneFilt);

  if (!state.isAdmin) q = q.eq('status', 'published');

  const { data, error } = await q;

  if (error) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">Erreur : ${escHtml(error.message)}</div></div>`;
    return;
  }

  state.items = data || [];
  grid.innerHTML = '';

  if (!state.items.length) {
    grid.innerHTML = `<div class="col-12 text-center text-muted py-5">
      <i class="bi bi-mortarboard fs-1 d-block mb-2 opacity-25"></i>
      <p>Aucun cours trouvé.</p>
    </div>`;
    return;
  }

  state.items.forEach(c => grid.appendChild(renderCard(c)));
}

/* ─── MODAL VIEW (cours libre) ───────────────────────────── */
async function openCoursView(id) {
  const body   = document.getElementById('modalViewBody');
  const footer = document.getElementById('modalViewFooter');
  body.innerHTML = `<div class="placeholder-glow">
    <span class="placeholder col-4 mb-2 rounded d-block"></span>
    <span class="placeholder col-8 mb-3 rounded d-block"></span>
    <span class="placeholder col-12 mb-1 rounded d-block"></span>
  </div>`;
  footer.innerHTML = '';
  modalCoursView.show();

  const { data: c } = await DB.from('cours').select('*').eq('id', id).maybeSingle();
  if (!c) { body.innerHTML = '<p class="text-danger">Cours introuvable.</p>'; return; }

  document.getElementById('modalViewLabel').innerHTML =
    `<i class="bi bi-mortarboard me-2 text-warning"></i>${escHtml(c.titre)}`;

  const tags = await loadTagsForRecord(id);
  const tagHtml = tags.map(t => `<span class="badge bg-light text-dark border">${escHtml(t.label_display)}</span>`).join(' ');

  body.innerHTML = `
    <div class="mb-3 d-flex flex-wrap gap-2">
      <span class="badge rounded-pill text-white" style="background:${NIVEAU_COLORS[c.niveau] || '#6c757d'}">${escHtml(NIVEAU_LABELS[c.niveau] || '')}</span>
      ${tagHtml}
    </div>
    ${c.description ? `<p class="text-muted">${escHtml(c.description)}</p>` : ''}
    <div class="cours-view-content">${DOMPurify ? DOMPurify.sanitize(c.contenu || '') : escHtml(c.contenu || '')}</div>`;

  if (state.isAdmin) {
    footer.innerHTML = `
      <button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
      <button class="btn btn-warning text-white btn-sm" id="btnViewEdit">
        <i class="bi bi-pencil me-1"></i>Modifier
      </button>`;
    footer.querySelector('#btnViewEdit').addEventListener('click', () => {
      modalCoursView.hide();
      openCoursModal(id);
    });
  } else {
    footer.innerHTML = `<button class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>`;
  }
}

/* ─── MODAL FORM (cours libre) ───────────────────────────── */
async function openCoursModal(id = null) {
  state.editingId = id;
  state.formTagIds = [];
  state.formImages = [];
  document.getElementById('cFormError').classList.add('d-none');
  document.getElementById('cTitre').value = '';
  document.getElementById('cDesc').value  = '';
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
    document.getElementById('cFormError').textContent = 'Un titre est nécessaire pour continuer.';
    document.getElementById('cFormError').classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('cBtnSave');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement...';

  const payload = {
    titre,
    type_cours  : 'libre',
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

/* ─── DELETE ─────────────────────────────────────────────── */
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
    const { error } = await DB.from('cours').delete().eq('id', id).select();
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
  await window.bdbShellReady;
  state.isAdmin = window.bdbUser?.isAdmin ?? false;

  if (state.isAdmin) {
    document.getElementById('adminActions').classList.remove('d-none');
    document.getElementById('cStatusWrapper').classList.remove('d-none');
    document.getElementById('btnNew').addEventListener('click', () => openCoursModal());
    // Lien cours topo → edit.html sans id = nouveau cours topo
    document.getElementById('btnNewTopo')?.addEventListener('click', () => {
      location.href = 'edit.html';
    });
  }

  modalCours     = new bootstrap.Modal(document.getElementById('modalCours'));
  modalCoursView = new bootstrap.Modal(document.getElementById('modalCoursView'));
  modalLightbox  = new bootstrap.Modal(document.getElementById('modalLightbox'));

  quill = new Quill('#cQuill', {
    theme: 'snow',
    placeholder: 'Rédigez le contenu du cours...',
    modules: { toolbar: [[{ header: [2, 3, false] }], ['bold','italic','underline'], [{ list:'ordered'},{list:'bullet'}], ['blockquote','link'], ['clean']] },
  });
  document.querySelectorAll('.ql-container').forEach(c => c.style.height = 'auto');
  document.querySelectorAll('.ql-editor').forEach(e => { e.style.height = 'auto'; e.style.minHeight = '120px'; });

  try {
    await Promise.all([loadContentTypeAndCategories(), loadTags(), loadZones()]);
  } catch (err) {
    cdsShowGridError(document.getElementById('coursGrid'),
      'Impossible de charger les référentiels. Rechargez la page.',
      () => location.reload());
    return;
  }
  await loadItems();

  let debounce;
  document.getElementById('cSearch').addEventListener('input',    () => { clearTimeout(debounce); debounce = setTimeout(loadItems, 400); });
  document.getElementById('cNiveau').addEventListener('change',   loadItems);
  document.getElementById('cStatus')?.addEventListener('change',  loadItems);
  document.getElementById('cCategory').addEventListener('change', loadItems);
  document.getElementById('cType')?.addEventListener('change',    () => {
    const isTopo = document.getElementById('cType').value === 'topo';
    document.getElementById('cZoneWrapper')?.classList.toggle('d-none', !isTopo);
    loadItems();
  });
  document.getElementById('cZone')?.addEventListener('change',    loadItems);
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
