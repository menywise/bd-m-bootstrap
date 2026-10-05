/* ================================================================
   DORK BUILDER — veille-documentaire-data.js
   Constantes immuables : référentiels, patterns, profil par défaut
   Chargé EN PREMIER dans la chaîne BLOC E
   ================================================================ */

const DB          = window.bdb;
const MAX_HISTORY = 25;
const MAX_KEYWORDS = 3;

const SOURCE_CATEGORIES = {
  institutional: { label: 'Institutionnel', icon: 'bi-bank',        color: 'primary',   css: 'dk-src-inst'  },
  academic:      { label: 'Académique',      icon: 'bi-mortarboard', color: 'info',      css: 'dk-src-acad'  },
  professional:  { label: 'Professionnel',   icon: 'bi-briefcase',   color: 'success',   css: 'dk-src-pro'   },
  other:         { label: 'Autre',           icon: 'bi-folder',      color: 'secondary', css: 'dk-src-other' }
};

const DORK_PATTERNS = [
  // Génériques
  { label: 'PDF générique',              tpl: '{base} filetype:pdf' },
  { label: 'DOC générique',              tpl: '{base} filetype:doc OR filetype:docx' },
  { label: 'Index de fichiers',          tpl: 'intitle:"index of" {base} filetype:pdf' },
  { label: 'Index de répertoire',        tpl: 'intitle:"index of" {base}' },
  { label: 'Études / thèses',            tpl: '{base} (intitle:thèse OR intitle:mémoire OR intitle:dissertation) filetype:pdf' },
  { label: 'Guides / protocoles',        tpl: '{base} (intitle:procédure OR intitle:protocole) filetype:pdf' },
  { label: 'Citations & biblios',        tpl: '"{base}" intext:bibliographie filetype:pdf' },
  { label: 'Archives / anciens',         tpl: '{base} (intitle:archive OR inurl:archive OR inurl:old)' },
  // Glossaire / Lexique
  { label: 'Glossaire / Lexique',        tpl: '(intitle:glossaire OR intitle:lexique) "{base}" filetype:pdf' },
  { label: 'Glossaire institutionnel',   tpl: '(intitle:glossaire OR intitle:lexique) "{base}" (site:*.gouv.fr OR site:*.chu.fr)' },
  // CCAM
  { label: 'CCAM officiel',              tpl: '"{base}" (site:ameli.fr OR site:atih.sante.fr)' },
  { label: 'CCAM + protocole',           tpl: '"{base}" CCAM (intitle:protocole OR intitle:procédure) filetype:pdf' },
  // Sources institutionnelles FR
  { label: 'CHU publics FR',             tpl: '"{base}" filetype:pdf (site:*.chu.fr OR site:*.chru.fr OR site:*.ch-*.fr)' },
  { label: 'HAS direct',                 tpl: '"{base}" site:has-sante.fr filetype:pdf' },
  { label: 'Index institutionnel FR',    tpl: 'intitle:"index of" {base} (site:*.gouv.fr OR site:*.chu.fr)' },
  // Bloc / IBODE
  { label: 'IBODE / Bloc opératoire',    tpl: '"{base}" ("IBODE" OR "infirmier de bloc" OR "bloc opératoire") filetype:pdf' },
  { label: 'Matériel / Fiche technique', tpl: '"{base}" (intitle:catalogue OR intitle:"fiche technique") filetype:pdf' },
  { label: 'Formation DPC',              tpl: '"{base}" ("DPC" OR "formation continue" OR "développement professionnel") filetype:pdf' },
  // Académique / congrès
  { label: 'Thèses paramédicales',       tpl: '"{base}" ("thèse" OR "mémoire" OR "DU" OR "DIU") filetype:pdf' },
  { label: 'Congrès spécialisés',        tpl: '"{base}" ("SFAR" OR "SOFCOT" OR "SOFCPRE" OR "IBODE") filetype:pdf' },
  { label: 'Recommandations récentes',   tpl: '"{base}" ("recommandations" OR "guidelines" OR "consensus") filetype:pdf after:2018' },
  { label: 'Sites commerciaux',          tpl: '{base} filetype:pdf -site:*.gouv.fr -site:*.edu -site:*.org' },
  { label: 'Revues / magazines',         tpl: '{base} (intitle:revue OR intitle:magazine)' }
];

const DEFAULT_IBODE_PROFILE = {
  label: 'IBODE / Bloc opératoire',
  icon: '🏥',
  description: 'Recherches bloc opératoire',
  keywords: ['instrumentation', 'asepsie', 'protocole bloc', 'glossaire', 'lexique', 'CCAM'],
  exclusions: ['-forum', '-blog'],
  is_default: true,
  position: 0
};

const DEFAULT_IBODE_SOURCES = [
  { label: 'HAS',        domains: ['has-sante.fr'],  weight: 5, category: 'institutional', position: 0 },
  { label: 'ATIH',       domains: ['atih.sante.fr'], weight: 5, category: 'institutional', position: 1 },
  { label: 'Ameli',      domains: ['ameli.fr'],       weight: 4, category: 'institutional', position: 2 },
  { label: 'ANAP',       domains: ['anap.fr'],        weight: 3, category: 'institutional', position: 3 },
  { label: 'Inter Bloc', domains: ['interbloc.com'], weight: 3, category: 'professional',  position: 4 },
  { label: 'SF2H',       domains: ['sf2h.net'],       weight: 3, category: 'professional',  position: 5 },
  { label: 'SFAR',       domains: ['sfar.org'],       weight: 3, category: 'professional',  position: 6 },
  { label: 'SOFCOT',     domains: ['sofcot.com'],     weight: 3, category: 'professional',  position: 7 }
];

const BDB_THEMES = [
  { id: 'protocole', label: 'Protocole',           icon: '📋', dork: '(intitle:protocole OR intitle:procédure)' },
  { id: 'glossaire', label: 'Glossaire / Lexique',  icon: '📖', dork: '(intitle:glossaire OR intitle:lexique)' },
  { id: 'ccam',      label: 'CCAM',                icon: '🔢', dork: '(site:ameli.fr OR site:atih.sante.fr)' },
  { id: 'chu-fr',    label: 'CHU / Gouv FR',       icon: '🏛', dork: '(site:*.chu.fr OR site:*.chru.fr OR site:*.gouv.fr)' },
  { id: 'ibode',     label: 'IBODE / Bloc',        icon: '🏥', dork: '("IBODE" OR "infirmier de bloc" OR "bloc opératoire")' },
  { id: 'has',       label: 'HAS',                 icon: '✅', dork: 'site:has-sante.fr' }
];

const QUICK_RECIPES = [
  {
    icon: '📂', label: 'Index de répertoire',
    hint: 'Listes de fichiers publics indexés',
    preset: { exact: 'index of', appearsIn: 'title', filetype: 'all' },
    themes: []
  },
  {
    icon: '📄', label: 'Protocoles PDF CHU',
    hint: 'Documents institutionnels officiels',
    preset: { allWords: 'protocole', appearsIn: 'title', filetype: 'pdf' },
    themes: ['chu-fr']
  },
  {
    icon: '📖', label: 'Glossaire / Lexique',
    hint: 'Définitions et terminologie médicale',
    preset: { filetype: 'pdf' },
    themes: ['glossaire']
  },
  {
    icon: '🔢', label: 'CCAM officiel',
    hint: 'Nomenclature Ameli + ATIH',
    preset: { filetype: 'all' },
    themes: ['ccam']
  },
  {
    icon: '✅', label: 'Recommandations HAS',
    hint: 'Guidelines officielles PDF',
    preset: { filetype: 'pdf' },
    themes: ['has']
  },
  {
    icon: '🎓', label: 'Thèses paramédicales',
    hint: 'Mémoires, DU, thèses IBODE',
    preset: { anyWords: 'thèse mémoire DU DIU', filetype: 'pdf' },
    themes: ['ibode']
  },
  {
    icon: '📊', label: 'Fiches techniques',
    hint: 'Documentation matériel chirurgical',
    preset: { exact: 'fiche technique', appearsIn: 'title', filetype: 'pdf' },
    themes: []
  },
  {
    icon: '🏛', label: 'Sources institutionnelles',
    hint: 'HAS, CHU, Gouv FR',
    preset: { filetype: 'pdf' },
    themes: ['has', 'chu-fr']
  }
];
