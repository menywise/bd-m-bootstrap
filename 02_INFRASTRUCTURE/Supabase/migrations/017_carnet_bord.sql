-- ============================================================
-- 017_carnet_bord.sql
-- Tables carnet de bord : categories · items · progressions
-- Source : information_schema cloud 2026-03-22
-- Réf   : DATA_MODEL §13 · D-2026-03-15-T12
-- Statut: ✅ exécuté sur cloud (découvert lors audit — non documenté JOURNAL)
-- Note  : DATA_MODEL disait "À créer" mais tables déjà présentes
-- ============================================================

-- ─── carnet_categories ───

CREATE TABLE IF NOT EXISTS public.carnet_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  color       text NOT NULL DEFAULT '#6c757d',
  icon        text NOT NULL DEFAULT 'bi-journal-medical',
  position    integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carnet_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY carnet_categories_select ON public.carnet_categories
  FOR SELECT USING (is_approved());

CREATE POLICY carnet_categories_admin_all ON public.carnet_categories
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── carnet_items ───

CREATE TABLE IF NOT EXISTS public.carnet_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.carnet_categories(id) ON DELETE CASCADE,
  sous_groupe text,
  label       text NOT NULL,
  position    integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  required    boolean NOT NULL DEFAULT false,
  resources   jsonb NOT NULL DEFAULT '[]',
  mentor_ids  uuid[] NOT NULL DEFAULT '{}',
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carnet_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY carnet_items_select ON public.carnet_items
  FOR SELECT USING (is_approved());

CREATE POLICY carnet_items_admin_all ON public.carnet_items
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- ─── carnet_progressions ───
-- Lecture croisée interdite entre membres (RÈGLE ABSOLUE)

CREATE TABLE IF NOT EXISTS public.carnet_progressions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id),
  item_id          uuid NOT NULL REFERENCES public.carnet_items(id) ON DELETE CASCADE,
  date_demo        date,
  date_accompagne  date,
  date_solo        date,
  niveau           text,
  note             text,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_carnet_prog UNIQUE (user_id, item_id)
);

ALTER TABLE public.carnet_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY carnet_prog_own_select ON public.carnet_progressions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY carnet_prog_own_write ON public.carnet_progressions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY carnet_prog_admin_read ON public.carnet_progressions
  FOR SELECT TO authenticated
  USING (is_admin());
