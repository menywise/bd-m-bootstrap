-- ============================================================
-- S124 - Role Redacteur : flag is_redacteur sur profiles
-- Date : 2026-05-07
-- Session : 118
-- Objet : Ajouter le flag booleen is_redacteur sur profiles et
--         profiles_directory. Pattern symetrique a is_creator.
--         Cascade : admin et creator sont redacteurs d office (gere
--         dans bdb-shell.js et index.html racine).
-- Source : Decision Manu 2026-05-07 - "redacteur = membre surclasse,
--          pas un statut qui disparait" -> flag additionnel, non
--          exclusif avec role primaire user_roles.role.
-- ============================================================
-- ROLLBACK :
--   ALTER TABLE profiles DROP COLUMN IF EXISTS is_redacteur;
--   ALTER TABLE profiles_directory DROP COLUMN IF EXISTS is_redacteur;
--   DELETE FROM atelier_principes WHERE ref='CONV-ROLES-FLAGS-01';
--   DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-REDACTEUR-01';
-- ============================================================
-- DETTE MINEURE documentee : la valeur 'redacteur' dans l enum
-- app_role est orpheline (0 user, 0 reference code). Conservee pour
-- l instant - drop d enum value impossible directement en PostgreSQL.
-- Sera retiree lors de S76 (refonte architecture utilisateurs).
-- ============================================================

-- 1. Ajout colonne sur profiles (table source de verite)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_redacteur BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_redacteur IS
  'Flag additionnel S118 : membre surclasse rédacteur. Cascade : admin et creator sont redacteurs d office (gere cote JS, pas en DB). Pattern symetrique a is_creator. Voir CONV-ROLES-FLAGS-01.';

-- 2. Ajout colonne sur profiles_directory (table dénormalisée lue par bdb-shell)
ALTER TABLE profiles_directory
  ADD COLUMN IF NOT EXISTS is_redacteur BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles_directory.is_redacteur IS
  'Flag additionnel S118 : membre surclasse rédacteur. Denormalise depuis profiles.is_redacteur. Synchronise par S76 (refonte profiles_directory en VIEW).';

-- 3. Doctrine - convention pattern roles + flags
DELETE FROM atelier_principes WHERE ref='CONV-ROLES-FLAGS-01';

INSERT INTO atelier_principes (
  ref, categorie, titre, description, marqueur,
  realite, fonction, avantage, benefice, risque, resultat,
  recommandation, source, date_figement
) VALUES (
  'CONV-ROLES-FLAGS-01',
  'convention',
  'Roles utilisateurs : enum primaire + flags additionnels sur profiles',
  'Architecture des roles utilisateurs DB&M : (1) un role PRIMAIRE EXCLUSIF dans user_roles.role (enum app_role : admin, membre, invite). (2) des FLAGS ADDITIONNELS booleens sur profiles (is_creator, is_redacteur, is_dev, is_suspended) qui se cumulent avec le role primaire. Un membre peut etre redacteur (is_redacteur=true). Un admin est redacteur d office (cascade cote JS, pas en DB). La valeur orpheline redacteur dans l enum app_role est dette mineure documentee, sera retiree en S76.',
  'TOUJOURS',
  'profiles_directory expose deja is_creator/is_dev/is_suspended (pattern flags). user_roles.role contient un enum app_role avec valeurs admin/redacteur/membre/invite. Manu (2026-05-07) confirme : redacteur = membre surclasse cumulable, pas un statut qui remplace membre.',
  'Distinguer le role exclusif (1 par user) des capacites additionnelles cumulables (membre + redacteur, admin + creator).',
  'vs role unique cumulable : permet membre+redacteur sans casser la contrainte UNIQUE(user_id) sur user_roles. vs colonnes role multiples : evolution lineaire, lecture rapide.',
  'Architecture coherente, requetage simple (un SELECT sur profiles_directory donne tout), evolution facile (ajouter is_X = ALTER COLUMN sans migration de donnees).',
  'Si un dev cree un nouveau role exclusif via enum sans cascade JS : incoherence comportementale. Les flags is_X DOIVENT etre charges par bdb-shell.js et exposes dans window.bdbUser.',
  'Implementation S118 livree 2026-05-07 : 26 modules + portail racine exposent window.bdbUser.isRedacteur. Classe .bdb-redacteur-only operationnelle. Migration S124 appliquee. Pattern symetrique a is_creator verifie audit grep.',
  'Pour tout nouveau role : (1) decider role exclusif (enum) ou flag additionnel (is_X). (2) Si flag : ALTER profiles + profiles_directory. (3) Mettre a jour bdb-shell.js SELECT + window.bdbUser. (4) Definir cascades dans la doctrine.',
  'Decision Manu 2026-05-07 + S118 implementation is_redacteur',
  '2026-05-07'
);

-- 4. Decision atelier
DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-REDACTEUR-01';

INSERT INTO atelier_decisions (
  ref, date, titre, description, type, session_num, tags, statut
) VALUES (
  'D-2026-05-07-REDACTEUR-01',
  '2026-05-07',
  'Role redacteur : flag is_redacteur sur profiles + cascade admin/creator',
  'S118 implementation. Ajout colonne is_redacteur BOOLEAN DEFAULT false NOT NULL sur profiles + profiles_directory. Pattern symetrique a is_creator. bdb-shell.js : SELECT etendu, window.bdbUser.isRedacteur ajoute, toggle .bdb-redacteur-only + .bdb-nav-redacteur, badge bdbBadgeRedacteur. index.html racine : badge badgeRedacteur (vert pastel) + checkCreator etendu. dbm-theme.css : variables CSS administrables --app-badge-redacteur-bg/color + classe .app-badge-redacteur. Cascade : admin et creator sont redacteurs d office. Doctrine CONV-ROLES-FLAGS-01 creee. Dette mineure : valeur orpheline redacteur dans enum app_role conservee, drop en S76.',
  'decision',
  118,
  ARRAY['redacteur','roles','flags','profiles','bdb-shell','badge'],
  'active'
);
