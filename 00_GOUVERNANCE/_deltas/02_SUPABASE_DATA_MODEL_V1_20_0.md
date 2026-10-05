# SUPABASE_DATA_MODEL.md
```
VERSION  : 1.20.0
DATE     : 2026-04-10
STATUT   : CANON — MODÈLE DE DONNÉES GLOBAL BDB
PORTÉE   : Supabase cloud (source de vérité permanente)
DELTA    : v1.19.0 → v1.20.0
           Section 4 : glossaire — 6 colonnes additives (migration 139).
           terme_latin, termes_en, source, num_article, pertinence_bloc, protocoles_lies.
           ~435 termes OQLF 2019 + FCO 2015 fusionnés via migration 139.
           Section 26 supprimée : glossaire_chirurgie droppée (migration 139).
           Réf : D-2026-04-10-S70-01, D-2026-04-10-S70-02.
DELTA    : v1.18.0 → v1.19.0
           Section 26 : table glossaire_chirurgie — 435 termes chirurgicaux
           (379 OQLF 2019 + 56 FCO 2015). 20 colonnes. Migrations 123-138 + 136b.
           Réf : D-2026-04-10-GLOSS-01.
DELTA    : v1.17.0 → v1.18.0
           Section 11 : collab_projects — 4 colonnes manquantes ajoutées
           (status, validated_by, validated_at, updated_at).
           Audit terrain information_schema 2026-04-10. Correction documentaire, zéro SQL.
           Section 25 : table signalements (migration 106, session #44).
           Bouton flottant universel bdb-shell v1.8.0 (step 12 _initSignalement).
           RLS : INSERT anon+auth (honeypot + rate limit 5/h) · SELECT/UPDATE/DELETE admin.
           RPC signalements_stats() SECURITY DEFINER pour badge admin.
           Réf : D-2026-04-06-S44-01.
DELTA    : v1.16.0 → v1.17.0
           Section 4 : glossaire — 3 colonnes V2 ajoutées (variantes, categorie, is_propagated).
           UNIQUE constraint sur abbreviation. Index trigram thesaurus_interventions.note.
           3 RPC serveur : glossaire_scan_orphelins, glossaire_match_notes, glossaire_propagate.
           Réf : migration 076a/076b/076c — session #24.
           Section 23 : bdb_principes 20→52 lignes — seed UX Premium (32 règles UX01-UX32).
           Migration 090 ajoutée. Domaine UX + 9 catégories UX documentées.
           Réf : D-2026-04-05-UX01.
DELTA    : v1.15.0 → v1.16.0
           Section 2.1 : paxis retiré des exceptions localStorage (migré Supabase).
           Section 9 : relations paxis ajoutées.
           Section 11 : paxis marqué MIGRÉ → Section 24.
           Section 24 : paxis V1 complet — 4 tables + RLS + triggers + seed.
           Réf : D-2026-04-02-PAXIS-SUPABASE, D-2026-04-02-PAXIS-ADMIN.
```

---

# 1 — RÔLE DU DOCUMENT

Ce document définit le **modèle de données global de BDB**.

Objectifs :
- documenter les tables Supabase (source : cloud réel, pas le code)
- définir les relations autorisées
- empêcher les dérives de schéma
- aligner local et cloud

Ce document complète : MANIFESTE_BDB · CTX_SYSTEM_ARCHITECTURE · CTX modules · JOURNAL_DECISIONS

**Règle V1.7.0** : chaque colonne documentée ici a été vérifiée par `information_schema.columns`
sur le cloud `ecpzrygzdugwwkqbsajn.supabase.co` le 2026-03-22.

---

# 2 — PRINCIPES DU MODÈLE

## 2.1 Supabase exclusif

Toutes les données métier persistantes → Supabase.

Exceptions temporaires (migration planifiée) :
```
planning · collab · organisateur
```

> thesaurus migré Supabase cloud — migrations 018→065.

## 2.2 Tables transverses

Partagées par tous les modules — colonne vertébrale du système. Jamais dupliquer.

```
profiles · user_roles
content_types · categories · tags · tag_links · content_images · content_relations
app_groups · app_modules
```

## 2.3 Enums PostgreSQL

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'membre', 'invite');
CREATE TYPE public.tag_type AS ENUM ('libre', 'fonction', 'anatomie', 'materiel', 'instrument');
```

⚠ ALERTE : `app_role` utilise `'membre'` (FR), pas `'member'` (EN).
⚠ Valeur `'invite'` ajoutée v1.11.0 (D-2026-03-30-T08) — accès restreint en lecture seule.
Vérifier que `is_admin()` et `bdb-shell.js` comparent la bonne valeur.

## 2.4 Pattern éditorial Lovable

Toutes les tables métier partagent ce socle de colonnes :

```
user_id          uuid NOT NULL FK → auth.users   (auteur)
category_id      uuid FK → categories(id)        (classification)
tags             text[] NOT NULL DEFAULT '{}'     (tags embarqués)
status           text NOT NULL DEFAULT 'draft'    (workflow éditorial)
is_dev           boolean NOT NULL DEFAULT false   (données dev/test)
last_modified_by uuid                             (dernier éditeur)
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
```

Tables concernées : fiches_intervention · anatomie · installation_patient · cours · transmissions · materiel · casaques · gants

---

# 3 — TABLES UTILISATEURS

## profiles (25 colonnes — table principale)

```
id                      uuid PK DEFAULT gen_random_uuid()
user_id                 uuid NOT NULL FK → auth.users
email                   text NOT NULL
name                    text NOT NULL DEFAULT ''
initials                text NOT NULL DEFAULT ''
nom                     text NOT NULL DEFAULT ''
prenom                  text NOT NULL DEFAULT ''
fonction                text NOT NULL DEFAULT 'infirmier'
avatar_url              text
created_at              timestamptz NOT NULL DEFAULT now()
updated_at              timestamptz NOT NULL DEFAULT now()
approved                boolean NOT NULL DEFAULT false
bio                     text DEFAULT ''
known_as                text DEFAULT ''
signes_particuliers     text DEFAULT ''
is_dev                  boolean NOT NULL DEFAULT false
telephone_principal     text DEFAULT ''
telephone_secondaire    text DEFAULT ''
secretaires             text DEFAULT ''
taille_gants            text DEFAULT ''
couleur_preferentielle  text DEFAULT ''
gant_paire_1_id         uuid
gant_paire_2_id         uuid
casaque_id              uuid
porte_casque            boolean NOT NULL DEFAULT false
chirurgien_id           uuid FK → thesaurus_chirurgiens(id) NULL
secretaires_list        jsonb NOT NULL DEFAULT '[]'
```

RLS : SELECT public · UPDATE own (user_id=uid()) · ALL admin

## profiles_directory = TABLE sans PK formelle

pg_policies retourne 4 policies sur profiles_directory → c'est une table.
Le `id` nullable dans information_schema s'explique par l'absence de contrainte NOT NULL (pas de PK formelle).

Colonnes : user_id · id · name · initials · nom · prenom · fonction ·
avatar_url · bio · couleur_preferentielle · taille_gants · casaque_id ·
porte_casque · chirurgien_id · signes_particuliers · secretaires · secretaires_list ·
telephone_principal · telephone_secondaire · known_as · gant_paire_1_id ·
gant_paire_2_id · approved · is_dev · created_at · updated_at · email

RLS (cloud exact) :
- SELECT : is_admin() OR approved=true OR user_id=auth.uid()
- INSERT : user_id=auth.uid()
- UPDATE : user_id=auth.uid() OR is_admin()
- DELETE : is_admin()

⚠ `approved` est ici. PAS dans `user_roles`.

## user_roles

```
id          uuid PK DEFAULT gen_random_uuid()
user_id     uuid NOT NULL FK → auth.users
role        app_role NOT NULL DEFAULT 'membre'
created_at  timestamptz NOT NULL DEFAULT now()
```

⚠ Enum `app_role` : valeurs `'admin'` | `'membre'` | `'invite'` (français, pas anglais).

---

# 4 — TABLES DE STRUCTURATION CONTENU

## content_types

```
id          uuid PK DEFAULT gen_random_uuid()
code        text NOT NULL
label       text NOT NULL
icon        text NOT NULL DEFAULT 'FileText'
color       text NOT NULL DEFAULT 'blue'
active      boolean NOT NULL DEFAULT true
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

## categories

```
id              uuid PK DEFAULT gen_random_uuid()
label           text NOT NULL
icon            text NOT NULL DEFAULT 'FileText'
color           text NOT NULL DEFAULT 'blue'
active          boolean NOT NULL DEFAULT true
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
content_type_id uuid FK → content_types(id)
```

## tags

```
id               uuid PK DEFAULT gen_random_uuid()
label_display    text NOT NULL
label_normalized text NOT NULL
type             tag_type NOT NULL DEFAULT 'libre'
glossary_id      uuid
created_by       uuid FK → auth.users
is_locked        boolean NOT NULL DEFAULT false
created_at       timestamptz NOT NULL DEFAULT now()
```

⚠ V1.6.0 disait `name` + `locked` → le cloud a `label_display`/`label_normalized` + `is_locked`.
⚠ `type` est un enum PostgreSQL `tag_type`, pas un text libre.

## tag_links

```
id           uuid PK DEFAULT gen_random_uuid()
tag_id       uuid NOT NULL FK → tags(id) ON DELETE CASCADE
content_type text NOT NULL
content_id   uuid NOT NULL
created_at   timestamptz NOT NULL DEFAULT now()
```

RLS DELETE : `is_admin()` uniquement (D-2026-03-20-T09).

## tag_suggestions

```
id             uuid PK DEFAULT gen_random_uuid()
proposed_label text NOT NULL
proposed_by    uuid NOT NULL FK → auth.users ON DELETE CASCADE
status         text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected'))
reviewed_by    uuid FK → auth.users
reviewed_at    timestamptz
created_at     timestamptz NOT NULL DEFAULT now()
```

Index : `idx_tag_suggestions_status ON (status) WHERE status = 'pending'`

RLS : member INSERT (own) · member SELECT (own OR admin) · admin ALL

## glossaire

```
id                uuid PK DEFAULT gen_random_uuid()
abbreviation      text NOT NULL UNIQUE          -- terme principal (FR)
definition        text NOT NULL DEFAULT ''
usage_notes       text DEFAULT ''               -- genre, notes, nomenclature, geo
created_by        uuid FK → auth.users NULL     -- NULL = import automatique
created_at        timestamptz NOT NULL DEFAULT now()
updated_at        timestamptz NOT NULL DEFAULT now()
--- V2 (migration 076a) ---
variantes         text NOT NULL DEFAULT ''      -- pipe-separated : syn1|syn2|syn3
categorie         text NOT NULL DEFAULT ''      -- ABREVIATION|EPONYME|PATHOLOGIE|
                                                -- MATERIEL|TECHNIQUE|ANATOMIE|
                                                -- CONVENTION|METIER|OUTIL|DISC|METHODE|BDB
is_propagated     boolean NOT NULL DEFAULT false -- synonymes_recherche mis a jour ?
--- migration 098 ---
show_in_site      boolean NOT NULL DEFAULT false -- visible mini-site public
show_in_module    boolean NOT NULL DEFAULT false -- visible module Lexique app
--- migration 139 (fusion glossaire_chirurgie) ---
terme_latin       text NULL                     -- Terminologia Anatomica
termes_en         text[] NULL                   -- equivalents anglais
source            text NOT NULL DEFAULT 'BDB'   -- BDB | OQLF_2019 | FCO_2015
num_article       int4 NULL                     -- numero article OQLF (1-379)
pertinence_bloc   text NULL                     -- critique | haute | moyenne | faible
protocoles_lies   text[] NULL                   -- libelle_cible[] thesaurus_protocoles
```

Sources actives en base :
- BDB      : ~97 entrees — lexique applicatif (DISC, METIER, OUTIL, METHODE, BDB...)
- OQLF_2019 : ~379 entrees — Vocabulaire de la chirurgie, OQLF Quebec 2019
             https://www.oqlf.gouv.qc.ca
- FCO_2015 : ~56 entrees — Fondation Canadienne d'Orthopedie 2015
             https://movepainfree.org/fr/my-surgery/glossary/
             Copyright 2015-2026 FCO — N 89059 4740 RR0001

RLS : anon SELECT · member SELECT · admin ALL (bdb_is_admin)
Index :
- glossaire_abbreviation_key UNIQUE (abbreviation)
- idx sur show_in_module (filtre module Lexique)

Colonnes filtres :
- show_in_module = true  → visible dans module Lexique (bdb-search.js)
- show_in_site = true    → visible mini-site public
- source = 'BDB'         → lexique applicatif natif
- pertinence_bloc IN ('critique','haute') → set show_in_module=true a l'import

## glossaire_suggestions

```
id             uuid PK DEFAULT gen_random_uuid()
proposed_term  text NOT NULL
proposed_def   text NOT NULL DEFAULT ''
proposed_notes text
proposed_by    uuid NOT NULL FK → auth.users ON DELETE CASCADE
status         text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected'))
reviewed_by    uuid FK → auth.users
reviewed_at    timestamptz
admin_note     text
created_at     timestamptz NOT NULL DEFAULT now()
```

Index : `idx_glossaire_suggestions_status ON (status) WHERE status = 'pending'`

RLS : member INSERT (own) · member SELECT (own OR admin) · admin ALL (bdb_is_admin)

---

# 5 — MÉDIAS

## content_images

```
id              uuid PK DEFAULT gen_random_uuid()
content_type_id uuid NOT NULL
content_id      uuid NOT NULL
storage_path    text NOT NULL
position        integer NOT NULL DEFAULT 1
created_at      timestamptz NOT NULL DEFAULT now()
is_dev          boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `content_type`/`url`/`caption` → le cloud a `content_type_id`/`storage_path`/`position`/`is_dev`.

RLS INSERT : `is_approved()` (D-2026-03-20-T09).

⚠ Bucket Storage `content-images` : DOIT être privé (Public = OFF).
   Signed URLs : durée 900s (D-2026-03-21-S01).

---

# 6 — RELATIONS CONTENU

## content_relations

```
id              uuid PK DEFAULT gen_random_uuid()
source_type_id  uuid NOT NULL
source_id       uuid NOT NULL
target_type_id  uuid NOT NULL
target_id       uuid NOT NULL
relation_type   text NOT NULL DEFAULT 'reference'
created_at      timestamptz NOT NULL DEFAULT now()
created_by      uuid
is_dev          boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `source_type`/`target_type` (text) → le cloud a `source_type_id`/`target_type_id` (uuid).

RLS : SELECT `is_approved()` + CRUD `is_admin()` (D-2026-03-20-T09).

---

# 7 — TABLES MÉTIER

## fiches_intervention

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
titre            text NOT NULL
description      text NOT NULL DEFAULT ''
etapes           jsonb NOT NULL DEFAULT '[]'
duree_estimee    integer
tags             text[] NOT NULL DEFAULT '{}'
status           text NOT NULL DEFAULT 'draft'
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
last_modified_by uuid
is_dev           boolean NOT NULL DEFAULT false
```

5 fiches en base (cloud, 2026-03-09).
⚠ Frontière critique : SLOT (planning) ≠ intervention (fiches) — jamais fusionner.
⚠ `description` contient du HTML Quill → DOMPurify.sanitize() obligatoire (D-2026-03-21-S01).

## anatomie

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
titre            text NOT NULL
description      text NOT NULL DEFAULT ''
region           text
tags             text[] NOT NULL DEFAULT '{}'
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
last_modified_by uuid
is_dev           boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `zone` → le cloud a `region`.

## installation_patient

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
titre            text NOT NULL
description      text NOT NULL DEFAULT ''
position         text
precautions      text
tags             text[] NOT NULL DEFAULT '{}'
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
last_modified_by uuid
is_dev           boolean NOT NULL DEFAULT false
```

## cours

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
titre            text NOT NULL
description      text NOT NULL DEFAULT ''
contenu          text NOT NULL DEFAULT ''
niveau           text NOT NULL DEFAULT 'debutant'
tags             text[] NOT NULL DEFAULT '{}'
status           text NOT NULL DEFAULT 'draft'
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
last_modified_by uuid
is_dev           boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `title`/`content` → le cloud a `titre`/`contenu`.

## preferences_chirurgien

```
id                    uuid PK DEFAULT gen_random_uuid()
chirurgien_id         uuid NOT NULL
fiche_intervention_id uuid
titre                 text NOT NULL
description           text NOT NULL DEFAULT ''
preferences           jsonb NOT NULL DEFAULT '{}'
is_global             boolean NOT NULL DEFAULT false
tags                  text[] NOT NULL DEFAULT '{}'
created_at            timestamptz NOT NULL DEFAULT now()
updated_at            timestamptz NOT NULL DEFAULT now()
last_modified_by      uuid
is_dev                boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `id · chirurgien_id · content · created_at` → schéma réel très différent.

## transmissions

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
title            text NOT NULL
content          text NOT NULL DEFAULT ''
tags             text[] NOT NULL DEFAULT '{}'
priority         boolean NOT NULL DEFAULT false
status           text NOT NULL DEFAULT 'open'
type             text NOT NULL DEFAULT 'libre'
last_modified_by uuid
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
is_dev           boolean NOT NULL DEFAULT false
```

⚠ V1.6.0 disait `author_id` → le cloud a `user_id`.
⚠ Cloud a `title` (anglais) contrairement aux autres tables qui ont `titre` (français).

RLS SELECT (D-2026-03-20-T09) :
`USING ((status='published' AND is_approved()) OR user_id=auth.uid() OR is_admin())`

---

# 8 — TABLES MATÉRIEL

## materiel

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
category_id      uuid FK → categories(id)
nom              text NOT NULL
reference        text
description      text NOT NULL DEFAULT ''
statut           text NOT NULL DEFAULT 'disponible'
localisation     text
tags             text[] NOT NULL DEFAULT '{}'
priority         boolean NOT NULL DEFAULT false
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
last_modified_by uuid
is_dev           boolean NOT NULL DEFAULT false
materiel_type_id   uuid FK → materiel_types(id)
zone_anatomique_id uuid FK → zones_anatomiques(id)
zone_stockage_id   uuid FK → zones_stockage(id)
etagere_id         uuid FK → etageres(id)
```

⚠ V1.6.0 disait `name` → le cloud a `nom`.
4 colonnes FK ajoutées 2026-03-09 (D-BLOC FONDATION).

## materiel_types

```
id          uuid PK DEFAULT gen_random_uuid()
label       text NOT NULL
description text
color       text
icon        text
active      boolean DEFAULT true
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

## zones_anatomiques

```
id          uuid PK DEFAULT gen_random_uuid()
label       text NOT NULL
description text
color       text
icon        text
active      boolean DEFAULT true
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

## zones_stockage

```
id                 uuid PK DEFAULT gen_random_uuid()
label              text NOT NULL
zone_anatomique_id uuid FK → zones_anatomiques(id)
description        text
active             boolean DEFAULT true
created_at         timestamptz DEFAULT now()
updated_at         timestamptz DEFAULT now()
```

## etageres

```
id               uuid PK DEFAULT gen_random_uuid()
label            text NOT NULL
zone_stockage_id uuid FK → zones_stockage(id)
position         integer
active           boolean DEFAULT true
created_at       timestamptz DEFAULT now()
```

RLS (4 tables) : SELECT `is_approved()` + CRUD `is_admin()` (D-2026-03-20-T09).

## casaques

```
id                uuid PK DEFAULT gen_random_uuid()
user_id           uuid NOT NULL FK → auth.users
category_id       uuid FK → categories(id)
titre             text NOT NULL
description       text NOT NULL DEFAULT ''
categorie         text DEFAULT ''
taille_disponible text DEFAULT ''
renforcee         boolean NOT NULL DEFAULT false
specialite        text DEFAULT ''
localisation      text DEFAULT ''
remarques_usage   text DEFAULT ''
tags              text[] NOT NULL DEFAULT '{}'
status            text NOT NULL DEFAULT 'draft'
priority          boolean NOT NULL DEFAULT false
is_dev            boolean NOT NULL DEFAULT false
last_modified_by  uuid FK → auth.users
created_at        timestamptz NOT NULL DEFAULT now()
updated_at        timestamptz NOT NULL DEFAULT now()
```

RLS : `casaques_select_approved` (SELECT is_approved()) · `casaques_insert/update/delete_admin` (is_admin())

## gants

```
id                   uuid PK DEFAULT gen_random_uuid()
user_id              uuid NOT NULL FK → auth.users
category_id          uuid FK → categories(id)
titre                text NOT NULL
description          text NOT NULL DEFAULT ''
marque               text DEFAULT ''
modele               text DEFAULT ''
matiere              text DEFAULT ''
sans_latex           boolean NOT NULL DEFAULT false
couleurs_disponibles text DEFAULT ''
tailles_disponibles  text DEFAULT ''
localisation         text DEFAULT ''
remarques_usage      text DEFAULT ''
tags                 text[] NOT NULL DEFAULT '{}'
status               text NOT NULL DEFAULT 'draft'
priority             boolean NOT NULL DEFAULT false
is_dev               boolean NOT NULL DEFAULT false
last_modified_by     uuid FK → auth.users
created_at           timestamptz NOT NULL DEFAULT now()
updated_at           timestamptz NOT NULL DEFAULT now()
```

RLS : `gants_select_approved` (SELECT is_approved()) · `gants_insert/update/delete_admin` (is_admin())

---

# 9 — RELATIONS PRINCIPALES

```
profiles (table) → profiles_directory (table sans PK formelle)
profiles → fiches_intervention · cours · transmissions (via user_id)
content_types → categories → fiches · anatomie · installation · cours (via category_id/content_type_id)
tags → tag_links → contenus (via tag_id/content_id)
tags ←── tag_suggestions (workflow proposition admin)
glossaire ←── glossaire_suggestions (workflow proposition admin)
materiel_types → materiel (FK)
zones_anatomiques → zones_stockage → etageres → materiel (FK chain)
thesaurus_protocoles → thesaurus_interventions (protocole_id FK)
thesaurus_chirurgiens → thesaurus_interventions (chirurgien_id FK)
thesaurus_panseuses → thesaurus_interventions (panseuse_id FK)
paxis_campaigns → paxis_questions (campaign_id FK)
paxis_campaigns → paxis_sessions (campaign_id FK)
paxis_sessions → paxis_responses (session_id FK, CASCADE)
paxis_responses → paxis_responses (parent_response_id FK, self-ref follow-up)
auth.users → paxis_sessions (created_by FK)
auth.users → signalements (reporter_id FK nullable)
```

---

# 10 — ALIGNEMENT LOCAL / CLOUD

Règle absolue : `local = cloud`. Toute divergence → documentée + corrigée + journalisée.

Migrations versionnées : `02_INFRASTRUCTURE/SUPABASE/migrations/` (106+ fichiers, 000→106, audit 2026-04-06).

---

# 11 — TABLES CIBLES MIGRATION (MODULES NON SUPABASE)

Ces tables n'existent pas encore.

## planning (vague 3 — arbitrage A1 PENDING)

```
planning_weeks   : id · year · week · created_at
planning_slots   : id · week_id · salle · jour · creneau · flags
planning_atoms   : id · slot_id · role · personnel_code · doublure
planning_aliases : id · user_id · code · alias  (localStorage autorisé — UI locale)
```

## organisateur (vague 1)

```
parcours_phases    : id · title · items · order · created_by · created_at
parcours_templates : id · name · phases · created_at
```

## ~~paxis~~ — MIGRÉ → Section 24

Paxis migré Supabase cloud. Schéma complet : section 24.

## collab (vague 1 — arbitrage A4 PENDING)

```
collab_projects : id · title · description · status (default 'draft') · created_by · validated_by (nullable) · validated_at (nullable) · created_at · updated_at
collab_ideas    : id · project_id · content · quadrant · votes · created_at
```

## ~~disc~~ — MIGRÉ → Section 22

Disc migré Supabase cloud (migration 078). Schéma complet : section 22.

## ~~thesaurus~~ — MIGRÉ → Section 19

Thesaurus migré Supabase cloud (migrations 018→065). Schéma complet : section 19.

## ~~dork~~ — MIGRÉ → Section 21

Dork migré Supabase cloud (migration 077). Schéma complet : section 21.

---

# 12 — TABLES MÉTIER PHASE 2 (FICHES / ARSENAL / ANNUAIRE)

Tables définies, sourcées terrain, prêtes à migrer.
Source : `00_GOUVERNANCE/DATA_METIER/01_SCHEMA_DONNEES_CLAUDE.md`.

**Ordre de création :**
`poles → fabricants → zones_anatomiques → chirurgiens → casaques → secretaires → items → sutures → lames_scie → packs → blocs → thesaurus → tables pivot → preferences → logs_actions`

## 12.1 poles (4 lignes)

```sql
CREATE TABLE poles (
  id text PRIMARY KEY, nom text NOT NULL, color text, icon text,
  secteur text, ordre integer, actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
```

## 12.2 fabricants (16 lignes)

```sql
CREATE TABLE fabricants (
  id text PRIMARY KEY, nom text NOT NULL UNIQUE, type text, pays text,
  specialite text, actif boolean DEFAULT true, created_at timestamptz DEFAULT now()
);
```

## 12.3 chirurgiens (9 validés terrain)

```sql
CREATE TABLE chirurgiens (
  id text PRIMARY KEY, nom text NOT NULL, prenom text,
  pole_id text REFERENCES poles(id),
  tel_interne_perso text, casaque_simple_id text REFERENCES casaques(id),
  casaque_renforcee_id text REFERENCES casaques(id),
  housse_casque boolean DEFAULT false, masque_anti_buee boolean DEFAULT false,
  bottes_arthro boolean DEFAULT false, habitudes_bloc text,
  reglage_be_bip text, trigramme text UNIQUE,
  ordre_chronologique integer, actif boolean DEFAULT true,
  retirement_date date, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
```

⚠ `CHIR_FOURASTIER` (V7) absent du CSV — statut départ à confirmer.

## 12.4–12.12 : inchangés depuis V1.6.0

Voir `DATA_METIER/01_SCHEMA_DONNEES_CLAUDE.md` pour schémas complets :
secretaires · items · sutures · lames_scie · packs · blocs · tables pivot.

⚠ Quantités packs : **sacrées** — ne jamais modifier sans validation IBODE.

---

# 13 — TABLES MODULE CARNET_BORD

Référence : D-2026-03-15-T12 · CTX_CARNET_BORD.md v1.0.0
État : ✅ **Existe en base** (vérifié cloud 2026-03-22). Migration : 017_carnet_bord.sql.

## carnet_categories

```
id          uuid PK DEFAULT gen_random_uuid()
label       text NOT NULL
color       text NOT NULL DEFAULT '#6c757d'
icon        text NOT NULL DEFAULT 'bi-journal-medical'
position    integer NOT NULL DEFAULT 0
is_active   boolean NOT NULL DEFAULT true
created_by  uuid
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

## carnet_items

```
id          uuid PK DEFAULT gen_random_uuid()
category_id uuid NOT NULL FK → carnet_categories ON DELETE CASCADE
sous_groupe text
label       text NOT NULL
position    integer NOT NULL DEFAULT 0
is_active   boolean NOT NULL DEFAULT true
required    boolean NOT NULL DEFAULT false
resources   jsonb NOT NULL DEFAULT '[]'
mentor_ids  uuid[] NOT NULL DEFAULT '{}'
created_by  uuid
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

## carnet_progressions

```
id               uuid PK DEFAULT gen_random_uuid()
user_id          uuid NOT NULL FK → auth.users
item_id          uuid NOT NULL FK → carnet_items ON DELETE CASCADE
date_demo        date
date_accompagne  date
date_solo        date
niveau           text
note             text
last_activity_at timestamptz NOT NULL DEFAULT now()
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
CONSTRAINT uq_carnet_prog UNIQUE (user_id, item_id)
```

⚠ RÈGLE ABSOLUE : aucune lecture croisée entre membres. Permanente — ne pas assouplir sans JOURNAL.

---

# 14 — TABLE FONCTIONS_METIER

Référence : D-2026-03-30-T09. Migration : 071_fonctions_metier.sql.
Seed : 16 fonctions · 5 catégories.

## fonctions_metier

```
id          uuid PK DEFAULT gen_random_uuid()
code        text UNIQUE NOT NULL
label       text NOT NULL
categorie   text NOT NULL
             -- valeurs : Soignant · Médecin · Encadrement · Technique · Administratif
position    integer NOT NULL DEFAULT 0
is_active   boolean NOT NULL DEFAULT true
created_at  timestamptz NOT NULL DEFAULT now()
```

RLS : SELECT all · INSERT/UPDATE/DELETE admin (bdb_is_admin())
Consommée par : profiles.fonction (aligné sur code) · profiles_directory.fonction · window.bdbUser.fonction (bdb-shell.js v1.6.0)

---

# 15 — NAVIGATION BDB

Tables créées 2026-03-16. Référence D-2026-03-16-T03.
**Source de vérité unique de la navigation.** Ajouter un module = INSERT dans `app_modules`.

## app_groups

```
id          uuid PK DEFAULT gen_random_uuid()
key         text UNIQUE NOT NULL
label       text NOT NULL
description text
icon        text NOT NULL
color       text NOT NULL
position    integer NOT NULL DEFAULT 0
is_visible  boolean NOT NULL DEFAULT true
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

Seed : `bloc (#0d6efd·1)` · `equipe (#198754·2)` · `savoir (#6610f2·3)` · `pilotage (#dc3545·4)` · `espace_perso (#fd7e14·5)`

## app_modules

```
id          uuid PK DEFAULT gen_random_uuid()
key         text UNIQUE NOT NULL
label       text NOT NULL
description text
icon        text NOT NULL
color       text NOT NULL DEFAULT '#6c757d'
group_key   text FK → app_groups.key
path        text NOT NULL
position    integer NOT NULL DEFAULT 0
status      text NOT NULL DEFAULT 'active'
is_new      boolean NOT NULL DEFAULT false
new_until   date
visibility  text NOT NULL DEFAULT 'member'
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

**Valeurs status :** `active · coming_soon · maintenance`
**Valeurs visibility :** `member · admin · all`

Seed (21 modules — 18 active, 3 coming_soon) : voir migration 008_app_navigation.sql.

RLS : anon SELECT (active+all) · member SELECT (member+all OR admin) · admin ALL (bdb_is_admin)
**CRUD app_modules/app_groups : admin/ (D-2026-03-30-T11).** Supervision/ conserve lecture seule (annule D-2026-03-21-T01).

---

# 16 — TABLES INFRASTRUCTURE

## error_404_logs

```
id            uuid PK DEFAULT gen_random_uuid()
requested_url text NOT NULL
referrer      text
user_agent    text
user_id       uuid FK → auth.users (nullable)
created_at    timestamptz DEFAULT now()
```

Index : `idx_404_created ON (created_at DESC)` · `idx_404_url ON (requested_url)`
RLS : INSERT anon+auth · SELECT admin only

---

# 17 — TABLES MODULE SUPERVISION

Référence D-2026-03-21-T01. Vérifié terrain + cloud.
Accès : `bdb_is_admin()` exclusivement.

## supervision_config

```
id              uuid PK DEFAULT gen_random_uuid()
doc_key         text NOT NULL
version_active  text NOT NULL
version_draft   text
validated_by    uuid FK → auth.users
validated_at    timestamptz
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
```

## supervision_rules

```
id           uuid PK DEFAULT gen_random_uuid()
doc_key      text NOT NULL
version      text NOT NULL
rule_key     text NOT NULL
rule_label   text NOT NULL
rule_type    text NOT NULL
rule_pattern text
is_active    boolean NOT NULL DEFAULT false
created_at   timestamptz NOT NULL DEFAULT now()
```

## supervision_rule_delta

```
id           uuid PK DEFAULT gen_random_uuid()
doc_key      text NOT NULL
version_from text NOT NULL
version_to   text NOT NULL
rule_key     text NOT NULL
delta_type   text NOT NULL
old_value    text
new_value    text
status       text NOT NULL DEFAULT 'pending'
reviewed_by  uuid FK → auth.users
reviewed_at  timestamptz
created_at   timestamptz NOT NULL DEFAULT now()
```

## supervision_sessions

```
id          uuid PK DEFAULT gen_random_uuid()
module_key  text NOT NULL
objective   text NOT NULL
prompt_used text
notes       text
status      text NOT NULL DEFAULT 'planned'
created_by  uuid FK → auth.users
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

RLS (4 tables) : SELECT bdb_is_admin() · ALL bdb_is_admin()

---

# 18 — TABLES MODULE LIVRET D'ACCUEIL

Vérifié cloud 2026-03-22. Module embryonnaire.

## livret_secteurs (6 lignes)

```
id            uuid PK DEFAULT gen_random_uuid()
code          text NOT NULL
label         text NOT NULL
salles        text
qualif_salles text
effectif      text
description   text
actes         text
couleur_hex   text NOT NULL DEFAULT '#6c757d'
icone_bi      text NOT NULL DEFAULT 'bi-hospital'
position      integer NOT NULL DEFAULT 0
is_visible    boolean NOT NULL DEFAULT true
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

## livret_encadrement (9 lignes)

```
id            uuid PK DEFAULT gen_random_uuid()
profile_id    uuid FK → auth.users
nom_local     text
prenom_local  text
telephone     text
role_label    text NOT NULL
position      integer NOT NULL DEFAULT 0
is_visible    boolean NOT NULL DEFAULT true
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

## livret_objectifs_items (49 lignes)

```
id            uuid PK DEFAULT gen_random_uuid()
terme         text NOT NULL
domaine_key   text NOT NULL
domaine_label text NOT NULL
domaine_icone text NOT NULL DEFAULT 'bi-check-circle'
item_key      text NOT NULL
item_label    text NOT NULL
item_detail   text
position      integer NOT NULL DEFAULT 0
is_active     boolean NOT NULL DEFAULT true
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

## livret_progression (0 ligne)

```
id          uuid PK DEFAULT gen_random_uuid()
user_id     uuid NOT NULL FK → auth.users
item_key    text NOT NULL
statut      text NOT NULL
updated_at  timestamptz DEFAULT now()
```

RLS (4 tables) : anon SELECT · member SELECT · admin ALL (bdb_is_admin)
RLS livret_progression : member own read/write · admin read all

---

# 19 — TABLES MODULE OBJECTIFS

Vérifié cloud 2026-03-22. Module embryonnaire.

## objectifs_semaines (2 lignes)

```
id          uuid PK DEFAULT gen_random_uuid()
semaine_num integer NOT NULL
label       text NOT NULL
description text
position    integer NOT NULL DEFAULT 0
is_active   boolean NOT NULL DEFAULT true
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

## objectifs_criteres (39 lignes)

```
id              uuid PK DEFAULT gen_random_uuid()
semaine_id      uuid NOT NULL FK → objectifs_semaines(id)
objectif_num    integer NOT NULL
objectif_label  text NOT NULL
critere_num     integer NOT NULL
critere_label   text NOT NULL
critere_detail  text
item_key        text NOT NULL
position        integer NOT NULL DEFAULT 0
is_active       boolean NOT NULL DEFAULT true
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

## objectifs_evaluations (3 lignes)

```
id         uuid PK DEFAULT gen_random_uuid()
user_id    uuid NOT NULL FK → auth.users
item_key   text NOT NULL
statut     text NOT NULL
updated_at timestamptz DEFAULT now()
```

RLS : anon/member SELECT référentiels · member own read/write évaluations · admin read all

⚠ `item_key` partagé entre `livret_objectifs_items`, `livret_progression` et `objectifs_evaluations/criteres` — clé textuelle, pas FK formelle.

---

# 20 — TABLES MODULE THESAURUS

Migrations : 018 (DDL + RLS + INDEX + seeds + RPC) · 019 (enrichissement 420 protocoles CSV V4) · 020 (fix ACT-0360 + template 16 CCAM) · **021 (V2 schema : chirurgiens + panseuses + FK uuid + RGPD)** · **021d (insert 2026 — 894 lignes mapping complet)** · **022 (2 protocoles nerf ulnaire)** · **027→065 (Phase B staging pipeline — 88 827 lignes importées, 460 protocoles, 142 panseuses, ACT-0481)**

⚠ **INTERDIT RGPD** : ne JAMAIS afficher date précise + protocole + chirurgien simultanément.
⚠ **Dates tronquées YYYY-MM** — jours/horaires détruits dès première manipulation.
⚠ **Voie d'abord = dimension structurante** : 2 voies = 2 protocoles (S3).

---

## thesaurus_protocoles (460 lignes — dernier ACT-0481)

Référentiel des actes chirurgicaux. Source de vérité nommage.
Conventions nommage V2.3.0 : S1→S4, C1→C7, R1→R16.
UNIQUE constraint : (libelle_cible, specialite) depuis migration 061b.

```
id                            uuid PK NOT NULL DEFAULT gen_random_uuid()
id_protocole                  text NOT NULL UNIQUE
libelle_cible                 text NOT NULL
type                          text NOT NULL DEFAULT ''
                              -- valeurs : ORTHO | TRAUMATO | SEPTIQUE | NEURO | EXCLUS
zone_anat                     text NOT NULL DEFAULT ''
cat_parent                    text NOT NULL DEFAULT ''
                              -- hiérarchie S2 séparateur > (ex: PROTHÈSE > HANCHE)
specialite                    text NOT NULL DEFAULT ''
frequence                     integer NOT NULL DEFAULT 0
pareto                        text NOT NULL DEFAULT ''
                              -- valeurs : Critique | Standard | Secondaire | Rare
duree_minutes                 integer NULL
pathologie                    text NOT NULL DEFAULT ''
alertes                       text NOT NULL DEFAULT ''
synonymes_recherche           text NOT NULL DEFAULT ''
                              -- séparateur pipe | (split /[,|]/)
codes_ccam                    text NOT NULL DEFAULT ''
definition_expert             text NOT NULL DEFAULT ''
libelles_sources_lies         text NOT NULL DEFAULT ''
proposition_nouvel_acte_label text NOT NULL DEFAULT ''
created_at                    timestamptz NOT NULL DEFAULT now()
updated_at                    timestamptz NOT NULL DEFAULT now()
```

RLS : anon SELECT · authenticated SELECT · admin ALL (via bdb_is_admin()).

---

## thesaurus_chirurgiens (12 lignes : 10 actifs + 2 retraités)

```
id               uuid PK NOT NULL DEFAULT gen_random_uuid()
nom              text NOT NULL
prenom           text NOT NULL DEFAULT ''
profile_id       uuid NULL
specialite       text NOT NULL DEFAULT 'ORTHOPEDIE'
actif            boolean NOT NULL DEFAULT true
retirement_date  date NULL
created_at       timestamptz NOT NULL DEFAULT now()
```

⚠ Chirurgiens retraités : actif=false + retirement_date renseignée. Jamais supprimer (FK historique).

---

## thesaurus_panseuses (142 lignes)

```
id               uuid PK NOT NULL DEFAULT gen_random_uuid()
nom              text NOT NULL
prenom           text NOT NULL DEFAULT ''
profile_id       uuid NULL
profil           text NOT NULL DEFAULT 'IDE'
role_bloc        text NOT NULL DEFAULT 'panseur'
secteur          text NOT NULL DEFAULT 'ortho'
actif            boolean NOT NULL DEFAULT true
note             text NOT NULL DEFAULT ''
created_at       timestamptz NOT NULL DEFAULT now()
```

---

## thesaurus_interventions (89 721 lignes — Phase B TERMINÉE)

```
id                   uuid PK NOT NULL DEFAULT gen_random_uuid()
chirurgien           text NULL        -- LEGACY V1
date_intervention    date NOT NULL    -- RGPD : YYYY-MM-01
protocole_operatoire text NULL        -- LEGACY V1
specialite           text NULL        -- LEGACY V1
protocole_id         uuid NULL FK → thesaurus_protocoles(id)
chirurgien_id        uuid NULL FK → thesaurus_chirurgiens(id)
panseuse_id          uuid NULL FK → thesaurus_panseuses(id)
lateralite           text NULL
note                 text NOT NULL DEFAULT ''
created_at           timestamptz NOT NULL DEFAULT now()
```

RLS : anon SELECT · authenticated SELECT · admin ALL.

---

## thesaurus_fiches_papier (391 fiches)

```
id                  uuid PK NOT NULL DEFAULT gen_random_uuid()
chirurgien          text NOT NULL
nom_fichier         text NOT NULL
chemin_relatif      text NOT NULL DEFAULT ''
protocole_id        uuid NULL FK → thesaurus_protocoles(id)
id_protocole_match  text NOT NULL DEFAULT ''
libelle_cible_match text NOT NULL DEFAULT ''
score               numeric(4,3) NOT NULL DEFAULT 0
via                 text NOT NULL DEFAULT 'libelle'
statut              text NOT NULL DEFAULT 'A valider (fort)'
notes               text NOT NULL DEFAULT ''
nom_nettoye         text NOT NULL DEFAULT ''
created_at          timestamptz NOT NULL DEFAULT now()
updated_at          timestamptz NOT NULL DEFAULT now()
```

UNIQUE (chirurgien, nom_fichier).
Statuts : `A valider (fort)` · `A valider (faible)` · `Rapproche` · `Sans correspondance` · `Hors scope`

---

## referentiel_ccam (8 292 lignes — ATIH V82 2025)

```
id                uuid PK DEFAULT gen_random_uuid()
code_ccam         text NOT NULL UNIQUE
libelle           text NOT NULL DEFAULT ''
chapitre          text NOT NULL DEFAULT ''
chapitre_libelle  text NOT NULL DEFAULT ''
section           text NOT NULL DEFAULT ''
sous_section      text NOT NULL DEFAULT ''
activite          text NOT NULL DEFAULT ''
phase             text NOT NULL DEFAULT ''
regroupement      text NOT NULL DEFAULT ''
created_at        timestamptz NOT NULL DEFAULT now()
```

RLS : anon SELECT, authenticated SELECT, admin ALL via bdb_is_admin().

---

## protocole_ccam (259 liens N:N)

```
id            uuid PK DEFAULT gen_random_uuid()
protocole_id  uuid NOT NULL FK → thesaurus_protocoles(id) ON DELETE CASCADE
ccam_acte_id  uuid NOT NULL FK → referentiel_ccam(id) ON DELETE CASCADE
rang          integer
notes         text
created_at    timestamptz NOT NULL DEFAULT now()
```

Trigger : sync_codes_ccam() — AFTER INSERT OR DELETE → UPDATE thesaurus_protocoles.codes_ccam

---

## RPC thesaurus (3 fonctions)

- `thesaurus_distinct_chirurgiens` — retourne TOUS (actifs + retraités)
- `thesaurus_distinct_annees` — DISTINCT annees interventions DESC
- `thesaurus_distinct_panseuses` — filtre actif=true uniquement

---

## Relations THESAURUS

```
thesaurus_protocoles  ──1:N──→ thesaurus_interventions (protocole_id)
thesaurus_chirurgiens ──1:N──→ thesaurus_interventions (chirurgien_id)
thesaurus_panseuses   ──1:N──→ thesaurus_interventions (panseuse_id)
thesaurus_protocoles  ──1:N──→ thesaurus_fiches_papier (protocole_id FK optionnel)
thesaurus_protocoles  ──N:N──→ referentiel_ccam (via protocole_ccam)
```

---

## Migrations thesaurus (historique)

| Migration | Contenu | Lignes |
|---|---|---|
| 018 | DDL + RLS + INDEX + seeds + RPC V1 | ~420 protocoles |
| 019 | Enrichissement CSV V4 | 420 updates |
| 020 | Fix ACT-0360 + template 16 CCAM | 16 updates |
| **021** | **V2 schema : chirurgiens + panseuses + FK uuid + RGPD** | DDL |
| **021d** | **Insert 2026 : 894 lignes mapping OPTIM→BDB** | 894 inserts |
| **022** | **2 protocoles nerf ulnaire** | 2 inserts |
| **027→065** | **Phase B staging pipeline complet** | 88 827 lignes |
| **070** | **DDL thesaurus_fiches_papier** | DDL |
| **083** | **nom_nettoye + purge hors scope** | ALTER + DELETE 26 |
| **084** | **referentiel_ccam ATIH V82** | DDL + 8 292 inserts |
| **085** | **protocole_ccam FK → referentiel_ccam** | ALTER FK |
| **086** | **DROP ccam_ot_actes + ccam_ot_hierarchie** | DROP × 2 |
| **087** | **trigger sync_codes_ccam + seed 259 liens** | FUNCTION + TRIGGER + INSERT |
| **090** | **INSERT 32 bdb_principes UX** | 32 inserts |

---

# 21 — TABLES MODULE DORK

Migration 077 — 2026-04-01. Arbitrage A2-dork SOLDÉ.

## dork_operators (11 lignes)

```
id · label · description · syntax · icon · position · created_at · updated_at
```
RLS : SELECT authenticated · ALL admin

## dork_filetypes (9 lignes)

```
id · label · extension · css_classes · position · created_at · updated_at
```
RLS : SELECT authenticated · ALL admin

## dork_profiles (user-scoped)

```
id · user_id FK auth.users · label · icon · description
keywords text[] · exclusions text[] · enabled_operator_ids uuid[] · enabled_filetype_ids uuid[]
is_default boolean · position integer · created_at · updated_at
```
RLS : ALL own (user_id = auth.uid())

## dork_sources (FK profil)

```
id · profile_id FK dork_profiles CASCADE · label · domains text[]
weight int CHECK(1-5) · category text · position · created_at · updated_at
```
RLS : ALL own via jointure

## dork_history (max 25 applicatif)

```
id · user_id FK auth.users · profile_id FK dork_profiles SET NULL
label · query · url · config jsonb · rating int CHECK(0-5)
validated boolean · tags text[] · created_at · last_used
```
RLS : ALL own

## Relations DORK

```
auth.users ──1:N──→ dork_profiles (user_id)
dork_profiles ──1:N──→ dork_sources (profile_id, CASCADE)
auth.users ──1:N──→ dork_history (user_id)
```

---

# 22 — TABLES MODULE DISC

Migration 078 — 2026-04-02 (session #26).
21 tables + 1 RPC. Convention zéro jsonb respectée.

### Partie A — Personas & scénarios (14 tables)

disc_personas · disc_savoir_etre · disc_at_etats · disc_meta_programmes
disc_scenarios · disc_scenario_personnages · disc_scenes
disc_scene_faits · disc_scene_savoir_etre · disc_scene_bascules · disc_scene_debriefs
disc_scene_at · disc_scene_vakog · disc_scene_recadrages

Voir V1.17.0 pour le détail complet des colonnes.

### Partie B — Multi-user (7 tables)

disc_profils (1/user) · disc_tests · disc_test_reponses
disc_conclusions (1/user) · disc_conclusion_forces · disc_conclusion_vigilances
disc_compatibilites (16 paires seed)

### RPC disc_distribution()

SECURITY DEFINER. Retourne disc_dominant + count + vakog_primary + count.
Zéro user_id dans le résultat (DISC-01).

### Relations DISC

```
auth.users ──1:1──→ disc_profils (user_id UNIQUE)
auth.users ──1:N──→ disc_tests (user_id)
disc_tests ──1:N──→ disc_test_reponses (test_id)
auth.users ──1:1──→ disc_conclusions (user_id UNIQUE)
disc_conclusions ──1:N──→ disc_conclusion_forces|vigilances (conclusion_id)
```

| Migration | Contenu |
|---|---|
| **078** | DDL 21 tables + RLS (58 policies) + 5 triggers + 6 index + RPC + seed |

---

# 23 — TABLE BDB_PRINCIPES

Table L1 transverse (Manifeste §6). Voyage avec chaque instance.
Migration : 082 (session #28).
Seed L1 : 20 règles nommage + 32 règles UX Premium = 52 lignes.

```
id          uuid        PK NOT NULL DEFAULT gen_random_uuid()
code        text        NOT NULL UNIQUE
domaine     text        NOT NULL   -- 'NOMMAGE_PROTOCOLE' | 'CLINIQUE' | 'ARCHITECTURE' | 'PROCESS' | 'UX'
categorie   text        NOT NULL
titre       text        NOT NULL
regle       text        NOT NULL
exemple_ok  text        NULL
exemple_nok text        NULL
scope       text        NOT NULL DEFAULT 'L1'   -- CHECK (IN ('L1', 'L2'))
actif       boolean     NOT NULL DEFAULT true
position    integer     NOT NULL DEFAULT 0
created_at  timestamptz NOT NULL DEFAULT now()
```

RLS : anon SELECT (actif=true AND scope='L1') · authenticated SELECT (actif=true) · admin ALL

Seed L1 : S1/S1a/S2/S2a/S3/S4/S4a/VA/R01/R03→R09/R11/R15/R25/R28 (20 règles nommage)
Seed UX : UX01→UX32 (32 règles, migration 090, domaine UX)

---

# 24 — TABLES MODULE PAXIS

Réf : D-2026-04-02-PAXIS-SUPABASE · D-2026-04-02-PAXIS-ADMIN.
4 tables. RÈGLE-PAXIS-04 : zéro scoring, zéro rating (outil réflexif, jamais évaluatif).

## paxis_campaigns (1 ligne seed initiale)

```
id · title · description · status(draft|active|closed) · created_by FK auth.users
created_at · updated_at · closed_at
```

Seed : 1 campagne (id fixe 00000000-0000-0000-0000-000000000001).
RLS : member SELECT (status='active') · admin ALL

## paxis_questions (21 lignes seed)

```
id · code UNIQUE · type · text · roles text[] · depth int · position int
is_active boolean · campaign_id FK paxis_campaigns · created_at · updated_at
```

## paxis_sessions

```
id · created_by FK auth.users · role · started_at · completed_at
iteration int · campaign_id FK paxis_campaigns · created_at · updated_at
```

## paxis_responses

```
id · session_id FK paxis_sessions CASCADE · question_id FK paxis_questions
question_text · question_type · response_text · status(skipped|...)
is_generated boolean · parent_response_id FK paxis_responses (self-ref) · depth · position · created_at
```

⚠ question_text toujours stocké (RÈGLE-PAXIS-07).

## Relations PAXIS

```
paxis_campaigns ──1:N──→ paxis_questions (campaign_id)
paxis_campaigns ──1:N──→ paxis_sessions (campaign_id)
auth.users ──1:N──→ paxis_sessions (created_by)
paxis_sessions ──1:N──→ paxis_responses (session_id, CASCADE)
paxis_questions ──1:N──→ paxis_responses (question_id)
paxis_responses ──1:N──→ paxis_responses (parent_response_id, self-ref)
```

---

# 25 — TABLE SIGNALEMENTS

Migration : 106 (2026-04-06, session #44).
Accès : INSERT anon+authenticated · SELECT/UPDATE/DELETE bdb_is_admin().
Bouton flottant universel injecté par bdb-shell.js v1.8.0 (step 12 `_initSignalement()`).
Portail index.html : js/bdb-signalement.js autonome (bdb-shell non chargé à la racine).

## signalements

```
id              uuid        PK NOT NULL DEFAULT gen_random_uuid()
type            text        NOT NULL CHECK (IN ('contenu','bug','typo'))
module_cible    text        NOT NULL        -- clé module ex: 'disc', 'thesaurus', 'app'
entite_type     text        NOT NULL        -- 'page', 'protocole', 'terme', 'fiche_papier'
entite_id       uuid        NULL            -- FK souple vers l'entité signalée
entite_label    text        NULL            -- libellé capturé au moment du signalement
description     text        NOT NULL CHECK (length(trim(description)) >= 5)
url_contexte    text        NULL            -- window.location.href auto-capturé
user_agent      text        NULL            -- navigator.userAgent (200 chars max)
honeypot        text        NULL CHECK (honeypot IS NULL OR honeypot = '')
statut          text        NOT NULL DEFAULT 'ouvert'
                            CHECK (IN ('ouvert','en_cours','resolu','rejete'))
resolution      text        NULL            -- note admin à la résolution
reporter_id     uuid        NULL FK → auth.users  -- NULL = invité non connecté
reporter_email  text        NULL            -- optionnel pour invité
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()  -- géré par trigger
```

Index :
- `idx_signalements_statut ON (statut)`
- `idx_signalements_reporter ON (reporter_id) WHERE reporter_id IS NOT NULL`
- `idx_signalements_created ON (created_at DESC)`
- `idx_signalements_module ON (module_cible, statut)`

RLS :
- INSERT anon+authenticated : `honeypot IS NULL AND (reporter_id IS NULL OR count/heure < 5)`
- SELECT authenticated : `bdb_is_admin()`
- UPDATE authenticated : `bdb_is_admin()`
- DELETE authenticated : `bdb_is_admin()`

## RPC signalements_stats()

```sql
SECURITY DEFINER. Retourne JSON :
{ total, ouverts, en_cours, resolus, rejetes, cette_semaine }
```

Usage : badge rouge admin (compteur `ouverts`). Slot admin à implémenter (session #45).

## Notes d'usage

- **reporter_id** tracé pour futur rôle testeur/rédacteur
- **Évolutions** membres → `collab_ideas` (pas cette table)
- **Anti-spam** : honeypot field (invisible) + délai 3s côté JS avant submit actif
- **Workflow** : direct sans draft (CONV-SIGNALEMENT-01) — pas de RÈGLE-WORKFLOW-01 ici
- **Restant** : slot admin badge rouge + CRUD statut + résolution (session #45)


---

# HISTORIQUE

```
2026-04-10 — v1.20.0 Section 4 : glossaire — 6 colonnes additives (migration 139).
             Fusion glossaire_chirurgie (435 termes OQLF+FCO) dans glossaire.
             Section 26 supprimée (glossaire_chirurgie droppée).
             Réf : D-2026-04-10-S70-01, D-2026-04-10-S70-02.
2026-03-09 — v1.0.0  Création modèle global Supabase BDB.
2026-03-09 — v1.1.0  Colonnes réelles premières tables. Section 11.
2026-03-12 — v1.2.0  Section 12 : 14 tables métier Phase 2.
2026-03-15 — v1.3.0  Section 13 : 3 tables carnet_bord. Arbitrages soldés.
2026-03-16 — v1.4.0  Section 14 : app_groups + app_modules.
2026-03-21 — v1.5.0  Section 15-16 : error_404_logs + supervision. RLS fixes.
2026-03-21 — v1.6.0  Section 4 : glossaire corrigé. Section 8 : casaques/gants.
                      Section 17-18 : livret + objectifs.
2026-03-22 — v1.7.0  RÉÉCRITURE MAJEURE — audit cloud information_schema.
                      33 tables vérifiées colonne par colonne.
2026-03-24 — v1.8.0  Section 19 : thesaurus V2 complet. Migrations 018→065.
2026-03-29 — v1.9.0  Section 19 : chiffres thesaurus post-Phase B.
2026-03-30 — v1.10.0 Section 19 : thesaurus_fiches_papier (migration 070).
2026-04-01 — v1.12.0 Section 21 : dork V1 complet (migration 077).
2026-04-02 — v1.13.0 Section 22 : disc V1 complet (migration 078).
2026-04-03 — v1.14.0 Section 23 : bdb_principes (migration 082).
2026-04-03 — v1.15.0 Section 20 : referentiel_ccam ATIH V82 + protocole_ccam (084→087).
2026-04-04 — v1.16.0 Section 24 : paxis V1 complet (4 tables). Migration 090.
2026-04-05 — v1.17.0 Section 4 : glossaire V2 (variantes, categorie, is_propagated).
                      Section 23 : bdb_principes 20→52 (seed UX Premium UX01-UX32).
2026-04-06 — v1.18.0 Section 25 : signalements (migration 106).
                      bdb-shell.js v1.8.0 step 12 _initSignalement().
                      js/bdb-signalement.js autonome (portail index.html).
                      Migrations 000→106. Réf : D-2026-04-06-S44-01.
2026-04-10 — v1.18.0 Section 11 : collab_projects — 4 colonnes manquantes ajoutées
             (status, validated_by, validated_at, updated_at). Audit terrain 2026-04-10.
             Compteur migrations inchangé (correction documentaire, zéro SQL).
2026-04-10 — v1.19.0 Section 26 : glossaire_chirurgie — 435 termes chirurgicaux.
             Sources OQLF 2019 (379) + FCO 2015 (56). 20 colonnes. Migrations 123-138 + 136b.
             Réf : D-2026-04-10-GLOSS-01.
```
