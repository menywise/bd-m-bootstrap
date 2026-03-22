// ============================================
// PLANNING ENGINE V1.1 - FILE SAFE (IIFE global)
// Gestion opérationnelle des semaines
// Dépendances : PlanningSchema (global), CDS_Storage (global)
// ============================================

window.PlanningEngine = (() => {

  let currentWeek = null;
  let currentKey = null;

  // --------------------------------------------
  // INITIALISATION
  // --------------------------------------------

  async function loadOrCreateWeek(semaine, annee) {

    const key = PlanningSchema.getWeekKey(semaine, annee);
    currentKey = key;

    const existing = await CDS_Storage.get(key);

    if (existing) {
      currentWeek = existing;
    } else {
      currentWeek = PlanningSchema.createWeek(semaine, annee);
      await CDS_Storage.set(key, currentWeek);
    }

    return currentWeek;
  }

  function getCurrentWeek() {
    return currentWeek;
  }

  // --------------------------------------------
  // AJOUT AFFECTATION
  // --------------------------------------------

  async function addAffectation(data) {

    if (!currentWeek) {
      throw new Error("Aucune semaine chargée");
    }

    const affectation = PlanningSchema.createAffectation(data);

    PlanningSchema.validateAffectation(affectation);

    preventDuplicateSlot(affectation);

    currentWeek.affectations.push(affectation);

    await save();

    return affectation;
  }

  // --------------------------------------------
  // SUPPRESSION
  // --------------------------------------------

  async function removeAffectation(index) {

    if (!currentWeek) {
      throw new Error("Aucune semaine chargée");
    }

    currentWeek.affectations.splice(index, 1);

    await save();
  }

  // --------------------------------------------
  // MODIFICATION
  // --------------------------------------------

  async function updateAffectation(index, newData) {

    if (!currentWeek) {
      throw new Error("Aucune semaine chargée");
    }

    const updated = PlanningSchema.createAffectation(newData);

    PlanningSchema.validateAffectation(updated);

    currentWeek.affectations[index] = updated;

    await save();
  }

  // --------------------------------------------
  // VALIDATION MÉTIER SUPPLÉMENTAIRE
  // --------------------------------------------

  function preventDuplicateSlot(a) {

    const exists = currentWeek.affectations.some(existing =>
      existing.jour === a.jour &&
      existing.creneau === a.creneau &&
      existing.secteur === a.secteur &&
      existing.salle === a.salle &&
      existing.ide === a.ide
    );

    if (exists) {
      throw new Error("IDE déjà positionné sur ce créneau");
    }
  }

  // --------------------------------------------
  // CONTRÔLES GLOBAUX SEMAINE
  // --------------------------------------------

  function checkWeekIntegrity() {

    if (!currentWeek) return [];

    const warnings = [];
    const days     = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI"];
    const creneaux = ["MATIN","APREM","SOIR"];
    const salles   = ["05","06","07","08"];
    const aff      = currentWeek.affectations;

    for (const day of days) {

      // ── SALLES ──────────────────────────────────────────────
      for (const creneau of creneaux) {
        for (const salle of salles) {

          const atoms = aff.filter(a =>
            a.jour === day && a.creneau === creneau &&
            a.secteur === "SALLE" && a.salle === salle
          );

          // Salle sans aucune saisie → VIDE, pas une erreur de saisie
          if (!atoms.length) continue;

          // Salle explicitement fermée → OK
          if (atoms.some(a => Number(a.salle_fermee) === 1)) continue;

          // Salle active — vérifier la complétude de l'équipe
          const hasChir   = atoms.some(a => a.chirurgien?.trim());
          const hasInstru = atoms.some(a => a.role === "INSTRU" && a.ide?.trim());
          const hasPanseur= atoms.some(a => a.role === "PANSEUR" && a.ide?.trim());

          if (!hasChir) {
            warnings.push({
              type: "SALLE_SANS_CHIRURGIEN", level: "error",
              message: `${day} ${creneau} Salle ${salle} : chirurgien manquant`
            });
          }
          if (!hasInstru) {
            warnings.push({
              type: "SALLE_SANS_INSTRU", level: "error",
              message: `${day} ${creneau} Salle ${salle} : INSTRU manquant`
            });
          }
          if (!hasPanseur) {
            warnings.push({
              type: "SALLE_SANS_PANSEUR", level: "error",
              message: `${day} ${creneau} Salle ${salle} : PANSEUR manquant`
            });
          }
        }
      }

      // ── COULOIR ─────────────────────────────────────────────
      for (const creneau of creneaux) {
        if (creneau === "SOIR") continue;

        const couloir = aff.filter(a =>
          a.jour === day && a.creneau === creneau && a.secteur === "COULOIR"
        );

        if (couloir.length === 0) {
          warnings.push({
            type: "COULOIR_ABSENT", level: "warning",
            message: `${day} ${creneau} : aucun IDE couloir`
          });
        }
      }

      // ── DOUBLONS CHIR / IDE SUR MÊME CRÉNEAU ────────────────
      for (const creneau of creneaux) {
        const actifs = aff.filter(a =>
          a.jour === day && a.creneau === creneau &&
          a.secteur === "SALLE" && !Number(a.salle_fermee)
        );

        // Chirurgien sur plusieurs salles simultanément
        const chirCounts = {};
        actifs.forEach(a => {
          const c = a.chirurgien?.trim();
          if (!c) return;
          chirCounts[c] = chirCounts[c] || new Set();
          chirCounts[c].add(a.salle);
        });
        Object.entries(chirCounts).forEach(([chir, salles]) => {
          if (salles.size > 1) {
            warnings.push({
              type: "DOUBLON_CHIRURGIEN", level: "error",
              message: `${day} ${creneau} : ${chir} affecté sur ${salles.size} salles (${[...salles].join(", ")})`
            });
          }
        });

        // IDE sur plusieurs salles simultanément
        const ideCounts = {};
        actifs.forEach(a => {
          const i = a.ide?.trim();
          if (!i || i === "INTERIMAIRE" || i === "ETUDIANT") return;
          ideCounts[i] = ideCounts[i] || new Set();
          ideCounts[i].add(a.salle);
        });
        Object.entries(ideCounts).forEach(([ide, salles]) => {
          if (salles.size > 1) {
            warnings.push({
              type: "DOUBLON_IDE", level: "error",
              message: `${day} ${creneau} : ${ide} affecté sur ${salles.size} salles (${[...salles].join(", ")})`
            });
          }
        });
      }

      // ── OUVREURS ────────────────────────────────────────────
      const openers = aff.filter(a =>
        a.jour === day && a.ouverture === 1 && a.creneau === "MATIN"
      );
      if (openers.length !== 2) {
        warnings.push({
          type: "OUVERTURE_INCOHERENTE", level: "warning",
          message: `${day} MATIN : ${openers.length} ouvreur(s) (2 attendus)`
        });
      }

      // ── IDE DE NUIT ──────────────────────────────────────────
      const hasNuit = aff.some(a =>
        a.jour === day && Number(a.nuit) === 1 && a.ide?.trim()
      );
      if (!hasNuit) {
        warnings.push({
          type: "NUIT_MANQUANTE", level: "warning",
          message: `${day} : aucune IDE de nuit déclarée`
        });
      }
    }

    return warnings;
  }

  // --------------------------------------------
  // STATUT SEMAINE
  // --------------------------------------------

  function setWeekStatut(statut) {
    if (!currentWeek) return;
    if (!["EN_COURS","COMPLETE"].includes(statut)) return;
    if (!currentWeek.meta) currentWeek.meta = {};
    currentWeek.meta.statut = statut;
    return save();
  }

  function getWeekStatut() {
    return currentWeek?.meta?.statut || "EN_COURS";
  }

  // --------------------------------------------
  // SAUVEGARDE
  // --------------------------------------------

  async function save() {

    if (!currentKey || !currentWeek) return;

    await CDS_Storage.set(currentKey, currentWeek);
  }

  // --------------------------------------------
  // SUPPRESSION SEMAINE
  // --------------------------------------------

  async function deleteWeek(semaine, annee) {

    const key = PlanningSchema.getWeekKey(semaine, annee);

    // FIX : l'API CDS_Storage expose delete(), pas remove() :contentReference[oaicite:5]{index=5}
    await CDS_Storage.delete(key);

    if (key === currentKey) {
      currentKey = null;
      currentWeek = null;
    }
  }

  // --------------------------------------------
  // EXPORT PUBLIC
  // --------------------------------------------

  return {
    loadOrCreateWeek,
    getCurrentWeek,
    saveCurrentWeek: save,
    addAffectation,
    removeAffectation,
    updateAffectation,
    checkWeekIntegrity,
    setWeekStatut,
    getWeekStatut,
    deleteWeek
  };

})();