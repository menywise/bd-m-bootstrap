/* ============================================================
   _TEMPLATE_MODULE_V5_2_0-demo.js  (S129 -- 2026-05-10)
   ============================================================
   Compagnon JS du template demo card-CRUD V5.2.0.
   Genere les 4 variants (B/C/D/E) avec donnees fictives,
   binde le toggle role et les 4 boutons modales.
   Cree pour respecter INTERDIT-JS-01 (zero JS inline > 5 lignes).

   Cible : .app-content (porteur des variables couleur module et
   du selector [data-bdb-role] cascade CSS L3).

   Doctrine card-CRUD : CONV-CARD-05..13 + INTERDIT-CARD-HALLUCINATION-01
   Source : modules/glossaire/index.html (REF-MODULE-DBM-01)
   ============================================================ */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     1. Mock window.bdbUser pour la demo
     (override apres chargement bdb-shell.js, sans toucher au shell)
     ------------------------------------------------------------ */
  function applyDemoRole(role) {
    var base = {
      id: 'demo-user-id',
      email: 'demo@dbm.local',
      prenom: 'Demo',
      nom: 'User',
      initials: 'DU',
      avatar_url: null,
      fonction: 'demo',
      role: 'admin',
      isDemo: true,
      isMember: true,
      isAdmin: false,
      isCreator: false,
      isRedacteur: false,
      isSuspended: false
    };
    switch (role) {
      case 'createur':
        base.role = 'admin';
        base.isAdmin = true; base.isCreator = true; base.isRedacteur = true;
        break;
      case 'admin':
        base.role = 'admin';
        base.isAdmin = true; base.isRedacteur = true;
        break;
      case 'redacteur':
        base.role = 'redacteur';
        base.isRedacteur = true;
        break;
      case 'membre':
        base.role = 'membre';
        break;
      case 'invite':
        base.role = 'invite';
        base.isMember = false;
        break;
      case 'suspendu':
        base.role = 'admin';
        base.isAdmin = true; base.isRedacteur = true; base.isSuspended = true;
        break;
    }
    window.bdbUser = base;

    // attribut sur .app-content pour selector CSS [data-bdb-role]
    var appContent = document.querySelector('.app-content');
    if (appContent) {
      appContent.dataset.bdbRole = base.role;
      if (base.isSuspended) appContent.dataset.bdbSuspended = 'true';
      else delete appContent.dataset.bdbSuspended;
    }
  }

  /* ------------------------------------------------------------
     2. Donnees fictives pour les cards
     ------------------------------------------------------------ */
  var DEMO_ITEMS_B = [
    {
      id: 'card-b1', user_id: 'demo-user-id',
      icon: 'bi-card-checklist',
      badge: 'Publie', title: 'Protocole PTH ortho',
      subtitle: 'Voie posterieure -- Dr X.',
      tags: ['ortho', 'PTH', 'voie post.'],
      body: 'Picking valide, preferences chirurgien documentees, substitutions terrain enregistrees.',
      progress: 100, progressLabel: 'Combo',
      footerLeft: 'Modifie 2026-05-08', footerRight: 'Sabine D.',
      expandable: true
    },
    {
      id: 'card-b2', user_id: 'autre-user',
      icon: 'bi-bandaid', accent: 'module-strong',
      badge: 'Brouillon', title: 'Arthroscopie genou',
      subtitle: 'Diagnostic + reparation',
      tags: ['genou', 'arthro'],
      body: 'En cours de validation par Olivia. CCAM a verifier sur Ameli.',
      progress: 65, progressLabel: 'Combo',
      footerLeft: 'Cree 2026-05-05', footerRight: 'Julie C.',
      expandable: true
    },
    {
      id: 'card-b3', user_id: 'demo-user-id',
      icon: 'bi-clipboard2-pulse',
      badge: 'Revue', title: 'Tenodese biceps',
      subtitle: 'Epaule -- ciel ouvert',
      tags: ['epaule', 'biceps'],
      body: 'Differenciation tenotomie / tenodese / tenolyse documentee. Combo a 80%.',
      progress: 80, progressLabel: 'Combo',
      footerLeft: 'Maj 2026-05-03', footerRight: 'Manu',
      expandable: false
    }
  ];

  var DEMO_ITEMS_C = [
    { id: 'c1', user_id: 'demo-user-id', title: 'Glossaire', subtitle: '1 247 termes',
      tags: ['L1', 'savoir'], cta: { label: 'Consulter', icon: 'bi-eye', verb: 'view' } },
    { id: 'c2', user_id: 'demo-user-id', title: 'Thesaurus', subtitle: '380 protocoles',
      tags: ['L1', 'reference'], cta: { label: 'Consulter', icon: 'bi-eye', verb: 'view' } },
    { id: 'c3', user_id: 'demo-user-id', title: 'Anatomie', subtitle: '142 fiches',
      tags: ['L1', 'cours'], cta: { label: 'Modifier', icon: 'bi-pencil', verb: 'edit' } },
    { id: 'c4', user_id: 'demo-user-id', title: 'Arsenal', subtitle: '892 references',
      tags: ['L2', 'instance'], cta: { label: 'Voir', icon: 'bi-eye', verb: 'view' } }
  ];

  var DEMO_ITEMS_D = [
    { title: 'Protocoles', metricValue: '380', metricLabel: 'thesaurus L1', icon: 'bi-collection' },
    { title: 'Combos 100%', metricValue: '47', metricLabel: 'protocoles complets', icon: 'bi-check2-circle' },
    { title: 'Termes', metricValue: '1 247', metricLabel: 'glossaire L1', icon: 'bi-book' },
    { title: 'Membres', metricValue: '23', metricLabel: 'instance Chenieux', icon: 'bi-people' }
  ];

  /* ------------------------------------------------------------
     3. Rendu des grilles
     ------------------------------------------------------------ */
  function renderVariantB() {
    var grid = document.getElementById('demoVariantBGrid');
    if (!grid || !window.dbmCard) return;
    grid.innerHTML = '';
    DEMO_ITEMS_B.forEach(function (it) {
      var col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-xl-4';
      var card = window.dbmCard.render(Object.assign({}, it, { variant: 'b', item: it }));
      col.appendChild(card);
      grid.appendChild(col);
    });
  }

  function renderVariantC() {
    var grid = document.getElementById('demoVariantCGrid');
    if (!grid || !window.dbmCard) return;
    grid.innerHTML = '';
    DEMO_ITEMS_C.forEach(function (it) {
      var col = document.createElement('div');
      col.className = 'col-12 col-md-4 col-xl-3';
      var card = window.dbmCard.render({
        variant: 'c', item: it,
        title: it.title, subtitle: it.subtitle, tags: it.tags,
        cta: it.cta
      });
      col.appendChild(card);
      grid.appendChild(col);
    });
  }

  function renderVariantD() {
    var grid = document.getElementById('demoVariantDGrid');
    if (!grid || !window.dbmCard) return;
    grid.innerHTML = '';
    DEMO_ITEMS_D.forEach(function (it) {
      var col = document.createElement('div');
      col.className = 'col-6 col-md-3';
      var card = window.dbmCard.render({
        variant: 'd', icon: it.icon, title: it.title,
        metrics: [{ value: it.metricValue, label: it.metricLabel }]
      });
      col.appendChild(card);
      grid.appendChild(col);
    });
  }

  function renderVariantE() {
    var box = document.getElementById('demoVariantEContainer');
    if (!box || !window.dbmCard) return;
    box.innerHTML = '';
    var card = window.dbmCard.render({
      variant: 'e', icon: 'bi-pencil-square',
      title: 'Editer un protocole',
      subtitle: 'Form unique pleine largeur -- 1 CTA Enregistrer header',
      body: 'Le contenu reel d\\'un form arrive ici (champs, selects, switches). ' +
            'Ce variant masque kebab et chevron, et n\\'a qu\\'un CTA Enregistrer en header.',
      cta: { label: 'Enregistrer', icon: 'bi-check2', verb: 'edit' }
    });
    box.appendChild(card);
  }

  function renderAll() {
    renderVariantB();
    renderVariantC();
    renderVariantD();
    renderVariantE();
  }

  /* ------------------------------------------------------------
     4. Toggle role (preview matrice CONV-CARD-10)
     ------------------------------------------------------------ */
  var ROLE_HINTS = {
    createur  : 'Createur -- toutes actions accessibles + mode preview shell.',
    admin     : 'Admin -- toutes actions accessibles selon ownership.',
    redacteur : 'Redacteur -- create + edit/delete own items.',
    membre    : 'Membre -- edit own items, vote/comment/flag/export.',
    invite    : 'Invite -- lecture seule (view/share/print).',
    suspendu  : 'Suspendu -- override sanction : view/share/print uniquement, kebab masque, opacite reduite.'
  };

  function bindRoleToggle() {
    var btns = document.querySelectorAll('[data-demo-role]');
    var hint = document.getElementById('demoRoleHint');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        var role = btn.dataset.demoRole;
        Array.prototype.forEach.call(btns, function (b) {
          b.classList.remove('btn-module');
          b.classList.add('btn-module-outline');
        });
        btn.classList.remove('btn-module-outline');
        btn.classList.add('btn-module');
        applyDemoRole(role);
        if (hint) {
          hint.innerHTML = 'Role courant : <strong>' + role.charAt(0).toUpperCase() + role.slice(1) +
                          '</strong> -- ' + (ROLE_HINTS[role] || '');
        }
        renderAll();
      });
    });
  }

  /* ------------------------------------------------------------
     5. Bind boutons modales (4 patterns CONV-CARD-11)
     ------------------------------------------------------------ */
  var MODAL_DEMOS = {
    'create-edit' : {
      title: 'Editer un protocole',
      bodyHtml: '<form><div class="mb-3"><label class="form-label">Libelle</label>' +
                '<input type="text" class="form-control" value="Protocole demo"/></div>' +
                '<div class="mb-3"><label class="form-label">Notes</label>' +
                '<textarea class="form-control" rows="4">Contenu form pleine largeur.</textarea></div></form>',
      confirmLabel: 'Enregistrer'
    },
    'view-detail' : {
      title: 'Detail du protocole',
      bodyHtml: '<dl class="row mb-0">' +
                '<dt class="col-sm-3">Libelle</dt><dd class="col-sm-9">PTH ortho voie post.</dd>' +
                '<dt class="col-sm-3">CCAM</dt><dd class="col-sm-9">NEKA020</dd>' +
                '<dt class="col-sm-3">Combo</dt><dd class="col-sm-9">100%</dd>' +
                '</dl>'
    },
    'confirm' : {
      title: 'Supprimer cet element ?',
      body: 'Cette action est irreversible. L\\'element sera retire du thesaurus et toutes les relations associees seront orphelines.',
      confirmLabel: 'Supprimer definitivement'
    },
    'lightbox' : {
      title: 'Schema anatomique',
      bodyHtml: '<div class="text-center text-white p-4">' +
                '<i class="bi bi-image" style="font-size:8rem;opacity:.3"></i>' +
                '<p class="mt-3">Image plein ecran (placeholder).</p></div>'
    }
  };

  function bindModalButtons() {
    var btns = document.querySelectorAll('[data-demo-modal]');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener('click', function () {
        if (!window.dbmCard) return;
        var t = btn.dataset.demoModal;
        window.dbmCard.openModal(t, MODAL_DEMOS[t] || {});
      });
    });
  }

  /* ------------------------------------------------------------
     6. Init au DOM ready (apres bdb-shell pour avoir window.bdbUser)
     ------------------------------------------------------------ */
  function init() {
    applyDemoRole('admin');
    renderAll();
    bindRoleToggle();
    bindModalButtons();
  }

  if (window.bdbShellReady && typeof window.bdbShellReady.then === 'function') {
    window.bdbShellReady.then(init).catch(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
