// =====================================================
// PLANNING SLOT EDITOR
// Edition complète d'un slot SALLE sans régression
// =====================================================
// VERSION : 2.0.0 — 2026-02-22
// AJOUTS  : terrain V2 (COULOIR + SALLE), modale V2,
//           propagation A/B/C, fillSelectIDEAvailable,
//           wireInterim, initModalEvents, hasTerrainModal
// CONSERVÉ : setDeps, getSlotAffectations, buildSlotModel,
//            hydrateModal (legacy), replaceSlot (legacy)
// =====================================================

(function () {
  "use strict";

  let _deps = null;

  function setDeps(deps) {
    _deps = deps;
  }

  function $(id) { return document.getElementById(id); }

  function getWeekAffectations() {
    return _deps?.getWeekAffectations?.()
      || PlanningEngine.getCurrentWeek()?.affectations
      || [];
  }
  function getStrictIDEs()        { return _deps?.getStrictIDEs?.()        || []; }
  function getStrictChirurgiens() { return _deps?.getStrictChirurgiens?.() || []; }
  function toast(msg)             {
    if (_deps?.toast) { _deps.toast(msg); return; }
    // Fallback : console si pas de toast injecté
    console.info("[SlotEditor]", msg);
  }
  async function doLoadWeekAndRender() {
    if (_deps?.loadWeekAndRender) return _deps.loadWeekAndRender();
    if (typeof window.planningReload === "function") return window.planningReload();
  }

  // État COULOIR en cours d'édition
  let __couloirEquipe  = [];
  let __currentSlotKey = null;

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS LEGACY (conservées telles quelles)
  // ─────────────────────────────────────────────────────────────────────────

  function getSlotAffectations(slotKey) {
    return getWeekAffectations().filter(a =>
      a.jour     === slotKey.jour     &&
      a.creneau  === slotKey.creneau  &&
      a.secteur  === slotKey.secteur  &&
      String(a.salle ?? "") === String(slotKey.salle ?? "")
    );
  }

  function buildSlotModel(slotKey) {
    const list = getSlotAffectations(slotKey);
    const model = {
      ...slotKey,
      chirurgien: "",
      instru:    { ide: "", ouverture: 0 },
      panseur:   { ide: "", ouverture: 0 },
      doublure:  { ide: "", sous: "" },
      etudiant:  "",
      flags:     { salle_fermee: 0, ferme_degrade: 0, urgence_fermee: 0 }
    };
    for (const a of list) {
      model.chirurgien = a.chirurgien || model.chirurgien;
      if (a.role === "INSTRU"  && Number(a.doublure) !== 1) { model.instru.ide  = a.ide || ""; model.instru.ouverture  = Number(a.ouverture) === 1 ? 1 : 0; }
      if (a.role === "PANSEUR" && Number(a.doublure) !== 1) { model.panseur.ide = a.ide || ""; model.panseur.ouverture = Number(a.ouverture) === 1 ? 1 : 0; }
      if (Number(a.doublure) === 1) { model.doublure.ide = a.ide || ""; model.doublure.sous = a.role || ""; }
      if (a.role === "ETUDIANT") { model.etudiant = a.ide || ""; }
      model.flags.salle_fermee   = Number(a.salle_fermee)   === 1 ? 1 : model.flags.salle_fermee;
      model.flags.ferme_degrade  = Number(a.ferme_degrade)  === 1 ? 1 : model.flags.ferme_degrade;
      model.flags.urgence_fermee = Number(a.urgence_fermee) === 1 ? 1 : model.flags.urgence_fermee;
    }
    return model;
  }

  function hydrateModal(model) {
    document.getElementById("selectSalle").value       = model.salle || "";
    document.getElementById("selectChirurgien").value  = model.chirurgien || "";
    document.getElementById("selectInstru").value      = model.instru.ide || "";
    document.getElementById("selectPanseur").value     = model.panseur.ide || "";
    document.getElementById("checkboxOuverture").checked = model.instru.ouverture === 1 || model.panseur.ouverture === 1;
    if (model.doublure.ide) {
      document.getElementById("checkboxDoublure").checked  = true;
      document.getElementById("selectDoublure").value      = model.doublure.ide;
      document.getElementById("selectDoublureSous").value  = model.doublure.sous;
    }
    document.getElementById("checkboxSalleFermee").checked   = model.flags.salle_fermee   === 1;
    document.getElementById("checkboxUrgenceFermee").checked = model.flags.urgence_fermee === 1;
  }

  async function replaceSlot(slotKey, model) {
    const existing = getSlotAffectations(slotKey);
    if (existing.length > 0) {
      const ok = confirm("Ce créneau contient déjà des affectations. Les remplacer ?");
      if (!ok) return;
    }
    const week = PlanningEngine.getCurrentWeek();
    week.affectations = week.affectations.filter(a =>
      !(a.jour === slotKey.jour && a.creneau === slotKey.creneau &&
        a.secteur === slotKey.secteur && String(a.salle ?? "") === String(slotKey.salle ?? ""))
    );
    function add(role, ide, options = {}) {
      if (!ide) return;
      PlanningEngine.addAffectation({
        ...slotKey, chirurgien: model.chirurgien, ide, role,
        ouverture: options.ouverture || 0, doublure: options.doublure || 0,
        salle_fermee: model.flags.salle_fermee, urgence_fermee: model.flags.urgence_fermee
      });
    }
    add("INSTRU",  model.instru.ide,  { ouverture: model.instru.ouverture });
    add("PANSEUR", model.panseur.ide, { ouverture: model.panseur.ouverture });
    if (model.doublure.ide) add(model.doublure.sous, model.doublure.ide, { doublure: 1 });
    if (model.etudiant)     add("ETUDIANT", model.etudiant);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TERRAIN V2
  // ─────────────────────────────────────────────────────────────────────────

  function hasTerrainModal() {
    return !!($("modalViewCouloir") && $("modalViewSalle"));
  }

  function getModalEl() {
    return $("modalCreate") || null;
  }

  // M4 — IDEs indisponibles au même créneau (tous secteurs sauf la salle courante)
  // excludeSalle : salle à ignorer (la salle du slot en cours d'édition)
  function getIDEsUsedElsewhere(jour, creneau, excludeSalle) {
    return getWeekAffectations()
      .filter(a =>
        String(a.jour     || "") === String(jour     || "") &&
        String(a.creneau  || "") === String(creneau  || "") &&
        String(a.ide      || "").trim() &&
        // Exclure les affeciations de la salle courante (on édite ce slot)
        !(String(a.secteur || "").toUpperCase() === "SALLE" &&
          String(a.salle   ?? "")               === String(excludeSalle ?? ""))
      )
      .map(a => String(a.ide).trim())
      .filter((v, i, arr) => arr.indexOf(v) === i); // dédupe
  }

  // preserveCode : code à ne jamais désactiver (valeur déjà affectée à CE poste)
  // excludeSalle : salle courante — ses affectations sont ignorées dans le calcul
  //                si omis, utilise __currentSlotKey.salle (contexte modal Salle)
  function fillSelectIDEAvailable(selectEl, jour, creneau, preserveCode, excludeSalle) {
    if (!selectEl) return;
    const salle     = excludeSalle ?? __currentSlotKey?.salle ?? null;
    const usedCodes = getIDEsUsedElsewhere(jour, creneau, salle);
    const current   = selectEl.value;
    selectEl.innerHTML = '<option value="">—</option>';
    for (const ph of ["INTERIMAIRE", "ETUDIANT", "VISCERAL"]) {
      const opt = document.createElement("option");
      opt.value = ph; opt.textContent = PlanningMembers.display(ph);
      selectEl.appendChild(opt);
    }
    const sorted = [...getStrictIDEs()].sort((a, b) =>
      PlanningMembers.display(a).localeCompare(PlanningMembers.display(b), "fr")
    );
    for (const code of sorted) {
      const opt = document.createElement("option");
      opt.value = code;
      const label = PlanningMembers.display(code);
      // Désactiver si déjà posté ailleurs au même créneau, SAUF si c'est la valeur de CE poste
      if (usedCodes.includes(code) && code !== preserveCode) {
        opt.disabled = true;
        opt.textContent = label + " (autre poste)";
      } else {
        opt.textContent = label;
      }
      selectEl.appendChild(opt);
    }
    if (current) selectEl.value = current;
  }

  // Sélect étudiant : IDEs réels uniquement (pas de placeholders)
  function fillEtudiantSelect(selectEl, jour, creneau) {
    if (!selectEl) return;
    const current = selectEl.value;
    selectEl.innerHTML = '<option value="">—</option>';
    const sorted = [...getStrictIDEs()].sort((a, b) =>
      PlanningMembers.display(a).localeCompare(PlanningMembers.display(b), "fr")
    );
    for (const code of sorted) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = PlanningMembers.display(code);
      selectEl.appendChild(opt);
    }
    if (current) selectEl.value = current;
  }

  // Chirurgiens déjà affectés dans une autre salle du même jour+créneau
  function getChirurgiensUsedInSlot(jour, creneau, excludeSalle) {
    return getWeekAffectations()
      .filter(a =>
        String(a.jour     || "") === String(jour     || "") &&
        String(a.creneau  || "") === String(creneau  || "") &&
        String(a.secteur  || "") === "SALLE" &&
        String(a.salle    ?? "") !== String(excludeSalle ?? "") &&
        String(a.chirurgien || "").trim()
      )
      .map(a => String(a.chirurgien).trim());
  }

  function fillSelectChirurgienAvailable(selectEl, jour, creneau, excludeSalle) {
    if (!selectEl) return;
    const usedChirs = getChirurgiensUsedInSlot(jour, creneau, excludeSalle);
    const current   = selectEl.value;
    selectEl.innerHTML = '<option value="">—</option>';
    const sorted = [...getStrictChirurgiens()].sort((a, b) =>
      PlanningMembers.display(a).localeCompare(PlanningMembers.display(b), "fr")
    );
    for (const code of sorted) {
      const opt = document.createElement("option");
      opt.value = code;
      const label = PlanningMembers.display(code);
      if (usedChirs.includes(code)) {
        opt.disabled = true;
        opt.textContent = label + " (autre salle)";
      } else {
        opt.textContent = label;
      }
      selectEl.appendChild(opt);
    }
    if (current) selectEl.value = current;
  }

  function wireInterimCheckbox(checkboxId, selectId) {
    const cb = $(checkboxId), sel = $(selectId);
    if (!cb || !sel) return;
    cb.addEventListener("change", () => {
      if (cb.checked) { sel.dataset.prevValue = sel.value; sel.value = "INTERIMAIRE"; sel.disabled = true; }
      else { sel.disabled = false; sel.value = sel.dataset.prevValue || ""; }
    });
  }

  // Vérifie si une autre IDE est déjà flaggée nuit le même jour (hors atome courant)
  // Affiche/masque #alertNuitDoublon sans bloquer la saisie
  function checkNuitDoublon(jour, creneau, secteur, salle) {
    const alert = $("alertNuitDoublon");
    if (!alert) return;
    if (!jour) { alert.classList.add("d-none"); return; }
    const week = typeof PlanningEngine !== "undefined" ? PlanningEngine.getCurrentWeek() : null;
    if (!week) { alert.classList.add("d-none"); return; }
    const hasOther = week.affectations.some(a =>
      String(a.jour    || "").toUpperCase() === String(jour    || "").toUpperCase() &&
      Number(a.nuit) === 1 &&
      // Exclure l'atome du slot courant
      !(String(a.creneau || "").toUpperCase() === String(creneau || "").toUpperCase() &&
        String(a.secteur || "").toUpperCase() === String(secteur || "").toUpperCase() &&
        String(a.salle   ?? "")               === String(salle   ?? ""))
    );
    alert.classList.toggle("d-none", !hasOther);
  }

  function checkIrrationnel() {
    const show = !($("doublureInstruBlock")?.classList.contains("d-none"))
              && !($("doublurePanseurBlock")?.classList.contains("d-none"))
              && $("checkboxEtudiant")?.checked === true;
    $("alertIrrationnel")?.classList.toggle("d-none", !show);
  }

  function buildCouloirRow(idx, entry) {
    const div = document.createElement("div");
    div.className = "d-flex align-items-center gap-2 mb-1";
    div.dataset.couloirIdx = String(idx);

    const sel = document.createElement("select");
    sel.className = "form-select form-select-sm";
    sel.innerHTML = '<option value="">—</option>';
    const sorted = [...getStrictIDEs()].sort((a, b) =>
      PlanningMembers.display(a).localeCompare(PlanningMembers.display(b), "fr")
    );
    for (const code of sorted) {
      const opt = document.createElement("option");
      opt.value = code; opt.textContent = PlanningMembers.display(code);
      sel.appendChild(opt);
    }
    sel.value = entry.ide || "";
    sel.addEventListener("change", () => { if (__couloirEquipe[idx]) __couloirEquipe[idx].ide = sel.value; });

    const btnOuv = document.createElement("button");
    btnOuv.type = "button";
    btnOuv.className = "btn btn-sm " + (entry.ouverture ? "btn-success" : "btn-outline-secondary");
    btnOuv.title = "Ouverture"; btnOuv.innerHTML = '<i class="bi bi-sunrise"></i>';
    btnOuv.addEventListener("click", () => {
      if (__couloirEquipe[idx]) __couloirEquipe[idx].ouverture = __couloirEquipe[idx].ouverture ? 0 : 1;
      refreshCouloirList();
    });

    const btnVis = document.createElement("button");
    btnVis.type = "button";
    btnVis.className = "btn btn-sm " + (entry.visceral ? "btn-danger" : "btn-outline-secondary");
    btnVis.title = "Viscéral"; btnVis.innerHTML = '<i class="bi bi-heart-pulse"></i>';
    btnVis.addEventListener("click", () => {
      if (__couloirEquipe[idx]) __couloirEquipe[idx].visceral = __couloirEquipe[idx].visceral ? 0 : 1;
      refreshCouloirList();
    });

    const btnNuit = document.createElement("button");
    btnNuit.type = "button";
    btnNuit.className = "btn btn-sm " + (entry.nuit ? "btn-info" : "btn-outline-secondary");
    btnNuit.title = "Nuit"; btnNuit.innerHTML = '<i class="bi bi-moon-stars"></i>';
    btnNuit.addEventListener("click", () => {
      if (__couloirEquipe[idx]) __couloirEquipe[idx].nuit = __couloirEquipe[idx].nuit ? 0 : 1;
      refreshCouloirList();
    });

    const btnDel = document.createElement("button");
    btnDel.type = "button"; btnDel.className = "btn btn-sm btn-outline-danger";
    btnDel.innerHTML = '<i class="bi bi-x"></i>';
    btnDel.addEventListener("click", () => { __couloirEquipe.splice(idx, 1); refreshCouloirList(); });

    div.appendChild(sel); div.appendChild(btnOuv); div.appendChild(btnVis); div.appendChild(btnNuit); div.appendChild(btnDel);
    return div;
  }

  function refreshCouloirList() {
    const container = $("couloirEquipeList");
    if (!container) return;
    container.innerHTML = "";
    __couloirEquipe.forEach((entry, idx) => container.appendChild(buildCouloirRow(idx, entry)));
  }

  function buildSlotModelFromExisting(slotKey) {
    const existing  = getSlotAffectations(slotKey);
    const isCouloir = String(slotKey.secteur || "").toUpperCase() === "COULOIR";

    if (isCouloir) {
      return {
        type: "COULOIR", slotKey: { ...slotKey },
        equipe: existing.filter(a => String(a.ide||"").trim()).map(a => ({
          ide:       String(a.ide).trim(),
          ouverture: Number(a.ouverture) === 1 ? 1 : 0,
          visceral:  Number(a.visceral)  === 1 ? 1 : 0,
          nuit:      Number(a.nuit)      === 1 ? 1 : 0
        })),
        existingCount: existing.length
      };
    }

    const model = {
      type: "SALLE", slotKey: { ...slotKey },
      chirurgien: "",
      instru:          { ide: "", ouverture: 0, nuit: 0, interimaire: 0 },
      panseur:         { ide: "", ouverture: 0, nuit: 0, interimaire: 0 },
      doublureInstru:  { ide: "", ouverture: 0, interimaire: 0 },
      doublurePanseur: { ide: "", ouverture: 0, interimaire: 0 },
      etudiant: "",
      flags: { salle_fermee: 0, ferme_degrade: 0, urgence_fermee: 0 }
    };
    for (const a of existing) {
      if (a.chirurgien) model.chirurgien = a.chirurgien;
      if (Number(a.salle_fermee)   === 1) model.flags.salle_fermee   = 1;
      if (Number(a.ferme_degrade)  === 1) model.flags.ferme_degrade  = 1;
      if (Number(a.urgence_fermee) === 1) model.flags.urgence_fermee = 1;
      const isInterim = String(a.ide || "").toUpperCase() === "INTERIMAIRE";
      if (a.role === "INSTRU"  && Number(a.doublure) !== 1) {
        model.instru.ide         = a.ide || "";
        model.instru.ouverture   = Number(a.ouverture) === 1 ? 1 : 0;
        model.instru.nuit        = Number(a.nuit)      === 1 ? 1 : 0;
        model.instru.interimaire = isInterim ? 1 : 0;
      }
      if (a.role === "PANSEUR" && Number(a.doublure) !== 1) {
        model.panseur.ide         = a.ide || "";
        model.panseur.ouverture   = Number(a.ouverture) === 1 ? 1 : 0;
        model.panseur.nuit        = Number(a.nuit)      === 1 ? 1 : 0;
        model.panseur.interimaire = isInterim ? 1 : 0;
      }
      if (a.role === "INSTRU"  && Number(a.doublure) === 1) {
        model.doublureInstru.ide         = a.ide || "";
        model.doublureInstru.ouverture   = Number(a.ouverture) === 1 ? 1 : 0;
        model.doublureInstru.interimaire = isInterim ? 1 : 0;
      }
      if (a.role === "PANSEUR" && Number(a.doublure) === 1) {
        model.doublurePanseur.ide         = a.ide || "";
        model.doublurePanseur.ouverture   = Number(a.ouverture) === 1 ? 1 : 0;
        model.doublurePanseur.interimaire = isInterim ? 1 : 0;
      }
      if (a.role === "ETUDIANT") model.etudiant = a.ide || "";
    }
    return { ...model, existingCount: existing.length };
  }

  function hydrateTerrainModalFromSlot(model) {
    const isCouloir = model.type === "COULOIR";
    $("modalViewCouloir")?.classList.toggle("d-none", !isCouloir);
    $("modalViewSalle")?.classList.toggle("d-none",   isCouloir);
    $("btnCopySlotCreneaux")?.classList.toggle("d-none", isCouloir);

    if (isCouloir) {
      __couloirEquipe = (model.equipe || []).map(e => ({ ...e }));
      if (__couloirEquipe.length === 0) __couloirEquipe.push({ ide: "", ouverture: 0, visceral: 0 });
      refreshCouloirList();
      return;
    }

    const { jour, creneau } = model.slotKey;

    // BUG C — Ouverture = MATIN uniquement. Masquer les switches si créneau !== MATIN.
    const isMatin = String(creneau || "").toUpperCase() === "MATIN";
    const instruOuvWrap  = $("checkboxOuvertureInstru")?.closest(".form-check.form-switch, .form-check");
    const panseurOuvWrap = $("checkboxOuverturePanseur")?.closest(".form-check.form-switch, .form-check");
    if (instruOuvWrap)  instruOuvWrap.classList.toggle("d-none",  !isMatin);
    if (panseurOuvWrap) panseurOuvWrap.classList.toggle("d-none", !isMatin);
    // Wrapper doublure ouverture (IDs ajoutés dans le HTML)
    $("doublureInstruOuvWrapper") ?.classList.toggle("d-none", !isMatin);
    $("doublurePanseurOuvWrapper")?.classList.toggle("d-none", !isMatin);

    // Nuit : hydrater les checkboxes
    if ($("checkboxNuitInstru"))  $("checkboxNuitInstru").checked  = model.instru.nuit  === 1;
    if ($("checkboxNuitPanseur")) $("checkboxNuitPanseur").checked = model.panseur.nuit === 1;
    // Avertissement doublon nuit (lecture seule — autre IDE déjà marquée nuit ce jour)
    checkNuitDoublon(model.slotKey?.jour, model.slotKey?.creneau, model.slotKey?.secteur, model.slotKey?.salle);

    const cbFerme = $("checkboxSalleFermee");
    if (cbFerme) {
      cbFerme.checked = model.flags?.salle_fermee === 1;
      $("salleContent")?.classList.toggle("d-none", cbFerme.checked);
      $("fermeDegradesSection")?.classList.toggle("d-none", !cbFerme.checked);
      const cbDegrade = $("checkboxFermeDegrade");
      if (cbDegrade) cbDegrade.checked = model.flags?.ferme_degrade === 1;
    }

    const selChir = $("selectChirurgien");
    if (selChir) {
      fillSelectChirurgienAvailable(selChir, jour, creneau, model.slotKey.salle);
      selChir.value = model.chirurgien || "";
    }

    fillSelectIDEAvailable($("selectInstru"), jour, creneau, model.instru.ide);
    if ($("selectInstru")) $("selectInstru").value = model.instru.ide || "";
    if ($("checkboxOuvertureInstru")) $("checkboxOuvertureInstru").checked = model.instru.ouverture === 1;
    if ($("checkboxInstruInterim")) {
      $("checkboxInstruInterim").checked = model.instru.interimaire === 1;
      if (model.instru.interimaire === 1 && $("selectInstru")) $("selectInstru").disabled = true;
    }

    const hasDoublureInstru = !!model.doublureInstru?.ide;
    $("doublureInstruBlock")?.classList.toggle("d-none", !hasDoublureInstru);
    $("btnToggleDoublureInstru")?.classList.toggle("d-none", hasDoublureInstru);
    if (hasDoublureInstru) {
      fillSelectIDEAvailable($("selectDoublureInstru"), jour, creneau, model.doublureInstru?.ide);
      if ($("selectDoublureInstru")) $("selectDoublureInstru").value = model.doublureInstru.ide || "";
      if ($("checkboxDoublureInstruOuv"))   $("checkboxDoublureInstruOuv").checked   = model.doublureInstru.ouverture   === 1;
      if ($("checkboxDoublureInstruInterim")) {
        $("checkboxDoublureInstruInterim").checked = model.doublureInstru.interimaire === 1;
        if (model.doublureInstru.interimaire === 1 && $("selectDoublureInstru"))
          $("selectDoublureInstru").disabled = true;
      }
    }

    fillSelectIDEAvailable($("selectPanseur"), jour, creneau, model.panseur.ide);
    if ($("selectPanseur")) $("selectPanseur").value = model.panseur.ide || "";
    if ($("checkboxOuverturePanseur")) $("checkboxOuverturePanseur").checked = model.panseur.ouverture === 1;
    if ($("checkboxPanseurInterim")) {
      $("checkboxPanseurInterim").checked = model.panseur.interimaire === 1;
      if (model.panseur.interimaire === 1 && $("selectPanseur")) $("selectPanseur").disabled = true;
    }

    const hasDoublurePanseur = !!model.doublurePanseur?.ide;
    $("doublurePanseurBlock")?.classList.toggle("d-none", !hasDoublurePanseur);
    $("btnToggleDoublurePanseur")?.classList.toggle("d-none", hasDoublurePanseur);
    if (hasDoublurePanseur) {
      fillSelectIDEAvailable($("selectDoublurePanseur"), jour, creneau, model.doublurePanseur?.ide);
      if ($("selectDoublurePanseur")) $("selectDoublurePanseur").value = model.doublurePanseur.ide || "";
      if ($("checkboxDoublurePanseurOuv"))   $("checkboxDoublurePanseurOuv").checked   = model.doublurePanseur.ouverture   === 1;
      if ($("checkboxDoublurePanseurInterim")) {
        $("checkboxDoublurePanseurInterim").checked = model.doublurePanseur.interimaire === 1;
        if (model.doublurePanseur.interimaire === 1 && $("selectDoublurePanseur"))
          $("selectDoublurePanseur").disabled = true;
      }
    }

    // Étudiant : checkbox seule → stocke code "ETUDIANT" (comme intérimaire → "INTERIMAIRE")
    if ($("checkboxEtudiant")) $("checkboxEtudiant").checked = !!model.etudiant;
    $("etudiantSelectWrapper")?.classList.add("d-none"); // sélect masqué en permanence

    checkIrrationnel();
  }

  function readTerrainModalToSlotModel(slotKey) {
    const isCouloir = String(slotKey.secteur || "").toUpperCase() === "COULOIR";

    if (isCouloir) {
      document.querySelectorAll("#couloirEquipeList [data-couloir-idx]").forEach(row => {
        const idx = Number(row.dataset.couloirIdx);
        const sel = row.querySelector("select");
        if (sel && __couloirEquipe[idx]) __couloirEquipe[idx].ide = sel.value;
      });
      return { type: "COULOIR", slotKey: { ...slotKey }, equipe: __couloirEquipe.filter(e => e.ide) };
    }

    const isFerme = $("checkboxSalleFermee")?.checked === true;
    return {
      type: "SALLE", slotKey: { ...slotKey },
      chirurgien: $("selectChirurgien")?.value || "",
      instru:  { ide: $("selectInstru")?.value || "",  ouverture: $("checkboxOuvertureInstru")?.checked ? 1 : 0, nuit: $("checkboxNuitInstru")?.checked  ? 1 : 0, interimaire: $("checkboxInstruInterim")?.checked  ? 1 : 0 },
      panseur: { ide: $("selectPanseur")?.value || "", ouverture: $("checkboxOuverturePanseur")?.checked ? 1 : 0, nuit: $("checkboxNuitPanseur")?.checked ? 1 : 0, interimaire: $("checkboxPanseurInterim")?.checked ? 1 : 0 },
      doublureInstru:  {
        ide: !$("doublureInstruBlock")?.classList.contains("d-none") ? ($("selectDoublureInstru")?.value  || "") : "",
        ouverture:  $("checkboxDoublureInstruOuv")?.checked   ? 1 : 0,
        interimaire: $("checkboxDoublureInstruInterim")?.checked  ? 1 : 0
      },
      doublurePanseur: {
        ide: !$("doublurePanseurBlock")?.classList.contains("d-none") ? ($("selectDoublurePanseur")?.value || "") : "",
        ouverture:  $("checkboxDoublurePanseurOuv")?.checked  ? 1 : 0,
        interimaire: $("checkboxDoublurePanseurInterim")?.checked ? 1 : 0
      },
      etudiant: $("checkboxEtudiant")?.checked ? "ETUDIANT" : "",
      flags: { salle_fermee: isFerme ? 1 : 0, ferme_degrade: (isFerme && $("checkboxFermeDegrade")?.checked) ? 1 : 0, urgence_fermee: 0 }
    };
  }

  async function replaceSlotWithModel(slotKey, model, { confirmIfExisting = true } = {}) {
    const week = PlanningEngine.getCurrentWeek();
    if (!week || !Array.isArray(week.affectations)) throw new Error("Semaine non chargée");

    const existing = getSlotAffectations(slotKey);

    if (confirmIfExisting && existing.length > 0) {
      const ok = confirm("Ce créneau contient déjà des affectations. Les remplacer ?");
      if (!ok) return { replaced: false, reason: "cancelled" };
    }

    week.affectations = week.affectations.filter(a =>
      !(String(a.jour||"") === String(slotKey.jour||"") && String(a.creneau||"") === String(slotKey.creneau||"")
      && String(a.secteur||"") === String(slotKey.secteur||"") && String(a.salle??"") === String(slotKey.salle??""))
    );

    async function addAtom(props) {
      if (!props.ide) return;
      await PlanningEngine.addAffectation({
        jour: slotKey.jour, creneau: slotKey.creneau, secteur: slotKey.secteur, salle: slotKey.salle || "",
        chirurgien:     props.chirurgien     || "",
        ide:            props.ide,
        role:           props.role,
        ouverture:      props.ouverture      || 0,
        visceral:       props.visceral       || 0,
        doublure:       props.doublure       || 0,
        doublure_sous:  props.doublure_sous  || "",
        salle_fermee:   props.salle_fermee   || 0,
        ferme_degrade:  props.ferme_degrade  || 0,
        nuit:           props.nuit           || 0,
        urgence_fermee: props.urgence_fermee || 0
      });
    }

    if (model.type === "COULOIR") {
      for (const entry of (model.equipe || [])) {
        if (!entry.ide) continue;
        await addAtom({ ide: entry.ide, role: "COULOIR", ouverture: entry.ouverture || 0, visceral: entry.visceral || 0, nuit: entry.nuit || 0 });
      }
      // Si equipe vide (tous supprimés), addAtom n'a pas appelé save() — forcer la persistance
      if ((model.equipe || []).filter(e => e.ide).length === 0) {
        await PlanningEngine.saveCurrentWeek();
      }
      return { replaced: true };
    }

    const flags = model.flags || {};
    const chir  = model.chirurgien || "";

    // Sentinelle salle fermée (bypass addAtom qui ignore ide vide)
    if (flags.salle_fermee === 1) {
      await PlanningEngine.addAffectation({
        jour: slotKey.jour, creneau: slotKey.creneau, secteur: slotKey.secteur, salle: slotKey.salle || "",
        chirurgien: "", ide: "", role: "SALLE",
        ouverture: 0, visceral: 0, doublure: 0, doublure_sous: "", salle_fermee: 1, ferme_degrade: flags.ferme_degrade || 0, urgence_fermee: 0
      });
      return { replaced: true };
    }

    await addAtom({ ide: model.instru.ide,    role: "INSTRU",  chirurgien: chir, ouverture: model.instru.ouverture  || 0, nuit: model.instru.nuit  || 0 });
    if (model.doublureInstru?.ide)
      await addAtom({ ide: model.doublureInstru.ide,  role: "INSTRU",  chirurgien: chir, doublure: 1, doublure_sous: "INSTRU",  ouverture: model.doublureInstru.ouverture  || 0 });
    await addAtom({ ide: model.panseur.ide,   role: "PANSEUR", chirurgien: chir, ouverture: model.panseur.ouverture || 0, nuit: model.panseur.nuit || 0 });
    if (model.doublurePanseur?.ide)
      await addAtom({ ide: model.doublurePanseur.ide, role: "PANSEUR", chirurgien: chir, doublure: 1, doublure_sous: "PANSEUR", ouverture: model.doublurePanseur.ouverture || 0 });
    if (model.etudiant)
      await addAtom({ ide: model.etudiant, role: "ETUDIANT", chirurgien: chir });

    return { replaced: true };
  }

  async function propagateToOtherCreneaux(slotKey, model) {
    if (model.type !== "SALLE") return;
    const creneaux = (window.PlanningSchema && window.PlanningSchema.CRENEAUX) || [];
    for (const creneau of creneaux.filter(c => c !== slotKey.creneau)) {
      const targetKey = { ...slotKey, creneau };
      await replaceSlotWithModel(targetKey, { ...model, slotKey: targetKey }, { confirmIfExisting: false });
    }
  }

  function openTerrainModalForSlot(slotKey) {
    const slotModel = buildSlotModelFromExisting(slotKey);
    hydrateTerrainModalFromSlot(slotModel);

    const label = $("modalContextLabel");
    if (label) {
      const sallePart = slotKey.secteur === "SALLE" ? " — Salle " + slotKey.salle : "";
      label.textContent = `${slotKey.jour} — ${slotKey.creneau} — ${slotKey.secteur}${sallePart}`;
    }

    __currentSlotKey = { ...slotKey };

    const modalEl = getModalEl();
    if (!modalEl) { toast("Modale introuvable"); return; }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function getCurrentSlotKey() { return __currentSlotKey; }

  // ── copySlotToOtherCreneaux ───────────────────────────────────────────────
  // Enregistre d'abord le slot courant, puis copie vers les autres créneaux vides.
  async function copySlotToOtherCreneaux() {
    if (!__currentSlotKey) { toast("Cliquez d'abord sur une cellule du planning"); return; }

    const model = readTerrainModalToSlotModel(__currentSlotKey);
    if (model.type !== "SALLE") { toast("Copie disponible uniquement pour les salles"); return; }

    // Sauvegarder d'abord le créneau courant
    try {
      await replaceSlotWithModel(__currentSlotKey, model, { confirmIfExisting: false });
    } catch (e) {
      console.error("copySlot: erreur save courant", e);
      toast("Le créneau n'a pu être sauvegardé — réessayez");
      return;
    }

    // Lister les autres créneaux depuis les données semaine réelles
    const week = PlanningEngine.getCurrentWeek();
    if (!week) { toast("Chargez d'abord une semaine pour continuer"); return; }

    // Obtenir les créneaux depuis le schema ou depuis les affectations existantes
    const creneaux = window.PlanningSchema?.CRENEAUX?.length
      ? window.PlanningSchema.CRENEAUX
      : [...new Set(week.affectations.map(a => a.creneau).filter(Boolean))];

    const others = creneaux.filter(c => c !== __currentSlotKey.creneau);

    let copied = 0;
    let skipped = 0;
    for (const creneau of others) {
      const targetKey = { ...__currentSlotKey, creneau };
      try {
        const existing = getSlotAffectations(targetKey);
        if (existing.length > 0) { skipped++; continue; }
        await replaceSlotWithModel(targetKey, { ...model, slotKey: targetKey }, { confirmIfExisting: false });
        copied++;
      } catch (e) {
        console.error("copySlot: erreur sur créneau", creneau, e);
        skipped++;
      }
    }

    await doLoadWeekAndRender();

    const msg = copied > 0
      ? `Copié vers ${copied} créneau(x)` + (skipped > 0 ? ` — ${skipped} ignoré(s)` : "")
      : `Aucun créneau vide disponible (${skipped} déjà rempli(s) ou erreur)`;
    toast(msg);
  }

  // ── openCloseSallesModal ──────────────────────────────────────────────────
  // Peuple la grille avant affichage. PAS de .show() ici (déclenché par show.bs.modal).
  function openCloseSallesModal() {
    const week = PlanningEngine.getCurrentWeek();
    if (!week) { toast("Chargez d'abord une semaine pour continuer"); return; }

    // Jours semaine uniquement (filtre week-end, insensible à la casse)
    const SEMAINE_RE = /^(lundi|mardi|mercredi|jeudi|vendredi)$/i;
    const allJours   = window.PlanningSchema?.JOURS?.length
                     ? window.PlanningSchema.JOURS
                     : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    const jours    = allJours.filter(j => SEMAINE_RE.test(String(j)));
    const creneaux = (window.PlanningSchema?.CRENEAUX?.length)
                   ? window.PlanningSchema.CRENEAUX
                   : ["Matin", "Après-midi"];
    const salles   = _deps?.getStrictSalles?.() || ["05","06","07","08"];

    const tbody = $("closeSallesBody");
    const thead = $("closeSallesThead");
    if (!tbody || !thead) return;

    const cols = [];
    jours.forEach((jour, ji) => {
      creneaux.forEach((creneau, ci) => {
        cols.push({ jour, creneau, firstOfDay: ci === 0 });
      });
    });

    // ── Ligne 1 : en-têtes jours (colspan = nb créneaux, fond coloré)
    thead.innerHTML = "";
    const trJours = document.createElement("tr");
    const thCorner = document.createElement("th");
    thCorner.textContent = "";
    trJours.appendChild(thCorner);
    jours.forEach(jour => {
      const th = document.createElement("th");
      th.colSpan = creneaux.length;
      th.className = "text-center fw-bold py-1 cs-jour-header cs-day-start";
      th.textContent = jour;
      trJours.appendChild(th);
    });
    thead.appendChild(trJours);

    // ── Ligne 2 : sous-en-têtes créneaux
    const trCreneaux = document.createElement("tr");
    const thSalle = document.createElement("th");
    thSalle.textContent = "Salle";
    thSalle.className = "text-center align-middle";
    trCreneaux.appendChild(thSalle);
    cols.forEach(col => {
      const th = document.createElement("th");
      th.className = "text-center small text-muted fw-normal py-1"
        + (col.firstOfDay ? " cs-day-start" : "");
      th.textContent = col.creneau;
      trCreneaux.appendChild(th);
    });
    thead.appendChild(trCreneaux);

    // ── Ligne 3 : "Tout" cocher colonne entière
    const trAll = document.createElement("tr");
    const tdAllLabel = document.createElement("td");
    tdAllLabel.className = "text-end small text-muted pe-2 py-1";
    tdAllLabel.textContent = "Tout";
    trAll.appendChild(tdAllLabel);
    cols.forEach((col, ci) => {
      const td = document.createElement("td");
      td.className = "text-center py-1"
        + (col.firstOfDay ? " cs-day-start" : "");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "form-check-input";
      cb.dataset.colIdx = String(ci);
      cb.title = `Tout cocher ${col.jour} ${col.creneau}`;
      cb.addEventListener("change", () => {
        document.querySelectorAll(`#closeSallesBody input[data-col-idx="${ci}"]:not(:disabled)`)
          .forEach(el => el.checked = cb.checked);
      });
      td.appendChild(cb);
      trAll.appendChild(td);
    });
    thead.appendChild(trAll);

    // ── Corps : une ligne compacte par salle
    tbody.innerHTML = "";
    for (const salle of salles) {
      const tr = document.createElement("tr");
      const tdLabel = document.createElement("td");
      tdLabel.className = "fw-semibold text-center align-middle py-1 small";
      tdLabel.textContent = "Salle " + salle;
      tr.appendChild(tdLabel);

      cols.forEach((col, ci) => {
        const slotKey = { jour: col.jour, creneau: col.creneau, secteur: "SALLE", salle: String(salle) };
        const filled  = getSlotAffectations(slotKey).length > 0;
        const td = document.createElement("td");
        td.className = "text-center align-middle py-1"
          + (col.firstOfDay ? " cs-day-start" : "")
          + (filled ? " cs-cell-pourvu" : "");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "form-check-input";
        cb.dataset.jour    = col.jour;
        cb.dataset.creneau = col.creneau;
        cb.dataset.salle   = String(salle);
        cb.dataset.colIdx  = String(ci);
        if (filled) {
          cb.disabled = true;
          cb.title = "Déjà rempli";
        }
        td.appendChild(cb);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
  }

  // ── closeSallesSelection ──────────────────────────────────────────────────
  // Ferme les slots cochés dans la modale.
  async function closeSallesSelection() {
    const checked = document.querySelectorAll("#closeSallesBody input[type=checkbox]:checked:not(:disabled)");
    if (checked.length === 0) { toast("Sélectionnez au moins un créneau pour continuer"); return; }

    let count = 0;
    for (const cb of checked) {
      const slotKey = { jour: cb.dataset.jour, creneau: cb.dataset.creneau, secteur: "SALLE", salle: cb.dataset.salle };
      await PlanningEngine.addAffectation({
        ...slotKey, chirurgien: "", ide: "", role: "SALLE",
        ouverture: 0, visceral: 0, doublure: 0, doublure_sous: "",
        salle_fermee: 1, urgence_fermee: 0
      });
      count++;
    }

    bootstrap.Modal.getOrCreateInstance($("modalCloseSalles")).hide();
    await doLoadWeekAndRender();
    toast(`${count} salle(s) fermée(s)`);
    return count;
  }

  function initModalEvents() {
    if (!hasTerrainModal()) return;

    $("checkboxSalleFermee")?.addEventListener("change", () => {
      const checked = $("checkboxSalleFermee").checked;
      $("salleContent")?.classList.toggle("d-none", checked);
      $("fermeDegradesSection")?.classList.toggle("d-none", !checked);
      if (!checked && $("checkboxFermeDegrade")) $("checkboxFermeDegrade").checked = false;
    });

    $("btnToggleDoublureInstru")?.addEventListener("click", () => {
      $("doublureInstruBlock")?.classList.remove("d-none");
      $("btnToggleDoublureInstru")?.classList.add("d-none");
      fillSelectIDEAvailable($("selectDoublureInstru"), __currentSlotKey?.jour, __currentSlotKey?.creneau);
      checkIrrationnel();
    });
    $("btnRemoveDoublureInstru")?.addEventListener("click", () => {
      $("doublureInstruBlock")?.classList.add("d-none");
      $("btnToggleDoublureInstru")?.classList.remove("d-none");
      if ($("selectDoublureInstru")) { $("selectDoublureInstru").value = ""; $("selectDoublureInstru").disabled = false; }
      if ($("checkboxDoublureInstruInterim")) $("checkboxDoublureInstruInterim").checked = false;
      checkIrrationnel();
    });

    $("btnToggleDoublurePanseur")?.addEventListener("click", () => {
      $("doublurePanseurBlock")?.classList.remove("d-none");
      $("btnToggleDoublurePanseur")?.classList.add("d-none");
      fillSelectIDEAvailable($("selectDoublurePanseur"), __currentSlotKey?.jour, __currentSlotKey?.creneau);
      checkIrrationnel();
    });
    $("btnRemoveDoublurePanseur")?.addEventListener("click", () => {
      $("doublurePanseurBlock")?.classList.add("d-none");
      $("btnToggleDoublurePanseur")?.classList.remove("d-none");
      if ($("selectDoublurePanseur")) { $("selectDoublurePanseur").value = ""; $("selectDoublurePanseur").disabled = false; }
      if ($("checkboxDoublurePanseurInterim")) $("checkboxDoublurePanseurInterim").checked = false;
      checkIrrationnel();
    });

    $("checkboxEtudiant")?.addEventListener("change", () => {
      // Pas de select — la présence de l'étudiant est binaire (code "ETUDIANT")
      checkIrrationnel();
    });

    // Nuit — avertissement doublon à chaque changement
    ["checkboxNuitInstru", "checkboxNuitPanseur"].forEach(id => {
      $(id)?.addEventListener("change", () => {
        checkNuitDoublon(__currentSlotKey?.jour, __currentSlotKey?.creneau, __currentSlotKey?.secteur, __currentSlotKey?.salle);
      });
    });

    $("btnAddCouloirIDE")?.addEventListener("click", () => {
      __couloirEquipe.push({ ide: "", ouverture: 0, visceral: 0 });
      refreshCouloirList();
    });

    wireInterimCheckbox("checkboxInstruInterim",          "selectInstru");
    wireInterimCheckbox("checkboxPanseurInterim",         "selectPanseur");
    wireInterimCheckbox("checkboxDoublureInstruInterim",  "selectDoublureInstru");
    wireInterimCheckbox("checkboxDoublurePanseurInterim", "selectDoublurePanseur");

    // M4 — Warning INSTRU = PANSEUR même slot
    (function wireInstruPanseurWarning() {
      const selI = $("selectInstru");
      const selP = $("selectPanseur");
      const warn = $("warnInstruPanseur");
      if (!selI || !selP || !warn) return;
      const PLACEHOLDERS = ["INTERIMAIRE", "ETUDIANT", "VISCERAL", ""];
      function check() {
        const v1 = selI.value, v2 = selP.value;
        const same = v1 && v2 && v1 === v2 && !PLACEHOLDERS.includes(v1);
        warn.classList.toggle("d-none", !same);
      }
      selI.addEventListener("change", check);
      selP.addEventListener("change", check);
    })();

    $("btnCopySlotCreneaux")?.addEventListener("click", () => copySlotToOtherCreneaux());

    $("btnSaveAffectation")?.addEventListener("click", async () => {
      try {
        if (!__currentSlotKey) { toast("Clique d'abord sur une cellule."); return; }

        const model = readTerrainModalToSlotModel(__currentSlotKey);
        const res   = await replaceSlotWithModel(__currentSlotKey, model, { confirmIfExisting: true });

        if (res?.replaced === false && res?.reason === "cancelled") { toast("Remplacement annulé — les affectations restent inchangées"); return; }

        const modalEl = getModalEl();
        if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        __currentSlotKey = null;

        await doLoadWeekAndRender();
        toast("Slot mis à jour");
      } catch (e) {
        toast(e?.message || String(e));
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────────────────────────

  window.PlanningSlotEditor = Object.freeze({
    // Legacy
    setDeps,
    getSlotAffectations,
    buildSlotModel,
    hydrateModal,
    replaceSlot,
    // Terrain V2
    hasTerrainModal,
    openTerrainModalForSlot,
    replaceSlotWithModel,
    propagateToOtherCreneaux,
    getCurrentSlotKey,
    initModalEvents,
    fillSelectIDEAvailable,
    fillSelectChirurgienAvailable,
    copySlotToOtherCreneaux,
    openCloseSallesModal,
    closeSallesSelection
  });

})();