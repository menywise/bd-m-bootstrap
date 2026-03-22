// ============================================
// PLANNING EXPORT V1.1 - FILE SAFE (IIFE global)
// Export CSV + JSON
// Dépendances : PlanningSchema (global), CDS_Storage (global)
// ============================================

window.PlanningExport = (() => {

  const CSV_HEADER = [
    "semaine","annee","jour","secteur","salle","chirurgien","creneau","ide","role",
    "ouverture","visceral","doublure","doublure_sous","salle_fermee","urgence_fermee"
  ];

  function downloadBlob(filename, content, mime="text/plain") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escCsv(value) {
    const s = String(value ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  }

  function weekToCSV(weekObj) {
    if (!weekObj?.meta) throw new Error("Semaine invalide");

    const { semaine, annee } = weekObj.meta;

    let csv = CSV_HEADER.join(",") + "\n";

    for (const a of (weekObj.affectations || [])) {

      const row = [
        semaine,
        annee,
        a.jour,
        a.secteur,
        a.salle ?? "",
        a.chirurgien ?? "",
        a.creneau,
        a.ide ?? "",
        a.role ?? "",
        a.ouverture ?? 0,
        a.visceral ?? 0,
        a.doublure ?? 0,
        a.doublure_sous ?? "",
        a.salle_fermee ?? 0,
        a.urgence_fermee ?? 0
      ].map(escCsv);

      csv += row.join(",") + "\n";
    }

    return csv;
  }

  async function exportWeekCSV(semaine, annee) {
    const key = PlanningSchema.getWeekKey(semaine, annee);
    const week = await CDS_Storage.get(key);
    if (!week) throw new Error("Semaine introuvable");
    const csv = weekToCSV(week);
    downloadBlob(`${key}.csv`, csv, "text/csv");
  }

  async function exportWeekJSON(semaine, annee) {
    const key = PlanningSchema.getWeekKey(semaine, annee);
    const week = await CDS_Storage.get(key);
    if (!week) throw new Error("Semaine introuvable");
    downloadBlob(`${key}.json`, JSON.stringify(week, null, 2), "application/json");
  }

  async function exportAllPack() {
    const allKeys = await CDS_Storage.keys();
    const keys = allKeys.filter(k => /^\d{4}_\d{2}_planning_week$/.test(k));

    const pack = {
      meta: {
        version: "V1",
        exportedAt: new Date().toISOString(),
        count: keys.length
      },
      weeks: []
    };

    for (const k of keys) {
      const w = await CDS_Storage.get(k);
      if (w?.meta?.semaine && w?.meta?.annee) {
        pack.weeks.push(w);
      }
    }

    pack.weeks.sort((a,b) =>
      (a.meta.annee - b.meta.annee) || (a.meta.semaine - b.meta.semaine)
    );

    downloadBlob(
      `planning_pack_${new Date().toISOString().slice(0,10)}.json`,
      JSON.stringify(pack, null, 2),
      "application/json"
    );
  }

  return {
    weekToCSV,
    exportWeekCSV,
    exportWeekJSON,
    exportAllPack
  };

})();