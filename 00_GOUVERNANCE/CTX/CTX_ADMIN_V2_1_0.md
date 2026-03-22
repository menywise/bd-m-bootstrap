# CTX_ADMIN.md
```
VERSION   : 2.1.0
DATE      : 2026-03-21
MODULE    : admin
STATUT    : OPÉRATIONNEL — PREMIUM 5/5 soldé
NOYAU_REF : NOYAU_VERITE_V2_4_0
CHANTIER  : CHANTIER_TECHNIQUE_V1_0_5
DATA_REF  : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF : bdb-shell.js v1.4.0
CSS_REF   : cds-overrides.css v1.5.0

TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 2
TRACKER_VIOLATIONS : INTERDIT-B2,INTERDIT-C2,INTERDIT-C6
TRACKER_UPDATED    : 2026-03-21

DELTA v2.0.4 → v2.1.0 :
  Arbitrage A-ADMIN-SUPERV (D-2026-03-21-ADMIN-SUPERV) :
    app_modules + app_groups → supervision/ exclusivement.
    Onglet "Navigation" retiré du scope admin/.
    Q3 ARCHITECTURE_ADMIN_BDB soldée.
  PORTEE : app_modules/app_groups explicitement HORS SCOPE.
  INTERDIT : CRUD app_modules/app_groups ajouté.
  BLOC 7 : JOURNAL_REF corrigé V1_9_0 → V1_13_0.
  BLOC 9 : U-ADMIN-10 mis à jour (supervision/ ajouté, liste étendue).
  Note ARCHITECTURE_ADMIN_BDB : Q1 et Q2 toujours ouvertes.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Arbitrage A-ADMIN-SUPERV — app_modules/app_groups → supervision/.
                   Onglet "Navigation" retiré du scope admin/.
                   JOURNAL_REF corrigé V1_9_0 → V1_13_0.
RESTE À FAIRE    : U-ADMIN-04 · U-ADMIN-05 · U-ADMIN-06 (Niveau 2 UX)
                   U-ADMIN-08 · U-ADMIN-09 (backlog)
                   U-ADMIN-10 : modules restants à migrer shell (liste mise à jour)
                   Vérifier écart scan terrain INTERDIT-B2/C2/C6 (voir ci-dessous)
VIOLATIONS ACTIVES :
  ⚠ ÉCART TERRAIN/CTX : SESSION_STATE (scan 2026-03-21) signale
    INTERDIT-B2, INTERDIT-C2, INTERDIT-C6 sur admin.
    CTX BLOC 4 indique PREMIUM 5/5 soldé au 2026-03-15.
    Cause probable : scan disque basé sur code statique vs corrections
    appliquées en session. À vérifier en prochaine session technique
    avec relecture admin/index.html + admin-ui.css.
VIOLATIONS RÉSOLUES :
  - INTERDIT-C2  : style= statique corrigé — 2026-03-15
  - INTERDIT-B2  : window.bdbUser source unique — 2026-03-15
  - INTERDIT-C6  : escHtml() appliqué — 2026-03-15 (à confirmer scan)
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Tableau de bord d'administration de l'application BDB.
  Réservé exclusivement aux comptes admin.
  Gestion des utilisateurs (approbation, rôles, fonctions),
  des catégories, des tags et des classifications matériel.
  Guard admin actif à l'init : redirect portail si non-admin.

PORTEE      :
  — Dashboard     : compteurs globaux (users, en attente, transmissions, tags)
                    répartition par fonction, liste modules disponibles,
                    danger zone (purge membres non-admins)
  — Utilisateurs  : liste filtrée, approbation, changement rôle/fonction,
                    création compte, modification profil, purge
  — Catégories    : CRUD par module (content_types)
  — Tags          : CRUD, verrouillage, fusion, détection orphelins/doublons
  — Classifications : CRUD types matériel, zones anatomiques,
                      zones stockage, étagères
  HORS PORTEE (définitif) :
  - CRUD app_modules / app_groups → supervision/ exclusivement (D-2026-03-21-ADMIN-SUPERV)
  - Onglet "Navigation" → supprimé du scope (arbitrage soldé)
  - Migration Supabase (périmètre CHANTIER BLOC G)
  - Édition du mini-site (module accueil — brique suivante)

AUTORISE    :
  - Modifier index.html et admin-ui.css
  - Corriger ou étendre les requêtes Supabase existantes
  - Ajouter de nouvelles fonctions JS dans le DOMContentLoaded
  - Ajouter des modales ou sections HTML conformes CDS
  - Corriger des bugs documentés dans JOURNAL_DECISIONS

INTERDIT    :
  Interdits fixes (tous les modules) :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Dupliquer le bloc auth (bdb-shell.js gère tout)
  - Faire une requête profiles_directory ou user_roles dans ce module
    pour construire l'avatar ou vérifier le rôle
    → window.bdbUser est la source unique
  - Modifier les RLS sans entrée JOURNAL_DECISIONS
  - Inventer une colonne absente de SUPABASE_DATA_MODEL_V1_4_0
  - Ajouter style= statique dans le HTML
  - Ajouter onclick= dans le HTML
  Interdits spécifiques admin :
  - Lire approved depuis user_roles — colonne inexistante (bug E9 résolu)
  - Recréer une logique de rôle custom hors RLS
  - Accès direct localStorage
  - Modifier le schéma des tables sans migration SQL dans
    C:\DEV\cdt-mac97000\supabase\migrations\
  - CRUD app_modules ou app_groups — appartient à supervision/ exclusivement
    (D-2026-03-21-ADMIN-SUPERV) — ne jamais recréer cet onglet dans admin/

DEPENDANCES :
  Fixes :
    window.bdbUser     → bdb-shell.js v1.4.0 (id, email, prenom, nom,
                         initials, avatar_url, role, isAdmin)
    window.bdb         → supabase-client.js (client Supabase unique)
    cds-overrides.css  → v1.5.0
  Tables Supabase lues par ce module :
    profiles_directory (approved, fonction, prenom, nom, email, avatar_url)
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
  Tables HORS SCOPE (supervision/ uniquement) :
    app_modules · app_groups
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
                     etageres
Tables HORS SCOPE  : app_modules · app_groups (→ supervision/ exclusivement)
Pas de table propre à ce module — admin opère sur les tables transverses.
RLS standard BDB actives sur toutes les tables ci-dessus.
État Supabase : Aligné local/cloud — audit 2026-03-12 (63 OK / 0 FAIL).
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

Source : NOYAU_VERITE_V2_4_0 BLOC 9 — 5 critères.

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
      Ce fichier CTX v2.1.0 dans 00_GOUVERNANCE\
      TRACKER_* mis à jour (2026-03-21)

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

RÈGLE-ADMIN-06 : app_modules/app_groups hors scope définitif
  Toute session qui tente d'ajouter un onglet Navigation dans admin/
  viole l'arbitrage D-2026-03-21-ADMIN-SUPERV. Signaler et refuser.
  CRUD app_modules/app_groups = supervision/ exclusivement.
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
| CRUD app_modules/app_groups dans admin/ | Chevauchement supervision/ | supervision/ exclusivement (D-2026-03-21-ADMIN-SUPERV) |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : admin
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/admin/index.html · css/admin-ui.css
FICHIERS HORS SCOPE : bdb-shell.js · supabase-client.js · cds-overrides.css
                      Tous les autres modules

Fichiers à charger (dans l'ordre) :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX v2.1.0
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md       (si travail technique)
  [ ] SUPABASE_DATA_MODEL_V1_4_0.md      (si travail sur données ou schéma)

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS_V1_13_0.md
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md
  [ ] Ce fichier CTX v2.1.0

Si un champ est vide → ne pas commencer.
```

---

## RÈGLE DE CLÔTURE

En fin de chaque session sur ce module :

1. Mettre à jour BLOC 0 (état courant — fait / reste / violations)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour BLOC 4 (état premium — violations résolues)
4. Mettre à jour BLOC 5 si nouvelle règle métier identifiée
5. Mettre à jour BLOC 9 (marquer les items exécutés)
6. Inscrire dans JOURNAL_DECISIONS toute décision validée
7. Incrémenter la VERSION de ce fichier

**Ce qui n'est pas écrit dans un fichier est perdu.**
**La conversation n'est pas une source de vérité.**

---

## BLOC 8 — HISTORIQUE

| Date | Version | Action | Statut |
|------|---------|--------|--------|
| 2026-03-08 | 1.0.0 | Création initiale | VALIDÉ |
| 2026-03-14 | 1.1.0 | Bug RES-03 soldé. menuAvatar neutralisé. NOYAU_REF V2.0.0 | VALIDÉ |
| 2026-03-15 | 1.2.0 | NOYAU_REF V2.1.0. Anti-hallucination. Lien recettage | VALIDÉ |
| 2026-03-15 | 2.0.0 | Refonte template 8 blocs. Corrections CDS soldées. Premium 5/5. | VALIDÉ |
| 2026-03-15 | 2.0.1 | Anti-pattern #bdb-shell hors main ajouté BLOC 6. | VALIDÉ |
| 2026-03-15 | 2.0.2 | Vague 2 soldée : U-ADMIN-01/02/03/07. BLOC 4 résilience. | VALIDÉ |
| 2026-03-16 | 2.0.3 | NOYAU_REF V2_4_0. SHELL_REF v1.4.0. U-ADMIN-10 mis à jour. | VALIDÉ |
| 2026-03-21 | 2.0.4 | Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0. Écart scan documenté. | VALIDÉ |
| 2026-03-21 | 2.1.0 | Arbitrage A-ADMIN-SUPERV : app_modules/app_groups → supervision/. Onglet Navigation retiré du scope. RÈGLE-ADMIN-06 ajoutée. Anti-pattern CRUD ajouté BLOC 6. JOURNAL_REF V1_9_0 → V1_13_0. Tables HORS SCOPE documentées BLOC 1 et BLOC 2. | VALIDÉ |

---

## BLOC 9 — ROADMAP UPGRADE NIVEAU SUPÉRIEUR

### NIVEAU 1 — Solidité technique ✅ SOLDÉ (2026-03-15)

**U-ADMIN-01 · Gestion d'erreur Supabase complète** ✅
**U-ADMIN-02 · Squelette dashboard** ✅
**U-ADMIN-03 · Promise.all sur loadDashboard** ✅

---

### NIVEAU 2 — UX & fonctionnalité (session dédiée)

**U-ADMIN-04 · Pagination table utilisateurs**
**U-ADMIN-05 · Confirmation d'approbation avec détail utilisateur**
**U-ADMIN-06 · Export CSV utilisateurs**
**U-ADMIN-07 · Indicateur de rôle actif dans le dropdown user** ✅

---

### NIVEAU 3 — Fonctionnalités avancées (backlog)

**U-ADMIN-08 · Logs d'actions admin**
**U-ADMIN-09 · Recherche tags par contenu lié**

**U-ADMIN-10 · Propagation bdb-shell sur les modules restants**
```
État 2026-03-21 :
  ✅ annuaire      — migré (D-2026-03-16-T01)
  ✅ arsenal       — migré (D-2026-03-16-T02)
  ✅ anatomie      — migré
  ✅ supervision   — migré (création 2026-03-21)
  ⏳ fiches
  ⏳ transmissions
  ⏳ cours
  ⏳ installation
  ⏳ preferences
  ⏳ thesaurus
  ⏳ carnet_bord   (BRIQUE SUIVANTE — à créer avec shell d'emblée)

Référence : CHANTIER_TECHNIQUE_V1_0_5 BLOC G étape 3.
```

---

### ORDRE D'EXÉCUTION RECOMMANDÉ

```
Session courte (< 1h)  : U-ADMIN-04 → U-ADMIN-05 → U-ADMIN-06
Session dédiée         : U-ADMIN-10 → propager bdb-shell modules restants
Backlog                : U-ADMIN-08 → U-ADMIN-09
```
