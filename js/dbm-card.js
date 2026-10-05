/* ============================================================
   dbm-card.js v1.0.0  (S129 -- 2026-05-09)
   ============================================================
   Factory composants card-CRUD universels DBM.
   Doctrine : CONV-CARD-05..13 + INTERDIT-CARD-HALLUCINATION-01
   Source   : atelier_principes (cloud, S128 -- 2026-05-09)
   Charge   : apres bdb-shell.js (lit window.bdbUser),
              avant [module]-app.js (CONV-CHAIN-E)
   API publique :
     window.dbmCard.VERBS
     window.dbmCard.canDo(verb, item)
     window.dbmCard.render(config)        => HTMLElement
     window.dbmCard.renderActions(item)   => HTMLElement | null
     window.dbmCard.openModal(type, data) => bootstrap.Modal | null
   Cascade roles (CONV-CARD-13) :
     Createur > Admin > Redacteur > Membre > Invite > Suspendu
   Slots (CONV-CARD-05) :
     1 badge / 2 icon / 3 title / 4 subtitle / 5 tags / 6 body
     7 metrics / 8 timeline / 9 footer / 10 kebab / 11 chevron
   Anti-cumul : kebab et CTA inline ne coexistent pas (variant C/E).
   Touch >=44 px (CSS .dbm-card-crud__kebab/__chevron/__cta).
   Aucune couleur hardcoded ici (tout via classes module CSS).
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. Helper escHtml -- fallback si bdb-ui.js pas charge
     ---------------------------------------------------------------- */
  var _esc = (typeof window.escHtml === 'function') ? window.escHtml : function (s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  /* ----------------------------------------------------------------
     2. VERBS -- 18 actions canoniques (CONV-CARD-12)
     Libelles FR figes (ASCII pour Notepad++).
     Icones bi-* figees (ne pas modifier sans arbitrage cloud).
     ---------------------------------------------------------------- */
  var VERBS = Object.freeze({
    view      : { label: 'Consulter',         icon: 'bi-eye' },
    create    : { label: 'Nouveau',           icon: 'bi-plus-lg' },
    edit      : { label: 'Modifier',          icon: 'bi-pencil' },
    'delete'  : { label: 'Supprimer',         icon: 'bi-trash', danger: true },
    archive   : { label: 'Archiver',          icon: 'bi-archive' },
    restore   : { label: 'Restaurer',         icon: 'bi-arrow-counterclockwise' },
    duplicate : { label: 'Dupliquer',         icon: 'bi-files' },
    publish   : { label: 'Publier',           icon: 'bi-cloud-upload' },
    unpublish : { label: 'Depublier',         icon: 'bi-cloud-slash' },
    validate  : { label: 'Valider',           icon: 'bi-check2-circle' },
    reject    : { label: 'Rejeter',           icon: 'bi-x-circle' },
    vote      : { label: 'Voter',             icon: 'bi-hand-thumbs-up' },
    unvote    : { label: 'Retirer mon vote',  icon: 'bi-hand-thumbs-up-fill' },
    flag      : { label: 'Signaler',          icon: 'bi-flag' },
    comment   : { label: 'Commenter',         icon: 'bi-chat-dots' },
    share     : { label: 'Partager',          icon: 'bi-share' },
    'export'  : { label: 'Exporter',          icon: 'bi-download' },
    print     : { label: 'Imprimer',          icon: 'bi-printer' }
  });

  /* ----------------------------------------------------------------
     3. canDo -- matrice role x action (CONV-CARD-10)
     Owner = item.user_id === bdbUser.id (orthogonal aux roles).
     isSuspended override : seules view / share / print restent.
     ---------------------------------------------------------------- */
  function canDo(verb, item) {
    var u = window.bdbUser || {};
    if (!u.id) return false;
    if (u.isSuspended && verb !== 'view' && verb !== 'share' && verb !== 'print') return false;

    var isOwner = !!(item && item.user_id && u.id === item.user_id);

    switch (verb) {
      case 'view'      : return true;
      case 'share'     : return true;
      case 'print'     : return true;
      case 'create'    : return !!u.isRedacteur;
      case 'edit'      : return !!u.isAdmin || (!!u.isMember && isOwner);
      case 'delete'    : return !!u.isAdmin || (!!u.isRedacteur && isOwner);
      case 'archive'   : return !!u.isAdmin || isOwner;
      case 'restore'   : return !!u.isAdmin;
      case 'duplicate' : return !!u.isAdmin || isOwner;
      case 'publish'   : return !!u.isAdmin;
      case 'unpublish' : return !!u.isAdmin;
      case 'validate'  : return !!u.isAdmin;
      case 'reject'    : return !!u.isAdmin;
      case 'vote'      : return !!u.isMember;
      case 'unvote'    : return !!u.isMember;
      case 'flag'      : return !!u.isMember;
      case 'comment'   : return !!u.isMember;
      case 'export'    : return !!u.isMember;
      default          : return false;
    }
  }

  /* ----------------------------------------------------------------
     4. renderActions -- kebab dropdown DOM (slot 10)
     Retourne null si aucun verbe accessible (kebab masque).
     opts.verbs = liste filtree (default: view/edit/duplicate/archive/delete)
     ---------------------------------------------------------------- */
  function renderActions(item, opts) {
    opts = opts || {};
    var verbs = opts.verbs || ['view', 'edit', 'duplicate', 'archive', 'delete'];

    var allowed = [];
    for (var i = 0; i < verbs.length; i++) {
      if (VERBS[verbs[i]] && canDo(verbs[i], item)) allowed.push(verbs[i]);
    }
    if (allowed.length === 0) return null;

    var wrap = document.createElement('div');
    wrap.className = 'dropdown';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dbm-card-crud__kebab';
    btn.setAttribute('data-bs-toggle', 'dropdown');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Actions');
    btn.innerHTML = '<i class="bi bi-three-dots-vertical" aria-hidden="true"></i>';
    wrap.appendChild(btn);

    var menu = document.createElement('ul');
    menu.className = 'dropdown-menu dropdown-menu-end shadow-sm';

    for (var j = 0; j < allowed.length; j++) {
      var v = allowed[j];
      var def = VERBS[v];
      var li = document.createElement('li');
      var a = document.createElement('button');
      a.type = 'button';
      a.className = 'dropdown-item' + (def.danger ? ' text-danger' : '');
      a.dataset.verb = v;
      if (item && item.id != null) a.dataset.itemId = String(item.id);
      a.innerHTML = '<i class="bi ' + _esc(def.icon) + ' me-2" aria-hidden="true"></i>' + _esc(def.label);
      li.appendChild(a);
      menu.appendChild(li);
    }
    wrap.appendChild(menu);
    return wrap;
  }

  /* ----------------------------------------------------------------
     5. render -- factory card complete (variants B/C/D/E)
     config = {
       variant   : 'b'|'c'|'d'|'e' (default 'b')
       item      : { id, user_id, ... }
       badge     : string
       icon      : 'bi-...' (slot 2)
       title     : string
       subtitle  : string
       tags      : string[]
       body      : string
       metrics   : [{value,label}]
       progress  : 0..100
       progressLabel : string
       footerLeft, footerRight : string
       expandable : boolean (slot 11)
       actions    : false pour desactiver kebab
       verbs      : liste verbes pour kebab
       cta        : { label, icon, verb } (variants C/E uniquement)
       accent     : 'module-strong'
     }
     ---------------------------------------------------------------- */
  function render(config) {
    config = config || {};
    var variant = (config.variant || 'b').toLowerCase();
    if (['b', 'c', 'd', 'e'].indexOf(variant) === -1) variant = 'b';
    var item = config.item || {};

    var card = document.createElement('article');
    card.className = 'dbm-card-crud dbm-card-crud--variant-' + variant;
    if (item.id != null) card.dataset.itemId = String(item.id);
    if (config.accent) card.dataset.accent = String(config.accent);

    /* slot 1 -- badge */
    if (config.badge) {
      var b1 = document.createElement('span');
      b1.className = 'dbm-card-crud__badge';
      b1.innerHTML = _esc(config.badge);
      card.appendChild(b1);
    }

    /* slot 2 + 3 -- icon + title (groupe header) */
    var hdr = document.createElement('div');
    hdr.className = 'd-flex align-items-center gap-2';
    if (config.icon) {
      var ic = document.createElement('span');
      ic.className = 'dbm-card-crud__icon';
      ic.innerHTML = '<i class="bi ' + _esc(config.icon) + '" aria-hidden="true"></i>';
      hdr.appendChild(ic);
    }
    if (config.title) {
      var t = document.createElement('h3');
      t.className = 'dbm-card-crud__title';
      t.innerHTML = _esc(config.title);
      hdr.appendChild(t);
    }
    if (hdr.children.length) card.appendChild(hdr);

    /* slot 4 -- subtitle */
    if (config.subtitle) {
      var sub = document.createElement('p');
      sub.className = 'dbm-card-crud__subtitle';
      sub.innerHTML = _esc(config.subtitle);
      card.appendChild(sub);
    }

    /* slot 5 -- tags */
    if (Array.isArray(config.tags) && config.tags.length) {
      var tw = document.createElement('div');
      tw.className = 'dbm-card-crud__tags';
      for (var k = 0; k < config.tags.length; k++) {
        var ts = document.createElement('span');
        ts.className = 'dbm-card-crud__tag';
        ts.innerHTML = _esc(config.tags[k]);
        tw.appendChild(ts);
      }
      card.appendChild(tw);
    }

    /* slot 6 -- body */
    if (config.body) {
      var bd = document.createElement('div');
      bd.className = 'dbm-card-crud__body';
      bd.innerHTML = _esc(config.body);
      card.appendChild(bd);
    }

    /* slot 7 -- metrics */
    if (Array.isArray(config.metrics) && config.metrics.length) {
      var mw = document.createElement('div');
      mw.className = 'dbm-card-crud__metrics';
      for (var n = 0; n < config.metrics.length; n++) {
        var m = config.metrics[n] || {};
        var mc = document.createElement('div');
        mc.className = 'dbm-card-crud__metric';
        mc.innerHTML =
          '<span class="dbm-card-crud__metric-value">' + _esc(m.value) + '</span>' +
          '<span class="dbm-card-crud__metric-label">' + _esc(m.label) + '</span>';
        mw.appendChild(mc);
      }
      card.appendChild(mw);
    }

    /* slot 8 -- timeline / progress */
    if (config.progress != null) {
      var pct = Math.max(0, Math.min(100, Number(config.progress) || 0));
      var tl = document.createElement('div');
      tl.className = 'dbm-card-crud__timeline';
      tl.innerHTML =
        '<span>' + _esc(config.progressLabel || '') + '</span>' +
        '<div class="dbm-card-crud__progress" role="progressbar" aria-valuenow="' + pct +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="dbm-card-crud__progress-bar" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span>' + pct + '%</span>';
      card.appendChild(tl);
    }

    /* slot 9 -- footer */
    if (config.footerLeft || config.footerRight) {
      var ft = document.createElement('div');
      ft.className = 'dbm-card-crud__footer';
      ft.innerHTML =
        '<span>' + _esc(config.footerLeft || '') + '</span>' +
        '<span>' + _esc(config.footerRight || '') + '</span>';
      card.appendChild(ft);
    }

    /* slot 10 -- kebab : variants B uniquement (anti-cumul C/E ont CTA) */
    if (variant === 'b' && config.actions !== false) {
      var keb = renderActions(item, { verbs: config.verbs });
      if (keb) card.appendChild(keb);
    }

    /* slot 11 -- chevron : variants B uniquement */
    if (variant === 'b' && config.expandable) {
      var chv = document.createElement('button');
      chv.type = 'button';
      chv.className = 'dbm-card-crud__chevron';
      chv.setAttribute('aria-expanded', 'false');
      chv.setAttribute('aria-label', 'Deplier');
      chv.innerHTML = '<i class="bi bi-chevron-down" aria-hidden="true"></i>';
      card.appendChild(chv);
    }

    /* CTA secondaire : variants C / E (anti-cumul kebab) */
    if ((variant === 'c' || variant === 'e') && config.cta) {
      var cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'btn btn-module btn-sm dbm-card-crud__cta';
      if (config.cta.verb) cta.dataset.verb = config.cta.verb;
      cta.innerHTML =
        (config.cta.icon ? '<i class="bi ' + _esc(config.cta.icon) + ' me-1" aria-hidden="true"></i>' : '') +
        _esc(config.cta.label || 'Action');
      card.appendChild(cta);
    }

    return card;
  }

  /* ----------------------------------------------------------------
     6. openModal -- 4 patterns CONV-CARD-11
     types : 'create-edit' | 'view-detail' | 'confirm' | 'lightbox'
     data  : { title, body, bodyHtml, footerHtml, confirmLabel }
     ---------------------------------------------------------------- */
  var SIZE_MAP = {
    'create-edit' : 'modal-xl',
    'view-detail' : 'modal-lg',
    'confirm'     : 'modal-lg',
    'lightbox'    : 'modal-xl'
  };

  function openModal(modalType, data) {
    data = data || {};
    if (!window.bootstrap || !window.bootstrap.Modal) return null;

    var domId = 'dbm-modal-' + modalType;
    var el = document.getElementById(domId);
    if (!el) {
      el = _buildModal(modalType, data);
      document.body.appendChild(el);
    } else {
      _populateModal(el, modalType, data);
    }
    var m = window.bootstrap.Modal.getOrCreateInstance(el, { backdrop: true });
    m.show();
    return m;
  }

  function _buildModal(type, data) {
    var size = SIZE_MAP[type] || 'modal-lg';
    var isLight = (type === 'lightbox');
    var el = document.createElement('div');
    el.id = 'dbm-modal-' + type;
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="modal-dialog ' + size + ' modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down">' +
        '<div class="modal-content rounded-4 border-0 shadow-lg' + (isLight ? ' bg-dark' : '') + '">' +
          '<div class="modal-header modal-header-module">' +
            '<h2 class="modal-title fs-5"></h2>' +
            '<button type="button" class="btn-close' + (isLight ? ' btn-close-white' : '') +
              '" data-bs-dismiss="modal" aria-label="Fermer"></button>' +
          '</div>' +
          '<div class="modal-body"></div>' +
          '<div class="modal-footer"></div>' +
        '</div>' +
      '</div>';
    _populateModal(el, type, data);
    return el;
  }

  function _populateModal(el, type, data) {
    var titleEl  = el.querySelector('.modal-title');
    var bodyEl   = el.querySelector('.modal-body');
    var footerEl = el.querySelector('.modal-footer');
    if (titleEl)  titleEl.textContent = data.title || '';
    if (bodyEl)   bodyEl.innerHTML    = data.bodyHtml || _esc(data.body || '');

    if (!footerEl) return;
    footerEl.classList.remove('d-none');
    footerEl.innerHTML = '';

    if (type === 'create-edit') {
      footerEl.innerHTML =
        '<button type="button" class="btn btn-module-outline" data-bs-dismiss="modal">Annuler</button>' +
        '<button type="button" class="btn btn-module" data-action="save">' +
          _esc(data.confirmLabel || 'Enregistrer') + '</button>';
    } else if (type === 'confirm') {
      footerEl.innerHTML =
        '<button type="button" class="btn btn-module-outline" data-bs-dismiss="modal">Annuler</button>' +
        '<button type="button" class="btn btn-danger" data-action="confirm">' +
          _esc(data.confirmLabel || 'Confirmer') + '</button>';
    } else if (type === 'view-detail' && data.footerHtml) {
      footerEl.innerHTML = data.footerHtml;
    } else {
      footerEl.classList.add('d-none');
    }
  }

  /* ----------------------------------------------------------------
     7. Exposition publique (fige)
     ---------------------------------------------------------------- */
  window.dbmCard = Object.freeze({
    VERBS         : VERBS,
    canDo         : canDo,
    render        : render,
    renderActions : renderActions,
    openModal     : openModal
  });

})();
