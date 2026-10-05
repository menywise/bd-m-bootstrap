/* thesaurus-ccam.js — BDB · CDS · Onglet CCAM OT (V5 — Poste de travail unifié)
   3 sous-vues pills : Protocoles BDB | Référentiel CCAM OT | Couverture
   Slide-over = Poste de travail protocole (6 sections) :
     §1 Identité | §2 CCAM | §3 Synonymes | §4 Fiches papier | §5 Interventions | §6 Doublons
   Tables : referentiel_ccam · protocole_ccam · thesaurus_protocoles
            thesaurus_interventions · thesaurus_fiches_papier
   API : ThesCcam.openSlide(id) · ThesWorkbench.open(id) — callable depuis tout onglet
   Pattern : IIFE (ThesCcam), auto-init lazy. */

var ThesCcam = (function () {
  'use strict';

  /* ═══ STATE ═══════════════════════════════════════════════════ */
  var _inited = false;
  var _refOt = [];
  var _liens = [];
  var _protocoles = [];
  var _fiches = [];

  var _refByUuid = {};
  var _refByCode = {};
  var _liensByProto = {};
  var _liensByActe = {};
  var _sectionsByChap = {};

  var OT_CHAPS = ['01', '11', '12', '13', '14', '15', '16'];

  var _vA = { text: '', statut: '', chapitre: '', sortCol: 'frequence', sortDir: -1, page: 1, pageSize: 50, filtered: [] };
  var _vB = { text: '', chapitre: '', section: '', page: 1, pageSize: 50, filtered: [] };

  var _slideProtoId = null;
  var _slideProto = null;
  var _slideIntervPage = 1;
  var _slideIntervTotal = 0;
  var _slideIntervPageSize = 20;
  var _slideIntervSearch = '';
  var _mergeTargetId = null;

  var CHAP = {
    '01': { label: 'Système nerveux', icon: 'bi-lightning-charge' },
    '11': { label: 'Os / Articulations', icon: 'bi-gem' },
    '12': { label: 'Rachis / Tronc', icon: 'bi-body-text' },
    '13': { label: 'Membre supérieur', icon: 'bi-hand-index-thumb' },
    '14': { label: 'Membre inférieur', icon: 'bi-arrow-down-circle' },
    '15': { label: 'Corps entier', icon: 'bi-person' },
    '16': { label: 'Peau / Téguments', icon: 'bi-bandaid' }
  };
  var _STOP = new Set(['de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'par', 'pour', 'avec', 'dans', 'sur', 'en', 'a', 'au']);

  /* ═══ INIT ════════════════════════════════════════════════════ */
  async function init() {
    if (_inited) return;
    _inited = true;
    _showState('loading');
    try {
      await _loadData();
      if (_refOt.length === 0) { _showState('empty'); return; }
      _buildIndex();
      _initPills();
      _initViewA();
      _bindSlide();
      _showState('data');
    } catch (e) { _showState('error', e.message); }
  }

  /* ═══ LOAD ════════════════════════════════════════════════════ */
  async function _loadData() {
    var db = window.bdb;

    var rr = await db.from('referentiel_ccam')
      .select('id, code_ccam, libelle, chapitre, section, sous_section')
      .in('chapitre', OT_CHAPS)
      .order('code_ccam')
      .limit(3000);
    if (rr.error) throw new Error('Référentiel CCAM : ' + rr.error.message);
    _refOt = rr.data || [];

    var rl = await db.from('protocole_ccam').select('*');
    if (rl.error) throw new Error('Liens : ' + rl.error.message);
    _liens = rl.data || [];

    if (typeof ThesApp !== 'undefined' && ThesApp.data && ThesApp.data.length > 0) {
      _protocoles = ThesApp.data;
    } else {
      var rp = await db.from('thesaurus_protocoles').select('*').order('frequence', { ascending: false });
      if (rp.error) throw new Error('Protocoles : ' + rp.error.message);
      _protocoles = rp.data || [];
    }

    var rf = await db.from('thesaurus_fiches_papier')
      .select('id, chirurgien, nom_nettoye, protocole_id, statut')
      .order('chirurgien')
      .limit(500);
    if (!rf.error) _fiches = rf.data || [];
  }

  /* ═══ INDEX ═══════════════════════════════════════════════════ */
  function _buildIndex() {
    _refByUuid = {};
    _refByCode = {};
    _sectionsByChap = {};

    _refOt.forEach(function (a) {
      _refByUuid[a.id] = a;
      _refByCode[a.code_ccam] = a;
      if (!_sectionsByChap[a.chapitre]) _sectionsByChap[a.chapitre] = new Set();
      _sectionsByChap[a.chapitre].add(a.section);
    });

    /* Convert sets to sorted arrays */
    OT_CHAPS.forEach(function (ch) {
      if (_sectionsByChap[ch]) {
        _sectionsByChap[ch] = Array.from(_sectionsByChap[ch]).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
      } else {
        _sectionsByChap[ch] = [];
      }
    });

    _rebuildLiens();
  }

  function _rebuildLiens() {
    _liensByProto = {};
    _liensByActe = {};
    _liens.forEach(function (l) {
      if (!_liensByProto[l.protocole_id]) _liensByProto[l.protocole_id] = [];
      _liensByProto[l.protocole_id].push(l);
      if (!_liensByActe[l.ccam_acte_id]) _liensByActe[l.ccam_acte_id] = [];
      _liensByActe[l.ccam_acte_id].push(l);
    });
  }

  /* ═══ CCAM LOOKUP (single source) ════════════════════════════ */
  function _ccamLookup(code) {
    var ref = _refByCode[code];
    return { ref: ref || null, libelle: ref ? ref.libelle : null };
  }

  /* ═══ 3 ÉTATS DOM ═════════════════════════════════════════════ */
  function _showState(st, msg) {
    _toggle('ccamLoading', st === 'loading');
    _toggle('ccamEmpty', st === 'empty');
    _toggle('ccamError', st === 'error');
    _toggle('ccamContent', st === 'data');
    if (st === 'error') _setText('ccamErrorMsg', msg || 'Erreur inconnue');
  }

  /* ═══ PILLS ═══════════════════════════════════════════════════ */
  var _viewIds = ['ccamViewProto', 'ccamViewClasseurs', 'ccamViewAudit'];
  var _classeurInited = false;
  var _auditInited = false;

  function _initPills() {
    document.querySelectorAll('#ccamPills .nav-link').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#ccamPills .nav-link').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.dataset.view;
        _viewIds.forEach(function (v) { _toggle(v, v === target); });
        if (target === 'ccamViewClasseurs' && !_classeurInited) { _classeurInited = true; _initViewB(); }
        if (target === 'ccamViewAudit' && !_auditInited) { _auditInited = true; _renderViewC(); }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW A — Protocoles BDB
     ═══════════════════════════════════════════════════════════════ */
  function _initViewA() {
    var sel = document.getElementById('ccamFilterChapitre');
    if (sel) OT_CHAPS.forEach(function (ch) {
      var o = document.createElement('option');
      o.value = ch;
      o.textContent = ch + ' — ' + CHAP[ch].label;
      sel.appendChild(o);
    });

    var inp = document.getElementById('ccamSearch');
    if (inp) inp.addEventListener('input', function () { _vA.text = this.value; _vA.page = 1; _filterA(); _renderA(); });

    var ss = document.getElementById('ccamFilterStatut');
    if (ss) ss.addEventListener('change', function () { _vA.statut = this.value; _vA.page = 1; _filterA(); _renderA(); });

    var sc = document.getElementById('ccamFilterChapitre');
    if (sc) sc.addEventListener('change', function () { _vA.chapitre = this.value; _vA.page = 1; _filterA(); _renderA(); });

    var br = document.getElementById('ccamBtnReset');
    if (br) br.addEventListener('click', function () {
      if (inp) inp.value = '';
      if (ss) ss.value = '';
      if (sc) sc.value = '';
      _vA.text = ''; _vA.statut = ''; _vA.chapitre = ''; _vA.page = 1;
      _filterA(); _renderA();
    });

    document.querySelectorAll('#ccamViewProto .ccam-sort-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var c = btn.dataset.col;
        if (_vA.sortCol === c) _vA.sortDir *= -1;
        else { _vA.sortCol = c; _vA.sortDir = -1; }
        _sortA(); _renderA();
      });
    });

    _filterA(); _renderA();
  }

  function _filterA() {
    var q = _vA.text.toLowerCase();
    _vA.filtered = _protocoles.filter(function (p) {
      var has = !!(_liensByProto[p.id] && _liensByProto[p.id].length);
      if (_vA.statut === 'lie' && !has) return false;
      if (_vA.statut === 'alier' && has) return false;
      if (_vA.chapitre) {
        if (!has) return false;
        var m = _liensByProto[p.id].some(function (l) {
          var a = _refByUuid[l.ccam_acte_id];
          return a && a.chapitre === _vA.chapitre;
        });
        if (!m) return false;
      }
      if (q) {
        var h = [p.libelle_cible, p.synonymes_recherche, p.codes_ccam, p.id_protocole].join(' ').toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    });
    _sortA();
  }

  function _sortA() {
    var c = _vA.sortCol, d = _vA.sortDir;
    _vA.filtered.sort(function (a, b) {
      var va = a[c], vb = b[c];
      if (typeof va === 'number') return d * (va - vb);
      va = String(va || '').toLowerCase();
      vb = String(vb || '').toLowerCase();
      return d * va.localeCompare(vb, 'fr');
    });
  }

  function _renderA() { _renderATable(); _renderAPag(); }

  function _renderATable() {
    var tbody = document.getElementById('ccamTableBody');
    if (!tbody) return;
    var start = (_vA.page - 1) * _vA.pageSize;
    var slice = _vA.filtered.slice(start, start + _vA.pageSize);
    _setText('ccamResultCount', _fmt(_vA.filtered.length));
    if (!slice.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>Aucun résultat</td></tr>';
      return;
    }
    tbody.innerHTML = slice.map(function (p) {
      var liens = _liensByProto[p.id] || [];
      var lienHtml = liens.length
        ? '<div class="d-flex flex-wrap">' + liens.map(function (l) {
            var a = _refByUuid[l.ccam_acte_id];
            return a ? '<span class="badge bg-success-subtle text-success-emphasis border me-1 mb-1">' + _esc(a.code_ccam) + '</span>' : '';
          }).join('') + '</div>'
        : '<span class="badge bg-secondary-subtle text-secondary-emphasis">À lier</span>';
      var hint = p.codes_ccam ? '<div class="small text-muted opacity-75 mt-1">' + _esc(p.codes_ccam) + '</div>' : '';
      return '<tr>' +
        '<td class="small font-monospace text-muted">' + _esc(p.id_protocole) + '</td>' +
        '<td><span class="fw-medium">' + _esc(p.libelle_cible) + '</span>' + hint + '</td>' +
        '<td class="text-end font-monospace small">' + _fmt(p.frequence) + '</td>' +
        '<td>' + lienHtml + '</td>' +
        '<td class="text-center"><a class="app-icon-btn ccam-btn-open-slide" data-proto-id="' + _esc(p.id) + '" title="Ouvrir" role="button"><i class="bi bi-pencil-square"></i></a></td></tr>';
    }).join('');
    tbody.querySelectorAll('.ccam-btn-open-slide').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); _openSlide(btn.dataset.protoId); });
    });
  }

  function _renderAPag() {
    var el = document.getElementById('ccamPagination');
    if (!el) return;
    var tot = Math.max(1, Math.ceil(_vA.filtered.length / _vA.pageSize));
    _setText('ccamPageInfo', 'Page ' + _vA.page + ' / ' + tot);
    if (tot <= 1) { el.innerHTML = ''; return; }
    var pgs = [];
    if (_vA.page > 1) pgs.push({ l: '\u2039', p: _vA.page - 1 });
    for (var i = Math.max(1, _vA.page - 2); i <= Math.min(tot, _vA.page + 2); i++) pgs.push({ l: String(i), p: i, active: i === _vA.page });
    if (_vA.page < tot) pgs.push({ l: '\u203A', p: _vA.page + 1 });
    el.innerHTML = pgs.map(function (g) {
      return '<li class="page-item' + (g.active ? ' active' : '') + '"><button class="page-link" data-p="' + g.p + '" type="button">' + g.l + '</button></li>';
    }).join('');
    el.querySelectorAll('button[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { _vA.page = +b.dataset.p; _renderA(); });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW B — Référentiel CCAM OT (table filtrée)
     ═══════════════════════════════════════════════════════════════ */
  function _initViewB() {
    /* Chapitre dropdown */
    var selCh = document.getElementById('ccamRefChapitre');
    if (selCh) {
      OT_CHAPS.forEach(function (ch) {
        var o = document.createElement('option');
        o.value = ch;
        o.textContent = ch + ' — ' + CHAP[ch].label;
        selCh.appendChild(o);
      });
      selCh.addEventListener('change', function () {
        _vB.chapitre = this.value;
        _vB.section = '';
        _vB.page = 1;
        _populateSectionDropdown();
        _filterB(); _renderB();
      });
    }

    /* Section dropdown (cascade) */
    var selSec = document.getElementById('ccamRefSection');
    if (selSec) {
      selSec.addEventListener('change', function () {
        _vB.section = this.value;
        _vB.page = 1;
        _filterB(); _renderB();
      });
    }

    /* Text search with debounce */
    var inp = document.getElementById('ccamRefSearch');
    var tm = null;
    if (inp) inp.addEventListener('input', function () {
      clearTimeout(tm);
      var v = this.value;
      tm = setTimeout(function () { _vB.text = v; _vB.page = 1; _filterB(); _renderB(); }, 250);
    });

    /* Reset */
    var br = document.getElementById('ccamRefReset');
    if (br) br.addEventListener('click', function () {
      if (selCh) selCh.value = '';
      if (selSec) { selSec.value = ''; selSec.innerHTML = '<option value="">Toutes sections</option>'; }
      if (inp) inp.value = '';
      _vB.text = ''; _vB.chapitre = ''; _vB.section = ''; _vB.page = 1;
      _filterB(); _renderB();
    });

    _filterB(); _renderB();
  }

  function _populateSectionDropdown() {
    var sel = document.getElementById('ccamRefSection');
    if (!sel) return;
    sel.innerHTML = '<option value="">Toutes sections</option>';
    if (!_vB.chapitre || !_sectionsByChap[_vB.chapitre]) return;
    _sectionsByChap[_vB.chapitre].forEach(function (sec) {
      var o = document.createElement('option');
      o.value = sec;
      /* Truncate long section labels for dropdown */
      o.textContent = sec.length > 60 ? sec.substring(0, 57) + '…' : sec;
      o.title = sec;
      sel.appendChild(o);
    });
  }

  function _filterB() {
    var q = _vB.text.toLowerCase();
    var ws = q ? q.split(/\s+/).filter(function (w) { return w.length >= 2; }) : [];
    _vB.filtered = _refOt.filter(function (a) {
      if (_vB.chapitre && a.chapitre !== _vB.chapitre) return false;
      if (_vB.section && a.section !== _vB.section) return false;
      if (ws.length) {
        var h = (a.code_ccam + ' ' + a.libelle + ' ' + a.sous_section).toLowerCase();
        if (!ws.every(function (w) { return h.includes(w); })) return false;
      }
      return true;
    });
  }

  function _renderB() { _renderBTable(); _renderBPag(); }

  function _renderBTable() {
    var tbody = document.getElementById('ccamRefTableBody');
    if (!tbody) return;
    var start = (_vB.page - 1) * _vB.pageSize;
    var slice = _vB.filtered.slice(start, start + _vB.pageSize);
    _setText('ccamRefResultCount', _fmt(_vB.filtered.length));

    if (!slice.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-5"><i class="bi bi-search d-block fs-3 mb-2 opacity-25"></i>Aucun acte trouvé</td></tr>';
      return;
    }
    tbody.innerHTML = slice.map(function (a) {
      var ls = _liensByActe[a.id] || [];
      var ph = ls.length
        ? ls.map(function (l) {
            var p = _protocoles.find(function (x) { return x.id === l.protocole_id; });
            return p ? '<span class="badge bg-primary-subtle text-primary-emphasis me-1">' + _esc(p.id_protocole) + '</span>' : '';
          }).join('')
        : '<span class="text-muted opacity-50">—</span>';
      var ss = a.sous_section ? '<div class="small text-muted opacity-75">' + _esc(a.sous_section.length > 50 ? a.sous_section.substring(0, 47) + '…' : a.sous_section) + '</div>' : '';
      return '<tr>' +
        '<td><code class="small">' + _esc(a.code_ccam) + '</code></td>' +
        '<td class="small">' + _esc(a.libelle) + ss + '</td>' +
        '<td>' + ph + '</td>' +
        '<td class="text-center"><span class="badge bg-light text-dark border">' + _esc(a.chapitre) + '</span></td></tr>';
    }).join('');
  }

  function _renderBPag() {
    var el = document.getElementById('ccamRefPagination');
    if (!el) return;
    var tot = Math.max(1, Math.ceil(_vB.filtered.length / _vB.pageSize));
    _setText('ccamRefPageInfo', 'Page ' + _vB.page + ' / ' + tot);
    if (tot <= 1) { el.innerHTML = ''; return; }
    var pgs = [];
    if (_vB.page > 1) pgs.push({ l: '\u2039', p: _vB.page - 1 });
    for (var i = Math.max(1, _vB.page - 2); i <= Math.min(tot, _vB.page + 2); i++) pgs.push({ l: String(i), p: i, active: i === _vB.page });
    if (_vB.page < tot) pgs.push({ l: '\u203A', p: _vB.page + 1 });
    el.innerHTML = pgs.map(function (g) {
      return '<li class="page-item' + (g.active ? ' active' : '') + '"><button class="page-link" data-p="' + g.p + '" type="button">' + g.l + '</button></li>';
    }).join('');
    el.querySelectorAll('button[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { _vB.page = +b.dataset.p; _renderB(); });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW C — Couverture & Audit
     ═══════════════════════════════════════════════════════════════ */
  function _renderViewC() { _renderKPIs(); _renderGaps(); _renderOrphans(); }

  function _renderKPIs() {
    var tot = _protocoles.length, lies = 0;
    _protocoles.forEach(function (p) { if (_liensByProto[p.id] && _liensByProto[p.id].length) lies++; });
    _setText('ccamKpiTotal', _fmt(tot));
    _setText('ccamKpiLies', _fmt(lies));
    _setText('ccamKpiALier', _fmt(tot - lies));
    _setText('ccamKpiPct', (tot > 0 ? Math.round(lies / tot * 100) : 0) + ' %');
    _setText('ccamKpiActes', _fmt(_refOt.length));
  }

  function _renderGaps() {
    var tb = document.getElementById('ccamGapProtoBody');
    if (!tb) return;
    var g = _protocoles.filter(function (p) {
      return !_liensByProto[p.id] || !_liensByProto[p.id].length;
    }).sort(function (a, b) { return b.frequence - a.frequence; }).slice(0, 30);
    if (!g.length) {
      tb.innerHTML = '<tr><td colspan="4" class="text-center text-muted small py-3">Tous les protocoles sont liés !</td></tr>';
      return;
    }
    tb.innerHTML = g.map(function (p) {
      return '<tr><td class="small font-monospace text-muted">' + _esc(p.id_protocole) + '</td>' +
        '<td class="small">' + _esc(p.libelle_cible) + '</td>' +
        '<td class="text-end font-monospace small">' + _fmt(p.frequence) + '</td>' +
        '<td class="text-center"><a class="app-icon-btn ccam-gap-link" data-proto-id="' + _esc(p.id) + '" title="Ouvrir" role="button"><i class="bi bi-pencil-square"></i></a></td></tr>';
    }).join('');
    tb.querySelectorAll('.ccam-gap-link').forEach(function (btn) {
      btn.addEventListener('click', function () { _openSlide(btn.dataset.protoId); });
    });
  }

  function _renderOrphans() {
    var tb = document.getElementById('ccamOrphanBody');
    if (!tb) return;
    var orp = _refOt.filter(function (a) { return !_liensByActe[a.id] || !_liensByActe[a.id].length; });
    _setText('ccamOrphanCount', _fmt(orp.length));
    var sh = orp.slice(0, 50);
    if (!sh.length) {
      tb.innerHTML = '<tr><td colspan="3" class="text-center text-muted small py-3">Tous les actes sont liés !</td></tr>';
      return;
    }
    tb.innerHTML = sh.map(function (a) {
      var ch = CHAP[a.chapitre];
      return '<tr><td><code class="small">' + _esc(a.code_ccam) + '</code></td>' +
        '<td class="small">' + _esc(a.libelle) + '</td>' +
        '<td class="small text-muted">' + (ch ? ch.label : _esc(a.chapitre)) + '</td></tr>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════════════════
     SLIDE-OVER — Poste de travail protocole
     ═══════════════════════════════════════════════════════════════ */
  function _bindSlide() {
    var cls = document.getElementById('ccamSlideClose');
    if (cls) cls.addEventListener('click', _closeSlide);
    var bg = document.getElementById('ccamSlideBackdrop');
    if (bg) bg.addEventListener('click', _closeSlide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && _slideProtoId) _closeSlide(); });

    var sInp = document.getElementById('ccamSlideSearch'), sTm = null;
    if (sInp) sInp.addEventListener('input', function () { clearTimeout(sTm); var q = this.value; sTm = setTimeout(function () { _searchSlide(q); }, 250); });

    var btnSave = document.getElementById('ccamSlideSaveLibelle');
    if (btnSave) btnSave.addEventListener('click', _saveLibelle);
    var btnDoub = document.getElementById('ccamSlideBtnDoublons');
    if (btnDoub) btnDoub.addEventListener('click', _showDoublons);

    var iInp = document.getElementById('ccamSlideIntervSearch'), iTm = null;
    if (iInp) iInp.addEventListener('input', function () { clearTimeout(iTm); var q = this.value; iTm = setTimeout(function () { _slideIntervSearch = q; _slideIntervPage = 1; _loadInterv(); }, 400); });
    var pv = document.getElementById('ccamSlideIntervPrev');
    var nx = document.getElementById('ccamSlideIntervNext');
    if (pv) pv.addEventListener('click', function () { if (_slideIntervPage > 1) { _slideIntervPage--; _loadInterv(); } });
    if (nx) nx.addEventListener('click', function () { if (_slideIntervPage * _slideIntervPageSize < _slideIntervTotal) { _slideIntervPage++; _loadInterv(); } });

    var secI = document.getElementById('ccamSecInterv');
    if (secI) secI.addEventListener('show.bs.collapse', function () {
      if (_slideProtoId) { _slideIntervPage = 1; _slideIntervSearch = ''; var ii = document.getElementById('ccamSlideIntervSearch'); if (ii) ii.value = ''; _loadInterv(); }
    });

    var btnMrg = document.getElementById('btnMergeConfirm');
    if (btnMrg) btnMrg.addEventListener('click', _executeMerge);

    /* Reassign panel */
    var rInp = document.getElementById('ccamReassignSearch'), rTm = null;
    if (rInp) rInp.addEventListener('input', function () { clearTimeout(rTm); var q = this.value; rTm = setTimeout(function () { _filterReassignProtos(q); }, 200); });
    var rClose = document.getElementById('ccamReassignClose');
    if (rClose) rClose.addEventListener('click', _hideReassignPanel);

    /* Glossaire panel */
    var gOpen = document.getElementById('ccamGlossaireOpen');
    if (gOpen) gOpen.addEventListener('click', _openGlossairePanel);
    var gClose = document.getElementById('ccamGlossaireClose');
    if (gClose) gClose.addEventListener('click', _hideGlossairePanel);
    var gSave = document.getElementById('ccamGlossaireSave');
    if (gSave) gSave.addEventListener('click', _saveGlossaire);
  }

  function _openSlide(uuid) {
    _slideProtoId = uuid;
    _slideProto = _protocoles.find(function (x) { return x.id === uuid; });
    if (!_slideProto) return;

    _setText('ccamSlideProtoLabel', _slideProto.libelle_cible);
    _setText('ccamSlideProtoId', _slideProto.id_protocole);
    _setText('ccamSlideProtoFreq', _fmt(_slideProto.frequence) + ' interv.');

    /* §1 Identity */
    var libInp = document.getElementById('ccamSlideLibelle');
    if (libInp) libInp.value = _slideProto.libelle_cible;
    var msg = document.getElementById('ccamSlideLibelleMsg');
    if (msg) msg.innerHTML = '';
    _setText('ccamSlideSpec', _slideProto.specialite || '—');
    _setText('ccamSlideZone', _slideProto.zone_anat || '—');
    _setText('ccamSlideType', _slideProto.type || '—');
    _renderCcamPreview();
    _toggle('ccamSlideDoublons', false);

    /* §2 Links — keyword chips + smart search */
    _renderSlideLinks();
    _renderKeywordChips();
    _renderFichesSection();
    var sInp = document.getElementById('ccamSlideSearch');
    if (sInp) {
      var kws = _extractWords(_slideProto.libelle_cible + ' ' + (_slideProto.synonymes_recherche || '') + ' ' + (_slideProto.pathologie || ''));
      var best = '';
      for (var ki = 0; ki < kws.length && ki < 5; ki++) {
        var testRes = _refOt.filter(function (a) { return a.libelle.toLowerCase().includes(kws[ki]); });
        if (testRes.length > 0 && testRes.length < 80) { best = kws[ki]; break; }
      }
      if (!best) best = _slideProto.libelle_cible.split(' > ')[0].split(' DE ')[0];
      sInp.value = best;
      _searchSlide(best);
    }

    /* §3 Interventions — reset */
    _slideIntervPage = 1; _slideIntervTotal = 0; _slideIntervSearch = '';
    var iInp = document.getElementById('ccamSlideIntervSearch');
    if (iInp) iInp.value = '';
    _setText('ccamSlideIntervCount', '—');
    var iBody = document.getElementById('ccamSlideIntervBody');
    if (iBody) iBody.innerHTML = '';
    _setText('ccamSlideIntervPageInfo', '');
    _hideReassignPanel();
    _hideGlossairePanel();
    var secI = document.getElementById('ccamSecInterv');
    if (secI && secI.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(secI).hide();

    /* Show */
    var sl = document.getElementById('ccamSlideOver'), bk = document.getElementById('ccamSlideBackdrop');
    if (sl) sl.classList.add('active');
    if (bk) bk.classList.add('active');
    document.body.classList.add('thes-ccam-slide-open');
  }

  function _closeSlide() {
    _slideProtoId = null; _slideProto = null;
    var sl = document.getElementById('ccamSlideOver'), bk = document.getElementById('ccamSlideBackdrop');
    if (sl) sl.classList.remove('active');
    if (bk) bk.classList.remove('active');
    document.body.classList.remove('thes-ccam-slide-open');
  }

  /* ── §1 Identity : CCAM preview (single lookup) ─────────── */
  function _renderCcamPreview() {
    var wrap = document.getElementById('ccamSlideCcamPreview');
    var body = document.getElementById('ccamSlideCcamPreviewBody');
    if (!wrap || !body || !_slideProto) return;
    if (!_slideProto.codes_ccam || !_slideProto.codes_ccam.trim()) { wrap.classList.add('d-none'); return; }
    var codes = _slideProto.codes_ccam.split(/[,;|\s]+/).map(function (c) { return c.trim().toUpperCase(); }).filter(Boolean);
    if (!codes.length) { wrap.classList.add('d-none'); return; }

    wrap.classList.remove('d-none');
    body.innerHTML = codes.map(function (code) {
      var info = _ccamLookup(code);
      var linked = info.ref && _liensByActe[info.ref.id] && _liensByActe[info.ref.id].some(function (l) { return l.protocole_id === _slideProtoId; });

      var html = '<div class="thes-ccam-code-preview-row">';
      html += '<div class="d-flex align-items-center gap-2">';
      html += '<code class="small">' + _esc(code) + '</code>';
      if (info.ref && linked) {
        html += '<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-lg"></i> Lié</span>';
      } else if (info.ref) {
        html += '<button class="btn btn-xs btn-outline-success ccam-preview-link" data-acte-id="' + _esc(info.ref.id) + '" type="button"><i class="bi bi-plus-lg me-1"></i>Lier</button>';
      } else {
        html += '<span class="badge bg-warning-subtle text-warning-emphasis">Hors périmètre OT</span>';
      }
      html += '</div>';
      if (info.libelle) {
        html += '<div class="small ms-3 mt-1 text-body-secondary">' + _esc(info.libelle) + '</div>';
      }
      html += '</div>';
      return html;
    }).join('');
    body.querySelectorAll('.ccam-preview-link').forEach(function (btn) {
      btn.addEventListener('click', function () { _linkActe(btn.dataset.acteId); });
    });
  }

  /* ── §1 Identity : Save libellé ──────────────────────────── */
  async function _saveLibelle() {
    if (!_slideProtoId || !_slideProto) return;
    var inp = document.getElementById('ccamSlideLibelle');
    var msg = document.getElementById('ccamSlideLibelleMsg');
    if (!inp) return;
    var nv = inp.value.trim().toUpperCase();
    if (!nv) { if (msg) msg.innerHTML = '<span class="text-danger">Libellé vide.</span>'; return; }
    if (nv === _slideProto.libelle_cible) { if (msg) msg.innerHTML = '<span class="text-muted">Aucun changement.</span>'; return; }
    var r = await window.bdb.from('thesaurus_protocoles').update({ libelle_cible: nv, updated_at: new Date().toISOString() }).eq('id', _slideProtoId).select();
    if (r.error) { if (msg) msg.innerHTML = '<span class="text-danger">' + _esc(r.error.message) + '</span>'; return; }
    if (!r.data || !r.data.length) { if (msg) msg.innerHTML = '<span class="text-danger">UPDATE bloqué (RLS).</span>'; return; }
    _slideProto.libelle_cible = nv;
    _setText('ccamSlideProtoLabel', nv);
    if (msg) msg.innerHTML = '<span class="text-success"><i class="bi bi-check-lg me-1"></i>Sauvegardé.</span>';
    _renderATable();
    _toast('success', 'Libellé mis à jour.');
  }

  /* ── §1 Identity : Doublons ──────────────────────────────── */
  function _showDoublons() {
    var ct = document.getElementById('ccamSlideDoublons');
    if (!ct || !_slideProto) return;
    var words = _extractWords(_slideProto.libelle_cible);
    var synWords = _extractWords(_slideProto.synonymes_recherche || '');
    var allWords = words.concat(synWords);
    var zone = (_slideProto.zone_anat || '').toLowerCase().trim();

    var sim = _protocoles.filter(function (p) {
      if (p.id === _slideProto.id) return false;
      var pw = _extractWords(p.libelle_cible);
      var pSyn = _extractWords(p.synonymes_recherche || '');
      var pAll = pw.concat(pSyn);
      var pZone = (p.zone_anat || '').toLowerCase().trim();
      var overlap = allWords.filter(function (w) { return pAll.indexOf(w) >= 0; }).length;
      if (overlap >= 2) return true;
      if (zone && zone.length > 2 && pZone === zone && overlap >= 1) return true;
      return false;
    }).sort(function (a, b) { return b.frequence - a.frequence; }).slice(0, 15);

    ct.classList.remove('d-none');
    if (!sim.length) { ct.innerHTML = '<p class="small text-muted fst-italic">Aucun doublon potentiel.</p>'; return; }
    ct.innerHTML = '<p class="small text-muted mb-2">Protocoles similaires — cliquer pour naviguer :</p>' + sim.map(function (p) {
      return '<div class="d-flex align-items-center gap-2 mb-1 thes-ccam-link-row">' +
        '<span class="font-monospace small text-muted">' + _esc(p.id_protocole) + '</span>' +
        '<span class="small flex-grow-1 thes-ccam-hop-link" role="button" data-hop-id="' + _esc(p.id) + '">' + _esc(p.libelle_cible) + '</span>' +
        '<span class="badge bg-light text-dark border">' + _fmt(p.frequence) + '</span>' +
        '<a class="app-icon-btn ccam-hop-btn" data-hop-id="' + _esc(p.id) + '" title="Ouvrir ce protocole" role="button"><i class="bi bi-box-arrow-in-right"></i></a>' +
        '<a class="app-icon-btn app-icon-btn--warning ccam-merge-btn" data-merge-id="' + _esc(p.id) + '" title="Fusionner dans le protocole courant" role="button"><i class="bi bi-intersect"></i></a></div>';
    }).join('');
    ct.querySelectorAll('.ccam-merge-btn').forEach(function (btn) { btn.addEventListener('click', function () { _confirmMerge(btn.dataset.mergeId); }); });
    ct.querySelectorAll('.ccam-hop-btn, .thes-ccam-hop-link').forEach(function (el) { el.addEventListener('click', function () { _openSlide(el.dataset.hopId); }); });
  }

  function _confirmMerge(dupId) {
    var dup = _protocoles.find(function (x) { return x.id === dupId; });
    if (!dup || !_slideProto) return;
    _mergeTargetId = dupId;
    var bd = document.getElementById('mergeConfirmBody');
    if (bd) bd.innerHTML = '<p class="mb-2">Fusionner :</p>' +
      '<p class="fw-semibold text-danger">' + _esc(dup.id_protocole) + ' — ' + _esc(dup.libelle_cible) + ' <small>(' + _fmt(dup.frequence) + ')</small></p>' +
      '<p class="mb-1">→ dans :</p>' +
      '<p class="fw-semibold text-success">' + _esc(_slideProto.id_protocole) + ' — ' + _esc(_slideProto.libelle_cible) + ' <small>(' + _fmt(_slideProto.frequence) + ')</small></p>' +
      '<p class="text-danger small mt-2 mb-0"><i class="bi bi-exclamation-triangle me-1"></i>Interventions déplacées. Protocole doublon supprimé. Irréversible.</p>';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMergeConfirm')).show();
  }

  async function _executeMerge() {
    if (!_mergeTargetId || !_slideProtoId) return;
    var surv = _slideProtoId, dupId = _mergeTargetId;
    _mergeTargetId = null;
    bootstrap.Modal.getInstance(document.getElementById('modalMergeConfirm')).hide();

    /* 1. Move interventions (INTERDIT ERREUR 13 : ne PAS toucher protocole_operatoire) */
    var r1 = await window.bdb.from('thesaurus_interventions').update({ protocole_id: surv }).eq('protocole_id', dupId).select('id');
    if (r1.error) { _toast('error', 'Erreur déplacement : ' + r1.error.message); return; }
    var moved = r1.data ? r1.data.length : 0;

    /* 2. Delete CCAM links */
    await window.bdb.from('protocole_ccam').delete().eq('protocole_id', dupId).select('id'); // UX06 : caller confirms

    /* 3. Delete duplicate */
    var r3 = await window.bdb.from('thesaurus_protocoles').delete().eq('id', dupId).select('id');
    if (r3.error) { _toast('error', 'Erreur suppression : ' + r3.error.message); return; }

    _protocoles = _protocoles.filter(function (p) { return p.id !== dupId; });
    _liens = _liens.filter(function (l) { return l.protocole_id !== dupId; });
    _rebuildLiens();
    _slideProto.frequence += moved;
    _setText('ccamSlideProtoFreq', _fmt(_slideProto.frequence) + ' interv.');
    _filterA(); _renderA(); _showDoublons();
    if (_auditInited) _renderViewC();
    _toast('success', 'Fusion terminée. ' + _fmt(moved) + ' interventions déplacées.');
  }

  /* ── §2 Links ────────────────────────────────────────────── */
  function _renderSlideLinks() {
    var ct = document.getElementById('ccamSlideLinks');
    if (!ct || !_slideProtoId) return;
    var ls = _liensByProto[_slideProtoId] || [];
    _setText('ccamSlideLinkCount', String(ls.length));
    if (!ls.length) { ct.innerHTML = '<p class="text-muted small fst-italic mb-0">Aucun lien CCAM.</p>'; return; }
    ct.innerHTML = ls.map(function (l) {
      var a = _refByUuid[l.ccam_acte_id];
      if (!a) return '';
      return '<div class="thes-ccam-link-row d-flex align-items-start gap-2 mb-1">' +
        '<code class="small text-primary flex-shrink-0 mt-1">' + _esc(a.code_ccam) + '</code>' +
        '<span class="small flex-grow-1">' + _esc(a.libelle) + '</span>' +
        '<button class="btn btn-xs btn-outline-danger flex-shrink-0 ccam-slide-unlink" data-lien-id="' + _esc(l.id) + '" type="button" title="Supprimer ce lien CCAM"><i class="bi bi-trash me-1"></i>Délier</button></div>';
    }).join('');
    ct.querySelectorAll('.ccam-slide-unlink').forEach(function (btn) {
      btn.addEventListener('click', function () { _unlinkActe(btn.dataset.lienId); });
    });
  }

  /* ── §2 Links : Keyword chips ────────────────────────────── */
  function _renderKeywordChips() {
    var container = document.getElementById('ccamSlideKeywords');
    if (!container || !_slideProto) return;

    var raw = [
      _slideProto.libelle_cible,
      _slideProto.synonymes_recherche || '',
      _slideProto.pathologie || '',
      _slideProto.zone_anat || ''
    ].join(' ');

    var kws = _extractWords(raw);
    var seen = {}; var unique = [];
    kws.forEach(function (w) { if (!seen[w] && w.length > 3) { seen[w] = true; unique.push(w); } });

    var synPhrases = (_slideProto.synonymes_recherche || '').split(/[|,]/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 2; });

    if (!unique.length && !synPhrases.length) { container.classList.add('d-none'); return; }

    container.classList.remove('d-none');
    var html = '';
    if (synPhrases.length) {
      html += synPhrases.map(function (phrase) {
        return '<button class="btn btn-xs btn-outline-info ccam-kw-chip" data-kw="' + _esc(phrase) + '" type="button">' + _esc(phrase) + '</button>';
      }).join(' ');
    }
    var extraKws = unique.filter(function (w) {
      return !synPhrases.some(function (p) { return p.toLowerCase().includes(w); });
    }).slice(0, 8);
    if (extraKws.length) {
      html += ' ' + extraKws.map(function (w) {
        return '<button class="btn btn-xs btn-outline-secondary ccam-kw-chip" data-kw="' + _esc(w) + '" type="button">' + _esc(w) + '</button>';
      }).join(' ');
    }

    container.innerHTML = html;
    container.querySelectorAll('.ccam-kw-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var kw = chip.dataset.kw;
        var inp = document.getElementById('ccamSlideSearch');
        if (inp) { inp.value = kw; _searchSlide(kw); }
      });
    });
  }

  function _searchSlide(q) {
    var bd = document.getElementById('ccamSlideResultsBody');
    if (!bd) return;
    if (!q || q.length < 2) {
      bd.innerHTML = '<tr><td colspan="3" class="text-center text-muted small py-3">Tapez au moins 2 caractères</td></tr>';
      return;
    }
    var ws = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length >= 2; });
    if (!ws.length) return;
    var res = _refOt.filter(function (a) {
      var h = (a.libelle + ' ' + a.code_ccam).toLowerCase();
      return ws.every(function (w) { return h.includes(w); });
    }).slice(0, 25);
    if (!res.length) {
      bd.innerHTML = '<tr><td colspan="3" class="text-center text-muted small py-3">Aucun acte trouvé</td></tr>';
      return;
    }
    var lk = {};
    (_liensByProto[_slideProtoId] || []).forEach(function (l) { lk[l.ccam_acte_id] = true; });
    bd.innerHTML = res.map(function (a) {
      var is = lk[a.id];
      var act = is
        ? '<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-lg"></i></span>'
        : '<a class="app-icon-btn app-icon-btn--success ccam-slide-add" data-acte-id="' + _esc(a.id) + '" title="Lier" role="button"><i class="bi bi-plus-lg"></i></a>';
      return '<tr class="' + (is ? 'table-success' : '') + '">' +
        '<td><code class="small">' + _esc(a.code_ccam) + '</code></td>' +
        '<td class="small">' + _esc(a.libelle) + '</td>' +
        '<td class="text-center">' + act + '</td></tr>';
    }).join('');
    bd.querySelectorAll('.ccam-slide-add').forEach(function (btn) {
      btn.addEventListener('click', function () { _linkActe(btn.dataset.acteId); });
    });
  }

  /* ── §3 Interventions ────────────────────────────────────── */
  async function _loadInterv() {
    if (!_slideProtoId) return;
    var bd = document.getElementById('ccamSlideIntervBody');
    var ld = document.getElementById('ccamSlideIntervLoading');
    if (ld) ld.classList.remove('d-none');
    var q = window.bdb.from('thesaurus_interventions')
      .select('id, date_intervention, note, note_reviewed_at, lateralite', { count: 'exact' })
      .eq('protocole_id', _slideProtoId)
      .order('date_intervention', { ascending: false });
    if (_slideIntervSearch) q = q.ilike('note', '%' + _slideIntervSearch + '%');
    var off = (_slideIntervPage - 1) * _slideIntervPageSize;
    q = q.range(off, off + _slideIntervPageSize - 1);
    var r = await q;
    if (ld) ld.classList.add('d-none');
    if (r.error) {
      if (bd) bd.innerHTML = '<tr><td colspan="4" class="text-danger small py-3">' + _esc(r.error.message) + '</td></tr>';
      return;
    }
    _slideIntervTotal = r.count || 0;
    _setText('ccamSlideIntervCount', _fmt(_slideIntervTotal));
    var rows = r.data || [];
    if (!rows.length) {
      if (bd) bd.innerHTML = '<tr><td colspan="4" class="text-center text-muted small py-3">Aucune intervention.</td></tr>';
    } else if (bd) {
      var QUAL_LABEL = { ok: 'Exploitable', short: 'Trop court', encoding: 'Encodage', noise: 'Bruit', empty: 'Vide' };
      var QUAL_BADGE = { ok: 'bg-success-subtle text-success-emphasis', short: 'bg-warning-subtle text-warning-emphasis', encoding: 'bg-danger-subtle text-danger-emphasis', noise: 'bg-secondary-subtle text-secondary-emphasis', empty: 'bg-secondary-subtle text-secondary-emphasis' };
      var QUAL_ICON = { ok: 'bi-check-circle', short: 'bi-dash-circle', encoding: 'bi-exclamation-diamond', noise: 'bi-hash', empty: 'bi-x-circle' };
      bd.innerHTML = rows.map(function (row) {
        var ql = _noteQual(row.note);
        var nt = row.note ? (row.note.length > 60 ? row.note.substring(0, 60) + '\u2026' : row.note) : '\u2014';
        return '<tr>' +
          '<td class="small text-muted text-nowrap">' + _esc((row.date_intervention || '').substring(0, 7)) + '</td>' +
          '<td class="small thes-ccam-note-cell" data-interv-id="' + _esc(row.id) + '" data-full-note="' + _esc(row.note || '') + '" title="Cliquer pour modifier">' + _esc(nt) + '</td>' +
          '<td><span class="badge ' + (QUAL_BADGE[ql] || '') + '"><i class="' + (QUAL_ICON[ql] || '') + ' me-1"></i>' + (QUAL_LABEL[ql] || ql) + '</span></td>' +
          '<td class="text-center"><a class="app-icon-btn ccam-interv-reassign" data-interv-id="' + _esc(row.id) + '" title="Réassigner" role="button"><i class="bi bi-arrow-right-circle"></i></a></td></tr>';
      }).join('');
      bd.querySelectorAll('.ccam-interv-reassign').forEach(function (btn) {
        btn.addEventListener('click', function () { _reassign(btn.dataset.intervId); });
      });
      bd.querySelectorAll('.thes-ccam-note-cell').forEach(function (cell) {
        cell.addEventListener('click', function () { _editNoteInline(cell); });
      });
      if (typeof BdbGlossaire !== 'undefined' && BdbGlossaire.enrich) BdbGlossaire.enrich(bd);
    }
    var tp = Math.max(1, Math.ceil(_slideIntervTotal / _slideIntervPageSize));
    _setText('ccamSlideIntervPageInfo', 'Page ' + _slideIntervPage + '/' + tp + ' (' + _fmt(_slideIntervTotal) + ')');
    var pv = document.getElementById('ccamSlideIntervPrev'), nx = document.getElementById('ccamSlideIntervNext');
    if (pv) pv.disabled = _slideIntervPage <= 1;
    if (nx) nx.disabled = _slideIntervPage >= tp;
  }

  function _noteQual(n) {
    if (!n || n.trim().length < 4) return 'empty';
    if (/[\xC3][\xA9\xA8\xA0]/.test(n)) return 'encoding';
    if (/^\d+$/.test(n.trim())) return 'noise';
    if (n.trim().split(/\s+/).length < 3) return 'short';
    return 'ok';
  }

  function _editNoteInline(cell) {
    if (cell.querySelector('input')) return;
    var iid = cell.dataset.intervId;
    var fullNote = cell.dataset.fullNote || '';
    var originalHtml = cell.innerHTML;

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'form-control form-control-sm thes-ccam-note-input';
    inp.value = fullNote;
    cell.innerHTML = '';
    cell.appendChild(inp);
    inp.focus();
    inp.select();

    function _save() {
      var newNote = inp.value.trim();
      if (newNote === fullNote) { cell.innerHTML = originalHtml; return; }
      window.bdb.from('thesaurus_interventions')
        .update({ note: newNote })
        .eq('id', iid)
        .select('id')
        .then(function (r) {
          if (r.error) { _toast('error', 'Erreur : ' + r.error.message); cell.innerHTML = originalHtml; return; }
          if (!r.data || !r.data.length) { _toast('error', 'UPDATE bloqué (RLS).'); cell.innerHTML = originalHtml; return; }
          cell.dataset.fullNote = newNote;
          var trunc = newNote.length > 60 ? newNote.substring(0, 60) + '\u2026' : newNote;
          cell.textContent = trunc || '\u2014';
          cell.title = 'Cliquer pour modifier';
          _toast('success', 'Note corrigée.');
        });
    }

    inp.addEventListener('blur', _save);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
      if (e.key === 'Escape') { cell.innerHTML = originalHtml; }
    });
  }

  /* ── §3 Interventions : Glossaire ────────────────────────── */
  function _openGlossairePanel() {
    var panel = document.getElementById('ccamGlossairePanel');
    if (!panel) return;
    panel.classList.remove('d-none');
    var inp = document.getElementById('ccamGlossaireTerm');
    if (inp) { inp.value = ''; inp.focus(); }
    var def = document.getElementById('ccamGlossaireDef');
    if (def) def.value = '';
    var notes = document.getElementById('ccamGlossaireNotes');
    if (notes) notes.value = '';
    var cb = document.getElementById('ccamGlossairePropag');
    if (cb) cb.checked = true;
    var catSel = document.getElementById('ccamGlossaireCat');
    if (catSel) catSel.value = 'ABREVIATION';
    var msg = document.getElementById('ccamGlossaireMsg');
    if (msg) msg.innerHTML = '';
  }

  function _hideGlossairePanel() {
    var panel = document.getElementById('ccamGlossairePanel');
    if (panel) panel.classList.add('d-none');
  }

  async function _saveGlossaire() {
    var term = (document.getElementById('ccamGlossaireTerm').value || '').trim().toUpperCase();
    var def = (document.getElementById('ccamGlossaireDef').value || '').trim();
    var notes = (document.getElementById('ccamGlossaireNotes').value || '').trim();
    var cat = (document.getElementById('ccamGlossaireCat') || {}).value || 'ABREVIATION';
    var propag = document.getElementById('ccamGlossairePropag').checked;
    var msg = document.getElementById('ccamGlossaireMsg');

    if (!term || !def) { if (msg) msg.innerHTML = '<span class="text-danger">Terme et définition requis.</span>'; return; }

    var r1 = await window.bdb.from('glossaire')
      .insert({
        abbreviation: term, definition: def, usage_notes: notes || null,
        categorie: cat, is_propagated: propag,
        created_by: window.bdbUser ? window.bdbUser.id : null
      })
      .select();
    if (r1.error) {
      if (r1.error.message && r1.error.message.includes('duplicate')) {
        if (msg) msg.innerHTML = '<span class="text-warning"><i class="bi bi-info-circle me-1"></i>Ce terme existe déjà dans le glossaire.</span>';
      } else {
        if (msg) msg.innerHTML = '<span class="text-danger">' + _esc(r1.error.message) + '</span>';
      }
      return;
    }

    if (propag && _slideProto && _slideProtoId) {
      var currentSyn = _slideProto.synonymes_recherche || '';
      if (!currentSyn.toLowerCase().includes(term.toLowerCase())) {
        var newSyn = currentSyn ? currentSyn + '|' + term : term;
        var r2 = await window.bdb.from('thesaurus_protocoles')
          .update({ synonymes_recherche: newSyn, updated_at: new Date().toISOString() })
          .eq('id', _slideProtoId)
          .select('id');
        if (!r2.error && r2.data && r2.data.length) {
          _slideProto.synonymes_recherche = newSyn;
          _renderKeywordChips();
        }
      }
    }

    if (msg) msg.innerHTML = '<span class="text-success"><i class="bi bi-check-lg me-1"></i>Glossaire enrichi. ' +
      (propag ? 'Synonyme ajouté au protocole.' : '') + '</span>';
    _toast('success', term + ' ajouté au glossaire.');
  }

  var _reassignIntervId = null;

  function _reassign(iid) {
    _reassignIntervId = iid;
    var panel = document.getElementById('ccamReassignPanel');
    var inp = document.getElementById('ccamReassignSearch');
    if (!panel) return;
    panel.classList.remove('d-none');
    if (inp) { inp.value = ''; inp.focus(); }
    var list = document.getElementById('ccamReassignList');
    if (list) list.innerHTML = '<p class="text-muted small py-2 text-center">Tapez pour rechercher un protocole…</p>';
  }

  function _hideReassignPanel() {
    _reassignIntervId = null;
    var panel = document.getElementById('ccamReassignPanel');
    if (panel) panel.classList.add('d-none');
  }

  function _filterReassignProtos(query) {
    var list = document.getElementById('ccamReassignList');
    if (!list) return;
    if (!query || query.length < 2) {
      list.innerHTML = '<p class="text-muted small py-2 text-center">Tapez au moins 2 caractères…</p>';
      return;
    }
    var q = query.toLowerCase();
    var matches = _protocoles.filter(function (p) {
      if (_slideProto && p.id === _slideProto.id) return false;
      return (p.libelle_cible + ' ' + p.id_protocole + ' ' + (p.synonymes_recherche || '')).toLowerCase().includes(q);
    }).sort(function (a, b) { return b.frequence - a.frequence; }).slice(0, 8);

    if (!matches.length) { list.innerHTML = '<p class="text-muted small py-2 text-center">Aucun protocole trouvé.</p>'; return; }
    list.innerHTML = matches.map(function (p) {
      return '<div class="thes-ccam-reassign-row" role="button" data-target-id="' + _esc(p.id) + '">' +
        '<span class="font-monospace small text-muted me-2">' + _esc(p.id_protocole) + '</span>' +
        '<span class="small flex-grow-1">' + _esc(p.libelle_cible) + '</span>' +
        '<span class="badge bg-light text-dark border ms-2">' + _fmt(p.frequence) + '</span></div>';
    }).join('');
    list.querySelectorAll('.thes-ccam-reassign-row').forEach(function (row) {
      row.addEventListener('click', function () { _executeReassign(row.dataset.targetId); });
    });
  }

  async function _executeReassign(targetId) {
    if (!_reassignIntervId) return;
    var tgt = _protocoles.find(function (p) { return p.id === targetId; });
    if (!tgt) return;
    /* INTERDIT ERREUR 13 : ne PAS toucher protocole_operatoire */
    var r = await window.bdb.from('thesaurus_interventions').update({ protocole_id: tgt.id }).eq('id', _reassignIntervId).select('id');
    if (r.error) { _toast('error', 'Erreur : ' + r.error.message); return; }
    if (!r.data || !r.data.length) { _toast('error', 'UPDATE bloqué (RLS).'); return; }
    _toast('success', 'Réassigné → ' + tgt.id_protocole);
    _hideReassignPanel();
    _loadInterv();
  }

  /* ── §4 Fiches papier ──────────────────────────────────── */
  function _renderFichesSection() {
    var ct = document.getElementById('ccamSlideFichesBody');
    var badge = document.getElementById('ccamSlideFichesCount');
    if (!ct || !_slideProtoId) return;
    var linked = _fiches.filter(function (f) { return f.protocole_id === _slideProtoId; });
    if (badge) badge.textContent = String(linked.length);
    if (!linked.length) {
      ct.innerHTML = '<p class="text-muted small fst-italic mb-0">Aucune fiche papier liée.</p>';
      return;
    }
    ct.innerHTML = linked.map(function (f) {
      return '<div class="d-flex align-items-center gap-2 mb-1 thes-ccam-link-row">' +
        '<span class="small text-muted flex-shrink-0">' + _esc(f.chirurgien) + '</span>' +
        '<span class="small flex-grow-1 fw-medium">' + _esc(f.nom_nettoye) + '</span>' +
        '<span class="badge bg-' + (f.statut === 'Rapproche' ? 'success' : 'secondary') + '-subtle text-' + (f.statut === 'Rapproche' ? 'success' : 'secondary') + '-emphasis me-1">' + _esc(f.statut) + '</span>' +
        '<button class="btn btn-xs btn-outline-danger flex-shrink-0 ccam-fiche-unlink" data-fiche-id="' + _esc(f.id) + '" type="button" title="Délier"><i class="bi bi-x-lg"></i></button></div>';
    }).join('');
    ct.querySelectorAll('.ccam-fiche-unlink').forEach(function (btn) {
      btn.addEventListener('click', function () { _unlinkFiche(btn.dataset.ficheId); });
    });
  }

  async function _unlinkFiche(ficheId) {
    var r = await window.bdb.from('thesaurus_fiches_papier')
      .update({ protocole_id: null, statut: 'Sans correspondance' })
      .eq('id', ficheId)
      .select('id');
    if (r.error) { _toast('error', 'Erreur : ' + r.error.message); return; }
    if (!r.data || !r.data.length) { _toast('error', 'UPDATE bloqué (RLS).'); return; }
    var fiche = _fiches.find(function (f) { return f.id === ficheId; });
    if (fiche) { fiche.protocole_id = null; fiche.statut = 'Sans correspondance'; }
    _renderFichesSection();
    _toast('success', 'Fiche déliée.');
  }

  /* ═══ LINK / UNLINK ═══════════════════════════════════════════ */
  async function _linkActe(aid) {
    if (!_slideProtoId) return;
    if ((_liensByProto[_slideProtoId] || []).find(function (l) { return l.ccam_acte_id === aid; })) { _toast('info', 'Lien existant.'); return; }
    var rng = (_liensByProto[_slideProtoId] || []).length + 1;
    var r = await window.bdb.from('protocole_ccam').insert({ protocole_id: _slideProtoId, ccam_acte_id: aid, rang: rng }).select();
    if (r.error) { _toast('error', 'Erreur : ' + r.error.message); return; }
    if (!r.data || !r.data.length) { _toast('error', 'INSERT bloqué (RLS).'); return; }
    _liens.push(r.data[0]);
    _rebuildLiens();
    _refreshAfterChange();
    _toast('success', 'Lien CCAM ajouté.');
  }

  async function _unlinkActe(lid) {
    if (!confirm("Retirer ce lien CCAM définitivement ?")) return;
    var r = await window.bdb.from('protocole_ccam').delete().eq('id', lid).select();
    if (r.error) { _toast('error', 'Erreur : ' + r.error.message); return; }
    if (!r.data || !r.data.length) { _toast('error', 'DELETE bloqué (RLS).'); return; }
    _liens = _liens.filter(function (l) { return l.id !== lid; });
    _rebuildLiens();
    _refreshAfterChange();
    _toast('success', 'Lien supprimé.');
  }

  function _refreshAfterChange() {
    if (_slideProtoId) {
      _renderSlideLinks();
      _renderCcamPreview();
      _renderFichesSection();
      var inp = document.getElementById('ccamSlideSearch');
      if (inp && inp.value) _searchSlide(inp.value);
    }
    _renderATable();
    if (_auditInited) _renderViewC();
  }

  /* ═══ UTILS ═══════════════════════════════════════════════════ */
  const _esc = (typeof escHtml === 'function') ? escHtml : (s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
  function _fmt(n) { return Number(n).toLocaleString('fr-FR'); }
  function _setText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function _toggle(id, show) { var el = document.getElementById(id); if (el) el.classList.toggle('d-none', !show); }
  function _extractWords(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s>',|\-]+/).filter(function (w) { return w.length > 2 && !_STOP.has(w); }); }
  function _toast(tp, msg) { var m = { success: 'toastSuccess', error: 'toastError', info: 'toastInfo' }; var id = m[tp] || m.info; var el = document.getElementById(id), bd = document.getElementById(id + 'Body'); if (el && bd) { bd.textContent = msg; new bootstrap.Toast(el).show(); } }

  return { init: init, openSlide: _openSlide, closeSlide: _closeSlide };
})();

/* Facade globale — callable depuis tout onglet thesaurus */
var ThesWorkbench = {
  open: async function (protoId) { await ThesCcam.init(); ThesCcam.openSlide(protoId); },
  close: function () { ThesCcam.closeSlide(); }
};

document.addEventListener('shown.bs.tab', function (e) { if (e.target && e.target.id === 'tab-ccam-btn') ThesCcam.init(); });
