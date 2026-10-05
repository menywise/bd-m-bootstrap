-- ============================================================
-- 000_baseline_functions.sql
-- Helpers RLS utilisés par toutes les tables BDB
-- Réf    : JOURNAL BLOC FONDATION 2026-03-06/09 + D-2026-03-16-P6
-- Statut : ✅ exécuté sur cloud
-- ============================================================

-- is_admin() : vérifie si l'utilisateur courant a le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- is_approved() : vérifie si l'utilisateur courant est approuvé dans l'annuaire
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles_directory
    WHERE user_id = auth.uid()
      AND approved = true
  );
$$;

-- bdb_is_admin() : wrapper SECURITY DEFINER pour RLS avec rôle {public}
-- Créé D-2026-03-16-P6 pour app_modules visibility filtering
CREATE OR REPLACE FUNCTION public.bdb_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;
