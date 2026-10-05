/**
 * disc-engine.js — Moteur d'export IA + tendances équipe
 * Dépend de : DiscPersonaStore, DiscScenarios, DiscSchema, DiscProfilService
 * IIFE → window.DiscEngine
 *
 * DISC-04 : export IA conservé + enrichi par tendances équipe (DISC-06).
 * DISC-06 : prompts auto-adaptatifs, intègrent les dominantes équipe.
 */
window.DiscEngine = (function () {
    'use strict';

    function getPersona(code) { return DiscPersonaStore.get(code); }
    function getAllPersonas()  { return DiscPersonaStore.getAll(); }
    function getScenario(id)  { return DiscScenarios.get(id); }
    function listScenarios()  { return DiscScenarios.list(); }

    /* ────────── Distribution équipe (cache via DiscProfilService) ────────── */

    var _distribCache = null;

    /**
     * Charge la distribution agrégée de l'équipe.
     * Retourne { disc: {D:n, I:n, S:n, C:n}, vakog: {visuel:n, auditif:n,...}, total: n, dominant: 'S' }
     */
    async function loadDistribution() {
        var raw = await DiscProfilService.getDistribution();
        var disc = { D: 0, I: 0, S: 0, C: 0 };
        var vakog = {};
        var total = 0;

        (raw || []).forEach(function (row) {
            if (row.disc_dominant && disc[row.disc_dominant] !== undefined) {
                disc[row.disc_dominant] += Number(row.total) || 0;
            }
            if (row.vakog_primary) {
                vakog[row.vakog_primary] = (vakog[row.vakog_primary] || 0) + (Number(row.vakog_total) || 0);
            }
            total += Number(row.total) || 0;
        });

        // Dominant DISC
        var discDom = Object.keys(disc).sort(function (a, b) { return disc[b] - disc[a]; })[0] || 'S';

        // Dominant VAKOG
        var vakogKeys = Object.keys(vakog);
        var vakogDom = vakogKeys.length
            ? vakogKeys.sort(function (a, b) { return vakog[b] - vakog[a]; })[0]
            : null;

        _distribCache = {
            disc: disc,
            vakog: vakog,
            total: total,
            dominant: discDom,
            vakogDominant: vakogDom
        };

        return _distribCache;
    }

    /** Retourne la distribution en cache (synchrone). */
    function getDistribution() { return _distribCache; }

    /* ────────── Export Prompt (enrichi tendances équipe) ────────── */

    function exportPrompt(codes, scenarioId) {
        var personas = codes.map(getPersona).filter(Boolean);
        var sc = scenarioId ? getScenario(scenarioId) : null;
        var L = ['# CONTEXTE PÉDAGOGIQUE — DISC_ENGINE v3.0\n# ⚠️ Données sandbox\n'];

        // Tendances équipe (si disponibles)
        if (_distribCache && _distribCache.total > 0) {
            L.push('## TENDANCES ÉQUIPE (agrégé anonyme — ' + _distribCache.total + ' membres)\n');
            L.push('Distribution DISC :');
            ['D', 'I', 'S', 'C'].forEach(function (k) {
                var pct = Math.round((_distribCache.disc[k] / _distribCache.total) * 100);
                var dt = DiscSchema.DISC_TYPES[k];
                L.push('  - ' + k + ' (' + dt.label + ') : ' + _distribCache.disc[k] + ' (' + pct + '%)');
            });
            L.push('Profil dominant équipe : ' + _distribCache.dominant + ' (' + DiscSchema.DISC_TYPES[_distribCache.dominant].label + ')');
            if (_distribCache.vakogDominant) {
                L.push('Canal VAKOG dominant : ' + _distribCache.vakogDominant);
            }
            L.push('');
            L.push('→ Adapter le ton pédagogique au profil dominant :');
            var tips = {
                D: 'aller droit au but, donner des résultats concrets, éviter les digressions.',
                I: 'favoriser les échanges, valoriser la participation, garder un ton dynamique.',
                S: 'rassurer, procéder par étapes, laisser le temps d\'assimiler.',
                C: 'fournir des données précises, justifier chaque point, être rigoureux.'
            };
            L.push('  ' + tips[_distribCache.dominant] + '\n');
        }

        L.push('## PERSONAS\n');
        personas.forEach(function (p) {
            L.push('### ' + p.prenom + ' ' + p.nom + ' — ' + p.rolePedago);
            L.push('- DISC : ' + p.DISC + ' (' + DiscSchema.DISC_TYPES[p.DISC].label + ')');
            L.push('- Ennéagramme : Type ' + p.ennea + ' — ' + DiscSchema.ENNEA[p.ennea]);
            L.push('- Savoir-être : ' + p.savoirEtre.join(', '));
            L.push('- AT base : ' + p.AT.base.join(', ') + ' / stress : ' + p.AT.stress.join(', '));
            L.push('- Position de vie : ' + p.AT.position);
            L.push('- VAKOG : ' + p.VAKOG.primary + ' (primaire), ' + p.VAKOG.secondary + ' (secondaire)');
            L.push('- Méta-programmes : ' + p.meta.join(', ') + '\n');
        });

        if (sc) {
            L.push('## SCÉNARIO : ' + sc.titre + ' (v' + sc.version + ')\n');
            L.push('**Contexte** : ' + sc.contexte + '\n');
            sc.scenes.forEach(function (s, i) {
                L.push('### Scène ' + (i + 1) + ' — ' + s.titre);
                L.push('**Objectif** : ' + s.objectif);
                L.push('**Points bascule** : ' + s.bascule.join(' | '));
                L.push('**Débriefing** : ' + s.debrief.join(' | ') + '\n');
            });
        }

        L.push('---\nTu es expert en simulation pédagogique soins infirmiers. Joue les scènes en respectant strictement les profils DISC, AT et VAKOG.');
        if (_distribCache && _distribCache.total > 0) {
            L.push('Adapte ton vocabulaire et ta pédagogie au profil dominant de l\'équipe (' + _distribCache.dominant + ').');
        }

        return L.join('\n');
    }

    /* ────────── Export JSON (enrichi tendances équipe) ────────── */

    function exportJSON(codes, scenarioId) {
        var personas = codes.map(getPersona).filter(Boolean);
        var sc = scenarioId ? getScenario(scenarioId) : null;
        var payload = {
            _meta: {
                module:  'DISC_ENGINE',
                version: '3.0',
                sandbox: true
            },
            personas: personas,
            scenario: sc
        };

        // Ajouter tendances si disponibles
        if (_distribCache && _distribCache.total > 0) {
            payload.equipe = {
                total:          _distribCache.total,
                disc:           _distribCache.disc,
                disc_dominant:  _distribCache.dominant,
                vakog:          _distribCache.vakog,
                vakog_dominant: _distribCache.vakogDominant
            };
        }

        return JSON.stringify(payload, null, 2);
    }

    /* ────────── API publique ────────── */

    return Object.freeze({
        getPersona:       getPersona,
        getAllPersonas:    getAllPersonas,
        getScenario:      getScenario,
        listScenarios:    listScenarios,
        loadDistribution: loadDistribution,
        getDistribution:  getDistribution,
        exportPrompt:     exportPrompt,
        exportJSON:       exportJSON
    });
}());
