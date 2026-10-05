-- ===========================================================================
-- Cloture session #114 — Cascade fondateurs P1+P2
-- Date     : 2026-05-03
-- Objectif : Documenter la production de 4 fichiers fondateurs en cascade
--            apres les decisions DOCTRINE-01 a 04 de la session #113.
-- Cibles   :
--   P1a — 000_MANIFESTE_DBM_V1_4_0.md      (Manifeste DB&M V1.4)
--   P1b — 0000_DBM_CANON_V1_0_6.md         (Canon DB&M V1.0.6)
--   P2a — 04_PEDAGOGIE_DBM_V1_1_0.md       (Pedagogie DB&M V1.1)
--   P2b — CLAUDE.md V2.2                   (en place, pas renomme)
-- Dettes adressees : D14 (partiel), D15 (partiel), D16 (clos), D17 (clos), D18 (clos)
-- ===========================================================================

-- ============================================================
-- 0. CREATION ET OUVERTURE SESSION #114
-- ============================================================

INSERT INTO atelier_sessions (numero, titre, statut, dependances, duree_estimee)
VALUES (
  114,
  'Cascade fondateurs P1+P2 — Manifeste V1.4 / Canon V1.0.6 / Pedagogie V1.1 / CLAUDE.md V2.2',
  'a_faire',
  ARRAY[113],
  '2-3h'
);

SELECT atelier_ouvrir_session(114);

-- ============================================================
-- 1. DECISIONS — 4 cascades documentees
-- ============================================================

-- P1a — Manifeste DBM V1.4
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-05',
  '2026-05-03',
  'CASCADE P1a — Manifeste BDB V1.3 → DBM V1.4',
  'Production du Manifeste DB&M V1.4.0 (000_MANIFESTE_DBM_V1_4_0.md). '
  'Renommage BDB → DB&M en surface (prefixes techniques bdb_* conserves). '
  'Ajouts : §0 renvoi Niveau 0 V0.5 prealable obligatoire, §1 reecrit '
  '(push → pull, matiere structuree DB&M), §1bis MISSION V0.6 (3 versions : L3 interne / '
  'externe individuelle "tu" / externe collective "vous"), §1ter VISION V0.4 (4 formulations : '
  '3 ans 100k€ / 10 ans 1M€), §1quater VALEURS V0.3 (3 niveaux : 13 etiquettes publiques / '
  '4 mecanismes invisibles N2 / 13 internes L3), §2bis chaine 12+ confirmee (clos D17), '
  '§2ter 5 POURQUOI V0.1 (chaine symptome → racine), §5 confirme 11 personas (clos D18), '
  '§7.7 vue 12 maillons devient principale + vue 6 = pitch (clos D16), §10 hierarchie 7 rangs '
  '(Niveau 0 au rang 0). Sources : DOCTRINE-01 a 04 + Niveau 0 V0.5. Audit ARE : Action '
  '(delta nomme), Reflexion (sources atelier_decisions citees), Emotion (cap DB&M preserve). '
  'Interdits Niveau 0 honores : #1 (cap nomme), #5 (interpretations sourcees), #6 '
  '(renommage DB&M annonce).',
  NULL,
  ARRAY['cascade', 'fondateur', 'manifeste', 'dbm', 'd16-clos', 'd17-clos', 'd18-clos'],
  114,
  'doctrine'
);

-- P1b — Canon DBM V1.0.6
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-06',
  '2026-05-03',
  'CASCADE P1b — Canon BDB V1.0.5 → DBM V1.0.6',
  'Production du Canon DB&M V1.0.6 (0000_DBM_CANON_V1_0_6.md). Renommage BDB → DB&M en surface. '
  'Ajouts : preambule renvoi Niveau 0, §1 promesse formalisee comme PROMESSE-5-BONS '
  '(bonne info / bonne personne / bon moment / bon endroit / bon niveau), §1 reference D-2026-04-26-GPS-01 '
  '(cercle vertueux mini-site ↔ app), §2 chaine 12+ alignee (Doctrine + Manifeste V1.4), '
  '§8 INTERDIT-WORDING-METHODES-01 explicite avec table avant/apres (jamais nommer Boudreault, '
  'Knowles, SECI, POULET, Kolb, Spirale en surface L1/L2), §10 hierarchie 6 rangs avec '
  'Niveau 0 au rang 0. Source #1 : Manifeste DB&M V1.4. Maladies adressees : amnesie '
  '(5 bons enfin formalises) + certitude (methodes en coulisses). Interdits Niveau 0 '
  'honores : #1, #4, #6.',
  NULL,
  ARRAY['cascade', 'fondateur', 'canon', 'dbm', 'promesse-5-bons', 'gps-01', 'interdit-wording'],
  114,
  'doctrine'
);

-- P2a — Pedagogie DBM V1.1
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-07',
  '2026-05-03',
  'CASCADE P2a — Pedagogie BDB V1.0 → DBM V1.1',
  'Production de la Pedagogie DB&M V1.1.0 (04_PEDAGOGIE_DBM_V1_1_0.md). Renommage BDB → DB&M. '
  'Ajouts : §3 dimension VALEURS DB&M — 4 mecanismes invisibles N2 (A. integrations enneagramme '
  'par profil / B. fluidifications DISC interpersonnelles / C. rupture cycle toxique PNL-AT / '
  'D. construction savoir-agir Boudreault) ; §4 isomorphisme 4 ajoute — 4 savoirs DB&M '
  '(savoir / savoir-faire / savoir-etre / savoir-agir), source CONV-SAVOIR-AGIR-01 ; '
  '§4 evolution doctrinale : savoir-agir devient savoir explicite (plus mode flou) ; '
  '§1 + §2 axe 11 PRINCIPE-SPIRALE-DYNAMIQUE integre (leve rejet V1.0 §9, utilite Niveau 0 '
  'V0.5 §4.1 demontree, source CONV-SPIRALE-NIVEAU) ; §5 projection POULET × Spirale ; '
  '§6 implications produit 6.6 tag niveau_spirale + 6.7 tag savoir-agir ; §8.5 INTERDIT-WORDING-METHODES-01 '
  '(methodes nommees L3, jamais L1/L2) ; §9 leve rejet Spirale. Bibliographie 24 → 28 '
  '(ajouts : Beck-Cowan, Graves, Bandler-Grinder, Berne). Maladies adressees : amnesie '
  '(promesse V1.0 §9 tenue) + certitude (savoir-agir explicite). Interdits Niveau 0 honores : '
  '#1, #3, #5.',
  NULL,
  ARRAY['cascade', 'fondateur', 'pedagogie', 'dbm', 'spirale', 'savoir-agir', 'mecanismes-invisibles'],
  114,
  'doctrine'
);

-- ============================================================
-- 1bis. DECISION ARE — ancrage anti-regression matrice ARE
-- ============================================================

INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-09',
  '2026-05-03',
  'ANCRAGE ARE — production REFERENCE_MATRICE_ARE_V1_0_0.md',
  'Production du document de reference REFERENCE_MATRICE_ARE_V1_0_0.md '
  '(00_GOUVERNANCE/) suite a recherche web autoritative (Institut Francais '
  'de l Enneagramme - Chabreuil ; Narrative Enneagram ; Integrative9 ; '
  'Enneagram Institute Riso-Hudson). ARE = denomination DBM des 3 centres '
  'd intelligence enneagramme : A=Action centre instinctif (verbes : agir, '
  'faire, proteger, structurer ; emotion colere ; types 8-9-1 ; cerveau '
  'reptilien) / R=Reflexion centre mental (verbes : penser, analyser, '
  'anticiper ; emotion peur ; types 5-6-7 ; neocortex) / E=Emotion centre '
  'emotionnel (verbes : sentir, connecter, relier ; emotion honte ; types '
  '2-3-4 ; cerveau limbique). Sources sourcees : Gurdjieff (centres) → '
  'Ichazo (systeme) → Naranjo (psychiatrisation) → Riso-Hudson (harmonique) '
  '→ Chabreuil (FR) → DB&M (application sous le nom ARE dans Niveau 0 V0.5). '
  'Validation MacLean 1990 + Damasio 1995. Production : 10 sections + table '
  '3 centres + 7 verbes par centre + distinction critique avec enneagramme '
  'des PROCESSUS DBM + application obligatoire L1/L2/L3 (INTERDIT-WORDING-METHODES-01) '
  '+ test de non-regression. Document anti-hallucination toute future mention ARE.',
  NULL,
  ARRAY['cascade', 'fondateur', 'ARE', 'enneagramme', '3-centres', 'anti-regression', 'anti-hallucination'],
  114,
  'doctrine'
);

-- ============================================================
-- 1ter. PRINCIPE NOMME — PRINCIPE-ARE-MATRICE
-- ============================================================
-- FAB(3R) obligatoire (GFC-ATELIER-02)

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'principe_nomme',
  'PRINCIPE-ARE-MATRICE',
  'Matrice ARE = 3 centres enneagramme (A=Action/instinctif, R=Reflexion/mental, E=Emotion/emotionnel)',
  'ARE est la denomination DB&M des 3 centres d intelligence de l enneagramme contemporain '
  '(Ichazo / Naranjo / Riso-Hudson / Chabreuil). Outil transversal d audit des QUI (personas) '
  'et des QUOI (documents, modules, skills). Equipondere : aucun centre ne peut etre absent. '
  'Source autoritative documentee : REFERENCE_MATRICE_ARE_V1_0_0.md.',
  NULL,
  'D-2026-05-03-DOCTRINE-09',
  'TOUJOURS',
  -- realite (R1)
  'Avant V1.0 du document de reference, le sigle ARE etait utilise dans le Niveau 0 V0.5 §4.2 '
  'sans ancrage centralise. Risque d hallucination par sessions futures (re-invention du sigle, '
  'derive des verbes, perte de l attribution Ichazo/Naranjo/Riso-Hudson/Chabreuil).',
  -- fonction (F)
  'Ancre ARE dans 3 sources sourcees : (a) document REFERENCE_MATRICE_ARE_V1_0_0.md '
  'avec table verbes par centre + origine historique + distinction critique avec enneagramme '
  'des PROCESSUS DB&M, (b) Niveau 0 V0.5 §4.2 ARE comme instrument de navigation, (c) ce '
  'principe nomme charge par atelier_prompt_reprise() au demarrage de chaque session.',
  -- avantage (A)
  'vs alternative "laisser ARE flotter dans les seuls fichiers MD" : un principe en base est '
  'recharge a chaque atelier_prompt_reprise() — toute IA reprend une session avec ARE deja '
  'calibre, sans re-lire 14 sections du Niveau 0.',
  -- benefice (B)
  'Zero seance future ne re-debattra "c est quoi ARE ?". Manu ne re-explique plus. Les 4 fichiers '
  'fondateurs cascades en session #114 (Manifeste DBM V1.4, Canon DBM V1.0.6, Pedagogie DBM V1.1, '
  'CLAUDE.md V2.2) qui mentionnent ARE pointent vers la meme reference centralisee.',
  -- risque (R2)
  'Si ce principe est obsolete ou modifie sans repercussion dans REFERENCE_MATRICE_ARE_V1_0_0.md '
  'et inversement : Claude session +N produit un audit ARE incoherent qui contamine un livrable '
  'fondateur. Acteur : Claude ou IA tierce. Moment : a l ouverture de toute session impliquant '
  'audit ARE. Consequence : regression silencieuse Niveau 0 §7 INTERDIT #3.',
  -- resultat (R3)
  'Document REFERENCE_MATRICE_ARE_V1_0_0.md de 10 sections (date 2026-05-03), insertion '
  'verifiable via SELECT atelier_principes WHERE ref=PRINCIPE-ARE-MATRICE, ancrage en memoire '
  'Claude (entree reference_matrice_are.md). Verifiable a chaque ouverture de session via '
  'le test de non-regression §9.3 du document.',
  -- recommandation (Reco)
  'Recharger PRINCIPE-ARE-MATRICE a chaque session via atelier_prompt_reprise(). Avant toute '
  'mention ARE en production de fichier fondateur, pointer vers REFERENCE_MATRICE_ARE_V1_0_0.md. '
  'Toute evolution ARE = bumper version du document de reference + UPDATE de ce principe.'
);

-- P2b — CLAUDE.md V2.2
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-08',
  '2026-05-03',
  'CASCADE P2b — CLAUDE.md V2.1 → V2.2',
  'Production du CLAUDE.md V2.2 (en place, pas renomme — convention Claude Code). '
  'Modifications : §0 ajoute Niveau 0 prealable obligatoire avec liste des 6 interdits '
  'navigation et 3 maladies, §1 reecrit en DB&M (push → pull, matiere structuree, '
  'mission V0.6 / vision V0.4 / 5 pourquoi V0.1 integres), §2 PROMESSE-5-BONS formalisee '
  '+ GPS-01 reference, §6 combo 12 maillons devient principal (D16 clos), §8 11 personas '
  'confirme (D18 clos), §10 INTERDIT-WORDING-METHODES-01 ajoute aux regles IA, '
  '§12 hierarchie 7 rangs (Niveau 0 au rang 0), §18 199 principes actifs (vs 191 V2.1, '
  '+8 depuis snapshot 2026-05-02), §20 6 fondateurs A0-A6 (ajout A0 Niveau 0 V0.5, '
  'A1 Manifeste DBM V1.4, A2 Canon DBM V1.0.6, A6 Pedagogie DBM V1.1), '
  '§19 ajout regle "pas trouve != inexistant" (feedback session #114). '
  'Renommage BDB → DB&M en surface, prefixes bdb_* conserves. Source de bootstrap IA correct.',
  NULL,
  ARRAY['cascade', 'fondateur', 'claude-md', 'dbm', 'bootstrap-ia', 'pas-trouve-inexistant'],
  114,
  'doctrine'
);

-- ============================================================
-- 2. CLOTURE SESSION #114
-- ============================================================

SELECT atelier_cloture_session(
  114,                                                  -- numero
  'fait',                                               -- statut
  'Cascade fondateurs P1+P2 livree integralement. 4 fichiers produits '
  '(Manifeste DBM V1.4, Canon DBM V1.0.6, Pedagogie DBM V1.1, CLAUDE.md V2.2). '
  'Renommage BDB → DB&M acte en surface, prefixes techniques bdb_* conserves. '
  '3 dettes closes (D16 combo, D17 chaine du chaos, D18 personas), 2 dettes '
  'partielles (D14 doc, D15 principes Canon). Audit ARE : OK 4/4. Interdits '
  'Niveau 0 honores : #1, #3, #4, #5, #6.',           -- avancement
  '4 fichiers MD complets : 000_MANIFESTE_DBM_V1_4_0.md, 0000_DBM_CANON_V1_0_6.md, '
  '04_PEDAGOGIE_DBM_V1_1_0.md, CLAUDE.md V2.2 + 1 fichier SQL cloture '
  '(S114_cloture_cascade_fondateurs_P1_P2.sql).',     -- livrables
  ARRAY[
    'D-2026-05-03-DOCTRINE-05',
    'D-2026-05-03-DOCTRINE-06',
    'D-2026-05-03-DOCTRINE-07',
    'D-2026-05-03-DOCTRINE-08',
    'D-2026-05-03-DOCTRINE-09'
  ]                                                     -- journal_refs
);

-- ============================================================
-- 3. VERIFICATION POST-CLOTURE (PHASE 3 du skill atelier-session-bdb)
-- ============================================================

-- Verifier que les 4 decisions sont bien inserees
SELECT ref, date, titre, type, session_num
FROM atelier_decisions
WHERE session_num = 114
ORDER BY ref;
-- Attendu : 4 lignes (DOCTRINE-05 a 08)

-- Verifier la cloture session
SELECT numero, titre, statut, date_fin, avancement, livrables, journal_refs
FROM atelier_sessions
WHERE numero = 114;
-- Attendu : statut='fait', date_fin=2026-05-03, journal_refs avec 4 entrees

-- Distribution principes (ne doit pas avoir bouge — pas d'INSERT atelier_principes ici)
SELECT categorie, COUNT(*) AS nb
FROM atelier_principes
WHERE statut='active'
GROUP BY categorie
ORDER BY categorie;
-- Attendu : meme distribution qu'avant cette session (199 total, +0)

-- ============================================================
-- FIN DU FICHIER DE CLOTURE SESSION #114
-- ============================================================
