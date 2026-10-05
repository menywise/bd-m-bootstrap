-- ================================================================
--  OBJECTIFS IDE — Migration complète
--  BDB / Supabase Cloud
--  VERSION   : 1.0.0
--  DATE      : 2026-03-19
--  CTX_REF   : CTX_OBJECTIFS_IDE_V1_2_0.md
--  EXÉCUTION : docker exec -e PGCLIENTENCODING=UTF8 supabase_db_ohccnwyziljqtyrtepel
--              psql -U postgres -d postgres -f objectifs_migration.sql
-- ================================================================

BEGIN;

-- ================================================================
--  1. TABLES
-- ================================================================

-- ── 1.1 objectifs_semaines ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS objectifs_semaines (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine_num   int  NOT NULL,
  label         text NOT NULL,
  description   text,
  position      int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── 1.2 objectifs_criteres ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS objectifs_criteres (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine_id      uuid NOT NULL REFERENCES objectifs_semaines(id) ON DELETE CASCADE,
  objectif_num    int  NOT NULL,
  objectif_label  text NOT NULL,
  critere_num     int  NOT NULL,
  critere_label   text NOT NULL,
  critere_detail  text,
  item_key        text NOT NULL UNIQUE,
  position        int  NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 1.3 objectifs_evaluations ──────────────────────────────────
-- A2 soldé : auto-évaluation IDE uniquement — pas de validated_by
CREATE TABLE IF NOT EXISTS objectifs_evaluations (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_key    text NOT NULL REFERENCES objectifs_criteres(item_key) ON DELETE CASCADE,
  statut      text NOT NULL CHECK (statut IN ('oui', 'non')),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, item_key)
);

-- ================================================================
--  2. TRIGGERS updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON objectifs_semaines;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON objectifs_semaines
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON objectifs_criteres;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON objectifs_criteres
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON objectifs_evaluations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON objectifs_evaluations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================================
--  3. RLS
-- ================================================================

ALTER TABLE objectifs_semaines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs_criteres    ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs_evaluations ENABLE ROW LEVEL SECURITY;

-- ── objectifs_semaines ──────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_semaines"   ON objectifs_semaines;
DROP POLICY IF EXISTS "member_read_semaines" ON objectifs_semaines;
DROP POLICY IF EXISTS "admin_all_semaines"   ON objectifs_semaines;

CREATE POLICY "anon_read_semaines"
  ON objectifs_semaines FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "member_read_semaines"
  ON objectifs_semaines FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_all_semaines"
  ON objectifs_semaines FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ── objectifs_criteres ─────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_criteres"   ON objectifs_criteres;
DROP POLICY IF EXISTS "member_read_criteres" ON objectifs_criteres;
DROP POLICY IF EXISTS "admin_all_criteres"   ON objectifs_criteres;

CREATE POLICY "anon_read_criteres"
  ON objectifs_criteres FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "member_read_criteres"
  ON objectifs_criteres FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_all_criteres"
  ON objectifs_criteres FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ── objectifs_evaluations ──────────────────────────────────────

DROP POLICY IF EXISTS "member_own_read_evals"  ON objectifs_evaluations;
DROP POLICY IF EXISTS "member_own_write_evals" ON objectifs_evaluations;
DROP POLICY IF EXISTS "admin_read_all_evals"   ON objectifs_evaluations;

-- Lecture : chaque IDE voit uniquement ses propres évaluations
CREATE POLICY "member_own_read_evals"
  ON objectifs_evaluations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Écriture : chaque IDE ne peut écrire que ses propres évaluations (A2 soldé)
CREATE POLICY "member_own_write_evals"
  ON objectifs_evaluations FOR ALL TO authenticated
  USING    (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin : lecture de toutes les évaluations (vue progression équipe)
CREATE POLICY "admin_read_all_evals"
  ON objectifs_evaluations FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ================================================================
--  4. SEED — SEMAINES
--  UUIDs fixes pour garantir la cohérence des FK critères
-- ================================================================

INSERT INTO objectifs_semaines (id, semaine_num, label, description, position, is_active)
VALUES
  (
    'a1000001-0000-0000-0000-000000000001',
    1,
    '1ère Semaine',
    'Organisation générale du bloc · Hygiène · Accueil patient · Stérilité',
    1,
    true
  ),
  (
    'a1000001-0000-0000-0000-000000000002',
    2,
    '2ème Semaine',
    'Tables d''opération · Installation patient · Sécurité per-opératoire',
    2,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ================================================================
--  5. SEED — CRITÈRES
--  Convention item_key : s{semaine_num}_obj{objectif_num}_c{critere_num}
--  39 critères : S1 = 21 · S2 = 18
-- ================================================================

INSERT INTO objectifs_criteres
  (semaine_id, objectif_num, objectif_label, critere_num, critere_label, critere_detail, item_key, position, is_active)
VALUES

-- ── SEMAINE 1 ──────────────────────────────────────────────────

-- Objectif 1 : Organisation générale + hygiène et asepsie (9 critères)
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 1, 'Respecter une tenue de bloc conforme',                                    null,                                             's1_obj1_c1', 10,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 2, 'Charlotte ou autre coiffant',                                             null,                                             's1_obj1_c2', 20,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 3, 'Tenue propre chaque jour',                                                null,                                             's1_obj1_c3', 30,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 4, 'Absence de bijoux aux doigts',                                            'Boucles d''oreilles dans le coiffant',            's1_obj1_c4', 40,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 5, 'Lavage des mains avant l''entrée dans le bloc puis S.H.A.',               null,                                             's1_obj1_c5', 50,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 6, 'Port du masque chirurgical systématique en salle d''opération',           null,                                             's1_obj1_c6', 60,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 7, 'Sabots de bloc lavables',                                                 null,                                             's1_obj1_c7', 70,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 8, 'Identification des différents locaux du Bloc Opératoire',                 'Vestiaires, salles, SSPI...',                     's1_obj1_c8', 80,  true),
('a1000001-0000-0000-0000-000000000001', 1, 'Organisation générale du Bloc Opératoire et respect des gestes d''hygiène et d''asepsie', 9, 'Base d''asepsie',                                                         null,                                             's1_obj1_c9', 90,  true),

-- Objectif 2 : Organisation spécifique (3 critères)
('a1000001-0000-0000-0000-000000000001', 2, 'Organisation spécifique', 1, 'S''informer du planning opératoire général',                                  null, 's1_obj2_c1', 10, true),
('a1000001-0000-0000-0000-000000000001', 2, 'Organisation spécifique', 2, 'Repérer le rôle de chacun',                                                    null, 's1_obj2_c2', 20, true),
('a1000001-0000-0000-0000-000000000001', 2, 'Organisation spécifique', 3, 'Repérer l''usage de l''ordinateur et les supports écrits existants au Bloc',   null, 's1_obj2_c3', 30, true),

-- Objectif 3 : Accueillir le patient (4 critères)
('a1000001-0000-0000-0000-000000000001', 3, 'Accueillir le patient', 1, 'Vérifier l''identité du patient en concordance avec le dossier',                 'NOM, Prénom, Date de naissance',                                                        's1_obj3_c1', 10, true),
('a1000001-0000-0000-0000-000000000001', 3, 'Accueillir le patient', 2, 'Contrôler côté à opérer, préparation zone, absence dentier/lentilles, allergie, matériel prothétique, hygiène', null,                                                  's1_obj3_c2', 20, true),
('a1000001-0000-0000-0000-000000000001', 3, 'Accueillir le patient', 3, 'Check-list',                                                                     null,                                                                                    's1_obj3_c3', 30, true),
('a1000001-0000-0000-0000-000000000001', 3, 'Accueillir le patient', 4, 'Pour les mineurs : autorisation d''opérer des deux parents',                     null,                                                                                    's1_obj3_c4', 40, true),

-- Objectif 4 : Être garant de la stérilité des D.M. et de l'hygiène en salle (5 critères)
('a1000001-0000-0000-0000-000000000001', 4, 'Être garant de la stérilité des D.M. et de l''hygiène en salle', 1, 'Contrôler l''état stérile des instruments utilisés',               'Étiquette validité stérilité, plomb',  's1_obj4_c1', 10, true),
('a1000001-0000-0000-0000-000000000001', 4, 'Être garant de la stérilité des D.M. et de l''hygiène en salle', 2, 'Ouvrir stérilement des contenants',                               'Boîtes ou sachets',                    's1_obj4_c2', 20, true),
('a1000001-0000-0000-0000-000000000001', 4, 'Être garant de la stérilité des D.M. et de l''hygiène en salle', 3, 'Noter la traçabilité de la stérilité sur les documents prévus',   null,                                   's1_obj4_c3', 30, true),
('a1000001-0000-0000-0000-000000000001', 4, 'Être garant de la stérilité des D.M. et de l''hygiène en salle', 4, 'Connaître les principes de pré-désinfection des instruments souillés', null,                              's1_obj4_c4', 40, true),
('a1000001-0000-0000-0000-000000000001', 4, 'Être garant de la stérilité des D.M. et de l''hygiène en salle', 5, 'Trier et évacuer les DASRI et autres déchets',                    null,                                   's1_obj4_c5', 50, true),

-- ── SEMAINE 2 ──────────────────────────────────────────────────
-- Numérotation A1 soldé : S2-1 Tables · S2-2 Installation · S2-3 Sécurité

-- Objectif 1 : Savoir utiliser les tables d'opération (7 critères)
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 1, 'Mettre la table en charge',                                     null, 's2_obj1_c1', 10, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 2, 'Utiliser la télécommande',                                      null, 's2_obj1_c2', 20, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 3, 'Mise en proclive, déclive, roulis latéral, billot',             null, 's2_obj1_c3', 30, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 4, 'Installation d''appui-bras et cales latérales',                 null, 's2_obj1_c4', 40, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 5, 'Appuis gynécologiques',                                         null, 's2_obj1_c5', 50, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 6, 'Rallonges de table MAQUET — Table ortho',                       null, 's2_obj1_c6', 60, true),
('a1000001-0000-0000-0000-000000000002', 1, 'Savoir utiliser les tables d''opération', 7, 'Table STERIS',                                                  null, 's2_obj1_c7', 70, true),

-- Objectif 2 : Connaître les principes d'installation du patient (6 critères)
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 1, 'Protéger les téguments',                                     'Coussins de la table, rond de tête',                                                                's2_obj2_c1', 10, true),
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 2, 'Couvrir le patient',                                          'Couverture chauffante',                                                                             's2_obj2_c2', 20, true),
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 3, 'Installer les appareils de surveillance per-opératoire',      'Cardioscope et électrode, brassard à tension, saturomètre',                                         's2_obj2_c3', 30, true),
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 4, 'Mettre le patient en position adéquate',                      'DD, DL, position gynéco, demi-assis ±têtière, décubitus ventral, bouée, rond de tête',            's2_obj2_c4', 40, true),
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 5, 'Connaissances des différentes procédures sur les installations', null,                                                                                              's2_obj2_c5', 50, true),
('a1000001-0000-0000-0000-000000000002', 2, 'Connaître les principes d''installation du patient', 6, 'Faire la détersion du site opératoire',                       null,                                                                                                's2_obj2_c6', 60, true),

-- Objectif 3 : Assurer la sécurité du patient (5 critères)
('a1000001-0000-0000-0000-000000000002', 3, 'Assurer la sécurité du patient', 1, 'Éviter les chutes',                                                           'Velcro pour les membres, appuis latéraux',    's2_obj3_c1', 10, true),
('a1000001-0000-0000-0000-000000000002', 3, 'Assurer la sécurité du patient', 2, 'Éviter les risques de brûlures électriques',                                  'Mise en place d''une plaque neutre',          's2_obj3_c2', 20, true),
('a1000001-0000-0000-0000-000000000002', 3, 'Assurer la sécurité du patient', 3, 'Maîtriser le compte des textiles',                                             null,                                          's2_obj3_c3', 30, true),
('a1000001-0000-0000-0000-000000000002', 3, 'Assurer la sécurité du patient', 4, 'Acheminer les prélèvements anatomopathologiques et bactériologiques en assurant la traçabilité', null, 's2_obj3_c4', 40, true),
('a1000001-0000-0000-0000-000000000002', 3, 'Assurer la sécurité du patient', 5, 'Connaître les procédures de prélèvement',                                      null,                                          's2_obj3_c5', 50, true)

ON CONFLICT (item_key) DO NOTHING;

-- ================================================================
--  6. app_modules — Enregistrement dans la navigation BDB
-- ================================================================

INSERT INTO app_modules
  (key, label, description, icon, color, group_key, path,
   position, status, is_new, new_until, visibility)
VALUES (
  'objectifs',
  'Objectifs IDE',
  'Fiche d''évaluation semaine par semaine',
  'bi-clipboard-check',
  '#0d6efd',
  'equipe',
  'modules/objectifs/index.html',
  2,
  'coming_soon',
  false,
  NULL,
  'member'
)
ON CONFLICT (key) DO UPDATE SET
  label       = EXCLUDED.label,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  color       = EXCLUDED.color,
  group_key   = EXCLUDED.group_key,
  path        = EXCLUDED.path,
  position    = EXCLUDED.position,
  visibility  = EXCLUDED.visibility;

-- ================================================================
--  7. VÉRIFICATION POST-MIGRATION
-- ================================================================

DO $$
DECLARE
  n_sem   int;
  n_crit  int;
  n_s1    int;
  n_s2    int;
BEGIN
  SELECT COUNT(*) INTO n_sem  FROM objectifs_semaines;
  SELECT COUNT(*) INTO n_crit FROM objectifs_criteres;
  SELECT COUNT(*) INTO n_s1   FROM objectifs_criteres WHERE semaine_id = 'a1000001-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO n_s2   FROM objectifs_criteres WHERE semaine_id = 'a1000001-0000-0000-0000-000000000002';

  RAISE NOTICE '=== OBJECTIFS — Vérification migration ===';
  RAISE NOTICE 'Semaines     : % (attendu : 2)',  n_sem;
  RAISE NOTICE 'Critères     : % (attendu : 39)', n_crit;
  RAISE NOTICE '  Semaine 1  : % (attendu : 21)', n_s1;
  RAISE NOTICE '  Semaine 2  : % (attendu : 18)', n_s2;

  IF n_sem  <> 2  THEN RAISE EXCEPTION 'ERREUR : nombre de semaines incorrect (%)' , n_sem;  END IF;
  IF n_crit <> 39 THEN RAISE EXCEPTION 'ERREUR : nombre de critères incorrect (%)' , n_crit; END IF;
  IF n_s1   <> 21 THEN RAISE EXCEPTION 'ERREUR : critères S1 incorrect (%)'        , n_s1;   END IF;
  IF n_s2   <> 18 THEN RAISE EXCEPTION 'ERREUR : critères S2 incorrect (%)'        , n_s2;   END IF;

  RAISE NOTICE 'OK — Migration objectifs validée.';
END $$;

COMMIT;
