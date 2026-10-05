-- ============================================================
-- MIGRATION 019 — ENRICHISSEMENT THESAURUS (depuis CSV V4 INTEGRAL)
-- BDB · Supabase cloud
-- Réf : Croisement THESAURUS_V4_INTEGRAL.csv ↔ seed 018
-- 419/420 protocoles enrichis — zéro token IA
-- ============================================================
-- INTERDIT-SQL-01 : fichier .sql AVANT exécution

BEGIN;

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal carpien',
  definition_expert = 'Technique mini-invasive de neurolyse du nerf médian au poignet. Section du ligament annulaire antérieur du carpe (rétinaculum des fléchisseurs) de l''intérieur, sous contrôle endoscopique, via voie d''abord unique (Agee) ou double (Chow). Préserve le talon de la main, récupération fonctionnelle plus rapide qu''à ciel ouvert.',
  synonymes_recherche = 'Canal Carpien Endo | ECTR (Endoscopic Carpal Tunnel Release) | Endoscopie | Vidéo | Smartrelease | Agee | Chow | Mini-invasif | Canal optique | Section ligament annulaire | Retinaculum | Uniportale | Biportale | Main | Garrot | Colonne vidéo | Optique | Lame rétrograde',
  codes_ccam = 'AHPC001',
  libelles_sources_lies = 'Libération du nerf médian au canal carpien, par vidéochirurgie',
  proposition_nouvel_acte_label = 'Libération du nerf médian au canal carpien par endoscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0001';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hernie discale lombaire / Sciatique',
  definition_expert = 'Décompression radiculaire par voie postérieure. Installation sur cadre (ventre libre) ou en genu-pectoral pour ouvrir les espaces inter-laminaires. Abord du niveau pathologique (repérage radio), dissection des masses musculaires, ouverture du canal rachidien (fenestration du ligament jaune ou laminotomie). Identification et protection de la racine nerveuse, puis exérèse du fragment discal herniaire. Hémostase veineuse épidurale délicate (bipolaire fine, hémostatiques locaux).',
  synonymes_recherche = 'HDL (Hernie Discale Lombaire) | Hernie Discale | Discectomie | Microdiscectomie | Rachis Lombaire | Sciatique | Cruralgie | Conflit disco-radiculaire | Ligament jaune | Flavum | Ecarteur Caspar | Ecarteur Williams | Ecarteur à racine | Dissecteur Penfield | Rongeur à disque | Pince Kerrison | Bipolaire fine | Microscope | Loupes | Genu Pectoral | Cadre de Wilson | Hémostase | Spongostan | Floseal',
  codes_ccam = 'LFFA003',
  libelles_sources_lies = 'Exérèse d''une hernie discale de la colonne vertébrale lombaire, par abord postérieur',
  proposition_nouvel_acte_label = 'Exérèse de hernie discale lombaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0002';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Gonarthrose (Arthrose du genou)',
  definition_expert = 'Arthroplastie de resurfaçage tri-compartimentaire (fémoral, tibial, patellaire) pour gonarthrose évoluée. Intervention nécessitant coupes osseuses géométriques précises (guides de coupe mécaniques, navigation ou assistance robotique) pour restaurer l''axe mécanique du membre inférieur (HKA) et équilibrer les espaces ligamentaires en flexion/extension. Implants fémoraux et tibiaux (cimentés ou press-fit), insert polyéthylène modulaire. Choix du design selon état ligamentaire : CR (conservation LCP), PS (sacrifice LCP + came), UC ou charnière si instabilité majeure.',
  synonymes_recherche = 'PTG (Prothèse Totale Genou) | Prothèse Totale Genou | Tricompartimentale | Gonarthrose | Arthrose Genou | Implant | Ciment | Sans ciment | CR (Cruciate Retaining) | PS (Postéro-Stabilisée) | UC (Ultra-Congruente) | Plateau mobile | Plateau fixe | Navigation | Robot | Ancillaire | Coupe osseuse | Scie oscillante | Moteur | Garrot | PFC | Attune | Triathlon | NexGen | Zimmer | Depuy | Smith Nephew | Stryker | Mako',
  codes_ccam = 'NFKA007',
  libelles_sources_lies = 'Remplacement de l''articulation du genou par prothèse tricompartimentaire',
  proposition_nouvel_acte_label = 'Arthroplastie totale du genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0003';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lésion méniscale / Chondropathie',
  definition_expert = 'Intervention endoscopique constituant le "socle technique" de la chirurgie du genou. Consiste à introduire une optique (30°) et des instruments via deux voies d''abord antérieures sous irrigation continue (arthropompe). Le geste de base (NFJC001) est le nettoyage/lavage articulaire (exérèse des tissus inflammatoires, régularisation cartilagineuse, ablation corps étrangers). Nécessite : Colonne vidéo HD, Shaver avec lames agressives/incisives, Vaporisateur RF et instrumentation manuelle (crochet palpeur).',
  synonymes_recherche = 'Arthro Genou | Arthroscopie | Lavage articulaire | Débridement | Nettoyage | Socle Arthro | Colonne Vidéo | Shaver | Couteau motorisé | Vaporisateur | Radiofréquence | Optique 30° | Arthropompe | Gestion pression | Trocart | Canule | Crochet palpeur | Pince Basket | Pince à préhension | Corps étranger | Souris articulaire | Plica synoviale | Genou | Ortho réglée',
  codes_ccam = 'NFJC001',
  libelles_sources_lies = 'Nettoyage de l''articulation du genou, par arthroscopie',
  proposition_nouvel_acte_label = 'Méniscectomie ou exploration du genou par arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0004';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Coxarthrose (Arthrose de hanche)',
  definition_expert = 'Remplacement de l''articulation coxofémorale endommagée (coxarthrose, nécrose) par une prothèse totale. Comporte deux pièces principales : la pièce acétabulaire (cotyle) fixée dans le bassin et la tige fémorale insérée dans le fémur, articulées par une tête (bille) et un insert. Le choix du couple de frottement (Céramique/Céramique, Métal/Polyéthylène) et de la voie d''abord (Antérieure de Hueter/Postérieure de Moore) conditionne l''installation du patient et l''ancillaire chirurgical nécessaire. Nécessite un moteur électrique, des râpes fémorales progressives et un impacteur pour la cupule.',
  synonymes_recherche = 'PTH | Prothèse Totale Hanche | Coxarthrose | Arthrose Hanche | Totale | Implant | Cimentée | Sans ciment | Couple de frottement | Céramique | Polyéthylène | Double mobilité | Cotyle | Insert | Tige fémorale | Tête fémorale | Voie Postérieure | Voie Antérieure | Hueter | Moore | Hardinge | Moteur | Râpes | Impacteur | Table orthopédique | Décubitus latéral',
  codes_ccam = 'NEKA020',
  libelles_sources_lies = 'Remplacement de l''articulation coxofémorale par prothèse totale',
  proposition_nouvel_acte_label = 'Arthroplastie totale de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0005';

UPDATE public.thesaurus_protocoles SET
  pathologie = '[CHANTIER FUTUR - Ligne à éclater en actes spécifiques ou à exclure du thésaurus]',
  definition_expert = '[CHANTIER FUTUR - Ligne à éclater en actes spécifiques ou à exclure du thésaurus]',
  synonymes_recherche = 'Bobologie | Petite chirurgie | Diverse | N/A',
  libelles_sources_lies = '[CHANTIER FUTUR - Ligne à éclater en actes spécifiques ou à exclure du thésaurus]',
  proposition_nouvel_acte_label = 'Acte mineur de bobologie',
  updated_at = now()
WHERE id_protocole = 'ACT-0006';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal carpien',
  definition_expert = 'Technique de référence (Gold Standard pour récidives ou anatomies complexes). Incision cutanée palmaire longitudinale (3-4 cm). Dissection minutieuse, exposition puis section complète et à vue directe du ligament annulaire antérieur du carpe (Rétinaculum) pour libérer le nerf médian. Vérification des loges et neurolyse si besoin. Instrumentation fine de main.',
  synonymes_recherche = 'Canal Carpien Open | Ciel Ouvert | Abord Direct | Incision Palmaire | Neurolyse | Nerf Médian | Ligament Annulaire | Retinaculum des fléchisseurs | Paresthésies | EMG (Électromyogramme) | Main de Plomb | Ecarteur Weitlaner | Ecarteur Alm | Bistouri 15 | Ciseaux Tenotomie | Pince Adson | Anesthésie Locale | WALANT',
  codes_ccam = 'AHPA009',
  libelles_sources_lies = 'Libération du nerf médian au canal carpien, par abord direct',
  proposition_nouvel_acte_label = 'Libération du nerf médian au canal carpien par abord direct',
  updated_at = now()
WHERE id_protocole = 'ACT-0007';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Sténose du canal lombaire / Claudication neurogène',
  definition_expert = 'Intervention de libération pour sténose du canal rachidien lombaire (souvent arthrose étagée). L''objectif est de "recalibrer" le canal en réséquant les structures osseuses (lames, massifs articulaires) et ligamentaires (ligament jaune hypertrophié) qui compriment les racines nerveuses et la queue de cheval. Nécessite moteur haute vitesse (Midas Rex) et pinces Kerrison. Risque de brèche durale.',
  synonymes_recherche = 'CLE (Canal Lombaire Étroit) | Canal Lombaire Etroit | Sténose canalaire | Recalibrage | Laminectomie | Arthrectomie | Libération médullaire | Queue de cheval | Claudication neurogène | Midas Rex | Moteur Haute Vitesse | Fraise diamantée | Kerrison | Laminectome | Ecarteur rachis | Spongostan | Hémostase | Cire à os | Tachosil',
  codes_ccam = 'LFFA001',
  libelles_sources_lies = 'Laminectomie lombaire ou lombo-sacrée, par abord postérieur',
  proposition_nouvel_acte_label = 'Recalibrage du canal lombaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0008';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture de la coiffe des rotateurs',
  definition_expert = 'Réparation tendineuse trans-osseuse sous arthroscopie. Consiste à réinsérer les tendons rompus de la coiffe des rotateurs sur la tête humérale à l''aide d''ancres chirurgicales (vissées ou impactées) chargées de fils haute résistance. Installation spécifique (Beach Chair ou Décubitus Latéral), gestion des fluides (arthropompe), préparation de l''empreinte osseuse (shaver/fraise) et instrumentation de passage de fils complexe (pinces Scorpion, Lasso).',
  synonymes_recherche = 'Coiffe des rotateurs | Réparation coiffe | Suture coiffe | Supra-épineux | Infra-épineux | Subscapulaire | Ancres | Vissées | Impactées | Peek | Biocomposite | Fils haute résistance | Fiberwire | Orthocord | Suture Bridge | Double rang | Simple rang | Lasso | Pince Scorpion | Pass''port | Canule | Pompe | Beach Chair | Décubitus Latéral | Arthro Epaule | Speed-Fix',
  codes_ccam = 'MECA001',
  libelles_sources_lies = 'Réinsertion ou suture d''un tendon de la coiffe des rotateurs de l''épaule, par arthroscopie',
  proposition_nouvel_acte_label = 'Réparation de la coiffe des rotateurs par arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0009';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hallux Valgus (Oignon)',
  definition_expert = 'Intervention complète de correction de l''hallux valgus associant plusieurs gestes osseux et tissulaires. Le code regroupe : ostéotomie du 1er métatarsien (Scarf) pour corriger le métatarsus varus, ostéotomie de la phalange proximale (Akin) pour corriger le valgus phalangien, libération des tissus mous (sésamoïdes), et si nécessaire ostéotomie des métatarsiens latéraux (Weil). Nécessite ancillaire complet d''avant-pied et scopie.',
  synonymes_recherche = 'HV | Hallux Valgus | Scarf | Akin | Weil | Ostéotomie combinée | M1 | P1 | Avant-pied | Oignon | Vis de compression | Vis canulée | Agrafe | Scie oscillante | Moteur | Pied | Chirurgie percutanée | MICA (Minimally Invasive Chevron Akin)',
  codes_ccam = 'NDPA002',
  libelles_sources_lies = 'Ostéotomie du métatarsien et de la phalange proximale du premier rayon du pied, avec libération de l''articulation métatarsophalangienne',
  proposition_nouvel_acte_label = 'Correction d''hallux valgus (ostéotomie combinée)',
  updated_at = now()
WHERE id_protocole = 'ACT-0010';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Doigt à ressaut / Ténosynovite sténosante',
  definition_expert = 'Intervention fréquente de chirurgie de la main. Consiste à ouvrir longitudinalement la poulie A1 (au niveau de la tête métacarpienne) qui comprime le tendon fléchisseur et cause le blocage douloureux du doigt. Geste court mais minutieux nécessitant de protéger les nerfs collatéraux digitaux et l''artère digitale. Matériel : Instrumentation de main de base (bistouri lame 15, petits écarteurs autostatiques, ciseaux à ténotomie). Ambulatoire sous anesthésie locale.',
  synonymes_recherche = 'Doigt à ressaut | Ressaut | Trigger finger | Poulie A1 | Blocage | Fléchisseur | Tenotomie | Libération | Main | Palmaire | Bistouri 15 | Ciseaux fins | Écarteur de peau | Alm | Metzenbaum | Nerfs collatéraux',
  codes_ccam = 'MJPA002',
  libelles_sources_lies = 'Libération des tendons des muscles fléchisseurs des doigts sur un rayon de la main, par abord direct',
  proposition_nouvel_acte_label = 'Libération d''un tendon fléchisseur au doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0011';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie cutanée traumatique',
  definition_expert = 'Acte de petite chirurgie d''urgence réalisé sous anesthésie locale. Consiste au parage (nettoyage, avivement des berges) et à la fermeture cutanée d''une plaie superficielle n''atteignant pas les structures nobles (nerfs, tendons, artères). Set de suture de base : porte-aiguille, pince à dissection, ciseaux Mayo. Différent de l''Exploration de plaie.',
  synonymes_recherche = 'Suture | Plaie | Urgence | Bobologie | Peau | Cutanée | Point de suture | Fil | Monocryl | Ethilon | Vicryl Rapide | Anesthésie Locale | Xylocaïne | Set de suture | Porte-aiguille | Adson | Mayo | Bistouri',
  codes_ccam = 'QZJA002',
  libelles_sources_lies = 'Parage et/ou suture de plaie superficielle de la peau',
  proposition_nouvel_acte_label = 'Suture de plaie cutanée',
  updated_at = now()
WHERE id_protocole = 'ACT-0012';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Omarthrose (Arthrose épaule)',
  definition_expert = 'Remplacement prothétique de l''articulation de l''épaule (glène et tête humérale). Deux grands types selon l''état de la coiffe : PTE Anatomique (si coiffe saine, reproduit l''anatomie) et PTE Inversée (si coiffe rompue, la sphère est fixée sur la glène pour médialiser le centre de rotation et activer le deltoïde). Installation en position demi-assise (Beach Chair), ancillaires complexes.',
  synonymes_recherche = 'PTE (Prothèse Totale Épaule) | Prothèse Épaule | Totale | Anatomique | Inversée | Reverse | Omarthrose | Coiffe rompue | CTA (Cuff Tear Arthropathy) | Tête humérale | Glène | Embase | Métaglène | Glénosphère | Polyéthylène | Ciment | Sans ciment | Voie delto-pectorale | Voie supéro-externe | Moteur | Scie | Tornier | Wright | Zimmer | Depuy',
  codes_ccam = 'MEKA008',
  libelles_sources_lies = 'Remplacement de l''articulation scapulohumérale par prothèse totale',
  proposition_nouvel_acte_label = 'Arthroplastie totale de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0013';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du Ligament Croisé Antérieur (LCA)',
  definition_expert = 'Chirurgie de stabilisation du genou par remplacement du LCA rompu. Le greffon est prélevé sur le patient (Ischio-Jambiers pour le DIDT, Tendon Rotulien pour le KJ, ou Quadricipital). Temps arthroscopique pour préparation des tunnels osseux (fémoral et tibial), passage et fixation de la greffe. Fixation par vis d''interférence, boutons corticaux (Endobutton) ou agrafes. Nécessite colonne vidéo, moteur, et ancillaire spécifique de ligamentoplastie.',
  synonymes_recherche = 'LCA (Ligament Croisé Antérieur) | Ligament Croisé Antérieur | Ligamentoplastie | Croisé Antérieur | Entorse grave | DIDT (Droit Interne Demi-Tendineux) | KJ (Kenneth-Jones) | DT4 | TLS | Mac Intosh | Lemaire | Arthro | Bouton | Endobutton | Vis d''interférence | Agrafe | Tunnel fémoral | Tunnel tibial | Stripper | Mèche | Broche à oeil | Genou | Sport | Pivot',
  codes_ccam = 'NFMC003',
  libelles_sources_lies = 'Reconstruction du ligament croisé antérieur du genou par autogreffe, par arthroscopie',
  proposition_nouvel_acte_label = 'Ligamentoplastie du croisé antérieur (LCA)',
  updated_at = now()
WHERE id_protocole = 'ACT-0014';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Coxarthrose (Arthrose de hanche)',
  definition_expert = 'Remplacement prothétique de la hanche réalisé par une voie d''abord antérieure (inter-musculaire) passant entre le Tenseur du Fascia Lata et le Sartorius/Droit fémoral. Cette technique préserve les muscles (pas de section tendineuse) et permet une récupération plus rapide avec moins de risque de luxation postopératoire. L''installation est spécifique (décubitus dorsal strict, souvent sur table orthopédique avec extension de jambe ou table ordinaire avec jambe mobile). Nécessite des écarteurs coudés longs spécifiques et des râpes fémorales adaptées avec manches déportés.',
  synonymes_recherche = 'PTH | Prothèse Totale Hanche | Voie Antérieure | Hueter | AMIS | Anterior Minimally Invasive Surgery | Tenseur du Fascia Lata | Sartorius | Couturier | Extension de table | Table orthopédique | Décubitus dorsal | Sans section musculaire | Récupération rapide | RRAC | Cotyle | Tige | Céramique | Double mobilité | Moteur | Écarteurs spécifiques | Charnley | Hohmann',
  codes_ccam = 'NEKA020',
  libelles_sources_lies = 'Remplacement de l''articulation coxofémorale par prothèse totale',
  proposition_nouvel_acte_label = 'PTH par voie antérieure',
  updated_at = now()
WHERE id_protocole = 'ACT-0015';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation osseuse / Gêne matériel',
  definition_expert = 'Intervention fréquente consistant à retirer le matériel métallique (inox ou titane) posé lors d''une précédente chirurgie de fracture (ostéosynthèse). Nécessite d''identifier le type de matériel (vis, plaque, clou, broche) pour prévoir les tournevis adaptés (Hexagonal, Torx, Cruciforme). Attention aux difficultés d''extraction fréquentes (vis bloquées par l''os, têtes de vis abîmées) nécessitant des kits d''extraction spécialisés (extracteurs de vis, mèches à métaux).',
  synonymes_recherche = 'AMO | Ablation Matériel Ostéosynthèse | Retrait vis | Ablation broche | Ablation plaque | Synthèse | Membre | Plaque | Vis | Clou | Ancillaire d''ablation | Tournevis | Boite d''ablation | Tête de vis foirée | Extracteur | Mèche à métaux | Burin | Ostéotome',
  codes_ccam = 'PAGA011',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse des membres sur un site, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse',
  updated_at = now()
WHERE id_protocole = 'ACT-0016';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit sous-acromial / Bursite',
  definition_expert = 'Intervention endoscopique visant à traiter un conflit sous-acromial (frottement des tendons de la coiffe contre l''acromion). Le geste principal est l''acromioplastie : résection du "bec" osseux de l''acromion à la fraise motorisée et nettoyage de la bourse sous-acromiale inflammatoire (bursectomie). Ne comporte pas de réparation tendineuse. Nécessite colonne vidéo, pompe et moteur haute vitesse.',
  synonymes_recherche = 'Arthro Epaule | Acromioplastie | Décompression sous-acromiale | Conflit sous-acromial | Bec acromial | Ligament AC | Bursite | Bursectomie | Nettoyage épaule | Shaver | Vaporisateur | Radiofréquence | Fraise à os | Optique 30° | Pompe | Canule | Beach Chair | Décubitus Latéral | Trocart | Voie postérieure | Voie latérale',
  codes_ccam = 'MEMC003',
  libelles_sources_lies = 'Acromioplastie sans prothèse, par arthroscopie',
  proposition_nouvel_acte_label = 'Exploration de l''épaule par arthroscopie (Acromioplastie)',
  updated_at = now()
WHERE id_protocole = 'ACT-0017';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit sous-acromial avec rupture de coiffe',
  definition_expert = 'Intervention combinée traitant à la fois la cause (acromioplastie : rabotage du bec osseux agressif) et la conséquence (suture du tendon rompu de la coiffe). Le code de suture MJEC001 est le code principal qui englobe le geste, l''acromioplastie étant un temps opératoire préparatoire de l''exposition et de la décompression. Nécessite ancres chirurgicales, shaver et radiofréquence.',
  synonymes_recherche = 'Suture Coiffe | Acromioplastie | Réparation | Coiffe des rotateurs | Supra-épineux | Ancres | Vissées | Impactées | Arthro Épaule | Beach Chair | Décubitus latéral | Shaver | Vaporisateur | Pompe',
  codes_ccam = 'MJEC001',
  libelles_sources_lies = 'Réinsertion ou suture d''un tendon de la coiffe des rotateurs de l''épaule, par arthroscopie',
  proposition_nouvel_acte_label = 'Réparation de la coiffe avec acromioplastie (Arthro)',
  updated_at = now()
WHERE id_protocole = 'ACT-0018';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie traumatique profonde / Suspecte',
  definition_expert = 'Intervention d''urgence pour toute plaie de main dépassant le plan cutané. L''objectif est l''exploration systématique des structures nobles (nerfs collatéraux, tendons fléchisseurs/extenseurs, artères) sous garrot et souvent sous loupes/microscope. Comprend le parage et la réparation immédiate si possible. Différent de la simple suture superficielle.',
  synonymes_recherche = 'Exploration | Plaie main | Urgence main | Parage | Nerf collatéral | Tendon | Section | Coupure | Bistouri | Microscope | Loupes | Main | Doigt | Suture nerveuse | Suture tendineuse | SOS Main | Garrot',
  codes_ccam = 'QCJA001',
  libelles_sources_lies = 'Exploration de plaie de la main',
  proposition_nouvel_acte_label = 'Exploration chirurgicale d''une plaie de main',
  updated_at = now()
WHERE id_protocole = 'ACT-0019';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste (Synovial, Sébacé ou Mucoïde)',
  definition_expert = 'Ablation chirurgicale d''une tuméfaction kystique bénigne développée aux dépens de la capsule articulaire (poignet) ou de la gaine tendineuse. L''exérèse doit emporter le collet du kyste jusqu''à l''articulation pour limiter les récidives. Dissection minutieuse (artère radiale, branches nerveuses sensitives) sous garrot.',
  synonymes_recherche = 'Kyste synovial | Kyste poignet | Kyste doigt | Mucoïde | Gaine | Arthrectomie | Main | Poignet | Dorsal | Palmaire | Loupes | Garrot | Bistouri | Récidive',
  codes_ccam = 'MHFA002',
  libelles_sources_lies = 'Exérèse de kyste synovial ou mucoïde d''une articulation de la main',
  proposition_nouvel_acte_label = 'Exérèse de lésion des tissus mous',
  updated_at = now()
WHERE id_protocole = 'ACT-0020';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture pertrochantérienne (Hanche)',
  definition_expert = 'Ostéosynthèse par clou centromédullaire court ou long pour fractures du massif trochantérien (pertrochantériennes, intertrochantériennes, sous-trochantériennes). Système associant clou fémoral et vis céphalique dynamique (ou lame hélicoïdale) permettant compression du foyer et glissement contrôlé. Installation impérative sur table orthopédique (traction) avec amplificateur de brillance (face + profil chirurgical). Alternative à la vis-plaque dynamique (DHS) pour fractures instables.',
  synonymes_recherche = 'Clou Gamma | Gamma 3 | DHS (Dynamic Hip Screw) | Vis-Plaque Dynamique | TFN (Trochanteric Fixation Nail) | PFN (Proximal Femoral Nail) | PFNA | Pertrochantérienne | Massif trochantérien | Fémur | Hanche | Traumato | Urgence | Table orthopédique | Amplificateur de brillance | Vis céphalique | Verrouillage distal | Stryker | Synthes | Zimmer',
  codes_ccam = 'NBCA006',
  libelles_sources_lies = 'Ostéosynthèse de fracture infratrochantérienne ou trochantérodiaphysaire du fémur par clou centromédullaire',
  proposition_nouvel_acte_label = 'Ostéosynthèse par clou centromédullaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0021';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du col fémoral (Sujet âgé)',
  definition_expert = 'Traitement chirurgical de référence pour les fractures déplacées du col fémoral (Garden III/IV) chez le sujet âgé. Consiste à remplacer uniquement la tête et le col du fémur (hémi-arthroplastie) par une prothèse composée d''une tige fémorale et d''une tête articulée dans une "cupule mobile" (système bipolaire). Contrairement à la PTH, le cotyle du patient est préservé. L''objectif est la reprise d''appui immédiate avec une stabilité accrue grâce à la double articulation.',
  synonymes_recherche = 'Prothèse intermédiaire de hanche | PIH | Hémiarthroplastie | Bipolaire | Prothèse bipolaire | Cupule mobile | Fracture du col | Garden 3 | Garden 4 | Cervico-céphalique | Traumato | Sujet âgé | Cimentée | Sans ciment | Fémur | Hanche | Urgence | Austin Moore | Thompson | PTH | Prothèse Totale Hanche',
  codes_ccam = 'NEKA011',
  libelles_sources_lies = 'Remplacement de l''articulation coxofémorale par prothèse fémorale cervicocéphalique et cupule mobile',
  proposition_nouvel_acte_label = 'Arthroplastie intermédiaire de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0022';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture malléolaire',
  definition_expert = 'Réduction et fixation chirurgicale des fractures de la cheville (péroné/fibula et tibia). Implique souvent la pose d''une plaque vissée sur la malléole externe et d''un vissage (ou haubanage) de la malléole interne. Peut nécessiter une vis de syndesmose si l''articulation est instable. Matériel : Boite "Petits Fragments".',
  synonymes_recherche = 'Fracture cheville | Bimalléolaire | Malléole externe | Malléole interne | Plaque tiers de tube | Vis corticale | Vis spongieuse | Haubanage | Syndesmose | Vis de syndesmose | Cheville | Traumato | Urgence | Synthes | Stryker | Ancillaire petits fragments',
  codes_ccam = 'NCCA016',
  libelles_sources_lies = 'Ostéosynthèse de fracture bimalléolaire simple, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de cheville (bi-malléolaire)',
  updated_at = now()
WHERE id_protocole = 'ACT-0023';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du poignet (Pouteau-Colles)',
  definition_expert = 'Technique d''ostéosynthèse percutanée (sans ouvrir le foyer de fracture) pour les fractures du poignet (Pouteau-Colles). Consiste à réduire la fracture sous contrôle radioscopique (amplificateur de brillance) et à la stabiliser par des broches (techniques de Kapandji ou Py). Nécessite un moteur, des broches (Kirschner) et une pince coupante.',
  synonymes_recherche = 'Kapandji | Embrochage | Pouteau-Colles | Fracture du poignet | Radius | Foyer fermé | Broches | K-Wires | Moteur | Amplificateur de brillance | Scopie | Urgence | Traumato | Main | Ancillaire main | Broche 18/10 | Broche 20/10',
  codes_ccam = 'MCCB004',
  libelles_sources_lies = 'Ostéosynthèse de fracture ou de décollement épiphysaire de l''extrémité distale d''un os de l''avant-bras par broche, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de l''extrémité distale du radius',
  updated_at = now()
WHERE id_protocole = 'ACT-0024';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation fracture poignet',
  definition_expert = 'Retrait des broches de Kapandji après consolidation d''une fracture du poignet (délai classique 4-6 semaines). Geste simple réalisé en ambulatoire sous anesthésie locale. Les broches percutanées sont saisies à la pince et retirées par traction douce. Si enfouies sous la peau, nécessite une petite incision. Pansement simple, cicatrisation rapide.',
  synonymes_recherche = 'Kapandji | Poignet | Radius | Arrache-broche | Broches | K-wires | Kirschner | Pouteau-Colles',
  codes_ccam = 'PAGA011',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse des membres sur un site, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse (broches)',
  updated_at = now()
WHERE id_protocole = 'ACT-0025';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Maladie de Dupuytren (Rétraction aponévrose)',
  definition_expert = 'Traitement chirurgical de la rétraction de l''aponévrose palmaire (Maladie de Dupuytren) entraînant une flexion irréductible des doigts. L''intervention (Aponévrectomie) consiste à exciser les tissus fibreux pathologiques (brides et nodules) tout en disséquant minutieusement les nerfs collatéraux et les artères digitales souvent englobés. Nécessite parfois des plasties cutanées (Z-plastie) pour refermer.',
  synonymes_recherche = 'Dupuytren | Rétraction | Main | Doigt | Aponévrectomie | Fasciectomie | Bride | Nodule | Flessum | Extension | Z-plastie | Lambeau | Nerf collatéral | Microscope | Loupes | Main de plomb | Vikings',
  codes_ccam = 'MJFA006',
  libelles_sources_lies = 'Fasciectomie palmaire pour maladie de Dupuytren',
  proposition_nouvel_acte_label = 'Aponévrotomie ou aponévrectomie palmaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0026';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit sous-acromial',
  definition_expert = 'Geste isolé de décompression de l''espace sous-acromial. Indiqué dans les conflits douloureux où l''acromion frotte sur la coiffe des rotateurs (sans rupture transfixiante). Consiste à raboter la face inférieure de l''acromion (fraise motorisée haute vitesse) et à nettoyer la bourse séreuse inflammatoire (bursectomie au shaver) sous contrôle arthroscopique. Nécessite colonne vidéo, pompe à arthroscopie, shaver et fraise motorisée.',
  synonymes_recherche = 'Acromioplastie | Décompression | Conflit sous-acromial | Bec acromial | Arthro | Épaule | Nettoyage | Bursectomie | Shaver | Fraise | Vaporisateur | Radiofréquence | Coiffe | Beach Chair | Pompe',
  codes_ccam = 'MEMC003',
  libelles_sources_lies = 'Acromioplastie sans prothèse, par arthroscopie',
  proposition_nouvel_acte_label = 'Acromioplastie sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0027';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation osseuse',
  definition_expert = 'Retrait de broches percutanées ou enfouies (poignet, main, orteil, cheville) après consolidation osseuse. Nécessite un arrache-broche ou une pince coupante si la broche doit être sectionnée. Geste rapide mais nécessite de localiser précisément les broches par radiographie préopératoire pour planifier les incisions. Ambulatoire sous anesthésie locale ou locorégionale.',
  synonymes_recherche = 'AMO | Ablation Matériel Ostéosynthèse | Broches | K-Wires | Kirschner | Arrache-broche | Extraction | Pince coupante',
  codes_ccam = 'PAGA011',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse des membres sur un site, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse (broches)',
  updated_at = now()
WHERE id_protocole = 'ACT-0028';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ongle incarné',
  definition_expert = 'Traitement chirurgical de l''ongle incarné récidivant ou infecté. Consiste à retirer la partie latérale de l''ongle qui s''incarne (exérèse de la tablette) et à détruire la racine correspondante (matricectomie) soit chirurgicalement, soit chimiquement (phénol) pour empêcher la repousse de l''éperon. Anesthésie locale (bloc d''orteil).',
  synonymes_recherche = 'Ongle incarné | Matricectomie | Phénolisation | Pied | Orteil | Gros orteil | Hallux | Bourgeon | Botryomycome | Infection | Panaris | Garrot orteil | Bistouri | Curette | Acide phénique',
  codes_ccam = 'QZFA020',
  libelles_sources_lies = 'Exérèse partielle d''ongle avec matricectomie',
  proposition_nouvel_acte_label = 'Exérèse de l''ongle ou phénolisation',
  updated_at = now()
WHERE id_protocole = 'ACT-0029';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du poignet déplacée',
  definition_expert = 'Ostéosynthèse "à ciel ouvert" d''une fracture dépalcée du poignet. L''abord est le plus souvent antérieur (Henry). La fracture est réduite anatomiquement et fixée par une plaque anatomique verrouillée (vis se vissant dans la plaque pour une stabilité optimale, même sur os porotique). Permet une rééducation précoce sans plâtre.',
  synonymes_recherche = 'Pouteau-Colles | Goyrand-Smith | Fracture Poignet | Radius Distal | Plaque | Plaque antérieure | Plaque verrouillée | Vis | Ancillaire main | Moteur | Scopie | Abord d''Henry | Foyer ouvert | Réduction',
  codes_ccam = 'MCCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité distale d''un os de l''avant-bras, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du radius distal (Plaque)',
  updated_at = now()
WHERE id_protocole = 'ACT-0030';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste synovial',
  definition_expert = 'Ablation d''une hernie de la capsule articulaire (kyste) remplie de liquide synovial gélatineux. Très fréquent au poignet (face dorsale ou palmaire). L''intervention nécessite de suivre le pédicule du kyste jusqu''à son origine articulaire et de l''exciser pour éviter la récidive. Attention aux branches nerveuses sensitives.',
  synonymes_recherche = 'Kyste | Kyste arthro-synovial | Poignet | Dos du poignet | Gouttière du pouls | Doigt | Poulie | Tuméfaction | Boule | Main | Exérèse | Loupes | Garrot | Récidive | Ganglion',
  codes_ccam = 'MHFA002',
  libelles_sources_lies = 'Exérèse de kyste synovial ou mucoïde d''une articulation de la main',
  proposition_nouvel_acte_label = 'Exérèse de kyste synovial (Poignet)',
  updated_at = now()
WHERE id_protocole = 'ACT-0031';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du radius',
  definition_expert = 'Ostéosynthèse d''une fracture située au milieu de l''os (diaphyse radiale), souvent chez l''adulte jeune (trauma haute énergie). Nécessite un abord chirurgical large, une réduction parfaite et une fixation solide par plaque vissée (souvent 3.5mm) pour restaurer la courbure du radius (pronosupination). Différent de la fracture du poignet (extrémité distale).',
  synonymes_recherche = 'Fracture Radius | Diaphyse | Avant-bras | Plaque | Plaque DCP | Plaque LCP | Vis corticale | Abord antérieur | Abord postérieur | Thompson | Henry | Synthes | Stryker | Traumato',
  codes_ccam = 'MCCA003',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse d''un os de l''avant-bras, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de la diaphyse radiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0032';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhizarthrose (Arthrose du pouce)',
  definition_expert = 'Remplacement prothétique de l''articulation trapézo-métacarpienne usée par rhizarthrose. Prothèse modulaire type "mini-hanche" : tige dans le premier métacarpien, cupule dans le trapèze (conservé), tête sphérique intermédiaire. Avantage : conservation de la longueur du pouce et force de pince. Alternative à la trapézectomie.',
  synonymes_recherche = 'PTM (Prothèse Trapézo-Métacarpienne) | Prothèse Trapézo-Métacarpienne | Prothèse Pouce | Rhizarthrose | Trapèze | Métacarpe | Maïa | Touch | Moovis | Ivory | Cupule | Tige | Col | Tête | Moteur | Scie | Ciment | Sans ciment | Main',
  codes_ccam = 'MHMA005',
  libelles_sources_lies = 'Arthroplastie trapézométacarpienne par prothèse',
  proposition_nouvel_acte_label = 'Arthroplastie trapézo-métacarpienne (Prothèse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0033';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité d''épaule / Luxation récidivante',
  definition_expert = 'Intervention de stabilisation de l''épaule pour instabilité antérieure chronique (luxations à répétition) avec défect osseux. Consiste à prélever l''apophyse coracoïde et à la visser sur le bord antérieur de la glène. Cette "butée" osseuse assure un triple effet : agrandit la surface articulaire, crée un effet sangle musculaire (conjoint tendon), et renforce la capsule.',
  synonymes_recherche = 'Latarjet | Butée | Instabilité | Luxation récidivante | Epaule | Coracoïde | Vissage | Transfert | Subscapulaire | Moteur | Mèche | Vis | Ancillaire Latarjet | Rugine | Scie | Bankart osseux | Triple effet',
  codes_ccam = 'MEMA005',
  libelles_sources_lies = 'Confection d''une butée glénoïdale par prélèvement coracoïdien, par abord direct',
  proposition_nouvel_acte_label = 'Stabilisation de l''épaule (Latarjet)',
  updated_at = now()
WHERE id_protocole = 'ACT-0034';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Corps étranger intra-tissulaire',
  definition_expert = 'Extraction chirurgicale d''un objet accidentel (verre, métal, éclat de bois) incrusté dans les tissus profonds. Nécessite un repérage préopératoire précis par radiographie (si radio-opaque) ou échographie (si bois/verre). Contrôle radioscopique ou échographique peropératoire pour localiser l''objet et guider l''extraction. Risque d''échec si le corps étranger est petit et mobile.',
  synonymes_recherche = 'Corps étranger | Exploration | Repérage | Radio | Verre | Métal | Bois | Échographie | Scopie',
  codes_ccam = 'QZGA003',
  libelles_sources_lies = 'Ablation d''un corps étranger profond des tissus mous, en dehors du visage et des mains',
  proposition_nouvel_acte_label = 'Exérèse de corps étranger profond',
  updated_at = now()
WHERE id_protocole = 'ACT-0035';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pathologie ligamentaire ou cartilagineuse poignet',
  definition_expert = 'Exploration et traitement des lésions intra-articulaires du poignet par voie endoscopique. Nécessite optique fine (1.9mm ou 2.7mm) et tour de traction verticale (doigts japonais) pour écarter l''espace articulaire. Permet de traiter les lésions du ligament triangulaire (TFCC), les résections de kystes, les synovectomies ou le débridement cartilagineux.',
  synonymes_recherche = 'Arthro Poignet | TFCC (Triangular Fibrocartilage Complex) | Complexe Fibrocartilagineux Triangulaire | Ligament | Synovectomie | Kyste | Scapho-lunaire | Nettoyage | Tour de poignet | Colonne vidéo | Optique 2.7mm | Optique 1.9mm | Shaver | Vaporisateur | Main | Traction | Doigts japonais',
  codes_ccam = 'MGFC003',
  libelles_sources_lies = 'Arthroscopie du poignet avec geste thérapeutique',
  proposition_nouvel_acte_label = 'Exploration ou geste sous arthroscopie du poignet',
  updated_at = now()
WHERE id_protocole = 'ACT-0036';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement / Usure / Infection PTH',
  definition_expert = 'Chirurgie lourde et complexe consistant à retirer une ancienne prothèse de hanche défaillante (descellement aseptique, usure, infection) pour en poser une nouvelle. Nécessite souvent une extraction laborieuse des implants (ostéotomes, pointes à ultrasons, burinage du ciment), un nettoyage du stock osseux et une reconstruction (greffe osseuse morcelée compactée, armatures métalliques type croix de Kerboull, tiges longues de révision). Risque hémorragique et infectieux accru. Durée opératoire prolongée.',
  synonymes_recherche = 'RTH | Reprise PTH | Prothèse Totale Hanche | Changement de prothèse | Descellement | Usure | Infection | Luxation récidivante | Reconstruction | Greffe osseuse | Armature | Croix de Kerboull | Anneau de soutien | Ciment | Longue tige | Revision | Hanche',
  codes_ccam = 'NEKA001',
  libelles_sources_lies = 'Changement des pièces acétabulaire et fémorale d''une prothèse totale de hanche, avec reconstruction par greffes compactées sans ostéosynthèse',
  proposition_nouvel_acte_label = 'Changement de prothèse totale de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0037';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hématome compressif / Post-opératoire',
  definition_expert = 'Intervention consistant à rouvrir une plaie opératoire ou à inciser une zone tuméfiée pour évacuer une collection liquidienne (sang, pus, sérosités) située sous l''aponévrose. Nécessite lavage abondant au sérum physiologique, vérification de l''hémostase et souvent mise en place d''un drainage (Redon, lame).',
  synonymes_recherche = 'Reprise | Hématome | Collection | Abcès | Drainage | Lavage | Complication | Urgence | Post-op | Redon | Hémostase | Coagulation | Bistouri électrique',
  codes_ccam = 'QZJA011',
  libelles_sources_lies = 'Évacuation de collection profonde de la peau et des tissus mous, par abord direct',
  proposition_nouvel_acte_label = 'Évacuation d''hématome profond',
  updated_at = now()
WHERE id_protocole = 'ACT-0038';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphyse humérale',
  definition_expert = 'Ostéosynthèse d''une fracture de l''humérus par introduction d''un clou métallique à l''intérieur du canal médullaire. L''introduction se fait le plus souvent par le haut (épaule/coiffe) sous contrôle radioscopique, sans ouvrir le foyer de fracture (foyer fermé). Le clou est verrouillé par des vis en haut et en bas pour empêcher la rotation.',
  synonymes_recherche = 'Enclouage | Clou | Humérus | Fracture | Diaphyse | Centromédullaire | T2 | Trigen | Verrouillage | Vis | Moteur | Amplificateur de brillance | Scopie | Clou Telegraph | Abord antéro-latéral | Coiffe',
  codes_ccam = 'MBCB002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse de l''humérus par matériel centromédullaire, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse d''humerus par clou centromédullaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0039';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit / Ostéochondrite / Arthrose cheville',
  definition_expert = 'Intervention endoscopique de la cheville (articulation tibio-talienne). Indiquée pour les conflits osseux antérieurs (bec tibial, ostéophytes), les conflits tissulaires (méniscoïde antérolatéral), les lésions du cartilage du dôme du talus (ostéochondrite) ou l''ablation de corps étrangers libres. Nécessite une distraction de l''articulation (sangle de traction stérile enroulée autour du pied ou distracteur mécanique), une optique fine adaptée (souvent 2.7mm ou 4mm pour l''articulation étroite) et un shaver pour nettoyer les tissus inflammatoires. Voies d''abord antéromédiale et antérolatérale.',
  synonymes_recherche = 'Arthro Cheville | Cheville | Conflit antérieur | Ostéophyte | Bec tibial | Corps étranger | Lésion ostéochondrale | Dôme astragalien | Talus | Nettoyage | Synovectomie | Colonne vidéo | Optique 2.7 | Shaver | Traction | Sangle',
  codes_ccam = 'NGQC001',
  libelles_sources_lies = 'Exploration de l''articulation de la cheville, par arthroscopie',
  proposition_nouvel_acte_label = 'Exploration ou geste sous arthroscopie de cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0040';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hallux Valgus',
  definition_expert = 'Technique moderne de correction de l''hallux valgus réalisée à travers des incisions punctiformes. Le chirurgien utilise des fraises motorisées spécifiques (Shannon, Wedge) sous contrôle radioscopique permanent pour réaliser les ostéotomies (M1 et P1) sans ouvrir la peau. Fixation par vis percutanées ou simple bandage. Nécessite moteur à fort couple et scopie de haute qualité.',
  synonymes_recherche = 'Percutané | Mini-invasif | MICA (Minimally Invasive Chevron Akin) | PECA | Beaver | Fraise | Shannon | Wedge | HV | Hallux | Scopie | Pied | Sans cicatrice | Moteur fort couple | Basneville | Greishamer',
  codes_ccam = 'NDPA002',
  libelles_sources_lies = 'Ostéotomie percutanée du premier métatarsien et de la phalange proximale',
  proposition_nouvel_acte_label = 'Correction d''hallux valgus par technique mini-invasive',
  updated_at = now()
WHERE id_protocole = 'ACT-0041';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Panaris / Infection pulpaire',
  definition_expert = 'Urgence infectieuse de la main. L''intervention ne se limite pas à une simple incision mais nécessite l''excision complète des tissus nécrosés et le nettoyage de la logette infectée. Réalisé sous anesthésie locale ou locorégionale. Prélèvement bactériologique systématique. Souvent laissé ouvert (cicatrisation dirigée).',
  synonymes_recherche = 'Panaris | Infection | Doigt | Pulpe | Phlegmon | Pus | Abcès | Bistouri | Lavage | Excision | Urgence main | Bains | Septique | Staphylocoque | Onyxis | Périonyxis',
  codes_ccam = 'MJFA003',
  libelles_sources_lies = 'Excision d''un panaris profond',
  proposition_nouvel_acte_label = 'Excision et drainage de panaris',
  updated_at = now()
WHERE id_protocole = 'ACT-0042';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du tendon d''Achille',
  definition_expert = 'Réparation chirurgicale d''une rupture du tendon d''Achille (calcanéen). L''intervention consiste à rapprocher les extrémités rompues du tendon et à les suturer solidement (fils tressés haute résistance, technique Kessler ou Krackow). Peut être réalisée à ciel ouvert (grande cicatrice) ou en mini-invasif (Tenolig). Installation à plat ventre (décubitus ventral). Botte plâtrée en équin.',
  synonymes_recherche = 'Achille | Rupture | Suture | Ténorraphie | Tendon calcanéen | Kessler | Krackow | Tenolig | Percutané | Ciel ouvert | Sport | Cheville | Fil résorbable | Fil non résorbable | Décubitus ventral | Fiberwire',
  codes_ccam = 'NJCA001',
  libelles_sources_lies = 'Suture du tendon calcanéen, par abord direct',
  proposition_nouvel_acte_label = 'Suture du tendon d''Achille',
  updated_at = now()
WHERE id_protocole = 'ACT-0043';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Canal lombaire étroit / Compression',
  definition_expert = 'Intervention de libération du canal rachidien lombaire rétréci par arthrose (sténose canalaire). Consiste à retirer l''arc postérieur vertébral (lame) et le ligament jaune hypertrophié qui compriment la dure-mère et les racines nerveuses de la queue de cheval. Souvent réalisée avec un moteur haute vitesse (Midas Rex) et des pinces emporte-pièce de Kerrison. Soulage les douleurs et la claudication neurogène (impossibilité de marcher) mais risque d''instabilité vertébrale secondaire si résection trop large.',
  synonymes_recherche = 'Laminectomie | Canal Lombaire Étroit | CLE | Canal Étroit | Recalibrage | Sténose | Décompression | L4-L5 | Midas Rex | Kerrison | Rachis | Arthrectomie | Flavum | Ligament jaune | Queue de cheval',
  codes_ccam = 'LFFA001',
  libelles_sources_lies = 'Laminarthrectomie lombale ou lombosacrale totale bilatérale, par abord postérieur',
  proposition_nouvel_acte_label = 'Laminectomie vertébrale (Décompression)',
  updated_at = now()
WHERE id_protocole = 'ACT-0044';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal cubital au coude',
  definition_expert = 'Libération du nerf cubital (ulnaire) au coude réalisée par technique endoscopique (petite incision avec caméra). Section de l''arcade d''Osborne et des structures compressives sous contrôle vidéo. Récupération plus rapide et cicatrice réduite.',
  synonymes_recherche = 'Nerf ulnaire | Nerf Cubital | Coude | Endoscopie | FMS | Mini-invasif | Caméra | SmartRelease | A.M.I | Agee | Paresthésies | 4ème doigt | 5ème doigt | Arcade Osborne',
  codes_ccam = 'AHPC002',
  libelles_sources_lies = 'Libération du nerf ulnaire au coude, par vidéochirurgie',
  proposition_nouvel_acte_label = 'Libération du nerf ulnaire par endoscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0045';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur des parties molles / Kyste',
  definition_expert = 'Excision chirurgicale d''une masse cutanée ou sous-cutanée (kyste, lipome, tumeur bénigne) pour analyse anatomopathologique. L''intervention suit les règles de la chirurgie carcinologique (marges saines) si doute diagnostique, ou simple énucléation si lésion bénigne confirmée. Nécessite une instrumentation fine (bistouri lame 15, ciseaux de Mayo, porte-aiguille) et un examen anatomopathologique systématique de la pièce d''exérèse.',
  synonymes_recherche = 'Kyste | Boule | Masse | Tuméfaction | Lipome | Tumeur bénigne | Exérèse | Excision | Ablation',
  codes_ccam = 'QZFA004',
  libelles_sources_lies = 'Exérèse de lésion superficielle de la peau et des tissus mous',
  proposition_nouvel_acte_label = 'Exérèse de lésion des tissus mous',
  updated_at = now()
WHERE id_protocole = 'ACT-0046';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste cutané ou synovial volumineux',
  definition_expert = 'Intervention de chirurgie plastique pour une lésion (kyste, tumeur) dont l''exérèse crée une perte de substance impossible à fermer par suture directe. Nécessite la mobilisation de la peau adjacente (lambeau de rotation ou d''avancement) pour couvrir le défaut.',
  synonymes_recherche = 'Lambeau | Plastie | Rotation | Avancement | Kyste | Perte de substance | Limberg | Dufourmentel | Z-plastie | Couverture | Peau | Cicatrisation',
  codes_ccam = 'QZMA001',
  libelles_sources_lies = 'Exérèse de lésion avec lambeau de couverture',
  proposition_nouvel_acte_label = 'Exérèse de lésion avec reconstruction par lambeau',
  updated_at = now()
WHERE id_protocole = 'ACT-0047';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation osseuse / Gêne',
  definition_expert = 'Retrait ciblé d''une ou plusieurs vis d''ostéosynthèse (sans retirer la plaque associée), par exemple une vis de syndesmose de cheville qui gêne la pronosupination, une vis canulée de scaphoïde ou une vis de blocage d''un clou. Nécessite de connaître l''empreinte de la vis (Hexagonale 2.5mm, 3.5mm, Torx, cruciforme) pour avoir le bon tournevis stérile. Geste souvent ambulatoire.',
  synonymes_recherche = 'AMO | Ablation Matériel Ostéosynthèse | Ablation Vis | Vis seule | Vis de syndesmose | Vis de rappel | Site | Local | Tournevis | Hexagonal | Torx | Cruciforme | Ancillaire ablation | Ambulatoire',
  codes_ccam = 'PAGA011',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse des membres sur un site, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse (vis seule)',
  updated_at = now()
WHERE id_protocole = 'ACT-0048';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de la clavicule déplacée',
  definition_expert = 'Réduction et fixation d''une fracture déplacée de la clavicule par une plaque vissée (souvent anatomique "S-shape") posée sur la face supérieure ou antérieure de l''os. Permet une reprise fonctionnelle rapide de l''épaule.',
  synonymes_recherche = 'Clavicule | Plaque | S-Shape | Anatomique | Vis | Moteur | Traumato | Sport | Vélo | Disjonction | Abord antérieur | Synthes | Stryker',
  codes_ccam = 'MACA001',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la clavicule, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de clavicule',
  updated_at = now()
WHERE id_protocole = 'ACT-0049';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du tendon d''Achille',
  definition_expert = 'Réparation chirurgicale d''une rupture du tendon d''Achille. Suture des extrémités tendineuses par fils haute résistance (technique Kessler ou Krackow). Peut être réalisée à ciel ouvert ou en mini-invasif (Tenolig, Dresden). Décubitus ventral. Immobilisation postopératoire en équin.',
  synonymes_recherche = 'Achille | Rupture | Suture | Ténorraphie | Tendon calcanéen | Kessler | Krackow | Tenolig | Percutané | Mini-invasif | Ciel ouvert | Sport | Cheville | Décubitus ventral',
  codes_ccam = 'NJCA001',
  libelles_sources_lies = 'Suture du tendon calcanéen, par abord direct',
  proposition_nouvel_acte_label = 'Réparation chirurgicale du tendon d''Achille',
  updated_at = now()
WHERE id_protocole = 'ACT-0050';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de métacarpien',
  definition_expert = 'Ostéosynthèse à "ciel ouvert" (abord dorsal le plus souvent) pour les fractures instables ou multiples des métacarpiens. Permet une réduction anatomique parfaite et une fixation rigide par plaque miniature et vis (1.5mm à 2.4mm). Indiqué pour les fractures de la diaphyse ou les fractures articulaires complexes (Benett/Rolando sur le M1).',
  synonymes_recherche = 'Métacarpien | M1 | M2 | M3 | M4 | M5 | Boxeur | Col | Diaphyse | Plaque | Vis | Lag screw | Mini-plaque | Ancillaire main | Synthes | Stryker | Medartis | Moteur | Scopie',
  codes_ccam = 'MDCA011',
  libelles_sources_lies = 'Ostéosynthèse de fracture extraarticulaire d''un os de la main, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de métacarpien',
  updated_at = now()
WHERE id_protocole = 'ACT-0051';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture digitale déplacée',
  definition_expert = 'Réparation d''une fracture de phalange par pose de matériel (plaque ou vis seules). Indiquée pour les fractures articulaires ou instables irréductibles par broches. Permet une mobilisation immédiate pour éviter la raideur, complication majeure des doigts. Matériel : ancillaire de "mini-fragments" (vis 1.0 à 1.5mm).',
  synonymes_recherche = 'Doigt | Phalange | P1 | P2 | Synthèse | Plaque | Vis | Mini-vis | Foyer ouvert | Abord latéral | Abord dorsal | Micro-moteur | Loupes | Main | Rigide | Mobilisation précoce',
  codes_ccam = 'MDCA011',
  libelles_sources_lies = 'Ostéosynthèse de fracture extraarticulaire d''un os de la main, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de doigt (Plaque/Vis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0052';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de phalange ou métacarpien',
  definition_expert = 'Traitement chirurgical d''une fracture de phalange ou de métacarpien déplacée. La fracture est réduite manuellement sous radioscopie, puis fixée par une ou plusieurs broches (10/10 ou 12/10) introduites à travers la peau (sans ouvrir le foyer de fracture). Technique rapide, peu délabrante, nécessitant une immobilisation complémentaire.',
  synonymes_recherche = 'Embrochage | Phalange | Métacarpien | Main | Broche | Kirschner | Foyer fermé | Percutané | Iselin | Kapandji | Moteur | Pince | Scopie | Urgence main | P1 | P2 | P3',
  codes_ccam = 'MDCB003',
  libelles_sources_lies = 'Ostéosynthèse de fracture extraarticulaire d''un os de la main par broche, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse de doigt par broches',
  updated_at = now()
WHERE id_protocole = 'ACT-0053';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhizarthrose (Arthrose du pouce)',
  definition_expert = 'Traitement chirurgical de la rhizarthrose sans prothèse. Trapézectomie : ablation du trapèze (os arthrosique). Ligamentoplastie de suspension (Burton-Pellegrini, Weilby) : stabilisation de la base du métacarpien par une bandelette tendineuse (hémi-FCR ou APL) pour éviter recul du pouce et perte de force. Interposition tendineuse ("anchois") dans la loge.',
  synonymes_recherche = 'Trapézectomie | Ligamentoplastie | Burton-Pellegrini | Weilby | Suspension | Interposition | Rhizarthrose | Pouce | Anchois | Tendon | FCR (Flexor Carpi Radialis) | Fléchisseur Radial du Carpe | Long Abducteur | APL (Abductor Pollicis Longus) | Main',
  codes_ccam = 'MHFA003',
  libelles_sources_lies = 'Trapézectomie avec ligamentoplastie de suspension',
  proposition_nouvel_acte_label = 'Trapézectomie et ligamentoplastie de suspension',
  updated_at = now()
WHERE id_protocole = 'ACT-0054';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hygroma / Bursite olécrânienne',
  definition_expert = 'Ablation de la bourse séreuse rétro-olécrânienne (coude) inflammatoire ou infectée. L''intervention consiste à exciser la poche liquidienne (bursite) en prenant garde à la peau souvent fine et cicatricielle. Fréquent chez les appuis répétés sur le coude.',
  synonymes_recherche = 'Hygroma | Bursite | Bourse séreuse | Olécrane | Coude | Exérèse | Tuméfaction | Liquide | Infection | Septique | Bistouri | Drain',
  codes_ccam = 'MJFA005',
  libelles_sources_lies = 'Exérèse d''un hygroma du coude, par abord direct',
  proposition_nouvel_acte_label = 'Exérèse de bourse olécranienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0055';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation de prothèse de hanche',
  definition_expert = 'Geste d''urgence consistant à remettre en place une prothèse de hanche luxée (déboîtée), sans ouvrir la peau. Nécessite sédation profonde ou AG pour relâchement musculaire. Réduction par manœuvres de traction et rotation sous contrôle radioscopique. Immobilisation par coussin d''abduction ou coque anti-luxation.',
  synonymes_recherche = 'Luxation PTH (Prothèse Totale Hanche) | Réduction | Manoeuvres | Urgence | Hanche | Prothèse | Déboîtée | Sédation | AG (Anesthésie Générale) | Amplificateur de brillance | Radio de contrôle | Traction',
  codes_ccam = 'NEEP002',
  libelles_sources_lies = 'Réduction orthopédique d''une luxation de prothèse de l''articulation coxofémorale',
  proposition_nouvel_acte_label = 'Réduction d''une luxation de prothèse de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0056';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Spondylodiscite / Tumeur rachidienne',
  definition_expert = 'Prélèvement osseux ou discal rachidien réalisé sans ouverture (transcutané) sous contrôle de l''amplificateur de brillance ou scanner. Vise à identifier un germe (spondylodiscite) ou caractériser une tumeur. Nécessite trocarts longs spécifiques (Jamshidi). Prélèvements multiples pour bactériologie et anatomopathologie.',
  synonymes_recherche = 'Biopsie | Vertèbre | Rachis | Spondylodiscite | Tumeur | Métastase | Pott | Trocart | Jamshidi | Scopie | Transcutané | Sédation | Pot stérile | Anapath | Bactério | Percutané',
  codes_ccam = 'LHHH003',
  libelles_sources_lies = 'Biopsie osseuse et/ou discale de la colonne vertébrale, par voie transcutanée avec guidage radiologique',
  proposition_nouvel_acte_label = 'Biopsie osseuse vertébrale',
  updated_at = now()
WHERE id_protocole = 'ACT-0057';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hernie discale cervicale / Névralgie cervico-brachiale',
  definition_expert = 'Chirurgie de décompression d''une racine nerveuse cervicale par abord postérieur (type Frykholm), sans fusion. Indiquée pour les hernies latérales molles comprimant la racine dans le foramen. Alternative à la voie antérieure avec arthrodèse.',
  synonymes_recherche = 'HDC (Hernie Discale Cervicale) | Hernie Cervicale | NCB (Névralgie Cervico-Brachiale) | Discectomie | Frykholm | Postérieur | Foraminotomie | Kerrison | Microscope | Moteur | Fraise',
  codes_ccam = 'LDFA002',
  libelles_sources_lies = 'Exérèse d''une hernie discale de la colonne vertébrale cervicale, par abord postérieur',
  proposition_nouvel_acte_label = 'Exérèse de hernie discale cervicale par voie postérieure',
  updated_at = now()
WHERE id_protocole = 'ACT-0058';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie tendineuse (Extenseur)',
  definition_expert = 'Réparation d''une section d''un tendon extenseur au niveau de la main ou des doigts. Geste fréquent en urgence. La technique de suture (points en U, cadre, Kessler) dépend de la zone atteinte. Nécessite une immobilisation stricte post-opératoire (attelle segmentaire) pour éviter la rupture secondaire.',
  synonymes_recherche = 'Extenseur | Tendon | Suture | Main | Doigt | Coupure | Mallet finger | Boutonnière | Zone 1 | Zone 2 | Zone 3 | Fil non résorbable | Attelle | Urgence main | Dermato-tenodèse',
  codes_ccam = 'MJCA012',
  libelles_sources_lies = 'Réparation de l''appareil extenseur d''un doigt par suture',
  proposition_nouvel_acte_label = 'Réparation de tendon extenseur',
  updated_at = now()
WHERE id_protocole = 'ACT-0059';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur / Infection (Diagnostic)',
  definition_expert = 'Acte diagnostique consistant à prélever un fragment d''os ou de tissu profond pour analyse (Bactériologique si suspicion d''infection, Anatomopathologique si suspicion de tumeur). Nécessite matériel adapté à la dureté de l''os et gestion rigoureuse des échantillons (pots stériles, formol).',
  synonymes_recherche = 'Biopsie | Prélèvement | Os | Tumeur | Infection | Septique | Bactério | Anapath | Trocart | Jamshidi | Trépine | Moteur | Ciseau à os | Pot stérile | Culture | Profond | Carotte',
  codes_ccam = 'NZHA001',
  libelles_sources_lies = 'Biopsie de tissu osseux ou des parties molles',
  proposition_nouvel_acte_label = 'Prélèvement tissulaire pour analyse',
  updated_at = now()
WHERE id_protocole = 'ACT-0060';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de l''humérus',
  definition_expert = 'Fixation d''une fracture de l''humérus par plaque vissée. Nécessite un abord chirurgical large (souvent externe ou postérieur) et une dissection prudente du nerf radial qui croise la diaphyse humérale. Indiqué quand l''enclouage n''est pas possible ou pour les fractures articulaires.',
  synonymes_recherche = 'Humérus | Plaque | Diaphyse | Foyer ouvert | Radial | Nerf radial | Vis | LCP | DCP | Moteur | Traumato | Bras',
  codes_ccam = 'MBCA011',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse de l''humérus, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de l''humérus (Plaque)',
  updated_at = now()
WHERE id_protocole = 'ACT-0061';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Corps étranger / Raideur / Arthrose coude',
  definition_expert = 'Intervention endoscopique sur le coude. Indiquée pour l''ablation de corps étrangers (souris articulaires), le nettoyage de l''arthrose (ostéophytes), ou la libération de la raideur (arthrolyse). Nécessite une installation très précise (décubitus latéral ou ventral, garrot au bras) pour éviter les lésions nerveuses (nerf ulnaire, nerf radial). Anatomie complexe avec des repères vasculo-nerveux dangereux à proximité des voies d''abord.',
  synonymes_recherche = 'Arthro Coude | Corps étranger | Souris | Ostéochondromatose | Raideur | Arthrolyse | Synovectomie | Optique 2.7 | Shaver | Colonne vidéo | Décubitus latéral',
  codes_ccam = 'MFJC001',
  libelles_sources_lies = 'Nettoyage de l''articulation du coude, par arthroscopie',
  proposition_nouvel_acte_label = 'Exploration du coude sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0062';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Désunion / Cicatrice pathologique',
  definition_expert = 'Geste consistant à exciser chirurgicalement une cicatrice défectueuse (élargie, adhérente, chéloïde, inesthétique) pour refaire une suture plus esthétique en respectant les lignes de tension cutanée. Nécessite une résection fusiforme de la cicatrice pathologique et une suture minutieuse plan par plan (sous-cutané au fil résorbable, peau au monofilament fin).',
  synonymes_recherche = 'Cicatrice | Chéloïde | Reprise | Plastie | Esthétique | Exérèse | Bistouri | Suture | Fil fin | Visage | Corps | Adhérence',
  codes_ccam = 'QZFA002',
  libelles_sources_lies = 'Exérèse d''une lésion souscutanée susfasciale de moins de 3 cm de grand axe',
  proposition_nouvel_acte_label = 'Plastie cicatricielle',
  updated_at = now()
WHERE id_protocole = 'ACT-0063';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du Ligament Croisé Antérieur (LCA)',
  definition_expert = 'Technique la plus fréquente de reconstruction du LCA. Utilise les tendons des muscles ischio-jambiers (Gracilis et Semi-Tendinosus) prélevés par petite incision tibiale au stripper. Le greffon plié en 4 brins (DT4) est passé dans des tunnels osseux et fixé (boutons corticaux, vis). Moins de douleurs antérieures que le Kenneth-Jones.',
  synonymes_recherche = 'DIDT (Droit Interne Demi-Tendineux) | Droit Interne | Demi-Tendineux | Ischio-Jambiers | Gracilis | Semi-tendinosus | LCA (Ligament Croisé Antérieur) | Ligamentoplastie | Genou | Sport | Endobutton | Vis | Agrafe | Rigidfix | Tightrope | Arthro | Stripper',
  codes_ccam = 'NFMC003',
  libelles_sources_lies = 'Reconstruction du ligament croisé antérieur du genou par autogreffe d''ischio-jambiers',
  proposition_nouvel_acte_label = 'Ligamentoplastie du LCA au DIDT',
  updated_at = now()
WHERE id_protocole = 'ACT-0064';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture ou Luxation déplacée',
  definition_expert = 'Geste non chirurgical consistant à remettre en place une fracture déplacée (souvent poignet ou métacarpien) par des manœuvres externes de traction/manipulation, sous anesthésie locale ou sédation. Le résultat est contrôlé sous radioscopie et maintenu par une contention (plâtre, résine ou attelle).',
  synonymes_recherche = 'Réduction | Fracture | Manœuvre | Traction | Plâtre | Attelle | Urgence | Boxeur | Pouteau-Colles | Baudet | Orthopédique | Sans chirurgie | Scopie | Contrôle',
  codes_ccam = 'MDEP002',
  libelles_sources_lies = 'Réduction orthopédique d''une fracture d''un os de la main',
  proposition_nouvel_acte_label = 'Réduction non chirurgicale d''une fracture/luxation',
  updated_at = now()
WHERE id_protocole = 'ACT-0065';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hallux Valgus bilatéral',
  definition_expert = 'Correction chirurgicale des deux pieds dans le même temps opératoire. Même technique que l''unilatéral (Scarf + Akin), mais nécessite deux équipes ou temps plus long, et gestion post-opératoire adaptée (marche talonnante bilatérale possible mais difficile).',
  synonymes_recherche = 'Bilatéral | Deux pieds | HV | Scarf | Akin | Ostéotomie | Moteur | Vis | Pansement | Chirurgie | Simultané | M1 | P1',
  codes_ccam = 'NDPA002',
  libelles_sources_lies = 'Ostéotomie du métatarsien et de la phalange proximale du premier rayon du pied, bilatérale',
  proposition_nouvel_acte_label = 'Correction d''hallux valgus bilatéral',
  updated_at = now()
WHERE id_protocole = 'ACT-0066';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité chronique de cheville (Entorses)',
  definition_expert = 'Stabilisation chirurgicale de la cheville pour instabilité chronique (entorses à répétition). Peut être une simple remise en tension des ligaments avec des ancres (Brostrom-Gould) ou une reconstruction utilisant un tendon (Hémi-Castaing au court fibulaire). Rééducation proprioceptive prolongée.',
  synonymes_recherche = 'Ligamentoplastie | Cheville | Entorse chronique | Instabilité | Castaing | Brostrom | Gould | Hémi-Castaing | Court péronier | Court fibulaire | Ancre | Suture | Retinaculum | Sport | LTFA (Ligament Talo-Fibulaire Antérieur)',
  codes_ccam = 'NGCA001',
  libelles_sources_lies = 'Reconstruction du plan ligamentaire latéral de la cheville',
  proposition_nouvel_acte_label = 'Réparation des ligaments de la cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0067';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture palette humérale ou olécrane',
  definition_expert = 'Réduction et fixation des fractures complexes de l''extrémité inférieure de l''humérus (palette humérale) ou de l''olécrane. Nécessite souvent deux plaques (interne et externe) pour la palette ou un haubanage (cerclage en 8) pour l''olécrane. Abord postérieur avec repérage et protection du nerf ulnaire (transposition si nécessaire). Risque de raideur important nécessitant rééducation précoce.',
  synonymes_recherche = 'Palette humérale | Coude | Olécrane | Haubanage | Plaque | Vis | Fracture | Comminutive | Traumato | Nerf ulnaire | Transposition | Moteur | Scopie | AO | Synthes | Double plaque',
  codes_ccam = 'MBCA012',
  libelles_sources_lies = 'Ostéosynthèse de fracture intracapsulaire de l''extrémité distale de l''humérus, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse du coude (Olécrane/Palette)',
  updated_at = now()
WHERE id_protocole = 'ACT-0068';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Abcès profond / Collection purulente',
  definition_expert = 'Mise à plat chirurgicale urgente d''une collection purulente profonde (abcès sous-aponévrotique). L''intervention nécessite une incision large pour évacuer tout le pus sous pression, rompre les logettes purulentes (exploration au doigt ou à l''instrument mousse), exciser les tissus nécrosés et laver abondamment (plusieurs litres de sérum). Prélèvements bactériologiques systématiques. La plaie est souvent laissée ouverte avec une mèche ou un drain de Redon pour cicatrisation dirigée et éviter la réaccumulation.',
  synonymes_recherche = 'Abcès | Pus | Collection | Infection | Bistouri | Drainage | Mèche | Lavage | Septique | Urgence | Fesse | Cuisse | Dos | Prélèvement | Parage | Débridement | Nettoyage chirurgical',
  codes_ccam = 'QZJA011',
  libelles_sources_lies = 'Évacuation de collection profonde de la peau et des tissus mous',
  proposition_nouvel_acte_label = 'Mise à plat d''abcès profond',
  updated_at = now()
WHERE id_protocole = 'ACT-0069';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation gléno-humérale',
  definition_expert = 'Acte d''urgence consistant à remettre en place la tête humérale sortie de la glène (luxation antéro-interne le plus souvent). Réalisé par manœuvres externes douces (traction, rotation) sous analgésie ou sédation. Radio post-réduction systématique pour vérifier congruence et absence de fracture associée.',
  synonymes_recherche = 'Luxation | Epaule | Réduction | Urgence | Manœuvre | Kocher | Milch | Cunningham | Traction | Sédation | Proto | MEOPA | Radio | Déboîtée | Antéro-interne',
  codes_ccam = 'MEEP002',
  libelles_sources_lies = 'Réduction orthopédique d''une luxation scapulohumérale',
  proposition_nouvel_acte_label = 'Réduction de luxation scapulohumérale',
  updated_at = now()
WHERE id_protocole = 'ACT-0070';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste synovial / Méniscal',
  definition_expert = 'Ablation d''un kyste développé aux dépens d''une articulation. Très fréquent au poignet (dorsal/palmaire) ou au genou (kyste poplité de Baker). Le geste consiste à retirer la poche kystique et à fermer la communication avec l''articulation (collet) pour éviter que le liquide synovial ne revienne.',
  synonymes_recherche = 'Kyste | Synovial | Mucoïde | Poignet | Doigt | Pied | Genou | Poplité | Baker | Hernie | Gelée | Résection | Collet | Récidive',
  codes_ccam = 'MHFA002',
  libelles_sources_lies = 'Exérèse de kyste synovial articulaire',
  proposition_nouvel_acte_label = 'Exérèse de kyste synovial',
  updated_at = now()
WHERE id_protocole = 'ACT-0071';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture complexe tête humérale',
  definition_expert = 'Remplacement prothétique de l''épaule indiqué pour les fractures complexes non réparables de l''extrémité proximale de l''humérus (3 ou 4 fragments selon classification de Neer), souvent chez le sujet âgé. Peut être une hémi-arthroplastie (remplace la tête seule) ou une prothèse inversée (si coiffe des rotateurs non fonctionnelle). La clé du succès réside dans la réinsertion solide des tubérosités (trochiter/trochin) autour de l''implant par cerclages et sutures.',
  synonymes_recherche = 'PTE | Prothèse Épaule | Prothèse Totale Épaule | Fracture | Comminutive | Hémiarthroplastie | Inversée | Reverse | Tubérosités | Trochiter | Trochin | Cerclage | Suture | Urgence différée | Traumato | Sujet âgé',
  codes_ccam = 'MEKA004',
  libelles_sources_lies = 'Remplacement de l''articulation scapulohumérale pour fracture récente de l''extrémité proximale de l''humérus',
  proposition_nouvel_acte_label = 'Hémi-arthroplastie ou PTH inverse d''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0072';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lipome (Tumeur bénigne adipeuse)',
  definition_expert = 'Ablation d''une masse graisseuse bénigne (lipome). Geste simple si superficiel (énucléation), plus complexe si profond ou intramusculaire. Code CCAM variable selon localisation et profondeur.',
  synonymes_recherche = 'Lipome | Graisse | Boule | Masse | Tumeur bénigne | Adipome | Sous-cutané | Profond',
  codes_ccam = 'QZFA002',
  libelles_sources_lies = 'Exérèse de tumeur des tissus mous',
  proposition_nouvel_acte_label = 'Exérèse de lipome',
  updated_at = now()
WHERE id_protocole = 'ACT-0073';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose tibio-talienne',
  definition_expert = 'Intervention irréversible consistant à bloquer définitivement l''articulation de la cheville (fusion entre tibia et talus) pour supprimer les douleurs d''arthrose terminale post-traumatique. Nécessite de retirer complètement le cartilage résiduel (à ciel ouvert ou sous arthroscopie), aviver les surfaces osseuses jusqu''à l''os spongieux, et fixer solidement par du matériel métallique (vis croisées en compression ou clou trans-calcanéen ascendant) jusqu''à fusion osseuse complète (consolidation en 3-6 mois). Greffe osseuse souvent nécessaire. Supprime la douleur mais transfert les contraintes sur les articulations adjacentes (sous-talienne).',
  synonymes_recherche = 'Arthrodèse | Cheville | Tibiotalienne | Tibio-talienne | Fusion | Blocage | Arthrose | Séquelle fracture | Vis | Clou rétrograde | Meary | Greffe osseuse | Foyer ouvert | Arthroscopie | Fixateur',
  codes_ccam = 'NKKA004',
  libelles_sources_lies = 'Arthrodèse tibiotalienne, par arthrotomie',
  proposition_nouvel_acte_label = 'Fusion articulaire de la cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0074';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Nodule des tissus mous',
  definition_expert = 'Terme générique pour l''exérèse de toute petite lésion palpable ("boule"). L''intervention suit les règles de la chirurgie carcinologique (marges saines) si doute, ou simple énucléation si bénin. Analyse anatomopathologique systématique.',
  synonymes_recherche = 'Nodule | Induration | Grain de beauté | Naevus | Kyste | Dermato | Plastique | Anapath | Histologie | Bistouri | Fil fin',
  codes_ccam = 'QZFA003',
  libelles_sources_lies = 'Exérèse de lésion sous-cutanée',
  proposition_nouvel_acte_label = 'Exérèse de nodule cutané',
  updated_at = now()
WHERE id_protocole = 'ACT-0075';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du col fémoral',
  definition_expert = 'Ostéosynthèse d''une fracture du massif trochantérien par un système "Vis-Plaque" dynamique (DHS). Une grosse vis céphalique est insérée dans le col fémoral et coulisse dans le canon d''une plaque fixée sur le fémur, permettant la compression du foyer.',
  synonymes_recherche = 'DHS | Dynamic Hip Screw | Vis-Plaque | THS | Gamma | Plaque | Fémur | Pertrochantérienne | Urgence | Sujet âgé | Moteur | Table orthopédique | Scopie',
  codes_ccam = 'NBCA006',
  libelles_sources_lies = 'Ostéosynthèse de fracture infratrochantérienne ou trochantérodiaphysaire du fémur',
  proposition_nouvel_acte_label = 'Ostéosynthèse du col du fémur (DHS/Vis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0076';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Epicondylite (Tennis Elbow)',
  definition_expert = 'Traitement chirurgical de la tendinite chronique externe du coude (Tennis Elbow) résistant au traitement médical. La technique (souvent Peignage ou intervention de Nirschl) consiste à exciser la zone de tendinose pathologique (tissu grisâtre dégénéré) du tendon conjoint des extenseurs et à détendre l''insertion des muscles extenseurs du poignet par désinsertion partielle pour soulager la tension douloureuse. Abord externe direct sur l''épicondyle latéral.',
  synonymes_recherche = 'Epicondylite | Tennis Elbow | Peignage | Nirschl | Désinsertion | Allongement | Tendon conjoint | Court extenseur du carpe | ECRB | Extensor Carpi Radialis Brevis | Micro-tenotomie | PRP | Plasma Riche en Plaquettes | Infiltration',
  codes_ccam = 'MFPA005',
  libelles_sources_lies = 'Désinsertion ou allongement des muscles épicondyliens latéraux au coude, par abord direct',
  proposition_nouvel_acte_label = 'Traitement chirurgical d''épicondylite',
  updated_at = now()
WHERE id_protocole = 'ACT-0077';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du fémur',
  definition_expert = 'Traitement standard des fractures de la diaphyse fémorale. Consiste à introduire un long clou métallique dans le canal médullaire du fémur (souvent par le sommet du grand trochanter) après réduction sur table orthopédique. Foyer fermé (pas d''ouverture de la fracture) pour préserver l''hématome fracturaire et la consolidation.',
  synonymes_recherche = 'Enclouage | Fémur | Diaphyse | Clou | T2 | Trigen | Verrouillage | Vis | Table orthopédique | Traction | Scopie | Alésage | Guide',
  codes_ccam = 'NBCB002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse du fémur par matériel centromédullaire sans verrouillage distal, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse de la diaphyse du fémur',
  updated_at = now()
WHERE id_protocole = 'ACT-0078';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Exostose / Ostéochondrome',
  definition_expert = 'Ablation d''une excroissance osseuse déformant l''ongle de l''orteil (exostose sous-unguéale de Dupuytren). Nécessite une résection osseuse à la pince gouge, au ciseau à os ou à la fraise motorisée. Souvent associée au traitement d''un ongle incarné chronique récidivant. Le lit unguéal est préservé autant que possible.',
  synonymes_recherche = 'Exostose | Orteil | Sous-unguéale | Dupuytren | Ongle incarné | Pied | Excroissance osseuse | Pince gouge | Fraise',
  codes_ccam = 'NDFA005',
  libelles_sources_lies = 'Résection d''une exostose infra-unguéale d''un orteil',
  proposition_nouvel_acte_label = 'Résection d''exostose osseuse',
  updated_at = now()
WHERE id_protocole = 'ACT-0079';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Douleurs facettaires (Lombalgie)',
  definition_expert = 'Traitement de la douleur lombaire chronique d''origine articulaire postérieure (syndrome facettaire arthrosique). Consiste à brûler par radiofréquence (thermolésion à 80°C) les petites branches nerveuses sensitives (rameau médian du rameau dorsal) qui innervent les articulations facettaires douloureuses, sous contrôle radioscopique strict. Effet antalgique de 6 à 24 mois. Geste percutané sous anesthésie locale.',
  synonymes_recherche = 'Rhizolyse | Thermocoagulation | Radiofréquence | RF | Lombaire | Cervicale | Facette articulaire | Lombalgie | Douleur dos | Nerf de Luschka | Branche médiane | Sonde | Chaleur',
  codes_ccam = 'AHLA001',
  libelles_sources_lies = 'Destruction de nerf articulaire vertébral [nerf de Luschka], par voie transcutanée avec guidage radiologique',
  proposition_nouvel_acte_label = 'Thermocoagulation de facettes articulaires',
  updated_at = now()
WHERE id_protocole = 'ACT-0080';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit sous-acromial + Pathologie Biceps',
  definition_expert = 'Intervention combinée fréquente. L''acromioplastie (rabotage de l''acromion) traite le conflit osseux sous-acromial. La ténodèse consiste à couper l''insertion intra-articulaire du tendon du long biceps (souvent dégénératif et douloureux) et à le fixer par ancre ou vis dans la gouttière humérale bicipitale ou sous le muscle pectoral, pour supprimer la douleur tout en gardant la force de flexion du coude.',
  synonymes_recherche = 'Acromioplastie | Ténodèse | Biceps | Long Biceps | LHB | Long Head Biceps | Tenotomie | Popeye | Ancre | Vis | Gouttière bicipitale | Inter-tubérositaire | Conflit | Coiffe | Arthro',
  codes_ccam = 'MEMC003',
  libelles_sources_lies = 'Acromioplastie sans prothèse, par arthroscopie',
  proposition_nouvel_acte_label = 'Acromioplastie et ténodèse biceps (Arthro)',
  updated_at = now()
WHERE id_protocole = 'ACT-0081';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ténosynovite de De Quervain',
  definition_expert = 'Libération chirurgicale du premier compartiment des extenseurs au niveau de la styloïde radiale. Consiste à ouvrir la coulisse fibreuse (rétinaculum) qui comprime les tendons du long abducteur (APL) et du court extenseur du pouce (EPB), et à retirer la synovite inflammatoire. Attention à la branche sensitive du nerf radial.',
  synonymes_recherche = 'De Quervain | Ténosynovite | Poignet | Styloïde radiale | Premier compartiment | Coulisse | Long abducteur | APL (Abductor Pollicis Longus) | Court extenseur | EPB (Extensor Pollicis Brevis) | Pouce | Finkelstein | Inflammation | Gaine | Nerf radial sensitif',
  codes_ccam = 'MJPA004',
  libelles_sources_lies = 'Libération des tendons du premier compartiment dorsal du poignet',
  proposition_nouvel_acte_label = 'Libération du 1er compartiment des extenseurs',
  updated_at = now()
WHERE id_protocole = 'ACT-0082';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Phlegmon des gaines',
  definition_expert = 'Urgence majeure de la main (signes de Kanavel). Infection de la gaine synoviale entourant les tendons fléchisseurs. Impose un lavage urgent de la gaine sur toute sa longueur (souvent par deux incisions : paume et doigt) pour éviter la nécrose du tendon et la raideur définitive. Antibiothérapie IV.',
  synonymes_recherche = 'Phlegmon | Gaine | Infection | Doigt | Urgence main | Lavage | Synoviale | Cathéter | Irrigation | Main | Hook | Crochet | Flexum | Kanavel | Fléchisseurs',
  codes_ccam = 'MJJA001',
  libelles_sources_lies = 'Évacuation d''un phlegmon de gaine synoviale digitale',
  proposition_nouvel_acte_label = 'Gaine des fléchisseurs (Phlegmon)',
  updated_at = now()
WHERE id_protocole = 'ACT-0083';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Griffes d''orteils',
  definition_expert = 'Correction des déformations des petits orteils (griffes) qui entraînent des cors douloureux. Technique la plus courante : arthroplastie IPP (résection de la tête de P1) pour raccourcir et redresser l''orteil. Peut nécessiter fixation temporaire par broche ou définitive par implant intra-médullaire (SmartToe).',
  synonymes_recherche = 'Griffe | Marteau | Cor | Durillon | Oeil de perdrix | Arthroplastie | Résection | K-wire | Broche | Raccourcissement | P2 | P1 | Avant-pied | Chaussage | IPP (Interphalangienne Proximale)',
  codes_ccam = 'NDMA002',
  libelles_sources_lies = 'Arthroplastie interphalangienne proximale ou distale d''un orteil latéral',
  proposition_nouvel_acte_label = 'Correction d''orteil en griffe ou en marteau',
  updated_at = now()
WHERE id_protocole = 'ACT-0084';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement / Usure / Infection PTG',
  definition_expert = 'Intervention majeure consistant à remplacer une prothèse de genou défaillante. Implique l''ablation des implants scellés (temps difficile nécessitant ostéotomes, pointes ultrasoniques), la gestion des pertes de substance osseuse (reconstruction par cales métalliques augments ou greffe osseuse massive) et la pose d''une nouvelle prothèse de révision, souvent plus contrainte (charnière ou semi-charnière type CCK) avec des quilles d''extension dans les canaux médullaires fémoral et tibial pour compenser le stock osseux déficient.',
  synonymes_recherche = 'RGE | Reprise PTG | Prothèse Totale Genou | Changement | Revision | Septique | Aseptique | Descellement | Usure | Cale | Augment | Quille | Charnière | CCK | Constrained Condylar Knee | RHK | Rotating Hinge Knee | Infection | Spacer | Ciment | Antibiotique | Greffe',
  codes_ccam = 'NFKA002',
  libelles_sources_lies = 'Changement d''une prothèse tricompartimentaire du genou, avec reconstruction osseuse',
  proposition_nouvel_acte_label = 'Changement de prothèse totale de genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0085';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie par morsure animale',
  definition_expert = 'Urgence main fréquente. Les dents de chat inoculent profondément des germes virulents (Pasteurella, streptocoques) via de petites plaies punctiformes qui se referment vite (anaérobie). L''intervention est une exploration/parage : on rouvre les trajets, on excise les tissus dévitalisés et on lave abondamment. Souvent laissé ouvert. Antibiothérapie systématique (Augmentin).',
  synonymes_recherche = 'Morsure | Chat | Chien | Pasteurellose | Pasteurella | Infection | Phlegmon | Urgence main | Lavage | Exploration | Parage | Antibiothérapie | Augmentin | Plaie punctiforme | Capnocytophaga',
  codes_ccam = 'QCJA001',
  libelles_sources_lies = 'Exploration et parage de plaie par morsure',
  proposition_nouvel_acte_label = 'Parage et lavage de morsure',
  updated_at = now()
WHERE id_protocole = 'ACT-0086';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose digitale (IPP/IPD)',
  definition_expert = 'Blocage définitif d''une articulation de doigt (souvent l''Inter-Phalangienne Distale IPD douloureuse et déformée par l''arthrose de Heberden). L''articulation est résêquée (ablation des surfaces cartilagineuses) et fixée en position fonctionnelle (légère flexion 10-15°) par des broches axiales, une vis de compression (type Herbert) ou un implant intramédullaire. Permet de supprimer la douleur au prix de la perte de mobilité.',
  synonymes_recherche = 'Arthrodèse | Doigt | IPP | Interphalangienne Proximale | IPD | Interphalangienne Distale | Fusion | Blocage | Arthrose | Traumato | Raideur | Broche | Haubanage | Vis | X-fuse | Agrafe à mémoire | Main | Phalange',
  codes_ccam = 'MHDA005',
  libelles_sources_lies = 'Arthrodèse d''une articulation IP ou MCP d''un doigt',
  proposition_nouvel_acte_label = 'Arthrodese d''une articulation de doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0087';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hallux Rigidus (Arthrose MTP1)',
  definition_expert = 'Traitement de l''arthrose primitive de la base du gros orteil (Hallux Rigidus). Si arthrose débutante : Cheilectomie (rabotage des becs osseux). Si avancée : arthrodèse (fusion définitive) en position fonctionnelle, fixée par plaque dorsale ou vis. Alternative : prothèse MTP1 (controversée).',
  synonymes_recherche = 'Hallux Rigidus | Arthrodèse | Blocage | MTP1 (Métatarso-Phalangienne 1) | Fusion | Cheilectomie | Emondage | Ostéophytes | Raideur | Plaque | Vis | Agrafe | Scopie | Chaussage',
  codes_ccam = 'NHDA004',
  libelles_sources_lies = 'Arthrodèse de l''articulation métatarsophalangienne du premier orteil',
  proposition_nouvel_acte_label = 'Arthrodèse ou arthroplastie pour hallux rigidus',
  updated_at = now()
WHERE id_protocole = 'ACT-0088';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Gonarthrose unicompartimentaire',
  definition_expert = 'Arthroplastie partielle du genou ne remplaçant que le compartiment usé (médial ou latéral), en conservant ligaments croisés et compartiment sain. Indications strictes : arthrose unicompartimentaire isolée, ligaments intacts, déformation <15°. Mini-invasif, récupération plus rapide ("genou oublié"). Contre-indiquée si atteinte bi/tri-compartimentaire ou rupture du LCA.',
  synonymes_recherche = 'PUC (Prothèse Unicompartimentaire) | Uni | Partielle | Interne | Externe | Hémi-prothèse | Mini-invasif | Resurfaçage | Oxford | Zimmer | Arthrose localisée | Compartiment | Ciment | Sans ciment | Mako | Robot',
  codes_ccam = 'NFKA006',
  libelles_sources_lies = 'Remplacement de l''articulation du genou par prothèse unicompartimentaire fémorotibiale',
  proposition_nouvel_acte_label = 'Arthroplastie unicompartimentaire (PUC)',
  updated_at = now()
WHERE id_protocole = 'ACT-0089';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Griffe d''orteil fixée',
  definition_expert = 'Correction définitive d''une déformation d''orteil (griffe fixée). L''articulation est réséquée et les deux phalanges sont fusionnées en rectitude. Fixation par broche axiale (qui dépasse temporairement) ou implant intra-médullaire moderne (invisible type SmartToe).',
  synonymes_recherche = 'Arthrodèse | Orteil | IPP (Interphalangienne Proximale) | IPD (Interphalangienne Distale) | Griffe | Marteau | Fusion | Broche | Implant | SmartToe | Memofix | Pied | Cor | Durillon',
  codes_ccam = 'NHDA004',
  libelles_sources_lies = 'Arthrodèse d''une articulation interphalangienne d''un orteil',
  proposition_nouvel_acte_label = 'Arthrodèse d''une articulation d''orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0091';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Épanchement / Suspicion infection hanche',
  definition_expert = 'Geste diagnostique ou évacuateur indispensable devant une suspicion d''infection de prothèse de hanche. Réalisé sous contrôle radioscopique strict (amplificateur de brillance) pour être sûr d''être intra-articulaire. Utilise une aiguille longue (spinal ou trocart) introduite par voie antérieure ou latérale. Le liquide ponctionné est envoyé en analyse bactériologique urgente (culture, PCR) et cytologique (numération leucocytaire).',
  synonymes_recherche = 'Ponction | Hanche | Liquide articulaire | Infection | Septique | Prothèse douloureuse | Prélèvement | Bactério | Cytologie | Scopie | Aiguille longue | Trocart',
  codes_ccam = 'NZHH004',
  libelles_sources_lies = 'Ponction ou cytoponction d''une articulation du membre inférieur, par voie transcutanée avec guidage radiologique',
  proposition_nouvel_acte_label = 'Ponction articulaire de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0090';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie calcifiante',
  definition_expert = 'Traitement d''une tendinopathie calcifiante rebelle. Sous arthroscopie, le chirurgien repère le dépôt calcique dans le tendon (aspect "dentifrice" ou "craie"), l''incise à l''aiguille et l''évacue à la curette ou au shaver. Lavage abondant pour éliminer les micro-cristaux irritants.',
  synonymes_recherche = 'Calcification | Tendinite calcifiante | Supra-épineux | Coiffe | Lavage | Exérèse | Trituration | Arthro | Epaule | Curette | Shaver | Nuage crayeux | Pasta | Aiguille | Needling',
  codes_ccam = 'MEMC005',
  libelles_sources_lies = 'Évacuation de calcification de l''articulation scapulohumérale, par arthroscopie',
  proposition_nouvel_acte_label = 'Évacuation de calcification de la coiffe',
  updated_at = now()
WHERE id_protocole = 'ACT-0092';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du scaphoïde (Fraîche)',
  definition_expert = 'Vissage d''une fracture du scaphoïde par une petite incision (percutané). La vis en compression permet de stabiliser la fracture sans ouvrir le foyer.',
  synonymes_recherche = 'Scaphoïde | Poignet | Vis | Percutané | Compressive | Herbert | Bold | Twinfix | Fracture | Retrograde | Anterograde',
  codes_ccam = 'MDEP001',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''os scaphoïde [naviculaire], par voie percutanée',
  proposition_nouvel_acte_label = 'Ostéosynthèse scaphoïde (Vis percutanée)',
  updated_at = now()
WHERE id_protocole = 'ACT-0093';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Névrome de Morton (Métatarsalgies)',
  definition_expert = 'Ablation d''un renflement nerveux douloureux (névrome) situé entre les têtes métatarsiennes (souvent entre le 3ème et 4ème orteil). L''intervention (neurectomie) supprime la douleur mais entraîne une anesthésie définitive de la commissure des orteils concernés. Alternative : neurolyse (libération sans section).',
  synonymes_recherche = 'Morton | Névrome | Metatarsalgies | Pied | Nerf plantaire | 3ème espace | 2ème espace | Brûlure | Décharge électrique | Exérèse | Neurolyse | Neurectomie | Commissure | Intermétatarsien',
  codes_ccam = 'AHFA004',
  libelles_sources_lies = 'Exérèse de lésion d''un nerf digital plantaire',
  proposition_nouvel_acte_label = 'Exérèse de névrome de Morton',
  updated_at = now()
WHERE id_protocole = 'ACT-0094';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité antérieure épaule (Bankart)',
  definition_expert = 'Intervention de stabilisation pour instabilité antérieure de l''épaule (luxations récidivantes) sans gros dégâts osseux. Consiste à réinsérer le bourrelet glénoïdien (labrum) arraché (Lésion de Bankart) sur le bord de la glène à l''aide d''ancres et de fils, retendant ainsi les ligaments. Sous arthroscopie, 3-4 ancres habituellement.',
  synonymes_recherche = 'Bankart | Labrum | Bourrelet | Instabilité | Luxation | Epaule | Réinsertion | Ancre | Fil | Knotless | Arthro | Sport | Capsulorraphie | SLAP (Superior Labrum Anterior Posterior)',
  codes_ccam = 'MEMC002',
  libelles_sources_lies = 'Stabilisation de l''articulation scapulohumérale, par arthroscopie',
  proposition_nouvel_acte_label = 'Réparation de Bankart sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0095';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrofibrose / Raideur genou post-op',
  definition_expert = 'Geste réalisé au bloc opératoire pour vaincre une raideur importante du genou (arthrofibrose) survenant après une chirurgie (PTG, ligamentoplastie LCA) ou un traumatisme. Le chirurgien force progressivement la flexion du genou sous anesthésie générale profonde (curarisation) pour rompre les adhérences fibreuses intra-articulaires et capsulaires (craquement audible) et récupérer de l''amplitude. Risque de fracture si force excessive, nécessite radioscopie de contrôle.',
  synonymes_recherche = 'Mobilisation | Raideur | Arthrofibrose | Arthofibrose | Flexion | Adhérence | Bris | Force | Anesthésie | Post-op | Post-opératoire | PTG | Prothèse Totale Genou | Ligament | Récupération | Amplitude | Craquement',
  codes_ccam = 'NFMP001',
  libelles_sources_lies = 'Libération mobilisatrice de l''articulation du genou',
  proposition_nouvel_acte_label = 'Mobilisation du genou sous anesthésie générale',
  updated_at = now()
WHERE id_protocole = 'ACT-0096';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie calcifiante + Conflit sous-acromial',
  definition_expert = 'Intervention double traitant la cause du conflit (Acromioplastie : rabotage du bec osseux de l''acromion) et la conséquence douloureuse (Évacuation de la calcification intratendineuse). Association fréquente.',
  synonymes_recherche = 'Calcification | Acromioplastie | Décompression | Conflit | Coiffe | Combiné | Tendinite | Arthro | Epaule | Shaver | Vaporisateur | Fraise | Nettoyage',
  codes_ccam = 'MEMC005',
  libelles_sources_lies = 'Évacuation de calcification avec acromioplastie, par arthroscopie',
  proposition_nouvel_acte_label = 'Acromioplastie et évacuation de calcification',
  updated_at = now()
WHERE id_protocole = 'ACT-0097';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Nécrose / Traumatisme délabrant',
  definition_expert = 'Geste de dernier recours consistant à retirer un doigt non viable (nécrose, écrasement majeur, tumeur). L''objectif est de créer un moignon indolore et fonctionnel, avec couverture cutanée de bonne qualité (lambeau local) et section nette des nerfs (enfouis) pour éviter les névromes douloureux.',
  synonymes_recherche = 'Amputation | Doigt | Rayon | Phalange | Nécrose | Traumatisme | Section | Régularisation | Moignon | Lambeau | Hémostase | Main | Nerf | Névrome',
  codes_ccam = 'MZFA001',
  libelles_sources_lies = 'Amputation d''un rayon de la main',
  proposition_nouvel_acte_label = 'Amputation d''un doigt ou d''un rayon',
  updated_at = now()
WHERE id_protocole = 'ACT-0098';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hydarthrose / Hémarthrose',
  definition_expert = 'Geste fréquent réalisé en consultation ou aux urgences pour évacuer un épanchement de synovie (gonflement) ou soulager une douleur (hémarthrose sous tension). Permet aussi l''analyse du liquide (cristaux, germes) et l''infiltration thérapeutique.',
  synonymes_recherche = 'Ponction | Genou | Hydarthrose | Épanchement | Liquide | Citrin | Hémarthrose | Sang | Infiltration | Corticoïdes | Viscosupplémentation | Acide hyaluronique | Trocart',
  codes_ccam = 'NZHB002',
  libelles_sources_lies = 'Ponction ou cytoponction d''une articulation du membre inférieur, par voie transcutanée',
  proposition_nouvel_acte_label = 'Ponction évacuatrice ou diagnostique du genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0099';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Phlegmon des gaines / Infection main',
  definition_expert = 'Urgence infectieuse majeure. Infection bactérienne purulente de la gaine des tendons fléchisseurs ou des espaces celluleux de la main. Nécessite chirurgie immédiate : ouverture, prélèvement de pus, et lavage abondant par irrigation. Si retardée, risque de nécrose tendineuse et d''amputation fonctionnelle.',
  synonymes_recherche = 'Phlegmon | Gaine | Infection | Doigt | Urgence main | Lavage | Synoviale | Cathéter | Irrigation | Main | Hook | Crochet | Flexum | Espace de Parona | Thénar',
  codes_ccam = 'MJJA001',
  libelles_sources_lies = 'Évacuation de phlegmon de la main',
  proposition_nouvel_acte_label = 'Traitement chirurgical de phlegmon de la main',
  updated_at = now()
WHERE id_protocole = 'ACT-0100';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du plateau tibial',
  definition_expert = 'Fracture grave du genou touchant la surface articulaire. L''objectif est de relever l''enfoncement cartilagineux (souvent comblé par une greffe osseuse) et de soutenir le plateau par une plaque vissée de soutien (externe ou interne). La restitution de la planéité articulaire est cruciale pour éviter l''arthrose.',
  synonymes_recherche = 'Plateau tibial | Tibia | Genou | Articulaire | Schatzker | Enfoncement | Séparation | Plaque | Vis | Greffe osseuse | Relevage | Ménisque | Traumato | Ski | Accident',
  codes_ccam = 'NCCA007',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité proximale du tibia avec atteinte de la surface articulaire, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du plateau tibial',
  updated_at = now()
WHERE id_protocole = 'ACT-0101';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du col fémoral',
  definition_expert = 'Technique de conservation de la tête fémorale pour les fractures peu déplacées ou chez le sujet jeune. Consiste à visser le col fémoral (souvent 2 ou 3 vis parallèles) pour stabiliser la fracture sans ouvrir l''articulation. Les vis sont "perforées" (canulées) pour être guidées par une broche sous radioscopie.',
  synonymes_recherche = 'Vissage | Col fémoral | Garden 1 | Garden 2 | Non déplacée | Vis canulée | Vis perforée | Asnis | Synthes | Hanche | Conservateur | Percutané | Scopie | Urgence',
  codes_ccam = 'NBCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture du col fémoral par vis ou broches, à foyer ouvert',
  proposition_nouvel_acte_label = 'Vissage du col du fémur par vis perforées',
  updated_at = now()
WHERE id_protocole = 'ACT-0102';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Mallet Finger chronique',
  definition_expert = 'Technique chirurgicale pour traiter un "Mallet Finger" ancien (chronique) où le tendon extenseur est rompu et la peau distendue. Consiste à exciser une ellipse de peau et de tendon cicatriciel au dos du doigt et à suturer l''ensemble pour retendre l''appareil extenseur. Broche temporaire pour immobilisation.',
  synonymes_recherche = 'Ténodermodèse | Mallet Finger | Doigt en maillet | Chronique | Extenseur | DIP | IPD (Interphalangienne Distale) | Broche axiale | Brooks | Peau | Tendon | Main',
  codes_ccam = 'MJCA008',
  libelles_sources_lies = 'Ténodermodèse pour correction de mallet finger',
  proposition_nouvel_acte_label = 'Ténodermodèse pour doigt en maillet',
  updated_at = now()
WHERE id_protocole = 'ACT-0103';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hygroma pré-rotulien',
  definition_expert = 'Ablation de la bourse séreuse pré-rotulienne (devant la rotule) enflammée ou infectée. Fréquent chez les professions travaillant à genoux ("maladie du carreleur"). L''exérèse doit être complète pour éviter la récidive, cicatrisation parfois lente en zone de flexion.',
  synonymes_recherche = 'Hygroma | Bursite | Pré-rotulien | Genou | Carreleur | Tuméfaction | Liquide | Poche | Exérèse | Bistouri | Drain | Infection',
  codes_ccam = 'NFJA002',
  libelles_sources_lies = 'Exérèse d''un hygroma du genou, par abord direct',
  proposition_nouvel_acte_label = 'Exérèse de la bourse pré-rotulienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0105';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection prothèse / Arthrite septique',
  definition_expert = 'Intervention pour infection de prothèse de hanche ou arthrite septique native. Consiste à ouvrir l''articulation (arthrotomie), évacuer le liquide louche/purulent, réaliser une synovectomie (ablation des tissus infectés) et un lavage abondant (6 à 9 litres). Prélèvements multiples pour bactériologie.',
  synonymes_recherche = 'Lavage | Hanche | Arthrotomie | Septique | Infection | Reprise | Nettoyage | Synovectomie | Prélèvement | Bactério | Pus | Drainage | Urgence',
  codes_ccam = 'NEJC001',
  libelles_sources_lies = 'Nettoyage de l''articulation coxofémorale, par arthrotomie',
  proposition_nouvel_acte_label = 'Lavage articulaire de la hanche (Arthrotomie)',
  updated_at = now()
WHERE id_protocole = 'ACT-0104';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphyse tibiale',
  definition_expert = 'Ostéosynthèse d''une fracture de jambe par un clou intra-médullaire introduit par le genou (tendon rotulien). Permet une reprise d''appui précoce. "Foyer fermé" signifie qu''on n''ouvre pas la peau au niveau de la fracture pour ne pas abîmer la vascularisation (meilleure consolidation).',
  synonymes_recherche = 'Enclouage | Tibia | Diaphyse | Clou | T2 | Trigen | Verrouillage | Vis | Table orthopédique | Traction | Scopie | Alésage | Jambe | Traumato',
  codes_ccam = 'NCCB002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse du tibia par matériel centromédullaire, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse de tibia par clou',
  updated_at = now()
WHERE id_protocole = 'ACT-0106';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Radiculalgie (Sténose foraminale)',
  definition_expert = 'Libération chirurgicale de la racine nerveuse à sa sortie du canal rachidien (foramen intervertébral). Consiste à réséquer les éléments osseux (processus articulaire, uncus) et tissus mous (ligament jaune, ostéophytes) qui compriment le nerf. Réalisée sous microscope ou endoscopie, en préservant la stabilité rachidienne. Alternative moins invasive à l''arthrodèse.',
  synonymes_recherche = 'Foraminotomie | Trou de conjugaison | Foramen | Racine | Compression | Radiculalgie | Sciatique | NCB (Névralgie Cervico-Brachiale) | Cervicale | Lombaire | Recalibrage | Unilatéral | Fraise diamantée | Kerrison | Microscope | Endoscopie | Mini-invasif',
  codes_ccam = 'LFFA003',
  libelles_sources_lies = 'Libération de racine nerveuse par foraminotomie',
  proposition_nouvel_acte_label = 'Foraminotomie cervicale ou lombaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0107';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit sous-acromial + Tendinopathie Biceps',
  definition_expert = 'Intervention fréquente. L''acromioplastie traite le conflit osseux. La ténotomie du long biceps (section simple de son attache supérieure sur le bourrelet glénoidien) est réalisée si le tendon est dégénératif ou douloureux. Contrairement à la ténodèse, on ne le refixe pas (il descend un peu dans le bras, donnant parfois le signe de Popeye, mais soulage efficacement la douleur sans perte de force significative chez le sujet âgé).',
  synonymes_recherche = 'Acromioplastie | Ténotomie | Biceps | Section | LHB | Long Head Biceps | Simple section | Conflit | Coiffe | Arthro | Épaule | Shaver | Vaporisateur | Popeye sign',
  codes_ccam = 'MEMC003',
  libelles_sources_lies = 'Acromioplastie sans prothèse, par arthroscopie',
  proposition_nouvel_acte_label = 'Acromioplastie et ténotomie du long biceps (Arthro)',
  updated_at = now()
WHERE id_protocole = 'ACT-0108';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation acromio-claviculaire (Stade 3+)',
  definition_expert = 'Réparation chirurgicale d''une luxation entre la clavicule et l''acromion (Stade Rockwood 3, 4 ou 5). Consiste à réduire la clavicule à sa hauteur normale et à la fixer (stabilisation coraco-claviculaire) par des ligaments artificiels (Tightrope/Endobutton), une vis ou un transfert ligamentaire (Weaver-Dunn).',
  synonymes_recherche = 'Disjonction | Luxation AC (Acromio-Claviculaire) | Acromio-claviculaire | Touche de piano | Weaver-Dunn | Tightrope | Endobutton | Lasso | Ligamentoplastie | Brochage | Haubanage | Epaule | Traumato | Rockwood',
  codes_ccam = 'MJEA004',
  libelles_sources_lies = 'Réduction de luxation acromioclaviculaire avec stabilisation',
  proposition_nouvel_acte_label = 'Stabilisation acromio-claviculaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0110';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture / Tendinopathie Long Biceps',
  definition_expert = 'Ténodèse (réinsertion-fixation) du tendon du long biceps rompu ou pathologique (tendinopathie, SLAP lésion). Le tendon n''est pas suturé bout-à-bout mais fixé sur l''humérus : soit dans la gouttière bicipitale (keyhole, vis d''interférence), soit sous le tendon du grand pectoral (technique sous-pectorale). Souvent associée à réparation de coiffe. Alternative : ténotomie simple (section sans réinsertion).',
  synonymes_recherche = 'Ténodèse | Long Biceps | LHB (Long Head of Biceps) | Longue Portion du Biceps | Chef Long du Biceps | Réinsertion | Keyhole | Vis d''interférence | Ancre | Suture | Gouttière bicipitale | Sous-pectoral | Ciel ouvert | Abord delto-pectoral | Epaule | SLAP | Ténotomie',
  codes_ccam = 'MEMA008',
  libelles_sources_lies = 'Ténodèse du tendon du long biceps, par abord direct',
  proposition_nouvel_acte_label = 'Ténodèse du long biceps (Épaule)',
  updated_at = now()
WHERE id_protocole = 'ACT-0109';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement / Usure prothèse épaule',
  definition_expert = 'Chirurgie lourde de remplacement d''une prothèse d''épaule défaillante. Nécessite souvent l''extraction difficile d''implants bien fixés, la gestion du stock osseux déficient (glène détruite nécessitant greffe osseuse) et l''utilisation d''implants de révision (tiges longues, embases glénoïdiennes augmentées ou greffes structurales). Pronostic fonctionnel réservé.',
  synonymes_recherche = 'Changement PTE | Prothèse Totale Épaule | Reprise | Revision | Épaule | Descellement | Infection | Usure | Glène | Humérus | Inversée | Longue tige | Greffe',
  codes_ccam = 'MEKA002',
  libelles_sources_lies = 'Changement d''une prothèse scapulohumérale',
  proposition_nouvel_acte_label = 'Changement de prothèse d''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0111';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture tête radiale',
  definition_expert = 'Fixation d''une fracture de la tête du radius (coude) classée selon Mason. Mason 1 : traitement fonctionnel ; Mason 2 : ostéosynthèse par mini-vis (enfouies type Herbert) ou mini-plaque ; Mason 3 comminutive : prothèse de tête radiale. Positionnement impératif dans la "zone de sécurité" (arc postéro-latéral) pour ne pas gêner la pronosupination.',
  synonymes_recherche = 'Tête radiale | Radius | Coude | Mason | Mason 1 | Mason 2 | Mason 3 | Vissage | Mini-vis | Herbert | Plaque | Safe zone | Zone de sécurité | Pronosupination | Blocage | Chute | Terrible triad',
  codes_ccam = 'MCCA002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité proximale du radius, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse ou prothèse de tête radiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0112';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de l''olécrane',
  definition_expert = 'Technique d''ostéosynthèse dynamique utilisée pour les fractures de l''olécrane (la pointe du coude). Transforme les forces de traction du triceps en forces de compression du foyer de fracture. Utilise deux broches parallèles et un fil d''acier en "8" (cerclage).',
  synonymes_recherche = 'Haubanage | Olécrane | Coude | Ulna | Cubitus | Fracture | Broches | Cerclage | Fil d''acier | Moteur | Pince coupante | Traumato | Chute',
  codes_ccam = 'MCCA001',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité proximale de l''ulna, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse par haubannage (Olécrane)',
  updated_at = now()
WHERE id_protocole = 'ACT-0113';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhumatisme inflammatoire / Infection gaine',
  definition_expert = 'Nettoyage chirurgical des gaines tendineuses envahies par tissu inflammatoire (pannus synovial). Indiqué dans les rhumatismes inflammatoires (polyarthrite rhumatoïde) ou infections chroniques. Consiste à peler minutieusement la synoviale pathologique autour des tendons pour prévenir leur rupture. Souvent associé à libération du canal carpien ou résection tête ulnaire.',
  synonymes_recherche = 'Synovectomie | Ténosynovectomie | Fléchisseurs | Extenseurs | Main | Poignet | Polyarthrite | PR (Polyarthrite Rhumatoïde) | Rhumatoïde | Inflammation | Gaine | Pannus | Canal carpien | Rupture tendineuse | Caput ulnae',
  codes_ccam = 'MJPA003',
  libelles_sources_lies = 'Synovectomie des gaines tendineuses de la main',
  proposition_nouvel_acte_label = 'Ténosynovectomie (Poignet/Main)',
  updated_at = now()
WHERE id_protocole = 'ACT-0114';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation de prothèse de hanche',
  definition_expert = 'Geste d''urgence pour réduire (remettre en place) une prothèse de hanche luxée. Réalisé sous sédation/AG par manœuvres externes. Contrôle scopique. Recherche de cause (malposition implant, conflit prothétique).',
  synonymes_recherche = 'Luxation | PTH (Prothèse Totale Hanche) | Prothèse | Réduction | Urgence | Déboîtée | Manœuvre | Traction | Sédation | AG | Scopie | Coque | Anti-luxation',
  codes_ccam = 'NEEP002',
  libelles_sources_lies = 'Réduction orthopédique d''une luxation de prothèse de hanche',
  proposition_nouvel_acte_label = 'Réduction de luxation de hanche (Prothèse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0115';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie calcifiante',
  definition_expert = 'Ablation arthroscopique d''un dépôt calcique dans la coiffe des rotateurs. Technique de needling (multiple ponctions) et trituration pour évacuer le contenu calcaire.',
  synonymes_recherche = 'Calcification | Épaule | Arthro | Lavage | Coiffe | Tendinite | Supra-épineux | Needling | Trituration',
  codes_ccam = 'MEMC005',
  libelles_sources_lies = 'Évacuation de calcification de l''articulation scapulohumérale, par arthroscopie',
  proposition_nouvel_acte_label = 'Exérèse de calcification (Épaule)',
  updated_at = now()
WHERE id_protocole = 'ACT-0116';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie d''Achille chronique',
  definition_expert = 'Technique chirurgicale pour les tendinopathies chroniques d''Achille corporéales (gros tendon douloureux sans rupture). Consiste à réaliser de multiples incisions longitudinales ("peignage") dans le tendon pour stimuler l''hypervascularisation et la cicatrisation.',
  synonymes_recherche = 'Peignage | Achille | Tendinopathie | Corporéal | Nodule | Épaississement | Incisions | Lanières | Vascularisation | Décubitus ventral | Sport | Chronique | Néovascularisation',
  codes_ccam = 'NFMA011',
  libelles_sources_lies = 'Peignage du tendon calcanéen, par abord direct',
  proposition_nouvel_acte_label = 'Ténoplastie du tendon d''Achille (Peignage)',
  updated_at = now()
WHERE id_protocole = 'ACT-0117';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon quadricipital',
  definition_expert = 'Réparation d''une rupture du tendon du quadriceps (au-dessus de la rotule). Le tendon est réinséré sur le pôle supérieur de la rotule par points trans-osseux ou ancres. Suture solide type Krackow. Immobilisation stricte (attelle en extension) pour protéger la réparation.',
  synonymes_recherche = 'Quadriceps | Rupture | Tendon | Sus-rotulien | Réinsertion | Trans-osseux | Ancres | Fils | Krackow | Genou | Chute | Sujet âgé | Extension | Rotule | Pôle supérieur',
  codes_ccam = 'NJEA002',
  libelles_sources_lies = 'Réinsertion du tendon du muscle quadriceps fémoral',
  proposition_nouvel_acte_label = 'Réparation du tendon quadricipital',
  updated_at = now()
WHERE id_protocole = 'ACT-0120';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture distale du biceps brachial',
  definition_expert = 'Réparation de la rupture du tendon distal du biceps au pli du coude. Le tendon rétracté dans le bras doit être récupéré et ré-ancré sur la tubérosité du radius par bouton cortical (Endobutton), ancre ou vis d''interférence. Restaure la force de flexion et surtout de supination. Attention au nerf interosseux postérieur.',
  synonymes_recherche = 'Biceps distal | Coude | Rupture | Tubérosité bicipitale | Radius | Ancre | Endobutton | Cortical Button | Double abord | Boyd-Anderson | Abord unique | Hook test | Force en supination | Popeye inversé',
  codes_ccam = 'MFMA004',
  libelles_sources_lies = 'Réinsertion du tendon distal du muscle biceps brachial, par abord direct',
  proposition_nouvel_acte_label = 'Réinsertion du biceps distal au coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0119';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit fémoro-acétabulaire / Labrum',
  definition_expert = 'Chirurgie mini-invasive de la hanche en plein essor. Indiquée pour les conflits fémoro-acétabulaires ou FAI (rabotage des bosses osseuses Cam sur le col fémoral ou correction de la sur-couverture acétabulaire Pincer) et les lésions du labrum acétabulaire (suture par ancres). Nécessite une table de traction spécifique pour décoapter l''articulation profonde et introduire l''optique. Chirurgie techniquement exigeante nécessitant une courbe d''apprentissage longue. Permet d''éviter la progression vers l''arthrose chez le jeune sportif.',
  synonymes_recherche = 'Arthro Hanche | FAI | Conflit Fémoro-Acétabulaire | Came | Cam | Pince | Pincer | Labrum | Suture labrale | Traction | Table orthopédique | Chondropathie | Synovectomie | Sport | Effet tenaille',
  codes_ccam = 'NEQC001',
  libelles_sources_lies = 'Exploration de l''articulation coxofémorale, par arthroscopie',
  proposition_nouvel_acte_label = 'Exploration de hanche sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0118';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome des loges aigu',
  definition_expert = 'Urgence absolue. Décompression chirurgicale des loges musculaires de la jambe (antérieure, externe, postérieures) suite à augmentation brutale de pression (hématome, écrasement, fracture) bloquant la vascularisation. Consiste à ouvrir largement les aponévroses (fasciotomie) sur toute la longueur. Peau souvent laissée ouverte (cicatrisation dirigée ou greffe secondaire).',
  synonymes_recherche = 'Loges | Syndrome des loges | Décharge | Aponévrotomie | Fasciotomie | Hyperpression | Ischémie | Urgence | Jambe | Crush syndrome | Compartiment | Nécrose musculaire',
  codes_ccam = 'NCPA002',
  libelles_sources_lies = 'Aponévrotomie de décharge de la jambe, par abord direct',
  proposition_nouvel_acte_label = 'Aponévrotomie de décharge (Loges)',
  updated_at = now()
WHERE id_protocole = 'ACT-0123';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pathologie Long Biceps (Tendinopathie/SLAP)',
  definition_expert = 'Geste consistant à fixer le tendon du long biceps (souvent pathologique : tendinopathie, SLAP) sur l''humérus pour soulager la douleur tout en gardant la force. Réalisé sous arthroscopie à l''aide d''ancres ou de vis d''interférence. Alternative : ténotomie simple (section sans fixation).',
  synonymes_recherche = 'Ténodèse | Biceps | LHB (Long Head of Biceps) | Longue Portion du Biceps | Arthro | Ancre | Vis | Supra-pectoral | Gouttière | Lasso | Knotless | Tenodesis | Epaule | Coiffe | SLAP',
  codes_ccam = 'MEMA008',
  libelles_sources_lies = 'Ténodèse du tendon du long biceps, par arthroscopie',
  proposition_nouvel_acte_label = 'Ténodèse du long biceps sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0122';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du Ligament Croisé Antérieur (LCA)',
  definition_expert = 'Technique "Gold Standard" historique de reconstruction du LCA. Consiste à prélever le tiers central du tendon rotulien avec deux baguettes osseuses (rotule et tibia) pour remplacer le ligament rompu. Fixation très solide (Os contre Os) par vis d''interférence dans les tunnels. Cicatrice antérieure verticale sur le genou. Privilégiée pour sportifs de pivot/contact.',
  synonymes_recherche = 'KJ (Kenneth-Jones) | Kenneth Jones | LCA (Ligament Croisé Antérieur) | Ligamentoplastie | Tendon Rotulien | Barrette osseuse | Os-Tendon-Os | OTO | Genou | Sport | Pivot | Instabilité | Vis d''interférence | Arthroscopie | Mèche | Scie oscillante',
  codes_ccam = 'NFMC003',
  libelles_sources_lies = 'Reconstruction du ligament croisé antérieur du genou par autogreffe de tendon rotulien',
  proposition_nouvel_acte_label = 'Reconstruction du LCA (Kenneth-Jones)',
  updated_at = now()
WHERE id_protocole = 'ACT-0121';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de la rotule (Patella)',
  definition_expert = 'Réparation d''une fracture de la rotule (patella) qui interrompt l''appareil extenseur du genou. La technique de référence est le haubanage (2 broches parallèles et un fil d''acier en 8) qui transforme les forces de traction en compression. Indispensable pour récupérer l''extension active.',
  synonymes_recherche = 'Rotule | Patella | Haubanage | Fil d''acier | Broches | Cerclage | Vissage | Comminutive | Transversale | Appareil extenseur | Genou | Chute',
  codes_ccam = 'NFCA002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la patella [rotule], à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de rotule (Haubannage)',
  updated_at = now()
WHERE id_protocole = 'ACT-0125';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique',
  definition_expert = 'Urgence infectieuse de la main. Infection aiguë d''une articulation digitale (arthrite septique) détruisant rapidement le cartilage articulaire par les enzymes bactériennes. L''intervention consiste à ouvrir l''articulation par arthrotomie (abord latéral ou dorsal), laver abondamment au sérum et retirer la synoviale infectée inflammatoire (synovectomie) pour sauver la fonction articulaire. Prélèvements bactériologiques multiples et antibiothérapie intraveineuse probabiliste immédiate.',
  synonymes_recherche = 'Arthrite | Septique | Infection | Doigt | IPP | Interphalangienne Proximale | MCP | Métacarpophalangienne | Pus | Lavage | Synovectomie | Morsure | Épine | Urgence main | Prélèvement | Main',
  codes_ccam = 'MHJA001',
  libelles_sources_lies = 'Synovectomie d''une articulation métacarpophalangienne ou interphalangienne',
  proposition_nouvel_acte_label = 'Lavage articulaire et nettoyage de doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0124';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon extenseur / Mallet Finger osseux',
  definition_expert = 'Traitement chirurgical d''un "Mallet Finger" osseux (arrachement de l''insertion du tendon extenseur avec fragment d''os) ou d''une rupture distale. Le tendon est réinséré sur P3 par points trans-osseux, ancre ou système Pull-out. Broche temporaire de protection.',
  synonymes_recherche = 'Mallet Finger | Extenseur | Doigt | Phalange | Arrachement | Tuile osseuse | Pull-out | Bouton | Broche | Attelle | Trans-osseux | Ancre | IPD (Interphalangienne Distale)',
  codes_ccam = 'MJEA004',
  libelles_sources_lies = 'Réinsertion transosseuse de tendon sur une phalange d''un doigt',
  proposition_nouvel_acte_label = 'Suture ou réinsertion de tendon extenseur',
  updated_at = now()
WHERE id_protocole = 'ACT-0126';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture métatarsien / Phalange',
  definition_expert = 'Ostéosynthèse des fractures des métatarsiens (ex: fracture de Jones du 5ème méta) ou des phalanges. Nécessite une réduction précise pour préserver l''appui plantaire. Fixation par vis intra-médullaire, plaque ou broche selon la localisation.',
  synonymes_recherche = 'Pied | Métatarsien | Jones | M5 | Lisfranc | Ecrasement | Phalange | Orteil | Plaque | Vis | Broche | Avant-pied | Traumato',
  codes_ccam = 'NDCA002',
  libelles_sources_lies = 'Ostéosynthèse de fracture d''un métatarsien ou d''une phalange d''orteil, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse d''os du pied',
  updated_at = now()
WHERE id_protocole = 'ACT-0128';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Entorse grave chronique (Instabilité)',
  definition_expert = 'Traitement des entorses graves chroniques de la métacarpo-phalangienne du pouce (instabilité chronique). Le ligament latéral interne LLI rompu et incompétent est reconstruit à l''aide d''une greffe tendineuse (prélevée sur le long palmaire ou tendon ischio-jambier) passée dans des tunnels osseux pour stabiliser la pince pouce-index et restaurer la force de préhension.',
  synonymes_recherche = 'Ligamentoplastie | Pouce | MCP | Métacarpophalangienne | LLI | Ligament Latéral Interne | UCL | Ulnar Collateral Ligament | Skier''s thumb | Pouce du skieur | Greffe | Tendon | Long palmaire | Ancre | Instabilité | Chronique',
  codes_ccam = 'MHMA002',
  libelles_sources_lies = 'Reconstruction de l''appareil capsuloligamentaire de l''articulation métacarpophalangienne du pouce par autogreffe ou allogreffe, par abord direct',
  proposition_nouvel_acte_label = 'Reconstruction ligamentaire du pouce',
  updated_at = now()
WHERE id_protocole = 'ACT-0127';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture jambe (Tibia)',
  definition_expert = 'Traitement "Gold Standard" des fractures de jambe. Introduction d''un clou en titane dans le canal médullaire du tibia par une incision au genou (tendon rotulien). Le "foyer fermé" (pas d''ouverture de la fracture) garantit une meilleure consolidation. Nécessite un alésage du canal et un verrouillage par vis distales et proximales.',
  synonymes_recherche = 'Enclouage | Tibia | Diaphyse | Clou | Trigen | T2 | Expert | Verrouillage | Vis | Alésage | Table orthopédique | Traction | Scopie | Jambe',
  codes_ccam = 'NCCB002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse du tibia par matériel centromédullaire, à foyer fermé',
  proposition_nouvel_acte_label = 'Ostéosynthèse de tibia (Plaque/Clou)',
  updated_at = now()
WHERE id_protocole = 'ACT-0130';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Douleurs neuropathiques chroniques',
  definition_expert = 'Implantation d''un système de stimulation électrique de la moelle épinière pour traiter les douleurs neuropathiques chroniques rebelles (SDRC, radiculalgies post-chirurgicales). L''électrode est glissée dans l''espace épidural postérieur sous contrôle radioscopique et reliée à un générateur (pile) implanté sous la peau (fesse ou abdomen). La stimulation électrique module la transmission de la douleur.',
  synonymes_recherche = 'Neurostimulateur | SCS | Spinal Cord Stimulation | Électrode | Médullaire | Douleur chronique | SDRC | Syndrome Douloureux Régional Complexe | Algoneurodystrophie | Radiculalgie | Paddle | Générateur | Pile | Boîtier',
  codes_ccam = 'AZLA001',
  libelles_sources_lies = 'Implantation neurostimulateur médullaire',
  proposition_nouvel_acte_label = 'Implantation de neurostimulateur médullaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0129';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste mucoïde (Doigt)',
  definition_expert = 'Kyste spécifique de la dernière articulation du doigt (IPD), lié à l''arthrose. Déforme souvent la matrice de l''ongle (sillon). L''exérèse doit emporter le kyste, la peau très fine en regard (souvent remplacée par un lambeau de rotation) et surtout l''ostéophyte (bec osseux) sous-jacent pour éviter la récidive.',
  synonymes_recherche = 'Kyste mucoïde | Doigt | IPD (Interphalangienne Distale) | Dernière phalange | Ongle | Sillon | Bec de perroquet | Ostéophyte | Exérèse | Lambeau | Dermato | Main | Plastie | Arthrose',
  codes_ccam = 'MHFA002',
  libelles_sources_lies = 'Exérèse de kyste mucoïde articulaire du doigt',
  proposition_nouvel_acte_label = 'Exérèse de kyste mucoïde de doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0131';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon extenseur (Zone 1)',
  definition_expert = 'Déformation du doigt avec chute de la dernière phalange (P3) en flexion, due à la rupture du tendon extenseur (Zone 1). La chirurgie est indiquée en cas d''échec du traitement orthopédique (attelle 6 semaines) ou de fracture arrachement >30%. Consiste à réinsérer le tendon ou le fragment osseux sur P3, protégé par une broche temporaire.',
  synonymes_recherche = 'Mallet Finger | Doigt en maillet | Extenseur | Rupture | Chute | Phalange | P3 | IPD (Interphalangienne Distale) | Broche | Arthrorise | Attelle | Tuile osseuse | Pull-out | Main | Zone 1',
  codes_ccam = 'MJEA004',
  libelles_sources_lies = 'Réinsertion de l''appareil extenseur de l''articulation interphalangienne distale',
  proposition_nouvel_acte_label = 'Réparation de doigt en maillet',
  updated_at = now()
WHERE id_protocole = 'ACT-0132';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture itérative du LCA (Echec)',
  definition_expert = 'Chirurgie complexe de reconstruction du LCA après échec d''une première plastie. Nécessite souvent de gérer les anciens tunnels osseux (comblement par greffe si élargis), d''enlever le vieux matériel (vis/boutons) et de prélever un nouveau greffon (Tendon rotulien controlatéral, Quadriceps, ou fascia lata). Souvent associée à une ténodèse latérale (Lemaire/ALL).',
  synonymes_recherche = 'Reprise LCA | Révision | Itérative | Echec | Rupture itérative | Plastie | Reconstruction | Tunnels | DT4 | KJ (Kenneth-Jones) | Tendon quadricipital | Lemaire | ALL (Antéro-Latéral Ligament) | Genou | Comblement tunnel | Greffe osseuse',
  codes_ccam = 'NFMC003',
  libelles_sources_lies = 'Reconstruction itérative du ligament croisé antérieur du genou',
  proposition_nouvel_acte_label = 'Révision de ligamentoplastie du LCA',
  updated_at = now()
WHERE id_protocole = 'ACT-0133';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation du coude (Traumatique)',
  definition_expert = 'Geste d''urgence pour réduire une perte de contact complète des surfaces articulaires du coude (humérus et ulna). Réalisé sous sédation par manœuvres externes (traction dans l''axe). Nécessite contrôle radiologique, testing de la stabilité et immobilisation. Rechercher lésions associées (terrible triad).',
  synonymes_recherche = 'Luxation | Coude | Réduction | Urgence | Instabilité | Postéro-externe | Manœuvre | Traction | Sédation | Radio | Attelle | Brachio-anté-brachiale | BAB',
  codes_ccam = 'MFEP001',
  libelles_sources_lies = 'Réduction orthopédique de luxation du coude',
  proposition_nouvel_acte_label = 'Réduction de luxation de coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0135';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Spondylolisthésis / Instabilité vertébrale',
  definition_expert = 'Intervention visant à fusionner deux vertèbres lombaires qui glissent l''une sur l''autre (spondylolisthésis). Consiste à libérer les nerfs (foraminotomie), réduire le glissement si possible, et fixer les vertèbres par vis pédiculaires reliées par tiges. Souvent complétée par une cage intersomatique (TLIF/PLIF).',
  synonymes_recherche = 'Arthrodèse | Lombaire | Spondylolisthésis | Glissement | Vis pédiculaires | Tiges | Greffe | Cage | TLIF (Transforaminal Lumbar Interbody Fusion) | PLIF (Posterior Lumbar Interbody Fusion) | Canal étroit | Rachis | Réduction | L4-L5 | L5-S1',
  codes_ccam = 'LFCA001',
  libelles_sources_lies = 'Arthrodèse lombaire ou lombo-sacrée par abord postérieur avec ostéosynthèse',
  proposition_nouvel_acte_label = 'Arthrodèse vertébrale par abord postérieur',
  updated_at = now()
WHERE id_protocole = 'ACT-0134';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose / Fracture complexe du coude',
  definition_expert = 'Remplacement de l''articulation du coude par un implant articulé (charnière) ou semi-contraint. Indiqué pour les fractures comminutives inopérables de la palette humérale chez le sujet âgé ou pour la destruction articulaire sévère (polyarthrite rhumatoïde, arthrose post-traumatique). Permet de récupérer une flexion/extension fonctionnelle pour les activités de la vie quotidienne. Installation en décubitus dorsal, voie d''abord postérieure avec transposition du nerf ulnaire systématique.',
  synonymes_recherche = 'PTE | Prothèse Coude | Prothèse Totale Coude | Totale | Semi-contrainte | Coonrad-Morrey | Latitude | Fracture palette | Polyarthrite | Humérus | Ulna | Charnière | Ciment | Implant coude',
  codes_ccam = 'MFKA003',
  libelles_sources_lies = 'Remplacement de l''articulation du coude par prothèse totale',
  proposition_nouvel_acte_label = 'Arthroplastie totale du coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0136';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ongle incarné / Traumatisme / Hématome',
  definition_expert = 'Retrait chirurgical de l''ongle (total ou partiel) sous anesthésie locale. Indiqué pour traumatisme avec hématome sous-unguéal, infection péri-unguéale ou geste préalable à une chirurgie de la matrice.',
  synonymes_recherche = 'Ongle | Exérèse | Avulsion | Panaris | Hématome sous-unguéal | Matrice | Doigt | Orteil',
  codes_ccam = 'QZFA020',
  libelles_sources_lies = 'Avulsion de la tablette unguéale',
  proposition_nouvel_acte_label = 'Avulsion de la tablette unguéale',
  updated_at = now()
WHERE id_protocole = 'ACT-0138';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal cubital au coude',
  definition_expert = 'Neurolyse du nerf cubital (ulnaire) comprimé au coude. L''intervention consiste à sectionner l''arcade d''Osborne et les structures fibreuses qui étranglent le nerf. Si le nerf "saute" (instable), on réalise une transposition antérieure.',
  synonymes_recherche = 'Nerf cubital | Nerf ulnaire | Canal cubital | Gouttière épitrochléo-olécranienne | Paresthésies | 4ème doigt | 5ème doigt | Neurolyse | Transposition | Microscope | Osborne | Arcade',
  codes_ccam = 'AHPA022',
  libelles_sources_lies = 'Libération du nerf ulnaire au coude, par abord direct',
  proposition_nouvel_acte_label = 'Libération du nerf ulnaire au coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0137';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture péri-prothétique fémur',
  definition_expert = 'Traitement complexe d''une fracture du fémur survenant autour d''une prothèse de hanche (Fracture péri-prothétique). Si la prothèse est stable (Vancouver B1), ostéosynthèse par plaque verrouillée (LCP) avec cerclages (câbles) autour de la tige prothétique. Si prothèse descellée (B2/B3) : changement de tige fémorale de révision.',
  synonymes_recherche = 'Péri-prothétique | Vancouver | Fémur | Prothèse | Plaque | Câbles | Cerclage | Plaque verrouillée | LCP (Locking Compression Plate) | Reconstruction | PTH (Prothèse Totale Hanche) | Hanche',
  codes_ccam = 'NBCB014',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse du fémur, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture péri-prothétique',
  updated_at = now()
WHERE id_protocole = 'ACT-0140';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hallux Valgus (Déformation)',
  definition_expert = 'Section chirurgicale du premier métatarsien pour modifier son axe et corriger l''hallux valgus. Techniques principales : Scarf (ostéotomie en Z diaphysaire), Chevron (V distal). Fixation par vis de compression. Note : Terme source générique mappé sur l''acte le plus fréquent.',
  synonymes_recherche = 'Ostéotomie | Scarf | Chevron | Métatarsien | M1 | Correction | Axe | Scie | Moteur | Plaque | Vis | Hallux | Pied | Avant-pied',
  codes_ccam = 'NDPA001',
  libelles_sources_lies = 'Ostéotomie du premier métatarsien',
  proposition_nouvel_acte_label = 'Ostéotomie correctrice métatarsienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0139';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose digitale / Rhumatisme',
  definition_expert = 'Remplacement d''une articulation du doigt détruite par l''arthrose ou la polyarthrite rhumatoïde par un implant prothétique (silicone souple type Swanson pour MCP ou pyrocarbone rigide pour IPP). Permet de restaurer une mobilité articulaire partielle et l''alignement du doigt, contrairement à l''arthrodèse qui bloque définitivement. Indiqué surtout pour les articulations métacarpophalangiennes des doigts longs dans la polyarthrite.',
  synonymes_recherche = 'Prothèse | Doigt | IPP | Interphalangienne Proximale | MCP | Métacarpophalangienne | Silicone | Swanson | Pyrocarbone | Ascension | Arthrose | Main | Implant',
  codes_ccam = 'MHMA002',
  libelles_sources_lies = 'Remplacement de l''articulation IP ou MCP par prothèse',
  proposition_nouvel_acte_label = 'Arthroplastie d''articulation de doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0141';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie / SLAP lésion',
  definition_expert = 'Fixation du tendon du long biceps sur l''humérus pour traiter douleurs antérieures d''épaule ou lésions SLAP. Réalisé sous arthroscopie avec ancre ou vis d''interférence.',
  synonymes_recherche = 'Ténodèse | Biceps | LHB (Long Head of Biceps) | Longue Portion du Biceps | Arthro | Ancre | Vis | Gouttière | Knotless | Epaule | Coiffe | SLAP (Superior Labrum Anterior Posterior)',
  codes_ccam = 'MEMA008',
  libelles_sources_lies = 'Ténodèse du tendon du long biceps, par arthroscopie',
  proposition_nouvel_acte_label = 'Ténodèse du long biceps sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0143';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Nécrose / Gangrène / Infection osseuse',
  definition_expert = 'Ablation chirurgicale d''un orteil (ou d''une partie). Indiquée en cas de nécrose (diabète, artérite) ou d''infection osseuse non contrôlée. Le niveau de coupe dépend de la vitalité des tissus. La fermeture cutanée est un temps délicat (risque de désunion). Bilan vasculaire préalable.',
  synonymes_recherche = 'Amputation | Orteil | Nécrose | Gangrène | Diabète | Artérite | Septique | Ostéite | Désarticulation | MTP (Métatarso-Phalangienne) | IPP | IPD | Pied | AOMI (Artériopathie Oblitérante)',
  codes_ccam = 'NZFA010',
  libelles_sources_lies = 'Amputation d''orteil ou désarticulation métatarso-phalangienne',
  proposition_nouvel_acte_label = 'Amputation d''un orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0142';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Gonarthrose sur Genu Varum',
  definition_expert = 'Chirurgie conservatrice du genou (alternative à la prothèse) pour gonarthrose unicompartimentaire interne sur genu varum (jambes arquées). Consiste à couper le tibia sous le plateau et ouvrir le trait (ostéotomie d''addition médiale) pour transférer les contraintes vers le compartiment sain externe. Fixation par plaque verrouillée (Tomofix) +/- cale ou substitut osseux. Correction planifiée sur pangonogramme.',
  synonymes_recherche = 'OTV (Ostéotomie Tibiale de Valgisation) | HTO (High Tibial Osteotomy) | Ostéotomie | Valgisation | Genu Varum | Arthrose interne | Tibia | Ouverture interne | Fermeture externe | Cale | Plaque | Tomofix | Puddu | Conservation',
  codes_ccam = 'NCPA015',
  libelles_sources_lies = 'Ostéotomie d''addition de l''extrémité proximale du tibia',
  proposition_nouvel_acte_label = 'Ostéotomie tibiale d''addition (OTV)',
  updated_at = now()
WHERE id_protocole = 'ACT-0144';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur articulaire (Arthrofibrose)',
  definition_expert = 'Libération chirurgicale d''une articulation enraidie par fibrose (arthrofibrose). Consiste à sectionner les adhérences intra-articulaires, libérer les culs-de-sac synoviaux rétractés, réséquer le tissu cicatriciel (nodule cyclope si post-ligamentoplastie). Standard pour le genou : arthroscopie avec lavage abondant. Rééducation intensive immédiate indispensable pour maintenir le gain de mobilité.',
  synonymes_recherche = 'Arthrolyse | Raideur | Adhérences | Fibrose | Arthrofibrose | Cyclope (syndrome du) | Flexum | Mobilisation | Arthroscopie | Genou | Coude | Epaule | Synovectomie | Récupération amplitude | MUA (Mobilisation Under Anesthesia)',
  codes_ccam = 'NFPC001',
  libelles_sources_lies = 'Arthrolyse du genou, par arthroscopie',
  proposition_nouvel_acte_label = 'Libération articulaire (Arthrolyse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0145';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose scaphoïde (Non consolidation)',
  definition_expert = 'Traitement d''une fracture du scaphoïde non consolidée par technique combinée : avivement du foyer de pseudarthrose, insertion de greffon osseux (spongieux ou cortico-spongieux vascularisé si pôle proximal avasculaire), fixation par vis compressive (Herbert, Acutrak). Succès conditionné par la vascularisation du pôle proximal.',
  synonymes_recherche = 'Pseudarthrose | Scaphoïde | Greffe | Matti-Russe | Intercalaire | Os spongieux | Vissage | Vis Herbert | Vis Acutrak | Main | Crête iliaque | Radius | SNAC | Vascularisée',
  codes_ccam = 'MDEA002',
  libelles_sources_lies = 'Ostéosynthèse de pseudarthrose du scaphoïde avec greffe osseuse',
  proposition_nouvel_acte_label = 'Ostéosynthèse de scaphoïde avec greffe',
  updated_at = now()
WHERE id_protocole = 'ACT-0146';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Paralysie nerveuse / Rupture ancienne',
  definition_expert = 'Technique de "réanimation" de la main après paralysie nerveuse. Consiste à utiliser un tendon moteur sain (dont le muscle fonctionne) pour activer des fonctions paralysées. Exemple : transfert du FCU sur les extenseurs dans les paralysies radiales.',
  synonymes_recherche = 'Transfert | Tendon | Paralysie | Radial | Ulnaire | Médian | Main | Doigt | Réanimation | Greffe | Opposition | Extension | Flexion',
  codes_ccam = 'MJEA009',
  libelles_sources_lies = 'Transfert tendineux au membre supérieur',
  proposition_nouvel_acte_label = 'Transfert tendineux (Transposition)',
  updated_at = now()
WHERE id_protocole = 'ACT-0147';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture double (Radius + Ulna)',
  definition_expert = 'Fixation chirurgicale des deux os de l''avant-bras par deux plaques vissées distinctes. Nécessite deux abords chirurgicaux pour restaurer la pronosupination.',
  synonymes_recherche = 'Avant-bras | Radius | Ulna | Diaphyse | Double fracture | Plaques | Vis | Foyer ouvert | Henry',
  codes_ccam = 'MCCA007',
  libelles_sources_lies = 'OSTEOSYNTHESE DOUBLE AVANT-BRAS',
  proposition_nouvel_acte_label = 'Ostéosynthèse Radius + Cubitus',
  updated_at = now()
WHERE id_protocole = 'ACT-0148';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection aiguë de prothèse (Arthrite)',
  definition_expert = 'Sauvetage d''une prothèse infectée précocement (infection récente <4 semaines). Consiste à laver abondamment, retirer les tissus infectés (synovectomie) et changer les pièces mobiles (tête et insert) sans toucher aux implants scellés (tige et cotyle). Antibiothérapie prolongée.',
  synonymes_recherche = 'Lavage | DAIR (Debridement Antibiotics Implant Retention) | Infection | Septique | Reprise | Synovectomie | Changement pièces mobiles | Hanche | Urgence | Tête | Insert',
  codes_ccam = 'NEJC001',
  libelles_sources_lies = 'Lavage articulaire de la hanche avec changement des pièces mobiles',
  proposition_nouvel_acte_label = 'Lavage et changement de mobile (Hanche) - DAIR',
  updated_at = now()
WHERE id_protocole = 'ACT-0150';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité d''épaule / Luxation récidivante',
  definition_expert = 'Technique de stabilisation de l''épaule (Butée coracoïdienne) réalisée entièrement sous contrôle vidéo (arthroscopie) sans grande ouverture. Technique plus exigeante que le Latarjet à ciel ouvert. Note : Code MEMA005 utilisé par défaut.',
  synonymes_recherche = 'Latarjet | Butée | Coracoïde | Vissage | Arthro | Arthroscopie | Instabilité | Luxation | Bankart osseux | Endobutton',
  codes_ccam = 'MEMA005',
  libelles_sources_lies = 'Butée coracoïdienne par arthroscopie',
  proposition_nouvel_acte_label = 'Stabilisation d''épaule par butée (Arthroscopie)',
  updated_at = now()
WHERE id_protocole = 'ACT-0149';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pied plat valgus / Pied creux varus',
  definition_expert = 'Section chirurgicale du talon (calcanéus) pour le déplacer vers l''intérieur (médialisation) ou l''extérieur (latéralisation) afin de corriger l''axe de l''arrière-pied et modifier les appuis au sol. Associée souvent à des gestes sur les parties molles ou d''autres ostéotomies.',
  synonymes_recherche = 'Ostéotomie | Calcanéum | Calcanéus | Dwyer | Koutsogiannis | Varisation | Valgisation | Déformation | Pied | Arrière-pied | Vis | Agrafes | Pied plat | Pied creux',
  codes_ccam = 'NDCA010',
  libelles_sources_lies = 'Ostéotomie du calcanéus',
  proposition_nouvel_acte_label = 'Ostéotomie du calcanéus',
  updated_at = now()
WHERE id_protocole = 'ACT-0151';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture isolée de l''Ulna (Cubitus)',
  definition_expert = 'Fixation chirurgicale d''une fracture de la diaphyse de l''ulna (cubitus). Nécessite un abord direct (souvent sur la crête ulnaire palpable) pour réduire la fracture et la fixer par une plaque vissée rigide (DCP ou LCP 3.5mm). L''objectif est de rétablir la longueur et l''axe de l''os pour ne pas bloquer la pronosupination (rotation du poignet).',
  synonymes_recherche = 'Cubitus | Ulna | Diaphyse | Fracture du bâton | Plaque | Vis | Avant-bras | Isolée',
  codes_ccam = 'MCCA004',
  libelles_sources_lies = 'OSTEOSYNTHESE DIAPHYSE ULNAIRE (CUBITUS)',
  proposition_nouvel_acte_label = 'Ostéosynthèse de l''ulna (Cubitus)',
  updated_at = now()
WHERE id_protocole = 'ACT-0154';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de la rotule (Patella)',
  definition_expert = 'Technique d''ostéosynthèse pour fracture de rotule. Le "cerclage" est souvent un temps du "haubanage" : deux broches axiales sont reliées par un fil d''acier en "8" antérieur qui transforme les forces de traction du quadriceps en forces de compression sur le foyer de fracture, permettant une rééducation précoce.',
  synonymes_recherche = 'Haubanage | Cerclage | Rotule | Patella | Fil d''acier | Broches | Fracture | Transversale | Appareil extenseur | Genou | Chute | Traumato',
  codes_ccam = 'NFCA002',
  libelles_sources_lies = 'HAUBANAGE DE ROTULE',
  proposition_nouvel_acte_label = 'Ostéosynthèse de rotule par cerclage',
  updated_at = now()
WHERE id_protocole = 'ACT-0153';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Désunion / Infection superficielle',
  definition_expert = 'Geste de reprise chirurgicale sur une plaie opératoire qui cicatrise mal (nécrose cutanée, écoulement purulent, désunion partielle). Consiste à aviver les berges nécrotiques au bistouri, laver abondamment au sérum et refermer si les tissus sont sains, ou laisser en cicatrisation dirigée avec mèche ou système VAC si les tissus sont encore douteux.',
  synonymes_recherche = 'Parage | Nettoyage | Désunion | Infection | Cicatrice | Mèche | VAC | Vacuum Assisted Closure | Reprise bloc | Avivement',
  codes_ccam = 'QZJA011',
  libelles_sources_lies = 'Parage de cicatrice (reprise)',
  proposition_nouvel_acte_label = 'Parage ou reprise de cicatrice',
  updated_at = now()
WHERE id_protocole = 'ACT-0152';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie nerveuse / Section',
  definition_expert = 'Acte d''urgence devant toute plaie sur trajet nerveux avec déficit sensitif ou moteur. Le nerf est exploré sous grossissement (microscope ou loupes). S''il est sectionné, réparation par microsuture épineurale ou périneurale sans tension. Si perte de substance : greffe nerveuse différée.',
  synonymes_recherche = 'Exploration | Nerf | Plaie | Coupure | Microchirurgie | Suture | Épineurale | Périneurale | Main | Avant-bras | Microscope | Loupes | Nerf médian | Nerf ulnaire | Nerf radial | Collatéral',
  codes_ccam = 'AHQA001',
  libelles_sources_lies = 'Exploration et réparation nerveuse',
  proposition_nouvel_acte_label = 'Exploration chirurgicale d''un nerf',
  updated_at = now()
WHERE id_protocole = 'ACT-0156';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité rotulienne / Arthrose fémoro-patellaire',
  definition_expert = 'Intervention de stabilisation de la rotule. Consiste à détacher la pastille osseuse où s''attache le tendon rotulien (la TTA) et à la visser plus médialement (vers l''intérieur) et/ou distalement pour corriger l''axe de la rotule et empêcher ses luxations. Indiquée si TAGT > 20mm.',
  synonymes_recherche = 'TTA (Tubérosité Tibiale Antérieure) | Ostéotomie | Tubérosité Tibiale | Recentrage rotulien | Elmslie-Trillat | Instabilité rotule | Luxation rotule | TAGT (TA-GT Distance) | Vis | Genou | Trochlée | Médialisation | Distalisation',
  codes_ccam = 'NFMA009',
  libelles_sources_lies = 'Transposition de la tubérosité tibiale antérieure, par abord direct',
  proposition_nouvel_acte_label = 'Ostéotomie de la tubérosité tibiale antérieure',
  updated_at = now()
WHERE id_protocole = 'ACT-0155';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon quadricipital',
  definition_expert = 'Réparation chirurgicale d''une rupture du tendon quadricipital (désinsertion du pôle supérieur de la rotule). Impérative pour restaurer l''extension active du genou. Suture solide par fils non résorbables (technique de Krackow) ancrés dans la rotule.',
  synonymes_recherche = 'Quadriceps | Rupture | Tendon | Sus-rotulien | Déchirure | Suture | Trans-osseux | Ancres | Fils | Genou | Extension | Urgence | Krackow | Pôle supérieur rotule',
  codes_ccam = 'NJEA002',
  libelles_sources_lies = 'Suture du tendon du muscle quadriceps fémoral',
  proposition_nouvel_acte_label = 'Réparation du tendon quadricipital',
  updated_at = now()
WHERE id_protocole = 'ACT-0157';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation fracture fémur/tibia',
  definition_expert = 'Retrait de clou intra-médullaire (fémur ou tibia) après consolidation osseuse. Nécessite un extracteur spécifique adapté au système de clou (T2, Trigen, Expert) et une masse à coulisse pour percuter et extraire le clou du canal médullaire. Contrôle radioscopique obligatoire. Les vis de verrouillage proximal et distal doivent être retirées en premier avec les tournevis correspondants.',
  synonymes_recherche = 'AMO | Ablation Matériel Ostéosynthèse | Clou | Tibia | Fémur | Extracteur | Centromédullaire | Intra-médullaire',
  codes_ccam = 'PAGA008',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse centromédullaire des membres sur plusieurs sites, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse (clou)',
  updated_at = now()
WHERE id_protocole = 'ACT-0159';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture phalange / Métacarpien déplacée',
  definition_expert = 'Remise en axe (réduction) d''une fracture déplacée des phalanges ou des métacarpiens par manœuvres externes sous anesthésie locale ou locorégionale. Objectif principal : corriger les décalages angulaires et surtout les troubles de rotation (doigts qui se croisent à la flexion). Maintien par immobilisation (attelle intrinsèque plus, gouttière, ou syndactylie au doigt voisin).',
  synonymes_recherche = 'Réduction | Doigt | Phalange | P1 (Phalange proximale) | P2 (Phalange intermédiaire) | P3 (Phalange distale) | Métacarpien | Rotation | Clinodactylie | Syndactylie | Traction | Manœuvre | Urgence main | Attelle | Gouttière | Boxer',
  codes_ccam = 'MDEP002',
  libelles_sources_lies = 'Réduction orthopédique de fracture d''un os de la main',
  proposition_nouvel_acte_label = 'Réduction de fracture de phalange',
  updated_at = now()
WHERE id_protocole = 'ACT-0158';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique épaule',
  definition_expert = 'Ouverture chirurgicale de l''articulation scapulohumérale (arthrotomie ou arthroscopie) pour évacuation manuelle de pus (arthrite septique) ou de sang (hémarthrose). Lavage abondant à la seringue ou au système pulsé, excision des tissus nécrosés à la pince et mise en place fréquente d''un drain de Redon ou d''une lame de drainage. Si réalisé à ciel ouvert, pas besoin de colonne vidéo.',
  synonymes_recherche = 'Lavage | Épaule | Arthrite | Septique | Pus | Infection | Ponction-lavage | Arthro | Arthroscopie | Synovite | Scapulohumérale | Urgence',
  codes_ccam = 'MEJC001',
  libelles_sources_lies = 'Nettoyage de l''articulation scapulohumérale, par arthroscopie',
  proposition_nouvel_acte_label = 'Lavage articulaire de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0161';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon rotulien',
  definition_expert = 'Réparation d''une rupture du tendon reliant la rotule au tibia. Le tendon est suturé et souvent protégé par un cadre de renfort métallique (cerclage rotule-TTA) pour permettre la cicatrisation et la rééducation précoce.',
  synonymes_recherche = 'Rotulien | Patellaire | Rupture | Suture | Cadre de renfort | Cerclage | Trans-osseux | Genou | Extension | Urgence | Pôle inférieur rotule | TTA (Tubérosité Tibiale Antérieure)',
  codes_ccam = 'NJEA007',
  libelles_sources_lies = 'Suture du tendon patellaire',
  proposition_nouvel_acte_label = 'Réparation du tendon rotulien',
  updated_at = now()
WHERE id_protocole = 'ACT-0160';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique / Hémarthrose (Ciel Ouvert)',
  definition_expert = 'Geste urgent consistant à laver abondamment l''articulation du genou (souvent 9 à 12 litres de sérum physiologique) par arthrotomie ou sous contrôle arthroscopique. Indication principale : arthrite septique aiguë (infection bactérienne) pour évacuer le pus et les débris fibrineux qui détruisent le cartilage, ou hémarthrose massive compressive post-traumatique. Nécessite prélèvements bactériologiques multiples avant antibiothérapie et synovectomie partielle des tissus inflammatoires.',
  synonymes_recherche = 'Lavage | Arthrite | Septique | Pus | Infection | Hémarthrose | Nettoyage | Débris | Fibrine | Synovite | Ponction-lavage | Urgence | Arthro | Genou | Arthrotomie',
  codes_ccam = 'NFJA002',
  libelles_sources_lies = 'Arthrotomie de genou pour nettoyage ou extraction (HORS SCOPIE)',
  proposition_nouvel_acte_label = 'Lavage articulaire du genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0162';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose radio-carpienne évoluée / SNAC / SLAC',
  definition_expert = 'Fusion complète et définitive de l''articulation du poignet (articulation radio-carpienne) par résection cartilagineuse et fixation rigide par plaque dorsale. Intervention de dernier recours qui supprime totalement la douleur au prix de la perte complète de mobilité en flexion/extension, mais conserve la pronosupination (rotation de l''avant-bras). Indiquée pour les destructions articulaires majeures (arthrose post-traumatique, polyarthrite rhumatoïde, SNAC/SLAC stade terminal). Nécessite une greffe osseuse iliaque et une plaque longue.',
  synonymes_recherche = 'Arthrodèse | Poignet | Totale | Fusion | Blocage | Plaque dorsale | Ranchet | Destruction | Main | Force | Radio-carpienne',
  codes_ccam = 'MGDA002',
  libelles_sources_lies = 'Arthrodèse totale de poignet',
  proposition_nouvel_acte_label = 'Fusion articulaire du poignet (Totale ou partielle)',
  updated_at = now()
WHERE id_protocole = 'ACT-0163';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose arrière-pied (Sous-talienne/Triple)',
  definition_expert = 'Fusion chirurgicale de trois articulations de l''arrière-pied (articulation sous-talienne, talo-naviculaire et calcanéo-cuboïdienne) par résection cartilagineuse complète et fixation rigide par vis ou agrafes. Intervention majeure indiquée pour bloquer définitivement un pied douloureux (arthrose post-traumatique, séquelle de fracture du calcanéum) ou très déformé (pied varus équin neurologique) et lui redonner une stabilité indolore pour la marche. Nécessite une greffe osseuse spongieuse et une immobilisation plâtrée prolongée.',
  synonymes_recherche = 'Arthrodèse | Triple | Pied | Arrière-pied | Talonaviculaire | Calcanéocuboïdienne | Sous-talienne | Fusion | Vis | Cavaliers | Varus | Valgus | Blocage',
  codes_ccam = 'NHDA010',
  libelles_sources_lies = 'Arthrodèse du couple de torsion du pied [talocalcanéenne et médiotarsienne]',
  proposition_nouvel_acte_label = 'Fusion articulaire du pied (Tarse/Métatarse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0164';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur doigt (Post-trauma/Post-op)',
  definition_expert = 'Intervention combinée pour doigt raide post-traumatique ou post-opératoire. Ténolyse : libération des tendons fléchisseurs et extenseurs des adhérences périténdineuses. Arthrolyse : ouverture des articulations enraidies (capsulotomie) pour récupérer amplitude. Souvent réalisée sous anesthésie locorégionale avec patient éveillé (test mobilité active peropératoire).',
  synonymes_recherche = 'Ténolyse | Arthrolyse | Raideur | Doigt | Adhérences | Libération | Flexum | Mobilisation | Main | IPP (Interphalangienne Proximale) | IPD (Interphalangienne Distale) | Capsulotomie | Brunner | Eveillé',
  codes_ccam = 'MJPA011',
  libelles_sources_lies = 'Ténolyse et arthrolyse d''un doigt',
  proposition_nouvel_acte_label = 'Libération des tendons et de l''articulation du doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0166';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphyse fémorale',
  definition_expert = 'Traitement de référence des fractures du fémur. Un clou est inséré dans le canal de l''os par le haut et verrouillé pour stabiliser la fracture à foyer fermé.',
  synonymes_recherche = 'Enclouage | Fémur | Diaphyse | Clou | Verrouillage | Vis | Table orthopédique | Traction | Scopie',
  codes_ccam = 'NBCB002',
  libelles_sources_lies = 'ENCLOUAGE CENTROMEDULLAIRE FEMUR',
  proposition_nouvel_acte_label = 'Ostéosynthèse du fémur par clou',
  updated_at = now()
WHERE id_protocole = 'ACT-0165';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture comminutive du poignet',
  definition_expert = 'Méthode d''ostéosynthèse utilisée pour les fractures du poignet très comminutives (en miettes) ou ouvertes. Des fiches métalliques sont vissées dans le radius et le deuxième métacarpe, reliées par une barre externe qui maintient le poignet en traction (ligamentotaxis) pour aligner les fragments sans ouvrir le foyer de fracture. Technique de sauvetage quand la plaque n''est pas possible.',
  synonymes_recherche = 'Fixateur | Hoffmann | Fiches | Carbone | Distraction | Ligamentotaxis | Poignet | Radius | Comminutive | Ouverte | Infection | Urgence | Pouteau-Colles',
  codes_ccam = 'MCCB002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité distale d''un os ou des 2 os de l''avant-bras par fixateur externe, à foyer fermé',
  proposition_nouvel_acte_label = 'Pose de fixateur externe de poignet',
  updated_at = now()
WHERE id_protocole = 'ACT-0169';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhizarthrose (Arthrose pouce)',
  definition_expert = 'Ablation chirurgicale du trapèze (petit os du carpe à la base du pouce) pour traiter la rhizarthrose. Souvent associée à une ligamentoplastie de suspension pour éviter l''ascension du premier métacarpien et la perte de force de pince. L''espace vide se comble progressivement de tissu fibreux.',
  synonymes_recherche = 'Trapézectomie | Trapèze | Rhizarthrose | Pouce | Ligamentoplastie | Interposition | Anchois | Suspension | Main | Arthrose base pouce | Colonne du pouce',
  codes_ccam = 'MHFA003',
  libelles_sources_lies = 'Trapézectomie totale',
  proposition_nouvel_acte_label = 'Trapézectomie simple',
  updated_at = now()
WHERE id_protocole = 'ACT-0168';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Omarthrose (Arthrose épaule)',
  definition_expert = 'Remplacement de l''articulation de l''épaule. "Anatomique" si coiffe saine, "Inversée" si coiffe des rotateurs rompue (principe de Delta). Soulage la douleur et restaure la fonction. Choix du design selon bilan d''imagerie.',
  synonymes_recherche = 'PTE (Prothèse Totale Épaule) | Prothèse | Epaule | Totale | Anatomique | Inversée | Reverse | Omarthrose | Coiffe | Glénosphère',
  codes_ccam = 'MEKA003',
  libelles_sources_lies = 'Prothèse totale d''épaule',
  proposition_nouvel_acte_label = 'Arthroplastie totale de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0167';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation de fracture',
  definition_expert = 'Retrait des fiches métalliques percutanées et de la structure externe (cadre) d''un fixateur externe après consolidation osseuse complète d''une fracture. Geste rapide réalisé au bloc ou en ambulatoire. Nécessite de dévisser les fiches sous anesthésie locale ou sédation, puis de retirer le cadre. Soins locaux des points de sortie des fiches qui cicatrisent en quelques jours par seconde intention.',
  synonymes_recherche = 'Fixateur | Hoffmann | Cadre | Fiches | Dépose | Retrait | Consolidation | Traumato | Externe',
  codes_ccam = 'PAGA002',
  libelles_sources_lies = 'Ablation de fixateur externe',
  proposition_nouvel_acte_label = 'Dépose de fixateur externe',
  updated_at = now()
WHERE id_protocole = 'ACT-0170';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture articulaire genou (Schatzker)',
  definition_expert = 'Traitement d''une fracture du plateau tibial (surface articulaire du genou). La réduction articulaire parfaite est contrôlée sous arthroscopie (visualisation directe du cartilage et de la réduction), PUIS l''ostéosynthèse (vis, plaque) est réalisée à foyer ouvert ou percutané. Technique Arthroscopically Assisted ARIF combinant les avantages de la vidéo (contrôle articulaire) et de la chirurgie ouverte (fixation solide).',
  synonymes_recherche = 'Plateau tibial | ARIF | Arthroscopically Assisted Reduction Internal Fixation | Arthro | Assistance | Relevage | Greffe | Vis | Plaque | Genou | Cartilage | Schatzker',
  codes_ccam = 'NCCA006',
  libelles_sources_lies = 'Ostéosynthèse plateau tibial (arthro)',
  proposition_nouvel_acte_label = 'Ostéosynthèse plateau tibial assistée par arthroscopie (ARIF)',
  updated_at = now()
WHERE id_protocole = 'ACT-0171';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Récidive Hallux Valgus / Echec',
  definition_expert = 'Chirurgie de révision pour hallux valgus récidivé ou échec de correction primaire. Solution de référence : arthrodèse (fusion définitive) de l''articulation métatarso-phalangienne du gros orteil pour supprimer douleur et déformation. Fixation par plaque dorsale et vis. Perte de mobilité compensée par l''interphalangienne.',
  synonymes_recherche = 'Reprise | Hallux Valgus | Récidive | Echec | Arthrodèse | Fusion | MTP1 (Métatarso-Phalangienne 1) | Sauvetage | Pied | Plaque | Vis | Greffe | Raccourcissement',
  codes_ccam = 'NDKA006',
  libelles_sources_lies = 'Arthrodèse métatarsophalangienne du premier rayon',
  proposition_nouvel_acte_label = 'Correction itérative d''Hallux Valgus',
  updated_at = now()
WHERE id_protocole = 'ACT-0172';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie main / Jersey Finger',
  definition_expert = 'Réparation délicate des tendons qui plient les doigts. Nécessite une suture solide (technique de Kessler, cadre) et une rééducation protocolisée immédiate (protocole de Kleinert ou Duran : mobilisation passive précoce) pour éviter les adhérences ou la rupture. Particulièrement difficile en Zone 2 ("no man''s land").',
  synonymes_recherche = 'Fléchisseur | Tendon | Suture | Main | Doigt | Zone 2 (No man''s land) | Kleinert | Duran | Urgence main | Coupure | Kessler | FDP (Flexor Digitorum Profundus) | FDS (Flexor Digitorum Superficialis)',
  codes_ccam = 'MJEA010',
  libelles_sources_lies = 'Suture de tendon fléchisseur',
  proposition_nouvel_acte_label = 'Réparation de tendon fléchisseur de la main',
  updated_at = now()
WHERE id_protocole = 'ACT-0174';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du talon (Calcaneus)',
  definition_expert = 'Réparation d''une fracture du talon (souvent après chute d''une échelle). L''objectif est de relever la surface articulaire enfoncée (thalamus) et de redonner sa forme au pied.',
  synonymes_recherche = 'Calcaneum | Talon | Fracture | Thalamus | Enfoncement | Plaque | Vis | Relevage | Sous-talienne | Chute hauteur',
  codes_ccam = 'NDCA004',
  libelles_sources_lies = 'OSTEOSYNTHESE DU CALCANEUM',
  proposition_nouvel_acte_label = 'Ostéosynthèse du calcanéus',
  updated_at = now()
WHERE id_protocole = 'ACT-0173';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hernie discale / Sciatique',
  definition_expert = 'Ablation de la partie du disque vertébral qui comprime la racine nerveuse (hernie). Soulage la sciatique, cruralgie ou névralgie cervico-brachiale. Abord postérieur mini-invasif sous microscope ou endoscopie.',
  synonymes_recherche = 'Hernie | Discale | Lombaire | Cervicale | Sciatique | Cruralgie | NCB (Névralgie Cervico-Brachiale) | Discectomie | Exérèse | Rachis | Dos | Conflit disco-radiculaire',
  codes_ccam = 'LFFA001',
  libelles_sources_lies = 'Exérèse de hernie discale lombaire ou cervicale, par abord postérieur',
  proposition_nouvel_acte_label = 'Exérèse de hernie discale (Lombaire/Cervicale)',
  updated_at = now()
WHERE id_protocole = 'ACT-0175';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture péri-prothétique (Vancouver B/C)',
  definition_expert = 'Traitement d''une fracture survenant autour d''une tige de prothèse de hanche. Classification de Vancouver : B1 (prothèse stable) = ostéosynthèse par plaque et cerclages ; B2/B3 (prothèse descellée) = changement de tige ; C (sous la tige) = ostéosynthèse standard. Fixation par plaque latérale verrouillée (LCP) et cerclages (câbles) autour de la prothèse.',
  synonymes_recherche = 'Péri-prothétique | Vancouver | Vancouver B | Vancouver C | Fémur | Plaque verrouillée | Cerclage | Câbles | Hanche | Scopie | PTH (Prothèse Totale Hanche) | LCP (Locking Compression Plate)',
  codes_ccam = 'NBCB014',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la diaphyse du fémur, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture péri-prothétique',
  updated_at = now()
WHERE id_protocole = 'ACT-0177';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture malléole latérale (Cheville)',
  definition_expert = 'Fixation d''une fracture du bas du péroné (malléole latérale) par une plaque vissée. Indispensable pour rétablir la longueur du péroné et la stabilité de la cheville.',
  synonymes_recherche = 'Péroné | Fibula | Malléole externe | Latérale | Plaque | Vis | Cheville | Weber B | Traumato',
  codes_ccam = 'NCCA013',
  libelles_sources_lies = 'OSTEOSYNTHESE MALLEOLE EXTERNE (PERONE)',
  proposition_nouvel_acte_label = 'Ostéosynthèse de la fibula (Péroné)',
  updated_at = now()
WHERE id_protocole = 'ACT-0176';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Entorse grave pouce (Lésion Stener)',
  definition_expert = 'Réparation chirurgicale urgente (suture) du ligament latéral interne du pouce arraché. Indispensable si effet Stener (ligament coincé à l''extérieur de l''aponévrose) pour éviter l''instabilité chronique douloureuse de la pince pouce-index et la perte de force de préhension. Suture par ancre ou points trans-osseux sous contrôle scopique.',
  synonymes_recherche = 'Entorse | Pouce | LLI | Ligament Latéral Interne | Ligament collatéral | Skier''s thumb | Pouce du skieur | Suture | Ancre | Ligamentorraphie | Main | MCP | Métacarpophalangienne',
  codes_ccam = 'MHMA003',
  libelles_sources_lies = 'Ligamentorraphie pouce (LLI)',
  proposition_nouvel_acte_label = 'Réparation ligamentaire (UCL)',
  updated_at = now()
WHERE id_protocole = 'ACT-0179';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Récidive Canal Carpien',
  definition_expert = 'Intervention pour récidive de syndrome du canal carpien ou libération primaire incomplète. Neurolyse : libération du nerf médian de la fibrose cicatricielle périneurale, sous microscope opératoire. Parfois nécessite couverture par lambeau graisseux (hypothénarien) pour interposer tissu sain entre nerf et cicatrice.',
  synonymes_recherche = 'Reprise | Récidive | Nerf médian | Neurolyse | Épineurale | Interfasciculaire | Libération | Adhérences | Lambeau | Main | Fibrose | Microscope | Graisseux',
  codes_ccam = 'AHPA011',
  libelles_sources_lies = 'Neurolyse du nerf médian au canal carpien',
  proposition_nouvel_acte_label = 'Neurolyse itérative du nerf médian au canal carpien',
  updated_at = now()
WHERE id_protocole = 'ACT-0178';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hématome sous-dural (HSD)',
  definition_expert = 'Intervention neurochirurgicale d''urgence consistant à ouvrir le crâne (trou de trépan ou volet crânien) pour évacuer une poche de sang comprimant le cerveau. HSD aigu = urgence vitale ; HSD chronique = évolution lente chez le sujet âgé.',
  synonymes_recherche = 'Hématome | Sous-dural | HSD (Hématome Sous-Dural) | Crâne | Trépanation | Volet | Neurochirurgie | Urgence | Cerveau | Trou de trépan',
  codes_ccam = 'AAFA006',
  libelles_sources_lies = 'Évacuation d''un hématome sous-dural, par craniotomie ou trépanation',
  proposition_nouvel_acte_label = 'Évacuation d''hématome sous-dural',
  updated_at = now()
WHERE id_protocole = 'ACT-0180';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement cotyloïdien (Hanche)',
  definition_expert = 'Réintervention sur une prothèse de hanche pour changer uniquement la partie fixée dans le bassin (le cotyle acétabulaire). Indiqué en cas de descellement isolé de la cupule ou d''usure majeure de l''insert polyéthylène. Nécessite d''enlever l''ancien implant (parfois difficile si bien fixé) et de ré-impacter un nouveau cotyle (souvent à double mobilité pour augmenter la stabilité et réduire le risque de luxation).',
  synonymes_recherche = 'Reprise PTH | Prothèse Totale Hanche | Cotyle | Cupule | Insert | Polyéthylène | Céramique | Descellement | Usure | Double mobilité | Tripode | Croix de Kerboull | Hanche | Revision',
  codes_ccam = 'NEKA009',
  libelles_sources_lies = 'Changement de la pièce acétabulaire ou fémorale d''une prothèse totale de hanche, sans reconstruction osseuse',
  proposition_nouvel_acte_label = 'Reprise isolée du composant acétabulaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0183';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie chronique d''Achille',
  definition_expert = 'Traitement des tendinites chroniques rebelles du tendon d''Achille. Consiste à réaliser des incisions longitudinales dans le tendon malade pour stimuler la cicatrisation par hypervascularisation (néo-tendinisation) sans le fragiliser.',
  synonymes_recherche = 'Peignage | Achille | Tendinite | Nodulaire | Épaississement | Kakiuchi | Incisions | Vascularisation | Sport | Cheville | Néovascularisation | Scarification',
  codes_ccam = 'NFMA011',
  libelles_sources_lies = 'Peignage du tendon calcanéen, par abord direct',
  proposition_nouvel_acte_label = 'Ténoplastie par peignage',
  updated_at = now()
WHERE id_protocole = 'ACT-0182';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de cheville',
  definition_expert = 'Fixation chirurgicale d''une fracture des deux malléoles (péroné/fibula et tibia). Nécessite souvent une plaque vissée sur la malléole externe (péroné) et un vissage ou haubanage de la malléole interne (tibia) pour stabiliser la mortaise de la cheville et permettre l''appui précoce. Vérification de la syndesmose (ligament tibiofibulaire) systématique.',
  synonymes_recherche = 'Bimalléolaire | Cheville | Malléole externe | Malléole interne | Plaque | Vis | Haubanage | Syndesmose | Maisonneuve',
  codes_ccam = 'NCCA016',
  libelles_sources_lies = 'Ostéosynthèse bimalléolaire',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture bimalléolaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0181';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité rotulienne / Luxation récidivante',
  definition_expert = 'Reconstruction du ligament fémoro-patellaire médial (MPFL) qui retient la rotule. Utilise une greffe tendineuse (Gracilis) fixée au fémur (point isométrique au tubercule de l''adducteur) et à la rotule pour empêcher les luxations. Peut être associée à une trochléoplastie ou TTA.',
  synonymes_recherche = 'MPFL (Medial Patellofemoral Ligament) | Ligament Fémoro-Patellaire Médial | Plastie | Aileron rotulien | Instabilité | Rotule | Patella | Gracilis | DIDT (Droit Interne Demi-Tendineux) | Ancre | Point isométrique',
  codes_ccam = 'NFMA021',
  libelles_sources_lies = 'Ligamentoplastie du ligament patellofémoral médial',
  proposition_nouvel_acte_label = 'Reconstruction du ligament patellofémoral médial (MPFL)',
  updated_at = now()
WHERE id_protocole = 'ACT-0187';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Plaie traumatique souillée / Infection',
  definition_expert = 'Nettoyage chirurgical approfondi d''une plaie souillée ou infectée. Consiste à retirer les débris (terre, corps étrangers), les tissus dévitalisés (excision) et à laver abondamment au sérum physiologique avant de refermer (ou de laisser ouvert en cicatrisation dirigée). Plus complet qu''une simple suture aux urgences.',
  synonymes_recherche = 'Parage | Lavage | Plaie | Profonde | Suture | Urgence | Traumato | Exploration | Tissus mous | Débridement | Sérum physiologique',
  codes_ccam = 'QZJA011',
  libelles_sources_lies = 'Parage de plaie profonde',
  proposition_nouvel_acte_label = 'Parage et nettoyage de plaie',
  updated_at = now()
WHERE id_protocole = 'ACT-0186';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture pertrochantérienne (Hanche)',
  definition_expert = 'Fixation d''une fracture du haut du fémur (massif des trochanters). Traitement standard par Clou Gamma (centromédullaire, privilégié si fracture instable) ou Vis-Plaque dynamique DHS (Dynamic Hip Screw, pour fractures stables). Permet appui immédiat ou précoce. Population typique : sujet âgé après chute de sa hauteur.',
  synonymes_recherche = 'Trochanter | Pertrochantérienne | Massif trochantérien | Hanche | Clou Gamma | DHS (Dynamic Hip Screw) | Vis-Plaque Dynamique | Vis-plaque | Sujet âgé | Chute | TFN | PFN',
  codes_ccam = 'NBCB006',
  libelles_sources_lies = 'Ostéosynthèse de fracture trochantérienne du fémur, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture trochantérienne (Clou/Plaque)',
  updated_at = now()
WHERE id_protocole = 'ACT-0185';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Entorse grave pouce (Aiguë)',
  definition_expert = 'Réparation chirurgicale directe (suture) du ligament collatéral ulnaire du pouce arraché lors d''un traumatisme récent (moins de 3 semaines). Indiquée si lésion de Stener (ligament coincé en dehors de l''aponévrose de l''adducteur) ou arrachement osseux déplacé. Suture du ligament sur son insertion osseuse par ancre ou points trans-osseux.',
  synonymes_recherche = 'Entorse | Pouce | LLI | Ligament Latéral Interne | Suture | Ancre | Aigu | Trauma | Stener | Main',
  codes_ccam = 'MHMA003',
  libelles_sources_lies = 'Ligamentorraphie pouce (LLI)',
  proposition_nouvel_acte_label = 'Réparation ligamentaire métacarpophalangienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0184';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Canal lombaire étroit / Discopathie',
  definition_expert = 'Mise en place d''un dispositif de distraction interépineux de type DIAM (coussin en silicone) entre les apophyses épineuses vertébrales lombaires pour écarter légèrement les vertèbres et soulager la pression sur les disques intervertébraux et les racines nerveuses, sans visser ni fusionner. Indiqué pour les canaux lombaires étroits débutants ou les discopathies avec conflit. Technique moins invasive que la laminectomie ou l''arthrodèse, conserve la mobilité segmentaire.',
  synonymes_recherche = 'DIAM | Espaceur | Interépineux | Cale | Amortisseur | Lombaire | Rachis | Silicone | Coussin | Dispositif interépineux',
  codes_ccam = 'LHGA010',
  libelles_sources_lies = 'Pose espaceur interépineux (DIAM)',
  proposition_nouvel_acte_label = 'Pose ou dépose de dispositif interépineux (DIAM)',
  updated_at = now()
WHERE id_protocole = 'ACT-0190';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation Acromio-Claviculaire (Stade 3+)',
  definition_expert = 'Réduction et stabilisation d''une luxation entre la clavicule et l''omoplate. Utilise des ligaments artificiels (Tightrope) ou un transfert ligamentaire pour maintenir la clavicule en place. Indiquée pour stades Rockwood ≥3.',
  synonymes_recherche = 'Disjonction | Luxation AC (Acromio-Claviculaire) | Weaver-Dunn | Tightrope | Endobutton | Ligamentoplastie | Clavicule | Epaule | Touche de piano | Rockwood',
  codes_ccam = 'MEEA005',
  libelles_sources_lies = 'Stabilisation de l''articulation acromioclaviculaire',
  proposition_nouvel_acte_label = 'Stabilisation de l''articulation acromioclaviculaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0189';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Doigt à ressaut (Ténosynovite sténosante)',
  definition_expert = 'Libération chirurgicale du tendon long fléchisseur du pouce qui bloque dans sa gaine (poulie A1) à la base du doigt. Consiste à sectionner chirurgicalement la poulie fibreuse A1 pour laisser passer librement le nodule tendineux qui s''est formé. Geste rapide sous anesthésie locale, incision transversale de 1cm au pli de flexion de la base du pouce.',
  synonymes_recherche = 'Ressaut | Pouce | Poulie A1 | Blocage | Nodule | Notta | Libération | Clic | Main | Tendon | Trigger thumb',
  codes_ccam = 'MJPA009',
  libelles_sources_lies = 'Libération poulie A1 (pouce à ressaut)',
  proposition_nouvel_acte_label = 'Libération du tendon long fléchisseur du pouce',
  updated_at = now()
WHERE id_protocole = 'ACT-0188';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de cheville',
  definition_expert = 'Fixation des fractures des deux malléoles. *Item fusionné avec ''Fracture Bimalléolaire'' pour éviter les doublons.*',
  synonymes_recherche = 'Bimalléolaire | Cheville | Malléole | Plaque | Vis | Tiers de tube | Traumato',
  codes_ccam = 'NCCA016',
  libelles_sources_lies = 'OSTEOSYNTHESE BIMALLEOLAIRE',
  proposition_nouvel_acte_label = 'Ostéosynthèse de cheville (Plaque/Vis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0191';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture Achille / Maladie de Haglund',
  definition_expert = 'Technique spécifique de réinsertion du tendon d''Achille sur le calcanéum utilisant des ancres et des bandelettes (système Speedbridge Arthrex) pour une fixation solide sans nœud et une compression optimale. Indiquée pour les désinsertions distales ou dans la maladie de Haglund avec tendinopathie d''insertion.',
  synonymes_recherche = 'Achille | Speedbridge | Arthrex | Réinsertion | Haglund | Calcanéum | Ancre | Sans noeud | Talon | Knotless | Double rang | Suture Bridge',
  codes_ccam = 'NFMA006',
  libelles_sources_lies = 'Réinsertion du tendon calcanéen sur le calcanéus',
  proposition_nouvel_acte_label = 'Réparation du tendon d''Achille par Speedbridge',
  updated_at = now()
WHERE id_protocole = 'ACT-0195';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture tête radiale non reconstructible (Mason 3-4)',
  definition_expert = 'Remplacement de la tête du radius par un implant (métallique ou pyrocarbone) lorsque la fracture est trop comminutive pour être reconstruite (Mason 3-4). Indiqué aussi dans les traumatismes complexes du coude (terrible triad). Restaure la stabilité en valgus et la transmission des contraintes axiales.',
  synonymes_recherche = 'Prothèse | Tête radiale | Coude | Fracture | Mason 3 | Mason 4 | Implant | Métallique | Pyrocarbone | Terrible triad | Instabilité | Cupule',
  codes_ccam = 'MCKA003',
  libelles_sources_lies = 'Remplacement de la tête radiale par prothèse, par abord direct',
  proposition_nouvel_acte_label = 'Arthroplastie de la tête radiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0194';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie Long Biceps',
  definition_expert = 'Fixation du tendon du long biceps sur l''humérus. Note : Terme source "Ténolyse" arbitré sur l''acte curatif principal (Ténodèse). La ténodèse fixe le tendon, la ténotomie le sectionne simplement.',
  synonymes_recherche = 'Ténodèse | Biceps | LHB (Long Head of Biceps) | Longue Portion du Biceps | Ténolyse | Nettoyage | Ancre | Vis | Gouttière | Epaule | Keyhole',
  codes_ccam = 'MEMA008',
  libelles_sources_lies = 'Ténodèse du tendon du long biceps, par abord direct',
  proposition_nouvel_acte_label = 'Ténodèse du tendon du long biceps',
  updated_at = now()
WHERE id_protocole = 'ACT-0193';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose poignet (SNAC/SLAC)',
  definition_expert = 'Ablation chirurgicale complète du scaphoïde carpien. Souvent la première étape d''une arthrodèse partielle des 4 coins (Four Corner Fusion) pour traiter l''arthrose post-traumatique du poignet (SNAC wrist après pseudarthrose du scaphoïde, ou SLAC wrist après rupture ligamentaire scapho-lunaire). L''exérèse du scaphoïde pathologique permet de supprimer les conflits douloureux et prépare l''espace pour la fusion des 4 os du carpe restants.',
  synonymes_recherche = 'Scaphoïdectomie | Résection | Scaphoïde | SNAC | Scaphoid Nonunion Advanced Collapse | SLAC | Scapholunate Advanced Collapse | Poignet | Arthrose | Carpe | Ablation',
  codes_ccam = 'MDFA002',
  libelles_sources_lies = 'Résection du scaphoïde carpien',
  proposition_nouvel_acte_label = 'Exérèse du scaphoïde carpien',
  updated_at = now()
WHERE id_protocole = 'ACT-0192';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture péri-prothétique genou',
  definition_expert = 'Fixation d''une fracture du fémur distal juste au-dessus d''une prothèse de genou (fracture sus-condylienne sur PTG). Deux options : plaque verrouillée latérale (LISS/LCP) permettant pontage de la prothèse, ou clou fémoral rétrograde si espace intercondylien de la PTG suffisant. Attention au stock osseux souvent ostéoporotique.',
  synonymes_recherche = 'Péri-prothétique | Fémur distal | PTG (Prothèse Totale Genou) | Prothèse | Genou | Plaque verrouillée | LCP (Locking Compression Plate) | LISS | Clou rétrograde | Sujet âgé | Sus-condylienne',
  codes_ccam = 'NFCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité distale du fémur, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture périprothétique de genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0198';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection aiguë de prothèse genou',
  definition_expert = 'Sauvetage d''une prothèse de genou infectée précocement. L''articulation est ouverte (arthrotomie) pour un lavage complet et le changement de l''insert en polyéthylène (pièce plastique), sans toucher aux pièces métalliques scellées. Succès dépend de la précocité de la prise en charge.',
  synonymes_recherche = 'Lavage | DAIR (Debridement Antibiotics Implant Retention) | PTG (Prothèse Totale Genou) | Prothèse | Genou | Infection | Septique | Changement polyéthylène | Insert | Arthrotomie | Urgence',
  codes_ccam = 'NFJA001',
  libelles_sources_lies = 'Lavage articulaire du genou avec changement de l''insert',
  proposition_nouvel_acte_label = 'Lavage articulaire sur prothèse de genou (DAIR)',
  updated_at = now()
WHERE id_protocole = 'ACT-0197';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation Acromio-Claviculaire chronique',
  definition_expert = 'Réduction et stabilisation d''une luxation de la clavicule distale par reconstruction des ligaments coraco-claviculaires. Utilise greffe tendineuse ou renforts synthétiques.',
  synonymes_recherche = 'Disjonction | Luxation AC (Acromio-Claviculaire) | Weaver-Dunn | Tightrope | Epaule | Coraco-claviculaire | Endobutton',
  codes_ccam = 'MEEA005',
  libelles_sources_lies = 'Reconstruction ligamentaire acromio-claviculaire',
  proposition_nouvel_acte_label = 'Reconstruction des ligaments coraco-claviculaires',
  updated_at = now()
WHERE id_protocole = 'ACT-0196';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur osseuse / Infection (Ostéite)',
  definition_expert = 'Prélèvement d''un fragment d''os au bloc opératoire pour analyse (anatomopathologie ou bactériologie). Indispensable pour diagnostiquer une tumeur primitive, métastase ou infection osseuse profonde.',
  synonymes_recherche = 'Biopsie | Os | Prélèvement | Tumeur | Métastase | Infection | Ostéite | Carotte | Trocart | Jamshidi | Chirurgicale | Ouverte',
  codes_ccam = 'PAQA001',
  libelles_sources_lies = 'Biopsie osseuse chirurgicale',
  proposition_nouvel_acte_label = 'Prélèvement de tissu osseux',
  updated_at = now()
WHERE id_protocole = 'ACT-0199';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ostéite / Infection osseuse',
  definition_expert = 'Nettoyage chirurgical d''une infection osseuse chronique. Consiste à gratter l''os infecté (curetage), retirer les fragments osseux morts (séquestres) et parfois combler la cavité par des billes de ciment aux antibiotiques ou substitut osseux. Antibiothérapie prolongée.',
  synonymes_recherche = 'Ostéite | Curetage | Séquestrectomie | Infection | Os | Parage | Alésage | Septique | Séquestre | Antibiotique local',
  codes_ccam = 'QZJA011',
  libelles_sources_lies = 'Parage d''ostéite avec curetage osseux',
  proposition_nouvel_acte_label = 'Traitement chirurgical d''une ostéite',
  updated_at = now()
WHERE id_protocole = 'ACT-0204';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité du poignet (SLAC / DISI)',
  definition_expert = 'Reconstruction du ligament principal du poignet (entre scaphoïde et lunaire) souvent rompu lors d''entorses graves. Utilise une greffe de tendon ou une capsulodèse pour stabiliser les os du carpe et prévenir l''évolution vers l''arthrose (SLAC wrist).',
  synonymes_recherche = 'Ligamentoplastie | Scapho-lunaire | Scaphoïde | Lunaire | Semi-lunaire | Instabilité | SLAC (Scaphoid Lunate Advanced Collapse) | DISI (Dorsal Intercalated Segment Instability) | Poignet | Greffe | Ancre | Broche | Capsulodèse | Brunelli',
  codes_ccam = 'MGMA001',
  libelles_sources_lies = 'Ligamentoplastie scapho-lunaire du poignet',
  proposition_nouvel_acte_label = 'Reconstruction du ligament scapho-lunaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0205';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection de prothèse (Guérie)',
  definition_expert = 'Seconde étape du traitement d''une infection de prothèse. Après guérison de l''infection (obtenue grâce au spacer temporaire et antibiothérapie), on retire le spacer et on réimplante une nouvelle prothèse définitive. Délai typique : 6-12 semaines.',
  synonymes_recherche = 'Changement | Reprise | Spacer | Ciment | Antibiotique | 2ème temps | Septique | Hanche | Genou | Prothèse | Révision | Réimplantation',
  codes_ccam = 'NEKA001',
  libelles_sources_lies = 'Réimplantation de prothèse après guérison de l''infection',
  proposition_nouvel_acte_label = 'Reprise de prothèse (2ème temps)',
  updated_at = now()
WHERE id_protocole = 'ACT-0206';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation fracture fémur',
  definition_expert = 'Retrait d''un clou centromédullaire court ou long dans le fémur proximal (clou Gamma pour fractures pertrochantériennes). Nécessite une incision au niveau du grand trochanter, le retrait de la vis céphalique avec un tournevis adapté, puis l''extraction du clou à l''aide d''un extracteur spécifique et d''une masse à coulisse. Contrôle radioscopique peropératoire systématique.',
  synonymes_recherche = 'Clou Gamma | Fémur | Trochanter | T2 | Gamma 3 | TFN | Trochanteric Femoral Nail | PFN | Proximal Femoral Nail | Extracteur | Vis céphalique',
  codes_ccam = 'PAGA008',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse centromédullaire des membres sur plusieurs sites, par abord direct',
  proposition_nouvel_acte_label = 'Ablation de clou fémoral proximal (Gamma)',
  updated_at = now()
WHERE id_protocole = 'ACT-0203';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique genou',
  definition_expert = 'Nettoyage d''urgence d''une infection articulaire (arthrite septique) du genou sous arthroscopie. Consiste à évacuer le pus sous pression, réaliser une synovectomie extensive (excision des tissus synoviaux infectés au shaver et au vaporisateur), laver abondamment (>10 litres) et effectuer des prélèvements bactériologiques multiples. Code identique à la synovectomie arthroscopique standard.',
  synonymes_recherche = 'Lavage | Arthrite | Septique | Pus | Infection | Synovectomie | Urgence | Genou | Arthro | Arthroscopie | Débridement',
  codes_ccam = 'NFJC001',
  libelles_sources_lies = 'Nettoyage de l''articulation du genou, par arthroscopie',
  proposition_nouvel_acte_label = 'Lavage et débridement de genou infecté',
  updated_at = now()
WHERE id_protocole = 'ACT-0202';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose poignet (SLAC/SNAC)',
  definition_expert = 'Fusion chirurgicale de 4 os du carpe (capitatum, hamatum, lunatum, triquetrum) après exérèse du scaphoïde pathologique. Technique de sauvetage pour traiter l''arthrose sévère du poignet (SLAC wrist après rupture du ligament scapho-lunaire, ou SNAC wrist après pseudarthrose du scaphoïde) tout en gardant une mobilité partielle (flexion/extension limitée mais fonctionnelle), contrairement à l''arthrodèse totale du poignet. Nécessite une plaque dorsale spécifique et une greffe osseuse spongieuse.',
  synonymes_recherche = 'Arthrodèse | 4 os | 4 coins | Four corner | Poignet | Capitatum | Hamatum | Lunatum | Triquetrum | Plaque | Vis | Scaphoïde | SLAC | Scapholunate Advanced Collapse | SNAC | Scaphoid Nonunion Advanced Collapse',
  codes_ccam = 'MGDA002',
  libelles_sources_lies = 'Arthrodèse du carpe (4 os)',
  proposition_nouvel_acte_label = 'Fusion des quatre os du carpe',
  updated_at = now()
WHERE id_protocole = 'ACT-0201';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Capsulite rétractile (Épaule gelée)',
  definition_expert = 'Geste non invasif réalisé sous anesthésie générale profonde (curarisation). Le chirurgien mobilise passivement le bras du patient dans toutes les directions (élévation, rotation externe/interne, abduction) avec une force progressive pour rompre (craquer) la capsule articulaire rétractée et fibreuse et récupérer les amplitudes perdues. Indiqué pour les capsulites rétractiles (épaule gelée) résistantes à la kinésithérapie. Risque de fracture de l''humérus si force excessive, nécessite radioscopie de contrôle.',
  synonymes_recherche = 'Mobilisation | Capsulite | Rétractile | Épaule gelée | Frozen shoulder | Raideur | Bloc | Anesthésie | Bris d''adhérences | Manipulation sous AG',
  codes_ccam = 'MEEP002',
  libelles_sources_lies = 'Mobilisation d''épaule sous anesthésie générale',
  proposition_nouvel_acte_label = 'Mobilisation de l''épaule sous anesthésie',
  updated_at = now()
WHERE id_protocole = 'ACT-0200';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Douleurs neuropathiques chroniques',
  definition_expert = 'Pose d''une électrode provisoire ou définitive dans l''espace épidural (colonne vertébrale) par une aiguille à travers la peau (percutané). Souvent la première étape test de la neurostimulation pour vérifier l''efficacité avant d''implanter le boîtier définitif. Réalisée sous anesthésie locale avec coopération du patient pour tester les paresthésies.',
  synonymes_recherche = 'Neurostimulateur | SCS | Spinal Cord Stimulation | Électrode | Percutané | Test | Première intention | Paresthésies | Douleur | Dos',
  codes_ccam = 'AZLA001',
  libelles_sources_lies = 'Électrode de première intention (sous anesthésie locale)',
  proposition_nouvel_acte_label = 'Pose d''électrode de neurostimulation médullaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0207';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhizarthrose (Arthrose pouce)',
  definition_expert = 'Traitement de la rhizarthrose associant trapézectomie (ablation du trapèze) et pose d''un implant d''interposition (spacer en pyrocarbone type Pi2, Pyrocardan) pour maintenir la hauteur de la colonne du pouce et éviter son recul. Alternative à la ligamentoplastie tendineuse.',
  synonymes_recherche = 'Trapézectomie | Implant | Spacer | Pi2 | Pyrocardan | Pyrocarbone | Rhizarthrose | Pouce | Main | Interposition | Ivory | Régicon',
  codes_ccam = 'MHFA003',
  libelles_sources_lies = 'Trapézectomie avec implant d''interposition',
  proposition_nouvel_acte_label = 'Trapézectomie avec pose d''implant d''interposition',
  updated_at = now()
WHERE id_protocole = 'ACT-0208';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Quintus varus (Bunionette)',
  definition_expert = 'Correction chirurgicale de la déformation en varus du 5ème orteil (Bunionette ou "oignon du tailleur"). Ostéotomie du 5ème métatarsien (Chevron, Scarf ou Weil inversé) pour réaxer l''orteil.',
  synonymes_recherche = 'Quintus varus | Bunionette | Tailor''s bunion | 5ème orteil | M5 | Métatarsien | Ostéotomie | Chevron | Scarf | Weil | Vis',
  codes_ccam = 'NDPA003',
  libelles_sources_lies = 'Ostéotomie du cinquième métatarsien',
  proposition_nouvel_acte_label = 'Correction chirurgicale du 5ème orteil (Bunionette)',
  updated_at = now()
WHERE id_protocole = 'ACT-0213';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose clavicule (Non consolidation)',
  definition_expert = 'Traitement d''une fracture de clavicule non consolidée. Avivement du foyer de pseudarthrose, apport de greffe osseuse (spongieuse ou cortico-spongieuse), fixation par plaque solide.',
  synonymes_recherche = 'Pseudarthrose | Clavicule | Non consolidation | Greffe | Plaque | Avivement | Os spongieux | Crête iliaque',
  codes_ccam = 'MACA009',
  libelles_sources_lies = 'Ostéosynthèse de pseudarthrose de la clavicule avec greffe',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose de la clavicule',
  updated_at = now()
WHERE id_protocole = 'ACT-0211';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture orteil / Luxation',
  definition_expert = 'Fixation d''une fracture d''orteil par une broche axiale temporaire traversant la peau.',
  synonymes_recherche = 'Embrochage | Orteil | Fracture | Broche | K-wire | Trauma | Pied | Phalange',
  codes_ccam = 'NDCA002',
  libelles_sources_lies = 'OSTEOSYNTHESE ORTEIL (BROCHE)',
  proposition_nouvel_acte_label = 'Fixation d''orteil par broche',
  updated_at = now()
WHERE id_protocole = 'ACT-0210';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur cérébrale / Méningiome / Gliome',
  definition_expert = 'Intervention neurochirurgicale consistant à ouvrir le crâne (volet osseux) pour retirer une tumeur cérébrale (méningiome, gliome, métastase). Chirurgie lourde sous microscope et neuronavigation.',
  synonymes_recherche = 'Tumeur | Cerveau | Crâne | Craniotomie | Volet | Neurochirurgie | Méningiome | Gliome | Métastase',
  codes_ccam = 'AAFA001',
  libelles_sources_lies = 'Exérèse de tumeur intracrânienne par craniotomie',
  proposition_nouvel_acte_label = 'Exérèse de tumeur intracrânienne (Craniotomie)',
  updated_at = now()
WHERE id_protocole = 'ACT-0209';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation de prothèse (Instabilité)',
  definition_expert = 'Remise en place d''une prothèse d''épaule déboîtée par manœuvres externes sous sédation/anesthésie, sans réintervention chirurgicale. Plus fréquent avec les prothèses inversées. Risque de récidive élevé.',
  synonymes_recherche = 'Réduction | Luxation | Prothèse | Epaule | PTE (Prothèse Totale Épaule) | Inversée | Orthopédique | Manœuvre | Urgence | Déboîtée',
  codes_ccam = 'MEEP001',
  libelles_sources_lies = 'Réduction orthopédique de luxation de prothèse d''épaule',
  proposition_nouvel_acte_label = 'Réduction de luxation de prothèse d''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0212';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture radius distal ou diaphysaire',
  definition_expert = 'Ostéosynthèse des fractures du radius (distales ou diaphysaires) par plaque et vis. Voie palmaire (antérieure) privilégiée pour les fractures distales, dorsale ou latérale pour les diaphysaires.',
  synonymes_recherche = 'Radius | Fracture | Plaque | Vis | Palmaire | Dorsale | Poignet | Avant-bras | Pouteau-Colles | Goyrand-Smith | DVR',
  codes_ccam = 'MCCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture du radius, par abord direct',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du radius',
  updated_at = now()
WHERE id_protocole = 'ACT-0215';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du poignet (Pouteau-Colles)',
  definition_expert = 'Fixation d''une fracture du bas du radius par une plaque vissée. *Note : Pour une fracture bilatérale, l''acte est coté deux fois.*',
  synonymes_recherche = 'Poignet | Radius | Distal | Pouteau-Colles | Plaque | Vis | Volair | Henry | Bilatéral | Chute',
  codes_ccam = 'MCCA010',
  libelles_sources_lies = 'FRACTURE DES 2 POIGNETS',
  proposition_nouvel_acte_label = 'Ostéosynthèse bilatérale des radius distaux',
  updated_at = now()
WHERE id_protocole = 'ACT-0214';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Echec ostéosynthèse / Coxarthrose',
  definition_expert = 'Ablation du matériel d''ostéosynthèse fémoral (clou Gamma) après échec de consolidation d''une fracture du col ou pertrochantérienne, suivie immédiatement de la pose d''une prothèse totale de hanche. Intervention complexe combinant les difficultés du retrait de matériel et de l''arthroplastie sur un stock osseux fragilisé.',
  synonymes_recherche = 'Conversion | Clou Gamma | PTH | Prothèse Totale Hanche | Reprise | Échec ostéosynthèse',
  codes_ccam = 'NEKA020',
  libelles_sources_lies = 'Remplacement d''une prothèse totale de hanche par une autre prothèse totale de hanche',
  proposition_nouvel_acte_label = 'Conversion d''ostéosynthèse en PTH',
  updated_at = now()
WHERE id_protocole = 'ACT-0216';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose scaphoïde (Non consolidation)',
  definition_expert = 'Traitement d''une fracture du scaphoïde non consolidée (pseudarthrose). Technique de Matti-Russe : avivement du foyer, creusement d''une logette, comblement par greffon spongieux (radius distal ou crête iliaque), fixation par vis compressive. Objectif : obtenir la consolidation avant évolution vers l''arthrose du poignet (SNAC wrist).',
  synonymes_recherche = 'Pseudarthrose | Scaphoïde | Greffe | Matti-Russe | Vissage | Main | Non consolidation | Os spongieux | Crête iliaque | SNAC (Scaphoid Nonunion Advanced Collapse) | Vis Herbert | Vis Acutrak',
  codes_ccam = 'MDEA002',
  libelles_sources_lies = 'Ostéosynthèse de pseudarthrose du scaphoïde carpien avec greffe',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose du scaphoïde',
  updated_at = now()
WHERE id_protocole = 'ACT-0217';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Synovite / Arthrite / Rhumatisme',
  definition_expert = 'Ablation de la membrane synoviale inflammatoire (tissu qui tapisse l''articulation) sous arthroscopie. Indiquée dans les synovites chroniques (polyarthrite rhumatoïde, PVNS) ou récidivantes. Standard : Genou sous arthroscopie.',
  synonymes_recherche = 'Synovectomie | Genou | Arthro | Inflammation | PVNS (Synovite Villonodulaire Pigmentée) | Rhumatoïde | Nettoyage | Polyarthrite | Pannus',
  codes_ccam = 'NFJC001',
  libelles_sources_lies = 'Synovectomie du genou, par arthroscopie',
  proposition_nouvel_acte_label = 'Excision de la membrane synoviale',
  updated_at = now()
WHERE id_protocole = 'ACT-0218';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Épanchement / Arthrite / Diagnostic',
  definition_expert = 'Ponction de l''articulation de l''épaule pour évacuer un épanchement, analyser le liquide (cristaux, germes) ou réaliser une infiltration thérapeutique. Peut être intra-articulaire ou sous-acromiale.',
  synonymes_recherche = 'Ponction | Épaule | Épanchement | Arthrite | Diagnostic | Infiltration | Corticoïdes | Acide hyaluronique | Sous-acromiale',
  codes_ccam = 'MZHB002',
  libelles_sources_lies = 'Ponction de l''articulation scapulohumérale',
  proposition_nouvel_acte_label = 'Ponction articulaire scapulohumérale',
  updated_at = now()
WHERE id_protocole = 'ACT-0219';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture irréparable subscapulaire',
  definition_expert = 'Transfert du tendon du grand pectoral pour suppléer un subscapulaire rompu et irréparable. Technique de sauvetage pour maintenir la rotation interne et la stabilité antérieure de l''épaule.',
  synonymes_recherche = 'Transfert | Grand pectoral | Pectoralis major | Subscapulaire | Rupture massive | Irréparable | Épaule | Reconstruction',
  codes_ccam = 'MEMA009',
  libelles_sources_lies = 'Transfert tendineux du grand pectoral à l''épaule',
  proposition_nouvel_acte_label = 'Transfert du muscle grand pectoral',
  updated_at = now()
WHERE id_protocole = 'ACT-0220';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture coiffe + Tendinopathie LHB',
  definition_expert = 'Intervention combinée sous arthroscopie : réparation des tendons de la coiffe des rotateurs et fixation du tendon du long biceps (ténodèse) souvent pathologique. Deux gestes associés pour un résultat fonctionnel optimal.',
  synonymes_recherche = 'Coiffe | Suture | Ténodèse | Biceps | LHB (Long Head of Biceps) | Longue Portion du Biceps | Combiné | Ancres | Arthroscopie | Épaule',
  codes_ccam = 'MECA001',
  libelles_sources_lies = 'Réparation de coiffe avec ténodèse du long biceps',
  proposition_nouvel_acte_label = 'Réparation coiffe + Ténodèse LHB',
  updated_at = now()
WHERE id_protocole = 'ACT-0222';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose / Cal vicieux / Échec',
  definition_expert = 'Réintervention sur ostéosynthèse de jambe défaillante. Peut nécessiter ablation du matériel, décortication osseuse, greffe, et nouvelle fixation.',
  synonymes_recherche = 'Reprise | Révision | Tibia | Fibula | Péroné | Pseudarthrose | Cal vicieux | Clou | Plaque | Greffe | Décortication',
  codes_ccam = 'NCCA015',
  libelles_sources_lies = 'Révision d''ostéosynthèse de la jambe',
  proposition_nouvel_acte_label = 'Révision d''ostéosynthèse du tibia ou de la fibula',
  updated_at = now()
WHERE id_protocole = 'ACT-0221';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Équin / Rétraction Achille',
  definition_expert = 'Allongement chirurgical du tendon d''Achille ou du complexe suro-achilléen pour corriger un équin fixé. Techniques : allongement en Z du tendon, aponévrotomie des gastrocnémiens (Strayer, Vulpius). Indiqué dans la spasticité (IMC), pieds bots récidivés.',
  synonymes_recherche = 'Allongement | Achille | Équin | Rétraction | Strayer | Vulpius | Baker | Gastrocnémiens | Pied | Spasticité | IMC (Infirmité Motrice Cérébrale)',
  codes_ccam = 'NFMA010',
  libelles_sources_lies = 'Allongement du tendon calcanéen, par abord direct',
  proposition_nouvel_acte_label = 'Allongement chirurgical du tendon calcanéen',
  updated_at = now()
WHERE id_protocole = 'ACT-0229';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture humérus proximal ou diaphysaire',
  definition_expert = 'Remise en axe d''une fracture de l''humérus par manœuvres externes sous anesthésie, sans chirurgie. Maintien par immobilisation (Dujarier, Mayo Clinic, plâtre pendant).',
  synonymes_recherche = 'Réduction | Humérus | Fracture | Orthopédique | Manœuvre | Traction | Urgence | Épaule | Bras | Dujarier | Coude au corps',
  codes_ccam = 'MEEP003',
  libelles_sources_lies = 'Réduction orthopédique de fracture de l''humérus',
  proposition_nouvel_acte_label = 'Réduction de fracture humérale',
  updated_at = now()
WHERE id_protocole = 'ACT-0228';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon extenseur main',
  definition_expert = 'Réparation chirurgicale d''une rupture de tendon extenseur des doigts. Technique de suture selon la zone lésée (cadre, pull-out, point en U). Protection par attelle en extension.',
  synonymes_recherche = 'Extenseur | Tendon | Réinsertion | Doigt | Main | Suture | Zone | Broche | Attelle',
  codes_ccam = 'MJEA004',
  libelles_sources_lies = 'Réinsertion de l''appareil extenseur de la main',
  proposition_nouvel_acte_label = 'Réinsertion de tendon extenseur',
  updated_at = now()
WHERE id_protocole = 'ACT-0225';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture péri-prothétique genou',
  definition_expert = 'Fixation d''une fracture du fémur distal survenant au-dessus d''une prothèse de genou. Utilise des plaques verrouillées spéciales (LISS) ou un clou rétrograde pour ne pas interférer avec la prothèse. Os souvent ostéoporotique nécessitant vis verrouillées.',
  synonymes_recherche = 'Péri-prothétique | Fémur distal | PTG (Prothèse Totale Genou) | Prothèse | Genou | Plaque verrouillée | LCP (Locking Compression Plate) | LISS | Clou rétrograde | Sus-condylienne',
  codes_ccam = 'NFCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité distale du fémur, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture périprothétique fémorale',
  updated_at = now()
WHERE id_protocole = 'ACT-0227';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture ancienne / Perte de substance tendineuse',
  definition_expert = 'Reconstruction tendineuse par greffe (prélèvement du tendon palmaris longus ou plantaire grêle) pour combler une perte de substance. Peut être réalisée en un ou deux temps (avec tige de Hunter).',
  synonymes_recherche = 'Greffe | Tendon | Doigt | Main | Palmaris longus | Petit palmaire | Plantaire grêle | Fléchisseur | Extenseur | Reconstruction | Deux temps | Hunter',
  codes_ccam = 'MJEA011',
  libelles_sources_lies = 'Greffe de tendon à la main',
  proposition_nouvel_acte_label = 'Greffe de tendon de la main',
  updated_at = now()
WHERE id_protocole = 'ACT-0224';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture malléolaire',
  definition_expert = 'Ostéosynthèse des fractures de cheville (malléole interne, externe +/- marge postérieure). Fixation par plaque latérale sur la fibula, vis ou haubanage sur la malléole interne. Réparation de la syndesmose si lésée.',
  synonymes_recherche = 'Cheville | Malléole | Fracture | Bimalléolaire | Trimalléolaire | Weber | Plaque | Vis | Haubanage | Syndesmose | Péroné | Fibula | Tibia',
  codes_ccam = 'NCCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture malléolaire, par abord direct',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de la cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0223';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lésion cartilagineuse focale (Genou/Cheville)',
  definition_expert = 'Technique de réparation des lésions cartilagineuses focales. Consiste à prélever des carottes ostéochondrales dans une zone non portante du genou et à les transplanter en mosaïque dans la zone lésée pour recréer une surface articulaire.',
  synonymes_recherche = 'Mosaïcplastie | Mosaïque | Greffe ostéochondrale | OATS | Cartilage | Lésion chondrale | Transplantation | Trochlée | Condyle | Talus | Carottes',
  codes_ccam = 'NFMA008',
  libelles_sources_lies = 'Greffe ostéochondrale autologue',
  proposition_nouvel_acte_label = 'Greffe ostéochondrale en mosaïque',
  updated_at = now()
WHERE id_protocole = 'ACT-0231';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose cheville (Non consolidation)',
  definition_expert = 'Traitement d''une fracture de cheville non consolidée. Avivement du foyer, greffe osseuse, et fixation renforcée.',
  synonymes_recherche = 'Pseudarthrose | Cheville | Non consolidation | Malléole | Greffe | Avivement | Plaque | Vis',
  codes_ccam = 'NCCA015',
  libelles_sources_lies = 'Ostéosynthèse de pseudarthrose de la cheville avec greffe',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose de la cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0230';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation IPP / MCP',
  definition_expert = 'Remise en place (réduction) d''une articulation de doigt déboîtée par manœuvres externes (traction), sans ouvrir la peau. Suivie d''une immobilisation par attelle ou syndactylie. Rechercher interposition (plaque palmaire, tendon) si irréductible.',
  synonymes_recherche = 'Réduction | Luxation | Doigt | IPP (Interphalangienne Proximale) | MCP (Métacarpo-Phalangienne) | Orthopédique | Manœuvre | Traction | Attelle | Urgence main',
  codes_ccam = 'MDEP003',
  libelles_sources_lies = 'Réduction orthopédique de luxation d''un doigt',
  proposition_nouvel_acte_label = 'Réduction de luxation digitale et immobilisation',
  updated_at = now()
WHERE id_protocole = 'ACT-0226';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité antérieure récidivante',
  definition_expert = 'Intervention de stabilisation d''épaule associant réparation du labrum (Bankart) et butée osseuse coracoïdienne (Latarjet). Réservée aux instabilités sévères avec lésion osseuse et labrale.',
  synonymes_recherche = 'Bankart | Latarjet | Butée | Combiné | Instabilité | Luxation | Épaule | Labrum | Coracoïde | Ancres',
  codes_ccam = 'MEMA005',
  libelles_sources_lies = 'Stabilisation d''épaule par réparation labrale et butée',
  proposition_nouvel_acte_label = 'Stabilisation combinée de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0234';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie rotulienne (Jumper''s Knee)',
  definition_expert = 'Traitement chirurgical des tendinites chroniques de la pointe de la rotule (Jumper''s knee). Consiste à réaliser des incisions dans le tendon ("peignage") et souvent à réséquer le tissu dégénératif de l''apex rotulien pour stimuler la cicatrisation.',
  synonymes_recherche = 'Peignage | Rotulien | Patellaire | Tendinite | Jumper''s knee | Genou du sauteur | Apex | Scarification | Genou | Sport | Basketball | Volleyball',
  codes_ccam = 'NFMA006',
  libelles_sources_lies = 'Peignage du tendon patellaire',
  proposition_nouvel_acte_label = 'Ténoplastie du tendon rotulien (Peignage)',
  updated_at = now()
WHERE id_protocole = 'ACT-0235';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection de prothèse (Chronique)',
  definition_expert = 'Premier temps du traitement d''une infection chronique de prothèse de genou (changement en 2 temps). Ablation de tous les composants et du ciment, curetage osseux, puis mise en place d''un spacer articulé ou fixe chargé d''antibiotiques. Antibiothérapie IV prolongée avant réimplantation.',
  synonymes_recherche = 'GTI | Septique | Espaceur | Spacer | Ciment | Antibiotique | 1er temps | Infection | Ablation | PTG (Prothèse Totale Genou) | Gentamicine | Vancomycine',
  codes_ccam = 'NFKA001',
  libelles_sources_lies = 'Ablation de prothèse de genou et pose de spacer aux antibiotiques',
  proposition_nouvel_acte_label = 'Dépose de PTG et pose d''espaceur cimenté (1er temps)',
  updated_at = now()
WHERE id_protocole = 'ACT-0236';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphyse humérus',
  definition_expert = 'Fixation chirurgicale d''une fracture au milieu du bras (humérus) par une plaque vissée. Nécessite souvent d''écarter le nerf radial.',
  synonymes_recherche = 'Humérus | Diaphyse | Bras | Plaque | Vis | Fracture | Radial | Clou',
  codes_ccam = 'MBCA008',
  libelles_sources_lies = 'OSTEOSYNTHESE D''HUMERUS',
  proposition_nouvel_acte_label = 'Ostéosynthèse de l''humérus (Plaque/Vis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0232';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie / Arthrose / Capsulite',
  definition_expert = 'Injection thérapeutique dans l''épaule (intra-articulaire ou sous-acromiale) de corticoïdes ou d''acide hyaluronique. Peut être réalisée sous guidage échographique ou scopique.',
  synonymes_recherche = 'Infiltration | Épaule | Injection | Corticoïdes | Acide hyaluronique | Sous-acromiale | Intra-articulaire | Guidage échographique',
  codes_ccam = 'MZHB002',
  libelles_sources_lies = 'Injection intra-articulaire ou sous-acromiale de l''épaule',
  proposition_nouvel_acte_label = 'Injection thérapeutique de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0233';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Dysplasie / Cal vicieux / Coxarthrose',
  definition_expert = 'Section chirurgicale du fémur (proximal ou distal) pour corriger un trouble d''axe, une dysplasie ou un cal vicieux. Fixation par lame-plaque ou plaque verrouillée.',
  synonymes_recherche = 'Ostéotomie | Fémur | Correction | Axe | Valgisation | Varisation | Dérotation | Dysplasie | Plaque | Lame-plaque',
  codes_ccam = 'NFCA010',
  libelles_sources_lies = 'Ostéotomie du fémur proximal ou distal',
  proposition_nouvel_acte_label = 'Ostéotomie correctrice du fémur',
  updated_at = now()
WHERE id_protocole = 'ACT-0249';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture métacarpien / Phalange pouce',
  definition_expert = 'Réduction de fracture du premier métacarpien (Bennett, Rolando) ou des phalanges du pouce par manœuvres externes sous anesthésie locale.',
  synonymes_recherche = 'Réduction | Pouce | Fracture | Métacarpien | M1 | Phalange | Bennett | Rolando | Orthopédique | Attelle',
  codes_ccam = 'MDEP005',
  libelles_sources_lies = 'Réduction de fracture du pouce',
  proposition_nouvel_acte_label = 'Réduction de fracture du premier rayon',
  updated_at = now()
WHERE id_protocole = 'ACT-0237';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur osseuse bénigne (Ostéome)',
  definition_expert = 'Ablation chirurgicale d''un ostéome (tumeur osseuse bénigne) de l''os occipital. Fraisage de la lésion avec marge de sécurité.',
  synonymes_recherche = 'Ostéome | Occipital | Crâne | Tumeur | Bénigne | Exérèse | Fraise | Os',
  codes_ccam = 'AAFA010',
  libelles_sources_lies = 'Exérèse de tumeur osseuse du crâne',
  proposition_nouvel_acte_label = 'Exérèse d''ostéome de l''os occipital',
  updated_at = now()
WHERE id_protocole = 'ACT-0238';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture vertébrale ostéoporotique / Métastase',
  definition_expert = 'Injection percutanée de ciment acrylique (PMMA) dans un corps vertébral fracturé (tassement ostéoporotique ou métastase) pour stabiliser la vertèbre et soulager la douleur. Sous contrôle scopique ou scanner.',
  synonymes_recherche = 'Vertébroplastie | Cimentoplastie | Ciment | PMMA | Fracture vertébrale | Tassement | Ostéoporose | Métastase | Scopie | Trocart | Percutané',
  codes_ccam = 'LHFA001',
  libelles_sources_lies = 'Injection de ciment dans un corps vertébral',
  proposition_nouvel_acte_label = 'Cimentoplastie vertébrale',
  updated_at = now()
WHERE id_protocole = 'ACT-0239';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur bénigne de la gaine des nerfs',
  definition_expert = 'Ablation chirurgicale d''un neurinome (schwannome), tumeur bénigne développée aux dépens de la gaine de Schwann d''un nerf. Énucléation sous microscope en préservant les fascicules nerveux.',
  synonymes_recherche = 'Neurinome | Schwannome | Tumeur | Nerf | Exérèse | Énucléation | Microchirurgie | Bénin',
  codes_ccam = 'AHFA006',
  libelles_sources_lies = 'Exérèse de tumeur nerveuse',
  proposition_nouvel_acte_label = 'Exérèse de neurinome (Schwannome)',
  updated_at = now()
WHERE id_protocole = 'ACT-0240';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Échec / Pseudarthrose / Récidive luxation',
  definition_expert = 'Réintervention sur une butée de Latarjet défaillante (pseudarthrose, lyse, malposition). Peut nécessiter ablation du matériel, greffe osseuse iliaque et nouvelle fixation.',
  synonymes_recherche = 'Reprise | Latarjet | Butée | Révision | Pseudarthrose | Lyse | Récidive | Épaule | Instabilité | Greffe iliaque',
  codes_ccam = 'MEMA006',
  libelles_sources_lies = 'Révision de butée glénoïdienne antérieure',
  proposition_nouvel_acte_label = 'Révision de butée coracoïdienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0241';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture comminutive / Arthrodèse / Allongement',
  definition_expert = 'Pose d''un mini-fixateur externe sur un doigt pour stabiliser une fracture comminutive ou assurer une distraction articulaire. Fiches percutanées reliées par un corps externe.',
  synonymes_recherche = 'Fixateur externe | Doigt | Mini-fixateur | Fracture | Comminutive | Phalange | Métacarpien | Broches | Distraction | Pennig',
  codes_ccam = 'MZCA001',
  libelles_sources_lies = 'Pose de fixateur externe digital',
  proposition_nouvel_acte_label = 'Pose de mini-fixateur externe sur un doigt',
  updated_at = now()
WHERE id_protocole = 'ACT-0242';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation MCP du pouce',
  definition_expert = 'Réduction d''une luxation de l''articulation métacarpo-phalangienne du pouce par manœuvres externes. Si irréductible (interposition plaque palmaire ou sésamoïde), réduction chirurgicale.',
  synonymes_recherche = 'Luxation | Pouce | MCP (Métacarpo-Phalangienne) | Réduction | Orthopédique | Manœuvre | Attelle | Irréductible | Plaque palmaire',
  codes_ccam = 'MDEP004',
  libelles_sources_lies = 'Réduction de luxation du pouce',
  proposition_nouvel_acte_label = 'Réduction de luxation métacarpophalangienne du pouce',
  updated_at = now()
WHERE id_protocole = 'ACT-0243';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Déformation d''orteil',
  definition_expert = 'Ostéotomie correctrice sur un orteil déformé (griffe, clinodactylie). Section osseuse et fixation en position corrigée.',
  synonymes_recherche = 'Ostéotomie | Orteil | Phalange | Réaxation | Griffe | Déformation | Vis | Broche | Pied',
  codes_ccam = 'NHPA005',
  libelles_sources_lies = 'Ostéotomie de phalange ou métatarsien d''orteil',
  proposition_nouvel_acte_label = 'Ostéotomie de réaxation d''un orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0244';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture humérus proximal',
  definition_expert = 'Réduction d''une fracture de l''extrémité supérieure de l''humérus par manœuvres externes. Immobilisation par bandage coude au corps (Dujarier) ou Mayo Clinic.',
  synonymes_recherche = 'Réduction | Épaule | Humérus | Fracture | Orthopédique | Manœuvre | Dujarier | Immobilisation',
  codes_ccam = 'MEEP003',
  libelles_sources_lies = 'Réduction orthopédique de fracture de l''épaule',
  proposition_nouvel_acte_label = 'Réduction de fracture humérale proximale',
  updated_at = now()
WHERE id_protocole = 'ACT-0245';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose fémoro-patellaire / Douleur antérieure',
  definition_expert = 'Mise en place d''un implant rotulien (bouton en polyéthylène) sur la face profonde de la rotule pour traiter une arthrose fémoropatellaire isolée ou une douleur antérieure de genou sur prothèse existante. Souvent réalisé isolément pour une arthrose ciblée du compartiment antérieur, ou dans un second temps sur une prothèse totale de genou (PTG) initialement non resurfacée qui devient douloureuse (syndrome rotulien). Nécessite une résection précise de la rotule au niveau du cartilage et une cimentation du bouton.',
  synonymes_recherche = 'Resurfaçage | Rotule | Médaillon | Patellaire | Bouton | Polyéthylène | Douleur antérieure | Secondaire | Isolée | Implant rotulien',
  codes_ccam = 'NFKA008',
  libelles_sources_lies = 'Remplacement de l''articulation fémoropatellaire par prothèse',
  proposition_nouvel_acte_label = 'Arthroplastie patellaire (Resurfaçage)',
  updated_at = now()
WHERE id_protocole = 'ACT-0246';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur post-traumatique / Arthrofibrose',
  definition_expert = 'Mobilisation forcée du coude enraidi sous anesthésie générale (relâchement musculaire complet). Permet de rompre les adhérences capsulaires et récupérer de l''amplitude. Suivi immédiat de kinésithérapie intensive.',
  synonymes_recherche = 'Mobilisation | Coude | MUA (Mobilisation Under Anesthesia) | Raideur | Adhérences | Arthrofibrose | Flexum | Anesthésie | Kinésithérapie',
  codes_ccam = 'MFEP002',
  libelles_sources_lies = 'Mobilisation du coude sous anesthésie générale',
  proposition_nouvel_acte_label = 'Mobilisation du coude sous anesthésie',
  updated_at = now()
WHERE id_protocole = 'ACT-0247';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rétraction Achille / Pied équin',
  definition_expert = 'Section percutanée (à travers la peau, sans incision) du tendon d''Achille pour corriger une rétraction (équin du pied). Geste rapide au bistouri, complété par immobilisation plâtrée pour cicatrisation en position corrigée. Indications : pied bot varus équin (méthode Ponseti), équin spastique (IMC), rétraction post-traumatique.',
  synonymes_recherche = 'Ténotomie | Achille | Tendon calcanéen | Percutané | Allongement | Section | Mini-invasif | Hoke | White | Strayer | Vulpius | Enfant | Pied | Equin | IMC (Infirmité Motrice Cérébrale) | Pied bot | Ponseti',
  codes_ccam = 'NFEP001',
  libelles_sources_lies = 'Ténotomie du tendon calcanéen, par voie transcutanée',
  proposition_nouvel_acte_label = 'Ténotomie percutanée du tendon d''Achille',
  updated_at = now()
WHERE id_protocole = 'ACT-0248';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Conflit osseux / Arthrose',
  definition_expert = 'Résection chirurgicale des excroissances osseuses (ostéophytes) qui gênent la mobilité articulaire ou créent un conflit. Terme générique - code CCAM selon localisation.',
  synonymes_recherche = 'Ostéophyte | Bec osseux | Émondage | Cheilectomie | Arthrose | Conflit | Résection | Fraise | Ciseau',
  codes_ccam = 'VARIABLE',
  libelles_sources_lies = 'Résection d''ostéophytes articulaires',
  proposition_nouvel_acte_label = 'Exérèse de becs osseux (Émondage)',
  updated_at = now()
WHERE id_protocole = 'ACT-0250';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection de prothèse de hanche (Septique)',
  definition_expert = 'Première étape du traitement d''une prothèse de hanche infectée (changement en 2 temps). On retire tous les implants et le ciment, on nettoie l''os, et on place une entretoise temporaire chargée d''antibiotiques (Spacer) en attendant la guérison de l''infection.',
  synonymes_recherche = 'Ablation | Prothèse | Hanche | Spacer | Ciment | Antibiotique | 1er temps | Infection | Septique | Gentamicine | Vancomycine | PTH (Prothèse Totale Hanche)',
  codes_ccam = 'NEGA002',
  libelles_sources_lies = 'Ablation de prothèse de hanche et pose de spacer aux antibiotiques',
  proposition_nouvel_acte_label = 'Dépose de PTH et pose d''espaceur (1er temps)',
  updated_at = now()
WHERE id_protocole = 'ACT-0251';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose / Polyarthrite MCP',
  definition_expert = 'Remplacement d''une articulation MCP détruite (polyarthrite, arthrose) par une prothèse (silicone type Swanson ou pyrocarbone). Redonne mobilité et supprime la douleur.',
  synonymes_recherche = 'Prothèse | MCP (Métacarpo-Phalangienne) | Métacarpo-phalangienne | Implant | Silicone | Swanson | Pyrocarbone | Arthrite | Polyarthrite',
  codes_ccam = 'MHKA003',
  libelles_sources_lies = 'Arthroplastie métacarpo-phalangienne',
  proposition_nouvel_acte_label = 'Arthroplastie MCP par prothèse',
  updated_at = now()
WHERE id_protocole = 'ACT-0256';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection / Descellement de prothèse',
  definition_expert = 'Retrait des composants prothétiques de l''épaule (tige humérale, glénosphère/glène). Indiqué pour infection ou descellement. Peut être suivi d''un spacer cimenté aux antibiotiques (infection en 2 temps) ou d''une révision directe.',
  synonymes_recherche = 'Épaule | Reprise | Dépose | Infection | Descellement | Spacer | PTE (Prothèse Totale Épaule) | Révision | Ablation',
  codes_ccam = 'MEKA004',
  libelles_sources_lies = 'Ablation de prothèse d''épaule avec ou sans spacer',
  proposition_nouvel_acte_label = 'Dépose de prothèse scapulohumérale',
  updated_at = now()
WHERE id_protocole = 'ACT-0257';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture col fémoral',
  definition_expert = 'Ostéosynthèse des fractures cervicales vraies du col fémoral par vis-plaque dynamique (DHS). Permet l''impaction du foyer et la compression.',
  synonymes_recherche = 'Vis-plaque | THS | DHS (Dynamic Hip Screw) | Col fémoral | Fracture | Ortho | Glissement | Impaction',
  codes_ccam = 'NBCA001',
  libelles_sources_lies = 'Ostéosynthèse cervicale du fémur par vis-plaque dynamique',
  proposition_nouvel_acte_label = 'Ostéosynthèse du col fémoral par vis-plaque',
  updated_at = now()
WHERE id_protocole = 'ACT-0258';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture scapula',
  definition_expert = 'Ostéosynthèse des fractures de la scapula (col, glène, corps). Rare, souvent dans un contexte de polytraumatisme. Fixation par plaques et vis par voies d''abord spécifiques.',
  synonymes_recherche = 'Omoplate | Scapula | Fracture | Glène | Col | Corps | Plaque | Vis | Polytraumatisme',
  codes_ccam = 'MACA012',
  libelles_sources_lies = 'Ostéosynthèse de fracture de la scapula',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de la scapula',
  updated_at = now()
WHERE id_protocole = 'ACT-0255';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique du poignet',
  definition_expert = 'Lavage chirurgical d''urgence d''une articulation du poignet infectée. Abord ouvert pour drainage, prélèvements bactériologiques et lavage abondant. Antibiothérapie IV.',
  synonymes_recherche = 'Arthrite | Poignet | Septique | Infection | Lavage | Arthrotomie | Drainage | Prélèvement | Urgence',
  codes_ccam = 'MGJA001',
  libelles_sources_lies = 'Lavage de l''articulation du poignet par arthrotomie',
  proposition_nouvel_acte_label = 'Lavage articulaire du poignet',
  updated_at = now()
WHERE id_protocole = 'ACT-0254';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Cal vicieux / Malunion radius',
  definition_expert = 'Section chirurgicale du radius pour corriger un cal vicieux (consolidation en mauvaise position) après fracture. Peut nécessiter une greffe osseuse intercalaire et une fixation par plaque.',
  synonymes_recherche = 'Ostéotomie | Radius | Correction | Cal vicieux | Malunion | Poignet | Plaque | Greffe | Cale',
  codes_ccam = 'MCPA010',
  libelles_sources_lies = 'Ostéotomie du radius distal ou diaphysaire',
  proposition_nouvel_acte_label = 'Ostéotomie correctrice du radius',
  updated_at = now()
WHERE id_protocole = 'ACT-0253';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture (Générique)',
  definition_expert = 'Terme générique désignant toute fixation chirurgicale d''une fracture. Code CCAM spécifique selon l''os et le type de matériel.',
  synonymes_recherche = 'Ostéosynthèse | Fixation | Fracture | Plaque | Vis | Clou | Broche | Cerclage',
  codes_ccam = 'VARIABLE',
  libelles_sources_lies = 'Ostéosynthèse de fracture',
  proposition_nouvel_acte_label = 'Fixation chirurgicale d''os',
  updated_at = now()
WHERE id_protocole = 'ACT-0252';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Cal vicieux / Nécrose / Coxarthrose post-traumatique',
  definition_expert = 'Ablation du matériel d''ostéosynthèse d''une fracture du col ou du massif trochantérien et mise en place d''une prothèse totale de hanche. Indiquée en cas de nécrose céphalique, cal vicieux, ou coxarthrose secondaire.',
  synonymes_recherche = 'PTH (Prothèse Totale Hanche) | Prothèse Totale Hanche | AMO (Ablation Matériel Ostéosynthèse) | Ablation Matériel | Retrait matériel | Conversion | Reprise',
  codes_ccam = 'NEKA020',
  libelles_sources_lies = 'Ablation de matériel et pose de prothèse de hanche',
  proposition_nouvel_acte_label = 'Conversion ostéosynthèse en PTH',
  updated_at = now()
WHERE id_protocole = 'ACT-0263';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture massive coiffe des rotateurs',
  definition_expert = 'Réparation des tendons de la coiffe des rotateurs par voie ouverte (abord delto-pectoral ou supéro-externe). Réservée aux ruptures massives ou révisions, quand l''arthroscopie n''est pas possible.',
  synonymes_recherche = 'Coiffe | Suture | Ciel ouvert | Abord direct | Delto-pectoral | Massive | Trans-osseux | Ancres | Réparation',
  codes_ccam = 'MECA002',
  libelles_sources_lies = 'Réparation de la coiffe des rotateurs par abord direct',
  proposition_nouvel_acte_label = 'Réparation de coiffe par abord direct',
  updated_at = now()
WHERE id_protocole = 'ACT-0259';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Perte de substance pulpaire / Amputation distale',
  definition_expert = 'Reconstruction d''une perte de substance digitale (pulpe, face dorsale) par lambeau local (Atasoy, Venkataswami, Moberg) ou pédiculé (cross-finger, thénar). Objectif : couverture stable et sensible.',
  synonymes_recherche = 'Lambeau | Doigt | Pulpe | Perte de substance | Couverture | Atasoy | Venkataswami | Moberg | Cross-finger | Thénar | Homodigital | Hétérodigital',
  codes_ccam = 'QZMA003',
  libelles_sources_lies = 'Lambeau de couverture digital',
  proposition_nouvel_acte_label = 'Reconstruction digitale par lambeau',
  updated_at = now()
WHERE id_protocole = 'ACT-0260';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture fracassée rotule / Echec',
  definition_expert = 'Ablation complète de la rotule. Intervention de sauvetage rare, réservée aux fractures non réparables ou aux infections chroniques, car elle diminue la force d''extension du genou.',
  synonymes_recherche = 'Patellectomie | Rotule | Patella | Ablation | Totale | Fracas | Echec',
  codes_ccam = 'NFFA006',
  libelles_sources_lies = 'Patellectomie partielle, par abord direct',
  proposition_nouvel_acte_label = 'Exérèse de la rotule (Patellectomie)',
  updated_at = now()
WHERE id_protocole = 'ACT-0261';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Cal vicieux / Arthrose post-traumatique',
  definition_expert = 'Ablation du matériel d''ostéosynthèse (plateau tibial, fémur distal) et mise en place d''une prothèse totale de genou. Souvent PTG de révision avec tiges et cales.',
  synonymes_recherche = 'PTG (Prothèse Totale Genou) | Prothèse Totale Genou | AMO (Ablation Matériel Ostéosynthèse) | Ablation Matériel | Retrait matériel | Conversion | Reprise',
  codes_ccam = 'NFKA009',
  libelles_sources_lies = 'Ablation de matériel et pose de prothèse de genou',
  proposition_nouvel_acte_label = 'Conversion ostéosynthèse en PTG',
  updated_at = now()
WHERE id_protocole = 'ACT-0262';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture coude (Enfant/Adulte)',
  definition_expert = 'Ostéosynthèse des fractures du coude (supracondyliennes, condyle externe chez l''enfant) par broches de Kirschner percutanées sous contrôle scopique. Technique mini-invasive privilégiée en pédiatrie.',
  synonymes_recherche = 'Embrochage | Coude | Broches | Kirschner | Fracture | Percutané | Enfant | Supracondylienne | Palette | Condyle | Scopie',
  codes_ccam = 'MBCA008',
  libelles_sources_lies = 'Ostéosynthèse de fracture du coude par brochage percutané',
  proposition_nouvel_acte_label = 'Ostéosynthèse du coude par broches',
  updated_at = now()
WHERE id_protocole = 'ACT-0267';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture olécrane / Coronoïde / Capitellum',
  definition_expert = 'Ostéosynthèse des fractures du coude (olécrane par haubanage ou plaque, coronoïde par vis, capitellum par vis enfouies). Chirurgie délicate avec risque de raideur.',
  synonymes_recherche = 'Coude | Fracture | Olécrane | Coronoïde | Capitellum | Plaque | Vis | Haubanage | Broches',
  codes_ccam = 'MCCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité proximale de l''ulna ou du radius',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0264';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture phalange de doigt',
  definition_expert = 'Ostéosynthèse des fractures des phalanges des doigts par vis, broches ou mini-plaques. Attention aux troubles de rotation et au risque de raideur.',
  synonymes_recherche = 'Doigt | Fracture | Phalange | P1 | P2 | P3 | Vis | Broches | Plaque | Main | Rotation | Clinodactylie',
  codes_ccam = 'MDCA008',
  libelles_sources_lies = 'Ostéosynthèse de fracture de phalange',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture digitale',
  updated_at = now()
WHERE id_protocole = 'ACT-0265';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture du Ligament Croisé Postérieur',
  definition_expert = 'Reconstruction du ligament croisé postérieur (LCP) rompu. Utilise une greffe tendineuse (quadriceps ipsilatéral ou allogreffe Achille) fixée dans des tunnels osseux. Chirurgie plus rare et complexe que le LCA.',
  synonymes_recherche = 'LCP (Ligament Croisé Postérieur) | Ligament Croisé Postérieur | Ligamentoplastie | Reconstruction | Tiroir postérieur | Instabilité | Greffe | Quadriceps | Allogreffe',
  codes_ccam = 'NFMC004',
  libelles_sources_lies = 'Reconstruction du ligament croisé postérieur du genou',
  proposition_nouvel_acte_label = 'Reconstruction du LCP',
  updated_at = now()
WHERE id_protocole = 'ACT-0266';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal cubital (Compression)',
  definition_expert = 'Libération du nerf cubital (ulnaire) au coude avec déplacement du nerf vers l''avant (transposition antérieure sous-cutanée ou sous-musculaire) pour qu''il ne soit plus étiré lors de la flexion du coude ou irrité dans sa gouttière osseuse. Indiquée si nerf instable ou récidive.',
  synonymes_recherche = 'Transposition | Nerf ulnaire | Nerf Cubital | Coude | Paresthésies | 4ème doigt | 5ème doigt | Libération | Antérieur | Epitrochlée | Gouttière épitrochléo-olécrânienne | Sous-cutané | Sous-musculaire',
  codes_ccam = 'AHPA022',
  libelles_sources_lies = 'Transposition antérieure du nerf ulnaire au coude',
  proposition_nouvel_acte_label = 'Transposition antérieure du nerf ulnaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0268';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose / Cal vicieux cheville',
  definition_expert = 'Réintervention sur ostéosynthèse de cheville défaillante. Ablation du matériel, avivement, greffe osseuse et nouvelle fixation.',
  synonymes_recherche = 'Reprise | Cheville | Révision | Pseudarthrose | Cal vicieux | Malléole | Plaque | Greffe',
  codes_ccam = 'NCCA015',
  libelles_sources_lies = 'Révision d''ostéosynthèse malléolaire',
  proposition_nouvel_acte_label = 'Révision d''ostéosynthèse de cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0269';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité chronique de cheville',
  definition_expert = 'Stabilisation chirurgicale de la cheville instable utilisant la moitié du tendon du court fibulaire (péronier latéral court) pour reconstruire le plan ligamentaire externe. Technique de référence française.',
  synonymes_recherche = 'Hémi-Castaing | Castaing | Ligamentoplastie | Cheville | Instabilité | Court fibulaire | Péronier | Entorse chronique',
  codes_ccam = 'NGCA001',
  libelles_sources_lies = 'Ligamentoplastie de la cheville par hémi-tendon',
  proposition_nouvel_acte_label = 'Ligamentoplastie externe de cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0270';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité rotulienne',
  definition_expert = 'Reconstruction ligamentaire pour stabiliser une rotule instable. Correspond généralement à la plastie du MPFL.',
  synonymes_recherche = 'Ligamentoplastie | Rotule | MPFL (Medial Patellofemoral Ligament) | Instabilité | Luxation | Stabilisation | Gracilis',
  codes_ccam = 'NFMA021',
  libelles_sources_lies = 'Ligamentoplastie de stabilisation patellaire',
  proposition_nouvel_acte_label = 'Reconstruction ligamentaire rotulienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0271';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture phalange d''orteil',
  definition_expert = 'Ostéosynthèse d''une fracture déplacée de phalange d''orteil par broche ou vis. Les fractures simples sont traitées orthopédiquement (syndactylie).',
  synonymes_recherche = 'Orteil | Fracture | Phalange | Broche | Vis | Ostéosynthèse | Pied | Syndactylie | Attelle',
  codes_ccam = 'NHCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de phalange d''orteil',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture d''orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0276';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité rotulienne',
  definition_expert = 'Reconstruction du ligament patellofémoral médial (MPFL) pour stabiliser la rotule. Utilise une greffe tendineuse (gracilis) fixée à la rotule et au fémur.',
  synonymes_recherche = 'MPFL (Medial Patellofemoral Ligament) | Ligament Fémoro-Patellaire Médial | Plastie | Aileron rotulien | Instabilité | Rotule | Luxation | Gracilis',
  codes_ccam = 'NFMA021',
  libelles_sources_lies = 'Reconstruction du ligament fémoro-patellaire médial',
  proposition_nouvel_acte_label = 'Plastie de stabilisation rotulienne (MPFL)',
  updated_at = now()
WHERE id_protocole = 'ACT-0277';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique d''orteil',
  definition_expert = 'Lavage chirurgical d''urgence d''une articulation d''orteil infectée. Abord direct, drainage et lavage abondant. Antibiothérapie IV.',
  synonymes_recherche = 'Arthrite | Orteil | Septique | Infection | Lavage | Arthrotomie | IPP | MTP',
  codes_ccam = 'NHJA001',
  libelles_sources_lies = 'Lavage d''une articulation d''orteil infectée',
  proposition_nouvel_acte_label = 'Lavage articulaire d''un orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0278';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture distale du biceps',
  definition_expert = 'Réinsertion du tendon distal du biceps rompu sur la tubérosité radiale. Restaure la force en flexion et supination.',
  synonymes_recherche = 'Ténodèse | Biceps distal | Coude | Rupture | Tubérosité | Radius | Ancre | Endobutton | Réinsertion',
  codes_ccam = 'MFMA004',
  libelles_sources_lies = 'Ténodèse ou réinsertion du tendon distal du biceps',
  proposition_nouvel_acte_label = 'Réinsertion du biceps distal au coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0279';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture métacarpien ou phalange du pouce',
  definition_expert = 'Ostéosynthèse des fractures du premier métacarpien (Bennett, Rolando) ou des phalanges du pouce. Fixation par vis, broches ou mini-plaque selon le type de fracture.',
  synonymes_recherche = 'Pouce | Fracture | Métacarpien | M1 | Phalange | Bennett | Rolando | Vis | Broches | Plaque | Ostéosynthèse',
  codes_ccam = 'MDCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture du premier rayon',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du pouce',
  updated_at = now()
WHERE id_protocole = 'ACT-0280';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Perte de substance cutanée',
  definition_expert = 'Prélèvement et application de peau autologue (du patient) pour couvrir une perte de substance cutanée. Greffe mince (dermatome) ou totale selon les besoins.',
  synonymes_recherche = 'Greffe | Peau | Autogreffe | Mince | Totale | Dermato | Cuisse | Cicatrisation',
  codes_ccam = 'QZMA010',
  libelles_sources_lies = 'Greffe de peau mince ou totale',
  proposition_nouvel_acte_label = 'Autogreffe de peau',
  updated_at = now()
WHERE id_protocole = 'ACT-0281';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tendinopathie / Arthrose / Névrome',
  definition_expert = 'Injection thérapeutique dans le pied (articulations, espaces inter-métatarsiens pour névrome de Morton, aponévrose plantaire). Corticoïdes ou acide hyaluronique.',
  synonymes_recherche = 'Infiltration | Pied | Injection | Corticoïdes | Morton | Fasciite | Aponévrose plantaire',
  codes_ccam = 'NZHB003',
  libelles_sources_lies = 'Injection dans le pied ou la cheville',
  proposition_nouvel_acte_label = 'Injection thérapeutique dans le pied',
  updated_at = now()
WHERE id_protocole = 'ACT-0282';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Genu varum / Genu valgum / Cal vicieux',
  definition_expert = 'Ostéotomie correctrice du tibia proximal pour modifier l''axe du membre inférieur. Valgisation (ouverture interne) pour genu varum, varisation (fermeture externe) pour genu valgum.',
  synonymes_recherche = 'Ostéotomie | Tibia | OTV (Ostéotomie Tibiale de Valgisation) | Valgisation | Varisation | Genu varum | Genu valgum | Tomofix | Plaque',
  codes_ccam = 'NCPA015',
  libelles_sources_lies = 'Ostéotomie tibiale de valgisation ou varisation',
  proposition_nouvel_acte_label = 'Ostéotomie correctrice du tibia',
  updated_at = now()
WHERE id_protocole = 'ACT-0283';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose du poignet / SLAC / SNAC',
  definition_expert = 'Ablation des os de la première rangée du carpe (scaphoïde, lunatum, triquétrum) pour traiter une arthrose du poignet. Alternative à l''arthrodèse, conserve une partie de la mobilité.',
  synonymes_recherche = 'Résection | Première rangée | Carpe | PRC (Proximal Row Carpectomy) | Carpectomie | SLAC (Scaphoid Lunate Advanced Collapse) | SNAC (Scaphoid Nonunion Advanced Collapse) | Arthrose | Poignet',
  codes_ccam = 'MHFA004',
  libelles_sources_lies = 'Carpectomie proximale',
  proposition_nouvel_acte_label = 'Résection de la première rangée du carpe (PRC)',
  updated_at = now()
WHERE id_protocole = 'ACT-0284';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Entorse grave / Rupture ligament collatéral',
  definition_expert = 'Réparation chirurgicale d''une rupture ligamentaire d''une articulation digitale (collatéral ulnaire du pouce = Stener, collatéraux IPP). Réinsertion par ancre ou points trans-osseux.',
  synonymes_recherche = 'Réinsertion | Ligament | Doigt | Collatéral | Entorse | Ancre | Trans-osseux | IPP (Interphalangienne Proximale) | MCP (Métacarpo-Phalangienne)',
  codes_ccam = 'MDMA005',
  libelles_sources_lies = 'Réinsertion ligamentaire d''une articulation d''un doigt',
  proposition_nouvel_acte_label = 'Réinsertion ligamentaire digitale',
  updated_at = now()
WHERE id_protocole = 'ACT-0275';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Syndrome du canal carpien / Compression',
  definition_expert = 'Libération chirurgicale du nerf médian comprimé, le plus souvent au canal carpien. Neurolyse = libération du nerf de ses adhérences ou contraintes.',
  synonymes_recherche = 'Neurolyse | Nerf médian | Canal carpien | Libération | Compression | Récidive | Microscope',
  codes_ccam = 'AHPA009',
  libelles_sources_lies = 'Neurolyse du nerf médian au poignet ou à l''avant-bras',
  proposition_nouvel_acte_label = 'Libération du nerf médian',
  updated_at = now()
WHERE id_protocole = 'ACT-0274';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Épicondylite médiale (Golf elbow)',
  definition_expert = 'Traitement chirurgical d''une tendinopathie chronique des fléchisseurs à leur insertion sur l''épitrochlée (épicondyle médial). Désinsertion et résection du tissu pathologique.',
  synonymes_recherche = 'Épitrochlée | Épicondylite médiale | Golf elbow | Tendinopathie | Fléchisseurs | Libération | Désinsertion',
  codes_ccam = 'MFPA004',
  libelles_sources_lies = 'Libération de l''épicondyle médial',
  proposition_nouvel_acte_label = 'Traitement chirurgical de l''épicondylite médiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0273';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture ouverte / Polytraumatisme',
  definition_expert = 'Stabilisation temporaire ou définitive d''une fracture par un cadre externe relié à l''os par des fiches. Indiqué en urgence (damage control) ou pour fractures ouvertes contaminées.',
  synonymes_recherche = 'Fixateur externe | Fracture | Ouverte | Damage control | Polytraumatisme | Fiches | Cadre | Ilizarov',
  codes_ccam = 'VARIABLE',
  libelles_sources_lies = 'Pose de fixateur externe',
  proposition_nouvel_acte_label = 'Stabilisation osseuse par fixateur externe',
  updated_at = now()
WHERE id_protocole = 'ACT-0272';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ténosynovite / Rhumatisme',
  definition_expert = 'Ablation de la synoviale inflammatoire entourant les tendons fléchisseurs de la main. Prévient les ruptures tendineuses dans la polyarthrite.',
  synonymes_recherche = 'Synovite | Synovectomie | Fléchisseurs | Gaine | Ténosynovite | Polyarthrite | Rhumatoïde',
  codes_ccam = 'MJPA003',
  libelles_sources_lies = 'Synovectomie de la gaine des fléchisseurs',
  proposition_nouvel_acte_label = 'Synovectomie des fléchisseurs',
  updated_at = now()
WHERE id_protocole = 'ACT-0289';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture ouverte cheville / Polytraumatisme',
  definition_expert = 'Stabilisation temporaire d''une fracture de cheville par fixateur externe (fiches dans tibia et calcanéum). Utilisé en damage control ou fractures ouvertes avant ostéosynthèse définitive.',
  synonymes_recherche = 'Fixateur externe | Cheville | Tibia | Calcanéum | Fracture ouverte | Damage control | Polytraumatisme | Fiches',
  codes_ccam = 'NCCA008',
  libelles_sources_lies = 'Pose de fixateur externe talocrural',
  proposition_nouvel_acte_label = 'Pose de fixateur externe à la cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0290';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique du pied',
  definition_expert = 'Lavage chirurgical d''urgence d''une articulation du pied infectée (médio-tarsienne, tarso-métatarsienne). Drainage et lavage abondant.',
  synonymes_recherche = 'Arthrite | Pied | Septique | Infection | Lavage | Arthrotomie | Chopart | Lisfranc',
  codes_ccam = 'NHJA001',
  libelles_sources_lies = 'Lavage d''une articulation du pied infectée',
  proposition_nouvel_acte_label = 'Lavage articulaire du pied',
  updated_at = now()
WHERE id_protocole = 'ACT-0291';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Complication matériel / Fin de thérapie',
  definition_expert = 'Retrait chirurgical du boîtier générateur et/ou des électrodes de stimulation médullaire (système de neurostimulation). Intervention réalisée lorsque le dispositif arrive en fin de vie, en cas de complication infectieuse, ou si la thérapie n''est plus efficace. Nécessite le repérage du boîtier implanté en sous-cutané (abdomen/fesse) et des électrodes épidurales, puis une extraction minutieuse sans léser la dure-mère.',
  synonymes_recherche = 'Neurostim | Neurostimulateur | Moelle | Électrode | Rachis | Boîtier | Générateur | Pile | SCS | Spinal Cord Stimulation | Retrait',
  codes_ccam = 'AFLB003',
  libelles_sources_lies = 'Ablation de matériel de stimulation neuromédullaire',
  proposition_nouvel_acte_label = 'Retrait chirurgical d''un boîtier de neurostimulation',
  updated_at = now()
WHERE id_protocole = 'ACT-0292';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture irréparable / Arthrose',
  definition_expert = 'Ablation chirurgicale de la tête du radius. Indiquée pour fractures très comminutives chez le sujet âgé ou arthrose. Risque d''instabilité en valgus.',
  synonymes_recherche = 'Résection | Tête radiale | Exérèse | Coude | Fracture | Arthrose | Instabilité',
  codes_ccam = 'MCFA003',
  libelles_sources_lies = 'Résection de la tête radiale',
  proposition_nouvel_acte_label = 'Exérèse de la tête du radius',
  updated_at = now()
WHERE id_protocole = 'ACT-0293';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Cal vicieux radius distal',
  definition_expert = 'Ostéotomie de correction d''un cal vicieux du radius distal. Restaure l''anatomie et la fonction du poignet.',
  synonymes_recherche = 'Ostéotomie | Poignet | Radius | Cal vicieux | Correction | Plaque | Greffe | Cale',
  codes_ccam = 'MCPA010',
  libelles_sources_lies = 'Ostéotomie du radius distal',
  proposition_nouvel_acte_label = 'Ostéotomie correctrice au niveau du poignet',
  updated_at = now()
WHERE id_protocole = 'ACT-0285';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture humérus proximal',
  definition_expert = 'Ostéosynthèse des fractures de l''extrémité supérieure de l''humérus (col, trochiter) par plaque verrouillée (Philos) ou clou huméral. Fractures à 4 fragments : discussion prothèse.',
  synonymes_recherche = 'Épaule | Humérus | Fracture | Trochiter | Tête | Plaque | Clou | Vis | Neer | AO',
  codes_ccam = 'MBCA002',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''extrémité proximale de l''humérus',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture humérale proximale',
  updated_at = now()
WHERE id_protocole = 'ACT-0286';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose / Cal vicieux poignet',
  definition_expert = 'Réintervention sur une ostéosynthèse du poignet (radius distal, scaphoïde) non consolidée ou mal consolidée.',
  synonymes_recherche = 'Reprise | Poignet | Révision | Pseudarthrose | Cal vicieux | Scaphoïde | Radius | Greffe',
  codes_ccam = 'MCCA015',
  libelles_sources_lies = 'Révision d''ostéosynthèse du radius ou du carpe',
  proposition_nouvel_acte_label = 'Révision d''ostéosynthèse du poignet',
  updated_at = now()
WHERE id_protocole = 'ACT-0287';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Traumatisme de l''ongle',
  definition_expert = 'Réparation chirurgicale d''une lésion traumatique de l''appareil unguéal. Suture de la matrice (lit unguéal) et repositionnement de la tablette de l''ongle comme attelle biologique.',
  synonymes_recherche = 'Ongle | Matrice | Traumatisme | Arrachement | Lit unguéal | Suture | Repositionnement | Attelle',
  codes_ccam = 'QZJA005',
  libelles_sources_lies = 'Réparation de la matrice unguéale et repositionnement de l''ongle',
  proposition_nouvel_acte_label = 'Suture de la matrice unguéale',
  updated_at = now()
WHERE id_protocole = 'ACT-0288';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Méningiome du sillon olfactif',
  definition_expert = 'Exérèse chirurgicale d''un méningiome (tumeur bénigne des méninges) développé dans la région frontale. Craniotomie frontale, exérèse sous microscope.',
  synonymes_recherche = 'Méningiome | Frontal | Étage antérieur | Crâne | Volet | Neurochirurgie | Tumeur bénigne | Méninges',
  codes_ccam = 'AAFA002',
  libelles_sources_lies = 'Exérèse de tumeur méningée intracrânienne',
  proposition_nouvel_acte_label = 'Exérèse de méningiome de l''étage antérieur',
  updated_at = now()
WHERE id_protocole = 'ACT-0298';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture irréparable coiffe postérieure',
  definition_expert = 'Transfert du tendon du grand dorsal pour suppléer une rupture massive et irréparable des rotateurs externes (infra-épineux, petit rond). Restaure la rotation externe active.',
  synonymes_recherche = 'Transfert | Grand dorsal | Latissimus dorsi | Coiffe | Rotation externe | Irréparable | Épaule | Reconstruction',
  codes_ccam = 'MEMA010',
  libelles_sources_lies = 'Transfert du muscle Latissimus Dorsi',
  proposition_nouvel_acte_label = 'Transfert du muscle Grand Dorsal à l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0299';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation IPP / MTP orteil',
  definition_expert = 'Réduction d''une luxation d''une articulation d''orteil par manœuvres externes. Immobilisation par syndactylie.',
  synonymes_recherche = 'Luxation | Orteil | Réduction | IPP | MTP | Orthopédique | Manœuvre',
  codes_ccam = 'NHEP002',
  libelles_sources_lies = 'Réduction de luxation d''un orteil',
  proposition_nouvel_acte_label = 'Réduction de luxation d''orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0300';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lésion méniscale périphérique',
  definition_expert = 'Réparation d''une lésion méniscale (zone vascularisée rouge-rouge ou rouge-blanc) sous arthroscopie. Techniques : all-inside (ancres), outside-in ou inside-out (fils). Préserve le ménisque et protège contre l''arthrose.',
  synonymes_recherche = 'Suture méniscale | Ménisque | Réparation | Arthroscopie | All-inside | Outside-in | Inside-out | Ancres | Fils | FastFix | RapidLoc',
  codes_ccam = 'NFMC002',
  libelles_sources_lies = 'Suture d''un ménisque par arthroscopie',
  proposition_nouvel_acte_label = 'Suture méniscale sous arthroscopie',
  updated_at = now()
WHERE id_protocole = 'ACT-0301';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation de prothèse de genou',
  definition_expert = 'Réduction d''une prothèse de genou luxée. Très rare. Nécessite souvent une révision chirurgicale pour traiter l''instabilité sous-jacente.',
  synonymes_recherche = 'Luxation | PTG (Prothèse Totale Genou) | Prothèse Totale Genou | Réduction | Instabilité | Rare',
  codes_ccam = 'NFEP003',
  libelles_sources_lies = 'Réduction de luxation de prothèse de genou',
  proposition_nouvel_acte_label = 'Réduction de luxation de PTG',
  updated_at = now()
WHERE id_protocole = 'ACT-0302';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose de cheville / Polyarthrite',
  definition_expert = 'Remplacement de l''articulation de la cheville (talus + tibia) par une prothèse. Alternative à l''arthrodèse pour l''arthrose de cheville, conserve la mobilité. Résultats en amélioration avec les implants modernes.',
  synonymes_recherche = 'Prothèse | Cheville | Arthroplastie | Talocrurale | Arthrose | Salto | Star | Hintegra | Mobility | In-Bone',
  codes_ccam = 'NGKA001',
  libelles_sources_lies = 'Arthroplastie de l''articulation talocrurale',
  proposition_nouvel_acte_label = 'Arthroplastie totale de cheville',
  updated_at = now()
WHERE id_protocole = 'ACT-0303';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation tarsienne / Lisfranc',
  definition_expert = 'Réduction d''une luxation des articulations du pied (médio-tarsienne de Chopart, tarso-métatarsienne de Lisfranc). Souvent chirurgicale avec ostéosynthèse.',
  synonymes_recherche = 'Luxation | Pied | Tarse | Chopart | Lisfranc | Réduction | Orthopédique | Chirurgicale',
  codes_ccam = 'NHEP001',
  libelles_sources_lies = 'Réduction de luxation du pied',
  proposition_nouvel_acte_label = 'Réduction de luxation du pied',
  updated_at = now()
WHERE id_protocole = 'ACT-0304';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose phalange',
  definition_expert = 'Traitement d''une fracture de phalange non consolidée. Avivement du foyer, greffe osseuse, et fixation rigide.',
  synonymes_recherche = 'Pseudarthrose | Doigt | Phalange | Non consolidation | Greffe | Vis | Plaque | Avivement',
  codes_ccam = 'MDCA015',
  libelles_sources_lies = 'Ostéosynthèse de pseudarthrose de phalange',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose phalangienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0305';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose fémoropatellaire isolée',
  definition_expert = 'Prothèse remplaçant uniquement l''articulation entre le fémur (trochlée) et la rotule. Indiquée pour arthrose fémoropatellaire isolée avec compartiments fémoro-tibiaux sains.',
  synonymes_recherche = 'Prothèse | Fémoropatellaire | PFP | Rotule | Trochlée | Arthrose | Isolée | Zimmer | Journey',
  codes_ccam = 'NFKA011',
  libelles_sources_lies = 'Prothèse fémoropatellaire',
  proposition_nouvel_acte_label = 'Arthroplastie isolée fémoropatellaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0306';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose radio-ulnaire distale / Conflit',
  definition_expert = 'Ablation chirurgicale de l''extrémité distale de l''ulna (cubitus) au niveau du poignet (intervention de Darrach). Indiqué pour soulager les douleurs en cas d''arthrose ou de conflit mécanique de l''articulation radio-ulnaire distale, sans poser de prothèse de remplacement. La résection peut être isolée ou associée à une stabilisation du moignon ulnaire pour éviter l''instabilité et la perte de force de serrage. Alternative : prothèse de tête ulnaire ou intervention de Sauvé-Kapandji.',
  synonymes_recherche = 'Darrach | Résection | Tête ulnaire | Ulna distal | Cubitus | Caput ulnae | Conflit ulnocarpien | Arthrose | RUD | Radio-Ulnaire Distale | Sauvé-Kapandji',
  codes_ccam = 'MCFA003',
  libelles_sources_lies = 'Résection de la tête de l''ulna',
  proposition_nouvel_acte_label = 'Résection de la tête ulnaire (Darrach)',
  updated_at = now()
WHERE id_protocole = 'ACT-0307';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Compression du SPE au col de la fibula',
  definition_expert = 'Libération chirurgicale du nerf fibulaire commun (SPE = sciatique poplité externe) comprimé au col de la fibula. Traite le pied tombant (steppage) par compression extrinsèque.',
  synonymes_recherche = 'Neurolyse | Nerf fibulaire | SPE (Sciatique Poplité Externe) | Nerf péronier | Col de la fibula | Pied tombant | Compression | Steppage',
  codes_ccam = 'AHPA025',
  libelles_sources_lies = 'Neurolyse du nerf fibulaire',
  proposition_nouvel_acte_label = 'Libération du nerf fibulaire commun',
  updated_at = now()
WHERE id_protocole = 'ACT-0308';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection de prothèse d''épaule',
  definition_expert = 'Premier temps du traitement d''une infection de prothèse d''épaule. Ablation de tous les composants et pose d''un espaceur cimenté aux antibiotiques.',
  synonymes_recherche = 'Ablation | Prothèse | Épaule | Spacer | Infection | Ciment | Antibiotique | 1er temps',
  codes_ccam = 'MEKA005',
  libelles_sources_lies = 'Ablation de prothèse d''épaule avec spacer cimenté',
  proposition_nouvel_acte_label = 'Dépose de prothèse d''épaule et pose de spacer',
  updated_at = now()
WHERE id_protocole = 'ACT-0309';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Récidive hernie discale',
  definition_expert = 'Réintervention pour récidive de hernie discale lombaire ou cervicale. Discectomie en terrain cicatriciel avec risque de fibrose péri-radiculaire.',
  synonymes_recherche = 'Reprise | Hernie discale | Récidive | Discectomie | Révision | Fibrose | Péri-radiculaire',
  codes_ccam = 'LFFA005',
  libelles_sources_lies = 'Discectomie itérative',
  proposition_nouvel_acte_label = 'Réintervention pour récidive de hernie discale',
  updated_at = now()
WHERE id_protocole = 'ACT-0294';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Batterie épuisée / Dysfonction',
  definition_expert = 'Changement du boîtier (générateur) d''un neurostimulateur médullaire dont la batterie est épuisée. Les électrodes en place sont reconnectées au nouveau générateur.',
  synonymes_recherche = 'Neurostimulation | Générateur | Boîtier | Batterie | Stimulation médullaire | Douleur chronique | Itrel | Remplacement',
  codes_ccam = 'AHPA030',
  libelles_sources_lies = 'Remplacement de générateur de neurostimulation',
  proposition_nouvel_acte_label = 'Changement de boîtier de neurostimulation',
  updated_at = now()
WHERE id_protocole = 'ACT-0295';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Myélopathie cervicarthrosique',
  definition_expert = 'Décompression du canal rachidien cervical rétréci par arthrose. Laminectomie (ablation des lames) ou laminoplastie (ouverture-suspension des lames). Libère la moelle épinière comprimée.',
  synonymes_recherche = 'Canal cervical | Sténose | Myélopathie | Laminectomie | Laminoplastie | Cervicale | Recalibrage | Moelle',
  codes_ccam = 'LDFA005',
  libelles_sources_lies = 'Laminectomie cervicale',
  proposition_nouvel_acte_label = 'Recalibrage du canal rachidien cervical',
  updated_at = now()
WHERE id_protocole = 'ACT-0296';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture deux os avant-bras',
  definition_expert = 'Ostéosynthèse des fractures des deux os de l''avant-bras (radius ET ulna) par plaques. Restauration de la pronosupination essentielle.',
  synonymes_recherche = 'Avant-bras | Fracture | Radius | Ulna | Cubitus | Deux os | Plaque | Vis | Bilatérale',
  codes_ccam = 'MCCA012',
  libelles_sources_lies = 'Ostéosynthèse de fracture du radius et de l''ulna',
  proposition_nouvel_acte_label = 'Ostéosynthèse pluri-osseuse de l''avant-bras',
  updated_at = now()
WHERE id_protocole = 'ACT-0297';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Omarthrose | Nécrose humérale | Arthropathie',
  definition_expert = 'Remplacement de la surface articulaire de la tête humérale par une calotte prothétique (cap huméral) tout en préservant le stock osseux. Indication : omarthrose centrée avec glénoïde saine, nécrose de tête humérale, arthropathie destructrice. Alternative conservatrice à la prothèse anatomique totale d''épaule chez le sujet jeune actif.',
  synonymes_recherche = 'Resurfaçage huméral | Cap d''épaule | Prothèse humérale de surface | Omarthrose',
  libelles_sources_lies = 'Resurfaçage huméral/prothèse surface',
  proposition_nouvel_acte_label = 'Arthroplastie de l''épaule par remplacement de la surface céphalique',
  updated_at = now()
WHERE id_protocole = 'ACT-0323';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphyse humérale',
  definition_expert = 'Ostéosynthèse de fracture de la diaphyse humérale par plaque (voie antérieure ou postérieure) ou clou centromédullaire. Attention au nerf radial dans la gouttière de torsion.',
  synonymes_recherche = 'Humérus | Fracture | Diaphyse | Plaque | Clou | Vis | MIPO | Radial | Nerf',
  codes_ccam = 'MBCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''humérus',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de l''humérus',
  updated_at = now()
WHERE id_protocole = 'ACT-0310';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose du scaphoïde carpien',
  definition_expert = 'Technique de Matti-Russe : comblement de pseudarthrose du scaphoïde carpien par greffe osseuse cortico-spongieuse encastrée dans le foyer. Indication : échec de consolidation du scaphoïde (naviculaire carpien) après fracture. Restauration de la continuité osseuse et prévention du collapsus carpien (SNAC wrist). Voie d''abord palmaire de Russe classique.',
  synonymes_recherche = 'Matti-Russe | Greffe encastrée | Pseudarthrose scaphoïde | Scaphoïde carpien | Poignet',
  codes_ccam = 'MGCAxx',
  libelles_sources_lies = 'Greffe osseuse scaphoïde carpien',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose du scaphoïde par greffe encastrée (Matti-Russe)',
  updated_at = now()
WHERE id_protocole = 'ACT-0311';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture deux os avant-bras',
  definition_expert = 'Réduction de fracture des deux os de l''avant-bras par manœuvres externes. Fréquent chez l''enfant. Immobilisation plâtrée brachio-anté-brachiale.',
  synonymes_recherche = 'Réduction | Avant-bras | Fracture | Radius | Ulna | Cubitus | Orthopédique | Enfant | Plâtre',
  codes_ccam = 'MCEP002',
  libelles_sources_lies = 'Réduction de fracture du radius et de l''ulna',
  proposition_nouvel_acte_label = 'Réduction de fracture de l''avant-bras',
  updated_at = now()
WHERE id_protocole = 'ACT-0312';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture cotyle / Acétabulum',
  definition_expert = 'Ostéosynthèse des fractures de l''acétabulum (cotyle) par plaques et vis via voies d''abord spécifiques (ilio-inguinale, Kocher-Langenbeck, Stoppa). Chirurgie lourde, souvent chez le polytraumatisé.',
  synonymes_recherche = 'Cotyle | Acétabulum | Fracture | Plaque | Vis | Voie ilio-inguinale | Kocher-Langenbeck | Stoppa | Polytraumatisme',
  codes_ccam = 'NACA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture du cotyle',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de l''acétabulum',
  updated_at = now()
WHERE id_protocole = 'ACT-0313';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture rotule déplacée | Pseudarthrose patellaire',
  definition_expert = 'Reprise chirurgicale d''ostéosynthèse de la patelle (rotule) pour échec de consolidation ou rupture/migration du matériel (hauban, cerclage, vis). Indication : pseudarthrose patellaire, déplacement secondaire, matériel rompu. Techniques : nouveau cerclage avec hauban antérieur, greffe osseuse si comminution, voire patellectomie partielle si destruction majeure.',
  synonymes_recherche = 'Rotule | Patelle | Reprise fracture | Hauban patellaire | Cerclage',
  proposition_nouvel_acte_label = 'Nouvelle ostéosynthèse de la patelle pour échec ou déplacement',
  updated_at = now()
WHERE id_protocole = 'ACT-0314';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur vertébrale | Métastase vertébrale | Myélome',
  definition_expert = 'Exérèse chirurgicale de tumeur vertébrale lombaire (primitive bénigne/maligne ou métastase). Technique : abord postérieur ± antérieur, corporectomie partielle ou totale (spondylectomie), reconstruction par cage et fixation instrumentée. Indication : compression médullaire/radiculaire, instabilité, diagnostic histologique. Souvent combiné à radiothérapie/chimiothérapie pour métastases.',
  synonymes_recherche = 'Tumeur lombaire | Exérèse vertébrale | Corporectomie | Métastase rachis | Spondylectomie',
  codes_ccam = 'LFFAxx',
  proposition_nouvel_acte_label = 'Exérèse de tumeur de la colonne vertébrale lombale',
  updated_at = now()
WHERE id_protocole = 'ACT-0315';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ré-rupture coiffe | Échec réparation coiffe',
  definition_expert = 'Reprise chirurgicale pour nouvelle rupture des tendons de la coiffe des rotateurs après première réparation. Indication : ré-rupture symptomatique avec douleur et perte de force. Technique : débridement, libération-mobilisation tendineuse, réparation par ancres avec ou sans greffe (patch biologique, fascia lata) si tissus de mauvaise qualité. Pronostic réservé.',
  synonymes_recherche = 'Coiffe des rotateurs | Reprise coiffe | Ré-rupture | Sus-épineux | Sous-épineux',
  proposition_nouvel_acte_label = 'Réparation itérative des tendons de la coiffe des rotateurs',
  updated_at = now()
WHERE id_protocole = 'ACT-0316';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose / Perte de substance osseuse',
  definition_expert = 'Apport de tissu osseux pour combler une perte de substance ou stimuler la consolidation. Autogreffe (crête iliaque) ou allogreffe (banque d''os). Code selon localisation.',
  synonymes_recherche = 'Greffe | Os | Autogreffe | Allogreffe | Spongieux | Cortico-spongieux | Crête iliaque | Banque d''os',
  codes_ccam = 'VARIABLE',
  libelles_sources_lies = 'Greffe osseuse autologue ou allogreffe',
  proposition_nouvel_acte_label = 'Apport de tissu osseux',
  updated_at = now()
WHERE id_protocole = 'ACT-0317';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lésion cartilagineuse focale',
  definition_expert = 'Transplantation de cylindres ostéocartilagineux dans une lésion cartilagineuse focale. Autogreffe (mosaïcoplastie) ou allogreffe massive selon la taille du défect.',
  synonymes_recherche = 'Greffe | Ostéochondrale | Mosaïque | Mosaïcoplastie | OATS (Osteochondral Autograft Transfer System) | Cartilage | Condyle | Talus | Allogreffe',
  codes_ccam = 'NFMA008',
  libelles_sources_lies = 'Greffe ostéochondrale autologue ou allogreffe',
  proposition_nouvel_acte_label = 'Mosaïcoplastie ou greffe ostéochondrale',
  updated_at = now()
WHERE id_protocole = 'ACT-0318';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur tissus mous | Sarcome paravertébral | Schwannome',
  definition_expert = 'Exérèse chirurgicale de masse tumorale développée dans les parties molles paravertébrales (muscle, graisse, gaine nerveuse). Indication : schwannome, neurofibrome, lipome, sarcome des tissus mous. Abord latéral ou postéro-latéral. Risque de compression radiculaire ou médullaire si extension intra-canalaire (tumeur en sablier).',
  synonymes_recherche = 'Tumeur paravertébrale | Masse pararachidienne | Schwannome | Neurofibrome | Sarcome',
  libelles_sources_lies = 'Exérèse tissus mous paravertébraux',
  proposition_nouvel_acte_label = 'Exérèse de tumeur des tissus mous paravertébraux',
  updated_at = now()
WHERE id_protocole = 'ACT-0319';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation irréductible de PTH',
  definition_expert = 'Réduction chirurgicale (à ciel ouvert) d''une prothèse de hanche luxée irréductible par manœuvres externes. Permet d''identifier et traiter la cause de l''instabilité (malposition, conflit).',
  synonymes_recherche = 'Réduction | Luxation | PTH (Prothèse Totale Hanche) | Prothèse Totale Hanche | Sanglante | Chirurgicale | Arthrotomie | Irréductible | Instabilité',
  codes_ccam = 'NEEA001',
  libelles_sources_lies = 'Réduction de luxation de prothèse de hanche par arthrotomie',
  proposition_nouvel_acte_label = 'Réduction chirurgicale de PTH luxée',
  updated_at = now()
WHERE id_protocole = 'ACT-0320';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du col du fémur',
  definition_expert = 'Ostéosynthèse mini-invasive des fractures du col fémoral non déplacées (Garden I-II) par 2-3 vis canulées percutanées sous scopie. Préserve la vascularisation céphalique.',
  synonymes_recherche = 'Vis | THS | Percutané | Col fémoral | Fracture | Garden | Scopie | Mini-invasif',
  codes_ccam = 'NBCA005',
  libelles_sources_lies = 'Ostéosynthèse percutanée du col fémoral par vis',
  proposition_nouvel_acte_label = 'Vissage du col fémoral par voie percutanée',
  updated_at = now()
WHERE id_protocole = 'ACT-0321';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Coxarthrose | Nécrose aseptique',
  definition_expert = 'Arthroplastie de hanche par prothèse de resurfaçage ou prothèse courte conservant le col fémoral. Voie antérieure mini-invasive (Hueter). Indication : coxarthrose débutante du sujet jeune ou nécrose céphalique. Conservation du capital osseux fémoral pour faciliter les reprises futures. Alternative à la prothèse totale conventionnelle.',
  synonymes_recherche = 'Prothèse intermédiaire hanche | Voie antérieure | Hueter | Miniprothèse',
  proposition_nouvel_acte_label = 'Pose de prothèse intermédiaire de hanche par voie antérieure',
  updated_at = now()
WHERE id_protocole = 'ACT-0322';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement / Fracture péri-prothétique',
  definition_expert = 'Remplacement isolé de la tige fémorale d''une prothèse de hanche descellée ou fracturée. Utilise des tiges de révision (longues, modulaires) pour assurer la stabilité dans un os souvent fragilisé.',
  synonymes_recherche = 'Changement | Tige fémorale | Révision | PTH (Prothèse Totale Hanche) | Descellement | Fracture | Tige de révision | Longue | Modulaire',
  codes_ccam = 'NEKA003',
  libelles_sources_lies = 'Remplacement du composant fémoral d''une prothèse de hanche',
  proposition_nouvel_acte_label = 'Remplacement de la tige fémorale (Révision PTH)',
  updated_at = now()
WHERE id_protocole = 'ACT-0324';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Genu valgum / Dysplasie',
  definition_expert = 'Ostéotomie du fémur distal pour corriger un genu valgum (jambes en X). Fermeture latérale pour varisier l''axe mécanique.',
  synonymes_recherche = 'Ostéotomie | Varisation | Fémur | Genu valgum | Dysplasie | Plaque | Lame-plaque',
  codes_ccam = 'NFCA015',
  libelles_sources_lies = 'Ostéotomie de varisation du fémur distal',
  proposition_nouvel_acte_label = 'Ostéotomie fémorale de varisation',
  updated_at = now()
WHERE id_protocole = 'ACT-0325';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Maladie de Dupuytren récidivante',
  definition_expert = 'Reprise chirurgicale pour récidive de maladie de Dupuytren (réapparition de brides aponévrotiques rétractiles). Indication : nouvelle flexion irréductible des doigts après premier geste. Technique : aponévrectomie partielle ou totale des brides récidivantes avec dissection prudente (risque cicatriciel et nerveux accru). Possibilité de lambeau de couverture.',
  synonymes_recherche = 'Dupuytren | Récidive Dupuytren | Aponévrectomie | Corde palmaire | Fasciectomie',
  libelles_sources_lies = 'Aponévrectomie palmaire',
  proposition_nouvel_acte_label = 'Aponévrotomie ou aponévrectomie itérative pour maladie de Dupuytren',
  updated_at = now()
WHERE id_protocole = 'ACT-0326';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture de l''épine tibiale / Arrachement LCA',
  definition_expert = 'Ostéosynthèse d''une fracture-arrachement de l''épine tibiale (insertion tibiale du LCA). Fréquent chez l''enfant. Réduction et fixation arthroscopique par fils ou vis.',
  synonymes_recherche = 'Épine tibiale | Fracture | Arrachement | LCA (Ligament Croisé Antérieur) | Réinsertion | Arthroscopie | Fils | Vis | Enfant',
  codes_ccam = 'NFCA008',
  libelles_sources_lies = 'Réinsertion de l''épine tibiale',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de l''épine tibiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0327';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture ouverte humérus / Polytraumatisme',
  definition_expert = 'Stabilisation temporaire d''une fracture de l''humérus par fixateur externe. Indiqué en damage control ou fractures ouvertes très contaminées.',
  synonymes_recherche = 'Fixateur externe | Humérus | Bras | Fracture ouverte | Polytraumatisme | Damage control | Fiches',
  codes_ccam = 'MBCA010',
  libelles_sources_lies = 'Pose de fixateur externe huméral',
  proposition_nouvel_acte_label = 'Pose de fixateur externe sur l''humérus',
  updated_at = now()
WHERE id_protocole = 'ACT-0328';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Usure / Descellement / Échec THS',
  definition_expert = 'Dépose du matériel d''ostéosynthèse type THS (vis-plaque DHS ou clou Gamma) et reconstruction par une PTH complète. Indiquée en cas de cal vicieux, nécrose céphalique, coxarthrose post-traumatique.',
  synonymes_recherche = 'THS | Reprise | Hanche | PTH (Prothèse Totale Hanche) | Changement | Conversion | AMO (Ablation Matériel Ostéosynthèse) | Vis-plaque | DHS (Dynamic Hip Screw) | Clou Gamma',
  codes_ccam = 'NEKA020',
  libelles_sources_lies = 'Changement de matériel d''ostéosynthèse pour prothèse totale de hanche',
  proposition_nouvel_acte_label = 'Conversion THS en prothèse totale de hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0329';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Douleur antérieure sur PTG / Arthrose',
  definition_expert = 'Cimentation d''un médaillon (bouton) en polyéthylène sur la face profonde de la rotule. Souvent réalisé secondairement sur une prothèse totale de genou existante si la rotule native non resurfacée initialement devient douloureuse (syndrome rotulien post-PTG). Nécessite une résection précise de l''épaisseur de la rotule et une cimentation rigoureuse.',
  synonymes_recherche = 'Médaillon | Rotule | Bouton | Cimenté | Secondaire | PTG | Prothèse Totale Genou | Douleur | Resurfaçage | Patellaire',
  codes_ccam = 'NFKA008',
  libelles_sources_lies = 'Médaillon rotulien',
  proposition_nouvel_acte_label = 'Changement ou pose de bouton rotulien',
  updated_at = now()
WHERE id_protocole = 'ACT-0330';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Batterie épuisée',
  definition_expert = 'Remplacement du générateur (boîtier Itrel ou équivalent) d''un neurostimulateur médullaire. Reconnexion des électrodes existantes au nouveau boîtier.',
  synonymes_recherche = 'Itrel | Générateur | Boîtier | Neurostimulation | Batterie | Remplacement | Stimulation médullaire',
  codes_ccam = 'AHPA030',
  libelles_sources_lies = 'Remplacement de boîtier Itrel ou équivalent',
  proposition_nouvel_acte_label = 'Remplacement de générateur de neurostimulation',
  updated_at = now()
WHERE id_protocole = 'ACT-0331';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur de hanche / Capsulite',
  definition_expert = 'Mobilisation forcée de la hanche enraidie sous anesthésie générale. Rupture des adhérences capsulaires. Suivi de kinésithérapie intensive.',
  synonymes_recherche = 'Mobilisation | Hanche | MUA (Mobilisation Under Anesthesia) | Raideur | Capsulite | Adhérences | Anesthésie générale',
  codes_ccam = 'NEEP005',
  libelles_sources_lies = 'Mobilisation de la hanche sous anesthésie',
  proposition_nouvel_acte_label = 'Mobilisation forcée de la hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0332';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ischémie / Gangrène / Traumatisme',
  definition_expert = 'Amputation d''un membre inférieur au niveau de la jambe (transtibiale) ou de la cuisse (transfémorale). Objectif : moignon fonctionnel appareillable. Nécessite collaboration avec prothésiste.',
  synonymes_recherche = 'Amputation | Jambe | Transtibiale | Transfémorale | Cuisse | Ischémie | Gangrène | Diabète | Moignon | Prothèse',
  codes_ccam = 'NZFA005',
  libelles_sources_lies = 'Amputation de membre inférieur',
  proposition_nouvel_acte_label = 'Amputation transtibiale ou transfémorale',
  updated_at = now()
WHERE id_protocole = 'ACT-0333';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation récidivante / Usure',
  definition_expert = 'Remplacement isolé de la tête fémorale prothétique (sans changer la tige). Permet de modifier le diamètre, l''offset ou le couple de frottement.',
  synonymes_recherche = 'Tête | Changement | PTH (Prothèse Totale Hanche) | Prothèse Totale Hanche | Céramique | Métal | Polyéthylène | Couple de frottement | Offset',
  codes_ccam = 'NEKA010',
  libelles_sources_lies = 'Changement de tête de prothèse de hanche',
  proposition_nouvel_acte_label = 'Remplacement isolé de la tête prothétique',
  updated_at = now()
WHERE id_protocole = 'ACT-0334';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection / Descellement massif',
  definition_expert = 'Ablation complète des composants d''une prothèse de hanche (tige et cotyle). Peut être suivie d''un spacer (infection) ou laisser en Girdlestone (résection arthroplasty).',
  synonymes_recherche = 'Ablation | PTH (Prothèse Totale Hanche) | Prothèse Totale Hanche | Dépose | Infection | Girdlestone | Spacer',
  codes_ccam = 'NEGA002',
  libelles_sources_lies = 'Ablation de prothèse totale de hanche',
  proposition_nouvel_acte_label = 'Dépose complète de PTH',
  updated_at = now()
WHERE id_protocole = 'ACT-0335';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendon d''Achille | Insuffisance tibial postérieur',
  definition_expert = 'Transfert du tendon long fléchisseur de l''hallux (FHL) sur le calcanéus pour suppléer une rupture négligée du tendon d''Achille ou renforcer le tibial postérieur déficient. Indication : rupture chronique du tendon d''Achille >6 mois, dysfonction du tibial postérieur stade avancé. Le FHL apporte puissance de flexion plantaire et prévient le pied plat valgus.',
  synonymes_recherche = 'FHL | Flexor Hallucis Longus | Long fléchisseur hallux | Transfert tendineux | Tendon d''Achille',
  codes_ccam = 'NJPAxx',
  libelles_sources_lies = 'Transfert tendineux pied/cheville',
  proposition_nouvel_acte_label = 'Transposition du tendon Flexor Hallucis Longus (FHL)',
  updated_at = now()
WHERE id_protocole = 'ACT-0336';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture phalangienne | Traumatisme digital',
  definition_expert = 'Ostéosynthèse d''une fracture de phalange (proximale, moyenne ou distale) par différentes techniques de fixation. Stabilisation chirurgicale d''une fracture digitale instable ou déplacée nécessitant réduction et fixation interne. Indication : fracture phalangienne déplacée, fracture articulaire, fracture instable, fracture ouverte. Objectif : consolidation anatomique, récupération mobilité digitale complète, prévention raideur articulaire. Technique variable selon localisation et type fracture : embrochage centromédullaire (broches Kirschner), vissage inter-fragmentaire, plaque mini-vissée. Choix matériel selon niveau (P1/P2/P3) et trait de fracture. Rééducation immédiate essentielle pour éviter raideur. Ablation matériel à 6 semaines si embrochage.',
  synonymes_recherche = 'Fracture doigt | Fracture phalange | Broche doigt | Vis doigt | Plaque phalange | Ostéosynthèse digitale',
  codes_ccam = 'MFCA007',
  libelles_sources_lies = 'Ostéosynthèse d''une fracture d''une phalange de la main',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de phalange',
  updated_at = now()
WHERE id_protocole = 'ACT-0346';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture col fémoral',
  definition_expert = 'Ostéosynthèse de fracture du col du fémur par vis cannelées (triple vissage type Garden) ou vis-plaque dynamique (DHS/Gamma si fracture bascule cervico-trochantérienne). Indication : fracture intra-capsulaire du sujet <75 ans avec fracture peu déplacée (Garden I-II). Objectif : préservation de la tête fémorale et consolidation en position anatomique.',
  synonymes_recherche = 'Col fémur | Fracture col | Vissage col | DHS | Vis-plaque | Garden',
  codes_ccam = 'NBCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture extracapsulaire du col du fémur',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du col du fémur (Vissage ou DHS)',
  updated_at = now()
WHERE id_protocole = 'ACT-0347';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Malposition fixateur | Consolidation dirigée',
  definition_expert = 'Modification de la configuration d''un fixateur externe (allongement progressif, correction angulaire, compression/distraction du foyer). Indication : allongement osseux programmé, correction de cal vicieux en cours de consolidation, stimulation de pseudarthrose. Peut nécessiter anesthésie si manipulation importante. Fixateurs types Ilizarov ou hexapodes Taylor.',
  synonymes_recherche = 'Fixateur externe | Réglage fixateur | Ajustement | Hexapode | Ilizarov',
  proposition_nouvel_acte_label = 'Ajustement ou recentrage d''un fixateur externe des membres',
  updated_at = now()
WHERE id_protocole = 'ACT-0348';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose | Cal vicieux | Défaut consolidation',
  definition_expert = 'Cure chirurgicale d''une pseudarthrose de l''humérus par avivement des berges, greffe osseuse et ostéosynthèse. Traitement d''un défaut de consolidation osseuse après fracture humérale évoluant depuis plus de 6 mois. Indication : échec consolidation d''une fracture de l''humérus (diaphyse), instabilité persistante, douleur chronique limitant fonction. Objectif : restauration continuité osseuse, consolidation définitive, récupération fonctionnelle du membre supérieur. Technique : avivement des surfaces osseuses non consolidées, comblement du foyer par greffe iliaque ou substitut, stabilisation par plaque vissée ou clou centromédullaire selon localisation. Immobilisation post-opératoire puis rééducation progressive.',
  synonymes_recherche = 'Pseudarthrose humérale | Cal vicieux humérus | Greffe humérus | Non-union humérus | Retard consolidation',
  codes_ccam = 'MEPA004',
  libelles_sources_lies = 'Réparation de pseudarthrose de la diaphyse de l''humérus, avec greffe osseuse',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose de l''humérus avec greffe osseuse',
  updated_at = now()
WHERE id_protocole = 'ACT-0349';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Enchondrome / Chondrome',
  definition_expert = 'Exérèse d''une tumeur cartilagineuse bénigne (enchondrome) d''une phalange. Curetage de la lésion et comblement par greffe osseuse ou substitut.',
  synonymes_recherche = 'Chondrome | Enchondrome | Tumeur | Cartilage | Phalange | Doigt | Curetage | Greffe | Bénin',
  codes_ccam = 'MDFA005',
  libelles_sources_lies = 'Exérèse de tumeur osseuse bénigne du doigt',
  proposition_nouvel_acte_label = 'Exérèse de tumeur cartilagineuse de phalange',
  updated_at = now()
WHERE id_protocole = 'ACT-0350';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur post-traumatique | Adhérences tendineuses',
  definition_expert = 'Libération chirurgicale (ténolyse) d''un tendon fléchisseur des doigts (FDS/FDP) bloqué par des adhérences cicatricielles post-traumatiques ou post-opératoires. Indication : limitation persistante de la flexion active malgré rééducation bien conduite. Dissection minutieuse des adhérences avec préservation des poulies. Mobilisation passive per-opératoire et rééducation immédiate.',
  synonymes_recherche = 'Ténolyse | Fléchisseur | Adhérences | Libération tendineuse | FDS | FDP',
  codes_ccam = 'MJPA002',
  libelles_sources_lies = 'Libération des tendons des muscles fléchisseurs des doigts sur un rayon de la main, par abord direct',
  proposition_nouvel_acte_label = 'Ténolyse de tendon fléchisseur au poignet ou à la main',
  updated_at = now()
WHERE id_protocole = 'ACT-0351';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture ulna',
  definition_expert = 'Ostéosynthèse de fracture de l''ulna par plaque et vis. Rechercher une luxation associée de la tête radiale (Monteggia).',
  synonymes_recherche = 'Ulna | Cubitus | Fracture | Plaque | Vis | Monteggia | Diaphyse',
  codes_ccam = 'MCCA010',
  libelles_sources_lies = 'Ostéosynthèse de fracture de l''ulna',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de l''ulna',
  updated_at = now()
WHERE id_protocole = 'ACT-0352';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture calcanéenne | Fracture os du talon',
  definition_expert = 'Ostéosynthèse de fracture du calcanéus (os du talon) par plaque et vis. Indication : fracture articulaire déplacée impliquant l''articulation sous-talienne (classification Sanders II-III-IV). Abord latéral élargi (Ollier). Objectif : restauration de la hauteur calcanéenne, de l''angle de Böhler et de la congruence sous-talienne. Prévention de l''arthrose post-traumatique.',
  synonymes_recherche = 'Calcanéum | Calcaneus | Os du talon | Fracture thalamique | Essex-Lopresti | Sanders',
  codes_ccam = 'NDCA004',
  libelles_sources_lies = 'Ostéosynthèse de fracture complexe du calcanéus, à foyer ouvert',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture du calcaneus',
  updated_at = now()
WHERE id_protocole = 'ACT-0353';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Brèche crânienne | Craniectomie décompressive',
  definition_expert = 'Reconstruction chirurgicale de la voûte crânienne après craniectomie décompressive (traumatisme crânien, AVC malin) ou exérèse tumorale. Technique : repositionnement du volet osseux autologue conservé (congélation) ou prothèse synthétique (titane, PEEK, PMMA sur mesure). Indication : protection cérébrale, restauration esthétique, amélioration hémodynamique cérébrale.',
  synonymes_recherche = 'Cranioplastie | Volet crânien | Prothèse crânienne | Reconstruction crâne | PMMA',
  codes_ccam = 'LAMA009',
  libelles_sources_lies = 'Cranioplastie de la voûte',
  proposition_nouvel_acte_label = 'Reconstruction de la voûte du crâne par volet osseux ou prothèse',
  updated_at = now()
WHERE id_protocole = 'ACT-0354';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose radio-ulnaire distale destructrice',
  definition_expert = 'Remplacement de la tête de l''ulna par un implant prothétique métallique au niveau du poignet (articulation radio-ulnaire distale). Alternative à la résection de Darrach, permet de conserver la stabilité du poignet et la force de serrage, contrairement à la simple résection qui peut entraîner une instabilité. Indiqué pour les arthroses sévères de l''articulation radio-ulnaire distale ou les séquelles de fractures du radius distal avec destruction de la cavité sigmoïde.',
  synonymes_recherche = 'Prothèse | Tête ulnaire | Arthroplastie | Implant | Ulna | Cubitus | RUD | Radio-Ulnaire Distale | Herbert | Eclipsis | Stabilité | Poignet',
  codes_ccam = 'MGKA002',
  libelles_sources_lies = 'Remplacement de l''articulation radioulnaire distale par prothèse',
  proposition_nouvel_acte_label = 'Arthroplastie de la tête ulnaire (Prothèse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0355';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement prothétique | Usure implant | Infection prothétique',
  definition_expert = 'Changement partiel ou total d''une prothèse de coude pour descellement, usure ou infection. Révision d''arthroplastie du coude avec ablation des composants défaillants et réimplantation. Indication : descellement aseptique (perte fixation humérale ou ulnaire), usure polyéthylène, infection chronique, instabilité prothétique, fracture péri-prothétique. Objectif : restauration fonction coude, soulagement douleur, stabilité articulaire. Technique : abord postérieur du coude, dépose composants (huméral et ulnaire), curetage ciment si présent, préparation os receveur, réimplantation composants de révision (quilles longues si perte osseuse). Si infection : protocole en 1 ou 2 temps avec spaceur antibiotique. Geste complexe, stock osseux souvent limité, risque de raideur post-opératoire élevé.',
  synonymes_recherche = 'Prothèse coude | PTC | Changement prothèse coude | Reprise coude | Descellement coude | Révision prothèse coude',
  codes_ccam = 'MEPA011',
  libelles_sources_lies = 'Changement d''un ou plusieurs composants d''une prothèse totale de coude',
  proposition_nouvel_acte_label = 'Changement des composants d''une prothèse de coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0356';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture glène scapulaire | Fracture cavité glénoïde',
  definition_expert = 'Ostéosynthèse de fracture articulaire de la glène scapulaire (classification Ideberg) par vis et/ou plaque. Indication : fracture déplacée avec fragment >25% de la surface glénoïdienne, instabilité gléno-humérale. Abord postérieur de Judet. Objectif : restauration de la congruence articulaire pour prévenir l''instabilité et l''arthrose gléno-humérale post-traumatique.',
  synonymes_recherche = 'Glène | Scapula | Omoplate | Fracture glénoïde | Ideberg',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de la glène de la scapula',
  updated_at = now()
WHERE id_protocole = 'ACT-0357';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Échec ostéosynthèse col | Pseudarthrose col',
  definition_expert = 'Reprise d''ostéosynthèse du col fémoral (vis, vis-plaque DHS) pour échec de consolidation, déplacement secondaire ou descellement du matériel. Indication : pseudarthrose, cal vicieux, matériel inadapté. Options : nouvelle synthèse si capital osseux suffisant ou conversion en prothèse (PTH ou arthroplastie intermédiaire) si destruction céphalique.',
  synonymes_recherche = 'THS | Triple vissage col | Vis col fémur | Reprise fracture col',
  codes_ccam = 'NBCA005',
  libelles_sources_lies = 'Ostéosynthèse de fracture intracapsulaire du col [transcervicale] du fémur',
  proposition_nouvel_acte_label = 'Changement de matériel d''ostéosynthèse du col du fémur',
  updated_at = now()
WHERE id_protocole = 'ACT-0358';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement / Usure tige',
  definition_expert = 'Remplacement de la tige fémorale d''une prothèse descellée. Utilise des tiges de révision (modulaires, longues) pour obtenir une fixation stable.',
  synonymes_recherche = 'Changement | Composant fémoral | Tige | Révision | Descellement | PTH (Prothèse Totale Hanche) | Tige de révision',
  codes_ccam = 'NEKA003',
  libelles_sources_lies = 'Révision du composant fémoral d''une prothèse',
  proposition_nouvel_acte_label = 'Remplacement du composant fémoral',
  updated_at = now()
WHERE id_protocole = 'ACT-0359';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hernie discale lombaire | Sténose canalaire',
  definition_expert = 'Discectomie lombaire (exérèse de hernie discale) associée à la pose d''un dispositif interépineux (DIAM, Coflex) pour stabilisation dynamique. Indication : hernie discale avec instabilité segmentaire modérée, sténose canalaire débutante. Le dispositif limite l''extension et décharge les facettes articulaires sans bloquer complètement le segment (alternative à l''arthrodèse).',
  synonymes_recherche = 'Hernie discale | DIAM | Dispositif interépineux | HD | Cofflex | Stabilisation dynamique',
  codes_ccam = 'LFFA002',
  libelles_sources_lies = 'Exérèse d''une hernie discale de la colonne vertébrale lombale, par abord postérieur ou postérolatéral',
  proposition_nouvel_acte_label = 'Exérèse de hernie discale et pose de dispositif interépineux',
  updated_at = now()
WHERE id_protocole = 'ACT-0360';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose | Conflit ostéophytique | Bec de perroquet',
  definition_expert = 'Résection chirurgicale d''ostéophytes (excroissances osseuses arthrosiques) gênants. Indication : conflit mécanique douloureux (tendineux, nerveux, articulaire), limitation de mobilité. Localisation fréquente : épaule (acromion), hanche (cotyle), genou (épines tibiales), cheville. Exérèse à la fraise motorisée sous arthroscopie ou à ciel ouvert selon localisation.',
  synonymes_recherche = 'Ostéophyte | Bec ostéophytique | Exostose | Bec de perroquet | Chondromatose',
  proposition_nouvel_acte_label = 'Exérèse de saillie osseuse (Ostéophytose articulaire)',
  updated_at = now()
WHERE id_protocole = 'ACT-0361';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Épanchement articulaire | Arthrite | Bursite olécranienne',
  definition_expert = 'Ponction évacuatrice ou diagnostique de l''articulation du coude. Évacuation par voie percutanée d''un épanchement articulaire (hémarthrose post-traumatique ou arthrite) ou d''une bursite olécranienne. Indication : épanchement articulaire douloureux, suspicion d''arthrite septique nécessitant analyse microbiologique, bursite olécranienne volumineuse. Objectif : soulagement douleur, diagnostic étiologique (analyse liquide), prévention raideur articulaire. Technique : ponction à l''aiguille par voie latérale ou postérieure selon localisation, sous asepsie stricte. Peut être couplée à une infiltration corticoïde selon contexte.',
  synonymes_recherche = 'Ponction coude | Arthrocentèse coude | Ponction olécrane | Évacuation épanchement coude',
  codes_ccam = 'MJJB001',
  libelles_sources_lies = 'Ponction articulaire du coude, par voie transcutanée',
  proposition_nouvel_acte_label = 'Ponction articulaire du coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0362';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lipome | Kyste sébacé | Fibrome sous-cutané',
  definition_expert = 'Exérèse chirurgicale d''une tumeur bénigne des tissus mous sous-cutanés. Ablation d''une masse superficielle non musculaire à caractère bénin (lipome, kyste sébacé, fibrome). Indication : tumeur bénigne superficielle symptomatique (gêne esthétique, douleur compression), diagnostic anatomopathologique de confirmation, prévention transformation (rare). Objectif : exérèse complète capsule incluse, confirmation histologique bénignité, soulagement gêne. Technique : incision cutanée en regard tumeur, dissection plan sous-cutané, exérèse tumorale en bloc avec capsule, hémostase, suture cutanée. Geste ambulatoire simple si tumeur <5 cm. Envoi systématique anatomopathologie pour éliminer sarcome (rare mais critique). Récidive exceptionnelle si exérèse complète.',
  synonymes_recherche = 'Tumeur sous-cutanée | Lipome | Kyste | Exérèse tumeur | Tumeur bénigne | Masse sous-cutanée',
  codes_ccam = 'QZFA008',
  libelles_sources_lies = 'Exérèse d''une tumeur bénigne superficielle des tissus mous',
  proposition_nouvel_acte_label = 'Exérèse de tumeur bénigne des tissus mous sous-cutanés',
  updated_at = now()
WHERE id_protocole = 'ACT-0363';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Consolidation osseuse (Tibia)',
  definition_expert = 'Retrait d''un clou centromédullaire du tibia après consolidation osseuse complète d''une fracture de jambe. L''intervention nécessite une incision au niveau du site d''introduction (plateau tibial antérieur), le retrait des vis de verrouillage proximal et distal, puis l''extraction du clou à l''aide d''un extracteur spécifique et d''une masse à coulisse. Contrôle radioscopique systématique.',
  synonymes_recherche = 'Clou | Tibia | AMO | Ablation Matériel Ostéosynthèse | Extraction | Clou centromédullaire | Clou T2 | Clou Trigen | Extracteur | Masse à coulisse',
  codes_ccam = 'PAGA008',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse des membres sur un site',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse (clou tibia)',
  updated_at = now()
WHERE id_protocole = 'ACT-0364';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Indication variable (Corps étrangers, Lavage)',
  definition_expert = 'Ouverture chirurgicale de l''articulation du genou par voie directe. Utilisée pour corps étrangers volumineux, lavage septique, ou quand l''arthroscopie n''est pas possible.',
  synonymes_recherche = 'Arthrotomie | Genou | Ouverture | Corps étranger | Lavage | Septique | Synovectomie',
  codes_ccam = 'NFJA002',
  libelles_sources_lies = 'Arthrotomie du genou',
  proposition_nouvel_acte_label = 'Ouverture chirurgicale du genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0365';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose tibiale | Non-consolidation',
  definition_expert = 'Cure chirurgicale de pseudarthrose diaphysaire du tibia par avivement du foyer, réduction-ostéosynthèse (plaque ou clou) et greffe osseuse autologue (crête iliaque ou réinjection). Indication : absence de consolidation >6 mois post-fracture. Objectif : stimulation biologique de la consolidation osseuse et stabilisation mécanique du foyer.',
  synonymes_recherche = 'Pseudarthrose tibia | Greffe osseuse | Non-consolidation diaphyse | Tibia',
  proposition_nouvel_acte_label = 'Cure de pseudarthrose de la diaphyse tibiale avec greffe osseuse',
  updated_at = now()
WHERE id_protocole = 'ACT-0366';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture fémur distal / Sus-condylienne',
  definition_expert = 'Ostéosynthèse des fractures du fémur distal par clou introduit par le genou (voie rétrograde via l''échancrure intercondylienne). Indiqué pour fractures sus-condyliennes, péri-prothétiques, ou fémurs inaccessibles par voie proximale.',
  synonymes_recherche = 'Clou rétrograde | Fémur | Genou | Fracture | Sus-condylienne | Péri-prothétique | Échancrure intercondylienne | Verrouillage',
  codes_ccam = 'NFCA006',
  libelles_sources_lies = 'Ostéosynthèse du fémur par clou centromédullaire rétrograde',
  proposition_nouvel_acte_label = 'Ostéosynthèse fémorale par clou rétrograde',
  updated_at = now()
WHERE id_protocole = 'ACT-0367';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Griffe d''orteil | Arthrose inter-phalangienne',
  definition_expert = 'Arthrodèse (fusion articulaire) d''une articulation inter-phalangienne d''orteil (IPP ou IPD) par technique mini-invasive percutanée (broche ou vis). Indication : déformation en griffe ou en marteau d''orteil invalidante, arthrose inter-phalangienne douloureuse. Correction de la déformation et suppression de la douleur par blocage articulaire définitif.',
  synonymes_recherche = 'Arthrodèse orteil | Percutané | Griffe orteil | IPP | IPD | Mini-invasif',
  codes_ccam = 'NHMA002',
  libelles_sources_lies = 'Arthroplastie par résection de l''articulation ou arthrodèse interphalangienne d''un orteil latéral',
  proposition_nouvel_acte_label = 'Arthrodese d''un orteil par technique percutanée',
  updated_at = now()
WHERE id_protocole = 'ACT-0368';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Coxarthrose / Diagnostic',
  definition_expert = 'Injection thérapeutique dans l''articulation de la hanche sous guidage radiologique ou échographique. Corticoïdes ou viscosupplémentation pour coxarthrose.',
  synonymes_recherche = 'Infiltration | Hanche | Injection | Corticoïdes | Acide hyaluronique | Coxarthrose | Guidage | Scopie | Échographie',
  codes_ccam = 'NZHB001',
  libelles_sources_lies = 'Injection dans l''articulation coxofémorale',
  proposition_nouvel_acte_label = 'Injection intra-articulaire de la hanche',
  updated_at = now()
WHERE id_protocole = 'ACT-0369';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur osseuse sacrum | Métastase sacrée | Chordome',
  definition_expert = 'Exérèse chirurgicale d''une tumeur du sacrum (bénigne ou maligne). Ablation tumorale du segment sacré de la colonne vertébrale avec résection osseuse partielle ou totale selon extension. Indication : tumeur primitive sacrum (chordome, ostéosarcome, chondroblastome), métastase sacrée volumineuse ou symptomatique, kyste osseux anévrismal sacré. Objectif : exérèse complète si tumeur bénigne, réduction volume tumoral et décompression si métastase, préservation fonction sphinctérienne et neurologique. Technique : abord postérieur sacré, laminectomie sacrée, curetage ou résection large selon type tumoral, comblement par greffe ou ciment si résection partielle. Risque neurologique élevé (racines sacrées), geste complexe souvent multidisciplinaire (chirurgie oncologique). Surveillance post-opératoire sphinctérienne.',
  synonymes_recherche = 'Tumeur sacrum | Chordome | Sacrum | Exérèse sacrum | Métastase sacrée | Tumeur osseuse bassin',
  codes_ccam = 'LHFA009',
  libelles_sources_lies = 'Exérèse chirurgicale d''une tumeur de l''os sacrum',
  proposition_nouvel_acte_label = 'Exérèse de tumeur de l''os sacrum',
  updated_at = now()
WHERE id_protocole = 'ACT-0370';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique de l''épaule',
  definition_expert = 'Lavage chirurgical d''une épaule infectée. Par arthrotomie ou arthroscopie, drainage et lavage abondant. Antibiothérapie IV.',
  synonymes_recherche = 'Arthrite | Épaule | Septique | Infection | Lavage | Arthrotomie | Arthroscopie | Prélèvement',
  codes_ccam = 'MEJA001',
  libelles_sources_lies = 'Lavage de l''articulation scapulohumérale',
  proposition_nouvel_acte_label = 'Lavage articulaire de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0371';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Discopathie lombaire | Sténose canalaire récidivante',
  definition_expert = 'Ablation et remplacement d''un dispositif interépineux de type DIAM (Device for Intervertebral Assisted Motion). Changement d''un implant intersépineux lombaire posé pour discopathie ou sténose canalaire, en cas d''échec ou de migration. Indication : persistance lombalgie ou sciatalgie malgré DIAM en place, migration du dispositif, sténose résiduelle, intolérance matériel. Objectif : soulagement symptômes par repositionnement correct ou conversion vers arthrodèse si échec définitif. Technique : abord postérieur médian lombaire, repérage niveau sous scopie, ablation DIAM, évaluation lésions disco-ligamentaires. Option 1 : pose nouveau DIAM de taille adaptée. Option 2 : conversion en arthrodèse intersomatique (TLIF/PLIF) si instabilité. Décision per-opératoire selon qualité osseuse et ligamentaire.',
  synonymes_recherche = 'DIAM | Dispositif interépineux | Coussin lombaire | Cale interépineuse | Reprise DIAM | Changement intersépineux',
  codes_ccam = 'LHPA008',
  libelles_sources_lies = 'Ablation-remplacement de dispositif intersépineux lombaire de type DIAM',
  proposition_nouvel_acte_label = 'Remplacement de dispositif interépineux (Rachis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0372';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Complication Implant Interépineux (Rachis)',
  definition_expert = 'Retrait chirurgical d''un dispositif de distraction inter-épineuse de type DIAM (coussin en silicone placé entre deux épineuses vertébrales lombaires). Indiqué en cas de complication (conflit, migration), d''échec thérapeutique ou de nécessité d''arthrodèse secondaire. Abord postérieur médian avec dissection des muscles paravertébraux, exposition des épineuses et extraction du dispositif.',
  synonymes_recherche = 'DIAM | Rachis | Entre-épineux | Interépineux | Ressort | Espaceur | Cale | Dispositif interépineux | Ablation | Retrait | Lombaire',
  codes_ccam = 'LHGA010',
  libelles_sources_lies = 'Ablation de matériel d''ostéosynthèse de la colonne vertébrale',
  proposition_nouvel_acte_label = 'Ablation de matériel d''ostéosynthèse rachidienne',
  updated_at = now()
WHERE id_protocole = 'ACT-0373';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose trochantérienne | Descellement trochanter',
  definition_expert = 'Réparation chirurgicale de la non-consolidation du grand trochanter après ostéotomie ou arrachement. Indication : pseudarthrose post-opératoire (PTH voie postérieure ou traumatique). Technique : réduction-réfixation par cerclage-haubanage métallique (câbles) ou vis-plaque avec greffe osseuse spongieuse pour favoriser la fusion.',
  synonymes_recherche = 'Grand trochanter | Pseudarthrose trochantérienne | Réfixation | Cable cerclage | Hauban',
  codes_ccam = 'NBCA004',
  libelles_sources_lies = 'Ostéosynthèse du grand trochanter pour pseudarthrose',
  proposition_nouvel_acte_label = 'Réfixation du grand trochanter pour non-consolidation',
  updated_at = now()
WHERE id_protocole = 'ACT-0374';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Ostéonécrose aseptique de hanche',
  definition_expert = 'Traitement précoce de l''ostéonécrose aseptique de la tête fémorale (stades I-II). Consiste à forer le col et la tête pour diminuer la pression intra-osseuse et stimuler la revascularisation. Parfois associé à une greffe de moelle ou de matrice osseuse.',
  synonymes_recherche = 'Forage | Décompression | Ostéonécrose | Nécrose | Tête fémorale | Hanche | Core decompression | ONFH | Stade précoce | Mèche',
  codes_ccam = 'NEJA001',
  libelles_sources_lies = 'Forage de décompression de la tête fémorale',
  proposition_nouvel_acte_label = 'Forage de décompression de la tête fémorale',
  updated_at = now()
WHERE id_protocole = 'ACT-0341';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Descellement vis | Migration vis céphalique',
  definition_expert = 'Remplacement de la vis céphalique d''un implant d''ostéosynthèse trochantérienne (DHS, clou Gamma) en cas de migration (cut-out), descellement ou mal-position. Indication : mobilisation de la vis dans la tête fémorale avec risque de perforation articulaire. Repositionnement de la vis en zone optimale (centre-centre ou inférieur) sous amplificateur.',
  synonymes_recherche = 'Vis céphalique | DHS | Gamma | Cut-out | Reprise fracture',
  proposition_nouvel_acte_label = 'Remplacement de la vis céphalique d''un matériel d''ostéosynthèse fémorale',
  updated_at = now()
WHERE id_protocole = 'ACT-0375';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture coiffe des rotateurs antérieure | Tendinopathie long biceps',
  definition_expert = 'Réparation chirurgicale du tendon du muscle subscapulaire (coiffe des rotateurs antérieure) associée à une ténotomie du long biceps. Suture tendineuse d''une rupture du subscapulaire (face antérieure de la coiffe) combinée à une section thérapeutique du long chef du biceps souvent pathologique. Indication : rupture isolée ou associée du subscapulaire (traumatique ou dégénérative), instabilité antérieure d''épaule, tendinopathie douloureuse du long biceps. Objectif : restauration force de rotation interne, stabilisation épaule, soulagement douleur biceps. Technique : abord antérieur deltopectoral, identification et suture du subscapulaire sur tubercule mineur par ancres, ténotomie du long biceps à son origine sur le bourrelet glénoïdien (laissé libre dans gouttière ou ténodésé). Immobilisation coude au corps 6 semaines.',
  synonymes_recherche = 'Sous-scapulaire | Subscapulaire | Long biceps | LB | Ténotomie biceps | Coiffe antérieure | Réparation subscapulaire',
  codes_ccam = 'MFPA002',
  libelles_sources_lies = 'Suture du tendon du muscle subscapulaire de l''épaule, avec ténotomie du tendon du long biceps',
  proposition_nouvel_acte_label = 'Réparation du subscapulaire et ténotomie du long biceps',
  updated_at = now()
WHERE id_protocole = 'ACT-0376';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Maladie de Haglund | Conflit postérieur cheville',
  definition_expert = 'Résection de l''exostose postéro-supérieure du calcanéus responsable d''un conflit avec le tendon d''Achille (maladie de Haglund). Indication : bursite rétro-calcanéenne réfractaire au traitement médical. Technique : ostéotomie de Cochrane (résection cunéiforme) par abord postéro-latéral ou endoscopique. Suppression du conflit mécanique et de la douleur.',
  synonymes_recherche = 'Haglund | Exostose calcanéenne | Conflit postérieur | Ostéotomie Cochrane | Bursite rétro-calcanéenne',
  libelles_sources_lies = 'Ostéotomie calcanéus (Cochrane)',
  proposition_nouvel_acte_label = 'Résection de l''os calcaneus (Ostéotomie de Cochrane)',
  updated_at = now()
WHERE id_protocole = 'ACT-0377';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Compression nerf médian | Syndrome pronateur | Neuropathie médiane',
  definition_expert = 'Libération chirurgicale de l''expansion aponévrotique du biceps (lacertus fibrosus) comprimant le nerf médian au coude. Section de la bandelette fibreuse du biceps brachial responsable d''un syndrome compressif du nerf médian en regard du pli du coude. Indication : neuropathie du nerf médian au coude (paresthésies territoire médian main), syndrome du pronateur rond par compression lacertus fibrosus, échec traitement conservateur. Objectif : décompression nerf médian, disparition paresthésies, récupération motricité intrinsèque main. Technique : courte incision face antérieure coude, identification nerf médian, section complète lacertus fibrosus et vérification libération nerveuse sur toute longueur du coude. Exploration éventuelle loge pronateur rond si compression distale associée. Geste simple, ambulatoire, récupération rapide.',
  synonymes_recherche = 'Lacertus fibrosus | Aponévrose bicipitale | Syndrome pronateur | Compression nerf médian | Libération lacertus | Nerf médian coude',
  codes_ccam = 'MFBA005',
  libelles_sources_lies = 'Libération du lacertus fibrosus (aponévrose bicipitale) au coude',
  proposition_nouvel_acte_label = 'Libération de l''aponévrose du biceps au coude (Lacertus fibrosus)',
  updated_at = now()
WHERE id_protocole = 'ACT-0378';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendineuse du triceps | Avulsion olécranienne',
  definition_expert = 'Réinsertion chirurgicale du tendon du triceps brachial sur l''olécrâne après rupture. Suture tendineuse ou refixation osseuse d''une rupture complète ou partielle du tendon terminal du triceps au niveau de son insertion sur l''olécrâne. Indication : rupture traumatique du triceps (rare, souvent sportifs ou chute sur coude fléchi), déficit d''extension active du coude. Objectif : restauration complète de l''extension active du coude, récupération force tricipitale. Technique : abord postérieur du coude, avivement insertion olécranienne, réinsertion du moignon tendineux par ancres trans-osseuses ou tunnels osseux sur l''olécrâne. Immobilisation coude en extension relative 4-6 semaines puis mobilisation progressive. Pronostic favorable si prise en charge précoce.',
  synonymes_recherche = 'Triceps | Triceps brachial | Réinsertion triceps | Suture triceps | Rupture triceps | Olécrâne',
  codes_ccam = 'MEPA009',
  libelles_sources_lies = 'Suture ou réinsertion du tendon du muscle triceps brachial à l''olécrâne',
  proposition_nouvel_acte_label = 'Suture ou réinsertion du tendon du muscle triceps brachial',
  updated_at = now()
WHERE id_protocole = 'ACT-0379';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Usure / Descellement patellaire',
  definition_expert = 'Remplacement isolé du composant patellaire (bouton rotulien) d''une prothèse de genou usé ou descellé, sans changer les autres composants si ceux-ci sont stables.',
  synonymes_recherche = 'Rotule | Patella | Changement | PTG (Prothèse Totale Genou) | Prothèse Totale Genou | Bouton rotulien | Usure | Descellement | Polyéthylène | Révision',
  codes_ccam = 'NFKA010',
  libelles_sources_lies = 'Remplacement du composant patellaire d''une PTG',
  proposition_nouvel_acte_label = 'Remplacement du bouton rotulien',
  updated_at = now()
WHERE id_protocole = 'ACT-0380';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste synovial + Synovite',
  definition_expert = 'Ablation d''un kyste synovial avec excision de la synoviale pathologique environnante pour limiter le risque de récidive.',
  synonymes_recherche = 'Kyste | Synovite | Synovectomie | Exérèse | Poignet | Récidive',
  codes_ccam = 'MHFA002',
  libelles_sources_lies = 'Exérèse de kyste articulaire avec synovectomie',
  proposition_nouvel_acte_label = 'Exérèse de kyste avec synovectomie',
  updated_at = now()
WHERE id_protocole = 'ACT-0340';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur vertébrale | Fracture-tassement | Spondylodiscite',
  definition_expert = 'Résection chirurgicale complète (ou partielle) d''un corps vertébral. Indication : tumeur vertébrale, fracture-tassement instable, spondylodiscite destructrice avec compression médullaire. Reconstruction par cage intersomatique (titane, PEEK) et fixation instrumentée antérieure et/ou postérieure. Geste majeur avec risque neurologique et vasculaire élevé.',
  synonymes_recherche = 'Corporectomie | Somatectomie | Exérèse vertébrale | Cage vertébrale | Reconstruction rachis',
  codes_ccam = 'LFFA009',
  libelles_sources_lies = 'Corporectomie vertébrale partielle, par laparotomie ou par lombotomie',
  proposition_nouvel_acte_label = 'Exérèse totale ou partielle d''un corps vertébral',
  updated_at = now()
WHERE id_protocole = 'ACT-0339';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture orteil | Fracture phalange pied',
  definition_expert = 'Ostéosynthèse de fracture d''orteil (phalanges ou métatarsien) par broche percutanée, vis ou mini-plaque. Indication : fracture déplacée, fracture articulaire, instabilité. La plupart des fractures d''orteils sont traitées orthopédiquement (syndactylie). Chirurgie réservée aux fractures instables du gros orteil (hallux) ou fractures multiples du pied traumatique.',
  synonymes_recherche = 'Fracture orteil | Phalange pied | Broche | Vis orteil | Plaque mini',
  libelles_sources_lies = 'Ostéosynthèse phalange pied',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture d''orteil',
  updated_at = now()
WHERE id_protocole = 'ACT-0338';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture tête radiale | Fracture coude complexe',
  definition_expert = 'Remplacement prothétique de la tête radiale (fracture Mason III-IV comminutive non reconstructible) ou arthroplastie totale de coude pour fracture-luxation complexe. Indication : fracture irréparable avec instabilité du coude. La prothèse de tête radiale restaure la stabilité latérale et la transmission des charges du membre supérieur.',
  synonymes_recherche = 'Prothèse tête radiale | PTR | Prothèse coude | Fracture Mason III-IV',
  codes_ccam = 'MCKA002',
  libelles_sources_lies = 'Remplacement de la tête radiale par prothèse, par abord direct',
  proposition_nouvel_acte_label = 'Remplacement de la tête radiale ou du coude par prothèse pour fracture',
  updated_at = now()
WHERE id_protocole = 'ACT-0337';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture vertébrale | Spondylolisthésis | Instabilité rachidienne',
  definition_expert = 'Ostéosynthèse de la colonne vertébrale par fixation postérieure instrumentée. Stabilisation chirurgicale du rachis par mise en place de vis pédiculaires et tiges de maintien sur un ou plusieurs étages vertébraux. Indication : fracture vertébrale instable (traumatique), spondylolisthésis symptomatique, déformation rachidienne, instabilité post-laminectomie, tumeur vertébrale. Objectif : stabilisation immédiate du rachis, protection neurologique, correction déformation, obtention fusion osseuse si arthrodèse associée. Technique : abord postérieur médian, mise en place vis pédiculaires bilatérales sous contrôle scopique (plusieurs étages), connexion par tiges métalliques pré-cintrées, compression ou distraction selon objectif. Greffe osseuse postéro-latérale si fusion recherchée. Mobilisation rapide, corset 3 mois.',
  synonymes_recherche = 'Arthrodèse rachis | Fixation rachis | Vis pédiculaires | Tiges rachidiennes | Ostéosynthèse vertébrale | Stabilisation rachis',
  codes_ccam = 'LHPA012',
  libelles_sources_lies = 'Ostéosynthèse du rachis par fixation postérieure avec vis pédiculaires et tiges',
  proposition_nouvel_acte_label = 'Ostéosynthèse de la colonne vertébrale (Fixation postérieure)',
  updated_at = now()
WHERE id_protocole = 'ACT-0342';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Paralysie plexus brachial | Rupture massive coiffe | Déficit moteur épaule',
  definition_expert = 'Transfert chirurgical du grand pectoral et/ou du deltoïde pour compenser une paralysie ou rupture massive de la coiffe des rotateurs. Transposition musculaire permettant restauration partielle de la fonction d''élévation et rotation de l''épaule en cas de lésion irréparable de la coiffe. Indication : rupture massive irréparable coiffe (> 5 cm), paralysie plexus brachial haute, déficit moteur majeur épaule avec muscle pectoral/deltoïde fonctionnels. Objectif : restauration partielle élévation antérieure bras, amélioration fonction main dans espace, soulagement douleur. Technique : abord delto-pectoral, désinsertion grand pectoral de l''humérus et translocation vers tubercule majeur (ancres), renforcement par portion antérieure deltoïde selon cas. Rééducation longue et progressive (6-12 mois). Alternative : prothèse inversée si stock osseux suffisant.',
  synonymes_recherche = 'Transfert tendineux épaule | Grand pectoral | Deltoïde | Paralysie épaule | Transfert musculaire épaule | Compensation coiffe',
  codes_ccam = 'MFMA008',
  libelles_sources_lies = 'Transfert musculaire du grand pectoral et du deltoïde pour compensation d''une paralysie de l''épaule',
  proposition_nouvel_acte_label = 'Transfert tendineux pour compensation de paralysie de l''épaule',
  updated_at = now()
WHERE id_protocole = 'ACT-0343';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité scapho-lunaire | DISI | Dissociation',
  definition_expert = 'Réparation chirurgicale de rupture du ligament scapho-lunaire (SLIL) responsable d''instabilité du carpe avec dissociation scapho-lunaire (DISI). Indication : instabilité scapho-lunaire aiguë (<6 semaines) ou chronique symptomatique. Techniques : réinsertion-suture directe (stade aigu), ligamentoplastie de reconstruction (chronique), ou arthrodèse partielle si arthrose installée.',
  synonymes_recherche = 'Scapho-lunaire | SLIL | Ligament scapho-lunaire | DISI | Instabilité poignet | Dissociation',
  libelles_sources_lies = 'Reconstruction ligamentaire poignet générique',
  proposition_nouvel_acte_label = 'Réparation ou reconstruction du ligament scapho-lunaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0344';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur nerveuse (Schwannome / Névrome)',
  definition_expert = 'Ablation chirurgicale d''une tumeur (bénigne le plus souvent : schwannome) développée aux dépens du nerf ulnaire. Énucléation sous grossissement optique (microscope ou loupes) pour préserver les fibres nerveuses saines.',
  synonymes_recherche = 'Tumeur | Nerf ulnaire | Schwannome | Neurofibrome | Kyste intraneural | Exérèse | Microchirurgie | Loupes | Microscope | Masse | Boule | Anatomopathologie | Énucléation',
  codes_ccam = 'AHFA006',
  libelles_sources_lies = 'Exérèse de tumeur d''un nerf du membre supérieur',
  proposition_nouvel_acte_label = 'Exérèse de tumeur du nerf ulnaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0345';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture col / Déplacement secondaire',
  definition_expert = 'Mise en place ou retrait d''une vis dans la tête fémorale pour traiter une fracture du col ou un déplacement secondaire.',
  synonymes_recherche = 'Vis | Céphalique | Col | Tête fémorale | Fracture | Fixation | Retrait | Déplacement',
  codes_ccam = 'NBCA005',
  libelles_sources_lies = 'Vis d''ostéosynthèse de la tête fémorale',
  proposition_nouvel_acte_label = 'Mise en place ou retrait d''une vis céphalique',
  updated_at = now()
WHERE id_protocole = 'ACT-0414';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Kyste épidermique | Kyste sébacé infecté',
  definition_expert = 'Exérèse chirurgicale d''un kyste sébacé (kyste épidermique) cutané. Ablation complète d''un kyste sous-cutané bénin contenant du sébum et des débris cornés. Indication : kyste sébacé symptomatique (inflammation récidivante, infection, gêne esthétique), augmentation volume, prévention transformation maligne (exceptionnelle). Objectif : exérèse complète avec capsule pour éviter récidive, confirmation histologique, soulagement. Technique : incision fusiforme cutanée englobant orifice kyste, dissection capsule kystique en bloc (sans rupture pour éviter récidive), exérèse totale, hémostase, suture cutanée intradermal si possible. Geste ambulatoire simple. Envoi anatomopathologie systématique pour éliminer carcinome épidermoïde (rare sur kyste ancien). Récidive 5% si capsule incomplète. Cicatrisation 10-15 jours.',
  synonymes_recherche = 'Kyste sébacé | Kyste épidermique | Loupe | Exérèse kyste cutané | Kyste infecté',
  codes_ccam = 'QZFA028',
  libelles_sources_lies = 'Exérèse chirurgicale d''un kyste sébacé',
  proposition_nouvel_acte_label = 'Exérèse de kyste sébacé cutané',
  updated_at = now()
WHERE id_protocole = 'ACT-0381';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture tendineuse patellaire | Avulsion rotulienne',
  definition_expert = 'Suture chirurgicale du tendon patellaire (rotulien) après rupture complète. Réparation tendineuse d''urgence d''une rupture du tendon reliant la rotule au tubercule tibial antérieur, empêchant l''extension active du genou. Indication : rupture complète du tendon rotulien (traumatique chez sportif ou patient sous corticoïdes), impossibilité d''extension active genou, ascension rotulienne (patella alta). Objectif : restauration continuité appareil extenseur genou, récupération extension active complète, retour activités. Technique : abord antérieur genou, suture directe bord à bord du tendon par fils solides non résorbables (technique cadre), renfort par cerclage trans-osseux rotulien (tunnels dans patella et tibia), protection suture. Immobilisation genou en extension 6 semaines puis mobilisation progressive. Pronostic favorable si prise en charge précoce (<2 semaines).',
  synonymes_recherche = 'Tendon rotulien | Tendon patellaire | Rupture rotulien | Suture rotulien | Avulsion patellaire | Réparation patellaire',
  codes_ccam = 'NFPA008',
  libelles_sources_lies = 'Suture du tendon patellaire (tendon rotulien) après rupture',
  proposition_nouvel_acte_label = 'Suture ou réparation du tendon patellaire (Rotulien)',
  updated_at = now()
WHERE id_protocole = 'ACT-0382';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture fibula | Fracture malléolaire',
  definition_expert = 'Ostéosynthèse d''une fracture de la fibula (péroné) par plaque vissée. Réduction et fixation chirurgicale d''une fracture de la fibula, souvent dans cadre fracture bimalléolaire ou trimalléolaire cheville. Indication : fracture fibula déplacée, fracture bimalléolaire/trimalléolaire cheville, diastasis tibio-fibulaire (syndesmose). Objectif : restauration longueur et axe fibulaire, reconstruction mortaise tibio-fibulaire anatomique, stabilité cheville, prévention arthrose. Technique : abord latéral cheville, exposition foyer fracturaire fibula, réduction anatomique sous scopie, fixation par plaque 1/3 tubulaire neutralisation (6-8 trous) avec vis bicorticales, contrôle syndesmose et réduction malléole médiale si fracture associée. Immobilisation plâtrée 6 semaines, appui partiel à 6 semaines puis complet selon consolidation. Ablation plaque possible à 18 mois si gêne.',
  synonymes_recherche = 'Péroné | Fibula | Fracture péroné | Malléole latérale | Plaque péroné | Ostéosynthèse fibula',
  codes_ccam = 'NFCA024',
  libelles_sources_lies = 'Ostéosynthèse d''une fracture de la fibula (Péroné)',
  proposition_nouvel_acte_label = 'Ostéosynthèse de fracture de la fibula',
  updated_at = now()
WHERE id_protocole = 'ACT-0383';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Tumeur base crâne | Méningiome | Métastase crânienne',
  definition_expert = 'Exérèse chirurgicale d''une tumeur de l''étage antérieur de la base du crâne (plancher frontal). Ablation tumorale complexe nécessitant approche neurochirurgicale par craniotomie frontale ou voie trans-nasale endoscopique. Indication : tumeur primitive base crâne étage antérieur (méningiome olfactif, ostéome frontal), métastase crânienne symptomatique, tumeur bénigne volumineuse compressive (neurofibromatose). Objectif : exérèse complète si tumeur bénigne, cytoréduction si malignité, décompression structures nobles (nerf optique, sinus caverneux), prévention complications neurologiques. Technique : craniotomie frontale bilatérale, dissection tumorale prudente avec préservation artères cérébrales antérieures et nerfs olfactifs si possible, exérèse pièce par pièce si volumineuse, reconstruction dure-mère et plancher osseux si résection large. Alternative : voie trans-sphénoïdale endoscopique si tumeur médiане accessible. Geste neurochirurgical majeur, risque complications (fistule LCR 10%, méningite, anosmie). Surveillance post-opératoire neuro-réanimation. Pronostic dépend histologie : excellent si méningiome bénin (récidive <10%), réservé si métastase.',
  synonymes_recherche = 'Tumeur base crâne | Étage antérieur | Méningiome | Exérèse crânienne | Neurochirurgie crânienne | Tumeur frontale basale',
  codes_ccam = 'AAAA055',
  libelles_sources_lies = 'Exérèse chirurgicale d''une tumeur de l''étage antérieur de la base du crâne',
  proposition_nouvel_acte_label = 'Exérèse de tumeur de la base du crâne (Étage antérieur)',
  updated_at = now()
WHERE id_protocole = 'ACT-0384';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture base M1 | Fracture Bennett | Fracture Rolando',
  definition_expert = 'Ostéosynthèse d''une fracture du premier métacarpien (os du pouce). Réduction et fixation chirurgicale d''une fracture de la base, diaphyse ou tête du métacarpien du pouce. Indication : fracture Bennett (intra-articulaire base M1 avec subluxation), fracture Rolando (comminutive base M1), fracture déplacée diaphyse M1, fracture ouverte. Objectif : réduction anatomique (surtout si articulaire), consolidation stable, récupération pince pollici-digitale complète. Technique variable selon type : fracture Bennett → brochage percutané ou vissage; fracture Rolando → plaque mini-vissée ou brochage; fracture diaphyse → plaque dorsale. Immobilisation plâtrée pouce 4-6 semaines. Ablation matériel à 3-6 mois selon type. Rééducation intensive pour récupération mobilité trapézo-métacarpienne et IP. Pronostic excellent si réduction anatomique, risque rhizarthrose secondaire si incongruence articulaire.',
  synonymes_recherche = 'M1 | Premier métacarpien | Bennett | Rolando | Fracture pouce | Fracture base pouce | Ostéosynthèse M1',
  codes_ccam = 'MFCA035',
  libelles_sources_lies = 'Ostéosynthèse d''une fracture du premier métacarpien (Pouce)',
  proposition_nouvel_acte_label = 'Ostéosynthèse du premier métacarpien',
  updated_at = now()
WHERE id_protocole = 'ACT-0385';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Épanchement articulaire | Collection liquidienne | Bursite',
  definition_expert = 'Ponction percutanée d''une articulation ou d''une collection liquidienne à visée diagnostique ou thérapeutique. Évacuation par voie transcutanée d''un épanchement articulaire (hémarthrose, épanchement synovial) ou d''une collection (bursite, hygroma). Indication : épanchement articulaire douloureux, suspicion arthrite septique nécessitant analyse, bursite volumineuse, collection post-opératoire. Objectif : soulagement douleur par décompression, diagnostic étiologique (analyse biochimique/bactériologique liquide), prévention raideur articulaire. Technique : repérage anatomique ou échoguidage, asepsie stricte, ponction à l''aiguille adaptée, aspiration complète, recueil liquide pour analyses si besoin. Peut être couplée à infiltration corticoïde selon contexte. Geste simple, ambulatoire, répétable. Complications rares (infection <1%, hématome). Efficacité symptomatique immédiate si épanchement volumineux.',
  synonymes_recherche = 'Ponction articulaire | Arthrocentèse | Ponction collection | Drainage percutané | Évacuation épanchement',
  codes_ccam = 'QZJB038',
  libelles_sources_lies = 'Ponction évacuatrice ou diagnostique (Articulation ou collection)',
  proposition_nouvel_acte_label = 'Ponction articulaire ou de collection',
  updated_at = now()
WHERE id_protocole = 'ACT-0386';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Capsulite rétractile | Épaule gelée | Raideur post-opératoire',
  definition_expert = 'Mobilisation forcée de l''épaule sous anesthésie générale pour rupture capsulaire adhérentielle. Manipulation passive de l''épaule raide en flexion, abduction et rotation pour rompre adhérences capsulaires et restaurer amplitudes articulaires. Indication : capsulite rétractile (épaule gelée) résistant à la kinésithérapie intensive (>6 mois), raideur post-opératoire sévère, limitation fonctionnelle majeure. Objectif : récupération amplitudes articulaires complètes, rupture adhérences capsulaires, reprise activités. Technique : sous anesthésie générale profonde avec myorelaxation, manipulation progressive épaule dans tous plans (élévation antérieure, abduction, rotations), rupture capsulaire contrôlée (craquement perceptible), vérification amplitudes complètes. Infiltration corticoïde intra-articulaire en fin geste. Kinésithérapie intensive immédiate pour maintenir amplitudes gagnées. Alternative : arthroscopie capsulotomie si échec. Taux succès 70-80%, récupération complète 3-6 mois.',
  synonymes_recherche = 'Capsulite | Épaule gelée | Frozen shoulder | Mobilisation sous AG | Raideur épaule | Capsulite rétractile',
  codes_ccam = 'MFMA033',
  libelles_sources_lies = 'Mobilisation passive de l''épaule sous anesthésie générale',
  proposition_nouvel_acte_label = 'Mobilisation de l''épaule sous anesthésie générale',
  updated_at = now()
WHERE id_protocole = 'ACT-0387';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Échec ligamentoplastie DIDT | Rupture greffe DIDT',
  definition_expert = 'Révision spécifique d''une ligamentoplastie du LCA réalisée initialement par technique DIDT (Droit Interne + Demi-Tendineux). Nouvelle reconstruction après échec ligamentoplastie aux ischio-jambiers. Indication : rupture greffe DIDT ou laxité résiduelle après ligamentoplastie initiale aux ischio-jambiers, instabilité symptomatique, impossibilité reprise activités. Objectif : stabilisation genou par nouvelle greffe, récupération fonction. Technique : si DIDT controlatéral disponible → prélèvement controlatéral; sinon → conversion greffe Kenneth-Jones (tendon rotulien) ou allogreffe. Gestion tunnels élargis par greffe osseuse si nécessaire, nouveaux tunnels anatomiques, fixation renforcée. Problématique : capital tendineux limité après échec DIDT primaire, nécessite greffe alternative ou controlatérale. Rééducation identique mais plus prudente. Taux succès 70-80%. Alternative : allogreffe tendineuse si refus prélèvement controlatéral.',
  synonymes_recherche = 'DIDT | Droit Interne Demi-Tendineux | Reprise LCA | Révision DIDT | Échec ligamentoplastie ischio-jambiers',
  codes_ccam = 'MJEC048',
  libelles_sources_lies = 'Révision de ligamentoplastie du LCA par technique DIDT',
  proposition_nouvel_acte_label = 'Révision de ligamentoplastie du LCA (Technique DIDT)',
  updated_at = now()
WHERE id_protocole = 'ACT-0388';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hématome extradural rachidien | Compression médullaire',
  definition_expert = 'Évacuation urgente d''un hématome extradural comprimant la moelle épinière. Décompression chirurgicale d''une collection sanguine dans l''espace épidural rachidien responsable de compression médullaire aiguë. Indication : hématome extradural rachidien post-traumatique ou spontané (anticoagulants, troubles hémostase), déficit neurologique aigu (paraparésie/paraplégie), compression médullaire IRM. Objectif : décompression médullaire urgente (<6h idéalement), récupération neurologique maximale, prévention séquelles définitives. Technique : laminectomie urgente du niveau comprimé, ouverture durale si besoin, évacuation hématome extradural, hémostase méticuleuse, recherche source hémorragique (vaisseau épidural lésé), drainage, fermeture. Pronostic neurologique dépend délai chirurgie : excellent si <6h, séquelles fréquentes si >24h. Correction troubles hémostase pré-opératoire impérative.',
  synonymes_recherche = 'HED | Hématome extradural | Hématome épidural rachidien | Compression médullaire | Évacuation HED rachis',
  codes_ccam = 'LHFA026',
  libelles_sources_lies = 'Évacuation chirurgicale d''un hématome extradural rachidien',
  proposition_nouvel_acte_label = 'Évacuation d''hématome extradural',
  updated_at = now()
WHERE id_protocole = 'ACT-0389';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Luxation sterno-claviculaire | Instabilité SC',
  definition_expert = 'Réduction et stabilisation chirurgicale d''une luxation de l''articulation sterno-claviculaire. Remise en place et fixation de l''extrémité médiale de la clavicule luxée (antérieure ou postérieure) par rapport au sternum. Indication : luxation sterno-claviculaire postérieure (urgence si compression médiastinale), luxation antérieure récidivante symptomatique, instabilité chronique douloureuse, échec réduction orthopédique. Objectif : réduction anatomique stable, prévention récidive, protection structures médiastinales (luxation postérieure). Technique : abord antérieur sterno-claviculaire, réduction luxation, stabilisation par diverses techniques (cerclage figure-8 autour clavicule et sternum, ligamentoplastie, résection clavicule médiale avec interposition tendineuse). Immobilisation écharpe 4-6 semaines. Luxation postérieure = urgence chirurgicale (risque compression vasculaire médiastinale). Pronostic bon si traitement précoce, risque instabilité résiduelle 20-30%.',
  synonymes_recherche = 'Sterno-claviculaire | SC | Luxation SC | Stabilisation SC | Articulation SC | Clavicule médiale',
  codes_ccam = 'MFFA032',
  libelles_sources_lies = 'Réduction et stabilisation d''une luxation de l''articulation sterno-claviculaire',
  proposition_nouvel_acte_label = 'Réduction ou stabilisation sterno-claviculaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0390';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture itérative LCA | Échec ligamentoplastie | Laxité résiduelle',
  definition_expert = 'Révision d''une ligamentoplastie du LCA ayant échoué avec rupture itérative ou laxité persistante. Nouvelle reconstruction du pivot central du genou après échec de ligamentoplastie primaire. Indication : rupture greffe LCA (nouveau traumatisme ou rupture cyclique), laxité antérieure résiduelle symptomatique (instabilité subjective, giving-way), malposition tunnels osseux, infection greffe (rare). Objectif : restauration stabilité genou, nouvelle greffe fonctionnelle, reprise activités sportives. Technique : arthroscopie diagnostic évaluation tunnels (position, élargissement), comblement tunnels élargis par greffe osseuse si nécessaire (6 mois avant reprise), nouveaux tunnels en position anatomique optimale, greffe tendineuse (DIDT ou Kenneth-Jones controlatéral si déjà utilisé), tension et fixation adaptées. Rééducation identique à ligamentoplastie primaire mais plus longue. Taux succès reprise 70-85% (inférieur au primaire). Retour sport 12-18 mois minimum.',
  synonymes_recherche = 'Reprise LCA | Révision LCA | Échec ligamentoplastie | Re-ligamentoplastie | Kenneth-Jones révision | DIDT révision',
  codes_ccam = 'MJEC045',
  libelles_sources_lies = 'Révision de ligamentoplastie du ligament croisé antérieur (LCA)',
  proposition_nouvel_acte_label = 'Changement de greffe de ligament croisé (Révision)',
  updated_at = now()
WHERE id_protocole = 'ACT-0391';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture du calcanéus | Arrachement osseux calcanéen',
  definition_expert = 'Ostéosynthèse d''une fracture par arrachement du calcanéus avec fixation du fragment osseux. Réparation chirurgic',
  synonymes_recherche = 'Calcanéus | Calcaneum | Arrachement calcanéen | Fracture calcanéenne | Fixation calcanéus',
  codes_ccam = 'NFCA015',
  libelles_sources_lies = 'Ostéosynthèse d''une fracture par arrachement du calcanéus',
  proposition_nouvel_acte_label = 'Suture ou fixation d''une fracture par arrachement du calcaneus',
  updated_at = now()
WHERE id_protocole = 'ACT-0392';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture subscapulaire | Lésion coiffe antérieure',
  definition_expert = 'Réparation chirurgicale du tendon du muscle subscapulaire (coiffe des rotateurs antérieure). Suture tendineuse ou réinsertion sur le tubercule mineur d''une rupture du subscapulaire (face antérieure de la coiffe). Indication : rupture isolée ou associée du subscapulaire (traumatique ou dégénérative), instabilité antérieure d''épaule, déficit rotation interne, échec traitement conservateur. Objectif : restauration force rotation interne épaule, stabilisation antérieure, amélioration fonction. Technique : abord antérieur delto-pectoral, identification moignon tendineux subscapulaire, avivement tubercule mineur, réinsertion par ancres résorbables (2-3), suture bord à bord si rupture partielle. Souvent associée à ténotomie long biceps si pathologie associée. Immobilisation coude au corps 6 semaines en rotation neutre. Rééducation progressive, autorisation rotation interne active à 3 mois. Pronostic favorable si réparation anatomique, récupération force 80-90% cas.',
  synonymes_recherche = 'Sous-scapulaire | Subscapulaire | Réinsertion subscapulaire | Coiffe antérieure | Tubercule mineur',
  codes_ccam = 'MFPA042',
  libelles_sources_lies = 'Suture ou réinsertion du tendon du muscle subscapulaire de l''épaule',
  proposition_nouvel_acte_label = 'Réparation du tendon du muscle subscapulaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0393';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité chronique coude | Rupture ligament collatéral',
  definition_expert = 'Reconstruction chirurgicale du ligament collatéral médial (LCM) ou latéral (LCL) du coude. Ligamentoplastie par greffe tendineuse autologue (palmaris longus ou ischio-jambiers) pour stabiliser coude après rupture ligamentaire chronique. Indication : instabilité chronique coude (postéro-latérale ou médiale) post-traumatique, rupture LCM chez sportif lanceur (baseball - Tommy John), échec traitement conservateur, instabilité symptomatique. Objectif : restauration stabilité coude, prévention luxation récidivante, reprise activités sportives. Technique : tunnels osseux trans-huméral et ulnaire, passage greffe tendineuse selon technique en 8 ou brin unique, tension appropriée en 30° flexion coude, fixation par vis d''interférence ou ancres. Immobilisation coude 90° flexion 3 semaines puis mobilisation progressive. Rééducation 6-12 mois. Retour sport lanceur 12-18 mois. Taux succès >85% si indication respectée.',
  synonymes_recherche = 'Ligament coude | LCM coude | LCL coude | Instabilité coude | Tommy John | Reconstruction ligamentaire coude',
  codes_ccam = 'MECA030',
  libelles_sources_lies = 'Reconstruction du ligament collatéral médial ou latéral du coude',
  proposition_nouvel_acte_label = 'Reconstruction ligamentaire du coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0394';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Récidive instabilité après Bankart | Échec Bankart',
  definition_expert = 'Révision chirurgicale d''une réparation de Bankart ayant échoué avec récidive d''instabilité d''épaule. Reprise pour nouvelle luxation/subluxation après Bankart primaire, nécessitant réévaluation et geste adapté. Indication : récidive instabilité antérieure épaule après Bankart arthroscopique, nouvelle luxation/subluxation, échec réparation labrale (ancres arrachées, perte osseuse glénoïdienne >20%). Objectif : stabilisation définitive épaule, prévention nouvelle récidive, reprise activités. Technique : arthroscopie diagnostique pour évaluer lésions (perte osseuse glène, qualité tissus, position ancres), décision per-opératoire : 1) Si labrum réparable et glène intacte → nouvelle réparation Bankart avec ancres; 2) Si perte osseuse >20% → conversion en butée osseuse type Latarjet (greffe coracoïde vissée sur bord glénoïdien antérieur). Immobilisation 4-6 semaines. Taux récidive après reprise 15-30%, plus élevé qu''après Bankart primaire. Latarjet souvent nécessaire.',
  synonymes_recherche = 'Reprise Bankart | Révision Bankart | Récidive instabilité épaule | Échec Bankart | Butée osseuse secondaire',
  codes_ccam = 'MFEA044',
  libelles_sources_lies = 'Révision d''une réparation de Bankart (Reprise pour récidive)',
  proposition_nouvel_acte_label = 'Réparation itérative du labrum (Bankart)',
  updated_at = now()
WHERE id_protocole = 'ACT-0395';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Spondylolisthésis L4L5 | Discopathie dégénérative L4L5',
  definition_expert = 'Arthrodèse chirurgicale du segment vertébral L4-L5 par fusion osseuse définitive. Blocage permanent de l''étage lombaire L4-L5 par greffe osseuse et fixation instrumentée (vis pédiculaires et cages intersomatiques). Indication : spondylolisthésis L4L5 symptomatique résistant au traitement conservateur, discopathie dégénérative L4L5 invalidante, instabilité segmentaire, canal lombaire étroit avec instabilité. Objectif : suppression mouvement douloureux, stabilisation segment, fusion osseuse définitive (3-6 mois), soulagement lombalgie/sciatalgie. Technique : abord postérieur médian, dépose arc postérieur L4-L5, libération racines si sténose, discectomie complète L4L5, pose cages intersomatiques remplies de greffe osseuse (TLIF ou PLIF), fixation par vis pédiculaires L4 et L5 avec tiges de connexion, greffe postéro-latérale. Immobilisation corset lombaire 3 mois, fusion osseuse contrôlée radiologiquement à 6 mois.',
  synonymes_recherche = 'Arthrodèse lombaire | Fusion L4L5 | TLIF L4L5 | PLIF L4L5 | Spondylodèse L4L5 | Cage intersomatique L4L5',
  codes_ccam = 'LFPA015',
  libelles_sources_lies = 'Arthrodèse intersomatique et postérieure du segment lombaire L4-L5',
  proposition_nouvel_acte_label = 'Arthrodèse vertébrale lombaire entre L4 et L5',
  updated_at = now()
WHERE id_protocole = 'ACT-0396';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Lipome cervical | Tumeur bénigne cou',
  definition_expert = 'Exérèse chirurgicale d''un lipome (tumeur bénigne graisseuse) de la région cervicale. Ablation d''une masse lipomateuse du cou, superficielle ou profonde selon localisation. Indication : lipome cervical symptomatique (gêne esthétique, compression structures nobles si profond, augmentation volume), diagnostic anatomopathologique de confirmation. Objectif : exérèse complète avec capsule, confirmation histologique bénignité, soulagement gêne. Technique : incision cutanée cervicale adaptée (plis naturels), dissection lipome avec préservation structures nobles (nerf spinal, vaisseaux cervicaux, plexus brachial si profond), énucléation capsule incluse, hémostase soigneuse, drainage si volumineux, suture esthétique. Geste simple si lipome superficiel, nécessite expertise si profond (proximité carotide/jugulaire). Envoi anatomopathologie systématique pour éliminer liposarcome (rare mais grave). Récidive exceptionnelle si exérèse complète. Cicatrisation 15 jours.',
  synonymes_recherche = 'Lipome cervical | Lipome cou | Tumeur graisseuse cou | Exérèse lipome cervical',
  codes_ccam = 'QAFA031',
  libelles_sources_lies = 'Exérèse chirurgicale d''un lipome de la région cervicale',
  proposition_nouvel_acte_label = 'Exérèse de lipome de la région cervicale',
  updated_at = now()
WHERE id_protocole = 'ACT-0397';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection prothétique | Arthrite septique PTH',
  definition_expert = 'Lavage chirurgical et débridement d''une prothèse totale de hanche infectée avec conservation de l''implant. Nettoyage articulaire profond en phase aiguë d''infection prothétique (<3 semaines) avec maintien des composants prothétiques bien fixés. Indication : infection précoce post-opératoire (<3 semaines) ou hématogène aiguë sur prothèse stable, absence de descellement, germe identifié sensible. Objectif : éradication infectieuse par lavage abondant et antibiothérapie prolongée, conservation prothèse fonctionnelle. Technique : reprise même voie d''abord, arthrotomie large, prélèvements bactériologiques multiples, ablation membranes inflammatoires, lavage pulsé abondant (>10L sérum), changement insert polyéthylène si possible, drainage aspiratif. Antibiothérapie IV 6 semaines puis orale 3-6 mois. Taux succès 60-80% si critères respectés. Si échec : reprise en 2 temps avec spaceur.',
  synonymes_recherche = 'PTH | Prothèse Totale Hanche | Infection PTH | Lavage PTH | Débridement PTH | Arthrite prothèse | Sepsis prothétique',
  codes_ccam = 'NFKA016',
  libelles_sources_lies = 'Lavage articulaire et débridement d''une prothèse totale de hanche infectée',
  proposition_nouvel_acte_label = 'Lavage et débridement d''une prothèse de hanche infectée',
  updated_at = now()
WHERE id_protocole = 'ACT-0398';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité tibio-fibulaire | Syndrome syndesmose',
  definition_expert = 'Arthrodèse chirurgicale de l''articulation tibio-fibulaire distale (syndesmose). Fusion définitive de la pince tibio-fibulaire par vis ou greffe osseuse pour traiter instabilité chronique de cheville. Indication : instabilité chronique syndesmose post-traumatique (entorse cheville grave itérative), douleur chronique articulation tibio-fibulaire, échec traitement conservateur, séquelles fracture malléolaire avec diastasis persistant. Objectif : stabilisation définitive mortaise tibio-fibulaire, suppression douleur, restauration congruence cheville. Technique : abord latéral cheville, curetage syndesmose, comblement greffe osseuse spongieuse (iliaque ou banque), fixation par vis de compression tibio-fibulaire positionnée à 2-3 cm au-dessus plafond tibial, immobilisation. Alternative : vissage simple sans greffe. Immobilisation plâtrée 8 semaines, appui progressif. Geste rare, souvent associé à ostéotomie malléolaire si séquelle fracturaire.',
  synonymes_recherche = 'Syndesmose | Tibia-péroné | Arthrodèse syndesmose | Fusion tibio-fibulaire | Instabilité cheville',
  codes_ccam = 'NFKA017',
  libelles_sources_lies = 'Arthrodèse de la syndesmose tibio-fibulaire distale',
  proposition_nouvel_acte_label = 'Arthrodèse de l''articulation tibio-fibulaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0399';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rhizarthrose | Arthrose base pouce',
  definition_expert = 'Arthrodèse chirurgicale de l''articulation trapézo-métacarpienne (base du pouce). Fusion osseuse définitive entre trapèze et premier métacarpien pour traiter rhizarthrose douloureuse invalidante. Indication : rhizarthrose stade avancé (Eaton 3-4) avec douleur invalidante résistant au traitement conservateur, échec infiltrations, demande fonctionnelle forte (travail manuel), sujet jeune actif. Objectif : suppression totale douleur base pouce, conservation force pince/préhension, sacrifice mobilité TMC. Technique : incision dorsale base pouce, exposition trapèze-métacarpien, avivement surfaces articulaires, réduction en abduction-opposition pouce, fixation par vis ou broches, greffe osseuse spongieuse d''apposition. Immobilisation plâtrée 6-8 semaines puis mobilisation IP et MP. Alternative fréquente : trapézectomie (conservation mobilité mais moins de force). Fusion osseuse 90% cas, force pince restaurée, indolence complète.',
  synonymes_recherche = 'Rhizarthrose | Arthrodèse pouce | Trapèze | Base pouce | TMC | Fusion TMC | Arthrose pouce',
  codes_ccam = 'MFCA018',
  libelles_sources_lies = 'Arthrodèse de l''articulation trapézo-métacarpienne (Base du pouce)',
  proposition_nouvel_acte_label = 'Fusion articulaire entre le trapèze et le premier métacarpien',
  updated_at = now()
WHERE id_protocole = 'ACT-0400';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose de cheville | Ostéotomie de décharge',
  definition_expert = 'Ostéotomie (section chirurgicale) de la fibula (péroné) pour modifier les contraintes mécaniques de la ch',
  synonymes_recherche = 'Péroné | Fibula | Ostéotomie péronière | Décharge cheville',
  libelles_sources_lies = 'Ostéotomie fibula',
  proposition_nouvel_acte_label = 'Ostéotomie de la fibula (Péroné)',
  updated_at = now()
WHERE id_protocole = 'ACT-0401';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité antérieure d''épaule | Luxation récidivante',
  definition_expert = 'Réparation arthroscopique d''une lésion de Bankart (déchirure du labrum antéro-inférieur de la glène). Refixation du bourrelet glénoïdien antérieur arraché par ancres résorbables pour stabiliser épaule après luxations récidivantes. Indication : instabilité antérieure d''épaule (luxations ou subluxations récidivantes), lésion de Bankart confirmée à l''arthroscanner ou IRM, sujet jeune sportif, échec rééducation. Objectif : restauration anatomie labrum antérieur, stabilisation épaule, prévention récidive luxation. Technique : arthroscopie épaule, avivage berge osseuse glène antéro-inférieure, pose 3-4 ancres résorbables dans rebord glénoïdien, passage fils dans labrum détaché, refixation labrum en position anatomique, fermeture capsule antérieure. Immobilisation coude au corps 4 semaines puis rééducation progressive. Taux récidive <10% si indication respectée. Alternative : butée osseuse (Latarjet) si perte osseuse glénoïdienne >20%.',
  synonymes_recherche = 'Bankart | Lésion Bankart | Butée | Réparation labrum | Instabilité épaule | Luxation épaule | Ancres Bankart',
  codes_ccam = 'MFEA019',
  libelles_sources_lies = 'Réparation du bourrelet glénoïdien antérieur (Lésion de Bankart) sous arthroscopie',
  proposition_nouvel_acte_label = 'Réparation du labrum antérieur de l''épaule (Bankart)',
  updated_at = now()
WHERE id_protocole = 'ACT-0402';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Migration électrode neurostimulateur | Perte efficacité stimulation',
  definition_expert = 'Repositionnement chirurgical d''une électrode de neurostimulation médullaire migrée ou mal positionnée. Révision du placement d''électrodes de stimulation épidurale pour restaurer efficacité thérapeutique. Indication : migration électrode de neurostimulation avec perte d''efficacité antalgique, positionnement initial sous-optimal identifié, douleur neuropathique réfractaire non soulagée. Objectif : repositionnement électrodes en zone efficace (niveau métamérique correspondant territoire douloureux), restauration couverture paresthésies, soulagement douleur. Technique : reprise abord médian rachidien, laminectomie partielle niveau concerné, identification électrodes en place, repositionnement sous contrôle scopique et test per-opératoire stimulation (patient éveillé si possible), fixation soigneuse pour éviter nouvelle migration. Test stimulation post-opératoire pour confirmer efficacité avant réglages définitifs boîtier. Geste délicat, risque lésion durale/médullaire. Amélioration symptômes si repositionnement correct.',
  synonymes_recherche = 'Neurostimulateur | Electrodes neurostimulation | DREZ | Stimulation médullaire | Migration électrode | Reprise neurostimulateur',
  codes_ccam = 'LHPA043',
  libelles_sources_lies = 'Repositionnement d''électrode de neurostimulation rachidienne',
  proposition_nouvel_acte_label = 'Repositionnement d''électrode de neurostimulation',
  updated_at = now()
WHERE id_protocole = 'ACT-0403';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Pseudarthrose clavicule | Cal vicieux clavicule | Descellement plaque',
  definition_expert = 'Révision chirurgicale d''une ostéosynthèse de clavicule ayant échoué (pseudarthrose, cal vicieux, descellement). Reprise ostéosynthèse après échec consolidation ou malposition fracture claviculaire initialement opérée. Indication : pseudarthrose clavicule symptomatique (douleur, limitation fonction), cal vicieux avec déformation importante, descellement plaque, infection chronique. Objectif : obtention consolidation définitive, correction déformation, récupération fonction épaule. Technique : ablation matériel défaillant, avivement foyer pseudarthrose, comblement greffe iliaque spongieuse, nouvelle plaque supérieure ou antéro-supérieure (verrouillée si stock osseux médiocre), fixation vis bicorticales. Si cal vicieux : ostéotomie correctrice + plaque. Immobilisation écharpe 3-4 semaines. Consolidation habituelle 3-4 mois après reprise avec greffe. Taux consolidation >90% après révision. Ablation plaque possible à 12-18 mois si gêne ou sport contact.',
  synonymes_recherche = 'Clavicule | Pseudarthrose clavicule | Reprise clavicule | Cal vicieux clavicule | Plaque clavicule',
  codes_ccam = 'MFCA049',
  libelles_sources_lies = 'Révision d''ostéosynthèse de la clavicule',
  proposition_nouvel_acte_label = 'Reprise d''ostéosynthèse de clavicule',
  updated_at = now()
WHERE id_protocole = 'ACT-0404';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Compression nerveuse | Neuropathie sciatique | Syndrome piriforme',
  definition_expert = 'Libération chirurgicale du nerf sciatique comprimé par structures extrinsèques (muscle piriforme, adhérences, fibrose). Neurolyse externe du nerf sciatique pour lever compression mécanique et restaurer conduction nerveuse. Indication : syndrome du piriforme (compression sciatique par muscle piriforme hypertrophié/fibrosé) résistant au traitement conservateur, neuropathie sciatique par adhérences post-traumatiques/chirurgicales, compression tumorale bénigne. Objectif : décompression nerveuse, récupération sensitive et motrice territoire sciatique, soulagement sciatalgie. Technique : abord postérieur fesse, identification nerf sciatique en zone saine, dissection prudente structures compressives (section piriforme si responsable, lyse adhérences, exérèse kyste/tumeur si présent), neurolyse externe circonférentielle sans ouverture épinèvre, vérification libération complète. Récupération progressive 3-12 mois selon durée compression. Pronostic favorable si compression récente (<2 ans).',
  synonymes_recherche = 'Nerf sciatique | Sciatique | Neurolyse sciatique | Syndrome piriforme | Libération nerveuse | Compression extrinsèque',
  codes_ccam = 'LZFA029',
  libelles_sources_lies = 'Neurolyse chirurgicale du nerf sciatique (Libération)',
  proposition_nouvel_acte_label = 'Neurolyse du nerf sciatique',
  updated_at = now()
WHERE id_protocole = 'ACT-0405';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Gonarthrose | Arthrite | Chondropathie',
  definition_expert = 'Infiltration intra-articulaire du genou à visée thérapeutique (corticoïdes ou acide hyaluronique). Injection percutanée dans l''articulation fémoro-tibiale de produits anti-inflammatoires ou visco-supplémentaires. Indication : gonarthrose débutante ou modérée symptomatique, poussée inflammatoire arthrosique, arthrite microcristalline, chondropathie patellaire. Objectif : soulagement douleur (corticoïdes : effet rapide 48h, durée 3-6 mois), amélioration mobilité, lubrification articulaire (acide hyaluronique : effet retardé, durée 6-12 mois). Technique : repérage anatomique (voie supéro-latérale ou antéro-latérale), asepsie stricte, ponction articulaire à l''aiguille, évacuation épanchement si présent, injection produit (corticoïdes 1-2mL ou acide hyaluronique haute PM), repos relatif 48h. Contre-indication : infection locale, allergie produit. Efficacité variable (60-80%), répétable 3-4 fois/an. Alternative : arthroscopie lavage si échec.',
  synonymes_recherche = 'Infiltration genou | Injection genou | Corticoïdes genou | Acide hyaluronique | Viscosupplémentation | Arthrocentèse thérapeutique',
  codes_ccam = 'MJJB027',
  libelles_sources_lies = 'Infiltration intra-articulaire du genou (Corticoïdes ou acide hyaluronique)',
  proposition_nouvel_acte_label = 'Infiltration articulaire du genou',
  updated_at = now()
WHERE id_protocole = 'ACT-0406';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Infection / Descellement de prothèse',
  definition_expert = 'Retrait des composants prothétiques du coude. Intervention rare et complexe du fait de la fragilité osseuse et du risque neurologique (nerf ulnaire).',
  synonymes_recherche = 'Coude | Reprise | Dépose | Infection | Descellement | Prothèse | Révision | Ablation',
  codes_ccam = 'MCKA002',
  libelles_sources_lies = 'Ablation de prothèse de coude',
  proposition_nouvel_acte_label = 'Dépose de prothèse de l''articulation du coude',
  updated_at = now()
WHERE id_protocole = 'ACT-0407';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Compression radiculaire aiguë | Hernie discale compressive sévère | Syndrome de la queue de cheval',
  definition_expert = 'Décompression chirurgicale en urgence d''une compression radiculaire responsable de déficit moteur sévère. Laminectomie et discectomie d''urgence (<24h idéalement) pour lever compression radiculaire aiguë menaçant fonction neurologique définitive. Indication : sciatique paralysante (déficit moteur ≥3/5 d''apparition récente), syndrome de la queue de cheval (troubles sphinctériens + anesthésie en selle + déficit moteur bilatéral), hernie discale volumineuse compressive confirmée IRM. Objectif : récupération neurologique maximale par décompression rapide, prévention séquelles définitives (paralysie, incontinence). Technique : abord postérieur médian rachidien en urgence, laminectomie niveau comprimé, discectomie large avec exérèse fragment herniaire compressif, libération racine sur tout trajet, vérification décompression complète. Pronostic neurologique dépend délai chirurgie : excellente récupération si <6h, séquelles fréquentes si >48h. Syndrome queue de cheval = urgence absolue chirurgicale (fenêtre thérapeutique <12h pour récupération sphinctérienne).',
  synonymes_recherche = 'Sciatique paralysante | Syndrome queue de cheval | Compression radiculaire | Hernie discale paralysante | Laminectomie urgente | Déficit moteur aigu',
  codes_ccam = 'LHFA052',
  libelles_sources_lies = 'Décompression chirurgicale urgente d''une compression radiculaire paralysante',
  proposition_nouvel_acte_label = 'Décompression nerveuse radiculaire urgente (Rachis)',
  updated_at = now()
WHERE id_protocole = 'ACT-0408';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Hématome post-traumatique | Collection hématique',
  definition_expert = 'Évacuation chirurgicale d''un hématome volumineux des tissus mous. Drainage d''une collection sanguine post-traumatique ou post-opératoire compressive ou s''organisant. Indication : hématome volumineux symptomatique (douleur, compression vasculo-nerveuse), absence de résorption spontanée, risque de surinfection, hématome sous anticoagulants. Objectif : levée compression structures nobles, prévention infection, accélération cicatrisation. Technique : incision cutanée en regard collection, dissection tissulaire, évacuation caillots et sang liquide, hémostase soigneuse, lavage abondant, drainage aspiratif, fermeture. Geste simple si hématome superficiel, nécessite exploration vasculaire si saignement actif persistant. Surveillance drainage 48-72h, ablation drain selon débit. Prévention récidive : correction troubles hémostase, arrêt anticoagulants si possible.',
  synonymes_recherche = 'Hématome | Collection sanguine | Drainage hématome | Évacuation collection | Hématome compressif',
  codes_ccam = 'QZFA022',
  libelles_sources_lies = 'Évacuation chirurgicale d''un hématome des parties molles',
  proposition_nouvel_acte_label = 'Évacuation d''hématome des tissus mous',
  updated_at = now()
WHERE id_protocole = 'ACT-0409';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Raideur post-fracture cheville | Arthrofibrose',
  definition_expert = 'Mobilisation forcée de la cheville sous anesthésie générale pour rupture adhérences. Manipulation passive de la cheville raide pour restaurer amplitudes articulaires perdues après fracture ou chirurgie. Indication : raideur sévère cheville post-fracture (malléolaire, pilon tibial) ou post-opératoire résistant à kinésithérapie intensive, limitation fonctionnelle majeure (marche compromise). Objectif : récupération flexion dorsale et plantaire, rupture adhérences tendineuses et capsulaires, amélioration marche. Technique : sous anesthésie générale avec myorelaxation, mobilisation progressive cheville en flexion dorsale puis plantaire, rupture adhérences contrôlée, vérification amplitudes. Éventuel complément arthroscopique si adhérences intra-articulaires visualisées. Kinésithérapie intensive immédiate impérative. Infiltration locale possible. Taux succès modéré (50-60%), résultats moins bons que pour épaule. Risque algodystrophie post-geste si mobilisation trop agressive.',
  synonymes_recherche = 'Raideur cheville | Mobilisation cheville | Arthrofibrose cheville | Mobilisation sous AG cheville',
  codes_ccam = 'NFMA034',
  libelles_sources_lies = 'Mobilisation passive de la cheville sous anesthésie générale',
  proposition_nouvel_acte_label = 'Mobilisation de la cheville sous anesthésie générale',
  updated_at = now()
WHERE id_protocole = 'ACT-0410';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Rupture récente du LCA | Avulsion osseuse LCA',
  definition_expert = 'Réinsertion ou suture directe du ligament croisé antérieur (LCA) en phase aiguë. Réparation anatomique d''une rupture récente du LCA ou d''une avulsion osseuse (arrachement avec fragment osseux) permettant refixation directe sans greffe. Indication : rupture complète du LCA datant de moins de 3 semaines avec tissu ligamentaire de qualité suffisante, ou avulsion osseuse LCA. Objectif : restauration immédiate de la stabilité antéro-postérieure du genou sans recourir à une ligamentoplastie. Technique : abord arthroscopique ou mini-open selon cas, réinsertion du moignon ligamentaire par ancres ou vis d''interférence si avulsion osseuse. Alternative rare à la ligamentoplastie classique (Kenneth-Jones ou DIDT), réservée aux lésions très récentes. Immobilisation relative 6 semaines puis rééducation progressive.',
  synonymes_recherche = 'LCA | Ligament Croisé Antérieur | Croisé | Réinsertion LCA | Suture LCA | Avulsion LCA | Réparation pivot central',
  codes_ccam = 'MJEC008',
  libelles_sources_lies = 'Réparation ou réinsertion du ligament croisé antérieur du genou',
  proposition_nouvel_acte_label = 'Réparation ou réinsertion du ligament croisé antérieur',
  updated_at = now()
WHERE id_protocole = 'ACT-0411';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture per-trochantérienne | Descellement clou | Cal vicieux',
  definition_expert = 'Ablation et remplacement d''un clou centromédullaire fémoral proximal (type Gamma ou PFN). Changement de matériel d''ostéosynthèse après échec primaire (descellement, cal vicieux, pseudarthrose) d''une fracture per-trochantérienne ou sous-trochantérienne. Indication : matériel défaillant (mobilisation clou ou vis cervicale), pseudarthrose, cal vicieux symptomatique, fracture itérative. Objectif : nouvelle stabilisation par clou de diamètre supérieur ou technique alternative, obtention consolidation. Technique : ablation clou et vis sous amplificateur de brillance, alésage fémoral si nécessaire, mise en place clou Gamma de génération supérieure ou conversion en ostéosynthèse plaque LCP selon stock osseux. Geste complexe car os fragilisé et trajectoire modifiée.',
  synonymes_recherche = 'Clou Gamma | Gamma | Clou PFN | Clou fémoral proximal | Reprise ostéosynthèse hanche | Changement clou',
  codes_ccam = 'NFKA003',
  libelles_sources_lies = 'Ablation-remplacement de clou centromédullaire fémoral de type Gamma',
  proposition_nouvel_acte_label = 'Remplacement de clou centromédullaire fémoral proximal',
  updated_at = now()
WHERE id_protocole = 'ACT-0412';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Instabilité rotulienne',
  definition_expert = 'Reconstruction du ligament fémoro-patellaire médial (MPFL) pour instabilité rotulienne. Greffe tendineuse (gracilis) fixée à la rotule et au fémur (point isométrique).',
  synonymes_recherche = 'MPFL (Medial Patellofemoral Ligament) | Ligament Fémoro-Patellaire Médial | Plastie | Rotule | Gracilis | Instabilité | Luxation rotule',
  codes_ccam = 'NFMA021',
  libelles_sources_lies = 'Reconstruction du ligament patellofémoral médial',
  proposition_nouvel_acte_label = 'Ligamentoplastie patellofémorale médiale',
  updated_at = now()
WHERE id_protocole = 'ACT-0413';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrose facettaire lombaire | Lombalgie chronique facettaire',
  definition_expert = 'Dénervation des articulations facettaires lombaires par radiofréquence pour traiter lombalgie chronique d''origine facettaire. Destruction thermique sélective des branches médiales nerveuses innervant articulations facettaires postérieures du rachis. Indication : lombalgie chronique (>6 mois) d''origine facettaire prouvée (test blocs diagnostiques positifs), arthrose facettaire symptomatique, échec traitement conservateur, contre-indication chirurgie lourde. Objectif : soulagement durable lombalgie facettaire (12-24 mois), amélioration fonction, éviter arthrodèse. Technique : sous scopie, repérage branches médiales L3-L4-L5-S1, ponction percutanée aiguilles radiofréquence, test stimulation pour confirmer position (contractions paravertébrales), thermocoagulation 80-90° pendant 60-90 secondes par niveau. Ambulatoire, anesthésie locale. Efficacité 60-80% cas (soulagement >50% douleur), durée effet 12-24 mois, répétable. Alternative mini-invasive à arthrodèse si lombalgie purement facettaire.',
  synonymes_recherche = 'Radiofréquence | Rhizolyse | Dénervation facettaire | Thermocoagulation facettaire | RF lombaire | Neurotomie facettaire',
  codes_ccam = 'LHMA041',
  libelles_sources_lies = 'Dénervation des articulations inter-apophysaires postérieures par radiofréquence',
  proposition_nouvel_acte_label = 'Dénervation facettaire par radiofréquence (Rhizolyse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0415';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Fracture diaphysaire fémur/tibia',
  definition_expert = 'Ostéosynthèse par clou centromédullaire verrouillé pour fracture diaphysaire os long. Stabilisation interne fracture par introduction d''un clou métallique dans canal médullaire avec verrouillage proximal et distal. Indication : fracture diaphysaire fémur, tibia ou humérus (fermée ou ouverte Cauchoix 1-2), fracture comminutive, polytraumatisme nécessitant ostéosynthèse rapide stable. Objectif : stabilisation immédiate, alignement axe, consolidation en appui précoce, mobilisation rapide. Technique : table orthopédique, contrôle scopique permanent, alésage canal médullaire (clou fresé) ou sans fraisage selon cas, introduction clou par voie rétrograde ou antérograde, verrouillage par vis proximales et distales. Appui immédiat si montage stable. Consolidation 3-6 mois selon os. Ablation matériel à 18-24 mois si souhaitée. Gold standard fracture diaphysaire os long.',
  synonymes_recherche = 'Clou centromédullaire | Clou verrouillé | Enclouage | Clou fémoral | Clou tibial | Clou huméral | Fixation endomédullaire',
  codes_ccam = 'NZKA021',
  libelles_sources_lies = 'Ostéosynthèse par enclouage centromédullaire verrouillé (Fémur, tibia ou humérus)',
  proposition_nouvel_acte_label = 'Ostéosynthèse par clou centromédullaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0416';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Escarre | Plaie chronique | Nécrose cutanée',
  definition_expert = 'Parage chirurgical (débridement) d''escarre avec excision des tissus nécrotiques et infectés jusqu''en zone saine. Indication : escarre stade III-IV (nécrose profonde, atteinte osseuse). Objectif : assainissement de la plaie, prévention de l''infection systémique (ostéomyélite, sepsis). Souvent suivi de comblement par lambeau de rotation ou VAC therapy.',
  synonymes_recherche = 'Escarre | Parage | Débridement | Plaie de pression | Ulcère décubitus',
  libelles_sources_lies = 'Parage tissus mous + débridement',
  proposition_nouvel_acte_label = 'Excision de lésion infectée ou nécrotique de la peau (Escarre)',
  updated_at = now()
WHERE id_protocole = 'ACT-0417';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Arthrite septique cheville | Infection articulaire',
  definition_expert = 'Arthrotomie (ouverture chirurgicale) de la cheville avec lavage abondant et débridement pour arthrite septique (infection articulaire bactérienne). Indication urgente : articulation chaude, douloureuse avec épanchement purulent. Prélèvements bactériologiques systématiques. Antibiothérapie IV prolongée post-opératoire. Risque de séquelles cartilagineuses (arthrose post-infectieuse).',
  synonymes_recherche = 'Arthrite septique | Lavage articulaire | Arthrotomie cheville | Infection cheville',
  codes_ccam = 'NFJA002',
  libelles_sources_lies = 'Arthrotomie cheville avec lavage',
  proposition_nouvel_acte_label = 'Arthrotomie de la cheville avec lavage articulaire',
  updated_at = now()
WHERE id_protocole = 'ACT-0418';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Échec prothétique | Infection chronique PTG | Perte osseuse majeure',
  definition_expert = 'Ablation d''une prothèse totale de genou défaillante suivie d''une arthrodèse (fusion définitive de l''articulation). Dépose du matériel prothétique et blocage permanent du genou en extension par clou centromédullaire ou fixateur externe. Indication : échec définitif de PTG avec perte osseuse majeure rendant réimplantation impossible, infection chronique réfractaire, instabilité ligamentaire sévère, douleur invalidante avec défaillance musculo-ligamentaire. Objectif : stabilisation définitive genou en position fonctionnelle (léger flexum), éradication infection, indolence, membre portant stable. Technique : dépose PTG, parage osseux et nettoyage, comblement perte osseuse par greffe ou ciment, arthrodèse par clou centromédullaire verrouillé fémoro-tibial ou fixateur externe selon contexte. Sacrifice fonction flexion-extension mais genou stable et indolore. Solution de sauvetage extrême, impact fonctionnel majeur (compensation hanche/cheville).',
  synonymes_recherche = 'PTG | Prothèse Totale Genou | Arthrodèse genou | Dépose PTG | Fusion genou | Clou d''arthrodèse genou | Infection PTG',
  codes_ccam = 'NFKA014',
  libelles_sources_lies = 'Ablation de prothèse totale de genou suivie d''une arthrodèse fémoro-tibiale',
  proposition_nouvel_acte_label = 'Dépose de PTG et fusion articulaire du genou (Arthrodèse)',
  updated_at = now()
WHERE id_protocole = 'ACT-0419';

UPDATE public.thesaurus_protocoles SET
  pathologie = 'Nécrose osseuse naviculaire | Maladie de Köhler | Arthrose médio-tarsienne',
  definition_expert = 'Exérèse chirurgicale partielle ou totale de',
  synonymes_recherche = 'Naviculaire | Scaphoïde tarsien | Os naviculaire pied | Köhler | Exérèse naviculaire | Arthrodèse médio-tarsienne',
  codes_ccam = 'NFFA051',
  libelles_sources_lies = 'Exérèse partielle ou totale de l''os naviculaire du pied (Scaphoïde tarsien)',
  proposition_nouvel_acte_label = 'Exérèse de l''os naviculaire (Scaphoïde tarsien)',
  updated_at = now()
WHERE id_protocole = 'ACT-0420';

COMMIT;

-- ============================================================
-- FIN MIGRATION 019 — 420 protocoles enrichis
-- ============================================================