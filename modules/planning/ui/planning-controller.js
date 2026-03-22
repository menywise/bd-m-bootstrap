// =====================================================
// PLANNING CONTROLLER v3.0 — orchestrateur allégé
// Responsabilités : render (matrix + table + warnings)
//                   navigation semaine
//                   câblage boutons UI
// Terrain V2 (modale édition) → délégué à PlanningSlotEditor
// =====================================================

(function () {
  "use strict";

  // ─────────────────────────────────────────────────
  // SECTION 1 — UTILITAIRES DE BASE
  // ─────────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    const el = $("toastInfo");
    if (!el) return;
    const body = el.querySelector(".toast-body");
    if (body) body.textContent = String(msg ?? "");
    new bootstrap.Toast(el).show();
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ─────────────────────────────────────────────────
  // SECTION 2 — GESTION TEMPORELLE
  // ─────────────────────────────────────────────────

  const MONTHS_FR = ["janvier","février","mars","avril","mai","juin","juillet","août",
                     "septembre","octobre","novembre","décembre"];

  function pad2(n) { const x = Number(n); return x < 10 ? `0${x}` : String(x); }

  function formatDateFR(d) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
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
    const el = $("weekContext");
    if (!el) return;
    if (!semaine || !annee) { el.textContent = ""; return; }
    const { monday, friday } = computeWeekDates(semaine, annee);
    el.textContent = `Semaine ${semaine} — ${MONTHS_FR[monday.getMonth()]} ${annee} — ${formatDateFR(monday)} → ${formatDateFR(friday)}`;
  }

  // ─────────────────────────────────────────────────
  // SECTION 3 — RÉFÉRENTIELS
  // ─────────────────────────────────────────────────

  const FALLBACK_SALLES = ["05", "06", "07", "08"];

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
    return String(a?.jour || "") === String(jour || "") &&
           String(a?.creneau || "") === String(creneau || "");
  }

  // ─────────────────────────────────────────────────
  // SECTION 4 — summarizeCell (partagée matrix + table)
  // ─────────────────────────────────────────────────

  function summarizeCell(list, { isCouloir = false } = {}) {
    if (!Array.isArray(list) || list.length === 0) return "";

    // Rendu unifié d'un atome IDE : fond coloré sur le div selon le flag
    // Couleurs : ouverture=vert, doublure=jaune, visceral=orange, nuit=bleu, etudiant=violet
    function atomDiv(code, flags = {}) {
      const d     = PlanningMembers.display(code);
      const known = PlanningMembers.isKnown(code);
      const name  = known ? escapeHtml(d) : `<span class="text-danger fw-semibold">${escapeHtml(d)}</span>`;
      let cls = "small rounded-1 px-1";
      if      (flags.ouverture && flags.visceral) cls += " bg-success-subtle border border-warning";
      else if (flags.ouverture && flags.nuit)     cls += " bg-success-subtle border border-info";
      else if (flags.ouverture)  cls += " bg-success-subtle";
      else if (flags.doublure)   cls += " bg-warning-subtle";
      else if (flags.visceral)   cls += " bg-warning-subtle text-warning-emphasis";
      else if (flags.nuit)       cls += " bg-info-subtle";
      else if (flags.etudiant)   cls += " plan-bg-etudiant";
      else                       cls  = "small";
      return `<div class="${cls}">${name}</div>`;
    }

    if (isCouloir) {
      return list
        .filter(a => String(a.ide || "").trim())
        .map(a => atomDiv(String(a.ide).trim(), {
          ouverture: Number(a.ouverture) === 1,
          doublure:  Number(a.doublure)  === 1,
          visceral:  Number(a.visceral)  === 1,
          nuit:      Number(a.nuit)      === 1,
          etudiant:  a.role === "ETUDIANT"
        })).join("");
    }

    const chirCode = Array.from(new Set(
      list.map(x => String(x.chirurgien || "").trim()).filter(Boolean)
    ))[0] || "";

    let html = "";
    if (chirCode) {
      const d   = PlanningMembers.display(chirCode);
      const cls = PlanningMembers.isKnown(chirCode) ? "fw-semibold small" : "fw-semibold small text-danger";
      html += `<div class="${cls}">${escapeHtml(d)}</div>`;
    }

    for (const a of list) {
      const ide = String(a.ide || "").trim();
      if (!ide) continue;
      html += atomDiv(ide, {
        ouverture: Number(a.ouverture) === 1,
        doublure:  Number(a.doublure)  === 1,
        visceral:  Number(a.visceral)  === 1,
        nuit:      Number(a.nuit)      === 1,
        etudiant:  a.role === "ETUDIANT"
      });
    }
    return html;
  }

  // ─────────────────────────────────────────────────
  // SECTION 5 — RENDU MATRICE
  // ─────────────────────────────────────────────────

  function renderMatrixGrid(semaine, annee) {
    const host = $("matrixGrid");
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
          salle: salle !== "" ? PlanningSchema.normalizeSalle(salle) : ""
        });
      }
    });
  }

  // ─────────────────────────────────────────────────
  // SECTION 6 — WARNINGS & STATUT
  // ─────────────────────────────────────────────────

  function renderWarnings(warnings) {
    const ul = $("weekWarnings");
    if (!ul) return;
    ul.innerHTML = "";

    // Badge statut
    const statut = PlanningEngine.getWeekStatut();
    const badgeEl = $("weekStatutBadge");
    if (badgeEl) {
      badgeEl.className = statut === "COMPLETE"
        ? "badge bg-success"
        : "badge bg-secondary";
      badgeEl.textContent = statut === "COMPLETE" ? "Complète" : "En cours";
    }

    if (!warnings?.length) {
      ul.innerHTML = '<li class="list-group-item text-success small"><i class="bi bi-check-circle me-1"></i>Aucune anomalie détectée</li>';
      return;
    }

    const errors   = warnings.filter(w => w.level === "error");
    const others   = warnings.filter(w => w.level !== "error");

    for (const w of [...errors, ...others]) {
      const li = document.createElement("li");
      if (w.level === "error") {
        li.className = "list-group-item list-group-item-danger small";
        li.innerHTML = `<i class="bi bi-x-circle me-1"></i>${escapeHtml(w.message)}`;
      } else {
        li.className = "list-group-item list-group-item-warning small";
        li.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i>${escapeHtml(w.message)}`;
      }
      ul.appendChild(li);
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 7 — TABLE AFFECTATIONS (vue plate)
  // ─────────────────────────────────────────────────

  function renderTable(week) {
    const tbody   = $("tbodyAffectations");
    const countEl = $("countAffectations");
    if (!tbody) return;

    // Groupement par slot
    const slotMap = new Map();
    (week?.affectations || []).forEach((a, idx) => {
      const k = `${a.jour}__${a.creneau}__${a.secteur}__${a.salle ?? ""}`;
      if (!slotMap.has(k)) slotMap.set(k, {
        key: { jour: a.jour, creneau: a.creneau, secteur: a.secteur, salle: a.salle ?? "" },
        atomes: []
      });
      slotMap.get(k).atomes.push({ a, idx });
    });

    const allSlots = Array.from(slotMap.values());
    if (countEl) countEl.textContent = String(allSlots.length);

    // Filtre actif
    const activeFilter = $("affFilterBar")?.dataset.filter || "all";
    const filtered = allSlots.filter(({ key, atomes }) => {
      if (activeFilter === "all")       return true;
      const aa = atomes.map(x => x.a);
      if (activeFilter === "couloir")   return key.secteur.toUpperCase() === "COULOIR";
      if (activeFilter === "visceral")  return aa.some(a => Number(a.visceral)     === 1);
      if (activeFilter === "fermee")    return aa.some(a => Number(a.salle_fermee) === 1);
      if (activeFilter === "ouverture") return aa.some(a => Number(a.ouverture)    === 1);
      return true;
    });

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-4">
        <i class="bi bi-inbox me-1"></i>Aucun slot${activeFilter !== "all" ? " pour ce filtre" : ""}
      </td></tr>`;
      return;
    }

    // Tri : nature slot (Couloir > Viscéral > Fermée > Ouvreur > Normale) → Jour → Créneau
    const JOURS_O    = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI"];
    const CRENEAUX_O = ["MATIN","APREM","SOIR"];

    function slotPriority({ key, atomes }) {
      const aa  = atomes.map(x => x.a);
      const isCouloir  = key.secteur.toUpperCase() === "COULOIR";
      const isVisceral = isCouloir && aa.some(a => Number(a.visceral) === 1); // COULOIR uniquement
      if (isCouloir && !isVisceral)                                return 0;
      if (isVisceral)                                              return 1;
      if (aa.some(a => Number(a.salle_fermee) === 1))             return 2;
      if (aa.some(a => Number(a.ouverture)    === 1))             return 3;
      return 4;
    }

    filtered.sort((x, y) => {
      // En vue filtrée : chronologie directe (même type de slot)
      // En vue complète : nature en primaire puis chronologie
      if (activeFilter !== "all") {
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

    // Helpers affichage
    function safeDisplay(code) {
      if (!code) return "";
      const M = window.PlanningMembers;
      if (!M) return escapeHtml(code);
      return M.isKnown(code)
        ? escapeHtml(M.display(code))
        : `<span class="text-danger fw-semibold" title="Code inconnu">${escapeHtml(code)}</span>`;
    }

    function rowClass({ atomes, key }) {
      const aa = atomes.map(x => x.a);
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1)) return "row-ferme-degrade";
      if (aa.some(a => Number(a.salle_fermee) === 1)) return "row-fermee";
      if (aa.some(a => Number(a.visceral)     === 1)) return "row-visceral";
      if (aa.some(a => Number(a.ouverture)    === 1)) return "row-ouverture";
      if (key.secteur.toUpperCase() === "COULOIR")    return "row-couloir";
      return "";
    }

    function secteurBadge(key, isFermee) {
      if (key.secteur.toUpperCase() === "COULOIR")
        return `<span class="badge bg-primary">Couloir</span>`;
      return isFermee
        ? `<span class="badge bg-secondary"><i class="bi bi-lock me-1"></i>Salle ${escapeHtml(String(key.salle))}</span>`
        : `<span class="badge bg-info-subtle text-info border border-info-subtle">Salle ${escapeHtml(String(key.salle))}</span>`;
    }

    function statutBadges(atomes) {
      const aa = atomes.map(x => x.a), out = [];
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1)) out.push('<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>Dégradé</span>');
      else if (aa.some(a => Number(a.salle_fermee) === 1)) out.push('<span class="badge bg-secondary">Fermée</span>');
      if (aa.some(a => Number(a.visceral)     === 1)) out.push('<span class="badge bg-warning-subtle text-dark border">Viscéral</span>');
      if (aa.some(a => Number(a.ouverture)    === 1)) out.push('<span class="badge bg-success-subtle text-success border">Ouverture</span>');
      if (aa.some(a => Number(a.doublure)     === 1)) out.push('<span class="badge bg-warning text-dark">Doublure</span>');
      if (aa.some(a => a.role === "ETUDIANT"))        out.push('<span class="badge plan-bg-etudiant plan-text-etudiant border">Étudiant</span>');
      return out.length ? out.join(" ") : '<span class="text-muted">—</span>';
    }

    // Rendu
    const fragment = document.createDocumentFragment();
    filtered.forEach(slot => {
      const { key, atomes } = slot;
      const isCouloir = key.secteur.toUpperCase() === "COULOIR";
      const isFermee  = atomes.some(x => Number(x.a.salle_fermee) === 1);
      const indices   = atomes.map(x => x.idx);
      const chir      = isCouloir
        ? '<span class="text-muted">—</span>'
        : (() => { const c = atomes.map(x => x.a.chirurgien).find(c => c?.trim()); return c ? safeDisplay(c) : '<span class="text-muted">—</span>'; })();

      const tr = document.createElement("tr");
      tr.className = rowClass(slot);
      tr.innerHTML = `
        <td class="small align-middle ps-3">${secteurBadge(key, isFermee)}</td>
        <td class="small align-middle fw-semibold">${escapeHtml(key.jour)}</td>
        <td class="small align-middle text-muted">${escapeHtml(key.creneau)}</td>
        <td class="small align-middle">${chir}</td>
        <td class="small align-middle">${isFermee ? '<span class="text-muted fst-italic">Salle fermée</span>' : summarizeCell(atomes.map(x => x.a), { isCouloir })}</td>
        <td class="small align-middle">${statutBadges(atomes)}</td>
        <td class="text-end align-middle pe-3">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-sm btn-outline-secondary btn-edit-slot" title="Éditer"
              data-jour="${escapeHtml(key.jour)}"
              data-creneau="${escapeHtml(key.creneau)}"
              data-secteur="${escapeHtml(key.secteur)}"
              data-salle="${escapeHtml(String(key.salle ?? ""))}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete-slot" title="Supprimer"
              data-indices="${escapeHtml(JSON.stringify(indices))}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>`;
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    // Listener délégué — une seule fois
    if (!tbody.dataset.listenersAttached) {
      tbody.dataset.listenersAttached = "1";
      tbody.addEventListener("click", async (e) => {
        const btnEdit = e.target.closest(".btn-edit-slot");
        if (btnEdit) {
          PlanningSlotEditor.openTerrainModalForSlot({
            jour:    btnEdit.dataset.jour,
            creneau: btnEdit.dataset.creneau,
            secteur: btnEdit.dataset.secteur,
            salle: btnEdit.dataset.salle !== "" ? PlanningSchema.normalizeSalle(btnEdit.dataset.salle) : ""
          });
          return;
        }
        const btnDel = e.target.closest(".btn-delete-slot");
        if (btnDel) {
          const indices = JSON.parse(btnDel.dataset.indices || "[]");
          if (!indices.length) return;
          if (!confirm(`Supprimer ce slot (${indices.length} entrée${indices.length > 1 ? "s" : ""}) ?`)) return;
          try {
            await removeAffectationsByIndices(indices);
            await loadWeekAndRender();
            toast("Slot supprimé");
          } catch (err) { toast(err?.message || "Erreur suppression"); }
        }
      });
    }
  }

  // removeAffectationsByIndices — helper local pour la table
  async function removeAffectationsByIndices(indices) {
    const week = PlanningEngine.getCurrentWeek();
    if (!week?.affectations) return;
    const sorted = [...indices].sort((a, b) => b - a);
    for (const idx of sorted) {
      await PlanningEngine.removeAffectation(idx);
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 8 — FLOW PRINCIPAL
  // ─────────────────────────────────────────────────

  function readWeekInputs() {
    return {
      semaine: Number($("weekInput")?.value || 0),
      annee:   Number($("yearInput")?.value  || 0)
    };
  }

  function setWeekKeyLabel(semaine, annee) {
    const el = $("weekKey");
    if (el) el.textContent = PlanningSchema.getWeekKey(semaine, annee);
  }

  async function loadWeekAndRender() {
    const { semaine, annee } = readWeekInputs();
    if (!semaine || !annee) { toast("Semaine/année invalide"); return; }
    setWeekKeyLabel(semaine, annee);
    setWeekContext(semaine, annee);
    const week = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    renderTable(week);
    renderWarnings(PlanningEngine.checkWeekIntegrity());
    renderMatrixGrid(semaine, annee);
    window.PlanningAvailability.refreshAvailabilityHints();
    // Sync bouton statut
    const statut = PlanningEngine.getWeekStatut();
    const btn = $("btnDeclareComplete");
    if (btn) {
      btn.className = statut === "COMPLETE"
        ? "btn btn-sm btn-success w-100"
        : "btn btn-sm btn-outline-success w-100";
      btn.innerHTML = statut === "COMPLETE"
        ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
        : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 9 — INITIALISATION DOM
  // ─────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", () => {

    // Deps modules
    window.PlanningAvailability.setDeps({
      $, getWeekAffectations, getStrictIDEs, isSameSlot
    });

    window.PlanningImportUI.setDeps({
      $, toast, loadWeekAndRender, readWeekInputs
    });

    // SlotEditor : injection deps + init modale
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

    // Navigation semaine
    $("btnLoadWeek")?.addEventListener("click", () => loadWeekAndRender().catch(console.error));

    $("btnPrevWeek")?.addEventListener("click", () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (--w < 1) { w = 53; y--; }
      $("weekInput").value = String(w);
      $("yearInput").value = String(y);
      loadWeekAndRender().catch(console.error);
    });

    $("btnNextWeek")?.addEventListener("click", () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (++w > 53) { w = 1; y++; }
      $("weekInput").value = String(w);
      $("yearInput").value = String(y);
      loadWeekAndRender().catch(console.error);
    });

    // Toggle liste
    $("btnToggleLegacyTable")?.addEventListener("click", () => {
      $("legacyTableCard")?.classList.toggle("d-none");
    });

    // Filtres table
    $("affFilterBar")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      const bar = $("affFilterBar");
      bar.dataset.filter = btn.dataset.filter;
      bar.querySelectorAll("button").forEach(b => {
        const active = b === btn;
        const colorMap = { couloir: "primary", visceral: "danger", fermee: "secondary", ouverture: "success", all: "primary" };
        const color = colorMap[b.dataset.filter] || "primary";
        b.className = `btn btn-sm ${active ? `btn-${color} active` : `btn-outline-${color}`}`;
      });
      const week = PlanningEngine.getCurrentWeek();
      if (week) renderTable(week);
    });

    // Import CSV / JSON
    $("btnImportCSV")?.addEventListener("click", () => {
      const inp = $("fileImportCSV"); if (!inp) return;
      inp.value = ""; inp.click();
    });
    $("fileImportCSV")?.addEventListener("change", (e) => {
      const files = Array.from(e.target?.files || []);
      if (files.length) window.PlanningImportUI.importCSVFiles(files).catch(console.error);
    });

    $("btnImportJSON")?.addEventListener("click", () => {
      const inp = $("fileImportJSON"); if (!inp) return;
      inp.value = ""; inp.click();
    });
    $("fileImportJSON")?.addEventListener("change", (e) => {
      const file = e.target?.files?.[0];
      if (file) window.PlanningImportUI.importJSONFile(file).catch(console.error);
    });

    // Snapshot
    $("btnSnapshotWork")?.addEventListener("click", () =>
      window.PlanningImportUI.snapshotWork().catch(console.error)
    );

    // Déclarer semaine complète
    $("btnDeclareComplete")?.addEventListener("click", async () => {
      const statut = PlanningEngine.getWeekStatut();
      const next   = statut === "COMPLETE" ? "EN_COURS" : "COMPLETE";
      await PlanningEngine.setWeekStatut(next);
      renderWarnings(PlanningEngine.checkWeekIntegrity());
      const btn = $("btnDeclareComplete");
      if (btn) {
        btn.className = next === "COMPLETE"
          ? "btn btn-sm btn-success w-100"
          : "btn btn-sm btn-outline-success w-100";
        btn.innerHTML = next === "COMPLETE"
          ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
          : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
      }

      if (next === "COMPLETE") {
        // Snapshot automatique au format AAAA_Snn_planning_week.json
        const { semaine, annee } = readWeekInputs();
        const sLabel   = `S${String(semaine).padStart(2, "0")}`;
        const filename = `${annee}_${sLabel}_planning_week.json`;
        await window.PlanningImportUI.snapshotWork(filename).catch(console.error);
        toast(`Semaine déclarée complète — snapshot sauvegardé : ${filename}`);
      } else {
        toast("Semaine repassée en cours");
      }
    });

    // Fermer salles
    $("btnCloseSalles")?.addEventListener("click", () => {
      PlanningSlotEditor.openCloseSallesModal();
      bootstrap.Modal.getOrCreateInstance($("modalCloseSalles")).show();
    });
    $("btnConfirmCloseSalles")?.addEventListener("click", () =>
      PlanningSlotEditor.closeSallesSelection().catch(console.error)
    );

    // Chargement initial
    loadWeekAndRender().catch(console.error);

    // Hook public pour planning-batch-modals.js
    window.PlanningController = {
      loadWeekAndRender: () => loadWeekAndRender().catch(console.error)
    };
  });

})();
