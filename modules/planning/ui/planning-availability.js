// =====================================================
// PLANNING AVAILABILITY — extraction depuis planning-controller.js (terrain)
// Calcule indisponibilités IDE + alimente datalist.
// Expose window.PlanningAvailability
// =====================================================

(function () {
  "use strict";

  let _deps = null;

  function setDeps(deps) {
    _deps = deps;
  }

  function computeUnavailableIDEs(jour, creneau) {
    const { getWeekAffectations, isSameSlot } = _deps;
    const aff = getWeekAffectations();
    const set = new Set();

    for (const a of aff) {
      if (!isSameSlot(a, jour, creneau)) continue;
      const ide = String(a?.ide || "").trim();
      if (!ide) continue;

      const isCouloir = String(a?.secteur || "") === "COULOIR";
      const isVisceral = Number(a?.visceral) === 1;

      if (isCouloir || isVisceral) set.add(ide);
    }

    return Array.from(set).sort((x, y) => x.localeCompare(y, "fr"));
  }

  function fillDatalist(datalistEl, values) {
    if (!datalistEl) return;
    datalistEl.innerHTML = "";
    for (const v of values) {
      const opt = document.createElement("option");
      opt.value = String(v);
      datalistEl.appendChild(opt);
    }
  }

  function fillIDEOptionsWithAvailability(prefix) {
    const { $, getStrictIDEs } = _deps;

    const ideInput = $(`${prefix}IDE`);
    const dl = $(`${prefix}IDEOptions`);
    if (!ideInput || !dl) return;

    const jour = $(`${prefix}Jour`)?.value || "";
    const creneau = $(`${prefix}Creneau`)?.value || "";

    const showAll = $(`${prefix}ShowUnavailable`)?.checked === true;

    const all = getStrictIDEs();
    const unavailable = computeUnavailableIDEs(jour, creneau);

    let values = all;
    if (!showAll && jour && creneau) {
      const blocked = new Set(unavailable);
      values = all.filter(v => !blocked.has(v));
    }

    fillDatalist(dl, values);

    const info = $(`${prefix}IDEUnavailableInfo`);
    if (info) {
      if (!jour || !creneau) {
        info.textContent = "";
        return;
      }
      if (unavailable.length === 0) {
        info.textContent = "Aucun IDE indisponible (couloir/viscéral) sur ce créneau.";
        return;
      }
      info.textContent = `Indisponibles (couloir/viscéral) sur ce créneau : ${unavailable.join(", ")}`;
    }
  }

  function refreshAvailabilityHints() {
    fillIDEOptionsWithAvailability("create");
    fillIDEOptionsWithAvailability("edit");
  }

  window.PlanningAvailability = Object.freeze({
    setDeps,
    computeUnavailableIDEs,
    fillIDEOptionsWithAvailability,
    refreshAvailabilityHints
  });

})();