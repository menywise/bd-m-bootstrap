-- Migration 077 : Module dork — schéma Supabase
-- Date : 2026-04-01
-- Auteur : Manu + Claude (session reconstruction dork)
-- Arbitrage : A2-dork SOLDÉ
-- Prérequis : aucun

-- ============================================================
-- TABLE 1 : dork_operators (référentiel partagé)
-- Opérateurs Google Search — lecture members, écriture admin
-- ============================================================

CREATE TABLE IF NOT EXISTS dork_operators (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  syntax        text NOT NULL,
  icon          text NOT NULL DEFAULT 'bi-code-slash',
  position      integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dork_operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dork_operators_member_read"
  ON dork_operators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "dork_operators_admin_all"
  ON dork_operators FOR ALL
  TO authenticated
  USING (public.bdb_is_admin());

-- ============================================================
-- TABLE 2 : dork_filetypes (référentiel partagé)
-- Types de fichiers — lecture members, écriture admin
-- ============================================================

CREATE TABLE IF NOT EXISTS dork_filetypes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL,
  extension     text NOT NULL,
  css_classes   text NOT NULL DEFAULT '',
  position      integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dork_filetypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dork_filetypes_member_read"
  ON dork_filetypes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "dork_filetypes_admin_all"
  ON dork_filetypes FOR ALL
  TO authenticated
  USING (public.bdb_is_admin());

-- ============================================================
-- TABLE 3 : dork_profiles (profils de recherche par utilisateur)
-- ============================================================

CREATE TABLE IF NOT EXISTS dork_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label                 text NOT NULL,
  icon                  text NOT NULL DEFAULT '🔍',
  description           text NOT NULL DEFAULT '',
  keywords              text[] NOT NULL DEFAULT '{}',
  exclusions            text[] NOT NULL DEFAULT '{}',
  enabled_operator_ids  uuid[] NOT NULL DEFAULT '{}',
  enabled_filetype_ids  uuid[] NOT NULL DEFAULT '{}',
  is_default            boolean NOT NULL DEFAULT false,
  position              integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dork_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dork_profiles_own"
  ON dork_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index sur user_id (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_dork_profiles_user
  ON dork_profiles(user_id);

-- ============================================================
-- TABLE 4 : dork_sources (sources fiables par profil)
-- ============================================================

CREATE TABLE IF NOT EXISTS dork_sources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES dork_profiles(id) ON DELETE CASCADE,
  label         text NOT NULL,
  domains       text[] NOT NULL DEFAULT '{}',
  weight        integer NOT NULL DEFAULT 3 CHECK (weight BETWEEN 1 AND 5),
  category      text NOT NULL DEFAULT 'other'
                CHECK (category IN ('institutional', 'academic', 'professional', 'other')),
  position      integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dork_sources ENABLE ROW LEVEL SECURITY;

-- RLS via jointure sur le profil parent (l'utilisateur possède le profil)
CREATE POLICY "dork_sources_own"
  ON dork_sources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dork_profiles dp
      WHERE dp.id = dork_sources.profile_id
        AND dp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dork_profiles dp
      WHERE dp.id = dork_sources.profile_id
        AND dp.user_id = auth.uid()
    )
  );

-- Index sur profile_id (jointures fréquentes)
CREATE INDEX IF NOT EXISTS idx_dork_sources_profile
  ON dork_sources(profile_id);

-- ============================================================
-- TABLE 5 : dork_history (historique des dorks par utilisateur)
-- Max 25 par user géré côté applicatif
-- ============================================================

CREATE TABLE IF NOT EXISTS dork_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id    uuid REFERENCES dork_profiles(id) ON DELETE SET NULL,
  label         text NOT NULL DEFAULT '',
  query         text NOT NULL,
  url           text NOT NULL,
  config        jsonb DEFAULT NULL,
  rating        integer NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  validated     boolean NOT NULL DEFAULT false,
  tags          text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dork_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dork_history_own"
  ON dork_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index sur user_id + tri par dernière utilisation
CREATE INDEX IF NOT EXISTS idx_dork_history_user_last
  ON dork_history(user_id, last_used DESC);

-- ============================================================
-- SEED : opérateurs Google Search par défaut
-- ============================================================

INSERT INTO dork_operators (label, description, syntax, icon, position) VALUES
  ('intitle',   'Mot-clé dans le titre de la page',          'intitle:{query}',   'bi-type-h1',       1),
  ('inurl',     'Mot-clé dans l''URL',                       'inurl:{query}',     'bi-link-45deg',    2),
  ('intext',    'Mot-clé dans le corps du texte',            'intext:{query}',    'bi-body-text',     3),
  ('site',      'Restreindre à un domaine',                  'site:{domain}',     'bi-globe2',        4),
  ('filetype',  'Type de fichier spécifique',                'filetype:{ext}',    'bi-file-earmark',  5),
  ('related',   'Sites similaires',                          'related:{domain}',  'bi-diagram-3',     6),
  ('cache',     'Version en cache Google',                   'cache:{url}',       'bi-clock-history', 7),
  ('define',    'Définition d''un terme',                    'define:{query}',    'bi-book',          8),
  ('OR',        'Alternative entre deux termes',             '{a} OR {b}',        'bi-signpost-split',9),
  ('exclude',   'Exclure un terme',                          '-{term}',           'bi-dash-circle',  10),
  ('exact',     'Expression exacte (guillemets)',            '"{query}"',         'bi-quote',        11)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED : types de fichiers par défaut
-- ============================================================

INSERT INTO dork_filetypes (label, extension, css_classes, position) VALUES
  ('PDF',   'pdf',  'bg-danger bg-opacity-10 text-danger',     1),
  ('DOC',   'doc',  'bg-primary bg-opacity-10 text-primary',   2),
  ('DOCX',  'docx', 'bg-primary bg-opacity-10 text-primary',   3),
  ('XLS',   'xls',  'bg-success bg-opacity-10 text-success',   4),
  ('XLSX',  'xlsx', 'bg-success bg-opacity-10 text-success',   5),
  ('PPT',   'ppt',  'bg-warning bg-opacity-10 text-warning',   6),
  ('PPTX',  'pptx', 'bg-warning bg-opacity-10 text-warning',   7),
  ('CSV',   'csv',  'bg-info bg-opacity-10 text-info',         8),
  ('TXT',   'txt',  'bg-secondary bg-opacity-10 text-secondary',9)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN MIGRATION 077
-- ============================================================
