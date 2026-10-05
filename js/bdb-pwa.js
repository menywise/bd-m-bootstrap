/**
 * bdb-pwa.js — Injection conditionnelle PWA (manifest + favicon + SW)
 * Dépend de : rien
 * Chargé en premier dans <head> de chaque page HTML.
 *
 * Comportement :
 *   - file:// (local)  → aucune injection → zéro erreur console
 *   - http(s):// (OVH) → injection favicon + manifest + enregistrement SW
 *
 * INTERDIT : ne jamais ajouter de logique métier ici.
 * INTERDIT : ne jamais hardcoder de valeur de couleur (INTERDIT-C2).
 */
(function () {
    'use strict';
    if (location.protocol === 'file:') return;

    var head = document.head;

    /* favicon */
    var fav = document.createElement('link');
    fav.rel  = 'icon';
    fav.type = 'image/x-icon';
    fav.href = '/bdb/favicon.ico';
    head.appendChild(fav);

    /* manifest PWA */
    var mf = document.createElement('link');
    mf.rel  = 'manifest';
    mf.href = '/bdb/manifest.json';
    head.appendChild(mf);

    /* theme-color : NON injecte — valeur couleur = INTERDIT-C2.
       Pas d erreur console associee. Gerer via manifest.json (theme_color). */

    /* Service Worker — enregistrement conditionnel */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/bdb/sw.js')
                .catch(function () { /* silencieux — SW non critique */ });
        });
    }
}());
