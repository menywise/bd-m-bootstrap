-- ============================================================
-- S117bis — Palette pastel app_groups + gris pour pilotage
-- Date : 2026-05-05
-- Objet : doctrine "tons pastels doux" + "rouge interdit -> gris pale"
-- Imperatif lisibilite (eyes-friendly) signale par Manu 2026-05-05
-- ============================================================

UPDATE app_groups SET color = '#93c5fd' WHERE key = 'bloc';          -- bleu pastel
UPDATE app_groups SET color = '#86efac' WHERE key = 'equipe';        -- vert pastel
UPDATE app_groups SET color = '#c4b5fd' WHERE key = 'savoir';        -- indigo pastel
UPDATE app_groups SET color = '#cbd5e1' WHERE key = 'pilotage';      -- gris pale (etait #dc3545 rouge)
UPDATE app_groups SET color = '#fdba74' WHERE key = 'espace_perso';  -- peche pastel

-- Verification
SELECT key, label, color FROM app_groups ORDER BY position;
