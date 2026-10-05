/* thesaurus-recat.js — BDB · CDS · Module thesaurus
   Onglet Recatégorisation — CRUD admin pour PETITE INTERVENTION
   Principe C6 V2 : zéro perte de savoir opératoire */

Object.assign(ThesApp, {

  _recatData: [],
  _recatFiltered: [],
  _recatSelected: new Set(),
  _recatValidated: 0,
  _recatDeleted: 0,
  _recatPage: 1,
  _recatPageSize: 50,
  _recatPiProtoId: null,
  _recatDeleteId: null,
  _recatDetailCurrentId: null,
  _recatPanseuses: [],

  // REGLES DE SUGGESTION
  _recatRules: [
    { cat: 'ABLATION DE MATERIEL',         rx: /(ablat|abation|AMS\b|AMO\b|AMBO\b|AMSPLAQUE).*?(mat[eé?]riel|plaque|vis\b|broche|clou\b|agraf|fixat|hauban|endobout|clavette|cerclage)/i },
    { cat: 'ABLATION DE MATERIEL',         rx: /d[eé]v[eé]?rr?ouill|d[eé]rouill|d[eé]pl[aâ]tr|verrouillage\b.*?(clou|f[eé]mur|hum[eé]rus|montage|tibial)/i },
    { cat: 'ABLATION DE MATERIEL',         rx: /^ablat\b.*?(fil[s]?\b|1\s+fil)/i },
    { cat: 'ABLATION DE MATERIEL',         rx: /^vis\s+(asnis|interf|verrouill)/i },
    { cat: 'ABLATION DE MATERIEL',         rx: /plaque\s+(variax|synth[eè]s|poignet)/i },
    { cat: 'EXERESE TUMEUR / LESION',      rx: /(ablat|ex[eé?]r[eè?]se|Ex\?r\?se|excision|EX2R7SE|ablaiton).*?(tumeur|tum[eé]faction|lipome|schwann|neurofibr|h[eé]mangiom|angiome|fibrome|lymphangiom|tophus|tophi|naevus|m[eé]lanome|carcinome|polype|bourgeon|nodule|l[eé]sion|cellules\s+g|desmo|glomique|k[eé]ratoacanth|chondrome|enchondrome|n[eé]vrome|masse\b|KS\b|kyste|verrue|[eé]pine\b|calcification|ganglion|SCHOVANOME)/i },
    { cat: 'EXERESE TUMEUR / LESION',      rx: /^(lipome|LIPOME|Hemangiome|Naevus|Tumeur|TUMEFACTION)\b/i },
    { cat: 'EXERESE TUMEUR / LESION',      rx: /l[eé]sion\s+(cutan|nodulaire)/i },
    { cat: 'EXERESE TUMEUR / LESION',      rx: /bursite|bursectomie/i },
    { cat: 'EXERESE TUMEUR / LESION',      rx: /(ex[eé]r[eè]se|excision)\b.*?(face\s+(palmaire|dorsale)|sous\s+ungu|matrice\s+ungu|ongle|[eé]largie|partielle\s+ongle|partielle\s+tablette)/i },
    { cat: 'EXOSTOSE',                     rx: /(ablat|ex[eé]r[eè]?se|r[eé]section|biopsie|excision|exrese).*?exostose|exostosectomie|^Exostose\b/i },
    { cat: 'ABLATION OSSIFICATION',        rx: /(ablat|ex[eé]r[eè]?se|emondage|[eé]mondage|r[eé]section|excision).*?(oss[ié]fication|ost[eé?]ophyte|s[eé]questre|spicule|rostre|fragment\s+oss|osseuse|osseux)/i },
    { cat: 'ABLATION OSSIFICATION',        rx: /^[eé]?mondage\b|^EMONDAGE\b/i },
    { cat: 'CORPS ETRANGER',              rx: /\bCE\b.*?(main|doigt|pouce|index|R[2-5]|cuisse|bras|avant.bras|base\s+pouce|pied|CER2)/i },
    { cat: 'CORPS ETRANGER',              rx: /corps\s+([eé]trang|Ã©trang)|implant\s+contraceptif|EXERESE\s+CE/i },
    { cat: 'CORPS ETRANGER',              rx: /(extraction|ablat).*?[eé]charde|[eé]charde\b.*?(main|doigt|th[eé]nar)/i },
    { cat: 'EXPLORATION DE PLAIE',         rx: /exploration\b.*?(main|doigt|pouce|index|R[2-5]|D[2-5]|MCP|IPP|IPD|fl[eé?]chiss|extenseur|nerf|tend|biceps|SPE|face|gros\s+orteil|cheville|genou|coude|carpe|avant.bras)/i },
    { cat: 'EXPLORATION DE PLAIE',         rx: /(laie|plaie)\s+de?\s+(main|doigt)|[eé]crasement\b.*?(doigt|main|orteil)/i },
    { cat: 'PHLEGMON',                     rx: /phl?[eé]gmon|Flegmon|phlÃ©gmon|panaris|p[eé]rionyxis/i },
    { cat: 'PHLEGMON',                     rx: /abc[eèéÃ?]s\b.*?(main|doigt|index|pouce|R[2-5]|pulp|genou)/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /ost[eé?]osynth|^synth[eè]se\b|^fracture\b|^fr[\s\/]|^fre\s|^F\/\s|embrochage|^enclouage\b|clou\s+(t2|trigen|hum[eéÃ])|bi\s*mal[léÃ]|tri\s*mal|[eé]quivalent\s+bimal/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /hauban[n]?age\s+(de\s+)?(la\s+)?rotule/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /vissage\b.*?(col\s+f[eéÃ]m|[eé]piphysioly|tibia|scapho)/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /^BROCHE\b.*?M[1-5]|broche\s+variax/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /arrachement\s+osseux|syndesmo[ds][eè]se/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /entorse\b.*?(pouce|MCP|scapho|poignet|grave)/i },
    { cat: 'SYNTHESE DE FRACTURE',         rx: /^plateau\s+tibial/i },
    { cat: 'ARTHRODESE',                   rx: /arthrod[eè]se/i },
    { cat: 'PROTHESE',                     rx: /proth[eè]se|prothÃ¨se|^PTG\b|^PTE\b|^PT\s+Genou|^THS\b|spacer|m[eé]daillon\s+rotulien|changement.*(PE\b|pi[eè]ce|cupule)|r[eé]implantation.*proth|h[eé]mi.arthroplastie|ablation.*tete.*col\b|r[eé]section.*tete.*col|prot\s+interm/i },
    { cat: 'TRAPEZECTOMIE',                rx: /arthroplastie\b.*?(trap[eé?]zo|interposition|rhizarthrose)|trap[eé]zectomie|rhizarthrose/i },
    { cat: 'LIGAMENTOPLASTIE',             rx: /ligamentoplastie|but[eé]e\b.*?(latarjet|coracoid|[eé]paule)|bankart|DIDT\b|MPFL\b|brostrom|r[eé]paration\s+LTFA|kenneth\s+jones/i },
    { cat: 'RUPTURE TENDON',               rx: /rupture\b.*?(quadriceps|biceps|pectoral|extenseur|achille|talon\s+d|tendon|TA\b|LEP\b|fl[eé]chiss|coiffe)/i },
    { cat: 'SUTURE / REINSERTION',         rx: /(suture|r[eé]paration|r[eé]insertion|rÃ©insertion|rÃ©paration)\b.*?(tendon|extenseur|fl[eé]chiss|biceps|LLI|LLE|LTFA|LCM|retinaculum|patellaire|rotulien|pectoral|quadricip|p[eé]ronier|fibulaire|coiffe|m[eé]nisca|fessier|ischio|plaque\s+palm|ligament|plan\s+externe|musculaire)/i },
    { cat: 'SUTURE / REINSERTION',         rx: /^extenseur\b|^fl[eé]chisseur\b|^FlÃ©chisseur\b|^r[eé]insertion\b|^rÃ©insertion\b/i },
    { cat: 'SUTURE / REINSERTION',         rx: /jersey\s+finger|mallet\b.*?finger|mallet\s+fingger|rugby\s+finger|MALLET\s+DE\s+FINGER/i },
    { cat: 'SUTURE / REINSERTION',         rx: /resanglage|t[eé]nolyse|T\?nolyse|t[eé]nosynovectomie|t[eé]noderm|t[eé]nod[eè]se|t[eé]noarthrolyse/i },
    { cat: 'SUTURE / REINSERTION',         rx: /transfert\b.*(extenseur|fl[eé]chiss|FCS|LFH)|greffe\s+tendon|arrachement\s+plaque\s+palmaire|desinsertion\b.*fessier/i },
    { cat: 'SUTURE / REINSERTION',         rx: /stabilisation\b.*?(extenseur|tendon)|reconstruction\b.*?(poulie|bandelette|extenseur|EVC)|r[eé]fection\b.*?(poulie|ligament|moignon|PFL)/i },
    { cat: 'SUTURE / REINSERTION',         rx: /retension\s+plaque\s+palmaire|peignage\b/i },
    { cat: 'SUTURE / REINSERTION',         rx: /section\s+(extenseur|bandelette\s+ilio)/i },
    { cat: 'SUTURE / REINSERTION',         rx: /^tendon\b.*?(quadricip|rotulien|extenseur|p[eé]ronier|pouce|genou|biceps)/i },
    { cat: 'SUTURE / REINSERTION',         rx: /^tendons?\s+p[eé]roniers/i },
    { cat: 'ARTHROSCOPIE',                 rx: /arthroscopie|s\/scopie|sous\s+(arthro|endo)scopie|scopie\s+it[eéÃ]rative|\barthro\b\s+genou|endoscopie\b.*?cheville/i },
    { cat: 'ARTHROSCOPIE',                 rx: /blocage\s+m[eé]nisc|m[eé?]niscoplastie|suture\s+m[eé]nisc/i },
    { cat: 'ARTHRITE / LAVAGE',            rx: /arthrite|lavage\b.*?(articulaire|genou|hanche|[eé]paule|coude|cheville|main|pied|PTG|PTH)|ost[eé]ite|ost[eé]iie|ost[eé]omyelite|carpite|ost[eé]o.arthrite/i },
    { cat: 'ARTHRITE / LAVAGE',            rx: /cellulite\b|erysip[eè]le|fascii?te|infection\b.*?(pied|orteil|genou|O[1-5])/i },
    { cat: 'ARTHRITE / LAVAGE',            rx: /collection\b.*?(jambe|pied|cuisse)|n[eé]crosectomie|d[eé]collement\s+septique/i },
    { cat: 'ARTHRITE / LAVAGE',            rx: /(coude|[eé]paule)\s+infect[eéÃ]|evacuation\s+collection|evidement\s+osseux|curetage\s+comblement|CUROPSIE/i },
    { cat: 'NERF / LIBERATION',            rx: /nerf\s+ulnaire|compression\s+nerf|de\s+quervain|neurectomie|neurotomie|transposition.*nerf|enfouissement\s+nerf|[eé]picondylite|[eé]pitroch|d[eé]nervation/i },
    { cat: 'NERF / LIBERATION',            rx: /lib[eé]ration\b.*?(nerf|SPE|sciatique|appareil\s+fl[eé]chiss|poulie|avant\s+bras)/i },
    { cat: 'NERF / LIBERATION',            rx: /r[eé]section\b.*?(nerf|FCP|fl[eé]chiss.*profond)/i },
    { cat: 'NERF / LIBERATION',            rx: /tunnel\s+radial|syndrome\s+.*bandelette\s+ilio|^sd\s+bandelette/i },
    { cat: 'NERF / LIBERATION',            rx: /tendinoscopie|tendinite\s+kystique/i },
    { cat: 'DOIGT A RESSAUT',              rx: /doigt\s+[aà]\s+ress(ort|aut)|pouce\s+[aà]\s+ress(ort|aut)|lib[eé]ration\s+poulie\s+A1/i },
    { cat: 'CHIRURGIE PIED',               rx: /griffe[s]?\b.*?(orteil|O[1-5]|d.orteil)|orteil.*?(griffe|marteau)|weil\b|DMMO|hallux\s+(valgus|rigidus)|ch[eé]le[ïi]?ctomie|^hv\b/i },
    { cat: 'CHIRURGIE PIED',               rx: /apon[eé]vr[eéo].*?plantaire|apon[eé]vrectomie|ongle\s+en\s+tuil|matric[eè]?ctomie|tablette\s+ungu|r[eé]tronychie|avulsion\b.*?(ungu|ongle)|oeil\s+de\s+perdrix/i },
    { cat: 'CHIRURGIE PIED',               rx: /allongement.*gastrocn|calcan[eé]?oplastie|haglund|arthrorise|tarse\s+bossu|s[eé]samo[ïi]dectomie|cure\s+ongles|synchondrose|synostose\s+talocalc/i },
    { cat: 'CHIRURGIE PIED',               rx: /(d[eé]formation|d[eé]viation|r[eé]alignement|r[eé]orientation|raccourcissement).*?orteil/i },
    { cat: 'CHIRURGIE PIED',               rx: /allongement\s+extenseur\s+hallux|duplication.*orteil|cors\b|t[eé]notomie\b.*?(pied|orteil|O[1-5]|extenseur.*pied|plantaire|02|03|04|05|psoas)/i },
    { cat: 'CHIRURGIE PIED',               rx: /os\s+naviculaire|r[eé]section\b.*?(matrice\s+ungu|tablette|ongle|arthroplast.*?pied|partielle\s+tete\s+M1|tête\s+M1)/i },
    { cat: 'CHIRURGIE PIED',               rx: /tophi\b.*?pied|sous\s+talienne/i },
    { cat: 'OSTEOTOMIE',                   rx: /ost[eé?]otomie\b|abaissement.*TTA|transposition\s+(TTA|tub[eé]rosit)|\bOTV\b|[eé]piphysiod[eè]se|Epiphysiod[eè]s|d[eé]s[eé]piphysiod[eè]se|[eé]piphysioly|EPIPHISIOLYSE/i },
    { cat: 'PSEUDARTHROSE',                rx: /pseudarth?rose|matti\s+russe|d[eé]cortication\s+greffe|cure\s+de\s+pseudarthrose/i },
    { cat: 'SYNDROME DES LOGES',           rx: /syndrome\s+des?\s+loges?|apon[eé]vrotomie\b.*?(jambe|loge|avant.bras|post[eé]rieure)|fermeture\s+syndrome/i },
    { cat: 'RESECTION CARPE / POIGNET',    rx: /r[eé]section\b.*?(1[eè]?r?e?\s+rang|carpe|Darrach|sterno.clavic|pisiforme|hamulus|hamatum|carpe\s+bossu|pole?\s+distal)|lunarectomie|sauv[eé].kapandji|capsulod[eè]se|stylo[ïi]dectomie|intervention\s+de\s+Darrach|rÃ©section\b.*?(rang|carpe|pole)/i },
    { cat: 'AMPUTATION',                   rx: /^amputation\b|r[eé]gularisation\b.*?(R[2-5]|D[2-5]|doigt|orteil|moignon|trans)/i },
    { cat: 'ARTHROLYSE',                   rx: /arthrolyse|arthrotomie/i },
    { cat: 'PATELLA / ROTULE',             rx: /patelloplastie|patellectomie|r[eé]axation|section.*aileron|Osgood|resurfaçage\s+rotule|r[eé]section\b.*?(rotule|patella|bord\s+lat)/i },
    { cat: 'SYNOVECTOMIE',                 rx: /synovectomie|synovite|t[eé]nosynovite/i },
    { cat: 'PLASTIE / LAMBEAU',            rx: /plastie\s+(cutan|de\s+glissement|en\s+losange|TFL|en\s+drapeau|gastrocn|allongement|d.ouverture|bandelette|ligament\s+patellaire|tendons?\s+p[eé]ronier)/i },
    { cat: 'PLASTIE / LAMBEAU',            rx: /lambeau\b|greffe\s+de\s+(peau|banque)|n[eé?]crose\b|br[uû]lure|ulcere|sinus\s+pilonidal|escarre|scalp\b/i },
    { cat: 'PLASTIE / LAMBEAU',            rx: /drainage\b.*?(h[eé?Ã]matome|morel|coude|majeur)|h[eéÃ]matome\b|MOREL\s+LAVALE/i },
    { cat: 'REPRISE CHIRURGICALE',         rx: /^reprise\b/i },
    { cat: 'BIOPSIE',                      rx: /^biopsie\b|^bippsie\b/i },
    { cat: 'MORSURE',                      rx: /morsure|morcure/i },
    { cat: 'RACHIS',                       rx: /XIA\b|arthrod[eè]se\s+vert[eé]brale|rachis|fixation\s+lombaire|coccygectomie|saccrum/i },
    { cat: 'GESTE MINEUR',                 rx: /^pl[aâ]tre\b|r[eé]fection.*pl[aâ]tr|refction.*platre|botte.*pl[aâ]tr|confection.*r[eé]sine/i },
    { cat: 'GESTE MINEUR',                 rx: /^r[eé]duction\b|R2DUCTION|rÃ©duction\b.*?(ortho|luxation|poignet|cheville)|^reduc\s+ortho/i },
    { cat: 'GESTE MINEUR',                 rx: /mobilisation\b|^pansement\b|V[eé]rifier\s+pansement|r[eé]fection.*pansement|^infiltration\b|traction\s+sous|gypsotomie|^ponction\b/i },
    { cat: 'GESTE MINEUR',                 rx: /pose\s+de?\s+(VAC|agrafe|site)|al[eé]sage|nettoyage\b.*?(pied|genou|escarre|cicatrice|chirurgical|pulpe)|parage\b|d[eé]tersion/i },
    { cat: 'GESTE MINEUR',                 rx: /luxation\b.*?([eé]paule|Ã©paule)|^luxation$/i },
    { cat: 'GESTE MINEUR',                 rx: /mise\s+en\s+place.*cath[eé]ter|mise\s+a\s+plat|bivalver|ongle\s+arrach|mal\s+perforant|^Petite\s+Intervention|^PI\s+dte/i },
    { cat: 'GESTE MINEUR',                 rx: /lib[eé]ration\s+ligament\s+sur\s+PTG|site\s+implantable/i },
  ],

  // ════════════════════════════════════════════════════════════
  // SPÉCIALITÉ — Chirurgien → ortho/neuro
  // Règle : LAGARRIGUE = neuro, tous les autres = ortho
  // ════════════════════════════════════════════════════════════
  _recatIsNeuro: function(chirurgienId) {
    if (!chirurgienId) return false;
    var c = (this._chirurgiens || []).find(function(x) { return x.id === chirurgienId; });
    return c && c.nom === 'LAGARRIGUE';
  },

  _recatListIdFor: function(chirurgienId) {
    return this._recatIsNeuro(chirurgienId) ? 'recatProtoListNeuro' : 'recatProtoListOrtho';
  },

  _recatSuggest: function(note) {
    if (!note) return '';
    for (var i = 0; i < this._recatRules.length; i++) {
      if (this._recatRules[i].rx.test(note)) return this._recatRules[i].cat;
    }
    return '';
  },

  _recatParseProto: function(val) {
    if (!val) return null;
    var match = val.match(/^(ACT-\d+)/);
    if (!match) return null;
    var p = this.data.find(function(x) { return x.id_protocole === match[1]; });
    return p ? p.id : null;
  },

  // INIT
  initRecat: function() {
    var self = this;
    // Populate 2 datalists filtrés par spécialité
    var dlOrtho = document.getElementById('recatProtoListOrtho');
    var dlNeuro = document.getElementById('recatProtoListNeuro');
    var optsOrtho = [], optsNeuro = [];
    this.data.forEach(function(p) {
      var label = escHtml(p.id_protocole + ' \u2014 ' + p.libelle_cible);
      var opt = '<option value="' + label + '"></option>';
      if (p.specialite === 'NEUROCHIRURGIE') { optsNeuro.push(opt); }
      else { optsOrtho.push(opt); }
    });
    dlOrtho.innerHTML = optsOrtho.join('');
    dlNeuro.innerHTML = optsNeuro.join('');

    document.getElementById('btnRecatLoad').addEventListener('click', function() { self._recatLoad(); });
    document.getElementById('recatSearch').addEventListener('input', function() {
      self._recatApplyFilters(); self._recatPage = 1; self._recatRender();
    });
    document.getElementById('recatFilterCat').addEventListener('change', function() {
      self._recatApplyFilters(); self._recatPage = 1; self._recatRender();
    });
    document.getElementById('recatFilterChir').addEventListener('change', function() {
      self._recatApplyFilters(); self._recatPage = 1; self._recatRender();
    });
    document.getElementById('recatCheckAll').addEventListener('change', function(e) {
      self._recatSelected.clear();
      if (e.target.checked) { self._recatFiltered.forEach(function(r) { self._recatSelected.add(r.id); }); }
      self._recatRender(); self._recatUpdateBatch();
    });
    document.getElementById('btnRecatBatchApply').addEventListener('click', function() { self._recatBatchApply(); });
    document.getElementById('btnRecatBatchCancel').addEventListener('click', function() {
      self._recatSelected.clear(); self._recatRender(); self._recatUpdateBatch();
    });
    document.getElementById('recatBatchProto').addEventListener('input', function() {
      document.getElementById('btnRecatBatchApply').disabled = !self._recatParseProto(this.value);
    });
    document.getElementById('btnRecatConfirmDelete').addEventListener('click', function() { self._recatDeleteConfirmed(); });

    // Modal detail actions
    document.getElementById('recatDetailProtoInput').addEventListener('input', function() {
      document.getElementById('btnRecatDetailValidate').disabled = !self._recatParseProto(this.value);
    });
    document.getElementById('btnRecatDetailValidate').addEventListener('click', function() { self._recatDetailValidate(); });
    document.getElementById('btnRecatDetailAcceptSugg').addEventListener('click', function() { self._recatDetailAcceptSugg(); });
    document.getElementById('btnRecatDetailDelete').addEventListener('click', function() {
      var id = self._recatDetailCurrentId; if (!id) return;
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRecatDetail')).hide();
      self._recatAskDelete(id);
    });

    this._recatLoad();
  },

  // LOAD
  _recatLoad: async function() {
    var self = this;
    var loadEl = document.getElementById('recatLoading');
    var emptyEl = document.getElementById('recatEmpty');
    var tableWrap = document.getElementById('recatTableWrap');
    loadEl.classList.remove('d-none'); emptyEl.classList.add('d-none'); tableWrap.classList.add('d-none');

    var piProto = this.data.find(function(p) { return p.libelle_cible === 'PETITE INTERVENTION'; });
    if (!piProto) {
      loadEl.classList.add('d-none'); emptyEl.classList.remove('d-none');
      emptyEl.querySelector('p').textContent = 'Protocole PETITE INTERVENTION introuvable.';
      return;
    }
    this._recatPiProtoId = piProto.id;

    // Charger panseuses (si pas déjà fait)
    if (!this._recatPanseuses.length) {
      try {
        var rp = await window.bdb.from('thesaurus_panseuses').select('id,nom,prenom,profil,role_bloc');
        if (rp.data) this._recatPanseuses = rp.data;
      } catch(_) { /* continue sans panseuses */ }
    }

    var all = [], from = 0, PAGE = 1000;
    while (true) {
      var resp = await window.bdb.from('thesaurus_interventions')
        .select('id,note,chirurgien_id,panseuse_id,date_intervention,protocole_id,lateralite')
        .eq('protocole_id', piProto.id).order('note', { ascending: true }).range(from, from + PAGE - 1);
      if (resp.error || !resp.data || resp.data.length === 0) break;
      all = all.concat(resp.data);
      if (resp.data.length < PAGE) break;
      from += PAGE;
    }
    loadEl.classList.add('d-none');

    // Enrichissement complet depuis FK
    all.forEach(function(r) {
      // Chirurgien
      var chir = (self._chirurgiens || []).find(function(c) { return c.id === r.chirurgien_id; });
      r.chirurgien = chir ? chir.label : '';
      r.chirurgienSpec = chir ? (chir.specialite || '') : '';
      // Panseuse
      var pans = self._recatPanseuses.find(function(p) { return p.id === r.panseuse_id; });
      r.panseuse = pans ? (pans.nom + (pans.prenom ? ' ' + pans.prenom : '')) : '';
      r.panseuseProfil = pans ? (pans.profil || '') : '';
      r.panseuseRole = pans ? (pans.role_bloc || '') : '';
      // Date lisible
      r.annee = r.date_intervention ? String(r.date_intervention).substring(0, 4) : '';
      r.dateFull = r.date_intervention ? String(r.date_intervention).substring(0, 7) : '';
      // Suggestion
      r.suggestion = self._recatSuggest(r.note);
    });

    this._recatData = all; this._recatSelected.clear();
    this._recatValidated = 0; this._recatDeleted = 0; this._recatPage = 1;
    this._recatFillFilters();

    if (all.length === 0) { emptyEl.classList.remove('d-none'); this._recatUpdateKPIs(); return; }
    this._recatApplyFilters(); tableWrap.classList.remove('d-none');
    this._recatRender(); this._recatUpdateKPIs();
  },

  // FILTERS
  _recatFillFilters: function() {
    var cats = {}, chirs = {};
    this._recatData.forEach(function(r) {
      if (r.suggestion) cats[r.suggestion] = (cats[r.suggestion] || 0) + 1;
      if (r.chirurgien) chirs[r.chirurgien] = true;
    });
    var selCat = document.getElementById('recatFilterCat');
    selCat.innerHTML = '<option value="">Toutes (' + this._recatData.length + ')</option><option value="__none__">(sans suggestion)</option>';
    Object.keys(cats).sort().forEach(function(c) { selCat.appendChild(new Option(c + ' (' + cats[c] + ')', c)); });
    var selChir = document.getElementById('recatFilterChir');
    selChir.innerHTML = '<option value="">Tous chirurgiens</option>';
    Object.keys(chirs).sort().forEach(function(c) { selChir.appendChild(new Option(c, c)); });
  },

  _recatApplyFilters: function() {
    var q = (document.getElementById('recatSearch').value || '').toLowerCase().trim();
    var cat = document.getElementById('recatFilterCat').value;
    var chir = document.getElementById('recatFilterChir').value;
    this._recatFiltered = this._recatData.filter(function(r) {
      if (q && !(r.note || '').toLowerCase().includes(q)) return false;
      if (cat === '__none__' && r.suggestion) return false;
      if (cat && cat !== '__none__' && r.suggestion !== cat) return false;
      if (chir && r.chirurgien !== chir) return false;
      return true;
    });
  },

  // RENDER
  _recatRender: function() {
    var self = this, total = this._recatFiltered.length;
    var ps = this._recatPageSize, page = this._recatPage;
    var totalPages = Math.max(1, Math.ceil(total / ps));
    if (page > totalPages) page = totalPages;
    var slice = this._recatFiltered.slice((page - 1) * ps, page * ps);
    var tbody = document.getElementById('recatTableBody');

    tbody.innerHTML = slice.map(function(r) {
      var checked = self._recatSelected.has(r.id) ? ' checked' : '';
      var suggBadge = r.suggestion
        ? '<span class="badge bg-info-subtle text-info border border-info-subtle">' + escHtml(r.suggestion) + '</span>'
        : '<span class="badge bg-light text-muted border">\u2014</span>';
      return '<tr data-id="' + escHtml(r.id) + '">' +
        '<td><input type="checkbox" class="form-check-input recat-check"' + checked + '/></td>' +
        '<td class="small">' + escHtml(r.note || '(vide)') + '</td>' +
        '<td class="small text-muted">' + escHtml(r.chirurgien) + '</td>' +
        '<td class="small text-muted font-monospace">' + escHtml(r.annee) + '</td>' +
        '<td>' + suggBadge + '</td>' +
        '<td><input type="text" class="form-control form-control-sm recat-proto-input" list="' + self._recatListIdFor(r.chirurgien_id) + '" placeholder="Taper ACT ou libell\u00e9\u2026"/></td>' +
        '<td style="text-align:right"><div style="display:flex;gap:4px;justify-content:flex-end">' +
          '<a class="app-icon-btn recat-detail-btn" title="D\u00e9tail" role="button"><i class="bi bi-eye"></i></a>' +
          '<a class="app-icon-btn app-icon-btn--success recat-validate-btn" title="Valider" role="button" style="pointer-events:none;opacity:.4"><i class="bi bi-check-lg"></i></a>' +
          '<a class="app-icon-btn app-icon-btn--danger recat-delete-btn" title="Supprimer" role="button"><i class="bi bi-trash"></i></a>' +
        '</div></td></tr>';
    }).join('');

    tbody.querySelectorAll('.recat-check').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var id = cb.closest('tr').dataset.id;
        if (cb.checked) self._recatSelected.add(id); else self._recatSelected.delete(id);
        self._recatUpdateBatch();
      });
    });
    tbody.querySelectorAll('.recat-proto-input').forEach(function(inp) {
      inp.addEventListener('input', function() {
        var vb = inp.closest('tr').querySelector('.recat-validate-btn');
        var ok = self._recatParseProto(inp.value);
        vb.style.pointerEvents = ok ? '' : 'none';
        vb.style.opacity = ok ? '' : '.4';
      });
    });
    tbody.querySelectorAll('.recat-validate-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tr = btn.closest('tr'), id = tr.dataset.id;
        var uuid = self._recatParseProto(tr.querySelector('.recat-proto-input').value);
        if (uuid) self._recatValidateOne(id, uuid, tr);
      });
    });
    tbody.querySelectorAll('.recat-detail-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { self._recatShowDetail(btn.closest('tr').dataset.id); });
    });
    tbody.querySelectorAll('.recat-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { self._recatAskDelete(btn.closest('tr').dataset.id); });
    });

    document.getElementById('recatPageInfo').textContent = total + ' lignes \u2014 page ' + page + '/' + totalPages;
    var pagEl = document.getElementById('recatPagination');
    if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
    var pages = [];
    if (page > 1) pages.push({ label: '\u2039', p: page - 1 });
    for (var i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push({ label: String(i), p: i, active: i === page });
    if (page < totalPages) pages.push({ label: '\u203A', p: page + 1 });
    pagEl.innerHTML = pages.map(function(pg) {
      return '<li class="page-item ' + (pg.active ? 'active' : '') + '"><button class="page-link" data-p="' + pg.p + '" type="button">' + pg.label + '</button></li>';
    }).join('');
    pagEl.querySelectorAll('button[data-p]').forEach(function(b) {
      b.addEventListener('click', function() { self._recatPage = +b.dataset.p; self._recatRender(); });
    });
  },

  // DETAIL MODAL
  _recatShowDetail: async function(id) {
    var r = this._recatData.find(function(x) { return x.id === id; });
    if (!r) return;
    var latMap = { D: 'Droite', G: 'Gauche', B: 'Bilatéral' };
    // Note
    document.getElementById('recatDetailNote').textContent = r.note || '(vide)';
    // Contexte
    document.getElementById('recatDetailDate').textContent = r.dateFull || '\u2014';
    document.getElementById('recatDetailLat').textContent = r.lateralite ? (latMap[r.lateralite] || r.lateralite) : '\u2014';
    document.getElementById('recatDetailProto').textContent = 'PETITE INTERVENTION (ACT-0432)';
    // Suggestion
    var suggEl = document.getElementById('recatDetailSugg');
    suggEl.innerHTML = r.suggestion
      ? '<span class="badge bg-info-subtle text-info border border-info-subtle">' + escHtml(r.suggestion) + '</span>'
      : '<span class="text-muted">Aucune suggestion</span>';
    // Équipe
    document.getElementById('recatDetailChir').textContent = r.chirurgien || '\u2014';
    document.getElementById('recatDetailChirSpec').textContent = r.chirurgienSpec || '';
    document.getElementById('recatDetailPans').textContent = r.panseuse || '\u2014';
    document.getElementById('recatDetailPansRole').textContent =
      [r.panseuseProfil, r.panseuseRole].filter(Boolean).join(' \u2014 ') || '';
    // ID
    document.getElementById('recatDetailId').textContent = r.id;
    this._recatDetailCurrentId = id;

    // Footer actions : reset
    document.getElementById('recatDetailProtoInput').value = '';
    document.getElementById('recatDetailProtoInput').setAttribute('list', this._recatListIdFor(r.chirurgien_id));
    var specBadge = document.getElementById('recatDetailSpecBadge');
    if (this._recatIsNeuro(r.chirurgien_id)) {
      specBadge.className = 'badge thes-badge-neuro';
      specBadge.textContent = 'NEURO';
    } else {
      specBadge.className = 'badge thes-badge-ortho';
      specBadge.textContent = 'ORTHO';
    }
    document.getElementById('btnRecatDetailValidate').disabled = true;
    // Suggestion button : enabled si suggestion existe
    var suggBtn = document.getElementById('btnRecatDetailAcceptSugg');
    if (r.suggestion) {
      suggBtn.disabled = false;
      suggBtn.innerHTML = '<i class="bi bi-lightning me-1"></i>' + escHtml(r.suggestion);
    } else {
      suggBtn.disabled = true;
      suggBtn.innerHTML = '<i class="bi bi-lightning me-1"></i>Pas de suggestion';
    }

    // Staging : reset
    document.getElementById('recatDetailStagingLoading').classList.remove('d-none');
    document.getElementById('recatDetailStagingContent').classList.add('d-none');
    document.getElementById('recatDetailStagingEmpty').classList.add('d-none');

    // Show modal immediately (staging loads in background)
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRecatDetail')).show();

    // Staging lookup : match date_clean + chirurgien_id + note
    try {
      var q = window.bdb.from('staging_interventions_ortho')
        .select('protocole_operatoire,protocole_anesthesie,duree_minutes,protheses,sexe,specialite,_mapping_notes')
        .eq('chirurgien_id', r.chirurgien_id)
        .eq('date_clean', r.date_intervention);
      if (r.note) q = q.eq('note', r.note);
      var resp = await q.limit(1);

      document.getElementById('recatDetailStagingLoading').classList.add('d-none');

      if (resp.data && resp.data.length > 0) {
        var s = resp.data[0];
        document.getElementById('recatDetailOptim').textContent = s.protocole_operatoire || '\u2014';
        document.getElementById('recatDetailAnesth').textContent = s.protocole_anesthesie || '\u2014';
        document.getElementById('recatDetailDuree').textContent = s.duree_minutes || '\u2014';
        document.getElementById('recatDetailSpec').textContent = s.specialite || '\u2014';
        document.getElementById('recatDetailSexe').textContent = s.sexe || '\u2014';
        document.getElementById('recatDetailProtheses').textContent = s.protheses || '\u2014';
        document.getElementById('recatDetailMapNotes').textContent = s._mapping_notes || '\u2014';
        document.getElementById('recatDetailStagingContent').classList.remove('d-none');
      } else {
        document.getElementById('recatDetailStagingEmpty').classList.remove('d-none');
      }
    } catch(_) {
      document.getElementById('recatDetailStagingLoading').classList.add('d-none');
      document.getElementById('recatDetailStagingEmpty').classList.remove('d-none');
    }
  },

  // MODAL VALIDATE — protocole saisi dans l'input
  _recatDetailValidate: async function() {
    var id = this._recatDetailCurrentId; if (!id) return;
    var val = document.getElementById('recatDetailProtoInput').value;
    var protoUuid = this._recatParseProto(val);
    if (!protoUuid) return;
    var btn = document.getElementById('btnRecatDetailValidate');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Validation\u2026';
    var resp = await window.bdb.from('thesaurus_interventions').update({ protocole_id: protoUuid }).eq('id', id).select();
    if (resp.error) {
      this.toast('Error', 'Erreur : ' + resp.error.message);
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Valider protocole';
      return;
    }
    if (!resp.data || resp.data.length === 0) {
      this.toast('Error', 'UPDATE bloqu\u00e9 par RLS \u2014 v\u00e9rifier droits admin.');
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Valider protocole';
      return;
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRecatDetail')).hide();
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Valider protocole';
    this._recatData = this._recatData.filter(function(r) { return r.id !== id; });
    this._recatSelected.delete(id); this._recatValidated++;
    this._recatApplyFilters(); this._recatRender(); this._recatUpdateKPIs();
    this.toast('Success', 'Intervention recat\u00e9goris\u00e9e.');
  },

  // MODAL ACCEPT SUGGESTION — cherche le protocole le plus proche de la catégorie suggérée
  _recatDetailAcceptSugg: function() {
    var id = this._recatDetailCurrentId; if (!id) return;
    var r = this._recatData.find(function(x) { return x.id === id; });
    if (!r || !r.suggestion) return;
    var input = document.getElementById('recatDetailProtoInput');
    var cat = r.suggestion;
    var isNeuro = this._recatIsNeuro(r.chirurgien_id);
    // Chercher le protocole dans la bonne spécialité
    var match = this.data.find(function(p) {
      if (isNeuro && p.specialite !== 'NEUROCHIRURGIE') return false;
      if (!isNeuro && p.specialite === 'NEUROCHIRURGIE') return false;
      return p.libelle_cible.toUpperCase().indexOf(cat.toUpperCase()) !== -1;
    });
    if (match) {
      input.value = match.id_protocole + ' \u2014 ' + match.libelle_cible;
      document.getElementById('btnRecatDetailValidate').disabled = false;
    } else {
      input.value = cat;
      input.focus();
    }
  },

  // DELETE
  _recatAskDelete: function(id) {
    var r = this._recatData.find(function(x) { return x.id === id; });
    if (!r) return;
    this._recatDeleteId = id;
    document.getElementById('recatDeleteNote').textContent = (r.note || '(vide)').substring(0, 120);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRecatDelete')).show();
  },

  _recatDeleteConfirmed: async function() {
    var id = this._recatDeleteId; if (!id) return;
    var btn = document.getElementById('btnRecatConfirmDelete');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Suppression\u2026';
    var resp = await window.bdb.from('thesaurus_interventions').delete().eq('id', id).select();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRecatDelete')).hide();
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-trash me-1"></i>Supprimer';
    if (resp.error) { this.toast('Error', 'Erreur : ' + resp.error.message); return; }
    if (!resp.data || resp.data.length === 0) { this.toast('Error', 'Suppression bloqu\u00e9e par RLS — v\u00e9rifier droits admin.'); return; }
    this._recatData = this._recatData.filter(function(r) { return r.id !== id; });
    this._recatSelected.delete(id); this._recatDeleted++;
    this._recatApplyFilters(); this._recatRender(); this._recatUpdateKPIs();
    this.toast('Success', 'Intervention supprim\u00e9e.');
  },

  // VALIDATE ONE
  _recatValidateOne: async function(id, protoUuid, tr) {
    var btn = tr.querySelector('.recat-validate-btn');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    var resp = await window.bdb.from('thesaurus_interventions').update({ protocole_id: protoUuid }).eq('id', id).select();
    if (resp.error) { this.toast('Error', 'Erreur : ' + resp.error.message); btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i>'; return; }
    if (!resp.data || resp.data.length === 0) { this.toast('Error', 'UPDATE bloqu\u00e9 par RLS — v\u00e9rifier droits admin.'); btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i>'; return; }
    this._recatData = this._recatData.filter(function(r) { return r.id !== id; });
    this._recatSelected.delete(id); this._recatValidated++;
    this._recatApplyFilters(); this._recatRender(); this._recatUpdateKPIs();
    this.toast('Success', 'Intervention recat\u00e9goris\u00e9e.');
  },

  // BATCH
  _recatBatchApply: async function() {
    var val = document.getElementById('recatBatchProto').value;
    var protoUuid = this._recatParseProto(val);
    if (!protoUuid || this._recatSelected.size === 0) return;
    var ids = Array.from(this._recatSelected);
    var btn = document.getElementById('btnRecatBatchApply');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Application\u2026';
    var errors = 0;
    for (var i = 0; i < ids.length; i += 100) {
      var batch = ids.slice(i, i + 100);
      var resp = await window.bdb.from('thesaurus_interventions').update({ protocole_id: protoUuid }).in('id', batch).select();
      if (resp.error) { errors++; this.toast('Error', 'Erreur batch : ' + resp.error.message); }
      else if (!resp.data || resp.data.length === 0) { errors++; this.toast('Error', 'Batch bloqu\u00e9 par RLS \u2014 v\u00e9rifier droits admin.'); }
    }
    var idSet = new Set(ids);
    this._recatData = this._recatData.filter(function(r) { return !idSet.has(r.id); });
    this._recatValidated += ids.length - errors; this._recatSelected.clear();
    this._recatApplyFilters(); this._recatRender(); this._recatUpdateKPIs(); this._recatUpdateBatch();
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-all me-1"></i>Appliquer';
    this.toast('Success', ids.length + ' interventions recat\u00e9goris\u00e9es.');
  },

  _recatUpdateBatch: function() {
    var bar = document.getElementById('recatBatchBar'), count = this._recatSelected.size;
    if (count === 0) { bar.classList.add('d-none'); return; }
    bar.classList.remove('d-none');
    document.getElementById('recatBatchCount').textContent = count + ' s\u00e9lectionn\u00e9e' + (count > 1 ? 's' : '');
  },

  // KPIs
  _recatUpdateKPIs: function() {
    var total = this._recatData.length + this._recatValidated + this._recatDeleted;
    var suggested = this._recatData.filter(function(r) { return r.suggestion; }).length;
    document.getElementById('recatTotal').textContent = this.fmtNum(total);
    document.getElementById('recatSuggested').textContent = this.fmtNum(suggested);
    document.getElementById('recatValidated').textContent = this.fmtNum(this._recatValidated);
    document.getElementById('recatRemaining').textContent = this.fmtNum(this._recatData.length);
    var badge = document.getElementById('recatBadgeCount');
    if (badge) badge.textContent = this._recatData.length > 0 ? this._recatData.length : '';
  }

});
