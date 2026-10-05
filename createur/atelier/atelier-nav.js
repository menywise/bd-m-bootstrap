/* ================================================================
   atelier-nav.js — BDB Atelier L3 Créateur
   CDS Compliant | Zéro onclick= | Zéro console.* | Zéro @latest
   V4 (S#pricing) — ajout pricing-roi
   ================================================================ */

(function () {
  'use strict';

  /* Catalogue outils atelier — ordre affichage nav */
  var AT_NAV = [
    { href: 'index.html',             icon: 'bi-grid-3x2-gap-fill', label: 'Portail',      page: 'index'            },
    { href: 'session-ia.html',        icon: 'bi-cpu-fill',          label: 'Session IA',   page: 'session-ia'       },
    { href: 'diagnostic.html',        icon: 'bi-heart-pulse',       label: 'Diagnostic',   page: 'diagnostic'       },
    { href: 'memo.html',              icon: 'bi-sticky-fill',       label: 'Mémo',         page: 'memo'             },
    { href: 'overview.html',          icon: 'bi-grid',              label: 'Overview',     page: 'overview'         },
    { href: 'pricing-roi.html',       icon: 'bi-calculator',        label: 'ROI',          page: 'pricing-roi'      },
    { href: 'ccam.html',              icon: 'bi-hash',              label: 'CCAM',         page: 'ccam'             },
    { href: 'ccam-validator.html',    icon: 'bi-check2-square',     label: 'CCAM Batch',   page: 'ccam-validator'   },
    { href: 'schema-audit.html',      icon: 'bi-diagram-3',         label: 'Schéma',       page: 'schema-audit'     },
    { href: 'glossaire-feeder.html',  icon: 'bi-book-half',         label: 'Glossaire',    page: 'glossaire-feeder' },
    { href: 'atelier-tables-index.html', icon: 'bi-table',          label: 'Tables',       page: 'atelier-tables'   }
  ];

  function _inject() {
    var shell = document.getElementById('bdb-shell');
    if (!shell) return;
    if (document.getElementById('atelier-nav')) return;

    var middle = document.getElementById('middle');
    if (!middle) return;

    /* Page courante via data-page sur #atelier-top (fallback filename) */
    var meta = document.getElementById('atelier-top');
    var currentPage = meta ? meta.getAttribute('data-page') : '';
    if (!currentPage) {
      var f = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '');
      if (f === '' || f === 'atelier') f = 'index';
      if (f.indexOf('atelier-tables') === 0) f = 'atelier-tables';
      currentPage = f;
    }

    var nav = document.createElement('nav');
    nav.id = 'atelier-nav';
    nav.setAttribute('aria-label', 'Navigation atelier');
    nav.className = 'd-flex flex-wrap align-items-center gap-1 px-3 py-2 border-bottom bg-white';

    AT_NAV.forEach(function (item) {
      var isCurrent = item.page === currentPage;
      var a = document.createElement('a');
      a.href      = item.href;
      a.className = 'btn btn-sm btn-outline-secondary' + (isCurrent ? ' active' : '');
      if (isCurrent) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<i class="bi ' + item.icon + ' me-1"></i>' + item.label;
      nav.appendChild(a);
    });

    /* Retour Conseil L3 (outil sœur) */
    var conseil = document.createElement('a');
    conseil.href      = '../conseil/index.html';
    conseil.className = 'btn btn-sm btn-outline-secondary ms-auto';
    conseil.title     = 'Aller au Conseil BDB';
    conseil.innerHTML = '<i class="bi bi-shield-check me-1"></i>Conseil';
    nav.appendChild(conseil);

    middle.insertAdjacentElement('afterbegin', nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _inject);
  } else {
    _inject();
  }

})();
