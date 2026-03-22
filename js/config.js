// ============================================================
// js/config.js — Surcharge environnement local
// BDB Phase 0.2
// DATE : 2026-03-13
// ============================================================
// RÈGLE : Ce fichier n'est PAS versionné (.gitignore)
//         Il doit être chargé AVANT supabase-client.js dans chaque page HTML
//         En production (OVH), ce fichier est absent → supabase-client.js
//         utilisera ses propres valeurs cloud par défaut
// ============================================================

const BDB_ENV = {
  url:  'http://127.0.0.1:54321',
  anon: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
};
