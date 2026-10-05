# CTX_COURS.md
```
VERSION   : 2.1.0
DATE      : 2026-03-22
MODULE    : cours
STATUT    : OPÉRATIONNEL — shell migré, escHtml appliqué, C.9 conforme


  Shell confirmé migré (terrain vérifié — le fichier source a le shell).
  escHtml() ajoutée (12 points d'injection — INTERDIT-C6).
  C.9 : throw + catch centralisé sur référentiels init.
  Bug syncImages corrigé : position 1-based + delete-all/re-insert-all.
  TRACKER_* ajoutés. BLOC 0 ajouté. BLOC 4 mis à jour.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Référentiel de cours et formations du bloc opératoire.
  Contenus pédagogiques structurés par catégorie, tag, type, niveau.
  Consultation pour members connectés. CRUD complet pour admins.
  Éditeur de contenu riche (Quill.js) avec images uploadées (bucket Storage).
  Premier maillon du parcours de professionnalisation :
    cours → carnet_bord → objectifs

PORTEE      :
  Tous cours/formations toutes spécialités.
  Hors périmètre : liens actifs vers carnet_bord/objectifs
  (modules BRIQUE SUIVANTE — lecture seule des ressources depuis carnet_bord).

AUTORISE    :
  Modifier modules/cours/index.html
  Modifier css/cours-ui.css
  Modifier les requêtes Supabase du module
  Modifier la logique métier JS inline

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css (→ entree atelier_decisions si changement nécessaire)
  - Dupliquer le bloc auth (géré par bdb-shell.js — INTERDIT-B1)
  - Faire une requête profiles_directory ou user_roles pour vérifier le rôle
    (window.bdbUser est la source unique — INTERDIT-B2)
  - Créer un initAuth() local (INTERDIT-B3)
  - Modifier les RLS sans entree atelier_decisions
  - Inventer une colonne absente de 02_SUPABASE_DATA_MODEL
  - Ajouter style= statique dans le HTML ou les template literals JS (INTERDIT-C2)
  - Ajouter onclick= dans le HTML
  - Injecter le bouton d'action primaire via innerHTML dans le header (INTERDIT-C4)
  - Coder les liens carnet_bord/objectifs avant arbitrage A3
  - Utiliser le terme APP_CDT (terme banni — remplacer par BDB)

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    window.bdbShellReady → Promise résolue quand le shell est prêt
    cds-overrides.css  → v1.5.0
  Spécifiques à ce module :
    Tables Supabase : cours · categories · content_images · content_types ·
                      profiles_directory · tag_links · tags · user_roles
    CDN externe : Quill.js 1.3.7 (éditeur riche) — cdnjs.cloudflare.com
    Bucket Storage : content-images (sous-dossier cours/)
    Modules BDB liés : carnet_bord (consommateur futur) · objectifs (consommateur futur)
```

---

## BLOC 2 — TABLE SUPABASE

### cours (table principale)

```
Colonnes clés : id (uuid PK) · titre · description · contenu (html Quill)
                niveau (text : debutant | intermediaire | avance)
                category_id (FK categories) · status (draft | published)
                tags (jsonb — usage legacy, migration tag_links en cours)
                user_id (FK auth.users — auteur)
                created_at · updated_at
État Supabase : Créée — 3 lignes en base (non recetté)
```

### Tables transverses utilisées

```
categories      : filtrées par content_type_id WHERE code = 'cours'
content_types   : lookup code = 'cours' → id
content_images  : images uploadées (content_type_id + content_id)
tag_links       : liaison cours → tags (content_type = 'cours')
tags            : référentiel tags (type IN fonction, acronyme, libre)
profiles_directory : auteur du cours (lecture seule)
user_roles      : ✅ DETTE RÉSOLUE — initAuth() supprimé (migration shell)
                  Rôle lu via window.bdbUser.isAdmin
```

### RLS cibles

```
pol_cours_member_read  : SELECT published pour auth
pol_cours_admin_read   : SELECT all pour admin
pol_cours_admin_write  : ALL pour admin
```

### Règle E9 — anti-régression critique

```
⚠ approved → profiles_directory.approved  (JAMAIS user_roles)
⚠ role     → user_roles.role              (JAMAIS profiles_directory)
⚠ APRÈS migration shell :
  ✅ ÉTAT ACTUEL (DETTE RÉSOLUE — session 2026-03-22) :
  initAuth() supprimé. Module utilise window.bdbUser via bdb-shell.js.
  Aucune requête profiles_directory ou user_roles dans le module.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE/DELETE | Note |
|-----|--------|---------------------|------|
| **anon** (démo, non connecté) | ✗ | ✗ | Redirect login |
| **member** (connecté) | `published` uniquement | ✗ | Lecture seule |
| **admin** | tout (draft/published) | ✓ | CRUD complet + upload images |

**Côté UI** :
- Bouton "Nouveau cours" → slot toolbar filtres `#adminActions` (✅ INTERDIT-C4 résolu)
- Dropdown modifier/supprimer dans chaque card (admin only)
- Filtre statut "Brouillon" visible uniquement si admin

---

## BLOC 4 — CHECKLIST PREMIUM

Source : atelier_principes (Canon V1.0.5) — 5 critères obligatoires.

```
[✅] CDS conforme
      ✅ V1 — Shell migré bdb-shell.js (offcanvas/header/initAuth supprimés)
      ✅ V2 — Slot toolbar #adminActions (INTERDIT-C4 résolu)
      ✅ V3 — 13 style= → classes CDS (INTERDIT-C2 résolu)
      ✅ V4 — Chaîne JS BLOC E ordonnée (Bootstrap → Supabase → Quill → DOMPurify → client → shell)
      ✅ V5 — bdb-shell.js présent dans la chaîne JS
      ✅ Zéro onclick= dans le HTML
      ✅ CSS module scopé (.cours-* — INTERDIT-17 OK)
      ✅ escHtml() sur 12 points d'injection (INTERDIT-C6)
      ✅ APP_CDT → BDB (V7)

[✅] Documenté
      CTX_COURS v2.1.0 à jour
      TRACKER_* à jour (2026-03-22)

[✅] Résilient
      ✅ V6 — Skeletons (placeholder-glow) — spinners supprimés
      ✅ C.9 — 3 états (loading/empty/error) + throw/catch centralisé init
      ✅ cdsShowGridError() avec bouton Réessayer
      ✅ cdsShowOfflineBanner() dans le DOM
      ✅ DOMPurify.sanitize() sur contenu Quill
      ✅ Signed URLs 900s

[✅] Navigable
      ✅ Offcanvas dynamique via bdb-shell.js
      ✅ data-module-title="Cours" · data-module-icon="bi-mortarboard"

[⚠ ] Responsive
      ✅ Bootstrap grid responsive
      ⚠ Non vérifié terrain touch
```

**État actuel** : `[4/5]` — responsive terrain non vérifié

**Violations actives** :
```
MINEUR :
  V8 — @latest CDN BDB → tag fixe avant prod (BLOC D.2).
  Responsive terrain non vérifié.
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-COURS-01 : Niveaux de cours
  3 niveaux : debutant | intermediaire | avance.
  Chaque niveau a une couleur codée : vert / orange / rouge.
  Les style= de couleur niveau dans les cards sont DYNAMIQUES
  (viennent d'une constante JS, pas de la DB) → toléré mais candidat
  à migration vers classes CSS (.cours-niveau-debutant, etc.).
  Source  : code source existant
  Impact  : Si hardcodé en HTML → impossible à maintenir

RÈGLE-COURS-02 : Éditeur Quill.js
  L'éditeur riche utilise Quill.js 1.3.7 (CDN cdnjs).
  Le contenu est stocké en HTML brut dans la colonne `contenu`.
  La toolbar Quill est configurée : h2/h3, bold/italic/underline, listes, blockquote, link.
  Le CSS Quill (quill.snow.min.css) est chargé en position 5bis
  (entre cds-overrides et cours-ui.css) — exception documentée.
  Source  : conception initiale
  Impact  : Si supprimé → perte de l'éditeur riche

RÈGLE-COURS-03 : Images uploadées
  Max 3 images par cours. Bucket Storage : content-images.
  Sous-dossier : cours/{recordId}/{timestamp}_{index}.{ext}
  URLs signées (3600s) via createSignedUrls().
  Table de liaison : content_images (content_type_id + content_id).
  Source  : code source existant
  Impact  : Si bucket absent → upload échoue silencieusement

RÈGLE-COURS-04 : Tags transverses
  Liaison via tag_links (content_type = 'cours').
  Max 5 tags par cours (UI constraint).
  Types acceptés : fonction, acronyme, libre.
  Source  : code source existant
  Impact  : Si tag_links FK cassée → tags orphelins

RÈGLE-COURS-05 : Parcours pédagogique
  Le module cours est le premier maillon :
    cours → carnet_bord → objectifs
  carnet_bord PEUT référencer des cours via ses resources (jsonb).
  Le lien est en LECTURE SEULE depuis carnet_bord (pas de FK SQL).
  Ne pas coder de lien bidirectionnel avant que carnet_bord et objectifs
  soient pleinement opérationnels.
  Source  : D-2026-03-15-T12, MODULE_DEPENDENCY_MAP_V1_2_0
  Impact  : Si FK créée prématurément → migration bloquée

RÈGLE-COURS-06 : Données limitées
  3 lignes en base, non recetté.
  Module fonctionnel mais données insuffisantes pour valider
  les filtres et la pagination. Recette après seed.sql.
  Source  : audit 2026-03-15
  Impact  : Filtres peuvent sembler cassés (pas assez de données)
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct | Statut |
|---|---|---|---|
| Bloc auth dupliqué (offcanvas + header + initAuth) | 80L HTML + 40L JS, requêtes directes | bdb-shell.js + window.bdbUser (INTERDIT-B1/B2/B3) | ✅ Résolu 2026-03-22 |
| Bouton admin dans `#headerActions` via innerHTML | INTERDIT-C4 | Slot #adminActions dans toolbar filtres (pattern C.6) | ✅ Résolu 2026-03-22 |
| `style="width:90px;height:70px;object-fit:cover"` | INTERDIT-C2 | `class="cds-thumbnail-lg rounded"` | ✅ Résolu 2026-03-22 |
| `style="width:20px;height:20px;font-size:0.65rem"` bouton remove | INTERDIT-C2 | `class="cds-img-remove-btn"` | ✅ Résolu 2026-03-22 |
| `style="font-size:0.6rem"` badge tag type | INTERDIT-C2 | `class="cds-text-micro"` | ✅ Résolu 2026-03-22 |
| `style="height:110px;...cursor:pointer"` dans openCoursView | INTERDIT-C2 | `.cours-view-thumb cds-clickable` | ✅ Résolu 2026-03-22 |
| `style="cursor:pointer"` sur les cards | INTERDIT-C2 | `class="cds-clickable"` | ✅ Résolu 2026-03-22 |
| Chaîne JS Supabase SDK avant Bootstrap JS | Ordre inversé | Bootstrap JS d'abord (BLOC E) | ✅ Résolu 2026-03-22 |
| Spinner-border comme loading state | D-2026-03-16-T06 | `.placeholder-glow` skeleton | ✅ Résolu 2026-03-22 |
| Commentaire CSS "APP_CDT" | Terme banni | "BDB" | ✅ Résolu 2026-03-22 |
| `#bdb-shell` absent du DOM | INTERDIT-E1 | `<div id="bdb-shell">` premier enfant de `<main>` | ✅ Résolu 2026-03-22 |
| cds-offline-banner créé dynamiquement | Pas dans le DOM initial | Placé dans le HTML, affiché via `.show` | ✅ Résolu 2026-03-22 |
| innerHTML sans escHtml() | INTERDIT-C6 | escHtml() sur 12 points d'injection | ✅ Résolu 2026-03-22 |
| Référentiels sans throw | C.9 | throw + catch centralisé dans DOMContentLoaded | ✅ Résolu 2026-03-22 |
| syncImages position 0-indexed + 409 Conflict | CHECK constraint + unicité | Position 1-based + delete-all/re-insert-all | ✅ Résolu 2026-03-22 |

---
