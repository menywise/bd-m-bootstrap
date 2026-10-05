-- ============================================================
-- 001_baseline_users.sql
-- Tables : profiles · profiles_directory · user_roles
-- Enums : app_role
-- Source : pg_policies + information_schema cloud 2026-03-22
-- Statut: ✅ exécuté — V3 corrigé audit RLS
-- ============================================================

-- ─── ENUM app_role ───

CREATE TYPE public.app_role AS ENUM ('admin', 'membre');

-- ─── profiles (25 colonnes) ───
-- RLS activé SANS policy = deny-all intentionnel
-- Alimenté par trigger auth.users (SECURITY DEFINER bypass)
-- Aucun module JS ne fait .from('profiles') — tout passe par profiles_directory

CREATE TABLE IF NOT EXISTS public.profiles (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   text NOT NULL,
  name                    text NOT NULL DEFAULT '',
  initials                text NOT NULL DEFAULT '',
  nom                     text NOT NULL DEFAULT '',
  prenom                  text NOT NULL DEFAULT '',
  fonction                text NOT NULL DEFAULT 'infirmier',
  avatar_url              text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  approved                boolean NOT NULL DEFAULT false,
  bio                     text DEFAULT '',
  known_as                text DEFAULT '',
  signes_particuliers     text DEFAULT '',
  is_dev                  boolean NOT NULL DEFAULT false,
  telephone_principal     text DEFAULT '',
  telephone_secondaire    text DEFAULT '',
  secretaires             text DEFAULT '',
  taille_gants            text DEFAULT '',
  couleur_preferentielle  text DEFAULT '',
  gant_paire_1_id         uuid,
  gant_paire_2_id         uuid,
  casaque_id              uuid,
  porte_casque            boolean NOT NULL DEFAULT false,
  secretaires_list        jsonb NOT NULL DEFAULT '[]'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ⚠ ZÉRO policy = deny-all via API REST — C'EST INTENTIONNEL

-- ─── profiles_directory (TABLE — pas une vue) ───
-- pg_policies confirme 4 policies → c'est une table
-- id nullable (pas de PK formelle sur id)

CREATE TABLE IF NOT EXISTS public.profiles_directory (
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id                      uuid,
  name                    text,
  initials                text,
  nom                     text,
  prenom                  text,
  fonction                text,
  avatar_url              text,
  bio                     text,
  couleur_preferentielle  text,
  taille_gants            text,
  casaque_id              uuid,
  porte_casque            boolean,
  signes_particuliers     text,
  secretaires             text,
  secretaires_list        jsonb NOT NULL DEFAULT '[]',
  telephone_principal     text,
  telephone_secondaire    text,
  known_as                text,
  gant_paire_1_id         uuid,
  gant_paire_2_id         uuid,
  approved                boolean,
  is_dev                  boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  email                   text
);

ALTER TABLE public.profiles_directory ENABLE ROW LEVEL SECURITY;

-- RLS cloud exact (D-2026-03-20-T09)
CREATE POLICY profiles_directory_select_filtered ON public.profiles_directory
  FOR SELECT TO authenticated
  USING (is_admin() OR approved = true OR user_id = auth.uid());

CREATE POLICY profiles_directory_insert_own ON public.profiles_directory
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_directory_update_own ON public.profiles_directory
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY profiles_directory_delete_admin ON public.profiles_directory
  FOR DELETE TO authenticated
  USING (is_admin());

-- ─── user_roles ───

CREATE TABLE IF NOT EXISTS public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL DEFAULT 'membre',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_roles_select_authenticated ON public.user_roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY user_roles_insert_admin ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY user_roles_update_admin ON public.user_roles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY user_roles_delete_admin ON public.user_roles
  FOR DELETE TO authenticated
  USING (is_admin());
