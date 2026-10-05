/* ================================================================
   bdb-crud-helpers.js — Bible de Bloc
   Composant partagé — Helpers CRUD pour les pages Créateur
   Usage : atelier/tables/* uniquement (L3 — ne voyage pas)
   CDS Compliant | escHtml | zero onclick inline | var + IIFE
   VERSION : 1.0.0 — 2026-04-14
   ================================================================ */

var BdbCrud = (function () {

  /* ── Sécurité XSS ─────────────────────────────────────────── */
  function _esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Toast interne ────────────────────────────────────────── */
  function _toast(msg, type) {
    var toastEl = document.getElementById('crudToast');
    var toastBody = document.getElementById('crudToastBody');
    if (!toastEl || !toastBody) return;
    toastBody.textContent = msg;
    toastEl.className = 'toast align-items-center border-0 text-bg-'
      + (type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary');
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3500 }).show();
  }

  /* ── Instance Bootstrap Modal ─────────────────────────────── */
  function _getModal(id) {
    var el = document.getElementById(id);
    return el ? bootstrap.Modal.getOrCreateInstance(el) : null;
  }

  /* ── Spinner bouton ───────────────────────────────────────── */
  function _setBtnLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Sauvegarde…';
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.originalText || 'Enregistrer';
      btn.disabled = false;
    }
  }

  /* ── API publique ─────────────────────────────────────────── */
  return {

    /**
     * escHtml — exposé pour les modules hôtes
     * @param {*} str
     * @returns {string}
     */
    esc: _esc,

    /**
     * getModal — instance Bootstrap Modal
     * @param {string} id — id de l'élément modal
     * @returns {bootstrap.Modal|null}
     */
    getModal: _getModal,

    /**
     * toast — notification standard
     * @param {string} msg
     * @param {'success'|'error'|'info'} type
     */
    toast: _toast,

    /**
     * save — INSERT ou UPDATE selon présence de id
     * @param {string}   table     — nom de la table Supabase
     * @param {Object}   payload   — colonnes à écrire
     * @param {string|null} id     — uuid existant (UPDATE) ou null (INSERT)
     * @param {Function} onSuccess — callback après succès (ex: recharger la liste)
     * @param {HTMLElement} [btn]  — bouton save (pour le spinner)
     * @returns {Promise<boolean>}
     */
    async save(table, payload, id, onSuccess, btn) {
      if (!window.bdb) { _toast('Client Supabase indisponible.', 'error'); return false; }
      _setBtnLoading(btn, true);
      var result;
      if (id) {
        result = await window.bdb.from(table).update(payload).eq('id', id).select();
      } else {
        result = await window.bdb.from(table).insert(payload).select();
      }
      _setBtnLoading(btn, false);
      if (result.error) {
        _toast('Erreur : ' + result.error.message, 'error');
        return false;
      }
      _toast(id ? 'Modification enregistrée.' : 'Élément créé.', 'success');
      if (typeof onSuccess === 'function') onSuccess(result.data);
      return true;
    },

    /**
     * del — DELETE avec confirmation modale intégrée
     * @param {string}   table     — nom de la table Supabase
     * @param {string}   id        — uuid de la ligne à supprimer
     * @param {string}   label     — libellé affiché dans la confirmation
     * @param {Function} onSuccess — callback après suppression
     * @returns {Promise<void>}
     */
    del(table, id, label, onSuccess) {
      var modal = _getModal('modalConfirmDel');
      var labelEl = document.getElementById('confirmDelLabel');
      if (!modal || !labelEl) {
        // fallback natif si pas de modal de confirmation
        if (!confirm('Supprimer « ' + label + ' » ?')) return Promise.resolve();
        return this._execDel(table, id, onSuccess);
      }
      labelEl.textContent = label;
      // Listener unique — remplace le précédent
      var btnConfirm = document.getElementById('btnConfirmDel');
      if (btnConfirm) {
        var clone = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(clone, btnConfirm);
        clone.addEventListener('click', async () => {
          modal.hide();
          await this._execDel(table, id, onSuccess);
        });
      }
      modal.show();
      return Promise.resolve();
    },

    /**
     * _execDel — exécution réelle du DELETE (appelé par del)
     */
    async _execDel(table, id, onSuccess) {
      if (!window.bdb) { _toast('Client Supabase indisponible.', 'error'); return; }
      var result = await window.bdb.from(table).delete().eq('id', id).select();
      if (result.error) {
        _toast('Erreur suppression : ' + result.error.message, 'error');
        return;
      }
      _toast('Élément supprimé.', 'success');
      if (typeof onSuccess === 'function') onSuccess();
    },

    /**
     * renderCount — affiche un compteur KPI dans un élément
     * @param {string} elId    — id de l'élément cible
     * @param {string} table   — table Supabase à compter
     * @param {Object} [filter] — { column, value } optionnel
     */
    async renderCount(elId, table, filter) {
      var el = document.getElementById(elId);
      if (!el || !window.bdb) return;
      var q = window.bdb.from(table).select('id', { count: 'exact', head: true });
      if (filter) q = q.eq(filter.column, filter.value);
      var result = await q;
      el.textContent = result.error ? '—' : (result.count ?? 0);
    },

    /**
     * HTML du toast standard — à injecter une fois dans la page hôte
     * Usage : document.body.insertAdjacentHTML('beforeend', BdbCrud.toastHtml());
     */
    toastHtml() {
      return [
        '<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:9999">',
        '  <div id="crudToast" class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">',
        '    <div class="d-flex">',
        '      <div class="toast-body" id="crudToastBody"></div>',
        '      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    },

    /**
     * HTML de la modale de confirmation — à injecter une fois dans la page hôte
     * Usage : document.body.insertAdjacentHTML('beforeend', BdbCrud.confirmModalHtml());
     */
    confirmModalHtml() {
      return [
        '<div class="modal fade" id="modalConfirmDel" tabindex="-1" aria-labelledby="confirmDelTitle" aria-hidden="true">',
        '  <div class="modal-dialog modal-dialog-centered">',
        '    <div class="modal-content">',
        '      <div class="modal-header">',
        '        <h5 class="modal-title" id="confirmDelTitle"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Confirmer la suppression</h5>',
        '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>',
        '      </div>',
        '      <div class="modal-body">',
        '        Supprimer définitivement <strong id="confirmDelLabel"></strong> ? Cette action est irréversible.',
        '      </div>',
        '      <div class="modal-footer">',
        '        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>',
        '        <button type="button" class="btn btn-danger" id="btnConfirmDel">',
        '          <i class="bi bi-trash me-1"></i>Supprimer',
        '        </button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    },

    isReady() { return typeof window.bdb !== 'undefined'; }

  };

})();
