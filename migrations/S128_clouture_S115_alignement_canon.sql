-- ============================================================
-- S128 - Cloture session #115 phase 2 - alignement canon CONV-CHAIN-E + Carnet V2
-- Date    : 2026-05-08
-- Session : 115 (cloture)
-- Objet   : Apres lecture integrale des 5 socles (DEBLOQUEZ_MOI, NIVEAU_0,
--           7_VOIX, REFERENTIEL_AFFIRMATIONS, AUDIT_N0) + Carnet de Liaison V2
--           + AUDIT_CONFLITS_SOURCES, alignement de mes inserts S126 sur le
--           canon actuel.
--           A11/A15/SURFACE-MARKER : CONFIRMES par Carnet V2 §4 -> CONSERVES
--           GARDE-FOU-RFC2119-DOCTRINE : HORS RADAR Carnet V2 -> GELE
-- Source  : Decision Manu 2026-05-08 - convergence v5 fonctionnelle 100%
-- Hors    : pas de SUPPRESSION, juste statut='corrige' (INTERDIT 2 destruction
--   scope :   silencieuse - on archive pas en silence)
-- ============================================================
-- ROLLBACK :
--   UPDATE atelier_principes
--      SET statut='active'
--    WHERE ref='GARDE-FOU-RFC2119-DOCTRINE';
--   DELETE FROM atelier_decisions WHERE ref='D-2026-05-08-S115-CLOTURE-ALIGN';
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. DECISION D-2026-05-08-S115-CLOTURE-ALIGN
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_decisions (
  ref, titre, type, description, statut, session_num, created_at
) VALUES (
  'D-2026-05-08-S115-CLOTURE-ALIGN',
  'Cloture session #115 - alignement canon CONV-CHAIN-E + Carnet V2',
  'doctrine',
  'Apres lecture integrale 5 socles + Carnet V2 + AUDIT_CONFLITS_SOURCES, '
  'identification de 4 dérives session #115 phase 1 a corriger : '
  '(1) CDN hash @63905396 documente dans CLAUDE.md V2.3 alors que canon '
  'P-CDS-01 mis a jour 2026-05-08 10:56 = @4faebd0280e559235fcbfaec2b24d407cebf0a95 '
  '-> CLAUDE.md aligne en V2.4. '
  '(2) Chaine CSS V5 documentee a 5 maillons alors que CONV-CHAIN-E est a 6 '
  'maillons (avec dbm-module-color.css obligatoire) -> CLAUDE.md aligne. '
  '(3) Fichiers dbm-premium-components.css + bdb-zone-state.js HORS chaine '
  'V5 -> a reverser dans _deltas/ (Action C). '
  '(4) GARDE-FOU-RFC2119-DOCTRINE inscrit en S126 mais HORS RADAR Carnet V2 '
  '-> statut=gele en attente arbitrage Carnet V3 ou retrait FAB(3R).'
  ' '
  'Trois principes S126 CONSERVES car valides par Carnet V2 § 4.4-4.1 : '
  'INTERDIT-CTA-PRIMARY-MODULE-A11, INTERDIT-HOVER-BRIGHTNESS-A15, '
  'CONV-SURFACE-MARKER-HTML.',
  'active',
  115,
  now()
);


-- ─────────────────────────────────────────────────────────────
-- 2. UPDATE statut='corrige' sur GARDE-FOU-RFC2119-DOCTRINE
-- Pas de DELETE - INTERDIT 2 destruction silencieuse Niveau 0 §7
-- ─────────────────────────────────────────────────────────────

UPDATE atelier_principes
   SET statut = 'corrige',
       updated_at = now(),
       corrige_par = 'D-2026-05-08-S115-CLOTURE-ALIGN'
 WHERE ref = 'GARDE-FOU-RFC2119-DOCTRINE'
   AND statut = 'active';


-- ─────────────────────────────────────────────────────────────
-- 3. VERIFICATION POST-EXECUTION
-- ─────────────────────────────────────────────────────────────

-- Verifier la decision est inseree
-- SELECT ref, titre, statut FROM atelier_decisions
--  WHERE ref = 'D-2026-05-08-S115-CLOTURE-ALIGN';

-- Verifier le principe est gele
-- SELECT ref, statut, corrige_par FROM atelier_principes
--  WHERE ref = 'GARDE-FOU-RFC2119-DOCTRINE';

-- Verifier les 3 principes S126 conserves actifs
-- SELECT ref, statut FROM atelier_principes
--  WHERE ref IN (
--    'INTERDIT-CTA-PRIMARY-MODULE-A11',
--    'INTERDIT-HOVER-BRIGHTNESS-A15',
--    'CONV-SURFACE-MARKER-HTML'
--  )
--  ORDER BY ref;


-- ─────────────────────────────────────────────────────────────
-- FIN S128
-- ─────────────────────────────────────────────────────────────
