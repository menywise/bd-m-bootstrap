/* ================================================================
   diagnostic-app.js — BDB Atelier / Diagnostic
   Structure : atl-page (atelier-base.css)
   Tests : connexion, schéma, modules, DOM IDs, Atelier L3
   CDS Compliant | bdbShellReady | data-login-mode="modal"

   EXCEPTION INTERDIT-A3 DOCUMENTÉE :
   Ce module crée intentionnellement son propre client Supabase
   pour tester les environnements local ET cloud indépendamment
   de window.bdb (client app). C'est la raison d'être de cet outil.
   ================================================================ */

(function () {
'use strict';

/* ================================================================
   CONFIG — cloud par défaut, toggle via ?env=local
   ================================================================ */

// BDB_CONFIG — URL et anon lus depuis window.bdb pour éviter la duplication (INTERDIT-A1)
// Fallback statique si window.bdb non disponible (tests hors auth)
const BDB_CONFIG = {
  local: { url: 'http://127.0.0.1:54321', anon: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' },
  cloud: {
    url: (window.bdb?.supabaseUrl) || 'https://ecpzrygzdugwwkqbsajn.supabase.co',
    anon: (window.bdb?.supabaseKey) || 'sb_publishable_jc9PQQF85LgiPwHxnevqTQ_q8nWd4es'
  }
};
// Note : la clé anon est publique par design Supabase — voir INTERDIT-A1

const _envParam = new URLSearchParams(window.location.search).get('env');
const ENV = (_envParam === 'local') ? 'local' : 'cloud';

let DB = null;

/* ================================================================
   SCHÉMA ATTENDU
   ================================================================ */

const EXPECTED_SCHEMA = {
  profiles_directory: ['user_id', 'id', 'name', 'initials', 'nom', 'prenom', 'fonction', 'avatar_url', 'bio', 'couleur_preferentielle', 'taille_gants', 'casaque_id', 'porte_casque', 'chirurgien_id', 'signes_particuliers', 'secretaires', 'secretaires_list', 'telephone_principal', 'telephone_secondaire', 'known_as', 'gant_paire_1_id', 'gant_paire_2_id', 'approved', 'is_dev', 'created_at', 'updated_at', 'email'],
  user_roles: ['id', 'user_id', 'created_at'],
  transmissions: ['id', 'user_id', 'category_id', 'title', 'content', 'tags', 'priority', 'status', 'type', 'last_modified_by', 'created_at', 'updated_at', 'is_dev'],
  preferences_chirurgien: ['id', 'chirurgien_id', 'fiche_intervention_id', 'titre', 'description', 'preferences', 'is_global', 'tags', 'created_at', 'updated_at', 'last_modified_by', 'is_dev'],
  materiel: ['id', 'user_id', 'category_id', 'nom', 'reference', 'description', 'statut', 'localisation', 'tags', 'priority', 'created_at', 'updated_at', 'last_modified_by', 'is_dev', 'materiel_type_id', 'zone_anatomique_id', 'zone_stockage_id', 'etagere_id'],
  fiches_intervention: ['id', 'user_id', 'category_id', 'titre', 'description', 'etapes', 'duree_estimee', 'tags', 'status', 'created_at', 'updated_at', 'last_modified_by', 'is_dev'],
  installation_patient: ['id', 'user_id', 'category_id', 'titre', 'description', 'position', 'precautions', 'tags', 'created_at', 'updated_at', 'last_modified_by', 'is_dev'],
  categories: ['id', 'label', 'icon', 'color', 'active', 'created_at', 'updated_at', 'content_type_id'],
  content_types: ['id', 'code', 'label', 'icon', 'color', 'active', 'created_at', 'updated_at'],
  atelier_sessions: ['id', 'numero', 'titre', 'statut', 'avancement', 'dependances', 'duree_estimee', 'date_debut', 'date_fin', 'journal_refs', 'fichiers_requis', 'created_at', 'updated_at'],
  atelier_decisions: ['id', 'ref', 'date', 'titre', 'description', 'module_cible', 'tags', 'session_num', 'created_at'],
  atelier_memo: ['id', 'categorie', 'titre', 'contenu', 'is_epingle', 'couleur', 'created_at', 'updated_at'],
  signalements: ['id', 'type', 'module_cible', 'entite_type', 'entite_id', 'entite_label', 'description', 'url_contexte', 'user_agent', 'honeypot', 'statut', 'resolution', 'reporter_id', 'reporter_email', 'created_at', 'updated_at'],
  collab_projects: ['id', 'title', 'description', 'status', 'created_by', 'validated_by', 'validated_at', 'created_at', 'updated_at'],
  collab_ideas: ['id', 'project_id', 'content', 'quadrant', 'votes', 'created_at'],
  bdb_principes: ['id', 'ref', 'titre', 'description', 'categorie', 'module_cible', 'source', 'is_active', 'created_at'],
  app_groups: ['id', 'key', 'label', 'description', 'icon', 'color', 'position', 'is_visible', 'created_at', 'updated_at'],
  app_modules: ['id', 'key', 'label', 'description', 'icon', 'color', 'group_key', 'path', 'position', 'status', 'is_new', 'visibility', 'created_at', 'updated_at'],
  error_404_logs: ['id', 'requested_url', 'referrer', 'user_agent', 'user_id', 'created_at'],
  paxis_campaigns: ['id', 'title', 'description', 'status', 'created_by', 'created_at', 'updated_at', 'closed_at'],
  paxis_questions: ['id', 'code', 'type', 'text', 'roles', 'depth', 'position', 'is_active', 'campaign_id', 'created_at', 'updated_at'],
};

const CRITICAL_IDS = {
  '../modules/annuaire/index.html':      ['bdbBadgeAdmin','emptyState','membersGrid'],
  '../modules/transmissions/index.html': ['headerActions','transmissionsList'],
  '../modules/arsenal/index.html':       ['headerActions','materielGrid','gantsGrid','casaquesGrid'],
  '../modules/preferences/index.html':   ['headerActions','prefsList','pChirurgien'],
  '../modules/fiches/index.html':        ['headerActions','fichesList'],
  '../modules/installation/index.html':  ['headerActions','installGrid'],
  '../modules/admin/index.html':         ['pendingList','statTotalUsers'],
};

const MODULE_TESTS = {
  annuaire: [
    { name:'profiles_directory', run: async () => { const {count,error} = await DB.from('profiles_directory').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' profil(s)'}; }},
    { name:'Membres approuvés',  run: async () => { const {count,error} = await DB.from('profiles_directory').select('*',{count:'exact'}).eq('approved',true).limit(0); return error ? {status:'fail',detail:error.message} : {status: count>0?'ok':'warn',detail:count+' approuvé(s)'}; }},
    { name:'user_roles',         run: async () => { const {count,error} = await DB.from('user_roles').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' rôle(s)'}; }},
  ],
  transmissions: [
    { name:'transmissions', run: async () => { const {count,error} = await DB.from('transmissions').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' transmission(s)'}; }},
    { name:"status='active'", run: async () => { const {count,error} = await DB.from('transmissions').select('*',{count:'exact'}).eq('status','active').limit(0); return error ? {status:'fail',detail:error.message} : {status:count>0?'ok':'warn',detail:count+' active(s)'}; }},
  ],
  arsenal: [
    { name:'materiel',  run: async () => { const {count,error} = await DB.from('materiel').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' item(s)'}; }},
    { name:'gants',     run: async () => { const {count,error} = await DB.from('gants').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' référence(s)'}; }},
    { name:'casaques',  run: async () => { const {count,error} = await DB.from('casaques').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' référence(s)'}; }},
  ],
  preferences: [
    { name:'preferences_chirurgien', run: async () => { const {count,error} = await DB.from('preferences_chirurgien').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' préférence(s)'}; }},
  ],
  fiches: [
    { name:'fiches_intervention', run: async () => { const {count,error} = await DB.from('fiches_intervention').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' fiche(s)'}; }},
    { name:"status='published'",  run: async () => { const {count,error} = await DB.from('fiches_intervention').select('*',{count:'exact'}).eq('status','published').limit(0); return error ? {status:'fail',detail:error.message} : {status:count>0?'ok':'warn',detail:count+' publiée(s)'}; }},
  ],
  installation: [
    { name:'installation_patient', run: async () => { const {count,error} = await DB.from('installation_patient').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' installation(s)'}; }},
  ],
  atelier: [
    { name:'atelier_sessions',  run: async () => { const {count,error} = await DB.from('atelier_sessions').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' session(s)'}; }},
    { name:"statut='en_cours'", run: async () => { const {data,error} = await DB.from('atelier_sessions').select('numero,titre').eq('statut','en_cours'); return error ? {status:'fail',detail:error.message} : {status:data?.length?'ok':'warn',detail:data?.length?'#'+data[0].numero+' — '+data[0].titre:'Aucune session active'}; }},
    { name:'atelier_decisions', run: async () => { const {count,error} = await DB.from('atelier_decisions').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' décision(s)'}; }},
    { name:'atelier_memo',      run: async () => { const {count,error} = await DB.from('atelier_memo').select('*',{count:'exact'}).limit(0); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:count+' mémo(s)'}; }},
    { name:'RPC atelier_prompt_reprise', run: async () => { const {error} = await DB.rpc('atelier_prompt_reprise'); return error ? {status:'fail',detail:error.message} : {status:'ok',detail:'RPC disponible'}; }},
  ],
};

/* ================================================================
   ÉTAT
   ================================================================ */

const results = { ok:0, fail:0, warn:0, total:0 };

/* ================================================================
   UTILITAIRES UI
   ================================================================ */

function showPanel(id) {
  document.querySelectorAll('.diag-panel').forEach(p => { p.classList.remove('d-block'); p.classList.add('d-none'); });
  document.querySelectorAll('[data-panel]').forEach(n => n.classList.remove('active','bg-primary-subtle'));
  const panel = document.getElementById(id);
  if (panel) { panel.classList.remove('d-none'); panel.classList.add('d-block'); }
  document.querySelector('[data-panel="' + id + '"]')?.classList.add('active','bg-primary-subtle');
}

function setDot(id, status) {
  const dot = document.getElementById('dot-' + id);
  if (!dot) return;
  const map = { ok:'bg-success', fail:'bg-danger', warn:'bg-warning', running:'bg-primary' };
  dot.className = 'badge rounded-circle p-1 ' + (map[status] || 'bg-secondary');
}

function badgeHtml(status, label) {
  const map = { ok:'badge text-bg-success', fail:'badge text-bg-danger', warn:'badge text-bg-warning text-dark', skip:'badge text-bg-secondary' };
  const icon = status==='ok'?'✓':status==='fail'?'✗':status==='warn'?'⚠':'—';
  return '<span class="' + (map[status]||map.skip) + '">' + icon + ' ' + (label||status) + '</span>';
}

function log(msg, type) {
  const box  = document.getElementById('diag-log-box');
  if (!box) return;
  const line = document.createElement('div');
  line.className = 'small font-monospace text-muted ' + (type || '');
  line.textContent = new Date().toTimeString().slice(0,8) + ' ' + msg;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function record(status) {
  results.total++;
  if (status==='ok')   results.ok++;
  if (status==='fail') results.fail++;
  if (status==='warn') results.warn++;
  document.getElementById('diag-sum-total').textContent = results.total;
  document.getElementById('diag-sum-ok').textContent    = results.ok;
  document.getElementById('diag-sum-fail').textContent  = results.fail;
  document.getElementById('diag-sum-warn').textContent  = results.warn;
}

function addTestRow(containerId, name, sub, status, detail) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const row = document.createElement('div');
  row.className = 'border-bottom px-3 py-2 d-flex align-items-center gap-2 small';
  row.innerHTML =
    '<div class="fw-semibold flex-grow-1">' + name + (sub?'<div class="small text-muted fw-normal">'+sub+'</div>':'') + '</div>' +
    '<div class="text-center">' + badgeHtml(status) + '</div>' +
    '<div class="small text-muted ms-3" style="min-width:200px">' + (detail||'') + '</div>';
  c.appendChild(row);
  record(status);
  log('['+status.toUpperCase()+'] '+name+(sub?' — '+sub:'')+': '+(detail||''), status);
}

/* ================================================================
   TESTS
   ================================================================ */

async function testConnection() {
  log('── Connexion & Auth ──', 'head');
  setDot('conn', 'running');
  const sdkOk = typeof window.supabase?.createClient === 'function';
  addTestRow('conn-rows','SDK Supabase','window.supabase.createClient', sdkOk?'ok':'fail', sdkOk?'Disponible':'SDK non chargé');
  if (!sdkOk) { setDot('conn','fail'); return false; }

  try {
    // Mode cloud : réutiliser window.bdb pour éviter Multiple GoTrueClient
    if (ENV === 'cloud' && window.bdb) {
      DB = window.bdb;
      addTestRow('conn-rows','Client créé',BDB_CONFIG[ENV].url,'ok','Réutilisation window.bdb (évite Multiple GoTrueClient)');
    } else {
      DB = window.supabase.createClient(BDB_CONFIG[ENV].url, BDB_CONFIG[ENV].anon);
      addTestRow('conn-rows','Client créé',BDB_CONFIG[ENV].url,'ok','Nouveau client (' + ENV + ')');
    }
  } catch(e) { addTestRow('conn-rows','Client créé','','fail',e.message); setDot('conn','fail'); return false; }

  try {
    const start = Date.now();
    const {error} = await DB.from('categories').select('id').limit(1);
    addTestRow('conn-rows','Ping REST','categories', error?'fail':'ok', error?error.message:(Date.now()-start)+'ms');
  } catch(e) { addTestRow('conn-rows','Ping REST','','fail',e.message); }

  try {
    const {data:{session}} = await DB.auth.getSession();
    if (session) {
      addTestRow('conn-rows','Session auth',session.user.email,'ok','User: '+session.user.id.slice(0,8)+'…');
      const {data:r} = await DB.from('user_roles').select('role').eq('user_id',session.user.id).maybeSingle();
      addTestRow('conn-rows','Rôle','',r?.role?'ok':'warn',r?.role||'Aucun rôle');
    } else {
      addTestRow('conn-rows','Session auth','','warn','Non connecté');
    }
  } catch(e) { addTestRow('conn-rows','Session auth','','fail',e.message); }

  const hasFail = !!document.querySelector('#conn-rows .text-bg-danger');
  setDot('conn', hasFail?'fail':'ok');
  return !hasFail;
}

async function testSchema() {
  log('── Schéma tables ──', 'head');
  setDot('schema','running');
  const container = document.getElementById('diag-schema-tables');
  let fail = false;

  for (const [table, expected] of Object.entries(EXPECTED_SCHEMA)) {
    let status='ok', detail='', actual=[], count='?';
    try {
      const {data,error,count:cnt} = await DB.from(table).select('*',{count:'exact'}).limit(1);
      if (error) { status='fail'; detail=error.message; }
      else {
        actual = data?.length ? Object.keys(data[0]) : [];
        count = cnt??'?';
        if (!data?.length && cnt===0) { status='warn'; detail='Table vide'; }
        else {
          const miss = expected.filter(c => !actual.includes(c));
          const extra = actual.filter(c => !expected.includes(c));
          if (miss.length) { status='fail'; detail='Manquantes: '+miss.join(', '); }
          else if (extra.length) { status='warn'; detail='Extras: '+extra.slice(0,5).join(', '); }
          else { detail=actual.length+' colonnes OK · '+count+' lignes'; }
        }
      }
    } catch(e) { status='fail'; detail=e.message; }
    if (status==='fail') fail=true;
    record(status);
    log('['+status.toUpperCase()+'] Schema '+table+': '+detail, status);
    const g = document.createElement('div');
    g.className = 'card border mb-3';
    g.innerHTML = '<div class="card-header fw-semibold small d-flex align-items-center justify-content-between"><span>'+table+'</span>'+badgeHtml(status)+'</div><div class="card-body py-2 small '+(status==='ok'?'text-success':status==='fail'?'text-danger':'text-warning-emphasis')+'">'+detail+'</div>';
    container.appendChild(g);
  }
  setDot('schema', fail?'fail':'ok');
}

async function testModule(mod, containerId, tests) {
  log('── Module : '+mod+' ──', 'head');
  setDot(mod,'running');
  let hasFail=false, hasWarn=false;
  for (const t of tests) {
    try { const r=await t.run(); addTestRow(containerId,t.name,t.sub||'',r.status,r.detail||''); if(r.status==='fail')hasFail=true; if(r.status==='warn')hasWarn=true; }
    catch(e) { addTestRow(containerId,t.name,'','fail',e.message); hasFail=true; }
  }
  setDot(mod, hasFail?'fail':hasWarn?'warn':'ok');
}

async function testDomIds() {
  log('── IDs DOM ──', 'head');
  setDot('dom','running');
  const container = document.getElementById('diag-dom-content');

  // fetch() sur file:// bloqué par CORS — test disponible uniquement via HTTP
  if (window.location.protocol === 'file:') {
    const info = document.createElement('div');
    info.className = 'alert alert-info small';
    info.innerHTML = '<i class="bi bi-info-circle me-2"></i>Test IDs DOM disponible uniquement via HTTP (localhost ou OVH). Ouvrir diagnostic.html depuis un serveur.';
    container.appendChild(info);
    setDot('dom', 'warn');
    log('[SKIP] Test IDs DOM — protocole file:// détecté, fetch CORS bloqué', 'warn');
    record('warn');
    return;
  }

  let hasFail = false;
  for (const [path,ids] of Object.entries(CRITICAL_IDS)) {
    let status='ok', detail='';
    try {
      const resp = await fetch(path);
      if (!resp.ok) { status='warn'; detail='fetch '+resp.status; }
      else {
        const text = await resp.text();
        const miss = ids.filter(id => !text.includes('id="'+id+'"'));
        if (miss.length) { status='fail'; detail='Manquants: '+miss.join(', '); }
        else { detail=ids.length+' IDs présents'; }
      }
    } catch(e) { status='warn'; detail='fetch impossible ('+e.message.slice(0,60)+')'; }
    if (status==='fail') hasFail=true;
    record(status); log('['+status.toUpperCase()+'] DOM '+path+': '+detail, status);
    const card=document.createElement('div'); card.className='card border mb-3';
    card.innerHTML='<div class="card-header fw-semibold small d-flex align-items-center justify-content-between"><span>'+path+'</span>'+badgeHtml(status)+'</div><div class="card-body py-2 small '+(status==='ok'?'text-success':status==='fail'?'text-danger':'text-warning-emphasis')+'">'+(status!=='fail'?ids.join(', '):detail)+'</div>';
    container.appendChild(card);
  }
  setDot('dom', hasFail?'fail':'ok');
}

/* ================================================================
   LANCER TOUT
   ================================================================ */

async function runAll() {
  const btn = document.getElementById('diag-btn-run-all');
  const gs  = document.getElementById('diag-global-status');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>En cours…';
  gs.textContent = 'Tests en cours…';
  gs.className = 'small text-primary-emphasis';

  results.ok = results.fail = results.warn = results.total = 0;
  ['conn-rows','diag-schema-tables','m-annuaire-rows','m-transmissions-rows',
   'm-arsenal-rows','m-preferences-rows','m-fiches-rows','m-installation-rows',
   'm-atelier-rows','diag-dom-content','diag-global-results','diag-log-box'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  ['conn','schema','annuaire','transmissions','arsenal','preferences','fiches','installation','atelier','dom'].forEach(id => setDot(id,''));

  log('═══ DÉMARRAGE DIAGNOSTIC BDB ═══','info');
  log('Environnement: '+ENV.toUpperCase()+' — '+BDB_CONFIG[ENV].url,'info');

  const connOk = await testConnection();
  if (connOk) {
    await testSchema();
    for (const [mod,tests] of Object.entries(MODULE_TESTS)) {
      await testModule(mod,'m-'+mod+'-rows',tests);
    }
    await testDomIds();
  } else {
    log('Tests arrêtés — connexion échouée','fail');
  }

  const {ok,fail,warn,total} = results;
  const txt = fail>0?fail+' ÉCHEC(S)':warn>0?warn+' AVERTISS.':'TOUT OK';
  gs.textContent = txt;
  gs.className = 'small fw-semibold '+(fail>0?'text-danger':warn>0?'text-warning-emphasis':'text-success');

  const cats = [
    {id:'conn',label:'Connexion & Auth'},{id:'schema',label:'Schéma tables'},
    {id:'annuaire',label:'Annuaire'},{id:'transmissions',label:'Transmissions'},
    {id:'arsenal',label:'Arsenal'},{id:'preferences',label:'Préférences'},
    {id:'fiches',label:'Fiches'},{id:'installation',label:'Installation'},
    {id:'atelier',label:'Atelier L3'},{id:'dom',label:'IDs DOM'},
  ];
  const globalEl = document.getElementById('diag-global-results');
  cats.forEach(cat => {
    const dot = document.getElementById('dot-'+cat.id);
    const ds = dot?(dot.className.includes('ok')?'ok':dot.className.includes('fail')?'fail':dot.className.includes('warn')?'warn':'skip'):'skip';
    const row = document.createElement('div'); row.className='border-bottom px-3 py-2 d-flex align-items-center gap-2 small';
    row.innerHTML='<div class="fw-semibold flex-grow-1">'+cat.label+'</div><div class="text-center">'+badgeHtml(ds)+'</div><div class="small ms-3" style="min-width:200px"><a href="#" class="text-primary text-decoration-none" data-goto="p-'+cat.id+'">Voir détails →</a></div>';
    globalEl.appendChild(row);
  });

  log('═══ FIN : '+ok+'OK / '+fail+'FAIL / '+warn+'WARN ═══',fail>0?'fail':warn>0?'warn':'ok');
  btn.disabled=false;
  btn.innerHTML='<i class="bi bi-arrow-clockwise me-1"></i>Relancer';
}

/* ================================================================
   POINT D'ENTRÉE
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-goto]');
    if (link) { e.preventDefault(); showPanel(link.dataset.goto); }
  });

  (async () => {
    await window.bdbShellReady;
    if (!window.bdbUser) return;

    // S105 : guard isCreator — diagnostic reserve au createur
    if (!window.bdbUser.isCreator) {
      document.getElementById('diag-loading').classList.add('d-none');
      document.getElementById('diag-denied').classList.remove('d-none');
      return;
    }

    // Env label + toggle
    const envEl = document.getElementById('diag-env-label');
    envEl.textContent = ENV.toUpperCase();
    envEl.style.cursor = 'pointer';
    envEl.title = ENV==='cloud' ? '?env=local pour tester en local' : 'Supprimer ?env=local pour cloud';
    envEl.addEventListener('click', () => {
      const url = new URL(window.location.href);
      if (ENV==='cloud') url.searchParams.set('env','local'); else url.searchParams.delete('env');
      window.location.href = url.toString();
    });

    // Navigation sidebar
    document.querySelectorAll('[data-panel]').forEach(item => {
      item.addEventListener('click', () => { const p=item.dataset.panel; if(p)showPanel(p); });
      item.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();const p=item.dataset.panel;if(p)showPanel(p);} });
    });

    document.getElementById('diag-btn-run-all').addEventListener('click', runAll);

    document.getElementById('diag-loading').classList.add('d-none');
    document.getElementById('diag-content').classList.remove('d-none');

    if (typeof window.supabase?.createClient === 'function') {
      setTimeout(runAll, 300);
    } else {
      document.getElementById('diag-global-status').textContent = 'SDK non chargé';
      document.getElementById('diag-global-status').className = 'small text-danger';
    }
  })();
});

})(); // fin IIFE
