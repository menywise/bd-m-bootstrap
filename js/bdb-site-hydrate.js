/**
 * bdb-site-hydrate.js — Hydratation site public (sans bdb-shell)
 * Version : 1.0.0
 * Date    : 2026-04-25
 *
 * Charge les informations de l'instance BDB depuis app_instance
 * et hydrate les elements .app-nom dans la page.
 *
 * Usage dans site/*.html :
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *   <script src="../js/supabase-client.js"></script>
 *   <script src="../js/bdb-site-hydrate.js"></script>
 *
 * Prerequis : supabase-client.js charge AVANT (expose window.bdb).
 * Fallback  : si fetch echoue, hydrate avec "Bible de Bloc".
 * Poids     : 0 impact visuel, 1 requete Supabase (cachee sessionStorage 5 min).
 */

(function () {
  'use strict';

  var CACHE_KEY = 'bdb_site_instance';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function hydrate(nom) {
    var spans = document.querySelectorAll('.app-nom');
    for (var i = 0; i < spans.length; i++) {
      spans[i].textContent = nom;
    }
  }

  function fromCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (Date.now() - cached.ts > CACHE_TTL) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cached.nom;
    } catch (_) { return null; }
  }

  function toCache(nom) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ nom: nom, ts: Date.now() }));
    } catch (_) {}
  }

  async function init() {
    // 1. Cache sessionStorage
    var cached = fromCache();
    if (cached) { hydrate(cached); return; }

    // 2. Fetch depuis Supabase
    if (!window.bdb) {
      hydrate('Bible de Bloc');
      return;
    }

    try {
      var result = await window.bdb
        .from('app_instance')
        .select('nom')
        .limit(1)
        .maybeSingle();

      var nom = (result.data && result.data.nom) ? result.data.nom : 'Bible de Bloc';
      hydrate(nom);
      toCache(nom);
    } catch (_) {
      hydrate('Bible de Bloc');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
