# CTX — MODULE DISC

```
VERSION  : 2.4.0
DATE     : 2026-03-21
STATUT   : OPÉRATIONNEL — ARBITRAGE A2 VALIDÉ — MIGRATION SUPABASE PLANIFIABLE
FICHIER  : modules/disc/index.html
CSS      : aucun fichier CSS externe (styles intégrés dans le HTML)
NOYAU_REF: NOYAU_VERITE_V2_4_0
NOTE     : CTX_DISC_ENGINE.md et personna_disc_doc.md absorbés ici.
           Ces deux fichiers étaient absents — contenu reconstitué depuis index.html + NOYAU.
           Ne pas recréer ces fichiers séparément.
DELTA v2.3.1 → v2.4.0 :
  Arbitrage A2 validé par Manu (2026-03-21).
  Ajout BLOC 2 — schéma Supabase final (11 tables, zéro jsonb).
  TRACKER_STATUS : legacy → à_faire (migration planifiable).
  BLOC 0 : RESTE À FAIRE mis à jour.

TRACKER_STATUS     : à_faire
TRACKER_SHELL      : non
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS : localStorage-disc,CSS-inline-integre,bdb-shell-absent
TRACKER_UPDATED    : 2026-03-21
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
FAIT             : Arbitrage A2 validé — schéma Supabase 11 tables défini.
                   BLOC 2 ajouté. TRACKER_STATUS legacy → à_faire.
RESTE À FAIRE    : Écrire supabase/migrations/YYYYMMDD_disc.sql
                   Appliquer migration Supabase (local puis cloud)
                   Écrire seed SQL données initiales (7 personas + SC_001)
                   Intégrer bdb-shell.js (après migration Supabase)
                   Externaliser CSS dans disc-ui.css
                   Migrer logique JS localStorage → requêtes Supabase
                   Ordre migration Phase 1 :
                     organisateur → paxis → collab → disc → dork → thesaurus
VIOLATIONS ACTIVES :
  ⚠ localStorage-disc    : persistance locale préfixe disc_* — à supprimer post-migration
  ⚠ CSS-inline-integre   : styles dans le HTML — à externaliser
  ⚠ bdb-shell-absent     : module hors écosystème BDB shell — à intégrer post-migration
VIOLATIONS RÉSOLUES :
  - utils.js + storage.js supprimés des dépendances — 2026-03-16 (v2.3.0)
  - SHARED/bdb-members.js supprimé (référence fantôme) — 2026-03-16 (v2.3.0)
  - Arbitrage A2 levé — 2026-03-21 (v2.4.0)
```

---

## BLOC 2 — SCHÉMA SUPABASE (VALIDÉ — ARBITRAGE A2)

> Source : ARBITRAGES_A2_A2DORK_A4_V2_0_0.md · Validé par Manu 2026-03-21
> Fichier SQL cible : supabase/migrations/YYYYMMDD_disc.sql

### Décisions structurantes

```
- Zéro jsonb — toutes les données structurées en tables relationnelles
- UUID PK partout
- scene_code TEXT pour l'affichage ('S1', 'S2'…) — PK reste UUID
- Colonne sandbox supprimée — RLS standard
- Données fictives actuelles (7 personas + SC_001) → seed SQL initial, supprimables
```

### 11 tables

#### disc_personas + tables de détail

```sql
CREATE TABLE public.disc_personas (
  code              TEXT PRIMARY KEY,
  nom               TEXT NOT NULL,
  prenom            TEXT NOT NULL,
  fn                TEXT NOT NULL,
  role_pedago       TEXT,
  disc_profil       TEXT NOT NULL CHECK (disc_profil IN ('D','I','S','C')),
  ennea             TEXT,
  position_vie      TEXT,
  vakog_primary     TEXT CHECK (vakog_primary IN ('visuel','auditif','kinesthésique','olfactif','gustatif')),
  vakog_secondary   TEXT CHECK (vakog_secondary IN ('visuel','auditif','kinesthésique','olfactif','gustatif')),
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.disc_savoir_etre (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_code  TEXT NOT NULL REFERENCES disc_personas(code) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  position      SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_at_etats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_code  TEXT NOT NULL REFERENCES disc_personas(code) ON DELETE CASCADE,
  etat          TEXT NOT NULL,
  contexte      TEXT NOT NULL CHECK (contexte IN ('base','stress')),
  position      SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_meta_programmes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_code  TEXT NOT NULL REFERENCES disc_personas(code) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  position      SMALLINT NOT NULL DEFAULT 0
);
```

#### disc_scenarios + personnages

```sql
CREATE TABLE public.disc_scenarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  titre       TEXT NOT NULL,
  version     TEXT NOT NULL DEFAULT '1.0',
  contexte    TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.disc_scenario_personnages (
  scenario_id   UUID NOT NULL REFERENCES disc_scenarios(id) ON DELETE CASCADE,
  persona_code  TEXT NOT NULL REFERENCES disc_personas(code) ON DELETE CASCADE,
  position      SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (scenario_id, persona_code)
);
```

#### disc_scenes + tables de grille

```sql
CREATE TABLE public.disc_scenes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_code   TEXT NOT NULL,
  scenario_id  UUID NOT NULL REFERENCES disc_scenarios(id) ON DELETE CASCADE,
  titre        TEXT NOT NULL,
  contexte     TEXT,
  objectif     TEXT,
  deroule      TEXT,
  position     SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (scenario_id, scene_code)
);

CREATE TABLE public.disc_scene_faits (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id  UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  fait      TEXT NOT NULL,
  position  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_savoir_etre (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id  UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  position  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_at (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id      UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  persona_code  TEXT NOT NULL REFERENCES disc_personas(code) ON DELETE CASCADE,
  etat_observe  TEXT NOT NULL,
  position      SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_vakog (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id  UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  canal     TEXT NOT NULL CHECK (canal IN ('visuel','auditif','kinesthésique','olfactif','gustatif')),
  citation  TEXT NOT NULL,
  position  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_recadrages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id    UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  distorsion  TEXT NOT NULL,
  type_biais  TEXT,
  recadrage   TEXT,
  position    SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_bascules (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id  UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  question  TEXT NOT NULL,
  position  SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.disc_scene_debriefs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id  UUID NOT NULL REFERENCES disc_scenes(id) ON DELETE CASCADE,
  question  TEXT NOT NULL,
  position  SMALLINT NOT NULL DEFAULT 0
);
```

### RLS

```sql
-- Toutes les tables disc : SELECT pour auth, ALL pour admin
-- Pattern identique sur les 11 tables :
pol_disc_[table]_member_read : SELECT pour auth
pol_disc_[table]_admin       : ALL pour admin
```

### Règle E9 — anti-régression critique

```
⚠ window.bdbUser.isAdmin — source unique après migration shell
⚠ Aucune requête user_roles ou profiles_directory dans ce module
  (sauf si admin UI — à documenter explicitement)
⚠ localStorage disc_* → à supprimer intégralement après migration
```

---

## 1. ROLE

Moteur de personas pédagogiques pour scénarios de formation en équipe soignante.
Enrichit les membres BDB de dimensions psycho-pédagogiques :
DISC · Ennéagramme · Analyse Transactionnelle (AT) · VAKOG · méta-programmes PNL · savoir-être CRAIE/Boudreault.
Permet de construire et exporter des scénarios jouables (jeu de rôle) vers des LLM.

## 2. PORTÉE ACTUELLE (sandbox — données fictives)

Personas actifs : `ROHAUT_M` · `SARTOUT_F` · `HAMSA_O` · `MERIC_Q` · `MARCHAND_C` · `DA_COSTA` · `THUILLIER_E`
Scénario actif : `SC_001` "Encadrement sous rumeur" (3 scènes)

**DONNÉES FICTIVES — aucune donnée RH réelle. Ne jamais croiser avec données réelles.**
Ces données seront converties en seed SQL initial puis supprimables via l'admin.

## 3. STACK TECHNIQUE ACTUELLE

HTML/JS vanilla · Bootstrap 5.3.2 · localStorage (clés préfixées `disc_*`) — à migrer
100% file:// · Zéro fetch · Zéro module ES · IIFEs globaux (`window.DiscXxx`)

## 4. ARCHITECTURE FICHIERS JS (ordre de chargement obligatoire)

```
disc-schema.js        → window.DiscSchema   (types DISC, VAKOG, Ennéagramme)
disc-storage.js       → window.DiscStorage  (localStorage — à remplacer)
disc-persona-store.js → window.DiscPersonaStore (personas — à remplacer par Supabase)
disc-scenarios.js     → window.DiscScenarios    (scénarios — à remplacer par Supabase)
disc-engine.js        → window.DiscEngine
disc-controller.js    → window.DiscController   (UI — 43K lignes)
```

⚠ TDZ critique : disc-storage.js DOIT précéder disc-persona-store.js.
Ne jamais réordonner sans vérification complète.

## 5. MIGRATION SUPABASE — PLAN

```
Étape 1 : Écrire supabase/migrations/YYYYMMDD_disc.sql (schéma BLOC 2)
Étape 2 : Écrire supabase/seeds/disc_seed.sql (7 personas + SC_001)
Étape 3 : Appliquer local → tester → appliquer cloud
Étape 4 : Remplacer disc-storage.js + disc-persona-store.js + disc-scenarios.js
          par des modules Supabase (requêtes via window.bdb)
Étape 5 : Intégrer bdb-shell.js + externaliser CSS
Étape 6 : Supprimer localStorage disc_*
```

## 6. ANTI-HALLUCINATION

```
- Les données DISC sont fictives — ne jamais croiser avec données RH réelles
- Ne pas inventer des profils DISC sans source déclarée
- Le module DISC est un outil pédagogique, pas un outil RH
- Clés localStorage : préfixe disc_* — à supprimer après migration
- Les services JS (auth-service.js etc.) n'existent pas
- utils.js et storage.js n'existent pas comme dépendances BDB
- SHARED/bdb-members.js n'existe pas en BDB V2
- disc-controller.js = 43K lignes — ne pas réécrire en une session
```

## 7. VOIX UTILISATEUR

Module pédagogique utilisé par formateurs et encadrants (P7, P3).
Voix ouverte, non anxiogène. Consulter PERSONAS_BDB_V1_3_0 pour tout nouveau contenu.

## 8. AUTORISÉ

- Écrire le fichier SQL de migration (BLOC 2)
- Écrire le seed SQL des données initiales
- Remplacer les modules localStorage par des modules Supabase
- Modifier le rendu UI post-migration

## 9. INTERDIT

- Tenter de charger SHARED/bdb-members.js (référence fantôme)
- Charger utils.js ou storage.js comme dépendances CDN BDB
- Modules ES (`import`/`export`)
- Ajouter des clés localStorage disc_* (migration en cours)
- Inventer profils DISC/AT/VAKOG sans source déclarée
- CSS inline / JS inline supplémentaire
- Modifier les 11 tables sans entrée JOURNAL_DECISIONS

## 10. DÉPENDANCES

```
ACTIVES :
- Bootstrap 5.3.2 (CDN jsdelivr)
- Bootstrap Icons 1.11.1 (CDN jsdelivr)
- theme-base.css (CDN menywise/BDB — @latest dev · tag fixe prod)

CIBLES POST-MIGRATION :
- window.bdb (supabase-client.js)
- bdb-shell.js v1.4.0 (window.bdbUser)
- cds-overrides.css v1.5.0
```

## HISTORIQUE

```
2026-03-08 — v2.0.0  Absorption CTX_DISC_ENGINE.md et personna_disc_doc.md.
2026-03-13 — v2.1.0  Suppression clause "standalone offline". Migration Supabase Phase 1.
2026-03-15 — v2.2.0  NOYAU_REF V2.1.0. Anti-hallucination. Arbitrage A2. Voix utilisateur.
2026-03-16 — v2.3.0  NOYAU_REF V2_4_0. utils/storage/bdb-members supprimés.
2026-03-21 — v2.3.1  TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
2026-03-21 — v2.4.0  Arbitrage A2 validé. BLOC 2 schéma final 11 tables. Plan migration.
                      TRACKER_STATUS legacy → à_faire.
```
