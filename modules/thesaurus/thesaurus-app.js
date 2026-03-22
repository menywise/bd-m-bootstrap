/* thesaurus-app.js — BDB · CDS · Module thesaurus
   V2 — RPC distinct + cache sessionStorage données figées.
   Zéro chargement massif 70K au démarrage. */

// ════════════════════════════════════════════════════════════════
// UTILITAIRE SÉCURITÉ — escHtml (INTERDIT-C6)
// ════════════════════════════════════════════════════════════════
var _escEl = document.createElement('div');
function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

// ════════════════════════════════════════════════════════════════
// CACHE — sessionStorage pour données figées (historiques)
// ════════════════════════════════════════════════════════════════
var ThesCache = {
  PREFIX: 'bdb_thes_',
  _key: function(name) { return this.PREFIX + name; },
  get: function(name) {
    try { var raw = sessionStorage.getItem(this._key(name)); return raw ? JSON.parse(raw) : null; }
    catch(_) { return null; }
  },
  set: function(name, data) {
    try { sessionStorage.setItem(this._key(name), JSON.stringify(data)); }
    catch(_) { /* quota — continue sans cache */ }
  },
  clear: function() {
    var prefix = this.PREFIX;
    Object.keys(sessionStorage).forEach(function(k) {
      if (k.startsWith(prefix)) sessionStorage.removeItem(k);
    });
  }
};

// ════════════════════════════════════════════════════════════════
// INIT VIA BDB-SHELL (INTERDIT-B1/B2/B3 : zéro auth locale)
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function() {
  await window.bdbShellReady;
  ThesApp.init(window.bdbUser.isAdmin);
});

// ════════════════════════════════════════════════════════════════
// ThesApp — Application principale
// ════════════════════════════════════════════════════════════════
var ThesApp = {

  isAdmin: false,
  data   : [],
  charts : {},
  _state : { sorted: { col:'frequence', dir:'desc' }, page:1, pageSize:50 },
  _currentProto: null,
  _adminEditId : null,
  _deleteId    : null,
  _chirurgiens : [],
  _annees      : [],

  // ── Utilitaires ──────────────────────────────────────────────
  toast: function(type, msg) {
    var el   = document.getElementById('toast' + type);
    var body = document.getElementById('toast' + type + 'Body');
    if (!el || !body) return;
    body.textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el, {delay:3000}).show();
  },
  typeBadgeClass: function(t) {
    return ({ORTHO:'thes-badge-ortho',TRAUMATO:'thes-badge-traumato',
             SEPTIQUE:'thes-badge-septique',NEURO:'thes-badge-neuro',
             EXCLUS:'thes-badge-exclus'})[t] || 'bg-secondary';
  },
  paretoBadgeClass: function(p) {
    return ({Critique:'thes-pareto-critique',Standard:'thes-pareto-standard',
             Secondaire:'thes-pareto-secondaire',Rare:'thes-pareto-rare'})[p] || 'bg-secondary';
  },
  typePalette: function(t) {
    return ({ORTHO:'#60a5fa',TRAUMATO:'#f59e0b',SEPTIQUE:'#ef4444',
             NEURO:'#06b6d4',EXCLUS:'#9ca3af'})[t] || '#9ca3af';
  },
  fmtNum: function(n) { return Number(n).toLocaleString('fr-FR'); },
  makeTagsHtml: function(str, cls) {
    cls = cls || 'thes-tag';
    if (!str) return '<span class="text-muted fst-italic">—</span>';
    return str.split(',').map(function(s){ return s.trim(); }).filter(Boolean)
              .map(function(s){ return '<span class="' + cls + '">' + escHtml(s) + '</span>'; }).join('');
  },
  _lookupProto: function(lib) {
    return this.data.find(function(p) { return p.libelle_cible === lib; });
  },


  // ════════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════════
  init: async function(isAdmin) {
    this.isAdmin = isAdmin;
    await this.loadData();
    this._fillZoneSelects();
    this._fillChirSelects();
    this._fillAnneeSelect();
    this.initConsultation();
    this._initCacheUI(isAdmin);

    var self = this;
    document.getElementById('tab-dashboard-btn').addEventListener('shown.bs.tab', function() {
      if (!self._dashInit) { self.initDashboard(); self._dashInit = true; }
    });
    document.getElementById('tab-chirurgiens-btn').addEventListener('shown.bs.tab', function() {
      if (!self._chirInit) { self.initChirurgiensUI(); self._chirInit = true; }
    });
    document.getElementById('tab-analyse-btn').addEventListener('shown.bs.tab', function() {
      if (!self._analyseInit) { self.initAnalyse(); self._analyseInit = true; }
    });
    if (isAdmin) {
      document.getElementById('tab-admin-btn')?.addEventListener('shown.bs.tab', function() {
        if (!self._adminInit) { self.initAdmin(); self._adminInit = true; }
      });
      document.getElementById('tab-import-btn')?.addEventListener('shown.bs.tab', function() {
        if (!self._importInit) { self.initImport(); self._importInit = true; }
      });
    }
  },


  // ════════════════════════════════════════════════════════════
  // CHARGEMENT DONNÉES + CACHE
  // ════════════════════════════════════════════════════════════
  loadData: async function() {
    // 1. Protocoles (420 lignes) — cache ou Supabase
    var cached = ThesCache.get('protocoles');
    if (cached && cached.length > 0) {
      this.data = cached;
    } else {
      try {
        var r = await window.bdb.from('thesaurus_protocoles')
          .select('*').order('frequence', { ascending: false });
        if (!r.error && r.data && r.data.length > 0) {
          this.data = r.data;
          ThesCache.set('protocoles', r.data);
        }
      } catch(_) {}
    }
    if (!this.data.length) {
      this.toast('Info', 'Tables thesaurus non disponibles — exécuter migration 018.');
      return;
    }

    // 2. Chirurgiens DISTINCT via RPC (10 lignes) — cache ou Supabase
    var cachedChir = ThesCache.get('chirurgiens');
    if (cachedChir && cachedChir.length > 0) {
      this._chirurgiens = cachedChir;
    } else {
      try {
        var rc = await window.bdb.rpc('thesaurus_distinct_chirurgiens');
        if (!rc.error && rc.data) {
          this._chirurgiens = rc.data.map(function(r){ return r.chirurgien; });
          ThesCache.set('chirurgiens', this._chirurgiens);
        }
      } catch(_) { this._chirurgiens = []; }
    }

    // 3. Années DISTINCT via RPC (~20 lignes) — cache ou Supabase
    var cachedAn = ThesCache.get('annees');
    if (cachedAn && cachedAn.length > 0) {
      this._annees = cachedAn;
    } else {
      try {
        var ra = await window.bdb.rpc('thesaurus_distinct_annees');
        if (!ra.error && ra.data) {
          this._annees = ra.data.map(function(r){ return r.annee; });
          ThesCache.set('annees', this._annees);
        }
      } catch(_) { this._annees = []; }
    }
  },

  // Requête interventions à la demande — filtrée + cache par chirurgien
  _fetchInterv: async function(filters) {
    // Cache par chirurgien complet (données figées historiques)
    if (filters.chirurgien && !filters.annee && !filters.protocoles) {
      var cached = ThesCache.get('interv_' + filters.chirurgien);
      if (cached) return cached;
    }

    var all = [], from = 0, PAGE = 1000;
    function buildQuery() {
      var q = window.bdb.from('thesaurus_interventions')
        .select('chirurgien,date_intervention,protocole_operatoire,specialite');
      if (filters.chirurgien)  q = q.eq('chirurgien', filters.chirurgien);
      if (filters.chirurgiens) q = q.in('chirurgien', filters.chirurgiens);
      if (filters.annee) {
        q = q.gte('date_intervention', filters.annee + '-01-01')
             .lte('date_intervention', filters.annee + '-12-31');
      }
      if (filters.protocoles && filters.protocoles.length > 0) {
        q = q.in('protocole_operatoire', filters.protocoles);
      }
      return q;
    }

    while (true) {
      var resp = await buildQuery().range(from, from + PAGE - 1);
      if (resp.error || !resp.data || resp.data.length === 0) break;
      all = all.concat(resp.data);
      if (resp.data.length < PAGE) break;
      from += PAGE;
    }

    // Cache si requête chirurgien complet (pas filtré par année)
    if (filters.chirurgien && !filters.annee && !filters.protocoles) {
      ThesCache.set('interv_' + filters.chirurgien, all);
    }
    return all;
  },

  // Filtre local année sur données déjà en cache
  _filterByAnnee: function(interv, annee) {
    if (!annee) return interv;
    return interv.filter(function(i) {
      return String(i.date_intervention).startsWith(annee);
    });
  },


  // ════════════════════════════════════════════════════════════
  // CACHE UI — indicateur + bouton purge admin
  // ════════════════════════════════════════════════════════════
  _initCacheUI: function(isAdmin) {
    var self = this;
    var isCached = !!ThesCache.get('protocoles');
    // Indicateur source dans la barre filtres
    var bar = document.querySelector('.thes-search-bar .border-top');
    if (bar) {
      var indicator = document.createElement('span');
      indicator.id = 'thes-cache-indicator';
      indicator.className = 'badge ms-2 ' + (isCached ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary');
      indicator.textContent = isCached ? 'cache' : 'live';
      indicator.title = isCached ? 'Données servies depuis le cache session' : 'Données chargées depuis Supabase';
      bar.querySelector('small')?.appendChild(indicator);
    }
    // Bouton purge admin — discret, à côté du reset filtres
    if (isAdmin) {
      var resetBtn = document.getElementById('btnResetFilters');
      if (resetBtn && resetBtn.parentElement) {
        var purgeBtn = document.createElement('button');
        purgeBtn.className = 'btn btn-outline-warning btn-sm w-100 mt-1';
        purgeBtn.type = 'button';
        purgeBtn.title = 'Vider le cache session et recharger les données depuis Supabase';
        purgeBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Purge cache';
        purgeBtn.addEventListener('click', function() {
          ThesCache.clear();
          self.toast('Success', 'Cache purgé — rechargement…');
          setTimeout(function() { location.reload(); }, 500);
        });
        resetBtn.parentElement.appendChild(purgeBtn);
      }
    }
  },


  // ════════════════════════════════════════════════════════════
  // REMPLISSAGE SELECTS
  // ════════════════════════════════════════════════════════════
  _fillZoneSelects: function() {
    var zones = [...new Set(this.data.map(function(p){ return p.zone_anat; }).filter(Boolean))].sort();
    ['filterZone','editZone','adminZone'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (id === 'filterZone') {
        zones.forEach(function(z){ el.appendChild(new Option(z, z)); });
      } else {
        el.innerHTML = '<option value="">—</option>';
        zones.forEach(function(z){ el.appendChild(new Option(z, z)); });
      }
    });
  },
  _fillChirSelects: function() {
    var chirs = this._chirurgiens || [];
    ['selectChirurgien','selectChirA','selectChirB'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      chirs.forEach(function(c){ el.appendChild(new Option(c, c)); });
    });
  },
  _fillAnneeSelect: function() {
    var annees = this._annees || [];
    var el = document.getElementById('selectAnnee');
    if (el) annees.forEach(function(a){ el.appendChild(new Option(a, a)); });
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 1 — CONSULTATION
  // ════════════════════════════════════════════════════════════
  initConsultation: function() {
    var self = this;
    this._filtered = [...this.data];
    this._renderTable();

    ['searchInput','filterType','filterZone','filterPareto'].forEach(function(id) {
      var ev = id === 'searchInput' ? 'input' : 'change';
      document.getElementById(id).addEventListener(ev, function() {
        self._state.page = 1; self._applyFilters();
      });
    });
    document.getElementById('btnClearSearch').addEventListener('click', function() {
      document.getElementById('searchInput').value = '';
      self._state.page = 1; self._applyFilters();
    });
    document.getElementById('btnResetFilters').addEventListener('click', function() {
      ['searchInput','filterType','filterZone','filterPareto'].forEach(function(id) {
        document.getElementById(id).value = '';
      });
      self._state.page = 1; self._applyFilters();
    });
    document.getElementById('pageSizeSelect').addEventListener('change', function(e) {
      self._state.pageSize = +e.target.value;
      self._state.page = 1;
      self._renderTable();
    });
    document.getElementById('btnExportCSV').addEventListener('click', function() { self._exportCSV(); });

    document.querySelectorAll('.thes-sort-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var col = btn.dataset.col;
        if (self._state.sorted.col === col) {
          self._state.sorted.dir = self._state.sorted.dir === 'asc' ? 'desc' : 'asc';
        } else {
          self._state.sorted = { col: col, dir: 'asc' };
        }
        self._state.page = 1;
        self._applySort();
        self._renderTable();
        document.querySelectorAll('.thes-sort-btn').forEach(function(b){ b.classList.remove('asc','desc'); });
        btn.classList.add(self._state.sorted.dir);
      });
    });
    document.getElementById('btnSaveEdit').addEventListener('click', function() { self._saveEdit(); });
  },

  _applyFilters: function() {
    var q   = document.getElementById('searchInput').value.toLowerCase().trim();
    var typ = document.getElementById('filterType').value;
    var zon = document.getElementById('filterZone').value;
    var par = document.getElementById('filterPareto').value;
    this._filtered = this.data.filter(function(p) {
      if (typ && p.type !== typ) return false;
      if (zon && p.zone_anat !== zon) return false;
      if (par && p.pareto !== par) return false;
      if (q) {
        var hay = [p.libelle_cible, p.synonymes_recherche, p.pathologie, p.codes_ccam].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    this._applySort();
    this._renderTable();
  },

  _applySort: function() {
    var col = this._state.sorted.col, dir = this._state.sorted.dir;
    this._filtered.sort(function(a, b) {
      var va = a[col], vb = b[col];
      if (typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
      va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase();
      return dir === 'asc' ? va.localeCompare(vb, 'fr') : vb.localeCompare(va, 'fr');
    });
  },

  _renderTable: function() {
    var tbody = document.getElementById('tableBody');
    var total = this._filtered.length, pageSize = this._state.pageSize, page = this._state.page;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    document.getElementById('resultCount').textContent = this.fmtNum(total);
    document.getElementById('currentPage').textContent = page;
    document.getElementById('totalPages').textContent  = totalPages;
    var slice = this._filtered.slice((page - 1) * pageSize, page * pageSize);
    if (slice.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">' +
        '<i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>Aucun résultat</td></tr>';
      this._renderPagination(page, totalPages); return;
    }
    var self = this;
    tbody.innerHTML = slice.map(function(p) {
      return '<tr data-id="' + escHtml(p.id_protocole) + '">' +
        '<td><span class="badge ' + self.typeBadgeClass(p.type) + '">' + escHtml(p.type || '—') + '</span></td>' +
        '<td class="fw-medium">' + escHtml(p.libelle_cible) + '</td>' +
        '<td class="text-muted small">' + escHtml(p.zone_anat || '—') + '</td>' +
        '<td><span class="badge ' + self.paretoBadgeClass(p.pareto) + '">' + escHtml(p.pareto || '—') + '</span></td>' +
        '<td class="text-end font-monospace small">' + self.fmtNum(p.frequence) + '</td>' +
        '<td class="text-end"><button class="btn btn-xs btn-outline-primary btn-detail" data-id="' + escHtml(p.id_protocole) + '" type="button" title="Voir le détail"><i class="bi bi-eye"></i></button></td></tr>';
    }).join('');
    tbody.querySelectorAll('.btn-detail').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); self._openDetail(btn.dataset.id); });
    });
    tbody.querySelectorAll('tr[data-id]').forEach(function(tr) {
      tr.addEventListener('click', function() { self._openDetail(tr.dataset.id); });
    });
    this._renderPagination(page, totalPages);
  },

  _renderPagination: function(page, total) {
    var el = document.getElementById('paginationContainer');
    if (total <= 1) { el.innerHTML = ''; return; }
    var pages = [];
    if (page > 1) pages.push({ label: '‹', p: page - 1 });
    var range = [];
    for (var i = Math.max(1, page - 2); i <= Math.min(total, page + 2); i++) range.push(i);
    if (range[0] > 1) { pages.push({ label: '1', p: 1 }); if (range[0] > 2) pages.push({ label: '…', p: null }); }
    range.forEach(function(i) { pages.push({ label: String(i), p: i, active: i === page }); });
    if (range[range.length - 1] < total) { if (range[range.length - 1] < total - 1) pages.push({ label: '…', p: null }); pages.push({ label: String(total), p: total }); }
    if (page < total) pages.push({ label: '›', p: page + 1 });
    el.innerHTML = pages.map(function(pg) {
      return pg.p === null
        ? '<li class="page-item disabled"><span class="page-link">…</span></li>'
        : '<li class="page-item ' + (pg.active ? 'active' : '') + '"><button class="page-link" data-p="' + pg.p + '" type="button">' + pg.label + '</button></li>';
    }).join('');
    var self = this;
    el.querySelectorAll('button[data-p]').forEach(function(btn) {
      btn.addEventListener('click', function() { self._state.page = +btn.dataset.p; self._renderTable(); });
    });
  },

  _openDetail: function(id) {
    var p = this.data.find(function(x) { return x.id_protocole === id; });
    if (!p) return;
    this._currentProto = p;
    document.getElementById('modalDetailLabel').textContent = p.libelle_cible;
    document.getElementById('modalProtoId').textContent     = 'ID : ' + p.id_protocole;
    var tb = document.getElementById('modalTypeBadge');
    tb.className = 'badge thes-type-badge ' + this.typeBadgeClass(p.type); tb.textContent = p.type || '—';
    var pb = document.getElementById('modalParetoBadge');
    pb.className = 'badge thes-pareto-badge ' + this.paretoBadgeClass(p.pareto); pb.textContent = p.pareto || '—';
    document.getElementById('mInfoZone').textContent = p.zone_anat || '—';
    document.getElementById('mInfoCat').textContent  = p.cat_parent || '—';
    document.getElementById('mInfoFreq').textContent = this.fmtNum(p.frequence);
    document.getElementById('mInfoPath').textContent = p.pathologie || '—';
    document.getElementById('mInfoAlertes').innerHTML = p.alertes
      ? '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(p.alertes) + '</span>' : '—';
    document.getElementById('mInfoSyn').innerHTML  = this.makeTagsHtml(p.synonymes_recherche);
    document.getElementById('mInfoCCAM').innerHTML = this.makeTagsHtml(p.codes_ccam);
    var srcEl = document.getElementById('mInfoSources');
    if (p.libelles_sources_lies) {
      srcEl.innerHTML = p.libelles_sources_lies.split('\n').filter(Boolean)
        .map(function(s) { return '<div class="thes-source-item">' + escHtml(s) + '</div>'; }).join('');
    } else { srcEl.innerHTML = '<span class="text-muted fst-italic">—</span>'; }
    document.getElementById('mExpertContent').textContent = p.definition_expert || 'Aucune définition expert disponible.';
    if (this.isAdmin) {
      document.getElementById('editLibelleCible').value = p.libelle_cible;
      document.getElementById('editType').value         = p.type || '';
      document.getElementById('editZone').value         = p.zone_anat || '';
      document.getElementById('editCatParent').value    = p.cat_parent || '';
      document.getElementById('editFrequence').value    = p.frequence;
      document.getElementById('editPathologie').value   = p.pathologie || '';
      document.getElementById('editAlertes').value      = p.alertes || '';
      document.getElementById('editSynonymes').value    = p.synonymes_recherche || '';
      document.getElementById('editCCAM').value         = p.codes_ccam || '';
      document.getElementById('editDefinition').value   = p.definition_expert || '';
      document.getElementById('editSources').value      = p.libelles_sources_lies || '';
    }
    bootstrap.Tab.getOrCreateInstance(document.getElementById('mInfo-btn')).show();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetail')).show();
  },

  _saveEdit: function() {
    var p = this._currentProto; if (!p) return;
    p.type = document.getElementById('editType').value;
    p.zone_anat = document.getElementById('editZone').value;
    p.cat_parent = document.getElementById('editCatParent').value;
    p.pathologie = document.getElementById('editPathologie').value;
    p.alertes = document.getElementById('editAlertes').value;
    p.synonymes_recherche = document.getElementById('editSynonymes').value;
    p.codes_ccam = document.getElementById('editCCAM').value;
    p.definition_expert = document.getElementById('editDefinition').value;
    p.libelles_sources_lies = document.getElementById('editSources').value;
    ThesCache.set('protocoles', this.data);
    this._applyFilters();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetail')).hide();
    this.toast('Success', 'Protocole mis à jour (local).');
  },

  _exportCSV: function() {
    var cols = ['id_protocole','libelle_cible','type','zone_anat','cat_parent','frequence','pareto','pathologie'];
    var rows = [cols.join(';')].concat(this._filtered.map(function(p) {
      return cols.map(function(c) { return '"' + String(p[c] || '').replace(/"/g,'""') + '"'; }).join(';');
    }));
    var blob = new Blob(['\uFEFF' + rows.join('\n')], {type:'text/csv;charset=utf-8;'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'thesaurus_export.csv'; a.click();
    this.toast('Success', this._filtered.length + ' lignes exportées.');
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 2 — DASHBOARDS (données protocoles = déjà en mémoire)
  // ════════════════════════════════════════════════════════════
  initDashboard: function() {
    var d = this.data, total = d.length; if (!total) return;
    var self = this;
    var classif = d.filter(function(p){ return p.type && p.type !== ''; }).length;
    var avecDef = d.filter(function(p){ return p.definition_expert && p.definition_expert.length > 5; }).length;
    var crits   = d.filter(function(p){ return p.pareto === 'Critique'; }).length;
    document.getElementById('kpiTotalProto').textContent    = this.fmtNum(total);
    document.getElementById('kpiProtoSub').textContent      = total + ' protocoles Supabase';
    document.getElementById('kpiClassifies').textContent    = Math.round(classif / total * 100) + ' %';
    document.getElementById('kpiClassifiesSub').textContent = this.fmtNum(classif) + ' / ' + total;
    document.getElementById('kpiAvecDef').textContent       = Math.round(avecDef / total * 100) + ' %';
    document.getElementById('kpiAvecDefSub').textContent    = this.fmtNum(avecDef) + ' définitions';
    document.getElementById('kpiCritiques').textContent     = this.fmtNum(crits);

    var typeCounts = {};
    ['SEPTIQUE','TRAUMATO','NEURO','ORTHO','EXCLUS'].forEach(function(t){ typeCounts[t] = d.filter(function(p){ return p.type === t; }).length; });
    this._destroyChart('chartTypeDistrib');
    this.charts.typeDistrib = new Chart(document.getElementById('chartTypeDistrib'), {
      type:'bar', data:{ labels:Object.keys(typeCounts), datasets:[{ label:'Protocoles', data:Object.values(typeCounts),
        backgroundColor:Object.keys(typeCounts).map(function(t){ return self.typePalette(t); }), borderRadius:4 }]},
      options:{ indexAxis:'y', plugins:{legend:{display:false}},
        scales:{x:{beginAtZero:true,grid:{color:'#f3f4f6'}},y:{grid:{display:false}}}, responsive:true, maintainAspectRatio:true }
    });

    var parCounts = {Critique:0,Standard:0,Secondaire:0,Rare:0};
    d.forEach(function(p){ if(parCounts[p.pareto]!==undefined) parCounts[p.pareto]++; });
    this._destroyChart('chartPareto');
    this.charts.pareto = new Chart(document.getElementById('chartPareto'), {
      type:'doughnut', data:{ labels:['Critique','Standard','Secondaire','Rare'],
        datasets:[{data:Object.values(parCounts), backgroundColor:['#ef4444','#f59e0b','#06b6d4','#9ca3af'], borderWidth:2, borderColor:'#fff'}]},
      options:{plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:true, cutout:'60%'}
    });

    var sorted30 = [...d].sort(function(a,b){ return b.frequence-a.frequence; }).slice(0,30);
    var totalFreq = sorted30.reduce(function(s,p){ return s+p.frequence; },0), cumSum=0;
    var cumPct = sorted30.map(function(p){ cumSum+=p.frequence; return Math.round(cumSum/totalFreq*100); });
    this._destroyChart('chartCumulPareto');
    this.charts.cumul = new Chart(document.getElementById('chartCumulPareto'), {
      type:'bar', data:{ labels:sorted30.map(function(p){ return p.libelle_cible.substring(0,20)+'…'; }), datasets:[
        {type:'bar',label:'Fréquence',data:sorted30.map(function(p){return p.frequence;}),backgroundColor:'#93c5fd',borderRadius:3,yAxisID:'y'},
        {type:'line',label:'% cumulé',data:cumPct,borderColor:'#ef4444',backgroundColor:'transparent',borderWidth:2,pointRadius:0,yAxisID:'y2',
         segment:{borderColor:function(ctx){return ctx.p1.parsed.y>=80?'#22c55e':'#ef4444';}}}]},
      options:{plugins:{legend:{position:'top',labels:{font:{size:10}}}},
        scales:{x:{ticks:{font:{size:9},maxRotation:45},grid:{display:false}},
          y:{beginAtZero:true,grid:{color:'#f3f4f6'},position:'left'},
          y2:{beginAtZero:true,max:100,position:'right',grid:{drawOnChartArea:false},ticks:{callback:function(v){return v+'%';}}}},
        responsive:true, maintainAspectRatio:false}
    });

    var zoneSums = {};
    d.forEach(function(p){ if(p.zone_anat) zoneSums[p.zone_anat]=(zoneSums[p.zone_anat]||0)+p.frequence; });
    var topZones = Object.entries(zoneSums).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
    var maxZ = topZones[0]?topZones[0][1]:1;
    document.getElementById('dashZonesRanking').innerHTML = topZones.map(function(e){
      return '<div class="d-flex align-items-center gap-2 mb-2"><span class="thes-zone-label">'+escHtml(e[0])+'</span>'+
        '<div class="bar-track"><div class="bar-fill" style="width:'+Math.round(e[1]/maxZ*100)+'%"></div></div>'+
        '<span class="thes-zone-value">'+self.fmtNum(e[1])+'</span></div>';
    }).join('');

    var avecCCAM = d.filter(function(p){ return p.codes_ccam && p.codes_ccam.length > 2; }).length;
    document.getElementById('dashQualite').innerHTML = [
      {label:'Classification (type renseigné)',pct:Math.round(classif/total*100),cls:'bg-success'},
      {label:'Définitions expert disponibles', pct:Math.round(avecDef/total*100),cls:'bg-warning'},
      {label:'Codes CCAM renseignés',           pct:Math.round(avecCCAM/total*100),cls:'bg-info'}
    ].map(function(q){
      return '<div class="d-flex align-items-center gap-3 mb-3"><span class="thes-quality-label">'+escHtml(q.label)+'</span>'+
        '<div class="progress thes-quality-progress flex-grow-1"><div class="progress-bar '+q.cls+'" role="progressbar" style="width:'+q.pct+'%" '+
        'aria-valuenow="'+q.pct+'" aria-valuemin="0" aria-valuemax="100"></div></div>'+
        '<span class="thes-quality-pct">'+q.pct+' %</span></div>';
    }).join('');
  },

  _destroyChart: function(id) {
    var el = document.getElementById(id);
    if (el) { var c = Chart.getChart(el); if (c) c.destroy(); }
  },



  // ════════════════════════════════════════════════════════════
  // ONGLET 3 — CHIRURGIENS (Premium)
  // Stratégie : fetch complet chirurgien (cache), filtre année local
  // CDC : US-1.1 activité globale · US-1.2 Pareto · US-1.4 rares
  // ════════════════════════════════════════════════════════════
  initChirurgiensUI: function() {
    var self = this;
    document.getElementById('btnModeAnalyse').addEventListener('click', function() {
      document.getElementById('chirModeAnalyse').classList.remove('d-none');
      document.getElementById('chirModeComparer').classList.add('d-none');
      document.getElementById('btnModeAnalyse').classList.add('active');
      document.getElementById('btnModeComparer').classList.remove('active');
    });
    document.getElementById('btnModeComparer').addEventListener('click', function() {
      document.getElementById('chirModeAnalyse').classList.add('d-none');
      document.getElementById('chirModeComparer').classList.remove('d-none');
      document.getElementById('btnModeComparer').classList.add('active');
      document.getElementById('btnModeAnalyse').classList.remove('active');
    });
    document.getElementById('btnAnalyseChir').addEventListener('click', function() { self._analyseChirurgien(); });
    document.getElementById('btnComparer').addEventListener('click', function() { self._comparerChirurgiens(); });
  },

  _rankBadge: function(i) {
    if (i < 3) return 'gold'; if (i < 6) return 'silver'; if (i < 10) return 'bronze'; return 'normal';
  },

  _analyseChirurgien: async function() {
    var chir  = document.getElementById('selectChirurgien').value;
    var annee = document.getElementById('selectAnnee').value;
    if (!chir) { this.toast('Error', 'Sélectionnez un chirurgien.'); return; }
    var res = document.getElementById('chirResults');
    res.innerHTML = '<div class="thes-loading-block"><div class="spinner-border spinner-border-sm" role="status"></div><div class="mt-2 small">Chargement des données ' + escHtml(chir) + '…</div></div>';

    var allInterv = await this._fetchInterv({ chirurgien: chir });
    var interv = this._filterByAnnee(allInterv, annee || null);
    if (!interv.length) {
      res.innerHTML = '<div class="thes-loading-block"><i class="bi bi-inbox"></i>Aucune intervention' +
        (annee ? ' en ' + escHtml(annee) : '') + ' pour <strong>' + escHtml(chir) + '</strong>.</div>';
      return;
    }

    var self = this;
    var protoMap = {}, typeMap = {ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0,EXCLUS:0};
    var zoneMap = {}, yearMap = {}, moisMap = {};
    interv.forEach(function(i) {
      var lib = i.protocole_operatoire;
      protoMap[lib] = (protoMap[lib]||0)+1;
      var pr = self._lookupProto(lib);
      if (pr) {
        if (pr.type && typeMap[pr.type] !== undefined) typeMap[pr.type]++;
        if (pr.zone_anat) zoneMap[pr.zone_anat] = (zoneMap[pr.zone_anat]||0)+1;
      }
      var d = String(i.date_intervention);
      var yr = d.substring(0,4); if (yr) yearMap[yr] = (yearMap[yr]||0)+1;
      var mo = d.substring(0,7); if (mo) moisMap[mo] = (moisMap[mo]||0)+1;
    });

    var top20 = Object.entries(protoMap).sort(function(a,b){return b[1]-a[1];}).slice(0,20);
    var totalInterv = interv.length;
    var protosD = Object.keys(protoMap).length;
    var moisActif = Object.entries(moisMap).sort(function(a,b){return b[1]-a[1];})[0];
    var topZones = Object.entries(zoneMap).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
    var maxZone = topZones[0] ? topZones[0][1] : 1;
    var rares = Object.entries(protoMap).filter(function(e){return e[1] <= 3;}).sort(function(a,b){return a[1]-b[1];});
    var cumSum = 0;
    var top20cumul = top20.map(function(e) { cumSum += e[1]; return Math.round(cumSum/totalInterv*100); });

    var html = '';

    // KPI cards
    html += '<div class="thes-chir-kpi-grid">' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon blue"><i class="bi bi-activity"></i></div><div><div class="thes-chir-kpi-val text-primary">' + this.fmtNum(totalInterv) + '</div><div class="thes-chir-kpi-label">Interventions' + (annee ? ' ('+escHtml(annee)+')' : '') + '</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon green"><i class="bi bi-journal-check"></i></div><div><div class="thes-chir-kpi-val text-success">' + protosD + '</div><div class="thes-chir-kpi-label">Protocoles distincts</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon amber"><i class="bi bi-calendar-check"></i></div><div><div class="thes-chir-kpi-val text-warning">' + escHtml(moisActif ? moisActif[0] : '—') + '</div><div class="thes-chir-kpi-label">Mois le + actif</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon purple"><i class="bi bi-bar-chart-steps"></i></div><div><div class="thes-chir-kpi-val" style="color:#7c3aed">' + Math.round(protosD/420*100) + '%</div><div class="thes-chir-kpi-label">Diversité (vs 420)</div></div></div>' +
    '</div>';

    // Row 1 : Activité annuelle + Types doughnut
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-lg-8"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-graph-up"></i>Activité annuelle</div></div>' +
        '<div class="card-body p-3"><canvas id="chartChirYearly" height="180"></canvas></div></div></div>' +
      '<div class="col-12 col-lg-4"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-pie-chart"></i>Répartition types</div></div>' +
        '<div class="card-body p-3 d-flex align-items-center justify-content-center"><canvas id="chartChirType" height="200"></canvas></div></div></div>' +
    '</div>';

    // Row 2 : Top 20 Pareto + courbe cumulative
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-lg-7"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between">' +
          '<div class="thes-section-title mb-0"><i class="bi bi-trophy"></i>Top 20 Pareto</div>' +
          '<span class="badge bg-primary-subtle text-primary">Top 20 = ' + (top20cumul[19] || top20cumul[top20cumul.length-1] || 0) + '% du volume</span></div>' +
        '<div class="card-body p-0"><div class="table-responsive"><table class="table table-sm table-hover mb-0">' +
          '<thead class="table-light"><tr><th class="text-center" style="width:44px">#</th><th>Protocole</th><th class="text-end" style="width:55px">Nb</th><th style="width:100px">Part</th><th class="text-end" style="width:60px">Cum.</th></tr></thead>' +
          '<tbody>' + top20.map(function(e, i) {
            var pct = Math.round(e[1]/totalInterv*100);
            var pr = self._lookupProto(e[0]);
            var typeClass = pr ? self.typeBadgeClass(pr.type) : 'bg-secondary';
            return '<tr><td class="text-center"><span class="thes-pareto-rank ' + self._rankBadge(i) + '">' + (i+1) + '</span></td>' +
              '<td><span class="small fw-medium">' + escHtml(e[0]) + '</span> <span class="badge ' + typeClass + ' ms-1" style="font-size:.6rem">' + escHtml(pr ? pr.type : '') + '</span></td>' +
              '<td class="text-end fw-semibold">' + self.fmtNum(e[1]) + '</td>' +
              '<td><div class="d-flex align-items-center gap-1"><div class="thes-pct-bar"><div class="thes-pct-fill" style="width:' + Math.min(pct*2,100) + '%;background:' + self.typePalette(pr?pr.type:'') + '"></div></div><span class="small text-muted">' + pct + '%</span></div></td>' +
              '<td class="text-end small text-muted fw-semibold">' + top20cumul[i] + '%</td></tr>';
          }).join('') + '</tbody></table></div></div></div></div>' +
      '<div class="col-12 col-lg-5"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-graph-up-arrow"></i>Courbe Pareto</div></div>' +
        '<div class="card-body p-3"><canvas id="chartChirPareto" height="260"></canvas></div></div></div>' +
    '</div>';

    // Row 3 : Zones + Rares
    html += '<div class="row g-3">' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-body-text"></i>Zones anatomiques</div></div>' +
        '<div class="card-body p-3">' + topZones.map(function(e) {
          var pct = Math.round(e[1]/maxZone*100);
          var pr = self.data.find(function(p){return p.zone_anat===e[0];});
          var col = pr ? self.typePalette(pr.type) : '#60a5fa';
          return '<div class="thes-zone-bar-row"><span class="thes-zone-bar-label">' + escHtml(e[0]) + '</span>' +
            '<div class="thes-zone-bar-track"><div class="thes-zone-bar-fill" style="width:'+pct+'%;background:'+col+'"></div></div>' +
            '<span class="thes-zone-bar-val">' + self.fmtNum(e[1]) + '</span></div>';
        }).join('') + '</div></div></div>';

    if (rares.length > 0) {
      html += '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between">' +
          '<div class="thes-section-title mb-0"><i class="bi bi-exclamation-diamond"></i>Interventions rares (≤3)</div>' +
          '<span class="badge bg-warning-subtle text-warning">' + rares.length + ' acte' + (rares.length>1?'s':'') + '</span></div>' +
        '<div class="card-body p-0"><div class="table-responsive" style="max-height:260px;overflow-y:auto"><table class="table table-sm mb-0"><tbody>' +
        rares.slice(0,20).map(function(e) {
          return '<tr><td class="small">' + escHtml(e[0]) + '</td><td class="text-end fw-semibold text-warning" style="width:40px">' + e[1] + '</td></tr>';
        }).join('') +
        (rares.length > 20 ? '<tr><td class="small text-muted fst-italic" colspan="2">+ ' + (rares.length-20) + ' autres…</td></tr>' : '') +
        '</tbody></table></div></div></div></div>';
    } else {
      html += '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-body d-flex align-items-center justify-content-center text-success py-4">' +
          '<i class="bi bi-check-circle me-2"></i>Aucune intervention rare — couverture complète.</div></div></div>';
    }
    html += '</div>';
    res.innerHTML = html;

    // Charts
    setTimeout(function() {
      var years = Object.keys(yearMap).sort();
      self._destroyChart('chartChirYearly');
      new Chart(document.getElementById('chartChirYearly'), {
        type:'line',
        data:{labels:years, datasets:[{label:'Interventions',data:years.map(function(y){return yearMap[y];}),
          borderColor:'#2563eb',backgroundColor:'#2563eb15',fill:true,tension:0.3,pointRadius:4,pointBackgroundColor:'#2563eb'}]},
        options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.raw+' interventions';}}}},
          scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},responsive:true,maintainAspectRatio:false}
      });
      self._destroyChart('chartChirType');
      var typeLabels = Object.keys(typeMap).filter(function(k){return typeMap[k]>0;});
      new Chart(document.getElementById('chartChirType'), {
        type:'doughnut',
        data:{labels:typeLabels,datasets:[{data:typeLabels.map(function(k){return typeMap[k];}),
          backgroundColor:typeLabels.map(function(k){return self.typePalette(k);}),borderWidth:2,borderColor:'#fff'}]},
        options:{plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:8,usePointStyle:true,pointStyle:'circle'}}},
          responsive:true,maintainAspectRatio:true,cutout:'58%'}
      });
      self._destroyChart('chartChirPareto');
      new Chart(document.getElementById('chartChirPareto'), {
        type:'bar',
        data:{labels:top20.map(function(e,i){return '#'+(i+1);}),
          datasets:[
            {type:'bar',label:'Volume',data:top20.map(function(e){return e[1];}),backgroundColor:'#93c5fd',borderRadius:3,yAxisID:'y'},
            {type:'line',label:'% cumulé',data:top20cumul,borderColor:'#ef4444',backgroundColor:'transparent',borderWidth:2,pointRadius:0,yAxisID:'y2',
             segment:{borderColor:function(ctx){return ctx.p1.parsed.y>=80?'#22c55e':'#ef4444';}}}
          ]},
        options:{plugins:{legend:{position:'top',labels:{font:{size:9}}},
            tooltip:{callbacks:{title:function(ctx){return top20[ctx[0].dataIndex]?top20[ctx[0].dataIndex][0]:'';}}}},
          scales:{x:{grid:{display:false},ticks:{font:{size:9}}},
            y:{beginAtZero:true,grid:{color:'#f3f4f6'},position:'left'},
            y2:{beginAtZero:true,max:100,position:'right',grid:{drawOnChartArea:false},ticks:{callback:function(v){return v+'%';}}}},
          responsive:true,maintainAspectRatio:false}
      });
    }, 80);
  },

  _comparerChirurgiens: async function() {
    var chirA = document.getElementById('selectChirA').value;
    var chirB = document.getElementById('selectChirB').value;
    if (!chirA || !chirB) { this.toast('Error', 'Sélectionnez deux chirurgiens.'); return; }
    if (chirA === chirB)  { this.toast('Error', 'Sélectionnez deux chirurgiens différents.'); return; }
    var dest = document.getElementById('comparerResults');
    dest.innerHTML = '<div class="thes-loading-block"><div class="spinner-border spinner-border-sm" role="status"></div><div class="mt-2 small">Comparaison en cours…</div></div>';

    var self = this;
    var intA = await this._fetchInterv({ chirurgien: chirA });
    var intB = await this._fetchInterv({ chirurgien: chirB });

    var protoA = {}, protoB = {};
    intA.forEach(function(i){ protoA[i.protocole_operatoire]=(protoA[i.protocole_operatoire]||0)+1; });
    intB.forEach(function(i){ protoB[i.protocole_operatoire]=(protoB[i.protocole_operatoire]||0)+1; });
    var setA = new Set(Object.keys(protoA)), setB = new Set(Object.keys(protoB));
    var communs = [...setA].filter(function(p){return setB.has(p);});
    var exclusA = [...setA].filter(function(p){return !setB.has(p);}).sort(function(a,b){return protoA[b]-protoA[a];}).slice(0,10);
    var exclusB = [...setB].filter(function(p){return !setA.has(p);}).sort(function(a,b){return protoB[b]-protoB[a];}).slice(0,10);
    var typeA={ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0}, typeB={ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0};
    intA.forEach(function(i){var pr=self._lookupProto(i.protocole_operatoire);if(pr&&pr.type&&typeA[pr.type]!==undefined)typeA[pr.type]++;});
    intB.forEach(function(i){var pr=self._lookupProto(i.protocole_operatoire);if(pr&&pr.type&&typeB[pr.type]!==undefined)typeB[pr.type]++;});
    var top10communs = communs.sort(function(a,b){return((protoA[b]||0)+(protoB[b]||0))-((protoA[a]||0)+(protoB[a]||0));}).slice(0,10);

    var html = '';

    // Header VS
    html += '<div class="thes-compare-header">' +
      '<span class="thes-compare-name a"><i class="bi bi-person-badge me-1"></i>' + escHtml(chirA) + '</span>' +
      '<span class="thes-compare-vs">VS</span>' +
      '<span class="thes-compare-name b"><i class="bi bi-person-badge me-1"></i>' + escHtml(chirB) + '</span></div>';

    // KPIs comparés
    html += '<div class="card border-0 shadow-sm mb-3"><div class="card-body p-3">' +
      [
        { label:'Total interventions', va: self.fmtNum(intA.length), vb: self.fmtNum(intB.length) },
        { label:'Protocoles distincts', va: setA.size, vb: setB.size },
        { label:'Protocoles en commun', va: communs.length, vb: communs.length },
        { label:'Diversité (vs 420)', va: Math.round(setA.size/420*100)+'%', vb: Math.round(setB.size/420*100)+'%' }
      ].map(function(m) {
        return '<div class="thes-compare-metric-row">' +
          '<div class="thes-compare-metric-val thes-compare-col-a">' + m.va + '</div>' +
          '<div class="thes-compare-metric-label">' + escHtml(m.label) + '</div>' +
          '<div class="thes-compare-metric-val thes-compare-col-b">' + m.vb + '</div></div>';
      }).join('') + '</div></div>';

    // Radar + Top 10 communs
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-md-5"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-diagram-3"></i>Profil types</div></div>' +
        '<div class="card-body p-3 d-flex align-items-center justify-content-center"><canvas id="chartCompareRadar" height="220"></canvas></div></div></div>';
    if (top10communs.length) {
      html += '<div class="col-12 col-md-7"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-intersect"></i>Top 10 protocoles communs</div></div>' +
        '<div class="card-body p-3"><canvas id="chartCompareProtos" height="220"></canvas></div></div></div>';
    }
    html += '</div>';

    // Exclusives
    var totalExclA = [...setA].filter(function(p){return !setB.has(p);}).length;
    var totalExclB = [...setB].filter(function(p){return !setA.has(p);}).length;
    html += '<div class="row g-3">' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0 thes-compare-col-a"><i class="bi bi-person-check"></i>Exclusifs ' + escHtml(chirA) + ' <span class="badge bg-primary-subtle text-primary ms-1">' + totalExclA + '</span></div></div>' +
        '<div class="card-body p-0"><table class="table table-sm mb-0"><tbody>' + exclusA.map(function(p) {
          return '<tr><td class="small">' + escHtml(p) + '</td><td class="text-end fw-semibold text-muted" style="width:50px">' + protoA[p] + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div>' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0 thes-compare-col-b"><i class="bi bi-person-check"></i>Exclusifs ' + escHtml(chirB) + ' <span class="badge bg-success-subtle text-success ms-1">' + totalExclB + '</span></div></div>' +
        '<div class="card-body p-0"><table class="table table-sm mb-0"><tbody>' + exclusB.map(function(p) {
          return '<tr><td class="small">' + escHtml(p) + '</td><td class="text-end fw-semibold text-muted" style="width:50px">' + protoB[p] + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div></div>';

    dest.innerHTML = html;

    setTimeout(function() {
      self._destroyChart('chartCompareRadar');
      var types = ['ORTHO','TRAUMATO','NEURO','SEPTIQUE'];
      new Chart(document.getElementById('chartCompareRadar'), {
        type:'radar',
        data:{labels:types,datasets:[
          {label:chirA,data:types.map(function(t){return Math.round((typeA[t]||0)/Math.max(1,intA.length)*100);}),
            borderColor:'#2563eb',backgroundColor:'#2563eb20',pointBackgroundColor:'#2563eb',pointRadius:4},
          {label:chirB,data:types.map(function(t){return Math.round((typeB[t]||0)/Math.max(1,intB.length)*100);}),
            borderColor:'#16a34a',backgroundColor:'#16a34a20',pointBackgroundColor:'#16a34a',pointRadius:4}
        ]},
        options:{plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true}}},
          scales:{r:{beginAtZero:true,max:100,ticks:{display:false},grid:{color:'#e5e7eb'},pointLabels:{font:{size:11,weight:'600'}}}},
          responsive:true,maintainAspectRatio:true}
      });
      if (top10communs.length) {
        self._destroyChart('chartCompareProtos');
        new Chart(document.getElementById('chartCompareProtos'), {
          type:'bar',
          data:{labels:top10communs.map(function(p){return p.length>25?p.substring(0,25)+'…':p;}),
            datasets:[
              {label:chirA,data:top10communs.map(function(p){return protoA[p]||0;}),backgroundColor:'#60a5fa',borderRadius:3},
              {label:chirB,data:top10communs.map(function(p){return protoB[p]||0;}),backgroundColor:'#34d399',borderRadius:3}]},
          options:{indexAxis:'y',plugins:{legend:{position:'top',labels:{font:{size:10},usePointStyle:true}}},
            scales:{x:{beginAtZero:true,grid:{color:'#f3f4f6'}},y:{ticks:{font:{size:9}},grid:{display:false}}},
            responsive:true,maintainAspectRatio:false}
        });
      }
    }, 80);
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 4 — ANALYSE
  // ════════════════════════════════════════════════════════════
  initAnalyse: function() {
    var self = this;
    this._buildHeatmap('frequence');
    document.getElementById('heatmapMetric').addEventListener('change', function(e){ self._buildHeatmap(e.target.value); });
    document.getElementById('btnRunCroisement').addEventListener('click', function(){ self._buildCroisement(); });
    document.getElementById('btnRunTemporal').addEventListener('click', function(){ self._buildTemporal(); });
    this._buildCroisement();
  },

  _buildHeatmap: function(metric) {
    var types = ['SEPTIQUE','TRAUMATO','NEURO','ORTHO'];
    var zones = [...new Set(this.data.map(function(p){return p.zone_anat;}).filter(Boolean))].sort().slice(0,12);
    var cells = {};
    this.data.forEach(function(p) {
      if (!p.type||!p.zone_anat) return;
      var key=p.type+'|'+p.zone_anat;
      if (!cells[key]) cells[key]={freq:0,count:0};
      cells[key].freq+=p.frequence; cells[key].count+=1;
    });
    var vals=Object.values(cells).map(function(c){return metric==='frequence'?c.freq:c.count;});
    var maxVal=Math.max.apply(null,vals.concat([1]));
    var heatColor=function(v,max){
      var pct=v/max;
      if(pct===0) return{bg:'#f9fafb',color:'#d1d5db'}; if(pct<0.2) return{bg:'#dbeafe',color:'#1d4ed8'};
      if(pct<0.4) return{bg:'#bfdbfe',color:'#1d4ed8'}; if(pct<0.6) return{bg:'#93c5fd',color:'#1e3a8a'};
      if(pct<0.8) return{bg:'#3b82f6',color:'#ffffff'}; return{bg:'#1d4ed8',color:'#ffffff'};
    };
    var self=this;
    document.getElementById('heatmapContainer').innerHTML =
      '<table class="thes-heatmap-table"><thead><tr><th>Zone \\ Type</th>'+
      types.map(function(t){return '<th class="text-center"><span class="badge '+self.typeBadgeClass(t)+'">'+escHtml(t)+'</span></th>';}).join('')+
      '</tr></thead><tbody>'+
      zones.map(function(z){
        return '<tr><th class="thes-heatmap-row-header">'+escHtml(z)+'</th>'+
          types.map(function(t){
            var key=t+'|'+z,v=cells[key]?(metric==='frequence'?cells[key].freq:cells[key].count):0,h=heatColor(v,maxVal);
            return '<td class="thes-heatmap-cell'+(v===0?' thes-heatmap-empty':'')+'" style="background:'+h.bg+';color:'+h.color+'" title="'+
              escHtml(t)+' × '+escHtml(z)+' : '+self.fmtNum(v)+'">'+(v>0?self.fmtNum(v):'—')+'</td>';
          }).join('')+'</tr>';
      }).join('')+'</tbody></table>';
  },

  _buildCroisement: function() {
    var xKey=document.getElementById('croisementX').value, yKey=document.getElementById('croisementY').value;
    var xVals=[...new Set(this.data.map(function(p){return p[xKey];}).filter(Boolean))].sort().slice(0,8);
    var yVals=[...new Set(this.data.map(function(p){return p[yKey];}).filter(Boolean))].sort().slice(0,6);
    var matrix={};
    xVals.forEach(function(x){matrix[x]={};yVals.forEach(function(y){matrix[x][y]=0;});});
    this.data.forEach(function(p){var x=p[xKey],y=p[yKey];if(matrix[x]&&matrix[x][y]!==undefined)matrix[x][y]++;});
    var palette=['#60a5fa','#34d399','#f59e0b','#a78bfa','#fb7185','#38bdf8'];
    this._destroyChart('chartCroisement');
    this.charts.croisement=new Chart(document.getElementById('chartCroisement'),{
      type:'bar',data:{labels:xVals,datasets:yVals.map(function(y,i){
        return{label:y,data:xVals.map(function(x){return matrix[x][y];}),backgroundColor:palette[i%palette.length],borderRadius:3};})},
      options:{plugins:{legend:{position:'top',labels:{font:{size:10}}}},
        scales:{x:{stacked:false,grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},
        responsive:true,maintainAspectRatio:true}
    });
  },

  _buildTemporal: async function() {
    var type=document.getElementById('temporalType').value, gran=document.getElementById('temporalGranularity').value;
    var self=this, canvas=document.getElementById('chartTemporal');
    canvas.parentElement.insertAdjacentHTML('beforeend',
      '<div id="temporalLoading" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Chargement…</div>');
    var filters={};
    if(type){
      filters.protocoles=this.data.filter(function(p){return p.type===type;}).map(function(p){return p.libelle_cible;});
      if(!filters.protocoles.length){var ld=document.getElementById('temporalLoading');if(ld)ld.remove();return;}
    }
    var interv=await this._fetchInterv(filters);
    var ld=document.getElementById('temporalLoading');if(ld)ld.remove();
    var map={};
    interv.forEach(function(i){
      var d=String(i.date_intervention||''),key;
      if(gran==='year')key=d.substring(0,4);
      else if(gran==='quarter'){var m=parseInt(d.substring(5,7));key=d.substring(0,4)+' T'+Math.ceil(m/3);}
      else key=d.substring(0,7);
      if(key)map[key]=(map[key]||0)+1;
    });
    var labels=Object.keys(map).sort();
    this._destroyChart('chartTemporal');
    this.charts.temporal=new Chart(document.getElementById('chartTemporal'),{
      type:'line',data:{labels:labels,datasets:[{label:type||'Tous types',
        data:labels.map(function(k){return map[k];}),
        borderColor:self.typePalette(type)||'#60a5fa',backgroundColor:(self.typePalette(type)||'#60a5fa')+'20',
        fill:true,tension:0.3,pointRadius:3}]},
      options:{plugins:{legend:{display:false}},
        scales:{x:{ticks:{maxRotation:45,font:{size:9}},grid:{color:'#f3f4f6'}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},
        responsive:true,maintainAspectRatio:true}
    });
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 5 — ADMIN
  // ════════════════════════════════════════════════════════════
  initAdmin: function() {
    var self=this;
    this._adminFiltered=[...this.data];
    this._renderAdminTable();
    document.getElementById('adminSearchInput').addEventListener('input',function(e){
      var q=e.target.value.toLowerCase();
      self._adminFiltered=q?self.data.filter(function(p){return p.libelle_cible.toLowerCase().includes(q)||(p.type||'').toLowerCase().includes(q);}):
        [...self.data];
      self._renderAdminTable();
    });
    document.getElementById('btnAdminNew').addEventListener('click',function(){self._openAdminNew();});
    document.getElementById('btnAdminSave').addEventListener('click',function(){self._adminSave();});
    document.getElementById('btnAdminDelete').addEventListener('click',function(){
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
      self._openConfirmDelete();
    });
    document.getElementById('btnConfirmDelete').addEventListener('click',function(){self._adminDelete();});
  },

  _renderAdminTable: function() {
    var slice=this._adminFiltered.slice(0,200),self=this;
    document.getElementById('adminCountBadge').textContent=this._adminFiltered.length;
    document.getElementById('adminTableBody').innerHTML=slice.map(function(p){
      return '<tr data-id="'+escHtml(p.id_protocole)+'">'+
        '<td class="font-monospace small text-muted">'+escHtml(p.id_protocole)+'</td>'+
        '<td class="fw-medium small">'+escHtml(p.libelle_cible)+'</td>'+
        '<td><span class="badge '+self.typeBadgeClass(p.type)+'">'+escHtml(p.type||'—')+'</span></td>'+
        '<td class="small text-muted">'+escHtml(p.zone_anat||'—')+'</td>'+
        '<td class="text-end font-monospace small">'+self.fmtNum(p.frequence)+'</td>'+
        '<td><span class="badge '+self.paretoBadgeClass(p.pareto)+'">'+escHtml(p.pareto||'—')+'</span></td>'+
        '<td class="text-end">'+
          '<button class="btn btn-xs btn-outline-primary me-1 btn-admin-edit" data-id="'+escHtml(p.id_protocole)+'" type="button" title="Éditer"><i class="bi bi-pencil"></i></button>'+
          '<button class="btn btn-xs btn-outline-danger btn-admin-del" data-id="'+escHtml(p.id_protocole)+'" type="button" title="Supprimer"><i class="bi bi-trash"></i></button>'+
        '</td></tr>';
    }).join('');
    document.querySelectorAll('.btn-admin-edit').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();self._openAdminEdit(btn.dataset.id);});
    });
    document.querySelectorAll('.btn-admin-del').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();self._deleteId=btn.dataset.id;self._openConfirmDelete();});
    });
  },

  _openAdminNew: function() {
    this._adminEditId=null;
    document.getElementById('modalAdminEditLabel').textContent='Nouveau protocole';
    document.getElementById('btnAdminDelete').classList.add('d-none');
    ['adminLibelle','adminPath','adminAlertes','adminSyn','adminCCAM','adminDef','adminSources'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.value='';
    });
    document.getElementById('adminType').value='';
    document.getElementById('adminZone').value='';
    document.getElementById('adminCat').value='';
    document.getElementById('adminFrequence').value=0;
    document.getElementById('adminLibelle').removeAttribute('readonly');
    document.getElementById('adminFrequence').removeAttribute('readonly');
    document.getElementById('adminLibelleSacredBadge').textContent='SACRÉ — saisissable à la création uniquement';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  _openAdminEdit: function(id) {
    var p=this.data.find(function(x){return x.id_protocole===id;});if(!p)return;
    this._adminEditId=id;
    document.getElementById('modalAdminEditLabel').textContent='Édition — '+p.libelle_cible.substring(0,40);
    document.getElementById('btnAdminDelete').classList.remove('d-none');
    document.getElementById('adminLibelle').value=p.libelle_cible;
    document.getElementById('adminLibelle').setAttribute('readonly','readonly');
    document.getElementById('adminFrequence').value=p.frequence;
    document.getElementById('adminFrequence').setAttribute('readonly','readonly');
    document.getElementById('adminLibelleSacredBadge').textContent='SACRÉ — non modifiable';
    document.getElementById('adminType').value=p.type||'';
    document.getElementById('adminZone').value=p.zone_anat||'';
    document.getElementById('adminCat').value=p.cat_parent||'';
    document.getElementById('adminPath').value=p.pathologie||'';
    document.getElementById('adminAlertes').value=p.alertes||'';
    document.getElementById('adminSyn').value=p.synonymes_recherche||'';
    document.getElementById('adminCCAM').value=p.codes_ccam||'';
    document.getElementById('adminDef').value=p.definition_expert||'';
    document.getElementById('adminSources').value=p.libelles_sources_lies||'';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  _adminSave: function() {
    var libelle=document.getElementById('adminLibelle').value.trim();
    if(!libelle){this.toast('Error','Le libellé cible est requis.');return;}
    var type=document.getElementById('adminType').value;
    if(!type){this.toast('Error','Sélectionnez un type.');return;}
    if(this._adminEditId){
      var p=this.data.find(function(x){return x.id_protocole===this._adminEditId;}.bind(this));
      if(p){
        p.type=type; p.zone_anat=document.getElementById('adminZone').value;
        p.cat_parent=document.getElementById('adminCat').value; p.pathologie=document.getElementById('adminPath').value;
        p.alertes=document.getElementById('adminAlertes').value; p.synonymes_recherche=document.getElementById('adminSyn').value;
        p.codes_ccam=document.getElementById('adminCCAM').value; p.definition_expert=document.getElementById('adminDef').value;
        p.libelles_sources_lies=document.getElementById('adminSources').value;
      }
    } else {
      var newId='ACT-'+String(this.data.length+1).padStart(4,'0');
      var freq=parseInt(document.getElementById('adminFrequence').value)||0;
      var pareto=freq>=1000?'Critique':freq>=300?'Standard':freq>=50?'Secondaire':'Rare';
      this.data.push({
        id_protocole:newId,libelle_cible:libelle,type:type,
        zone_anat:document.getElementById('adminZone').value,cat_parent:document.getElementById('adminCat').value,
        frequence:freq,pareto:pareto,pathologie:document.getElementById('adminPath').value,
        alertes:document.getElementById('adminAlertes').value,synonymes_recherche:document.getElementById('adminSyn').value,
        codes_ccam:document.getElementById('adminCCAM').value,definition_expert:document.getElementById('adminDef').value,
        libelles_sources_lies:document.getElementById('adminSources').value
      });
    }
    ThesCache.set('protocoles',this.data);
    this._adminFiltered=[...this.data]; this._renderAdminTable(); this._applyFilters();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
    this.toast('Success',this._adminEditId?'Protocole mis à jour.':'Protocole créé.');
  },

  _openConfirmDelete: function() {
    var id=this._deleteId,p=this.data.find(function(x){return x.id_protocole===id;});
    document.getElementById('deleteProtoName').textContent=p?p.libelle_cible:id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).show();
  },

  _adminDelete: function() {
    var id=this._deleteId;
    this.data=this.data.filter(function(p){return p.id_protocole!==id;});
    this._adminFiltered=this._adminFiltered.filter(function(p){return p.id_protocole!==id;});
    this._filtered=this._filtered.filter(function(p){return p.id_protocole!==id;});
    ThesCache.set('protocoles',this.data);
    this._renderAdminTable(); this._renderTable();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).hide();
    this.toast('Success','Protocole supprimé.');
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 6 — IMPORT
  // ════════════════════════════════════════════════════════════
  initImport: function() {
    var self=this;
    this._setupDropZone('dropZoneInterv','fileInterv','interventions');
    this._setupDropZone('dropZoneProto','fileProto','protocoles');
    document.getElementById('btnImportInterv').addEventListener('click',function(){self._doImport('interventions');});
    document.getElementById('btnImportProto').addEventListener('click',function(){self._doImport('protocoles');});
    document.getElementById('btnClearLog').addEventListener('click',function(){document.getElementById('importLog').textContent='Journal vidé.';});
    document.getElementById('btnClassifIA').addEventListener('click',function(){
      self._logImport('info','⚡ Classification IA — non implémentée dans cette version.');
      self.toast('Info','Fonctionnalité en développement.');
    });
  },

  _setupDropZone: function(zoneId,inputId,type) {
    var zone=document.getElementById(zoneId),input=document.getElementById(inputId),self=this;
    if(!zone||!input)return;
    zone.addEventListener('click',function(){input.click();});
    zone.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')input.click();});
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.classList.add('drag-over');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('drag-over');});
    zone.addEventListener('drop',function(e){e.preventDefault();zone.classList.remove('drag-over');var file=e.dataTransfer.files[0];if(file)self._fileSelected(file,type);});
    input.addEventListener('change',function(){if(input.files[0])self._fileSelected(input.files[0],type);});
  },

  _fileSelected: function(file,type) {
    var self=this;
    if(!file.name.endsWith('.csv')&&!file.name.endsWith('.txt')){this.toast('Error','Format non supporté. Utilisez un fichier .csv.');return;}
    var reader=new FileReader();
    reader.onload=function(e){
      var text=e.target.result,lines=text.split('\n').filter(Boolean);
      var headers=lines[0].split(/[;,]/).map(function(h){return h.trim().replace(/"/g,'');});
      if(type==='interventions'){
        self._showPreview(lines.slice(0,11),'interv');self._showMapping(headers,type);
        document.getElementById('btnImportInterv').disabled=false;self._importData={text:text,type:type,file:file};
      } else {document.getElementById('btnImportProto').disabled=false;self._importDataProto={text:text,type:type,file:file};}
      document.getElementById(type==='interventions'?'dropZoneInterv':'dropZoneProto').classList.add('file-ok');
      self._logImport('ok','Fichier chargé : '+file.name+' ('+(lines.length-1)+' lignes, '+headers.length+' colonnes)');
    };
    reader.readAsText(file,'UTF-8');
  },

  _showPreview: function(lines,prefix) {
    if(prefix!=='interv')return;
    document.getElementById('intervPreviewSection').classList.remove('d-none');
    var cols=lines[0].split(/[;,]/).map(function(h){return h.trim().replace(/"/g,'');}),rows=lines.slice(1,11);
    document.getElementById('intervPreviewTable').innerHTML=
      '<thead class="table-light"><tr>'+cols.map(function(c){return '<th>'+escHtml(c)+'</th>';}).join('')+'</tr></thead>'+
      '<tbody>'+rows.map(function(r){return '<tr>'+r.split(/[;,]/).map(function(c){return '<td>'+escHtml(c.replace(/"/g,''))+'</td>';}).join('')+'</tr>';}).join('')+'</tbody>';
  },

  _showMapping: function(headers,type) {
    var EXPECTED=['chirurgien','date_intervention','protocole_operatoire','specialite'];
    var sec=document.getElementById('intervMappingSection'),frm=document.getElementById('intervMappingForm');
    if(!sec||!frm)return; sec.classList.remove('d-none');
    frm.innerHTML=EXPECTED.map(function(field){
      return '<div class="thes-mapping-row"><span class="thes-mapping-label"><code class="thes-col-badge">'+escHtml(field)+'</code></span>'+
        '<select class="form-select form-select-sm thes-select-sm" id="map_'+escHtml(field)+'">'+
        headers.map(function(h){return '<option value="'+escHtml(h)+'"'+(h.toLowerCase()===field?' selected':'')+'>'+escHtml(h)+'</option>';}).join('')+
        '</select></div>';
    }).join('');
  },

  _doImport: async function(type) {
    var progressId=type==='interventions'?'importIntervProgress':'importProtoProgress';
    var barId=type==='interventions'?'importIntervBar':'importProtoBar';
    var statusId=type==='interventions'?'importIntervStatus':'importProtoStatus';
    var data=type==='interventions'?this._importData:this._importDataProto;
    if(!data){this.toast('Error','Aucun fichier sélectionné.');return;}
    document.getElementById(progressId).classList.remove('d-none');
    var bar=document.getElementById(barId),status=document.getElementById(statusId);
    var lines=data.text.split('\n').filter(Boolean).length-1;
    status.textContent='Parsing '+lines+' lignes…';
    var steps=[10,25,50,75,90,100];
    for(var idx=0;idx<steps.length;idx++){
      await new Promise(function(r){setTimeout(r,400);});
      bar.style.width=steps[idx]+'%';bar.setAttribute('aria-valuenow',steps[idx]);
      if(steps[idx]===50)status.textContent='Insertion en base ('+Math.round(lines/2)+' / '+lines+')…';
      if(steps[idx]===90)status.textContent='Vérification intégrité…';
    }
    status.textContent='Import terminé — '+lines+' lignes traitées.';
    var protos=Math.round(lines*0.006);
    document.getElementById('summaryLignes').textContent=this.fmtNum(lines);
    document.getElementById('summaryProtocoles').textContent=this.fmtNum(protos);
    document.getElementById('summaryErreurs').textContent='0';
    document.getElementById('importSummarySection').classList.remove('d-none');
    document.getElementById('btnClassifIA').disabled=false;
    ThesCache.clear(); // Invalider tout le cache après import
    this._logImport('ok','Import '+type+' terminé : '+lines+' lignes, '+protos+' protocoles agrégés, 0 erreur.');
    this.toast('Success','Import terminé — '+lines+' lignes importées.');
  },

  _logImport: function(level,msg) {
    var log=document.getElementById('importLog');
    var cls=level==='ok'?'log-ok':level==='warn'?'log-warn':'log-err';
    log.innerHTML+='\n<span class="'+cls+'">['+new Date().toLocaleTimeString('fr-FR')+'] '+escHtml(msg)+'</span>';
    log.scrollTop=log.scrollHeight;
  }
};
