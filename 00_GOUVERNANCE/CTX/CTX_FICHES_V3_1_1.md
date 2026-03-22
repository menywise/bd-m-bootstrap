# CTX_FICHES.md
```
VERSION      : 3.1.1
DATE         : 2026-03-21
MODULE       : fiches
STATUT       : OPÉRATIONNEL — migration bdb-shell.js TERMINÉE
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0
CSS_REF      : cds-overrides.css v1.5.0

TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : aucune_violation_active
TRACKER_UPDATED    : 2026-03-21

DELTA v3.1.0 → v3.1.1 :
  Correction TRACKER_VIOLATIONS : champ vide → aucune_violation_active
  (valeur vide non lisible par BDB Tracker — patch documentaire uniquement).
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
FAIT             : Patch TRACKER_VIOLATIONS vide → aucune_violation_active.
RESTE À FAIRE    : Vérification responsive terrain touch.
                   @latest CDN → tag fixe avant prod (BLOC D.2).
VIOLATIONS ACTIVES :
  Aucune violation critique ou majeure.
  MINEUR :
    V9 — @latest CDN BDB → tag fixe avant prod (BLOC D.2).
    Responsive terrain non vérifié.
VIOLATIONS RÉSOLUES :
  - INTERDIT-B1/B2/B3 : résolu le 2026-03-20 (initAuth supprimé)
  - INTERDIT-C4       : résolu le 2026-03-20 (slot toolbar)
  - INTERDIT-C2       : résolu le 2026-03-20 (10 style= → classes)
  - INTERDIT-E1       : résolu le 2026-03-20 (#bdb-shell premier enfant main)
  - INTERDIT-17       : résolu le 2026-03-20 (.btn-ghost → .fiche-btn-ghost)
  - INTERDIT-C6       : résolu le 2026-03-20 (escHtml 15 points)
  - C.9               : résolu le 2026-03-20 (3 états UI + throw référentiels)
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Fiches d'intervention chirurgicale — référentiel pédagogique du bloc.
  Chaque fiche documente un acte chirurgical : instrumentation, installation,
  matériel requis, préférences chirurgien, points d'attention.
  Objectif fondateur :
    "J'ai [intervention X] avec [Dr Y] → je prépare quoi, je trouve où ?"
    3 clics. 30 secondes. Zéro appel radio.
  Objectif structurel : casser les 7 blocages terrain STB-01 à STB-07
  (NOYAU_VERITE BLOC 1).
  Consultation pour members. CRUD complet + images pour admins.

PORTEE      :
  Toutes interventions chirurgicales toutes spécialités configurées.
  17 sections de fiche (V6) documentées ci-dessous.
  Hors périmètre actuel :
    - Tables Phase 2 (interventions, blocs, packs, lames_scie…)
    - Filtrage par rôle utilisateur (BRANCARDIER/CIRCULANT/INSTRUMENTISTE/IADE/AS/CADRE)
    - Cascades automatiques
    - Lien actif avec Planning Engine (SLOT ≠ intervention — FRONTIÈRE CRITIQUE)

AUTORISE    :
  Modifier modules/fiches/index.html
  Modifier css/fiches-ui.css
  Modifier les requêtes Supabase du module
  Modifier la logique métier JS inline
  Implémenter les 17 sections de fiche
  Implémenter le filtrage par rôle
  Implémenter les cascades automatiques

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css (→ entrée JOURNAL_DECISIONS si changement nécessaire)
  - Dupliquer le bloc auth (INTERDIT-B1)
  - Requête profiles_directory ou user_roles pour vérifier un rôle (INTERDIT-B2)
  - Créer un initAuth() local (INTERDIT-B3)
  - Modifier les RLS sans entrée JOURNAL_DECISIONS
  - Inventer une colonne absente de SUPABASE_DATA_MODEL_V1_4_0
  - Ajouter style= statique dans le HTML ou les template literals JS (INTERDIT-C2)
  - Ajouter onclick= dans le HTML
  - Injecter le bouton d'action primaire via innerHTML dans le header (INTERDIT-C4)
  - Connecter au Planning Engine (SLOT ≠ intervention — NOYAU BLOC 3)
  - Fusionner deux variantes techniques d'une même intervention
  - "Corriger" content-images/content_images sans test DB
  - Inventer un attribut d'item manquant (règle UNKNOWN)
  - Qualifier une intervention de "terminée" sans validation IBODE référent
  - Utiliser le terme APP_CDT (terme banni)

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    window.bdbShellReady → Promise résolue quand le shell est prêt
    cds-overrides.css  → v1.5.0
  Spécifiques à ce module :
    Tables Supabase : fiches_intervention · categories · content_images ·
                      content_types · profiles_directory · tag_links · tags ·
                      content_relations
    CDN externe : Quill.js 1.3.7 (éditeur riche) — cdnjs.cloudflare.com
    Bucket Storage : content-images (sous-dossier fiches/)
    Modules BDB liés (lecture seule) :
      arsenal (matériel) · anatomie (zones) · installation (positions) · preferences (chirurgien)
    Consommé par : cours · installation
```

---

## BLOC 2 — TABLE SUPABASE

### fiches_intervention (table principale)

```
Colonnes clés : id (uuid PK) · titre · description (html Quill)
                category_id (FK categories) · duree_estimee (int nullable)
                status (draft | published) · etapes (jsonb array)
                tags (jsonb — usage legacy, migration tag_links en cours)
                user_id (FK auth.users — auteur) · last_modified_by (FK auth.users)
                created_at · updated_at
État Supabase : Créée — données partielles, non recetté
```

### Tables transverses utilisées

```
categories      : filtrées par content_type_id WHERE code = 'fiches'
content_types   : lookup code = 'fiches' → id
content_images  : images uploadées (content_type_id + content_id)
content_relations : relations entre fiches (ex : variantes)
tag_links       : liaison fiches → tags (content_type = 'fiche')
tags            : référentiel tags (type IN intervention, fonction, libre)
profiles_directory : auteur (lecture seule)
user_roles      : ✅ DETTE RÉSOLUE — initAuth() supprimé (migration shell 2026-03-20)
                  Rôle lu via window.bdbUser.isAdmin
```

### Tables futures Phase 2 (NE PAS RÉFÉRENCER COMME EXISTANTES)

```
interventions · blocs · intervention_composition · bloc_contenu
packs · packs_contenu · preferences · lames_scie · zones_anatomiques
```

### RLS cibles

```
pol_fiches_member_read  : SELECT published pour auth
pol_fiches_admin_read   : SELECT all pour admin
pol_fiches_admin_write  : ALL pour admin
```

### Règle E9 — anti-régression critique

```
⚠ approved → profiles_directory.approved  (JAMAIS user_roles)
⚠ role     → user_roles.role              (JAMAIS profiles_directory)
⚠ ÉTAT ACTUEL :
  ✅ DETTE RÉSOLUE (session 2026-03-20).
  initAuth() supprimé. Module utilise window.bdbUser via bdb-shell.js v1.4.0.
  Aucune requête profiles_directory ou user_roles dans le module.
```

### Bug documenté — content-images / content_images

```
⚠ Le nom de bucket Storage est "content-images" (tiret).
  Le nom de table est "content_images" (underscore).
  NE PAS "corriger" l'un ou l'autre sans test DB complet.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE/DELETE | Note |
|-----|--------|---------------------|------|
| **anon** (démo, non connecté) | ✗ | ✗ | Redirect login |
| **member** (connecté) | `published` uniquement | ✗ | Lecture seule |
| **admin** | tout (draft/published) | ✓ | CRUD + upload images |

**Côté UI** :
- Bouton "Nouvelle fiche" → slot toolbar filtres `#fichesToolbarAdminSlot` (pattern C.6 — ✅ migré)
- Dropdown modifier/supprimer via `.fiche-btn-ghost` dans chaque card (admin only)
- Filtre statut "Brouillon" visible par tous (à restreindre admin dans le futur)

---

## BLOC 4 — CHECKLIST PREMIUM

Source : NOYAU_VERITE_V2_4_0 BLOC 9 — 5 critères obligatoires.

```
[✅] CDS conforme
      ✅ Shell migré bdb-shell.js v1.4.0 (session 2026-03-20)
      ✅ #bdb-shell premier enfant de <main> (INTERDIT-E1)
      ✅ initAuth() supprimé → initFromShell() + window.bdbUser (INTERDIT-B1/B2/B3)
      ✅ Bouton admin → slot toolbar filtres #fichesToolbarAdminSlot (INTERDIT-C4)
      ✅ 10 style= statiques → classes CDS/module (INTERDIT-C2)
      ✅ Chaîne JS BLOC E ordonnée : Bootstrap → Supabase → Quill → client → shell
      ✅ bdb-shell.js dans la chaîne JS
      ✅ .btn-ghost → .fiche-btn-ghost scopé (INTERDIT-17)
      ✅ Zéro onclick= dans le HTML
      ✅ CSS module scopé (.fiche-* / .fiches-* — INTERDIT-17 OK)
      ✅ escHtml() sur 15 points d'injection (INTERDIT-C6)
      ✅ APP_CDT → BDB dans commentaire JS
      ⚠ Seuls style= restants : color dynamique DB (INTERDIT-C3 OK — toléré)

[✅] Documenté
      CTX_FICHES v3.1.1 à jour dans 00_GOUVERNANCE/
      CHANTIER_TECHNIQUE v1.0.6 mis à jour
      JOURNAL_DECISIONS v1.10.0 — D-2026-03-20-T01
      TRACKER_* à jour (2026-03-21)

[✅] Résilient
      ✅ 3 états UI couverts (C.9) : loading skeleton + empty + error
      ✅ Référentiels (content_types, categories, tags) → throw + catch centralisé
      ✅ cdsShowGridError() avec bouton Réessayer
      ✅ cdsShowOfflineBanner() implémenté
      ✅ escHtml() sur toutes données DB injectées en innerHTML
      ✅ openFicheModal edit : error state si fetch échoue

[✅] Navigable
      ✅ Offcanvas dynamique via bdb-shell.js v1.4.0
      ✅ data-module-title="Fiches d'intervention"
      ✅ data-module-icon="bi-file-earmark-medical"

[⚠ ] Responsive
      ✅ Bootstrap grid responsive
      ⚠ Non vérifié terrain touch
```

**État actuel** : `[4/5]` — responsive terrain non vérifié

**Violations actives** :
```
AUCUNE violation critique ou majeure.
MINEUR :
  V9 — @latest CDN BDB → tag fixe avant prod (BLOC D.2).
  Responsive terrain non vérifié.
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-FICHES-01 : FRONTIÈRE SLOT ≠ INTERVENTION (CRITIQUE)
  Planning Engine → SLOT = {salle + jour + créneau} = unité de planification
  Ce module       → intervention chirurgicale = acte CCAM = unité pédagogique
  Ces deux objets ne s'agrègent JAMAIS. Modules totalement indépendants.
  Toute tentative de fusion ou de lien = erreur grave.
  Source  : NOYAU_VERITE BLOC 3, BIBLE_DE_BLOC V1.0.3
  Impact  : Si fusionné → corruption de données des deux modules

RÈGLE-FICHES-02 : Variantes techniques — NE JAMAIS FUSIONNER
  PTH (voie antérieure / postérieure / intermédiaire)
  PTG (cimentée / non cimentée / navigation / robotisée)
  LCA (DIDT / KJ / allogreffe)
  Fracture col fémur (clou gamma / DHS / vis cannulées)
  Hallux valgus (classique / percutané)
  Chaque variante = fiche distincte. Jamais de fusion.
  Source  : BIBLE_DE_BLOC V5/V6
  Impact  : Si fusionné → préparation incorrecte en salle

RÈGLE-FICHES-03 : Algorithme picking par soustraction
  Liste théorique intervention − Contenu du pack = Picking list.
  Le pack soustrait le besoin. Si le pack couvre un item, ne pas le ressortir.
  Si le pack ne correspond pas aux préférences → ajouter, jamais retirer du pack.
  Source  : regles_picking_preincision.md
  Impact  : Si inversé → matériel manquant ou doublé

RÈGLE-FICHES-04 : 17 sections de fiche (V6)
  Structure standard d'une fiche complète.
  Sections FIXES (toujours présentes), CONDITIONNELLES (si applicable),
  ANNEXES (optionnelles). Non encore implémentées dans le code actuel.
  Source  : BIBLE_DE_BLOC_MASTER_V5, ajouts V6
  Impact  : Si omise → fiche incomplète

RÈGLE-FICHES-05 : Règle UNKNOWN
  L'application ne fait jamais d'hypothèses sur des données ambiguës.
  En cas de doute → alerte avec choix. Jamais de valeur inventée.
  Source  : NONO_regles_fondamentales.md
  Impact  : Si ignoré → risque patient (matériel inapproprié)

RÈGLE-FICHES-06 : Voie opératoire = variable implicite déterminante
  La voie opératoire change le matériel, l'installation, l'instrumentation.
  Ne pas l'ignorer. Ne pas l'inventer si absente.
  Source  : BIBLE_DE_BLOC V7 archéologie lames
  Impact  : Si ignoré → préparation incorrecte

RÈGLE-FICHES-07 : Données partielles
  Module fonctionnel mais données insuffisantes pour validation terrain.
  Recette après seed.sql et saisie IBODE référent.
  Source  : audit 2026-03-15
  Impact  : Filtres semblent cassés si données insuffisantes

RÈGLE-FICHES-08 : Étapes d'intervention (jsonb)
  Les étapes sont stockées en jsonb dans fiches_intervention.etapes.
  Format : [{ordre: 1, titre: "...", description: "..."}, ...]
  L'ordre est recalculé à chaque ajout/suppression.
  Source  : code source existant
  Impact  : Si pas jsonb → perte structure étapes
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct | Statut |
|---|---|---|---|
| Bloc auth dupliqué (offcanvas + header + initAuth) | 80L HTML + 17L JS, requêtes directes | Supprimer, bdb-shell.js, window.bdbUser | ✅ Résolu 2026-03-20 |
| Bouton admin dans `#headerActions` via innerHTML | INTERDIT-C4 | Slot admin toolbar filtres (pattern C.6) | ✅ Résolu 2026-03-20 |
| `style="width:80px;height:60px;object-fit:cover"` | INTERDIT-C2 | `class="cds-thumbnail rounded"` | ✅ Résolu 2026-03-20 |
| `style="width:20px;height:20px"` bouton remove | INTERDIT-C2 | `class="cds-img-remove-btn"` | ✅ Résolu 2026-03-20 |
| `style="cursor:pointer"` sur les cards | INTERDIT-C2 | `class="cds-clickable"` | ✅ Résolu 2026-03-20 |
| `style="height:120px;object-fit:cover;cursor:pointer"` images view | INTERDIT-C2 | `.fiche-view-thumb` dans fiches-ui.css | ✅ Résolu 2026-03-20 |
| `style="width:28px;height:28px;font-size:0.8rem"` badge étape | INTERDIT-C2 | `.fiche-etape-badge` dans fiches-ui.css | ✅ Résolu 2026-03-20 |
| Chaîne JS Supabase SDK avant Bootstrap JS | BLOC E ordre inversé | Bootstrap JS d'abord, puis Supabase SDK | ✅ Résolu 2026-03-20 |
| Spinner-border comme loading state | Obsolète D-2026-03-16-T06 | `.placeholder-glow` skeleton | ✅ Résolu 2026-03-20 |
| `#bdb-shell` absent du DOM | INTERDIT-E1 | `<div id="bdb-shell">` premier enfant `<main>` | ✅ Résolu 2026-03-20 |
| innerHTML sans escHtml() sur données DB | 15 points injection XSS | escHtml() obligatoire (INTERDIT-C6) | ✅ Résolu 2026-03-20 |
| Référentiels en échec silencieux | Sans error handling | throw + catch centralisé (C.9) | ✅ Résolu 2026-03-20 |
| Connecter fiches au Planning Engine | SLOT ≠ intervention | Modules indépendants (NOYAU BLOC 3) | N/A |
| Fusionner variantes techniques | PTH antérieure ≠ PTH postérieure | 1 variante = 1 fiche distincte | N/A |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : fiches
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/fiches/index.html · css/fiches-ui.css
FICHIERS HORS SCOPE : js/bdb-shell.js · js/supabase-client.js · css/cds-overrides.css

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX_FICHES v3.1.1
  [ ] Le(s) fichier(s) source du module

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS_V1_10_0.md
  [ ] CHANTIER_TECHNIQUE_V1_0_6.md
  [ ] Ce fichier CTX_FICHES v3.1.1
  [ ] SUPABASE_DATA_MODEL_V1_4_0.md  (si travail sur données)

Si un champ est vide → ne pas commencer.
```

---

## BLOC 8 — RÈGLE DE CLÔTURE (obligatoire)

En fin de chaque session sur ce module, l'IA DOIT :

```
1. Mettre à jour BLOC 0 (état courant — fait / reste / violations)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour BLOC 4 (checklist premium)
4. Inscrire dans JOURNAL_DECISIONS toute décision validée
5. Incrémenter VERSION de ce fichier
```

**Si une de ces étapes est omise → le prochain Claude travaille sur un CTX périmé.**
**Le tracker détectera l'écart et le signalera dans SESSION_STATE.md.**

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-08 | 1.0.0 | Création initiale. | Manu + Claude |
| 2026-03-12 | 2.0.0 | Enrichissement Bible V5/V6/V7 + règles NONO. | Manu + Claude |
| 2026-03-15 | 2.1.0 | NOYAU_REF V2.1.0. Frontière SLOT ≠ intervention renforcée. | Manu + Claude |
| 2026-03-16 | 2.2.0 | NOYAU_REF V2_4_0. PERSONAS underscore. Tables futures Phase 2. | Manu + Claude |
| 2026-03-17 | 3.0.0 | Réécriture TEMPLATE v2.0.0 (8 blocs). Audit 957L. Checklist 0/5. | Manu + Claude |
| 2026-03-20 | 3.1.0 | Migration shell complète. 9 violations corrigées. escHtml 15 pts. C.9. TRACKER_* ajoutés. BLOC 0. Template V1.2.0. Checklist 4/5. D-2026-03-20-T01. | Manu + Claude |
| 2026-03-21 | 3.1.1 | Patch TRACKER_VIOLATIONS vide → aucune_violation_active. Documentaire uniquement. | Claude |
