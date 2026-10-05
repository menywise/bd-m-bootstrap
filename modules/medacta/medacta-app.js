// ============================================================
// medacta-app.js — Tab Consultation + init global
// VIEW V4 : jointure timestamp 1:1 — données individuelles
//   panseuse, sexe, lateralite_optim, duree_minutes individuels
//   qualite_jointure : MATCH / SANS_MATCH
//   est_reprise : segmentation PTG primaires / HINGE
// INTERDIT-B1/B2/B3 : zéro auth locale
// INTERDIT-C6 : escHtml() sur tout innerHTML DB
// ============================================================
'use strict';

// ── ÉTAT GLOBAL ───────────────────────────────────────────────
window.MDC = {
  allRows:  [],
  filtered: [],
  sortCol:  'timestamp_intervention',
  sortDir:  'desc',
  page:     1,
  pageSize: 50,
};

// ── UTILS EXPORTÉS ───────────────────────────────────────────
window.MDC.escHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

window.MDC.fmtTs = function(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d)) return String(ts);
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
};

window.MDC.fmtMois = function(d) {
  if (!d) return '—';
  const p = String(d).split('-');
  return p.length >= 2 ? `${p[1]}/${p[0]}` : d;
};

window.MDC.sexeHtml = function(s) {
  if (!s) return '<span class="badge bg-light text-muted border small">N/C</span>';
  const v = s.toUpperCase();
  if (v === 'M' || v === 'H') return '<span class="badge mdc-badge-h">H</span>';
  if (v === 'F')               return '<span class="badge mdc-badge-f">F</span>';
  return `<span class="badge bg-light text-dark border small">${window.MDC.escHtml(s)}</span>`;
};

window.MDC.latHtml = function(l) {
  if (!l || l === 'NC') return '<span class="badge bg-light text-muted border small">N/C</span>';
  const map    = { D: 'Droit', G: 'Gauche', B: 'Bilatéral' };
  const colors = { D: 'badge-soft-primary', G: 'badge-soft-success', B: 'badge-soft-warning' };
  return `<span class="badge ${colors[l] || 'bg-light text-dark border'} small">${window.MDC.escHtml(map[l] || l)}</span>`;
};

window.MDC.repriseHtml = function(r) {
  return r
    ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle small">Reprise</span>'
    : '<span class="badge bg-success-subtle text-success border border-success-subtle small">PTG</span>';
};

window.MDC.qualiteHtml = function(q, compact) {
  const map = {
    MATCH:      { cls: 'bg-success-subtle text-success border-success-subtle', icon: 'OK', label: 'Match' },
    SANS_MATCH: { cls: 'bg-danger-subtle text-danger border-danger-subtle',   icon: '!',  label: 'Sans match' },
  };
  const d = map[q] || map.SANS_MATCH;
  return compact
    ? `<span class="badge ${d.cls} border" title="${d.label}">${d.icon}</span>`
    : `<span class="badge ${d.cls} border">${d.label}</span>`;
};

window.MDC.cimentHtml = function(c) {
  if (!c) return '—';
  const map = {
    'CIMENTÉ':          '<span class="badge bg-warning-subtle text-warning border border-warning-subtle small">C</span>',
    'NON CIMENTÉ':      '<span class="badge bg-light text-muted border small">NC</span>',
    'TOUT CIMENTÉ':     '<span class="badge bg-warning-subtle text-warning border border-warning-subtle small">Tout C</span>',
    'TOUT NON CIMENTÉ': '<span class="badge bg-light text-muted border small">Tout NC</span>',
    'MIXTE':            '<span class="badge bg-info-subtle text-info border border-info-subtle small">Mixte</span>',
  };
  return map[c] || c;
};

window.MDC.toast = function(type, msg) {
  const map = {
    success: ['toastSuccess','toastSuccessBody'],
    error:   ['toastError','toastErrorBody'],
    info:    ['toastInfo','toastInfoBody'],
  };
  const [elId, bodyId] = map[type] || map.info;
  const el = document.getElementById(elId);
  if (!el) return;
  document.getElementById(bodyId).textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el).show();
};

window.MDC.implantLines = function(detail) {
  if (!detail) return '<p class="text-muted small mb-0">Aucun détail.</p>';
  // Compter les occurrences de chaque ref pour détecter les doublons
  const refCount = {};
  detail.split('\n').filter(l => l.trim()).forEach(line => {
    const sep = line.indexOf(' — ');
    if (sep > -1) {
      const ref = line.slice(0, sep).trim();
      refCount[ref] = (refCount[ref] || 0) + 1;
    }
  });
  return detail.split('\n').filter(l => l.trim()).map(line => {
    const sep = line.indexOf(' — ');
    if (sep > -1) {
      const ref   = line.slice(0, sep).trim();
      const label = line.slice(sep + 3).trim();
      const isDouble = refCount[ref] > 1;
      return `<div class="mdc-implant-line${isDouble ? ' mdc-implant-double' : ''}">
        <div class="mdc-implant-label">
          ${isDouble ? '<span class="badge bg-warning text-dark me-1 small">x2</span>' : ''}
          ${window.MDC.escHtml(label)}
        </div>
        <code class="mdc-implant-ref">${window.MDC.escHtml(ref)}</code>
      </div>`;
    }
    return `<div class="mdc-implant-line"><div class="mdc-implant-label">${window.MDC.escHtml(line)}</div></div>`;
  }).join('');
};

// ── CHARGEMENT ────────────────────────────────────────────────
async function loadData() {
  setTableState('loading');
  try {
    const { data, error } = await window.bdb
      .from('vue_medacta_coste_implants')
      .select('*')
      .order('timestamp_intervention', { ascending: false });
    if (error) throw error;

    window.MDC.allRows = data || [];
    const total     = window.MDC.allRows.length;
    const primaires = window.MDC.allRows.filter(r => !r.est_reprise).length;
    const reprises  = window.MDC.allRows.filter(r =>  r.est_reprise).length;
    document.getElementById('mdc-total-badge').textContent =
      `${total} — ${primaires} PTG · ${reprises} Reprises`;

    populateFilters(window.MDC.allRows);
    populateSelectProtocoleImplant();
    applyFilters();

    if (typeof window.initAnalytics === 'function') window.initAnalytics();
    if (typeof window.initJointures === 'function') window.initJointures();

  } catch (err) {
    setTableState('error', err.message);
    window.MDC.toast('error', 'Impossible de charger la vue Medacta.');
  }
}

// ── FILTRES ───────────────────────────────────────────────────
function populateFilters(rows) { rows = rows || (window.MDC.allRows || []);
  const mois = [...new Set(rows.map(r => r.date_intervention_mois).filter(Boolean))].sort().reverse();
  const selDate = document.getElementById('filtreDate');
  mois.forEach(d => {
    const o = document.createElement('option');
    o.value = d; o.textContent = window.MDC.fmtMois(d);
    if (selDate) selDate.appendChild(o);
  });

  const protoSet = new Set();
  rows.forEach(r => { if (r.protocole_optim) protoSet.add(r.protocole_optim.trim()); });
  const selProt = document.getElementById('filtreProtocole');
  [...protoSet].sort().forEach(p => {
    const o = document.createElement('option');
    o.value = p; o.textContent = p.length > 60 ? p.slice(0,60)+'...' : p; o.title = p;
    if (selProt) selProt.appendChild(o);
  });
}

function populateSelectProtocoleImplant() {
  const protoSet = new Set();
  window.MDC.allRows
    .filter(r => !r.est_reprise && r.protocole_optim)
    .forEach(r => protoSet.add(r.protocole_optim.trim()));
  const sel = document.getElementById('selectProtocoleImplant');
  [...protoSet].sort().forEach(p => {
    const o = document.createElement('option');
    if (sel) { o.value = p; o.textContent = p; sel.appendChild(o); }
  });
}

window.MDC.applyFilters = function() {
  const date    = document.getElementById('filtreDate')?.value || '';
  const proto   = document.getElementById('filtreProtocole')?.value || '';
  const sexe    = document.getElementById('filtreSexe')?.value || '';
  const qualite = document.getElementById('filtreQualite')?.value || '';
  const segment = document.getElementById('filtreSegment')?.value || '';
  const search  = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();

  window.MDC.filtered = window.MDC.allRows.filter(r => {
    if (date    && r.date_intervention_mois !== date) return false;
    if (proto   && r.protocole_optim !== proto) return false;
    if (sexe === 'F' && (r.sexe || '').toUpperCase() !== 'F') return false;
    if (sexe === 'H' && !['M','H'].includes((r.sexe || '').toUpperCase())) return false;
    if (qualite && r.qualite_jointure !== qualite) return false;
    if (segment === 'PTG'     &&  r.est_reprise) return false;
    if (segment === 'REPRISE' && !r.est_reprise) return false;
    if (search) {
      const hay = [
        r.code_commande, r.refs_fabricant, r.detail_implants,
        r.protocole_optim, r.panseuse, r.categories,
        r.taille_femur, r.taille_embase, r.taille_insert, r.pattern_combinaison,
      ].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  window.MDC.page = 1;
  sortAndRender();
};
const applyFilters = window.MDC.applyFilters;

// ── TRI ───────────────────────────────────────────────────────
function sortAndRender() {
  const { sortCol, sortDir } = window.MDC;
  const sorted = [...window.MDC.filtered].sort((a, b) => {
    let va = a[sortCol] ?? '';
    let vb = b[sortCol] ?? '';
    if (sortCol === 'nb_implants') { va = parseInt(va)||0; vb = parseInt(vb)||0; }
    else if (sortCol === 'timestamp_intervention') {
      va = new Date(va).getTime(); vb = new Date(vb).getTime();
    } else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
  renderTable(sorted);
  document.getElementById('resultCount').textContent = window.MDC.filtered.length;
}

// ── RENDU TABLE ───────────────────────────────────────────────
function renderTable(rows) {
  const { page, pageSize } = window.MDC;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);

  document.getElementById('currentPage').textContent = page;
  document.getElementById('totalPages').textContent  = totalPages;

  if (rows.length === 0) { setTableState('empty'); renderPagination(0,0); return; }
  setTableState('list');

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = slice.map(r => {
    const e = window.MDC.escHtml;
    const tailles = [r.taille_femur, r.taille_embase, r.taille_insert].filter(Boolean).join(' / ');
    const doublonBadge = r.a_doublon
      ? ' <span class="badge bg-warning text-dark small">x2</span>' : '';

    // Chips tailles
    let taillesHtml = '';
    if (r.taille_femur)         taillesHtml += `<span class="mdc-chip-taille mdc-chip-femur">F:${e(r.taille_femur)}</span>`;
    if (r.taille_embase)        taillesHtml += `<span class="mdc-chip-taille mdc-chip-embase">T:${e(r.taille_embase)}</span>`;
    if (r.taille_intermediaire) taillesHtml += `<span class="mdc-chip-taille mdc-chip-inter">${e(r.taille_intermediaire)}</span>`;
    if (r.taille_insert)        taillesHtml += `<span class="mdc-chip-taille mdc-chip-insert">I:${e(r.taille_insert)}</span>`;
    if (r.epaisseur_insert)     taillesHtml += `<span class="mdc-chip-taille mdc-chip-ep">${e(r.epaisseur_insert)}</span>`;

    // Flags icônes
    let flags = '';
    if (r.a_tige)     flags += '<i class="bi bi-bar-chart-steps text-secondary ms-1" title="Tige"></i>';
    if (r.a_rotule)   flags += '<i class="bi bi-circle text-secondary ms-1" title="Rotule"></i>';
    if (r.a_allergie) flags += '<i class="bi bi-exclamation-triangle text-warning ms-1" title="Allergie"></i>';
    if (r.a_doublon)  flags += '<i class="bi bi-exclamation-octagon text-danger ms-1" title="Doublon"></i>';

    return `<tr class="mdc-tr-clickable" data-cmd="${e(r.code_commande)}">
      <td>${window.MDC.sexeHtml(r.sexe)}</td>
      <td>${window.MDC.latHtml(r.lateralite)}</td>
      <td class="small text-truncate mdc-td-label" title="${e(r.panseuse||'')}">
        ${e(r.panseuse ? (r.panseuse.length>22 ? r.panseuse.slice(0,22)+'…' : r.panseuse) : '—')}
      </td>
      <td>${taillesHtml || '<span class="text-muted small">—</span>'}</td>
      <td>${window.MDC.cimentHtml(r.ciment_global)}</td>
      <td class="text-end text-muted small">${r.duree_minutes ? e(r.duree_minutes)+'min' : '—'}</td>
      <td>${flags || ''}</td>
      <td class="text-center">${window.MDC.qualiteHtml(r.qualite_jointure, true)}</td>
      <td class="text-end">
        <button class="btn btn-ghost btn-xs mdc-btn-detail"
                data-cmd="${e(r.code_commande)}" title="Voir détail">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.mdc-btn-detail').forEach(btn => {
    btn.addEventListener('click', ev => {
      ev.stopPropagation();
      const r = window.MDC.allRows.find(x => x.code_commande === btn.dataset.cmd);
      if (r) openModal(r);
    });
  });
  tbody.querySelectorAll('.mdc-tr-clickable').forEach(tr => {
    tr.addEventListener('click', () => {
      const r = window.MDC.allRows.find(x => x.code_commande === tr.dataset.cmd);
      if (r) openModal(r);
    });
  });

  renderPagination(totalPages, page);
}

function renderPagination(totalPages, currentPage) {
  const container = document.getElementById('paginationContainer');
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = `<li class="page-item ${currentPage===1?'disabled':''}">
    <button class="page-link" data-p="${currentPage-1}">‹</button></li>`;
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i===1 || i===totalPages || (i>=currentPage-delta && i<=currentPage+delta)) {
      html += `<li class="page-item ${i===currentPage?'active':''}">
        <button class="page-link" data-p="${i}">${i}</button></li>`;
    } else if (i===currentPage-delta-1 || i===currentPage+delta+1) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  html += `<li class="page-item ${currentPage===totalPages?'disabled':''}">
    <button class="page-link" data-p="${currentPage+1}">›</button></li>`;
  container.innerHTML = html;
  container.querySelectorAll('button[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p);
      if (p>=1 && p<=totalPages) { window.MDC.page=p; sortAndRender(); }
    });
  });
}

// ── ÉTATS TABLE ───────────────────────────────────────────────
function setTableState(state, msg) {
  const tbody = document.getElementById('tableBody');
  const states = {
    loading: '<tr><td colspan="9" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Chargement...</td></tr>',
    empty:   '<tr><td colspan="9" class="text-center text-muted py-4"><i class="bi bi-inbox me-2"></i>Aucune intervention ne correspond aux filtres.</td></tr>',
    error:   `<tr><td colspan="9" class="text-center text-danger py-4"><i class="bi bi-exclamation-octagon me-2"></i>${window.MDC.escHtml(msg||'Erreur')}</td></tr>`,
  };
  if (states[state]) tbody.innerHTML = states[state];
}

// ── MODALE DÉTAIL ─────────────────────────────────────────────
function openModal(r) {
  const e = window.MDC.escHtml;

  document.getElementById('modalDetailLabel').textContent =
    r.protocole_optim || (r.est_reprise ? 'Reprise PTG' : 'PTG sans protocole apparié');
  document.getElementById('modalCmd').textContent  = r.code_commande || '';
  document.getElementById('modalDate').textContent = window.MDC.fmtTs(r.timestamp_intervention);

  const latEl = document.getElementById('modalLat');
  if (r.lateralite && r.lateralite !== 'NC') {
    latEl.innerHTML = window.MDC.latHtml(r.lateralite);
    latEl.classList.remove('d-none');
  } else { latEl.classList.add('d-none'); }

  document.getElementById('modalSexe').innerHTML = window.MDC.sexeHtml(r.sexe);
  document.getElementById('modalQual').innerHTML =
    window.MDC.qualiteHtml(r.qualite_jointure, false) + ' ';

  document.getElementById('modalAlertAmbig').classList.add('d-none');
  document.getElementById('modalAlertNoMatch').classList.toggle('d-none', r.qualite_jointure !== 'SANS_MATCH');

  const doublonAlert = document.getElementById('modalAlertDoublon');
  if (doublonAlert) doublonAlert.classList.toggle('d-none', !r.a_doublon);

  document.getElementById('mProtocole').textContent  = r.protocole_optim  || '—';
  document.getElementById('mSexe').innerHTML         = window.MDC.sexeHtml(r.sexe);
  document.getElementById('mLat').innerHTML          = window.MDC.latHtml(r.lateralite);
  document.getElementById('mPanseuse').textContent   = r.panseuse         || '—';
  const mDuree = document.getElementById('mDuree'); if (mDuree) mDuree.textContent = r.duree_minutes ? r.duree_minutes + ' min' : '—';
  const mAne = document.getElementById('mAnesthesie'); if (mAne) mAne.textContent = r.protocole_anesthesie || '—';
  const mCim2 = document.getElementById('mCiment');
  if (mCim2) {
    const parts = [
      r.ciment_femur  ? 'Fémur : '  + window.MDC.cimentHtml(r.ciment_femur)  : null,
      r.ciment_embase ? 'Embase : ' + window.MDC.cimentHtml(r.ciment_embase) : null,
    ].filter(Boolean);
    mCim2.innerHTML = parts.length ? parts.join(' &nbsp;') : '—';
  }
  document.getElementById('mSpecialite').textContent = [r.taille_femur, r.taille_embase, r.taille_insert, r.epaisseur_insert, r.spec_tige, r.taille_rotule].filter(Boolean).join(' · ') || '—';

  const noteW = document.getElementById('mNoteWrapper');
  if (r.note_optim) {
    document.getElementById('mNote').textContent = r.note_optim;
    noteW?.classList.remove('d-none');
  } else { noteW?.classList.add('d-none'); }

  document.getElementById('mNbImplants').textContent = r.nb_implants || '—';

  const taillesEl = document.getElementById('mTailles');
  if (taillesEl) {
    const lignes = [
      r.taille_femur         ? `Femur : ${r.taille_femur}`                               : null,
      r.taille_embase        ? `Embase : ${r.taille_embase}`                             : null,
      r.taille_intermediaire ? `Intermediaire : ${r.taille_intermediaire}`                : null,
      r.taille_insert && r.epaisseur_insert
                             ? `Insert : ${r.taille_insert} — ep. ${r.epaisseur_insert}` : null,
      r.spec_tige            ? `Tige : ${r.spec_tige}`                                   : null,
      r.taille_rotule        ? `Rotule : ${r.taille_rotule}`                             : null,
      r.a_allergie           ? 'Composant allergie'                                       : null,
    ].filter(Boolean);
    taillesEl.innerHTML = lignes.length
      ? lignes.map(l => `<div class="small">${e(l)}</div>`).join('')
      : '<span class="text-muted small">—</span>';
  }

  const cimentEl = document.getElementById('mCiment');
  if (cimentEl) {
    const cimentMap = {
      'TOUT CIMENTE':     '<span class="badge bg-primary-subtle text-primary border">Tout cimente</span>',
      'TOUT NON CIMENTE': '<span class="badge bg-secondary-subtle text-secondary border">Tout sans ciment</span>',
      'MIXTE':            '<span class="badge bg-warning-subtle text-warning border">Mixte</span>',
    };
    cimentEl.innerHTML = cimentMap[r.ciment_global] || e(r.ciment_global || '—');
  }

  document.getElementById('mImplants').innerHTML = window.MDC.implantLines(r.detail_implants);

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetail')).show();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {


  // Segment PTG / Reprises
  document.querySelectorAll('.mdc-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mdc-segment-btn').forEach(b => {
        b.classList.remove('active','btn-success','btn-danger');
        b.classList.add(b.dataset.segment === 'reprise' ? 'btn-outline-danger' : 'btn-outline-success');
      });
      btn.classList.add('active', btn.dataset.segment === 'reprise' ? 'btn-danger' : 'btn-success');
      btn.classList.remove('btn-outline-danger','btn-outline-success');
      window.MDC.segmentReprise = btn.dataset.segment === 'reprise';
      populateFilters(window.MDC.rowsSegment ? window.MDC.rowsSegment() : window.MDC.allRows);
      populateSelectProtocoleImplant();
      applyFilters();
      if (typeof window.initAnalytics === 'function') window.initAnalytics();
    });
  });
  document.querySelectorAll('.mdc-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.col;
      if (window.MDC.sortCol === col) {
        window.MDC.sortDir = window.MDC.sortDir === 'asc' ? 'desc' : 'asc';
      } else { window.MDC.sortCol = col; window.MDC.sortDir = 'asc'; }
      document.querySelectorAll('.mdc-sort-btn').forEach(b =>
        b.querySelector('.mdc-sort-icon').className = 'bi bi-arrow-down-up ms-1 mdc-sort-icon');
      btn.querySelector('.mdc-sort-icon').className =
        `bi bi-arrow-${window.MDC.sortDir==='asc'?'up':'down'} ms-1 mdc-sort-icon text-primary`;
      sortAndRender();
    });
  });

  ['filtreDate','filtreProtocole','filtreSexe','filtreQualite','filtreSegment'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('btnClearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = ''; applyFilters();
  });
  document.getElementById('btnResetFilters').addEventListener('click', () => {
    ['filtreDate','filtreProtocole','filtreSexe','filtreQualite','filtreSegment']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('searchInput').value = '';
    applyFilters();
  });

  document.getElementById('pageSizeSelect').addEventListener('change', ev => {
    window.MDC.pageSize = parseInt(ev.target.value);
    window.MDC.page = 1;
    sortAndRender();
  });

  if (window.bdbShellReady) loadData();
  else document.addEventListener('bdbShellReady', loadData, { once: true });
});
