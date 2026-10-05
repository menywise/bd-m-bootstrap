/* ================================================================
   REMPLA-MIDI-APP.JS — Des Blocs & Moi — V6
   CDS V5 | escHtml bdb-ui.js | INTERDIT-B2 : vues v_rempla_*
   Persistance : rempla_agents_config + rempla_incompat
   ================================================================ */

var DB = window.bdb;
var Engine = typeof RotationEngine !== 'undefined' ? RotationEngine : null;

/* Fallback helpers si bdb-ui.js absent (mode démo sans socle) */
if (typeof escHtml !== 'function') { window.escHtml = function (s) { if (s == null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }; }
if (typeof bdbToast !== 'function') { window.bdbToast = function (msg, type) { /* silent en démo */ }; }
if (typeof cdsShowGridError !== 'function') { window.cdsShowGridError = function (el, msg) { el.innerHTML = '<div class="text-center py-4"><p>' + escHtml(msg) + '</p></div>'; }; }

var state = {
  isAdmin: false, isCreator: false, isDemo: false,
  config: { dureePause: 30, creneauNominal: { debut: '12:00', fin: '13:00' }, creneauDegrade: { debut: '11:30', fin: '13:30' } },
  agents: [], chirurgiens: [], competences: {},
  incompatChir: [], incompatIde: [],
  effectifJour: { agents: [], salles: [] }
};

/* ── Données démo (fallback sans Supabase) ── */
var DEMO_AGENTS = [
  {id:'a1', nomCourt:'Marie',   nom:'Marie Lefèvre',  roleBloc:'instru',        categDefaut:'journee', prefRepas:'tot',         desactive:false},
  {id:'a2', nomCourt:'Julie',   nom:'Julie Bernard',   roleBloc:'instru',        categDefaut:'12h',     prefRepas:'indifferent', desactive:false},
  {id:'a3', nomCourt:'Isa',     nom:'Isabelle Petit',  roleBloc:'panseur_crise', categDefaut:'journee', prefRepas:'tard',        desactive:false},
  {id:'a4', nomCourt:'Thomas',  nom:'Thomas Roux',     roleBloc:'panseur',       categDefaut:'journee', prefRepas:'indifferent', desactive:false},
  {id:'a5', nomCourt:'Sabine',  nom:'Sabine Durand',   roleBloc:'instru',        categDefaut:'matin',   prefRepas:'indifferent', desactive:false},
  {id:'a6', nomCourt:'Hugo',    nom:'Hugo Mercier',    roleBloc:'panseur',       categDefaut:'journee', prefRepas:'indifferent', desactive:false},
  {id:'a7', nomCourt:'Léa',     nom:'Léa Dubois',      roleBloc:'panseur_crise', categDefaut:'12h',     prefRepas:'tot',         desactive:false},
  {id:'a8', nomCourt:'Antoine', nom:'Antoine Caron',   roleBloc:'instru',        categDefaut:'soir',    prefRepas:'indifferent', desactive:false},
  {id:'a9', nomCourt:'Nadia',   nom:'Nadia Berger',    roleBloc:'panseur',       categDefaut:'soir',    prefRepas:'indifferent', desactive:false},
  {id:'a10',nomCourt:'Camille', nom:'Camille Lacroix', roleBloc:'panseur_crise', categDefaut:'couloir', prefRepas:'indifferent', desactive:false},
  {id:'a11',nomCourt:'Yann',    nom:'Yann Fournier',   roleBloc:'instru',        categDefaut:'couloir', prefRepas:'indifferent', desactive:false},
  {id:'a12',nomCourt:'Eva',     nom:'Eva Marchand',    roleBloc:'panseur',       categDefaut:'12h',     prefRepas:'tard',        desactive:true}
];
var DEMO_CHIRURGIENS = [
  {id:'c1', nom:'Dr Dupont', refusePause:false},
  {id:'c2', nom:'Dr Martin', refusePause:true},
  {id:'c3', nom:'Pr Chenieux', refusePause:false},
  {id:'c4', nom:'Dr Vasseur', refusePause:false}
];
var DEMO_INCOMPAT_CHIR = [{chirId:'c2', agentId:'a3', avis:'non'}, {chirId:'c3', agentId:'a7', avis:'ok'}];
var DEMO_INCOMPAT_IDE = [{agentId:'a4', chirId:'c2', avis:'non'}];

var PRESETS = {
  confortable: {
    salles: [{id:'05',chir:'c1',instru:'a1',circu:'a4'},{id:'06',chir:'c2',instru:'a2',circu:'a6'},{id:'07',chir:'c3',instru:'a5',circu:'a7'},{id:'08',chir:'c4',instru:'a3',circu:'a12'}],
    horsSalle: [{id:'a8',cat:'soir'},{id:'a9',cat:'soir'},{id:'a10',cat:'couloir'},{id:'a11',cat:'couloir'}]
  },
  nominal: {
    salles: [{id:'05',chir:'c1',instru:'a1',circu:'a4'},{id:'06',chir:'c2',instru:'a2',circu:'a6'},{id:'07',chir:'c3',instru:'a5',circu:'a7'},{id:'08',chir:'c4',instru:'a3',circu:'a12'}],
    horsSalle: [{id:'a8',cat:'soir'},{id:'a9',cat:'soir'},{id:'a10',cat:'couloir'}]
  },
  tendu: {
    salles: [{id:'05',chir:'c1',instru:'a1',circu:'a4'},{id:'06',chir:'c2',instru:'a2',circu:'a6'},{id:'07',chir:'c3',instru:'a5',circu:'a7'},{id:'08',chir:'c4',instru:'a3',circu:'a12'}],
    horsSalle: [{id:'a10',cat:'couloir'}]
  },
  critique: {
    salles: [{id:'05',chir:'c1',instru:'a1',circu:'a4'},{id:'06',chir:'c2',instru:'a2',circu:'a6'},{id:'07',chir:'c3',instru:'a5',circu:'a7'},{id:'08',chir:'c4',instru:'a3',circu:'a12'}],
    horsSalle: [{id:'a8',cat:'soir'}]
  }
};

/* ── Doublons prénoms ── */
function resolveDoublons(agents) {
  var ct = {};
  agents.forEach(function (a) { ct[a.nomCourt] = (ct[a.nomCourt] || 0) + 1; });
  agents.forEach(function (a) {
    if (ct[a.nomCourt] > 1 && a.nom) {
      var parts = a.nom.split(' ');
      var ini = parts[parts.length - 1].charAt(0).toUpperCase();
      if (a.nomCourt.indexOf(ini + '.') === -1) a.nomCourt = a.nomCourt + ' ' + ini + '.';
    }
  });
}

function applyCompetences(a) {
  if (a.roleBloc === 'instru') state.competences[a.id] = { instru: 'quotidien', circu: 'quotidien' };
  else if (a.roleBloc === 'panseur_crise') state.competences[a.id] = { instru: 'crise', circu: 'quotidien' };
  else state.competences[a.id] = { instru: 'interdit', circu: 'quotidien' };
}

/* ================================================================
   CHARGEMENT — Supabase d'abord, démo en fallback
   ================================================================ */
function loadDemoData() {
  state.isDemo = true;
  state.agents = DEMO_AGENTS.map(function (a) { return { id:a.id, nom:a.nom, nomCourt:a.nomCourt, profil:'IDE', roleBloc:a.roleBloc, categDefaut:a.categDefaut, prefRepas:a.prefRepas, desactive:a.desactive }; });
  state.agents.forEach(applyCompetences);
  state.chirurgiens = DEMO_CHIRURGIENS.slice();
  state.incompatChir = DEMO_INCOMPAT_CHIR.map(function (ic, i) { return { id:'demo-ic-'+i, chirId:ic.chirId, agentId:ic.agentId, avis:ic.avis }; });
  state.incompatIde = DEMO_INCOMPAT_IDE.map(function (ic, i) { return { id:'demo-ii-'+i, agentId:ic.agentId, chirId:ic.chirId, avis:ic.avis }; });
}

async function loadReferentiels() {
  if (!DB) { loadDemoData(); return; }
  // Tenter Supabase
  try {
    var r1 = await DB.from('v_rempla_agents').select('user_id, nom, prenom, known_as');
    if (r1.error) throw new Error(r1.error.message);
    var r2 = await DB.from('rempla_agents_config').select('*');
    var cfgMap = {};
    if (!r2.error && r2.data) r2.data.forEach(function (c) { cfgMap[c.agent_id] = c; });

    state.agents = (r1.data || []).map(function (m) {
      var ka = (m.known_as || '').trim();
      var court = ka || (m.prenom || '').trim() || (m.nom || '').trim();
      var cfg = cfgMap[m.user_id];
      return {
        id: m.user_id, nom: m.prenom ? (m.prenom + ' ' + m.nom) : m.nom, nomCourt: court, profil: 'IDE',
        roleBloc: cfg ? cfg.role_bloc : 'panseur', categDefaut: cfg ? cfg.categ_defaut : 'journee',
        prefRepas: cfg ? cfg.pref_repas : 'indifferent', desactive: cfg ? cfg.desactive : false
      };
    });
    resolveDoublons(state.agents);
    state.agents.sort(function (a, b) { return a.nomCourt.localeCompare(b.nomCourt, 'fr'); });
    state.agents.forEach(applyCompetences);

    var r3 = await DB.from('v_rempla_chirurgiens').select('user_id, nom, prenom, known_as');
    if (r3.error) throw new Error(r3.error.message);
    state.chirurgiens = (r3.data || []).map(function (c) {
      var d = (c.known_as || '').trim() || c.nom;
      if (d.indexOf('Dr') !== 0 && d.indexOf('Pr') !== 0) d = 'Dr ' + d;
      return { id: c.user_id, nom: d, refusePause: false };
    });
    state.chirurgiens.sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); });

    var r4 = await DB.from('rempla_incompat').select('*');
    if (!r4.error && r4.data) {
      state.incompatChir = r4.data.filter(function (i) { return i.type === 'chir_ide'; }).map(function (i) { return { id: i.id, chirId: i.source_id, agentId: i.target_id, avis: i.avis }; });
      state.incompatIde = r4.data.filter(function (i) { return i.type === 'ide_chir'; }).map(function (i) { return { id: i.id, agentId: i.source_id, chirId: i.target_id, avis: i.avis }; });
    }
    state.isDemo = false;
  } catch (err) {
    // Fallback données démo
    loadDemoData();
    bdbToast('Mode demo — Supabase indisponible', 'warning');
  }
}

/* ── Charger un preset (scénario pré-défini) ── */
function loadPreset(key) {
  var p = PRESETS[key];
  if (!p) return;
  initEffectifJour();
  // Salles
  p.salles.forEach(function (s) {
    var sd = state.effectifJour.salles.find(function (x) { return x.id === s.id; });
    if (sd) sd.chirurgienId = s.chir;
    ['instru','circu'].forEach(function (poste) {
      var aid = s[poste]; if (!aid) return;
      var ag = state.agents.find(function (x) { return x.id === aid; }); if (!ag || ag.desactive) return;
      state.effectifJour.agents.push({
        id: ag.id, nom: ag.nomCourt, categorie: ag.categDefaut, salle: s.id, poste: poste,
        competences: state.competences[ag.id], preferenceCreneau: ag.prefRepas
      });
    });
  });
  // Hors salle
  p.horsSalle.forEach(function (h) {
    var ag = state.agents.find(function (x) { return x.id === h.id; }); if (!ag || ag.desactive) return;
    state.effectifJour.agents.push({
      id: ag.id, nom: ag.nomCourt, categorie: h.cat, catHoraire: h.cat, salle: null, poste: null,
      competences: state.competences[ag.id], preferenceCreneau: ag.prefRepas
    });
  });
  renderSalles(); renderGroupes(); renderHero(null);
}

/* ── Persistance (désactivée en mode démo) ── */
async function saveAgentConfig(a) {
  if (state.isDemo) return;
  var r = await DB.from('rempla_agents_config').upsert({ agent_id: a.id, role_bloc: a.roleBloc, categ_defaut: a.categDefaut, pref_repas: a.prefRepas, desactive: a.desactive, updated_at: new Date().toISOString() }, { onConflict: 'agent_id' });
  if (r.error) bdbToast('Erreur sauvegarde', 'danger');
}
async function saveIncompat(type, src, tgt, avis) {
  if (state.isDemo) { return { id: 'demo-' + Date.now() }; }
  var r = await DB.from('rempla_incompat').upsert({ type: type, source_id: src, target_id: tgt, avis: avis }, { onConflict: 'type,source_id,target_id' }).select();
  if (r.error) { bdbToast('Erreur affinite', 'danger'); return null; }
  return r.data ? r.data[0] : null;
}
async function deleteIncompat(id) {
  if (state.isDemo) return;
  await DB.from('rempla_incompat').delete().eq('id', id);
}

/* ── Init ── */
function initEffectifJour() {
  state.effectifJour = { agents: [], salles: [
    { id: '05', occupee: true, chirurgienId: null }, { id: '06', occupee: true, chirurgienId: null },
    { id: '07', occupee: true, chirurgienId: null }, { id: '08', occupee: true, chirurgienId: null }
  ]};
}

function purgerEffectif() {
  initEffectifJour();
  document.querySelectorAll('.rempla-preset').forEach(function (b) { b.classList.remove('active'); });
  document.getElementById('diagBanner').classList.add('d-none');
  document.getElementById('planEmpty').classList.remove('d-none');
  document.getElementById('planResult').classList.add('d-none');
  document.getElementById('timelineEmpty').classList.remove('d-none');
  document.getElementById('timelineContent').classList.add('d-none');
  var rp = document.getElementById('rulesPanel'); if (rp) rp.style.display = 'none';
  renderSalles(); renderGroupes(); renderHero(null);
  bdbToast('Effectif purge — nouvelle journee', 'info');
}

function fermerSalle(sid) {
  var sd = state.effectifJour.salles.find(function (s) { return s.id === sid; });
  if (sd) { sd.chirurgienId = null; sd.occupee = false; sd.programmeTermine = false; }
  state.effectifJour.agents = state.effectifJour.agents.filter(function (a) { return a.salle !== sid; });
  renderSalles(); renderGroupes(); renderHero(null);
}

/* ================================================================
   HERO
   ================================================================ */
function renderHero(diag) {
  document.getElementById('heroEffectif').textContent = state.effectifJour.agents.length || '—';
  var sallesOcc = state.effectifJour.salles.filter(function (s) {
    return s.occupee !== false && state.effectifJour.agents.some(function (a) { return a.salle === s.id && a.poste && a.poste !== 'doublure'; });
  });
  document.getElementById('heroSalles').textContent = sallesOcc.length;
  document.getElementById('heroFenetre').textContent = state.config.creneauNominal.debut + ' → ' + state.config.creneauNominal.fin;
  if (diag) {
    var lb = { confortable:'Confortable', quotidien:'Quotidien', degrade_leger:'Degrade leger', degrade_complet:'Degrade complet', crise:'Crise', bloque:'Bloque' };
    document.getElementById('heroEtat').textContent = lb[diag.etatPrevu] || diag.etatPrevu;
  }
}

/* ================================================================
   SALLES (exclusion croisée)
   ================================================================ */
function renderSalles() {
  var sids = ['05','06','07','08'], sel = {};
  var catOpts = '<option value="journee">J</option><option value="12h">12h</option><option value="matin">13h</option>';

  // 1. Lire depuis state.effectifJour (source de verite)
  sids.forEach(function (s) {
    sel[s] = { chir: null, instru: null, circu: null, instruCat: null, circuCat: null };
    var sd = state.effectifJour.salles.find(function (x) { return x.id === s; });
    if (sd && sd.chirurgienId) sel[s].chir = sd.chirurgienId;
    state.effectifJour.agents.forEach(function (a) {
      if (a.salle === s && a.poste === 'instru') { sel[s].instru = a.id; sel[s].instruCat = a.categorie; }
      if (a.salle === s && a.poste === 'circu') { sel[s].circu = a.id; sel[s].circuCat = a.categorie; }
    });
  });

  // Pas de lecture DOM : state.effectifJour EST la source de verite.
  // Le pont DOM → state est assure par buildEffectifAgents() (appele sur change).

  var actifs = state.agents.filter(function (a) { return !a.desactive; });
  sids.forEach(function (sid) {
    var sd = state.effectifJour.salles.find(function (s) { return s.id === sid; });
    var my = sel[sid], uc=new Set(), ua=new Set();
    sids.forEach(function (o) { if(o===sid)return; if(sel[o].chir)uc.add(sel[o].chir); if(sel[o].instru)ua.add(sel[o].instru); if(sel[o].circu)ua.add(sel[o].circu); });
    var oC=state.chirurgiens.filter(function(c){return c.id===my.chir||!uc.has(c.id);}).map(function(c){return '<option value="'+escHtml(c.id)+'"'+(my.chir===c.id?' selected':'')+'>'+escHtml(c.nom)+'</option>';}).join('');
    var oI=actifs.filter(function(p){var c=state.competences[p.id];if(!c||c.instru==='interdit')return false;return p.id===my.instru||(!ua.has(p.id)&&p.id!==my.circu);}).map(function(p){return '<option value="'+escHtml(p.id)+'"'+(my.instru===p.id?' selected':'')+'>'+escHtml(p.nomCourt)+'</option>';}).join('');
    var oX=actifs.filter(function(p){var c=state.competences[p.id];if(!c||c.circu==='interdit')return false;return p.id===my.circu||(!ua.has(p.id)&&p.id!==my.instru);}).map(function(p){return '<option value="'+escHtml(p.id)+'"'+(my.circu===p.id?' selected':'')+'>'+escHtml(p.nomCourt)+'</option>';}).join('');
    if (sd) sd.chirurgienId = my.chir;
    // Categorie : state > DOM > defaut
    function agCat(aid, poste) {
      if (!aid) return 'journee';
      var myC = my[poste+'Cat'];
      if (myC) return myC;
      var ex = state.effectifJour.agents.find(function(a){return a.id===aid;});
      if (ex) return ex.categorie;
      var p = state.agents.find(function(a){return a.id===aid;});
      return p ? p.categDefaut : 'journee';
    }
    var iCat = agCat(my.instru, 'instru');
    var cCat = agCat(my.circu, 'circu');
    function catSel(poste, curCat) {
      return '<select class="rempla-cat-sel" data-action="set-agentcat" data-salle="'+sid+'" data-poste="'+poste+'">'+
        catOpts.replace('value="'+curCat+'"', 'value="'+curCat+'" selected') + '</select>';
    }
    var progTerm = sd && sd.programmeTermine;
    var salleFermee = sd && sd.occupee === false;
    var salleVide = !my.instru && !my.circu && !my.chir;
    document.getElementById('salle'+sid+'Card').innerHTML =
      '<div class="rempla-card rempla-salle-card'+(progTerm?' rempla-salle-termine':'')+(salleFermee?' rempla-salle-fermee':'')+'"><div class="card-header py-1 d-flex align-items-center gap-1"><i class="bi bi-door-'+(salleFermee?'closed':'open')+'"></i><span class="fw-semibold small">Salle '+escHtml(sid)+'</span>'+(salleFermee?'<span class="rempla-salle-fermee-badge">Fermee</span>':'')+'<span class="flex-grow-1"></span>'+(salleFermee?'<button class="btn btn-link btn-sm text-success p-0" data-action="open-salle" data-salle="'+sid+'" title="Rouvrir"><i class="bi bi-arrow-counterclockwise"></i></button>':'<label class="rempla-prog-term"><input type="checkbox" class="form-check-input" data-action="set-prog-term" data-salle="'+sid+'"'+(progTerm?' checked':'')+'/><span>Termine</span></label><button class="btn btn-link btn-sm text-danger p-0 ms-1" data-action="close-salle" data-salle="'+sid+'" title="Fermer cette salle"><i class="bi bi-x-lg"></i></button>')+'</div>'+
      (salleFermee ? '' :
      '<div class="card-body py-1">'+
        '<select class="form-select form-select-sm mb-1" data-action="set-chirurgien" data-salle="'+sid+'"><option value="">Chirurgien…</option>'+oC+'</select>'+
        '<div class="rempla-slot-row"><div class="rempla-slot-label">Instru</div><select class="form-select form-select-sm" data-action="set-agent" data-salle="'+sid+'" data-poste="instru"><option value="">—</option>'+oI+'</select>'+catSel('instru',iCat)+'</div>'+
        '<div class="rempla-slot-row"><div class="rempla-slot-label">Circu</div><select class="form-select form-select-sm" data-action="set-agent" data-salle="'+sid+'" data-poste="circu"><option value="">—</option>'+oX+'</select>'+catSel('circu',cCat)+'</div>'+
      '</div>') + '</div>';
  });
}

/* ================================================================
   GROUPES HORS SALLE
   ================================================================ */
function renderGroupes() {
  var hs = state.effectifJour.agents.filter(function (a) { return !a.salle || a.poste === 'doublure'; });
  var affIds = new Set(state.effectifJour.agents.map(function (a) { return a.id; }));
  var dispo = state.agents.filter(function (p) { return !affIds.has(p.id) && !p.desactive; });
  _grpToggle('groupCouloir', 'Couloir', 'bi-signpost-split', 'rempla-gc-couloir', hs.filter(function(a){return a.categorie==='couloir'||a.catHoraire==='couloir';}), dispo, 'couloir');
  _grp('groupSoir', 'Soir (deja mange)', 'bi-moon', 'rempla-gc-soir', hs.filter(function(a){return a.categorie==='soir';}), dispo, 'soir');
  _grpDoublure('groupDoublure', hs.filter(function(a){return a.poste==='doublure';}), dispo);
  _grpRenforts('groupRenforts', hs.filter(function(a){return a.isRenfort;}));
}

// Groupe avec toggle 13h par agent (couloir)
function _grpToggle(cId, titre, icon, gcCls, agents, dispo, defCat) {
  var opts = dispo.map(function(p){return '<option value="'+escHtml(p.id)+'" data-cd="'+escHtml(p.categDefaut)+'">'+escHtml(p.nomCourt)+'</option>';}).join('');
  var h = '<div class="rempla-card rempla-group-card '+gcCls+'"><div class="card-header py-1 d-flex align-items-center gap-1"><i class="bi '+icon+'"></i><span class="fw-semibold small">'+escHtml(titre)+'</span><span class="rempla-group-count">'+agents.length+'</span></div><div class="card-body p-2">';
  if (agents.length > 0) {
    h += '<div class="d-flex flex-wrap gap-1 mb-2">';
    agents.forEach(function (a) {
      var is13 = a.categorie === 'matin';
      h += '<span class="rempla-agent-badge rempla-cat-'+escHtml(a.categorie)+'"><i class="bi bi-person-fill"></i>'+escHtml(a.nom);
      h += '<label class="rempla-toggle-13h ms-1" title="Marquer 13h"><input type="checkbox" data-action="toggle-13h" data-id="'+escHtml(a.id)+'"'+(is13?' checked':'')+'/><small>13h</small></label>';
      h += '<button class="btn btn-sm btn-link text-danger p-0 ms-1" data-action="remove-hs" data-id="'+escHtml(a.id)+'"><i class="bi bi-x"></i></button></span>';
    });
    h += '</div>';
  }
  h += '<div class="d-flex gap-1 align-items-end flex-wrap mt-1"><select class="form-select form-select-sm rempla-sel-sm" data-action="sel-add-hs" data-cat="'+escHtml(defCat)+'"><option value="">+ Ajouter…</option>'+opts+'</select>';
  h += '<button class="btn btn-module-outline btn-sm" data-action="add-hs" data-cat="'+escHtml(defCat)+'"><i class="bi bi-plus-lg"></i></button></div></div></div>';
  document.getElementById(cId).innerHTML = h;
}

// Groupe renforts extérieurs (viscéral, intérimaire)
function _grpRenforts(cId, agents) {
  var types = ['visceral', 'interimaire'];
  var typeOpts = types.map(function(t){return '<option value="'+t+'">'+t+'</option>';}).join('');
  var h = '<div class="rempla-card rempla-group-card rempla-gc-renforts"><div class="card-header py-1 d-flex align-items-center gap-1"><i class="bi bi-person-add"></i><span class="fw-semibold small">Renforts exterieurs</span><span class="rempla-group-count">'+agents.length+'</span></div><div class="card-body p-2">';
  if (agents.length > 0) {
    h += '<div class="d-flex flex-wrap gap-1 mb-2">';
    agents.forEach(function (a) {
      var is13 = a.categorie === 'matin';
      h += '<span class="rempla-agent-badge rempla-cat-renfort"><i class="bi bi-person-add"></i>'+escHtml(a.nom);
      h += '<label class="rempla-toggle-13h ms-1"><input type="checkbox" data-action="toggle-13h" data-id="'+escHtml(a.id)+'"'+(is13?' checked':'')+'/><small>13h</small></label>';
      h += '<button class="btn btn-sm btn-link text-danger p-0 ms-1" data-action="remove-hs" data-id="'+escHtml(a.id)+'"><i class="bi bi-x"></i></button></span>';
    });
    h += '</div>';
  }
  h += '<div class="d-flex gap-1 align-items-end flex-wrap mt-1">';
  h += '<select class="form-select form-select-sm rempla-sel-sm" data-ref="renfort-type">'+typeOpts+'</select>';
  h += '<button class="btn btn-module-outline btn-sm" data-action="add-renfort"><i class="bi bi-plus-lg"></i></button>';
  h += '</div></div></div>';
  document.getElementById(cId).innerHTML = h;
}

function _grp(cId, titre, icon, gcCls, agents, dispo, defCat) {
  var showCat = defCat !== 'couloir' && defCat !== 'soir';
  var cats = ['journee','12h','matin'].map(function(c){return '<option value="'+c+'"'+(c===defCat?' selected':'')+'>'+c+'</option>';}).join('');
  var opts = dispo.map(function(p){return '<option value="'+escHtml(p.id)+'" data-cd="'+escHtml(p.categDefaut)+'">'+escHtml(p.nomCourt)+'</option>';}).join('');
  var h = '<div class="rempla-card rempla-group-card '+gcCls+'"><div class="card-header py-1 d-flex align-items-center gap-1"><i class="bi '+icon+'"></i><span class="fw-semibold small">'+escHtml(titre)+'</span><span class="rempla-group-count">'+agents.length+'</span></div><div class="card-body p-2">';
  if (agents.length > 0) {
    h += '<div class="d-flex flex-wrap gap-1 mb-2">';
    agents.forEach(function (a) { h += '<span class="rempla-agent-badge rempla-cat-'+escHtml(a.categorie)+'"><i class="bi bi-person-fill"></i>'+escHtml(a.nom)+'<button class="btn btn-sm btn-link text-danger p-0 ms-1" data-action="remove-hs" data-id="'+escHtml(a.id)+'"><i class="bi bi-x"></i></button></span>'; });
    h += '</div>';
  }
  h += '<div class="d-flex gap-1 align-items-end flex-wrap mt-1"><select class="form-select form-select-sm rempla-sel-sm" data-action="sel-add-hs" data-cat="'+escHtml(defCat)+'"><option value="">+ Ajouter…</option>'+opts+'</select>';
  if (showCat) h += '<select class="form-select form-select-sm rempla-sel-xs" data-ref="cat-'+escHtml(defCat)+'">'+cats+'</select>';
  h += '<button class="btn btn-module-outline btn-sm" data-action="add-hs" data-cat="'+escHtml(defCat)+'"><i class="bi bi-plus-lg"></i></button></div></div></div>';
  document.getElementById(cId).innerHTML = h;
}

function _grpDoublure(cId, agents, dispo) {
  var salleOpts = ['05','06','07','08'].map(function(s){return '<option value="'+s+'">S'+s+'</option>';}).join('');
  var agOpts = dispo.map(function(p){return '<option value="'+escHtml(p.id)+'">'+escHtml(p.nomCourt)+'</option>';}).join('');
  var h = '<div class="rempla-card rempla-group-card rempla-gc-doublure"><div class="card-header py-1 d-flex align-items-center gap-1"><i class="bi bi-person-plus"></i><span class="fw-semibold small">Doublures</span><span class="rempla-group-count">'+agents.length+'</span></div><div class="card-body p-2">';
  if (agents.length > 0) {
    h += '<div class="d-flex flex-wrap gap-1 mb-2">';
    agents.forEach(function (a) {
      var is13 = a.categorie === 'matin';
      h += '<span class="rempla-agent-badge rempla-cat-doublure"><i class="bi bi-person-plus-fill"></i>'+escHtml(a.nom)+' <small class="text-muted">S'+escHtml(a.salle||'?')+'</small>';
      h += '<label class="rempla-toggle-13h ms-1"><input type="checkbox" data-action="toggle-13h" data-id="'+escHtml(a.id)+'"'+(is13?' checked':'')+'/><small>13h</small></label>';
      h += '<button class="btn btn-sm btn-link text-danger p-0 ms-1" data-action="remove-hs" data-id="'+escHtml(a.id)+'"><i class="bi bi-x"></i></button></span>';
    });
    h += '</div>';
  }
  h += '<div class="d-flex gap-1 align-items-end flex-wrap mt-1">';
  h += '<select class="form-select form-select-sm rempla-sel-sm" data-action="sel-add-doublure"><option value="">+ Agent…</option>'+agOpts+'</select>';
  h += '<select class="form-select form-select-sm rempla-sel-xs" data-ref="doublure-salle">'+salleOpts+'</select>';
  h += '<button class="btn btn-module-outline btn-sm" data-action="add-doublure"><i class="bi bi-plus-lg"></i></button>';
  h += '</div></div></div>';
  document.getElementById(cId).innerHTML = h;
}

/* Badge 13h pour les agents matin */
function badge13h(agentId) {
  var a = state.effectifJour.agents.find(function(x){return x.id===agentId;});
  return (a && a.categorie === 'matin') ? '<span class="rempla-badge-13h">13h</span>' : '';
}

function renderDiagnostic(diag) {
  var b=document.getElementById('diagBanner'); b.classList.remove('d-none');
  b.className='rempla-diag rempla-diag-'+diag.etatPrevu+' rempla-animated';
  var ic={confortable:'check-circle-fill',quotidien:'info-circle-fill',degrade_leger:'exclamation-triangle-fill',degrade_complet:'exclamation-triangle-fill',crise:'x-octagon-fill',bloque:'slash-circle-fill'};
  document.getElementById('diagIcon').className='bi bi-'+(ic[diag.etatPrevu]||'question-circle')+' diag-ic';
  document.getElementById('diagLabel').textContent={confortable:'Confortable',quotidien:'Quotidien',degrade_leger:'Degrade leger',degrade_complet:'Degrade complet',crise:'Crise',bloque:'Bloque'}[diag.etatPrevu]||diag.etatPrevu;
  document.getElementById('diagDetail').textContent=diag.nbAgentsANourrir+' a nourrir · '+diag.nbRemplacants12h+' remplacants · '+diag.nbCouloirs+' couloir(s) · '+diag.nbSoir+' soir'+(diag.nbDoublures>0?' · '+diag.nbDoublures+' doublure(s)':'');
  renderHero(diag);
}

function renderPlan(plan) {
  document.getElementById('planEmpty').classList.add('d-none');
  document.getElementById('planResult').classList.remove('d-none');
  var lb={quotidien:'Quotidien',degrade_leger:'Degrade leger',degrade_complet:'Degrade complet',crise:'Crise',bloque:'Bloque'};
  document.getElementById('planKpis').innerHTML =
    '<div class="rempla-kpi"><div class="rempla-kpi-label">Etat</div><div class="rempla-kpi-value">'+escHtml(lb[plan.etatResultant]||plan.etatResultant)+'</div></div>'+
    '<div class="rempla-kpi"><div class="rempla-kpi-label">Mouvements</div><div class="rempla-kpi-value">'+plan.mouvements.length+'</div></div>'+
    '<div class="rempla-kpi"><div class="rempla-kpi-label">Fenetre</div><div class="rempla-kpi-value">'+escHtml(plan.fenetreDebut)+' → '+escHtml(plan.fenetreFin)+'</div></div>'+
    (plan.nbAffectationsCrise>0?'<div class="rempla-kpi"><div class="rempla-kpi-label">Crises</div><div class="rempla-kpi-value">'+plan.nbAffectationsCrise+'</div></div>':'');
  document.getElementById('planBody').innerHTML=plan.mouvements.length===0?'<tr><td colspan="7" class="text-center py-3 rempla-muted">Aucun mouvement</td></tr>':
    plan.mouvements.map(function(m,i){var libre=m.niveau==='libre';return '<tr'+(libre?' class="rempla-row-libre"':'')+'><td>'+(i+1)+'</td><td class="rempla-creneau-cell">'+escHtml(m.creneauDebut)+' → '+escHtml(m.creneauFin)+'</td><td>'+escHtml(m.agentPauseNom)+badge13h(m.agentPauseId)+'</td><td>'+(libre?'—':'S'+escHtml(m.salle))+'</td><td>'+(libre?'<span class="rempla-muted">libre</span>':escHtml(m.poste))+'</td><td>'+(libre?'<span class="rempla-muted">aucun</span>':escHtml(m.remplacantNom)+badge13h(m.remplacantId))+'</td><td><span class="rempla-niv-'+escHtml(m.niveau)+'">'+escHtml(m.niveau)+'</span></td></tr>';}).join('');
  document.getElementById('planAlertes').innerHTML=plan.alertes.length===0?'<div class="rempla-alert lvl-info"><i class="bi bi-check-circle-fill"></i>Aucune alerte — plan conforme.</div>':
    plan.alertes.map(function(a){var lvl=(a.severite==='bloquant')?'bloquant':(a.severite==='crise')?'crise':(a.severite==='warning')?'warning':'info';var ic=lvl==='bloquant'?'slash-circle-fill':lvl==='crise'?'x-octagon-fill':lvl==='warning'?'exclamation-triangle-fill':'info-circle-fill';return '<div class="rempla-alert lvl-'+lvl+'"><i class="bi bi-'+ic+'"></i>'+escHtml(a.message)+'</div>';}).join('');
  // Afficher les regles
  renderRulesCompliance(plan);
}

/* ================================================================
   REGLES COMPLIANCE — suivi visuel R01-R26
   ================================================================ */
function renderRulesCompliance(plan) {
  var panel = document.getElementById('rulesPanel');
  var grid = document.getElementById('rulesGrid');
  if (!panel || !grid) return;
  panel.style.display = '';

  var ag = state.effectifJour.agents;
  var mvts = plan.mouvements || [];
  var pauseIds = new Set(); mvts.forEach(function(m){pauseIds.add(m.agentPauseId);});
  var nonNourris = plan.agentsNonNourris || [];
  var hasCrise = mvts.some(function(m){return m.niveau==='crise';});
  var hasDoublMob = plan.alertes.some(function(a){return a.type==='doublure_mobilisee';});
  var diag = plan.diagnostic || {};
  var etat = plan.etatResultant || diag.etatPrevu || '';
  var isConf = etat === 'confortable' || etat === 'quotidien';

  // Evaluation
  var rules = [
    {id:'R01', ok: !ag.some(function(a){return a.categorie==='matin'&&pauseIds.has(a.id);})},
    {id:'R02', ok: !ag.some(function(a){return a.categorie==='soir'&&pauseIds.has(a.id);})},
    {id:'R03', ok: nonNourris.length===0},
    {id:'R04', ok: true}, // couloir mange selon catHoraire — verifie par R03
    {id:'R05', ok: !ag.some(function(a){return a.poste==='doublure'&&a.categorie==='matin'&&pauseIds.has(a.id);})},
    {id:'R06', ok: true}, // soir/couloir comme remplacants — structural
    {id:'R07', ok: true}, // 12h recirculation — structural
    {id:'R08', ok: true}, // journee recirculation — structural
    {id:'R09', ok: !isConf || !hasDoublMob, warn: hasDoublMob},
    {id:'R10', ok: !isConf || !hasDoublMob},
    {id:'R11', ok: nonNourris.length===0 && !plan.alertes.some(function(a){return a.type==='poste_vacant';})},
    {id:'R12', ok: !plan.alertes.some(function(a){return a.type==='chirurgien_refuse_pause'&&a.severite==='bloquant';})},
    {id:'R13', ok: true}, // circu par non-interdit — structural
    {id:'R14', ok: !mvts.some(function(m){if(!m.remplacantId)return false;var c=state.competences[m.remplacantId];return c&&c[m.poste]==='interdit';})},
    {id:'R15', ok: state.config.dureePause===30},
    {id:'R16', ok: true}, // nominale configurable — structural
    {id:'R17', ok: true}, // degradation progressive — structural
    {id:'R18', ok: true},
    {id:'R19', ok: !ag.some(function(a){if(a.categorie!=='12h'||a.preferenceCreneau==='tot')return false;var m=mvts.find(function(x){return x.agentPauseId===a.id;});return m&&m.creneauDebut===state.config.creneauNominal.debut;})},
    {id:'R20', ok: true}, // preferences — best effort
    {id:'R21', ok: !hasCrise || diag.nbRemplacants12h===0},
    {id:'R22', ok: true}, // informational
    {id:'R23', ok: true}, // chirurgien config — structural
    {id:'R24', ok: true}, // alerte si refus — structural
    {id:'R25', ok: true}, // pause = dernier recours — structural
    {id:'R26', na: true}  // futur
  ];

  grid.innerHTML = rules.map(function(r){
    var cls = r.na ? 'rempla-rule-na' : (r.ok ? 'rempla-rule-ok' : (r.warn ? 'rempla-rule-warn' : 'rempla-rule-fail'));
    return '<span class="rempla-rule-dot '+cls+'" title="'+escHtml(r.id)+'">'+escHtml(r.id.replace('R',''))+'</span>';
  }).join('');
}

/* Bug 1 fix : la vue agent montre TOUS les agents de l'effectif, pas seulement
   ceux qui apparaissent dans plan.mouvements. Pour chaque creneau de la fenetre
   degradee max (11:30-13:30), on derive la position de chaque agent :
     - 'salle'    : tient son poste (titulaire en place)
     - 'rempl'    : remplace un titulaire dans une salle
     - 'pause'    : en pause repas (libre ou couvert par un remplacant)
     - 'couloir'  : au couloir (1er creneau pour couloirs mangeants, ou en attente)
     - 'doublure' : en doublure dans une salle
     - 'absent'   : pas encore arrive (soir avant 12:00)
     - 'parti'    : matin/13h apres 13:00
     - 'idle'     : aucune affectation visible */
function renderTimeline(plan) {
  if (!plan) {
    document.getElementById('timelineEmpty').classList.remove('d-none');
    document.getElementById('timelineContent').classList.add('d-none');
    return;
  }
  document.getElementById('timelineEmpty').classList.add('d-none');
  document.getElementById('timelineContent').classList.remove('d-none');

  var agents = state.effectifJour.agents;
  var wrapper = document.getElementById('timelineWrapper');
  if (!agents.length) {
    wrapper.innerHTML = '<div class="text-center py-3 text-muted">Aucun agent dans l\'effectif</div>';
    renderTimelineCadre(plan);
    return;
  }

  // 1. Creneaux : meme grille que la vue cadre (fenetre degradee max)
  var creneauxFull = Engine.genererCreneaux(
    state.config.creneauDegrade.debut || '11:30',
    state.config.creneauDegrade.fin || '13:30'
  );
  var creneauxPlan = Engine.genererCreneaux(plan.fenetreDebut, plan.fenetreFin);
  var planDebuts = {};
  creneauxPlan.forEach(function (cr) { planDebuts[cr.debut] = true; });
  var nbSlots = creneauxFull.length;

  // 2. Indexer les mouvements
  var mvtIdx = {};   // 'salle:poste:debut' -> mvt
  plan.mouvements.forEach(function (m) {
    if (m.salle && m.poste) mvtIdx[m.salle + ':' + m.poste + ':' + m.creneauDebut] = m;
  });

  // 3. Reconstruire stateMap par poste (meme logique que renderTimelineCadre)
  var salleIds = ['05', '06', '07', '08'];
  var postes = [];
  salleIds.forEach(function (sid) {
    ['instru', 'circu'].forEach(function (poste) {
      var tit = agents.find(function (a) { return a.salle === sid && a.poste === poste; });
      if (tit) postes.push({ salle: sid, poste: poste, titulaireId: tit.id });
    });
  });
  var stateMap = {};
  postes.forEach(function (p) {
    var key = p.salle + ':' + p.poste;
    stateMap[key] = [];
    var occ = p.titulaireId;
    var isR = false;
    creneauxFull.forEach(function (cr) {
      var mvt = mvtIdx[p.salle + ':' + p.poste + ':' + cr.debut];
      if (mvt && mvt.remplacantId) {
        occ = mvt.remplacantId;
        isR = true;
        stateMap[key].push({ agentId: occ, estRempl: true, mvt: mvt });
      } else {
        stateMap[key].push({ agentId: occ, estRempl: isR, mvt: null });
      }
    });
  });

  // 4. Inverser : par agent, par creneau, sa position
  var posByAgent = {};
  agents.forEach(function (a) { posByAgent[a.id] = creneauxFull.map(function () { return null; }); });

  // 4a. Marquer les positions occupees sur les postes
  postes.forEach(function (p) {
    var key = p.salle + ':' + p.poste;
    stateMap[key].forEach(function (slot, idx) {
      if (!slot.agentId) return;
      if (!posByAgent[slot.agentId]) return;
      posByAgent[slot.agentId][idx] = {
        kind: slot.estRempl ? 'rempl' : 'salle',
        salle: p.salle, poste: p.poste, mvt: slot.mvt
      };
    });
  });

  // 4b. Marquer les pauses (prioritaire sur un poste qui aurait pu rester)
  plan.mouvements.forEach(function (m) {
    if (!m.agentPauseId || !posByAgent[m.agentPauseId]) return;
    var idx = -1;
    for (var i = 0; i < creneauxFull.length; i++) { if (creneauxFull[i].debut === m.creneauDebut) { idx = i; break; } }
    if (idx >= 0) {
      posByAgent[m.agentPauseId][idx] = {
        kind: 'pause', salle: m.salle || null, poste: m.poste || null, mvt: m
      };
    }
  });

  var t12 = Engine.parseTime('12:00');
  var t13 = Engine.parseTime('13:00');

  // 4c. OVERRIDE I5/R31 : un agent matin a >= 13:00 est PARTI, peu importe ce que
  // 4a (occupation salle carry-forward) ou 4b (mvt releve) ont marque.
  agents.forEach(function (a) {
    if (a.categorie !== 'matin') return;
    creneauxFull.forEach(function (cr, idx) {
      if (cr.debutMin >= t13) {
        posByAgent[a.id][idx] = { kind: 'parti' };
      }
    });
  });

  // 4d. Combler les vides
  agents.forEach(function (a) {
    var estCouloir = a.categorie === 'couloir' || a.catHoraire === 'couloir';
    var estMatin = a.categorie === 'matin';
    var estSoir = a.categorie === 'soir';
    var estDoublure = a.poste === 'doublure';
    creneauxFull.forEach(function (cr, idx) {
      if (posByAgent[a.id][idx]) return;
      if (estMatin && cr.debutMin >= t13) {
        posByAgent[a.id][idx] = { kind: 'parti' };
      } else if (estSoir && cr.debutMin < t12) {
        posByAgent[a.id][idx] = { kind: 'absent' };
      } else if (estDoublure) {
        posByAgent[a.id][idx] = { kind: 'doublure', salle: a.salle };
      } else if (estCouloir) {
        posByAgent[a.id][idx] = { kind: 'couloir' };
      } else {
        posByAgent[a.id][idx] = { kind: 'idle' };
      }
    });
  });

  // 5. Determiner le role (instru / circu) — priorite roleBloc puis competences
  var roleByAgentRef = {};
  state.agents.forEach(function (a) { roleByAgentRef[a.id] = a.roleBloc; });
  function getRole(a) {
    var rb = roleByAgentRef[a.id];
    if (rb === 'instru') return 'instru';
    if (rb === 'panseur' || rb === 'panseur_crise') return 'circu';
    var c = state.competences[a.id] || a.competences || {};
    if (c.instru === 'quotidien' || c.instru === 'crise') return 'instru';
    return 'circu';
  }
  var instrus = agents.filter(function (a) { return getRole(a) === 'instru'; });
  var circus  = agents.filter(function (a) { return getRole(a) === 'circu'; });

  // 6. Render
  function badgesOf(a) {
    var b = '';
    var is13h = a.categorie === 'matin';
    var isSoir = a.categorie === 'soir';
    var isCoul = a.categorie === 'couloir' || a.catHoraire === 'couloir';
    if (is13h) b += ' <span class="pion-badge pion-b-13h">13h</span>';
    if (isSoir) b += ' <span class="pion-badge pion-b-soir">soir</span>';
    if (isCoul) b += ' <span class="pion-badge pion-b-couloir">coul.</span>';
    if (a.poste === 'doublure') b += ' <span class="pion-badge pion-b-sortant">doubl.</span>';
    return b;
  }

  function blockHtml(slot, role, idx) {
    var l = (idx / nbSlots * 100).toFixed(2);
    var w = (100 / nbSlots).toFixed(2);
    var cr = creneauxFull[idx];
    var extraCls = planDebuts[cr.debut] ? '' : ' va-extra';
    var cls = 'va-block va-' + slot.kind + extraCls;
    var label = '';
    var title = cr.debut + '-' + cr.fin + ' · ';
    switch (slot.kind) {
      case 'salle':
        label = 'S' + slot.salle + ' ' + (slot.poste === 'instru' ? 'I' : 'C');
        cls += ' va-poste-' + slot.poste;
        title += 'Sur poste ' + label;
        break;
      case 'rempl':
        label = '→ S' + slot.salle + ' ' + (slot.poste === 'instru' ? 'I' : 'C');
        cls += ' va-rempl-' + slot.poste;
        if (slot.mvt && slot.mvt.niveau === 'crise') cls += ' va-crise';
        title += 'Remplace en ' + label;
        break;
      case 'pause':
        label = slot.salle ? 'Pause' : 'Pause';
        title += 'Pause repas' + (slot.salle ? ' (S' + slot.salle + ' ' + slot.poste + ' couvert)' : ' libre');
        break;
      case 'couloir':
        label = 'Couloir';
        cls += ' va-couloir';
        title += 'Au couloir';
        break;
      case 'doublure':
        label = 'Doublure S' + slot.salle;
        cls += ' va-doublure';
        title += 'Doublure salle ' + slot.salle;
        break;
      case 'parti':
        label = '— parti';
        cls += ' va-parti';
        title += 'Parti (13h)';
        break;
      case 'absent':
        label = '';
        cls += ' va-empty';
        title += 'Pas encore arrive';
        break;
      case 'idle':
      default:
        label = '';
        cls += ' va-empty';
        title += '—';
    }
    return '<div class="' + cls + '" style="left:' + l + '%;width:' + w + '%" title="' + escHtml(title) + '">' + escHtml(label) + '</div>';
  }

  function renderRow(a) {
    var role = getRole(a);
    var h = '<div class="va-row"><div class="va-label va-label-' + role + '">' +
      escHtml(a.nom) + badgesOf(a) + '</div><div class="va-bar-area">';
    posByAgent[a.id].forEach(function (slot, idx) { h += blockHtml(slot, role, idx); });
    h += '</div></div>';
    return h;
  }

  function renderSection(titre, ags, role) {
    if (!ags.length) return '';
    var h = '<div class="va-section va-section-' + role + '"><div class="va-section-title">' +
      escHtml(titre) + ' <span class="va-section-count">' + ags.length + '</span></div>';
    ags.forEach(function (a) { h += renderRow(a); });
    h += '</div>';
    return h;
  }

  // Header avec heures alignees sur les blocs
  var h = '<div class="va-container">';
  h += '<div class="va-header"><div class="va-label"></div><div class="va-bar-area">';
  creneauxFull.forEach(function (cr, idx) {
    var l = (idx / nbSlots * 100).toFixed(2);
    var w = (100 / nbSlots).toFixed(2);
    var extra = !planDebuts[cr.debut];
    h += '<div class="va-hour' + (extra ? ' va-hour-extra' : '') + '" style="position:absolute;left:' + l + '%;width:' + w + '%;text-align:left;padding-left:2px;">' + escHtml(cr.debut) + '</div>';
  });
  // Marqueur de fin
  h += '<div class="va-hour" style="position:absolute;right:0;text-align:right;padding-right:2px;">' + escHtml(creneauxFull[nbSlots - 1].fin) + '</div>';
  h += '</div></div>';

  h += renderSection('Instrumentistes', instrus, 'instru');
  h += renderSection('Circulants', circus, 'circu');
  h += '</div>';

  wrapper.innerHTML = h;
  renderTimelineCadre(plan);
}

/* ================================================================
   VUE CADRE — PETIT TRAIN
   Qui assure chaque poste a chaque instant
   ================================================================ */

/* ================================================================
   VUE CADRE — PETIT TRAIN
   Pions = agents (colores par role). Cases = damier neutre.
   Couloir/Banc = zones tampons sans creneaux.
   ================================================================ */
function renderTimelineCadre(plan) {
  if (!plan || plan.mouvements.length === 0) return;

  var creneauxPlan = Engine.genererCreneaux(plan.fenetreDebut, plan.fenetreFin);
  var creneauxFull = Engine.genererCreneaux(
    state.config.creneauDegrade.debut || '11:30',
    state.config.creneauDegrade.fin || '13:30'
  );
  var planDebuts = {};
  creneauxPlan.forEach(function (cr) { planDebuts[cr.debut] = true; });

  // Si des agents 13h existent, la colonne 13:00 doit être visible (pas extra)
  var has13h = state.effectifJour.agents.some(function (a) { return a.categorie === 'matin' && a.salle; });
  var has13hMvt = plan.mouvements.some(function (m) { return m.niveau === 'releve_13h'; });

  var creneaux = creneauxFull.map(function (cr) {
    var extra = !planDebuts[cr.debut];
    // Forcer la colonne 13:00 visible si 13h
    if ((has13h || has13hMvt) && cr.debut === '13:00') extra = false;
    return { debut: cr.debut, fin: cr.fin, extra: extra };
  });

  var agMap = {};
  state.effectifJour.agents.forEach(function (a) { agMap[a.id] = a; });

  var salleIds = ['05', '06', '07', '08'];
  var postes = [];
  salleIds.forEach(function (sid) {
    ['instru', 'circu'].forEach(function (poste) {
      var tit = state.effectifJour.agents.find(function (a) { return a.salle === sid && a.poste === poste; });
      if (tit) postes.push({ salle: sid, poste: poste, titulaireId: tit.id });
    });
  });

  var mvtIdx = {};
  plan.mouvements.forEach(function (m) {
    if (m.salle && m.poste) mvtIdx[m.salle + ':' + m.poste + ':' + m.creneauDebut] = m;
  });

  // Etat reel par slot (cascade = remplacant reste)
  // I5/R31 : un agent matin (categorie='matin') ne peut PAS occuper son poste a partir
  // de 13:00. Si la releve_13h n'a pas pose de remplacant, la cellule devient vacante.
  var t13min = Engine.parseTime('13:00');
  var stateMap = {};
  postes.forEach(function (p) {
    var key = p.salle + ':' + p.poste;
    stateMap[key] = [];
    var occupant = p.titulaireId;
    var isRepl = false;
    creneaux.forEach(function (cr) {
      var mvt = mvtIdx[p.salle + ':' + p.poste + ':' + cr.debut];
      if (mvt && mvt.remplacantId) {
        occupant = mvt.remplacantId;
        isRepl = true;
        stateMap[key].push({ agentId: occupant, estRemplacant: true, mvt: mvt, extra: cr.extra });
      } else {
        // Vider l'occupant matin a partir de 13:00 (parti, pas remplace)
        var occAg = agMap[occupant];
        if (occAg && occAg.categorie === 'matin' && Engine.parseTime(cr.debut) >= t13min) {
          stateMap[key].push({ agentId: null, estRemplacant: false, mvt: null, extra: cr.extra, posteVacant13h: true });
        } else {
          stateMap[key].push({ agentId: occupant, estRemplacant: isRepl, mvt: null, extra: cr.extra });
        }
      }
    });
  });

  // Qui finit au couloir
  var agentsSurPoste = new Set();
  postes.forEach(function (p) {
    var key = p.salle + ':' + p.poste;
    var last = stateMap[key][creneaux.length - 1];
    if (last) agentsSurPoste.add(last.agentId);
  });
  var agentsVersCouloir = [];
  plan.mouvements.forEach(function (m) {
    if (m.agentPauseId && !agentsSurPoste.has(m.agentPauseId)) {
      if (agentsVersCouloir.indexOf(m.agentPauseId) === -1) agentsVersCouloir.push(m.agentPauseId);
    }
  });

  // Helper pion
  function pion(agentId) {
    var a = agMap[agentId];
    var nom = a ? a.nom : '?';
    var comp = state.competences[agentId] || {};
    var role = (comp.instru === 'quotidien' || comp.instru === 'crise') ? 'instru' : 'circu';
    var is13h = a && a.categorie === 'matin';
    var isSoir = a && a.categorie === 'soir';
    var isCouloir = a && a.categorie === 'couloir';
    var badges = '';
    if (is13h) badges += '<span class="pion-badge pion-b-13h">13h</span>';
    if (isSoir) badges += '<span class="pion-badge pion-b-soir">soir</span>';
    if (isCouloir) badges += '<span class="pion-badge pion-b-couloir">coul.</span>';
    return '<div class="pion pion-' + role + (is13h ? ' pion-13h' : '') + '" draggable="true" data-agent="' + escHtml(agentId) + '" data-role="' + role + '" data-cat="' + escHtml(a ? a.categorie : '') + '">' + escHtml(nom) + badges + '</div>';
  }

  // Pion sortant (agent qui finit au couloir après cascade — pas couloir du matin)
  function pionSortant(agentId) {
    var a = agMap[agentId];
    var nom = a ? a.nom : '?';
    var comp = state.competences[agentId] || {};
    var role = (comp.instru === 'quotidien' || comp.instru === 'crise') ? 'instru' : 'circu';
    return '<div class="pion pion-' + role + ' pion-sortant" draggable="true" data-agent="' + escHtml(agentId) + '" data-role="' + role + '" data-cat="' + escHtml(a ? a.categorie : '') + '">' + escHtml(nom) + '<span class="pion-badge pion-b-sortant">→coul.</span></div>';
  }

  // Annotation origine
  function origine(agentId) {
    var a = agMap[agentId];
    if (!a) return '';
    if (a.categorie === 'soir') return '(soir)';
    if (a.categorie === 'couloir') return '(couloir)';
    if (a.salle) return '(S' + a.salle + ')';
    return '';
  }

  // -- TABLE --
  var nbCols = creneaux.length * 2; // slots + separateurs
  var h = '<table class="train-table"><thead><tr><th class="train-th-poste"></th>';
  creneaux.forEach(function (cr, idx) {
    if (idx > 0) h += '<th class="train-th-sep' + (cr.extra ? ' train-extra' : '') + '"></th>';
    h += '<th class="train-th-slot' + (cr.extra ? ' train-th-extra' : '') + '" data-slot="' + escHtml(cr.debut) + '">' + escHtml(cr.debut) + '</th>';
  });
  h += '</tr></thead><tbody>';

  // Salles
  var prevSalle = null;
  salleIds.forEach(function (sid) {
    var sd = state.effectifJour.salles.find(function (s) { return s.id === sid; });
    var fermee = sd && sd.occupee === false;
    var sallePostes = postes.filter(function (p) { return p.salle === sid; });

    if (prevSalle !== null) h += '<tr class="train-sep-row"><td colspan="' + nbCols + '"></td></tr>';
    prevSalle = sid;

    if (fermee || sallePostes.length === 0) {
      ['instru', 'circu'].forEach(function (poste) {
        h += '<tr class="train-row-fermee"><td class="train-td-poste"><span class="train-salle">S' + escHtml(sid) + '</span> <span class="train-poste-' + poste + '">' + (poste === 'instru' ? 'I' : 'C') + '</span></td>';
        creneaux.forEach(function (cr, idx) {
          if (idx > 0) h += '<td class="train-sep"></td>';
          h += '<td class="train-cell train-cell-fermee"></td>';
        });
        h += '</tr>';
      });
    } else {
      sallePostes.forEach(function (p) {
        var key = p.salle + ':' + p.poste;
        var damier = p.poste === 'instru' ? 'train-row-instru' : 'train-row-circu';
        h += '<tr class="' + damier + '"><td class="train-td-poste"><span class="train-salle">S' + escHtml(p.salle) + '</span> <span class="train-poste-' + p.poste + '">' + (p.poste === 'instru' ? 'I' : 'C') + '</span></td>';

        creneaux.forEach(function (cr, idx) {
          if (idx > 0) h += '<td class="train-sep' + (cr.extra ? ' train-extra' : '') + '"><i class="bi bi-chevron-right"></i></td>';
          var slot = stateMap[key][idx];
          var extraCls = cr.extra ? ' train-cell-extra' : '';

          // Relève 13h : toujours afficher même dans les colonnes extra
          var isReleve13h = slot && slot.mvt && slot.mvt.niveau === 'releve_13h';
          var showContent = !cr.extra || isReleve13h;

          // Agent 13h qui est encore sur son poste avant de partir
          var agent13hSurPoste = false;
          if (slot && slot.agentId) {
            var agSlot = agMap[slot.agentId];
            if (agSlot && agSlot.categorie === 'matin' && !slot.mvt) agent13hSurPoste = true;
          }

          var posteVacant13h = slot && slot.posteVacant13h;
          h += '<td class="train-cell train-cell-' + p.poste + extraCls + (isReleve13h ? ' train-cell-13h-parti' : '') + (posteVacant13h ? ' train-cell-vacant-13h' : '') + '" data-poste="' + p.poste + '" data-salle="' + p.salle + '" data-slot="' + escHtml(cr.debut) + '">';
          if (showContent && slot && slot.agentId) {
            if (slot.mvt) {
              var titAg = agMap[slot.mvt.agentPauseId];
              var titNom = titAg ? titAg.nom : '';
              var is13hParti = titAg && titAg.categorie === 'matin';
              h += '<div class="train-mvt">' + pion(slot.agentId) + '<span class="train-arrow">' + escHtml(titNom) + (is13hParti ? ' <span class="train-13h-parti-label">→ 13h</span>' : '') + '</span></div>';
            } else {
              h += pion(slot.agentId);
            }
          } else if (showContent && posteVacant13h) {
            h += '<div class="train-vacant-13h" title="Agent matin parti a 13:00, poste non couvert"><i class="bi bi-exclamation-triangle"></i> vacant</div>';
          }
          h += '</td>';
        });
        h += '</tr>';
      });
    }
  });

  h += '</tbody></table>';

  // -- ZONES TAMPONS (bandes pleine largeur) --

  // Couloir
  h += '<div class="train-zone train-zone-couloir" data-drop="couloir"><div class="train-zone-label"><i class="bi bi-signpost-split me-1"></i>Couloir</div><div class="train-zone-pions">';
  // Bug 3 fix : inclure les couloirs+13h (categorie='matin' mais catHoraire='couloir')
  state.effectifJour.agents.forEach(function (a) {
    var estCouloir = a.categorie === 'couloir' || a.catHoraire === 'couloir';
    if (estCouloir && !agentsSurPoste.has(a.id) && agentsVersCouloir.indexOf(a.id) === -1) {
      h += pion(a.id);
    }
  });
  // Agents → couloir après cascade (marqués visuellement)
  agentsVersCouloir.forEach(function (id) { h += pionSortant(id); });
  h += '</div></div>';

  // Banc de touche
  h += '<div class="train-zone train-zone-banc" data-drop="banc"><div class="train-zone-label"><i class="bi bi-person-dash me-1"></i>Banc de touche</div><div class="train-zone-pions" id="bancPions"></div></div>';

  // -- ALERTES --
  var alerts = [];
  postes.forEach(function (p) {
    var key = p.salle + ':' + p.poste;
    var last = stateMap[key] ? stateMap[key][creneaux.length - 1] : null;
    if (!last || !last.agentId) alerts.push({ t: 'danger', m: 'S' + p.salle + ' ' + p.poste + ' : poste non pourvu' });
  });
  if (plan.agentsNonNourris && plan.agentsNonNourris.length > 0) {
    plan.agentsNonNourris.forEach(function (id) {
      var a = agMap[id]; alerts.push({ t: 'warning', m: (a ? a.nom : id) + ' n\'a pas mange' });
    });
  }
  if (alerts.length > 0) {
    h += '<div class="train-alerts">';
    alerts.forEach(function (al) {
      var ic = al.t === 'danger' ? 'x-octagon-fill' : 'exclamation-triangle-fill';
      h += '<div class="train-alert train-alert-' + al.t + '"><i class="bi bi-' + ic + ' me-1"></i>' + escHtml(al.m) + '</div>';
    });
    h += '</div>';
  }

  // Legende
  h += '<div class="train-legende">';
  h += '<span class="pion pion-instru pion-leg">Instru</span>';
  h += '<span class="pion pion-circu pion-leg">Circu</span>';
  h += ' <span class="pion-badge pion-b-13h">13h</span> part a 13h ';
  h += ' <span class="pion-badge pion-b-soir">soir</span> deja mange ';
  h += ' <span class="pion-badge pion-b-couloir">coul.</span> couloir matin ';
  h += ' <span class="pion-badge pion-b-sortant">&rarr;coul.</span> vers couloir apres cascade ';
  h += '</div>';

  document.getElementById('trainWrapper').innerHTML = h;
  initTrainDragDrop();
}

/* ================================================================
   DRAG & DROP
   2 refus : circu→instru, 13h→>13:00
   Drop sur occupé = éjection au banc
   ================================================================ */
function initTrainDragDrop() {
  var wrapper = document.getElementById('trainWrapper');
  if (!wrapper) return;
  var draggedId = null;
  var draggedEl = null;

  wrapper.addEventListener('dragstart', function (e) {
    var t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    var el = t.closest('[data-agent]');
    if (!el) return;
    draggedId = el.dataset.agent;
    draggedEl = el;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);
    setTimeout(function () { el.classList.add('pion-dragging'); }, 0);
  });

  wrapper.addEventListener('dragend', function () {
    if (draggedEl) draggedEl.classList.remove('pion-dragging');
    draggedId = null; draggedEl = null;
    wrapper.querySelectorAll('.drag-ok,.drag-no').forEach(function (el) { el.classList.remove('drag-ok', 'drag-no'); });
    wrapper.querySelectorAll('.train-extra-open').forEach(function (el) { el.classList.remove('train-extra-open'); });
  });

  wrapper.addEventListener('dragover', function (e) {
    var t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    var target = t.closest('.train-cell, .train-zone');
    if (!target || !draggedId) return;
    e.preventDefault();
    wrapper.querySelectorAll('.drag-ok,.drag-no').forEach(function (el) { el.classList.remove('drag-ok', 'drag-no'); });

    // Validation
    var targetPoste = target.dataset.poste;
    var targetSlot = target.dataset.slot;
    var role = draggedEl ? draggedEl.dataset.role : null;
    var cat = draggedEl ? draggedEl.dataset.cat : null;

    // Refus 1 : circu vers instru
    if (targetPoste === 'instru' && role === 'circu') {
      target.classList.add('drag-no');
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    // Refus 2 : 13h vers >= 13:00
    if (cat === 'matin' && targetSlot && targetSlot >= '13:00') {
      target.classList.add('drag-no');
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    target.classList.add('drag-ok');
    e.dataTransfer.dropEffect = 'move';

    // Ouvrir la colonne extra survolée seulement
    if (target.classList.contains('train-cell-extra')) {
      var slot = target.dataset.slot;
      wrapper.querySelectorAll('[data-slot="' + slot + '"]').forEach(function (el) {
        el.classList.add('train-extra-open');
      });
      // Ouvrir aussi le séparateur adjacent
      wrapper.querySelectorAll('.train-extra').forEach(function (el) {
        el.classList.add('train-extra-open');
      });
    }
  });

  wrapper.addEventListener('dragleave', function (e) {
    var t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    var cell = t.closest('.drag-ok,.drag-no');
    if (cell && !cell.contains(e.relatedTarget)) cell.classList.remove('drag-ok', 'drag-no');
  });

  wrapper.addEventListener('drop', function (e) {
    e.preventDefault();
    wrapper.querySelectorAll('.drag-ok,.drag-no').forEach(function (el) { el.classList.remove('drag-ok', 'drag-no'); });

    var t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    var target = t.closest('.train-cell, .train-zone');
    if (!target || !draggedId) return;

    var role = draggedEl ? draggedEl.dataset.role : null;
    var cat = draggedEl ? draggedEl.dataset.cat : null;
    var targetPoste = target.dataset.poste;
    var targetSlot = target.dataset.slot;

    // Re-check refus
    if (targetPoste === 'instru' && role === 'circu') {
      bdbToast('Circulant ne peut pas instrumenter', 'danger'); return;
    }
    if (cat === 'matin' && targetSlot && targetSlot >= '13:00') {
      bdbToast('Agent 13h interdit au-dela de 13:00', 'danger'); return;
    }

    var dropZone = target.dataset.drop; // 'couloir' ou 'banc'

    /* Drop = deplacement d'UN pion d'un endroit a un autre.
       Un agent peut legitimement apparaitre dans plusieurs cellules consecutives
       (cascade : il occupe son poste sur plusieurs creneaux). On retire UNIQUEMENT
       le pion source ; les autres instances de l'agent (autres slots) restent.
       Exception : depot dans une zone tampon (couloir/banc) = purge des AUTRES
       instances dans les zones tampons (un agent ne peut pas etre simultanement
       au banc ET au couloir). Mais ses cellules salle restent intactes. */
    function removeFromBuffers(agentId) {
      var sel = '.train-zone [data-agent="' + (agentId || '').replace(/"/g, '\\"') + '"]';
      wrapper.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    }
    function removeFromSourceCell() {
      if (!draggedEl) return;
      var srcMvt = draggedEl.closest('.train-mvt');
      if (srcMvt) srcMvt.remove();
      else draggedEl.remove();
    }

    if (dropZone === 'banc' || dropZone === 'couloir') {
      var zoneDiv = target.querySelector('.train-zone-pions') || target;
      removeFromBuffers(draggedId);                 // pas de doublon banc<->couloir
      removeFromSourceCell();                       // retire de la cellule salle si on vient de la
      zoneDiv.insertAdjacentHTML('beforeend', makePion(draggedId));
      bdbToast((state.effectifJour.agents.find(function(a){return a.id===draggedId;}) || {}).nom + ' → ' + dropZone, dropZone === 'banc' ? 'warning' : 'info');
    } else {
      // Vers une cellule de salle precise (data-slot unique)
      var existingPion = target.querySelector('.pion');
      if (existingPion && existingPion.dataset.agent !== draggedId) {
        // Ejecter l'occupant au banc (uniquement cette occurrence-ci)
        var occId = existingPion.dataset.agent;
        var bancDiv = document.getElementById('bancPions');
        if (bancDiv) bancDiv.insertAdjacentHTML('beforeend', makePion(occId));
      }
      removeFromSourceCell();                        // retire SEULEMENT le pion source
      removeFromBuffers(draggedId);                  // si on vient d'une zone tampon, on l'y retire aussi
      target.innerHTML = '';
      target.insertAdjacentHTML('afterbegin', makePion(draggedId));
    }

    /* Filet de securite : l'Effectif fait foi. Tout agent qui a "disparu" du DOM
       de la timeline apres le drop est automatiquement remis au banc, pour que
       l'utilisateur puisse continuer a tester des combinaisons sans le perdre. */
    ensureAllAgentsVisible();

    draggedId = null; draggedEl = null;
  });

  /* Garantit qu'aucun agent de l'Effectif ne disparait du DOM apres une manipulation.
     S'il manque, on le replace au banc (zone neutre, recuperable par drag). */
  function ensureAllAgentsVisible() {
    var bancDiv = document.getElementById('bancPions');
    if (!bancDiv) return;
    state.effectifJour.agents.forEach(function (a) {
      var sel = '[data-agent="' + (a.id || '').replace(/"/g, '\\"') + '"]';
      if (!wrapper.querySelector(sel)) {
        bancDiv.insertAdjacentHTML('beforeend', makePion(a.id));
      }
    });
  }

  // Helper : creer un pion HTML (duplique de la version interne au drop pour pouvoir
  // etre appele par ensureAllAgentsVisible — meme contrat exactement).
  function makePion(agId) {
    var ag = state.effectifJour.agents.find(function (a) { return a.id === agId; });
    var nom = ag ? ag.nom : agId;
    var comp = state.competences[agId] || {};
    var r = (comp.instru === 'quotidien' || comp.instru === 'crise') ? 'instru' : 'circu';
    var is13h = ag && ag.categorie === 'matin';
    var isSoir = ag && ag.categorie === 'soir';
    var isCouloir = ag && (ag.categorie === 'couloir' || ag.catHoraire === 'couloir');
    var badges = '';
    if (is13h) badges += '<span class="pion-badge pion-b-13h">13h</span>';
    if (isSoir) badges += '<span class="pion-badge pion-b-soir">soir</span>';
    if (isCouloir) badges += '<span class="pion-badge pion-b-couloir">coul.</span>';
    return '<div class="pion pion-' + r + (is13h ? ' pion-13h' : '') + '" draggable="true" data-agent="' + escHtml(agId) + '" data-role="' + r + '" data-cat="' + escHtml(ag ? ag.categorie : '') + '">' + escHtml(nom) + badges + '</div>';
  }

  // Au branchement initial : peupler le banc avec les agents qui ne sont nulle part
  // (cas ou le calcul auto laisse des agents inutilises — ex : doublure, banc vide initial)
  ensureAllAgentsVisible();
}

/* ================================================================
   CONFIG
   ================================================================ */
function renderConfig() {
  var actifs=state.agents.filter(function(a){return !a.desactive;});
  document.getElementById('countAgents').textContent=actifs.length+' / '+state.agents.length;
  document.getElementById('countChirurgiens').textContent=state.chirurgiens.length;
  document.getElementById('configAgentsBody').innerHTML=state.agents.map(function(a){
    var c=state.competences[a.id]||{};
    var compTxt=(c.instru==='quotidien'?'I':c.instru==='crise'?'i':'·')+' / '+(c.circu==='quotidien'?'C':'·');
    var rc=a.desactive?' class="row-disabled"':'';var dis=a.desactive?' disabled':'';
    return '<tr'+rc+'><td><strong>'+escHtml(a.nomCourt)+'</strong><div class="rempla-cfg-sub">'+escHtml(a.nom)+'</div></td>'+
      '<td><select class="rempla-sel-xs" data-action="set-role" data-aid="'+escHtml(a.id)+'"'+dis+'><option value="panseur"'+(a.roleBloc==='panseur'?' selected':'')+'>Panseur</option><option value="instru"'+(a.roleBloc==='instru'?' selected':'')+'>Instru</option><option value="panseur_crise"'+(a.roleBloc==='panseur_crise'?' selected':'')+'>Pans.+crise</option></select></td>'+
      '<td><select class="rempla-sel-xs" data-action="set-catdefaut" data-aid="'+escHtml(a.id)+'"'+dis+'>'+['journee','12h','matin','soir'].map(function(v){return '<option value="'+v+'"'+(a.categDefaut===v?' selected':'')+'>'+v+'</option>';}).join('')+'</select></td>'+
      '<td><select class="rempla-sel-xs" data-action="set-prefrepas" data-aid="'+escHtml(a.id)+'"'+dis+'><option value="indifferent"'+(a.prefRepas==='indifferent'?' selected':'')+'>—</option><option value="tot"'+(a.prefRepas==='tot'?' selected':'')+'>Tot</option><option value="tard"'+(a.prefRepas==='tard'?' selected':'')+'>Tard</option></select></td>'+
      '<td class="text-center"><span class="rempla-comp-badge">'+escHtml(compTxt)+'</span></td>'+
      '<td class="text-center"><input type="checkbox" class="form-check-input" data-action="toggle-actif" data-aid="'+escHtml(a.id)+'"'+(a.desactive?'':' checked')+'/></td></tr>';
  }).join('');
  document.getElementById('configChirBody').innerHTML=state.chirurgiens.map(function(c){
    var ref=c.refusePause?'non':'oui';
    return '<tr><td><strong>'+escHtml(c.nom)+'</strong></td>'+
      '<td class="text-center"><select class="rempla-sel-xs" data-action="set-chirpause" data-cid="'+escHtml(c.id)+'">'+
      '<option value="oui"'+(ref==='oui'?' selected':'')+'>Accepte</option>'+
      '<option value="non"'+(ref==='non'?' selected':'')+'>Refuse</option>'+
      '</select></td></tr>';
  }).join('');
}

/* ================================================================
   INCOMPATIBILITES
   ================================================================ */
function renderIncompat() {
  document.getElementById('incompatChirBody').innerHTML=state.incompatChir.length===0?'<tr><td colspan="4" class="text-center py-3 rempla-muted">Aucune affinite saisie</td></tr>':
    state.incompatChir.map(function(ic){var ch=state.chirurgiens.find(function(c){return c.id===ic.chirId;});var ag=state.agents.find(function(a){return a.id===ic.agentId;});
      return '<tr><td>'+escHtml(ch?ch.nom:'?')+'</td><td>'+escHtml(ag?ag.nomCourt:'?')+'</td><td><span class="rempla-niv-'+(ic.avis==='non'?'crise':'quotidien')+'">'+(ic.avis==='non'?'Refuse':'Accepte')+'</span></td><td><button class="btn btn-link btn-sm text-danger p-0" data-action="del-ic" data-iid="'+escHtml(ic.id)+'"><i class="bi bi-trash3"></i></button></td></tr>';}).join('');
  document.getElementById('incompatIdeBody').innerHTML=state.incompatIde.length===0?'<tr><td colspan="4" class="text-center py-3 rempla-muted">Aucune affinite saisie</td></tr>':
    state.incompatIde.map(function(ic){var ag=state.agents.find(function(a){return a.id===ic.agentId;});var ch=state.chirurgiens.find(function(c){return c.id===ic.chirId;});
      return '<tr><td>'+escHtml(ag?ag.nomCourt:'?')+'</td><td>'+escHtml(ch?ch.nom:'?')+'</td><td><span class="rempla-niv-'+(ic.avis==='non'?'crise':'quotidien')+'">'+(ic.avis==='non'?'N\'aime pas':'OK')+'</span></td><td><button class="btn btn-link btn-sm text-danger p-0" data-action="del-ii" data-iid="'+escHtml(ic.id)+'"><i class="bi bi-trash3"></i></button></td></tr>';}).join('');
  var oC=state.chirurgiens.map(function(c){return '<option value="'+escHtml(c.id)+'">'+escHtml(c.nom)+'</option>';}).join('');
  var oA=state.agents.filter(function(a){return !a.desactive;}).map(function(a){return '<option value="'+escHtml(a.id)+'">'+escHtml(a.nomCourt)+'</option>';}).join('');
  document.getElementById('addIncompatChirArea').innerHTML='<div class="d-flex gap-1 flex-wrap"><select class="form-select form-select-sm rempla-sel-sm" id="icChir"><option value="">Chir…</option>'+oC+'</select><select class="form-select form-select-sm rempla-sel-sm" id="icAgent"><option value="">IDE…</option>'+oA+'</select><select class="form-select form-select-sm rempla-sel-xs" id="icAvis"><option value="non">Refuse</option><option value="ok">Accepte</option></select><button class="btn btn-module-outline btn-sm" data-action="add-ic"><i class="bi bi-plus-lg"></i></button></div>';
  document.getElementById('addIncompatIdeArea').innerHTML='<div class="d-flex gap-1 flex-wrap"><select class="form-select form-select-sm rempla-sel-sm" id="iiAgent"><option value="">IDE…</option>'+oA+'</select><select class="form-select form-select-sm rempla-sel-sm" id="iiChir"><option value="">Chir…</option>'+oC+'</select><select class="form-select form-select-sm rempla-sel-xs" id="iiAvis"><option value="non">N\'aime pas</option><option value="ok">OK</option></select><button class="btn btn-module-outline btn-sm" data-action="add-ii"><i class="bi bi-plus-lg"></i></button></div>';
}

/* ================================================================
   ACTIONS
   ================================================================ */
function buildEffectifAgents() {
  var agS=[];
  ['05','06','07','08'].forEach(function(sid){
    var card=document.getElementById('salle'+sid+'Card');if(!card)return;
    ['instru','circu'].forEach(function(poste){
      var s=card.querySelector('[data-action="set-agent"][data-poste="'+poste+'"]');
      var catSel=card.querySelector('[data-action="set-agentcat"][data-poste="'+poste+'"]');
      if(s&&s.value){
        var p=state.agents.find(function(x){return x.id===s.value;});
        if(p){
          var cat = catSel ? catSel.value : p.categDefaut;
          agS.push({id:p.id,nom:p.nomCourt,categorie:cat,salle:sid,poste:poste,competences:state.competences[p.id]||{},preferenceCreneau:p.prefRepas});
        }
      }
    });
    var cs=card.querySelector('[data-action="set-chirurgien"]');if(cs){var sd=state.effectifJour.salles.find(function(s){return s.id===sid;});if(sd)sd.chirurgienId=cs.value||null;}
  });
  var sIds=new Set(agS.map(function(a){return a.id;}));
  state.effectifJour.agents=agS.concat(state.effectifJour.agents.filter(function(a){return (!a.salle||a.poste==='doublure')&&!sIds.has(a.id);}));
}

function syncConfig(){
  state.config.dureePause=parseInt(document.getElementById('cfgDureePause').value,10)||30;
  state.config.creneauNominal.debut=document.getElementById('cfgNomDebut').value||'12:00';
  state.config.creneauNominal.fin=document.getElementById('cfgNomFin').value||'13:00';
  state.config.creneauDegrade.debut=document.getElementById('cfgDegDebut').value||'11:30';
  state.config.creneauDegrade.fin=document.getElementById('cfgDegFin').value||'13:30';
  // Chirurgiens qui refusent la pause de salle
  var refus={};
  state.chirurgiens.forEach(function(c){if(c.refusePause)refus[c.id]=true;});
  state.config.chirPauseRefus=refus;
}

function lancerDiag(){buildEffectifAgents();syncConfig();if(state.effectifJour.agents.length===0)return;renderDiagnostic(Engine.diagnostiquer(state.effectifJour,state.config));}
function lancerCalc(){
  buildEffectifAgents();syncConfig();if(state.effectifJour.agents.length===0)return;
  var pref=state.incompatChir.map(function(ic){return{chirurgienId:ic.chirId,agentId:ic.agentId,poste:'instru',accepte:ic.avis==='ok'};});
  var plan=Engine.calculerPlan(state.effectifJour,state.config,state.competences,pref);
  renderDiagnostic(plan.diagnostic);renderPlan(plan);renderTimeline(plan);
  bdbToast('Plan calcule ('+plan.mouvements.length+' mouvements)','success');
  new bootstrap.Tab(document.getElementById('tab-plan')).show();
}

/* ================================================================
   LISTENERS
   ================================================================ */
function initListeners(){
  document.getElementById('btnDiag').addEventListener('click',lancerDiag);
  document.getElementById('btnCalcAuto').addEventListener('click',lancerCalc);

  // Purger l'effectif
  document.getElementById('btnPurge').addEventListener('click', function () {
    if (!confirm('Repartir a zero pour une nouvelle journee ?')) return;
    purgerEffectif();
  });
  document.getElementById('inputDate').value=new Date().toISOString().split('T')[0];
  ['cfgDureePause','cfgNomDebut','cfgNomFin','cfgDegDebut','cfgDegFin'].forEach(function(id){document.getElementById(id).addEventListener('change',syncConfig);});

  // Toggle Vue Cadre / Vue Agent
  document.getElementById('btnVueCadre').addEventListener('click', function () {
    document.getElementById('timelineCadre').classList.remove('d-none');
    document.getElementById('timelineAgent').classList.add('d-none');
    document.getElementById('btnVueCadre').classList.add('active');
    document.getElementById('btnVueCadre').classList.remove('btn-module-outline');
    document.getElementById('btnVueCadre').classList.add('btn-module');
    document.getElementById('btnVueAgent').classList.remove('active');
    document.getElementById('btnVueAgent').classList.remove('btn-module');
    document.getElementById('btnVueAgent').classList.add('btn-module-outline');
  });
  document.getElementById('btnVueAgent').addEventListener('click', function () {
    document.getElementById('timelineAgent').classList.remove('d-none');
    document.getElementById('timelineCadre').classList.add('d-none');
    document.getElementById('btnVueAgent').classList.add('active');
    document.getElementById('btnVueAgent').classList.remove('btn-module-outline');
    document.getElementById('btnVueAgent').classList.add('btn-module');
    document.getElementById('btnVueCadre').classList.remove('active');
    document.getElementById('btnVueCadre').classList.remove('btn-module');
    document.getElementById('btnVueCadre').classList.add('btn-module-outline');
  });

  // Preset boutons
  document.getElementById('presetBar').addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-preset]') : null;
    if (!btn) return;
    var key = btn.dataset.preset;
    // Highlight actif
    document.querySelectorAll('.rempla-preset').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    // Charger + lancer calcul auto + afficher timeline
    loadPreset(key);
    syncConfig();
    var pref = state.incompatChir.map(function (ic) { return { chirurgienId: ic.chirId, agentId: ic.agentId, poste: 'instru', accepte: ic.avis === 'ok' }; });
    var plan = Engine.calculerPlan(state.effectifJour, state.config, state.competences, pref);
    renderDiagnostic(plan.diagnostic); renderPlan(plan); renderTimeline(plan);
    new bootstrap.Tab(document.getElementById('tab-timeline')).show();
  });

  document.getElementById('remplaMain').addEventListener('change',function(e){
    var act=e.target.dataset.action,aid=e.target.dataset.aid;
    if(act==='set-agent'||act==='set-chirurgien'||act==='set-agentcat'){buildEffectifAgents();renderSalles();renderGroupes();renderHero(null);}
    if(act==='set-prog-term'){var sid=e.target.dataset.salle;var sd=state.effectifJour.salles.find(function(s){return s.id===sid;});if(sd){sd.programmeTermine=e.target.checked;renderSalles();}}
    if(act==='toggle-13h'){
      var aid=e.target.dataset.id;
      var ag=state.effectifJour.agents.find(function(a){return a.id===aid;});
      if(ag){
        ag.categorie=e.target.checked?'matin':ag.catHoraire||'journee';
        renderGroupes();
        // Bug A : recalculer le plan en silence pour que cadre/vue agent refletent
        // le nouvel etat 13h — sinon stateMap conserve un placement qui violerait I5.
        if (state.effectifJour.agents.some(function(a){return a.salle && a.poste;})) {
          try {
            buildEffectifAgents(); syncConfig();
            var pref = state.incompatChir.map(function(ic){return{chirurgienId:ic.chirId,agentId:ic.agentId,poste:'instru',accepte:ic.avis==='ok'};});
            var plan = Engine.calculerPlan(state.effectifJour, state.config, state.competences, pref);
            renderDiagnostic(plan.diagnostic); renderPlan(plan); renderTimeline(plan);
          } catch (err) { /* silent */ }
        }
      }
    }
    if(act==='set-role'){var p=state.agents.find(function(x){return x.id===aid;});if(p){p.roleBloc=e.target.value;applyCompetences(p);saveAgentConfig(p);renderConfig();renderSalles();}}
    if(act==='set-catdefaut'){var p=state.agents.find(function(x){return x.id===aid;});if(p){p.categDefaut=e.target.value;saveAgentConfig(p);}}
    if(act==='set-prefrepas'){var p=state.agents.find(function(x){return x.id===aid;});if(p){p.prefRepas=e.target.value;saveAgentConfig(p);}}
    if(act==='toggle-actif'){var p=state.agents.find(function(x){return x.id===aid;});if(p){p.desactive=!e.target.checked;saveAgentConfig(p);renderConfig();renderSalles();renderGroupes();}}
    if(act==='set-chirpause'){var cid=e.target.dataset.cid;var c=state.chirurgiens.find(function(x){return x.id===cid;});if(c){c.refusePause=e.target.value==='non';bdbToast(escHtml(c.nom)+' : pause '+(c.refusePause?'refusee':'acceptee'),'info');saveChirPauseConfig();}}
  });

  document.getElementById('remplaMain').addEventListener('click',function(e){
    var btn=e.target.closest?e.target.closest('[data-action]'):null;if(!btn)return;
    if(btn.dataset.action==='add-hs'){
      var cat=btn.dataset.cat,body=btn.closest('.card-body');
      var selA=body.querySelector('[data-action="sel-add-hs"]');if(!selA||!selA.value)return;
      var p=state.agents.find(function(x){return x.id===selA.value;});if(!p)return;
      var fc=cat;if(cat!=='couloir'&&cat!=='soir'){var selC=body.querySelector('[data-ref]');if(selC)fc=selC.value;}
      state.effectifJour.agents.push({id:p.id,nom:p.nomCourt,categorie:fc,catHoraire:fc,salle:null,poste:null,competences:state.competences[p.id]||{},preferenceCreneau:p.prefRepas});
      renderGroupes();renderHero(null);
    }
    if(btn.dataset.action==='add-doublure'){
      var body=btn.closest('.card-body');
      var selA=body.querySelector('[data-action="sel-add-doublure"]');if(!selA||!selA.value)return;
      var selS=body.querySelector('[data-ref="doublure-salle"]');
      var p=state.agents.find(function(x){return x.id===selA.value;});if(!p)return;
      var salleId=selS?selS.value:'05';
      state.effectifJour.agents.push({id:p.id,nom:p.nomCourt,categorie:p.categDefaut,catHoraire:p.categDefaut,salle:salleId,poste:'doublure',competences:state.competences[p.id]||{},preferenceCreneau:p.prefRepas});
      renderGroupes();renderHero(null);
    }
    if(btn.dataset.action==='close-salle'){fermerSalle(btn.dataset.salle);}
    if(btn.dataset.action==='open-salle'){
      var sd=state.effectifJour.salles.find(function(s){return s.id===btn.dataset.salle;});
      if(sd){sd.occupee=true;}
      renderSalles();renderGroupes();renderHero(null);
    }
    if(btn.dataset.action==='add-renfort'){
      var typeEl=document.querySelector('[data-ref="renfort-type"]');
      var type=typeEl?typeEl.value:'visceral';
      var count=state.effectifJour.agents.filter(function(a){return a.isRenfort&&a.renfortType===type;}).length+1;
      var rid=type+'-'+count;
      var nom=type+'-'+count;
      state.effectifJour.agents.push({id:rid,nom:nom,categorie:'soir',catHoraire:'soir',salle:null,poste:null,isRenfort:true,renfortType:type,competences:{instru:'quotidien',circu:'quotidien'}});
      state.competences[rid]={instru:'quotidien',circu:'quotidien'};
      renderGroupes();renderHero(null);
    }
    if(btn.dataset.action==='remove-hs'){state.effectifJour.agents=state.effectifJour.agents.filter(function(a){return a.id!==btn.dataset.id;});renderGroupes();renderHero(null);}
    if(btn.dataset.action==='add-ic'){var ch=document.getElementById('icChir').value,ag=document.getElementById('icAgent').value,av=document.getElementById('icAvis').value;if(ch&&ag)saveIncompat('chir_ide',ch,ag,av).then(function(row){if(row){state.incompatChir.push({id:row.id,chirId:ch,agentId:ag,avis:av});renderIncompat();bdbToast('Affinite enregistree','success');}});}
    if(btn.dataset.action==='add-ii'){var ag=document.getElementById('iiAgent').value,ch=document.getElementById('iiChir').value,av=document.getElementById('iiAvis').value;if(ag&&ch)saveIncompat('ide_chir',ag,ch,av).then(function(row){if(row){state.incompatIde.push({id:row.id,agentId:ag,chirId:ch,avis:av});renderIncompat();bdbToast('Affinite enregistree','success');}});}
    if(btn.dataset.action==='del-ic'){var iid=btn.dataset.iid;deleteIncompat(iid).then(function(){state.incompatChir=state.incompatChir.filter(function(x){return x.id!==iid;});renderIncompat();});}
    if(btn.dataset.action==='del-ii'){var iid=btn.dataset.iid;deleteIncompat(iid).then(function(){state.incompatIde=state.incompatIde.filter(function(x){return x.id!==iid;});renderIncompat();});}
    if(btn.dataset.action==='load-config'){loadSavedConfig(parseInt(btn.dataset.idx,10));}
    if(btn.dataset.action==='del-config'){e.stopPropagation();deleteSavedConfig(parseInt(btn.dataset.idx,10));}
  });

  // Bouton sauvegarder
  document.getElementById('btnSaveConfig').addEventListener('click', saveCurrentConfig);
}

/* ================================================================
   BOOT
   ================================================================ */
document.addEventListener('DOMContentLoaded',async function(){
  // Si bdbShellReady n'existe pas (mode démo sans shell), continuer
  if (window.bdbShellReady) {
    try { await window.bdbShellReady; } catch(e) { /* shell absent en démo */ }
  }
  if (window.bdbUser) {
    state.isAdmin = window.bdbUser.isAdmin;
    state.isCreator = window.bdbUser.isCreator;
  }

  await loadReferentiels();

  document.getElementById('loadingState').classList.add('d-none');
  if (state.isDemo) {
    // Charger preset confortable par défaut en démo
    loadPreset('confortable');
    var btnConf = document.querySelector('[data-preset="confortable"]');
    if (btnConf) btnConf.classList.add('active');
  } else {
    initEffectifJour();
    renderSalles();
    renderGroupes();
  }
  renderConfig(); renderIncompat(); renderHero(null); initListeners();
  loadChirPauseConfig();
  renderConfig(); // re-render avec la persistence
  renderSavedConfigs();

  // Auto-run en démo
  if (state.isDemo && Engine) {
    syncConfig();
    var pref = state.incompatChir.map(function (ic) { return { chirurgienId: ic.chirId, agentId: ic.agentId, poste: 'instru', accepte: ic.avis === 'ok' }; });
    var plan = Engine.calculerPlan(state.effectifJour, state.config, state.competences, pref);
    renderDiagnostic(plan.diagnostic); renderPlan(plan); renderTimeline(plan);
  }
});

/* ================================================================
   CONFIGS SAUVEGARDEES (localStorage)
   ================================================================ */
var STORAGE_KEY = 'rempla_saved_configs';
var CHIR_PAUSE_KEY = 'rempla_chir_pause';

function saveChirPauseConfig() {
  var map = {};
  state.chirurgiens.forEach(function (c) { if (c.refusePause) map[c.id] = true; });
  localStorage.setItem(CHIR_PAUSE_KEY, JSON.stringify(map));
}

function loadChirPauseConfig() {
  try {
    var map = JSON.parse(localStorage.getItem(CHIR_PAUSE_KEY));
    if (map) {
      state.chirurgiens.forEach(function (c) { c.refusePause = !!map[c.id]; });
    }
  } catch(e) { /* ignore */ }
}

function getSavedConfigs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}

function renderSavedConfigs() {
  var list = document.getElementById('savedConfigsList');
  if (!list) return;
  var configs = getSavedConfigs();
  if (configs.length === 0) { list.innerHTML = '<span class="small text-muted">Aucune</span>'; return; }
  list.innerHTML = configs.map(function (c, i) {
    return '<span class="rempla-saved-btn" data-action="load-config" data-idx="' + i + '">' +
      '<i class="bi bi-calendar-date"></i>' + escHtml(c.nom) +
      '<span class="rempla-saved-del" data-action="del-config" data-idx="' + i + '"><i class="bi bi-x"></i></span></span>';
  }).join('');
}

function saveCurrentConfig() {
  var nom = prompt('Nom de cette journee (ex: Mardi 03 fev)');
  if (!nom) return;
  var configs = getSavedConfigs();
  configs.push({
    nom: nom,
    date: new Date().toISOString(),
    effectif: JSON.parse(JSON.stringify(state.effectifJour)),
    config: JSON.parse(JSON.stringify(state.config))
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  renderSavedConfigs();
  bdbToast('Journee "' + nom + '" enregistree', 'success');
}

function loadSavedConfig(idx) {
  var configs = getSavedConfigs();
  var c = configs[idx];
  if (!c) return;
  state.effectifJour = c.effectif;
  if (c.config) {
    state.config = c.config;
    document.getElementById('cfgDureePause').value = c.config.dureePause || 30;
    document.getElementById('cfgNomDebut').value = c.config.creneauNominal ? c.config.creneauNominal.debut : '12:00';
    document.getElementById('cfgNomFin').value = c.config.creneauNominal ? c.config.creneauNominal.fin : '13:00';
    document.getElementById('cfgDegDebut').value = c.config.creneauDegrade ? c.config.creneauDegrade.debut : '11:30';
    document.getElementById('cfgDegFin').value = c.config.creneauDegrade ? c.config.creneauDegrade.fin : '13:30';
  }
  renderSalles(); renderGroupes(); renderHero(null);
  // Auto-run
  syncConfig();
  var pref = state.incompatChir.map(function (ic) { return { chirurgienId: ic.chirId, agentId: ic.agentId, poste: 'instru', accepte: ic.avis === 'ok' }; });
  var plan = Engine.calculerPlan(state.effectifJour, state.config, state.competences, pref);
  renderDiagnostic(plan.diagnostic); renderPlan(plan); renderTimeline(plan);
  document.querySelectorAll('.rempla-preset').forEach(function (b) { b.classList.remove('active'); });
  bdbToast('Journee "' + c.nom + '" chargee', 'info');
}

function deleteSavedConfig(idx) {
  var configs = getSavedConfigs();
  if (!configs[idx]) return;
  configs.splice(idx, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  renderSavedConfigs();
}
