-- ============================================================
-- S126 - Charte Premium DBM v1.0.0 — adoption ciblee charte v3 Claude Design
-- Date    : 2026-05-07
-- Session : 115
-- Objet   : Acter en doctrine cloud les 4 principes nouveaux issus de
--           la lecture de la Charte d'app DBM v3 (Claude Design, session #114).
--           Doctrine MD complete : 00_GOUVERNANCE/12_CHARTE_PREMIUM_DBM_V1_0_0.md
--           Composants techniques livres : css/dbm-premium-components.css
--           + js/bdb-zone-state.js
-- Source  : Decision Manu 2026-05-07 (session #115) — adoption ciblee P1+P2
--           sans rupture avec la doctrine V5 (5-groupes, bdb-* fichiers).
-- Hors    : Renommage bdb-*.js -> dbm-*.js, migration theme-base CDN -> local,
--   scope : palette HSL 28 modules. FAB(3R) requis en session dediee.
-- ============================================================
-- ROLLBACK :
--   DELETE FROM atelier_principes WHERE ref IN (
--     'INTERDIT-HOVER-BRIGHTNESS-A15',
--     'INTERDIT-CTA-PRIMARY-MODULE-A11',
--     'CONV-SURFACE-MARKER-HTML',
--     'GARDE-FOU-RFC2119-DOCTRINE'
--   );
--   DELETE FROM atelier_decisions WHERE ref = 'D-2026-05-07-S115-CHARTE-PREMIUM';
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. DECISION D-2026-05-07-S115-CHARTE-PREMIUM
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_decisions (
  ref, titre, type, description, statut, session_num, created_at
) VALUES (
  'D-2026-05-07-S115-CHARTE-PREMIUM',
  'Adoption ciblee Charte d''app DBM v3 (Claude Design) — gains immediats P1+P2',
  'doctrine',
  'Lecture exhaustive de la Charte d''app DBM v3 produite par Claude Design '
  '(session #114, fichier _claude_design/Charte graphique v6.zip). 12 patterns '
  'premium retenus pour V5 : surface markers HTML, RFC 2119, anti-patterns A1-A15, '
  'bandeau Page Title gradient 135 deg, .btn-universe, .modal-header-module, '
  '.offcanvas-header-module, .module-subnav, etats async data-state + bdbZoneState(), '
  'apostrophe typographique, dates FR, role/aria-busy a11y. '
  'Livraison : 12_CHARTE_PREMIUM_DBM_V1_0_0.md + dbm-premium-components.css + '
  'bdb-zone-state.js. Aucune rupture : addition only, fichiers proteges intacts. '
  'Hors scope (FAB(3R) requis) : renommage bdb-* -> dbm-*, theme-base CDN -> local, '
  'palette HSL 28 modules vs 5-groupes V5 (D-2026-05-05-S117 maintenu).',
  'active',
  115,
  now()
);


-- ─────────────────────────────────────────────────────────────
-- 2. PRINCIPE — INTERDIT-HOVER-BRIGHTNESS-A15
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'interdit',
  'INTERDIT-HOVER-BRIGHTNESS-A15',
  'Interdit filter:brightness() sur boutons colores — bascule explicite vers strong obligatoire',
  'Tout bouton teinte module (.btn-universe, .btn-module, CTA) DOIT basculer son etat '
  ':hover/:focus/:active vers --module-color-strong avec texte blanc, pas via filter:brightness(). '
  'Un filter brightness assombrit fond + texte + bordure ensemble sans changer leurs valeurs CSS '
  'reelles. Resultat : sur pastel clair (luminance ~80%), brightness(.9) donne luminance ~72% — '
  'insuffisant pour un contraste perceptible. Le bouton parait delave et le contraste WCAG perdu. '
  'Source : Charte v3 Claude Design §8 anti-pattern A15 + bug detecte dans dbm-module-color.css '
  'V5 ligne 59 (.btn-module:hover { filter: brightness(.95) }).',
  NULL,
  'D-2026-05-07-S115-CHARTE-PREMIUM',
  'TOUJOURS',
  -- realite (R1)
  'V5 actuelle : .btn-module dans css/dbm-module-color.css utilise filter:brightness(.95) au hover '
  '(ligne 59). Sur les 5 couleurs groupes (bloc/equipe/savoir/pilotage/espace_perso), le hover est '
  'visuellement faible : pas de bascule pastel -> strong, juste un assombrissement uniforme. '
  'Probleme observable surtout sur pilotage (#cbd5e1 gris) ou la difference est imperceptible.',
  -- fonction (F)
  'Force tout bouton teinte module a appliquer le pattern : background pastel par defaut, '
  'background strong au hover/focus/active, transition CSS sur background-color/border-color/color '
  'en 0.15s. Le composant .btn-universe (dbm-premium-components.css) implemente ce pattern.',
  -- avantage (A)
  'vs filter:brightness() : (1) bascule deterministe sur les 5 ou 28 couleurs, '
  '(2) contraste WCAG AA verifiable par calcul (blanc sur strong), '
  '(3) signal visuel clair "etat actif" pour l utilisateur, '
  '(4) compatible mode print (pas de filtre exotique).',
  -- benefice (B)
  'L utilisateur percoit immediatement qu un bouton est en survol/focus. Le contraste reste '
  'garanti meme sur les pastels les plus clairs (pilotage gris, espace_perso peche). '
  'L UX premium adoptee par Claude Design devient la norme V5.',
  -- risque (R2)
  'Si non applique : bug visuel persistant sur pilotage et autres pastels clairs. Hover '
  'imperceptible = bouton ressenti comme "mort". Erosion de la qualite percue premium.',
  -- resultat (R3)
  'En vigueur : .btn-universe (dbm-premium-components.css) implemente le pattern. .btn-module '
  '(dbm-module-color.css) reste pour compatibilite mais devra etre corrige en session dediee '
  '(FAB(3R) leger : suppression filter:brightness, ajout bascule strong).',
  -- recommandation
  'Tout nouveau CTA module utilise .btn-universe. .btn-module existant reste tolere mais '
  'sera audite + migre en session de toilettage CSS. Anti-pattern A15 catalogue dans '
  '12_CHARTE_PREMIUM_DBM_V1_0_0.md §5.'
);


-- ─────────────────────────────────────────────────────────────
-- 3. PRINCIPE — INTERDIT-CTA-PRIMARY-MODULE-A11
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'interdit',
  'INTERDIT-CTA-PRIMARY-MODULE-A11',
  'CTA principal d un module ne doit pas etre .btn-primary — utiliser .btn-universe',
  'Le CTA principal d un module DOIT etre .btn-universe (teinte module, dbm-premium-components.css) '
  'et NE DOIT PAS etre .btn-primary (couleur generique app). .btn-primary reste autorise pour les '
  'actions transverses non liees a un module specifique (ex : login, header global, footer). '
  'Source : Charte v3 Claude Design §8 anti-pattern A11 + R-5.1 §5.',
  NULL,
  'D-2026-05-07-S115-CHARTE-PREMIUM',
  'TOUJOURS',
  -- realite (R1)
  'Audit module.html Claude Design : "Nouveau terme" en .btn-primary alors qu il est CTA principal '
  'du module glossaire. Ce pattern frequent dans V5 dilue la signature visuelle module. Quand '
  'tous les CTA sont en couleur app generique, l utilisateur perd le repere "je suis dans tel module".',
  -- fonction (F)
  'Interdit explicite .btn-primary sur le CTA principal d un module. Force le contributeur a '
  'choisir .btn-universe (qui herite automatiquement de --module-color-strong). Le bouton '
  'communique alors visuellement "je suis l action principale de ce module".',
  -- avantage (A)
  'vs .btn-primary partout : (1) signature visuelle module forte, (2) coherence avec bandeau '
  'Page Title (qui utilise les memes couleurs), (3) hierarchisation claire CTA principal vs '
  'CTA secondaires (qui restent en btn-secondary ou btn-outline-secondary).',
  -- benefice (B)
  'Identite visuelle premium : chaque module a sa "couleur d action". L utilisateur sait, '
  'dans un screenshot, dans quel module il se trouve sans lire le titre.',
  -- risque (R2)
  'Si non applique : V5 reste en mode "tout bleu primary" et perd la differenciation visuelle '
  'des 25 modules. Erosion de la qualite percue.',
  -- resultat (R3)
  'En vigueur : .btn-universe disponible dans dbm-premium-components.css. Tout nouveau module '
  'utilise ce pattern. Audit cds-compliance enrichi pour detecter .btn-primary sur CTA principal.',
  -- recommandation
  'Verifier en revue : si CTA principal = .btn-primary -> remplacer par .btn-universe. '
  'Anti-pattern A11 catalogue dans 12_CHARTE_PREMIUM_DBM_V1_0_0.md §5.'
);


-- ─────────────────────────────────────────────────────────────
-- 4. PRINCIPE — CONV-SURFACE-MARKER-HTML
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'convention',
  'CONV-SURFACE-MARKER-HTML',
  'Tout fichier index.html DEVRAIT porter un marker Surface en commentaire ligne 1',
  'Format obligatoire en premiere ligne apres <!DOCTYPE> : '
  '<!-- DBM | Surface: [NOM] | Auth: [chaine] | Shell: [oui|non] --> '
  'Ou [NOM] dans : MODULE, ITEM, PORTAIL, ADMIN, PRINT, SITE, ATELIER, REDIRECT. '
  'Permet aux outils d audit, aux skills (cds-compliance, recettage-bdb) et aux humains '
  'd identifier la nature de la page sans parser le DOM. Source : Charte v3 Claude Design §7 R-7.1.',
  NULL,
  'D-2026-05-07-S115-CHARTE-PREMIUM',
  'TOUJOURS',
  -- realite (R1)
  'V5 actuelle : aucun marquage standardise du type de surface. Pour savoir si une page est un '
  'module, un portail, une admin ou un print, il faut lire la chaine JS (presence de bdb-shell.js), '
  'le data-shell-kind, le titre, etc. Audit lent et faillible.',
  -- fonction (F)
  'Marker en commentaire ligne 1 : auto-documente la page, lisible par grep, ne polue pas le DOM '
  'rendu. Les 7 surfaces V5 + REDIRECT couvrent tous les cas (module standard, item detail, '
  'portail accueil, page admin standalone, print, mini-site, atelier createur, redirection).',
  -- avantage (A)
  'vs detection au DOM : (1) instantane (1 grep suffit), (2) fiable (pas d ambiguite), '
  '(3) auto-documentation (le contributeur comprend le type sans lire 800 lignes), '
  '(4) hookable par scripts (build-cockpit.ps1, audit-conformite).',
  -- benefice (B)
  'Inventaire instantane : combien de modules, combien d admins, combien de prints. '
  'Detection regression facile : un index sans marker = pas de validation.',
  -- risque (R2)
  'Si non adopte : continuite de l etat actuel (audit manuel module par module). Pas critique '
  'mais frein operationnel a chaque revue.',
  -- resultat (R3)
  'En vigueur : marker DEVRAIT (R-2.1 charte premium). 25 modules existants a marquer '
  'progressivement (script de migration possible : 1 ligne par fichier).',
  -- recommandation
  'Tout nouveau fichier index : marker obligatoire. Migration retroactive en session de toilettage '
  '(script awk/sed peut le poser automatiquement avec heuristique surface = bdb-shell.js -> MODULE, '
  'sinon SITE/PORTAIL selon contexte).'
);


-- ─────────────────────────────────────────────────────────────
-- 5. PRINCIPE — GARDE-FOU-RFC2119-DOCTRINE
-- ─────────────────────────────────────────────────────────────

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
) VALUES (
  'garde_fou',
  'GARDE-FOU-RFC2119-DOCTRINE',
  'Doctrine UI/UX DBM utilise les mots-cles RFC 2119 : DOIT / NE DOIT PAS / DEVRAIT / PEUT',
  'Les regles de la Charte Premium DBM (12_CHARTE_PREMIUM_DBM_V1_0_0.md) utilisent la nomenclature '
  'RFC 2119 pour exprimer la severite : DOIT (non negociable), NE DOIT PAS (interdit absolu), '
  'DEVRAIT (recommandation forte, derogation a documenter), PEUT (optionnel). '
  'Chaque regle porte un identifiant R-X.Y citable. Source : Charte v3 Claude Design §0 + RFC 2119.',
  NULL,
  'D-2026-05-07-S115-CHARTE-PREMIUM',
  'TOUJOURS',
  -- realite (R1)
  'V5 actuelle : doctrine BDB utilise INTERDIT-* / CONV-* / GARDE-FOU-* / ANTI-IA-* — taxonomie '
  'maison. Ces marqueurs sont parfaits pour la doctrine produit/architecture mais ambigus pour les '
  'regles UI/UX (un INTERDIT visuel n a pas la meme severite qu un INTERDIT-A1 credentials).',
  -- fonction (F)
  'Pour la doctrine UI/UX uniquement, adopte RFC 2119. Permet de graduer la severite : DOIT '
  '= rejet en revue, DEVRAIT = warning, PEUT = libre. Coexiste avec la taxonomie INTERDIT-* '
  'historique (qui reste pour la doctrine produit, architecture, securite).',
  -- avantage (A)
  'vs INTERDIT-* unique : (1) gradation 4 niveaux vs 2 (interdit/permis), '
  '(2) standard international cite dans des milliers de documents techniques, '
  '(3) immediat pour tout developpeur professionnel.',
  -- benefice (B)
  'Revues UI plus precises : un DEVRAIT peut etre derogue avec justification, un DOIT non. '
  'Reduit les conflits "c est important ou pas ?" en revue.',
  -- risque (R2)
  'Risque : 2 taxonomies coexistantes (RFC 2119 pour UI, INTERDIT-* pour reste). Resolution : '
  'la charte premium documente clairement le perimetre UI/UX. Hors UI, INTERDIT-* prevaut.',
  -- resultat (R3)
  'En vigueur : 12_CHARTE_PREMIUM_DBM_V1_0_0.md utilise R-X.Y avec mots-cles RFC 2119. '
  'Cohabitation paisible avec INTERDIT-* du reste de la doctrine.',
  -- recommandation
  'Tout nouveau document doctrinal UI/UX utilise RFC 2119. Tout document doctrinal '
  'produit/architecture/securite continue avec INTERDIT-*/CONV-*/GARDE-FOU-*.'
);


-- ─────────────────────────────────────────────────────────────
-- 6. VERIFICATION POST-EXECUTION
-- ─────────────────────────────────────────────────────────────

-- a) Verifier que la decision est inseree
-- SELECT ref, titre, statut FROM atelier_decisions
--  WHERE ref = 'D-2026-05-07-S115-CHARTE-PREMIUM';

-- b) Verifier les 4 principes inseres
-- SELECT ref, categorie, marqueur FROM atelier_principes
--  WHERE source = 'D-2026-05-07-S115-CHARTE-PREMIUM'
--  ORDER BY ref;

-- c) Total principes actifs (pour suivi distribution categories)
-- SELECT categorie, count(*) FROM atelier_principes
--  WHERE statut = 'active'
--  GROUP BY categorie ORDER BY categorie;


-- ─────────────────────────────────────────────────────────────
-- FIN S126
-- ─────────────────────────────────────────────────────────────
