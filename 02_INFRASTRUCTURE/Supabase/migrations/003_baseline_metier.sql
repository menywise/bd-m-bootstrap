-- ============================================================
-- 003_baseline_metier.sql
-- Tables métier (schéma + RLS cloud exact)
-- Source : pg_policies + information_schema cloud 2026-03-22
-- Statut: ✅ exécuté — V3 corrigé audit RLS
-- ============================================================

-- ─── fiches_intervention ───

CREATE TABLE IF NOT EXISTS public.fiches_intervention (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  titre            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  etapes           jsonb NOT NULL DEFAULT '[]',
  duree_estimee    integer,
  tags             text[] NOT NULL DEFAULT '{}',
  status           text NOT NULL DEFAULT 'draft',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  last_modified_by uuid,
  is_dev           boolean NOT NULL DEFAULT false
);

ALTER TABLE public.fiches_intervention ENABLE ROW LEVEL SECURITY;

CREATE POLICY fiches_select_approved ON public.fiches_intervention
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY fiches_insert_admin ON public.fiches_intervention
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY fiches_update_admin ON public.fiches_intervention
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY fiches_delete_admin ON public.fiches_intervention
  FOR DELETE TO authenticated USING (is_admin());

-- ─── anatomie ───

CREATE TABLE IF NOT EXISTS public.anatomie (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  titre            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  region           text,
  tags             text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  last_modified_by uuid,
  is_dev           boolean NOT NULL DEFAULT false
);

ALTER TABLE public.anatomie ENABLE ROW LEVEL SECURITY;

CREATE POLICY anatomie_select_approved ON public.anatomie
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY anatomie_insert_admin ON public.anatomie
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY anatomie_update_admin ON public.anatomie
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY anatomie_delete_admin ON public.anatomie
  FOR DELETE TO authenticated USING (is_admin());

-- ─── installation_patient ───

CREATE TABLE IF NOT EXISTS public.installation_patient (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  titre            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  position         text,
  precautions      text,
  tags             text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  last_modified_by uuid,
  is_dev           boolean NOT NULL DEFAULT false
);

ALTER TABLE public.installation_patient ENABLE ROW LEVEL SECURITY;

CREATE POLICY installation_select_approved ON public.installation_patient
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY installation_insert_admin ON public.installation_patient
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY installation_update_admin ON public.installation_patient
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY installation_delete_admin ON public.installation_patient
  FOR DELETE TO authenticated USING (is_admin());

-- ─── cours ───

CREATE TABLE IF NOT EXISTS public.cours (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  titre            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  contenu          text NOT NULL DEFAULT '',
  niveau           text NOT NULL DEFAULT 'debutant',
  tags             text[] NOT NULL DEFAULT '{}',
  status           text NOT NULL DEFAULT 'draft',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  last_modified_by uuid,
  is_dev           boolean NOT NULL DEFAULT false
);

ALTER TABLE public.cours ENABLE ROW LEVEL SECURITY;

CREATE POLICY cours_select_approved ON public.cours
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY cours_insert_admin ON public.cours
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY cours_update_admin ON public.cours
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY cours_delete_admin ON public.cours
  FOR DELETE TO authenticated USING (is_admin());

-- ─── preferences_chirurgien ───

CREATE TABLE IF NOT EXISTS public.preferences_chirurgien (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chirurgien_id         uuid NOT NULL,
  fiche_intervention_id uuid,
  titre                 text NOT NULL,
  description           text NOT NULL DEFAULT '',
  preferences           jsonb NOT NULL DEFAULT '{}',
  is_global             boolean NOT NULL DEFAULT false,
  tags                  text[] NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  last_modified_by      uuid,
  is_dev                boolean NOT NULL DEFAULT false
);

ALTER TABLE public.preferences_chirurgien ENABLE ROW LEVEL SECURITY;

CREATE POLICY preferences_select_approved ON public.preferences_chirurgien
  FOR SELECT TO authenticated USING (is_approved());

CREATE POLICY preferences_insert_admin ON public.preferences_chirurgien
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY preferences_update_admin ON public.preferences_chirurgien
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY preferences_delete_admin ON public.preferences_chirurgien
  FOR DELETE TO authenticated USING (is_admin());

-- ─── transmissions ───

CREATE TABLE IF NOT EXISTS public.transmissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  category_id      uuid REFERENCES public.categories(id),
  title            text NOT NULL,
  content          text NOT NULL DEFAULT '',
  tags             text[] NOT NULL DEFAULT '{}',
  priority         boolean NOT NULL DEFAULT false,
  status           text NOT NULL DEFAULT 'open',
  type             text NOT NULL DEFAULT 'libre',
  last_modified_by uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  is_dev           boolean NOT NULL DEFAULT false
);

ALTER TABLE public.transmissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transmissions_select_published ON public.transmissions
  FOR SELECT TO authenticated
  USING ((status = 'published' AND is_approved()) OR user_id = auth.uid() OR is_admin());

CREATE POLICY transmissions_insert_approved ON public.transmissions
  FOR INSERT TO authenticated WITH CHECK (is_approved());

CREATE POLICY transmissions_update_own_or_admin ON public.transmissions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY transmissions_delete_admin ON public.transmissions
  FOR DELETE TO authenticated USING (is_admin());
