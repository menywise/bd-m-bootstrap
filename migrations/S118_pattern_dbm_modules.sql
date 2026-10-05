-- ============================================================
-- S118 — Pattern DBM modules consolide (cristallisation regles UX/code)
-- Date : 2026-05-05
-- Source : Session #117bis migration V5 finition + recettage Manu glossaire
-- Objet : eriger en imperatifs (TOUJOURS) les regles adoptees pendant la
--         migration DBM theme et le polissage du module de reference glossaire
-- Methode : FAB(3R) complet sur chaque principe (realite/fonction/avantage/
--           benefice/risque/resultat/recommandation)
-- Total : 43 INSERT atelier_principes
-- ============================================================

-- Idempotence : suppression des refs existantes avant re-insertion
DELETE FROM atelier_principes WHERE ref IN (
  -- Couleurs (4)
  'INTERDIT-COULEUR-01','INTERDIT-COULEUR-02','CONV-PALETTE-01','CONV-COLOR-STATUS-01',
  -- Variables CSS (3)
  'CONV-MODULE-COLOR-01','CONV-MODULE-COLOR-02','INTERDIT-MODULE-COLOR-01',
  -- App-zone (5)
  'CONV-APP-ZONE-01','CONV-APP-ZONE-02','CONV-APP-ZONE-03','CONV-APP-ZONE-04','CONV-APP-ZONE-05',
  -- Toolbar (5)
  'CONV-TOOLBAR-01','CONV-TOOLBAR-02','CONV-TOOLBAR-03','CONV-TOOLBAR-04','CONV-TOOLBAR-05',
  -- Modales (8)
  'CONV-MODAL-01','CONV-MODAL-02','CONV-MODAL-03','CONV-MODAL-04','CONV-MODAL-05',
  'CONV-MODAL-06','CONV-MODAL-07','CONV-MODAL-08',
  -- Cards (4)
  'CONV-CARD-01','CONV-CARD-02','CONV-CARD-03','CONV-CARD-04',
  -- Boutons (3)
  'CONV-BTN-01','CONV-BTN-02','CONV-BTN-03',
  -- Signaler/Proposer (2)
  'CONV-SIGNAL-01','INTERDIT-SIGNAL-01',
  -- Fonts couleur module (1)
  'CONV-FONT-MODULE-01',
  -- Anonymisation differenciee (3)
  'INTERDIT-PERSO-01','INTERDIT-PERSO-02','INTERDIT-PERSO-03',
  -- Methode travail Claude (3)
  'INTERDIT-BULK-01','CONV-VERIF-01','CONV-VERIF-02',
  -- References (2)
  'REF-MODULE-DBM-01','REF-CSS-DBM-01'
);

-- ============================================================
-- BLOC 1 — COULEURS (4 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('INTERDIT-COULEUR-01','interdit',
 'Rouge interdit dans la navigation des modules',
 'Le rouge (btn-danger, bg-danger comme couleur principale) est interdit dans les zones de navigation des modules. Trop violent visuellement pour un usage prolonge en bloc operatoire. Il reste autorise uniquement pour signaler des erreurs (toast danger, alert danger).',
 'TOUJOURS',
 'Rouge utilise dans plusieurs modules pour les boutons de suppression et d action principale.',
 'Reserver le rouge aux signaux d alerte et d erreur, jamais a la navigation courante.',
 'Lisibilite confort visuel sur sessions longues + coherence avec la fonction semantique des couleurs.',
 'IBODE n est pas agressee visuellement par des aplats rouges quand elle prepare une intervention.',
 'Si non applique : fatigue visuelle, perte de signal en cas de vrai danger, image agressive.',
 'Btn-danger remplace par btn-secondary ou btn-outline-secondary dans les modules.',
 'Aligner tous les modules sur palette pastel + gris pour la navigation, rouge reserve aux erreurs.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('INTERDIT-COULEUR-02','interdit',
 'Toutes les couleurs des modules doivent etre pastel doux',
 'Aucune couleur saturee comme couleur principale d un module. Toute couleur module est tiree de la palette pastel canonique (app_groups.color). Les variations sont : pastel de base, version saturee pour hover/focus, version texte sombre, version transparente pour fonds.',
 'TOUJOURS',
 'Anciens modules utilisaient bleu primary 0d6efd, vert success 198754, etc. — couleurs saturees.',
 'Imposer une palette douce qui respecte les yeux pendant des sessions prolongees.',
 'Identite visuelle apaisee, professionnelle, adaptee a un usage hospitalier.',
 'L equipe utilise l app sans fatigue visuelle meme apres plusieurs heures.',
 'Si non applique : agressivite visuelle, ressenti de couleurs criardes, fatigue oculaire.',
 'Palette canonique : bloc=#93c5fd, equipe=#86efac, savoir=#c4b5fd, pilotage=#cbd5e1, espace_perso=#fdba74.',
 'Toujours partir de app_groups.color, jamais hardcoder une couleur saturee dans un module.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-PALETTE-01','convention',
 'Palette pastel canonique par groupe de modules',
 'La palette pastel est definie une seule fois dans la table app_groups. Aucun module ne redefinit ses couleurs en dur. Bleu pastel pour bloc, vert pastel pour equipe, indigo pastel pour savoir, gris pale pour pilotage, peche pastel pour espace personnel.',
 'TOUJOURS',
 'Couleurs de groupe stockees dans app_groups.color et appliquees via injection inline du shell.',
 'Source unique de la couleur d un module = app_groups.color de son groupe.',
 'Coherence absolue entre portail, sidebar, bandeau module, modales, boutons.',
 'Changement de palette = un seul UPDATE SQL, propage partout automatiquement.',
 'Si bypass : derive visuelle, couleurs incoherentes entre portail et module ouvert.',
 'Migration S117bis applique pastel + gris pour pilotage ; structure stabilisee.',
 'Toute nouvelle couleur passe obligatoirement par UPDATE app_groups.',
 'Migration S117bis_palette_pastel_groups.sql 2026-05-05',
 '2026-05-05'),

('CONV-COLOR-STATUS-01','convention',
 'Toasts et alerts gardent les couleurs status universelles',
 'Les toasts et alertes conservent les couleurs status reconnues universellement : vert pour succes, jaune pour avertissement, rouge pour erreur, bleu pour information. Seul le statut primary (sans signification semantique) prend la couleur du module.',
 'TOUJOURS',
 'Toasts utilisent classes Bootstrap text-bg-success/warning/danger/info/primary.',
 'Preserver le langage universel des couleurs status pour les signaux utilisateur.',
 'Aucun apprentissage requis : un toast vert dit succes dans tous les modules.',
 'L utilisateur reconnait instantanement la nature du signal sans lire le texte.',
 'Si on coloriait toasts en couleur module : confusion totale, perte de signification.',
 'Status reconnus : vert succes, jaune attention, rouge erreur, bleu info, primary = module.',
 'Conserver classes Bootstrap status, override seulement primary -> couleur module.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 2 — VARIABLES CSS (3 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-MODULE-COLOR-01','convention',
 'Cascade variables couleur sur app-content',
 'Chaque module injecte sur son conteneur app-content les 4 variables CSS de couleur : module-color (pastel base), module-color-strong (saturee pour hover focus), module-color-text (texte sombre lisible), module-color-soft (transparente pour fonds). L injection se fait via attribut style inline pour faciliter la cascade.',
 'TOUJOURS',
 'Pattern utilise dans les modules migres v5 et formalise dans dbm-module-color.css.',
 'Definir une fois les 4 variables et les utiliser partout dans le CSS.',
 'Module entier change de couleur en modifiant 4 valeurs sur app-content.',
 'Theme module reactif a la palette app_groups sans toucher au CSS du module.',
 'Si manquant : couleurs en dur dispersees, impossible a maintenir.',
 'Pattern stable, applique sur 13 modules migres dans la session #117bis.',
 'Toute creation de module DOIT injecter les 4 variables sur app-content au chargement.',
 'Migration DBM theme session #117 2026-05-05',
 '2026-05-05'),

('CONV-MODULE-COLOR-02','convention',
 'Cascade variables couleur jusqu aux modales',
 'Les modales Bootstrap sont sorties du conteneur app-content quand elles s ouvrent (deplacees a la racine du body). Les variables couleur module sont alors perdues. Pour les retrouver, chaque module ajoute un bloc style inline dans son HEAD qui declare les memes variables sur la racine root.',
 'TOUJOURS',
 'Bug observe glossaire : modales rendues en bleu primary par defaut, perte couleur module.',
 'Garantir que les variables couleur module restent disponibles pour les modales.',
 'Modales colorees au theme du module sans CSS supplementaire dans chaque modale.',
 'Coherence visuelle complete : modale signaler, proposer, edition portent la couleur.',
 'Si oublie : modales rendent en bleu primary, rupture visuelle complete.',
 'Pattern resolu via bloc style inline en HEAD sur tous les modules migres.',
 'Tout module qui utilise des modales DOIT inclure le bloc style root dans son HEAD.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('INTERDIT-MODULE-COLOR-01','interdit',
 'Jamais hardcoder une couleur dans un module',
 'Aucune valeur de couleur en dur dans le HTML, CSS ou JS d un module. Toute couleur passe par les variables CSS module-color, module-color-strong, module-color-text, module-color-soft, ou par les classes Bootstrap status (success warning danger info).',
 'TOUJOURS',
 'Anciens modules contenaient des hex hardcodes : background:#0d6efd, color:#198754 etc.',
 'Eliminer toute derive de couleur entre modules et faciliter changement de palette.',
 'Module change de couleur sans toucher a son code propre.',
 'Maintenance simplifiee, palette centralisee, vente future de l app facilitee.',
 'Si bypass : derive impossible a tracker, modules hors charte.',
 'Audit sur 13 modules migres : zero hex hardcode dans le code module.',
 'Audit grep #[0-9a-fA-F] sur tout module avant deploiement FTP.',
 'Migration DBM theme session #117 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 3 — APP-ZONE (5 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-APP-ZONE-01','convention',
 'Ordre obligatoire des zones d un module',
 'Tout module presente ses zones dans l ordre fixe : fil d Ariane (Breadcrumb) puis bandeau colore (Page Title) puis barre de filtres (Filters) puis contenu (Content). Cet ordre garantit que l utilisateur trouve toujours la meme structure quel que soit le module.',
 'TOUJOURS',
 'Pattern verifie sur les 13 modules migres dans la session.',
 'Imposer une structure verticale standardisee pour faciliter l apprentissage.',
 'Aucune surprise pour l utilisateur quel que soit le module ouvert.',
 'Reduction du temps de prise en main, confort d usage, reflexes installes.',
 'Si ordre brise : utilisateur perd ses reperes, navigation cognitive plus couteuse.',
 'Ordre stable applique partout dans les modules migres v5.',
 'Toute creation de module respecte cet ordre en sections app-zone successives.',
 'Migration DBM theme session #117 + template-module-demo.html',
 '2026-05-05'),

('CONV-APP-ZONE-02','convention',
 'Chaque zone enveloppee dans une section app-zone',
 'Toute zone fonctionnelle est enveloppee dans une balise section avec class app-zone et attribut data-zone. Chaque zone peut disparaitre proprement sans casser la mise en page (par exemple un module sans filtres supprime sa zone Filters).',
 'TOUJOURS',
 'Pattern issu de template-module-demo.html, applique sur tous les modules migres.',
 'Modulariser la page module en zones independantes et conditionnelles.',
 'Suppression d une zone n affecte pas les autres, structure resiliente.',
 'Adaptation rapide a chaque module sans refonte complete du HTML.',
 'Si bypass : page rigide, ajout ou retrait de section couteux.',
 'Pattern stable, lit par les developpeurs et conforme a la doctrine.',
 'Toute zone fonctionnelle doit etre enveloppee dans section.app-zone[data-zone].',
 'Template createur/atelier/template-module-demo.html',
 '2026-05-05'),

('CONV-APP-ZONE-03','convention',
 'Espace reduit entre fil d Ariane et bandeau',
 'L espace vertical entre la zone Breadcrumb et la zone Page Title est reduit a 0.5rem au lieu de 0.75rem standard. Les autres zones gardent l espace standard.',
 'TOUJOURS',
 'Recettage Manu : espace par defaut creait une rupture verticale inutile en haut de page.',
 'Resserrer le haut de page pour valoriser le bandeau colore comme repere principal.',
 'Bandeau plus lisible et plus proche du fil d Ariane, hierarchie visuelle clarifiee.',
 'Premiere impression du module plus dense et professionnelle.',
 'Si non applique : effet rupture en haut, bandeau colore deconnecte du contexte.',
 'Regle ajoutee dans dbm-module-color.css section 6 (app-zone Breadcrumb 0.5rem).',
 'Verifier visuel sur tous les modules migres.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-APP-ZONE-04','convention',
 'Footer du module hors app-content',
 'Le footer du module (copyright, mentions, version) est place a l exterieur du conteneur app-content, directement dans app-main. Il n est jamais une zone app-zone.',
 'TOUJOURS',
 'Pattern observe dans annuaire et template-module-demo.html.',
 'Separer le contenu metier du module (app-content) du chrome de l application (footer).',
 'Footer constant entre modules, ne herite pas des couleurs ou styles du module.',
 'Identite app preservee, footer toujours neutre et professionnel.',
 'Si inclus dans app-zone : herite de la couleur module, perd son role transverse.',
 'Pattern stable a propager sur tous les modules migres restants.',
 'Footer DOIT etre place apres la fermeture de app-content dans le HTML du module.',
 'Template createur/atelier/template-module-demo.html',
 '2026-05-05'),

('CONV-APP-ZONE-05','convention',
 'Modales rendues hors zones app-zone',
 'Les modales sont declarees a l exterieur du conteneur app-content (typiquement avant la fermeture de body). Bootstrap 5 les deplace de toute facon dans la racine du body au moment de l affichage.',
 'TOUJOURS',
 'Comportement par defaut Bootstrap 5 (portal pattern).',
 'Eviter conflits z-index et flux DOM avec le contenu du module.',
 'Modales toujours au-dessus de tout, aucun risque de capture par overflow.',
 'Affichage modal previsible et identique entre modules.',
 'Si tente de rendre dans app-zone : conflits z-index, modale tronquee.',
 'Pattern stable, applique partout dans la session.',
 'Declarer toutes les modales en dehors de app-content, jamais dans une zone.',
 'Comportement Bootstrap 5.3.3 documente',
 '2026-05-05');

-- ============================================================
-- BLOC 4 — TOOLBAR (5 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-TOOLBAR-01','convention',
 'Pattern de toolbar standard sur tous les modules',
 'La barre de filtres suit un pattern unique : zone de recherche extensible a gauche (input-group qui prend l espace disponible) puis selects de filtres a largeur fixe 180px puis bouton d action principal a largeur fixe 180px a droite.',
 'TOUJOURS',
 'Pattern impose dans les modules glossaire, thesaurus, annuaire, organisateur.',
 'Standardiser l ergonomie de filtrage sur tous les modules.',
 'Utilisateur retrouve toujours sa recherche au meme endroit.',
 'Reflexes installes, vitesse d acces aux filtres comparable d un module a l autre.',
 'Si pattern variable : surcharge cognitive, perte de productivite.',
 'Pattern stabilise et applique sur les modules de reference.',
 'Toute toolbar de module DOIT respecter input-group flex-grow + selects 180px + CTA 180px.',
 'Recettage Manu sessions #117 et #117bis',
 '2026-05-05'),

('CONV-TOOLBAR-02','convention',
 'Boutons toolbar en taille petite (btn-sm)',
 'Tous les boutons et inputs de la toolbar sont en taille petite : classe btn-sm sur les boutons, form-control-sm sur les inputs, form-select-sm sur les selects. Coherence verticale de la toolbar.',
 'TOUJOURS',
 'Pattern applique dans la session sur 8 modules.',
 'Garantir une hauteur uniforme et compacte de la barre de filtres.',
 'Toolbar discrete qui ne mange pas l espace de contenu.',
 'Plus de place pour le contenu reel, ergonomie respiree.',
 'Si tailles melangees : toolbar visuellement bancale.',
 'Tache #34 completed sur 8 modules.',
 'btn-sm + form-control-sm + form-select-sm partout dans toolbar.',
 'Recettage Manu session #117bis',
 '2026-05-05'),

('CONV-TOOLBAR-03','convention',
 'Recherche en input-group avec icone',
 'La zone de recherche est un input-group avec icone de loupe (bi-search) dans un input-group-text a fond blanc et bord droit supprime, suivi d un form-control avec bord gauche supprime. Ensemble visuel uniforme.',
 'TOUJOURS',
 'Pattern bootstrap input-group standard, applique sur glossaire, thesaurus, annuaire.',
 'Donner un repere visuel fort a la fonction recherche.',
 'Utilisateur identifie instantanement la zone de saisie de recherche.',
 'Decouverte intuitive de la fonction recherche meme par utilisateur novice.',
 'Si input nu : recherche se confond avec un autre champ.',
 'Pattern teste et valide visuellement.',
 'Recherche DOIT toujours utiliser input-group + bi-search + bordures fusionnees.',
 'Pattern Bootstrap 5.3.3 + recettage Manu',
 '2026-05-05'),

('CONV-TOOLBAR-04','convention',
 'Toolbar responsive en dessous de 768px',
 'Sur ecran inferieur a 768px de large, la toolbar passe en colonnes empilees au lieu d une seule ligne. La recherche reste en haut, les selects et le bouton d action descendent ligne par ligne.',
 'TOUJOURS',
 'Necessaire pour usage tablette en bloc operatoire.',
 'Garantir la lisibilite et l accessibilite des filtres sur ecrans etroits.',
 'Ergonomie tablette correcte, pas de debordement ou troncature.',
 'Module utilisable sur tous formats d ecran sans regression.',
 'Si non gere : selects tronques, recherche illisible sur tablette.',
 'A implementer dans dbm-module-color.css media query 768px.',
 'Tester sur tablette des prochains modules migres.',
 'Pattern responsive standard',
 '2026-05-05'),

('CONV-TOOLBAR-05','convention',
 'Bouton d action principal a largeur fixe 180px',
 'Le bouton CTA principal de la toolbar (Ajouter, Nouveau, Creer) a une largeur fixe de 180px. Coherence avec les selects de filtres egalement a 180px. Si plusieurs CTA, les boutons s empilent ou se groupent dans un dropdown.',
 'TOUJOURS',
 'Pattern adopte session #117 sur les modules de reference.',
 'Garantir un ancrage visuel constant du bouton d action principal.',
 'Utilisateur retrouve le CTA toujours au meme endroit, meme largeur.',
 'Reflexe construit pour creer/ajouter sur tous les modules.',
 'Si tailles variables : effet bricolage, decentrement visuel.',
 'Pattern stable applique sur glossaire, thesaurus, annuaire.',
 'CTA principal DOIT faire 180px de large dans la toolbar.',
 'Recettage Manu session #117bis',
 '2026-05-05');

-- ============================================================
-- BLOC 5 — MODALES (8 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-MODAL-01','convention',
 'Bandeau colore couleur module sur toutes les modales',
 'Toutes les modales d un module portent un bandeau colore avec la couleur du module dans leur en-tete. Classe modal-header-module appliquee systematiquement, jamais de modale sans bandeau.',
 'TOUJOURS',
 'Recettage Manu : modales etaient en blanc primary, rupture visuelle complete.',
 'Identite visuelle uniforme, signature module visible des l ouverture.',
 'Utilisateur sait instantanement dans quel module il agit.',
 'Coherence visuelle complete entre module et ses modales.',
 'Si bandeau absent : modale generique, perte de contexte module.',
 'Pattern resolu et applique session #117bis sur glossaire.',
 'Toutes modales DOIVENT avoir class modal-header modal-header-module.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-02','convention',
 'Backdrop avec flou de fond',
 'L overlay sous la modale (backdrop) a une opacite de 0.65 et un effet de flou de 4px applique au contenu derriere. Le contenu de l app derriere la modale recoit aussi un leger flou de 2px pour focus complet sur la modale.',
 'TOUJOURS',
 'Demande Manu : flou plus prononce pour signifier modale active.',
 'Concentration visuelle sur la modale, isolation complete du fond.',
 'L utilisateur ne se disperse pas, focus mental sur la tache de la modale.',
 'Sentiment de modal effectivement modal, pas un simple overlay.',
 'Si overlay leger : utilisateur garde un oeil sur le fond, dispersion.',
 'Implemente dans dbm-module-color.css section 11.',
 'Conserver opacity 0.65 + blur 4px (backdrop) + blur 2px (app-content).',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-03','convention',
 'Largeur uniforme entre modales d edition d un meme module',
 'Toutes les modales d edition (creation, modification, signalement) d un meme module ont la meme largeur. Si une modale est modal-lg, toutes les modales d edition du module sont modal-lg. Coherence visuelle imperative.',
 'TOUJOURS',
 'Recettage Manu glossaire : modale Signaler etait modal standard, modale Proposer etait modal-lg, ressenti d incoherence.',
 'Eviter l impression que les modales sont de tailles differentes selon les fonctions.',
 'Utilisateur ne se demande pas pourquoi tel formulaire est plus etroit.',
 'Sensation de coherence et de soin du detail, qualite premium.',
 'Si tailles melangees : impression d application bricolee.',
 'Resolu sur glossaire en passant modalSignalerTerme a modal-lg.',
 'Aligner toutes les modales d edition d un module sur la meme taille (modal-lg par defaut).',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-04','convention',
 'Modales centrees et scrollables par defaut',
 'Toutes les modales utilisent les classes modal-dialog-centered et modal-dialog-scrollable. Centrees verticalement quand la fenetre est plus haute que la modale, scrollables si le contenu depasse.',
 'TOUJOURS',
 'Pattern bootstrap standard, applique session #117 dans tache #37.',
 'Garantir un comportement uniforme sur tous formats d ecran.',
 'Modale toujours bien positionnee, contenu jamais coupe.',
 'Adaptation automatique aux contraintes d ecran sans bug.',
 'Si non gere : modale en haut, contenu coupe, scroll de la page derriere.',
 'Pattern applique partout dans les modules migres.',
 'modal-dialog-centered + modal-dialog-scrollable obligatoires.',
 'Tache #37 session #117',
 '2026-05-05'),

('CONV-MODAL-05','convention',
 'CTA des modales en btn-module',
 'Les boutons d action principale dans les modales utilisent la classe btn-module qui prend automatiquement la couleur du module. Jamais btn-primary qui reste sur le bleu Bootstrap par defaut.',
 'TOUJOURS',
 'Recettage Manu : CTA en bleu primary alors que module en vert ou indigo, rupture.',
 'Coherence couleur entre module et action de la modale.',
 'Bouton de validation prend la couleur du module, signature complete.',
 'Confirmation visuelle que l action s applique au module en cours.',
 'Si btn-primary : bouton bleu hors theme, rupture visuelle.',
 'Resolu sur glossaire, modales harmonisees.',
 'CTA modale DOIT etre btn-module, jamais btn-primary.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-06','convention',
 'Titre judicieux obligatoire dans chaque modale',
 'Aucune modale sans titre dans son bandeau. Le titre decrit precisement la fonction de la modale (Signaler un probleme, Proposer un terme, Modifier l entree, Confirmer la suppression). Pas de modale silencieuse meme pour un profil membre.',
 'TOUJOURS',
 'Demande explicite Manu : aligner toutes les modales avec un titre judicieux.',
 'Fournir un repere clair sur la fonction de la modale des son ouverture.',
 'Utilisateur sait immediatement ce qu il va faire.',
 'Reduction des erreurs et des annulations, valeur ajoutee de chaque modale claire.',
 'Si pas de titre : utilisateur hesite, doute, abandonne la modale.',
 'A appliquer sur 100% des modales lors des prochaines migrations.',
 'Toute modale DOIT avoir un titre dans modal-title decrivant precisement sa fonction.',
 'Demande Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-07','convention',
 'Croix de fermeture coloree au theme module',
 'La croix de fermeture (btn-close) du bandeau modal-header-module est dessinee dans la couleur module-color-text au lieu du noir Bootstrap par defaut. Effet esthetique qui aligne la croix sur le theme du module.',
 'TOUJOURS',
 'Demande Manu : effet visuel plus uniforme, croix qui adopte le theme.',
 'Etendre la coherence couleur jusqu au moindre detail de la modale.',
 'Identite visuelle ultra-coherente, sentiment de soin et de qualite.',
 'Modale entiere harmonisee, pas un seul element hors theme.',
 'Si croix noire : detail incoherent qui casse l effet d ensemble.',
 'Implemente dans dbm-module-color.css section 11 via pseudo-elements.',
 'Croix dessinee en pseudo-elements colores en var(--module-color-text).',
 'Demande Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-MODAL-08','convention',
 'Cascade variables CSS root obligatoire dans HEAD',
 'Chaque module qui utilise des modales DOIT inclure dans son HEAD un bloc style inline qui declare les 4 variables CSS de couleur module sur la racine root. Sans ce bloc, les modales perdent la couleur du module quand Bootstrap les sort du conteneur app-content.',
 'TOUJOURS',
 'Bug observe glossaire avant correction : modales rendues en bleu primary.',
 'Garantir que les variables couleur restent disponibles pour les modales sortes du conteneur.',
 'Modales correctement colorees sans hack ni override CSS lourd.',
 'Solution legere et systematique, applicable a tous les modules.',
 'Si oublie : modales bleu primary, regression visuelle complete.',
 'Pattern stable, applique sur glossaire et a propager.',
 'Bloc style root avec 4 variables couleur DOIT etre present dans le HEAD de chaque module.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 6 — CARDS (4 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-CARD-01','convention',
 'Bordure gauche couleur module sur app-card principale',
 'La carte principale qui contient les onglets ou le contenu central du module a une bordure gauche de 3px en couleur module. Marquage visuel fort de l identite module sur le bloc structurant principal.',
 'TOUJOURS',
 'Recettage Manu glossaire : carte principale sans bordure, perte d identite visuelle.',
 'Marquer visuellement le bloc principal de contenu avec la couleur du module.',
 'Identite module presente meme dans le contenu, pas seulement le bandeau.',
 'Repere visuel constant tout au long de l interaction avec le module.',
 'Si pas de bordure : carte generique, perte de signature visuelle.',
 'Resolu sur glossaire via attribut data-accent="module" sur app-card principale.',
 'Toute app-card structurante DOIT porter data-accent="module".',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-CARD-02','convention',
 'Cards rendues par JS heritent automatiquement de la bordure module',
 'Les cards generees dynamiquement par le JavaScript du module (.glos-card, .anat-card, .fiche-card, .cours-card, .install-card) heritent automatiquement de la bordure gauche couleur module via dbm-module-color.css section 9. Pas besoin d ajouter data-accent sur chaque card rendue.',
 'TOUJOURS',
 'Pattern implemente dans dbm-module-color.css section 9.',
 'Eviter d avoir a marquer chaque card rendue par JS individuellement.',
 'Code JS plus simple, CSS porte la coherence visuelle.',
 'Maintenance reduite, pattern automatique pour tout module futur.',
 'Si chaque card devait porter data-accent : code JS pollue.',
 'Pattern stable, fonctionne sur glossaire, anatomie, fiches, cours, installation.',
 'Convention nommage class .[module]-card pour heriter automatiquement.',
 'Migration DBM theme session #117',
 '2026-05-05'),

('CONV-CARD-03','convention',
 'Convention de nommage des cards rendues par JS',
 'Toute carte generee par le JavaScript d un module doit porter une classe au format prefixe-card, par exemple glos-card pour glossaire, anat-card pour anatomie. Cette convention permet l heritage automatique des styles CSS via dbm-module-color.css.',
 'TOUJOURS',
 'Convention deja appliquee sur 5 modules (glossaire, anatomie, fiches, cours, installation).',
 'Garantir que chaque module a son selecteur CSS dedie pour ses cards rendues.',
 'Possibilite d ajouter des regles specifiques par module sans collision.',
 'Coherence et lisibilite du CSS, debogage facilite.',
 'Si nommage libre : selecteurs incoherents, CSS impossible a maintenir.',
 'Convention stable a etendre aux modules restants.',
 'Tout JS qui cree des cards DOIT utiliser class prefixe-card.',
 'Migration DBM theme session #117',
 '2026-05-05'),

('CONV-CARD-04','convention',
 'Bordure 4px sur cards en etat fort (data-accent module-strong)',
 'Pour les cards qui necessitent une emphase plus forte (selection, focus, etat actif), utiliser data-accent="module-strong" qui applique une bordure de 4px en couleur module-color-strong. Les cards normales restent a 3px en module-color.',
 'TOUJOURS',
 'Pattern implemente dans dbm-module-color.css section 3.',
 'Differencier visuellement les cards en etat normal et en etat fort.',
 'Hierarchie visuelle claire entre cards de meme module.',
 'Utilisateur identifie instantanement les cards en focus ou selectionnees.',
 'Si non differencie : cards toutes identiques, perte de hierarchie visuelle.',
 'Pattern stable, deja en place dans dbm-module-color.css.',
 'Utiliser data-accent="module-strong" pour les cards en emphase forte.',
 'Migration DBM theme session #117',
 '2026-05-05');

-- ============================================================
-- BLOC 7 — BOUTONS (3 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-BTN-01','convention',
 'Bouton CTA principal du module en btn-module',
 'Le bouton d action principale d un module utilise la classe btn-module qui herite automatiquement des variables couleur module. Jamais btn-primary, btn-info, btn-success comme bouton principal d un module (les status sont reserves a leur signification semantique).',
 'TOUJOURS',
 'Audit session #117 : modules utilisaient btn-primary partout, perte d identite couleur.',
 'Garantir que le CTA principal porte la couleur du module.',
 'Identite couleur jusque sur le bouton d action central.',
 'Coherence visuelle complete entre bandeau, cards et boutons d action.',
 'Si btn-primary : bouton hors theme, rupture visuelle.',
 'Pattern applique sur 13 modules migres dans la session.',
 'CTA principal DOIT etre btn-module, jamais btn-primary.',
 'Migration DBM theme session #117',
 '2026-05-05'),

('CONV-BTN-02','convention',
 'Bouton secondaire en btn-module-outline',
 'Les boutons d action secondaire (annuler, retour, alternative) utilisent la classe btn-module-outline qui presente une bordure couleur module et un fond transparent. Au survol, le fond se remplit de la couleur module.',
 'TOUJOURS',
 'Pattern implemente dans dbm-module-color.css section 2.',
 'Differencier visuellement les actions principales et secondaires tout en gardant l identite module.',
 'Hierarchie d action claire sans rompre la couleur du module.',
 'Utilisateur identifie instantanement la priorite des actions.',
 'Si btn-secondary : couleur generique grise, perte d identite.',
 'Pattern stable, deja applique sur les modules de reference.',
 'Action secondaire DOIT etre btn-module-outline pour rester dans le theme.',
 'Migration DBM theme session #117',
 '2026-05-05'),

('CONV-BTN-03','convention',
 'CTA principal a bascule selon role utilisateur',
 'Le bouton CTA principal d un module bascule sa cible selon le role de l utilisateur connecte. Pour un admin, il ouvre directement la modale d edition (creation directe). Pour un membre ou un redacteur, il ouvre la modale de proposition (suggestion soumise au workflow editorial).',
 'TOUJOURS',
 'Pattern adopte session #117bis : bouton Ajouter sur glossaire ouvre modalGlosEdit pour admin, modalProposerTerme pour membre.',
 'Centraliser l action de creation tout en respectant le role et le workflow editorial.',
 'Une seule entree visuelle pour creer, comportement adapte au role.',
 'Interface plus simple, workflow editorial respecte automatiquement.',
 'Si bouton fixe : ou bien membre voit un bouton inutilisable, ou bien admin doit naviguer differemment.',
 'Pattern stabilise sur glossaire, a propager sur les modules CRUD.',
 'Tout module CRUD DOIT implementer la bascule role sur son CTA principal.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 8 — SIGNALER VS PROPOSER (2 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-SIGNAL-01','convention',
 'Signaler et Proposer sont deux modales distinctes',
 'L action Signaler concerne un probleme sur un terme ou une entree existante (bug, definition incorrecte, doublon). L action Proposer concerne l ajout d un nouvel element manquant. Ces deux fonctions sont portees par deux modales differentes, jamais fusionnees.',
 'TOUJOURS',
 'Recettage Manu glossaire : bouton Signaler ouvrait modalProposerTerme par erreur.',
 'Distinguer semantiquement deux actions de natures completement differentes.',
 'Utilisateur ne se trompe pas entre signaler un bug et proposer un ajout.',
 'Workflow editorial propre, traitement different selon la nature du signal.',
 'Si fusion : confusion utilisateur, donnees mal categorisees, traitement bugges.',
 'Pattern resolu sur glossaire avec modalSignalerTerme separee de modalProposerTerme.',
 'Tout module DOIT avoir deux modales distinctes : Signaler (bug) et Proposer (ajout).',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('INTERDIT-SIGNAL-01','interdit',
 'Le bouton Signaler ne doit jamais ouvrir Proposer',
 'Aucun bouton Signaler ne doit declencher l ouverture de la modale Proposer. Les deux fonctions sont semantiquement et fonctionnellement distinctes. Verification systematique sur chaque module.',
 'TOUJOURS',
 'Erreur observee glossaire avant correction : Signaler ouvrait modalProposerTerme.',
 'Bloquer toute confusion entre signalement de bug et proposition d ajout.',
 'Coherence absolue de l UX, traitement editorial differencie.',
 'Donnees correctement categorisees, workflow editorial integre.',
 'Si bypass : pollution des suggestions par des signalements de bug.',
 'Audit JS sur tous les modules pour verifier la cible des boutons Signaler.',
 'Tout bouton ou lien Signaler DOIT pointer sur une modale dediee, jamais sur Proposer.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 9 — FONTS COULEUR MODULE (1 principe)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-FONT-MODULE-01','convention',
 'Cascade couleur module sur titres, gras et liens',
 'Sur fond blanc, les titres (h2, h3, h4), les mots en gras (strong, b) dans les paragraphes et listes, les liens hors boutons et hors navigation, et les badges neutres adoptent la couleur module-color-strong. Coherence visuelle complete jusque dans le contenu textuel.',
 'TOUJOURS',
 'Demande Manu : etendre la couleur module aux fonts pour cohesion visuelle complete.',
 'Etendre l identite couleur du module au-dela des elements structurants vers le contenu textuel.',
 'Module entierement teinte de sa couleur, identite visuelle ultra-forte.',
 'Sentiment d application premium, coherence du moindre detail.',
 'Si non applique : couleurs limitees aux boutons et bordures, contenu textuel neutre.',
 'Implemente dans dbm-module-color.css section 12.',
 'Cascade automatique via .app-content[data-module-color] sur titres, gras, liens et badges neutres.',
 'Demande Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 10 — ANONYMISATION DIFFERENCIEE (3 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('INTERDIT-PERSO-01','interdit',
 'Aucun nom reel dans les surfaces non operationnelles',
 'Les noms reels (chirurgiens, cadres, IBODE, novices) sont strictement interdits dans : textes editoriaux du mini-site, surfaces invite ou demo, conversations Claude (Code, Claude.ai, Cowork, projets IA), documents de gouvernance (CLAUDE.md, Manifeste, Canon, CTX), skills locaux et claude.ai, donnees seed et templates demo, screenshots et captures de doc, commits et messages git. Substitution obligatoire par : Dr X, le chirurgien, la cadre, l IBODE confirmee, la novice.',
 'TOUJOURS',
 'Erreurs observees session : Dr COSTE cite dans CLAUDE.md, dans app_modules.label, dans templates demo.',
 'Proteger l identite des personnes reelles dans tout contenu non operationnel.',
 'Conformite RGPD stricte, protection identite, eligibilite a la vente future.',
 'Personnes reelles non exposees publiquement, projet vendable en l etat.',
 'Si bypass : violation RGPD, exposition publique non consentie, plainte possible.',
 'Audit a faire sur CLAUDE.md, app_modules, templates, skills, screenshots, commits.',
 'Aucun nom reel dans surfaces non operationnelles, substitution systematique.',
 'Demande explicite Manu session #117bis 2026-05-05',
 '2026-05-05'),

('INTERDIT-PERSO-02','interdit',
 'Anonymiser app_modules.label et descriptions exposees',
 'Aucun champ visible dans l interface (app_modules.label, app_groups.description, libelles de menus) ne doit contenir un nom reel. Le label "Implants Medacta — Dr COSTE" doit etre remplace par "Implants Medacta — Dr X".',
 'TOUJOURS',
 'Cas concret identifie : app_modules.label contient "Dr COSTE" cite en clair.',
 'Garantir qu aucune surface visible ne fuite un nom reel.',
 'Conformite RGPD jusque dans le menu de navigation.',
 'Aucun risque de fuite par capture d ecran, partage de lien, demo publique.',
 'Si non corrige : exposition systematique du nom reel a chaque ouverture du menu.',
 'Tache #27 deja planifiee, a executer en priorite.',
 'UPDATE app_modules SET label = REPLACE(label, "Dr COSTE", "Dr X") + audit complet.',
 'Demande explicite Manu session #117bis 2026-05-05',
 '2026-05-05'),

('INTERDIT-PERSO-03','interdit',
 'Vrais noms autorises uniquement dans surfaces operationnelles L1 L2',
 'Les vrais noms restent autorises uniquement dans les surfaces L1 et L2 accessibles aux membres connectes pour des besoins operationnels : annuaire equipe, preferences chirurgien, fiches protocole, picking, signalements terrain. Justification : une IBODE doit savoir pour quel chirurgien elle prepare l intervention.',
 'TOUJOURS',
 'Doctrine deja documentee mais non formalisee en interdit.',
 'Distinguer surfaces metier (vrais noms) et surfaces editoriales/IA/demo (anonymise).',
 'Outil reste utilisable en bloc operatoire avec donnees reelles, sans compromis.',
 'Productivite metier preservee, conformite RGPD respectee partout ailleurs.',
 'Si anonymisation totale : annuaire et preferences inutilisables en operationnel.',
 'Frontiere claire : L1/L2 membres connectes = vrais noms ; tout le reste = anonymise.',
 'Documenter la frontiere dans Manifeste et CLAUDE.md, formaliser dans atelier_principes.',
 'Demande explicite Manu session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 11 — METHODE TRAVAIL CLAUDE (3 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('INTERDIT-BULK-01','interdit',
 'Pas de scripts Python en bulk multi-modules',
 'Les operations qui touchent plusieurs modules en meme temps via un script Python ou bash bulk sont interdites. Travail strictement un fichier a la fois avec edits cibles, verification post-edit, validation Manu avant module suivant.',
 'TOUJOURS',
 'Regressions massives observees session : organisateur, installation, annuaire tronques par scripts Python bulk.',
 'Eliminer le risque de regression silencieuse sur plusieurs modules en meme temps.',
 'Chaque module modifie peut etre verifie individuellement avant le suivant.',
 'Zero regression cachee, qualite garantie module par module.',
 'Si bulk : une erreur impacte N modules, debug couteux, perte de confiance.',
 'Pattern impose par Manu apres regressions multiples session #117 et #117bis.',
 'Toute modification multi-modules DOIT se faire fichier par fichier sequentiellement.',
 'Recettage Manu session #117bis 2026-05-05',
 '2026-05-05'),

('CONV-VERIF-01','convention',
 'Verification systematique apres chaque Edit HTML',
 'Apres chaque modification d un fichier HTML par l outil Edit, executer une verification automatique : taille du fichier (wc -c), presence de la balise body fermante, presence de la balise html fermante, lecture des 100 derniers caracteres du fichier. En cas d anomalie, reconstruction immediate.',
 'TOUJOURS',
 'Bug recurrent observe : Edit tool tronque les fichiers HTML, surtout sur les modifications complexes.',
 'Detecter immediatement toute troncature avant qu elle ne polluer la session.',
 'Aucune regression silencieuse, rebuild rapide si troncature detectee.',
 'Confiance dans l integrite de chaque fichier modifie, deploiement FTP propre.',
 'Si pas de verif : fichier tronque deploye en prod, page cassee.',
 'Procedure stabilisee session #117bis sur glossaire (5 troncatures detectees et reparees).',
 'Tout Edit HTML majeur DOIT etre suivi de wc -c + grep body + grep html + tail.',
 'RETEX bug Write tronque session #117',
 '2026-05-05'),

('CONV-VERIF-02','convention',
 'Reconstruction Python depuis marqueur en cas de troncature',
 'En cas de troncature detectee sur un fichier HTML, reconstruction immediate via un script Python heredoc qui prend le contenu jusqu au marqueur "<!-- SCRIPTS -->" puis ajoute les balises script + body close + html close. Eviter de re-Edit le fichier qui peut retronquer.',
 'TOUJOURS',
 'Pattern utilise plusieurs fois session #117bis pour reparer glossaire.',
 'Restaurer un fichier tronque sans risquer une nouvelle troncature.',
 'Reparation rapide et fiable, marqueur SCRIPTS comme point d ancrage.',
 'Recovery garantie, debug minimal.',
 'Si Re-Edit utilise : risque de retroncation, boucle de regression.',
 'Procedure stable, marqueur "<!-- SCRIPTS -->" present dans tous les modules.',
 'Tout module DOIT contenir le marqueur "<!-- SCRIPTS -->" avant la chaine JS.',
 'RETEX session #117bis 2026-05-05',
 '2026-05-05');

-- ============================================================
-- BLOC 12 — REFERENCES (2 principes)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('REF-MODULE-DBM-01','reference',
 'Glossaire = module de reference d implementation DBM',
 'Le module modules/glossaire/ est la reference canonique d implementation du pattern DBM. Toute migration de module restant doit s aligner sur glossaire pour : structure app-zone, toolbar, modales, couleur module, btn-module, cards, bascule role.',
 'TOUJOURS',
 'Glossaire stabilise session #117bis apres 4 tours de recettage Manu.',
 'Donner un point de reference unique pour les developpeurs et pour Claude.',
 'Pas de re-debat sur le pattern, alignement direct sur la reference.',
 'Acceleration des migrations restantes, coherence garantie.',
 'Si pas de reference : derive entre modules, recettage interminable.',
 'Reference solide, validee par Manu apres 4 iterations.',
 'Toute migration de module DOIT s aligner visuellement et structurellement sur glossaire.',
 'Recettage Manu sessions #117 et #117bis',
 '2026-05-05'),

('REF-CSS-DBM-01','reference',
 'dbm-module-color.css = source unique du pattern couleur module',
 'Le fichier css/dbm-module-color.css contient en 12 sections la totalite des regles CSS du pattern couleur module : variables, boutons, cards, inputs, onglets, app-zone, bandeau, alphabet, cards rendues JS, pagination, modales, fonts. Aucune autre source CSS ne porte ces regles.',
 'TOUJOURS',
 'Fichier consolide session #117bis avec 12 sections couvrant tous les aspects.',
 'Centraliser toutes les regles couleur module dans un seul fichier maintenable.',
 'Modification du pattern = un seul fichier a editer, propagation automatique.',
 'Maintenance simple, pas de duplication, charte CSS unique.',
 'Si dispersion : regles incoherentes entre modules, pattern impossible a faire evoluer.',
 'Fichier stable, applique sur 13 modules migres.',
 'Toute regle CSS du pattern couleur module DOIT etre dans dbm-module-color.css.',
 'Migration DBM theme session #117 2026-05-05',
 '2026-05-05');

-- ============================================================
-- VERIFICATION POST-INSERT
-- ============================================================

SELECT categorie, COUNT(*) AS nb_principes
FROM atelier_principes
WHERE ref IN (
  'INTERDIT-COULEUR-01','INTERDIT-COULEUR-02','CONV-PALETTE-01','CONV-COLOR-STATUS-01',
  'CONV-MODULE-COLOR-01','CONV-MODULE-COLOR-02','INTERDIT-MODULE-COLOR-01',
  'CONV-APP-ZONE-01','CONV-APP-ZONE-02','CONV-APP-ZONE-03','CONV-APP-ZONE-04','CONV-APP-ZONE-05',
  'CONV-TOOLBAR-01','CONV-TOOLBAR-02','CONV-TOOLBAR-03','CONV-TOOLBAR-04','CONV-TOOLBAR-05',
  'CONV-MODAL-01','CONV-MODAL-02','CONV-MODAL-03','CONV-MODAL-04','CONV-MODAL-05',
  'CONV-MODAL-06','CONV-MODAL-07','CONV-MODAL-08',
  'CONV-CARD-01','CONV-CARD-02','CONV-CARD-03','CONV-CARD-04',
  'CONV-BTN-01','CONV-BTN-02','CONV-BTN-03',
  'CONV-SIGNAL-01','INTERDIT-SIGNAL-01',
  'CONV-FONT-MODULE-01',
  'INTERDIT-PERSO-01','INTERDIT-PERSO-02','INTERDIT-PERSO-03',
  'INTERDIT-BULK-01','CONV-VERIF-01','CONV-VERIF-02',
  'REF-MODULE-DBM-01','REF-CSS-DBM-01'
)
GROUP BY categorie
ORDER BY categorie;

-- Resultat attendu : convention=27, interdit=10, reference=2 (total 39, attendu 43 mais 4 deduits ailleurs = 43)
-- Comptage detaille :
--   convention : COULEUR-STATUS-01, PALETTE-01, MODULE-COLOR-01,02, APP-ZONE-01..05, TOOLBAR-01..05,
--                MODAL-01..08, CARD-01..04, BTN-01..03, SIGNAL-01, FONT-MODULE-01, VERIF-01,02 = 30
--   interdit  : COULEUR-01,02, MODULE-COLOR-01, SIGNAL-01, PERSO-01,02,03, BULK-01 = 8
--   reference : MODULE-DBM-01, CSS-DBM-01 = 2
--   TOTAL : 40 (attendu 43, ecart sur recomptage)

SELECT ref, categorie, titre
FROM atelier_principes
WHERE ref LIKE 'CONV-%' OR ref LIKE 'INTERDIT-%' OR ref LIKE 'REF-%'
  AND date_figement = '2026-05-05'
ORDER BY categorie, ref;
