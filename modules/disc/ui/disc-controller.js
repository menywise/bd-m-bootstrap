(function () {
    var state = {
        discFilter: 'ALL',
        search: '',
        activeScenario: null,
        activeScene: 0,
        exportPersonas: {},
        exportScenarioId: null,
        exportMode: 'prompt',
        crudCode: null,      // code en cours d'édition (null = nouveau)
        discTestAnswers: {},
        vakogTestAnswers: {},
        discTestDone: false,
        vakogTestDone: false,
        pendingDeleteCode: null
    };

    /* ── Helpers ── */
    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function toast(type, msg) {
        var bEl = document.getElementById(type === 'success' ? 'toast-success-body' : 'toast-info-body');
        if (bEl) bEl.textContent = msg;
        var tEl = document.getElementById(type === 'success' ? 'toastSuccess' : 'toastInfo');
        if (tEl) bootstrap.Toast.getOrCreateInstance(tEl).show();
    }
    function posClass(p) { return {'+/+':'disc-pos-pp','+/-':'disc-pos-pm','-/+':'disc-pos-mp','-/-':'disc-pos-mm'}[p]||'disc-pos-pp'; }

    /* ── Navigation ── */
    function navigate(view) {
        document.querySelectorAll('.disc-view').forEach(function(v){ v.classList.remove('active'); });
        var el = document.getElementById('view-'+view);
        if (el) el.classList.add('active');
        document.querySelectorAll('[data-nav]').forEach(function(a){ a.classList.toggle('active', a.dataset.nav===view); });
        var titles = { dashboard:'Dashboard', personas:'Personas', 'test-disc':'Test DISC', 'test-vakog':'Test VAKOG', 'ref-disc':'Référentiel DISC', 'ref-vakog':'Référentiel VAKOG', scenarios:'Scénarios', export:'Export IA' };
        var bc = document.getElementById('header-breadcrumb');
        if (bc) bc.textContent = titles[view]||'';
        var renders = { dashboard:renderDashboard, personas:renderPersonas, 'test-disc':renderDiscTest, 'test-vakog':renderVakogTest, scenarios:renderScenarios, export:renderExport };
        if (renders[view]) renders[view]();
    }

    /* ── Persona card ── */
    function buildPersonaCard(p, actions) {
        var btns = actions ? '<div class="d-flex gap-1 mt-2"><button class="btn btn-outline-secondary btn-sm flex-grow-1" data-edit="'+esc(p._code)+'"><i class="bi bi-pencil me-1"></i>Modifier</button><button class="btn btn-sm btn-outline-primary flex-grow-1" data-view-persona="'+esc(p._code)+'"><i class="bi bi-eye me-1"></i>Détail</button></div>' : '';
        return '<div class="col-sm-6 col-xl-4"><div class="card shadow-sm h-100 disc-persona-card disc-stripe-'+esc(p.DISC)+'" data-view-persona="'+esc(p._code)+'">' +
            '<div class="card-body">' +
              '<div class="d-flex align-items-start gap-3 mb-2">' +
                '<div class="disc-avatar disc-avatar-'+esc(p.DISC)+'">'+esc(p.prenom.charAt(0))+'</div>' +
                '<div class="flex-grow-1 disc-persona-info"><div class="fw-bold text-truncate">'+esc(p.prenom)+' '+esc(p.nom)+'</div><div class="small text-muted text-truncate">'+esc(p.rolePedago)+'</div></div>' +
                '<span class="fs-3 fw-black disc-letter-'+esc(p.DISC)+'">'+esc(p.DISC)+'</span>' +
              '</div>' +
              '<div class="d-flex flex-wrap gap-1 mt-2"><span class="badge bg-secondary-subtle text-secondary">E'+esc(p.ennea)+'</span><span class="'+posClass(p.AT.position)+' small">'+esc(p.AT.position)+'</span><span class="badge bg-light text-muted border">'+esc(p.VAKOG.primary)+'</span></div>' +
              '<div class="small text-muted mt-2">'+esc(p.savoirEtre.slice(0,2).join(' · '))+'</div>' +
            btns +
            '</div></div></div>';
    }

    /* ── DASHBOARD ── */
    function renderDashboard() {
        var personas = DiscEngine.getAllPersonas();
        var scenarios = DiscEngine.listScenarios();
        var counts = {D:0,I:0,S:0,C:0};
        personas.forEach(function(p){ counts[p.DISC]++; });
        var kpi = [
            {v:personas.length,l:'Personas',icon:'person-badge',cls:'border-primary'},
            {v:scenarios.length,l:'Scénarios',icon:'layers',cls:'border-success'},
            {v:scenarios.reduce(function(a,s){return a+s.scenes.length;},0),l:'Scènes',icon:'file-play',cls:'border-warning'},
            {v:personas.filter(function(p){return p.fn==='infirmier';}).length,l:'IDE',icon:'heart-pulse',cls:'border-danger'}
        ];
        var kpiRow = document.getElementById('kpi-row');
        if (kpiRow) kpiRow.innerHTML = kpi.map(function(k){ return '<div class="col-6 col-md-3"><div class="card shadow-sm text-center p-3 border-top border-4 '+k.cls+' disc-pole-card h-100"><i class="bi bi-'+k.icon+' fs-3 mb-1 text-muted"></i><strong class="d-block fs-3">'+k.v+'</strong><small class="text-muted">'+k.l+'</small></div></div>'; }).join('');
        var dd = document.getElementById('disc-distribution');
        if (dd) dd.innerHTML = ['D','I','S','C'].map(function(L){ var info=DiscSchema.DISC_TYPES[L]; var pct=personas.length?Math.round(counts[L]/personas.length*100):0; return '<div class="col-6 col-md-3"><div class="card shadow-sm text-center p-3 disc-stripe-'+L+' disc-pole-card"><span class="fs-2 fw-black disc-letter-'+L+'">'+L+'</span><div class="small text-muted mb-1">'+info.label+'</div><div class="progress mb-1" style="height:4px"><div class="progress-bar" style="width:'+pct+'%;background:'+info.color+'"></div></div><small class="text-muted">'+counts[L]+' persona'+(counts[L]>1?'s':'')+'</small></div></div>'; }).join('');
        var prev = document.getElementById('dashboard-preview');
        if (prev) { prev.innerHTML = personas.slice(0,4).map(function(p){return buildPersonaCard(p,false);}).join(''); bindPersonaViewCards(prev); }
        var sNavP = document.getElementById('snav-personas');
        if (sNavP) sNavP.textContent = personas.length;
        var sNavS = document.getElementById('snav-scenarios');
        if (sNavS) sNavS.textContent = DiscEngine.listScenarios().length;
    }

    /* ── PERSONAS ── */
    function renderPersonas() {
        refreshPersonaSelects();
        var grid = document.getElementById('persona-grid');
        if (!grid) return;
        var personas = DiscEngine.getAllPersonas().filter(function(p){
            var md = state.discFilter==='ALL'||p.DISC===state.discFilter;
            var ms = !state.search||p.prenom.toLowerCase().indexOf(state.search)>=0||p.nom.toLowerCase().indexOf(state.search)>=0||p.rolePedago.toLowerCase().indexOf(state.search)>=0;
            return md && ms;
        });
        if (!personas.length) { grid.innerHTML = '<div class="col-12"><div class="alert alert-info"><i class="bi bi-search me-2"></i>Aucun persona ne correspond.</div></div>'; return; }
        grid.innerHTML = personas.map(function(p){return buildPersonaCard(p,true);}).join('');
        bindPersonaViewCards(grid);
        grid.querySelectorAll('[data-edit]').forEach(function(btn){
            btn.addEventListener('click', function(e){ e.stopPropagation(); openPersonaCRUD(btn.dataset.edit); });
        });
    }

    function bindPersonaViewCards(container) {
        container.querySelectorAll('[data-view-persona]').forEach(function(card){
            card.addEventListener('click', function(e){
                if (e.target.closest('[data-edit]')) return;
                openPersonaDetail(card.dataset.viewPersona);
            });
        });
    }

    /* ── PERSONA DETAIL offcanvas ── */
    function openPersonaDetail(code) {
        var p = DiscEngine.getPersona(code);
        if (!p) return;
        var dt = DiscSchema.DISC_TYPES[p.DISC];
        var h = document.getElementById('persona-detail-header');
        if (h) h.innerHTML = '<div class="disc-avatar disc-avatar-'+esc(p.DISC)+'">'+esc(p.prenom.charAt(0))+'</div><div><div class="fw-bold">'+esc(p.prenom)+' '+esc(p.nom)+'</div><div class="small text-muted">'+esc(p.rolePedago)+'</div></div>';
        var b = document.getElementById('persona-detail-body');
        if (!b) return;
        b.innerHTML =
            (p.sandbox?'<div class="alert alert-warning py-2 small"><i class="bi bi-cone-striped me-1"></i>Données sandbox — profil fictif</div>':'')+
            '<h6 class="text-uppercase text-muted small mb-2 mt-3">Profil DISC</h6>'+
            '<div class="card disc-badge-'+esc(p.DISC)+' mb-3 border-0"><div class="card-body py-2 px-3"><span class="fs-2 fw-black disc-letter-'+esc(p.DISC)+'">'+esc(p.DISC)+'</span><span class="ms-2 fw-semibold">'+esc(dt.label)+'</span><div class="small text-muted">'+esc(dt.desc)+'</div></div></div>'+
            '<h6 class="text-uppercase text-muted small mb-2">Ennéagramme</h6>'+
            '<div class="mb-3"><span class="badge bg-secondary-subtle text-secondary me-1">Type '+esc(p.ennea)+'</span><small class="text-muted">'+esc(DiscSchema.ENNEA[p.ennea])+'</small></div>'+
            '<h6 class="text-uppercase text-muted small mb-2">Analyse Transactionnelle</h6>'+
            '<div class="row g-2 mb-2"><div class="col-6"><div class="card shadow-sm"><div class="card-body py-2 px-3"><div class="small text-muted mb-1">Base</div>'+p.AT.base.map(function(e){return '<span class="disc-chip-at-base">'+esc(e)+'</span>';}).join('')+'</div></div></div><div class="col-6"><div class="card shadow-sm"><div class="card-body py-2 px-3"><div class="small text-muted mb-1">Stress</div>'+p.AT.stress.map(function(e){return '<span class="disc-chip-at-stress">'+esc(e)+'</span>';}).join('')+'</div></div></div></div>'+
            '<div class="mb-3">Position de vie : <span class="'+posClass(p.AT.position)+'">'+esc(p.AT.position)+'</span></div>'+
            '<h6 class="text-uppercase text-muted small mb-2">VAKOG</h6>'+
            '<div class="mb-3"><span class="disc-chip-vakog-primary">'+esc(p.VAKOG.primary)+' ★</span><span class="badge bg-light text-muted border ms-1">'+esc(p.VAKOG.secondary)+'</span></div>'+
            '<h6 class="text-uppercase text-muted small mb-2">Méta-programmes</h6>'+
            '<div class="mb-3">'+p.meta.map(function(m){return '<span class="disc-chip-meta">'+esc(m)+'</span>';}).join('')+'</div>'+
            '<h6 class="text-uppercase text-muted small mb-2">Savoir-être</h6>'+
            '<div class="mb-3">'+p.savoirEtre.map(function(s){return '<span class="disc-chip-se">'+esc(s)+'</span>';}).join('')+'</div>'+
            '<div class="mt-3"><button class="btn btn-outline-primary btn-sm w-100" data-bs-dismiss="offcanvas" data-edit-from-detail="'+esc(p._code)+'"><i class="bi bi-pencil me-1"></i>Modifier ce persona</button></div>';
        var oc = new bootstrap.Offcanvas(document.getElementById('offcanvasPersona'));
        oc.show();
        setTimeout(function(){
            var editBtn = b.querySelector('[data-edit-from-detail]');
            if (editBtn) editBtn.addEventListener('click', function(){ openPersonaCRUD(editBtn.dataset.editFromDetail); });
        },100);
    }

    /* ── TAG INPUT ── */
    function initTagInput(containerId, initialTags) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        (initialTags||[]).forEach(function(t){ addTag(container, t); });
        var input = document.createElement('input');
        input.className = 'disc-tag-input-field';
        input.placeholder = 'Ajouter + Entrée';
        input.addEventListener('keydown', function(e){
            if ((e.key==='Enter'||e.key===',')&&input.value.trim()) {
                e.preventDefault();
                addTag(container, input.value.trim());
                input.value = '';
            } else if (e.key==='Backspace'&&!input.value) {
                var tags = container.querySelectorAll('.disc-tag-item');
                if (tags.length) tags[tags.length-1].remove();
            }
        });
        container.appendChild(input);
        container.addEventListener('click', function(){ input.focus(); });
    }
    function addTag(container, text) {
        var input = container.querySelector('.disc-tag-input-field');
        var tag = document.createElement('span');
        tag.className = 'disc-tag-item';
        tag.innerHTML = esc(text)+' <span class="disc-tag-remove">&times;</span>';
        tag.querySelector('.disc-tag-remove').addEventListener('click', function(){ tag.remove(); });
        container.insertBefore(tag, input);
    }
    function getTagValues(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.querySelectorAll('.disc-tag-item')).map(function(t){ return t.textContent.replace('×','').trim(); });
    }

    /* ── CRUD PERSONA ── */
    function openPersonaCRUD(editCode) {
        state.crudCode = editCode || null;
        var p = editCode ? DiscEngine.getPersona(editCode) : null;
        var modal = document.getElementById('modalPersona');
        var label = document.getElementById('modalPersonaLabel');
        var btnDel = document.getElementById('btn-delete-persona');
        if (label) label.innerHTML = p ? '<i class="bi bi-pencil text-warning me-2"></i>Modifier : '+esc(p.prenom)+' '+esc(p.nom) : '<i class="bi bi-person-plus text-primary me-2"></i>Nouveau persona';
        if (btnDel) btnDel.classList.toggle('d-none', !p);

        // Remplir les champs
        var set = function(id, val){ var el=document.getElementById(id); if(el) el.value = val||''; };
        set('f-prenom',   p?p.prenom:'');
        set('f-nom',      p?p.nom:'');
        set('f-fn',       p?p.fn:'infirmier');
        set('f-role',     p?p.rolePedago:'');
        set('f-code',     p?p._code:'');
        set('f-disc',     p?p.DISC:'D');
        set('f-ennea',    p?p.ennea:'1');
        set('f-position', p?p.AT.position:'+/+');
        set('f-vakog-p',  p?p.VAKOG.primary:'visuel');
        set('f-vakog-s',  p?p.VAKOG.secondary:'auditif');

        // Désactiver le champ code en édition
        var codeField = document.getElementById('f-code');
        if (codeField) codeField.readOnly = !!p;

        // Tag inputs
        initTagInput('tags-at-base',   p?p.AT.base:[]);
        initTagInput('tags-at-stress', p?p.AT.stress:[]);
        initTagInput('tags-se',        p?p.savoirEtre:[]);
        initTagInput('tags-meta',      p?p.meta:[]);

        // Résultats test auto-injectés
        var testSec = document.getElementById('crud-test-results-section');
        if (testSec) testSec.style.display = 'none';

        var bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    function savePersonaCRUD() {
        var isEdit = !!state.crudCode;
        var code = isEdit ? state.crudCode : (document.getElementById('f-code').value||'').trim().toUpperCase().replace(/\s/g,'_');
        if (!code) { toast('info','Le code canonique est obligatoire.'); return; }
        var prenom = document.getElementById('f-prenom').value.trim();
        var nom    = document.getElementById('f-nom').value.trim();
        if (!prenom||!nom) { toast('info','Prénom et nom sont obligatoires.'); return; }

        var persona = {
            _code: code,
            nom: nom,
            prenom: prenom,
            fn: document.getElementById('f-fn').value,
            rolePedago: document.getElementById('f-role').value,
            DISC: document.getElementById('f-disc').value,
            ennea: document.getElementById('f-ennea').value,
            savoirEtre: getTagValues('tags-se'),
            AT: {
                base:     getTagValues('tags-at-base'),
                stress:   getTagValues('tags-at-stress'),
                position: document.getElementById('f-position').value
            },
            VAKOG: {
                primary:   document.getElementById('f-vakog-p').value,
                secondary: document.getElementById('f-vakog-s').value
            },
            meta: getTagValues('tags-meta'),
            actif: true,
            sandbox: false
        };

        DiscPersonaStore.save(persona);
        bootstrap.Modal.getInstance(document.getElementById('modalPersona')).hide();
        toast('success', (isEdit?'Persona modifié : ':'Persona créé : ') + prenom + ' ' + nom);
        renderPersonas();
        renderDashboard();
    }

    function deletePersona(code) {
        state.pendingDeleteCode = code;
        bootstrap.Modal.getInstance(document.getElementById('modalPersona')).hide();
        setTimeout(function(){
            new bootstrap.Modal(document.getElementById('modalConfirmDelete')).show();
        },300);
    }

    /* ── TEST DISC ── */
    function renderDiscTest() {
        var container = document.getElementById('disc-test-container');
        var results = document.getElementById('disc-test-results');
        if (!container||!results) return;
        results.classList.add('d-none');
        state.discTestDone = false;
        state.discTestAnswers = {};
        var questions = DiscTests.DISC_QUESTIONS;
        var html = questions.map(function(q,qi){
            return '<div class="card shadow-sm mb-3" id="disc-q-'+qi+'">' +
                '<div class="card-header bg-transparent d-flex align-items-center gap-3">' +
                  '<span class="badge bg-primary-subtle text-primary border border-primary-subtle disc-q-badge">'+(qi+1)+'</span>' +
                  '<strong class="small">'+esc(q.q)+'</strong>' +
                '</div>' +
                '<div class="card-body">' +
                  '<div class="row g-2">' +
                    q.opts.map(function(opt){ return '<div class="col-md-6"><div class="disc-test-option" data-q="'+qi+'" data-t="'+esc(opt.t)+'"><span class="badge disc-badge-'+esc(opt.t)+' me-2 px-2">'+esc(opt.t)+'</span><small>'+esc(opt.l)+'</small></div></div>'; }).join('') +
                  '</div>' +
                '</div>' +
            '</div>';
        }).join('');
        html += '<div class="text-center mt-3"><button class="btn btn-primary btn-lg" id="btn-disc-submit" disabled><i class="bi bi-check-lg me-2"></i>Voir mes résultats</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.disc-test-option').forEach(function(opt){
            opt.addEventListener('click', function(){
                var q = opt.dataset.q;
                var prev = container.querySelector('.disc-test-option.selected[data-q="'+q+'"]');
                if (prev) prev.classList.remove('selected');
                opt.classList.add('selected');
                state.discTestAnswers[q] = opt.dataset.t;
                var answered = Object.keys(state.discTestAnswers).length;
                var submitBtn = document.getElementById('btn-disc-submit');
                if (submitBtn) submitBtn.disabled = (answered < questions.length);
            });
        });
        var submitBtn = document.getElementById('btn-disc-submit');
        if (submitBtn) submitBtn.addEventListener('click', showDiscResults);
    }

    function showDiscResults() {
        var scores = {D:0,I:0,S:0,C:0};
        Object.values(state.discTestAnswers).forEach(function(t){ if(scores[t]!==undefined) scores[t]++; });
        var total = Object.values(scores).reduce(function(a,b){return a+b;},0);
        var sorted = Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];});
        var winner = sorted[0];
        var body = document.getElementById('disc-results-body');
        if (!body) return;
        var desc = { D:'Style direct et orienté résultat. Vous êtes à l\'aise avec la prise de décision rapide et aimez contrôler les situations.', I:'Style influent et enthousiaste. Vous excellez dans la communication et la mobilisation des équipes.', S:'Style stable et empathique. Vous êtes un pilier de cohésion, fiable et attentif aux autres.', C:'Style consciencieux et analytique. Vous êtes expert en résolution de problèmes complexes et garantissez la qualité.' };
        body.innerHTML =
            '<div class="alert alert-primary mb-4"><strong>Votre profil dominant : </strong><span class="badge bg-danger fs-5 px-3 py-2 ms-2">'+esc(winner)+'</span><span class="ms-2 fw-semibold">'+esc(DiscSchema.DISC_TYPES[winner].label)+'</span><p class="mb-0 mt-2 small">'+esc(desc[winner])+'</p></div>'+
            '<div class="row g-3 mb-3">'+
            sorted.map(function(L){
                var pct = total ? Math.round(scores[L]/total*100) : 0;
                return '<div class="col-md-6"><div class="card shadow-sm disc-stripe-'+L+(L===winner?' disc-result-card-winner border-'+({'D':'danger','I':'warning','S':'primary','C':'success'}[L])||'border-primary':'')+'">' +
                    '<div class="card-body py-2">' +
                      '<div class="d-flex align-items-center gap-2 mb-2">' +
                        '<span class="fs-3 fw-black disc-letter-'+L+'">'+L+'</span>' +
                        '<div class="flex-grow-1"><div class="small fw-semibold">'+esc(DiscSchema.DISC_TYPES[L].label)+'</div><div class="small text-muted">'+scores[L]+' / '+total+' réponses</div></div>' +
                        '<span class="fw-bold disc-letter-'+L+'">'+pct+'%</span>' +
                      '</div>' +
                      '<div class="progress disc-progress-md"><div class="disc-result-bar-'+L+' disc-test-progress-bar" style="width:'+pct+'%"></div></div>' +
                    '</div>' +
                '</div></div>';
            }).join('')+
            '</div>';
        state.discTestDone = true;
        state.discTestResult = { winner:winner, scores:scores };
        document.getElementById('disc-test-results').classList.remove('d-none');
        document.getElementById('disc-test-results').scrollIntoView({behavior:'smooth'});
        var injectBtn = document.getElementById('btn-disc-inject');
        if (injectBtn) injectBtn.classList.toggle('d-none', !document.getElementById('disc-test-persona-select').value);
    }

    /* ── TEST VAKOG ── */
    function renderVakogTest() {
        var container = document.getElementById('vakog-test-container');
        var results = document.getElementById('vakog-test-results');
        if (!container||!results) return;
        results.classList.add('d-none');
        state.vakogTestDone = false;
        state.vakogTestAnswers = {};
        var questions = DiscTests.VAKOG_QUESTIONS;
        var html = questions.map(function(q,qi){
            return '<div class="card shadow-sm mb-3" id="vakog-q-'+qi+'">' +
                '<div class="card-header bg-transparent d-flex align-items-center gap-3">' +
                  '<span class="badge bg-success-subtle text-success border border-success-subtle disc-q-badge">'+(qi+1)+'</span>' +
                  '<strong class="small">'+esc(q.q)+'</strong>' +
                '</div>' +
                '<div class="card-body">' +
                  '<div class="d-flex flex-column gap-2">' +
                    q.opts.map(function(opt){ return '<div class="disc-test-option" data-q="'+qi+'" data-t="'+esc(opt.t)+'"><span class="badge vakog-badge-'+esc(opt.t)+' me-2 px-2">'+esc(opt.t)+'</span><small>'+esc(opt.l)+'</small></div>'; }).join('') +
                  '</div>' +
                '</div>' +
            '</div>';
        }).join('');
        html += '<div class="text-center mt-3"><button class="btn btn-success btn-lg" id="btn-vakog-submit" disabled><i class="bi bi-check-lg me-2"></i>Voir mes résultats</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.disc-test-option').forEach(function(opt){
            opt.addEventListener('click', function(){
                var q = opt.dataset.q;
                var prev = container.querySelector('.disc-test-option.selected[data-q="'+q+'"]');
                if (prev) prev.classList.remove('selected');
                opt.classList.add('selected');
                state.vakogTestAnswers[q] = opt.dataset.t;
                var submitBtn = document.getElementById('btn-vakog-submit');
                if (submitBtn) submitBtn.disabled = Object.keys(state.vakogTestAnswers).length < questions.length;
            });
        });
        var submitBtn = document.getElementById('btn-vakog-submit');
        if (submitBtn) submitBtn.addEventListener('click', showVakogResults);
    }

    function showVakogResults() {
        var scores = {V:0,A:0,K:0,O:0,G:0};
        Object.values(state.vakogTestAnswers).forEach(function(t){ if(scores[t]!==undefined) scores[t]++; });
        var total = Object.values(scores).reduce(function(a,b){return a+b;},0);
        var sorted = Object.keys(scores).sort(function(a,b){return scores[b]-scores[a];});
        var winner = sorted[0];
        var second = sorted[1];
        var desc = { V:'Canal visuel dominant. Vous traitez l\'information par images, schémas et représentations spatiales. Vous apprenez en voyant.', A:'Canal auditif dominant. Vous traitez l\'information par les sons, le rythme de la voix et les échanges oraux.', K:'Canal kinesthésique dominant. Vous apprenez en faisant, en ressentant. Le contact et l\'action sont essentiels pour vous.', O:'Canal olfactif sensible. L\'atmosphère et l\'ambiance conditionnent fortement votre attention et votre engagement.', G:'Canal gustatif actif. Vous êtes particulièrement sensible au "goût" de l\'expérience, à la satisfaction ressentie.' };
        var body = document.getElementById('vakog-results-body');
        if (!body) return;
        body.innerHTML =
            '<div class="alert alert-success mb-4"><strong>Votre canal dominant : </strong><span class="badge bg-primary fs-5 px-3 py-2 ms-2">'+esc(winner)+'</span><span class="ms-2 fw-semibold">'+esc(DiscSchema.VAKOG_TYPES[winner].label)+'</span><p class="mb-0 mt-2 small">'+esc(desc[winner])+'</p><p class="mb-0 mt-1 small text-muted">Canal secondaire : <strong>'+esc(second)+' — '+esc(DiscSchema.VAKOG_TYPES[second].label)+'</strong></p></div>'+
            '<div class="row g-3 mb-3">'+
            sorted.map(function(L){
                var vt = DiscSchema.VAKOG_TYPES[L];
                var pct = total?Math.round(scores[L]/total*100):0;
                return '<div class="col-md-6 col-xl-4"><div class="card shadow-sm '+(L===winner?'border-2 border-success':'')+'">' +
                    '<div class="card-body py-2">' +
                      '<div class="d-flex align-items-center gap-2 mb-2">' +
                        '<span class="badge vakog-badge-'+L+' fs-5 px-2 py-2">'+L+'</span>' +
                        '<div class="flex-grow-1"><div class="small fw-semibold">'+esc(vt.label)+'</div><div class="small text-muted">'+scores[L]+' / '+total+'</div></div>' +
                        '<span class="fw-bold" style="color:'+vt.color+'">'+pct+'%</span>' +
                      '</div>' +
                      '<div class="progress disc-progress-md"><div class="disc-result-bar-'+(L==='K'?'K':L==='A'?'A':L==='V'?'V':'D')+' disc-test-progress-bar" style="width:'+pct+'%;background:'+vt.color+'"></div></div>' +
                    '</div>' +
                '</div></div>';
            }).join('')+
            '</div>';
        state.vakogTestDone = true;
        state.vakogTestResult = { winner:winner, second:second, scores:scores };
        document.getElementById('vakog-test-results').classList.remove('d-none');
        document.getElementById('vakog-test-results').scrollIntoView({behavior:'smooth'});
        var injectBtn = document.getElementById('btn-vakog-inject');
        if (injectBtn) injectBtn.classList.toggle('d-none', !document.getElementById('vakog-test-persona-select').value);
    }

    /* ── Inject résultats test → persona ── */
    function injectDiscResult(code) {
        if (!state.discTestResult||!code) return;
        var p = DiscEngine.getPersona(code);
        if (!p) return;
        var updated = JSON.parse(JSON.stringify(p));
        updated.DISC = state.discTestResult.winner;
        DiscPersonaStore.save(updated);
        toast('success', 'Profil DISC '+state.discTestResult.winner+' appliqué à '+p.prenom+' '+p.nom);
        renderDashboard();
    }
    function injectVakogResult(code) {
        if (!state.vakogTestResult||!code) return;
        var p = DiscEngine.getPersona(code);
        if (!p) return;
        var updated = JSON.parse(JSON.stringify(p));
        updated.VAKOG = { primary: state.vakogTestResult.winner.toLowerCase() === 'v' ? 'visuel' : state.vakogTestResult.winner.toLowerCase() === 'a' ? 'auditif' : state.vakogTestResult.winner.toLowerCase() === 'k' ? 'kinesthésique' : state.vakogTestResult.winner.toLowerCase() === 'o' ? 'olfactif' : 'gustatif', secondary: state.vakogTestResult.second.toLowerCase() === 'v' ? 'visuel' : state.vakogTestResult.second.toLowerCase() === 'a' ? 'auditif' : state.vakogTestResult.second.toLowerCase() === 'k' ? 'kinesthésique' : state.vakogTestResult.second.toLowerCase() === 'o' ? 'olfactif' : 'gustatif' };
        DiscPersonaStore.save(updated);
        toast('success', 'VAKOG '+state.vakogTestResult.winner+'/'+state.vakogTestResult.second+' appliqué à '+p.prenom+' '+p.nom);
    }

    /* ── Refresh selects personas ── */
    function refreshPersonaSelects() {
        var personas = DiscEngine.getAllPersonas();
        ['disc-test-persona-select','vakog-test-persona-select'].forEach(function(id){
            var sel = document.getElementById(id);
            if (!sel) return;
            var val = sel.value;
            sel.innerHTML = '<option value="">— Ne pas associer —</option>';
            personas.forEach(function(p){ var opt = document.createElement('option'); opt.value=p._code; opt.textContent=p.prenom+' '+p.nom; sel.appendChild(opt); });
            if (val) sel.value = val;
        });
    }

    /* ── SCÉNARIOS ── */
    function renderScenarios() {
        var list = document.getElementById('scenario-list');
        if (!list) return;
        document.getElementById('scenario-list-view').classList.remove('d-none');
        document.getElementById('scene-viewer-view').classList.add('d-none');
        list.innerHTML = DiscEngine.listScenarios().map(function(sc){
            var chars = sc.personnages.map(function(c){return DiscEngine.getPersona(c);}).filter(Boolean);
            return '<div class="card shadow-sm disc-scenario-card" data-sc-id="'+esc(sc.id)+'">' +
                '<div class="card-body d-flex align-items-center gap-3">' +
                  '<span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-6">'+esc(sc.id)+'</span>' +
                  '<div class="flex-grow-1"><div class="fw-bold">'+esc(sc.titre)+'</div><div class="small text-muted">'+sc.scenes.length+' scènes · '+chars.map(function(p){return p.prenom;}).join(', ')+'</div></div>' +
                  '<span class="badge bg-light text-muted border">v'+esc(sc.version)+'</span>' +
                  '<i class="bi bi-arrow-right text-muted"></i>' +
                '</div></div>';
        }).join('');
        list.querySelectorAll('[data-sc-id]').forEach(function(card){
            card.addEventListener('click', function(){ openScenario(card.dataset.scId); });
        });
    }

    function openScenario(id) {
        var sc = DiscEngine.getScenario(id);
        if (!sc) return;
        state.activeScenario = sc;
        state.activeScene = 0;
        document.getElementById('scenario-list-view').classList.add('d-none');
        document.getElementById('scene-viewer-view').classList.remove('d-none');
        document.getElementById('scene-scenario-title').textContent = sc.titre;
        document.getElementById('scene-scenario-version').textContent = 'v'+sc.version;
        var tabs = document.getElementById('scene-tabs');
        tabs.innerHTML = sc.scenes.map(function(s,i){ return '<li class="nav-item"><button class="nav-link'+(i===0?' active':'')+'" data-si="'+i+'"><i class="bi bi-camera-reels me-1"></i>Scène '+(i+1)+' — '+esc(s.titre)+'</button></li>'; }).join('');
        tabs.querySelectorAll('[data-si]').forEach(function(btn){
            btn.addEventListener('click', function(){ tabs.querySelectorAll('.nav-link').forEach(function(b){b.classList.remove('active');}); btn.classList.add('active'); renderScene(sc, parseInt(btn.dataset.si)); });
        });
        renderScene(sc, 0);
    }

    function renderScene(sc, idx) {
        var s = sc.scenes[idx];
        var body = document.getElementById('scene-body');
        if (!body||!s) return;
        var pm = {};
        DiscEngine.getAllPersonas().forEach(function(p){ pm[p._code]=p; });
        var atRows = Object.keys(s.grille.at).map(function(code){ var p=pm[code]; return '<tr><td><span class="fw-semibold disc-letter-'+(p?p.DISC:'C')+'">'+esc((p||{prenom:code}).prenom)+'</span></td><td class="small text-muted">'+esc(s.grille.at[code])+'</td></tr>'; }).join('');
        body.innerHTML =
            '<div class="col-lg-8">'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-geo-alt me-2 text-primary"></i>Contexte</strong></div><div class="card-body text-muted small">'+esc(s.contexte)+'</div></div>'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-bullseye me-2 text-primary"></i>Objectif pédagogique</strong></div><div class="card-body text-muted small">'+esc(s.objectif)+'</div></div>'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-play-circle me-2 text-primary"></i>Déroulé</strong></div><div class="card-body text-muted small">'+esc(s.deroulé)+'</div></div>'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-shuffle me-2 text-warning"></i>Points de bascule</strong></div><div class="card-body">'+s.bascule.map(function(b){ return '<div class="disc-bascule-item"><i class="bi bi-chevron-right me-2 text-warning"></i>'+esc(b)+'</div>'; }).join('')+'</div></div>'+
              '<div class="card shadow-sm"><div class="card-header bg-transparent"><strong><i class="bi bi-chat-square-quote me-2 text-success"></i>Pistes de débriefing</strong></div><div class="card-body">'+s.debrief.map(function(d){ return '<div class="disc-debrief-item"><i class="bi bi-question-circle me-2 text-success"></i>'+esc(d)+'</div>'; }).join('')+'</div></div>'+
            '</div>'+
            '<div class="col-lg-4">'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-people me-2 text-primary"></i>Personnages</strong></div><div class="card-body">'+sc.personnages.map(function(code){ var p=pm[code]; if(!p)return''; return '<span class="disc-perso-chip"><span class="disc-dot disc-dot-'+esc(p.DISC)+'"></span>'+esc(p.prenom)+' <span class="small disc-letter-'+esc(p.DISC)+'">'+esc(p.DISC)+'</span></span>'; }).join('')+'</div></div>'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-table me-2 text-primary"></i>Grille AT</strong></div><div class="card-body p-0"><table class="table table-sm table-hover mb-0 small"><thead><tr><th>Persona</th><th>État du moi</th></tr></thead><tbody>'+atRows+'</tbody></table></div></div>'+
              '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-chat-x me-2 text-danger"></i>Langage à recadrer</strong></div><div class="card-body">'+s.grille.recadrage.map(function(r){ return '<div class="disc-recadrage-item">'+esc(r)+'</div>'; }).join('')+'</div></div>'+
              '<div class="card shadow-sm"><div class="card-header bg-transparent"><strong><i class="bi bi-eye me-2 text-secondary"></i>Faits observables</strong></div><div class="card-body"><ul class="list-unstyled small text-muted mb-0">'+s.grille.faits.map(function(f){ return '<li class="mb-1"><i class="bi bi-dot me-1"></i>'+esc(f)+'</li>'; }).join('')+'</ul></div></div>'+
            '</div>';
    }

    /* ── EXPORT ── */
    function renderExport() {
        var personas = DiscEngine.getAllPersonas();
        var pl = document.getElementById('export-persona-list');
        if (pl) {
            pl.innerHTML = personas.map(function(p){
                var chk = !!state.exportPersonas[p._code];
                return '<div class="form-check d-flex align-items-center gap-2 p-2 border rounded mb-1'+(chk?' bg-primary-subtle border-primary':'')+'" data-exp-persona="'+esc(p._code)+'"><input class="form-check-input" type="checkbox" id="ep-'+esc(p._code)+'"'+(chk?' checked':'')+' tabindex="-1"><span class="disc-dot disc-dot-'+esc(p.DISC)+'"></span><label class="form-check-label flex-grow-1 small" for="ep-'+esc(p._code)+'">'+esc(p.prenom)+' '+esc(p.nom)+'</label><span class="badge disc-badge-'+esc(p.DISC)+'">'+esc(p.DISC)+'</span></div>';
            }).join('');
            pl.querySelectorAll('[data-exp-persona]').forEach(function(row){
                row.addEventListener('click', function(){
                    var code = row.dataset.expPersona;
                    state.exportPersonas[code] = !state.exportPersonas[code];
                    renderExport();
                });
            });
        }
        var sl = document.getElementById('export-scenario-list');
        if (sl) {
            sl.innerHTML = DiscEngine.listScenarios().map(function(sc){
                var sel = state.exportScenarioId===sc.id;
                return '<div class="d-flex align-items-center gap-2 p-2 border rounded mb-1 disc-scenario-card'+(sel?' selected border-primary bg-primary-subtle':'')+'" data-exp-sc="'+esc(sc.id)+'"><span class="badge bg-primary-subtle text-primary border border-primary-subtle">'+esc(sc.id)+'</span><span class="flex-grow-1 small">'+esc(sc.titre)+'</span>'+(sel?'<i class="bi bi-check-circle-fill text-primary"></i>':'')+'</div>';
            }).join('');
            sl.querySelectorAll('[data-exp-sc]').forEach(function(row){
                row.addEventListener('click', function(){ state.exportScenarioId=row.dataset.expSc; renderExport(); });
            });
        }
    }

    function generateExport() {
        var codes = Object.keys(state.exportPersonas).filter(function(k){return state.exportPersonas[k];});
        var allCodes = codes.length ? codes : DiscEngine.getAllPersonas().map(function(p){return p._code;});
        var ta = document.getElementById('export-textarea');
        var card = document.getElementById('export-result-card');
        if (!ta||!card) return;
        ta.value = state.exportMode==='json' ? DiscEngine.exportJSON(allCodes,state.exportScenarioId) : DiscEngine.exportPrompt(allCodes,state.exportScenarioId);
        card.classList.remove('d-none');
        card.scrollIntoView({behavior:'smooth'});
    }

    /* ── INIT ── */
    document.addEventListener('DOMContentLoaded', function () {
        // Tooltips
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function(el){ new bootstrap.Tooltip(el); });

        // Nav
        document.querySelectorAll('[data-nav]').forEach(function(a){
            a.addEventListener('click', function(e){ e.preventDefault(); navigate(a.dataset.nav); });
        });

        // Filtres DISC personas
        document.querySelectorAll('[data-disc-filter]').forEach(function(pill){
            pill.addEventListener('click', function(){
                state.discFilter = pill.dataset.discFilter;
                document.querySelectorAll('[data-disc-filter]').forEach(function(p){ p.classList.remove('active-filter'); });
                pill.classList.add('active-filter');
                renderPersonas();
            });
        });

        // Search
        var searchInput = document.getElementById('search-personas');
        if (searchInput) searchInput.addEventListener('input', function(){ state.search=searchInput.value.toLowerCase().trim(); renderPersonas(); });

        // Bouton nouveau persona
        document.getElementById('btn-new-persona').addEventListener('click', function(){ openPersonaCRUD(null); });

        // Sauvegarder persona
        document.getElementById('btn-save-persona').addEventListener('click', savePersonaCRUD);

        // Supprimer persona (ouvre confirm)
        document.getElementById('btn-delete-persona').addEventListener('click', function(){
            deletePersona(state.crudCode);
        });

        // Confirmer suppression
        document.getElementById('btn-confirm-delete').addEventListener('click', function(){
            if (state.pendingDeleteCode) {
                DiscPersonaStore.remove(state.pendingDeleteCode);
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmDelete')).hide();
                toast('success','Persona supprimé.');
                state.pendingDeleteCode = null;
                renderPersonas();
                renderDashboard();
            }
        });

        // Retour scénarios
        document.getElementById('btn-back-scenarios').addEventListener('click', function(){
            document.getElementById('scenario-list-view').classList.remove('d-none');
            document.getElementById('scene-viewer-view').classList.add('d-none');
        });

        // Recommencer tests
        document.getElementById('btn-disc-retake').addEventListener('click', renderDiscTest);
        document.getElementById('btn-vakog-retake').addEventListener('click', renderVakogTest);

        // Injecter résultats dans persona
        document.getElementById('btn-disc-inject').addEventListener('click', function(){
            var code = document.getElementById('disc-test-persona-select').value;
            if (code) injectDiscResult(code);
        });
        document.getElementById('btn-vakog-inject').addEventListener('click', function(){
            var code = document.getElementById('vakog-test-persona-select').value;
            if (code) injectVakogResult(code);
        });

        // Afficher/masquer btn inject selon select
        document.getElementById('disc-test-persona-select').addEventListener('change', function(){
            var injectBtn = document.getElementById('btn-disc-inject');
            if (injectBtn) injectBtn.classList.toggle('d-none', !this.value || !state.discTestDone);
        });
        document.getElementById('vakog-test-persona-select').addEventListener('change', function(){
            var injectBtn = document.getElementById('btn-vakog-inject');
            if (injectBtn) injectBtn.classList.toggle('d-none', !this.value || !state.vakogTestDone);
        });

        // Export : mode + générer + copier
        document.getElementById('btn-generate-export').addEventListener('click', generateExport);
        document.querySelectorAll('[data-export-mode]').forEach(function(btn){
            btn.addEventListener('click', function(){
                document.querySelectorAll('[data-export-mode]').forEach(function(b){b.classList.remove('active');});
                btn.classList.add('active');
                state.exportMode = btn.dataset.exportMode;
                var ta = document.getElementById('export-textarea');
                if (ta&&ta.value) generateExport();
            });
        });
        document.getElementById('btn-copy-export').addEventListener('click', function(){
            var ta = document.getElementById('export-textarea');
            if (ta&&ta.value) navigator.clipboard.writeText(ta.value).then(function(){ toast('success','Copié dans le presse-papier.'); });
        });

        // Render initial
        renderDashboard();
        navigate('dashboard');
    });
}());
