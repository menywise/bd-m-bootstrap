/**
 * disc-scenarios.js — Scénarios pédagogiques (Supabase)
 * Dépend de : window.bdb (supabase-client.js)
 * IIFE → window.DiscScenarios
 *
 * Tables : disc_scenarios + disc_scenario_personnages + disc_scenes
 *          + disc_scene_faits + disc_scene_savoir_etre + disc_scene_at
 *          + disc_scene_vakog + disc_scene_recadrages + disc_scene_bascules
 *          + disc_scene_debriefs
 *
 * Pattern : loadAll() async au init → cache mémoire → get()/list() synchrones.
 * Convention : .select() sur tout write (D4). escHtml() côté appelant.
 *
 * Shape JS préservée (compatibilité controller existant) :
 * { id, titre, version, contexte, personnages:['CODE',...],
 *   scenes:[{ id, titre, contexte, objectif, deroulé,
 *             bascule:[], debrief:[],
 *             grille:{ faits:[], se:[], at:{CODE:'état'}, vakog:['texte'], recadrage:['texte'] }
 *          }]
 * }
 */
window.DiscScenarios = (function () {
    'use strict';

    var _cache = {};   // { scenario.code → scenario JS object }
    var _loaded = false;

    /* ────────── Chargement initial ────────── */

    async function loadAll() {
        // 1. Scénarios
        var scRes = await window.bdb.from('disc_scenarios').select('*').order('created_at');
        if (scRes.error) throw new Error('disc_scenarios SELECT : ' + scRes.error.message);
        var scenarios = scRes.data || [];

        if (!scenarios.length) {
            _cache = {};
            _loaded = true;
            return;
        }

        var scIds = scenarios.map(function (s) { return s.id; });

        // 2. Personnages
        var persoRes = await window.bdb.from('disc_scenario_personnages')
            .select('*').in('scenario_id', scIds);

        // 3. Scènes
        var sceneRes = await window.bdb.from('disc_scenes')
            .select('*').in('scenario_id', scIds).order('position');

        var scenes = (sceneRes.data || []);
        var sceneIds = scenes.map(function (s) { return s.id; });

        // 4. Sous-tables scènes (parallèle)
        var subQueries = [];
        if (sceneIds.length) {
            subQueries = await Promise.all([
                window.bdb.from('disc_scene_faits').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_savoir_etre').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_at').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_vakog').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_recadrages').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_bascules').select('*').in('scene_id', sceneIds),
                window.bdb.from('disc_scene_debriefs').select('*').in('scene_id', sceneIds)
            ]);
        }

        var faitsAll      = subQueries.length ? (subQueries[0].data || []) : [];
        var seAll         = subQueries.length ? (subQueries[1].data || []) : [];
        var atAll         = subQueries.length ? (subQueries[2].data || []) : [];
        var vakogAll      = subQueries.length ? (subQueries[3].data || []) : [];
        var recadragesAll = subQueries.length ? (subQueries[4].data || []) : [];
        var basculesAll   = subQueries.length ? (subQueries[5].data || []) : [];
        var debriefsAll   = subQueries.length ? (subQueries[6].data || []) : [];

        // Grouper par scene_id
        var byScene = function (arr) {
            var m = {};
            arr.forEach(function (r) { (m[r.scene_id] = m[r.scene_id] || []).push(r); });
            return m;
        };
        var faitsByScene      = byScene(faitsAll);
        var seByScene         = byScene(seAll);
        var atByScene         = byScene(atAll);
        var vakogByScene      = byScene(vakogAll);
        var recadragesByScene = byScene(recadragesAll);
        var basculesByScene   = byScene(basculesAll);
        var debriefsByScene   = byScene(debriefsAll);

        // Grouper personnages par scenario_id
        var persoByScenario = {};
        (persoRes.data || []).forEach(function (r) {
            (persoByScenario[r.scenario_id] = persoByScenario[r.scenario_id] || []).push(r);
        });

        // Grouper scènes par scenario_id
        var scenesByScenario = {};
        scenes.forEach(function (r) {
            (scenesByScenario[r.scenario_id] = scenesByScenario[r.scenario_id] || []).push(r);
        });

        // Construire le cache
        var newCache = {};
        scenarios.forEach(function (sc) {
            var personnages = (persoByScenario[sc.id] || [])
                .sort(function (a, b) { return a.position - b.position; })
                .map(function (r) { return r.persona_code; });

            var sceneList = (scenesByScenario[sc.id] || [])
                .sort(function (a, b) { return a.position - b.position; })
                .map(function (scene) {
                    var sid = scene.id;

                    // Faits
                    var faits = (faitsByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) { return r.fait; });

                    // Savoir-être
                    var se = (seByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) { return r.label; });

                    // AT → objet { persona_code: etat_observe }
                    var at = {};
                    (atByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .forEach(function (r) { at[r.persona_code] = r.etat_observe; });

                    // VAKOG → texte libre
                    var vakog = (vakogByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) { return r.citation; });

                    // Recadrages → texte simple (distorsion)
                    var recadrage = (recadragesByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) {
                            return r.distorsion + (r.type_biais ? ' → ' + r.type_biais : '');
                        });

                    // Bascules
                    var bascule = (basculesByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) { return r.question; });

                    // Debriefs
                    var debrief = (debriefsByScene[sid] || [])
                        .sort(function (a, b) { return a.position - b.position; })
                        .map(function (r) { return r.question; });

                    return {
                        id:       scene.scene_code,
                        titre:    scene.titre,
                        contexte: scene.contexte || '',
                        objectif: scene.objectif || '',
                        deroulé:  scene.deroule || '',
                        bascule:  bascule,
                        debrief:  debrief,
                        grille: {
                            faits:     faits,
                            se:        se,
                            at:        at,
                            vakog:     vakog,
                            recadrage: recadrage
                        }
                    };
                });

            newCache[sc.code] = {
                id:           sc.code,
                _uuid:        sc.id,
                titre:        sc.titre,
                version:      sc.version || '1.0',
                contexte:     sc.contexte || '',
                personnages:  personnages,
                scenes:       sceneList,
                actif:        sc.actif !== false
            };
        });

        _cache = newCache;
        _loaded = true;
    }

    /* ────────── Lecture (synchrone — après loadAll) ────────── */

    function get(id) {
        return _cache[id] || null;
    }

    function list() {
        return Object.values(_cache).filter(function (sc) { return sc.actif; });
    }

    function isLoaded() {
        return _loaded;
    }

    /* ────────── API publique ────────── */

    return Object.freeze({
        loadAll:  loadAll,
        get:      get,
        list:     list,
        isLoaded: isLoaded
    });
}());
