-- Cloture session #112 — Evolution template-module-demo.html + dbm-theme.css
-- Date : 2026-05-03

-- ============================================================
-- 1. DECISIONS
-- ============================================================

INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES
('D-2026-05-03-001',
 '2026-05-03',
 'Template demo evolue a 15 zones — catalogue composants BS 5.3.3 complet',
 'Le template-module-demo.html passe de 9 a 15 zones pour couvrir TOUS les composants BS 5.3.3 natifs utilises dans les modules. Nouvelles zones : Sortable Table (avec pagination, sans scroll), Detail Section, Drop Zone, Offcanvas, Accordion, Modal, Toast. Le sous-menu nav-pills est integre dans la Data Card (onglet 3) dans son contexte reel (tab-pane > nav-pills > sous-vues), pas en zone standalone.',
 NULL,
 ARRAY['template', 'dbm-theme', 'bs533', 'composants', 'conformite'],
 112,
 'decision');

INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES
('D-2026-05-03-002',
 '2026-05-03',
 'dbm-theme.css enrichi de 6 sections utilitaires (§21-§27, sans §21 sticky)',
 'Ajout dans dbm-theme.css : §21 Sortable Columns (app-sort-btn), §22 Detail Section (app-detail-section), §23 Scroll Container (app-scroll-300/400 — pour contextes non-tabulaires uniquement), §24 Drop Zone (app-drop-zone), §25 Offcanvas Overrides, §26 Toast Overrides. Toutes les classes utilisent var(--app-*) et var(--bs-*).',
 NULL,
 ARRAY['dbm-theme', 'css', 'composants', 'design-tokens'],
 112,
 'decision');

INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES
('D-2026-05-03-003',
 '2026-05-03',
 'INTERDIT sticky thead — tables = pagination obligatoire, jamais scroll vertical',
 'Position sticky sur thead th est interdit. Les tables ne scrollent jamais verticalement — elles paginent. Sticky thead est inutile sans scroll et non WCAG. La classe app-table-sticky a ete supprimee de dbm-theme.css avant meme d etre deployee. Le skill dbm-conformity-audit est mis a jour avec grep G10 et anti-patterns.',
 NULL,
 ARRAY['interdit', 'table', 'pagination', 'wcag', 'sticky'],
 112,
 'doctrine');

INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES
('D-2026-05-03-004',
 '2026-05-03',
 'Migration CSS variables thesaurus-ui.css — 113 var() / 26 hex semantiques conservees',
 'Remplacement de toutes les couleurs hex structurelles par des CSS variables (--bdb-*, --app-*, --bs-*) dans thesaurus-ui.css. 26 hex intentionnellement conservees pour les couleurs semantiques (badges specialite, pareto, terminal import, KPI icons, compare columns). Zone Z14 ajoutee au skill dbm-conformity-audit.',
 'thesaurus',
 ARRAY['css', 'variables', 'thesaurus', 'conformite'],
 112,
 'decision');

INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num, type)
VALUES
('D-2026-05-03-005',
 '2026-05-03',
 'Data Card restructuree avec tab-content fonctionnel + sous-menu nav-pills dans tab-pane 3',
 'La zone Data Card du template demo est restructuree : tabs BS natifs (data-bs-toggle=tab), tab-content avec 3 tab-pane. Onglet 1 = table + filtres inline + pagination. Onglet 2 = etat vide. Onglet 3 = sous-menu nav-pills (pattern CCAM OT : tab-pane > nav-pills > sous-vues). Le sous-menu est dans son contexte reel, pas en zone orpheline.',
 NULL,
 ARRAY['template', 'data-card', 'nav-pills', 'sous-menu', 'tabs'],
 112,
 'decision');

-- ============================================================
-- 2. NOUVEAU PRINCIPE — Interdit sticky thead
-- ============================================================

INSERT INTO atelier_principes (
  categorie, ref, titre, description, module_cible, source, marqueur,
  realite, fonction, avantage, benefice, risque, resultat, recommandation
)
VALUES (
  'interdit',
  'INTERDIT-TABLE-SCROLL',
  'Tables = pagination obligatoire, jamais scroll vertical ni sticky thead',
  'Les tables ne scrollent jamais verticalement (pas de max-height + overflow-y). Elles paginent. Position sticky sur thead th est interdit car inutile sans scroll et non conforme WCAG AA.',
  NULL,
  'D-2026-05-03-003',
  'TOUJOURS',
  'Le thesaurus utilisait thes-thead-sticky sur 12 occurrences. Pattern custom non WCAG, invisible pour les lecteurs d ecran lors du scroll.',
  'Impose la pagination comme seul mecanisme de gestion des listes longues dans les tables.',
  'vs scroll + sticky : pagination garde le contexte visuel complet, chaque page est navigable au clavier, WCAG AA natif.',
  'Utilisateur voit toujours un nombre maitrise de lignes. Pas de defilement infini. Navigation clavier fiable.',
  'Si scroll vertical reimplemente sur une table : perte accessibilite clavier, sticky thead qui masque du contenu, WCAG non conforme.',
  'Zero occurrence de sticky thead ou scroll vertical sur table dans les modules deployes.',
  'Paginer toute table > N lignes. Utiliser app-scroll-300/400 uniquement pour des contextes non-tabulaires (listes dans offcanvas, body d accordion).'
);

-- ============================================================
-- 3. CLOTURE
-- ============================================================

SELECT atelier_cloture_session(
  112,
  'fait',
  'Template demo evolue de 9 a 15 zones. dbm-theme.css enrichi de 6 sections (§21-§26). CSS variables migrees sur thesaurus-ui.css (113 var()). Skill dbm-conformity-audit mis a jour (Z14 CSS vars, G10 sticky interdit, anti-patterns). Data Card restructuree avec sous-menu nav-pills dans tab-pane. Interdit sticky thead documente.',
  'template-module-demo.html (15 zones), css/dbm-theme.css (+6 sections), modules/thesaurus/thesaurus-ui.css (CSS vars), .claude/skills/dbm-conformity-audit/SKILL.md (Z14+G10+anti-patterns)',
  ARRAY['D-2026-05-03-001','D-2026-05-03-002','D-2026-05-03-003','D-2026-05-03-004','D-2026-05-03-005']
);
