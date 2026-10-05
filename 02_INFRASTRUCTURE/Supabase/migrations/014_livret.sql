-- ============================================================
-- 014_livret.sql
-- Tables livret d'accueil : secteurs · encadrement ·
--   objectifs_items · progression
-- Réf   : DATA_MODEL §17 · vérifié terrain 2026-03-21
-- Statut: ✅ exécuté sur cloud (tables avec données réelles)
-- ============================================================

-- livret_secteurs (6 lignes en base)
CREATE TABLE IF NOT EXISTS public.livret_secteurs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL,
  label         text NOT NULL,
  salles        text,
  qualif_salles text,
  effectif      text,
  description   text,
  actes         text,
  couleur_hex   text NOT NULL DEFAULT '#6c757d',
  icone_bi      text NOT NULL DEFAULT 'bi-hospital',
  position      integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.livret_secteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_sec ON public.livret_secteurs
  FOR SELECT TO anon USING (true);

CREATE POLICY member_read_sec ON public.livret_secteurs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY admin_all_sec ON public.livret_secteurs
  FOR ALL TO authenticated USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- livret_encadrement (9 lignes en base)
CREATE TABLE IF NOT EXISTS public.livret_encadrement (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES auth.users(id),
  nom_local     text,
  prenom_local  text,
  telephone     text,
  role_label    text NOT NULL,
  position      integer NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.livret_encadrement ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_enc ON public.livret_encadrement
  FOR SELECT TO anon USING (true);

CREATE POLICY member_read_enc ON public.livret_encadrement
  FOR SELECT TO authenticated USING (true);

CREATE POLICY admin_all_enc ON public.livret_encadrement
  FOR ALL TO authenticated USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- livret_objectifs_items (49 lignes en base)
CREATE TABLE IF NOT EXISTS public.livret_objectifs_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terme         text NOT NULL,
  domaine_key   text NOT NULL,
  domaine_label text NOT NULL,
  domaine_icone text NOT NULL DEFAULT 'bi-check-circle',
  item_key      text NOT NULL,
  item_label    text NOT NULL,
  item_detail   text,
  position      integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.livret_objectifs_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_items ON public.livret_objectifs_items
  FOR SELECT TO anon USING (true);

CREATE POLICY member_read_items ON public.livret_objectifs_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY admin_all_items ON public.livret_objectifs_items
  FOR ALL TO authenticated USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- livret_progression (0 ligne — table vide)
-- Lecture croisée interdite entre membres
CREATE TABLE IF NOT EXISTS public.livret_progression (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  item_key    text NOT NULL,
  statut      text NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.livret_progression ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_own_read_prog ON public.livret_progression
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY member_own_write_prog ON public.livret_progression
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY admin_read_all_prog ON public.livret_progression
  FOR SELECT TO authenticated
  USING (bdb_is_admin());
