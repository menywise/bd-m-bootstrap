# CTX_PAXIS.md
```
VERSION      : 2.0.0
DATE         : 2026-03-21
MODULE       : paxis
STATUT       : OPÉRATIONNEL — migration bdb-shell.js REQUISE (dette critique)
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_5
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0
CSS_REF      : cds-overrides.css v1.5.0

TRACKER_STATUS     : à_faire
TRACKER_SHELL      : non
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS : INTERDIT-B1,INTERDIT-B2,INTERDIT-B3,INTERDIT-E1,offcanvas-hardcoded
TRACKER_UPDATED    : 2026-03-21

DELTA v1.3.0 → v2.0.0 :
  Réécriture complète au standard TEMPLATE V1.2.0 (BLOC 0-9).
  Audit code source index.html (1352L).
  Correction CTX v1.3.x : "25 onclick=" était incorrect — le code utilise
    addEventListener partout. Zéro onclick= dans le HTML.
  STORAGE_KEY confirmée : 'paxis_loop_session'.
  Violations réelles documentées : INTERDIT-B1/B2/B3 + INTERDIT-E1 + offcanvas hardcodé.
  Auth dupliquée confirmée avec requêtes profiles_directory + user_roles directes.
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
FAIT             : Réécriture CTX complet TEMPLATE V1.2.0.
                   Audit code source 1352L. Correction "25 onclick=" (incorrects).
                   STORAGE_KEY confirmée. Violations réelles documentées.
RESTE À FAIRE    : Migration bdb-shell.js — CRITIQUE (bloque checklist 0/5)
                     Supprimer offcanvas hardcodé (~50L HTML)
                     Supprimer header hardcodé (~40L HTML)
                     Supprimer bloc auth dupliqué JS (~40L JS dans DOMContentLoaded)
                     Ajouter <div id="bdb-shell"> premier enfant de <main>
                   Migration Supabase Phase 1 :
                     Table cible : paxis_sessions (schéma à définir)
                     STORAGE_KEY 'paxis_loop_session' → Supabase
                     Ordre : organisateur → paxis → collab → disc → dork → thesaurus
                   Remplacer @latest CDN → tag fixe avant prod (BLOC D.2)
VIOLATIONS ACTIVES :
  CRITIQUE :
  ⚠ INTERDIT-B1 : offcanvas + header dupliqués dans HTML (~90 lignes)
  ⚠ INTERDIT-B2 : auth JS fait requête profiles_directory + user_roles directe
  ⚠ INTERDIT-B3 : bloc auth IIFE local dans DOMContentLoaded
  ⚠ INTERDIT-E1 : #bdb-shell absent — main est frère du header, pas conteneur
  ⚠ offcanvas-hardcoded : navigation statique hardcodée (10 modules fixes)
  MINEUR :
  ⚠ CDN-latest  : @latest sur theme-base.css + theme-print.css (BLOC D.2)
  ⚠ supabase-client.js chargé mais pas encore utilisé (localStorage utilisé)
VIOLATIONS RÉSOLUES :
  - Zéro onclick= dans le HTML ✅ (correction CTX v1.3.x — étaient incorrects)
  - escapeHtml() implémenté dans le JS ✅ (protection XSS sur innerHTML)
  - CSS externalisé dans paxis-ui.css ✅
  - Chaîne CSS conforme sauf @latest ✅
  - Bootstrap + Supabase SDK dans l'ordre ✅
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  PAXIS LOOP — outil d'interview réflexive pour le bloc opératoire.
  Guide l'utilisateur (IDE, cadre, chirurgien) dans une réflexion structurée
  sur une situation vécue. Outil de développement professionnel.
  Sections : accueil → sélection rôle → interview → historique → export.
  Persistance locale actuelle : localStorage clé 'paxis_loop_session'.
  Migration Supabase : Phase 1 (table paxis_sessions).

PORTEE      :
  6 rôles disponibles : responsable · chirurgien · ibode · preparateur · qualite · cadre.
  20 questions initiales structurées (exploration, clarification, tension, criticité, informel).
  Questions de suivi générées dynamiquement selon analyse des réponses.
  Export MD et JSON (téléchargement fichier).
  Historique sessions locale.
  Hors périmètre : partage entre utilisateurs.
  Hors périmètre : scoring ou évaluation.

AUTORISE    :
  Modifier modules/paxis/index.html
  Modifier css/paxis-ui.css
  Migrer vers bdb-shell.js v1.4.0
  Migrer persistance localStorage → Supabase (Phase 1)
  Modifier les questions d'interview ou le format d'export

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Ajouter onclick= dans le HTML (zéro present actuellement — garder ainsi)
  - Ajouter style= statique dans HTML (INTERDIT-C2)
  - Supprimer l'historique des sessions (à migrer vers Supabase, pas supprimer)
  - Modifier les RLS sans entrée JOURNAL_DECISIONS

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0 (après migration)
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.5.0
  Spécifiques à ce module :
    localStorage       : clé 'paxis_loop_session' (temporaire — à supprimer post-migration)
    Tables Supabase    : paxis_sessions (à créer — schéma à définir)
    CSS module         : ../../css/paxis-ui.css
```

---

## BLOC 2 — TABLE SUPABASE

### paxis_sessions (table cible — À CRÉER)

```
Statut : table non existante — schéma à définir.

Structure localStorage actuelle (STORAGE_KEY = 'paxis_loop_session') :
  {
    sessionId    : 'PAXIS_{timestamp}',
    role         : string (responsable|chirurgien|ibode|preparateur|qualite|cadre),
    startedAt    : ISO string,
    currentIndex : int,
    questions    : Question[],          -- questions filtrées par rôle
    responses    : { [questionId]: { text, status, timestamp, questionText, questionType } },
    generatedQuestions : Question[],    -- questions générées dynamiquement
    iteration    : int
  }

Schéma minimal envisagé (à valider) :
  paxis_sessions (
    id               uuid PK,
    user_id          uuid FK auth.users ON DELETE CASCADE,
    role             text NOT NULL,
    started_at       timestamptz,
    completed_at     timestamptz,
    current_index    int NOT NULL DEFAULT 0,
    iteration        int NOT NULL DEFAULT 1,
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now()
  )

  paxis_responses (
    id               uuid PK,
    session_id       uuid FK paxis_sessions ON DELETE CASCADE,
    question_id      text NOT NULL,           -- ex: 'EXP001', 'GEN{timestamp}'
    question_text    text NOT NULL,
    question_type    text NOT NULL,
    response_text    text,
    status           text CHECK (IN 'answered','skipped','unclear','later'),
    depth            int,
    is_generated     boolean DEFAULT false,
    parent_id        text,                    -- question_id parent si générée
    created_at       timestamptz DEFAULT now()
  )

⚠ Schéma à arbitrer avec Manu avant création.
```

### Règle E9

```
⚠ Après migration shell :
  window.bdbUser.isAdmin — source unique, aucune requête user_roles locale
⚠ État actuel (DETTE) :
  Auth IIFE lit profiles_directory + user_roles directement = INTERDIT-B2/B3
  À supprimer lors de la migration bdb-shell
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | Accès actuel | Accès cible (post-Supabase) |
|-----|-------------|----------------------------|
| **anon** | Redirect login (bdb-shell.js) | ✗ |
| **member** | ✓ Session complète + localStorage | ✓ Ses propres sessions persistées |
| **admin** | ✓ Identique member + badge Admin affiché | ✓ + accès lecture toutes sessions |

**Note** : Pas de contenu CRUD admin dans ce module.
L'admin peut voir le badge Admin et accéder aux menus admin-only de la nav,
mais ne dispose pas de fonctions supplémentaires dans PAXIS lui-même.

---

## BLOC 4 — CHECKLIST PREMIUM

```
[❌] CDS conforme
      ⚠ V1 — Offcanvas hardcodé statique (~50L HTML) — INTERDIT-B1
      ⚠ V2 — Header hardcodé statique (~40L HTML) — INTERDIT-B1
      ⚠ V3 — Bloc auth IIFE dupliqué dans DOMContentLoaded (~40L JS) — INTERDIT-B1/B2/B3
             Requêtes profiles_directory + user_roles directes — INTERDIT-B2
      ⚠ V4 — #bdb-shell absent — <main> frère du header dans body — INTERDIT-E1
      ✅ Zéro onclick= dans le HTML (addEventListener partout)
      ✅ Zéro style= statique dans HTML et JS
      ✅ CSS externalisé dans paxis-ui.css (INTERDIT-17 ✅)
      ✅ escapeHtml() implémenté sur tout innerHTML dynamique (INTERDIT-C6 ✅)
      ✅ Chaîne CSS BLOC E : Bootstrap → BI → theme-base → theme-print → cds-overrides → paxis-ui
      ✅ Chaîne JS : Bootstrap → Supabase SDK → supabase-client (ordre correct)
      ⚠ bdb-shell.js absent de la chaîne JS
      ⚠ @latest CDN BDB → tag fixe avant prod (BLOC D.2)

[⚠ ] Documenté
      Ce fichier CTX v2.0.0 dans 00_GOUVERNANCE/
      TRACKER_* mis à jour (2026-03-21)

[⚠ ] Résilient
      ✅ try/catch sur saveState() et loadState()
      ✅ Confirmation avant resetSession()
      ✅ Validation réponse courte avant génération question de suivi
      ⚠ Pas de loadingState / emptyState / errorState formels (C.9)
         À implémenter lors de la migration Supabase

[❌] Navigable
      ⚠ Offcanvas hardcodé statique (10 modules fixes — pas app_modules Supabase)
      ⚠ #bdb-shell absent — data-module-title et data-module-icon non renseignés
      ✅ Navigation interne sections (home/role/interview/history/export) fonctionnelle

[⚠ ] Responsive
      ✅ Bootstrap grid responsive
      ✅ Rôles cards en col-md-6 grid
      ⚠ Non vérifié terrain touch
```

**État actuel** : `[0/5]` — migration bdb-shell.js bloquante

**Violations actives (résumé par criticité)** :
```
CRITIQUE :
  V1/V2/V3 — Auth + header + offcanvas dupliqués — INTERDIT-B1/B2/B3.
  V4        — #bdb-shell absent — INTERDIT-E1.

MINEUR :
  V5 — @latest CDN BDB → tag fixe avant prod.
  V6 — C.9 non implémenté formellement (acceptable pré-Supabase).
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-PAXIS-01 : Questions filtrées par rôle
  Chaque rôle voit un sous-ensemble des 20 questions initiales.
  Filtre : INITIAL_QUESTIONS.filter(q => q.roles.includes(role)).
  Ne jamais montrer toutes les questions à tous les rôles.
  Source  : code source existant
  Impact  : Si ignoré → interview non pertinente pour le rôle

RÈGLE-PAXIS-02 : Génération dynamique de questions de suivi
  analyzeResponse() détecte dans la réponse : vague, risque, contradiction, informel.
  generateFollowUp() crée une question de suivi contextuelle.
  Une seule question générée par question parent (éviter les doublons).
  Les questions générées ont generated=true et parentId renseigné.
  Source  : code source existant
  Impact  : Si doublon autorisé → interview saturée

RÈGLE-PAXIS-03 : STORAGE_KEY immuable
  Clé localStorage : 'paxis_loop_session' (const STORAGE_KEY dans le code).
  Ne jamais la modifier sans migration des données existantes.
  Après migration Supabase : supprimer localStorage.removeItem(STORAGE_KEY).
  Source  : code source confirmé par audit
  Impact  : Si renommée → sessions existantes perdues

RÈGLE-PAXIS-04 : Zéro scoring
  PAXIS est un outil réflexif, pas évaluatif.
  Principes fondateurs (commentaire header) :
    "Le terrain précède l'outil"
    "Le réel prime sur le prescrit"
    "La contradiction est une information"
    "L'absence de réponse est un signal"
  Ne jamais ajouter de score, note ou évaluation.
  Source  : commentaire header index.html
  Impact  : Si scoring ajouté → détruit la confiance terrain (cf. P2, P3 personas)

RÈGLE-PAXIS-05 : Export — format versionné
  Export MD  : fichier paxis_loop_{role}_{date}.md
  Export JSON : fichier paxis_loop_{role}_{date}.json
  Format JSON inclut meta (sessionId, role, iteration) + responses[].
  Après migration Supabase : export reste possible depuis les données en base.
  Source  : code source existant
  Impact  : Si format modifié sans versioning → imports/replays impossibles

RÈGLE-PAXIS-06 : Historique sessions — à migrer, pas supprimer
  L'historique des sessions localStorage est une feature, pas une dette.
  La migration Supabase doit la conserver sous forme de paxis_sessions.
  Ne jamais supprimer l'historique dans une session de correction CDS.
  Source  : INTERDIT CTX précédent — confirmé
  Impact  : Si supprimé → perte de la valeur réflexive accumulée
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct |
|---|---|---|
| Qualifier "25 onclick=" | Erreur CTX v1.3.x — zéro onclick= dans le HTML | addEventListener partout ✅ — ne rien changer |
| Offcanvas + header HTML dupliqués | INTERDIT-B1 — ~90 lignes inutiles | Supprimer, brancher bdb-shell.js v1.4.0 |
| Auth IIFE dans DOMContentLoaded | INTERDIT-B1/B2/B3 — requêtes directes DB | Supprimer, utiliser window.bdbUser |
| Requête `profiles_directory` pour avatar | INTERDIT-B2 | window.bdbUser.initials, prenom, nom |
| Requête `user_roles` pour rôle | INTERDIT-B2 | window.bdbUser.isAdmin |
| `<main>` frère du header dans `<body>` | INTERDIT-E1 — layout flex cassé | `#bdb-shell` premier enfant de `<main>` |
| Supprimer localStorage sans migrer | Perte des sessions utilisateurs | Migrer vers paxis_sessions Supabase d'abord |
| Ajouter un score ou une note | Détruit la posture réflexive non-évaluative | Zéro scoring — principe fondateur du module |
| Navigation offcanvas hardcodée | 10 modules fixes — ne suit pas app_modules | Générée dynamiquement par bdb-shell.js v1.4.0 |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : paxis
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/paxis/index.html · css/paxis-ui.css
FICHIERS HORS SCOPE : js/bdb-shell.js · js/supabase-client.js · css/cds-overrides.css

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX v2.0.0

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS (dernière version)
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md
  [ ] Ce fichier CTX v2.0.0

Si un champ est vide → ne pas commencer.
```

---

## BLOC 8 — RÈGLE DE CLÔTURE

En fin de chaque session sur ce module, l'IA DOIT :

```
1. Mettre à jour BLOC 0 (état courant — fait / reste / violations)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour BLOC 4 (checklist premium)
4. Mettre à jour BLOC 5 si nouvelle règle métier identifiée
5. Inscrire dans JOURNAL_DECISIONS toute décision validée
6. Incrémenter VERSION de ce fichier
```

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2025-12-29 | (code) | Création PAXIS LOOP v1.0.0. Standalone offline. | Gemini + Claude |
| 2026-03-13 | 1.1.0 | Suppression clause "INTERDIT Supabase". | Manu + Claude |
| 2026-03-15 | 1.2.0 | NOYAU_REF V2.1.0. Anti-hallucination. Voix utilisateur. | Manu + Claude |
| 2026-03-16 | 1.3.0 | NOYAU_REF V2_4_0. PERSONAS underscore. | Manu + Claude |
| 2026-03-21 | 1.3.1 | TRACKER_* + BLOC 0 partiel — "25 onclick=" incorrects. | Claude |
| 2026-03-21 | 2.0.0 | Réécriture complète TEMPLATE V1.2.0 intégral. Audit code 1352L. Correction "25 onclick=" (inexistants). STORAGE_KEY confirmée. Violations réelles documentées (INTERDIT-B1/B2/B3/E1). BLOC 0-9 complets. | Claude |
