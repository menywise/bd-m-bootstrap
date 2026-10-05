-- ============================================================
-- MIGRATION 018b — THESAURUS RPC (fonctions DISTINCT)
-- Évite de charger 70K lignes pour obtenir 10 chirurgiens
-- ============================================================

CREATE OR REPLACE FUNCTION public.thesaurus_distinct_chirurgiens()
RETURNS TABLE(chirurgien text)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT DISTINCT i.chirurgien
  FROM public.thesaurus_interventions i
  ORDER BY i.chirurgien;
$$;

CREATE OR REPLACE FUNCTION public.thesaurus_distinct_annees()
RETURNS TABLE(annee text)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT DISTINCT EXTRACT(YEAR FROM i.date_intervention)::text AS annee
  FROM public.thesaurus_interventions i
  ORDER BY annee DESC;
$$;

-- Accès authentifié uniquement
GRANT EXECUTE ON FUNCTION public.thesaurus_distinct_chirurgiens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.thesaurus_distinct_annees() TO authenticated;

-- ============================================================
-- FIN 018b — résultat attendu :
--   thesaurus_distinct_chirurgiens() → 10 lignes
--   thesaurus_distinct_annees()      → ~20 lignes
-- ============================================================
