-- ============================================================
-- 004_baseline_materiel.sql
-- Tables matériel : materiel · materiel_types · zones_anatomiques ·
--   zones_stockage · etageres
-- Source : information_schema cloud 2026-03-22
-- Réf   : DATA_MODEL §8 · JOURNAL BLOC FONDATION 2026-03-06/09
-- Statut: ✅ exécuté sur cloud — CORRIGÉ par audit conformité
-- ============================================================

-- ─── materiel_types ───

CREATE TABLE IF NOT EXISTS public.materiel_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  description text,
  color       text,
  icon        text,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.materiel_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY materiel_types_select ON public.materiel_types
  FOR SELECT USING (is_approved());

CREATE POLICY materiel_types_admin_all ON public.materiel_types
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── zones_anatomiques ───

CREATE TABLE IF NOT EXISTS public.zones_anatomiques (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  description text,
  color       text,
  icon        text,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.zones_anatomiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY zones_anatomiques_select ON public.zones_anatomiques
  FOR SELECT USING (is_approved());

CREATE POLICY zones_anatomiques_admin_all ON public.zones_anatomiques
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── zones_stockage ───

CREATE TABLE IF NOT EXISTS public.zones_stockage (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label             text NOT NULL,
  zone_anatomique_id uuid REFERENCES public.zones_anatomiques(id),
  description       text,
  active            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE public.zones_stockage ENABLE ROW LEVEL SECURITY;

CREATE POLICY zones_stockage_select ON public.zones_stockage
  FOR SELECT USING (is_approved());

CREATE POLICY zones_stockage_admin_all ON public.zones_stockage
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── etageres ───

CREATE TABLE IF NOT EXISTS public.etageres (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label            text NOT NULL,
  zone_stockage_id uuid REFERENCES public.zones_stockage(id),
  position         integer,
  active           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.etageres ENABLE ROW LEVEL SECURITY;

CREATE POLICY etageres_select ON public.etageres
  FOR SELECT USING (is_approved());

CREATE POLICY etageres_admin_all ON public.etageres
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── materiel (sans les 4 FK ajoutées en 007) ───

CREATE TABLE IF NOT EXISTS public.materiel (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  nom              text NOT NULL,
  reference        text,
  description      text NOT NULL DEFAULT '',
  statut           text NOT NULL DEFAULT 'disponible',
  localisation     text,
  tags             text[] NOT NULL DEFAULT '{}',
  priority         boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  last_modified_by uuid,
  is_dev           boolean NOT NULL DEFAULT false
);

-- ⚠ Les 4 colonnes FK (materiel_type_id, zone_anatomique_id,
--   zone_stockage_id, etagere_id) sont ajoutées dans 007_materiel_fk_columns.sql

ALTER TABLE public.materiel ENABLE ROW LEVEL SECURITY;

CREATE POLICY materiel_select ON public.materiel
  FOR SELECT USING (is_approved());

CREATE POLICY materiel_admin_all ON public.materiel
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());
