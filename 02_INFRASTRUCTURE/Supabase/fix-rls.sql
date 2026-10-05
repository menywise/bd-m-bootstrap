-- ============================================================
-- FIX-RLS.SQL — Réinitialisation des policies RLS
-- Bible de Bloc — Migration Lovable → Bootstrap
-- DATE    : 2026-03-06 (v2 — colonne email retirée)
-- USAGE CLOUD :
--   Supabase Dashboard → SQL Editor → coller → Run
-- USAGE LOCAL (CMD uniquement, pas PowerShell) :
--   docker cp C:\DEV\Supabase\fix-rls.sql supabase_db_ohccnwyziljqtyrtepel:/tmp/fix-rls.sql
--   docker exec -e PGCLIENTENCODING=UTF8 supabase_db_ohccnwyziljqtyrtepel psql -U postgres -d postgres -f /tmp/fix-rls.sql
-- ============================================================

-- ÉTAPE 1 — Supprimer toutes les policies existantes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END;
$$;

-- ÉTAPE 2 — Policies simples : authenticated = accès total
ALTER TABLE public.profiles_directory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etageres               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones_anatomiques      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_relations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_patient   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiches_intervention    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cours                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiel_types         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiel               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gants                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casaques               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences_chirurgien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anatomie               ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bdb_authenticated_all" ON public.profiles_directory     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.user_roles             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.profiles               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.categories             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.tags                   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.etageres               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.zones_anatomiques      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.content_types          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.content_images         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.content_relations      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.installation_patient   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.fiches_intervention    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.cours                  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.materiel_types         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.materiel               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.gants                  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.casaques               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.transmissions          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.preferences_chirurgien FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bdb_authenticated_all" ON public.anatomie               FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ÉTAPE 3 — Profil admin dans profiles_directory (sans colonne email)
INSERT INTO public.profiles_directory (user_id, nom, prenom, name, initials, fonction, approved, created_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'nom',     'Rohaut'),
  COALESCE(u.raw_user_meta_data->>'prenom',  'Manuel'),
  COALESCE(u.raw_user_meta_data->>'name',    'Manuel Rohaut'),
  COALESCE(u.raw_user_meta_data->>'initials','MR'),
  COALESCE(u.raw_user_meta_data->>'fonction','cadre'),
  true,
  now()
FROM auth.users u
WHERE u.email = 'manuel.rohaut@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles_directory p WHERE p.user_id = u.id);

-- ÉTAPE 4 — Rôle admin dans user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u
WHERE u.email = 'manuel.rohaut@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

-- VÉRIFICATION
SELECT 'policies bdb_authenticated_all' AS check, count(*)::text AS result FROM pg_policies WHERE schemaname = 'public' AND policyname = 'bdb_authenticated_all'
UNION ALL SELECT 'profiles_directory', count(*)::text FROM public.profiles_directory
UNION ALL SELECT 'user_roles',         count(*)::text FROM public.user_roles
UNION ALL SELECT 'admin present',      count(*)::text FROM public.user_roles WHERE role = 'admin';
