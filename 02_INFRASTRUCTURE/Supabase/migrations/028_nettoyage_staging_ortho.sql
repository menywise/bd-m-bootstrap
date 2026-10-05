-- ============================================================
-- Migration 028 — Nettoyage systematique staging_interventions_ortho
-- Date    : 2026-03-25
-- Source  : CONVENTIONS_NOMMAGE_THESAURUS V1.0.0 (regles 30-37)
--           CTX_EXPORT_LOGICIEL_METIER V1.1.0 (R1-R12)
-- Pre-requis : 027 executee, CSV importe, chirurgiens hors scope supprimes
-- ============================================================

-- ============================================================
-- ETAT AVANT : ~80 452 lignes (80491 - 11 hors scope - 6 HM_SIG vides
--              - 11 drain redon - 282 A DEFINIR sans info = verifier)
-- ============================================================

-- Compteur avant
SELECT count(*) AS lignes_avant FROM staging_interventions_ortho;

-- ============================================================
-- PASS 1 — PROTOCOLE_OPERATOIRE : nettoyage texte (regles 30-34)
-- ============================================================

-- 1a. Retirer suffix nom chirurgien (regle 30-32)
-- Patterns : "-DR NOM", "- DR NOM", "- Dr NOM", "VA- DR NOM", "-NOM"
-- On construit la liste depuis les 12 chirurgiens connus (actifs + retraites)
UPDATE staging_interventions_ortho
SET protocole_operatoire = TRIM(REGEXP_REPLACE(
  protocole_operatoire,
  '\s*-?\s*(?:VA\s*-?\s*)?(?:DR\.?|Dr\.?)\s+(LOUISIA|PICOULEAU|BOSCHER|VACQUERIE|ALAIN|DOTZIS|MARCZUK|COSTE|CHROSCIANY|FOURASTIER|VAQUIER|LAGARRIGUE)\s*$',
  '',
  'i'
))
WHERE protocole_operatoire ~* '(?:DR\.?|Dr\.?)\s+(LOUISIA|PICOULEAU|BOSCHER|VACQUERIE|ALAIN|DOTZIS|MARCZUK|COSTE|CHROSCIANY|FOURASTIER|VAQUIER|LAGARRIGUE)\s*$';

-- 1b. Retirer suffix chirurgien sans prefix DR (ex: "...- PICOULEAU")
UPDATE staging_interventions_ortho
SET protocole_operatoire = TRIM(REGEXP_REPLACE(
  protocole_operatoire,
  '\s*-\s*(LOUISIA|PICOULEAU|BOSCHER|VACQUERIE|ALAIN|DOTZIS|MARCZUK|COSTE|CHROSCIANY|FOURASTIER|VAQUIER|LAGARRIGUE)\s*$',
  '',
  'i'
))
WHERE protocole_operatoire ~* '-\s*(LOUISIA|PICOULEAU|BOSCHER|VACQUERIE|ALAIN|DOTZIS|MARCZUK|COSTE|CHROSCIANY|FOURASTIER|VAQUIER|LAGARRIGUE)\s*$';

-- 1c. TRIM espaces multiples et extremites (regle 34)
UPDATE staging_interventions_ortho
SET protocole_operatoire = TRIM(REGEXP_REPLACE(protocole_operatoire, '\s{2,}', ' ', 'g'))
WHERE protocole_operatoire ~ '\s{2,}' OR protocole_operatoire != TRIM(protocole_operatoire);

-- 1d. UPPER protocole_operatoire (homogeneiser la casse)
UPDATE staging_interventions_ortho
SET protocole_operatoire = UPPER(protocole_operatoire)
WHERE protocole_operatoire != UPPER(protocole_operatoire);

-- ============================================================
-- PASS 2 — RGPD : troncature dates (regle 36, R9, R10)
-- Jours et horaires DETRUITS — stockage YYYY-MM-01
-- ============================================================

-- 2a. Parser les formats date variables et tronquer au 1er du mois
-- Format OPTIM observe : M/D/YY HH:MM ou MM/DD/YYYY ou YYYY-MM-DD
UPDATE staging_interventions_ortho
SET date_clean = date_trunc('month',
  CASE
    -- Format US avec heure : M/D/YY HH:MM ou M/D/YYYY HH:MM
    WHEN date_intervention ~ '^\d{1,2}/\d{1,2}/\d{2,4}\s' THEN
      to_date(split_part(date_intervention, ' ', 1), 'MM/DD/YYYY')
    -- Format US sans heure : M/D/YY ou M/D/YYYY
    WHEN date_intervention ~ '^\d{1,2}/\d{1,2}/\d{2,4}$' THEN
      to_date(date_intervention, 'MM/DD/YYYY')
    -- Format ISO : YYYY-MM-DD
    WHEN date_intervention ~ '^\d{4}-\d{2}-\d{2}' THEN
      to_date(substring(date_intervention FROM '^\d{4}-\d{2}-\d{2}'), 'YYYY-MM-DD')
    ELSE NULL
  END
)::date
WHERE date_clean IS NULL AND date_intervention IS NOT NULL AND date_intervention != '';

-- 2b. Audit : combien de dates non parsees ?
SELECT count(*) AS dates_non_parsees
FROM staging_interventions_ortho
WHERE date_clean IS NULL AND date_intervention IS NOT NULL AND date_intervention != '';

-- ============================================================
-- PASS 3 — NOTES : nettoyage residuel
-- ============================================================

-- 3a. TRIM notes
UPDATE staging_interventions_ortho
SET note = TRIM(REGEXP_REPLACE(note, '\s{2,}', ' ', 'g'))
WHERE note IS NOT NULL AND (note ~ '\s{2,}' OR note != TRIM(note));

-- 3b. Notes devenues vides apres nettoyages precedents → NULL
UPDATE staging_interventions_ortho
SET note = NULL
WHERE note = '';

-- ============================================================
-- PASS 4 — LATERALITE : normalisation (regle 37)
-- Colonne "lateralite" deja importee depuis "Cote a operer"
-- Normaliser vers D/G/B
-- ============================================================

UPDATE staging_interventions_ortho
SET lateralite = CASE
  WHEN lateralite ~* '^\s*droit' THEN 'D'
  WHEN lateralite ~* '^\s*gauche' THEN 'G'
  WHEN lateralite ~* '^\s*bilat' THEN 'B'
  WHEN lateralite IS NULL OR TRIM(lateralite) = '' THEN NULL
  ELSE lateralite  -- conserver les valeurs inconnues pour inspection
END
WHERE lateralite IS NOT NULL AND lateralite != ''
  AND lateralite NOT IN ('D', 'G', 'B');

-- ============================================================
-- PASS 5 — DUREE : nettoyage valeurs aberrantes
-- ============================================================

-- 5a. Statistiques duree brute
SELECT
  count(*) FILTER (WHERE duree_minutes IS NULL OR duree_minutes = '') AS duree_vide,
  count(*) FILTER (WHERE duree_minutes = '0') AS duree_zero,
  count(*) FILTER (WHERE duree_minutes ~ '^\d+$' AND duree_minutes::int > 600) AS duree_aberrante,
  count(*) FILTER (WHERE duree_minutes ~ '^\d+$' AND duree_minutes::int BETWEEN 1 AND 600) AS duree_valide,
  count(*) FILTER (WHERE duree_minutes !~ '^\d+$' AND duree_minutes IS NOT NULL AND duree_minutes != '') AS duree_non_numerique
FROM staging_interventions_ortho;

-- ============================================================
-- PASS 6 — HASH pour detection doublons (preparation)
-- ============================================================

UPDATE staging_interventions_ortho
SET _row_hash = md5(
  COALESCE(protocole_operatoire, '') || '|' ||
  COALESCE(date_clean::text, '') || '|' ||
  COALESCE(chirurgien, '') || '|' ||
  COALESCE(duree_minutes, '')
);

-- ============================================================
-- CONTROLES FINAUX
-- ============================================================

-- Compteur apres
SELECT count(*) AS lignes_apres FROM staging_interventions_ortho;

-- Protocoles distincts apres nettoyage pass 1
SELECT count(DISTINCT protocole_operatoire) AS protocoles_distincts
FROM staging_interventions_ortho;

-- Chirurgiens restants
SELECT chirurgien, count(*) AS nb
FROM staging_interventions_ortho
GROUP BY chirurgien
ORDER BY nb DESC;

-- Dates : plage temporelle
SELECT
  min(date_clean) AS date_min,
  max(date_clean) AS date_max,
  count(DISTINCT date_trunc('year', date_clean)) AS nb_annees
FROM staging_interventions_ortho
WHERE date_clean IS NOT NULL;

-- Lateralite : repartition
SELECT lateralite, count(*)
FROM staging_interventions_ortho
GROUP BY lateralite
ORDER BY count(*) DESC;
