-- ===========================================================================
-- Cloture session #115 — P3a wording mission externe + P3b skill session-reprise
-- Date     : 2026-05-03
-- Objectif : (1) Resoudre dette AXE-DETTE-WORDING-MISSION-EXT-01 par metaphore
--               atelier. MISSION DB&M externe individuelle V0.6 → V0.7.
--           (2) Mettre a jour skill session-reprise-bdb en V2.0 avec regle
--               anti-hallucination "pas trouve != inexistant".
-- Sources  : decision Manu sur wording (option b atelier accueillant)
--            + retour Manu session #114 sur recherche superficielle
-- ===========================================================================

-- ============================================================
-- 0. CREATION ET OUVERTURE SESSION #115
-- ============================================================

INSERT INTO atelier_sessions (numero, titre, statut, dependances, duree_estimee)
VALUES (
  115,
  'P3 — Wording mission externe atelier + skill session-reprise V2.0',
  'a_faire',
  ARRAY[114],
  '1-2h'
);

SELECT atelier_ouvrir_session(115);

-- ============================================================
-- 1. DECISION P3a — MISSION externe individuelle V0.7
-- ============================================================

INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-10',
  '2026-05-03',
  'MISSION DB&M externe individuelle V0.7 — metaphore atelier (b accueillant)',
  'Resolution de la dette AXE-DETTE-WORDING-MISSION-EXT-01 (V0.6 livree par '
  'compromis). Brainstorming session #115 P3a : 6 metaphores candidates auditees '
  'sur 3 dimensions (ARE equilibre + DISC Estelle/Blanche/Fernand + Spirale '
  'Bleu/Orange/Vert/Jaune + integrations enneagramme T6→9 / T1→7 / T8→2). '
  'Metaphore retenue : ATELIER (3 profils satisfaits, ARE equilibre, Spirale '
  'etalee, 3 integrations enneagramme satisfaites). Wording V0.7 retenu par Manu '
  '(option b sur 3 variantes proposees) : '
  '"Bienvenue dans ton atelier. Il est a toi, il grandit a ton rythme." '
  'Audit FAB(3R) realise : F positionne DB&M comme outil metier que l IBODE '
  'equipe (vs cours qu on sert). A vs "parcours/rythme" trop vague et '
  '"architecte/edifice" trop intellectuel. B Estelle se sent legitime, Blanche '
  'reconnait la materialite, Fernand y voit l efficience operationnelle. '
  'R1 ancrage metier IBODE (etabli, instruments, ordre). R2 risque collision '
  '"atelier de couture" → mitiger via contexte si besoin. R3 critere succes : '
  '3 profils disent "ca me parle". '
  'Impact : remplace MISSION V0.6 (b) "C est ton parcours, a ton rythme". '
  'Cascade Manifeste DBM V1.4 §1bis (b) → V1.5 a effectuer en session future.',
  NULL,
  ARRAY['cascade', 'fondateur', 'mission', 'wording', 'atelier', 'enneagramme', 'disc'],
  115,
  'doctrine'
);

-- ============================================================
-- 2. UPDATE — Resoudre la dette AXE-DETTE-WORDING-MISSION-EXT-01
-- ============================================================

UPDATE atelier_principes
SET statut = 'obsolete',
    description = description || E'\n\n[RESOLU 2026-05-03 session #115 par D-2026-05-03-DOCTRINE-10 : metaphore ATELIER retenue. Wording V0.7 : "Bienvenue dans ton atelier. Il est a toi, il grandit a ton rythme."]'
WHERE ref = 'AXE-DETTE-WORDING-MISSION-EXT-01';

-- ============================================================
-- 3. DECISION P3b — Skill session-reprise-bdb V2.0
-- ============================================================

INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-11',
  '2026-05-03',
  'SKILL session-reprise-bdb V2.0 — integration regle "pas trouve != inexistant"',
  'Production du skill session-reprise-bdb V2.0 (SKILL.md mis a jour). '
  'Modifications : (1) Renommage BDB → DB&M en surface (prefixes techniques '
  'bdb_* conserves, nom skill garde pour compat). (2) References fondateurs '
  'mises a jour (Niveau 0 V0.5 prealable + Manifeste DBM V1.4 + Canon DBM V1.0.6 '
  '+ Pedagogie DBM V1.1 + REFERENCE_MATRICE_ARE_V1_0_0.md). '
  '(3) NOUVEAU §REGLE ANTI-HALLUCINATION : procedure obligatoire 3+3+2 '
  '(3 emplacements + 3 variantes nom + 2 outils) avant toute declaration "pas '
  'trouve". Format de declaration explicite (RECHERCHE EXHAUSTIVE) si rien '
  'trouve. Reference Niveau 0 INTERDIT #4 (hallucination silencieuse) + #5 '
  '(fausse interpretation silencieuse). (4) §1.3 audit coherence obligatoire. '
  '(5) §2.3 audit ARE en cloture + checklist 6 interdits Niveau 0. '
  '(6) §6 anti-patterns specifiques. (7) Categories decisions/principes mises a '
  'jour (200+ principes actifs). Source : retour Manu session #114 sur recherche '
  'superficielle skills + decision DOCTRINE-08 CLAUDE.md V2.2 §19. '
  'Anti-regression : evite que sessions futures declarent "absent" sans audit.',
  NULL,
  ARRAY['cascade', 'skill', 'session-reprise', 'anti-hallucination', 'pas-trouve-inexistant'],
  115,
  'doctrine'
);

-- ============================================================
-- 4. PRINCIPE NOMME — ANTI-IA-PAS-TROUVE-INEXISTANT
-- ============================================================
-- FAB(3R) obligatoire (GFC-ATELIER-02)

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'anti_ia',
  'ANTI-IA-PAS-TROUVE-INEXISTANT',
  'Pas trouve != inexistant — recherche exhaustive obligatoire avant declaration "absent"',
  'Avant toute declaration "X n existe pas / pas de fichier / aucun resultat / le module n a '
  'pas de skill", Claude doit avoir audite au moins 3 emplacements + teste 3 variantes de nom '
  '+ utilise 2 outils (Glob + Grep). Format de declaration explicite obligatoire si rien trouve. '
  'Source : skill session-reprise-bdb V2.0 §REGLE ANTI-HALLUCINATION + CLAUDE.md V2.2 §19.',
  NULL,
  'D-2026-05-03-DOCTRINE-11',
  'TOUJOURS',
  -- realite (R1)
  'Session #114 : Claude a declare un fichier "absent" (skill pedagogie) apres une seule '
  'recherche dans C:\DEV\SKILL_Claude. Le fichier existait ailleurs (00_GOUVERNANCE/Print/). '
  'Manu a corrige : "si tu n as pas auditer le dossier, c est que tu n as pas cherche". '
  'Risque structurel d hallucination par paresse de recherche.',
  -- fonction (F)
  'Force Claude a une procedure 3+3+2 avant toute declaration "absent" : 3 emplacements '
  'differents (dossier evident + sous-dossiers + emplacements externes), 3 variantes de nom '
  '(exact + casse + lexical), 2 outils (Glob + Grep). Format de declaration explicite si '
  'rien trouve qui prouve la rigueur du test.',
  -- avantage (A)
  'vs declaration spontanee "pas trouve" : evite hallucination par paresse de recherche. '
  'vs question systematique a Manu : Claude epuise d abord ses ressources avant de demander.',
  -- benefice (B)
  'Manu ne re-explique plus "tu n as pas cherche assez". Sessions futures heritent d une '
  'pratique structuree. Reduction du temps perdu en faux negatifs.',
  -- risque (R2)
  'Si Claude oublie d appliquer la procedure : faux negatif, hallucination, regression Niveau 0 '
  'INTERDIT #4. Acteur : Claude (ou IA tierce). Moment : a chaque recherche dont l absence '
  'serait declaree. Consequence : decision basee sur info fausse, perte de confiance.',
  -- resultat (R3)
  'Skill session-reprise-bdb V2.0 §REGLE ANTI-HALLUCINATION publie 2026-05-03. '
  'Reference dans CLAUDE.md V2.2 §19 + memoire feedback_search_humility.md. '
  'Verifiable : a chaque future declaration "absent", la presence du format "RECHERCHE '
  'EXHAUSTIVE" est obligatoire.',
  -- recommandation (Reco)
  'Appliquer la procedure 3+3+2 a chaque recherche dont l absence pourrait etre declaree. '
  'Quand le format "RECHERCHE EXHAUSTIVE" n est pas tenable (ex : recherche simple), au '
  'minimum tester 2 variantes + 2 outils avant toute declaration. Toute violation = signaler '
  'a Manu, pas etouffer.'
);

-- ============================================================
-- 5. CLOTURE SESSION #115
-- ============================================================

SELECT atelier_cloture_session(
  115,                                                  -- numero
  'fait',                                               -- statut
  'Session P3 livree : (1) MISSION DB&M externe individuelle V0.6 → V0.7 — '
  'metaphore ATELIER retenue (3 profils satisfaits, ARE equilibre, Spirale '
  'etalee). Dette AXE-DETTE-WORDING-MISSION-EXT-01 RESOLUE. (2) Skill '
  'session-reprise-bdb V2.0 — regle anti-hallucination "pas trouve != '
  'inexistant" integree. Principe nomme ANTI-IA-PAS-TROUVE-INEXISTANT '
  'ancre en base avec FAB(3R) complet. Cascade vers Manifeste DBM V1.5 '
  '(MAJ §1bis (b) avec wording atelier) reste a faire en session future.',
  '1 fichier SQL cloture (S115_*.sql) + 1 skill SKILL.md mis a jour ' ||
  '(skills/session-reprise-bdb/SKILL.md V2.0).',
  ARRAY[
    'D-2026-05-03-DOCTRINE-10',
    'D-2026-05-03-DOCTRINE-11'
  ]
);

-- ============================================================
-- 6. VERIFICATION POST-CLOTURE (PHASE 3)
-- ============================================================

-- Decisions session 115
SELECT ref, date, titre, type FROM atelier_decisions WHERE session_num=115 ORDER BY ref;
-- Attendu : 2 lignes (DOCTRINE-10, DOCTRINE-11)

-- Principe ANTI-IA inseré FAB(3R) complet
SELECT ref, categorie, marqueur,
       (realite IS NOT NULL) AS r1,
       (fonction IS NOT NULL) AS f,
       (avantage IS NOT NULL) AS a,
       (benefice IS NOT NULL) AS b,
       (risque IS NOT NULL) AS r2,
       (resultat IS NOT NULL) AS r3,
       (recommandation IS NOT NULL) AS reco
FROM atelier_principes
WHERE ref='ANTI-IA-PAS-TROUVE-INEXISTANT';
-- Attendu : 7 colonnes FAB true

-- Dette resolue
SELECT ref, statut, LEFT(description, 200) AS extrait_description
FROM atelier_principes
WHERE ref='AXE-DETTE-WORDING-MISSION-EXT-01';
-- Attendu : statut='obsolete', description avec mention RESOLU

-- Cloture session
SELECT numero, titre, statut, date_fin, livrables, journal_refs
FROM atelier_sessions
WHERE numero=115;
-- Attendu : statut='fait', 2 journal_refs

-- ============================================================
-- FIN DU FICHIER DE CLOTURE SESSION #115
-- ============================================================
