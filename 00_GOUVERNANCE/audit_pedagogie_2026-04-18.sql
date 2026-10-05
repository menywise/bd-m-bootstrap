-- =============================================================
-- AUDIT PÉDAGOGIE — Recherche traces Boudreault/CRAIE/Kolb/REMC/
--                   Poulet Rôti/Portes d'entrées dans la base
-- Date  : 2026-04-18
-- But   : Vérifier ce qui existe VRAIMENT avant de conclure au "gap"
-- =============================================================

-- 1. Tous les principes nommés (pédagogie, mental models)
SELECT ref, titre, source, marqueur, statut
FROM atelier_principes
WHERE categorie = 'principe_nomme'
ORDER BY ref;

-- 2. Recherche textuelle LARGE dans atelier_principes
SELECT ref, categorie, titre,
       LEFT(description, 120) AS description_extrait,
       source
FROM atelier_principes
WHERE
     titre       ILIKE '%boudreault%' OR description ILIKE '%boudreault%' OR source ILIKE '%boudreault%'
  OR titre       ILIKE '%craie%'      OR description ILIKE '%craie%'      OR source ILIKE '%craie%'
  OR titre       ILIKE '%kolb%'       OR description ILIKE '%kolb%'       OR source ILIKE '%kolb%'
  OR titre       ILIKE '%remc%'       OR description ILIKE '%remc%'       OR source ILIKE '%remc%'
  OR titre       ILIKE '%poulet%'     OR description ILIKE '%poulet%'     OR source ILIKE '%poulet%'
  OR titre       ILIKE '%porte%entr%' OR description ILIKE '%porte%entr%' OR source ILIKE '%porte%entr%'
  OR titre       ILIKE '%andragogie%' OR description ILIKE '%andragogie%' OR source ILIKE '%andragogie%'
  OR titre       ILIKE '%gardner%'    OR description ILIKE '%gardner%'    OR source ILIKE '%gardner%'
  OR titre       ILIKE '%temps complexe%' OR description ILIKE '%temps complexe%'
  OR titre       ILIKE '%comprendre%apprendre%' OR description ILIKE '%comprendre%apprendre%'
ORDER BY categorie, ref;

-- 3. Recherche dans atelier_decisions (historique des arbitrages)
SELECT ref, date, titre, module_cible,
       LEFT(description, 150) AS description_extrait
FROM atelier_decisions
WHERE
     titre       ILIKE '%boudreault%' OR description ILIKE '%boudreault%'
  OR titre       ILIKE '%craie%'      OR description ILIKE '%craie%'
  OR titre       ILIKE '%kolb%'       OR description ILIKE '%kolb%'
  OR titre       ILIKE '%remc%'       OR description ILIKE '%remc%'
  OR titre       ILIKE '%poulet%'     OR description ILIKE '%poulet%'
  OR titre       ILIKE '%porte%entr%' OR description ILIKE '%porte%entr%'
  OR titre       ILIKE '%pedagogie%'  OR description ILIKE '%pedagogie%'
  OR titre       ILIKE '%andragogie%' OR description ILIKE '%andragogie%'
ORDER BY date DESC;

-- 4. Recherche dans atelier_sessions (scope, objectifs, avancement)
SELECT numero, titre, statut,
       LEFT(COALESCE(scope, ''), 100)     AS scope_extrait,
       LEFT(COALESCE(objectifs, ''), 100) AS objectifs_extrait
FROM atelier_sessions
WHERE
     titre     ILIKE '%boudreault%' OR scope ILIKE '%boudreault%' OR objectifs ILIKE '%boudreault%'
  OR titre     ILIKE '%craie%'      OR scope ILIKE '%craie%'      OR objectifs ILIKE '%craie%'
  OR titre     ILIKE '%kolb%'       OR scope ILIKE '%kolb%'       OR objectifs ILIKE '%kolb%'
  OR titre     ILIKE '%remc%'       OR scope ILIKE '%remc%'       OR objectifs ILIKE '%remc%'
  OR titre     ILIKE '%poulet%'     OR scope ILIKE '%poulet%'     OR objectifs ILIKE '%poulet%'
  OR titre     ILIKE '%porte%entr%' OR scope ILIKE '%porte%entr%' OR objectifs ILIKE '%porte%entr%'
  OR titre     ILIKE '%pedagogie%'  OR scope ILIKE '%pedagogie%'  OR objectifs ILIKE '%pedagogie%'
ORDER BY numero DESC;

-- 5. Recherche dans bdb_principes (principes L1 opérationnels, 32 règles UX + autres)
SELECT id, domaine, titre,
       LEFT(contenu, 120) AS contenu_extrait
FROM bdb_principes
WHERE
     titre   ILIKE '%boudreault%' OR contenu ILIKE '%boudreault%'
  OR titre   ILIKE '%craie%'      OR contenu ILIKE '%craie%'
  OR titre   ILIKE '%kolb%'       OR contenu ILIKE '%kolb%'
  OR titre   ILIKE '%remc%'       OR contenu ILIKE '%remc%'
  OR titre   ILIKE '%poulet%'     OR contenu ILIKE '%poulet%'
  OR titre   ILIKE '%porte%entr%' OR contenu ILIKE '%porte%entr%'
  OR titre   ILIKE '%pedagogie%'  OR contenu ILIKE '%pedagogie%'
  OR domaine ILIKE '%pedagog%';

-- 6. Compte global par catégorie (pour vérifier distribution)
SELECT categorie, marqueur, COUNT(*) AS nb
FROM atelier_principes
WHERE statut = 'active'
GROUP BY categorie, marqueur
ORDER BY categorie, marqueur;
