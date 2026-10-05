/**
 * PROJECT  : Bible de Bloc (BDB)
 * FILE     : faq-app.js v3.0.0
 * MODULE   : modules/faq/
 * DATE     : 2026-04-06
 * AUTEUR   : Manu + Claude
 * DELTA    : v2→v3 — Toolbar CDS complète : recherche client-side + bouton
 *            "Poser une question" (draft membre, RÈGLE-WORKFLOW-01).
 *            CTA deeplinks contextuels depuis cta_label + cta_module_key.
 *            Chargement app_modules pour résolution des chemins.
 * DEPENDS  : bdb-shell.js (window.bdbUser, window.bdbShellReady), supabase-client.js
 */

'use strict';

// ── Constantes ────────────────────────────────────────────────────────────────

const FAQ_MODULES = [
  { key: 'general',       label: 'Questions générales',  icon: 'bi-person-circle'  },
  { key: 'fiches',        label: 'Protocoles & fiches',  icon: 'bi-file-medical'   },
  { key: 'transmissions', label: 'Transmissions',        icon: 'bi-chat-left-text' },
  { key: 'arsenal',       label: 'Matériel & arsenal',   icon: 'bi-box-seam'       },
  { key: 'annuaire',      label: 'Annuaire',             icon: 'bi-people'         },
  { key: 'cours',         label: 'Cours & formation',    icon: 'bi-mortarboard'    },
  { key: 'organisateur',  label: 'Organisateur',         icon: 'bi-list-ol'        }
];


// ── État ──────────────────────────────────────────────────────────────────────

const _state = {
  questions:     [],
  modulePathMap: {},   // key → chemin relatif résolu
  searchTerm:    '',
  activeTab:     FAQ_MODULES[0].key
};

// ── DOM ───────────────────────────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

function showState(state) {
  ['faqLoading', 'faqEmpty', 'faqError', 'faqContent'].forEach(id => {
    const el = $(id);
    if (el) el.classList.toggle('d-none', id !== state);
  });
}

// ── Résolution deeplink ───────────────────────────────────────────────────────

async function loadModulePaths() {
  try {
    const { data } = await window.bdb
      .from('app_modules')
      .select('key, path')
      .eq('status', 'active');
    (data || []).forEach(m => {
      // Chemin relatif depuis modules/faq/ vers modules/[key]/
      _state.modulePathMap[m.key] = `../${m.key}/index.html`;
    });
  } catch {
    // Non bloquant — les CTA seront absents si échec
  }
}

// ── Accordions ────────────────────────────────────────────────────────────────

function buildCta(q) {
  if (!q.cta_label || !q.cta_module_key) return '';
  const href = _state.modulePathMap[q.cta_module_key] || `../${escHtml(q.cta_module_key)}/index.html`;
  return `
    <div class="mt-3 pt-2 border-top text-end">
      <a href="${escHtml(href)}" class="btn btn-sm btn-module">
        ${escHtml(q.cta_label)}<i class="bi bi-arrow-right ms-1"></i>
      </a>
    </div>`;
}

function buildAccordion(questions, moduleKey) {
  const filtered = _state.searchTerm
    ? questions.filter(q => q.question.toLowerCase().includes(_state.searchTerm))
    : questions;

  if (!filtered.length) return `
    <div class="text-muted text-center py-4 faq-empty-search">
      <i class="bi bi-search fs-2 d-block mb-2 opacity-40"></i>
      <span>Aucun résultat pour cette recherche.</span>
    </div>`;

  const items = filtered.map((q, idx) => {
    const collapseId = `faq-panel-${escHtml(moduleKey)}-${idx}`;
    return `
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button"
            data-bs-toggle="collapse" data-bs-target="#${collapseId}">
            ${escHtml(q.question)}
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse"
          data-bs-parent="#faqAccordion-${escHtml(moduleKey)}">
          <div class="accordion-body">
            ${q.reponse}
            ${buildCta(q)}
          </div>
        </div>
      </div>`;
  }).join('');

  return `<div class="accordion mt-3" id="faqAccordion-${escHtml(moduleKey)}">${items}</div>`;
}

// ── Rendu onglets ─────────────────────────────────────────────────────────────

function renderTabs() {
  const tabsEl   = $('faqTabs');
  const contentEl= $('faqTabContent');
  if (!tabsEl || !contentEl) return;

  const rubriques = FAQ_MODULES.filter(m =>
    _state.questions.some(q => q.module_key === m.key)
  );

  if (!rubriques.length) { showState('faqEmpty'); return; }

  tabsEl.innerHTML = rubriques.map((m, idx) => `
    <li class="nav-item" role="presentation">
      <button class="nav-link${idx === 0 ? ' active' : ''}"
        id="tab-${escHtml(m.key)}"
        data-bs-toggle="tab"
        data-bs-target="#panel-${escHtml(m.key)}"
        type="button" role="tab">
        <i class="bi ${escHtml(m.icon)} me-1 d-none d-sm-inline"></i>${escHtml(m.label)}
      </button>
    </li>`).join('');

  contentEl.innerHTML = rubriques.map((m, idx) => `
    <div class="tab-pane fade${idx === 0 ? ' show active' : ''}"
      id="panel-${escHtml(m.key)}" role="tabpanel">
      ${buildAccordion(_state.questions.filter(q => q.module_key === m.key), m.key)}
    </div>`).join('');

  showState('faqContent');

  tabsEl.addEventListener('shown.bs.tab', e => {
    const id = e.target?.id?.replace('tab-', '');
    if (id) _state.activeTab = id;
    refreshActivePanel();
  });
}

function refreshActivePanel() {
  // Re-render uniquement le panneau actif pour la recherche
  const m   = FAQ_MODULES.find(x => x.key === _state.activeTab);
  const panel = $(`panel-${_state.activeTab}`);
  if (!m || !panel) return;
  const qs = _state.questions.filter(q => q.module_key === m.key);
  panel.innerHTML = buildAccordion(qs, m.key);
}

// ── Recherche ─────────────────────────────────────────────────────────────────

function bindSearch() {
  const input = $('faqSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    _state.searchTerm = input.value.trim().toLowerCase();
    refreshActivePanel();
  });
}

// ── Modale "Poser une question" ───────────────────────────────────────────────

function buildModalQuestion() {
  if ($('modalFaqQuestion')) return; // déjà créée
  const el = document.createElement('div');
  el.className = 'modal fade';
  el.id = 'modalFaqQuestion';
  el.tabIndex = -1;
  el.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header modal-header-module">
          <h5 class="modal-title">
            <i class="bi bi-question-circle me-2"></i>Poser une question
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-3">
            Ta question sera soumise à l'équipe. Elle apparaîtra dans la FAQ après validation.
          </p>
          <div id="faqQuestionSuccess" class="d-none text-center py-3">
            <i class="bi bi-check-circle text-success fs-2 d-block mb-2"></i>
            <p class="fw-semibold mb-1">Question envoyée !</p>
            <p class="text-muted small">L'équipe va l'examiner et y répondre.</p>
          </div>
          <div id="faqQuestionForm">
            <div class="mb-3">
              <label class="form-label form-label-sm fw-semibold">Ta question *</label>
              <input type="text" class="form-control form-control-sm" id="faqQInput"
                maxlength="200" placeholder="Formule ta question clairement…"/>
            </div>
            <div class="mb-3">
              <label class="form-label form-label-sm fw-semibold">Module concerné</label>
              <select class="form-select form-select-sm" id="faqQModule">
                ${FAQ_MODULES.map(m =>
                  `<option value="${escHtml(m.key)}">${escHtml(m.label)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label form-label-sm fw-semibold">Contexte (optionnel)</label>
              <textarea class="form-control form-control-sm" id="faqQContext" rows="3"
                placeholder="Décris ce que tu cherchais à faire…" maxlength="500"></textarea>
            </div>
            <div id="faqQuestionError" class="alert alert-danger d-none small py-2"></div>
          </div>
        </div>
        <div class="modal-footer" id="faqQuestionFooter">
          <button type="button" class="btn btn-outline-secondary btn-sm"
            data-bs-dismiss="modal">Annuler</button>
          <button type="button" class="btn btn-module btn-sm" id="btnFaqQSubmit">
            <i class="bi bi-send me-1"></i>Envoyer
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  $('btnFaqQSubmit').addEventListener('click', submitQuestion);
}

async function submitQuestion() {
  const question = ($('faqQInput')?.value || '').trim();
  const module_key = $('faqQModule')?.value || 'general';
  const contexte = ($('faqQContext')?.value || '').trim();
  const errEl = $('faqQuestionError');

  errEl.classList.add('d-none');

  if (question.length < 5) {
    errEl.textContent = 'La question doit faire au moins 5 caractères.';
    errEl.classList.remove('d-none');
    return;
  }

  const btn = $('btnFaqQSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Envoi…';

  const reponse = contexte
    ? `<p><em>Contexte fourni par le membre :</em> ${escHtml(contexte)}</p><p class="mb-0 text-muted fst-italic">En attente de réponse de l'équipe.</p>`
    : '<p class="mb-0 text-muted fst-italic">En attente de réponse de l\'équipe.</p>';

  const { error } = await window.bdb
    .from('site_faq')
    .insert({
      question,
      reponse,
      categorie:      'general',
      module_key,
      show_in_site:   false,
      show_in_module: true,
      position:       999,
      statut:         'draft',
      created_by:     window.bdbUser.id
    })
    .select();

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-send me-1"></i>Envoyer';

  if (error) {
    errEl.textContent = 'L\'envoi n\'a pu aboutir — réessayez dans un instant.';
    errEl.classList.remove('d-none');
    return;
  }

  $('faqQuestionForm').classList.add('d-none');
  $('faqQuestionFooter').classList.add('d-none');
  $('faqQuestionSuccess').classList.remove('d-none');
}

// ── Chargement ────────────────────────────────────────────────────────────────

async function loadData() {
  if (window.bdbIsDemo && window.bdbIsDemo()) {
    const { data } = await window.bdb.from('demo_faq').select('*').order('position');
    _state.questions = data || [];
    renderTabs();
    return;
  }
  showState('faqLoading');

  const { data, error } = await window.bdb
    .from('site_faq')
    .select('id, question, reponse, categorie, module_key, position, cta_label, cta_module_key')
    .eq('show_in_module', true)
    .eq('statut', 'active')
    .order('position', { ascending: true });

  if (error) {
    const el = $('faqErrorMsg');
    if (el) el.textContent = error.message;
    showState('faqError');
    return;
  }

  _state.questions = data || [];
  renderTabs();
}

// ── Init depuis shell ─────────────────────────────────────────────────────────

function initFromShell() {
  // Bouton "Poser une question" — visible par tous les membres
  const btnAsk = $('btnFaqAsk');
  if (btnAsk) {
    btnAsk.classList.remove('d-none');
    btnAsk.addEventListener('click', () => {
      buildModalQuestion();
      // Reset formulaire
      const form = $('faqQuestionForm');
      const success = $('faqQuestionSuccess');
      const footer = $('faqQuestionFooter');
      if (form)    form.classList.remove('d-none');
      if (success) success.classList.add('d-none');
      if (footer)  footer.classList.remove('d-none');
      $('faqQInput').value = '';
      $('faqQContext').value = '';
      $('faqQuestionError')?.classList.add('d-none');
      // Pré-sélectionner le module actif
      const sel = $('faqQModule');
      if (sel && _state.activeTab) sel.value = _state.activeTab;
      new bootstrap.Modal($('modalFaqQuestion')).show();
    });
  }

  // Slot admin — bouton admin-only dans la toolbar
  if (window.bdbUser?.isAdmin) {
    const adminSlot = $('faqAdminToolbarSlot');
    if (adminSlot) adminSlot.classList.remove('d-none');
  }
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();
  await loadModulePaths();
  await loadData();
  bindSearch();
  $('btnFaqRetry')?.addEventListener('click', loadData);
});

// Recherche globale BDB (optionnel — si conteneur présent)
if (document.getElementById('searchContainer')) {
  BdbSearch.init({ container: '#searchContainer', showBar: false });
}
