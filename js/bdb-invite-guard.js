/**
 * bdb-invite-guard.js
 * VERSION  : 1.0.0
 * DATE     : 2026-04-06
 * RÔLE     : Intercepte toutes les mutations Supabase (insert, update, delete, upsert, rpc)
 *            quand window.bdbUser.role === 'invite'.
 *            Affiche un toast bienveillant et retourne { data: null, error: null }.
 *            Zéro effet en base. Zéro exception côté module appelant.
 * POSITION : Chargé après supabase-client.js, avant bdb-shell.js
 * DÉPEND DE: window.bdb (supabase-client.js) · bdbToast (supabase-client.js)
 * RÈGLE    : Ne jamais modifier supabase-client.js / bdb-shell.js directement.
 */

(function () {
  'use strict';

  // --- Constantes -----------------------------------------------------------

  const INVITE_ROLE = 'invite';

  const TOAST_MSG =
    '<strong><i class="bi bi-shield-lock me-1"></i>Mode découverte</strong><br>' +
    'Les interactions sont réservées aux membres. ' +
    'Contactez l\'administrateur pour rejoindre l\'équipe.';

  // Résultat neutre retourné à la place de la vraie requête
  const NOOP_RESULT = { data: null, error: null };

  // --- Helpers --------------------------------------------------------------

  function isInvite() {
    return (
      window.bdbUser &&
      window.bdbUser.role === INVITE_ROLE
    );
  }

  function showInviteToast() {
    if (typeof bdbToast === 'function') {
      bdbToast(TOAST_MSG, 'warning');
    }
  }

  // Retourne un objet "QueryBuilder fantôme" qui résout immédiatement en NOOP.
  // Couvre les chaînes : .insert(...).select() · .update(...).eq(...) etc.
  function noopBuilder() {
    const handler = {
      get(target, prop) {
        // Propriétés thenable → résout la Promise
        if (prop === 'then') {
          return (resolve) => resolve(NOOP_RESULT);
        }
        // select / eq / neq / match / order / limit / single / maybeSingle…
        // → retourne le même proxy pour autoriser le chaînage
        return () => proxy;
      }
    };
    const proxy = new Proxy({}, handler);
    return proxy;
  }

  // Wrapping d'une méthode Supabase ré-entrant via from()
  function wrapQueryBuilder(builder, methodName) {
    const original = builder[methodName].bind(builder);
    builder[methodName] = function (...args) {
      if (isInvite()) {
        showInviteToast();
        return noopBuilder();
      }
      return original(...args);
    };
    return builder;
  }

  // --- Installation du guard ------------------------------------------------

  function installGuard() {
    if (!window.bdb) {
      console.error('[bdb-invite-guard] window.bdb absent — guard non installé.');
      return;
    }

    // 1. Wrapper window.bdb.from() pour intercepter insert/update/delete/upsert
    const originalFrom = window.bdb.from.bind(window.bdb);

    window.bdb.from = function (tableName) {
      const builder = originalFrom(tableName);

      if (isInvite()) {
        ['insert', 'update', 'delete', 'upsert'].forEach((method) => {
          wrapQueryBuilder(builder, method);
        });
      }

      return builder;
    };

    // 2. Wrapper window.bdb.rpc() — certains modules écrivent via RPC
    const originalRpc = window.bdb.rpc.bind(window.bdb);

    window.bdb.rpc = function (fn, params, options) {
      if (isInvite()) {
        showInviteToast();
        return noopBuilder();
      }
      return originalRpc(fn, params, options);
    };

    // 3. Wrapper window.bdb.storage (upload images) — silencieux pour l'invite
    if (window.bdb.storage) {
      const originalStorage = window.bdb.storage;
      const originalFrom2 = originalStorage.from.bind(originalStorage);

      originalStorage.from = function (bucketName) {
        const bucket = originalFrom2(bucketName);

        if (isInvite()) {
          ['upload', 'remove', 'move', 'copy', 'createSignedUrl'].forEach((method) => {
            if (typeof bucket[method] === 'function') {
              bucket[method] = function () {
                showInviteToast();
                return Promise.resolve(NOOP_RESULT);
              };
            }
          });
        }

        return bucket;
      };
    }
  }

  // --- Point d'entrée -------------------------------------------------------
  // supabase-client.js est synchrone → window.bdb est disponible immédiatement.
  // bdb-shell.js est chargé après → window.bdbUser n'est pas encore disponible.
  // Le check isInvite() est donc évalué à l'exécution de chaque appel, pas à l'init.

  installGuard();

})();
