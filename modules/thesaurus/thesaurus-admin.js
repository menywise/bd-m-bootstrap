/* thesaurus-admin.js — BDB · CDS · Module thesaurus
   V2 — Filtres type/zone/pareto + pagination + colonne ID masquée */
Object.assign(ThesApp, {

  // ════════════════════════════════════════════════════════════
  // ONGLET 5 — ADMIN (CRUD Supabase réel)
  // ════════════════════════════════════════════════════════════
  _adminPage: 1,
  _adminPageSize: 50,
  _adminSort: { col: 'libelle_cible', dir: 'asc' },

  initAdmin: function() {
    var self = this;
    this._adminFiltered = [...this.data];
    this._adminFillZoneFilter();
    this._adminApplyFilters();
    this._adminRenderTable();
    this._adminRenderFamilies();
    this._adminRenderKPIs();

    // Recherche texte
    document.getElementById('adminSearchInput').addEventListener('input', function() {
      self._adminPage = 1; self._adminApplyFilters(); self._adminRenderTable();
    });

    // Filtres select
    ['adminFilterType', 'adminFilterZone', 'adminFilterPareto'].forEach(function(id) {
      document.getElementById(id).addEventListener('change', function() {
        self._adminPage = 1; self._adminApplyFilters(); self._adminRenderTable();
      });
    });

    // Reset filtres
    document.getElementById('btnAdminResetFilters').addEventListener('click', function() {
      document.getElementById('adminSearchInput').value = '';
      document.getElementById('adminFilterType').value = '';
      document.getElementById('adminFilterZone').value = '';
      document.getElementById('adminFilterPareto').value = '';
      self._adminPage = 1; self._adminApplyFilters(); self._adminRenderTable();
    });

    // CRUD buttons
    document.getElementById('btnAdminNew').addEventListener('click', function() { self._openAdminNew(); });
    document.getElementById('btnAdminSave').addEventListener('click', function() { self._adminSave(); });
    document.getElementById('btnAdminDelete').addEventListener('click', function() {
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
      self._openConfirmDelete();
    });
    document.getElementById('btnConfirmDelete').addEventListener('click', function() { self._adminDelete(); });

    // Tri colonnes
    document.querySelectorAll('.thes-admin-sort-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var col = btn.dataset.col;
        if (self._adminSort.col === col) {
          self._adminSort.dir = self._adminSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          self._adminSort = { col: col, dir: 'asc' };
        }
        self._adminPage = 1;
        self._adminApplySort();
        self._adminRenderTable();
        document.querySelectorAll('.thes-admin-sort-btn').forEach(function(b) { b.classList.remove('asc', 'desc'); });
        btn.classList.add(self._adminSort.dir);
      });
    });
  },

  _adminFillZoneFilter: function() {
    var zones = [...new Set(this.data.map(function(p) { return p.zone_anat; }).filter(Boolean))].sort();
    var el = document.getElementById('adminFilterZone');
    zones.forEach(function(z) { el.appendChild(new Option(z, z)); });
  },

  _adminFamilyKey: function(libelle) {
    var words = (libelle || '').split(/[\s\/]+/);
    var first = (words[0] || '').toUpperCase();
    // Mots trop courts ou articles → prendre les 2 premiers
    if (first.length <= 2 || ['DE', 'DU', 'LA', 'LE', 'UN'].indexOf(first) !== -1) {
      return (words.slice(0, 2).join(' ')).toUpperCase();
    }
    return first;
  },

  _adminRenderFamilies: function() {
    var self = this;
    var fam = {};
    this.data.forEach(function(p) {
      var key = self._adminFamilyKey(p.libelle_cible);
      if (!fam[key]) fam[key] = { count: 0, freq: 0, protos: [] };
      fam[key].count++;
      fam[key].freq += (p.frequence || 0);
      fam[key].protos.push(p.libelle_cible);
    });

    // Filtrer > 5 protocoles, trier par count desc
    var entries = Object.entries(fam)
      .filter(function(e) { return e[1].count > 5; })
      .sort(function(a, b) { return b[1].count - a[1].count; });

    document.getElementById('adminFamiliesCount').textContent = entries.length + ' familles';

    var tbody = document.getElementById('adminFamiliesBody');
    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted small py-3">Aucune famille &gt; 5 protocoles</td></tr>';
      return;
    }

    tbody.innerHTML = entries.map(function(e) {
      return '<tr class="thes-admin-family-row" data-family="' + escHtml(e[0]) + '" title="Cliquer pour filtrer">' +
        '<td class="small fw-medium">' + escHtml(e[0]) + '</td>' +
        '<td class="text-end font-monospace small fw-semibold">' + e[1].count + '</td>' +
        '<td class="text-end font-monospace small">' + self.fmtNum(e[1].freq) + '</td>' +
        '</tr>';
    }).join('');

    // Clic → filtre la table principale sur le mot famille
    tbody.querySelectorAll('.thes-admin-family-row').forEach(function(tr) {
      tr.addEventListener('click', function() {
        var word = tr.dataset.family;
        document.getElementById('adminSearchInput').value = word;
        document.getElementById('adminFilterType').value = '';
        document.getElementById('adminFilterZone').value = '';
        document.getElementById('adminFilterPareto').value = '';
        self._adminSort = { col: 'libelle_cible', dir: 'asc' };
        self._adminPage = 1;
        self._adminApplyFilters(); self._adminRenderTable();
        // Highlight active
        tbody.querySelectorAll('.thes-admin-family-row').forEach(function(r) { r.classList.remove('table-info'); });
        tr.classList.add('table-info');
      });
    });
  },

  _adminRenderKPIs: function() {
    var d = this.data, total = d.length;
    var active = d.filter(function(p) { return p.frequence > 5; }).length;
    var noDef = d.filter(function(p) { return !p.definition_expert || p.definition_expert.trim().length < 6; }).length;
    var noCcam = d.filter(function(p) { return !p.codes_ccam || p.codes_ccam.trim().length < 3; }).length;
    document.getElementById('adminKpiTotal').textContent = this.fmtNum(total);
    document.getElementById('adminKpiActive').textContent = this.fmtNum(active);
    document.getElementById('adminKpiNoDef').textContent = this.fmtNum(noDef);
    document.getElementById('adminKpiNoCcam').textContent = this.fmtNum(noCcam);
  },

  _adminApplyFilters: function() {
    var q   = (document.getElementById('adminSearchInput').value || '').toLowerCase().trim();
    var typ = document.getElementById('adminFilterType').value;
    var zon = document.getElementById('adminFilterZone').value;
    var par = document.getElementById('adminFilterPareto').value;

    this._adminFiltered = this.data.filter(function(p) {
      if (typ && p.type !== typ) return false;
      if (zon && p.zone_anat !== zon) return false;
      if (par && p.pareto !== par) return false;
      if (q) {
        var hay = [p.libelle_cible, p.type, p.zone_anat, p.synonymes_recherche,
                   p.pathologie, p.codes_ccam].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    this._adminApplySort();
  },

  _adminApplySort: function() {
    var col = this._adminSort.col, dir = this._adminSort.dir;
    this._adminFiltered.sort(function(a, b) {
      var va = a[col], vb = b[col];
      if (typeof va === 'number') return dir === 'asc' ? va - vb : vb - va;
      va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase();
      return dir === 'asc' ? va.localeCompare(vb, 'fr') : vb.localeCompare(va, 'fr');
    });
  },

  _adminRenderTable: function() {
    var total = this._adminFiltered.length;
    var ps = this._adminPageSize, page = this._adminPage;
    var totalPages = Math.max(1, Math.ceil(total / ps));
    if (page > totalPages) page = totalPages;
    this._adminPage = page;

    var slice = this._adminFiltered.slice((page - 1) * ps, page * ps);
    var self = this;

    // Compteurs
    document.getElementById('adminCountBadge').textContent = this.fmtNum(total);
    document.getElementById('adminTotalBadge').textContent = this.fmtNum(this.data.length);
    document.getElementById('adminCurrentPage').textContent = page;
    document.getElementById('adminTotalPages').textContent = totalPages;

    // Tableau
    var tbody = document.getElementById('adminTableBody');
    if (slice.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-5">' +
        '<i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>Aucun résultat</td></tr>';
      this._adminRenderPagination(page, totalPages);
      return;
    }

    tbody.innerHTML = slice.map(function(p) {
      return '<tr data-id="' + escHtml(p.id_protocole) + '">' +
        '<td><span class="badge ' + self.typeBadgeClass(p.type) + '">' + escHtml(p.type || '—') + '</span></td>' +
        '<td class="fw-medium small">' + escHtml(p.libelle_cible) + '</td>' +
        '<td class="small text-muted">' + escHtml(p.zone_anat || '—') + '</td>' +
        '<td><span class="badge ' + self.paretoBadgeClass(p.pareto) + '">' + escHtml(p.pareto || '—') + '</span></td>' +
        '<td class="text-end font-monospace small">' + self.fmtNum(p.frequence) + '</td>' +
        '<td style="text-align:right"><div style="display:flex;gap:4px;justify-content:flex-end">' +
          '<a class="app-icon-btn btn-admin-edit" data-id="' + escHtml(p.id_protocole) + '" title="Modifier" role="button"><i class="bi bi-pencil"></i></a>' +
          '<a class="app-icon-btn app-icon-btn--danger btn-admin-del" data-id="' + escHtml(p.id_protocole) + '" title="Supprimer" role="button"><i class="bi bi-trash"></i></a>' +
        '</div></td></tr>';
    }).join('');

    tbody.querySelectorAll('.btn-admin-edit').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); self._openAdminEdit(btn.dataset.id); });
    });
    tbody.querySelectorAll('.btn-admin-del').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); self._deleteId = btn.dataset.id; self._openConfirmDelete(); });
    });

    this._adminRenderPagination(page, totalPages);
  },

  _adminRenderPagination: function(page, total) {
    var el = document.getElementById('adminPagination');
    if (total <= 1) { el.innerHTML = ''; return; }
    var pages = [], self = this;
    if (page > 1) pages.push({ label: '\u2039', p: page - 1 });
    var range = [];
    for (var i = Math.max(1, page - 2); i <= Math.min(total, page + 2); i++) range.push(i);
    if (range[0] > 1) { pages.push({ label: '1', p: 1 }); if (range[0] > 2) pages.push({ label: '\u2026', p: null }); }
    range.forEach(function(i) { pages.push({ label: String(i), p: i, active: i === page }); });
    if (range[range.length - 1] < total) { if (range[range.length - 1] < total - 1) pages.push({ label: '\u2026', p: null }); pages.push({ label: String(total), p: total }); }
    if (page < total) pages.push({ label: '\u203A', p: page + 1 });
    el.innerHTML = pages.map(function(pg) {
      return pg.p === null
        ? '<li class="page-item disabled"><span class="page-link">\u2026</span></li>'
        : '<li class="page-item ' + (pg.active ? 'active' : '') + '"><button class="page-link" data-p="' + pg.p + '" type="button">' + pg.label + '</button></li>';
    }).join('');
    el.querySelectorAll('button[data-p]').forEach(function(btn) {
      btn.addEventListener('click', function() { self._adminPage = +btn.dataset.p; self._adminRenderTable(); });
    });
  },

  _openAdminNew: function() {
    this._adminEditId = null;
    document.getElementById('modalAdminEditLabel').textContent = 'Nouveau protocole';
    document.getElementById('btnAdminDelete').classList.add('d-none');
    ['adminLibelle', 'adminPath', 'adminAlertes', 'adminSyn', 'adminCCAM', 'adminDef', 'adminSources'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('adminType').value = '';
    document.getElementById('adminZone').value = '';
    document.getElementById('adminCat').value = '';
    document.getElementById('adminFrequence').value = 0;
    document.getElementById('adminLibelle').removeAttribute('readonly');
    document.getElementById('adminFrequence').removeAttribute('readonly');
    document.getElementById('adminLibelleSacredBadge').textContent = 'SACR\u00c9 \u2014 saisissable \u00e0 la cr\u00e9ation uniquement';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  _openAdminEdit: function(id) {
    var p = this.data.find(function(x) { return x.id_protocole === id; }); if (!p) return;
    this._adminEditId = id;
    document.getElementById('modalAdminEditLabel').textContent = '\u00c9dition \u2014 ' + p.libelle_cible.substring(0, 40);
    document.getElementById('btnAdminDelete').classList.remove('d-none');
    document.getElementById('adminLibelle').value = p.libelle_cible;
    document.getElementById('adminLibelle').setAttribute('readonly', 'readonly');
    document.getElementById('adminFrequence').value = p.frequence;
    document.getElementById('adminFrequence').setAttribute('readonly', 'readonly');
    document.getElementById('adminLibelleSacredBadge').textContent = 'SACR\u00c9 \u2014 non modifiable';
    document.getElementById('adminType').value = p.type || '';
    document.getElementById('adminZone').value = p.zone_anat || '';
    document.getElementById('adminCat').value = p.cat_parent || '';
    document.getElementById('adminPath').value = p.pathologie || '';
    document.getElementById('adminAlertes').value = p.alertes || '';
    document.getElementById('adminSyn').value = p.synonymes_recherche || '';
    document.getElementById('adminCCAM').value = p.codes_ccam || '';
    document.getElementById('adminDef').value = p.definition_expert || '';
    document.getElementById('adminSources').value = p.libelles_sources_lies || '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  // ── ADMIN SAVE — Supabase INSERT ou UPDATE ──
  _adminSave: async function() {
    var libelle = document.getElementById('adminLibelle').value.trim();
    if (!libelle) { this.toast('Error', 'Le libell\u00e9 cible est requis.'); return; }
    var type = document.getElementById('adminType').value;
    if (!type) { this.toast('Error', 'S\u00e9lectionnez un type.'); return; }

    var btn = document.getElementById('btnAdminSave');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Enregistrement\u2026';

    try {
      if (this._adminEditId) {
        // ── UPDATE (champs sacrés exclus) ──
        var payload = {
          type: type,
          zone_anat: document.getElementById('adminZone').value,
          cat_parent: document.getElementById('adminCat').value,
          pathologie: document.getElementById('adminPath').value,
          alertes: document.getElementById('adminAlertes').value,
          synonymes_recherche: document.getElementById('adminSyn').value,
          codes_ccam: document.getElementById('adminCCAM').value,
          definition_expert: document.getElementById('adminDef').value,
          libelles_sources_lies: document.getElementById('adminSources').value,
          updated_at: new Date().toISOString()
        };
        var resp = await window.bdb.from('thesaurus_protocoles')
          .update(payload).eq('id_protocole', this._adminEditId).select();
        if (resp.error) throw new Error(resp.error.message);
        var p = this.data.find(function(x) { return x.id_protocole === this._adminEditId; }.bind(this));
        if (p) Object.assign(p, payload);
        this.toast('Success', 'Protocole mis \u00e0 jour.');
      } else {
        // ── INSERT ──
        var freq = parseInt(document.getElementById('adminFrequence').value) || 0;
        var pareto = freq >= 1000 ? 'Critique' : freq >= 300 ? 'Standard' : freq >= 50 ? 'Secondaire' : 'Rare';
        var newId = 'ACT-' + String(this.data.length + 1).padStart(4, '0');
        var insertPayload = {
          id_protocole: newId,
          libelle_cible: libelle,
          type: type,
          zone_anat: document.getElementById('adminZone').value,
          cat_parent: document.getElementById('adminCat').value,
          specialite: '',
          frequence: freq,
          pareto: pareto,
          pathologie: document.getElementById('adminPath').value,
          alertes: document.getElementById('adminAlertes').value,
          synonymes_recherche: document.getElementById('adminSyn').value,
          codes_ccam: document.getElementById('adminCCAM').value,
          definition_expert: document.getElementById('adminDef').value,
          libelles_sources_lies: document.getElementById('adminSources').value
        };
        var resp = await window.bdb.from('thesaurus_protocoles').insert(insertPayload).select();
        if (resp.error) throw new Error(resp.error.message);
        var inserted = resp.data && resp.data[0] ? resp.data[0] : insertPayload;
        this.data.push(inserted);
        this.toast('Success', 'Protocole cr\u00e9\u00e9.');
      }
      ThesCache.set('protocoles', this.data);
      this._adminApplyFilters(); this._adminRenderTable(); this._applyFilters();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
    } catch(e) {
      this.toast('Error', 'Erreur Supabase : ' + e.message);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Enregistrer';
    }
  },

  _openConfirmDelete: function() {
    var id = this._deleteId, p = this.data.find(function(x) { return x.id_protocole === id; });
    document.getElementById('deleteProtoName').textContent = p ? p.libelle_cible : id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).show();
  },

  // ── ADMIN DELETE — Supabase DELETE ──
  _adminDelete: async function() {
    var id = this._deleteId;
    var btn = document.getElementById('btnConfirmDelete');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Suppression\u2026';

    try {
      var resp = await window.bdb.from('thesaurus_protocoles').delete().eq('id_protocole', id).select();
      if (resp.error) throw new Error(resp.error.message);
      if (!resp.data || resp.data.length === 0) { throw new Error('Suppression bloqu\u00e9e par RLS \u2014 v\u00e9rifier droits admin.'); }
      this.data = this.data.filter(function(p) { return p.id_protocole !== id; });
      this._adminFiltered = this._adminFiltered.filter(function(p) { return p.id_protocole !== id; });
      this._filtered = this._filtered.filter(function(p) { return p.id_protocole !== id; });
      ThesCache.set('protocoles', this.data);
      this._adminRenderTable(); this._renderTable();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).hide();
      this.toast('Success', 'Protocole supprim\u00e9.');
    } catch(e) {
      this.toast('Error', 'Erreur Supabase : ' + e.message);
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-trash me-1"></i>Supprimer';
    }
  }

});
