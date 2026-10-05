// ============================================================
// bdb-toast.js — Wrapper Notyf transverse BDB
// Bible de Bloc
// VERSION : 1.0.0 — 2026-04-06
// ============================================================
// DEPENDANCES OBLIGATOIRES dans les pages qui utilisent BdbToast :
//   <head>
//     <link rel="stylesheet"
//           href="https://cdn.jsdelivr.net/npm/notyf@3.10.0/notyf.min.css"/>
//   </head>
//   <body>
//     ...
//     <script src="https://cdn.jsdelivr.net/npm/notyf@3.10.0/notyf.min.js"></script>
//     <script src="../../js/bdb-toast.js"></script>   <!-- apres Notyf -->
//   </body>
//
// NOTA bdb-shell.js : bdb-shell.js ne charge pas de dependances CDN transverses
// (il charge uniquement bdb-preview.js dynamiquement). Le chargement de Notyf
// reste a la charge de chaque page hote. NE PAS modifier bdb-shell.js pour ca.
//
// WCAG AA :
//   - Succes / avertissement : aria-live="polite"
//   - Erreur / critique      : aria-live="assertive"
//
// USAGE :
//   BdbToast.success('Fiche enregistree');
//   BdbToast.error('Connexion impossible');
//   BdbToast.warn('Donnees non sauvegardees');
//   BdbToast.sticky('Erreur critique — rechargez la page');
// ============================================================

window.BdbToast = (function () {
  'use strict';

  // ── Configuration Notyf ──────────────────────────────────────────────────
  var NOTYF_CONFIG = {
    duration    : 4000,
    position    : { x: 'right', y: 'bottom' },
    ripple      : false,
    dismissible : true
  };

  // File d attente interne
  var _queue      = [];       // messages en attente
  var _visible    = 0;        // nombre de toasts actuellement affiches
  var MAX_VISIBLE = 3;

  var _notyf      = null;     // instance Notyf
  var _ariaPolite = null;     // region aria-live polite
  var _ariaAssert = null;     // region aria-live assertive
  var _ready      = false;

  // ── Init interne ─────────────────────────────────────────────────────────

  function _ensureNotyf() {
    if (_ready) return true;
    if (typeof Notyf === 'undefined') return false;

    _notyf = new Notyf(NOTYF_CONFIG);

    // Regions aria-live pour WCAG AA
    _ariaPolite = _getOrCreateAria('bdb-toast-aria-polite', 'polite');
    _ariaAssert = _getOrCreateAria('bdb-toast-aria-assert', 'assertive');

    _ready = true;
    return true;
  }

  function _getOrCreateAria(id, live) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('aria-live', live);
      el.setAttribute('aria-atomic', 'true');
      // Hors ecran mais lisible par les lecteurs
      el.style.cssText =
        'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(el);
    }
    return el;
  }

  // ── Annonce aria ─────────────────────────────────────────────────────────

  function _announce(msg, assertive) {
    var region = assertive ? _ariaAssert : _ariaPolite;
    if (!region) return;
    // Reset puis mise a jour pour forcer la relecture
    region.textContent = '';
    setTimeout(function () { region.textContent = msg; }, 50);
  }

  // ── Gestion file d attente ────────────────────────────────────────────────

  function _enqueue(type, msg, opts) {
    if (_visible < MAX_VISIBLE) {
      _show(type, msg, opts);
    } else {
      _queue.push({ type: type, msg: msg, opts: opts });
    }
  }

  function _onDismiss() {
    _visible = Math.max(0, _visible - 1);
    if (_queue.length > 0) {
      var next = _queue.shift();
      _show(next.type, next.msg, next.opts);
    }
  }

  function _show(type, msg, opts) {
    if (!_ensureNotyf()) return;

    _visible++;

    var isError = (type === 'error' || type === 'sticky');
    _announce(msg, isError);

    var config = Object.assign({
      duration    : opts && opts.sticky ? 0 : NOTYF_CONFIG.duration,
      dismissible : true,
      className   : 'bdb-toast bdb-toast-' + type
    }, opts || {});

    var toast;
    if (type === 'error' || type === 'sticky') {
      toast = _notyf.error(Object.assign({ message: msg }, config));
    } else if (type === 'warn') {
      // Notyf n a pas de type warn natif — on utilise open() avec classe custom
      toast = _notyf.open({
        type    : 'warning',
        message : msg,
        duration: config.duration,
        dismissible: config.dismissible,
        className: config.className
      });
    } else {
      toast = _notyf.success(Object.assign({ message: msg }, config));
    }

    // Decremente le compteur a la disparition
    if (toast && typeof toast.on === 'function') {
      toast.on('dismiss', _onDismiss);
    } else {
      // Fallback si l API dismiss n est pas disponible
      var duration = config.duration || NOTYF_CONFIG.duration;
      if (duration > 0) {
        setTimeout(_onDismiss, duration + 300);
      }
    }
  }

  // ── API publique ─────────────────────────────────────────────────────────

  /**
   * BdbToast.success(msg)
   * Toast de confirmation — aria-live="polite", auto-ferme apres 4s.
   */
  function success(msg) {
    _enqueue('success', String(msg || ''), null);
  }

  /**
   * BdbToast.error(msg)
   * Toast d erreur — aria-live="assertive", auto-ferme apres 4s.
   */
  function error(msg) {
    _enqueue('error', String(msg || ''), null);
  }

  /**
   * BdbToast.warn(msg)
   * Toast d avertissement — aria-live="polite", auto-ferme apres 4s.
   */
  function warn(msg) {
    _enqueue('warn', String(msg || ''), null);
  }

  /**
   * BdbToast.sticky(msg)
   * Erreur critique non auto-fermee — aria-live="assertive".
   * L utilisateur doit fermer manuellement.
   */
  function sticky(msg) {
    _enqueue('sticky', String(msg || ''), { sticky: true });
  }

  // ── Export ───────────────────────────────────────────────────────────────
  return {
    success : success,
    error   : error,
    warn    : warn,
    sticky  : sticky
  };

}());
