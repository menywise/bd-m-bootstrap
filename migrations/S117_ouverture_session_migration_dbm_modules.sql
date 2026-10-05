-- ============================================================
-- OUVERTURE Session #117 — Migration DBM modules (squelettes vides)
-- Date : 2026-05-05
-- Objet : creer la session #117 dans atelier_sessions et l'ouvrir
-- Hierarchie : INSERT puis appel atelier_ouvrir_session(117)
-- INTERDIT-SQL-01 : fichier .sql produit AVANT execution cloud
-- ============================================================

-- 1. Verifier que #117 n'existe pas deja
-- (si existe, l'INSERT echouera sur la contrainte unique sur numero)

INSERT INTO atelier_sessions (
  numero,
  titre,
  statut,
  scope,
  objectifs,
  duree_estimee
) VALUES (
  117,
  'Migration DBM modules — squelettes vides + RETEX',
  'a_faire',
  'modules/ged, modules/pedagogie, modules/admin, modules/supervision (recueil-situation reporte). Habillage Bootstrap + template DBM. Pas de refonte HTML metier.',
  '4 modules migres ANCIEN -> DBM. RETEX enrichi a chaque module pour capitaliser bugs/divergences avant les modules complexes (preferences, interview, carnet-bord, disc).',
  '2-3h'
);

-- 2. Ouvrir la session
SELECT atelier_ouvrir_session(117);
