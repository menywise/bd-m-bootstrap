(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setText(id, v) {
    const el = $(id);
    if (el) el.textContent = String(v ?? "");
  }

  function renderTopList(listEl, items, labelKey = "ide", max = 8) {
    if (!listEl) return;
    listEl.innerHTML = "";
    const top = (items || []).slice(0, max);
    if (top.length === 0) {
      listEl.innerHTML = '<li class="list-group-item text-secondary">Aucune donnée</li>';
      return;
    }
    for (const it of top) {
      const label = escapeHtml(it[labelKey] || "—");
      const vol = Number(it.volume || 0);
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `<span>${label}</span><span class="badge bg-secondary">${vol}</span>`;
      listEl.appendChild(li);
    }
  }

  function renderRelations(tbodyEl, rows, max = 12) {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = "";
    const data = (rows || []).slice(0, max);
    if (data.length === 0) {
      tbodyEl.innerHTML = '<tr><td colspan="3" class="text-secondary">Aucune donnée</td></tr>';
      return;
    }
    for (const r of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.chir || "")}</td>
        <td>${escapeHtml(r.ide || "")}</td>
        <td><span class="badge bg-secondary">${Number(r.volume || 0)}</span></td>
      `;
      tbodyEl.appendChild(tr);
    }
  }

  function renderSituations(tbodyEl, situations) {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = "";
    const data = situations || [];
    if (data.length === 0) {
      tbodyEl.innerHTML = '<tr><td colspan="4" class="text-secondary">Aucune situation détectée</td></tr>';
      return;
    }
    for (const s of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="badge bg-light text-dark border">${escapeHtml(s.type || "")}</span></td>
        <td>${escapeHtml(s.description || "")}</td>
        <td>${escapeHtml(s.jour || "")}</td>
        <td class="text-secondary small">${escapeHtml(s.details || "")}</td>
      `;
      tbodyEl.appendChild(tr);
    }
  }

  async function refresh() {
    const semaine = Number($("weekInput")?.value || 0);
    const annee = Number($("yearInput")?.value || 0);

    const result = await PlanningAnalytics.analyzeWeek(semaine, annee);

    if (!result) {
      setText("weekStatus", `Aucune donnée pour S${String(semaine).padStart(2, "0")} / ${annee}`);
      setText("kpiAffectations", 0);
      setText("kpiCouloir", 0);
      setText("kpiOuvertures", 0);
      setText("kpiVisceral", 0);

      renderTopList($("listTopVisceral"), []);
      renderTopList($("listTopCouloir"), []);
      renderTopList($("listTopOuvertures"), []);
      renderSituations($("tableSituations"), []);
      renderRelations($("tableChirInstru"), []);
      renderRelations($("tableChirPanseur"), []);
      return;
    }

    const stats = result.stats;

    setText("weekStatus", `S${String(result.meta.semaine).padStart(2, "0")} / ${result.meta.annee} — ${stats.totals.affectations} affectation(s)`);
    setText("kpiAffectations", stats.totals.affectations);
    setText("kpiCouloir", stats.totals.couloir);
    setText("kpiOuvertures", stats.totals.ouvertures);
    setText("kpiVisceral", stats.totals.visceral);

    renderTopList($("listTopVisceral"), stats.byIde.visceral);
    renderTopList($("listTopCouloir"), stats.byIde.couloir);
    renderTopList($("listTopOuvertures"), stats.byIde.ouvertures);

    renderSituations($("tableSituations"), result.situations);
    renderRelations($("tableChirInstru"), stats.relations.chirInstru);
    renderRelations($("tableChirPanseur"), stats.relations.chirPanseur);
  }

  async function doExportCSV() {
    const semaine = Number($("weekInput")?.value || 0);
    const annee = Number($("yearInput")?.value || 0);
    await PlanningExport.exportWeekCSV(semaine, annee);
  }

  async function doExportJSON() {
    const semaine = Number($("weekInput")?.value || 0);
    const annee = Number($("yearInput")?.value || 0);
    await PlanningExport.exportWeekJSON(semaine, annee);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("btnRefresh")?.addEventListener("click", () => refresh().catch(console.error));
    $("btnExportCSV")?.addEventListener("click", () => doExportCSV().catch(console.error));
    $("btnExportJSON")?.addEventListener("click", () => doExportJSON().catch(console.error));
    refresh().catch(console.error);
  });
})();