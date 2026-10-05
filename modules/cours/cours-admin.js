/* ============================================================
   cours-admin.js — onglet Stats admin (extrait de admin.html L360-437)
   Module : Cours — Administration (V5.1)
   Doctrine : INTERDIT-JS-01 (zero JS inline), INTERDIT-JS-02 (escHtml socle)
   Chargé après cours-app.js
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', async () => {
    await window.bdbShellReady;
    if (!window.bdbUser?.isAdmin) {
      location.href = '../../index.html';
      return;
    }

    let _statsLoaded = false;

    document.getElementById('tab-stats-btn')?.addEventListener('shown.bs.tab', async () => {
      if (_statsLoaded) return;
      _statsLoaded = true;
      await loadCoursStats();
    });

    document.getElementById('statsRetryBtn')?.addEventListener('click', async () => {
      _statsLoaded = false;
      await loadCoursStats();
    });
  });

  function showStatsState(id) {
    ['statsLoading', 'statsEmpty', 'statsError', 'statsTable'].forEach(s => {
      document.getElementById(s)?.classList.toggle('d-none', s !== id);
    });
  }

  async function loadCoursStats() {
    showStatsState('statsLoading');
    try {
      const [resTotal, resPublished, resDraft, resDev, resCats] = await Promise.all([
        window.bdb.from('cours').select('*', { count: 'exact', head: true }),
        window.bdb.from('cours').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        window.bdb.from('cours').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        window.bdb.from('cours').select('*', { count: 'exact', head: true }).eq('is_dev', true),
        window.bdb.from('cours').select('category_id, status, categories(label)')
      ]);

      if (resTotal.error) throw resTotal.error;

      document.getElementById('statsTotal').textContent     = resTotal.count ?? '—';
      document.getElementById('statsPublished').textContent = resPublished.count ?? '—';
      document.getElementById('statsDraft').textContent     = resDraft.count ?? '—';
      document.getElementById('statsDev').textContent       = resDev.count ?? '—';
      document.getElementById('statsLastRefresh').textContent =
        'Actualisé à ' + new Date().toLocaleTimeString('fr-FR');

      if (!resCats.data || resCats.data.length === 0) {
        showStatsState('statsEmpty');
        return;
      }

      const catMap = {};
      resCats.data.forEach(row => {
        const label = row.categories?.label || 'Sans catégorie';
        if (!catMap[label]) catMap[label] = { total: 0, published: 0, draft: 0 };
        catMap[label].total++;
        if (row.status === 'published') catMap[label].published++;
        else catMap[label].draft++;
      });

      const esc = (typeof window.escHtml === 'function')
        ? window.escHtml
        : (s => { const d = document.createElement('span'); d.textContent = s ?? ''; return d.innerHTML; });

      const rows = Object.entries(catMap)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([label, s]) => `<tr>
          <td>${esc(label)}</td>
          <td class="text-center fw-semibold">${s.total}</td>
          <td class="text-center"><span class="badge bg-success-subtle text-success">${s.published}</span></td>
          <td class="text-center"><span class="badge bg-warning-subtle text-warning">${s.draft}</span></td>
        </tr>`).join('');

      document.getElementById('statsTbody').innerHTML = rows;
      showStatsState('statsTable');
    } catch (err) {
      const msgEl = document.getElementById('statsErrorMsg');
      if (msgEl) msgEl.textContent = err.message || 'Erreur inconnue';
      showStatsState('statsError');
    }
  }
})();
