// ── disc-persona-store.js — Dépend de disc-storage.js ─────────────────────
window.DiscPersonaStore = (function () {
    var INITIAL = {
        'ROHAUT_M':    { _code:'ROHAUT_M',    nom:'ROHAUT',     prenom:'Manuel',   fn:'infirmier',     rolePedago:'Infirmier tuteur',          DISC:'D', ennea:'8', savoirEtre:['assertivité','sens de la justice','protection des apprenants','franchise'], AT:{base:['Adulte','Parent nourricier'],stress:['Parent critique','Enfant rebelle'],position:'+/+'}, VAKOG:{primary:'visuel',secondary:'kinesthésique'}, meta:["vers l'objectif",'procédure','référence interne'], actif:true, sandbox:true },
        'SARTOUT_F':   { _code:'SARTOUT_F',   nom:'SARTOUT',    prenom:'Faustine', fn:'aide-soignant', rolePedago:"Aide-soignante · relais d'info", DISC:'I', ennea:'2', savoirEtre:['coopération','communication','empathie','entraide'], AT:{base:['Enfant libre','Parent nourricier'],stress:['Enfant rebelle','Parent normatif'],position:'+/+'}, VAKOG:{primary:'auditif',secondary:'kinesthésique'}, meta:['options','référence externe','global'], actif:true, sandbox:true },
        'HAMSA_O':     { _code:'HAMSA_O',     nom:'HAMSA',      prenom:'Olivia',   fn:'cadre',         rolePedago:'Cadre de service · médiatrice', DISC:'C', ennea:'1', savoirEtre:['rigueur','équité','discrétion','responsabilité','loyauté'], AT:{base:['Adulte','Parent normatif'],stress:['Parent critique','Adulte'],position:'+/+'}, VAKOG:{primary:'visuel',secondary:'auditif'}, meta:['procédure','référence interne','détail'], actif:true, sandbox:true },
        'MERIC_Q':     { _code:'MERIC_Q',     nom:'MERIC',      prenom:'Quentin',  fn:'infirmier',     rolePedago:'Infirmier · dynamique de jalousie', DISC:'D', ennea:'3', savoirEtre:['compétitivité','ambition','efficacité'], AT:{base:['Adulte','Enfant adapté'],stress:['Enfant rebelle','Parent critique'],position:'+/-'}, VAKOG:{primary:'visuel',secondary:'auditif'}, meta:["vers l'objectif",'options','référence externe'], actif:true, sandbox:true },
        'MARCHAND_C':  { _code:'MARCHAND_C',  nom:'MARCHAND',   prenom:'Carine',   fn:'infirmier',     rolePedago:'Infirmière · médiatrice potentielle', DISC:'S', ennea:'9', savoirEtre:['écoute','neutralité','diplomatie','stabilité'], AT:{base:['Adulte','Enfant adapté'],stress:['Enfant soumis','Adulte'],position:'+/+'}, VAKOG:{primary:'kinesthésique',secondary:'auditif'}, meta:["loin de l'erreur",'procédure','référence externe'], actif:true, sandbox:true },
        'DA_COSTA':    { _code:'DA_COSTA',    nom:'DA COSTA',   prenom:'Emma',     fn:'etudiant',      rolePedago:'Étudiante encadrée',          DISC:'S', ennea:'6', savoirEtre:['coopération','apprentissage','fiabilité','ponctualité'], AT:{base:['Enfant adapté','Adulte'],stress:['Enfant soumis','Enfant craintif'],position:'+/-'}, VAKOG:{primary:'kinesthésique',secondary:'auditif'}, meta:["loin de l'erreur",'référence externe','détail'], actif:true, sandbox:true },
        'THUILLIER_E': { _code:'THUILLIER_E', nom:'THUILLIER',  prenom:'Emma',     fn:'infirmier',     rolePedago:'Infirmière expérimentée',     DISC:'C', ennea:'5', savoirEtre:['précision','autonomie','discrétion','expertise technique'], AT:{base:['Adulte','Enfant adapté'],stress:['Adulte','Enfant soumis'],position:'+/+'}, VAKOG:{primary:'visuel',secondary:'auditif'}, meta:['détail','procédure','référence interne'], actif:true, sandbox:true }
    };

    // Init : charger depuis localStorage si disponible, sinon INITIAL
    var _store = (function () {
        var saved = (typeof DiscStorage !== 'undefined') ? DiscStorage.load() : null;
        return saved ? saved : JSON.parse(JSON.stringify(INITIAL));
    }());

    function _persist() {
        if (typeof DiscStorage !== 'undefined') DiscStorage.save(_store);
    }

    function getAll()  { return Object.values(_store).filter(function(p){ return p.actif; }); }
    function get(code) { return _store[code] || null; }
    function save(p) {
        if (!p._code) return false;
        _store[p._code] = Object.assign({}, p, { actif:true });
        _persist();
        return true;
    }
    function remove(code) {
        if (_store[code]) { _store[code].actif = false; _persist(); return true; }
        return false;
    }
    function exists(code) { return !!_store[code]; }
    function reset() {
        _store = JSON.parse(JSON.stringify(INITIAL));
        if (typeof DiscStorage !== 'undefined') DiscStorage.clear();
    }

    return Object.freeze({ getAll:getAll, get:get, save:save, remove:remove, exists:exists, reset:reset });
}());
