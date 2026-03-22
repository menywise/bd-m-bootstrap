// ============================================================
// STORAGE KEY SERVICE V1.0.0
// Contrat officiel : STORAGE_KEYS_CONTRACT v1.0.0
// Toute génération ou lecture de clé semaine passe par ici.
// ============================================================

window.StorageKeyService = (() => {

  // Format officiel : YYYY_WW_planning_week
  const WEEK_SUFFIX = "planning_week";
  const WEEK_REGEX  = /^(\d{4})_(\d{2})_planning_week$/;

  /**
   * Génère la clé de stockage officielle pour une semaine.
   * @param {number} annee  — ex : 2026
   * @param {number} semaine — ex : 9
   * @returns {string}       — ex : "2026_09_planning_week"
   */
  function makeWeekKey(annee, semaine) {
    if (!annee || !semaine) throw new Error("makeWeekKey : annee et semaine requis");
    return `${annee}_${String(semaine).padStart(2, "0")}_${WEEK_SUFFIX}`;
  }

  /**
   * Vérifie si une clé est une clé semaine valide.
   * @param {string} key
   * @returns {boolean}
   */
  function isWeekKey(key) {
    return WEEK_REGEX.test(key);
  }

  /**
   * Parse une clé semaine et retourne { annee, semaine }.
   * Retourne null si la clé n'est pas valide.
   * @param {string} key
   * @returns {{ annee: number, semaine: number } | null}
   */
  function parseWeekKey(key) {
    const m = WEEK_REGEX.exec(key);
    if (!m) return null;
    return { annee: Number(m[1]), semaine: Number(m[2]) };
  }

  /**
   * Retourne toutes les clés semaine présentes dans le storage,
   * triées chronologiquement.
   * @returns {Promise<string[]>}
   */
  async function listWeekKeys() {
    const all = await CDS_Storage.keys();
    return all.filter(isWeekKey).sort();
  }

  return { makeWeekKey, isWeekKey, parseWeekKey, listWeekKeys };

})();
