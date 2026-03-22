// =====================================================
// PLANNING IMPORT UI — extraction depuis planning-controller.js (terrain)
// Import CSV / JSON + Snapshot WORK (export JSON)
// Expose window.PlanningImportUI
// =====================================================

(function () {
  "use strict";

  let _deps = null;

  function setDeps(deps) { _deps = deps; }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("Lecture fichier impossible"));
      fr.onload = () => resolve(String(fr.result ?? ""));
      fr.readAsText(file);
    });
  }

  async function importCSVFile(file) {
    const { $, toast, loadWeekAndRender } = _deps;
    if (!file) return;

    if (!window.PlanningImport?.importWeekFromCSVText) {
      toast("Import indisponible (PlanningImport manquant)");
      return;
    }

    const text = await readFileAsText(file);

    try {
      const res = await PlanningImport.importWeekFromCSVText(text, { overwrite: false });

      $("weekInput") && ($("weekInput").value = String(res.meta.semaine));
      $("yearInput") && ($("yearInput").value = String(res.meta.annee));

      await loadWeekAndRender();
      toast(`Import OK : ${res.key} (${res.count} ligne(s))`);
    } catch (e) {
      if (e?.code === "SEMAINE_DEJA_EXISTANTE") {
        const ok = confirm(`La semaine ${e.key} existe déjà.\nRemplacer les données par le CSV ?`);
        if (!ok) { toast("Import annulé"); return; }

        const res2 = await PlanningImport.importWeekFromCSVText(text, { overwrite: true });

        $("weekInput") && ($("weekInput").value = String(res2.meta.semaine));
        $("yearInput") && ($("yearInput").value = String(res2.meta.annee));

        await loadWeekAndRender();
        toast(`Import OK (remplacement) : ${res2.key} (${res2.count} ligne(s))`);
        return;
      }

      toast(e?.message || e);
    }
  }

  async function importJSONFile(file) {
    const { $, toast, loadWeekAndRender } = _deps;
    if (!file) return;

    if (!window.PlanningImport?.importWeekFromJSONText) {
      toast("Import JSON indisponible (importWeekFromJSONText manquant)");
      return;
    }

    const text = await readFileAsText(file);

    try {
      const res = await PlanningImport.importWeekFromJSONText(text, { overwrite: false });

      $("weekInput") && ($("weekInput").value = String(res.meta.semaine));
      $("yearInput") && ($("yearInput").value = String(res.meta.annee));

      await loadWeekAndRender();
      toast(`Import JSON OK : ${res.key} (${res.count} ligne(s))`);
    } catch (e) {
      if (e?.code === "SEMAINE_DEJA_EXISTANTE") {
        const ok = confirm(`La semaine ${e.key} existe déjà.\nRemplacer les données par le JSON ?`);
        if (!ok) { toast("Import annulé"); return; }

        const res2 = await PlanningImport.importWeekFromJSONText(text, { overwrite: true });

        $("weekInput") && ($("weekInput").value = String(res2.meta.semaine));
        $("yearInput") && ($("yearInput").value = String(res2.meta.annee));

        await loadWeekAndRender();
        toast(`Import JSON OK (remplacement) : ${res2.key} (${res2.count} ligne(s))`);
        return;
      }

      toast(e?.message || e);
    }
  }

  async function snapshotWork(customFilename) {
    const { toast, readWeekInputs } = _deps;
    const { semaine, annee } = readWeekInputs();
    if (!semaine || !annee) { toast("Semaine/année invalide"); return; }

    // Récupération des données de la semaine courante
    const week = window.PlanningEngine?.getCurrentWeek?.();
    if (!week) { toast("Aucune semaine chargée — chargez d'abord la semaine"); return; }

    // Convention : AAAA_Snn_snapshot.json (tri Windows correct)
    const sLabel = `S${String(semaine).padStart(2, "0")}`;
    const filename = customFilename || `${annee}_${sLabel}_snapshot.json`;
    const json = JSON.stringify(week, null, 2);

    // downloadAsFile est disponible via utils.js (global)
    if (typeof downloadAsFile === "function") {
      downloadAsFile(json, filename, "application/json");
    } else if (typeof window.downloadAsFile === "function") {
      window.downloadAsFile(json, filename, "application/json");
    } else {
      // Fallback natif
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.style.display = "none";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    toast(`Snapshot exporté : ${filename}`);
  }

  // ── Import batch — plusieurs CSV en une passe ────────────────────────────
  async function importCSVFiles(files) {
    const { $, toast, loadWeekAndRender } = _deps;
    if (!files?.length) return;

    if (files.length === 1) {
      return importCSVFile(files[0]);
    }

    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    const results = { ok: [], skipped: [], errors: [] };
    let lastWeek = null;

    for (const file of sorted) {
      if (!window.PlanningImport?.importWeekFromCSVText) {
        toast("Import indisponible (PlanningImport manquant)");
        return;
      }
      try {
        const text = await readFileAsText(file);
        try {
          const res = await PlanningImport.importWeekFromCSVText(text, { overwrite: false });
          results.ok.push(res.key);
          lastWeek = res.meta;
        } catch (e) {
          if (e?.code === "SEMAINE_DEJA_EXISTANTE") {
            results.skipped.push({ key: e.key, file: file.name });
          } else {
            results.errors.push({ file: file.name, msg: e?.message || String(e) });
          }
        }
      } catch (readErr) {
        results.errors.push({ file: file.name, msg: "Lecture impossible" });
      }
    }

    if (lastWeek && $("weekInput") && $("yearInput")) {
      $("weekInput").value = String(lastWeek.semaine);
      $("yearInput").value = String(lastWeek.annee);
    }
    await loadWeekAndRender();

    const lines = [];
    if (results.ok.length)
      lines.push(`✓ ${results.ok.length} importé(s) : ${results.ok.join(", ")}`);
    if (results.skipped.length)
      lines.push(`⏭ ${results.skipped.length} ignoré(s) déjà existants : ${results.skipped.map(s => s.key).join(", ")}`);
    if (results.errors.length)
      lines.push(`✗ ${results.errors.length} erreur(s) : ${results.errors.map(e => e.file).join(", ")}`);

    if (results.skipped.length > 0) {
      const msg = lines.join("\n") + "\n\nRemplacer les semaines déjà existantes ?";
      if (confirm(msg)) {
        for (const { file: fname } of results.skipped) {
          const f = sorted.find(x => x.name === fname);
          if (!f) continue;
          try {
            const text = await readFileAsText(f);
            const res = await PlanningImport.importWeekFromCSVText(text, { overwrite: true });
            results.ok.push(res.key + " (remplacé)");
          } catch(e) {
            results.errors.push({ file: fname, msg: e?.message || String(e) });
          }
        }
        await loadWeekAndRender();
        toast(`Import terminé : ${results.ok.length} semaine(s)`);
      } else {
        toast(lines[0] || "Import terminé");
      }
    } else {
      toast(lines.join(" | ") || "Import terminé");
    }
  }

  window.PlanningImportUI = Object.freeze({
    setDeps,
    readFileAsText,
    importCSVFile,
    importCSVFiles,
    importJSONFile,
    snapshotWork
  });

})();