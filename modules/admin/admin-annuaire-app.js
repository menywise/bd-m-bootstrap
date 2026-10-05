/* ============================================================
   admin-annuaire-app.js
   Module : Administration > Annuaire
   Dépend : window.bdb · window.bdbUser · bootstrap
   Init   : initAnnuaireAdmin() appelée par admin-app.js
   Tables : parametrage_modules (module='annuaire')
   Pattern: sidebar 4 fonctions + panneau sections — D-2026-04-14-ADMIN-MODULE-05
   ============================================================ */

(function () {

  /* ── Helpers locaux ── */
  const $  = sel => document.querySelector(sel);
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

  /* ── Configuration des fonctions ── */
  const FONCTIONS = [
    { section: 'modale_medecin',       label: 'Médecin',        icon: 'bi-person-badge',    color: '#0d6efd', bg: '#e7f1ff' },
    { section: 'modale_cadre',         label: 'Cadre',          icon: 'bi-briefcase',        color: '#6f42c1', bg: '#f0ecfd' },
    { section: 'modale_infirmier',     label: 'Infirmier·ère',  icon: 'bi-heart-pulse',      color: '#198754', bg: '#d1e7dd' },
    { section: 'modale_aide_soignant', label: 'Aide-soignant·e',icon: 'bi-bandaid',          color: '#fd7e14', bg: '#fff3e0' },
  ];

  /* Labels lisibles des champs */
  const CHAMP_LABELS = {
    casaque:             'Casaque',
    porte_casque:        'Porte casque',
    gants_paire_1:       'Gants 1re paire',
    gants_paire_2:       'Gants 2e paire',
    secretaires:         'Secrétaires',
    telephone_principal: 'Téléphone principal',
    telephone_secondaire:'Téléphone secondaire',
  };

  /* ── État ── */
  let _inited          = false;
  let _data            = [];   /* toutes les lignes parametrage_modules annuaire */
  let _activeFonction  = null; /* section active ex: 'modale_medecin' */

  /* ── C.9 états ── */
  function showState(state, msg) {
    ['annAdmin-loading','annAdmin-error','annAdmin-content'].forEach(id =>
      document.getElementById(id)?.classList.add('d-none')
    );
    document.getElementById('annAdmin-' + state)?.classList.remove('d-none');
    if (state === 'error' && msg) {
      const el = document.getElementById('annAdmin-error-msg');
      if (el) el.textContent = msg;
    }
  }

  /* ============================================================
     INIT PRINCIPAL
     ============================================================ */
  window.initAnnuaireAdmin = async function () {
    if (_inited) return;
    _inited = true;

    document.getElementById('btnRetryAnnAdmin')?.addEventListener('click', load);
    await load();
  };

  async function load() {
    showState('loading');

    const { data, error } = await DB
      .from('parametrage_modules')
      .select('section, cle, libelle, valeur, ordre')
      .eq('module', 'annuaire')
      .order('section')
      .order('ordre');

    if (error) { showState('error', error.message); return; }

    _data = data || [];
    renderSidebar();
    showState('content');

    /* Activer la première fonction par défaut */
    if (FONCTIONS.length > 0) activateFonction(FONCTIONS[0].section);
  }

  /* ============================================================
     SIDEBAR — liste des fonctions
     ============================================================ */
  function renderSidebar() {
    const list = document.getElementById('annFonctionList');
    if (!list) return;

    list.innerHTML = FONCTIONS.map(f => {
      const count = _data.filter(d => d.section === f.section).length;
      return `<button
        type="button"
        class="list-group-item list-group-item-action d-flex align-items-center gap-2 py-2 px-3"
        data-section="${escHtml(f.section)}"
        style="border-left:3px solid transparent">
        <span class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style="width:32px;height:32px;background:${escHtml(f.bg)};color:${escHtml(f.color)}">
          <i class="bi ${escHtml(f.icon)}" style="font-size:.85rem"></i>
        </span>
        <span class="flex-grow-1 small fw-semibold">${escHtml(f.label)}</span>
        <span class="badge bg-secondary-subtle text-secondary" style="font-size:.65rem">${count}</span>
      </button>`;
    }).join('');

    list.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => activateFonction(btn.dataset.section));
    });
  }

  /* ============================================================
     ACTIVER UNE FONCTION
     ============================================================ */
  function activateFonction(section) {
    _activeFonction = section;

    /* Highlight sidebar */
    document.querySelectorAll('#annFonctionList [data-section]').forEach(btn => {
      const f = FONCTIONS.find(x => x.section === btn.dataset.section);
      const active = btn.dataset.section === section;
      btn.classList.toggle('active', active);
      btn.style.borderLeftColor = active && f ? f.color : 'transparent';
      btn.style.background = active && f ? f.bg : '';
    });

    /* Titre panneau */
    const f = FONCTIONS.find(x => x.section === section);
    const titleEl = document.getElementById('annSectionTitle');
    if (titleEl && f) titleEl.textContent = f.label + ' — Sections configurables';

    renderSections(section);
  }

  /* ============================================================
     SECTIONS — panneau droite
     ============================================================ */
  function renderSections(section) {
    const body = document.getElementById('annSectionBody');
    if (!body) return;

    const rows = _data.filter(d => d.section === section).sort((a,b) => a.ordre - b.ordre);

    if (!rows.length) {
      body.innerHTML = `<div class="text-center py-5 text-muted small">Aucune section configurée.</div>`;
      return;
    }

    body.innerHTML = rows.map(row => {
      const val      = row.valeur || {};
      const visible  = val.visible !== false;
      const champs   = val.champs  || null;
      const rowId    = `sec-${escHtml(section)}-${escHtml(row.cle)}`;

      let champsHtml = '';
      if (champs) {
        champsHtml = `
          <div class="border-top pt-2 mt-2 ms-1" id="${rowId}-champs">
            <div class="text-muted" style="font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.4rem">Champs visibles</div>
            <div class="d-flex flex-wrap gap-2">
              ${Object.entries(champs).map(([cle, actif]) => `
                <div class="form-check form-switch mb-0">
                  <input class="form-check-input ann-champ-toggle"
                         type="checkbox" id="${rowId}-${escHtml(cle)}"
                         data-section="${escHtml(section)}"
                         data-cle="${escHtml(row.cle)}"
                         data-champ="${escHtml(cle)}"
                         ${actif ? 'checked' : ''}/>
                  <label class="form-check-label small" for="${rowId}-${escHtml(cle)}">
                    ${escHtml(CHAMP_LABELS[cle] || cle)}
                  </label>
                </div>`).join('')}
            </div>
          </div>`;
      }

      return `
        <div class="p-3 border-bottom ann-section-row" data-section="${escHtml(section)}" data-cle="${escHtml(row.cle)}">
          <div class="d-flex align-items-center gap-3">
            <div class="flex-grow-1">
              <div class="fw-semibold small">${escHtml(row.libelle)}</div>
              ${champs ? `<div class="text-muted" style="font-size:.78rem">${Object.keys(champs).length} champ${Object.keys(champs).length > 1 ? 's' : ''}</div>` : ''}
            </div>
            <div class="form-check form-switch mb-0 flex-shrink-0">
              <input class="form-check-input ann-visible-toggle"
                     type="checkbox" role="switch"
                     id="${rowId}-visible"
                     data-section="${escHtml(section)}"
                     data-cle="${escHtml(row.cle)}"
                     ${visible ? 'checked' : ''}/>
              <label class="form-check-label small text-muted" for="${rowId}-visible">Visible</label>
            </div>
          </div>
          ${champsHtml}
        </div>`;
    }).join('');

    /* Listeners toggles section visible */
    body.querySelectorAll('.ann-visible-toggle').forEach(cb => {
      cb.addEventListener('change', async () => {
        const { section: sec, cle } = cb.dataset;
        const row = _data.find(d => d.section === sec && d.cle === cle);
        if (!row) return;
        const newVal = { ...row.valeur, visible: cb.checked };
        const ok = await saveParam(sec, cle, newVal);
        if (ok) {
          row.valeur = newVal;
          toast(`Section "${row.libelle}" ${cb.checked ? 'activée' : 'masquée'}.`);
          renderSidebar(); /* Mettre à jour les compteurs */
        } else {
          cb.checked = !cb.checked; /* Rollback visuel */
        }
      });
    });

    /* Listeners toggles champs individuels */
    body.querySelectorAll('.ann-champ-toggle').forEach(cb => {
      cb.addEventListener('change', async () => {
        const { section: sec, cle, champ } = cb.dataset;
        const row = _data.find(d => d.section === sec && d.cle === cle);
        if (!row) return;
        const newChamps = { ...(row.valeur.champs || {}), [champ]: cb.checked };
        const newVal    = { ...row.valeur, champs: newChamps };
        const ok = await saveParam(sec, cle, newVal);
        if (ok) {
          row.valeur = newVal;
          toast(`Champ "${CHAMP_LABELS[champ] || champ}" ${cb.checked ? 'activé' : 'masqué'}.`);
        } else {
          cb.checked = !cb.checked;
        }
      });
    });
  }

  /* ============================================================
     SAVE — UPDATE parametrage_modules
     ============================================================ */
  async function saveParam(section, cle, newValeur) {
    const { error } = await DB
      .from('parametrage_modules')
      .update({ valeur: newValeur, updated_at: new Date().toISOString() })
      .eq('module', 'annuaire')
      .eq('section', section)
      .eq('cle', cle)
      .select();

    if (error) {
      toast(error.message, 'danger');
      return false;
    }
    return true;
  }

})(); /* IIFE */
