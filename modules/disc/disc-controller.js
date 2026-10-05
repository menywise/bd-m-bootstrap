/**
 * disc-controller.js — Orchestrateur UI multi-user (Supabase)
 * Dépend de : DiscSchema, DiscTests, DiscProfilService, DiscPersonaStore,
 *             DiscScenarios, DiscEngine, window.bdb, window.bdbUser
 * IIFE auto-exécutée au DOMContentLoaded
 *
 * Convention CDS : zéro onclick=, zéro console.log, zéro style= statique,
 *   escHtml() sur tout innerHTML, .select() sur tout write, 3 états DOM.
 */
(function () {
    'use strict';

    /* ────────── State ────────── */
    var state = {
        isAdmin: false,
        discFilter: 'ALL',
        search: '',
        activeScenario: null,
        activeScene: 0,
        exportPersonas: {},
        exportScenarioId: null,
        exportMode: 'prompt',
        crudCode: null,
        discTestAnswers: {},
        vakogTestAnswers: {},
        discTestDone: false,
        vakogTestDone: false,
        pendingDeleteCode: null,
        compatibilites: []
    };

    /* ────────── Helpers ────────── */
    // Alias pour compatibilité interne
    var esc = escHtml;

    function toast(type, msg) {
        var bEl = document.getElementById(type === 'success' ? 'toast-success-body' : 'toast-info-body');
        if (bEl) bEl.textContent = msg;
        var tEl = document.getElementById(type === 'success' ? 'toastSuccess' : 'toastInfo');
        if (tEl) bootstrap.Toast.getOrCreateInstance(tEl).show();
    }

    function posClass(p) {
        return { '+/+': 'disc-pos-pp', '+/-': 'disc-pos-pm', '-/+': 'disc-pos-mp', '-/-': 'disc-pos-mm' }[p] || 'disc-pos-pp';
    }

    /* ────────── 3 états globaux ────────── */
    function showGlobalState(which) {
        ['disc-loading-state', 'disc-error-state', 'disc-ready-state'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            if (id === 'disc-' + which + '-state') { el.classList.remove('d-none'); }
            else { el.classList.add('d-none'); }
        });
    }

    function showError(msg) {
        var el = document.getElementById('disc-error-msg');
        if (el) el.textContent = msg || 'Les données tardent à arriver — réessayez dans un instant.';
        showGlobalState('error');
    }

    /* ────────── Navigation ────────── */
    function navigate(view) {
        document.querySelectorAll('.disc-view').forEach(function (v) { v.classList.remove('active'); });
        var el = document.getElementById('view-' + view);
        if (el) el.classList.add('active');
        document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.dataset.nav === view); });

        var renders = {
            dashboard: renderDashboard,
            'mon-profil': renderMonProfil,
            'test-disc': renderDiscTest,
            'test-vakog': renderVakogTest,
            decouverte: renderDecouverte,
            distribution: renderDistribution,
            personas: renderPersonas,
            scenarios: renderScenarios,
            export: renderExport
        };
        if (renders[view]) renders[view]();
    }

    /* ════════════════════════════════════════════════════════
       DASHBOARD
    ════════════════════════════════════════════════════════ */
    function renderDashboard() {
        var profil = DiscProfilService.getMyProfile();
        var distrib = DiscEngine.getDistribution();

        // KPIs
        var kpiRow = document.getElementById('kpi-row');
        if (kpiRow) {
            var kpis = [];
            if (profil) {
                kpis.push({ v: profil.disc_dominant, l: 'Mon profil DISC', icon: 'diagram-3', cls: 'border-primary' });
                kpis.push({ v: profil.vakog_primary ? profil.vakog_primary.charAt(0).toUpperCase() : '—', l: 'Mon canal VAKOG', icon: 'eye', cls: 'border-success' });
            }
            if (distrib) {
                kpis.push({ v: distrib.total, l: 'Membres profilés', icon: 'people', cls: 'border-warning' });
                kpis.push({ v: distrib.dominant, l: 'Tendance équipe', icon: 'graph-up-arrow', cls: 'border-danger' });
            }
            kpiRow.innerHTML = kpis.map(function (k) {
                return '<div class="col-6 col-md-3"><div class="card shadow-sm text-center p-3 border-top border-4 ' + k.cls + ' disc-pole-card h-100">' +
                    '<i class="bi bi-' + k.icon + ' fs-3 mb-1 text-muted"></i>' +
                    '<strong class="d-block fs-3">' + esc(k.v) + '</strong>' +
                    '<small class="text-muted">' + esc(k.l) + '</small></div></div>';
            }).join('');
        }

        // Distribution anonyme
        var dd = document.getElementById('disc-distribution');
        if (dd && distrib && distrib.total > 0) {
            dd.innerHTML = ['D', 'I', 'S', 'C'].map(function (L) {
                var info = DiscSchema.DISC_TYPES[L];
                var cnt = distrib.disc[L] || 0;
                var pct = distrib.total ? Math.round(cnt / distrib.total * 100) : 0;
                return '<div class="col-6 col-md-3"><div class="card shadow-sm text-center p-3 disc-stripe-' + L + ' disc-pole-card">' +
                    '<span class="fs-2 fw-black disc-letter-' + L + '">' + L + '</span>' +
                    '<div class="small text-muted mb-1">' + esc(info.label) + '</div>' +
                    '<div class="progress mb-1 disc-progress-sm"><div class="progress-bar disc-bar-' + L + '" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                    '<small class="text-muted">' + cnt + ' (' + pct + '%)</small></div></div>';
            }).join('');
        } else if (dd) {
            dd.innerHTML = '<div class="col-12"><div class="alert alert-secondary small mb-0"><i class="bi bi-info-circle me-2"></i>Aucun profil enregistré. Passez les tests pour voir la distribution.</div></div>';
        }

        // CTA ou résumé
        var cta = document.getElementById('dashboard-cta');
        var summary = document.getElementById('dashboard-profil-summary');
        if (profil && cta && summary) {
            cta.classList.add('d-none');
            summary.classList.remove('d-none');
            var dt = DiscSchema.DISC_TYPES[profil.disc_dominant] || {};
            summary.innerHTML = '<div class="card-header bg-transparent"><strong><i class="bi bi-person-circle me-2 text-primary"></i>Mon profil</strong></div>' +
                '<div class="card-body d-flex align-items-center gap-4">' +
                '<div class="disc-avatar disc-avatar-' + esc(profil.disc_dominant) + ' fs-2">' + esc(profil.disc_dominant) + '</div>' +
                '<div><div class="fw-bold">' + esc(dt.label || '') + '</div>' +
                '<div class="small text-muted">' + esc(dt.desc || '') + '</div>' +
                (profil.vakog_primary ? '<span class="badge bg-success-subtle text-success mt-1">' + esc(profil.vakog_primary) + '</span>' : '') +
                '</div>' +
                '<a href="#" class="btn btn-outline-primary btn-sm ms-auto" data-nav="mon-profil"><i class="bi bi-arrow-right me-1"></i>Détail</a>' +
                '</div>';
            summary.querySelector('[data-nav]').addEventListener('click', function (e) { e.preventDefault(); navigate('mon-profil'); });
        } else if (cta) {
            cta.classList.remove('d-none');
            if (summary) summary.classList.add('d-none');
        }
    }

    /* ════════════════════════════════════════════════════════
       MON PROFIL
    ════════════════════════════════════════════════════════ */
    function renderMonProfil() {
        var profil = DiscProfilService.getMyProfile();
        var content = document.getElementById('mon-profil-content');
        var empty = document.getElementById('mon-profil-empty');
        if (!profil) {
            if (content) content.innerHTML = '';
            if (empty) empty.classList.remove('d-none');
            return;
        }
        if (empty) empty.classList.add('d-none');
        if (!content) return;

        var dt = DiscSchema.DISC_TYPES[profil.disc_dominant] || {};
        var totalDisc = (profil.disc_score_d || 0) + (profil.disc_score_i || 0) + (profil.disc_score_s || 0) + (profil.disc_score_c || 0);

        var html = '<div class="row g-4 mb-4">';
        // DISC card
        html += '<div class="col-md-6"><div class="card shadow-sm h-100 disc-stripe-' + esc(profil.disc_dominant) + '">' +
            '<div class="card-header bg-transparent"><strong><i class="bi bi-diagram-3 me-2"></i>Profil DISC</strong></div>' +
            '<div class="card-body">' +
            '<div class="d-flex align-items-center gap-3 mb-3">' +
            '<div class="disc-avatar disc-avatar-' + esc(profil.disc_dominant) + ' fs-1">' + esc(profil.disc_dominant) + '</div>' +
            '<div><div class="fs-5 fw-bold">' + esc(dt.label || '') + '</div><div class="small text-muted">' + esc(dt.desc || '') + '</div></div></div>';
        ['D', 'I', 'S', 'C'].forEach(function (L) {
            var score = profil['disc_score_' + L.toLowerCase()] || 0;
            var pct = totalDisc ? Math.round(score / totalDisc * 100) : 0;
            html += '<div class="d-flex align-items-center gap-2 mb-2">' +
                '<span class="fw-bold disc-letter-' + L + '" >' + L + '</span>' +
                '<div class="progress flex-grow-1 disc-progress-md"><div class="progress-bar disc-bar-' + L + '" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                '<small class="text-muted">' + score + ' (' + pct + '%)</small></div>';
        });
        html += '<div class="mt-3"><button class="btn btn-outline-primary btn-sm" data-nav="test-disc"><i class="bi bi-arrow-counterclockwise me-1"></i>Repasser le test</button></div>';
        html += '</div></div></div>';

        // VAKOG card
        html += '<div class="col-md-6"><div class="card shadow-sm h-100">' +
            '<div class="card-header bg-transparent"><strong><i class="bi bi-eye me-2"></i>Profil VAKOG</strong></div><div class="card-body">';
        if (profil.vakog_primary) {
            var vt = DiscSchema.VAKOG_TYPES;
            var totalV = (profil.vakog_score_v || 0) + (profil.vakog_score_a || 0) + (profil.vakog_score_k || 0) + (profil.vakog_score_o || 0) + (profil.vakog_score_g || 0);
            html += '<div class="mb-3"><span class="badge bg-success fs-5 px-3 py-2">' + esc(profil.vakog_primary) + '</span></div>';
            ['V', 'A', 'K', 'O', 'G'].forEach(function (L) {
                var key = 'vakog_score_' + L.toLowerCase();
                var score = profil[key] || 0;
                var pct = totalV ? Math.round(score / totalV * 100) : 0;
                var label = vt[L] ? vt[L].label : L;
                html += '<div class="d-flex align-items-center gap-2 mb-2">' +
                    '<span class="badge vakog-badge-' + L + '">' + L + '</span>' +
                    '<small class="text-muted flex-shrink-0" >' + esc(label) + '</small>' +
                    '<div class="progress flex-grow-1 disc-progress-md"><div class="progress-bar bg-success" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                    '<small class="text-muted">' + pct + '%</small></div>';
            });
        } else {
            html += '<div class="alert alert-info small mb-0"><i class="bi bi-info-circle me-2"></i>Test VAKOG non passé.</div>';
        }
        html += '<div class="mt-3"><button class="btn btn-outline-success btn-sm" data-nav="test-vakog"><i class="bi bi-arrow-counterclockwise me-1"></i>Passer le test</button></div>';
        html += '</div></div></div></div>';

        content.innerHTML = html;
        // Bind nav buttons in rendered HTML
        content.querySelectorAll('[data-nav]').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.preventDefault(); navigate(btn.dataset.nav); });
        });
        // Animate progress bars
        _animateProgressBars(content);
    }

    function _animateProgressBars(container) {
        setTimeout(function () {
            container.querySelectorAll('.progress-bar').forEach(function (bar) {
                var pct = bar.getAttribute('aria-valuenow');
                if (pct) bar.style.width = pct + '%';
            });
        }, 50);
    }

    /* ════════════════════════════════════════════════════════
       DÉCOUVERTE (4 profils + compatibilités + tendance)
    ════════════════════════════════════════════════════════ */
    function renderDecouverte() {
        // L2-DISC-09 : tendance équipe supprimée de cette vue (affichée dans Dashboard + Distribution admin)

        // 4 profils DISC
        var profils = document.getElementById('decouverte-profils');
        if (profils) {
            profils.innerHTML = ['D', 'I', 'S', 'C'].map(function (L) {
                var dt = DiscSchema.DISC_TYPES[L];
                return '<div class="col-md-6 col-xl-3"><div class="card shadow-sm h-100 disc-stripe-' + L + '">' +
                    '<div class="card-body text-center">' +
                    '<span class="fs-1 fw-black disc-letter-' + L + '">' + L + '</span>' +
                    '<div class="fw-bold mt-1">' + esc(dt.label) + '</div>' +
                    '<div class="small text-muted mt-2">' + esc(dt.desc) + '</div>' +
                    '</div></div></div>';
            }).join('');
        }

        // Compatibilités
        var compat = document.getElementById('decouverte-compat');
        if (compat && state.compatibilites.length) {
            var myProfil = DiscProfilService.getMyProfile();
            var myDisc = myProfil ? myProfil.disc_dominant : null;

            var html = '<div class="row g-3">';
            state.compatibilites.forEach(function (c) {
                var highlight = myDisc && (c.profil_a === myDisc || c.profil_b === myDisc);
                var typeBadge = { complementaire: 'bg-success-subtle text-success', tension: 'bg-danger-subtle text-danger', neutre: 'bg-secondary-subtle text-secondary', synergie: 'bg-primary-subtle text-primary' };
                html += '<div class="col-md-6 col-xl-4"><div class="card shadow-sm h-100' + (highlight ? ' border-primary border-2' : '') + '">' +
                    '<div class="card-body">' +
                    '<div class="d-flex align-items-center gap-2 mb-2">' +
                    '<span class="fw-black disc-letter-' + esc(c.profil_a) + ' fs-4">' + esc(c.profil_a) + '</span>' +
                    '<i class="bi bi-arrows-expand text-muted"></i>' +
                    '<span class="fw-black disc-letter-' + esc(c.profil_b) + ' fs-4">' + esc(c.profil_b) + '</span>' +
                    '<span class="badge ' + (typeBadge[c.relation_type] || 'bg-secondary') + ' ms-auto">' + esc(c.relation_type) + '</span>' +
                    '</div>' +
                    '<div class="small text-muted">' + esc(c.description) + '</div>' +
                    (c.conseils ? '<div class="small mt-2 fst-italic text-primary">' + esc(c.conseils) + '</div>' : '') +
                    '</div></div></div>';
            });
            html += '</div>';
            compat.innerHTML = html;
        } else if (compat) {
            compat.innerHTML = '<div class="alert alert-secondary small"><i class="bi bi-info-circle me-2"></i>Compatibilités en cours de chargement.</div>';
        }
    }

    /* ════════════════════════════════════════════════════════
       DISTRIBUTION (admin)
    ════════════════════════════════════════════════════════ */
    function renderDistribution() {
        var distrib = DiscEngine.getDistribution();
        var content = document.getElementById('distribution-content');
        var empty = document.getElementById('distribution-empty');
        if (!distrib || distrib.total === 0) {
            if (content) content.innerHTML = '';
            if (empty) empty.classList.remove('d-none');
            return;
        }
        if (empty) empty.classList.add('d-none');
        if (!content) return;

        var html = '<div class="row g-4 mb-4">';
        // DISC distribution
        html += '<div class="col-md-6"><div class="card shadow-sm h-100">' +
            '<div class="card-header bg-transparent"><strong><i class="bi bi-diagram-3 me-2"></i>Distribution DISC</strong> <span class="badge bg-secondary-subtle text-secondary">' + distrib.total + ' membres</span></div>' +
            '<div class="card-body">';
        ['D', 'I', 'S', 'C'].forEach(function (L) {
            var cnt = distrib.disc[L] || 0;
            var pct = distrib.total ? Math.round(cnt / distrib.total * 100) : 0;
            var dt = DiscSchema.DISC_TYPES[L];
            html += '<div class="d-flex align-items-center gap-2 mb-3">' +
                '<span class="fw-black disc-letter-' + L + ' fs-4">' + L + '</span>' +
                '<div class="flex-grow-1"><div class="small fw-semibold">' + esc(dt.label) + '</div>' +
                '<div class="progress disc-progress-lg"><div class="progress-bar disc-bar-' + L + '" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div></div>' +
                '<span class="fw-bold">' + cnt + ' <small class="text-muted">(' + pct + '%)</small></span></div>';
        });
        html += '</div></div></div>';

        // VAKOG distribution
        html += '<div class="col-md-6"><div class="card shadow-sm h-100">' +
            '<div class="card-header bg-transparent"><strong><i class="bi bi-eye me-2"></i>Distribution VAKOG</strong></div>' +
            '<div class="card-body">';
        var vakogTotal = Object.values(distrib.vakog).reduce(function (a, b) { return a + b; }, 0) || 1;
        Object.keys(distrib.vakog).forEach(function (k) {
            var cnt = distrib.vakog[k] || 0;
            var pct = Math.round(cnt / vakogTotal * 100);
            html += '<div class="d-flex align-items-center gap-2 mb-3">' +
                '<span class="badge bg-success-subtle text-success px-2">' + esc(k) + '</span>' +
                '<div class="progress flex-grow-1 disc-progress-lg"><div class="progress-bar bg-success" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div>' +
                '<span class="fw-bold">' + cnt + '</span></div>';
        });
        html += '</div></div></div></div>';

        content.innerHTML = html;
        _animateProgressBars(content);
    }

    /* ════════════════════════════════════════════════════════
       PERSONA CARD (réutilisé personas + dashboard)
    ════════════════════════════════════════════════════════ */
    function buildPersonaCard(p, actions) {
        var btns = actions ? '<div class="d-flex gap-1 mt-2"><button class="btn btn-outline-secondary btn-sm flex-grow-1" data-edit="' + esc(p._code) + '"><i class="bi bi-pencil me-1"></i>Modifier</button><button class="btn btn-sm btn-outline-primary flex-grow-1" data-view-persona="' + esc(p._code) + '"><i class="bi bi-eye me-1"></i>Détail</button></div>' : '';
        return '<div class="col-sm-6 col-xl-4"><div class="card shadow-sm h-100 disc-persona-card disc-stripe-' + esc(p.DISC) + '" data-view-persona="' + esc(p._code) + '">' +
            '<div class="card-body">' +
            '<div class="d-flex align-items-start gap-3 mb-2">' +
            '<div class="disc-avatar disc-avatar-' + esc(p.DISC) + '">' + esc(p.prenom.charAt(0)) + '</div>' +
            '<div class="flex-grow-1 disc-persona-info"><div class="fw-bold text-truncate">' + esc(p.prenom) + ' ' + esc(p.nom) + '</div><div class="small text-muted text-truncate">' + esc(p.rolePedago) + '</div></div>' +
            '<span class="fs-3 fw-black disc-letter-' + esc(p.DISC) + '">' + esc(p.DISC) + '</span>' +
            '</div>' +
            '<div class="d-flex flex-wrap gap-1 mt-2"><span class="badge bg-secondary-subtle text-secondary">E' + esc(p.ennea) + '</span><span class="' + posClass(p.AT.position) + ' small">' + esc(p.AT.position) + '</span><span class="badge bg-light text-muted border">' + esc(p.VAKOG.primary) + '</span></div>' +
            '<div class="small text-muted mt-2">' + esc(p.savoirEtre.slice(0, 2).join(' · ')) + '</div>' +
            btns + '</div></div></div>';
    }

    /* ════════════════════════════════════════════════════════
       PERSONAS (admin CRUD)
    ════════════════════════════════════════════════════════ */
    function renderPersonas() {
        refreshPersonaSelects();
        var grid = document.getElementById('persona-grid');
        if (!grid) return;
        var personas = DiscEngine.getAllPersonas().filter(function (p) {
            var md = state.discFilter === 'ALL' || p.DISC === state.discFilter;
            var ms = !state.search || p.prenom.toLowerCase().indexOf(state.search) >= 0 || p.nom.toLowerCase().indexOf(state.search) >= 0 || p.rolePedago.toLowerCase().indexOf(state.search) >= 0;
            return md && ms;
        });
        if (!personas.length) { grid.innerHTML = '<div class="col-12"><div class="alert alert-info"><i class="bi bi-search me-2"></i>Aucun persona ne correspond.</div></div>'; return; }
        grid.innerHTML = personas.map(function (p) { return buildPersonaCard(p, true); }).join('');
        bindPersonaViewCards(grid);
        grid.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.stopPropagation(); openPersonaCRUD(btn.dataset.edit); });
        });
        var sNavP = document.getElementById('snav-personas');
        if (sNavP) sNavP.textContent = personas.length;
    }

    function bindPersonaViewCards(container) {
        container.querySelectorAll('[data-view-persona]').forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.closest('[data-edit]')) return;
                openPersonaDetail(card.dataset.viewPersona);
            });
        });
    }

    function openPersonaDetail(code) {
        var p = DiscEngine.getPersona(code);
        if (!p) return;
        var dt = DiscSchema.DISC_TYPES[p.DISC];
        var h = document.getElementById('persona-detail-header');
        if (h) h.innerHTML = '<div class="disc-avatar disc-avatar-' + esc(p.DISC) + '">' + esc(p.prenom.charAt(0)) + '</div><div><div class="fw-bold">' + esc(p.prenom) + ' ' + esc(p.nom) + '</div><div class="small text-muted">' + esc(p.rolePedago) + '</div></div>';
        var b = document.getElementById('persona-detail-body');
        if (!b) return;
        b.innerHTML =
            (p.sandbox ? '<div class="alert alert-warning py-2 small"><i class="bi bi-cone-striped me-1"></i>Données sandbox — profil fictif</div>' : '') +
            '<h6 class="text-uppercase text-muted small mb-2 mt-3">Profil DISC</h6>' +
            '<div class="card disc-badge-' + esc(p.DISC) + ' mb-3 border-0"><div class="card-body py-2 px-3"><span class="fs-2 fw-black disc-letter-' + esc(p.DISC) + '">' + esc(p.DISC) + '</span><span class="ms-2 fw-semibold">' + esc(dt.label) + '</span><div class="small text-muted">' + esc(dt.desc) + '</div></div></div>' +
            '<h6 class="text-uppercase text-muted small mb-2">Ennéagramme</h6>' +
            '<div class="mb-3"><span class="badge bg-secondary-subtle text-secondary me-1">Type ' + esc(p.ennea) + '</span><small class="text-muted">' + esc(DiscSchema.ENNEA[p.ennea]) + '</small></div>' +
            '<h6 class="text-uppercase text-muted small mb-2">Analyse Transactionnelle</h6>' +
            '<div class="row g-2 mb-2"><div class="col-6"><div class="card shadow-sm"><div class="card-body py-2 px-3"><div class="small text-muted mb-1">Base</div>' + p.AT.base.map(function (e) { return '<span class="disc-chip-at-base">' + esc(e) + '</span>'; }).join('') + '</div></div></div><div class="col-6"><div class="card shadow-sm"><div class="card-body py-2 px-3"><div class="small text-muted mb-1">Stress</div>' + p.AT.stress.map(function (e) { return '<span class="disc-chip-at-stress">' + esc(e) + '</span>'; }).join('') + '</div></div></div></div>' +
            '<div class="mb-3">Position de vie : <span class="' + posClass(p.AT.position) + '">' + esc(p.AT.position) + '</span></div>' +
            '<h6 class="text-uppercase text-muted small mb-2">VAKOG</h6>' +
            '<div class="mb-3"><span class="disc-chip-vakog-primary">' + esc(p.VAKOG.primary) + ' ★</span><span class="badge bg-light text-muted border ms-1">' + esc(p.VAKOG.secondary) + '</span></div>' +
            '<h6 class="text-uppercase text-muted small mb-2">Méta-programmes</h6>' +
            '<div class="mb-3">' + p.meta.map(function (m) { return '<span class="disc-chip-meta">' + esc(m) + '</span>'; }).join('') + '</div>' +
            '<h6 class="text-uppercase text-muted small mb-2">Savoir-être</h6>' +
            '<div class="mb-3">' + p.savoirEtre.map(function (s) { return '<span class="disc-chip-se">' + esc(s) + '</span>'; }).join('') + '</div>' +
            '<div class="mt-3"><button class="btn btn-outline-primary btn-sm w-100" data-bs-dismiss="offcanvas" data-edit-from-detail="' + esc(p._code) + '"><i class="bi bi-pencil me-1"></i>Modifier ce persona</button></div>';
        var oc = new bootstrap.Offcanvas(document.getElementById('offcanvasPersona'));
        oc.show();
        setTimeout(function () {
            var editBtn = b.querySelector('[data-edit-from-detail]');
            if (editBtn) editBtn.addEventListener('click', function () { openPersonaCRUD(editBtn.dataset.editFromDetail); });
        }, 100);
    }

    /* ────────── Tag Input ────────── */
    function initTagInput(containerId, initialTags) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        (initialTags || []).forEach(function (t) { addTag(container, t); });
        var input = document.createElement('input');
        input.className = 'disc-tag-input-field';
        input.placeholder = 'Ajouter + Entrée';
        input.addEventListener('keydown', function (e) {
            if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
                e.preventDefault();
                addTag(container, input.value.trim());
                input.value = '';
            } else if (e.key === 'Backspace' && !input.value) {
                var tags = container.querySelectorAll('.disc-tag-item');
                if (tags.length) tags[tags.length - 1].remove();
            }
        });
        container.appendChild(input);
        container.addEventListener('click', function () { input.focus(); });
    }
    function addTag(container, text) {
        var input = container.querySelector('.disc-tag-input-field');
        var tag = document.createElement('span');
        tag.className = 'disc-tag-item';
        tag.innerHTML = esc(text) + ' <span class="disc-tag-remove">&times;</span>';
        tag.querySelector('.disc-tag-remove').addEventListener('click', function () { tag.remove(); });
        container.insertBefore(tag, input);
    }
    function getTagValues(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.querySelectorAll('.disc-tag-item')).map(function (t) { return t.textContent.replace('×', '').trim(); });
    }

    /* ────────── CRUD Persona ────────── */
    function openPersonaCRUD(editCode) {
        state.crudCode = editCode || null;
        var p = editCode ? DiscEngine.getPersona(editCode) : null;
        var label = document.getElementById('modalPersonaLabel');
        var btnDel = document.getElementById('btn-delete-persona');
        if (label) label.innerHTML = p ? '<i class="bi bi-pencil text-warning me-2"></i>Modifier : ' + esc(p.prenom) + ' ' + esc(p.nom) : '<i class="bi bi-person-plus text-primary me-2"></i>Nouveau persona';
        if (btnDel) btnDel.classList.toggle('d-none', !p);
        var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
        set('f-prenom', p ? p.prenom : ''); set('f-nom', p ? p.nom : ''); set('f-fn', p ? p.fn : 'infirmier');
        set('f-role', p ? p.rolePedago : ''); set('f-code', p ? p._code : ''); set('f-disc', p ? p.DISC : 'D');
        set('f-ennea', p ? p.ennea : '1'); set('f-position', p ? p.AT.position : '+/+');
        set('f-vakog-p', p ? p.VAKOG.primary : 'visuel'); set('f-vakog-s', p ? p.VAKOG.secondary : 'auditif');
        var codeField = document.getElementById('f-code');
        if (codeField) codeField.readOnly = !!p;
        initTagInput('tags-at-base', p ? p.AT.base : []);
        initTagInput('tags-at-stress', p ? p.AT.stress : []);
        initTagInput('tags-se', p ? p.savoirEtre : []);
        initTagInput('tags-meta', p ? p.meta : []);
        new bootstrap.Modal(document.getElementById('modalPersona')).show();
    }

    async function savePersonaCRUD() {
        var isEdit = !!state.crudCode;
        var code = isEdit ? state.crudCode : (document.getElementById('f-code').value || '').trim().toUpperCase().replace(/\s/g, '_');
        if (!code) { toast('info', 'Le code canonique est obligatoire.'); return; }
        var prenom = document.getElementById('f-prenom').value.trim();
        var nom = document.getElementById('f-nom').value.trim();
        if (!prenom || !nom) { toast('info', 'Prénom et nom sont obligatoires.'); return; }
        var persona = {
            _code: code, nom: nom, prenom: prenom,
            fn: document.getElementById('f-fn').value,
            rolePedago: document.getElementById('f-role').value,
            DISC: document.getElementById('f-disc').value,
            ennea: document.getElementById('f-ennea').value,
            savoirEtre: getTagValues('tags-se'),
            AT: { base: getTagValues('tags-at-base'), stress: getTagValues('tags-at-stress'), position: document.getElementById('f-position').value },
            VAKOG: { primary: document.getElementById('f-vakog-p').value, secondary: document.getElementById('f-vakog-s').value },
            meta: getTagValues('tags-meta'),
            actif: true, sandbox: false
        };
        try {
            await DiscPersonaStore.save(persona);
            bootstrap.Modal.getInstance(document.getElementById('modalPersona')).hide();
            toast('success', (isEdit ? 'Persona modifié : ' : 'Persona créé : ') + prenom + ' ' + nom);
            renderPersonas(); renderDashboard();
        } catch (err) {
            toast('info', 'Erreur : ' + err.message);
        }
    }

    function deletePersona(code) {
        state.pendingDeleteCode = code;
        bootstrap.Modal.getInstance(document.getElementById('modalPersona')).hide();
        setTimeout(function () { new bootstrap.Modal(document.getElementById('modalConfirmDelete')).show(); }, 300);
    }

    async function confirmDeletePersona() {
        if (!state.pendingDeleteCode) return;
        try {
            await DiscPersonaStore.remove(state.pendingDeleteCode);
            bootstrap.Modal.getInstance(document.getElementById('modalConfirmDelete')).hide();
            toast('success', 'Persona supprimé.');
            state.pendingDeleteCode = null;
            renderPersonas(); renderDashboard();
        } catch (err) {
            toast('info', 'Erreur suppression : ' + err.message);
        }
    }

    function refreshPersonaSelects() {
        var sNavS = document.getElementById('snav-scenarios');
        if (sNavS) sNavS.textContent = DiscEngine.listScenarios().length;
    }

    /* ════════════════════════════════════════════════════════
       TEST DISC
    ════════════════════════════════════════════════════════ */
    function renderDiscTest() {
        var container = document.getElementById('disc-test-container');
        var results = document.getElementById('disc-test-results');
        if (!container || !results) return;
        results.classList.add('d-none');
        state.discTestDone = false;
        state.discTestAnswers = {};
        var questions = DiscTests.DISC_QUESTIONS;
        var html = questions.map(function (q, qi) {
            return '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent d-flex align-items-center gap-3">' +
                '<span class="badge bg-primary-subtle text-primary border border-primary-subtle disc-q-badge">' + (qi + 1) + '</span>' +
                '<strong class="small">' + esc(q.q) + '</strong></div><div class="card-body"><div class="row g-2">' +
                q.opts.map(function (opt) { return '<div class="col-md-6"><div class="disc-test-option" data-q="' + qi + '" data-t="' + esc(opt.t) + '"><small>' + esc(opt.l) + '</small></div></div>'; }).join('') +
                '</div></div></div>';
        }).join('');
        html += '<div class="text-center mt-3"><button class="btn btn-primary btn-lg" id="btn-disc-submit" disabled><i class="bi bi-check-lg me-2"></i>Voir mes résultats</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.disc-test-option').forEach(function (opt) {
            opt.addEventListener('click', function () {
                var q = opt.dataset.q;
                var prev = container.querySelector('.disc-test-option.selected[data-q="' + q + '"]');
                if (prev) prev.classList.remove('selected');
                opt.classList.add('selected');
                state.discTestAnswers[q] = opt.dataset.t;
                var submitBtn = document.getElementById('btn-disc-submit');
                if (submitBtn) submitBtn.disabled = Object.keys(state.discTestAnswers).length < questions.length;
            });
        });
        var submitBtn = document.getElementById('btn-disc-submit');
        if (submitBtn) submitBtn.addEventListener('click', showDiscResults);
    }

    async function showDiscResults() {
        var scores = { D: 0, I: 0, S: 0, C: 0 };
        var answers = [];
        Object.keys(state.discTestAnswers).forEach(function (qi) {
            var t = state.discTestAnswers[qi];
            if (scores[t] !== undefined) scores[t]++;
            answers.push({ question_num: parseInt(qi) + 1, reponse: t });
        });
        var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0);
        var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
        var winner = sorted[0];

        var desc = { D: 'Style direct et orienté résultat. Vous prenez des décisions rapides et aimez contrôler les situations.', I: 'Style influent et enthousiaste. Vous excellez en communication et mobilisation d\'équipes.', S: 'Style stable et empathique. Pilier de cohésion, fiable et attentif aux autres.', C: 'Style consciencieux et analytique. Expert en résolution de problèmes, garant de la qualité.' };
        var body = document.getElementById('disc-results-body');
        if (!body) return;
        body.innerHTML =
            '<div class="alert alert-primary mb-4"><strong>Votre profil dominant : </strong><span class="badge bg-danger fs-5 px-3 py-2 ms-2">' + esc(winner) + '</span><span class="ms-2 fw-semibold">' + esc(DiscSchema.DISC_TYPES[winner].label) + '</span><p class="mb-0 mt-2 small">' + esc(desc[winner]) + '</p></div>' +
            '<div class="row g-3 mb-3">' +
            sorted.map(function (L) {
                var pct = total ? Math.round(scores[L] / total * 100) : 0;
                return '<div class="col-md-6"><div class="card shadow-sm disc-stripe-' + L + (L === winner ? ' border-2 border-primary' : '') + '"><div class="card-body py-2">' +
                    '<div class="d-flex align-items-center gap-2 mb-2"><span class="fs-3 fw-black disc-letter-' + L + '">' + L + '</span><div class="flex-grow-1"><div class="small fw-semibold">' + esc(DiscSchema.DISC_TYPES[L].label) + '</div><div class="small text-muted">' + scores[L] + ' / ' + total + '</div></div><span class="fw-bold disc-letter-' + L + '">' + pct + '%</span></div>' +
                    '<div class="progress disc-progress-md"><div class="progress-bar disc-bar-' + L + '" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div></div></div></div>';
            }).join('') + '</div>';

        state.discTestDone = true;
        document.getElementById('disc-test-results').classList.remove('d-none');
        document.getElementById('disc-test-results').scrollIntoView({ behavior: 'smooth' });
        _animateProgressBars(document.getElementById('disc-test-results'));

        // Sauvegarder en Supabase
        var saveBadge = document.getElementById('disc-save-badge');
        try {
            await DiscProfilService.saveDiscResult(scores, answers);
            if (saveBadge) saveBadge.classList.remove('d-none');
            toast('success', 'Profil DISC ' + winner + ' enregistré.');
            // Rafraîchir distribution
            await DiscEngine.loadDistribution();
        } catch (err) {
            if (saveBadge) saveBadge.classList.add('d-none');
            toast('info', 'Résultat affiché mais non sauvegardé : ' + err.message);
        }
    }

    /* ════════════════════════════════════════════════════════
       TEST VAKOG
    ════════════════════════════════════════════════════════ */
    function renderVakogTest() {
        var container = document.getElementById('vakog-test-container');
        var results = document.getElementById('vakog-test-results');
        if (!container || !results) return;
        results.classList.add('d-none');
        state.vakogTestDone = false;
        state.vakogTestAnswers = {};
        var questions = DiscTests.VAKOG_QUESTIONS;
        var html = questions.map(function (q, qi) {
            return '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent d-flex align-items-center gap-3">' +
                '<span class="badge bg-success-subtle text-success border border-success-subtle disc-q-badge">' + (qi + 1) + '</span>' +
                '<strong class="small">' + esc(q.q) + '</strong></div><div class="card-body"><div class="d-flex flex-column gap-2">' +
                q.opts.map(function (opt) { return '<div class="disc-test-option" data-q="' + qi + '" data-t="' + esc(opt.t) + '"><small>' + esc(opt.l) + '</small></div>'; }).join('') +
                '</div></div></div>';
        }).join('');
        html += '<div class="text-center mt-3"><button class="btn btn-success btn-lg" id="btn-vakog-submit" disabled><i class="bi bi-check-lg me-2"></i>Voir mes résultats</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.disc-test-option').forEach(function (opt) {
            opt.addEventListener('click', function () {
                var q = opt.dataset.q;
                var prev = container.querySelector('.disc-test-option.selected[data-q="' + q + '"]');
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

    async function showVakogResults() {
        var scores = { V: 0, A: 0, K: 0, O: 0, G: 0 };
        var answers = [];
        Object.keys(state.vakogTestAnswers).forEach(function (qi) {
            var t = state.vakogTestAnswers[qi];
            if (scores[t] !== undefined) scores[t]++;
            answers.push({ question_num: parseInt(qi) + 1, reponse: t });
        });
        var total = Object.values(scores).reduce(function (a, b) { return a + b; }, 0);
        var sorted = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
        var winner = sorted[0];
        var second = sorted[1];

        var desc = { V: 'Canal visuel dominant. Vous traitez l\'information par images et représentations spatiales.', A: 'Canal auditif dominant. Vous traitez l\'information par les sons et les échanges oraux.', K: 'Canal kinesthésique dominant. Vous apprenez en faisant, en ressentant.', O: 'Canal olfactif sensible. L\'atmosphère conditionne votre attention.', G: 'Canal gustatif actif. La satisfaction ressentie guide votre engagement.' };
        var body = document.getElementById('vakog-results-body');
        if (!body) return;
        body.innerHTML =
            '<div class="alert alert-success mb-4"><strong>Canal dominant : </strong><span class="badge bg-primary fs-5 px-3 py-2 ms-2">' + esc(winner) + '</span><span class="ms-2 fw-semibold">' + esc(DiscSchema.VAKOG_TYPES[winner].label) + '</span><p class="mb-0 mt-2 small">' + esc(desc[winner]) + '</p><p class="mb-0 mt-1 small text-muted">Canal secondaire : <strong>' + esc(second) + ' — ' + esc(DiscSchema.VAKOG_TYPES[second].label) + '</strong></p></div>' +
            '<div class="row g-3 mb-3">' +
            sorted.map(function (L) {
                var vt = DiscSchema.VAKOG_TYPES[L];
                var pct = total ? Math.round(scores[L] / total * 100) : 0;
                return '<div class="col-md-6 col-xl-4"><div class="card shadow-sm ' + (L === winner ? 'border-2 border-success' : '') + '"><div class="card-body py-2">' +
                    '<div class="d-flex align-items-center gap-2 mb-2"><span class="badge vakog-badge-' + L + ' fs-5 px-2 py-2">' + L + '</span><div class="flex-grow-1"><div class="small fw-semibold">' + esc(vt.label) + '</div><div class="small text-muted">' + scores[L] + ' / ' + total + '</div></div><span class="fw-bold">' + pct + '%</span></div>' +
                    '<div class="progress disc-progress-md"><div class="progress-bar bg-success" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"></div></div></div></div></div>';
            }).join('') + '</div>';

        state.vakogTestDone = true;
        document.getElementById('vakog-test-results').classList.remove('d-none');
        document.getElementById('vakog-test-results').scrollIntoView({ behavior: 'smooth' });
        _animateProgressBars(document.getElementById('vakog-test-results'));

        var saveBadge = document.getElementById('vakog-save-badge');
        try {
            await DiscProfilService.saveVakogResult(scores, answers);
            if (saveBadge) saveBadge.classList.remove('d-none');
            toast('success', 'Profil VAKOG ' + winner + ' enregistré.');
            await DiscEngine.loadDistribution();
        } catch (err) {
            if (saveBadge) saveBadge.classList.add('d-none');
            toast('info', 'Résultat affiché mais non sauvegardé : ' + err.message);
        }
    }

    /* ════════════════════════════════════════════════════════
       SCÉNARIOS (admin)
    ════════════════════════════════════════════════════════ */
    function renderScenarios() {
        var list = document.getElementById('scenario-list');
        if (!list) return;
        document.getElementById('scenario-list-view').classList.remove('d-none');
        document.getElementById('scene-viewer-view').classList.add('d-none');
        var scenarios = DiscEngine.listScenarios();
        if (!scenarios.length) { list.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle me-2"></i>Aucun scénario enregistré.</div>'; return; }
        list.innerHTML = scenarios.map(function (sc) {
            var chars = sc.personnages.map(function (c) { return DiscEngine.getPersona(c); }).filter(Boolean);
            return '<div class="card shadow-sm disc-scenario-card" data-sc-id="' + esc(sc.id) + '"><div class="card-body d-flex align-items-center gap-3">' +
                '<span class="badge bg-primary-subtle text-primary border border-primary-subtle fs-6">' + esc(sc.id) + '</span>' +
                '<div class="flex-grow-1"><div class="fw-bold">' + esc(sc.titre) + '</div><div class="small text-muted">' + sc.scenes.length + ' scènes · ' + chars.map(function (p) { return p.prenom; }).join(', ') + '</div></div>' +
                '<span class="badge bg-light text-muted border">v' + esc(sc.version) + '</span>' +
                '<i class="bi bi-arrow-right text-muted"></i></div></div>';
        }).join('');
        list.querySelectorAll('[data-sc-id]').forEach(function (card) {
            card.addEventListener('click', function () { openScenario(card.dataset.scId); });
        });
    }

    function openScenario(id) {
        var sc = DiscEngine.getScenario(id);
        if (!sc) return;
        state.activeScenario = sc; state.activeScene = 0;
        document.getElementById('scenario-list-view').classList.add('d-none');
        document.getElementById('scene-viewer-view').classList.remove('d-none');
        document.getElementById('scene-scenario-title').textContent = sc.titre;
        document.getElementById('scene-scenario-version').textContent = 'v' + sc.version;
        var tabs = document.getElementById('scene-tabs');
        tabs.innerHTML = sc.scenes.map(function (s, i) { return '<li class="nav-item"><button class="nav-link' + (i === 0 ? ' active' : '') + '" data-si="' + i + '"><i class="bi bi-camera-reels me-1"></i>Scène ' + (i + 1) + ' — ' + esc(s.titre) + '</button></li>'; }).join('');
        tabs.querySelectorAll('[data-si]').forEach(function (btn) {
            btn.addEventListener('click', function () { tabs.querySelectorAll('.nav-link').forEach(function (b) { b.classList.remove('active'); }); btn.classList.add('active'); renderScene(sc, parseInt(btn.dataset.si)); });
        });
        renderScene(sc, 0);
    }

    function renderScene(sc, idx) {
        var s = sc.scenes[idx];
        var body = document.getElementById('scene-body');
        if (!body || !s) return;
        var pm = {};
        DiscEngine.getAllPersonas().forEach(function (p) { pm[p._code] = p; });
        var atRows = Object.keys(s.grille.at).map(function (code) { var p = pm[code]; return '<tr><td><span class="fw-semibold disc-letter-' + (p ? p.DISC : 'C') + '">' + esc((p || { prenom: code }).prenom) + '</span></td><td class="small text-muted">' + esc(s.grille.at[code]) + '</td></tr>'; }).join('');
        body.innerHTML =
            '<div class="col-lg-8">' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-geo-alt me-2 text-primary"></i>Contexte</strong></div><div class="card-body text-muted small">' + esc(s.contexte) + '</div></div>' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-bullseye me-2 text-primary"></i>Objectif pédagogique</strong></div><div class="card-body text-muted small">' + esc(s.objectif) + '</div></div>' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-play-circle me-2 text-primary"></i>Déroulé</strong></div><div class="card-body text-muted small">' + esc(s.deroulé) + '</div></div>' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-shuffle me-2 text-warning"></i>Points de bascule</strong></div><div class="card-body">' + s.bascule.map(function (b) { return '<div class="disc-bascule-item"><i class="bi bi-chevron-right me-2 text-warning"></i>' + esc(b) + '</div>'; }).join('') + '</div></div>' +
            '<div class="card shadow-sm"><div class="card-header bg-transparent"><strong><i class="bi bi-chat-square-quote me-2 text-success"></i>Pistes de débriefing</strong></div><div class="card-body">' + s.debrief.map(function (d) { return '<div class="disc-debrief-item"><i class="bi bi-question-circle me-2 text-success"></i>' + esc(d) + '</div>'; }).join('') + '</div></div></div>' +
            '<div class="col-lg-4">' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-people me-2 text-primary"></i>Personnages</strong></div><div class="card-body">' + sc.personnages.map(function (code) { var p = pm[code]; if (!p) return ''; return '<span class="disc-perso-chip"><span class="disc-dot disc-dot-' + esc(p.DISC) + '"></span>' + esc(p.prenom) + ' <span class="small disc-letter-' + esc(p.DISC) + '">' + esc(p.DISC) + '</span></span>'; }).join('') + '</div></div>' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-table me-2 text-primary"></i>Grille AT</strong></div><div class="card-body p-0"><table class="table table-sm table-hover mb-0 small"><thead><tr><th>Persona</th><th>État du moi</th></tr></thead><tbody>' + atRows + '</tbody></table></div></div>' +
            '<div class="card shadow-sm mb-3"><div class="card-header bg-transparent"><strong><i class="bi bi-chat-x me-2 text-danger"></i>Langage à recadrer</strong></div><div class="card-body">' + s.grille.recadrage.map(function (r) { return '<div class="disc-recadrage-item">' + esc(r) + '</div>'; }).join('') + '</div></div>' +
            '<div class="card shadow-sm"><div class="card-header bg-transparent"><strong><i class="bi bi-eye me-2 text-secondary"></i>Faits observables</strong></div><div class="card-body"><ul class="list-unstyled small text-muted mb-0">' + s.grille.faits.map(function (f) { return '<li class="mb-1"><i class="bi bi-dot me-1"></i>' + esc(f) + '</li>'; }).join('') + '</ul></div></div></div>';
    }

    /* ════════════════════════════════════════════════════════
       EXPORT IA (admin)
    ════════════════════════════════════════════════════════ */
    function renderExport() {
        var personas = DiscEngine.getAllPersonas();
        var pl = document.getElementById('export-persona-list');
        if (pl) {
            pl.innerHTML = personas.map(function (p) {
                var chk = !!state.exportPersonas[p._code];
                return '<div class="d-flex align-items-center gap-2 p-2 border rounded mb-1' + (chk ? ' bg-primary-subtle border-primary' : '') + '" data-exp-persona="' + esc(p._code) + '"><input class="form-check-input" type="checkbox"' + (chk ? ' checked' : '') + ' tabindex="-1"><span class="disc-dot disc-dot-' + esc(p.DISC) + '"></span><span class="flex-grow-1 small">' + esc(p.prenom) + ' ' + esc(p.nom) + '</span><span class="badge disc-badge-' + esc(p.DISC) + '">' + esc(p.DISC) + '</span></div>';
            }).join('');
            pl.querySelectorAll('[data-exp-persona]').forEach(function (row) {
                row.addEventListener('click', function () { state.exportPersonas[row.dataset.expPersona] = !state.exportPersonas[row.dataset.expPersona]; renderExport(); });
            });
        }
        var sl = document.getElementById('export-scenario-list');
        if (sl) {
            sl.innerHTML = DiscEngine.listScenarios().map(function (sc) {
                var sel = state.exportScenarioId === sc.id;
                return '<div class="d-flex align-items-center gap-2 p-2 border rounded mb-1' + (sel ? ' border-primary bg-primary-subtle' : '') + '" data-exp-sc="' + esc(sc.id) + '"><span class="badge bg-primary-subtle text-primary border border-primary-subtle">' + esc(sc.id) + '</span><span class="flex-grow-1 small">' + esc(sc.titre) + '</span>' + (sel ? '<i class="bi bi-check-circle-fill text-primary"></i>' : '') + '</div>';
            }).join('');
            sl.querySelectorAll('[data-exp-sc]').forEach(function (row) {
                row.addEventListener('click', function () { state.exportScenarioId = row.dataset.expSc; renderExport(); });
            });
        }
    }

    function generateExport() {
        var codes = Object.keys(state.exportPersonas).filter(function (k) { return state.exportPersonas[k]; });
        var allCodes = codes.length ? codes : DiscEngine.getAllPersonas().map(function (p) { return p._code; });
        var ta = document.getElementById('export-textarea');
        var card = document.getElementById('export-result-card');
        if (!ta || !card) return;
        ta.value = state.exportMode === 'json' ? DiscEngine.exportJSON(allCodes, state.exportScenarioId) : DiscEngine.exportPrompt(allCodes, state.exportScenarioId);
        card.classList.remove('d-none');
        card.scrollIntoView({ behavior: 'smooth' });
    }

    /* ════════════════════════════════════════════════════════
       INIT — async avec bdbShellReady
    ════════════════════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', async function () {
        await window.bdbShellReady;

        // Admin detection
        state.isAdmin = !!(window.bdbUser && window.bdbUser.isAdmin);
        if (state.isAdmin) {
            document.querySelectorAll('.bdb-admin-only').forEach(function (el) { el.classList.remove('d-none'); });
        }

        // Preload données
        try {
            await Promise.all([
                DiscPersonaStore.loadAll(),
                DiscScenarios.loadAll(),
                DiscProfilService.loadMyProfile()
            ]);
            // Distribution peut échouer sans bloquer (0 profils)
            try { await DiscEngine.loadDistribution(); } catch (_e) { /* ignore */ }
            // Compatibilités
            try { state.compatibilites = await DiscProfilService.getCompatibilites(); } catch (_e) { /* ignore */ }
        } catch (err) {
            showError('Chargement des données : ' + err.message);
            // UX32 : reload justifie — recuperation d'erreur fatale d'initialisation du module DISC
            document.getElementById('btn-disc-reload').addEventListener('click', function () { location.reload(); });
            return;
        }

        // Afficher l'état ready
        showGlobalState('ready');

        // ── Event bindings ──

        // Navigation
        document.querySelectorAll('[data-nav]').forEach(function (a) {
            a.addEventListener('click', function (e) { e.preventDefault(); navigate(a.dataset.nav); });
        });

        // Filtres DISC personas
        document.querySelectorAll('[data-disc-filter]').forEach(function (pill) {
            pill.addEventListener('click', function () {
                state.discFilter = pill.dataset.discFilter;
                document.querySelectorAll('[data-disc-filter]').forEach(function (p) { p.classList.remove('active-filter'); });
                pill.classList.add('active-filter');
                renderPersonas();
            });
        });

        // Search personas
        var searchInput = document.getElementById('search-personas');
        if (searchInput) searchInput.addEventListener('input', function () { state.search = searchInput.value.toLowerCase().trim(); renderPersonas(); });

        // Boutons personas CRUD
        var btnNew = document.getElementById('btn-new-persona');
        if (btnNew) btnNew.addEventListener('click', function () { openPersonaCRUD(null); });
        var btnSave = document.getElementById('btn-save-persona');
        if (btnSave) btnSave.addEventListener('click', function () { savePersonaCRUD(); });
        var btnDel = document.getElementById('btn-delete-persona');
        if (btnDel) btnDel.addEventListener('click', function () { deletePersona(state.crudCode); });
        var btnConfirm = document.getElementById('btn-confirm-delete');
        if (btnConfirm) btnConfirm.addEventListener('click', function () { confirmDeletePersona(); });

        // Retour scénarios
        var btnBack = document.getElementById('btn-back-scenarios');
        if (btnBack) btnBack.addEventListener('click', function () {
            document.getElementById('scenario-list-view').classList.remove('d-none');
            document.getElementById('scene-viewer-view').classList.add('d-none');
        });

        // Tests retake
        var btnDiscRetake = document.getElementById('btn-disc-retake');
        if (btnDiscRetake) btnDiscRetake.addEventListener('click', renderDiscTest);
        var btnVakogRetake = document.getElementById('btn-vakog-retake');
        if (btnVakogRetake) btnVakogRetake.addEventListener('click', renderVakogTest);

        // Export
        var btnGenerate = document.getElementById('btn-generate-export');
        if (btnGenerate) btnGenerate.addEventListener('click', generateExport);
        document.querySelectorAll('[data-export-mode]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-export-mode]').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                state.exportMode = btn.dataset.exportMode;
                var ta = document.getElementById('export-textarea');
                if (ta && ta.value) generateExport();
            });
        });
        var btnCopy = document.getElementById('btn-copy-export');
        if (btnCopy) btnCopy.addEventListener('click', function () {
            var ta = document.getElementById('export-textarea');
            if (ta && ta.value) navigator.clipboard.writeText(ta.value).then(function () { toast('success', 'Copié.'); });
        });

        // Reload on error
        // UX32 : reload justifie — bouton de recuperation d'erreur expose a l'utilisateur
        var btnReload = document.getElementById('btn-disc-reload');
        if (btnReload) btnReload.addEventListener('click', function () { location.reload(); }); // UX32 : justified — error recovery reload

        // Render initial
        renderDashboard();
        navigate('dashboard');
    });
}());
