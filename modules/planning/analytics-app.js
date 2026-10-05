// =====================================================
// ANALYTICS-APP.JS V2.0.0
// Analyse multi-périodes planning
// V2 : Supabase via PlanningAnalytics.analyzeAll()
// Dépendances : window.bdb · PlanningAnalytics · PlanningMembers
// CDS : zéro console.log · zéro localStorage · escHtml · 3 états DOM
// =====================================================

(function () {
  'use strict';

  // ── CONSTANTES ───────────────────────────────────────────────────────

  const SALLES         = ['05','06','07','08'];
  const JOURS          = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI'];
  const CRENEAUX       = ['MATIN','APREM','SOIR'];
  const SLOTS_PER_WEEK = 60;
  const TOP_N          = 5;

  const PERIOD_RANGES = {
    Q1:[1,13], Q2:[14,26], Q3:[27,39], Q4:[40,53],
    H1:[1,26], H2:[27,53], ALL:[1,53]
  };
  const PERIOD_LABELS = {
    Q1:'1er trimestre (S01–S13)', Q2:'2e trimestre (S14–S26)',
    Q3:'3e trimestre (S27–S39)', Q4:'4e trimestre (S40–S52)',
    H1:'1er semestre (S01–S26)',  H2:'2e semestre (S27–S52)',
    ALL:'Toutes les semaines disponibles'
  };

  // ── ÉTAT ─────────────────────────────────────────────────────────────

  let allWeeks     = [];
  let currentWeeks = [];
  let currentAgg   = null;
  let currentPeriod = 'ALL';
  let currentYear   = null;
  let ideSort    = { col:'total', dir:'desc' };
  let chirSort   = { col:'slots', dir:'desc' };
  let ideFilter  = { text:'', role:'' };
  let ideModalBS  = null;
  let chirModalBS = null;

  // ── UTILITAIRES ──────────────────────────────────────────────────────

  const $ = id => document.getElementById(id);


  function dm(code) {
    return window.PlanningMembers?.display?.(code) || escHtml(code);
  }

  function pct(n, total) {
    return total > 0 ? Math.round((n / total) * 100) : 0;
  }

  function initials(code) {
    const name = window.PlanningMembers?.display?.(code) || code;
    return name.split(/[\s\-]/).map(p => (p[0]||'').toUpperCase()).slice(0,2).join('');
  }

  function showToast(msg) {
    const body = document.getElementById('toastBody');
    if (body) body.textContent = String(msg ?? '');
    const el = $('toastInfo');
    if (el) bootstrap.Toast.getOrCreateInstance(el).show();
  }

  function topN(arr, n) {
    const items = arr.slice(0, n);
    while (items.length < n) items.push(null);
    return items;
  }

  // ── CALCUL ÉTAT SLOT ─────────────────────────────────────────────────

  function computeSlotState(atoms) {
    if (!atoms || !atoms.length) return 'VIDE';
    if (atoms.some(a => Number(a.salle_fermee) === 1)) return 'FERME';
    const hasChir   = atoms.some(a => String(a.chirurgien||'').trim());
    const hasInstru = atoms.some(a =>
      String(a.role||'').toUpperCase()==='INSTRU' &&
      String(a.ide||'').trim() && Number(a.doublure)!==1);
    const hasPans   = atoms.some(a =>
      String(a.role||'').toUpperCase()==='PANSEUR' &&
      String(a.ide||'').trim() && Number(a.doublure)!==1);
    if (!hasChir) return 'VIDE';
    if (!hasInstru || !hasPans) return 'CRITIQUE';
    const instrAtom = atoms.find(a =>
      String(a.role||'').toUpperCase()==='INSTRU' && Number(a.doublure)!==1);
    const instrCode = String(instrAtom?.ide||'').trim().toUpperCase();
    const isQualif  = instrCode && !['INTERIMAIRE','ETUDIANT',''].includes(instrCode);
    const hasUrg    = atoms.some(a => String(a.creneau||'').toUpperCase()==='SOIR');
    const hasDbl    = atoms.some(a => Number(a.doublure)===1);
    const f = [!isQualif, hasUrg, hasDbl].filter(Boolean).length;
    return f===0 ? 'STABLE' : f===1 ? 'FRAGILE' : 'CRITIQUE';
  }

  function weekSlotCounts(rawWeek) {
    const aff = rawWeek?.affectations || [];
    const sm  = new Map();
    for (const a of aff) {
      if (String(a.secteur||'').toUpperCase()!=='SALLE') continue;
      const k = `${a.jour}||${a.creneau}||${a.salle}`;
      if (!sm.has(k)) sm.set(k, []);
      sm.get(k).push(a);
    }
    const c = { STABLE:0, FRAGILE:0, CRITIQUE:0, FERME:0, VIDE:0 };
    for (const j of JOURS) for (const cr of CRENEAUX) for (const s of SALLES)
      c[computeSlotState(sm.get(`${j}||${cr}||${s}`)||[])]++;
    return c;
  }

  // ── AGRÉGATION ───────────────────────────────────────────────────────

  function aggregateWeeks(weeks) {
    const slotTotals = { STABLE:0, FRAGILE:0, CRITIQUE:0, FERME:0, VIDE:0 };
    const ideMap     = new Map();
    const chirData   = new Map();
    const instrPairs = new Map();
    const pansPairs  = new Map();
    const ipPairs    = new Map();
    const trioMap    = new Map();
    const weeklyStats = [];
    let totalAff=0, totalVisc=0, totalOuv=0, totalDbl=0, totalCoul=0;

    for (const w of weeks) {
      // V2 : affectations viennent de w.affectations (exposé par analyzeAll V2.1)
      const aff  = w.affectations || [];
      const wKey = w.key;
      totalAff  += aff.length;

      const ws = weekSlotCounts({ affectations: aff });
      for (const st of Object.keys(slotTotals)) slotTotals[st] += ws[st];
      weeklyStats.push({ meta: w.meta, slots: ws });

      // Slot map → paires / trios
      const slotMap = new Map();
      for (const a of aff) {
        if (String(a.secteur||'').toUpperCase()!=='SALLE') continue;
        const sk = `${a.jour}||${a.creneau}||${a.salle}`;
        if (!slotMap.has(sk)) slotMap.set(sk, { chir:'', instru:'', panseur:'' });
        const slot = slotMap.get(sk);
        if (String(a.chirurgien||'').trim()) slot.chir = a.chirurgien;
        const role = String(a.role||'').toUpperCase();
        if (role==='INSTRU'  && String(a.ide||'').trim() && Number(a.doublure)!==1) slot.instru  = a.ide;
        if (role==='PANSEUR' && String(a.ide||'').trim() && Number(a.doublure)!==1) slot.panseur = a.ide;
      }
      for (const s of slotMap.values()) {
        if (s.chir && s.instru)              { const k=`${s.chir}||${s.instru}`;          instrPairs.set(k,(instrPairs.get(k)||0)+1); }
        if (s.chir && s.panseur)             { const k=`${s.chir}||${s.panseur}`;         pansPairs.set(k,(pansPairs.get(k)||0)+1);  }
        if (s.instru && s.panseur)           { const k=`${s.instru}||${s.panseur}`;       ipPairs.set(k,(ipPairs.get(k)||0)+1);      }
        if (s.chir && s.instru && s.panseur) { const k=`${s.chir}||${s.instru}||${s.panseur}`; trioMap.set(k,(trioMap.get(k)||0)+1); }
      }

      // IDE stats
      for (const a of aff) {
        const code = String(a.ide||'').trim();
        if (!code) continue;
        if (!ideMap.has(code)) ideMap.set(code, {
          total:0, instru:0, panseur:0, couloir:0, salle:0,
          visceral:0, ouverture:0, doublure:0, weekPresence:new Map()
        });
        const ide  = ideMap.get(code);
        const role = String(a.role||'').toUpperCase();
        const sect = String(a.secteur||'').toUpperCase();
        ide.total++;
        if (role==='INSTRU')          ide.instru++;
        if (role==='PANSEUR')         ide.panseur++;
        if (sect==='COULOIR')         { ide.couloir++; totalCoul++; }
        if (sect==='SALLE')           ide.salle++;
        if (Number(a.visceral)===1)   { ide.visceral++;  totalVisc++; }
        if (Number(a.ouverture)===1)  { ide.ouverture++; totalOuv++;  }
        if (Number(a.doublure)===1)   { ide.doublure++;  totalDbl++;  }
        ide.weekPresence.set(wKey, (ide.weekPresence.get(wKey)||0)+1);
      }

      // Chir stats
      for (const a of aff) {
        const code = String(a.chirurgien||'').trim();
        if (!code || String(a.secteur||'').toUpperCase()!=='SALLE') continue;
        if (!chirData.has(code)) chirData.set(code, {
          slots:new Set(), semaines:new Set(), salles:new Set(),
          matin:0, aprem:0, soir:0, instrIDEs:new Set(),
          weekPresence:new Map()
        });
        const c  = chirData.get(code);
        const sk = `${wKey}||${a.jour}||${a.creneau}||${a.salle}`;
        c.weekPresence.set(wKey, (c.weekPresence.get(wKey)||0)+1);
        if (!c.slots.has(sk)) {
          c.slots.add(sk);
          c.semaines.add(wKey);
          c.salles.add(String(a.salle||''));
          const cr = String(a.creneau||'').toUpperCase();
          if (cr==='MATIN') c.matin++;
          else if (cr==='APREM') c.aprem++;
          else if (cr==='SOIR')  c.soir++;
        }
      }
    }

    for (const [k] of instrPairs.entries()) {
      const [chir, ide] = k.split('||');
      if (chirData.has(chir)) chirData.get(chir).instrIDEs.add(ide);
    }

    const ideList = Array.from(ideMap.entries())
      .map(([code,d]) => ({ code, ...d }))
      .sort((a,b) => b.total - a.total);

    const chirList = Array.from(chirData.entries())
      .map(([code,d]) => ({
        code,
        slots:        d.slots.size,
        semaines:     d.semaines.size,
        salles:       d.salles.size,
        matin:        d.matin,
        aprem:        d.aprem,
        soir:         d.soir,
        ideDistincts: d.instrIDEs.size,
        weekPresence: d.weekPresence
      }))
      .sort((a,b) => b.slots - a.slots);

    const chirTotalSlots = new Map(chirList.map(c => [c.code, c.slots]));

    function toArr(map, fields) {
      return Array.from(map.entries())
        .map(([k,v]) => { const p=k.split('||'); const o={count:v}; fields.forEach((f,i)=>o[f]=p[i]||''); return o; })
        .sort((a,b) => b.count - a.count);
    }

    return {
      slotTotals, weeklyStats,
      totalAff, totalVisc, totalOuv, totalDbl, totalCoul,
      ideList, chirList, chirTotalSlots,
      instrPairs:     toArr(instrPairs, ['chir','ide']),
      pansPairs:      toArr(pansPairs,  ['chir','ide']),
      instrPansPairs: toArr(ipPairs,    ['instru','panseur']),
      trios:          toArr(trioMap,    ['chir','instru','panseur']),
      nbWeeks: weeks.length
    };
  }

  // ── COMPOSANTS PARTAGÉS ──────────────────────────────────────────────

  function topRow(item, rank, maxCount, labelHtml, badgeHtml, barColor) {
    if (!item) return `
      <div class="d-flex align-items-center gap-2 py-2 border-bottom border-light opacity-25">
        <span class="badge bg-light text-muted border" style="min-width:22px">${rank}</span>
        <span class="text-muted small fst-italic">—</span>
      </div>`;
    const w = maxCount > 0 ? Math.round((item.count/maxCount)*100) : 0;
    return `
      <div class="d-flex align-items-center gap-2 py-2 border-bottom border-light">
        <span class="badge bg-light text-dark border lh-base" style="min-width:22px">${rank}</span>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
            <span class="small fw-semibold">${labelHtml}</span>
            <div class="d-flex gap-1">${badgeHtml}</div>
          </div>
          <div class="cs-bar-track" style="height:5px">
            <div class="cs-bar-fill" style="width:${w}%;background:${barColor}"></div>
          </div>
        </div>
      </div>`;
  }

  function secTitle(icon, text) {
    return `<p class="text-uppercase fw-bold small text-muted mb-2 mt-3"><i class="bi ${icon} me-1"></i>${escHtml(text)}</p>`;
  }

  function statBloc(color, val, lbl, sub) {
    return `
      <div class="p-3 bg-light rounded border-start border-3 border-${color} h-100">
        <div class="fs-4 fw-bold text-${color} lh-1">${escHtml(String(val))}</div>
        <div class="text-uppercase fw-semibold text-muted mt-1" style="font-size:.68rem">${escHtml(lbl)}</div>
        <div class="analytics-sub mt-1">${escHtml(sub||'')}</div>
      </div>`;
  }

  function evoMiniChart(weekEvo) {
    const maxC = Math.max(...weekEvo.map(w => w.count), 1);
    return weekEvo.map(w => {
      const h   = w.count > 0 ? Math.max(Math.round((w.count/maxC)*60), 4) : 4;
      const bg  = w.count > 0 ? '#0d6efd' : '#e2e8f0';
      const lbl = `S${String(w.meta.semaine).padStart(2,'0')}`;
      return `
        <div class="d-flex flex-column align-items-center" style="min-width:44px"
             title="${escHtml(lbl)}/${w.meta.annee} · ${w.count}">
          <div style="height:64px;display:flex;flex-direction:column-reverse">
            <div style="height:${h}px;width:28px;background:${bg};border-radius:3px 3px 0 0"></div>
          </div>
          <div style="font-size:.62rem;color:#94a3b8;text-align:center;margin-top:3px">${escHtml(lbl)}</div>
        </div>`;
    }).join('');
  }

  // ── RENDU PAGE — KPI ─────────────────────────────────────────────────

  function renderKPI(agg) {
    const total = SLOTS_PER_WEEK * agg.nbWeeks;
    const opTot = agg.slotTotals.STABLE + agg.slotTotals.FRAGILE;
    const kpis  = [
      { val:agg.nbWeeks,             lbl:'Semaines',        icon:'bi-calendar3',         col:'primary',   sub:`${total} slots théoriques` },
      { val:`${pct(opTot,total)}%`,  lbl:'Taux opérant',    icon:'bi-check-circle-fill', col:'success',   sub:`${opTot} stable + fragile` },
      { val:agg.slotTotals.CRITIQUE, lbl:'Slots critiques', icon:'bi-x-circle-fill',     col:'danger',    sub:`+ ${agg.slotTotals.FRAGILE} fragiles` },
      { val:`${pct(agg.slotTotals.FERME,total)}%`, lbl:'Taux fermeture', icon:'bi-lock-fill', col:'secondary', sub:`${agg.slotTotals.FERME} fermés · ${agg.slotTotals.VIDE} vides` },
      { val:agg.totalVisc,           lbl:'Viscéral',        icon:'bi-heart-pulse-fill',  col:'danger',    sub:'Couloir → secteur viscéral' },
      { val:agg.totalDbl,            lbl:'Doublures',       icon:'bi-person-plus-fill',  col:'warning',   sub:'IDEs en encadrement' }
    ];
    $('kpiRow').innerHTML = kpis.map(k => `
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card shadow-sm kpi-card h-100 border-0">
          <div class="card-body text-center py-3 px-2">
            <i class="bi ${escHtml(k.icon)} fs-2 text-${escHtml(k.col)} mb-2 d-block"></i>
            <div class="kpi-value text-${escHtml(k.col)}">${escHtml(String(k.val))}</div>
            <div class="kpi-label text-muted mt-1">${escHtml(k.lbl)}</div>
            <div class="kpi-sub text-muted">${escHtml(k.sub)}</div>
          </div>
        </div>
      </div>`).join('');
  }

  // ── RENDU PAGE — DISTRIBUTION ────────────────────────────────────────

  function renderSlotDistrib(agg) {
    const total = SLOTS_PER_WEEK * agg.nbWeeks;
    const opTot = agg.slotTotals.STABLE + agg.slotTotals.FRAGILE;
    const states = [
      { key:'STABLE',   lbl:'Stable',   bg:'#16a34a' },
      { key:'FRAGILE',  lbl:'Fragile',  bg:'#ca8a04' },
      { key:'CRITIQUE', lbl:'Critique', bg:'#dc2626' },
      { key:'FERME',    lbl:'Fermé',    bg:'#9ca3af' },
      { key:'VIDE',     lbl:'Vide',     bg:'#e2e8f0' }
    ];
    $('slotDistrib').innerHTML = states.map(s => {
      const n=agg.slotTotals[s.key]||0, p=pct(n,total);
      return `
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="d-flex align-items-center gap-2">
              <span class="cs-dot" style="background:${s.bg}"></span>
              <span class="small fw-semibold">${s.lbl}</span>
            </span>
            <span class="small text-muted">${n} slots · <strong>${p}%</strong></span>
          </div>
          <div class="cs-bar-track">
            <div class="cs-bar-fill" style="width:${p}%;background:${s.bg}"></div>
          </div>
        </div>`;
    }).join('') + `
      <div class="mt-3 pt-2 border-top d-flex gap-4">
        <div><div class="analytics-sub">Total théorique</div><div class="fw-bold">${total}</div></div>
        <div><div class="analytics-sub">Opérants</div><div class="fw-bold text-success">${opTot} (${pct(opTot,total)}%)</div></div>
        <div><div class="analytics-sub">Non opérants</div><div class="fw-bold text-danger">${total-opTot}</div></div>
      </div>`;
  }

  // ── RENDU PAGE — ACTIVITÉ ────────────────────────────────────────────

  function renderActivity(agg) {
    const items = [
      { icon:'bi-list-ul',          col:'primary',   lbl:'Affectations totales', val:agg.totalAff  },
      { icon:'bi-arrow-left-right', col:'info',      lbl:'Couloir',              val:agg.totalCoul },
      { icon:'bi-sunrise',          col:'warning',   lbl:'Ouvertures',           val:agg.totalOuv  },
      { icon:'bi-heart-pulse',      col:'danger',    lbl:'Viscéral',             val:agg.totalVisc },
      { icon:'bi-person-plus',      col:'secondary', lbl:'Doublures',            val:agg.totalDbl  }
    ];
    $('activitySummary').innerHTML = items.map(it => `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
        <span class="d-flex align-items-center gap-2">
          <i class="bi ${it.icon} text-${it.col}"></i>
          <span class="small">${it.lbl}</span>
        </span>
        <span class="fw-bold">${it.val}</span>
      </div>`).join('') + `
      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle me-1"></i>
        Moy./sem. : ${Math.round(agg.totalAff/Math.max(agg.nbWeeks,1))} aff. ·
        ${Math.round(agg.totalDbl/Math.max(agg.nbWeeks,1))} doublures
      </div>`;
  }

  // ── RENDU PAGE — EVO CHART ───────────────────────────────────────────

  function renderEvoChart(agg) {
    if (!agg.weeklyStats.length) { $('evoChart').innerHTML=''; return; }
    $('evoChart').innerHTML = agg.weeklyStats.map(w => {
      const s    = w.slots;
      const segs = [
        { c:'#16a34a', n:s.STABLE   },
        { c:'#ca8a04', n:s.FRAGILE  },
        { c:'#dc2626', n:s.CRITIQUE },
        { c:'#9ca3af', n:s.FERME    }
      ];
      const bars = segs.map(seg => {
        const h = Math.round((seg.n/SLOTS_PER_WEEK)*64);
        return h>0 ? `<div class="evo-bar-seg" style="height:${h}px;background:${seg.c}"></div>` : '';
      }).join('');
      const lbl = `S${String(w.meta.semaine).padStart(2,'0')}`;
      return `
        <div class="evo-week d-flex flex-column align-items-center"
             title="${escHtml(lbl)}/${w.meta.annee} · ${s.STABLE} stables">
          <div class="evo-bar-wrap">${bars}</div>
          <div class="evo-label">${escHtml(lbl)}</div>
        </div>`;
    }).join('');
  }

  // ── RENDU PAGE — IDEs ────────────────────────────────────────────────

  function refreshIDETable(agg) {
    const filterTxt  = ideFilter.text.toLowerCase();
    const filterRole = ideFilter.role;

    let list = [...agg.ideList];
    if (filterTxt)  list = list.filter(i => (window.PlanningMembers?.display?.(i.code)||i.code).toLowerCase().includes(filterTxt));
    if (filterRole) list = list.filter(i => i[filterRole] > 0);

    list.sort((a,b) => {
      const dir = ideSort.dir==='asc' ? 1 : -1;
      if (ideSort.col==='name') return dir * (a.code < b.code ? -1 : 1);
      return dir * ((b[ideSort.col]||0) - (a[ideSort.col]||0));
    });

    $('ideBadge').textContent = `${list.length} IDE(s)`;

    // Mettre à jour icônes de tri
    document.querySelectorAll('#ideTable .sort-th').forEach(th => {
      const isActive = th.dataset.col === ideSort.col;
      th.classList.toggle('sort-active', isActive);
      const arr = th.querySelector('.sort-arrow');
      if (arr) arr.className = `sort-arrow bi ${isActive ? (ideSort.dir==='desc'?'bi-chevron-down':'bi-chevron-up') : 'bi-chevron-expand'}`;
    });

    $('ideTableBody').innerHTML = list.map((i,idx) => `
      <tr>
        <td class="ps-3 text-muted small">${idx+1}</td>
        <td><button class="btn btn-link btn-sm p-0 text-start fw-semibold" data-ide-code="${escHtml(i.code)}">${dm(i.code)}</button></td>
        <td class="text-center small">${i.total}</td>
        <td class="text-center small">${i.instru   || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${i.panseur  || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${i.couloir  || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${i.visceral || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${i.ouverture|| '<span class="text-muted">—</span>'}</td>
        <td class="text-center pe-3 small">${i.doublure  || '<span class="text-muted">—</span>'}</td>
      </tr>`).join('') ||
      '<tr><td colspan="9" class="text-center text-muted py-4 small"><i class="bi bi-inbox me-1"></i>Aucun résultat.</td></tr>';
  }

  function renderIDE(agg) { refreshIDETable(agg); }

  // ── RENDU PAGE — CHIRURGIENS ─────────────────────────────────────────

  function renderChir(agg) {
    const list = [...agg.chirList].sort((a,b) => {
      const dir = chirSort.dir==='asc' ? 1 : -1;
      if (chirSort.col==='name') return dir * (a.code < b.code ? -1 : 1);
      return dir * ((b[chirSort.col]||0) - (a[chirSort.col]||0));
    });

    $('chirBadge').textContent = `${list.length} chir.`;

    document.querySelectorAll('#chirTable .sort-th').forEach(th => {
      const isActive = th.dataset.col === chirSort.col;
      th.classList.toggle('sort-active', isActive);
      const arr = th.querySelector('.sort-arrow');
      if (arr) arr.className = `sort-arrow bi ${isActive ? (chirSort.dir==='desc'?'bi-chevron-down':'bi-chevron-up') : 'bi-chevron-expand'}`;
    });

    const maxSlots = list[0]?.slots || 1;
    $('chirTableBody').innerHTML = list.map((c,idx) => {
      const ideConcentColor = c.ideDistincts<=2?'danger': c.ideDistincts<=4?'warning':'success';
      return `<tr>
        <td class="ps-3 text-muted small">${idx+1}</td>
        <td><button class="btn btn-link btn-sm p-0 text-start fw-semibold" data-chir-code="${escHtml(c.code)}">${dm(c.code)}</button></td>
        <td class="text-center">
          <span class="fw-bold">${c.slots}</span>
          <div class="progress progress-xs mt-1">
            <div class="progress-bar" role="progressbar" style="width:${pct(c.slots,maxSlots)}%"></div>
          </div>
        </td>
        <td class="text-center small">${c.semaines}</td>
        <td class="text-center small">${c.salles}</td>
        <td class="text-center">
          <span class="badge bg-${ideConcentColor}-subtle text-${ideConcentColor}">${c.ideDistincts}</span>
        </td>
        <td class="text-center small">${c.matin || '<span class="text-muted">—</span>'}</td>
        <td class="text-center small">${c.aprem || '<span class="text-muted">—</span>'}</td>
        <td class="text-center pe-3 small">${c.soir  || '<span class="text-muted">—</span>'}</td>
      </tr>`;
    }).join('') ||
    '<tr><td colspan="9" class="text-center text-muted py-4 small"><i class="bi bi-inbox me-1"></i>Aucun chirurgien.</td></tr>';
  }

  // ── RENDU PAGE — PAIRES ──────────────────────────────────────────────

  function renderPairesBlock(id, pairs, keyA, keyB, barColor, chirTotalSlots) {
    const el=$(id);
    if (!pairs.length) { el.innerHTML='<p class="text-muted small p-3">Aucune paire détectée.</p>'; return; }
    const max5 = pairs[0].count||1;
    el.innerHTML = `<div class="p-3">` +
      pairs.slice(0,5).map((p,i) => {
        const w         = pct(p.count,max5);
        const ratioHtml = chirTotalSlots?.has(p[keyA])
          ? `<span class="badge bg-light text-muted border">${pct(p.count,chirTotalSlots.get(p[keyA]))}%&nbsp;chir</span>`
          : '';
        return `
          <div class="pair-item">
            <div class="d-flex align-items-start gap-2">
              <span class="badge bg-light text-dark border lh-base" style="min-width:22px">${i+1}</span>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                  <span class="small fw-semibold">${dm(p[keyA])}</span>
                  <div class="d-flex gap-1">
                    <span class="badge bg-primary-subtle text-primary">${p.count}×</span>
                    ${ratioHtml}
                  </div>
                </div>
                <div class="analytics-sub mb-1">avec ${dm(p[keyB])}</div>
                <div class="cs-bar-track" style="height:5px">
                  <div class="cs-bar-fill" style="width:${w}%;background:${barColor}"></div>
                </div>
              </div>
            </div>
          </div>`;
      }).join('') + `</div>`;
  }

  // ── RENDU PAGE — TRIOS GLOBAL ────────────────────────────────────────

  function renderTriosGlobal(agg) {
    $('triosBadge').textContent = `${agg.trios.length} trios distincts`;
    if (!agg.trios.length) {
      $('triosGlobalTable').innerHTML='<p class="text-muted fst-italic">Aucun trio détecté.</p>';
      return;
    }
    const top10 = agg.trios.slice(0,10);
    const max   = top10[0]?.count||1;
    $('triosGlobalTable').innerHTML = `<div class="row g-2">` +
      top10.map((t,i) => {
        const w         = pct(t.count,max);
        const ratioChir = agg.chirTotalSlots.has(t.chir)
          ? ` · ${pct(t.count,agg.chirTotalSlots.get(t.chir))}% des slots ${dm(t.chir)}`
          : '';
        return `
          <div class="col-md-6">
            <div class="d-flex align-items-start gap-2 p-2 bg-light rounded">
              <span class="badge bg-primary-subtle text-primary fw-bold" style="min-width:26px">${i+1}</span>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-1 flex-wrap gap-1">
                  <span class="small fw-semibold">${dm(t.chir)}</span>
                  <span class="badge bg-primary-subtle text-primary">${t.count}×</span>
                </div>
                <div class="d-flex gap-1 flex-wrap mb-1">
                  <span class="badge bg-primary-subtle text-primary"><i class="bi bi-person-badge me-1"></i>${dm(t.instru)}</span>
                  <span class="badge bg-success-subtle text-success"><i class="bi bi-scissors me-1"></i>${dm(t.panseur)}</span>
                </div>
                <div class="analytics-sub mb-1">${t.count} occurrence(s)${ratioChir}</div>
                <div class="progress progress-xs">
                  <div class="progress-bar" role="progressbar" style="width:${w}%"></div>
                </div>
              </div>
            </div>
          </div>`;
      }).join('') + `</div>`;
  }

  // ── RENDU PRINCIPAL ──────────────────────────────────────────────────

  function render(weeks) {
    currentWeeks = weeks;
    const hasData = weeks.length > 0;
    $('emptyState').classList.toggle('d-none', hasData);
    if (!hasData) {
      ['kpiRow','slotDistrib','activitySummary','evoChart',
       'ideTableBody','chirTableBody',
       'instrPairesTable','pansPairesTable','instrPansPairesTable','triosGlobalTable']
        .forEach(id => { const el=$(id); if (el) el.innerHTML=''; });
      currentAgg = null;
      return;
    }

    currentAgg = aggregateWeeks(weeks);

    const first=weeks[0].meta, last=weeks[weeks.length-1].meta;
    const rangeStr = first.semaine===last.semaine && first.annee===last.annee
      ? `S${String(first.semaine).padStart(2,'0')} / ${first.annee}`
      : `S${String(first.semaine).padStart(2,'0')}/${first.annee} → S${String(last.semaine).padStart(2,'0')}/${last.annee}`;

    $('selectionLabel').textContent = PERIOD_LABELS[currentPeriod]||currentPeriod;
    $('selectionBadge').textContent = `${weeks.length} semaine(s)`;
    $('selectionRange').textContent = rangeStr;
    const hBadge = $('headerBadge');
    if (hBadge) hBadge.textContent = `${weeks.length} sem.`;

    renderKPI(currentAgg);
    renderSlotDistrib(currentAgg);
    renderActivity(currentAgg);
    renderEvoChart(currentAgg);
    renderIDE(currentAgg);
    renderChir(currentAgg);
    renderPairesBlock('instrPairesTable',     currentAgg.instrPairs,     'chir','ide',      '#0d6efd', currentAgg.chirTotalSlots);
    renderPairesBlock('pansPairesTable',      currentAgg.pansPairs,      'chir','ide',      '#198754', currentAgg.chirTotalSlots);
    renderPairesBlock('instrPansPairesTable', currentAgg.instrPansPairs, 'instru','panseur','#0dcaf0', null);
    renderTriosGlobal(currentAgg);
  }

  // ── FILTRAGE PÉRIODE ─────────────────────────────────────────────────

  function filterWeeks(period, year) {
    const [sMin,sMax] = PERIOD_RANGES[period]||[1,53];
    return allWeeks.filter(w => {
      if (year && w.meta.annee!==year) return false;
      return w.meta.semaine>=sMin && w.meta.semaine<=sMax;
    });
  }

  function applySelection() { render(filterWeeks(currentPeriod, currentYear)); }

  // ── BOUTONS ANNÉE ────────────────────────────────────────────────────

  function buildYearButtons() {
    const years = [...new Set(allWeeks.map(w => w.meta.annee))].sort();
    const group = $('yearGroup');
    group.innerHTML = '';
    const mkBtn = (txt, year) => {
      const btn = document.createElement('button');
      btn.className = `btn btn-outline-dark btn-sm${currentYear===year?' active':''}`;
      btn.textContent = txt;
      btn.dataset.year = year===null?'all':year;
      return btn;
    };
    group.appendChild(mkBtn('Toutes', null));
    for (const y of years) group.appendChild(mkBtn(String(y), y));
  }

  // ── MODALES — PROFIL IDE ─────────────────────────────────────────────

  function buildIDEProfile(code, agg) {
    const d = agg.ideList.find(i => i.code===code);
    if (!d) return null;
    const chirTot     = agg.chirTotalSlots;
    const chirInstru  = agg.instrPairs.filter(p => p.ide===code)
      .map(p => ({ code:p.chir, count:p.count, ratioChir:pct(p.count, chirTot.get(p.chir)||1) }));
    const chirPanseur = agg.pansPairs.filter(p => p.ide===code)
      .map(p => ({ code:p.chir, count:p.count, ratioChir:pct(p.count, chirTot.get(p.chir)||1) }));
    const binomePanseurs = agg.instrPansPairs.filter(p => p.instru===code).map(p => ({ code:p.panseur, count:p.count }));
    const binomeInstrus  = agg.instrPansPairs.filter(p => p.panseur===code).map(p => ({ code:p.instru,  count:p.count }));
    const triosAsInstru  = agg.trios.filter(t => t.instru===code);
    const triosAsPanseur = agg.trios.filter(t => t.panseur===code);
    const avgTotal   = agg.ideList.length ? agg.totalAff / agg.ideList.length : 0;
    const chargeRatio= avgTotal > 0 ? Math.round((d.total/avgTotal)*100) : 100;
    const partVisc   = pct(d.visceral, agg.totalVisc||1);
    const partDbl    = pct(d.doublure, agg.totalDbl||1);
    const roles      = [d.instru, d.panseur, d.couloir].filter(v => v>0);
    const totR       = roles.reduce((s,v) => s+v, 0);
    let polyvalence  = 0;
    if (totR>0 && roles.length>1) {
      const h = roles.reduce((s,v) => { const p=v/totR; return s - p*Math.log2(p); }, 0);
      polyvalence = Math.round((h/Math.log2(3))*100);
    }
    return { code, d, chirInstru, chirPanseur, binomePanseurs, binomeInstrus,
             triosAsInstru, triosAsPanseur, chargeRatio, partVisc, partDbl, polyvalence, nbWeeks:agg.nbWeeks };
  }

  function renderIDETabResume(p) {
    const d=p.d, tot=d.total||1;
    const pI=pct(d.instru,tot), pP=pct(d.panseur,tot), pC=pct(d.couloir,tot);
    const chargeColor = p.chargeRatio>=120?'danger': p.chargeRatio>=90?'success': p.chargeRatio>=70?'warning':'secondary';
    const polyColor   = p.polyvalence>=70?'success': p.polyvalence>=40?'warning':'secondary';
    $('modalIDEResume').innerHTML = `
      <p class="text-uppercase fw-bold small text-muted mb-2">Profil de rôle</p>
      <div class="progress mb-1" style="height:22px;border-radius:4px">
        ${pI>0?`<div class="progress-bar bg-primary fw-semibold" role="progressbar" style="width:${pI}%">INSTRU ${pI}%</div>`:''}
        ${pP>0?`<div class="progress-bar bg-success fw-semibold" role="progressbar" style="width:${pP}%">PANSEUR ${pP}%</div>`:''}
        ${pC>0?`<div class="progress-bar bg-info fw-semibold"    role="progressbar" style="width:${pC}%">Couloir ${pC}%</div>`:''}
        ${(pI+pP+pC)===0?'<div class="progress-bar bg-secondary" style="width:100%">—</div>':''}
      </div>
      <div class="row g-2 mb-4">
        <div class="col-6 col-md-4">${statBloc('primary', d.total,       'Affectations',      `sur ${p.nbWeeks} semaine(s)`)}</div>
        <div class="col-6 col-md-4">${statBloc(chargeColor, p.chargeRatio+'%', 'Charge relative', 'vs moyenne groupe')}</div>
        <div class="col-6 col-md-4">${statBloc(polyColor,   p.polyvalence+'/100', 'Polyvalence', 'répartition des rôles')}</div>
        <div class="col-6 col-md-4">${statBloc('warning',   d.ouverture, 'Ouvertures',        pct(d.ouverture,(d.instru+d.panseur)||1)+'%')}</div>
        <div class="col-6 col-md-4">${statBloc('danger',    d.visceral,  'Viscéral',          p.partVisc+'% du total')}</div>
        <div class="col-6 col-md-4">${statBloc('secondary', d.doublure,  'Doublures portées', p.partDbl+'% du total')}</div>
      </div>`;
  }

  function renderIDETabPaires(p) {
    const N = 3;
    let html = '';
    html += `<div class="card border-primary-subtle mb-3"><div class="card-header bg-primary-subtle text-primary py-2"><strong>Top ${N} chirurgiens (INSTRU)</strong></div><div class="card-body p-3">`;
    const maxCI = p.chirInstru[0]?.count||1;
    topN(p.chirInstru, N).forEach((item,i) => {
      html += topRow(item, i+1, maxCI, item?dm(item.code):'', item?`<span class="badge bg-primary-subtle text-primary">${item.count}×</span>`:'', '#0d6efd');
    });
    html += `</div></div>`;
    html += `<div class="card border-success-subtle mb-3"><div class="card-header bg-success-subtle text-success py-2"><strong>Top ${N} chirurgiens (PANSEUR)</strong></div><div class="card-body p-3">`;
    const maxCP = p.chirPanseur[0]?.count||1;
    topN(p.chirPanseur, N).forEach((item,i) => {
      html += topRow(item, i+1, maxCP, item?dm(item.code):'', item?`<span class="badge bg-success-subtle text-success">${item.count}×</span>`:'', '#198754');
    });
    html += `</div></div>`;
    $('modalIDEPaires').innerHTML = html;
  }

  function renderIDETabEvo(p) {
    const weekEvo = currentWeeks.map(w => ({ meta:w.meta, count:p.d.weekPresence?.get(w.key)||0 }));
    $('modalIDEEvo').innerHTML = `
      <div class="row g-2 mb-4">
        <div class="col-4">${statBloc('primary', weekEvo.filter(w=>w.count>0).length, 'Semaines actives', `sur ${weekEvo.length} analysées`)}</div>
        <div class="col-4">${statBloc('success', pct(weekEvo.filter(w=>w.count>0).length,weekEvo.length)+'%', 'Taux présence', '')}</div>
        <div class="col-4">${statBloc('secondary', Math.round(p.d.total/Math.max(weekEvo.filter(w=>w.count>0).length,1)), 'Moy./sem.', 'active')}</div>
      </div>
      <div class="d-flex gap-1 align-items-end overflow-auto pb-1">${evoMiniChart(weekEvo)}</div>`;
  }

  function openIDEModal(code) {
    if (!currentAgg) return;
    const profile = buildIDEProfile(code, currentAgg);
    if (!profile) { showToast('Données introuvables.'); return; }
    new bootstrap.Tab($('ideTabResume-tab')).show();
    $('modalIDEInitials').textContent    = initials(code);
    $('modalIDEName').innerHTML          = dm(code);
    $('modalIDEPeriodLabel').textContent = `${PERIOD_LABELS[currentPeriod]||currentPeriod} · ${currentWeeks.length} semaine(s)`;
    renderIDETabResume(profile);
    renderIDETabPaires(profile);
    renderIDETabEvo(profile);
    if (!ideModalBS) ideModalBS = new bootstrap.Modal($('modalIDE'));
    ideModalBS.show();
  }

  // ── MODALES — PROFIL CHIRURGIEN ──────────────────────────────────────

  function buildChirProfile(code, agg) {
    const d = agg.chirList.find(c => c.code===code);
    if (!d) return null;
    const topInstru  = agg.instrPairs.filter(p => p.chir===code)
      .map(p => ({ code:p.ide, count:p.count, ratioChir:pct(p.count, d.slots||1) }));
    const topPanseur = agg.pansPairs.filter(p => p.chir===code)
      .map(p => ({ code:p.ide, count:p.count, ratioChir:pct(p.count, d.slots||1) }));
    const topTrios   = agg.trios.filter(t => t.chir===code);
    return { code, d, topInstru, topPanseur, topTrios };
  }

  function renderChirTabResume(p) {
    const d = p.d;
    const ideConcentColor = d.ideDistincts<=2?'danger':d.ideDistincts<=4?'warning':'success';
    const pM = pct(d.matin, d.slots), pS = pct(d.soir, d.slots);
    $('modalChirResume').innerHTML = `
      <div class="row g-2">
        <div class="col-6 col-md-4">${statBloc('primary',   d.slots,       'Slots uniques',      '')}</div>
        <div class="col-6 col-md-4">${statBloc('secondary', d.semaines,    'Semaines actives',   '')}</div>
        <div class="col-6 col-md-4">${statBloc('info',      d.salles,      'Salles distinctes',  '')}</div>
        <div class="col-6 col-md-4">${statBloc(ideConcentColor, d.ideDistincts,'IDEs INSTRU dist.',  d.ideDistincts<=2?'⚠ Concentration forte':'')}</div>
        <div class="col-6 col-md-4">${statBloc('warning',   d.matin,       'Slots Matin',        pM+'% de son activité')}</div>
        <div class="col-6 col-md-4">${statBloc('secondary', d.soir,        'Slots Soir',         pS+'% de son activité')}</div>
      </div>`;
  }

  function renderChirTabEquipe(p) {
    const N = TOP_N;
    let html = '';
    html += `<div class="card border-primary-subtle mb-3"><div class="card-header bg-primary-subtle text-primary py-2"><strong>Top ${N} INSTRU habituels</strong></div><div class="card-body p-3">`;
    const maxI = p.topInstru[0]?.count||1;
    topN(p.topInstru, N).forEach((item,i) => {
      html += topRow(item, i+1, maxI, item?dm(item.code):'', item?`<span class="badge bg-primary-subtle text-primary">${item.count}×</span>`:'', '#0d6efd');
    });
    html += `</div></div>`;
    html += `<div class="card border-success-subtle mb-3"><div class="card-header bg-success-subtle text-success py-2"><strong>Top ${N} PANSEUR habituels</strong></div><div class="card-body p-3">`;
    const maxP = p.topPanseur[0]?.count||1;
    topN(p.topPanseur, N).forEach((item,i) => {
      html += topRow(item, i+1, maxP, item?dm(item.code):'', item?`<span class="badge bg-success-subtle text-success">${item.count}×</span>`:'', '#198754');
    });
    html += `</div></div>`;
    $('modalChirEquipe').innerHTML = html;
  }

  function renderChirTabEvo(p) {
    const weekEvo = currentWeeks.map(w => ({ meta:w.meta, count:p.d.weekPresence?.get(w.key)||0 }));
    const present = weekEvo.filter(w=>w.count>0).length;
    $('modalChirEvo').innerHTML = `
      <div class="row g-2 mb-4">
        <div class="col-4">${statBloc('warning', present, 'Semaines actives', `sur ${weekEvo.length} analysées`)}</div>
        <div class="col-4">${statBloc('success', pct(present,weekEvo.length)+'%', 'Taux présence', '')}</div>
        <div class="col-4">${statBloc('primary', Math.round(p.d.slots/Math.max(present,1)), 'Moy. slots', 'par sem. active')}</div>
      </div>
      <div class="d-flex gap-1 align-items-end overflow-auto pb-1">${evoMiniChart(weekEvo)}</div>`;
  }

  function openChirModal(code) {
    if (!currentAgg) return;
    const profile = buildChirProfile(code, currentAgg);
    if (!profile) { showToast('Données introuvables.'); return; }
    new bootstrap.Tab($('chirTabResume-tab')).show();
    $('modalChirInitials').textContent   = initials(code);
    $('modalChirName').innerHTML         = dm(code);
    $('modalChirPeriodLabel').textContent= `${PERIOD_LABELS[currentPeriod]||currentPeriod} · ${currentWeeks.length} semaine(s)`;
    renderChirTabResume(profile);
    renderChirTabEquipe(profile);
    renderChirTabEvo(profile);
    if (!chirModalBS) chirModalBS = new bootstrap.Modal($('modalChir'));
    chirModalBS.show();
  }

  // ── CHARGEMENT ───────────────────────────────────────────────────────

  async function loadAllWeeks() {
    $('loadingSpinner').classList.remove('d-none');
    $('selectionLabel').textContent = 'Chargement…';
    try {
      // V2 : PlanningAnalytics.analyzeAll() — Supabase, expose affectations (V2.1)
      const results = await window.PlanningAnalytics.analyzeAll();
      allWeeks = results || [];
      allWeeks.sort((a,b) => (a.meta.annee-b.meta.annee)||(a.meta.semaine-b.meta.semaine));

      const navStatus = $('navStatus');
      if (navStatus) navStatus.textContent = `${allWeeks.length} sem. chargées`;

      buildYearButtons();
      applySelection();
    } catch(err) {
      showToast('Erreur lors du chargement des données : ' + (err?.message||'inconnue'));
    } finally {
      $('loadingSpinner').classList.add('d-none');
    }
  }

  // ── CÂBLAGE EVENTS ───────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    await window.bdbShellReady;

    if (window.PlanningMembers?.init) {
      await window.PlanningMembers.init().catch(() => {});
    }

    // Période
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        applySelection();
      });
    });

    // Année
    $('yearGroup').addEventListener('click', e => {
      const btn = e.target.closest('button[data-year]');
      if (!btn) return;
      document.querySelectorAll('#yearGroup button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentYear = btn.dataset.year==='all' ? null : Number(btn.dataset.year);
      applySelection();
    });

    // Tri IDEs
    document.querySelector('#ideTable thead').addEventListener('click', e => {
      const th = e.target.closest('th.sort-th');
      if (!th || !currentAgg) return;
      const col = th.dataset.col;
      ideSort = ideSort.col===col
        ? { col, dir: ideSort.dir==='desc'?'asc':'desc' }
        : { col, dir: col==='name'?'asc':'desc' };
      renderIDE(currentAgg);
    });

    // Tri Chirurgiens
    document.querySelector('#chirTable thead').addEventListener('click', e => {
      const th = e.target.closest('th.sort-th');
      if (!th || !currentAgg) return;
      const col = th.dataset.col;
      chirSort = chirSort.col===col
        ? { col, dir: chirSort.dir==='desc'?'asc':'desc' }
        : { col, dir: col==='name'?'asc':'desc' };
      renderChir(currentAgg);
    });

    // Filtre texte IDE
    $('ideFilterText').addEventListener('input', () => {
      ideFilter.text = $('ideFilterText').value.trim();
      if (currentAgg) refreshIDETable(currentAgg);
    });

    // Filtre rôle IDE
    $('ideFilterRole').addEventListener('change', () => {
      ideFilter.role = $('ideFilterRole').value;
      if (currentAgg) refreshIDETable(currentAgg);
    });

    // Délégation IDE + Chirurgien
    document.addEventListener('click', e => {
      const ideBtn  = e.target.closest('button[data-ide-code]');
      const chirBtn = e.target.closest('button[data-chir-code]');
      if (ideBtn) {
        try { openIDEModal(ideBtn.dataset.ideCode); }
        catch(err) { showToast('Erreur modale IDE : ' + err.message); }
      }
      if (chirBtn) {
        try { openChirModal(chirBtn.dataset.chirCode); }
        catch(err) { showToast('Erreur modale Chir : ' + err.message); }
      }
    });

    // Print
    $('btnPrint')?.addEventListener('click', () => window.print());

    // Tooltips Bootstrap
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    // Lancement
    await loadAllWeeks();
  });

})();
