// =====================================================
// PLANNING CONTROLLER v4.0.0
// V4 : bdbShellReady + PlanningMembers.init() async
//      3 états DOM (loading / error / content)
//      Zéro console.error → toast CDS
//      Inline JS absorbé (modalCloseSalles show.bs.modal)
// =====================================================

(function () {
  'use strict';

  // ─────────────────────────────────────────────────
  // SECTION 1 — UTILITAIRES DE BASE
  // ─────────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }


  function toast(msg) {
    const el = $('toastInfo');
    if (!el) return;
    const body = el.querySelector('.toast-body');
    if (body) body.textContent = String(msg ?? '');
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  // ─────────────────────────────────────────────────
  // SECTION 2 — ÉTATS ASYNC DOM
  // ─────────────────────────────────────────────────

  function showLoading() {
    $('planLoading')?.classList.remove('d-none');
    $('planError')?.classList.add('d-none');
    $('planContent')?.classList.add('d-none');
  }

  function showError(msg) {
    $('planLoading')?.classList.add('d-none');
    const errEl = $('planError');
    if (errEl) {
      errEl.classList.remove('d-none');
      const msgEl = $('planErrorMsg');
      if (msgEl) msgEl.textContent = String(msg || 'Le chargement n\'a pu aboutir — réessayez dans un instant.');
    }
    $('planContent')?.classList.add('d-none');
  }

  function showContent() {
    $('planLoading')?.classList.add('d-none');
    $('planError')?.classList.add('d-none');
    $('planContent')?.classList.remove('d-none');
  }

  // ─────────────────────────────────────────────────
  // SECTION 3 — GESTION TEMPORELLE
  // ─────────────────────────────────────────────────

  const MONTHS_FR = [
    'janvier','février','mars','avril','mai','juin',
    'juillet','août','septembre','octobre','novembre','décembre'
  ];

  function pad2(n) { const x = Number(n); return x < 10 ? '0' + x : String(x); }

  function formatDateFR(d) {
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function getISOWeekMonday(week, year) {
    const w = Number(week), y = Number(year);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const day  = jan4.getUTCDay() || 7;
    const mon1 = new Date(jan4);
    mon1.setUTCDate(jan4.getUTCDate() - (day - 1));
    const monday = new Date(mon1);
    monday.setUTCDate(mon1.getUTCDate() + (w - 1) * 7);
    return new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
  }

  function computeWeekDates(semaine, annee) {
    const mon = getISOWeekMonday(semaine, annee);
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
    });
    return { monday: mon, days, friday: days[4] };
  }

  function setWeekContext(semaine, annee) {
    const el = $('weekContext');
    if (!el) return;
    if (!semaine || !annee) { el.textContent = ''; return; }
    const { monday, friday } = computeWeekDates(semaine, annee);
    el.textContent = 'Semaine ' + semaine + ' — ' + MONTHS_FR[monday.getMonth()] + ' ' + annee +
      ' — ' + formatDateFR(monday) + ' → ' + formatDateFR(friday);
  }

  // ─────────────────────────────────────────────────
  // SECTION 4 — RÉFÉRENTIELS
  // ─────────────────────────────────────────────────

  const FALLBACK_SALLES = ['05','06','07','08'];

  function getStrictSalles() {
    const s = PlanningSchema?.SALLES;
    return Array.isArray(s) && s.length
      ? s.map(v => PlanningSchema.normalizeSalle(v))
      : FALLBACK_SALLES;
  }

  function getStrictChirurgiens() { return PlanningMembers.getMedecins(true); }
  function getStrictIDEs()        { return PlanningMembers.getIDEs(true); }

  function getWeekAffectations() {
    const w = PlanningEngine?.getCurrentWeek?.();
    return Array.isArray(w?.affectations) ? w.affectations : [];
  }

  function isSameSlot(a, jour, creneau) {
    return String(a?.jour    || '') === String(jour    || '') &&
           String(a?.creneau || '') === String(creneau || '');
  }

  // ─────────────────────────────────────────────────
  // SECTION 5 — summarizeCell (matrix + table)
  // ─────────────────────────────────────────────────

  function summarizeCell(list, { isCouloir = false } = {}) {
    if (!Array.isArray(list) || list.length === 0) return '';

    function atomDiv(code, flags = {}) {
      const d     = PlanningMembers.display(code);
      const known = PlanningMembers.isKnown(code);
      const name  = known
        ? escHtml(d)
        : '<span class="text-danger fw-semibold">' + escHtml(d) + '</span>';
      let cls = 'small rounded-1 px-1';
      if      (flags.ouverture && flags.visceral) cls += ' bg-success-subtle border border-warning';
      else if (flags.ouverture && flags.nuit)     cls += ' bg-success-subtle border border-info';
      else if (flags.ouverture)  cls += ' bg-success-subtle';
      else if (flags.doublure)   cls += ' bg-warning-subtle';
      else if (flags.visceral)   cls += ' bg-warning-subtle text-warning-emphasis';
      else if (flags.nuit)       cls += ' bg-info-subtle';
      else if (flags.etudiant)   cls += ' plan-bg-etudiant';
      else                       cls  = 'small';
      return '<div class="' + cls + '">' + name + '</div>';
    }

    if (isCouloir) {
      return list
        .filter(a => String(a.ide || '').trim())
        .map(a => atomDiv(String(a.ide).trim(), {
          ouverture: Number(a.ouverture) === 1,
          doublure:  Number(a.doublure)  === 1,
          visceral:  Number(a.visceral)  === 1,
          nuit:      Number(a.nuit)      === 1,
          etudiant:  a.role === 'ETUDIANT'
        })).join('');
    }

    const chirCode = Array.from(new Set(
      list.map(x => String(x.chirurgien || '').trim()).filter(Boolean)
    ))[0] || '';

    let html = '';
    if (chirCode) {
      const d   = PlanningMembers.display(chirCode);
      const cls = PlanningMembers.isKnown(chirCode) ? 'fw-semibold small' : 'fw-semibold small text-danger';
      html += '<div class="' + cls + '">' + escHtml(d) + '</div>';
    }

    for (const a of list) {
      const ide = String(a.ide || '').trim();
      if (!ide) continue;
      html += atomDiv(ide, {
        ouverture: Number(a.ouverture) === 1,
        doublure:  Number(a.doublure)  === 1,
        visceral:  Number(a.visceral)  === 1,
        nuit:      Number(a.nuit)      === 1,
        etudiant:  a.role === 'ETUDIANT'
      });
    }
    return html;
  }

  // ─────────────────────────────────────────────────
  // SECTION 6 — RENDU MATRICE
  // ─────────────────────────────────────────────────

  function renderMatrixGrid(semaine, annee) {
    const host = $('matrixGrid');
    if (!host) return;

    PlanningMatrix.render({
      container:    host,
      affectations: getWeekAffectations(),
      semaine,
      annee,
      salles: getStrictSalles(),
      onCellClick: ({ jour, creneau, secteur, salle }) => {
        PlanningSlotEditor.openTerrainModalForSlot({
          jour, creneau, secteur,
          salle: salle !== '' ? PlanningSchema.normalizeSalle(salle) : ''
        });
      }
    });
  }

  // ─────────────────────────────────────────────────
  // SECTION 7 — WARNINGS & STATUT
  // ─────────────────────────────────────────────────

  function renderWarnings(warnings) {
    const ul = $('weekWarnings');
    if (!ul) return;
    ul.innerHTML = '';

    const statut  = PlanningEngine.getWeekStatut();
    const badgeEl = $('weekStatutBadge');
    if (badgeEl) {
      badgeEl.className  = statut === 'COMPLETE' ? 'badge bg-success' : 'badge bg-secondary';
      badgeEl.textContent = statut === 'COMPLETE' ? 'Complète' : 'En cours';
    }

    if (!warnings?.length) {
      ul.innerHTML = '<li class="list-group-item text-success small"><i class="bi bi-check-circle me-1"></i>Aucune anomalie détectée</li>';
      return;
    }

    const errors = warnings.filter(w => w.level === 'error');
    const others = warnings.filter(w => w.level !== 'error');

    for (const w of [...errors, ...others]) {
      const li = document.createElement('li');
      if (w.level === 'error') {
        li.className = 'list-group-item list-group-item-danger small';
        li.innerHTML = '<i class="bi bi-x-circle me-1"></i>' + escHtml(w.message);
      } else {
        li.className = 'list-group-item list-group-item-warning small';
        li.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(w.message);
      }
      ul.appendChild(li);
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 8 — TABLE AFFECTATIONS
  // ─────────────────────────────────────────────────

  function renderTable(week) {
    const tbody   = $('tbodyAffectations');
    const countEl = $('countAffectations');
    if (!tbody) return;

    const slotMap = new Map();
    (week?.affectations || []).forEach((a, idx) => {
      const k = a.jour + '__' + a.creneau + '__' + a.secteur + '__' + (a.salle ?? '');
      if (!slotMap.has(k)) slotMap.set(k, {
        key: { jour: a.jour, creneau: a.creneau, secteur: a.secteur, salle: a.salle ?? '' },
        atomes: []
      });
      slotMap.get(k).atomes.push({ a, idx });
    });

    const allSlots = Array.from(slotMap.values());
    if (countEl) countEl.textContent = String(allSlots.length);

    const activeFilter = $('affFilterBar')?.dataset.filter || 'all';
    const filtered = allSlots.filter(({ key, atomes }) => {
      const aa = atomes.map(x => x.a);
      if (activeFilter === 'all')       return true;
      if (activeFilter === 'couloir')   return key.secteur.toUpperCase() === 'COULOIR';
      if (activeFilter === 'visceral')  return aa.some(a => Number(a.visceral)     === 1);
      if (activeFilter === 'fermee')    return aa.some(a => Number(a.salle_fermee) === 1);
      if (activeFilter === 'ouverture') return aa.some(a => Number(a.ouverture)    === 1);
      return true;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-secondary py-4">' +
        '<i class="bi bi-inbox me-1"></i>Aucun slot' +
        (activeFilter !== 'all' ? ' pour ce filtre' : '') + '</td></tr>';
      return;
    }

    const JOURS_O    = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI'];
    const CRENEAUX_O = ['MATIN','APREM','SOIR'];

    function slotPriority({ key, atomes }) {
      const aa = atomes.map(x => x.a);
      const isCouloir  = key.secteur.toUpperCase() === 'COULOIR';
      const isVisceral = isCouloir && aa.some(a => Number(a.visceral) === 1);
      if (isCouloir && !isVisceral)                     return 0;
      if (isVisceral)                                   return 1;
      if (aa.some(a => Number(a.salle_fermee) === 1))   return 2;
      if (aa.some(a => Number(a.ouverture)    === 1))   return 3;
      return 4;
    }

    filtered.sort((x, y) => {
      if (activeFilter !== 'all') {
        const ji = JOURS_O.indexOf(x.key.jour), jj = JOURS_O.indexOf(y.key.jour);
        if (ji !== jj) return (ji < 0 ? 99 : ji) - (jj < 0 ? 99 : jj);
        const ci = CRENEAUX_O.indexOf(x.key.creneau), cj = CRENEAUX_O.indexOf(y.key.creneau);
        if (ci !== cj) return (ci < 0 ? 99 : ci) - (cj < 0 ? 99 : cj);
        return String(x.key.salle).localeCompare(String(y.key.salle));
      }
      const px = slotPriority(x), py = slotPriority(y);
      if (px !== py) return px - py;
      const ji = JOURS_O.indexOf(x.key.jour), jj = JOURS_O.indexOf(y.key.jour);
      if (ji !== jj) return (ji < 0 ? 99 : ji) - (jj < 0 ? 99 : jj);
      const ci = CRENEAUX_O.indexOf(x.key.creneau), cj = CRENEAUX_O.indexOf(y.key.creneau);
      if (ci !== cj) return (ci < 0 ? 99 : ci) - (cj < 0 ? 99 : cj);
      return String(x.key.salle).localeCompare(String(y.key.salle));
    });

    function safeDisplay(code) {
      if (!code) return '';
      return PlanningMembers.isKnown(code)
        ? escHtml(PlanningMembers.display(code))
        : '<span class="text-danger fw-semibold" title="Code inconnu">' + escHtml(code) + '</span>';
    }

    function rowClass({ atomes, key }) {
      const aa = atomes.map(x => x.a);
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1)) return 'row-ferme-degrade';
      if (aa.some(a => Number(a.salle_fermee) === 1)) return 'row-fermee';
      if (aa.some(a => Number(a.visceral)     === 1)) return 'row-visceral';
      if (aa.some(a => Number(a.ouverture)    === 1)) return 'row-ouverture';
      if (key.secteur.toUpperCase() === 'COULOIR')    return 'row-couloir';
      return '';
    }

    function secteurBadge(key, isFermee) {
      if (key.secteur.toUpperCase() === 'COULOIR')
        return '<span class="badge bg-primary">Couloir</span>';
      return isFermee
        ? '<span class="badge bg-secondary"><i class="bi bi-lock me-1"></i>Salle ' + escHtml(String(key.salle)) + '</span>'
        : '<span class="badge bg-info-subtle text-info border border-info-subtle">Salle ' + escHtml(String(key.salle)) + '</span>';
    }

    function statutBadges(atomes) {
      const aa = atomes.map(x => x.a), out = [];
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1))
        out.push('<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>Dégradé</span>');
      else if (aa.some(a => Number(a.salle_fermee) === 1))
        out.push('<span class="badge bg-secondary">Fermée</span>');
      if (aa.some(a => Number(a.visceral)  === 1)) out.push('<span class="badge bg-warning-subtle text-dark border">Viscéral</span>');
      if (aa.some(a => Number(a.ouverture) === 1)) out.push('<span class="badge bg-success-subtle text-success border">Ouverture</span>');
      if (aa.some(a => Number(a.doublure)  === 1)) out.push('<span class="badge bg-warning text-dark">Doublure</span>');
      if (aa.some(a => a.role === 'ETUDIANT'))      out.push('<span class="badge plan-bg-etudiant plan-text-etudiant border">Étudiant</span>');
      return out.length ? out.join(' ') : '<span class="text-muted">—</span>';
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(slot => {
      const { key, atomes } = slot;
      const isCouloir = key.secteur.toUpperCase() === 'COULOIR';
      const isFermee  = atomes.some(x => Number(x.a.salle_fermee) === 1);
      const indices   = atomes.map(x => x.idx);
      const chir = isCouloir
        ? '<span class="text-muted">—</span>'
        : (() => {
            const c = atomes.map(x => x.a.chirurgien).find(c => c?.trim());
            return c ? safeDisplay(c) : '<span class="text-muted">—</span>';
          })();

      const tr = document.createElement('tr');
      tr.className = rowClass(slot);
      tr.innerHTML =
        '<td class="small align-middle ps-3">' + secteurBadge(key, isFermee) + '</td>' +
        '<td class="small align-middle fw-semibold">' + escHtml(key.jour) + '</td>' +
        '<td class="small align-middle text-muted">' + escHtml(key.creneau) + '</td>' +
        '<td class="small align-middle">' + chir + '</td>' +
        '<td class="small align-middle">' + (isFermee
          ? '<span class="text-muted fst-italic">Salle fermée</span>'
          : summarizeCell(atomes.map(x => x.a), { isCouloir })) + '</td>' +
        '<td class="small align-middle">' + statutBadges(atomes) + '</td>' +
        '<td class="text-end align-middle pe-3">' +
          '<div class="btn-group btn-group-sm">' +
            '<button class="btn btn-sm btn-outline-secondary btn-edit-slot" title="Éditer"' +
              ' data-jour="' + escHtml(key.jour) + '"' +
              ' data-creneau="' + escHtml(key.creneau) + '"' +
              ' data-secteur="' + escHtml(key.secteur) + '"' +
              ' data-salle="' + escHtml(String(key.salle ?? '')) + '">' +
              '<i class="bi bi-pencil"></i>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline-danger btn-delete-slot" title="Supprimer"' +
              ' data-indices="' + escHtml(JSON.stringify(indices)) + '">' +
              '<i class="bi bi-trash"></i>' +
            '</button>' +
          '</div>' +
        '</td>';
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    if (!tbody.dataset.listenersAttached) {
      tbody.dataset.listenersAttached = '1';
      tbody.addEventListener('click', async (e) => {
        const btnEdit = e.target.closest('.btn-edit-slot');
        if (btnEdit) {
          PlanningSlotEditor.openTerrainModalForSlot({
            jour:    btnEdit.dataset.jour,
            creneau: btnEdit.dataset.creneau,
            secteur: btnEdit.dataset.secteur,
            salle:   btnEdit.dataset.salle !== ''
              ? PlanningSchema.normalizeSalle(btnEdit.dataset.salle) : ''
          });
          return;
        }
        const btnDel = e.target.closest('.btn-delete-slot');
        if (btnDel) {
          const indices = JSON.parse(btnDel.dataset.indices || '[]');
          if (!indices.length) return;
          if (!confirm('Supprimer ce slot (' + indices.length + ' entrée' + (indices.length > 1 ? 's' : '') + ') ?')) return;
          try {
            await PlanningEngine.removeAffectationsByIndices(indices);
            await loadWeekAndRender();
            toast('Slot supprimé');
          } catch (err) { toast(err?.message || 'Erreur suppression'); }
        }
      });
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 9 — FLOW PRINCIPAL
  // ─────────────────────────────────────────────────

  function readWeekInputs() {
    return {
      semaine: Number($('weekInput')?.value || 0),
      annee:   Number($('yearInput')?.value  || 0)
    };
  }

  function setWeekKeyLabel(semaine, annee) {
    const el = $('weekKey');
    if (el) el.textContent = PlanningSchema.getWeekKey(semaine, annee);
  }

  async function loadWeekAndRender() {
    const { semaine, annee } = readWeekInputs();
    if (!semaine || !annee) { toast('Semaine/année invalide'); return; }
    setWeekKeyLabel(semaine, annee);
    setWeekContext(semaine, annee);
    const week = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    renderTable(week);
    renderWarnings(PlanningEngine.checkWeekIntegrity());
    renderMatrixGrid(semaine, annee);
    window.PlanningAvailability.refreshAvailabilityHints();
    const statut = PlanningEngine.getWeekStatut();
    const btn = $('btnDeclareComplete');
    if (btn) {
      btn.className = statut === 'COMPLETE'
        ? 'btn btn-sm btn-success w-100'
        : 'btn btn-sm btn-outline-success w-100';
      btn.innerHTML = statut === 'COMPLETE'
        ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
        : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 10 — INITIALISATION ASYNC
  // ─────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {

    // 1. Attendre bdb-shell (auth + bdbUser)
    await window.bdbShellReady;

    showLoading();

    // 2. Init PlanningMembers depuis Supabase
    try {
      await PlanningMembers.init();
    } catch (err) {
      showError('Erreur chargement membres : ' + (err?.message || err));
      return;
    }

    // 3. Câblage btn retry
    $('btnRetryPlan')?.addEventListener('click', async () => {
      showLoading();
      try {
        await PlanningMembers.init();
        await loadWeekAndRender();
        showContent();
      } catch (err) {
        showError('Erreur rechargement : ' + (err?.message || err));
      }
    });

    // 4. Câblage modules
    window.PlanningAvailability.setDeps({
      $, getWeekAffectations, getStrictIDEs, isSameSlot
    });

    window.PlanningImportUI.setDeps({
      $, toast, loadWeekAndRender, readWeekInputs
    });

    PlanningSlotEditor.setDeps({
      $,
      toast,
      loadWeekAndRender,
      getStrictIDEs,
      getStrictChirurgiens,
      getStrictSalles,
      getWeekAffectations,
      isSameSlot
    });
    PlanningSlotEditor.initModalEvents();

    // 5. Inline JS absorbé : modalCloseSalles
    $('modalCloseSalles')?.addEventListener('show.bs.modal', () => {
      PlanningSlotEditor.openCloseSallesModal();
    });

    // 6. Navigation semaine
    $('btnLoadWeek')?.addEventListener('click', () => {
      loadWeekAndRender().catch(err => toast(err?.message || "Le chargement n'a pu aboutir — réessayez dans un instant"));
    });

    $('btnPrevWeek')?.addEventListener('click', () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (--w < 1) { w = 53; y--; }
      $('weekInput').value = String(w);
      $('yearInput').value = String(y);
      loadWeekAndRender().catch(err => toast(err?.message || "Le chargement n'a pu aboutir — réessayez dans un instant"));
    });

    $('btnNextWeek')?.addEventListener('click', () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (++w > 53) { w = 1; y++; }
      $('weekInput').value = String(w);
      $('yearInput').value = String(y);
      loadWeekAndRender().catch(err => toast(err?.message || "Le chargement n'a pu aboutir — réessayez dans un instant"));
    });

    // 7. Toggle liste
    $('btnToggleLegacyTable')?.addEventListener('click', () => {
      $('legacyTableCard')?.classList.toggle('d-none');
    });

    // 8. Filtres table
    $('affFilterBar')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const bar = $('affFilterBar');
      bar.dataset.filter = btn.dataset.filter;
      bar.querySelectorAll('button').forEach(b => {
        const active   = b === btn;
        const colorMap = { couloir:'primary', visceral:'danger', fermee:'secondary', ouverture:'success', all:'primary' };
        const color    = colorMap[b.dataset.filter] || 'primary';
        b.className    = 'btn btn-sm ' + (active ? 'btn-' + color + ' active' : 'btn-outline-' + color);
      });
      const week = PlanningEngine.getCurrentWeek();
      if (week) renderTable(week);
    });

    // 9. Import CSV / JSON
    $('btnImportCSV')?.addEventListener('click', () => {
      const inp = $('fileImportCSV'); if (!inp) return;
      inp.value = ''; inp.click();
    });
    $('fileImportCSV')?.addEventListener('change', (e) => {
      const files = Array.from(e.target?.files || []);
      if (files.length) window.PlanningImportUI.importCSVFiles(files).catch(err => toast(err?.message || 'Erreur import CSV'));
    });

    $('btnImportJSON')?.addEventListener('click', () => {
      const inp = $('fileImportJSON'); if (!inp) return;
      inp.value = ''; inp.click();
    });
    $('fileImportJSON')?.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (file) window.PlanningImportUI.importJSONFile(file).catch(err => toast(err?.message || 'Erreur import JSON'));
    });

    // 10. Snapshot
    $('btnSnapshotWork')?.addEventListener('click', () => {
      window.PlanningImportUI.snapshotWork().catch(err => toast(err?.message || "La sauvegarde n'a pu aboutir — réessayez"));
    });

    // 11. Déclarer semaine complète
    $('btnDeclareComplete')?.addEventListener('click', async () => {
      try {
        const statut = PlanningEngine.getWeekStatut();
        const next   = statut === 'COMPLETE' ? 'EN_COURS' : 'COMPLETE';
        await PlanningEngine.setWeekStatut(next);
        renderWarnings(PlanningEngine.checkWeekIntegrity());
        const btn = $('btnDeclareComplete');
        if (btn) {
          btn.className  = next === 'COMPLETE' ? 'btn btn-sm btn-success w-100' : 'btn btn-sm btn-outline-success w-100';
          btn.innerHTML  = next === 'COMPLETE'
            ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
            : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
        }
        if (next === 'COMPLETE') {
          const { semaine, annee } = readWeekInputs();
          const filename = annee + '_S' + String(semaine).padStart(2, '0') + '_planning_week.json';
          await window.PlanningImportUI.snapshotWork(filename).catch(err => toast(err?.message || "La sauvegarde n'a pu aboutir — réessayez"));
          toast('Semaine clôturée et sauvegardée : ' + filename);
        } else {
          toast("Semaine réouverte — modifications possibles");
        }
      } catch (err) { toast(err?.message || "Le statut n'a pu être mis à jour — réessayez"); }
    });

    // 12. Fermer salles
    $('btnCloseSalles')?.addEventListener('click', () => {
      PlanningSlotEditor.openCloseSallesModal();
      bootstrap.Modal.getOrCreateInstance($('modalCloseSalles')).show();
    });
    $('btnConfirmCloseSalles')?.addEventListener('click', () => {
      PlanningSlotEditor.closeSallesSelection().catch(err => toast(err?.message || "La fermeture n'a pu aboutir — réessayez"));
    });

    // Touches Entree sur inputs
    $('weekInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loadWeekAndRender().catch(err => toast(err?.message || "Une difficulté est survenue — réessayez dans un instant"));
    });
    $('yearInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loadWeekAndRender().catch(err => toast(err?.message || "Une difficulté est survenue — réessayez dans un instant"));
    });

    // 13. Chargement initial -- derniere semaine disponible en base
    try {
      const weeks = await PlanningEngine.listWeeks();
      const withData = weeks.filter(w => w.annee && w.semaine && w.statut === 'COMPLETE');
      if (withData.length > 0) {
        const last = withData[withData.length - 1];
        $('weekInput').value = String(last.semaine);
        $('yearInput').value = String(last.annee);
      }
      await loadWeekAndRender();
      showContent();
    } catch (err) {
      showError('Erreur chargement planning : ' + (err?.message || err));
      return;
    }

    // Hook public
    window.PlanningController = {
      loadWeekAndRender: () => loadWeekAndRender().catch(err => toast(err?.message || "Une difficulté est survenue — réessayez dans un instant"))
    };

  });

})();
