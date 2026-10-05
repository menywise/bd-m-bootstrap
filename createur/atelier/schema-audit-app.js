/**
 * FILE     : schema-audit-app.js v3.0.0
 * MODULE   : atelier/ (L3 — ne ship jamais)
 * DATE     : 2026-04-25
 * AUTEUR   : Manu + Claude
 * DESC     : Audit schéma Supabase PREMIUM — comparaison terrain vs DATA_MODEL V1.18.0.
 *            Migration V5 (S#95 Tour 2) — Kit BO + Bootstrap natif (T-02 Option B).
 */

(function () {
  'use strict';

  // ── Référentiel DATA_MODEL V1.18.0 (généré 2026-04-10) ───────────────────
  var SCHEMA_REF = {"profiles":["id","user_id","email","name","initials","nom","prenom","fonction","avatar_url","created_at","updated_at","approved","bio","known_as","signes_particuliers","is_dev","telephone_principal","telephone_secondaire","secretaires","taille_gants","couleur_preferentielle","gant_paire_1_id","gant_paire_2_id","casaque_id","porte_casque","chirurgien_id","secretaires_list"],"user_roles":["id","user_id","created_at"],"content_types":["id","code","label","icon","color","active","created_at","updated_at"],"categories":["id","label","icon","color","active","created_at","updated_at","content_type_id"],"tags":["id","label_display","label_normalized","glossary_id","created_by","is_locked","created_at"],"tag_links":["id","tag_id","content_type","content_id","created_at"],"tag_suggestions":["id","proposed_label","proposed_by","status","reviewed_by","reviewed_at","created_at"],"glossaire":["id","abbreviation","definition","usage_notes","created_by","created_at","updated_at","variantes","categorie","is_propagated"],"glossaire_suggestions":["id","proposed_term","proposed_def","proposed_notes","proposed_by","status","reviewed_by","reviewed_at","admin_note","created_at"],"content_images":["id","content_type_id","content_id","storage_path","position","created_at","is_dev"],"fiches_intervention":["id","user_id","category_id","titre","description","etapes","duree_estimee","tags","status","created_at","updated_at","last_modified_by","is_dev"],"anatomie":["id","user_id","category_id","titre","description","region","tags","created_at","updated_at","last_modified_by","is_dev"],"installation_patient":["id","user_id","category_id","titre","description","position","precautions","tags","created_at","updated_at","last_modified_by","is_dev"],"cours":["id","user_id","category_id","titre","description","contenu","niveau","tags","status","created_at","updated_at","last_modified_by","is_dev"],"preferences_chirurgien":["id","chirurgien_id","fiche_intervention_id","titre","description","preferences","is_global","tags","created_at","updated_at","last_modified_by","is_dev"],"transmissions":["id","user_id","category_id","title","content","tags","priority","status","type","last_modified_by","created_at","updated_at","is_dev"],"materiel":["id","user_id","category_id","nom","reference","description","statut","localisation","tags","priority","created_at","updated_at","last_modified_by","is_dev","materiel_type_id","zone_anatomique_id","zone_stockage_id","etagere_id"],"materiel_types":["id","label","description","color","icon","active","created_at","updated_at"],"zones_anatomiques":["id","label","description","color","icon","active","created_at","updated_at"],"zones_stockage":["id","label","zone_anatomique_id","description","active","created_at","updated_at"],"etageres":["id","label","zone_stockage_id","position","active","created_at"],"casaques":["id","user_id","category_id","titre","description","categorie","taille_disponible","renforcee","specialite","localisation","remarques_usage","tags","status","priority","is_dev","last_modified_by","created_at","updated_at"],"gants":["id","user_id","category_id","titre","description","marque","modele","matiere","sans_latex","couleurs_disponibles","tailles_disponibles","localisation","remarques_usage","tags","status","priority","is_dev","last_modified_by","created_at","updated_at"],"collab":["id","secteur","created_at","specialite","pole_id","tel_interne_perso","casaque_renforcee_id","housse_casque","bottes_arthro","reglage_be_bip","ordre_chronologique"],"carnet_categories":["id","label","color","icon","position","is_active","created_by","created_at","updated_at"],"carnet_items":["id","category_id","sous_groupe","label","position","is_active","required","resources","mentor_ids","created_by","created_at","updated_at"],"carnet_progressions":["id","user_id","item_id","niveau","note","last_activity_at","created_at","updated_at"],"fonctions_metier":["id","code","label","categorie","position","is_active","created_at"],"app_groups":["id","key","label","description","icon","color","position","is_visible","created_at","updated_at"],"app_modules":["id","key","label","description","icon","color","group_key","path","position","status","is_new","visibility","created_at","updated_at"],"error_404_logs":["id","requested_url","referrer","user_agent","user_id","created_at"],"supervision_config":["id","doc_key","version_active","version_draft","validated_by","validated_at","created_at","updated_at"],"supervision_rules":["id","doc_key","version","rule_key","rule_label","rule_type","rule_pattern","is_active","created_at"],"supervision_rule_delta":["id","doc_key","version_from","version_to","rule_key","delta_type","old_value","new_value","status","reviewed_by","reviewed_at","created_at"],"supervision_sessions":["id","module_key","objective","prompt_used","notes","status","created_by","created_at","updated_at"],"livret_secteurs":["id","code","label","salles","qualif_salles","effectif","description","actes","couleur_hex","icone_bi","position","is_visible","created_at","updated_at"],"livret_encadrement":["id","profile_id","nom_local","prenom_local","telephone","role_label","position","is_visible","created_at","updated_at"],"livret_objectifs_items":["id","terme","domaine_key","domaine_label","domaine_icone","item_key","item_label","item_detail","position","is_active","created_at","updated_at"],"livret_progression":["id","user_id","item_key","statut","updated_at"],"objectifs_semaines":["id","semaine_num","label","description","position","is_active","created_at","updated_at"],"objectifs_criteres":["id","semaine_id","objectif_num","objectif_label","critere_num","critere_label","critere_detail","item_key","position","is_active","created_at","updated_at"],"objectifs_evaluations":["id","user_id","item_key","statut","updated_at"],"thesaurus_protocoles":["id","id_protocole","libelle_cible","type","zone_anat","cat_parent","specialite","frequence","pareto","duree_minutes","pathologie","alertes","synonymes_recherche","codes_ccam","definition_expert","libelles_sources_lies","proposition_nouvel_acte_label","created_at","updated_at"],"thesaurus_chirurgiens":["id","nom","prenom","profile_id","specialite","actif","created_at"],"thesaurus_panseuses":["id","nom","prenom","profile_id","profil","role_bloc","secteur","actif","note","created_at"],"thesaurus_interventions":["id","chirurgien","protocole_operatoire","specialite","protocole_id","chirurgien_id","panseuse_id","lateralite","note","created_at"],"thesaurus_fiches_papier":["id","chirurgien","nom_fichier","chemin_relatif","protocole_id","id_protocole_match","libelle_cible_match","score","via","statut","notes","nom_nettoye","created_at","updated_at"],"referentiel_ccam":["id","code_ccam","libelle","chapitre","chapitre_libelle","section","sous_section","activite","phase","regroupement","created_at"],"protocole_ccam":["id","protocole_id","ccam_acte_id","rang","notes","created_at"],"dork_profiles":["id","user_id","label","icon","description","keywords","exclusions","enabled_operator_ids","enabled_filetype_ids","is_default","position","created_at","updated_at"],"dork_sources":["id","profile_id","label","domains","weight","category","position","created_at","updated_at"],"dork_history":["id","user_id","profile_id","label","query","url","config","rating","validated","tags","created_at","last_used"],"paxis_questions":["id","code","type","text","roles","depth","position","is_active","campaign_id","created_at","updated_at"],"paxis_sessions":["id","created_by","role","started_at","completed_at","iteration","campaign_id","created_at","updated_at"],"paxis_responses":["id","session_id","question_id","question_text","question_type","response_text","status","is_generated","parent_response_id","depth","position","created_at"],"signalements":["id","type","module_cible","entite_type","entite_id","entite_label","description","url_contexte","user_agent","honeypot","statut","resolution","reporter_id","reporter_email","created_at","updated_at"],"collab_projects":["id","title","description","status","created_by","validated_by","validated_at","created_at","updated_at"],"collab_ideas":["id","project_id","content","quadrant","votes","created_at"],"paxis_campaigns":["id","title","description","status","created_by","created_at","updated_at","closed_at"],"bdb_principes":["id","ref","titre","description","categorie","module_cible","source","is_active","created_at"],"profiles_directory":["user_id","id","name","initials","nom","prenom","fonction","avatar_url","bio","couleur_preferentielle","taille_gants","casaque_id","porte_casque","chirurgien_id","signes_particuliers","secretaires","secretaires_list","telephone_principal","telephone_secondaire","known_as","gant_paire_1_id","gant_paire_2_id","approved","is_dev","created_at","updated_at","email"],"content_relations":["id","source_type_id","source_id","target_type_id","target_id","relation_type","created_at"]};

  // ── État ──────────────────────────────────────────────────────────────────
  var state = { results: [], filter: '', vue: 'all', loadedAt: null };

  var $ = function (id) { return document.getElementById(id); };

  function escHtml(s) {
    return window.escHtml
      ? window.escHtml(s)
      : String(s == null ? '' : s)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function show(id) { var el = $(id); if (el) el.classList.remove('d-none'); }
  function hide(id) { var el = $(id); if (el) el.classList.add('d-none'); }

  // ── 3 états ───────────────────────────────────────────────────────────────
  function showError(msg) {
    hide('sa-loading'); hide('sa-content');
    $('sa-error-msg').textContent = msg;
    show('sa-error');
  }
  function showContent() {
    hide('sa-loading'); hide('sa-error');
    show('sa-content');
  }

  // ── Comparaison ───────────────────────────────────────────────────────────
  function compare(terrain, ref) {
    var results = [];
    var all = {};
    Object.keys(terrain).forEach(function (t) { all[t] = true; });
    Object.keys(ref).forEach(function (t) { all[t] = true; });

    Object.keys(all).forEach(function (tName) {
      var tc = terrain[tName] || null;
      var dc = ref[tName]     || null;
      var status, orphans = [], ghosts = [];

      if (!tc && dc)       { status = 'missing'; }
      else if (tc && !dc)  { status = 'undocumented'; orphans = tc.slice(); }
      else {
        orphans = tc.filter(function (c) { return dc.indexOf(c) === -1; });
        ghosts  = dc.filter(function (c) { return tc.indexOf(c) === -1; });
        status  = (orphans.length + ghosts.length === 0) ? 'ok' : 'diff';
      }

      results.push({ tableName: tName, status: status,
                     orphans: orphans, ghosts: ghosts,
                     terrainCols: tc || [], docCols: dc || [] });
    });

    var order = { diff: 0, undocumented: 1, missing: 2, ok: 3 };
    results.sort(function (a, b) {
      var o = order[a.status] - order[b.status];
      return o !== 0 ? o : a.tableName.localeCompare(b.tableName, 'fr');
    });
    return results;
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  function renderKpis(results) {
    $('sa-kpi-ok').textContent      = results.filter(function (r) { return r.status === 'ok'; }).length;
    $('sa-kpi-diff').textContent    = results.filter(function (r) { return r.status === 'diff'; }).length;
    $('sa-kpi-undoc').textContent   = results.filter(function (r) { return r.status === 'undocumented'; }).length;
    $('sa-kpi-missing').textContent = results.filter(function (r) { return r.status === 'missing'; }).length;
    $('sa-kpi-orphans').textContent = results.reduce(function (s, r) { return s + r.orphans.length; }, 0);
    $('sa-kpi-ghosts').textContent  = results.reduce(function (s, r) { return s + r.ghosts.length; }, 0);
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  function render() {
    var filter = state.filter.toLowerCase().trim();
    var visible = state.results.filter(function (r) {
      if (filter && r.tableName.toLowerCase().indexOf(filter) === -1) return false;
      if (state.vue === 'diff')  return r.status === 'diff';
      if (state.vue === 'ok')    return r.status === 'ok';
      if (state.vue === 'undoc') return r.status === 'undocumented' || r.status === 'missing';
      return true;
    });

    $('sa-count').textContent = visible.length + ' / ' + state.results.length + ' tables';

    if (visible.length === 0) {
      $('sa-grid').innerHTML = '<p class="text-muted small py-3">Aucune table ne correspond.</p>';
      return;
    }

    $('sa-grid').innerHTML = visible.map(renderCard).join('');
  }

  function renderCard(r) {
    /* Mapping statut → Kit BO + utilitaires Bootstrap natif */
    var cfg = {
      ok:           { accent: 'bo-accent-success',   header: 'bg-success-subtle',   ico: 'bi-check-circle-fill text-success',          badge: 'text-bg-success',   label: 'OK' },
      diff:         { accent: 'bo-accent-danger',    header: 'bg-danger-subtle',    ico: 'bi-exclamation-triangle-fill text-danger',   badge: 'text-bg-danger',    label: 'Écart' },
      undocumented: { accent: 'bo-accent-secondary', header: 'bg-light',            ico: 'bi-question-circle-fill text-secondary',     badge: 'text-bg-secondary', label: 'Non documentée' },
      missing:      { accent: 'bo-accent-warning',   header: 'bg-warning-subtle',   ico: 'bi-dash-circle-fill text-warning',           badge: 'text-bg-warning',   label: 'Absente du terrain' }
    }[r.status];

    /* Colonnes (badges colorés) */
    var colsHtml = '';
    if (r.status !== 'missing') {
      colsHtml = '<div class="d-flex flex-wrap gap-1 p-2">'
        + r.terrainCols.map(function (c) {
            var isO = r.orphans.indexOf(c) !== -1;
            var cls = isO ? 'text-bg-danger fw-bold' : 'text-bg-light border';
            var ttl = isO ? ' title="En base, absente du DATA_MODEL"' : '';
            return '<span class="badge font-monospace small ' + cls + '"' + ttl + '>'
              + escHtml(c) + '</span>';
          }).join('')
        + r.ghosts.map(function (c) {
            return '<span class="badge font-monospace small text-bg-warning fw-bold fst-italic" title="Documentée, absente de la base">'
              + escHtml(c) + '</span>';
          }).join('')
        + '</div>';
    }

    /* Résumé diff */
    var diffHtml = '';
    if (r.status === 'diff') {
      diffHtml = '<div class="small bg-danger-subtle border-bottom px-3 py-2">'
        + (r.orphans.length > 0 ? '<span class="text-danger fw-semibold"><i class="bi bi-plus-circle me-1"></i>'
            + r.orphans.length + ' orpheline' + (r.orphans.length > 1 ? 's' : '')
            + ' <small>— à documenter</small></span>' : '')
        + (r.ghosts.length  > 0 ? '<span class="text-warning-emphasis fw-semibold ms-3"><i class="bi bi-dash-circle me-1"></i>'
            + r.ghosts.length  + ' fantôme'  + (r.ghosts.length  > 1 ? 's' : '')
            + ' <small>— à vérifier</small></span>' : '')
        + '</div>';
    }

    /* Actions (data-cv-action = JS hooks) */
    var actions = '<button class="btn btn-sm btn-outline-secondary" type="button" data-cv-action="copy-name" data-table="' + escHtml(r.tableName) + '" title="Copier le nom de table"><i class="bi bi-clipboard"></i></button>';
    if (r.status === 'diff' || r.status === 'undocumented') {
      actions += ' <button class="btn btn-sm btn-outline-primary" type="button" data-cv-action="copy-diff" data-table="' + escHtml(r.tableName) + '" title="Copier le diff markdown"><i class="bi bi-markdown me-1"></i>Diff</button>';
    }

    return '<div class="card bo-card ' + cfg.accent + ' mb-2">'
      + '<div class="card-header d-flex align-items-center gap-2 flex-wrap ' + cfg.header + '">'
      +   '<i class="bi ' + cfg.ico + '"></i>'
      +   '<span class="fw-bold font-monospace small">' + escHtml(r.tableName) + '</span>'
      +   '<span class="badge ' + cfg.badge + '"><i class="bi ' + cfg.ico.split(' ')[0] + ' me-1"></i>' + cfg.label + '</span>'
      +   '<span class="small text-muted ms-2">' + r.terrainCols.length + ' col.</span>'
      +   '<div class="ms-auto d-flex gap-1">' + actions + '</div>'
      + '</div>'
      + diffHtml
      + colsHtml
      + '</div>';
  }

  // ── Diff markdown ─────────────────────────────────────────────────────────
  function diffTable(r) {
    var lines = ['## ' + r.tableName + ' — diff terrain vs DATA_MODEL V1.18.0',
                 'Généré le ' + new Date().toLocaleDateString('fr-FR'), ''];
    if (r.status === 'undocumented') {
      lines.push('⚠️ **Table non documentée** — à ajouter dans le DATA_MODEL.');
      lines.push(''); lines.push('Colonnes terrain :');
      r.terrainCols.forEach(function (c) { lines.push('- `' + c + '`'); });
    } else {
      if (r.orphans.length) {
        lines.push('🔴 **Colonnes orphelines** (en base, absentes du doc) :');
        r.orphans.forEach(function (c) { lines.push('- `' + c + '`'); });
        lines.push(''); lines.push('→ Ajouter dans le DATA_MODEL.');
      }
      if (r.ghosts.length) {
        lines.push(''); lines.push('🟡 **Colonnes fantômes** (documentées, absentes de la base) :');
        r.ghosts.forEach(function (c) { lines.push('- `' + c + '`'); });
        lines.push(''); lines.push('→ Vérifier si supprimées ou renommées en base.');
      }
    }
    return lines.join('\n');
  }

  function diffGlobal() {
    var diffs = state.results.filter(function (r) { return r.status === 'diff' || r.status === 'undocumented'; });
    if (!diffs.length) return '# Audit schéma — Aucun écart ✅\n\nTerrain et DATA_MODEL V1.18.0 sont synchronisés.';
    var orphTotal = diffs.reduce(function (s, r) { return s + r.orphans.length; }, 0);
    var ghostTotal = diffs.reduce(function (s, r) { return s + r.ghosts.length; }, 0);
    var lines = ['# Audit schéma Supabase vs DATA_MODEL V1.18.0',
                 'Généré le ' + new Date().toLocaleDateString('fr-FR'), '',
                 '## Résumé',
                 '- ' + diffs.length + ' table(s) avec écarts',
                 '- ' + orphTotal + ' colonne(s) orpheline(s) à documenter',
                 '- ' + ghostTotal + ' colonne(s) fantôme(s) à vérifier', ''];
    diffs.forEach(function (r) { lines.push('---'); lines.push(diffTable(r)); lines.push(''); });
    return lines.join('\n');
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  async function loadSchema() {
    show('sa-loading'); hide('sa-error'); hide('sa-content');
    $('sa-btn-export').disabled = true;

    var res = await window.bdb.rpc('bdb_schema_audit');
    if (res.error) { showError('L\'audit n\'a pu aboutir — ' + res.error.message); return; }
    if (!res.data || !res.data.length) { showError('Aucune table retournée — vérifiez la RPC bdb_schema_audit().'); return; }

    var terrain = {};
    res.data.forEach(function (row) {
      if (!terrain[row.table_name]) terrain[row.table_name] = [];
      terrain[row.table_name].push(row.column_name);
    });

    state.results  = compare(terrain, SCHEMA_REF);
    state.loadedAt = new Date();

    var dt = $('sa-date');
    if (dt) dt.textContent = state.loadedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    renderKpis(state.results);
    render();
    showContent();
    $('sa-btn-export').disabled = false;
  }

  // ── Événements ────────────────────────────────────────────────────────────
  function initEvents() {
    $('sa-filter').addEventListener('input', function () { state.filter = this.value; render(); });

    $('sa-refresh').addEventListener('click', function () {
      state.filter = ''; $('sa-filter').value = ''; loadSchema();
    });

    $('sa-btn-export').addEventListener('click', function () {
      navigator.clipboard.writeText(diffGlobal()).then(function () {
        var btn = $('sa-btn-export'), orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-clipboard-check me-1"></i>Copié !';
        btn.classList.replace('btn-outline-primary', 'btn-success');
        setTimeout(function () { btn.innerHTML = orig; btn.classList.replace('btn-success', 'btn-outline-primary'); }, 2000);
      });
    });

    document.querySelectorAll('[data-vue]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-vue]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.vue = btn.dataset.vue;
        render();
      });
    });

    document.addEventListener('click', function (e) {
      var cn = e.target.closest('[data-cv-action="copy-name"]');
      if (cn) {
        navigator.clipboard.writeText(cn.dataset.table).then(function () {
          cn.innerHTML = '<i class="bi bi-clipboard-check text-success"></i>';
          setTimeout(function () { cn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
        });
        return;
      }
      var cd = e.target.closest('[data-cv-action="copy-diff"]');
      if (cd) {
        var r = state.results.find(function (x) { return x.tableName === cd.dataset.table; });
        if (!r) return;
        navigator.clipboard.writeText(diffTable(r)).then(function () {
          var orig = cd.innerHTML;
          cd.innerHTML = '<i class="bi bi-clipboard-check me-1"></i>Copié !';
          setTimeout(function () { cd.innerHTML = orig; }, 1500);
        });
      }
    });
  }

  // ── Orchestration (pattern conseil-app.js) ─────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    (async function () {
      await window.bdbShellReady;
      if (!window.bdbUser) return;
      hide('sa-loading');
      if (!window.bdbUser.isAdmin) {
        show('sa-denied');
        return;
      }
      show('sa-content');
      initEvents();
      loadSchema();
    })();
  });

}());
