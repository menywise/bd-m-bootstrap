-- =============================================================
-- SEED LOCAL : Données de démonstration pour développement
-- Exécuter après supabase db reset + seed.sql
-- =============================================================
-- IMPORTANT : Remplacez ce UUID par le user_id de votre admin local
-- (SELECT id FROM auth.users WHERE email = 'manuel.rohaut@gmail.com')

DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'manuel.rohaut@gmail.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur admin introuvable. Créez un compte avant d''exécuter ce script.';
  END IF;

  -- ===================== GANTS =====================
  INSERT INTO public.gants (user_id, titre, description, marque, modele, matiere, sans_latex, tailles_disponibles, couleurs_disponibles, localisation, tags, status, is_dev) VALUES
    (v_uid, 'Biogel Surgeons', 'Gant chirurgical latex haute sensibilité', 'Mölnlycke', 'Biogel Surgeons', 'Latex naturel', false, '6, 6.5, 7, 7.5, 8, 8.5', 'Beige', 'Salle de stockage B2', ARRAY['chirurgie','latex','standard'], 'published', true),
    (v_uid, 'Biogel Eclipse', 'Double gantage avec indicateur de perforation', 'Mölnlycke', 'Biogel Eclipse', 'Latex naturel', false, '6, 6.5, 7, 7.5, 8', 'Vert / Beige', 'Salle de stockage B2', ARRAY['chirurgie','double-gantage','indicateur'], 'published', true),
    (v_uid, 'Gammex Non-Latex', 'Gant synthétique pour allergiques au latex', 'Ansell', 'Gammex PF', 'Néoprène', true, '6, 6.5, 7, 7.5, 8, 8.5, 9', 'Blanc', 'Salle de stockage B2', ARRAY['chirurgie','sans-latex','néoprène'], 'published', true),
    (v_uid, 'Protexis PI', 'Gant polyisoprène stérile', 'Cardinal Health', 'Protexis PI', 'Polyisoprène', true, '5.5, 6, 6.5, 7, 7.5, 8, 8.5', 'Beige clair', 'Salle de stockage B2', ARRAY['chirurgie','sans-latex','polyisoprène'], 'published', true),
    (v_uid, 'Biogel Orthopedic', 'Gant renforcé pour chirurgie orthopédique', 'Mölnlycke', 'Biogel Orthopedic', 'Latex naturel', false, '6, 6.5, 7, 7.5, 8, 8.5, 9', 'Marron', 'Salle de stockage B2', ARRAY['orthopédie','renforcé','latex'], 'published', true);

  -- ===================== CASAQUES =====================
  INSERT INTO public.casaques (user_id, titre, description, categorie, taille_disponible, specialite, renforcee, localisation, tags, status, is_dev) VALUES
    (v_uid, 'Casaque standard SMMS', 'Casaque non renforcée pour actes courants', 'Standard', 'M, L, XL, XXL', 'Polyvalente', false, 'Armoire vestiaire bloc A', ARRAY['standard','non-renforcée'], 'published', true),
    (v_uid, 'Casaque renforcée Ortho', 'Casaque avec renfort bras et thorax pour chirurgie orthopédique', 'Renforcée', 'L, XL, XXL', 'Orthopédie', true, 'Armoire vestiaire bloc A', ARRAY['orthopédie','renforcée','imperméable'], 'published', true),
    (v_uid, 'Casaque haute protection', 'Casaque imperméable intégrale pour chirurgies hémorragiques', 'Haute protection', 'M, L, XL', 'Chirurgie vasculaire', true, 'Armoire vestiaire bloc B', ARRAY['vasculaire','haute-protection','imperméable'], 'published', true),
    (v_uid, 'Casaque confort légère', 'Casaque respirante pour actes de courte durée', 'Confort', 'S, M, L, XL', 'Polyvalente', false, 'Armoire vestiaire bloc A', ARRAY['confort','légère','courte-durée'], 'published', true);

  -- ===================== MATERIEL =====================
  INSERT INTO public.materiel (user_id, nom, description, reference, statut, localisation, priority, tags, is_dev) VALUES
    (v_uid, 'Bistouri électrique Valleylab FT10', 'Générateur électrochirurgical haute fréquence', 'FT10-FR-001', 'disponible', 'Salle 3 – Colonne chirurgicale', false, ARRAY['électrochirurgie','bistouri','coagulation'], true),
    (v_uid, 'Colonne vidéo Storz 4K', 'Tour de vidéo-endoscopie Karl Storz IMAGE1 S', 'STORZ-4K-002', 'disponible', 'Salle 2 – Rangement endoscopie', false, ARRAY['endoscopie','vidéo','colonne'], true),
    (v_uid, 'Moteur Stryker System 8', 'Moteur chirurgical orthopédique polyvalent', 'SYS8-003', 'disponible', 'Arsenal orthopédie – Étagère 2', true, ARRAY['orthopédie','moteur','perçage'], true),
    (v_uid, 'Arthroscope 30° 4mm', 'Optique arthroscopie genou / épaule', 'ARTH-30-004', 'disponible', 'Endoscopie – Tiroir 5', false, ARRAY['arthroscopie','optique','endoscopie'], true),
    (v_uid, 'Écarteur Weitlaner', 'Écarteur autostatique 16cm', 'WEIT-16-005', 'disponible', 'Arsenal général – Bac instruments', false, ARRAY['écarteur','autostatique','général'], true),
    (v_uid, 'Pince à os Liston', 'Pince coupante pour os – 27cm', 'LIST-27-006', 'disponible', 'Arsenal orthopédie – Étagère 1', false, ARRAY['orthopédie','pince','ostéotomie'], true),
    (v_uid, 'Garrot pneumatique Zimmer ATS 4000', 'Garrot pneumatique automatique bicanal', 'ATS4000-007', 'en_reparation', 'Maintenance biomédicale', true, ARRAY['garrot','pneumatique','orthopédie'], true),
    (v_uid, 'Lampe frontale LED Sunoptic', 'Source lumineuse personnelle chirurgien', 'SUN-LED-008', 'disponible', 'Vestiaire chirurgiens', false, ARRAY['éclairage','frontale','LED'], true),
    (v_uid, 'Aspiration Medela Dominant 50', 'Pompe d''aspiration chirurgicale mobile', 'MED50-009', 'disponible', 'Salle 1 – Côté anesthésie', false, ARRAY['aspiration','pompe','mobile'], true),
    (v_uid, 'Ancillaire PTG Zimmer Persona', 'Kit complet ancillaire prothèse totale genou', 'ZIM-PTG-010', 'disponible', 'Arsenal prothèse – Armoire 3', true, ARRAY['prothèse','genou','ancillaire','PTG'], true);

  -- ===================== TRANSMISSIONS =====================
  INSERT INTO public.transmissions (user_id, title, content, type, priority, status, tags, is_dev) VALUES
    (v_uid, 'Panne bistouri salle 3', '<p>Le bistouri Valleylab FT10 de la salle 3 présente des <strong>coupures intermittentes en mode coagulation</strong>. Biomédical prévenu, appareil de remplacement en salle 5.</p>', 'essentiel', true, 'open', ARRAY['panne','bistouri','salle-3'], true),
    (v_uid, 'Rappel : protocole double gantage', '<p>Rappel de la procédure de <strong>double gantage systématique</strong> pour toute chirurgie orthopédique prothétique. Utiliser Biogel Eclipse (vert dessous, beige dessus).</p>', 'essentiel', false, 'open', ARRAY['protocole','gants','orthopédie'], true),
    (v_uid, 'Nouveau moteur Stryker reçu', '<p>Le nouveau moteur System 8 a été réceptionné et vérifié. Il est rangé à l''arsenal orthopédie, étagère 2. <em>Merci de ne pas utiliser sans formation préalable.</em></p>', 'libre', false, 'open', ARRAY['moteur','stryker','réception'], true),
    (v_uid, 'Stock gants taille 7.5 bas', '<p>Le stock de gants <strong>Biogel Surgeons taille 7.5</strong> est critique (< 10 paires). Commande passée, livraison prévue jeudi.</p>', 'essentiel', true, 'open', ARRAY['stock','gants','commande'], true),
    (v_uid, 'Changement de salle PTH demain', '<p>La PTH prévue demain matin (Dr Martin) est <strong>déplacée en salle 2</strong> au lieu de la salle 4 (problème climatisation). Penser à transférer le matériel.</p>', 'essentiel', true, 'open', ARRAY['planning','PTH','salle'], true),
    (v_uid, 'Formation colonne Storz – rappel', '<p>Session de formation sur la nouvelle colonne Storz 4K : <strong>mercredi 14h, salle de réunion bloc</strong>. Inscription obligatoire auprès du cadre.</p>', 'libre', false, 'open', ARRAY['formation','storz','endoscopie'], true);

  -- ===================== ANATOMIE =====================
  INSERT INTO public.anatomie (user_id, titre, description, region, tags, is_dev) VALUES
    (v_uid, 'Genou – Vue antérieure', '<p>Anatomie de surface et repères osseux du genou en vue antérieure. Points clés : <strong>rotule, tubérosité tibiale antérieure, interligne articulaire</strong>.</p>', 'Membre inférieur', ARRAY['genou','ostéologie','repères'], true),
    (v_uid, 'Épaule – Coiffe des rotateurs', '<p>Les 4 muscles de la coiffe : <strong>supra-épineux, infra-épineux, petit rond, subscapulaire</strong>. Insertion sur le trochiter et trochin.</p>', 'Membre supérieur', ARRAY['épaule','coiffe','muscles'], true),
    (v_uid, 'Hanche – Voies d''abord', '<p>Principales voies d''abord de la hanche : <strong>antérieure (Hueter), antéro-latérale (Hardinge), postérieure (Moore)</strong>. Structures à risque pour chaque voie.</p>', 'Membre inférieur', ARRAY['hanche','voie-abord','chirurgie'], true),
    (v_uid, 'Rachis lombaire – Anatomie discale', '<p>Structure du disque intervertébral : <strong>nucleus pulposus, annulus fibrosus</strong>. Rapports avec les racines nerveuses L4-S1.</p>', 'Rachis', ARRAY['rachis','disque','lombaire'], true),
    (v_uid, 'Main – Tendons fléchisseurs', '<p>Zones de Verdan (I à V) des tendons fléchisseurs. <strong>Zone II (no man''s land)</strong> : FDS et FDP dans la gaine digitale.</p>', 'Membre supérieur', ARRAY['main','tendons','fléchisseurs'], true);

  -- ===================== PREFERENCES CHIRURGIEN =====================
  INSERT INTO public.preferences_chirurgien (chirurgien_id, titre, description, preferences, is_global, tags, is_dev) VALUES
    (v_uid, 'Préférences générales – Admin', 'Préférences par défaut du chirurgien administrateur',
     '{"position_patient": "Décubitus dorsal", "type_anesthesie": "AG", "garrot": true, "pression_garrot_mmhg": 300, "antibioprophylaxie": "Céfazoline 2g IV", "drapage": "Standard 4 champs", "fil_fermeture_peau": "Monocryl 3/0", "remarques": "Toujours vérifier la latéralité avec le patient éveillé"}'::jsonb,
     true, ARRAY['général','standard'], true),
    (v_uid, 'PTG – Prothèse totale genou', 'Préférences pour prothèse totale de genou',
     '{"implant": "Zimmer Persona", "ancillaire": "Persona CR/PS", "ciment": "Palacos R+G", "garrot": true, "pression_garrot_mmhg": 350, "position_patient": "Décubitus dorsal, jambe libre", "voie_abord": "Para-patellaire médiale", "drainage": "Redon aspiratif x1", "fil_capsule": "Vicryl 1", "fil_peau": "Agrafes", "remarques": "Contrôle scopique peropératoire si doute sur l''axe"}'::jsonb,
     false, ARRAY['PTG','genou','prothèse'], true),
    (v_uid, 'PTH – Prothèse totale hanche', 'Préférences pour prothèse totale de hanche par voie antérieure',
     '{"implant": "Zimmer Avenir Complete", "voie_abord": "Antérieure (Hueter)", "position_patient": "Décubitus dorsal sur table orthopédique", "garrot": false, "ciment": "Non cimentée", "drainage": "Aucun", "antibioprophylaxie": "Céfazoline 2g IV", "fil_fascia": "Vicryl 1", "fil_peau": "Monocryl 3/0 intradermique", "remarques": "Amplificateur de brillance obligatoire, vérifier longueur et offset"}'::jsonb,
     false, ARRAY['PTH','hanche','prothèse','voie-antérieure'], true),
    (v_uid, 'Arthroscopie genou', 'Préférences pour arthroscopie du genou',
     '{"optique": "30° 4mm", "position_patient": "Décubitus dorsal, jambe pendante", "garrot": true, "pression_garrot_mmhg": 280, "pression_arthropompe_mmhg": 50, "voies_abord": "Antéro-latérale + antéro-médiale", "instruments": ["palpateur", "panier", "shaver 4.5mm"], "remarques": "Garrot non gonflé sauf si besoin (saignement)"}'::jsonb,
     false, ARRAY['arthroscopie','genou','endoscopie'], true);

  RAISE NOTICE 'Seed local terminé : gants=5, casaques=4, materiel=10, transmissions=6, anatomie=5, preferences=4';
END $$;
