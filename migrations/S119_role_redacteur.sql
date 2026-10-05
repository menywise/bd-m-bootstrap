-- ============================================================
-- S119 — Role redacteur (niveau intermediaire entre membre et admin)
-- Date : 2026-05-06
-- Source : Decision D-2026-05-05-S117-01 (statut active en DB)
-- Objet : ajouter le role 'redacteur' dans l enum app_role
-- Hierarchie cible : admin > redacteur > membre > invite
-- ============================================================

-- AVANT execution : verifier que le role n existe pas deja
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
-- WHERE t.typname = 'app_role' ORDER BY enumsortorder;
-- Resultat actuel : admin, membre, invite (3 valeurs)

-- ============================================================
-- ETAPE 1 : ajout valeur 'redacteur' dans l enum
-- Position : entre 'admin' et 'membre' (niveau de privilege)
-- ============================================================

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'redacteur' BEFORE 'membre';

-- ============================================================
-- ETAPE 2 : trace de la decision en atelier_decisions (deja existante)
-- D-2026-05-05-S117-01 deja active, on enregistre l execution
-- ============================================================

INSERT INTO atelier_decisions (ref, titre, description, statut, source, created_at)
VALUES (
  'D-2026-05-06-S119-01',
  'Migration S119 — role redacteur ajoute en DB',
  'Execution de la decision D-2026-05-05-S117-01 : enum app_role etendu avec valeur "redacteur" (entre admin et membre). Aucune politique RLS automatiquement adaptee. Adaptation au cas par cas par module via parametrage permissions (S120).',
  'active',
  'Migration S119_role_redacteur.sql',
  now()
)
ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- ============================================================
-- ETAPE 3 : verification post-execution
-- ============================================================

-- Verifier que les 4 valeurs sont bien presentes
SELECT t.typname, e.enumlabel, e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'app_role'
ORDER BY e.enumsortorder;

-- Resultat attendu :
-- app_role | admin     | 1
-- app_role | redacteur | 1.5 (positionne entre 1 et 2)
-- app_role | membre    | 2
-- app_role | invite    | 3

-- ============================================================
-- ROLLBACK (manuel — PostgreSQL ne supporte pas DROP VALUE)
-- ============================================================
-- Pour annuler en cas de probleme :
-- 1. Migrer tous les utilisateurs avec role='redacteur' vers 'membre'
--    UPDATE user_roles SET role='membre' WHERE role='redacteur';
-- 2. Recreer un nouveau type sans 'redacteur' (operation lourde)
--    CREATE TYPE app_role_new AS ENUM ('admin','membre','invite');
--    ALTER TABLE user_roles ALTER COLUMN role TYPE app_role_new
--      USING role::text::app_role_new;
--    DROP TYPE app_role;
--    ALTER TYPE app_role_new RENAME TO app_role;
-- ============================================================

-- ============================================================
-- POST-EXECUTION : actions manuelles a planifier
-- ============================================================
-- 1. Adapter les politiques RLS au cas par cas selon parametrage_modules (S120)
-- 2. Mettre a jour bdb-shell.js : window.bdbUser.isRedacteur (boolean)
-- 3. Mettre a jour bdb-invite-guard.js : ne pas bloquer si role='redacteur'
-- 4. Adapter modules editoriaux : afficher CTA admin direct si redacteur
