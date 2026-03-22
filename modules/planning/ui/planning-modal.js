// =====================================================
// PLANNING MODAL — extraction depuis planning-controller.js (terrain)
// AUCUNE logique moteur — uniquement UI / formulaires / helpers.
// Expose window.PlanningModal
// =====================================================
// ⚠ DEPRECATED — CODE MORT (2026-03-04)
// Les IDs lus par getCreateData / setCreateDefaults / getEditData /
// setEditFromAffectation (createJour, createCreneau, createSecteur,
// editJour, editCreneau...) n'existent plus dans planning.html V2.
// La modale V2 est entièrement gérée par PlanningSlotEditor.
// Ce fichier est conservé en attendant validation suppression (Manu).
// N'ajouter aucune nouvelle logique ici.
// =====================================================

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function fillSelect(selectEl, values, { includeEmpty = false } = {}) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    if (includeEmpty) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "—";
      selectEl.appendChild(opt);
    }
    for (const v of values) {
      const opt = document.createElement("option");
      opt.value = String(v);
      opt.textContent = String(v);
      selectEl.appendChild(opt);
    }
  }

  function wireSectorRoleLogic(prefix) {
    const selSecteur = $(`${prefix}Secteur`);
    const selRole = $(`${prefix}Role`);
    if (!selSecteur || !selRole) return;

    function apply() {
      const secteur = selSecteur.value;
      if (secteur === "COULOIR") {
        fillSelect(selRole, ["COULOIR"]);
        selRole.value = "COULOIR";
      } else if (secteur === "SALLE") {
        fillSelect(selRole, ["INSTRU", "PANSEUR"]);
        if (selRole.value !== "INSTRU" && selRole.value !== "PANSEUR") selRole.value = "INSTRU";
      } else {
        fillSelect(selRole, PlanningSchema.ROLES, { includeEmpty: true });
      }
    }

    selSecteur.addEventListener("change", apply);
    apply();
  }

  function getCreateData() {
    return {
      jour: $("createJour")?.value || "",
      creneau: $("createCreneau")?.value || "",
      secteur: $("createSecteur")?.value || "",
      salle: $("createSalle")?.value ?? "",
      chirurgien: $("createChirurgien")?.value || "",
      ide: $("createIDE")?.value || "",
      role: $("createRole")?.value || "",
      ouverture: $("createOuverture")?.checked ? 1 : 0,
      visceral: $("createVisceral")?.checked ? 1 : 0,
      doublure: $("createDoublure")?.checked ? 1 : 0,
      doublure_sous: $("createDoublureSous")?.value || "",
      salle_fermee: $("createSalleFermee")?.checked ? 1 : 0,
      urgence_fermee: $("createUrgenceFermee")?.checked ? 1 : 0
    };
  }

  function setCreateDefaults() {
    $("createJour") && ($("createJour").value = "");
    $("createCreneau") && ($("createCreneau").value = "");
    $("createSecteur") && ($("createSecteur").value = "");
    $("createSalle") && ($("createSalle").value = "");
    $("createChirurgien") && ($("createChirurgien").value = "");
    $("createIDE") && ($("createIDE").value = "");
    $("createRole") && ($("createRole").value = "");
    $("createOuverture") && ($("createOuverture").checked = false);
    $("createVisceral") && ($("createVisceral").checked = false);
    $("createDoublure") && ($("createDoublure").checked = false);
    $("createDoublureSous") && ($("createDoublureSous").value = "");
    $("createSalleFermee") && ($("createSalleFermee").checked = false);
    $("createUrgenceFermee") && ($("createUrgenceFermee").checked = false);
  }

  function getEditData() {
    return {
      jour: $("editJour")?.value || "",
      creneau: $("editCreneau")?.value || "",
      secteur: $("editSecteur")?.value || "",
      salle: $("editSalle")?.value ?? "",
      chirurgien: $("editChirurgien")?.value || "",
      ide: $("editIDE")?.value || "",
      role: $("editRole")?.value || "",
      ouverture: $("editOuverture")?.checked ? 1 : 0,
      visceral: $("editVisceral")?.checked ? 1 : 0,
      doublure: $("editDoublure")?.checked ? 1 : 0,
      doublure_sous: $("editDoublureSous")?.value || "",
      salle_fermee: $("editSalleFermee")?.checked ? 1 : 0,
      urgence_fermee: $("editUrgenceFermee")?.checked ? 1 : 0
    };
  }

  function setEditFromAffectation(a) {
    if (!a) return;
    $("editJour") && ($("editJour").value = a.jour || "");
    $("editCreneau") && ($("editCreneau").value = a.creneau || "");
    $("editSecteur") && ($("editSecteur").value = a.secteur || "");
    $("editSalle") && ($("editSalle").value = a.salle ?? "");
    $("editChirurgien") && ($("editChirurgien").value = a.chirurgien || "");
    $("editIDE") && ($("editIDE").value = a.ide || "");
    $("editRole") && ($("editRole").value = a.role || "");
    $("editOuverture") && ($("editOuverture").checked = Number(a.ouverture) === 1);
    $("editVisceral") && ($("editVisceral").checked = Number(a.visceral) === 1);
    $("editDoublure") && ($("editDoublure").checked = Number(a.doublure) === 1);
    $("editDoublureSous") && ($("editDoublureSous").value = a.doublure_sous || "");
    $("editSalleFermee") && ($("editSalleFermee").checked = Number(a.salle_fermee) === 1);
    $("editUrgenceFermee") && ($("editUrgenceFermee").checked = Number(a.urgence_fermee) === 1);
  }

  function openCreatePrefilled({ jour, creneau, secteur, salle, role }, { fillIDEOptionsWithAvailability } = {}) {
    $("createJour") && ($("createJour").value = String(jour || ""));
    $("createCreneau") && ($("createCreneau").value = String(creneau || ""));
    $("createSecteur") && ($("createSecteur").value = String(secteur || ""));

    if ($("createSalle")) $("createSalle").value = secteur === "SALLE" ? String(salle ?? "") : "";
    if ($("createRole")) {
      if (secteur === "COULOIR") $("createRole").value = "COULOIR";
      else if (secteur === "SALLE") $("createRole").value = role || "INSTRU";
      else $("createRole").value = role || "";
    }

    if (typeof fillIDEOptionsWithAvailability === "function") {
      fillIDEOptionsWithAvailability("create");
    }

    const modalEl = $("modalCreate");
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  window.PlanningModal = Object.freeze({
    $,
    fillSelect,
    wireSectorRoleLogic,
    getCreateData,
    setCreateDefaults,
    getEditData,
    setEditFromAffectation,
    openCreatePrefilled
  });

})();