-- ============================================================
-- Migration 023 : Normalisation libelles thesaurus_protocoles
-- Date : 2026-03-24
-- Arbitrages Manu : 2026-03-24
-- ============================================================
-- REGLE BDB : fichier .sql AVANT execution (INTERDIT-SQL-01)
-- A VALIDER par Manu AVANT execution dans SQL Editor cloud
-- ============================================================
--
-- SCOPE :
--   91 UPDATE libelle_cible (accents + articles + typo + format)
--   2  UPDATE specialite (casse)
--   1  UPDATE ACT-0422 (enrichissement synonymes/alertes/expert)
--   5  DELETE protocoles (3 generiques + 2 fusions cubital/ulnaire)
--
-- REPORTE (debriefing futur) :
--   10 S6-ABBREV (THS, PTH, HD, LB, NEURO-STIM -> convention ">")
--   2  Syntheses col femur (ACT-0076 vs ACT-0102)
--
-- ============================================================

BEGIN;

-- =============================================================
-- PHASE 1 : FUSIONS — reassigner FK avant suppression
-- =============================================================

-- ACT-0137 (NERF CUBITAL) fusionne dans ACT-0421 (NERF ULNAIRE AU COUDE)
UPDATE public.thesaurus_interventions
  SET protocole_id = (SELECT id FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0421')
  WHERE protocole_id = (SELECT id FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0137');

-- ACT-0268 (TRANSPOSITION NERF CUBITAL) fusionne dans ACT-0422 (TRANSPOSITION NERF ULNAIRE)
UPDATE public.thesaurus_interventions
  SET protocole_id = (SELECT id FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0422')
  WHERE protocole_id = (SELECT id FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0268');

-- ACT-0006, ACT-0416, ACT-0386 : protocoles generiques -> SET NULL (reviendront Phase B)
UPDATE public.thesaurus_interventions
  SET protocole_id = NULL
  WHERE protocole_id IN (
    SELECT id FROM public.thesaurus_protocoles
    WHERE id_protocole IN ('ACT-0006', 'ACT-0416', 'ACT-0386')
  );

-- =============================================================
-- PHASE 2 : DELETE protocoles supprimes
-- =============================================================

DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0006';  -- PETITE INTERVENTION
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0386';  -- PONCTION (generique)
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0416';  -- CLOU (generique)
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0137';  -- LIBERATION NERF CUBITAL -> ACT-0421
DELETE FROM public.thesaurus_protocoles WHERE id_protocole = 'ACT-0268';  -- TRANSPOSITION NERF CUBITAL -> ACT-0422

-- =============================================================
-- PHASE 3 : ENRICHISSEMENT ACT-0422 (arbitrage Manu)
-- =============================================================

UPDATE public.thesaurus_protocoles SET
  synonymes_recherche = 'transposition cubitale|transposition nerf cubital|sling ulnaire|deplacement nerf ulnaire|transposition sous-cutanee|transposition intramusculaire|transposition sous-musculaire|transposition anterieure',
  duree_minutes = 60,
  alertes = 'Garrot pneumatique bras 250 mmHg — attention duree si SM (>60 min)|Decubitus dorsal bras abduction billot sous coude|Vessel loops fils de traction neuraux obligatoires|Materiel variable selon variante : SC/IM = suture fasciale ; SM = desinsertion epitrochlee + fixation osseuse possible|Risque vasculaire accru mobilisation nerf — branches motrices a identifier|Confirmer variante avec chirurgien en check pre-op',
  definition_expert = 'Repositionnement du nerf ulnaire en position anterieure pour supprimer la traction en flexion de coude. Trois variantes techniques selon profondeur de transposition : sous-cutanee (simple, rapide), intramusculaire (intermediaire, stabilite moderee), sous-musculaire (la plus stable, implique desinsertion de l''epitrochlee et reinsertion musculaire). L''IBODE confirme la variante avec le chirurgien en check pre-operatoire car l''instrumentation et la duree different significativement. Dissection neurovasculaire extensive — vigilance absolue sur les branches motrices ulnaires et la vascularisation intrinseque du nerf.',
  updated_at = now()
WHERE id_protocole = 'ACT-0422';

-- =============================================================
-- PHASE 4 : S5-ACCENT — accents francais manquants
-- =============================================================

UPDATE public.thesaurus_protocoles SET libelle_cible = 'CANAL LOMBAIRE ÉTROIT', updated_at = now() WHERE id_protocole = 'ACT-0008';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ONGLE INCARNÉ', updated_at = now() WHERE id_protocole = 'ACT-0029';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ÉVACUATION D''HÉMATOME', updated_at = now() WHERE id_protocole = 'ACT-0038';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'SYNTHÈSE DE SCAPHOÏDE', updated_at = now() WHERE id_protocole = 'ACT-0093';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'NÉVROME DE MORTON', updated_at = now() WHERE id_protocole = 'ACT-0094';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'TÉNODERMODÈSE DU DOIGT', updated_at = now() WHERE id_protocole = 'ACT-0103';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'TÉNOSYNOVECTOMIE', updated_at = now() WHERE id_protocole = 'ACT-0114';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DE TENDON QUADRICIPITAL', updated_at = now() WHERE id_protocole = 'ACT-0120';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DE TENDON EXTENSEUR', updated_at = now() WHERE id_protocole = 'ACT-0126';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'KYSTE MUCOÏDE', updated_at = now() WHERE id_protocole = 'ACT-0131';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE', updated_at = now() WHERE id_protocole = 'ACT-0139';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE TIBIALE DE VALGISATION', updated_at = now() WHERE id_protocole = 'ACT-0144';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DE CALCANÉUM', updated_at = now() WHERE id_protocole = 'ACT-0151';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE TTA DU GENOU', updated_at = now() WHERE id_protocole = 'ACT-0155';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ENCLOUAGE DE FÉMUR', updated_at = now() WHERE id_protocole = 'ACT-0165';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'SCAPHOÏDECTOMIE', updated_at = now() WHERE id_protocole = 'ACT-0192';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉITE', updated_at = now() WHERE id_protocole = 'ACT-0204';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOME OCCIPITAL', updated_at = now() WHERE id_protocole = 'ACT-0238';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'TÉNOTOMIE', updated_at = now() WHERE id_protocole = 'ACT-0248';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE', updated_at = now() WHERE id_protocole = 'ACT-0252';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DU RADIUS', updated_at = now() WHERE id_protocole = 'ACT-0253';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE PAR FIXATEUR EXTERNE', updated_at = now() WHERE id_protocole = 'ACT-0272';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DE TIBIA', updated_at = now() WHERE id_protocole = 'ACT-0283';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DU POIGNET', updated_at = now() WHERE id_protocole = 'ACT-0285';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'CANAL CERVICAL ÉTROIT', updated_at = now() WHERE id_protocole = 'ACT-0296';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'MÉDAILLON ROTULIEN', updated_at = now() WHERE id_protocole = 'ACT-0330';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'CHANGEMENT DE TÊTE FÉMORALE', updated_at = now() WHERE id_protocole = 'ACT-0334';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'PSEUDARTHROSE D''HUMÉRUS', updated_at = now() WHERE id_protocole = 'ACT-0349';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOPHYTE', updated_at = now() WHERE id_protocole = 'ACT-0361';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'CHANGEMENT DE VIS CÉPHALIQUE', updated_at = now() WHERE id_protocole = 'ACT-0375';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'KYSTE SÉBACÉ', updated_at = now() WHERE id_protocole = 'ACT-0381';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'FRACTURE DU PÉRONÉ', updated_at = now() WHERE id_protocole = 'ACT-0383';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ARRACHEMENT DU CALCANÉUM', updated_at = now() WHERE id_protocole = 'ACT-0392';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'VIS CÉPHALIQUE', updated_at = now() WHERE id_protocole = 'ACT-0414';

-- =============================================================
-- PHASE 5 : S5+S1 — accents + articles manquants combines
-- =============================================================

UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE MATÉRIEL DE SYNTHÈSE', updated_at = now() WHERE id_protocole = 'ACT-0016';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE BROCHES', updated_at = now() WHERE id_protocole = 'ACT-0028';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE CORPS ÉTRANGER', updated_at = now() WHERE id_protocole = 'ACT-0035';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE TUMÉFACTION', updated_at = now() WHERE id_protocole = 'ACT-0046';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE VIS', updated_at = now() WHERE id_protocole = 'ACT-0048';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ÉVACUATION D''ABCÈS', updated_at = now() WHERE id_protocole = 'ACT-0069';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE LIPOME', updated_at = now() WHERE id_protocole = 'ACT-0073';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE NODULE', updated_at = now() WHERE id_protocole = 'ACT-0075';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ÉPICONDYLITE DU COUDE', updated_at = now() WHERE id_protocole = 'ACT-0077';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE CALCIFICATION', updated_at = now() WHERE id_protocole = 'ACT-0116';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'PEIGNAGE DU TENDON D''ACHILLE', updated_at = now() WHERE id_protocole = 'ACT-0117';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DU TENDON BICIPITAL', updated_at = now() WHERE id_protocole = 'ACT-0119';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉDUCTION DE FRACTURE DE DOIGT', updated_at = now() WHERE id_protocole = 'ACT-0158';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE CLOU CENTROMÉDULLAIRE', updated_at = now() WHERE id_protocole = 'ACT-0159';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'REPRISE D''HALLUX VALGUS', updated_at = now() WHERE id_protocole = 'ACT-0172';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DE TENDON FLÉCHISSEUR', updated_at = now() WHERE id_protocole = 'ACT-0174';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'TÉNOLYSE DU LONG BICEPS', updated_at = now() WHERE id_protocole = 'ACT-0193';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE DU RADIUS', updated_at = now() WHERE id_protocole = 'ACT-0215';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉDUCTION DE FRACTURE D''HUMÉRUS', updated_at = now() WHERE id_protocole = 'ACT-0228';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE D''HUMÉRUS', updated_at = now() WHERE id_protocole = 'ACT-0232';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉDUCTION DE FRACTURE DE POUCE', updated_at = now() WHERE id_protocole = 'ACT-0237';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE D''ORTEIL', updated_at = now() WHERE id_protocole = 'ACT-0244';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉDUCTION DE FRACTURE D''ÉPAULE', updated_at = now() WHERE id_protocole = 'ACT-0245';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DE FÉMUR', updated_at = now() WHERE id_protocole = 'ACT-0249';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION D''OSTÉOPHYTE', updated_at = now() WHERE id_protocole = 'ACT-0250';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ÉPITROCHLÉITE DU COUDE', updated_at = now() WHERE id_protocole = 'ACT-0273';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉSECTION DE LA 1ÈRE RANGÉE DES OS DU CARPE', updated_at = now() WHERE id_protocole = 'ACT-0284';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'SYNOVITE DU FLÉCHISSEUR', updated_at = now() WHERE id_protocole = 'ACT-0289';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉSECTION DE TÊTE RADIALE', updated_at = now() WHERE id_protocole = 'ACT-0293';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE DES DIFFÉRENTS OS DE L''AVANT-BRAS', updated_at = now() WHERE id_protocole = 'ACT-0297';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉSECTION DE TÊTE ULNAIRE', updated_at = now() WHERE id_protocole = 'ACT-0307';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉDUCTION DE FRACTURE DES 2 OS DE L''AVANT-BRAS', updated_at = now() WHERE id_protocole = 'ACT-0312';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DE VARISATION FÉMORALE', updated_at = now() WHERE id_protocole = 'ACT-0325';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION D''ÉPINE TIBIALE', updated_at = now() WHERE id_protocole = 'ACT-0327';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE D''ORTEIL', updated_at = now() WHERE id_protocole = 'ACT-0338';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'SYNTHÈSE DE RACHIS', updated_at = now() WHERE id_protocole = 'ACT-0342';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉGLAGE DE FIXATEUR EXTERNE', updated_at = now() WHERE id_protocole = 'ACT-0348';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'LIBÉRATION DU TENDON FLÉCHISSEUR', updated_at = now() WHERE id_protocole = 'ACT-0351';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE CLOU DE TIBIA', updated_at = now() WHERE id_protocole = 'ACT-0364';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ARTHRODÈSE D''ORTEIL EN PERCUTANÉ', updated_at = now() WHERE id_protocole = 'ACT-0368';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOSYNTHÈSE DU M1 DE LA MAIN', updated_at = now() WHERE id_protocole = 'ACT-0385';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ARTHRODÈSE TIBIA-PÉRONÉ', updated_at = now() WHERE id_protocole = 'ACT-0399';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'OSTÉOTOMIE DU PÉRONÉ', updated_at = now() WHERE id_protocole = 'ACT-0401';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ÉVACUATION D''HÉMATOME', updated_at = now() WHERE id_protocole = 'ACT-0409';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'NETTOYAGE D''ESCARRE', updated_at = now() WHERE id_protocole = 'ACT-0417';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ABLATION DE PROTHÈSE TOTALE DE GENOU + ARTHRODÈSE FÉMORO-TIBIALE', updated_at = now() WHERE id_protocole = 'ACT-0419';

-- =============================================================
-- PHASE 6 : TYPO — fautes d'orthographe
-- =============================================================

UPDATE public.thesaurus_protocoles SET libelle_cible = 'BUTÉE DE LATARJET', updated_at = now() WHERE id_protocole = 'ACT-0034';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'PSEUDARTHROSE DE SCAPHOÏDE', updated_at = now() WHERE id_protocole = 'ACT-0217';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'REPRISE DE BUTÉE DE LATARJET', updated_at = now() WHERE id_protocole = 'ACT-0241';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DE LIGAMENT DE DOIGT', updated_at = now() WHERE id_protocole = 'ACT-0275';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'RÉINSERTION DU SOUS-SCAPULAIRE', updated_at = now() WHERE id_protocole = 'ACT-0393';

-- =============================================================
-- PHASE 7 : FORMAT — points, espaces, restructuration
-- =============================================================

UPDATE public.thesaurus_protocoles SET libelle_cible = 'MATTI-RUSSE DU SCAPHOÏDE', updated_at = now() WHERE id_protocole = 'ACT-0311';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'HÉMATOME EXTRADURAL (HED)', updated_at = now() WHERE id_protocole = 'ACT-0389';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'ARTHRODÈSE L4-L5', updated_at = now() WHERE id_protocole = 'ACT-0396';
UPDATE public.thesaurus_protocoles SET libelle_cible = 'REPOSITIONNEMENT DE SONDE DE NEUROSTIMULATEUR', updated_at = now() WHERE id_protocole = 'ACT-0403';

-- =============================================================
-- PHASE 8 : SPECIALITE — casse incorrecte
-- =============================================================

UPDATE public.thesaurus_protocoles SET specialite = 'ORTHOPEDIE', updated_at = now() WHERE id_protocole = 'ACT-0421';
UPDATE public.thesaurus_protocoles SET specialite = 'ORTHOPEDIE', updated_at = now() WHERE id_protocole = 'ACT-0422';

COMMIT;

-- ============================================================
-- VERIFICATION post-execution
-- ============================================================
-- SELECT count(*) FROM public.thesaurus_protocoles;
-- -- Attendu : 417 (422 - 5 supprimes)
--
-- SELECT id_protocole, libelle_cible FROM public.thesaurus_protocoles
-- WHERE id_protocole IN ('ACT-0034','ACT-0217','ACT-0422','ACT-0421')
-- ORDER BY id_protocole;
--
-- SELECT id_protocole FROM public.thesaurus_protocoles
-- WHERE id_protocole IN ('ACT-0006','ACT-0137','ACT-0268','ACT-0386','ACT-0416');
-- -- Attendu : 0 lignes
--
-- SELECT count(*) FROM public.thesaurus_interventions WHERE protocole_id IS NULL;
-- -- Comparer avec avant execution

-- ============================================================
-- REPORTE — debriefing session dediee
-- ============================================================
-- S6-ABBREV (11 protocoles) : conventions ">" a arbitrer
--   ACT-0076, ACT-0102, ACT-0140, ACT-0258, ACT-0294,
--   ACT-0295, ACT-0321, ACT-0322, ACT-0358, ACT-0376, ACT-0415
-- Syntheses col femur : ACT-0076 vs ACT-0102
