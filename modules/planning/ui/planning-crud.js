// =====================================================
// PLANNING CRUD — extraction depuis planning-controller.js (terrain)
// Create / Edit / Delete (legacy table buttons)
// Expose window.PlanningCRUD
// =====================================================
// ⚠ DEPRECATED — CODE MORT (2026-03-04)
// doCreate() appelle PlanningModal.getCreateData() qui lit des IDs
// inexistants dans planning.html V2. Aucun bouton du controller
// ne câble plus PlanningCRUD. La logique CRUD est assurée par
// PlanningSlotEditor (V2) et la suppression par btn-delete-slot.
// Ce fichier est conservé en attendant validation suppression (Manu).
// =====================================================

(function () {
  "use strict";

  let _deps = null;
  let editIndex = null;

  function setDeps(deps) { _deps = deps; }

  async function doCreate() {
    const { toast, loadWeekAndRender } = _deps;
    try {
      const data = window.PlanningModal.getCreateData();
      await PlanningEngine.addAffectation(data);
      window.PlanningModal.setCreateDefaults();

      const modalEl = window.PlanningModal.$("modalCreate");
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();

      await loadWeekAndRender();
      toast("Affectation créée");
    } catch (e) {
      toast(e?.message || e);
    }
  }

  async function doDelete(idx) {
    const { toast, loadWeekAndRender } = _deps;
    if (!confirm("Supprimer cette affectation ?")) return;

    try {
      await PlanningEngine.removeAffectation(idx);
      await loadWeekAndRender();
      toast("Affectation supprimée");
    } catch (e) {
      toast(e?.message || e);
    }
  }

  async function openEdit(idx) {
    const { toast, $, getStrictSalles, getStrictChirurgiens } = _deps;

    const week = PlanningEngine.getCurrentWeek();
    const a = week?.affectations?.[idx];
    if (!a) { toast("Affectation introuvable"); return; }

    editIndex = idx;

    window.PlanningModal.setEditFromAffectation(a);

    window.PlanningModal.fillSelect($("editSalle"), getStrictSalles(), { includeEmpty: true });
    window.PlanningModal.fillSelect($("editChirurgien"), getStrictChirurgiens(), { includeEmpty: true });

    // IDE : input + datalist (filtrage couloir/viscéral)
    window.PlanningAvailability.fillIDEOptionsWithAvailability("edit");

    const modalEl = $("modalEdit");
    if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  async function doSaveEdit() {
    const { toast, loadWeekAndRender, $ } = _deps;

    if (editIndex === null) { toast("Index édition invalide"); return; }

    try {
      const data = window.PlanningModal.getEditData();
      await PlanningEngine.updateAffectation(editIndex, data);

      const modalEl = $("modalEdit");
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();

      editIndex = null;
      await loadWeekAndRender();
      toast("Affectation mise à jour");
    } catch (e) {
      toast(e?.message || e);
    }
  }

  window.PlanningCRUD = Object.freeze({
    setDeps,
    doCreate,
    doDelete,
    openEdit,
    doSaveEdit
  });

})();