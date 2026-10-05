-- ============================================================
-- 013_supervision.sql
-- Tables supervision : config · rules · rule_delta · sessions
-- Source : pg_policies cloud 2026-03-22
-- Statut: ✅ exécuté — V2 corrigé audit RLS (is_admin + {public})
-- ============================================================

-- supervision_config
CREATE TABLE IF NOT EXISTS public.supervision_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_key         text NOT NULL,
  version_active  text NOT NULL,
  version_draft   text,
  validated_by    uuid REFERENCES auth.users(id),
  validated_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supervision_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY supervision_config_admin_select ON public.supervision_config
  FOR SELECT TO public USING (is_admin());

CREATE POLICY supervision_config_admin_write ON public.supervision_config
  FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

-- supervision_rules
CREATE TABLE IF NOT EXISTS public.supervision_rules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_key      text NOT NULL,
  version      text NOT NULL,
  rule_key     text NOT NULL,
  rule_label   text NOT NULL,
  rule_type    text NOT NULL,
  rule_pattern text,
  is_active    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supervision_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY supervision_rules_admin_select ON public.supervision_rules
  FOR SELECT TO public USING (is_admin());

CREATE POLICY supervision_rules_admin_write ON public.supervision_rules
  FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

-- supervision_rule_delta
CREATE TABLE IF NOT EXISTS public.supervision_rule_delta (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_key      text NOT NULL,
  version_from text NOT NULL,
  version_to   text NOT NULL,
  rule_key     text NOT NULL,
  delta_type   text NOT NULL,
  old_value    text,
  new_value    text,
  status       text NOT NULL DEFAULT 'pending',
  reviewed_by  uuid REFERENCES auth.users(id),
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supervision_rule_delta ENABLE ROW LEVEL SECURITY;

CREATE POLICY supervision_rule_delta_admin_select ON public.supervision_rule_delta
  FOR SELECT TO public USING (is_admin());

CREATE POLICY supervision_rule_delta_admin_write ON public.supervision_rule_delta
  FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

-- supervision_sessions
CREATE TABLE IF NOT EXISTS public.supervision_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key  text NOT NULL,
  objective   text NOT NULL,
  prompt_used text,
  notes       text,
  status      text NOT NULL DEFAULT 'planned',
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.supervision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY supervision_sessions_admin_select ON public.supervision_sessions
  FOR SELECT TO public USING (is_admin());

CREATE POLICY supervision_sessions_admin_write ON public.supervision_sessions
  FOR ALL TO public USING (is_admin()) WITH CHECK (is_admin());

-- ─── SEED supervision_config (7 documents) ───

INSERT INTO public.supervision_config (doc_key, version_active) VALUES
  ('NOYAU_VERITE',          'V2_5_0'),
  ('JOURNAL_DECISIONS',     'V1_19_0'),
  ('CHANTIER_TECHNIQUE',    'V1_0_6'),
  ('GUIDE_TRAVAIL_SESSION', 'V1_2_2'),
  ('SUPABASE_DATA_MODEL',   'V1_7_0'),
  ('MODULE_DEPENDENCY_MAP', 'V1_4_0'),
  ('BACKLOG_SESSIONS',      'V2_4_0')
ON CONFLICT DO NOTHING;
