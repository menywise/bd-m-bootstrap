-- ============================================================
-- MIGRATION 018 — THESAURUS (DDL + RLS + INDEX)
-- BDB · Supabase cloud
-- Réf : D-2026-03-13-001 · SUPABASE_DATA_MODEL V1.7.0
-- ============================================================
-- INTERDIT-SQL-01 : fichier .sql AVANT exécution

-- ── TABLE : thesaurus_protocoles (420 lignes attendues) ─────
CREATE TABLE IF NOT EXISTS public.thesaurus_protocoles (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_protocole                text NOT NULL,
  libelle_cible               text NOT NULL,
  pathologie                  text NOT NULL DEFAULT '',
  type                        text NOT NULL DEFAULT '',
  zone_anat                   text NOT NULL DEFAULT '',
  cat_parent                  text NOT NULL DEFAULT '',
  specialite                  text NOT NULL DEFAULT '',
  frequence                   integer NOT NULL DEFAULT 0,
  pareto                      text NOT NULL DEFAULT '',
  alertes                     text NOT NULL DEFAULT '',
  synonymes_recherche         text NOT NULL DEFAULT '',
  codes_ccam                  text NOT NULL DEFAULT '',
  proposition_nouvel_acte_label text NOT NULL DEFAULT '',
  definition_expert           text NOT NULL DEFAULT '',
  libelles_sources_lies       text NOT NULL DEFAULT '',
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT thesaurus_protocoles_id_protocole_unique UNIQUE (id_protocole)
);

COMMENT ON TABLE public.thesaurus_protocoles IS 'Référentiel 420 protocoles opératoires normalisés (Ortho/Neuro/Septique/Traumato)';

-- ── TABLE : thesaurus_interventions (70 361 lignes attendues) ─
CREATE TABLE IF NOT EXISTS public.thesaurus_interventions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chirurgien           text NOT NULL,
  date_intervention    date NOT NULL,
  protocole_operatoire text NOT NULL,
  specialite           text NOT NULL DEFAULT '',
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.thesaurus_interventions IS 'Historique 70 361 interventions (2006-2025) — données Pareto source';

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.thesaurus_protocoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thesaurus_interventions ENABLE ROW LEVEL SECURITY;

-- Protocoles : lecture membre approuvé, mutations admin
CREATE POLICY thesaurus_proto_select_approved
  ON public.thesaurus_protocoles FOR SELECT
  TO authenticated
  USING (is_approved());

CREATE POLICY thesaurus_proto_insert_admin
  ON public.thesaurus_protocoles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY thesaurus_proto_update_admin
  ON public.thesaurus_protocoles FOR UPDATE
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY thesaurus_proto_delete_admin
  ON public.thesaurus_protocoles FOR DELETE
  TO authenticated
  USING (is_admin());

-- Interventions : lecture membre approuvé, import admin
CREATE POLICY thesaurus_interv_select_approved
  ON public.thesaurus_interventions FOR SELECT
  TO authenticated
  USING (is_approved());

CREATE POLICY thesaurus_interv_insert_admin
  ON public.thesaurus_interventions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY thesaurus_interv_delete_admin
  ON public.thesaurus_interventions FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── INDEX performance (70K lignes) ──────────────────────────
CREATE INDEX idx_thesaurus_interv_chirurgien
  ON public.thesaurus_interventions (chirurgien);

CREATE INDEX idx_thesaurus_interv_protocole
  ON public.thesaurus_interventions (protocole_operatoire);

CREATE INDEX idx_thesaurus_interv_date
  ON public.thesaurus_interventions (date_intervention);

CREATE INDEX idx_thesaurus_interv_specialite
  ON public.thesaurus_interventions (specialite);

CREATE INDEX idx_thesaurus_proto_type
  ON public.thesaurus_protocoles (type);

CREATE INDEX idx_thesaurus_proto_zone
  ON public.thesaurus_protocoles (zone_anat);

CREATE INDEX idx_thesaurus_proto_frequence
  ON public.thesaurus_protocoles (frequence DESC);

-- ============================================================
-- FIN MIGRATION 018
-- Étape suivante : exécuter 018_thesaurus_seed_protocoles.sql
--                  puis 018_thesaurus_seed_interventions.sql
-- ============================================================
