document.addEventListener('DOMContentLoaded', async () => {

  // ── SHELL AUTH — attend que bdb-shell.js ait initialisé l'auth ──
  await window.bdbShellReady;

  // ── GUARD ADMIN — module admin réservé aux administrateurs ──────
  if (!window.bdbUser.isAdmin) {
    location.href = '../../index.html';
    return;
  }

  // ----------------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const toast = (msg, type = 'success') => {
    const el = $('#toastMsg');
    el.className = `toast align-items-center text-bg-${type} border-0`;
    $('#toastText').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el).show();
  };

  const ROLE_LABELS  = { admin: 'Administrateur', membre: 'Membre', invite: 'Invité' };
  const FONC_LABELS  = { medecin: 'Médecin', cadre: 'Cadre de bloc', infirmier: 'Infirmier(ère)', 'aide-soignant': 'Aide-soignant(e)' };
  const COLORS = [
    { v: '#0ea5e9', l: 'Bleu' }, { v: '#22c55e', l: 'Vert' }, { v: '#f59e0b', l: 'Orange' },
    { v: '#ef4444', l: 'Rouge' }, { v: '#8b5cf6', l: 'Violet' }, { v: '#ec4899', l: 'Rose' },
    { v: '#6b7280', l: 'Gris' },
  ];

  const initials = (u) => {
    const n = (u.prenom || '').trim();
    const s = (u.nom || '').trim();
    if (n && s) return (n[0] + s[0]).toUpperCase();
    return ((u.prenom || u.nom || '?')[0]).toUpperCase();
  };

  const avatarBg = (role) => {
    if (role === 'admin') return '#1e40af';
    if (role === 'invite') return '#6b7280';
    return '#0ea5e9';
  };

  // ----------------------------------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------------------------------
  const tabs = {
    dashboard:       $('#tabDashboard'),
    users:           $('#tabUsers'),
    categories:      $('#tabCategories'),
    tags:            $('#tabTags'),
    classifications: $('#tabClassifications'),
  };
  let activeTab = 'dashboard';

  $$('#adminTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#adminTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      Object.entries(tabs).forEach(([k, el]) => el.classList.toggle('d-none', k !== key));
      activeTab = key;
      if (key === 'dashboard')       loadDashboard();
      if (key === 'users')           loadUsers();
      if (key === 'categories')      loadContentTypes();
      if (key === 'tags')            loadTags();
      if (key === 'classifications') loadClassif();
    });
  });

  // ----------------------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------------------
  async function loadDashboard() {
    // U-ADMIN-02 : Skeleton sur les 4 stat cards pendant le chargement
    const skEl = () => `<div class="admin-skeleton" style="height:32px;width:48px;"></div>`;/* style= OK : valeur fixe skeleton D-2026-03-15-T04 */
    ['statTotalUsers','statPending','statTransmissions','statTags'].forEach(id => {
      const el = $('#' + id);
      if (el) el.innerHTML = skEl();
    });
    ['statUsersSub','statTransSub'].forEach(id => {
      const el = $('#' + id);
      if (el) { el.innerHTML = `<div class="admin-skeleton" style="height:12px;width:80px;margin-top:4px;"></div>`;/* style= OK : valeur fixe skeleton D-2026-03-15-T04 */ }
    });
    ['statMedecins','statCadres','statInfirmiers','statAides'].forEach(id => {
      const el = $('#' + id);
      if (el) el.innerHTML = skEl();
    });

    try {
      // U-ADMIN-03 : Promise.all — 4 requêtes en parallèle (~100ms au lieu de ~400ms)
      const [
        { data: profs },
        { data: roles },
        { count: transCnt },
        { count: tagCnt }
      ] = await Promise.all([
        window.bdb.from('profiles_directory').select('fonction, approved'),
        window.bdb.from('user_roles').select('role'),
        window.bdb.from('transmissions').select('*', { count: 'exact', head: true }),
        window.bdb.from('tags').select('*', { count: 'exact', head: true }),
      ]);

      if (profs && roles) {
        const total   = profs.length;
        const admins  = roles.filter(r => r.role === 'admin').length;
        const pending = profs.filter(p => !p.approved).length;
        const membres = roles.filter(r => r.role === 'membre').length;

        $('#statTotalUsers').textContent = total;
        $('#statUsersSub').textContent   = `${admins} admins, ${membres} membres`;
        $('#statPending').textContent    = pending;

        const byF = profs.reduce((a, p) => { a[p.fonction] = (a[p.fonction] || 0) + 1; return a; }, {});
        $('#statMedecins').textContent   = byF['medecin'] || 0;
        $('#statCadres').textContent     = byF['cadre'] || 0;
        $('#statInfirmiers').textContent = byF['infirmier'] || 0;
        $('#statAides').textContent      = byF['aide-soignant'] || 0;


      }

      $('#statTransmissions').textContent = transCnt ?? '—';
      $('#statTransSub').textContent = 'total';
      $('#statTags').textContent = tagCnt ?? '—';

    } catch (err) {
      // U-ADMIN-01 : gestion d'erreur dashboard
      cdsShowOfflineBanner('Impossible de charger le dashboard — vérifiez votre connexion.');
      cdsShowGridError($('#fonctionStats'), 'Données non chargées.', loadDashboard);
      ['statTotalUsers','statPending','statTransmissions','statTags'].forEach(id => {
        const el = $('#' + id);
        if (el) el.textContent = '—';
      });
    }
  }

  // ----------------------------------------------------------------
  // UTILISATEURS
  // ----------------------------------------------------------------
  let allUsers  = [];
  let usersPage = 1;
  const PAGE_SIZE = 20;

  async function loadUsers() {
    $('#usersTableBody').innerHTML = skeletonRows(6, 6);
    try {
      const [
        { data: profs, error: e1 },
        { data: roles, error: e2 }
      ] = await Promise.all([
        window.bdb.from('profiles_directory')
          .select('id, user_id, prenom, nom, email, fonction, avatar_url, approved')
          .order('nom'),
        window.bdb.from('user_roles').select('user_id, role'),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;

      const roleMap = {};
      (roles || []).forEach(r => roleMap[r.user_id] = r);

      allUsers = (profs || []).map(p => ({
        ...p,
        role:     (roleMap[p.user_id] || {}).role || 'membre',
        approved: p.approved ?? false,
      }));

      const pending = allUsers.filter(u => !u.approved);
      if (pending.length > 0) {
        $('#pendingUsersCard').classList.remove('d-none');
        $('#pendingCount').textContent = pending.length;
        renderPendingList(pending);
      } else {
        $('#pendingUsersCard').classList.add('d-none');
      }

      usersPage = 1;
      renderUsersTable();
    } catch (err) {
      cdsShowGridError($('#usersTableBody').closest('.card-body'),
        'Impossible de charger les utilisateurs.', loadUsers);
    }
  }

  function renderPendingList(users) {
    $('#pendingList').innerHTML = users.map(u => `
      <li class="list-group-item d-flex align-items-center gap-3">
        <div class="admin-avatar-sm text-white" style="background:${avatarBg(u.role)};">${initials(u)}</div><!-- style= OK : couleur calculée JS D-2026-03-15-T04 -->
        <div class="flex-grow-1 small">
          <div class="fw-semibold">${u.prenom || ''} ${u.nom || ''}</div>
          ${u.email ? '<div class="text-muted cds-text-xs">'+u.email+'</div>' : ''}
        </div>
        <button class="btn btn-sm btn-outline-success" data-action="approve" data-uid="${u.user_id}">
          <i class="bi bi-check"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="reject" data-uid="${u.user_id}">
          <i class="bi bi-x"></i>
        </button>
      </li>`).join('');

    $$('#pendingList [data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleApproval(btn.dataset.uid, btn.dataset.action === 'approve'));
    });
  }

  function renderUsersTable() {
    const search   = $('#usersSearch').value.toLowerCase();
    const roleF    = $('#usersRoleFilter').value;
    const approveF = $('#usersApprovedFilter').value;

    const filtered = allUsers.filter(u => {
      const name = `${u.prenom || ''} ${u.nom || ''} ${u.email || ''}`.toLowerCase();
      if (search && !name.includes(search)) return false;
      if (roleF !== 'all' && u.role !== roleF) return false;
      if (approveF === 'approved' && !u.approved) return false;
      if (approveF === 'pending' && u.approved) return false;
      return true;
    });

    // ── U-ADMIN-06 : activer/désactiver export CSV ───────────────
    const btnExport = $('#btnExportCSV');
    if (btnExport) btnExport.disabled = filtered.length === 0;

    // ── U-ADMIN-04 : Pagination ──────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (usersPage > totalPages) usersPage = totalPages;
    const pageStart = (usersPage - 1) * PAGE_SIZE;
    const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

    if (!paginated.length) {
      $('#usersTableBody').innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">Aucun utilisateur trouvé</td></tr>`;
      renderUsersPagination(0, 0, 0);
      return;
    }

    $('#usersTableBody').innerHTML = paginated.map(u => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="admin-avatar-sm text-white flex-shrink-0" style="background:${avatarBg(u.role)};">${initials(u)}</div><!-- style= OK : couleur calculée JS D-2026-03-15-T04 -->
            <span class="fw-semibold">${u.prenom || ''} ${u.nom || ''}</span>
          </div>
        </td>
        <td class="d-none d-md-table-cell text-muted small">${u.email || '—'}</td>
        <td class="d-none d-lg-table-cell">
          <span class="badge bg-light text-dark border">${FONC_LABELS[u.fonction] || u.fonction || '—'}</span>
        </td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'invite' ? 'badge-invite' : 'badge-membre'}">
            ${ROLE_LABELS[u.role] || u.role}
          </span>
        </td>
        <td>
          <span class="badge border ${u.approved ? 'badge-approved' : 'badge-pending'}">
            ${u.approved ? 'Approuvé' : 'En attente'}
          </span>
        </td>
        <td>
          ${u.user_id !== window.bdbUser?.id ? `
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              ${!u.approved ? `<li><button class="dropdown-item small" data-action="approve"
                  data-uid="${u.user_id}" data-prenom="${u.prenom||''}" data-nom="${u.nom||''}"
                  data-email="${u.email||''}" data-fonc="${u.fonction||''}">
                  <i class="bi bi-check text-success me-2"></i>Approuver</button></li>` : ''}
              <li><button class="dropdown-item small" data-action="editprofile"
                  data-uid="${u.user_id}" data-prenom="${u.prenom||''}" data-nom="${u.nom||''}" data-email="${u.email||''}">
                  <i class="bi bi-pencil text-primary me-2"></i>Modifier le profil</button></li>
              <li><hr class="dropdown-divider"></li>
              <li><span class="dropdown-item-text small text-muted">Changer le rôle</span></li>
              ${['admin','membre','invite'].map(r => `
                <li><button class="dropdown-item small ${u.role===r ? 'active' : ''}" data-action="role" data-uid="${u.user_id}" data-role="${r}">${u.role===r ? '<i class="bi bi-check2 me-1"></i>' : '<i class="bi bi-check2 me-1 invisible"></i>'}${ROLE_LABELS[r]}</button></li>
              `).join('')}
              <li><hr class="dropdown-divider"></li>
              <li><span class="dropdown-item-text small text-muted">Changer la fonction</span></li>
              ${Object.entries(FONC_LABELS).map(([k, v]) => `
                <li><button class="dropdown-item small ${u.fonction===k ? 'active' : ''}" data-action="fonc" data-uid="${u.user_id}" data-fonc="${k}">${v}</button></li>
              `).join('')}
            </ul>
          </div>` : ''}
        </td>
      </tr>`).join('');

    renderUsersPagination(filtered.length, usersPage, totalPages);

    // Events
    $$('#usersTableBody [data-action="approve"]').forEach(b => {
      b.addEventListener('click', () => confirmApproval(
        b.dataset.uid, b.dataset.prenom, b.dataset.nom, b.dataset.email, b.dataset.fonc
      ));
    });
    $$('#usersTableBody [data-action="role"]').forEach(b => {
      b.addEventListener('click', () => handleRoleChange(b.dataset.uid, b.dataset.role));
    });
    $$('#usersTableBody [data-action="fonc"]').forEach(b => {
      b.addEventListener('click', () => handleFonctionChange(b.dataset.uid, b.dataset.fonc));
    });
    $$('#usersTableBody [data-action="editprofile"]').forEach(b => {
      b.addEventListener('click', () => openEditProfileModal(b.dataset.uid, b.dataset.prenom, b.dataset.nom, b.dataset.email));
    });
  }

  // ── U-ADMIN-04 : Contrôles pagination ───────────────────────────
  function renderUsersPagination(total, page, totalPages) {
    let pager = $('#usersPagination');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'usersPagination';
      pager.className = 'd-flex align-items-center justify-content-between mt-3 flex-wrap gap-2';
      const tableCard = $('#tabUsers .card:last-of-type');
      if (tableCard) tableCard.after(pager);
    }
    if (totalPages <= 1) { pager.innerHTML = ''; return; }
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce((acc, p, idx, arr) => {
        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
        acc.push(p);
        return acc;
      }, []);
    pager.innerHTML = `
      <small class="text-muted">
        ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} sur ${total}
      </small>
      <nav><ul class="pagination pagination-sm mb-0">
        <li class="page-item ${page <= 1 ? 'disabled' : ''}">
          <button class="page-link" data-page="${page - 1}">‹</button>
        </li>
        ${pages.map(p => p === '…'
          ? `<li class="page-item disabled"><span class="page-link">…</span></li>`
          : `<li class="page-item ${p === page ? 'active' : ''}">
               <button class="page-link" data-page="${p}">${p}</button>
             </li>`
        ).join('')}
        <li class="page-item ${page >= totalPages ? 'disabled' : ''}">
          <button class="page-link" data-page="${page + 1}">›</button>
        </li>
      </ul></nav>`;
    pager.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        usersPage = parseInt(btn.dataset.page);
        renderUsersTable();
      });
    });
  }

  // ── U-ADMIN-05 : Confirmation approbation avec détail ───────────
  function confirmApproval(userId, prenom, nom, email, fonc) {
    const displayName = `${prenom || ''} ${nom || ''}`.trim() || 'cet utilisateur';
    const foncLabel   = FONC_LABELS[fonc] || fonc || '—';
    $('#confirmDeleteMsg').innerHTML = `
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="admin-avatar-sm text-white flex-shrink-0" style="background:#0ea5e9;">${((prenom||'?')[0]+(nom||'?')[0]).toUpperCase()}</div><!-- style= OK : couleur fixe D-2026-03-15-T04 -->
        <div>
          <div class="fw-semibold">${displayName}</div>
          ${email ? `<div class="text-muted small">${email}</div>` : ''}
          <span class="badge bg-light text-dark border mt-1">${foncLabel}</span>
        </div>
      </div>
      <div class="small">Approuver l'accès de cet utilisateur à Bible de Bloc ?</div>`;
    const modal = new bootstrap.Modal('#modalConfirmDelete');
    // Personnaliser le bouton confirm en vert pour l'approbation
    const btnConfirm = $('#btnConfirmDelete');
    btnConfirm.className = 'btn btn-success btn-sm';
    btnConfirm.innerHTML = '<i class="bi bi-check me-1"></i>Approuver';
    modal.show();
    const handler = () => {
      modal.hide();
      btnConfirm.className = 'btn btn-danger btn-sm';
      btnConfirm.innerHTML = 'Supprimer';
      handleApproval(userId, true);
      btnConfirm.removeEventListener('click', handler);
    };
    btnConfirm.addEventListener('click', handler);
    // Restaurer le bouton à la fermeture sans confirmation
    document.getElementById('modalConfirmDelete').addEventListener('hidden.bs.modal', () => {
      btnConfirm.className = 'btn btn-danger btn-sm';
      btnConfirm.innerHTML = 'Supprimer';
      btnConfirm.removeEventListener('click', handler);
    }, { once: true });
  }

  async function handleApproval(userId, approve) {
    const { error } = await window.bdb
      .from('profiles_directory')
      .update({ approved: approve })
      .eq('user_id', userId);
    if (error) { toast('Erreur lors de la mise à jour', 'danger'); return; }
    toast(approve ? 'Utilisateur approuvé' : 'Accès refusé');
    loadUsers();
  }

  async function handleRoleChange(userId, role) {
    const { error } = await window.bdb
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId);
    if (error) { toast('Erreur changement de rôle', 'danger'); return; }
    toast('Rôle mis à jour');
    loadUsers();
  }

  async function handleFonctionChange(userId, fonction) {
    const { error } = await window.bdb
      .from('profiles_directory')
      .update({ fonction })
      .eq('user_id', userId);
    if (error) { toast('Erreur changement de fonction', 'danger'); return; }
    toast('Fonction mise à jour');
    loadUsers();
  }

  $('#usersSearch').addEventListener('input', () => { usersPage = 1; renderUsersTable(); });
  $('#usersRoleFilter').addEventListener('change', () => { usersPage = 1; renderUsersTable(); });
  $('#usersApprovedFilter').addEventListener('change', () => { usersPage = 1; renderUsersTable(); });

  // ── B-03 + B-04 : Modifier profil utilisateur ───────────────────
  const modalEditProfile = new bootstrap.Modal('#modalEditProfile');

  function openEditProfileModal(uid, prenom, nom, email) {
    $('#editProfileUid').value    = uid;
    $('#editProfilePrenom').value = prenom || '';
    $('#editProfileNom').value    = nom    || '';
    $('#editProfileEmail').value  = email  || '';
    const alertEl = $('#editProfileAlert');
    alertEl.className = 'alert d-none small';
    alertEl.textContent = '';
    modalEditProfile.show();
  }

  $('#btnSaveEditProfile').addEventListener('click', async () => {
    const uid    = $('#editProfileUid').value;
    const prenom = $('#editProfilePrenom').value.trim();
    const nom    = $('#editProfileNom').value.trim();
    const email  = $('#editProfileEmail').value.trim();
    const alertEl = $('#editProfileAlert');

    if (!prenom || !nom) {
      alertEl.className = 'alert alert-danger small';
      alertEl.textContent = 'Prénom et nom sont obligatoires.';
      return;
    }
    alertEl.className = 'alert d-none small';
    $('#btnSaveEditProfile').disabled = true;

    const { error } = await window.bdb
      .from('profiles_directory')
      .update({ prenom, nom, email })
      .eq('user_id', uid);

    $('#btnSaveEditProfile').disabled = false;

    if (error) {
      alertEl.className = 'alert alert-danger small';
      alertEl.textContent = error.message;
      return;
    }
    toast('Profil mis à jour');
    modalEditProfile.hide();
    loadUsers();
  });

  // ── U-ADMIN-06 : Export CSV utilisateurs ─────────────────────
  function exportUsersCSV() {
    const search   = $('#usersSearch').value.toLowerCase();
    const roleF    = $('#usersRoleFilter').value;
    const approveF = $('#usersApprovedFilter').value;
    const rows = allUsers.filter(u => {
      const name = `${u.prenom || ''} ${u.nom || ''} ${u.email || ''}`.toLowerCase();
      if (search && !name.includes(search)) return false;
      if (roleF !== 'all' && u.role !== roleF) return false;
      if (approveF === 'approved' && !u.approved) return false;
      if (approveF === 'pending' && u.approved) return false;
      return true;
    });
    const header = ['Prénom', 'Nom', 'Email', 'Fonction', 'Rôle', 'Statut'];
    const csv = [header, ...rows.map(u => [
      u.prenom || '',
      u.nom    || '',
      u.email  || '',
      FONC_LABELS[u.fonction] || u.fonction || '',
      ROLE_LABELS[u.role]     || u.role     || '',
      u.approved ? 'Approuvé' : 'En attente',
    ])].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `bdb-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${rows.length} utilisateur(s) exporté(s)`);
  }

  const modalCreateUser = new bootstrap.Modal('#modalCreateUser');
  $('#btnCreateUser').addEventListener('click', () => {
    ['createPrenom','createNom','createEmail','createPassword'].forEach(id => $('#' + id).value = '');
    $('#createUserError').classList.add('d-none');
    modalCreateUser.show();
  });

  $('#btnExportCSV').addEventListener('click', exportUsersCSV);

  // Avatar upload preview
  const avatarZone = $('#avatarUploadZone');
  const avatarInput = $('#avatarFileInput');
  avatarZone.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', () => {
    const f = avatarInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => {
      avatarZone.innerHTML = `<img src="${e.target.result}" alt="avatar">`;
    };
    reader.readAsDataURL(f);
  });

  $('#btnSubmitCreateUser').addEventListener('click', async () => {
    const prenom   = $('#createPrenom').value.trim();
    const nom      = $('#createNom').value.trim();
    const email    = $('#createEmail').value.trim();
    const password = $('#createPassword').value;
    const fonction = $('#createFonction').value;
    const role     = $('#createRole').value;

    const errEl = $('#createUserError');
    if (!prenom || !nom || !email || !password) {
      errEl.textContent = 'Tous les champs marqués * sont requis.';
      errEl.classList.remove('d-none');
      return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
      errEl.classList.remove('d-none');
      return;
    }
    errEl.classList.add('d-none');
    $('#btnSubmitCreateUser').disabled = true;
    $('#btnSubmitCreateUser').textContent = 'Création...';

    try {
      // Appel Edge Function admin-create-user
      const { data, error } = await window.bdb.functions.invoke('admin-create-user', {
        body: { email, password, nom, prenom, fonction, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast(`${prenom} ${nom} créé avec succès`);
      modalCreateUser.hide();
      loadUsers();
    } catch (err) {
      errEl.textContent = err.message || 'Erreur lors de la création.';
      errEl.classList.remove('d-none');
    } finally {
      $('#btnSubmitCreateUser').disabled = false;
      $('#btnSubmitCreateUser').innerHTML = '<i class="bi bi-person-plus me-1"></i>Créer';
    }
  });

  // ----------------------------------------------------------------
  // PURGE MEMBRES
  // ----------------------------------------------------------------
  $('#btnPurgeMembers').addEventListener('click', () => {
    $('#confirmDeleteMsg').textContent = 'Supprimer TOUS les membres (sauf admins) ? Action irréversible.';
    const modal = new bootstrap.Modal('#modalConfirmDelete');
    modal.show();
    const handler = async () => {
      modal.hide();
      // Récupérer les non-admins
      const { data: nonAdmins } = await window.bdb
        .from('user_roles')
        .select('user_id')
        .neq('role', 'admin');
      if (nonAdmins) {
        for (const u of nonAdmins) {
          await window.bdb.from('user_roles').delete().eq('user_id', u.user_id);
          await window.bdb.from('profiles_directory').delete().eq('user_id', u.user_id);
        }
      }
      toast(`${nonAdmins?.length || 0} membre(s) supprimé(s)`);
      loadDashboard();
      if (activeTab === 'users') loadUsers();
      $('#btnConfirmDelete').removeEventListener('click', handler);
    };
    $('#btnConfirmDelete').addEventListener('click', handler);
  });

  // ----------------------------------------------------------------
  // CATÉGORIES
  // ----------------------------------------------------------------
  let contentTypes = [];
  let currentContentTypeId = null;

  async function loadContentTypes() {
    try {
      const { data, error } = await window.bdb.from('content_types').select('id, code, label').order('label');
      if (error) throw error;
      contentTypes = data || [];
      const sel = $('#categoryModuleSelect');
      sel.innerHTML = '<option value="">Sélectionner un module...</option>' +
        contentTypes.map(ct => `<option value="${ct.id}" data-code="${ct.code}">${ct.label}</option>`).join('');
    } catch (err) {
      cdsShowGridError($('#categoriesTableBody')?.closest('.card-body') || $('#categoriesEmptyMsg').parentElement,
        'Impossible de charger les modules.', loadContentTypes);
    }
  }

  $('#categoryModuleSelect').addEventListener('change', async () => {
    const sel = $('#categoryModuleSelect');
    currentContentTypeId = sel.value || null;
    if (!currentContentTypeId) {
      $('#categoriesEmptyMsg').classList.remove('d-none');
      $('#categoriesTableCard').classList.add('d-none');
      $('#btnNewCategory').disabled = true;
      return;
    }
    $('#btnNewCategory').disabled = false;
    const opt = sel.options[sel.selectedIndex];
    $('#categoriesTableHeader').textContent = `Catégories — ${opt.textContent}`;
    $('#categoriesEmptyMsg').classList.add('d-none');
    $('#categoriesTableCard').classList.remove('d-none');
    loadCategories();
  });

  async function loadCategories() {
    $('#categoriesTableBody').innerHTML = skeletonRows(4, 5);
    try {
      const { data, error } = await window.bdb
        .from('categories')
        .select('id, label, color, active')
        .eq('content_type_id', currentContentTypeId)
        .order('label');
      if (error) throw error;
      renderCategoriesTable(data || []);
    } catch (err) {
      cdsShowGridError($('#categoriesTableBody').closest('.card-body'),
        'Impossible de charger les catégories.', loadCategories);
    }
  }

  function renderCategoriesTable(cats) {
    if (!cats.length) {
      $('#categoriesTableBody').innerHTML = `
        <tr><td colspan="5" class="text-center py-5 text-muted">
          Aucune catégorie — <button class="btn btn-link btn-sm p-0" id="inlineNewCat">Créer la première</button>
        </td></tr>`;
      $('#inlineNewCat')?.addEventListener('click', openCategoryModal);
      return;
    }
    $('#categoriesTableBody').innerHTML = cats.map(c => `
      <tr>
        <td><div class="color-swatch" style="background:${c.color};"></div></td><!-- style= OK : couleur dynamique Supabase D-2026-03-15-T04 -->
        <td class="fw-semibold">${c.label}</td>
        <td class="d-none d-sm-table-cell text-muted small">${c.color}</td>
        <td><span class="badge ${c.active ? 'bg-success' : 'bg-secondary'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-cat" data-id="${c.id}" data-label="${c.label}" data-color="${c.color}" data-active="${c.active}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-cat" data-id="${c.id}" data-label="${c.label}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`).join('');

    $$('[data-action="edit-cat"]').forEach(b => {
      b.addEventListener('click', () => openCategoryModal({
        id: b.dataset.id, label: b.dataset.label, color: b.dataset.color, active: b.dataset.active === 'true'
      }));
    });
    $$('[data-action="del-cat"]').forEach(b => {
      b.addEventListener('click', () => confirmDelete(
        `Supprimer la catégorie "${b.dataset.label}" ?`,
        async () => {
          await window.bdb.from('categories').delete().eq('id', b.dataset.id);
          toast('Catégorie supprimée');
          loadCategories();
        }
      ));
    });
  }

  // Init color picker
  const cpEl = $('#colorPicker');
  cpEl.innerHTML = COLORS.map(c =>
    `<button type="button" class="color-picker-btn" data-color="${c.v}" style="background:${c.v};" title="${c.l}"></button>`/* style= OK : couleur dynamique picker D-2026-03-15-T04 */
  ).join('');
  let selectedColor = '#0ea5e9';

  cpEl.querySelectorAll('.color-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cpEl.querySelectorAll('.color-picker-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
      updateCatPreview();
    });
  });

  function updateCatPreview() {
    const lbl = ($('#categorieLabel').value || '').trim();
    const circle = $('#catPreviewCircle');
    circle.style.background = selectedColor;
    circle.textContent = lbl ? lbl[0].toUpperCase() : '?';
  }

  $('#categorieLabel').addEventListener('input', updateCatPreview);

  const modalCat = new bootstrap.Modal('#modalCategorie');

  function openCategoryModal(item) {
    const isEdit = item && item.id;
    $('#modalCategorieTitle').textContent = isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie';
    $('#categorieEditId').value   = isEdit ? item.id : '';
    $('#categorieModeEdit').value = isEdit ? '1' : '';
    $('#categorieLabel').value    = isEdit ? item.label : '';
    $('#categorieActive').checked = isEdit ? item.active : true;
    selectedColor = isEdit ? item.color : '#0ea5e9';
    cpEl.querySelectorAll('.color-picker-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.color === selectedColor);
    });
    $('#btnSaveCategorie').textContent = isEdit ? 'Enregistrer' : 'Créer';
    $('#categorieError').classList.add('d-none');
    updateCatPreview();
    modalCat.show();
  }

  $('#btnNewCategory').addEventListener('click', () => openCategoryModal(null));

  $('#btnSaveCategorie').addEventListener('click', async () => {
    const label  = $('#categorieLabel').value.trim();
    const active = $('#categorieActive').checked;
    const isEdit = $('#categorieModeEdit').value === '1';
    const id     = $('#categorieEditId').value;
    const errEl  = $('#categorieError');

    if (!label) { errEl.textContent = 'Le label est obligatoire.'; errEl.classList.remove('d-none'); return; }
    errEl.classList.add('d-none');

    const payload = { label, color: selectedColor, active, icon: 'FileText' };
    if (!isEdit) payload.content_type_id = currentContentTypeId;

    const { error } = isEdit
      ? await window.bdb.from('categories').update(payload).eq('id', id)
      : await window.bdb.from('categories').insert(payload);

    if (error) { errEl.textContent = error.message; errEl.classList.remove('d-none'); return; }
    toast(isEdit ? 'Catégorie mise à jour' : 'Catégorie créée');
    modalCat.hide();
    loadCategories();
  });

  // ----------------------------------------------------------------
  // TAGS
  // ----------------------------------------------------------------
  let allTags = [];
  let mergeSourceId = null;

  async function loadTags() {
    $('#tagsTableBody').innerHTML = skeletonRows(5, 5);
    try {
      const { data, error } = await window.bdb
        .from('tags')
        .select('id, label_display, label_normalized, type, locked')
        .order('label_display');
      if (error) throw error;
      allTags = data || [];
      renderTagsTable();
    } catch (err) {
      cdsShowGridError($('#tagsTableBody').closest('.card-body'),
        'Impossible de charger les tags.', loadTags);
    }
  }

  function renderTagsTable() {
    const search   = $('#tagsSearch').value.toLowerCase();
    const typeF    = $('#tagsTypeFilter').value;
    const viewF    = $('#tagsViewFilter').value;

    const filtered = allTags.filter(t => {
      if (search && !t.label_display.toLowerCase().includes(search)) return false;
      if (typeF !== 'all' && t.type !== typeF) return false;
      if (viewF === 'orphans' && (t.link_count || 0) > 0) return false;
      if (viewF === 'unlinked_acronyms' && (t.type !== 'acronyme' || t.glossary_id)) return false;
      return true;
    });

    $('#tagsCount').textContent = filtered.length;

    if (!filtered.length) {
      $('#tagsTableBody').innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">Aucun tag trouvé</td></tr>`;
      return;
    }

    $('#tagsTableBody').innerHTML = filtered.map(t => {
      const isMergeSrc = mergeSourceId === t.id;
      const rowClass = isMergeSrc ? 'table-primary' : (mergeSourceId ? 'cursor-pointer' : '');
      return `<tr class="${rowClass}" data-tagid="${t.id}">
        <td class="fw-semibold">
          ${t.label_display}
          ${t.locked ? '<i class="bi bi-lock-fill text-muted ms-1 small"></i>' : ''}
        </td>
        <td><span class="badge bg-secondary tag-type-badge">${t.type}</span></td>
        <td class="text-center">
          <span class="badge ${(t.link_count||0) > 0 ? 'bg-secondary' : 'bg-light text-dark border'}">${t.link_count || 0}</span>
        </td>
        <td class="text-center">
          <button class="btn btn-ghost btn-sm" data-action="lock" data-id="${t.id}" data-locked="${t.locked}">
            <i class="bi bi-${t.locked ? 'lock-fill' : 'unlock'}"></i>
          </button>
        </td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="merge-start" data-id="${t.id}" ${t.locked ? 'disabled' : ''} title="Fusionner">
            <i class="bi bi-intersect"></i>
          </button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-tag" data-id="${t.id}" data-label="${t.label_display}" ${t.locked || (t.link_count||0)>0 ? 'disabled' : ''} title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    // Merge target click
    if (mergeSourceId) {
      $$('#tagsTableBody tr[data-tagid]').forEach(row => {
        if (row.dataset.tagid !== mergeSourceId) {
          row.classList.add('cds-clickable');
          row.addEventListener('click', () => executeMerge(mergeSourceId, row.dataset.tagid));
        }
      });
    }

    $$('[data-action="lock"]').forEach(b => b.addEventListener('click', () => toggleTagLock(b.dataset.id, b.dataset.locked !== 'true')));
    $$('[data-action="merge-start"]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); startMerge(b.dataset.id); }));
    $$('[data-action="del-tag"]').forEach(b => {
      b.addEventListener('click', () => confirmDelete(
        `Supprimer le tag "${b.dataset.label}" ?`,
        async () => { await window.bdb.from('tags').delete().eq('id', b.dataset.id); toast('Tag supprimé'); loadTags(); }
      ));
    });
  }

  async function toggleTagLock(id, lock) {
    await window.bdb.from('tags').update({ locked: lock }).eq('id', id);
    toast(lock ? 'Tag verrouillé' : 'Tag déverrouillé');
    loadTags();
  }

  function startMerge(id) {
    mergeSourceId = id;
    $('#mergeBanner').classList.add('active');
    renderTagsTable();
  }

  async function executeMerge(sourceId, targetId) {
    // Via RPC ou mise à jour manuelle des liens
    const { error } = await window.bdb.rpc('merge_tag', { source_id: sourceId, target_id: targetId });
    if (error) { toast('Erreur fusion : ' + error.message, 'danger'); return; }
    toast('Tags fusionnés');
    mergeSourceId = null;
    $('#mergeBanner').classList.remove('active');
    loadTags();
  }

  $('#btnCancelMerge').addEventListener('click', () => {
    mergeSourceId = null;
    $('#mergeBanner').classList.remove('active');
    renderTagsTable();
  });

  $('#tagsSearch').addEventListener('input', renderTagsTable);
  $('#tagsTypeFilter').addEventListener('change', renderTagsTable);
  $('#tagsViewFilter').addEventListener('change', renderTagsTable);
  $('#btnRefreshTags').addEventListener('click', loadTags);

  $('#btnDetectDupes').addEventListener('click', async () => {
    $('#tagsViewFilter').value = 'all';
    toast('Doublons : fonctionnalité via Edge Function — à implémenter', 'warning');
  });

  $('#btnDetectOrphans').addEventListener('click', () => {
    $('#tagsViewFilter').value = 'orphans';
    renderTagsTable();
    toast('Affichage filtré sur les tags orphelins');
  });

  $('#btnCleanupTags').addEventListener('click', () => {
    confirmDelete(
      'Supprimer tous les tags orphelins non verrouillés ?',
      async () => {
        const orphans = allTags.filter(t => !t.locked && !t.glossary_id && (t.link_count || 0) === 0);
        for (const t of orphans) {
          await window.bdb.from('tags').delete().eq('id', t.id);
        }
        toast(`${orphans.length} tag(s) supprimé(s)`);
        loadTags();
      }
    );
  });

  // ----------------------------------------------------------------
  // CLASSIFICATIONS
  // ----------------------------------------------------------------
  let activeClassif = 'types';
  let classifData   = {};

  const CLASSIF_TABS = {
    'types':           { label: 'Types de matériel',  table: 'materiel_types',       col3: 'Description' },
    'zones-anatomiques':{ label: 'Zones anatomiques', table: 'zones_anatomiques',     col3: 'Description' },
    'zones-stockage':  { label: 'Zones de stockage',  table: 'zones_stockage',        col3: 'Zone anatomique' },
    'etageres':        { label: 'Étagères',            table: 'etageres',             col3: 'Zone de stockage' },
  };

  $$('#classifTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#classifTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeClassif = btn.dataset.classif;
      const cfg = CLASSIF_TABS[activeClassif];
      $('#classifTableHeader').textContent = cfg.label;
      $('#classifCol3').textContent = cfg.col3;
      loadClassif();
    });
  });

  async function loadClassif() {
    $('#classifTableBody').innerHTML = skeletonRows(4, 5);
    const cfg = CLASSIF_TABS[activeClassif];
    try {
      let query = window.bdb.from(cfg.table).select('*').order('label');
      if (activeClassif === 'zones-stockage') {
        query = window.bdb.from(cfg.table).select('*, zones_anatomiques(label)').order('label');
      } else if (activeClassif === 'etageres') {
        query = window.bdb.from(cfg.table).select('*, zones_stockage(label)').order('label');
      }
      const { data, error } = await query;
      if (error) throw error;
      classifData[activeClassif] = data || [];
      renderClassifTable(data || []);
    } catch (err) {
      cdsShowGridError($('#classifTableBody').closest('.card-body'),
        'Impossible de charger les classifications.', loadClassif);
    }
  }

  function renderClassifTable(items) {
    if (!items.length) {
      $('#classifTableBody').innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">
        Aucun élément — <button class="btn btn-link btn-sm p-0" id="inlineNewClassif">Créer le premier</button>
      </td></tr>`;
      $('#inlineNewClassif')?.addEventListener('click', () => openClassifModal(null));
      return;
    }
    $('#classifTableBody').innerHTML = items.map(item => {
      const col3 = activeClassif === 'zones-stockage' ? (item.zones_anatomiques?.label || '—')
                 : activeClassif === 'etageres'       ? (item.zones_stockage?.label || '—')
                 : (item.description || '—');
      const iconBg = item.color || '#6b7280';
      const iconHtml = (activeClassif === 'types') ? `<div class="zone-icon" style="background:${iconBg};"><i class="bi bi-box-seam text-white small"></i></div>`<!-- style= OK : couleur Supabase D-2026-03-15-T04 -->
                     : (activeClassif === 'zones-anatomiques') ? `<div class="zone-icon" style="background:${iconBg};"><i class="bi bi-activity text-white small"></i></div>`<!-- style= OK : couleur Supabase D-2026-03-15-T04 -->
                     : (activeClassif === 'zones-stockage') ? `<div class="zone-icon bg-secondary bg-opacity-25"><i class="bi bi-archive text-secondary small"></i></div>`
                     : `<div class="zone-icon bg-secondary bg-opacity-25"><i class="bi bi-layers text-secondary small"></i></div>`;
      return `<tr>
        <td>${iconHtml}</td>
        <td class="fw-semibold">${item.label}</td>
        <td class="text-muted small">${col3}</td>
        <td><span class="badge ${item.active ? 'bg-success' : 'bg-secondary'}">${item.active ? 'Actif' : 'Inactif'}</span></td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-classif" data-id="${item.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-classif" data-id="${item.id}" data-label="${item.label}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('');

    $$('[data-action="edit-classif"]').forEach(b => {
      const item = classifData[activeClassif].find(i => i.id === b.dataset.id);
      b.addEventListener('click', () => openClassifModal(item));
    });
    $$('[data-action="del-classif"]').forEach(b => {
      b.addEventListener('click', () => confirmDelete(
        `Supprimer "${b.dataset.label}" ?`,
        async () => {
          const tbl = CLASSIF_TABS[activeClassif].table;
          await window.bdb.from(tbl).delete().eq('id', b.dataset.id);
          toast('Élément supprimé');
          loadClassif();
        }
      ));
    });
  }

  $('#btnNewClassif').addEventListener('click', () => openClassifModal(null));

  const modalClassif = new bootstrap.Modal('#modalClassif');

  function openClassifModal(item) {
    const isEdit = !!item;
    const cfg = CLASSIF_TABS[activeClassif];
    $('#modalClassifTitle').textContent = `${isEdit ? 'Modifier' : 'Nouveau'} — ${cfg.label}`;
    $('#btnSaveClassif').textContent = isEdit ? 'Enregistrer' : 'Créer';
    $('#modalClassifBody').dataset.editId = isEdit ? item.id : '';
    $('#modalClassifBody').dataset.editMode = isEdit ? '1' : '';

    let fields = `<div id="classifError" class="alert alert-danger d-none small"></div>
      <div class="mb-3">
        <label class="form-label form-label-sm">Label *</label>
        <input type="text" class="form-control form-control-sm" id="classifLabel" value="${item ? item.label : ''}">
      </div>`;

    if (activeClassif === 'types' || activeClassif === 'zones-anatomiques') {
      fields += `<div class="mb-3">
        <label class="form-label form-label-sm">Description</label>
        <input type="text" class="form-control form-control-sm" id="classifDesc" value="${item?.description || ''}">
      </div>
      <div class="mb-3">
        <label class="form-label form-label-sm d-block mb-2">Couleur</label>
        <div class="d-flex flex-wrap gap-2" id="classifColorPicker">
          ${COLORS.map(c => `<button type="button" class="color-picker-btn ${(item?.color||'#0ea5e9')===c.v?'selected':''}" data-color="${c.v}" style="background:${c.v};" title="${c.l}"></button>`/* style= OK : couleur dynamique picker D-2026-03-15-T04 */).join('')}
        </div>
      </div>`;
    }

    if (activeClassif === 'zones-stockage') {
      const zaOptions = (classifData['zones-anatomiques'] || [])
        .filter(z => z.active)
        .map(z => `<option value="${z.id}" ${item?.zone_anatomique_id===z.id?'selected':''}>${z.label}</option>`)
        .join('');
      fields += `<div class="mb-3">
        <label class="form-label form-label-sm">Zone anatomique</label>
        <select class="form-select form-select-sm" id="classifZoneAnat">
          <option value="">Aucune</option>${zaOptions}
        </select>
      </div>`;
    }

    if (activeClassif === 'etageres') {
      const zsOptions = (classifData['zones-stockage'] || [])
        .filter(z => z.active)
        .map(z => `<option value="${z.id}" ${item?.zone_stockage_id===z.id?'selected':''}>${z.label}</option>`)
        .join('');
      fields += `<div class="mb-3">
        <label class="form-label form-label-sm">Zone de stockage *</label>
        <select class="form-select form-select-sm" id="classifZoneStock">
          <option value="">Sélectionner...</option>${zsOptions}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label form-label-sm">Position</label>
        <input type="number" class="form-control form-control-sm" id="classifPos" min="1" value="${item?.position||1}">
      </div>`;
    }

    fields += `<div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" id="classifActive" ${item?.active !== false ? 'checked' : ''}>
      <label class="form-check-label form-label-sm" for="classifActive">Actif</label>
    </div>`;

    $('#modalClassifBody').innerHTML = fields;

    // Color picker events in modal
    $$('#classifColorPicker .color-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#classifColorPicker .color-picker-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    modalClassif.show();
  }

  $('#btnSaveClassif').addEventListener('click', async () => {
    const label   = $('#classifLabel')?.value.trim();
    const active  = $('#classifActive')?.checked ?? true;
    const isEdit  = $('#modalClassifBody').dataset.editMode === '1';
    const editId  = $('#modalClassifBody').dataset.editId;
    const errEl   = $('#classifError');
    const tbl     = CLASSIF_TABS[activeClassif].table;
    const selColor = $('#classifColorPicker')?.querySelector('.selected')?.dataset.color || '#0ea5e9';

    if (!label) { errEl.textContent = 'Le label est obligatoire.'; errEl.classList.remove('d-none'); return; }
    errEl.classList.add('d-none');

    let payload = { label, active };

    if (activeClassif === 'types' || activeClassif === 'zones-anatomiques') {
      payload.description = $('#classifDesc')?.value.trim() || '';
      payload.color = selColor;
      payload.icon = activeClassif === 'types' ? 'Package' : 'Bone';
    }
    if (activeClassif === 'zones-stockage') {
      payload.zone_anatomique_id = $('#classifZoneAnat')?.value || null;
    }
    if (activeClassif === 'etageres') {
      const zs = $('#classifZoneStock')?.value;
      if (!zs) { errEl.textContent = 'La zone de stockage est obligatoire.'; errEl.classList.remove('d-none'); return; }
      payload.zone_stockage_id = zs;
      payload.position = parseInt($('#classifPos')?.value) || 1;
    }

    const { error } = isEdit
      ? await window.bdb.from(tbl).update(payload).eq('id', editId)
      : await window.bdb.from(tbl).insert(payload);

    if (error) { errEl.textContent = error.message; errEl.classList.remove('d-none'); return; }
    toast(isEdit ? 'Mise à jour effectuée' : 'Élément créé');
    modalClassif.hide();
    // Reload aussi les zones-anatomiques si on était sur zones-stockage (pour les sélects)
    if (activeClassif === 'zones-anatomiques') classifData['zones-anatomiques'] = null;
    if (activeClassif === 'zones-stockage')    classifData['zones-stockage'] = null;
    loadClassif();
  });

  // ----------------------------------------------------------------
  // CONFIRM DELETE GÉNÉRIQUE
  // ----------------------------------------------------------------
  function confirmDelete(msg, onConfirm) {
    $('#confirmDeleteMsg').textContent = msg;
    const modal = new bootstrap.Modal('#modalConfirmDelete');
    modal.show();
    const handler = () => {
      modal.hide();
      onConfirm();
      $('#btnConfirmDelete').removeEventListener('click', handler);
    };
    $('#btnConfirmDelete').addEventListener('click', handler);
  }

  // ----------------------------------------------------------------
  // SKELETON HELPER
  // ----------------------------------------------------------------
  function skeletonRows(rows, cols) {
    return Array.from({ length: rows }).map(() =>
      `<tr>${Array.from({ length: cols }).map(() =>
        `<td><div class="admin-skeleton" style="height:16px;width:${60+Math.random()*80}px;"></div></td>`<!-- style= OK : valeur calculée JS D-2026-03-15-T04 -->
      ).join('')}</tr>`
    ).join('');
  }

  // ----------------------------------------------------------------
  // INIT : charger le premier tab
  // ----------------------------------------------------------------
  loadDashboard();

}); // DOMContentLoaded

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

