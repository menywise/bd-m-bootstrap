# CTX_CARNET_BORD.md
```
VERSION   : 2.0.1
DATE      : 2026-03-21
MODULE    : carnet_bord
STATUT    : VALIDÉ — module Supabase fonctionnel, migration shell effectuée


  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
  BLOC 7 : SESSION_STATE.md ajouté comme fichier prioritaire d'ouverture.
  RÈGLE DE CLÔTURE : mise à jour TRACKER_* ajoutée comme étape obligatoire.
  Note : DATA_REF aligné sur convention canonique 02_SUPABASE_DATA_MODEL
         (corrigé audit N0 2026-05-01 — ancienne convention V12 résorbée).
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
  Carnet de bord d'évaluation pour les IDE en intégration au bloc opératoire.
  Suivi de progression par compétences et procédures métier,
  organisé en catégories (Ortho, Digestif, Astreintes…).
  3 phases de validation : Vu/Démo → Fait accompagné → Fait seul (Solo).
  Consultation pour membres connectés.
  Création/modification des catégories et items pour admins.

PORTEE      :
  Toutes spécialités chirurgicales configurées (catégories dynamiques).
  Données personnelles par IDE (progression individuelle).
  Hors périmètre : validation tuteur côté tuteur (V1 = auto-déclaré IDE seul),
  export PDF du carnet, lien bidirectionnel avec cours/ (lecture seule des ressources).

AUTORISE    :
  Modifier modules/carnet_bord/index.html
  Modifier css/carnet-bord-ui.css
  Modifier les requêtes Supabase du module
  Modifier la logique métier JS inline

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css (→ entree atelier_decisions si changement nécessaire)
  - Dupliquer le bloc auth (géré par bdb-shell.js)
  - Faire une requête profiles_directory ou user_roles pour construire l'avatar
    ou vérifier le rôle (window.bdbUser est la source unique — INTERDIT-B2)
  - Modifier les RLS sans entree atelier_decisions
  - Inventer une colonne absente de 02_SUPABASE_DATA_MODEL
  - Ajouter style= statique dans le HTML (INTERDIT-C2)
  - Ajouter onclick= dans le HTML
  - Appliquer un Optimistic Update sur DELETE ou INSERT multi-tables (INTERDIT-C5)
  - Injecter le bouton d'action primaire via innerHTML ou dans le header (INTERDIT-C4)

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    window.bdbShellReady → Promise résolue quand le shell est prêt
    cds-overrides.css  → v1.5.0 (classes cds-*, bdb-*)
  Spécifiques à ce module :
    Tables Supabase : carnet_categories · carnet_items · carnet_progressions
    Tables Supabase (lecture seule, admin) : profiles_directory (listing mentors)
    Modules BDB liés : cours/ (ressources liées aux items, lecture seule)
```

---

## BLOC 2 — TABLES SUPABASE

### carnet_categories

```
Colonnes clés : id (uuid PK) · label · icon · color · position (int) · is_active (bool)
                created_by (FK auth.users) · created_at · updated_at
État Supabase : À créer (D-2026-03-15-T12)
```

### carnet_items

```
Colonnes clés : id (uuid PK) · category_id (FK carnet_categories) · label
                sous_groupe (text nullable) · position (int) · required (bool) · is_active (bool)
                resources (jsonb) · mentor_ids (jsonb array uuid)
                created_by (FK auth.users) · created_at · updated_at
État Supabase : À créer (D-2026-03-15-T12)
```

### carnet_progressions

```
Colonnes clés : id (uuid PK) · user_id (FK auth.users) · item_id (FK carnet_items)
                date_demo (date nullable) · date_accompagne (date nullable) · date_solo (date nullable)
                niveau (text : debutant | intermediaire | expert | na | null)
                note (text nullable) · last_activity_at (timestamptz)
                created_at · updated_at
Contrainte    : UNIQUE(user_id, item_id) — une progression par IDE par item
État Supabase : À créer (D-2026-03-15-T12)
```

### RLS cibles

```
pol_carnet_categories_read      : SELECT pour auth (toutes catégories actives)
pol_carnet_categories_admin     : ALL pour admin (user_roles.role = 'admin')
pol_carnet_items_read           : SELECT pour auth (items actifs)
pol_carnet_items_admin          : ALL pour admin
pol_carnet_progressions_own     : SELECT/INSERT/UPDATE pour auth WHERE user_id = auth.uid()
pol_carnet_progressions_admin   : SELECT ALL pour admin (supervision)
```

### Règle E9 — anti-régression critique

```
⚠ approved → profiles_directory.approved  (JAMAIS user_roles)
⚠ role     → user_roles.role              (JAMAIS profiles_directory)
⚠ Le JS de ce module NE FAIT JAMAIS ces requêtes pour l'auth.
  window.bdbUser.isAdmin et window.bdbUser.role sont les sources uniques.
⚠ La requête profiles_directory dans loadMembers() est EXCLUSIVEMENT
  pour lister les mentors (admin only) — pas pour vérifier un rôle.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE | DELETE | Note |
|-----|--------|--------------|--------|------|
| **anon** (démo, non connecté) | ✗ | ✗ | ✗ | Module confidentiel — auth requise |
| **member** (connecté) | catégories + items actifs · ses propres progressions | ses propres progressions | ✗ | RLS user_id = auth.uid() |
| **admin** | tout (catégories/items/progressions de tous) | catégories · items | catégories · items | CRUD admin complet sur le référentiel |

**Côté UI** (bdb-shell.js fournit `window.bdbUser.isAdmin`) :
- Slot admin toolbar `#cbToolbarAdminSlot` → `class="d-none"` par défaut, retiré si `isAdmin`
- Boutons admin (catégorie + item) dans la toolbar, pas dans le header (INTERDIT-C4)
- Pas de mode démo anon — redirect login par bdb-shell.js

---

## BLOC 4 — CHECKLIST PREMIUM

Source : atelier_principes (Canon V1.0.5) — 5 critères obligatoires.

```
[✅] CDS conforme
      Zéro style= statique dans le HTML
      Zéro onclick= dans le HTML (addEventListener uniquement)
      CSS module scopé — toutes règles préfixées #cbMain, #cbTabList, .cb-* (INTERDIT-17 ✅)
      Chaîne de chargement BLOC E respectée (6 CSS + 4 JS dans l'ordre)
      Aucune règle dans cds-overrides.css ajoutée

[✅] Documenté
      Ce fichier CTX v2.0.1 dans 00_GOUVERNANCE/
      TRACKER_* mis à jour (2026-03-21)

[✅] Résilient
      loadingState (#cbLoading) / emptyState (#cbEmpty) / errorState (#cbError) implémentés
      cds-offline-banner (#cbOfflineBanner) affiché si Supabase hors service
      Jamais de page blanche

[✅] Navigable
      Lien retour portail dans l'offcanvas (fourni par bdb-shell.js v1.4.0)
      data-module-title="Carnet de Bord" et data-module-icon="bi-journal-medical" renseignés

[⚠ ] Responsive
      Testé desktop + mobile (CSS media query 575px présent)
      Touch : non vérifié en session
```

**État actuel** : `[4/5]` — responsive à valider terrain

**Violations actives** :
```
⚠ V1 — #cbLoading utilise spinner-border au lieu de .placeholder-glow skeleton (D-2026-03-16-T06)
        → Corriger lors de la prochaine session de refonte.
⚠ V2 — @latest CDN BDB (theme-base.css, theme-print.css) → tag fixe avant déploiement OVH (BLOC D.2)
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-CB-01 : Progression en 3 phases séquentielles
  Les 3 dates de progression sont indépendantes (pas de contrainte d'ordre imposée en V1).
  Valeurs : date_demo → date_accompagne → date_solo.
  L'ordre logique est D → A → S mais le code ne bloque pas un remplissage non séquentiel.
  Source  : conception initiale D-2026-03-15-T12
  Impact  : Si bloqué → frustration terrain (compétences validées hors ordre)

RÈGLE-CB-02 : Progression personnelle confidentielle
  Chaque IDE ne voit que ses propres progressions (RLS user_id = auth.uid()).
  L'admin voit toutes les progressions (supervision).
  Source  : conception initiale
  Impact  : Si exposé → violation confidentialité formation

RÈGLE-CB-03 : Optimistic Updates autorisés pour les phases D/A/S
  Le cochage d'une date de progression est un cas d'usage validé pour
  le pattern Optimistic Update (action binaire réversible — D-2026-03-16-T07).
  Ne pas appliquer sur les suppressions d'items ou de catégories (INTERDIT-C5).
  Source  : D-2026-03-16-T07 (CHANTIER C.8)
  Impact  : Si appliqué sur DELETE → perte de données irréversible

RÈGLE-CB-04 : Items requis (★)
  Un item marqué `required = true` est affiché avec une étoile rouge.
  Le dashboard affiche le nombre d'items requis non complétés.
  L'item est considéré complété quand `date_solo` est renseigné.
  Source  : terrain — prérequis avant prise d'astreinte
  Impact  : Si ignoré → IDE prend l'astreinte sans validation

RÈGLE-CB-05 : Catégories dynamiques
  Les spécialités (Ortho, Digestif, Astreintes…) ne sont pas hardcodées.
  L'admin crée/modifie les catégories depuis la modale dédiée.
  Chaque catégorie a une couleur et une icône Bootstrap Icons.
  Les style= sur les onglets sont dynamiques (couleur DB) → toléré INTERDIT-C3.
  Source  : migration depuis le HTML statique embryonnaire (3 sections hardcodées)
  Impact  : Si hardcodé → impossible d'ajouter de nouvelles spécialités

RÈGLE-CB-06 : Mentors et ressources
  Chaque item peut avoir des mentor_ids (jsonb array) et des resources (jsonb array).
  Les mentors sont listés depuis profiles_directory (admin only pour le CRUD).
  Les ressources peuvent pointer vers des entrées du module cours/ (type: 'cours').
  Source  : conception initiale
  Impact  : Lien cours/ = lecture seule, pas de FK SQL

RÈGLE-CB-07 : Embryon HTML obsolète
  Le fichier index-carnet-bord.html (535L, v1.0.0 du 2026-01-20) est l'embryon
  print-first statique REMPLACÉ par index.html Supabase.
  Il reste sur le disque comme archive terrain mais NE DOIT PAS être servi.
  Source  : CTX v1.0.1
  Impact  : Si servi → aucune persistance, aucune auth
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct |
|---|---|---|
| `#bdb-shell` frère de `<main>` dans `<body>` | Header injecté invisible — layout flex cassé | `#bdb-shell` premier enfant de `<main>` (INTERDIT-E1) |
| Utiliser `spinner-border` comme loading state | Vieux pattern UX, non conforme D-2026-03-16-T06 | `.placeholder-glow` skeleton (CHANTIER C.7) |
| Requête `profiles_directory` pour vérifier un rôle | Violation INTERDIT-B2 | `window.bdbUser.isAdmin` uniquement |
| Requête `profiles_directory` pour lister des mentors | AUTORISÉ (cas admin, pas une vérification de rôle) | Garder — mais protégé par `if (state.isAdmin)` |
| Appliquer Optimistic Update sur `deleteAdminItem()` | Perte irréversible (INTERDIT-C5) | Confirm + await côté serveur d'abord |
| Hardcoder les spécialités dans le HTML | Impossible d'ajouter une spécialité | Catégories dynamiques depuis `carnet_categories` |

---
