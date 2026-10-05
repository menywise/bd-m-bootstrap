/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT  : Planning Engine
   FILE     : ui/planning-batch-modals.js
   VERSION  : 2.1.0
   DATE     : 2026-03-01

   v2.1 — Respect des créneaux fermés :
     Les créneaux portant salle_fermee=1 sont affichés verrouillés (🔒 Fermé)
     dans les modales Chirurgiens et IDEs. Aucune saisie possible, aucun écrasement.

   v2.0 — Auto-save silencieux au changement de jour.

   DÉPENDANCES :
     - planning-schema.js  → PlanningSchema
     - planning-engine.js  → PlanningEngine
     - planning-members.js → PlanningMembers
     - cds-storage.js      → CDS_Storage

   HOOK OUT : window.PlanningController?.loadWeekAndRender?.() au Terminer
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const JOURS   = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI"];
  const JOUR_FR = { LUNDI:"Lundi", MARDI:"Mardi", MERCREDI:"Mercredi", JEUDI:"Jeudi", VENDREDI:"Vendredi" };
  const CRENEAUX = ["MATIN","APREM","SOIR"];

  function getSalles() {
    const s = PlanningSchema?.SALLES;
    return Array.isArray(s) && s.length ? s : ["05","06","07","08"];
  }

  function $(id) { return document.getElementById(id); }

  function toast(msg) {
    const el = $("toastInfo");
    if (!el) return;
    const body = el.querySelector(".toast-body");
    if (body) body.textContent = String(msg ?? "");
    new bootstrap.Toast(el).show();
  }

  function display(code) {
    if (!code) return "—";
    return PlanningMembers?.display?.(code) || code;
  }

  function getIDEs()        { return PlanningMembers?.getIDEs?.(true)     || []; }
  function getChirurgiens() { return PlanningMembers?.getMedecins?.(true) || []; }

  // ── State semaine ─────────────────────────────────────────────────────────

  let _currentWeek    = null;
  let _currentSemaine = null;
  let _currentAnnee   = null;

  async function syncFromPlanning() {
    const semaine = Number($("weekInput")?.value || 0);
    const annee   = Number($("yearInput")?.value  || 0);
    if (!semaine || !annee) return false;
    const data = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    _currentSemaine = semaine;
    _currentAnnee   = annee;
    _currentWeek    = data ? { meta: data.meta, affectations: [...(data.affectations || [])] } : null;
    return true;
  }

  function getAffectations() { return _currentWeek?.affectations || []; }

  function getSlotAtoms(jour, creneau, secteur, salle) {
    return getAffectations().filter(a =>
      String(a.jour    ||"").toUpperCase() === String(jour    ||"").toUpperCase() &&
      String(a.creneau ||"").toUpperCase() === String(creneau ||"").toUpperCase() &&
      String(a.secteur ||"").toUpperCase() === String(secteur ||"").toUpperCase() &&
      (salle === undefined || String(a.salle ?? "") === String(salle ?? ""))
    );
  }

  // Détecte si un créneau salle est fermé (salle_fermee=1)
  function isCreneauFerme(jour, creneau, salle) {
    return getSlotAtoms(jour, creneau, "SALLE", salle).some(a => Number(a.salle_fermee) === 1);
  }

  // Supprime uniquement les atomes chirurgien purs (role:"") d'un slot.
  // Ne touche PAS les atomes IDEs (role:"INSTRU"/"PANSEUR") — évite de détruire les IDEs déjà saisis.
  function clearChirSlot(jour, creneau, salle) {
    if (!_currentWeek?.affectations) return;
    _currentWeek.affectations = _currentWeek.affectations.filter(a =>
      !(String(a.jour    || "").toUpperCase() === String(jour    || "").toUpperCase() &&
        String(a.creneau || "").toUpperCase() === String(creneau || "").toUpperCase() &&
        String(a.secteur || "").toUpperCase() === "SALLE" &&
        String(a.salle   ?? "")               === String(salle   ?? "") &&
        String(a.role    || "")               === "")          // atomes chirurgien purs uniquement
    );
  }

  function clearSlot(jour, creneau, secteur, salle) {
    if (!_currentWeek?.affectations) return;
    _currentWeek.affectations = _currentWeek.affectations.filter(a =>
      !(String(a.jour    ||"").toUpperCase() === String(jour    ||"").toUpperCase() &&
        String(a.creneau ||"").toUpperCase() === String(creneau ||"").toUpperCase() &&
        String(a.secteur ||"").toUpperCase() === String(secteur ||"").toUpperCase() &&
        (salle === undefined || String(a.salle ?? "") === String(salle ?? "")))
    );
  }

  function addAtom(obj) {
    if (!_currentWeek) return;
    if (!_currentWeek.affectations) _currentWeek.affectations = [];
    _currentWeek.affectations.push({
      jour:           obj.jour           || "",
      creneau:        obj.creneau        || "",
      secteur:        obj.secteur        || "",
      salle:          obj.salle          ?? "",
      chirurgien:     obj.chirurgien     || "",
      ide:            obj.ide            || "",
      role:           obj.role           || "",
      ouverture:      obj.ouverture      || 0,
      visceral:       obj.visceral       || 0,
      doublure:       obj.doublure       || 0,
      doublure_sous:  obj.doublure_sous  || "",
      salle_fermee:   obj.salle_fermee   || 0,
      urgence_fermee: obj.urgence_fermee || 0
    });
  }

  async function saveWeekBack() {
    if (!_currentSemaine || !_currentAnnee) return false;
    const DB = window.bdb;
    const { data: sem, error: errS } = await DB
      .from('planning_semaines').select('id')
      .eq('annee', _currentAnnee).eq('semaine', _currentSemaine)
      .maybeSingle();
    if (errS || !sem) return false;
    await DB.from('planning_affectations').delete().eq('semaine_id', sem.id).select();
    const affs = (_currentWeek?.affectations || []);
    if (affs.length > 0) {
      const rows = affs.map(a => ({
        semaine_id:     sem.id,
        jour:           a.jour || '',
        creneau:        a.creneau || '',
        secteur:        a.secteur || '',
        salle:          a.salle || null,
        chirurgien:     a.chirurgien || null,
        ide:            a.ide || null,
        role:           a.role || '',
        ouverture:      a.ouverture      ? 1 : 0,
        visceral:       a.visceral       ? 1 : 0,
        doublure:       a.doublure       ? 1 : 0,
        doublure_sous:  a.doublure_sous  || '',
        nuit:           a.nuit           ? 1 : 0,
        salle_fermee:   a.salle_fermee   ? 1 : 0,
        ferme_degrade:  a.ferme_degrade  ? 1 : 0,
        urgence_fermee: a.urgence_fermee ? 1 : 0
      }));
      await DB.from('planning_affectations').insert(rows).select();
    }
    await PlanningEngine.loadOrCreateWeek(_currentSemaine, _currentAnnee);
    return true;
  }

  async function afterSave() {
    await saveWeekBack();
    if (typeof window.PlanningController?.loadWeekAndRender === "function") {
      await window.PlanningController.loadWeekAndRender();
    }
  }

  // ── Build cellule verrouillée (créneau fermé) ─────────────────────────────

  // Retourne un <td> affichant le verrou, sans select — _collect* skippera naturellement
  function buildLockedTd() {
    const td = document.createElement("td");
    td.innerHTML = '<div class="plan-batch-creneau-ferme"><i class="bi bi-lock-fill me-1"></i>Fermé</div>';
    return td;
  }

  // ── Tracking jours sauvegardés ────────────────────────────────────────────

  let _chirSavedDays    = new Set();
  let _ideSavedDays     = new Set();
  let _couloirSavedDays = new Set();

  function markDaySaved(selectorId, jour, savedSet) {
    savedSet.add(jour);
    const container = $(selectorId);
    if (!container) return;
    container.querySelectorAll("button[data-jour]").forEach(btn => {
      if (btn.dataset.jour === jour) btn.classList.add("plan-batch-jour-saved");
    });
  }

  function resetSavedDays(selectorId, savedSet) {
    savedSet.clear();
    const container = $(selectorId);
    if (!container) return;
    container.querySelectorAll("button[data-jour]").forEach(btn => {
      btn.classList.remove("plan-batch-jour-saved");
    });
  }

  // ── Sélecteur de jour — async ─────────────────────────────────────────────

  function wireJourSelector(selectorId, labelId, onChangeFn) {
    const container = $(selectorId);
    if (!container) return;

    container.addEventListener("click", async e => {
      const btn = e.target.closest("button[data-jour]");
      if (!btn) return;
      container.querySelectorAll("button").forEach(b => {
        const wasSaved = b.classList.contains("plan-batch-jour-saved");
        b.className = "btn btn-sm " + (b === btn ? "btn-secondary active" : "btn-outline-secondary");
        if (wasSaved) b.classList.add("plan-batch-jour-saved");
      });
      const lbl = $(labelId);
      if (lbl) lbl.textContent = JOUR_FR[btn.dataset.jour] || btn.dataset.jour;
      await onChangeFn(btn.dataset.jour);
    });

    const first = container.querySelector("button[data-jour]");
    if (first) first.click();
  }

  // ── Build selects ─────────────────────────────────────────────────────────

  function buildSelectChir(value) {
    const sel = document.createElement("select");
    sel.className = "form-select form-select-sm";
    sel.innerHTML = '<option value="">—</option>';
    for (const code of getChirurgiens()) {
      const opt = document.createElement("option");
      opt.value = code; opt.textContent = display(code);
      sel.appendChild(opt);
    }
    if (value) sel.value = value;
    return sel;
  }

  function buildSelectIDE(value) {
    const sel = document.createElement("select");
    sel.className = "form-select form-select-sm";
    sel.innerHTML = '<option value="">—</option>';
    for (const ph of ["INTERIMAIRE","ETUDIANT","VISCERAL"]) {
      const opt = document.createElement("option");
      opt.value = ph; opt.textContent = display(ph);
      sel.appendChild(opt);
    }
    for (const code of getIDEs()) {
      const opt = document.createElement("option");
      opt.value = code; opt.textContent = display(code);
      sel.appendChild(opt);
    }
    if (value) sel.value = value;
    return sel;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODALE 1 — CHIRURGIENS
  // ══════════════════════════════════════════════════════════════════════════

  let _chirJour = "LUNDI";

  function buildTableChir(jour) {
    const tbody = $("batchTbodyChir");
    if (!tbody) return;
    tbody.innerHTML = "";

    for (const salle of getSalles()) {
      // Lire données existantes
      const chirMatin = getSlotAtoms(jour,"MATIN","SALLE",salle).find(a => a.chirurgien)?.chirurgien || "";
      const chirAprem = getSlotAtoms(jour,"APREM","SALLE",salle).find(a => a.chirurgien)?.chirurgien || "";
      const chirSoir  = getSlotAtoms(jour,"SOIR", "SALLE",salle).find(a => a.chirurgien)?.chirurgien || "";

      // Détecter créneaux fermés
      const matinFerme = isCreneauFerme(jour, "MATIN", salle);
      const apremFerme = isCreneauFerme(jour, "APREM", salle);
      const soirFerme  = isCreneauFerme(jour, "SOIR",  salle);

      const tr = document.createElement("tr");
      tr.dataset.salle = String(salle);

      const tdLabel = document.createElement("td");
      tdLabel.className = "row-label";
      tdLabel.textContent = `Salle ${salle}`;
      tr.appendChild(tdLabel);

      // ── Matin ──────────────────────────────────────────────────────────
      if (matinFerme) {
        tr.appendChild(buildLockedTd());
      } else {
        const tdMatin  = document.createElement("td");
        const selMatin = buildSelectChir(chirMatin);
        selMatin.dataset.role = "matin";
        selMatin.addEventListener("change", () => syncAmIfChecked(tr));
        tdMatin.appendChild(selMatin);
        tr.appendChild(tdMatin);
      }

      // ── AM ─────────────────────────────────────────────────────────────
      if (apremFerme) {
        tr.appendChild(buildLockedTd());
      } else {
        const tdAprem  = document.createElement("td");
        const amInner  = document.createElement("div");
        amInner.className = "plan-col-am-inner";

        const selMatinRef = tr.querySelector("select[data-role='matin']");
        const cbAm    = document.createElement("input");
        cbAm.type     = "checkbox";
        cbAm.className = "form-check-input plan-col-am-check";
        // Si Matin est fermé il n'y a pas de selMatin → pas de =M cohérent
        cbAm.checked   = !matinFerme && !!chirAprem && chirAprem === chirMatin;
        cbAm.dataset.role = "am-check";
        // Désactiver =M si Matin est fermé
        if (matinFerme) cbAm.disabled = true;

        const selAprem = buildSelectChir(chirAprem);
        selAprem.className    = "form-select form-select-sm plan-col-am-select";
        selAprem.dataset.role = "aprem";
        if (cbAm.checked) selAprem.disabled = true;

        cbAm.addEventListener("change", () => {
          selAprem.disabled = cbAm.checked;
          const selM = tr.querySelector("select[data-role='matin']");
          if (cbAm.checked && selM) selAprem.value = selM.value;
        });

        amInner.appendChild(cbAm);
        amInner.appendChild(document.createTextNode(" =M"));
        amInner.appendChild(selAprem);
        tdAprem.appendChild(amInner);
        tr.appendChild(tdAprem);
      }

      // ── Soir ───────────────────────────────────────────────────────────
      const tdSoir    = document.createElement("td");
      const soirInner = document.createElement("div");
      soirInner.className = "plan-col-soir-inner";
      if (soirFerme) soirInner.classList.add("plan-soir-fermee");

      const cbSoirEgalM = document.createElement("input");
      cbSoirEgalM.type  = "checkbox";
      cbSoirEgalM.className  = "form-check-input";
      cbSoirEgalM.checked    = !soirFerme && !!chirSoir && chirSoir === chirMatin;
      cbSoirEgalM.dataset.role = "soir-egal-matin";
      if (matinFerme) cbSoirEgalM.disabled = true; // Pas de référence Matin

      const selSoir        = buildSelectChir(chirSoir);
      selSoir.className    = "form-select form-select-sm plan-col-soir-select";
      selSoir.dataset.role = "soir";
      if (soirFerme || cbSoirEgalM.checked) selSoir.disabled = true;

      const cbFerme        = document.createElement("input");
      cbFerme.type         = "checkbox";
      cbFerme.className    = "form-check-input";
      cbFerme.checked      = soirFerme;
      cbFerme.dataset.role = "soir-ferme";

      cbSoirEgalM.addEventListener("change", () => {
        if (cbSoirEgalM.checked) {
          const selM = tr.querySelector("select[data-role='matin']");
          if (selM) selSoir.value = selM.value;
          selSoir.disabled = true;
          cbFerme.checked = false; soirInner.classList.remove("plan-soir-fermee");
        } else { selSoir.disabled = cbFerme.checked; }
      });
      cbFerme.addEventListener("change", () => {
        if (cbFerme.checked) cbSoirEgalM.checked = false;
        selSoir.disabled = cbFerme.checked || cbSoirEgalM.checked;
        soirInner.classList.toggle("plan-soir-fermee", cbFerme.checked);
      });

      const lblFerme = document.createElement("label");
      lblFerme.className = "small text-muted"; lblFerme.textContent = "Fermé";
      const lblEgalM    = document.createElement("label");
      lblEgalM.className = "small text-muted"; lblEgalM.textContent = "=M";

      soirInner.appendChild(cbSoirEgalM); soirInner.appendChild(lblEgalM);
      soirInner.appendChild(selSoir);
      soirInner.appendChild(cbFerme);     soirInner.appendChild(lblFerme);
      tdSoir.appendChild(soirInner);
      tr.appendChild(tdSoir);

      tbody.appendChild(tr);
    }
  }

  function syncAmIfChecked(tr) {
    const selMatin = tr.querySelector("select[data-role='matin']");
    const cbAm     = tr.querySelector("input[data-role='am-check']");
    const selAprem = tr.querySelector("select[data-role='aprem']");
    if (cbAm?.checked && selAprem && selMatin) selAprem.value = selMatin.value;
  }

  // Collecte DOM → _currentWeek
  // Créneaux fermés → pas de select → valeur "" → if(!chir) skip → atom salle_fermee préservé ✓
  function _collectChirurgiens(jour) {
    if (!_currentWeek) return 0;
    const tbody = $("batchTbodyChir");
    if (!tbody?.children.length) return 0;
    let n = 0;

    for (const tr of tbody.querySelectorAll("tr[data-salle]")) {
      const salle        = String(tr.dataset.salle);
      const chirMatin    = tr.querySelector("select[data-role='matin']")?.value    || "";
      const cbAm         = tr.querySelector("input[data-role='am-check']");
      const selAprem     = tr.querySelector("select[data-role='aprem']");
      const chirAprem    = cbAm?.checked ? chirMatin : (selAprem?.value || "");
      const cbSoirEgalM  = tr.querySelector("input[data-role='soir-egal-matin']");
      const chirSoir     = cbSoirEgalM?.checked ? chirMatin : (tr.querySelector("select[data-role='soir']")?.value || "");
      const soirFerme    = tr.querySelector("input[data-role='soir-ferme']")?.checked || false;

      // Matin : seulement si un select est présent (créneau non fermé)
      if (chirMatin) {
        clearChirSlot(jour,"MATIN",salle);
        addAtom({jour,creneau:"MATIN",secteur:"SALLE",salle,chirurgien:chirMatin});
        n++;
      }
      // AM : seulement si un select est présent
      if (chirAprem && selAprem) {
        clearChirSlot(jour,"APREM",salle);
        addAtom({jour,creneau:"APREM",secteur:"SALLE",salle,chirurgien:chirAprem});
        n++;
      }
      // Soir : toujours présent (case Fermé gérée ici)
      clearChirSlot(jour,"SOIR",salle);
      if (soirFerme)       { addAtom({jour,creneau:"SOIR",secteur:"SALLE",salle,salle_fermee:1}); n++; }
      else if (chirSoir)   { addAtom({jour,creneau:"SOIR",secteur:"SALLE",salle,chirurgien:chirSoir}); n++; }
    }
    return n;
  }

  async function finishChirurgiens() {
    if (!_currentSemaine) { toast("Charger une semaine d'abord"); return; }
    if (!_currentWeek) _currentWeek = PlanningSchema.createWeek(_currentSemaine, _currentAnnee);

    _collectChirurgiens(_chirJour);
    markDaySaved("batchChirJourSelector", _chirJour, _chirSavedDays);

    await afterSave();

    const days = JOURS.filter(j => _chirSavedDays.has(j)).map(j => JOUR_FR[j]).join(", ");
    bootstrap.Modal.getOrCreateInstance($("batchModalChirurgiens"))?.hide();
    toast(`Chirurgiens enregistrés — ${days || JOUR_FR[_chirJour]}`);
    _chirSavedDays.clear();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODALE 2 — IDEs (INSTRU + PANSEUR)
  // ══════════════════════════════════════════════════════════════════════════

  let _ideJour = "LUNDI";

  function buildIDEGroups(jour) {
    const container = $("batchIDEsSalleGroups");
    if (!container) return;
    container.innerHTML = "";

    for (const salle of getSalles()) {
      const matinFerme = isCreneauFerme(jour, "MATIN", salle);
      const apremFerme = isCreneauFerme(jour, "APREM", salle);
      const soirFerme  = isCreneauFerme(jour, "SOIR",  salle);

      const group = document.createElement("div");
      group.className     = "plan-salle-group";
      group.dataset.salle = String(salle);

      const header = document.createElement("div");
      header.className = "plan-salle-group-header";
      const lockBadge = (matinFerme || apremFerme || soirFerme)
        ? ' <span class="badge bg-warning-subtle text-warning ms-2"><i class="bi bi-lock-fill me-1"></i>Créneaux fermés</span>'
        : "";
      header.innerHTML = `<span class="plan-salle-badge">Salle ${salle}</span>${lockBadge}`;
      group.appendChild(header);

      const table = document.createElement("table");
      table.className = "table plan-batch-table mb-0";
      const tbody = document.createElement("tbody");

      for (const role of ["INSTRU", "PANSEUR"]) {
        // ── Lecture atomes principaux ─────────────────────────────────────
        const ideFor = (c) => getSlotAtoms(jour, c, "SALLE", salle)
          .find(a => String(a.role || "").toUpperCase() === role && Number(a.doublure) !== 1);
        const dblFor = (c) => getSlotAtoms(jour, c, "SALLE", salle)
          .find(a => String(a.role || "").toUpperCase() === role && Number(a.doublure) === 1);

        const atomM = ideFor("MATIN"); const dblM = dblFor("MATIN");
        const atomA = ideFor("APREM"); const dblA = dblFor("APREM");
        const atomS = ideFor("SOIR");  const dblS = dblFor("SOIR");

        const ideMatin  = atomM?.ide || "";
        const ouv       = Number(atomM?.ouverture) === 1;
        const nuitMatin = Number(atomM?.nuit) === 1;
        const ideAprem  = atomA?.ide || "";
        const nuitAprem = Number(atomA?.nuit) === 1;
        const ideSoir   = atomS?.ide || "";
        const nuitSoir  = Number(atomS?.nuit) === 1;

        const dblIdeMatin  = dblM?.ide || "";
        const dblOuvMatin  = Number(dblM?.ouverture) === 1;
        const dblIdeAprem  = dblA?.ide || "";
        const dblIdeSoir   = dblS?.ide || "";
        const hasDoublure = !!(dblIdeMatin || dblIdeAprem || dblIdeSoir);

        // ── Ligne principale ──────────────────────────────────────────────
        const tr = document.createElement("tr");
        if (role === "PANSEUR") tr.classList.add("plan-ide-role-separator");
        tr.dataset.salle = String(salle);
        tr.dataset.role  = role;

        const tdLabel = document.createElement("td");
        tdLabel.className = "plan-role-row-label " + role.toLowerCase();
        tdLabel.innerHTML = role === "INSTRU"
          ? '<i class="bi bi-person me-1"></i>INSTRU'
          : '<i class="bi bi-person-fill me-1"></i>PANSEUR';
        tr.appendChild(tdLabel);

        // Matin
        if (matinFerme) {
          tr.appendChild(buildLockedTd());
        } else {
          const tdM = document.createElement("td");
          const inner = document.createElement("div");
          inner.className = "plan-couloir-row-inner";
          const selM = buildSelectIDE(ideMatin);
          selM.dataset.role = "matin";
          selM.addEventListener("change", () => {
            const cbAmc = tr.querySelector("input[data-role='am-check']");
            const selAmc = tr.querySelector("select[data-role='aprem']");
            if (cbAmc?.checked && selAmc) selAmc.value = selM.value;
          });
          const cbOuv = document.createElement("input");
          cbOuv.type = "checkbox"; cbOuv.className = "form-check-input";
          cbOuv.checked = ouv; cbOuv.dataset.role = "matin-ouv";
          const ouvLbl = document.createElement("label");
          ouvLbl.className = "plan-ouverture-check-label";
          ouvLbl.innerHTML = '<i class="bi bi-door-open me-1"></i>Ouv.';
          const cbNuitM = document.createElement("input");
          cbNuitM.type = "checkbox"; cbNuitM.className = "form-check-input ms-2";
          cbNuitM.checked = nuitMatin; cbNuitM.dataset.role = "matin-nuit";
          const nuitMLabel = document.createElement("label");
          nuitMLabel.className = "plan-nuit-check-label";
          nuitMLabel.innerHTML = '<i class="bi bi-moon-stars text-info"></i>';
          inner.appendChild(selM); inner.appendChild(cbOuv); inner.appendChild(ouvLbl);
          inner.appendChild(cbNuitM); inner.appendChild(nuitMLabel);
          tdM.appendChild(inner); tr.appendChild(tdM);
        }

        // AM
        if (apremFerme) {
          tr.appendChild(buildLockedTd());
        } else {
          const tdA = document.createElement("td");
          const inner = document.createElement("div");
          inner.className = "plan-couloir-row-inner";
          const cbAm = document.createElement("input");
          cbAm.type = "checkbox"; cbAm.className = "form-check-input plan-col-am-check";
          cbAm.checked = !matinFerme && !!ideAprem && ideAprem === ideMatin;
          cbAm.dataset.role = "am-check";
          if (matinFerme) cbAm.disabled = true;
          const selA = buildSelectIDE(ideAprem);
          selA.className = "form-select form-select-sm plan-col-am-select";
          selA.dataset.role = "aprem";
          if (cbAm.checked) selA.disabled = true;
          cbAm.addEventListener("change", () => {
            selA.disabled = cbAm.checked;
            if (cbAm.checked) {
              const selM = tr.querySelector("select[data-role='matin']");
              if (selM) selA.value = selM.value;
            }
          });
          const cbNuitA = document.createElement("input");
          cbNuitA.type = "checkbox"; cbNuitA.className = "form-check-input ms-2";
          cbNuitA.checked = nuitAprem; cbNuitA.dataset.role = "aprem-nuit";
          const nuitALabel = document.createElement("label");
          nuitALabel.className = "plan-nuit-check-label";
          nuitALabel.innerHTML = '<i class="bi bi-moon-stars text-info"></i>';
          inner.appendChild(cbAm); inner.appendChild(document.createTextNode(" =M"));
          inner.appendChild(selA);
          inner.appendChild(cbNuitA); inner.appendChild(nuitALabel);
          tdA.appendChild(inner); tr.appendChild(tdA);
        }

        // Soir
        if (soirFerme) {
          tr.appendChild(buildLockedTd());
        } else {
          const tdS = document.createElement("td");
          const inner = document.createElement("div");
          inner.className = "plan-couloir-row-inner";
          const cbSoir = document.createElement("input");
          cbSoir.type = "checkbox"; cbSoir.className = "form-check-input";
          cbSoir.checked = !!ideSoir && (ideSoir === ideAprem || ideSoir === ideMatin);
          cbSoir.dataset.role = "soir-check";
          if (apremFerme && matinFerme) cbSoir.disabled = true;
          const selS = buildSelectIDE(ideSoir);
          selS.className = "form-select form-select-sm";
          selS.dataset.role = "soir";
          if (cbSoir.checked) selS.disabled = true;
          cbSoir.addEventListener("change", () => {
            selS.disabled = cbSoir.checked;
            if (cbSoir.checked) {
              const selAm = tr.querySelector("select[data-role='aprem']");
              const selM  = tr.querySelector("select[data-role='matin']");
              selS.value = selAm?.value || selM?.value || "";
            }
          });
          const cbNuitS = document.createElement("input");
          cbNuitS.type = "checkbox"; cbNuitS.className = "form-check-input ms-2";
          cbNuitS.checked = nuitSoir; cbNuitS.dataset.role = "soir-nuit";
          const nuitSLabel = document.createElement("label");
          nuitSLabel.className = "plan-nuit-check-label";
          nuitSLabel.innerHTML = '<i class="bi bi-moon-stars text-info"></i>';
          inner.appendChild(cbSoir); inner.appendChild(document.createTextNode(" =AM"));
          inner.appendChild(selS);
          inner.appendChild(cbNuitS); inner.appendChild(nuitSLabel);
          tdS.appendChild(inner); tr.appendChild(tdS);
        }
        tbody.appendChild(tr);

        // ── Ligne doublure ────────────────────────────────────────────────
        const trDbl = document.createElement("tr");
        trDbl.dataset.salle    = String(salle);
        trDbl.dataset.role     = role;
        trDbl.dataset.doublure = "1";
        trDbl.className = "plan-batch-doublure-row" + (hasDoublure ? "" : " d-none");

        const tdDblLabel = document.createElement("td");
        tdDblLabel.className = "plan-role-row-label doublure";
        tdDblLabel.innerHTML =
          `<i class="bi bi-arrow-return-right me-1 text-muted"></i>Dbl <span class="badge bg-secondary-subtle text-secondary ms-1">${role}</span>` +
          `<button type="button" class="btn btn-link btn-sm p-0 ms-2 text-danger batch-btn-remove-doublure" title="Supprimer doublure"><i class="bi bi-x-circle"></i></button>`;
        trDbl.appendChild(tdDblLabel);

        // Matin doublure
        if (matinFerme) {
          trDbl.appendChild(buildLockedTd());
        } else {
          const tdDM = document.createElement("td");
          const dblMatinInner = document.createElement("div");
          dblMatinInner.className = "plan-couloir-row-inner";
          const selDM = buildSelectIDE(dblIdeMatin);
          selDM.dataset.role = "dbl-matin";
          const cbDblOuv = document.createElement("input");
          cbDblOuv.type = "checkbox"; cbDblOuv.className = "form-check-input";
          cbDblOuv.checked = dblOuvMatin; cbDblOuv.dataset.role = "dbl-matin-ouv";
          const dblOuvLbl = document.createElement("label");
          dblOuvLbl.className = "plan-ouverture-check-label";
          dblOuvLbl.innerHTML = '<i class="bi bi-door-open me-1"></i>Ouv.';
          dblMatinInner.appendChild(selDM);
          dblMatinInner.appendChild(cbDblOuv);
          dblMatinInner.appendChild(dblOuvLbl);
          tdDM.appendChild(dblMatinInner); trDbl.appendChild(tdDM);
        }

        // AM doublure
        if (apremFerme) {
          trDbl.appendChild(buildLockedTd());
        } else {
          const tdDA = document.createElement("td");
          const selDA = buildSelectIDE(dblIdeAprem);
          selDA.dataset.role = "dbl-aprem";
          tdDA.appendChild(selDA); trDbl.appendChild(tdDA);
        }

        // Soir doublure
        if (soirFerme) {
          trDbl.appendChild(buildLockedTd());
        } else {
          const tdDS = document.createElement("td");
          const selDS = buildSelectIDE(dblIdeSoir);
          selDS.dataset.role = "dbl-soir";
          tdDS.appendChild(selDS); trDbl.appendChild(tdDS);
        }

        // Bouton remove doublure
        tdDblLabel.querySelector(".batch-btn-remove-doublure").addEventListener("click", () => {
          trDbl.classList.add("d-none");
          trDbl.querySelectorAll("select").forEach(s => s.value = "");
          trBtn.classList.remove("d-none");
        });
        tbody.appendChild(trDbl);

        // ── Bouton ajouter doublure ───────────────────────────────────────
        const trBtn = document.createElement("tr");
        trBtn.dataset.salle = String(salle);
        trBtn.className = "plan-batch-doublure-btn-row" + (hasDoublure ? " d-none" : "");
        const tdBtn = document.createElement("td");
        tdBtn.colSpan = 4;
        tdBtn.className = "ps-4 py-1";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-link btn-sm p-0 text-secondary plan-batch-btn-add-doublure";
        btn.innerHTML = `<i class="bi bi-arrow-return-right me-1"></i>+ Doublure ${role}`;
        btn.addEventListener("click", () => {
          trDbl.classList.remove("d-none");
          trBtn.classList.add("d-none");
        });
        tdBtn.appendChild(btn);
        trBtn.appendChild(tdBtn);
        tbody.appendChild(trBtn);
      }

      table.appendChild(tbody);
      group.appendChild(table);
      container.appendChild(group);
    }
  }

  function _collectIDEs(jour) {
    if (!_currentWeek) return 0;
    const container = $("batchIDEsSalleGroups");
    if (!container?.children.length) return 0;
    let n = 0;

    container.querySelectorAll(".plan-salle-group").forEach(group => {
      const salle = String(group.dataset.salle);

      // Traiter chaque rôle principal
      group.querySelectorAll("tr[data-role]:not([data-doublure]):not(.plan-batch-doublure-btn-row)").forEach(tr => {
        const role = tr.dataset.role;
        if (!role || tr.classList.contains("plan-batch-doublure-btn-row")) return;

        const selMatin    = tr.querySelector("select[data-role='matin']");
        const ideMatin    = selMatin?.value   || "";
        const ouv         = tr.querySelector("input[data-role='matin-ouv']")?.checked ? 1 : 0;
        const nuitM       = tr.querySelector("input[data-role='matin-nuit']")?.checked ? 1 : 0;
        const cbAmCheck   = tr.querySelector("input[data-role='am-check']");
        const selAprem    = tr.querySelector("select[data-role='aprem']");
        const ideAprem    = cbAmCheck?.checked ? ideMatin : (selAprem?.value || "");
        const nuitA       = tr.querySelector("input[data-role='aprem-nuit']")?.checked ? 1 : 0;
        const cbSoirCheck = tr.querySelector("input[data-role='soir-check']");
        const selSoir     = tr.querySelector("select[data-role='soir']");
        const ideSoir     = cbSoirCheck?.checked ? ideAprem : (selSoir?.value || "");
        const nuitS       = tr.querySelector("input[data-role='soir-nuit']")?.checked ? 1 : 0;

        const writeAtom = (creneau, ide, selEl, extra) => {
          if (!ide || !selEl) return;
          if (_currentWeek.affectations) {
            // Atomes créés par la modale slot V2 (replaceSlotWithModel) intègrent le chirurgien
            // dans l'atome INSTRU/PANSEUR. On le préserve avant suppression.
            const chirPreserve = _currentWeek.affectations.find(a =>
              String(a.jour    || "").toUpperCase() === jour    &&
              String(a.creneau || "").toUpperCase() === creneau &&
              String(a.secteur || "").toUpperCase() === "SALLE" &&
              String(a.salle   ?? "")               === salle   &&
              String(a.role    || "").toUpperCase() === role    &&
              Number(a.doublure) !== 1 &&
              String(a.chirurgien || "").trim()
            )?.chirurgien || "";

            _currentWeek.affectations = _currentWeek.affectations.filter(a =>
              !(String(a.jour    || "").toUpperCase() === jour    &&
                String(a.creneau || "").toUpperCase() === creneau &&
                String(a.secteur || "").toUpperCase() === "SALLE" &&
                String(a.salle   ?? "")               === salle   &&
                String(a.role    || "").toUpperCase() === role    &&
                Number(a.doublure) !== 1)
            );

            // Réinjecter le chirurgien s'il n'est pas déjà présent en atome séparé (role:"")
            if (chirPreserve) {
              const alreadyPresent = _currentWeek.affectations.some(a =>
                String(a.jour    || "").toUpperCase() === jour    &&
                String(a.creneau || "").toUpperCase() === creneau &&
                String(a.secteur || "").toUpperCase() === "SALLE" &&
                String(a.salle   ?? "")               === salle   &&
                String(a.role    || "")               === ""      &&
                String(a.chirurgien || "")            === chirPreserve
              );
              if (!alreadyPresent) addAtom({jour, creneau, secteur:"SALLE", salle, chirurgien:chirPreserve});
            }
          }
          addAtom({jour, creneau, secteur:"SALLE", salle, ide, role, ...extra});
          n++;
        };

        writeAtom("MATIN", ideMatin, selMatin, {ouverture:ouv, nuit:nuitM, visceral:0});
        writeAtom("APREM", ideAprem, selAprem,  {ouverture:0,   nuit:nuitA, visceral:0});
        writeAtom("SOIR",  ideSoir,  selSoir,   {ouverture:0,   nuit:nuitS, visceral:0});

        // ── Doublure ──────────────────────────────────────────────────────
        const trDbl = group.querySelector(`tr[data-role="${role}"][data-doublure="1"]`);
        if (trDbl && !trDbl.classList.contains("d-none")) {
          const selDM = trDbl.querySelector("select[data-role='dbl-matin']");
          const selDA = trDbl.querySelector("select[data-role='dbl-aprem']");
          const selDS = trDbl.querySelector("select[data-role='dbl-soir']");

          const writeDbl = (creneau, ide, selEl, extra = {}) => {
            if (!ide || !selEl) return;
            if (_currentWeek.affectations) {
              _currentWeek.affectations = _currentWeek.affectations.filter(a =>
                !(String(a.jour    || "").toUpperCase() === jour    &&
                  String(a.creneau || "").toUpperCase() === creneau &&
                  String(a.secteur || "").toUpperCase() === "SALLE" &&
                  String(a.salle   ?? "")               === salle   &&
                  String(a.role    || "").toUpperCase() === role    &&
                  Number(a.doublure) === 1)
              );
            }
            addAtom({jour, creneau, secteur:"SALLE", salle, ide, role,
                     doublure:1, doublure_sous:role, visceral:0, ...extra});
            n++;
          };

          const dblOuv = trDbl.querySelector("input[data-role='dbl-matin-ouv']")?.checked ? 1 : 0;
          writeDbl("MATIN", selDM?.value || "", selDM, {ouverture: dblOuv});
          writeDbl("APREM", selDA?.value || "", selDA, {ouverture: 0});
          writeDbl("SOIR",  selDS?.value || "", selDS, {ouverture: 0});
        } else {
          // Doublure masquée → supprimer les atomes doublure existants
          if (_currentWeek.affectations) {
            _currentWeek.affectations = _currentWeek.affectations.filter(a =>
              !(String(a.jour    || "").toUpperCase() === jour    &&
                String(a.secteur || "").toUpperCase() === "SALLE" &&
                String(a.salle   ?? "")               === salle   &&
                String(a.role    || "").toUpperCase() === role    &&
                Number(a.doublure) === 1)
            );
          }
        }
      });
    });
    return n;
  }

  async function finishIDEs() {
    if (!_currentSemaine) { toast("Charger une semaine d'abord"); return; }
    if (!_currentWeek) _currentWeek = PlanningSchema.createWeek(_currentSemaine, _currentAnnee);

    _collectIDEs(_ideJour);
    markDaySaved("batchIDEJourSelector", _ideJour, _ideSavedDays);

    await afterSave();

    const days = JOURS.filter(j => _ideSavedDays.has(j)).map(j => JOUR_FR[j]).join(", ");
    bootstrap.Modal.getOrCreateInstance($("batchModalIDEs"))?.hide();
    toast(`IDEs enregistrés — ${days || JOUR_FR[_ideJour]}`);
    _ideSavedDays.clear();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODALE 3 — COULOIR
  // ══════════════════════════════════════════════════════════════════════════

  let _couloirJour = "LUNDI";
  let _couloirRows = [];

  function buildCouloirTable(jour) {
    const tbody = $("batchTbodyCouloir");
    if (!tbody) return;

    const mE = getSlotAtoms(jour,"MATIN","COULOIR").filter(a => String(a.ide||"").trim()).map(a => ({ide:a.ide, visc:Number(a.visceral)===1, ouv:Number(a.ouverture)===1, nuit:Number(a.nuit)===1}));
    const aE = getSlotAtoms(jour,"APREM","COULOIR").filter(a => String(a.ide||"").trim()).map(a => ({ide:a.ide, visc:Number(a.visceral)===1, nuit:Number(a.nuit)===1}));
    const sE = getSlotAtoms(jour,"SOIR", "COULOIR").filter(a => String(a.ide||"").trim()).map(a => ({ide:a.ide, visc:Number(a.visceral)===1, nuit:Number(a.nuit)===1}));

    // count = max des 3 créneaux pour afficher tous les atomes existants
    const count = Math.max(mE.length, aE.length, sE.length, 1);
    _couloirRows = Array.from({length:count}, (_, i) => {
      const aEff = aE[i]?.ide || "";  // valeur APREM réelle (peut être vide)
      const mEff = mE[i]?.ide || "";  // valeur MATIN réelle (peut être vide)
      // =M : coché seulement si APREM atom existe ET correspond au MATIN
      // Ne jamais forcer =M si aucun atome APREM → évite les sélects verrouillés sur données fantômes
      const amEgalMatin  = !!aEff && aEff === mEff;
      // Valeur affichée en AM : si =M → MATIN, sinon → valeur APREM réelle
      const ideAmDisplay = amEgalMatin ? mEff : aEff;
      const amRef = aEff || mEff;     // référence pour le calcul SOIR
      // =AM : coché seulement si SOIR atom existe ET correspond à l'AM effectif
      const soirEgalAm   = !!(sE[i]?.ide) && sE[i]?.ide === amRef;
      return {
        ideMatin:       mEff,
        viscMatin:      mE[i]?.visc  || false,
        ouvertureMatin: mE[i]?.ouv   || false,
        nuitMatin:      mE[i]?.nuit  || false,
        amEgalMatin,
        ideAm:          ideAmDisplay,
        viscAm:         aE[i]?.visc  || false,
        nuitAm:         aE[i]?.nuit  || false,
        soirEgalAm,
        ideSoir:        sE[i]?.ide   || "",
        viscSoir:       sE[i]?.visc  || false,
        nuitSoir:       sE[i]?.nuit  || false
      };
    });

    renderCouloirRows(tbody);
  }

  function renderCouloirRows(tbody) {
    tbody.innerHTML = "";

    _couloirRows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.dataset.idx = String(idx);

      const tdLabel = document.createElement("td");
      tdLabel.className = "row-label";
      tdLabel.textContent = `IDE ${idx + 1}`;

      // Matin
      const tdMatin    = document.createElement("td");
      const matinInner = document.createElement("div");
      matinInner.className = "plan-couloir-row-inner";

      const selMatin = buildSelectIDE(row.ideMatin);
      selMatin.dataset.role = "matin-ide";
      selMatin.addEventListener("change", () => {
        // Cascade DOM uniquement — pas de mutation _couloirRows (lecture DOM directe à la sauvegarde)
        const cbAmC  = tr.querySelector("input[data-role='am-check']");
        const selAmE = tr.querySelector("select[data-role='am-ide']");
        if (cbAmC?.checked && selAmE) {
          selAmE.value = selMatin.value;
          const cbSoirC  = tr.querySelector("input[data-role='soir-check']");
          const selSoirE = tr.querySelector("select[data-role='soir-ide']");
          if (cbSoirC?.checked && selSoirE) selSoirE.value = selMatin.value;
        }
      });

      const cbVisc = document.createElement("input");
      cbVisc.type = "checkbox"; cbVisc.className = "form-check-input";
      cbVisc.checked = row.viscMatin; cbVisc.dataset.role = "matin-visc";

      const viscLbl = document.createElement("label");
      viscLbl.className = "plan-visceral-check-label";
      viscLbl.innerHTML = '<i class="bi bi-heart-pulse me-1"></i>Visc.';

      const cbOuv = document.createElement("input");
      cbOuv.type = "checkbox"; cbOuv.className = "form-check-input";
      cbOuv.checked = row.ouvertureMatin; cbOuv.dataset.role = "matin-ouv";

      const ouvLbl = document.createElement("label");
      ouvLbl.className = "plan-ouverture-check-label";
      ouvLbl.innerHTML = '<i class="bi bi-door-open me-1"></i>Ouv.';

      const cbNuitM = document.createElement("input");
      cbNuitM.type = "checkbox"; cbNuitM.className = "form-check-input";
      cbNuitM.checked = row.nuitMatin; cbNuitM.dataset.role = "matin-nuit";
      const nuitMLabel = document.createElement("label");
      nuitMLabel.className = "plan-nuit-check-label";
      nuitMLabel.innerHTML = '<i class="bi bi-moon-stars"></i>';
      matinInner.appendChild(selMatin);
      matinInner.appendChild(cbVisc);  matinInner.appendChild(viscLbl);
      matinInner.appendChild(cbOuv);   matinInner.appendChild(ouvLbl);
      matinInner.appendChild(cbNuitM); matinInner.appendChild(nuitMLabel);
      tdMatin.appendChild(matinInner);

      // AM
      const tdAm   = document.createElement("td");
      const amInner = document.createElement("div");
      amInner.className = "plan-couloir-row-inner";

      const cbAmChk = document.createElement("input");
      cbAmChk.type  = "checkbox"; cbAmChk.className = "form-check-input plan-col-am-check";
      cbAmChk.checked = row.amEgalMatin; cbAmChk.dataset.role = "am-check";

      const selAm = buildSelectIDE(row.amEgalMatin ? row.ideMatin : row.ideAm);
      selAm.className    = "form-select form-select-sm plan-col-am-select";
      selAm.dataset.role = "am-ide";
      if (cbAmChk.checked) selAm.disabled = true;

      cbAmChk.addEventListener("change", () => {
        selAm.disabled = cbAmChk.checked;
        if (cbAmChk.checked) selAm.value = selMatin.value;
        const cbSoirC  = tr.querySelector("input[data-role='soir-check']");
        const selSoirE = tr.querySelector("select[data-role='soir-ide']");
        if (cbSoirC?.checked && selSoirE) {
          selSoirE.value = cbAmChk.checked ? selMatin.value : selAm.value;
        }
      });
      selAm.addEventListener("change", () => {
        const cbSoirC  = tr.querySelector("input[data-role='soir-check']");
        const selSoirE = tr.querySelector("select[data-role='soir-ide']");
        if (cbSoirC?.checked && selSoirE) selSoirE.value = selAm.value;
      });

      const cbViscAm = document.createElement("input");
      cbViscAm.type  = "checkbox"; cbViscAm.className = "form-check-input";
      cbViscAm.checked = row.viscAm; cbViscAm.dataset.role = "am-visc";

      const viscAmLbl = document.createElement("label");
      viscAmLbl.className = "plan-visceral-check-label";
      viscAmLbl.innerHTML = '<i class="bi bi-heart-pulse me-1"></i>Visc.';

      const cbNuitAm = document.createElement("input");
      cbNuitAm.type = "checkbox"; cbNuitAm.className = "form-check-input";
      cbNuitAm.checked = row.nuitAm; cbNuitAm.dataset.role = "am-nuit";
      const nuitAmLabel = document.createElement("label");
      nuitAmLabel.className = "plan-nuit-check-label";
      nuitAmLabel.innerHTML = '<i class="bi bi-moon-stars"></i>';
      amInner.appendChild(cbAmChk);
      amInner.appendChild(document.createTextNode(" =M"));
      amInner.appendChild(selAm);
      amInner.appendChild(cbViscAm);  amInner.appendChild(viscAmLbl);
      amInner.appendChild(cbNuitAm);  amInner.appendChild(nuitAmLabel);
      tdAm.appendChild(amInner);

      // Soir
      const tdSoir    = document.createElement("td");
      const soirInner = document.createElement("div");
      soirInner.className = "plan-couloir-row-inner";

      const amEff = row.amEgalMatin ? row.ideMatin : row.ideAm;

      const cbSoirChk = document.createElement("input");
      cbSoirChk.type  = "checkbox"; cbSoirChk.className = "form-check-input";
      cbSoirChk.checked = row.soirEgalAm; cbSoirChk.dataset.role = "soir-check";

      const selSoir = buildSelectIDE(row.soirEgalAm ? amEff : row.ideSoir);
      selSoir.className    = "form-select form-select-sm";
      selSoir.dataset.role = "soir-ide";
      if (cbSoirChk.checked) selSoir.disabled = true;

      cbSoirChk.addEventListener("change", () => {
        selSoir.disabled = cbSoirChk.checked;
        if (cbSoirChk.checked) {
          const cbAmC  = tr.querySelector("input[data-role='am-check']");
          const selAmE = tr.querySelector("select[data-role='am-ide']");
          selSoir.value = cbAmC?.checked ? selMatin.value : (selAmE?.value || "");
        }
      });

      const cbViscSoir = document.createElement("input");
      cbViscSoir.type  = "checkbox"; cbViscSoir.className = "form-check-input";
      cbViscSoir.checked = row.viscSoir; cbViscSoir.dataset.role = "soir-visc";

      const viscSoirLbl = document.createElement("label");
      viscSoirLbl.className = "plan-visceral-check-label";
      viscSoirLbl.innerHTML = '<i class="bi bi-heart-pulse me-1"></i>Visc.';

      const cbNuitSoir = document.createElement("input");
      cbNuitSoir.type = "checkbox"; cbNuitSoir.className = "form-check-input";
      cbNuitSoir.checked = row.nuitSoir; cbNuitSoir.dataset.role = "soir-nuit";
      const nuitSoirLabel = document.createElement("label");
      nuitSoirLabel.className = "plan-nuit-check-label";
      nuitSoirLabel.innerHTML = '<i class="bi bi-moon-stars"></i>';
      soirInner.appendChild(cbSoirChk);
      soirInner.appendChild(document.createTextNode(" =AM"));
      soirInner.appendChild(selSoir);
      soirInner.appendChild(cbViscSoir);  soirInner.appendChild(viscSoirLbl);
      soirInner.appendChild(cbNuitSoir);  soirInner.appendChild(nuitSoirLabel);
      tdSoir.appendChild(soirInner);

      const tdDel  = document.createElement("td");
      tdDel.className = "text-center";
      const btnDel = document.createElement("button");
      btnDel.type  = "button";
      btnDel.className = "btn btn-outline-danger btn-sm py-0 px-2";
      btnDel.innerHTML = '<i class="bi bi-x"></i>';
      btnDel.addEventListener("click", () => {
        // Reconstruire depuis le DOM puis supprimer la ligne
        _couloirRows = _readCouloirRowsFromDOM();
        _couloirRows.splice(idx, 1);
        if (_couloirRows.length === 0) _couloirRows.push({
          ideMatin:"", viscMatin:false, ouvertureMatin:false, nuitMatin:false,
          amEgalMatin:false, ideAm:"", viscAm:false, nuitAm:false,
          soirEgalAm:false, ideSoir:"", viscSoir:false, nuitSoir:false
        });
        renderCouloirRows(document.querySelector("#batchTableCouloir tbody"));
      });
      tdDel.appendChild(btnDel);

      tr.appendChild(tdLabel); tr.appendChild(tdMatin);
      tr.appendChild(tdAm);    tr.appendChild(tdSoir);
      tr.appendChild(tdDel);
      tbody.appendChild(tr);
    });
  }

  // Lit le DOM courant → tableau neuf (pas de dépendance à _couloirRows)
  // Construit depuis zéro à partir du DOM — pas d'index-guard, pas de dépendance à _couloirRows
  function _readCouloirRowsFromDOM() {
    const tbody = $("batchTbodyCouloir");
    if (!tbody) return [];
    const rows = [];
    tbody.querySelectorAll("tr[data-idx]").forEach(tr => {
      const ideMatin     = tr.querySelector("select[data-role='matin-ide']")?.value || "";
      const cbAmChk      = tr.querySelector("input[data-role='am-check']");
      const amEgalMatin  = cbAmChk?.checked || false;
      const selAm        = tr.querySelector("select[data-role='am-ide']");
      const ideAm        = amEgalMatin ? ideMatin : (selAm?.value || "");
      const cbSoirChk    = tr.querySelector("input[data-role='soir-check']");
      const soirEgalAm   = cbSoirChk?.checked || false;
      const selSoir      = tr.querySelector("select[data-role='soir-ide']");
      const amEff        = amEgalMatin ? ideMatin : ideAm;
      const ideSoir      = soirEgalAm ? amEff : (selSoir?.value || "");
      rows.push({
        ideMatin,
        viscMatin:      tr.querySelector("input[data-role='matin-visc']")?.checked || false,
        ouvertureMatin: tr.querySelector("input[data-role='matin-ouv']")?.checked  || false,
        nuitMatin:      tr.querySelector("input[data-role='matin-nuit']")?.checked || false,
        amEgalMatin,
        ideAm,
        viscAm:         tr.querySelector("input[data-role='am-visc']")?.checked    || false,
        nuitAm:         tr.querySelector("input[data-role='am-nuit']")?.checked    || false,
        soirEgalAm,
        ideSoir,
        viscSoir:       tr.querySelector("input[data-role='soir-visc']")?.checked  || false,
        nuitSoir:       tr.querySelector("input[data-role='soir-nuit']")?.checked  || false
      });
    });
    return rows;
  }

  function _collectCouloir(jour) {
    if (!_currentWeek) return 0;
    const tbody = $("batchTbodyCouloir");
    if (!tbody?.children.length) return 0;

    // Lecture DIRECTE depuis le DOM — indépendant de _couloirRows
    // Élimine tout risque de désync entre l'état DOM et l'état en mémoire
    for (const c of CRENEAUX) clearSlot(jour, c, "COULOIR");
    let n = 0;

    tbody.querySelectorAll("tr[data-idx]").forEach(tr => {
      // MATIN
      const selMatin  = tr.querySelector("select[data-role='matin-ide']");
      const ideMatin  = selMatin?.value || "";
      const ouverture = tr.querySelector("input[data-role='matin-ouv']")?.checked  ? 1 : 0;
      const viscMatin = tr.querySelector("input[data-role='matin-visc']")?.checked ? 1 : 0;

      // AM
      const cbAmChk  = tr.querySelector("input[data-role='am-check']");
      const selAm    = tr.querySelector("select[data-role='am-ide']");
      const ideAm    = cbAmChk?.checked ? ideMatin : (selAm?.value || "");
      const viscAm   = tr.querySelector("input[data-role='am-visc']")?.checked ? 1 : 0;

      // SOIR
      const cbSoirChk = tr.querySelector("input[data-role='soir-check']");
      const selSoir   = tr.querySelector("select[data-role='soir-ide']");
      const ideSoir   = cbSoirChk?.checked ? ideAm : (selSoir?.value || "");
      const viscSoir  = tr.querySelector("input[data-role='soir-visc']")?.checked ? 1 : 0;
      const nuitMatin = tr.querySelector("input[data-role='matin-nuit']")?.checked ? 1 : 0;
      const nuitAm    = tr.querySelector("input[data-role='am-nuit']")?.checked    ? 1 : 0;
      const nuitSoir  = tr.querySelector("input[data-role='soir-nuit']")?.checked  ? 1 : 0;

      if (ideMatin) { addAtom({jour, creneau:"MATIN", secteur:"COULOIR", salle:"", ide:ideMatin, role:"COULOIR", visceral:viscMatin, ouverture, nuit:nuitMatin}); n++; }
      if (ideAm)    { addAtom({jour, creneau:"APREM", secteur:"COULOIR", salle:"", ide:ideAm,    role:"COULOIR", visceral:viscAm,    ouverture:0, nuit:nuitAm}); n++; }
      if (ideSoir)  { addAtom({jour, creneau:"SOIR",  secteur:"COULOIR", salle:"", ide:ideSoir,  role:"COULOIR", visceral:viscSoir,  ouverture:0, nuit:nuitSoir}); n++; }
    });

    return n;
  }

  async function finishCouloir() {
    if (!_currentSemaine) { toast("Charger une semaine d'abord"); return; }
    if (!_currentWeek) _currentWeek = PlanningSchema.createWeek(_currentSemaine, _currentAnnee);

    _collectCouloir(_couloirJour);
    markDaySaved("batchCouloirJourSelector", _couloirJour, _couloirSavedDays);

    await afterSave();

    const days = JOURS.filter(j => _couloirSavedDays.has(j)).map(j => JOUR_FR[j]).join(", ");
    bootstrap.Modal.getOrCreateInstance($("batchModalCouloir"))?.hide();
    toast(`Couloir enregistré — ${days || JOUR_FR[_couloirJour]}`);
    _couloirSavedDays.clear();
  }

  // ── Helper init modale ────────────────────────────────────────────────────

  function initModal(modalId, selectorId, jour, setter, rebuilder, savedSet) {
    $(modalId)?.addEventListener("show.bs.modal", async () => {
      resetSavedDays(selectorId, savedSet);
      setter("LUNDI");
      await syncFromPlanning();
      const container = $(selectorId);
      if (container) {
        container.querySelectorAll("button").forEach(b => {
          const isFirst = b.dataset.jour === "LUNDI";
          b.className = "btn btn-sm " + (isFirst ? "btn-secondary active" : "btn-outline-secondary");
        });
      }
      rebuilder("LUNDI");
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INIT & CÂBLAGE
  // ══════════════════════════════════════════════════════════════════════════

  document.addEventListener("DOMContentLoaded", () => {

    wireJourSelector("batchChirJourSelector", "batchChirJourLabel", async (jour) => {
      if (jour !== _chirJour && ($("batchTbodyChir")?.children.length ?? 0) > 0) {
        _collectChirurgiens(_chirJour);
        await saveWeekBack();
        markDaySaved("batchChirJourSelector", _chirJour, _chirSavedDays);
      }
      _chirJour = jour;
      buildTableChir(jour);
    });

    wireJourSelector("batchIDEJourSelector", "batchIDEJourLabel", async (jour) => {
      if (jour !== _ideJour && ($("batchIDEsSalleGroups")?.children.length ?? 0) > 0) {
        _collectIDEs(_ideJour);
        await saveWeekBack();
        markDaySaved("batchIDEJourSelector", _ideJour, _ideSavedDays);
      }
      _ideJour = jour;
      buildIDEGroups(jour);
    });

    wireJourSelector("batchCouloirJourSelector", "batchCouloirJourLabel", async (jour) => {
      if (jour !== _couloirJour && ($("batchTbodyCouloir")?.children.length ?? 0) > 0) {
        _collectCouloir(_couloirJour);
        await saveWeekBack();
        markDaySaved("batchCouloirJourSelector", _couloirJour, _couloirSavedDays);
      }
      _couloirJour = jour;
      buildCouloirTable(jour);
    });

    initModal("batchModalChirurgiens", "batchChirJourSelector",    _chirJour,    j => _chirJour    = j, buildTableChir,   _chirSavedDays);
    initModal("batchModalIDEs",        "batchIDEJourSelector",     _ideJour,     j => _ideJour     = j, buildIDEGroups,   _ideSavedDays);
    initModal("batchModalCouloir",     "batchCouloirJourSelector", _couloirJour, j => _couloirJour = j, buildCouloirTable,_couloirSavedDays);

    $("batchBtnSaveChir")?.addEventListener("click",    () => finishChirurgiens().catch(console.error));
    $("batchBtnSaveIDEs")?.addEventListener("click",    () => finishIDEs().catch(console.error));
    $("batchBtnSaveCouloir")?.addEventListener("click", () => finishCouloir().catch(console.error));

    // Avertissement doublon nuit dans la modale IDEs batch
    $("batchIDEsSalleGroups")?.addEventListener("change", (e) => {
      if (!e.target.matches("input[data-role$='-nuit']")) return;
      const container = $("batchIDEsSalleGroups");
      const nuitChecked = container.querySelectorAll("input[data-role$='-nuit']:checked").length;
      const alert = $("alertNuitDoublonBatch");
      if (alert) alert.classList.toggle("d-none", nuitChecked <= 1);
    });

    $("batchBtnAddCouloirRow")?.addEventListener("click", () => {
      // Reconstruire depuis le DOM (tableau neuf, sans dépendance à _couloirRows)
      _couloirRows = _readCouloirRowsFromDOM();
      _couloirRows.push({
        ideMatin:"", viscMatin:false, ouvertureMatin:false, nuitMatin:false,
        amEgalMatin:false, ideAm:"", viscAm:false, nuitAm:false,
        soirEgalAm:false, ideSoir:"", viscSoir:false, nuitSoir:false
      });
      renderCouloirRows(document.querySelector("#batchTableCouloir tbody"));
    });
  });

})();
