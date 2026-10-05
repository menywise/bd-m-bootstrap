var GlossApp = (function () {
  'use strict';

  var CACHE_KEY = 'bdb_glos_entries';
  var PAGE_SIZE = 24;
  var ADMIN_PAGE_SIZE = 50;
  var _entries = [];
  var _filteredEntries = [];
  var _currentPage = 1;
  var _currentAdminPage = 1;
  var _currentQuery = '';
  var _alphaFilter = '';
  var _isAdmin = false;
  var _editId = null;
  var _deleteId = null;
  var _pendingSugg = [];
  var _prefillAfterAdminInit = null;
  var _searchDebounce = null;
  var _adminGlosInited = false;
  var _adminPagListenerAdded = false;
  var _suggInited = false;
  var _propListenerAdded = false;
  var _decoSource = '';
  var _candidats = [];
  var _adminSort = { col: 'abbreviation', asc: true };

  // ─── Helpers ──────────────────────────────────────────────────────────────


  function setState(prefix, state) {
    ['loading', 'empty', 'error', 'content'].forEach(function (s) {
      var cap = s.charAt(0).toUpperCase() + s.slice(1);
      var el = document.getElementById(prefix + cap);
      if (el) el.classList.toggle('d-none', s !== state);
    });
  }

  function normalizeText(s) {
    if (!s) return '';
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function highlightText(escaped, query) {
    if (!query || query.length < 2) return escaped;
    var safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(' + safe + ')', 'gi');
    return escaped.replace(re, '<mark>$1</mark>');
  }

  // ─── Cache ────────────────────────────────────────────────────────────────

  function readCache() {
    try {
      var c = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (c && Array.isArray(c) && c.length > 0) return c;
    } catch (_) {}
    return null;
  }

  function writeCache(data) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function purgeCache() {
    try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {}
  }

  // ─── Chargement entrées ───────────────────────────────────────────────────

  async function loadEntries() {
    if (window.bdbIsDemo && window.bdbIsDemo()) {
      var dr = await window.bdb.from('demo_glossaire').select('*').order('abbreviation');
      _entries = dr.data || [];
      return;
    }
    var cached = readCache();
    if (cached) { _entries = cached; return; }
    var r = await window.bdb.from('glossaire').select('*').order('abbreviation');
    if (r.error) throw new Error(r.error.message);
    _entries = r.data || [];
    writeCache(_entries);
  }

  // ─── Badge couleur catégorie ──────────────────────────────────────────────

  var _catBadge = {
    ABREVIATION: 'glos-badge-abreviation',
    EPONYME: 'glos-badge-eponyme',
    PATHOLOGIE: 'glos-badge-pathologie',
    MATERIEL: 'glos-badge-materiel',
    TECHNIQUE: 'glos-badge-technique',
    ANATOMIE: 'glos-badge-anatomie',
    CONVENTION: 'glos-badge-convention'
  };

  function catBadge(cat) {
    return _catBadge[cat] || 'glos-badge-default';
  }

  // ─── FACE A — Consultation ────────────────────────────────────────────────

  function renderCards(entries) {
    var container = document.getElementById('glossCards');
    if (!container) return;

    // Pagination : slice
    var total = entries.length;
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (_currentPage > totalPages) _currentPage = totalPages;
    var start = (_currentPage - 1) * PAGE_SIZE;
    var pageEntries = entries.slice(start, start + PAGE_SIZE);

    if (total === 0) {
      setState('gloss', 'empty');
      renderPagination(0, 0);
      return;
    }

    setState('gloss', 'content');

    var q = _currentQuery;
    container.innerHTML = pageEntries.map(function (e) {
      var variantesHtml = '';
      if (e.variantes) {
        variantesHtml = '<div class="mt-2">' +
          e.variantes.split('|').map(function (v) {
            return '<span class="bdb-tag bdb-tag--mono">' + escHtml(v.trim()) + '</span>';
          }).join(' ') +
          '</div>';
      }
      var termHtml = highlightText(escHtml(e.abbreviation), q);
      var defHtml = highlightText(escHtml(e.definition), q);

      return '<div class="col-12 col-md-6 col-xl-4">' +
        '<div class="bdb-card bdb-card--hover h-100">' +
          '<div class="card-body">' +
            '<div class="d-flex justify-content-between align-items-start mb-2">' +
              '<h6 class="mb-0 fw-bold font-monospace">' + termHtml + '</h6>' +
              (e.categorie ? '<span class="badge ' + catBadge(e.categorie) + '">' + escHtml(e.categorie) + '</span>' : '') +
            '</div>' +
            '<p class="small mb-1">' + defHtml + '</p>' +
            (e.usage_notes ? '<p class="small text-muted mb-2">' + escHtml(e.usage_notes) + '</p>' : '') +
            variantesHtml +
            '<div class="d-flex justify-content-end mt-2">' +
              '<button class="btn btn-outline-secondary glos-btn-report" data-report-term="' + escHtml(e.abbreviation) + '" type="button" title="Signaler une erreur">' +
                '<i class="bi bi-flag me-1"></i>Signaler' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    if (typeof BdbGlossaire !== 'undefined') {
      BdbGlossaire.enrich(container);
    }

    renderPagination(total, totalPages);
  }

  function renderPagination(total, totalPages) {
    var paginEl = document.getElementById('glossPagination');
    var countLabel = document.getElementById('glossCountLabel');
    if (!paginEl) return;

    // Compteur contextuel
    if (countLabel) {
      if (_currentQuery && total > 0) {
        var qDisplay = _currentQuery.length > 20 ? _currentQuery.substring(0, 20) + '...' : _currentQuery;
        countLabel.innerHTML = '<span id="glossCount">' + total + '</span> résultat(s) pour <em>« ' + escHtml(qDisplay) + ' »</em>';
      } else if (_alphaFilter && total > 0) {
        countLabel.innerHTML = '<span id="glossCount">' + total + '</span> terme(s) en <strong>' + escHtml(_alphaFilter) + '</strong>';
      } else {
        countLabel.innerHTML = '<span id="glossCount">' + total + '</span> terme(s)';
      }
    }

    if (totalPages <= 1) {
      paginEl.innerHTML = '';
      return;
    }

    var html = '';
    // Prev
    html += '<button class="app-page-btn" data-page="' + (_currentPage - 1) + '"' +
      (_currentPage <= 1 ? ' disabled' : '') +
      ' aria-label="Page précédente"><i class="bi bi-chevron-left"></i></button>';

    // Pages with ellipsis
    var pages = buildPageList(_currentPage, totalPages);
    pages.forEach(function (p) {
      if (p === '...') {
        html += '<span class="glos-pag-ellipsis">…</span>';
      } else {
        html += '<button class="app-page-btn' + (p === _currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
    });

    // Next
    html += '<button class="app-page-btn" data-page="' + (_currentPage + 1) + '"' +
      (_currentPage >= totalPages ? ' disabled' : '') +
      ' aria-label="Page suivante"><i class="bi bi-chevron-right"></i></button>';

    paginEl.innerHTML = html;
  }

  function buildPageList(current, total) {
    if (total <= 7) {
      var arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr;
    }
    var pages = [1];
    if (current > 3) pages.push('...');
    var start = Math.max(2, current - 1);
    var end = Math.min(total - 1, current + 1);
    for (var j = start; j <= end; j++) pages.push(j);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  function renderAlphaIndex() {
    var container = document.getElementById('glossAlphaIndex');
    if (!container) return;

    // Lettres presentes dans le glossaire
    var present = {};
    _entries.forEach(function (e) {
      if (e.abbreviation) {
        var first = e.abbreviation.charAt(0).toUpperCase();
        present[first] = true;
      }
    });

    var html = '<button class="glos-alpha-btn' + (!_alphaFilter ? ' active' : '') + '" data-alpha="" title="Tous les termes">Tous</button>';
    for (var i = 0; i < 26; i++) {
      var letter = String.fromCharCode(65 + i);
      var hasEntries = !!present[letter];
      html += '<button class="glos-alpha-btn' +
        (_alphaFilter === letter ? ' active' : '') +
        (!hasEntries ? ' disabled' : '') +
        '" data-alpha="' + letter + '">' + letter + '</button>';
    }
    container.innerHTML = html;
  }

  function filterAndRender() {
    var q = normalizeText((document.getElementById('glossSearch') || {}).value || '');
    var cat = (document.getElementById('glossFilterCategorie') || {}).value || '';

    _currentQuery = (document.getElementById('glossSearch') || {}).value || '';

    var filtered = _entries.filter(function (e) {
      // Filtre alpha
      if (_alphaFilter && e.abbreviation) {
        if (e.abbreviation.charAt(0).toUpperCase() !== _alphaFilter) return false;
      }
      if (cat && e.categorie !== cat) return false;
      if (!q) return true;
      var hay = normalizeText([e.abbreviation, e.definition, e.usage_notes, e.variantes].join(' '));
      return hay.includes(q);
    });

    _filteredEntries = filtered;
    _currentPage = 1;

    // Etat vide contextuel
    var emptyMsg = document.getElementById('glossEmptyMsg');
    var emptyIcon = document.getElementById('glossEmptyIcon');
    if (filtered.length === 0 && _entries.length > 0) {
      // Filtre actif, pas de resultats
      if (emptyIcon) emptyIcon.className = 'bi bi-search d-block fs-1 mb-2 opacity-25';
      if (emptyMsg) {
        if (_currentQuery) {
          emptyMsg.innerHTML = 'Aucun terme ne correspond à <em>« ' + escHtml(_currentQuery) + ' »</em>';
        } else if (_alphaFilter) {
          emptyMsg.textContent = 'Aucun terme en ' + _alphaFilter;
        } else if (cat) {
          emptyMsg.textContent = 'Aucun terme dans cette catégorie';
        } else {
          emptyMsg.textContent = 'Aucun terme trouvé.';
        }
      }
    } else if (filtered.length === 0) {
      // Glossaire reellement vide
      if (emptyIcon) emptyIcon.className = 'bi bi-book d-block fs-1 mb-2 opacity-25';
      if (emptyMsg) emptyMsg.textContent = 'Le glossaire est vide pour le moment.';
    }

    renderCards(filtered);
  }

  async function initFaceA() {
    setState('gloss', 'loading');
    try {
      await loadEntries();
    } catch (err) {
      setState('gloss', 'error');
      var errEl = document.getElementById('glossErrorMsg');
      if (errEl) errEl.textContent = err.message;
      return;
    }

    _filteredEntries = _entries;
    renderAlphaIndex();
    renderCards(_entries);

    var searchEl = document.getElementById('glossSearch');
    var filterEl = document.getElementById('glossFilterCategorie');
    var resetEl = document.getElementById('glossBtnReset');

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(_searchDebounce);
        _searchDebounce = setTimeout(filterAndRender, 300);
      });
    }
    if (filterEl) {
      filterEl.addEventListener('change', filterAndRender);
    }
    if (resetEl) {
      resetEl.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        if (filterEl) filterEl.value = '';
        _alphaFilter = '';
        _currentQuery = '';
        _currentPage = 1;
        renderAlphaIndex();
        _filteredEntries = _entries;
        renderCards(_entries);
      });
    }

    // Index alphabetique — delegation
    var alphaContainer = document.getElementById('glossAlphaIndex');
    if (alphaContainer) {
      alphaContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.glos-alpha-btn');
        if (!btn) return;
        _alphaFilter = btn.getAttribute('data-alpha') || '';
        _currentPage = 1;
        // Update active state
        alphaContainer.querySelectorAll('.glos-alpha-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        filterAndRender();
      });
    }

    // Pagination — delegation sur le wrapper pagination (sibling de glossContent)
    // Bug fix S128 : avant, le listener etait sur #glossContent, mais
    // #glossPagination est dans #glossPaginationWrapper (sibling), donc
    // le clic ne remontait jamais. Listener dedie ci-dessous.
    var paginationWrapper = document.getElementById('glossPaginationWrapper');
    if (paginationWrapper) {
      paginationWrapper.addEventListener('click', function (e) {
        var pageBtn = e.target.closest('[data-page]');
        if (!pageBtn || pageBtn.disabled) return;
        var page = parseInt(pageBtn.getAttribute('data-page'), 10);
        if (page >= 1) {
          _currentPage = page;
          renderCards(_filteredEntries);
          var cardsEl = document.getElementById('glossCards');
          if (cardsEl) cardsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Delegation cards (signaler, etc.)
    var contentArea = document.getElementById('glossContent');
    if (contentArea) {
      contentArea.addEventListener('click', function (e) {
        // Signaler un probleme — ouvre modalSignalerTerme prerempli
        var reportBtn = e.target.closest('[data-report-term]');
        if (reportBtn) {
          var term = reportBtn.getAttribute('data-report-term');
          var modalEl = document.getElementById('modalSignalerTerme');
          if (modalEl && window.bootstrap) {
            var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
            setTimeout(function () {
              var sigTerm = document.getElementById('signalTerm');
              var sigType = document.getElementById('signalType');
              var sigMsg = document.getElementById('signalMessage');
              if (sigTerm) sigTerm.value = term;
              if (sigType) sigType.value = '';
              if (sigMsg) { sigMsg.value = ''; sigMsg.focus(); }
            }, 250);
          }
        }
      });
    }

    function goToProposer() {
      var modalEl = document.getElementById('modalProposerTerme');
      if (modalEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    }
    var btn1 = document.getElementById('glossBtnProposer');
    var btn2 = document.getElementById('glossBtnProposerFooter');
    if (btn1) btn1.addEventListener('click', goToProposer);
    if (btn2) btn2.addEventListener('click', goToProposer);
  }

  // ─── FACE D — Proposer ────────────────────────────────────────────────────

  async function loadMyProps() {
    setState('myProps', 'loading');
    var session = await window.bdb.auth.getSession();
    var userId = session && session.data && session.data.session
      ? session.data.session.user.id : null;

    if (!userId) { setState('myProps', 'empty'); return; }

    var r = await window.bdb
      .from('glossaire_suggestions')
      .select('*')
      .eq('proposed_by', userId)
      .order('created_at', { ascending: false });

    if (r.error) {
      setState('myProps', 'error');
      var errEl = document.getElementById('myPropsErrorMsg');
      if (errEl) errEl.textContent = r.error.message;
      return;
    }

    if (!r.data || r.data.length === 0) { setState('myProps', 'empty'); return; }

    setState('myProps', 'content');
    var list = document.getElementById('myPropsList');
    if (!list) return;

    var statusLabel = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
    var statusCls = { pending: 'bg-warning text-dark', approved: 'bg-success', rejected: 'bg-secondary' };

    list.innerHTML = r.data.map(function (s) {
      var lbl = statusLabel[s.status] || s.status;
      var cls = statusCls[s.status] || 'bg-light text-dark';
      return '<li class="list-group-item py-2">' +
        '<div class="d-flex justify-content-between align-items-start">' +
          '<div>' +
            '<span class="fw-semibold font-monospace">' + escHtml(s.proposed_term) + '</span>' +
            '<p class="small text-muted mb-0">' + escHtml(s.proposed_def) + '</p>' +
          '</div>' +
          '<span class="badge ' + cls + ' ms-2 flex-shrink-0">' + escHtml(lbl) + '</span>' +
        '</div>' +
        (s.admin_note ? '<p class="small text-muted fst-italic mt-1 mb-0">' + escHtml(s.admin_note) + '</p>' : '') +
      '</li>';
    }).join('');
  }

  async function initFaceD() {
    loadMyProps();

    var submitBtn = document.getElementById('propBtnSubmit');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', async function () {
      var term = (document.getElementById('propTerm') || {}).value || '';
      var def = (document.getElementById('propDef') || {}).value || '';
      var notes = (document.getElementById('propNotes') || {}).value || '';

      if (!term.trim() || !def.trim()) {
        bdbToast('Terme et définition sont obligatoires.', 'danger');
        return;
      }

      submitBtn.disabled = true;
      var session = await window.bdb.auth.getSession();
      var userId = session && session.data && session.data.session
        ? session.data.session.user.id : null;

      var r = await window.bdb
        .from('glossaire_suggestions')
        .insert({ proposed_term: term.trim(), proposed_def: def.trim(), proposed_notes: notes.trim() || null, proposed_by: userId, status: 'pending' })
        .select();

      submitBtn.disabled = false;

      if (r.error) { bdbToast('Erreur : ' + r.error.message, 'danger'); return; }

      bdbToast('Suggestion envoyée — merci !', 'success');
      document.getElementById('propTerm').value = '';
      document.getElementById('propDef').value = '';
      document.getElementById('propNotes').value = '';
      loadMyProps();
      updateSuggBadge();
    });
  }

  // ─── FACE B — Découverte ──────────────────────────────────────────────────

  function getSeuil() {
    var seuilEl = document.getElementById('decoSeuil');
    var seuil = parseInt((seuilEl || {}).value || '10', 10);
    return isNaN(seuil) || seuil < 1 ? 10 : seuil;
  }

  async function _executeScan(rpcName, params, sourceLabel, statsPrefix) {
    _decoSource = sourceLabel;

    // Réinitialiser UI
    var statsEl = document.getElementById('decoStats');
    var sourceLabelEl = document.getElementById('decoSourceLabel');
    var matchPanel = document.getElementById('decoMatchPanel');
    var batchBar = document.getElementById('decoBatchBar');

    if (statsEl) statsEl.textContent = '';
    if (sourceLabelEl) { sourceLabelEl.textContent = ''; sourceLabelEl.classList.add('d-none'); }
    if (matchPanel) matchPanel.classList.add('d-none');
    if (batchBar) batchBar.classList.add('d-none');

    // Mettre à jour le message de chargement
    var loadingEl = document.getElementById('decoLoading');
    if (loadingEl) {
      loadingEl.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Scan en cours — ' + escHtml(sourceLabel) + '…';
    }

    setState('deco', 'loading');

    var r = params
      ? await window.bdb.rpc(rpcName, params)
      : await window.bdb.rpc(rpcName);

    if (r.error) {
      setState('deco', 'error');
      var errEl = document.getElementById('decoErrorMsg');
      if (errEl) errEl.textContent = r.error.message;
      return;
    }

    var data = filterResults(r.data || []);
    var count = data.length;

    if (statsEl) statsEl.textContent = (statsPrefix || '') + count + ' terme(s) trouvé(s)';
    if (sourceLabelEl) {
      var spanEl = sourceLabelEl.querySelector('span') || sourceLabelEl;
      spanEl.textContent = 'Source active : ' + sourceLabel + ' — ' + count + ' résultat(s)';
      sourceLabelEl.classList.remove('d-none');
    }

    if (count === 0) { setState('deco', 'empty'); return; }

    setState('deco', 'content');
    renderDecoTable(data);
  }

  function runScanSynonymes() {
    _executeScan(
      'glossaire_scan_synonymes',
      null,
      'Synonymes protocoles',
      '460 protocoles analysés · '
    );
  }

  function runScanCCAM() {
    _executeScan(
      'glossaire_scan_ccam',
      { p_min_freq: getSeuil() },
      'Libellés CCAM',
      '8 292 actes CCAM analysés · '
    );
  }

  function runScanNotes() {
    _executeScan(
      'glossaire_scan_orphelins',
      { p_min_freq: getSeuil() },
      'Notes interventions',
      '62 733 notes analysées · '
    );
  }

  function runScanBigrammes() {
    _executeScan(
      'glossaire_scan_bigrammes',
      { p_min_freq: getSeuil() },
      'Bigrammes interventions',
      '62 733 notes analysées · '
    );
  }

  function renderDecoTable(data) {
    var tbody = document.getElementById('decoTableBody');
    if (!tbody) return;

    var known = {};
    _entries.forEach(function (e) {
      known[e.abbreviation.toUpperCase()] = true;
      if (e.variantes) {
        e.variantes.split('|').forEach(function (v) { known[v.trim().toUpperCase()] = true; });
      }
    });

    tbody.innerHTML = data.map(function (row) {
      var inGloss = !!known[String(row.mot || '').toUpperCase()];
      var motSafe = escHtml(row.mot);
      var freqSafe = escHtml(String(row.frequence || ''));
      return '<tr class="glos-orphelin-row">' +
        '<td class="glos-col-check">' +
          '<input type="checkbox" class="form-check-input deco-check" value="' + motSafe + '" aria-label="Sélectionner ' + motSafe + '"/>' +
        '</td>' +
        '<td class="fw-semibold font-monospace">' + motSafe + '</td>' +
        '<td class="text-end">' + freqSafe + '</td>' +
        '<td class="text-center">' +
          (inGloss
            ? '<i class="bi bi-check-circle-fill text-success"></i>'
            : '<i class="bi bi-dash-circle text-muted"></i>') +
        '</td>' +
        '<td class="text-center">' +
          '<button class="btn btn-sm btn-outline-primary me-1" data-deco-match="' + motSafe + '">' +
            '<i class="bi bi-eye me-1"></i>Voir' +
          '</button>' +
          (!inGloss
            ? '<button class="btn btn-sm btn-outline-success me-1" data-deco-create="' + motSafe + '">' +
                '<i class="bi bi-plus-lg me-1"></i>Créer' +
              '</button>' +
              '<button class="btn btn-sm btn-outline-warning me-1" data-deco-retain="' + motSafe + '" data-deco-freq="' + freqSafe + '">' +
                '<i class="bi bi-bookmark-plus me-1"></i>Retenir' +
              '</button>' +
              '<button class="btn btn-sm btn-outline-danger" data-deco-exclude="' + motSafe + '">' +
                '<i class="bi bi-slash-circle me-1"></i>Exclure' +
              '</button>'
            : '') +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function updateBatchBar() {
    var checked = document.querySelectorAll('#decoTableBody .deco-check:checked');
    var bar = document.getElementById('decoBatchBar');
    var countEl = document.getElementById('decoBatchCount');
    if (!bar) return;
    if (checked.length > 0) {
      bar.classList.remove('d-none');
      if (countEl) countEl.textContent = checked.length;
    } else {
      bar.classList.add('d-none');
    }
  }

  async function excludeTerm(mot, trEl) {
    var session = await window.bdb.auth.getSession();
    var userId = session && session.data && session.data.session
      ? session.data.session.user.id : null;

    var r = await window.bdb
      .from('glossaire_exclusions')
      .insert({ mot: mot, created_by: userId })
      .select();

    if (r.error) {
      if (r.error.code === '23505') {
        if (trEl) trEl.remove();
        bdbToast(mot + ' était déjà exclu.', 'info');
      } else {
        bdbToast('Erreur exclusion : ' + r.error.message, 'danger');
      }
      return;
    }

    if (trEl) trEl.remove();
    bdbToast(mot + ' exclu du scan.', 'info');
    updateBatchBar();
  }

  async function excludeBatch() {
    var checked = document.querySelectorAll('#decoTableBody .deco-check:checked');
    if (checked.length === 0) return;

    var session = await window.bdb.auth.getSession();
    var userId = session && session.data && session.data.session
      ? session.data.session.user.id : null;

    var rows = Array.from(checked).map(function (cb) {
      return { mot: cb.value, created_by: userId };
    });

    var r = await window.bdb
      .from('glossaire_exclusions')
      .insert(rows)
      .select();

    if (r.error) {
      bdbToast('Erreur exclusion batch : ' + r.error.message, 'danger');
      return;
    }

    checked.forEach(function (cb) {
      var tr = cb.closest('tr');
      if (tr) tr.remove();
    });

    bdbToast(rows.length + ' terme(s) exclus du scan.', 'info');
    updateBatchBar();
  }

  function copySelection() {
    var checked = document.querySelectorAll('#decoTableBody .deco-check:checked');
    if (checked.length === 0) return;

    var lines = [
      'TERMES A TRAITER (glossaire BDB) — source : ' + (_decoSource || 'inconnue'),
      '---'
    ];

    checked.forEach(function (cb) {
      var tr = cb.closest('tr');
      var freqTd = tr ? tr.querySelectorAll('td')[2] : null;
      var freq = freqTd ? freqTd.textContent.trim() : '';
      lines.push(cb.value + (freq ? ' (freq: ' + freq + ')' : ''));
    });

    var text = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        bdbToast(checked.length + ' terme(s) copié(s) dans le presse-papiers.', 'success');
      }).catch(function () {
        bdbToast('Copie impossible — vérifiez les permissions du navigateur.', 'danger');
      });
    } else {
      bdbToast('Copie non supportée par ce navigateur.', 'danger');
    }
  }

  // ─── Panier candidats ─────────────────────────────────────────────────────

  function _decoSourceKey() {
    if (_decoSource === 'Synonymes protocoles') return 'synonymes';
    if (_decoSource === 'Libellés CCAM') return 'ccam';
    if (_decoSource === 'Notes interventions') return 'notes';
    if (_decoSource === 'Bigrammes interventions') return 'bigrammes';
    return 'manuel';
  }

  function filterResults(rows) {
    if (!_candidats.length) return rows;
    return rows.filter(function (row) {
      return !_candidats.includes(String(row.mot || '').toUpperCase().trim());
    });
  }

  async function loadCandidats() {
    var r = await window.bdb.from('glossaire_candidats').select('mot');
    if (r.error) return;
    _candidats = (r.data || []).map(function (x) {
      return String(x.mot || '').toUpperCase().trim();
    });
  }

  async function loadPanier() {
    setState('panier', 'loading');
    var r = await window.bdb
      .from('glossaire_candidats')
      .select('*')
      .order('created_at', { ascending: false });

    if (r.error) {
      setState('panier', 'error');
      var errEl = document.getElementById('panierErrorMsg');
      if (errEl) errEl.textContent = r.error.message;
      return;
    }

    var data = r.data || [];
    _candidats = data.map(function (x) { return String(x.mot || '').toUpperCase().trim(); });

    var countEl = document.getElementById('panierCount');
    if (countEl) countEl.textContent = data.length;

    if (data.length === 0) { setState('panier', 'empty'); return; }

    setState('panier', 'content');
    var tbody = document.getElementById('panierTableBody');
    if (!tbody) return;

    tbody.innerHTML = data.map(function (item) {
      return '<tr>' +
        '<td class="fw-semibold font-monospace small">' + escHtml(item.mot) + '</td>' +
        '<td class="text-end small text-muted">' + escHtml(String(item.frequence || 0)) + '</td>' +
        '<td class="small text-muted">' + escHtml(item.source || '—') + '</td>' +
        '<td class="text-center">' +
          '<button class="btn btn-sm btn-outline-danger" ' +
            'data-panier-remove="' + escHtml(String(item.id)) + '" ' +
            'data-panier-mot="' + escHtml(item.mot) + '" ' +
            'title="Retirer du panier">' +
            '<i class="bi bi-x-lg"></i>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  async function retainTerm(mot, freq, trEl) {
    var motUp = String(mot).toUpperCase().trim();
    if (_candidats.includes(motUp)) {
      bdbToast(mot + ' est déjà dans le panier.', 'info');
      return;
    }

    var session = await window.bdb.auth.getSession();
    var userId = session && session.data && session.data.session
      ? session.data.session.user.id : null;

    var r = await window.bdb
      .from('glossaire_candidats')
      .insert({ mot: mot, source: _decoSourceKey(), frequence: parseInt(freq, 10) || 0, created_by: userId })
      .select();

    if (r.error) {
      bdbToast('Erreur panier : ' + r.error.message, 'danger');
      return;
    }

    if (trEl) trEl.remove();
    updateBatchBar();
    await loadPanier();
    bdbToast(mot + ' ajouté au panier.', 'success');
  }

  async function retainBatch() {
    var checked = document.querySelectorAll('#decoTableBody .deco-check:checked');
    if (checked.length === 0) return;

    var session = await window.bdb.auth.getSession();
    var userId = session && session.data && session.data.session
      ? session.data.session.user.id : null;

    var source = _decoSourceKey();
    var toInsert = Array.from(checked).filter(function (cb) {
      return !_candidats.includes(String(cb.value).toUpperCase().trim());
    });

    if (toInsert.length === 0) {
      bdbToast('Tous les termes sélectionnés sont déjà dans le panier.', 'info');
      return;
    }

    var rows = toInsert.map(function (cb) {
      var tr = cb.closest('tr');
      var freqTd = tr ? tr.querySelectorAll('td')[2] : null;
      var freq = freqTd ? parseInt(freqTd.textContent.trim(), 10) : 0;
      return { mot: cb.value, source: source, frequence: freq || 0, created_by: userId };
    });

    var r = await window.bdb.from('glossaire_candidats').insert(rows).select();

    if (r.error) {
      bdbToast('Erreur panier batch : ' + r.error.message, 'danger');
      return;
    }

    toInsert.forEach(function (cb) {
      var tr = cb.closest('tr');
      if (tr) tr.remove();
    });

    updateBatchBar();
    await loadPanier();
    bdbToast(toInsert.length + ' terme(s) ajouté(s) au panier.', 'success');
  }

  async function removeCandidatFromPanier(id, mot, trEl) {
    if (!confirm('Retirer "' + mot + '" du panier ?')) return;
    var r = await window.bdb
      .from('glossaire_candidats')
      .delete()
      .eq('id', id)
      .select();

    if (r.error) {
      bdbToast('Erreur suppression : ' + r.error.message, 'danger');
      return;
    }

    if (trEl) trEl.remove();
    var motUp = String(mot).toUpperCase().trim();
    _candidats = _candidats.filter(function (m) { return m !== motUp; });

    var tbody = document.getElementById('panierTableBody');
    var remaining = tbody ? tbody.querySelectorAll('tr').length : 0;
    var countEl = document.getElementById('panierCount');
    if (countEl) countEl.textContent = remaining;
    if (remaining === 0) setState('panier', 'empty');
    bdbToast(mot + ' retiré du panier.', 'info');
  }

  async function viderPanier() {
    var r = await window.bdb
      .from('glossaire_candidats')
      .delete() // UX06 : caller confirms
      .not('id', 'is', null)
      .select();

    var modal = document.getElementById('modalViderPanier');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();

    if (r.error) {
      bdbToast('Erreur : ' + r.error.message, 'danger');
      return;
    }

    _candidats = [];
    bdbToast('Panier vidé.', 'info');
    await loadPanier();
  }

  async function exporterPourPrompt() {
    var r = await window.bdb
      .from('glossaire_candidats')
      .select('*')
      .order('created_at');

    if (r.error) { bdbToast('Erreur export : ' + r.error.message, 'danger'); return; }

    var data = r.data || [];
    if (data.length === 0) { bdbToast('Panier vide.', 'info'); return; }

    var sep = '='.repeat(48);
    var lines = [
      'CANDIDATS GLOSSAIRE BDB — ' + data.length + ' terme(s) a creer',
      sep,
      ''
    ];

    data.forEach(function (item, i) {
      lines.push((i + 1) + '. ' + item.mot +
        ' (freq: ' + (item.frequence || 0) +
        ', source: ' + (item.source || '?') + ')');
    });

    lines.push('');
    lines.push('Prompt : Pour chacun des termes ci-dessus, propose une definition medicale concise (1-2 phrases) adaptee au bloc operatoire ortho-neurochirurgical, avec categorie (ABREVIATION/ANATOMIE/EPONYME/MATERIEL/PATHOLOGIE/TECHNIQUE/CONVENTION) et variantes eventuelles separees par |.');

    var text = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        bdbToast(data.length + ' terme(s) exportes dans le presse-papiers.', 'success');
      }).catch(function () {
        bdbToast('Copie impossible — verifiez les permissions du navigateur.', 'danger');
      });
    } else {
      bdbToast('Copie non supportee par ce navigateur.', 'danger');
    }
  }

  async function showDecoMatch(term) {
    var panel = document.getElementById('decoMatchPanel');
    var termEl = document.getElementById('decoMatchTerm');
    var loadingEl = document.getElementById('decoMatchLoading');
    var contentEl = document.getElementById('decoMatchContent');
    var listEl = document.getElementById('decoMatchList');
    if (!panel) return;

    panel.classList.remove('d-none');
    if (termEl) termEl.textContent = term;
    if (loadingEl) loadingEl.classList.remove('d-none');
    if (contentEl) contentEl.classList.add('d-none');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    var r = await window.bdb.rpc('glossaire_match_notes', { p_term: term });

    if (loadingEl) loadingEl.classList.add('d-none');
    if (contentEl) contentEl.classList.remove('d-none');
    if (!listEl) return;

    if (r.error) {
      listEl.innerHTML = '<p class="text-danger small p-3">' + escHtml(r.error.message) + '</p>';
      return;
    }

    var data = r.data || [];
    if (data.length === 0) {
      listEl.innerHTML = '<p class="text-muted small p-3">Aucune note trouvée pour ce terme.</p>';
      return;
    }

    listEl.innerHTML = data.map(function (item) {
      var notes = item.sample_notes
        ? item.sample_notes.split('|||').map(function (n) {
            return '<p class="glos-sample-note small text-muted mb-1">' + escHtml(n.trim()) + '</p>';
          }).join('')
        : '';
      return '<div class="border-bottom px-3 py-2">' +
        '<p class="small fw-semibold mb-1">' + escHtml(item.protocole_titre || '—') + '</p>' +
        notes +
      '</div>';
    }).join('');
  }

  function initFaceB() {
    // Boutons de scan — 4 sources
    var btnSynonymes = document.getElementById('decoBtnSynonymes');
    var btnCCAM = document.getElementById('decoBtnCCAM');
    var btnNotes = document.getElementById('decoBtnNotes');
    var btnBigrammes = document.getElementById('decoBtnBigrammes');

    if (btnSynonymes) btnSynonymes.addEventListener('click', runScanSynonymes);
    if (btnCCAM)      btnCCAM.addEventListener('click', runScanCCAM);
    if (btnNotes)     btnNotes.addEventListener('click', runScanNotes);
    if (btnBigrammes) btnBigrammes.addEventListener('click', runScanBigrammes);

    // Fermer le panneau de match
    var closeBtn = document.getElementById('decoBtnCloseMatch');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var panel = document.getElementById('decoMatchPanel');
        if (panel) panel.classList.add('d-none');
      });
    }

    // Délégation sur decoContent — match, create, retain, exclude
    var decoContent = document.getElementById('decoContent');
    if (decoContent) {
      decoContent.addEventListener('click', function (e) {
        var matchBtn   = e.target.closest('[data-deco-match]');
        var createBtn  = e.target.closest('[data-deco-create]');
        var retainBtn  = e.target.closest('[data-deco-retain]');
        var excludeBtn = e.target.closest('[data-deco-exclude]');
        if (matchBtn) {
          showDecoMatch(matchBtn.getAttribute('data-deco-match'));
        } else if (createBtn) {
          var term = createBtn.getAttribute('data-deco-create');
          _prefillAfterAdminInit = term;
          var adminBtn = document.getElementById('tab-admin-glos-btn');
          if (adminBtn) adminBtn.click();
        } else if (retainBtn) {
          var mot = retainBtn.getAttribute('data-deco-retain');
          var freq = retainBtn.getAttribute('data-deco-freq');
          var tr = retainBtn.closest('tr');
          retainTerm(mot, freq, tr);
        } else if (excludeBtn) {
          var mot2 = excludeBtn.getAttribute('data-deco-exclude');
          var tr2 = excludeBtn.closest('tr');
          excludeTerm(mot2, tr2);
        }
      });

      // Délégation checkbox — mise à jour barre batch
      decoContent.addEventListener('change', function (e) {
        if (e.target.classList.contains('deco-check')) {
          updateBatchBar();
        }
      });
    }

    // Délégation panier — retirer un terme
    var panierContent = document.getElementById('panierContent');
    if (panierContent) {
      panierContent.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('[data-panier-remove]');
        if (removeBtn) {
          var id = removeBtn.getAttribute('data-panier-remove');
          var mot = removeBtn.getAttribute('data-panier-mot');
          var tr = removeBtn.closest('tr');
          removeCandidatFromPanier(id, mot, tr);
        }
      });
    }

    // Barre batch — tout cocher
    var btnCheckAll = document.getElementById('decoBtnCheckAll');
    if (btnCheckAll) {
      btnCheckAll.addEventListener('click', function () {
        document.querySelectorAll('#decoTableBody .deco-check').forEach(function (cb) {
          cb.checked = true;
        });
        updateBatchBar();
      });
    }

    // Barre batch — tout décocher
    var btnUncheckAll = document.getElementById('decoBtnUncheckAll');
    if (btnUncheckAll) {
      btnUncheckAll.addEventListener('click', function () {
        document.querySelectorAll('#decoTableBody .deco-check').forEach(function (cb) {
          cb.checked = false;
        });
        updateBatchBar();
      });
    }

    // Barre batch — copier sélection
    var btnCopy = document.getElementById('decoBtnCopySelection');
    if (btnCopy) btnCopy.addEventListener('click', copySelection);

    // Barre batch — exclure sélection
    var btnExcludeBatch = document.getElementById('decoBtnExcludeBatch');
    if (btnExcludeBatch) btnExcludeBatch.addEventListener('click', excludeBatch);

    // Barre batch — retenir sélection
    var btnRetainBatch = document.getElementById('decoBtnRetainBatch');
    if (btnRetainBatch) btnRetainBatch.addEventListener('click', retainBatch);

    // Panier — exporter pour prompt
    var btnExporter = document.getElementById('decoBtnExporter');
    if (btnExporter) btnExporter.addEventListener('click', exporterPourPrompt);

    // Panier — vider (ouvre la modale de confirmation)
    var btnVider = document.getElementById('decoBtnViderPanier');
    if (btnVider) {
      btnVider.addEventListener('click', function () {
        var modal = document.getElementById('modalViderPanier');
        if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
      });
    }

    // Panier — confirmer vider
    var btnViderConfirm = document.getElementById('viderPanierBtnConfirm');
    if (btnViderConfirm) btnViderConfirm.addEventListener('click', viderPanier);

    // Chargement initial du panier
    loadCandidats();
    loadPanier();
  }

  // ─── FACE C — CRUD Gestion ────────────────────────────────────────────────

  function openEditModal(entry, prefillTerm) {
    var modal = document.getElementById('modalGlosEdit');
    if (!modal) return;

    var idEl = document.getElementById('editGlosId');
    var termEl = document.getElementById('editGlosTerm');
    var catEl = document.getElementById('editGlosCategorie');
    var defEl = document.getElementById('editGlosDef');
    var notesEl = document.getElementById('editGlosNotes');
    var varEl = document.getElementById('editGlosVariantes');
    var delBtn = document.getElementById('editGlosBtnDelete');
    var titleEl = document.getElementById('modalGlosEditLabel');

    if (entry) {
      _editId = entry.id;
      if (idEl) idEl.value = entry.id;
      if (termEl) termEl.value = entry.abbreviation || '';
      if (catEl) catEl.value = entry.categorie || '';
      if (defEl) defEl.value = entry.definition || '';
      if (notesEl) notesEl.value = entry.usage_notes || '';
      if (varEl) varEl.value = entry.variantes || '';
      if (delBtn) delBtn.classList.remove('d-none');
      if (titleEl) titleEl.textContent = 'Modifier une entrée';
    } else {
      _editId = null;
      if (idEl) idEl.value = '';
      if (termEl) termEl.value = prefillTerm || '';
      if (catEl) catEl.value = '';
      if (defEl) defEl.value = '';
      if (notesEl) notesEl.value = '';
      if (varEl) varEl.value = '';
      if (delBtn) delBtn.classList.add('d-none');
      if (titleEl) titleEl.textContent = 'Nouvelle entrée';
    }

    bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  async function saveEntry() {
    var term = (document.getElementById('editGlosTerm') || {}).value || '';
    var cat = (document.getElementById('editGlosCategorie') || {}).value || '';
    var def = (document.getElementById('editGlosDef') || {}).value || '';
    var notes = (document.getElementById('editGlosNotes') || {}).value || '';
    var variantes = (document.getElementById('editGlosVariantes') || {}).value || '';

    if (!term.trim() || !def.trim()) {
      bdbToast('Terme et définition sont obligatoires.', 'danger');
      return;
    }

    var payload = {
      abbreviation: term.trim(),
      definition: def.trim(),
      categorie: cat || null,
      usage_notes: notes.trim() || null,
      variantes: variantes.trim() || null
    };

    var r;
    if (_editId) {
      r = await window.bdb.from('glossaire').update(payload).eq('id', _editId).select();
    } else {
      r = await window.bdb.from('glossaire').insert(payload).select();
    }

    if (r.error) { bdbToast('Erreur : ' + r.error.message, 'danger'); return; }

    var modal = document.getElementById('modalGlosEdit');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();

    bdbToast(_editId ? 'Entrée modifiée.' : 'Entrée créée.', 'success');
    purgeCache();
    await loadEntries();
    renderAdminTable();
    renderAlphaIndex();
    _filteredEntries = _entries;
    renderCards(_entries);
  }

  function confirmDelete(id, term) {
    _deleteId = id;
    var termEl = document.getElementById('deleteGlosTerm');
    if (termEl) termEl.textContent = term;
    var editModal = document.getElementById('modalGlosEdit');
    if (editModal) bootstrap.Modal.getOrCreateInstance(editModal).hide();
    setTimeout(function () {
      var delModal = document.getElementById('modalGlosDelete');
      if (delModal) bootstrap.Modal.getOrCreateInstance(delModal).show();
    }, 200);
  }

  async function deleteEntry() {
    if (!_deleteId) return;
    var r = await window.bdb.from('glossaire').delete().eq('id', _deleteId).select();

    var delModal = document.getElementById('modalGlosDelete');
    if (delModal) bootstrap.Modal.getOrCreateInstance(delModal).hide();

    if (r.error) { bdbToast('Erreur : ' + r.error.message, 'danger'); return; }

    bdbToast('Entrée supprimée.', 'success');
    _deleteId = null;
    purgeCache();
    await loadEntries();
    renderAdminTable();
    renderAlphaIndex();
    _filteredEntries = _entries;
    renderCards(_entries);
  }

  function renderAdminTable() {
    var tbody = document.getElementById('adminGlosTableBody');
    var countEl = document.getElementById('adminGlosCount');
    if (!tbody) return;
    if (countEl) countEl.textContent = _entries.length;

    if (_entries.length === 0) { setState('adminGlos', 'empty'); return; }

    setState('adminGlos', 'content');

    // Tri admin
    var sorted = _entries.slice().sort(function (a, b) {
      var col = _adminSort.col;
      var valA, valB;
      if (col === 'is_propagated') {
        valA = a.is_propagated ? 1 : 0;
        valB = b.is_propagated ? 1 : 0;
      } else {
        valA = normalizeText(a[col] || '');
        valB = normalizeText(b[col] || '');
      }
      if (valA < valB) return _adminSort.asc ? -1 : 1;
      if (valA > valB) return _adminSort.asc ? 1 : -1;
      return 0;
    });

    // Pagination admin (INTERDIT-TABLE-SCROLL — 567+ entrees)
    var total = sorted.length;
    var totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
    if (_currentAdminPage > totalPages) _currentAdminPage = totalPages;
    var start = (_currentAdminPage - 1) * ADMIN_PAGE_SIZE;
    var pageEntries = sorted.slice(start, start + ADMIN_PAGE_SIZE);

    tbody.innerHTML = pageEntries.map(function (e) {
      return '<tr>' +
        '<td class="fw-semibold font-monospace">' + escHtml(e.abbreviation) + '</td>' +
        '<td><span class="glos-def-truncate">' + escHtml(e.definition) + '</span></td>' +
        '<td>' + (e.categorie ? '<span class="badge ' + catBadge(e.categorie) + '">' + escHtml(e.categorie) + '</span>' : '<span class="text-muted">—</span>') + '</td>' +
        '<td><small class="text-muted font-monospace">' + escHtml(e.variantes || '—') + '</small></td>' +
        '<td class="text-center">' +
          (e.is_propagated
            ? '<i class="bi bi-check-circle-fill text-success"></i>'
            : '<i class="bi bi-dash-circle text-muted"></i>') +
        '</td>' +
        '<td class="text-center">' +
          '<a class="app-icon-btn" data-admin-edit="' + escHtml(String(e.id)) + '" title="Modifier" role="button">' +
            '<i class="bi bi-pencil"></i>' +
          '</a>' +
        '</td>' +
      '</tr>';
    }).join('');

    renderAdminPagination(total, totalPages);
  }

  function renderAdminPagination(total, totalPages) {
    var paginEl = document.getElementById('adminGlosPagination');
    var labelEl = document.getElementById('adminGlosPagLabel');
    if (!paginEl) return;

    if (labelEl) {
      if (total === 0) {
        labelEl.textContent = '';
      } else {
        var start = (_currentAdminPage - 1) * ADMIN_PAGE_SIZE + 1;
        var end = Math.min(_currentAdminPage * ADMIN_PAGE_SIZE, total);
        labelEl.textContent = start + '-' + end + ' sur ' + total + ' entrées';
      }
    }

    if (totalPages <= 1) {
      paginEl.innerHTML = '';
      return;
    }

    var html = '';
    html += '<button class="app-page-btn" data-admin-page="' + (_currentAdminPage - 1) + '"' +
      (_currentAdminPage <= 1 ? ' disabled' : '') +
      ' aria-label="Page précédente"><i class="bi bi-chevron-left"></i></button>';

    var pages = buildPageList(_currentAdminPage, totalPages);
    pages.forEach(function (p) {
      if (p === '...') {
        html += '<span class="glos-pag-ellipsis">…</span>';
      } else {
        html += '<button class="app-page-btn' + (p === _currentAdminPage ? ' active' : '') + '" data-admin-page="' + p + '">' + p + '</button>';
      }
    });

    html += '<button class="app-page-btn" data-admin-page="' + (_currentAdminPage + 1) + '"' +
      (_currentAdminPage >= totalPages ? ' disabled' : '') +
      ' aria-label="Page suivante"><i class="bi bi-chevron-right"></i></button>';

    paginEl.innerHTML = html;

    // Listener pagination admin (une seule fois)
    if (!_adminPagListenerAdded) {
      var wrapper = document.getElementById('adminGlosPaginationWrapper');
      if (wrapper) {
        wrapper.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-admin-page]');
          if (!btn || btn.disabled) return;
          var page = parseInt(btn.getAttribute('data-admin-page'), 10);
          if (page >= 1) {
            _currentAdminPage = page;
            renderAdminTable();
            var tableEl = document.getElementById('adminGlosTableBody');
            if (tableEl) tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
        _adminPagListenerAdded = true;
      }
    }
  }

  function initAdminSort() {
    var headers = document.querySelectorAll('#tab-admin-glos .glos-sort-header');
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        var col = th.getAttribute('data-sort-col');
        if (_adminSort.col === col) {
          _adminSort.asc = !_adminSort.asc;
        } else {
          _adminSort.col = col;
          _adminSort.asc = true;
        }
        // Update arrows
        headers.forEach(function (h) {
          h.classList.remove('active');
          var arrow = h.querySelector('.glos-sort-arrow');
          if (arrow) arrow.className = 'glos-sort-arrow bi bi-caret-up-fill';
        });
        th.classList.add('active');
        var arrow = th.querySelector('.glos-sort-arrow');
        if (arrow) arrow.className = 'glos-sort-arrow bi ' + (_adminSort.asc ? 'bi-caret-up-fill' : 'bi-caret-down-fill');

        // Reset pagination quand on change de tri
        _currentAdminPage = 1;
        renderAdminTable();
      });
    });
  }

  async function initFaceGestion() {
    setState('adminGlos', 'loading');
    try {
      await loadEntries();
      renderAdminTable();
    } catch (err) {
      setState('adminGlos', 'error');
      var errEl = document.getElementById('adminGlosErrorMsg');
      if (errEl) errEl.textContent = err.message;
    }
  }

  // ─── FACE C — Suggestions review ─────────────────────────────────────────

  async function updateSuggBadge() {
    var r = await window.bdb
      .from('glossaire_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    var n = r.count || 0;
    [document.getElementById('glossSuggBadge'), document.getElementById('pillSuggBadge')]
      .forEach(function (b) {
        if (!b) return;
        b.textContent = n;
        b.classList.toggle('d-none', n === 0);
      });
  }

  async function loadSuggestions() {
    setState('sugg', 'loading');
    var r = await window.bdb
      .from('glossaire_suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at');

    if (r.error) {
      setState('sugg', 'error');
      var errEl = document.getElementById('suggErrorMsg');
      if (errEl) errEl.textContent = r.error.message;
      return;
    }

    _pendingSugg = r.data || [];
    if (_pendingSugg.length === 0) { setState('sugg', 'empty'); return; }

    setState('sugg', 'content');
    var list = document.getElementById('suggList');
    if (!list) return;

    list.innerHTML = _pendingSugg.map(function (s) {
      return '<div class="bdb-card mb-2">' +
        '<div class="card-body py-2">' +
          '<div class="d-flex justify-content-between align-items-start gap-2">' +
            '<div>' +
              '<span class="fw-bold font-monospace">' + escHtml(s.proposed_term) + '</span>' +
              '<p class="small text-muted mb-0">' + escHtml(s.proposed_def) + '</p>' +
              (s.proposed_notes ? '<p class="small text-muted fst-italic mb-0">' + escHtml(s.proposed_notes) + '</p>' : '') +
            '</div>' +
            '<div class="d-flex gap-1 flex-shrink-0">' +
              '<button class="btn btn-sm btn-module" data-sugg-approve="' + escHtml(String(s.id)) + '">' +
                '<i class="bi bi-check-lg me-1"></i>Approuver' +
              '</button>' +
              '<button class="btn btn-sm btn-outline-secondary" data-sugg-reject="' + escHtml(String(s.id)) + '">' +
                '<i class="bi bi-x-lg me-1"></i>Rejeter' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  async function approveSuggestion(id, sugg) {
    if (!sugg) return;

    var r1 = await window.bdb.from('glossaire').insert({
      abbreviation: sugg.proposed_term,
      definition: sugg.proposed_def,
      usage_notes: sugg.proposed_notes || null
    }).select();

    if (r1.error) { bdbToast('Erreur insertion : ' + r1.error.message, 'danger'); return; }

    var r2 = await window.bdb
      .from('glossaire_suggestions')
      .update({ status: 'approved' })
      .eq('id', id)
      .select();

    if (r2.error) { bdbToast('Erreur statut : ' + r2.error.message, 'danger'); return; }

    bdbToast('Suggestion approuvée — entrée créée.', 'success');
    purgeCache();
    await loadEntries();
    renderAdminTable();
    renderAlphaIndex();
    _filteredEntries = _entries;
    renderCards(_entries);
    loadSuggestions();
    updateSuggBadge();
  }

  function openRejectModal(id) {
    var modal = document.getElementById('modalRejectSugg');
    var idEl = document.getElementById('rejectSuggId');
    var noteEl = document.getElementById('rejectNote');
    if (!modal) return;
    if (idEl) idEl.value = id;
    if (noteEl) noteEl.value = '';
    bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  async function rejectSuggestion() {
    var idEl = document.getElementById('rejectSuggId');
    var noteEl = document.getElementById('rejectNote');
    var id = idEl ? idEl.value : null;
    var note = noteEl ? noteEl.value.trim() : '';
    if (!id) return;

    var r = await window.bdb
      .from('glossaire_suggestions')
      .update({ status: 'rejected', admin_note: note || null })
      .eq('id', id)
      .select();

    var modal = document.getElementById('modalRejectSugg');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).hide();

    if (r.error) { bdbToast('Erreur : ' + r.error.message, 'danger'); return; }

    bdbToast('Suggestion rejetée.', 'info');
    loadSuggestions();
    updateSuggBadge();
  }

  function initFaceSuggestions() {
    loadSuggestions();
    var rejectBtn = document.getElementById('rejectSuggBtnConfirm');
    if (rejectBtn) rejectBtn.addEventListener('click', rejectSuggestion);
  }

  // ─── FACE C — Propagation ─────────────────────────────────────────────────

  async function loadPropagation() {
    setState('prop', 'loading');
    try {
      if (_entries.length === 0) await loadEntries();
    } catch (err) {
      setState('prop', 'error');
      var errEl = document.getElementById('propErrorMsg');
      if (errEl) errEl.textContent = err.message;
      return;
    }

    var toProp = _entries.filter(function (e) { return !e.is_propagated; });
    var done = _entries.filter(function (e) { return e.is_propagated; });

    if (toProp.length === 0 && done.length === 0) { setState('prop', 'empty'); return; }

    setState('prop', 'content');

    var listA = document.getElementById('propListAPropager');
    var listD = document.getElementById('propListDejas');

    if (listA) {
      listA.innerHTML = toProp.length === 0
        ? '<p class="text-muted small">Aucune entrée à propager.</p>'
        : toProp.map(function (e) {
            return '<div class="bdb-card mb-2">' +
              '<div class="card-body py-2 d-flex justify-content-between align-items-center gap-2">' +
                '<div>' +
                  '<span class="fw-bold font-monospace">' + escHtml(e.abbreviation) + '</span>' +
                  (e.categorie ? ' <span class="badge ' + catBadge(e.categorie) + ' ms-1">' + escHtml(e.categorie) + '</span>' : '') +
                '</div>' +
                '<div class="d-flex gap-1 flex-shrink-0">' +
                  '<button class="btn btn-sm btn-outline-secondary" data-prop-preview="' + escHtml(String(e.id)) + '" data-prop-term="' + escHtml(e.abbreviation) + '">' +
                    '<i class="bi bi-eye me-1"></i>Prévisualiser' +
                  '</button>' +
                  '<button class="btn btn-sm btn-module" data-prop-go="' + escHtml(String(e.id)) + '">' +
                    '<i class="bi bi-diagram-2 me-1"></i>Propager' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="d-none px-3 pb-2" id="propPreview-' + escHtml(String(e.id)) + '"></div>' +
            '</div>';
          }).join('');
    }

    if (listD) {
      listD.innerHTML = done.length === 0
        ? '<p class="text-muted small">Aucune entrée propagée.</p>'
        : '<ul class="list-group list-group-flush">' +
            done.map(function (e) {
              return '<li class="list-group-item py-1 small">' +
                '<i class="bi bi-check-circle-fill text-success me-2"></i>' +
                '<span class="fw-semibold font-monospace">' + escHtml(e.abbreviation) + '</span>' +
              '</li>';
            }).join('') +
          '</ul>';
    }
  }

  async function previewPropagation(id, term) {
    var el = document.getElementById('propPreview-' + id);
    if (!el) return;
    el.classList.remove('d-none');
    el.innerHTML = '<small class="text-muted"><span class="spinner-border spinner-border-sm me-1" role="status"></span>Calcul en cours…</small>';

    var r = await window.bdb.rpc('glossaire_match_notes', { p_term: term });
    if (r.error) {
      el.innerHTML = '<small class="text-danger">' + escHtml(r.error.message) + '</small>';
      return;
    }
    var count = (r.data || []).length;
    el.innerHTML = '<small class="text-muted"><i class="bi bi-diagram-2 me-1"></i>' + count + ' protocole(s) seraient enrichis.</small>';
  }

  async function doPropagation(id) {
    var entry = _entries.find(function (e) { return String(e.id) === id; });
    var r = await window.bdb.rpc('glossaire_propagate', { p_glossaire_id: id });

    if (r.error) { bdbToast('Erreur propagation : ' + r.error.message, 'danger'); return; }

    bdbToast((entry ? entry.abbreviation : 'Entrée') + ' propagée dans les protocoles.', 'success');
    purgeCache();
    await loadEntries();
    loadPropagation();
  }

  // ─── Init global ─────────────────────────────────────────────────────────

  function init(isAdmin) {
    _isAdmin = isAdmin;

    if (isAdmin) {
      document.querySelectorAll('.bdb-admin-only').forEach(function (el) {
        el.classList.remove('d-none');
      });
    }

    // Face A — chargement immédiat
    initFaceA();

    // Face D — lazy sur onglet Proposer
    var tabProposerBtn = document.getElementById('tab-proposer-btn');
    var propTabInited = false;
    if (tabProposerBtn) {
      tabProposerBtn.addEventListener('shown.bs.tab', function () {
        if (!propTabInited) { propTabInited = true; initFaceD(); }
      });
    }

    if (!isAdmin) return;

    // Face B — Découverte
    initFaceB();

    // Tri colonnes admin
    initAdminSort();

    // Délégation stable — Admin pills content
    var adminGlosContent = document.getElementById('adminGlosContent');
    if (adminGlosContent) {
      adminGlosContent.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-admin-edit]');
        if (btn) {
          var id = btn.getAttribute('data-admin-edit');
          var entry = _entries.find(function (x) { return String(x.id) === id; });
          if (entry) openEditModal(entry, null);
        }
      });
    }

    var suggContent = document.getElementById('suggContent');
    if (suggContent) {
      suggContent.addEventListener('click', function (e) {
        var approveBtn = e.target.closest('[data-sugg-approve]');
        var rejectBtn = e.target.closest('[data-sugg-reject]');
        if (approveBtn) {
          var id = approveBtn.getAttribute('data-sugg-approve');
          var sugg = _pendingSugg.find(function (s) { return String(s.id) === id; });
          if (sugg) approveSuggestion(id, sugg);
        } else if (rejectBtn) {
          openRejectModal(rejectBtn.getAttribute('data-sugg-reject'));
        }
      });
    }

    var propContent = document.getElementById('propContent');
    if (propContent) {
      propContent.addEventListener('click', function (e) {
        var prevBtn = e.target.closest('[data-prop-preview]');
        var goBtn = e.target.closest('[data-prop-go]');
        if (prevBtn) {
          previewPropagation(prevBtn.getAttribute('data-prop-preview'), prevBtn.getAttribute('data-prop-term'));
        } else if (goBtn) {
          doPropagation(goBtn.getAttribute('data-prop-go'));
        }
      });
    }

    // Modals — événements
    var saveBtn = document.getElementById('editGlosBtnSave');
    if (saveBtn) saveBtn.addEventListener('click', saveEntry);

    var deleteInModalBtn = document.getElementById('editGlosBtnDelete');
    if (deleteInModalBtn) {
      deleteInModalBtn.addEventListener('click', function () {
        if (!_editId) return;
        var termEl = document.getElementById('editGlosTerm');
        confirmDelete(_editId, termEl ? termEl.value : '');
      });
    }

    var confirmDelBtn = document.getElementById('deleteGlosBtnConfirm');
    if (confirmDelBtn) confirmDelBtn.addEventListener('click', deleteEntry);

    // Admin tab — lazy init gestion + badge
    var tabAdminBtn = document.getElementById('tab-admin-glos-btn');
    if (tabAdminBtn) {
      tabAdminBtn.addEventListener('shown.bs.tab', function () {
        if (!_adminGlosInited) {
          _adminGlosInited = true;
          initFaceGestion();
        }
        if (_prefillAfterAdminInit) {
          var t = _prefillAfterAdminInit;
          _prefillAfterAdminInit = null;
          setTimeout(function () { openEditModal(null, t); }, 150);
        }
        updateSuggBadge();
      });
    }

    // Pill Suggestions — lazy init
    var pillSuggBtn = document.getElementById('pill-suggestions-btn');
    if (pillSuggBtn) {
      pillSuggBtn.addEventListener('shown.bs.tab', function () {
        if (!_suggInited) {
          _suggInited = true;
          initFaceSuggestions();
        } else {
          loadSuggestions();
        }
      });
    }

    // Pill Propagation — rechargement à chaque affichage
    var pillPropBtn = document.getElementById('pill-propagation-btn');
    if (pillPropBtn) {
      pillPropBtn.addEventListener('shown.bs.tab', function () {
        loadPropagation();
      });
    }

    // CTA global "Ajouter un terme" — bascule selon role
    //   admin     : ouvre modalGlosEdit (creation directe publié)
    //   non-admin : ouvre modalProposerTerme (proposition workflow draft)
    var adminBtnNew = document.getElementById('adminBtnNew');
    if (adminBtnNew) {
      adminBtnNew.addEventListener('click', function () {
        if (window.bdbUser && window.bdbUser.isAdmin) {
          openEditModal(null, null);
        } else {
          var modalEl = document.getElementById('modalProposerTerme');
          if (modalEl && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(modalEl).show();
          }
        }
      });
    }

    // Badge initial
    updateSuggBadge();
  }

  return { init: init };

})();

document.addEventListener('DOMContentLoaded', async function () {
  await window.bdbShellReady;
  GlossApp.init(window.bdbUser.isAdmin);
});

// Recherche globale BDB (optionnel — si conteneur présent)
if (document.getElementById('searchContainer')) {
  BdbSearch.init({ container: '#searchContainer', showBar: false });
}
