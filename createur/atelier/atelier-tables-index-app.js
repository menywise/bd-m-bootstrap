/* ================================================================
   atelier-tables-index-app.js — Hub sélecteur tables Créateur
   V2.0.0 (S#95 Tour 2) — Kit BO + Bootstrap natif (T-02 Option B)
   CDS Compliant | escHtml | bdbShellReady
   ================================================================ */

(function () {
  'use strict';

  /* Catalogue des tables disponibles */
  var TABLES_CATALOGUE = [
    {
      id      : 'app-modules',
      label   : 'Modules de navigation',
      desc    : 'app_modules — statut, visibilité, position, icône',
      icon    : 'bi-grid-3x3-gap-fill',
      color   : '#0d6efd',
      bg      : '#e7f1ff',
      table   : 'app_modules',
      href    : 'app-modules.html'
    },
    {
      id      : 'app-groups',
      label   : 'Groupes de navigation',
      desc    : 'app_groups — label, icône, couleur, position',
      icon    : 'bi-collection-fill',
      color   : '#6610f2',
      bg      : '#ede7fd',
      table   : 'app_groups',
      href    : 'app-modules.html#groups'
    },
    {
      id      : 'fonctions-metier',
      label   : 'Fonctions métier',
      desc    : 'fonctions_metier — code, label, catégorie, position',
      icon    : 'bi-person-badge-fill',
      color   : '#198754',
      bg      : '#d1e7dd',
      table   : 'fonctions_metier',
      href    : 'fonctions-metier.html',
      disabled: true,
      soon    : true
    },
    {
      id      : 'pref-referentiels',
      label   : 'Référentiels préférences',
      desc    : 'pref_referentiels — catégorie, libellé, ordre',
      icon    : 'bi-sliders',
      color   : '#fd7e14',
      bg      : '#fff3e0',
      table   : 'pref_referentiels',
      href    : 'pref-referentiels.html',
      disabled: true,
      soon    : true
    }
  ];

  /* ── Render ────────────────────────────────────────────────── */
  async function loadKpis() {
    var tables = ['app_modules', 'app_groups', 'fonctions_metier', 'pref_referentiels'];
    var ids    = ['kpiModules', 'kpiGroups', 'kpiFonctions', 'kpiReferentiels'];
    await Promise.all(tables.map(function (t, i) {
      return BdbCrud.renderCount(ids[i], t);
    }));
  }

  async function loadGrid() {
    var counts = {};
    try {
      await Promise.all(TABLES_CATALOGUE.map(async function (t) {
        var r = await window.bdb.from(t.table).select('id', { count: 'exact', head: true });
        counts[t.id] = r.error ? '—' : (r.count ?? 0);
      }));
    } catch (e) {
      document.getElementById('tablesSkeleton').classList.add('d-none');
      document.getElementById('tablesError').classList.remove('d-none');
      document.getElementById('tablesErrorMsg').textContent = 'Erreur chargement : ' + e.message;
      return;
    }

    var html = TABLES_CATALOGUE.map(function (t) {
      var disabled = t.disabled ? 'aria-disabled="true" tabindex="-1"' : '';
      var disabledCls = t.disabled ? ' opacity-50 pe-none' : '';
      var badge = t.soon
        ? '<span class="badge text-bg-warning small ms-1">Bientôt</span>'
        : '';
      /* EXCEPTION-C2-COULEUR-DB sur icon : couleurs catalogue figé */
      return [
        '<div class="col-12 col-md-6 col-lg-4">',
        '  <a href="' + BdbCrud.esc(t.href) + '" class="card bo-card bo-hover text-decoration-none text-body h-100 p-3 d-block' + disabledCls + '" ' + disabled + '>',
        '    <div class="d-flex align-items-center gap-3 mb-2">',
        '      <div class="bo-icon-badge" style="background:' + BdbCrud.esc(t.bg) + ';color:' + BdbCrud.esc(t.color) + ';">',
        '        <i class="bi ' + BdbCrud.esc(t.icon) + '"></i>',
        '      </div>',
        '      <div class="flex-grow-1">',
        '        <div class="fw-bold">' + BdbCrud.esc(t.label) + badge + '</div>',
        '        <div class="small text-muted">' + BdbCrud.esc(String(counts[t.id])) + ' lignes</div>',
        '      </div>',
        '      <i class="bi bi-chevron-right text-secondary"></i>',
        '    </div>',
        '    <div class="small text-muted">' + BdbCrud.esc(t.desc) + '</div>',
        '  </a>',
        '</div>'
      ].join('\n');
    }).join('\n');

    document.getElementById('tablesSkeleton').classList.add('d-none');
    document.getElementById('tablesGrid').innerHTML = html;
    document.getElementById('tablesGrid').classList.remove('d-none');
  }

  /* ── Init (pattern await direct) ──────────────────────────── */
  document.addEventListener('DOMContentLoaded', async function () {
    await window.bdbShellReady;

    if (!window.bdbUser || !window.bdbUser.isCreator) {
      document.getElementById('guardDenied').classList.remove('d-none');
      return;
    }
    document.getElementById('creatorContent').classList.remove('d-none');

    await Promise.all([loadKpis(), loadGrid()]);
  });

})();
