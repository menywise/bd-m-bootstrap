// ============================================================
// bdb-shell.js — Shell auth universel BDB
// Bible de Bloc
// VERSION : 1.5.0 — 2026-03-21
// ============================================================
// DELTA v1.4.0 → v1.5.0
//   - Auto-logout 30 min d'inactivité (R3-AUTH-03)
//     Toast d'avertissement à 25 min, signOut à 30 min.
//     Reset sur click/keydown/scroll/touchstart/mousemove/focus.
//     Contexte : postes partagés au bloc opératoire.
//   - Reste du fichier : inchangé
// ============================================================
// DELTA v1.3.1 → v1.4.0
//   - _buildOffcanvas() asynchrone : menu dynamique depuis
//     Supabase (tables app_groups + app_modules)
//   - Menu groupé par groupe, ordonné par position
//   - Visibilité admin filtrée (visibility='admin')
//   - Badge Nouveau (is_new + new_until)
//   - Badge Bientôt pour status='coming_soon'
//   - Lien actif détecté depuis window.location.pathname
//   - Fallback statique si Supabase indisponible
//   - Rôle chargé avant injection HTML (isAdmin disponible
//     au moment du build offcanvas)
//   - Reste du fichier : inchangé
// ============================================================

window.bdbShellReady = (async function () {
  'use strict';

  // ── 1. CHARGER bdb-preview.js (QA admin — toutes les pages) ──────────────
  await new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = '../../js/bdb-preview.js';
    s.onload  = resolve;
    s.onerror = resolve; // non bloquant si absent
    document.head.appendChild(s);
  });

  // ── 2. VÉRIFICATION SESSION ─────────────────────────────────────────────
  const _s = await window.bdbGetSession();
  if (!_s) {
    window.location.href = '../../login.html';
    return;
  }

  // ── 3. CHARGEMENT RÔLE (avant injection HTML — requis pour filtrer visibility) ──
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

  // ── 4. INJECTION HTML ───────────────────────────────────────────────────
  const shellEl = document.getElementById('bdb-shell');
  if (!shellEl) {
    console.warn('[bdb-shell] Élément #bdb-shell introuvable dans le DOM');
    return;
  }

  const moduleTitle = shellEl.dataset.moduleTitle ?? 'BDB';
  const moduleIcon  = shellEl.dataset.moduleIcon  ?? 'bi-grid';

  shellEl.innerHTML = await _buildOffcanvas(_earlyIsAdmin) + _buildHeader(moduleTitle, moduleIcon);

  // ── 5. MODE PREVIEW ACTIF ? ─────────────────────────────────────────────
  const _previewRole = window.bdbGetPreviewRole ? window.bdbGetPreviewRole() : null;

  // ── 6. CHARGEMENT PROFIL ────────────────────────────────────────────────
  // Source unique : profiles_directory
  // NE PAS utiliser profiles — cette table ne contient que id/email/created_at
  try {
    const { data: _p } = await window.bdb
      .from('profiles_directory')
      .select('prenom, nom, initials, avatar_url')
      .eq('user_id', _s.user.id)
      .maybeSingle();

    const ini = (_p?.initials
      || ((_p?.prenom?.[0] || '') + (_p?.nom?.[0] || ''))
      || _s.user.email.substring(0, 2)
    ).toUpperCase();

    const name = [_p?.prenom, _p?.nom].filter(Boolean).join(' ') || _s.user.email;

    const avatarBtn = document.getElementById('bdbAvatarBtn');
    const avatarIni = document.getElementById('bdbAvatarInitials');
    const ocIni     = document.getElementById('offcanvasAvatarInitials');

    if (_p?.avatar_url) {
      // Photo réelle — classe CSS dédiée, zéro style inline (INTERDIT-C2)
      avatarBtn.classList.add('bdb-avatar-btn--photo');
      avatarIni.innerHTML = `<img src="${_bdbEsc(_p.avatar_url)}" alt="${_bdbEsc(ini)}" class="bdb-avatar-img">`;
      ocIni.innerHTML     = `<img src="${_bdbEsc(_p.avatar_url)}" alt="${_bdbEsc(ini)}" class="bdb-avatar-img">`;
    } else {
      // Initiales + couleur déterministe par prénom
      avatarBtn.style.background = _bdbAvatarColor(_p?.prenom || '');
      avatarIni.textContent = ini;
      ocIni.textContent     = ini;
    }

    document.getElementById('offcanvasUserName').textContent = name;
    document.getElementById('bdbMenuName').textContent       = name;
    document.getElementById('bdbMenuEmail').textContent      = _s.user.email;

    window.bdbUser = {
      id         : _s.user.id,
      email      : _s.user.email,
      prenom     : _p?.prenom    ?? '',
      nom        : _p?.nom       ?? '',
      initials   : ini,
      avatar_url : _p?.avatar_url ?? null,
      role       : _earlyRole,
      isAdmin    : _earlyIsAdmin
    };

  } catch (_) {
    window.bdbUser = {
      id: _s.user.id, email: _s.user.email,
      prenom: '', nom: '',
      initials: _s.user.email.substring(0, 2).toUpperCase(),
      avatar_url: null, role: _earlyRole, isAdmin: _earlyIsAdmin
    };
  }

  // ── Mode preview : surcharger window.bdbUser avec données fictives ────────
  if (_previewRole) {
    const _pd = _previewRole === 'anonymous'
      ? window.BDB_PREVIEW_DATA.anonymousProfile
      : window.BDB_PREVIEW_DATA.memberProfile;
    window.bdbUser.role    = _pd.role    ?? null;
    window.bdbUser.isAdmin = false; // jamais admin en mode preview
  }

  // ── 7. APPLICATION UI DU RÔLE ──────────────────────────────────────────
  // Rôle déjà chargé en étape 3 — on applique uniquement les effets DOM
  if (_earlyIsAdmin && !_previewRole) {
    window.bdbUser.isAdmin = true;
    document.getElementById('bdbBadgeAdmin')?.classList.remove('d-none');
    document.querySelectorAll('.bdb-nav-admin').forEach(el => el.classList.remove('d-none'));
    document.querySelectorAll('.bdb-admin-only').forEach(el => el.classList.remove('d-none'));
    _initPreviewMenu();
  }

  // ── 8. LOGOUT ──────────────────────────────────────────────────────────
  document.getElementById('bdbBtnLogout').addEventListener('click', async () => {
    if (window.bdbGetPreviewRole && window.bdbGetPreviewRole()) {
      // Mode preview : quitter sans déconnecter
      window.bdbExitPreview
        ? window.bdbExitPreview()
        : (() => { sessionStorage.removeItem('bdb_preview_role'); window.location.href = '../../index.html'; })();
      return;
    }
    await window.bdb.auth.signOut();
    window.location.href = '../../login.html';
  });

  // ── 9. TOGGLE MENU AVATAR ──────────────────────────────────────────────
  const _btn  = document.getElementById('bdbAvatarBtn');
  const _menu = document.getElementById('bdbUserMenu');

  _btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = _menu.classList.toggle('open');
    _btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', () => {
    _menu.classList.remove('open');
    _btn.setAttribute('aria-expanded', 'false');
  });
  _menu.addEventListener('click', e => e.stopPropagation());

  // ── 10. BANNIÈRE PREVIEW ────────────────────────────────────────────────
  if (window.bdbInjectPreviewBanner) window.bdbInjectPreviewBanner();

  // ── 11. AUTO-LOGOUT INACTIVITÉ (R3-AUTH-03 · AUDIT_SECURITE S6) ───────
  // Postes partagés au bloc opératoire → déconnexion après 30 min sans activité.
  // Toast d'avertissement 5 min avant. Reset à chaque interaction utilisateur.
  (function _initIdleLogout() {
    const _IDLE_MS  = 30 * 60 * 1000;  // 30 minutes
    const _WARN_MS  =  5 * 60 * 1000;  // avertissement 5 min avant
    let _idleTimer  = null;
    let _warnTimer  = null;
    let _warnEl     = null;

    // ── Injection CSS minimale (une seule fois) ──────────────
    const _sty = document.createElement('style');
    _sty.textContent = `
      .bdb-idle-warn{position:fixed;top:0;left:0;right:0;z-index:9999;
        padding:.625rem 1rem;background:#dc3545;color:#fff;text-align:center;
        font-size:.875rem;font-weight:600;transform:translateY(-100%);
        transition:transform .3s ease}
      .bdb-idle-warn.show{transform:translateY(0)}`;
    document.head.appendChild(_sty);

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
      window.location.href = '../../login.html';
    }

    ['click','keydown','scroll','touchstart','mousemove'].forEach(function (evt) {
      document.addEventListener(evt, _resetIdle, { passive: true });
    });
    window.addEventListener('focus', _resetIdle);

    _resetIdle(); // démarrage initial
  })();

})();


// ── INIT SOUS-MENU PRÉVISUALISATION (admin uniquement) ─────────────────────
function _initPreviewMenu() {
  const btnMenu     = document.getElementById('bdbBtnPreviewMenu');
  const submenu     = document.getElementById('bdbPreviewSubmenu');
  const btnMember   = document.getElementById('bdbBtnPreviewMember');
  const btnAnon     = document.getElementById('bdbBtnPreviewAnon');

  if (!btnMenu || !submenu) return;

  btnMenu.classList.remove('d-none');

  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    submenu.classList.toggle('d-none');
  });

  btnMember?.addEventListener('click', () => {
    if (window.bdbSetPreviewRole) window.bdbSetPreviewRole('member');
  });
  btnAnon?.addEventListener('click', () => {
    if (window.bdbSetPreviewRole) window.bdbSetPreviewRole('anonymous');
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// BUILDERS HTML
// ═══════════════════════════════════════════════════════════════════════════

async function _buildOffcanvas(isAdmin = false) {

  // ── Détection du module actif (lien surligné) ──────────────────────────
  const _currentPath = window.location.pathname.replace(/\\/g, '/');

  // ── Fetch app_groups + app_modules ────────────────────────────────────
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
        .select('key, label, icon, group_key, path, position, status, is_new, new_until, visibility')
        .eq('status', 'active')        // coming_soon et maintenance exclus du menu
        .order('position')
    ]);

    if (!gRes.error && !mRes.error) {
      groups  = gRes.data || [];
      modules = mRes.data || [];
      fetchOk = true;
    } else {
      console.warn('[bdb-shell] Fetch app_groups/app_modules échoué — fallback statique');
    }
  } catch (e) {
    console.warn('[bdb-shell] Erreur réseau app_modules — fallback statique', e);
  }

  // ── Fallback statique (Supabase indisponible) ──────────────────────────
  if (!fetchOk) {
    return _buildOffcanvasStatic();
  }

  // ── Filtre visibilité ─────────────────────────────────────────────────
  const visibleModules = modules.filter(m => {
    if (m.visibility === 'admin')  return isAdmin;
    if (m.visibility === 'member') return true;
    return true; // 'all'
  });

  // ── Index modules par groupe ──────────────────────────────────────────
  const byGroup = {};
  visibleModules.forEach(m => {
    if (!byGroup[m.group_key]) byGroup[m.group_key] = [];
    byGroup[m.group_key].push(m);
  });

  // ── Construction du menu groupé ───────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let navItems = '';

  groups.forEach((g, gIdx) => {
    const mods = byGroup[g.key] || [];
    if (!mods.length) return; // groupe vide → masqué

    // Séparateur entre groupes (pas avant le premier)
    if (gIdx > 0) {
      navItems += `<li><hr class="bdb-nav-sep my-1"/></li>`;
    }

    // En-tête de groupe
    const safeGroupLabel = _bdbEsc(g.label);
    const safeGroupIcon  = /^bi-[a-z0-9-]+$/.test(g.icon) ? g.icon : 'bi-grid';
    navItems += `
        <li class="bdb-nav-group-header px-2 py-1">
          <span class="d-flex align-items-center gap-1 text-white-50" style="font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;font-weight:600;">
            <i class="bi ${safeGroupIcon}" style="font-size:.75rem;"></i>${safeGroupLabel}
          </span>
        </li>`;

    // Liens du groupe
    mods.forEach(m => {
      const safeIcon  = /^bi-[a-z0-9-]+$/.test(m.icon) ? m.icon : 'bi-grid';
      const safeLabel = _bdbEsc(m.label);
      const href      = '../../' + m.path;
      const isActive  = _currentPath.endsWith('/' + m.path) || _currentPath.endsWith('/' + m.path.replace('index.html', ''));

      // Badge Nouveau (is_new + new_until non expiré)
      const showNew = m.is_new && (!m.new_until || new Date(m.new_until) >= today);
      const badgeNew = showNew
        ? `<span class="bdb-nav-badge-new ms-auto">Nouveau</span>`
        : '';

      navItems += `
        <li>
          <a href="${href}"
             class="nav-link bdb-nav-link${isActive ? ' active' : ''}"
             aria-current="${isActive ? 'page' : 'false'}">
            <i class="bi ${safeIcon} me-2"></i>${safeLabel}${badgeNew}
          </a>
        </li>`;
    });
  });

  // ── Lien admin (toujours dernier, hors groupes) ───────────────────────
  // Le module admin est dans app_modules avec visibility='admin'
  // Il est déjà inclus dans les groupes ci-dessus si isAdmin=true.
  // La classe bdb-nav-admin est conservée pour la compatibilité bdb-shell step 7.
  // Pas de duplication : le filtre visibility='admin' s'en charge.

  return `
<div class="offcanvas offcanvas-start bdb-offcanvas" tabindex="-1" id="bdbMainMenu" aria-labelledby="bdbMenuLabel">
  <div class="offcanvas-header border-bottom border-secondary">
    <a href="../../index.html" class="d-flex align-items-center gap-2 text-decoration-none">
      <i class="bi bi-hospital fs-4 text-primary"></i>
      <div>
        <div class="fw-bold text-white lh-1">Bible de Bloc</div>
        <div class="bdb-offcanvas-sub">Ortho-Neuro · CDS</div>
      </div>
    </a>
    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="offcanvas" aria-label="Fermer"></button>
  </div>
  <div class="offcanvas-body d-flex flex-column p-0">
    <nav class="flex-grow-1 py-2 overflow-auto" aria-label="Navigation BDB">
      <ul class="nav flex-column px-2 gap-1">
        <li>
          <a href="../../index.html" class="nav-link bdb-nav-link${_currentPath.endsWith('/index.html') && !_currentPath.includes('/modules/') ? ' active' : ''}">
            <i class="bi bi-house me-2"></i>Accueil
          </a>
        </li>
        ${navItems}
      </ul>
    </nav>
    <div class="bdb-offcanvas-footer border-top border-secondary">
      <div class="d-flex align-items-center gap-2">
        <span class="bdb-sync-dot" role="status" aria-label="Statut connexion"></span>
        <small class="text-white-50">Système OK</small>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2">
        <div class="bdb-avatar-xs bdb-offcanvas-avatar" id="offcanvasAvatarInitials">?</div>
        <small class="text-white-50" id="offcanvasUserName">…</small>
      </div>
    </div>
  </div>
</div>`;
}


// ── FALLBACK STATIQUE (_buildOffcanvas si Supabase indisponible) ───────────
function _buildOffcanvasStatic() {
  console.warn('[bdb-shell] Mode dégradé — menu statique actif');
  return `
<div class="offcanvas offcanvas-start bdb-offcanvas" tabindex="-1" id="bdbMainMenu" aria-labelledby="bdbMenuLabel">
  <div class="offcanvas-header border-bottom border-secondary">
    <a href="../../index.html" class="d-flex align-items-center gap-2 text-decoration-none">
      <i class="bi bi-hospital fs-4 text-primary"></i>
      <div>
        <div class="fw-bold text-white lh-1">Bible de Bloc</div>
        <div class="bdb-offcanvas-sub">Ortho-Neuro · CDS</div>
      </div>
    </a>
    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="offcanvas" aria-label="Fermer"></button>
  </div>
  <div class="offcanvas-body d-flex flex-column p-0">
    <nav class="flex-grow-1 py-2" aria-label="Navigation BDB">
      <ul class="nav flex-column px-2 gap-1">
        <li><a href="../../index.html"                        class="nav-link bdb-nav-link"><i class="bi bi-house me-2"></i>Accueil</a></li>
        <li><a href="../../modules/planning/dashboard.html"   class="nav-link bdb-nav-link"><i class="bi bi-calendar2-week me-2"></i>Planning</a></li>
        <li><a href="../../modules/annuaire/index.html"       class="nav-link bdb-nav-link"><i class="bi bi-people me-2"></i>Annuaire</a></li>
        <li><a href="../../modules/transmissions/index.html"  class="nav-link bdb-nav-link"><i class="bi bi-arrow-left-right me-2"></i>Transmissions</a></li>
        <li><a href="../../modules/arsenal/index.html"        class="nav-link bdb-nav-link"><i class="bi bi-box-seam me-2"></i>Arsenal</a></li>
        <li><a href="../../modules/fiches/index.html"         class="nav-link bdb-nav-link"><i class="bi bi-file-earmark-medical me-2"></i>Fiches</a></li>
        <li><a href="../../modules/preferences/index.html"    class="nav-link bdb-nav-link"><i class="bi bi-person-gear me-2"></i>Préférences</a></li>
        <li><a href="../../modules/cours/index.html"          class="nav-link bdb-nav-link"><i class="bi bi-mortarboard me-2"></i>Cours</a></li>
        <li><a href="../../modules/anatomie/index.html"       class="nav-link bdb-nav-link"><i class="bi bi-activity me-2"></i>Anatomie</a></li>
        <li><a href="../../modules/installation/index.html"   class="nav-link bdb-nav-link"><i class="bi bi-hospital me-2"></i>Installation</a></li>
        <li class="bdb-nav-admin d-none"><hr class="border-secondary my-1"/></li>
        <li><a href="../../modules/admin/index.html" class="nav-link bdb-nav-link bdb-nav-admin d-none"><i class="bi bi-shield-check me-2"></i>Administration</a></li>
      </ul>
    </nav>
    <div class="bdb-offcanvas-footer border-top border-secondary">
      <div class="d-flex align-items-center gap-2">
        <span class="bdb-sync-dot bdb-sync-dot--warn" role="status" aria-label="Statut connexion"></span>
        <small class="text-white-50">Mode dégradé</small>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2">
        <div class="bdb-avatar-xs bdb-offcanvas-avatar" id="offcanvasAvatarInitials">?</div>
        <small class="text-white-50" id="offcanvasUserName">…</small>
      </div>
    </div>
  </div>
</div>`;
}

function _buildHeader(moduleTitle, moduleIcon) {
  const safeTitle = String(moduleTitle)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const safeIcon = /^bi-[a-z0-9-]+$/.test(moduleIcon) ? moduleIcon : 'bi-grid';

  return `
<header class="bdb-module-header sticky-top d-flex align-items-center justify-content-between px-3 px-md-4" id="bdbHeader">
  <div class="d-flex align-items-center gap-3">
    <button class="btn btn-sm bdb-menu-btn"
            data-bs-toggle="offcanvas"
            data-bs-target="#bdbMainMenu"
            aria-label="Ouvrir le menu"
            aria-controls="bdbMainMenu">
      <i class="bi bi-list fs-5"></i>
    </button>
    <div class="d-flex align-items-center gap-2">
      <i class="bi ${safeIcon} bdb-module-header-icon"></i>
      <h1 class="bdb-module-header-title mb-0">${safeTitle}</h1>
    </div>
  </div>
  <div class="d-flex align-items-center gap-2">
    <span id="bdbBadgeAdmin" class="badge bg-danger d-none">Admin</span>
    <div class="position-relative">
      <button class="bdb-avatar-btn" id="bdbAvatarBtn"
              aria-label="Menu utilisateur" aria-expanded="false" aria-haspopup="true">
        <span id="bdbAvatarInitials">?</span>
      </button>
      <div class="bdb-user-menu" id="bdbUserMenu" role="menu">
        <div class="bdb-user-menu-header">
          <div class="fw-semibold small" id="bdbMenuName">…</div>
          <div class="bdb-user-menu-email" id="bdbMenuEmail"></div>
        </div>
        <a href="../../modules/profile/index.html" class="bdb-user-menu-item" role="menuitem">
          <i class="bi bi-person-circle"></i>Mon profil
        </a>
        <a href="../../admin-memo.html" class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
          <i class="bi bi-journal-bookmark-fill"></i>Mémo admin
        </a>
        <button id="bdbBtnPreviewMenu" class="bdb-user-menu-item bdb-admin-only d-none" role="menuitem">
          <i class="bi bi-eye"></i>Prévisualisation
          <i class="bi bi-chevron-right ms-auto bdb-submenu-chevron"></i>
        </button>
        <div id="bdbPreviewSubmenu" class="bdb-preview-submenu d-none">
          <button id="bdbBtnPreviewMember" class="bdb-user-menu-item bdb-preview-item" role="menuitem">
            <i class="bi bi-person-check text-primary"></i>Vue membre approuvé
          </button>
          <button id="bdbBtnPreviewAnon" class="bdb-user-menu-item bdb-preview-item" role="menuitem">
            <i class="bi bi-eye text-secondary"></i>Vue visiteur anonyme
          </button>
        </div>
        <div class="bdb-menu-sep"></div>
        <button class="bdb-user-menu-item danger w-100" id="bdbBtnLogout" role="menuitem">
          <i class="bi bi-box-arrow-right"></i>Déconnexion
        </button>
      </div>
    </div>
  </div>
</header>`;
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
