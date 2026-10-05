-- ============================================================
-- 015_objectifs.sql
-- Tables objectifs formation : semaines · criteres · evaluations
-- Réf   : DATA_MODEL §18 · vérifié terrain 2026-03-21
-- Statut: ✅ exécuté sur cloud (tables avec données réelles)
-- Note  : item_key = clé textuelle partagée avec livret_objectifs_items
--          et livret_progression — pas de FK formelle
-- ============================================================

-- objectifs_semaines (2 lignes en base)
CREATE TABLE IF NOT EXISTS public.objectifs_semaines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semaine_num integer NOT NULL,
  label       text NOT NULL,
  description text,
  position    integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.objectifs_semaines ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_semaines ON public.objectifs_semaines
  FOR SELECT TO anon USING (true);

CREATE POLICY member_read_semaines ON public.objectifs_semaines
  FOR SELECT TO authenticated USING (true);

CREATE POLICY admin_all_semaines ON public.objectifs_semaines
  FOR ALL TO authenticated USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- objectifs_criteres (39 lignes en base)
CREATE TABLE IF NOT EXISTS public.objectifs_criteres (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semaine_id      uuid NOT NULL REFERENCES public.objectifs_semaines(id),
  objectif_num    integer NOT NULL,
  objectif_label  text NOT NULL,
  critere_num     integer NOT NULL,
  critere_label   text NOT NULL,
  critere_detail  text,
  item_key        text NOT NULL,
  position        integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE public.objectifs_criteres ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_criteres ON public.objectifs_criteres
  FOR SELECT TO anon USING (true);

CREATE POLICY member_read_criteres ON public.objectifs_criteres
  FOR SELECT TO authenticated USING (true);

CREATE POLICY admin_all_criteres ON public.objectifs_criteres
  FOR ALL TO authenticated USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- objectifs_evaluations (3 lignes en base)
-- Lecture croisée interdite entre membres
CREATE TABLE IF NOT EXISTS public.objectifs_evaluations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  item_key    text NOT NULL,
  statut      text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.objectifs_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_own_read_evals ON public.objectifs_evaluations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY member_own_write_evals ON public.objectifs_evaluations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY admin_read_all_evals ON public.objectifs_evaluations
  FOR SELECT TO authenticated
  USING (bdb_is_admin());
