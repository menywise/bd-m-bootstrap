// ============================================================
// medacta-analytics.js V4
// Tabs : Implants & Tailles / Équipe / Patients
// VIEW V4 : données individuelles, est_reprise, tailles, ciment
// Dépendances : window.MDC (app.js) · Chart.js
// ============================================================
'use strict';

const _charts = {};
function destroyChart(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

const C = {
  fD:  '#9d174d',  // Femme + Droit  — rose foncé
  fG:  '#f9a8d4',  // Femme + Gauche — rose clair
  hD:  '#1d4ed8',  // Homme + Droit  — bleu foncé
  hG:  '#93c5fd',  // Homme + Gauche — bleu clair
  primary:   '#60a5fa',
  success:   '#34d399',
  warning:   '#fbbf24',
  danger:    '#f87171',
  secondary: '#94a3b8',
  info:      '#38bdf8',
  palette:   ['#60a5fa','#34d399','#fbbf24','#f87171','#38bdf8',
              '#a78bfa','#fb923c','#2dd4bf','#818cf8','#e879f9'],
};

// ── Helpers ──────────────────────────────────────────────────
function rows4Series(rows, colonne) {
  // Construit 4 séries F+D / F+G / H+D / H+G pour un colonne de taille
  const series = { fD: {}, fG: {}, hD: {}, hG: {} };
  rows.forEach(r => {
    const val = r[colonne];
    if (!val) return;
    const sexe = (r.sexe || '').toUpperCase();
    const lat  = r.lateralite || 'NC';
    const key  = (sexe === 'F')
      ? (lat === 'D' ? 'fD' : lat === 'G' ? 'fG' : null)
      : (sexe === 'M' || sexe === 'H')
        ? (lat === 'D' ? 'hD' : lat === 'G' ? 'hG' : null)
        : null;
    if (!key) return;
    series[key][val] = (series[key][val] || 0) + 1;
  });
  return series;
}

function labelsUnion(series) {
  // Trie les labels naturellement : T.1 < T.2 < T.2+ < T.3 ...
  const all = new Set([
    ...Object.keys(series.fD),
    ...Object.keys(series.fG),
    ...Object.keys(series.hD),
    ...Object.keys(series.hG),
  ]);
  return [...all].sort((a, b) => {
    const n = s => parseFloat(s.replace(/[^0-9.]/g, '')) + (s.includes('+') ? 0.5 : 0);
    return n(a) - n(b);
  });
}

// Génère 2 charts côte à côte : canvasId + 'D' pour Droit, + 'G' pour Gauche
function chart4Series(baseId, labels, series, title) {
  ['D','G'].forEach(cote => {
    const canvasId = baseId + cote;
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const isd = cote === 'D';
    _charts[canvasId] = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: isd ? 'F + Droit' : 'F + Gauche',
            data: labels.map(l => (isd ? series.fD[l] : series.fG[l])||0),
            backgroundColor: C.fD,
            borderRadius: 3,
          },
          {
            label: isd ? 'H + Droit' : 'H + Gauche',
            data: labels.map(l => (isd ? series.hD[l] : series.hG[l])||0),
            backgroundColor: C.hD,
            borderRadius: 3,
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
          title: {
            display: true,
            text: (title ? title + ' — ' : '') + (isd ? 'Côté Droit' : 'Côté Gauche'),
            font: { size: 12 }
          },
        },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        responsive: true,
      }
    });
  });
}

// ============================================================
// TAB 2 — IMPLANTS & TAILLES
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnAnalyseImplants');
  if (btn) btn.addEventListener('click', () => {
    const proto = document.getElementById('selectProtocoleImplant')?.value;
    if (proto) renderImplantAnalyse(proto);
  });
});

function renderImplantAnalyse(proto) {
  const e = window.MDC.escHtml;
  const rows = ((window.MDC?.allRows||[]).filter(r=>!!r.est_reprise===!!(window.MDC?.segmentReprise))).filter(r =>
    r.protocole_optim && r.protocole_optim.includes(proto)
  );
  const container = document.getElementById('implantResults');
  if (!container) return;

  if (rows.length === 0) {
    container.innerHTML = `<div class="alert alert-warning">
      <i class="bi bi-inbox me-2"></i>Aucune intervention trouvée pour ce protocole.</div>`;
    return;
  }

  const nbPrim = rows.filter(r => !r.est_reprise).length;
  const nbRep  = rows.filter(r => r.est_reprise).length;

  // Séries 4 dimensions
  const seriesFemur  = rows4Series(rows, 'taille_femur');
  const seriesEmbase = rows4Series(rows, 'taille_embase');
  const seriesInsert = rows4Series(rows, 'taille_insert');
  const seriesEp     = rows4Series(rows, 'epaisseur_insert');

  // Fémur labels
  const labelsFemur  = labelsUnion(seriesFemur);
  const labelsEmbase = labelsUnion(seriesEmbase);
  const labelsInsert = labelsUnion(seriesInsert);
  const labelsEp     = labelsUnion(seriesEp);

  // Tailles intermédiaires (F:N/T:N) — comptage par valeur × sexe × côté
  const interCount = {};
  rows.filter(r => r.taille_intermediaire).forEach(r => {
    const k = r.taille_intermediaire;
    const sexe = (r.sexe || 'NC').toUpperCase();
    const lat  = r.lateralite || 'NC';
    const key  = (sexe === 'F')
      ? (lat === 'D' ? 'fD' : lat === 'G' ? 'fG' : 'autre')
      : (['M','H'].includes(sexe))
        ? (lat === 'D' ? 'hD' : lat === 'G' ? 'hG' : 'autre')
        : 'autre';
    if (!interCount[k]) interCount[k] = { fD:0, fG:0, hD:0, hG:0, total:0 };
    interCount[k][key] = (interCount[k][key]||0)+1;
    interCount[k].total++;
  });
  const hasInter = Object.keys(interCount).length > 0;

  // Ciment
  const cimentCount = { 'TOUT NON CIMENTÉ': 0, 'MIXTE': 0, 'TOUT CIMENTÉ': 0 };
  rows.forEach(r => { if (r.ciment_global) cimentCount[r.ciment_global] = (cimentCount[r.ciment_global]||0)+1; });

  // Tiges
  const tigeCount = {};
  rows.filter(r => r.a_tige && r.spec_tige).forEach(r => {
    tigeCount[r.spec_tige] = (tigeCount[r.spec_tige]||0)+1;
  });
  const sortedTiges = Object.entries(tigeCount).sort((a,b) => b[1]-a[1]);

  // Rotule
  const rotuleCount = {};
  rows.filter(r => r.a_rotule && r.taille_rotule).forEach(r => {
    rotuleCount[r.taille_rotule] = (rotuleCount[r.taille_rotule]||0)+1;
  });

  // Allergie
  const nbAllergie = rows.filter(r => r.a_allergie).length;
  const nbAllergieF = rows.filter(r => r.a_allergie && r.sexe === 'F').length;
  const nbAllergieH = rows.filter(r => r.a_allergie && (r.sexe === 'M' || r.sexe === 'H')).length;

  // Doublons
  const doublons = rows.filter(r => r.a_doublon);

  // Patterns top 10
  const patCount = {};
  rows.forEach(r => {
    if (r.pattern_combinaison) patCount[r.pattern_combinaison] = (patCount[r.pattern_combinaison]||0)+1;
  });
  const topPat = Object.entries(patCount).sort((a,b) => b[1]-a[1]).slice(0, 10);

  // ── HTML ──────────────────────────────────────────────────
  container.innerHTML = `
    <!-- KPIs -->
    <div class="d-flex gap-2 flex-wrap mb-3">
      <span class="badge bg-primary">${rows.length} intervention${rows.length>1?'s':''}</span>
      ${nbPrim ? `<span class="badge bg-success">${nbPrim} primaires</span>` : ''}
      ${nbRep  ? `<span class="badge bg-danger">${nbRep} reprises</span>` : ''}
      ${nbAllergie ? `<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>${nbAllergie} allergie${nbAllergie>1?'s':''}</span>` : ''}
      ${doublons.length ? `<span class="badge bg-danger"><i class="bi bi-exclamation-octagon me-1"></i>${doublons.length} doublon${doublons.length>1?'s':''}</span>` : ''}
    </div>

    <div class="row g-3">

      <!-- Fémur -->
      <div class="col-12 col-xl-6">
        <div class="row g-2">
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#60a5fa"></i>Tailles Fémur — Gauche
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartFemurG" height="200"></canvas></div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#60a5fa"></i>Tailles Fémur — Droit
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartFemurD" height="200"></canvas></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Embase -->
      <div class="col-12 col-xl-6">
        <div class="row g-2">
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#34d399"></i>Tailles Embase — Gauche
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartEmbaseG" height="200"></canvas></div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#34d399"></i>Tailles Embase — Droit
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartEmbaseD" height="200"></canvas></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="row g-2">
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#fbbf24"></i>Tailles Insert — Gauche
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartInsertG" height="200"></canvas></div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#fbbf24"></i>Tailles Insert — Droit
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartInsertD" height="200"></canvas></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="row g-2">
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#a78bfa"></i>Épaisseur Insert (mm) — Gauche
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartEpaisseurG" height="200"></canvas></div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h6 class="mb-0 fw-semibold" style="font-size:0.8rem">
                  <i class="bi bi-bar-chart me-1" style="color:#a78bfa"></i>Épaisseur Insert (mm) — Droit
                </h6>
              </div>
              <div class="card-body p-2"><canvas id="chartEpaisseurD" height="200"></canvas></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tailles intermédiaires -->
      ${hasInter ? `
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-arrow-left-right me-2 text-danger"></i>
              Tailles intermédiaires (fémur ≠ tibia) — ${Object.values(interCount).reduce((a,b)=>a+b.total,0)} interventions
              (${((Object.values(interCount).reduce((a,b)=>a+b.total,0)/rows.length)*100).toFixed(1)}% des PTG analysées)
            </h6>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light"><tr>
                <th>Combinaison</th>
                <th class="text-center"><span class="mdc-badge-f small">F+D</span></th>
                <th class="text-center"><span class="mdc-badge-f small">F+G</span></th>
                <th class="text-center"><span class="mdc-badge-h small">H+D</span></th>
                <th class="text-center"><span class="mdc-badge-h small">H+G</span></th>
                <th class="text-end">Total</th>
                <th class="text-end">%</th>
              </tr></thead>
              <tbody>
                ${Object.entries(interCount).sort((a,b)=>b[1].total-a[1].total).map(([k,v]) => `
                  <tr>
                    <td><strong class="font-monospace">${e(k)}</strong>
                      <small class="text-muted ms-2">${e(
                        k.replace('F:','Fémur T').replace('/T:','  Tibia T')
                      )}</small>
                    </td>
                    <td class="text-center">${v.fD||'—'}</td>
                    <td class="text-center">${v.fG||'—'}</td>
                    <td class="text-center">${v.hD||'—'}</td>
                    <td class="text-center">${v.hG||'—'}</td>
                    <td class="text-end fw-bold">${v.total}</td>
                    <td class="text-end text-muted small">${((v.total/Object.values(interCount).reduce((a,b)=>a+b.total,0))*100).toFixed(1)}%</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>` : ''}

      <!-- Ciment -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-pie-chart me-2 text-warning"></i>Ciment × Sexe</h6>
          </div>
          <div class="card-body p-3"><canvas id="chartCiment" height="220"></canvas></div>
        </div>
      </div>

      <!-- Tiges -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-bar-chart-steps me-2 text-secondary"></i>
              Tiges d'extension
              <span class="badge bg-secondary ms-1">${rows.filter(r=>r.a_tige).length}</span>
            </h6>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light"><tr><th>Spec</th><th class="text-end">Nb</th><th class="text-end">%</th></tr></thead>
              <tbody>${sortedTiges.length
                ? sortedTiges.map(([spec, nb]) => `<tr>
                    <td class="small">${e(spec)}</td>
                    <td class="text-end fw-bold">${nb}</td>
                    <td class="text-end text-muted small">${((nb/rows.filter(r=>r.a_tige).length)*100).toFixed(0)}%</td>
                  </tr>`).join('')
                : '<tr><td colspan="3" class="text-muted text-center py-2">Aucune tige</td></tr>'
              }</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Rotule + Allergie -->
      <div class="col-12 col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h6 class="mb-0 fw-semibold"><i class="bi bi-circle me-2" style="color:#fb923c"></i>Rotule &amp; Allergie</h6>
          </div>
          <div class="card-body">
            <p class="small fw-semibold text-muted text-uppercase mb-2">Rotule de resurfaçage</p>
            ${Object.keys(rotuleCount).length
              ? (() => {
                  const totalR = Object.values(rotuleCount).reduce((a,b)=>a+b,0);
                  return Object.entries(rotuleCount).sort((a,b)=>b[1]-a[1]).map(([t, nb]) =>
                    `<div class="d-flex justify-content-between small mb-1">
                      <span>${e(t)}</span>
                      <span><strong>${nb}</strong> <span class="text-muted">${((nb/totalR)*100).toFixed(0)}%</span></span>
                    </div>`).join('');
                })()
              : '<p class="text-muted small">Aucune rotule</p>'}
            <hr class="my-2"/>
            <p class="small fw-semibold text-muted text-uppercase mb-2">Composant allergie</p>
            ${nbAllergie > 0 ? `
            <div class="d-flex flex-wrap gap-2">
              <span class="badge mdc-badge-f">${nbAllergieF} F (${((nbAllergieF/nbAllergie)*100).toFixed(0)}%)</span>
              <span class="badge mdc-badge-h">${nbAllergieH} H (${((nbAllergieH/nbAllergie)*100).toFixed(0)}%)</span>
              <span class="badge bg-secondary">${nbAllergie} / ${rows.length} interv. (${((nbAllergie/rows.length)*100).toFixed(1)}%)</span>
            </div>` : '<p class="text-muted small mb-0">Aucun composant allergie</p>'}
          </div>
        </div>
      </div>

      <!-- Doublons -->
      ${doublons.length ? `
      <div class="col-12">
        <div class="card border-0 shadow-sm border-danger-subtle">
          <div class="card-header bg-danger-subtle border-bottom border-danger-subtle">
            <h6 class="mb-0 fw-semibold text-danger">
              <i class="bi bi-exclamation-octagon me-2"></i>Doublons détectés (${doublons.length})
            </h6>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light"><tr>
                <th>Date</th><th>Sexe</th><th>Côté</th><th>Reprise</th><th>Détail</th>
              </tr></thead>
              <tbody>${doublons.map(r => `
                <tr>
                  <td class="small">${e(window.MDC.fmtTs(r.timestamp_intervention))}</td>
                  <td>${window.MDC.sexeHtml(r.sexe)}</td>
                  <td>${window.MDC.latHtml(r.lateralite)}</td>
                  <td>${r.est_reprise
                    ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Reprise</span>'
                    : '<span class="badge bg-success-subtle text-success border border-success-subtle">Primaire</span>'}</td>
                  <td class="small text-truncate mdc-td-label"
                      title="${e(r.detail_implants||'')}">
                    ${e((r.detail_implants||'').split('\n').slice(0,2).join(' · '))}
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>` : ''}

      <!-- Top patterns -->
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-list-stars me-2 text-info"></i>Top combinaisons posées
            </h6>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light"><tr>
                <th>#</th><th>Combinaison</th><th class="text-end">Nb</th><th class="text-end">%</th>
              </tr></thead>
              <tbody>${topPat.map(([pat, nb], i) => {
                // Parser le pattern : "T.3 | T.4 | T.3 | 11mm | TIGE | C"
                const parts = pat.split(' | ');
                let chips = '';
                parts.forEach(p => {
                  p = p.trim();
                  if (!p) return;
                  let cls = 'bg-light text-dark border';
                  let label = p;
                  if (p.match(/^T\.\d/)) { // taille fémur ou embase
                    if (!chips.includes('mdc-chip-femur')) {
                      cls = 'mdc-chip-taille mdc-chip-femur'; label = 'F:'+p;
                    } else {
                      cls = 'mdc-chip-taille mdc-chip-embase'; label = 'E:'+p;
                    }
                  } else if (p.endsWith('mm')) { cls = 'mdc-chip-taille mdc-chip-ep'; label = p; }
                  else if (p === 'TIGE')    { cls = 'mdc-chip-taille'; label = '⊤ Tige'; }
                  else if (p === 'ROTULE')  { cls = 'badge bg-light text-dark border'; }
                  else if (p === 'ALLERGIE'){ cls = 'badge bg-warning-subtle text-warning border'; }
                  else if (p === 'C')       { cls = 'mdc-chip-taille bg-warning-subtle'; label = 'Cimenté'; }
                  else if (p === 'NC')      { cls = 'mdc-chip-taille bg-light text-muted'; label = 'Sans ciment'; }
                  else if (p.includes('/')) { cls = 'mdc-chip-taille mdc-chip-inter'; label = p; }
                  chips += `<span class="${cls}" style="margin-right:2px">${e(label)}</span>`;
                });
                return `<tr>
                  <td class="text-muted">${i+1}</td>
                  <td>${chips}</td>
                  <td class="text-end fw-bold">${nb}</td>
                  <td class="text-end text-muted small">${((nb/rows.length)*100).toFixed(1)}%</td>
                </tr>`;
              }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;

  // Render charts
  chart4Series('chartFemur',   labelsFemur,  seriesFemur,  null);
  chart4Series('chartEmbase',  labelsEmbase, seriesEmbase, null);
  chart4Series('chartInsert',  labelsInsert, seriesInsert, null);
  chart4Series('chartEpaisseur', labelsEp,   seriesEp,     null);

  // Ciment chart
  destroyChart('chartCiment');
  const cimentCtx = document.getElementById('chartCiment');
  if (cimentCtx) {
    const cimentBySexe = {
      F: { 'TOUT NON CIMENTÉ': 0, 'MIXTE': 0, 'TOUT CIMENTÉ': 0 },
      H: { 'TOUT NON CIMENTÉ': 0, 'MIXTE': 0, 'TOUT CIMENTÉ': 0 },
    };
    rows.forEach(r => {
      const s = (r.sexe === 'F') ? 'F' : 'H';
      if (r.ciment_global && cimentBySexe[s][r.ciment_global] !== undefined)
        cimentBySexe[s][r.ciment_global]++;
    });
    const cats = ['TOUT NON CIMENTÉ', 'MIXTE', 'TOUT CIMENTÉ'];
    _charts['chartCiment'] = new Chart(cimentCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cats.map(c => c.replace('TOUT ','').replace('NON CIMENTÉ','NC').replace('CIMENTÉ','C')),
        datasets: [
          { label: 'Femme', data: cats.map(c => cimentBySexe.F[c]), backgroundColor: C.fD, borderRadius: 4 },
          { label: 'Homme', data: cats.map(c => cimentBySexe.H[c]), backgroundColor: C.hD, borderRadius: 4 },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                const pct = total > 0 ? ((ctx.raw/total)*100).toFixed(1) : 0;
                return ctx.dataset.label + ' : ' + ctx.raw + ' (' + pct + '%)';
              }
            }
          }
        },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        responsive: true,
      }
    });
  }
}

// ============================================================
// TAB 3 — ÉQUIPE
// ============================================================
function renderEquipe() {
  const rows = ((window.MDC?.allRows||[]).filter(r=>!!r.est_reprise===!!(window.MDC?.segmentReprise)));

  // Panseuse individuelle V4 — plus de STRING_AGG
  const count = {};
  rows.forEach(r => {
    if (!r.panseuse) return;
    count[r.panseuse] = (count[r.panseuse] || 0) + 1;
  });

  const total  = Object.values(count).reduce((a,b) => a+b, 0);
  const sorted = Object.entries(count).sort((a,b) => b[1]-a[1]);

  document.getElementById('tablePanseuses').innerHTML = sorted.map(([name, nb], i) => `
    <tr>
      <td class="text-muted">${i+1}</td>
      <td class="fw-semibold small">${window.MDC.escHtml(name)}</td>
      <td class="text-end fw-bold">${nb}</td>
      <td class="text-end text-muted small">${((nb/total)*100).toFixed(1)}%</td>
    </tr>`).join('');

  destroyChart('chartPanseuses');
  const top = sorted.slice(0, 15);
  _charts['chartPanseuses'] = new Chart(
    document.getElementById('chartPanseuses').getContext('2d'), {
    type: 'bar',
    data: {
      labels: top.map(([n]) => n),
      datasets: [{
        label: 'Interventions',
        data: top.map(([,c]) => c),
        backgroundColor: C.palette.slice(0, top.length),
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      responsive: true,
    }
  });
}

// ============================================================
// TAB 4 — PATIENTS
// ============================================================
function renderPatients() {
  const rows  = ((window.MDC?.allRows||[]).filter(r=>!!r.est_reprise===!!(window.MDC?.segmentReprise)));
  const total = rows.length;

  // Sexe individuel V4
  const nbF  = rows.filter(r => r.sexe === 'F').length;
  const nbM  = rows.filter(r => r.sexe === 'M' || r.sexe === 'H').length;
  const nbNC = rows.filter(r => !r.sexe).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiH').textContent     = nbM;
  document.getElementById('kpiF').textContent     = nbF;
  document.getElementById('kpiNC').textContent    = nbNC;

  // Durée moyenne par taille fémur
  const dureeFemur = {};
  rows.forEach(r => {
    if (!r.taille_femur || !r.duree_minutes) return;
    if (!dureeFemur[r.taille_femur]) dureeFemur[r.taille_femur] = [];
    dureeFemur[r.taille_femur].push(parseInt(r.duree_minutes));
  });

  // Pie sexe
  destroyChart('chartSexe');
  _charts['chartSexe'] = new Chart(
    document.getElementById('chartSexe').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Femmes', 'Hommes', 'N/C'],
      datasets: [{
        data: [nbF, nbM, nbNC],
        backgroundColor: [C.fD, C.hD, C.secondary],
        borderWidth: 2,
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label} : ${ctx.raw} (${((ctx.raw/(nbF+nbM+nbNC))*100).toFixed(1)}%)`
          }
        }
      },
      responsive: true,
    }
  });

  // Latéralité
  const latCount = { D: 0, G: 0, B: 0, NC: 0 };
  rows.forEach(r => { const v = r.lateralite || 'NC'; latCount[v] = (latCount[v]||0)+1; });

  destroyChart('chartLateralite');
  _charts['chartLateralite'] = new Chart(
    document.getElementById('chartLateralite').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Gauche', 'Droit', 'Bilatéral', 'N/C'],
      datasets: [
        { label: 'Femme', data: [
            rows.filter(r=>r.lateralite==='D'&&r.sexe==='F').length,
            rows.filter(r=>r.lateralite==='G'&&r.sexe==='F').length,
            rows.filter(r=>r.lateralite==='B'&&r.sexe==='F').length,
            rows.filter(r=>!r.lateralite&&r.sexe==='F').length,
          ], backgroundColor: C.fD, borderRadius: 3 },
        { label: 'Homme', data: [
            rows.filter(r=>r.lateralite==='D'&&(r.sexe==='M'||r.sexe==='H')).length,
            rows.filter(r=>r.lateralite==='G'&&(r.sexe==='M'||r.sexe==='H')).length,
            rows.filter(r=>r.lateralite==='B'&&(r.sexe==='M'||r.sexe==='H')).length,
            rows.filter(r=>!r.lateralite&&(r.sexe==='M'||r.sexe==='H')).length,
          ], backgroundColor: C.hD, borderRadius: 3 },
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      responsive: true,
    }
  });

  // Top protocoles
  const protoCount = {};
  rows.forEach(r => {
    if (!r.protocole_optim) return;
    protoCount[r.protocole_optim] = (protoCount[r.protocole_optim]||0)+1;
  });
  const topP = Object.entries(protoCount).sort((a,b)=>b[1]-a[1]).slice(0,8);

  destroyChart('chartProtocoles');
  _charts['chartProtocoles'] = new Chart(
    document.getElementById('chartProtocoles').getContext('2d'), {
    type: 'bar',
    data: {
      labels: topP.map(([p]) => p.length>35 ? p.slice(0,35)+'…' : p),
      datasets: [{
        label: 'Interventions',
        data: topP.map(([,c])=>c),
        backgroundColor: C.palette.slice(0, topP.length),
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } },
                y: { ticks: { font: { size: 11 } } } },
      responsive: true,
    }
  });

  // Activité mensuelle × sexe
  const monthF = {}, monthH = {};
  rows.forEach(r => {
    const m = r.date_intervention_mois;
    if (!m) return;
    if (r.sexe === 'F') monthF[m] = (monthF[m]||0)+1;
    if (r.sexe === 'M' || r.sexe === 'H') monthH[m] = (monthH[m]||0)+1;
  });
  const months = [...new Set([...Object.keys(monthF), ...Object.keys(monthH)])].sort();

  destroyChart('chartActivite');
  _charts['chartActivite'] = new Chart(
    document.getElementById('chartActivite').getContext('2d'), {
    type: 'line',
    data: {
      labels: months.map(m => window.MDC.fmtMois(m)),
      datasets: [
        { label: 'Femmes', data: months.map(m=>monthF[m]||0),
          borderColor: C.fD, backgroundColor: C.fD+'30',
          fill: true, tension: 0.3, pointRadius: 3 },
        { label: 'Hommes', data: months.map(m=>monthH[m]||0),
          borderColor: C.hD, backgroundColor: C.hD+'30',
          fill: true, tension: 0.3, pointRadius: 3 },
      ]
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
        x: { ticks: { font: { size: 10 }, maxRotation: 45 } }
      },
      responsive: true,
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────
// initAnalytics : appelé par app.js après chargement des données
// Les charts ne se rendent QUE quand le tab est actif (canvas invisible = dimensions nulles)
window.initAnalytics = function() {
  // Rendre immédiatement si le tab est déjà visible
  if (document.getElementById('tab-equipe')?.classList.contains('active')) renderEquipe();
  if (document.getElementById('tab-patients')?.classList.contains('active')) renderPatients();
};

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelector('#mdcTabs');
  if (!tabs) return;
  tabs.querySelector('[data-bs-target="#tab-equipe"]')
    ?.addEventListener('shown.bs.tab', () => {
      if (window.MDC.allRows.length) renderEquipe();
    });
  tabs.querySelector('[data-bs-target="#tab-patients"]')
    ?.addEventListener('shown.bs.tab', () => {
      if (window.MDC.allRows.length) renderPatients();
    });
  tabs.querySelector('[data-bs-target="#tab-implants"]')
    ?.addEventListener('shown.bs.tab', () => {
      if (!window.MDC.allRows.length) return;
      // Sélectionner PTG par défaut et lancer l'analyse automatiquement
      const sel = document.getElementById('selectProtocoleImplant');
      if (!sel) return;
      // Trouver le protocole PTG dans la liste
      const ptgOption = [...sel.options].find(o =>
        o.value.toUpperCase().includes('PROTH') && o.value.toUpperCase().includes('GENOU')
      );
      if (ptgOption && !sel.value) {
        sel.value = ptgOption.value;
        renderImplantAnalyse(ptgOption.value);
      } else if (sel.value) {
        // Si déjà sélectionné, re-rendre (segment a pu changer)
        renderImplantAnalyse(sel.value);
      }
    });
});
