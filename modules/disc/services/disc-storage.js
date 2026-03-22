// ── disc-storage.js — Persistence localStorage pour DISC ──────────────────
// Doit être chargé AVANT disc-persona-store.js
// Clef : 'bdb_disc_personas'
// Format : objet { code: persona }

window.DiscStorage = (function () {
    var KEY = 'bdb_disc_personas';

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('[DiscStorage] Erreur lecture:', e);
            return null;
        }
    }

    function save(store) {
        try {
            localStorage.setItem(KEY, JSON.stringify(store));
            return true;
        } catch (e) {
            console.warn('[DiscStorage] Erreur écriture:', e);
            return false;
        }
    }

    function clear() {
        try {
            localStorage.removeItem(KEY);
            return true;
        } catch (e) {
            return false;
        }
    }

    return Object.freeze({ load: load, save: save, clear: clear });
}());
