// ============================================================
// PLANNING SCHEMA V2.0.0
// Contrat officiel du moteur d'analyse opératoire
// V2 : MEMBRES purgés (→ planning_membres Supabase)
//      CHIRURGIENS/IDES dynamiques (→ PlanningMembers)
// ============================================================

window.PlanningSchema = (() => {

  // ------------------------------------------------------------------
  // ÉNUMÉRATIONS OFFICIELLES — inchangées
  // ------------------------------------------------------------------

  const JOURS = [
    'LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'
  ];

  const SECTEURS = ['SALLE','COULOIR'];

  const CRENEAUX = ['MATIN','APREM','SOIR'];

  const ROLES = ['INSTRU','PANSEUR','COULOIR','ETUDIANT'];

  const SALLES = ['05','06','07','08'];

  // ------------------------------------------------------------------
  // LISTES MEMBRES — délégué à PlanningMembers (Supabase)
  // Appeler PlanningMembers.getMedecins() / getIDEs() après init()
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // FACTORY AFFECTATION
  // ------------------------------------------------------------------

  function createWeek(semaine, annee) {
    return {
      meta: {
        semaine:      Number(semaine),
        annee:        Number(annee),
        version:      'V2',
        dateCreation: new Date().toISOString()
      },
      affectations: []
    };
  }

  function createAffectation(data = {}) {
    return {
      jour:           data.jour           || '',
      secteur:        data.secteur        || '',
      salle:          data.salle          ?? '',
      chirurgien:     data.chirurgien     || '',
      creneau:        data.creneau        || '',
      ide:            data.ide            || '',
      role:           data.role           || '',
      ouverture:      data.ouverture      ? 1 : 0,
      visceral:       data.visceral       ? 1 : 0,
      doublure:       data.doublure       ? 1 : 0,
      doublure_sous:  data.doublure_sous  || '',
      nuit:           data.nuit           ? 1 : 0,
      salle_fermee:   data.salle_fermee   ? 1 : 0,
      ferme_degrade:  data.ferme_degrade  ? 1 : 0,
      urgence_fermee: data.urgence_fermee ? 1 : 0
    };
  }

  function validateAffectation(a) {
    if (!JOURS.includes(a.jour))     throw new Error('Jour invalide');
    if (!SECTEURS.includes(a.secteur)) throw new Error('Secteur invalide');
    if (!CRENEAUX.includes(a.creneau)) throw new Error('Créneau invalide');

    if (a.secteur === 'SALLE') {
      if (a.salle === '' && !a.salle_fermee) {
        throw new Error('Salle requise si secteur SALLE');
      }
      if (!a.salle_fermee) {
        const s = normalizeSalle(a.salle);
        if (!SALLES.includes(s)) throw new Error('Salle invalide (autorisées : 5,6,7,8)');
      }
      if (!a.chirurgien && !a.salle_fermee) {
        throw new Error('Chirurgien requis si salle active');
      }
      if (!['INSTRU','PANSEUR','ETUDIANT'].includes(a.role) && !a.salle_fermee) {
        throw new Error('Rôle invalide en salle');
      }
    }

    if (a.secteur === 'COULOIR') {
      if (a.role !== 'COULOIR') throw new Error('Rôle COULOIR requis si secteur COULOIR');
    }

    if (a.doublure && !a.doublure_sous) {
      throw new Error('Doublure sans précision INSTRU/PANSEUR');
    }

    return true;
  }

  // ------------------------------------------------------------------
  // UTILITAIRES
  // ------------------------------------------------------------------

  function normalizeSalle(value) {
    if (value === null || value === undefined) throw new Error('Salle manquante');
    const raw = String(value).trim();
    if (!/^\d{1,2}$/.test(raw)) throw new Error('Salle invalide (format attendu : 1-2 chiffres)');
    return raw.padStart(2, '0');
  }

  function makeStorageKey(annee, semaine, type) {
    return `${annee}_${String(semaine).padStart(2, '0')}_${type}`;
  }

  function getWeekKey(semaine, annee) {
    return makeStorageKey(annee, semaine, 'planning_week');
  }

  function isValidEnum(value, enumArray) {
    return enumArray.includes(value);
  }

  // ------------------------------------------------------------------
  // EXPORT PUBLIC
  // ------------------------------------------------------------------

  return {
    JOURS,
    SECTEURS,
    CRENEAUX,
    ROLES,
    SALLES,

    createWeek,
    createAffectation,
    validateAffectation,
    normalizeSalle,
    getWeekKey,
    makeStorageKey,
    isValidEnum
  };

})();
