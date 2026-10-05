/* ================================================================
   bernard-app.js — BDB Bernard L3 Createur
   CDS Compliant | escHtml | 3 etats | await window.bdbShellReady
   Aligne sur conseil-app.js (S#90) : bo-* kit + auth-required
   ================================================================ */

/* ── Cotation DB → affichage ─────────────────────────────────── */
var BERNARD_COT = {
  servi:        { sym: '\u2705', cls: 'bernard-cot-servi',   label: 'Servi' },
  expose:       { sym: '\u26A0\uFE0F', cls: 'bernard-cot-expose', label: 'Expose' },
  lese:         { sym: '\u274C', cls: 'bernard-cot-lese',    label: 'Lese' },
  non_concerne: { sym: '\u2796', cls: 'bernard-cot-nc',      label: 'Non concerne' },
  inconnu:      { sym: '\u2753', cls: 'bernard-cot-inconnu', label: 'Inconnu' },
  simulation:   { sym: '\uD83D\uDD04', cls: 'bernard-cot-simu', label: 'Simulation' }
};

var BERNARD_ITEMS = {
  enneagramme: {
    '1': '1 Perfectionniste', '2': '2 Altruiste', '3': '3 Battant',
    '4': '4 Individualiste', '5': '5 Observateur', '6': '6 Loyal',
    '7': '7 Epicurien', '8': '8 Chef', '9': '9 Mediateur'
  },
  disc: { 'D': 'D Dominant', 'I': 'I Influent', 'S': 'S Stable', 'C': 'C Conforme' },
  spirale: {
    'violet': 'Violet (tribu)', 'bleu': 'Bleu (regle)',
    'orange': 'Orange (perf.)', 'vert': 'Vert (sens)', 'jaune': 'Jaune (systeme)'
  }
};

var BERNARD_MODE_BADGE = {
  remplie:        'bg-success-subtle text-success-emphasis border border-success border-opacity-25',
  questionnement: 'bg-warning-subtle text-warning-emphasis border border-warning border-opacity-25',
  mixte:          'bg-info-subtle text-info-emphasis border border-info border-opacity-25'
};

var BERNARD_AXE_LABELS = {
  enneagramme: 'Enneagramme (9 processus)',
  disc:        'DISC (4 colorations)',
  spirale:     'Spirale Dynamique (5 niveaux)'
};

/* ── Etat ─────────────────────────────────────────────────────── */
var _lectures  = [];
var _cotations = {};
var _jurisp    = [];

/* ── Helpers DOM (pattern conseil-app.js) ─────────────────────── */
function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none'); }

function escHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  /* Auth-required overlay (pattern conseil-app.js) */
  document.addEventListener('bdb:auth-required', function (e) {
    hide('bernard-loading');
    show('bernard-auth-overlay');
    document.body.classList.add('bdb-auth-required');
    document.getElementById('bernard-auth-btn-login').addEventListener('click', function () {
      window.open(e.detail?.loginUrl ?? '../login.html', '_blank');
    });
    document.getElementById('bernard-auth-btn-refresh').addEventListener('click', function () {
      location.reload();
    });
  });

  /* Listeners filtres + refresh */
  document.getElementById('btnBernardRefresh').addEventListener('click', loadAll);
  document.getElementById('btnBernardRetry').addEventListener('click', loadAll);
  document.getElementById('bernardSearch').addEventListener('input', applyFilters);
  document.getElementById('bernardFilterMode').addEventListener('change', applyFilters);
  document.getElementById('bernardFilterAxe').addEventListener('change', applyFilters);

  /* Delegation click sur liste des fiches */
  document.getElementById('bernardList').addEventListener('click', function (e) {
    var card = e.target.closest('[data-lecture-id]');
    if (card) openDetail(card.dataset.lectureId);
  });

  /* Shell ready → guard → load */
  (async function () {
    await window.bdbShellReady;
    if (!window.bdbUser) return;
    hide('bernard-loading');

    if (!window.bdbUser.isCreator) {
      show('bernard-denied');
      return;
    }

    show('bernard-content');
    await loadAll();
  })();

});

/* ── Chargement ───────────────────────────────────────────────── */
async function loadAll() {
  hide('bernard-empty');
  hide('bernard-no-results');
  hide('bernard-error');
  document.getElementById('bernardList').innerHTML = '';

  try {
    await Promise.all([loadLectures(), loadJurisprudence()]);
    renderKpis();

    if (_lectures.length === 0) {
      show('bernard-empty');
    } else {
      applyFilters();
    }
  } catch (err) {
    document.getElementById('bernard-error-msg').textContent = err.message || 'Erreur inconnue';
    show('bernard-error');
  }
}

async function loadLectures() {
  var sb = window.bdb;
  var res = await sb.from('bernard_lectures')
    .select('*')
    .eq('statut', 'active')
    .order('date_lecture', { ascending: false })
    .limit(200);
  if (res.error) throw res.error;
  _lectures = res.data || [];

  _cotations = {};
  if (_lectures.length > 0) {
    var ids = _lectures.map(function (l) { return l.id; });
    var cotRes = await sb.from('bernard_lecture_cotations')
      .select('lecture_id, axe, item, cotation, lecture_courte, position')
      .in('lecture_id', ids)
      .order('position', { ascending: true });
    if (cotRes.error) throw cotRes.error;
    (cotRes.data || []).forEach(function (c) {
      if (!_cotations[c.lecture_id]) _cotations[c.lecture_id] = [];
      _cotations[c.lecture_id].push(c);
    });
  }
}

async function loadJurisprudence() {
  var sb = window.bdb;
  var res = await sb.from('atelier_principes')
    .select('ref, titre, description, marqueur, statut')
    .eq('categorie', 'bernard_regles')
    .eq('statut', 'active')
    .order('ref', { ascending: true });
  if (res.error) throw res.error;
  _jurisp = res.data || [];
  renderJurisprudence();
}

/* ── Rendu — Jurisprudence ────────────────────────────────────── */
function renderJurisprudence() {
  document.getElementById('badgeJurispCount').textContent = _jurisp.length;
  var body = document.getElementById('jurispBody');

  if (_jurisp.length === 0) {
    body.innerHTML = '<p class="text-muted small mb-0">Aucune regle en base.</p>';
    return;
  }

  var html = '<div class="list-group list-group-flush">';
  _jurisp.forEach(function (r) {
    var isGf = r.ref.indexOf('GF-') >= 0;
    var badgeCls = isGf
      ? 'bg-warning-subtle text-warning-emphasis border border-warning border-opacity-25'
      : 'bg-primary-subtle text-primary-emphasis border border-primary border-opacity-25';

    html += '<div class="list-group-item px-2 py-1">';
    html += '<div class="d-flex align-items-start gap-2">';
    html += '<span class="badge ' + badgeCls + ' bernard-ref-badge">' + escHtml(r.ref) + '</span>';
    html += '<div class="flex-grow-1">';
    html += '<div class="fw-semibold small">' + escHtml(r.titre) + '</div>';
    html += '<div class="text-muted small bernard-desc-truncate">' + escHtml(r.description) + '</div>';
    html += '</div></div></div>';
  });
  html += '</div>';
  body.innerHTML = html;
}

/* ── Rendu — KPIs ─────────────────────────────────────────────── */
function renderKpis() {
  document.getElementById('kpiTotal').textContent = _lectures.length;

  var totalLese = 0, totalSimu = 0, personaSet = {};
  Object.keys(_cotations).forEach(function (lid) {
    _cotations[lid].forEach(function (c) {
      if (c.cotation === 'lese') totalLese++;
      if (c.cotation === 'simulation') totalSimu++;
    });
  });
  _lectures.forEach(function (l) {
    if (l.persona_code) personaSet[l.persona_code] = true;
  });

  document.getElementById('kpiLese').textContent = totalLese;
  document.getElementById('kpiSimulation').textContent = totalSimu;
  document.getElementById('kpiPersonas').textContent = Object.keys(personaSet).length;
}

/* ── Rendu — Liste fiches ─────────────────────────────────────── */
function applyFilters() {
  var search = (document.getElementById('bernardSearch').value || '').toLowerCase().trim();
  var mode = document.getElementById('bernardFilterMode').value;
  var axe  = document.getElementById('bernardFilterAxe').value;

  var filtered = _lectures.filter(function (l) {
    if (mode && l.mode !== mode) return false;
    if (search) {
      var haystack = (l.titre + ' ' + (l.vu || '') + ' ' + (l.persona_code || '')).toLowerCase();
      if (haystack.indexOf(search) < 0) return false;
    }
    if (axe) {
      var cots = _cotations[l.id] || [];
      if (!cots.some(function (c) { return c.axe === axe; })) return false;
    }
    return true;
  });

  hide('bernard-no-results');

  if (filtered.length === 0 && _lectures.length > 0) {
    document.getElementById('bernardList').innerHTML = '';
    show('bernard-no-results');
    return;
  }

  renderList(filtered);
}

function renderList(lectures) {
  var container = document.getElementById('bernardList');
  if (lectures.length === 0) { container.innerHTML = ''; return; }

  var html = '';
  lectures.forEach(function (l) {
    var cots = _cotations[l.id] || [];
    var modeBadge = BERNARD_MODE_BADGE[l.mode] || 'bg-secondary';

    html += '<div class="card bo-card mb-2 bernard-fiche-card" data-lecture-id="' + escHtml(l.id) + '" role="button">';
    html += '<div class="card-body py-2 px-3">';

    /* Ligne 1 : titre + badges */
    html += '<div class="d-flex align-items-start gap-2 mb-1">';
    html += '<div class="flex-grow-1">';
    html += '<div class="fw-semibold">' + escHtml(l.titre) + '</div>';
    html += '<div class="text-muted small">';
    html += escHtml(l.date_lecture);
    if (l.persona_code) html += ' \u00b7 <i class="bi bi-person-fill"></i> ' + escHtml(l.persona_code);
    if (l.session_num) html += ' \u00b7 S#' + escHtml(String(l.session_num));
    html += '</div></div>';
    html += '<span class="badge ' + modeBadge + '">' + escHtml(l.mode) + '</span>';
    if (l.sources !== 'factuelle') {
      html += '<span class="badge bg-secondary-subtle text-secondary-emphasis border border-secondary border-opacity-25 ms-1">' + escHtml(l.sources) + '</span>';
    }
    html += '</div>';

    /* Ligne 2 : strip cotations 18 points */
    if (cots.length > 0) {
      html += '<div class="bernard-cot-strip">';
      cots.forEach(function (c) {
        var info = BERNARD_COT[c.cotation] || { sym: '?', cls: '', label: c.cotation };
        var itemLabel = (BERNARD_ITEMS[c.axe] || {})[c.item] || c.item;
        html += '<span class="bernard-cot-dot ' + info.cls + '" title="' + escHtml(itemLabel + ' : ' + info.label) + '">' + info.sym + '</span>';
      });
      html += '</div>';
    }

    /* Ligne 3 : dominantes */
    var dominants = [];
    if (l.enneagramme_dominant) dominants.push('E' + l.enneagramme_dominant);
    if (l.disc_dominant) dominants.push('DISC-' + l.disc_dominant);
    if (l.spirale_dominant) {
      dominants.push('<span class="bernard-spirale-tag" data-spirale="' + escHtml(l.spirale_dominant) + '">' + escHtml(l.spirale_dominant) + '</span>');
    }
    if (dominants.length > 0) {
      html += '<div class="small text-muted mt-1">' + dominants.join(' \u00b7 ') + '</div>';
    }

    html += '</div></div>';
  });

  container.innerHTML = html;
}

/* ── Rendu — Detail offcanvas ─────────────────────────────────── */
function openDetail(lectureId) {
  var lecture = _lectures.find(function (l) { return l.id === lectureId; });
  if (!lecture) return;

  var cots = _cotations[lectureId] || [];
  var offcanvas = new bootstrap.Offcanvas(document.getElementById('bernardOffcanvas'));

  document.getElementById('bernardOffcanvasTitle').textContent = lecture.titre;

  var html = '';

  /* Entete */
  html += '<div class="mb-3">';
  html += '<div class="text-muted small mb-1">';
  html += escHtml(lecture.date_lecture) + ' \u00b7 mode : ' + escHtml(lecture.mode) + ' \u00b7 sources : ' + escHtml(lecture.sources);
  html += '</div>';
  if (lecture.persona_code)  html += '<div class="small"><i class="bi bi-person-fill me-1"></i>Persona : <strong>' + escHtml(lecture.persona_code) + '</strong></div>';
  if (lecture.session_num)   html += '<div class="small"><i class="bi bi-hash me-1"></i>Session : ' + escHtml(String(lecture.session_num)) + '</div>';
  if (lecture.decision_ref)  html += '<div class="small"><i class="bi bi-bookmark me-1"></i>Decision : ' + escHtml(lecture.decision_ref) + '</div>';
  html += '</div>';

  /* Grille 18 points par axe */
  ['enneagramme', 'disc', 'spirale'].forEach(function (axe) {
    var axeCots = cots.filter(function (c) { return c.axe === axe; });
    if (axeCots.length === 0) return;

    html += '<h6 class="mt-3 mb-2 bernard-axe-title">' + escHtml(BERNARD_AXE_LABELS[axe]) + '</h6>';
    html += '<div class="bernard-cot-grid">';
    axeCots.forEach(function (c) {
      var info = BERNARD_COT[c.cotation] || { sym: '?', cls: '', label: c.cotation };
      var itemLabel = (BERNARD_ITEMS[axe] || {})[c.item] || c.item;
      html += '<div class="bernard-cot-row ' + info.cls + '">';
      html += '<span class="bernard-cot-sym">' + info.sym + '</span>';
      html += '<span class="bernard-cot-item">' + escHtml(itemLabel) + '</span>';
      html += '<span class="bernard-cot-text">' + escHtml(c.lecture_courte) + '</span>';
      html += '</div>';
    });
    html += '</div>';
  });

  /* Signature triple */
  if (lecture.vu) {
    html += '<h6 class="mt-3 mb-1"><i class="bi bi-eye me-1"></i>Ce que j\'ai vu</h6>';
    html += '<div class="bernard-block-text">' + escHtml(lecture.vu) + '</div>';
  }
  if (lecture.action_immediate) {
    html += '<h6 class="mt-3 mb-1"><i class="bi bi-lightning me-1"></i>Action immediate</h6>';
    html += '<div class="bernard-block-text">' + escHtml(lecture.action_immediate) + '</div>';
  }
  if (lecture.objectifs && lecture.objectifs.length > 0) {
    html += '<h6 class="mt-3 mb-1"><i class="bi bi-bullseye me-1"></i>Objectifs explicites</h6>';
    html += '<div class="bernard-block-text">';
    lecture.objectifs.forEach(function (o, i) { html += '<div>' + (i + 1) + '. ' + escHtml(o) + '</div>'; });
    html += '</div>';
  }
  if (lecture.pistes && lecture.pistes.length > 0) {
    html += '<h6 class="mt-3 mb-1"><i class="bi bi-signpost-split me-1"></i>Pistes</h6>';
    html += '<div class="bernard-block-text">';
    lecture.pistes.forEach(function (p) { html += '<div class="mb-1">' + escHtml(p) + '</div>'; });
    html += '</div>';
  }
  if (lecture.angles_morts && lecture.angles_morts.length > 0) {
    html += '<h6 class="mt-3 mb-1"><i class="bi bi-exclamation-triangle me-1"></i>Angles morts</h6>';
    html += '<div class="bernard-block-text">';
    lecture.angles_morts.forEach(function (a) { html += '<div class="mb-1">' + escHtml(a) + '</div>'; });
    html += '</div>';
  }

  document.getElementById('bernardOffcanvasBody').innerHTML = html;
  offcanvas.show();
}
