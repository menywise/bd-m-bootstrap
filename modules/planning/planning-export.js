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
