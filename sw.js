/**
 * sw.js — Service Worker BDB
 * Version : 1.3.0
 * Cache : bdb-v2
 * Fallback offline : /bdb/offline.html
 *
 * v1.2.0 : addAll → Promise.allSettled. /bdb/ retiré du PRECACHE.
 * v1.3.0 : fetch handler restreint same-origin HTTP(S) uniquement.
 *           CDN + chrome-extension ignorés → zéro erreur CSP SW.
 *           CACHE_NAME bump bdb-v1 → bdb-v2 (force remplacement ancien SW).
 */

const CACHE_NAME = 'bdb-v2';
const OFFLINE_URL = '/bdb/offline.html';

const PRECACHE = [
  '/bdb/index.html',
  '/bdb/login.html',
  '/bdb/offline.html'
];

// Installation — précache résilient (échec individuel = non bloquant)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(PRECACHE.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

// Activation — nettoyage anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — same-origin HTTP(S) uniquement
// CDN (jsdelivr, supabase…) et chrome-extension ignorés → browser gère directement
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorer tout ce qui n'est pas HTTP(S) (chrome-extension://, etc.)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // Ignorer les ressources cross-origin (CDN, Supabase API…)
  if (url.origin !== self.location.origin) return;

  // Navigation → network first, fallback offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL).then(r => r || new Response('', {status: 503})))
    );
    return;
  }

  // Ressources same-origin → network first, mise en cache, fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(r => r || new Response('', {status: 503})))
  );
});
