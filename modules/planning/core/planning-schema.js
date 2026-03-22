// ============================================
// PLANNING SCHEMA V1.1 - FILE SAFE (IIFE global)
// Contrat officiel du moteur d'analyse opératoire
// ============================================

window.PlanningSchema = (() => {

  // --------------------------------------------
  // ENUMERATIONS OFFICIELLES
  // --------------------------------------------

  const JOURS = [
    "LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI","DIMANCHE"
  ];

  const SECTEURS = ["SALLE","COULOIR"];

  const CRENEAUX = ["MATIN","APREM","SOIR"];

  const ROLES = ["INSTRU","PANSEUR","COULOIR","ETUDIANT"];

  // --------------------------------------------
  // REFERENTIELS METIER (V1.1)
  // --------------------------------------------

  const SALLES = ["05","06","07","08"];

  const MEMBRES = [
    {"user_id":"a6ee9cbc-9cda-4707-bb1a-996b8bc612a9","nom":"Alain","prenom":"Jérôme","fonction":"medecin","role":"membre"},
    {"user_id":"7839e694-b054-493a-957a-660cb43f29af","nom":"Boscher","prenom":"Julien","fonction":"medecin","role":"membre"},
    {"user_id":"f2885a1b-4886-4a33-944e-3d182fdc1913","nom":"Bueno","prenom":"Sophie","fonction":"infirmier","role":"membre"},
    {"user_id":"bd09f36f-a312-4284-93c5-e02056aead06","nom":"Carrier","prenom":"Éléonore","fonction":"infirmier","role":"membre"},
    {"user_id":"30f0b5a8-02e1-493f-841e-9a1c70333d8a","nom":"Chrosciany","prenom":"Sacha","fonction":"medecin","role":"membre"},
    {"user_id":"80a974c7-1a9c-4990-89a7-0baf9ea700de","nom":"Compain","prenom":"Julie","fonction":"infirmier","role":"membre"},
    {"user_id":"29d1c1b2-7161-45c0-9385-df4c4d8b6e12","nom":"Coste","prenom":"Cédric","fonction":"medecin","role":"membre"},
    {"user_id":"c90b3c82-3221-4394-9f1f-2ca57f679e73","nom":"Da Costa","prenom":"Emma","fonction":"infirmier","role":"membre"},
    {"user_id":"16463bda-31c2-40c9-865c-560acfef0fa8","nom":"Delong","prenom":"Isabelle","fonction":"infirmier","role":"membre"},
    {"user_id":"8c5c7b5f-82c9-4c37-b6b8-f32e5cff23db","nom":"Dotzis","prenom":"Anthony","fonction":"medecin","role":"membre"},
    {"user_id":"7fa23ec5-41a4-432f-b622-59c6db9ff97e","nom":"Dugot","prenom":"Sabine","fonction":"infirmier","role":"membre"},
    {"user_id":"c41749e5-d6d6-4cc0-b7ff-06fbca50e64c","nom":"Fredaigue","prenom":"Cynthia","fonction":"infirmier","role":"membre"},
    {"user_id":"7167f96e-bc16-42c5-801c-d1677a5c728f","nom":"Hamsa","prenom":"Olivia","fonction":"cadre","role":"membre"},
    {"user_id":"7511d4a3-9440-4315-95b9-b5c7e41927cc","nom":"Lagarrigue","prenom":"Jean-François","fonction":"medecin","role":"membre"},
    {"user_id":"3f42c4e6-cb83-415c-8bff-9529421ddc7c","nom":"Lefaucheur","prenom":"Romain","fonction":"cadre","role":"membre"},
    {"user_id":"20eceba5-c34e-44f8-a477-ede711cdb9ff","nom":"Leproux","prenom":"Carole","fonction":"infirmier","role":"membre"},
    {"user_id":"77140346-f647-4902-822f-6b314a98ef87","nom":"Louisia","prenom":"Stéphane","fonction":"medecin","role":"membre"},
    {"user_id":"48e9ffd1-2649-4d71-84fd-f42dca1cef56","nom":"Maillet","prenom":"Valérie","fonction":"infirmier","role":"membre"},
    {"user_id":"6e3f9209-60de-4ba9-a2c7-ae73e95093c1","nom":"Marchand","prenom":"Carine","fonction":"infirmier","role":"membre"},
    {"user_id":"5831812f-39b9-4937-8676-d080d8ac78c3","nom":"Marczuk","prenom":"Yann","fonction":"medecin","role":"membre"},
    {"user_id":"e1c74a0e-394e-4334-9f00-cc2568932d0f","nom":"Mausset","prenom":"Estelle","fonction":"cadre","role":"membre"},
    {"user_id":"1bbc0ad7-5ebe-4a31-9d4d-08c8274c8986","nom":"Meric de Belfon","prenom":"Quentin","fonction":"infirmier","role":"membre"},
    {"user_id":"7f58d7fe-c3da-41ea-921b-ca6d6d9996d8","nom":"Narbonne","prenom":"Sarah","fonction":"infirmier","role":"membre"},
    {"user_id":"e84614bf-47f0-4bc2-90f6-1a466e96aff0","nom":"Nicolas","prenom":"Carole","fonction":"infirmier","role":"membre"},
    {"user_id":"1e377d4e-6ed1-477a-bb7e-918049004885","nom":"Paquier","prenom":"Marion","fonction":"infirmier","role":"membre"},
    {"user_id":"2f17b647-7cfc-4e24-a24d-3d61ef2d4147","nom":"Parre","prenom":"Franck","fonction":"infirmier","role":"membre"},
    {"user_id":"a3615c31-215b-4d94-a3fd-ed1a7bb7705f","nom":"Picouleau","prenom":"Alexandre","fonction":"medecin","role":"membre"},
    {"user_id":"b7a60787-9848-4e77-9ca2-d05f02c29d0b","nom":"ROHAUT","prenom":"Manuel","fonction":"infirmier","role":"admin"},
    {"user_id":"d59ef05f-d63b-452a-9471-13cac57db2ef","nom":"Sartout","prenom":"Faustine","fonction":"aide-soignant","role":"membre"},
    {"user_id":"1ea23056-cd48-4dda-a352-74f69be3a26d","nom":"Thuillier","prenom":"Emma","fonction":"infirmier","role":"membre"},
    {"user_id":"9c3fcec9-20a6-4dc7-b0c5-dc2a7f5ca8de","nom":"Vacquerie","prenom":"Virginie","fonction":"medecin","role":"membre"}
  ];

  function _fullName(m) {
    const nom = String(m?.nom ?? "").trim();
    const prenom = String(m?.prenom ?? "").trim();
    return `${nom} ${prenom}`.trim();
  }

  function _uniqSorted(arr) {
    return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
  }

  const CHIRURGIENS = _uniqSorted(
    MEMBRES
      .filter(m => m && m.fonction === "medecin")
      .map(_fullName)
  );

  const IDES = _uniqSorted(
    MEMBRES
      .filter(m => m && m.fonction === "infirmier")
      .map(_fullName)
  );

  function createWeek(semaine, annee) {
    return {
      meta: {
        semaine: Number(semaine),
        annee: Number(annee),
        version: "V1",
        dateCreation: new Date().toISOString()
      },
      affectations: []
    };
  }

  function createAffectation(data = {}) {
    return {
      jour: data.jour || "",
      secteur: data.secteur || "",
      salle: data.salle ?? "",
      chirurgien: data.chirurgien || "",
      creneau: data.creneau || "",
      ide: data.ide || "",
      role: data.role || "",
      ouverture: data.ouverture ? 1 : 0,
      visceral: data.visceral ? 1 : 0,
      doublure: data.doublure ? 1 : 0,
      doublure_sous: data.doublure_sous || "",
      nuit:          data.nuit          ? 1 : 0,
      salle_fermee: data.salle_fermee ? 1 : 0,
      ferme_degrade: data.ferme_degrade ? 1 : 0,
      urgence_fermee: data.urgence_fermee ? 1 : 0
    };
  }

  function validateAffectation(a) {

    if (!JOURS.includes(a.jour)) throw new Error("Jour invalide");
    if (!SECTEURS.includes(a.secteur)) throw new Error("Secteur invalide");
    if (!CRENEAUX.includes(a.creneau)) throw new Error("Créneau invalide");

    if (a.secteur === "SALLE") {

      if (a.salle === "" && !a.salle_fermee) {
        throw new Error("Salle requise si secteur SALLE");
      }

      if (!a.salle_fermee) {
        const s = normalizeSalle(a.salle);
        if (!SALLES.includes(s)) {
          throw new Error("Salle invalide (autorisées : 5,6,7,8)");
        }
      }

      if (!a.chirurgien && !a.salle_fermee) {
        throw new Error("Chirurgien requis si salle active");
      }

      if (a.role !== "INSTRU" && a.role !== "PANSEUR" && a.role !== "ETUDIANT" && !a.salle_fermee) {
        throw new Error("Rôle invalide en salle");
      }
    }

    if (a.secteur === "COULOIR") {
      if (a.role !== "COULOIR") {
        throw new Error("Rôle COULOIR requis si secteur COULOIR");
      }
    }

    if (a.doublure && !a.doublure_sous) {
      throw new Error("Doublure sans précision INSTRU/PANSEUR");
    }

    return true;
  }

  // --------------------------------------------
  // OUTILS UTILES
  // --------------------------------------------


  function normalizeSalle(value) {
    if (value === null || value === undefined) {
      throw new Error("Salle manquante");
    }

    const raw = String(value).trim();

    if (!/^\d{1,2}$/.test(raw)) {
      throw new Error("Salle invalide (format attendu : 1-2 chiffres)");
    }

    return raw.padStart(2, "0");
  }

  function makeStorageKey(annee, semaine, type) {
    return `${annee}_${String(semaine).padStart(2, "0")}_${type}`;
  }

  function getWeekKey(semaine, annee) {
    return makeStorageKey(annee, semaine, "planning_week");
  }

  function isValidEnum(value, enumArray) {
    return enumArray.includes(value);
  }

  // --------------------------------------------
  // EXPORT PUBLIC (global)
  // --------------------------------------------

  return {
    JOURS,
    SECTEURS,
    CRENEAUX,
    ROLES,

    SALLES,
    MEMBRES,
    CHIRURGIENS,
    IDES,

    createWeek,
    createAffectation,
    validateAffectation,
    normalizeSalle,
    getWeekKey,
    makeStorageKey,
    isValidEnum
  };

})();
