/* ================================================================
   boite-a-idees.js — CollabKit — Bible de Bloc
   CDS Compliant | escHtml | 3 états UI | Supabase
   Migration 091 — Arbitrage A4 validé 2026-04-05
   Remplace : localStorage CK_* (context.js / storage.js / projects.js)
   RÈGLE-WORKFLOW-01 : tout contenu → draft → validation admin → active
   ================================================================ */

'use strict';

const DB = window.bdb;

// ── État global ────────────────────────────────────────────────────
const state = {
  userId:           null,
  isAdmin:          false,
  categories:       [],
  projects:         [],
  currentProjectId: null,
  ideas:            [],           // idées du projet courant (actives + brouillons visibles)
  votes:            [],           // votes sur les idées du projet courant
  userVotes:        new Set(),    // Set(idea_id) — votes de l'utilisateur courant
  activeTab:        'brainstorm'
};


// ── Shell ──────────────────────────────────────────────────────────
function initFromShell() {
  const u = window.bdbUser;
  state.userId  = u.id;
  state.isAdmin = u.isAdmin;
  if (state.isAdmin) {
    document.getElementById('collabToolbarAdminSlot').classList.remove('d-none');
    const notice = document.getElementById('collabProjectDraftNotice');
    if (notice) notice.classList.add('d-none');
  }
}

// ── Toast ──────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const toastEl   = document.getElementById('collabToast');
  const toastBody = document.getElementById('collabToastBody');
  if (!toastEl || !toastBody) return;
  toastEl.className = `toast align-items-center border-0 text-bg-${type}`;
  toastBody.textContent = message;
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
}

// ── UI — 3 états ───────────────────────────────────────────────────
function showLoading() {
  document.getElementById('loadingState').classList.remove('d-none');
  document.getElementById('emptyState').classList.add('d-none');
  document.getElementById('errorState').classList.add('d-none');
  document.getElementById('collabContent').classList.add('d-none');
}

function showEmpty() {
  document.getElementById('loadingState').classList.add('d-none');
  document.getElementById('emptyState').classList.remove('d-none');
  document.getElementById('errorState').classList.add('d-none');
  document.getElementById('collabContent').classList.add('d-none');
}

function showError(msg) {
  document.getElementById('loadingState').classList.add('d-none');
  document.getElementById('emptyState').classList.add('d-none');
  document.getElementById('collabContent').classList.add('d-none');
  const errorEl = document.getElementById('errorState');
  errorEl.classList.remove('d-none');
  errorEl.innerHTML = `
    <div class="text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-danger d-block mb-2"></i>
      <p class="text-muted">${escHtml(msg)}</p>
      <button class="btn btn-outline-primary btn-sm mt-2" id="btnRetry" type="button">
        <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
      </button>
    </div>`;
  document.getElementById('btnRetry')?.addEventListener('click', () => {
    if (state.currentProjectId) loadIdeasAndVotes();
    else loadProjects();
  });
}

function showContent() {
  document.getElementById('loadingState').classList.add('d-none');
  document.getElementById('emptyState').classList.add('d-none');
  document.getElementById('errorState').classList.add('d-none');
  document.getElementById('collabContent').classList.remove('d-none');
}

// ── Tabs ───────────────────────────────────────────────────────────
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.boite-a-idees-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
    btn.setAttribute('aria-selected', String(btn.dataset.tab === tab));
  });
  document.querySelectorAll('.boite-a-idees-pane').forEach(pane => {
    pane.classList.toggle('d-none', pane.id !== 'pane-' + tab);
  });
  if (tab === 'matrix') renderMatrix();
  if (tab === 'report') renderReport();
  if (tab === 'vote')   renderVoteList();
}

// ── Catégories ─────────────────────────────────────────────────────
async function loadCategories() {
  const { data, error } = await DB
    .from('collab_categories')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw new Error('Catégories : ' + error.message);
  state.categories = data || [];
  renderCategorySelect('selectIdeaCategory');
}

function renderCategorySelect(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return;
  el.innerHTML = state.categories.map(c =>
    `<option value="${escHtml(c.id)}">${escHtml(c.emoji)} ${escHtml(c.label)}</option>`
  ).join('');
}

// ── Projets ────────────────────────────────────────────────────────
async function loadProjects() {
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_collab').select('*');
    const demoProject = { id: 'demo-collab-project', title: 'Amélioration des protocoles BDB', status: 'active', created_by: null };
    state.projects = [demoProject];
    state.currentProjectId = demoProject.id;
    renderProjectSelect();
    state.ideas = (data || []).map(item => ({ ...item, project_id: demoProject.id, collab_categories: null, user_id: null }));
    state.votes = [];
    state.userVotes = new Set();
    showContent();
    renderBrainstorm();
    return;
  }
  showLoading();
  const { data, error } = await DB
    .from('collab_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showError('Impossible de charger les projets : ' + error.message);
    return;
  }

  state.projects = data || [];
  renderProjectSelect();

  // Auto-sélection du premier projet actif
  const first = state.projects.find(p => p.status === 'active');
  if (first) {
    await switchProject(first.id);
  } else {
    showEmpty();
  }
}

function renderProjectSelect() {
  const sel = document.getElementById('collabProjectSelect');
  if (!sel) return;
  const visible = state.projects.filter(p =>
    p.status === 'active'
    || p.created_by === state.userId
    || state.isAdmin
  );
  sel.innerHTML = '<option value="">— Sélectionner un projet —</option>' +
    visible.map(p =>
      `<option value="${escHtml(p.id)}" ${p.id === state.currentProjectId ? 'selected' : ''}>
        ${escHtml(p.title)}${p.status === 'draft' ? ' [en attente]' : ''}${p.status === 'archived' ? ' [archivé]' : ''}
      </option>`
    ).join('');
}

async function switchProject(projectId) {
  if (!projectId) {
    state.currentProjectId = null;
    showEmpty();
    return;
  }
  state.currentProjectId = projectId;
  const sel = document.getElementById('collabProjectSelect');
  if (sel) sel.value = projectId;
  await loadIdeasAndVotes();
}

// ── Idées + Votes (chargement combiné) ────────────────────────────
async function loadIdeasAndVotes() {
  showLoading();
  try {
    // 1. Idées du projet courant
    const { data: ideasData, error: ideasError } = await DB
      .from('collab_ideas')
      .select('*, collab_categories(id, label, emoji, color)')
      .eq('project_id', state.currentProjectId)
      .order('created_at', { ascending: false });

    if (ideasError) throw new Error(ideasError.message);
    state.ideas   = ideasData || [];
    state.votes    = [];
    state.userVotes = new Set();

    // 2. Votes (seulement si des idées existent)
    if (state.ideas.length > 0) {
      const ideaIds = state.ideas.map(i => i.id);
      const { data: votesData } = await DB
        .from('collab_votes')
        .select('*')
        .in('idea_id', ideaIds);
      state.votes = votesData || [];
      state.userVotes = new Set(
        state.votes.filter(v => v.user_id === state.userId).map(v => v.idea_id)
      );
    }

    showContent();
    renderBrainstorm();
  } catch (err) {
    showError(err.message);
  }
}

// ── Brainstorming ──────────────────────────────────────────────────
function renderBrainstorm() {
  const activeIdeas    = state.ideas.filter(i => i.status === 'active');
  const draftIdeas     = state.ideas.filter(i => i.status === 'draft');
  const pendingSection = document.getElementById('collabPendingSection');
  const pendingGrid    = document.getElementById('collabPendingIdeas');
  const grid           = document.getElementById('collabIdeasGrid');

  // Section brouillons (admin seulement)
  if (state.isAdmin && draftIdeas.length > 0) {
    pendingSection.classList.remove('d-none');
    pendingGrid.innerHTML = draftIdeas.map(idea => renderIdeaCard(idea, true)).join('');
  } else {
    pendingSection.classList.add('d-none');
    if (pendingGrid) pendingGrid.innerHTML = '';
  }

  // Grille idées actives
  if (activeIdeas.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-lightbulb fs-3 d-block mb-2"></i>
        <p>Aucune idée validée pour ce projet. Ajoutez la première !</p>
      </div>`;
  } else {
    grid.innerHTML = activeIdeas.map(idea => renderIdeaCard(idea, false)).join('');
  }
}

function renderIdeaCard(idea, isPending) {
  const cat   = idea.collab_categories;
  const votes = countVotesFor(idea.id);
  const voted = state.userVotes.has(idea.id);

  const badge = cat
    ? `<span class="badge bg-${escHtml(cat.color)} mb-2 d-inline-block">${escHtml(cat.emoji)} ${escHtml(cat.label)}</span>`
    : '';

  const actions = isPending
    ? `<button class="btn btn-sm btn-success" type="button"
               data-action="validate-idea" data-idea-id="${escHtml(idea.id)}"
               title="Valider l'idée">
         <i class="bi bi-check-lg"></i>
       </button>
       <button class="btn btn-sm btn-outline-danger" type="button"
               data-action="delete-idea" data-idea-id="${escHtml(idea.id)}"
               title="Rejeter l'idée">
         <i class="bi bi-x-lg"></i>
       </button>`
    : `<button class="btn btn-sm ${voted ? 'btn-primary' : 'btn-outline-primary'}" type="button"
               data-action="toggle-vote" data-idea-id="${escHtml(idea.id)}"
               title="${voted ? 'Retirer mon vote' : 'Voter pour cette idée'}">
         <i class="bi bi-hand-thumbs-up${voted ? '-fill' : ''}"></i>
       </button>
       ${state.isAdmin
         ? `<button class="btn btn-sm btn-outline-danger" type="button"
                    data-action="delete-idea" data-idea-id="${escHtml(idea.id)}"
                    title="Supprimer">
              <i class="bi bi-trash"></i>
            </button>`
         : ''}`;

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 collab-idea-card${isPending ? ' collab-card-pending' : ''}">
        <div class="card-body">
          ${badge}
          <p class="card-text">${escHtml(idea.content)}</p>
        </div>
        <div class="card-footer bg-transparent d-flex justify-content-between align-items-center gap-2">
          <span class="collab-vote-count">
            <i class="bi bi-hand-thumbs-up me-1"></i>${votes}
          </span>
          <div class="d-flex gap-1">${actions}</div>
        </div>
      </div>
    </div>`;
}

// ── Vote ───────────────────────────────────────────────────────────
function renderVoteList() {
  const listEl  = document.getElementById('listVotes');
  const countEl = document.getElementById('collabVoteCount');
  const active  = state.ideas.filter(i => i.status === 'active');
  const total   = state.userVotes.size;
  countEl.textContent = total + ' vote' + (total > 1 ? 's' : '');

  if (active.length === 0) {
    listEl.innerHTML = `
      <div class="list-group-item text-muted text-center py-4">
        <i class="bi bi-lightbulb me-2"></i>Aucune idée validée à voter
      </div>`;
    return;
  }

  const sorted = [...active].sort((a, b) => countVotesFor(b.id) - countVotesFor(a.id));

  listEl.innerHTML = sorted.map(idea => {
    const cat   = idea.collab_categories;
    const votes = countVotesFor(idea.id);
    const voted = state.userVotes.has(idea.id);
    return `
      <div class="list-group-item d-flex justify-content-between align-items-center py-3">
        <div class="flex-grow-1 me-3">
          ${cat ? `<span class="badge bg-${escHtml(cat.color)} me-2">${escHtml(cat.emoji)}</span>` : ''}
          <span>${escHtml(idea.content)}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-secondary">${votes}</span>
          <button class="btn btn-sm ${voted ? 'btn-primary' : 'btn-outline-primary'}" type="button"
                  data-action="toggle-vote" data-idea-id="${escHtml(idea.id)}"
                  title="${voted ? 'Retirer mon vote' : 'Voter'}">
            <i class="bi bi-hand-thumbs-up${voted ? '-fill' : ''}"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

function countVotesFor(ideaId) {
  return state.votes.filter(v => v.idea_id === ideaId).length;
}

async function toggleVote(ideaId) {
  if (state.userVotes.has(ideaId)) {
    const { error } = await DB
      .from('collab_votes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', state.userId)
      .select();
    if (error) { showToast("Le retrait du vote n'a pu aboutir — réessayez", 'danger'); return; }
    state.userVotes.delete(ideaId);
    state.votes = state.votes.filter(v => !(v.idea_id === ideaId && v.user_id === state.userId));
  } else {
    const { data, error } = await DB
      .from('collab_votes')
      .insert({ idea_id: ideaId, user_id: state.userId })
      .select();
    if (error) { showToast("Le vote n'a pu être enregistré — réessayez", 'danger'); return; }
    if (data?.[0]) state.votes.push(data[0]);
    state.userVotes.add(ideaId);
  }
  if (state.activeTab === 'brainstorm') renderBrainstorm();
  if (state.activeTab === 'vote')       renderVoteList();
}

// ── Matrix ─────────────────────────────────────────────────────────
function renderMatrix() {
  const quadrants = ['high-easy', 'high-hard', 'low-easy', 'low-hard'];
  const active    = state.ideas.filter(i => i.status === 'active');

  // Deck (non classés)
  const deckEl    = document.getElementById('list-deck');
  const unclassed = active.filter(i => !i.quadrant);
  deckEl.innerHTML = unclassed.length > 0
    ? unclassed.map(renderDragCard).join('')
    : '<p class="text-muted small text-center py-3 mb-0">Glissez les idées dans les quadrants →</p>';

  // Quadrants
  quadrants.forEach(q => {
    const el = document.getElementById('list-' + q);
    if (!el) return;
    const ideas = active.filter(i => i.quadrant === q);
    el.innerHTML = ideas.map(renderDragCard).join('');
  });

  bindDragDrop();
}

function renderDragCard(idea) {
  const votes = countVotesFor(idea.id);
  return `
    <div class="card mb-2 collab-drag-card" draggable="true"
         data-idea-id="${escHtml(idea.id)}">
      <div class="card-body p-2">
        <p class="collab-text-sm mb-1">${escHtml(idea.content)}</p>
        <small class="text-muted">
          <i class="bi bi-hand-thumbs-up me-1"></i>${votes}
        </small>
      </div>
    </div>`;
}

function bindDragDrop() {
  // Cards draggables
  document.querySelectorAll('.boite-a-idees-drag-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.ideaId);
      card.classList.add('collab-dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('collab-dragging');
    });
  });

  // Zones de dépôt
  document.querySelectorAll('.boite-a-idees-dropzone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('collab-drag-hover');
    });
    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('collab-drag-hover');
      }
    });
    zone.addEventListener('drop', async e => {
      e.preventDefault();
      zone.classList.remove('collab-drag-hover');
      const ideaId   = e.dataTransfer.getData('text/plain');
      const quadrant = zone.dataset.quadrant || null;
      await updateQuadrant(ideaId, quadrant);
    });
  });
}

async function updateQuadrant(ideaId, quadrant) {
  const { error } = await DB
    .from('collab_ideas')
    .update({ quadrant: quadrant })
    .eq('id', ideaId)
    .select();
  if (error) { showToast("La mise à jour n'a pu aboutir — réessayez", 'danger'); return; }
  const idea = state.ideas.find(i => i.id === ideaId);
  if (idea) idea.quadrant = quadrant;
  renderMatrix();
}

// ── Rapport ────────────────────────────────────────────────────────
function renderReport() {
  const reportEl = document.getElementById('collabReport');
  const sorted   = state.ideas
    .filter(i => i.status === 'active')
    .map(i => ({ ...i, voteCount: countVotesFor(i.id) }))
    .sort((a, b) => b.voteCount - a.voteCount);

  if (sorted.length === 0) {
    reportEl.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-file-earmark-text fs-3 d-block mb-2"></i>
        <p>Aucune idée validée à reporter.</p>
      </div>`;
    return;
  }

  const totalVotes = state.votes.length;
  const classified = sorted.filter(i => i.quadrant).length;
  const qLabels    = {
    'high-easy': '⚡ Quick Win',
    'high-hard': '🚀 Stratégique',
    'low-easy':  '📅 À planifier',
    'low-hard':  '🗑️ À éviter'
  };

  reportEl.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card collab-stat-card text-center">
          <div class="card-body py-3">
            <div class="collab-stat-badge">${sorted.length}</div>
            <small class="text-muted">Idées</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card collab-stat-card text-center">
          <div class="card-body py-3">
            <div class="collab-stat-badge">${totalVotes}</div>
            <small class="text-muted">Votes</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card collab-stat-card text-center">
          <div class="card-body py-3">
            <div class="collab-stat-badge">${state.categories.length}</div>
            <small class="text-muted">Catégories</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card collab-stat-card text-center">
          <div class="card-body py-3">
            <div class="collab-stat-badge">${classified}</div>
            <small class="text-muted">Classées</small>
          </div>
        </div>
      </div>
    </div>
    <h6 class="text-muted text-uppercase small mb-3 fw-semibold">Classement par votes</h6>
    <div class="table-responsive">
      <table class="table table-hover table-sm align-middle">
        <thead class="table-light">
          <tr>
            <th class="collab-col-rank">#</th>
            <th>Idée</th>
            <th class="collab-col-cat">Catégorie</th>
            <th class="collab-col-votes text-center">Votes</th>
            <th class="collab-col-quadrant">Quadrant</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((idea, idx) => {
            const cat = idea.collab_categories;
            return `
              <tr>
                <td class="text-muted fw-bold">${idx + 1}</td>
                <td>${escHtml(idea.content)}</td>
                <td>${cat
                  ? `<span class="badge bg-${escHtml(cat.color)}">${escHtml(cat.emoji)}</span>`
                  : '—'}</td>
                <td class="text-center"><strong>${idea.voteCount}</strong></td>
                <td class="text-muted small">${idea.quadrant ? (qLabels[idea.quadrant] || '—') : '—'}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function exportMarkdown() {
  const project = state.projects.find(p => p.id === state.currentProjectId);
  const sorted  = state.ideas
    .filter(i => i.status === 'active')
    .map(i => ({ ...i, voteCount: countVotesFor(i.id) }))
    .sort((a, b) => b.voteCount - a.voteCount);

  const date   = new Date().toLocaleDateString('fr-FR');
  const qNames = {
    'high-easy': 'Quick Win',
    'high-hard': 'Stratégique',
    'low-easy':  'À planifier',
    'low-hard':  'À éviter'
  };

  let md  = `# CollabKit — ${project?.title || 'Rapport'}\n`;
  md     += `_Généré le ${date} — ${sorted.length} idées — ${state.votes.length} votes_\n\n`;
  md     += `## Classement par votes\n\n`;

  sorted.forEach((idea, i) => {
    const cat = idea.collab_categories;
    let line  = `${i + 1}. **[${idea.voteCount} vote${idea.voteCount > 1 ? 's' : ''}]** ${idea.content}`;
    if (cat)           line += ` _(${cat.label})_`;
    if (idea.quadrant) line += ` → ${qNames[idea.quadrant]}`;
    md += line + '\n';
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `CollabKit_${(project?.title || 'rapport').replace(/\s+/g, '_')}_${date.replace(/\//g, '-')}.md`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ── Ajout d'une idée ───────────────────────────────────────────────
async function addIdea() {
  const input     = document.getElementById('inputIdea');
  const catSelect = document.getElementById('selectIdeaCategory');
  const content   = input.value.trim();
  if (!content)                { showToast("Décrivez votre idée pour pouvoir l'ajouter", 'warning'); return; }
  if (!state.currentProjectId) { showToast("Choisissez un projet pour associer cette idée", 'warning'); return; }

  const { data, error } = await DB
    .from('collab_ideas')
    .insert({
      project_id:  state.currentProjectId,
      content:     content,
      category_id: catSelect?.value || null,
      created_by:  state.userId,
      status:      state.isAdmin ? 'active' : 'draft',
      validated_by: state.isAdmin ? state.userId : null
    })
    .select('*, collab_categories(id, label, emoji, color)');

  if (error) { showToast("L'idée n'a pu être ajoutée — réessayez dans un instant", 'danger'); return; }
  if (data?.[0]) state.ideas.unshift(data[0]);
  input.value = '';
  showToast(
    state.isAdmin ? 'Idée ajoutée' : 'Idée soumise — en attente de validation',
    state.isAdmin ? 'success' : 'info'
  );
  renderBrainstorm();
}

// ── Validation / Suppression d'une idée ────────────────────────────
async function validateIdea(ideaId, fromAdmin = false) {
  const { error } = await DB
    .from('collab_ideas')
    .update({ status: 'active', validated_by: state.userId })
    .eq('id', ideaId)
    .select();
  if (error) { showToast("La validation n'a pu aboutir — réessayez", 'danger'); return; }
  const idea = state.ideas.find(i => i.id === ideaId);
  if (idea) idea.status = 'active';
  showToast("Idée validée — elle est maintenant visible", 'success');
  if (fromAdmin) renderAdminTab('pending-ideas');
  else           renderBrainstorm();
}

async function deleteIdea(ideaId, fromAdmin = false) {
  const { error } = await DB
    .from('collab_ideas')
    .delete()
    .eq('id', ideaId)
    .select();
  if (error) { showToast("La suppression n'a pu aboutir — réessayez", 'danger'); return; }
  state.ideas  = state.ideas.filter(i => i.id !== ideaId);
  state.votes  = state.votes.filter(v => v.idea_id !== ideaId);
  state.userVotes.delete(ideaId);
  showToast('Idée supprimée', 'success');
  if (fromAdmin) renderAdminTab('pending-ideas');
  else           renderBrainstorm();
}

// ── Création d'un projet ───────────────────────────────────────────
async function createProject() {
  const titleEl = document.getElementById('newProjectTitle');
  const descEl  = document.getElementById('newProjectDesc');
  const title   = titleEl?.value.trim();
  if (!title) { showToast("Un titre est nécessaire pour continuer", 'warning'); return; }

  const insertPayload = {
    title:        title,
    description:  descEl?.value.trim() || null,
    created_by:   state.userId,
    status:       state.isAdmin ? 'active' : 'draft',
    validated_by: state.isAdmin ? state.userId : null,
    validated_at: state.isAdmin ? new Date().toISOString() : null
  };

  const { data, error } = await DB
    .from('collab_projects')
    .insert(insertPayload)
    .select();

  if (error) { showToast("La création n'a pu aboutir — réessayez dans un instant", 'danger'); return; }
  if (data?.[0]) state.projects.unshift(data[0]);
  if (titleEl) titleEl.value = '';
  if (descEl)  descEl.value  = '';
  bootstrap.Modal.getInstance(document.getElementById('collabModalProject'))?.hide();
  renderProjectSelect();
  showToast(
    state.isAdmin ? 'Projet créé et publié' : 'Projet soumis — en attente de validation admin',
    state.isAdmin ? 'success' : 'info'
  );
}

// ── Admin — Panel ──────────────────────────────────────────────────
function openAdminPanel() {
  const modalEl = document.getElementById('collabModalAdmin');
  if (!modalEl) return;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
  renderAdminTab('pending-projects');
}

function renderAdminTab(tab) {
  document.querySelectorAll('[data-admin-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.adminTab === tab);
  });
  const container = document.getElementById('adminTabContent');
  if (!container) return;
  if (tab === 'pending-projects') renderAdminPendingProjects(container);
  if (tab === 'pending-ideas')    renderAdminPendingIdeas(container);
  if (tab === 'categories')       renderAdminCategories(container);
}

function renderAdminPendingProjects(container) {
  const pending = state.projects.filter(p => p.status === 'draft');
  if (pending.length === 0) {
    container.innerHTML = `
      <div class="alert alert-success py-2">
        <i class="bi bi-check-circle me-2"></i>Aucun projet en attente.
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="list-group">
      ${pending.map(p => `
        <div class="list-group-item d-flex justify-content-between align-items-start gap-3">
          <div>
            <strong>${escHtml(p.title)}</strong>
            ${p.description
              ? `<p class="mb-0 text-muted small mt-1">${escHtml(p.description)}</p>`
              : ''}
          </div>
          <div class="d-flex gap-2 flex-shrink-0">
            <button class="btn btn-sm btn-success" type="button"
                    data-action="validate-project" data-project-id="${escHtml(p.id)}">
              <i class="bi bi-check-lg me-1"></i>Valider
            </button>
            <button class="btn btn-sm btn-outline-danger" type="button"
                    data-action="delete-project" data-project-id="${escHtml(p.id)}">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

async function renderAdminPendingIdeas(container) {
  container.innerHTML = `
    <div class="text-center py-3 text-muted">
      <div class="spinner-border spinner-border-sm me-2"></div>Chargement…
    </div>`;

  const { data, error } = await DB
    .from('collab_ideas')
    .select('*, collab_categories(label, emoji, color), collab_projects(title)')
    .eq('status', 'draft')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="alert alert-success py-2">
        <i class="bi bi-check-circle me-2"></i>Aucune idée en attente.
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="list-group">
      ${data.map(idea => {
        const cat = idea.collab_categories;
        return `
          <div class="list-group-item d-flex justify-content-between align-items-start gap-3">
            <div>
              <small class="text-muted d-block mb-1">
                <i class="bi bi-folder me-1"></i>${escHtml(idea.collab_projects?.title || '—')}
              </small>
              <span>${escHtml(idea.content)}</span>
              ${cat
                ? `<span class="badge bg-${escHtml(cat.color)} ms-2">
                     ${escHtml(cat.emoji)} ${escHtml(cat.label)}
                   </span>`
                : ''}
            </div>
            <div class="d-flex gap-2 flex-shrink-0">
              <button class="btn btn-sm btn-success" type="button"
                      data-action="validate-idea"
                      data-idea-id="${escHtml(idea.id)}"
                      data-admin-context="true">
                <i class="bi bi-check-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" type="button"
                      data-action="delete-idea"
                      data-idea-id="${escHtml(idea.id)}"
                      data-admin-context="true">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderAdminCategories(container) {
  container.innerHTML = `
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title mb-3">Ajouter une catégorie</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" id="newCatLabel"
                   placeholder="Libellé" maxlength="50">
          </div>
          <div class="col-md-2">
            <input type="text" class="form-control" id="newCatEmoji"
                   placeholder="Emoji" maxlength="4">
          </div>
          <div class="col-md-3">
            <select class="form-select" id="newCatColor">
              ${['primary','secondary','success','danger','warning','info'].map(c =>
                `<option value="${c}">${c}</option>`
              ).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-success w-100" type="button"
                    data-action="add-category">
              <i class="bi bi-plus me-1"></i>Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="list-group">
      ${state.categories.map(cat => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <span class="badge bg-${escHtml(cat.color)} me-2">
            ${escHtml(cat.emoji)} ${escHtml(cat.label)}
          </span>
          <button class="btn btn-sm btn-outline-danger" type="button"
                  data-action="delete-category"
                  data-cat-id="${escHtml(cat.id)}"
                  ${state.categories.length <= 1 ? 'disabled' : ''}>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `).join('')}
    </div>`;
}

// ── Admin — validation / suppression projet ────────────────────────
async function validateProject(projectId) {
  const { error } = await DB
    .from('collab_projects')
    .update({ status: 'active', validated_by: state.userId, validated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select();
  if (error) { showToast("La validation du projet n'a pu aboutir — réessayez", 'danger'); return; }
  const p = state.projects.find(p => p.id === projectId);
  if (p) { p.status = 'active'; p.validated_by = state.userId; }
  renderProjectSelect();
  showToast("Projet validé et publié — l'équipe peut y contribuer", 'success');
  renderAdminTab('pending-projects');
}

async function deleteProject(projectId) {
  const { error } = await DB
    .from('collab_projects')
    .delete()
    .eq('id', projectId)
    .select();
  if (error) { showToast("La suppression n'a pu aboutir — réessayez", 'danger'); return; }
  state.projects = state.projects.filter(p => p.id !== projectId);
  if (state.currentProjectId === projectId) {
    state.currentProjectId = null;
    showEmpty();
  }
  renderProjectSelect();
  showToast('Projet supprimé', 'success');
  renderAdminTab('pending-projects');
}

// ── Admin — catégories ─────────────────────────────────────────────
async function addCategory() {
  const label = document.getElementById('newCatLabel')?.value.trim();
  const emoji = document.getElementById('newCatEmoji')?.value.trim() || '📌';
  const color = document.getElementById('newCatColor')?.value || 'secondary';
  if (!label) { showToast("Un libellé est nécessaire pour créer la catégorie", 'warning'); return; }

  const { data, error } = await DB
    .from('collab_categories')
    .insert({ label, emoji, color, order_index: state.categories.length + 1 })
    .select();
  if (error) { showToast("La catégorie n'a pu être ajoutée — réessayez", 'danger'); return; }
  if (data?.[0]) state.categories.push(data[0]);
  renderCategorySelect('selectIdeaCategory');
  renderAdminTab('categories');
  showToast('Catégorie ajoutée', 'success');
}

async function deleteCategory(catId) {
  if (state.categories.length <= 1) { showToast("Au moins une catégorie doit rester active", 'warning'); return; }
  const { error } = await DB
    .from('collab_categories')
    .delete()
    .eq('id', catId)
    .select();
  if (error) { showToast('Erreur suppression catégorie', 'danger'); return; }
  state.categories = state.categories.filter(c => c.id !== catId);
  renderCategorySelect('selectIdeaCategory');
  renderAdminTab('categories');
  showToast('Catégorie supprimée', 'success');
}

// ── Init ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();

  // Chargement référentiels
  try {
    await loadCategories();
  } catch (err) {
    showError('Impossible de charger les catégories : ' + err.message);
    return;
  }

  // Chargement projets (auto-sélection premier actif)
  await loadProjects();

  // ── Délégation d'événements ──────────────────────────────────────

  // Navigation onglets
  document.addEventListener('click', e => {
    const tabBtn = e.target.closest('.boite-a-idees-tab-btn');
    if (tabBtn) switchTab(tabBtn.dataset.tab);
  });

  // Sélection projet
  document.getElementById('collabProjectSelect').addEventListener('change', e => {
    switchProject(e.target.value || null);
  });

  // Nouveau projet (toolbar + état vide)
  document.getElementById('btnNewProject').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('collabModalProject')
    ).show();
  });
  document.getElementById('btnEmptyNewProject')?.addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('collabModalProject')
    ).show();
  });

  // Confirmation création projet
  document.getElementById('btnCreateProject').addEventListener('click', createProject);

  // Panneau admin
  document.getElementById('btnAdminPanel')?.addEventListener('click', openAdminPanel);

  // Onglets admin (délégation sur le modal)
  document.getElementById('collabModalAdmin').addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-admin-tab]');
    if (tabBtn) renderAdminTab(tabBtn.dataset.adminTab);
  });

  // Ajout idée
  document.getElementById('btnAddIdea').addEventListener('click', addIdea);
  document.getElementById('inputIdea').addEventListener('keydown', e => {
    if (e.key === 'Enter') addIdea();
  });

  // Export markdown
  document.getElementById('btnExportMd').addEventListener('click', exportMarkdown);

  // Délégation globale — actions sur cartes et panneaux admin
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action    = btn.dataset.action;
    const ideaId    = btn.dataset.ideaId;
    const projectId = btn.dataset.projectId;
    const catId     = btn.dataset.catId;
    const fromAdmin = btn.dataset.adminContext === 'true';

    switch (action) {
      case 'toggle-vote':      await toggleVote(ideaId);                    break;
      case 'validate-idea':    await validateIdea(ideaId, fromAdmin);       break;
      case 'delete-idea':      await deleteIdea(ideaId, fromAdmin);         break;
      case 'validate-project': await validateProject(projectId);            break;
      case 'delete-project':   await deleteProject(projectId);              break;
      case 'add-category':     await addCategory();                         break;
      case 'delete-category':  await deleteCategory(catId);                 break;
    }
  });
});
