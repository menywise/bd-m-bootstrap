-- =============================================================================
-- BDB / DB&M — Migration session #113 — Doctrine identitaire tranchée
-- =============================================================================
-- Date              : 2026-05-03
-- Session           : 113 (suite de #112 audit + allègement CLAUDE.md)
-- Auteur            : Manu + Claude
-- Périmètre         : atelier_decisions (4) + atelier_principes (7) + atelier_sessions (1)
-- Skill activé      : sql-migration-bdb + fab3r-bdb + atelier-session-bdb
-- INTERDIT-SQL-01   : fichier .sql produit AVANT exécution cloud
-- ANTI-02           : schémas vérifiés via information_schema avant rédaction
--
-- OBJECTIF :
--   Graver la trinité doctrinale DB&M tranchée en session #113 :
--     - MISSION    V0.6 (push → pull, matière structurée)
--     - VISION     V0.4 (3 ans 100k€ / 10 ans 1M€)
--     - VALEURS    V0.3 (architecture 3 niveaux)
--     - 5 POURQUOI V0.1 (chaîne symptôme → racine)
--   + 5 nouveaux principes (1 interdit, 3 axes, 1 convention)
--   + 2 dettes (axe DETTE-)
--
-- IDEMPOTENCE :
--   Toutes les insertions utilisent ON CONFLICT DO NOTHING sur ref.
--   Si exécution multiple : pas de doublon, pas de modification de l'existant.
--
-- ROLLBACK :
--   Voir bloc commenté en fin de fichier.
-- =============================================================================

BEGIN;

-- =============================================================================
-- BLOC 1 — atelier_decisions (4 décisions doctrinales)
-- =============================================================================

INSERT INTO atelier_decisions
  (ref, date, titre, description, tags, statut, session_num, type)
VALUES
  (
    'D-2026-05-03-DOCTRINE-01',
    '2026-05-03',
    'MISSION DB&M V0.6 — push → pull, matière structurée mise à disposition',
    'Mission DB&M tranchée en session #113 après audit 7 voix. Bascule paradigmatique : DB&M ne transmet pas, DB&M structure et met à disposition. L''apprenant édifie. Trois versions co-existantes : (a) INTERNE L3 — matière structurée + caisse à outils croisée 5 axes (POURQUOI/QUOI/COMMENT/QUI/QUAND) × 4 savoirs (savoir/savoir-faire/savoir-être/savoir-agir) × 3 familles (méthodes pédago / grilles humaines / intégration systémique), instruments invisibles à l''utilisateur. (b) EXTERNE individuelle (tu) — bâtir ton parcours pierre par pierre, c''est ton parcours à ton rythme. (c) EXTERNE collective (vous) — l''équipe construit sa mémoire collective pierre par pierre, c''est l''équipe qui bâtit. Validée 7/7 voix audit ARE.',
    ARRAY['doctrine','mission','identite','dbm','session-113'],
    'active',
    113,
    'decision'
  ),
  (
    'D-2026-05-03-DOCTRINE-02',
    '2026-05-03',
    'VISION DB&M V0.4 — 3 ans 100 k€ / 10 ans 10 blocs × 100 k€ = 1 M€',
    'Vision DB&M tranchée en session #113 après audit 7 voix. Calage économique sur licence pricing (100 k€/an/grand bloc). Quatre formulations co-existantes : (a) INTERNE 3 ans — DB&M vaut 100 k€/an récurrent / 1 grand bloc, cercle vertueux GPS-01 implémenté, 2 surfaces autonomes (App Android lead magnet + 1er KDP pivot SEO). (b) INTERNE 10 ans — 1 M€/an récurrent (10 grands blocs × 100 k€), N surfaces (B2B, apps modulaires, KDP, méthodes hors bloc), contenu auto-régénérant via cercle vertueux. (c) EXTERNE 3 ans — toute IBODE peut consulter qu''elle soit en bloc équipé/isolée/contributrice. (d) EXTERNE 10 ans — évidence partagée sur écran d''équipe, dans la poche, sur l''étagère, dans la formation. Validée 7/7 voix audit ARE (4 versions).',
    ARRAY['doctrine','vision','identite','dbm','pricing','cercle-vertueux','session-113'],
    'active',
    113,
    'decision'
  ),
  (
    'D-2026-05-03-DOCTRINE-03',
    '2026-05-03',
    'VALEURS DB&M V0.3 — architecture 3 niveaux (étiquette / effet vivant / interne)',
    'Valeurs DB&M tranchées en session #113 après recadrage Manu (j''avais aplati la profondeur). Architecture vivante 3 niveaux. NIVEAU 1 publique (13 étiquettes mini-site, équilibre ARE 5/4/4) : transmission, terrain d''abord, connexion (combo gagnant), respect, affordance (Norman), efficience, périmètre tenu, légèreté, liberté préservée, triple légitimité, multi-canalité respectueuse, acteur de ton parcours, savoir-agir. NIVEAU 2 effets vivants invisibles (4 mécanismes) : (A) intégrations ennéagramme par profil — Estelle T6→9 sérénité, Blanche T1→7 légèreté, Constance T3→6 confiance, Dorian T5→8 action, Fernand T8→2 transmission, Gaël T9→3 résultat concret, Aurèle T0 progression spirale ; (B) fluidifications DISC interpersonnelles — chaque profil reçoit l''info dans sa langue sans subir celle des autres ; (C) rupture cycle toxique PNL/AT — DB&M coupe les 6 étapes (arrive → demande → répond encore → n''ose plus → erreur → tension) par design ; (D) construction savoir-agir Boudreault — interconnexion savoir + savoir-faire + savoir-être en action mobilisable contextuellement. NIVEAU 3 interne L3 (13 valeurs : 11 historiques + profondeur invisible + écosystème humain comme matière première). Validée 7/7 voix audit ARE.',
    ARRAY['doctrine','valeurs','identite','dbm','3-niveaux','enneagramme','disc','pnl','at','boudreault','session-113'],
    'active',
    113,
    'decision'
  ),
  (
    'D-2026-05-03-DOCTRINE-04',
    '2026-05-03',
    '5 POURQUOI DB&M V0.1 — chaîne symptôme à racine',
    'Cinq Pourquoi DB&M tranchés en session #113 (jamais formalisés auparavant — état [À TRANCHER] depuis IDENTITE V0.3). Méthode Toyota appliquée : remontée du symptôme observable terrain à la cause racine systémique. (#1 SYMPTÔME) Pourquoi DB&M existe ? À 7h45, des soignants compétents arrivent en salle sans savoir ce qui les attend, chaque ignorance se paie en cascade. (#2 CAUSE DIRECTE) Pourquoi sans savoir ? Le savoir opératoire vit dans les têtes, pas dans un système consultable — quand l''experte est partie, le savoir est parti. (#3 CAUSE STRUCTURELLE) Pourquoi dans les têtes ? Transmission orale épuisante (cycle toxique 6 étapes) + chaîne 12+ intervenants nommant chaque chose différemment, pas de langue commune. (#4 CAUSE SYSTÉMIQUE) Pourquoi pas de système commun ? Aucun outil ne fait le pont entre standards officiels et vraie vie de chaque bloc — le SIH gère l''administratif, OPTIM le programme, le savoir opératoire entre les deux est orphelin. (#5 CAUSE RACINE) Pourquoi ce pont n''existait pas ? Conjonction rare exigée : 20 ans terrain IBODE + lecture systémique standards + discipline éditoriale invisible (caisse à outils) + modèle économique soutenable. DB&M est cette conjonction. Variante externe narrative produite. Validée 7/7 voix audit ARE.',
    ARRAY['doctrine','5-pourquoi','identite','dbm','toyota','pont-standard-terrain','session-113'],
    'active',
    113,
    'decision'
  )
ON CONFLICT (ref) DO NOTHING;


-- =============================================================================
-- BLOC 2 — atelier_principes (5 nouveaux principes + 2 dettes axe)
-- =============================================================================

-- 2.1 — INTERDIT-WORDING-METHODES-01 (interdit)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'interdit',
    'INTERDIT-WORDING-METHODES-01',
    'Méthodes pédagogiques jamais nommées en surface L1/L2',
    'Les méthodes constitutives de la caisse à outils DB&M (MERE, Spirale Dynamique de Beck-Cowan, Ennéagramme personnalités Riso-Hudson, Ennéagramme processus DB&M, ARE 3 centres, DISC Marston, VAKOG PNL, AT Berne, Métaprogrammes PNL, Boudreault/CRAIE, Knowles andragogie, Kolb cycle expérientiel, Nonaka SECI, Wenger communauté de pratique, Benner novice-expert, POULET Barrand, Deming PDCA, FAB(3R), Morin pensée complexe) et leurs auteurs respectifs ne sont jamais nommés en surface utilisateur (L1 membres / visiteurs / mini-site, L2 admin instance). Elles structurent invisiblement le wording, l''UX, la matière. Le glossaire peut héberger leurs définitions à titre consultatif (comme PNL, AT) sans les afficher en accroche. Recette secrète DB&M.',
    'Doctrine session #113 — décision Manu',
    'active',
    'TOUJOURS',
    'Manu a constaté que nommer les méthodes en surface alourdit le wording, intimide les profils Estelle/Aurèle/Fernand, et expose la mécanique aux concurrents. Les méthodes doivent être OPÉRANTES, pas EXHIBÉES.',
    'Maintenir l''invisibilité des méthodes pédagogiques en surface utilisateur tout en garantissant leur application rigoureuse en doctrine interne L3.',
    'vs nommer les méthodes : wording plus accessible (S/C+I+D atteignables), pas d''effet jargon académique, protection de la propriété intellectuelle, recette inimitable car cachée derrière les effets.',
    'Surface utilisateur lisible par tous profils sans pré-requis méthodologique. Pédagogie efficace par les EFFETS produits (intégration ennéa, fluidification DISC, savoir-agir) plutôt que par la nomenclature. Différenciation produit durable.',
    'Manu/Claude se relâche en surface et nomme une méthode dans un module L1/L2 → wording aplati, profils non techniques décrochent, propriété intellectuelle exposée. Bernard et 7 voix d''audit doivent vérifier à chaque livraison.',
    'Audit wording systématique avant déploiement L1/L2 (skill recettage-bdb + persona-guard). Glossaire L1 peut définir les termes méthodologiques sur recherche explicite mais ne les affiche pas en accroche.',
    'Nommer en surface = renvoyer le contenu en doctrine L3 ou reformuler en effet observable. Si un visiteur cherche le terme, le glossaire répond ; sinon, silence opérant.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.2 — AXE-VALEURS-3-NIVEAUX-01 (axe)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'axe',
    'AXE-VALEURS-3-NIVEAUX-01',
    'Valeurs DB&M lues simultanément sur 3 niveaux (étiquette / effet vivant / interne)',
    'Les valeurs DB&M ne sont pas des étiquettes plates. Elles vivent simultanément sur 3 niveaux. NIVEAU 1 (étiquettes publiques) : ce qui s''affiche au monde — 13 valeurs équilibrées ARE. NIVEAU 2 (effets vivants invisibles) : ce qui se passe en profondeur quand un utilisateur se sert de DB&M — intégration ennéagramme par profil, fluidification DISC interpersonnelle, rupture cycle toxique PNL/AT, construction savoir-agir Boudreault. NIVEAU 3 (interne L3) : ce qui se garde au chaud entre Manu+Claude+Ewan+Bernard — 13 valeurs dont profondeur invisible et écosystème humain comme matière première. Toute formulation de valeurs en surface doit être conçue ET LUE simultanément aux 3 niveaux, sous peine d''aplatir la profondeur.',
    'Doctrine session #113 — recadrage Manu après aplatissement initial Claude',
    'active',
    'TOUJOURS',
    'Initialement Claude a livré 11 valeurs publiques en mode étiquettes plates, perdant la profondeur de la spirale, des intégrations ennéa, de la fluidification DISC, et de la rupture cycle PNL/AT. Manu a recadré : la profondeur compte autant que l''affichage.',
    'Imposer la lecture simultanée 3 niveaux à toute formulation, audit et révision de valeurs DB&M.',
    'vs valeurs plates : préserve la mécanique invisible qui rend DB&M unique, évite la dérive vers le wording marketing creux, ancre les valeurs dans la psychologie réelle des utilisateurs.',
    'Valeurs vivantes qui produisent des effets observables sur l''écosystème humain. Mécanique invisible préservée. Profondeur traçable en audit Bernard et 7 voix.',
    'Claude (ou autre IA) re-aplatit les valeurs en simples slogans — la mécanique se perd, DB&M devient un produit marketing comme un autre. Régression silencieuse.',
    'Audit Bernard systématique sur toute formulation de valeurs : les 3 niveaux sont-ils explicitement présents ? Si N2 ou N3 manque, refuser livraison.',
    'Toute valeur publiée en mini-site doit être documentée en interne avec son N2 (effet vivant) et son N3 (formulation L3) correspondants.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.3 — AXE-MULTI-SURFACES-01 (axe)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'axe',
    'AXE-MULTI-SURFACES-01',
    'Cœur immuable × N surfaces (instances B2B / apps modulaires / KDP / méthode hors bloc)',
    'DB&M est un cœur immuable (matière structurée du savoir opératoire) qui se manifeste sous N surfaces selon le besoin et le canal. Les surfaces actuelles ou anticipées : mini-site public, app web instances B2B (24+ modules, 100 k€/an), App Android globale freemium (lead magnet IBODE solo, candidat Play Store), apps Android modulaires (1 app par module à terme), Amazon KDP par module, Amazon KDP par protocole opératoire (anatomie/physio/procédural × IBODE/circulant/instrumentiste), Amazon KDP/apps de méthodes DB&M applicables hors univers chirurgical (universalité méthodologique). Le cercle vertueux GPS-01 (pipeline 7 étapes + triangle sources/app/pricing) auto-alimente : chaque surface alimente la matière commune, qui nourrit les autres surfaces. Les surfaces libres (App Android IBODE solo, portail chirurgien indépendant) financent leur existence par les revenus B2B grands blocs.',
    'Doctrine session #113 — vision V0.4 + clarification cercle vertueux GPS-01',
    'active',
    'TOUJOURS',
    'Manu porte cette vision multi-surfaces depuis 2013 (cercle vertueux de production de contenu). Surface Map V1.2.0 documente l''App Android comme candidat Play Store avec pages obligatoires livrées 2026-04-13. Les autres surfaces (KDP, apps modulaires, méthodes hors bloc) sont anticipées mais non documentées séparément avant cette session.',
    'Acter le principe « cœur immuable × N surfaces » comme axe directeur de l''évolution produit DB&M long terme.',
    'vs un seul produit web monolithique : robustesse économique (diversification revenus), résilience (pas de dépendance à un canal unique), accessibilité (chaque profil trouve son support — écran/poche/étagère/formation), cercle vertueux auto-renforçant.',
    'DB&M reste pertinent à toutes les échelles d''adoption (du bloc équipé à l''IBODE isolée), génère du contenu auto-régénérant, atteint 1 M€/an récurrent à 10 ans (10 blocs × 100 k€) sans dépendance à un canal d''acquisition.',
    'Éparpillement des forces de production solo dev. Sur-promesse côté pacte produit (mini-site qui annonce N surfaces mais qui n''en livre qu''une). Capacité de production sous-estimée. Bernard doit auditer la roadmap réaliste.',
    'Avant de communiquer publiquement sur une surface, vérifier qu''elle est livrable dans les 12 mois ou la classer explicitement « horizon 5-10 ans ». Skill pacte-produit-bdb obligatoire.',
    'Une décision-cadre roadmap stratégique 5-10 ans à formaliser en brainstorming dédié (DETTE-EXTENSION-HORS-BLOC-01). Cette doctrine ne préjuge pas de l''ordre ni du calendrier des surfaces — elle pose le principe.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.4 — AXE-CERCLE-VERTUEUX-01 (axe — formalisation, pas création)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'axe',
    'AXE-CERCLE-VERTUEUX-01',
    'Cercle vertueux GPS-01 = pipeline 7 étapes + triangle sources/app/pricing',
    'Le cercle vertueux de production de contenu DB&M (référence canonique : décision D-2026-04-26-GPS-01) combine deux mécanismes imbriqués. (1) PIPELINE 7 ÉTAPES de fabrication interne : veille standard → veille solution → lecture → alignement → contenu → éditorial → pricing. (2) TRIANGLE SOURCES/APP/PRICING d''écosystème : sources (qui alimente — contributeurs B2B équipes en instance, contributeurs solo IBODE isolée via app, contributeurs indépendants chirurgiens sans rattachement) × app (qui consomme — N surfaces du cœur immuable) × pricing (qui finance — B2B grands blocs 100 k€/an reproduit 10 fois à 10 ans). Le revenu B2B finance l''accessibilité libre des autres surfaces, qui en retour alimentent la matière vendue. Auto-renforçant.',
    'Doctrine session #113 — formalisation explicite de GPS-01 + triangle (acté implicite au 2026-04-26)',
    'active',
    'TOUJOURS',
    'GPS-01 décidé le 2026-04-26 mentionne pipeline 7 étapes + triangle sources/app/pricing. Manu se réfère depuis à ce cercle vertueux dans toutes les discussions vision/pricing/produit. Formalisation explicite manquante dans atelier_principes.',
    'Ancrer le cercle vertueux GPS-01 comme axe directeur de toute décision produit/contenu/économique.',
    'vs absence de modèle écosystémique : robustesse économique (3 sources d''alimentation), accessibilité préservée (libre + payant coexistent), cercle auto-renforçant à long terme (cumul d''avantage).',
    'Modèle économique soutenable à 10 ans : 1 M€/an récurrent (10 grands blocs × 100 k€). Contenu auto-régénérant sans effort marketing dépendant des algorithmes plateformes. Communauté nationale active (philosophie participative).',
    'Sous-estimation du temps d''amorçage du cercle (combien de contributeurs solo faut-il pour qu''il s''auto-alimente ?). Confusion possible entre les 2 mécanismes (pipeline vs triangle). Bernard doit clarifier dans chaque audit produit.',
    'Toute décision produit/contenu/pricing référence explicitement le mécanisme GPS-01 mobilisé (pipeline ou triangle ou les deux). Skill pacte-produit-bdb veille à la cohérence.',
    'Le cercle vertueux GPS-01 n''est pas négociable comme axe directeur. Son implémentation opérationnelle reste à faire (implémentation = chantier P1 défini par GFC-GPS-01).',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.5 — CONV-SAVOIR-AGIR-01 (convention)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'convention',
    'CONV-SAVOIR-AGIR-01',
    'Distinction des 4 savoirs DB&M (savoir / savoir-faire / savoir-être / savoir-agir)',
    'DB&M distingue 4 savoirs (référence : Boudreault/CRAIE — interne L3, jamais nommé en L1/L2 par INTERDIT-WORDING-METHODES-01). (1) SAVOIR : connaissance déclarative — alimenté par anatomie, glossaire, définitions, codes CCAM. (2) SAVOIR-FAIRE : capacité technique — alimenté par protocoles, fiches techniques, variantes, picking. (3) SAVOIR-ÊTRE : posture relationnelle — alimenté invisiblement par DISC adaptatif et wording AT. (4) SAVOIR-AGIR : INTÉGRATION des 3 précédents en action mobilisable contextuellement — alimenté par la matière interconnectée (combo gagnant 12 maillons) et les 5 « bons » (besoin/moment/endroit/niveau/approfondissement). Le savoir-agir est la finalité pédagogique DB&M ; les 3 autres sont des conditions, pas des fins en soi.',
    'Doctrine session #113 — formalisation explicite des 4 savoirs',
    'active',
    'TOUJOURS',
    'Mission V0.6 mentionne « 4 savoirs ». Pédagogie V1.0.0 axe 6 cite Boudreault et le savoir-agir. Distinction des 4 savoirs jamais formalisée comme convention DB&M auparavant.',
    'Acter la distinction des 4 savoirs comme grille de lecture systématique de tout contenu pédagogique DB&M et de toute évaluation de complétude d''un module.',
    'vs ne distinguer que savoir et savoir-faire : capture le savoir-être (posture) et surtout le savoir-agir (intégration en action contextualisée), qui est la vraie valeur métier IBODE.',
    'Contenu pédagogique évalué sur 4 dimensions, pas 1 ou 2. Détection des modules qui livrent du savoir mort (déclaratif sans intégration). Audit Bernard sur la complétude : un module ne livre du savoir-agir que si les 4 savoirs sont articulés.',
    'Confusion entre savoir-faire et savoir-agir (la nuance Boudreault est subtile). Tendance à livrer du savoir déclaratif et à appeler ça « savoir-agir » par abus de langage.',
    'Audit pédagogique systématique avec grille des 4 savoirs. Skill pedagogie-bdb à mettre à jour pour intégrer cette grille.',
    'Tout module BDB doit être évaluable selon les 4 savoirs. Si un module ne couvre qu''1 ou 2, c''est explicite (pas masqué). Le savoir-agir est la finalité, pas un bonus.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.6 — AXE-DETTE-WORDING-MISSION-EXT-01 (axe — DETTE)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'axe',
    'AXE-DETTE-WORDING-MISSION-EXT-01',
    'DETTE — Métaphore architecte/pierres mission externe à reconsidérer',
    'Mission externe individuelle V0.6 livrée par compromis : « C''est ton parcours, à ton rythme » (option B retenue par Manu par dépit, pas par conviction). Cette formulation débloque Estelle (T6 novice Violet/Bleu, écrasée par « architecte ») mais affaiblit Blanche (T1w2 experte Vert) et Fernand (T8 chirurgien Rouge/Orange) qui répondaient mieux à la métaphore architecte/édifice. La métaphore pierres/architecte/édifice tient mais demande une formulation qui parle simultanément à la sécurité Estelle ET à la matérialité Blanche/Fernand. À retravailler en brainstorming dédié — ne pas oublier.',
    'Doctrine session #113 — dette wording reconnue par Manu (« par dépit »)',
    'active',
    'TOUJOURS',
    'Audit 7 voix mission externe a révélé un compromis : Estelle débloquée mais Blanche et Fernand affaiblis. Manu a explicitement dit « je retiens la version B qui fait moins débile mais c''est par dépit pas par conviction ».',
    'Marquer cette dette en backlog actif pour ne pas la perdre. Déclencher un brainstorming wording dédié quand le contexte le permet.',
    'vs masquer la dette : reconnaît honnêtement que la formulation actuelle est sous-optimale. Évite la dérive « ça ira comme ça » (désintégration type 9).',
    'Backlog wording maintenu à jour. Dette résorbable quand brainstorming dédié (probablement après finalisation Manifeste V1.4 et Canon V1.0.6).',
    'Oubli de la dette si pas réactivée dans 6 mois. Acceptation tacite que cette formulation est définitive alors qu''elle est de compromis.',
    'Réactiver cette dette à chaque audit identité/mission (skill atelier-session-bdb en ouverture). Brainstorming dédié à programmer en session future.',
    'Trigger de résorption : disponibilité brainstorming wording + maturité personas pour test multi-profil. Pas avant validation Manifeste V1.4.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;

-- 2.7 — AXE-DETTE-EXTENSION-HORS-BLOC-01 (axe — DETTE)
INSERT INTO atelier_principes
  (categorie, ref, titre, description, source, statut, marqueur,
   realite, fonction, avantage, benefice, risque, resultat, recommandation,
   date_figement)
VALUES
  (
    'axe',
    'AXE-DETTE-EXTENSION-HORS-BLOC-01',
    'DETTE — Élargissement hors bloc (KDP/apps de méthodes) à cadrer en brainstorming dédié',
    'Vision 10 ans V0.4 mentionne explicitement « surfaces de méthode applicables hors bloc » — chaque outil méthode DB&M (DISC, MERE, FAB(3R), etc.) peut faire l''objet d''un KDP ou d''une App de mise en pratique dans l''univers professionnel hors bloc opératoire. Cette extension élargit le périmètre Manifeste actuellement centré sur le bloc IBODE. Implication : (a) modification §1 mission Manifeste V1.4, (b) modification §4 périmètre Manifeste, (c) capacité de production réaliste à évaluer (solo dev + IA), (d) audit pacte produit avant publication. À cadrer en brainstorming dédié — pas dans les sessions doctrinales générales.',
    'Doctrine session #113 — extension reconnue par Manu (« vision depuis 2013 »)',
    'active',
    'TOUJOURS',
    'Manu a confirmé que cette vision multi-canaux hors bloc existe depuis 2013. Documentation locale absente. Implications produit/économiques significatives non encore cadrées.',
    'Marquer cette dette en backlog stratégique pour brainstorming dédié à venir.',
    'vs intégrer brutalement dans la doctrine : évite sur-promesse et incohérence avec capacité de production solo dev. Préserve la cohérence doctrine actuelle (centrée bloc) jusqu''à validation explicite extension.',
    'Roadmap stratégique 5-10 ans cadrée explicitement. Pacte produit préservé. Bernard peut auditer chaque extension proposée.',
    'Annonce publique d''une surface hors bloc avant validation cadrage. Sur-promesse pacte produit. Éparpillement forces de production. Confusion sur le périmètre DB&M (« est-ce du bloc ou de la formation pro générale ? »).',
    'Brainstorming dédié à programmer (Manu + Claude + Bernard). Critères : capacité de production, pacte produit, modèle économique, identification des premières méthodes candidates (DISC ? MERE ? FAB(3R) ?).',
    'Trigger de résorption : disponibilité brainstorming stratégique + maturité du chantier B2B (ne pas se disperser avant que le cœur soit stable). Pas avant 2026-Q4.',
    '2026-05-03'
  )
ON CONFLICT (ref) DO NOTHING;


-- =============================================================================
-- BLOC 3 — atelier_sessions (#113)
-- =============================================================================

INSERT INTO atelier_sessions
  (numero, titre, statut, objectifs, scope, livrables, avancement,
   date_debut, date_fin)
VALUES
  (
    113,
    'Doctrine identitaire DB&M — mission, vision, valeurs, 5 pourquoi',
    'fait',
    'Trancher les 4 champs identitaires DB&M restés [À TRANCHER] depuis IDENTITE V0.3 (avril 2026) : mission, vision 3/10 ans, valeurs, 5 pourquoi. Faire passer chaque formulation à la moulinette des 7 voix d''audit DB&M avec lecture ARE. Acter la doctrine en base avant toute autre production.',
    'L3 doctrine. Ne touche pas au code, ne touche pas au schéma DB structurel, ne touche pas aux modules métier. Ne touche pas aux fondateurs (Manifeste / Canon / Pédagogie / CLAUDE.md) — leur mise à jour est différée en sessions suivantes.',
    'Mission V0.6 (3 versions : INTERNE + EXT-tu + EXT-vous). Vision V0.4 (4 versions : INTERNE 3 ans + INTERNE 10 ans + EXT 3 ans + EXT 10 ans). Valeurs V0.3 (architecture 3 niveaux). 5 Pourquoi V0.1 (chaîne 5 niveaux + variante narrative). 5 nouveaux principes (1 interdit, 3 axes, 1 convention) + 2 dettes (axes DETTE-). 1 fichier IDENTITE_DBM V0.4.0 mis à jour. Migration SQL session_113 produite et exécutée.',
    'Production complète. Validation Manu sur tous les éléments. Audit 7 voix x ARE systématique. Échanges itératifs avec recadrages Manu (3 corrections majeures intégrées : caisse à outils 5 axes + 4 savoirs, profondeur 3 niveaux des valeurs, retrouvaille du cercle vertueux GPS-01 documenté).',
    '2026-05-03',
    '2026-05-03'
  )
ON CONFLICT (numero) DO NOTHING;


-- =============================================================================
-- VÉRIFICATION POST-EXÉCUTION (à lancer manuellement après COMMIT)
-- =============================================================================
-- SELECT ref, titre, session_num FROM atelier_decisions
--   WHERE ref LIKE 'D-2026-05-03-DOCTRINE-%' ORDER BY ref;
-- → attendu : 4 lignes
--
-- SELECT ref, categorie, titre FROM atelier_principes
--   WHERE ref IN (
--     'INTERDIT-WORDING-METHODES-01',
--     'AXE-VALEURS-3-NIVEAUX-01',
--     'AXE-MULTI-SURFACES-01',
--     'AXE-CERCLE-VERTUEUX-01',
--     'CONV-SAVOIR-AGIR-01',
--     'AXE-DETTE-WORDING-MISSION-EXT-01',
--     'AXE-DETTE-EXTENSION-HORS-BLOC-01'
--   ) ORDER BY ref;
-- → attendu : 7 lignes
--
-- SELECT numero, titre, statut FROM atelier_sessions WHERE numero = 113;
-- → attendu : 1 ligne, statut = 'fait'

COMMIT;


-- =============================================================================
-- ROLLBACK (à exécuter UNIQUEMENT en cas de problème détecté post-COMMIT)
-- =============================================================================
-- BEGIN;
--   DELETE FROM atelier_decisions WHERE ref LIKE 'D-2026-05-03-DOCTRINE-%';
--   DELETE FROM atelier_principes WHERE ref IN (
--     'INTERDIT-WORDING-METHODES-01',
--     'AXE-VALEURS-3-NIVEAUX-01',
--     'AXE-MULTI-SURFACES-01',
--     'AXE-CERCLE-VERTUEUX-01',
--     'CONV-SAVOIR-AGIR-01',
--     'AXE-DETTE-WORDING-MISSION-EXT-01',
--     'AXE-DETTE-EXTENSION-HORS-BLOC-01'
--   );
--   DELETE FROM atelier_sessions WHERE numero = 113;
-- COMMIT;

-- =============================================================================
-- FIN MIGRATION session #113
-- =============================================================================
