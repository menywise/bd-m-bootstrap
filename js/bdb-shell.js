// ============================================================
// bdb-shell.js — Shell auth universel BDB
// Bible de Bloc
// VERSION : 2.6.0 — 2026-05-02
// ============================================================
// DELTA v2.5.1 → v2.6.0  (DUAL-MODE SMARTY / DBM THEME)
//   Attribut data-shell-theme="dbm" sur #bdb-shell active le
//   mode DBM (dbm-theme.css + classes .app-*). Sans cet attribut,
//   le shell fonctionne exactement comme avant (Smarty V5).
//
//   NOUVEAU :
//   - Variable _shellTheme ('smarty' | 'dbm')
//   - _buildAsideDbm(isAdmin) : sidebar .app-sidebar avec .app-sidebar-brand,
//     .app-sidebar-nav, .app-sidebar-section, .app-sidebar-link
//   - _buildAsideStaticDbm() : fallback statique DBM
//   - _buildHeaderDbm(title, icon) : header .app-header avec toggle,
//     search, badges, avatar
//   - _initSidebarToggleDbm() : collapse desktop + overlay mobile
//   - Body classes DBM : sidebar-closed (au lieu de layout-admin aside-sticky)
//
//   AUCUN changement pour les pages existantes (data-shell-theme absent).
//   Rétrocompatibilité 100%.
//
//   PRÉREQUIS : dbm-theme.css chargé dans la page (à la place de
//   theme-base.css + cds-overrides.css).
// ============================================================
// DELTA v2.5.0 → v2.5.1  (FIX OVERLAY CSS .bo-* SANS SESSION)
//   body.bdb-shell-{kind} était ajouté en Step 3 (ligne 247),
//   jamais atteint sans session. Les classes .bo-card, .bo-accent-*,
//   .bo-state-icon de l'overlay auth (Step 1) étaient inactives
//   car scopées body.bdb-shell-backoffice dans cds-overrides.css.
//   FIX : ajout de body.bdb-shell-{kind} AVANT le check session (Step 0).
//
// DELTA v2.4.0 → v2.5.0  (AUTH-REQUIRED OVERLAY — RESPONSABILITÉ SHELL)
//   Bug racine S#95 : 7 modules atelier sur 9 omettaient
//   document.body.classList.add('bdb-auth-required') dans leur
//   listener bdb:auth-required → contenu loading visible derrière l'overlay
//   en mode déconnecté.
//
//   Cause structurelle : la responsabilité de l'overlay auth était
//   répartie sur 30+ modules (HTML overlay propre + listener JS +
//   classe body). 30 occasions d'oubli, 30 wordings divergents,
//   30 fichiers à maintenir indépendamment.
//
//   FIX (UX/UI premium "1 fois pour toute") :
//   - Le shell injecte LUI-MÊME un overlay unique global :
//     <div id="bdb-auth-overlay"> premier enfant de <body>
//     (hors #wrapper donc exempt du masquage R8.9 par essence).
//   - Le shell ajoute LUI-MÊME body.bdb-auth-required.
//   - Le shell câble LUI-MÊME les boutons login + refresh.
//   - L'événement bdb:auth-required reste émis pour rétrocompat
//     (modules qui veulent journaliser/réagir spécifiquement).
//
//   APPELS de _renderAuthOverlay() :
//   - Step 1 (session absente initiale) sur _loginMode === 'modal'
//   - _doLogout (auto-logout idle) sur _loginMode === 'modal'
//   - Bouton déconnexion utilisateur sur _loginMode === 'modal'
//
//   WORDING : générique, neutre, pas de nom d'app (l'app n'est pas
//   encore chargée à ce stade — Step 7 est postérieure).
//
//   COMPATIBILITÉ :
//   - Les modules continuant à porter leur propre overlay HTML +
//     listener fonctionnent toujours (rétrocompat assurée tant que
//     les IDs *-auth-overlay matchent R8.8/R8.9 du CSS).
//   - Recommandation forte : retirer ces overlays/listeners au fur
//     et à mesure (skill bdb-module-generator + balayage S#96).
//
//   AUCUN changement CSS requis : R8.8 cible tous [id$="-auth-overlay"]
//   sans préjuger de leur position dans le DOM.
// ============================================================
// DELTA v2.3.0 → v2.4.0  (HYDRATATION DOM IDENTITÉ APPLICATION)
//   Bug racine S#95 : window.bdbApp était chargé depuis app_instance
//   (Step 7) mais AUCUN consommateur ne lisait window.bdbApp.nom
//   ni .nomCourt. Tous les <span class="app-nom"></span> du DOM étaient
//   donc vides en production. Bug actif depuis migration 154.
//
//   FIX :
//   - Step 7bis : hydratation des spans .app-nom et .app-nom-court du DOM
//     avec window.bdbApp.nom et .nomCourt (querySelectorAll + textContent).
//   - Step 7ter : suffixage automatique de document.title avec nomCourt
//     (idempotent — pas de double suffixe si nomCourt déjà présent).
//
//   CONVENTION PRODUIT (à respecter dans toutes les pages BDB) :
//   - Aucun "BDB" hardcodé dans les wordings utilisateur visibles.
//   - <span class="app-nom"></span> ou <span class="app-nom-court"></span>
//     pour afficher dynamiquement le nom de l'instance.
//   - <title> de chaque page = uniquement le titre de la PAGE,
//     le shell ajoute automatiquement " — <nomCourt>".
//
//   AUCUN changement CSS, AUCUNE modification HTML socle requise.
//   AUCUNE modification module requise — la propagation est centrale.
// ============================================================
// DELTA v2.2.0 → v2.3.0  (ZÉRO CSS DANS LE JS — migration vers cds-overrides.css v2.0.0)
//   Règle BDB : cds-overrides.css devient LA couche premium officielle.
//   Interdiction absolue de cacher du CSS dans un JS (shell, modules, ui, ...).
//
//   4 blocs CSS précédemment injectés en runtime sont supprimés :
//   - Bloc 1 (signaux visuels rôles/demo-banner)    → cds-overrides R1
//   - Bloc 2 (idle warn session inactive)           → cds-overrides R2
//   - Bloc 3 (menu user + sidebar + backoffice +
//             toggle mobile, ~200 lignes CSS)       → cds-overrides R3 + R4 + R5 + R7
//   - Bloc 4 (signalement FAB + modale)             → cds-overrides R6
//
//   NOUVEAU dans cds-overrides v2.0.0 :
//   - R8 : kit harmonisé back office (.bo-card, .bo-icon-badge, .bo-kpi-*,
//     .bo-tabs, .bo-table, .bo-state-icon, .bo-avatar), scopé body.bdb-shell-backoffice.
//     Doctrine visuelle unique pour atelier, conseil, admin, supervision
//     et tout module back office à venir.
//
//   PRÉREQUIS DÉPLOIEMENT :
//   - Déployer cds-overrides.css v2.0.0 AVANT bdb-shell.js v2.3.0,
//     sinon dégradation visuelle (menu avatar, nav active, sidebar back office...).
//   - Chaîne CSS dans chaque module : Bootstrap → theme-base → BI → cds-overrides.
//
//   ZÉRO changement JS — uniquement du CSS retiré.
// ============================================================
// DELTA v2.1.2 → v2.2.0  (refonte dropdown user : custom au lieu de Bootstrap)
//   K. Bootstrap dropdown ne supporte pas nativement les sous-menus
//      imbriqués. Toute tentative de contourner (data-bs-auto-close,
//      preventDefault, retrait .dropdown-item) échouait car Bootstrap
//      interfère au niveau de la logique de fermeture.
//      → Remplacement par le pattern custom éprouvé dans index.html :
//        - <button id="bdbAvatarBtn"> simple (pas data-bs-toggle)
//        - <div class="bdb-user-menu"> custom (pas .dropdown-menu)
//        - Classes .bdb-user-menu-item (pas .dropdown-item)
//        - Toggle via classList.toggle('open')
//        - Fermeture au clic document + Escape
//        - stopPropagation dans le menu pour garder ouvert
//      CSS complet injecté en runtime (auto-suffisant, zéro dépendance
//      cds-overrides.css).
// ============================================================
// DELTA v2.1.1 → v2.1.2  (correctif sous-menu prévisualisation)
//   J. Bootstrap dropdown interceptait le clic sur .dropdown-item des
//      3 boutons preview et fermait le menu parent (data-bs-auto-close
//      "outside" ne protège pas toujours). Retrait de la classe
//      .dropdown-item → classes custom .bdb-preview-trigger et
//      .bdb-preview-subitem stylées en CSS injecté (apparence identique,
//      comportement libre du dropdown Bootstrap).
//      + aria-expanded + rotation chevron au toggle.
// ============================================================
// DELTA v2.1.0 → v2.1.1  (3 correctifs UX post-test Manu)
//   G. Sous-menu prévisualisation : type="button" explicite + preventDefault
//      pour empêcher Bootstrap dropdown-item de fermer le menu parent.
//   H. Badge "Nouveau" : remplacement classe inexistante .bdb-nav-badge-new
//      par badge Bootstrap natif .badge.rounded-pill.text-bg-info
//      + règles CSS complémentaires (padding, uppercase, letter-spacing).
//   I. .nav-item.active sidebar : style distinctif UX premium
//      (fond subtil + bordure gauche 3px + icône colorée) front=bleu,
//      back office=violet.
// ============================================================
// DELTA v2.0.0 → v2.1.0  (6 correctifs UX post-audit Manu)
//   A. Toggle sidebar masqué en desktop : ajout d-lg-none
//   B. Toggle mobile fonctionnel : convention Smarty V5 native
//      (.js-aside-show sur l'aside) au lieu de body.bdb-aside-open
//      qui entrait en conflit avec aside:not(.js-aside-show) de theme-base.
//   C. Avatar header : dropdown-toggle retiré (pas de caret sur cercle)
//      + w-300 → w-100 w-md-300 (responsive mobile)
//   D. Dette .nav-title theme-base : override CSS injecté en runtime
//      (uppercase, muted, font-size .68rem) jusqu'à recompilation propre.
//   E. Footer aside (avatar + nom bas sidebar) supprimé — duplication
//      avec le dropdown user du header, sans interaction.
//   F. data-shell-kind="front|backoffice" sur #bdb-shell
//      → body.bdb-shell-front ou body.bdb-shell-backoffice
//      permet la différenciation visuelle front vs back office.
// ============================================================
// DELTA v1.9.3 → v2.0.0  (Smarty V5 native layout)
//   - Layout: Bootstrap offcanvas (drawer) → Smarty V5 aside fixe
//     · _buildOffcanvas() → _buildAside() : <aside id="aside-main">
//     · nav-deep nav-deep-sm nav-deep-light (classes Smarty V5)
//     · li.nav-title pour les en-têtes de groupe
//     · aside injecté dans #wrapper_content (insertAdjacentHTML afterbegin)
//     · header injecté dans #bdb-shell (comme avant)
//   - Header: markup Smarty V5 natif (<header id="header">, shadow-xs)
//     · Avatar = Bootstrap dropdown natif (data-bs-toggle="dropdown")
//     · Suppression du JS custom de toggle avatar (était step 9)
//     · Dropdown user = .dropdown-menu-clean .dropdown-menu-invert .w-300
//   - Body classes injectées : layout-admin aside-sticky
//   - Mobile sidebar : _initSidebarToggle() + CSS injecté
//     (pas de core.min.js Smarty V5 — BDB n'en charge pas)
//   - Renommage IDs footer aside :
//     · offcanvasAvatarInitials → bdbAsideAvatarInitials
//     · offcanvasUserName       → bdbAsideUserName
//   - Photo avatar : bg-cover + style.backgroundImage (URL dynamique)
// ============================================================
// DELTA v1.9.2 → v1.9.3
//   - Step 7 : window.bdbApp chargé depuis table app_instance (migration 154).
//     Fallback hardcodé si table absente ou erreur réseau.
// ============================================================
// DELTA v1.9.1 → v1.9.2
//   - Signaux visuels complets (spec 01_ACCES_NIVEAUX V1.0.0) :
//     · Badge Admin  : bg-danger → bg-primary (bleu #0d6efd)
//     · Badge Créateur violet (#6f42c1) ajouté dans header + step 7
//     · Bandeau isDemo : texte → "Mode Découverte — lecture seule"
// ============================================================
// DELTA v1.9.0 → v1.9.1
//   - _buildOffcanvas() : suppression des 2 style= inline sur les
//     en-têtes de groupe → classes CSS .bdb-nav-group-label et
//     .bdb-nav-group-icon (INTERDIT-C2 fix — définies dans cds-overrides v1.7.0).
//   - _buildOffcanvas() : ajout d-flex align-items-center sur <a class="bdb-nav-link">
//     pour que ms-auto sur .bdb-nav-badge-new pousse le badge à droite.
// ============================================================
// DELTA v1.8.0 → v1.9.0
//   - data-root-path : attribut sur #bdb-shell, défaut '../../'.
//   - data-login-mode="modal" : dispatch CustomEvent 'bdb:auth-required'.
// ============================================================
// DELTA v1.7.0 → v1.8.0
//   - Bouton flottant signalement universel (bi-flag FAB, step 12).
// ============================================================
// DELTA v1.6.0 → v1.7.0
//   - show_in_footer + _injectFooterLinks().
// ============================================================
// DELTA v1.5.0 → v1.6.0
//   - Return URL login + anti-open-redirect.
// ============================================================
// DELTA v1.4.0 → v1.5.0
//   - Auto-logout 30 min inactivité (R3-AUTH-03).
// ============================================================
// DELTA v1.3.1 → v1.4.0
//   - Menu dynamique Supabase (app_groups + app_modules).
//   - Badge Nouveau / Bientôt. Fallback statique.
// ============================================================

// Variables de module — accessibles à tous les builders
let _bdbFooterModules = [];
let _rootPath   = '../../';   // surchargé via data-root-path sur #bdb-shell
let _loginMode  = 'redirect'; // surchargé via data-login-mode="modal" sur #bdb-shell
let _shellKind  = 'front';    // surchargé via data-shell-kind="backoffice" sur #bdb-shell
let _shellTheme = 'smarty';   // surchargé via data-shell-theme="dbm" sur #bdb-shell

window.bdbShellReady = (async function () {
  'use strict';

  // ── 0. LECTURE ATTRIBUTS SHELL ──────────────────────────────────────────
  const _shellElEarly = document.getElementById('bdb-shell');
  _rootPath   = _shellElEarly?.dataset?.rootPath   ?? '../../';
  _loginMode  = _shellElEarly?.dataset?.loginMode  ?? 'redirect';
  _shellKind  = _shellElEarly?.dataset?.shellKind  ?? 'front';
  _shellTheme = _shellElEarly?.dataset?.shellTheme ?? 'smarty';

  // Shell-kind sur <body> — AVANT le check session.
  // Les .bo-* du Kit BO sont scopés body.bdb-shell-backoffice.
  // Sans cette ligne, l'overlay auth (Step 1) rendrait du Bootstrap brut.
  document.body.classList.add('bdb-shell-' + _shellKind);

  // ── 1. VÉRIFICATION SESSION ─────────────────────────────────────────────
  // try/catch : en file:// ou si Supabase est injoignable, getSession()
  // lance une exception CORS. Sans catch le shell plante et l'overlay
  // auth n'est jamais affiché → page brute visible. (fix v2.6.1)
  let _s = null;
  try {
    _s = await window.bdbGetSession();
  } catch (_sessionErr) {
    _s = null;
  }
  if (!_s) {
    if (_loginMode === 'modal') {
      _renderAuthOverlay(_rootPath + 'login.html');
      document.dispatchEvent(new CustomEvent('bdb:auth-required', {
        detail: { loginUrl: _rootPath + 'login.html' }
      }));
      return;
    }
    var _returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = _rootPath + 'login.html?redirect=' + _returnUrl;
    return;
  }

  // ── 2. CHARGEMENT RÔLE (avant injection HTML — requis pour filtrer visibility) ──
  let _earlyIsAdmin = false;
  let _earlyRole    = null;
  try {
    const { data: _r } = await window.bdb
      .from('user_roles')
      .select('role')
      .eq('user_id', _s.user.id)
      .maybeSingle();
    _earlyRole    = _r?.role ?? null;
    _earlyIsAdmin = _r?.role === 'admin';
  } catch (_) {}

  // ── 3. INJECTION HTML ───────────────────────────────────────────────────
  const shellEl = document.getElementById('bdb-shell');
  if (!shellEl) return;

  const moduleTitle = shellEl.dataset.moduleTitle ?? 'BDB';
  const moduleIcon  = shellEl.dataset.moduleIcon  ?? 'bi-grid';

  if (_shellTheme === 'dbm') {
    // ── DBM mode : dbm-theme.css layout (.app-sidebar, .app-header) ──
    document.body.classList.add('sidebar-closed', 'bdb-shell-' + _shellKind);

    // Sidebar injecté dans <body> (avant #wrapper — position fixed)
    const _asideHtml = await _buildAsideDbm(_earlyIsAdmin);
    document.body.insertAdjacentHTML('afterbegin', _asideHtml);
    // Overlay sidebar mobile
    const _ov = document.createElement('div');
    _ov.className = 'app-sidebar-overlay';
    _ov.id = 'sidebarOverlay';
    document.body.insertAdjacentElement('afterbegin', _ov);

    // Skip link WCAG
    const _skip = document.createElement('a');
    _skip.href = '#main-content';
    _skip.className = 'skip-link';
    _skip.textContent = 'Aller au contenu principal';
    document.body.insertAdjacentElement('afterbegin', _skip);

    // Header injecté dans #bdb-shell
    shellEl.innerHTML = _buildHeaderDbm(moduleTitle, moduleIcon);

    // Liens footer
    _injectFooterLinks(_bdbFooterModules);

    // Sidebar toggle desktop + mobile
    _initSidebarToggleDbm();

  } else {
    // ── Smarty V5 mode (inchangé) ──
    document.body.classList.add('layout-admin', 'aside-sticky', 'bdb-shell-' + _shellKind);

    // Aside injecté dans #wrapper_content (avant le <main>)
    const _asideHtml = await _buildAside(_earlyIsAdmin);
    const _wc = document.getElementById('wrapper_content');
    if (_wc) _wc.insertAdjacentHTML('afterbegin', _asideHtml);

    // Header injecté dans #bdb-shell
    shellEl.innerHTML = _buildHeader(moduleTitle, moduleIcon);

    // Liens footer
    _injectFooterLinks(_bdbFooterModules);

    // Sidebar toggle mobile (CSS + JS — pas de core.min.js Smarty V5)
    _initSidebarToggle();
  }

  // ── 4. MODE PREVIEW ACTIF ? ─────────────────────────────────────────────
  const _previewRole = window.bdbGetPreviewRole ? window.bdbGetPreviewRole() : null;

  // ── 5. CHARGEMENT PROFIL ────────────────────────────────────────────────
  try {
    const { data: _p } = await window.bdb
      .from('profiles_directory')
      .select('prenom, nom, initials, avatar_url, fonction, is_creator, is_redacteur, is_suspended')
      .eq('user_id', _s.user.id)
      .maybeSingle();

    const ini = (_p?.initials
      || ((_p?.prenom?.[0] || '') + (_p?.nom?.[0] || ''))
      || _s.user.email.substring(0, 2)
    ).toUpperCase();

    const name = [_p?.prenom, _p?.nom].filter(Boolean).join(' ') || _s.user.email;

    const avatarBtn  = document.getElementById('bdbAvatarBtn');
    const avatarIni  = document.getElementById('bdbAvatarInitials');
    const asideIni   = document.getElementById('bdbAsideAvatarInitials');

    if (_p?.avatar_url) {
      // Photo : bg-cover + background-image (URL dynamique — tolérée INTERDIT-C2)
      avatarBtn.classList.add('bg-cover');
      avatarBtn.style.backgroundImage = `url("${_p.avatar_url}")`;
      avatarIni.style.display = 'none';
      if (asideIni) {
        asideIni.classList.add('bg-cover');
        asideIni.style.backgroundImage = `url("${_p.avatar_url}")`;
      }
    } else {
      // Initiales + couleur déterministe par prénom
      avatarBtn.style.background = _bdbAvatarColor(_p?.prenom || '');
      avatarIni.textContent = ini;
      if (asideIni) {
        asideIni.textContent = ini;
        asideIni.style.background = _bdbAvatarColor(_p?.prenom || '');
      }
    }

    const _asideName = document.getElementById('bdbAsideUserName');
    if (_asideName) _asideName.textContent = name;
    document.getElementById('bdbMenuName').textContent      = name;
    document.getElementById('bdbMenuEmail').textContent     = _s.user.email;

    window.bdbUser = {
      id          : _s.user.id,
      email       : _s.user.email,
      prenom      : _p?.prenom    ?? '',
      nom         : _p?.nom       ?? '',
      initials    : ini,
      avatar_url  : _p?.avatar_url ?? null,
      fonction    : _p?.fonction  ?? '',
      role        : _earlyRole,
      isDemo      : true,
      isMember    : _earlyRole !== 'invite',
      isAdmin     : _earlyIsAdmin || (_p?.is_creator === true),
      isCreator   : _p?.is_creator === true,
      // S118 : redacteur = flag additionnel sur profiles, cascade depuis admin/creator
      isRedacteur : (_p?.is_redacteur === true) || _earlyIsAdmin || (_p?.is_creator === true),
      // S128 D-2026-05-09-CARD-CRUD : isSuspended = sanction acces (bot, intrus, suspension humaine).
      // Cascade Manu : Createur > Admin > Redacteur > Membre > Invite > SUSPENDU.
      // Override toutes capacites de mutation (cf. bdb-invite-guard.js + RLS Supabase).
      // Lecture reste possible (defense en profondeur cote serveur).
      isSuspended : _p?.is_suspended === true
    };

  } catch (_) {
    window.bdbUser = {
      id: _s.user.id, email: _s.user.email,
      prenom: '', nom: '',
      initials: _s.user.email.substring(0, 2).toUpperCase(),
      avatar_url: null, fonction: '', role: _earlyRole,
      isDemo: true, isMember: _earlyRole !== 'invite',
      isAdmin: _earlyIsAdmin, isCreator: false,
      isRedacteur: _earlyIsAdmin,
      // S128 : isSuspended fallback (en cas d'echec lecture profile = lecture par defaut autorisee)
      isSuspended: false
    };
  }

  // ── 6. CHARGER bdb-preview.js (créateur uniquement) ─────────────────────
  if (window.bdbUser.isCreator) {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src     = _rootPath + 'js/bdb-preview.js';
      s.onload  = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  // ── 7. IDENTITÉ APPLICATION (depuis app_instance — migration 154) ────────
  const _APP_DEFAULTS = { nom: 'Des Blocs & Moi', nomCourt: 'DBM', couleur: '#0d6efd', logo: null };
  try {
    const { data: _inst } = await window.bdb
      .from('app_instance')
      .select('nom, nom_court, couleur, logo_url')
      .maybeSingle();
    window.bdbApp = {
      nom      : _inst?.nom       ?? _APP_DEFAULTS.nom,
      nomCourt : _inst?.nom_court ?? _APP_DEFAULTS.nomCourt,
      couleur  : _inst?.couleur   ?? _APP_DEFAULTS.couleur,
      logo     : _inst?.logo_url  ?? null
    };
  } catch (_) {
    window.bdbApp = { ..._APP_DEFAULTS };
  }

  // ── 7bis. HYDRATATION DOM AVEC L'IDENTITÉ APPLICATION ───────────────────
  // Branche window.bdbApp.nom et nomCourt dans tous les .app-nom et
  // .app-nom-court présents dans le DOM. Mécanisme global : aucun module
  // n'a besoin de connaître le nom de l'app, il suffit qu'il pose un span.
  // Idempotent : peut être appelé à nouveau sans dégât (textContent).
  document.querySelectorAll('.app-nom').forEach(function (el) {
    el.textContent = window.bdbApp.nom;
  });
  document.querySelectorAll('.app-nom-court').forEach(function (el) {
    el.textContent = window.bdbApp.nomCourt;
  });

  // ── 7ter. HYDRATATION DU <title> DE PAGE ────────────────────────────────
  // Convention : la page pose son titre court (ex: <title>Atelier — Portail L3</title>)
  // Le shell suffixe avec le nom court de l'app : "Atelier — Portail L3 — DBM"
  // Idempotent : si le nomCourt est déjà dans le titre, ne rien faire.
  if (document.title && window.bdbApp.nomCourt
      && document.title.indexOf(window.bdbApp.nomCourt) === -1) {
    document.title = document.title.trim() + ' — ' + window.bdbApp.nomCourt;
  }

  // ── Mode preview : surcharger window.bdbUser avec données fictives ────────
  if (_previewRole) {
    const _pd = _previewRole === 'anonymous'
      ? window.BDB_PREVIEW_DATA.anonymousProfile
      : window.BDB_PREVIEW_DATA.memberProfile;
    window.bdbUser.role    = _pd.role    ?? null;
    window.bdbUser.isAdmin = false;
  }

  // ── 8. APPLICATION UI DU RÔLE ──────────────────────────────────────────
  if (_earlyIsAdmin && !_previewRole) {
    window.bdbUser.isAdmin = true;
    document.getElementById('bdbBadgeAdmin')?.classList.remove('d-none');
    document.querySelectorAll('.bdb-nav-admin').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.bdb-admin-only').forEach(el => el.classList.remove('d-none'));
    _initPreviewMenu();
  }
  if (window.bdbUser.isCreator && !_previewRole) {
    document.getElementById('bdbBadgeCreator')?.classList.remove('d-none');
    document.querySelectorAll('.bdb-creator-only').forEach(el => el.classList.remove('d-none'));
  }
  // S118 : badge + classe utilitaire redacteur (pattern symetrique admin/creator)
  if (window.bdbUser.isRedacteur && !_previewRole) {
    document.getElementById('bdbBadgeRedacteur')?.classList.remove('d-none');
    document.querySelectorAll('.bdb-nav-redacteur').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.bdb-redacteur-only').forEach(el => el.classList.remove('d-none'));
  }

  // Signaux visuels — isDemo / isMember
  // CSS migré vers cds-overrides.css R1 (v2.3.0)
  (function _initSignauxVisuels() {
    if (window.bdbUser.role === 'invite') {
      document.getElementById('bdbBadgeDemo')?.classList.remove('d-none');
      const _banner = document.createElement('div');
      _banner.className = 'bdb-demo-banner';
      _banner.innerHTML = '<i class="bi bi-eye me-1"></i>Mode D\u00e9couverte \u2014 lecture seule';
      document.body.insertAdjacentElement('afterbegin', _banner);
    }
  })();

  // ── 9. LOGOUT + TOGGLE MENU UTILISATEUR (pattern custom — identique index.html) ──

  // Toggle menu custom (évite conflit Bootstrap dropdown avec sous-menu preview)
  (function _initUserMenu() {
    const btn  = document.getElementById('bdbAvatarBtn');
    const menu = document.getElementById('bdbUserMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Fermer au clic extérieur
    document.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });

    // Clic intérieur — ne pas fermer
    menu.addEventListener('click', (e) => e.stopPropagation());

    // Escape — fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  })();

  document.getElementById('bdbBtnLogout').addEventListener('click', async () => {
    if (window.bdbGetPreviewRole && window.bdbGetPreviewRole()) {
      window.bdbExitPreview
        ? window.bdbExitPreview()
        : (() => {
            sessionStorage.removeItem('bdb_preview_role');
            window.location.href = _rootPath + 'index.html';
          })();
      return;
    }
    await window.bdb.auth.signOut();
    if (_loginMode === 'modal') {
      _renderAuthOverlay(_rootPath + 'login.html');
      document.dispatchEvent(new CustomEvent('bdb:auth-required', {
        detail: { loginUrl: _rootPath + 'login.html' }
      }));
      return;
    }
    window.location.href = _rootPath + 'login.html';
  });

  // ── 10. BANNIÈRE PREVIEW ────────────────────────────────────────────────
  if (window.bdbInjectPreviewBanner) window.bdbInjectPreviewBanner();

  // ── 11. AUTO-LOGOUT INACTIVITÉ (R3-AUTH-03 · AUDIT_SECURITE S6) ───────
  (function _initIdleLogout() {
    const _IDLE_MS  = 30 * 60 * 1000;
    const _WARN_MS  =  5 * 60 * 1000;
    let _idleTimer  = null;
    let _warnTimer  = null;
    let _warnEl     = null;

    // CSS .bdb-idle-warn migré vers cds-overrides.css R2 (v2.3.0)

    function _resetIdle() {
      clearTimeout(_idleTimer);
      clearTimeout(_warnTimer);
      if (_warnEl) { _warnEl.remove(); _warnEl = null; }
      _warnTimer = setTimeout(_showWarn, _IDLE_MS - _WARN_MS);
      _idleTimer = setTimeout(_doLogout, _IDLE_MS);
    }

    function _showWarn() {
      if (_warnEl) return;
      _warnEl = document.createElement('div');
      _warnEl.className = 'bdb-idle-warn';
      _warnEl.innerHTML = '<i class="bi bi-clock-history me-2"></i>Session inactive \u2014 d\u00e9connexion dans 5\u00a0min';
      document.body.appendChild(_warnEl);
      requestAnimationFrame(() => _warnEl.classList.add('show'));
    }

    async function _doLogout() {
      if (_warnEl) _warnEl.remove();
      try { await window.bdb.auth.signOut(); } catch (_) {}
      if (_loginMode === 'modal') {
        _renderAuthOverlay(_rootPath + 'login.html');
        document.dispatchEvent(new CustomEvent('bdb:auth-required', {
          detail: { loginUrl: _rootPath + 'login.html' }
        }));
        return;
      }
      var _returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = _rootPath + 'login.html?redirect=' + _returnUrl;
    }

    ['click','keydown','scroll','touchstart','mousemove'].forEach(function (evt) {
      document.addEventListener(evt, _resetIdle, { passive: true });
    });
    window.addEventListener('focus', _resetIdle);

    _resetIdle();
  })();

  // ── 12. BOUTON SIGNALEMENT UNIVERSEL ──────────────────────────────────
  _initSignalement();

})();


// ── INJECTION OVERLAY AUTH (responsabilité shell — v2.5.0) ────────────────
// Crée un overlay unique <div id="bdb-auth-overlay"> en premier enfant de
// <body>, hors du #wrapper. Ajoute body.bdb-auth-required → R8.9 du CSS
// masque tout le reste de la page. R8.8 active l'overlay en fullscreen.
//
// Idempotent : si l'overlay existe déjà, ne le recrée pas (ré-affiche).
// Wording générique : pas de nom d'app (window.bdbApp pas encore chargé
// au moment où Step 1 détecte l'absence de session).
function _renderAuthOverlay(loginUrl) {
  // Si l'overlay existe déjà (cas relogin/idle après login initial), réafficher.
  let overlay = document.getElementById('bdb-auth-overlay');
  if (overlay) {
    overlay.classList.remove('d-none');
    document.body.classList.add('bdb-auth-required');
    return;
  }

  overlay = document.createElement('div');
  overlay.id = 'bdb-auth-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'bdb-auth-overlay-title');
  overlay.innerHTML = `
    <div class="card bdb-card bdb-card--accent-primary">
      <div class="card-body text-center py-5">
        <div class="bo-state-icon bg-primary-subtle text-primary">
          <i class="bi bi-lock-fill"></i>
        </div>
        <h2 id="bdb-auth-overlay-title" class="h5 fw-bold mb-2">Connexion requise</h2>
        <p class="text-muted mb-4">
          Cet espace n\u00e9cessite une session active.<br>
          Connecte-toi puis reviens actualiser.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-primary" id="bdb-auth-btn-login" type="button">
            <i class="bi bi-box-arrow-in-right me-1"></i>Ouvrir la connexion
          </button>
          <button class="btn btn-outline-secondary" id="bdb-auth-btn-refresh" type="button">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
          </button>
        </div>
      </div>
    </div>`;

  // Insertion en PREMIER enfant de <body> — hors de #wrapper
  // Ainsi R8.9 (qui masque main#middle > *) ne le concerne pas
  document.body.insertAdjacentElement('afterbegin', overlay);

  // Câblage des boutons
  const _safeLoginUrl = (typeof loginUrl === 'string' && loginUrl) ? loginUrl : 'login.html';
  document.getElementById('bdb-auth-btn-login')
    .addEventListener('click', function () {
      window.open(_safeLoginUrl, '_blank');
    });
  document.getElementById('bdb-auth-btn-refresh')
    .addEventListener('click', function () {
      window.location.reload();
    });

  // Activation du masquage R8.9
  document.body.classList.add('bdb-auth-required');
}


// ── INIT SOUS-MENU PRÉVISUALISATION (admin uniquement) ─────────────────────
// Le menu parent est maintenant custom (pattern .bdb-user-menu / .open).
// Ce handler toggle simplement d-none sur le submenu — zéro interférence.
function _initPreviewMenu() {
  const btnMenu   = document.getElementById('bdbBtnPreviewMenu');
  const submenu   = document.getElementById('bdbPreviewSubmenu');
  const btnMember = document.getElementById('bdbBtnPreviewMember');
  const btnAnon   = document.getElementById('bdbBtnPreviewAnon');

  if (!btnMenu || !submenu) return;

  btnMenu.classList.remove('d-none');
  btnMenu.setAttribute('aria-expanded', 'false');

  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = submenu.classList.contains('d-none');
    submenu.classList.toggle('d-none');
    btnMenu.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  btnMember?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.bdbSetPreviewRole) window.bdbSetPreviewRole('member');
  });
  btnAnon?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.bdbSetPreviewRole) window.bdbSetPreviewRole('anonymous');
  });
}


// ── SIDEBAR TOGGLE MOBILE + OVERRIDES CSS ────────────────────────────────
// v2.1.0 :
//   - Utilise la convention Smarty V5 native .js-aside-show sur l'aside
//     (au lieu de body.bdb-aside-open qui entrait en conflit avec
//     aside:not(.js-aside-show).aside-start { margin-left: -265px } de theme-base).
//   - Ajoute override CSS pour .nav-title (dette theme-base compilé).
//   - Ajoute override visuel bdb-shell-backoffice pour différencier back office.
//   - Masque le toggle en desktop via d-lg-none côté markup (voir _buildHeader).
function _initSidebarToggle() {
  // CSS menu user + nav sidebar + toggle mobile + backoffice
  // → migré vers cds-overrides.css R3 + R4 + R5 + R7 (v2.3.0)


  const overlay = document.createElement('div');
  overlay.id = 'bdb-aside-overlay';
  document.body.appendChild(overlay);

  const asideEl = document.getElementById('aside-main');

  function _openAside() {
    if (asideEl) asideEl.classList.add('js-aside-show');
    document.body.classList.add('bdb-aside-open');
  }
  function _closeAside() {
    if (asideEl) asideEl.classList.remove('js-aside-show');
    document.body.classList.remove('bdb-aside-open');
  }

  document.querySelectorAll('.btn-sidebar-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (asideEl && asideEl.classList.contains('js-aside-show')) {
        _closeAside();
      } else {
        _openAside();
      }
    });
  });

  overlay.addEventListener('click', _closeAside);

  // Fermer l'aside au clic sur un lien (UX mobile)
  if (asideEl) {
    asideEl.querySelectorAll('a.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) _closeAside();
      });
    });
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// SIGNALEMENT UNIVERSEL — bouton flottant + modale
// ═══════════════════════════════════════════════════════════════════════════

function _initSignalement() {

  // CSS .bdb-sig-* migré vers cds-overrides.css R6 (v2.3.0)


  document.body.insertAdjacentHTML('beforeend', `
    <button class="bdb-sig-fab" id="bdbSigFab"
      aria-label="Signaler un problème" title="Signaler un problème">
      <i class="bi bi-flag"></i>
    </button>

    <div class="modal fade" id="bdbSigModal" tabindex="-1"
      aria-labelledby="bdbSigModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title" id="bdbSigModalLabel">
              <i class="bi bi-flag me-2 text-warning"></i>Signaler un problème
            </h5>
            <button type="button" class="btn-close"
              data-bs-dismiss="modal" aria-label="Fermer"></button>
          </div>

          <div class="modal-body">

            <div aria-hidden="true"
              style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
              <input type="text" id="bdbSigHoneypot" tabindex="-1" autocomplete="off">
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Type de signalement</label>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn" data-type="typo">
                  <i class="bi bi-type me-1"></i>Faute / typo
                </button>
                <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn" data-type="contenu">
                  <i class="bi bi-exclamation-circle me-1"></i>Contenu douteux
                </button>
                <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn" data-type="bug">
                  <i class="bi bi-bug me-1"></i>Bug
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small" for="bdbSigDesc">
                Description <span class="text-danger">*</span>
              </label>
              <textarea class="form-control" id="bdbSigDesc" rows="3"
                placeholder="Décris ce que tu as vu, où exactement, ce qui devrait être correct…">
              </textarea>
              <div id="bdbSigDescCount" class="form-text"></div>
            </div>

            <div class="bdb-sig-context">
              <i class="bi bi-geo-alt me-1"></i><span id="bdbSigCtx"></span>
            </div>
          </div>

          <div class="modal-footer justify-content-between align-items-center">
            <span id="bdbSigFeedback" class="small"></span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-secondary"
                data-bs-dismiss="modal">Annuler</button>
              <button type="button" class="btn btn-sm btn-primary"
                id="bdbSigSubmit" disabled>
                <i class="bi bi-send me-1"></i>Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`);

  const _fab      = document.getElementById('bdbSigFab');
  const _modalEl  = document.getElementById('bdbSigModal');
  const _modal    = new bootstrap.Modal(_modalEl);
  const _typeBtns = document.querySelectorAll('.bdb-sig-type-btn');
  const _desc     = document.getElementById('bdbSigDesc');
  const _count    = document.getElementById('bdbSigDescCount');
  const _submit   = document.getElementById('bdbSigSubmit');
  const _feedback = document.getElementById('bdbSigFeedback');
  const _ctx      = document.getElementById('bdbSigCtx');
  const _honeypot = document.getElementById('bdbSigHoneypot');

  let _type        = null;
  let _submitReady = false;

  function _getModuleCible() {
    const m = window.location.pathname.match(/modules\/([^/]+)\//);
    return m ? m[1] : 'app';
  }

  function _updateSubmit() {
    _submit.disabled = !(_submitReady && _type && _desc.value.trim().length >= 5);
  }

  _fab.addEventListener('click', () => {
    _type        = null;
    _submitReady = false;
    _submit.disabled      = true;
    _desc.value           = '';
    _count.textContent    = '';
    _feedback.textContent = '';
    _honeypot.value       = '';
    _typeBtns.forEach(b => b.classList.remove('active'));

    const shellEl  = document.getElementById('bdb-shell');
    const modTitle = shellEl?.dataset?.moduleTitle || document.title.split('—')[0].trim();
    _ctx.textContent = modTitle + ' — ' + (window.location.pathname.split('/').pop() || 'index.html');

    _modal.show();
    setTimeout(() => { _submitReady = true; _updateSubmit(); }, 3000);
  });

  _typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      _type = btn.dataset.type;
      _typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _updateSubmit();
    });
  });

  _desc.addEventListener('input', () => {
    const len = _desc.value.trim().length;
    _count.textContent = len + ' caractère' + (len > 1 ? 's' : '') + ' — minimum 5';
    _count.style.color = len >= 5 ? '#198754' : '#dc3545';
    _updateSubmit();
  });

  _submit.addEventListener('click', async () => {
    if (_honeypot.value) return;

    const descVal = _desc.value.trim();
    if (!descVal || descVal.length < 5 || !_type) return;

    _submit.disabled      = true;
    _feedback.textContent = '';

    try {
      const { error } = await window.bdb
        .from('signalements')
        .insert({
          type:         _type,
          module_cible: _getModuleCible(),
          entite_type:  'page',
          entite_id:    null,
          entite_label: document.title,
          description:  descVal,
          url_contexte: window.location.href,
          user_agent:   navigator.userAgent.substring(0, 200),
          honeypot:     null,
          reporter_id:  window.bdbUser?.id ?? null
        })
        .select();

      if (error) throw error;

      _feedback.textContent = '\u2705 Signalement envoy\u00e9 \u2014 merci\u00a0!';
      _feedback.style.color = '#198754';
      setTimeout(() => _modal.hide(), 1800);

    } catch (err) {
      _feedback.textContent = "Le signalement n'a pu aboutir \u2014 r\u00e9essaie dans un instant.";
      _feedback.style.color = '#dc3545';
      _submit.disabled = false;
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// BUILDERS HTML — DBM THEME (data-shell-theme="dbm")
// ═══════════════════════════════════════════════════════════════════════════

async function _buildAsideDbm(isAdmin = false) {

  const _currentPath = window.location.pathname.replace(/\\/g, '/');

  let groups  = [];
  let modules = [];
  let fetchOk = false;

  try {
    const [gRes, mRes] = await Promise.all([
      window.bdb
        .from('app_groups')
        .select('key, label, icon, color, position')
        .eq('is_visible', true)
        .order('position'),
      window.bdb
        .from('app_modules')
        .select('key, label, icon, group_key, path, position, status, is_new, new_until, visibility, show_in_footer')
        .eq('status', 'active')
        .order('position')
    ]);

    if (!gRes.error && !mRes.error) {
      groups  = gRes.data || [];
      modules = mRes.data || [];
      fetchOk = true;
    }
  } catch (e) {}

  if (!fetchOk) {
    _bdbFooterModules = [];
    return _buildAsideStaticDbm();
  }

  _bdbFooterModules = modules.filter(m => m.show_in_footer === true);

  const visibleModules = modules.filter(m => {
    if (m.visibility === 'admin')  return isAdmin;
    if (m.visibility === 'member') return true;
    return true;
  });

  const byGroup = {};
  visibleModules.forEach(m => {
    if (!byGroup[m.group_key]) byGroup[m.group_key] = [];
    byGroup[m.group_key].push(m);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let navItems = '';

  // Accueil
  const activeHome = _currentPath.endsWith('/index.html') && !_currentPath.includes('/modules/');
  navItems += `
    <a href="${_bdbEsc(_rootPath)}index.html"
       class="app-sidebar-link${activeHome ? ' active' : ''}"
       aria-current="${activeHome ? 'page' : 'false'}">
      <i class="bi bi-house"></i> Accueil
    </a>`;

  groups.forEach(g => {
    const mods = byGroup[g.key] || [];
    if (!mods.length) return;

    const safeGroupLabel = _bdbEsc(g.label);

    navItems += `
    <div class="app-sidebar-section" style="margin-top:.75rem">${safeGroupLabel}</div>`;

    mods.forEach(m => {
      const safeIcon  = /^bi-[a-z0-9-]+$/.test(m.icon) ? m.icon : 'bi-grid';
      const safeLabel = _bdbEsc(m.label);
      const href      = _rootPath + m.path;
      const isActive  = _currentPath.endsWith('/' + m.path) ||
                        _currentPath.endsWith('/' + m.path.replace('index.html', ''));

      const showNew = m.is_new && (!m.new_until || new Date(m.new_until) >= today);
      const badgeNew = showNew
        ? ` <span class="badge rounded-pill text-bg-info" style="font-size:.65rem;padding:.15em .5em">Nouveau</span>`
        : '';

      navItems += `
    <a href="${_bdbEsc(href)}"
       class="app-sidebar-link${isActive ? ' active' : ''}"
       aria-current="${isActive ? 'page' : 'false'}">
      <i class="bi ${safeIcon}"></i> ${safeLabel}${badgeNew}
    </a>`;
    });
  });

  return `
<nav class="app-sidebar collapsed" id="sidebar" aria-label="Navigation principale">
  <div class="app-sidebar-brand">
    <i class="bi bi-heart-pulse" style="font-size:1.2rem"></i>
    <span class="app-nom">Des Blocs &amp; Moi</span>
  </div>
  <div class="app-sidebar-nav">
    ${navItems}
  </div>
  <div class="app-sidebar-footer">
    <span class="app-nom-court">DBM</span> &middot; v2.6
  </div>
</nav>`;
}


function _buildAsideStaticDbm() {
  return `
<nav class="app-sidebar collapsed" id="sidebar" aria-label="Navigation principale">
  <div class="app-sidebar-brand">
    <i class="bi bi-heart-pulse" style="font-size:1.2rem"></i>
    <span class="app-nom">Des Blocs &amp; Moi</span>
  </div>
  <div class="app-sidebar-nav">
    <a href="${_bdbEsc(_rootPath)}index.html" class="app-sidebar-link"><i class="bi bi-house"></i> Accueil</a>
    <div class="app-sidebar-section">Consulter</div>
    <a href="${_bdbEsc(_rootPath)}modules/glossaire/index.html" class="app-sidebar-link"><i class="bi bi-book"></i> Glossaire</a>
    <a href="${_bdbEsc(_rootPath)}modules/thesaurus/index.html" class="app-sidebar-link"><i class="bi bi-list-check"></i> Protocoles</a>
    <a href="${_bdbEsc(_rootPath)}modules/fiches/index.html" class="app-sidebar-link"><i class="bi bi-file-earmark-medical"></i> Fiches</a>
    <a href="${_bdbEsc(_rootPath)}modules/anatomie/index.html" class="app-sidebar-link"><i class="bi bi-activity"></i> Anatomie</a>
    <a href="${_bdbEsc(_rootPath)}modules/arsenal/index.html" class="app-sidebar-link"><i class="bi bi-box-seam"></i> Arsenal</a>
    <div class="app-sidebar-section" style="margin-top:.75rem">Organiser</div>
    <a href="${_bdbEsc(_rootPath)}modules/planning/dashboard.html" class="app-sidebar-link"><i class="bi bi-calendar3"></i> Planning</a>
    <a href="${_bdbEsc(_rootPath)}modules/transmissions/index.html" class="app-sidebar-link"><i class="bi bi-clipboard2-check"></i> Transmissions</a>
    <a href="${_bdbEsc(_rootPath)}modules/preferences/index.html" class="app-sidebar-link"><i class="bi bi-sliders2"></i> Préférences</a>
    <div class="app-sidebar-section" style="margin-top:.75rem">Progresser</div>
    <a href="${_bdbEsc(_rootPath)}modules/cours/index.html" class="app-sidebar-link"><i class="bi bi-mortarboard"></i> Cours</a>
    <a href="${_bdbEsc(_rootPath)}modules/carnet_bord/index.html" class="app-sidebar-link"><i class="bi bi-journal-bookmark"></i> Carnet de bord</a>
    <a href="${_bdbEsc(_rootPath)}modules/objectifs/index.html" class="app-sidebar-link"><i class="bi bi-bullseye"></i> Objectifs</a>
  </div>
  <div class="app-sidebar-footer">
    <span class="app-nom-court">DBM</span> &middot; v2.6
  </div>
</nav>`;
}


function _buildHeaderDbm(moduleTitle, moduleIcon) {
  const safeTitle = String(moduleTitle)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const safeIcon = /^bi-[a-z0-9-]+$/.test(moduleIcon) ? moduleIcon : 'bi-grid';

  return `
<header class="app-header" role="banner">

  <button class="app-header-toggle" id="sidebarToggle"
          aria-label="Ouvrir ou fermer le menu" aria-expanded="false">
    <i class="bi bi-list"></i>
  </button>

  <div class="d-flex align-items-center gap-2 ms-2">
    <i class="bi ${safeIcon} text-primary"></i>
    <span class="fw-semibold">${safeTitle}</span>
  </div>

  <div class="app-header-spacer"></div>

  <!-- Badges role -->
  <span id="bdbBadgeCreator" class="badge bdb-badge-creator d-none">Créateur</span>
  <span id="bdbBadgeAdmin"   class="badge bg-primary d-none">Admin</span>
  <span id="bdbBadgeDemo"    class="badge bdb-badge-demo d-none">Démo</span>

  <!-- Compte utilisateur (dropdown custom) -->
  <div class="position-relative ms-2">
    <button id="bdbAvatarBtn" type="button"
            class="app-avatar"
            aria-expanded="false" aria-haspopup="true" aria-label="Menu utilisateur">
      <span id="bdbAvatarInitials" class="small fw-bold">?</span>
    </button>

    <div id="bdbUserMenu" class="bdb-user-menu" role="menu" aria-labelledby="bdbAvatarBtn">

      <div class="bdb-user-menu-header">
        <div class="bdb-user-menu-name" id="bdbMenuName">…</div>
        <div class="bdb-user-menu-email" id="bdbMenuEmail"></div>
      </div>

      <a href="${_bdbEsc(_rootPath)}modules/profile/index.html"
         class="bdb-user-menu-item" role="menuitem">
        <i class="bi bi-person-circle"></i>
        <span class="fw-medium">Mon profil</span>
      </a>

      <div class="bdb-menu-sep"></div>

      <a href="${_bdbEsc(_rootPath)}createur/atelier/memo.html"
         class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
        <i class="bi bi-journal-bookmark-fill"></i>
        <span class="fw-medium">Mémo atelier</span>
      </a>

      <a href="${_bdbEsc(_rootPath)}createur/atelier/index.html"
         class="bdb-user-menu-item bdb-creator-only d-none" role="menuitem">
        <i class="bi bi-tools"></i>
        <span class="fw-medium">Portail Atelier</span>
      </a>
      <a href="${_bdbEsc(_rootPath)}createur/conseil/index.html"
         class="bdb-user-menu-item bdb-creator-only d-none" role="menuitem">
        <i class="bi bi-shield-check"></i>
        <span class="fw-medium">Espace Conseil</span>
      </a>

      <button id="bdbBtnPreviewMenu" type="button"
              class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
        <i class="bi bi-eye"></i>
        <span class="fw-medium">Prévisualisation</span>
        <i class="bi bi-chevron-right ms-auto bdb-submenu-chevron"></i>
      </button>
      <div id="bdbPreviewSubmenu" class="bdb-preview-submenu d-none">
        <button id="bdbBtnPreviewMember" type="button"
                class="bdb-user-menu-item bdb-preview-item" role="menuitem">
          <i class="bi bi-person-check text-primary"></i>
          <span>Vue membre approuvé</span>
        </button>
        <button id="bdbBtnPreviewAnon" type="button"
                class="bdb-user-menu-item bdb-preview-item" role="menuitem">
          <i class="bi bi-eye text-secondary"></i>
          <span>Vue visiteur anonyme</span>
        </button>
      </div>

      <div class="bdb-menu-sep"></div>

      <button id="bdbBtnLogout" type="button"
              class="bdb-user-menu-item danger" role="menuitem">
        <i class="bi bi-box-arrow-right"></i>
        <span class="fw-medium">Déconnexion</span>
      </button>

    </div>
  </div>

</header>`;
}


// ── SIDEBAR TOGGLE DBM (desktop collapse + mobile overlay) ──────────────
function _initSidebarToggleDbm() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle  = document.getElementById('sidebarToggle');
  if (!sidebar || !toggle) return;

  function _open() {
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('open');
    document.body.classList.remove('sidebar-closed');
    if (overlay && window.innerWidth < 992) overlay.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function _close() {
    sidebar.classList.add('collapsed');
    sidebar.classList.remove('open');
    document.body.classList.add('sidebar-closed');
    if (overlay) overlay.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function _closeMobile() {
    if (window.innerWidth < 992) _close();
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (sidebar.classList.contains('collapsed')) {
      _open();
    } else {
      _close();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', _close);
  }

  // Fermer au clic sur un lien (UX mobile)
  sidebar.querySelectorAll('a.app-sidebar-link').forEach(link => {
    link.addEventListener('click', _closeMobile);
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// BUILDERS HTML — SMARTY V5 (legacy, data-shell-theme absent)
// ═══════════════════════════════════════════════════════════════════════════

async function _buildAside(isAdmin = false) {

  const _currentPath = window.location.pathname.replace(/\\/g, '/');

  let groups  = [];
  let modules = [];
  let fetchOk = false;

  try {
    const [gRes, mRes] = await Promise.all([
      window.bdb
        .from('app_groups')
        .select('key, label, icon, color, position')
        .eq('is_visible', true)
        .order('position'),
      window.bdb
        .from('app_modules')
        .select('key, label, icon, group_key, path, position, status, is_new, new_until, visibility, show_in_footer')
        .eq('status', 'active')
        .order('position')
    ]);

    if (!gRes.error && !mRes.error) {
      groups  = gRes.data || [];
      modules = mRes.data || [];
      fetchOk = true;
    }
  } catch (e) {}

  if (!fetchOk) {
    _bdbFooterModules = [];
    return _buildAsideStatic();
  }

  _bdbFooterModules = modules.filter(m => m.show_in_footer === true);

  const visibleModules = modules.filter(m => {
    if (m.visibility === 'admin')  return isAdmin;
    if (m.visibility === 'member') return true;
    return true;
  });

  const byGroup = {};
  visibleModules.forEach(m => {
    if (!byGroup[m.group_key]) byGroup[m.group_key] = [];
    byGroup[m.group_key].push(m);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let navItems = '';

  groups.forEach((g, gIdx) => {
    const mods = byGroup[g.key] || [];
    if (!mods.length) return;

    if (gIdx > 0) navItems += `<li><hr class="my-1"/></li>`;

    const safeGroupLabel = _bdbEsc(g.label);
    const safeGroupIcon  = /^bi-[a-z0-9-]+$/.test(g.icon) ? g.icon : 'bi-grid';

    navItems += `
        <li class="nav-title">
          <i class="bi ${safeGroupIcon} me-1"></i>${safeGroupLabel}
        </li>`;

    mods.forEach(m => {
      const safeIcon  = /^bi-[a-z0-9-]+$/.test(m.icon) ? m.icon : 'bi-grid';
      const safeLabel = _bdbEsc(m.label);
      const href      = _rootPath + m.path;
      const isActive  = _currentPath.endsWith('/' + m.path) ||
                        _currentPath.endsWith('/' + m.path.replace('index.html', ''));

      const showNew = m.is_new && (!m.new_until || new Date(m.new_until) >= today);
      const badgeNew = showNew
        ? `<span class="badge rounded-pill text-bg-info ms-auto bdb-nav-badge-new">Nouveau</span>`
        : '';

      navItems += `
        <li class="nav-item${isActive ? ' active' : ''}">
          <a class="nav-link d-flex align-items-center" href="${_bdbEsc(href)}"
             aria-current="${isActive ? 'page' : 'false'}">
            <i class="bi ${safeIcon} me-2"></i><span>${safeLabel}</span>${badgeNew}
          </a>
        </li>`;
    });
  });

  const activeHome = _currentPath.endsWith('/index.html') && !_currentPath.includes('/modules/');

  return `
<aside id="aside-main" class="aside-start bg-white shadow-sm d-flex flex-column">

  <!-- sidebar : logo -->
  <div class="py-2 px-3 mb-3 mt-1">
    <a href="${_bdbEsc(_rootPath)}index.html" class="d-flex align-items-center gap-2 text-decoration-none">
      <i class="bi bi-hospital fs-4 text-primary"></i>
      <div>
        <div class="fw-bold text-dark lh-1">Bible de Bloc</div>
        <div class="small text-muted">Ortho-Neuro · CDS</div>
      </div>
    </a>
  </div>

  <!-- sidebar : navigation -->
  <div class="aside-wrapper scrollable-vertical scrollable-styled-light align-self-baseline h-100 w-100">
    <nav class="nav-deep nav-deep-sm nav-deep-light" aria-label="Navigation BDB">
      <ul class="nav flex-column">

        <li class="nav-item${activeHome ? ' active' : ''}">
          <a class="nav-link" href="${_bdbEsc(_rootPath)}index.html">
            <i class="bi bi-house me-2"></i><span>Accueil</span>
          </a>
        </li>

        ${navItems}

      </ul>
    </nav>
  </div>

</aside>`;
}


// ── FALLBACK STATIQUE (_buildAside si Supabase indisponible) ─────────────────
function _buildAsideStatic() {
  return `
<aside id="aside-main" class="aside-start bg-white shadow-sm d-flex flex-column">

  <div class="py-2 px-3 mb-3 mt-1">
    <a href="${_bdbEsc(_rootPath)}index.html" class="d-flex align-items-center gap-2 text-decoration-none">
      <i class="bi bi-hospital fs-4 text-primary"></i>
      <div>
        <div class="fw-bold text-dark lh-1">Bible de Bloc</div>
        <div class="small text-muted">Ortho-Neuro · CDS</div>
      </div>
    </a>
  </div>

  <div class="aside-wrapper scrollable-vertical scrollable-styled-light align-self-baseline h-100 w-100">
    <nav class="nav-deep nav-deep-sm nav-deep-light" aria-label="Navigation BDB">
      <ul class="nav flex-column">
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}index.html"><i class="bi bi-house me-2"></i><span>Accueil</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/planning/dashboard.html"><i class="bi bi-calendar2-week me-2"></i><span>Planning</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/annuaire/index.html"><i class="bi bi-people me-2"></i><span>Annuaire</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/transmissions/index.html"><i class="bi bi-arrow-left-right me-2"></i><span>Transmissions</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/arsenal/index.html"><i class="bi bi-box-seam me-2"></i><span>Arsenal</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/fiches/index.html"><i class="bi bi-file-earmark-medical me-2"></i><span>Fiches</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/cours/index.html"><i class="bi bi-mortarboard me-2"></i><span>Cours</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/anatomie/index.html"><i class="bi bi-activity me-2"></i><span>Anatomie</span></a></li>
        <li class="nav-item"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/installation/index.html"><i class="bi bi-hospital me-2"></i><span>Installation</span></a></li>
        <li class="nav-item bdb-nav-admin d-none"><hr class="my-1"/></li>
        <li class="nav-item bdb-nav-admin d-none"><a class="nav-link" href="${_bdbEsc(_rootPath)}modules/admin/index.html"><i class="bi bi-shield-check me-2"></i><span>Administration</span></a></li>
      </ul>
    </nav>
  </div>

</aside>`;
}


// ── BUILDER HEADER ────────────────────────────────────────────────────────
function _buildHeader(moduleTitle, moduleIcon) {
  const safeTitle = String(moduleTitle)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const safeIcon = /^bi-[a-z0-9-]+$/.test(moduleIcon) ? moduleIcon : 'bi-grid';

  return `
<header id="header" class="d-flex align-items-center shadow-xs sticky-top">
  <div class="container-fluid position-relative">
    <nav class="navbar navbar-expand navbar-light justify-content-between">

      <!-- GAUCHE : burger + titre module -->
      <div class="d-flex align-items-center gap-2">
        <a href="#aside-main"
           class="btn-sidebar-toggle d-lg-none d-flex align-items-center justify-content-center p-2"
           role="button" aria-label="Ouvrir le menu">
          <i class="bi bi-list fs-5"></i>
        </a>
        <div class="d-flex align-items-center gap-2">
          <i class="bi ${safeIcon} text-primary"></i>
          <span class="fw-semibold">${safeTitle}</span>
        </div>
      </div>

      <!-- DROITE : badges + compte -->
      <ul class="list-inline list-unstyled mb-0 d-flex align-items-center gap-1">

        <!-- Badges rôle -->
        <li class="list-inline-item d-flex align-items-center gap-1">
          <span id="bdbBadgeCreator" class="badge bdb-badge-creator d-none">Cr\u00e9ateur</span>
          <span id="bdbBadgeAdmin"   class="badge bg-primary d-none">Admin</span>
          <span id="bdbBadgeDemo"    class="badge bdb-badge-demo d-none">D\u00e9mo</span>
        </li>

        <!-- Compte utilisateur (dropdown custom — identique à index.html) -->
        <li class="list-inline-item mx-1 position-relative">

          <button id="bdbAvatarBtn" type="button"
                  class="btn btn-sm btn-icon btn-light rounded-circle shadow"
                  aria-expanded="false" aria-haspopup="true" aria-label="Menu utilisateur">
            <span id="bdbAvatarInitials" class="small fw-bold">?</span>
          </button>

          <div id="bdbUserMenu" class="bdb-user-menu" role="menu" aria-labelledby="bdbAvatarBtn">

            <!-- En-tête utilisateur -->
            <div class="bdb-user-menu-header">
              <div class="bdb-user-menu-name" id="bdbMenuName">\u2026</div>
              <div class="bdb-user-menu-email" id="bdbMenuEmail"></div>
            </div>

            <!-- Mon profil -->
            <a href="${_bdbEsc(_rootPath)}modules/profile/index.html"
               class="bdb-user-menu-item" role="menuitem">
              <i class="bi bi-person-circle"></i>
              <span class="fw-medium">Mon profil</span>
            </a>

            <div class="bdb-menu-sep"></div>

            <!-- Admin only -->
            <a href="${_bdbEsc(_rootPath)}createur/atelier/memo.html"
               class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
              <i class="bi bi-journal-bookmark-fill"></i>
              <span class="fw-medium">M\u00e9mo atelier</span>
            </a>

            <!-- Creator only -->
            <a href="${_bdbEsc(_rootPath)}createur/atelier/index.html"
               class="bdb-user-menu-item bdb-creator-only d-none" role="menuitem">
              <i class="bi bi-tools"></i>
              <span class="fw-medium">Portail Atelier</span>
            </a>
            <a href="${_bdbEsc(_rootPath)}createur/conseil/index.html"
               class="bdb-user-menu-item bdb-creator-only d-none" role="menuitem">
              <i class="bi bi-shield-check"></i>
              <span class="fw-medium">Espace Conseil</span>
            </a>

            <!-- Prévisualisation (admin uniquement, géré par _initPreviewMenu) -->
            <button id="bdbBtnPreviewMenu" type="button"
                    class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
              <i class="bi bi-eye"></i>
              <span class="fw-medium">Pr\u00e9visualisation</span>
              <i class="bi bi-chevron-right ms-auto bdb-submenu-chevron"></i>
            </button>
            <div id="bdbPreviewSubmenu" class="bdb-preview-submenu d-none">
              <button id="bdbBtnPreviewMember" type="button"
                      class="bdb-user-menu-item bdb-preview-item" role="menuitem">
                <i class="bi bi-person-check text-primary"></i>
                <span>Vue membre approuv\u00e9</span>
              </button>
              <button id="bdbBtnPreviewAnon" type="button"
                      class="bdb-user-menu-item bdb-preview-item" role="menuitem">
                <i class="bi bi-eye text-secondary"></i>
                <span>Vue visiteur anonyme</span>
              </button>
            </div>

            <div class="bdb-menu-sep"></div>

            <!-- Déconnexion -->
            <button id="bdbBtnLogout" type="button"
                    class="bdb-user-menu-item danger" role="menuitem">
              <i class="bi bi-box-arrow-right"></i>
              <span class="fw-medium">D\u00e9connexion</span>
            </button>

          </div>
        </li>
      </ul>

    </nav>
  </div>
</header>`;
}


// ── INJECTION LIENS FOOTER (modules show_in_footer=true) ───────────────────
function _injectFooterLinks(footerModules) {
  if (!footerModules || !footerModules.length) return;
  const footer = document.querySelector('footer');
  if (!footer) return;

  const links = footerModules
    .map(m => ` · <a href="${_bdbEsc(_rootPath + m.path)}" class="text-muted text-decoration-none">${_bdbEsc(m.label)}</a>`)
    .join('');

  footer.insertAdjacentHTML('beforeend', links);
}


// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES PRIVÉS
// ═══════════════════════════════════════════════════════════════════════════

const _BDB_AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#22c55e','#f97316','#ef4444',
  '#06b6d4','#ec4899','#84cc16','#f59e0b','#6366f1',
  '#10b981','#f43f5e','#0ea5e9','#a855f7','#14b8a6',
  '#d97706','#64748b','#dc2626','#2563eb','#059669',
  '#9333ea','#c026d3','#0891b2','#65a30d','#e11d48','#7c3aed'
];

function _bdbAvatarColor(prenom) {
  const idx = ((prenom || ' ').toUpperCase().charCodeAt(0) - 65 + 26) % 26;
  return _BDB_AVATAR_COLORS[idx];
}

function _bdbEsc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
