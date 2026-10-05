-- ============================================================
-- MIGRATION 021 — THESAURUS V2 (restructuration complète)
-- BDB · Supabase cloud
-- Réf : D-2026-03-24-001 à 009
-- INTERDIT-SQL-01 : fichier .sql AVANT exécution
-- ============================================================
-- OBJECTIF :
--   1. Tables de référence chirurgiens + panseuses (Option A)
--   2. FK uuid dans thesaurus_interventions (remplace text)
--   3. Troncature RGPD dates → 1er du mois
--   4. Ajout lateralite (CHECK D/G/B) + note
--   5. duree_minutes dans thesaurus_protocoles
--   6. Suppression colonnes text redondantes
--   7. Mise à jour RPC
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- SECTION 1 — TABLE RÉFÉRENCE : thesaurus_chirurgiens
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.thesaurus_chirurgiens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text NOT NULL,
  prenom      text NOT NULL DEFAULT '',
  profile_id  uuid,  -- nullable (retraités) — pas de FK formelle, profiles_directory sans PK
  specialite  text NOT NULL DEFAULT 'ORTHOPEDIE',
  actif       boolean NOT NULL DEFAULT true,
  retirement_date date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.thesaurus_chirurgiens IS
  'Référentiel chirurgiens thésaurus — actifs + retraités. profile_id = uuid sans FK (profiles_directory sans PK formelle — dette audit cloud 2026-03-22).';

ALTER TABLE public.thesaurus_chirurgiens ENABLE ROW LEVEL SECURITY;

CREATE POLICY thesaurus_chir_select_approved
  ON public.thesaurus_chirurgiens FOR SELECT
  TO authenticated USING (is_approved());

CREATE POLICY thesaurus_chir_admin_all
  ON public.thesaurus_chirurgiens FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════════════════════
-- SECTION 2 — TABLE RÉFÉRENCE : thesaurus_panseuses
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.thesaurus_panseuses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         text NOT NULL,
  prenom      text NOT NULL DEFAULT '',
  profile_id  uuid,  -- nullable (renforts sans compte v1) — pas de FK formelle
  profil      text NOT NULL DEFAULT 'IDE'
              CHECK (profil IN ('IDE', 'IBODE')),
  role_bloc   text NOT NULL DEFAULT 'panseur'
              CHECK (role_bloc IN ('panseur', 'instru')),
  secteur     text NOT NULL DEFAULT 'ortho'
              CHECK (secteur IN ('ortho', 'visceral', 'les_deux')),
  actif       boolean NOT NULL DEFAULT true,
  note        text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.thesaurus_panseuses IS
  'Référentiel panseuses/IDE thésaurus — concordance arbitrée Manu D-2026-03-24-007.';

ALTER TABLE public.thesaurus_panseuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY thesaurus_pans_select_approved
  ON public.thesaurus_panseuses FOR SELECT
  TO authenticated USING (is_approved());

CREATE POLICY thesaurus_pans_admin_all
  ON public.thesaurus_panseuses FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════════════════════
-- SECTION 3 — SEED CHIRURGIENS (10 actifs 2026 + 2 retraités connus)
-- profile_id = NULL pour tous → réconciliation manuelle ultérieure
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.thesaurus_chirurgiens (nom, prenom, specialite, actif) VALUES
  ('LOUISIA',      'Stéphane',       'ORTHOPEDIE',      true),
  ('PICOULEAU',    'Alexandre',      'ORTHOPEDIE',      true),
  ('BOSCHER',      'Julien',         'ORTHOPEDIE',      true),
  ('VACQUERIE',    'Virginie',       'ORTHOPEDIE',      true),
  ('ALAIN',        'Jérôme',         'ORTHOPEDIE',      true),
  ('DOTZIS',       'Anthony',        'ORTHOPEDIE',      true),
  ('MARCZUK',      'Yann',           'ORTHOPEDIE',      true),
  ('COSTE',        'Cédric',         'ORTHOPEDIE',      true),
  ('CHROSCIANY',   'Sacha',          'ORTHOPEDIE',      true),
  ('LAGARRIGUE',   'Jean-François',  'NEURO CHIRURGIE', true),
  -- Retraités connus (à compléter avec l'historique)
  ('FOURASTIER',   '',               'ORTHOPEDIE',      false),
  ('VAQUIER',      '',               'ORTHOPEDIE',      false)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- SECTION 4 — SEED PANSEUSES (22 arbitrées Manu 2026-03-24)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.thesaurus_panseuses (nom, prenom, profil, role_bloc, secteur, note) VALUES
  -- NOYAU DUR — comptes BDB
  ('NICOLAS',           'Carole',         'IDE',   'panseur', 'ortho',   ''),
  ('LEPROUX',           'Carole',         'IDE',   'panseur', 'ortho',   ''),
  ('ROHAUT',            'Manuel',         'IDE',   'panseur', 'ortho',   'Admin BDB'),
  ('COMPAIN',           'Julie',          'IDE',   'panseur', 'ortho',   ''),
  ('FREDAIGUE',         'Cynthia',        'IBODE', 'instru',  'ortho',   ''),
  ('PAQUIER',           'Marion',         'IDE',   'panseur', 'ortho',   ''),
  ('CARRIER',           'Eléonore',       'IDE',   'instru',  'ortho',   ''),
  ('DELONG',            'Isabelle',       'IDE',   'instru',  'ortho',   ''),
  ('THUILLIER',         'Emma',           'IDE',   'instru',  'ortho',   ''),
  -- RÉGULIERS — comptes BDB
  ('NORMAND',           'Carine',         'IDE',   'instru',  'ortho',   ''),
  ('MAILLET',           'Valérie',        'IBODE', 'instru',  'ortho',   ''),
  ('MERIC DE BELLEFON', 'Quentin',        'IDE',   'instru',  'ortho',   ''),
  ('BUENO',             'Sophie',         'IDE',   'instru',  'ortho',   ''),
  ('DUGOT',             'Sabine',         'IBODE', 'instru',  'ortho',   ''),
  ('PARRE',             'Franck',         'IBODE', 'instru',  'ortho',   'Encadrement 35+ ans'),
  -- CADRE
  ('MAUSSET',           'Estelle',        'IDE',   'panseur', 'ortho',   'Cadre — dépannage'),
  -- RENFORTS VISCÉRAL — sans compte v1
  ('BARRY',             'Ophélie',        'IDE',   'panseur', 'visceral', ''),
  ('ROBY',              'Marie-Hélène',   'IDE',   'panseur', 'visceral', ''),
  ('CLUZAUD',           'Pierre-Alexis',  'IDE',   'instru',  'visceral', ''),
  ('TONDUSSON',         'Jeanne',         'IDE',   'instru',  'visceral', ''),
  ('ROCHE',             'Corinne',        'IDE',   'panseur', 'visceral', ''),
  ('UNIA',              'Manon',          'IDE',   'panseur', 'visceral', '')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- SECTION 5 — ALTER thesaurus_protocoles : ajouter duree_minutes
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.thesaurus_protocoles
  ADD COLUMN IF NOT EXISTS duree_minutes integer;

COMMENT ON COLUMN public.thesaurus_protocoles.duree_minutes IS
  'Durée de référence en minutes (attribut protocole, pas de l''intervention). Source OPTIM.';

-- ══════════════════════════════════════════════════════════════
-- SECTION 6 — ALTER thesaurus_interventions : nouvelles colonnes
-- Ajout des FK + lateralite + note AVANT migration
-- ══════════════════════════════════════════════════════════════

-- Nouvelles colonnes (nullable initialement pour migration)
ALTER TABLE public.thesaurus_interventions
  ADD COLUMN IF NOT EXISTS protocole_id  uuid REFERENCES public.thesaurus_protocoles(id),
  ADD COLUMN IF NOT EXISTS chirurgien_id uuid REFERENCES public.thesaurus_chirurgiens(id),
  ADD COLUMN IF NOT EXISTS panseuse_id   uuid REFERENCES public.thesaurus_panseuses(id),
  ADD COLUMN IF NOT EXISTS lateralite    text CHECK (lateralite IN ('D', 'G', 'B')),
  ADD COLUMN IF NOT EXISTS note          text NOT NULL DEFAULT '';

-- ══════════════════════════════════════════════════════════════
-- SECTION 7 — MIGRATION DONNÉES : peupler FK depuis colonnes text
-- ══════════════════════════════════════════════════════════════

-- 7a. Peupler chirurgien_id depuis chirurgien (text)
-- Les 70K lignes existantes ont le nom seul ("LOUISIA", "DOTZIS"...)
-- L'export 2026 aura "NOM Prénom" → on matche sur le nom (1er mot)
UPDATE public.thesaurus_interventions i
SET chirurgien_id = c.id
FROM public.thesaurus_chirurgiens c
WHERE UPPER(SPLIT_PART(i.chirurgien, ' ', 1)) = UPPER(c.nom)
  AND i.chirurgien_id IS NULL;

-- 7b. Peupler protocole_id depuis protocole_operatoire (text)
-- Match sur libelle_cible (exact ou normalisé)
UPDATE public.thesaurus_interventions i
SET protocole_id = p.id
FROM public.thesaurus_protocoles p
WHERE UPPER(TRIM(i.protocole_operatoire)) = UPPER(TRIM(p.libelle_cible))
  AND i.protocole_id IS NULL;

-- 7c. RGPD : tronquer date_intervention au 1er du mois
UPDATE public.thesaurus_interventions
SET date_intervention = DATE_TRUNC('month', date_intervention)::date
WHERE date_intervention != DATE_TRUNC('month', date_intervention)::date;

-- 7d. Rendre les anciennes colonnes text nullable
-- Nécessaire pour que 021b puisse insérer sans fournir ces colonnes
-- Elles seront supprimées en section 9 après validation
ALTER TABLE public.thesaurus_interventions ALTER COLUMN chirurgien DROP NOT NULL;
ALTER TABLE public.thesaurus_interventions ALTER COLUMN protocole_operatoire DROP NOT NULL;
ALTER TABLE public.thesaurus_interventions ALTER COLUMN specialite DROP NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- SECTION 8 — VÉRIFICATION AVANT SUPPRESSION COLONNES
-- ══════════════════════════════════════════════════════════════
-- EXÉCUTER CES REQUÊTES MANUELLEMENT AVANT SECTION 9 :
--
-- SELECT COUNT(*) AS total,
--        COUNT(chirurgien_id) AS avec_chir_fk,
--        COUNT(protocole_id) AS avec_proto_fk
-- FROM public.thesaurus_interventions;
--
-- → SI avec_chir_fk < total : des chirurgiens historiques manquent
--   dans thesaurus_chirurgiens. Les ajouter puis re-exécuter 7a.
--
-- → SI avec_proto_fk < total : des protocoles manquent dans la table
--   de correspondance. Analyser les orphelins :
--   SELECT DISTINCT protocole_operatoire
--   FROM thesaurus_interventions WHERE protocole_id IS NULL;
--
-- NE PAS EXÉCUTER LA SECTION 9 TANT QUE LES COMPTEURS NE SONT PAS À 100%

-- ══════════════════════════════════════════════════════════════
-- SECTION 9 — SUPPRESSION COLONNES TEXT (APRÈS VALIDATION §8)
-- ⚠ IRRÉVERSIBLE — décommenter uniquement après vérification
-- ══════════════════════════════════════════════════════════════

-- DROP INDEX IF EXISTS idx_thesaurus_interv_chirurgien;
-- DROP INDEX IF EXISTS idx_thesaurus_interv_protocole;
-- DROP INDEX IF EXISTS idx_thesaurus_interv_specialite;
--
-- ALTER TABLE public.thesaurus_interventions
--   DROP COLUMN IF EXISTS chirurgien,
--   DROP COLUMN IF EXISTS protocole_operatoire,
--   DROP COLUMN IF EXISTS specialite;
--
-- ALTER TABLE public.thesaurus_interventions
--   ALTER COLUMN protocole_id SET NOT NULL,
--   ALTER COLUMN chirurgien_id SET NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- SECTION 10 — NOUVEAUX INDEX (remplacent les anciens sur text)
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_thesaurus_interv_chirurgien_id
  ON public.thesaurus_interventions (chirurgien_id);

CREATE INDEX IF NOT EXISTS idx_thesaurus_interv_protocole_id
  ON public.thesaurus_interventions (protocole_id);

CREATE INDEX IF NOT EXISTS idx_thesaurus_interv_panseuse_id
  ON public.thesaurus_interventions (panseuse_id);

CREATE INDEX IF NOT EXISTS idx_thesaurus_interv_lateralite
  ON public.thesaurus_interventions (lateralite)
  WHERE lateralite IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_thesaurus_chir_nom
  ON public.thesaurus_chirurgiens (nom);

CREATE INDEX IF NOT EXISTS idx_thesaurus_chir_actif
  ON public.thesaurus_chirurgiens (actif)
  WHERE actif = true;

CREATE INDEX IF NOT EXISTS idx_thesaurus_pans_nom
  ON public.thesaurus_panseuses (nom);

-- ══════════════════════════════════════════════════════════════
-- SECTION 11 — RPC MISES À JOUR (V2 : lecture depuis FK)
-- ══════════════════════════════════════════════════════════════

-- DROP anciennes signatures (changement de type retour)
DROP FUNCTION IF EXISTS public.thesaurus_distinct_chirurgiens();
DROP FUNCTION IF EXISTS public.thesaurus_distinct_annees();

CREATE OR REPLACE FUNCTION public.thesaurus_distinct_chirurgiens()
RETURNS TABLE(id uuid, nom text, prenom text, specialite text, actif boolean)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT c.id, c.nom, c.prenom, c.specialite, c.actif
  FROM public.thesaurus_chirurgiens c
  ORDER BY c.nom;
$$;

CREATE OR REPLACE FUNCTION public.thesaurus_distinct_annees()
RETURNS TABLE(annee text)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT DISTINCT EXTRACT(YEAR FROM i.date_intervention)::text AS annee
  FROM public.thesaurus_interventions i
  ORDER BY annee DESC;
$$;

CREATE OR REPLACE FUNCTION public.thesaurus_distinct_panseuses()
RETURNS TABLE(id uuid, nom text, prenom text, profil text, role_bloc text, actif boolean)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT p.id, p.nom, p.prenom, p.profil, p.role_bloc, p.actif
  FROM public.thesaurus_panseuses p
  WHERE p.actif = true
  ORDER BY p.nom;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.thesaurus_distinct_chirurgiens() TO authenticated;
GRANT EXECUTE ON FUNCTION public.thesaurus_distinct_annees() TO authenticated;
GRANT EXECUTE ON FUNCTION public.thesaurus_distinct_panseuses() TO authenticated;

-- ============================================================
-- FIN MIGRATION 021
--
-- PROCÉDURE D'EXÉCUTION :
--   1. Exécuter sections 1-7 (DDL + seeds + migration FK + RGPD)
--   2. Exécuter les requêtes de vérification section 8
--   3. Corriger les orphelins si nécessaire
--   4. Décommenter et exécuter section 9 (suppression colonnes)
--   5. Exécuter sections 10-11 (index + RPC)
--
-- RÉSULTAT ATTENDU :
--   thesaurus_chirurgiens    → 12 lignes (10 actifs + 2 retraités)
--   thesaurus_panseuses      → 22 lignes
--   thesaurus_protocoles     → +colonne duree_minutes
--   thesaurus_interventions  → FK uuid, dates tronquées, lateralite, note
-- ============================================================
