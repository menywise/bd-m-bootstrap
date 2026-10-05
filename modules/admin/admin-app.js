document.addEventListener('DOMContentLoaded', async () => {

  // ── SHELL AUTH — attend que bdb-shell.js ait initialisé l'auth ──
  await window.bdbShellReady;

  var _escEl = document.createElement('span');
  function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

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
  let _allFonctions  = await window.bdbFonctions.load();

  // FONC_LABELS — map code → label depuis bdbFonctions
  const FONC_LABELS = Object.fromEntries((_allFonctions || []).map(f => [f.code, f.label]));

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
    modules:         $('#tabModules'),
    faq:             $('#tabFaq'),
    gouvernance:     $('#tabGouvernance'),
    annuaire:        $('#tabAnnuaire'),
    preferences:     $('#tabPreferences'),
    metier:          $('#tabMetier'),
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
      if (key === 'modules')         loadModules();
      if (key === 'faq')             loadFaqAdmin();
      if (key === 'gouvernance')     loadGouvernance();
      if (key === 'annuaire')        window.initAnnuaireAdmin?.();
      if (key === 'preferences')     window.initPreferencesAdmin?.();
      if (key === 'metier')          loadModulesMetier();
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
        { count: tagCnt },
        { count: tagPendingCnt },
        { count: tagOldCnt },
        { count: cnt404 }
      ] = await Promise.all([
        window.bdb.from('profiles_directory').select('fonction, approved'),
        window.bdb.from('user_roles').select('role'),
        window.bdb.from('transmissions').select('*', { count: 'exact', head: true }),
        window.bdb.from('tags').select('*', { count: 'exact', head: true }),
        window.bdb.from('tag_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        window.bdb.from('tag_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pending').lt('created_at', new Date(Date.now() - 3 * 86400000).toISOString()),
        window.bdb.from('error_404_logs').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString()),
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
        $('#statAides').textContent      = byF['aide_soignant'] || 0;


      }

      $('#statTransmissions').textContent = transCnt ?? '—';
      $('#statTransSub').textContent = 'total';
      $('#statTags').textContent = tagCnt ?? '—';

      document.getElementById('val-tags-pending').textContent = tagPendingCnt ?? 0;
      document.getElementById('stat-tags-pending-loading')?.classList.add('d-none');
      document.getElementById('stat-tags-pending')?.classList.remove('d-none');
      if ((tagOldCnt ?? 0) > 0) document.getElementById('badge-tags-old')?.classList.remove('d-none');

      document.getElementById('val-404').textContent = cnt404 ?? 0;
      document.getElementById('stat-404-loading')?.classList.add('d-none');
      document.getElementById('stat-404')?.classList.remove('d-none');

    } catch (err) {
      // U-ADMIN-01 : gestion d'erreur dashboard
      cdsShowOfflineBanner('Impossible de charger le dashboard — vérifiez votre connexion.');
      cdsShowGridError($('#fonctionStats'), 'Les données tardent à arriver — réessayez dans un instant.', loadDashboard);
      ['statTotalUsers','statPending','statTransmissions','statTags'].forEach(id => {
        const el = $('#' + id);
        if (el) el.textContent = '—';
      });
      ['val-tags-pending','val-404'].forEach(id => {
        const el = document.getElementById(id);
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
          .select('id, user_id, prenom, nom, email, fonction, avatar_url, approved, chirurgien_id, is_suspended')
          .order('nom'),
        window.bdb.from('user_roles').select('user_id, role'),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;

      const roleMap = {};
      (roles || []).forEach(r => roleMap[r.user_id] = r);

      allUsers = (profs || []).map(p => ({
        ...p,
        role:         (roleMap[p.user_id] || {}).role || 'membre',
        approved:     p.approved ?? false,
        is_suspended: p.is_suspended ?? false,
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
        <div class="admin-avatar-sm text-white" style="background:${avatarBg(u.role)};">${escHtml(initials(u))}</div><!-- style= OK : couleur calculée JS D-2026-03-15-T04 -->
        <div class="flex-grow-1 small">
          <div class="fw-semibold">${escHtml(u.prenom || '')} ${escHtml(u.nom || '')}</div>
          ${u.email ? '<div class="text-muted cds-text-xs">'+escHtml(u.email)+'</div>' : ''}
        </div>
        <button class="btn btn-sm btn-outline-success" data-action="approve" data-uid="${escHtml(u.user_id)}">
          <i class="bi bi-check"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete-pending"
          data-uid="${escHtml(u.user_id)}"
          data-name="${escHtml(((u.prenom || '') + ' ' + (u.nom || '')).trim() || u.email || '?')}">
          <i class="bi bi-trash"></i>
        </button>
      </li>`).join('');

    $$('#pendingList [data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', () => handleApproval(btn.dataset.uid, true));
    });
    $$('#pendingList [data-action="delete-pending"]').forEach(btn => {
      btn.addEventListener('click', () => deletePendingUser(btn.dataset.uid, btn.dataset.name));
    });
  }

  async function deletePendingUser(userId, name) {
    if (!confirm(`Supprimer "${name}" ?\n\nSupprime le profil et le rôle.\nLe compte auth reste — à supprimer dans Supabase Dashboard > Authentication > Users.`)) return;
    const [r1, r2] = await Promise.all([
      window.bdb.from('user_roles').delete().eq('user_id', userId).select(),
      window.bdb.from('profiles_directory').delete().eq('user_id', userId).select(),
    ]);
    if (r1.error || r2.error) {
      toast("La suppression a rencontré une difficulté — contactez l'administrateur", 'danger');
      return;
    }
    toast(`"${name}" supprimé. Compte auth à supprimer manuellement.`, 'warning');
    loadUsers();
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
            <div class="admin-avatar-sm text-white flex-shrink-0" style="background:${avatarBg(u.role)};">${escHtml(initials(u))}</div><!-- style= OK : couleur calculée JS D-2026-03-15-T04 -->
            <span class="fw-semibold">${escHtml(u.prenom || '')} ${escHtml(u.nom || '')}</span>
            ${u.chirurgien_id ? '<span class="badge bg-danger-subtle text-danger ms-1" title="Chirurgien lié au thesaurus"><i class="bi bi-clipboard2-pulse"></i></span>' : ''}
            ${u.is_suspended ? '<span class="badge bg-warning text-dark ms-1"><i class="bi bi-pause-circle me-1"></i>Suspendu</span>' : ''}
          </div>
        </td>
        <td class="d-none d-md-table-cell text-muted small">${escHtml(u.email || '—')}</td>
        <td class="d-none d-lg-table-cell">
          <span class="badge bg-light text-dark border">${escHtml(FONC_LABELS[u.fonction] || u.fonction || '—')}</span>
        </td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'invite' ? 'badge-invite' : 'badge-membre'}">
            ${escHtml(ROLE_LABELS[u.role] || u.role)}
          </span>
        </td>
        <td>
          <span class="badge border ${u.approved ? 'badge-approved' : 'badge-pending'}">
            ${u.approved ? 'Approuvé' : 'En attente'}
          </span>
        </td>
        <td>
          ${u.user_id !== window.bdbUser?.id ? `
          <button class="btn btn-ghost btn-sm" data-action="edit" data-uid="${escHtml(u.user_id)}" title="Modifier ce membre">
            <i class="bi bi-pencil-square"></i>
          </button>` : ''}
        </td>
      </tr>`).join('');

    renderUsersPagination(filtered.length, usersPage, totalPages);

    // Events
    $$('#usersTableBody [data-action="edit"]').forEach(b => {
      b.addEventListener('click', () => openMembreModal(b.dataset.uid));
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
        <div class="admin-avatar-sm text-white flex-shrink-0" style="background:#0ea5e9;">${escHtml(((prenom||'?')[0]+(nom||'?')[0]).toUpperCase())}</div><!-- style= OK : couleur fixe D-2026-03-15-T04 -->
        <div>
          <div class="fw-semibold">${escHtml(displayName)}</div>
          ${email ? `<div class="text-muted small">${escHtml(email)}</div>` : ''}
          <span class="badge bg-light text-dark border mt-1">${escHtml(foncLabel)}</span>
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
      .eq('user_id', userId).select();
    if (error) { toast("La mise à jour n'a pu aboutir — réessayez dans un instant", 'danger'); return; }
    toast(approve ? "Accès accordé — le membre peut maintenant se connecter" : "Accès retiré pour ce membre");
    loadUsers();
  }

  // ── Actions compte via Edge Function delete-user ──────────────────
  // ── Helper fetch direct vers admin-update-user ─────────────────────
  // Utilise raw fetch + token explicite (functions.invoke ne transmet pas
  // toujours le token correctement selon la version SDK)
  const ADMIN_UPDATE_URL = 'https://ecpzrygzdugwwkqbsajn.supabase.co/functions/v1/admin-update-user';
  const ANON_KEY = 'sb_publishable_jc9PQQF85LgiPwHxnevqTQ_q8nWd4es';

  async function callAdminUpdate(body) {
    const { data: { session } } = await window.bdb.auth.getSession();
    if (!session) throw new Error("Votre session s'est endormie — un rechargement suffit");
    const res = await fetch(ADMIN_UPDATE_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + session.access_token,
        'apikey': ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Une difficulté est survenue — réessayez ou contactez l'administrateur");
    return json;
  }

  async function callDeleteUser(action, targetUserId, targetName) {
    try {
      const { data: { session } } = await window.bdb.auth.getSession();
      if (!session) { toast("Votre session s'est endormie — un rechargement suffit", 'danger'); return; }
      const res = await fetch(
        'https://ecpzrygzdugwwkqbsajn.supabase.co/functions/v1/delete-user',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + session.access_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ target_user_id: targetUserId, action }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        toast(json.error || "Une difficulté est survenue — réessayez ou contactez l'administrateur", 'danger');
        return;
      }
      const MSGS = {
        'suspend':      escHtml(targetName) + ' suspendu(e)',
        'reactivate':   escHtml(targetName) + ' réactivé(e)',
        'delete':       escHtml(targetName) + ' supprimé(e)',
        'delete-rgpd':  escHtml(targetName) + ' supprimé(e) — RGPD',
      };
      toast(MSGS[action] || 'Action effectuée');
      loadUsers();
    } catch (err) {
      toast("La connexion a rencontré une difficulté — réessayez dans un instant", 'danger');
    }
  }

  $('#usersSearch').addEventListener('input', () => { usersPage = 1; renderUsersTable(); });
  $('#usersRoleFilter').addEventListener('change', () => { usersPage = 1; renderUsersTable(); });
  $('#usersApprovedFilter').addEventListener('change', () => { usersPage = 1; renderUsersTable(); });

  // ----------------------------------------------------------------
  // CRUD MEMBRE — modalMembre (Read + Update + Delete)
  // Remplace : openEditProfileModal + dropdown ⋮ multiligne
  // ----------------------------------------------------------------
  const modalMembre = new bootstrap.Modal('#modalMembre');
  let _currentMembreUid       = null;
  let _currentMembreOrigEmail = '';
  let _currentMembreOrigRole  = '';

  async function openMembreModal(userId) {
    const u = allUsers.find(u => u.user_id === userId);
    if (!u) return;

    _currentMembreUid       = userId;
    _currentMembreOrigEmail = u.email || '';
    _currentMembreOrigRole  = u.role  || 'membre';

    // Reset alert
    const alertEl = $('#membreAlert');
    alertEl.className = 'alert d-none small';

    // Avatar + identité dans le header
    const av = $('#membreModalAvatar');
    av.textContent = initials(u);
    av.style.background = avatarBg(u.role);/* style= OK : couleur calculée JS D-2026-03-15-T04 */
    $('#membreModalTitle').textContent    = (`${u.prenom || ''} ${u.nom || ''}`).trim() || 'Membre';
    $('#membreModalSubtitle').textContent = u.email || '—';

    // Identité
    $('#membrePrenom').value = u.prenom || '';
    $('#membreNom').value    = u.nom    || '';
    $('#membreEmail').value  = u.email  || '';

    // Profil & accès
    window.bdbFonctions.populate($('#membreFonction'), { placeholder: false });
    $('#membreFonction').value  = u.fonction || '';
    $('#membreRole').value      = u.role     || 'membre';
    $('#membreApproved').checked   = u.approved;
    $('#membreSuspended').checked  = u.is_suspended;

    // Chirurgien (conditionnel)
    const wrap = $('#membreChirurgienWrap');
    const sel  = $('#membreChirurgienId');
    if (u.fonction === 'chirurgien') {
      wrap.classList.remove('d-none');
      sel.innerHTML = '<option value="">Chargement\u2026</option>';
      modalMembre.show();
      const { data: chirurgiens } = await window.bdb
        .from('thesaurus_chirurgiens')
        .select('id, nom, prenom, specialite, actif')
        .order('nom');
      sel.innerHTML = '<option value="">\u2014 Aucun lien \u2014</option>';
      (chirurgiens || []).forEach(c => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = (c.actif ? '' : '[Inactif] ') + c.nom + ' ' + (c.prenom || '') + ' (' + (c.specialite || '') + ')';
        sel.appendChild(o);
      });
      sel.value = u.chirurgien_id || '';
    } else {
      wrap.classList.add('d-none');
      sel.value = '';
      modalMembre.show();
    }
  }

  // Afficher/masquer le bloc chirurgien quand la fonction change dans la modale
  $('#membreFonction').addEventListener('change', () => {
    const wrap = $('#membreChirurgienWrap');
    if ($('#membreFonction').value === 'chirurgien') {
      wrap.classList.remove('d-none');
    } else {
      wrap.classList.add('d-none');
      $('#membreChirurgienId').value = '';
    }
  });

  // ── Enregistrer les modifications ─────────────────────────────────
  $('#btnMembreSave').addEventListener('click', async () => {
    const uid          = _currentMembreUid;
    const prenom       = $('#membrePrenom').value.trim();
    const nom          = $('#membreNom').value.trim();
    const email        = $('#membreEmail').value.trim();
    const fonction     = $('#membreFonction').value;
    const role         = $('#membreRole').value;
    const approved     = $('#membreApproved').checked;
    const is_suspended = $('#membreSuspended').checked;
    const alertEl      = $('#membreAlert');

    if (!prenom || !nom) {
      alertEl.className = 'alert alert-danger small';
      alertEl.textContent = 'Le prénom et le nom sont nécessaires pour continuer.';
      return;
    }
    alertEl.className = 'alert d-none small';
    $('#btnMembreSave').disabled = true;

    try {
      // 1. Email modifié dans auth.users — seulement si le membre a un compte auth
      // Pour les profils orphelins, l'email est mis à jour dans profiles_directory uniquement (étape 2)
      if (email && email !== _currentMembreOrigEmail) {
        const { data: authCheck } = await window.bdb
          .from('profiles_directory')
          .select('user_id')
          .eq('user_id', _currentMembreUid)
          .single();
        // Tenter la mise à jour auth seulement si le profil a un user_id valide
        // L'échec est silencieux — profiles_directory sera mis à jour dans tous les cas
        if (authCheck) {
          try { await callAdminUpdate({ action: 'update-email', target_user_id: uid, email }); } catch {}
        }
      }

      // 2. Profil complet → profiles_directory
      const payload = { prenom, nom, email, fonction, approved, is_suspended };
      if (!$('#membreChirurgienWrap').classList.contains('d-none')) {
        payload.chirurgien_id = $('#membreChirurgienId').value || null;
      }
      const { error: e1 } = await window.bdb
        .from('profiles_directory')
        .update(payload)
        .eq('user_id', uid).select();
      if (e1) throw e1;

      // 3. Rôle modifié → user_roles
      if (role !== _currentMembreOrigRole) {
        const { error: e2 } = await window.bdb
          .from('user_roles')
          .update({ role })
          .eq('user_id', uid).select();
        if (e2) throw e2;
      }

      toast('Membre mis à jour');
      modalMembre.hide();
      loadUsers();
    } catch (err) {
      alertEl.className = 'alert alert-danger small';
      alertEl.textContent = err.message || 'La mise à jour n\'a pu aboutir — réessayez dans un instant.';
    } finally {
      $('#btnMembreSave').disabled = false;
    }
  });

  // ── Lien de première connexion / récupération ──────────────────────
  $('#btnMembreRecovery').addEventListener('click', async () => {
    const uid   = _currentMembreUid;
    const email = $('#membreEmail').value.trim();
    const name  = `${$('#membrePrenom').value} ${$('#membreNom').value}`.trim();
    if (!email) {
      const alertEl = $('#membreAlert');
      alertEl.className = 'alert alert-warning small';
      alertEl.textContent = 'Aucun email renseigné — ajoutez-en un dans le profil du membre.';
      return;
    }
    if (!confirm(`Envoyer un lien de connexion à ${name} (${email}) ?`)) return;
    $('#btnMembreRecovery').disabled = true;
    try {
      await callAdminUpdate({
        action:          'create-and-invite',
        target_user_id:  uid,
        email,
        prenom:          $('#membrePrenom').value.trim(),
        nom:             $('#membreNom').value.trim(),
        fonction:        $('#membreFonction').value,
        redirect_to:     window.location.origin + '/bdb/reset-password.html',
      });
      toast(`Lien envoyé à ${email}`, 'success');
      modalMembre.hide();
    } catch (err) {
      const alertEl = $('#membreAlert');
      alertEl.className = 'alert alert-danger small';
      alertEl.textContent = err.message;
    } finally {
      $('#btnMembreRecovery').disabled = false;
    }
  });

  // ── Suppression depuis la zone danger de la modale ─────────────────
  $('#btnMembreDelete').addEventListener('click', () => {
    const uid  = _currentMembreUid;
    const name = `${$('#membrePrenom').value} ${$('#membreNom').value}`.trim();
    if (!confirm(`Supprimer définitivement ${name} ?\nSes données personnelles seront effacées, ses contributions anonymisées.`)) return;
    modalMembre.hide();
    callDeleteUser('delete', uid, name);
  });

  $('#btnMembreDeleteRgpd').addEventListener('click', () => {
    const uid  = _currentMembreUid;
    const name = `${$('#membrePrenom').value} ${$('#membreNom').value}`.trim();
    if (!confirm(`DROIT À L'OUBLI — ${name}\nToutes les données et contributions seront définitivement supprimées.\nCette action est irréversible. Continuer ?`)) return;
    if (!confirm(`Confirmer la suppression RGPD de ${name} ?\nAucun retour en arrière possible.`)) return;
    modalMembre.hide();
    callDeleteUser('delete-rgpd', uid, name);
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
  $('#btnAddUser').addEventListener('click', () => {
    ['createPrenom','createNom','createEmail'].forEach(id => $('#' + id).value = '');
    $('#createUserError').classList.add('d-none');
    window.bdbFonctions.populate($('#createFonction'), { placeholder: true, grouped: true });
    modalCreateUser.show();
  });

  $('#btnExportCSV').addEventListener('click', exportUsersCSV);

  // Génère un mot de passe aléatoire fort (jamais affiché — remplacé par le membre via le lien)
  function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    return Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => chars[b % chars.length]).join('');
  }

  $('#btnSubmitCreateUser').addEventListener('click', async () => {
    const prenom   = $('#createPrenom').value.trim();
    const nom      = $('#createNom').value.trim();
    const email    = $('#createEmail').value.trim();
    const fonction = $('#createFonction').value;
    const role     = $('#createRole').value;

    const errEl = $('#createUserError');
    if (!prenom || !nom || !email) {
      errEl.textContent = 'Le prénom, le nom et l\'email sont nécessaires pour continuer.';
      errEl.classList.remove('d-none');
      return;
    }
    errEl.classList.add('d-none');
    $('#btnSubmitCreateUser').disabled = true;
    $('#btnSubmitCreateUser').innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Création…';

    try {
      // 1. Créer le compte via admin-update-user action create-user
      const password = generateTempPassword();
      const data = await callAdminUpdate({ action: 'create-user', email, password, nom, prenom, fonction, role });

      // 2. Envoyer automatiquement le lien de première connexion
      const userId = data?.user_id;
      if (userId) {
        try {
          await callAdminUpdate({
            action: 'send-recovery',
            target_user_id: userId,
            email,
            redirect_to: window.location.origin + '/bdb/reset-password.html',
          });
          toast(`${prenom} ${nom} créé — lien envoyé à ${email}`);
        } catch {
          toast(`${prenom} ${nom} créé — lien non envoyé (vérifier email)`, 'warning');
        }
      } else {
        toast(`${prenom} ${nom} créé`);
      }

      modalCreateUser.hide();
      loadUsers();
    } catch (err) {
      errEl.textContent = err.message || 'La création n\'a pu aboutir — réessayez dans un instant.';
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
    $('#confirmDeleteMsg').textContent = 'Retirer tous les membres (sauf admins) définitivement ? Cette action ne peut pas être annulée.';
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
          await window.bdb.from('user_roles').delete().eq('user_id', u.user_id).select();
          await window.bdb.from('profiles_directory').delete().eq('user_id', u.user_id).select();
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
    const pillsEl = $('#categoryPills');
    if (pillsEl) pillsEl.innerHTML = `<li class="nav-item"><span class="nav-link disabled text-muted small">Chargement...</span></li>`;
    try {
      const { data, error } = await window.bdb.from('content_types').select('id, code, label').order('label');
      if (error) throw error;
      contentTypes = data || [];
      if (!pillsEl) return;
      if (!contentTypes.length) {
        pillsEl.innerHTML = `<li class="nav-item"><span class="nav-link disabled text-muted small">Aucun module</span></li>`;
        return;
      }
      pillsEl.innerHTML = contentTypes.map(ct => `
        <li class="nav-item">
          <button class="nav-link" data-ct-id="${escHtml(ct.id)}" data-ct-label="${escHtml(ct.label)}">
            ${escHtml(ct.label)}
          </button>
        </li>`).join('');
      $$('#categoryPills button').forEach(btn => {
        btn.addEventListener('click', () => selectCategoryPill(btn));
      });
    } catch (err) {
      cdsShowGridError($('#categoriesTableBody')?.closest('.card-body') || $('#categoriesEmptyMsg').parentElement,
        'Impossible de charger les modules.', loadContentTypes);
    }
  }

  function selectCategoryPill(btn) {
    $$('#categoryPills button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentContentTypeId = btn.dataset.ctId || null;
    if (!currentContentTypeId) {
      $('#categoriesEmptyMsg').classList.remove('d-none');
      $('#categoriesTableCard').classList.add('d-none');
      $('#btnAddCategory').disabled = true;
      return;
    }
    $('#btnAddCategory').disabled = false;
    $('#categoriesTableHeader').textContent = `Catégories — ${btn.dataset.ctLabel}`;
    $('#categoriesEmptyMsg').classList.add('d-none');
    $('#categoriesTableCard').classList.remove('d-none');
    loadCategories();
  }

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
        <td class="fw-semibold">${escHtml(c.label)}</td>
        <td class="d-none d-sm-table-cell text-muted small">${escHtml(c.color)}</td>
        <td><span class="badge ${c.active ? 'bg-success' : 'bg-secondary'}">${c.active ? 'Active' : 'Inactive'}</span></td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-cat" data-id="${escHtml(c.id)}" data-label="${escHtml(c.label)}" data-color="${escHtml(c.color)}" data-active="${c.active}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-cat" data-id="${escHtml(c.id)}" data-label="${escHtml(c.label)}">
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
          await window.bdb.from('categories').delete().eq('id', b.dataset.id).select();
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

  $('#btnAddCategory').addEventListener('click', () => openCategoryModal(null));

  $('#btnSaveCategorie').addEventListener('click', async () => {
    const label  = $('#categorieLabel').value.trim();
    const active = $('#categorieActive').checked;
    const isEdit = $('#categorieModeEdit').value === '1';
    const id     = $('#categorieEditId').value;
    const errEl  = $('#categorieError');

    if (!label) { errEl.textContent = 'Un label est nécessaire pour continuer.'; errEl.classList.remove('d-none'); return; }
    errEl.classList.add('d-none');

    const payload = { label, color: selectedColor, active, icon: 'FileText' };
    if (!isEdit) payload.content_type_id = currentContentTypeId;

    const { error } = isEdit
      ? await window.bdb.from('categories').update(payload).eq('id', id).select()
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
        .select('id, label_display, label_normalized, type, is_locked')
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
      return `<tr class="${rowClass}" data-tagid="${escHtml(t.id)}">
        <td class="fw-semibold">
          ${escHtml(t.label_display)}
          ${t.is_locked ? '<i class="bi bi-lock-fill text-muted ms-1 small"></i>' : ''}
        </td>
        <td><span class="badge bg-secondary tag-type-badge">${escHtml(t.type)}</span></td>
        <td class="text-center">
          <span class="badge ${(t.link_count||0) > 0 ? 'bg-secondary' : 'bg-light text-dark border'}">${t.link_count || 0}</span>
        </td>
        <td class="text-center">
          <button class="btn btn-ghost btn-sm" data-action="lock" data-id="${escHtml(t.id)}" data-locked="${t.is_locked}">
            <i class="bi bi-${t.is_locked ? 'lock-fill' : 'unlock'}"></i>
          </button>
        </td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="merge-start" data-id="${escHtml(t.id)}" ${t.is_locked ? 'disabled' : ''} title="Fusionner">
            <i class="bi bi-intersect"></i>
          </button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-tag" data-id="${escHtml(t.id)}" data-label="${escHtml(t.label_display)}" ${t.is_locked || (t.link_count||0)>0 ? 'disabled' : ''} title="Supprimer">
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
        async () => { await window.bdb.from('tags').delete().eq('id', b.dataset.id).select(); toast('Tag supprimé'); loadTags(); }
      ));
    });
  }

  async function toggleTagLock(id, lock) {
    await window.bdb.from('tags').update({ is_locked: lock }).eq('id', id).select();
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
        const orphans = allTags.filter(t => !t.is_locked && !t.glossary_id && (t.link_count || 0) === 0);
        for (const t of orphans) {
          await window.bdb.from('tags').delete().eq('id', t.id).select();
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
      const iconHtml = (activeClassif === 'types') ? `<div class="zone-icon" style="background:${iconBg};"><i class="bi bi-box-seam text-white small"></i></div>`/* style= OK : couleur Supabase D-2026-03-15-T04 */
                     : (activeClassif === 'zones-anatomiques') ? `<div class="zone-icon" style="background:${iconBg};"><i class="bi bi-activity text-white small"></i></div>`/* style= OK : couleur Supabase D-2026-03-15-T04 */
                     : (activeClassif === 'zones-stockage') ? `<div class="zone-icon bg-secondary bg-opacity-25"><i class="bi bi-archive text-secondary small"></i></div>`
                     : `<div class="zone-icon bg-secondary bg-opacity-25"><i class="bi bi-layers text-secondary small"></i></div>`;
      return `<tr>
        <td>${iconHtml}</td>
        <td class="fw-semibold">${escHtml(item.label)}</td>
        <td class="text-muted small">${escHtml(col3)}</td>
        <td><span class="badge ${item.active ? 'bg-success' : 'bg-secondary'}">${item.active ? 'Actif' : 'Inactif'}</span></td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-classif" data-id="${escHtml(item.id)}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-ghost btn-sm text-danger" data-action="del-classif" data-id="${escHtml(item.id)}" data-label="${escHtml(item.label)}"><i class="bi bi-trash"></i></button>
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
          await window.bdb.from(tbl).delete().eq('id', b.dataset.id).select();
          toast('Élément supprimé');
          loadClassif();
        }
      ));
    });
  }

  $('#btnAddClassif').addEventListener('click', () => openClassifModal(null));

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
        <input type="text" class="form-control form-control-sm" id="classifLabel" value="${escHtml(item ? item.label : '')}">
      </div>`;

    if (activeClassif === 'types' || activeClassif === 'zones-anatomiques') {
      fields += `<div class="mb-3">
        <label class="form-label form-label-sm">Description</label>
        <input type="text" class="form-control form-control-sm" id="classifDesc" value="${escHtml(item?.description || '')}">
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
        .map(z => `<option value="${escHtml(z.id)}" ${item?.zone_anatomique_id===z.id?'selected':''}>${escHtml(z.label)}</option>`)
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
        .map(z => `<option value="${escHtml(z.id)}" ${item?.zone_stockage_id===z.id?'selected':''}>${escHtml(z.label)}</option>`)
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

    if (!label) { errEl.textContent = 'Un label est nécessaire pour continuer.'; errEl.classList.remove('d-none'); return; }
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
      if (!zs) { errEl.textContent = 'Une zone de stockage est nécessaire pour continuer.'; errEl.classList.remove('d-none'); return; }
      payload.zone_stockage_id = zs;
      payload.position = parseInt($('#classifPos')?.value) || 1;
    }

    const { error } = isEdit
      ? await window.bdb.from(tbl).update(payload).eq('id', editId).select()
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
  // MODULES — app_modules + app_groups
  // ----------------------------------------------------------------
  let _modData    = [];
  let _groupsData = [];

  // Sous-onglets modulesTabs
  $$('#modulesTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#modulesTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sub = btn.dataset.subtab;
      $('#subModList').classList.toggle('d-none',   sub !== 'mod-list');
      $('#subModGroups').classList.toggle('d-none', sub !== 'mod-groups');
    });
  });

  async function loadModules() {
    $('#tbodyModules').innerHTML = skeletonRows(5, 6);
    $('#tbodyGroups').innerHTML  = skeletonRows(4, 6);
    try {
      const [modRes, grpRes] = await Promise.all([
        window.bdb.from('app_modules')
          .select('*, app_groups(key, label, color)')
          .order('position'),
        window.bdb.from('app_groups')
          .select('*')
          .order('position'),
      ]);
      if (modRes.error) throw modRes.error;
      if (grpRes.error) throw grpRes.error;
      _modData    = modRes.data || [];
      _groupsData = grpRes.data || [];
      renderModulesTable(_modData);
      renderGroupsTable(_groupsData);
    } catch (err) {
      cdsShowGridError($('#tbodyModules').closest('.card-body'),
        'Impossible de charger les modules.', loadModules);
    }
  }

  function renderModulesTable(modules) {
    const tbody = $('#tbodyModules');
    if (!modules.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">Aucun module.</td></tr>`;
      return;
    }
    tbody.innerHTML = modules.map(m => {
      const grp = m.app_groups;
      const grpBadge = grp
        ? `<span class="badge" style="background:${escHtml(grp.color || '#6b7280')}">${escHtml(grp.label)}</span>`/* style= OK : couleur Supabase D-2026-03-15-T04 */
        : `<span class="text-muted small">—</span>`;
      const safeIcon = /^bi-[a-z0-9-]+$/.test(m.icon) ? m.icon : 'bi-grid';
      return `<tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${safeIcon} text-primary"></i>
            <span class="fw-semibold small">${escHtml(m.label)}</span>
          </div>
          <small class="text-muted d-block">${escHtml(m.key)}</small>
        </td>
        <td>${grpBadge}</td>
        <td>
          <select class="form-select form-select-sm" data-mod-field="status" data-mod-id="${escHtml(m.id)}">
            <option value="active"      ${m.status === 'active'      ? 'selected' : ''}>Actif</option>
            <option value="coming_soon" ${m.status === 'coming_soon' ? 'selected' : ''}>Bientôt</option>
            <option value="maintenance" ${m.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
          </select>
        </td>
        <td>
          <select class="form-select form-select-sm" data-mod-field="visibility" data-mod-id="${escHtml(m.id)}">
            <option value="member" ${m.visibility === 'member' ? 'selected' : ''}>Membres</option>
            <option value="admin"  ${m.visibility === 'admin'  ? 'selected' : ''}>Admin</option>
            <option value="all"    ${m.visibility === 'all'    ? 'selected' : ''}>Tous</option>
          </select>
        </td>
        <td>
          <input type="number" class="form-control form-control-sm"
                 data-mod-field="position" data-mod-id="${escHtml(m.id)}"
                 value="${escHtml(String(m.position ?? 0))}" min="0" max="999">
        </td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input"
                 data-mod-field="show_in_footer" data-mod-id="${escHtml(m.id)}"
                 ${m.show_in_footer ? 'checked' : ''}>
        </td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-module" data-mod-id="${escHtml(m.id)}">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    // Inline save — status & visibility
    $$('#tbodyModules [data-mod-field="status"], #tbodyModules [data-mod-field="visibility"]').forEach(sel => {
      sel.addEventListener('change', async function () {
        const field = this.dataset.modField;
        const id    = this.dataset.modId;
        const { error } = await window.bdb
          .from('app_modules')
          .update({ [field]: this.value, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) { toast("La sauvegarde n'a pu aboutir — réessayez dans un instant", 'danger'); return; }
        toast('Module mis à jour');
      });
    });

    // Inline save — show_in_footer
    $$('#tbodyModules [data-mod-field="show_in_footer"]').forEach(chk => {
      chk.addEventListener('change', async function () {
        const { error } = await window.bdb
          .from('app_modules')
          .update({ show_in_footer: this.checked, updated_at: new Date().toISOString() })
          .eq('id', this.dataset.modId)
          .select();
        if (error) { toast("La sauvegarde n'a pu aboutir — réessayez dans un instant", 'danger'); return; }
        toast('Footer mis à jour');
      });
    });

    // Inline save — position
    $$('#tbodyModules [data-mod-field="position"]').forEach(inp => {
      inp.addEventListener('change', async function () {
        const val = parseInt(this.value, 10);
        if (isNaN(val)) return;
        const { error } = await window.bdb
          .from('app_modules')
          .update({ position: val, updated_at: new Date().toISOString() })
          .eq('id', this.dataset.modId)
          .select();
        if (error) { toast("La position n'a pu être enregistrée — réessayez", 'danger'); return; }
        toast('Position mise à jour');
      });
    });

    // Bouton éditer
    $$('#tbodyModules [data-action="edit-module"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = _modData.find(m => m.id === btn.dataset.modId);
        if (mod) openEditModuleModal(mod);
      });
    });
  }

  function renderGroupsTable(groups) {
    const tbody = $('#tbodyGroups');
    if (!groups.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">Aucun groupe.</td></tr>`;
      return;
    }
    tbody.innerHTML = groups.map(g => {
      const safeIcon  = /^bi-[a-z0-9-]+$/.test(g.icon) ? g.icon : 'bi-grid';
      const safeColor = escHtml(g.color || '#6b7280');
      return `<tr>
        <td class="fw-semibold small">
          ${escHtml(g.label)}
          <small class="text-muted d-block">${escHtml(g.key)}</small>
        </td>
        <td><i class="bi ${safeIcon}"></i></td>
        <td>
          <span class="badge rounded-pill" style="background:${safeColor};">&thinsp;</span><!-- style= OK : couleur Supabase D-2026-03-15-T04 -->
          <small class="text-muted ms-1">${safeColor}</small>
        </td>
        <td>
          <input type="number" class="form-control form-control-sm"
                 data-grp-field="position" data-grp-id="${escHtml(g.id)}"
                 value="${escHtml(String(g.position ?? 0))}" min="0" max="999">
        </td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input"
                 data-grp-field="is_visible" data-grp-id="${escHtml(g.id)}"
                 ${g.is_visible ? 'checked' : ''}>
        </td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-action="edit-group" data-grp-id="${escHtml(g.id)}">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    // Inline save — position
    $$('#tbodyGroups [data-grp-field="position"]').forEach(inp => {
      inp.addEventListener('change', async function () {
        const val = parseInt(this.value, 10);
        if (isNaN(val)) return;
        const { error } = await window.bdb
          .from('app_groups')
          .update({ position: val })
          .eq('id', this.dataset.grpId)
          .select();
        if (error) { toast("La position n'a pu être enregistrée — réessayez", 'danger'); return; }
        toast('Position mise à jour');
      });
    });

    // Inline save — is_visible
    $$('#tbodyGroups [data-grp-field="is_visible"]').forEach(chk => {
      chk.addEventListener('change', async function () {
        const { error } = await window.bdb
          .from('app_groups')
          .update({ is_visible: this.checked })
          .eq('id', this.dataset.grpId)
          .select();
        if (error) { toast("La visibilité n'a pu être modifiée — réessayez", 'danger'); return; }
        toast('Visibilité mise à jour');
      });
    });

    // Bouton éditer
    $$('#tbodyGroups [data-action="edit-group"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const grp = _groupsData.find(g => g.id === btn.dataset.grpId);
        if (grp) openEditGroupModal(grp);
      });
    });
  }

  // ── Modale édition module ──────────────────────────────────────────
  const modalEditModule = new bootstrap.Modal('#modalEditModule');

  function openEditModuleModal(mod) {
    $('#editModId').value          = mod.id;
    $('#editModKey').value         = mod.key || '';
    $('#editModLabel').value       = mod.label || '';
    $('#editModDescription').value = mod.description || '';
    $('#editModIcon').value        = mod.icon || '';
    $('#editModPath').value        = mod.path || '';
    $('#editModIsNew').checked     = !!mod.is_new;
    $('#editModNewUntil').value    = mod.new_until ? mod.new_until.slice(0, 10) : '';
    $('#editModShowInFooter').checked = !!mod.show_in_footer;
    const grpSel = $('#editModGroupKey');
    grpSel.innerHTML = _groupsData.map(g =>
      `<option value="${escHtml(g.key)}" ${mod.group_key === g.key ? 'selected' : ''}>${escHtml(g.label)}</option>`
    ).join('');
    $('#editModError').classList.add('d-none');
    modalEditModule.show();
  }

  $('#btnSaveEditModule').addEventListener('click', async () => {
    const label = $('#editModLabel').value.trim();
    if (!label) {
      $('#editModError').textContent = 'Un label est nécessaire pour continuer.';
      $('#editModError').classList.remove('d-none');
      return;
    }
    const { error } = await window.bdb
      .from('app_modules')
      .update({
        label,
        description: $('#editModDescription').value.trim() || null,
        icon:        $('#editModIcon').value.trim()        || null,
        group_key:   $('#editModGroupKey').value           || null,
        path:        $('#editModPath').value.trim()        || null,
        is_new:      $('#editModIsNew').checked,
        new_until:   $('#editModNewUntil').value           || null,
        show_in_footer: $('#editModShowInFooter').checked,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', $('#editModId').value)
      .select();
    if (error) {
      $('#editModError').textContent = error.message;
      $('#editModError').classList.remove('d-none');
      return;
    }
    modalEditModule.hide();
    toast('Module mis à jour');
    loadModules();
  });

  // ── Modale édition groupe ──────────────────────────────────────────
  const modalEditGroup = new bootstrap.Modal('#modalEditGroup');

  function openEditGroupModal(grp) {
    $('#editGrpId').value          = grp.id;
    $('#editGrpKey').value         = grp.key || '';
    $('#editGrpLabel').value       = grp.label || '';
    $('#editGrpDescription').value = grp.description || '';
    $('#editGrpIcon').value        = grp.icon || '';
    $('#editGrpColor').value       = grp.color || '';
    $('#editGrpError').classList.add('d-none');
    modalEditGroup.show();
  }

  $('#btnSaveEditGroup').addEventListener('click', async () => {
    const label = $('#editGrpLabel').value.trim();
    if (!label) {
      $('#editGrpError').textContent = 'Un label est nécessaire pour continuer.';
      $('#editGrpError').classList.remove('d-none');
      return;
    }
    const { error } = await window.bdb
      .from('app_groups')
      .update({
        label,
        description: $('#editGrpDescription').value.trim() || null,
        icon:        $('#editGrpIcon').value.trim()        || null,
        color:       $('#editGrpColor').value.trim()       || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', $('#editGrpId').value)
      .select();
    if (error) {
      $('#editGrpError').textContent = error.message;
      $('#editGrpError').classList.remove('d-none');
      return;
    }
    modalEditGroup.hide();
    toast('Groupe mis à jour');
    loadModules();
  });

  // ----------------------------------------------------------------
  // SKELETON HELPER
  // ----------------------------------------------------------------
  function skeletonRows(rows, cols) {
    return Array.from({ length: rows }).map(() =>
      `<tr>${Array.from({ length: cols }).map(() =>
        `<td><div class="admin-skeleton" style="height:16px;width:${60+Math.random()*80}px;"></div></td>`/* style= OK : valeur calculée JS D-2026-03-15-T04 */
      ).join('')}</tr>`
    ).join('');
  }

  // ----------------------------------------------------------------
  // FAQ ADMIN
  // ----------------------------------------------------------------
  let _faqAll   = [];
  let _faqFilter = 'all';
  let _faqModule = '';

  async function loadFaqAdmin() {
    const tbody = $('#tbodyFaq');
    if (!tbody) return;
    tbody.innerHTML = skeletonRows(5, 6);

    const { data, error } = await window.bdb
      .from('site_faq')
      .select('id, question, reponse, categorie, module_key, show_in_site, show_in_module, position, statut')
      .order('position', { ascending: true })
      .limit(500);

    if (error) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">
        <i class="bi bi-exclamation-triangle me-1"></i>${escHtml(error.message)}</td></tr>`;
      return;
    }
    _faqAll = data || [];
    renderFaqTable();
    bindFaqAdminEvents();
  }

  function faqFiltered() {
    return _faqAll.filter(q => {
      if (_faqFilter === 'site' && !q.show_in_site)   return false;
      if (_faqFilter === 'app'  && !q.show_in_module) return false;
      if (_faqModule && q.module_key !== _faqModule)  return false;
      return true;
    });
  }

  function faqDestLabel(q) {
    if (q.show_in_site && q.show_in_module) return '<span class="badge bg-primary">Site + App</span>';
    if (q.show_in_site)   return '<span class="badge bg-info text-dark">Site</span>';
    if (q.show_in_module) return `<span class="badge bg-success">App · ${escHtml(q.module_key || '')}</span>`;
    return '<span class="badge bg-secondary">Aucune</span>';
  }

  function renderFaqTable() {
    const tbody = $('#tbodyFaq');
    if (!tbody) return;
    const items = faqFiltered();

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">
        <i class="bi bi-inbox me-1"></i>Aucune question pour ce filtre.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(q => `
      <tr>
        <td class="text-truncate" style="max-width:0">${escHtml(q.question)}</td><!-- style= OK : max-width colonne -->
        <td>${faqDestLabel(q)}</td>
        <td><span class="text-muted">${escHtml(q.categorie || '—')}</span></td>
        <td>${q.position}</td>
        <td>${q.statut === 'active'
          ? '<span class="badge badge-soft-success">Active</span>'
          : '<span class="badge badge-soft-warning">Draft</span>'}</td>
        <td class="text-end admin-col-action">
          <button class="btn btn-sm btn-outline-primary faq-admin-edit me-1"
            data-id="${escHtml(String(q.id))}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger faq-admin-delete"
            data-id="${escHtml(String(q.id))}"
            data-q="${escHtml(q.question)}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join('');
  }

  function bindFaqAdminEvents() {
    // Filtres destination
    $$('.faq-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.faq-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _faqFilter = btn.dataset.filter;
        renderFaqTable();
      });
    });

    // Filtre module
    $('#faqModuleFilter')?.addEventListener('change', e => {
      _faqModule = e.target.value;
      renderFaqTable();
    });

    // Destination → afficher/masquer select module
    $('#faqAdminDestination')?.addEventListener('change', toggleModuleWrap);

    // Nouveau
    $('#btnAddFaq')?.addEventListener('click', () => openFaqAdminModal());

    // Edit / Delete (délégation)
    $('#tbodyFaq')?.addEventListener('click', async e => {
      const editBtn   = e.target.closest('.faq-admin-edit');
      const deleteBtn = e.target.closest('.faq-admin-delete');
      if (editBtn) {
        const q = _faqAll.find(x => String(x.id) === editBtn.dataset.id);
        if (q) openFaqAdminModal(q);
      }
      if (deleteBtn) {
        if (!confirm(`Supprimer ?\n"${deleteBtn.dataset.q}"`)) return;
        const { error } = await window.bdb
          .from('site_faq').delete().eq('id', deleteBtn.dataset.id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Question supprimée');
        await loadFaqAdmin();
      }
    });

    // Save
    $('#btnFaqAdminSave')?.addEventListener('click', saveFaqAdmin);
  }

  function toggleModuleWrap() {
    const dest = $('#faqAdminDestination')?.value;
    const wrap = $('#faqAdminModuleWrap');
    if (wrap) wrap.classList.toggle('d-none', dest === 'site');
  }

  function openFaqAdminModal(q = null) {
    $('#faqAdminEditId').value          = q ? q.id : '';
    $('#faqAdminQuestion').value        = q ? q.question  : '';
    $('#faqAdminReponse').value         = q ? q.reponse   : '';
    $('#faqAdminCategorie').value       = q ? (q.categorie || '') : '';
    $('#faqAdminPosition').value        = q ? q.position  : 0;
    $('#faqAdminActive').checked        = q ? q.statut === 'active' : true;
    $('#modalFaqAdminTitle').textContent = q ? 'Modifier la question' : 'Nouvelle question FAQ';

    // Destination
    let dest = 'app';
    if (q) {
      if (q.show_in_site && q.show_in_module) dest = 'both';
      else if (q.show_in_site)   dest = 'site';
      else if (q.show_in_module) dest = 'app';
    }
    $('#faqAdminDestination').value = dest;
    if (q && q.module_key) $('#faqAdminModule').value = q.module_key;
    toggleModuleWrap();

    new bootstrap.Modal($('#modalFaqAdmin')).show();
  }

  async function saveFaqAdmin() {
    const id       = $('#faqAdminEditId').value.trim();
    const question = $('#faqAdminQuestion').value.trim();
    const reponse  = $('#faqAdminReponse').value.trim();
    const categorie= $('#faqAdminCategorie').value.trim() || 'general';
    const position = parseInt($('#faqAdminPosition').value, 10) || 0;
    const statut   = $('#faqAdminActive').checked ? 'active' : 'draft';
    const dest     = $('#faqAdminDestination').value;
    const module_key = (dest !== 'site') ? ($('#faqAdminModule').value || 'general') : null;

    if (!question || !reponse) { toast("La question et la réponse sont nécessaires pour continuer", 'warning'); return; }

    const payload = {
      question, reponse, categorie, position, statut, module_key,
      show_in_site:   dest === 'site' || dest === 'both',
      show_in_module: dest === 'app'  || dest === 'both',
    };

    let error;
    if (id) {
      ({ error } = await window.bdb.from('site_faq').update(payload).eq('id', id).select());
    } else {
      ({ error } = await window.bdb.from('site_faq').insert(payload).select());
    }

    if (error) { toast(error.message, 'danger'); return; }

    bootstrap.Modal.getInstance($('#modalFaqAdmin'))?.hide();
    toast(id ? 'Question modifiée' : 'Question ajoutée');
    await loadFaqAdmin();
  }

  // ----------------------------------------------------------------
  // GOUVERNANCE L3
  // ----------------------------------------------------------------
  let _gouvData         = { sessions: null, decisions: null, arbitrages: null, principes: null };
  let _gouvEventsBound  = false;
  let _gouvSubtabLoaded = {};

  function loadGouvernance() {
    if (!_gouvEventsBound) {
      _gouvEventsBound = true;

      $$('#gouv-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
          $$('#gouv-tabs button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const key = btn.dataset.gouv;
          $('#gouvSessions').classList.toggle('d-none',   key !== 'sessions');
          $('#gouvDecisions').classList.toggle('d-none',  key !== 'decisions');
          $('#gouvArbitrages').classList.toggle('d-none', key !== 'arbitrages');
          $('#gouvPrincipes').classList.toggle('d-none',  key !== 'principes');
          if (key === 'sessions'   && !_gouvSubtabLoaded.sessions)   loadGouvSessions();
          if (key === 'decisions'  && !_gouvSubtabLoaded.decisions)  loadGouvDecisions();
          if (key === 'arbitrages' && !_gouvSubtabLoaded.arbitrages) loadGouvArbitrages();
          if (key === 'principes'  && !_gouvSubtabLoaded.principes)  loadGouvPrincipes();
        });
      });

      $('#btnSaveSession')?.addEventListener('click', saveGouvSession);

      $('#tbodyGouvArbitrages')?.addEventListener('click', async e => {
        const btn = e.target.closest('.gouv-arb-sold');
        if (!btn) return;
        if (!confirm('Marquer cet arbitrage comme soldé ?')) return;
        const { error } = await window.bdb
          .from('atelier_arbitrages').update({ statut: 'solde' }).eq('id', btn.dataset.id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast("Arbitrage clôturé avec succès");
        _gouvData.arbitrages = null; _gouvSubtabLoaded.arbitrages = false;
        loadGouvArbitrages();
      });

      $('#tbodyGouvSessions')?.addEventListener('click', e => {
        const btn = e.target.closest('.gouv-session-edit');
        if (!btn) return;
        const s = (_gouvData.sessions || []).find(x => String(x.id) === btn.dataset.id);
        if (s) openGouvSessionModal(s);
      });

      $('#gouvDecSearch')?.addEventListener('input',  renderGouvDecisions);
      $('#gouvDecModule')?.addEventListener('change', renderGouvDecisions);
      $('#gouvPrincSearch')?.addEventListener('input',  renderGouvPrincipes);
      $('#gouvPrincCat')?.addEventListener('change', renderGouvPrincipes);
    }
    if (!_gouvSubtabLoaded.sessions) loadGouvSessions();
  }

  // ── Sessions ────────────────────────────────────────────────────
  async function loadGouvSessions() {
    _gouvSubtabLoaded.sessions = true;
    const tbody = $('#tbodyGouvSessions');
    if (!tbody) return;
    tbody.innerHTML = skeletonRows(5, 6);
    try {
      const { data, error } = await window.bdb
        .from('atelier_sessions')
        .select('id, numero, titre, statut, date_debut, date_fin, avancement, objectifs')
        .order('numero', { ascending: false })
        .limit(200);
      if (error) throw error;
      _gouvData.sessions = data || [];
      const cnt = $('#gouvSessionsCount');
      if (cnt) cnt.textContent = _gouvData.sessions.length;
      renderGouvSessions();
    } catch (err) {
      cdsShowGridError(tbody.closest('.card-body'),
        'Impossible de charger les sessions.',
        () => { _gouvSubtabLoaded.sessions = false; loadGouvSessions(); });
    }
  }

  const STATUT_SESSION_BADGE = {
    a_faire:   '<span class="badge badge-soft-secondary">À faire</span>',
    en_cours:  '<span class="badge badge-soft-primary">En cours</span>',
    fait:      '<span class="badge badge-soft-success">Fait</span>',
    abandonne: '<span class="badge badge-soft-danger">Abandonné</span>',
  };

  function renderGouvSessions() {
    const tbody = $('#tbodyGouvSessions');
    if (!tbody) return;
    if (!_gouvData.sessions || !_gouvData.sessions.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><i class="bi bi-inbox me-1"></i>Aucune session.</td></tr>`;
      return;
    }
    tbody.innerHTML = _gouvData.sessions.map(s => {
      const av = s.avancement || '';
      return `
        <tr>
          <td class="text-center fw-semibold">${escHtml(String(s.numero || ''))}</td>
          <td class="fw-semibold text-truncate" style="max-width:200px">${escHtml(s.titre || '—')}</td><!-- style= OK : max-width colonne -->
          <td>${STATUT_SESSION_BADGE[s.statut] || escHtml(s.statut || '—')}</td>
          <td class="d-none d-md-table-cell text-muted">${escHtml(s.date_debut || '—')}</td>
          <td class="d-none d-lg-table-cell text-muted text-truncate" style="max-width:220px">${escHtml(av.length > 90 ? av.substring(0, 90) + '…' : av || '—')}</td><!-- style= OK : max-width colonne -->
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary gouv-session-edit" data-id="${escHtml(String(s.id))}">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  function openGouvSessionModal(s) {
    $('#editSessionId').value         = s.id;
    $('#editSessionStatut').value     = s.statut     || 'a_faire';
    $('#editSessionDateFin').value    = s.date_fin   ? String(s.date_fin).substring(0, 10) : '';
    $('#editSessionObjectifs').value  = s.objectifs  || '';
    $('#editSessionAvancement').value = s.avancement || '';
    const errEl = $('#editSessionError');
    if (errEl) errEl.classList.add('d-none');
    new bootstrap.Modal($('#modalEditSession')).show();
  }

  async function saveGouvSession() {
    const id = $('#editSessionId').value;
    if (!id) return;
    const payload = {
      statut:     $('#editSessionStatut').value,
      date_fin:   $('#editSessionDateFin').value    || null,
      objectifs:  $('#editSessionObjectifs').value.trim()  || null,
      avancement: $('#editSessionAvancement').value.trim() || null,
    };
    const { error } = await window.bdb
      .from('atelier_sessions').update(payload).eq('id', id).select();
    if (error) {
      const errEl = $('#editSessionError');
      if (errEl) { errEl.textContent = error.message; errEl.classList.remove('d-none'); }
      return;
    }
    bootstrap.Modal.getInstance($('#modalEditSession'))?.hide();
    toast('Session mise à jour');
    _gouvData.sessions = null; _gouvSubtabLoaded.sessions = false;
    loadGouvSessions();
  }

  // ── Décisions ───────────────────────────────────────────────────
  async function loadGouvDecisions() {
    _gouvSubtabLoaded.decisions = true;
    const tbody = $('#tbodyGouvDecisions');
    if (!tbody) return;
    tbody.innerHTML = skeletonRows(5, 5);
    try {
      const { data, error } = await window.bdb
        .from('atelier_decisions')
        .select('id, ref, date, titre, module_cible, tags, session_num')
        .order('date', { ascending: false })
        .limit(500);
      if (error) throw error;
      _gouvData.decisions = data || [];
      const cnt = $('#gouvDecisionsCount');
      if (cnt) cnt.textContent = _gouvData.decisions.length;
      const sel = $('#gouvDecModule');
      if (sel) {
        const modules = [...new Set(_gouvData.decisions.map(d => d.module_cible).filter(Boolean))].sort();
        modules.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m; opt.textContent = m;
          sel.appendChild(opt);
        });
      }
      renderGouvDecisions();
    } catch (err) {
      cdsShowGridError(tbody.closest('.card-body'),
        'Impossible de charger les décisions.',
        () => { _gouvSubtabLoaded.decisions = false; loadGouvDecisions(); });
    }
  }

  function renderGouvDecisions() {
    const tbody = $('#tbodyGouvDecisions');
    if (!tbody || !_gouvData.decisions) return;
    const search    = ($('#gouvDecSearch')?.value || '').toLowerCase();
    const modFilter = $('#gouvDecModule')?.value  || '';
    const items = _gouvData.decisions.filter(d => {
      if (modFilter && d.module_cible !== modFilter) return false;
      if (search && !((d.titre || '').toLowerCase().includes(search) || (d.ref || '').toLowerCase().includes(search))) return false;
      return true;
    });
    const cnt = $('#gouvDecisionsCount');
    if (cnt) cnt.textContent = items.length;
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><i class="bi bi-inbox me-1"></i>Aucune décision.</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map(d => `
      <tr>
        <td><code class="text-muted">${escHtml(d.ref || '—')}</code></td>
        <td class="text-truncate" style="max-width:250px">${escHtml(d.titre || '—')}</td><!-- style= OK : max-width colonne -->
        <td class="d-none d-md-table-cell">
          ${d.module_cible ? `<span class="badge badge-soft-secondary">${escHtml(d.module_cible)}</span>` : '<span class="text-muted">—</span>'}
        </td>
        <td class="d-none d-sm-table-cell text-muted">#${escHtml(String(d.session_num || '—'))}</td>
        <td class="d-none d-lg-table-cell text-muted">${escHtml(d.date || '—')}</td>
      </tr>`).join('');
  }

  // ── Arbitrages ──────────────────────────────────────────────────
  async function loadGouvArbitrages() {
    _gouvSubtabLoaded.arbitrages = true;
    const tbody = $('#tbodyGouvArbitrages');
    if (!tbody) return;
    tbody.innerHTML = skeletonRows(3, 5);
    try {
      const { data, error } = await window.bdb
        .from('atelier_arbitrages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      _gouvData.arbitrages = data || [];
      const cnt = $('#gouvArbitragesCount');
      if (cnt) cnt.textContent = _gouvData.arbitrages.length;
      renderGouvArbitrages();
    } catch (err) {
      cdsShowGridError(tbody.closest('.card-body'),
        'Impossible de charger les arbitrages.',
        () => { _gouvSubtabLoaded.arbitrages = false; loadGouvArbitrages(); });
    }
  }

  function renderGouvArbitrages() {
    const tbody = $('#tbodyGouvArbitrages');
    if (!tbody || !_gouvData.arbitrages) return;
    if (!_gouvData.arbitrages.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><i class="bi bi-inbox me-1"></i>Aucun arbitrage.</td></tr>`;
      return;
    }
    tbody.innerHTML = _gouvData.arbitrages.map(a => {
      const statut    = a.statut || '';
      const isPending = statut === 'pending' || statut === 'en_attente';
      const badge     = isPending
        ? '<span class="badge badge-soft-warning">En attente</span>'
        : '<span class="badge badge-soft-success">Soldé</span>';
      return `
        <tr>
          <td><code class="text-muted">${escHtml(a.ref || String(a.id || '—'))}</code></td>
          <td class="text-truncate" style="max-width:200px">${escHtml(a.titre || '—')}</td><!-- style= OK : max-width colonne -->
          <td>${badge}</td>
          <td class="d-none d-md-table-cell text-muted text-truncate" style="max-width:220px">${escHtml((a.description || '—').substring(0, 90))}</td><!-- style= OK : max-width colonne -->
          <td class="text-end">
            ${isPending ? `<button class="btn btn-sm btn-outline-success gouv-arb-sold" data-id="${escHtml(String(a.id))}">Solder</button>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  // ── Principes ───────────────────────────────────────────────────
  async function loadGouvPrincipes() {
    _gouvSubtabLoaded.principes = true;
    const tbody = $('#tbodyGouvPrincipes');
    if (!tbody) return;
    tbody.innerHTML = skeletonRows(5, 4);
    try {
      const { data, error } = await window.bdb
        .from('atelier_principes')
        .select('id, ref, categorie, titre, description')
        .order('categorie').order('ref')
        .limit(200);
      if (error) throw error;
      _gouvData.principes = data || [];
      const cnt = $('#gouvPrincipesCount');
      if (cnt) cnt.textContent = _gouvData.principes.length;
      const sel = $('#gouvPrincCat');
      if (sel) {
        const cats = [...new Set(_gouvData.principes.map(p => p.categorie).filter(Boolean))].sort();
        cats.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c; opt.textContent = c;
          sel.appendChild(opt);
        });
      }
      renderGouvPrincipes();
    } catch (err) {
      cdsShowGridError(tbody.closest('.card-body'),
        'Impossible de charger les principes.',
        () => { _gouvSubtabLoaded.principes = false; loadGouvPrincipes(); });
    }
  }

  function renderGouvPrincipes() {
    const tbody = $('#tbodyGouvPrincipes');
    if (!tbody || !_gouvData.principes) return;
    const search    = ($('#gouvPrincSearch')?.value || '').toLowerCase();
    const catFilter = $('#gouvPrincCat')?.value  || '';
    const items = _gouvData.principes.filter(p => {
      if (catFilter && p.categorie !== catFilter) return false;
      if (search && !((p.titre || '').toLowerCase().includes(search) || (p.ref || '').toLowerCase().includes(search))) return false;
      return true;
    });
    const cnt = $('#gouvPrincipesCount');
    if (cnt) cnt.textContent = items.length;
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted"><i class="bi bi-inbox me-1"></i>Aucun principe.</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map(p => {
      const desc = p.description || '';
      return `
        <tr>
          <td><code class="text-muted">${escHtml(p.ref || '—')}</code></td>
          <td><span class="badge badge-soft-secondary">${escHtml(p.categorie || '—')}</span></td>
          <td class="fw-semibold">${escHtml(p.titre || '—')}</td>
          <td class="d-none d-lg-table-cell text-muted small text-truncate" style="max-width:300px">${escHtml(desc.length > 100 ? desc.substring(0, 100) + '…' : desc || '—')}</td><!-- style= OK : max-width colonne -->
        </tr>`;
    }).join('');
  }

  // ----------------------------------------------------------------
  // MODULES MÉTIER
  // ----------------------------------------------------------------
  let _metiersLoaded = false;

  function loadModulesMetier() {
    if (_metiersLoaded) return;

    const loading = document.getElementById('modules-metier-loading');
    const grid    = document.getElementById('modules-metier-grid');
    if (!grid) return;

    // Référentiel BDB — 22 modules, ordre alphabétique
    const BDB_MODULES = [
      { num: 1,  label: 'Anatomie',              dossier: 'anatomie',            statut: 'actif'   },
      { num: 2,  label: 'Annuaire',              dossier: 'annuaire',            statut: 'actif'   },
      { num: 3,  label: 'Arsenal',               dossier: 'arsenal',             statut: 'actif'   },
      { num: 4,  label: 'Boîte à idées',         dossier: 'boite-a-idees',       statut: 'actif'   },
      { num: 5,  label: 'Carnet de bord',        dossier: 'carnet-bord',         statut: 'embryon' },
      { num: 6,  label: 'Cours',                 dossier: 'cours',               statut: 'actif'   },
      { num: 7,  label: 'DISC',                  dossier: 'disc',                statut: 'actif'   },
      { num: 8,  label: 'FAQ',                   dossier: 'faq',                 statut: 'actif'   },
      { num: 9,  label: 'Fiches',                dossier: 'fiches',              statut: 'actif'   },
      { num: 10, label: 'GED',                   dossier: 'ged',                 statut: 'embryon' },
      { num: 11, label: 'Glossaire',             dossier: 'glossaire',           statut: 'actif'   },
      { num: 12, label: 'Installation',          dossier: 'installation',        statut: 'actif'   },
      { num: 13, label: 'Interview',             dossier: 'interview',           statut: 'actif'   },
      { num: 14, label: 'Objectifs',             dossier: 'objectifs',           statut: 'embryon' },
      { num: 15, label: 'Organisateur',          dossier: 'organisateur',        statut: 'actif'   },
      { num: 16, label: 'Pédagogie',             dossier: 'pedagogie',           statut: 'embryon' },
      { num: 17, label: 'Planning',              dossier: 'planning',            statut: 'actif'   },
      { num: 18, label: 'Préférences',           dossier: 'preferences',         statut: 'actif'   },
      { num: 19, label: 'Recueil de situation',  dossier: 'recueil-situation',   statut: 'embryon' },
      { num: 20, label: 'Thésaurus',             dossier: 'thesaurus',           statut: 'actif'   },
      { num: 21, label: 'Transmissions',         dossier: 'transmissions',       statut: 'actif'   },
      { num: 22, label: 'Veille documentaire',   dossier: 'veille-documentaire', statut: 'actif'   },
    ];

    grid.innerHTML = BDB_MODULES.map(m => {
      const numPad     = String(m.num).padStart(2, '0');
      const badgeClass = m.statut === 'actif' ? 'bg-success' : 'bg-warning text-dark';
      const badgeLabel = m.statut === 'actif' ? 'Actif' : 'Embryon';
      return `
        <div class="col">
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-start justify-content-between mb-2">
                <span class="badge bg-secondary">#${escHtml(numPad)}</span>
                <span class="badge ${badgeClass}">${escHtml(badgeLabel)}</span>
              </div>
              <h6 class="card-title mb-1">${escHtml(m.label)}</h6>
              <p class="text-muted small mb-3">modules/${escHtml(m.dossier)}/</p>
              <div class="mt-auto d-flex gap-2">
                <a href="../${escHtml(m.dossier)}/index.html" target="_blank"
                   class="btn btn-sm btn-outline-primary flex-grow-1">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Ouvrir
                </a>
                <a href="../${escHtml(m.dossier)}/admin.html" target="_blank"
                   class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-gear"></i>
                </a>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    loading?.classList.add('d-none');
    grid.classList.remove('d-none');
    _metiersLoaded = true;
  }

  // ----------------------------------------------------------------
  // INIT : charger le premier tab
  // ----------------------------------------------------------------
  async function check404Alert() {
    if (!window.bdbUser?.isAdmin) return;
    const { data, error } = await window.bdb.rpc('count_unseen_404s');
    if (error || !data) return;
    const badge = document.getElementById('badge404');
    if (!badge) return;
    if (data >= 3) {
      badge.textContent = data;
      badge.classList.remove('d-none');
    }
  }

  check404Alert();
  loadDashboard();

}); // DOMContentLoaded
