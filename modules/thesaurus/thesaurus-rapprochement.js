/* thesaurus-rapprochement.js — BDB · CDS · Onglet 7 Thésaurus
   Interface de décision humaine : rapprochement fiches papier ↔ protocoles BDB.
   Doctrine : pas de score, pas d'algo. Manu voit, recherche, décide.
   Source    : thesaurus_fiches_papier (Supabase)
   Protocoles: thesaurus_protocoles (libelle_cible + synonymes_recherche ILIKE) */

var ThesRappr = (function () {
  'use strict';

  /* ═══ ÉTAT ════════════════════════════════════════════════════ */
  var TABLE_FICHES     = 'thesaurus_fiches_papier';
  var TABLE_PROTOCOLES = 'thesaurus_protocoles';

  var _rows      = [];
  var _filterChir   = '';
  var _filterStatut = '';
  var _filterText   = '';
  var _sortCol      = '';
  var _sortDir      = 1;
  var _activeChir   = null;
  var _inited       = false;

  var _modalFicheId  = null;
  var _modalFicheNom = '';
  var _searchTimer   = null;
  var _modalTimer    = null;

  /* ═══ ABRÉVIATIONS ════════════════════════════════════════════ */
  var ABBREVS = {
    'PTH'    : 'PROTHESE TOTALE HANCHE',
    'PTG'    : 'PROTHESE TOTALE GENOU',
    'PTE'    : 'PROTHESE TOTALE EPAULE',
    'PIH'    : 'PROTHESE INTERMEDIAIRE HANCHE',
    'LCA'    : 'LIGAMENT CROISE ANTERIEUR',
    'KJ'     : 'KOENIG JUDET',
    'DHS'    : 'VIS PLAQUE DHS',
    'EMC'    : 'ENCLOUAGE CENTROMEDULLAIRE',
    'ARTHRO' : 'ARTHROSCOPIE',
    'HV'     : 'HALLUX VALGUS',
    'HR'     : 'HALLUX RIGIDUS',
    'SCC'    : 'SYNDROME CANAL CARPIEN',
    'SDC'    : 'SYNDROME DE QUERVAIN',
    'DDB'    : 'DOIGT A RESSORT',
    'RCR'    : 'REPARATION COIFFE ROTATEURS'
  };

  function _expandAbbrevs(term) {
    var result = term.toUpperCase();
    Object.keys(ABBREVS).forEach(function (abbr) {
      var re = new RegExp('\\b' + abbr + '\\b', 'g');
      result = result.replace(re, ABBREVS[abbr]);
    });
    return result;
  }

  /* ═══ INIT ════════════════════════════════════════════════════ */
  async function init() {
    if (_inited) return;
    _inited = true;

    _showState('loading');
    try {
      var data = await _loadFiches();
      if (!data || data.length === 0) { _showState('empty'); return; }
      _rows = data;
      _initChirSelect();
      _bindEvents();
      _showState('content');
      _render();
    } catch (e) {
      _showState('error', e.message || 'Erreur chargement fiches.');
    }
  }

  /* ═══ ÉTATS DOM ═══════════════════════════════════════════════ */
  function _showState(state, msg) {
    ['rapprLoading', 'rapprEmpty', 'rapprError', 'rapprContent'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('d-none');
    });
    var map = {
      loading : 'rapprLoading',
      empty   : 'rapprEmpty',
      error   : 'rapprError',
      content : 'rapprContent'
    };
    var target = document.getElementById(map[state]);
    if (target) target.classList.remove('d-none');
    if (state === 'error' && msg) {
      var errEl = document.getElementById('rapprErrorMsg');
      if (errEl) errEl.textContent = msg;
    }
  }

  /* ═══ CHARGEMENT FICHES ═══════════════════════════════════════ */
  async function _loadFiches() {
    if (!window.bdb) throw new Error('Client Supabase non disponible.');
    var resp = await window.bdb
      .from(TABLE_FICHES)
      .select('id, chirurgien, nom_nettoye, statut, protocole_id, thesaurus_protocoles(id_protocole, libelle_cible)')
      .order('chirurgien', { ascending: true })
      .order('nom_nettoye', { ascending: true });

    if (resp.error) throw new Error(resp.error.message);
    return (resp.data || []).map(function (r) {
      var prot = r.thesaurus_protocoles || null;
      return {
        id           : r.id,
        chirurgien   : r.chirurgien,
        nom_nettoye  : r.nom_nettoye,
        statut       : r.statut || 'A valider (fort)',
        protocole_id : r.protocole_id || null,
        libelle_cible: prot ? prot.libelle_cible : '',
        id_protocole : prot ? prot.id_protocole  : ''
      };
    });
  }

  /* ═══ FILTRE CHIRURGIEN ═══════════════════════════════════════ */
  function _initChirSelect() {
    var sel = document.getElementById('rapprSelChir');
    if (!sel) return;
    while (sel.options.length > 1) sel.remove(1);
    var seen = {}, chirs = [];
    _rows.forEach(function (r) {
      if (!seen[r.chirurgien]) { seen[r.chirurgien] = true; chirs.push(r.chirurgien); }
    });
    chirs.sort().forEach(function (c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
  }

  /* ═══ EVENTS ══════════════════════════════════════════════════ */
  function _bindEvents() {
    var selChir     = document.getElementById('rapprSelChir');
    var selStatut   = document.getElementById('rapprSelStatut');
    var txtSearch   = document.getElementById('rapprTxtSearch');
    var btnReset    = document.getElementById('rapprBtnReset');
    var btnExport   = document.getElementById('rapprBtnExport');
    var summBody    = document.getElementById('rapprSummaryBody');
    var mainThead   = document.querySelector('#rapprMainTable thead');
    var mainBody    = document.getElementById('rapprMainBody');
    var modalSearch = document.getElementById('rapprModalSearch');
    var modalEl     = document.getElementById('modalRapprLier');

    if (selChir) selChir.addEventListener('change', function () {
      _filterChir = this.value; _activeChir = null; _clearChirHighlight(); _render();
    });
    if (selStatut) selStatut.addEventListener('change', function () {
      _filterStatut = this.value; _render();
    });
    if (txtSearch) txtSearch.addEventListener('input', function () {
      clearTimeout(_searchTimer);
      var v = this.value;
      _searchTimer = setTimeout(function () { _filterText = v.toLowerCase(); _render(); }, 200);
    });
    if (btnReset)  btnReset.addEventListener('click', _resetFilters);
    if (btnExport) btnExport.addEventListener('click', _exportCSV);

    if (mainThead) mainThead.addEventListener('click', function (e) {
      var th = e.target.closest('th[data-col]');
      if (!th) return;
      var col = th.dataset.col;
      if (_sortCol === col) _sortDir *= -1;
      else { _sortCol = col; _sortDir = 1; }
      mainThead.querySelectorAll('.thes-rappr-sort-icon').forEach(function (s) { s.textContent = ''; });
      var icon = th.querySelector('.thes-rappr-sort-icon');
      if (icon) icon.textContent = _sortDir === 1 ? ' \u25B2' : ' \u25BC';
      _render();
    });

    if (mainBody) mainBody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-rappr-action]');
      if (!btn) return;
      var action = btn.dataset.rapprAction;
      var rowId  = btn.dataset.id;
      var nom    = btn.dataset.nom || '';
      if      (action === 'lier')       _openModalLier(rowId, nom);
      else if (action === 'hors-scope') _doHorsScope(rowId, btn);
      else if (action === 'delier')     _doDelier(rowId, btn);
      else if (action === 'workbench')  ThesWorkbench.open(btn.dataset.protoUuid);
    });

    if (summBody) summBody.addEventListener('click', function (e) {
      var tr = e.target.closest('tr.thes-rappr-chir-row');
      if (!tr) return;
      var chir = tr.dataset.chir;
      var sel2 = document.getElementById('rapprSelChir');
      if (_filterChir === chir) {
        _filterChir = ''; if (sel2) sel2.value = ''; _activeChir = null; _clearChirHighlight();
      } else {
        _filterChir = chir; if (sel2) sel2.value = chir; _activeChir = chir;
        _clearChirHighlight(); tr.classList.add('thes-rappr-active');
      }
      _render();
    });

    if (modalSearch) modalSearch.addEventListener('input', function () {
      clearTimeout(_modalTimer);
      var v = this.value;
      _modalTimer = setTimeout(function () { _searchProtocoles(v); }, 300);
    });

    if (modalEl) modalEl.addEventListener('show.bs.modal', function () {
      var inp = document.getElementById('rapprModalSearch');
      if (inp) inp.value = '';
      _setModalState('idle');
      var res = document.getElementById('rapprModalResults');
      if (res) res.innerHTML = '';
      var nomEl = document.getElementById('rapprModalFicheNom');
      if (nomEl) nomEl.textContent = _modalFicheNom;
    });
  }

  function _clearChirHighlight() {
    document.querySelectorAll('#rapprSummaryBody tr').forEach(function (r) {
      r.classList.remove('thes-rappr-active');
    });
  }

  /* ═══ FILTRAGE + TRI ══════════════════════════════════════════ */
  function _filtered() {
    var list = _rows;
    if (_filterChir)   list = list.filter(function (r) { return r.chirurgien === _filterChir; });
    if (_filterStatut) list = list.filter(function (r) { return r.statut === _filterStatut; });
    if (_filterText) {
      var txt = _filterText;
      list = list.filter(function (r) {
        return (r.nom_nettoye   || '').toLowerCase().indexOf(txt) !== -1 ||
               (r.libelle_cible || '').toLowerCase().indexOf(txt) !== -1 ||
               (r.chirurgien    || '').toLowerCase().indexOf(txt) !== -1;
      });
    }
    if (_sortCol) {
      list = list.slice().sort(function (a, b) {
        var av = String(a[_sortCol] || '');
        var bv = String(b[_sortCol] || '');
        return av.localeCompare(bv, 'fr') * _sortDir;
      });
    }
    return list;
  }

  /* ═══ RENDU TABLEAU PRINCIPAL ═════════════════════════════════ */
  function _render() {
    var list  = _filtered();
    var tbody = document.getElementById('rapprMainBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    list.forEach(function (r) {
      var tr = document.createElement('tr');

      var protocoleCell = r.libelle_cible
        ? '<span class="badge bg-primary-subtle text-primary border me-1">' + escHtml(r.id_protocole) + '</span>' +
          '<span class="text-success me-1">' + escHtml(r.libelle_cible) + '</span>' +
          '<a class="app-icon-btn" data-rappr-action="workbench" ' +
          'data-proto-uuid="' + escHtml(r.protocole_id) + '" title="Poste de travail" role="button">' +
          '<i class="bi bi-pencil-square"></i></a>'
        : '<span class="text-muted fst-italic">—</span>';

      var btnLier  = '<button class="btn btn-xs btn-outline-primary me-1" ' +
        'data-rappr-action="lier" data-id="' + escHtml(r.id) + '" data-nom="' + escHtml(r.nom_nettoye) + '" ' +
        'title="Lier \u00e0 un protocole BDB"><i class="bi bi-link-45deg"></i></button>';
      var btnHors  = '<button class="btn btn-xs btn-outline-warning me-1" ' +
        'data-rappr-action="hors-scope" data-id="' + escHtml(r.id) + '" ' +
        'title="Marquer Hors scope"><i class="bi bi-slash-circle"></i></button>';
      var btnDelier = r.protocole_id
        ? '<button class="btn btn-xs btn-outline-danger" ' +
          'data-rappr-action="delier" data-id="' + escHtml(r.id) + '" ' +
          'title="D\u00e9lier le protocole"><i class="bi bi-x-lg"></i></button>'
        : '';

      tr.innerHTML =
        '<td>' + escHtml(r.chirurgien) + '</td>' +
        '<td>' + escHtml(r.nom_nettoye) + '</td>' +
        '<td>' + _statutBadge(r.statut) + '</td>' +
        '<td>' + protocoleCell + '</td>' +
        '<td class="text-nowrap">' + btnLier + btnHors + btnDelier + '</td>';

      tbody.appendChild(tr);
    });

    _renderSummary();
    _renderCounters(list.length);
  }

  function _statutBadge(statut) {
    var map = {
      'Rapproche'          : 'badge bg-success',
      'Hors scope'         : 'badge bg-secondary',
      'Sans correspondance': 'badge bg-danger',
      'A valider (fort)'   : 'badge bg-warning text-dark',
      'A valider (faible)' : 'badge bg-warning text-dark'
    };
    var cl = map[statut] || 'badge bg-light text-dark';
    return '<span class="' + cl + '">' + escHtml(statut) + '</span>';
  }

  /* ═══ RÉSUMÉ PAR CHIRURGIEN ═══════════════════════════════════ */
  function _renderSummary() {
    var tbody = document.getElementById('rapprSummaryBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    var seen = {}, chirs = [];
    _rows.forEach(function (r) {
      if (!seen[r.chirurgien]) { seen[r.chirurgien] = true; chirs.push(r.chirurgien); }
    });
    chirs.sort();

    var totals = { fiches: 0, rappr: 0, sans: 0, aval: 0, hors: 0 };

    chirs.forEach(function (chir) {
      var sub   = _rows.filter(function (r) { return r.chirurgien === chir; });
      var fiches = sub.length;
      var rappr  = sub.filter(function (r) { return r.statut === 'Rapproche'; }).length;
      var sans   = sub.filter(function (r) { return r.statut === 'Sans correspondance'; }).length;
      var aval   = sub.filter(function (r) { return r.statut.indexOf('A valider') === 0; }).length;
      var hors   = sub.filter(function (r) { return r.statut === 'Hors scope'; }).length;
      var pct    = fiches ? Math.round(rappr / fiches * 100) : 0;
      var pctCl  = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning text-dark' : 'bg-danger';

      totals.fiches += fiches; totals.rappr += rappr;
      totals.sans += sans; totals.aval += aval; totals.hors += hors;

      var tr = document.createElement('tr');
      tr.className = 'thes-rappr-chir-row';
      tr.dataset.chir = chir;
      if (_activeChir === chir) tr.classList.add('thes-rappr-active');
      tr.innerHTML =
        '<td>' + escHtml(chir) + '</td>' +
        '<td class="text-end">' + fiches + '</td>' +
        '<td class="text-end">' + rappr + '</td>' +
        '<td class="text-end">' + sans + '</td>' +
        '<td class="text-end">' + aval + '</td>' +
        '<td class="text-end">' + hors + '</td>' +
        '<td class="text-end"><span class="badge ' + pctCl + '">' + pct + '%</span></td>';
      tbody.appendChild(tr);
    });

    var totPct = totals.fiches ? Math.round(totals.rappr / totals.fiches * 100) : 0;
    var totCl  = totPct >= 80 ? 'bg-success' : totPct >= 50 ? 'bg-warning text-dark' : 'bg-danger';
    var trTot  = document.createElement('tr');
    trTot.className = 'fw-bold table-dark';
    trTot.innerHTML =
      '<td>TOTAL</td>' +
      '<td class="text-end">' + totals.fiches + '</td>' +
      '<td class="text-end">' + totals.rappr + '</td>' +
      '<td class="text-end">' + totals.sans + '</td>' +
      '<td class="text-end">' + totals.aval + '</td>' +
      '<td class="text-end">' + totals.hors + '</td>' +
      '<td class="text-end"><span class="badge ' + totCl + '">' + totPct + '%</span></td>';
    tbody.appendChild(trTot);
  }

  /* ═══ COMPTEURS ═══════════════════════════════════════════════ */
  function _renderCounters(displayed) {
    var el = document.getElementById('rapprCounters');
    if (!el) return;
    var rappr = _rows.filter(function (r) { return r.statut === 'Rapproche'; }).length;
    var sans  = _rows.filter(function (r) { return r.statut === 'Sans correspondance'; }).length;
    var aval  = _rows.filter(function (r) { return r.statut.indexOf('A valider') === 0; }).length;
    el.innerHTML =
      'Affich\u00e9es\u00a0: <strong>' + displayed + '</strong>' +
      ' \u2022 Total\u00a0: <strong>' + _rows.length + '</strong>' +
      ' \u2022 <span class="text-success">Rapproch\u00e9es\u00a0: <strong>' + rappr + '</strong></span>' +
      ' \u2022 <span class="text-danger">Sans corresp.\u00a0: <strong>' + sans + '</strong></span>' +
      ' \u2022 \u00c0\u00a0valider\u00a0: <strong>' + aval + '</strong>';
  }

  /* ═══ RESET FILTRES ═══════════════════════════════════════════ */
  function _resetFilters() {
    _filterChir = ''; _filterStatut = ''; _filterText = ''; _activeChir = null;
    var s1 = document.getElementById('rapprSelChir');
    var s2 = document.getElementById('rapprSelStatut');
    var s3 = document.getElementById('rapprTxtSearch');
    if (s1) s1.value = '';
    if (s2) s2.value = '';
    if (s3) s3.value = '';
    _clearChirHighlight();
    _render();
  }

  /* ═══ MODAL LIER ══════════════════════════════════════════════ */
  function _openModalLier(rowId, nomFiche) {
    _modalFicheId  = rowId;
    _modalFicheNom = nomFiche;
    var el = document.getElementById('modalRapprLier');
    if (!el) return;
    bootstrap.Modal.getOrCreateInstance(el).show();
  }

  function _setModalState(state) {
    var loading = document.getElementById('rapprModalLoading');
    var empty   = document.getElementById('rapprModalEmpty');
    if (loading) loading.classList.add('d-none');
    if (empty)   empty.classList.add('d-none');
    if (state === 'loading' && loading) loading.classList.remove('d-none');
    if (state === 'empty'   && empty)   empty.classList.remove('d-none');
  }

  async function _searchProtocoles(term) {
    var results = document.getElementById('rapprModalResults');
    if (!results) return;
    if (!term || term.trim().length < 2) {
      results.innerHTML = '';
      _setModalState('idle');
      return;
    }

    _setModalState('loading');
    results.innerHTML = '';

    var expanded = _expandAbbrevs(term.trim());

    try {
      var resp = await window.bdb
        .from(TABLE_PROTOCOLES)
        .select('id, id_protocole, libelle_cible')
        .or('libelle_cible.ilike.%' + expanded + '%,synonymes_recherche.ilike.%' + expanded + '%')
        .order('libelle_cible', { ascending: true })
        .limit(30);

      _setModalState('idle');
      if (resp.error) throw new Error(resp.error.message);

      var data = resp.data || [];
      if (data.length === 0) { _setModalState('empty'); return; }

      data.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'list-group-item list-group-item-action d-flex align-items-center gap-2';
        btn.innerHTML =
          '<span class="badge bg-primary font-monospace">' + escHtml(p.id_protocole) + '</span>' +
          '<span>' + escHtml(p.libelle_cible) + '</span>';
        btn.addEventListener('click', function () { _doLier(p); });
        results.appendChild(btn);
      });

    } catch (e) {
      _setModalState('idle');
      results.innerHTML =
        '<div class="text-danger small p-2"><i class="bi bi-exclamation-triangle me-1"></i>' +
        escHtml(e.message) + '</div>';
    }
  }

  async function _doLier(protocole) {
    if (!_modalFicheId) return;
    var resp = await window.bdb
      .from(TABLE_FICHES)
      .update({ protocole_id: protocole.id, statut: 'Rapproche' })
      .eq('id', _modalFicheId)
      .select('id, statut, protocole_id');

    if (resp.error) { _toast('error', resp.error.message); return; }

    var row = _rows.find(function (r) { return r.id === _modalFicheId; });
    if (row) {
      row.protocole_id   = protocole.id;
      row.libelle_cible  = protocole.libelle_cible;
      row.id_protocole   = protocole.id_protocole;
      row.statut         = 'Rapproche';
    }

    var el = document.getElementById('modalRapprLier');
    if (el) bootstrap.Modal.getInstance(el).hide();

    _render();
    _toast('info', 'Li\u00e9\u00a0: ' + protocole.libelle_cible);
  }

  /* ═══ ACTION HORS SCOPE ═══════════════════════════════════════ */
  async function _doHorsScope(rowId, btn) {
    if (btn) btn.disabled = true;
    var resp = await window.bdb
      .from(TABLE_FICHES)
      .update({ statut: 'Hors scope' })
      .eq('id', rowId)
      .select('id, statut');

    if (resp.error) {
      if (btn) btn.disabled = false;
      _toast('error', resp.error.message);
      return;
    }
    var row = _rows.find(function (r) { return r.id === rowId; });
    if (row) row.statut = 'Hors scope';
    _render();
  }

  /* ═══ ACTION DÉLIER ═══════════════════════════════════════════ */
  async function _doDelier(rowId, btn) {
    if (btn) btn.disabled = true;
    var resp = await window.bdb
      .from(TABLE_FICHES)
      .update({ protocole_id: null, statut: 'Sans correspondance' })
      .eq('id', rowId)
      .select('id, statut, protocole_id');

    if (resp.error) {
      if (btn) btn.disabled = false;
      _toast('error', resp.error.message);
      return;
    }
    var row = _rows.find(function (r) { return r.id === rowId; });
    if (row) {
      row.protocole_id  = null;
      row.libelle_cible = '';
      row.id_protocole  = '';
      row.statut        = 'Sans correspondance';
    }
    _render();
  }

  /* ═══ TOAST ═══════════════════════════════════════════════════ */
  function _toast(type, msg) {
    var id     = type === 'error' ? 'toastError' : 'toastInfo';
    var bodyId = type === 'error' ? 'toastErrorBody' : 'toastInfoBody';
    var el   = document.getElementById(id);
    var body = document.getElementById(bodyId);
    if (el && body) { body.textContent = msg; new bootstrap.Toast(el).show(); }
  }

  /* ═══ EXPORT CSV ══════════════════════════════════════════════ */
  function _exportCSV() {
    var list = _filtered();
    var header = '"chirurgien";"nom_nettoye";"statut";"id_protocole";"libelle_cible"';
    var lines = list.map(function (r) {
      return [r.chirurgien, r.nom_nettoye, r.statut, r.id_protocole, r.libelle_cible]
        .map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; })
        .join(';');
    });
    var csv  = '\uFEFF' + [header].concat(lines).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = 'rapprochement_fiches.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ═══ PUBLIC API ══════════════════════════════════════════════ */
  return { init: init };

})();

/* ── ACTIVATION LAZY ───────────────────────────────────────────── */
document.addEventListener('shown.bs.tab', function (e) {
  if (e.target && e.target.id === 'tab-rappr-btn') {
    ThesRappr.init();
  }
});
