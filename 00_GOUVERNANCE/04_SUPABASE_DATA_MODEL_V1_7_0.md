# SUPABASE_DATA_MODEL.md
```
VERSION  : 1.7.0
DATE     : 2026-03-22
STATUT   : CANON — MODÈLE DE DONNÉES GLOBAL BDB
PORTÉE   : Supabase cloud (source de vérité permanente)
DELTA    : RÉÉCRITURE MAJEURE — audit cloud information_schema.columns 2026-03-22.
           33 tables auditées. ~80 divergences corrigées.
           profiles = 25 colonnes (pas 3). profiles_directory = VUE.
           Enums : app_role · tag_type. Pattern éditorial Lovable documenté.
           Sections 3-8 entièrement réécrites depuis le cloud.
           Section 13 carnet_bord : statut "À créer" → "Existe en base".
           Dettes DT1/DT2/DT3 soldées.
```

---

# 1 — RÔLE DU DOCUMENT

Ce document définit le **modèle de données global de BDB**.

Objectifs :
- documenter les tables Supabase (source : cloud réel, pas le code)
- définir les relations autorisées
- empêcher les dérives de schéma
- aligner local et cloud

Ce document complète : NOYAU_VERITE · CTX_SYSTEM_ARCHITECTURE · CTX modules · JOURNAL_DECISIONS

**Règle V1.7.0** : chaque colonne documentée ici a été vérifiée par `information_schema.columns`
sur le cloud `ecpzrygzdugwwkqbsajn.supabase.co` le 2026-03-22.

---

# 2 — PRINCIPES DU MODÈLE

## 2.1 Supabase exclusif

Toutes les données métier persistantes → Supabase.

Exceptions temporaires (migration planifiée) :
```
planning · disc · paxis · collab · organisateur · dork · thesaurus
```

## 2.2 Tables transverses

Partagées par tous les modules — colonne vertébrale du système. Jamais dupliquer.

```
profiles · user_roles
content_types · categories · tags · tag_links · content_images · content_relations
app_groups · app_modules
```

⚠ `profiles_directory` est une VUE sur `profiles`, pas une table.

## 2.3 Enums PostgreSQL

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'membre');
CREATE TYPE public.tag_type AS ENUM ('libre', 'fonction', 'anatomie', 'materiel', 'instrument');
```

⚠ ALERTE : `app_role` utilise `'membre'` (FR), pas `'member'` (EN).
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
secretaires_list        jsonb NOT NULL DEFAULT '[]'
```

RLS : SELECT public · UPDATE own (user_id=uid()) · ALL admin

## profiles_directory = VUE sur profiles

```sql
CREATE OR REPLACE VIEW public.profiles_directory AS
SELECT user_id, id, name, initials, nom, prenom, fonction,
  avatar_url, bio, couleur_preferentielle, taille_gants,
  casaque_id, porte_casque, signes_particuliers, secretaires,
  secretaires_list, telephone_principal, telephone_secondaire,
  known_as, gant_paire_1_id, gant_paire_2_id, approved,
  is_dev, created_at, updated_at, email
FROM public.profiles;
```

Preuve : `id` est nullable dans `information_schema.columns` → impossible pour une table PK.
⚠ `approved` est dans `profiles` (via la vue). PAS dans `user_roles`.

## user_roles

```
id          uuid PK DEFAULT gen_random_uuid()
user_id     uuid NOT NULL FK → auth.users
role        app_role NOT NULL DEFAULT 'membre'
created_at  timestamptz NOT NULL DEFAULT now()
```

⚠ Enum `app_role` : valeurs `'admin'` | `'membre'` (français, pas anglais).

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
id           uuid PK DEFAULT gen_random_uuid()
abbreviation text NOT NULL
definition   text NOT NULL DEFAULT ''
usage_notes  text DEFAULT ''
created_by   uuid FK → auth.users
created_at   timestamptz NOT NULL DEFAULT now()
updated_at   timestamptz NOT NULL DEFAULT now()
```

RLS : anon SELECT · member SELECT · admin ALL (bdb_is_admin)

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
profiles (table) → profiles_directory (vue)
profiles → fiches_intervention · cours · transmissions (via user_id)
content_types → categories → fiches · anatomie · installation · cours (via category_id/content_type_id)
tags → tag_links → contenus (via tag_id/content_id)
tags ←── tag_suggestions (workflow proposition admin)
glossaire ←── glossaire_suggestions (workflow proposition admin)
materiel_types → materiel (FK)
zones_anatomiques → zones_stockage → etageres → materiel (FK chain)
```

---

# 10 — ALIGNEMENT LOCAL / CLOUD

Règle absolue : `local = cloud`. Toute divergence → documentée + corrigée + journalisée.

Migrations versionnées : `02_INFRASTRUCTURE/SUPABASE/migrations/` (18 fichiers V2, audit 2026-03-22).

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

## paxis (vague 1)

```
paxis_sessions : id · user_id · answers · created_at
paxis_exports  : id · session_id · format · created_at
```

## collab (vague 1 — arbitrage A4 PENDING)

```
collab_projects : id · title · description · created_by · created_at
collab_ideas    : id · project_id · content · quadrant · votes · created_at
```

## disc (vague 2 — arbitrage A2 PENDING)

```
disc_personas  : id · user_id · name · scores · created_at
disc_scenarios : id · title · content · created_at
```

## thesaurus (arbitrage VALIDÉ — session dédiée)

```
thesaurus_interventions (70 361 lignes) + thesaurus_protocoles (420 lignes)
SQL disponible : thesaurus_schema.sql + thesaurus_interventions.sql + thesaurus_protocoles.sql
```

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

# 14 — NAVIGATION BDB

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
**CRUD app_modules/app_groups : supervision/ exclusivement** (D-2026-03-21-T01).

---

# 15 — TABLES INFRASTRUCTURE

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

# 16 — TABLES MODULE SUPERVISION

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

# 17 — TABLES MODULE LIVRET D'ACCUEIL

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

# 18 — TABLES MODULE OBJECTIFS

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

# HISTORIQUE

```
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
                      profiles : 3 → 25 colonnes. profiles_directory = VUE.
                      Enums app_role + tag_type documentés.
                      tags : name/locked → label_display/label_normalized/is_locked.
                      content_images : url/caption → storage_path/position/is_dev.
                      content_relations : source_type/target_type → source_type_id/target_type_id.
                      Toutes tables métier : pattern éditorial Lovable complet.
                      anatomie.zone → region. cours.content → contenu.
                      transmissions.author_id → user_id. materiel.name → nom.
                      carnet_bord : "À créer" → "Existe en base".
                      Dettes DT1/DT2/DT3 soldées.
                      18 fichiers migrations V2 alignés.
```
