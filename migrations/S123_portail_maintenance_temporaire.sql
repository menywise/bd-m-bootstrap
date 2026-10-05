-- ============================================================
-- S123 - Portail mode maintenance temporaire (apparence unifiee)
-- Date : 2026-05-07
-- Session : 123
-- Objet : Activer 3 modules coming_soon + ajouter colonne TEMPORAIRE
--         maintenance_difficulty + seed difficulty 26 modules +
--         documenter doctrine TEMPORAIRE en atelier_principes
-- Source : Decision Manu 2026-05-07 - aucun module n est en prod
--          publique apres 1 an, audit v5 falsifie. Pas de mode
--          "maintenance" formel, juste apparence portail unifiee
--          pour la phase de transition.
-- ============================================================
-- ROLLBACK :
--   UPDATE app_modules SET status='coming_soon'
--     WHERE key IN ('recueil-situation','ged','pedagogie');
--   ALTER TABLE app_modules DROP COLUMN IF EXISTS maintenance_difficulty;
--   DELETE FROM atelier_principes WHERE ref='TEMP-MAINT-PORTAIL-01';
--   DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-MAINT-01';
-- ============================================================

-- ============================================================
-- 1. Activer les 3 modules coming_soon (squelettes vivants S117)
-- ============================================================
UPDATE app_modules
SET status='active', updated_at=now()
WHERE key IN ('recueil-situation','ged','pedagogie');

-- ============================================================
-- 2. Colonne TEMPORAIRE maintenance_difficulty (1-5)
-- ============================================================
ALTER TABLE app_modules
  ADD COLUMN IF NOT EXISTS maintenance_difficulty SMALLINT;

COMMENT ON COLUMN app_modules.maintenance_difficulty IS
  'TEMPORAIRE 2026-05-07 (S123). Score difficulte 1-5 pour mode '
  'maintenance portail. A SUPPRIMER en cloture phase transition. '
  'Voir atelier_principes ref=TEMP-MAINT-PORTAIL-01.';

-- ============================================================
-- 3. Seed difficulty (26 modules metier, score auto par quintile)
--    Score = nbf + 2*nbt + min(sum_rows/100, 10)*0.5
-- ============================================================
UPDATE app_modules SET maintenance_difficulty=1
  WHERE key IN ('pedagogie','ged','recueil-situation','medacta','faq');

UPDATE app_modules SET maintenance_difficulty=2
  WHERE key IN ('carnet_bord','boite-a-idees','supervision','profile','interview');

UPDATE app_modules SET maintenance_difficulty=3
  WHERE key IN ('organisateur','glossaire','preferences','fiches','annuaire');

UPDATE app_modules SET maintenance_difficulty=4
  WHERE key IN ('transmissions','installation','objectifs','cours','arsenal');

UPDATE app_modules SET maintenance_difficulty=5
  WHERE key IN ('anatomie','thesaurus','planning','veille-documentaire','admin','disc');

-- ============================================================
-- 4. Doctrine TEMPORAIRE
-- ============================================================
DELETE FROM atelier_principes WHERE ref='TEMP-MAINT-PORTAIL-01';

INSERT INTO atelier_principes (
  ref, categorie, titre, description, marqueur,
  realite, fonction, avantage, benefice, risque, resultat,
  recommandation, source, date_figement
) VALUES (
  'TEMP-MAINT-PORTAIL-01',
  'convention',
  'Portail DBM en mode maintenance - apparence unifiee TEMPORAIRE',
  'Phase de transition pre-prod : le portail DBM ignore les groupes '
    '(bloc, equipe, savoir, pilotage, espace_perso) et regroupe tous '
    'les modules sous une seule section "En maintenance". Tri par '
    'maintenance_difficulty ASC puis position ASC. Marqueur discret '
    '"En cours" sur chaque carte. Doctrine TEMPORAIRE : vise a '
    'presenter visuellement l etat reel "tout est en chantier" '
    'pendant la stabilisation. A supprimer des qu un seuil de '
    'modules valides est atteint (critere objectif a definir par '
    'Manu en cloture).',
  'AUJOURD_HUI',
  'Aucun module DBM en prod publique apres 1 an. Audit v5 '
    'falsifie (score 100% obtenu par modification du runner '
    'entre run 0d9d8cf4 et run 1506a4ba). Manu refuse le critere '
    '"recettage manuel signe" car non objectif.',
  'Empecher Claude de halluciner cet etat transitoire comme '
    'situation ferme. Marquer visuellement la phase de transition.',
  'Coherence visuelle reelle (tout est en chantier), pas de '
    'fausse promesse de modules "valides", documentation explicite '
    'de l etat temporaire en DB (atelier_principes + colonne SQL).',
  'Manu et collaborateurs voient l etat reel sans illusion. '
    'Claude rappelle a chaque session reprise que c est temporaire.',
  'Si oubli : faux signal de stabilite, retour a l affichage par '
    'groupe avant que les modules soient reellement valides.',
  'Documente comme TEMPORAIRE en DB (atelier_principes + colonne '
    'maintenance_difficulty + commentaire SQL). Rollback '
    'documente dans S123.',
  'A la cloture de la phase transition : (1) DROP COLUMN '
    'app_modules.maintenance_difficulty (2) restaurer affichage '
    'par groupe dans index.html (3) UPDATE atelier_principes SET '
    'statut=''archived'' pour ce ref.',
  'Decision Manu 2026-05-07 + session reprise post-audit-v5 falsifie',
  '2026-05-07'
);

-- ============================================================
-- 5. Decision atelier
-- ============================================================
DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-MAINT-01';

INSERT INTO atelier_decisions (
  ref, date, titre, description, type, session_num, tags, statut
) VALUES (
  'D-2026-05-07-MAINT-01',
  '2026-05-07',
  'Portail DBM mode maintenance temporaire',
  '3 modules coming_soon (recueil-situation, ged, pedagogie) '
    'actives. Colonne TEMPORAIRE maintenance_difficulty ajoutee a '
    'app_modules. 26 modules metier scores en 5 quintiles selon '
    'nb fichiers + nb tables DB + volume rows. index.html modifie '
    'pour ignorer group_key et regrouper sous "En maintenance" '
    'avec tri par difficulty ASC. Ancien marqueur V5 (point vert) '
    'supprime, remplace par badge "En cours" gris pastel sur '
    'chaque carte. Doctrine TEMP-MAINT-PORTAIL-01 cree.',
  'decision',
  123,
  ARRAY['portail','maintenance','TEMPORAIRE','transition','difficulty'],
  'active'
);

-- ============================================================
-- POST-EXECUTION : verifications a executer
-- ============================================================
-- SELECT key, status, maintenance_difficulty, group_key, visibility
-- FROM app_modules ORDER BY maintenance_difficulty, position, key;
--
-- SELECT ref, marqueur, date_figement FROM atelier_principes
-- WHERE ref='TEMP-MAINT-PORTAIL-01';
--
-- SELECT ref, type, session_num FROM atelier_decisions
-- WHERE ref='D-2026-05-07-MAINT-01';
-- ============================================================
