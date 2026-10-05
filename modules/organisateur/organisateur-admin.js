/**
 * organisateur-admin.js — Administration Organisateur
 * BDB Admin Backend V1.0.0
 *
 * Schema verifie terrain 2026-04-12 :
 *   organisateur_parcours . organisateur_etapes
 *   organisateur_masques_user . organisateur_sessions_brainstorm
 *   organisateur_commentaires
 *
 * Charge uniquement par admin.html — jamais par index.html.
 * index.html = memoire pure (zero window.bdb cote membre).
 *
 * Dependances globales :
 *   window.bdb      — Supabase client (supabase-client.js)
 *   window.bdbUser  — utilisateur courant (bdb-shell.js)
 *   window.escHtml  — protection XSS (bdb-ui.js)
 *
 * CONTRAINTES :
 *   organisateur_etapes.parcours_id NOT NULL — toujours renseigner _selectedParcoursId
 *   is_delta = false pour les etapes admin (partagees)
 *   is_delta = true = etapes membres — admin voit, ne modifie PAS
 *   Cascade manuelle avant deleteParcours : masques_user → etapes → parcours
 *   statut 'fermee' pour les sessions brainstorm (PAS 'closed'/'archived')
 */

// ─── GUARD ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await window.bdbShellReady;
    if (!window.bdbUser?.isAdmin) {
        location.href = '../../index.html';
        return;
    }
    await initOrgAdmin();
});

// ─── STATE ────────────────────────────────────────────────────────────────────
let _selectedParcoursId = null;

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────
function showAdminState(prefix, state) {
    for (const s of ['loading', 'empty', 'error', 'table', 'list', 'content']) {
        const el = document.getElementById(`${prefix}-${s}`);
        if (el) el.classList.toggle('d-none', s !== state);
    }
}

function showAdminError(prefix, msg) {
    showAdminState(prefix, 'error');
    const el = document.getElementById(`${prefix}-error-msg`);
    if (el) el.textContent = msg;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function initOrgAdmin() {
    await loadParcours();

    // Parcours
    document.getElementById('btn-org-new-parcours')
        ?.addEventListener('click', () => openParcoursModal());
    document.getElementById('btn-org-save-parcours')
        ?.addEventListener('click', saveParcours);
    document.getElementById('btn-org-parcours-retry')
        ?.addEventListener('click', loadParcours);

    // Delegation actions sur la liste des parcours
    document.getElementById('org-parcours-tbody')
        ?.addEventListener('click', handleParcoursAction);

    // Delegation actions sur la liste des etapes
    document.getElementById('org-etapes-tbody')
        ?.addEventListener('click', handleEtapeAction);

    // Boutons du sous-panel etapes
    document.getElementById('btn-org-new-etape')
        ?.addEventListener('click', () => openEtapeModal());
    document.getElementById('btn-org-save-etape')
        ?.addEventListener('click', saveEtape);

    // Sessions brainstorm — chargement paresseux a l'activation de l'onglet
    document.getElementById('tab-org-sessions')
        ?.addEventListener('shown.bs.tab', loadSessions);

    // Delegation fermeture session (dans org-sessions-table)
    document.getElementById('org-sessions-table')
        ?.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action="close-session"]');
            if (!btn) return;
            const card = btn.closest('[data-session-id]');
            if (!card) return;
            if (!confirm('Fermer cette session brainstorm ?')) return;
            const { error } = await window.bdb
                .from('organisateur_sessions_brainstorm')
                .update({ statut: 'fermee' })
                .eq('id', card.dataset.sessionId)
                .select();
            if (error) console.error('org-admin close-session:', error);
            else await loadSessions();
        });

    // Stats — chargement paresseux
    document.getElementById('tab-org-stats')
        ?.addEventListener('shown.bs.tab', loadOrgStats);
}

// ─── ONGLET 1 — PARCOURS ──────────────────────────────────────────────────────
async function loadParcours() {
    showAdminState('org-parcours', 'loading');
    try {
        const { data, error } = await window.bdb
            .from('organisateur_parcours')
            .select('id, titre, type, statut, created_by, validated_by, parent_id, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) { showAdminState('org-parcours', 'empty'); return; }

        renderParcours(data);
        showAdminState('org-parcours', 'table');
    } catch (err) {
        console.error('org-admin loadParcours:', err);
        showAdminError('org-parcours', 'Le chargement n\'a pu aboutir — reessayez dans un instant.');
    }
}

function renderParcours(items) {
    const tbody = document.getElementById('org-parcours-tbody');
    if (!tbody) return;

    tbody.innerHTML = items.map(p => `
        <tr data-parcours-id="${escHtml(p.id)}">
            <td class="fw-medium">${escHtml(p.titre)}</td>
            <td>
                <span class="badge bg-secondary">${escHtml(p.type || 'base')}</span>
                ${p.parent_id ? '<span class="badge bg-info text-dark ms-1">variante</span>' : ''}
            </td>
            <td>
                <span class="badge ${p.statut === 'published' ? 'bg-success' : 'bg-warning text-dark'}">
                    ${escHtml(p.statut || 'draft')}
                </span>
            </td>
            <td>
                <button class="btn btn-xs btn-outline-secondary me-1" data-action="etapes"
                        title="Gerer les etapes">
                    <i class="bi bi-list-ul"></i>
                </button>
                <button class="btn btn-xs btn-outline-primary me-1" data-action="edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-xs btn-outline-danger" data-action="delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleParcoursAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const row = btn.closest('[data-parcours-id]');
    if (!row) return;
    const id = row.dataset.parcoursId;
    const action = btn.dataset.action;

    if (action === 'edit') {
        const { data } = await window.bdb
            .from('organisateur_parcours').select('*').eq('id', id).single();
        if (data) openParcoursModal(data);
    } else if (action === 'delete') {
        await deleteParcours(id);
    } else if (action === 'etapes') {
        await loadEtapesParcours(id, row.querySelector('td').textContent.trim());
    }
}

function openParcoursModal(p = null) {
    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modal-org-parcours')
    );
    const idFld = document.getElementById('org-parcours-id');
    const title = document.getElementById('modal-org-parcours-title');

    if (p) {
        title.textContent = 'Modifier le parcours';
        idFld.value = p.id;
        document.getElementById('org-parcours-titre').value       = p.titre || '';
        document.getElementById('org-parcours-description').value = p.description || '';
        document.getElementById('org-parcours-type').value        = p.type || 'base';
        document.getElementById('org-parcours-statut').value      = p.statut || 'draft';
    } else {
        title.textContent = 'Nouveau parcours';
        idFld.value = '';
        document.getElementById('org-parcours-titre').value       = '';
        document.getElementById('org-parcours-description').value = '';
        document.getElementById('org-parcours-type').value        = 'base';
        document.getElementById('org-parcours-statut').value      = 'draft';
    }
    modal.show();
}

async function saveParcours() {
    const id    = document.getElementById('org-parcours-id').value;
    const titre = document.getElementById('org-parcours-titre')?.value?.trim();

    if (!titre) {
        document.getElementById('org-parcours-titre')?.classList.add('is-invalid');
        return;
    }
    document.getElementById('org-parcours-titre')?.classList.remove('is-invalid');

    const payload = {
        titre,
        description : document.getElementById('org-parcours-description')?.value?.trim() || null,
        type        : document.getElementById('org-parcours-type')?.value || 'base',
        statut      : document.getElementById('org-parcours-statut')?.value || 'draft',
        updated_at  : new Date().toISOString()
    };

    if (payload.statut === 'published') {
        payload.validated_by = window.bdbUser.id;
    }

    try {
        const result = id
            ? await window.bdb.from('organisateur_parcours').update(payload).eq('id', id).select()
            : await window.bdb.from('organisateur_parcours')
                .insert({ ...payload, created_by: window.bdbUser.id }).select();
        if (result.error) throw result.error;
        bootstrap.Modal.getInstance(document.getElementById('modal-org-parcours'))?.hide();
        await loadParcours();
    } catch (err) {
        console.error('org-admin saveParcours:', err);
    }
}

async function deleteParcours(id) {
    if (!confirm('Supprimer ce parcours et toutes ses etapes ? Action irreversible.')) return;
    try {
        // Cascade manuelle : masques_user → etapes → parcours
        const { data: etapes } = await window.bdb
            .from('organisateur_etapes').select('id').eq('parcours_id', id);
        if (etapes?.length) {
            const etapeIds = etapes.map(e => e.id);
            await window.bdb.from('organisateur_masques_user')
                .delete().in('etape_id', etapeIds).select();
        }
        await window.bdb.from('organisateur_etapes')
            .delete().eq('parcours_id', id).select();
        const { error } = await window.bdb.from('organisateur_parcours')
            .delete().eq('id', id).select();
        if (error) throw error;
        await loadParcours();
    } catch (err) {
        console.error('org-admin deleteParcours:', err);
    }
}

// ─── SOUS-PANEL ETAPES (dans Onglet 1) ───────────────────────────────────────
async function loadEtapesParcours(parcoursId, parcoursLabel) {
    _selectedParcoursId = parcoursId;

    const panel = document.getElementById('org-etapes-panel');
    if (panel) {
        panel.classList.remove('d-none');
        const label = document.getElementById('org-etapes-parcours-label');
        if (label) label.textContent = parcoursLabel;
    }

    showAdminState('org-etapes', 'loading');
    try {
        const { data, error } = await window.bdb
            .from('organisateur_etapes')
            .select('id, titre, timing_label, ordre, visible, is_delta, created_by')
            .eq('parcours_id', parcoursId)
            .order('ordre', { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) { showAdminState('org-etapes', 'empty'); return; }

        renderEtapes(data);
        showAdminState('org-etapes', 'table');
    } catch (err) {
        console.error('org-admin loadEtapesParcours:', err);
        showAdminError('org-etapes', 'Le chargement n\'a pu aboutir — reessayez dans un instant.');
    }
}

function renderEtapes(etapes) {
    const tbody = document.getElementById('org-etapes-tbody');
    if (!tbody) return;

    tbody.innerHTML = etapes.map(e => `
        <tr data-etape-id="${escHtml(e.id)}">
            <td class="text-center text-muted small">${escHtml(String(e.ordre))}</td>
            <td class="fw-medium">${escHtml(e.titre)}</td>
            <td class="text-muted small">${escHtml(e.timing_label || '—')}</td>
            <td class="text-center">
                ${e.visible
                    ? '<i class="bi bi-eye text-success"></i>'
                    : '<i class="bi bi-eye-slash text-muted"></i>'}
            </td>
            <td>
                ${e.is_delta
                    ? '<span class="badge bg-light text-dark border">membre</span>'
                    : '<span class="badge bg-primary">partagee</span>'}
            </td>
            <td>
                ${!e.is_delta ? `
                    <button class="btn btn-xs btn-outline-primary me-1" data-action="edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-xs btn-outline-danger" data-action="delete">
                        <i class="bi bi-trash"></i>
                    </button>
                ` : '<span class="text-muted small">—</span>'}
            </td>
        </tr>
    `).join('');
}

async function handleEtapeAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const row = btn.closest('[data-etape-id]');
    if (!row) return;
    const id = row.dataset.etapeId;

    if (btn.dataset.action === 'edit') {
        const { data } = await window.bdb
            .from('organisateur_etapes').select('*').eq('id', id).single();
        if (data) openEtapeModal(data);
    } else if (btn.dataset.action === 'delete') {
        await deleteEtape(id);
    }
}

function openEtapeModal(etape = null) {
    if (!_selectedParcoursId && !etape) return;
    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modal-org-etape')
    );
    const idFld = document.getElementById('org-etape-id');
    const title = document.getElementById('modal-org-etape-title');

    if (etape) {
        title.textContent = 'Modifier la phase';
        idFld.value = etape.id;
        document.getElementById('org-etape-titre').value       = etape.titre || '';
        document.getElementById('org-etape-description').value = etape.description || '';
        document.getElementById('org-etape-timing').value      = etape.timing_label || '';
        document.getElementById('org-etape-ordre').value       = etape.ordre ?? 0;
        const visEl = document.getElementById('org-etape-visible');
        if (visEl) visEl.checked = !!etape.visible;
    } else {
        title.textContent = 'Nouvelle phase partagee';
        idFld.value = '';
        document.getElementById('org-etape-titre').value       = '';
        document.getElementById('org-etape-description').value = '';
        document.getElementById('org-etape-timing').value      = '';
        document.getElementById('org-etape-ordre').value       = 0;
        const visEl = document.getElementById('org-etape-visible');
        if (visEl) visEl.checked = true;
    }
    modal.show();
}

async function saveEtape() {
    const id    = document.getElementById('org-etape-id').value;
    const titre = document.getElementById('org-etape-titre')?.value?.trim();

    if (!titre) {
        document.getElementById('org-etape-titre')?.classList.add('is-invalid');
        return;
    }
    document.getElementById('org-etape-titre')?.classList.remove('is-invalid');

    const payload = {
        titre,
        description  : document.getElementById('org-etape-description')?.value?.trim() || null,
        timing_label : document.getElementById('org-etape-timing')?.value?.trim() || null,
        ordre        : parseInt(document.getElementById('org-etape-ordre')?.value) || 0,
        visible      : document.getElementById('org-etape-visible')?.checked ?? true,
        is_delta     : false,  // etapes admin = partagees, jamais delta membre
        updated_at   : new Date().toISOString()
    };

    try {
        const result = id
            ? await window.bdb.from('organisateur_etapes').update(payload).eq('id', id).select()
            : await window.bdb.from('organisateur_etapes')
                .insert({ ...payload, parcours_id: _selectedParcoursId, created_by: null })
                .select();
        if (result.error) throw result.error;
        bootstrap.Modal.getInstance(document.getElementById('modal-org-etape'))?.hide();
        await loadEtapesParcours(_selectedParcoursId, document.getElementById('org-etapes-parcours-label')?.textContent || '');
    } catch (err) {
        console.error('org-admin saveEtape:', err);
    }
}

async function deleteEtape(id) {
    if (!confirm('Supprimer cette phase ? Les membres qui l\'avaient masquee seront impactes.')) return;
    try {
        await window.bdb.from('organisateur_masques_user')
            .delete().eq('etape_id', id).select();
        const { error } = await window.bdb.from('organisateur_etapes')
            .delete().eq('id', id).select();
        if (error) throw error;
        await loadEtapesParcours(_selectedParcoursId, document.getElementById('org-etapes-parcours-label')?.textContent || '');
    } catch (err) {
        console.error('org-admin deleteEtape:', err);
    }
}

// ─── ONGLET 2 — SESSIONS BRAINSTORM ───────────────────────────────────────────
async function loadSessions() {
    showAdminState('org-sessions', 'loading');
    try {
        const { data, error } = await window.bdb
            .from('organisateur_sessions_brainstorm')
            .select('id, titre, statut, parcours_id, produit_parcours_id, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) { showAdminState('org-sessions', 'empty'); return; }

        renderSessions(data);
        showAdminState('org-sessions', 'table');
    } catch (err) {
        console.error('org-admin loadSessions:', err);
        showAdminError('org-sessions', 'Le chargement n\'a pu aboutir — reessayez dans un instant.');
    }
}

function renderSessions(sessions) {
    // Utilise org-sessions-table (meme cible que showAdminState)
    const container = document.getElementById('org-sessions-table');
    if (!container) return;

    container.innerHTML = sessions.map(s => `
        <div class="card mb-2" data-session-id="${escHtml(s.id)}">
            <div class="card-body d-flex justify-content-between align-items-center py-2">
                <div>
                    <strong>${escHtml(s.titre)}</strong>
                    <span class="badge ${s.statut === 'ouverte' ? 'bg-success' : 'bg-secondary'} ms-2">
                        ${escHtml(s.statut)}
                    </span>
                    <small class="text-muted ms-2">
                        ${escHtml(new Date(s.created_at).toLocaleDateString('fr-FR'))}
                    </small>
                </div>
                ${s.statut === 'ouverte' ? `
                    <button class="btn btn-sm btn-outline-warning" data-action="close-session">
                        <i class="bi bi-x-circle me-1"></i>Fermer
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ─── ONGLET 3 — STATS ─────────────────────────────────────────────────────────
async function loadOrgStats() {
    showAdminState('org-stats', 'loading');
    try {
        const [
            { count: totalParcours },
            { count: totalEtapes },
            { count: etapesDelta },
            { count: totalSessions },
            { count: sessionsOuvertes }
        ] = await Promise.all([
            window.bdb.from('organisateur_parcours').select('*', { count: 'exact', head: true }),
            window.bdb.from('organisateur_etapes').select('*', { count: 'exact', head: true }),
            window.bdb.from('organisateur_etapes').select('*', { count: 'exact', head: true }).eq('is_delta', true),
            window.bdb.from('organisateur_sessions_brainstorm').select('*', { count: 'exact', head: true }),
            window.bdb.from('organisateur_sessions_brainstorm').select('*', { count: 'exact', head: true }).eq('statut', 'ouverte')
        ]);

        document.getElementById('kpi-org-parcours').textContent      = totalParcours ?? '—';
        document.getElementById('kpi-org-etapes').textContent         = totalEtapes ?? '—';
        document.getElementById('kpi-org-etapes-delta').textContent   = etapesDelta ?? '—';
        document.getElementById('kpi-org-sessions').textContent       = totalSessions ?? '—';
        document.getElementById('kpi-org-sessions-open').textContent  = sessionsOuvertes ?? '—';

        showAdminState('org-stats', 'content');
    } catch (err) {
        console.error('org-admin loadOrgStats:', err);
        showAdminError('org-stats', 'Le chargement n\'a pu aboutir — reessayez dans un instant.');
    }
}
