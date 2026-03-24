/* thesaurus-admin.js — BDB · CDS · Module thesaurus */
Object.assign(ThesApp, {

  // ════════════════════════════════════════════════════════════
  // ONGLET 5 — ADMIN (CRUD Supabase réel)
  // ════════════════════════════════════════════════════════════
  initAdmin: function() {
    var self=this;
    this._adminFiltered=[...this.data];
    this._renderAdminTable();
    document.getElementById('adminSearchInput').addEventListener('input',function(e){
      var q=e.target.value.toLowerCase();
      self._adminFiltered=q?self.data.filter(function(p){return p.libelle_cible.toLowerCase().includes(q)||(p.type||'').toLowerCase().includes(q);}):
        [...self.data];
      self._renderAdminTable();
    });
    document.getElementById('btnAdminNew').addEventListener('click',function(){self._openAdminNew();});
    document.getElementById('btnAdminSave').addEventListener('click',function(){self._adminSave();});
    document.getElementById('btnAdminDelete').addEventListener('click',function(){
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
      self._openConfirmDelete();
    });
    document.getElementById('btnConfirmDelete').addEventListener('click',function(){self._adminDelete();});
  },

  _renderAdminTable: function() {
    var slice=this._adminFiltered.slice(0,200),self=this;
    document.getElementById('adminCountBadge').textContent=this._adminFiltered.length;
    document.getElementById('adminTableBody').innerHTML=slice.map(function(p){
      return '<tr data-id="'+escHtml(p.id_protocole)+'">'+
        '<td class="font-monospace small text-muted">'+escHtml(p.id_protocole)+'</td>'+
        '<td class="fw-medium small">'+escHtml(p.libelle_cible)+'</td>'+
        '<td><span class="badge '+self.typeBadgeClass(p.type)+'">'+escHtml(p.type||'—')+'</span></td>'+
        '<td class="small text-muted">'+escHtml(p.zone_anat||'—')+'</td>'+
        '<td class="text-end font-monospace small">'+self.fmtNum(p.frequence)+'</td>'+
        '<td><span class="badge '+self.paretoBadgeClass(p.pareto)+'">'+escHtml(p.pareto||'—')+'</span></td>'+
        '<td class="text-end">'+
          '<button class="btn btn-xs btn-outline-primary me-1 btn-admin-edit" data-id="'+escHtml(p.id_protocole)+'" type="button" title="Éditer"><i class="bi bi-pencil"></i></button>'+
          '<button class="btn btn-xs btn-outline-danger btn-admin-del" data-id="'+escHtml(p.id_protocole)+'" type="button" title="Supprimer"><i class="bi bi-trash"></i></button>'+
        '</td></tr>';
    }).join('');
    document.querySelectorAll('.btn-admin-edit').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();self._openAdminEdit(btn.dataset.id);});
    });
    document.querySelectorAll('.btn-admin-del').forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();self._deleteId=btn.dataset.id;self._openConfirmDelete();});
    });
  },

  _openAdminNew: function() {
    this._adminEditId=null;
    document.getElementById('modalAdminEditLabel').textContent='Nouveau protocole';
    document.getElementById('btnAdminDelete').classList.add('d-none');
    ['adminLibelle','adminPath','adminAlertes','adminSyn','adminCCAM','adminDef','adminSources'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.value='';
    });
    document.getElementById('adminType').value='';
    document.getElementById('adminZone').value='';
    document.getElementById('adminCat').value='';
    document.getElementById('adminFrequence').value=0;
    document.getElementById('adminLibelle').removeAttribute('readonly');
    document.getElementById('adminFrequence').removeAttribute('readonly');
    document.getElementById('adminLibelleSacredBadge').textContent='SACRÉ — saisissable à la création uniquement';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  _openAdminEdit: function(id) {
    var p=this.data.find(function(x){return x.id_protocole===id;});if(!p)return;
    this._adminEditId=id;
    document.getElementById('modalAdminEditLabel').textContent='Édition — '+p.libelle_cible.substring(0,40);
    document.getElementById('btnAdminDelete').classList.remove('d-none');
    document.getElementById('adminLibelle').value=p.libelle_cible;
    document.getElementById('adminLibelle').setAttribute('readonly','readonly');
    document.getElementById('adminFrequence').value=p.frequence;
    document.getElementById('adminFrequence').setAttribute('readonly','readonly');
    document.getElementById('adminLibelleSacredBadge').textContent='SACRÉ — non modifiable';
    document.getElementById('adminType').value=p.type||'';
    document.getElementById('adminZone').value=p.zone_anat||'';
    document.getElementById('adminCat').value=p.cat_parent||'';
    document.getElementById('adminPath').value=p.pathologie||'';
    document.getElementById('adminAlertes').value=p.alertes||'';
    document.getElementById('adminSyn').value=p.synonymes_recherche||'';
    document.getElementById('adminCCAM').value=p.codes_ccam||'';
    document.getElementById('adminDef').value=p.definition_expert||'';
    document.getElementById('adminSources').value=p.libelles_sources_lies||'';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).show();
  },

  // ── ADMIN SAVE — Supabase INSERT ou UPDATE ──
  _adminSave: async function() {
    var libelle=document.getElementById('adminLibelle').value.trim();
    if(!libelle){this.toast('Error','Le libellé cible est requis.');return;}
    var type=document.getElementById('adminType').value;
    if(!type){this.toast('Error','Sélectionnez un type.');return;}

    var btn=document.getElementById('btnAdminSave');
    btn.disabled=true; btn.innerHTML='<span class="spinner-border spinner-border-sm me-1"></span>Enregistrement…';

    try {
      if(this._adminEditId){
        // ── UPDATE (champs sacrés exclus) ──
        var payload={
          type:type,
          zone_anat:document.getElementById('adminZone').value,
          cat_parent:document.getElementById('adminCat').value,
          pathologie:document.getElementById('adminPath').value,
          alertes:document.getElementById('adminAlertes').value,
          synonymes_recherche:document.getElementById('adminSyn').value,
          codes_ccam:document.getElementById('adminCCAM').value,
          definition_expert:document.getElementById('adminDef').value,
          libelles_sources_lies:document.getElementById('adminSources').value,
          updated_at:new Date().toISOString()
        };
        var resp=await window.bdb.from('thesaurus_protocoles')
          .update(payload).eq('id_protocole',this._adminEditId).select();
        if(resp.error) throw new Error(resp.error.message);
        // Mise à jour locale
        var p=this.data.find(function(x){return x.id_protocole===this._adminEditId;}.bind(this));
        if(p) Object.assign(p,payload);
        this.toast('Success','Protocole mis à jour.');
      } else {
        // ── INSERT ──
        var freq=parseInt(document.getElementById('adminFrequence').value)||0;
        var pareto=freq>=1000?'Critique':freq>=300?'Standard':freq>=50?'Secondaire':'Rare';
        var newId='ACT-'+String(this.data.length+1).padStart(4,'0');
        var insertPayload={
          id_protocole:newId,
          libelle_cible:libelle,
          type:type,
          zone_anat:document.getElementById('adminZone').value,
          cat_parent:document.getElementById('adminCat').value,
          specialite:'',
          frequence:freq,
          pareto:pareto,
          pathologie:document.getElementById('adminPath').value,
          alertes:document.getElementById('adminAlertes').value,
          synonymes_recherche:document.getElementById('adminSyn').value,
          codes_ccam:document.getElementById('adminCCAM').value,
          definition_expert:document.getElementById('adminDef').value,
          libelles_sources_lies:document.getElementById('adminSources').value
        };
        var resp=await window.bdb.from('thesaurus_protocoles').insert(insertPayload).select();
        if(resp.error) throw new Error(resp.error.message);
        // Ajout local (utilise la réponse Supabase pour avoir le uuid)
        var inserted = resp.data && resp.data[0] ? resp.data[0] : insertPayload;
        this.data.push(inserted);
        this.toast('Success','Protocole créé.');
      }
      // Rafraîchir cache + UI
      ThesCache.set('protocoles',this.data);
      this._adminFiltered=[...this.data]; this._renderAdminTable(); this._applyFilters();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminEdit')).hide();
    } catch(e) {
      this.toast('Error','Erreur Supabase : '+e.message);
    } finally {
      btn.disabled=false; btn.innerHTML='<i class="bi bi-check-lg me-1"></i>Enregistrer';
    }
  },

  _openConfirmDelete: function() {
    var id=this._deleteId,p=this.data.find(function(x){return x.id_protocole===id;});
    document.getElementById('deleteProtoName').textContent=p?p.libelle_cible:id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).show();
  },

  // ── ADMIN DELETE — Supabase DELETE ──
  _adminDelete: async function() {
    var id=this._deleteId;
    var btn=document.getElementById('btnConfirmDelete');
    btn.disabled=true; btn.innerHTML='<span class="spinner-border spinner-border-sm me-1"></span>Suppression…';

    try {
      var resp=await window.bdb.from('thesaurus_protocoles').delete().eq('id_protocole',id);
      if(resp.error) throw new Error(resp.error.message);
      // Suppression locale
      this.data=this.data.filter(function(p){return p.id_protocole!==id;});
      this._adminFiltered=this._adminFiltered.filter(function(p){return p.id_protocole!==id;});
      this._filtered=this._filtered.filter(function(p){return p.id_protocole!==id;});
      ThesCache.set('protocoles',this.data);
      this._renderAdminTable(); this._renderTable();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmDelete')).hide();
      this.toast('Success','Protocole supprimé.');
    } catch(e) {
      this.toast('Error','Erreur Supabase : '+e.message);
    } finally {
      btn.disabled=false; btn.innerHTML='<i class="bi bi-trash me-1"></i>Supprimer';
    }
  }

});
