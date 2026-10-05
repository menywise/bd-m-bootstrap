// =====================================================================
// PLANNING ENGINE V2.0.0
// Couche données — Supabase au lieu de CDS_Storage/localStorage
// Dépendances : window.bdb, PlanningSchema (global)
// Expose : window.PlanningEngine
// =====================================================================

window.PlanningEngine = (() => {
  'use strict';

  const DB = window.bdb;

  // ------------------------------------------------------------------
  // STATE EN MÉMOIRE (inchangé côté rendu)
  // ------------------------------------------------------------------
  let _semaine      = null; // { id, annee, semaine, statut, ... }
  let _affectations = [];   // tableau d'atomes (même structure que createAffectation)

  // ------------------------------------------------------------------
  // HELPERS INTERNES
  // ------------------------------------------------------------------

  function _rowToAffectation(row) {
    return {
      _id:           row.id,
      jour:          row.jour,
      secteur:       row.secteur,
      salle:         row.salle  || '',
      chirurgien:    row.chirurgien || '',
      creneau:       row.creneau,
      ide:           row.ide    || '',
      role:          row.role,
      ouverture:     row.ouverture     || 0,
      visceral:      row.visceral      || 0,
      doublure:      row.doublure      || 0,
      doublure_sous: row.doublure_sous || '',
      nuit:          row.nuit          || 0,
      salle_fermee:  row.salle_fermee  || 0,
      ferme_degrade: row.ferme_degrade || 0,
      urgence_fermee:row.urgence_fermee|| 0
    };
  }

  function _affectationToRow(data, semaineId) {
    return {
      semaine_id:     semaineId,
      jour:           data.jour,
      creneau:        data.creneau,
      secteur:        data.secteur,
      salle:          data.salle          || null,
      chirurgien:     data.chirurgien     || null,
      ide:            data.ide            || null,
      role:           data.role,
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

  // ------------------------------------------------------------------
  // LOAD OR CREATE WEEK
  // ------------------------------------------------------------------
  async function loadOrCreateWeek(semaine, annee) {
    // 1. Chercher la semaine en base
    const { data: existing, error: errSelect } = await DB
      .from('planning_semaines')
      .select('*')
      .eq('annee', annee)
      .eq('semaine', semaine)
      .maybeSingle();

    if (errSelect) throw new Error('Erreur chargement semaine : ' + errSelect.message);

    if (existing) {
      _semaine = existing;
    } else {
      // Créer la semaine
      const { data: created, error: errInsert } = await DB
        .from('planning_semaines')
        .insert({ annee, semaine, statut: 'EN_COURS' })
        .select()
        .single();

      if (errInsert) throw new Error('Erreur création semaine : ' + errInsert.message);
      _semaine = created;
    }

    // 2. Charger les affectations
    const { data: rows, error: errAff } = await DB
      .from('planning_affectations')
      .select('*')
      .eq('semaine_id', _semaine.id)
      .order('created_at');

    if (errAff) throw new Error('Erreur chargement affectations : ' + errAff.message);

    _affectations = (rows || []).map(_rowToAffectation);

    // Compatibilité : retourner la structure attendue par le rendu
    return _getCurrentWeek();
  }

  function _getCurrentWeek() {
    if (!_semaine) return null;
    return {
      meta: {
        semaine: _semaine.semaine,
        annee:   _semaine.annee,
        statut:  _semaine.statut,
        version: 'V2'
      },
      affectations: _affectations
    };
  }

  function getCurrentWeek() {
    return _getCurrentWeek();
  }

  // ------------------------------------------------------------------
  // ADD AFFECTATION
  // ------------------------------------------------------------------
  async function addAffectation(data) {
    if (!_semaine) throw new Error('Aucune semaine chargée');

    const affectation = PlanningSchema.createAffectation(data);
    PlanningSchema.validateAffectation(affectation);
    _preventDuplicateSlot(affectation);

    const row = _affectationToRow(affectation, _semaine.id);

    const { data: inserted, error } = await DB
      .from('planning_affectations')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error('Erreur ajout affectation : ' + error.message);

    const newAff = _rowToAffectation(inserted);
    _affectations.push(newAff);
    return newAff;
  }

  // ------------------------------------------------------------------
  // REMOVE AFFECTATION (par index mémoire)
  // ------------------------------------------------------------------
  async function removeAffectation(index) {
    if (!_semaine) throw new Error('Aucune semaine chargée');

    const aff = _affectations[index];
    if (!aff) throw new Error('Affectation introuvable (index ' + index + ')');

    const { error } = await DB
      .from('planning_affectations')
      .delete() // UX06 : caller confirms
      .eq('id', aff._id)
      .select();

    if (error) throw new Error('Erreur suppression : ' + error.message);

    _affectations.splice(index, 1);
  }

  // ------------------------------------------------------------------
  // REMOVE AFFECTATIONS BY INDICES (bulk delete)
  // ------------------------------------------------------------------
  async function removeAffectationsByIndices(indices) {
    if (!_semaine) throw new Error('Aucune semaine chargée');

    const sorted = [...indices].sort((a, b) => b - a);
    const ids = sorted.map(i => _affectations[i]?._id).filter(Boolean);

    if (!ids.length) return;

    const { error } = await DB
      .from('planning_affectations')
      .delete() // UX06 : caller confirms
      .in('id', ids)
      .select();

    if (error) throw new Error('Erreur suppression bulk : ' + error.message);

    for (const i of sorted) {
      _affectations.splice(i, 1);
    }
  }

  // ------------------------------------------------------------------
  // UPDATE AFFECTATION
  // ------------------------------------------------------------------
  async function updateAffectation(index, newData) {
    if (!_semaine) throw new Error('Aucune semaine chargée');

    const aff = _affectations[index];
    if (!aff) throw new Error('Affectation introuvable (index ' + index + ')');

    const updated = PlanningSchema.createAffectation(newData);
    PlanningSchema.validateAffectation(updated);

    const row = _affectationToRow(updated, _semaine.id);

    const { data: saved, error } = await DB
      .from('planning_affectations')
      .update(row)
      .eq('id', aff._id)
      .select()
      .single();

    if (error) throw new Error('Erreur mise à jour : ' + error.message);

    _affectations[index] = _rowToAffectation(saved);
  }

  // ------------------------------------------------------------------
  // VALIDATION MÉTIER
  // ------------------------------------------------------------------
  function _preventDuplicateSlot(a) {
    const exists = _affectations.some(existing =>
      existing.jour    === a.jour    &&
      existing.creneau === a.creneau &&
      existing.secteur === a.secteur &&
      existing.salle   === a.salle   &&
      existing.ide     === a.ide
    );
    if (exists) throw new Error('IDE déjà positionné sur ce créneau');
  }

  // ------------------------------------------------------------------
  // WEEK INTEGRITY CHECK (inchangé — logique pure)
  // ------------------------------------------------------------------
  function checkWeekIntegrity() {
    if (!_semaine) return [];

    const warnings = [];
    const days     = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI'];
    const creneaux = ['MATIN','APREM','SOIR'];
    const salles   = ['05','06','07','08'];
    const aff      = _affectations;

    for (const day of days) {
      for (const creneau of creneaux) {
        for (const salle of salles) {
          const atoms = aff.filter(a =>
            a.jour === day && a.creneau === creneau &&
            a.secteur === 'SALLE' && a.salle === salle
          );
          if (!atoms.length) continue;
          if (atoms.some(a => Number(a.salle_fermee) === 1)) continue;

          const hasChir    = atoms.some(a => a.chirurgien?.trim());
          const hasInstru  = atoms.some(a => a.role === 'INSTRU' && a.ide?.trim());
          const hasPanseur = atoms.some(a => a.role === 'PANSEUR' && a.ide?.trim());

          if (!hasChir)    warnings.push({ type: 'SALLE_SANS_CHIRURGIEN', level: 'error',   message: day + ' ' + creneau + ' Salle ' + salle + ' : chirurgien manquant' });
          if (!hasInstru)  warnings.push({ type: 'SALLE_SANS_INSTRU',     level: 'error',   message: day + ' ' + creneau + ' Salle ' + salle + ' : INSTRU manquant' });
          if (!hasPanseur) warnings.push({ type: 'SALLE_SANS_PANSEUR',    level: 'error',   message: day + ' ' + creneau + ' Salle ' + salle + ' : PANSEUR manquant' });
        }
      }

      for (const creneau of ['MATIN','APREM']) {
        const couloir = aff.filter(a =>
          a.jour === day && a.creneau === creneau && a.secteur === 'COULOIR'
        );
        if (!couloir.length) {
          warnings.push({ type: 'COULOIR_ABSENT', level: 'warning', message: day + ' ' + creneau + ' : aucun IDE couloir' });
        }
      }

      for (const creneau of creneaux) {
        const actifs = aff.filter(a =>
          a.jour === day && a.creneau === creneau &&
          a.secteur === 'SALLE' && !Number(a.salle_fermee)
        );

        const chirCounts = {};
        actifs.forEach(a => {
          const c = a.chirurgien?.trim();
          if (!c) return;
          chirCounts[c] = chirCounts[c] || new Set();
          chirCounts[c].add(a.salle);
        });
        Object.entries(chirCounts).forEach(([chir, salles]) => {
          if (salles.size > 1) {
            warnings.push({ type: 'DOUBLON_CHIRURGIEN', level: 'error', message: day + ' ' + creneau + ' : ' + chir + ' affecté sur ' + salles.size + ' salles (' + [...salles].join(', ') + ')' });
          }
        });

        const ideCounts = {};
        actifs.forEach(a => {
          const i = a.ide?.trim();
          if (!i || i === 'INTERIMAIRE' || i === 'ETUDIANT') return;
          ideCounts[i] = ideCounts[i] || new Set();
          ideCounts[i].add(a.salle);
        });
        Object.entries(ideCounts).forEach(([ide, salles]) => {
          if (salles.size > 1) {
            warnings.push({ type: 'DOUBLON_IDE', level: 'error', message: day + ' ' + creneau + ' : ' + ide + ' affecté sur ' + salles.size + ' salles (' + [...salles].join(', ') + ')' });
          }
        });
      }

      const openers = aff.filter(a => a.jour === day && a.ouverture === 1 && a.creneau === 'MATIN');
      if (openers.length !== 2) {
        warnings.push({ type: 'OUVERTURE_INCOHERENTE', level: 'warning', message: day + ' MATIN : ' + openers.length + ' ouvreur(s) (2 attendus)' });
      }

      const hasNuit = aff.some(a => a.jour === day && Number(a.nuit) === 1 && a.ide?.trim());
      if (!hasNuit) {
        warnings.push({ type: 'NUIT_MANQUANTE', level: 'warning', message: day + ' : aucune IDE de nuit déclarée' });
      }
    }

    return warnings;
  }

  // ------------------------------------------------------------------
  // STATUT SEMAINE
  // ------------------------------------------------------------------
  async function setWeekStatut(statut) {
    if (!_semaine) return;
    if (!['EN_COURS','COMPLETE'].includes(statut)) return;

    const { error } = await DB
      .from('planning_semaines')
      .update({ statut })
      .eq('id', _semaine.id)
      .select();

    if (error) throw new Error('Erreur mise à jour statut : ' + error.message);
    _semaine.statut = statut;
  }

  function getWeekStatut() {
    return _semaine?.statut || 'EN_COURS';
  }

  // ------------------------------------------------------------------
  // DELETE WEEK
  // ------------------------------------------------------------------
  async function deleteWeek(semaine, annee) {
    const { data: row, error: errFind } = await DB
      .from('planning_semaines')
      .select('id')
      .eq('annee', annee)
      .eq('semaine', semaine)
      .maybeSingle();

    if (errFind) throw new Error('Erreur recherche semaine : ' + errFind.message);
    if (!row) return;

    // CASCADE supprime les affectations
    const { error } = await DB
      .from('planning_semaines')
      .delete() // UX06 : caller confirms
      .eq('id', row.id)
      .select();

    if (error) throw new Error('Erreur suppression semaine : ' + error.message);

    if (_semaine?.id === row.id) {
      _semaine      = null;
      _affectations = [];
    }
  }

  // ------------------------------------------------------------------
  // LIST WEEKS — remplace StorageKeyService.listWeekKeys()
  // ------------------------------------------------------------------
  async function listWeeks() {
    const { data, error } = await DB
      .from('planning_semaines')
      .select('annee, semaine, statut')
      .order('annee')
      .order('semaine');

    if (error) throw new Error('Erreur liste semaines : ' + error.message);
    return data || [];
  }

  // Compatibilité : saveCurrentWeek = no-op (Supabase = source de vérité)
  async function saveCurrentWeek() {}

  // ------------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------------
  return {
    loadOrCreateWeek,
    getCurrentWeek,
    saveCurrentWeek,
    addAffectation,
    removeAffectation,
    removeAffectationsByIndices,
    updateAffectation,
    checkWeekIntegrity,
    setWeekStatut,
    getWeekStatut,
    deleteWeek,
    listWeeks
  };

})();
