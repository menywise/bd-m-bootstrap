/* ============================================================================
   doctrine-app.js — Module L3 atelier/doctrine/
   Application complète : guard · chargement DB · render arbre · édition ·
   sauvegarde atomique · export MD/JSON · offcanvas FAB(3R).
   CDS : aucun onclick inline · aucun style inline · escHtml partout ·
         3 états (loading/empty/error) · un seul fichier JS métier.
   ============================================================================ */

'use strict';

/* ---------- HELPERS ---------- */

function escHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function $(id) { return document.getElementById(id); }

function toast(msg, kind) {
  kind = kind || 'success';
  const map = { success:'text-bg-success', danger:'text-bg-danger', warning:'text-bg-warning', info:'text-bg-info' };
  const el = document.createElement('div');
  el.className = 'toast align-items-center ' + (map[kind] || map.success) + ' border-0';
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.innerHTML =
    '<div class="d-flex">' +
      '<div class="toast-body">' + escHtml(msg) + '</div>' +
      '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>' +
    '</div>';
  $('toastContainer').appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 3500 });
  t.show();
  el.addEventListener('hidden.bs.toast', function() { el.remove(); });
}

function showState(which) {
  ['stateLoading', 'stateError', 'stateEmpty', 'treeRoot'].forEach(function(id) {
    const el = $(id);
    if (!el) return;
    if (id === which) el.classList.remove('d-none');
    else el.classList.add('d-none');
  });
}

/* ---------- ÉTAT APPLICATION ---------- */

const STATE = {
  tree: null,              // arbre racine { id, titre, children: [...] }
  focusedId: 'root',       // zoom actif
  editingId: null,         // id en cours d'édition inline
  search: '',
  currentOffcanvasNodeId: null,
  dirty: false             // modifications non persistées
};

let offcanvasInstance = null;

/* ---------- ACCÈS AUX NŒUDS ---------- */

function findNodeById(id, root) {
  root = root || STATE.tree;
  if (!root) return null;
  if (root.id === id) return root;
  if (!root.children || !root.children.length) return null;
  for (let i = 0; i < root.children.length; i++) {
    const r = findNodeById(id, root.children[i]);
    if (r) return r;
  }
  return null;
}

function findParent(id, root) {
  root = root || STATE.tree;
  if (!root || !root.children) return null;
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === id) return root;
    const r = findParent(id, root.children[i]);
    if (r) return r;
  }
  return null;
}

function generateId() {
  return 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function markDirty() {
  STATE.dirty = true;
  const s = $('saveStatus');
  if (s) {
    s.textContent = 'modifications non sauvegardées';
    s.classList.remove('text-success');
    s.classList.add('text-warning');
  }
}

function markClean() {
  STATE.dirty = false;
  const s = $('saveStatus');
  if (s) {
    s.textContent = 'sauvegardé';
    s.classList.remove('text-warning');
    s.classList.add('text-success');
  }
}

/* ---------- RENDER ---------- */

function renderTree() {
  const root = $('treeRoot');
  if (!root || !STATE.tree) return;
  showState('treeRoot');
  root.innerHTML = '';
  const focused = STATE.focusedId && STATE.focusedId !== 'root'
    ? findNodeById(STATE.focusedId) || STATE.tree
    : STATE.tree;
  root.appendChild(renderNode(focused, 0, focused === STATE.tree));
  renderBreadcrumb();
}

function renderBreadcrumb() {
  const wrap = $('breadcrumbWrap');
  const list = $('breadcrumbList');
  if (!wrap || !list) return;
  if (STATE.focusedId === 'root') {
    wrap.classList.add('d-none');
    return;
  }
  wrap.classList.remove('d-none');
  list.innerHTML = '';
  // Reconstituer le chemin racine → focused
  const path = [];
  let cursor = findNodeById(STATE.focusedId);
  while (cursor) {
    path.unshift(cursor);
    cursor = findParent(cursor.id);
  }
  path.unshift(STATE.tree);
  path.forEach(function(n, idx) {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item' + (idx === path.length - 1 ? ' active' : '');
    if (idx === path.length - 1) {
      li.textContent = n.titre;
    } else {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = idx === 0 ? 'Doctrine' : (n.abbrev || n.titre);
      a.dataset.zoomId = n.id;
      li.appendChild(a);
    }
    list.appendChild(li);
  });
}

function renderNode(node, depth, isRoot) {
  const wrap = document.createElement('div');
  wrap.className = 'dtree-node';
  if (node.statut) wrap.classList.add('dtree-status-' + node.statut);
  wrap.dataset.nodeId = node.id;

  const row = document.createElement('div');
  row.className = 'dtree-node-row';
  if ((node.titre || '').indexOf('★') === 0) row.classList.add('dtree-star');
  if (STATE.search && matchSearch(node, STATE.search)) row.classList.add('dtree-match');

  const hasChildren = node.children && node.children.length;

  // Toggle (plier/déplier)
  const btnToggle = document.createElement('button');
  btnToggle.type = 'button';
  btnToggle.className = 'dtree-btn-toggle';
  btnToggle.title = hasChildren ? (node.collapsed ? 'Déplier' : 'Replier') : '';
  btnToggle.innerHTML = hasChildren
    ? '<i class="bi bi-caret-' + (node.collapsed ? 'right' : 'down') + '-fill"></i>'
    : '<i class="bi bi-dot"></i>';
  if (!hasChildren) btnToggle.disabled = true;
  btnToggle.dataset.action = 'toggle';
  row.appendChild(btnToggle);

  // Zoom
  const btnZoom = document.createElement('button');
  btnZoom.type = 'button';
  btnZoom.className = 'dtree-btn-zoom';
  btnZoom.title = 'Zoomer sur ce nœud';
  btnZoom.innerHTML = '<i class="bi bi-circle-fill dtree-zoom-dot"></i>';
  btnZoom.dataset.action = 'zoom';
  row.appendChild(btnZoom);

  // Titre + abbrev + attribution
  const title = document.createElement('span');
  title.className = 'dtree-title';
  title.dataset.action = 'edit';
  let html = '';
  if (node.abbrev) html += '<span class="dtree-abbrev">[' + escHtml(node.abbrev) + ']</span> ';
  html += escHtml(node.titre || '(sans titre)');
  if (node.attribution) html += '<span class="dtree-attribution">— ' + escHtml(node.attribution) + '</span>';
  if (node.note) html += ' <i class="bi bi-sticky-fill dtree-badge-note" title="Note"></i>';
  if (node.realite || node.fonction || node.avantage || node.benefice || node.risque || node.resultat || node.recommandation) {
    html += ' <i class="bi bi-diagram-3-fill dtree-badge-fab" title="FAB(3R) rempli"></i>';
  }
  title.innerHTML = html;
  row.appendChild(title);

  // Actions ligne
  const btnRow = document.createElement('span');
  btnRow.className = 'dtree-btn-row';
  btnRow.innerHTML =
    '<button type="button" class="dtree-btn-add-child"   data-action="add-child"  title="Ajouter un enfant"><i class="bi bi-plus-lg"></i></button>' +
    '<button type="button" class="dtree-btn-add-sibling" data-action="add-sibling"title="Ajouter un frère"><i class="bi bi-arrow-return-left"></i></button>' +
    '<button type="button" class="dtree-btn-fab"         data-action="offcanvas" title="FAB(3R) + Note + Méta"><i class="bi bi-three-dots"></i></button>' +
    '<button type="button" class="dtree-btn-del"         data-action="delete"    title="Supprimer"><i class="bi bi-x-lg"></i></button>';
  row.appendChild(btnRow);

  wrap.appendChild(row);

  // Enfants
  if (hasChildren && !node.collapsed) {
    const kids = document.createElement('div');
    kids.className = 'dtree-children';
    node.children.forEach(function(c) { kids.appendChild(renderNode(c, depth + 1, false)); });
    wrap.appendChild(kids);
  }

  return wrap;
}

function matchSearch(node, q) {
  q = q.toLowerCase();
  return (node.titre && node.titre.toLowerCase().indexOf(q) >= 0)
      || (node.abbrev && node.abbrev.toLowerCase().indexOf(q) >= 0)
      || (node.note && node.note.toLowerCase().indexOf(q) >= 0);
}

/* ---------- ÉVÉNEMENTS ARBRE ---------- */

function onTreeClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) {
    // Breadcrumb zoom
    const bc = e.target.closest('[data-zoom-id]');
    if (bc) {
      e.preventDefault();
      STATE.focusedId = bc.dataset.zoomId;
      renderTree();
    }
    return;
  }
  const nodeEl = target.closest('[data-node-id]');
  if (!nodeEl) return;
  const nodeId = nodeEl.dataset.nodeId;
  const node = findNodeById(nodeId);
  if (!node) return;
  const action = target.dataset.action;

  if (action === 'toggle') {
    node.collapsed = !node.collapsed;
    markDirty();
    renderTree();
  }
  else if (action === 'zoom') {
    STATE.focusedId = nodeId;
    renderTree();
  }
  else if (action === 'edit') {
    startInlineEdit(target, node);
  }
  else if (action === 'add-child') {
    addChildNode(node);
  }
  else if (action === 'add-sibling') {
    addSiblingNode(node);
  }
  else if (action === 'delete') {
    deleteNode(node);
  }
  else if (action === 'offcanvas') {
    openOffcanvas(node);
  }
}

function startInlineEdit(titleEl, node) {
  if (STATE.editingId) return;
  STATE.editingId = node.id;
  titleEl.textContent = node.titre || '';
  titleEl.setAttribute('contenteditable', 'true');
  titleEl.focus();
  // Sélectionner tout le contenu
  const range = document.createRange();
  range.selectNodeContents(titleEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function finish(save) {
    const newVal = (titleEl.textContent || '').trim();
    titleEl.removeAttribute('contenteditable');
    STATE.editingId = null;
    titleEl.removeEventListener('blur', onBlur);
    titleEl.removeEventListener('keydown', onKey);
    if (save && newVal && newVal !== node.titre) {
      node.titre = newVal;
      markDirty();
    }
    renderTree();
  }
  function onBlur() { finish(true); }
  function onKey(e2) {
    if (e2.key === 'Enter') { e2.preventDefault(); finish(true); }
    else if (e2.key === 'Escape') { e2.preventDefault(); finish(false); }
  }
  titleEl.addEventListener('blur', onBlur);
  titleEl.addEventListener('keydown', onKey);
}

function addChildNode(node) {
  if (!node.children) node.children = [];
  const n = { id: generateId(), titre: '', children: [], collapsed: false };
  node.children.push(n);
  node.collapsed = false;
  markDirty();
  renderTree();
  // Focus édition
  setTimeout(function() {
    const el = document.querySelector('[data-node-id="' + n.id + '"] .dtree-title');
    if (el) startInlineEdit(el, n);
  }, 50);
}

function addSiblingNode(node) {
  const parent = findParent(node.id);
  if (!parent) return;
  const idx = parent.children.indexOf(node);
  const n = { id: generateId(), titre: '', children: [], collapsed: false };
  parent.children.splice(idx + 1, 0, n);
  markDirty();
  renderTree();
  setTimeout(function() {
    const el = document.querySelector('[data-node-id="' + n.id + '"] .dtree-title');
    if (el) startInlineEdit(el, n);
  }, 50);
}

function deleteNode(node) {
  if (node.id === 'root') { toast('Impossible de supprimer la racine.', 'warning'); return; }
  const msg = 'Supprimer « ' + (node.titre || '(sans titre)') + ' » et ses '
    + (node.children ? node.children.length : 0) + ' enfant(s) ?';
  if (!confirm(msg)) return;
  const parent = findParent(node.id);
  if (!parent) return;
  const idx = parent.children.indexOf(node);
  parent.children.splice(idx, 1);
  markDirty();
  renderTree();
}

/* ---------- OFFCANVAS FAB(3R) + NOTE + MÉTA ---------- */

function openOffcanvas(node) {
  STATE.currentOffcanvasNodeId = node.id;
  $('nodeOffcanvasTitle').textContent = node.titre || '(sans titre)';
  $('nodeOffcanvasPath').textContent = buildPath(node);

  // Note
  $('fldNote').value = node.note || '';
  // FAB(3R)
  $('fldRealite').value = node.realite || '';
  $('fldFonction').value = node.fonction || '';
  $('fldAvantage').value = node.avantage || '';
  $('fldBenefice').value = node.benefice || '';
  $('fldRisque').value = node.risque || '';
  $('fldResultat').value = node.resultat || '';
  $('fldRecommandation').value = node.recommandation || '';
  // Méta
  $('fldAbbrev').value = node.abbrev || '';
  $('fldAttribution').value = node.attribution || '';
  $('fldCategorie').value = node.categorie || '';
  $('fldMarqueur').value = node.marqueur || '';
  $('fldStatut').value = node.statut || 'active';
  $('fldRefPrincipe').value = node.ref_principe || '';

  if (!offcanvasInstance) {
    offcanvasInstance = new bootstrap.Offcanvas($('nodeOffcanvas'));
  }
  offcanvasInstance.show();
}

function buildPath(node) {
  const path = [];
  let cursor = node;
  while (cursor) {
    path.unshift(cursor.titre || '(sans titre)');
    cursor = findParent(cursor.id);
  }
  return path.join(' › ');
}

function applyOffcanvasChanges() {
  const node = findNodeById(STATE.currentOffcanvasNodeId);
  if (!node) return;
  const fields = {
    note:            $('fldNote').value.trim(),
    realite:         $('fldRealite').value.trim(),
    fonction:        $('fldFonction').value.trim(),
    avantage:        $('fldAvantage').value.trim(),
    benefice:        $('fldBenefice').value.trim(),
    risque:          $('fldRisque').value.trim(),
    resultat:        $('fldResultat').value.trim(),
    recommandation:  $('fldRecommandation').value.trim(),
    abbrev:          $('fldAbbrev').value.trim(),
    attribution:     $('fldAttribution').value.trim(),
    categorie:       $('fldCategorie').value,
    marqueur:        $('fldMarqueur').value || null,
    statut:          $('fldStatut').value,
    ref_principe:    $('fldRefPrincipe').value.trim()
  };
  let changed = false;
  Object.keys(fields).forEach(function(k) {
    const v = fields[k] || null;
    if ((node[k] || null) !== v) {
      node[k] = v;
      changed = true;
    }
  });
  if (changed) { markDirty(); renderTree(); }
}

/* ---------- EXPAND / COLLAPSE ALL ---------- */

function setCollapsedAll(collapsed) {
  function walk(n) {
    if (n.children && n.children.length) {
      n.collapsed = collapsed;
      n.children.forEach(walk);
    }
  }
  if (STATE.tree) {
    STATE.tree.collapsed = false;  // racine toujours ouverte
    if (STATE.tree.children) STATE.tree.children.forEach(walk);
  }
  markDirty();
  renderTree();
}

/* ---------- EXPORT MD / JSON ---------- */

function exportMd() {
  if (!STATE.tree) return;
  const lines = [];
  lines.push('# Doctrine BDB · export Markdown');
  lines.push('');
  lines.push('> Exporté le ' + new Date().toISOString());
  lines.push('');

  function walk(node, depth) {
    const indent = '  '.repeat(Math.max(0, depth - 1));
    const prefix = depth === 0 ? '# ' : (depth === 1 ? '## ' : (depth === 2 ? '### ' : indent + '- '));
    let line = prefix + (node.titre || '(sans titre)');
    if (node.abbrev) line += ' `' + node.abbrev + '`';
    if (node.attribution) line += ' — _' + node.attribution + '_';
    lines.push(line);
    if (node.note) lines.push('\n' + node.note.split('\n').map(function(l) { return '> ' + l; }).join('\n') + '\n');
    if (node.children && node.children.length) node.children.forEach(function(c) { walk(c, depth + 1); });
  }
  walk(STATE.tree, 0);
  downloadBlob(lines.join('\n'), 'doctrine-bdb-' + dateStr() + '.md', 'text/markdown');
}

function exportJson() {
  if (!STATE.tree) return;
  downloadBlob(JSON.stringify(STATE.tree, null, 2), 'doctrine-bdb-' + dateStr() + '.json', 'application/json');
}

function dateStr() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

/* ---------- SUPABASE : FETCH / SAVE ---------- */

async function fetchFromDb() {
  showState('stateLoading');
  try {
    const { data, error } = await window.bdb.rpc('atelier_doctrine_fetch');
    if (error) throw error;
    if (data && data.empty) {
      showState('stateEmpty');
      STATE.tree = null;
      return;
    }
    STATE.tree = data.tree;
    if (!STATE.tree) { showState('stateEmpty'); return; }
    STATE.focusedId = 'root';
    markClean();
    renderTree();
    toast('Doctrine chargée (' + (data.count || 0) + ' nœuds).', 'success');
  } catch (e) {
    console.error('fetchFromDb', e);
    $('stateErrorMsg').textContent = (e && e.message) || 'Erreur de chargement.';
    showState('stateError');
  }
}

async function saveToDb() {
  if (!STATE.tree) { toast('Aucun arbre à sauvegarder.', 'warning'); return; }
  const btn = $('btnSave');
  const prev = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sauvegarde…';
  try {
    const { data, error } = await window.bdb.rpc('atelier_doctrine_save', { p_tree: STATE.tree });
    if (error) throw error;
    markClean();
    toast('Doctrine sauvegardée (' + (data.count || 0) + ' nœuds).', 'success');
  } catch (e) {
    console.error('saveToDb', e);
    toast((e && e.message) || 'Erreur de sauvegarde.', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = prev;
  }
}

async function initFromSeed() {
  if (!window.DOCTRINE_SEED) { toast('Seed embarqué introuvable.', 'danger'); return; }
  STATE.tree = deepClone(window.DOCTRINE_SEED);
  STATE.focusedId = 'root';
  markDirty();
  renderTree();
  toast('Arbre initialisé depuis le seed. Sauvegardez pour persister.', 'info');
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

async function resetToSeed() {
  if (!confirm('Réinitialiser l\'arbre au seed embarqué ? Les modifications non sauvegardées seront perdues.')) return;
  initFromSeed();
}

/* ---------- INIT ---------- */

async function init() {
  // Attendre que le shell ait exposé window.bdbUser
  const waitShell = new Promise(function(resolve) {
    if (window.bdbUser) return resolve();
    document.addEventListener('bdbShellReady', resolve, { once: true });
    // Fallback : si bdbShellReady n'est jamais émis, on attend bdbUser
    let attempts = 0;
    const iv = setInterval(function() {
      attempts++;
      if (window.bdbUser) { clearInterval(iv); resolve(); }
      else if (attempts > 40) { clearInterval(iv); resolve(); } // 10s max
    }, 250);
  });
  await waitShell;

  // GUARD isCreator — L3 strict
  if (!window.bdbUser || !window.bdbUser.isCreator) {
    $('guardDenied').classList.remove('d-none');
    $('creatorContent').classList.add('d-none');
    return;
  }
  $('guardDenied').classList.add('d-none');
  $('creatorContent').classList.remove('d-none');

  // Wire events
  wireEvents();

  // Tentative de chargement depuis la base
  await fetchFromDb();
}

function wireEvents() {
  // Arbre : délégation globale
  $('treeRoot').addEventListener('click', onTreeClick);
  $('breadcrumbList').addEventListener('click', onTreeClick);

  // Toolbar
  $('btnReload').addEventListener('click', function() {
    if (STATE.dirty && !confirm('Modifications non sauvegardées. Recharger quand même ?')) return;
    fetchFromDb();
  });
  $('btnSave').addEventListener('click', saveToDb);
  $('btnExpandAll').addEventListener('click', function() { setCollapsedAll(false); });
  $('btnCollapseAll').addEventListener('click', function() { setCollapsedAll(true); });
  $('btnExportMd').addEventListener('click', exportMd);
  $('btnExportJson').addEventListener('click', exportJson);
  $('btnResetSeed').addEventListener('click', resetToSeed);
  $('btnRetry').addEventListener('click', fetchFromDb);
  $('btnSeedFromLocal').addEventListener('click', initFromSeed);

  // Search
  let searchTimer = null;
  $('searchInput').addEventListener('input', function(e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
      STATE.search = e.target.value;
      renderTree();
    }, 180);
  });

  // Offcanvas — enregistrement à la fermeture
  $('nodeOffcanvas').addEventListener('hide.bs.offcanvas', applyOffcanvasChanges);

  // Confirmation fermeture page si dirty
  window.addEventListener('beforeunload', function(e) {
    if (STATE.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
