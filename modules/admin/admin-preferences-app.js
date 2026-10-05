/* ============================================================
   admin-preferences-app.js
   Module : Administration > Préférences chirurgien
   Dépend : window.bdb · window.bdbUser · bootstrap
   Init   : initPreferencesAdmin() appelée par admin-app.js
   Tables : preferences_chirurgien · pref_referentiels
            profiles_directory
   ============================================================ */

(function () {

  /* ── Helpers locaux (pas de dépendance sur admin-app.js) ── */
  const $  = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const DB = window.bdb;

  const _esc = document.createElement('span');
  function escHtml(s) { _esc.textContent = s ?? ''; return _esc.innerHTML; }

  function toast(msg, type = 'success') {
    const el = $('#toastMsg');
    if (!el) return;
    el.className = `toast align-items-center text-bg-${type} border-0`;
    const txt = $('#toastText');
    if (txt) txt.textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  /* ── État ── */
  let paCurrentPill = 'brouillons';
  let paRefCat      = '';
  let _modalRef;
  let _pillsInited  = false;
  let _chirLoaded   = false;

  /* ── C.9 : 3 états par section ── */
  function showPaState(prefix, state, msg) {
    ['loading','empty','error','list','idle'].forEach(s => {
      document.getElementById(`${prefix}-${s}`)?.classList.add('d-none');
    });
    document.getElementById(`${prefix}-${state}`)?.classList.remove('d-none');
    if (state === 'error' && msg) {
      const el = document.getElementById(`${prefix}-error-msg`);
      if (el) el.textContent = msg;
    }
  }

  /* ============================================================
     INIT PRINCIPAL — appelé par admin-app.js au clic de l'onglet
     ============================================================ */
  window.initPreferencesAdmin = function () {
    _modalRef = bootstrap.Modal.getOrCreateInstance($('#modalRef'));

    if (!_pillsInited) {
      initPrefPills();
      _pillsInited = true;
    }
    if (!_chirLoaded) {
      loadChirurgiensFilter();
      _chirLoaded = true;
    }

    loadBrouillons();
  };

  /* ============================================================
     PILLS NAVIGATION
     ============================================================ */
  function initPrefPills() {
    $$('#prefAdminPills [data-pref-pill]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#prefAdminPills [data-pref-pill]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        paCurrentPill = btn.dataset.prefPill;
        $('#prefPillBrouillons')?.classList.toggle('d-none', paCurrentPill !== 'brouillons');
        $('#prefPillToutes')?.classList.toggle('d-none',    paCurrentPill !== 'toutes');
        $('#prefPillReferentiels')?.classList.toggle('d-none', paCurrentPill !== 'referentiels');
        if (paCurrentPill === 'brouillons')   loadBrouillons();
        if (paCurrentPill === 'toutes')       loadToutesPrefs();
        if (paCurrentPill === 'referentiels') initRefPill();
      });
    });

    /* Retry buttons */
    $('#btnRetryBrouillons')?.addEventListener('click', loadBrouillons);
    $('#btnRetryToutes')?.addEventListener('click', loadToutesPrefs);

    /* Filtres toutes prefs */
    let deb;
    $('#paFilterSearch')?.addEventListener('input', () => {
      clearTimeout(deb); deb = setTimeout(loadToutesPrefs, 350);
    });
    $('#paFilterChir')?.addEventListener('change', loadToutesPrefs);
    $('#paFilterScope')?.addEventListener('change', loadToutesPrefs);

    /* Modale référentiel */
    $('#btnSaveRef')?.addEventListener('click', saveRef);
  }

  /* ============================================================
     CHIRURGIENS — select filtre (chargé une seule fois)
     ============================================================ */
  async function loadChirurgiensFilter() {
    const { data } = await DB
      .from('profiles_directory')
      .select('user_id,nom,prenom')
      .eq('fonction', 'medecin')
      .eq('approved', true)
      .order('nom');
    const sel = $('#paFilterChir');
    if (!sel || !data) return;
    data.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.user_id;
      opt.textContent = `Dr ${d.nom || ''} ${d.prenom || ''}`.trim();
      sel.appendChild(opt);
    });
  }

  /* ============================================================
     BROUILLONS (is_dev = true)
     ============================================================ */
  async function loadBrouillons() {
    showPaState('paBrouillons', 'loading');

    const { data, error } = await DB
      .from('preferences_chirurgien')
      .select('id,titre,chirurgien_id,scope_level,is_global,created_at')
      .eq('is_dev', true)
      .order('created_at', { ascending: false });

    if (error) { showPaState('paBrouillons','error', error.message); return; }

    /* Badge compteur dans le pill */
    const badge = $('#badgeBrouillons');
    if (badge) {
      if (data?.length) { badge.textContent = data.length; badge.classList.remove('d-none'); }
      else badge.classList.add('d-none');
    }

    if (!data?.length) { showPaState('paBrouillons','empty'); return; }

    /* Profils chirurgiens */
    const ids = [...new Set(data.map(p => p.chirurgien_id).filter(Boolean))];
    const { data: profils } = await DB.from('profiles_directory')
      .select('user_id,nom,prenom').in('user_id', ids);
    const profMap = Object.fromEntries((profils||[]).map(p => [p.user_id, p]));

    const container = $('#paBrouillons-list');
    container.innerHTML = data.map(p => {
      const prof  = profMap[p.chirurgien_id];
      const name  = prof ? `Dr ${escHtml(prof.nom||'')} ${escHtml(prof.prenom||'')}` : '—';
      const scope = p.scope_level === 'global' || p.is_global
        ? `<span class="badge bg-success-subtle text-success">Globale</span>`
        : `<span class="badge bg-secondary-subtle text-secondary">${escHtml(p.scope_level||'—')}</span>`;
      return `
        <div class="card border-warning border-opacity-50 shadow-sm mb-2" data-pref-id="${escHtml(p.id)}">
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <div class="flex-grow-1 min-w-0">
              <div class="small text-muted">${name}</div>
              <div class="fw-semibold text-truncate">${escHtml(p.titre)}</div>
              <div class="mt-1">${scope}</div>
            </div>
            <div class="d-flex gap-2 flex-shrink-0">
              <button class="btn btn-sm btn-success" data-action="validate">
                <i class="bi bi-check-lg me-1"></i>Valider
              </button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    showPaState('paBrouillons','list');
    delegateBrouillons(container);
  }

  function delegateBrouillons(container) {
    container.addEventListener('click', async e => {
      const btn  = e.target.closest('[data-action]');
      if (!btn) return;
      const card = btn.closest('[data-pref-id]');
      if (!card) return;
      const id   = card.dataset.prefId;

      if (btn.dataset.action === 'validate') {
        const { error } = await DB.from('preferences_chirurgien')
          .update({ is_dev: false, updated_at: new Date().toISOString() })
          .eq('id', id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Préférence publiée.', 'success');
        loadBrouillons();
      }
      if (btn.dataset.action === 'delete') {
        if (!confirm('Supprimer définitivement cette préférence ?')) return;
        const { error } = await DB.from('preferences_chirurgien')
          .delete().eq('id', id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Préférence supprimée.', 'success');
        loadBrouillons();
      }
    }, { once: false });
  }

  /* ============================================================
     TOUTES LES PRÉFÉRENCES
     ============================================================ */
  async function loadToutesPrefs() {
    showPaState('paToutes','loading');

    const search = $('#paFilterSearch')?.value.trim();
    const chirId = $('#paFilterChir')?.value;
    const scope  = $('#paFilterScope')?.value;

    let q = DB.from('preferences_chirurgien')
      .select('id,titre,chirurgien_id,is_global,scope_level,is_dev')
      .order('created_at', { ascending: false })
      .limit(200);

    if (search) q = q.or(`titre.ilike.%${search}%`);
    if (chirId) q = q.eq('chirurgien_id', chirId);
    if (scope === 'global') q = q.eq('is_global', true);
    else if (scope) q = q.eq('scope_level', scope);

    const { data, error } = await q;
    if (error) { showPaState('paToutes','error', error.message); return; }
    if (!data?.length) {
      showPaState('paToutes','empty');
      const cnt = $('#paTotalCount'); if (cnt) cnt.textContent = '0';
      return;
    }

    /* Profils */
    const ids = [...new Set(data.map(p => p.chirurgien_id).filter(Boolean))];
    const { data: profils } = await DB.from('profiles_directory')
      .select('user_id,nom,prenom').in('user_id', ids);
    const profMap = Object.fromEntries((profils||[]).map(p => [p.user_id, p]));

    const cnt = $('#paTotalCount');
    if (cnt) cnt.textContent = `${data.length} préférence${data.length > 1 ? 's' : ''}`;

    const tbody = $('#paToutesBody');
    tbody.innerHTML = data.map(p => {
      const prof  = profMap[p.chirurgien_id];
      const name  = prof ? `Dr ${escHtml(prof.nom||'')} ${escHtml(prof.prenom||'')}` : '—';
      const scope = p.is_global
        ? `<span class="badge bg-success-subtle text-success">Globale</span>`
        : `<span class="badge bg-secondary-subtle text-secondary">${escHtml(p.scope_level||'—')}</span>`;
      const statut = p.is_dev
        ? `<span class="badge bg-warning text-dark">Brouillon</span>`
        : `<span class="badge bg-light text-muted border">Publiée</span>`;
      return `
        <tr data-pref-id="${escHtml(p.id)}">
          <td class="small">${name}</td>
          <td class="fw-semibold small">${escHtml(p.titre)}</td>
          <td>${scope}</td>
          <td>${statut}</td>
          <td>
            ${p.is_dev
              ? `<button class="btn btn-xs btn-success me-1" data-action="validate" title="Valider">
                   <i class="bi bi-check-lg"></i>
                 </button>`
              : ''}
            <button class="btn btn-xs btn-outline-danger" data-action="delete" title="Supprimer">
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    showPaState('paToutes','list');
    delegateToutes(tbody);
  }

  function delegateToutes(tbody) {
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const row = btn.closest('[data-pref-id]');
      if (!row) return;
      const id  = row.dataset.prefId;

      if (btn.dataset.action === 'validate') {
        const { error } = await DB.from('preferences_chirurgien')
          .update({ is_dev: false, updated_at: new Date().toISOString() })
          .eq('id', id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Préférence publiée.', 'success');
        loadToutesPrefs();
      }
      if (btn.dataset.action === 'delete') {
        if (!confirm('Supprimer définitivement cette préférence ?')) return;
        const { error } = await DB.from('preferences_chirurgien')
          .delete().eq('id', id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Préférence supprimée.', 'success');
        loadToutesPrefs();
      }
    }, { once: false });
  }

  /* ============================================================
     RÉFÉRENTIELS (pref_referentiels)
     ============================================================ */
  let _refPillInited = false;
  let _refData       = [];

  /* Labels lisibles pour chaque catégorie */
  const CAT_LABELS = {
    table_op:         'Table opératoire',
    decubitus:        'Décubitus',
    position_install: 'Position / Installation',
    appui:            'Appuis',
    garrot_position:  'Garrot — position',
    pos_salle:        'Position dans la salle',
    gelose_position:  'Gélose — position',
    gelose_taille:    'Gélose — taille',
    be_modele:        'Bistouri — modèle',
    be_mode_coupe:    'Bistouri — mode coupe',
    be_mode_coag:     'Bistouri — mode coag',
    be_mode_bipo:     'Bistouri — mode bipolaire',
    ciment_nom:       'Ciment — nom',
    ciment_melangeur: 'Ciment — mélangeur',
    gants_modele:     'Gants — modèle',
    casaque_type:     'Casaque — type',
    agrafe_modele:    'Agrafes — modèle',
    pansement:        'Pansement',
    attelle:          'Attelle',
    secteur:          'Secteur',
    type_chirurgie:   'Type de chirurgie',
  };

  async function initRefPill() {
    if (_refPillInited) return;
    _refPillInited = true;

    /* Charger les catégories distinctes depuis la DB */
    const sel = $('#paRefCategorie');
    if (sel) {
      const { data: cats } = await DB
        .from('pref_referentiels')
        .select('categorie')
        .order('categorie');

      if (cats) {
        /* Dédupliquer côté JS */
        const uniq = [...new Set(cats.map(c => c.categorie))];
        sel.innerHTML = '<option value="">— Choisir une catégorie —</option>' +
          uniq.map(c =>
            `<option value="${escHtml(c)}">${escHtml(CAT_LABELS[c] || c)}</option>`
          ).join('');
      }
    }

    $('#paRefCategorie')?.addEventListener('change', () => {
      paRefCat = $('#paRefCategorie').value;
      if (!paRefCat) {
        showPaState('paRef','idle');
        $('#btnAddRef')?.classList.add('d-none');
        return;
      }
      $('#btnAddRef')?.classList.remove('d-none');
      loadRefs();
    });

    $('#btnAddRef')?.addEventListener('click', () => openRefModal(null));
  }

  async function loadRefs() {
    if (!paRefCat) return;
    showPaState('paRef','loading');

    const { data, error } = await DB.from('pref_referentiels')
      .select('id,libelle,ordre,actif')
      .eq('categorie', paRefCat)
      .order('ordre').order('libelle');

    if (error) { showPaState('paRef','error', error.message); return; }
    if (!data?.length) { showPaState('paRef','empty'); return; }

    _refData = data;

    const tbody = $('#paRefBody');
    tbody.innerHTML = data.map(r => `
      <tr data-ref-id="${escHtml(r.id)}">
        <td class="text-muted small">${escHtml(String(r.ordre))}</td>
        <td class="fw-semibold small">${escHtml(r.libelle)}</td>
        <td>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input ref-toggle-actif" type="checkbox"
                   ${r.actif ? 'checked' : ''} data-ref-id="${escHtml(r.id)}"/>
          </div>
        </td>
        <td>
          <button class="btn btn-xs btn-outline-secondary me-1" data-action="edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-xs btn-outline-danger" data-action="delete">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>`).join('');

    showPaState('paRef','list');

    /* Toggle actif inline */
    tbody.querySelectorAll('.ref-toggle-actif').forEach(cb => {
      cb.addEventListener('change', async () => {
        const { error } = await DB.from('pref_referentiels')
          .update({ actif: cb.checked }).eq('id', cb.dataset.refId).select();
        if (error) { toast(error.message, 'danger'); cb.checked = !cb.checked; return; }
        toast(cb.checked ? 'Valeur activée.' : 'Valeur masquée.', 'success');
      });
    });

    /* Délégation edit / delete */
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const row = btn.closest('[data-ref-id]');
      if (!row) return;
      const id  = row.dataset.refId;

      if (btn.dataset.action === 'edit') {
        const rec = _refData.find(r => r.id === id);
        if (rec) openRefModal(rec);
      }
      if (btn.dataset.action === 'delete') {
        if (!confirm('Supprimer cette valeur ?\nLes préférences existantes qui l\'utilisent ne seront pas modifiées.')) return;
        const { error } = await DB.from('pref_referentiels')
          .delete().eq('id', id).select();
        if (error) { toast(error.message, 'danger'); return; }
        toast('Valeur supprimée.', 'success');
        loadRefs();
      }
    }, { once: false });
  }

  function openRefModal(rec) {
    document.getElementById('refEditId').value     = rec?.id      || '';
    document.getElementById('refLibelle').value    = rec?.libelle || '';
    document.getElementById('refOrdre').value      = rec?.ordre   ?? 0;
    document.getElementById('refActif').checked    = rec?.actif   ?? true;
    document.getElementById('refError')?.classList.add('d-none');
    document.getElementById('modalRefTitle').textContent = rec ? 'Modifier la valeur' : 'Nouvelle valeur';
    _modalRef.show();
  }

  async function saveRef() {
    const id      = document.getElementById('refEditId').value;
    const libelle = document.getElementById('refLibelle').value.trim();
    const ordre   = parseInt(document.getElementById('refOrdre').value || '0', 10);
    const actif   = document.getElementById('refActif').checked;
    const errEl   = document.getElementById('refError');

    errEl?.classList.add('d-none');

    if (!libelle) {
      if (errEl) { errEl.textContent = 'Le libellé est requis.'; errEl.classList.remove('d-none'); }
      return;
    }
    if (!paRefCat) {
      if (errEl) { errEl.textContent = 'Aucune catégorie sélectionnée.'; errEl.classList.remove('d-none'); }
      return;
    }

    const payload = { categorie: paRefCat, libelle, ordre, actif };
    const { error } = id
      ? await DB.from('pref_referentiels').update(payload).eq('id', id).select()
      : await DB.from('pref_referentiels').insert([payload]).select();

    if (error) {
      if (errEl) { errEl.textContent = error.message; errEl.classList.remove('d-none'); }
      return;
    }
    toast(id ? 'Valeur mise à jour.' : 'Valeur ajoutée.', 'success');
    _modalRef.hide();
    loadRefs();
  }

})(); /* IIFE — pas de pollution du scope global */
