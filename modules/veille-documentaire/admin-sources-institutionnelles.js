/**
 * admin-sources-institutionnelles.js
 * CRUD : chu_france · ecoles_sante_france · chu_sources · chu_search_templates
 * Pattern BDB admin standalone · bdbToast() + escHtml DOM
 */

'use strict';

const DB = window.bdb;

// ── Utilitaires ──────────────────────────────────────────────

const _escEl = document.createElement('span');
function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

function showState(prefix, state) {
  for (const s of ['Loading', 'Empty', 'Error', 'List', 'Content']) {
    const el = document.getElementById(prefix + s);
    if (el) el.classList.add('d-none');
  }
  const target = document.getElementById(prefix + state);
  if (target) target.classList.remove('d-none');
}

function linkIcon(url) {
  if (!url) return '';
  return `<a href="${escHtml(url)}" target="_blank" rel="noopener" class="text-muted me-1" title="${escHtml(url)}"><i class="bi bi-box-arrow-up-right"></i></a>`;
}

function renderActif(val) {
  return val
    ? '<i class="bi bi-check-circle-fill text-success"></i>'
    : '<i class="bi bi-x-circle text-muted"></i>';
}

// Enum labels
const SOURCE_TYPE_LABELS = {
  ecole_ibode: 'École IBODE', ecole_iade: 'École IADE',
  portail_formation: 'Portail formation', catalogue_formation: 'Catalogue formation',
  centre_doc: 'Centre doc', protocole: 'Protocole', fiche_metier: 'Fiche métier',
  livret_patient: 'Livret patient', rapport_activite: "Rapport d'activité", autre: 'Autre'
};
const SPE_LABELS = {
  ibode: 'IBODE', iade: 'IADE', infirmier: 'Infirmier', chirurgie: 'Chirurgie',
  anatomie: 'Anatomie', sterilisation: 'Stérilisation', anesthesie: 'Anesthésie', tous: 'Tous'
};
const ECOLE_TYPE_LABELS = {
  ifsi: 'IFSI', ibode: 'IBODE', iade: 'IADE',
  ifsi_ibode: 'IFSI+IBODE', ifsi_iade: 'IFSI+IADE', mixte: 'Mixte'
};

// ── État ─────────────────────────────────────────────────────

let allChu = [];
let allEcoles = [];
let allSources = [];
let allTpl = [];
let modals = {};

// ── Référentiels pour dropdowns ──────────────────────────────

async function loadRefs() {
  const [chuRes, ecoleRes] = await Promise.all([
    DB.from('chu_france').select('id, nom').order('nom'),
    DB.from('ecoles_sante_france').select('id, nom').order('nom')
  ]);
  allChu = chuRes.data || [];
  allEcoles = ecoleRes.data || [];
}

function populateChuDropdowns() {
  const selectors = ['ecoleChu', 'sourceChu', 'tplChu', 'filterTplChu'];
  for (const id of selectors) {
    const sel = document.getElementById(id);
    if (!sel) continue;
    const first = sel.options[0].outerHTML;
    sel.innerHTML = first + allChu.map(c =>
      `<option value="${c.id}">${escHtml(c.nom)}</option>`
    ).join('');
  }
}

function populateEcoleDropdowns() {
  const selectors = ['sourceEcole', 'tplEcole'];
  for (const id of selectors) {
    const sel = document.getElementById(id);
    if (!sel) continue;
    const first = sel.options[0].outerHTML;
    sel.innerHTML = first + allEcoles.map(e =>
      `<option value="${e.id}">${escHtml(e.nom)}</option>`
    ).join('');
  }
}

// ══════════════════════════════════════════════════════════════
//  CHU
// ══════════════════════════════════════════════════════════════

async function loadChu() {
  showState('chu', 'Loading');
  const { data, error } = await DB.from('chu_france')
    .select('*').order('nom');
  if (error) {
    document.getElementById('chuError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    showState('chu', 'Error'); return;
  }
  if (!data?.length) { showState('chu', 'Empty'); return; }
  allChu = data;
  document.getElementById('badgeChu').textContent = data.length;
  populateRegionFilter(data);
  renderChu(data);
  showState('chu', 'List');
  populateChuDropdowns();
}

function populateRegionFilter(chus) {
  const sel = document.getElementById('filterRegion');
  const regions = [...new Set(chus.map(c => c.region).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Toutes régions</option>' +
    regions.map(r => `<option value="${escHtml(r)}">${escHtml(r)}</option>`).join('');
}

function renderChu(chus) {
  document.getElementById('chuBody').innerHTML = chus.map(c => `
    <tr data-id="${c.id}">
      <td class="fw-semibold">${escHtml(c.nom)}</td>
      <td>${escHtml(c.ville || '—')}</td>
      <td><span class="badge bg-light text-dark border">${escHtml(c.region || '—')}</span></td>
      <td class="text-center text-nowrap">
        ${linkIcon(c.url)}${linkIcon(c.url_google)}${linkIcon(c.url_facebook)}${linkIcon(c.url_youtube)}
      </td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-chu" title="Modifier"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-chu" title="Supprimer"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterChu() {
  const q = document.getElementById('searchChu').value.toLowerCase().trim();
  const reg = document.getElementById('filterRegion').value;
  const filtered = allChu.filter(c => {
    if (reg && c.region !== reg) return false;
    if (!q) return true;
    return (c.nom || '').toLowerCase().includes(q) || (c.ville || '').toLowerCase().includes(q);
  });
  renderChu(filtered);
}

function openChuModal(chu) {
  document.getElementById('modalChuTitle').textContent = chu ? 'Modifier le CHU' : 'Ajouter un CHU';
  document.getElementById('chuId').value = chu?.id || '';
  document.getElementById('chuNom').value = chu?.nom || '';
  document.getElementById('chuVille').value = chu?.ville || '';
  document.getElementById('chuDept').value = chu?.departement || '';
  document.getElementById('chuRegion').value = chu?.region || '';
  document.getElementById('chuUrl').value = chu?.url || '';
  document.getElementById('chuGoogle').value = chu?.url_google || '';
  document.getElementById('chuFb').value = chu?.url_facebook || '';
  document.getElementById('chuYt').value = chu?.url_youtube || '';
  modals.chu.show();
}

async function saveChu() {
  const id = document.getElementById('chuId').value;
  const nom = document.getElementById('chuNom').value.trim();
  if (!nom) { bdbToast('Le nom est obligatoire.'); return; }
  const payload = {
    nom,
    ville: document.getElementById('chuVille').value.trim() || null,
    departement: document.getElementById('chuDept').value.trim() || null,
    region: document.getElementById('chuRegion').value.trim() || null,
    url: document.getElementById('chuUrl').value.trim() || null,
    url_google: document.getElementById('chuGoogle').value.trim() || null,
    url_facebook: document.getElementById('chuFb').value.trim() || null,
    url_youtube: document.getElementById('chuYt').value.trim() || null
  };
  let result;
  if (id) {
    result = await DB.from('chu_france').update(payload).eq('id', parseInt(id)).select();
  } else {
    result = await DB.from('chu_france').insert(payload).select();
  }
  if (result.error) { bdbToast('Erreur : ' + result.error.message); return; }
  modals.chu.hide();
  bdbToast(id ? 'CHU modifié.' : 'CHU ajouté.');
  await loadChu();
}

async function deleteChu(id) {
  if (!confirm('Supprimer ce CHU ?')) return;
  const { error } = await DB.from('chu_france').delete().eq('id', parseInt(id)).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('CHU supprimé.');
  await loadChu();
}

// ══════════════════════════════════════════════════════════════
//  ÉCOLES
// ══════════════════════════════════════════════════════════════

async function loadEcoles() {
  showState('ecoles', 'Loading');
  const { data, error } = await DB.from('ecoles_sante_france')
    .select('*').order('nom');
  if (error) {
    document.getElementById('ecolesError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    showState('ecoles', 'Error'); return;
  }
  if (!data?.length) { showState('ecoles', 'Empty'); return; }
  allEcoles = data;
  document.getElementById('badgeEcoles').textContent = data.length;
  renderEcoles(data);
  showState('ecoles', 'List');
  populateEcoleDropdowns();
}

function renderEcoles(ecoles) {
  const q = (document.getElementById('searchEcoles')?.value || '').toLowerCase().trim();
  const ft = document.getElementById('filterEcoleType')?.value || '';
  const filtered = ecoles.filter(e => {
    if (ft && e.type !== ft) return false;
    if (!q) return true;
    return (e.nom || '').toLowerCase().includes(q) || (e.ville || '').toLowerCase().includes(q);
  });
  document.getElementById('ecolesBody').innerHTML = filtered.map(e => {
    const chuNom = e.chu_nom || allChu.find(c => c.id === e.chu_id)?.nom || '—';
    return `
    <tr data-id="${e.id}">
      <td class="fw-semibold">${escHtml(e.nom)}</td>
      <td><span class="badge bg-info-subtle text-info-emphasis">${escHtml(ECOLE_TYPE_LABELS[e.type] || e.type)}</span></td>
      <td>${escHtml(e.ville || '—')}</td>
      <td><small class="text-muted">${escHtml(chuNom)}</small></td>
      <td class="text-center text-nowrap">
        ${linkIcon(e.url)}${linkIcon(e.url_google)}${linkIcon(e.url_facebook)}${linkIcon(e.url_youtube)}
      </td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-ecole" title="Modifier"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-ecole" title="Supprimer"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function openEcoleModal(ecole) {
  document.getElementById('modalEcoleTitle').textContent = ecole ? "Modifier l'école" : 'Ajouter une école';
  document.getElementById('ecoleId').value = ecole?.id || '';
  document.getElementById('ecoleNom').value = ecole?.nom || '';
  document.getElementById('ecoleType').value = ecole?.type || '';
  document.getElementById('ecoleChu').value = ecole?.chu_id || '';
  document.getElementById('ecoleVille').value = ecole?.ville || '';
  document.getElementById('ecoleDept').value = ecole?.departement || '';
  document.getElementById('ecoleRegion').value = ecole?.region || '';
  document.getElementById('ecoleRattachement').value = ecole?.rattachement || '';
  document.getElementById('ecoleUrl').value = ecole?.url || '';
  document.getElementById('ecoleGoogle').value = ecole?.url_google || '';
  document.getElementById('ecoleFb').value = ecole?.url_facebook || '';
  document.getElementById('ecoleYt').value = ecole?.url_youtube || '';
  modals.ecole.show();
}

async function saveEcole() {
  const id = document.getElementById('ecoleId').value;
  const nom = document.getElementById('ecoleNom').value.trim();
  const type = document.getElementById('ecoleType').value;
  if (!nom || !type) { bdbToast('Nom et type obligatoires.'); return; }
  const chuId = parseInt(document.getElementById('ecoleChu').value) || null;
  const payload = {
    nom, type,
    chu_id: chuId,
    chu_nom: chuId ? (allChu.find(c => c.id === chuId)?.nom || null) : null,
    ville: document.getElementById('ecoleVille').value.trim() || null,
    departement: document.getElementById('ecoleDept').value.trim() || null,
    region: document.getElementById('ecoleRegion').value.trim() || null,
    rattachement: document.getElementById('ecoleRattachement').value.trim() || null,
    url: document.getElementById('ecoleUrl').value.trim() || null,
    url_google: document.getElementById('ecoleGoogle').value.trim() || null,
    url_facebook: document.getElementById('ecoleFb').value.trim() || null,
    url_youtube: document.getElementById('ecoleYt').value.trim() || null
  };
  let result;
  if (id) {
    result = await DB.from('ecoles_sante_france').update(payload).eq('id', parseInt(id)).select();
  } else {
    result = await DB.from('ecoles_sante_france').insert(payload).select();
  }
  if (result.error) { bdbToast('Erreur : ' + result.error.message); return; }
  modals.ecole.hide();
  bdbToast(id ? 'École modifiée.' : 'École ajoutée.');
  await loadEcoles();
}

async function deleteEcole(id) {
  if (!confirm('Supprimer cette école ?')) return;
  const { error } = await DB.from('ecoles_sante_france').delete().eq('id', parseInt(id)).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('École supprimée.');
  await loadEcoles();
}

// ══════════════════════════════════════════════════════════════
//  SOURCES
// ══════════════════════════════════════════════════════════════

async function loadSources() {
  showState('sources', 'Loading');
  const { data, error } = await DB.from('chu_sources')
    .select('*').order('titre');
  if (error) {
    document.getElementById('sourcesError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    showState('sources', 'Error'); return;
  }
  if (!data?.length) { showState('sources', 'Empty'); return; }
  allSources = data;
  document.getElementById('badgeSources').textContent = data.length;
  populateSourceFilters(data);
  renderSources(data);
  showState('sources', 'List');
}

function populateSourceFilters(sources) {
  const typeSel = document.getElementById('filterSourceType');
  const types = [...new Set(sources.map(s => s.type_source))].sort();
  typeSel.innerHTML = '<option value="">Tous types</option>' +
    types.map(t => `<option value="${escHtml(t)}">${escHtml(SOURCE_TYPE_LABELS[t] || t)}</option>`).join('');

  const speSel = document.getElementById('filterSourceSpe');
  const spes = [...new Set(sources.map(s => s.specialite))].sort();
  speSel.innerHTML = '<option value="">Toutes spécialités</option>' +
    spes.map(s => `<option value="${escHtml(s)}">${escHtml(SPE_LABELS[s] || s)}</option>`).join('');
}

function renderSources(sources) {
  const q = (document.getElementById('searchSources')?.value || '').toLowerCase().trim();
  const ft = document.getElementById('filterSourceType')?.value || '';
  const fs = document.getElementById('filterSourceSpe')?.value || '';
  const filtered = sources.filter(s => {
    if (ft && s.type_source !== ft) return false;
    if (fs && s.specialite !== fs) return false;
    if (!q) return true;
    return (s.titre || '').toLowerCase().includes(q) || (s.note || '').toLowerCase().includes(q);
  });
  document.getElementById('sourcesBody').innerHTML = filtered.map(s => {
    const inst = s.chu_id
      ? escHtml(allChu.find(c => c.id === s.chu_id)?.nom || 'CHU #' + s.chu_id)
      : s.ecole_id
        ? escHtml(allEcoles.find(e => e.id === s.ecole_id)?.nom || 'École #' + s.ecole_id)
        : '—';
    return `
    <tr data-id="${s.id}">
      <td>
        <div class="fw-semibold">${escHtml(s.titre)}</div>
        <small class="text-muted">${linkIcon(s.url)}${s.url_pdf ? linkIcon(s.url_pdf) : ''}</small>
      </td>
      <td><span class="badge bg-light text-dark border">${escHtml(SOURCE_TYPE_LABELS[s.type_source] || s.type_source)}</span></td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${escHtml(SPE_LABELS[s.specialite] || s.specialite)}</span></td>
      <td><small>${inst}</small></td>
      <td class="text-center">${s.annee || '—'}</td>
      <td class="text-center">${renderActif(s.actif)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-source" title="Modifier"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-source" title="Supprimer"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function filterSources() {
  renderSources(allSources);
}

function openSourceModal(src) {
  document.getElementById('modalSourceTitle').textContent = src ? 'Modifier la source' : 'Ajouter une source';
  document.getElementById('sourceId').value = src?.id || '';
  document.getElementById('sourceTitre').value = src?.titre || '';
  document.getElementById('sourceTypeSource').value = src?.type_source || '';
  document.getElementById('sourceSpe').value = src?.specialite || 'tous';
  document.getElementById('sourceChu').value = src?.chu_id || '';
  document.getElementById('sourceEcole').value = src?.ecole_id || '';
  document.getElementById('sourceUrl').value = src?.url || '';
  document.getElementById('sourceUrlPdf').value = src?.url_pdf || '';
  document.getElementById('sourceAnnee').value = src?.annee || '';
  document.getElementById('sourcePeriodicite').value = src?.periodicite || '';
  document.getElementById('sourceVerifie').value = src?.verifie_le || '';
  document.getElementById('sourceNote').value = src?.note || '';
  document.getElementById('sourceActif').checked = src?.actif !== false;
  modals.source.show();
}

async function saveSource() {
  const id = document.getElementById('sourceId').value;
  const titre = document.getElementById('sourceTitre').value.trim();
  const type_source = document.getElementById('sourceTypeSource').value;
  const url = document.getElementById('sourceUrl').value.trim();
  if (!titre || !type_source || !url) { bdbToast('Titre, type et URL obligatoires.'); return; }
  const payload = {
    titre, type_source, url,
    specialite: document.getElementById('sourceSpe').value || 'tous',
    chu_id: parseInt(document.getElementById('sourceChu').value) || null,
    ecole_id: parseInt(document.getElementById('sourceEcole').value) || null,
    url_pdf: document.getElementById('sourceUrlPdf').value.trim() || null,
    annee: parseInt(document.getElementById('sourceAnnee').value) || null,
    periodicite: document.getElementById('sourcePeriodicite').value.trim() || null,
    verifie_le: document.getElementById('sourceVerifie').value || null,
    note: document.getElementById('sourceNote').value.trim() || null,
    actif: document.getElementById('sourceActif').checked
  };
  let result;
  if (id) {
    payload.updated_at = new Date().toISOString();
    result = await DB.from('chu_sources').update(payload).eq('id', id).select();
  } else {
    result = await DB.from('chu_sources').insert(payload).select();
  }
  if (result.error) { bdbToast('Erreur : ' + result.error.message); return; }
  modals.source.hide();
  bdbToast(id ? 'Source modifiée.' : 'Source ajoutée.');
  await loadSources();
}

async function deleteSource(id) {
  if (!confirm('Supprimer cette source ?')) return;
  const { error } = await DB.from('chu_sources').delete().eq('id', id).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('Source supprimée.');
  await loadSources();
}

// ── Export CSV Sources ───────────────────────────────────────

function exportSourcesCSV() {
  const headers = ['Titre', 'Type', 'Spécialité', 'URL', 'Année', 'Actif', 'Note'];
  const rows = [headers, ...allSources.map(s => [
    s.titre, SOURCE_TYPE_LABELS[s.type_source] || s.type_source,
    SPE_LABELS[s.specialite] || s.specialite,
    s.url, s.annee || '', s.actif ? 'Oui' : 'Non', s.note || ''
  ])];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chu_sources_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════
//  TEMPLATES
// ══════════════════════════════════════════════════════════════

async function loadTpl() {
  showState('tpl', 'Loading');
  const { data, error } = await DB.from('chu_search_templates')
    .select('*').order('label');
  if (error) {
    document.getElementById('tplError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    showState('tpl', 'Error'); return;
  }
  if (!data?.length) { showState('tpl', 'Empty'); return; }
  allTpl = data;
  document.getElementById('badgeTpl').textContent = data.length;
  renderTpl(data);
  showState('tpl', 'List');
}

function renderTpl(templates) {
  const q = (document.getElementById('searchTpl')?.value || '').toLowerCase().trim();
  const fs = document.getElementById('filterTplSpe')?.value || '';
  const fc = document.getElementById('filterTplChu')?.value || '';
  const filtered = templates.filter(t => {
    if (fs && t.specialite !== fs) return false;
    if (fc && String(t.chu_id) !== fc && String(t.ecole_id) !== fc) return false;
    if (!q) return true;
    return (t.label || '').toLowerCase().includes(q) ||
           (t.mots_cles || []).some(m => m.toLowerCase().includes(q));
  });
  document.getElementById('tplBody').innerHTML = filtered.map(t => {
    const inst = t.chu_id
      ? escHtml(allChu.find(c => c.id === t.chu_id)?.nom || 'CHU #' + t.chu_id)
      : t.ecole_id
        ? escHtml(allEcoles.find(e => e.id === t.ecole_id)?.nom || 'École #' + t.ecole_id)
        : '—';
    const kws = Array.isArray(t.mots_cles) && t.mots_cles.length
      ? t.mots_cles.slice(0, 4).map(m => `<span class="badge bg-secondary-subtle text-secondary-emphasis me-1">${escHtml(m)}</span>`).join('') +
        (t.mots_cles.length > 4 ? `<span class="text-muted small">+${t.mots_cles.length - 4}</span>` : '')
      : '<span class="text-muted">—</span>';
    return `
    <tr data-id="${t.id}">
      <td>
        <div class="fw-semibold">${escHtml(t.label)}</div>
        <small class="text-muted text-truncate d-block">${linkIcon(t.url_search)}</small>
      </td>
      <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${escHtml(SPE_LABELS[t.specialite] || t.specialite)}</span></td>
      <td><small>${inst}</small></td>
      <td>${kws}</td>
      <td class="text-center">${renderActif(t.actif)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-tpl" title="Modifier"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-tpl" title="Supprimer"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('tplCount').textContent = `${filtered.length} / ${templates.length} templates affichés`;
}

function filterTpl() {
  renderTpl(allTpl);
}

function openTplModal(tpl) {
  document.getElementById('modalTplTitle').textContent = tpl ? 'Modifier le template' : 'Ajouter un template';
  document.getElementById('tplId').value = tpl?.id || '';
  document.getElementById('tplLabel').value = tpl?.label || '';
  document.getElementById('tplSpe').value = tpl?.specialite || 'tous';
  document.getElementById('tplChu').value = tpl?.chu_id || '';
  document.getElementById('tplEcole').value = tpl?.ecole_id || '';
  document.getElementById('tplUrlSearch').value = tpl?.url_search || '';
  document.getElementById('tplMotsCles').value = Array.isArray(tpl?.mots_cles) ? tpl.mots_cles.join(', ') : '';
  document.getElementById('tplActif').checked = tpl?.actif !== false;
  modals.tpl.show();
}

async function saveTpl() {
  const id = document.getElementById('tplId').value;
  const label = document.getElementById('tplLabel').value.trim();
  const url_search = document.getElementById('tplUrlSearch').value.trim();
  if (!label || !url_search) { bdbToast('Label et URL obligatoires.'); return; }
  const mcRaw = document.getElementById('tplMotsCles').value.trim();
  const mots_cles = mcRaw ? mcRaw.split(',').map(m => m.trim()).filter(Boolean) : null;
  const payload = {
    label, url_search, mots_cles,
    specialite: document.getElementById('tplSpe').value || 'tous',
    chu_id: parseInt(document.getElementById('tplChu').value) || null,
    ecole_id: parseInt(document.getElementById('tplEcole').value) || null,
    actif: document.getElementById('tplActif').checked
  };
  let result;
  if (id) {
    result = await DB.from('chu_search_templates').update(payload).eq('id', id).select();
  } else {
    result = await DB.from('chu_search_templates').insert(payload).select();
  }
  if (result.error) { bdbToast('Erreur : ' + result.error.message); return; }
  modals.tpl.hide();
  bdbToast(id ? 'Template modifié.' : 'Template ajouté.');
  await loadTpl();
}

async function deleteTpl(id) {
  if (!confirm('Supprimer ce template ?')) return;
  const { error } = await DB.from('chu_search_templates').delete().eq('id', id).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('Template supprimé.');
  await loadTpl();
}

// Populate spécialité filter pour Templates
function populateTplSpeFilter() {
  const sel = document.getElementById('filterTplSpe');
  const spes = Object.entries(SPE_LABELS);
  sel.innerHTML = '<option value="">Toutes spécialités</option>' +
    spes.map(([k, v]) => `<option value="${k}">${escHtml(v)}</option>`).join('');
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD SYNTHÈSE
// ══════════════════════════════════════════════════════════════

async function loadDashboard() {
  showState('dash', 'Loading');
  const [chuRes, ecoleRes, srcRes, tplRes] = await Promise.all([
    DB.from('chu_france').select('region', { count: 'exact' }),
    DB.from('ecoles_sante_france').select('type', { count: 'exact' }),
    DB.from('chu_sources').select('type_source, specialite, actif', { count: 'exact' }),
    DB.from('chu_search_templates').select('specialite, actif', { count: 'exact' })
  ]);

  const chus = chuRes.data || [];
  const ecoles = ecoleRes.data || [];
  const sources = srcRes.data || [];
  const tpls = tplRes.data || [];

  // Par région
  const parRegion = {};
  chus.forEach(c => { const r = c.region || '?'; parRegion[r] = (parRegion[r] || 0) + 1; });

  // Par type école
  const parTypeEcole = {};
  ecoles.forEach(e => { const t = ECOLE_TYPE_LABELS[e.type] || e.type; parTypeEcole[t] = (parTypeEcole[t] || 0) + 1; });

  // Sources actives
  const srcActives = sources.filter(s => s.actif).length;

  // Par spécialité (templates)
  const parSpe = {};
  tpls.forEach(t => { const s = SPE_LABELS[t.specialite] || t.specialite; parSpe[s] = (parSpe[s] || 0) + 1; });

  const container = document.getElementById('dashContent');
  container.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3"><div class="card text-center"><div class="card-body"><div class="fs-2 fw-bold text-primary">${chus.length}</div><small class="text-muted">CHU</small></div></div></div>
      <div class="col-6 col-md-3"><div class="card text-center"><div class="card-body"><div class="fs-2 fw-bold text-success">${ecoles.length}</div><small class="text-muted">Écoles</small></div></div></div>
      <div class="col-6 col-md-3"><div class="card text-center"><div class="card-body"><div class="fs-2 fw-bold text-info">${srcActives} / ${sources.length}</div><small class="text-muted">Sources actives</small></div></div></div>
      <div class="col-6 col-md-3"><div class="card text-center"><div class="card-body"><div class="fs-2 fw-bold text-warning">${tpls.length}</div><small class="text-muted">Templates</small></div></div></div>
    </div>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card"><div class="card-header"><i class="bi bi-geo-alt me-2"></i>CHU par région</div>
        <ul class="list-group list-group-flush">
          ${Object.entries(parRegion).sort((a, b) => b[1] - a[1]).map(([r, n]) =>
            `<li class="list-group-item d-flex justify-content-between">${escHtml(r)}<span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">${n}</span></li>`
          ).join('')}
        </ul></div>
      </div>
      <div class="col-md-4">
        <div class="card"><div class="card-header"><i class="bi bi-mortarboard me-2"></i>Écoles par type</div>
        <ul class="list-group list-group-flush">
          ${Object.entries(parTypeEcole).sort((a, b) => b[1] - a[1]).map(([t, n]) =>
            `<li class="list-group-item d-flex justify-content-between">${escHtml(t)}<span class="badge bg-success-subtle text-success-emphasis rounded-pill">${n}</span></li>`
          ).join('')}
        </ul></div>
      </div>
      <div class="col-md-4">
        <div class="card"><div class="card-header"><i class="bi bi-search me-2"></i>Templates par spécialité</div>
        <ul class="list-group list-group-flush">
          ${Object.entries(parSpe).sort((a, b) => b[1] - a[1]).map(([s, n]) =>
            `<li class="list-group-item d-flex justify-content-between">${escHtml(s)}<span class="badge bg-warning-subtle text-warning-emphasis rounded-pill">${n}</span></li>`
          ).join('')}
        </ul></div>
      </div>
    </div>
  `;
  showState('dash', 'Content');
}

// ══════════════════════════════════════════════════════════════
//  DÉLÉGATION + INIT
// ══════════════════════════════════════════════════════════════

function initDelegation() {
  // CHU
  document.getElementById('chuBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    const id = tr?.dataset.id;
    if (btn.dataset.action === 'edit-chu') {
      const chu = allChu.find(c => String(c.id) === id);
      if (chu) openChuModal(chu);
    }
    if (btn.dataset.action === 'delete-chu') await deleteChu(id);
  });

  // Écoles
  document.getElementById('ecolesBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    const id = tr?.dataset.id;
    if (btn.dataset.action === 'edit-ecole') {
      const ecole = allEcoles.find(ec => String(ec.id) === id);
      if (ecole) openEcoleModal(ecole);
    }
    if (btn.dataset.action === 'delete-ecole') await deleteEcole(id);
  });

  // Sources
  document.getElementById('sourcesBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    const id = tr?.dataset.id;
    if (btn.dataset.action === 'edit-source') {
      const src = allSources.find(s => s.id === id);
      if (src) openSourceModal(src);
    }
    if (btn.dataset.action === 'delete-source') await deleteSource(id);
  });

  // Templates
  document.getElementById('tplBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    const id = tr?.dataset.id;
    if (btn.dataset.action === 'edit-tpl') {
      const tpl = allTpl.find(t => t.id === id);
      if (tpl) openTplModal(tpl);
    }
    if (btn.dataset.action === 'delete-tpl') await deleteTpl(id);
  });

  // Boutons toolbar
  document.getElementById('btnAddChu').addEventListener('click', () => openChuModal(null));
  document.getElementById('btnAddEcole').addEventListener('click', () => openEcoleModal(null));
  document.getElementById('btnAddSource').addEventListener('click', () => openSourceModal(null));
  document.getElementById('btnAddTpl').addEventListener('click', () => openTplModal(null));
  document.getElementById('btnSaveChu').addEventListener('click', saveChu);
  document.getElementById('btnSaveEcole').addEventListener('click', saveEcole);
  document.getElementById('btnSaveSource').addEventListener('click', saveSource);
  document.getElementById('btnSaveTpl').addEventListener('click', saveTpl);
  document.getElementById('btnExportSources').addEventListener('click', exportSourcesCSV);

  // Filtres
  document.getElementById('searchChu').addEventListener('input', filterChu);
  document.getElementById('filterRegion').addEventListener('change', filterChu);
  document.getElementById('searchEcoles').addEventListener('input', () => renderEcoles(allEcoles));
  document.getElementById('filterEcoleType').addEventListener('change', () => renderEcoles(allEcoles));
  document.getElementById('searchSources').addEventListener('input', filterSources);
  document.getElementById('filterSourceType').addEventListener('change', filterSources);
  document.getElementById('filterSourceSpe').addEventListener('change', filterSources);
  document.getElementById('searchTpl').addEventListener('input', filterTpl);
  document.getElementById('filterTplSpe').addEventListener('change', filterTpl);
  document.getElementById('filterTplChu').addEventListener('change', filterTpl);
}

function initTabs() {
  let ecolesLoaded = false, sourcesLoaded = false, tplLoaded = false, dashLoaded = false;

  document.getElementById('tab-ecoles-btn').addEventListener('shown.bs.tab', async () => {
    if (!ecolesLoaded) { await loadEcoles(); ecolesLoaded = true; }
  });
  document.getElementById('tab-sources-btn').addEventListener('shown.bs.tab', async () => {
    if (!sourcesLoaded) { await loadSources(); sourcesLoaded = true; }
  });
  document.getElementById('tab-tpl-btn').addEventListener('shown.bs.tab', async () => {
    if (!tplLoaded) { await loadTpl(); tplLoaded = true; }
  });
  document.getElementById('tab-dash-btn').addEventListener('shown.bs.tab', async () => {
    if (!dashLoaded) { await loadDashboard(); dashLoaded = true; }
  });
}

// ── Point d'entrée ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;

  if (!window.bdbUser.isCreator) {
    document.querySelector('main').innerHTML =
      '<div class="text-center py-5 text-muted"><i class="bi bi-shield-lock fs-1 d-block mb-3"></i><p>Accès réservé au créateur.</p></div>';
    return;
  }

  modals = {
    chu: new bootstrap.Modal(document.getElementById('modalChu')),
    ecole: new bootstrap.Modal(document.getElementById('modalEcole')),
    source: new bootstrap.Modal(document.getElementById('modalSource')),
    tpl: new bootstrap.Modal(document.getElementById('modalTpl'))
  };

  populateTplSpeFilter();
  initDelegation();
  initTabs();

  // Charger les refs + CHU (onglet actif)
  await loadRefs();
  populateChuDropdowns();
  populateEcoleDropdowns();
  await loadChu();
});
