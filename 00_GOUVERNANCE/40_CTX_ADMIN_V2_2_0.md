# CTX_ADMIN.md
```
VERSION   : 2.2.0
DATE      : 2026-03-30
MODULE    : admin
STATUT    : OPÉRATIONNEL — PREMIUM 5/5 soldé


  Volets 1-3 (D-2026-03-30-T09/T10/T11/T12) :
    fonctions_metier : onglet dédié + select dynamique (T09).
    bdb-shell.js v1.6.0 : window.bdbUser.fonction (T10).
    Onglet "Modules" (6e) : CRUD app_modules + app_groups transféré
      depuis supervision/ (T11). Annule D-2026-03-21-ADMIN-SUPERV.
    chirurgien_id : select conditionnel modale édition profil (T12).
  RÈGLE-ADMIN-06 annulée : admin/ AUTORISÉ à écrire app_modules/app_groups.
  PORTEE : app_modules/app_groups retirés de HORS SCOPE.
  BLOC 2 : fonctions_metier + thesaurus_chirurgiens ajoutées ; HORS SCOPE supprimé.
  BLOC 5 : RÈGLE-ADMIN-07 (chirurgien selector) ajoutée.
  BLOC 6 : anti-pattern CRUD app_modules mis à jour.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Tableau de bord d'administration de l'application BDB.
  Réservé exclusivement aux comptes admin.
  Gestion des utilisateurs (approbation, rôles, fonctions),
  des catégories, des tags, des classifications matériel,
  et de la navigation (app_modules/app_groups).
  Guard admin actif à l'init : redirect portail si non-admin.

PORTEE      :
  — Dashboard     : compteurs globaux (users, en attente, transmissions, tags)
                    répartition par fonction, liste modules disponibles,
                    danger zone (purge membres non-admins)
  — Utilisateurs  : liste filtrée, approbation, changement rôle/fonction,
                    création compte, modification profil, purge
                    (chirurgien_id conditionnel si fonction=chirurgien)
  — Catégories    : CRUD par module (content_types)
  — Tags          : CRUD, verrouillage, fusion, détection orphelins/doublons
  — Classifications : CRUD types matériel, zones anatomiques,
                      zones stockage, étagères
  — Modules       : CRUD app_modules + app_groups (inline saves + modales)
                    (D-2026-03-30-T11 — transfère de supervision/)
  HORS PORTEE (définitif) :
  - Migration Supabase (périmètre CHANTIER BLOC G)
  - Édition du mini-site (module accueil — brique suivante)

AUTORISE    :
  - Modifier index.html et admin-ui.css
  - Corriger ou étendre les requêtes Supabase existantes
  - Ajouter de nouvelles fonctions JS dans le DOMContentLoaded
  - Ajouter des modales ou sections HTML conformes CDS
  - Corriger des bugs documentés dans atelier_decisions
  - CRUD app_modules et app_groups (D-2026-03-30-T11)

INTERDIT    :
  Interdits fixes (tous les modules) :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entree atelier_decisions
  - Dupliquer le bloc auth (bdb-shell.js gère tout)
  - Faire une requête profiles_directory ou user_roles dans ce module
    pour construire l'avatar ou vérifier le rôle
    → window.bdbUser est la source unique
  - Modifier les RLS sans entree atelier_decisions
  - Inventer une colonne absente de 02_SUPABASE_DATA_MODEL
  - Ajouter style= statique dans le HTML
  - Ajouter onclick= dans le HTML
  Interdits spécifiques admin :
  - Lire approved depuis user_roles — colonne inexistante (bug E9 résolu)
  - Recréer une logique de rôle custom hors RLS
  - Accès direct localStorage
  - Modifier le schéma des tables sans migration SQL dans
    C:\DEV\cdt-mac97000\supabase\migrations\

DEPENDANCES :
  Fixes :
    window.bdbUser     → bdb-shell.js v1.6.0 (id, email, prenom, nom,
                         initials, avatar_url, role, isAdmin, fonction)
    window.bdb         → supabase-client.js (client Supabase unique)
    cds-overrides.css  → v1.5.0
    bdb-fonctions.js   → getFonctions() · renderFonctionSelect()
  Tables Supabase lues/écrites par ce module :
    profiles_directory (approved, fonction, prenom, nom, email, avatar_url, chirurgien_id)
    user_roles         (role — source du rôle, jamais profiles_directory)
    content_types      (id, code, label)
    categories         (id, label, color, active, content_type_id)
    tags               (id, label_display, label_normalized, type, locked)
    tag_links          (id, tag_id, content_id, content_type — count)
    transmissions      (count uniquement)
    materiel_types     (CRUD classifications)
    zones_anatomiques  (CRUD classifications)
    zones_stockage     (CRUD classifications, FK zones_anatomiques)
    etageres           (CRUD classifications, FK zones_stockage)
    app_modules        (CRUD navigation — D-2026-03-30-T11)
    app_groups         (CRUD navigation — D-2026-03-30-T11)
    fonctions_metier   (lecture pour <select> dynamique — D-2026-03-30-T09)
    thesaurus_chirurgiens (lecture pour select chirurgien_id — D-2026-03-30-T12)
  Edge Functions appelées :
    admin-create-user  (création compte utilisateur)
  RPC appelé :
    merge_tag(source_id, target_id)
  Fichiers liés :
    admin-test.html    (recettage — 63 OK / 0 FAIL / 2 WARN ref. 2026-03-12)
    ../../index.html   (portail — lien retour offcanvas via bdb-shell)
```

---

## BLOC 2 — TABLES SUPABASE

```
Tables principales : profiles_directory · user_roles · content_types ·
                     categories · tags · tag_links · transmissions ·
                     materiel_types · zones_anatomiques · zones_stockage ·
                     etageres · app_modules · app_groups ·
                     fonctions_metier · thesaurus_chirurgiens
Pas de table propre à ce module — admin opère sur les tables transverses.
RLS standard BDB actives sur toutes les tables ci-dessus.
État Supabase : Aligné local/cloud — audit 2026-03-12 (63 OK / 0 FAIL).
               Migrations 071 (fonctions_metier) + 072 (chirurgien_id) : EN ATTENTE EXÉCUTION.
```

### Règle E9 — anti-régression critique

```
⚠ approved → profiles_directory.approved   (JAMAIS user_roles)
⚠ role     → user_roles.role               (JAMAIS profiles_directory)
⚠ Ce module lit approved ET role directement en DB (module admin = seul
  module autorisé à lire ces colonnes — les autres modules utilisent
  window.bdbUser exclusivement).
⚠ Ne JAMAIS inverser : user_roles.approved n'existe pas.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | Accès |
|-----|-------|
| **anon** (démo) | ✗ Redirect login (bdb-shell.js) |
| **member** | ✗ Redirect portail (guard admin ligne 677) |
| **admin** | ✓ Accès complet — toutes fonctions |

```javascript
// Guard admin — ne pas modifier (ligne 677 index.html)
await window.bdbShellReady;
if (!window.bdbUser.isAdmin) {
  location.href = '../../index.html';
  return;
}
```

Mode preview (bdb-preview.js) : simuler vue member → redirect portail.
Mode preview anon → redirect login.

---

## BLOC 4 — CHECKLIST PREMIUM

Source : atelier_principes (Canon V1.0.5) — 5 critères.

```
[✓] CDS conforme
      0 style= statique (corrigé 2026-03-15)
      0 onclick= inline (jamais présent)
      0 double class= HTML invalide (corrigé 2026-03-15)
      utils.js / storage.js supprimés (corrigé 2026-03-15)
      CSS admin-ui.css v1.1.0 : toutes règles scopées #adminApp ou #modal*
      Chaîne de chargement BLOC E respectée
      cds-overrides.css non modifié

[✓] Documenté
      Ce fichier CTX v2.2.0 dans 00_GOUVERNANCE\CTX\
      TRACKER_* mis à jour (2026-03-30)

[✓] Résilient
      cdsShowGridError() appelé sur toutes les fonctions de chargement
      cdsShowOfflineBanner() appelé sur loadDashboard en cas d'erreur
      skeletonRows() sur tous les tableaux
      Skeleton sur les 4 stat cards dashboard (U-ADMIN-02)
      Promise.all sur loadDashboard (U-ADMIN-03)

[✓] Navigable
      bdb-shell.js injecte l'offcanvas complet
      data-module-title="Administration" data-module-icon="bi-shield-check"
      Lien portail dans offcanvas via bdb-shell

[✓] Responsive
      table-responsive-wrap sur toutes les tables
      input-group empilé sous 576px (cds-overrides.css)
      Grille Bootstrap col-6 col-md-3 sur les stat cards
      Modales modal-dialog-centered
```

**État : 5/5 — PREMIUM VALIDÉ (2026-03-15)**
**⚠ Écart scan terrain à vérifier — voir BLOC 0**

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-ADMIN-01 : Guard admin obligatoire à l'init
  await window.bdbShellReady;
  if (!window.bdbUser.isAdmin) { location.href = '../../index.html'; return; }
  Ne jamais supprimer ou affaiblir ce guard.

RÈGLE-ADMIN-02 : approved lu depuis profiles_directory uniquement
  loadDashboard et loadUsers lisent approved sur profiles_directory.
  Ne jamais chercher approved dans user_roles (colonne inexistante).

RÈGLE-ADMIN-03 : Création utilisateur via Edge Function uniquement
  window.bdb.functions.invoke('admin-create-user', { body: {...} })
  Ne pas appeler auth.admin.createUser() depuis le frontend.

RÈGLE-ADMIN-04 : Fusion de tags via RPC uniquement
  window.bdb.rpc('merge_tag', { source_id, target_id })
  Ne pas recoder la logique de fusion en JS frontend.

RÈGLE-ADMIN-05 : Recettage obligatoire avant livraison
  admin-test.html — référence : 63 OK / 0 FAIL / 2 WARN (2026-03-12).
  Tout nouveau FAIL = bloquant. WARN à documenter.

~~RÈGLE-ADMIN-06~~ : ANNULÉE (D-2026-03-30-T11)
  app_modules/app_groups sont désormais dans le scope admin/.
  Onglet Modules (6e) : CRUD navigation autorisé.

RÈGLE-ADMIN-07 : chirurgien_id conditionnel dans modale édition profil
  Le select chirurgien_id n'est visible que si fonction = 'chirurgien'.
  FK nullable → thesaurus_chirurgiens. Pas de contrainte NOT NULL.
  Ne jamais afficher ce select pour les autres fonctions.
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct |
|---|---|---|
| Lire `approved` depuis `user_roles` | Bug E9 — colonne inexistante | `profiles_directory.approved` |
| Double `class=` sur un élément HTML | HTML invalide — 2e attribut ignoré | Un seul `class=`, classes fusionnées |
| `style=cursor:pointer` statique | INTERDIT-C2 | `classList.add('cds-clickable')` |
| Charger `utils.js` / `storage.js` CDS | Obsolètes post-D-2026-03-15-T01 | Ne pas charger |
| Recréer le bloc auth inline | bdb-shell.js gère tout | `await window.bdbShellReady` uniquement |
| Appeler `auth.admin.createUser()` frontend | Expose service_role key | Edge Function `admin-create-user` |
| `#bdb-shell` frère de `<main>` dans `<body>` | Header injecté invisible | `#bdb-shell` premier enfant de `<main>` |
| Requêtes Supabase séquentielles dans loadDashboard | ~400ms inutiles | `Promise.all([...])` |
| Fonction de chargement sans try/catch | Page silencieuse si timeout | try/catch + cdsShowGridError() |
| Hardcoder les options fonction dans un `<select>` | Désynchronisé avec fonctions_metier | `renderFonctionSelect()` depuis bdb-fonctions.js |
| Afficher chirurgien_id pour toutes les fonctions | Confusion UX | Conditionnel : fonction === 'chirurgien' uniquement |

---
