(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg, kind = "info") {
    const el = $("toastInfo");
    if (!el) return;
    const header = el.querySelector(".toast-header");
    const body = el.querySelector(".toast-body");
    if (body) body.textContent = String(msg ?? "");
    if (header) {
      header.classList.remove("text-danger", "text-success", "text-warning");
      if (kind === "danger") header.classList.add("text-danger");
      if (kind === "success") header.classList.add("text-success");
      if (kind === "warning") header.classList.add("text-warning");
    }
    new bootstrap.Toast(el).show();
  }

  async function listKeys() {
    try {
      const allKeys = await CDS_Storage.keys();
      const keys = allKeys.filter(k => /^\d{4}_\d{2}_planning_week$/.test(k));
      keys.sort();
      const out = $("diagOut");
      if (!out) return;
      if (keys.length === 0) {
        out.textContent = "Aucune clé planning_week";
        return;
      }
      out.textContent = [`Clés planning_week : ${keys.length}`, "", ...keys].join("\n");
    } catch (e) {
      toast(e?.message || e, "danger");
    }
  }

  async function clearStorage() {
    if (!confirm("Confirmer : vider tout le storage local ?")) return;
    try {
      await CDS_Storage.clear();
      toast("Storage vidé", "success");
      await listKeys();
    } catch (e) {
      toast(e?.message || e, "danger");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {

    $("btnExportWeekCSV")?.addEventListener("click", async () => {
      try {
        const semaine = Number($("weekInput")?.value || 0);
        const annee = Number($("yearInput")?.value || 0);
        await PlanningExport.exportWeekCSV(semaine, annee);
        toast("Export CSV effectué", "success");
      } catch (e) {
        toast(e?.message || e, "danger");
      }
    });

    $("btnExportWeekJSON")?.addEventListener("click", async () => {
      try {
        const semaine = Number($("weekInput")?.value || 0);
        const annee = Number($("yearInput")?.value || 0);
        await PlanningExport.exportWeekJSON(semaine, annee);
        toast("Export JSON effectué", "success");
      } catch (e) {
        toast(e?.message || e, "danger");
      }
    });

    // Pack : aujourd'hui exportAllPack (existant).
    // Si plus tard un <select id="monthInput"> existe ET PlanningExport.exportMonthPack est dispo,
    // le bouton "Exporter pack" exportera un pack mensuel.
    $("btnExportAllPack")?.addEventListener("click", async () => {
      try {
        const annee = Number($("yearInput")?.value || 0);
        const monthEl = $("monthInput");
        const month = monthEl ? Number(monthEl.value || 0) : 0;

        if (monthEl && window.PlanningExport?.exportMonthPack && month >= 1 && month <= 12) {
          await PlanningExport.exportMonthPack(annee, month);
          toast("Export pack mensuel effectué", "success");
        } else {
          await PlanningExport.exportAllPack();
          toast("Export pack effectué", "success");
        }
      } catch (e) {
        toast(e?.message || e, "danger");
      }
    });

    $("btnListKeys")?.addEventListener("click", () => listKeys().catch(console.error));
    $("btnClearStorage")?.addEventListener("click", () => clearStorage().catch(console.error));

    listKeys().catch(console.error);
  });
})();