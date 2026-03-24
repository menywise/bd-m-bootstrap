/* thesaurus-analytics.js — BDB · CDS · Module thesaurus */
Object.assign(ThesApp, {

  // ════════════════════════════════════════════════════════════
  // ONGLET 2 — DASHBOARDS (données protocoles = déjà en mémoire)
  // ════════════════════════════════════════════════════════════
  initDashboard: function() {
    var d = this.data, total = d.length; if (!total) return;
    var self = this;
    var classif = d.filter(function(p){ return p.type && p.type !== ''; }).length;
    var avecDef = d.filter(function(p){ return p.definition_expert && p.definition_expert.length > 5; }).length;
    var crits   = d.filter(function(p){ return p.pareto === 'Critique'; }).length;
    document.getElementById('kpiTotalProto').textContent    = this.fmtNum(total);
    document.getElementById('kpiProtoSub').textContent      = total + ' protocoles Supabase';
    document.getElementById('kpiClassifies').textContent    = Math.round(classif / total * 100) + ' %';
    document.getElementById('kpiClassifiesSub').textContent = this.fmtNum(classif) + ' / ' + total;
    document.getElementById('kpiAvecDef').textContent       = Math.round(avecDef / total * 100) + ' %';
    document.getElementById('kpiAvecDefSub').textContent    = this.fmtNum(avecDef) + ' définitions';
    document.getElementById('kpiCritiques').textContent     = this.fmtNum(crits);

    var typeCounts = {};
    ['SEPTIQUE','TRAUMATO','NEURO','ORTHO','EXCLUS'].forEach(function(t){ typeCounts[t] = d.filter(function(p){ return p.type === t; }).length; });
    this._destroyChart('chartTypeDistrib');
    this.charts.typeDistrib = new Chart(document.getElementById('chartTypeDistrib'), {
      type:'bar', data:{ labels:Object.keys(typeCounts), datasets:[{ label:'Protocoles', data:Object.values(typeCounts),
        backgroundColor:Object.keys(typeCounts).map(function(t){ return self.typePalette(t); }), borderRadius:4 }]},
      options:{ indexAxis:'y', plugins:{legend:{display:false}},
        scales:{x:{beginAtZero:true,grid:{color:'#f3f4f6'}},y:{grid:{display:false}}}, responsive:true, maintainAspectRatio:true }
    });

    var parCounts = {Critique:0,Standard:0,Secondaire:0,Rare:0};
    d.forEach(function(p){ if(parCounts[p.pareto]!==undefined) parCounts[p.pareto]++; });
    this._destroyChart('chartPareto');
    this.charts.pareto = new Chart(document.getElementById('chartPareto'), {
      type:'doughnut', data:{ labels:['Critique','Standard','Secondaire','Rare'],
        datasets:[{data:Object.values(parCounts), backgroundColor:['#ef4444','#f59e0b','#06b6d4','#9ca3af'], borderWidth:2, borderColor:'#fff'}]},
      options:{plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:true, cutout:'60%'}
    });

    var sorted30 = [...d].sort(function(a,b){ return b.frequence-a.frequence; }).slice(0,30);
    var totalFreq = sorted30.reduce(function(s,p){ return s+p.frequence; },0), cumSum=0;
    var cumPct = sorted30.map(function(p){ cumSum+=p.frequence; return Math.round(cumSum/totalFreq*100); });
    this._destroyChart('chartCumulPareto');
    this.charts.cumul = new Chart(document.getElementById('chartCumulPareto'), {
      type:'bar', data:{ labels:sorted30.map(function(p){ return p.libelle_cible.substring(0,20)+'…'; }), datasets:[
        {type:'bar',label:'Fréquence',data:sorted30.map(function(p){return p.frequence;}),backgroundColor:'#93c5fd',borderRadius:3,yAxisID:'y'},
        {type:'line',label:'% cumulé',data:cumPct,borderColor:'#ef4444',backgroundColor:'transparent',borderWidth:2,pointRadius:0,yAxisID:'y2',
         segment:{borderColor:function(ctx){return ctx.p1.parsed.y>=80?'#22c55e':'#ef4444';}}}]},
      options:{plugins:{legend:{position:'top',labels:{font:{size:10}}}},
        scales:{x:{ticks:{font:{size:9},maxRotation:45},grid:{display:false}},
          y:{beginAtZero:true,grid:{color:'#f3f4f6'},position:'left'},
          y2:{beginAtZero:true,max:100,position:'right',grid:{drawOnChartArea:false},ticks:{callback:function(v){return v+'%';}}}},
        responsive:true, maintainAspectRatio:false}
    });

    var zoneSums = {};
    d.forEach(function(p){ if(p.zone_anat) zoneSums[p.zone_anat]=(zoneSums[p.zone_anat]||0)+p.frequence; });
    var topZones = Object.entries(zoneSums).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
    var maxZ = topZones[0]?topZones[0][1]:1;
    document.getElementById('dashZonesRanking').innerHTML = topZones.map(function(e){
      return '<div class="d-flex align-items-center gap-2 mb-2"><span class="thes-zone-label">'+escHtml(e[0])+'</span>'+
        '<div class="bar-track"><div class="bar-fill" style="width:'+Math.round(e[1]/maxZ*100)+'%"></div></div>'+
        '<span class="thes-zone-value">'+self.fmtNum(e[1])+'</span></div>';
    }).join('');

    var avecCCAM = d.filter(function(p){ return p.codes_ccam && p.codes_ccam.length > 2; }).length;
    document.getElementById('dashQualite').innerHTML = [
      {label:'Classification (type renseigné)',pct:Math.round(classif/total*100),cls:'bg-success'},
      {label:'Définitions expert disponibles', pct:Math.round(avecDef/total*100),cls:'bg-warning'},
      {label:'Codes CCAM renseignés',           pct:Math.round(avecCCAM/total*100),cls:'bg-info'}
    ].map(function(q){
      return '<div class="d-flex align-items-center gap-3 mb-3"><span class="thes-quality-label">'+escHtml(q.label)+'</span>'+
        '<div class="progress thes-quality-progress flex-grow-1"><div class="progress-bar '+q.cls+'" role="progressbar" style="width:'+q.pct+'%" '+
        'aria-valuenow="'+q.pct+'" aria-valuemin="0" aria-valuemax="100"></div></div>'+
        '<span class="thes-quality-pct">'+q.pct+' %</span></div>';
    }).join('');
  },

  _destroyChart: function(id) {
    var el = document.getElementById(id);
    if (el) { var c = Chart.getChart(el); if (c) c.destroy(); }
  },



  // ════════════════════════════════════════════════════════════
  // ONGLET 3 — CHIRURGIENS (Premium)
  // Stratégie : fetch complet chirurgien (cache), filtre année local
  // ════════════════════════════════════════════════════════════
  initChirurgiensUI: function() {
    var self = this;
    document.getElementById('btnModeAnalyse').addEventListener('click', function() {
      document.getElementById('chirModeAnalyse').classList.remove('d-none');
      document.getElementById('chirModeComparer').classList.add('d-none');
      document.getElementById('btnModeAnalyse').classList.add('active');
      document.getElementById('btnModeComparer').classList.remove('active');
    });
    document.getElementById('btnModeComparer').addEventListener('click', function() {
      document.getElementById('chirModeAnalyse').classList.add('d-none');
      document.getElementById('chirModeComparer').classList.remove('d-none');
      document.getElementById('btnModeComparer').classList.add('active');
      document.getElementById('btnModeAnalyse').classList.remove('active');
    });
    document.getElementById('btnAnalyseChir').addEventListener('click', function() { self._analyseChirurgien(); });
    document.getElementById('btnComparer').addEventListener('click', function() { self._comparerChirurgiens(); });
  },

  _rankBadge: function(i) {
    if (i < 3) return 'gold'; if (i < 6) return 'silver'; if (i < 10) return 'bronze'; return 'normal';
  },

  _analyseChirurgien: async function() {
    var chirId = document.getElementById('selectChirurgien').value;
    var annee  = document.getElementById('selectAnnee').value;
    if (!chirId) { this.toast('Error', 'Sélectionnez un chirurgien.'); return; }
    var chirLabel = this._chirLabel(chirId);
    var res = document.getElementById('chirResults');
    res.innerHTML = '<div class="thes-skeleton"><div class="thes-skeleton-row"></div><div class="thes-skeleton-row"></div><div class="thes-skeleton-row"></div><div class="thes-skeleton-row"></div><div class="mt-3 small text-muted">Chargement des données ' + escHtml(chirLabel) + '…</div></div>';

    var allInterv = await this._fetchInterv({ chirurgien_id: chirId });
    var interv = this._filterByAnnee(allInterv, annee || null);
    if (!interv.length) {
      res.innerHTML = '<div class="thes-loading-block"><i class="bi bi-inbox"></i>Aucune intervention' +
        (annee ? ' en ' + escHtml(annee) : '') + ' pour <strong>' + escHtml(chirLabel) + '</strong>.</div>';
      return;
    }

    var self = this;
    var protoMap = {}, typeMap = {ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0,EXCLUS:0};
    var zoneMap = {}, yearMap = {}, moisMap = {};
    interv.forEach(function(i) {
      var lib = i.protocole_operatoire;
      protoMap[lib] = (protoMap[lib]||0)+1;
      var pr = self._lookupProto(lib);
      if (pr) {
        if (pr.type && typeMap[pr.type] !== undefined) typeMap[pr.type]++;
        if (pr.zone_anat) zoneMap[pr.zone_anat] = (zoneMap[pr.zone_anat]||0)+1;
      }
      var d = String(i.date_intervention);
      var yr = d.substring(0,4); if (yr) yearMap[yr] = (yearMap[yr]||0)+1;
      var mo = d.substring(0,7); if (mo) moisMap[mo] = (moisMap[mo]||0)+1;
    });

    var top20 = Object.entries(protoMap).sort(function(a,b){return b[1]-a[1];}).slice(0,20);
    var totalInterv = interv.length;
    var protosD = Object.keys(protoMap).length;
    var moisActif = Object.entries(moisMap).sort(function(a,b){return b[1]-a[1];})[0];
    var topZones = Object.entries(zoneMap).sort(function(a,b){return b[1]-a[1];}).slice(0,6);
    var maxZone = topZones[0] ? topZones[0][1] : 1;
    var rares = Object.entries(protoMap).filter(function(e){return e[1] <= 3;}).sort(function(a,b){return a[1]-b[1];});
    var cumSum = 0;
    var top20cumul = top20.map(function(e) { cumSum += e[1]; return Math.round(cumSum/totalInterv*100); });

    var html = '';

    // KPI cards — style="color:#7c3aed" → class thes-kpi-purple
    html += '<div class="thes-chir-kpi-grid">' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon blue"><i class="bi bi-activity"></i></div><div><div class="thes-chir-kpi-val text-primary">' + this.fmtNum(totalInterv) + '</div><div class="thes-chir-kpi-label">Interventions' + (annee ? ' ('+escHtml(annee)+')' : '') + '</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon green"><i class="bi bi-journal-check"></i></div><div><div class="thes-chir-kpi-val text-success">' + protosD + '</div><div class="thes-chir-kpi-label">Protocoles distincts</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon amber"><i class="bi bi-calendar-check"></i></div><div><div class="thes-chir-kpi-val text-warning">' + escHtml(moisActif ? moisActif[0] : '—') + '</div><div class="thes-chir-kpi-label">Mois le + actif</div></div></div>' +
      '<div class="thes-chir-kpi-card"><div class="thes-chir-kpi-icon purple"><i class="bi bi-bar-chart-steps"></i></div><div><div class="thes-chir-kpi-val thes-kpi-purple">' + Math.round(protosD/420*100) + '%</div><div class="thes-chir-kpi-label">Diversité (vs 420)</div></div></div>' +
    '</div>';

    // Row 1 : Activité annuelle + Types doughnut
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-lg-8"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-graph-up"></i>Activité annuelle</div></div>' +
        '<div class="card-body p-3"><canvas id="chartChirYearly" height="180"></canvas></div></div></div>' +
      '<div class="col-12 col-lg-4"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-pie-chart"></i>Répartition types</div></div>' +
        '<div class="card-body p-3 d-flex align-items-center justify-content-center"><canvas id="chartChirType" height="200"></canvas></div></div></div>' +
    '</div>';

    // Row 2 : Top 20 Pareto — static width style= → CSS classes
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-lg-7"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between">' +
          '<div class="thes-section-title mb-0"><i class="bi bi-trophy"></i>Top 20 Pareto</div>' +
          '<span class="badge bg-primary-subtle text-primary">Top 20 = ' + (top20cumul[19] || top20cumul[top20cumul.length-1] || 0) + '% du volume</span></div>' +
        '<div class="card-body p-0"><div class="table-responsive"><table class="table table-sm table-hover mb-0">' +
          '<thead class="table-light"><tr><th class="text-center thes-col-rank-cell">#</th><th>Protocole</th><th class="text-end thes-col-nb-cell">Nb</th><th class="thes-col-part-cell">Part</th><th class="text-end thes-col-cum-cell">Cum.</th></tr></thead>' +
          '<tbody>' + top20.map(function(e, i) {
            var pct = Math.round(e[1]/totalInterv*100);
            var pr = self._lookupProto(e[0]);
            var typeClass = pr ? self.typeBadgeClass(pr.type) : 'bg-secondary';
            return '<tr><td class="text-center"><span class="thes-pareto-rank ' + self._rankBadge(i) + '">' + (i+1) + '</span></td>' +
              '<td><span class="small fw-medium">' + escHtml(e[0]) + '</span> <span class="badge ' + typeClass + ' ms-1 thes-badge-tiny">' + escHtml(pr ? pr.type : '') + '</span></td>' +
              '<td class="text-end fw-semibold">' + self.fmtNum(e[1]) + '</td>' +
              '<td><div class="d-flex align-items-center gap-1"><div class="thes-pct-bar"><div class="thes-pct-fill" style="width:' + Math.min(pct*2,100) + '%;background:' + self.typePalette(pr?pr.type:'') + '"></div></div><span class="small text-muted">' + pct + '%</span></div></td>' +
              '<td class="text-end small text-muted fw-semibold">' + top20cumul[i] + '%</td></tr>';
          }).join('') + '</tbody></table></div></div></div></div>' +
      '<div class="col-12 col-lg-5"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-graph-up-arrow"></i>Courbe Pareto</div></div>' +
        '<div class="card-body p-3"><canvas id="chartChirPareto" height="260"></canvas></div></div></div>' +
    '</div>';

    // Row 3 : Zones + Rares — static style= → CSS classes
    html += '<div class="row g-3">' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-body-text"></i>Zones anatomiques</div></div>' +
        '<div class="card-body p-3">' + topZones.map(function(e) {
          var pct = Math.round(e[1]/maxZone*100);
          var pr = self.data.find(function(p){return p.zone_anat===e[0];});
          var col = pr ? self.typePalette(pr.type) : '#60a5fa';
          return '<div class="thes-zone-bar-row"><span class="thes-zone-bar-label">' + escHtml(e[0]) + '</span>' +
            '<div class="thes-zone-bar-track"><div class="thes-zone-bar-fill" style="width:'+pct+'%;background:'+col+'"></div></div>' +
            '<span class="thes-zone-bar-val">' + self.fmtNum(e[1]) + '</span></div>';
        }).join('') + '</div></div></div>';

    if (rares.length > 0) {
      html += '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between">' +
          '<div class="thes-section-title mb-0"><i class="bi bi-exclamation-diamond"></i>Interventions rares (≤3)</div>' +
          '<span class="badge bg-warning-subtle text-warning">' + rares.length + ' acte' + (rares.length>1?'s':'') + '</span></div>' +
        '<div class="card-body p-0"><div class="table-responsive thes-scroll-260"><table class="table table-sm mb-0"><tbody>' +
        rares.slice(0,20).map(function(e) {
          return '<tr><td class="small">' + escHtml(e[0]) + '</td><td class="text-end fw-semibold text-warning thes-col-40">' + e[1] + '</td></tr>';
        }).join('') +
        (rares.length > 20 ? '<tr><td class="small text-muted fst-italic" colspan="2">+ ' + (rares.length-20) + ' autres…</td></tr>' : '') +
        '</tbody></table></div></div></div></div>';
    } else {
      html += '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-body d-flex align-items-center justify-content-center text-success py-4">' +
          '<i class="bi bi-check-circle me-2"></i>Aucune intervention rare — couverture complète.</div></div></div>';
    }
    html += '</div>';
    res.innerHTML = html;

    // Charts
    setTimeout(function() {
      var years = Object.keys(yearMap).sort();
      self._destroyChart('chartChirYearly');
      new Chart(document.getElementById('chartChirYearly'), {
        type:'line',
        data:{labels:years, datasets:[{label:'Interventions',data:years.map(function(y){return yearMap[y];}),
          borderColor:'#2563eb',backgroundColor:'#2563eb15',fill:true,tension:0.3,pointRadius:4,pointBackgroundColor:'#2563eb'}]},
        options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.raw+' interventions';}}}},
          scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},responsive:true,maintainAspectRatio:false}
      });
      self._destroyChart('chartChirType');
      var typeLabels = Object.keys(typeMap).filter(function(k){return typeMap[k]>0;});
      new Chart(document.getElementById('chartChirType'), {
        type:'doughnut',
        data:{labels:typeLabels,datasets:[{data:typeLabels.map(function(k){return typeMap[k];}),
          backgroundColor:typeLabels.map(function(k){return self.typePalette(k);}),borderWidth:2,borderColor:'#fff'}]},
        options:{plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:8,usePointStyle:true,pointStyle:'circle'}}},
          responsive:true,maintainAspectRatio:true,cutout:'58%'}
      });
      self._destroyChart('chartChirPareto');
      new Chart(document.getElementById('chartChirPareto'), {
        type:'bar',
        data:{labels:top20.map(function(e,i){return '#'+(i+1);}),
          datasets:[
            {type:'bar',label:'Volume',data:top20.map(function(e){return e[1];}),backgroundColor:'#93c5fd',borderRadius:3,yAxisID:'y'},
            {type:'line',label:'% cumulé',data:top20cumul,borderColor:'#ef4444',backgroundColor:'transparent',borderWidth:2,pointRadius:0,yAxisID:'y2',
             segment:{borderColor:function(ctx){return ctx.p1.parsed.y>=80?'#22c55e':'#ef4444';}}}
          ]},
        options:{plugins:{legend:{position:'top',labels:{font:{size:9}}},
            tooltip:{callbacks:{title:function(ctx){return top20[ctx[0].dataIndex]?top20[ctx[0].dataIndex][0]:'';}}}},
          scales:{x:{grid:{display:false},ticks:{font:{size:9}}},
            y:{beginAtZero:true,grid:{color:'#f3f4f6'},position:'left'},
            y2:{beginAtZero:true,max:100,position:'right',grid:{drawOnChartArea:false},ticks:{callback:function(v){return v+'%';}}}},
          responsive:true,maintainAspectRatio:false}
      });
    }, 80);
  },

  _comparerChirurgiens: async function() {
    var chirIdA = document.getElementById('selectChirA').value;
    var chirIdB = document.getElementById('selectChirB').value;
    if (!chirIdA || !chirIdB) { this.toast('Error', 'Sélectionnez deux chirurgiens.'); return; }
    if (chirIdA === chirIdB)  { this.toast('Error', 'Sélectionnez deux chirurgiens différents.'); return; }
    var chirA = this._chirLabel(chirIdA);
    var chirB = this._chirLabel(chirIdB);
    var dest = document.getElementById('comparerResults');
    dest.innerHTML = '<div class="thes-skeleton"><div class="thes-skeleton-row"></div><div class="thes-skeleton-row"></div><div class="thes-skeleton-row"></div><div class="mt-3 small text-muted">Comparaison en cours…</div></div>';

    var self = this;
    var intA = await this._fetchInterv({ chirurgien_id: chirIdA });
    var intB = await this._fetchInterv({ chirurgien_id: chirIdB });

    var protoA = {}, protoB = {};
    intA.forEach(function(i){ protoA[i.protocole_operatoire]=(protoA[i.protocole_operatoire]||0)+1; });
    intB.forEach(function(i){ protoB[i.protocole_operatoire]=(protoB[i.protocole_operatoire]||0)+1; });
    var setA = new Set(Object.keys(protoA)), setB = new Set(Object.keys(protoB));
    var communs = [...setA].filter(function(p){return setB.has(p);});
    var exclusA = [...setA].filter(function(p){return !setB.has(p);}).sort(function(a,b){return protoA[b]-protoA[a];}).slice(0,10);
    var exclusB = [...setB].filter(function(p){return !setA.has(p);}).sort(function(a,b){return protoB[b]-protoB[a];}).slice(0,10);
    var typeA={ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0}, typeB={ORTHO:0,TRAUMATO:0,NEURO:0,SEPTIQUE:0};
    intA.forEach(function(i){var pr=self._lookupProto(i.protocole_operatoire);if(pr&&pr.type&&typeA[pr.type]!==undefined)typeA[pr.type]++;});
    intB.forEach(function(i){var pr=self._lookupProto(i.protocole_operatoire);if(pr&&pr.type&&typeB[pr.type]!==undefined)typeB[pr.type]++;});
    var top10communs = communs.sort(function(a,b){return((protoA[b]||0)+(protoB[b]||0))-((protoA[a]||0)+(protoB[a]||0));}).slice(0,10);

    var html = '';

    // Header VS
    html += '<div class="thes-compare-header">' +
      '<span class="thes-compare-name a"><i class="bi bi-person-badge me-1"></i>' + escHtml(chirA) + '</span>' +
      '<span class="thes-compare-vs">VS</span>' +
      '<span class="thes-compare-name b"><i class="bi bi-person-badge me-1"></i>' + escHtml(chirB) + '</span></div>';

    // KPIs comparés
    html += '<div class="card border-0 shadow-sm mb-3"><div class="card-body p-3">' +
      [
        { label:'Total interventions', va: self.fmtNum(intA.length), vb: self.fmtNum(intB.length) },
        { label:'Protocoles distincts', va: setA.size, vb: setB.size },
        { label:'Protocoles en commun', va: communs.length, vb: communs.length },
        { label:'Diversité (vs 420)', va: Math.round(setA.size/420*100)+'%', vb: Math.round(setB.size/420*100)+'%' }
      ].map(function(m) {
        return '<div class="thes-compare-metric-row">' +
          '<div class="thes-compare-metric-val thes-compare-col-a">' + m.va + '</div>' +
          '<div class="thes-compare-metric-label">' + escHtml(m.label) + '</div>' +
          '<div class="thes-compare-metric-val thes-compare-col-b">' + m.vb + '</div></div>';
      }).join('') + '</div></div>';

    // Radar + Top 10 communs
    html += '<div class="row g-3 mb-3">' +
      '<div class="col-12 col-md-5"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-diagram-3"></i>Profil types</div></div>' +
        '<div class="card-body p-3 d-flex align-items-center justify-content-center"><canvas id="chartCompareRadar" height="220"></canvas></div></div></div>';
    if (top10communs.length) {
      html += '<div class="col-12 col-md-7"><div class="card border-0 shadow-sm h-100">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0"><i class="bi bi-intersect"></i>Top 10 protocoles communs</div></div>' +
        '<div class="card-body p-3"><canvas id="chartCompareProtos" height="220"></canvas></div></div></div>';
    }
    html += '</div>';

    // Exclusives — static style="width:50px" → class thes-col-50
    var totalExclA = [...setA].filter(function(p){return !setB.has(p);}).length;
    var totalExclB = [...setB].filter(function(p){return !setA.has(p);}).length;
    html += '<div class="row g-3">' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0 thes-compare-col-a"><i class="bi bi-person-check"></i>Exclusifs ' + escHtml(chirA) + ' <span class="badge bg-primary-subtle text-primary ms-1">' + totalExclA + '</span></div></div>' +
        '<div class="card-body p-0"><table class="table table-sm mb-0"><tbody>' + exclusA.map(function(p) {
          return '<tr><td class="small">' + escHtml(p) + '</td><td class="text-end fw-semibold text-muted thes-col-50">' + protoA[p] + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div>' +
      '<div class="col-12 col-md-6"><div class="card border-0 shadow-sm">' +
        '<div class="card-header bg-white border-bottom"><div class="thes-section-title mb-0 thes-compare-col-b"><i class="bi bi-person-check"></i>Exclusifs ' + escHtml(chirB) + ' <span class="badge bg-success-subtle text-success ms-1">' + totalExclB + '</span></div></div>' +
        '<div class="card-body p-0"><table class="table table-sm mb-0"><tbody>' + exclusB.map(function(p) {
          return '<tr><td class="small">' + escHtml(p) + '</td><td class="text-end fw-semibold text-muted thes-col-50">' + protoB[p] + '</td></tr>';
        }).join('') + '</tbody></table></div></div></div></div>';

    dest.innerHTML = html;

    setTimeout(function() {
      self._destroyChart('chartCompareRadar');
      var types = ['ORTHO','TRAUMATO','NEURO','SEPTIQUE'];
      new Chart(document.getElementById('chartCompareRadar'), {
        type:'radar',
        data:{labels:types,datasets:[
          {label:chirA,data:types.map(function(t){return Math.round((typeA[t]||0)/Math.max(1,intA.length)*100);}),
            borderColor:'#2563eb',backgroundColor:'#2563eb20',pointBackgroundColor:'#2563eb',pointRadius:4},
          {label:chirB,data:types.map(function(t){return Math.round((typeB[t]||0)/Math.max(1,intB.length)*100);}),
            borderColor:'#16a34a',backgroundColor:'#16a34a20',pointBackgroundColor:'#16a34a',pointRadius:4}
        ]},
        options:{plugins:{legend:{position:'bottom',labels:{font:{size:10},usePointStyle:true}}},
          scales:{r:{beginAtZero:true,max:100,ticks:{display:false},grid:{color:'#e5e7eb'},pointLabels:{font:{size:11,weight:'600'}}}},
          responsive:true,maintainAspectRatio:true}
      });
      if (top10communs.length) {
        self._destroyChart('chartCompareProtos');
        new Chart(document.getElementById('chartCompareProtos'), {
          type:'bar',
          data:{labels:top10communs.map(function(p){return p.length>25?p.substring(0,25)+'…':p;}),
            datasets:[
              {label:chirA,data:top10communs.map(function(p){return protoA[p]||0;}),backgroundColor:'#60a5fa',borderRadius:3},
              {label:chirB,data:top10communs.map(function(p){return protoB[p]||0;}),backgroundColor:'#34d399',borderRadius:3}]},
          options:{indexAxis:'y',plugins:{legend:{position:'top',labels:{font:{size:10},usePointStyle:true}}},
            scales:{x:{beginAtZero:true,grid:{color:'#f3f4f6'}},y:{ticks:{font:{size:9}},grid:{display:false}}},
            responsive:true,maintainAspectRatio:false}
        });
      }
    }, 80);
  },


  // ════════════════════════════════════════════════════════════
  // ONGLET 4 — ANALYSE
  // ════════════════════════════════════════════════════════════
  initAnalyse: function() {
    var self = this;
    this._buildHeatmap('frequence');
    document.getElementById('heatmapMetric').addEventListener('change', function(e){ self._buildHeatmap(e.target.value); });
    document.getElementById('btnRunCroisement').addEventListener('click', function(){ self._buildCroisement(); });
    document.getElementById('btnRunTemporal').addEventListener('click', function(){ self._buildTemporal(); });
    this._buildCroisement();
  },

  _buildHeatmap: function(metric) {
    var types = ['SEPTIQUE','TRAUMATO','NEURO','ORTHO'];
    var zones = [...new Set(this.data.map(function(p){return p.zone_anat;}).filter(Boolean))].sort().slice(0,12);
    var cells = {};
    this.data.forEach(function(p) {
      if (!p.type||!p.zone_anat) return;
      var key=p.type+'|'+p.zone_anat;
      if (!cells[key]) cells[key]={freq:0,count:0};
      cells[key].freq+=p.frequence; cells[key].count+=1;
    });
    var vals=Object.values(cells).map(function(c){return metric==='frequence'?c.freq:c.count;});
    var maxVal=Math.max.apply(null,vals.concat([1]));
    var heatColor=function(v,max){
      var pct=v/max;
      if(pct===0) return{bg:'#f9fafb',color:'#d1d5db'}; if(pct<0.2) return{bg:'#dbeafe',color:'#1d4ed8'};
      if(pct<0.4) return{bg:'#bfdbfe',color:'#1d4ed8'}; if(pct<0.6) return{bg:'#93c5fd',color:'#1e3a8a'};
      if(pct<0.8) return{bg:'#3b82f6',color:'#ffffff'}; return{bg:'#1d4ed8',color:'#ffffff'};
    };
    var self=this;
    // Heatmap : style= dynamique (couleurs calculées) = toléré D-2026-03-15-T04
    document.getElementById('heatmapContainer').innerHTML =
      '<table class="thes-heatmap-table"><thead><tr><th>Zone \\ Type</th>'+
      types.map(function(t){return '<th class="text-center"><span class="badge '+self.typeBadgeClass(t)+'">'+escHtml(t)+'</span></th>';}).join('')+
      '</tr></thead><tbody>'+
      zones.map(function(z){
        return '<tr><th class="thes-heatmap-row-header">'+escHtml(z)+'</th>'+
          types.map(function(t){
            var key=t+'|'+z,v=cells[key]?(metric==='frequence'?cells[key].freq:cells[key].count):0,h=heatColor(v,maxVal);
            return '<td class="thes-heatmap-cell'+(v===0?' thes-heatmap-empty':'')+'" style="background:'+h.bg+';color:'+h.color+'" title="'+
              escHtml(t)+' × '+escHtml(z)+' : '+self.fmtNum(v)+'">'+(v>0?self.fmtNum(v):'—')+'</td>';
          }).join('')+'</tr>';
      }).join('')+'</tbody></table>';
  },

  _buildCroisement: function() {
    var xKey=document.getElementById('croisementX').value, yKey=document.getElementById('croisementY').value;
    var xVals=[...new Set(this.data.map(function(p){return p[xKey];}).filter(Boolean))].sort().slice(0,8);
    var yVals=[...new Set(this.data.map(function(p){return p[yKey];}).filter(Boolean))].sort().slice(0,6);
    var matrix={};
    xVals.forEach(function(x){matrix[x]={};yVals.forEach(function(y){matrix[x][y]=0;});});
    this.data.forEach(function(p){var x=p[xKey],y=p[yKey];if(matrix[x]&&matrix[x][y]!==undefined)matrix[x][y]++;});
    var palette=['#60a5fa','#34d399','#f59e0b','#a78bfa','#fb7185','#38bdf8'];
    this._destroyChart('chartCroisement');
    this.charts.croisement=new Chart(document.getElementById('chartCroisement'),{
      type:'bar',data:{labels:xVals,datasets:yVals.map(function(y,i){
        return{label:y,data:xVals.map(function(x){return matrix[x][y];}),backgroundColor:palette[i%palette.length],borderRadius:3};})},
      options:{plugins:{legend:{position:'top',labels:{font:{size:10}}}},
        scales:{x:{stacked:false,grid:{display:false},ticks:{font:{size:10}}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},
        responsive:true,maintainAspectRatio:true}
    });
  },

  _buildTemporal: async function() {
    var type=document.getElementById('temporalType').value, gran=document.getElementById('temporalGranularity').value;
    var self=this, canvas=document.getElementById('chartTemporal');
    canvas.parentElement.insertAdjacentHTML('beforeend',
      '<div id="temporalLoading" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Chargement…</div>');
    var filters={};
    if(type){
      filters.protocoles=this.data.filter(function(p){return p.type===type;}).map(function(p){return p.libelle_cible;});
      if(!filters.protocoles.length){var ld=document.getElementById('temporalLoading');if(ld)ld.remove();return;}
    }
    var interv=await this._fetchInterv(filters);
    var ld=document.getElementById('temporalLoading');if(ld)ld.remove();
    var map={};
    interv.forEach(function(i){
      var d=String(i.date_intervention||''),key;
      if(gran==='year')key=d.substring(0,4);
      else if(gran==='quarter'){var m=parseInt(d.substring(5,7));key=d.substring(0,4)+' T'+Math.ceil(m/3);}
      else key=d.substring(0,7);
      if(key)map[key]=(map[key]||0)+1;
    });
    var labels=Object.keys(map).sort();
    this._destroyChart('chartTemporal');
    this.charts.temporal=new Chart(document.getElementById('chartTemporal'),{
      type:'line',data:{labels:labels,datasets:[{label:type||'Tous types',
        data:labels.map(function(k){return map[k];}),
        borderColor:self.typePalette(type)||'#60a5fa',backgroundColor:(self.typePalette(type)||'#60a5fa')+'20',
        fill:true,tension:0.3,pointRadius:3}]},
      options:{plugins:{legend:{display:false}},
        scales:{x:{ticks:{maxRotation:45,font:{size:9}},grid:{color:'#f3f4f6'}},y:{beginAtZero:true,grid:{color:'#f3f4f6'}}},
        responsive:true,maintainAspectRatio:true}
    })
  }

});
