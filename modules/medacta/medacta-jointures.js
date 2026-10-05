// ============================================================
// medacta-jointures.js V4
// qualite_jointure : MATCH / SANS_MATCH (binaire en V4)
// Doublons : liste avec verdict chirurgical
// Dépendances : window.MDC (app.js)
// ============================================================
'use strict';

window.initJointures = function() {
  const rows  = window.MDC.allRows;
  const e     = window.MDC.escHtml;
  const fmtTs = window.MDC.fmtTs;

  const match    = rows.filter(r => r.qualite_jointure === 'MATCH');
  const noMatch  = rows.filter(r => r.qualite_jointure === 'SANS_MATCH');
  const doublons = rows.filter(r => r.a_doublon);

  // ── KPIs ──────────────────────────────────────────────────
  document.getElementById('kpiJoinOk').textContent      = match.length;
  document.getElementById('kpiJoinAmbig').textContent   = '—';
  document.getElementById('kpiJoinNoMatch').textContent = noMatch.length;

  // Badge onglet
  const totalPb = noMatch.length + doublons.length;
  const badge   = document.getElementById('mdc-jointure-badge');
  if (totalPb > 0) { badge.textContent = totalPb; badge.classList.remove('d-none'); }
  else badge.classList.add('d-none');

  // Badges sous-onglets
  const badgeAmbig   = document.getElementById('badgeAmbig');
  const badgeNoMatch = document.getElementById('badgeNoMatch');
  if (badgeAmbig)   badgeAmbig.textContent   = doublons.length;
  if (badgeNoMatch) badgeNoMatch.textContent = noMatch.length;

  // ── TABLE DOUBLONS ────────────────────────────────────────
  const tbodyAmbig = document.getElementById('tableAmbigBody');
  if (tbodyAmbig) {
    if (doublons.length === 0) {
      tbodyAmbig.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">
        <i class="bi bi-check-circle text-success me-2"></i>Aucun doublon détecté.</td></tr>`;
    } else {
      tbodyAmbig.innerHTML = doublons.map(r => {
        // Extraire les lignes en double depuis detail_implants
        const lignes = (r.detail_implants || '').split('\n').filter(l => l.trim());
        const refCount = {};
        lignes.forEach(l => {
          const ref = l.split(' — ')[0].trim();
          refCount[ref] = (refCount[ref]||0)+1;
        });
        const doublesRefs = Object.entries(refCount)
          .filter(([,n]) => n > 1)
          .map(([ref, n]) => {
            const libelle = lignes.find(l => l.startsWith(ref + ' —'))?.split(' — ')[1] || '';
            return `<div class="mdc-implant-line border-danger" style="border-left-color:#f87171">
              <div class="mdc-implant-label">${e(libelle)}</div>
              <code class="mdc-implant-ref">${e(ref)} × ${n}</code>
            </div>`;
          }).join('');

        // Verdict chirurgical
        let verdict = '';
        if (r.est_reprise) {
          verdict = `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Reprise</span>`;
        } else if (r.lateralite === 'B') {
          verdict = `<span class="badge bg-warning-subtle text-warning border border-warning-subtle">Lat. B — vérifier saisie</span>`;
        } else {
          verdict = `<span class="badge bg-warning-subtle text-warning border border-warning-subtle">Per-op — implant reposé</span>`;
        }

        return `<tr>
          <td>
            <span class="badge bg-light text-dark border small">${e(fmtTs(r.timestamp_intervention))}</span>
          </td>
          <td>${window.MDC.latHtml(r.lateralite)} ${window.MDC.sexeHtml(r.sexe)}</td>
          <td>${doublesRefs || '<span class="text-muted small">—</span>'}</td>
          <td>${verdict}
            <button class="btn btn-xs btn-outline-secondary ms-1 mdc-btn-sql-doublon"
                    data-ts="${e(r.timestamp_intervention)}"
                    data-cmd="${e(r.code_commande)}"
                    title="SQL diagnostic">
              <i class="bi bi-terminal"></i>
            </button>
          </td>
        </tr>`;
      }).join('');

      tbodyAmbig.querySelectorAll('.mdc-btn-sql-doublon').forEach(btn => {
        btn.addEventListener('click', () =>
          showSqlOffcanvas(genSqlDoublon(btn.dataset.ts, btn.dataset.cmd)));
      });
    }
  }

  // ── TABLE SANS_MATCH ──────────────────────────────────────
  const tbodyNoMatch = document.getElementById('tableNoMatchBody');
  if (tbodyNoMatch) {
    if (noMatch.length === 0) {
      tbodyNoMatch.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">
        <i class="bi bi-check-circle text-success me-2"></i>Toutes les interventions ont un match OPTIM.</td></tr>`;
    } else {
      tbodyNoMatch.innerHTML = noMatch.map(r => `
        <tr>
          <td><code class="small">${e(r.code_commande)}</code></td>
          <td><span class="badge bg-light text-dark border small">${e(fmtTs(r.timestamp_intervention))}</span></td>
          <td>${window.MDC.latHtml(r.lateralite)}</td>
          <td class="small">${r.categories
            ? r.categories.split('|').map(c =>
                `<span class="badge bg-danger-subtle text-danger me-1">${e(c.trim())}</span>`
              ).join('')
            : '—'}</td>
          <td class="text-center">
            <button class="btn btn-xs btn-outline-danger mdc-btn-sql-nomatch"
                    data-ts="${e(r.timestamp_intervention)}"
                    data-lat="${e(r.lateralite||'')}"
                    title="SQL diagnostic">
              <i class="bi bi-terminal"></i>
            </button>
          </td>
        </tr>`).join('');

      tbodyNoMatch.querySelectorAll('.mdc-btn-sql-nomatch').forEach(btn => {
        btn.addEventListener('click', () =>
          showSqlOffcanvas(genSqlNoMatch(btn.dataset.ts, btn.dataset.lat)));
      });
    }
  }

  // ── BLOC SQL GLOBAL ───────────────────────────────────────
  renderSqlGlobal(match, noMatch, doublons);

  // Copier tout
  const btnCopy = document.getElementById('btnCopyAllSql');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('sqlBlock').textContent)
        .then(() => window.MDC.toast('success', 'SQL copié dans le presse-papier.'));
    });
  }
};

// ── GÉNÉRATION SQL ────────────────────────────────────────────

function genSqlDoublon(ts, cmd) {
  return `-- Diagnostic doublon — Code commande : ${cmd}
-- Timestamp : ${ts}

-- 1. Toutes les lignes de ce code commande dans Medacta
SELECT
    "Code Commande",
    "Réf fabricant",
    "Nom Produit",
    "Catégorie",
    COUNT(*) AS nb_fois
FROM staging_medacta_coste
WHERE "Code Commande" = '${cmd}'
GROUP BY 1,2,3,4
ORDER BY nb_fois DESC, "Catégorie";

-- 2. Ligne OPTIM correspondante
SELECT
    id, date_intervention, chirurgien,
    protocole_operatoire, lateralite, sexe,
    panseuse, duree_minutes, note
FROM staging_interventions_ortho
WHERE TO_TIMESTAMP(date_intervention, 'MM/DD/YY HH24:MI')
    = TO_TIMESTAMP('${ts.replace('+00','').trim()}', 'YYYY-MM-DD HH24:MI:SS');`;
}

function genSqlNoMatch(ts, lat) {
  // Extraire juste la date (YYYY-MM-DD HH:MM)
  const datePart = ts ? ts.split('+')[0].trim() : '';
  return `-- Diagnostic SANS_MATCH — ${datePart} côté ${lat || 'N/C'}

-- 1. Recherche OPTIM au timestamp exact
SELECT id, date_intervention, chirurgien,
       protocole_operatoire, lateralite, sexe, panseuse
FROM staging_interventions_ortho
WHERE TO_TIMESTAMP(date_intervention, 'MM/DD/YY HH24:MI')
    = TO_TIMESTAMP('${datePart}', 'YYYY-MM-DD HH24:MI:SS');

-- 2. Recherche élargie ±1 jour (si heure légèrement différente)
SELECT id, date_intervention, chirurgien,
       protocole_operatoire, lateralite, sexe, panseuse
FROM staging_interventions_ortho
WHERE chirurgien ILIKE '%X%'
  AND TO_TIMESTAMP(date_intervention, 'MM/DD/YY HH24:MI')::date
    BETWEEN ('${datePart}'::timestamp::date - INTERVAL '1 day')
        AND ('${datePart}'::timestamp::date + INTERVAL '1 day')
ORDER BY date_intervention;

-- 3. Graphies chirurgien ce jour
SELECT DISTINCT chirurgien, date_intervention
FROM staging_interventions_ortho
WHERE TO_TIMESTAMP(date_intervention, 'MM/DD/YY HH24:MI')::date
    = '${datePart}'::timestamp::date;`;
}

function renderSqlGlobal(match, noMatch, doublons) {
  const sections = [];

  sections.push(`-- ============================================================
-- DIAGNOSTIC GLOBAL — vue_medacta_coste_implants V4
-- Jointure timestamp exact (date + heure)
-- ============================================================

-- 1. Qualité jointure globale
SELECT qualite_jointure, COUNT(*) AS nb,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS pct
FROM vue_medacta_coste_implants
GROUP BY 1 ORDER BY 1;

-- 2. Segmentation PTG primaires vs reprises
SELECT est_reprise, qualite_jointure, COUNT(*) AS nb
FROM vue_medacta_coste_implants
GROUP BY 1,2 ORDER BY 1,2;

-- 3. Doublons détectés
SELECT timestamp_intervention, lateralite, sexe,
       est_reprise, detail_implants
FROM vue_medacta_coste_implants
WHERE a_doublon = TRUE
ORDER BY timestamp_intervention;`);

  if (noMatch.length > 0) {
    sections.push(`
-- 4. Recherche des SANS_MATCH dans staging_interventions_ortho
-- (timestamps Medacta sans correspondance OPTIM)
SELECT
    m."Code Commande",
    m."Date utilisation",
    m."Catégorie"
FROM staging_medacta_coste m
WHERE TO_TIMESTAMP(m."Date utilisation", 'MM/DD/YY HH24:MI') NOT IN (
    SELECT TO_TIMESTAMP(o.date_intervention, 'MM/DD/YY HH24:MI')
    FROM staging_interventions_ortho o
    WHERE o.chirurgien ILIKE '%X%'
      AND o.date_clean >= '2023-08-01'
)
GROUP BY 1,2,3
ORDER BY m."Date utilisation";`);
  }

  sections.push(`
-- 5. Stats médicales : tailles fémur × sexe × côté (PTG primaires)
SELECT taille_femur, sexe, lateralite, COUNT(*) AS nb
FROM vue_medacta_coste_implants
WHERE NOT est_reprise AND taille_femur IS NOT NULL
GROUP BY 1,2,3 ORDER BY 1,2,3;

-- 6. Ciment × sexe (PTG primaires)
SELECT ciment_global, sexe, COUNT(*) AS nb
FROM vue_medacta_coste_implants
WHERE NOT est_reprise
GROUP BY 1,2 ORDER BY 1,2;

-- 7. Top patterns combinaisons × sexe (PTG primaires)
SELECT pattern_combinaison, sexe, COUNT(*) AS nb
FROM vue_medacta_coste_implants
WHERE NOT est_reprise AND pattern_combinaison IS NOT NULL
GROUP BY 1,2 ORDER BY nb DESC
LIMIT 20;`);

  const sqlBlock = document.getElementById('sqlBlock');
  if (sqlBlock) sqlBlock.textContent = sections.join('\n');
}

// ── OFFCANVAS SQL ─────────────────────────────────────────────
function showSqlOffcanvas(sql) {
  let oc = document.getElementById('mdcSqlOffcanvas');
  if (!oc) {
    oc = document.createElement('div');
    oc.id = 'mdcSqlOffcanvas';
    oc.className = 'offcanvas offcanvas-bottom';
    oc.setAttribute('tabindex', '-1');
    oc.style.maxHeight = '55vh';
    oc.innerHTML = `
      <div class="offcanvas-header border-bottom">
        <h6 class="offcanvas-title fw-semibold">
          <i class="bi bi-terminal me-2 text-muted"></i>Requête SQL de diagnostic
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="d-flex justify-content-end p-2 border-bottom">
          <button class="btn btn-xs btn-outline-secondary" id="mdcSqlCopyBtn">
            <i class="bi bi-clipboard me-1"></i>Copier
          </button>
        </div>
        <pre class="mdc-sql-block m-0" id="mdcSqlContent"></pre>
      </div>`;
    document.body.appendChild(oc);
    document.getElementById('mdcSqlCopyBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('mdcSqlContent').textContent)
        .then(() => window.MDC.toast('success', 'SQL copié.'));
    });
  }
  document.getElementById('mdcSqlContent').textContent = sql;
  bootstrap.Offcanvas.getOrCreateInstance(oc).show();
}
