-- ============================================================
-- MIGRATION 029 — Nettoyage staging_interventions_ortho (suite 028)
-- Date    : 2026-03-25
-- Auteur  : Manu
-- Passes  : 4
-- IMPORTANT : exécuter bloc par bloc, vérifier count avant/après
-- ============================================================

-- ============================================================
-- PASSE 1 — Strip suffixes -DR résiduels dans protocole_operatoire
-- Patterns : "- DR V.V", "- DR MARCZUCK", "-DR VV.", "- DR FOURASTIER.", "- DR VAQUEIR"
-- ============================================================

-- Vérification avant
SELECT protocole_operatoire, count(*) AS nb
FROM staging_interventions_ortho
WHERE protocole_operatoire ~* '\s*-\s*DR\s*'
GROUP BY protocole_operatoire
ORDER BY nb DESC;

-- Exécution
UPDATE staging_interventions_ortho
SET
  protocole_operatoire = TRIM(regexp_replace(protocole_operatoire, '\s*-\s*[Dd][Rr][^\w]*.*$', '', 'g')),
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P1:strip-suffix-dr'
WHERE protocole_operatoire ~* '\s*-\s*DR\s*';

-- Vérification après (doit retourner 0 lignes)
SELECT protocole_operatoire, count(*) AS nb
FROM staging_interventions_ortho
WHERE protocole_operatoire ~* '\s*-\s*DR\s*'
GROUP BY protocole_operatoire;


-- ============================================================
-- PASSE 2 — UPDATE chirurgien DOTZIS → DOTZIS Anthony
-- ============================================================

-- Vérification avant
SELECT chirurgien, count(*) FROM staging_interventions_ortho
WHERE chirurgien = 'DOTZIS'
GROUP BY chirurgien;

-- Exécution
UPDATE staging_interventions_ortho
SET
  chirurgien = 'DOTZIS Anthony',
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P2:chirurgien-prenom'
WHERE chirurgien = 'DOTZIS';

-- Vérification après
SELECT chirurgien, count(*) FROM staging_interventions_ortho
WHERE chirurgien LIKE 'DOTZIS%'
GROUP BY chirurgien;


-- ============================================================
-- PASSE 3 — Nettoyage notes : supprimer mentions "sortie..."
-- Pattern : ", sortie ..." ou " sortie ..." jusqu'en fin de chaîne
-- ============================================================

-- Vérification avant
SELECT count(*) AS lignes_avec_sortie
FROM staging_interventions_ortho
WHERE note ~* '\bsortie\b';

-- Échantillon avant
SELECT note FROM staging_interventions_ortho
WHERE note ~* '\bsortie\b'
LIMIT 10;

-- Exécution
UPDATE staging_interventions_ortho
SET
  note = TRIM(regexp_replace(note, '\s*[,.]?\s*\bsortie\b.*$', '', 'ig')),
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P3:note-strip-sortie'
WHERE note ~* '\bsortie\b';

-- Vérification après (doit retourner 0 lignes)
SELECT count(*) AS lignes_avec_sortie
FROM staging_interventions_ortho
WHERE note ~* '\bsortie\b';


-- ============================================================
-- PASSE 4 — Extraction latéralité depuis note
-- Uniquement où lateralite IS NULL
-- Patterns : gauche|gche → G, droite?|dt → D, bilat → B
-- ============================================================

-- Vérification avant
SELECT lateralite, count(*) FROM staging_interventions_ortho
GROUP BY lateralite ORDER BY lateralite;

-- Comptes attendus par pattern
SELECT
  count(*) FILTER (WHERE note ~* '\bgauche\b|\bgche\b')  AS potentiel_G,
  count(*) FILTER (WHERE note ~* '\bdroite?\b|\bdt\b')   AS potentiel_D,
  count(*) FILTER (WHERE note ~* '\bbilat')              AS potentiel_B
FROM staging_interventions_ortho
WHERE lateralite IS NULL;

-- Exécution G
UPDATE staging_interventions_ortho
SET
  lateralite = 'G',
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P4:lat-from-note'
WHERE lateralite IS NULL
  AND note ~* '\bgauche\b|\bgche\b';

-- Exécution D
UPDATE staging_interventions_ortho
SET
  lateralite = 'D',
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P4:lat-from-note'
WHERE lateralite IS NULL
  AND note ~* '\bdroite?\b|\bdt\b';

-- Exécution B
UPDATE staging_interventions_ortho
SET
  lateralite = 'B',
  _mapping_notes = COALESCE(_mapping_notes || ' | ', '') || '029-P4:lat-from-note'
WHERE lateralite IS NULL
  AND note ~* '\bbilat';

-- Vérification finale latéralité
SELECT lateralite, count(*) AS nb
FROM staging_interventions_ortho
GROUP BY lateralite
ORDER BY lateralite;
