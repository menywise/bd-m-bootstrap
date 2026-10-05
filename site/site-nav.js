/**
 * site-nav.js — Offcanvas partagé + portail conditionné — mini-site BDB
 * Version : 1.1.5
 *
 * Doit être chargé EN DERNIER (après utils.js).
 * Injection synchrone : tout le DOM et tous les scripts sont déjà exécutés.
 * v1.1.5 : ajout instances.html + openTabFromHash() pour liens directs vers onglet.
 */

(function () {
  'use strict';

  var SESSION_KEY = 'sb-ecpzrygzdugwwkqbsajn-auth-token';

  var NAV_ITEMS = [
    { href: 'index.html',           icon: 'bi-house',                label: 'Accueil'                   },
    { href: 'vision.html',          icon: 'bi-eye',                  label: 'Vision'                    },
    { href: 'pas-app.html',         icon: 'bi-x-circle',             label: "Ce que ce n\u2019est pas"  },
    { href: 'audiences.html',       icon: 'bi-people',               label: 'Pour qui'                  },
    { href: 'fonctionnalites.html', icon: 'bi-gear',                 label: 'Fonctions'                 },
    { href: 'risques.html',         icon: 'bi-exclamation-triangle', label: 'Risques'                   },
    { href: 'instances.html',       icon: 'bi-geo-alt',              label: 'D\u00e9ploiements'         },
    { href: 'adoption.html',        icon: 'bi-graph-up',             label: 'Adoption'                  },
    { href: 'faq.html',             icon: 'bi-question-circle',      label: 'FAQ'                       },
    { href: 'glossaire.html',       icon: 'bi-journal-text',         label: 'Lexique'                   },
    { href: 'accessibilite.html',   icon: 'bi-universal-access',     label: 'Accessibilit\u00e9'        },
  ];

  function hasActiveSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var s = JSON.parse(raw);
      return !!(s && s.refresh_token && s.user);
    } catch (e) {
      return false;
    }
  }

  function currentPage() {
    var parts = window.location.pathname.split('/');
    var last  = parts.pop() || parts.pop() || '';
    return last || 'index.html';
  }

  function buildOffcanvas(current, isLoggedIn) {
    var portalHref  = isLoggedIn ? '../index.html'                   : '../login.html';
    var portalIcon  = isLoggedIn ? 'bi-grid-3x3-gap'                 : 'bi-box-arrow-in-right';
    var portalLabel = isLoggedIn ? 'Acc\u00e9der \u00e0 l\u2019app'  : 'Se connecter';
    var portalClass = isLoggedIn ? 'text-white-50'                   : 'text-info';

    var items = NAV_ITEMS.map(function (item) {
      var active = (item.href === current) || (current === '' && item.href === 'index.html');
      var cls    = active ? ' active" aria-current="page' : '';
      return '<li class="nav-item"><a href="' + item.href
           + '" class="nav-link text-white' + cls + '"><i class="bi '
           + item.icon + ' me-2"></i>' + item.label + '</a></li>';
    }).join('\n      ');

    return [
      '<!-- OFFCANVAS \u2014 site-nav.js v1.1.5 -->',
      '<div class="offcanvas offcanvas-start bg-dark text-white" tabindex="-1" id="mainMenu">',
      '  <div class="offcanvas-header border-bottom border-secondary">',
      '    <h5 class="offcanvas-title d-flex align-items-center">',
      '      <i class="bi bi-hospital fs-4 me-2 text-primary"></i>',
      '      <span class="fs-5 fw-bold">Bible de Bloc</span>',
      '    </h5>',
      '    <button type="button" class="btn-close btn-close-white"',
      '      data-bs-dismiss="offcanvas" aria-label="Fermer le menu"></button>',
      '  </div>',
      '  <div class="offcanvas-body d-flex flex-column">',
      '    <small class="text-uppercase text-white-50 mb-2 d-block">Pr\u00e9sentation</small>',
      '    <hr class="border-secondary my-3"/>',
      '    <ul class="nav nav-pills flex-column mb-auto">',
      '      ' + items,
      '    </ul>',
      '    <div class="mt-auto pt-3 border-top border-secondary">',
      '      <a href="' + portalHref + '" class="nav-link ' + portalClass + ' small">',
      '        <i class="bi ' + portalIcon + ' me-1"></i>' + portalLabel,
      '      </a>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('\n');
  }

  function updateHeaderPortalBtn(isLoggedIn) {
    var btn = document.querySelector('header a.btn[href]');
    if (!btn) return;
    if (isLoggedIn) {
      btn.setAttribute('href', '../index.html');
      btn.innerHTML = '<i class="bi bi-grid-3x3-gap me-1"></i>Mon espace';
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-outline-primary');
    } else {
      btn.setAttribute('href', '../login.html');
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i>Se connecter';
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-outline-secondary');
    }
  }

  // Ouvre automatiquement un onglet Bootstrap si l'URL contient un hash
  // Ex : audiences.html#direction → ouvre le tab button id="direction-tab"
  function openTabFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) return;
    var tabBtn = document.getElementById(hash + '-tab');
    if (!tabBtn) return;
    var tab = new bootstrap.Tab(tabBtn);
    tab.show();
    tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function init() {
    if (document.getElementById('mainMenu')) return; // anti double-injection
    var current    = currentPage();
    var isLoggedIn = hasActiveSession();
    document.body.insertAdjacentHTML('afterbegin', buildOffcanvas(current, isLoggedIn));
    updateHeaderPortalBtn(isLoggedIn);
    // Ouverture d'onglet depuis hash URL (ex: audiences.html#direction)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', openTabFromHash);
    } else {
      openTabFromHash();
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

}());
