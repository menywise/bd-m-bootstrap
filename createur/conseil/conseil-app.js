/* ================================================================
   conseil-app.js — BDB Conseil L3 Créateur
   CDS Compliant | escHtml | 3 états | await window.bdbShellReady
   Phase 2 (S#90) : .cs-lun-* → kit .bo-* + BS 5.3 natif
   ================================================================ */

const CS_LUNETTES = [
  { tag: 'TERRAIN',       bsColor: 'success',
    question: 'Est-ce que \u00e7a tient dans le chaos r\u00e9el du bloc\u00a0?',
    voix:     'Sabine D. \u00b7 Franck (35 ans IBODE) \u00b7 Julie C. (novice J+1) \u00b7 P0\u2192P8',
    href:     'lunettes/terrain.html' },
  { tag: 'ARCHITECTURE',  bsColor: 'primary',
    question: 'Est-ce que \u00e7a tient sans moi dans 6\u00a0mois\u00a0?',
    voix:     'Ewan (dev senior qui reprend sans appeler)',
    href:     'lunettes/architecture.html' },
  { tag: 'MARCH\u00c9',   bsColor: 'warning',
    question: 'Brigitte signe le bon de commande demain matin\u00a0?',
    voix:     'Brigitte (DSI CHU \u00b7 contractuelle \u00b7 exigeante)',
    href:     'lunettes/marche.html' },
  { tag: 'PHILOSOPHIE',   bsColor: 'info',
    question: 'Est-ce que \u00e7a respecte ce pour quoi BDB existe\u00a0?',
    voix:     'Manifeste \u00b7 Philosophie Participative \u00b7 DISC collectif',
    href:     'lunettes/philosophie.html' },
  { tag: 'CR\u00c9ATEUR', bsColor: 'danger',
    question: 'Est-ce premium, v\u00e9rifi\u00e9 et non-complaisant\u00a0?',
    voix:     'Manu (DISC D \u00b7 FAB(3R) \u00b7 20 ans terrain)',
    href:     'lunettes/createur.html' }
];

const CS_WORKFLOW = [
  { icon: 'bi-upload',  label: 'SOUMETTRE', desc: 'Remplir le template de soumission avec auto-diagnostic 5 lunettes.',                  href: 'templates/soumission.html', btnLabel: 'Template'   },
  { icon: 'bi-cpu',     label: 'ANALYSER',  desc: 'Fournir \u00e0 Perplexity (Brigitte) et Gemini (Ewan) la soumission + prompt.',       href: 'prompts/index.html',        btnLabel: 'Prompts IA' },
  { icon: 'bi-archive', label: 'ARCHIVER',  desc: 'Consolider dans le rapport, archiver le verdict, documenter la d\u00e9cision.',       href: 'verdicts.html',             btnLabel: 'Verdicts'   }
];

function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none');    }

function renderLunettes() {
  const el = document.getElementById('cs-lunettes');
  if (!el) return;
  el.innerHTML = CS_LUNETTES.map(l => {
    const c = escHtml(l.bsColor);
    return '<div class="col-12 col-md-6">' +
      '<div class="card bo-card bo-accent-' + c + ' h-100">' +
        '<div class="card-body p-4">' +
          '<div class="d-flex align-items-center gap-2 mb-2">' +
            '<span class="badge bg-' + c + '-subtle text-' + c + '-emphasis border border-' + c + ' border-opacity-25">' +
              escHtml(l.tag) +
            '</span>' +
            '<a href="' + escHtml(l.href) + '" class="btn btn-sm btn-outline-secondary ms-auto">Lire \u2192</a>' +
          '</div>' +
          '<p class="card-text small mb-1"><strong>Question\u00a0:</strong> ' + escHtml(l.question) + '</p>' +
          '<p class="card-text small text-muted mb-0"><strong>Voix\u00a0:</strong> ' + escHtml(l.voix) + '</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderWorkflow() {
  const el = document.getElementById('cs-workflow');
  if (!el) return;
  el.innerHTML = CS_WORKFLOW.map(w =>
    '<div class="col-12 col-md-4">' +
    '<div class="card bo-card h-100">' +
      '<div class="card-body p-4 text-center d-flex flex-column align-items-center">' +
        '<div class="bo-icon-badge bg-primary-subtle mb-3">' +
          '<i class="bi ' + escHtml(w.icon) + '"></i>' +
        '</div>' +
        '<p class="fw-bold small mb-1">' + escHtml(w.label) + '</p>' +
        '<p class="card-text small text-muted mb-3">' + escHtml(w.desc) + '</p>' +
        '<a href="' + escHtml(w.href) + '" class="btn btn-sm btn-outline-primary mt-auto">' +
          '<i class="bi ' + escHtml(w.icon) + ' me-1"></i>' + escHtml(w.btnLabel) +
        '</a>' +
      '</div>' +
    '</div>' +
    '</div>'
  ).join('');
}

document.addEventListener('DOMContentLoaded', () => {

  document.addEventListener('bdb:auth-required', e => {
    hide('cs-loading');
    const overlay = document.getElementById('cs-auth-overlay');
    overlay.classList.remove('d-none');
    document.body.classList.add('bdb-auth-required');
    document.getElementById('cs-auth-btn-login').addEventListener('click', () =>
      window.open(e.detail?.loginUrl ?? '../login.html', '_blank'));
    document.getElementById('cs-auth-btn-refresh').addEventListener('click', () =>
      location.reload());
  });

  (async () => {
    await window.bdbShellReady;
    if (!window.bdbUser) return;
    hide('cs-loading');
    if (!window.bdbUser.isCreator) {
      document.getElementById('cs-denied').classList.remove('d-none');
      return;
    }
    document.getElementById('cs-content').classList.remove('d-none');
    renderLunettes();
    renderWorkflow();
  })();

});
