/* ===============================================================
   ROTATION-ENGINE.JS — Moteur de rotation repas bloc ortho-neuro
   Des Blocs & Moi — Module rempla-midi

   Logique pure. Zero DOM. Zero Supabase.
   Conforme : DOC MD/REGLES_REMPLA_MIDI.md V4
     - 32 regles auditables R01-R32
     - 9 contraintes dures C1-C9
     - 6 invariants cascade I1-I6

   Faits cles :
     - Soir arrivent a 12:00 (PAS AVANT) - injectes au pool a t>=12:00
     - Couloirs mangent au 1er creneau de la fenetre (R04 / R18)
     - Agents 13h partent a 13:00 et leur poste est releve (R31, R32, C4)
     - Cascade : remplacant initial reste, titulaire revenu cascade (R07, R27, I1-I3)
     - Quotidien d'abord, crise en dernier recours (R21, R12)

   Refonte session #115b - 2026-05-10
   ============================================================= */

var RotationEngine = (function () {
  'use strict';

  // ---------- CONSTANTES -----------------------------------------

  var DUREE_PAUSE = 30;

  var ETATS = {
    CONFORTABLE:     'confortable',
    QUOTIDIEN:       'quotidien',
    DEGRADE_LEGER:   'degrade_leger',
    DEGRADE_COMPLET: 'degrade_complet',
    CRISE:           'crise',
    BLOQUE:          'bloque'
  };

  var NIVEAUX = {
    QUOTIDIEN: 'quotidien',
    CRISE:     'crise',
    INTERDIT:  'interdit'
  };

  var CATEGORIES = {
    MATIN:    'matin',
    JOURNEE:  'journee',
    DOUZE_H:  '12h',
    SOIR:     'soir',
    COULOIR:  'couloir'
  };

  var SEVERITES = {
    INFO:     'info',
    WARNING:  'warning',
    CRISE:    'crise',
    BLOQUANT: 'bloquant'
  };

  // ---------- TEMPS -----------------------------------------------

  function parseTime(str) {
    var p = str.split(':').map(Number);
    return p[0] * 60 + p[1];
  }

  function formatTime(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  function genererCreneaux(debut, fin) {
    var d = parseTime(debut);
    var f = parseTime(fin);
    var out = [];
    for (var t = d; t + DUREE_PAUSE <= f; t += DUREE_PAUSE) {
      out.push({
        debut:    formatTime(t),
        fin:      formatTime(t + DUREE_PAUSE),
        debutMin: t,
        finMin:   t + DUREE_PAUSE
      });
    }
    return out;
  }

  // ---------- CLASSIFICATION AGENT -------------------------------

  function _catHoraire(a) {
    return a.catHoraire || a.categorieHoraire || a.categorie;
  }

  function _aPosteSalle(a) {
    return !!a.salle && !!a.poste && a.poste !== 'doublure';
  }

  function _estDoublure(a) {
    return a.poste === 'doublure';
  }

  /**
   * Bug 2 fix : un couloir reste un couloir meme s'il est marque 13h
   * (toggle 13h modifie categorie='matin' mais conserve catHoraire='couloir').
   * Le filtre couloir doit donc s'appuyer sur catHoraire.
   */
  function _estCouloir(a) {
    return a.categorie === CATEGORIES.COULOIR || _catHoraire(a) === CATEGORIES.COULOIR;
  }

  /** R01-R05 : qui doit manger dans le creneau ? */
  function _doitManger(a) {
    if (a.categorie === CATEGORIES.MATIN) return false;     // R01 (prioritaire sur tout)
    if (a.categorie === CATEGORIES.SOIR)  return false;     // R02
    var ch = _catHoraire(a);
    if (_estDoublure(a)) {
      // R05 : doublure 13h ne mange pas. Doublure soir non plus.
      if (ch === CATEGORIES.MATIN || ch === CATEGORIES.SOIR) return false;
      return true;
    }
    if (_estCouloir(a)) {
      // Couloir+soir : a deja mange
      if (ch === CATEGORIES.SOIR) return false;
      return true;                                          // R04
    }
    return true;                                            // R03 : J/12h
  }

  /** Salles avec personnel ou explicitement occupees, hors fermees */
  function _sallesActives(salles, agents) {
    var sidsAvecAgent = {};
    agents.forEach(function (a) {
      if (a.salle && a.poste && a.poste !== 'doublure') sidsAvecAgent[a.salle] = true;
    });
    return salles.filter(function (s) {
      if (s.occupee === false) return false;
      return s.occupee === true || sidsAvecAgent[s.id] === true;
    });
  }

  // ---------- COMPETENCES & REMPLACEMENT --------------------------

  function _niveauComp(competences, agentId, poste) {
    var c = competences[agentId];
    if (!c) return NIVEAUX.INTERDIT;                        // R14 par defaut
    return c[poste] || NIVEAUX.INTERDIT;
  }

  /**
   * R12, R13, R14 + accord chirurgien crise
   * @returns {false | {niveau}} false si interdit, sinon niveau effectif
   */
  function _peutTenirPoste(agent, poste, chirurgienId, competences, prefsCrise, niveauMaxAcceptable) {
    var niv = _niveauComp(competences, agent.id, poste);

    // R13 : un instru sait toujours circuler
    if (poste === 'circu' && niv === NIVEAUX.INTERDIT) {
      var ni = _niveauComp(competences, agent.id, 'instru');
      if (ni === NIVEAUX.QUOTIDIEN || ni === NIVEAUX.CRISE) niv = NIVEAUX.QUOTIDIEN;
    }

    if (niv === NIVEAUX.INTERDIT) return false;             // R14
    if (niveauMaxAcceptable === NIVEAUX.QUOTIDIEN && niv !== NIVEAUX.QUOTIDIEN) return false;

    // R12 : crise instru = accord chirurgien obligatoire
    if (niv === NIVEAUX.CRISE && poste === 'instru' && chirurgienId) {
      var pref = (prefsCrise || []).find(function (p) {
        return p.chirurgienId === chirurgienId && p.agentId === agent.id && p.poste === 'instru';
      });
      if (pref && pref.accepte === false) return false;
    }

    return { niveau: niv };
  }

  /**
   * R21 : tenter quotidien d'abord, crise en dernier recours.
   * I5 : un agent matin ne peut pas etre place a partir de 13:00 (il est parti).
   */
  function _trouverRemplacant(pool, poste, chirurgienId, competences, prefsCrise, slotMinutes) {
    var slot13h = parseTime('13:00');
    var slotApres13h = (typeof slotMinutes === 'number') && slotMinutes >= slot13h;
    var i, can;
    for (i = 0; i < pool.length; i++) {
      if (slotApres13h && pool[i].categorie === CATEGORIES.MATIN) continue;
      can = _peutTenirPoste(pool[i], poste, chirurgienId, competences, prefsCrise, NIVEAUX.QUOTIDIEN);
      if (can) return { agent: pool[i], niveau: can.niveau };
    }
    for (i = 0; i < pool.length; i++) {
      if (slotApres13h && pool[i].categorie === CATEGORIES.MATIN) continue;
      can = _peutTenirPoste(pool[i], poste, chirurgienId, competences, prefsCrise, NIVEAUX.CRISE);
      if (can) return { agent: pool[i], niveau: can.niveau };
    }
    return null;
  }

  // ---------- ESTIMATION CAPACITE (heuristique diagnostic) -------

  /**
   * Simule la capacite de pauses dans une fenetre, en respectant :
   *   - Soir injectes a 12:00 seulement
   *   - Couloirs mangent au 1er creneau (R04)
   *   - Recirculation : titulaires revenus rejoignent le pool
   * Retourne le nombre maximum d'agents nourris.
   */
  function _estimerCapaciteNourris(agents, creneaux) {
    var couloirs = agents.filter(function (a) {
      return _estCouloir(a) && _doitManger(a);
    });
    // Couloirs sans pause (couloir+soir, couloir+13h) : remplacants initiaux
    var couloirsRemplCount = agents.filter(function (a) {
      return _estCouloir(a) && !_doitManger(a);
    }).length;
    var soir = agents.filter(function (a) { return a.categorie === CATEGORIES.SOIR; });
    var titulaires = agents.filter(function (a) { return _aPosteSalle(a) && _doitManger(a); });

    var pool = couloirsRemplCount; // dispo des le 1er creneau
    var restantTit = titulaires.length;
    var nourris = 0;
    var couloirsAManger = couloirs.length;
    var soirInjecte = false;
    var retours = {}; // idx -> nb d'agents qui reviennent

    creneaux.forEach(function (cr, idx) {
      // Soir a 12:00
      if (!soirInjecte && cr.debutMin >= parseTime('12:00')) {
        pool += soir.length;
        soirInjecte = true;
      }
      // Retours
      if (retours[idx]) pool += retours[idx];

      // 1er creneau : couloirs mangent (libre)
      if (idx === 0 && couloirsAManger > 0) {
        nourris += couloirsAManger;
        retours[idx + 1] = (retours[idx + 1] || 0) + couloirsAManger;
        couloirsAManger = 0;
      }

      // Cascade : pool consomme pour faire manger des titulaires
      var couvre = Math.min(pool, restantTit);
      nourris += couvre;
      restantTit -= couvre;
      retours[idx + 1] = (retours[idx + 1] || 0) + couvre;
      pool -= couvre;
    });

    return { nourris: nourris, restantTit: restantTit };
  }

  // ---------- PHASE 1 : DIAGNOSTIC --------------------------------

  function diagnostiquer(effectif, config) {
    var agents = effectif.agents || [];
    var salles = effectif.salles || [];
    var prefsCrise = effectif.preferencesCrise || [];

    // Construire le map de competences depuis les agents (chacun porte les siennes)
    var competences = {};
    agents.forEach(function (a) { competences[a.id] = a.competences || {}; });

    var sallesOcc = _sallesActives(salles, agents);
    var nbPostes = sallesOcc.length * 2;

    // Tri par categorie effective (categorie + catHoraire)
    // Bug 2/3 fix : un couloir+13h (categorie=matin, catHoraire=couloir) compte
    // dans les couloirs (toujours present le matin) ET dans les matin (part a 13h).
    var par = { matin: [], journee: [], '12h': [], soir: [], couloir: [] };
    agents.forEach(function (a) {
      if (par[a.categorie]) par[a.categorie].push(a);
      // Couloir reconnu par catHoraire si categorie a ete forcee a 'matin' (toggle 13h)
      if (a.categorie !== CATEGORIES.COULOIR && _catHoraire(a) === CATEGORIES.COULOIR) {
        par.couloir.push(a);
      }
    });

    var doiventManger = agents.filter(_doitManger);
    var titulairesAManger = doiventManger.filter(_aPosteSalle);
    var couloirsMangeants = par.couloir.filter(_doitManger);
    var matinPostes = par.matin.filter(_aPosteSalle);
    var doublures = agents.filter(_estDoublure);
    var totalRempl = par.soir.length + par.couloir.length;

    // Capacites estimees (R17 : degradation progressive)
    var fenNom     = genererCreneaux(config.creneauNominal.debut, config.creneauNominal.fin);
    var fenLeger   = genererCreneaux(config.creneauNominal.debut, config.creneauDegrade.fin);
    var fenComplet = genererCreneaux(config.creneauDegrade.debut, config.creneauDegrade.fin);
    var capNom     = _estimerCapaciteNourris(agents, fenNom).nourris;
    var capLeger   = _estimerCapaciteNourris(agents, fenLeger).nourris;
    var capComplet = _estimerCapaciteNourris(agents, fenComplet).nourris;
    var capPlancher = totalRempl * fenNom.length;

    var alertes = [];
    var aNourrir = doiventManger.length;
    var etatPrevu;

    // Qualification de l'etat (du plus favorable au moins)
    if (aNourrir === 0 && titulairesAManger.length === 0) {
      etatPrevu = ETATS.CONFORTABLE;
    } else if (totalRempl === 0 && doublures.length === 0 && titulairesAManger.length > 0) {
      // C9 : 0 couloir + 0 soir = pause de salle de facto
      etatPrevu = ETATS.BLOQUE;
      alertes.push({
        type: 'pause_salle',
        severite: SEVERITES.BLOQUANT,
        message: 'C9 : 0 couloir + 0 soir + 0 doublure mobilisable. Pause de salle inevitable.'
      });
    } else if (capNom >= aNourrir && _tousPostesCouvrables(agents, sallesOcc, competences, prefsCrise)) {
      // R16 : fenetre nominale 12:00-13:00 suffit, tous postes couvrables en quotidien
      etatPrevu = totalRempl >= 2 ? ETATS.CONFORTABLE : ETATS.QUOTIDIEN;
    } else if (capNom >= aNourrir) {
      // Capacite nominale OK mais au moins un poste exige une crise (pas de quotidien dispo)
      // → CRISE plutot que degrader la fenetre inutilement (R12, R21)
      etatPrevu = ETATS.CRISE;
      alertes.push({
        type: 'crise_competence',
        severite: SEVERITES.CRISE,
        message: 'Capacite OK mais affectation crise necessaire (aucun instru quotidien sur un poste).'
      });
    } else if (capLeger >= aNourrir) {
      etatPrevu = ETATS.DEGRADE_LEGER;
      alertes.push({
        type: 'depassement_fenetre',
        severite: SEVERITES.WARNING,
        message: 'R17 : extension fin necessaire (' + config.creneauNominal.debut + '-' + config.creneauDegrade.fin + ').'
      });
    } else if (capComplet >= aNourrir) {
      etatPrevu = ETATS.DEGRADE_COMPLET;
      alertes.push({
        type: 'depassement_fenetre',
        severite: SEVERITES.WARNING,
        message: 'R17 : extension complete necessaire (' + config.creneauDegrade.debut + '-' + config.creneauDegrade.fin + ').'
      });
    } else if (capComplet + doublures.length >= aNourrir) {
      // R09 : doublures mobilisables en tension
      etatPrevu = ETATS.CRISE;
      alertes.push({
        type: 'doublures_mobilisees',
        severite: SEVERITES.CRISE,
        message: doublures.length + ' doublure(s) mobilisable(s). Perte d\'aide operatoire.'
      });
    } else {
      etatPrevu = ETATS.CRISE;
      alertes.push({
        type: 'crise_prevue',
        severite: SEVERITES.CRISE,
        message: 'Capacite insuffisante : ' + aNourrir + ' a nourrir, capacite max ' + (capComplet + doublures.length) + '.'
      });
    }

    // R12 : detection precoce des postes instru sans remplacant quotidien
    var poolPotentiel = par.soir.concat(par.couloir);
    sallesOcc.forEach(function (s) {
      var ti = agents.find(function (a) { return a.salle === s.id && a.poste === 'instru'; });
      if (ti && _doitManger(ti)) {
        var rQuoti = poolPotentiel.find(function (r) {
          return _peutTenirPoste(r, 'instru', s.chirurgienId, competences, prefsCrise, NIVEAUX.QUOTIDIEN);
        });
        if (!rQuoti) {
          var rCrise = poolPotentiel.find(function (r) {
            return _peutTenirPoste(r, 'instru', s.chirurgienId, competences, prefsCrise, NIVEAUX.CRISE);
          });
          if (rCrise) {
            alertes.push({
              type: 'circu_crise',
              severite: SEVERITES.WARNING,
              message: 'Salle ' + s.id + ' instru : aucun instru quotidien dispo. Circu en crise necessaire.',
              salle: s.id
            });
          } else {
            alertes.push({
              type: 'poste_vacant',
              severite: SEVERITES.BLOQUANT,
              message: 'Salle ' + s.id + ' instru : aucun remplacant disponible (meme en crise).',
              salle: s.id
            });
          }
        }
      }
      // R11 : poste sans titulaire dans une salle occupee
      ['instru', 'circu'].forEach(function (poste) {
        var titulaire = agents.find(function (a) { return a.salle === s.id && a.poste === poste; });
        if (!titulaire) {
          alertes.push({
            type: 'poste_sans_titulaire',
            severite: SEVERITES.WARNING,
            message: 'Salle ' + s.id + ' ' + poste + ' : poste vacant des le depart (doublure ou trou).',
            salle: s.id, poste: poste
          });
        }
      });
    });

    // L4 / R32 : 2x matin meme salle = 2 remplacants simultanes a 13:00
    var matinParSalle = {};
    matinPostes.forEach(function (a) {
      matinParSalle[a.salle] = (matinParSalle[a.salle] || 0) + 1;
    });
    Object.keys(matinParSalle).forEach(function (sid) {
      var n = matinParSalle[sid];
      if (n >= 2) {
        alertes.push({
          type: 'debauche_simultanee',
          severite: SEVERITES.WARNING,
          message: 'Salle ' + sid + ' : ' + n + ' agents matin partent a 13:00 simultanement. ' + n + ' remplacants requis.',
          salle: sid
        });
      }
    });

    // R23, R24 : chirurgiens qui refusent la pause de salle
    var chirRefus = config.chirPauseRefus || {};
    sallesOcc.forEach(function (s) {
      if (s.chirurgienId && chirRefus[s.chirurgienId]) {
        var sev = SEVERITES.INFO;
        if (etatPrevu === ETATS.BLOQUE) sev = SEVERITES.BLOQUANT;       // R24
        else if (etatPrevu === ETATS.CRISE) sev = SEVERITES.WARNING;
        alertes.push({
          type: 'chirurgien_refuse_pause',
          severite: sev,
          message: 'Salle ' + s.id + ' : chirurgien refuse la pause de salle.' +
            (sev === SEVERITES.BLOQUANT ? ' Aucune solution sans pause.' : ''),
          salle: s.id,
          chirurgienId: s.chirurgienId
        });
      }
    });

    return {
      etatPrevu:           etatPrevu,
      nbPostes:            nbPostes,
      nbSallesOccupees:    sallesOcc.length,
      nbAgentsANourrir:    aNourrir,
      nbMangeursAvecPoste: titulairesAManger.length,
      nbMangeursSansPoste: aNourrir - titulairesAManger.length,
      nbCouloirs:          par.couloir.length,
      nbSoir:              par.soir.length,
      nbMatin:             matinPostes.length,
      nbRemplacants12h:    totalRempl,
      nbDoublures:         doublures.length,
      capacitePlancher:    capPlancher,
      capaciteNominale:    capNom,
      capaciteDegLeger:    capLeger,
      capaciteDegComplet:  capComplet,
      creneauxNominaux:    fenNom.length,
      creneauxDegLeger:    fenLeger.length,
      creneauxDegComplet:  fenComplet.length,
      doiventManger:       doiventManger.map(function (a) { return a.id; }),
      remplacants12h:      poolPotentiel.map(function (a) { return a.id; }),
      agentsMatin:         matinPostes.map(function (a) { return a.id; }),
      alertes:             alertes
    };
  }

  function _tousPostesCouvrables(agents, sallesOcc, competences, prefsCrise) {
    var pool = agents.filter(function (a) {
      return a.categorie === CATEGORIES.SOIR || _estCouloir(a);
    });
    var ok = true;
    sallesOcc.forEach(function (s) {
      ['instru', 'circu'].forEach(function (poste) {
        var t = agents.find(function (a) { return a.salle === s.id && a.poste === poste; });
        if (t && _doitManger(t) && _aPosteSalle(t)) {
          var rem = pool.find(function (r) {
            return _peutTenirPoste(r, poste, s.chirurgienId, competences, prefsCrise, NIVEAUX.QUOTIDIEN);
          });
          if (!rem) ok = false;
        }
      });
    });
    return ok;
  }

  // ---------- PHASE 2 : CALCUL DU PLAN ----------------------------

  function calculerPlan(effectif, config, competencesArg, preferencesCrise) {
    var diag = diagnostiquer(effectif, config);
    var agents = effectif.agents || [];
    var salles = effectif.salles || [];
    var prefsCrise = preferencesCrise || effectif.preferencesCrise || [];

    // Carte de competences : argument prioritaire, sinon construite depuis agents
    var competences = competencesArg ? Object.assign({}, competencesArg) : {};
    agents.forEach(function (a) {
      if (!competences[a.id] && a.competences) competences[a.id] = a.competences;
    });

    // ---- Choix de la fenetre (R17)
    var fenetre;
    if (diag.etatPrevu === ETATS.CONFORTABLE || diag.etatPrevu === ETATS.QUOTIDIEN) {
      fenetre = { debut: config.creneauNominal.debut, fin: config.creneauNominal.fin };
    } else if (diag.etatPrevu === ETATS.DEGRADE_LEGER) {
      fenetre = { debut: config.creneauNominal.debut, fin: config.creneauDegrade.fin };
    } else {
      // DEGRADE_COMPLET, CRISE, BLOQUE
      fenetre = { debut: config.creneauDegrade.debut, fin: config.creneauDegrade.fin };
    }

    var creneaux = genererCreneaux(fenetre.debut, fenetre.fin);
    var mouvements = [];
    var alertes = diag.alertes.slice();
    var dejaManges = {};

    // ---- Ordre cascade (R29 : exclure salles terminees)
    var sallesOcc = _sallesActives(salles, agents);
    var sallesTerminees = {};
    salles.forEach(function (s) { if (s.programmeTermine) sallesTerminees[s.id] = true; });

    var ordreCascade = (config.ordreCascade && config.ordreCascade.length)
      ? config.ordreCascade.slice()
      : sallesOcc.map(function (s) { return s.id; }).sort();
    ordreCascade = ordreCascade.filter(function (sid) {
      if (sallesTerminees[sid]) return false;
      return agents.some(function (a) { return a.salle === sid && _aPosteSalle(a); });
    });

    // ---- Identifier les agents par role
    // Bug 2/3 fix : un couloir+13h a categorie='matin' MAIS catHoraire='couloir'.
    // On utilise _estCouloir (regarde categorie OR catHoraire).
    var agentsSoir = agents.filter(function (a) { return a.categorie === CATEGORIES.SOIR; });
    var couloirsMangeants = agents.filter(function (a) {
      return _estCouloir(a) && _doitManger(a);
    });
    var couloirsRempl = agents.filter(function (a) {
      // Couloirs qui ne mangent PAS dans le creneau (couloir+soir, couloir+13h) :
      // disponibles comme remplacants des le debut.
      return _estCouloir(a) && !_doitManger(a);
    });
    // R32 / I5 : agents matin AVEC poste salle = releve a 13:00 obligatoire
    var agentsMatinPostes = agents.filter(function (a) {
      return a.categorie === CATEGORIES.MATIN && _aPosteSalle(a);
    });
    var doublures = agents.filter(_estDoublure);

    // ---- Mangeants libres : doublures J/12h + agents salles terminees (R05, R26, R29)
    var mangeantsLibres = [];
    doublures.forEach(function (d) { if (_doitManger(d)) mangeantsLibres.push(d); });
    salles.forEach(function (s) {
      if (s.programmeTermine) {
        agents.forEach(function (a) {
          if (a.salle === s.id && _aPosteSalle(a) && _doitManger(a)) {
            mangeantsLibres.push(a);
            alertes.push({
              type: 'salle_terminee',
              severite: SEVERITES.INFO,
              message: a.nom + ' (S' + s.id + ') : programme termine, mange avant fermeture self.',
              agentId: a.id, salle: s.id
            });
          }
        });
      }
    });

    // ---- Pool & retours
    var pool = [];
    var retours = {}; // creneauDebut -> [agents]
    var soirInjectes = false;

    function ajouterRetour(crFin, agent) {
      retours[crFin] = retours[crFin] || [];
      retours[crFin].push(agent);
    }

    // R09 : doublures mobilisables en tension (R10 : pas en confortable/quotidien)
    var enTension = diag.etatPrevu !== ETATS.CONFORTABLE && diag.etatPrevu !== ETATS.QUOTIDIEN;
    if (enTension) {
      doublures.forEach(function (d) {
        // Doublure deja mobilisable comme remplacante seulement si elle ne doit pas manger
        // (sinon elle suit le flux normal des "mangeants libres")
        if (!_doitManger(d)) {
          pool.push(d);
          alertes.push({
            type: 'doublure_mobilisee',
            severite: SEVERITES.WARNING,
            message: (d.nom || d.id) + ' (doublure S' + (d.salle || '?') + ') mobilisee comme remplacante. Perte d\'aide operatoire.',
            agentId: d.id, salle: d.salle
          });
        }
      });
    }

    // Couloirs sans pause (couloir+soir, couloir+13h) sont des remplacants
    // disponibles des le 1er creneau. Le filtre _trouverRemplacant exclura
    // automatiquement les matin a partir de 13:00 (I5).
    couloirsRempl.forEach(function (a) { pool.push(a); });

    // ---- Indexer titulaires par salle pour la cascade
    var titulairesPourSalle = {};
    ordreCascade.forEach(function (sid) {
      titulairesPourSalle[sid] = { instru: null, circu: null };
    });
    agents.forEach(function (a) {
      if (_aPosteSalle(a) && _doitManger(a) && titulairesPourSalle[a.salle]) {
        titulairesPourSalle[a.salle][a.poste] = a;
      }
    });

    // ============================================================
    //                    BOUCLE DES CRENEAUX
    // ============================================================

    var salleIdx = 0;
    var firstActiveCreneau = true;

    creneaux.forEach(function (cr, idx) {
      // 1) Injection soir a partir de 12:00 (PAS AVANT — R-soir)
      if (!soirInjectes && cr.debutMin >= parseTime('12:00')) {
        agentsSoir.forEach(function (a) { pool.push(a); });
        soirInjectes = true;
      }

      // 2) Retours du creneau precedent
      var ret = retours[cr.debut];
      if (ret) ret.forEach(function (a) { pool.push(a); });

      // 3) 1er creneau actif (post-injection-soir si fenetre commence a 12:00,
      //    sinon 1er creneau de la fenetre meme si t<12:00) :
      //    couloirs mangent (R04, R18)
      //    + mangeants libres (R05 doublures J/12h, R26/R29 salles terminees)
      var estPremierCreneau = idx === 0;
      if (estPremierCreneau) {
        couloirsMangeants.forEach(function (c) {
          if (dejaManges[c.id]) return;
          mouvements.push({
            creneauDebut: cr.debut, creneauFin: cr.fin,
            agentPauseId: c.id, agentPauseNom: c.nom,
            salle: null, poste: null,
            remplacantId: null, remplacantNom: null,
            niveau: 'libre', chirurgienId: null,
            ordre: mouvements.length + 1
          });
          dejaManges[c.id] = true;
          ajouterRetour(cr.fin, c);
        });
        mangeantsLibres.forEach(function (a) {
          if (dejaManges[a.id]) return;
          mouvements.push({
            creneauDebut: cr.debut, creneauFin: cr.fin,
            agentPauseId: a.id, agentPauseNom: a.nom,
            salle: null, poste: null,
            remplacantId: null, remplacantNom: null,
            niveau: 'libre', chirurgienId: null,
            ordre: mouvements.length + 1
          });
          dejaManges[a.id] = true;
        });
      }

      // 4) Cascade salle par salle (I3, R07, R27)
      while (salleIdx < ordreCascade.length) {
        var sid = ordreCascade[salleIdx];
        var titSalle = titulairesPourSalle[sid];
        if (!titSalle) { salleIdx++; continue; }

        var pendingTitulaires = [];
        ['instru', 'circu'].forEach(function (p) {
          var t = titSalle[p];
          if (t && !dejaManges[t.id]) pendingTitulaires.push(t);
        });
        if (pendingTitulaires.length === 0) { salleIdx++; continue; }

        // R19 / R20 : preferences. 12h en dernier a preference egale.
        pendingTitulaires.sort(function (x, y) {
          var px = x.preferenceCreneau === 'tot' ? 0 : (x.preferenceCreneau === 'tard' ? 2 : 1);
          var py = y.preferenceCreneau === 'tot' ? 0 : (y.preferenceCreneau === 'tard' ? 2 : 1);
          if (px !== py) return px - py;
          var ax = x.categorie === CATEGORIES.DOUZE_H ? 1 : 0;
          var ay = y.categorie === CATEGORIES.DOUZE_H ? 1 : 0;
          return ax - ay;
        });

        var salleObj = salles.find(function (s) { return s.id === sid; });
        var chirurgienId = salleObj ? salleObj.chirurgienId : null;

        var blocked = false;
        for (var pi = 0; pi < pendingTitulaires.length; pi++) {
          var titulaire = pendingTitulaires[pi];
          var rem = _trouverRemplacant(pool, titulaire.poste, chirurgienId, competences, prefsCrise, cr.debutMin);
          if (!rem) { blocked = true; break; }

          mouvements.push({
            creneauDebut: cr.debut, creneauFin: cr.fin,
            agentPauseId: titulaire.id, agentPauseNom: titulaire.nom,
            salle: sid, poste: titulaire.poste,
            remplacantId: rem.agent.id, remplacantNom: rem.agent.nom,
            niveau: rem.niveau, chirurgienId: chirurgienId,
            ordre: mouvements.length + 1
          });

          if (rem.niveau === NIVEAUX.CRISE) {
            // R12 / C7 : trace
            alertes.push({
              type: 'circu_crise',
              severite: SEVERITES.CRISE,
              message: 'Crise instru : ' + (rem.agent.nom || rem.agent.id) + ' -> ' + titulaire.poste + ' salle ' + sid,
              agentId: rem.agent.id, salle: sid, chirurgienId: chirurgienId
            });
          }

          dejaManges[titulaire.id] = true;
          var ix = pool.indexOf(rem.agent);
          if (ix > -1) pool.splice(ix, 1);
          ajouterRetour(cr.fin, titulaire); // R07 : titulaire revenu cascade
        }

        if (blocked) break; // attente prochain creneau

        // Verifier que la salle est entierement couverte avant de passer a la suivante
        var stillPending = ['instru', 'circu'].some(function (p) {
          return titSalle[p] && !dejaManges[titSalle[p].id];
        });
        if (!stillPending) salleIdx++;
        else break; // securite
      }

      // 5) Le couloir+soir non utilise au 1er creneau reste dans le pool
      //    pour les creneaux suivants. Rien a faire.
      firstActiveCreneau = false;
    });

    // ============================================================
    //              RELEVE 13H (R31, R32, C4) — a 13:00
    // ============================================================

    if (agentsMatinPostes.length > 0) {
      // I5 / R31 : a partir de 13:00, AUCUN agent matin (categorie='matin') ne peut
      // etre remplacant — il est parti. Cela inclut les couloirs+13h.
      // Defense en profondeur : on construit un POOL DEDIE pour la releve,
      // independant du pool de cascade, qui ne contiendra JAMAIS de matin.
      var poolReleve = [];

      function ajouterAuPoolReleve(a) {
        if (a.categorie === CATEGORIES.MATIN) return;       // I5 hard barrier
        if (poolReleve.indexOf(a) === -1) poolReleve.push(a);
      }

      // Source 1 : agents toujours dans le pool de cascade (non matin)
      pool.forEach(ajouterAuPoolReleve);
      // Source 2 : retours pas encore consommes (titulaires revenus, couloirs revenus)
      Object.keys(retours).forEach(function (t) {
        if (parseTime(t) <= parseTime('13:00')) {
          retours[t].forEach(ajouterAuPoolReleve);
        }
      });

      var releveDebut = '13:00';
      var releveFin = formatTime(parseTime('13:00') + DUREE_PAUSE);
      var releveMin = parseTime(releveDebut);

      // Tri : agents matin de la meme salle traites en bloc (debauche simultanee)
      var matinTries = agentsMatinPostes.slice().sort(function (a, b) {
        if (a.salle !== b.salle) return a.salle < b.salle ? -1 : 1;
        return a.poste === 'instru' ? -1 : 1;
      });

      matinTries.forEach(function (ag13) {
        var salleObj = salles.find(function (s) { return s.id === ag13.salle; });
        var chirurgienId = salleObj ? salleObj.chirurgienId : null;
        // Triple barriere : poolReleve sans matin + slotMinutes=releveMin + filtre dans _trouverRemplacant
        var rem = _trouverRemplacant(poolReleve, ag13.poste, chirurgienId, competences, prefsCrise, releveMin);
        if (rem) {
          mouvements.push({
            creneauDebut: releveDebut, creneauFin: releveFin,
            agentPauseId: ag13.id, agentPauseNom: ag13.nom,
            salle: ag13.salle, poste: ag13.poste,
            remplacantId: rem.agent.id, remplacantNom: rem.agent.nom,
            niveau: 'releve_13h', chirurgienId: chirurgienId,
            ordre: mouvements.length + 1
          });
          if (rem.niveau === NIVEAUX.CRISE) {
            alertes.push({
              type: 'circu_crise',
              severite: SEVERITES.CRISE,
              message: 'Releve 13h en crise : ' + (rem.agent.nom || rem.agent.id) + ' -> ' + ag13.poste + ' salle ' + ag13.salle,
              agentId: rem.agent.id, salle: ag13.salle, chirurgienId: chirurgienId
            });
          }
          var ix = poolReleve.indexOf(rem.agent);
          if (ix > -1) poolReleve.splice(ix, 1);
        } else {
          alertes.push({
            type: 'poste_13h_non_couvert',
            severite: SEVERITES.CRISE,
            message: 'Salle ' + ag13.salle + ' ' + ag13.poste + ' : aucun remplacant a 13:00 pour ' + (ag13.nom || ag13.id) + '.',
            agentId: ag13.id, salle: ag13.salle
          });
        }
      });
    }

    // ============================================================
    //               VERIFIER NON-NOURRIS (C3, C5)
    // ============================================================

    var doiventManger = agents.filter(_doitManger);
    var nonNourris = doiventManger.filter(function (a) { return !dejaManges[a.id]; });
    nonNourris.forEach(function (a) {
      alertes.push({
        type: 'agent_non_nourri',
        severite: SEVERITES.CRISE,
        message: (a.nom || a.id) + ' n\'a pas pu manger dans la fenetre.',
        agentId: a.id
      });
    });

    // ============================================================
    //                   QUALIFIER ETAT RESULTANT
    // ============================================================

    var etatResultant = _qualifierEtat(alertes, fenetre, config, nonNourris.length);

    return {
      mouvements:              mouvements,
      etatResultant:           etatResultant,
      fenetreDebut:            fenetre.debut,
      fenetreFin:              fenetre.fin,
      diagnostic:              diag,
      alertes:                 alertes,
      agentsNonNourris:        nonNourris.map(function (a) { return a.id; }),
      nbAffectationsCrise:     alertes.filter(function (x) { return x.type === 'circu_crise'; }).length,
      preferencesNonSatisfaites: []
    };
  }

  function _qualifierEtat(alertes, fenetre, config, nbNonNourris) {
    var hasBloquant = alertes.some(function (x) { return x.severite === SEVERITES.BLOQUANT; });
    if (hasBloquant) return ETATS.BLOQUE;

    var hasCrise = alertes.some(function (x) { return x.severite === SEVERITES.CRISE; });
    if (hasCrise || nbNonNourris > 0) return ETATS.CRISE;

    var debutShifted = fenetre.debut !== config.creneauNominal.debut;
    var finShifted   = fenetre.fin   !== config.creneauNominal.fin;
    if (debutShifted && finShifted) return ETATS.DEGRADE_COMPLET;
    if (debutShifted || finShifted)  return ETATS.DEGRADE_LEGER;
    return ETATS.QUOTIDIEN;
  }

  // ---------- PHASE 3 : VALIDATION (mode manuel) -----------------

  function validerPlan(mouvements, effectif, config, competencesArg, preferencesCrise) {
    var agents = effectif.agents || [];
    var salles = effectif.salles || [];
    var competences = competencesArg ? Object.assign({}, competencesArg) : {};
    agents.forEach(function (a) {
      if (!competences[a.id] && a.competences) competences[a.id] = a.competences;
    });
    var prefsCrise = preferencesCrise || effectif.preferencesCrise || [];

    var violations = [];
    var avertissements = [];

    // Lister les creneaux distincts utilises
    var creneauxUtilises = [];
    var seen = {};
    mouvements.forEach(function (m) {
      if (m.creneauDebut && !seen[m.creneauDebut]) {
        creneauxUtilises.push(m.creneauDebut);
        seen[m.creneauDebut] = true;
      }
    });

    // C1 : aucun poste vacant pendant qu'une salle est occupee
    var sallesOcc = _sallesActives(salles, agents);
    creneauxUtilises.forEach(function (debut) {
      var mvts = mouvements.filter(function (m) { return m.creneauDebut === debut; });
      var enPause = {};
      var couvertures = {};
      mvts.forEach(function (m) {
        enPause[m.agentPauseId] = true;
        if (m.salle && m.poste) couvertures[m.salle + ':' + m.poste] = m.remplacantId;
      });
      sallesOcc.forEach(function (s) {
        ['instru', 'circu'].forEach(function (poste) {
          var t = agents.find(function (a) { return a.salle === s.id && a.poste === poste; });
          if (t && enPause[t.id] && !couvertures[s.id + ':' + poste]) {
            violations.push({
              regle: 'C1',
              message: 'Poste vacant : ' + poste + ' salle ' + s.id + ' a ' + debut
            });
          }
        });
      });
    });

    // C2 / R12 / R14 : niveau requis + accord chirurgien si crise instru
    mouvements.forEach(function (m) {
      if (!m.remplacantId) return;
      var c = competences[m.remplacantId];
      if (!c) {
        violations.push({
          regle: 'C2',
          message: 'Competences inconnues : ' + (m.remplacantNom || m.remplacantId)
        });
        return;
      }
      var niveau = c[m.poste];

      // R13 : si circu interdit mais instru OK, fallback
      if (m.poste === 'circu' && (niveau === NIVEAUX.INTERDIT || !niveau)) {
        if (c.instru === NIVEAUX.QUOTIDIEN || c.instru === NIVEAUX.CRISE) niveau = NIVEAUX.QUOTIDIEN;
      }

      if (!niveau || niveau === NIVEAUX.INTERDIT) {
        violations.push({
          regle: 'C2',
          message: (m.remplacantNom || m.remplacantId) + ' interdit sur ' + m.poste + ' salle ' + m.salle
        });
      } else if (niveau === NIVEAUX.CRISE) {
        avertissements.push({
          regle: 'C2',
          message: 'Affectation crise : ' + (m.remplacantNom || m.remplacantId) + ' -> ' + m.poste + ' salle ' + m.salle
        });
        if (m.poste === 'instru' && m.chirurgienId) {
          var pref = prefsCrise.find(function (p) {
            return p.chirurgienId === m.chirurgienId && p.agentId === m.remplacantId && p.poste === 'instru';
          });
          if (pref && pref.accepte === false) {
            violations.push({
              regle: 'C2',
              message: 'Crise instru refusee par chirurgien : ' + (m.remplacantNom || m.remplacantId) + ' salle ' + m.salle
            });
          }
        }
      }
    });

    // C5 : chaque agent mange exactement 1 fois
    var compte = {};
    mouvements.forEach(function (m) { compte[m.agentPauseId] = (compte[m.agentPauseId] || 0) + 1; });
    Object.keys(compte).forEach(function (aid) {
      if (compte[aid] > 1) {
        var a = agents.find(function (x) { return x.id === aid; });
        violations.push({
          regle: 'C5',
          message: (a ? a.nom : aid) + ' part en pause ' + compte[aid] + ' fois'
        });
      }
    });

    // C3 / C5 : tous les concernes ont leur pause
    agents.filter(_doitManger).forEach(function (a) {
      if (!compte[a.id]) {
        violations.push({
          regle: 'C3',
          message: a.nom + ' n\'a pas de pause repas'
        });
      }
    });

    // C4 / R31 / R32 : 13h pas place au-dela de 13:00 + poste 13h couvert
    mouvements.forEach(function (m) {
      var ag = agents.find(function (a) { return a.id === m.agentPauseId; });
      if (ag && ag.categorie === CATEGORIES.MATIN) {
        if (parseTime(m.creneauDebut) >= parseTime('13:00') && m.salle) {
          // Releve 13h legitime
        } else if (m.salle) {
          violations.push({ regle: 'C4', message: ag.nom + ' (matin/13h) place a ' + m.creneauDebut + ' — interdit en cascade pause' });
        }
      }
    });
    agents.filter(function (a) { return a.categorie === CATEGORIES.MATIN && _aPosteSalle(a); }).forEach(function (ag13) {
      var couvert = mouvements.some(function (m) {
        return m.agentPauseId === ag13.id && m.salle === ag13.salle && m.poste === ag13.poste &&
          parseTime(m.creneauDebut) >= parseTime('13:00');
      });
      if (!couvert) {
        violations.push({
          regle: 'C4',
          message: 'Poste 13h non couvert : ' + ag13.nom + ' salle ' + ag13.salle + ' ' + ag13.poste
        });
      }
    });

    // Fenetre reelle
    var debuts = mouvements.map(function (m) { return parseTime(m.creneauDebut); });
    var fins = mouvements.map(function (m) { return parseTime(m.creneauFin); });
    var fenetreDebut = debuts.length ? formatTime(Math.min.apply(null, debuts)) : config.creneauNominal.debut;
    var fenetreFin   = fins.length   ? formatTime(Math.max.apply(null, fins))   : config.creneauNominal.fin;

    var etat;
    if (violations.length > 0) {
      etat = violations.some(function (v) { return v.regle === 'C1'; }) ? ETATS.BLOQUE : ETATS.CRISE;
    } else if (avertissements.some(function (a) { return a.regle === 'C2'; })) {
      etat = ETATS.CRISE;
    } else if (fenetreDebut !== config.creneauNominal.debut && fenetreFin !== config.creneauNominal.fin) {
      etat = ETATS.DEGRADE_COMPLET;
    } else if (fenetreDebut !== config.creneauNominal.debut || fenetreFin !== config.creneauNominal.fin) {
      etat = ETATS.DEGRADE_LEGER;
    } else {
      etat = ETATS.QUOTIDIEN;
    }

    return {
      valide:         violations.length === 0,
      etatResultant:  etat,
      violations:     violations,
      avertissements: avertissements,
      fenetreDebut:   fenetreDebut,
      fenetreFin:     fenetreFin
    };
  }

  // ---------- PHASE 4 : PATTERNS ---------------------------------

  function calculerSignature(effectif) {
    var agents = effectif.agents || [];
    var salles = effectif.salles || [];
    return {
      nbSallesOccupees: _sallesActives(salles, agents).length,
      nbCouloirs:       agents.filter(function (a) { return a.categorie === CATEGORIES.COULOIR; }).length,
      nbSoir:           agents.filter(function (a) { return a.categorie === CATEGORIES.SOIR; }).length,
      nbMatin:          agents.filter(function (a) { return a.categorie === CATEGORIES.MATIN; }).length,
      nbJournee:        agents.filter(function (a) { return a.categorie === CATEGORIES.JOURNEE; }).length,
      nb12h:            agents.filter(function (a) { return a.categorie === CATEGORIES.DOUZE_H; }).length
    };
  }

  function comparerSignatures(s1, s2) {
    var keys = Object.keys(s1);
    var matchs = 0;
    keys.forEach(function (k) { if (s1[k] === s2[k]) matchs++; });
    return matchs / keys.length;
  }

  function chercherPattern(signature, patterns, seuilSimilarite) {
    var seuil = seuilSimilarite || 0.85;
    var meilleur = null;
    var meilleurScore = 0;
    patterns.forEach(function (p) {
      var score = comparerSignatures(signature, p.signature);
      if (score >= seuil && score > meilleurScore) {
        meilleurScore = score;
        meilleur = p;
      }
    });
    return meilleur ? { pattern: meilleur, similarite: meilleurScore } : null;
  }

  // ---------- API PUBLIQUE ---------------------------------------

  return {
    // constantes
    ETATS:       ETATS,
    NIVEAUX:     NIVEAUX,
    CATEGORIES:  CATEGORIES,
    SEVERITES:   SEVERITES,
    DUREE_PAUSE: DUREE_PAUSE,

    // moteur
    diagnostiquer:  diagnostiquer,
    calculerPlan:   calculerPlan,
    validerPlan:    validerPlan,

    // patterns
    calculerSignature:  calculerSignature,
    comparerSignatures: comparerSignatures,
    chercherPattern:    chercherPattern,

    // helpers temps
    genererCreneaux: genererCreneaux,
    formatTime:      formatTime,
    parseTime:       parseTime
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RotationEngine;
}
