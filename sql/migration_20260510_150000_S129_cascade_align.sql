-- ============================================================
-- Migration S129 - Cascade alignment doctrine V5.1
-- Date : 2026-05-10
-- Session : 129
-- ============================================================
-- Contexte : audit cascade S129 a revele que les 5 artefacts d'aval
-- (Carnet V2, Skill cds-compliance, Skill bdb-module-generator,
-- CLAUDE.md, Template V5_0_1) sont desalignes du code reel ET du
-- cloud atelier_principes (CONV-CHAIN-E deja a jour, P-CDS-01 deja
-- a jour). Cause : pas de rituel de cascade lors de l'alignement S115.
--
-- Cette migration :
--   1. Inscrit la decision D-2026-05-10-S129-CASCADE-ALIGN (doctrine)
--   2. Solde l'arbitrage ARB-DOCTRINE-V51-DESALIGNEMENT-01
--   3. Ouvre l'arbitrage ARB-DETTE-V4-RESIDUELLE-01 (pages app/ + atelier/)
--   4. Inscrit le garde-fou GARDE-FOU-CASCADE-EVOL-01 (FAB 3R)
-- ============================================================

BEGIN;

-- 1. DECISION DOCTRINALE
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, statut, session_num, type, alerte)
VALUES (
  'D-2026-05-10-S129-CASCADE-ALIGN',
  CURRENT_DATE,
  'Cascade alignement V5.1 : 5 artefacts d''aval realignes sur cloud + code',
  'Audit S129 a revele un desalignement entre la doctrine cloud (atelier_principes a jour : '
  'CONV-CHAIN-E V5.1 dbm-theme local, P-CDS-01 deprecation theme-base CDN modules) '
  'et 5 artefacts d''aval (Carnet V2 sec 6 + 4.2, Skill cds-compliance v2.1.0, Skill bdb-module-generator v2.1.0, '
  'CLAUDE.md V2.4 sec 15 + 17, Template _TEMPLATE_MODULE_V5_0_1.html). '
  'Code reel (40+ modules) en revanche conforme cloud. '
  'Decision : aligner les 5 artefacts d''aval sur cloud + code, sans toucher au code '
  '(le code est deja la verite). Inscrire un garde-fou pour empecher la derive future.',
  'doctrine',
  ARRAY['cascade','alignement','V5.1','docs','skills','templates'],
  'active',
  129,
  'doctrine',
  NULL
)
ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  session_num = EXCLUDED.session_num,
  type = EXCLUDED.type;

-- 2. ARBITRAGE DESALIGNEMENT V5.1 (solde par decision ci-dessus)
INSERT INTO atelier_arbitrages (ref, sujet, module_cible, statut, decision, decision_ref, date_creation, date_resolution)
VALUES (
  'ARB-DOCTRINE-V51-DESALIGNEMENT-01',
  '5 artefacts d''aval (Carnet V2, 2 skills, CLAUDE.md, template V5_0_1) desalignes du cloud + code reel V5.1. '
  'Cause : alignement S115 du 2026-05-08 a propage doctrine cloud sans toucher artefacts d''aval.',
  'doctrine',
  'solde',
  'Aligner les 5 artefacts d''aval sur le cloud (atelier_principes deja a jour). '
  'Le code reste la verite, le cloud reste la verite, on corrige uniquement les docs aval.',
  'D-2026-05-10-S129-CASCADE-ALIGN',
  CURRENT_DATE,
  CURRENT_DATE
)
ON CONFLICT (ref) DO UPDATE SET
  decision = EXCLUDED.decision,
  decision_ref = EXCLUDED.decision_ref,
  statut = EXCLUDED.statut,
  date_resolution = EXCLUDED.date_resolution;

-- 3. ARBITRAGE DETTE V4 RESIDUELLE (ouvert, a traiter)
INSERT INTO atelier_arbitrages (ref, sujet, module_cible, statut, date_creation)
VALUES (
  'ARB-DETTE-V4-RESIDUELLE-01',
  'Pages residuelles V4 (50+ fichiers dans app/, createur/atelier/, 00_GOUVERNANCE/migration_v5/, '
  'cds/_TEMPLATE_SHOWCASE_V5_0_1.html) chargent encore theme-base.css CDN + cds-overrides.css. '
  'Modules V5.1 sont OK (40 modules conformes). A trancher : migrer pages residuelles vers V5.1 (dbm-theme.css local) '
  'ou conserver V4 (theme-base CDN) en surface stable et ne migrer que sur demande.',
  'doctrine',
  'pending',
  CURRENT_DATE
)
ON CONFLICT (ref) DO NOTHING;

-- 4. GARDE-FOU CASCADE EVOLUTION (FAB 3R complet)
INSERT INTO atelier_principes (
  categorie, ref, titre, description, source, statut, marqueur, date_figement,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
)
VALUES (
  'garde_fou',
  'GARDE-FOU-CASCADE-EVOL-01',
  'Toute evolution chaine CSS/JS/pattern HTML = MAJ obligatoire 5 artefacts aval',
  'Toute modification de la chaine CSS V5.x, de la chaine JS V5.x, ou du pattern HTML structurant '
  '(app-layout/app-main/app-content, #bdb-shell position, app-zone, surface marker) '
  'declenche automatiquement la MAJ des 5 artefacts d''aval suivants : '
  '(1) 0000_CARNET_LIAISON_DBM_V2.md sections 4.2 et 6, '
  '(2) skill cds-compliance (BLOC 0 + chaine + checklist), '
  '(3) skill bdb-module-generator (TEMPLATE HTML + chaine + checklist), '
  '(4) CLAUDE.md sections 15 + 17, '
  '(5) modules/template/_TEMPLATE_MODULE_VX_X_X.html (rebuild depuis module reference glossaire). '
  'Sans ces 5 MAJ, la livraison est refusee. Le cloud atelier_principes reste a jour ET les 5 artefacts aval avec.',
  'AUDIT_CASCADE_S129_2026-05-10',
  'active',
  'TOUJOURS',
  '2026-05-10',
  -- Realite
  'Audit S129 a montre que l''alignement S115 (2026-05-08) a propage la doctrine entre cloud et code, '
  'mais a oublie 5 artefacts d''aval. Resultat : Claude (IA) lit Carnet V2 sec 6 et hallucine une chaine CSS V5 '
  'qui ressemble au code mais n''y est plus depuis 8 jours. Niveau 0 INTERDITS 1 + 2 + 4 violes simultanement. '
  'En S129 j''ai produit un Template V5_2_0 sur cette base hallucinee.',
  -- Fonction
  'Forcer la cascade de toute evolution chaine/pattern depuis le code (verite operationnelle) '
  'vers les 5 artefacts d''aval (verite documentaire). Sans cette cascade, la doctrine documentee derive '
  'silencieusement et l''IA hallucine sur des bases periees a chaque session.',
  -- Avantage
  'VS pas de garde-fou (= S115 a S129) : alignement opportuniste, pas de checklist, MAJ partielles, derive systematique. '
  'AVEC garde-fou : checklist explicite, refus livraison si incomplete, doctrine alignee a tous les niveaux, '
  'IA Claude qui lit n''importe quel artefact obtient la meme verite.',
  -- Benefice
  'Zero hallucination IA sur bases periees. Zero session perdue a debugger des Template/Skills faux. '
  'Confiance retablie sur les 5 artefacts d''aval (peuvent redevenir sources de verite operables, '
  'pas seulement le code et le cloud).',
  -- Risque (acteur + moment + consequence)
  'Acteur : developpeur solo (Manu) ou IA (Claude). '
  'Moment : modification de chaine CSS V5.x ou JS V5.x ou pattern HTML majeur. '
  'Consequence si non applique : Niveau 0 INTERDIT 1 (cap silencieux) + INTERDIT 2 (destruction silencieuse) + '
  'INTERDIT 4 (hallucination silencieuse) violes. Production future contaminee. '
  'Recurrence cas S129 (V5_2_0 produit faux).',
  -- Resultat (observable, datable, chiffrable)
  'Observable : tout commit qui touche css/dbm-theme.css, css/bdb-ui-kit.css, css/dbm-module-color.css, '
  'css/cds-overrides.css, js/bdb-shell.js, js/bdb-ui.js, ou la chaine HTML d''un module '
  'declenche un audit grep des 5 artefacts d''aval. '
  'Mesurable : 0 desalignement detecte sur 5 artefacts en fin de chaque session de migration. '
  'Datable : audit cascade en cloture de session systematique.',
  -- Recommandation
  'Apres toute modification chaine ou pattern : (1) commit code, '
  '(2) bash audit grep des 5 artefacts d''aval contre code reel, '
  '(3) MAJ artefacts d''aval qui derivent, '
  '(4) verification finale grep alignement code/cloud/doc, '
  '(5) commit MAJ doctrine + entree atelier_decisions session courante.'
)
ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  realite = EXCLUDED.realite,
  fonction = EXCLUDED.fonction,
  avantage = EXCLUDED.avantage,
  benefice = EXCLUDED.benefice,
  risque = EXCLUDED.risque,
  resultat = EXCLUDED.resultat,
  recommandation = EXCLUDED.recommandation,
  date_figement = EXCLUDED.date_figement,
  statut = 'active',
  updated_at = NOW();

COMMIT;

-- ============================================================
-- ROLLBACK SCRIPT
-- ============================================================
-- DELETE FROM atelier_principes WHERE ref = 'GARDE-FOU-CASCADE-EVOL-01';
-- DELETE FROM atelier_arbitrages WHERE ref IN ('ARB-DOCTRINE-V51-DESALIGNEMENT-01','ARB-DETTE-V4-RESIDUELLE-01');
-- DELETE FROM atelier_decisions WHERE ref = 'D-2026-05-10-S129-CASCADE-ALIGN';
-- ============================================================

-- VERIF POST-EXEC :
-- SELECT ref, statut, marqueur FROM atelier_principes WHERE ref = 'GARDE-FOU-CASCADE-EVOL-01';
-- SELECT ref, statut, decision_ref FROM atelier_arbitrages WHERE ref LIKE 'ARB-D%-01';
-- SELECT ref, type, session_num FROM atelier_decisions WHERE ref = 'D-2026-05-10-S129-CASCADE-ALIGN';
