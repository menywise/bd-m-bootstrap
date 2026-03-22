// planning-events.js
// Gestion complète des événements planning
// Ne contient AUCUNE logique métier
// Ne contient AUCUN rendu matrice
// Expose window.PlanningEvents

(function () {
  "use strict";

  if (!window.PlanningCore) {
    throw new Error("PlanningCore requis avant PlanningEvents");
  }

  const {
    computeUnavailableIDEsFromAffectations
  } = window.PlanningCore;

  function onWeekChange({ semaineInput, anneeInput, onChange }) {
    if (!semaineInput || !anneeInput) return;

    function handler() {
      const semaine = Number(semaineInput.value);
      const annee = Number(anneeInput.value);

      if (typeof onChange === "function") {
        onChange({ semaine, annee });
      }
    }

    semaineInput.addEventListener("change", handler);
    anneeInput.addEventListener("change", handler);
  }

  function onExportClick({ button, onClick }) {
    if (!button) return;

    button.addEventListener("click", function () {
      if (typeof onClick === "function") {
        onClick();
      }
    });
  }

  function onCellClickDelegation({
    container,
    affectationsProvider,
    onCellClick
  }) {
    if (!container) return;

    container.addEventListener("click", function (event) {

      const td = event.target.closest("td");
      if (!td) return;

      const tr = td.parentElement;
      if (!tr) return;

      const rowHeader = tr.querySelector("th");
      if (!rowHeader) return;

      const label = rowHeader.textContent || "";
      const parts = label.split("—").map(s => s.trim());

      if (parts.length !== 2) return;

      const secteur = parts[0];
      const creneau = parts[1];

      const table = container.querySelector("table");
      if (!table) return;

      const colIndex = Array.from(tr.children).indexOf(td);
      if (colIndex <= 0) return;

      const headerRow = table.querySelector("thead tr");
      if (!headerRow) return;

      const headerCell = headerRow.children[colIndex];
      if (!headerCell) return;

      const jourLabel = headerCell.textContent || "";

      const affectations = typeof affectationsProvider === "function"
        ? affectationsProvider()
        : [];

      const indisponibles = computeUnavailableIDEsFromAffectations(
        affectations,
        jourLabel,
        creneau
      );

      if (typeof onCellClick === "function") {
        onCellClick({
          secteur,
          creneau,
          jourLabel,
          indisponibles
        });
      }

    });
  }

  window.PlanningEvents = Object.freeze({
    onWeekChange,
    onExportClick,
    onCellClickDelegation
  });

})();