/* =========================================================
   MODULE ARSENAL — BDB v2.3.0
   CTX     : CTX_ARSENAL_V2_2_1.md
   CHANTIER: CHANTIER_TECHNIQUE_V1_0_6
   Tables  : materiel · gants · casaques
             materiel_types · zones_anatomiques · zones_stockage · etageres
             content_types · content_images
   Bucket  : content-images (tiret — bug Lovable hérité, ne pas corriger)
   Auth    : window.bdbUser (source unique — INTERDIT-B2)
   Images  : window.BdbMedia (js/bdb-media.js — JS-02 zéro duplication)
   ========================================================= */

'use strict';

const DB = window.bdb;


/* ── Familles 4D ─────────────────────────────────────────── */
const FAMILLE_4D_LABELS = {
  DMI:             'DMI',
  ANCILLAIRES:     'Ancillaires',
  DM:              'DM',
  PACKS:           'Packs',
  PLIAGES:         'Pliages',
  DOUBLES_SACHETS: 'Doubles sachets',
};
const FAMILLE_4D_CLASSES = {
  DMI:             'ars-badge-dmi',
  ANCILLAIRES:     'ars-badge-ancillaires',
  DM:              'ars-badge-dm',
  PACKS:           'ars-badge-packs',
  PLIAGES:         'ars-badge-pliages',
  DOUBLES_SACHETS: 'ars-badge-doubles-sachets',
};

/* ── Inférence de zone §6 — JAMAIS SILENCIEUSE ───────────── */
const ZONE_INFERENCE_MAP = [
  { zone: 'Hanche',        keywords: ['hanche','cotyle','cotyloi','fémoral','fémur','ptk','pta','cup','stem','col fémoral'] },
  { zone: 'Genou',         keywords: ['genou','tibial','tibia','ménisque','rotule','patellaire','lca','lcp','lcm','lcl','ligament croisé','arthroscopie genou'] },
  { zone: 'Épaule',        keywords: ['épaule','humérus','huméral','coiffe','acromion','sous-acromial','glénoïde','glenoid','bankart','omarthrose'] },
  { zone: 'Rachis',        keywords: ['rachis','vertèbre','lombaire','cervical','discal','disco','laminectomie','cage intersomatique','pédicule','spondylodèse','prothèse discale'] },
  { zone: 'Pied/Cheville', keywords: ['pied','cheville','calcanéum','calcaneum','talus','métatarse','hallux','valgus','osteotomie pied'] },
  { zone: 'Poignet',       keywords: ['poignet','radius distal','cubitus','carpe','carpien','scaphoïde','semilunar'] },
  { zone: 'Main',          keywords: ['main','doigt','phalange','métacarpe','tunnel carpien','syndactylie'] },
  { zone: 'Coude',         keywords: ['coude','épicondyle','épitrochlee','olécrane','olecrane','prothèse coude'] },
];

function inferZoneSuggestion(text) {
  if (!text) return null;
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const entry of ZONE_INFERENCE_MAP) {
    for (const kw of entry.keywords) {
      const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm.includes(kwNorm)) return { zone: entry.zone, keyword: kw };
    }
  }
  return null;
}

function showZoneSuggestion(zone, keyword) {
  document.getElementById('mZoneSugZone').textContent = zone;
  document.getElementById('mZoneSugKw').textContent   = keyword;
  document.getElementById('mZoneSuggestion').classList.remove('d-none');
}
function hideZoneSuggestion() {
  document.getElementById('mZoneSuggestion').classList.add('d-none');
}
function runZoneInference() {
  if (document.getElementById('mFormZoneAnat').value) { hideZoneSuggestion(); return; }
  const result = inferZoneSuggestion(
    document.getElementById('mNom').value.trim() + ' ' +
    document.getElementById('mDescription').value.trim()
  );
  result ? showZoneSuggestion(result.zone, result.keyword) : hideZoneSuggestion();
}

/* ── État applicatif ─────────────────────────────────────── */
const state = {
  isAdmin: false,
  activeTab: 'materiel',
  materiels: [], gants: [], casaques: [],
  materielTypes: [], zonesAnat: [], zonesStock: [], etageres: [],
  editingId: null,
  /* formImages et contentTypeIds supprimés — migrés vers BdbMedia (JS-02) */
};

/* ── BdbMedia instance (js/bdb-media.js) ─────────────────── */
let media; // initialisé dans DOMContentLoaded après showToast disponible

let modalMateriel, modalGant, modalCasaque, modalLightbox;

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg, type = 'info') {
  const el = document.getElementById('toastInfo');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').className  = 'bi me-2 ' + (
    type === 'error'   ? 'bi-x-circle-fill text-danger'   :
    type === 'success' ? 'bi-check-circle-fill text-success' :
                         'bi-info-circle-fill text-primary'
  );
  document.getElementById('toastTitle').textContent =
    type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'Info';
  bootstrap.Toast.getOrCreateInstance(el).show();
}

/* ── Auth — INTERDIT-B2 : window.bdbUser source unique ──── */
function initAdminSlots() {
  if (!state.isAdmin) return;
  document.getElementById('arsenalAdminSlotMateriel').classList.remove('d-none');
  document.getElementById('arsenalAdminSlotGants').classList.remove('d-none');
  document.getElementById('arsenalAdminSlotCasaques').classList.remove('d-none');
  document.getElementById('btnNewMateriel').addEventListener('click', () => openMaterielModal());
  document.getElementById('btnNewGant').addEventListener('click',     () => openGantModal());
  document.getElementById('btnNewCasaque').addEventListener('click',  () => openCasaqueModal());
  updateAdminSlots();
}

function updateAdminSlots() {
  if (!state.isAdmin) return;
  document.getElementById('arsenalAdminSlotMateriel').classList.toggle('d-none', state.activeTab !== 'materiel');
  document.getElementById('arsenalAdminSlotGants').classList.toggle('d-none',    state.activeTab !== 'gants');
  document.getElementById('arsenalAdminSlotCasaques').classList.toggle('d-none', state.activeTab !== 'casaques');
}

/* ── Classification ──────────────────────────────────────── */
async function loadClassification() {
  const [r1, r2, r3, r4] = await Promise.all([
    DB.from('materiel_types').select('id, label').order('label'),
    DB.from('zones_anatomiques').select('id, label').order('label'),
    DB.from('zones_stockage').select('id, label').order('label'),
    DB.from('etageres').select('id, label, zone_stockage_id').order('label'),
  ]);
  state.materielTypes = r1.data || [];
  state.zonesAnat     = r2.data || [];
  state.zonesStock    = r3.data || [];
  state.etageres      = r4.data || [];

  const populate = (selId, items) => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    items.forEach(it => sel.add(new Option(it.label, it.id)));
  };
  populate('mType',         state.materielTypes);
  populate('mZoneAnat',     state.zonesAnat);
  populate('mZoneStock',    state.zonesStock);
  populate('mFormType',     state.materielTypes);
  populate('mFormZoneAnat', state.zonesAnat);
  populate('mFormZoneStock',state.zonesStock);

  /* Afficher les filtres, masquer le skeleton */
  document.getElementById('arsenalSkeletonMateriel').classList.add('d-none');
  document.getElementById('arsenalFiltersMateriel').classList.remove('d-none');
}

function updateEtagereSelect(zoneStockId) {
  const sel = document.getElementById('mFormEtagere');
  sel.innerHTML = '<option value="">— Sélectionner —</option>';
  const filtered = zoneStockId
    ? state.etageres.filter(e => e.zone_stockage_id === zoneStockId)
    : state.etageres;
  filtered.forEach(e => sel.add(new Option(e.label, e.id)));
}

/* ── Statut badge ────────────────────────────────────────── */
const STATUT_CLASSES = {
  disponible:    'bg-success',
  indisponible:  'bg-secondary',
  en_reparation: 'bg-warning text-dark',
  manquant:      'bg-danger',
};
const STATUT_LABELS = {
  disponible:    'Disponible',
  indisponible:  'Indisponible',
  en_reparation: 'En réparation',
  manquant:      'Manquant',
};

/* ═══════════════════════════════════════════════════════════
   MATÉRIEL
   ═══════════════════════════════════════════════════════════ */
async function loadMateriels() {
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_arsenal').select('*');
    const items = data || [];
    state.materiels = items;
    const grid = document.getElementById('materielGrid');
    const countEl = document.getElementById('countMateriel');
    if (countEl) countEl.textContent = items.length;
    if (!items.length) {
      grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">Aucun matériel démo</div>';
      return;
    }
    grid.innerHTML = items.map(m => {
      const statutClass = STATUT_CLASSES[m.statut] || 'bg-secondary';
      const statutLabel = STATUT_LABELS[m.statut] || m.statut;
      return `<div class="col-md-6 col-lg-4"><div class="card shadow-sm h-100 ars-card border-0"><div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center p-2"><i class="bi bi-tools"></i></div>
          <div class="flex-grow-1 min-width-0">
            <h6 class="mb-0 fw-semibold">${escHtml(m.nom)}</h6>
            ${m.reference ? `<small class="text-muted">Réf: ${escHtml(m.reference)}</small>` : ''}
          </div>
          <span class="badge ${statutClass}">${escHtml(statutLabel)}</span>
        </div>
        ${m.description ? `<p class="small text-muted mb-1">${escHtml(m.description.slice(0,100))}${m.description.length>100?'...':''}</p>` : ''}
      </div></div></div>`;
    }).join('');
    return;
  }
  const grid = document.getElementById('materielGrid');
  /* Skeleton inline grille pendant le fetch */
  grid.innerHTML = `
    <div class="col-12 placeholder-glow">
      <div class="row g-3">
        ${Array(6).fill(`
          <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <span class="placeholder col-8 rounded mb-2 d-block" style="height:20px"></span>
                <span class="placeholder col-5 rounded" style="height:14px"></span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  const search    = document.getElementById('mSearch').value.trim();
  const type      = document.getElementById('mType').value;
  const zoneAnat  = document.getElementById('mZoneAnat').value;
  const zoneStock = document.getElementById('mZoneStock').value;
  const statut    = document.getElementById('mStatut').value;
  const famille   = document.getElementById('mFamille4D').value;
  const optimopm  = document.getElementById('mOptimOPM').value.trim();

  let q = DB.from('materiel').select('*').order('created_at', { ascending: false }).limit(200);
  if (search)    q = q.or(`nom.ilike.%${search}%,reference.ilike.%${search}%,description.ilike.%${search}%`);
  if (statut)    q = q.eq('statut', statut);
  if (type)      q = q.eq('materiel_type_id', type);
  if (zoneAnat)  q = q.eq('zone_anatomique_id', zoneAnat);
  if (zoneStock) q = q.eq('zone_stockage_id', zoneStock);
  if (famille)   q = q.eq('famille_4d', famille);
  if (optimopm)  q = q.ilike('code_optimopm', `%${optimopm}%`);

  const { data, error } = await q;
  if (error) {
    showToast(error.message, 'error');
    cdsShowGridError(grid, error.message, loadMateriels);
    return;
  }

  const items   = data || [];
  const typeMap = Object.fromEntries(state.materielTypes.map(t => [t.id, t.label]));
  const zaMap   = Object.fromEntries(state.zonesAnat.map(z => [z.id, z.label]));
  const zsMap   = Object.fromEntries(state.zonesStock.map(z => [z.id, z.label]));
  const etMap   = Object.fromEntries(state.etageres.map(e => [e.id, e.label]));

  state.materiels = items;
  document.getElementById('countMateriel').textContent = items.length;

  if (!items.length) {
    grid.innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center py-5 text-muted"><i class="bi bi-tools fs-1 d-block mb-3"></i>Aucun matériel trouvé</div></div></div>`;
    return;
  }

  grid.innerHTML = items.map(m => {
    const statutClass  = STATUT_CLASSES[m.statut] || 'bg-secondary';
    const statutLabel  = STATUT_LABELS[m.statut]  || m.statut;
    const typeLabel    = m.materiel_type_id   ? typeMap[m.materiel_type_id]   : null;
    const zaLabel      = m.zone_anatomique_id ? zaMap[m.zone_anatomique_id]   : null;
    const zsLabel      = m.zone_stockage_id   ? zsMap[m.zone_stockage_id]     : null;
    const etLabel      = m.etagere_id         ? etMap[m.etagere_id]           : null;
    const border       = m.priority ? 'border-start border-danger border-3' : 'border-0';
    const f4dClass     = m.famille_4d ? (FAMILLE_4D_CLASSES[m.famille_4d] || 'bg-secondary') : null;
    const f4dLabel     = m.famille_4d ? (FAMILLE_4D_LABELS[m.famille_4d]  || m.famille_4d)   : null;
    const adminActions = state.isAdmin ? `
      <div class="d-flex gap-1 mt-2">
        <button class="btn btn-sm btn-outline-primary" type="button" data-edit-m="${escHtml(m.id)}"
                aria-label="Modifier ${escHtml(m.nom)}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-del-m="${escHtml(m.id)}"
                aria-label="Supprimer ${escHtml(m.nom)}"><i class="bi bi-trash"></i></button>
      </div>` : '';

    return `<div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 ars-card ${border}">
        <div class="card-body">
          <div class="d-flex align-items-start gap-2 mb-2">
            <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center p-2">
              <i class="bi bi-tools"></i>
            </div>
            <div class="flex-grow-1 min-width-0">
              <h6 class="mb-0 fw-semibold">${escHtml(m.nom)}</h6>
              ${m.reference   ? `<small class="text-muted">Réf: ${escHtml(m.reference)}</small>` : ''}
              ${m.code_optimopm ? `<small class="text-muted d-block"><i class="bi bi-upc me-1"></i>${escHtml(m.code_optimopm)}</small>` : ''}
            </div>
            <span class="badge ${statutClass}">${escHtml(statutLabel)}</span>
          </div>
          <div class="d-flex flex-wrap gap-1 mb-2">
            ${f4dLabel   ? `<span class="badge ${f4dClass}">${escHtml(f4dLabel)}</span>` : ''}
            ${typeLabel  ? `<span class="badge bg-light text-dark border">${escHtml(typeLabel)}</span>` : ''}
            ${zaLabel    ? `<span class="badge bg-light text-dark border"><i class="bi bi-crosshair me-1"></i>${escHtml(zaLabel)}</span>` : ''}
          </div>
          ${(zsLabel || etLabel) ? `<div class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>${[escHtml(zsLabel), etLabel ? 'Ét. ' + escHtml(etLabel) : null].filter(Boolean).join(' — ')}</div>` : ''}
          ${m.description ? `<p class="small text-muted mb-1">${escHtml(m.description.replace(/<[^>]*>/g,'').slice(0,100))}${m.description.length>100?'...':''}</p>` : ''}
          ${adminActions}
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-edit-m]').forEach(btn =>
    btn.addEventListener('click', () => openMaterielModal(btn.dataset.editM)));
  grid.querySelectorAll('[data-del-m]').forEach(btn =>
    btn.addEventListener('click', () => deleteMateriel(btn.dataset.delM)));
}

async function openMaterielModal(id = null) {
  state.editingId = id;
  media.reset();
  hideZoneSuggestion();
  document.getElementById('mFormError').classList.add('d-none');
  document.getElementById('mImagePreviews').innerHTML = '';
  ['mNom','mRef','mLocalisation','mDescription','mFormOptimOPM'].forEach(fid =>
    document.getElementById(fid).value = '');
  ['mFormType','mFormZoneAnat','mFormZoneStock','mFormEtagere','mFormFamille4D'].forEach(fid =>
    document.getElementById(fid).value = '');
  document.getElementById('mFormStatut').value = 'disponible';
  document.getElementById('mPriority').checked = false;

  if (id) {
    document.getElementById('modalMaterielLabel').textContent = 'Modifier le matériel';
    document.getElementById('mBtnSave').disabled = true;
    const { data: m } = await DB.from('materiel').select('*').eq('id', id).maybeSingle();
    if (m) {
      document.getElementById('mNom').value           = m.nom              || '';
      document.getElementById('mRef').value           = m.reference        || '';
      document.getElementById('mLocalisation').value  = m.localisation     || '';
      document.getElementById('mDescription').value   = m.description ? m.description.replace(/<[^>]*>/g,'') : '';
      document.getElementById('mFormType').value      = m.materiel_type_id  || '';
      document.getElementById('mFormZoneAnat').value  = m.zone_anatomique_id || '';
      document.getElementById('mFormZoneStock').value = m.zone_stockage_id  || '';
      document.getElementById('mFormStatut').value    = m.statut            || 'disponible';
      document.getElementById('mFormFamille4D').value = m.famille_4d        || '';
      document.getElementById('mFormOptimOPM').value  = m.code_optimopm     || '';
      document.getElementById('mPriority').checked    = m.priority          || false;
      if (m.zone_stockage_id) updateEtagereSelect(m.zone_stockage_id);
      document.getElementById('mFormEtagere').value   = m.etagere_id        || '';
      await media.loadForRecord(id, 'materiel');
      media.renderPreviews('mImagePreviews');
    }
    document.getElementById('mBtnSave').disabled = false;
  } else {
    document.getElementById('modalMaterielLabel').textContent = 'Nouveau matériel';
    updateEtagereSelect('');
  }
  modalMateriel.show();
}

async function saveMateriel() {
  const nom = document.getElementById('mNom').value.trim();
  if (!nom) {
    const el = document.getElementById('mFormError');
    el.textContent = 'Le nom est obligatoire.';
    el.classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('mBtnSave');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Enregistrement…';

  const payload = {
    nom,
    reference:          document.getElementById('mRef').value.trim()          || null,
    description:        document.getElementById('mDescription').value.trim()  || null,
    localisation:       document.getElementById('mLocalisation').value.trim() || null,
    statut:             document.getElementById('mFormStatut').value,
    materiel_type_id:   document.getElementById('mFormType').value             || null,
    zone_anatomique_id: document.getElementById('mFormZoneAnat').value         || null,
    zone_stockage_id:   document.getElementById('mFormZoneStock').value        || null,
    etagere_id:         document.getElementById('mFormEtagere').value          || null,
    famille_4d:         document.getElementById('mFormFamille4D').value        || null,
    code_optimopm:      document.getElementById('mFormOptimOPM').value.trim()  || null,
    priority:           document.getElementById('mPriority').checked,
    last_modified_by:   window.bdbUser.id,
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('materiel').update(payload)
        .eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.sync(recordId, 'materiel');
    } else {
      const { data, error } = await DB.from('materiel')
        .insert([{ ...payload, user_id: window.bdbUser.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.save(recordId, 'materiel');
    }
    modalMateriel.hide();
    showToast(state.editingId ? 'Matériel mis à jour.' : 'Matériel créé.', 'success');
    loadMateriels();
  } catch (err) {
    const el = document.getElementById('mFormError');
    el.textContent = err.message;
    el.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

async function deleteMateriel(id) {
  /* INTERDIT-C5 : confirm + await serveur, pas d'Optimistic Update */
  if (!confirm("Retirer ce matériel définitivement ? Cette action ne peut pas être annulée.")) return;
  const { error } = await DB.from('materiel').delete().eq('id', id).select();
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Matériel supprimé.', 'success');
  loadMateriels();
}

/* ═══════════════════════════════════════════════════════════
   GANTS
   ═══════════════════════════════════════════════════════════ */
async function loadGants() {
  const grid = document.getElementById('gantsGrid');
  grid.innerHTML = `
    <div class="col-12 placeholder-glow">
      <div class="row g-3">
        ${Array(4).fill(`
          <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <span class="placeholder col-7 rounded mb-2 d-block" style="height:20px"></span>
                <span class="placeholder col-4 rounded" style="height:14px"></span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  let q = DB.from('gants').select('*').order('titre').limit(200);
  const search = document.getElementById('gSearch').value.trim();
  const latex  = document.getElementById('gLatex').value;
  if (search)           q = q.or(`titre.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`);
  if (latex === 'true')  q = q.eq('sans_latex', true);
  if (latex === 'false') q = q.eq('sans_latex', false);

  const { data, error } = await q;
  if (error) { showToast(error.message, 'error'); cdsShowGridError(grid, error.message, loadGants); return; }

  const items = data || [];
  state.gants = items;
  document.getElementById('countGants').textContent = items.length;

  if (!items.length) {
    grid.innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center py-5 text-muted"><i class="bi bi-hand-index-thumb fs-1 d-block mb-3"></i>Aucun gant trouvé</div></div></div>`;
    return;
  }

  grid.innerHTML = items.map(g => {
    const adminActions = state.isAdmin ? `
      <div class="d-flex gap-1 mt-2">
        <button class="btn btn-sm btn-outline-primary" type="button" data-edit-g="${escHtml(g.id)}"
                aria-label="Modifier ${escHtml(g.titre)}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-del-g="${escHtml(g.id)}"
                aria-label="Supprimer ${escHtml(g.titre)}"><i class="bi bi-trash"></i></button>
      </div>` : '';
    return `<div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 ars-card border-0">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center p-2">
              <i class="bi bi-hand-index-thumb"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="mb-0 fw-semibold">${escHtml(g.titre)}</h6>
              <small class="text-muted">${[g.marque, g.modele].filter(Boolean).map(escHtml).join(' · ')}</small>
            </div>
            ${g.sans_latex ? '<span class="badge bg-success">Sans latex</span>' : ''}
          </div>
          <div class="small text-muted mb-1">
            ${g.matiere             ? `<span class="me-2"><i class="bi bi-layers me-1"></i>${escHtml(g.matiere)}</span>` : ''}
            ${g.tailles_disponibles ? `<span class="me-2"><i class="bi bi-rulers me-1"></i>${escHtml(g.tailles_disponibles)}</span>` : ''}
          </div>
          ${g.localisation    ? `<div class="small text-muted mb-1"><i class="bi bi-geo-alt me-1"></i>${escHtml(g.localisation)}</div>` : ''}
          ${g.remarques_usage ? `<p class="small text-muted mb-1">${escHtml(g.remarques_usage.slice(0,100))}${g.remarques_usage.length>100?'...':''}</p>` : ''}
          ${adminActions}
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-edit-g]').forEach(btn =>
    btn.addEventListener('click', () => openGantModal(btn.dataset.editG)));
  grid.querySelectorAll('[data-del-g]').forEach(btn =>
    btn.addEventListener('click', () => deleteGant(btn.dataset.delG)));
}

async function openGantModal(id = null) {
  state.editingId  = id;
  media.reset();
  document.getElementById('gFormError').classList.add('d-none');
  document.getElementById('gImagePreviews').innerHTML = '';
  ['gTitre','gMarque','gModele','gMatiere','gTailles','gCouleurs','gLocalisation','gDescription','gRemarques']
    .forEach(fid => document.getElementById(fid).value = '');
  document.getElementById('gSansLatex').checked  = false;
  document.getElementById('gPriority').checked   = false;

  if (id) {
    document.getElementById('modalGantLabel').textContent = 'Modifier le gant';
    document.getElementById('gBtnSave').disabled = true;
    const { data: g } = await DB.from('gants').select('*').eq('id', id).maybeSingle();
    if (g) {
      document.getElementById('gTitre').value       = g.titre               || '';
      document.getElementById('gMarque').value      = g.marque              || '';
      document.getElementById('gModele').value      = g.modele              || '';
      document.getElementById('gMatiere').value     = g.matiere             || '';
      document.getElementById('gTailles').value     = g.tailles_disponibles || '';
      document.getElementById('gCouleurs').value    = g.couleurs_disponibles|| '';
      document.getElementById('gLocalisation').value= g.localisation        || '';
      document.getElementById('gDescription').value = g.description ? g.description.replace(/<[^>]*>/g,'') : '';
      document.getElementById('gRemarques').value   = g.remarques_usage     || '';
      document.getElementById('gSansLatex').checked = g.sans_latex          || false;
      document.getElementById('gPriority').checked  = g.priority            || false;
      await media.loadForRecord(id, 'gants');
      media.renderPreviews('gImagePreviews');
    }
    document.getElementById('gBtnSave').disabled = false;
  } else {
    document.getElementById('modalGantLabel').textContent = 'Nouveau gant';
  }
  modalGant.show();
}

async function saveGant() {
  const titre = document.getElementById('gTitre').value.trim();
  if (!titre) {
    const el = document.getElementById('gFormError');
    el.textContent = 'Un titre est nécessaire pour continuer.';
    el.classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('gBtnSave');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Enregistrement…';

  const payload = {
    titre,
    marque:               document.getElementById('gMarque').value.trim()   || null,
    modele:               document.getElementById('gModele').value.trim()   || null,
    matiere:              document.getElementById('gMatiere').value.trim()   || null,
    tailles_disponibles:  document.getElementById('gTailles').value.trim()  || null,
    couleurs_disponibles: document.getElementById('gCouleurs').value.trim() || null,
    localisation:         document.getElementById('gLocalisation').value.trim() || null,
    description:          document.getElementById('gDescription').value.trim()  || null,
    remarques_usage:      document.getElementById('gRemarques').value.trim()    || null,
    sans_latex:           document.getElementById('gSansLatex').checked,
    priority:             document.getElementById('gPriority').checked,
    last_modified_by:     window.bdbUser.id,
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('gants').update(payload)
        .eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.sync(recordId, 'gants');
    } else {
      const { data, error } = await DB.from('gants')
        .insert([{ ...payload, user_id: window.bdbUser.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.save(recordId, 'gants');
    }
    modalGant.hide();
    showToast(state.editingId ? 'Gant mis à jour.' : 'Gant créé.', 'success');
    loadGants();
  } catch (err) {
    const el = document.getElementById('gFormError');
    el.textContent = err.message;
    el.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

async function deleteGant(id) {
  if (!confirm("Retirer ce gant définitivement ?")) return;
  const { error } = await DB.from('gants').delete().eq('id', id).select();
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Gant supprimé.', 'success');
  loadGants();
}

/* ═══════════════════════════════════════════════════════════
   CASAQUES
   ═══════════════════════════════════════════════════════════ */
async function loadCasaques() {
  const grid = document.getElementById('casaquesGrid');
  grid.innerHTML = `
    <div class="col-12 placeholder-glow">
      <div class="row g-3">
        ${Array(3).fill(`
          <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <span class="placeholder col-6 rounded mb-2 d-block" style="height:20px"></span>
                <span class="placeholder col-3 rounded" style="height:14px"></span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

  let q = DB.from('casaques').select('*').order('titre').limit(200);
  const search    = document.getElementById('cSearch').value.trim();
  const renforcee = document.getElementById('cRenforcee').value;
  if (search)              q = q.or(`titre.ilike.%${search}%,description.ilike.%${search}%`);
  if (renforcee === 'true')  q = q.eq('renforcee', true);
  if (renforcee === 'false') q = q.eq('renforcee', false);

  const { data, error } = await q;
  if (error) { showToast(error.message, 'error'); cdsShowGridError(grid, error.message, loadCasaques); return; }

  const items = data || [];
  state.casaques = items;
  document.getElementById('countCasaques').textContent = items.length;

  if (!items.length) {
    grid.innerHTML = `<div class="col-12"><div class="card border-0 shadow-sm"><div class="card-body text-center py-5 text-muted"><i class="bi bi-shield-check fs-1 d-block mb-3"></i>Aucune casaque trouvée</div></div></div>`;
    return;
  }

  grid.innerHTML = items.map(c => {
    const adminActions = state.isAdmin ? `
      <div class="d-flex gap-1 mt-2">
        <button class="btn btn-sm btn-outline-primary" type="button" data-edit-c="${escHtml(c.id)}"
                aria-label="Modifier ${escHtml(c.titre)}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-del-c="${escHtml(c.id)}"
                aria-label="Supprimer ${escHtml(c.titre)}"><i class="bi bi-trash"></i></button>
      </div>` : '';
    return `<div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 ars-card border-0">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center p-2">
              <i class="bi bi-shield-check"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="mb-0 fw-semibold">${escHtml(c.titre)}</h6>
            </div>
            ${c.renforcee ? '<span class="badge bg-warning text-dark">Renforcée</span>' : ''}
          </div>
          <div class="small text-muted mb-1">
            ${c.taille_disponible ? `<span class="me-2"><i class="bi bi-rulers me-1"></i>${escHtml(c.taille_disponible)}</span>` : ''}
            ${c.specialite        ? `<span class="me-2"><i class="bi bi-bookmark me-1"></i>${escHtml(c.specialite)}</span>` : ''}
          </div>
          ${c.localisation    ? `<div class="small text-muted mb-1"><i class="bi bi-geo-alt me-1"></i>${escHtml(c.localisation)}</div>` : ''}
          ${c.remarques_usage ? `<p class="small text-muted mb-1">${escHtml(c.remarques_usage.slice(0,100))}${c.remarques_usage.length>100?'...':''}</p>` : ''}
          ${adminActions}
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-edit-c]').forEach(btn =>
    btn.addEventListener('click', () => openCasaqueModal(btn.dataset.editC)));
  grid.querySelectorAll('[data-del-c]').forEach(btn =>
    btn.addEventListener('click', () => deleteCasaque(btn.dataset.delC)));
}

async function openCasaqueModal(id = null) {
  state.editingId  = id;
  media.reset();
  document.getElementById('cFormError').classList.add('d-none');
  document.getElementById('cImagePreviews').innerHTML = '';
  ['cTitre','cDescription','cCategorie','cTailleDisp','cSpecialite','cLocalisation','cRemarques']
    .forEach(fid => document.getElementById(fid).value = '');
  document.getElementById('cRenforceeForm').checked = false;
  document.getElementById('cPriority').checked      = false;

  if (id) {
    document.getElementById('modalCasaqueLabel').textContent = 'Modifier la casaque';
    document.getElementById('cBtnSave').disabled = true;
    const { data: c } = await DB.from('casaques').select('*').eq('id', id).maybeSingle();
    if (c) {
      document.getElementById('cTitre').value       = c.titre             || '';
      document.getElementById('cDescription').value = c.description ? c.description.replace(/<[^>]*>/g,'') : '';
      document.getElementById('cCategorie').value   = c.categorie         || '';
      document.getElementById('cTailleDisp').value  = c.taille_disponible || '';
      document.getElementById('cSpecialite').value  = c.specialite        || '';
      document.getElementById('cLocalisation').value= c.localisation      || '';
      document.getElementById('cRemarques').value   = c.remarques_usage   || '';
      document.getElementById('cRenforceeForm').checked = c.renforcee     || false;
      document.getElementById('cPriority').checked  = c.priority          || false;
      await media.loadForRecord(id, 'casaques');
      media.renderPreviews('cImagePreviews');
    }
    document.getElementById('cBtnSave').disabled = false;
  } else {
    document.getElementById('modalCasaqueLabel').textContent = 'Nouvelle casaque';
  }
  modalCasaque.show();
}

async function saveCasaque() {
  const titre = document.getElementById('cTitre').value.trim();
  if (!titre) {
    const el = document.getElementById('cFormError');
    el.textContent = 'Un titre est nécessaire pour continuer.';
    el.classList.remove('d-none');
    return;
  }
  const btn = document.getElementById('cBtnSave');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Enregistrement…';

  const payload = {
    titre,
    description:       document.getElementById('cDescription').value.trim()  || null,
    categorie:         document.getElementById('cCategorie').value.trim()    || null,
    taille_disponible: document.getElementById('cTailleDisp').value.trim()   || null,
    specialite:        document.getElementById('cSpecialite').value.trim()   || null,
    localisation:      document.getElementById('cLocalisation').value.trim() || null,
    remarques_usage:   document.getElementById('cRemarques').value.trim()    || null,
    renforcee:         document.getElementById('cRenforceeForm').checked,
    priority:          document.getElementById('cPriority').checked,
    last_modified_by:  window.bdbUser.id,
  };

  try {
    let recordId;
    if (state.editingId) {
      const { data, error } = await DB.from('casaques').update(payload)
        .eq('id', state.editingId).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.sync(recordId, 'casaques');
    } else {
      const { data, error } = await DB.from('casaques')
        .insert([{ ...payload, user_id: window.bdbUser.id }]).select().single();
      if (error) throw error;
      recordId = data.id;
      await media.save(recordId, 'casaques');
    }
    modalCasaque.hide();
    showToast(state.editingId ? 'Casaque mise à jour.' : 'Casaque créée.', 'success');
    loadCasaques();
  } catch (err) {
    const el = document.getElementById('cFormError');
    el.textContent = err.message;
    el.classList.remove('d-none');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
  }
}

async function deleteCasaque(id) {
  if (!confirm("Retirer cette casaque définitivement ?")) return;
  const { error } = await DB.from('casaques').delete().eq('id', id).select();
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Casaque supprimée.', 'success');
  loadCasaques();
}

/* ═══════════════════════════════════════════════════════════
   ONGLETS
   ═══════════════════════════════════════════════════════════ */
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('#arsenalTabs .nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
    btn.setAttribute('aria-selected', btn.dataset.tab === tab);
  });
  document.getElementById('tab-materiel').classList.toggle('d-none', tab !== 'materiel');
  document.getElementById('tab-gants').classList.toggle('d-none',    tab !== 'gants');
  document.getElementById('tab-casaques').classList.toggle('d-none', tab !== 'casaques');
  updateAdminSlots();
  if (tab === 'materiel' && !state.materiels.length) loadMateriels();
  if (tab === 'gants'    && !state.gants.length)     loadGants();
  if (tab === 'casaques' && !state.casaques.length)  loadCasaques();
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* Race condition corrigée v2.2.0 — bdbShellReady AVANT window.bdbUser (CTX §9) */
  await window.bdbShellReady;

  state.isAdmin = window.bdbUser?.isAdmin ?? false;

  /* BdbMedia — instance unique module avec callback toast (JS-02) */
  media = new window.BdbMedia({ notify: showToast });

  modalMateriel = new bootstrap.Modal(document.getElementById('modalMateriel'));
  modalGant     = new bootstrap.Modal(document.getElementById('modalGant'));
  modalCasaque  = new bootstrap.Modal(document.getElementById('modalCasaque'));
  modalLightbox = new bootstrap.Modal(document.getElementById('modalLightbox'));

  document.querySelectorAll('.dropdown').forEach(el =>
    el.addEventListener('click', e => e.stopPropagation()));

  initAdminSlots();

  await Promise.all([media.loadContentTypeIds(), loadClassification()]);
  await loadMateriels();

  /* ── Tabs ── */
  document.querySelectorAll('#arsenalTabs .nav-link').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  /* ── Filtres matériel ── */
  let mDebounce, oDebounce;
  document.getElementById('mSearch').addEventListener('input', () => {
    clearTimeout(mDebounce); mDebounce = setTimeout(loadMateriels, 400);
  });
  document.getElementById('mOptimOPM').addEventListener('input', () => {
    clearTimeout(oDebounce); oDebounce = setTimeout(loadMateriels, 400);
  });
  ['mType','mZoneAnat','mZoneStock','mStatut','mFamille4D'].forEach(id =>
    document.getElementById(id).addEventListener('change', loadMateriels));
  document.getElementById('mBtnClear').addEventListener('click', () => {
    ['mSearch','mType','mZoneAnat','mZoneStock','mStatut','mFamille4D','mOptimOPM'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    loadMateriels();
  });
  document.getElementById('mFormZoneStock').addEventListener('change', e =>
    updateEtagereSelect(e.target.value));

  /* ── Suggestion de zone §6 ── */
  ['mNom','mDescription'].forEach(id =>
    document.getElementById(id).addEventListener('blur', runZoneInference));
  document.getElementById('mFormZoneAnat').addEventListener('change', hideZoneSuggestion);
  document.getElementById('mBtnAppliquerZone').addEventListener('click', () => {
    const suggestedZone = document.getElementById('mZoneSugZone').textContent;
    const normSug = suggestedZone.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const match = state.zonesAnat.find(z => {
      const normZ = z.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return normZ.includes(normSug) || normSug.includes(normZ);
    });
    if (match) {
      document.getElementById('mFormZoneAnat').value = match.id;
      showToast(`Zone appliquée : ${match.label}`, 'success');
    } else {
      showToast(`Zone "${suggestedZone}" introuvable — vérifiez manuellement.`, 'info');
    }
    hideZoneSuggestion();
  });
  document.getElementById('mBtnIgnorerZone').addEventListener('click', hideZoneSuggestion);

  /* ── Filtres gants ── */
  let gDebounce;
  document.getElementById('gSearch').addEventListener('input', () => {
    clearTimeout(gDebounce); gDebounce = setTimeout(loadGants, 400);
  });
  document.getElementById('gLatex').addEventListener('change', loadGants);

  /* ── Filtres casaques ── */
  let cDebounce;
  document.getElementById('cSearch').addEventListener('input', () => {
    clearTimeout(cDebounce); cDebounce = setTimeout(loadCasaques, 400);
  });
  document.getElementById('cRenforcee').addEventListener('change', loadCasaques);

  /* ── Save buttons ── */
  document.getElementById('mBtnSave').addEventListener('click', saveMateriel);
  document.getElementById('gBtnSave').addEventListener('click', saveGant);
  document.getElementById('cBtnSave').addEventListener('click', saveCasaque);

  /* ── Upload setups (BdbMedia) ── */
  media.setupUpload('mUploadArea', 'mFileInput', 'mBtnImages', 'mImagePreviews', 'materiel', 'ars-upload-active');
  media.setupUpload('gUploadArea', 'gFileInput', 'gBtnImages', 'gImagePreviews', 'gants', 'ars-upload-active');
  media.setupUpload('cUploadArea', 'cFileInput', 'cBtnImages', 'cImagePreviews', 'casaques', 'ars-upload-active');

  /* ── Reset form images on modal close ── */
  ['modalMateriel','modalGant','modalCasaque'].forEach(id => {
    document.getElementById(id).addEventListener('hidden.bs.modal', () => {
      media.reset();
      hideZoneSuggestion();
    });
  });
});
