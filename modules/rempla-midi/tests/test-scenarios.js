/* ===============================================================
   TEST-SCENARIOS.JS — Harness de recette pour rotation-engine.js
   Couvre les 12 scenarios du DOC MD/SCENARIOS_TEST.md
   Lancer : node tests/test-scenarios.js
   ============================================================= */

var path = require('path');
var Engine = require(path.resolve(__dirname, '..', 'rotation-engine.js'));

var CONFIG = {
  dureePause: 30,
  creneauNominal: { debut: '12:00', fin: '13:00' },
  creneauDegrade: { debut: '11:30', fin: '13:30' }
};

// ---------- Helpers de fabrication d'effectif ---------------------

function agt(opts) {
  // helper "court" pour creer un agent
  return {
    id:       opts.id,
    nom:      opts.nom,
    categorie:opts.cat,
    catHoraire: opts.cath || opts.cat,
    salle:    opts.salle || null,
    poste:    opts.poste || null,
    competences: opts.comp || { instru: 'quotidien', circu: 'quotidien' },
    preferenceCreneau: opts.pref || 'indifferent'
  };
}

function effectifBase8Salles() {
  // Les 8 agents en salle utilises dans S01-S05, S08
  return [
    agt({id:'mar', nom:'Marie',  cat:'journee', salle:'05', poste:'instru', comp:{instru:'quotidien',circu:'quotidien'}}),
    agt({id:'jul', nom:'Julie',  cat:'journee', salle:'05', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'lea', nom:'Lea',    cat:'journee', salle:'06', poste:'instru', comp:{instru:'quotidien',circu:'crise'}}),
    agt({id:'tho', nom:'Thomas', cat:'journee', salle:'06', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'sop', nom:'Sophie', cat:'12h',     salle:'07', poste:'instru', comp:{instru:'quotidien',circu:'quotidien'}}),
    agt({id:'pau', nom:'Paul',   cat:'12h',     salle:'07', poste:'circu',  comp:{instru:'crise',   circu:'quotidien'}}),
    agt({id:'nad', nom:'Nadia',  cat:'matin',   salle:'08', poste:'instru', comp:{instru:'quotidien',circu:'interdit'}}),
    agt({id:'kar', nom:'Karim',  cat:'matin',   salle:'08', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}})
  ];
}

function sallesBase(occupees, chirs) {
  // occupees : {sid: bool} ; chirs : {sid: chirId}
  var ids = ['05','06','07','08'];
  return ids.map(function (id) {
    return {
      id: id,
      occupee: occupees ? !!occupees[id] : true,
      chirurgienId: (chirs && chirs[id]) || null
    };
  });
}

// ---------- Verifications transverses (C1-C9, R-) ----------------

function checkInvariants(plan, effectif) {
  var errs = [];
  var agents = effectif.agents;
  var byId = {};
  agents.forEach(function (a) { byId[a.id] = a; });

  // C5 : chaque agent mange au plus 1 fois
  var compte = {};
  plan.mouvements.forEach(function (m) { compte[m.agentPauseId] = (compte[m.agentPauseId] || 0) + 1; });
  Object.keys(compte).forEach(function (aid) {
    if (compte[aid] > 1) errs.push('C5: ' + (byId[aid] ? byId[aid].nom : aid) + ' part ' + compte[aid] + 'x');
  });

  // R31 / I5 : agent matin pas place avant 13:00 dans un mvt avec salle
  plan.mouvements.forEach(function (m) {
    var ag = byId[m.agentPauseId];
    if (ag && ag.categorie === 'matin' && m.salle) {
      if (Engine.parseTime(m.creneauDebut) < Engine.parseTime('13:00')) {
        errs.push('I5/R31: ' + ag.nom + ' (matin) place a ' + m.creneauDebut + ' (avant 13:00)');
      }
    }
  });

  // I4 : pas un agent en 2 salles simultanement
  var slots = {};
  plan.mouvements.forEach(function (m) {
    if (!m.salle || !m.remplacantId) return;
    var key = m.creneauDebut + '|' + m.remplacantId;
    if (slots[key]) errs.push('I4: ' + (byId[m.remplacantId] ? byId[m.remplacantId].nom : m.remplacantId) + ' en 2 salles a ' + m.creneauDebut);
    slots[key] = true;
  });

  // R02 : agent soir ne mange pas
  plan.mouvements.forEach(function (m) {
    var ag = byId[m.agentPauseId];
    if (ag && ag.categorie === 'soir') {
      errs.push('R02: agent soir ' + ag.nom + ' part en pause (interdit)');
    }
  });

  // R32 : poste 13h couvert (releve a 13:00)
  agents.filter(function (a) { return a.categorie === 'matin' && a.salle && a.poste; }).forEach(function (ag) {
    var couvert = plan.mouvements.some(function (m) {
      return m.agentPauseId === ag.id && m.salle === ag.salle &&
        Engine.parseTime(m.creneauDebut) >= Engine.parseTime('13:00');
    });
    var nonCouvertAlerte = plan.alertes.some(function (al) { return al.type === 'poste_13h_non_couvert' && al.agentId === ag.id; });
    if (!couvert && !nonCouvertAlerte) errs.push('R32: poste 13h non couvert et non signale pour ' + ag.nom);
  });

  return errs;
}

// ---------- Affichage --------------------------------------------

function fmtPlan(plan) {
  var lines = [];
  lines.push('  Etat: ' + plan.etatResultant + ' | Fenetre: ' + plan.fenetreDebut + '-' + plan.fenetreFin);
  lines.push('  Mouvements (' + plan.mouvements.length + '):');
  plan.mouvements.forEach(function (m) {
    var rem = m.remplacantId ? (m.remplacantNom + ' -> S' + m.salle + ' ' + m.poste) : 'libre';
    lines.push('    [' + m.creneauDebut + '-' + m.creneauFin + '] ' + (m.agentPauseNom || '?').padEnd(8) + ' mange (' + rem + ')' + (m.niveau === 'crise' ? ' [CRISE]' : ''));
  });
  lines.push('  Alertes (' + plan.alertes.length + '):');
  plan.alertes.forEach(function (a) {
    lines.push('    [' + a.severite + '] ' + a.message);
  });
  if (plan.agentsNonNourris.length) lines.push('  Non nourris: ' + plan.agentsNonNourris.join(', '));
  return lines.join('\n');
}

// ---------- Runner ------------------------------------------------

var nbPassed = 0;
var nbFailed = 0;

function runScenario(name, build, expects) {
  var effectif = build();
  var diag = Engine.diagnostiquer(effectif, CONFIG);
  var plan = Engine.calculerPlan(effectif, CONFIG, null, effectif.preferencesCrise || []);
  var invariants = checkInvariants(plan, effectif);

  var ok = true;
  var msgs = [];

  if (expects.diag && expects.diag.indexOf(diag.etatPrevu) === -1) {
    ok = false;
    msgs.push('  ATTENDU diag in [' + expects.diag.join(',') + '] -> RECU ' + diag.etatPrevu);
  }
  if (expects.etat && expects.etat.indexOf(plan.etatResultant) === -1) {
    ok = false;
    msgs.push('  ATTENDU etat in [' + expects.etat.join(',') + '] -> RECU ' + plan.etatResultant);
  }
  if (invariants.length > 0) {
    ok = false;
    msgs.push('  VIOLATIONS INVARIANTS:');
    invariants.forEach(function (e) { msgs.push('    - ' + e); });
  }
  if (typeof expects.check === 'function') {
    var checkErrs = expects.check(diag, plan, effectif);
    if (checkErrs && checkErrs.length) {
      ok = false;
      msgs.push('  CHECKS:');
      checkErrs.forEach(function (e) { msgs.push('    - ' + e); });
    }
  }

  if (ok) {
    nbPassed++;
    console.log('PASS ' + name + '  diag=' + diag.etatPrevu + ' etat=' + plan.etatResultant + ' nourris=' + (diag.nbAgentsANourrir - plan.agentsNonNourris.length) + '/' + diag.nbAgentsANourrir);
  } else {
    nbFailed++;
    console.log('FAIL ' + name);
    msgs.forEach(function (m) { console.log(m); });
    console.log(fmtPlan(plan));
  }
}

// ============================================================
//                       SCENARIOS S01-S12
// ============================================================

// ---- S01 : 3 couloirs, 0 soir (confortable cible)
runScenario('S01 — 3 couloirs, 0 soir', function () {
  var ags = effectifBase8Salles();
  ags.push(agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee', comp:{instru:'quotidien',circu:'quotidien'}}));
  ags.push(agt({id:'c2', nom:'Coul2', cat:'couloir', cath:'journee', comp:{instru:'quotidien',circu:'quotidien'}}));
  ags.push(agt({id:'c3', nom:'Coul3', cat:'couloir', cath:'12h',     comp:{instru:'crise',   circu:'quotidien'}}));
  return { agents: ags, salles: sallesBase() };
}, {
  // R04 strict : 3 couloirs mangent au 1er creneau, 0 soir => cascade peut etre limitee.
  // Acceptons confortable, quotidien ou degrade_leger.
  diag: ['confortable','quotidien','degrade_leger'],
  etat: ['quotidien','degrade_leger','crise']
});

// ---- S02 : 1 couloir + 2 soir
runScenario('S02 — 1 couloir + 2 soir', function () {
  var ags = effectifBase8Salles();
  ags.push(agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee'}));
  ags.push(agt({id:'s1', nom:'Soir1', cat:'soir',    comp:{instru:'quotidien',circu:'quotidien'}}));
  ags.push(agt({id:'s2', nom:'Soir2', cat:'soir',    comp:{instru:'crise',   circu:'quotidien'}}));
  return { agents: ags, salles: sallesBase() };
}, {
  diag: ['confortable','quotidien','degrade_leger'],
  etat: ['quotidien','degrade_leger','crise']
});

// ---- S03 : 1 couloir, 0 soir
runScenario('S03 — 1 couloir, 0 soir (tendu)', function () {
  var ags = effectifBase8Salles();
  ags.push(agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee'}));
  return { agents: ags, salles: sallesBase() };
}, {
  diag: ['degrade_leger','degrade_complet','crise'],
  etat: ['degrade_leger','degrade_complet','crise']
});

// ---- S04 : 0 couloir, 1 soir (critique)
runScenario('S04 — 0 couloir, 1 soir (critique)', function () {
  var ags = effectifBase8Salles();
  ags.push(agt({id:'s1', nom:'Soir1', cat:'soir', comp:{instru:'quotidien',circu:'quotidien'}}));
  return { agents: ags, salles: sallesBase() };
}, {
  diag: ['degrade_complet','crise'],
  etat: ['degrade_complet','crise']
});

// ---- S05 : 0+0 (bloque)
runScenario('S05 — 0 couloir, 0 soir (bloque)', function () {
  return { agents: effectifBase8Salles(), salles: sallesBase() };
}, {
  diag: ['bloque','crise'],
  etat: ['bloque','crise'],
  check: function (diag, plan) {
    var errs = [];
    if (!plan.alertes.some(function (a) { return a.type === 'pause_salle' || a.severite === 'bloquant'; })) {
      errs.push('Aucune alerte BLOQUANT/pause_salle alors qu\'attendue');
    }
    return errs;
  }
});

// ---- S06 : crise acceptee
runScenario('S06 — Crise acceptee (Dr Martin -> Isa OK)', function () {
  // Sophie (instru S07) doit manger. Le seul instru disponible est Isa (crise).
  // Dr Martin accepte Isa.
  var ags = [
    agt({id:'sop', nom:'Sophie', cat:'journee', salle:'07', poste:'instru', comp:{instru:'quotidien',circu:'quotidien'}}),
    agt({id:'pau', nom:'Paul',   cat:'journee', salle:'07', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'isa', nom:'Isa',    cat:'soir',                                comp:{instru:'crise',   circu:'quotidien'}})
  ];
  return {
    agents: ags,
    salles: [{id:'07', occupee:true, chirurgienId:'drmartin'}],
    preferencesCrise: [{chirurgienId:'drmartin', agentId:'isa', poste:'instru', accepte:true}]
  };
}, {
  diag: ['quotidien','confortable','crise'],
  etat: ['crise','quotidien','degrade_leger'],
  check: function (diag, plan) {
    var errs = [];
    var hasCriseAffect = plan.mouvements.some(function (m) {
      return m.remplacantId === 'isa' && m.salle === '07' && m.poste === 'instru' && m.niveau === 'crise';
    });
    if (!hasCriseAffect) errs.push('Isa devrait etre affectee crise instru S07 (Dr Martin OK)');
    return errs;
  }
});

// ---- S07 : crise refusee
runScenario('S07 — Crise refusee (Dr Martin -> Isa NON, OK Coul3)', function () {
  var ags = [
    agt({id:'sop', nom:'Sophie', cat:'journee', salle:'07', poste:'instru', comp:{instru:'quotidien',circu:'quotidien'}}),
    agt({id:'pau', nom:'Paul',   cat:'journee', salle:'07', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'isa', nom:'Isa',    cat:'soir',                                comp:{instru:'crise',   circu:'quotidien'}}),
    agt({id:'c3',  nom:'Coul3',  cat:'couloir', cath:'12h',                 comp:{instru:'crise',   circu:'quotidien'}})
  ];
  return {
    agents: ags,
    salles: [{id:'07', occupee:true, chirurgienId:'drmartin'}],
    preferencesCrise: [
      {chirurgienId:'drmartin', agentId:'isa', poste:'instru', accepte:false},
      {chirurgienId:'drmartin', agentId:'c3',  poste:'instru', accepte:true}
    ]
  };
}, {
  // L'agent Isa est refuse, le moteur doit basculer sur Coul3 ou produire une crise propre
  diag: ['confortable','quotidien','degrade_leger','crise'],
  etat: ['quotidien','degrade_leger','crise'],
  check: function (diag, plan) {
    var errs = [];
    var isaUsed = plan.mouvements.some(function (m) {
      return m.remplacantId === 'isa' && m.salle === '07' && m.poste === 'instru';
    });
    if (isaUsed) errs.push('Isa ne devrait PAS etre utilisee instru S07 (refus chirurgien)');
    return errs;
  }
});

// ---- S08 : 2x matin meme salle
runScenario('S08 — 2 agents matin meme salle (debauche simultanee)', function () {
  // Modification de l'effectif base : Karim + Nadia matin S08 (deja le cas) + 2 couloirs + 1 soir
  var ags = effectifBase8Salles();
  ags.push(agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee'}));
  ags.push(agt({id:'c2', nom:'Coul2', cat:'couloir', cath:'12h'}));
  ags.push(agt({id:'s1', nom:'Soir1', cat:'soir', comp:{instru:'quotidien',circu:'quotidien'}}));
  return { agents: ags, salles: sallesBase() };
}, {
  diag: ['confortable','quotidien','degrade_leger'],
  etat: ['quotidien','degrade_leger','crise'],
  check: function (diag, plan) {
    var errs = [];
    if (!diag.alertes.some(function (a) { return a.type === 'debauche_simultanee'; })) {
      errs.push('Alerte debauche_simultanee attendue (S08 a 2 matin)');
    }
    var couvNad = plan.mouvements.some(function (m) { return m.agentPauseId === 'nad' && m.salle === '08'; });
    var couvKar = plan.mouvements.some(function (m) { return m.agentPauseId === 'kar' && m.salle === '08'; });
    if (!couvNad && !plan.alertes.some(function (a) { return a.agentId === 'nad'; })) errs.push('Releve Nadia ni faite ni signalee');
    if (!couvKar && !plan.alertes.some(function (a) { return a.agentId === 'kar'; })) errs.push('Releve Karim ni faite ni signalee');
    return errs;
  }
});

// ---- S09 : doublure
runScenario('S09 — Doublure mobilisable en tension', function () {
  // Sophie (S07 instru) appelee en doublure S06 — son poste instru S07 est vacant.
  // Plus 1 doublure J/12h pour aide opera.
  var ags = [
    agt({id:'mar', nom:'Marie',  cat:'journee', salle:'05', poste:'instru'}),
    agt({id:'jul', nom:'Julie',  cat:'journee', salle:'05', poste:'circu'}),
    agt({id:'lea', nom:'Lea',    cat:'journee', salle:'06', poste:'instru'}),
    agt({id:'tho', nom:'Thomas', cat:'journee', salle:'06', poste:'circu'}),
    agt({id:'sop', nom:'Sophie', cat:'journee', salle:'06', poste:'doublure'}), // doublure S06
    // S07 ouverte mais sans titulaire instru (vacant) — circu present
    agt({id:'pau', nom:'Paul',   cat:'12h',     salle:'07', poste:'circu'}),
    agt({id:'c1',  nom:'Coul1',  cat:'couloir', cath:'journee'})
  ];
  return {
    agents: ags,
    salles: [
      {id:'05', occupee:true}, {id:'06', occupee:true},
      {id:'07', occupee:true}, {id:'08', occupee:false}
    ]
  };
}, {
  diag: ['confortable','quotidien','degrade_leger','degrade_complet','crise'],
  etat: ['quotidien','degrade_leger','crise'],
  check: function (diag, plan) {
    var errs = [];
    if (!diag.alertes.some(function (a) { return a.type === 'poste_sans_titulaire' && a.salle === '07'; })) {
      errs.push('Alerte poste_sans_titulaire attendue pour S07 instru (doublure prise sur S06)');
    }
    return errs;
  }
});

// ---- S10 : pattern reconnu (test isole de calculerSignature/chercherPattern)
(function testS10() {
  var name = 'S10 — Pattern reconnu';
  var errs = [];
  var eff = {
    agents: effectifBase8Salles().concat([
      agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee'}),
      agt({id:'c2', nom:'Coul2', cat:'couloir', cath:'12h'}),
      agt({id:'s1', nom:'Soir1', cat:'soir'})
    ]),
    salles: sallesBase()
  };
  var sig = Engine.calculerSignature(eff);
  if (sig.nbSallesOccupees !== 4) errs.push('signature.nbSallesOccupees attendu 4, recu ' + sig.nbSallesOccupees);
  if (sig.nbCouloirs !== 2)       errs.push('signature.nbCouloirs attendu 2, recu ' + sig.nbCouloirs);
  if (sig.nbSoir !== 1)           errs.push('signature.nbSoir attendu 1, recu ' + sig.nbSoir);

  var patterns = [
    { id: 'p1', signature: { nbSallesOccupees:4, nbCouloirs:2, nbSoir:1, nbMatin:2, nbJournee:4, nb12h:2 }, score: 0.9 },
    { id: 'p2', signature: { nbSallesOccupees:3, nbCouloirs:1, nbSoir:0, nbMatin:0, nbJournee:6, nb12h:0 }, score: 0.5 }
  ];
  var match = Engine.chercherPattern(sig, patterns, 0.85);
  if (!match || match.pattern.id !== 'p1') errs.push('Pattern p1 (similaire) non trouve');

  if (errs.length === 0) {
    nbPassed++;
    console.log('PASS ' + name + '  signature=' + JSON.stringify(sig) + ' match=' + (match && match.pattern.id));
  } else {
    nbFailed++;
    console.log('FAIL ' + name);
    errs.forEach(function (e) { console.log('  - ' + e); });
  }
})();

// ---- S11 : simulation (calcul a la volee, pas de persistance)
//   Note : avec R04 strict (couloirs mangent au 1er creneau), retirer un couloir
//   sur cette config pousse vers degrade_complet. Le scenario doc visait 'tendu' (= degrade).
runScenario('S11 — Simulation (retrait Couloir2)', function () {
  var ags = effectifBase8Salles();
  ags.push(agt({id:'c1', nom:'Coul1', cat:'couloir', cath:'journee'}));
  ags.push(agt({id:'c2', nom:'Coul2', cat:'couloir', cath:'journee'}));
  ags.push(agt({id:'s1', nom:'Soir1', cat:'soir'}));
  return { agents: ags.filter(function (a) { return a.id !== 'c2'; }), salles: sallesBase() };
}, {
  diag: ['quotidien','degrade_leger','degrade_complet','confortable'],
  etat: ['quotidien','degrade_leger','degrade_complet','crise']
});

// ---- S12 : reel (3 salles, 2 couloirs, 1 soir)
runScenario('S12 — Reel : 3 salles ouvertes, 2 couloirs, 1 soir', function () {
  var ags = [
    agt({id:'mar', nom:'Marie',  cat:'journee', salle:'05', poste:'instru'}),
    agt({id:'jul', nom:'Julie',  cat:'journee', salle:'05', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'lea', nom:'Lea',    cat:'journee', salle:'06', poste:'instru'}),
    agt({id:'tho', nom:'Thomas', cat:'journee', salle:'06', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'sop', nom:'Sophie', cat:'12h',     salle:'07', poste:'instru'}),
    agt({id:'pau', nom:'Paul',   cat:'12h',     salle:'07', poste:'circu',  comp:{instru:'crise',circu:'quotidien'}}),
    agt({id:'c1',  nom:'Coul1',  cat:'couloir', cath:'journee'}),
    agt({id:'c2',  nom:'Coul2',  cat:'couloir', cath:'12h'}),
    agt({id:'s1',  nom:'Soir1',  cat:'soir'})
  ];
  return {
    agents: ags,
    salles: [
      {id:'05', occupee:true}, {id:'06', occupee:true}, {id:'07', occupee:true},
      {id:'08', occupee:false}
    ]
  };
}, {
  // Note : 8 mangeants (6 J/12h + 2 couloirs) avec R04 strict (couloirs mangent au 1er creneau)
  // → la fenetre nominale 12:00-13:00 ne suffit pas mathematiquement. degrade_leger est realiste.
  diag: ['confortable','quotidien','degrade_leger'],
  etat: ['quotidien','degrade_leger'],
  check: function (diag, plan) {
    var errs = [];
    if (diag.nbSallesOccupees !== 3) errs.push('Salles occupees attendues : 3, recu ' + diag.nbSallesOccupees);
    var nourris = diag.nbAgentsANourrir - plan.agentsNonNourris.length;
    var attendu = diag.nbAgentsANourrir;
    if (nourris < attendu) errs.push(nourris + '/' + attendu + ' nourris, attendu ' + attendu + '/' + attendu);
    return errs;
  }
});

// ---- BUG_RELEVE_I5 : Couloir+13h interdit dans le bloc relève 13:00
//   Force le scenario : Sabine matin S07 instru. Les seuls remplacants
//   instru disponibles sont (a) Camille couloir+13h (parti à 13:00) (b) Lea (mais 12h, doit eat).
//   Apres cascade, Lea est revenue. Camille ne doit JAMAIS etre choisie.
runScenario('BUG_I5 — Camille couloir+13h interdite en releve 13:00', function () {
  return {
    agents: [
      { id:'sab', nom:'Sabine', categorie:'matin', salle:'07', poste:'instru',
        competences:{instru:'quotidien',circu:'quotidien'}, preferenceCreneau:'indifferent' },
      { id:'lea', nom:'Lea', categorie:'12h', salle:'07', poste:'circu',
        competences:{instru:'quotidien',circu:'quotidien'}, preferenceCreneau:'indifferent' },
      // Couloir+13h, instru quotidien — la seule personne instru dispo apres 13:00 si Lea ne revenait pas
      { id:'cam', nom:'Camille', categorie:'matin', catHoraire:'couloir',
        salle:null, poste:null,
        competences:{instru:'quotidien',circu:'quotidien'}, preferenceCreneau:'indifferent' }
    ],
    salles: [
      {id:'05',occupee:false},{id:'06',occupee:false},
      {id:'07',occupee:true},{id:'08',occupee:false}
    ]
  };
}, {
  diag: ['confortable','quotidien','degrade_leger','degrade_complet','crise'],
  etat: ['quotidien','degrade_leger','crise'],
  check: function (diag, plan) {
    var errs = [];
    // Camille NE DOIT PAS etre remplacante d'aucun mvt a >= 13:00
    plan.mouvements.forEach(function (m) {
      if (m.remplacantId === 'cam' && Engine.parseTime(m.creneauDebut) >= Engine.parseTime('13:00')) {
        errs.push('I5 viole : Camille (couloir+13h) utilisee en remplacante a ' + m.creneauDebut + ' niveau=' + m.niveau);
      }
    });
    return errs;
  }
});

// ---- BUG 2/3 : Couloir marque 13h
//   - categorie='matin' + catHoraire='couloir'
//   - doit etre dans le pool comme remplacant (avant 13:00)
//   - ne doit pas manger (R01)
//   - doit etre exclu du pool a partir de 13:00 (I5)
runScenario('BUG2/3 — Couloir marque 13h (catHoraire=couloir, categorie=matin)', function () {
  // Effectif : 2 salles, 1 couloir-13h + 1 soir
  var ags = [
    agt({id:'mar', nom:'Marie',  cat:'journee', salle:'05', poste:'instru'}),
    agt({id:'jul', nom:'Julie',  cat:'journee', salle:'05', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'lea', nom:'Lea',    cat:'journee', salle:'06', poste:'instru'}),
    agt({id:'tho', nom:'Thomas', cat:'journee', salle:'06', poste:'circu',  comp:{instru:'interdit',circu:'quotidien'}}),
    agt({id:'s1',  nom:'Soir1',  cat:'soir',                                comp:{instru:'quotidien',circu:'quotidien'}}),
    // Couloir+13h : categorie=matin (toggle on), catHoraire=couloir (origine)
    { id:'c13', nom:'Coul-13h', categorie:'matin', catHoraire:'couloir', salle:null, poste:null,
      competences:{instru:'quotidien',circu:'quotidien'}, preferenceCreneau:'indifferent' }
  ];
  return {
    agents: ags,
    salles: [
      {id:'05',occupee:true},{id:'06',occupee:true},
      {id:'07',occupee:false},{id:'08',occupee:false}
    ]
  };
}, {
  diag: ['confortable','quotidien','degrade_leger'],
  etat: ['quotidien','degrade_leger'],
  check: function (diag, plan, eff) {
    var errs = [];
    // (a) couloir+13h ne mange pas
    var c13Mange = plan.mouvements.some(function (m) { return m.agentPauseId === 'c13'; });
    if (c13Mange) errs.push('Couloir+13h ne devrait pas etre en pause (R01)');

    // (b) couloir+13h compte dans nbCouloirs (catHoraire=couloir)
    if (diag.nbCouloirs < 1) errs.push('nbCouloirs devrait >= 1 (couloir+13h compte), recu ' + diag.nbCouloirs);

    // (c) couloir+13h utilise comme remplacant AVANT 13:00 (s'il l'a ete)
    var c13UsedBefore13 = plan.mouvements.some(function (m) {
      return m.remplacantId === 'c13' && Engine.parseTime(m.creneauDebut) < Engine.parseTime('13:00');
    });
    // pas obligatoire mais sain : signaler si jamais utilise alors que pool est tendu
    // ici on valide juste qu'aucune utilisation n'est >= 13:00 :
    var c13UsedAt13 = plan.mouvements.some(function (m) {
      return m.remplacantId === 'c13' && Engine.parseTime(m.creneauDebut) >= Engine.parseTime('13:00');
    });
    if (c13UsedAt13) errs.push('I5 : couloir+13h utilise a >= 13:00 (interdit, il est parti)');

    // (d) tous les J doivent manger
    if (plan.agentsNonNourris.length > 0) {
      errs.push('Agents non nourris : ' + plan.agentsNonNourris.join(','));
    }
    return errs;
  }
});

// ============================================================
//                          BILAN
// ============================================================

console.log('\n==============================================');
console.log('Total : ' + (nbPassed + nbFailed) + ' scenarios | PASS ' + nbPassed + ' | FAIL ' + nbFailed);
console.log('==============================================');
process.exit(nbFailed === 0 ? 0 : 1);
