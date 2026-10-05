/* thesaurus-app.js — BDB · CDS · Module thesaurus
   V4 — UX premium : modale structurée, recherche étendue, export enrichi,
   skeleton loaders, cache footer, proposition nouvel acte.
   CRUD Supabase réel. RPC distinct + cache sessionStorage. */


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
  try {
    await window.bdbShellReady;
    await ThesApp.init(window.bdbUser.isAdmin);
  } catch (err) {
    var tb = document.getElementById('tableBody');
    if (tb) tb.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-5">' +
      '<i class="bi bi-exclamation-triangle d-block fs-3 mb-2"></i>Erreur de chargement : ' + escHtml(String(err.message || err)) + '</td></tr>';
  }
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
  _searchNotesEnabled : false,
  _searchDebounceTimer: null,
  _notesMatchCounts   : {},

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
    return str.split(/[,|]/).map(function(s){ return s.trim(); }).filter(Boolean)
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
      if (!self._dashInit) { self._dashInit = true; self.initDashboard().catch(function(){}); }
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
      document.getElementById('tab-recat-btn')?.addEventListener('shown.bs.tab', function() {
        if (!self._recatInit) { self.initRecat(); self._recatInit = true; }
      });
    }
  },


  // ════════════════════════════════════════════════════════════
  // CHARGEMENT DONNÉES + CACHE
  // ════════════════════════════════════════════════════════════
  loadData: async function() {
    // Mode démo
    if (window.bdbIsDemo && window.bdbIsDemo()) {
      var dr = await window.bdb.from('demo_thesaurus').select('*');
      this.data = dr.data || [];
      return;
    }
    // 1. Protocoles (420 lignes) — cache ou Supabase
    var cached = ThesCache.get('protocoles');
    if (cached && cached.length > 0) {
      this.data = cached;
    } else {
      try {
        var r = await window.bdb.from('thesaurus_protocoles')
          .select('*').order('frequence', { ascending: false });
        if (r.error) throw new Error(r.error.message);
        if (r.data && r.data.length > 0) {
          this.data = r.data;
          ThesCache.set('protocoles', r.data);
        }
      } catch(e) {
        this.toast('Error', 'Erreur chargement protocoles : ' + e.message);
      }
    }
    if (!this.data.length) {
      this.toast('Info', 'Tables thesaurus non disponibles — exécuter migration 018.');
      return;
    }

    // 2. Chirurgiens DISTINCT via RPC (10 lignes) — cache ou Supabase
    var cachedChir = ThesCache.get('chirurgiens');
    // Validation format V2 (objets avec .id et .label) — purge auto si ancien format string
    if (cachedChir && cachedChir.length > 0 && cachedChir[0].id && cachedChir[0].label) {
      this._chirurgiens = cachedChir;
    } else {
      if (cachedChir) ThesCache.set('chirurgiens', null); // purge ancien format
      try {
        var rc = await window.bdb.rpc('thesaurus_distinct_chirurgiens');
        if (rc.error) throw new Error(rc.error.message);
        if (rc.data) {
          this._chirurgiens = rc.data.map(function(r){
            return { id: r.id, nom: r.nom, prenom: r.prenom || '', specialite: r.specialite || '', actif: r.actif, label: r.nom + (r.prenom ? ' ' + r.prenom : '') };
          });
          ThesCache.set('chirurgiens', this._chirurgiens);
        }
      } catch(e) {
        this._chirurgiens = [];
        this.toast('Error', 'Erreur chargement chirurgiens : ' + e.message);
      }
    }

    // 3. Années DISTINCT via RPC (~20 lignes) — cache ou Supabase
    var cachedAn = ThesCache.get('annees');
    if (cachedAn && cachedAn.length > 0) {
      this._annees = cachedAn;
    } else {
      try {
        var ra = await window.bdb.rpc('thesaurus_distinct_annees');
        if (ra.error) throw new Error(ra.error.message);
        if (ra.data) {
          this._annees = ra.data.map(function(r){ return r.annee; });
          ThesCache.set('annees', this._annees);
        }
      } catch(e) {
        this._annees = [];
        this.toast('Error', 'Erreur chargement années : ' + e.message);
      }
    }
  },

  // Résoudre le label chirurgien depuis un uuid
  _chirLabel: function(chirId) {
    if (!chirId) return '';
    var c = (this._chirurgiens || []).find(function(x){ return x.id === chirId; });
    return c ? c.label : '';
  },

  // Requête interventions à la demande — filtrée + cache par chirurgien_id
  _fetchInterv: async function(filters) {
    // Cache par chirurgien complet (données figées historiques)
    if (filters.chirurgien_id && !filters.annee && !filters.protocoles) {
      var cached = ThesCache.get('interv_' + filters.chirurgien_id);
      if (cached) return cached;
    }

    var self = this;
    var all = [], from = 0, PAGE = 1000;

    // Résoudre libellés → uuid protocole_id pour filtre Supabase
    var protoUuids = null;
    if (filters.protocoles && filters.protocoles.length > 0) {
      protoUuids = filters.protocoles.map(function(lib) {
        var p = self.data.find(function(x) { return x.libelle_cible === lib; });
        return p ? p.id : null;
      }).filter(Boolean);
      if (protoUuids.length === 0) return [];
    }

    function buildQuery() {
      var q = window.bdb.from('thesaurus_interventions')
        .select('chirurgien_id,date_intervention,protocole_id,panseuse_id,lateralite,note');
      if (filters.chirurgien_id)   q = q.eq('chirurgien_id', filters.chirurgien_id);
      if (filters.chirurgien_ids)  q = q.in('chirurgien_id', filters.chirurgien_ids);
      if (filters.annee) {
        q = q.gte('date_intervention', filters.annee + '-01-01')
             .lte('date_intervention', filters.annee + '-12-31');
      }
      if (protoUuids) {
        q = q.in('protocole_id', protoUuids);
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

    // Enrichir : résoudre propriétés en mémoire depuis FK (colonnes legacy supprimées)
    all.forEach(function(i) {
      // Chirurgien label depuis FK
      i.chirurgien = self._chirLabel(i.chirurgien_id);
      // Protocole libellé + spécialité depuis FK
      if (i.protocole_id) {
        var pr = self.data.find(function(p){ return p.id === i.protocole_id; });
        if (pr) {
          i.protocole_operatoire = pr.libelle_cible;
          i.specialite = pr.specialite;
        }
      }
    });

    // Cache si requête chirurgien complet (pas filtré par année)
    if (filters.chirurgien_id && !filters.annee && !filters.protocoles) {
      ThesCache.set('interv_' + filters.chirurgien_id, all);
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
  // CACHE UI — indicateur footer + bouton purge admin
  // ════════════════════════════════════════════════════════════
  _initCacheUI: function(isAdmin) {
    var self = this;
    var isCached = !!ThesCache.get('protocoles');
    // Indicateur dans le footer (élément statique HTML)
    var indicator = document.getElementById('thes-cache-indicator');
    if (indicator) {
      indicator.className = 'badge border-0 ' + (isCached ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary');
      indicator.textContent = isCached ? '● cache' : '● live';
      indicator.title = isCached ? 'Données servies depuis le cache session' : 'Données chargées depuis Supabase';
    }
    // Bouton purge dans le footer (élément statique HTML, admin-only)
    var purgeBtn = document.getElementById('btnPurgeCache');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', function() {
        ThesCache.clear();
        self.toast('Success', 'Cache purgé — rechargement…');
        // UX32 : reload justifie — purge cache explicite, reinitialisation complete des donnees requise
        setTimeout(function() { location.reload(); }, 500);
      });
    }
  },


  // ════════════════════════════════════════════════════════════
  // REMPLISSAGE SELECTS
  // ════════════════════════════════════════════════════════════
  _fillZoneSelects: function() {
    var zones = [...new Set(this.data.map(function(p){ return p.zone_anat; }).filter(Boolean))].sort();
    ['filterZone','adminZone'].forEach(function(id) {
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
      chirs.forEach(function(c){ el.appendChild(new Option(c.label, c.id)); });
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

    ['filterType','filterZone','filterPareto','filterFiche'].forEach(function(id) {
      document.getElementById(id).addEventListener('change', function() {
        self._state.page = 1; self._applyFilters();
      });
    });
    document.getElementById('searchInput').addEventListener('input', function() {
      self._state.page = 1; self._onSearchInput();
    });
    document.getElementById('btnClearSearch').addEventListener('click', function() {
      document.getElementById('searchInput').value = '';
      self._clearNotesSearch();
      self._state.page = 1; self._applyFilters();
    });
    document.getElementById('btnResetFilters').addEventListener('click', function() {
      ['searchInput','filterType','filterZone','filterPareto','filterFiche'].forEach(function(id) {
        document.getElementById(id).value = '';
      });
      self._clearNotesSearch();
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

    // Toggle — recherche dans les notes d'interventions
    var chk = document.getElementById('chkSearchNotes');
    if (chk) {
      self._searchNotesEnabled = sessionStorage.getItem('bdb_thes_search_notes') === '1';
      chk.checked = self._searchNotesEnabled;
      var ind = document.getElementById('searchNotesIndicator');
      if (ind) ind.classList.toggle('d-none', !self._searchNotesEnabled);
      chk.addEventListener('change', function() {
        self._searchNotesEnabled = this.checked;
        sessionStorage.setItem('bdb_thes_search_notes', this.checked ? '1' : '0');
        var ind2 = document.getElementById('searchNotesIndicator');
        if (ind2) ind2.classList.toggle('d-none', !this.checked);
        if (!this.checked) self._clearNotesSearch();
        self._state.page = 1;
        self._onSearchInput();
      });
    }
  },

  _applyFilters: function() {
    var q   = document.getElementById('searchInput').value.toLowerCase().trim();
    var typ = document.getElementById('filterType').value;
    var zon = document.getElementById('filterZone').value;
    var par = document.getElementById('filterPareto').value;
    var fic = document.getElementById('filterFiche').value;
    var ficheSet = this._fichesProtoIds || null;
    var notesEnabled = this._searchNotesEnabled;
    var notesCounts  = this._notesMatchCounts;
    this._filtered = this.data.filter(function(p) {
      if (typ && p.type !== typ) return false;
      if (zon && p.zone_anat !== zon) return false;
      if (par && p.pareto !== par) return false;
      if (fic && ficheSet) {
        var has = ficheSet.has(p.id_protocole);
        if (fic === 'avec' && !has) return false;
        if (fic === 'sans' && has) return false;
      }
      if (q) {
        var hay = [p.libelle_cible, p.synonymes_recherche, p.pathologie, p.codes_ccam,
                   p.definition_expert, p.libelles_sources_lies, p.proposition_nouvel_acte_label].join(' ').toLowerCase();
        if (!hay.includes(q) && !(notesEnabled && notesCounts[p.id])) return false;
      }
      return true;
    });
    this._applySort();
    this._renderTable();
  },

  _onSearchInput: function() {
    var terme = document.getElementById('searchInput').value.trim();
    this._applyFilters();
    if (this._searchNotesEnabled && terme.length >= 3) {
      clearTimeout(this._searchDebounceTimer);
      var self = this;
      this._searchDebounceTimer = setTimeout(function() {
        self._searchNotes(terme);
      }, 500);
    } else {
      clearTimeout(this._searchDebounceTimer);
      if (Object.keys(this._notesMatchCounts).length > 0) {
        this._clearNotesSearch();
        this._applyFilters();
      }
    }
  },

  _clearNotesSearch: function() {
    this._notesMatchCounts = {};
    var statusEl = document.getElementById('notesSearchStatus');
    if (statusEl) statusEl.classList.add('d-none');
  },

  _searchNotes: async function(terme) {
    var statusEl = document.getElementById('notesSearchStatus');
    if (statusEl) {
      statusEl.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Recherche notes\u2026';
      statusEl.classList.remove('d-none');
    }

    var r = await window.bdb
      .from('thesaurus_interventions')
      .select('protocole_id')
      .ilike('note', '%' + terme + '%')
      .limit(500);

    if (r.error) {
      if (statusEl) {
        statusEl.textContent = 'La recherche étendue est momentanément indisponible — réessayez.';
        statusEl.classList.remove('d-none');
      }
      return;
    }

    var counts = {};
    (r.data || []).forEach(function(row) {
      if (row.protocole_id) {
        counts[row.protocole_id] = (counts[row.protocole_id] || 0) + 1;
      }
    });
    this._notesMatchCounts = counts;

    var nbProtos = Object.keys(counts).length;
    if (statusEl) {
      statusEl.textContent = nbProtos > 0
        ? nbProtos + ' protocole(s) via notes'
        : 'Les notes ne mentionnent pas \u00ab\u00a0' + terme + '\u00a0\u00bb \u2014 essayez avec d\u0027autres mots.';
      statusEl.classList.remove('d-none');
    }

    this._applyFilters();
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
        '<i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>Aucun protocole ne correspond — essayez avec d\'autres mots.</td></tr>';
      this._renderPagination(page, totalPages); return;
    }
    var self = this;
    tbody.innerHTML = slice.map(function(p) {
      return '<tr data-id="' + escHtml(p.id_protocole) + '">' +
        '<td><span class="badge ' + self.typeBadgeClass(p.type) + '">' + escHtml(p.type || '—') + '</span></td>' +
        '<td class="fw-medium">' + escHtml(p.libelle_cible) +
          (self._notesMatchCounts[p.id] ? ' <span class="badge bg-info bg-opacity-25 text-info">' + self._notesMatchCounts[p.id] + ' notes</span>' : '') +
        '</td>' +
        '<td class="text-muted small">' + escHtml(p.zone_anat || '—') + '</td>' +
        '<td><span class="badge ' + self.paretoBadgeClass(p.pareto) + '">' + escHtml(p.pareto || '—') + '</span></td>' +
        '<td class="text-end font-monospace small">' + self.fmtNum(p.frequence) + '</td>' +
        '<td style="text-align:right"><div style="display:flex;gap:4px;justify-content:flex-end">' +
          '<a class="app-icon-btn btn-detail" data-id="' + escHtml(p.id_protocole) + '" title="Voir" role="button"><i class="bi bi-eye"></i></a>' +
          '<a class="app-icon-btn btn-workbench" data-uuid="' + escHtml(p.id) + '" title="Modifier" role="button"><i class="bi bi-pencil"></i></a>' +
        '</div></td></tr>';
    }).join('');
    tbody.querySelectorAll('.btn-workbench').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); ThesWorkbench.open(btn.dataset.uuid); });
    });
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
    document.getElementById('modalProtoId').textContent     = p.id_protocole;
    var tb = document.getElementById('modalTypeBadge');
    tb.className = 'badge thes-type-badge ' + this.typeBadgeClass(p.type); tb.textContent = p.type || '—';
    var pb = document.getElementById('modalParetoBadge');
    pb.className = 'badge thes-pareto-badge ' + this.paretoBadgeClass(p.pareto); pb.textContent = p.pareto || '—';

    // Section Identification
    var propEl = document.getElementById('mInfoProposition');
    if (p.proposition_nouvel_acte_label && p.proposition_nouvel_acte_label.trim()) {
      propEl.textContent = p.proposition_nouvel_acte_label;
      propEl.classList.remove('d-none');
    } else {
      propEl.classList.add('d-none');
    }
    document.getElementById('mInfoPath').textContent = p.pathologie || '—';
    document.getElementById('mInfoFreq').textContent = this.fmtNum(p.frequence);
    document.getElementById('mInfoAlertes').innerHTML = p.alertes
      ? '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(p.alertes) + '</span>'
      : '<span class="text-muted fst-italic">—</span>';

    // Section Classification
    document.getElementById('mInfoZone').textContent = p.zone_anat || '—';
    document.getElementById('mInfoCat').textContent  = p.cat_parent || '—';
    document.getElementById('mInfoCCAM').innerHTML   = this.makeTagsHtml(p.codes_ccam);

    // Section Synonymes
    document.getElementById('mInfoSyn').innerHTML = this.makeTagsHtml(p.synonymes_recherche);

    // Section Sources
    var srcEl = document.getElementById('mInfoSources');
    if (p.libelles_sources_lies) {
      srcEl.innerHTML = p.libelles_sources_lies.split('\n').filter(Boolean)
        .map(function(s) { return '<div class="thes-source-item">' + escHtml(s) + '</div>'; }).join('');
    } else { srcEl.innerHTML = '<span class="text-muted fst-italic">—</span>'; }

    // Onglet Expert — enrichi
    var expertContent = document.getElementById('mExpertContent');
    expertContent.textContent = p.definition_expert || 'Aucune définition expert disponible.';
    var etb = document.getElementById('mExpertTypeBadge');
    etb.className = 'badge ' + this.typeBadgeClass(p.type); etb.textContent = p.type || '—';
    document.getElementById('mExpertTitle').textContent = p.libelle_cible;
    var ccamBlock = document.getElementById('mExpertCcam');
    if (p.codes_ccam && p.codes_ccam.trim()) {
      document.getElementById('mExpertCcamValue').textContent = p.codes_ccam;
      ccamBlock.classList.remove('d-none');
    } else {
      ccamBlock.classList.add('d-none');
    }

    bootstrap.Tab.getOrCreateInstance(document.getElementById('mInfo-btn')).show();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetail')).show();
  },

  _exportCSV: function() {
    var cols = ['id_protocole','libelle_cible','type','zone_anat','cat_parent','frequence','pareto',
                'pathologie','codes_ccam','synonymes_recherche','definition_expert','libelles_sources_lies','proposition_nouvel_acte_label'];
    var rows = [cols.join(';')].concat(this._filtered.map(function(p) {
      return cols.map(function(c) { return '"' + String(p[c] || '').replace(/"/g,'""') + '"'; }).join(';');
    }));
    var blob = new Blob(['\uFEFF' + rows.join('\n')], {type:'text/csv;charset=utf-8;'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'thesaurus_export.csv'; a.click();
    this.toast('Success', this._filtered.length + ' lignes exportées.');
  }

};

// Recherche globale BDB (optionnel — si conteneur présent)
if (document.getElementById('searchContainer')) {
  BdbSearch.init({ container: '#searchContainer', showBar: false });
}
