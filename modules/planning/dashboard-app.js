// =====================================================
// DASHBOARD-APP.JS V2.0.0
// Dashboard planning — analyse semaine unique
// Dépendances : window.bdb · PlanningAnalytics · PlanningMembers
// CDS : zéro console.log · zéro localStorage · escHtml · 3 états DOM
// =====================================================

(function () {
  'use strict';

  // ── UTILITAIRES ──────────────────────────────────────────────────────

  function $(id) { return document.getElementById(id); }


  function showToast(msg) {
    const el = $('toastInfo');
    if (!el) return;
    el.querySelector('.toast-body').textContent = String(msg ?? '');
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  function displayMember(code) {
    if (!code) return '—';
    return window.PlanningMembers?.display?.(code) || escHtml(code);
  }

  function isKnown(code) {
    return window.PlanningMembers?.isKnown?.(code) ?? true;
  }

  function labelCreneau(c) {
    const map = { MATIN: 'Matin', APREM: 'Après-m.', SOIR: 'Soir' };
    return map[String(c).toUpperCase()] || c;
  }

  // ── CONSTANTES ───────────────────────────────────────────────────────

  const JOURS    = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
  const CRENEAUX = ['MATIN', 'APREM', 'SOIR'];
  const SALLES   = ['05', '06', '07', '08'];

  // ── ÉTAT SLOT Vn (CALCULÉ) ───────────────────────────────────────────

  function computeSlotState(atoms) {
    if (!atoms || atoms.length === 0) return 'VIDE';
    if (atoms.some(a => Number(a.salle_fermee) === 1)) return 'FERME';

    const hasChir   = atoms.some(a => String(a.chirurgien || '').trim());
    const hasInstru = atoms.some(a =>
      String(a.role || '').toUpperCase() === 'INSTRU' &&
      String(a.ide  || '').trim() &&
      Number(a.doublure) !== 1
    );
    const hasPans = atoms.some(a =>
      String(a.role || '').toUpperCase() === 'PANSEUR' &&
      String(a.ide  || '').trim() &&
      Number(a.doublure) !== 1
    );

    if (!hasChir) return 'VIDE';
    if (!hasInstru || !hasPans) return 'CRITIQUE';

    const instrAtom  = atoms.find(a => String(a.role || '').toUpperCase() === 'INSTRU' && Number(a.doublure) !== 1);
    const instrCode  = String(instrAtom?.ide || '').trim().toUpperCase();
    const isQualifie = instrCode && !['INTERIMAIRE', 'ETUDIANT', 'VISCERAL', ''].includes(instrCode);
    const hasUrgence = atoms.some(a => String(a.creneau || '').toUpperCase() === 'SOIR');
    const hasDbl     = atoms.some(a => Number(a.doublure) === 1);

    const factors = [!isQualifie, hasUrgence, hasDbl].filter(Boolean).length;
    if (factors === 0) return 'STABLE';
    if (factors === 1) return 'FRAGILE';
    return 'CRITIQUE';
  }

  const STATE_CONFIG = {
    STABLE:   { cssClass: 'slot-stable',   icon: 'bi-check-circle-fill',       label: 'Stable',   colorClass: 'cs-color-stable'   },
    FRAGILE:  { cssClass: 'slot-fragile',  icon: 'bi-exclamation-circle-fill', label: 'Fragile',  colorClass: 'cs-color-fragile'  },
    CRITIQUE: { cssClass: 'slot-critique', icon: 'bi-x-circle-fill',           label: 'Critique', colorClass: 'cs-color-critique' },
    FERME:    { cssClass: 'slot-ferme',    icon: 'bi-lock-fill',               label: 'Fermé',    colorClass: 'cs-color-ferme'    },
    VIDE:     { cssClass: 'slot-vide',     icon: 'bi-dash-circle',             label: 'Vide',     colorClass: 'cs-color-vide'     }
  };

  // ── SLOT MAP ─────────────────────────────────────────────────────────

  function buildSlotMap(affectations) {
    const map = new Map();
    for (const a of (affectations || [])) {
      if (String(a.secteur || '').toUpperCase() !== 'SALLE') continue;
      const key = `${String(a.jour || '').toUpperCase()}||${String(a.creneau || '').toUpperCase()}||${a.salle}`;
      if (!map.has(key)) map.set(key, { jour: a.jour, creneau: a.creneau, salle: a.salle, atoms: [] });
      map.get(key).atoms.push(a);
    }
    return map;
  }

  // ── RENDER : KPI ─────────────────────────────────────────────────────

  function renderKPI(data, slotMap) {
    const counts = { STABLE: 0, FRAGILE: 0, CRITIQUE: 0, FERME: 0, VIDE: 0 };
    const totalTheoretical = SALLES.length * JOURS.length * CRENEAUX.length;

    for (const jour of JOURS)
      for (const creneau of CRENEAUX)
        for (const salle of SALLES)
          counts[computeSlotState((slotMap.get(`${jour}||${creneau}||${salle}`)?.atoms || []))]++;

    const totals = data?.stats?.totals || {};
    const kpis = [
      { value: counts.STABLE,        label: 'Slots stables',    icon: 'bi-check-circle-fill',      color: 'success',   sub: `sur ${totalTheoretical} possibles` },
      { value: counts.FRAGILE,       label: 'Slots fragiles',   icon: 'bi-exclamation-triangle-fill', color: 'warning', sub: '1 facteur de complexité' },
      { value: counts.CRITIQUE,      label: 'Slots critiques',  icon: 'bi-x-circle-fill',           color: 'danger',    sub: 'non-opérant ou ≥ 2 facteurs' },
      { value: counts.FERME,         label: 'Salles fermées',   icon: 'bi-lock-fill',               color: 'secondary', sub: `+ ${counts.VIDE} vides` },
      { value: totals.ouvertures || 0, label: 'Ouvertures',     icon: 'bi-sunrise-fill',            color: 'primary',   sub: 'IDEs en poste d\'ouverture' },
      { value: totals.visceral   || 0, label: 'Viscéral',       icon: 'bi-heart-pulse-fill',        color: 'danger',    sub: 'saisies viscéral cette semaine' }
    ];

    $('kpiRow').innerHTML = kpis.map(k => `
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card shadow-sm kpi-card h-100 border-0">
          <div class="card-body text-center py-3 px-2">
            <i class="bi ${escHtml(k.icon)} fs-2 text-${escHtml(k.color)} mb-2 d-block"></i>
            <div class="kpi-value text-${escHtml(k.color)}">${k.value}</div>
            <div class="kpi-label mt-1">${escHtml(k.label)}</div>
            <div class="kpi-sub">${escHtml(k.sub)}</div>
          </div>
        </div>
      </div>`).join('');
  }

  // ── RENDER : MATRICE ─────────────────────────────────────────────────

  function renderSlotsMatrix(slotMap) {
    const table = $('slotsMatrix');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const trJours = document.createElement('tr');
    const thEmpty = document.createElement('th');
    thEmpty.scope = 'col';
    thEmpty.className = 'ps-3 small text-muted align-middle';
    thEmpty.textContent = 'Salle';
    trJours.appendChild(thEmpty);
    JOURS.forEach(jour => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.colSpan = CRENEAUX.length;
      th.className = 'text-center matrix-header-day border-start py-2';
      th.textContent = jour;
      trJours.appendChild(th);
    });
    thead.appendChild(trJours);

    const trCreneaux = document.createElement('tr');
    trCreneaux.appendChild(document.createElement('th'));
    JOURS.forEach(() => {
      CRENEAUX.forEach((creneau, ci) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'text-center dash-creneau-label text-muted fw-normal py-1' + (ci === 0 ? ' border-start' : '');
        th.textContent = labelCreneau(creneau);
        trCreneaux.appendChild(th);
      });
    });
    thead.appendChild(trCreneaux);

    for (const salle of SALLES) {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.className = 'ps-3 fw-semibold small align-middle';
      tdLabel.textContent = `Salle ${Number(salle)}`;
      tr.appendChild(tdLabel);

      for (const jour of JOURS) {
        for (const creneau of CRENEAUX) {
          const ci    = CRENEAUX.indexOf(creneau);
          const key   = `${jour}||${creneau}||${salle}`;
          const slot  = slotMap.get(key);
          const state = computeSlotState(slot?.atoms || []);
          const cfg   = STATE_CONFIG[state];

          const td   = document.createElement('td');
          td.className = 'align-middle p-1' + (ci === 0 ? ' border-start' : '');

          const cell = document.createElement('div');
          cell.className = `matrix-cell ${cfg.cssClass}`;
          cell.title = `${jour} — ${labelCreneau(creneau)} — Salle ${Number(salle)} : ${cfg.label}`;

          const icon = document.createElement('i');
          icon.className = `bi ${cfg.icon}`;
          cell.appendChild(icon);

          if (slot && state !== 'VIDE' && state !== 'FERME') {
            const chirAtom = slot.atoms.find(a => String(a.chirurgien || '').trim());
            if (chirAtom) {
              const chirDiv = document.createElement('div');
              chirDiv.className = 'matrix-cell-chir';
              chirDiv.textContent = displayMember(chirAtom.chirurgien);
              cell.appendChild(chirDiv);
            }
          }
          td.appendChild(cell);
          tr.appendChild(td);
        }
      }
      tbody.appendChild(tr);
    }
  }

  // ── RENDER : RÉPARTITION ÉTATS ───────────────────────────────────────

  function renderSlotDistribution(slotMap) {
    const counts = { STABLE: 0, FRAGILE: 0, CRITIQUE: 0, FERME: 0, VIDE: 0 };
    for (const [, slot] of slotMap) counts[computeSlotState(slot.atoms)]++;

    const totalFromMap = Object.values(counts).reduce((s, v) => s + v, 0);
    counts.VIDE += Math.max(0, SALLES.length * JOURS.length * CRENEAUX.length - totalFromMap);

    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    const items = [
      { key: 'STABLE',   label: 'Stable'   },
      { key: 'FRAGILE',  label: 'Fragile'  },
      { key: 'CRITIQUE', label: 'Critique' },
      { key: 'FERME',    label: 'Fermé'    },
      { key: 'VIDE',     label: 'Vide'     }
    ];

    const container = $('slotDistribution');
    container.innerHTML = '';

    for (const item of items) {
      const pct = Math.round(counts[item.key] / total * 100);
      const cfg = STATE_CONFIG[item.key];

      const row = document.createElement('div');
      row.className = 'd-flex align-items-center gap-2 mb-2';

      const dot = document.createElement('span');
      dot.className = `cs-swatch-dot ${cfg.colorClass}`;

      const lbl = document.createElement('span');
      lbl.className = 'small dash-dist-label';
      lbl.textContent = item.label;

      const trackWrap = document.createElement('div');
      trackWrap.className = 'flex-grow-1';
      const track = document.createElement('div');
      track.className = 'cs-bar-track';
      const fill = document.createElement('div');
      fill.className = `cs-bar-fill ${cfg.colorClass}`;
      fill.setAttribute('role', 'progressbar');
      fill.setAttribute('aria-valuenow', String(pct));
      fill.setAttribute('aria-valuemin', '0');
      fill.setAttribute('aria-valuemax', '100');
      fill.setAttribute('aria-label', `${item.label} ${pct}%`);
      track.appendChild(fill);
      trackWrap.appendChild(track);
      requestAnimationFrame(() => { fill.style.width = pct + '%'; });

      const stat = document.createElement('span');
      stat.className = 'small text-muted text-end dash-dist-stat';
      stat.textContent = `${counts[item.key]} (${pct}%)`;

      row.append(dot, lbl, trackWrap, stat);
      container.appendChild(row);
    }
  }

  // ── RENDER : ACTIVITÉ SALLES ─────────────────────────────────────────

  function renderSalleActivity(slotMap) {
    const totalSlots = JOURS.length * CRENEAUX.length;
    const container  = $('salleActivity');
    container.innerHTML = '';

    for (const salle of SALLES) {
      let actif = 0, ferme = 0;
      for (const jour of JOURS)
        for (const creneau of CRENEAUX) {
          const slot  = slotMap.get(`${jour}||${creneau}||${salle}`);
          const state = computeSlotState(slot?.atoms || []);
          if (state === 'FERME') ferme++;
          else if (state !== 'VIDE') actif++;
        }

      const vide     = totalSlots - actif - ferme;
      const pctActif = Math.round(actif / totalSlots * 100);
      const pctFerme = Math.round(ferme / totalSlots * 100);
      const pctVide  = 100 - pctActif - pctFerme;

      const wrap   = document.createElement('div');
      wrap.className = 'mb-3';

      const header = document.createElement('div');
      header.className = 'd-flex justify-content-between align-items-center mb-1';
      header.innerHTML = `
        <span class="fw-semibold small">Salle ${Number(salle)}</span>
        <span class="small text-muted">${actif} actif · ${ferme} fermé · ${vide} vide</span>`;

      const trackWrap = document.createElement('div');
      trackWrap.className = 'cs-bar-track-lg';
      const barContainer = document.createElement('div');
      barContainer.className = 'd-flex h-100';
      barContainer.setAttribute('role', 'img');
      barContainer.setAttribute('aria-label', `Salle ${Number(salle)} : ${pctActif}% actif, ${pctFerme}% fermé`);

      const barActif = document.createElement('div');
      barActif.className = 'cs-bar-fill cs-color-actif';
      barActif.title = `Actif ${pctActif}%`;
      const barFerme = document.createElement('div');
      barFerme.className = 'cs-bar-fill cs-color-ferme-b';
      barFerme.title = `Fermé ${pctFerme}%`;

      barContainer.append(barActif, barFerme);
      trackWrap.appendChild(barContainer);
      requestAnimationFrame(() => {
        barActif.style.width = pctActif + '%';
        barFerme.style.width = pctFerme + '%';
      });

      const legend = document.createElement('div');
      legend.className = 'd-flex gap-3 mt-1';
      legend.innerHTML = `
        <span class="small"><span class="cs-swatch-dot cs-color-actif me-1"></span>${pctActif}% actif</span>
        <span class="small"><span class="cs-swatch-dot cs-color-ferme-b me-1"></span>${pctFerme}% fermé</span>
        <span class="small"><span class="cs-swatch-dot dash-vide-dot me-1"></span>${pctVide}% vide</span>`;

      wrap.append(header, trackWrap, legend);
      container.appendChild(wrap);
    }
  }

  // ── RENDER : IDEs ────────────────────────────────────────────────────

  function buildIDEMap(affectations) {
    const map = new Map();
    function get(code) {
      if (!map.has(code)) map.set(code, { instru: 0, panseur: 0, couloir: 0, ouverture: 0, visceral: 0, doublure: 0 });
      return map.get(code);
    }
    for (const a of (affectations || [])) {
      const code = String(a.ide || '').trim();
      if (!code) continue;
      const sect = String(a.secteur || '').toUpperCase();
      const role = String(a.role    || '').toUpperCase();
      const d = get(code);
      if (sect === 'COULOIR')                              d.couloir++;
      if (role === 'INSTRU'  && Number(a.doublure) !== 1) d.instru++;
      if (role === 'PANSEUR' && Number(a.doublure) !== 1) d.panseur++;
      if (Number(a.ouverture) === 1)                      d.ouverture++;
      if (Number(a.visceral)  === 1)                      d.visceral++;
      if (Number(a.doublure)  === 1)                      d.doublure++;
    }
    return map;
  }

  function renderIDECharts(affectations) {
    const ideMap = buildIDEMap(affectations);
    const sorted = [...ideMap.entries()]
      .map(([code, v]) => ({ code, ...v, total: v.instru + v.panseur + v.couloir }))
      .sort((a, b) => b.total - a.total)
      .filter(ide => ide.total > 0);

    $('ideCount').textContent = `${sorted.length} IDEs`;
    const maxTotal = sorted[0]?.total || 1;
    const top      = sorted.slice(0, 10);

    // Rôles
    const roleContainer = $('ideRoleChart');
    roleContainer.innerHTML = '';
    if (!top.length) {
      roleContainer.innerHTML = '<p class="text-muted small text-center py-3">Aucune donnée saisie.</p>';
    } else {
      for (const ide of top) {
        const pctI = Math.round(ide.instru  / maxTotal * 100);
        const pctP = Math.round(ide.panseur / maxTotal * 100);
        const row  = document.createElement('div');
        row.className = 'dispatch-row';
        row.innerHTML = `
          <span class="dispatch-label">${displayMember(ide.code)}</span>
          <div>
            <div class="d-flex gap-1 align-items-center mb-1">
              <span class="dispatch-sub-label">INSTRU</span>
              <div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-instru" data-pct="${pctI}"></div></div>
              <span class="dash-xs-text text-muted">${ide.instru}</span>
            </div>
            <div class="d-flex gap-1 align-items-center">
              <span class="dispatch-sub-label">PANSEUR</span>
              <div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-panseur" data-pct="${pctP}"></div></div>
              <span class="dash-xs-text text-muted">${ide.panseur}</span>
            </div>
          </div>
          <span class="dispatch-total">${ide.total}</span>`;
        roleContainer.appendChild(row);
      }
      requestAnimationFrame(() => {
        roleContainer.querySelectorAll('.cs-bar-fill[data-pct]').forEach(el => {
          el.style.width = el.dataset.pct + '%';
        });
      });
    }

    // Dispatch
    const dispContainer = $('ideDispatchChart');
    dispContainer.innerHTML = '';
    const dispTop = sorted.filter(ide => ide.couloir + ide.ouverture + ide.visceral > 0).slice(0, 10);
    if (!dispTop.length) {
      dispContainer.innerHTML = '<p class="text-muted small text-center py-3">Aucune donnée de dispatch.</p>';
    } else {
      const maxDisp = Math.max(...dispTop.map(ide => ide.couloir + ide.ouverture + ide.visceral), 1);
      for (const ide of dispTop) {
        const dispTotal = ide.couloir + ide.ouverture + ide.visceral;
        const pctC = Math.round(ide.couloir   / dispTotal * 100);
        const pctO = Math.round(ide.ouverture / dispTotal * 100);
        const pctV = Math.round(ide.visceral  / dispTotal * 100);

        let barsHTML = '';
        if (ide.couloir)   barsHTML += `<div class="d-flex gap-1 align-items-center mb-1"><span class="dispatch-sub-label">Couloir</span><div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-couloir" data-pct="${pctC}"></div></div><span class="dash-xs-text text-muted">${ide.couloir}</span></div>`;
        if (ide.ouverture) barsHTML += `<div class="d-flex gap-1 align-items-center mb-1"><span class="dispatch-sub-label">Ouverture</span><div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-ouvert" data-pct="${pctO}"></div></div><span class="dash-xs-text text-muted">${ide.ouverture}</span></div>`;
        if (ide.visceral)  barsHTML += `<div class="d-flex gap-1 align-items-center"><span class="dispatch-sub-label">Viscéral</span><div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-visceral" data-pct="${pctV}"></div></div><span class="dash-xs-text text-muted">${ide.visceral}</span></div>`;

        const row = document.createElement('div');
        row.className = 'dispatch-row';
        row.innerHTML = `<span class="dispatch-label">${displayMember(ide.code)}</span><div>${barsHTML}</div><span class="dispatch-total">${dispTotal}</span>`;
        dispContainer.appendChild(row);
      }
      requestAnimationFrame(() => {
        dispContainer.querySelectorAll('.cs-bar-fill[data-pct]').forEach(el => {
          el.style.width = el.dataset.pct + '%';
        });
      });
    }

    // Tableau détail
    const tbody = $('ideDetailTable');
    function intensityClass(v, max) {
      if (!v) return 'td-low';
      if (v >= max * .6) return 'td-high';
      if (v >= max * .3) return 'td-medium';
      return '';
    }
    const maxInstru  = Math.max(...sorted.map(s => s.instru),  1);
    const maxPanseur = Math.max(...sorted.map(s => s.panseur), 1);

    tbody.innerHTML = sorted.slice(0, 25).map(ide => `
      <tr>
        <td class="ps-3 fw-semibold small">${isKnown(ide.code) ? displayMember(ide.code) : `<span class="text-danger fw-semibold">${displayMember(ide.code)}</span>`}</td>
        <td class="text-center small ${intensityClass(ide.instru,   maxInstru)}">${ide.instru   || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small ${intensityClass(ide.panseur, maxPanseur)}">${ide.panseur  || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${ide.couloir   || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${ide.ouverture || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${ide.visceral  || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${ide.doublure  || '<span class="text-muted">—</span>'}</td>
        <td class="text-center pe-3 fw-bold">${ide.total}</td>
      </tr>`).join('');
  }

  // ── RENDER : CHIRURGIENS ─────────────────────────────────────────────

  function renderChirurgiens(affectations) {
    const slotChirSet = new Map();
    for (const a of (affectations || [])) {
      const code = String(a.chirurgien || '').trim();
      if (!code || String(a.secteur || '').toUpperCase() !== 'SALLE') continue;
      const key = `${String(a.jour||'').toUpperCase()}||${String(a.creneau||'').toUpperCase()}||${a.salle}`;
      if (!slotChirSet.has(key)) slotChirSet.set(key, a);
    }

    const chirMap = new Map();
    for (const [, a] of slotChirSet) {
      const code = String(a.chirurgien || '').trim();
      if (!chirMap.has(code)) chirMap.set(code, {
        total: 0, salles: { '05':0, '06':0, '07':0, '08':0 }, creneaux: { MATIN: 0, APREM: 0, SOIR: 0 }
      });
      const d = chirMap.get(code);
      d.total++;
      const s = String(a.salle || '');
      if (SALLES.includes(s)) d.salles[s]++;
      const c = String(a.creneau || '').toUpperCase();
      if (['MATIN','APREM','SOIR'].includes(c)) d.creneaux[c]++;
    }

    const sorted = [...chirMap.entries()].sort((a, b) => b[1].total - a[1].total);
    $('chirCount').textContent = `${sorted.length} chirurgien(s)`;

    $('chirTable').innerHTML = sorted.map(([code, d]) => `
      <tr>
        <td class="ps-3 fw-semibold small">${displayMember(code)}</td>
        <td class="text-center fw-bold">${d.total}</td>
        ${SALLES.map(s => `<td class="text-center small border-start">${d.salles[s] || '<span class="text-muted">—</span>'}</td>`).join('')}
        <td class="text-center small border-start">${d.creneaux.MATIN || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${d.creneaux.APREM              || '<span class="text-muted">—</span>'}</td>
        <td class="text-center pe-3 small">${d.creneaux.SOIR          || '<span class="text-muted">—</span>'}</td>
      </tr>`).join('') ||
      '<tr><td colspan="9" class="text-center text-muted py-4 small"><i class="bi bi-inbox me-1"></i>Aucun chirurgien dans les données.</td></tr>';
  }

  // ── RENDER : DOUBLURES ───────────────────────────────────────────────

  function renderDoublures(affectations) {
    const map = new Map();
    for (const a of (affectations || [])) {
      if (Number(a.doublure) !== 1) continue;
      const code = String(a.ide || '').trim();
      if (!code) continue;
      const key = `${code}||${String(a.doublure_sous||'').toUpperCase()}`;
      map.set(key, (map.get(key) || 0) + 1);
    }

    const container = $('doublureChart');
    if (!map.size) {
      container.innerHTML = '<p class="text-muted small text-center py-3"><i class="bi bi-check-circle text-success me-1"></i>Aucune doublure cette semaine.</p>';
      return;
    }

    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const maxV   = sorted[0][1];
    container.innerHTML = '';

    for (const [key, count] of sorted) {
      const [code, sous] = key.split('||');
      const pct = Math.round(count / maxV * 100);
      const row = document.createElement('div');
      row.className = 'assoc-row';
      row.innerHTML = `
        <span class="small fw-semibold text-truncate">${displayMember(code)}</span>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-warning-subtle text-dark small">${escHtml(sous || '?')}</span>
          <div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-doublure" data-pct="${pct}"></div></div>
        </div>
        <span class="small text-muted text-end">${count}</span>`;
      container.appendChild(row);
    }
    requestAnimationFrame(() => {
      container.querySelectorAll('.cs-bar-fill[data-pct]').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    });
  }

  // ── RENDER : PAIRES CHIR → INSTRU ────────────────────────────────────

  function renderPaires(data) {
    const pairs     = (data?.stats?.relations?.chirInstru || []).slice(0, 8);
    const container = $('pairesChart');
    if (!pairs.length) {
      container.innerHTML = '<p class="text-muted small text-center py-3">Aucune association.</p>';
      return;
    }
    const maxV = pairs[0].volume;
    container.innerHTML = '';
    for (const p of pairs) {
      const pct = Math.round(p.volume / maxV * 100);
      const row = document.createElement('div');
      row.className = 'assoc-row';
      row.innerHTML = `
        <span class="small fw-semibold text-truncate">${displayMember(p.chir)}</span>
        <div class="d-flex align-items-center gap-1">
          <span class="small text-muted text-truncate">${displayMember(p.ide)}</span>
          <div class="flex-grow-1 cs-bar-track"><div class="cs-bar-fill cs-color-assoc" data-pct="${pct}"></div></div>
        </div>
        <span class="small text-muted text-end">${p.volume}</span>`;
      container.appendChild(row);
    }
    requestAnimationFrame(() => {
      container.querySelectorAll('.cs-bar-fill[data-pct]').forEach(el => {
        el.style.width = el.dataset.pct + '%';
      });
    });
  }

  // ── RENDER : SITUATIONS ──────────────────────────────────────────────

  function renderSituations(situations) {
    const sitCfg = {
      SALLE_FERMEE_NATUREL:  { cls: 'sit-ferme',    icon: 'bi-lock'          },
      SALLE_FERMEE_DEGRADE:  { cls: 'sit-ferme',    icon: 'bi-lock-fill'     },
      URGENCE_FERMEE:        { cls: 'sit-urgence',  icon: 'bi-moon-stars'    },
      DOUBLURE:              { cls: 'sit-doublure', icon: 'bi-person-plus'   },
      VISCERAL_COULOIR_SOIR: { cls: 'sit-visceral', icon: 'bi-heart-pulse'   }
    };

    $('badgeSituations').textContent = String(situations.length);
    $('situationTotal').textContent  = `${situations.length} situation(s)`;

    const tbody = $('situationsTable');
    if (!situations.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4 small"><i class="bi bi-check-circle text-success me-2"></i>Aucune situation détectée.</td></tr>';
      return;
    }
    tbody.innerHTML = situations.map(s => {
      const cfg     = sitCfg[s.type] || { cls: 'bg-light text-dark', icon: 'bi-flag' };
      const typeLbl = String(s.type).replace(/_/g, ' ');
      return `<tr>
        <td class="ps-3"><span class="badge ${cfg.cls}"><i class="bi ${cfg.icon} me-1"></i>${escHtml(typeLbl)}</span></td>
        <td class="small">${escHtml(s.description)}</td>
        <td class="small text-muted">${escHtml(s.jour || '—')}</td>
        <td class="small text-muted">${s.salle ? 'Salle ' + escHtml(String(s.salle)) : '—'}</td>
        <td class="small text-muted pe-3">${escHtml(s.details || '—')}</td>
      </tr>`;
    }).join('');
  }

  // ── RENDER : TENDANCES ───────────────────────────────────────────────

  async function renderTendances() {
    const all       = await window.PlanningAnalytics.analyzeAll();
    const container = $('tendancesContent');

    if (!all || all.length < 2) {
      container.innerHTML = `
        <div class="card shadow-sm border-0">
          <div class="card-body text-center py-5">
            <i class="bi bi-graph-up dash-empty-icon d-block mb-3"></i>
            <p class="fw-semibold text-muted mb-1">Données insuffisantes</p>
            <small class="text-muted">Minimum 2 semaines. Recommandé : 5 semaines.</small>
            <div class="mt-3">
              <span class="badge bg-primary-subtle text-primary">${(all || []).length} semaine(s) disponible(s)</span>
            </div>
          </div>
        </div>`;
      return;
    }

    const rows = all.map(w => {
      const t        = w.stats.totals;
      const viscCell = (t.visceral  || 0) > 0 ? `<span class="trend-cell-high">${t.visceral}</span>`  : '<span class="trend-cell-zero">0</span>';
      const dblCell  = (t.doublures || 0) > 0 ? `<span class="td-medium">${t.doublures}</span>`       : '<span class="trend-cell-zero">0</span>';
      return `<tr>
        <td class="ps-3 fw-semibold small">S${String(w.meta.semaine).padStart(2,'0')}/${w.meta.annee}</td>
        <td class="text-center small">${t.affectations}</td>
        <td class="text-center small">${viscCell}</td>
        <td class="text-center small">${t.couloir   || '<span class="trend-cell-zero">0</span>'}</td>
        <td class="text-center small">${t.ouvertures || '<span class="trend-cell-zero">0</span>'}</td>
        <td class="text-center small">${dblCell}</td>
        <td class="text-center pe-3 small">${w.situations.length > 0 ? `<span class="badge bg-secondary-subtle text-secondary">${w.situations.length}</span>` : '<span class="trend-cell-zero">0</span>'}</td>
      </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
          <span class="fw-semibold"><i class="bi bi-graph-up me-2 text-primary"></i>Évolution sur ${all.length} semaines</span>
          <span class="badge bg-primary-subtle text-primary">${all.length} semaines disponibles</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover table-sm mb-0 align-middle">
            <thead class="bg-light">
              <tr>
                <th scope="col" class="ps-3">Semaine</th>
                <th scope="col" class="text-center">Affectations</th>
                <th scope="col" class="text-center"><i class="bi bi-heart-pulse text-danger me-1"></i>Viscéral</th>
                <th scope="col" class="text-center"><i class="bi bi-arrow-left-right text-info me-1"></i>Couloir</th>
                <th scope="col" class="text-center"><i class="bi bi-sunrise text-success me-1"></i>Ouvertures</th>
                <th scope="col" class="text-center"><i class="bi bi-person-plus text-warning me-1"></i>Doublures</th>
                <th scope="col" class="text-center pe-3">Situations</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-footer bg-transparent small text-muted">
          <i class="bi bi-info-circle me-1"></i>Toutes les semaines disponibles en base sont incluses.
        </div>
      </div>`;
  }

  // ── LOAD AND RENDER ──────────────────────────────────────────────────

  async function loadAndRender() {
    const semaine = Number($('weekInput')?.value  || 0);
    const annee   = Number($('yearInput')?.value  || 0);
    if (!semaine || !annee) { showToast('Semaine ou année invalide'); return; }

    $('emptyState').classList.add('d-none');
    $('dashContent').classList.add('d-none');
    $('dashLoading').classList.remove('d-none');
    $('dashLoading').classList.add('d-flex');

    try {
      // V2.1 : analyzeWeek retourne {meta, stats, situations, affectations}
      const data = await window.PlanningAnalytics.analyzeWeek(semaine, annee);

      $('dashLoading').classList.add('d-none');
      $('dashLoading').classList.remove('d-flex');

      if (!data) {
        showToast(`Semaine S${semaine}/${annee} introuvable`);
        $('emptyState').classList.remove('d-none');
        return;
      }

      const affectations = data.affectations || [];
      const slotMap      = buildSlotMap(affectations);

      const badge = $('headerWeekBadge');
      if (badge) badge.textContent = `S${String(semaine).padStart(2,'0')}/${annee}`;

      renderKPI(data, slotMap);
      renderSlotsMatrix(slotMap);
      renderSlotDistribution(slotMap);
      renderSalleActivity(slotMap);
      renderIDECharts(affectations);
      renderChirurgiens(affectations);
      renderDoublures(affectations);
      renderPaires(data);
      renderSituations(data.situations);
      await renderTendances();

      $('dashContent').classList.remove('d-none');

    } catch (err) {
      $('dashLoading').classList.add('d-none');
      $('dashLoading').classList.remove('d-flex');
      $('emptyState').classList.remove('d-none');
      showToast('Erreur : ' + (err?.message || 'inconnue'));
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────

  async function init() {
    // Charger les semaines ayant des affectations
    const { data: semaines, error } = await window.bdb
      .from('planning_semaines')
      .select('annee, semaine, id')
      .order('annee')
      .order('semaine')
      .limit(200);

    if (error) {
      showToast('Impossible de charger la liste des semaines');
      return;
    }

    if (!semaines?.length) return;

    // Trouver les semaines qui ont réellement des affectations
    const { data: semainesAvecData } = await window.bdb
      .from('planning_affectations')
      .select('semaine_id')
      .in('semaine_id', semaines.map(s => s.id))
      .limit(2000);

    const idsAvecData = new Set((semainesAvecData || []).map(a => a.semaine_id));
    const semainesActives = semaines.filter(s => idsAvecData.has(s.id));
    const listeAffichee  = semainesActives.length ? semainesActives : semaines;

    const available = $('availableWeeksList');
    if (available) {
      available.innerHTML = `<div class="small text-muted mb-2">Semaines disponibles :</div>
        <div class="d-flex flex-wrap gap-1 justify-content-center">
          ${listeAffichee.map(s =>
            `<button class="btn btn-sm btn-outline-secondary dash-week-shortcut" data-week="${s.semaine}" data-year="${s.annee}">S${String(s.semaine).padStart(2,'0')}/${s.annee}</button>`
          ).join('')}
        </div>`;

      available.addEventListener('click', e => {
        const btn = e.target.closest('.dash-week-shortcut');
        if (!btn) return;
        $('weekInput').value = btn.dataset.week;
        $('yearInput').value = btn.dataset.year;
        loadAndRender().catch(() => showToast('Erreur de chargement'));
      });
    }

    // Auto-charger la dernière semaine avec affectations
    const last = listeAffichee[listeAffichee.length - 1];
    $('weekInput').value = String(last.semaine);
    $('yearInput').value = String(last.annee);
    await loadAndRender();
  }

  // ── CÂBLAGE EVENTS ───────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    await window.bdbShellReady;

    if (window.PlanningMembers?.init) {
      await window.PlanningMembers.init().catch(() => {});
    }

    $('btnLoadWeek')?.addEventListener('click', () => loadAndRender().catch(() => showToast('Erreur de chargement')));
    $('btnRefresh')?.addEventListener('click',  () => loadAndRender().catch(() => showToast('Erreur de chargement')));
    $('weekInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') loadAndRender().catch(() => {}); });
    $('yearInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') loadAndRender().catch(() => {}); });

    await init();
  });

})();
