# CTX_PAXIS.md
```
VERSION      : 4.0.0
DATE         : 2026-04-02
MODULE       : paxis
STATUT       : OPÉRATIONNEL — CDS soldé, Supabase migré, Admin slot livré
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF     : SUPABASE_DATA_MODEL_V1_12_0
SHELL_REF    : bdb-shell.js v1.6.0
CSS_REF      : cds-overrides.css v1.6.0
CDS_REF      : CDS_REFERENCE.md v1.0.0

TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 2
TRACKER_VIOLATIONS : aucune
TRACKER_UPDATED    : 2026-04-02

DELTA v3.0.0 → v4.0.0 (D-2026-04-02-PAXIS-SUPABASE + D-2026-04-02-PAXIS-ADMIN) :
  Migration Supabase complète : localStorage supprimé, 4 tables créées.
  Concept de campagne (paxis_campaigns) — 1 seule active à la fois.
  Slot admin livré : paxis-admin.js 825L, 4 onglets, 2 modales, export CSV.
  Recettage membre + admin OK.
  Co-localisation fichiers : index.html + paxis-ui.css + paxis-admin.js dans modules/paxis/.
  DATA_REF bump V1_12_0 (4 tables paxis ajoutées).
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
DERNIÈRE SESSION : 2026-04-02
FAIT             :
  SESSION 2026-04-01 (CDS) :
  - Assainissement CDS complet (D-2026-04-01-PAXIS-CDS)
  - Intégration bdb-shell.js (B1/B2/B3/E1 soldés)
  - escapeHtml → escHtml standard CDS (C6)
  - Chaîne CSS BLOC E conforme, CDN @latest → a75daa0
  - Recettage navigateur OK

  SESSION 2026-04-02 (Supabase + Admin) :
  - Migration 077 : paxis_questions + paxis_sessions + paxis_responses
    10 RLS, 4 index, seed 21 questions terrain
  - Migration 078 : paxis_campaigns + FK campaign_id backfill
  - JS membre : localStorage supprimé, 10 fonctions migrées Supabase
  - Campaign awareness : getActiveCampaign(), filtre campagne active unique
  - Slot admin HTML : section 4 onglets + 2 modales + bouton admin-paxis-slot
  - paxis-admin.js 825L : CRUD campagnes/questions, dashboard, réponses, export CSV
  - paxis-ui.css : 17 classes paxis-admin-* ajoutées
  - Co-localisation : tous fichiers dans modules/paxis/
  - Recettage membre OK + admin OK

RESTE À FAIRE :
  - Mettre à jour SUPABASE_DATA_MODEL → V1_12_0 (4 tables paxis)
  - completed_at : implémenter la logique de marquage session complète
    (actuellement NULL — jamais positionné côté JS)
  - Responsive mobile : vérifier terrain touch (non testé)
  - Skeleton loaders admin : remplacer placeholder-glow par vrais skeletons (C.7 optionnel)

VIOLATIONS ACTIVES : aucune
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  PAXIS LOOP — outil d'interview réflexive pour le bloc opératoire.
  Guide l'utilisateur (IDE, cadre, chirurgien) dans une réflexion structurée
  sur une situation vécue. Outil de développement professionnel.
  Sections : accueil → sélection rôle → interview → historique → export.
  Finalité : améliorer BDB, ses modules, ses fonctions,
  sa cohérence avec les besoins et la réalité de terrain.
  Les admins exploitent les retours via le slot admin (4 onglets).

PORTEE      :
  6 rôles disponibles : responsable · chirurgien · ibode · preparateur · qualite · cadre.
  21 questions initiales structurées (5 types) dans campagne initiale.
  Campagnes : l'admin crée des vagues d'entretiens avec leurs propres questions.
  1 seule campagne active à la fois.
  Questions de suivi générées dynamiquement (15 templates).
  Export MD/JSON (membre) + CSV (admin).
  Hors périmètre : entretiens croisés (interviewer ≠ interviewé).
  Hors périmètre : scoring ou évaluation (RÈGLE-PAXIS-04).

AUTORISE    :
  Modifier modules/paxis/index.html
  Modifier modules/paxis/paxis-ui.css
  Modifier modules/paxis/paxis-admin.js
  Modifier les tables paxis_* dans Supabase
  Ajouter de nouvelles fonctionnalités admin

INTERDIT    :
  Interdits fixes (tous les modules) :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Dupliquer le bloc auth (INTERDIT-B1)
  - Requêtes profiles_directory ou user_roles (INTERDIT-B2)
  - Ajouter style= statique (INTERDIT-C2)
  - Ajouter onclick= (délégation addEventListener uniquement)
  - Inventer une colonne absente de SUPABASE_DATA_MODEL
  - Recréer une classe CSS déjà définie dans CDS_REFERENCE.md
  - Nommer un @keyframes sans préfixe paxis-
  Interdits spécifiques :
  - Ajouter un score, une note ou une évaluation (RÈGLE-PAXIS-04)
  - Supprimer l'export MD/JSON/CSV
  - Modifier la logique de génération follow-up sans validation Manu
  - Modifier les RLS sans entrée JOURNAL_DECISIONS
  - Permettre plus d'1 campagne active simultanément

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.6.0
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.6.0
  Spécifiques :
    paxis_campaigns    → table Supabase (vagues d'entretiens)
    paxis_questions    → table Supabase (référentiel questions par campagne)
    paxis_sessions     → table Supabase (sessions entretien)
    paxis_responses    → table Supabase (réponses par session)
  Fichiers module :
    modules/paxis/index.html       → HTML + JS inline membre
    modules/paxis/paxis-ui.css     → CSS module + admin
    modules/paxis/paxis-admin.js   → JS admin (825L)
```

---

## BLOC 2 — TABLES SUPABASE

### paxis_campaigns (1 ligne initiale)

```
id          uuid PK DEFAULT gen_random_uuid()
title       text NOT NULL
description text
status      text NOT NULL DEFAULT 'draft'    -- draft | active | closed
created_by  uuid NOT NULL FK → auth.users
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
closed_at   timestamptz
```

RLS : member SELECT (status='active') · admin ALL
Contrainte logique : 1 seule campagne active (code JS, pas contrainte DB).

### paxis_questions (seed : 21 lignes campagne initiale)

```
id          uuid PK DEFAULT gen_random_uuid()
code        text UNIQUE NOT NULL
type        text NOT NULL                  -- exploration | clarification | tension | criticite | informel
text        text NOT NULL
roles       text[] NOT NULL DEFAULT '{}'
depth       integer NOT NULL DEFAULT 1
position    integer NOT NULL DEFAULT 0
is_active   boolean NOT NULL DEFAULT true
campaign_id uuid NOT NULL FK → paxis_campaigns
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

Index : `idx_paxis_questions_type` · `idx_paxis_questions_active` · `idx_paxis_questions_campaign`
RLS : member SELECT · admin ALL

### paxis_sessions

```
id            uuid PK DEFAULT gen_random_uuid()
created_by    uuid NOT NULL FK → auth.users
role          text NOT NULL
started_at    timestamptz NOT NULL DEFAULT now()
completed_at  timestamptz
iteration     integer NOT NULL DEFAULT 1
campaign_id   uuid NOT NULL FK → paxis_campaigns
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()
```

Index : `idx_paxis_sessions_user` · `idx_paxis_sessions_campaign`
RLS : own read/insert/update · admin read

### paxis_responses

```
id                  uuid PK DEFAULT gen_random_uuid()
session_id          uuid NOT NULL FK → paxis_sessions ON DELETE CASCADE
question_id         uuid FK → paxis_questions
question_text       text NOT NULL
question_type       text NOT NULL
response_text       text
status              text NOT NULL DEFAULT 'skipped'   -- answered | unclear | later | skipped
is_generated        boolean NOT NULL DEFAULT false
parent_response_id  uuid FK → paxis_responses
depth               integer NOT NULL DEFAULT 1
position            integer NOT NULL DEFAULT 0
created_at          timestamptz NOT NULL DEFAULT now()
```

Index : `idx_paxis_responses_session`
RLS : own via session FK · admin read

### Migrations exécutées

```
077_paxis_tables.sql     — DDL 3 tables + 10 RLS + 4 index + seed 21 questions
078_paxis_campaigns.sql  — paxis_campaigns + FK campaign_id + backfill
```

---

## BLOC 3 — MATRICE D'ACCÈS

```
                    campaigns   questions   sessions    responses
anon                —           —           —           —
membre (own)        SELECT(*)   SELECT      SEL/INS/UPD SEL/INS/UPD
membre (other)      —           —           —           —
admin               ALL         ALL         SELECT      SELECT

(*) membre voit uniquement les campagnes status='active'
```

---

## BLOC 4 — CHECKLIST PREMIUM

```
[✅] CDS conforme
      ✅ Zéro onclick= (addEventListener partout)
      ✅ Zéro style= statique
      ✅ Zéro Font Awesome (Bootstrap Icons uniquement)
      ✅ Zéro console.log (console.error dans catch uniquement)
      ✅ CSS chaîne BLOC E conforme
      ✅ escHtml() standard CDS (22 usages admin + 3 membre)
      ✅ INTERDIT-E1 (#bdb-shell premier enfant <main>)
      ✅ bdb-shell.js v1.6.0 intégré + bdbShellReady
      ✅ CDN @latest → commit hash a75daa0
      ✅ JS admin externalisé (paxis-admin.js — INTERDIT-JS-01)
      ✅ .select() sur toutes les write ops (10/10 admin + 5/5 membre)

[✅] Documenté
      ✅ CTX_PAXIS v4.0.0
      ✅ TRACKER_* mis à jour
      ⏳ SUPABASE_DATA_MODEL à bumper V1_12_0

[✅] Résilient
      ✅ try/catch sur toutes les opérations Supabase
      ✅ 3 états UI (loading/empty/error) sur 4 onglets admin
      ✅ showAdminState() + showAdminError() utilitaires
      ✅ Confirmation avant resetSession(), activateCampaign(), closeCampaign()
      ✅ Gestion erreur insert doublons (code unique questions)

[✅] Navigable
      ✅ #bdb-shell injecté et fonctionnel
      ✅ data-module-title="Paxis" data-module-icon="bi-lightbulb"
      ✅ Navigation sections (home/role/interview/history/export/admin)
      ✅ Slot admin visible uniquement pour isAdmin
      ✅ Bouton retour sur chaque section

[⚠ ] Responsive
      ✅ Bootstrap grid responsive
      ✅ Tables admin responsive (table-responsive)
      ⚠ Non vérifié terrain touch/mobile
```

État actuel : `[4.5/5]` — responsive mobile non vérifié

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-PAXIS-01 : Questions filtrées par rôle
  Filtre : paxis_questions WHERE roles @> ARRAY[role] AND is_active AND campaign_id = active.
  Ne jamais montrer toutes les questions à tous les rôles.

RÈGLE-PAXIS-02 : Génération dynamique de questions de suivi
  analyzeResponse() détecte : vague, risque, contradiction, informel.
  generateFollowUp() crée une question de suivi contextuelle.
  1 seul follow-up par question parent (dédup par parentId).
  Persistées dans paxis_responses avec is_generated=true et parent_response_id.

RÈGLE-PAXIS-03 : localStorage supprimé
  Migration complète vers Supabase. Clé 'paxis_loop_session' n'existe plus.
  Aucun résidu localStorage dans le code.

RÈGLE-PAXIS-04 : Zéro scoring — NON NÉGOCIABLE
  PAXIS est un outil réflexif, pas évaluatif.
  Principes fondateurs :
    "Le terrain précède l'outil"
    "Le réel prime sur le prescrit"
    "La contradiction est une information"
    "L'absence de réponse est un signal"
  Ne jamais ajouter de score, note ou évaluation.

RÈGLE-PAXIS-05 : Export — 3 formats
  Membre : MD + JSON (téléchargement fichier)
  Admin : CSV (BOM UTF-8, séparateur ;, ouvrable Excel direct)

RÈGLE-PAXIS-06 : Rôles en text, pas enum
  Les 6 rôles sont stockés en text. Évolution sans migration DDL.

RÈGLE-PAXIS-07 : question_text toujours stocké dans paxis_responses
  Historique fidèle même si le référentiel paxis_questions évolue.

RÈGLE-PAXIS-08 : 1 seule campagne active — NON NÉGOCIABLE
  Activer une campagne = clore automatiquement la précédente.
  Le membre voit uniquement la campagne active.
  L'admin voit toutes les campagnes (draft, active, closed).

RÈGLE-PAXIS-09 : Dupliquer une campagne copie les questions
  La duplication crée une nouvelle campagne draft avec toutes les questions
  de la source. Les sessions et réponses ne sont PAS copiées.
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur | Correct | Statut |
|---|---|---|---|
| Standalone sans shell | Nav/auth hardcodés | bdb-shell.js v1.6.0 | ✅ Résolu 2026-04-01 |
| escapeHtml non standard | `escapeHtml()` | `escHtml()` CDS | ✅ Résolu 2026-04-01 |
| CSS path ../../css/ | Chemin non co-localisé | Fichiers dans modules/paxis/ | ✅ Résolu 2026-04-02 |
| localStorage | Persistance locale | Supabase 4 tables | ✅ Résolu 2026-04-02 |
| Questions hardcodées JS | INITIAL_QUESTIONS[] | paxis_questions Supabase | ✅ Résolu 2026-04-02 |
| Pas d'admin | Module sans exploitation | Slot admin 4 onglets | ✅ Résolu 2026-04-02 |
| Pas de campagnes | Questions mélangées | paxis_campaigns | ✅ Résolu 2026-04-02 |
| Ajouter un score | Détruit posture réflexive | PAXIS-04 PERMANENT | ⛔ PERMANENT |
| Plusieurs campagnes actives | Confusion membre | PAXIS-08 PERMANENT | ⛔ PERMANENT |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : paxis
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/paxis/index.html · modules/paxis/paxis-ui.css
                      modules/paxis/paxis-admin.js · migrations/07X_paxis_*.sql
FICHIERS HORS SCOPE : js/bdb-shell.js · js/supabase-client.js · css/cds-overrides.css

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX_PAXIS v4.0.0
  [ ] SUPABASE_DATA_MODEL (pour vérification colonnes)

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS (dernière version)
  [ ] CHANTIER_TECHNIQUE_V1_0_6.md
  [ ] Ce fichier CTX_PAXIS v4.0.0
  [ ] CDS_REFERENCE.md
```

---

## BLOC 8 — RÈGLE DE CLÔTURE (obligatoire)

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

## BLOC 9 — DONNÉES MÉTIER DE RÉFÉRENCE

### Types de questions (5)

| Type | Préfixe | Description | Count initial |
|---|---|---|---|
| exploration | EXP | Questions ouvertes d'exploration | 5 |
| clarification | CLA | Approfondissement ciblé | 3 |
| tension | TEN | Points de friction / désaccords | 4 |
| criticite | CRI | Risques et enjeux critiques | 4 |
| informel | INF | Ressenti, ambiance, non-dit | 5 |

### Rôles et distribution (6 — campagne initiale)

| Rôle | Questions éligibles |
|---|---|
| ibode | 18 |
| chirurgien | 13 |
| responsable | 11 |
| cadre | 10 |
| preparateur | 10 |
| qualite | 9 |

### Statuts réponse (4)

`answered` · `unclear` · `later` · `skipped`

### Statuts campagne (3)

`draft` → `active` → `closed`

### Templates follow-up

15 templates (5 types × 3 variantes). Sélection aléatoire uniforme.
Le template `clarification[0]` utilise `extractKeyPhrase()` (5 premiers mots, max 30 chars).
1 seul follow-up par question d'origine (dédup par parentId).

### Fichiers module

| Fichier | Rôle | Lignes |
|---|---|---|
| modules/paxis/index.html | HTML + JS inline membre | ~1550 |
| modules/paxis/paxis-admin.js | JS admin (CRUD, dashboard, export) | 825 |
| modules/paxis/paxis-ui.css | CSS module + admin | ~280 |

---

## BLOC 10 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2025-12-29 | (code) | Création PAXIS LOOP v1.0.0. Standalone offline. | Gemini + Claude |
| 2026-03-13 | 1.1.0 | Suppression clause "INTERDIT Supabase". | Manu + Claude |
| 2026-03-15 | 1.2.0 | NOYAU_REF V2.1.0. Anti-hallucination. Voix utilisateur. | Manu + Claude |
| 2026-03-16 | 1.3.0 | NOYAU_REF V2_4_0. PERSONAS underscore. | Manu + Claude |
| 2026-03-21 | 1.3.1 | TRACKER_* + BLOC 0 partiel — "25 onclick=" incorrects. | Claude |
| 2026-03-21 | 2.0.0 | Réécriture complète TEMPLATE V1.2.0. Audit code 1352L. Violations réelles documentées (B1/B2/B3/E1). | Claude |
| 2026-04-01 | 3.0.0 | CDS soldé (B1/B2/B3/E1/C6). bdb-shell intégré. escHtml. CDN figé. Schéma Supabase 3 tables arbitré. Cartographie métier complète. | Manu + Claude |
| 2026-04-02 | 4.0.0 | Migration Supabase complète. 4 tables (077+078). localStorage supprimé. Campagnes. Slot admin 4 onglets (825L JS). Export CSV. Recettage membre+admin OK. | Manu + Claude |
