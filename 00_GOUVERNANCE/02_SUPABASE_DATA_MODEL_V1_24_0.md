# BDB — Guide de survie Supabase

```
VERSION  : 1.24.0
DATE     : 2026-04-25
STATUT   : RÉFÉRENCE VIVANTE
PROJET   : ecpzrygzdugwwkqbsajn (Supabase cloud)
STACK    : PostgreSQL 15 · Supabase JS v2 CDN · RLS activé partout
PRINCIPE : Ce doc décrit l'ARCHITECTURE. Pour le détail des colonnes,
           interroger information_schema en live — jamais se fier à un .md.
```

---

## 0 — RÈGLE D'OR

**Avant tout SQL, vérifier le schéma réel :**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'MA_TABLE'
ORDER BY ordinal_position;
```

Zéro colonne inventée. Zéro type deviné. `information_schema` prime sur tout document.

---

## 1 — CARTOGRAPHIE PAR DOMAINE (131 tables)

### 1.1 — Thésaurus & données cliniques (cœur métier)

| Table | Rôle | Lignes | Relations clés |
|---|---|---|---|
| `thesaurus_protocoles` | Protocoles chirurgicaux normalisés | 395 | → protocole_ccam, fiches_papier, interventions |
| `thesaurus_interventions` | Historique interventions OPTIM importé | 89 653 | → protocole_id, chirurgien_id, panseuse_id |
| `thesaurus_chirurgiens` | Chirurgiens référencés | 12 | → profile_id (optionnel) |
| `thesaurus_panseuses` | IDE/IBODE du bloc | 142 | → profile_id (optionnel) |
| `thesaurus_fiches_papier` | Fiches papier chirurgiens matchées | 391 | → protocole_id |
| `protocole_ccam` | Pivot protocole ↔ CCAM | 350 | → protocole_id, ccam_acte_id |
| `referentiel_ccam` | Référentiel ATIH V82 (8 292 codes) | 8 292 | Source de vérité CCAM |
| `staging_interventions_ortho` | Données brutes OPTIM (staging) | 88 832 | → protocole_id (mapping progressif) |
| `staging_medacta_coste` | Import implants Medacta | 2 265 | Staging uniquement |

**PIÈGES MORTELS :**
- `libelle_cible` et `FREQUENCE` = champs SACRÉS (immuables après création)
- `id_protocole` = immuable (R25)
- JAMAIS `UPDATE protocole_operatoire` si `protocole_id` mappé (ERREUR-13)
- `codes_ccam` dans `thesaurus_protocoles` = dénormalisé, maintenu par trigger `sync_codes_ccam` → modifier via `protocole_ccam` uniquement
- Zéro code CCAM inventé — vide > faux

### 1.2 — Contenu pédagogique (modules membres)

| Table | Rôle | Lignes |
|---|---|---|
| `anatomie` | Fiches anatomie | 1 |
| `cours` | Cours (libre/topo/protocole/procédure) | 3 |
| `cours_topo_blocs` | Blocs structurés d'un cours topo | 0 |
| `cours_zones_anatomiques` | Zones anatomiques pour cours | 23 |
| `fiches_intervention` | Fiches d'intervention | 5 |
| `installation_patient` | Fiches d'installation patient | 4 |
| `preferences_chirurgien` | Préférences chirurgien par protocole | 13 |
| `materiel` | Arsenal matériel | 707 |
| `materiel_types` | Types de matériel | 13 |
| `gants` | Catalogue gants | 20 |
| `casaques` | Catalogue casaques | 7 |
| `glossaire` | Glossaire chirurgical | 567 |
| `glossaire_candidats` | Termes candidats (pipeline) | 160 |
| `glossaire_exclusions` | Termes exclus du glossaire | 374 |
| `glossaire_suggestions` | Suggestions membres (workflow) | 0 |
| `transmissions` | Transmissions inter-équipe | 3 |

**Pattern commun** : `status` CHECK ('draft','published','archived'), `user_id`, `category_id`, `tags[]`, `is_dev`, `last_modified_by`, triggers `updated_at`.

### 1.3 — Utilisateurs & accès

| Table | Rôle | Lignes |
|---|---|---|
| `profiles` | Profils utilisateurs (29 colonnes) | 10 |
| `profiles_directory` | Vue matérialisée publique des profils | 34 |
| `profiles_invitations` | Invitations pré-inscription | 24 |
| `user_roles` | Rôles applicatifs (enum `app_role`) | 10 |
| `fonctions_metier` | Référentiel fonctions (medecin, infirmier…) | 16 |

**CRITIQUE :**
- `profiles` a `id` (PK) ET `user_id` (FK → `auth.users`) — colonnes DISTINCTES
- `app_role` enum = `'admin'`, `'membre'`, `'invite'` (français)
- `is_creator` = booléen sur `profiles` (guard L3 atelier/conseil)
- `is_suspended` = booléen pour désactivation sans suppression
- `profiles_directory` synchronisé par trigger `sync_profiles_directory` sur INSERT/UPDATE/DELETE de `profiles`

### 1.4 — Collaboration & participation

| Table | Rôle | Lignes |
|---|---|---|
| `collab_projects` | Projets collaboratifs | 3 |
| `collab_ideas` | Idées (quadrant impact/effort) | 1 |
| `collab_categories` | Catégories d'idées | 4 |
| `collab_votes` | Votes sur idées | 0 |
| `signalements` | Signalements (bug/contenu/typo) | 1 |
| `tag_suggestions` | Suggestions de tags par membres | 0 |
| `tags` | Tags structurés (enum `tag_type`) | 33 |
| `tag_links` | Liens tag ↔ contenu | 4 |
| `sondage_reponses` | Réponses sondage mini-site | 0 |

**RÈGLES :**
- `UNIQUE(user_id, idea_id)` sur `collab_votes` — 1 vote/user/item
- Signalement = direct, pas de draft (CONV-SIGNALEMENT-01)
- Évolutions → `collab_ideas`, pas signalements

### 1.5 — DISC & psychologie appliquée

| Table | Rôle | Lignes |
|---|---|---|
| `disc_profils` | Profils DISC/VAKOG des membres | 0 |
| `disc_personas` | Personas pédagogiques (7 personnages) | 7 |
| `disc_compatibilites` | Matrice compatibilité DISC | 16 |
| `disc_scenarios` | Scénarios pédagogiques | 1 |
| `disc_scenes` | Scènes d'un scénario | 3 |
| `disc_tests` / `disc_test_reponses` | Tests DISC/VAKOG utilisateur | 0 |
| `disc_conclusions` | Conclusions personnalisées | 0 |
| + 8 tables satellites disc_scene_* / disc_at_* / disc_meta_* / disc_savoir_etre | Détails scènes | — |

### 1.6 — Planning & affectations

| Table | Rôle | Lignes |
|---|---|---|
| `planning_semaines` | Semaines de planning | 28 |
| `planning_affectations` | Affectations salle/créneau/rôle | 2 382 |
| `planning_membres` | Membres du planning (code, nom) | 36 |

**PIÈGE :** `salle` = strings paddées `"05"`, `"06"`, `"07"`, `"08"` — pas des nombres.

### 1.7 — PAXIS (audit pratiques)

| Table | Rôle | Lignes |
|---|---|---|
| `paxis_campaigns` | Campagnes d'audit | 1 |
| `paxis_questions` | Questions par campagne | 21 |
| `paxis_sessions` | Sessions de réponse | 1 |
| `paxis_responses` | Réponses individuelles | 8 |

### 1.8 — Livret & objectifs (formation)

| Table | Rôle | Lignes |
|---|---|---|
| `livret_secteurs` | Secteurs du bloc | 6 |
| `livret_encadrement` | Équipe encadrante | 9 |
| `livret_objectifs_items` | Items de progression | 49 |
| `livret_progression` | Progression par membre | 2 |
| `objectifs_semaines` | Semaines d'objectifs | 2 |
| `objectifs_criteres` | Critères par objectif | 39 |
| `objectifs_evaluations` | Évaluations membres | 5 |
| `carnet_categories` / `carnet_items` / `carnet_progressions` | Carnet de bord | 3/58/2 |

### 1.9 — Organisateur (parcours de préparation)

| Table | Rôle | Lignes |
|---|---|---|
| `organisateur_parcours` | Parcours type (base/variante) | 5 |
| `organisateur_etapes` | Étapes d'un parcours | 78 |
| `organisateur_commentaires` | Commentaires membres sur étapes | 0 |
| `organisateur_masques_user` | Étapes masquées par user | 0 |
| `organisateur_sessions_brainstorm` | Sessions brainstorm collectif | 0 |

### 1.10 — Dork (recherche documentaire)

| Table | Rôle | Lignes |
|---|---|---|
| `dork_profiles` | Profils de recherche | 1 |
| `dork_keywords` / `dork_keyword_groups` | Mots-clés organisés | 370/8 |
| `dork_operators` | Opérateurs de recherche | 17 |
| `dork_filetypes` | Types de fichiers | 9 |
| `dork_sources` | Sources par profil | 3 |
| `dork_history` | Historique recherches | 3 |

### 1.11 — Veille documentaire (réf. institutionnels)

| Table | Rôle | Lignes |
|---|---|---|
| `bao_livres` | Catalogue BàO Dunod | 96 |
| `bao_auteurs` | Auteurs | 101 |
| `bao_livre_auteur` | Pivot livre ↔ auteur | 100 |
| `chu_france` | CHU de France | 32 |
| `chu_sources` | Sources documentaires CHU/écoles | 16 |
| `chu_search_templates` | Templates de recherche (dorks) | 160 |
| `ecoles_sante_france` | Écoles IFSI/IBODE/IADE | 92 |

### 1.12 — App & configuration

| Table | Rôle | Lignes |
|---|---|---|
| `app_instance` | Instance BDB (nom, couleur, logo) | 1 |
| `app_groups` | Groupes de modules (sidebar) | 6 |
| `app_modules` | Modules applicatifs | 24 |
| `parametrage_modules` | Configuration par établissement (JSONB) | 13 |
| `bdb_dependencies` | Dépendances CDN trackées | 10 |
| `bdb_principes` | Principes L1 (produit universel) | 52 |
| `bdb_liaisons` | Liaisons inter-modules ↔ protocole | 1 |
| `content_types` / `categories` / `content_relations` / `content_images` | Système de contenu générique | — |
| `cds_config` / `cds_rules` / `cds_rule_delta` / `cds_sessions` | CDS (Code Design System) audit | — |
| `supervision_*` (4 tables) | Supervision — miroir CDS (vide) | 0 |
| `site_faq` | FAQ hybride site/module | 33 |
| `error_404_logs` | Logs 404 admin | 15 |
| `zones_anatomiques` / `zones_stockage` / `etageres` | Arsenal : localisation matériel | 36/30/180 |
| `pref_referentiels` | Référentiels préférences chirurgien | 91 |

### 1.13 — Atelier L3 (Manu × Claude uniquement)

| Table | Rôle | Lignes |
|---|---|---|
| `atelier_sessions` | Sessions de travail | 102 |
| `atelier_decisions` | Décisions actées | 424 |
| `atelier_principes` | Principes/règles/interdits (187 actifs, 18 catégories) | 187 |
| `atelier_arbitrages` | Arbitrages en attente | 11 |
| `atelier_doctrine_nodes` | Arbre doctrine (tree-view) | 181 |
| `atelier_memo` | Mémos créateur | 6 |
| `bdb_doctrine_livre_ref` | Liens doctrine ↔ livres | 0 |
| `bernard_lectures` | Fiches lecture Bernard (persona L3) | 0 |
| `bernard_lecture_cotations` | Cotations 18 points | 0 |

**Guard** : `is_creator = true` sur `profiles` requis pour accéder aux pages atelier/ et conseil/.

### 1.14 — Démo invité

17 tables `demo_*` (anatomie, annuaire, arsenal, carnet_bord, collab, cours, dork, faq, fiches, glossaire, installation, objectifs, organisateur, paxis, preferences, thesaurus, transmissions). Lecture seule, seed statique, compte `demo@bdb.app`.

---

## 2 — ENUMS & CHECKS CRITIQUES

### 2.1 — ENUMs PostgreSQL

| Enum | Valeurs |
|---|---|
| `app_role` | admin, membre, invite |
| `tag_type` | anatomie, fonction, acronyme, materiel, intervention, libre, personne, marque |
| `chu_source_type` | ecole_ibode, ecole_iade, portail_formation, catalogue_formation, centre_doc, protocole, fiche_metier, livret_patient, rapport_activite, autre |
| `chu_specialite` | ibode, iade, infirmier, chirurgie, anatomie, sterilisation, anesthesie, tous |
| `ecole_type` | ifsi, ibode, iade, ifsi_ibode, ifsi_iade, mixte |

### 2.2 — CHECKs qui cassent si ignorés (extrait)

| Table | Colonne | Valeurs autorisées |
|---|---|---|
| `atelier_sessions` | statut | a_faire, en_cours, fait, partiel, abandonne, fusionne, bloque, a_auditer |
| `atelier_decisions` | type | decision, plan, roadmap, checklist, doctrine |
| `atelier_principes` | marqueur | TOUJOURS, AUJOURD_HUI |
| `profiles` | fonction | medecin, cadre, infirmier, aide-soignant |
| `profiles_invitations` | statut | en_attente, envoye, reclame, expire |
| `planning_affectations` | jour | LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI |
| `planning_affectations` | creneau | MATIN, APREM, SOIR |
| `planning_affectations` | role | INSTRU, PANSEUR, COULOIR, ETUDIANT, SALLE, '' |
| `cours` | type_cours | topo, protocole, procedure, libre |
| `materiel` | statut | disponible, indisponible, en_reparation, manquant |
| `bernard_lecture_cotations` | cotation | servi, expose, lese, non_concerne, inconnu, simulation |

**Règle** : avant INSERT dans une colonne CHECK → `SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'ma_table'::regclass AND contype = 'c';`

### 2.3 — Catégories `atelier_principes` (18 actives)

```
anti_ia(8), axe(12), bernard_regles(8), CDS(5), convention(38),
erreur(4), exclusion(6), fiche_type(5), garde_fou(6), interdit(36),
journal(2), pacte_produit(4), principe_nomme(21), rgpd(2),
source_verite(6), stb(8), tech(9), user_story(7)
```

---

## 3 — RPC ESSENTIELLES

| Fonction | Rôle | Sécurité |
|---|---|---|
| `atelier_prompt_reprise()` | Contexte complet session (stats, terrain, principes) | DEFINER |
| `atelier_ouvrir_session(N)` | Passe session N en `en_cours` | DEFINER |
| `atelier_cloture_session(numero, statut, avancement, livrables, journal_refs)` | Clôture session | DEFINER |
| `atelier_planifier_session(numero, scope, objectifs, fichiers, duree)` | Planifie une session | DEFINER |
| `atelier_stats()` | Stats agrégées atelier | DEFINER |
| `atelier_contexte_module(module)` | Contexte d'un module spécifique | DEFINER |
| `atelier_doctrine_fetch()` / `atelier_doctrine_save(tree)` | Arbre doctrine CRUD | DEFINER |
| `bdb_is_admin()` | Vérifie si user courant est admin | DEFINER |
| `is_admin()` / `is_approved()` / `has_role()` / `get_user_role()` | Guards d'accès | DEFINER |
| `admin_approve_user(uuid, bool)` / `admin_set_user_role(uuid, role)` | Actions admin | DEFINER |
| `disc_distribution()` | Distribution DISC agrégée (zéro user_id) | DEFINER |
| `glossaire_scan_orphelins()` / `glossaire_propagate()` | Pipeline glossaire | DEFINER |
| `sync_codes_ccam()` | Trigger : sync `protocole_ccam` → `thesaurus_protocoles.codes_ccam` | DEFINER |
| `handle_new_user()` | Trigger `auth.users` → crée `profiles` + `user_roles` | DEFINER |
| `signalements_stats()` | Stats signalements | DEFINER |
| `count_unseen_404s()` / `mark_404s_seen()` | Gestion alertes 404 | DEFINER |
| `thesaurus_distinct_chirurgiens()` / `thesaurus_distinct_annees()` | Filtres thésaurus | DEFINER |

---

## 4 — TRIGGERS ACTIFS

51 triggers. Pattern dominant : `updated_at = now()` sur UPDATE.

Triggers spéciaux à connaître :
- `trg_sync_profiles_directory` → synchronise `profiles_directory` sur tout INSERT/UPDATE/DELETE de `profiles`
- `trg_sync_codes_ccam` → synchronise `thesaurus_protocoles.codes_ccam` sur INSERT/DELETE dans `protocole_ccam`
- `trg_atelier_doctrine_touch` → touche `updated_at` sur l'arbre doctrine

---

## 5 — EXTENSIONS

```
pg_trgm 1.6      — recherche par trigrammes (glossaire, thésaurus)
unaccent 1.1      — recherche insensible aux accents
pgcrypto 1.3      — gen_random_uuid()
uuid-ossp 1.1     — génération UUID
pg_graphql 1.5.11 — GraphQL Supabase
pg_stat_statements — monitoring requêtes
supabase_vault     — secrets
```

---

## 6 — RÈGLES DE SURVIE (lire avant de coder)

### 6.1 — Supabase JS obligatoires

```javascript
// TOUJOURS .select() sur .update() et .delete()
const { data, error } = await supabase
  .from('ma_table')
  .update({ col: val })
  .eq('id', id)
  .select();  // ← OBLIGATOIRE sinon RLS bloque silencieusement

// Limite 1000 lignes par défaut
const { data } = await supabase.from('ma_table').select('*').limit(2000);
// ↑ NE MARCHE PAS — max 1000. Utiliser .range(0, 999) puis .range(1000, 1999)

// .in() avec grands arrays → résultats vides silencieux
// Chunker par 100 IDs max
```

### 6.2 — Fichier .sql AVANT exécution

Toute migration = fichier `.sql` numéroté, sauvé sur disque, AVANT exécution dans le SQL Editor. Pattern : `NNN_description.sql`. Dernier numéro connu : **170** (seed_ecoles_iade_ifsi, 2026-04-25).

### 6.3 — Conventions nommage

- Tables : `snake_case` singulier ou pluriel selon usage historique
- Colonnes : `snake_case`
- Préfixes tables : `atelier_` = L3 projet | `cds_` = framework technique | `bdb_` = L1 universel | `demo_` = démo invité | `bernard_` = persona Bernard L3 | `disc_` = module DISC | `dork_` = module recherche | `bao_` = BàO Dunod | `chu_` = CHU/sources | sans préfixe = L1/L2 produit
- `id` = UUID `gen_random_uuid()` partout (sauf `staging_*` et `chu_france` = integer)
- `created_at` = `timestamptz DEFAULT now()`
- `updated_at` = idem + trigger

### 6.4 — Patterns récurrents

| Pattern | Convention |
|---|---|
| Statut éditorial | `'brouillon','soumis','en_revision','valide','publie','archive'` |
| Vote | `UNIQUE(user_id, item_id)` — 1 vote/user/item |
| Async DOM | 3 états : loading (skeleton), empty (message), error (toast + retry) |
| `escHtml()` | Obligatoire sur tout `innerHTML` avec donnée DB |
| Contenu membre | `draft` → validation admin → `active` |

### 6.5 — Ce qui est INTERDIT

- Modifier `bdb-shell.js`, `supabase-client.js`, `cds-overrides.css` sans accord Manu
- Dupliquer URL/clé Supabase (un seul fichier : `js/supabase-client.js`)
- Créer un 2e client Supabase (`window.bdb` = unique instance)
- `console.log` en production
- `style=` statique en HTML (sauf honeypot et progressbar)
- `onclick=` inline
- Font Awesome (Bootstrap Icons uniquement)

---

## 7 — EDGE FUNCTIONS

| Fonction | Rôle |
|---|---|
| `delete-user` | Suppression compte (déployée `--no-verify-jwt`, gère son propre auth) |

---

## 8 — VUE

| Vue | Rôle |
|---|---|
| `vue_medacta_coste_implants` | Vue analytique croisée staging_medacta × staging_interventions |
| `profiles_directory` | Table matérialisée (pas une vue SQL) synchronisée par trigger |
| `profiles_directory_v1_backup` | Backup pré-migration |

---

## HISTORIQUE

```
2026-04-25 — V1.24.0
  Refonte complète. Passage de l'inventaire exhaustif (~3000 lignes)
  à un guide de survie architecture (~500 lignes).
  Principe : information_schema en live > document stale.
  Ajout tables veille-doc (bao_*, chu_*, ecoles_sante_france).
  Ajout tables bernard_*. Catégorie bernard_regles + CDS.
  Migrations 162-170 intégrées.
  131 tables, 5 enums PG, 80+ CHECK, 35 RPC, 51 triggers, 8 extensions.

2026-04-18 — V1.23.0
  177 lignes atelier_principes, 17 catégories.
  Inventaire exhaustif colonnes (ancien format).
```
