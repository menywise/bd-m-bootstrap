-- ============================================================
-- Migration 025 : 2 nouveaux protocoles neurochirurgie
-- Date : 2026-03-24
-- Source : Audit export OPTIM neuro (8711 lignes)
-- ============================================================
-- REGLE BDB : fichier .sql AVANT execution (INTERDIT-SQL-01)
-- Prerequis : 023 execute
-- ============================================================

BEGIN;

-- =============================================================
-- ACT-0423 : REPRISE DE CICATRICE DU RACHIS
-- 73 interventions dans l'export neuro
-- Acte neurochirurgical : reprise post-op rachis, position ventrale
-- =============================================================

INSERT INTO public.thesaurus_protocoles (
  id_protocole, libelle_cible, type, zone_anat, cat_parent,
  specialite, frequence, pareto, duree_minutes,
  pathologie, alertes, synonymes_recherche, codes_ccam,
  definition_expert, libelles_sources_lies, proposition_nouvel_acte_label
) VALUES (
  'ACT-0423',
  'REPRISE DE CICATRICE DU RACHIS',
  'NEURO',
  'RACHIS & NEURO-AXIAL',
  'RACHIS',
  'NEURO CHIRURGIE',
  0,
  'Standard',
  NULL,
  'Complication post-opératoire rachidienne',
  '',
  'reprise cicatrice|cicatrice rachis|désunion|reprise post-op rachis|fibrose post-op|reprise cutanée rachis|nécrose cicatricielle',
  'QZFA002',
  '',
  'REPRISE DE CICATRICE',
  ''
);

-- =============================================================
-- ACT-0424 : CANAL LOMBAIRE ÉTROIT > HERNIE DISCALE
-- 18 interventions dans l'export neuro (double geste)
-- Recalibrage + discectomie dans le même temps opératoire
-- =============================================================

INSERT INTO public.thesaurus_protocoles (
  id_protocole, libelle_cible, type, zone_anat, cat_parent,
  specialite, frequence, pareto, duree_minutes,
  pathologie, alertes, synonymes_recherche, codes_ccam,
  definition_expert, libelles_sources_lies, proposition_nouvel_acte_label
) VALUES (
  'ACT-0424',
  'CANAL LOMBAIRE ÉTROIT > HERNIE DISCALE',
  'NEURO',
  'RACHIS & NEURO-AXIAL',
  'RACHIS',
  'NEURO CHIRURGIE',
  0,
  'Secondaire',
  NULL,
  'Sténose canalaire lombaire avec hernie discale associée',
  '',
  'CLE + HD|recalibrage hernie|canal étroit hernie|sténose + discectomie|double geste lombaire',
  'LFFA001',
  '',
  'recalibrage + HD',
  ''
);

COMMIT;

-- ============================================================
-- VERIFICATION post-execution
-- ============================================================
-- SELECT id_protocole, libelle_cible, type, zone_anat
-- FROM public.thesaurus_protocoles
-- WHERE id_protocole IN ('ACT-0423', 'ACT-0424');
-- -- Attendu : 2 lignes
--
-- SELECT count(*) FROM public.thesaurus_protocoles;
-- -- Attendu : 412 (410 apres 023+024 + 2 nouveaux)
