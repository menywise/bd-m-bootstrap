/* ================================================================
   DORK BUILDER — veille-documentaire-engine.js
   Loaders Supabase, moteur de construction, gestion du mode UI
   Dépend de : veille-documentaire-data.js, veille-documentaire-state.js
   ================================================================ */

// ── Init depuis shell ────────────────────────────────────────────

function initFromShell() {
  const u = window.bdbUser;
  state.isAdmin = u.isAdmin;
  state.userId  = u.id;
}

// ── Loaders Supabase ─────────────────────────────────────────────

async function loadReferentiels() {
  const [opsRes, ftsRes] = await Promise.all([
    DB.from('dork_operators').select('*').order('position'),
    DB.from('dork_filetypes').select('*').order('position')
  ]);
  if (opsRes.error) throw new Error('Opérateurs : ' + opsRes.error.message);
  if (ftsRes.error) throw new Error('Types fichiers : ' + ftsRes.error.message);
  state.operators = opsRes.data || [];
  state.filetypes = ftsRes.data || [];
}

async function loadProfiles() {
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_dork').select('*');
    state.profiles = (data || []).map(p => ({
      ...p, is_default: false, keywords: p.keywords || [],
      enabled_operator_ids: [], enabled_filetype_ids: []
    }));
    if (state.profiles.length > 0) state.currentProfileId = state.profiles[0].id;
    state.sources = [];
    state.history = [];
    renderAll();
    return;
  }
  const { data, error } = await DB.from('dork_profiles')
    .select('*').eq('user_id', state.userId).order('position');
  if (error) throw new Error('Profils : ' + error.message);
  state.profiles = data || [];
  if (state.profiles.length === 0) await seedDefaultProfile();
  if (!state.currentProfileId || !state.profiles.find(p => p.id === state.currentProfileId)) {
    state.currentProfileId = state.profiles[0]?.id || null;
  }
}

async function seedDefaultProfile() {
  const { data: prof, error } = await DB.from('dork_profiles')
    .insert({ ...DEFAULT_IBODE_PROFILE, user_id: state.userId })
    .select().single();
  if (error || !prof) return;
  state.profiles        = [prof];
  state.currentProfileId = prof.id;
  for (const src of DEFAULT_IBODE_SOURCES) {
    await DB.from('dork_sources').insert({ ...src, profile_id: prof.id }).select();
  }
}

async function loadSourcesForProfile(profileId) {
  if (!profileId) { state.sources = []; return; }
  const { data, error } = await DB.from('dork_sources')
    .select('*').eq('profile_id', profileId).order('position');
  if (error) { state.sources = []; return; }
  state.sources = data || [];
}

async function loadHistory() {
  const { data, error } = await DB.from('dork_history')
    .select('*').eq('user_id', state.userId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY);
  if (error) { state.history = []; return; }
  state.history = data || [];
}

// ── Mode UI ──────────────────────────────────────────────────────

function setUiMode(mode) {
  state.uiMode = mode;
  const assistedZone = document.getElementById('dkAssistedZone');
  const expertZone   = document.getElementById('dkExpertZone');
  const btnAssisted  = document.getElementById('btnModeAssisted');
  const btnExpert    = document.getElementById('btnModeExpert');
  const hint         = document.getElementById('dkModeHint');

  if (mode === 'assisted') {
    assistedZone.classList.remove('d-none');
    expertZone.classList.add('d-none');
    btnAssisted.classList.add('active');
    btnExpert.classList.remove('active');
    if (hint) hint.textContent = 'Décrivez votre besoin — le dork se construit tout seul';
  } else {
    assistedZone.classList.add('d-none');
    expertZone.classList.remove('d-none');
    btnAssisted.classList.remove('active');
    btnExpert.classList.add('active');
    if (hint) hint.textContent = 'Syntaxe Google directe — opérateurs et filetypes';
  }
}

function clearAssistedForm() {
  ['asAllWords','asExact','asAnyWords','asNone','asSite','asAfter','asBefore'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sel1 = document.getElementById('asAppearsIn');
  const sel2 = document.getElementById('asFiletype');
  if (sel1) sel1.value = 'all';
  if (sel2) sel2.value = 'all';
  state.selectedThemeIds.clear();
  renderThemes();
}

function applyRecipe(idx) {
  const recipe = QUICK_RECIPES[idx];
  if (!recipe) return;
  setUiMode('assisted');
  clearAssistedForm();
  const p = recipe.preset;
  if (p.allWords)  document.getElementById('asAllWords').value  = p.allWords;
  if (p.exact)     document.getElementById('asExact').value     = p.exact;
  if (p.anyWords)  document.getElementById('asAnyWords').value  = p.anyWords;
  if (p.none)      document.getElementById('asNone').value      = p.none;
  if (p.appearsIn) document.getElementById('asAppearsIn').value = p.appearsIn;
  if (p.filetype)  document.getElementById('asFiletype').value  = p.filetype;
  if (p.site)      document.getElementById('asSite').value      = p.site;
  state.selectedThemeIds.clear();
  (recipe.themes || []).forEach(id => state.selectedThemeIds.add(id));
  renderThemes();
  const firstEmpty = ['asAllWords','asExact','asAnyWords'].find(id =>
    !document.getElementById(id).value
  );
  if (firstEmpty) document.getElementById(firstEmpty).focus();
  showToast('Recette chargée — ajoutez votre terme puis construisez le dork', 'info');
}

// ── Moteur Mode Assisté ──────────────────────────────────────────

function buildAssisted() {
  const allWords    = document.getElementById('asAllWords').value.trim();
  const exactPhrase = document.getElementById('asExact').value.trim();
  const anyWords    = document.getElementById('asAnyWords').value.trim();
  const noneWords   = document.getElementById('asNone').value.trim();
  const afterYear   = document.getElementById('asAfter').value.trim();
  const beforeYear  = document.getElementById('asBefore').value.trim();
  const appearsIn   = document.getElementById('asAppearsIn').value;
  const fileType    = document.getElementById('asFiletype').value;
  const siteDomain  = document.getElementById('asSite').value.trim()
    .replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!allWords && !exactPhrase && !anyWords && state.selectedThemeIds.size === 0) {
    showToast('Au moins un terme est nécessaire pour continuer', 'warn');
    return null;
  }

  const parts   = [];
  const mainTerm = exactPhrase
    ? '"' + exactPhrase + '"'
    : allWords
      ? (allWords.includes(' ') ? '"' + allWords + '"' : allWords)
      : '';

  if (mainTerm) {
    if (appearsIn === 'title')      parts.push('intitle:' + mainTerm);
    else if (appearsIn === 'url') {
      const kebab = (exactPhrase || allWords).toLowerCase().replace(/\s+/g, '-');
      parts.push('inurl:' + kebab);
    }
    else if (appearsIn === 'body')  parts.push('intext:' + mainTerm);
    else {
      if (exactPhrase) parts.push('"' + exactPhrase + '"');
      if (allWords)    parts.push(allWords);
    }
  }

  if (anyWords) {
    const words = anyWords.split(/\s+/).filter(Boolean);
    parts.push(words.length > 1 ? '(' + words.join(' OR ') + ')' : words[0]);
  }
  if (noneWords) {
    noneWords.split(/\s+/).filter(Boolean).forEach(w =>
      parts.push(w.includes(' ') ? '-"' + w + '"' : '-' + w)
    );
  }
  for (const themeId of state.selectedThemeIds) {
    const theme = BDB_THEMES.find(t => t.id === themeId);
    if (theme) parts.push(theme.dork);
  }
  if (fileType !== 'all') parts.push('filetype:' + fileType);
  if (siteDomain)          parts.push('site:' + siteDomain);
  if (afterYear  && /^\d{4}$/.test(afterYear))  parts.push('after:'  + afterYear  + '-01-01');
  if (beforeYear && /^\d{4}$/.test(beforeYear)) parts.push('before:' + beforeYear + '-12-31');

  return parts.join(' ').trim() || null;
}

// ── Moteur Mode Expert ───────────────────────────────────────────

/*
 * Placeholders DB réels :
 *   {query}  → terme (intitle, intext, define, exact)
 *   {domain} → kebab-case (site, related)
 *   {url}    → kebab-case (cache)
 *   {term}   → brut (exclude)
 *   {ext},{a},{b} → gérés ailleurs ou ignorés
 */
function applyOpSyntax(op, baseClean) {
  const kebab  = baseClean.toLowerCase().replace(/\s+/g, '-');
  const quoted = '"' + baseClean + '"';
  const val    = baseClean.includes(' ') ? quoted : baseClean;

  if (op.label === 'site' || op.label === 'filetype' || op.label === 'OR') return null;
  if (op.label === 'before')     return state.beforeDate  ? 'before:'  + state.beforeDate  : null;
  if (op.label === 'after')      return state.afterDate   ? 'after:'   + state.afterDate   : null;
  if (op.label === 'AROUND')     return state.aroundTermB
    ? baseClean + ' AROUND(' + state.aroundN + ') ' + state.aroundTermB : null;
  if (op.label === 'wildcard')   return baseClean + ' *';
  if (op.label === 'allintitle') return 'allintitle:' + val;
  if (op.label === 'allintext')  return 'allintext:'  + val;

  let result = op.syntax;
  if (!result) return null;
  if (result.includes('{domain}') || result.includes('{url}')) {
    result = result.replace(/\{domain\}/g, kebab).replace(/\{url\}/g, kebab);
  } else if (result.includes('{query}')) {
    result = result.replace(/\{query\}/g, val);
  } else if (result.includes('{term}')) {
    result = result.replace(/\{term\}/g, baseClean);
  } else if (result.includes('{ext}') || result.includes('{a}')) {
    return null;
  }
  return result || null;
}

function buildCustomDork(base) {
  if (!base || !base.trim()) return null;
  const baseClean = base.trim();
  const hasOperators = state.selectedOperatorIds.size > 0;
  const hasFiletypes = state.selectedFiletypeIds.size > 0;
  const hasSources   = state.selectedSourceIds.size > 0;
  const hasKeywords  = state.selectedKeywords.length > 0;

  if (!hasOperators && !hasFiletypes && !hasSources && !hasKeywords) return baseClean;

  const parts = [];

  for (const opId of state.selectedOperatorIds) {
    const op = state.operators.find(o => o.id === opId);
    if (!op) continue;
    const result = applyOpSyntax(op, baseClean);
    if (result) parts.push(result);
  }

  if (hasKeywords) {
    const kwTerms = [baseClean, ...state.selectedKeywords.slice(0, MAX_KEYWORDS)];
    const unique  = [...new Set(kwTerms)];
    parts.push(unique.length > 1
      ? '(' + unique.map(t => '"' + t + '"').join(' OR ') + ')'
      : '"' + baseClean + '"');
  } else {
    const hasFieldOp = [...state.selectedOperatorIds].some(id => {
      const op = state.operators.find(o => o.id === id);
      return op && ['intitle', 'intext', 'inurl', 'exact'].includes(op.label);
    });
    if (!hasFieldOp) parts.push(baseClean);
  }

  const ftList = [];
  for (const ftId of state.selectedFiletypeIds) {
    const ft = state.filetypes.find(f => f.id === ftId);
    if (ft) ftList.push('filetype:' + ft.extension);
  }
  if (ftList.length === 1) parts.push(ftList[0]);
  else if (ftList.length > 1) parts.push('(' + ftList.join(' OR ') + ')');

  const siteList = [];
  for (const srcId of state.selectedSourceIds) {
    const src = state.sources.find(s => s.id === srcId);
    if (src) (src.domains || []).forEach(d => siteList.push('site:' + d));
  }
  if (siteList.length === 1) parts.push(siteList[0]);
  else if (siteList.length > 1) parts.push('(' + siteList.join(' OR ') + ')');

  const p = state.profiles.find(pr => pr.id === state.currentProfileId);
  if (p && p.exclusions && p.exclusions.length > 0) parts.push(p.exclusions.join(' '));

  return parts.join(' ').trim();
}

function generatePatternDorks(base) {
  const clean = base.trim().replace(/filetype:\w+/gi, '').trim();
  if (!clean) return [];
  return DORK_PATTERNS.map(p => {
    const query = p.tpl.replace(/\{base\}/g, clean);
    return { label: p.label, query, url: buildGoogleUrl(query), tags: ['pattern'] };
  });
}
