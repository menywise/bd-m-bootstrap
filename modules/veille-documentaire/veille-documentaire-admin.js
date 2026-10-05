/* ============================================================
   veille-documentaire-admin.js — Module Dork BDB — Admin (CC-M10)
   CAS A : tables dork_profiles / dork_history / dork_sources
   Vue : profils ALL users + stats
   ============================================================ */

'use strict';

/* ── escHtml ── */
const _escEl = document.createElement('span');
function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

/* ── État ── */
let _profilesLoaded = false;
let _statsLoaded    = false;

/* ── Helpers 3-state ── */
function showProfilesState(id) {
  ['dorkProfLoading', 'dorkProfEmpty', 'dorkProfError', 'dorkProfTable'].forEach(s => {
    document.getElementById(s)?.classList.toggle('d-none', s !== id);
  });
}

function showStatsState(id) {
  ['dorkStatsLoading', 'dorkStatsEmpty', 'dorkStatsError', 'dorkStatsContent'].forEach(s => {
    document.getElementById(s)?.classList.toggle('d-none', s !== id);
  });
}

/* ── Cache noms utilisateurs ── */
let _userMap = {}; // { uid: 'Prénom Nom' }

async function loadUserMap() {
  try {
    const { data } = await window.bdb
      .from('profiles_directory')
      .select('id, prenom, nom');
    if (data) {
      data.forEach(u => { _userMap[u.id] = ((u.prenom || '') + ' ' + (u.nom || '')).trim() || u.id; });
    }
  } catch (_e) { /* silencieux — nom sera remplacé par id */ }
}

function userName(uid) {
  return escHtml(_userMap[uid] || uid || '—');
}

/* ── ONGLET 1 — Profils tous utilisateurs ── */
async function loadDorkProfiles() {
  showProfilesState('dorkProfLoading');
  try {
    await loadUserMap();

    const { data, error } = await window.bdb
      .from('dork_profiles')
      .select('id, user_id, label, tags, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) throw error;
    if (!data || data.length === 0) { showProfilesState('dorkProfEmpty'); return; }

    document.getElementById('dorkProfKpiTotal').textContent = data.length;

    const uniqueUsers = new Set(data.map(p => p.user_id)).size;
    document.getElementById('dorkProfKpiUsers').textContent = uniqueUsers;

    const rows = data.map(p => {
      const label   = escHtml(p.label || '—');
      const tags    = Array.isArray(p.tags) && p.tags.length
        ? p.tags.slice(0, 4).map(t => `<span class="badge bg-secondary-subtle text-secondary me-1">${escHtml(t)}</span>`).join('')
        : '<span class="text-muted small">—</span>';
      const created = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—';
      return `<tr>
        <td class="fw-semibold">${label}</td>
        <td>${userName(p.user_id)}</td>
        <td>${tags}</td>
        <td class="text-muted small">${created}</td>
        <td class="text-center">
          <button type="button" class="btn btn-xs btn-outline-danger dork-admin-del-profile"
            data-id="${escHtml(p.id)}" data-label="${label}" title="Supprimer ce profil">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    document.getElementById('dorkProfTbody').innerHTML = rows;
    showProfilesState('dorkProfTable');
  } catch (err) {
    document.getElementById('dorkProfErrorMsg').textContent = err.message || 'Erreur inconnue';
    showProfilesState('dorkProfError');
  }
}

/* ── ONGLET 2 — Stats ── */
async function loadDorkStats() {
  showStatsState('dorkStatsLoading');
  try {
    const [resProfiles, resHistory, resSources, resValidated] = await Promise.all([
      window.bdb.from('dork_profiles').select('*', { count: 'exact', head: true }),
      window.bdb.from('dork_history').select('*', { count: 'exact', head: true }),
      window.bdb.from('dork_sources').select('*', { count: 'exact', head: true }),
      window.bdb.from('dork_history').select('*', { count: 'exact', head: true }).eq('validated', true)
    ]);

    if (resProfiles.error) throw resProfiles.error;

    document.getElementById('dorkStatsKpiProfiles').textContent  = resProfiles.count  ?? '—';
    document.getElementById('dorkStatsKpiHistory').textContent   = resHistory.count   ?? '—';
    document.getElementById('dorkStatsKpiSources').textContent   = resSources.count   ?? '—';
    document.getElementById('dorkStatsKpiValidated').textContent = resValidated.count ?? '—';

    // Top recherches validées
    const { data: topSearches } = await window.bdb
      .from('dork_history')
      .select('label, label_user, query, rating, user_id')
      .eq('validated', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (!topSearches || topSearches.length === 0) {
      document.getElementById('dorkTopTable').innerHTML =
        '<tr><td colspan="4" class="text-center text-muted small py-3">Aucune recherche validée.</td></tr>';
    } else {
      await loadUserMap();
      const rows = topSearches.map(h => {
        const label  = escHtml(h.label_user || h.label || '—');
        const rating = h.rating != null ? `<span class="badge bg-warning-subtle text-warning">${h.rating}</span>` : '—';
        return `<tr>
          <td class="fw-semibold">${label}</td>
          <td>${userName(h.user_id)}</td>
          <td class="text-muted small text-truncate" style="max-width:200px">${escHtml(h.query || '—')}</td><!-- style= OK : truncation inline -->
          <td class="text-center">${rating}</td>
        </tr>`;
      }).join('');
      document.getElementById('dorkTopTable').innerHTML = rows;
    }

    showStatsState('dorkStatsContent');
  } catch (err) {
    document.getElementById('dorkStatsErrorMsg').textContent = err.message || 'Erreur inconnue';
    showStatsState('dorkStatsError');
  }
}

/* ── Suppression profil ── */
async function deleteProfile(id, label) {
  if (!confirm(`Supprimer le profil "${label}" ? L'historique associé sera également supprimé.`)) return;
  try {
    // Supprimer sources liées
    await window.bdb.from('dork_sources').delete().eq('profile_id', id).select();
    // Supprimer historique lié
    await window.bdb.from('dork_history').delete().eq('profile_id', id).select();
    // Supprimer profil
    const { error } = await window.bdb.from('dork_profiles').delete().eq('id', id).select();
    if (error) throw error;
    bdbToast('Profil supprimé.');
    _profilesLoaded = false;
    await loadDorkProfiles();
  } catch (err) {
    bdbToast('Erreur : ' + (err.message || 'suppression impossible'));
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  if (!window.bdbUser?.isAdmin) { location.href = '../../index.html'; return; }

  // Onglet actif (Profils) — charger immédiatement
  _profilesLoaded = true;
  await loadDorkProfiles();

  // Onglet Stats — lazy
  document.getElementById('tab-dork-stats-btn').addEventListener('shown.bs.tab', async () => {
    if (_statsLoaded) return;
    _statsLoaded = true;
    await loadDorkStats();
  });

  // Retry buttons
  document.getElementById('dorkProfRetryBtn').addEventListener('click', async () => {
    _profilesLoaded = false;
    await loadDorkProfiles();
  });
  document.getElementById('dorkStatsRetryBtn').addEventListener('click', async () => {
    _statsLoaded = false;
    await loadDorkStats();
  });

  // Suppression via délégation sur tbody
  document.getElementById('dorkProfTbody').addEventListener('click', e => {
    const btn = e.target.closest('.veille-documentaire-admin-del-profile');
    if (!btn) return;
    deleteProfile(btn.dataset.id, btn.dataset.label);
  });
});
