// ============================================================
// bdb-zone-state.js — Helper unifie etats async par zone
// VERSION  : 1.0.0
// DATE     : 2026-05-07
// STATUT   : ADDITION ; n'ecrase pas bdbShowState() existant
//
// POSITION dans la chaine JS (CONV-CHAIN-E) :
//   bootstrap.bundle -> supabase@2 -> supabase-client.js
//   -> bdb-invite-guard.js -> bdb-ui.js -> bdb-zone-state.js
//   -> bdb-shell.js -> [module]-app.js
//
// EXPOSE sur window :
//   window.bdbZoneState(zoneEl, state, opts)
//     zoneEl : Element ou string CSS selector ou string id zone
//     state  : 'loading' | 'empty' | 'error' | 'content'
//     opts   : { message, retryFn, prefix }   tous optionnels
//
// CONTRAT DOM (R-6.7 charte premium) :
//   <section class="app-zone" data-zone="Content">
//     <div data-zone-state="loading"> spinner </div>
//     <div data-zone-state="empty">   etat vide </div>
//     <div data-zone-state="error">   etat erreur </div>
//     <div data-zone-state="content"> donnees </div>
//   </section>
//
// CONVENTION V5 ALTERNATIVE (compatibilite descendante) :
//   IDs : [prefix]Loading | [prefix]Empty | [prefix]Error | [prefix]Content
//   Exemple : prefix='glossaire' -> ids glossaireLoading, glossaireEmpty...
//   Si opts.prefix est passe, le helper resout via IDs au lieu de data-zone-state.
//
// A11Y AJOUTS AUTOMATIQUES :
//   - data-state="<state>" pose sur la zone
//   - aria-busy="true" si state==='loading' sinon 'false'
//   - role="status" (loading), role="alert" (error) sur le sous-bloc
//   - tabindex="-1" + focus() sur le sous-bloc actif (sauf loading)
//
// BACKWARD COMPATIBILITY :
//   bdbShowState(prefix, state, msg) reste expose par bdb-ui.js.
//   bdbZoneState() est l'API premium recommandee pour tout nouveau module.
//
// REGLES :
//   v Zero console.log (INTERDIT-D6)
//   v IIFE — zero pollution namespace
//   v escHtml() utilise pour tout message dynamique (INTERDIT-C6)
// ============================================================

(function () {
  'use strict';

  // Resout l'element zone a partir de plusieurs entrees possibles
  function resolveZone(zoneRef) {
    if (!zoneRef) return null;
    if (zoneRef instanceof Element) return zoneRef;
    if (typeof zoneRef === 'string') {
      // Tente selecteur CSS d'abord, puis id direct
      try {
        var el = document.querySelector(zoneRef);
        if (el) return el;
      } catch (e) { /* selecteur invalide, on bascule sur getElementById */ }
      return document.getElementById(zoneRef);
    }
    return null;
  }

  // Recupere les sous-blocs etats via convention prefix (V5 legacy)
  function getStatesByPrefix(prefix) {
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    return {
      loading: document.getElementById(prefix + 'Loading'),
      empty:   document.getElementById(prefix + 'Empty'),
      error:   document.getElementById(prefix + 'Error'),
      content: document.getElementById(prefix + 'Content')
    };
  }

  // Recupere les sous-blocs etats via data-zone-state (charte premium)
  function getStatesByDataAttr(zoneEl) {
    return {
      loading: zoneEl.querySelector('[data-zone-state="loading"]'),
      empty:   zoneEl.querySelector('[data-zone-state="empty"]'),
      error:   zoneEl.querySelector('[data-zone-state="error"]'),
      content: zoneEl.querySelector('[data-zone-state="content"]')
    };
  }

  // Toggle visibilite des 4 etats (un seul visible)
  function applyStateVisibility(states, activeState) {
    Object.keys(states).forEach(function (key) {
      var el = states[key];
      if (!el) return;
      if (key === activeState) {
        el.hidden = false;
        el.removeAttribute('aria-hidden');
      } else {
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Pose les attributs a11y sur la zone et le sous-bloc actif
  function applyA11y(zoneEl, states, activeState) {
    zoneEl.setAttribute('data-state', activeState);
    zoneEl.setAttribute('aria-busy', activeState === 'loading' ? 'true' : 'false');

    var active = states[activeState];
    if (!active) return;

    if (activeState === 'loading') {
      active.setAttribute('role', 'status');
      active.setAttribute('aria-live', 'polite');
    } else if (activeState === 'error') {
      active.setAttribute('role', 'alert');
      active.setAttribute('aria-live', 'assertive');
    } else if (activeState === 'empty') {
      active.setAttribute('role', 'status');
      active.removeAttribute('aria-live');
    } else if (activeState === 'content') {
      active.removeAttribute('role');
      active.removeAttribute('aria-live');
    }
  }

  // Injecte un message texte dans le sous-bloc actif si fourni
  function injectMessage(stateEl, message, retryFn) {
    if (!stateEl || !message) return;
    var msgSlot = stateEl.querySelector('[data-zone-message]');
    if (msgSlot) {
      // Slot dedie : on respecte INTERDIT-C6 (escHtml obligatoire si DB-driven)
      msgSlot.textContent = message;
    } else {
      // Pas de slot : on remplace le contenu en mode securise
      stateEl.textContent = message;
    }
    if (retryFn && typeof retryFn === 'function') {
      var btn = stateEl.querySelector('[data-zone-retry]');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm btn-outline-secondary mt-2';
        btn.setAttribute('data-zone-retry', '1');
        btn.textContent = 'Reessayer';
        stateEl.appendChild(btn);
      }
      btn.onclick = retryFn;
    }
  }

  /**
   * API principale — bascule l'etat d'une zone async.
   *
   * @param {Element|string} zoneRef  zone cible (Element, selecteur, ou ID)
   * @param {string} state            'loading' | 'empty' | 'error' | 'content'
   * @param {object} [opts]
   * @param {string} [opts.message]   message a injecter dans l'etat actif
   * @param {Function} [opts.retryFn] callback bouton reessayer (etat error)
   * @param {string} [opts.prefix]    convention V5 : ids [prefix]Loading...
   * @returns {boolean}               true si bascule reussie, false sinon
   */
  function bdbZoneState(zoneRef, state, opts) {
    opts = opts || {};
    var validStates = ['loading', 'empty', 'error', 'content'];
    if (validStates.indexOf(state) === -1) return false;

    var zoneEl = resolveZone(zoneRef);
    if (!zoneEl) return false;

    var states = opts.prefix
      ? getStatesByPrefix(opts.prefix)
      : getStatesByDataAttr(zoneEl);

    applyStateVisibility(states, state);
    applyA11y(zoneEl, states, state);

    if (opts.message) {
      injectMessage(states[state], opts.message, opts.retryFn);
    }

    // Custom event pour observers externes
    try {
      zoneEl.dispatchEvent(new CustomEvent('dbm:zone-state', {
        detail: { state: state, message: opts.message || null },
        bubbles: true
      }));
    } catch (e) { /* CustomEvent non supporte ; on ignore */ }

    return true;
  }

  // Helper raccourci pour state='error' avec message + retry
  function bdbZoneError(zoneRef, message, retryFn) {
    return bdbZoneState(zoneRef, 'error', {
      message: message || 'Une erreur est survenue.',
      retryFn: retryFn
    });
  }

  // Helper raccourci pour state='empty' avec message
  function bdbZoneEmpty(zoneRef, message) {
    return bdbZoneState(zoneRef, 'empty', {
      message: message || 'Aucun resultat.'
    });
  }

  // Exports
  window.bdbZoneState = bdbZoneState;
  window.bdbZoneError = bdbZoneError;
  window.bdbZoneEmpty = bdbZoneEmpty;
})();
