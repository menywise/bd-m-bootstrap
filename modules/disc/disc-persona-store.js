/**
 * disc-persona-store.js — Personas pédagogiques fictifs (Supabase)
 * Dépend de : window.bdb (supabase-client.js)
 * IIFE → window.DiscPersonaStore
 *
 * Tables : disc_personas + disc_savoir_etre + disc_at_etats + disc_meta_programmes
 *
 * Pattern : loadAll() async au init → cache mémoire → get()/getAll() synchrones.
 * Convention : .select() sur tout write (D4). escHtml() côté appelant.
 */
window.DiscPersonaStore = (function () {
    'use strict';

    var _cache = {};   // { code → persona JS object }
    var _loaded = false;

    /* ────────── Helpers ────────── */

    /**
     * Reconstruit l'objet JS persona à partir des données Supabase
     * pour maintenir la compatibilité avec le code existant.
     * Shape : { _code, nom, prenom, fn, rolePedago, DISC, ennea,
     *           savoirEtre:[], AT:{base:[], stress:[], position},
     *           VAKOG:{primary, secondary}, meta:[], actif, sandbox }
     */
    function _buildPersona(row, seRows, atRows, metaRows) {
        var atBase = atRows
            .filter(function (r) { return r.contexte === 'base'; })
            .sort(function (a, b) { return a.position - b.position; })
            .map(function (r) { return r.etat; });
        var atStress = atRows
            .filter(function (r) { return r.contexte === 'stress'; })
            .sort(function (a, b) { return a.position - b.position; })
            .map(function (r) { return r.etat; });
        var savoirEtre = seRows
            .sort(function (a, b) { return a.position - b.position; })
            .map(function (r) { return r.label; });
        var meta = metaRows
            .sort(function (a, b) { return a.position - b.position; })
            .map(function (r) { return r.label; });

        return {
            _code:      row.code,
            nom:        row.nom,
            prenom:     row.prenom,
            fn:         row.fn,
            rolePedago: row.role_pedago || '',
            DISC:       row.disc_profil,
            ennea:      row.ennea || '',
            savoirEtre: savoirEtre,
            AT: {
                base:     atBase,
                stress:   atStress,
                position: row.position_vie || '+/+'
            },
            VAKOG: {
                primary:   row.vakog_primary || '',
                secondary: row.vakog_secondary || ''
            },
            meta:    meta,
            actif:   row.actif !== false,
            sandbox: true
        };
    }

    /* ────────── Chargement initial ────────── */

    /**
     * Charge toutes les personas + sous-tables depuis Supabase.
     * Appeler une seule fois au init (await DiscPersonaStore.loadAll()).
     * Après cet appel, getAll()/get() sont synchrones.
     */
    async function loadAll() {
        // Charger personas
        var pRes = await window.bdb.from('disc_personas').select('*');
        if (pRes.error) throw new Error('disc_personas SELECT : ' + pRes.error.message);
        var personas = pRes.data || [];

        if (!personas.length) {
            _cache = {};
            _loaded = true;
            return;
        }

        var codes = personas.map(function (p) { return p.code; });

        // Charger sous-tables en parallèle
        var seP   = window.bdb.from('disc_savoir_etre').select('*').in('persona_code', codes);
        var atP   = window.bdb.from('disc_at_etats').select('*').in('persona_code', codes);
        var metaP = window.bdb.from('disc_meta_programmes').select('*').in('persona_code', codes);

        var results = await Promise.all([seP, atP, metaP]);
        var seAll   = (results[0].data || []);
        var atAll   = (results[1].data || []);
        var metaAll = (results[2].data || []);

        // Grouper par persona_code
        var seByCode   = {};
        var atByCode   = {};
        var metaByCode = {};
        seAll.forEach(function (r) { (seByCode[r.persona_code] = seByCode[r.persona_code] || []).push(r); });
        atAll.forEach(function (r) { (atByCode[r.persona_code] = atByCode[r.persona_code] || []).push(r); });
        metaAll.forEach(function (r) { (metaByCode[r.persona_code] = metaByCode[r.persona_code] || []).push(r); });

        // Construire le cache
        var newCache = {};
        personas.forEach(function (row) {
            newCache[row.code] = _buildPersona(
                row,
                seByCode[row.code] || [],
                atByCode[row.code] || [],
                metaByCode[row.code] || []
            );
        });
        _cache = newCache;
        _loaded = true;
    }

    /* ────────── Lecture (synchrone — après loadAll) ────────── */

    function getAll() {
        return Object.values(_cache).filter(function (p) { return p.actif; });
    }

    function get(code) {
        return _cache[code] || null;
    }

    function exists(code) {
        return !!_cache[code];
    }

    function isLoaded() {
        return _loaded;
    }

    /* ────────── Écriture (async — admin only) ────────── */

    /**
     * Crée ou met à jour un persona + sous-tables.
     * @param {Object} p   Shape JS classique (même que le cache)
     */
    async function save(p) {
        if (!p || !p._code) return false;

        var row = {
            code:            p._code,
            nom:             p.nom,
            prenom:          p.prenom,
            fn:              p.fn,
            role_pedago:     p.rolePedago || '',
            disc_profil:     p.DISC,
            ennea:           p.ennea || '',
            position_vie:    (p.AT && p.AT.position) || '+/+',
            vakog_primary:   (p.VAKOG && p.VAKOG.primary) || null,
            vakog_secondary: (p.VAKOG && p.VAKOG.secondary) || null,
            actif:           p.actif !== false
        };

        // UPSERT persona principale
        var uRes = await window.bdb.from('disc_personas')
            .upsert(row, { onConflict: 'code' })
            .select();
        if (uRes.error) throw new Error('disc_personas UPSERT : ' + uRes.error.message);

        // Sous-tables : DELETE + INSERT (replace pattern)
        await _replaceSubTable('disc_savoir_etre', p._code,
            (p.savoirEtre || []).map(function (l, i) {
                return { persona_code: p._code, label: l, position: i };
            })
        );
        await _replaceSubTable('disc_at_etats', p._code,
            _buildAtRows(p._code, p.AT)
        );
        await _replaceSubTable('disc_meta_programmes', p._code,
            (p.meta || []).map(function (l, i) {
                return { persona_code: p._code, label: l, position: i };
            })
        );

        // Rafraîchir le cache
        await loadAll();
        return true;
    }

    /** Marque un persona comme inactif (soft delete). */
    async function remove(code) {
        if (!_cache[code]) return false;
        var res = await window.bdb.from('disc_personas')
            .update({ actif: false })
            .eq('code', code)
            .select();
        if (res.error) throw new Error('disc_personas UPDATE : ' + res.error.message);
        if (_cache[code]) _cache[code].actif = false;
        return true;
    }

    /** Supprime définitivement un persona + sous-tables (CASCADE). */
    async function hardDelete(code) {
        // UX06 : confirm() fait par le caller (modal btn-confirm-delete dans disc-controller)
        var res = await window.bdb.from('disc_personas')
            .delete()
            .eq('code', code)
            .select();
        if (res.error) throw new Error('disc_personas DELETE : ' + res.error.message);
        delete _cache[code];
        return true;
    }

    /* ────────── Helpers sous-tables ────────── */

    async function _replaceSubTable(table, personaCode, rows) {
        // UX06 : confirm() fait par le caller — delete interne a l'operation de sauvegarde
        var dRes = await window.bdb.from(table)
            .delete()
            .eq('persona_code', personaCode)
            .select();
        if (dRes.error) throw new Error(table + ' DELETE : ' + dRes.error.message);

        // INSERT nouveaux
        if (rows && rows.length) {
            var iRes = await window.bdb.from(table).insert(rows).select();
            if (iRes.error) throw new Error(table + ' INSERT : ' + iRes.error.message);
        }
    }

    function _buildAtRows(code, at) {
        if (!at) return [];
        var rows = [];
        var pos = 0;
        (at.base || []).forEach(function (e) {
            rows.push({ persona_code: code, etat: e, contexte: 'base', position: pos++ });
        });
        pos = 0;
        (at.stress || []).forEach(function (e) {
            rows.push({ persona_code: code, etat: e, contexte: 'stress', position: pos++ });
        });
        return rows;
    }

    /* ────────── API publique ────────── */

    return Object.freeze({
        loadAll:    loadAll,
        getAll:     getAll,
        get:        get,
        exists:     exists,
        isLoaded:   isLoaded,
        save:       save,
        remove:     remove,
        hardDelete: hardDelete
    });
}());
