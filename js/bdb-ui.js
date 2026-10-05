// ============================================================
// bdb-ui.js — Helpers UI partagés BDB
// VERSION  : 1.1.0
// DATE     : 2026-04-17
//
// POSITION dans la chaine JS (CONV-CHAIN-E) :
//   bootstrap.bundle → supabase@2 → supabase-client.js
//   → bdb-invite-guard.js → bdb-ui.js → bdb-shell.js → [module]-app.js
//
// EXPOSE sur window :
//   window.escHtml(str)                       protection XSS
//   window.bdbToast(msg, type)                toast standard BDB
//   window.bdbShowState(map, activeKey, msg)  3 etats async
//   window.skeletonRows(rows, cols)           skeleton tableau
//   window.cdsShowGridError(el, msg, fn)      etat erreur card
//   window.cdsShowOfflineBanner(msg)          banniere offline
//   window.debounce(fn, delay)                debounce input
//
// REMPLACE :
//   escHtml()             reimplemente localement dans chaque module
//   skeletonRows()        defini dans admin-app.js uniquement
//   cdsShowGridError()    defini dans admin-app.js uniquement
//   cdsShowOfflineBanner() idem
//   window.bdbToast()     version supabase-client.js (pointe #toastInfo)
//   debounce()            utils.js CDN (projet etranger)
//
// PATTERN TOAST STANDARD BDB :
//   HTML requis dans chaque page (un seul, en bas de body) :
//   <div class="toast-container position-fixed bottom-0 end-0 p-3">
//     <div id="toastMsg" class="toast align-items-center" ...>
//       <div class="d-flex">
//         <div class="toast-body" id="toastText">Message</div>
//         <button type="button" class="btn-close me-2 m-auto"
//           data-bs-dismiss="toast"></button>
//       </div>
//     </div>
//   </div>
//
// PATTERN 3 ETATS STANDARD BDB (CONV-ASYNC-3ETATS) :
//   IDs : [prefix]Loading · [prefix]Empty · [prefix]Error · [prefix]Content
//   Usage : bdbShowState('monModule', 'loading')
//           bdbShowState('monModule', 'error', 'Message erreur')
//
// REGLES :
//   v Zero console.log (INTERDIT-D6)
//   v Zero onclick= (JS-01)
//   v Zero style= statique (INTERDIT-C2)
//   v IIFE — zero pollution namespace global sauf les exports explicites
// ============================================================

(function () {
  'use strict';

  // ── 1. escHtml ───────────────────────────────────────────────────────────
  // Protection XSS obligatoire sur tout innerHTML avec donnee DB (INTERDIT-C6)
  // Utilisation : ${escHtml(item.label)} dans les templates litteraux JS

  var _escEl = document.createElement('span');

  window.escHtml = function escHtml(str) {
    _escEl.textContent = (str === null || str === undefined) ? '' : String(str);
    return _escEl.innerHTML;
  };


  // ── 2. bdbToast ──────────────────────────────────────────────────────────
  // Override de la version supabase-client.js (pointait sur #toastInfo).
  // Nouveau standard : #toastMsg / #toastText
  // Retro-compatible : fallback sur #toastInfo si #toastMsg absent.
  //
  // type : 'success' (defaut) | 'danger' | 'warning' | 'info' | 'primary'
  // Couleur de fond : text-bg-[type] Bootstrap 5.3

  window.bdbToast = function bdbToast(msg, type) {
    var t = type || 'success';
    var el = document.getElementById('toastMsg');

    if (el) {
      // Nouveau pattern
      el.className = 'toast align-items-center text-bg-' + t + ' border-0';
      var body = document.getElementById('toastText');
      if (body) body.textContent = msg || '';
      bootstrap.Toast.getOrCreateInstance(el).show();
      return;
    }

    // Fallback ancien pattern #toastInfo (retrocompatibilite transitoire)
    var legacy = document.getElementById('toastInfo');
    if (legacy) {
      var legacyBody = legacy.querySelector('.toast-body');
      if (legacyBody) legacyBody.textContent = msg || '';
      bootstrap.Toast.getOrCreateInstance(legacy).show();
    }
  };


  // ── 3. bdbShowState ──────────────────────────────────────────────────────
  // Gestionnaire des 3 etats async (CONV-ASYNC-3ETATS).
  // Affiche un etat, masque les autres.
  //
  // Signature A — prefixe convention [module]Loading/Empty/Error/Content :
  //   bdbShowState('monModule', 'loading')
  //   bdbShowState('monModule', 'error', 'Message erreur')
  //   bdbShowState('monModule', 'empty')
  //   bdbShowState('monModule', 'main')
  //
  // Signature B — map explicite (legacy ou cas particuliers) :
  //   bdbShowState({ loading: 'loadingState', empty: 'emptyState',
  //                  error: 'errorState', main: 'mainContent' }, 'loading')

  window.bdbShowState = function bdbShowState(prefixOrMap, activeKey, errorMsg) {
    var map;

    if (typeof prefixOrMap === 'string') {
      // Signature A : convention de nommage BDB
      var p = prefixOrMap;
      map = {
        loading : p + 'Loading',
        empty   : p + 'Empty',
        error   : p + 'Error',
        main    : p + 'Content'
      };
    } else {
      // Signature B : map explicite
      map = prefixOrMap;
    }

    Object.entries(map).forEach(function (entry) {
      var key = entry[0];
      var id  = entry[1];
      var el  = document.getElementById(id);
      if (el) el.classList.toggle('d-none', key !== activeKey);
    });

    // Injecter le message d erreur si fourni
    if (activeKey === 'error' && errorMsg) {
      // Chercher l element message dans le bloc error (convention BDB)
      var prefix = typeof prefixOrMap === 'string' ? prefixOrMap : '';
      var msgEl  = document.getElementById(prefix + 'ErrorMsg')
                || document.getElementById('errorMessage');
      if (msgEl) msgEl.textContent = errorMsg;
    }
  };


  // ── 4. skeletonRows ──────────────────────────────────────────────────────
  // Genere des lignes skeleton pour les tableaux en etat loading.
  // Utilise Bootstrap .placeholder-glow (zero style= statique).
  //
  // Usage : tbody.innerHTML = skeletonRows(5, 4);

  var _skWidths = ['col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9'];

  window.skeletonRows = function skeletonRows(rows, cols) {
    return Array.from({ length: rows }).map(function () {
      var cells = Array.from({ length: cols }).map(function () {
        var w = _skWidths[Math.floor(Math.random() * _skWidths.length)];
        return '<td><span class="placeholder-glow d-block">'
             + '<span class="placeholder ' + w + ' rounded"></span>'
             + '</span></td>';
      }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
  };


  // ── 5. cdsShowGridError ──────────────────────────────────────────────────
  // Affiche un etat d erreur dans un conteneur (card-body ou tbody).
  // Remplace le contenu par un message + bouton retry optionnel.
  //
  // Usage : cdsShowGridError(tbody.closest('.card-body'), err.message, loadData)

  window.cdsShowGridError = function cdsShowGridError(el, msg, retryFn) {
    if (!el) return;
    var retryBtn = retryFn
      ? '<button class="btn btn-sm btn-outline-secondary mt-2" id="cdsRetryBtn">'
        + '<i class="bi bi-arrow-clockwise me-1"></i>R\u00e9essayer'
        + '</button>'
      : '';
    el.innerHTML = '<div class="text-center py-5 text-muted col-12">'
      + '<i class="bi bi-wifi-off fs-1 d-block mb-3 opacity-50"></i>'
      + '<p class="mb-1 fw-semibold">Donn\u00e9es non charg\u00e9es</p>'
      + '<p class="small mb-2">'
      + window.escHtml(msg || 'Impossible de contacter le serveur.')
      + '</p>'
      + retryBtn
      + '</div>';
    if (retryFn) {
      var btn = el.querySelector('#cdsRetryBtn');
      if (btn) btn.addEventListener('click', retryFn);
    }
  };


  // ── 6. cdsShowOfflineBanner ──────────────────────────────────────────────
  // Affiche une banniere globale en haut de page (connexion perdue).
  // Cree l element si absent, l affiche sinon.
  //
  // Usage : cdsShowOfflineBanner('Supabase indisponible')

  window.cdsShowOfflineBanner = function cdsShowOfflineBanner(msg) {
    var banner = document.getElementById('cdsOfflineBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cdsOfflineBanner';
      banner.className = 'alert alert-warning d-flex align-items-center gap-2 mb-0 rounded-0 position-fixed start-0 end-0 top-0 d-none';
      banner.style.zIndex = '1060';
      document.body.prepend(banner);
    }
    banner.innerHTML = '<i class="bi bi-wifi-off flex-shrink-0"></i>'
      + '<span>' + window.escHtml(msg || 'BDB vous attend d\u00e8s que votre connexion sera de retour.') + '</span>';
    banner.classList.remove('d-none');
  };


  // ── 7. debounce ──────────────────────────────────────────────────────────
  // Retarde l execution d une fonction (typiquement : input recherche).
  // Remplace utils.js CDN (projet etranger).
  //
  // Usage : input.addEventListener('input', debounce(renderTable, 300))

  window.debounce = function debounce(fn, delay) {
    var timer = null;
    return function () {
      var ctx  = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay || 300);
    };
  };

})();
