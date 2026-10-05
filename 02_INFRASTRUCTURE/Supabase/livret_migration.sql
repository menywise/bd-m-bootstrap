-- ================================================================
--  LIVRET — Migration tables complémentaires module objectifs
--  BDB / Supabase Cloud
--  VERSION   : 1.0.0
--  DATE      : 2026-03-19
--  CTX_REF   : CTX_ACCUEIL_V1_1_0.md · CTX_OBJECTIFS_IDE_V1_2_0.md
--  NOTE      : objectifs_* tables déjà créées (objectifs_migration.sql)
--              Ce fichier crée uniquement les livret_* tables
--  EXÉCUTION :
--    docker cp C:\DEV\BIBLE_DE_BLOC\livret_migration.sql supabase_db_ohccnwyziljqtyrtepel:/tmp/livret_migration.sql
--    docker exec -e PGCLIENTENCODING=UTF8 supabase_db_ohccnwyziljqtyrtepel psql -U postgres -d postgres -f /tmp/livret_migration.sql
-- ================================================================

BEGIN;

-- ================================================================
--  1. TABLES
-- ================================================================

-- ── 1.1 livret_encadrement ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS livret_encadrement (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id    uuid,  -- lien souple vers profiles_directory.id (pas de FK — contrainte absente en DB)
  nom_local     text,
  prenom_local  text,
  telephone     text,
  role_label    text NOT NULL,
  position      int  NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT chk_nom_si_pas_profil CHECK (profile_id IS NOT NULL OR nom_local IS NOT NULL)
);

-- ── 1.2 livret_secteurs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS livret_secteurs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code          text NOT NULL UNIQUE,
  label         text NOT NULL,
  salles        text,
  qualif_salles text,
  effectif      text,
  description   text,
  actes         text,
  couleur_hex   text NOT NULL DEFAULT '#6c757d',
  icone_bi      text NOT NULL DEFAULT 'bi-hospital',
  position      int  NOT NULL DEFAULT 0,
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── 1.3 livret_objectifs_items ─────────────────────────────────
CREATE TABLE IF NOT EXISTS livret_objectifs_items (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  terme         text NOT NULL CHECK (terme IN ('court_terme', 'moyen_terme')),
  domaine_key   text NOT NULL,
  domaine_label text NOT NULL,
  domaine_icone text NOT NULL DEFAULT 'bi-check-circle',
  item_key      text NOT NULL UNIQUE,
  item_label    text NOT NULL,
  item_detail   text,
  position      int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── 1.4 livret_progression ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS livret_progression (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_key    text NOT NULL REFERENCES livret_objectifs_items(item_key) ON DELETE CASCADE,
  statut      text NOT NULL CHECK (statut IN ('acquis', 'en_cours', 'non_acquis')),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, item_key)
);

-- ================================================================
--  2. TRIGGERS updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON livret_encadrement;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON livret_encadrement
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON livret_secteurs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON livret_secteurs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON livret_objectifs_items;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON livret_objectifs_items
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON livret_progression;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON livret_progression
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================================
--  3. RLS
-- ================================================================

ALTER TABLE livret_encadrement     ENABLE ROW LEVEL SECURITY;
ALTER TABLE livret_secteurs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE livret_objectifs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE livret_progression     ENABLE ROW LEVEL SECURITY;

-- ── livret_encadrement ─────────────────────────────────────────
DROP POLICY IF EXISTS "anon_read_enc"   ON livret_encadrement;
DROP POLICY IF EXISTS "member_read_enc" ON livret_encadrement;
DROP POLICY IF EXISTS "admin_all_enc"   ON livret_encadrement;

CREATE POLICY "anon_read_enc"   ON livret_encadrement FOR SELECT TO anon      USING (is_visible = true);
CREATE POLICY "member_read_enc" ON livret_encadrement FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_enc"   ON livret_encadrement FOR ALL    TO authenticated
  USING    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── livret_secteurs ────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_read_sec"   ON livret_secteurs;
DROP POLICY IF EXISTS "member_read_sec" ON livret_secteurs;
DROP POLICY IF EXISTS "admin_all_sec"   ON livret_secteurs;

CREATE POLICY "anon_read_sec"   ON livret_secteurs FOR SELECT TO anon      USING (is_visible = true);
CREATE POLICY "member_read_sec" ON livret_secteurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_sec"   ON livret_secteurs FOR ALL    TO authenticated
  USING    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── livret_objectifs_items ─────────────────────────────────────
DROP POLICY IF EXISTS "anon_read_items"   ON livret_objectifs_items;
DROP POLICY IF EXISTS "member_read_items" ON livret_objectifs_items;
DROP POLICY IF EXISTS "admin_all_items"   ON livret_objectifs_items;

CREATE POLICY "anon_read_items"   ON livret_objectifs_items FOR SELECT TO anon      USING (is_active = true);
CREATE POLICY "member_read_items" ON livret_objectifs_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_items"   ON livret_objectifs_items FOR ALL    TO authenticated
  USING    (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ── livret_progression ─────────────────────────────────────────
DROP POLICY IF EXISTS "member_own_read_prog"  ON livret_progression;
DROP POLICY IF EXISTS "member_own_write_prog" ON livret_progression;
DROP POLICY IF EXISTS "admin_read_all_prog"   ON livret_progression;

CREATE POLICY "member_own_read_prog"  ON livret_progression FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "member_own_write_prog" ON livret_progression FOR ALL    TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_read_all_prog"   ON livret_progression FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ================================================================
--  4. SEED — ENCADREMENT (profile_id NULL = à lier ultérieurement)
-- ================================================================

INSERT INTO livret_encadrement (role_label, prenom_local, nom_local, telephone, position, is_visible) VALUES
  ('Cadre de service',                'Olivia',    'HAMSA',        '05 55 45 43 12', 1, true),
  ('Adjoint de bloc',                 'Romain',    'LE FAUCHEUR',  '05 55 45 46 74', 2, true),
  ('Référente VISC/URO/ORL',          'Sophie',    'PAMPOULY',     null,             3, true),
  ('Référent matériel ORTHO/NEURO',   'Franck',    'PARRE',        null,             4, true),
  ('Référent matériel ORTHO/NEURO',   'Carine',    'NORMAND',      null,             5, true),
  ('Référent anesthésie',             'Valérie',   'CARISTO',      null,             6, true),
  ('Préparatrice en pharmacie',       'Catherine', 'SAINTANGEL',   null,             7, true),
  ('Préparatrice en pharmacie',       'Mélanie',   'BRETHENOUX',   null,             8, true),
  ('AS réapprovisionnement',          'Laurence',  'BATISSOU',     null,             9, true);

-- ================================================================
--  5. SEED — SECTEURS
-- ================================================================

INSERT INTO livret_secteurs (code, label, salles, qualif_salles, effectif, description, actes, couleur_hex, icone_bi, position) VALUES
  ('visceral',      'Viscéral / Urologie / ORL',        '1, 2, 3, 4, 10, 11', 'Aseptiques',        '8 IBODE · 7 IDE actes 1b · 6 IDE · 1 AS',       'Chirurgie digestive, urologie et ORL + salle de soins externes', 'Colectomie · Cholécystectomie · Appendicectomie · Hernie · Prostatectomie · Thyroïdectomie', '#0d6efd', 'bi-activity',        1),
  ('ortho',         'Orthopédie / Neurochirurgie',      '5, 6, 7, 8',         'Hyper aseptiques',  '4 IBODE · 4 IDE actes 1b · 8 IDE · 1 AS',       'Chirurgie osseuse, musculaire et neurochirurgie + radio interventionnelle', 'PTH · PTG · LCA · Rachis · Arthroplasties',                  '#198754', 'bi-bandaid',         2),
  ('sspi',          'SSPI',                             null,                  '15 postes',         '7 IADE · 7 IDE · 3 AS · Brancardiers',           'Surveillance post-interventionnelle et inductions anesthésiques', 'AG · Rachi · Locorégionales · Surveillance per-opératoire',  '#6f42c1', 'bi-heart-pulse',     3),
  ('cardio',        'Cardiologie interventionnelle',    null,                  null,                '2 IDE',                                           'Actes diagnostiques et thérapeutiques cardio-vasculaires',       'Pace maker · Choc électrique · Phlébectomie',                '#dc3545', 'bi-lungs',           4),
  ('endoscopie',    'Endoscopie',                       null,                  null,                '8 IDE · 1 AS',                                   'Explorations endoscopiques urologie et gastro-entérologie',      'Fibroscopies vésicales · Coloscopies · CPRE · Biopsies prostate', '#fd7e14', 'bi-search',       5),
  ('predesinfection','Prédésinfection & Stérilisation', null,                  null,                '6 agents · Stérilisation externalisée',           'Reconditionnement des boîtes et instruments chirurgicaux',       'Nettoyage · Reconditionnement · Traçabilité',                '#6c757d', 'bi-droplet-half',    6);

-- ================================================================
--  6. SEED — OBJECTIFS ITEMS (49 items)
--  Convention item_key : lv_{ct|mt}_{domaine}_{n}
-- ================================================================

INSERT INTO livret_objectifs_items (terme, domaine_key, domaine_label, domaine_icone, item_key, item_label, item_detail, position) VALUES

-- ── COURT TERME — Hygiène (2) ───────────────────────────────
('court_terme','hygiene','Hygiène & Précautions standards','bi-shield-check','lv_ct_hygiene_1','Tenue professionnelle correcte','Tenue bleue niveau 0 · zéro bijoux · pas de vernis · ongles courts · masque chirurgical + calot · téléphone portable interdit',10),
('court_terme','hygiene','Hygiène & Précautions standards','bi-shield-check','lv_ct_hygiene_2','Lavage des mains','Friction hydroalcoolique et lavage selon les 5 indications de l''OMS',20),

-- ── COURT TERME — Administratif (5) ────────────────────────
('court_terme','admin','Tâches administratives','bi-pc-display','lv_ct_admin_1','Ouverture informatisée des salles','Nettoyage · surpression · T° · aspiration · bistouri électrique · garrot · scialytiques · colonne vidéo CO2 · console moteur · auges',10),
('court_terme','admin','Tâches administratives','bi-pc-display','lv_ct_admin_2','Check-list informatisée patient','Identité · côté à opérer · examens indispensables · allergie',20),
('court_terme','admin','Tâches administratives','bi-pc-display','lv_ct_admin_3','Logiciels Optim & Blue-Medi','Optim en salle + Blue-Medi',30),
('court_terme','admin','Tâches administratives','bi-pc-display','lv_ct_admin_4','Papiers prothèses / ANAPATH / Bactério','Gestion des documents de traçabilité papier',40),
('court_terme','admin','Tâches administratives','bi-pc-display','lv_ct_admin_5','Traçabilité DMI','Primordiale pour la recommande de matériel et le suivi dans le dossier patient',50),

-- ── COURT TERME — Missions circulant (13) ──────────────────
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_1', 'Accueil du patient',                      'Communication adaptée · installation avec chirurgien + instrumentiste + équipe anesthésie · risques liés à la position',10),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_2', 'Circuler en salle',                       'Limiter les déplacements hors de la salle · s''organiser de façon réfléchie',20),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_3', 'Habiller l''équipe chirurgicale',          'Casaque stérile + gants dans le respect de l''asepsie',30),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_4', 'Gestion du matériel stérile',             'Containers/pliages/sachets (intégrité, date, plombs) · DM · DMI (vérification chirurgien + traçabilité feuille prothèse)',40),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_5', 'Connaissances techniques équipements',    'Bistouri électrique · colonne coelio · garrot · moteur · appareil de radiologie · Ligasure · Ultracision',50),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_6', 'Techniques de badigeonnage',              'Blue-Medi · protocoles par spécialité',60),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_7', 'Vigilance fin d''intervention',           'Rigueur dans le compte de textiles · réaliser un pansement efficace',70),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_8', 'Signalement événements indésirables',     'Matériel défectueux · dysfonctionnements · tout incident',80),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_9', 'Répondre aux besoins de l''équipe',       'Anticipation des demandes · disponibilité permanente',90),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_10','Prévenir et signaler les fautes d''asepsie','L''erreur est humaine mais doit être rectifiée immédiatement',100),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_11','Sortie patient en SSPI',                  'S''annoncer · sécurité des transferts · surveillance appareillages · transmissions aux IDE SSPI',110),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_12','Ménage adapté à l''intervention',         'Entre deux interventions et en fin de programme',120),
('court_terme','circulant','Missions du circulant','bi-arrow-repeat','lv_ct_circ_13','Rangement salle fin d''intervention',     'Évacuation AES · instruments → décontamination · linge/poubelles/tri déchets · prélèvements anapath/bactério/osseux',130),

-- ── COURT TERME — Soins spécifiques (3) ────────────────────
('court_terme','soins','Soins spécifiques','bi-droplet','lv_ct_soins_1','Sondage à demeure / aller-retour','Dans le respect des règles d''hygiène et d''asepsie',10),
('court_terme','soins','Soins spécifiques','bi-droplet','lv_ct_soins_2','Aide au champage',                'Assistance à l''installation du champ opératoire stérile',20),
('court_terme','soins','Soins spécifiques','bi-droplet','lv_ct_soins_3','Aide à l''induction',             'En collaboration avec l''équipe d''anesthésie',30),

-- ── COURT TERME — Transmissions (5) ────────────────────────
('court_terme','transmissions','Transmissions & Collaboration','bi-chat-square-text','lv_ct_transm_1','Équipe chirurgicale',  'Chirurgien · aide opératoire',10),
('court_terme','transmissions','Transmissions & Collaboration','bi-chat-square-text','lv_ct_transm_2','Équipe anesthésie',   'Anesthésiste · IADE',20),
('court_terme','transmissions','Transmissions & Collaboration','bi-chat-square-text','lv_ct_transm_3','Personnel SSPI',      'Transmissions structurées à la sortie de salle',30),
('court_terme','transmissions','Transmissions & Collaboration','bi-chat-square-text','lv_ct_transm_4','AS & Brancardiers',   'Coordination pour les transferts et le rangement',40),
('court_terme','transmissions','Transmissions & Collaboration','bi-chat-square-text','lv_ct_transm_5','Personnel entretien', 'Communication sur les interventions à venir',50),

-- ── COURT TERME — Intégration (1) ──────────────────────────
('court_terme','integration','Intégration','bi-people','lv_ct_integ_1','Capacité d''intégration au sein de l''équipe','Engagement · respect · communication · esprit d''équipe',10),

-- ── MOYEN TERME — Circulant avancé (4) ─────────────────────
('moyen_terme','circ_avance','Missions circulant — Approfondissement','bi-arrow-up-circle','lv_mt_circ_1','Installations patients + risques',        'Approfondir les connaissances sur les points d''appui et les risques induits',10),
('moyen_terme','circ_avance','Missions circulant — Approfondissement','bi-arrow-up-circle','lv_mt_circ_2','Aide loco-régionales en salle d''induction','En soutien de l''équipe d''anesthésie si besoin',20),
('moyen_terme','circ_avance','Missions circulant — Approfondissement','bi-arrow-up-circle','lv_mt_circ_3','Priorisation des actions',                'Chronologie permettant d''être plus efficace dans les situations complexes',30),
('moyen_terme','circ_avance','Missions circulant — Approfondissement','bi-arrow-up-circle','lv_mt_circ_4','Techniques avancées',                     'Moteur Stryker/Medtronic · Microscope · NIM · Coblator · Lithoclast · Échographe · Lasers · Trilogy',40),

-- ── MOYEN TERME — Faire des liens (3) ──────────────────────
('moyen_terme','liens','Faire des liens','bi-link-45deg','lv_mt_liens_1','Comprendre pourquoi les examens sont nécessaires','Bilan préopératoire · indications · lien avec le geste chirurgical',10),
('moyen_terme','liens','Faire des liens','bi-link-45deg','lv_mt_liens_2','Comprendre la prise en charge anesthésie',         'Différentes techniques et implications sur votre rôle',20),
('moyen_terme','liens','Faire des liens','bi-link-45deg','lv_mt_liens_3','Anatomie · instruments · techniques opératoires',  'Développer ses connaissances pour mieux comprendre les installations et le déroulement des interventions',30),

-- ── MOYEN TERME — Poste de couloir (6) ─────────────────────
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_1','Préparer les interventions',          'Classeur avec fiches techniques pour chaque spécialité',10),
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_2','Gérer le stock',                      'Boîtes + DM Usage Unique',20),
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_3','Péremptions & filtres aspiration',    'Contrôle régulier · remplacement dans les délais',30),
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_4','Aide collègues en salle',             'Renfort ponctuel si besoin',40),
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_5','Désinfection des endoscopes',         'Protocole de traitement adapté par type d''endoscope',50),
('moyen_terme','couloir','Poste de couloir','bi-box-seam','lv_mt_couloir_6','Pleins DM + rangement des salles',    'En salle et dans l''arsenal · rangement organisé',60),

-- ── MOYEN TERME — Qualités professionnelles (7) ────────────
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_1','Anticipation',                     'Prévoir les besoins avant qu''ils soient exprimés',10),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_2','Dextérité',                        'Précision et sûreté du geste en environnement stérile',20),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_3','Rapidité',                         'Efficience dans les temps de rotation de salle',30),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_4','Adaptabilité',                     'Spécialités variées · urgences · situations imprévues',40),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_5','Remise en question',               'Accepter le feedback et progresser continuellement',50),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_6','Intégration & Implication',        'Participation active à la vie et aux projets du bloc',60),
('moyen_terme','qualites','Qualités professionnelles','bi-star','lv_mt_qual_7','Polyvalence dans les spécialités', 'Capacité à intervenir sur les différents secteurs du bloc',70)

ON CONFLICT (item_key) DO NOTHING;

-- ================================================================
--  7. app_modules — Mise à jour entrée objectifs
-- ================================================================

INSERT INTO app_modules
  (key, label, description, icon, color, group_key, path, position, status, is_new, new_until, visibility)
VALUES (
  'objectifs',
  'Intégration IDE',
  'Livret d''accueil et suivi de progression',
  'bi-clipboard-check',
  '#0d6efd',
  'equipe',
  'modules/objectifs/index.html',
  2,
  'coming_soon',
  false, NULL,
  'member'
)
ON CONFLICT (key) DO UPDATE SET
  label       = EXCLUDED.label,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  path        = EXCLUDED.path,
  position    = EXCLUDED.position;

-- ================================================================
--  8. VÉRIFICATION
-- ================================================================

DO $$
DECLARE
  n_enc  int; n_sec  int;
  n_ct   int; n_mt   int; n_total int;
BEGIN
  SELECT COUNT(*) INTO n_enc   FROM livret_encadrement;
  SELECT COUNT(*) INTO n_sec   FROM livret_secteurs;
  SELECT COUNT(*) INTO n_ct    FROM livret_objectifs_items WHERE terme = 'court_terme';
  SELECT COUNT(*) INTO n_mt    FROM livret_objectifs_items WHERE terme = 'moyen_terme';
  SELECT COUNT(*) INTO n_total FROM livret_objectifs_items;

  RAISE NOTICE '=== LIVRET — Vérification migration ===';
  RAISE NOTICE 'Encadrement  : % (attendu : 9)',  n_enc;
  RAISE NOTICE 'Secteurs     : % (attendu : 6)',  n_sec;
  RAISE NOTICE 'Items CT     : % (attendu : 29)', n_ct;
  RAISE NOTICE 'Items MT     : % (attendu : 20)', n_mt;
  RAISE NOTICE 'Items total  : % (attendu : 49)', n_total;

  IF n_enc   <> 9  THEN RAISE EXCEPTION 'ERREUR encadrement (%)' , n_enc;   END IF;
  IF n_sec   <> 6  THEN RAISE EXCEPTION 'ERREUR secteurs (%)'    , n_sec;   END IF;
  IF n_ct    <> 29 THEN RAISE EXCEPTION 'ERREUR items CT (%)'    , n_ct;    END IF;
  IF n_mt    <> 20 THEN RAISE EXCEPTION 'ERREUR items MT (%)'    , n_mt;    END IF;
  RAISE NOTICE 'OK — Migration livret validée.';
END $$;

COMMIT;
