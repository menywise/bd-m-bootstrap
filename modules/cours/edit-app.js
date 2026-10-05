/* =========================================================
   EDIT-APP — Cours Topographique BDB
   Table   : cours · cours_topo_blocs · cours_zones_anatomiques
             categories · tags · tag_links
   Guard   : isAdmin obligatoire — redirect si absent
   Session : #90 — 2026-04-18
   ========================================================= */

const DB = window.bdb;

const TOOLBAR_MINIMAL = [
  [{ header: [3, 4, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean']
];

const state = {
  isAdmin      : false,
  coursId      : null,
  zones        : [],
  categories   : [],
  allTags      : [],
  formTagIds   : [],
  regions      : [],   // [{ _id, id, titre, cadre_osseux, parois, contenu_vn, structures_risque }]
  contentTypeId: null,
};

const quills = {}; // containerId → Quill instance

/* ── Utilitaires ───────────────────────────────────────── */

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function showToast(msg, type = 'info') {
  document.getElementById('toastMsg').textContent  = msg;
  const icons = { error: 'bi-x-circle-fill text-danger', success: 'bi-check-circle-fill text-success', info: 'bi-info-circle-fill text-primary' };
  document.getElementById('toastIcon').className   = 'bi me-2 ' + (icons[type] || icons.info);
  document.getElementById('toastTitle').textContent = type === 'error' ? 'Attention' : type === 'success' ? 'Enregistré' : 'À noter';
  bootstrap.Toast.getOrCreateInstance(document.getElementById('toastInfo')).show();
}

function showError(msg) {
  const el = document.getElementById('eFormError');
  el.textContent = msg;
  el.classList.remove('d-none');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  document.getElementById('eFormError').classList.add('d-none');
}

/* ── Factory Quill ─────────────────────────────────────── */

function createQuill(containerId, placeholder = '') {
  const q = new Quill('#' + containerId, {
    theme      : 'snow',
    placeholder,
    modules    : { toolbar: TOOLBAR_MINIMAL },
  });
  quills[containerId] = q;
  return q;
}

function setQuillContent(containerId, html) {
  const q = quills[containerId];
  if (!q || !html) return;
  q.clipboard.dangerouslyPasteHTML(html);
}

/* ── Chargement référentiels ───────────────────────────── */

async function loadZones() {
  const { data, error } = await DB
    .from('cours_zones_anatomiques')
    .select('id, code, label, membre, ordre')
    .order('membre')
    .order('ordre');
  if (error) throw new Error('zones : ' + error.message);
  state.zones = data || [];

  const sel = document.getElementById('eZone');
  const firstOpt = sel.options[0];
  sel.innerHTML = '';
  sel.add(firstOpt);

  const MEMBRE_LABELS = {
    superieur : 'Membre supérieur',
    inferieur : 'Membre inférieur',
    rachis    : 'Rachis',
    tronc     : 'Tronc',
  };

  let currentMembre = null;
  let group = null;
  state.zones.forEach(z => {
    if (z.membre !== currentMembre) {
      currentMembre = z.membre;
      group = document.createElement('optgroup');
      group.label = MEMBRE_LABELS[z.membre] || z.membre;
      sel.appendChild(group);
    }
    const opt = new Option(z.label, z.id);
    group.appendChild(opt);
  });
}

async function loadCategories() {
  const { data: ct, error: ctErr } = await DB
    .from('content_types')
    .select('id')
    .eq('code', 'cours')
    .maybeSingle();
  if (ctErr) throw new Error('content_type : ' + ctErr.message);
  if (!ct) return;
  state.contentTypeId = ct.id;

  const { data, error } = await DB
    .from('categories')
    .select('id, label')
    .eq('content_type_id', ct.id)
    .order('label');
  if (error) throw new Error('categories : ' + error.message);
  state.categories = data || [];

  const sel = document.getElementById('eCategory');
  const firstOpt = sel.options[0];
  sel.innerHTML = '';
  sel.add(firstOpt);
  state.categories.forEach(c => sel.add(new Option(c.label, c.id)));
}

async function loadTags() {
  const { data, error } = await DB
    .from('tags')
    .select('id, label_display, type')
    .order('label_display');
  if (error) throw new Error('tags : ' + error.message);
  state.allTags = (data || []).filter(t => ['fonction', 'acronyme', 'libre'].includes(t.type));
}

/* ── Chargement cours existant ─────────────────────────── */

async function loadCours() {
  const { data: c, error } = await DB
    .from('cours')
    .select('*, cours_zones_anatomiques(id, label)')
    .eq('id', state.coursId)
    .maybeSingle();
  if (error || !c) { showError('Cours introuvable.'); return; }
  if (c.type_cours !== 'topo') {
    showError('Ce cours n\'est pas un cours topographique.');
    return;
  }

  // Remplir formulaire
  document.getElementById('eTitre').value   = c.titre       || '';
  document.getElementById('eDesc').value    = c.description || '';
  document.getElementById('eNiveau').value  = c.niveau      || 'debutant';
  document.getElementById('eCategory').value = c.category_id || '';
  document.getElementById('eStatus').value  = c.status      || 'draft';
  document.getElementById('eZone').value    = c.zone_id     || '';
  document.getElementById('breadcrumbLabel').textContent = c.titre || 'Cours topo';

  // Tags
  const { data: tagLinks } = await DB
    .from('tag_links')
    .select('tag_id')
    .eq('content_id', state.coursId)
    .eq('content_type', 'cours');
  state.formTagIds = (tagLinks || []).map(t => t.tag_id);
  renderTagSelector();

  // Blocs
  const { data: blocs, error: blocsErr } = await DB
    .from('cours_topo_blocs')
    .select('*')
    .eq('cours_id', state.coursId)
    .order('ordre');
  if (blocsErr) throw new Error('blocs : ' + blocsErr.message);

  (blocs || []).forEach(b => {
    switch (b.type_bloc) {
      case 'situation_declenchante':
        setQuillContent('qSituation', b.contenu);
        break;
      case 'region':
        addRegion(b);
        break;
      case 'points_cles_bloc':
        setQuillContent('qPoints', b.contenu);
        break;
      case 'variantes_exceptions':
        setQuillContent('qVariantes', b.contenu);
        break;
      case 'liens_modules':
        setQuillContent('qLiens', b.contenu);
        break;
    }
  });
}

/* ── Tags ──────────────────────────────────────────────── */

function renderTagSelector() {
  const search   = document.getElementById('eTagSearch').value.toLowerCase();
  const filtered = state.allTags
    .filter(t => !state.formTagIds.includes(t.id) && (!search || t.label_display.toLowerCase().includes(search)))
    .slice(0, 8);

  document.getElementById('eTagResults').innerHTML = filtered.map(t =>
    `<button type="button" class="btn btn-sm btn-outline-secondary" data-tag-id="${t.id}">
       ${escHtml(t.label_display)}
       <span class="badge bg-light text-muted cds-text-micro">${escHtml(t.type)}</span>
     </button>`
  ).join('');

  document.querySelectorAll('#eTagResults [data-tag-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.formTagIds.length >= 5) { showToast('Max 5 tags', 'error'); return; }
      state.formTagIds.push(btn.dataset.tagId);
      document.getElementById('eTagSearch').value = '';
      renderTagSelector();
    });
  });

  const selected = state.allTags.filter(t => state.formTagIds.includes(t.id));
  const el = document.getElementById('eSelectedTags');
  el.innerHTML = !selected.length
    ? '<span class="text-muted small">Aucun tag</span>'
    : selected.map(t =>
        `<span class="badge bg-warning text-dark d-flex align-items-center gap-1">
           ${escHtml(t.label_display)}
           <button type="button" class="btn-close p-0 cds-text-micro" data-remove="${t.id}"></button>
         </span>`
      ).join('');

  el.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.formTagIds = state.formTagIds.filter(id => id !== btn.dataset.remove);
      renderTagSelector();
    });
  });
}

async function syncTags(recordId) {
  await DB.from('tag_links')
    .delete()
    .eq('content_id', recordId)
    .eq('content_type', 'cours')
    .select(); // UX06 : caller confirms
  if (state.formTagIds.length > 0) {
    await DB.from('tag_links').insert(
      state.formTagIds.map(tagId => ({ content_id: recordId, content_type: 'cours', tag_id: tagId }))
    );
  }
}

/* ── Régions ───────────────────────────────────────────── */

function buildRegionCardElement(region) {
  const div = document.createElement('div');
  div.className = 'card border shadow-none';
  div.id = `regionCard_${region._id}`;
  div.innerHTML = `
    <div class="card-header bg-warning bg-opacity-10 d-flex align-items-center gap-2 py-2">
      <i class="bi bi-geo-alt text-warning"></i>
      <input type="text"
             class="form-control form-control-sm border-0 bg-transparent fw-semibold px-1"
             id="regTitre_${region._id}"
             value="${escHtml(region.titre || '')}"
             placeholder="Nom de la région (ex : région axillaire)"/>
      <button type="button"
              class="btn btn-sm btn-outline-danger ms-auto flex-shrink-0"
              data-remove-region="${region._id}"
              title="Supprimer cette région">
        <i class="bi bi-trash"></i>
      </button>
    </div>
    <div class="card-body p-3">
      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold small text-muted mb-1">
            <i class="bi bi-box text-secondary me-1"></i>Cadre osseux
          </label>
          <div id="qReg_${region._id}_cadre" class="topo-quill"></div>
        </div>
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold small text-muted mb-1">
            <i class="bi bi-layout-split text-secondary me-1"></i>Parois musculaires
          </label>
          <div id="qReg_${region._id}_parois" class="topo-quill"></div>
        </div>
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold small text-muted mb-1">
            <i class="bi bi-activity text-secondary me-1"></i>Contenu vasculo-nerveux
          </label>
          <div id="qReg_${region._id}_vn" class="topo-quill"></div>
        </div>
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold small mb-1" style="color:#fd7e14">
            <i class="bi bi-exclamation-triangle-fill me-1" style="color:#fd7e14"></i>Structures à risque
          </label>
          <div id="qReg_${region._id}_risque" class="topo-quill topo-quill-risque"></div>
        </div>
      </div>
    </div>
  `;

  div.querySelector('[data-remove-region]').addEventListener('click', () => {
    removeRegion(region._id);
  });

  return div;
}

function addRegion(existingData = null) {
  const rid = existingData?.id
    ? `${existingData.id}`.replace(/-/g, '_')
    : crypto.randomUUID().replace(/-/g, '_');

  const region = {
    _id             : rid,
    id              : existingData?.id || null,
    titre           : existingData?.titre           || '',
    cadre_osseux    : existingData?.cadre_osseux    || '',
    parois          : existingData?.parois          || '',
    contenu_vn      : existingData?.contenu_vn      || '',
    structures_risque: existingData?.structures_risque || '',
  };
  state.regions.push(region);

  const container = document.getElementById('regionsContainer');
  container.appendChild(buildRegionCardElement(region));
  document.getElementById('regionsEmpty').classList.add('d-none');

  // Quill — créés après insertion DOM
  createQuill(`qReg_${rid}_cadre`,   'Repères osseux délimitant la région…');
  createQuill(`qReg_${rid}_parois`,  'Muscles et aponévroses délimitants…');
  createQuill(`qReg_${rid}_vn`,      'Artère principale, veines satellites, nerfs…');
  createQuill(`qReg_${rid}_risque`,  '⚠ Structures à préserver impérativement…');

  // Contenu si existant
  if (region.cadre_osseux)     setQuillContent(`qReg_${rid}_cadre`,  region.cadre_osseux);
  if (region.parois)           setQuillContent(`qReg_${rid}_parois`, region.parois);
  if (region.contenu_vn)       setQuillContent(`qReg_${rid}_vn`,     region.contenu_vn);
  if (region.structures_risque) setQuillContent(`qReg_${rid}_risque`, region.structures_risque);

  updateSidebarNav();
}

function removeRegion(rid) {
  ['cadre', 'parois', 'vn', 'risque'].forEach(k => {
    delete quills[`qReg_${rid}_${k}`];
  });
  const card = document.getElementById(`regionCard_${rid}`);
  if (card) card.remove();
  state.regions = state.regions.filter(r => r._id !== rid);

  if (!state.regions.length) {
    document.getElementById('regionsEmpty').classList.remove('d-none');
  }
  updateSidebarNav();
}

function updateSidebarNav() {
  const count = state.regions.length;
  document.getElementById('badgeRegionCount').textContent = count;
  document.getElementById('badgeRegionCount').className =
    `badge ms-auto ${count ? 'bg-warning text-dark' : 'bg-secondary'}`;

  const nav = document.getElementById('navRegions');
  nav.innerHTML = state.regions.map(r => {
    const label = document.getElementById(`regTitre_${r._id}`)?.value?.trim()
      || r.titre || 'Région sans nom';
    return `<a href="#regionCard_${r._id}" class="topo-nav-link" style="font-size:0.8rem">
              <i class="bi bi-dot"></i>${escHtml(label)}
            </a>`;
  }).join('');
}

/* ── Collecte payload blocs ───────────────────────────── */

function collectBlocsPayload() {
  const blocs = [];
  let ordre = 0;

  blocs.push({
    type_bloc: 'situation_declenchante',
    ordre    : ordre++,
    contenu  : quills['qSituation']?.root.innerHTML || '',
    titre: null, cadre_osseux: null, parois: null, contenu_vn: null, structures_risque: null,
  });

  state.regions.forEach(r => {
    blocs.push({
      type_bloc        : 'region',
      ordre            : ordre++,
      titre            : document.getElementById(`regTitre_${r._id}`)?.value?.trim() || '',
      cadre_osseux     : quills[`qReg_${r._id}_cadre`]?.root.innerHTML || '',
      parois           : quills[`qReg_${r._id}_parois`]?.root.innerHTML || '',
      contenu_vn       : quills[`qReg_${r._id}_vn`]?.root.innerHTML || '',
      structures_risque: quills[`qReg_${r._id}_risque`]?.root.innerHTML || '',
      contenu: null,
    });
  });

  blocs.push({
    type_bloc: 'points_cles_bloc',
    ordre    : ordre++,
    contenu  : quills['qPoints']?.root.innerHTML || '',
    titre: null, cadre_osseux: null, parois: null, contenu_vn: null, structures_risque: null,
  });

  blocs.push({
    type_bloc: 'variantes_exceptions',
    ordre    : ordre++,
    contenu  : quills['qVariantes']?.root.innerHTML || '',
    titre: null, cadre_osseux: null, parois: null, contenu_vn: null, structures_risque: null,
  });

  blocs.push({
    type_bloc: 'liens_modules',
    ordre    : ordre++,
    contenu  : quills['qLiens']?.root.innerHTML || '',
    titre: null, cadre_osseux: null, parois: null, contenu_vn: null, structures_risque: null,
  });

  return blocs;
}

/* ── Sauvegarde ────────────────────────────────────────── */

async function saveCours() {
  hideError();
  const titre = document.getElementById('eTitre').value.trim();
  if (!titre) { showError('Un titre est requis.'); return; }

  const btns = [document.getElementById('btnSave'), document.getElementById('btnSaveTop')];
  btns.forEach(b => {
    b.disabled = true;
    b.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enregistrement…';
  });

  const payload = {
    titre,
    type_cours  : 'topo',
    description : document.getElementById('eDesc').value.trim() || null,
    zone_id     : document.getElementById('eZone').value || null,
    niveau      : document.getElementById('eNiveau').value,
    category_id : document.getElementById('eCategory').value || null,
    status      : document.getElementById('eStatus').value,
    tags        : [],
    contenu     : '',
    updated_at  : new Date().toISOString(),
  };

  try {
    let recordId;
    if (state.coursId) {
      const { data, error } = await DB.from('cours')
        .update(payload)
        .eq('id', state.coursId)
        .select()
        .single();
      if (error) throw error;
      recordId = data.id;
    } else {
      const { data, error } = await DB.from('cours')
        .insert([{ ...payload, user_id: window.bdbUser?.id }])
        .select()
        .single();
      if (error) throw error;
      recordId = data.id;
      state.coursId = recordId;
      history.replaceState({}, '', `?id=${recordId}`);
      document.getElementById('breadcrumbLabel').textContent = titre;
    }

    // Blocs : delete all + re-insert
    await DB.from('cours_topo_blocs')
      .delete()
      .eq('cours_id', recordId)
      .select(); // UX06 : caller confirms

    const blocs = collectBlocsPayload().map(b => ({ ...b, cours_id: recordId }));
    if (blocs.length) {
      const { error: blocsErr } = await DB.from('cours_topo_blocs').insert(blocs);
      if (blocsErr) throw blocsErr;
    }

    await syncTags(recordId);
    showToast(state.coursId === recordId ? 'Cours enregistré.' : 'Cours créé.', 'success');
  } catch (err) {
    showError('Erreur : ' + err.message);
  } finally {
    btns.forEach(b => {
      b.disabled = false;
      b.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
    });
  }
}

/* ── Init ──────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  state.isAdmin = window.bdbUser?.isAdmin ?? false;

  if (!state.isAdmin) {
    location.href = 'index.html';
    return;
  }

  state.coursId = getParam('id') || null;

  // Référentiels
  try {
    await Promise.all([loadZones(), loadCategories(), loadTags()]);
  } catch (err) {
    showError('Impossible de charger les référentiels : ' + err.message);
    return;
  }

  // Quill statiques (blocs non-région)
  createQuill('qSituation', 'Décrivez la situation bloc déclenchante…');
  createQuill('qPoints',    'Installation, garrot, repères palpables peropératoires…');
  createQuill('qVariantes', 'Variantes chirurgien, exceptions récurrentes, points de vigilance…');
  createQuill('qLiens',     'Liens vers fiches intervention, arsenal, préférences chirurgien…');

  // Cours existant
  if (state.coursId) {
    try {
      await loadCours();
    } catch (err) {
      showError('Erreur chargement : ' + err.message);
    }
  }

  // Events
  document.getElementById('btnAddRegion').addEventListener('click', () => addRegion());
  document.getElementById('btnSave').addEventListener('click', saveCours);
  document.getElementById('btnSaveTop').addEventListener('click', saveCours);
  document.getElementById('eTagSearch').addEventListener('input', renderTagSelector);

  // Mise à jour nav sidebar quand on tape un nom de région
  document.getElementById('regionsContainer').addEventListener('input', e => {
    if (e.target.id?.startsWith('regTitre_')) updateSidebarNav();
  });

  renderTagSelector();
});
