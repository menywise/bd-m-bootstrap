// =====================================================
// PLANNING ANALYTICS V2.1.0
// Moteur descriptif d'analyse opératoire
// V2.1 : affectations exposées dans analyzeWeek + analyzeAll
// Dépendances : window.bdb (supabase-client.js)
// =====================================================

window.PlanningAnalytics = (() => {
  'use strict';

  function getDB() { return window.bdb; }

  // ------------------------------------------------------------------
  // UTILITAIRES PURS
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
  // ANALYSE D'UNE SEMAINE (logique pure)
  // ------------------------------------------------------------------

  function computeWeekStats(week) {
    const rows = week?.affectations || [];

    const visceral   = rows.filter(r => safeNum(r.visceral)  === 1 && r.ide);
    const couloir    = rows.filter(r => r.secteur === 'COULOIR' && r.ide);
    const ouvertures = rows.filter(r => safeNum(r.ouverture) === 1 && r.ide);
    const doublures  = rows.filter(r => safeNum(r.doublure)  === 1 && r.ide);

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
        visceral:   mapToArray(groupCount(visceral,   r => r.ide), ['ide']),
        couloir:    mapToArray(groupCount(couloir,    r => r.ide), ['ide']),
        ouvertures: mapToArray(groupCount(ouvertures, r => r.ide), ['ide'])
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
  // ANALYZE WEEK — charge depuis Supabase
  // V2.1 : expose affectations dans le résultat
  // ------------------------------------------------------------------

  async function analyzeWeek(semaine, annee) {
    const { data: semaineRow, error: errS } = await getDB()
      .from('planning_semaines')
      .select('*')
      .eq('annee', annee)
      .eq('semaine', semaine)
      .maybeSingle();

    if (errS) throw new Error('Erreur chargement semaine : ' + errS.message);
    if (!semaineRow) return null;

    const { data: rows, error: errA } = await getDB()
      .from('planning_affectations')
      .select('*')
      .eq('semaine_id', semaineRow.id)
      .limit(2000);

    if (errA) throw new Error('Erreur chargement affectations : ' + errA.message);

    const affectations = rows || [];
    const week = {
      meta: {
        semaine:  semaineRow.semaine,
        annee:    semaineRow.annee,
        statut:   semaineRow.statut,
        version:  'V2'
      },
      affectations
    };

    return {
      meta:         week.meta,
      stats:        computeWeekStats(week),
      situations:   detectSituations(week),
      affectations  // V2.1 — exposé pour dashboard et analytics
    };
  }

  // ------------------------------------------------------------------
  // ANALYZE ALL — charge toutes les semaines en 2 requêtes
  // V2.1 : expose affectations par semaine dans le résultat
  // ------------------------------------------------------------------

  async function analyzeAll() {
    const { data: semaines, error: errS } = await getDB()
      .from('planning_semaines')
      .select('*')
      .order('annee')
      .order('semaine')
      .limit(200);

    if (errS) throw new Error('Erreur liste semaines : ' + errS.message);
    if (!semaines?.length) return [];

    const semaineIds = semaines.map(s => s.id);

    // Charger toutes les affectations par pagination (Supabase = 1000 lignes max/requête)
    const PAGE = 1000;
    let allAff = [];
    let from   = 0;
    while (true) {
      const { data: chunk, error: errA } = await getDB()
        .from('planning_affectations')
        .select('*')
        .range(from, from + PAGE - 1);
      if (errA) throw new Error('Erreur chargement affectations : ' + errA.message);
      if (!chunk?.length) break;
      allAff = allAff.concat(chunk);
      if (chunk.length < PAGE) break;
      from += PAGE;
    }

    // Indexer par semaine_id
    const affByWeek = new Map();
    for (const a of (allAff || [])) {
      if (!affByWeek.has(a.semaine_id)) affByWeek.set(a.semaine_id, []);
      affByWeek.get(a.semaine_id).push(a);
    }

    const results = semaines.map(s => {
      const affectations = affByWeek.get(s.id) || [];
      const week = {
        meta: { semaine: s.semaine, annee: s.annee, statut: s.statut, version: 'V2' },
        affectations
      };
      return {
        key:          s.annee + '_' + String(s.semaine).padStart(2, '0') + '_planning_week',
        meta:         week.meta,
        stats:        computeWeekStats(week),
        situations:   detectSituations(week),
        affectations  // V2.1 — exposé pour analytics
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
