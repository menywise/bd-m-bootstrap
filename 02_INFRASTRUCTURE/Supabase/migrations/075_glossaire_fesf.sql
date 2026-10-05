-- 075_glossaire_fesf.sql
-- Glossaire : insertion FESF + propagation synonymes_recherche
-- INTERDIT-SQL-01 : fichier créé AVANT exécution
-- Exécuter via Supabase SQL Editor (superuser)

-- ═══ 1. INSERT glossaire ═══════════════════════════════════════
INSERT INTO glossaire (abbreviation, definition, usage_notes)
VALUES (
  'FESF',
  'Fracture de l''Extrémité Supérieure du Fémur',
  'Inclut fracture du col du fémur, fracture pertrochantérienne, fracture sous-trochantérienne. Fréquent en traumatologie (chute personne âgée). Abréviation courante dans les notes bloc OPTIM. Source : découverte notes interventions 2026-03-31.'
)
ON CONFLICT DO NOTHING;

-- ═══ 2. Vérification : protocoles candidats ═══════════════════
-- Exécuter d'abord en SELECT pour vérifier les cibles :
/*
SELECT id_protocole, libelle_cible, synonymes_recherche
FROM thesaurus_protocoles
WHERE libelle_cible ILIKE '%FRACTURE%FÉMUR%'
   OR libelle_cible ILIKE '%FRACTURE%FEMUR%'
   OR libelle_cible ILIKE '%COL%FÉMUR%'
   OR libelle_cible ILIKE '%COL%FEMUR%'
   OR libelle_cible ILIKE '%TROCHANTER%'
   OR libelle_cible ILIKE '%CLOU GAMMA%'
ORDER BY frequence DESC;
*/

-- ═══ 3. Propagation synonymes (APPEND seulement, jamais écrase) ═══
UPDATE thesaurus_protocoles
SET synonymes_recherche = CASE
      WHEN synonymes_recherche = '' THEN 'FESF|fracture col fémur'
      WHEN synonymes_recherche NOT ILIKE '%FESF%' THEN synonymes_recherche || '|FESF|fracture col fémur'
      ELSE synonymes_recherche
    END,
    updated_at = now()
WHERE (
    libelle_cible ILIKE '%FRACTURE%FÉMUR%'
    OR libelle_cible ILIKE '%FRACTURE%FEMUR%'
    OR libelle_cible ILIKE '%COL%FÉMUR%'
    OR libelle_cible ILIKE '%COL%FEMUR%'
    OR libelle_cible ILIKE '%TROCHANTER%'
    OR libelle_cible ILIKE '%CLOU GAMMA%'
  )
  AND synonymes_recherche NOT ILIKE '%FESF%';

-- ═══ 4. Vérification post-exécution ══════════════════════════
-- SELECT id_protocole, libelle_cible, synonymes_recherche
-- FROM thesaurus_protocoles WHERE synonymes_recherche ILIKE '%FESF%';
--
-- SELECT * FROM glossaire WHERE abbreviation = 'FESF';
