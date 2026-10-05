/* ================================================================
   glossaire-feeder-app.js — Atelier BDB L3 Créateur
   Glossaire Feeder : Delta · Génération IA · Export SQL · Audit
   CDS Compliant | escHtml(esc) | 3 états | bdbReady event
   Zéro onclick= direct | Zéro console.* | Zéro @latest
   Extrait depuis glossaire-feeder.html le 2026-04-11
   ================================================================ */

(function () {
  'use strict';

  var CATS  = ['ABREVIATION','EPONYME','PATHOLOGIE','MATERIEL','TECHNIQUE','ANATOMIE','CONVENTION','METIER','OUTIL','DISC','METHODE','BDB'];
  var PERTS = ['critique','haute','moyenne','faible'];

  var SOFCOT = [
    'ACHA','Agénésie','ALD','Allogreffe','Ambulatoire','Anatomo-pathologiste',
    'Antalgiques','Anti-inflammatoires','Appareil locomoteur','Arthroscanner',
    'Articulation','Artérite','Arthralgie','Arthrite','Arthrodèse','Arthroscopie',
    'Arthrose','Atrophie','Autogreffe','Axone','Biopsie','Broche',
    'Cal osseux','Cal vicieux','Canal carpien','Canal rachidien',
    'Capsule articulaire','Capsulite','Chimiothérapie','Chirurgie ambulatoire',
    'Chirurgie percutanée','Claquage','Comorbidité','Contention','Contracture',
    'Contusion','Corticoïdes','Cortisone','Crampe','Cruralgie','Cyphose',
    'Décubitus','Déchirure musculaire','Dépistage','Disque intervertébral',
    'Drain de Redon','Dysplasie','Échographie','Ecchymose','Électromyogramme',
    'Élongation','Emboîture','Endoscopie','Entorse','Étiologie',
    'Examens complémentaires','Exérèse','Facteurs de risque','Foulure',
    'Fracture','Garrot pneumatique','Greffe osseuse','Hallux valgus','Haubans',
    'Hématome','Hernie discale','Hormonothérapie','Idiopathique','Implant',
    'Infections nosocomiales','IRM','Intradural','Kyste synovial','Ligament',
    'Ligament croisé antérieur','Lombalgie','Lumbago','Luxation','Méniscectomie',
    'Microchirurgie','Monitoring médullaire','Morbidité','Myoélectrique',
    'Myorelaxants','Neuromédiateur','Racines nerveuses','Orthopédie',
    'Ostéochondrite','Ostéonécrose','Ostéoporose','Ostéosynthèse','Ostéotomie',
    'Plaque','Plastie','Périarthrite','Polyarthrite','Proprioception',
    'Pronosupination','Prothèse','Pseudarthrose','Queue de cheval','Radiographie',
    'Radiothérapie','Résection','Rachis','Réduire','Ressaut',
    'Rotateurs de hanche','Rupture ligamentaire','Scanner','Scoliose',
    'Scintigraphie','Sphinctérien','Suture résorbable','Tendinite','Tendon',
    'Thrombose','Traumatisme','Traumatologie','Visco-supplémentation',
    "Voie d'abord",'Abduction','Adduction','Acromion','Algodystrophie',
    'Anticoagulant','Héparine',"Lit de l'ongle","Matrice de l'ongle",
    'Nerf médian','Œdème','Pulpe du doigt','Sciatalgie','Thromboembolique','Trophicité'
  ];

  var SYS_PROMPT = [
    "Tu es un expert en chirurgie orthopédique et traumatologique, spécialisé dans la formation",
    "des IBODE (Infirmiers de Bloc Opératoire Diplômés d'État) en France.",
    "",
    "Réponds UNIQUEMENT en JSON valide, sans markdown, sans backtick, sans texte avant ou après.",
    "",
    "Pour le terme chirurgical fourni, génère exactement :",
    "{",
    '  "definition": "Définition précise, cliniquement exacte, pour une IBODE expérimentée. 2 à 4 phrases. Si abréviation : développer le sigle en premier.",',
    '  "usage_notes": "Contexte d\'usage au bloc opératoire ortho/trauma. Points de vigilance IBODE. 1 à 2 phrases.",',
    '  "categorie": "ABREVIATION|EPONYME|PATHOLOGIE|MATERIEL|TECHNIQUE|ANATOMIE|CONVENTION|METIER",',
    '  "pertinence_bloc": "critique|haute|moyenne|faible",',
    '  "variantes": "syn1|syn2 (pipe-separated, minuscules, vide si aucune)",',
    '  "terme_latin": "terme latin Terminologia Anatomica ou null",',
    '  "termes_en": ["english_term"] ou []',
    "}",
    "",
    "Règles : pas de jargon anesthésique pur, pas d'abréviations non définies, centré bloc ortho/traumato."
  ].join('\n');

  // ── État ─────────────────────────────────────────────────────────────────
  var S = {
    apiKey: sessionStorage.getItem('bdb_gf_key')   || '',
    model:  sessionStorage.getItem('bdb_gf_model') || 'claude-sonnet-4-20250514',
    missing: [], found: [], defs: {},
    editingTerm: null, auditLoaded: false
  };

  // ── Utils ─────────────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function el(id)  { return document.getElementById(id); }
  function show(id){ var e=el(id); if(e) e.classList.remove('d-none'); }
  function hide(id){ var e=el(id); if(e) e.classList.add('d-none'); }
  function delay(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  // ── Clé API ───────────────────────────────────────────────────────────────
  function refreshBadge() {
    el('key-indicator').innerHTML = S.apiKey
      ? '<i class="bi bi-check-circle-fill text-success ms-1"></i>'
      : '<i class="bi bi-x-circle text-danger ms-1"></i>';
  }

  el('btn-apikey').addEventListener('click', function () {
    el('api-key-input').value = S.apiKey;
    el('model-select').value  = S.model;
    new bootstrap.Modal(el('apiKeyModal')).show();
  });

  el('btn-save-apikey').addEventListener('click', function () {
    S.apiKey = el('api-key-input').value.trim();
    S.model  = el('model-select').value;
    sessionStorage.setItem('bdb_gf_key',   S.apiKey);
    sessionStorage.setItem('bdb_gf_model', S.model);
    refreshBadge();
    bootstrap.Modal.getInstance(el('apiKeyModal')).hide();
  });

  // ── Delta ─────────────────────────────────────────────────────────────────
  el('btn-load-sofcot').addEventListener('click', function () {
    el('source-terms').value = SOFCOT.join('\n');
  });

  el('btn-analyze').addEventListener('click', analyzeDelta);

  async function analyzeDelta() {
    var src = el('source-terms').value.split('\n').map(function(t){return t.trim();}).filter(Boolean);
    if (!src.length) return;

    el('delta-spinner').classList.remove('d-none');
    hide('delta-empty'); hide('delta-error'); hide('delta-results');

    try {
      var res = await window.bdb.from('glossaire').select('abbreviation, variantes');
      if (res.error) throw res.error;

      var known = new Set();
      res.data.forEach(function(row) {
        known.add(row.abbreviation.toLowerCase().trim());
        if (row.variantes) {
          row.variantes.split('|').forEach(function(v) {
            var t = v.toLowerCase().trim();
            if (t) known.add(t);
          });
        }
      });

      S.missing = []; S.found = [];
      src.forEach(function(t) {
        (known.has(t.toLowerCase().trim()) ? S.found : S.missing).push(t);
      });

      renderDelta(src.length);
    } catch(e) {
      el('delta-error').textContent = 'Erreur Supabase : ' + e.message;
      show('delta-error');
    } finally {
      el('delta-spinner').classList.add('d-none');
    }
  }

  function renderDelta(total) {
    el('res-total').textContent   = total;
    el('res-found').textContent   = S.found.length;
    el('res-missing').textContent = S.missing.length;

    var badge = el('missing-badge');
    badge.textContent = S.missing.length;
    S.missing.length ? badge.classList.remove('d-none') : badge.classList.add('d-none');

    var h = '';
    if (S.missing.length) {
      h += '<p class="fw-bold text-danger mb-1">Manquants (' + S.missing.length + ')</p>';
      S.missing.forEach(function(t){ h += '<span class="badge text-bg-danger small fw-normal me-1 mb-1">' + esc(t) + '</span>'; });
      h += '<hr>';
    }
    if (S.found.length) {
      h += '<p class="fw-bold text-success mb-1">Présents (' + S.found.length + ')</p>';
      S.found.forEach(function(t){ h += '<span class="badge text-bg-success small fw-normal me-1 mb-1">' + esc(t) + '</span>'; });
    }
    el('delta-list').innerHTML = h;

    S.missing.length
      ? el('btn-to-gen').classList.remove('d-none')
      : el('btn-to-gen').classList.add('d-none');

    show('delta-results');
  }

  el('btn-to-gen').addEventListener('click', function () {
    bootstrap.Tab.getOrCreateInstance(el('tab-gen-btn')).show();
    renderGenPanel();
  });

  // ── Génération ────────────────────────────────────────────────────────────
  function renderGenPanel() {
    if (!S.missing.length) { show('gen-empty'); hide('gen-content'); return; }
    hide('gen-empty'); show('gen-content');
    el('gen-count').textContent = S.missing.length;
    renderCards();
  }

  function renderCards() {
    var h = '';
    S.missing.forEach(function(term) {
      var d   = S.defs[term];
      var cls = !d ? '' : (d.error ? 'is-error' : (d.edited ? 'is-edited' : 'is-generated'));

      var badges = !d ? '' : (d.error
        ? '<span class="badge bg-danger">Erreur</span>'
        : '<span class="badge bg-' + (d.edited ? 'warning text-dark' : 'success') + '">' + (d.edited?'Édité':'Généré') + '</span>'
          + (d.pertinence_bloc ? '<span class="badge ' + (d.pertinence_bloc === 'critique' ? 'text-bg-danger' : d.pertinence_bloc === 'haute' ? 'text-bg-warning text-dark' : d.pertinence_bloc === 'moyenne' ? 'text-bg-warning text-dark' : 'text-bg-secondary') + '">' + esc(d.pertinence_bloc) + '</span>' : '')
          + (d.categorie       ? '<span class="badge bg-secondary">' + esc(d.categorie) + '</span>' : '')
      );

      var preview = (d && !d.error && d.definition)
        ? '<div class="small text-muted mt-1">' + esc(d.definition.substring(0,140)) + (d.definition.length>140?'…':'') + '</div>' : '';
      var errMsg = (d && d.error)
        ? '<div class="small text-danger mt-1">' + esc(d.error) + '</div>' : '';

      var editBtn = (d && !d.error)
        ? '<button class="btn btn-sm btn-outline-secondary" data-gf-edit="' + esc(term) + '"><i class="bi bi-pencil"></i></button>' : '';

      h += '<div class="card bo-card ' + (cls === 'is-generated' ? 'bo-accent-success' : cls === 'is-edited' ? 'bo-accent-warning' : cls === 'is-error' ? 'bo-accent-danger' : 'bo-accent-primary') + ' mb-2"><div class="card-body py-2">'
        + '<div class="d-flex align-items-center gap-2 flex-wrap">'
        + '<strong>' + esc(term) + '</strong>' + badges
        + '<div class="ms-auto d-flex gap-1">'
        + '<button class="btn btn-sm btn-outline-primary" data-gf-gen="' + esc(term) + '"><i class="bi bi-robot"></i></button>'
        + editBtn
        + '</div></div>' + preview + errMsg + '</div></div>';
    });
    el('term-cards').innerHTML = h;

    /* Délégation d'événements — zéro onclick= inline */
    el('term-cards').querySelectorAll('[data-gf-gen]').forEach(function(btn) {
      btn.addEventListener('click', function() { genOne(btn.getAttribute('data-gf-gen')); });
    });
    el('term-cards').querySelectorAll('[data-gf-edit]').forEach(function(btn) {
      btn.addEventListener('click', function() { openEdit(btn.getAttribute('data-gf-edit')); });
    });
  }

  async function callAI(term) {
    if (!S.apiKey) throw new Error("Clé API non configurée — cliquer le bouton « Clé API ».");
    var resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key': S.apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: S.model, max_tokens: 600, system: SYS_PROMPT,
        messages: [{ role:'user', content:'Terme : ' + term }]
      })
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function(){return {};});
      throw new Error((err.error && err.error.message) || 'HTTP ' + resp.status);
    }
    var data = await resp.json();
    var txt = (data.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');
    return JSON.parse(txt.trim());
  }

  async function genOne(term) {
    S.defs[term] = { loading: true };
    renderCards();
    try {
      var r = await callAI(term);
      S.defs[term] = {
        definition:      r.definition     || '',
        usage_notes:     r.usage_notes    || '',
        categorie:       r.categorie      || 'PATHOLOGIE',
        pertinence_bloc: r.pertinence_bloc || 'moyenne',
        variantes:       r.variantes      || '',
        terme_latin:     r.terme_latin    || null,
        termes_en:       Array.isArray(r.termes_en) ? r.termes_en : [],
        edited: false, error: null
      };
    } catch(e) {
      S.defs[term] = { error: e.message };
    }
    renderCards();
  }

  el('btn-gen-all').addEventListener('click', async function () {
    el('btn-gen-all').disabled = true;
    var total = S.missing.length; var done = 0;
    for (var i = 0; i < S.missing.length; i++) {
      var t = S.missing[i];
      if (!S.defs[t] || S.defs[t].error) { await genOne(t); await delay(350); }
      done++;
      var pct = Math.round(done/total*100);
      el('gen-bar').style.width = pct + '%';
      el('gen-txt').textContent = done + ' / ' + total;
    }
    el('btn-gen-all').disabled = false;
  });

  // ── Édition ───────────────────────────────────────────────────────────────
  function openEdit(term) {
    S.editingTerm = term;
    var d = S.defs[term] || {};
    el('edit-modal-title').textContent = 'Éditer — ' + term;
    var catOpts  = CATS.map(function(c){ return '<option value="' + esc(c) + '"' + (d.categorie===c?' selected':'') + '>' + esc(c) + '</option>'; }).join('');
    var pertOpts = PERTS.map(function(p){ return '<option value="' + esc(p) + '"' + (d.pertinence_bloc===p?' selected':'') + '>' + esc(p) + '</option>'; }).join('');
    el('edit-modal-body').innerHTML =
      '<div class="mb-3"><label class="form-label fw-bold">Définition <span class="text-danger">*</span></label>'
      + '<textarea id="ed-def" class="form-control" rows="4">' + esc(d.definition||'') + '</textarea></div>'
      + '<div class="mb-3"><label class="form-label fw-bold">Usage IBODE</label>'
      + '<textarea id="ed-use" class="form-control" rows="2">' + esc(d.usage_notes||'') + '</textarea></div>'
      + '<div class="row g-2 mb-2">'
      + '<div class="col-md-4"><label class="form-label">Catégorie</label><select id="ed-cat" class="form-select">' + catOpts + '</select></div>'
      + '<div class="col-md-4"><label class="form-label">Pertinence</label><select id="ed-pert" class="form-select">' + pertOpts + '</select></div>'
      + '<div class="col-md-4"><label class="form-label">Variantes (pipe)</label><input id="ed-var" class="form-control" value="' + esc(d.variantes||'') + '"></div>'
      + '</div>'
      + '<div class="row g-2">'
      + '<div class="col-md-6"><label class="form-label">Terme latin</label><input id="ed-lat" class="form-control" value="' + esc(d.terme_latin||'') + '"></div>'
      + '<div class="col-md-6"><label class="form-label">Termes EN (virgules)</label><input id="ed-en" class="form-control" value="' + esc((d.termes_en||[]).join(', ')) + '"></div>'
      + '</div>';
    new bootstrap.Modal(el('editModal')).show();
  }

  el('btn-save-edit').addEventListener('click', function () {
    var term = S.editingTerm;
    if (!term) return;
    S.defs[term] = {
      definition:      el('ed-def').value,
      usage_notes:     el('ed-use').value,
      categorie:       el('ed-cat').value,
      pertinence_bloc: el('ed-pert').value,
      variantes:       el('ed-var').value,
      terme_latin:     el('ed-lat').value.trim() || null,
      termes_en:       el('ed-en').value.split(',').map(function(v){return v.trim();}).filter(Boolean),
      edited: true, error: null
    };
    bootstrap.Modal.getInstance(el('editModal')).hide();
    renderCards();
  });

  // ── SQL ───────────────────────────────────────────────────────────────────
  function pgS(v) { if(v===null||v===undefined||v==='') return 'NULL'; return "'" + String(v).replace(/'/g,"''") + "'"; }
  function pgArr(a) { if(!a||!a.length) return "'{}'"; return 'ARRAY[' + a.map(pgS).join(',') + ']'; }

  el('btn-gen-sql').addEventListener('click', function () {
    var ready = S.missing.filter(function(t){ return S.defs[t] && !S.defs[t].error && S.defs[t].definition; });
    if (!ready.length) { el('sql-output').textContent = '-- Aucune définition générée.'; return; }

    var lines = [
      '-- Glossaire BDB — INSERT batch sofcot.fr / Dicortho',
      '-- Généré : ' + new Date().toISOString().slice(0,10),
      '-- SAUVEGARDER dans migrations/ AVANT exécution',
      '',
      'INSERT INTO glossaire',
      '  (abbreviation, definition, usage_notes, categorie, pertinence_bloc,',
      '   variantes, terme_latin, termes_en, source, show_in_module, show_in_site, is_propagated)',
      'VALUES'
    ];
    var rows = ready.map(function(term) {
      var d = S.defs[term];
      var sim = d.pertinence_bloc === 'critique' || d.pertinence_bloc === 'haute';
      return '  (' + pgS(term) + ', ' + pgS(d.definition) + ', ' + pgS(d.usage_notes) + ', '
        + pgS(d.categorie) + ', ' + pgS(d.pertinence_bloc) + ', ' + pgS(d.variantes) + ', '
        + pgS(d.terme_latin) + ', ' + pgArr(d.termes_en) + ", 'BDB', "
        + (sim?'true':'false') + ', false, false)';
    });
    lines.push(rows.join(',\n') + ';');
    lines.push('');
    lines.push("-- Vérification : SELECT count(*) FROM glossaire WHERE source = 'BDB' AND created_at::date = current_date;");
    el('sql-output').textContent = lines.join('\n');
  });

  el('btn-copy-sql').addEventListener('click', function () {
    navigator.clipboard.writeText(el('sql-output').textContent).then(function () {
      var b = el('btn-copy-sql'); var orig = b.innerHTML;
      b.innerHTML = '<i class="bi bi-check me-1"></i>Copié !';
      setTimeout(function(){ b.innerHTML = orig; }, 2000);
    });
  });

  // ── Audit ─────────────────────────────────────────────────────────────────
  el('tab-audit-btn').addEventListener('click', loadAudit);

  async function loadAudit() {
    if (S.auditLoaded) return;
    show('audit-loading'); hide('audit-content'); hide('audit-error');
    try {
      var res = await window.bdb.from('glossaire')
        .select('abbreviation, definition, categorie, pertinence_bloc, source, show_in_module, variantes');
      if (res.error) throw res.error;
      renderAudit(res.data);
      S.auditLoaded = true;
    } catch(e) {
      el('audit-error').textContent = 'Erreur : ' + e.message;
      show('audit-error');
    } finally {
      hide('audit-loading');
    }
  }

  function renderAudit(data) {
    var noDef   = data.filter(function(r){ return !r.definition || !r.definition.trim(); });
    var noPert  = data.filter(function(r){ return !r.pertinence_bloc; });
    var incoher = data.filter(function(r){
      if (!r.pertinence_bloc) return false;
      var needVis = r.pertinence_bloc === 'critique' || r.pertinence_bloc === 'haute';
      return (needVis && !r.show_in_module) || (!needVis && r.show_in_module);
    });
    var complete = data.filter(function(r){ return r.definition && r.definition.trim() && r.pertinence_bloc && r.show_in_module; });

    var kpis = [['Total', data.length,'secondary'],['Complètes',complete.length,'success'],
      ['Sans définition',noDef.length, noDef.length?'danger':'success'],
      ['Sans pertinence',noPert.length, noPert.length?'warning':'success'],
      ['Incohérences',incoher.length, incoher.length?'warning':'success']];
    el('audit-kpis').innerHTML = kpis.map(function(k){
      return '<div class="col"><div class="card text-center py-2 border-' + esc(k[2]) + '">'
        + '<div class="fs-4 fw-bold text-' + esc(k[2]) + '">' + k[1] + '</div>'
        + '<small class="text-muted">' + esc(k[0]) + '</small></div></div>';
    }).join('');

    el('cnt-no-def').textContent  = noDef.length;
    el('cnt-no-pert').textContent = noPert.length;

    fillTbl('tbody-no-def', noDef, ['abbreviation','categorie','source','pertinence_bloc']);
    fillTbl('tbody-no-pert', noPert, ['abbreviation','categorie','source']);

    var tbody = el('tbody-incoher');
    if (!incoher.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-2">Aucune incohérence ✓</td></tr>';
    } else {
      tbody.innerHTML = incoher.slice(0,100).map(function(r){
        var needVis = r.pertinence_bloc === 'critique' || r.pertinence_bloc === 'haute';
        var fix = needVis ? 'SET show_in_module = true' : 'SET show_in_module = false';
        return '<tr><td>' + esc(r.abbreviation) + '</td><td>' + esc(r.pertinence_bloc) + '</td>'
          + '<td>' + (r.show_in_module?'✓':'✗') + '</td><td><code class="small">' + esc(fix) + '</code></td></tr>';
      }).join('');
    }

    show('audit-content');
  }

  function fillTbl(tbodyId, rows, cols) {
    var tb = el(tbodyId);
    if (!rows.length) { tb.innerHTML = '<tr><td colspan="' + cols.length + '" class="text-center text-muted py-2">Aucune lacune ✓</td></tr>'; return; }
    tb.innerHTML = rows.slice(0,100).map(function(r){
      return '<tr>' + cols.map(function(c){ return '<td>' + esc(r[c]||'–') + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  // ── Exposition globale (compatibilité) ────────────────────────────────────
  window.GF = { genOne: genOne, openEdit: openEdit };

  // ── Init (pattern await direct — exception 44 IDs neutres préservés) ────
  document.addEventListener('DOMContentLoaded', function () {
    (async function () {
      await window.bdbShellReady;
      if (!window.bdbUser) return;
      hide('gf-loading');
      if (!window.bdbUser.isAdmin) { show('gf-denied'); return; }
      show('gf-content');
      refreshBadge();
    })();
  });

})();
