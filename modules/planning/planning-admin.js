/**
 * planning-admin.js — Administration Planning
 * BDB Admin Backend V1.0.0
 *
 * Schema verifie terrain 2026-04-12 :
 *   planning_membres · planning_semaines · planning_affectations
 *
 * PERIMETRE LIMITE :
 *   Admin gere : membres + semaines + stats
 *   Admin ne gere PAS : la matrice affectations (interface membre)
 *
 * planning_semaines.statut = 'EN_COURS' (majuscules + underscore)
 *   NE PAS utiliser 'en_cours' ou 'active'
 *
 * planning_membres.code = identifiant court (max ~6 char)
 *   Sert de reference dans planning_affectations.ide et .chirurgien
 */

// ─── GUARD ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  if (!window.bdbUser?.isAdmin) {
    location.href = '../../index.html';
    return;
  }
  await initPlanningAdmin();
});

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────
/**
 * Affiche un seul etat parmi : loading / empty / error / table / list / content
 * Les autres sont masques.
 */
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
async function initPlanningAdmin() {
  // Onglet 1 — Membres (charge immediatement, onglet actif par defaut)
  await loadMembres();

  document.getElementById('btn-plan-new-membre')
    ?.addEventListener('click', () => openMembreModal());
  document.getElementById('btn-plan-save-membre')
    ?.addEventListener('click', saveMembre);
  document.getElementById('btn-plan-membres-retry')
    ?.addEventListener('click', loadMembres);

  document.getElementById('plan-membres-tbody')
    ?.addEventListener('click', handleMembreAction);

  // Onglet 2 — Semaines (charge a la premiere ouverture)
  document.getElementById('tab-plan-semaines')
    ?.addEventListener('shown.bs.tab', loadSemaines);

  document.getElementById('btn-plan-new-semaine')
    ?.addEventListener('click', openSemaineModal);
  document.getElementById('btn-plan-save-semaine')
    ?.addEventListener('click', saveSemaine);

  document.getElementById('plan-semaines-tbody')
    ?.addEventListener('click', handleSemaineAction);

  // Onglet 3 — Stats (charge a la premiere ouverture)
  document.getElementById('tab-plan-stats')
    ?.addEventListener('shown.bs.tab', loadPlanningStats);

  // Forcer le code membre en majuscules a la saisie
  document.getElementById('plan-membre-code')
    ?.addEventListener('input', function () {
      const start = this.selectionStart;
      const end   = this.selectionEnd;
      this.value  = this.value.toUpperCase();
      this.setSelectionRange(start, end);
    });
}

// ─── ONGLET 1 — MEMBRES ───────────────────────────────────────────────────────
async function loadMembres() {
  showAdminState('plan-membres', 'loading');
  try {
    const { data, error } = await window.bdb
      .from('planning_membres')
      .select('id, code, nom, prenom, fonction, actif, profile_id, created_at')
      .order('nom');
    if (error) throw error;

    const countEl = document.getElementById('count-plan-membres');
    if (countEl) countEl.textContent = data?.length ?? 0;

    if (!data || data.length === 0) {
      showAdminState('plan-membres', 'empty');
      return;
    }
    renderMembres(data);
    showAdminState('plan-membres', 'table');
  } catch (err) {
    console.error('planning-admin loadMembres:', err);
    showAdminError('plan-membres', "Le chargement n'a pu aboutir \u2014 reessayez dans un instant.");
  }
}

function renderMembres(membres) {
  const tbody = document.getElementById('plan-membres-tbody');
  if (!tbody) return;

  tbody.innerHTML = membres.map(m => `
    <tr data-membre-id="${escHtml(m.id)}">
      <td class="fw-medium font-monospace">${escHtml(m.code)}</td>
      <td>${escHtml(m.nom)}${m.prenom ? ' ' + escHtml(m.prenom) : ''}</td>
      <td class="text-muted small">${escHtml(m.fonction || '')}</td>
      <td>
        ${m.actif
          ? '<span class="badge bg-success">Actif</span>'
          : '<span class="badge bg-secondary">Inactif</span>'}
      </td>
      <td class="text-center">
        ${m.profile_id
          ? '<i class="bi bi-person-check text-success" title="Compte BDB lie"></i>'
          : '<span class="text-muted small">\u2014</span>'}
      </td>
      <td>
        <button class="btn btn-xs btn-outline-primary me-1" data-action="edit"
                title="Modifier" aria-label="Modifier ${escHtml(m.code)}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-xs btn-outline-${m.actif ? 'warning' : 'success'}"
                data-action="toggle"
                title="${m.actif ? 'Desactiver' : 'Reactiver'}"
                aria-label="${m.actif ? 'Desactiver' : 'Reactiver'} ${escHtml(m.code)}">
          <i class="bi bi-${m.actif ? 'pause' : 'play'}"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function handleMembreAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const row = btn.closest('[data-membre-id]');
  if (!row) return;
  const id = row.dataset.membreId;

  if (btn.dataset.action === 'edit') {
    const { data, error } = await window.bdb
      .from('planning_membres').select('*').eq('id', id).single();
    if (error) {
      console.error('planning-admin handleMembreAction edit:', error);
      return;
    }
    if (data) openMembreModal(data);

  } else if (btn.dataset.action === 'toggle') {
    // Determine l'etat actuel depuis le badge dans la ligne
    const badge = row.querySelector('.badge');
    const isActif = badge && badge.classList.contains('bg-success');
    const { error } = await window.bdb
      .from('planning_membres')
      .update({ actif: !isActif })
      .eq('id', id)
      .select();
    if (error) {
      console.error('planning-admin handleMembreAction toggle:', error);
      return;
    }
    await loadMembres();
  }
}

function openMembreModal(m = null) {
  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById('modal-plan-membre')
  );

  const errEl = document.getElementById('plan-membre-error');
  if (errEl) errEl.classList.add('d-none');

  ['plan-membre-code', 'plan-membre-nom', 'plan-membre-prenom'].forEach(id => {
    document.getElementById(id)?.classList.remove('is-invalid');
  });

  const titleEl  = document.getElementById('modal-plan-membre-title');
  const idFld    = document.getElementById('plan-membre-id');

  if (m) {
    if (titleEl)  titleEl.textContent = 'Modifier le membre';
    if (idFld)    idFld.value = m.id;

    const codeEl = document.getElementById('plan-membre-code');
    const nomEl  = document.getElementById('plan-membre-nom');
    const prenEl = document.getElementById('plan-membre-prenom');
    const fonEl  = document.getElementById('plan-membre-fonction');
    const actEl  = document.getElementById('plan-membre-actif');

    if (codeEl) codeEl.value = m.code || '';
    if (nomEl)  nomEl.value  = m.nom  || '';
    if (prenEl) prenEl.value = m.prenom || '';
    if (fonEl)  fonEl.value  = m.fonction || '';
    if (actEl)  actEl.checked = !!m.actif;

  } else {
    if (titleEl) titleEl.textContent = 'Nouveau membre planning';
    if (idFld)   idFld.value = '';

    ['plan-membre-code', 'plan-membre-nom', 'plan-membre-prenom'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const fonEl = document.getElementById('plan-membre-fonction');
    if (fonEl) fonEl.value = '';
    const actEl = document.getElementById('plan-membre-actif');
    if (actEl) actEl.checked = true;
  }

  modal.show();
}

async function saveMembre() {
  const id   = document.getElementById('plan-membre-id')?.value || null;
  const code = document.getElementById('plan-membre-code')?.value?.trim().toUpperCase() || '';
  const nom  = document.getElementById('plan-membre-nom')?.value?.trim() || '';

  let valid = true;
  if (!code) {
    document.getElementById('plan-membre-code')?.classList.add('is-invalid');
    valid = false;
  } else {
    document.getElementById('plan-membre-code')?.classList.remove('is-invalid');
  }
  if (!nom) {
    document.getElementById('plan-membre-nom')?.classList.add('is-invalid');
    valid = false;
  } else {
    document.getElementById('plan-membre-nom')?.classList.remove('is-invalid');
  }
  if (!valid) return;

  const errEl = document.getElementById('plan-membre-error');
  if (errEl) errEl.classList.add('d-none');

  const payload = {
    code,
    nom,
    prenom   : document.getElementById('plan-membre-prenom')?.value?.trim() || null,
    fonction : document.getElementById('plan-membre-fonction')?.value?.trim() || '',
    actif    : document.getElementById('plan-membre-actif')?.checked ?? true
    // profile_id : null — liaison manuelle via admin/ > Utilisateurs
  };

  try {
    const result = id
      ? await window.bdb.from('planning_membres').update(payload).eq('id', id).select()
      : await window.bdb.from('planning_membres').insert(payload).select();

    if (result.error) throw result.error;

    bootstrap.Modal.getInstance(
      document.getElementById('modal-plan-membre')
    )?.hide();
    await loadMembres();

  } catch (err) {
    console.error('planning-admin saveMembre:', err);
    if (errEl) {
      errEl.textContent = err.code === '23505'
        ? 'Ce code est deja utilise par un autre membre.'
        : 'Une erreur est survenue lors de l\'enregistrement.';
      errEl.classList.remove('d-none');
    }
  }
}

// ─── ONGLET 2 — SEMAINES ──────────────────────────────────────────────────────
async function loadSemaines() {
  showAdminState('plan-semaines', 'loading');
  try {
    const { data, error } = await window.bdb
      .from('planning_semaines')
      .select('id, annee, semaine, statut, created_by, created_at')
      .order('annee',    { ascending: false })
      .order('semaine',  { ascending: false })
      .limit(52); // Max 1 an d'historique
    if (error) throw error;

    if (!data || data.length === 0) {
      showAdminState('plan-semaines', 'empty');
      return;
    }
    renderSemaines(data);
    showAdminState('plan-semaines', 'table');
  } catch (err) {
    console.error('planning-admin loadSemaines:', err);
    showAdminError('plan-semaines', "Le chargement n'a pu aboutir \u2014 reessayez dans un instant.");
  }
}

function renderSemaines(semaines) {
  const tbody = document.getElementById('plan-semaines-tbody');
  if (!tbody) return;

  tbody.innerHTML = semaines.map(s => `
    <tr data-semaine-id="${escHtml(s.id)}">
      <td class="fw-medium">
        S${escHtml(String(s.semaine))}\u00a0${escHtml(String(s.annee))}
      </td>
      <td>
        <span class="badge ${s.statut === 'EN_COURS' ? 'bg-success' : 'bg-secondary'}">
          ${escHtml(s.statut)}
        </span>
      </td>
      <td class="text-muted small">
        ${escHtml(new Date(s.created_at).toLocaleDateString('fr-FR'))}
      </td>
      <td>
        ${s.statut === 'EN_COURS' ? `
          <button class="btn btn-xs btn-outline-warning me-1" data-action="archive"
                  title="Archiver cette semaine">
            <i class="bi bi-archive me-1"></i>Archiver
          </button>
        ` : ''}
        <button class="btn btn-xs btn-outline-danger" data-action="delete"
                title="Supprimer cette semaine et ses affectations">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function openSemaineModal() {
  const now = new Date();
  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById('modal-plan-semaine')
  );
  document.getElementById('plan-semaine-annee').value   = now.getFullYear();
  document.getElementById('plan-semaine-semaine').value = isoWeekNumber(now);
  modal.show();
}

async function saveSemaine() {
  const anneeEl   = document.getElementById('plan-semaine-annee');
  const semaineEl = document.getElementById('plan-semaine-semaine');
  const annee     = parseInt(anneeEl?.value, 10);
  const semaine   = parseInt(semaineEl?.value, 10);

  if (!annee || !semaine || semaine < 1 || semaine > 53) return;

  try {
    const result = await window.bdb
      .from('planning_semaines')
      .insert({
        annee,
        semaine,
        statut     : 'EN_COURS', // Valeur exacte : majuscules + underscore
        created_by : window.bdbUser.id
      })
      .select();

    if (result.error) throw result.error;

    bootstrap.Modal.getInstance(
      document.getElementById('modal-plan-semaine')
    )?.hide();
    await loadSemaines();

  } catch (err) {
    console.error('planning-admin saveSemaine:', err);
  }
}

async function handleSemaineAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const row = btn.closest('[data-semaine-id]');
  if (!row) return;
  const id = row.dataset.semaineId;

  if (btn.dataset.action === 'archive') {
    const { error } = await window.bdb
      .from('planning_semaines')
      .update({ statut: 'ARCHIVE', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) {
      console.error('planning-admin handleSemaineAction archive:', error);
      return;
    }
    await loadSemaines();

  } else if (btn.dataset.action === 'delete') {
    if (!confirm('Supprimer cette semaine et toutes ses affectations ? Cette action est irreversible.')) return;

    // Cascade manuelle : affectations avant semaine (pas de FK ON DELETE CASCADE garantie)
    const { error: errAff } = await window.bdb
      .from('planning_affectations')
      .delete()
      .eq('semaine_id', id)
      .select();
    if (errAff) {
      console.error('planning-admin delete affectations:', errAff);
      return;
    }

    const { error: errSem } = await window.bdb
      .from('planning_semaines')
      .delete()
      .eq('id', id)
      .select();
    if (errSem) {
      console.error('planning-admin delete semaine:', errSem);
      return;
    }

    await loadSemaines();
  }
}

// ─── ONGLET 3 — STATS ─────────────────────────────────────────────────────────
async function loadPlanningStats() {
  showAdminState('plan-stats', 'loading');
  try {
    const [
      { count: totalMembres,     error: e1 },
      { count: membresActifs,    error: e2 },
      { count: totalSemaines,    error: e3 },
      { count: semainesEnCours,  error: e4 },
      { count: totalAffectations, error: e5 }
    ] = await Promise.all([
      window.bdb.from('planning_membres')
        .select('*', { count: 'exact', head: true }),
      window.bdb.from('planning_membres')
        .select('*', { count: 'exact', head: true }).eq('actif', true),
      window.bdb.from('planning_semaines')
        .select('*', { count: 'exact', head: true }),
      window.bdb.from('planning_semaines')
        .select('*', { count: 'exact', head: true }).eq('statut', 'EN_COURS'),
      window.bdb.from('planning_affectations')
        .select('*', { count: 'exact', head: true })
    ]);

    for (const e of [e1, e2, e3, e4, e5]) {
      if (e) throw e;
    }

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val ?? '\u2014';
    };

    set('kpi-plan-membres',       totalMembres);
    set('kpi-plan-actifs',        membresActifs);
    set('kpi-plan-semaines',      totalSemaines);
    set('kpi-plan-en-cours',      semainesEnCours);
    set('kpi-plan-affectations',  totalAffectations);

    showAdminState('plan-stats', 'content');
  } catch (err) {
    console.error('planning-admin loadPlanningStats:', err);
    showAdminError('plan-stats', "Le chargement n'a pu aboutir \u2014 reessayez dans un instant.");
  }
}
