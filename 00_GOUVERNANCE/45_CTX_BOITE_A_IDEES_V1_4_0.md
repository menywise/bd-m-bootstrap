# CTX — MODULE COLLAB

```
VERSION  : 1.4.0
DATE     : 2026-03-21
STATUT   : OPÉRATIONNEL — ARBITRAGE A4 VALIDÉ — MIGRATION SUPABASE PLANIFIABLE
FICHIER  : modules/boite-a-idees/index.html
CSS      : aucun fichier CSS externe (styles intégrés dans le HTML)
  Arbitrage A4 validé par Manu (2026-03-21).
  Ajout BLOC 2 — schéma Supabase final (4 tables + 2 triggers).
  BLOC 0 : RESTE À FAIRE mis à jour.
  Export JSON supprimé du périmètre — SQL uniquement.

```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 2 — SCHÉMA SUPABASE (VALIDÉ — ARBITRAGE A4)

> Source : ARBITRAGES_A2_A2DORK_A4_V2_0_0.md · Validé par Manu 2026-03-21
> Fichier SQL cible : supabase/migrations/YYYYMMDD_collab.sql

### Décisions structurantes

```
- collab_projects.id : TEXT slug (ex: 'PROJET_A') — URL param ?project= conservé comme feature
- category_id : FK UUID → collab_categories.id — évolution propre, pas de dénormalisation
- Votes : tracking individuel (UNIQUE idea_id + user_id) — 1 vote par personne par idée
- votes_count : colonne dénormalisée sur collab_ideas, maintenue par triggers SQL
- Export JSON : supprimé — SQL uniquement
- TDZ ContextManager : logique à remplacer entièrement par collab_projects Supabase
```

### 4 tables + 2 triggers

#### collab_projects

```sql
CREATE TABLE public.collab_projects (
  id          TEXT PRIMARY KEY,                -- slug lisible (ex: 'PROJET_A') — URL param
  label       TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

#### collab_categories

```sql
CREATE TABLE public.collab_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  TEXT NOT NULL REFERENCES collab_projects(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'secondary',
  emoji       TEXT,
  position    SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

#### collab_ideas

```sql
CREATE TABLE public.collab_ideas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    TEXT NOT NULL REFERENCES collab_projects(id) ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES collab_categories(id) ON DELETE RESTRICT,
  text          TEXT NOT NULL,
  quadrant      TEXT CHECK (quadrant IN ('keep','start','stop','improve')),
  votes_count   SMALLINT NOT NULL DEFAULT 0,   -- dénormalisé — maintenu par triggers
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

#### collab_votes (tracking individuel)

```sql
CREATE TABLE public.collab_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id     UUID NOT NULL REFERENCES collab_ideas(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (idea_id, user_id)                    -- 1 vote par personne par idée — contrainte SQL
);
```

#### Triggers votes_count

```sql
-- Incrément au vote
CREATE OR REPLACE FUNCTION fn_increment_votes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.collab_ideas
  SET votes_count = votes_count + 1, updated_at = now()
  WHERE id = NEW.idea_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_votes
AFTER INSERT ON public.collab_votes
FOR EACH ROW EXECUTE FUNCTION fn_increment_votes_count();

-- Décrément au retrait de vote
CREATE OR REPLACE FUNCTION fn_decrement_votes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.collab_ideas
  SET votes_count = GREATEST(votes_count - 1, 0), updated_at = now()
  WHERE id = OLD.idea_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_decrement_votes
AFTER DELETE ON public.collab_votes
FOR EACH ROW EXECUTE FUNCTION fn_decrement_votes_count();
```

### RLS collab

```sql
-- Projets : lecture auth, CRUD admin
pol_collab_projects_read    : SELECT pour auth
pol_collab_projects_admin   : ALL pour admin

-- Catégories : lecture auth (actives), CRUD admin
pol_collab_categories_read  : SELECT pour auth WHERE is_active = true
pol_collab_categories_admin : ALL pour admin

-- Idées : lecture auth, création auth, modification auteur, suppression admin
pol_collab_ideas_read       : SELECT pour auth
pol_collab_ideas_insert     : INSERT pour auth
pol_collab_ideas_own_update : UPDATE pour auth WHERE created_by = auth.uid()
pol_collab_ideas_admin      : ALL pour admin

-- Votes : chacun gère les siens, 1 par idée garanti par UNIQUE
pol_collab_votes_read       : SELECT pour auth
pol_collab_votes_own        : INSERT · DELETE pour auth WHERE user_id = auth.uid()
pol_collab_votes_admin      : SELECT ALL pour admin
```

### Règle E9 — anti-régression critique

```
⚠ window.bdbUser.isAdmin — source unique après migration shell
⚠ Aucune requête user_roles ou profiles_directory dans ce module
⚠ localStorage CK_* → à supprimer intégralement après migration
⚠ ContextManager (TDZ critique) → à remplacer par requêtes collab_projects Supabase
   Ne pas réordonner les blocs JS existants avant la migration complète
⚠ votes_count = colonne dénormalisée — NE JAMAIS mettre à jour manuellement en JS
   Les triggers SQL sont la seule source de vérité
```

---

## ROLE

Outil collaboratif multi-tenant de gestion d'idées et de votes.
Permet de créer des projets, ajouter des idées par catégorie, voter.
Multi-tenant par URL param `?project=PROJET_A`.
Outil de brainstorming collectif.

## PORTÉE (POST-MIGRATION)

- Projets : création admin, sélection par URL param
- Idées : création membre, modification auteur, suppression admin
- Catégories : CRUD admin par projet
- Votes : 1 par membre par idée (tracking individuel)
- Quadrant : matrice impact/effort (keep/start/stop/improve)
- Rapport : statistiques par projet (votes, top idées, répartition)

## PORTÉE SUPPRIMÉE

- Export/import JSON — supprimé (SQL uniquement depuis migration)

## STACK TECHNIQUE ACTUELLE

HTML/JS vanilla · Bootstrap 5.3.2 · localStorage (préfixe `CK_`) — à migrer
`ContextManager`, `storage`, catégories, projects, crud : IIFEs inlinés dans index.html.

## POINT D'ATTENTION CRITIQUE — ORDRE DE CHARGEMENT JS (avant migration)

```
ORDRE OBLIGATOIRE : context.js DOIT précéder storage.js

Raison : const ContextManager crée une TDZ.
         Ne jamais réordonner sans vérification complète.

Ordre complet :
utils → context → storage → categories → projects → crud → crud_ui_helpers → report → exports → app
```

Ce point devient sans objet après migration — le ContextManager sera remplacé
par des requêtes directes sur collab_projects.

## CLÉS LOCALSTORAGE À SUPPRIMER (migration)

```
CK_{PROJECT_ID}_ideas
CK_{PROJECT_ID}_votes
CK_{PROJECT_ID}_matrix
CK_MIGRATION_V1_TO_V1_1_DONE
CK_CURRENT_PROJECT
collabkit_ideas   (legacy)
collabkit_votes   (legacy)
```

## ANTI-HALLUCINATION

```
- votes n'est PAS une table séparée d'items — c'est collab_votes (tracking user)
- votes_count dans collab_ideas = dénormalisé — maintenu par triggers uniquement
- Ne jamais mettre à jour votes_count manuellement en JS
- ContextManager = à remplacer, pas à étendre
- Export JSON = supprimé du périmètre — ne pas réimplémenter
- Les services JS (auth-service.js etc.) n'existent pas
```

## VOIX UTILISATEUR

Module de brainstorming collectif — utilisé par P7 et potentiellement P3.
Consulter PERSONAS_BDB_V1_3_0 pour tout nouveau contenu éditorial.

## AUTORISÉ

- Écrire le fichier SQL de migration (BLOC 2)
- Remplacer ContextManager + storage par des requêtes Supabase
- Migrer les catégories hardcodées vers collab_categories
- Externaliser le CSS dans boite-a-idees-ui.css

## INTERDIT

- Modifier les clés localStorage CK_ (migration en cours — ne pas étendre)
- Réordonner les blocs JS sans vérification TDZ (avant migration)
- CSS inline supplémentaire
- Ajouter de nouveaux `onclick=`
- Implémenter export/import JSON (supprimé du périmètre)
- Mettre à jour votes_count manuellement en JS (triggers uniquement)
- Modifier les 4 tables sans entree atelier_decisions

## DÉPENDANCES

```
ACTIVES :
- Bootstrap 5.3.2 (CDN)
- Bootstrap Icons 1.11.1 (CDN)

CIBLES POST-MIGRATION :
- window.bdb (supabase-client.js)
- bdb-shell.js v1.4.0 (window.bdbUser)
- cds-overrides.css v1.5.0
- boite-a-idees-ui.css (à créer)
```
