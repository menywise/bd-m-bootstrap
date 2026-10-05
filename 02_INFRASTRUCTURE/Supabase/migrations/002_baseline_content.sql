-- ============================================================
-- 002_baseline_content.sql
-- Tables structuration contenu (schéma + RLS cloud exact)
-- Enums : tag_type
-- Source : pg_policies + information_schema cloud 2026-03-22
-- Statut: ✅ exécuté — V3 corrigé audit RLS
-- ============================================================

-- ─── ENUM tag_type ───

CREATE TYPE public.tag_type AS ENUM (
  'libre', 'fonction', 'anatomie', 'materiel', 'instrument'
);

-- ─── content_types ───

CREATE TABLE IF NOT EXISTS public.content_types (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL,
  label       text NOT NULL,
  icon        text NOT NULL DEFAULT 'FileText',
  color       text NOT NULL DEFAULT 'blue',
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_types_select_approved ON public.content_types
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY content_types_insert_admin ON public.content_types
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY content_types_update_admin ON public.content_types
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY content_types_delete_admin ON public.content_types
  FOR DELETE TO authenticated USING (is_admin());

-- ─── categories ───

CREATE TABLE IF NOT EXISTS public.categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label           text NOT NULL,
  icon            text NOT NULL DEFAULT 'FileText',
  color           text NOT NULL DEFAULT 'blue',
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  content_type_id uuid REFERENCES public.content_types(id)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_select_approved ON public.categories
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY categories_insert_admin ON public.categories
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY categories_update_admin ON public.categories
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY categories_delete_admin ON public.categories
  FOR DELETE TO authenticated USING (is_admin());

-- ─── tags ───

CREATE TABLE IF NOT EXISTS public.tags (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_display    text NOT NULL,
  label_normalized text NOT NULL,
  type             public.tag_type NOT NULL DEFAULT 'libre',
  glossary_id      uuid,
  created_by       uuid REFERENCES auth.users(id),
  is_locked        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_select_approved ON public.tags
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY tags_insert_admin ON public.tags
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY tags_update_admin ON public.tags
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY tags_delete_admin ON public.tags
  FOR DELETE TO authenticated USING (is_admin());

-- ─── tag_links ───

CREATE TABLE IF NOT EXISTS public.tag_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id       uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id   uuid NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tag_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY tag_links_select_approved ON public.tag_links
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY tag_links_insert_approved ON public.tag_links
  FOR INSERT TO authenticated WITH CHECK (is_approved());

CREATE POLICY tag_links_update_admin ON public.tag_links
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY tag_links_delete_admin ON public.tag_links
  FOR DELETE TO authenticated USING (is_admin());

-- ─── content_images ───

CREATE TABLE IF NOT EXISTS public.content_images (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type_id uuid NOT NULL,
  content_id      uuid NOT NULL,
  storage_path    text NOT NULL,
  position        integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  is_dev          boolean NOT NULL DEFAULT false
);

ALTER TABLE public.content_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_images_select_approved ON public.content_images
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY content_images_insert_approved ON public.content_images
  FOR INSERT TO authenticated WITH CHECK (is_approved());

CREATE POLICY content_images_update_admin ON public.content_images
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY content_images_delete_admin ON public.content_images
  FOR DELETE TO authenticated USING (is_admin());

-- ─── content_relations ───

CREATE TABLE IF NOT EXISTS public.content_relations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type_id  uuid NOT NULL,
  source_id       uuid NOT NULL,
  target_type_id  uuid NOT NULL,
  target_id       uuid NOT NULL,
  relation_type   text NOT NULL DEFAULT 'reference',
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  is_dev          boolean NOT NULL DEFAULT false
);

ALTER TABLE public.content_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_relations_select_approved ON public.content_relations
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY content_relations_insert_admin ON public.content_relations
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY content_relations_update_admin ON public.content_relations
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY content_relations_delete_admin ON public.content_relations
  FOR DELETE TO authenticated USING (is_admin());
