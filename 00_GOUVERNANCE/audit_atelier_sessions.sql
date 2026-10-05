-- ============================================================
-- AUDIT ATELIER_SESSIONS — État global complet
-- Date   : 2026-04-16
-- Usage  : SQL Editor Dashboard Supabase (lecture seule)
-- ============================================================

-- -------------------------------------------------------
-- 1. DISTRIBUTION DES STATUTS
-- -------------------------------------------------------
SELECT
  statut,
  COUNT(*) AS nb
FROM atelier_sessions
GROUP BY statut
ORDER BY nb DESC;

-- -------------------------------------------------------
-- 2. SESSIONS EN_COURS (doit être = 1 max)
-- -------------------------------------------------------
SELECT numero, titre, statut, date_debut, scope, objectifs
FROM atelier_sessions
WHERE statut = 'en_cours'
ORDER BY numero;

-- -------------------------------------------------------
-- 3. INCOHÉRENCES STATUT / DATES
-- -------------------------------------------------------

-- 3a. en_cours sans date_debut
SELECT numero, titre, statut, date_debut
FROM atelier_sessions
WHERE statut = 'en_cours' AND date_debut IS NULL;

-- 3b. fait sans date_fin
SELECT numero, titre, statut, date_debut, date_fin
FROM atelier_sessions
WHERE statut = 'fait' AND date_fin IS NULL
ORDER BY numero;

-- 3c. date_fin < date_debut (incohérence chronologique)
SELECT numero, titre, date_debut, date_fin
FROM atelier_sessions
WHERE date_fin IS NOT NULL
  AND date_debut IS NOT NULL
  AND date_fin < date_debut;

-- 3d. a_faire avec date_debut renseignée (ambiguïté)
SELECT numero, titre, statut, date_debut, date_fin
FROM atelier_sessions
WHERE statut = 'a_faire' AND date_debut IS NOT NULL;

-- -------------------------------------------------------
-- 4. SESSIONS ORPHELINES (sans contenu)
-- -------------------------------------------------------

-- 4a. Sans scope ET sans objectifs
SELECT numero, titre, statut
FROM atelier_sessions
WHERE (scope IS NULL OR scope = '')
  AND (objectifs IS NULL OR objectifs = '')
ORDER BY numero;

-- 4b. Sans livrables documentés (statut = fait)
SELECT numero, titre, statut, livrables
FROM atelier_sessions
WHERE statut = 'fait'
  AND (livrables IS NULL OR livrables = '')
ORDER BY numero DESC
LIMIT 20;

-- -------------------------------------------------------
-- 5. SESSIONS SANS DÉCISIONS LIÉES
-- -------------------------------------------------------
SELECT s.numero, s.titre, s.statut
FROM atelier_sessions s
LEFT JOIN atelier_decisions d ON d.session_num = s.numero
WHERE d.id IS NULL
ORDER BY s.numero;

-- -------------------------------------------------------
-- 6. GAP ANALYSIS — TROUS DANS LA NUMÉROTATION
-- -------------------------------------------------------
WITH numeros AS (
  SELECT numero FROM atelier_sessions
),
serie AS (
  SELECT generate_series(
    (SELECT MIN(numero) FROM atelier_sessions),
    (SELECT MAX(numero) FROM atelier_sessions)
  ) AS n
)
SELECT serie.n AS numero_manquant
FROM serie
LEFT JOIN numeros ON numeros.numero = serie.n
WHERE numeros.numero IS NULL
ORDER BY serie.n;

-- -------------------------------------------------------
-- 7. DOUBLONS DE NUMÉRO (ne devrait jamais arriver)
-- -------------------------------------------------------
SELECT numero, COUNT(*) AS occurrences
FROM atelier_sessions
GROUP BY numero
HAVING COUNT(*) > 1;

-- -------------------------------------------------------
-- 8. DÉPENDANCES NON RÉSOLUES
-- Sessions a_faire dont les dépendances ne sont pas toutes 'fait'
-- -------------------------------------------------------
SELECT
  s.numero,
  s.titre,
  s.statut,
  s.dependances,
  (
    SELECT array_agg(d.numero)
    FROM atelier_sessions d
    WHERE d.numero = ANY(s.dependances)
      AND d.statut != 'fait'
  ) AS dependances_non_resolues
FROM atelier_sessions s
WHERE s.statut = 'a_faire'
  AND s.dependances IS NOT NULL
  AND array_length(s.dependances, 1) > 0;

-- -------------------------------------------------------
-- 9. SESSIONS ABANDONNÉES — RAISON NON DOCUMENTÉE
-- -------------------------------------------------------
SELECT numero, titre, avancement, dependances
FROM atelier_sessions
WHERE statut = 'abandonne'
  AND (avancement IS NULL OR avancement = '');

-- -------------------------------------------------------
-- 10. VOLUME DÉCISIONS PAR SESSION (top 20)
-- -------------------------------------------------------
SELECT
  s.numero,
  s.titre,
  s.statut,
  COUNT(d.id) AS nb_decisions
FROM atelier_sessions s
LEFT JOIN atelier_decisions d ON d.session_num = s.numero
GROUP BY s.numero, s.titre, s.statut
ORDER BY s.numero DESC
LIMIT 20;

-- -------------------------------------------------------
-- 11. SESSIONS RÉCENTES — VUE CONSOLIDÉE
-- -------------------------------------------------------
SELECT
  numero,
  titre,
  statut,
  date_debut,
  date_fin,
  scope,
  LEFT(objectifs, 80) AS objectifs_court,
  LEFT(livrables, 80) AS livrables_court,
  duree_estimee
FROM atelier_sessions
ORDER BY numero DESC
LIMIT 10;

-- -------------------------------------------------------
-- 12. COMPTEURS GLOBAUX
-- -------------------------------------------------------
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE statut = 'fait') AS fait,
  COUNT(*) FILTER (WHERE statut = 'en_cours') AS en_cours,
  COUNT(*) FILTER (WHERE statut = 'a_faire') AS a_faire,
  COUNT(*) FILTER (WHERE statut = 'partiel') AS partiel,
  COUNT(*) FILTER (WHERE statut = 'abandonne') AS abandonne,
  MIN(numero) AS num_min,
  MAX(numero) AS num_max
FROM atelier_sessions;
