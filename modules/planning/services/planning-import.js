// ============================================
// PLANNING IMPORT V1.2 - FILE SAFE (IIFE global)
// Import CSV -> CDS_Storage (semaine)
// Dépendances : PlanningSchema (global), CDS_Storage (global)
// ============================================

window.PlanningImport = (() => {

  // CSV attendu : identique à PlanningExport.CSV_HEADER
  const REQUIRED_HEADER = [
    "semaine","annee","jour","secteur","salle","chirurgien","creneau","ide","role",
    "ouverture","visceral","doublure","doublure_sous","salle_fermee","urgence_fermee"
  ];

  function normalizeHeaderCell(s) {
    return String(s ?? "").trim().toLowerCase();
  }

  function parseCSV(text) {
    const src = String(text ?? "");
    if (!src.trim()) throw new Error("CSV vide");

    // Parser CSV simple + guillemets ("") conforme export actuel
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];

      if (inQuotes) {
        if (ch === '"') {
          const next = src[i + 1];
          if (next === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cell += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
        continue;
      }

      if (ch === ",") {
        row.push(cell);
        cell = "";
        continue;
      }

      if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
        continue;
      }

      if (ch === "\r") continue;

      cell += ch;
    }

    // dernière ligne si pas finie par \n
    if (cell.length > 0 || row.length > 0) {
      row.push(cell);
      rows.push(row);
    }

    // supprimer lignes vides
    return rows.filter(r => r.some(c => String(c ?? "").trim() !== ""));
  }

  function buildIndexMap(headerRow) {
    const header = headerRow.map(normalizeHeaderCell);

    // Validation stricte : mêmes colonnes, même ordre (évite la “semi-compatibilité” dangereuse)
    const expected = REQUIRED_HEADER.map(normalizeHeaderCell);

    if (header.length !== expected.length) {
      throw new Error(`Header CSV invalide (colonnes ${header.length} au lieu de ${expected.length})`);
    }

    for (let i = 0; i < expected.length; i++) {
      if (header[i] !== expected[i]) {
        throw new Error(`Header CSV invalide (colonne ${i + 1} attendue "${REQUIRED_HEADER[i]}", reçue "${headerRow[i]}")`);
      }
    }

    const idx = {};
    for (let i = 0; i < header.length; i++) idx[REQUIRED_HEADER[i]] = i;
    return idx;
  }

  function toInt01(v) {
    const s = String(v ?? "").trim();
    if (s === "1") return 1;
    if (s === "0" || s === "") return 0;
    // tolérance : "true"/"false" éventuels
    if (s.toLowerCase() === "true") return 1;
    if (s.toLowerCase() === "false") return 0;
    const n = Number(s);
    if (n === 1) return 1;
    if (n === 0) return 0;
    throw new Error(`Valeur booléenne invalide "${v}" (attendu 0/1)`);
  }

  function rowToAffectation(row, map) {
    // IMPORTANT : on conserve les chaînes telles quelles (chirurgien/ide), pour compat legacy.
    // Validation métier reste faite via PlanningSchema.validateAffectation().

    // ✅ COMPAT LEGACY (V1.2.1)
    // Historique : des CSV ont "role" vide en SALLE (salle active) -> on force INSTRU pour passer la validation stricte.
    // La donnée reste éditable ensuite dans l'UI.
    let secteur = String(row[map.secteur] ?? "").trim();
    let role = String(row[map.role] ?? "").trim();
    const salleFermee = toInt01(row[map.salle_fermee]);

    if (secteur === "SALLE" && !role && salleFermee !== 1) {
      role = "INSTRU";
    }

    return PlanningSchema.createAffectation({
      jour: String(row[map.jour] ?? "").trim(),
      secteur: secteur,
      salle: String(row[map.salle] ?? "").trim(),
      chirurgien: String(row[map.chirurgien] ?? "").trim(),
      creneau: String(row[map.creneau] ?? "").trim(),
      ide: String(row[map.ide] ?? "").trim(),
      role: role,
      ouverture: toInt01(row[map.ouverture]),
      visceral: toInt01(row[map.visceral]),
      doublure: toInt01(row[map.doublure]),
      doublure_sous: String(row[map.doublure_sous] ?? "").trim(),
      salle_fermee: salleFermee,
      urgence_fermee: toInt01(row[map.urgence_fermee])
    });
  }

  function extractMeta(rows, map) {
    let semaine = null;
    let annee = null;

    for (let i = 1; i < rows.length; i++) {
      const s = String(rows[i][map.semaine] ?? "").trim();
      const a = String(rows[i][map.annee] ?? "").trim();
      if (!s || !a) continue;

      const sn = Number(s);
      const an = Number(a);

      if (!Number.isFinite(sn) || !Number.isFinite(an)) {
        throw new Error(`Meta invalide (semaine/annee) à la ligne ${i + 1}`);
      }

      if (semaine === null) semaine = sn;
      if (annee === null) annee = an;

      if (sn !== semaine || an !== annee) {
        throw new Error("CSV mélange plusieurs semaines/années (non supporté)");
      }
    }

    if (semaine === null || annee === null) {
      throw new Error("Impossible de déterminer semaine/année (colonnes semaine/annee vides)");
    }

    return { semaine, annee };
  }

  async function importWeekFromCSVText(csvText, { overwrite = false } = {}) {
    const rows = parseCSV(csvText);
    if (rows.length < 2) throw new Error("CSV sans données (uniquement header)");

    const map = buildIndexMap(rows[0]);
    const meta = extractMeta(rows, map);

    const key = PlanningSchema.getWeekKey(meta.semaine, meta.annee);

    const existing = await CDS_Storage.get(key);
    if (existing && !overwrite) {
      const err = new Error("SEMAINE_DEJA_EXISTANTE");
      err.code = "SEMAINE_DEJA_EXISTANTE";
      err.key = key;
      err.meta = meta;
      return Promise.reject(err);
    }

    const week = PlanningSchema.createWeek(meta.semaine, meta.annee);
    const affectations = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // tolère lignes vides partielles
      if (!row || row.every(c => String(c ?? "").trim() === "")) continue;

      const a = rowToAffectation(row, map);

      // validation métier stricte existante
      PlanningSchema.validateAffectation(a);

      affectations.push(a);
    }

    week.affectations = affectations;

    await CDS_Storage.set(key, week);

    return {
      key,
      meta,
      count: affectations.length
    };
  }


  async function importWeekFromJSONText(jsonText, { overwrite = false } = {}) {
    let week;
    try {
      week = JSON.parse(String(jsonText ?? ""));
    } catch (e) {
      throw new Error("JSON invalide");
    }

    const meta = week?.meta;
    const semaine = Number(meta?.semaine);
    const annee = Number(meta?.annee);

    if (!Number.isFinite(semaine) || !Number.isFinite(annee)) {
      throw new Error("JSON semaine invalide (meta.semaine/meta.annee requis)");
    }

    const key = PlanningSchema.getWeekKey(semaine, annee);

    const existing = await CDS_Storage.get(key);
    if (existing && !overwrite) {
      const err = new Error("SEMAINE_DEJA_EXISTANTE");
      err.code = "SEMAINE_DEJA_EXISTANTE";
      err.key = key;
      err.meta = { semaine, annee };
      return Promise.reject(err);
    }

    const cleanWeek = PlanningSchema.createWeek(semaine, annee);
    const rows = Array.isArray(week.affectations) ? week.affectations : [];
    const affectations = [];

    for (const raw of rows) {
      const a = PlanningSchema.createAffectation(raw);

      // compat legacy identique CSV : role vide en SALLE active -> INSTRU
      if (a.secteur === "SALLE" && !a.role && Number(a.salle_fermee) !== 1) {
        a.role = "INSTRU";
      }

      PlanningSchema.validateAffectation(a);
      affectations.push(a);
    }

    cleanWeek.affectations = affectations;

    await CDS_Storage.set(key, cleanWeek);

    return {
      key,
      meta: { semaine, annee },
      count: affectations.length
    };
  }

  return {
    parseCSV,
    importWeekFromCSVText,
    importWeekFromJSONText
  };

})();