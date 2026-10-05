/* ============================================================================
   admin-app.js — Module L3 atelier/doctrine/admin.html
   Vue admin minimale : KPIs + liste nœuds à vérifier.
   CDS : escHtml · 3 états · addEventListener · aucun onclick.
   ============================================================================ */

'use strict';

function escHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function $(id) { return document.getElementById(id); }

function toast(msg, kind) {
  kind = kind || 'success';
  const map = { success:'text-bg-success', danger:'text-bg-danger', warning:'text-bg-warning', info:'text-bg-info' };
  const el = document.createElement('div');
  el.className = 'toast align-items-center ' + (map[kind] || map.success) + ' border-0';
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + escHtml(msg)
    + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
  $('toastContainer').appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 3000 });
  t.show();
  el.addEventListener('hidden.bs.toast', function() { el.remove(); });
}

async function loadStats() {
  const list = $('listAVerifier');
  list.innerHTML = '<div class="text-muted">Chargement…</div>';

  try {
    // Compteur global
    const { count: nodeCount, error: e1 } = await window.bdb
      .from('atelier_doctrine_nodes')
      .select('id', { count: 'exact', head: true });
    if (e1) throw e1;
    $('kpiNodes').textContent = nodeCount || 0;

    // Compteur par catégorie
    const { data: cats, error: e2 } = await window.bdb
      .from('atelier_doctrine_nodes')
      .select('categorie');
    if (e2) throw e2;

    let nbPrincipes = 0, nbBiblio = 0;
    (cats || []).forEach(function(r) {
      if (r.categorie === 'principe_nomme') nbPrincipes++;
      else if (r.categorie === 'bibliographie') nbBiblio++;
    });
    $('kpiPrincipes').textContent = nbPrincipes;
    $('kpiBiblio').textContent = nbBiblio;

    // Nœuds à vérifier
    const { data: aVerif, error: e3 } = await window.bdb
      .from('atelier_doctrine_nodes')
      .select('node_key, titre, abbrev, statut, attribution')
      .in('statut', ['a_verifier', 'a_definir', 'placeholder'])
      .order('titre');
    if (e3) throw e3;

    $('kpiAVerifier').textContent = (aVerif || []).length;

    if (!aVerif || aVerif.length === 0) {
      list.innerHTML = '<div class="text-success"><i class="bi bi-check-circle"></i> Tous les nœuds sont en statut actif.</div>';
      return;
    }

    const rows = aVerif.map(function(r) {
      return '<tr>'
        + '<td><code>' + escHtml(r.node_key) + '</code></td>'
        + '<td>' + (r.abbrev ? '<span class="badge bg-light text-dark border me-1">' + escHtml(r.abbrev) + '</span>' : '') + escHtml(r.titre || '') + '</td>'
        + '<td><span class="badge bg-warning text-dark">' + escHtml(r.statut) + '</span></td>'
        + '<td class="text-muted small">' + escHtml(r.attribution || '—') + '</td>'
        + '</tr>';
    }).join('');
    list.innerHTML =
      '<div class="table-responsive">'
      + '<table class="table table-sm table-hover mb-0">'
      + '<thead><tr><th>node_key</th><th>Titre</th><th>Statut</th><th>Attribution</th></tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '</table></div>';

  } catch (e) {
    console.error('loadStats', e);
    list.innerHTML = '<div class="text-danger"><i class="bi bi-x-circle"></i> '
      + escHtml((e && e.message) || 'Erreur de chargement') + '</div>';
    toast((e && e.message) || 'Erreur de chargement', 'danger');
  }
}

async function init() {
  // Attendre le shell
  await new Promise(function(resolve) {
    if (window.bdbUser) return resolve();
    document.addEventListener('bdbShellReady', resolve, { once: true });
    let attempts = 0;
    const iv = setInterval(function() {
      attempts++;
      if (window.bdbUser) { clearInterval(iv); resolve(); }
      else if (attempts > 40) { clearInterval(iv); resolve(); }
    }, 250);
  });

  // Guard isCreator
  if (!window.bdbUser || !window.bdbUser.isCreator) {
    $('guardDenied').classList.remove('d-none');
    $('adminContent').classList.add('d-none');
    return;
  }
  $('guardDenied').classList.add('d-none');
  $('adminContent').classList.remove('d-none');

  $('btnRefreshStats').addEventListener('click', loadStats);
  await loadStats();
}

document.addEventListener('DOMContentLoaded', init);
