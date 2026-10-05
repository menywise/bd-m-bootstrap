/* ================================================================
   ccam-app.js — BDB Atelier / CCAM Validator
   Orphelins : thesaurus_protocoles LEFT JOIN protocole_ccam WHERE NULL
   Candidats : referentiel_ccam (8 292 codes ATIH) — recherche client-side
   Export SQL : INSERT INTO protocole_ccam (protocole_id, ccam_acte_id, rang)
   CDS Compliant | escHtml | 3 états | bdbShellReady
   ================================================================ */

/* --- Utilitaires DOM --- */
function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none'); }

/* ================================================================
   ÉTAT GLOBAL
   ================================================================ */
const ccamState = {
  orphelins:  [],   // { id, id_protocole, libelle_cible, specialite, frequence }
  referentiel:[],   // { id, code_ccam, libelle }
  modalSql:   null
};

/* ================================================================
   RECHERCHE CANDIDATS
   Score simple : nombre de mots du libelle_cible trouvés dans libelle
   ================================================================ */
function mots(str) {
  return (str || '').toLowerCase()
    .replace(/[()[\]\/\-,;:.!?]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
}

function scorerCandidats(orphelin) {
  const termes = mots(orphelin.libelle_cible);
  if (!termes.length) return [];

  const scored = ccamState.referentiel
    .map(r => {
      const libMots = mots(r.libelle);
      const matched = termes.filter(t => r.libelle.toLowerCase().includes(t));
      const score   = matched.length / termes.length;
      return { ...r, score, matched };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || b.libelle.localeCompare(a.libelle, 'fr'))
    .slice(0, 8);

  return scored;
}

/* ================================================================
   RENDER UN ORPHELIN
   ================================================================ */
function renderCard(orphelin) {
  const candidats = scorerCandidats(orphelin);
  const hasCand   = candidats.length > 0;
  const oid       = escHtml(orphelin.id);
  const freq      = orphelin.frequence ?? 0;

  let candsHtml = '';
  if (hasCand) {
    candsHtml = candidats.map((c, i) => {
      const termes = mots(orphelin.libelle_cible);
      const pills  = mots(c.libelle)
        .slice(0, 12)
        .map(w => {
          const isMatch = termes.includes(w);
          return '<span class="badge ' + (isMatch ? 'text-bg-success' : 'text-bg-light border') + ' me-1">' + escHtml(w) + '</span>';
        }).join('');
      const pct = Math.round(c.score * 100);
      const cbId = 'cb-' + oid + '-' + i;

      return '<label class="ccam-cand-label d-flex gap-2 align-items-start p-2 border rounded mb-1" for="' + cbId + '">' +
        '<input type="checkbox" id="' + cbId + '" class="ccam-cr form-check-input flex-shrink-0 mt-1"' +
        ' data-orphelin-id="' + oid + '" data-cand-idx="' + i + '" value="' + i + '"/>' +
        '<div class="flex-grow-1">' +
          '<div class="d-flex align-items-center gap-2 mb-1">' +
            '<span class="badge text-bg-primary">' + escHtml(c.code_ccam) + '</span>' +
            '<span class="small text-muted">' + pct + '% match</span>' +
          '</div>' +
          '<div class="small text-secondary">' + escHtml(c.libelle.slice(0, 120)) +
            (c.libelle.length > 120 ? '…' : '') + '</div>' +
          '<div class="mt-1">' + pills + '</div>' +
        '</div>' +
      '</label>';
    }).join('');
  } else {
    candsHtml = '<div class="text-center py-3 text-muted small">' +
      '<i class="bi bi-search me-1"></i>Aucun candidat trouvé dans le référentiel ATIH' +
    '</div>';
  }

  const cardEl = document.createElement('div');
  cardEl.className = 'ccam-card card bo-card mb-3' + (hasCand ? ' bo-accent-success' : ' bo-accent-danger');
  cardEl.dataset.orphelinId = orphelin.id;
  cardEl.dataset.spe        = (orphelin.specialite || '').toUpperCase();
  cardEl.dataset.lib        = (orphelin.libelle_cible || '').toLowerCase();
  cardEl.dataset.hasCand    = hasCand ? '1' : '0';

  cardEl.innerHTML =
    '<div class="card-body p-3">' +
      '<div>' +
        '<div class="small fw-bold text-muted">' + escHtml(orphelin.id_protocole) + '</div>' +
        '<div class="fw-semibold">' + escHtml(orphelin.libelle_cible) + '</div>' +
        '<div class="small text-muted mt-1">' +
          (orphelin.specialite ? '<span class="badge bg-secondary me-1">' + escHtml(orphelin.specialite) + '</span>' : '') +
          '<span class="small text-muted">Fréquence : ' + escHtml(freq) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="small fw-bold text-uppercase text-muted mt-2 mb-1 px-3">Candidats CCAM</div>' +
    '<div class="px-3 pb-3">' + candsHtml + '</div>';

  return cardEl;
}

/* ================================================================
   RENDER LISTE COMPLÈTE
   ================================================================ */
function renderList() {
  const listEl = document.getElementById('ccam-list');
  listEl.innerHTML = '';

  ccamState.orphelins.forEach(o => {
    listEl.appendChild(renderCard(o));
  });

  updateStats();
  applyFilters();
}

/* ================================================================
   STATS + FILTRES
   ================================================================ */
function updateStats() {
  const cards   = [...document.querySelectorAll('.ccam-card')];
  const withC   = cards.filter(c => c.dataset.hasCand === '1').length;
  const checked = [...document.querySelectorAll('.ccam-cr:checked')];
  const nbLinks = checked.length;
  const nbProtos= new Set(checked.map(cb => cb.dataset.orphelinId)).size;

  document.getElementById('ccam-stat-total').textContent   = ccamState.orphelins.length + ' orphelins';
  document.getElementById('ccam-stat-with').textContent    = withC + ' avec candidats';
  document.getElementById('ccam-stat-without').textContent = (ccamState.orphelins.length - withC) + ' sans candidat';
  document.getElementById('ccam-stat-sel').textContent     = nbLinks + ' liens / ' + nbProtos + ' protocoles';
}

function applyFilters() {
  const spe    = document.getElementById('ccam-f-spe').value.toUpperCase();
  const cand   = document.getElementById('ccam-f-cand').value;
  const search = document.getElementById('ccam-f-search').value.toLowerCase().trim();

  document.querySelectorAll('.ccam-card').forEach(card => {
    let visible = true;
    if (spe    && !card.dataset.spe.includes(spe)) visible = false;
    if (search && !card.dataset.lib.includes(search)) visible = false;
    if (cand === 'with'    && card.dataset.hasCand !== '1') visible = false;
    if (cand === 'without' && card.dataset.hasCand !== '0') visible = false;
    if (cand === 'sel'     && !card.querySelector('.ccam-cr:checked')) visible = false;
    card.classList.toggle('d-none', !visible);
  });
}

/* ================================================================
   EXPORT SQL
   ================================================================ */
function exportSql() {
  const lines = [];
  let countLinks = 0, countProtos = 0;

  ccamState.orphelins.forEach(orphelin => {
    const checked = [...document.querySelectorAll(
      '.ccam-cr[data-orphelin-id="' + orphelin.id + '"]:checked'
    )];
    if (!checked.length) return;

    countProtos++;
    const candidats = scorerCandidats(orphelin);
    lines.push('-- ' + orphelin.id_protocole + ' | ' + orphelin.libelle_cible +
               ' (fréquence ' + (orphelin.frequence ?? 0) + ')');

    checked.forEach(cb => {
      const idx  = parseInt(cb.value, 10);
      const cand = candidats[idx];
      if (!cand) return;
      const rang = idx + 1;
      lines.push('--   rang ' + rang + ' : ' + cand.code_ccam +
                 ' score:' + Math.round(cand.score * 100) + '% | ' + cand.libelle.slice(0, 70));
      lines.push('INSERT INTO protocole_ccam (protocole_id, ccam_acte_id, rang)');
      lines.push("  VALUES ('" + orphelin.id + "', '" + cand.id + "', " + rang + ');');
      countLinks++;
    });
    lines.push('');
  });

  const ts = new Date().toISOString().slice(0, 19);
  const sql = countLinks > 0
    ? '-- CCAM Validator export -- ' + ts + '\n' +
      '-- ' + countLinks + ' lien(s) sur ' + countProtos + ' protocole(s)\n' +
      '-- Le trigger trg_sync_codes_ccam met à jour codes_ccam automatiquement\n\n' +
      'BEGIN;\n\n' + lines.join('\n') + '\nCOMMIT;\n'
    : '-- Aucune sélection\n-- Cocher au moins un candidat CCAM par orphelin.';

  document.getElementById('ccam-sql-output').value = sql;
  document.getElementById('ccam-sql-stats').textContent = countLinks > 0
    ? countLinks + ' lien(s) sur ' + countProtos + ' protocole(s). ' +
      'Le trigger sync_codes_ccam se déclenchera automatiquement.'
    : 'Aucune sélection — cocher au moins un candidat par orphelin.';

  ccamState.modalSql.show();
}

/* ================================================================
   CHARGEMENT DONNÉES
   ================================================================ */
async function loadData() {
  const DB = window.bdb;
  show('ccam-list-loading');
  hide('ccam-list');
  hide('ccam-list-error');
  document.getElementById('ccam-list').innerHTML = '';

  try {
    // 1. Récupérer les protocole_id déjà liés dans protocole_ccam
    //    (source de vérité — codes_ccam text[] n'est pas filtrable via REST)
    const { data: linked, error: errL } = await DB
      .from('protocole_ccam')
      .select('protocole_id');
    if (errL) throw errL;

    const linkedIds = [...new Set((linked || []).map(r => r.protocole_id))];

    // 2. Tous les protocoles, exclusion via NOT IN
    let query = DB
      .from('thesaurus_protocoles')
      .select('id, id_protocole, libelle_cible, specialite, frequence')
      .order('frequence', { ascending: false })
      .limit(500);

    if (linkedIds.length > 0) {
      query = query.not('id', 'in', '(' + linkedIds.join(',') + ')');
    }

    const { data: combined, error: errO } = await query;
    if (errO) throw errO;

    ccamState.orphelins = combined || [];

    if (!combined.length) {
      hide('ccam-list-loading');
      document.getElementById('ccam-list').innerHTML =
        '<div class="text-center py-5 text-success">' +
          '<i class="bi bi-check-circle-fill d-block mb-2 fs-1 text-success"></i>' +
          '<strong>Aucun orphelin CCAM !</strong><br>' +
          '<span class="text-muted small">Tous les protocoles ont au moins un code CCAM associé.</span>' +
        '</div>';
      show('ccam-list');
      updateStats();
      return;
    }

    // 2. Référentiel CCAM — chargement paginated (8 292 codes)
    const REF = [];
    let from = 0;
    const CHUNK = 1000;
    while (true) {
      const { data: chunk, error: errR } = await DB
        .from('referentiel_ccam')
        .select('id, code_ccam, libelle')
        .range(from, from + CHUNK - 1);
      if (errR) throw errR;
      if (!chunk?.length) break;
      REF.push(...chunk);
      if (chunk.length < CHUNK) break;
      from += CHUNK;
    }
    ccamState.referentiel = REF;

    hide('ccam-list-loading');
    renderList();
    show('ccam-list');

  } catch (err) {
    hide('ccam-list-loading');
    const errEl = document.getElementById('ccam-list-error-msg');
    errEl.innerHTML =
      '<i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(err.message) +
      ' <button class="btn btn-sm btn-outline-danger ms-2" id="ccam-retry">Réessayer</button>';
    show('ccam-list-error');
    document.getElementById('ccam-retry')
      ?.addEventListener('click', loadData);
  }
}

/* ================================================================
   POINT D'ENTRÉE
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  (async () => {
    await window.bdbShellReady;
    if (!window.bdbUser) return;

    if (!window.bdbUser.isAdmin) {
      hide('ccam-loading');
      show('ccam-denied');
      return;
    }

    ccamState.modalSql = new bootstrap.Modal(document.getElementById('ccam-modal-sql'));

    hide('ccam-loading');
    show('ccam-content');
    await loadData();

    /* --- Listeners --- */

    // Filtres
    ['ccam-f-spe', 'ccam-f-cand', 'ccam-f-search'].forEach(id => {
      document.getElementById(id).addEventListener('input', applyFilters);
    });

    // Changement checkbox (délégation)
    document.getElementById('ccam-list').addEventListener('change', e => {
      if (!e.target.classList.contains('ccam-cr')) return;
      const lbl = e.target.closest('.ccam-cand-label');
      if (lbl) {
        lbl.classList.toggle('bg-success-subtle', e.target.checked);
        lbl.classList.toggle('border-success', e.target.checked);
      }
      // Mettre à jour l'accent de la card
      const card = e.target.closest('.ccam-card');
      if (card) {
        const hasSel = !!card.querySelector('.ccam-cr:checked');
        card.classList.toggle('bo-accent-primary', hasSel);
        if (hasSel) {
          card.classList.remove('bo-accent-success', 'bo-accent-danger');
        } else {
          // Restaurer l'accent d'origine
          var orig = card.dataset.hasCand === '1' ? 'bo-accent-success' : 'bo-accent-danger';
          card.classList.remove('bo-accent-primary');
          card.classList.add(orig);
        }
      }
      updateStats();
    });

    // Export SQL
    document.getElementById('ccam-btn-export').addEventListener('click', exportSql);

    // Copier SQL
    document.getElementById('ccam-btn-copy').addEventListener('click', async () => {
      const btn = document.getElementById('ccam-btn-copy');
      try {
        await navigator.clipboard.writeText(document.getElementById('ccam-sql-output').value);
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check me-1"></i>Copié !';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      } catch (_) { /* clipboard non disponible */ }
    });

    // Recharger
    document.getElementById('ccam-btn-reload').addEventListener('click', loadData);

  })();
});
