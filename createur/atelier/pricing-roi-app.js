/* ================================================================
   pricing-roi-app.js — BDB Atelier L3 Créateur
   Simulateur ROI V5.1 — CNP 3 groupes · 7 postes · Projection 5 ans
   CDS Compliant | Zéro onclick= | Zéro console.* | Zéro @latest
   Checklist 75 points. Cross-validation 2 IA. Audit régression corrigé.
   Profil cible : Françoise (6w5 C/S Bleu/Orange, Bernard N°003).
   ================================================================ */

(function () {
  'use strict';

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function fmt(n) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)); }
  function fmtK(n) {
    if (Math.abs(n) >= 1000000) return (n/1000000).toFixed(1).replace('.',',')+'\u00a0M\u20ac';
    return fmt(n)+'\u00a0\u20ac';
  }
  function $(id) { return document.getElementById(id); }

  function sliderRow(id, label, min, max, val, step, help, unit) {
    return '<div class="mb-3">'
      + '<div class="d-flex justify-content-between align-items-baseline">'
      + '<label class="form-label text-muted small text-uppercase mb-0">'+escHtml(label)+'</label>'
      + '<span class="fw-bold text-primary" id="v-'+escHtml(id)+'">'+escHtml(String(val))+(unit?' '+escHtml(unit):'')+'</span>'
      + '</div>'
      + '<input type="range" class="form-range" id="s-'+escHtml(id)+'" min="'+min+'" max="'+max+'" value="'+val+'" step="'+step+'"/>'
      + (help?'<div class="text-muted small">'+escHtml(help)+'</div>':'')
      + '</div>';
  }

  /* Sous-total visuel dans un groupe */
  function subtotalRow(id, label) {
    return '<div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">'
      + '<span class="text-muted small" id="'+escHtml(id)+'-detail">\u2014</span>'
      + '<span class="fw-bold fs-5" id="'+escHtml(id)+'-total">\u2014</span>'
      + '</div>';
  }

  var PROFILES = {
    prudent:   { label:'Adoption lente', taux:[10,12,15,18,20],  form:[40,55,70,85,100] },
    normal:    { label:'Normal',    taux:[10,18,25,30,30],   form:[50,70,80,100,100] },
    ambitieux: { label:'Ambitieux', taux:[10,25,32,38,40],   form:[60,80,90,100,100] }
  };
  var currentProfile = 'normal';

  /* ================================================================
     RENDER BLOC
     ================================================================ */
  function renderBloc() {
    $('bloc-sliders').innerHTML = '<div class="row g-4">'
      + '<div class="col-6 col-md-3">'+sliderRow('etp','Personnel bloc (IDE+IBODE)',5,60,30,1,'Source : votre DRH')+'</div>'
      + '<div class="col-6 col-md-3">'+sliderRow('interv','Interventions / an',1000,20000,5000,100,'Moy. nationale priv\u00e9e ~5 000 (DREES SAE)')+'</div>'
      + '<div class="col-6 col-md-3">'+sliderRow('duree','Dur\u00e9e moy. en salle',30,180,90,5,'Ortho 90-110 min (ANAP)','min')+'</div>'
      + '<div class="col-6 col-md-3">'+sliderRow('coutmin','Co\u00fbt analytique / min',10,40,15,1,'ATIH ENC 2022 : 12-22\u20ac priv\u00e9','\u20ac')+'</div>'
      + '</div>';
  }

  /* ================================================================
     RENDER CNP — 3 GROUPES avec accordion par groupe
     ================================================================ */
  function renderCnp() {
    var el = $('cnp-zone');
    if (!el) return;

    el.innerHTML = ''

    /* ===== GROUPE 1 ===== */
    + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
    + '<div class="d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#grp1-detail" role="button">'
    + '<h6 class="fw-bold text-danger mb-0"><i class="bi bi-layers me-2"></i>Pr\u00e9paration et flux de salle <i class="bi bi-chevron-down ms-1 small"></i></h6>'
    + '<span class="fw-bold text-danger" id="grp1-total">\u2014</span>'
    + '</div>'
    + '<div class="collapse mt-3" id="grp1-detail">'
    /* 1a */
    + '<div class="border rounded p-3 mb-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-exclamation-diamond text-danger me-1"></i>1a. Interruptions per-op (interv. lourdes)</div>'
    + '<div class="text-muted small mb-2">Erreur picking en salle \u2192 recherche + rest\u00e9rilisation. 1\u20ac pr\u00e9-op = 30-75\u20ac per-op.</div>'
    + '<div class="row g-3">'
    + '<div class="col-6">'+sliderRow('pct-lourd','Part interv. lourdes',10,80,40,5,'PTH, PTG, reprises, fractures','%')+'</div>'
    + '<div class="col-6">'+sliderRow('taux-err','Taux erreur picking',1,15,2.5,0.5,'BMJ : 2-4% | Terrain : 5-15%','%')+'</div>'
    + '<div class="col-6">'+sliderRow('temps-err','Temps perdu / \u00e9vt',15,90,45,5,'Correction + recherche + relance','min')+'</div>'
    + '<div class="col-6">'+sliderRow('cout-steri','Rest\u00e9rilisation / \u00e9vt',50,300,150,10,'St\u00e9rilisation : 140-160\u20ac','\u20ac')+'</div>'
    + '</div>'
    + subtotalRow('cascade','')
    + '</div>'
    /* 1b */
    + '<div class="border rounded p-3 mb-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-clock text-warning me-1"></i>1b. Temps perdu en pr\u00e9paration (toutes interv.)</div>'
    + '<div class="text-muted small mb-2">Recherche mat\u00e9riel, v\u00e9rification, pr\u00e9paration sans documentation. 5\u20ac = 12 min \u00e0 0,40\u20ac/min.</div>'
    + sliderRow('preop-cout','Co\u00fbt pr\u00e9-op / interv.',2,20,5,1,'Document\u00e9 : 5\u20ac | Terrain : 5-10\u20ac','\u20ac')
    + subtotalRow('preop','')
    + '</div>'
    /* 1c */
    + '<div class="border rounded p-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-arrow-repeat text-warning me-1"></i>1c. Doubles ouvertures et d\u00e9st\u00e9rilisations</div>'
    + '<div class="text-muted small mb-2">Mauvais ancillaire ouvert, d\u00e9st\u00e9rilisation accidentelle. Hors cascade per-op.</div>'
    + '<div class="row g-3">'
    + '<div class="col-6">'+sliderRow('dbl-freq','Fr\u00e9quence / semaine',0,10,3,1,'Terrain : 2-3\u00d7/semaine')+'</div>'
    + '<div class="col-6">'+sliderRow('dbl-cout','Co\u00fbt moyen / \u00e9vt',100,1000,400,50,'Temps bloc + rest\u00e9ri + DM perdu','\u20ac')+'</div>'
    + '</div>'
    + subtotalRow('dbl','')
    + '</div>'
    + '</div>'/* /collapse */
    + '</div></div>'

    /* ===== GROUPE 2 ===== */
    + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
    + '<div class="d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#grp2-detail" role="button">'
    + '<h6 class="fw-bold text-danger mb-0"><i class="bi bi-box-seam me-2"></i>Pertes mat\u00e9riel <i class="bi bi-chevron-down ms-1 small"></i></h6>'
    + '<span class="fw-bold text-danger" id="grp2-total">\u2014</span>'
    + '</div>'
    + '<div class="collapse mt-3" id="grp2-detail">'
    /* 2a */
    + '<div class="border rounded p-3 mb-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-box-seam text-danger me-1"></i>2a. Dispositifs ouverts \u00e0 tort</div>'
    + '<div class="text-muted small mb-2">Mauvaise taille/r\u00e9f\u00e9rence/c\u00f4t\u00e9. Ajustez selon votre pharmacie.</div>'
    + sliderRow('dmi','Estimation annuelle',0,500000,100000,10000,'','\u20ac')
    + '</div>'
    /* 2b */
    + '<div class="border rounded p-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-trash3 text-warning me-1"></i>2b. Gaspillage consommables st\u00e9riles</div>'
    + '<div class="text-muted small mb-2">Casaques-gilets, gants, fils, compresses ouverts par pr\u00e9caution.</div>'
    + sliderRow('gasp','Estimation annuelle',0,100000,27000,1000,'Montpellier 2021 : 13-20% budget conso','\u20ac')
    + '</div>'
    + '</div>'/* /collapse */
    + '</div></div>'

    /* ===== GROUPE 3 ===== */
    + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
    + '<div class="d-flex justify-content-between align-items-center" data-bs-toggle="collapse" data-bs-target="#grp3-detail" role="button">'
    + '<h6 class="fw-bold text-danger mb-0"><i class="bi bi-shield-exclamation me-2"></i>Risque et personnel <i class="bi bi-chevron-down ms-1 small"></i></h6>'
    + '<span class="fw-bold text-danger" id="grp3-total">\u2014</span>'
    + '</div>'
    + '<div class="collapse mt-3" id="grp3-detail">'
    /* 3a */
    + '<div class="border rounded p-3 mb-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-shield-exclamation text-danger me-1"></i>3a. \u00c9v\u00e9nements ind\u00e9sirables graves <span class="badge bg-danger bg-opacity-10 text-danger small">assurance</span></div>'
    + '<div class="text-muted small mb-2">Co\u00fbt faible tant que rien n\u2019arrive. D\u00e9vastateur quand \u00e7a arrive.</div>'
    + '<div class="row g-3">'
    + '<div class="col-6">'+sliderRow('eig-freq','Fr\u00e9quence / an',0,5,1,0.1,'Relyens : 0,3 | Terrain : 1-3')+'</div>'
    + '<div class="col-6">'+sliderRow('eig-cout','Co\u00fbt moyen',10000,200000,34000,2000,'Relyens 2024 : ~34k\u20ac','\u20ac')+'</div>'
    + '</div>'
    + subtotalRow('eig','')
    + '</div>'
    /* 3b */
    + '<div class="border rounded p-3">'
    + '<div class="fw-semibold mb-1"><i class="bi bi-person-dash text-warning me-1"></i>3b. Remplacement personnel</div>'
    + '<div class="text-muted small mb-2">Int\u00e9rim Loi Rist + recrutement + int\u00e9gration.</div>'
    + '<div class="row g-3">'
    + '<div class="col-6">'+sliderRow('turn-nb','D\u00e9parts / an',0,10,1,1,'Turnover bloc 10-15%')+'</div>'
    + '<div class="col-6">'+sliderRow('turn-cout','Co\u00fbt / d\u00e9part',20000,200000,80000,5000,'FHF : 60-90k\u20ac','\u20ac')+'</div>'
    + '</div>'
    + subtotalRow('turn','')
    + '</div>'
    + '</div>'/* /collapse */
    + '</div></div>'

    /* ===== TOTAL CNP ===== */
    + '<div class="p-3 bg-danger bg-opacity-10 rounded d-flex justify-content-between align-items-center">'
    + '<span class="fw-bold">Total annuel support\u00e9 par votre \u00e9tablissement</span>'
    + '<span class="fw-bold fs-3 text-danger" id="cnp-total">\u2014</span>'
    + '</div>';
  }

  /* ================================================================
     RENDER GAINS
     ================================================================ */
  function renderGains() {
    $('gains-zone').innerHTML = ''
      + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
      + '<div class="fw-semibold mb-1"><i class="bi bi-mortarboard text-success me-1"></i>Formateur permanent embarqu\u00e9</div>'
      + '<div class="text-muted small mb-2">1h/semaine par agent, smartphone, sans planning.</div>'
      + '<div class="d-flex justify-content-between align-items-center">'
      + '<span class="text-muted small" id="form-detail">\u2014</span>'
      + '<span class="fw-bold fs-5 text-success" id="form-total">\u2014</span>'
      + '</div></div></div>'
      + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
      + '<div class="fw-semibold mb-1"><i class="bi bi-shield-check text-success me-1"></i>Pr\u00e9vention cascade</div>'
      + '<div class="text-muted small">8-32% de r\u00e9duction par optimisation fiches seule. BDB = 15 modules compl\u00e9mentaires.</div>'
      + '</div></div>'
      + '<div class="card bg-light border-0 mb-3"><div class="card-body py-3">'
      + '<div class="fw-semibold mb-1"><i class="bi bi-clock-history text-success me-1"></i>Op\u00e9rationnel sous 30 \u00e0 90 jours</div>'
      + '<div class="text-muted small">D\u00e9pend de la maturit\u00e9 des donn\u00e9es terrain existantes.</div>'
      + '</div></div>'
      + '<div class="card bg-light border-0"><div class="card-body py-3">'
      + '<div class="fw-semibold mb-1"><i class="bi bi-people text-success me-1"></i>Effets non financiers</div>'
      + '<ul class="text-muted small mb-0 ps-3">'
      + '<li>R\u00e9duction du stress (moins d\u2019impr\u00e9vus per-op)</li>'
      + '<li>Coh\u00e9sion (savoir partag\u00e9, fin du \u00ab\u00a0demande \u00e0 l\u2019ancienne\u00a0\u00bb)</li>'
      + '<li>Attractivit\u00e9 employeur (outil moderne)</li>'
      + '<li>Rayonnement \u00e9tablissement (early adopter)</li>'
      + '</ul></div></div>';
  }

  /* ================================================================
     RENDER TCO
     ================================================================ */
  function renderTco() {
    $('tco-zone').innerHTML = ''
      + sliderRow('pricing','Licence',10000,500000,100000,10000,'','\u20ac')
      + '<div id="pricing-hint" class="mb-2"></div>'
      + '<div class="form-check form-switch mb-3">'
      + '<input class="form-check-input" type="checkbox" role="switch" id="s-lifetime"/>'
      + '<label class="form-check-label small" for="s-lifetime" id="v-mode">Abonnement annuel</label>'
      + '</div>'
      + '<div class="row g-3">'
      + '<div class="col-6">'+sliderRow('maint','Maintenance',0,30,15,1,'Standard : 15-22%','%')+'</div>'
      + '<div class="col-6">'+sliderRow('setup','Mise en service',0,100000,40000,5000,'Versement ann\u00e9e 0','\u20ac')+'</div>'
      + '</div>'
      + '<div class="p-3 bg-primary bg-opacity-10 rounded">'
      + '<div class="d-flex justify-content-between align-items-center">'
      + '<div><div class="fw-bold">Mise en service</div><div class="text-muted small">Licence + setup (pas de maintenance)</div></div>'
      + '<span class="fw-bold fs-5 text-primary" id="tco-n0">\u2014</span></div>'
      + '<hr class="my-2"/>'
      + '<div class="d-flex justify-content-between align-items-center">'
      + '<div><div class="fw-bold">Ann\u00e9es suivantes</div><div class="text-muted small" id="tco-detail">\u2014</div></div>'
      + '<span class="fw-bold fs-5 text-primary" id="tco-annual">\u2014</span></div></div>';
  }

  /* ================================================================
     RENDER PROJECTION
     ================================================================ */
  function renderProjection() {
    $('projection-zone').innerHTML = ''
      + '<div class="d-flex gap-2 mb-3 flex-wrap">'
      + '<span class="text-muted small align-self-center me-2">Profil :</span>'
      + '<button class="btn btn-sm btn-outline-secondary" data-profile="prudent" id="bp-prudent" type="button">Adoption lente</button>'
      + '<button class="btn btn-sm btn-primary" data-profile="normal" id="bp-normal" type="button">Normal <span class="badge bg-light text-primary ms-1">Recommand\u00e9</span></button>'
      + '<button class="btn btn-sm btn-outline-secondary" data-profile="ambitieux" id="bp-ambitieux" type="button">Ambitieux</button>'
      + '<span class="text-muted small align-self-center ms-2" id="profile-note">\u2014</span>'
      + '</div>'
      + '<div class="table-responsive mb-2">'
      + '<table class="table table-sm table-bordered mb-0" id="proj-table"><thead></thead><tbody></tbody></table></div>'
      + '<div class="mb-4"><button class="btn btn-sm btn-link text-muted p-0" id="btn-detail-toggle" type="button"><i class="bi bi-chevron-down me-1"></i>D\u00e9tail du calcul</button>'
      + '<div class="collapse mt-2" id="detail-collapse"><div class="table-responsive">'
      + '<table class="table table-sm table-bordered mb-0 small" id="proj-detail"><thead></thead><tbody></tbody></table></div></div></div>'
      + '<div class="row g-3 mb-4" id="proj-indicators"></div>'
      /* Ancienneté slider */
      + '<div class="card bo-card mb-4"><div class="card-body py-3">'
      + '<div class="fw-semibold mb-2"><i class="bi bi-hourglass-split text-primary me-1"></i>Anciennet\u00e9 du bloc</div>'
      + '<div class="text-muted small mb-2">Depuis combien d\u2019ann\u00e9es votre bloc fonctionne dans sa configuration actuelle ?</div>'
      + sliderRow('anciennete','Bloc en activit\u00e9 depuis',1,25,10,1,'Les pertes identifi\u00e9es se sont d\u00e9j\u00e0 produites chaque ann\u00e9e pass\u00e9e.','ans')
      + '</div></div>'
      /* 3 cards conclusion */
      + '<div class="row g-3" id="conclusion-cards"></div>'
      /* Message final */
      + '<div class="mt-4 p-3 border rounded" id="proj-message"></div>';
  }

  /* ================================================================
     CALC
     ================================================================ */
  function calc() {
    var etp=+$('s-etp').value, interv=+$('s-interv').value;
    var duree=+$('s-duree').value, coutMin=+$('s-coutmin').value;
    $('v-etp').textContent=etp; $('v-interv').textContent=fmt(interv);
    $('v-duree').textContent=duree+' min'; $('v-coutmin').textContent=coutMin+' \u20ac';

    /* ---- GROUPE 1 ---- */
    /* 1a Cascade */
    var pL=+$('s-pct-lourd').value/100, tE=+$('s-taux-err').value/100;
    var tmE=+$('s-temps-err').value, cS=+$('s-cout-steri').value;
    $('v-pct-lourd').textContent=Math.round(pL*100)+' %';
    $('v-taux-err').textContent=(+$('s-taux-err').value).toFixed(1).replace('.',',')+' %';
    $('v-temps-err').textContent=tmE+' min'; $('v-cout-steri').textContent=cS+' \u20ac';
    var iL=Math.round(interv*pL), nE=Math.round(iL*tE), cpE=(tmE*coutMin)+cS;
    var cascade=nE*cpE;
    $('cascade-detail').textContent=fmt(iL)+' lourdes \u00d7 '+$('s-taux-err').value+'% = '+fmt(nE)+' \u00e9vt \u00d7 '+fmt(cpE)+'\u20ac';
    $('cascade-total').textContent=fmtK(cascade);

    /* 1b Pré-op */
    var preopU=+$('s-preop-cout').value;
    $('v-preop-cout').textContent=preopU+' \u20ac';
    var preop=interv*preopU;
    $('preop-detail').textContent=fmt(interv)+' interv. \u00d7 '+preopU+'\u20ac';
    $('preop-total').textContent=fmtK(preop);

    /* 1c Doubles ouvertures */
    var dF=+$('s-dbl-freq').value, dC=+$('s-dbl-cout').value;
    $('v-dbl-freq').textContent=dF; $('v-dbl-cout').textContent=dC+' \u20ac';
    var dbl=dF*44*dC;
    $('dbl-detail').textContent=dF+'\u00d7/sem \u00d7 44 sem \u00d7 '+fmt(dC)+'\u20ac';
    $('dbl-total').textContent=fmtK(dbl);

    var grp1=cascade+preop+dbl;
    $('grp1-total').textContent=fmtK(grp1);

    /* ---- GROUPE 2 ---- */
    var dmi=+$('s-dmi').value;
    $('v-dmi').textContent=fmtK(dmi);
    var gasp=+$('s-gasp').value;
    $('v-gasp').textContent=fmtK(gasp);
    var grp2=dmi+gasp;
    $('grp2-total').textContent=fmtK(grp2);

    /* ---- GROUPE 3 ---- */
    var eF=+$('s-eig-freq').value, eC=+$('s-eig-cout').value;
    $('v-eig-freq').textContent=eF.toFixed(1).replace('.',',');
    $('v-eig-cout').textContent=fmtK(eC);
    var eig=eF*eC;
    $('eig-detail').textContent=eF.toFixed(1).replace('.',',')+' \u00d7 '+fmtK(eC);
    $('eig-total').textContent=fmtK(eig);

    var tN=+$('s-turn-nb').value, tC=+$('s-turn-cout').value;
    $('v-turn-nb').textContent=tN; $('v-turn-cout').textContent=fmtK(tC);
    var turn=tN*tC;
    $('turn-detail').textContent=tN+' d\u00e9p. \u00d7 '+fmtK(tC);
    $('turn-total').textContent=fmtK(turn);

    var grp3=eig+turn;
    $('grp3-total').textContent=fmtK(grp3);

    /* TOTAL CNP */
    var cnp=grp1+grp2+grp3;
    $('cnp-total').textContent=fmtK(cnp);

    /* ---- GAINS ---- */
    var formMax=etp*52*45;
    $('form-detail').textContent=etp+' ETP \u00d7 52h \u00d7 45\u20ac';
    $('form-total').textContent=fmtK(formMax);

    /* ---- TCO ---- */
    var pricing=+$('s-pricing').value, lt=$('s-lifetime')&&$('s-lifetime').checked;
    var mP=+$('s-maint').value/100, setup=+$('s-setup').value;
    $('v-pricing').textContent=fmtK(pricing);
    $('v-maint').textContent=Math.round(mP*100)+' %';
    $('v-setup').textContent=fmtK(setup);
    $('v-mode').textContent=lt?'Achat d\u00e9finitif (amorti 3 ans)':'Abonnement annuel';
    var licAn=lt?pricing/3:pricing, maintAn=licAn*mP;
    var tcoN0=licAn+setup, tcoAn=licAn+maintAn;
    $('tco-n0').textContent=fmtK(tcoN0);
    $('tco-detail').textContent='Licence '+fmtK(licAn)+' + maint. '+fmtK(maintAn);
    $('tco-annual').textContent=fmtK(tcoAn)+' /an';

    /* Tips L3 : pricing dynamique — ajuste les curseurs TCO selon volume */
    var ph=$('pricing-hint');
    if(interv<=1500){
      $('s-pricing').value=30000; $('s-maint').value=10; $('s-setup').value=15000;
      if(ph) ph.innerHTML='<div class="alert alert-info py-1 px-2 mb-0 small"><i class="bi bi-info-circle me-1"></i>Tarification adapt\u00e9e : '+fmt(interv)+' interv./an \u2192 licence 30k\u20ac, maintenance 10%, setup 15k\u20ac</div>';
    } else if(interv<=3000){
      $('s-pricing').value=80000; $('s-maint').value=10; $('s-setup').value=25000;
      if(ph) ph.innerHTML='<div class="alert alert-info py-1 px-2 mb-0 small"><i class="bi bi-info-circle me-1"></i>Tarification adapt\u00e9e : '+fmt(interv)+' interv./an \u2192 licence 80k\u20ac, maintenance 10%, setup 25k\u20ac</div>';
    } else {
      if(ph) ph.innerHTML='';
    }
    /* Re-read after potential adjustment */
    pricing=+$('s-pricing').value; mP=+$('s-maint').value/100; setup=+$('s-setup').value;
    $('v-pricing').textContent=fmtK(pricing);
    $('v-maint').textContent=Math.round(mP*100)+' %';
    $('v-setup').textContent=fmtK(setup);
    licAn=lt?pricing/3:pricing; maintAn=licAn*mP;
    tcoN0=licAn+setup; tcoAn=licAn+maintAn;
    $('tco-n0').textContent=fmtK(tcoN0);
    $('tco-detail').textContent='Licence '+fmtK(licAn)+' + maint. '+fmtK(maintAn);
    $('tco-annual').textContent=fmtK(tcoAn)+' /an';
    var prof=PROFILES[currentProfile];
    $('profile-note').textContent='Tous les profils d\u00e9marrent \u00e0 10% (plancher document\u00e9 : optimisation fiches seule, AORN 2024)';

    var tcoR=[tcoN0],evR=[0],fmR=[0],netR=[-tcoN0],cum=-tcoN0;
    for(var y=0;y<5;y++){
      var t=prof.taux[y]/100, f=prof.form[y]/100;
      var ev=cnp*t, fm=formMax*f, net=ev+fm-tcoAn;
      tcoR.push(tcoAn); evR.push(ev); fmR.push(fm); netR.push(net); cum+=net;
    }
    var tS=tcoN0,eS=0,fS=0;
    for(var i=1;i<6;i++){tS+=tcoR[i];eS+=evR[i];fS+=fmR[i];}
    var nS=eS+fS-tS;

    var tbl=$('proj-table'); if(!tbl) return;
    var yrs=['Mise en service','Ann\u00e9e 1','Ann\u00e9e 2','Ann\u00e9e 3','Ann\u00e9e 4','Ann\u00e9e 5'];
    var hdr='<tr><th class="bg-light"></th>';
    yrs.forEach(function(yr){hdr+='<th class="text-center bg-light small">'+escHtml(yr)+'</th>';});
    hdr+='<th class="text-center bg-light fw-bold">CUMUL 5 ANS</th></tr>';
    tbl.querySelector('thead').innerHTML=hdr;

    function row(lb,ar,tot,cl){
      var r='<tr><td class="text-muted small fw-semibold">'+escHtml(lb)+'</td>';
      ar.forEach(function(v){r+='<td class="text-end '+(cl||'')+'">'+escHtml(fmtK(v))+'</td>';});
      r+='<td class="text-end fw-bold '+(cl||'')+'">'+escHtml(fmtK(tot))+'</td></tr>'; return r;
    }

    /* Gains totaux = économies + formation par année */
    var gainsR=[0]; var gainsS=0;
    for(var g=1;g<6;g++){var gv=evR[g]+fmR[g]; gainsR.push(gv); gainsS+=gv;}

    /* MAIN TABLE : 3 lignes */
    var bd='';
    bd+=row('Votre investissement',tcoR,tS,'');
    bd+=row('Gains (économies + formation)',gainsR,gainsS,'text-success');
    bd+='<tr class="table-active fw-bold"><td>B\u00e9n\u00e9fice net</td>';
    for(var j=0;j<netR.length;j++){
      var c=netR[j]>=0?'text-success':'text-danger';
      bd+='<td class="text-end '+c+'">'+escHtml(fmtK(netR[j]))+'</td>';
    }
    bd+='<td class="text-end '+(nS>=0?'text-success':'text-danger')+' fs-5">'+escHtml(fmtK(nS))+'</td></tr>';
    tbl.querySelector('tbody').innerHTML=bd;

    /* DETAIL TABLE (collapsed) */
    var dtbl=$('proj-detail');
    if(dtbl){
      dtbl.querySelector('thead').innerHTML=hdr;
      var dd='';
      /* Économies avec % */
      dd+='<tr><td class="text-muted small">R\u00e9duction appliqu\u00e9e</td><td class="text-end text-muted">\u2014</td>';
      prof.taux.forEach(function(t){dd+='<td class="text-end">'+t+'%</td>';});
      dd+='<td class="text-end">\u2014</td></tr>';
      dd+=row('\u00c9conomies sur pertes',evR,eS,'text-success');
      dd+=row('Valeur de la formation',fmR,fS,'text-success');
      dtbl.querySelector('tbody').innerHTML=dd;
    }

    /* Indicators */
    var bascule='\u2014', cP=-tcoN0;
    for(var k=1;k<netR.length;k++){cP+=netR[k]; if(cP>=0){bascule='Ann\u00e9e '+k; break;}}
    var roiC=tS>0?(eS+fS)/tS:0, rI=interv>0?cnp/interv:0, tI=interv>0?tcoAn/interv:0;

    $('proj-indicators').innerHTML=''
      +'<div class="col-6 col-md-3"><div class="card bo-card text-center h-100"><div class="card-body py-3">'
      +'<div class="fw-bold fs-2 '+(roiC>=1?'text-success':'text-danger')+'">\u00d7'+roiC.toFixed(1).replace('.',',')+'</div>'
      +'<div class="text-muted small">ROI cumul\u00e9 5 ans</div></div></div></div>'
      +'<div class="col-6 col-md-3"><div class="card bo-card text-center h-100"><div class="card-body py-3">'
      +'<div class="fw-bold fs-2 text-danger">'+Math.round(rI)+' \u20ac</div>'
      +'<div class="text-muted small">Risque / interv.<br/>sans BDB</div></div></div></div>'
      +'<div class="col-6 col-md-3"><div class="card bo-card text-center h-100"><div class="card-body py-3">'
      +'<div class="fw-bold fs-2 text-primary">'+tI.toFixed(1).replace('.',',')+' \u20ac</div>'
      +'<div class="text-muted small">TCO BDB<br/>/ intervention</div></div></div></div>'
      +'<div class="col-6 col-md-3"><div class="card bo-card text-center h-100"><div class="card-body py-3">'
      +'<div class="fw-bold fs-2 text-success">'+escHtml(bascule)+'</div>'
      +'<div class="text-muted small">Point de<br/>bascule</div></div></div></div>';

    /* ---- CONCLUSION 3 TEMPS + DELTA ---- */
    var anciennete = +$('s-anciennete').value;
    $('v-anciennete').textContent = anciennete + ' ans';

    var tcoTotal10 = tcoN0;
    var evTotal10 = 0, fmTotal10 = 0;
    for (var y10 = 0; y10 < 10; y10++) {
      var tIdx = y10 < 5 ? y10 : 4;
      var t10 = prof.taux[tIdx] / 100;
      var f10 = y10 < 5 ? prof.form[y10] / 100 : 1;
      tcoTotal10 += tcoAn;
      evTotal10 += cnp * t10;
      fmTotal10 += formMax * f10;
    }
    var net10 = evTotal10 + fmTotal10 - tcoTotal10;
    var pertePasse = cnp * anciennete;
    var perteFutur10 = cnp * 10;
    var delta = perteFutur10 - tcoTotal10 + evTotal10 + fmTotal10;

    var cc = $('conclusion-cards');
    if (cc) {
      cc.innerHTML = ''
        + '<div class="col-12 col-md-4"><div class="card h-100 border-0 bg-secondary bg-opacity-10">'
        + '<div class="card-body text-center py-4">'
        + '<div class="text-muted small text-uppercase mb-2"><i class="bi bi-hourglass-bottom me-1"></i>Pass\u00e9 ' + escHtml(String(anciennete)) + ' ans</div>'
        + '<div class="fw-bold fs-2 text-secondary">' + escHtml(fmtK(pertePasse)) + '</div>'
        + '<div class="text-muted small mt-2">D\u00e9j\u00e0 support\u00e9.<br/>Non r\u00e9cup\u00e9rable.</div>'
        + '</div></div></div>'
        + '<div class="col-12 col-md-4"><div class="card h-100 border-0 bg-danger bg-opacity-10">'
        + '<div class="card-body text-center py-4">'
        + '<div class="text-muted small text-uppercase mb-2"><i class="bi bi-arrow-right me-1"></i>10 ans sans BDB</div>'
        + '<div class="fw-bold fs-2 text-danger">' + escHtml(fmtK(perteFutur10)) + '</div>'
        + '<div class="text-muted small mt-2">M\u00eames pertes, chaque ann\u00e9e.<br/>Aucune am\u00e9lioration.</div>'
        + '</div></div></div>'
        + '<div class="col-12 col-md-4"><div class="card h-100 border-0 bg-success bg-opacity-10">'
        + '<div class="card-body text-center py-4">'
        + '<div class="text-muted small text-uppercase mb-2"><i class="bi bi-check-circle me-1"></i>10 ans avec BDB</div>'
        + '<div class="fw-bold fs-2 ' + (net10 >= 0 ? 'text-success' : 'text-danger') + '">' + escHtml(fmtK(net10)) + '</div>'
        + '<div class="text-muted small mt-2">' + (net10 >= 0 ? 'B\u00e9n\u00e9fice net.<br/>Actif en croissance.' : 'Testez un autre profil.') + '</div>'
        + '</div></div></div>'
        /* P5 — Delta */
        + '<div class="col-12"><div class="card border-0 bg-primary bg-opacity-10">'
        + '<div class="card-body text-center py-3">'
        + '<span class="text-muted small">En choisissant BDB, votre \u00e9tablissement \u00e9conomise </span>'
        + '<strong class="fs-5 ' + (delta >= 0 ? 'text-success' : 'text-danger') + '">' + escHtml(fmtK(delta)) + '</strong>'
        + '<span class="text-muted small"> sur 10 ans par rapport au statu quo.</span>'
        + '</div></div></div>';
    }

    /* P6 — Message final : la question seule */
    $('proj-message').innerHTML = ''
      + '<div class="text-center">'
      + '<div class="fw-semibold fs-5">'
      + 'Maintenant que vous connaissez le co\u00fbt de ne rien faire,<br/>'
      + 'combien de temps pouvez-vous vous le permettre\u00a0?'
      + '</div></div>';
  }

  function setProfile(n){
    currentProfile=n;
    ['prudent','normal','ambitieux'].forEach(function(p){
      var b=$('bp-'+p); if(b) b.className='btn btn-sm '+(p===n?'btn-primary':'btn-outline-secondary');
    }); calc();
  }

  function resetAll(){ location.reload(); }

  function init(){
    if(window.bdbUser&&!window.bdbUser.isCreator){
      $('roi-loading').classList.add('d-none'); $('roi-denied').classList.remove('d-none'); return;
    }
    $('roi-loading').classList.add('d-none'); $('roi-content').classList.remove('d-none');
    renderBloc(); renderCnp(); renderGains(); renderTco(); renderProjection();
    document.querySelectorAll('input[type="range"]').forEach(function(e){e.addEventListener('input',calc);});
    var sw=$('s-lifetime'); if(sw) sw.addEventListener('change',calc);
    ['prudent','normal','ambitieux'].forEach(function(p){
      var b=$('bp-'+p); if(b) b.addEventListener('click',function(){setProfile(p);});
    });
    var br=$('btn-reset'); if(br) br.addEventListener('click',resetAll);
    /* Detail collapse toggle */
    var dt=$('btn-detail-toggle'); if(dt) dt.addEventListener('click',function(){
      var col=$('detail-collapse');
      if(col){
        var isOpen=col.classList.contains('show');
        if(isOpen){col.classList.remove('show'); dt.innerHTML='<i class="bi bi-chevron-down me-1"></i>D\u00e9tail du calcul';}
        else{col.classList.add('show'); dt.innerHTML='<i class="bi bi-chevron-up me-1"></i>Masquer le d\u00e9tail';}
      }
    });
    calc();
  }

  document.addEventListener('DOMContentLoaded',function(){
    if(window.bdbShellReady){window.bdbShellReady.then(init);}else{init();}
  });
})();
