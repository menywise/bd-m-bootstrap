document.addEventListener('DOMContentLoaded', async () => {

  // ── SHELL AUTH — attend que bdb-shell.js ait initialisé l'auth ──
  await window.bdbShellReady;


  const FONCTION_LABELS = {
    medecin: 'M\u00e9decin', cadre: 'Cadre',
    infirmier: 'Infirmier(\u00e8re)', 'aide-soignant': 'Aide-soignant(e)'
  };
  const FONCTION_BADGE = {
    medecin: 'badge-fn-medecin', cadre: 'badge-fn-cadre',
    infirmier: 'badge-fn-infirmier', 'aide-soignant': 'badge-fn-aide'
  };
  const FONCTION_MC = {
    medecin: 'mc-medecin', cadre: 'mc-cadre',
    infirmier: 'mc-infirmier', 'aide-soignant': 'mc-aide'
  };
  const AVATAR_COLORS = [
    '#3b82f6','#8b5cf6','#22c55e','#f97316','#ef4444',
    '#06b6d4','#ec4899','#84cc16','#f59e0b','#6366f1',
    '#10b981','#f43f5e','#0ea5e9','#a855f7','#14b8a6',
    '#d97706','#64748b','#dc2626','#2563eb','#059669',
    '#9333ea','#c026d3','#0891b2','#65a30d','#e11d48','#7c3aed'
  ];

  const state = {
    members:[], filtered:[],
    search:'', fonctionFilter:'all',
    currentUserId:null, isAdmin:false,
    currentMember:null, gants:[], casaques:[],
    secretairesList:[], avatarFile:null, avatarPreview:null, shouldRemoveAvatar:false
  };

  const bsModalMembre = new bootstrap.Modal(document.getElementById('modalMembre'));
  const bsModalGant   = new bootstrap.Modal(document.getElementById('modalGant'));
  const bsModalCasaque= new bootstrap.Modal(document.getElementById('modalCasaque'));
  const bsModalDelete = new bootstrap.Modal(document.getElementById('modalConfirmDelete'));

  function avatarColor(name) {
    const idx = ((name||' ').toUpperCase().charCodeAt(0) - 65 + 26) % 26;
    return AVATAR_COLORS[idx];
  }
  function mkInitials(prenom, nom) {
    return ((prenom||'').charAt(0) + (nom||'').charAt(0)).toUpperCase() || '?';
  }
  function displayName(m) {
    return m.known_as || (m.prenom && m.nom ? m.prenom+' '+m.nom : m.name || '\u2014');
  }
  function esc(s) {
    return String(s||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function avatarHtml(m, extraCls) {
    const color = avatarColor(m.name||m.prenom||m.nom||'A');
    const ini = m.initials || mkInitials(m.prenom, m.nom);
    const cls = 'avatar-circle d-flex align-items-center justify-content-center fw-bold text-white '+(extraCls||'');
    if (m.avatar_url) {
      return '<div class="'+cls+'" style="background:'+color+'">'+
        '<img src="'+esc(m.avatar_url)+'" alt="'+esc(ini)+'" loading="lazy">'+
        '</div>';
    }
    return '<div class="'+cls+'" style="background:'+color+'">'+esc(ini)+'</div>';
  }
  function fnBadge(fn) {
    const cls = FONCTION_BADGE[fn]||'';
    const lbl = FONCTION_LABELS[fn]||fn;
    return '<span class="badge '+cls+' fw-normal">'+
      '<i class="bi bi-briefcase me-1" cds-text-xs></i>'+esc(lbl)+'</span>';
  }
  function showToast(msg, type) {
    const t = document.getElementById('annuaireToast');
    t.className = 'toast align-items-center border-0 text-bg-'+(type==='error'?'danger':'success');
    document.getElementById('toastIcon').className = 'bi bi-'+(type==='error'?'x-circle':'check-circle')+'-fill';
    document.getElementById('toastMsg').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(t, {delay:3500}).show();
  }

  async function init() {
    // window.bdbUser fourni par bdb-shell.js (await bdbShellReady déjà résolu)
    // INTERDIT-B2 : pas de requête profiles_directory / user_roles ici
    state.currentUserId = window.bdbUser?.id ?? null;
    state.isAdmin       = window.bdbUser?.isAdmin ?? false;
    loadGantsCasaques();
    loadMembers();
  }

  async function loadMembers() {
    renderSkeleton();
    const { data, error } = await window.bdb
      .from('profiles_directory')
      .select('id,user_id,name,initials,nom,prenom,known_as,fonction,avatar_url,approved,created_at')
      .order('nom');
    if (error) {
      showToast('Erreur chargement annuaire', 'error');
      const g = document.getElementById('membersGrid');
      if (g) cdsShowGridError(g, error.message, loadMembers);
      return;
    }
    state.members = data || [];
    applyFilter();
  }

  async function loadGantsCasaques() {
    const [g, c] = await Promise.all([
      window.bdb.from('gants').select('id,titre,tailles_disponibles,couleurs_disponibles,matiere,marque,modele,localisation,sans_latex,remarques_usage,description'),
      window.bdb.from('casaques').select('id,titre,categorie,specialite,taille_disponible,localisation,renforcee,remarques_usage,description')
    ]);
    state.gants    = g.data || [];
    state.casaques = c.data || [];
  }

  function applyFilter() {
    const q = state.search.toLowerCase();
    state.filtered = state.members.filter(m => {
      const nm = !q || (m.prenom+' '+m.nom).toLowerCase().includes(q)
                    || (m.known_as||'').toLowerCase().includes(q);
      const fn = state.fonctionFilter==='all' || m.fonction===state.fonctionFilter;
      return nm && fn;
    });
    renderGrid();
    const total = state.members.length, shown = state.filtered.length;
    const el = document.getElementById('heroCount');
    el.textContent = (!state.search && state.fonctionFilter==='all')
      ? total+' membre'+(total>1?'s':'') + " de l'\u00e9quipe"
      : shown+' / '+total+' membre'+(total>1?'s':'');
  }

  function renderSkeleton() {
    document.getElementById('membersGrid').innerHTML = Array.from({length:8}).map(()=>
      '<div class="bg-white rounded-3 p-3 d-flex flex-column align-items-center gap-2 annuaire-skeleton-card">'+
      '<div class="skeleton-box rounded-circle mb-1 annuaire-skeleton-avatar"></div>'+
      '<div class="skeleton-box rounded annuaire-skeleton-name"></div>'+
      '<div class="skeleton-box rounded annuaire-skeleton-fn"></div>'+
      '</div>'
    ).join('');
    document.getElementById('emptyState').classList.add('d-none');
  }

  function renderGrid() {
    const grid = document.getElementById('membersGrid');
    const empty = document.getElementById('emptyState');
    if (!state.filtered.length) {
      grid.innerHTML = '';
      document.getElementById('emptyMsg').textContent = state.search
        ? 'Aucun r\u00e9sultat pour votre recherche.' : "L'annuaire est vide.";
      empty.classList.remove('d-none'); return;
    }
    empty.classList.add('d-none');
    grid.innerHTML = state.filtered.map((m, i) => {
      const mc = FONCTION_MC[m.fonction]||'';
      return '<div class="member-card member-card-anim '+mc+' bg-white rounded-3 '+
        'position-relative overflow-hidden d-flex flex-column align-items-center '+
        'text-center p-3 gap-2 cursor-pointer" '+
        'style="animation-delay:'+(i*30)+'ms;" '+
        'data-uid="'+esc(m.user_id)+'" role="button" tabindex="0" '+
        'aria-label="Voir profil de '+esc(displayName(m))+'">'+
        avatarHtml(m, '')+
        '<div class="fw-semibold text-dark lh-sm annuaire-name-text">'+esc(displayName(m))+'</div>'+
        fnBadge(m.fonction)+
        '</div>';
    }).join('');
    grid.querySelectorAll('.member-card').forEach(card => {
      card.addEventListener('click', () => openMember(card.dataset.uid));
      card.addEventListener('keydown', e => {
        if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openMember(card.dataset.uid); }
      });
    });
  }

  async function openMember(userId) {
    state.avatarFile=null; state.avatarPreview=null; state.shouldRemoveAvatar=false;
    document.getElementById('modalMembreBody').innerHTML =
      '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
    bsModalMembre.show();
    const [dirRes, roleRes] = await Promise.all([
      window.bdb.from('profiles_directory').select('*').eq('user_id',userId).maybeSingle(),
      window.bdb.from('user_roles').select('role').eq('user_id',userId).maybeSingle()
    ]);
    if (dirRes.error || !dirRes.data) {
      document.getElementById('modalMembreBody').innerHTML =
        '<div class="alert alert-warning m-3">Profil introuvable dans l\'annuaire.</div>'; return;
    }
    state.currentMember = Object.assign({}, dirRes.data, {
      role: (roleRes.data&&roleRes.data.role)||'membre', user_id: userId
    });
    renderViewMode();
  }

  function renderViewMode() {
    const m = state.currentMember;
    const canEdit = state.isAdmin || m.user_id === state.currentUserId;
    const dateStr = m.created_at
      ? new Date(m.created_at).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})
      : null;
    let secs = [];
    try { secs = Array.isArray(m.secretaires_list) ? m.secretaires_list : []; } catch(e) {}
    const g1 = state.gants.find(g=>g.id===m.gant_paire_1_id);
    const g2 = state.gants.find(g=>g.id===m.gant_paire_2_id);
    const cq = state.casaques.find(c=>c.id===m.casaque_id);
    function fmtG(g) {
      return [g.tailles_disponibles,g.couleurs_disponibles].filter(Boolean).join(' \u2013 ')||g.titre||'\u2014';
    }
    let proHtml = '';
    if (m.fonction==='medecin') {
      const hasTel = m.telephone_principal||m.telephone_secondaire;
      const hasSec = secs.length>0;
      if (hasTel||hasSec) {
        proHtml += '<div class="border-top pt-3 mt-1 w-100 text-start">'+
          '<div class="text-uppercase fw-bold text-secondary mb-2" cds-label-section>Profil professionnel</div>';
        if (hasTel) proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
          '<i class="bi bi-telephone text-secondary"></i>'+
          '<span>'+esc(m.telephone_principal||'')+(m.telephone_secondaire?' / '+esc(m.telephone_secondaire):'')+'</span></div>';
        secs.forEach(s => {
          proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
            '<i class="bi bi-people text-secondary"></i>'+
            '<span class="fw-medium">'+esc(s.prenom||'')+'</span>'+
            (s.telephone_court?'<span class="text-muted">\u2014</span><a href="tel:'+esc(s.telephone_court)+'" class="link-equipment">'+esc(s.telephone_court)+'</a>':'')
            +'</div>';
        });
        proHtml += '</div>';
      }
      const hasEquip = g1||g2||cq||m.porte_casque;
      if (hasEquip) {
        proHtml += '<div class="border-top pt-3 mt-1 w-100 text-start">'+
          '<div class="text-uppercase fw-bold text-secondary mb-2" cds-label-section>\u00c9quipement personnel</div>';
        if (g1) proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
          '<i class="bi bi-hand-index text-secondary"></i><span>Paire 1 :</span>'+
          '<button class="link-equipment" data-gant-id="'+esc(g1.id)+'">'+esc(fmtG(g1))+
          ' <i class="bi bi-box-arrow-up-right" cds-text-xs></i></button></div>';
        if (g2) proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
          '<i class="bi bi-hand-index text-secondary"></i><span>Paire 2 :</span>'+
          '<button class="link-equipment" data-gant-id="'+esc(g2.id)+'">'+esc(fmtG(g2))+
          ' <i class="bi bi-box-arrow-up-right" cds-text-xs></i></button></div>';
        if (cq) proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
          '<i class="bi bi-person-badge text-secondary"></i><span>Casaque :</span>'+
          '<button class="link-equipment" data-casaque-id="'+esc(cq.id)+'">'+esc(cq.titre)+
          ' <i class="bi bi-box-arrow-up-right" cds-text-xs></i></button></div>';
        if (m.porte_casque) proHtml += '<div class="d-flex align-items-center gap-2 small py-1">'+
          '<i class="bi bi-shield-check text-secondary"></i><span>Porte un casque</span></div>';
        proHtml += '</div>';
      }
    }
    const prefsHtml = m.fonction==='medecin'
      ? '<div class="border-top pt-3 mt-1 w-100 text-start" id="sectionPrefs">'+
        '<div class="text-uppercase fw-bold text-secondary mb-2" cds-label-section>Pr\u00e9f\u00e9rences op\u00e9ratoires</div>'+
        '<div id="prefsContent" class="text-secondary small px-2"><span class="spinner-border spinner-border-sm me-1"></span>Chargement...</div>'+
        '</div>'
      : '';

    document.getElementById('modalMembreBody').innerHTML =
      '<div class="d-flex flex-column align-items-center text-center gap-2 p-2">'+
      avatarHtml(m, 'avatar-circle-lg')+
      '<div><h5 class="fw-bold mb-1">'+esc(displayName(m))+'</h5>'+
      (m.known_as&&m.known_as!==displayName(m)?'<p class="text-muted small fst-italic mb-1">\u00ab '+esc(m.known_as)+' \u00bb</p>':'')
      +'<p class="text-muted small mb-0">'+esc(m.prenom||'')+' '+esc(m.nom||'')+'</p></div>'
      +'<div class="d-flex flex-wrap justify-content-center gap-2">'+fnBadge(m.fonction)
      +(m.role==='admin'?'<span class="badge badge-admin-role rounded-pill"><i class="bi bi-shield me-1 cds-text-xs"></i>Admin</span>':'')
      +(m.approved?'<span class="badge badge-approved rounded-pill"><i class="bi bi-check-circle me-1 cds-text-xs"></i>Approuv\u00e9</span>'
                  :'<span class="badge badge-pending rounded-pill"><i class="bi bi-clock me-1 cds-text-xs"></i>En attente</span>')
      +'</div>'
      +(m.bio?'<p class="text-secondary small lh-sm cds-max-280">'+esc(m.bio)+'</p>':'')
      +(m.signes_particuliers?'<p class="text-muted small fst-italic cds-max-280">'+esc(m.signes_particuliers)+'</p>':'')
      +proHtml+prefsHtml
      +(dateStr?'<p class="text-muted annuaire-date-text"><i class="bi bi-calendar3 me-1"></i>Membre depuis '+dateStr+'</p>':'')
      +(canEdit?'<button class="btn btn-outline-secondary btn-sm mt-1" id="btnEditMember"><i class="bi bi-pencil me-2"></i>Modifier</button>':'')
      +'</div>';

    document.getElementById('btnEditMember')?.addEventListener('click', renderEditMode);
    document.querySelectorAll('[data-gant-id]').forEach(b=>b.addEventListener('click',()=>openGant(b.dataset.gantId)));
    document.querySelectorAll('[data-casaque-id]').forEach(b=>b.addEventListener('click',()=>openCasaque(b.dataset.casaqueId)));
    if (m.fonction==='medecin') loadPreferences(m.user_id);
  }

  async function loadPreferences(chirurgienId) {
    const {data} = await window.bdb.from('preferences_chirurgien')
      .select('id,titre,is_global').eq('chirurgien_id',chirurgienId).order('titre');
    const el = document.getElementById('prefsContent');
    if (!el) return;
    if (!data||!data.length) {
      el.innerHTML = '<span>Aucune pr\u00e9f\u00e9rence renseign\u00e9e</span>'
        +(state.isAdmin?'<div class="mt-1"><button class="btn btn-outline-secondary btn-sm ms-2" id="btnCreatePref"><i class="bi bi-plus-lg me-1"></i>Créer</button></div>':'');
      document.getElementById('btnCreatePref')?.addEventListener('click', () => {
        const uid = state.currentMember?.user_id;
        if (uid) window.location.href = '../preferences/index.html?chirurgien=' + encodeURIComponent(uid);
      });
      return;
    }
    el.innerHTML = data.map(p=>
      '<button class="pref-item d-flex align-items-center gap-2" data-pref-id="'+esc(p.id)+'">'+
      '<i class="bi bi-clipboard-check text-secondary"></i>'+
      '<span class="flex-grow-1 text-truncate small">'+esc(p.titre)+'</span>'+
      (p.is_global?'<span class="badge bg-light text-secondary border cds-text-xxs">Globale</span>':'')
      +'<i class="bi bi-box-arrow-up-right text-secondary cds-text-xs"></i></button>'
    ).join('');

    // Listeners : clic sur une fiche → ouvre preferences/index.html filtré sur ce chirurgien
    el.querySelectorAll('.pref-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = state.currentMember?.user_id;
        if (uid) window.location.href = '../preferences/index.html?chirurgien=' + encodeURIComponent(uid);
      });
    });
  }

  function renderEditMode() {
    const m = state.currentMember;
    try { state.secretairesList = JSON.parse(JSON.stringify(Array.isArray(m.secretaires_list)?m.secretaires_list:[])); }
    catch(e) { state.secretairesList = []; }

    const mkOpts = (list, selId, kId, kLabel) =>
      '<option value="">\u2014</option>'+list.map(x=>
        '<option value="'+esc(x.id)+'"'+(selId===x.id?' selected':'')+'>'+esc(x[kLabel]||x.titre||'')+'</option>'
      ).join('');
    const gOpts  = mkOpts(state.gants,  m.gant_paire_1_id, 'id', '_label').replace('_label','tailles_disponibles');
    // inline build gant options
    const gOptsFn = (selId) => '<option value="">\u2014</option>'+state.gants.map(g=>{
      const lbl = [g.tailles_disponibles,g.couleurs_disponibles].filter(Boolean).join(' \u2013')||g.titre;
      return '<option value="'+esc(g.id)+'"'+(selId===g.id?' selected':'')+'>'+esc(lbl)+'</option>';
    }).join('');
    const cOptsFn = (selId) => '<option value="">\u2014</option>'+state.casaques.map(c=>
      '<option value="'+esc(c.id)+'"'+(selId===c.id?' selected':'')+'>'+esc(c.titre)+'</option>'
    ).join('');
    const fnOpts = Object.keys(FONCTION_LABELS).map(k=>
      '<option value="'+k+'"'+(m.fonction===k?' selected':'')+'>'+FONCTION_LABELS[k]+'</option>'
    ).join('');
    const roleOpts = [['membre','Membre'],['admin','Administrateur'],['invite','Invit\u00e9']].map(r=>
      '<option value="'+r[0]+'"'+(m.role===r[0]?' selected':'')+'>'+r[1]+'</option>'
    ).join('');
    const isMed = m.fonction==='medecin';

    document.getElementById('modalMembreBody').innerHTML =
      '<div class="p-1">'+
      // Avatar
      '<div class="text-center mb-3">'+
      '<label class="form-label small d-block">Avatar</label>'+
      '<div class="d-inline-block position-relative" id="avatarZone">'+buildAvatarZoneHtml(m)+'</div>'+
      '<input type="file" id="avatarInput" accept="image/*" class="d-none"/></div>'+
      // Prenom Nom
      '<div class="row g-2 mb-3">'+
      '<div class="col"><label class="form-label small mb-1" for="editPrenom">Pr\u00e9nom *</label>'+
      '<input type="text" id="editPrenom" class="form-control form-control-sm" value="'+esc(m.prenom||'')+'"/></div>'+
      '<div class="col"><label class="form-label small mb-1" for="editNom">Nom *</label>'+
      '<input type="text" id="editNom" class="form-control form-control-sm" value="'+esc(m.nom||'')+'"/></div></div>'+
      // Surnom
      '<div class="mb-3"><label class="form-label small mb-1" for="editKnownAs">Surnom / Nom d’usage</label>'+
      '<input type="text" id="editKnownAs" class="form-control form-control-sm" value="'+esc(m.known_as||'')+'" placeholder="Ex : Vivi, Dr V."/></div>'+
      // Fonction Role
      '<div class="row g-2 mb-3">'+
      '<div class="col"><label class="form-label small mb-1">Fonction</label>'+
      '<select id="editFonction" class="form-select form-select-sm">'+fnOpts+'</select></div>'+
      '<div class="col"><label class="form-label small mb-1">R\u00f4le</label>'+
      '<select id="editRole" class="form-select form-select-sm">'+roleOpts+'</select></div></div>'+
      // Bio
      '<div class="mb-3"><label class="form-label small mb-1" for="editBio">Bio</label>'+
      '<textarea id="editBio" class="form-control form-control-sm" rows="2">'+esc(m.bio||'')+'</textarea></div>'+
      // Signes
      '<div class="mb-3"><label class="form-label small mb-1" for="editSignes">Signes particuliers</label>'+
      '<textarea id="editSignes" class="form-control form-control-sm" rows="2">'+esc(m.signes_particuliers||'')+'</textarea></div>'+
      // Section medecin
      '<div id="sectionMedecin" class="'+(isMed?'':' d-none')+ '">'+
      '<div class="small fw-semibold text-secondary border-top pt-3 mt-1 mb-2">Profil professionnel</div>'+
      '<div class="row g-2 mb-3">'+
      '<div class="col"><label class="form-label small mb-1" for="editTel1">T\u00e9l. principal</label>'+
      '<input type="tel" id="editTel1" class="form-control form-control-sm" value="'+esc(m.telephone_principal||'')+'"/></div>'+
      '<div class="col"><label class="form-label small mb-1" for="editTel2">T\u00e9l. secondaire</label>'+
      '<input type="tel" id="editTel2" class="form-control form-control-sm" value="'+esc(m.telephone_secondaire||'')+'"/></div></div>'+
      '<label class="form-label small mb-1"><i class="bi bi-people me-1"></i>Secr\u00e9tariat</label>'+
      '<div id="secretairesList" class="mb-2"></div>'+
      '<button class="btn btn-outline-secondary btn-sm mb-3" id="btnAddSec"><i class="bi bi-plus-lg me-1"></i>Ajouter une secr\u00e9taire</button>'+
      '<div class="small fw-semibold text-secondary border-top pt-3 mt-1 mb-2">\u00c9quipement personnel</div>'+
      '<div class="row g-2 mb-2">'+
      '<div class="col"><label class="form-label small mb-1"><i class="bi bi-hand-index me-1"></i>Gants \u2013 Paire 1</label>'+
      '<select id="editGant1" class="form-select form-select-sm">'+gOptsFn(m.gant_paire_1_id)+'</select></div>'+
      '<div class="col"><label class="form-label small mb-1"><i class="bi bi-hand-index me-1"></i>Gants \u2013 Paire 2</label>'+
      '<select id="editGant2" class="form-select form-select-sm">'+gOptsFn(m.gant_paire_2_id)+'</select></div></div>'+
      '<div class="row g-2 mb-3 align-items-end">'+
      '<div class="col"><label class="form-label small mb-1"><i class="bi bi-person-badge me-1"></i>Casaque</label>'+
      '<select id="editCasaque" class="form-select form-select-sm">'+cOptsFn(m.casaque_id)+'</select></div>'+
      '<div class="col d-flex align-items-center gap-2 pb-1">'+
      '<div class="form-check form-switch mb-0">'+
      '<input class="form-check-input" type="checkbox" id="editPorteCasque"'+(m.porte_casque?' checked':'')+'/>'+
      '<label class="form-check-label small" for="editPorteCasque"><i class="bi bi-shield-check me-1"></i>Porte un casque</label>'+
      '</div></div></div></div>'+// fin sectionMedecin
      // Footer
      '<div class="d-flex justify-content-between pt-3 border-top mt-2">'+
      '<button class="btn btn-outline-danger btn-sm" id="btnDeleteMember"><i class="bi bi-trash me-1"></i>Supprimer</button>'+
      '<div class="d-flex gap-2"><button class="btn btn-outline-secondary btn-sm" id="btnCancelEdit">Annuler</button>'+
      '<button class="btn btn-primary btn-sm" id="btnSaveEdit"><span id="btnSaveSpinner" class="spinner-border spinner-border-sm me-1 d-none"></span>Enregistrer</button>'+
      '</div></div></div>';

    renderSecsEdit();
    wireEditListeners();
    document.getElementById('editFonction').addEventListener('change', function() {
      document.getElementById('sectionMedecin').classList.toggle('d-none', this.value!=='medecin');
    });
  }

  function buildAvatarZoneHtml(m) {
    const ini = m.initials||mkInitials(m.prenom,m.nom);
    const color = avatarColor(m.prenom||m.nom||'A');
    const src = state.avatarPreview||(state.shouldRemoveAvatar?null:m.avatar_url);
    if (src) {
      return '<div class="position-relative d-inline-block">'+
        '<div class="avatar-circle avatar-circle-lg d-flex align-items-center justify-content-center fw-bold text-white" style="background:'+color+';">'+
        '<img src="'+esc(src)+'" alt="'+esc(ini)+'" id="avatarPreviewImg"/></div>'+
        '<button class="btn btn-danger btn-sm position-absolute rounded-circle p-0 annuaire-avatar-remove-btn" id="btnRemoveAvatar"'+
        ' aria-label="Supprimer">'+
        '<i class="bi bi-x"></i></button></div>';
    }
    return '<div class="avatar-circle avatar-circle-lg avatar-circle-upload d-flex align-items-center justify-content-center text-secondary"'+
      ' id="avatarUploadZone" role="button" tabindex="0">'+
      '<i class="bi bi-camera fs-4"></i></div>';
  }

  function renderSecsEdit() {
    const c = document.getElementById('secretairesList');
    if (!c) return;
    c.innerHTML = state.secretairesList.map((s,i)=>
      '<div class="d-flex gap-2 align-items-center mb-1" data-idx="'+i+'">'+
      '<input type="text" class="form-control form-control-sm flex-grow-1 input-sec-name" placeholder="Pr\u00e9nom" value="'+esc(s.prenom||'')+'"/>'+
      '<input type="text" class="form-control form-control-sm input-sec-tel" placeholder="1234" maxlength="4" inputmode="numeric" value="'+esc(s.telephone_court||'')+'"/>'+
      '<button class="btn btn-outline-danger btn-sm px-2 btn-rm-sec" data-idx="'+i+'" aria-label="Supprimer">'+
      '<i class="bi bi-trash3 cds-text-sm"></i></button></div>'
    ).join('');
    c.querySelectorAll('.input-sec-name').forEach((inp,i)=>inp.addEventListener('input',()=>{state.secretairesList[i].prenom=inp.value;}));
    c.querySelectorAll('.input-sec-tel').forEach((inp,i)=>inp.addEventListener('input',()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,4);state.secretairesList[i].telephone_court=inp.value;}));
    c.querySelectorAll('.btn-rm-sec').forEach(b=>b.addEventListener('click',()=>{state.secretairesList.splice(parseInt(b.dataset.idx),1);renderSecsEdit();}));
  }

  function wireEditListeners() {
    const avatarInput = document.getElementById('avatarInput');
    const triggerUp = ()=>avatarInput.click();
    document.getElementById('avatarUploadZone')?.addEventListener('click', triggerUp);
    document.getElementById('avatarUploadZone')?.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();triggerUp();}});
    avatarInput.addEventListener('change', e=>{
      const file=e.target.files&&e.target.files[0];
      if(!file) return;
      if(file.size>2*1024*1024){showToast("L'image ne doit pas d\u00e9passer 2 Mo",'error');return;}
      state.avatarFile=file; state.avatarPreview=URL.createObjectURL(file); state.shouldRemoveAvatar=false;
      document.getElementById('avatarZone').innerHTML=buildAvatarZoneHtml(state.currentMember);
      wireAvatarRemove();
    });
    wireAvatarRemove();
    document.getElementById('btnAddSec').addEventListener('click',()=>{state.secretairesList.push({prenom:'',telephone_court:''});renderSecsEdit();});
    document.getElementById('btnCancelEdit').addEventListener('click',()=>renderViewMode());
    document.getElementById('btnSaveEdit').addEventListener('click',saveEdit);
    document.getElementById('btnDeleteMember').addEventListener('click',()=>{
      const m=state.currentMember;
      document.getElementById('deleteConfirmMsg').textContent='Le compte de '+(m.prenom||'')+' '+(m.nom||'')+' sera d\u00e9finitivement supprim\u00e9.';
      bsModalDelete.show();
    });
  }

  function wireAvatarRemove() {
    document.getElementById('btnRemoveAvatar')?.addEventListener('click',()=>{
      state.avatarFile=null;state.avatarPreview=null;state.shouldRemoveAvatar=true;
      document.getElementById('avatarZone').innerHTML=buildAvatarZoneHtml(state.currentMember);
      wireAvatarRemove();
    });
  }

  async function saveEdit() {
    const m=state.currentMember;
    const prenom=document.getElementById('editPrenom').value.trim();
    const nom=document.getElementById('editNom').value.trim();
    if(!prenom||!nom){showToast('Nom et pr\u00e9nom requis','error');return;}
    const sp=document.getElementById('btnSaveSpinner');
    const btn=document.getElementById('btnSaveEdit');
    sp.classList.remove('d-none');btn.disabled=true;
    const fn=document.getElementById('editFonction').value;
    const role=document.getElementById('editRole').value;
    const knownAs=document.getElementById('editKnownAs').value.trim();
    const bio=document.getElementById('editBio').value.trim();
    const signes=document.getElementById('editSignes').value.trim();
    let tel1='',tel2='',gant1='',gant2='',casaque='',porteCasque=false;
    if(fn==='medecin'){
      tel1=document.getElementById('editTel1').value.trim();
      tel2=document.getElementById('editTel2').value.trim();
      gant1=document.getElementById('editGant1').value;
      gant2=document.getElementById('editGant2').value;
      casaque=document.getElementById('editCasaque').value;
      porteCasque=document.getElementById('editPorteCasque').checked;
    }
    try {
      const nameNew=prenom+' '+nom;
      const initialsNew=(prenom.charAt(0)+nom.charAt(0)).toUpperCase();
      const r1=await window.bdb.from('profiles_directory').update({
        nom,prenom,name:nameNew,initials:initialsNew,fonction:fn,
        bio:bio||null,known_as:knownAs||null,signes_particuliers:signes||null,
        telephone_principal:tel1||null,telephone_secondaire:tel2||null,
        secretaires_list:state.secretairesList,
        gant_paire_1_id:gant1||null,gant_paire_2_id:gant2||null,
        casaque_id:casaque||null,porte_casque:porteCasque
      }).eq('user_id',m.user_id);
      if(r1.error) throw r1.error;
      if(role!==m.role){
        const r2=await window.bdb.from('user_roles').upsert({user_id:m.user_id,role},{onConflict:'user_id'});
        if(r2.error) throw r2.error;
      }
      if(state.shouldRemoveAvatar&&m.avatar_url){
        const match=m.avatar_url.match(/\/avatars\/(.+?)(?:\?|$)/);
        if(match) await window.bdb.storage.from('avatars').remove([match[1]]);
        await window.bdb.from('profiles_directory').update({avatar_url:null}).eq('user_id',m.user_id);
      } else if(state.avatarFile){
        if(m.avatar_url){const match2=m.avatar_url.match(/\/avatars\/(.+?)(?:\?|$)/);if(match2) await window.bdb.storage.from('avatars').remove([match2[1]]);}
        const ext=state.avatarFile.name.split('.').pop();
        const path=m.user_id+'/avatar-'+Date.now()+'.'+ext;
        const up=await window.bdb.storage.from('avatars').upload(path,state.avatarFile,{upsert:true});
        if(!up.error){const u=window.bdb.storage.from('avatars').getPublicUrl(path);await window.bdb.from('profiles_directory').update({avatar_url:u.data.publicUrl}).eq('user_id',m.user_id);}
      }
      showToast(prenom+' '+nom+' mis \u00e0 jour');
      const upd=await window.bdb.from('profiles_directory').select('*').eq('user_id',m.user_id).maybeSingle();
      state.currentMember=Object.assign({},upd.data,{role,user_id:m.user_id});
      const idx=state.members.findIndex(x=>x.user_id===m.user_id);
      if(idx>=0) Object.assign(state.members[idx],{nom,prenom,name:nameNew,initials:initialsNew,fonction:fn});
      applyFilter(); renderViewMode();
    } catch(err){showToast((err&&err.message)||'Erreur','error');}
    finally{sp.classList.add('d-none');btn.disabled=false;}
  }

  document.getElementById('btnConfirmDelete').addEventListener('click', async()=>{
    const m=state.currentMember; bsModalDelete.hide();
    try {
      await window.bdb.from('user_roles').delete().eq('user_id',m.user_id);
      await window.bdb.from('profiles').delete().eq('user_id',m.user_id);
      await window.bdb.from('profiles_directory').delete().eq('user_id',m.user_id);
      showToast((m.prenom||'')+' '+(m.nom||'')+' supprim\u00e9');
      bsModalMembre.hide();
      state.members=state.members.filter(x=>x.user_id!==m.user_id);
      applyFilter();
    } catch(err){showToast((err&&err.message)||'Erreur suppression','error');}
  });

  async function openGant(id) {
    document.getElementById('modalGantBody').innerHTML='<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-secondary"></div></div>';
    bsModalGant.show();
    let g=state.gants.find(x=>x.id===id);
    if(!g){const r=await window.bdb.from('gants').select('*').eq('id',id).maybeSingle();if(r.data){state.gants.push(r.data);g=r.data;}}
    const body=document.getElementById('modalGantBody');
    if(!g){body.innerHTML='<div class="alert alert-warning m-2">Gant introuvable</div>';return;}
    document.getElementById('modalGantTitle').innerHTML='<i class="bi bi-hand-index text-primary me-2"></i>'+esc(g.titre);
    body.innerHTML=[
      g.marque&&['Marque',esc(g.marque)],g.modele&&['Mod\u00e8le',esc(g.modele)],
      g.matiere&&['Mati\u00e8re',esc(g.matiere)],g.tailles_disponibles&&['Tailles',esc(g.tailles_disponibles)],
      g.couleurs_disponibles&&['Couleurs',esc(g.couleurs_disponibles)],g.localisation&&['Localisation',esc(g.localisation)]
    ].filter(Boolean).map(r=>'<div class="d-flex align-items-start gap-2 small py-1"><span class="text-secondary fw-medium annuaire-detail-label">'+r[0]+'</span><span>'+r[1]+'</span></div>').join('')
    +(g.sans_latex?'<div class="mt-2"><span class="badge bg-success-subtle text-success-emphasis rounded-pill"><i class="bi bi-check-circle me-1"></i>Sans latex</span></div>':'')
    +(g.remarques_usage?'<div class="border-top pt-3 mt-2"><div class="text-uppercase fw-bold text-secondary mb-1 annuaire-label-xs">Remarques d’usage</div><p class="small">'+esc(g.remarques_usage)+'</p></div>':'')
    +(g.description?'<div class="border-top pt-3 mt-2"><div class="text-uppercase fw-bold text-secondary mb-1 annuaire-label-xs">Description</div><div class="small">'+g.description+'</div></div>':'');
  }

  async function openCasaque(id) {
    document.getElementById('modalCasaqueBody').innerHTML='<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-secondary"></div></div>';
    bsModalCasaque.show();
    let c=state.casaques.find(x=>x.id===id);
    if(!c){const r=await window.bdb.from('casaques').select('*').eq('id',id).maybeSingle();if(r.data){state.casaques.push(r.data);c=r.data;}}
    const body=document.getElementById('modalCasaqueBody');
    if(!c){body.innerHTML='<div class="alert alert-warning m-2">Casaque introuvable</div>';return;}
    document.getElementById('modalCasaqueTitle').innerHTML='<i class="bi bi-person-badge text-primary me-2"></i>'+esc(c.titre);
    body.innerHTML=[
      c.categorie&&['Cat\u00e9gorie',esc(c.categorie)],c.specialite&&['Sp\u00e9cialit\u00e9',esc(c.specialite)],
      c.taille_disponible&&['Tailles',esc(c.taille_disponible)],c.localisation&&['Localisation',esc(c.localisation)]
    ].filter(Boolean).map(r=>'<div class="d-flex align-items-start gap-2 small py-1"><span class="text-secondary fw-medium annuaire-detail-label">'+r[0]+'</span><span>'+r[1]+'</span></div>').join('')
    +(c.renforcee?'<div class="mt-2"><span class="badge bg-primary-subtle text-primary-emphasis rounded-pill"><i class="bi bi-shield-check me-1"></i>Renforc\u00e9e</span></div>':'')
    +(c.remarques_usage?'<div class="border-top pt-3 mt-2"><div class="text-uppercase fw-bold text-secondary mb-1 annuaire-label-xs">Remarques d’usage</div><p class="small">'+esc(c.remarques_usage)+'</p></div>':'')
    +(c.description?'<div class="border-top pt-3 mt-2"><div class="text-uppercase fw-bold text-secondary mb-1 annuaire-label-xs">Description</div><div class="small">'+c.description+'</div></div>':'');
  }

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', function(){
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{state.search=this.value;applyFilter();},200);
  });
  document.getElementById('filterChips').addEventListener('click', e=>{
    const chip=e.target.closest('.filter-chip');if(!chip)return;
    document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');state.fonctionFilter=chip.dataset.fn;applyFilter();
  });

  (async () => {
    try {
      await init();
    } catch (err) {
      cdsShowOfflineBanner('Erreur de chargement — ' + (err.message || 'service indisponible'));
    }
  })();
});

  // ── CDS resilience helpers ─────────────────────────────────────────────
  function cdsShowGridError(el, msg, retryFn) {
    if (!el) return;
    const retryBtn = retryFn
      ? `<button class="btn btn-sm btn-outline-danger cds-error-retry" id="cdsRetryBtn">
           <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
         </button>`
      : '';
    el.innerHTML = `<div class="cds-error-state col-12">
      <i class="bi bi-wifi-off cds-error-icon"></i>
      <div class="cds-error-title">Données non chargées</div>
      <div class="cds-error-msg">${msg || 'Impossible de contacter le serveur. Vérifiez votre connexion.'}</div>
      ${retryBtn}
    </div>`;
    if (retryFn) {
      const btn = el.querySelector('#cdsRetryBtn');
      if (btn) btn.addEventListener('click', retryFn);
    }
  }

  function cdsShowOfflineBanner(msg) {
    let banner = document.getElementById('cdsOfflineBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'cdsOfflineBanner';
      banner.className = 'cds-offline-banner';
      document.body.prepend(banner);
    }
    banner.textContent = msg || 'Service indisponible — vérifiez votre connexion.';
    banner.classList.add('show');
  }
  // ── Fin CDS resilience helpers ──────────────────────────────────────────

