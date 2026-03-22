// ============================================
// PLANNING ANALYTICS V1.1 - FILE SAFE (IIFE global)
// Moteur descriptif d’analyse opératoire
// Dépendances : PlanningSchema (global), CDS_Storage (global)
// ============================================

window.PlanningAnalytics = (() => {

  function safeNum(x) {
    return Number.isFinite(+x) ? +x : 0;
  }

  function groupCount(rows, keyFn) {
    const map = new Map();
    for (const r of rows) {
      const k = keyFn(r);
      map.set(k, (map.get(k) || 0) + 1);
    }
    return map;
  }

  function mapToArray(map, fields) {
    const out = [];
    for (const [key, value] of map.entries()) {
      const parts = String(key).split("||");
      const obj = { volume: value };
      fields.forEach((f, i) => obj[f] = parts[i] || "");
      out.push(obj);
    }
    return out.sort((a,b) => b.volume - a.volume);
  }

  // ============================================
  // ANALYSE D’UNE SEMAINE
  // ============================================

  function computeWeekStats(week) {

    const rows = week?.affectations || [];

    const visceral = rows.filter(r => safeNum(r.visceral) === 1 && r.ide);
    const couloir = rows.filter(r => r.secteur === "COULOIR" && r.ide);
    const ouvertures = rows.filter(r => safeNum(r.ouverture) === 1 && r.ide);
    const doublures = rows.filter(r => safeNum(r.doublure) === 1 && r.ide);

    const visceralByIde = mapToArray(groupCount(visceral, r => r.ide), ["ide"]);
    const couloirByIde = mapToArray(groupCount(couloir, r => r.ide), ["ide"]);
    const ouvertureByIde = mapToArray(groupCount(ouvertures, r => r.ide), ["ide"]);

    const chirInstru = mapToArray(
      groupCount(
        rows.filter(r =>
          r.secteur === "SALLE" &&
          r.role === "INSTRU" &&
          r.chirurgien &&
          r.ide
        ),
        r => `${r.chirurgien}||${r.ide}`
      ),
      ["chir", "ide"]
    );

    const chirPanseur = mapToArray(
      groupCount(
        rows.filter(r =>
          r.secteur === "SALLE" &&
          r.role === "PANSEUR" &&
          r.chirurgien &&
          r.ide
        ),
        r => `${r.chirurgien}||${r.ide}`
      ),
      ["chir", "ide"]
    );

    return {
      totals: {
        affectations: rows.length,
        visceral: visceral.length,
        couloir: couloir.length,
        ouvertures: ouvertures.length,
        doublures: doublures.length
      },
      byIde: {
        visceral: visceralByIde,
        couloir: couloirByIde,
        ouvertures: ouvertureByIde
      },
      relations: {
        chirInstru,
        chirPanseur
      }
    };
  }

  // ============================================
  // DETECTION DES SITUATIONS
  // ============================================

  function detectSituations(week) {

    const rows = week?.affectations || [];
    const meta = week?.meta || {};
    const situations = [];

    // 1️⃣ Salle fermée (NATUREL vs DÉGRADÉ)
    rows
      .filter(r => safeNum(r.salle_fermee) === 1 && r.salle)
      .forEach(r => {
        const isDegrade = safeNum(r.ferme_degrade) === 1;
        situations.push({
          type: isDegrade ? "SALLE_FERMEE_DEGRADE" : "SALLE_FERMEE_NATUREL",
          semaine: meta.semaine,
          jour: r.jour,
          salle: r.salle,
          creneau: r.creneau,
          description: `Salle ${r.salle} fermée ${isDegrade ? "(dégradé)" : "(naturel)"} (${r.jour} ${r.creneau})`,
          details: `${r.secteur} | ${r.role || ""}`.trim()
        });
      });

    // 2️⃣ Urgence fermée
    rows
      .filter(r => safeNum(r.urgence_fermee) === 1)
      .forEach(r => {
        situations.push({
          type: "URGENCE_FERMEE",
          semaine: meta.semaine,
          jour: r.jour,
          description: `Urgence fermée (${r.jour} ${r.creneau})`,
          details: `${r.ide || ""}`.trim()
        });
      });

    // 3️⃣ Doublure
    rows
      .filter(r => safeNum(r.doublure) === 1 && r.ide)
      .forEach(r => {
        situations.push({
          type: "DOUBLURE",
          semaine: meta.semaine,
          jour: r.jour,
          description: `Doublure : ${r.ide} (${r.jour} ${r.creneau})`,
          details: `${r.doublure_sous || ""}`.trim()
        });
      });

    // 4️⃣ Viscéral couloir soir
    rows
      .filter(r =>
        safeNum(r.visceral) === 1 &&
        r.secteur === "COULOIR" &&
        r.creneau === "SOIR"
      )
      .forEach(r => {
        situations.push({
          type: "VISCERAL_COULEUR_SOIR",
          semaine: meta.semaine,
          jour: r.jour,
          description: `Viscéral au couloir le soir : ${r.ide || "?"}`,
          details: `${r.creneau}`
        });
      });

    return situations;
  }

  // ============================================
  // API PUBLIQUE
  // ============================================

  async function analyzeWeek(semaine, annee) {

    const key = PlanningSchema.getWeekKey(semaine, annee);
    const week = await CDS_Storage.get(key);

    if (!week) return null;

    const stats = computeWeekStats(week);
    const situations = detectSituations(week);

    return {
      meta: week.meta,
      stats,
      situations
    };
  }

  async function analyzeAll() {

    const allKeys = await CDS_Storage.keys();
    const keys = allKeys.filter(k => /^\d{4}_\d{2}_planning_week$/.test(k));

    const results = [];

    for (const k of keys) {
      const w = await CDS_Storage.get(k);
      if (w?.meta?.semaine && w?.meta?.annee) {
        results.push({
          key: k,
          meta: w.meta,
          stats: computeWeekStats(w),
          situations: detectSituations(w)
        });
      }
    }

    // tri stable (annee, semaine)
    results.sort((a,b) =>
      (a.meta.annee - b.meta.annee) || (a.meta.semaine - b.meta.semaine)
    );

    return results;
  }

  return {
    computeWeekStats,
    detectSituations,
    analyzeWeek,
    analyzeAll
  };

})();