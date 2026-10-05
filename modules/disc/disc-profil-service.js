/**
 * disc-profil-service.js — CRUD profils utilisateur + tests + distribution
 * Dépend de : window.bdb (supabase-client.js), window.bdbUser (bdb-shell.js)
 * IIFE → window.DiscProfilService
 *
 * Tables : disc_profils, disc_tests, disc_test_reponses, disc_conclusions,
 *          disc_conclusion_forces, disc_conclusion_vigilances
 * RPC    : disc_distribution()
 *
 * Convention : .select() sur tout write (D4). escHtml() côté appelant.
 */
window.DiscProfilService = (function () {
    'use strict';

    var _profil = null;   // cache profil courant
    var _distrib = null;  // cache distribution

    /* ────────── Helpers ────────── */

    function _uid() { return window.bdbUser && window.bdbUser.id; }

    function _mapVakog(letter) {
        var m = { V: 'visuel', A: 'auditif', K: 'kinesthésique', O: 'olfactif', G: 'gustatif' };
        return m[letter] || null;
    }

    /* ────────── Profil courant ────────── */

    /** Charge le profil DISC/VAKOG de l'utilisateur connecté. Cache en mémoire. */
    async function loadMyProfile() {
        var uid = _uid();
        if (!uid) { _profil = null; return null; }
        var res = await window.bdb.from('disc_profils')
            .select('*')
            .eq('user_id', uid)
            .maybeSingle();
        if (res.error) throw new Error('disc_profils SELECT : ' + res.error.message);
        _profil = res.data;
        return _profil;
    }

    /** Retourne le profil en cache (synchrone — appeler loadMyProfile d'abord). */
    function getMyProfile() { return _profil; }

    /* ────────── Enregistrer résultat test DISC ────────── */

    /**
     * @param {Object} scores  { D: n, I: n, S: n, C: n }
     * @param {Array}  answers [{ question_num, reponse }]
     */
    async function saveDiscResult(scores, answers) {
        var uid = _uid();
        if (!uid) throw new Error('Non connecté');

        var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
        var dominant = sorted[0];

        // 1. UPSERT disc_profils (scores DISC)
        var upsertData = {
            user_id: uid,
            disc_dominant: dominant,
            disc_score_d: scores.D || 0,
            disc_score_i: scores.I || 0,
            disc_score_s: scores.S || 0,
            disc_score_c: scores.C || 0
        };

        // Si profil existe, conserver les scores VAKOG
        if (_profil) {
            upsertData.vakog_primary = _profil.vakog_primary;
            upsertData.vakog_score_v = _profil.vakog_score_v;
            upsertData.vakog_score_a = _profil.vakog_score_a;
            upsertData.vakog_score_k = _profil.vakog_score_k;
            upsertData.vakog_score_o = _profil.vakog_score_o;
            upsertData.vakog_score_g = _profil.vakog_score_g;
        }

        var profRes = await window.bdb.from('disc_profils')
            .upsert(upsertData, { onConflict: 'user_id' })
            .select();
        if (profRes.error) throw new Error('disc_profils UPSERT : ' + profRes.error.message);
        _profil = profRes.data && profRes.data[0];

        // 2. INSERT disc_tests (historique)
        var testRes = await window.bdb.from('disc_tests')
            .insert({
                user_id: uid,
                test_type: 'disc',
                dominant: dominant,
                score_a: scores.D || 0,
                score_b: scores.I || 0,
                score_c: scores.S || 0,
                score_d: scores.C || 0,
                score_e: null
            })
            .select();
        if (testRes.error) throw new Error('disc_tests INSERT : ' + testRes.error.message);

        // 3. INSERT disc_test_reponses (si fournies)
        if (answers && answers.length && testRes.data && testRes.data[0]) {
            var testId = testRes.data[0].id;
            var rows = answers.map(function (a, i) {
                return { test_id: testId, question_num: a.question_num, reponse: a.reponse, position: i };
            });
            var repRes = await window.bdb.from('disc_test_reponses').insert(rows).select();
            if (repRes.error) throw new Error('disc_test_reponses INSERT : ' + repRes.error.message);
        }

        // Invalider cache distribution
        _distrib = null;

        return { dominant: dominant, scores: scores, profil: _profil };
    }

    /* ────────── Enregistrer résultat test VAKOG ────────── */

    /**
     * @param {Object} scores  { V: n, A: n, K: n, O: n, G: n }
     * @param {Array}  answers [{ question_num, reponse }]
     */
    async function saveVakogResult(scores, answers) {
        var uid = _uid();
        if (!uid) throw new Error('Non connecté');

        var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
        var primary = sorted[0];

        // 1. UPSERT disc_profils (scores VAKOG)
        var upsertData = {
            user_id: uid,
            vakog_primary: _mapVakog(primary),
            vakog_score_v: scores.V || 0,
            vakog_score_a: scores.A || 0,
            vakog_score_k: scores.K || 0,
            vakog_score_o: scores.O || 0,
            vakog_score_g: scores.G || 0
        };

        // Conserver les scores DISC si profil existe
        if (_profil) {
            upsertData.disc_dominant = _profil.disc_dominant;
            upsertData.disc_score_d = _profil.disc_score_d;
            upsertData.disc_score_i = _profil.disc_score_i;
            upsertData.disc_score_s = _profil.disc_score_s;
            upsertData.disc_score_c = _profil.disc_score_c;
        } else {
            // Premier test = VAKOG sans DISC → disc_dominant obligatoire
            // On met une valeur par défaut qui sera écrasée au prochain test DISC
            upsertData.disc_dominant = 'S';
            upsertData.disc_score_d = 0;
            upsertData.disc_score_i = 0;
            upsertData.disc_score_s = 0;
            upsertData.disc_score_c = 0;
        }

        var profRes = await window.bdb.from('disc_profils')
            .upsert(upsertData, { onConflict: 'user_id' })
            .select();
        if (profRes.error) throw new Error('disc_profils UPSERT : ' + profRes.error.message);
        _profil = profRes.data && profRes.data[0];

        // 2. INSERT disc_tests (historique)
        var testRes = await window.bdb.from('disc_tests')
            .insert({
                user_id: uid,
                test_type: 'vakog',
                dominant: _mapVakog(primary),
                score_a: scores.V || 0,
                score_b: scores.A || 0,
                score_c: scores.K || 0,
                score_d: scores.O || 0,
                score_e: scores.G || 0
            })
            .select();
        if (testRes.error) throw new Error('disc_tests INSERT : ' + testRes.error.message);

        // 3. INSERT disc_test_reponses
        if (answers && answers.length && testRes.data && testRes.data[0]) {
            var testId = testRes.data[0].id;
            var rows = answers.map(function (a, i) {
                return { test_id: testId, question_num: a.question_num, reponse: a.reponse, position: i };
            });
            var repRes = await window.bdb.from('disc_test_reponses').insert(rows).select();
            if (repRes.error) throw new Error('disc_test_reponses INSERT : ' + repRes.error.message);
        }

        _distrib = null;

        return { primary: primary, scores: scores, profil: _profil };
    }

    /* ────────── Historique tests ────────── */

    /** Retourne l'historique des tests de l'utilisateur courant. */
    async function getMyTestHistory() {
        var uid = _uid();
        if (!uid) return [];
        var res = await window.bdb.from('disc_tests')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });
        if (res.error) throw new Error('disc_tests SELECT : ' + res.error.message);
        return res.data || [];
    }

    /* ────────── Conclusion personnalisée ────────── */

    /** Charge la conclusion de l'utilisateur courant. */
    async function getMyConclusion() {
        var uid = _uid();
        if (!uid) return null;
        var res = await window.bdb.from('disc_conclusions')
            .select('*, disc_conclusion_forces(*), disc_conclusion_vigilances(*)')
            .eq('user_id', uid)
            .maybeSingle();
        if (res.error) throw new Error('disc_conclusions SELECT : ' + res.error.message);
        return res.data;
    }

    /** Sauvegarde la conclusion (UPSERT). */
    async function saveConclusion(data) {
        var uid = _uid();
        if (!uid) throw new Error('Non connecté');

        // UPSERT conclusion principale
        var concRes = await window.bdb.from('disc_conclusions')
            .upsert({
                user_id: uid,
                disc_dominant: data.disc_dominant,
                titre: data.titre,
                style_comm: data.style_comm || null,
                conseils: data.conseils || null
            }, { onConflict: 'user_id' })
            .select();
        if (concRes.error) throw new Error('disc_conclusions UPSERT : ' + concRes.error.message);
        var concId = concRes.data && concRes.data[0] && concRes.data[0].id;
        if (!concId) return null;

        // Remplacer forces : DELETE existantes + INSERT nouvelles
        // UX06 : confirm() fait par le caller — delete interne a l'operation de sauvegarde
        await window.bdb.from('disc_conclusion_forces').delete().eq('conclusion_id', concId).select();
        if (data.forces && data.forces.length) {
            var forceRows = data.forces.map(function (f, i) {
                return { conclusion_id: concId, label: f, position: i };
            });
            var fRes = await window.bdb.from('disc_conclusion_forces').insert(forceRows).select();
            if (fRes.error) throw new Error('disc_conclusion_forces INSERT : ' + fRes.error.message);
        }

        // Remplacer vigilances : DELETE existantes + INSERT nouvelles
        // UX06 : confirm() fait par le caller — delete interne a l'operation de sauvegarde
        await window.bdb.from('disc_conclusion_vigilances').delete().eq('conclusion_id', concId).select();
        if (data.vigilances && data.vigilances.length) {
            var vigRows = data.vigilances.map(function (v, i) {
                return { conclusion_id: concId, label: v, position: i };
            });
            var vRes = await window.bdb.from('disc_conclusion_vigilances').insert(vigRows).select();
            if (vRes.error) throw new Error('disc_conclusion_vigilances INSERT : ' + vRes.error.message);
        }

        return concRes.data[0];
    }

    /* ────────── Distribution agrégée (RPC) ────────── */

    /** Appelle disc_distribution() — retourne counts agrégés anonymisés. Cache en mémoire. */
    async function getDistribution() {
        if (_distrib) return _distrib;
        var res = await window.bdb.rpc('disc_distribution');
        if (res.error) throw new Error('disc_distribution RPC : ' + res.error.message);
        _distrib = res.data || [];
        return _distrib;
    }

    /** Invalide le cache distribution (après un test). */
    function invalidateDistribution() { _distrib = null; }

    /* ────────── Compatibilités ────────── */

    /** Charge les 16 paires de compatibilités DISC × DISC. */
    async function getCompatibilites() {
        var res = await window.bdb.from('disc_compatibilites')
            .select('*')
            .order('profil_a')
            .order('profil_b');
        if (res.error) throw new Error('disc_compatibilites SELECT : ' + res.error.message);
        return res.data || [];
    }

    /** Retourne la compatibilité pour une paire donnée. */
    async function getCompatibilite(a, b) {
        var res = await window.bdb.from('disc_compatibilites')
            .select('*')
            .eq('profil_a', a)
            .eq('profil_b', b)
            .maybeSingle();
        if (res.error) throw new Error('disc_compatibilites SELECT : ' + res.error.message);
        return res.data;
    }

    /* ────────── API publique ────────── */

    return Object.freeze({
        loadMyProfile:       loadMyProfile,
        getMyProfile:        getMyProfile,
        saveDiscResult:      saveDiscResult,
        saveVakogResult:     saveVakogResult,
        getMyTestHistory:    getMyTestHistory,
        getMyConclusion:     getMyConclusion,
        saveConclusion:      saveConclusion,
        getDistribution:     getDistribution,
        invalidateDistribution: invalidateDistribution,
        getCompatibilites:   getCompatibilites,
        getCompatibilite:    getCompatibilite
    });
}());
