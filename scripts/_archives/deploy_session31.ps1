# SESSION 31 -- Deploy planning module (auto-generated)
# Executer depuis : scripts\deploy_session31.ps1
$ErrorActionPreference = 'Stop'
$DST = "C:\DEV\BIBLE_DE_BLOC\modules\planning"

# --- Aplatissement : deplacer JS sous-dossiers vers racine ---
Get-ChildItem "$DST\core\*.js" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $DST $_.Name
  if (-not (Test-Path $dest)) { Move-Item $_.FullName $dest }
}
Get-ChildItem "$DST\services\*.js" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $DST $_.Name
  if (-not (Test-Path $dest)) { Move-Item $_.FullName $dest }
}
Get-ChildItem "$DST\ui\*.js" -ErrorAction SilentlyContinue | ForEach-Object {
  $dest = Join-Path $DST $_.Name
  if (-not (Test-Path $dest)) { Move-Item $_.FullName $dest }
}

# --- Ecrire les fichiers V2 ---

# planning-schema.js
$c_planning_schema_js = @'
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

'@
[System.IO.File]::WriteAllText("$DST\planning-schema.js", $c_planning_schema_js, [System.Text.Encoding]::UTF8)

# planning-members.js
$c_planning_members_js = @'
// =====================================================================
// PLANNING MEMBERS V2.0.0
// Source : planning_membres (Supabase) au lieu de MEMBERS_TABLE hardcodé
// Dépendances : window.bdb (supabase-client.js)
// Expose : window.PlanningMembers
// =====================================================================

const PlanningMembers = (() => {
  'use strict';

  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  let _table   = [];   // planning_membres depuis Supabase
  let _byCode  = {};   // index O(1) : code.toUpperCase() → membre
  let _loaded  = false;

  // ------------------------------------------------------------------
  // ALIAS MAP STATIQUE — résout les codes CSV historiques
  // Nécessaire pour l'import des anciens fichiers CSV
  // ------------------------------------------------------------------
  const ALIAS_MAP = {
    'LAMARCHE_C':          'NORMAND_C',
    'LAMARCHE-NORMAND_C':  'NORMAND_C',
    'LAMARCHE':            'NORMAND_C',
    'NORMAND':             'NORMAND_C',
    'MONZAUGE_S':          'VISCERAL',
    'MONZAUGE':            'VISCERAL',
    'SANDRINE':            'INTERIMAIRE',
    'OCEANE':              'VISCERAL',
    'OCÉANE':              'VISCERAL',
    'OCEANE_P':            'VISCERAL',
    'LATHIERE_O':          'VISCERAL',
    'LATHIERE':            'VISCERAL',
    'OPHELIE':             'VISCERAL',
    'OPHÉLIE':             'VISCERAL',
    'ARTHUR':              'VISCERAL',
    'HELENE':              'VISCERAL',
    'HÉLÈNE':              'VISCERAL',
    'HELENE_':             'VISCERAL',
    'GUILLAUME_S':         'INTERIMAIRE',
    'GUILLAUME':           'INTERIMAIRE',
    'INTERIM':             'INTERIMAIRE',
    'AUDE':                'ETUDIANT',
    'DA_COSTA_E':          'DA_COSTA',
    'DACOSTA_E':           'DA_COSTA',
    'DACOSTA':             'DA_COSTA',
    'MERIC_DE_BELFON_Q':   'MERIC_Q',
    'MERIC':               'MERIC_Q'
  };

  // ------------------------------------------------------------------
  // ALIAS CUSTOM (admin) — localStorage autorisé
  // Exception documentée 2026-02-26 : préférences UI locales
  // NE PAS migrer vers Supabase — comportement intentionnel
  // ------------------------------------------------------------------
  let _customAliases = {};

  function _loadCustomAliases() {
    try {
      const raw = localStorage.getItem('planning_custom_aliases');
      _customAliases = raw ? JSON.parse(raw) : {};
    } catch (e) {
      _customAliases = {};
    }
  }

  function _saveCustomAliases() {
    try {
      localStorage.setItem('planning_custom_aliases', JSON.stringify(_customAliases));
    } catch (e) {}
  }

  // ------------------------------------------------------------------
  // INIT — charge depuis Supabase
  // ------------------------------------------------------------------
  async function init() {
    if (_loaded) return;

    const DB = window.bdb;
    const { data, error } = await DB
      .from('planning_membres')
      .select('*')
      .eq('actif', true)
      .order('nom');

    if (error) {
      console.error('planning_membres : erreur chargement', error);
      return;
    }

    _table  = data || [];
    _byCode = {};
    for (const m of _table) {
      _byCode[m.code.toUpperCase()] = m;
    }

    _loaded = true;
    _loadCustomAliases();
  }

  function isLoaded() { return _loaded; }

  // ------------------------------------------------------------------
  // PRÉNOMS EN DOUBLON — calculé après chargement
  // ------------------------------------------------------------------
  function _getDuplicatedFirstnames() {
    const counts = {};
    for (const m of _table) {
      if (m.fonction === 'placeholder') continue;
      const p = m.prenom || m.nom;
      counts[p] = (counts[p] || 0) + 1;
    }
    const dupes = new Set();
    for (const [p, n] of Object.entries(counts)) {
      if (n > 1) dupes.add(p);
    }
    return dupes;
  }

  // ------------------------------------------------------------------
  // RESOLVE — code CSV → membre (avec alias custom prioritaires)
  // ------------------------------------------------------------------
  function resolve(code) {
    if (!code) return null;
    const upper = String(code).trim().toUpperCase();

    // 1. Direct
    if (_byCode[upper]) return _byCode[upper];

    // 2. Alias custom admin (localStorage)
    const ca = _customAliases[upper];
    if (ca) {
      const target = String(ca).trim().toUpperCase();
      if (_byCode[target]) return _byCode[target];
      const ca2 = ALIAS_MAP[target];
      if (ca2 && _byCode[ca2.toUpperCase()]) return _byCode[ca2.toUpperCase()];
    }

    // 3. ALIAS_MAP statique
    const canonical = ALIAS_MAP[upper];
    if (canonical && _byCode[canonical.toUpperCase()]) {
      return _byCode[canonical.toUpperCase()];
    }

    return null;
  }

  // ------------------------------------------------------------------
  // DISPLAY — texte matrice
  // ------------------------------------------------------------------
  function display(code) {
    const m = resolve(code);
    if (!m) return code; // inconnu → affiché tel quel (rouge dans matrice)

    if (m.fonction === 'medecin') {
      return 'Dr ' + m.nom.toUpperCase();
    }

    if (m.fonction === 'placeholder') {
      if (m.code === 'INTERIMAIRE') return 'Intérim';
      if (m.code === 'VISCERAL')    return 'Viscéral';
      if (m.code === 'ETUDIANT')    return 'Étudiant';
      return m.code;
    }

    // IDE / cadre / aide-soignant — prénom, avec initiale si doublon
    const prenom = m.prenom || m.nom;
    const dupes = _getDuplicatedFirstnames();
    if (dupes.has(prenom)) {
      return prenom + ' ' + m.nom.charAt(0) + '.';
    }
    return prenom;
  }

  // ------------------------------------------------------------------
  // LISTES POUR LES SELECTS
  // ------------------------------------------------------------------
  function getMedecins(inclureInactifs = true) {
    return _table
      .filter(m => m.fonction === 'medecin' && (inclureInactifs || m.actif))
      .map(m => m.code);
  }

  function getIDEs(inclureInactifs = true) {
    return _table
      .filter(m => m.fonction === 'infirmier' && (inclureInactifs || m.actif))
      .sort((a, b) => (a.prenom || '').localeCompare(b.prenom || '', 'fr', { sensitivity: 'base' }))
      .map(m => m.code);
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  function isPlaceholder(code) { return resolve(code)?.fonction === 'placeholder'; }
  function isKnown(code)       { return resolve(code) !== null; }

  // ------------------------------------------------------------------
  // ADMIN — custom aliases
  // ------------------------------------------------------------------
  function addCustomAlias(badCode, canonicalCode) {
    _customAliases[String(badCode).trim().toUpperCase()] =
      String(canonicalCode).trim().toUpperCase();
    _saveCustomAliases();
  }

  function removeCustomAlias(badCode) {
    delete _customAliases[String(badCode).trim().toUpperCase()];
    _saveCustomAliases();
  }

  function getCustomAliases() { return { ..._customAliases }; }

  // ------------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------------
  return {
    init,
    isLoaded,
    resolve,
    display,
    getMedecins,
    getIDEs,
    isPlaceholder,
    isKnown,
    addCustomAlias,
    removeCustomAlias,
    getCustomAliases,
    get MEMBERS_TABLE() { return _table; },
    get ALIAS_MAP()     { return ALIAS_MAP; }
  };

})();

'@
[System.IO.File]::WriteAllText("$DST\planning-members.js", $c_planning_members_js, [System.Text.Encoding]::UTF8)

# planning-engine.js
$c_planning_engine_js = @'
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
      .delete()
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
      .delete()
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
      .delete()
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

'@
[System.IO.File]::WriteAllText("$DST\planning-engine.js", $c_planning_engine_js, [System.Text.Encoding]::UTF8)

# planning-analytics.js
$c_planning_analytics_js = @'
// =====================================================
// PLANNING ANALYTICS V2.0.0
// Moteur descriptif d'analyse opératoire
// V2 : Supabase au lieu de CDS_Storage
// Dépendances : window.bdb, PlanningSchema (global)
// =====================================================

window.PlanningAnalytics = (() => {
  'use strict';

  const DB = window.bdb;

  // ------------------------------------------------------------------
  // UTILITAIRES PURS (inchangés — pas de dépendance storage)
  // ------------------------------------------------------------------

  function safeNum(x) { return Number.isFinite(+x) ? +x : 0; }

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
      const parts = String(key).split('||');
      const obj   = { volume: value };
      fields.forEach((f, i) => { obj[f] = parts[i] || ''; });
      out.push(obj);
    }
    return out.sort((a, b) => b.volume - a.volume);
  }

  // ------------------------------------------------------------------
  // ANALYSE D'UNE SEMAINE (logique pure — inchangée)
  // ------------------------------------------------------------------

  function computeWeekStats(week) {
    const rows = week?.affectations || [];

    const visceral  = rows.filter(r => safeNum(r.visceral)  === 1 && r.ide);
    const couloir   = rows.filter(r => r.secteur === 'COULOIR' && r.ide);
    const ouvertures= rows.filter(r => safeNum(r.ouverture) === 1 && r.ide);
    const doublures = rows.filter(r => safeNum(r.doublure)  === 1 && r.ide);

    const chirInstru = mapToArray(
      groupCount(
        rows.filter(r => r.secteur === 'SALLE' && r.role === 'INSTRU' && r.chirurgien && r.ide),
        r => r.chirurgien + '||' + r.ide
      ),
      ['chir','ide']
    );

    const chirPanseur = mapToArray(
      groupCount(
        rows.filter(r => r.secteur === 'SALLE' && r.role === 'PANSEUR' && r.chirurgien && r.ide),
        r => r.chirurgien + '||' + r.ide
      ),
      ['chir','ide']
    );

    return {
      totals: {
        affectations: rows.length,
        visceral:    visceral.length,
        couloir:     couloir.length,
        ouvertures:  ouvertures.length,
        doublures:   doublures.length
      },
      byIde: {
        visceral:   mapToArray(groupCount(visceral,  r => r.ide), ['ide']),
        couloir:    mapToArray(groupCount(couloir,   r => r.ide), ['ide']),
        ouvertures: mapToArray(groupCount(ouvertures,r => r.ide), ['ide'])
      },
      relations: { chirInstru, chirPanseur }
    };
  }

  function detectSituations(week) {
    const rows = week?.affectations || [];
    const meta = week?.meta || {};
    const situations = [];

    rows.filter(r => safeNum(r.salle_fermee) === 1 && r.salle).forEach(r => {
      const isDegrade = safeNum(r.ferme_degrade) === 1;
      situations.push({
        type:        isDegrade ? 'SALLE_FERMEE_DEGRADE' : 'SALLE_FERMEE_NATUREL',
        semaine:     meta.semaine,
        jour:        r.jour,
        salle:       r.salle,
        creneau:     r.creneau,
        description: 'Salle ' + r.salle + ' fermée ' + (isDegrade ? '(dégradé)' : '(naturel)') + ' (' + r.jour + ' ' + r.creneau + ')',
        details:     (r.secteur + ' | ' + (r.role || '')).trim()
      });
    });

    rows.filter(r => safeNum(r.urgence_fermee) === 1).forEach(r => {
      situations.push({
        type:        'URGENCE_FERMEE',
        semaine:     meta.semaine,
        jour:        r.jour,
        description: 'Urgence fermée (' + r.jour + ' ' + r.creneau + ')',
        details:     (r.ide || '').trim()
      });
    });

    rows.filter(r => safeNum(r.doublure) === 1 && r.ide).forEach(r => {
      situations.push({
        type:        'DOUBLURE',
        semaine:     meta.semaine,
        jour:        r.jour,
        description: 'Doublure : ' + r.ide + ' (' + r.jour + ' ' + r.creneau + ')',
        details:     (r.doublure_sous || '').trim()
      });
    });

    rows.filter(r => safeNum(r.visceral) === 1 && r.secteur === 'COULOIR' && r.creneau === 'SOIR').forEach(r => {
      situations.push({
        type:        'VISCERAL_COULOIR_SOIR',
        semaine:     meta.semaine,
        jour:        r.jour,
        description: 'Viscéral au couloir le soir : ' + (r.ide || '?'),
        details:     r.creneau
      });
    });

    return situations;
  }

  // ------------------------------------------------------------------
  // ANALYZE WEEK — charge depuis Supabase (lecture seule, pas de création)
  // ------------------------------------------------------------------

  async function analyzeWeek(semaine, annee) {
    const { data: semaineRow, error: errS } = await DB
      .from('planning_semaines')
      .select('*')
      .eq('annee', annee)
      .eq('semaine', semaine)
      .maybeSingle();

    if (errS) throw new Error('Erreur chargement semaine : ' + errS.message);
    if (!semaineRow) return null;

    const { data: rows, error: errA } = await DB
      .from('planning_affectations')
      .select('*')
      .eq('semaine_id', semaineRow.id);

    if (errA) throw new Error('Erreur chargement affectations : ' + errA.message);

    const week = {
      meta: {
        semaine:  semaineRow.semaine,
        annee:    semaineRow.annee,
        statut:   semaineRow.statut,
        version:  'V2'
      },
      affectations: rows || []
    };

    return {
      meta:       week.meta,
      stats:      computeWeekStats(week),
      situations: detectSituations(week)
    };
  }

  // ------------------------------------------------------------------
  // ANALYZE ALL — charge toutes les semaines en 2 requêtes
  // ------------------------------------------------------------------

  async function analyzeAll() {
    // 1 requête pour toutes les semaines
    const { data: semaines, error: errS } = await DB
      .from('planning_semaines')
      .select('*')
      .order('annee')
      .order('semaine');

    if (errS) throw new Error('Erreur liste semaines : ' + errS.message);
    if (!semaines?.length) return [];

    const semaineIds = semaines.map(s => s.id);

    // 1 requête pour toutes les affectations (toutes semaines)
    const { data: allAff, error: errA } = await DB
      .from('planning_affectations')
      .select('*')
      .in('semaine_id', semaineIds)
      .limit(10000);

    if (errA) throw new Error('Erreur chargement affectations : ' + errA.message);

    // Indexer les affectations par semaine_id
    const affByWeek = new Map();
    for (const a of (allAff || [])) {
      if (!affByWeek.has(a.semaine_id)) affByWeek.set(a.semaine_id, []);
      affByWeek.get(a.semaine_id).push(a);
    }

    const results = semaines.map(s => {
      const week = {
        meta: { semaine: s.semaine, annee: s.annee, statut: s.statut, version: 'V2' },
        affectations: affByWeek.get(s.id) || []
      };
      return {
        key:        s.annee + '_' + String(s.semaine).padStart(2,'0') + '_planning_week',
        meta:       week.meta,
        stats:      computeWeekStats(week),
        situations: detectSituations(week)
      };
    });

    return results;
  }

  // ------------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------------

  return {
    computeWeekStats,
    detectSituations,
    analyzeWeek,
    analyzeAll
  };

})();

'@
[System.IO.File]::WriteAllText("$DST\planning-analytics.js", $c_planning_analytics_js, [System.Text.Encoding]::UTF8)

# planning-export.js
$c_planning_export_js = @'
// =====================================================
// PLANNING EXPORT V2.0.0
// Export CSV + JSON
// V2 : Supabase au lieu de CDS_Storage
// Dépendances : window.bdb, PlanningSchema, PlanningEngine
// =====================================================

window.PlanningExport = (() => {
  'use strict';

  const CSV_HEADER = [
    'semaine','annee','jour','secteur','salle','chirurgien','creneau','ide','role',
    'ouverture','visceral','doublure','doublure_sous','salle_fermee','urgence_fermee'
  ];

  // ------------------------------------------------------------------
  // UTILITAIRES
  // ------------------------------------------------------------------

  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escCsv(value) {
    const s = String(value ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replaceAll('"', '""') + '"';
    }
    return s;
  }

  function weekToCSV(weekObj) {
    if (!weekObj?.meta) throw new Error('Semaine invalide');
    const { semaine, annee } = weekObj.meta;
    let csv = CSV_HEADER.join(',') + '\n';
    for (const a of (weekObj.affectations || [])) {
      const row = [
        semaine, annee,
        a.jour, a.secteur, a.salle ?? '',
        a.chirurgien ?? '', a.creneau,
        a.ide ?? '', a.role ?? '',
        a.ouverture ?? 0, a.visceral ?? 0,
        a.doublure ?? 0, a.doublure_sous ?? '',
        a.salle_fermee ?? 0, a.urgence_fermee ?? 0
      ].map(escCsv);
      csv += row.join(',') + '\n';
    }
    return csv;
  }

  // ------------------------------------------------------------------
  // EXPORT SEMAINE — via PlanningEngine (Supabase)
  // ------------------------------------------------------------------

  async function exportWeekCSV(semaine, annee) {
    const week = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    if (!week) throw new Error('Semaine introuvable');
    const key = PlanningSchema.getWeekKey(semaine, annee);
    downloadBlob(key + '.csv', weekToCSV(week), 'text/csv');
  }

  async function exportWeekJSON(semaine, annee) {
    const week = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    if (!week) throw new Error('Semaine introuvable');
    const key = PlanningSchema.getWeekKey(semaine, annee);
    downloadBlob(key + '.json', JSON.stringify(week, null, 2), 'application/json');
  }

  // ------------------------------------------------------------------
  // EXPORT PACK TOUTES SEMAINES — 2 requêtes Supabase
  // ------------------------------------------------------------------

  async function exportAllPack() {
    const DB = window.bdb;

    const { data: semaines, error: errS } = await DB
      .from('planning_semaines')
      .select('*')
      .order('annee')
      .order('semaine');

    if (errS) throw new Error('Erreur liste semaines : ' + errS.message);
    if (!semaines?.length) throw new Error('Aucune semaine en base');

    const { data: allAff, error: errA } = await DB
      .from('planning_affectations')
      .select('*')
      .in('semaine_id', semaines.map(s => s.id))
      .limit(10000);

    if (errA) throw new Error('Erreur chargement affectations : ' + errA.message);

    const affByWeek = new Map();
    for (const a of (allAff || [])) {
      if (!affByWeek.has(a.semaine_id)) affByWeek.set(a.semaine_id, []);
      affByWeek.get(a.semaine_id).push(a);
    }

    const pack = {
      meta: {
        version:    'V2',
        exportedAt: new Date().toISOString(),
        count:      semaines.length
      },
      weeks: semaines.map(s => ({
        meta: {
          semaine: s.semaine,
          annee:   s.annee,
          statut:  s.statut,
          version: 'V2'
        },
        affectations: affByWeek.get(s.id) || []
      }))
    };

    downloadBlob(
      'planning_pack_' + new Date().toISOString().slice(0, 10) + '.json',
      JSON.stringify(pack, null, 2),
      'application/json'
    );
  }

  // ------------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------------

  return {
    weekToCSV,
    exportWeekCSV,
    exportWeekJSON,
    exportAllPack
  };

})();

'@
[System.IO.File]::WriteAllText("$DST\planning-export.js", $c_planning_export_js, [System.Text.Encoding]::UTF8)

# planning-controller.js
$c_planning_controller_js = @'
// =====================================================
// PLANNING CONTROLLER v4.0.0
// V4 : bdbShellReady + PlanningMembers.init() async
//      3 états DOM (loading / error / content)
//      Zéro console.error → toast CDS
//      Inline JS absorbé (modalCloseSalles show.bs.modal)
// =====================================================

(function () {
  'use strict';

  // ─────────────────────────────────────────────────
  // SECTION 1 — UTILITAIRES DE BASE
  // ─────────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }

  function escHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(msg) {
    const el = $('toastInfo');
    if (!el) return;
    const body = el.querySelector('.toast-body');
    if (body) body.textContent = String(msg ?? '');
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  // ─────────────────────────────────────────────────
  // SECTION 2 — ÉTATS ASYNC DOM
  // ─────────────────────────────────────────────────

  function showLoading() {
    $('planLoading')?.classList.remove('d-none');
    $('planError')?.classList.add('d-none');
    $('planContent')?.classList.add('d-none');
  }

  function showError(msg) {
    $('planLoading')?.classList.add('d-none');
    const errEl = $('planError');
    if (errEl) {
      errEl.classList.remove('d-none');
      const msgEl = $('planErrorMsg');
      if (msgEl) msgEl.textContent = String(msg || 'Erreur de chargement.');
    }
    $('planContent')?.classList.add('d-none');
  }

  function showContent() {
    $('planLoading')?.classList.add('d-none');
    $('planError')?.classList.add('d-none');
    $('planContent')?.classList.remove('d-none');
  }

  // ─────────────────────────────────────────────────
  // SECTION 3 — GESTION TEMPORELLE
  // ─────────────────────────────────────────────────

  const MONTHS_FR = [
    'janvier','février','mars','avril','mai','juin',
    'juillet','août','septembre','octobre','novembre','décembre'
  ];

  function pad2(n) { const x = Number(n); return x < 10 ? '0' + x : String(x); }

  function formatDateFR(d) {
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function getISOWeekMonday(week, year) {
    const w = Number(week), y = Number(year);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const day  = jan4.getUTCDay() || 7;
    const mon1 = new Date(jan4);
    mon1.setUTCDate(jan4.getUTCDate() - (day - 1));
    const monday = new Date(mon1);
    monday.setUTCDate(mon1.getUTCDate() + (w - 1) * 7);
    return new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
  }

  function computeWeekDates(semaine, annee) {
    const mon = getISOWeekMonday(semaine, annee);
    const days = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(mon); d.setDate(mon.getDate() + i); return d;
    });
    return { monday: mon, days, friday: days[4] };
  }

  function setWeekContext(semaine, annee) {
    const el = $('weekContext');
    if (!el) return;
    if (!semaine || !annee) { el.textContent = ''; return; }
    const { monday, friday } = computeWeekDates(semaine, annee);
    el.textContent = 'Semaine ' + semaine + ' — ' + MONTHS_FR[monday.getMonth()] + ' ' + annee +
      ' — ' + formatDateFR(monday) + ' → ' + formatDateFR(friday);
  }

  // ─────────────────────────────────────────────────
  // SECTION 4 — RÉFÉRENTIELS
  // ─────────────────────────────────────────────────

  const FALLBACK_SALLES = ['05','06','07','08'];

  function getStrictSalles() {
    const s = PlanningSchema?.SALLES;
    return Array.isArray(s) && s.length
      ? s.map(v => PlanningSchema.normalizeSalle(v))
      : FALLBACK_SALLES;
  }

  function getStrictChirurgiens() { return PlanningMembers.getMedecins(true); }
  function getStrictIDEs()        { return PlanningMembers.getIDEs(true); }

  function getWeekAffectations() {
    const w = PlanningEngine?.getCurrentWeek?.();
    return Array.isArray(w?.affectations) ? w.affectations : [];
  }

  function isSameSlot(a, jour, creneau) {
    return String(a?.jour    || '') === String(jour    || '') &&
           String(a?.creneau || '') === String(creneau || '');
  }

  // ─────────────────────────────────────────────────
  // SECTION 5 — summarizeCell (matrix + table)
  // ─────────────────────────────────────────────────

  function summarizeCell(list, { isCouloir = false } = {}) {
    if (!Array.isArray(list) || list.length === 0) return '';

    function atomDiv(code, flags = {}) {
      const d     = PlanningMembers.display(code);
      const known = PlanningMembers.isKnown(code);
      const name  = known
        ? escHtml(d)
        : '<span class="text-danger fw-semibold">' + escHtml(d) + '</span>';
      let cls = 'small rounded-1 px-1';
      if      (flags.ouverture && flags.visceral) cls += ' bg-success-subtle border border-warning';
      else if (flags.ouverture && flags.nuit)     cls += ' bg-success-subtle border border-info';
      else if (flags.ouverture)  cls += ' bg-success-subtle';
      else if (flags.doublure)   cls += ' bg-warning-subtle';
      else if (flags.visceral)   cls += ' bg-warning-subtle text-warning-emphasis';
      else if (flags.nuit)       cls += ' bg-info-subtle';
      else if (flags.etudiant)   cls += ' plan-bg-etudiant';
      else                       cls  = 'small';
      return '<div class="' + cls + '">' + name + '</div>';
    }

    if (isCouloir) {
      return list
        .filter(a => String(a.ide || '').trim())
        .map(a => atomDiv(String(a.ide).trim(), {
          ouverture: Number(a.ouverture) === 1,
          doublure:  Number(a.doublure)  === 1,
          visceral:  Number(a.visceral)  === 1,
          nuit:      Number(a.nuit)      === 1,
          etudiant:  a.role === 'ETUDIANT'
        })).join('');
    }

    const chirCode = Array.from(new Set(
      list.map(x => String(x.chirurgien || '').trim()).filter(Boolean)
    ))[0] || '';

    let html = '';
    if (chirCode) {
      const d   = PlanningMembers.display(chirCode);
      const cls = PlanningMembers.isKnown(chirCode) ? 'fw-semibold small' : 'fw-semibold small text-danger';
      html += '<div class="' + cls + '">' + escHtml(d) + '</div>';
    }

    for (const a of list) {
      const ide = String(a.ide || '').trim();
      if (!ide) continue;
      html += atomDiv(ide, {
        ouverture: Number(a.ouverture) === 1,
        doublure:  Number(a.doublure)  === 1,
        visceral:  Number(a.visceral)  === 1,
        nuit:      Number(a.nuit)      === 1,
        etudiant:  a.role === 'ETUDIANT'
      });
    }
    return html;
  }

  // ─────────────────────────────────────────────────
  // SECTION 6 — RENDU MATRICE
  // ─────────────────────────────────────────────────

  function renderMatrixGrid(semaine, annee) {
    const host = $('matrixGrid');
    if (!host) return;

    PlanningMatrix.render({
      container:    host,
      affectations: getWeekAffectations(),
      semaine,
      annee,
      salles: getStrictSalles(),
      onCellClick: ({ jour, creneau, secteur, salle }) => {
        PlanningSlotEditor.openTerrainModalForSlot({
          jour, creneau, secteur,
          salle: salle !== '' ? PlanningSchema.normalizeSalle(salle) : ''
        });
      }
    });
  }

  // ─────────────────────────────────────────────────
  // SECTION 7 — WARNINGS & STATUT
  // ─────────────────────────────────────────────────

  function renderWarnings(warnings) {
    const ul = $('weekWarnings');
    if (!ul) return;
    ul.innerHTML = '';

    const statut  = PlanningEngine.getWeekStatut();
    const badgeEl = $('weekStatutBadge');
    if (badgeEl) {
      badgeEl.className  = statut === 'COMPLETE' ? 'badge bg-success' : 'badge bg-secondary';
      badgeEl.textContent = statut === 'COMPLETE' ? 'Complète' : 'En cours';
    }

    if (!warnings?.length) {
      ul.innerHTML = '<li class="list-group-item text-success small"><i class="bi bi-check-circle me-1"></i>Aucune anomalie détectée</li>';
      return;
    }

    const errors = warnings.filter(w => w.level === 'error');
    const others = warnings.filter(w => w.level !== 'error');

    for (const w of [...errors, ...others]) {
      const li = document.createElement('li');
      if (w.level === 'error') {
        li.className = 'list-group-item list-group-item-danger small';
        li.innerHTML = '<i class="bi bi-x-circle me-1"></i>' + escHtml(w.message);
      } else {
        li.className = 'list-group-item list-group-item-warning small';
        li.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>' + escHtml(w.message);
      }
      ul.appendChild(li);
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 8 — TABLE AFFECTATIONS
  // ─────────────────────────────────────────────────

  function renderTable(week) {
    const tbody   = $('tbodyAffectations');
    const countEl = $('countAffectations');
    if (!tbody) return;

    const slotMap = new Map();
    (week?.affectations || []).forEach((a, idx) => {
      const k = a.jour + '__' + a.creneau + '__' + a.secteur + '__' + (a.salle ?? '');
      if (!slotMap.has(k)) slotMap.set(k, {
        key: { jour: a.jour, creneau: a.creneau, secteur: a.secteur, salle: a.salle ?? '' },
        atomes: []
      });
      slotMap.get(k).atomes.push({ a, idx });
    });

    const allSlots = Array.from(slotMap.values());
    if (countEl) countEl.textContent = String(allSlots.length);

    const activeFilter = $('affFilterBar')?.dataset.filter || 'all';
    const filtered = allSlots.filter(({ key, atomes }) => {
      const aa = atomes.map(x => x.a);
      if (activeFilter === 'all')       return true;
      if (activeFilter === 'couloir')   return key.secteur.toUpperCase() === 'COULOIR';
      if (activeFilter === 'visceral')  return aa.some(a => Number(a.visceral)     === 1);
      if (activeFilter === 'fermee')    return aa.some(a => Number(a.salle_fermee) === 1);
      if (activeFilter === 'ouverture') return aa.some(a => Number(a.ouverture)    === 1);
      return true;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-secondary py-4">' +
        '<i class="bi bi-inbox me-1"></i>Aucun slot' +
        (activeFilter !== 'all' ? ' pour ce filtre' : '') + '</td></tr>';
      return;
    }

    const JOURS_O    = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI'];
    const CRENEAUX_O = ['MATIN','APREM','SOIR'];

    function slotPriority({ key, atomes }) {
      const aa = atomes.map(x => x.a);
      const isCouloir  = key.secteur.toUpperCase() === 'COULOIR';
      const isVisceral = isCouloir && aa.some(a => Number(a.visceral) === 1);
      if (isCouloir && !isVisceral)                     return 0;
      if (isVisceral)                                   return 1;
      if (aa.some(a => Number(a.salle_fermee) === 1))   return 2;
      if (aa.some(a => Number(a.ouverture)    === 1))   return 3;
      return 4;
    }

    filtered.sort((x, y) => {
      if (activeFilter !== 'all') {
        const ji = JOURS_O.indexOf(x.key.jour), jj = JOURS_O.indexOf(y.key.jour);
        if (ji !== jj) return (ji < 0 ? 99 : ji) - (jj < 0 ? 99 : jj);
        const ci = CRENEAUX_O.indexOf(x.key.creneau), cj = CRENEAUX_O.indexOf(y.key.creneau);
        if (ci !== cj) return (ci < 0 ? 99 : ci) - (cj < 0 ? 99 : cj);
        return String(x.key.salle).localeCompare(String(y.key.salle));
      }
      const px = slotPriority(x), py = slotPriority(y);
      if (px !== py) return px - py;
      const ji = JOURS_O.indexOf(x.key.jour), jj = JOURS_O.indexOf(y.key.jour);
      if (ji !== jj) return (ji < 0 ? 99 : ji) - (jj < 0 ? 99 : jj);
      const ci = CRENEAUX_O.indexOf(x.key.creneau), cj = CRENEAUX_O.indexOf(y.key.creneau);
      if (ci !== cj) return (ci < 0 ? 99 : ci) - (cj < 0 ? 99 : cj);
      return String(x.key.salle).localeCompare(String(y.key.salle));
    });

    function safeDisplay(code) {
      if (!code) return '';
      return PlanningMembers.isKnown(code)
        ? escHtml(PlanningMembers.display(code))
        : '<span class="text-danger fw-semibold" title="Code inconnu">' + escHtml(code) + '</span>';
    }

    function rowClass({ atomes, key }) {
      const aa = atomes.map(x => x.a);
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1)) return 'row-ferme-degrade';
      if (aa.some(a => Number(a.salle_fermee) === 1)) return 'row-fermee';
      if (aa.some(a => Number(a.visceral)     === 1)) return 'row-visceral';
      if (aa.some(a => Number(a.ouverture)    === 1)) return 'row-ouverture';
      if (key.secteur.toUpperCase() === 'COULOIR')    return 'row-couloir';
      return '';
    }

    function secteurBadge(key, isFermee) {
      if (key.secteur.toUpperCase() === 'COULOIR')
        return '<span class="badge bg-primary">Couloir</span>';
      return isFermee
        ? '<span class="badge bg-secondary"><i class="bi bi-lock me-1"></i>Salle ' + escHtml(String(key.salle)) + '</span>'
        : '<span class="badge bg-info-subtle text-info border border-info-subtle">Salle ' + escHtml(String(key.salle)) + '</span>';
    }

    function statutBadges(atomes) {
      const aa = atomes.map(x => x.a), out = [];
      if (aa.some(a => Number(a.salle_fermee) === 1 && Number(a.ferme_degrade) === 1))
        out.push('<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>Dégradé</span>');
      else if (aa.some(a => Number(a.salle_fermee) === 1))
        out.push('<span class="badge bg-secondary">Fermée</span>');
      if (aa.some(a => Number(a.visceral)  === 1)) out.push('<span class="badge bg-warning-subtle text-dark border">Viscéral</span>');
      if (aa.some(a => Number(a.ouverture) === 1)) out.push('<span class="badge bg-success-subtle text-success border">Ouverture</span>');
      if (aa.some(a => Number(a.doublure)  === 1)) out.push('<span class="badge bg-warning text-dark">Doublure</span>');
      if (aa.some(a => a.role === 'ETUDIANT'))      out.push('<span class="badge plan-bg-etudiant plan-text-etudiant border">Étudiant</span>');
      return out.length ? out.join(' ') : '<span class="text-muted">—</span>';
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(slot => {
      const { key, atomes } = slot;
      const isCouloir = key.secteur.toUpperCase() === 'COULOIR';
      const isFermee  = atomes.some(x => Number(x.a.salle_fermee) === 1);
      const indices   = atomes.map(x => x.idx);
      const chir = isCouloir
        ? '<span class="text-muted">—</span>'
        : (() => {
            const c = atomes.map(x => x.a.chirurgien).find(c => c?.trim());
            return c ? safeDisplay(c) : '<span class="text-muted">—</span>';
          })();

      const tr = document.createElement('tr');
      tr.className = rowClass(slot);
      tr.innerHTML =
        '<td class="small align-middle ps-3">' + secteurBadge(key, isFermee) + '</td>' +
        '<td class="small align-middle fw-semibold">' + escHtml(key.jour) + '</td>' +
        '<td class="small align-middle text-muted">' + escHtml(key.creneau) + '</td>' +
        '<td class="small align-middle">' + chir + '</td>' +
        '<td class="small align-middle">' + (isFermee
          ? '<span class="text-muted fst-italic">Salle fermée</span>'
          : summarizeCell(atomes.map(x => x.a), { isCouloir })) + '</td>' +
        '<td class="small align-middle">' + statutBadges(atomes) + '</td>' +
        '<td class="text-end align-middle pe-3">' +
          '<div class="btn-group btn-group-sm">' +
            '<button class="btn btn-sm btn-outline-secondary btn-edit-slot" title="Éditer"' +
              ' data-jour="' + escHtml(key.jour) + '"' +
              ' data-creneau="' + escHtml(key.creneau) + '"' +
              ' data-secteur="' + escHtml(key.secteur) + '"' +
              ' data-salle="' + escHtml(String(key.salle ?? '')) + '">' +
              '<i class="bi bi-pencil"></i>' +
            '</button>' +
            '<button class="btn btn-sm btn-outline-danger btn-delete-slot" title="Supprimer"' +
              ' data-indices="' + escHtml(JSON.stringify(indices)) + '">' +
              '<i class="bi bi-trash"></i>' +
            '</button>' +
          '</div>' +
        '</td>';
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    if (!tbody.dataset.listenersAttached) {
      tbody.dataset.listenersAttached = '1';
      tbody.addEventListener('click', async (e) => {
        const btnEdit = e.target.closest('.btn-edit-slot');
        if (btnEdit) {
          PlanningSlotEditor.openTerrainModalForSlot({
            jour:    btnEdit.dataset.jour,
            creneau: btnEdit.dataset.creneau,
            secteur: btnEdit.dataset.secteur,
            salle:   btnEdit.dataset.salle !== ''
              ? PlanningSchema.normalizeSalle(btnEdit.dataset.salle) : ''
          });
          return;
        }
        const btnDel = e.target.closest('.btn-delete-slot');
        if (btnDel) {
          const indices = JSON.parse(btnDel.dataset.indices || '[]');
          if (!indices.length) return;
          if (!confirm('Supprimer ce slot (' + indices.length + ' entrée' + (indices.length > 1 ? 's' : '') + ') ?')) return;
          try {
            await PlanningEngine.removeAffectationsByIndices(indices);
            await loadWeekAndRender();
            toast('Slot supprimé');
          } catch (err) { toast(err?.message || 'Erreur suppression'); }
        }
      });
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 9 — FLOW PRINCIPAL
  // ─────────────────────────────────────────────────

  function readWeekInputs() {
    return {
      semaine: Number($('weekInput')?.value || 0),
      annee:   Number($('yearInput')?.value  || 0)
    };
  }

  function setWeekKeyLabel(semaine, annee) {
    const el = $('weekKey');
    if (el) el.textContent = PlanningSchema.getWeekKey(semaine, annee);
  }

  async function loadWeekAndRender() {
    const { semaine, annee } = readWeekInputs();
    if (!semaine || !annee) { toast('Semaine/année invalide'); return; }
    setWeekKeyLabel(semaine, annee);
    setWeekContext(semaine, annee);
    const week = await PlanningEngine.loadOrCreateWeek(semaine, annee);
    renderTable(week);
    renderWarnings(PlanningEngine.checkWeekIntegrity());
    renderMatrixGrid(semaine, annee);
    window.PlanningAvailability.refreshAvailabilityHints();
    const statut = PlanningEngine.getWeekStatut();
    const btn = $('btnDeclareComplete');
    if (btn) {
      btn.className = statut === 'COMPLETE'
        ? 'btn btn-sm btn-success w-100'
        : 'btn btn-sm btn-outline-success w-100';
      btn.innerHTML = statut === 'COMPLETE'
        ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
        : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
    }
  }

  // ─────────────────────────────────────────────────
  // SECTION 10 — INITIALISATION ASYNC
  // ─────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {

    // 1. Attendre bdb-shell (auth + bdbUser)
    await window.bdbShellReady;

    showLoading();

    // 2. Init PlanningMembers depuis Supabase
    try {
      await PlanningMembers.init();
    } catch (err) {
      showError('Erreur chargement membres : ' + (err?.message || err));
      return;
    }

    // 3. Câblage btn retry
    $('btnRetryPlan')?.addEventListener('click', async () => {
      showLoading();
      try {
        await PlanningMembers.init();
        await loadWeekAndRender();
        showContent();
      } catch (err) {
        showError('Erreur rechargement : ' + (err?.message || err));
      }
    });

    // 4. Câblage modules
    window.PlanningAvailability.setDeps({
      $, getWeekAffectations, getStrictIDEs, isSameSlot
    });

    window.PlanningImportUI.setDeps({
      $, toast, loadWeekAndRender, readWeekInputs
    });

    PlanningSlotEditor.setDeps({
      $,
      toast,
      loadWeekAndRender,
      getStrictIDEs,
      getStrictChirurgiens,
      getStrictSalles,
      getWeekAffectations,
      isSameSlot
    });
    PlanningSlotEditor.initModalEvents();

    // 5. Inline JS absorbé : modalCloseSalles
    $('modalCloseSalles')?.addEventListener('show.bs.modal', () => {
      PlanningSlotEditor.openCloseSallesModal();
    });

    // 6. Navigation semaine
    $('btnLoadWeek')?.addEventListener('click', () => {
      loadWeekAndRender().catch(err => toast(err?.message || 'Erreur chargement'));
    });

    $('btnPrevWeek')?.addEventListener('click', () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (--w < 1) { w = 53; y--; }
      $('weekInput').value = String(w);
      $('yearInput').value = String(y);
      loadWeekAndRender().catch(err => toast(err?.message || 'Erreur chargement'));
    });

    $('btnNextWeek')?.addEventListener('click', () => {
      let { semaine: w, annee: y } = readWeekInputs();
      if (!w || !y) return;
      if (++w > 53) { w = 1; y++; }
      $('weekInput').value = String(w);
      $('yearInput').value = String(y);
      loadWeekAndRender().catch(err => toast(err?.message || 'Erreur chargement'));
    });

    // 7. Toggle liste
    $('btnToggleLegacyTable')?.addEventListener('click', () => {
      $('legacyTableCard')?.classList.toggle('d-none');
    });

    // 8. Filtres table
    $('affFilterBar')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const bar = $('affFilterBar');
      bar.dataset.filter = btn.dataset.filter;
      bar.querySelectorAll('button').forEach(b => {
        const active   = b === btn;
        const colorMap = { couloir:'primary', visceral:'danger', fermee:'secondary', ouverture:'success', all:'primary' };
        const color    = colorMap[b.dataset.filter] || 'primary';
        b.className    = 'btn btn-sm ' + (active ? 'btn-' + color + ' active' : 'btn-outline-' + color);
      });
      const week = PlanningEngine.getCurrentWeek();
      if (week) renderTable(week);
    });

    // 9. Import CSV / JSON
    $('btnImportCSV')?.addEventListener('click', () => {
      const inp = $('fileImportCSV'); if (!inp) return;
      inp.value = ''; inp.click();
    });
    $('fileImportCSV')?.addEventListener('change', (e) => {
      const files = Array.from(e.target?.files || []);
      if (files.length) window.PlanningImportUI.importCSVFiles(files).catch(err => toast(err?.message || 'Erreur import CSV'));
    });

    $('btnImportJSON')?.addEventListener('click', () => {
      const inp = $('fileImportJSON'); if (!inp) return;
      inp.value = ''; inp.click();
    });
    $('fileImportJSON')?.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (file) window.PlanningImportUI.importJSONFile(file).catch(err => toast(err?.message || 'Erreur import JSON'));
    });

    // 10. Snapshot
    $('btnSnapshotWork')?.addEventListener('click', () => {
      window.PlanningImportUI.snapshotWork().catch(err => toast(err?.message || 'Erreur snapshot'));
    });

    // 11. Déclarer semaine complète
    $('btnDeclareComplete')?.addEventListener('click', async () => {
      try {
        const statut = PlanningEngine.getWeekStatut();
        const next   = statut === 'COMPLETE' ? 'EN_COURS' : 'COMPLETE';
        await PlanningEngine.setWeekStatut(next);
        renderWarnings(PlanningEngine.checkWeekIntegrity());
        const btn = $('btnDeclareComplete');
        if (btn) {
          btn.className  = next === 'COMPLETE' ? 'btn btn-sm btn-success w-100' : 'btn btn-sm btn-outline-success w-100';
          btn.innerHTML  = next === 'COMPLETE'
            ? '<i class="bi bi-check2-all me-1"></i>Semaine complète — cliquer pour annuler'
            : '<i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète';
        }
        if (next === 'COMPLETE') {
          const { semaine, annee } = readWeekInputs();
          const filename = annee + '_S' + String(semaine).padStart(2, '0') + '_planning_week.json';
          await window.PlanningImportUI.snapshotWork(filename).catch(err => toast(err?.message || 'Erreur snapshot'));
          toast('Semaine déclarée complète — snapshot : ' + filename);
        } else {
          toast('Semaine repassée en cours');
        }
      } catch (err) { toast(err?.message || 'Erreur statut'); }
    });

    // 12. Fermer salles
    $('btnCloseSalles')?.addEventListener('click', () => {
      PlanningSlotEditor.openCloseSallesModal();
      bootstrap.Modal.getOrCreateInstance($('modalCloseSalles')).show();
    });
    $('btnConfirmCloseSalles')?.addEventListener('click', () => {
      PlanningSlotEditor.closeSallesSelection().catch(err => toast(err?.message || 'Erreur fermeture'));
    });

    // 13. Chargement initial
    try {
      await loadWeekAndRender();
      showContent();
    } catch (err) {
      showError('Erreur chargement planning : ' + (err?.message || err));
      return;
    }

    // Hook public
    window.PlanningController = {
      loadWeekAndRender: () => loadWeekAndRender().catch(err => toast(err?.message || 'Erreur'))
    };

  });

})();

'@
[System.IO.File]::WriteAllText("$DST\planning-controller.js", $c_planning_controller_js, [System.Text.Encoding]::UTF8)

# export-controller.js
$c_export_controller_js = @'
// =====================================================
// EXPORT CONTROLLER V2.0.0
// V2 : Supabase — bdbShellReady — 3 états — zéro console.error
// Dépendances : window.bdb, PlanningEngine, PlanningExport
// =====================================================

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function escHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(msg, kind) {
    const el = $('toastInfo');
    if (!el) return;
    const header = el.querySelector('.toast-header');
    const body   = el.querySelector('.toast-body');
    if (body) body.textContent = String(msg ?? '');
    if (header) {
      header.classList.remove('text-danger','text-success','text-warning');
      if (kind === 'danger')  header.classList.add('text-danger');
      if (kind === 'success') header.classList.add('text-success');
      if (kind === 'warning') header.classList.add('text-warning');
    }
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  // ------------------------------------------------------------------
  // Diagnostics — Liste les semaines en base (remplace listKeys localStorage)
  // ------------------------------------------------------------------

  async function listWeeks() {
    try {
      const weeks = await PlanningEngine.listWeeks();
      const out   = $('diagOut');
      if (!out) return;
      if (!weeks.length) {
        out.textContent = 'Aucune semaine en base.';
        return;
      }
      const lines = ['Semaines en base : ' + weeks.length, ''];
      for (const w of weeks) {
        lines.push(
          w.annee + '_' + String(w.semaine).padStart(2, '0') +
          '_planning_week — ' + w.statut
        );
      }
      out.textContent = lines.join('\n');
    } catch (err) {
      toast(err?.message || 'Erreur', 'danger');
    }
  }

  // ------------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', async () => {

    await window.bdbShellReady;

    // Export semaine CSV
    $('btnExportWeekCSV')?.addEventListener('click', async () => {
      try {
        const semaine = Number($('weekInput')?.value || 0);
        const annee   = Number($('yearInput')?.value  || 0);
        await PlanningExport.exportWeekCSV(semaine, annee);
        toast('Export CSV effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export CSV', 'danger'); }
    });

    // Export semaine JSON
    $('btnExportWeekJSON')?.addEventListener('click', async () => {
      try {
        const semaine = Number($('weekInput')?.value || 0);
        const annee   = Number($('yearInput')?.value  || 0);
        await PlanningExport.exportWeekJSON(semaine, annee);
        toast('Export JSON effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export JSON', 'danger'); }
    });

    // Export pack complet
    $('btnExportAllPack')?.addEventListener('click', async () => {
      try {
        await PlanningExport.exportAllPack();
        toast('Export pack effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export pack', 'danger'); }
    });

    // Lister semaines
    $('btnListKeys')?.addEventListener('click', () => {
      listWeeks().catch(err => toast(err?.message || 'Erreur', 'danger'));
    });

    // Chargement initial
    await listWeeks();

  });

})();

'@
[System.IO.File]::WriteAllText("$DST\export-controller.js", $c_export_controller_js, [System.Text.Encoding]::UTF8)

# planning.html
$c_planning_html = @'
<!DOCTYPE html>
<html lang="fr" data-bs-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Planning — Saisie</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@a75daa03b876d052f834046ab3cff6e7583bee65/theme-base.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@a75daa03b876d052f834046ab3cff6e7583bee65/theme-print.css" rel="stylesheet" media="print"/>
  <link href="../../css/cds-overrides.css" rel="stylesheet"/>
  <link href="planning-ui.css" rel="stylesheet"/>
</head>

<body class="d-flex min-vh-100">

<main class="d-flex flex-column flex-grow-1 main-content">

  <!-- INTERDIT-E1 : #bdb-shell = premier enfant de <main> -->
  <div id="bdb-shell"
       data-module-title="Planning — Saisie"
       data-module-icon="bi-calendar2-week"></div>

  <!-- TOOLBAR SEMAINE (sticky sous le header BDB) -->
  <div class="plan-toolbar sticky-top bg-white border-bottom shadow-sm px-4 py-2 d-flex flex-wrap align-items-center gap-2 no-print">
    <div class="btn-group" role="group" aria-label="Navigation semaine">
      <button id="btnPrevWeek" class="btn btn-outline-secondary btn-sm" title="Semaine précédente">
        <i class="bi bi-chevron-left"></i>
      </button>
      <button id="btnLoadWeek" class="btn btn-outline-secondary btn-sm">Charger semaine</button>
      <button id="btnNextWeek" class="btn btn-outline-secondary btn-sm" title="Semaine suivante">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    <span id="weekContext" class="badge bg-light text-dark border"></span>

    <button id="btnImportCSV" class="btn btn-outline-primary btn-sm">
      <i class="bi bi-upload me-1"></i>Importer CSV
    </button>
    <button id="btnImportJSON" class="btn btn-outline-secondary btn-sm">
      <i class="bi bi-filetype-json me-1"></i>Importer JSON
    </button>
    <button id="btnSnapshotWork" class="btn btn-outline-secondary btn-sm">
      <i class="bi bi-save me-1"></i>Snapshot
    </button>

    <div class="btn-group">
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-lightning-fill me-1"></i>Saisie rapide
      </button>
      <ul class="dropdown-menu">
        <li>
          <button class="dropdown-item" id="btnCloseSalles" data-bs-toggle="modal" data-bs-target="#modalCloseSalles">
            <i class="bi bi-lock me-2"></i>Fermer des créneaux
          </button>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#batchModalChirurgiens">
            <i class="bi bi-person-badge me-2 text-primary"></i>Chirurgiens
          </button>
        </li>
        <li>
          <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#batchModalIDEs">
            <i class="bi bi-people me-2 text-success"></i>IDEs (INSTRU / PANSEUR)
          </button>
        </li>
        <li>
          <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#batchModalCouloir">
            <i class="bi bi-arrow-left-right me-2 text-info"></i>Couloir
          </button>
        </li>
      </ul>
    </div>

    <button class="btn btn-primary btn-sm ms-auto" data-bs-toggle="modal" data-bs-target="#modalCreate">
      <i class="bi bi-plus-lg me-1"></i>Nouvelle affectation
    </button>

    <!-- Inputs file (cachés) -->
    <input id="fileImportCSV" type="file" accept=".csv,text/csv" class="d-none" multiple>
    <input id="fileImportJSON" type="file" accept=".json,application/json" class="d-none">
  </div>

  <!-- CONTENU PRINCIPAL -->
  <div class="container-xxl py-4 flex-grow-1">

    <!-- ÉTAT CHARGEMENT -->
    <div id="planLoading" class="d-flex align-items-center justify-content-center py-5">
      <div class="text-center text-muted">
        <div class="spinner-border mb-3" role="status" aria-hidden="true"></div>
        <div>Chargement du planning…</div>
      </div>
    </div>

    <!-- ÉTAT ERREUR -->
    <div id="planError" class="d-none">
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill fs-5"></i>
        <span id="planErrorMsg">Erreur de chargement.</span>
        <button class="btn btn-sm btn-outline-danger ms-auto" id="btnRetryPlan">
          <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
        </button>
      </div>
    </div>

    <!-- CONTENU (affiché après chargement) -->
    <div id="planContent" class="d-none">

      <div class="row g-3 mb-4">
        <div class="col-12 col-xl-7">
          <div class="card shadow-sm">
            <div class="card-body d-flex flex-wrap align-items-end justify-content-between gap-3">
              <div>
                <div class="text-secondary">Semaine</div>
                <div class="fw-semibold" id="weekKey">—</div>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <div>
                  <label class="form-label mb-1">Semaine</label>
                  <input id="weekInput" type="number" class="form-control" value="16" min="1" max="53">
                </div>
                <div>
                  <label class="form-label mb-1">Année</label>
                  <input id="yearInput" type="number" class="form-control" value="2026" min="2020" max="2100">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-5">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <span>Contrôles semaine</span>
              <span id="weekStatutBadge" class="badge bg-secondary">En cours</span>
            </div>
            <div class="card-body">
              <ul class="list-group mb-2" id="weekWarnings"></ul>
              <button id="btnDeclareComplete" class="btn btn-sm btn-outline-success w-100">
                <i class="bi bi-check2-all me-1"></i>Déclarer la semaine complète
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VUE MATRICE -->
      <div class="card shadow-sm mb-3">
        <div class="card-header d-flex align-items-center justify-content-between">
          <div class="fw-semibold">
            <i class="bi bi-grid-3x3-gap me-2"></i>Vue matrice (jour × créneau)
          </div>
          <button id="btnToggleLegacyTable" class="btn btn-sm btn-outline-secondary" type="button">
            Afficher / masquer la liste
          </button>
        </div>
        <div class="card-body">
          <div id="matrixGrid" class="table-responsive"></div>
          <div class="small text-secondary mt-2">
            Astuce : cliquez une cellule vide pour ouvrir une affectation pré-remplie.
          </div>
        </div>
      </div>

      <!-- LISTE AFFECTATIONS -->
      <div class="card shadow-sm" id="legacyTableCard">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div class="d-flex align-items-center gap-2">
            <strong>Affectations</strong>
            <span class="badge bg-secondary"><span id="countAffectations">0</span> slots</span>
          </div>
          <div class="btn-group btn-group-sm" id="affFilterBar" data-filter="all">
            <button class="btn btn-primary active"    data-filter="all">Tous</button>
            <button class="btn btn-outline-primary"   data-filter="couloir"><i class="bi bi-arrow-left-right me-1"></i>Couloir</button>
            <button class="btn btn-outline-danger"    data-filter="visceral"><i class="bi bi-heart-pulse me-1"></i>Viscéral</button>
            <button class="btn btn-outline-secondary" data-filter="fermee"><i class="bi bi-lock me-1"></i>Fermées</button>
            <button class="btn btn-outline-success"   data-filter="ouverture"><i class="bi bi-sunrise me-1"></i>Ouvreurs</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle plan-table-min">
            <thead>
              <tr>
                <th scope="col" class="small ps-3">Secteur / Salle</th>
                <th scope="col" class="small">Jour</th>
                <th scope="col" class="small">Créneau</th>
                <th scope="col" class="small">Chirurgien</th>
                <th scope="col" class="small">Personnel</th>
                <th scope="col" class="small">Statut</th>
                <th scope="col" class="small text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody id="tbodyAffectations"></tbody>
          </table>
        </div>
      </div>

    </div><!-- /planContent -->
  </div><!-- /container-xxl -->

  <footer class="mt-auto py-3 border-top text-center text-muted bg-white no-print">
    <small>&copy; 2026 BDB Planning — Ortho-Neurochirurgie · Salles 5-8</small>
  </footer>

</main>

<!-- =====================================================
     MODALE AFFECTATION V2 — TERRAIN FIRST
===================================================== -->
<div class="modal fade" id="modalCreate" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-pencil-square text-primary me-2"></i>
          Affectation — <span id="modalContextLabel" class="fw-normal"></span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- VUE COULOIR -->
        <div id="modalViewCouloir" class="d-none">
          <div class="alert alert-info py-2 mb-3 small">
            <i class="bi bi-info-circle me-1"></i>
            Chaque personne affectée ici sera <strong>indisponible dans les salles</strong> du même créneau.
          </div>
          <div id="couloirEquipeList" class="d-flex flex-column gap-2 mb-3"></div>
          <button type="button" id="btnAddCouloirIDE" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-person-plus me-1"></i>Ajouter une personne
          </button>
        </div>

        <!-- VUE SALLE -->
        <div id="modalViewSalle" class="d-none">
          <div class="form-check form-switch mb-2">
            <input type="checkbox" class="form-check-input" id="checkboxSalleFermee" role="switch">
            <label class="form-check-label fw-semibold text-danger" for="checkboxSalleFermee">
              <i class="bi bi-lock me-1"></i>Salle fermée
            </label>
          </div>
          <div id="fermeDegradesSection" class="d-none mb-3 ps-3 border-start border-danger">
            <div class="form-check form-switch mb-0">
              <input type="checkbox" class="form-check-input" id="checkboxFermeDegrade" role="switch">
              <label class="form-check-label small text-danger" for="checkboxFermeDegrade">
                <i class="bi bi-exclamation-triangle me-1"></i>Fermée par manque de personnel (dégradé)
              </label>
            </div>
          </div>

          <div id="salleContent">
            <!-- CHIRURGIEN -->
            <div class="card mb-3 border-primary-subtle">
              <div class="card-header py-2 bg-primary-subtle text-primary fw-semibold small">
                <i class="bi bi-person-badge me-1"></i>Chirurgien
              </div>
              <div class="card-body py-2">
                <select id="selectChirurgien" class="form-select form-select-sm"></select>
              </div>
            </div>

            <!-- INSTRU -->
            <div class="card mb-3">
              <div class="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                <span class="fw-semibold small"><i class="bi bi-person me-1"></i>INSTRU</span>
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check form-switch mb-0">
                    <input type="checkbox" class="form-check-input" id="checkboxOuvertureInstru" role="switch">
                    <label class="form-check-label small text-success" for="checkboxOuvertureInstru">Ouverture</label>
                  </div>
                  <div class="form-check mb-0" id="nuitInstruWrapper">
                    <input type="checkbox" class="form-check-input" id="checkboxNuitInstru">
                    <label class="form-check-label small text-info-emphasis" for="checkboxNuitInstru">
                      <i class="bi bi-moon-stars me-1"></i>Nuit
                    </label>
                  </div>
                </div>
              </div>
              <div class="card-body py-2">
                <div class="row g-2 align-items-center mb-2">
                  <div class="col">
                    <select id="selectInstru" class="form-select form-select-sm"></select>
                  </div>
                  <div class="col-auto">
                    <div class="form-check mb-0">
                      <input type="checkbox" class="form-check-input" id="checkboxInstruInterim">
                      <label class="form-check-label small" for="checkboxInstruInterim">Intérimaire</label>
                    </div>
                  </div>
                </div>
                <div id="doublureInstruSection">
                  <button type="button" id="btnToggleDoublureInstru" class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-person-plus me-1"></i>Ajouter doublure
                  </button>
                  <div id="doublureInstruBlock" class="d-none mt-2 ps-2 border-start border-warning">
                    <div class="row g-2 align-items-center">
                      <div class="col-auto">
                        <span class="badge bg-warning-subtle text-dark small">Doublure INSTRU</span>
                      </div>
                      <div class="col">
                        <select id="selectDoublureInstru" class="form-select form-select-sm"></select>
                      </div>
                      <div class="col-auto d-none" id="doublureInstruOuvWrapper">
                        <div class="form-check mb-0">
                          <input type="checkbox" class="form-check-input" id="checkboxDoublureInstruOuv">
                          <label class="form-check-label small text-success" for="checkboxDoublureInstruOuv">Ouv.</label>
                        </div>
                      </div>
                      <div class="col-auto">
                        <div class="form-check mb-0">
                          <input type="checkbox" class="form-check-input" id="checkboxDoublureInstruInterim">
                          <label class="form-check-label small" for="checkboxDoublureInstruInterim">Intérimaire</label>
                        </div>
                      </div>
                      <div class="col-auto">
                        <button type="button" id="btnRemoveDoublureInstru" class="btn btn-outline-danger btn-sm py-0 px-2">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PANSEUR -->
            <div id="alertNuitDoublon" class="alert alert-info py-2 px-3 d-none mb-2">
              <i class="bi bi-moon-stars me-2"></i>
              <strong>Attention :</strong> Une autre IDE est déjà marquée « Nuit » ce jour.
            </div>
            <div id="warnInstruPanseur" class="alert alert-danger py-2 px-3 d-none mb-2">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Même personne en INSTRU et PANSEUR</strong> — vérifier la saisie.
            </div>
            <div class="card mb-3">
              <div class="card-header py-2 bg-light d-flex justify-content-between align-items-center">
                <span class="fw-semibold small"><i class="bi bi-person me-1"></i>PANSEUR</span>
                <div class="d-flex align-items-center gap-3">
                  <div class="form-check form-switch mb-0">
                    <input type="checkbox" class="form-check-input" id="checkboxOuverturePanseur" role="switch">
                    <label class="form-check-label small text-success" for="checkboxOuverturePanseur">Ouverture</label>
                  </div>
                  <div class="form-check mb-0" id="nuitPanseurWrapper">
                    <input type="checkbox" class="form-check-input" id="checkboxNuitPanseur">
                    <label class="form-check-label small text-info-emphasis" for="checkboxNuitPanseur">
                      <i class="bi bi-moon-stars me-1"></i>Nuit
                    </label>
                  </div>
                </div>
              </div>
              <div class="card-body py-2">
                <div class="row g-2 align-items-center mb-2">
                  <div class="col">
                    <select id="selectPanseur" class="form-select form-select-sm"></select>
                  </div>
                  <div class="col-auto">
                    <div class="form-check mb-0">
                      <input type="checkbox" class="form-check-input" id="checkboxPanseurInterim">
                      <label class="form-check-label small" for="checkboxPanseurInterim">Intérimaire</label>
                    </div>
                  </div>
                </div>
                <div id="doublurePanseurSection">
                  <button type="button" id="btnToggleDoublurePanseur" class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-person-plus me-1"></i>Ajouter doublure
                  </button>
                  <div id="doublurePanseurBlock" class="d-none mt-2 ps-2 border-start border-warning">
                    <div class="row g-2 align-items-center">
                      <div class="col-auto">
                        <span class="badge bg-warning-subtle text-dark small">Doublure PANSEUR</span>
                      </div>
                      <div class="col">
                        <select id="selectDoublurePanseur" class="form-select form-select-sm"></select>
                      </div>
                      <div class="col-auto d-none" id="doublurePanseurOuvWrapper">
                        <div class="form-check mb-0">
                          <input type="checkbox" class="form-check-input" id="checkboxDoublurePanseurOuv">
                          <label class="form-check-label small text-success" for="checkboxDoublurePanseurOuv">Ouv.</label>
                        </div>
                      </div>
                      <div class="col-auto">
                        <div class="form-check mb-0">
                          <input type="checkbox" class="form-check-input" id="checkboxDoublurePanseurInterim">
                          <label class="form-check-label small" for="checkboxDoublurePanseurInterim">Intérimaire</label>
                        </div>
                      </div>
                      <div class="col-auto">
                        <button type="button" id="btnRemoveDoublurePanseur" class="btn btn-outline-danger btn-sm py-0 px-2">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ÉTUDIANT -->
            <div class="card mb-3">
              <div class="card-body py-2">
                <div class="row g-2 align-items-center">
                  <div class="col-auto">
                    <div class="form-check form-switch mb-0">
                      <input type="checkbox" class="form-check-input" id="checkboxEtudiant" role="switch">
                      <label class="form-check-label fw-semibold small" for="checkboxEtudiant">
                        <i class="bi bi-mortarboard me-1"></i>Étudiant présent
                      </label>
                    </div>
                  </div>
                  <div class="col d-none" id="etudiantSelectWrapper">
                    <select id="selectEtudiant" class="form-select form-select-sm"></select>
                  </div>
                </div>
              </div>
            </div>

            <div id="alertIrrationnel" class="alert alert-warning py-2 small d-none">
              <i class="bi bi-exclamation-triangle me-1"></i>
              <strong>Combinaison inhabituelle</strong> — Doublure INSTRU + Doublure PANSEUR + Étudiant. Vérifier.
            </div>
          </div><!-- /salleContent -->
        </div><!-- /modalViewSalle -->
      </div><!-- /modal-body -->

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" id="btnCopySlotCreneaux" class="btn btn-outline-secondary d-none">
          <i class="bi bi-copy me-1"></i>Copier vers autres créneaux
        </button>
        <button type="button" id="btnSaveAffectation" class="btn btn-primary">
          <i class="bi bi-check-lg me-1"></i>Enregistrer
        </button>
      </div>
    </div>
  </div>
</div>

<!-- MODALE FERMETURE SALLES -->
<div class="modal fade" id="modalCloseSalles" tabindex="-1">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-lock text-warning me-2"></i>Fermer des salles
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0">
        <div class="alert alert-info small m-3 mb-0 py-2">
          <i class="bi bi-info-circle me-1"></i>
          Cochez les créneaux à fermer. Les cases grisées contiennent déjà une affectation.
        </div>
        <div class="table-responsive p-3">
          <table class="table table-sm mb-0 align-middle text-center" id="closeSallesTable">
            <thead id="closeSallesThead"></thead>
            <tbody id="closeSallesBody"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" id="btnConfirmCloseSalles" class="btn btn-warning">
          <i class="bi bi-lock me-1"></i>Fermer les salles sélectionnées
        </button>
      </div>
    </div>
  </div>
</div>

<!-- TOAST -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="toastInfo" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <i class="bi bi-info-circle me-2"></i>
      <strong class="me-auto">Planning</strong>
      <small class="text-muted">info</small>
      <button type="button" class="btn-close btn-close" data-bs-dismiss="toast" aria-label="Fermer"></button>
    </div>
    <div class="toast-body">—</div>
  </div>
</div>

<!-- BATCH MODALES (contenu inchangé — injecté par planning-batch-modals.js) -->
<!-- Les modales batch sont construites dynamiquement par planning-batch-modals.js -->
<!-- Les divs IDs suivants sont requis dans le DOM -->
<div class="modal fade" id="batchModalChirurgiens" tabindex="-1" aria-labelledby="batchLabelChir">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="batchLabelChir">
          <i class="bi bi-person-badge text-primary me-2"></i>
          Saisie rapide — Chirurgiens &mdash; <span id="batchChirJourLabel" class="fw-normal text-muted">Lundi</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <div class="d-flex align-items-center gap-2 mb-4">
          <label class="form-label fw-semibold mb-0">Jour :</label>
          <div class="btn-group btn-group-sm" id="batchChirJourSelector">
            <button class="btn btn-outline-secondary active" data-jour="LUNDI">Lundi</button>
            <button class="btn btn-outline-secondary" data-jour="MARDI">Mardi</button>
            <button class="btn btn-outline-secondary" data-jour="MERCREDI">Mercredi</button>
            <button class="btn btn-outline-secondary" data-jour="JEUDI">Jeudi</button>
            <button class="btn btn-outline-secondary" data-jour="VENDREDI">Vendredi</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table plan-batch-table align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th>Salle</th>
                <th class="text-center">Matin</th>
                <th class="text-center">Après-midi</th>
                <th class="text-center">Soir</th>
              </tr>
            </thead>
            <tbody id="batchTbodyChir"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" class="btn btn-primary" id="batchBtnSaveChir">
          <i class="bi bi-check-all me-1"></i>Terminer
        </button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="batchModalIDEs" tabindex="-1" aria-labelledby="batchLabelIDEs">
  <div class="modal-dialog modal-xl modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="batchLabelIDEs">
          <i class="bi bi-people text-success me-2"></i>
          Saisie rapide — IDEs &mdash; <span id="batchIDEJourLabel" class="fw-normal text-muted">Lundi</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <div class="d-flex align-items-center gap-2 mb-4">
          <label class="form-label fw-semibold mb-0">Jour :</label>
          <div class="btn-group btn-group-sm" id="batchIDEJourSelector">
            <button class="btn btn-outline-secondary active" data-jour="LUNDI">Lundi</button>
            <button class="btn btn-outline-secondary" data-jour="MARDI">Mardi</button>
            <button class="btn btn-outline-secondary" data-jour="MERCREDI">Mercredi</button>
            <button class="btn btn-outline-secondary" data-jour="JEUDI">Jeudi</button>
            <button class="btn btn-outline-secondary" data-jour="VENDREDI">Vendredi</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table plan-batch-table align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th>Salle</th>
                <th class="text-center">Matin — INSTRU</th>
                <th class="text-center">Matin — PANSEUR</th>
                <th class="text-center">Après-midi — INSTRU</th>
                <th class="text-center">Après-midi — PANSEUR</th>
                <th class="text-center">Soir — INSTRU</th>
                <th class="text-center">Soir — PANSEUR</th>
              </tr>
            </thead>
            <tbody id="batchTbodyIDEs"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" class="btn btn-primary" id="batchBtnSaveIDEs">
          <i class="bi bi-check-all me-1"></i>Terminer
        </button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="batchModalCouloir" tabindex="-1" aria-labelledby="batchLabelCouloir">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="batchLabelCouloir">
          <i class="bi bi-arrow-left-right text-info me-2"></i>
          Saisie rapide — Couloir
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body" id="batchBodyCouloir">
        <!-- Injecté par planning-batch-modals.js -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" class="btn btn-primary" id="batchBtnSaveCouloir">
          <i class="bi bi-check-all me-1"></i>Terminer
        </button>
      </div>
    </div>
  </div>
</div>

<!-- =====================================================
     CHAÎNE JS — ORDRE STRICT CDS
===================================================== -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="../../js/supabase-client.js"></script>
<script src="../../js/bdb-shell.js"></script>

<!-- CORE planning (pures, sans DOM) -->
<script src="planning-core.js"></script>
<script src="planning-schema.js"></script>

<!-- SERVICES (Supabase) -->
<script src="planning-engine.js"></script>
<script src="planning-import.js"></script>
<script src="planning-export.js"></script>
<script src="planning-analytics.js"></script>

<!-- UI -->
<script src="planning-matrix.js"></script>
<script src="planning-events.js"></script>
<script src="planning-modal.js"></script>
<script src="planning-availability.js"></script>
<script src="planning-import-ui.js"></script>
<script src="planning-slot-editor.js"></script>
<script src="planning-members.js"></script>
<script src="planning-batch-modals.js"></script>
<script src="planning-controller.js"></script>

</body>
</html>

'@
[System.IO.File]::WriteAllText("$DST\planning.html", $c_planning_html, [System.Text.Encoding]::UTF8)

# export.html
$c_export_html = @'
<!DOCTYPE html>
<html lang="fr" data-bs-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Planning — Export</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@a75daa03b876d052f834046ab3cff6e7583bee65/theme-base.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@a75daa03b876d052f834046ab3cff6e7583bee65/theme-print.css" rel="stylesheet" media="print"/>
  <link href="../../css/cds-overrides.css" rel="stylesheet"/>
  <link href="planning-ui.css" rel="stylesheet"/>
</head>

<body class="d-flex min-vh-100">

<main class="d-flex flex-column flex-grow-1 main-content">

  <!-- INTERDIT-E1 -->
  <div id="bdb-shell"
       data-module-title="Planning — Export"
       data-module-icon="bi-download"></div>

  <div class="container-xxl py-4 flex-grow-1">

    <div class="doc-header-primary p-4 rounded shadow-sm text-white mb-4">
      <h1 class="mb-2"><i class="bi bi-download me-2"></i>Export planning</h1>
      <p class="mb-0 opacity-75">Exporter une semaine (CSV / JSON) ou un pack complet</p>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <label class="form-label">Semaine</label>
        <input id="weekInput" type="number" class="form-control" value="16" min="1" max="53">
      </div>
      <div class="col-md-3">
        <label class="form-label">Année</label>
        <input id="yearInput" type="number" class="form-control" value="2026" min="2020" max="2100">
      </div>
      <div class="col-12 d-flex flex-wrap align-items-end gap-2">
        <button id="btnExportWeekCSV" class="btn btn-outline-secondary">
          <i class="bi bi-filetype-csv me-1"></i>Exporter semaine CSV
        </button>
        <button id="btnExportWeekJSON" class="btn btn-outline-secondary">
          <i class="bi bi-filetype-json me-1"></i>Exporter semaine JSON
        </button>
        <button id="btnExportAllPack" class="btn btn-primary">
          <i class="bi bi-box-arrow-down me-1"></i>Exporter pack complet
        </button>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header d-flex align-items-center justify-content-between">
        <span>Semaines en base</span>
        <button id="btnListKeys" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
        </button>
      </div>
      <div class="card-body">
        <pre id="diagOut" class="plan-diag-pre mb-0"></pre>
      </div>
    </div>

  </div>

  <footer class="mt-auto py-3 border-top text-center text-muted bg-white no-print">
    <small>&copy; 2026 BDB Planning</small>
  </footer>

</main>

<!-- TOAST -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="toastInfo" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <i class="bi bi-info-circle me-2"></i>
      <strong class="me-auto">Export</strong>
      <small class="text-muted">info</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fermer"></button>
    </div>
    <div class="toast-body">—</div>
  </div>
</div>

<!-- CHAÎNE JS — ORDRE STRICT CDS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="../../js/supabase-client.js"></script>
<script src="../../js/bdb-shell.js"></script>

<script src="planning-core.js"></script>
<script src="planning-schema.js"></script>
<script src="planning-engine.js"></script>
<script src="planning-export.js"></script>
<script src="export-controller.js"></script>

</body>
</html>

'@
[System.IO.File]::WriteAllText("$DST\export.html", $c_export_html, [System.Text.Encoding]::UTF8)

# --- Supprimer fichiers obsoletes ---
Remove-Item "$DST\services\cds-storage.js" -ErrorAction SilentlyContinue
Remove-Item "$DST\services\storage-key-service.js" -ErrorAction SilentlyContinue
Remove-Item "$DST\services\members-service.js" -ErrorAction SilentlyContinue
Remove-Item "$DST\core\planning-defaults.js" -ErrorAction SilentlyContinue
Remove-Item "$DST\ui\planning-crud.js" -ErrorAction SilentlyContinue
Remove-Item "$DST\test-antireg.html" -ErrorAction SilentlyContinue
Remove-Item "$DST\test-members.html" -ErrorAction SilentlyContinue
Remove-Item "$DST\planning-modal-lab.html" -ErrorAction SilentlyContinue

# --- Supprimer sous-dossiers vides ---
$items_core = Get-ChildItem "$DST\core" -ErrorAction SilentlyContinue
if ($null -eq $items_core) { Remove-Item "$DST\core" -Force -ErrorAction SilentlyContinue }
$items_services = Get-ChildItem "$DST\services" -ErrorAction SilentlyContinue
if ($null -eq $items_services) { Remove-Item "$DST\services" -Force -ErrorAction SilentlyContinue }
$items_ui = Get-ChildItem "$DST\ui" -ErrorAction SilentlyContinue
if ($null -eq $items_ui) { Remove-Item "$DST\ui" -Force -ErrorAction SilentlyContinue }

# --- Verification ---
Write-Host '=== JS racine module ==='
Get-ChildItem "$DST\*.js" | Select-Object Name | Format-Table -AutoSize
Write-Host '=== Sous-dossiers residuels ==='
Get-ChildItem "$DST" -Directory -ErrorAction SilentlyContinue | Select-Object Name
Write-Host '=== Chemins sous-dossiers dans HTML ==='
Select-String -Path "$DST\planning.html","$DST\export.html" -Pattern 'src="(core|services|ui)/' | Select-Object Line
Write-Host 'Session 31 -- deploiement OK'