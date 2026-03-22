// ============================================================
// bdb-preview.js — Prévisualisation des rôles BDB
// Bible de Bloc
// VERSION : 1.0.0 — 2026-03-09
// ============================================================
// RÔLE : Permet à un admin de simuler l'expérience d'un
//        "membre approuvé" ou d'un "visiteur anonyme" sans
//        créer de compte ni apparaître dans profiles_directory.
//
// STOCKAGE : sessionStorage uniquement (disparaît à la fermeture
//            de l'onglet). Aucune persistance entre sessions.
//
// CLEF     : 'bdb_preview_role'
// VALEURS  : 'member' | 'anonymous' | null (absent = mode réel)
//
// USAGE DANS LES MODULES :
//   const previewRole = window.bdbGetPreviewRole();
//   if (previewRole === 'anonymous') { /* masquer sections auth */ }
//   if (previewRole === 'member')    { /* masquer sections admin */ }
//   if (!previewRole)                { /* mode réel — comportement normal */ }
//
// INTÉGRATION PORTAIL :
//   bdbRequireAuth() dans supabase-client.js reconnaît preview_role
//   et retourne un objet session fictif selon le rôle simulé.
// ============================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'bdb_preview_role';

  // ── API publique ─────────────────────────────────────────────

  /**
   * Retourne le rôle de prévisualisation actif ou null.
   * @returns {'member'|'anonymous'|null}
   */
  window.bdbGetPreviewRole = function () {
    return sessionStorage.getItem(STORAGE_KEY) || null;
  };

  /**
   * Active un rôle de prévisualisation et recharge la page.
   * @param {'member'|'anonymous'} role
   */
  window.bdbSetPreviewRole = function (role) {
    if (!['member', 'anonymous'].includes(role)) {
      console.warn('[BDB Preview] Rôle inconnu :', role);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, role);
    // Retour au portail pour appliquer le rôle depuis le début
    window.location.href = 'index.html';
  };

  /**
   * Désactive la prévisualisation et retourne au mode admin réel.
   */
  window.bdbExitPreview = function () {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = 'index.html';
  };

  // ── Données fictives pour le mode anonymous / member ─────────

  window.BDB_PREVIEW_DATA = {

    // Profil fictif utilisé en mode member
    memberProfile: {
      id:       'preview-member-001',
      email:    'marie.leblanc@bdb.local',
      nom:      'LEBLANC',
      prenom:   'Marie',
      initials: 'ML',
      fonction: 'infirmier',
      approved: true,
      role:     'member',
    },

    // Profil fictif utilisé en mode anonymous
    anonymousProfile: {
      id:       'preview-anon-001',
      email:    null,
      nom:      'Visiteur',
      prenom:   '',
      initials: '?',
      fonction: null,
      approved: false,
      role:     null,
    },

    // Stats fictives affichées en mode anonymous (données Lovable démo)
    demoStats: {
      transOpen:  3,
      transPrio:  1,
      members:   28,
      materiel:  247,
      fiches:    12,
      prefs:      9,
      cours:      5,
      install:    6,
      anatomie:   4,
    },
  };

  // ── Bannière de prévisualisation ─────────────────────────────
  // Injectée automatiquement si un preview_role est actif.

  window.bdbInjectPreviewBanner = function () {
    const role = window.bdbGetPreviewRole();
    if (!role) return;

    const label = role === 'member'
      ? '<i class="bi bi-person-check me-1"></i>Prévisualisation — Vue <strong>Membre approuvé</strong>'
      : '<i class="bi bi-eye me-1"></i>Prévisualisation — Vue <strong>Visiteur anonyme</strong>';

    const bar = document.createElement('div');
    bar.id = 'bdbPreviewBar';
    bar.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
      'background:' + (role === 'member' ? '#0d6efd' : '#6c757d'),
      'color:#fff', 'font-size:.82rem', 'padding:.45rem 1rem',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'gap:.5rem', 'box-shadow:0 -2px 8px rgba(0,0,0,.15)',
    ].join(';');

    bar.innerHTML = `
      <span>${label}</span>
      <button
        id="btnExitPreview"
        style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);
               color:#fff;border-radius:.375rem;padding:.2rem .7rem;font-size:.8rem;cursor:pointer;"
      >
        <i class="bi bi-x-lg me-1"></i>Quitter la prévisualisation
      </button>
    `;

    document.body.appendChild(bar);

    document.getElementById('btnExitPreview').addEventListener('click', () => {
      window.bdbExitPreview();
    });
  };

})();
