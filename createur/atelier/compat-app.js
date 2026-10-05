/* ================================================================
   compat-app.js — Atelier BDB L3 Créateur
   Audit compatibilité Safari / iOS — logique applicative
   Extrait depuis compat.html le 2026-04-11
   ================================================================ */

(function () {
  'use strict';

  // ─── Compteurs globaux ─────────────────────────────────────────────────────
  let ok = 0, warn = 0, fail = 0;

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  function badge(status) {
    const map = {
      OK:   ['success', 'OK'],
      WARN: ['warning', 'WARN'],
      FAIL: ['danger',  'FAIL'],
      INFO: ['secondary', 'INFO'],
    };
    const [color, label] = map[status] || map.INFO;
    return `<span class="badge bg-${color} badge-status">${label}</span>`;
  }

  function row(label, status, detail = '') {
    if (status === 'OK')   ok++;
    if (status === 'WARN') warn++;
    if (status === 'FAIL') fail++;
    return `
      <div class="result-row">
        ${badge(status)}
        <div>
          <div class="result-label">${escHtml(label)}</div>
          ${detail ? `<div class="result-detail">${escHtml(detail)}</div>` : ''}
        </div>
      </div>`;
  }

  function escHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inject(id, html) {
    document.getElementById(id).innerHTML = html || '<p class="text-secondary mb-0 compat-body-sm">Aucun test.</p>';
  }

  // ─── 1. JavaScript ────────────────────────────────────────────────────────
  function auditJS() {
    const rows = [];

    // Optional chaining
    try { const r = ({a:{b:1}})?.a?.b; rows.push(row('Optional chaining (?.)', r === 1 ? 'OK' : 'FAIL')); }
    catch(e) { rows.push(row('Optional chaining (?.)', 'FAIL', e.message)); }

    // Nullish coalescing
    try { const r = null ?? 'fallback'; rows.push(row('Nullish coalescing (??)', r === 'fallback' ? 'OK' : 'FAIL')); }
    catch(e) { rows.push(row('Nullish coalescing (??)', 'FAIL', e.message)); }

    // Logical assignment ||=
    try { let a = null; a ||= 'ok'; rows.push(row('Logical OR assignment (||=)', a === 'ok' ? 'OK' : 'WARN', 'Safari 15+ requis')); }
    catch(e) { rows.push(row('Logical OR assignment (||=)', 'FAIL', 'Safari < 15 — à éviter dans BDB')); }

    // Logical assignment &&=
    try { let a = 1; a &&= 2; rows.push(row('Logical AND assignment (&&=)', a === 2 ? 'OK' : 'WARN', 'Safari 15+ requis')); }
    catch(e) { rows.push(row('Logical AND assignment (&&=)', 'FAIL', 'Safari < 15 — à éviter dans BDB')); }

    // Nullish assignment ??=
    try { let a = null; a ??= 'ok'; rows.push(row('Nullish assignment (??=)', a === 'ok' ? 'OK' : 'WARN', 'Safari 15+ requis')); }
    catch(e) { rows.push(row('Nullish assignment (??=)', 'FAIL', 'Safari < 15 — à éviter dans BDB')); }

    // structuredClone
    try {
      const r = structuredClone({a: 1});
      rows.push(row('structuredClone()', r.a === 1 ? 'OK' : 'FAIL', 'Safari 15.4+ requis'));
    } catch(e) { rows.push(row('structuredClone()', 'FAIL', 'Safari < 15.4 — remplacer par JSON.parse(JSON.stringify(...))')); }

    // Array.at()
    try { const r = [1,2,3].at(-1); rows.push(row('Array.at()', r === 3 ? 'OK' : 'FAIL', 'Safari 15.4+ requis')); }
    catch(e) { rows.push(row('Array.at()', 'FAIL', e.message)); }

    // Object.hasOwn()
    try { const r = Object.hasOwn({a:1}, 'a'); rows.push(row('Object.hasOwn()', r ? 'OK' : 'FAIL', 'Safari 15.4+ requis')); }
    catch(e) { rows.push(row('Object.hasOwn()', 'FAIL', 'Safari < 15.4 — utiliser hasOwnProperty()')); }

    // Promise.allSettled
    try { Promise.allSettled([Promise.resolve(1)]); rows.push(row('Promise.allSettled()', 'OK')); }
    catch(e) { rows.push(row('Promise.allSettled()', 'FAIL', e.message)); }

    // globalThis
    try { const r = typeof globalThis; rows.push(row('globalThis', r === 'object' ? 'OK' : 'WARN')); }
    catch(e) { rows.push(row('globalThis', 'FAIL', e.message)); }

    // Modules dynamiques (import())
    const modStatus = typeof document.createElement('script').src !== 'undefined' ? 'OK' : 'WARN';
    rows.push(row('Dynamic import() — vérification indirecte', 'INFO', 'Non testable automatiquement — OK Safari 10.1+'));

    inject('secJS', rows.join(''));
  }

  // ─── 2. Web APIs ──────────────────────────────────────────────────────────
  function auditAPIs() {
    const rows = [];

    // sessionStorage
    try {
      sessionStorage.setItem('bdb_safari_test', '1');
      const v = sessionStorage.getItem('bdb_safari_test');
      sessionStorage.removeItem('bdb_safari_test');
      rows.push(row('sessionStorage (bdb_shell cache)', v === '1' ? 'OK' : 'FAIL'));
    } catch(e) { rows.push(row('sessionStorage', 'FAIL', 'Bloqué — navigation privée Safari bloque sessionStorage')); }

    // localStorage
    try {
      localStorage.setItem('bdb_safari_test', '1');
      localStorage.removeItem('bdb_safari_test');
      rows.push(row('localStorage (planning, aliases)', 'OK'));
    } catch(e) { rows.push(row('localStorage', 'FAIL', 'Bloqué — navigation privée Safari. Modules planning/collab/disc non fonctionnels')); }

    // fetch
    rows.push(row('fetch()', typeof fetch === 'function' ? 'OK' : 'FAIL'));

    // AbortController
    rows.push(row('AbortController', typeof AbortController === 'function' ? 'OK' : 'WARN', 'Utilisé pour annuler les requêtes Supabase'));

    // ResizeObserver
    rows.push(row('ResizeObserver', typeof ResizeObserver === 'function' ? 'OK' : 'WARN'));

    // IntersectionObserver
    rows.push(row('IntersectionObserver', typeof IntersectionObserver === 'function' ? 'OK' : 'WARN'));

    // Clipboard API
    rows.push(row('Clipboard API (navigator.clipboard)', navigator.clipboard ? 'OK' : 'WARN', 'Requiert HTTPS'));

    // crypto.randomUUID
    try {
      const u = crypto.randomUUID();
      rows.push(row('crypto.randomUUID()', u && u.length === 36 ? 'OK' : 'WARN', 'Safari 15.4+ requis'));
    } catch(e) { rows.push(row('crypto.randomUUID()', 'WARN', 'Safari < 15.4 — Supabase JS gère en interne')); }

    // URL API
    try { new URL('https://example.com'); rows.push(row('URL constructor', 'OK')); }
    catch(e) { rows.push(row('URL constructor', 'FAIL', e.message)); }

    // CSS Custom Properties via JS
    try {
      const el = document.createElement('div');
      el.style.setProperty('--test', '1px');
      rows.push(row('CSS Custom Properties (JS setProperty)', el.style.getPropertyValue('--test') === '1px' ? 'OK' : 'WARN'));
    } catch(e) { rows.push(row('CSS Custom Properties (JS)', 'FAIL', e.message)); }

    // Supabase client
    rows.push(row('window.bdb (supabase-client.js chargé)', typeof window.bdb !== 'undefined' ? 'OK' : 'WARN',
      typeof window.bdb === 'undefined' ? 'Normal si chargé hors contexte BDB' : 'Client Supabase disponible'));

    inject('secAPIs', rows.join(''));
  }

  // ─── 3. CSS ───────────────────────────────────────────────────────────────
  function auditCSS() {
    const rows = [];
    const el = document.createElement('div');
    document.body.appendChild(el);

    function testCSS(prop, value, label, note = '') {
      el.style[prop] = '';
      el.style[prop] = value;
      const supported = el.style[prop] !== '';
      rows.push(row(label || `${prop}: ${value}`, supported ? 'OK' : 'FAIL', note));
    }

    function testCSSSupports(condition, label, note = '') {
      if (typeof CSS !== 'undefined' && CSS.supports) {
        rows.push(row(label, CSS.supports(condition) ? 'OK' : 'FAIL', note));
      } else {
        rows.push(row(label, 'WARN', 'CSS.supports() indisponible'));
      }
    }

    // Gap en flexbox
    testCSS('gap', '1rem', 'gap (flexbox — Bootstrap 5 intensif)', 'Safari 14+ OK');

    // dvh / svh / lvh
    testCSSSupports('height: 100dvh', 'height: 100dvh (dynamic viewport)', 'Safari 15.4+');
    testCSSSupports('height: 100svh', 'height: 100svh (small viewport)', 'Safari 15.4+');

    // Sticky
    testCSS('position', 'sticky', 'position: sticky (header bdb-shell)');

    // :has()
    testCSSSupports('selector(:has(*))', 'CSS :has() selector', 'Safari 15.4+ — vérifier cds-overrides.css');

    // aspect-ratio
    testCSS('aspectRatio', '16/9', 'aspect-ratio');

    // backdrop-filter
    testCSS('backdropFilter', 'blur(4px)', 'backdrop-filter (modales)', 'Préfixe -webkit- requis sur anciens Safari');

    // object-fit
    testCSS('objectFit', 'cover', 'object-fit: cover (thumbnails BDB — cds-thumbnail)');

    // CSS Grid subgrid
    testCSSSupports('grid-template-rows: subgrid', 'CSS subgrid', 'Safari 16+ — non utilisé dans BDB actuellement');

    // clamp()
    testCSSSupports('font-size: clamp(1rem, 2vw, 1.5rem)', 'clamp() (typographie responsive)', 'Safari 13.1+');

    // Custom properties
    testCSSSupports('color: var(--bs-primary)', 'CSS Custom Properties (variables Bootstrap)', 'Critique pour CDS');

    document.body.removeChild(el);
    inject('secCSS', rows.join(''));
  }

  // ─── 4. BDB spécifique ────────────────────────────────────────────────────
  function auditBDB() {
    const rows = [];

    // 100vh bug iOS
    const vhBug = window.innerHeight < document.documentElement.clientHeight;
    rows.push(row(
      '100vh = hauteur réelle (bug iOS barres navigateur)',
      'INFO',
      `window.innerHeight: ${window.innerHeight}px / clientHeight: ${document.documentElement.clientHeight}px — utiliser min-h-screen ou 100dvh si différent`
    ));

    // Bootstrap Icons chargé
    const biLoaded = [...document.styleSheets].some(s => { try { return s.href && s.href.includes('bootstrap-icons'); } catch(e){ return false; }});
    rows.push(row('Bootstrap Icons chargé', biLoaded ? 'OK' : 'WARN', biLoaded ? '' : 'CDN inaccessible — icônes invisibles'));

    // Bootstrap JS
    rows.push(row('Bootstrap JS (Offcanvas, Modal)', typeof bootstrap !== 'undefined' ? 'OK' : 'FAIL', 'Requis pour bdb-shell offcanvas'));

    // Offcanvas Bootstrap sur iOS
    rows.push(row(
      'Offcanvas Bootstrap — touch scroll iOS',
      'INFO',
      'À vérifier manuellement : scroll dans le menu offcanvas sur iPhone (connu problème body-scroll-lock)'
    ));

    // window.bdbUser
    rows.push(row(
      'window.bdbUser disponible',
      typeof window.bdbUser !== 'undefined' ? 'OK' : 'INFO',
      'Normal si chargé hors contexte auth BDB'
    ));

    // theme-base.css chargé
    const themeLoaded = [...document.styleSheets].some(s => { try { return s.href && s.href.includes('menywise'); } catch(e){ return false; }});
    rows.push(row('theme-base.css chargé (CDN BDB)', themeLoaded ? 'OK' : 'WARN', themeLoaded ? '' : 'CDN GitHub inaccessible'));

    // cds-overrides.css chargé
    const cdsLoaded = [...document.styleSheets].some(s => { try { return s.href && s.href.includes('cds-overrides'); } catch(e){ return false; }});
    rows.push(row('cds-overrides.css chargé (local)', cdsLoaded ? 'OK' : 'WARN'));

    // position sticky + overflow
    rows.push(row(
      'position: sticky dans parent overflow:auto',
      'INFO',
      'Bug Safari connu : sticky ignoré si un parent a overflow:hidden/auto. Vérifier header bdb-shell manuellement.'
    ));

    // Supabase fetch (CORS)
    rows.push(row(
      'Requêtes Supabase cross-origin (CORS)',
      'INFO',
      'À tester manuellement : ouvrir un module et vérifier console Safari — erreurs CORS bloquent toute la donnée'
    ));

    inject('secBDB', rows.join(''));
  }

  // ─── 5. Viewport / Touch ──────────────────────────────────────────────────
  function auditTouch() {
    const rows = [];

    rows.push(row('Touch events supportés', 'ontouchstart' in window ? 'OK' : 'INFO', 'INFO sur desktop — OK attendu sur iOS'));
    rows.push(row('Pointer events supportés', typeof PointerEvent !== 'undefined' ? 'OK' : 'WARN'));

    const dpr = window.devicePixelRatio || 1;
    rows.push(row(`Device Pixel Ratio`, dpr >= 2 ? 'OK' : 'INFO', `DPR = ${dpr} — Retina si ≥ 2`));

    rows.push(row(`Largeur viewport`, 'INFO', `window.innerWidth = ${window.innerWidth}px`));
    rows.push(row(`Hauteur viewport`, 'INFO', `window.innerHeight = ${window.innerHeight}px`));

    rows.push(row(
      'Zones cliquables ≥ 44px (iOS HIG)',
      'INFO',
      'À vérifier manuellement sur tous les boutons et liens BDB. iOS ignore les zones < 44px.'
    ));

    rows.push(row(
      'Inputs : zoom auto-disabled',
      'INFO',
      'iOS zoome sur les <input> avec font-size < 16px. Vérifier les modales et filtres BDB.'
    ));

    rows.push(row(
      'Scroll momentum (-webkit-overflow-scrolling)',
      'INFO',
      'Comportement natif iOS sur les zones scrollables. Vérifier listes longues (annuaire, thesaurus).'
    ));

    inject('secTouch', rows.join(''));
  }

  // ─── 6. Checklist manuelle ────────────────────────────────────────────────
  function renderManual() {
    const items = [
      { label: 'Menu offcanvas bdb-shell', detail: 'Ouvrir → scroller → fermer. Vérifier que le scroll body est bloqué pendant l\'ouverture.' },
      { label: 'Modales Bootstrap (fiches, arsenal, cours…)', detail: 'Ouvrir une modale → scroller à l\'intérieur → fermer. Body ne doit pas défiler derrière.' },
      { label: 'Header sticky visible après scroll', detail: 'Scroller dans une liste longue → le header BDB reste visible en haut.' },
      { label: 'Inputs dans modales — zoom iOS', detail: 'Taper dans un champ texte → iOS ne doit pas zoomer (font-size ≥ 16px requis).' },
      { label: 'Boutons d\'action primaires cliquables', detail: 'Tester les boutons "Enregistrer", "Nouveau", filtres — pas de double-tap requis.' },
      { label: 'Thumbnails (cds-thumbnail)', detail: 'Vérifier l\'affichage des images dans arsenal, anatomie, cours — object-fit:cover correct.' },
      { label: 'Toasts BDB (bdbToast)', detail: 'Déclencher une action → vérifier que le toast apparaît et disparaît correctement.' },
      { label: 'Navigation retour portail', detail: 'Depuis un module → offcanvas → lien portail → navigation sans reload complet.' },
      { label: 'Module planning — matrice', detail: 'Scroll horizontal de la matrice sur iPhone. Tap sur une cellule → éditeur s\'ouvre.' },
      { label: 'Module thesaurus — recherche', detail: 'Saisie dans le champ recherche → résultats filtrés sans lag notable.' },
      { label: 'Mode navigation privée', detail: 'sessionStorage et localStorage peuvent être bloqués → vérifier bdb-shell et modules localStorage.' },
      { label: 'Rotation écran (portrait ↔ paysage)', detail: 'Changer l\'orientation → layout se réajuste sans cassure visible.' },
    ];

    const html = items.map(item => `
      <div class="result-row">
        <div class="form-check flex-shrink-0 mt-1">
          <input class="form-check-input" type="checkbox" id="m_${Math.random().toString(36).slice(2)}">
        </div>
        <div>
          <div class="result-label fw-medium">${escHtml(item.label)}</div>
          <div class="result-detail">${escHtml(item.detail)}</div>
        </div>
      </div>`).join('');

    inject('secManual', html);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function updateCounters() {
    document.getElementById('cntOk').textContent   = ok;
    document.getElementById('cntWarn').textContent = warn;
    document.getElementById('cntFail').textContent = fail;
  }

  function init() {
    // UA
    const ua = navigator.userAgent;
    document.getElementById('uaFull').textContent      = ua;
    document.getElementById('userAgentShort').textContent = ua.substring(0, 60) + (ua.length > 60 ? '…' : '');

    // Date
    document.getElementById('runDate').textContent = new Date().toLocaleString('fr-FR');

    // Tests
    auditJS();
    auditAPIs();
    auditCSS();
    auditBDB();
    auditTouch();
    renderManual();

    updateCounters();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
