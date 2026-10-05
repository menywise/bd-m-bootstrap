-- ============================================================
-- Migration 026 : Recreer ACT-0207 (supprime par erreur dans 024)
-- Date : 2026-03-24
-- Contexte : ACT-0207 supprime dans 024 comme "EXCLUS generique"
--            mais 16 interventions neuro le referencent dans l'export OPTIM.
--            Acte reel : pose electrode test sous AL (pre-implantation neurostim)
-- ============================================================

BEGIN;

INSERT INTO public.thesaurus_protocoles (
  id_protocole, libelle_cible, type, zone_anat, cat_parent,
  specialite, frequence, pareto, duree_minutes,
  pathologie, alertes, synonymes_recherche, codes_ccam,
  definition_expert, libelles_sources_lies, proposition_nouvel_acte_label
) VALUES (
  'ACT-0207',
  'ÉLECTRODE DE PREMIÈRE INTENTION (SOUS ANESTHÉSIE LOCALE)',
  'NEURO',
  'RACHIS & NEURO-AXIAL',
  'RACHIS',
  'NEURO CHIRURGIE',
  0,
  'Secondaire',
  NULL,
  'Douleur chronique rachidienne',
  '',
  'electrode test|neurostimulation test|SCS test|premiere intention|anesthesie locale|electrode percutanee',
  'AZLA001',
  '',
  'ELECTRODE DE PREMIERE INTENTION (sous anesthésie locale)',
  ''
);

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- SELECT id_protocole, libelle_cible, type, zone_anat
-- FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0207';
