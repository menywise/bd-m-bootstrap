/* ================================================================
   atelier-app.js — BDB Atelier L3 Créateur
   Portail L3 — atelier/index.html (HUB)
   V4 (S#95 réparation) : .bo-* + Bootstrap natif | IDs at-* kebab-case
   CDS Compliant | escHtml | 3 états | await window.bdbShellReady
   ================================================================ */

(function () {
  'use strict';

  /* --- Catalogue outils portail (cards) --- */

  var AT_OUTILS = [
    { id:'session-ia',       icon:'bi-cpu-fill',          titre:'Session IA',      desc:"Gouvernance des sessions Claude — ouvrir, clôturer, terrain live, décisions, arbitrages.", href:'session-ia.html',      statut:'beta'  },
    { id:'diagnostic',       icon:'bi-heart-pulse',       titre:'Diagnostic',      desc:"Tests connexion Supabase, auth, schéma tables, IDs DOM critiques.",                      href:'diagnostic.html',      statut:'beta'  },
    { id:'schema-audit',     icon:'bi-diagram-3',         titre:'Audit Schéma',    desc:"Colonnes réelles depuis information_schema — détecter les écarts terrain vs DATA_MODEL.", href:'schema-audit.html',    statut:'beta'  },
    { id:'memo',             icon:'bi-sticky-fill',       titre:'Mémo',            desc:"Antisèche gouvernance + penses-bêtes persistants en base Supabase.",                     href:'memo.html',            statut:'beta'  },
    { id:'overview',         icon:'bi-grid-3x2-gap-fill', titre:'Overview',        desc:"Vue d'ensemble dynamique — modules, roadmap, décisions, anomalies.",                    href:'overview.html',        statut:'beta'  },
    { id:'ccam',             icon:'bi-hash',              titre:'CCAM Orphelins',  desc:"Identification et validation des codes CCAM manquants dans le thésaurus.",             href:'ccam.html',            statut:'beta'  },
    { id:'ccam-validator',   icon:'bi-check2-square',     titre:'CCAM Batch',      desc:"Traitement par lots des codes CCAM — validation massive.",                              href:'ccam-validator.html',  statut:'beta'  },
    { id:'glossaire-feeder', icon:'bi-book-half',         titre:'Glossaire Feeder',desc:"Alimentation et enrichissement du glossaire depuis sources externes.",                 href:'glossaire-feeder.html',statut:'beta'  },
    { id:'atelier-tables',   icon:'bi-table',             titre:'Tables',          desc:"CRUD tables socle — app_modules, app_groups (PhpMyAdmin).",                             href:'atelier-tables-index.html', statut:'beta'  },
    /* Outils locaux (file://) — détection + copyPath si http */
    { id:'cockpit',          icon:'bi-speedometer2',      titre:'Cockpit',         desc:"Scripts, gouvernance, arborescence, KPIs — généré par build-cockpit.bat.",              href:'cockpit.html',         statut:'local', localPath:'C:\\DEV\\BIBLE_DE_BLOC\\atelier\\cockpit.html'  },
    { id:'compat',           icon:'bi-phone',             titre:'Compat',          desc:"Audit Safari/iOS — JS ES2020+, CSS, Web APIs, checklist manuelle.",                      href:'compat.html',          statut:'local', localPath:'C:\\DEV\\BIBLE_DE_BLOC\\atelier\\compat.html'   },
    { id:'conseil',          icon:'bi-shield-check',      titre:'Conseil',         desc:"Validation livrable — 5 lunettes (Terrain, Architecture, Marché, Philosophie, Créateur).", href:'../conseil/index.html', statut:'local', localPath:'C:\\DEV\\BIBLE_DE_BLOC\\conseil\\index.html' }
  ];

  /* true si ouvert depuis le disque local (file://) */
  var AT_IS_LOCAL = location.protocol === 'file:';

  /* --- Helpers DOM --- */

  function show(id) { var el = document.getElementById(id); if (el) el.classList.remove('d-none'); }
  function hide(id) { var el = document.getElementById(id); if (el) el.classList.add('d-none'); }

  function escHtmlSafe(s) {
    if (typeof window.escHtml === 'function') return window.escHtml(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function copyPath(path, btnId) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(path).then(function () {
      var btn = document.getElementById(btnId);
      if (!btn) return;
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié';
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-success');
      setTimeout(function () {
        btn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copier chemin';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-outline-secondary');
      }, 2000);
    });
  }

  /* --- Banner session active --- */

  function renderBanner(session) {
    var banner = document.getElementById('at-banner');
    if (!banner) return;
    if (session) {
      banner.className = 'alert alert-success d-flex align-items-center gap-2 mb-4';
      banner.innerHTML =
        '<i class="bi bi-play-fill flex-shrink-0"></i>' +
        '<div class="flex-fill">' +
          '<strong>Session #' + escHtmlSafe(session.numero) + '</strong> — ' + escHtmlSafe(session.titre) +
        '</div>' +
        '<a href="session-ia.html" class="btn btn-sm btn-outline-success">' +
          '<i class="bi bi-arrow-right me-1"></i>Voir' +
        '</a>';
    } else {
      banner.className = 'alert alert-light d-flex align-items-center gap-2 mb-4 border';
      banner.innerHTML =
        '<i class="bi bi-moon text-muted flex-shrink-0"></i>' +
        '<div class="flex-fill text-muted">Aucune session active</div>' +
        '<a href="session-ia.html" class="btn btn-sm btn-outline-secondary">' +
          '<i class="bi bi-arrow-right me-1"></i>Session IA' +
        '</a>';
    }
  }

  /* --- KPIs terrain (6 tuiles) --- */

  function renderKpis(stats, terrain) {
    var grid = document.getElementById('at-kpis');
    if (!grid) return;

    var s = stats || {};
    var t = terrain || {};
    var kpis = [
      { val: s.total_decisions != null ? s.total_decisions : '—', lbl:'Décisions',   ico:'bi-journal-check'     },
      { val: (s.sessions_fait != null ? s.sessions_fait : '?') + '/' + (s.total_sessions != null ? s.total_sessions : '?'), lbl:'Sessions', ico:'bi-list-check' },
      { val: t.protocoles != null ? t.protocoles : '—',           lbl:'Protocoles',  ico:'bi-list-ul'           },
      { val: t.dernier_act || '—',                                 lbl:'Dernier ACT', ico:'bi-arrow-up-right'    },
      { val: t.fiches_papier != null ? t.fiches_papier : '—',      lbl:'Fiches',      ico:'bi-file-earmark-text' },
      { val: t.glossaire != null ? t.glossaire : '—',              lbl:'Glossaire',   ico:'bi-book'              }
    ];

    grid.innerHTML = kpis.map(function (k) {
      return (
        '<div class="col-6 col-md-4 col-lg-2">' +
          '<div class="card bo-card h-100 text-center">' +
            '<div class="card-body py-3">' +
              '<div class="h3 fw-bold text-primary mb-1">' + escHtmlSafe(String(k.val)) + '</div>' +
              '<div class="small text-muted text-uppercase">' +
                '<i class="bi ' + k.ico + ' me-1"></i>' + escHtmlSafe(k.lbl) +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  /* --- Outils (cards) --- */

  function buildStdCard(o) {
    var col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML =
      '<div class="card bo-card h-100">' +
        '<div class="card-body d-flex flex-column gap-2">' +
          '<div class="d-flex align-items-center gap-2">' +
            '<div class="bo-state-icon bg-primary-subtle text-primary flex-shrink-0">' +
              '<i class="bi ' + o.icon + '"></i>' +
            '</div>' +
            '<h3 class="h6 fw-bold mb-0 flex-fill">' + escHtmlSafe(o.titre) + '</h3>' +
            '<span class="badge text-bg-success">Bêta</span>' +
          '</div>' +
          '<p class="small text-muted mb-0 flex-fill">' + escHtmlSafe(o.desc) + '</p>' +
          '<div class="text-end mt-auto">' +
            '<a href="' + escHtmlSafe(o.href) + '" class="btn btn-sm btn-outline-primary">' +
              'Ouvrir<i class="bi bi-arrow-right ms-1"></i>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    return col;
  }

  function buildLocalCard(o) {
    var btnId = 'at-local-btn-' + o.id;
    var action = AT_IS_LOCAL
      ? '<a href="' + escHtmlSafe(o.href) + '" class="btn btn-sm btn-outline-primary"><i class="bi bi-arrow-right me-1"></i>Ouvrir</a>'
      : '<button id="' + btnId + '" class="btn btn-sm btn-outline-secondary" type="button"><i class="bi bi-clipboard me-1"></i>Copier chemin</button>';

    var pathNote = AT_IS_LOCAL
      ? ''
      : '<code class="small d-block text-truncate user-select-all mt-1">' + escHtmlSafe(o.localPath) + '</code>';

    var col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML =
      '<div class="card bo-card h-100 border-secondary-subtle">' +
        '<div class="card-body d-flex flex-column gap-2">' +
          '<div class="d-flex align-items-center gap-2">' +
            '<div class="bo-state-icon bg-secondary-subtle text-secondary flex-shrink-0">' +
              '<i class="bi ' + o.icon + '"></i>' +
            '</div>' +
            '<h3 class="h6 fw-bold mb-0 flex-fill">' + escHtmlSafe(o.titre) + '</h3>' +
            '<span class="badge text-bg-secondary">Local</span>' +
          '</div>' +
          '<p class="small text-muted mb-0 flex-fill">' + escHtmlSafe(o.desc) + '</p>' +
          pathNote +
          '<div class="text-end mt-auto">' + action + '</div>' +
        '</div>' +
      '</div>';

    if (!AT_IS_LOCAL) {
      var btn = col.querySelector('button');
      if (btn) btn.addEventListener('click', function () { copyPath(o.localPath, btnId); });
    }
    return col;
  }

  function renderOutils() {
    var grid = document.getElementById('at-outils');
    if (!grid) return;
    grid.innerHTML = '';
    AT_OUTILS.forEach(function (o) {
      grid.appendChild(o.statut === 'local' ? buildLocalCard(o) : buildStdCard(o));
    });
  }

  /* --- Chargement terrain via RPC atelier_prompt_reprise --- */

  function loadTerrain() {
    return new Promise(function (resolve) {
      if (!window.bdb || !window.bdb.rpc) {
        hide('at-kpis-loading');
        show('at-kpis-error');
        return resolve();
      }
      window.bdb.rpc('atelier_prompt_reprise').then(function (res) {
        var error = res && res.error;
        var data  = res && res.data;
        if (error) throw error;
        var raw = Array.isArray(data) ? data[0] : data;
        var ctx = raw && (raw.atelier_prompt_reprise || raw);
        if (!ctx) throw new Error('Réponse vide');
        renderBanner(ctx.session_active);
        renderKpis(ctx.stats, ctx.terrain);
        hide('at-kpis-loading');
        show('at-kpis-content');
        resolve();
      }).catch(function (err) {
        hide('at-kpis-loading');
        var errEl  = document.getElementById('at-kpis-error-msg');
        if (errEl) errEl.textContent = 'Terrain non disponible — ' + (err && err.message ? err.message : 'erreur');
        show('at-kpis-error');
        resolve();
      });
    });
  }

  /* --- Orchestration (pattern conseil-app.js) --- */

  document.addEventListener('DOMContentLoaded', function () {

    (async function () {
      await window.bdbShellReady;
      if (!window.bdbUser) return;
      hide('at-loading');
      if (!window.bdbUser.isCreator) {
        show('at-denied');
        return;
      }
      show('at-content');
      renderOutils();
      loadTerrain();
    })();
  });

})();
