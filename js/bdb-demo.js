/**
 * bdb-demo.js — Mode Démo Invité BDB
 * Version : 1.0.1
 * Session #15 — 2026-04-08
 * Fix 2026-04-25 : redirect /index.html → chemin relatif (cassé en file:// et en sous-dossier OVH)
 *
 * Usage :
 *   - Chargé après bdb-shell.js dans chaque module à seeder (17 modules)
 *   - Chargé après supabase-client.js dans login.html et site/index.html
 *
 * Expose :
 *   window.bdbEnterDemo()   — connexion Supabase réelle avec compte demo@bdb.app
 *   window.bdbIsDemo()      — true si utilisateur connecté = compte démo
 *   window.bdbDemoToast()   — toast conforme CONV-UX-WORDING-01
 *
 * Interception :
 *   - Formulaires (submit) → toast + preventDefault
 *   - Boutons data-action edit/delete/save/add/submit → toast + stopPropagation
 *
 * Bannière :
 *   #bdb-demo-banner fixée en bas de page — visible en mode démo uniquement
 */

(function () {
  'use strict';

  var DEMO_EMAIL = 'demo@bdb.app';
  var DEMO_PASSWORD = 'demo-bdb-2026';

  // ── Détection mode démo ─────────────────────────────────────
  function isDemoUser() {
    return window.bdbUser ? window.bdbUser.email === DEMO_EMAIL : false;
  }
  window.bdbIsDemo = isDemoUser;

  // ── Toast démo — conforme CONV-UX-WORDING-01 ───────────────
  function demoToast() {
    var msg = 'Cette fonctionnalité est réservée aux membres — contactez votre administrateur.';
    if (typeof bdbToast === 'function') {
      bdbToast('info', msg);
    } else if (window.BdbToast) {
      window.BdbToast.info(msg);
    } else {
      alert(msg);
    }
  }
  window.bdbDemoToast = demoToast;

  // ── Bannière démo ───────────────────────────────────────────
  function showDemoBanner() {
    if (!isDemoUser()) return;
    if (document.getElementById('bdb-demo-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'bdb-demo-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9998',
      'background:#f59e0b', 'color:#1e293b', 'text-align:center',
      'padding:.4rem 1rem', 'font-size:.8rem', 'font-weight:600',
      'border-top:2px solid #d97706'
    ].join(';');
    banner.textContent = 'Mode démo — Les données affichées sont fictives. Fonctionnalités en lecture seule.';
    document.body.appendChild(banner);
  }

  // ── Interception actions destructives ──────────────────────
  var BLOCKED_ACTIONS = ['edit', 'delete', 'save', 'add', 'submit', 'create', 'update', 'remove'];

  function interceptDemoActions() {
    if (!isDemoUser()) return;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.dataset.action;
      if (BLOCKED_ACTIONS.indexOf(action) !== -1) {
        e.stopImmediatePropagation();
        e.preventDefault();
        demoToast();
      }
    }, true);

    document.addEventListener('submit', function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      demoToast();
    }, true);
  }

  // ── Entrée démo — connexion Supabase réelle ─────────────────
  window.bdbEnterDemo = async function () {
    var client = window.bdb;
    if (!client) {
      console.error('[bdb-demo] window.bdb absent — supabase-client.js non chargé');
      return;
    }
    // Indicateur visuel optionnel
    var btn = document.getElementById('btnDemo') || document.getElementById('btnSiteDemo');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Connexion en cours…';
    }
    var result = await client.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    });
    if (result.error) {
      if (btn) { btn.disabled = false; btn.textContent = 'Aperçu démo'; }
      if (typeof bdbToast === 'function') {
        bdbToast('error', 'Le mode démo est momentanément indisponible.');
      } else {
        alert('Le mode démo est temporairement indisponible — réessayez dans un instant.');
      }
      console.error('[bdb-demo] Erreur connexion:', result.error.message);
      return;
    }
    // Redirect vers portail — chemin relatif déduit du src du script
    // site/index.html charge ../js/bdb-demo.js → rootPath = ../
    // login.html charge js/bdb-demo.js → rootPath = ./
    var _demoScript = document.querySelector('script[src*="bdb-demo.js"]');
    var _demoRoot = (_demoScript ? _demoScript.getAttribute('src').replace(/js\/bdb-demo\.js$/, '') : './') || './';
    window.location.href = _demoRoot + 'index.html';
  };

  // ── Init au chargement DOM ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    if (!isDemoUser()) return;
    interceptDemoActions();
    showDemoBanner();
  });

})();
