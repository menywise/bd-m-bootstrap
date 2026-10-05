/* ==========================================================
   Audit V5 — Dashboard L3 Createur
   Charge le dernier resultat JSON depuis results/ et affiche la matrice
   ========================================================== */

const STATE = {
  data: null,
  filtered: [],
  modalDetails: null,
};

const $ = (id) => document.getElementById(id);

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============================================================
   CHARGEMENT DES RESULTATS
   ============================================================ */

async function loadLatestResults() {
  // Strategie 1 : window.AUDIT_DATA injecte par results/latest-data.js (contourne CORS file://)
  if (window.AUDIT_DATA) {
    return window.AUDIT_DATA;
  }
  // Strategie 2 : fetch results/latest.json (necessite serveur HTTP)
  try {
    const r = await fetch('results/latest.json');
    if (r.ok) return await r.json();
  } catch (e) {
    // Silencieux : strategie 1 a deja essaye
  }
  return null;
}

/* ============================================================
   AFFICHAGE
   ============================================================ */

function renderStats(meta) {
  const c = meta.counts || {};
  $('statTotal').textContent = meta.total || 0;
  $('statOk').textContent = c.OK || 0;
  $('statKo').textContent = c.KO || 0;
  $('statNa').textContent = c.NA || 0;
  $('runDate').textContent = meta.run_date ? new Date(meta.run_date).toLocaleString('fr-FR') : '—';

  // Repartition criticite
  const critContainer = $('criticiteChart');
  critContainer.innerHTML = '';
  ['P0', 'P1', 'P2', 'P3'].forEach(crit => {
    const count = c[crit] || 0;
    const div = document.createElement('div');
    div.className = `criticite-badge crit-${crit}`;
    div.innerHTML = `<strong>${crit}</strong> <span class="ms-1">${count}</span>`;
    critContainer.appendChild(div);
  });
}

function renderFamilleChart(results) {
  const familles = {};
  results.forEach(r => {
    if (r.statut === 'KO') {
      familles[r.famille] = (familles[r.famille] || 0) + 1;
    }
  });
  const container = $('familleChart');
  container.innerHTML = '';
  const max = Math.max(1, ...Object.values(familles));
  Object.entries(familles).sort().forEach(([f, n]) => {
    const pct = (n / max * 100).toFixed(0);
    const div = document.createElement('div');
    div.className = 'famille-bar';
    div.innerHTML = `
      <span class="famille-label">${escHtml(f)}</span>
      <div class="famille-bar-track">
        <div class="famille-bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="famille-count">${n}</span>
    `;
    container.appendChild(div);
  });
}

function populateFamilleFilter(results) {
  const set = new Set();
  results.forEach(r => set.add(r.famille));
  const sel = $('filterFamille');
  Array.from(set).sort().forEach(f => {
    const o = document.createElement('option');
    o.value = f;
    o.textContent = f;
    sel.appendChild(o);
  });
}

function applyFilters() {
  if (!STATE.data) return;
  const text = ($('filterText').value || '').toLowerCase();
  const fam = $('filterFamille').value;
  const crit = $('filterCriticite').value;
  const stat = $('filterStatut').value;

  STATE.filtered = STATE.data.results.filter(r => {
    if (fam && r.famille !== fam) return false;
    if (crit && r.criticite !== crit) return false;
    if (stat && r.statut !== stat) return false;
    if (text) {
      const hay = (r.fichier + ' ' + r.dimension_titre + ' ' + r.dimension_ref).toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  });
  renderResultsTable();
}

function renderResultsTable() {
  const body = $('resultsBody');
  body.innerHTML = '';
  $('resultCount').textContent = `${STATE.filtered.length} resultats`;

  if (STATE.filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="7" class="text-center p-3 text-muted">Aucun resultat.</td></tr>';
    return;
  }

  // Limite a 500 lignes affichees pour perf
  const limited = STATE.filtered.slice(0, 500);
  limited.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = `row-${r.statut}`;
    tr.innerHTML = `
      <td><span class="badge bg-light text-dark">${escHtml(r.famille)}</span></td>
      <td>
        <small class="text-muted">${escHtml(r.dimension_ref)}</small><br>
        ${escHtml(r.dimension_titre).substring(0, 60)}
      </td>
      <td><span class="crit-badge crit-${r.criticite}">${escHtml(r.criticite)}</span></td>
      <td><code class="small">${escHtml(r.fichier)}</code></td>
      <td><span class="badge bg-secondary">${escHtml(r.surface)}</span></td>
      <td><span class="statut-badge statut-${r.statut}">${escHtml(r.statut)}</span></td>
      <td><button class="btn btn-sm btn-module-outline" data-idx="${STATE.filtered.indexOf(r)}">
        <i class="bi bi-eye"></i>
      </button></td>
    `;
    body.appendChild(tr);
  });

  if (STATE.filtered.length > 500) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" class="text-center text-muted small p-2">
      ${STATE.filtered.length - 500} resultats supplementaires masques. Affinez les filtres.
    </td>`;
    body.appendChild(tr);
  }

  // Bind clicks pour modale details
  body.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      showDetails(STATE.filtered[idx]);
    });
  });
}

function showDetails(r) {
  const body = $('modalDetailsBody');
  body.innerHTML = `
    <dl>
      <dt>Famille</dt><dd>${escHtml(r.famille)}</dd>
      <dt>Dimension</dt><dd>${escHtml(r.dimension_ref)} — ${escHtml(r.dimension_titre)}</dd>
      <dt>Criticite</dt><dd><span class="crit-badge crit-${r.criticite}">${escHtml(r.criticite)}</span></dd>
      <dt>Fichier</dt><dd><code>${escHtml(r.fichier)}</code></dd>
      <dt>Surface</dt><dd>${escHtml(r.surface)}</dd>
      <dt>Statut</dt><dd><span class="statut-badge statut-${r.statut}">${escHtml(r.statut)}</span></dd>
      <dt>Details</dt><dd><pre class="bg-light p-2 small">${escHtml(JSON.stringify(r.details, null, 2))}</pre></dd>
    </dl>
  `;
  STATE.modalDetails.show();
}

function exportCsv() {
  const rows = ['Famille,Dimension,Criticite,Fichier,Surface,Statut,Details'];
  STATE.filtered.forEach(r => {
    rows.push([
      r.famille,
      r.dimension_ref,
      r.criticite,
      r.fichier,
      r.surface,
      r.statut,
      JSON.stringify(r.details || {}).replace(/"/g, '""')
    ].map(c => `"${c}"`).join(','));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-v5-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   INIT
   ============================================================ */

async function init() {
  STATE.modalDetails = new bootstrap.Modal($('modalDetails'));

  $('loadingState').classList.remove('d-none');
  const data = await loadLatestResults();
  $('loadingState').classList.add('d-none');

  if (!data) {
    $('emptyState').classList.remove('d-none');
    return;
  }

  STATE.data = data;
  STATE.filtered = data.results;
  renderStats(data.meta);
  renderFamilleChart(data.results);
  populateFamilleFilter(data.results);
  renderResultsTable();

  // Bind filtres
  ['filterText', 'filterFamille', 'filterCriticite', 'filterStatut'].forEach(id => {
    $(id).addEventListener('input', applyFilters);
    $(id).addEventListener('change', applyFilters);
  });

  $('btnRefresh').addEventListener('click', () => location.reload());
  $('btnExportCsv').addEventListener('click', exportCsv);
}

document.addEventListener('DOMContentLoaded', init);
