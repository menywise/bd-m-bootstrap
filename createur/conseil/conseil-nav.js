/* ================================================================
   conseil-nav.js — BDB Conseil L3 Créateur
   CDS Compliant | Zéro onclick= | Zéro console.* | Zéro @latest
   Phase 2 (S#90) : .at-nav-* → btn btn-sm btn-outline-secondary BS 5.3
   ================================================================ */

(function () {
  'use strict';

  var CS_NAV = [
    { href: 'index.html',          icon: 'bi-house-fill',        label: 'Accueil'     },
    { href: 'doctrine.html',       icon: 'bi-file-earmark-text', label: 'Doctrine'    },
    { href: 'workflow.html',       icon: 'bi-diagram-3',         label: 'Workflow'    },
    { href: 'lunettes/index.html', icon: 'bi-eyeglasses',        label: 'Lunettes'    },
    { href: 'prompts/index.html',  icon: 'bi-cpu',               label: 'Prompts IA'  },
    { href: 'soumissions.html',    icon: 'bi-upload',            label: 'Soumissions' },
    { href: 'verdicts.html',       icon: 'bi-check2-all',        label: 'Verdicts'    },
    { href: 'corrections.html',    icon: 'bi-wrench',            label: 'Corrections' }
  ];

  function _inject() {
    var shell = document.getElementById('bdb-shell');
    if (!shell) return;
    if (document.getElementById('atelier-nav')) return;

    /* Préfixe href selon profondeur (lu depuis data-root-path bdb-shell) */
    var rootPath = shell.getAttribute('data-root-path') || '../';
    /* rootPath = '../'   → conseil/          → préfixe nav = '' (hrefs relatifs à conseil/)  */
    /* rootPath = '../../'→ conseil/lunettes/  → préfixe nav = '../'                           */
    var depth  = (rootPath.match(/\.\.\//g) || []).length;
    var prefix = depth > 1 ? '../' : '';

    /* Page courante via data-page sur #conseil-top */
    var meta = document.getElementById('conseil-top');
    var currentPage = meta ? meta.getAttribute('data-page') : '';

    var nav = document.createElement('nav');
    nav.id = 'atelier-nav';
    nav.setAttribute('aria-label', 'Navigation conseil');
    nav.className = 'd-flex flex-wrap align-items-center gap-1 px-3 py-2 border-bottom bg-white';

    CS_NAV.forEach(function (item) {
      var href      = prefix + item.href;
      var isCurrent = item.href.split('/')[0] === currentPage ||
                      item.href === currentPage + '.html' ||
                      (currentPage === 'index' && item.href === 'index.html');
      var a = document.createElement('a');
      a.href      = href;
      a.className = 'btn btn-sm btn-outline-secondary' + (isCurrent ? ' active' : '');
      if (isCurrent) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<i class="bi ' + item.icon + ' me-1"></i>' + item.label;
      nav.appendChild(a);
    });

    /* Retour Atelier */
    var back = document.createElement('a');
    back.href      = rootPath + 'atelier/index.html';
    back.className = 'btn btn-sm btn-outline-secondary ms-auto';
    back.title     = 'Retour Atelier L3';
    back.innerHTML = '<i class="bi bi-arrow-left me-1"></i>Atelier';
    nav.appendChild(back);

    document.getElementById('middle').insertAdjacentElement('afterbegin', nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _inject);
  } else {
    _inject();
  }

})();
