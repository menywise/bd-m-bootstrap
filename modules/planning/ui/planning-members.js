/* ═══════════════════════════════════════════════════════════════════════════
   PLANNING ENGINE — Members Lookup Table
   FILE   : planning-members.js
   VERSION: 1.0.0
   UPDATE : 2026-02-22

   PRINCIPE : table plate CODE_CSV → membre canonique
   Zéro heuristique. Zéro normalisation d'accents.
   Si un code n'est pas ici → affiché en rouge dans la matrice.

   POUR AJOUTER UN MEMBRE :
   Ajouter une entrée dans MEMBERS_TABLE (ou un alias dans CODE_LOOKUP).
   ═══════════════════════════════════════════════════════════════════════════ */

const PlanningMembers = (() => {

  // =====================================================================
  // TABLE CANONIQUE — 1 entrée par personne
  // fn : "medecin" | "infirmier" | "cadre" | "aide-soignant" | "placeholder"
  // display : ce qui s'affiche dans la matrice
  //   - médecin  → "Dr NOM" (calculé automatiquement)
  //   - IDE      → prénom seul (ou "Prénom N." si doublon détecté)
  //   - placeholder → libellé fixe
  // =====================================================================
  const MEMBERS_TABLE = [

    // ── MÉDECINS ────────────────────────────────────────────────────────
    { code: "ALAIN",       nom: "ALAIN",       prenom: "Jérôme",       fn: "medecin",    actif: true  },
    { code: "BOSCHER",     nom: "BOSCHER",     prenom: "Julien",        fn: "medecin",    actif: true  },
    { code: "CHROSCIANY",  nom: "CHROSCIANY",  prenom: "Sacha",         fn: "medecin",    actif: true  },
    { code: "COSTE",       nom: "COSTE",       prenom: "Cédric",        fn: "medecin",    actif: true  },
    { code: "DOTZIS",      nom: "DOTZIS",      prenom: "Anthony",       fn: "medecin",    actif: true  },
    { code: "FOURASTIER",  nom: "FOURASTIER",  prenom: "Jacques",       fn: "medecin",    actif: true }, // retraité — présent sur plannings 2025
    { code: "LAGARRIGUE",  nom: "LAGARRIGUE",  prenom: "Jean-François", fn: "medecin",    actif: true  },
    { code: "LOUISIA",     nom: "LOUISIA",     prenom: "Stéphane",      fn: "medecin",    actif: true  },
    { code: "MARCZUK",     nom: "MARCZUK",     prenom: "Yann",          fn: "medecin",    actif: true  },
    { code: "PICOULEAU",   nom: "PICOULEAU",   prenom: "Alexandre",     fn: "medecin",    actif: true  },
    { code: "VACQUERIE",   nom: "VACQUERIE",   prenom: "Virginie",      fn: "medecin",    actif: true  },

    // ── IDE ─────────────────────────────────────────────────────────────
    { code: "BUENO_S",     nom: "BUENO",       prenom: "Sophie",        fn: "infirmier",  actif: true  },
    { code: "CARRIER_E",   nom: "CARRIER",     prenom: "Éléonore",      fn: "infirmier",  actif: true  },
    { code: "COMPAIN_J",   nom: "COMPAIN",     prenom: "Julie",         fn: "infirmier",  actif: true  },
    { code: "DA_COSTA",    nom: "DA COSTA",    prenom: "Emma",          fn: "infirmier",  actif: true  },  // sans initiale dans les CSV
    { code: "DELONG_I",    nom: "DELONG",      prenom: "Isabelle",      fn: "infirmier",  actif: true  },
    { code: "DUGOT_S",     nom: "DUGOT",       prenom: "Sabine",        fn: "infirmier",  actif: true  },
    { code: "FREDAIGUE_C", nom: "FREDAIGUE",   prenom: "Cynthia",       fn: "infirmier",  actif: true  },
    { code: "LABARDE_V",   nom: "LABARDE",     prenom: "Valérie",       fn: "infirmier",  actif: true }, // a quitté l'équipe — présente sur plannings 2025
    { code: "LEPROUX_C",   nom: "LEPROUX",     prenom: "Carole",        fn: "infirmier",  actif: true  },
    { code: "MAILLET_V",   nom: "MAILLET",     prenom: "Valérie",       fn: "infirmier",  actif: true  },
    { code: "MERIC_Q",     nom: "MERIC DE BELFON", prenom: "Quentin",   fn: "infirmier",  actif: true  }, // code court CSV vs nom complet registre
    { code: "NARBONNE_S",  nom: "NARBONNE",    prenom: "Sarah",         fn: "infirmier",  actif: true  },
    { code: "NICOLAS_C",   nom: "NICOLAS",     prenom: "Carole",        fn: "infirmier",  actif: true  },
    { code: "NORMAND_C",   nom: "NORMAND",     prenom: "Carine",        fn: "infirmier",  actif: true  }, // aussi LAMARCHE ou LAMARCHE-NORMAND selon période
    { code: "PAQUIER_M",   nom: "PAQUIER",     prenom: "Marion",        fn: "infirmier",  actif: true  },
    { code: "PARRE_F",     nom: "PARRE",       prenom: "Franck",        fn: "infirmier",  actif: true  },
    { code: "ROHAUT_M",    nom: "ROHAUT",      prenom: "Manuel",        fn: "infirmier",  actif: true  },
    { code: "THUILLIER_E", nom: "THUILLIER",   prenom: "Emma",          fn: "infirmier",  actif: true  },

    // ── CADRES ──────────────────────────────────────────────────────────
    { code: "HAMSA_O",     nom: "HAMSA",       prenom: "Olivia",        fn: "cadre",      actif: true  },
    { code: "LEFAUCHEUR_R",nom: "LEFAUCHEUR",  prenom: "Romain",        fn: "cadre",      actif: true  },
    { code: "MAUSSET_E",   nom: "MAUSSET",     prenom: "Estelle",       fn: "cadre",      actif: true  },

    // ── AIDE-SOIGNANT ────────────────────────────────────────────────────
    { code: "SARTOUT_F",   nom: "SARTOUT",     prenom: "Faustine",      fn: "aide-soignant", actif: true },

    // ── PLACEHOLDERS SYSTÈME ────────────────────────────────────────────
    { code: "INTERIMAIRE", nom: "INTERIMAIRE", prenom: "",              fn: "placeholder", actif: true },
    { code: "VISCERAL",    nom: "VISCERAL",    prenom: "",              fn: "placeholder", actif: true },
    { code: "ETUDIANT",    nom: "ETUDIANT",    prenom: "",              fn: "placeholder", actif: true },
  ];

  // =====================================================================
  // ALIAS — codes alternatifs → code canonique
  // Tous les codes CSV qui ne sont pas dans MEMBERS_TABLE ci-dessus
  // =====================================================================
  const ALIAS_MAP = {
    // NORMAND / LAMARCHE — même personne, nom variable selon période
    "LAMARCHE_C":          "NORMAND_C",
    "LAMARCHE-NORMAND_C":  "NORMAND_C",
    "LAMARCHE":            "NORMAND_C",
    "NORMAND":             "NORMAND_C",

    // Personnel de renfort → VISCERAL
    "MONZAUGE_S":  "VISCERAL",
    "MONZAUGE":    "VISCERAL",
    "SANDRINE":    "INTERIMAIRE", // GUILLAUME Sandrine — prénom seul
    "OCEANE":      "VISCERAL",
    "OCÉANE":      "VISCERAL",
    "OCEANE_P":    "VISCERAL",
    "LATHIERE_O":  "VISCERAL",
    "LATHIERE":    "VISCERAL",
    "OPHELIE":     "VISCERAL",
    "OPHÉLIE":     "VISCERAL",
    "ARTHUR":      "VISCERAL",
    "HELENE":      "VISCERAL",
    "HÉLÈNE":      "VISCERAL",
    "HELENE_":     "VISCERAL",

    // Personnel de renfort → INTERIMAIRE
    "GUILLAUME_S": "INTERIMAIRE",
    "GUILLAUME":   "INTERIMAIRE",
    "INTERIM":     "INTERIMAIRE",

    // Personnel → ETUDIANT
    "AUDE":        "ETUDIANT",

    // DA COSTA — avec ou sans initiale
    "DA_COSTA_E":  "DA_COSTA",
    "DACOSTA_E":   "DA_COSTA",
    "DACOSTA":     "DA_COSTA",

    // MERIC — alias court
    "MERIC_DE_BELFON_Q": "MERIC_Q",
    "MERIC":             "MERIC_Q",
  };

  // =====================================================================
  // INDEX — lookup O(1)
  // =====================================================================
  const _byCode = {};
  for (const m of MEMBERS_TABLE) {
    _byCode[m.code.toUpperCase()] = m;
  }

  // =====================================================================
  // API PUBLIQUE
  // =====================================================================

  /**
   * Résoudre un code CSV → membre canonique
   * @param {string} code — code brut du CSV (ex: "PARRE_F", "MERIC_Q")
   * @returns {object|null} — entrée MEMBERS_TABLE ou null si inconnu
   */
  function resolve(code) {
    if (!code) return null;
    const upper = String(code).trim().toUpperCase();

    // 1. Lookup direct
    if (_byCode[upper]) return _byCode[upper];

    // 2. Via alias
    const canonical = ALIAS_MAP[upper];
    if (canonical && _byCode[canonical.toUpperCase()]) {
      return _byCode[canonical.toUpperCase()];
    }

    return null; // inconnu → affiché en rouge dans la matrice
  }

  /**
   * Texte d'affichage pour la matrice
   * @param {string} code
   * @param {string[]} [allIDECodes] — pour détecter les doublons de prénom
   * @returns {string}
   */
  // Prénoms qui existent chez plusieurs membres du registre
  // Calculé une fois au chargement
  const _DUPLICATED_FIRSTNAMES = (function() {
    const counts = {};
    for (const m of MEMBERS_TABLE) {
      if (m.fn === "placeholder") continue;
      const p = m.prenom || m.nom;
      counts[p] = (counts[p] || 0) + 1;
    }
    const dupes = new Set();
    for (const [p, n] of Object.entries(counts)) {
      if (n > 1) dupes.add(p);
    }
    return dupes;
  })();

  /**
   * Texte d'affichage pour la matrice
   * Les doublons prénom sont détectés sur TOUT le registre (pas juste la cellule)
   * Ex : Emma → toujours "Emma D." / "Emma T."
   *      Carole → toujours "Carole L." / "Carole N."
   */
  function display(code) {
    const m = resolve(code);
    if (!m) return code; // code inconnu — sera affiché en rouge

    if (m.fn === "medecin") {
      return "Dr " + m.nom.toUpperCase();
    }

    if (m.fn === "placeholder") {
      return m.code === "INTERIMAIRE" ? "Intérim"
           : m.code === "VISCERAL"    ? "Viscéral"
           : m.code === "ETUDIANT"    ? "Étudiant"
           : m.code;
    }

    // IDE / cadre / AS
    const prenom = m.prenom || m.nom;
    if (_DUPLICATED_FIRSTNAMES.has(prenom)) {
      // Initiale NOM pour différencier : "Emma D." / "Emma T." / "Carole L." / "Carole N."
      return prenom + " " + m.nom.charAt(0) + ".";
    }
    return prenom;
  }

  /**
   * Liste complète des médecins (pour les selects chirurgiens)
   * @param {boolean} [inclureInactifs=true]
   */
  /** Retourne les codes médecins (value des selects) */
  function getMedecins(inclureInactifs = true) {
    return MEMBERS_TABLE
      .filter(m => m.fn === "medecin" && (inclureInactifs || m.actif))
      .map(m => m.code);
  }

  /** Retourne les codes IDE (value des selects) */
  function getIDEs(inclureInactifs = true) {
    return MEMBERS_TABLE
      .filter(m => m.fn === "infirmier" && (inclureInactifs || m.actif))
      .sort((a, b) => (a.prenom || "").localeCompare(b.prenom || "", "fr", { sensitivity: "base" }))
      .map(m => m.code);
  }

  /**
   * Vrai si le code est un placeholder système
   */
  function isPlaceholder(code) {
    const m = resolve(code);
    return m?.fn === "placeholder";
  }

  /**
   * Vrai si le code est connu
   */
  function isKnown(code) {
    return resolve(code) !== null;
  }

  // =====================================================================
  // ALIAS CUSTOM — sauvegardés en localStorage par la page admin
  // Clé localStorage : "planning_custom_aliases"
  // Format : { "CARRIERE_E": "CARRIER_E", "FOURASTIER_J": "FOURASTIER", ... }
  //
  // EXCEPTION DOCUMENTÉE (validée 2026-02-26) :
  // Ces aliases sont des préférences UI locales, pas des données métier.
  // Ils ne participent à aucune clé composite ni à aucun export.
  // L'accès direct localStorage est autorisé ici — ne pas migrer vers CDS_Storage.
  // =====================================================================
  let _customAliases = {};

  function _loadCustomAliases() {
    try {
      const raw = localStorage.getItem("planning_custom_aliases");
      _customAliases = raw ? JSON.parse(raw) : {};
    } catch(e) {
      _customAliases = {};
    }
  }

  function _saveCustomAliases() {
    try {
      localStorage.setItem("planning_custom_aliases", JSON.stringify(_customAliases));
    } catch(e) {}
  }

  // Résolution étendue : custom aliases prioritaires sur ALIAS_MAP
  function resolveWithCustom(code) {
    if (!code) return null;
    const upper = String(code).trim().toUpperCase();

    // 1. Table directe
    if (_byCode[upper]) return _byCode[upper];

    // 2. Alias custom (admin)
    const ca = _customAliases[upper];
    if (ca) {
      const target = String(ca).trim().toUpperCase();
      if (_byCode[target]) return _byCode[target];
      const ca2 = ALIAS_MAP[target] || ALIAS_MAP[ca];
      if (ca2 && _byCode[String(ca2).toUpperCase()]) return _byCode[String(ca2).toUpperCase()];
    }

    // 3. ALIAS_MAP statique
    const canonical = ALIAS_MAP[upper];
    if (canonical && _byCode[canonical.toUpperCase()]) return _byCode[canonical.toUpperCase()];

    return null;
  }

  // Charger au démarrage
  _loadCustomAliases();

  // API admin
  function addCustomAlias(badCode, canonicalCode) {
    _customAliases[String(badCode).trim().toUpperCase()] = String(canonicalCode).trim().toUpperCase();
    _saveCustomAliases();
  }

  function removeCustomAlias(badCode) {
    delete _customAliases[String(badCode).trim().toUpperCase()];
    _saveCustomAliases();
  }

  function getCustomAliases() {
    return { ..._customAliases };
  }

  // Surcharger resolve pour utiliser resolveWithCustom
  function resolve(code) { return resolveWithCustom(code); }
  function isKnown(code) { return resolveWithCustom(code) !== null; }

  return {
    resolve, display, getMedecins, getIDEs, isPlaceholder, isKnown,
    addCustomAlias, removeCustomAlias, getCustomAliases,
    MEMBERS_TABLE, ALIAS_MAP, _DUPLICATED_FIRSTNAMES
  };

})();

// Export si contexte module
if (typeof module !== "undefined" && module.exports) module.exports = PlanningMembers;
