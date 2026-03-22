# AUDIT CONFORMITÉ CLOUD — Phase 0 Étape 4

```
VERSION  : 1.0.0
DATE     : 2026-03-22
SOURCE   : information_schema.columns du cloud ecpzrygzdugwwkqbsajn
CROISÉ   : migrations/ (17 fichiers) + SUPABASE_DATA_MODEL V1.6.0
```

---

## RÉSUMÉ EXÉCUTIF

**33 tables** en cloud. **Divergences massives** entre DATA_MODEL V1.6.0 et la réalité.

Le DATA_MODEL documentait des schémas simplifiés. Le cloud a les vrais schémas Lovable
(beaucoup plus riches). Les migrations 000-016 doivent être corrigées pour refléter le terrain.

| Catégorie | Nombre |
|---|---|
| Tables conformes (migration = cloud) | 12 |
| Tables avec divergences colonnes | 15 |
| Tables existantes non documentées dans migrations | 3 (carnet_*) |
| Tables dans migrations absentes du cloud | 0 |
| Dettes DATA_MODEL confirmées | 3 (DT1 + DT2 + DT3) |
| Nouvelles dettes découvertes | 12 |

---

## TABLES CONFORMES ✅ (migration = cloud)

| Table | Migration | Commentaire |
|---|---|---|
| casaques | 005 | ✅ parfait |
| gants | 005 | ✅ parfait |
| glossaire | 006 | ✅ parfait |
| glossaire_suggestions | 012 | ✅ parfait — CONFIRMÉ exécuté |
| tag_suggestions | 012 | ✅ parfait — CONFIRMÉ exécuté |
| livret_secteurs | 014 | ✅ parfait |
| livret_encadrement | 014 | ✅ parfait |
| livret_objectifs_items | 014 | ✅ parfait |
| livret_progression | 014 | ✅ parfait |
| objectifs_semaines | 015 | ✅ parfait |
| objectifs_criteres | 015 | ✅ parfait |
| objectifs_evaluations | 015 | ✅ parfait |

---

## TABLES EXISTANTES NON COUVERTES PAR LES MIGRATIONS

| Table | Colonnes cloud | Note |
|---|---|---|
| carnet_categories | id · label · color · icon · position · is_active · created_by · created_at · updated_at | DATA_MODEL §13 disait "À créer" — DÉJÀ CRÉÉ |
| carnet_items | id · category_id · sous_groupe · label · position · is_active · required · resources · mentor_ids · created_by · created_at · updated_at | idem |
| carnet_progressions | id · user_id · item_id · date_demo · date_accompagne · date_solo · niveau · note · last_activity_at · created_at · updated_at | idem |

**→ ACTION : créer migration 017_carnet_bord.sql avec le schéma réel cloud.**

---

## DIVERGENCES PAR TABLE

### CRITIQUE — Schéma Lovable beaucoup plus riche que documenté

Ces tables ont le vrai schéma Lovable avec colonnes éditoriales (user_id, category_id,
tags[], status, is_dev, last_modified_by, updated_at) que le DATA_MODEL ne documentait pas.

#### anatomie (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| title | ✅ | ❌ `titre` | CORRIGER → titre |
| zone | ✅ | ❌ `region` | CORRIGER → region |
| created_by | ✅ | ❌ `user_id` | CORRIGER → user_id |
| — | absent | `category_id` uuid | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |
| description | text | text NOT NULL DEFAULT '' | CORRIGER default |

#### fiches_intervention (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| title | ✅ | ❌ `titre` | CORRIGER → titre |
| created_by | ✅ | ❌ `user_id` | CORRIGER → user_id |
| — | absent | `etapes` jsonb DEFAULT '[]' | AJOUTER |
| — | absent | `duree_estimee` integer | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |
| description | text | text NOT NULL DEFAULT '' | CORRIGER |

#### cours (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| title | ✅ | ❌ `titre` | CORRIGER → titre |
| content | ✅ | ❌ `contenu` | CORRIGER → contenu |
| created_by | ✅ | ❌ `user_id` | CORRIGER → user_id |
| — | absent | `description` text DEFAULT '' | AJOUTER |
| — | absent | `niveau` text DEFAULT 'debutant' | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `status` text DEFAULT 'draft' | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### installation_patient (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| title | ✅ | ❌ `titre` | CORRIGER → titre |
| created_by | ✅ | ❌ `user_id` | CORRIGER → user_id |
| — | absent | `category_id` uuid | AJOUTER |
| — | absent | `precautions` text | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### transmissions (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| author_id | ✅ | ❌ `user_id` | CORRIGER → user_id |
| content | ✅ | ✅ `content` | OK |
| — | absent | `category_id` uuid | AJOUTER |
| — | absent | `title` text NOT NULL | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `type` text DEFAULT 'libre' | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### preferences_chirurgien (migration 003)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| content | ✅ | ❌ absent | SUPPRIMER |
| — | absent | `fiche_intervention_id` uuid | AJOUTER |
| — | absent | `titre` text NOT NULL | AJOUTER |
| — | absent | `description` text DEFAULT '' | AJOUTER |
| — | absent | `preferences` jsonb DEFAULT '{}' | AJOUTER |
| — | absent | `is_global` boolean DEFAULT false | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### materiel (migration 004)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| name | ✅ | ❌ `nom` | CORRIGER → nom |
| — | absent | `user_id` uuid NOT NULL | AJOUTER |
| — | absent | `category_id` uuid | AJOUTER |
| — | absent | `statut` text DEFAULT 'disponible' | AJOUTER |
| — | absent | `localisation` text | AJOUTER |
| — | absent | `tags` text[] | AJOUTER |
| — | absent | `priority` boolean DEFAULT false | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |
| — | absent | `last_modified_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

### HAUTE — Schéma structurel différent

#### tags (migration 002) — DETTE DT1 CONFIRMÉE + PLUS

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| name | ✅ | ❌ `label_display` + `label_normalized` | CORRIGER |
| locked | ✅ | ❌ `is_locked` | CORRIGER → is_locked |
| type | text | USER-DEFINED `tag_type` enum | CORRIGER → enum |
| — | absent | `glossary_id` uuid | AJOUTER |
| — | absent | `created_by` uuid | AJOUTER |

#### content_images (migration 002) — DETTE DT2 CONFIRMÉE

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| content_type | text | ❌ `content_type_id` uuid | CORRIGER |
| url | text | ❌ `storage_path` text | CORRIGER |
| caption | text | ❌ absent | SUPPRIMER |
| — | absent | `position` integer DEFAULT 1 | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### content_relations (migration 002)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| source_type | text | ❌ `source_type_id` uuid | CORRIGER |
| target_type | text | ❌ `target_type_id` uuid | CORRIGER |
| — | absent | `created_by` uuid | AJOUTER |
| — | absent | `is_dev` boolean | AJOUTER |

#### content_types (migration 002)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| name | text | ❌ `code` text + `label` text | CORRIGER |
| description | text | ❌ absent | SUPPRIMER |
| — | absent | `icon` text DEFAULT 'FileText' | AJOUTER |
| — | absent | `color` text DEFAULT 'blue' | AJOUTER |
| — | absent | `active` boolean DEFAULT true | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |

#### categories (migration 002)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| name | text | ❌ `label` text | CORRIGER |
| description | text | ❌ absent | SUPPRIMER |
| — | absent | `icon` text DEFAULT 'FileText' | AJOUTER |
| — | absent | `color` text DEFAULT 'blue' | AJOUTER |
| — | absent | `active` boolean DEFAULT true | AJOUTER |
| — | absent | `updated_at` timestamptz | AJOUTER |

#### profiles (migration 001)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| — | 3 colonnes | 25 colonnes | RÉÉCRIRE COMPLÈTEMENT |

Cloud a : id · user_id · email · name · initials · nom · prenom · fonction ·
avatar_url · created_at · updated_at · approved · bio · known_as ·
signes_particuliers · is_dev · telephone_principal · telephone_secondaire ·
secretaires · taille_gants · couleur_preferentielle · gant_paire_1_id ·
gant_paire_2_id · casaque_id · porte_casque · secretaires_list

**→ profiles est la VRAIE table utilisateur, pas un simple stub auth.**

#### profiles_directory — PROBABLEMENT UNE VUE

Cloud : `id` est nullable (YES) → impossible pour une table avec PK.
Colonnes identiques à `profiles` + quelques ajouts.

**→ profiles_directory est très probablement une VUE sur profiles, pas une table.**
**→ Migration 001 doit être réécrite.**

#### user_roles (migration 001)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| role | text DEFAULT 'member' | USER-DEFINED `app_role` DEFAULT 'membre' | CORRIGER → enum + 'membre' |

#### materiel_types · zones_anatomiques · zones_stockage · etageres (migration 004)

Même pattern : cloud a `label` pas `name`, plus `color`, `icon`, `active`, `updated_at`.

### MOYENNE — Colonnes supplémentaires mineures

#### app_groups (migration 008)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| — | absent | `updated_at` timestamptz | AJOUTER |
| icon | nullable | NOT NULL | CORRIGER nullable |
| position | default absent | DEFAULT 0 | CORRIGER default |

#### app_modules (migration 008)

| Colonne | Migration | Cloud | Action |
|---|---|---|---|
| status default | 'coming_soon' | 'active' | CORRIGER default |
| — | absent | `updated_at` timestamptz | AJOUTER |

---

## DÉCOUVERTES IMPORTANTES

### 1. profiles_directory = VUE (pas une table)

L'indice : `id` est nullable dans `information_schema.columns`.
Cela signifie que les RLS sur profiles_directory dans la migration 001 sont fausses —
on ne met pas de RLS sur une vue, on les met sur la table source (`profiles`).

### 2. profiles = table complète (25 colonnes)

Le DATA_MODEL disait "id · email · created_at". La réalité est une table riche
avec toutes les données utilisateur (bio, téléphones, gants, casaque, etc.).

### 3. Enums PostgreSQL utilisés

- `tag_type` : enum pour tags.type
- `app_role` : enum pour user_roles.role (valeur 'membre' pas 'member')

### 4. Toutes les tables Lovable ont le pattern éditorial

user_id · category_id · tags[] · status · is_dev · last_modified_by · updated_at

### 5. carnet_* existe déjà (contrairement au DATA_MODEL)

Les 3 tables carnet_bord sont créées et conformes au schéma DATA_MODEL §13.

### 6. tag_suggestions + glossaire_suggestions : CONFIRMÉS exécutés

La dette "⚠ À EXÉCUTER" de la migration 012 est soldée.

---

## PLAN D'ACTION

### Priorité 1 — Corriger les migrations pour refléter le cloud

Réécrire les fichiers suivants avec le vrai schéma cloud :
- 001_baseline_users.sql (profiles complet + profiles_directory = vue + enum app_role)
- 002_baseline_content.sql (content_types/categories/tags/content_images/content_relations)
- 003_baseline_metier.sql (anatomie/fiches/cours/installation/transmissions/preferences)
- 004_baseline_materiel.sql (materiel/materiel_types/zones_*/etageres)

### Priorité 2 — Ajouter la migration carnet_bord manquante

- 017_carnet_bord.sql

### Priorité 3 — Mettre à jour le DATA_MODEL V1.7.0

Toutes les dettes identifiées ci-dessus doivent être inscrites dans le DATA_MODEL.
C'est un chantier massif : ~15 tables à corriger dans la documentation.

---

## COMPTAGE FINAL

| Métrique | Valeur |
|---|---|
| Tables cloud | 33 |
| Tables couvertes par migrations | 30 (manque 3 carnet_*) |
| Migrations conformes au cloud | 12 / 17 fichiers |
| Migrations à corriger | 4 fichiers (001-004) |
| Migrations à ajouter | 1 fichier (017) |
| Colonnes divergentes | ~80 |
| Nouvelles dettes DATA_MODEL | 12 |
