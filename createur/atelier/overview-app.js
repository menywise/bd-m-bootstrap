/* ================================================================
   overview-app.js — BDB Atelier / Overview dynamique
   V3.0.0 (S#95 Tour 2) — Kit BO + Bootstrap natif (T-02 Option B)
   Sources : atelier_prompt_reprise() · app_groups + app_modules
             atelier_sessions · atelier_decisions · atelier_memo
   CDS Compliant | escHtml | 3 états | bdbShellReady
   ================================================================ */

function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none'); }

function showError(contentId, loadingId, errorId, msg) {
  hide(loadingId);
  const el = document.getElementById(errorId);
  if (el) {
    el.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(msg) +
      ' <button class="btn btn-sm btn-outline-danger ms-2" type="button" data-retry>Réessayer</button>';
    show(errorId);
  }
}

/* ================================================================
   RENDER KPIs (6 tuiles Kit BO)
   ================================================================ */
function renderKpis(ctx) {
  const s = ctx.stats;
  const t = ctx.terrain;
  const kpis = [
    { val: t?.protocoles ?? '—',    lbl: 'Protocoles',    ico: 'bi-list-ul'           },
    { val: t?.dernier_act ?? '—',   lbl: 'Dernier ACT',   ico: 'bi-arrow-up-right'    },
    { val: t?.fiches_papier ?? '—', lbl: 'Fiches papier', ico: 'bi-file-earmark-text' },
    { val: t?.glossaire ?? '—',     lbl: 'Glossaire',     ico: 'bi-book'              },
    { val: s?.total_decisions ?? '—', lbl: 'Décisions',   ico: 'bi-journal-check'     },
    { val: (s?.sessions_fait ?? '?') + '/' + (s?.total_sessions ?? '?'), lbl: 'Sessions', ico: 'bi-list-check' }
  ];
  document.getElementById('ov-kpis').innerHTML = kpis.map(k =>
    '<div class="col-6 col-md-4 col-lg-2">' +
      '<div class="card bo-card bo-accent-primary px-3 py-2 h-100">' +
        '<div class="h4 fw-bold text-primary mb-0">' + escHtml(k.val) + '</div>' +
        '<div class="small text-muted text-uppercase">' +
          '<i class="bi ' + k.ico + ' me-1"></i>' + k.lbl +
        '</div>' +
      '</div>' +
    '</div>'
  ).join('');
  hide('ov-kpis-loading');
  show('ov-kpis');
}

/* ================================================================
   RENDER MODULES
   ================================================================ */
function renderModules(groups, modules) {
  const byGroup = {};
  modules.forEach(m => { if (!byGroup[m.group_key]) byGroup[m.group_key] = []; byGroup[m.group_key].push(m); });
  const total  = modules.length;
  const active = modules.filter(m => m.status === 'active').length;
  const coming = modules.filter(m => m.status === 'coming_soon').length;
  const maint  = modules.filter(m => m.status === 'maintenance').length;

  let html = '<div class="d-flex gap-3 flex-wrap mb-3 p-3 bg-white rounded border small">' +
    '<span><strong>' + total + '</strong> modules total</span>' +
    '<span class="text-success"><i class="bi bi-check-circle me-1"></i>' + active + ' actifs</span>' +
    (coming ? '<span class="text-warning-emphasis"><i class="bi bi-clock me-1"></i>' + coming + ' à venir</span>' : '') +
    (maint  ? '<span class="text-danger"><i class="bi bi-wrench me-1"></i>' + maint + ' maintenance</span>' : '') +
  '</div>';

  groups.forEach(g => {
    const mods = byGroup[g.key] || [];
    if (!mods.length) return;
    const safeIcon  = /^bi-[a-z0-9-]+$/.test(g.icon) ? g.icon : 'bi-grid';
    const safeColor = /^#[0-9a-fA-F]{3,6}$/.test(g.color) ? g.color : '#6c757d';
    /* EXCEPTION-C2-COULEUR-DB sur icon : couleur dynamique app_groups.color */
    html += '<div class="small fw-bold text-uppercase text-muted mt-3 mb-2 d-flex align-items-center gap-2">' +
      '<i class="bi ' + safeIcon + '" style="color:' + safeColor + ';"></i>' + escHtml(g.label) +
      '<span class="text-muted fw-normal">(' + mods.length + ')</span>' +
    '</div>';
    html += '<div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2 mb-2">';
    mods.forEach(m => {
      const mIcon = /^bi-[a-z0-9-]+$/.test(m.icon) ? m.icon : 'bi-grid';
      const accentCls = m.status === 'active' ? 'bo-accent-success'
                      : m.status === 'coming_soon' ? 'bo-accent-warning'
                      : 'bo-accent-danger';
      const statusBadge = m.status === 'active'
        ? '<span class="badge text-bg-success small">actif</span>'
        : m.status === 'coming_soon'
        ? '<span class="badge text-bg-warning text-dark small">à venir</span>'
        : '<span class="badge text-bg-danger small">maintenance</span>';
      const newBadge = m.is_new ? '<span class="badge text-bg-info text-dark ms-1 small">new</span>' : '';
      /* EXCEPTION-C2-COULEUR-DB sur icon */
      html += '<div class="col">' +
        '<div class="card bo-card ' + accentCls + ' px-2 py-2 d-flex flex-row align-items-center justify-content-between gap-2 small h-100">' +
          '<div class="fw-semibold d-flex align-items-center gap-2">' +
            '<i class="bi ' + mIcon + '" style="color:' + safeColor + ';font-size:.85rem;"></i>' +
            escHtml(m.label) + newBadge +
          '</div>' +
          statusBadge +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  });
  document.getElementById('ov-modules-content').innerHTML = html;
  hide('ov-modules-loading');
  show('ov-modules-content');
}

/* ================================================================
   RENDER ROADMAP
   ================================================================ */
function renderRoadmap(sessions) {
  const order = { en_cours:0, a_faire:1, partiel:2, fait:3, abandonne:4 };
  const sorted = [...sessions].sort((a,b) => (order[a.statut]??9)-(order[b.statut]??9) || a.numero-b.numero);
  const visible = sorted.slice(0,15);
  const reste   = sorted.length - visible.length;
  const statMap = {
    en_cours:  { accent:'bo-accent-primary',   bg:'bg-primary-subtle',   badge:'text-bg-primary',          lbl:'EN COURS'  },
    a_faire:   { accent:'bo-accent-secondary', bg:'bg-light',            badge:'text-bg-secondary',         lbl:'À FAIRE'   },
    partiel:   { accent:'bo-accent-warning',   bg:'bg-warning-subtle',   badge:'text-bg-warning text-dark', lbl:'PARTIEL'   },
    fait:      { accent:'bo-accent-success',   bg:'bg-success-subtle',   badge:'text-bg-success',           lbl:'FAIT'      },
    abandonne: { accent:'bo-accent-danger',    bg:'bg-danger-subtle',    badge:'text-bg-danger',            lbl:'ABANDONNÉ' }
  };
  let html = '<div class="d-flex flex-column gap-2">';
  visible.forEach(s => {
    const sm  = statMap[s.statut] || statMap.a_faire;
    const dep = s.dependances?.length ? '<span class="badge text-bg-light border small ms-2">Dép. #'+s.dependances.join(', #')+'</span>' : '';
    html += '<div class="card bo-card ' + sm.accent + ' ' + sm.bg + ' p-3 mb-0 small">' +
      '<div class="d-flex align-items-center flex-wrap gap-2">' +
        '<span class="badge ' + sm.badge + ' small">' + sm.lbl + '</span>' +
        '<span class="fw-bold">Session #' + escHtml(s.numero) + ' — ' + escHtml(s.titre) + '</span>' +
        dep +
        (s.duree_estimee ? '<span class="small text-muted">' + escHtml(s.duree_estimee) + '</span>' : '') +
      '</div>' +
      (s.avancement ? '<div class="small text-muted mt-1">' + escHtml(s.avancement.slice(0,120)) + (s.avancement.length>120?'…':'') + '</div>' : '') +
    '</div>';
  });
  if (reste > 0) html += '<div class="text-muted small ps-2">… et ' + reste + ' sessions supplémentaires</div>';
  html += '</div>';
  document.getElementById('ov-roadmap-content').innerHTML = html;
  hide('ov-roadmap-loading');
  show('ov-roadmap-content');
}

/* ================================================================
   RENDER DÉCISIONS
   ================================================================ */
function renderDecisions(decisions) {
  if (!decisions.length) {
    document.getElementById('ov-decisions-content').innerHTML = '<p class="text-muted small">Aucune décision.</p>';
    hide('ov-decisions-loading');
    show('ov-decisions-content');
    return;
  }
  let html = '<div class="card bo-card"><div class="table-responsive"><table class="table table-hover bo-table small mb-0"><thead><tr><th class="small text-uppercase text-muted">Réf</th><th class="small text-uppercase text-muted">Titre</th><th class="small text-uppercase text-muted">Module</th><th class="small text-uppercase text-muted">Date</th><th class="small text-uppercase text-muted">#S</th></tr></thead><tbody>';
  decisions.forEach(d => {
    html += '<tr>' +
      '<td><span class="small font-monospace text-primary">' + escHtml(d.ref) + '</span></td>' +
      '<td>' + escHtml(d.titre) + '</td>' +
      '<td>' + (d.module_cible ? '<span class="badge text-bg-light border small">' + escHtml(d.module_cible) + '</span>' : '<span class="text-muted">—</span>') + '</td>' +
      '<td class="text-muted text-nowrap">' + escHtml(d.date) + '</td>' +
      '<td>' + (d.session_num ? '<small class="text-muted">#' + escHtml(d.session_num) + '</small>' : '') + '</td>' +
    '</tr>';
  });
  html += '</tbody></table></div></div>';
  document.getElementById('ov-decisions-content').innerHTML = html;
  hide('ov-decisions-loading');
  show('ov-decisions-content');
}

/* ================================================================
   RENDER ANOMALIES
   ================================================================ */
function renderAnomalies(memos) {
  const el = document.getElementById('ov-ano-content');
  if (!memos.length) {
    el.innerHTML = '<div class="card bo-card text-center text-muted py-5 small">' +
      '<div><i class="bi bi-check-circle-fill text-success fs-2 d-block mb-2"></i>' +
      'Aucune anomalie enregistrée.<br><small>Ajoute un mémo avec la catégorie "anomalie" pour le faire apparaître ici.</small></div>' +
    '</div>';
    hide('ov-ano-loading');
    show('ov-ano-content');
    return;
  }
  el.innerHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">' +
    memos.map(m => {
      const couleur = /^#[0-9a-fA-F]{3,6}$/.test(m.couleur) ? m.couleur : '#dc3545';
      /* EXCEPTION-C2-COULEUR-DB sur border-top : couleur dynamique atelier_memo.couleur */
      return '<div class="col"><div class="card bo-card p-3 h-100 small" style="border-top:3px solid ' + couleur + ';">' +
        '<div class="fw-bold mb-1">' + escHtml(m.titre) + '</div>' +
        '<div class="small text-muted">' + escHtml((m.contenu||'').slice(0,160)) + (m.contenu?.length>160?'…':'') + '</div>' +
      '</div></div>';
    }).join('') +
  '</div>';
  hide('ov-ano-loading');
  show('ov-ano-content');
}

/* ================================================================
   CHARGEMENT PRINCIPAL
   ================================================================ */
async function loadAll() {
  const DB = window.bdb;
  ['ov-modules','ov-roadmap','ov-decisions','ov-ano'].forEach(p => {
    show(p+'-loading'); hide(p+'-content'); hide(p+'-error');
  });
  hide('ov-kpis'); show('ov-kpis-loading');

  const [rpcRes, groupsRes, modulesRes, sessionsRes, anomaliesRes] = await Promise.all([
    DB.rpc('atelier_prompt_reprise'),
    DB.from('app_groups').select('key,label,icon,color,position').eq('is_visible',true).order('position'),
    DB.from('app_modules').select('key,label,icon,group_key,path,position,status,is_new,visibility').order('position'),
    DB.from('atelier_sessions').select('numero,titre,statut,avancement,dependances,duree_estimee').order('numero',{ascending:false}).limit(50),
    DB.from('atelier_memo').select('id,titre,contenu,couleur,is_epingle').eq('categorie','anomalie').order('is_epingle',{ascending:false})
  ]);

  if (!rpcRes.error) {
    const raw = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
    const ctx = raw?.atelier_prompt_reprise ?? raw;
    if (ctx) { renderKpis(ctx); renderDecisions(ctx.decisions_recentes || []); }
  } else {
    hide('ov-kpis-loading');
    document.getElementById('ov-kpis').innerHTML = '<span class="text-danger small"><i class="bi bi-exclamation-triangle me-1"></i>Terrain indisponible</span>';
    show('ov-kpis');
    showError('ov-decisions-content','ov-decisions-loading','ov-decisions-error', rpcRes.error.message);
  }

  if (groupsRes.error || modulesRes.error) {
    showError('ov-modules-content','ov-modules-loading','ov-modules-error', (groupsRes.error||modulesRes.error).message);
  } else {
    renderModules(groupsRes.data||[], modulesRes.data||[]);
  }

  if (sessionsRes.error) {
    showError('ov-roadmap-content','ov-roadmap-loading','ov-roadmap-error', sessionsRes.error.message);
  } else {
    renderRoadmap(sessionsRes.data||[]);
  }

  if (anomaliesRes.error) {
    showError('ov-ano-content','ov-ano-loading','ov-ano-error', anomaliesRes.error.message);
  } else {
    renderAnomalies(anomaliesRes.data||[]);
  }
}

/* ================================================================
   POINT D'ENTRÉE (pattern conseil-app.js)
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  document.addEventListener('click', e => { if (e.target.closest('[data-retry]')) loadAll(); });

  (async () => {
    await window.bdbShellReady;
    if (!window.bdbUser) return;
    if (!window.bdbUser.isAdmin) { hide('ov-loading'); show('ov-denied'); return; }
    hide('ov-loading');
    show('ov-content');
    await loadAll();
    document.getElementById('ov-btn-refresh').addEventListener('click', loadAll);
  })();
});
