-- ============================================================
-- S122 — Table atelier_audit_v5_runs (persistance L3)
-- Date : 2026-05-06
-- Objet : tracer chaque execution d audit qualite v5 + resultats par dimension
-- Couche : L3 (prefixe atelier_) — ne voyage jamais avec une instance vendue
-- ============================================================

-- Table principale : un enregistrement par dimension auditee par fichier
CREATE TABLE IF NOT EXISTS atelier_audit_v5_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL,                          -- regroupe les lignes d un meme run audit
  run_date TIMESTAMPTZ NOT NULL DEFAULT now(),

  famille TEXT NOT NULL,                         -- F01, F02, ..., F16
  dimension_ref TEXT NOT NULL,                   -- INTERDIT-A1, CONV-MODAL-08, F01-D03, etc.
  dimension_titre TEXT NOT NULL,                 -- titre humain de la dimension

  fichier TEXT NOT NULL,                         -- chemin relatif depuis racine projet
  surface TEXT,                                  -- module / site / racine / atelier / autre

  criticite TEXT NOT NULL CHECK (criticite IN ('P0','P1','P2','P3')),
  statut TEXT NOT NULL CHECK (statut IN ('OK','KO','NA','SKIP')),

  details JSONB DEFAULT '{}'::jsonb,             -- contexte (ex: ligne, valeur attendue vs trouvee)
  corrige_immediatement BOOLEAN DEFAULT false,

  session_audit INTEGER,                         -- numero session ayant lance l audit
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_v5_run_id ON atelier_audit_v5_runs (run_id);
CREATE INDEX IF NOT EXISTS idx_audit_v5_famille ON atelier_audit_v5_runs (famille);
CREATE INDEX IF NOT EXISTS idx_audit_v5_fichier ON atelier_audit_v5_runs (fichier);
CREATE INDEX IF NOT EXISTS idx_audit_v5_statut ON atelier_audit_v5_runs (statut);
CREATE INDEX IF NOT EXISTS idx_audit_v5_run_date ON atelier_audit_v5_runs (run_date DESC);

COMMENT ON TABLE atelier_audit_v5_runs IS
  'Persistance L3 des audits qualite migration v5. Une ligne = 1 dimension auditee sur 1 fichier dans 1 run. run_id regroupe les lignes d un meme run.';

-- ============================================================
-- Table secondaire : metadata des runs
-- ============================================================

CREATE TABLE IF NOT EXISTS atelier_audit_v5_run_meta (
  run_id UUID NOT NULL PRIMARY KEY,
  run_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_audit INTEGER,
  declenche_par TEXT DEFAULT 'manu',
  scope JSONB DEFAULT '{}'::jsonb,               -- {familles: [F01,F02], fichiers: [...]}

  total_dimensions INTEGER NOT NULL DEFAULT 0,
  total_ok INTEGER NOT NULL DEFAULT 0,
  total_ko INTEGER NOT NULL DEFAULT 0,
  total_na INTEGER NOT NULL DEFAULT 0,
  total_skip INTEGER NOT NULL DEFAULT 0,

  ko_p0 INTEGER NOT NULL DEFAULT 0,
  ko_p1 INTEGER NOT NULL DEFAULT 0,
  ko_p2 INTEGER NOT NULL DEFAULT 0,
  ko_p3 INTEGER NOT NULL DEFAULT 0,

  duree_ms INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_v5_meta_date ON atelier_audit_v5_run_meta (run_date DESC);

COMMENT ON TABLE atelier_audit_v5_run_meta IS
  'Metadata des runs d audit v5 : score global, scope, duree. 1 ligne = 1 run.';

-- ============================================================
-- RLS — Lecture creator + Manu, ecriture creator uniquement
-- ============================================================

ALTER TABLE atelier_audit_v5_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE atelier_audit_v5_run_meta ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les admins (et donc Manu createur)
DROP POLICY IF EXISTS audit_v5_runs_read ON atelier_audit_v5_runs;
CREATE POLICY audit_v5_runs_read ON atelier_audit_v5_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

DROP POLICY IF EXISTS audit_v5_meta_read ON atelier_audit_v5_run_meta;
CREATE POLICY audit_v5_meta_read ON atelier_audit_v5_run_meta
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

-- Ecriture : admin uniquement (Manu en pratique)
DROP POLICY IF EXISTS audit_v5_runs_admin_write ON atelier_audit_v5_runs;
CREATE POLICY audit_v5_runs_admin_write ON atelier_audit_v5_runs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

DROP POLICY IF EXISTS audit_v5_meta_admin_write ON atelier_audit_v5_run_meta;
CREATE POLICY audit_v5_meta_admin_write ON atelier_audit_v5_run_meta
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

-- ============================================================
-- TRACE DECISION
-- ============================================================

INSERT INTO atelier_decisions (ref, titre, description, statut, module_cible, session_num, type, tags)
VALUES (
  'D-2026-05-06-S122-01',
  'Migration S122 — table persistance audit v5 (atelier_audit_v5_runs + meta)',
  'Creation 2 tables L3 (prefixe atelier_) pour persister les runs audit v5 : runs (1 ligne par dimension auditee) + run_meta (1 ligne par run avec scores globaux). RLS admin-only. Reutilisable pour audits futurs (comparaison historique).',
  'active',
  'audit',
  122,
  'decision',
  ARRAY['audit','v5','atelier','persistance','migration','S122']::text[]
)
ON CONFLICT (ref) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'atelier_audit_v5%'
ORDER BY table_name;
