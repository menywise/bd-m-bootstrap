-- ===========================================================================
-- Cloture session #116 — Cascade Manifeste DBM V1.4 → V1.5
-- Date     : 2026-05-03
-- Objectif : Repercuter le wording V0.7 atelier (D-2026-05-03-DOCTRINE-10)
--            dans le Manifeste fondateur. §1bis (b) externe individuelle
--            mise a jour. Question ouverte "metaphore architecte/pierres"
--            retiree (resolue).
-- Source   : D-2026-05-03-DOCTRINE-10 (MISSION V0.7 atelier)
-- Cible    : 000_MANIFESTE_DBM_V1_5_0.md
-- ===========================================================================

-- ============================================================
-- 0. CREATION ET OUVERTURE SESSION #116
-- ============================================================

INSERT INTO atelier_sessions (numero, titre, statut, dependances, duree_estimee)
VALUES (
  116,
  'Cascade Manifeste DBM V1.4 → V1.5 — repercussion wording atelier',
  'a_faire',
  ARRAY[115],
  '30min-1h'
);

SELECT atelier_ouvrir_session(116);

-- ============================================================
-- 1. DECISION — Cascade Manifeste V1.5
-- ============================================================

INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, tags, session_num, type
) VALUES (
  'D-2026-05-03-DOCTRINE-12',
  '2026-05-03',
  'CASCADE Manifeste DBM V1.4 → V1.5 — wording atelier repercute',
  'Production du Manifeste DBM V1.5 (000_MANIFESTE_DBM_V1_5_0.md). Cascade '
  'consecutive a la decision D-2026-05-03-DOCTRINE-10 (MISSION V0.7 atelier). '
  'Modifications principales : §1bis renomme MISSION V0.6 → V0.7 ; §1bis (b) '
  'externe individuelle wording remplace "Batis ton parcours pierre par pierre. '
  'C est ton parcours, a ton rythme." → "Bienvenue dans ton atelier. Il est a '
  'toi, il grandit a ton rythme." Texte explicatif (b) ajuste pour coherence '
  'metaphore atelier (etabli de soin, instruments, ranger ses gestes). '
  '§1bis (c) externe collective conserve metaphore chantier/pierres pour '
  'l instant — alignement eventuel (b)/(c) ajoute en questions ouvertes. '
  '§6 ajout note V1.5 distinction "atelier" L3 fabrique (tables atelier_*) vs '
  '"atelier" surface mission (b) (etabli de soin metaphorique). Question '
  'ouverte "Metaphore architecte/pierres" RETIREE (resolue session #115). '
  'Audit ARE : A (livrable Manifeste V1.5 produit), R (sources DOCTRINE-10 + '
  'AXE-DETTE resolue + Niveau 0 V0.5 citees), E (3 profils Estelle/Blanche/'
  'Fernand satisfaits). Interdits Niveau 0 honores : #1 (cap nomme), #5 '
  '(sources sourcees), #6 (changement de wording annonce dans le delta).',
  NULL,
  ARRAY['cascade', 'fondateur', 'manifeste', 'wording', 'atelier', 'V1-5'],
  116,
  'doctrine'
);

-- ============================================================
-- 2. CLOTURE SESSION #116
-- ============================================================

SELECT atelier_cloture_session(
  116,
  'fait',
  'Cascade Manifeste DBM V1.5 livree. Wording atelier (V0.7) repercute dans '
  '§1bis (b). §1bis renomme MISSION V0.6 → V0.7. Note V1.5 §6 ajoutee '
  '(distinction atelier L3 vs atelier surface). Question "metaphore '
  'architecte/pierres" RETIREE de Questions Ouvertes (resolue). '
  '4 nouvelles questions ouvertes consignees (alignement (b)/(c), triple '
  'legitimite tooltip, doctrine N1 marketing, doc 1-2-3). Audit ARE 3/3 OK.',
  '1 fichier MD complet : 000_MANIFESTE_DBM_V1_5_0.md (590 lignes, 12 sections '
  'incl. preambule + 4 §1[bis/ter/quater] + questions ouvertes + historique). '
  '+ 1 fichier SQL cloture (S116_cloture_cascade_manifeste_V1_5.sql).',
  ARRAY['D-2026-05-03-DOCTRINE-12']
);

-- ============================================================
-- 3. VERIFICATION POST-CLOTURE (PHASE 3)
-- ============================================================

-- Decision session 116
SELECT ref, date, titre, type FROM atelier_decisions WHERE session_num=116;
-- Attendu : 1 ligne (DOCTRINE-12)

-- Cloture session
SELECT numero, statut, date_fin, journal_refs FROM atelier_sessions WHERE numero=116;
-- Attendu : statut='fait', 1 journal_ref

-- Distribution coherente (pas de nouveau principe ni doublon)
SELECT categorie, COUNT(*) FROM atelier_principes WHERE statut='active'
GROUP BY categorie ORDER BY categorie;
-- Attendu : meme distribution qu'apres S115 (anti_ia=9, axe=16, principe_nomme=22, etc.)

-- ============================================================
-- FIN DU FICHIER DE CLOTURE SESSION #116
-- ============================================================
