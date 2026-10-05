/**
 * PROJECT  : Bible de Bloc (BDB)
 * FILE     : faq-site.js v2.0.0
 * MODULE   : site/
 * DATE     : 2026-04-06
 * AUTEUR   : Manu + Claude
 * ROLE     : FAQ mini-site — fetch Supabase, accordions par catégorie,
 *            formulaire contact → signalements (type='contact')
 * DELTA    : v1→v2 — Admin inline supprimé (géré dans modules/admin/).
 *            Formulaire contact remplace le CTA statique.
 * DEPENDS  : supabase-client.js (window.bdb), Bootstrap 5.3.2
 */

'use strict';

const FAQ_CATEGORIES = [
  { key: 'generale',  label: 'Questions générales',      icon: 'bi-chat-dots'          },
  { key: 'pratique',  label: 'Questions pratiques',       icon: 'bi-tools'              },
  { key: 'objection', label: 'Les objections courantes',  icon: 'bi-shield-exclamation' }
];

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSkeletons(container) {
  container.innerHTML = FAQ_CATEGORIES.map(cat => `
    <section class="mb-5">
      <h2 class="fw-bold mb-4"><i class="bi ${escHtml(cat.icon)} me-2 text-primary"></i>${escHtml(cat.label)}</h2>
      <div class="placeholder-glow">
        <div class="placeholder col-12 rounded mb-2" style="height:52px"></div>
        <div class="placeholder col-12 rounded mb-2" style="height:52px"></div>
        <div class="placeholder col-12 rounded mb-2" style="height:52px"></div>
      </div>
    </section>`).join('');
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill"></i><span>${escHtml(msg)}</span>
    </div>`;
}

function renderEmpty(container) {
  container.innerHTML = `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-question-circle fs-1 d-block mb-3 opacity-50"></i>
      <p>Aucune question disponible pour le moment.</p>
    </div>`;
}

function buildAccordion(questions, catKey) {
  const filtered = questions.filter(q => q.categorie === catKey);
  if (!filtered.length) return '';
  const items = filtered.map((q, idx) => {
    const id      = `faq-${escHtml(catKey)}-${idx}`;
    const isFirst = idx === 0;
    return `
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button${isFirst ? '' : ' collapsed'}" type="button"
            data-bs-toggle="collapse" data-bs-target="#${id}">
            ${escHtml(q.question)}
          </button>
        </h2>
        <div id="${id}" class="accordion-collapse collapse${isFirst ? ' show' : ''}"
          data-bs-parent="#faqAccordion-${escHtml(catKey)}">
          <div class="accordion-body">${q.reponse}</div>
        </div>
      </div>`;
  }).join('');
  return `<div class="accordion" id="faqAccordion-${escHtml(catKey)}">${items}</div>`;
}

function renderFaq(container, questions) {
  if (!questions.length) { renderEmpty(container); return; }
  container.innerHTML = FAQ_CATEGORIES.map(cat => {
    const accordion = buildAccordion(questions, cat.key);
    if (!accordion) return '';
    return `
      <section class="mb-5">
        <h2 class="fw-bold mb-4"><i class="bi ${escHtml(cat.icon)} me-2 text-primary"></i>${escHtml(cat.label)}</h2>
        ${accordion}
      </section>`;
  }).join('');
}

async function loadAndRender() {
  const container = document.getElementById('faqContent');
  if (!container) return;
  renderSkeletons(container);
  const { data, error } = await window.bdb
    .from('site_faq')
    .select('id, question, reponse, categorie, position')
    .eq('show_in_site', true)
    .eq('statut', 'active')
    .order('position', { ascending: true });
  if (error) { renderError(container, 'Impossible de charger les questions : ' + error.message); return; }
  renderFaq(container, data || []);
}

// ── Formulaire contact → signalements ────────────────────────────────────────

function bindContactForm() {
  const btn = document.getElementById('btnContactSend');
  if (!btn) return;
  let _focusTime = null;
  document.getElementById('contactMessage')?.addEventListener('focus', () => {
    if (!_focusTime) _focusTime = Date.now();
  });
  btn.addEventListener('click', async () => {
    const honeypot  = document.getElementById('contactHoneypot')?.value || '';
    const nom       = (document.getElementById('contactNom')?.value || '').trim() || 'Anonyme';
    const message   = (document.getElementById('contactMessage')?.value || '').trim();
    const errEl     = document.getElementById('contactError');
    const formEl    = document.getElementById('contactForm');
    const successEl = document.getElementById('contactSuccess');
    errEl.classList.add('d-none');
    if (honeypot) return;
    if (_focusTime && Date.now() - _focusTime < 3000) {
      errEl.textContent = 'Merci de patienter quelques secondes avant d\'envoyer.';
      errEl.classList.remove('d-none'); return;
    }
    if (message.length < 10) {
      errEl.textContent = 'Ta question doit faire au moins 10 caractères.';
      errEl.classList.remove('d-none'); return;
    }
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi…';
    const { error } = await window.bdb
      .from('signalements')
      .insert({ type: 'contact', module_cible: 'site', entite_type: 'faq',
                entite_label: nom, description: message, honeypot: null, statut: 'ouvert' })
      .select();
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-send me-2"></i>Envoyer ma question';
    if (error) {
      errEl.textContent = 'Une erreur est survenue. Réessaie dans un moment.';
      errEl.classList.remove('d-none'); return;
    }
    formEl.classList.add('d-none');
    successEl.classList.remove('d-none');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAndRender();
  bindContactForm();
});
