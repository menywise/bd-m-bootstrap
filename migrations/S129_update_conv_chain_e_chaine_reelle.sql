-- ═══════════════════════════════════════════════════════════════
-- S129 — UPDATE CONV-CHAIN-E + alignement P-CDS-01
-- Date     : 2026-05-08
-- Session  : #128 (cloture cascade #115/#127)
-- Auteur   : Claude Cowork (FAB(3R) chaine CSS V5.1)
-- Ref FAB  : D-2026-05-08-FAB-CHAINE-CSS-V5-1 (a creer)
-- Origine  : D-2026-05-07-S115-CHARTE-PREMIUM § Hors scope (FAB requis)
-- Effet    : aligne doctrine (CONV-CHAIN-E) avec realite (modules deployes
--            depuis session #112+) sans casser les modules.
-- Rollback : voir S129_rollback en bas.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Mise a jour CONV-CHAIN-E (chaine CSS V5.1) ────────────────
UPDATE atelier_principes
SET description = 'Ordre CSS V5.1 (officialise par FAB chaine CSS 2026-05-08) : Bootstrap 5.3.3 CDN -> Bootstrap Icons 1.11.1 CDN -> dbm-theme.css (local) -> bdb-ui-kit.css (local) -> dbm-module-color.css (local) -> [module]-ui.css. theme-base.css (CDN ou local) deprecie pour modules. cds-overrides.css conserve pour overrides ultimes mais non charge par defaut module (charge au cas par cas). theme-print.css supprime depuis V5. Ordre JS V5 inchange : bootstrap.bundle -> supabase-js@2 -> supabase-client -> bdb-ui -> bdb-invite-guard -> bdb-shell -> [socle partages] -> [module]-app.js. bdb-pwa.js charge en fin de body si module PWA-ready, jamais dans <head>.',
    titre = 'Chaine de chargement BLOC E (V5.1 officialisee)'
WHERE ref = 'CONV-CHAIN-E' AND statut = 'active';

-- ─── 2. Mise a jour P-CDS-01 (theme-base CDN deprecie pour modules) ─
UPDATE atelier_principes
SET description = 'theme-base.css du CDN menywise/BDB est deprecie pour modules depuis V5.1 (FAB chaine CSS 2026-05-08). Hash de reference historique : 4faebd0280e559235fcbfaec2b24d407cebf0a95 (encore valide pour pages mini-site/SITE qui chargent theme-base CDN). Hash anterieurs obsoletes : @a75daa03b876d052f834046ab3cff6e7583bee65 (Smarty v1.1.4) et @63905396c73b061f336f8f5178d738627bca601c (intermediaire). GARDE IA : un module qui charge theme-base CDN est en ARCHITECTURE V5 ANCIENNE - acceptable transitoirement, mais V5.1 est la cible. Aucun retrait force.',
    titre = 'CDN hash Smarty V5 (theme-base) - deprecie pour modules'
WHERE ref = 'P-CDS-01' AND statut = 'active';

-- ─── 3. Insertion decision FAB ────────────────────────────────────
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, statut, session_num, type
) VALUES (
  'D-2026-05-08-FAB-CHAINE-CSS-V5-1',
  '2026-05-08',
  'FAB(3R) chaine CSS V5.1 - officialisation retroactive chaine reelle modules',
  'Trois mois de derive entre canon (theme-base CDN + cds-overrides) et realite modules (dbm-theme + bdb-ui-kit + dbm-module-color). D-2026-05-07-S115-CHARTE-PREMIUM avait place cette migration en "Hors scope FAB requis" sans ouvrir le FAB. Module etalon glossaire en limbe doctrinal depuis. FAB tranche : la chaine reelle EST le canon V5.1. Justification : (F) chaine cohérente, (A) autonomie locale + tokens DBM, (B) audits modules sans faux positifs P0, (R1) chaine deja deployee sur tous modules refondus DBM, (R2) risque nul puisque dérive deja en prod, (R3) CONV-CHAIN-E mis a jour - P-CDS-01 mis a jour - badges V5 modules re-auditables. Conséquence : les modules qui chargent encore theme-base CDN (mini-site, SITE) restent valides en V5 ancienne. Les modules refondus DBM passent en V5.1.',
  NULL,
  ARRAY['fab','doctrine','css','v5','chaine','etalon-glossaire'],
  'active',
  128,
  'doctrine'
) ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  titre = EXCLUDED.titre;

-- ─── 4. Verification post-update ──────────────────────────────────
DO $$
DECLARE
  v_chaine_desc text;
  v_pcds_desc text;
  v_decision_count int;
BEGIN
  SELECT description INTO v_chaine_desc FROM atelier_principes WHERE ref = 'CONV-CHAIN-E';
  IF v_chaine_desc NOT LIKE '%V5.1%' THEN
    RAISE EXCEPTION 'CONV-CHAIN-E non mis a jour';
  END IF;

  SELECT description INTO v_pcds_desc FROM atelier_principes WHERE ref = 'P-CDS-01';
  IF v_pcds_desc NOT LIKE '%V5.1%' THEN
    RAISE EXCEPTION 'P-CDS-01 non mis a jour';
  END IF;

  SELECT count(*) INTO v_decision_count FROM atelier_decisions WHERE ref = 'D-2026-05-08-FAB-CHAINE-CSS-V5-1';
  IF v_decision_count = 0 THEN
    RAISE EXCEPTION 'Decision FAB non inseree';
  END IF;

  RAISE NOTICE 'OK : CONV-CHAIN-E V5.1 + P-CDS-01 + FAB inseres.';
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════════
-- ROLLBACK (a executer manuellement si besoin)
-- ═══════════════════════════════════════════════════════════════
-- BEGIN;
-- UPDATE atelier_principes
-- SET description = 'Ordre CSS V5 : Bootstrap 5.3.3 → theme-base.css (Smarty V5 CDN) → Bootstrap Icons 1.11.1 → cds-overrides.css → dbm-module-color.css → [module]-ui.css. theme-print.css supprimé depuis V5. Ordre JS V5 : bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → [socle partagés] → [module]-app.js.',
--     titre = 'Chaîne de chargement BLOC E'
-- WHERE ref = 'CONV-CHAIN-E';
--
-- UPDATE atelier_principes
-- SET description = 'theme-base.css sur repo menywise/BDB a été remplacé par core.css de Smarty v5. Hash de commit actuel : 4faebd0280e559235fcbfaec2b24d407cebf0a95...',
--     titre = 'CDN hash Smarty v5 — @4faebd0280e559235fcbfaec2b24d407cebf0a95'
-- WHERE ref = 'P-CDS-01';
--
-- DELETE FROM atelier_decisions WHERE ref = 'D-2026-05-08-FAB-CHAINE-CSS-V5-1';
-- COMMIT;
