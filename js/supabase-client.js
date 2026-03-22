// ============================================================
// supabase-client.js — Point d'acces unique Supabase
// Bible de Bloc
// VERSION : 1.3.0 — 2026-03-13
// ============================================================
// REGLE : Ce fichier est charge en PREMIER sur toutes les pages.
//         Ne jamais dupliquer URL ou cle dans un autre fichier.
//
// DEPENDANCE OBLIGATOIRE dans chaque page HTML, dans cet ordre :
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
//   <script src="js/config.js"></script>        ← optionnel, dev local uniquement
//   <script src="js/supabase-client.js"></script>
//
// config.js absent (prod OVH) → credentials cloud utilisés par défaut
// config.js présent (dev local) → BDB_ENV écrase BDB_CONFIG
// ============================================================

const BDB_CONFIG = {
  url:  'https://ecpzrygzdugwwkqbsajn.supabase.co',
  anon: 'sb_publishable_jc9PQQF85LgiPwHxnevqTQ_q8nWd4es',
};

// Surcharge locale si config.js est présent
const _cfg = (typeof BDB_ENV !== 'undefined') ? BDB_ENV : BDB_CONFIG;

/**
 * INITIALISATION ET GESTION DU SDK
 */
if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  console.warn('[BDB] Supabase SDK non disponible — fonctions stub actives');
  // Stubs sécurisés pour éviter les crashs en mode offline
  window.bdb = {
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({data:null,error:{message:'SDK absent'}}), maybeSingle: async () => ({data:null,error:null}), order: () => ({ data: null }) }) }) }),
    auth: { getSession: async () => ({data:{session:null}}), signOut: async () => {}, onAuthStateChange: () => ({data:{subscription:{unsubscribe:()=>{}}}}) }
  };
} else {
  const { createClient } = window.supabase;
  window.bdb = createClient(_cfg.url, _cfg.anon);
}

/**
 * SERVICES D'AUTHENTIFICATION CENTRALISÉS
 */

window.bdbGetSession = async () => {
  // Le mode démo prime sur la session réelle
  if (sessionStorage.getItem('demo_mode') === 'true') {
    return { demo: true, user: { id: 'demo', email: 'demo@bdb.local' } };
  }
  
  if (!window.bdb.auth) return null;
  const { data: { session } } = await window.bdb.auth.getSession();
  return session;
};

window.bdbRequireAuth = async () => {
  const session = await window.bdbGetSession();
  if (!session) { 
    window.location.href = (window.location.pathname.includes('/modules/')) ? '../../login.html' : 'login.html';
    return null; 
  }
  return session;
};

/**
 * SERVICES UI PARTAGÉS
 */
window.bdbToast = (message) => {
  const el = document.getElementById('toastInfo');
  if (!el) {
    console.log('[BDB Toast Fallback]', message);
    return;
  }
  el.querySelector('.toast-body').textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(el);
  toast.show();
};
