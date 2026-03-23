'use strict';

// ════════════════════════════════════════════════════════════
// UTILITAIRES
// ════════════════════════════════════════════════════════════

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg, type = 'success') {
  // Toast Bootstrap natif — autonome, sans dépendance externe
  const existing = document.getElementById('supvToastContainer');
  const container = existing || (() => {
    const c = document.createElement('div');
    c.id = 'supvToastContainer';
    c.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:8px';
    document.body.appendChild(c);
    return c;
  })();

  const bg    = type === 'error' ? '#fde8e8' : type === 'warning' ? '#fef3c7' : '#def7ec';
  const color = type === 'error' ? '#9b1c1c' : type === 'warning' ? '#92400e' : '#03543f';
  const icon  = type === 'error' ? 'bi-x-circle-fill' : type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';

  const el = document.createElement('div');
  el.style.cssText = `background:${bg};color:${color};border-radius:8px;padding:10px 14px;font-size:12px;font-weight:500;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.12);max-width:320px;`;
  el.innerHTML = `<i class="bi ${icon}" style="font-size:13px;flex-shrink:0"></i><span>${escHtml(msg)}</span>`;
  container.appendChild(el);

  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2800);
  setTimeout(() => el.remove(), 3100);
}

// ════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════

const state = {
  isAdmin        : false,
  isLocal        : false,       // File System API disponible
  activeTab      : 'sante',
  modules        : [],          // app_modules
  groups         : [],          // app_groups
  rules          : [],          // supervision_rules (is_active=true)
  config         : [],          // supervision_config
  sessions       : [],          // supervision_sessions
  santeFilter    : 'all',
  configGroupFilter    : 'all',
  configVisibilityFilter : 'all',
  erreursFilter    : 'all',
  erreurs          : [],
  modModalInst   : null,
  sessModalInst  : null,
  editModuleId   : null,
};

const DB = () => window.bdb;

// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();

  // Détection mode local / OVH — basée sur le hostname, pas sur la présence de l'API
  // showDirectoryPicker existe dans Chrome partout — ce n'est pas un indicateur fiable
  const hostname = window.location.hostname;
  state.isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
  renderModeBanner();

  // Navigation onglets
  document.getElementById('supvNav').addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  // Filtres santé
  document.getElementById('santeFilters').addEventListener('click', e => {
    const btn = e.target.closest('.supv-filter-btn');
    if (!btn) return;
    document.querySelectorAll('.supv-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.santeFilter = btn.dataset.filter;
    renderSanteGrid();
  });

  // Retry handlers
  document.getElementById('santeRetry').addEventListener('click', loadSante);
  document.getElementById('configRetry').addEventListener('click', loadConfig);
  document.getElementById('sessionsRetry').addEventListener('click', loadSessions);
  document.getElementById('erreursRetry').addEventListener('click', loadErreurs);
  document.getElementById('btnRefreshErreurs').addEventListener('click', loadErreurs);
  document.getElementById('btnAnalyseIA').addEventListener('click', analyseErreursIA);
  document.getElementById('btnCopyIaPrompt').addEventListener('click', () => {
    const text = document.getElementById('erreursIaResult').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btnCopyIaPrompt');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié !';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  });
  document.getElementById('btnPurgeErreurs').addEventListener('click', purgeErreurs);
  document.getElementById('erreursFilters').addEventListener('click', e => {
    const btn = e.target.closest('[data-errfilter]');
    if (!btn) return;
    document.querySelectorAll('[data-errfilter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.erreursFilter = btn.dataset.errfilter;
    renderErreurs();
  });

  // Scan local
  document.getElementById('btnScanLocal').addEventListener('click', scanLocalFolder);

  // Conformité — drop zone
  initDropzone();

  // Import règles .md
  document.getElementById('btnImportRules').addEventListener('click', importRulesMd);

  // Delta validation
  document.getElementById('btnValidateDelta').addEventListener('click', validateDelta);
  document.getElementById('btnRejectDelta').addEventListener('click', rejectDelta);

  // Config — filtre groupe
  document.getElementById('configGroupFilter').addEventListener('change', e => {
    state.configGroupFilter = e.target.value;
    renderConfigModules();
  });
  document.getElementById('configVisibilityFilter').addEventListener('change', e => {
    state.configVisibilityFilter = e.target.value;
    renderConfigModules();
  });

  // Modales
  state.modModalInst  = new bootstrap.Modal(document.getElementById('modalModule'));
  state.sessModalInst = new bootstrap.Modal(document.getElementById('modalSession'));
  document.getElementById('btnSaveModule').addEventListener('click', saveModule);
  document.getElementById('btnSaveSession').addEventListener('click', saveSession);
  document.getElementById('btnGenPrompt').addEventListener('click', generatePrompt);
  document.getElementById('btnCopyPrompt').addEventListener('click', copyPrompt);

  // Chargement initial
  try {
    await Promise.all([loadRules(), loadConfig()]);
    await loadSante();
  } catch (err) {
    console.error('[supervision] init error:', err);
  }

  // ── Audit ────────────────────────────────────────────────
  initAudit();
});

function initFromShell() {
  // Bloquer uniquement si bdbUser est chargé ET explicitement non-admin
  // En local dev (file:// ou localhost sans session), bdbUser peut être undefined — ne pas rediriger
  if (window.bdbUser !== undefined && !window.bdbUser?.isAdmin) {
    window.location.href = '../../index.html';
    return;
  }
  // En local dev (bdbUser undefined) : accès admin uniquement sur localhost
  // En prod (bdbUser défini) : respecter strictement isAdmin
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
  state.isAdmin = window.bdbUser !== undefined ? (window.bdbUser.isAdmin === true) : isLocalDev;
  // Slots admin — C.6
  document.getElementById('santeAdminSlot').classList.remove('d-none');
  document.getElementById('conformiteAdminSlot').classList.remove('d-none');
  document.getElementById('sessionsAdminSlot').classList.remove('d-none');
  document.getElementById('erreursAdminSlot').classList.remove('d-none');
  document.getElementById('btnNewGroup').classList.remove('d-none');
  document.getElementById('btnNewModule').classList.remove('d-none');
}

// ════════════════════════════════════════════════════════════
// MODE BANNER
// ════════════════════════════════════════════════════════════

function renderModeBanner() {
  const banner = document.getElementById('supvModeBanner');
  const label  = document.getElementById('supvModeLabel');
  if (state.isLocal) {
    banner.className = 'supv-mode-banner mode-local';
    banner.querySelector('i').className = 'bi bi-pc-display';
    label.textContent = 'Mode local — scan disque + parsing .md disponibles';
  } else {
    banner.className = 'supv-mode-banner mode-ovh';
    banner.querySelector('i').className = 'bi bi-cloud';
    label.textContent = 'Mode OVH — lecture Supabase uniquement';
  }
}

// ════════════════════════════════════════════════════════════
// NAVIGATION ONGLETS
// ════════════════════════════════════════════════════════════

function switchTab(name) {
  document.querySelectorAll('#supvNav .supv-nav-link').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  ['sante','conformite','configuration','sessions','erreurs','audit'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('d-none', t !== name);
  });
  state.activeTab = name;
  if (name === 'configuration' && !state.modules.length) loadConfig();
  if (name === 'sessions') loadSessions();
  if (name === 'erreurs') loadErreurs();
  if (name === 'conformite') checkRulesAvailability();
  if (name === 'audit') renderAuditModeBanner();
}

// ════════════════════════════════════════════════════════════
// ONGLET SANTÉ
// ════════════════════════════════════════════════════════════

async function loadSante() {
  setSanteState('loading');
  try {
    const { data, error } = await DB()
      .from('app_modules')
      .select('id, key, label, description, icon, color, status, visibility, group_key, path, position')
      .order('group_key')
      .order('position');
    if (error) throw new Error(error.message);
    state.modules = data || [];
    if (!state.modules.length) { setSanteState('empty'); return; }
    setSanteState('data');
    renderSanteKpis();
    renderSanteGrid();
  } catch (err) {
    document.getElementById('santeErrorMsg').textContent = err.message;
    setSanteState('error');
  }
}

function setSanteState(s) {
  document.getElementById('santeLoading').classList.toggle('d-none', s !== 'loading');
  document.getElementById('santeEmpty').classList.toggle('d-none', s !== 'empty');
  document.getElementById('santeError').classList.toggle('d-none', s !== 'error');
  document.getElementById('santeGrid').classList.toggle('d-none', s !== 'data');
}

function renderSanteKpis() {
  const m = state.modules;
  document.getElementById('kpiTotal').textContent = m.length;
  document.getElementById('kpiShell').textContent = m.filter(x => x.status === 'active').length;
  document.getElementById('kpiOk').textContent    = m.filter(x => x.status === 'active').length;
  document.getElementById('kpiErr').textContent   = m.filter(x => x.status === 'coming_soon' || x.status === 'maintenance').length;
  document.getElementById('kpiCtx').textContent   = '—';
}

function renderSanteGrid() {
  const filtered = state.santeFilter === 'all'
    ? state.modules
    : state.modules.filter(m => {
        if (state.santeFilter === 'ok')   return m.status === 'active';
        if (state.santeFilter === 'err')  return m.status === 'maintenance';
        if (state.santeFilter === 'warn') return m.status === 'coming_soon';
        return true;
      });

  if (!filtered.length) {
    document.getElementById('santeGrid').innerHTML =
      `<div class="col-12"><div class="supv-state"><i class="bi bi-funnel supv-state-icon"></i><div class="supv-state-msg">Aucun module pour ce filtre</div></div></div>`;
    return;
  }

  document.getElementById('santeGrid').innerHTML = filtered.map(m => {
    const stateClass = m.status === 'active' ? 'state-ok'
      : m.status === 'coming_soon' ? 'state-warn'
      : m.status === 'maintenance' ? 'state-err' : 'state-unknown';

    const isAdmin = m.visibility === 'admin';

    const statusBadge = m.status === 'active'
      ? `<span class="supv-badge supv-badge-ok"><i class="bi bi-check-circle-fill"></i>${escHtml(m.status)}</span>`
      : m.status === 'coming_soon'
      ? `<span class="supv-badge supv-badge-warn"><i class="bi bi-clock"></i>${escHtml(m.status)}</span>`
      : `<span class="supv-badge supv-badge-err"><i class="bi bi-tools"></i>${escHtml(m.status)}</span>`;

    const visiBadge = isAdmin
      ? `<span class="supv-badge supv-badge-info"><i class="bi bi-shield-lock-fill"></i>admin</span>`
      : `<span class="supv-badge" style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0"><i class="bi bi-people-fill"></i>member</span>`;

    const cardAccent = isAdmin ? 'supv-mod-card-admin' : 'supv-mod-card-member';
    const editHint = state.isAdmin
      ? `<span class="supv-mod-edit-hint"><i class="bi bi-pencil"></i></span>`
      : '';

    return `
    <div class="col-12 col-sm-6 col-xl-4">
      <div class="supv-mod-card ${stateClass} ${cardAccent}" data-sante-edit="${escHtml(m.id)}" ${state.isAdmin ? 'style="cursor:pointer"' : ''}>
        <div class="supv-mod-hdr">
          <i class="bi ${escHtml(m.icon || 'bi-grid')}" style="font-size:14px;color:#9ca3af"></i>
          <span class="supv-mod-name">${escHtml(m.label)}</span>
          ${statusBadge}
          ${editHint}
        </div>
        <div class="supv-mod-body d-flex align-items-center justify-content-between">
          <div>
            <code style="font-size:10px">${escHtml(m.key)}</code>
            <span class="text-muted ms-2" style="font-size:10px">${escHtml(m.group_key)}</span>
          </div>
          ${visiBadge}
        </div>
      </div>
    </div>`;
  }).join('');

  if (state.isAdmin) {
    document.getElementById('santeGrid').querySelectorAll('[data-sante-edit]').forEach(card => {
      card.addEventListener('click', () => {
        switchTab('configuration');
        setTimeout(() => openModuleModal(card.dataset.santeEdit), 200);
      });
    });
  }
}

async function scanLocalFolder() {
  if (!state.isLocal) {
    showToast('File System API non disponible dans ce contexte.', 'error');
    return;
  }
  try {
    const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    showToast(`Dossier connecté : ${escHtml(dirHandle.name)}`, 'success');
    // Scan modules/ et croisement avec app_modules
    await crossCheckModules(dirHandle);
  } catch (err) {
    if (err.name !== 'AbortError') showToast('Erreur accès dossier : ' + err.message, 'error');
  }
}

async function crossCheckModules(dirHandle) {
  const diskModules = [];
  try {
    const modulesDir = await dirHandle.getDirectoryHandle('modules', { create: false });
    for await (const [name, handle] of modulesDir.entries()) {
      if (handle.kind === 'directory') diskModules.push(name);
    }
  } catch {
    showToast('Dossier modules/ introuvable à la racine.', 'error');
    return;
  }

  const dbKeys = state.modules.map(m => m.key);
  const notInDb    = diskModules.filter(n => !dbKeys.includes(n));
  const notOnDisk  = dbKeys.filter(k => !diskModules.includes(k));

  let alerts = [];
  notInDb.forEach(n => alerts.push(
    `<div class="supv-delta-row modified"><i class="bi bi-exclamation-circle text-warning"></i><span>Module <strong>${escHtml(n)}</strong> présent sur disque mais absent de app_modules — Non référencé</span></div>`
  ));
  notOnDisk.forEach(k => alerts.push(
    `<div class="supv-delta-row removed"><i class="bi bi-x-circle text-danger"></i><span>Module <strong>${escHtml(k)}</strong> dans app_modules mais absent du disque — Fichier manquant</span></div>`
  ));

  if (alerts.length) {
    const grid = document.getElementById('santeGrid');
    const alertBox = document.createElement('div');
    alertBox.className = 'col-12 mb-3';
    alertBox.innerHTML = `<div class="supv-section-label">Écarts disque ↔ app_modules</div>${alerts.join('')}`;
    grid.prepend(alertBox);
  } else {
    showToast('Disque et app_modules sont cohérents.', 'success');
  }
}

// ════════════════════════════════════════════════════════════
// ONGLET CONFORMITÉ
// ════════════════════════════════════════════════════════════

async function loadRules() {
  const { data, error } = await DB()
    .from('supervision_rules')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error('supervision_rules : ' + error.message);
  state.rules = data || [];
}

function checkRulesAvailability() {
  document.getElementById('conformiteNoRules').classList.toggle('d-none', state.rules.length > 0);
}

async function loadConfigVersions() {
  const { data, error } = await DB()
    .from('supervision_config')
    .select('doc_key, version_active, validated_at')
    .order('doc_key');
  if (error) throw new Error('supervision_config : ' + error.message);
  state.config = data || [];
  renderConfigVersions();
}

function renderConfigVersions() {
  if (!state.config.length) return;
  document.getElementById('conformiteVersions').innerHTML = `
    <div class="supv-section-label">Versions de référence actives</div>
    <div class="d-flex flex-wrap gap-2 mb-3">
      ${state.config.map(c =>
        `<span class="supv-badge supv-badge-info">
          <i class="bi bi-file-earmark-text"></i>
          ${escHtml(c.doc_key)} ${escHtml(c.version_active)}
        </span>`
      ).join('')}
    </div>`;
}

function initDropzone() {
  const dz = document.getElementById('conformiteDropzone');
  const fi = document.getElementById('conformiteFileInput');

  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragging'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('dragging');
    const files = Array.from(e.dataTransfer.files).filter(f => /\.(html|css|js)$/i.test(f.name));
    if (files.length) files.forEach(auditFile);
  });
  fi.addEventListener('change', () => {
    Array.from(fi.files).filter(f => /\.(html|css|js)$/i.test(f.name)).forEach(auditFile);
    fi.value = '';
  });
}

function auditFile(file) {
  if (!state.rules.length) {
    showToast('Aucune règle active — audit impossible.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => runAudit(file.name, e.target.result);
  reader.readAsText(file);
}

function runAudit(filename, content) {
  document.getElementById('conformiteEmpty').classList.add('d-none');
  const violations = [], warnings = [], ok = [];
  const contentNoComments = content.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

  state.rules.forEach(rule => {
    if (!rule.rule_pattern) return;
    let re;
    try { re = new RegExp(rule.rule_pattern, 'gim'); } catch { return; }

    const isHtml = filename.endsWith('.html');
    const isCss  = filename.endsWith('.css');

    // Règles HTML uniquement sur contenu HTML
    const targetContent = (rule.rule_key === 'INTERDIT-17') ? (isCss ? content : null)
      : (isHtml ? contentNoComments : null);

    if (targetContent === null) return;

    const matches = targetContent.match(re);

    // Règles positives (info)
    if (rule.rule_type === 'info') {
      if (matches) ok.push({ rule: rule.rule_key, message: rule.rule_label });
      return;
    }

    // Règle INTERDIT-C2 — exceptions tolérées
    if (rule.rule_key === 'INTERDIT-C2') {
      const illegal = (matches || []).filter(s =>
        !s.match(/background.*category\.color|width.*pct|display.*none/i)
      );
      if (illegal.length) {
        violations.push({ rule: rule.rule_key, message: `${rule.rule_label} — ${illegal.length} occurrence(s)` });
      } else if (matches) {
        ok.push({ rule: rule.rule_key, message: 'style= uniquement pour couleurs dynamiques (toléré)' });
      }
      return;
    }

    // Règle INTERDIT-C6 — vérifier présence escHtml si innerHTML présent
    if (rule.rule_key === 'INTERDIT-C6') {
      if (matches && !content.includes('escHtml')) {
        violations.push({ rule: rule.rule_key, message: rule.rule_label });
      } else if (matches && content.includes('escHtml')) {
        ok.push({ rule: 'ESCHTML-OK', message: 'escHtml() présent — protection XSS active' });
      }
      return;
    }

    // Règle générale
    if (matches) {
      if (rule.rule_type === 'violation') {
        violations.push({ rule: rule.rule_key, message: `${rule.rule_label} — ${matches.length} occurrence(s)` });
      } else {
        warnings.push({ rule: rule.rule_key, message: rule.rule_label });
      }
    } else if (rule.rule_type === 'warning' && isHtml) {
      warnings.push({ rule: rule.rule_key, message: rule.rule_label });
    }
  });

  // INTERDIT-E1 — vérification position #bdb-shell
  if (filename.endsWith('.html')) {
    const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      const mainClean = mainMatch[1].replace(/(<!--[\s\S]*?-->|\s+)/g, '');
      if (!mainClean.startsWith('<divid="bdb-shell"')) {
        violations.push({ rule: 'INTERDIT-E1', message: '#bdb-shell n\'est pas le PREMIER ENFANT de <main>' });
      } else {
        ok.push({ rule: 'INTERDIT-E1', message: '#bdb-shell correctement positionné' });
      }
    }
  }

  renderAuditResult(filename, violations, warnings, ok);
}

function renderAuditResult(filename, violations, warnings, ok) {
  const results = document.getElementById('conformiteResults');
  const ext = filename.endsWith('.css') ? 'bi-filetype-css'
    : filename.endsWith('.js') ? 'bi-filetype-js'
    : filename.endsWith('.md') ? 'bi-filetype-md'
    : 'bi-filetype-html';

  const badge = violations.length
    ? `<span class="supv-badge supv-badge-err">${violations.length} violation${violations.length > 1 ? 's' : ''}</span>`
    : warnings.length
    ? `<span class="supv-badge supv-badge-warn">${warnings.length} avert.</span>`
    : `<span class="supv-badge supv-badge-ok">Conforme</span>`;

  let body = '';
  if (violations.length) {
    body += `<div class="fw-semibold mb-1" style="font-size:11px;color:#e02424"><i class="bi bi-x-circle-fill me-1"></i>Violations (${violations.length})</div>`;
    body += violations.map(f =>
      `<div class="supv-finding fv"><i class="bi bi-x-lg supv-finding-icon"></i><span>${escHtml(f.message)}</span><span class="supv-finding-rule">${escHtml(f.rule)}</span></div>`
    ).join('');
  }
  if (warnings.length) {
    body += `<div class="fw-semibold mb-1 mt-2" style="font-size:11px;color:#d97706"><i class="bi bi-exclamation-triangle-fill me-1"></i>Avertissements (${warnings.length})</div>`;
    body += warnings.map(f =>
      `<div class="supv-finding fw"><i class="bi bi-exclamation-lg supv-finding-icon"></i><span>${escHtml(f.message)}</span><span class="supv-finding-rule">${escHtml(f.rule)}</span></div>`
    ).join('');
  }
  if (ok.length) {
    body += `<div class="fw-semibold mb-1 mt-2" style="font-size:11px;color:#057a55"><i class="bi bi-check-circle-fill me-1"></i>Conformes (${ok.length})</div>`;
    body += ok.map(f =>
      `<div class="supv-finding fok"><i class="bi bi-check-lg supv-finding-icon"></i><span>${escHtml(f.message)}</span><span class="supv-finding-rule">${escHtml(f.rule)}</span></div>`
    ).join('');
  }

  const card = document.createElement('div');
  card.className = 'supv-config-card mb-3';
  card.innerHTML = `
    <div class="supv-config-card-hdr">
      <i class="bi ${ext} text-secondary"></i>
      <span class="supv-config-card-title">${escHtml(filename)}</span>
      ${badge}
    </div>
    <div class="p-3">${body}</div>`;
  results.prepend(card);
}

// ─── Import .md gouvernance (mode local) ───
async function importRulesMd() {
  if (!state.isLocal) {
    showToast('Import .md disponible en mode local uniquement.', 'error');
    return;
  }
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }]
    });
    const file = await fileHandle.getFile();
    const text = await file.text();
    parseMdRules(file.name, text);
  } catch (err) {
    if (err.name !== 'AbortError') showToast('Erreur lecture fichier : ' + err.message, 'error');
  }
}

function parseMdRules(filename, text) {
  const versionMatch = text.match(/VERSION\s*:\s*([^\n]+)/);
  const version = versionMatch ? versionMatch[1].trim().replace(/\./g, '_') : 'UNKNOWN';

  const docKey = filename.includes('CHANTIER') ? 'CHANTIER_TECHNIQUE'
    : filename.includes('NOYAU') ? 'NOYAU_VERITE'
    : filename.replace(/\.md$/i, '').replace(/[^A-Z0-9_]/gi, '_').toUpperCase();

  // Extraire les INTERDIT-XX
  const ruleMatches = [...text.matchAll(/INTERDIT-([A-Z0-9-]+)\s*:\s*([^\n]+)/gi)];
  if (!ruleMatches.length) {
    showToast('Aucune règle INTERDIT-* trouvée dans ce fichier.', 'error');
    return;
  }

  const newRules = ruleMatches.map(m => ({
    rule_key   : `INTERDIT-${m[1].toUpperCase()}`,
    rule_label : m[2].trim(),
    rule_type  : 'violation',
    doc_key    : docKey,
    version    : version,
  }));

  // Calcul delta vs règles actives
  const activeKeys = state.rules.map(r => r.rule_key);
  const newKeys    = newRules.map(r => r.rule_key);
  const added      = newRules.filter(r => !activeKeys.includes(r.rule_key));
  const removed    = state.rules.filter(r => !newKeys.includes(r.rule_key));

  if (!added.length && !removed.length) {
    showToast('Aucun écart détecté — règles déjà à jour.', 'success');
    return;
  }

  renderDelta(added, removed, docKey, version);
}

function renderDelta(added, removed, docKey, version) {
  const list = document.getElementById('conformiteDeltaList');
  list.innerHTML = [
    ...added.map(r =>
      `<div class="supv-delta-row added"><i class="bi bi-plus-circle text-success"></i><span><strong>${escHtml(r.rule_key)}</strong> — ${escHtml(r.rule_label)}</span><span class="supv-badge supv-badge-ok ms-auto">Ajout</span></div>`
    ),
    ...removed.map(r =>
      `<div class="supv-delta-row removed"><i class="bi bi-dash-circle text-danger"></i><span><strong>${escHtml(r.rule_key)}</strong> — ${escHtml(r.rule_label)}</span><span class="supv-badge supv-badge-err ms-auto">Suppression</span></div>`
    ),
  ].join('');

  document.getElementById('conformiteDelta').classList.remove('d-none');
  document.getElementById('conformiteDelta').dataset.docKey  = docKey;
  document.getElementById('conformiteDelta').dataset.version = version;
  document.getElementById('conformiteDelta').dataset.added   = JSON.stringify(added);
  document.getElementById('conformiteDelta').dataset.removed = JSON.stringify(removed);
}

async function validateDelta() {
  const el       = document.getElementById('conformiteDelta');
  const docKey   = el.dataset.docKey;
  const version  = el.dataset.version;
  const added    = JSON.parse(el.dataset.added   || '[]');
  const removed  = JSON.parse(el.dataset.removed || '[]');

  try {
    // Désactiver les règles supprimées
    if (removed.length) {
      const { error } = await DB()
        .from('supervision_rules')
        .update({ is_active: false })
        .in('rule_key', removed.map(r => r.rule_key))
        .eq('doc_key', docKey);
      if (error) throw new Error(error.message);
    }

    // Insérer les nouvelles règles
    if (added.length) {
      const { error } = await DB()
        .from('supervision_rules')
        .upsert(added.map(r => ({ ...r, is_active: true })),
          { onConflict: 'doc_key,version,rule_key' });
      if (error) throw new Error(error.message);
    }

    // Mettre à jour supervision_config
    const { error: cfgErr } = await DB()
      .from('supervision_config')
      .update({ version_active: version, validated_at: new Date().toISOString() })
      .eq('doc_key', docKey);
    if (cfgErr) throw new Error(cfgErr.message);

    await loadRules();
    await loadConfigVersions();
    document.getElementById('conformiteDelta').classList.add('d-none');
    showToast('Règles mises à jour et validées.', 'success');
  } catch (err) {
    showToast('Erreur validation : ' + err.message, 'error');
  }
}

async function rejectDelta() {
  document.getElementById('conformiteDelta').classList.add('d-none');
  showToast('Delta rejeté — règles actives inchangées.', 'success');
}

// ════════════════════════════════════════════════════════════
// ONGLET CONFIGURATION
// ════════════════════════════════════════════════════════════

async function loadConfig() {
  setConfigState('loading');
  try {
    const [modRes, grpRes] = await Promise.all([
      DB().from('app_modules').select('*').order('group_key').order('position'),
      DB().from('app_groups').select('*').order('position'),
    ]);
    if (modRes.error) throw new Error(modRes.error.message);
    if (grpRes.error) throw new Error(grpRes.error.message);
    state.modules = modRes.data || [];
    state.groups  = grpRes.data  || [];
    setConfigState('data');
    renderConfigGroups();
    renderConfigModules();
    populateGroupSelects();
    await loadConfigVersions();
  } catch (err) {
    document.getElementById('configErrorMsg').textContent = err.message;
    setConfigState('error');
  }
}

function setConfigState(s) {
  document.getElementById('configLoading').classList.toggle('d-none', s !== 'loading');
  document.getElementById('configError').classList.toggle('d-none', s !== 'error');
  document.getElementById('configContent').classList.toggle('d-none', s !== 'data');
}

function renderConfigGroups() {
  document.getElementById('configGroups').innerHTML = state.groups.map(g => `
    <div class="supv-config-card mb-2">
      <div class="supv-config-card-hdr">
        <i class="bi ${escHtml(g.icon)} text-secondary"></i>
        <span class="supv-config-card-title">${escHtml(g.label)}</span>
        <code style="font-size:10px;color:#9ca3af">${escHtml(g.key)}</code>
        <span class="supv-badge supv-badge-info ms-auto">pos.${escHtml(String(g.position))}</span>
      </div>
    </div>`).join('');
}

function renderConfigModules() {
  const gFilter = state.configGroupFilter;
  const vFilter = state.configVisibilityFilter || 'all';

  let filtered = state.modules;
  if (gFilter !== 'all') filtered = filtered.filter(m => m.group_key === gFilter);
  if (vFilter !== 'all') {
    const v = vFilter === 'all_vis' ? 'all' : vFilter;
    filtered = filtered.filter(m => m.visibility === v);
  }
  // Tri : admin en premier, puis member, puis all
  const visOrder = { admin: 0, member: 1, all: 2 };
  filtered = [...filtered].sort((a, b) => {
    const vd = (visOrder[a.visibility] ?? 9) - (visOrder[b.visibility] ?? 9);
    if (vd !== 0) return vd;
    return (a.group_key + a.position).localeCompare(b.group_key + b.position);
  });

  document.getElementById('configModulesBody').innerHTML = filtered.map(m => {
    const statusBadge = m.status === 'active'
      ? `<span class="supv-badge supv-badge-ok">${escHtml(m.status)}</span>`
      : m.status === 'coming_soon'
      ? `<span class="supv-badge supv-badge-warn">${escHtml(m.status)}</span>`
      : `<span class="supv-badge supv-badge-err">${escHtml(m.status)}</span>`;

    const visCls = m.visibility === 'admin'  ? 'supv-badge-vis-admin'
                 : m.visibility === 'member' ? 'supv-badge-vis-member'
                 : 'supv-badge-vis-all';
    const visIcon = m.visibility === 'admin'  ? 'bi-shield-lock-fill'
                  : m.visibility === 'member' ? 'bi-person-fill'
                  : 'bi-globe';
    const visBadge = `<span class="supv-badge ${visCls}"><i class="bi ${visIcon} me-1"></i>${escHtml(m.visibility)}</span>`;

    return `
    <tr class="supv-mod-row-${escHtml(m.visibility)}">
      <td><code style="font-size:11px">${escHtml(m.key)}</code></td>
      <td style="font-size:12px">${escHtml(m.label)}</td>
      <td><span class="supv-badge supv-badge-legacy">${escHtml(m.group_key)}</span></td>
      <td>${statusBadge}</td>
      <td>${visBadge}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-edit-module="${escHtml(m.id)}" style="font-size:11px;padding:2px 8px">
          <i class="bi bi-pencil"></i>
        </button>
      </td>
    </tr>`;
  }).join('');

  // Listener édition
  document.getElementById('configModulesBody').querySelectorAll('[data-edit-module]').forEach(btn => {
    btn.addEventListener('click', () => openModuleModal(btn.dataset.editModule));
  });
}

function populateGroupSelects() {
  const options = state.groups.map(g =>
    `<option value="${escHtml(g.key)}">${escHtml(g.label)}</option>`
  ).join('');

  document.getElementById('configGroupFilter').innerHTML =
    `<option value="all">Tous les groupes</option>${options}`;
  document.getElementById('modalModuleGroup').innerHTML = options;
  document.getElementById('modalSessionModule').innerHTML =
    state.modules.map(m => `<option value="${escHtml(m.key)}">${escHtml(m.label)}</option>`).join('');
}

function openModuleModal(id) {
  const m = state.modules.find(x => x.id === id);
  if (!m) return;
  state.editModuleId = id;
  document.getElementById('modalModuleId').value          = m.id;
  document.getElementById('modalModuleKey').value         = m.key;
  document.getElementById('modalModuleLabel2').value      = m.label;
  document.getElementById('modalModuleDesc').value        = m.description || '';
  document.getElementById('modalModuleIcon').value        = m.icon || '';
  document.getElementById('modalModuleColor').value       = m.color || '#000000';
  document.getElementById('modalModuleGroup').value       = m.group_key;
  document.getElementById('modalModuleStatus').value      = m.status;
  document.getElementById('modalModuleVisibility').value  = m.visibility;
  document.getElementById('modalModulePosition').value    = m.position || 1;
  document.getElementById('modalModulePath').value        = m.path || '';
  document.getElementById('modalModuleLabel').textContent = `Éditer — ${m.label}`;
  document.getElementById('modalModuleError').classList.add('d-none');
  state.modModalInst.show();
}

async function saveModule() {
  const id = document.getElementById('modalModuleId').value;
  const patch = {
    label      : document.getElementById('modalModuleLabel2').value.trim(),
    description: document.getElementById('modalModuleDesc').value.trim(),
    icon       : document.getElementById('modalModuleIcon').value.trim(),
    color      : document.getElementById('modalModuleColor').value,
    group_key  : document.getElementById('modalModuleGroup').value,
    status     : document.getElementById('modalModuleStatus').value,
    visibility : document.getElementById('modalModuleVisibility').value,
    position   : parseInt(document.getElementById('modalModulePosition').value, 10) || 1,
    path       : document.getElementById('modalModulePath').value.trim(),
  };

  if (!patch.label) {
    document.getElementById('modalModuleError').textContent = 'Le libellé est obligatoire.';
    document.getElementById('modalModuleError').classList.remove('d-none');
    return;
  }

  const btn = document.getElementById('btnSaveModule');
  btn.disabled = true;
  btn.innerHTML = '<span class="supv-spin me-1"></span>Enregistrement…';

  const { error } = await DB().from('app_modules').update(patch).eq('id', id);

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';

  if (error) {
    document.getElementById('modalModuleError').textContent = error.message;
    document.getElementById('modalModuleError').classList.remove('d-none');
    return;
  }

  state.modModalInst.hide();
  showToast(`Module "${patch.label}" mis à jour.`, 'success');
  await loadConfig();
}

// ════════════════════════════════════════════════════════════
// ONGLET SESSIONS
// ════════════════════════════════════════════════════════════

async function loadSessions() {
  setSessionsState('loading');
  try {
    const { data, error } = await DB()
      .from('supervision_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    state.sessions = data || [];
    if (!state.sessions.length) { setSessionsState('empty'); return; }
    setSessionsState('data');
    renderSessions();
  } catch (err) {
    document.getElementById('sessionsErrorMsg').textContent = err.message;
    setSessionsState('error');
  }
}

function setSessionsState(s) {
  document.getElementById('sessionsLoading').classList.toggle('d-none', s !== 'loading');
  document.getElementById('sessionsEmpty').classList.toggle('d-none', s !== 'empty');
  document.getElementById('sessionsError').classList.toggle('d-none', s !== 'error');
  document.getElementById('sessionsList').classList.toggle('d-none', s !== 'data');
}

function renderSessions() {
  const statusLabel = { planned: 'Planifiée', done: 'Terminée', cancelled: 'Annulée' };
  document.getElementById('sessionsBody').innerHTML = state.sessions.map(s => {
    const badge = s.status === 'done'
      ? `<span class="supv-badge supv-badge-ok">${statusLabel[s.status]}</span>`
      : s.status === 'planned'
      ? `<span class="supv-badge supv-badge-info">${statusLabel[s.status]}</span>`
      : `<span class="supv-badge supv-badge-legacy">${statusLabel[s.status]}</span>`;
    const date = new Date(s.created_at).toLocaleDateString('fr-FR', {
      day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'
    });
    return `
    <div class="supv-session-row status-${escHtml(s.status)}">
      <span class="supv-session-meta">${escHtml(date)}</span>
      <span class="fw-semibold" style="min-width:120px;font-size:12px">${escHtml(s.module_key)}</span>
      <span style="flex:1;font-size:12px">${escHtml(s.objective)}</span>
      ${badge}
    </div>`;
  }).join('');
}

async function saveSession() {
  const module_key = document.getElementById('modalSessionModule').value;
  const objective  = document.getElementById('modalSessionObjective').value.trim();
  const status     = document.getElementById('modalSessionStatus').value;
  const notes      = document.getElementById('modalSessionNotes').value.trim();

  if (!objective) {
    document.getElementById('modalSessionError').textContent = 'L\'objectif est obligatoire.';
    document.getElementById('modalSessionError').classList.remove('d-none');
    return;
  }

  const btn = document.getElementById('btnSaveSession');
  btn.disabled = true;

  const { error } = await DB().from('supervision_sessions').insert({
    module_key,
    objective,
    status,
    notes     : notes || null,
    created_by: window.bdbUser?.id || null,
  });

  btn.disabled = false;

  if (error) {
    document.getElementById('modalSessionError').textContent = error.message;
    document.getElementById('modalSessionError').classList.remove('d-none');
    return;
  }

  state.sessModalInst.hide();
  showToast('Session enregistrée.', 'success');
  await loadSessions();
}

document.getElementById('btnNewSession').addEventListener('click', () => {
  document.getElementById('modalSessionObjective').value = '';
  document.getElementById('modalSessionNotes').value     = '';
  document.getElementById('modalSessionError').classList.add('d-none');
  document.getElementById('modalSessionPrompt').classList.add('d-none');
  if (!state.modules.length) loadConfig().then(() => state.sessModalInst.show());
  else state.sessModalInst.show();
});

function generatePrompt() {
  const moduleKey = document.getElementById('modalSessionModule').value;
  const objective = document.getElementById('modalSessionObjective').value.trim();
  const mod = state.modules.find(m => m.key === moduleKey);
  const label = mod ? mod.label : moduleKey;

  const prompt = `MODULE EN COURS     : ${label}
OBJECTIF SESSION    : ${objective || '[à définir]'}
FICHIERS IN SCOPE   : modules/${moduleKey}/index.html · css/${moduleKey}-ui.css
FICHIERS HORS SCOPE : bdb-shell.js · supabase-client.js · tous autres modules

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker
  [ ] CTX_${moduleKey.toUpperCase()}.md
  [ ] modules/${moduleKey}/index.html

Règles actives (CHANTIER_TECHNIQUE V1.0.6) :
${state.rules.filter(r => r.rule_type === 'violation').map(r => `  - ${r.rule_key} : ${r.rule_label}`).join('\n')}`;

  document.getElementById('modalSessionPromptBox').textContent = prompt;
  document.getElementById('modalSessionPrompt').classList.remove('d-none');
}

function copyPrompt() {
  const text = document.getElementById('modalSessionPromptBox').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btnCopyPrompt');
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié !';
    setTimeout(() => { btn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copier'; }, 2500);
  });
}

// ════════════════════════════════════════════════════════════
// ONGLET ERREURS 404
// ════════════════════════════════════════════════════════════

function diagnosic404(url) {
  if (!url) return { label: 'URL inconnue', cls: 'supv-badge-err', priority: 3 };
  const path = url.replace(/https?:\/\/[^/]+/, '');

  const modMatch = path.match(/\/modules\/([^/]+)\//);
  if (modMatch) {
    const slug = modMatch[1]; // ex: carnet-bord (tiret — convention fichiers)
    // Chercher dans app_modules via le champ path (pas la key)
    const matchByPath = state.modules.find(m =>
      m.path && m.path.includes(`/modules/${slug}/`)
    );
    if (state.modules.length) {
      if (matchByPath) {
        return { label: 'Module référencé — fichier absent sur OVH', cls: 'supv-badge-err', priority: 2 };
      }
      return { label: `Module "${escHtml(slug)}" non référencé dans app_modules`, cls: 'supv-badge-warn', priority: 1 };
    }
  }

  if (path.match(/\.(css|js|png|jpg|svg|ico|woff2?)$/i)) {
    return { label: 'Ressource statique manquante', cls: 'supv-badge-warn', priority: 1 };
  }

  if (path.match(/\/supervision\//)) {
    return { label: 'Chemin incorrect — doit être /modules/supervision/', cls: 'supv-badge-warn', priority: 1 };
  }

  return { label: 'Ressource introuvable', cls: 'supv-badge-err', priority: 2 };
}

// Crawl des liens internes depuis les logs 404
function buildCrawlMap() {
  const internalRefs = {};
  state.erreurs.forEach(e => {
    if (!e.referrer) return;
    const refPath = e.referrer.replace(/https?:\/\/[^/]+/, '');
    const urlPath = (e.requested_url || '').replace(/https?:\/\/[^/]+/, '');
    if (!internalRefs[refPath]) internalRefs[refPath] = [];
    if (!internalRefs[refPath].includes(urlPath)) internalRefs[refPath].push(urlPath);
  });
  return internalRefs;
}

function renderCrawlSection() {
  const crawl = buildCrawlMap();
  const pages = Object.keys(crawl);
  if (!pages.length) return '';

  const rows = pages.sort().map(page => {
    const broken = crawl[page];
    return `
    <tr>
      <td><code style="font-size:10px">${escHtml(page || '—')}</code></td>
      <td style="font-size:11px">${broken.map(b => `<code style="font-size:10px;background:#fde8e8;padding:1px 4px;border-radius:3px">${escHtml(b)}</code>`).join(' ')}</td>
      <td><span class="supv-badge supv-badge-err">${escHtml(String(broken.length))}</span></td>
    </tr>`;
  }).join('');

  return `
  <div class="supv-section-label mt-4">Cartographie des liens cassés — pages sources</div>
  <div class="supv-config-card mb-4">
    <table class="table table-sm mb-0">
      <thead>
        <tr>
          <th style="font-size:11px">Page source (referrer)</th>
          <th style="font-size:11px">Liens cassés trouvés</th>
          <th style="font-size:11px">Nb</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

async function loadErreurs() {
  setErrState('loading');
  try {
    const { data, error } = await DB()
      .from('error_404_logs')
      .select('id, requested_url, referrer, user_agent, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    state.erreurs = data || [];
    if (!state.erreurs.length) {
      document.getElementById('erreursGroupes').innerHTML = '';
      document.getElementById('erreursBody').innerHTML    = '';
      document.getElementById('erreursIaPanel').classList.add('d-none');
      setErrState('empty');
      return;
    }
    setErrState('data');
    document.getElementById('btnAnalyseIA').disabled = false;
    renderErreursKpis();
    renderErreurs();
  } catch (err) {
    document.getElementById('erreursErrorMsg').textContent = err.message;
    setErrState('error');
  }
}

function setErrState(s) {
  if (s !== 'data') {
    document.getElementById('erreursGroupes').innerHTML = '';
    document.getElementById('erreursBody').innerHTML    = '';
  }
  document.getElementById('erreursLoading').classList.toggle('d-none', s !== 'loading');
  document.getElementById('erreursEmpty').classList.toggle('d-none', s !== 'empty');
  document.getElementById('erreursError').classList.toggle('d-none', s !== 'error');
  document.getElementById('erreursContent').classList.toggle('d-none', s !== 'data');
}

function renderErreursKpis() {
  const e = state.erreurs;
  const urls = new Set(e.map(x => x.requested_url));
  const refs = e.filter(x => x.referrer && x.referrer.trim()).length;
  const internal = e.filter(x => x.referrer && x.referrer.includes(window.location.hostname || 'manuelrohaut')).length;
  const last = e[0] ? new Date(e[0].created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }) : '—';
  document.getElementById('kpi404Total').textContent     = e.length;
  document.getElementById('kpi404Urls').textContent      = urls.size;
  document.getElementById('kpi404Referrers').textContent = refs;
  document.getElementById('kpi404Derniere').textContent  = last;
  // KPI liens internes cassés (priorité haute)
  const kpiInt = document.getElementById('kpi404Internal');
  if (kpiInt) kpiInt.textContent = internal;
}

function renderErreurs() {
  const filter = state.erreursFilter;
  const filtered = state.erreurs.filter(e => {
    if (filter === 'no-referrer')   return !e.referrer || !e.referrer.trim();
    if (filter === 'with-referrer') return e.referrer && e.referrer.trim();
    return true;
  });

  if (!filtered.length) {
    document.getElementById('erreursGroupes').innerHTML =
      '<div class="supv-state"><i class="bi bi-funnel supv-state-icon"></i><div class="supv-state-msg">Aucune erreur pour ce filtre</div></div>';
    document.getElementById('erreursBody').innerHTML = '';
    return;
  }

  // Groupes par URL
  const groups = {};
  filtered.forEach(e => {
    const key = e.requested_url || 'URL inconnue';
    if (!groups[key]) groups[key] = { url: key, count: 0, referrers: new Set(), last: e.created_at };
    groups[key].count++;
    if (e.referrer && e.referrer.trim()) groups[key].referrers.add(e.referrer);
    if (e.created_at > groups[key].last) groups[key].last = e.created_at;
  });

  const sorted = Object.values(groups).sort((a, b) => b.count - a.count);

  document.getElementById('erreursGroupes').innerHTML = sorted.map(g => {
    const diag = diagnosic404(g.url);
    const path = g.url.replace(/https?:\/\/[^/]+/, '') || g.url;
    const refs = [...g.referrers].slice(0, 3);
    const lastDate = new Date(g.last).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return `
    <div class="supv-config-card mb-2">
      <div class="supv-config-card-hdr">
        <span class="supv-badge supv-badge-err">${escHtml(String(g.count))}×</span>
        <code class="supv-config-card-title" style="font-size:11px">${escHtml(path)}</code>
        <span class="supv-badge ${escHtml(diag.cls)} ms-auto">${escHtml(diag.label)}</span>
      </div>
      <div style="padding:6px 14px;font-size:11px;color:#6b7280">
        <i class="bi bi-clock me-1"></i>Dernière : ${escHtml(lastDate)}
        ${refs.length ? `&nbsp;·&nbsp;<i class="bi bi-box-arrow-in-right me-1"></i>Referrers : ${refs.map(r => `<code style="font-size:10px">${escHtml(r.replace(/https?:\/\/[^/]+/, ''))}</code>`).join(', ')}` : '&nbsp;·&nbsp;<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Aucun referrer — accès direct ou lien externe</span>'}
      </div>
    </div>`;
  }).join('') + renderCrawlSection();

  // Détail chronologique
  document.getElementById('erreursBody').innerHTML = filtered.slice(0, 100).map(e => {
    const diag = diagnosic404(e.requested_url);
    const path = (e.requested_url || '').replace(/https?:\/\/[^/]+/, '') || e.requested_url || '—';
    const ref  = e.referrer ? e.referrer.replace(/https?:\/\/[^/]+/, '') : '—';
    const date = new Date(e.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return `
    <tr>
      <td style="font-family:monospace;font-size:10px;white-space:nowrap">${escHtml(date)}</td>
      <td><code style="font-size:10px">${escHtml(path)}</code></td>
      <td style="font-size:11px;color:#9ca3af">${ref === '—' ? '<span class="text-warning">—</span>' : `<code style="font-size:10px">${escHtml(ref)}</code>`}</td>
      <td><span class="supv-badge ${escHtml(diag.cls)}" style="font-size:9px">${escHtml(diag.label)}</span></td>
    </tr>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════
// ONGLET AUDIT — Gouvernance DATA_MODEL + DEPENDENCY_MAP
// ════════════════════════════════════════════════════════════

// Tables documentées dans SUPABASE_DATA_MODEL_V1_5_0
const AUDIT_DOC_TABLES = [
  'profiles','profiles_directory','user_roles',
  'content_types','categories','tags','tag_links','tag_suggestions',
  'content_images','content_relations',
  'glossaire','glossaire_suggestions',
  'fiches_intervention','anatomie','installation_patient','cours',
  'preferences_chirurgien','transmissions',
  'materiel','materiel_types','zones_anatomiques','zones_stockage','etageres',
  'casaques','gants',
  'app_groups','app_modules',
  'carnet_categories','carnet_items','carnet_progressions',
  'livret_secteurs','livret_encadrement','livret_objectifs_items','livret_progression',
  'objectifs_semaines','objectifs_criteres','objectifs_evaluations',
  'error_404_logs',
  'supervision_config','supervision_rules','supervision_rule_delta','supervision_sessions'
];

// Tables "à créer" — documentées mais pas encore en base (légitimes)
const AUDIT_TO_CREATE = ['carnet_categories','carnet_items','carnet_progressions'];

// Tables consommées par module selon MODULE_DEPENDENCY_MAP_V1_4_0
const AUDIT_DEP_MAP = {
  fiches:       ['fiches_intervention','categories','content_images','content_types','profiles_directory','tag_links','tags','content_relations','tag_suggestions'],
  arsenal:      ['materiel','materiel_types','etageres','zones_stockage','zones_anatomiques','casaques','gants','content_images','tags'],
  annuaire:     ['profiles_directory','profiles','user_roles','casaques','gants','preferences_chirurgien'],
  transmissions:['transmissions','categories','content_images','content_types','profiles_directory','tag_links','tags'],
  anatomie:     ['anatomie','zones_anatomiques','categories','content_images','content_types','profiles_directory','tag_links','tags','user_roles'],
  cours:        ['cours','categories','content_images','content_types','profiles_directory','tag_links','tags','user_roles'],
  installation: ['installation_patient','fiches_intervention','content_relations','categories','content_images','content_types','profiles_directory','tag_links'],
  preferences:  ['preferences_chirurgien','fiches_intervention','profiles_directory','tag_links','tags','user_roles'],
  admin:        ['categories','content_types','profiles_directory','tags','transmissions','user_roles','materiel_types','zones_anatomiques','zones_stockage','etageres'],
  supervision:  ['supervision_config','supervision_rules','supervision_rule_delta','supervision_sessions','app_modules','app_groups']
};

const auditState = {
  realTables: [],   // résultat paste tables
  rlsData:    [],   // résultat paste RLS
  srcTables:  {},   // résultat paste PowerShell
  scores:     {},   // résultats par contrôle
  activeSubTab: 'tables'
};

function initAudit() {
  // Sous-navigation
  document.getElementById('auditSubNav').addEventListener('click', e => {
    const btn = e.target.closest('.supv-audit-sub');
    if (!btn) return;
    document.querySelectorAll('.supv-audit-sub').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['tables','rls','cross','powershell'].forEach(t => {
      document.getElementById(`auditTab-${t}`).classList.toggle('d-none', t !== btn.dataset.subtab);
    });
    auditState.activeSubTab = btn.dataset.subtab;
  });

  // Copie SQL
  document.querySelectorAll('.supv-copy-sql').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const text = document.getElementById(target).textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      });
    });
  });

  // Boutons analyser
  document.getElementById('btnRunTables').addEventListener('click', runAuditTables);
  document.getElementById('btnRunRls').addEventListener('click', runAuditRls);
  document.getElementById('btnRunCross').addEventListener('click', runAuditCross);
  document.getElementById('btnRunPs').addEventListener('click', runAuditPs);
}

function renderAuditModeBanner() {
  const warn = document.getElementById('auditModeWarning');
  if (warn) warn.classList.toggle('d-none', state.isLocal);
}

// ── Helpers rendu findings ──────────────────────────────────

function auditFinding(level, icon, msg, detail) {
  const cls = level === 'error' ? 'fv' : level === 'warn' ? 'fw' : 'fok';
  return `<div class="supv-finding ${cls}">
    <span class="supv-finding-icon">${icon}</span>
    <span>${msg}${detail ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${detail}</div>` : ''}</span>
  </div>`;
}

function auditRenderFindings(container, findings, scoreKey) {
  const errors = findings.filter(f => f.level === 'error').length;
  const warns  = findings.filter(f => f.level === 'warn').length;
  auditState.scores[scoreKey] = { errors, warns, ok: findings.filter(f => f.level === 'ok').length };
  document.getElementById(container).innerHTML = findings.map(f =>
    auditFinding(f.level, f.icon, f.msg, f.detail)
  ).join('') || auditFinding('ok', '✅', 'Aucun problème détecté', '');
  updateAuditKpis();
}

function updateAuditKpis() {
  const allScores = Object.values(auditState.scores);
  const totalErrors = allScores.reduce((s, x) => s + x.errors, 0);
  const totalWarns  = allScores.reduce((s, x) => s + x.warns,  0);
  const passed = Object.keys(auditState.scores).length;
  const maxScore = 4;

  const scoreEl = document.getElementById('auditKpiScore');
  const scoreVal = `${Math.min(passed, maxScore) - (totalErrors > 0 ? 1 : 0)}/${maxScore}`;
  if (scoreEl) { scoreEl.textContent = scoreVal; scoreEl.className = 'supv-kpi-n ' + (totalErrors ? 'text-danger' : totalWarns ? 'text-warning' : 'text-success'); }
  const errEl = document.getElementById('auditKpiErrors');
  if (errEl) errEl.textContent = totalErrors;
  const warnEl = document.getElementById('auditKpiWarns');
  if (warnEl) warnEl.textContent = totalWarns;
  const dateEl = document.getElementById('auditKpiDate');
  if (dateEl) dateEl.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ── Contrôle 1 : Tables en base ─────────────────────────────

function runAuditTables() {
  const raw = document.getElementById('pasteTables').value.trim();
  let data;
  try { data = JSON.parse(raw); } catch { showToast('JSON invalide', 'error'); return; }

  auditState.realTables = data.map(r => typeof r === 'string' ? r : r.table_name).filter(Boolean);
  const findings = [];
  findings.push({ level: 'ok', icon: '📊', msg: `<strong>${auditState.realTables.length} tables</strong> détectées en base`, detail: auditState.realTables.map(t => `<code style="font-size:10px;background:#f3f4f6;padding:1px 4px;border-radius:3px">${escHtml(t)}</code>`).join(' ') });
  auditRenderFindings('resultTables', findings, 'tables');
}

// ── Contrôle 2 : RLS ────────────────────────────────────────

function runAuditRls() {
  const raw = document.getElementById('pasteRls').value.trim();
  let data;
  try { data = JSON.parse(raw); } catch { showToast('JSON invalide', 'error'); return; }

  auditState.rlsData = data;
  const findings = [];
  // Tables dont deny-all est intentionnel — faux positifs à ignorer
  const RLS_INTENTIONAL_DENY = ['profiles', 'glossaire'];

  data.filter(r => r.rls === 'OFF' || r.rls === false).forEach(r => {
    findings.push({ level: 'error', icon: '🔓', msg: `Table <code>${escHtml(r.table_name)}</code> — RLS <strong>désactivé</strong>` });
  });
  data.filter(r => (r.rls === 'ON' || r.rls === true) && parseInt(r.nb_policies) === 0).forEach(r => {
    if (RLS_INTENTIONAL_DENY.includes(r.table_name)) {
      findings.push({ level: 'ok', icon: 'ℹ️', msg: `<code>${escHtml(r.table_name)}</code> — deny-all intentionnel (table auth interne ou sans données)` });
      return;
    }
    findings.push({ level: 'warn', icon: '⚠️', msg: `Table <code>${escHtml(r.table_name)}</code> — RLS ON mais <strong>0 politique</strong> → deny-all implicite` });
  });
  data.filter(r => (r.rls === 'ON' || r.rls === true) && parseInt(r.nb_policies) > 0).forEach(r => {
    findings.push({ level: 'ok', icon: '✅', msg: `<code>${escHtml(r.table_name)}</code> — ${escHtml(String(r.nb_policies))} politique(s)` });
  });

  auditRenderFindings('resultRls', findings, 'rls');
}

// ── Contrôle 3 : Cohérence doc/base ─────────────────────────

function runAuditCross() {
  if (!auditState.realTables.length) {
    showToast('Lance d\'abord "Tables Supabase"', 'warning');
    return;
  }
  const findings = [];
  const docSet  = new Set(AUDIT_DOC_TABLES);
  const realSet = new Set(auditState.realTables);

  // Dans doc, absente de la base
  [...docSet].filter(t => !realSet.has(t)).forEach(t => {
    const toCreate = AUDIT_TO_CREATE.includes(t);
    findings.push({
      level:  toCreate ? 'warn' : 'error',
      icon:   toCreate ? '⏳'   : '🚨',
      msg:    `<code>${escHtml(t)}</code> — documentée mais ${toCreate ? '<strong>pas encore créée</strong> (prévue)' : '<strong>absente en base</strong> → hallucination ou suppression non documentée'}`
    });
  });

  // En base, absente du doc
  [...realSet].filter(t => !docSet.has(t)).forEach(t => {
    findings.push({ level: 'warn', icon: '📥', msg: `<code>${escHtml(t)}</code> — en base mais <strong>non documentée</strong> dans DATA_MODEL → omission` });
  });

  // OK
  [...docSet].filter(t => realSet.has(t)).forEach(t => {
    findings.push({ level: 'ok', icon: '✅', msg: `<code>${escHtml(t)}</code> — documentée et présente en base` });
  });

  auditRenderFindings('resultCross', findings, 'cross');
}

// ── Contrôle 4 : PowerShell / Dependency Map ────────────────

function runAuditPs() {
  const raw = document.getElementById('pastePs').value.trim();
  let data;
  try { data = JSON.parse(raw); } catch { showToast('JSON invalide', 'error'); return; }

  auditState.srcTables = data;
  const findings = [];

  Object.entries(AUDIT_DEP_MAP).forEach(([mod, docTables]) => {
    const srcTables = data[mod] || [];
    if (!srcTables.length) {
      findings.push({ level: 'warn', icon: '❓', msg: `<strong>${escHtml(mod)}</strong> — aucune table trouvée dans le code (module non scanné ?)` });
      return;
    }
    const docSet = new Set(docTables);
    const srcSet = new Set(srcTables);
    const onlySrc = [...srcSet].filter(t => !docSet.has(t));
    const onlyDoc = [...docSet].filter(t => !srcSet.has(t));
    if (onlySrc.length) {
      findings.push({ level: 'error', icon: '🚨', msg: `<strong>${escHtml(mod)}</strong> — tables dans le code mais <strong>non documentées</strong>`,
        detail: onlySrc.map(t => `<code style="font-size:10px;background:#fde8e8;padding:1px 4px;border-radius:3px">${escHtml(t)}</code>`).join(' ') });
    }
    if (onlyDoc.length) {
      findings.push({ level: 'warn', icon: '📄', msg: `<strong>${escHtml(mod)}</strong> — tables documentées mais absentes du code`,
        detail: onlyDoc.map(t => `<code style="font-size:10px;background:#fef3c7;padding:1px 4px;border-radius:3px">${escHtml(t)}</code>`).join(' ') });
    }
    if (!onlySrc.length && !onlyDoc.length) {
      findings.push({ level: 'ok', icon: '✅', msg: `<strong>${escHtml(mod)}</strong> — aligné`,
        detail: [...srcSet].map(t => `<code style="font-size:10px;background:#def7ec;padding:1px 4px;border-radius:3px">${escHtml(t)}</code>`).join(' ') });
    }
  });

  // Modules dans code non documentés
  Object.keys(data).filter(mod => !AUDIT_DEP_MAP[mod]).forEach(mod => {
    findings.push({ level: 'warn', icon: '📥', msg: `Module <strong>${escHtml(mod)}</strong> trouvé dans le code mais absent de la DEPENDENCY_MAP` });
  });

  auditRenderFindings('resultPs', findings, 'ps');
}

async function analyseErreursIA() {
  const panel  = document.getElementById('erreursIaPanel');
  const result = document.getElementById('erreursIaResult');
  const status = document.getElementById('erreursIaStatus');

  // Préparer le contexte
  const groups = {};
  state.erreurs.forEach(e => {
    const k = (e.requested_url || '').replace(/https?:\/\/[^/]+/, '') || '?';
    if (!groups[k]) groups[k] = { count: 0, referrers: new Set() };
    groups[k].count++;
    if (e.referrer) groups[k].referrers.add(
      e.referrer.replace(/https?:\/\/[^/]+/, '')
    );
  });

  const topUrls = Object.entries(groups)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 30)
    .map(([url, g]) => `${g.count}× ${url}${g.referrers.size ? ` (depuis: ${[...g.referrers].slice(0,2).join(', ')})` : ''}`)
    .join('\n');

  const modules = state.modules.map(m => `${m.key} → ${m.path} [${m.status}]`).join('\n');

  const prompt = `Tu es un expert en audit de site web BDB (Bible de Bloc — app hospitalière HTML/JS vanilla + Supabase).

Convention de nommage BDB :
- Dossiers de modules : tiret (modules/carnet-bord/index.html)
- Clés Supabase : underscore (carnet_bord)

30 URLs les plus fréquentes dans les logs 404 (count× chemin (depuis: referrer)) :
${topUrls}

Modules référencés dans app_modules (key → path [status]) :
${modules}

Analyse ces erreurs 404 et réponds en français avec :
1. Causes probables groupées par type
2. Actions prioritaires (max 5, classées par impact)
3. Faux positifs à ignorer
Sois concis et factuel. Pas d'introduction.`;

  panel.classList.remove('d-none');
  result.textContent = prompt;
  status.textContent = 'Prêt à copier';
  status.className = 'supv-badge supv-badge-info ms-auto';
}

async function purgeErreurs() {
  if (!state.isAdmin && !state.isLocal) return;
  if (!confirm('Supprimer tous les logs 404 ? Cette action est irréversible.')) return;
  const { error } = await DB()
    .from('error_404_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // supprimer tout
  if (error) {
    showToast('Erreur purge : ' + error.message, 'error');
    return;
  }
  state.erreurs = [];
  document.getElementById('erreursGroupes').innerHTML = '';
  document.getElementById('erreursBody').innerHTML    = '';
  setErrState('empty');
  showToast('Logs 404 purgés.', 'success');
}


