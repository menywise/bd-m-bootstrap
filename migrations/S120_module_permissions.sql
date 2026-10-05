-- ============================================================
-- S120 — Table module_permissions + seed permissions par role/module
-- Date : 2026-05-06
-- Source : Decision D-2026-05-05-S117-01 (role redacteur)
-- Prerequis : S119 doit etre execute avant (enum app_role etendu)
-- Objet :
--   1. Creer une table dediee aux permissions par module et par role
--   2. Definir 4 actions standard : read / propose / publish / admin
--   3. Seed pour les 4 roles sur les 24 modules actifs
-- ============================================================

-- ============================================================
-- ETAPE 1 : creer la table module_permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_key TEXT NOT NULL,
  role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read','propose','publish','admin')),
  autorise BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_key, role, action)
);

CREATE INDEX IF NOT EXISTS idx_module_permissions_module_role
  ON module_permissions (module_key, role);

COMMENT ON TABLE module_permissions IS
  'Matrice permissions par module et par role. 4 actions : read/propose/publish/admin.';
COMMENT ON COLUMN module_permissions.action IS
  'read = consulter | propose = soumettre suggestion | publish = creer/modifier publie | admin = configurer module';

-- ============================================================
-- ETAPE 2 : RLS policies
-- ============================================================

ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- Lecture publique (le shell a besoin de connaitre les permissions de l utilisateur)
DROP POLICY IF EXISTS module_permissions_read ON module_permissions;
CREATE POLICY module_permissions_read ON module_permissions
  FOR SELECT
  USING (true);

-- Modification reservee admin
DROP POLICY IF EXISTS module_permissions_admin_write ON module_permissions;
CREATE POLICY module_permissions_admin_write ON module_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

-- ============================================================
-- ETAPE 3 : seed permissions par role et par module
-- Defaults :
--   admin     : tout autorise sur tous modules
--   redacteur : read+propose+publish (modules editoriaux), read+propose (autres)
--   membre    : read+propose
--   invite    : read uniquement (sur surfaces public-friendly)
-- ============================================================

-- 3.1 ADMIN : tout autorise sur tous les modules actifs
INSERT INTO module_permissions (module_key, role, action, autorise, description)
SELECT m.key, 'admin'::app_role, a.action, true,
       'Admin : autorise par defaut sur tous modules'
FROM app_modules m
CROSS JOIN (VALUES ('read'), ('propose'), ('publish'), ('admin')) AS a(action)
WHERE m.status = 'active'
ON CONFLICT (module_key, role, action) DO UPDATE SET
  autorise = EXCLUDED.autorise,
  updated_at = now();

-- 3.2 MEMBRE : read + propose sur tous, jamais publish ni admin
INSERT INTO module_permissions (module_key, role, action, autorise, description)
SELECT m.key, 'membre'::app_role, a.action,
       a.action IN ('read','propose'),
       CASE a.action
         WHEN 'read' THEN 'Membre : peut consulter'
         WHEN 'propose' THEN 'Membre : peut soumettre suggestion'
         ELSE 'Membre : pas autorise'
       END
FROM app_modules m
CROSS JOIN (VALUES ('read'), ('propose'), ('publish'), ('admin')) AS a(action)
WHERE m.status = 'active'
ON CONFLICT (module_key, role, action) DO UPDATE SET
  autorise = EXCLUDED.autorise,
  updated_at = now();

-- 3.3 REDACTEUR : read + propose + publish sur modules editoriaux
-- Modules editoriaux = ceux ou un membre+ peut creer du contenu publie
-- (glossaire, fiches, cours, anatomie, faq, transmissions, recueil-situation,
--  veille-documentaire, boite-a-idees, interview)
INSERT INTO module_permissions (module_key, role, action, autorise, description)
SELECT m.key, 'redacteur'::app_role, a.action,
       CASE
         WHEN a.action = 'read' THEN true
         WHEN a.action = 'propose' THEN true
         WHEN a.action = 'publish' AND m.key IN (
           'glossaire','fiches','cours','anatomie','faq',
           'transmissions','recueil-situation','veille-documentaire',
           'boite-a-idees','interview','installation','organisateur',
           'thesaurus','arsenal'
         ) THEN true
         ELSE false
       END,
       CASE a.action
         WHEN 'read' THEN 'Redacteur : peut consulter'
         WHEN 'propose' THEN 'Redacteur : peut soumettre suggestion'
         WHEN 'publish' THEN 'Redacteur : peut publier (modules editoriaux)'
         ELSE 'Redacteur : pas autorise (admin seul)'
       END
FROM app_modules m
CROSS JOIN (VALUES ('read'), ('propose'), ('publish'), ('admin')) AS a(action)
WHERE m.status = 'active'
ON CONFLICT (module_key, role, action) DO UPDATE SET
  autorise = EXCLUDED.autorise,
  updated_at = now();

-- 3.4 INVITE : read uniquement sur modules grand public
-- Modules public-friendly = ceux qui peuvent etre visites en mode decouverte
-- (glossaire, faq, cours, anatomie)
INSERT INTO module_permissions (module_key, role, action, autorise, description)
SELECT m.key, 'invite'::app_role, a.action,
       CASE
         WHEN a.action = 'read' AND m.key IN ('glossaire','faq','cours','anatomie','site') THEN true
         ELSE false
       END,
       CASE a.action
         WHEN 'read' THEN CASE
           WHEN m.key IN ('glossaire','faq','cours','anatomie','site')
             THEN 'Invite : peut consulter (mode decouverte)'
           ELSE 'Invite : pas autorise'
         END
         ELSE 'Invite : pas autorise (lecture seule)'
       END
FROM app_modules m
CROSS JOIN (VALUES ('read'), ('propose'), ('publish'), ('admin')) AS a(action)
WHERE m.status = 'active'
ON CONFLICT (module_key, role, action) DO UPDATE SET
  autorise = EXCLUDED.autorise,
  updated_at = now();

-- ============================================================
-- ETAPE 4 : trace decision
-- ============================================================

INSERT INTO atelier_decisions (ref, titre, description, statut, source, created_at)
VALUES (
  'D-2026-05-06-S120-01',
  'Migration S120 — table module_permissions + seed initial',
  'Creation table module_permissions (module_key, role, action, autorise) + seed pour 24 modules x 4 roles x 4 actions = 384 lignes attendues. Defaults : admin=tout, redacteur=read+propose+publish (editoriaux), membre=read+propose, invite=read partiel.',
  'active',
  'Migration S120_module_permissions.sql',
  now()
)
ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- ============================================================
-- ETAPE 5 : verification post-execution
-- ============================================================

-- Compter les lignes seed (attendu : 24 modules x 4 roles x 4 actions = 384)
SELECT
  role,
  COUNT(*) AS nb_lignes,
  SUM(CASE WHEN autorise THEN 1 ELSE 0 END) AS nb_autorises
FROM module_permissions
GROUP BY role
ORDER BY role;

-- Voir un module precis (exemple : glossaire)
SELECT module_key, role, action, autorise
FROM module_permissions
WHERE module_key = 'glossaire'
ORDER BY role, action;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP TABLE IF EXISTS module_permissions CASCADE;
-- DELETE FROM atelier_decisions WHERE ref = 'D-2026-05-06-S120-01';
-- ============================================================

-- ============================================================
-- POST-EXECUTION : adapter le code shell + modules
-- ============================================================
-- 1. bdb-shell.js : charger les permissions de l utilisateur au login
--    SELECT * FROM module_permissions WHERE role = window.bdbUser.role
-- 2. Exposer window.bdbUser.permissions[module_key].read/propose/publish/admin
-- 3. Adapter chaque module : tester window.bdbUser.permissions[key].publish
--    pour afficher modale d edition directe (au lieu de modale proposition)
