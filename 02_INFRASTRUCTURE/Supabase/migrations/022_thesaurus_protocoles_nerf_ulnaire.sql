-- ============================================================
-- Migration 022 — Thésaurus : 2 protocoles nerf ulnaire
-- BDB · 2026-03-24
-- INTERDIT-SQL-01 : fichier .sql AVANT exécution
-- ============================================================
-- Contexte : D-2026-03-24 session thésaurus
-- Source : analyse CCAM AHPA022 + validation medGPT + triangulation
-- Règle S3 : base vivante, voie d'abord = dimension structurante (S2)
-- ============================================================

-- ── Sécurité : vérifier le max id_protocole existant ──
-- Exécuter d'abord :
--   SELECT id_protocole FROM thesaurus_protocoles
--   WHERE id_protocole LIKE 'ACT-%'
--   ORDER BY id_protocole DESC LIMIT 5;
--
-- Si le dernier est > ACT-0422, ajuster les id_protocole ci-dessous.
-- ============================================================

INSERT INTO thesaurus_protocoles (
  id_protocole,
  libelle_cible,
  type,
  zone_anat,
  cat_parent,
  specialite,
  frequence,
  pareto,
  duree_minutes,
  pathologie,
  alertes,
  synonymes_recherche,
  codes_ccam,
  definition_expert,
  libelles_sources_lies,
  proposition_nouvel_acte_label
) VALUES

-- ── Protocole 1 : Neurolyse in situ ──
(
  'ACT-0421',
  'LIBÉRATION DU NERF ULNAIRE AU COUDE',
  'ORTHO',
  'COUDE',
  'NERF PÉRIPHÉRIQUE > NERF ULNAIRE',
  'Orthopédie',
  0,
  'Rare',
  40,
  'Syndrome du canal ulnaire',
  'Garrot pneumatique usage court|Position coude fléchi|Matériel microchirurgical|Risque lésion nerveuse directe',
  'nerf cubital|canal ulnaire|épitrochlée|gouttière épitrochléo-olécranienne|neurolyse ulnaire|cubital tunnel|libération nerf cubital|AHPA022',
  'AHPA022',
  'Neurolyse in situ du nerf ulnaire au coude par abord direct médial. Le geste consiste à libérer le nerf dans la gouttière épitrochléo-olécranienne sans le déplacer, en sectionnant l''arcade de Osborne et le fascia du fléchisseur ulnaire du carpe. Instrumentation fine de microchirurgie, garrot pneumatique brachial, durée moyenne 30-45 minutes.',
  '',
  ''
),

-- ── Protocole 2 : Transposition antérieure ──
(
  'ACT-0422',
  'TRANSPOSITION ANTÉRIEURE DU NERF ULNAIRE AU COUDE',
  'ORTHO',
  'COUDE',
  'NERF PÉRIPHÉRIQUE > NERF ULNAIRE',
  'Orthopédie',
  0,
  'Rare',
  75,
  'Syndrome du canal ulnaire',
  'Garrot pneumatique|Position coude fléchi|Matériel microchirurgical|Risque tension nerveuse excessive|Hémostase rigoureuse obligatoire',
  'nerf cubital|canal ulnaire|épitrochlée|gouttière épitrochléo-olécranienne|transposition ulnaire|cubital tunnel|transposition sous-cutanée|transposition sous-musculaire|AHPA022',
  'AHPA022',
  'Transposition antérieure du nerf ulnaire au coude par abord direct médial. Le nerf est libéré puis déplacé en avant de l''épicondyle médial (transposition sous-cutanée ou sous-musculaire selon indication). Geste plus long que la neurolyse simple, nécessite une hémostase minutieuse et une fixation du nerf en position antérieure. Durée moyenne 60-90 minutes.',
  '',
  ''
);

-- ── Vérification post-insertion ──
-- SELECT id_protocole, libelle_cible, type, zone_anat, duree_minutes
-- FROM thesaurus_protocoles
-- WHERE id_protocole IN ('ACT-0421', 'ACT-0422');
