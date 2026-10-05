-- ============================================================
-- CLOTURE Session #117 — Migration DBM modules + arbitrage isRedacteur
-- Date : 2026-05-05
-- Avancement : 11/24 modules migres HTML enveloppe DBM
-- Refs uniques verifiees : max D-2026-05-03-DOCTRINE-12 → S117-XX dispos
-- ============================================================

-- ============================================================
-- 1. DECISIONS S117
-- ============================================================

-- 1.1 Arbitrage architectural majeur : creation role isRedacteur
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES (
  'D-2026-05-05-S117-01',
  '2026-05-05',
  'Role isRedacteur capital — entre isMember et isAdmin',
  'Arbitrage delegue par Manu a Claude. Decision : creer role isRedacteur capital dans la hierarchie inclusive isDemo -> isMember -> isRedacteur -> isAdmin -> isCreator. 5 niveaux comme WordPress (Subscriber/Contributor/Author/Editor/Admin). Articulation avec parametrage_modules : role = qui (designation par Olivia/Sophie), parametrage_modules = dans quels modules (configuration par instance). Couleur visuelle = Vert (entre bleu pale isMember et bleu isAdmin). Capital car (1) Olivia voudra designer ses experts parmi les membres, sans isRedacteur on a soit tout membre soit aucun par module ; (2) refactor lourd evite si ajoute plus tard (RLS, JS, seeds, fixtures, tests) ; (3) coherent hierarchie deja arbitree D-2026-04-14-87-01 ; (4) workflow draft RÈGLE-WORKFLOW-01 deja en place ; (5) reduit goulot Olivia conforme TECH-VALIDATION. Migration cible S118 : ALTER user_roles_role_check + bdb-shell.js isRedacteur + classe .bdb-redacteur-only + indicateur vert. ~20 lignes total. AUCUN refactor des classes existantes — additif uniquement.',
  'socle',
  ARRAY['role','isRedacteur','hierarchie','wordpress','contribution','workflow','arbitrage'],
  117,
  'doctrine'
);

-- 1.2 Application stricte D-2026-04-15-89-02 sur 7 modules migres
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES (
  'D-2026-05-05-S117-02',
  '2026-05-05',
  'Suppression renvois admin.html dans 7 modules migres DBM',
  'Application stricte D-2026-04-15-89-02 (Option B hub modules/admin/ unique). Suppression dans modules/faq/, annuaire/, anatomie/, fiches/, cours/, organisateur/, installation/ : (1) bloc bdb-admin-only contenant href=admin.html ; (2) bloc faqAdminToolbarSlot contenant lien admin.html. Total 7 fichiers index.html corriges via python regex. Audit post-correction : 0 occurrence href=admin.html dans les 7 modules. div balance verifiee 27/27 a 83/83 selon module. Slots in-module xToolbarAdminSlot + btnNew (Nouvelle X) restants — a refactorer en S120 selon doctrine isRedacteur + parametrage_modules.',
  'socle',
  ARRAY['admin','migration','option-b','correction','renvois'],
  117,
  'decision'
);

-- 1.3 Migration enveloppe DBM 11 modules
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES (
  'D-2026-05-05-S117-03',
  '2026-05-05',
  'Migration enveloppe DBM — 11 modules (4 squelettes + 7 contenu reel)',
  'Migration HTML/CSS/Shell de 11 modules vers stack DBM (Bootstrap 5.3.3 + dbm-theme.css + bdb-ui-kit.css + body.sidebar-closed + data-shell-theme=dbm + structure app-layout/app-main/app-content/app-footer). Modules squelettes places en preparation : ged, pedagogie, admin, supervision (modules/admin et modules/supervision = placeholders DBM, JS metier admin-app.js et supervision-app.js a brancher session ulterieure). Modules avec contenu : faq, annuaire, anatomie, fiches, cours, organisateur, installation. Total 11/24 modules migres. recueil-situation reporte (vieille version Lovable). 13 modules restants : boite-a-idees, transmissions, planning, veille-documentaire, objectifs, profile, medacta-coste (moyens) + arsenal, disc, carnet-bord, interview, preferences (gros) + recueil-situation. Suspension migration des 13 restants tant que glossaire (modele de reference) non stabilise.',
  'socle',
  ARRAY['migration','dbm','enveloppe','11-modules','squelettes','contenu'],
  117,
  'decision'
);

-- 1.4 Cartographie L3/L2 + doublons documentes
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES (
  'D-2026-05-05-S117-04',
  '2026-05-05',
  'Cartographie L3/L2 stabilisee + 3 violations documentees',
  'Audit complet perimetres : L0+L3 (createur/atelier/, createur/conseil/, createur/bernard/, invisible post-vente, isCreator violet). L2 admin (modules/admin/, hub Option B unique avec onglets, isAdmin bleu). L2 supervision (modules/supervision/, sante app monitoring). L1 membre (modules/[X]/index.html Face A). Violations identifiees : (1) modules/admin/ ecrit atelier_* mais decision D-2026-04-07-S03-01 autorise onglet Gouvernance L3 dans admin — pas violation, exception arbitree ; (2) doublon FAQ ADMIN dans modules/admin/admin-app.js + modules/faq/admin.html — admin.html residuel candidat suppression ; (3) thesaurus migre = onglet integre + admin.html en parallele (98k) — transition incomplete. Action S120 : audit admin.html residuels + suppression apres confirmation que fonctions sont dans modules/admin/.',
  'socle',
  ARRAY['cartographie','L3','L2','doublons','admin','perimetre'],
  117,
  'doctrine'
);

-- 1.5 Pattern bash heredoc obligatoire pour migration HTML
INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES (
  'D-2026-05-05-S117-05',
  '2026-05-05',
  'Bash heredoc obligatoire pour ecriture HTML > taille originale',
  'Bug observe sur migration ged : tool Write a tronque silencieusement le fichier a la taille de l ancien (2000 octets ecrits au lieu de 3286). Pas d erreur retournee, fichier coupe net en milieu de markup. Workaround valide : bash heredoc cat > file <<EOF...EOF qui ecrit la taille reelle. Adopte par defaut pour les 10 modules migres suivants (pedagogie a installation). Aucun probleme apres adoption. Voir CONV-MIGRATION-HEREDOC.',
  'socle',
  ARRAY['bug','tool-write','heredoc','migration','workaround'],
  117,
  'decision'
);

-- ============================================================
-- 2. PRINCIPES S117 (FAB(3R) obligatoires GFC-ATELIER-02)
-- ============================================================

-- 2.1 INTERDIT-RENVOI-ADMIN-MODULE — formalisation D-2026-04-15-89-02
INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
)
VALUES (
  'interdit',
  'INTERDIT-RENVOI-ADMIN-MODULE',
  'Jamais de renvoi vers admin/ depuis un module',
  'Aucun module modules/[X]/index.html ne contient de lien href="admin.html" ni href="../admin/index.html". Toute action admin se fait dans modules/admin/ (hub Option B, D-2026-04-15-89-02). Le slot bdb-admin-only avec lien admin = INTERDIT. Les boutons d action directe in-module (creation contenu) sont a remplacer par des boutons "Proposer X" filtres par parametrage_modules + role isRedacteur.',
  NULL,
  'D-2026-05-05-S117-02',
  'TOUJOURS',
  'Doctrine D-2026-04-15-89-02 du 15 avril S#89 a annule l ancien pattern admin.html par module. 7 modules migres en mai 2026 contenaient encore le lien admin.html — violation directe. Correction systematique appliquee.',
  'Garder l unicite du hub admin (Option B). Eviter dispersion UX et duplication fonctionnelle.',
  'vs admin par module (annule) : 1 seul fichier de back-office a maintenir, navigation unifiee Olivia, casse concentree.',
  'Olivia (cadre admin) trouve TOUT son back-office dans modules/admin/ avec onglets — pas de jeu de piste entre modules. UX coherente WordPress-like.',
  'Si Claude oublie cette regle et reintroduit lien admin.html dans un module migre : violation D-2026-04-15-89-02 + dette UX + travail double a corriger.',
  'Audit grep automatique post-migration : grep -c href="admin.html" modules/[X]/index.html DOIT etre 0.',
  'Post-migration, audit obligatoire : zero occurrence href="admin.html" dans tout module migre. Si occurrence trouvee, suppression immediate via python regex ou heredoc.'
);

-- 2.2 CONV-MIGRATION-HEREDOC — pattern technique migration HTML
INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
)
VALUES (
  'convention',
  'CONV-MIGRATION-HEREDOC',
  'Bash heredoc obligatoire pour ecriture HTML > taille originale',
  'Pour toute migration de fichier HTML augmentant la taille, utiliser bash heredoc (cat > file << EOF ... EOF) plutot que tool Write Claude. Le tool Write peut tronquer silencieusement a la taille de l ancien fichier (bug observe migration ged S117 : 2000 octets ecrits au lieu de 3286 attendus, pas d erreur retournee). Audit obligatoire post-ecriture : wc -c file pour verifier taille reelle.',
  NULL,
  'D-2026-05-05-S117-05',
  'TOUJOURS',
  'Bug systematique observe : tool Write renvoie "successfully" mais tronque a taille fichier ancien. Reproduit sur migration ged 2026-05-05. Cause probablement liee au mount workspace ou cache write.',
  'Garantir l ecriture complete de fichiers HTML migres en stack DBM. Preserver integrite du markup.',
  'vs tool Write seul : detection immediate par wc -c, fiabilite 100% sur 10 fichiers tests, pas de dependance au mount.',
  'Migration HTML sans regression silencieuse. Audit grep + balance div fiable.',
  'Si Claude utilise tool Write sans verifier : fichiers tronques, balance div incoherente, modules casses, regression.',
  'Pattern adopte session #117 : bash heredoc + audit wc -c post-ecriture pour 10 modules ; 100% des ecritures completes.',
  'Pour toute migration HTML > taille originale : bash heredoc imperatif. Tool Write reserve aux fichiers de meme taille ou plus court. Verification systematique wc -c apres ecriture.'
);

-- ============================================================
-- 3. NOUVELLES SESSIONS PLANIFIEES
-- ============================================================

INSERT INTO atelier_sessions (numero, titre, statut, dependances, duree_estimee, scope, objectifs)
VALUES
(118, 'Migration SQL isRedacteur — role + classe CSS + bdb-shell',
 'a_faire', ARRAY[117], '1h',
 'ALTER user_roles_role_check, bdb-shell.js window.bdbUser.isRedacteur, classe .bdb-redacteur-only, couleur verte indicateur visuel.',
 'Role isRedacteur operationnel, hierarchie 5 niveaux active, aucune regression sur classes admin existantes.'),

(119, 'Seed parametrage_modules permissions par module',
 'a_faire', ARRAY[118], '1-2h',
 'Pour chaque module contributif (glossaire, faq, fiches, cours, anatomie, installation, transmissions, ...) : seed parametrage_modules section permissions cle peut_proposer valeur role minimal.',
 'parametrage_modules complet, Olivia configure son instance via admin/, granularite role x module operationnelle.'),

(120, 'Refactor 4 modules — supprimer slot admin in-module + ajouter bouton Proposer X',
 'a_faire', ARRAY[118,119], '2-3h',
 'Modules anatomie, fiches, cours, installation : suppression xToolbarAdminSlot + btnNew (Nouvelle X) — admin = dans modules/admin/. Ajout bouton Proposer X visible selon parametrage_modules + isRedacteur, INSERT draft created_by, workflow 6 etats PHILO-05.',
 '4 modules conformes Option B + WordPress-like. Audit grep zero residu admin in-module. Pattern reutilisable pour les 13 modules restants.'),

(121, 'Migration enveloppe DBM — 13 modules restants (apres reparation glossaire)',
 'a_faire', ARRAY[120], '1 jour',
 'boite-a-idees, transmissions, planning, veille-documentaire, objectifs, profile, medacta-coste (moyens) + arsenal, disc, carnet-bord, interview, preferences (gros) + recueil-situation (Lovable). Migration enveloppe DBM + suppression admin.html residuels + onglet Proposer X selon parametrage.',
 '24/24 modules migres. Doctrine DBM uniforme. Pattern stabilise. 0 admin.html residuel dans modules/.'),

(122, 'Reparation glossaire (modele de reference SKILL dbm-conformity-audit)',
 'a_faire', NULL, '2-3h',
 'Manu signale glossaire partiellement casse (2026-05-05). Diagnostic + correction. Bloquant pour migration des 13 modules restants car modele de reference.',
 'glossaire 100% PASS audit dbm-conformity-audit Z1-Z14. Modele utilisable pour S121.');

-- ============================================================
-- 4. CLOTURE SESSION #117
-- ============================================================

SELECT atelier_cloture_session(
  117,
  'fait',
  'Migration enveloppe DBM appliquee sur 11 modules (4 squelettes ged/pedagogie/admin/supervision + 7 contenu reel faq/annuaire/anatomie/fiches/cours/organisateur/installation). Bug Write detecte et workaround heredoc adopte. Suppression renvois admin.html dans 7 modules (D-2026-04-15-89-02 respectee). Cartographie L3/L2 produite. 5 decisions inscrites + 2 principes (FAB complets). 5 nouvelles sessions S118-S122 planifiees.',
  '11 fichiers modules/[X]/index.html migres DBM (3286 a 14761 octets) ; S117_ouverture_session_migration_dbm_modules.sql ; S117_cloture_migration_dbm_modules.sql (ce fichier).',
  ARRAY['D-2026-05-05-S117-01','D-2026-05-05-S117-02','D-2026-05-05-S117-03','D-2026-05-05-S117-04','D-2026-05-05-S117-05']
);
