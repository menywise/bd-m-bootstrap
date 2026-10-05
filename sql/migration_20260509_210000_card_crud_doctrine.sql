-- ============================================================================
-- Migration : Doctrine Card-CRUD universelle DBM
-- Date      : 2026-05-09 (Session #128)
-- Ref       : D-2026-05-09-CARD-CRUD-DOCTRINE
-- Source    : Constat Manu session #128 :
--             "transmissions / cours / glossaire = 3 patterns divergents pour
--              une primitive UI identique. Le terrain hallucine sa mise en page.
--              Doctrine inversee : la demo fait le module, jamais l inverse."
-- Cascade   : Createur > Admin > Redacteur > Membre > Invite > Suspendu
-- ============================================================================
-- Pre-requis: 4 principes CONV-CARD-01..04 deja actifs (styling couleur module)
--             Cette migration ajoute CONV-CARD-05..14 pour ANATOMIE et VERSIONS
--             + INTERDIT-CARD-HALLUCINATION-01
--             + ARB-CARD-CRUD-01 (arbre decisionnel)
-- ============================================================================
BEGIN;

-- ============================================================
-- 1. DECISION MERE
-- ============================================================
INSERT INTO atelier_decisions (
  ref, date, titre, description, module_cible, statut, type, session_num
) VALUES (
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  '2026-05-09',
  'Doctrine card-CRUD universelle DBM : 4 versions canoniques + anatomie maximale + matrice role x action',
  'Audit cross-modules session #128 revele 3 patterns card divergents (transmissions pleine largeur + kebab, cours grille + 3 boutons inline, glossaire grille dense + CTA secondaire). Le terrain hallucine sans doctrine. Doctrine inversee actee : la demo fait le module, jamais l inverse. 4 versions canoniques B/C/D/E (A pleine largeur abandonnee pour coherence cross-modules), anatomie maximale avec slots toujours presents [hidden] reveles selon contexte+role, matrice role x action basee sur cascade Createur > Admin > Redacteur > Membre > Invite > Suspendu. Migration progressive 28 modules vague apres vague.',
  'TOUS',
  'active',
  'doctrine_ui',
  128
);

-- ============================================================
-- 2. PRINCIPE CONV-CARD-05 : Anatomie maximale 11 slots
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-05',
  'Anatomie maximale 11 slots universels - template demo card',
  'Tout module DBM affichant une collection d items DOIT utiliser le composant .dbm-card-crud avec ses 11 slots universels presents dans le DOM (meme masques) : 1) accent-left, 2) avatar, 3) titre, 4) badges, 5) meta auteur+timestamp, 6) kebab, 7) media thumbnail, 8) body description/KPI, 9) tags overflow, 10) cta-primary/secondary, 11) chevron clickable. Slots non utilises = attribut [hidden] ou .d-none. JAMAIS supprimer un slot du DOM (sinon impossible de le reveler conditionnellement sans casse).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Garantir que toute carte DBM contient les memes slots structurels.',
  'Reveler/masquer un slot = changer un attribut [hidden], pas reconstruire le DOM.',
  'Composant universel maintenable, evolution sans regression, tests visuels stables.',
  'Si slots supprimes du DOM : impossible de reveler conditionnellement sans rebuild = casse garantie.',
  'Tout JS qui rend une card DOIT generer le template complet 11 slots et masquer ceux non utilises.',
  '2026-05-09'
);

-- ============================================================
-- 3. PRINCIPE CONV-CARD-06 : Version B (grille fiche)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-06',
  'Version B : grille fiche col-md-6 col-xl-4 + kebab + chevron',
  'Version par defaut pour items "fiche structuree" (titre + meta + description + actions). Layout : grille responsive col-12 col-md-6 col-xl-4. Card cliquable globale role=button data-action=modal|page. Kebab sup-droit revele si >=2 actions disponibles selon role. Chevron footer "voir le detail >". Couvre : transmissions, cours libres, cours topo, anatomie, installation, fiches, boite-a-idees. Excerpt body 2-3 lignes max (line-clamp-2).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Standardiser layout fiche en grille responsive avec scan visuel rapide.',
  'Densite raisonnable (3 cards/ligne XL), CRUD via kebab unique, lecture detail via clic globale.',
  'Sabine 7h45 scanne sa liste en moins de 3 secondes ; CRUD admin sans pollution visuelle.',
  'Si grille pleine largeur : scroll lourd. Si CTA inline multiples : pollution kebab+CTA cumules.',
  'Tout module avec collection moyenne (10-200 items) DOIT utiliser version B sauf justification documentee.',
  '2026-05-09'
);

-- ============================================================
-- 4. PRINCIPE CONV-CARD-07 : Version C (grille reference dense)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-07',
  'Version C : grille dense col-md-4 col-xl-3 + 1 CTA secondaire',
  'Version pour items "reference courte" (terme/code + definition courte) en grande collection (>200). Layout : grille tres dense col-12 col-md-4 col-xl-3. Pas de kebab (pas de CRUD individuel). Au max 1 CTA secondaire (Signaler, Copier, Partager). Couvre : glossaire (1000+ termes), annuaire (contacts), referentiel CCAM. Pagination obligatoire si >50 items. Highlight search query supporte via helper bdbHighlight().',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Permettre la consultation rapide de grands referentiels metier en grille dense.',
  '4 cards/ligne XL, scanning rapide, pas de CRUD donc pas de kebab.',
  'Julie trouve un terme en 5 secondes ; pas d encombrement visuel.',
  'Si grille trop large : scrolling fastidieux. Si kebab present : confusion utilisateur (rien a editer).',
  'Tout referentiel >200 items DOIT utiliser version C avec pagination + recherche.',
  '2026-05-09'
);

-- ============================================================
-- 5. PRINCIPE CONV-CARD-08 : Version D (KPI dashboard)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-08',
  'Version D : grille KPI col-md-3 lecture seule sans kebab',
  'Version pour cards "indicateur tableau de bord" (KPI lecture seule). Layout : grille col-6 col-md-3 (4 KPI/ligne MD). PAS de kebab, PAS de CTA. Slots utilises : titre court (label) + body=valeur grande + meta optionnelle (delta/trend). Couvre : supervision, carnet-bord stats, dashboards admin. Click optionnel pour drill-down (data-action=page).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Standardiser KPI dashboards avec grille fixe et lecture rapide.',
  '4 KPI/ligne MD, valeur grande, label discret. Pas de CRUD.',
  'Olivia voit ses 8 KPI cles en un coup d oeil.',
  'Si kebab : utilisateur cherche action inexistante. Si grille variable : layout inconstant.',
  'Tout dashboard KPI DOIT utiliser version D avec grille col-md-3 fixe.',
  '2026-05-09'
);

-- ============================================================
-- 6. PRINCIPE CONV-CARD-09 : Version E (form unique pleine largeur)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-09',
  'Version E : pleine largeur form unique + bouton Enregistrer header',
  'Version pour pages "formulaire unique" (preferences, profile, parametres). PAS une collection. Card pleine largeur unique, header avec bouton Enregistrer aligne droite. Body = form fields scrollable. PAS de kebab. PAS de grille. Couvre : preferences, profile, parametres-instance.',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Standardiser pages de formulaire unique pleine largeur.',
  'Bouton Enregistrer toujours visible header, fields ergonomiques pleine largeur.',
  'Sabine modifie ses preferences en un seul ecran sans scroll horizontal.',
  'Si grille : champs trop etroits. Si Enregistrer en footer : utilisateur scroll inutile.',
  'Toute page de formulaire UNIQUE DOIT utiliser version E.',
  '2026-05-09'
);

-- ============================================================
-- 7. PRINCIPE CONV-CARD-10 : Matrice role x action (cascade)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-10',
  'Matrice role x action sur card kebab (cascade Createur>Admin>Redacteur>Membre>Invite>Suspendu)',
  'Le contenu du kebab (dropdown actions) est calcule dynamiquement selon la cascade window.bdbUser : isCreator > isAdmin > isRedacteur > isMember > isDemo. Etat sanction isSuspended override toutes capacites de mutation. Matrice canonique : view (tous), create (redacteur+), edit own (membre+ owner), edit all (admin+), delete own (redacteur+ owner), delete all (admin+), archive (admin+ ou owner), publish (admin+), validate proposition (admin+), vote/unvote (membre+), flag (membre+), comment (membre+), share (tous), export (membre+), print (tous), duplicate (admin+ ou owner). Owner = item.user_id === bdbUser.id (etat orthogonal aux roles).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Garantir que le kebab affiche UNIQUEMENT les actions autorisees pour le role + ownership.',
  'Aucune action interdite affichee = pas de frustration utilisateur ni de tentative bloquee tardivement.',
  'Julie ne voit pas "Supprimer" sur la card de Sabine. Sabine voit "Modifier" sur ses propres cards.',
  'Si kebab affiche actions interdites : utilisateur clique, RLS rejette, perception bug. Si kebab masque actions autorisees : utilisateur perd capacite.',
  'Tout module DOIT utiliser le helper dbmCardActions(item, user) pour generer le kebab.',
  '2026-05-09'
);

-- ============================================================
-- 8. PRINCIPE CONV-CARD-11 : Modales associees 4 patterns
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-11',
  'Modales associees aux cards : 4 patterns canoniques (create-edit, view-detail, confirm, lightbox)',
  'Toute action depuis card declenche au max 4 types de modales : (a) dbm-modal-create-edit = formulaire create/edit, modal-xl scrollable fullscreen-md-down, header-module, body form, footer btn-module-outline (Annuler) + btn-module (Enregistrer). (b) dbm-modal-view-detail = vue detail item, modal-lg scrollable, header-module, body rendu lecture, footer optionnel. (c) dbm-modal-confirm = confirmation destructrice (delete/archive), modal-lg, header-module, body message, footer btn-module-outline + btn-danger. (d) dbm-modal-lightbox = image plein ecran, modal-xl, bg-dark, btn-close-white. Toutes modales = rounded-4 border-0 shadow-lg + modal-dialog-centered + modal-fullscreen-md-down + modal-header-module.',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Standardiser les 4 patterns modales utilises depuis une card.',
  'Utilisateur retrouve toujours le meme comportement modale dans tous les modules.',
  'Pas de re-apprentissage ; design uniforme cross-modules.',
  'Si modales libres : chaque module reinvente le pattern, regression visuelle.',
  'Tout module avec card-CRUD DOIT utiliser ces 4 patterns modale.',
  '2026-05-09'
);

-- ============================================================
-- 9. PRINCIPE CONV-CARD-12 : Verbes CRUD canoniques (18)
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-12',
  'Verbes CRUD canoniques DBM (18 actions) : nommage et libelles unifies',
  'Inventaire ferme des verbes CRUD utilisables sur une card DBM : view, create, edit, delete, archive, restore, duplicate, publish, unpublish, validate, reject, vote, unvote, flag, comment, share, export, print. Libelles FR figes : Consulter, Nouveau, Modifier, Supprimer, Archiver, Restaurer, Dupliquer, Publier, Depublier, Valider, Rejeter, Voter, Retirer mon vote, Signaler, Commenter, Partager, Exporter, Imprimer. Icones figees (bi-eye, bi-plus-lg, bi-pencil, bi-trash, bi-archive, bi-arrow-counterclockwise, bi-files, bi-cloud-upload, bi-cloud-download, bi-check-lg, bi-x-lg, bi-hand-thumbs-up, bi-hand-thumbs-up-fill, bi-flag, bi-chat-left-text, bi-share, bi-download, bi-printer).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Garantir nommage unifie des actions CRUD cross-modules.',
  'Utilisateur reconnait les memes verbes/icones partout dans l app.',
  'Apprentissage zero ; coherence cognitive.',
  'Si nommage libre : "Modifier" vs "Editer" vs "Mettre a jour" = confusion.',
  'Tout JS card-CRUD DOIT utiliser les 18 verbes canoniques avec libelles + icones figes.',
  '2026-05-09'
);

-- ============================================================
-- 10. INTERDIT-CARD-HALLUCINATION-01
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'interdit',
  'INTERDIT-CARD-HALLUCINATION-01',
  'Hallucination card terrain interdite (forks layout, couleurs hardcoded, kebab+CTA cumules, touch <44px)',
  'Aucun module ne peut inventer son propre pattern card. Sont INTERDITS : (1) fork layout (grille col-X non canonique = autre que B/C/D), (2) couleurs hardcoded niveau (ex #198754, #fd7e14 dans JS) au lieu de classes module, (3) cumul kebab + CTA inline multiples sur la meme card (choisir l un OU l autre selon doctrine), (4) touch target <44px sur mobile (kebab <44x44 = inaccessible), (5) suppression de slot du DOM (briser CONV-CARD-05), (6) renommage classe .[module]-card (briser CONV-CARD-03), (7) modale custom hors 4 patterns CONV-CARD-11.',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Bloquer toute reinvention card terrain qui casse la coherence cross-modules.',
  'Audit recettage cross-modules detecte automatiquement les violations.',
  'Demo fait le module, jamais l inverse. Zero re-apprentissage utilisateur.',
  'Si hallucination toleree : retour a l etat session #128 (3 patterns divergents).',
  'Recettage post-livraison DOIT grep ces 7 violations sur tout module modifie.',
  '2026-05-09'
);

-- ============================================================
-- 11. CONV-CARD-13 : Cascade roles 6 niveaux + sanction
-- ============================================================
INSERT INTO atelier_principes (
  categorie, ref, titre, description, statut, marqueur, source,
  fonction, avantage, benefice, risque, recommandation, date_figement
) VALUES (
  'convention',
  'CONV-CARD-13',
  'Cascade roles DBM 6 niveaux + sanction Suspendu (codification window.bdbUser)',
  'Hierarchie cascade DBM (Manu S128) : Createur > Admin > Redacteur > Membre > Invite > Suspendu. Codification window.bdbUser (calcul bdb-shell.js exclusivement) : isCreator (is_creator===true), isAdmin (role==="admin" OR is_creator), isRedacteur (is_redacteur===true OR isAdmin OR isCreator), isMember (role!=="invite"), isDemo (toujours true), isSuspended (is_suspended===true override sanction). Enum DB app_role = admin|redacteur|membre|invite (4 valeurs). Flags DB profiles = is_creator, is_redacteur, is_suspended, is_dev. Future categorie "Banni" = sanction renforcee, a creer sur demande (placeholder isBanni=false jusqu a creation).',
  'active',
  'TOUJOURS',
  'D-2026-05-09-CARD-CRUD-DOCTRINE',
  'Documenter et figer la cascade roles canonique pour toute matrice droits.',
  'Tout module utilise window.bdbUser.isXxx, jamais de requete profiles ad hoc.',
  'INTERDIT-B2 respecte ; signaux visuels coherents ; matrice droits unifiee.',
  'Si cascade non figee : modules halluinent leur calcul role, RLS et UI desynchronises.',
  'Tout calcul role DOIT passer par window.bdbUser (calcul bdb-shell.js). Mise a jour skill acces-niveaux-bdb V1.1.0 -> V1.2.0 ajoute isRedacteur + isSuspended.',
  '2026-05-09'
);

-- ============================================================
-- 12. ARBITRAGE arbre decisionnel choix version
-- ============================================================
INSERT INTO atelier_arbitrages (
  ref, sujet, decision, decision_ref, statut, date_creation
) VALUES (
  'ARB-CARD-CRUD-01',
  'Arbre decisionnel choix de version card-CRUD : quelle version pour mon item ?',
  'Question 1: Item = formulaire UNIQUE editable (preferences, profile, parametres) ? -> Version E (CONV-CARD-09). | Question 2: Item = indicateur KPI lecture seule (dashboard) ? -> Version D (CONV-CARD-08). | Question 3: Item = entree de reference courte en grande collection (>200) ? -> Version C (CONV-CARD-07). | Question 4 (par defaut) : Item = fiche structuree en collection moyenne ? -> Version B (CONV-CARD-06). | Note : la version A "feed pleine largeur" a ete ABANDONNEE pour coherence cross-modules ; transmissions migre en B avec excerpt + clickable.',
  'CONV-CARD-06',
  'resolu',
  '2026-05-09'
);

COMMIT;

-- ============================================================
-- ROLLBACK script (en cas de regression detectee)
-- ============================================================
-- BEGIN;
-- DELETE FROM atelier_arbitrages WHERE ref='ARB-CARD-CRUD-01';
-- DELETE FROM atelier_principes WHERE ref IN ('CONV-CARD-05','CONV-CARD-06','CONV-CARD-07','CONV-CARD-08','CONV-CARD-09','CONV-CARD-10','CONV-CARD-11','CONV-CARD-12','CONV-CARD-13','INTERDIT-CARD-HALLUCINATION-01');
-- DELETE FROM atelier_decisions WHERE ref='D-2026-05-09-CARD-CRUD-DOCTRINE';
-- COMMIT;
