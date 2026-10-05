// ============================================================
// bdb-modal-a11y.js — Composant partage DB&M
// Version : 1.0.0 (S122, 2026-05-07)
//
// ROLE :
//   Corriger le bug d accessibilite WCAG 2.1 connu de Bootstrap 5.3 :
//   quand une modale se ferme, Bootstrap remet aria-hidden="true" sur
//   l element root de la modale, mais le focus peut encore etre sur
//   un descendant (typiquement .btn-close) -> conflit a11y signale par
//   les navigateurs Chrome/Edge :
//   "Blocked aria-hidden on an element because its descendant retained focus".
//
// PATTERN :
//   Listener global capture sur 'hide.bs.modal'. Si un element du
//   modal a le focus, on le retire AVANT que Bootstrap pose aria-hidden.
//
// PORTEE :
//   - Auto-init au chargement (IIFE)
//   - Idempotent (window.__BdbModalA11yInit guard)
//   - Aucune dependance autre que Bootstrap 5.3 (event 'hide.bs.modal')
//   - Inoffensif si Bootstrap absent (le listener n est jamais declenche)
//
// CHARGEMENT :
//   <script src="../../js/bdb-modal-a11y.js"></script>
//   A inclure apres bootstrap.bundle.min.js dans chaque module ayant
//   des modales. Chargement aussi recommande dans index.html racine.
//
// DOCTRINE :
//   atelier_principes ref=GFC-A11Y-MODAL-01 (cree par S122 cloture)
// ============================================================

(function () {
  'use strict';

  if (window.__BdbModalA11yInit) return;
  window.__BdbModalA11yInit = true;

  // useCapture=true : intercepte AVANT que Bootstrap pose aria-hidden
  document.addEventListener('hide.bs.modal', function (e) {
    var modalEl = e.target;
    if (!modalEl || typeof modalEl.querySelector !== 'function') return;

    var focused = modalEl.querySelector(':focus');
    if (focused && typeof focused.blur === 'function') {
      try { focused.blur(); } catch (_) { /* ignore */ }
    }

    // Defensive : si document.activeElement est encore dans la modale
    // (ex : iframe focus), on le blur aussi.
    var active = document.activeElement;
    if (active && active !== document.body && modalEl.contains(active)
        && typeof active.blur === 'function') {
      try { active.blur(); } catch (_) { /* ignore */ }
    }
  }, true);


  // ============================================================
  // CONV-MODAL-09 (S128) — Blur modale du dessous quand modale empilée
  //
  // ROLE : Quand une 2e modale s'ouvre par-dessus une 1re, la 1re reste
  //   visible au-delà du backdrop si elle est plus grande. Pour la rendre
  //   illisible (focus humain sur la 2e), on lui applique blur(3px).
  //
  // PATTERN : à 'show.bs.modal' on regarde si une autre modale est déjà
  //   ouverte → on lui ajoute classe .modal--blurred-below. À la fermeture
  //   de n'importe quelle modale on recompute l'état.
  // ============================================================

  function refreshBlurState() {
    var open = document.querySelectorAll('.modal.show');
    if (open.length <= 1) {
      document.querySelectorAll('.modal--blurred-below').forEach(function (m) {
        m.classList.remove('modal--blurred-below');
      });
      return;
    }
    // Toutes les modales ouvertes sauf la dernière (dernière = topmost) reçoivent le flou
    open.forEach(function (m, i) {
      if (i < open.length - 1) m.classList.add('modal--blurred-below');
      else m.classList.remove('modal--blurred-below');
    });
  }

  document.addEventListener('shown.bs.modal',  refreshBlurState);
  document.addEventListener('hidden.bs.modal', refreshBlurState);
})();
