(function () {
'use strict';

/* ================================================================
   session-ia-app.js — BDB Atelier / Session IA
   Gouvernance sessions Claude : ouvrir, clôturer, prompts, décisions.
   CDS Compliant | escHtml | 3 états | bdbShellReady
   data-login-mode="modal" : écoute CustomEvent 'bdb:auth-required'
   ================================================================ */

/* --- État global --- */

const state = {
  ctx:        null,   // résultat brut de atelier_prompt_reprise()
  sessionNum: null,
  currentSql: ''
};

/* --- Utilitaires DOM --- */

function show(id) { document.getElementById(id)?.classList.remove('d-none'); }
function hide(id) { document.getElementById(id)?.classList.add('d-none'); }

function showFeedback(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert alert-' + type + ' mt-2 mb-0 py-2 small';
  el.textContent = msg;
  show(id);
  if (type === 'success') setTimeout(() => hide(id), 3500);
}

/* ================================================================
   BUILDERS PROMPTS
   ================================================================ */

/* Prompt d'ouverture → Claude.ai
   Contient le JSON live de atelier_prompt_reprise() pour que Claude
   démarre la session avec un contexte complet sans saisie manuelle. */

function buildPromptOuverture() {
  const ctx = state.ctx;
  if (!ctx || !ctx.session_active) return null;
  const s = ctx.session_active;
  return (
    'SESSION BDB — OUVERTURE #' + s.numero + ' "' + s.titre + '"\n' +
    'Skill : atelier-session-bdb\n\n' +
    JSON.stringify(ctx, null, 2)
  );
}

/* Prompt de clôture → Claude.ai
   Contraint la production SQL : format exact, colonnes nommées,
   dollar-quoting, ref pattern, ON CONFLICT interdit.
   Claude produit le SQL à partir de ces contraintes — pas de "produis le SQL". */

function buildPromptCloture() {
  const ctx = state.ctx;
  if (!ctx || !ctx.session_active) return null;
  const s    = ctx.session_active;
  const today  = new Date().toISOString().slice(0, 10);
  const sNum   = String(s.numero).padStart(2, '0');
  const refPfx = 'D-' + today + '-S' + sNum;

  return [
    'SESSION BDB — DEMANDE CLÔTURE #' + s.numero + ' "' + s.titre + '"',
    'Skill : atelier-session-bdb',
    '',
    'CONTRAINTES SQL STRICTES :',
    '- Table cible décisions : atelier_decisions',
    '  Colonnes : ref, date, titre, description, module_cible, tags, session_num',
    '- RPC clôture : atelier_cloture_session(p_numero, p_statut, p_avancement, p_journal_refs)',
    '- ref format OBLIGATOIRE : ' + refPfx + '-NN  (ex : ' + refPfx + '-01)',
    '- tags : ARRAY[\'tag1\',\'tag2\']  lowercase, sans accent, sans espace',
    '- module_cible : NULL si décision globale, sinon nom court du module',
    '- session_num : ' + s.numero + '  (obligatoire sur chaque INSERT)',
    '- INTERDIT : ON CONFLICT — toute ref doit être unique par design',
    '- dollar-quoting OBLIGATOIRE pour l\'avancement : $avancement$...$avancement$',
    '- p_statut valeurs autorisées : \'fait\' | \'partiel\' | \'abandonne\'',
    '',
    'FORMAT DE SORTIE ATTENDU — rien d\'autre, aucun texte autour :',
    '',
    '-- Clôture session #' + s.numero + ' — ' + s.titre,
    '-- Date : ' + today,
    '',
    'INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num)',
    'VALUES',
    '  (\'' + refPfx + '-01\', \'' + today + '\', \'Titre court factuel\',',
    '   \'Description complète de la décision.\', NULL, ARRAY[\'tag\'], ' + s.numero + ');',
    '',
    'SELECT atelier_cloture_session(',
    '  ' + s.numero + ',',
    '  \'fait\',',
    '  $avancement$Résumé factuel — livrables produits, migrations exécutées.$avancement$,',
    '  ARRAY[\'' + refPfx + '-01\']',
    ');',
    '',
    'Résume maintenant les décisions prises pendant cette session et produis ce SQL.'
  ].join('\n');
}

/* ================================================================
   BUILDER SQL CLÔTURE (pour Supabase SQL Editor — pas pour Claude)
   ================================================================ */

function buildClotureSql(num, statut, avancement, refs) {
  const refsArr = refs.split(',').map(r => r.trim()).filter(Boolean);
  const refsSql = refsArr.length
    ? 'ARRAY[\'' + refsArr.join('\', \'') + '\']'
    : 'ARRAY[]::text[]';
  const ts = new Date().toLocaleString('fr-FR');
  return [
    '-- ============================================================',
    '-- Clôture session #' + num,
    '-- Généré le ' + ts + ' via session-ia.html',
    '-- ============================================================',
    '-- Les décisions ajoutées via le formulaire sont déjà en base.',
    '-- Ajoute ici les décisions manquantes avant d\'exécuter la clôture.',
    '',
    '-- MODÈLE décision (décommenter et compléter si nécessaire) :',
    '-- INSERT INTO atelier_decisions (ref, date, titre, description, module_cible, tags, session_num)',
    '-- VALUES (',
    '--   \'D-' + new Date().toISOString().slice(0,10) + '-S' + String(num).padStart(2,'0') + '-NN\',',
    '--   \'' + new Date().toISOString().slice(0,10) + '\',',
    '--   \'Titre court factuel\',',
    '--   \'Description complète.\',',
    '--   NULL,',
    '--   ARRAY[\'tag\'],',
    '--   ' + num,
    '-- );',
    '',
    '-- ============================================================',
    '-- CLÔTURE',
    '-- ============================================================',
    '',
    'SELECT atelier_cloture_session(',
    '  ' + num + ',',
    '  \'' + statut + '\',',
    '  $avancement$' + avancement + '$avancement$,',
    '  ' + refsSql,
    ');'
  ].join('\n');
}

/* ================================================================
   TÉLÉCHARGEMENT SQL
   ================================================================ */

function downloadSql(sql, num) {
  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cloture_s' + num + '_' + new Date().toISOString().slice(0,10) + '.sql';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ================================================================
   AUTO-REF DÉCISION (incrémente à partir des refs existantes)
   ================================================================ */

function autoRef() {
  const today  = new Date().toISOString().slice(0, 10);
  const sNum   = state.sessionNum ? String(state.sessionNum).padStart(2, '0') : null;
  const suffix = sNum ? '-S' + sNum : '';
  const prefix = 'D-' + today + suffix + '-';

  const decisions = state.ctx?.decisions_recentes ?? [];
  const nums = decisions
    .filter(d => d.ref && d.ref.startsWith(prefix))
    .map(d => parseInt(d.ref.slice(prefix.length), 10))
    .filter(n => !isNaN(n));

  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return prefix + String(next).padStart(2, '0');
}

/* ================================================================
   RENDER FUNCTIONS
   ================================================================ */

function renderTerrain(t) {
  if (!t) return;
  const kpis = [
    { val: t.protocoles,                                  lbl: 'Protocoles',   ico: 'bi-list-ul'           },
    { val: t.dernier_act,                                 lbl: 'Dernier ACT',  ico: 'bi-arrow-up-right'    },
    { val: ((t.interventions || 0) / 1000).toFixed(1) + 'k', lbl: 'Interventions', ico: 'bi-activity'    },
    { val: t.fiches_papier,                               lbl: 'Fiches',       ico: 'bi-file-earmark-text' },
    { val: t.glossaire,                                   lbl: 'Glossaire',    ico: 'bi-book'              },
    { val: t.chirurgiens_actifs,                          lbl: 'Chirurgiens',  ico: 'bi-person-badge'      },
    { val: t.bdb_principes_l1,                            lbl: 'L1 principes', ico: 'bi-shield-check'      }
  ];
  document.getElementById('sia-terrain-kpis').innerHTML = kpis.map(k =>
    '<div class="col-6 col-md-4 col-lg-2">' +
      '<div class="card bo-card px-3 py-2 h-100">' +
        '<div class="h5 fw-bold mb-0">' + escHtml(k.val ?? '—') + '</div>' +
        '<div class="small text-muted text-uppercase"><i class="bi ' + k.ico + ' me-1"></i>' + k.lbl + '</div>' +
      '</div>' +
    '</div>'
  ).join('');
}

function renderBanner(session) {
  const banner = document.getElementById('sia-banner');
  const text   = document.getElementById('sia-banner-text');
  if (session) {
    banner.className = 'badge text-bg-success-subtle border border-success p-2 mt-1';
    text.innerHTML =
      '<i class="bi bi-play-fill text-success me-1"></i>' +
      '<strong>Session #' + escHtml(session.numero) + ' en cours</strong>' +
      ' — ' + escHtml(session.titre) +
      '<span class="text-muted ms-2 small">Depuis le ' +
      escHtml(session.date_debut ?? '') + '</span>';
    show('sia-actions');
  } else {
    banner.className = 'badge text-bg-light border p-2 mt-1';
    text.innerHTML =
      '<i class="bi bi-moon text-warning me-1"></i>' +
      '<span class="text-warning-emphasis">Aucune session active</span>';
    hide('sia-actions');
  }
}

function renderSessions(sessions) {
  hide('sia-sessions-loading');
  if (!sessions?.length) { show('sia-sessions-empty'); return; }
  const list = document.getElementById('sia-sessions-list');
  list.innerHTML = sessions.map(s => {
    const hasDep  = s.dependances?.length > 0;
    const depHtml = hasDep
      ? '<span class="text-warning"><i class="bi bi-arrow-up-right me-1"></i>Dép. #' +
        s.dependances.map(d => escHtml(d)).join(', #') + '</span>'
      : '';
    const accentCls = hasDep ? ' bo-accent-warning' : '';
    return '<div class="card bo-card mb-2 px-3 py-2' + accentCls + '">' +
      '<div class="d-flex justify-content-between align-items-start">' +
        '<div>' +
          '<div class="small fw-bold text-uppercase text-muted">SESSION #' + escHtml(s.numero) + '</div>' +
          '<div class="fw-semibold">' + escHtml(s.titre) + '</div>' +
          '<div class="small text-muted">' + escHtml(s.duree_estimee ?? '') + ' ' + depHtml + '</div>' +
        '</div>' +
        '<button class="btn btn-outline-primary btn-sm"' +
                ' data-action="open" data-num="' + escHtml(s.numero) + '"' +
                ' type="button"' +
                ' aria-label="Ouvrir session #' + escHtml(s.numero) + '">' +
          '<i class="bi bi-play-fill"></i>' +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');
  show('sia-sessions-list');
}

function renderActivePanel(session) {
  hide('sia-active-loading');
  if (!session) { show('sia-active-none'); return; }
  state.sessionNum = session.numero;
  document.getElementById('sia-active-title').textContent = session.titre;
  document.getElementById('sia-active-badge').textContent = '#' + session.numero;
  document.getElementById('sia-active-date').textContent  = 'Ouverte le ' + (session.date_debut ?? '—');
  document.getElementById('sia-dec-ref').value = autoRef();
  show('sia-active-content');
}

function renderDecisions(decisions) {
  hide('sia-decisions-loading');
  if (!decisions?.length) { show('sia-decisions-empty'); return; }
  const tbody = document.getElementById('sia-decisions-tbody');
  tbody.innerHTML = decisions.map(d =>
    '<tr>' +
      '<td><span class="small font-monospace text-primary">' + escHtml(d.ref) + '</span></td>' +
      '<td>' + escHtml(d.titre) + '</td>' +
      '<td>' + (d.module_cible
        ? '<span class="badge text-bg-light border small">' + escHtml(d.module_cible) + '</span>'
        : '<span class="text-muted">—</span>') + '</td>' +
      '<td class="text-muted">' + escHtml(d.date) + '</td>' +
      '<td>' + (d.session_num ? '<small class="text-muted">#' + escHtml(d.session_num) + '</small>' : '') + '</td>' +
    '</tr>'
  ).join('');
  show('sia-decisions-content');
}

function renderArbitrages(arbitrages) {
  if (!arbitrages?.length) { hide('sia-arbitrages-section'); return; }
  show('sia-arbitrages-section');
  document.getElementById('sia-arbitrages-body').innerHTML = arbitrages.map(a =>
    '<div class="d-flex align-items-center justify-content-between border-bottom px-3 py-2 small">' +
      '<span><strong>' + escHtml(a.ref) + '</strong> — ' + escHtml(a.titre ?? '') + '</span>' +
      '<span class="badge text-bg-warning">' + escHtml(a.statut) + '</span>' +
    '</div>'
  ).join('');
}

/* ================================================================
   CHARGEMENT CONTEXTE
   ================================================================ */

async function loadContext() {
  // Reset états loading
  show('sia-terrain-loading');    hide('sia-terrain-kpis');
  show('sia-sessions-loading');   hide('sia-sessions-list'); hide('sia-sessions-empty');
  show('sia-active-loading');     hide('sia-active-none');   hide('sia-active-content');
  show('sia-decisions-loading');  hide('sia-decisions-content'); hide('sia-decisions-empty');
  hide('sia-arbitrages-section');
  state.sessionNum = null;

  try {
    const { data, error } = await window.bdb.rpc('atelier_prompt_reprise');
    if (error) throw error;

    const raw = Array.isArray(data) ? data[0] : data;
    const ctx = raw?.atelier_prompt_reprise ?? raw;
    if (!ctx) throw new Error('Réponse vide de atelier_prompt_reprise()');

    state.ctx = ctx;

    // Header stats
    const s = ctx.stats;
    document.getElementById('sia-header-stats').textContent =
      (s?.total_decisions ?? '?') + ' décisions · ' +
      (s?.sessions_fait ?? '?') + '/' + (s?.total_sessions ?? '?') + ' sessions';

    // Terrain
    renderTerrain(ctx.terrain);
    hide('sia-terrain-loading');
    show('sia-terrain-kpis');

    // Bandeau + actions
    renderBanner(ctx.session_active);

    // Backlog
    renderSessions(ctx.sessions_a_faire);

    // Panel actif
    renderActivePanel(ctx.session_active);

    // Décisions
    renderDecisions(ctx.decisions_recentes);

    // Arbitrages
    renderArbitrages(ctx.arbitrages_pending);

    // Pré-remplir ref si pas de session
    if (!ctx.session_active) {
      document.getElementById('sia-dec-ref').value = autoRef();
    }

  } catch (err) {
    hide('sia-terrain-loading');
    hide('sia-sessions-loading');
    hide('sia-active-loading');
    hide('sia-decisions-loading');

    document.getElementById('sia-terrain-kpis').innerHTML =
      '<div class="alert alert-danger w-100 py-2 small">' +
      '<i class="bi bi-exclamation-triangle me-1"></i>' +
      'Erreur chargement : ' + escHtml(err.message) +
      ' <button class="btn btn-sm btn-outline-danger ms-2" id="sia-btn-retry">Réessayer</button>' +
      '</div>';
    show('sia-terrain-kpis');
    document.getElementById('sia-btn-retry')?.addEventListener('click', loadContext);
  }
}

/* ================================================================
   ACTIONS
   ================================================================ */

async function ouvrirSession(num) {
  if (!confirm('Ouvrir la session #' + num + ' ?')) return;
  try {
    const { error } = await window.bdb.rpc('atelier_ouvrir_session', { p_numero: num });
    if (error) throw error;
    await loadContext();
  } catch (err) {
    const sql = 'SELECT atelier_ouvrir_session(' + num + ');';
    alert('Erreur RPC : ' + err.message + '\n\nExécute manuellement :\n' + sql);
  }
}

async function copierClipboard(text, btnId) {
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId);
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié !';
    document.getElementById('sia-prompt-feedback').textContent = '✅ Copié dans le presse-papier';
    setTimeout(() => {
      btn.innerHTML = original;
      document.getElementById('sia-prompt-feedback').textContent = '';
    }, 2500);
  } catch (_) {
    document.getElementById('sia-prompt-feedback').textContent = '⚠ Copie manuelle requise — Ctrl+C';
  }
}

function genererSql() {
  const num = state.sessionNum;
  if (!num) { alert('Aucune session active.'); return; }
  const avancement = document.getElementById('sia-avancement').value.trim();
  if (!avancement) { alert('Remplis le champ Avancement.'); return; }
  const statut = document.getElementById('sia-statut').value;
  const refs   = document.getElementById('sia-refs').value;
  state.currentSql = buildClotureSql(num, statut, avancement, refs);
  document.getElementById('sia-sql-preview').textContent = state.currentSql;
  show('sia-sql-preview-wrap');
  show('sia-btn-dl-sql');
}

async function cloturerViaRpc() {
  const num = state.sessionNum;
  if (!num) { alert('Aucune session active.'); return; }
  const avancement = document.getElementById('sia-avancement').value.trim();
  if (!avancement) { alert('Remplis le champ Avancement.'); return; }
  const statut  = document.getElementById('sia-statut').value;
  const refsRaw = document.getElementById('sia-refs').value;
  const refsArr = refsRaw.split(',').map(r => r.trim()).filter(Boolean);
  if (!confirm('Clôturer session #' + num + ' (' + statut + ') directement via RPC ?')) return;

  try {
    const { error } = await window.bdb.rpc('atelier_cloture_session', {
      p_numero:       num,
      p_statut:       statut,
      p_avancement:   avancement,
      p_journal_refs: refsArr
    });
    if (error) throw error;
    showFeedback('sia-cloture-feedback', '✅ Session #' + num + ' clôturée (' + statut + ').', 'success');
    document.getElementById('sia-avancement').value = '';
    document.getElementById('sia-refs').value = '';
    hide('sia-sql-preview-wrap');
    hide('sia-btn-dl-sql');
    await loadContext();
  } catch (err) {
    genererSql();
    showFeedback('sia-cloture-feedback',
      'RPC échouée : ' + err.message + ' — SQL généré, colle-le dans l\'éditeur Supabase.', 'warning');
  }
}

async function ajouterDecision() {
  const ref    = document.getElementById('sia-dec-ref').value.trim();
  const titre  = document.getElementById('sia-dec-titre').value.trim();
  const desc   = document.getElementById('sia-dec-desc').value.trim();
  const mod    = document.getElementById('sia-dec-module').value.trim() || null;
  const tagsRaw = document.getElementById('sia-dec-tags').value.trim();
  const tags   = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const fb     = document.getElementById('sia-dec-feedback');

  if (!ref || !titre) {
    fb.textContent = '⚠ Réf et Titre sont obligatoires.';
    fb.className = 'small text-warning';
    return;
  }

  const today       = new Date().toISOString().slice(0, 10);
  const session_num = state.sessionNum ?? null;

  try {
    const { error } = await window.bdb
      .from('atelier_decisions')
      .insert({ ref, date: today, titre, description: desc || null, module_cible: mod, tags, session_num })
      .select();
    if (error) throw error;

    fb.textContent = '✅ Décision ajoutée.';
    fb.className = 'small text-success';
    ['sia-dec-titre', 'sia-dec-desc', 'sia-dec-module', 'sia-dec-tags']
      .forEach(id => { document.getElementById(id).value = ''; });
    await loadContext(); // refresh pour mettre à jour autoRef et le tableau
  } catch (err) {
    fb.textContent = '❌ ' + err.message;
    fb.className = 'small text-danger';
  }
}

/* ================================================================
   POINT D'ENTRÉE
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  (async () => {
    await window.bdbShellReady;

    // Si l'événement auth-required a été dispatché, bdbUser est undefined → stop
    if (!window.bdbUser) return;

    if (!window.bdbUser.isAdmin) {
      hide('sia-loading');
      show('sia-denied');
      return;
    }

    hide('sia-loading');
    show('sia-content');
    await loadContext();

    /* --- Connexion des listeners --- */

    // Refresh
    document.getElementById('sia-btn-refresh')
      .addEventListener('click', loadContext);

    // Ouvrir session (délégation sur la liste)
    document.getElementById('sia-sessions-list')
      .addEventListener('click', e => {
        const btn = e.target.closest('[data-action="open"]');
        if (!btn) return;
        ouvrirSession(parseInt(btn.dataset.num, 10));
      });

    // Prompt ouverture
    document.getElementById('sia-btn-prompt-ouverture')
      .addEventListener('click', () => {
        const text = buildPromptOuverture();
        if (!text) return;
        copierClipboard(text, 'sia-btn-prompt-ouverture');
      });

    // Prompt clôture
    document.getElementById('sia-btn-prompt-cloture')
      .addEventListener('click', () => {
        const text = buildPromptCloture();
        if (!text) return;
        copierClipboard(text, 'sia-btn-prompt-cloture');
      });

    // Générer SQL clôture
    document.getElementById('sia-btn-gen-sql')
      .addEventListener('click', genererSql);

    // Télécharger SQL
    document.getElementById('sia-btn-dl-sql')
      .addEventListener('click', () => downloadSql(state.currentSql, state.sessionNum));

    // Copier SQL
    document.getElementById('sia-btn-copy-sql')
      .addEventListener('click', async () => {
        const btn = document.getElementById('sia-btn-copy-sql');
        try {
          await navigator.clipboard.writeText(state.currentSql);
          const orig = btn.innerHTML;
          btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Copié';
          setTimeout(() => { btn.innerHTML = orig; }, 2500);
        } catch (_) { /* clipboard non disponible */ }
      });

    // Clôturer via RPC
    document.getElementById('sia-btn-cloture-rpc')
      .addEventListener('click', cloturerViaRpc);

    // Ajouter décision
    document.getElementById('sia-btn-add-decision')
      .addEventListener('click', ajouterDecision);

    // Enter dans titre décision → insérer
    document.getElementById('sia-dec-titre')
      .addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ajouterDecision(); }
      });

  })();
});

}());
