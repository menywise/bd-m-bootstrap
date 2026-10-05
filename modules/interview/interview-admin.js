/**
 * interview-admin.js — Administration PAXIS
 * CRUD campagnes, questions, dashboard, lecture réponses.
 * Chargé uniquement par admin.html — jamais par index.html.
 *
 * Dépendances globales :
 *   window.bdb    — Supabase client (supabase-client.js)
 *   window.bdbUser — utilisateur courant (bdb-shell.js)
 *   escHtml()     — défini inline dans admin.html avant ce script
 */

const ADMIN_DB = window.bdb;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function showAdminState(prefix, state) {
    const ids = ['loading', 'empty', 'error', 'list', 'table-wrap', 'content'];
    for (const suffix of ids) {
        const el = document.getElementById(`${prefix}-${suffix}`);
        if (el) el.classList.add('d-none');
    }
    const target = document.getElementById(`${prefix}-${state}`);
    if (target) target.classList.remove('d-none');
}

function showAdminError(prefix, msg) {
    showAdminState(prefix, 'error');
    const el = document.getElementById(`${prefix}-error-msg`);
    if (el) el.textContent = msg;
}

async function populateCampaignFilters() {
    const { data, error } = await ADMIN_DB.from('paxis_campaigns')
        .select('id, title, status')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erreur chargement campagnes filtres:', error);
        return [];
    }

    const selects = document.querySelectorAll(
        '#questions-campaign-filter, #dashboard-campaign-filter, #responses-campaign-filter'
    );

    for (const sel of selects) {
        sel.innerHTML = '';
        for (const c of data) {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.title} (${c.status})`;
            if (c.status === 'active') opt.selected = true;
            sel.appendChild(opt);
        }
    }

    return data;
}

function getSelectedCampaignId(selectId) {
    const sel = document.getElementById(selectId);
    return sel ? sel.value : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET CAMPAGNES
// ─────────────────────────────────────────────────────────────────────────────

async function loadCampaigns() {
    showAdminState('campaigns', 'loading');

    const { data: campaigns, error } = await ADMIN_DB.from('paxis_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        showAdminError('campaigns', 'Erreur chargement campagnes');
        console.error('loadCampaigns:', error);
        return;
    }

    if (!campaigns || campaigns.length === 0) {
        showAdminState('campaigns', 'empty');
        return;
    }

    // Stats par campagne
    const { data: sessionsRaw } = await ADMIN_DB.from('paxis_sessions')
        .select('id, campaign_id, completed_at');
    const { data: questionsRaw } = await ADMIN_DB.from('paxis_questions')
        .select('id, campaign_id');

    const sessionsByCampaign = {};
    const questionsByCampaign = {};
    for (const s of (sessionsRaw || [])) {
        if (!sessionsByCampaign[s.campaign_id]) sessionsByCampaign[s.campaign_id] = [];
        sessionsByCampaign[s.campaign_id].push(s);
    }
    for (const q of (questionsRaw || [])) {
        if (!questionsByCampaign[q.campaign_id]) questionsByCampaign[q.campaign_id] = 0;
        questionsByCampaign[q.campaign_id]++;
    }

    const container = document.getElementById('campaigns-list');
    container.innerHTML = '';

    for (const c of campaigns) {
        const sessions = sessionsByCampaign[c.id] || [];
        const nbQuestions = questionsByCampaign[c.id] || 0;
        const nbSessions = sessions.length;
        const nbCompleted = sessions.filter(s => s.completed_at).length;

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card paxis-admin-campaign-card status-${escHtml(c.status)}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="mb-0">${escHtml(c.title)}</h6>
                        <span class="badge paxis-admin-status-badge ${
                            c.status === 'active' ? 'bg-success' :
                            c.status === 'draft' ? 'bg-warning text-dark' : 'bg-secondary'
                        }">${escHtml(c.status)}</span>
                    </div>
                    <p class="text-muted small mb-2">${escHtml(c.description || 'Pas de description')}</p>
                    <div class="d-flex gap-3 text-muted small mb-3">
                        <span><i class="bi bi-chat-square-text me-1"></i>${nbQuestions} questions</span>
                        <span><i class="bi bi-people me-1"></i>${nbSessions} sessions</span>
                        <span><i class="bi bi-check-circle me-1"></i>${nbCompleted} complètes</span>
                    </div>
                    <div class="d-flex gap-1 flex-wrap" data-campaign-id="${escHtml(c.id)}">
                        ${c.status === 'draft' ? `
                            <button class="btn btn-sm btn-success" data-action="activate">
                                <i class="bi bi-play-fill me-1"></i>Activer
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" data-action="edit">
                                <i class="bi bi-pencil me-1"></i>Modifier
                            </button>
                        ` : ''}
                        ${c.status === 'active' ? `
                            <button class="btn btn-sm btn-outline-warning" data-action="close">
                                <i class="bi bi-stop-fill me-1"></i>Clore
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" data-action="edit">
                                <i class="bi bi-pencil me-1"></i>Modifier
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-primary" data-action="duplicate">
                            <i class="bi bi-copy me-1"></i>Dupliquer
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    }

    showAdminState('campaigns', 'list');
}

function openCampaignModal(id, title, description) {
    document.getElementById('campaign-edit-id').value = id || '';
    document.getElementById('campaign-input-title').value = title || '';
    document.getElementById('campaign-input-desc').value = description || '';
    document.getElementById('modal-campaign-title').textContent = id ? 'Modifier la campagne' : 'Nouvelle campagne';
    new bootstrap.Modal(document.getElementById('modal-campaign')).show();
}

async function saveCampaign() {
    const id = document.getElementById('campaign-edit-id').value;
    const title = document.getElementById('campaign-input-title').value.trim();
    const desc = document.getElementById('campaign-input-desc').value.trim();

    if (!title) {
        alert("Un titre est nécessaire pour continuer");
        return;
    }

    if (id) {
        const { error } = await ADMIN_DB.from('paxis_campaigns')
            .update({ title, description: desc })
            .eq('id', id)
            .select();
        if (error) {
            console.error('saveCampaign update:', error);
            alert("La mise à jour n'a pu aboutir — réessayez.");
            return;
        }
    } else {
        const { error } = await ADMIN_DB.from('paxis_campaigns')
            .insert({
                title,
                description: desc,
                status: 'draft',
                created_by: window.bdbUser.id
            })
            .select();
        if (error) {
            console.error('saveCampaign insert:', error);
            alert("La création n'a pu aboutir — réessayez.");
            return;
        }
    }

    bootstrap.Modal.getInstance(document.getElementById('modal-campaign'))?.hide();
    await loadCampaigns();
    await populateCampaignFilters();
}

async function activateCampaign(id) {
    if (!confirm('Activer cette campagne ? La campagne active actuelle sera clôturée.')) return;

    // Clore toutes les campagnes actives
    const { error: closeErr } = await ADMIN_DB.from('paxis_campaigns')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('status', 'active')
        .select();
    if (closeErr) console.error('activateCampaign close:', closeErr);

    // Activer la nouvelle
    const { error } = await ADMIN_DB.from('paxis_campaigns')
        .update({ status: 'active', closed_at: null })
        .eq('id', id)
        .select();
    if (error) {
        console.error('activateCampaign:', error);
        alert("L'activation n'a pu aboutir — réessayez.");
        return;
    }

    await loadCampaigns();
    await populateCampaignFilters();
}

async function closeCampaign(id) {
    if (!confirm('Clore cette campagne ? Plus aucune nouvelle session ne pourra être créée.')) return;

    const { error } = await ADMIN_DB.from('paxis_campaigns')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', id)
        .select();
    if (error) {
        console.error('closeCampaign:', error);
        alert("La clôture n'a pu aboutir — réessayez.");
        return;
    }

    await loadCampaigns();
    await populateCampaignFilters();
}

async function duplicateCampaign(id) {
    // Charger la campagne source
    const { data: source, error: srcErr } = await ADMIN_DB.from('paxis_campaigns')
        .select('title, description')
        .eq('id', id)
        .single();
    if (srcErr || !source) {
        console.error('duplicateCampaign source:', srcErr);
        alert("La campagne source n'a pu être lue — réessayez.");
        return;
    }

    // Créer la copie
    const { data: newCampaign, error: createErr } = await ADMIN_DB.from('paxis_campaigns')
        .insert({
            title: `${source.title} (copie)`,
            description: source.description,
            status: 'draft',
            created_by: window.bdbUser.id
        })
        .select()
        .single();
    if (createErr || !newCampaign) {
        console.error('duplicateCampaign create:', createErr);
        alert("La copie n'a pu être créée — réessayez.");
        return;
    }

    // Copier les questions
    const { data: questions, error: qErr } = await ADMIN_DB.from('paxis_questions')
        .select('code, type, text, roles, depth, position, is_active')
        .eq('campaign_id', id)
        .order('position');
    if (qErr) {
        console.error('duplicateCampaign questions:', qErr);
    } else if (questions && questions.length > 0) {
        const copies = questions.map(q => ({
            ...q,
            campaign_id: newCampaign.id
        }));
        const { error: insertErr } = await ADMIN_DB.from('paxis_questions')
            .insert(copies)
            .select();
        if (insertErr) console.error('duplicateCampaign insert questions:', insertErr);
    }

    await loadCampaigns();
    await populateCampaignFilters();
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

async function loadQuestions() {
    const campaignId = getSelectedCampaignId('questions-campaign-filter');
    if (!campaignId) return;

    showAdminState('questions', 'loading');

    const { data, error } = await ADMIN_DB.from('paxis_questions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('type')
        .order('position');

    if (error) {
        showAdminError('questions', 'Erreur chargement questions');
        console.error('loadQuestions:', error);
        return;
    }

    if (!data || data.length === 0) {
        showAdminState('questions', 'empty');
        return;
    }

    const tbody = document.getElementById('questions-tbody');
    tbody.innerHTML = '';

    for (const q of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${escHtml(q.code)}</code></td>
            <td><span class="badge paxis-badge-${escHtml(q.type)}">${escHtml(q.type)}</span></td>
            <td class="paxis-admin-question-text" title="${escHtml(q.text)}">${escHtml(q.text)}</td>
            <td>${(q.roles || []).map(r =>
                `<span class="badge paxis-admin-role-badge bg-light text-dark border">${escHtml(r)}</span>`
            ).join(' ')}</td>
            <td class="text-center">${q.depth}</td>
            <td class="text-center">
                <span class="badge ${q.is_active ? 'bg-success' : 'bg-secondary'} paxis-admin-toggle-active"
                      data-question-id="${escHtml(q.id)}" data-active="${q.is_active}"
                      role="button">${q.is_active ? 'Actif' : 'Inactif'}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-secondary paxis-admin-edit-question"
                        data-question-id="${escHtml(q.id)}">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    showAdminState('questions', 'table-wrap');
}

function openQuestionModal(question) {
    document.getElementById('question-edit-id').value = question ? question.id : '';
    document.getElementById('question-input-code').value = question ? question.code : '';
    document.getElementById('question-input-type').value = question ? question.type : 'exploration';
    document.getElementById('question-input-depth').value = question ? question.depth : '1';
    document.getElementById('question-input-text').value = question ? question.text : '';
    document.getElementById('modal-question-title').textContent = question ? 'Modifier la question' : 'Nouvelle question';

    // Rôles checkboxes
    const checks = document.querySelectorAll('#question-roles-checkboxes input[type="checkbox"]');
    for (const cb of checks) {
        cb.checked = question ? (question.roles || []).includes(cb.value) : false;
    }

    new bootstrap.Modal(document.getElementById('modal-question')).show();
}

async function saveQuestion() {
    const id = document.getElementById('question-edit-id').value;
    const code = document.getElementById('question-input-code').value.trim();
    const type = document.getElementById('question-input-type').value;
    const depth = parseInt(document.getElementById('question-input-depth').value, 10);
    const text = document.getElementById('question-input-text').value.trim();

    const roles = [];
    document.querySelectorAll('#question-roles-checkboxes input:checked').forEach(cb => {
        roles.push(cb.value);
    });

    if (!code || !text || roles.length === 0) {
        alert("Le code, le texte et au moins un rôle sont nécessaires pour continuer");
        return;
    }

    const campaignId = getSelectedCampaignId('questions-campaign-filter');

    if (id) {
        const { error } = await ADMIN_DB.from('paxis_questions')
            .update({ code, type, text, roles, depth })
            .eq('id', id)
            .select();
        if (error) {
            console.error('saveQuestion update:', error);
            alert("La mise à jour n'a pu aboutir — réessayez.");
            return;
        }
    } else {
        // Position auto : max + 1
        const { data: maxPos } = await ADMIN_DB.from('paxis_questions')
            .select('position')
            .eq('campaign_id', campaignId)
            .eq('type', type)
            .order('position', { ascending: false })
            .limit(1);

        const position = (maxPos && maxPos.length > 0) ? maxPos[0].position + 1 : 1;

        const { error } = await ADMIN_DB.from('paxis_questions')
            .insert({ code, type, text, roles, depth, position, campaign_id: campaignId })
            .select();
        if (error) {
            console.error('saveQuestion insert:', error);
            alert(error.message.includes('unique') ? 'Ce code existe déjà.' : 'Erreur création.');
            return;
        }
    }

    bootstrap.Modal.getInstance(document.getElementById('modal-question'))?.hide();
    await loadQuestions();
}

async function toggleQuestionActive(id, currentActive) {
    const { error } = await ADMIN_DB.from('paxis_questions')
        .update({ is_active: !currentActive })
        .eq('id', id)
        .select();
    if (error) {
        console.error('toggleQuestionActive:', error);
        return;
    }
    await loadQuestions();
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

async function loadDashboard() {
    const campaignId = getSelectedCampaignId('dashboard-campaign-filter');
    if (!campaignId) return;

    showAdminState('dashboard', 'loading');

    // Sessions + profils
    const { data: sessions, error: sErr } = await ADMIN_DB.from('paxis_sessions')
        .select('id, created_by, role, started_at, completed_at')
        .eq('campaign_id', campaignId);

    if (sErr) {
        showAdminError('dashboard', 'Erreur chargement sessions');
        console.error('loadDashboard sessions:', sErr);
        return;
    }

    // Réponses
    const { data: responses, error: rErr } = await ADMIN_DB.from('paxis_responses')
        .select('session_id, status');

    if (rErr) console.error('loadDashboard responses:', rErr);

    // Profils
    const { data: profiles } = await ADMIN_DB.from('profiles')
        .select('user_id, prenom, nom');

    const profileMap = {};
    for (const p of (profiles || [])) {
        profileMap[p.user_id] = p;
    }

    // Réponses par session
    const responsesBySession = {};
    for (const r of (responses || [])) {
        if (!responsesBySession[r.session_id]) responsesBySession[r.session_id] = { total: 0, answered: 0 };
        responsesBySession[r.session_id].total++;
        if (r.status === 'answered') responsesBySession[r.session_id].answered++;
    }

    // KPI
    const nbSessions = (sessions || []).length;
    const nbCompleted = (sessions || []).filter(s => s.completed_at).length;
    const totalResponses = (responses || []).length;
    const totalAnswered = (responses || []).filter(r => r.status === 'answered').length;

    const kpiContainer = document.getElementById('dashboard-kpi');
    kpiContainer.innerHTML = `
        <div class="paxis-stat-card">
            <div class="paxis-admin-kpi-highlight">${nbSessions}</div>
            <div class="paxis-stat-label">Sessions</div>
        </div>
        <div class="paxis-stat-card">
            <div class="paxis-admin-kpi-highlight">${nbCompleted}</div>
            <div class="paxis-stat-label">Complètes</div>
        </div>
        <div class="paxis-stat-card">
            <div class="paxis-admin-kpi-highlight">${totalAnswered}</div>
            <div class="paxis-stat-label">Réponses</div>
        </div>
        <div class="paxis-stat-card">
            <div class="paxis-admin-kpi-highlight">${nbSessions > 0 ? Math.round((nbCompleted / nbSessions) * 100) : 0}%</div>
            <div class="paxis-stat-label">Complétion</div>
        </div>
    `;

    // Tableau membres
    const tbody = document.getElementById('dashboard-members-tbody');
    tbody.innerHTML = '';

    // Membres avec session
    for (const s of (sessions || [])) {
        const p = profileMap[s.created_by] || {};
        const rStats = responsesBySession[s.id] || { total: 0, answered: 0 };
        const isComplete = !!s.completed_at;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escHtml(p.prenom || '')} ${escHtml(p.nom || '')}</td>
            <td><span class="badge bg-light text-dark border">${escHtml(s.role)}</span></td>
            <td class="text-muted small">${new Date(s.started_at).toLocaleDateString('fr-FR')}</td>
            <td><span class="badge ${isComplete ? 'bg-success' : 'bg-info'}">${isComplete ? 'Complète' : 'En cours'}</span></td>
            <td>${rStats.answered} / ${rStats.total}</td>
        `;
        tbody.appendChild(tr);
    }

    // Membres sans session (profiles qui n'ont pas de session dans cette campagne)
    const usersWithSession = new Set((sessions || []).map(s => s.created_by));
    for (const p of (profiles || [])) {
        if (!usersWithSession.has(p.user_id)) {
            const tr = document.createElement('tr');
            tr.className = 'paxis-admin-no-session';
            tr.innerHTML = `
                <td>${escHtml(p.prenom || '')} ${escHtml(p.nom || '')}</td>
                <td>—</td>
                <td>—</td>
                <td><span class="badge bg-light text-dark border">Pas commencé</span></td>
                <td>—</td>
            `;
            tbody.appendChild(tr);
        }
    }

    showAdminState('dashboard', 'content');
}

// ─────────────────────────────────────────────────────────────────────────────
// ONGLET RÉPONSES
// ─────────────────────────────────────────────────────────────────────────────

async function loadResponses() {
    const campaignId = getSelectedCampaignId('responses-campaign-filter');
    if (!campaignId) return;

    const roleFilter = document.getElementById('responses-role-filter').value;
    const typeFilter = document.getElementById('responses-type-filter').value;

    showAdminState('responses', 'loading');

    // Questions de la campagne
    let qQuery = ADMIN_DB.from('paxis_questions')
        .select('id, code, type, text')
        .eq('campaign_id', campaignId)
        .order('type')
        .order('position');
    if (typeFilter) qQuery = qQuery.eq('type', typeFilter);

    const { data: questions, error: qErr } = await qQuery;
    if (qErr) {
        showAdminError('responses', 'Erreur chargement questions');
        console.error('loadResponses questions:', qErr);
        return;
    }

    // Sessions filtrées par rôle
    let sQuery = ADMIN_DB.from('paxis_sessions')
        .select('id, created_by, role')
        .eq('campaign_id', campaignId);
    if (roleFilter) sQuery = sQuery.eq('role', roleFilter);

    const { data: sessions, error: sErr } = await sQuery;
    if (sErr) {
        showAdminError('responses', 'Erreur chargement sessions');
        console.error('loadResponses sessions:', sErr);
        return;
    }

    const sessionIds = (sessions || []).map(s => s.id);

    // Réponses
    let responses = [];
    if (sessionIds.length > 0) {
        const { data, error: rErr } = await ADMIN_DB.from('paxis_responses')
            .select('*')
            .in('session_id', sessionIds);
        if (rErr) console.error('loadResponses responses:', rErr);
        responses = data || [];
    }

    // Profils
    const { data: profiles } = await ADMIN_DB.from('profiles')
        .select('user_id, prenom, nom');
    const profileMap = {};
    for (const p of (profiles || [])) profileMap[p.user_id] = p;

    const sessionMap = {};
    for (const s of (sessions || [])) sessionMap[s.id] = s;

    if (!questions || questions.length === 0) {
        showAdminState('responses', 'empty');
        return;
    }

    // Rendu : accordéon par question
    const container = document.getElementById('responses-list');
    container.innerHTML = '';

    const accordion = document.createElement('div');
    accordion.className = 'accordion paxis-admin-accordion';
    accordion.id = 'responses-accordion';

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const qResponses = responses.filter(r => r.question_id === q.id);
        const answeredCount = qResponses.filter(r => r.status === 'answered').length;

        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button"
                        data-bs-toggle="collapse" data-bs-target="#resp-acc-${i}">
                    <span class="badge paxis-badge-${escHtml(q.type)} me-2">${escHtml(q.type)}</span>
                    <span class="me-2">${escHtml(q.code)}</span>
                    <span class="flex-grow-1 text-truncate">${escHtml(q.text)}</span>
                    <span class="badge bg-light text-dark border ms-2">${answeredCount} réponse${answeredCount > 1 ? 's' : ''}</span>
                </button>
            </h2>
            <div id="resp-acc-${i}" class="accordion-collapse collapse" data-bs-parent="#responses-accordion">
                <div class="accordion-body">
                    ${qResponses.length === 0 ? '<p class="text-muted small">Aucune réponse</p>' :
                        qResponses.map(r => {
                            const session = sessionMap[r.session_id] || {};
                            const profile = profileMap[session.created_by] || {};
                            return `
                                <div class="paxis-admin-response-card status-${escHtml(r.status)}">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <strong class="small">${escHtml(profile.prenom || '')} ${escHtml(profile.nom || '')}</strong>
                                        <span class="badge ${
                                            r.status === 'answered' ? 'bg-success' :
                                            r.status === 'unclear' ? 'bg-warning text-dark' : 'bg-secondary'
                                        } paxis-admin-status-badge">${escHtml(r.status)}</span>
                                    </div>
                                    ${r.response_text ? `<p class="small mb-0">${escHtml(r.response_text)}</p>` :
                                        '<p class="small text-muted mb-0 fst-italic">Pas de réponse</p>'}
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>
        `;
        accordion.appendChild(item);
    }

    container.appendChild(accordion);
    showAdminState('responses', 'list');
}

async function exportAdminCSV() {
    const campaignId = getSelectedCampaignId('responses-campaign-filter');
    if (!campaignId) return;

    const { data: sessions } = await ADMIN_DB.from('paxis_sessions')
        .select('id, created_by, role, started_at')
        .eq('campaign_id', campaignId);

    const { data: responses } = await ADMIN_DB.from('paxis_responses')
        .select('*')
        .in('session_id', (sessions || []).map(s => s.id));

    const { data: profiles } = await ADMIN_DB.from('profiles')
        .select('user_id, prenom, nom');

    const profileMap = {};
    for (const p of (profiles || [])) profileMap[p.user_id] = p;
    const sessionMap = {};
    for (const s of (sessions || [])) sessionMap[s.id] = s;

    // CSV
    const rows = [['Membre', 'Rôle', 'Date', 'Question', 'Type', 'Réponse', 'Statut']];
    for (const r of (responses || [])) {
        const session = sessionMap[r.session_id] || {};
        const profile = profileMap[session.created_by] || {};
        rows.push([
            `${profile.prenom || ''} ${profile.nom || ''}`,
            session.role || '',
            session.started_at ? new Date(session.started_at).toLocaleDateString('fr-FR') : '',
            r.question_text || '',
            r.question_type || '',
            (r.response_text || '').replace(/"/g, '""'),
            r.status || ''
        ]);
    }

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(';')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paxis_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT + EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────────────────

async function initPaxisAdmin() {
    // ── Campagnes ────────────────────────────────────────────────────────
    document.getElementById('btn-campaign-create')?.addEventListener('click', () => {
        openCampaignModal();
    });

    document.getElementById('btn-campaign-save')?.addEventListener('click', saveCampaign);
    document.getElementById('btn-campaigns-retry')?.addEventListener('click', loadCampaigns);

    // Délégation actions campagnes
    document.getElementById('campaigns-list')?.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const card = btn.closest('[data-campaign-id]');
        if (!card) return;
        const id = card.dataset.campaignId;

        if (action === 'activate') await activateCampaign(id);
        else if (action === 'close') await closeCampaign(id);
        else if (action === 'duplicate') await duplicateCampaign(id);
        else if (action === 'edit') {
            const { data } = await ADMIN_DB.from('paxis_campaigns')
                .select('id, title, description')
                .eq('id', id)
                .single();
            if (data) openCampaignModal(data.id, data.title, data.description);
        }
    });

    // ── Questions ────────────────────────────────────────────────────────
    document.getElementById('questions-campaign-filter')?.addEventListener('change', loadQuestions);
    document.getElementById('btn-question-create')?.addEventListener('click', () => openQuestionModal());
    document.getElementById('btn-question-save')?.addEventListener('click', saveQuestion);
    document.getElementById('btn-questions-retry')?.addEventListener('click', loadQuestions);

    // Délégation toggle actif + edit
    document.getElementById('questions-tbody')?.addEventListener('click', async (e) => {
        const toggle = e.target.closest('.interview-admin-toggle-active');
        if (toggle) {
            const qId = toggle.dataset.questionId;
            const current = toggle.dataset.active === 'true';
            await toggleQuestionActive(qId, current);
            return;
        }
        const editBtn = e.target.closest('.interview-admin-edit-question');
        if (editBtn) {
            const qId = editBtn.dataset.questionId;
            const { data } = await ADMIN_DB.from('paxis_questions')
                .select('*')
                .eq('id', qId)
                .single();
            if (data) openQuestionModal(data);
        }
    });

    // ── Dashboard ────────────────────────────────────────────────────────
    document.getElementById('dashboard-campaign-filter')?.addEventListener('change', loadDashboard);

    // Charger dashboard au clic sur l'onglet
    document.getElementById('tab-dashboard')?.addEventListener('shown.bs.tab', loadDashboard);

    // ── Réponses ─────────────────────────────────────────────────────────
    document.getElementById('responses-campaign-filter')?.addEventListener('change', loadResponses);
    document.getElementById('responses-role-filter')?.addEventListener('change', loadResponses);
    document.getElementById('responses-type-filter')?.addEventListener('change', loadResponses);
    document.getElementById('btn-export-admin-csv')?.addEventListener('click', exportAdminCSV);

    // Charger réponses au clic sur l'onglet
    document.getElementById('tab-responses')?.addEventListener('shown.bs.tab', loadResponses);

    // Charger questions au clic sur l'onglet
    document.getElementById('tab-questions')?.addEventListener('shown.bs.tab', async () => {
        await populateCampaignFilters();
        await loadQuestions();
    });
}
