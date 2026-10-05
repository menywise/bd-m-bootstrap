-- ============================================================
-- Migration 024 : Nettoyage zone_anat (EXCLUS + MULTIPLE)
-- Date : 2026-03-24
-- Prerequis : 023 execute
-- ============================================================
-- REGLE BDB : fichier .sql AVANT execution (INTERDIT-SQL-01)
-- A VALIDER par Manu AVANT execution dans SQL Editor cloud
-- ============================================================
--
-- SCOPE :
--   6  DELETE protocoles zone_anat=EXCLUS (FK -> NULL)
--   1  UPDATE ACT-0207 reclasse NEURO (conserve)
--   2  UPDATE zone_anat MULTIPLE -> MULTIPLES
--
-- Resultat attendu : 411 protocoles (417 - 6)
-- zone_anat EXCLUS et MULTIPLE disparaissent
-- ============================================================

BEGIN;

-- =============================================================
-- PHASE 1 : Reassigner FK avant suppression
-- =============================================================

UPDATE public.thesaurus_interventions
  SET protocole_id = NULL
  WHERE protocole_id IN (
    SELECT id FROM public.thesaurus_protocoles
    WHERE id_protocole IN (
      'ACT-0063', 'ACT-0065', 'ACT-0086',
      'ACT-0156', 'ACT-0159', 'ACT-0170'
    )
  );

-- =============================================================
-- PHASE 2 : DELETE 6 protocoles EXCLUS
-- =============================================================

DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0063';  -- REPRISE DE CICATRICE
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0065';  -- REDUCTION ORTHOPEDIQUE
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0086';  -- MORSURE DE CHAT / CHIEN
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0156';  -- EXPLORATION DE NERF
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0159';  -- ABLATION CLOU CENTROMEDULLAIRE
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0170';  -- ABLATION DE FIXATEUR EXTERNE

-- =============================================================
-- PHASE 2b : RECLASSER ACT-0207 (conserve, reclasse NEURO)
-- =============================================================

UPDATE public.thesaurus_protocoles SET
  libelle_cible = 'ÉLECTRODE DE PREMIÈRE INTENTION (SOUS ANESTHÉSIE LOCALE)',
  type = 'NEURO',
  zone_anat = 'RACHIS & NEURO-AXIAL',
  cat_parent = 'RACHIS',
  specialite = 'NEURO CHIRURGIE',
  updated_at = now()
WHERE id_protocole = 'ACT-0207';

-- =============================================================
-- PHASE 3 : Fusionner MULTIPLE → MULTIPLES
-- =============================================================

UPDATE public.thesaurus_protocoles
  SET zone_anat = 'MULTIPLES', updated_at = now()
  WHERE zone_anat = 'MULTIPLE';

COMMIT;

-- ============================================================
-- VERIFICATION post-execution
-- ============================================================
-- SELECT count(*) FROM public.thesaurus_protocoles;
-- -- Attendu : 411
--
-- SELECT id_protocole, libelle_cible, type, zone_anat
-- FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0207';
-- -- Attendu : NEURO, RACHIS & NEURO-AXIAL
--
-- SELECT zone_anat, count(*) FROM public.thesaurus_protocoles
-- GROUP BY zone_anat ORDER BY count(*) DESC;
-- -- EXCLUS et MULTIPLE ne doivent plus apparaitre
--
-- SELECT count(*) FROM public.thesaurus_interventions WHERE protocole_id IS NULL;
-- -- Comparer avec avant execution
