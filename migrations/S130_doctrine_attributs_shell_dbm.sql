-- ═══════════════════════════════════════════════════════════════
-- S130 — Doctrine attributs shell DBM (data-shell-theme + data-login-mode)
-- Date     : 2026-05-08
-- Session  : #128 (cloture cascade #115/#127)
-- Auteur   : Claude Cowork
-- Origine  : V12 + V13 du badge V2/V3 glossaire
-- Constat  : bdb-shell.js implemente data-shell-theme="dbm" et data-login-mode="modal"
--            depuis longtemps. Aucune doctrine en base ne les couvre.
-- Effet    : 2 INSERTS atelier_principes (conventions, statut active).
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. data-shell-theme ──────────────────────────────────────────
INSERT INTO atelier_principes (
  ref, categorie, titre, description, statut, marqueur,
  fonction, avantage, benefice, realite, risque, resultat, recommandation
) VALUES (
  'CONV-SHELL-THEME-01',
  'convention',
  'Attribut data-shell-theme sur #bdb-shell',
  'L attribut data-shell-theme="dbm" sur #bdb-shell active le rendu DBM de bdb-shell.js (sidebar, header, app-card, app-zone). Sans cet attribut, bdb-shell.js applique le rendu Smarty V5 legacy (ancien). Implementation : js/bdb-shell.js ligne 229 (variable _shellTheme, defaut="smarty"). Valeurs autorisees : "dbm" (V5+) ou absent (legacy Smarty). Tout module migre V5+ DOIT porter data-shell-theme="dbm". Tout nouveau module aussi. Migration progressive : modules anciens conservent l absence le temps de leur refonte. Doctrine retroactive session #128 — l attribut existait depuis session #112 mais n etait pas en base.',
  'active',
  'TOUJOURS',
  'Active le theme DBM (sidebar/header/cards) au chargement bdb-shell.js',
  'Sans cet attribut, le shell rend en mode Smarty V5 legacy (CSS different)',
  'Garantit la coherence visuelle V5.1 sur tous les modules refondus',
  'js/bdb-shell.js L229 lit l attribut. data-shell-theme="dbm" present sur les modules V5.1',
  'Module sans attribut sur architecture V5.1 = rendu hybride casse',
  'Tout module V5.1 porte data-shell-theme="dbm". Audit grep pre-deploiement.',
  'Inclure data-shell-theme="dbm" dans le template du skill bdb-module-generator'
) ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  statut = EXCLUDED.statut,
  updated_at = NOW();

-- ─── 2. data-login-mode ───────────────────────────────────────────
INSERT INTO atelier_principes (
  ref, categorie, titre, description, statut, marqueur,
  fonction, avantage, benefice, realite, risque, resultat, recommandation
) VALUES (
  'CONV-SHELL-LOGIN-MODE-01',
  'convention',
  'Attribut data-login-mode sur #bdb-shell',
  'L attribut data-login-mode="modal" sur #bdb-shell modifie le comportement de bdb-shell.js quand l utilisateur n est pas authentifie : au lieu de redirect vers login.html (mode par defaut "redirect"), bdb-shell.js dispatch un CustomEvent "bdb:auth-required" que le module ecoute pour ouvrir une modale de login. Implementation : js/bdb-shell.js L205 + L227 (variable _loginMode, defaut="redirect"). Valeurs autorisees : "modal" ou absent (redirect). Mode "modal" recommande pour les modules consultables en mode decouverte sans auth (ex: glossaire). Doctrine retroactive session #128.',
  'active',
  'AUJOURD HUI',
  'Surcharge le comportement auth-required du shell : redirect (defaut) ou modal',
  'Permet aux modules consultables sans auth de proposer login inline plutot que rediriger',
  'UX preservee pour les modules en mode decouverte (pas de saut de contexte)',
  'js/bdb-shell.js L205-L227. data-login-mode="modal" present sur glossaire pour mode decouverte',
  'Mode mal compris -> redirect inattendu ou modale absente',
  'Module decouverte = "modal". Module strictement prive = absent (redirect). Documentation skill cds-compliance.',
  'Inclure dans le skill bdb-module-generator avec choix selon type de module'
) ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  statut = EXCLUDED.statut,
  updated_at = NOW();

-- ─── 3. Decision de doctrination ──────────────────────────────────
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, statut, session_num, type
) VALUES (
  'D-2026-05-08-DOCTRINE-SHELL-ATTRS',
  '2026-05-08',
  'Doctrination retroactive attributs data-shell-theme + data-login-mode',
  'V12 + V13 du badge V2 glossaire : ces 2 attributs etaient utilises par bdb-shell.js depuis session #112 mais aucune doctrine en base ne les couvrait. INSERTS atelier_principes (CONV-SHELL-THEME-01 + CONV-SHELL-LOGIN-MODE-01) pour officialiser leur usage et les rendre auditables. Skills cds-compliance et bdb-module-generator a mettre a jour pour inclure ces conventions dans les templates.',
  NULL,
  ARRAY['doctrine','shell','attributs','retroactif','badge-v3'],
  'active',
  128,
  'doctrine'
) ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description;

-- ─── 4. Verification ──────────────────────────────────────────────
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM atelier_principes
  WHERE ref IN ('CONV-SHELL-THEME-01','CONV-SHELL-LOGIN-MODE-01') AND statut='active';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'Doctrination shell attrs : count=% attendu 2', v_count;
  END IF;
  RAISE NOTICE 'OK : 2 conventions shell inserees + 1 decision.';
END $$;

COMMIT;
