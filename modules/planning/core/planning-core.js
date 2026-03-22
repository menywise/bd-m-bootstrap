// ============================================
// PLANNING CORE V1.1 — FILE SAFE (IIFE global)
// Fonctions pures extraites de planning-controller.js
// AUCUN DOM — AUCUNE dépendance window.*
// Expose window.PlanningCore
// ============================================

(function () {
  "use strict";

  // ── Constantes ────────────────────────────────────────────────────────────

  const MONTHS_FR = [
    "janvier","février","mars","avril","mai","juin",
    "juillet","août","septembre","octobre","novembre","décembre"
  ];

  // ── Utilitaires texte ─────────────────────────────────────────────────────

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pad2(n) {
    const x = Number(n);
    return x < 10 ? `0${x}` : String(x);
  }

  // ── Dates ─────────────────────────────────────────────────────────────────

  function formatDateFR(d) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  function formatShortDayFR(d) {
    const days = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    return `${days[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
  }

  function getISOWeekMonday(week, year) {
    // ISO week : lundi premier jour ; semaine 1 = semaine contenant le 4 janvier
    const w = Number(week);
    const y = Number(year);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const day = jan4.getUTCDay() || 7; // 1..7
    const mondayWeek1 = new Date(jan4);
    mondayWeek1.setUTCDate(jan4.getUTCDate() - (day - 1));
    const monday = new Date(mondayWeek1);
    monday.setUTCDate(mondayWeek1.getUTCDate() + (w - 1) * 7);
    return new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
  }

  function computeWeekDates(semaine, annee) {
    const mon = getISOWeekMonday(semaine, annee);
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push(d);
    }
    return { monday: mon, days, friday: days[4] };
  }

  // ── Logique métier pure ───────────────────────────────────────────────────

  // RÈGLE : nom complet — pas de troncature prénom/nom.
  // Conforme au comportement du controller original (String(x.ide).trim()).
  function summarizeCell(list, { isCouloir = false } = {}) {
    if (!Array.isArray(list) || list.length === 0) return "";

    if (isCouloir) {
      const ides = Array.from(
        new Set(list.map(x => String(x.ide || "").trim()).filter(Boolean))
      );
      return ides.join("\n");
    }

    const chir = Array.from(
      new Set(list.map(x => String(x.chirurgien || "").trim()).filter(Boolean))
    )[0] || "";

    const names = list
      .map(x => String(x.ide || "").trim())
      .filter(Boolean);

    const teamStr = Array.from(new Set(names)).join("\n");

    if (chir && teamStr) return chir + "\n" + teamStr;
    return chir || teamStr;
  }

  function isSameSlot(a, jour, creneau) {
    return (
      String(a?.jour || "") === String(jour || "") &&
      String(a?.creneau || "") === String(creneau || "")
    );
  }

  function fullName(m) {
    return `${String(m?.nom || "").trim()} ${String(m?.prenom || "").trim()}`.trim();
  }

  function uniqSorted(arr) {
    return Array.from(new Set((arr || []).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "fr"));
  }

  // ── Export global ─────────────────────────────────────────────────────────

  window.PlanningCore = Object.freeze({
    MONTHS_FR,
    escapeHtml,
    pad2,
    formatDateFR,
    formatShortDayFR,
    getISOWeekMonday,
    computeWeekDates,
    summarizeCell,
    isSameSlot,
    fullName,
    uniqSorted
  });

})();
