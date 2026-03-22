# CTX — MODULE DORK

```
VERSION  : 2.3.0
DATE     : 2026-03-21
STATUT   : OPÉRATIONNEL — ARBITRAGE A2-DORK VALIDÉ — MIGRATION SUPABASE PLANIFIABLE
FICHIER  : modules/dork/index.html
JS       : dork_data.js · dork_engine.js · dork_app.js
CSS      : styles intégrés dans le HTML (à externaliser en dork-ui.css)
NOYAU_REF: NOYAU_VERITE_V2_4_0
DELTA v2.2.1 → v2.3.0 :
  Arbitrage A2-DORK validé par Manu (2026-03-21).
  Ajout BLOC 2 — schéma Supabase final (10 tables + 1 trigger + seed SQL).
  TRACKER_STATUS : legacy → à_faire (migration planifiable).
  BLOC 0 : RESTE À FAIRE mis à jour.

TRACKER_STATUS     : à_faire
TRACKER_SHELL      : non
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS : localStorage-dorkDashboard,CSS-inline-integre,onclick-inline,FontAwesome-fa,bdb-shell-absent
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
FAIT             : Arbitrage A2-DORK validé — schéma Supabase 10 tables défini.
                   BLOC 2 ajouté. TRACKER_STATUS legacy → à_faire.
RESTE À FAIRE    : Écrire supabase/migrations/YYYYMMDD_dork.sql (schéma BLOC 2)
                   Écrire seed SQL (sources · opérateurs · filetypes initiaux)
                   Appliquer migration Supabase (local puis cloud)
                   Migrer dork_data.js : localStorage → requêtes Supabase
                   Migrer Font Awesome (fa-*) → Bootstrap Icons
                   Migrer onclick= → addEventListener via délégation
                   Externaliser CSS dans dork-ui.css
                   Intégrer bdb-shell.js (après migration Supabase)
                   Ordre migration Phase 1 :
                     organisateur → paxis → collab → disc → dork → thesaurus
VIOLATIONS ACTIVES :
  ⚠ localStorage-dorkDashboard : 7 clés localStorage — à supprimer post-migration
  ⚠ CSS-inline-integre         : styles dans le HTML — à externaliser
  ⚠ onclick-inline             : onclick= dans template literals — à migrer
  ⚠ FontAwesome-fa             : icônes fa-* — migrer vers Bootstrap Icons (bi_icon en base)
  ⚠ bdb-shell-absent           : à intégrer post-migration
VIOLATIONS RÉSOLUES :
  - Hallucination v1.0.0 corrigée — 2026-03-13 (D-2026-03-13-009)
  - Arbitrage A2-DORK levé — 2026-03-21 (v2.3.0)
```

---

## BLOC 2 — SCHÉMA SUPABASE (VALIDÉ — ARBITRAGE A2-DORK)

> Source : ARBITRAGES_A2_A2DORK_A4_V2_0_0.md · Validé par Manu 2026-03-21
> Fichier SQL cible : supabase/migrations/YYYYMMDD_dork.sql

### Décisions structurantes

```
- Tout configurable depuis l'interface admin — aucune constante hardcodée en JS après migration
- Referentiels (sources, opérateurs, filetypes) : tables Supabase avec CRUD admin
- Trigger SQL pour la limite 25 entrées history (pas de logique JS)
- Admin-only RLS pour l'instant (rôle modérateur non créé)
- Arrays SQL natifs (TEXT[]) plutôt que jsonb pour les listes simples
- Relations N-N en tables de liaison SQL propres
```

### 10 tables + 1 trigger

#### dork_sources (référentiel global — CRUD admin)

```sql
CREATE TABLE public.dork_sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  domains     TEXT[] NOT NULL DEFAULT '{}',
  weight      SMALLINT NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 3),
  category    TEXT NOT NULL DEFAULT 'professional'
              CHECK (category IN ('institutional','professional','academic','other')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  position    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

#### dork_operators (référentiel global — CRUD admin)

```sql
CREATE TABLE public.dork_operators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  description TEXT,
  syntax      TEXT NOT NULL,
  bi_icon     TEXT NOT NULL DEFAULT 'bi-search',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  position    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

#### dork_filetypes (référentiel global — CRUD admin)

```sql
CREATE TABLE public.dork_filetypes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  extension   TEXT NOT NULL,
  bs_color    TEXT NOT NULL DEFAULT 'bg-secondary bg-opacity-10 text-secondary',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  position    SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

#### dork_profiles (par utilisateur admin)

```sql
CREATE TABLE public.dork_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  exclusions  TEXT[] NOT NULL DEFAULT '{}',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, code)
);

CREATE TABLE public.dork_profile_sources (
  profile_id  UUID NOT NULL REFERENCES dork_profiles(id) ON DELETE CASCADE,
  source_id   UUID NOT NULL REFERENCES dork_sources(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, source_id)
);
```

#### dork_history (par utilisateur admin)

```sql
CREATE TABLE public.dork_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id  UUID REFERENCES dork_profiles(id) ON DELETE SET NULL,
  label       TEXT NOT NULL DEFAULT 'Dork personnalisé',
  query       TEXT NOT NULL,
  url         TEXT NOT NULL,
  base_query  TEXT,
  rating      SMALLINT NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  validated   BOOLEAN NOT NULL DEFAULT false,
  last_used   TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dork_history_operators (
  history_id   UUID NOT NULL REFERENCES dork_history(id) ON DELETE CASCADE,
  operator_id  UUID NOT NULL REFERENCES dork_operators(id) ON DELETE CASCADE,
  PRIMARY KEY (history_id, operator_id)
);

CREATE TABLE public.dork_history_filetypes (
  history_id   UUID NOT NULL REFERENCES dork_history(id) ON DELETE CASCADE,
  filetype_id  UUID NOT NULL REFERENCES dork_filetypes(id) ON DELETE CASCADE,
  PRIMARY KEY (history_id, filetype_id)
);

CREATE TABLE public.dork_history_sources (
  history_id  UUID NOT NULL REFERENCES dork_history(id) ON DELETE CASCADE,
  source_id   UUID NOT NULL REFERENCES dork_sources(id) ON DELETE CASCADE,
  PRIMARY KEY (history_id, source_id)
);

CREATE TABLE public.dork_history_keywords (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id  UUID NOT NULL REFERENCES dork_history(id) ON DELETE CASCADE,
  keyword     TEXT NOT NULL,
  position    SMALLINT NOT NULL DEFAULT 0
);
```

#### Trigger limit 25 history

```sql
CREATE OR REPLACE FUNCTION fn_limit_dork_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.dork_history
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.dork_history
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 25
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_limit_dork_history
AFTER INSERT ON public.dork_history
FOR EACH ROW EXECUTE FUNCTION fn_limit_dork_history();
```

### Seed SQL initial

```sql
-- Sources
INSERT INTO public.dork_sources (code, label, domains, weight, category, position) VALUES
  ('has',       'HAS',        '{has-sante.fr}',    3, 'institutional', 0),
  ('interbloc', 'Inter Bloc', '{interbloc.com}',   3, 'professional',  1),
  ('sf2h',      'SF2H',       '{sf2h.net}',        3, 'professional',  2);

-- Opérateurs
INSERT INTO public.dork_operators (code, label, description, syntax, bi_icon, position) VALUES
  ('intitle',  'intitle:',  'Dans le titre',    'intitle:{query}',  'bi-type-h1',      0),
  ('inurl',    'inurl:',    'Dans l''URL',       'inurl:{query}',    'bi-link-45deg',   1),
  ('intext',   'intext:',   'Dans le texte',     'intext:{query}',   'bi-file-text',    2),
  ('site',     'site:',     'Site spécifique',   'site:{domain}',    'bi-globe',        3),
  ('filetype', 'filetype:', 'Type de fichier',   'filetype:{ext}',   'bi-file-earmark', 4);

-- Filetypes
INSERT INTO public.dork_filetypes (code, label, extension, bs_color, position) VALUES
  ('pdf',  'PDF',  'pdf',  'bg-danger bg-opacity-10 text-danger',   0),
  ('docx', 'DOCX', 'docx', 'bg-primary bg-opacity-10 text-primary', 1),
  ('xlsx', 'XLSX', 'xlsx', 'bg-success bg-opacity-10 text-success', 2),
  ('pptx', 'PPTX', 'pptx', 'bg-warning bg-opacity-10 text-warning', 3);
```

### RLS dork (admin-only)

```sql
-- Référentiels : lecture auth, écriture admin
pol_dork_sources_read      : SELECT pour auth
pol_dork_sources_admin     : ALL pour admin
pol_dork_operators_read    : SELECT pour auth
pol_dork_operators_admin   : ALL pour admin
pol_dork_filetypes_read    : SELECT pour auth
pol_dork_filetypes_admin   : ALL pour admin

-- Profiles + history : propriétaire uniquement (= admin en pratique)
pol_dork_profiles_own      : ALL pour auth WHERE user_id = auth.uid()
pol_dork_history_own       : ALL pour auth WHERE user_id = auth.uid()
pol_dork_admin_read        : SELECT ALL pour admin
```

### Règle E9 — anti-régression critique

```
⚠ window.bdbUser.isAdmin — source unique après migration shell
⚠ Aucune requête user_roles ou profiles_directory dans ce module
⚠ localStorage dorkDashboard_* → à supprimer intégralement après migration
⚠ Ne jamais hardcoder sources / opérateurs / filetypes dans le JS
  → Toujours charger depuis Supabase (tables de référentiel)
```

---

## 1. ROLE

Constructeur de requêtes Google Dork pour recherche documentaire médicale.
Outil admin uniquement — non visible depuis le portail utilisateur standard.

Fonctionnalités :
- Gestion de profils de recherche (sources fiables : HAS, Inter Bloc, SF2H, etc.)
- Opérateurs Google Dork (site:, filetype:, intitle:, inurl:...)
- Filetypes configurables
- Historique 25 dernières requêtes (géré par trigger SQL)
- Tout configurable depuis l'interface admin sans toucher au code

## 2. CE QUE CE MODULE N'EST PAS

```
- PAS un dashboard de statistiques planning (hallucination v1.0.0 — D-2026-03-13-009)
- PAS un module analytique BDB
- PAS visible depuis le portail standard (admin uniquement)
- Aucune dépendance avec le module planning — ZÉRO lien
```

## 3. STACK TECHNIQUE ACTUELLE

HTML/JS vanilla · Bootstrap 5.3.2 · localStorage (clés `dorkDashboard_*`) — à migrer
Fichiers JS externes : dork_data.js · dork_engine.js · dork_app.js

## 4. CLÉS LOCALSTORAGE À SUPPRIMER (migration)

```
dorkDashboard_profiles_v2
dorkDashboard_sources_v2
dorkDashboard_operators_v2
dorkDashboard_filetypes_v2
dorkDashboard_dorks_history_v2
dorkDashboard_current_profile
dorkDashboard_version
```

## 5. VIOLATIONS CDS À CORRIGER (lors de la migration)

```
- Font Awesome (fa-*)         → Bootstrap Icons (code en base : colonne bi_icon)
- onclick= template literals  → addEventListener via délégation
- CSS intégré                 → dork-ui.css
- Constantes JS hardcodées    → requêtes Supabase (référentiels)
```

Ne pas ajouter de nouveaux onclick= ou Font Awesome en attendant.

## 6. ANTI-HALLUCINATION

```
CRITIQUE : Le CTX_DORK v1.0.0 était une hallucination totale (D-2026-03-13-009).
           Ce module n'a AUCUN lien avec le Planning Engine.

- Ne pas créer de dépendance vers planning ou fiches
- Ne pas hardcoder sources / opérateurs / filetypes dans le JS
- localStorage dorkDashboard_* = à supprimer, pas à étendre
- Les services JS (auth-service.js etc.) n'existent pas
```

## 7. AUTORISÉ

- Écrire le fichier SQL de migration (BLOC 2)
- Écrire le seed SQL (sources · opérateurs · filetypes)
- Remplacer dork_data.js par des requêtes Supabase
- Corriger les violations CDS documentées (§5)

## 8. INTERDIT

- Ajouter de nouveaux `onclick=`
- Ajouter Font Awesome (fa-*)
- Créer un lien ou dépendance vers le module planning
- Hardcoder sources / opérateurs / filetypes dans le JS
- CSS inline supplémentaire
- Modifier les tables sans entrée JOURNAL_DECISIONS

## 9. DÉPENDANCES

```
ACTIVES :
- Bootstrap 5.3.2 (CDN)
- Bootstrap Icons 1.11.1 (CDN)

CIBLES POST-MIGRATION :
- window.bdb (supabase-client.js)
- bdb-shell.js v1.4.0 (window.bdbUser)
- cds-overrides.css v1.5.0
- dork-ui.css (à créer)
```

## HISTORIQUE

```
2026-03-13 — v2.0.0  Réécriture complète. v1.0.0 hallucination totale (D-2026-03-13-009).
2026-03-15 — v2.1.0  NOYAU_REF V2.1.0. Anti-hallucination. Arbitrage A2-dork.
2026-03-16 — v2.2.0  NOYAU_REF V2_4_0. PERSONAS underscore.
2026-03-21 — v2.2.1  TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
2026-03-21 — v2.3.0  Arbitrage A2-DORK validé. BLOC 2 schéma final 10 tables + trigger + seed.
                      TRACKER_STATUS legacy → à_faire.
```
