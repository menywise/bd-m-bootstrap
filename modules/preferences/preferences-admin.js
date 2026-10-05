// ============================================================
// preferences-admin.js — Bloc admin du module Préférences (S128)
// Extrait de admin.html L693+ (INTERDIT-JS-01)
// Guard admin + Couverture tab (CC-M07)
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  if (!window.bdbUser?.isAdmin) { location.href = '../../index.html'; return; }

  let _couvLoaded = false;

  document.getElementById('tab-couverture-btn').addEventListener('shown.bs.tab', async () => {
    if (_couvLoaded) return;
    _couvLoaded = true;
    await loadCouverture();
  });

  document.getElementById('couvRetryBtn').addEventListener('click', async () => {
    _couvLoaded = false;
    await loadCouverture();
  });
});

function showCouvState(id) {
  ['couvLoading', 'couvEmpty', 'couvError', 'couvTable'].forEach(s => {
    document.getElementById(s)?.classList.toggle('d-none', s !== id);
  });
}

async function loadCouverture() {
  showCouvState('couvLoading');
  try {
    const [{ data: chirs, error: e1 }, { data: prefs, error: e2 }] = await Promise.all([
      window.bdb.from('profiles_directory').select('id, prenom, nom').eq('approved', true).order('nom'),
      window.bdb.from('preferences_chirurgien').select('chirurgien_id, is_global')
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    if (!chirs || chirs.length === 0) { showCouvState('couvEmpty'); return; }

    // Agréger par chirurgien
    const map = {};
    (prefs || []).forEach(p => {
      if (!map[p.chirurgien_id]) map[p.chirurgien_id] = { total: 0, global: 0, proto: 0 };
      map[p.chirurgien_id].total++;
      if (p.is_global) map[p.chirurgien_id].global++;
      else map[p.chirurgien_id].proto++;
    });

    const covered = chirs.filter(c => map[c.id] && map[c.id].total > 0).length;
    const missing = chirs.length - covered;
    const totalPrefs = (prefs || []).length;

    document.getElementById('couvKpiTotal').textContent = chirs.length;
    document.getElementById('couvKpiCovered').textContent = covered;
    document.getElementById('couvKpiMissing').textContent = missing;
    document.getElementById('couvKpiPrefs').textContent = totalPrefs;

    // Badges sémantiques en variantes subtle (INTERDIT-COULEUR-SATUREE-01)
    const rows = chirs.map(c => {
      const s = map[c.id] || { total: 0, global: 0, proto: 0 };
      const countBadge = s.total === 0
        ? '<span class="badge bg-danger-subtle text-danger-emphasis">Aucune</span>'
        : `<span class="badge bg-success-subtle text-success-emphasis">${s.total}</span>`;
      const globalCell = s.global > 0
        ? `<span class="badge pref-badge-global">${s.global}</span>`
        : '<span class="text-muted">—</span>';
      const protoCell = s.proto > 0
        ? `<span class="badge bg-secondary-subtle text-secondary-emphasis">${s.proto}</span>`
        : '<span class="text-muted">—</span>';
      return `<tr>
        <td class="fw-semibold">${escHtml((c.prenom || '') + ' ' + (c.nom || ''))}</td>
        <td class="text-center">${countBadge}</td>
        <td class="text-center">${globalCell}</td>
        <td class="text-center">${protoCell}</td>
        <td class="text-center">
          <button type="button" class="btn btn-xs btn-outline-secondary pref-admin-chir-filter"
            data-chir-id="${escHtml(c.id)}" title="Filtrer sur ce chirurgien">
            <i class="bi bi-funnel"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    document.getElementById('couvTbody').innerHTML = rows;
    document.getElementById('couvLastRefresh').textContent =
      'Actualisé à ' + new Date().toLocaleTimeString('fr-FR');

    // Filtre rapide : bascule vers l'onglet Préférences et filtre par chirurgien
    document.getElementById('couvTbody').addEventListener('click', e => {
      const btn = e.target.closest('.pref-admin-chir-filter');
      if (!btn) return;
      const sel = document.getElementById('pChirurgien');
      if (sel) { sel.value = btn.dataset.chirId; sel.dispatchEvent(new Event('change')); }
      const tabBtn = document.getElementById('tab-prefs-btn');
      (bootstrap.Tab.getInstance(tabBtn) || new bootstrap.Tab(tabBtn)).show();
    });

    showCouvState('couvTable');
  } catch (err) {
    document.getElementById('couvErrorMsg').textContent = err.message || 'Erreur inconnue';
    showCouvState('couvError');
  }
}
