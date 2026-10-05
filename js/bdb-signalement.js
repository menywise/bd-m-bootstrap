// ═══════════════════════════════════════════════════════════════════════════
// bdb-signalement.js — Bouton flottant signalement (standalone)
// Extrait de bdb-shell.js pour les pages sans bdb-shell (ex: portail racine).
// Prerequis : bootstrap.bundle, @supabase/supabase-js, supabase-client.js
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Eviter double injection si bdb-shell est aussi present
  if (document.getElementById('bdbSigFab')) return;

  function _initSignalement() {

    // ── CSS (injection une seule fois) ──────────────────────────────────────
    const _sty = document.createElement('style');
    _sty.textContent = `
      .bdb-sig-fab {
        position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1040;
        width: 2.5rem; height: 2.5rem; border-radius: 50%;
        background: #fff; border: 1px solid #dee2e6;
        display: flex; align-items: center; justify-content: center;
        color: #6c757d; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,.12);
        transition: background .15s, color .15s, transform .15s, box-shadow .15s;
      }
      .bdb-sig-fab:hover {
        background: #fff3cd; color: #856404;
        transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,.18);
      }
      .bdb-sig-fab i { font-size: .95rem; pointer-events: none; }
      .bdb-sig-type-btn { flex: 1; font-size: .78rem; }
      .bdb-sig-type-btn.active {
        background: var(--bs-primary); color: #fff;
        border-color: var(--bs-primary);
      }
      .bdb-sig-context {
        font-size: .72rem; color: #6c757d;
        background: #f8f9fa; border: 1px solid #e9ecef;
        border-radius: .375rem; padding: .4rem .75rem;
      }
      #bdbSigDesc { font-size: .85rem; resize: vertical; }
      #bdbSigDescCount { font-size: .72rem; }
    `;
    document.head.appendChild(_sty);

    // ── HTML : bouton flottant + modale ─────────────────────────────────────
    document.body.insertAdjacentHTML('beforeend', `
      <!-- Bouton flottant signalement — bdb-signalement.js -->
      <button class="bdb-sig-fab" id="bdbSigFab"
        aria-label="Signaler un probleme" title="Signaler un probleme">
        <i class="bi bi-flag"></i>
      </button>

      <div class="modal fade" id="bdbSigModal" tabindex="-1"
        aria-labelledby="bdbSigModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">

            <div class="modal-header">
              <h5 class="modal-title" id="bdbSigModalLabel">
                <i class="bi bi-flag me-2 text-warning"></i>Signaler un probleme
              </h5>
              <button type="button" class="btn-close"
                data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>

            <div class="modal-body">

              <!-- Honeypot anti-bot : jamais visible ni rempli par un humain -->
              <div aria-hidden="true"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
                <input type="text" id="bdbSigHoneypot" tabindex="-1" autocomplete="off">
              </div>

              <!-- Type -->
              <div class="mb-3">
                <label class="form-label fw-semibold small">Type de signalement</label>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn"
                    data-type="typo">
                    <i class="bi bi-type me-1"></i>Faute / typo
                  </button>
                  <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn"
                    data-type="contenu">
                    <i class="bi bi-exclamation-circle me-1"></i>Contenu douteux
                  </button>
                  <button class="btn btn-sm btn-outline-secondary bdb-sig-type-btn"
                    data-type="bug">
                    <i class="bi bi-bug me-1"></i>Bug
                  </button>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label fw-semibold small" for="bdbSigDesc">
                  Description <span class="text-danger">*</span>
                </label>
                <textarea class="form-control" id="bdbSigDesc" rows="3"
                  placeholder="Decris ce que tu as vu, ou exactement, ce qui devrait etre correct...">
                </textarea>
                <div id="bdbSigDescCount" class="form-text"></div>
              </div>

              <!-- Contexte auto-capture -->
              <div class="bdb-sig-context">
                <i class="bi bi-geo-alt me-1"></i><span id="bdbSigCtx"></span>
              </div>
            </div>

            <div class="modal-footer justify-content-between align-items-center">
              <span id="bdbSigFeedback" class="small"></span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-secondary"
                  data-bs-dismiss="modal">Annuler</button>
                <button type="button" class="btn btn-sm btn-primary"
                  id="bdbSigSubmit" disabled>
                  <i class="bi bi-send me-1"></i>Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`);

    // ── References ──────────────────────────────────────────────────────────
    const _fab      = document.getElementById('bdbSigFab');
    const _modalEl  = document.getElementById('bdbSigModal');
    const _modal    = new bootstrap.Modal(_modalEl);
    const _typeBtns = document.querySelectorAll('.bdb-sig-type-btn');
    const _desc     = document.getElementById('bdbSigDesc');
    const _count    = document.getElementById('bdbSigDescCount');
    const _submit   = document.getElementById('bdbSigSubmit');
    const _feedback = document.getElementById('bdbSigFeedback');
    const _ctx      = document.getElementById('bdbSigCtx');
    const _honeypot = document.getElementById('bdbSigHoneypot');

    let _type        = null;
    let _submitReady = false; // vrai apres 3 secondes (anti-spam)

    // ── Helpers ─────────────────────────────────────────────────────────────

    function _getModuleCible() {
      const m = window.location.pathname.match(/modules\/([^/]+)\//);
      return m ? m[1] : 'app';
    }

    function _updateSubmit() {
      _submit.disabled = !(_submitReady && _type && _desc.value.trim().length >= 5);
    }

    // ── Ouverture modale ─────────────────────────────────────────────────────
    _fab.addEventListener('click', () => {
      // Reset complet
      _type        = null;
      _submitReady = false;
      _submit.disabled    = true;
      _desc.value         = '';
      _count.textContent  = '';
      _feedback.textContent = '';
      _honeypot.value     = '';
      _typeBtns.forEach(b => b.classList.remove('active'));

      // Contexte auto-capture
      const shellEl  = document.getElementById('bdb-shell');
      const modTitle = shellEl?.dataset?.moduleTitle || document.title.split('—')[0].trim();
      _ctx.textContent = modTitle + ' — ' + (window.location.pathname.split('/').pop() || 'index.html');

      _modal.show();

      // Anti-spam : submit actif apres 3 secondes
      setTimeout(() => { _submitReady = true; _updateSubmit(); }, 3000);
    });

    // ── Selection type ───────────────────────────────────────────────────────
    _typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        _type = btn.dataset.type;
        _typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _updateSubmit();
      });
    });

    // ── Compteur description ─────────────────────────────────────────────────
    _desc.addEventListener('input', () => {
      const len = _desc.value.trim().length;
      _count.textContent = len + ' caractere' + (len > 1 ? 's' : '') + ' — minimum 5';
      _count.style.color = len >= 5 ? '#198754' : '#dc3545';
      _updateSubmit();
    });

    // ── Soumission ───────────────────────────────────────────────────────────
    _submit.addEventListener('click', async () => {
      if (_honeypot.value) return;    // bot detecte

      const descVal = _desc.value.trim();
      if (!descVal || descVal.length < 5 || !_type) return;

      _submit.disabled      = true;
      _feedback.textContent = '';

      try {
        const { error } = await window.bdb
          .from('signalements')
          .insert({
            type:         _type,
            module_cible: _getModuleCible(),
            entite_type:  'page',
            entite_id:    null,
            entite_label: document.title,
            description:  descVal,
            url_contexte: window.location.href,
            user_agent:   navigator.userAgent.substring(0, 200),
            honeypot:     null,
            reporter_id:  window.bdbUser?.id ?? null
          })
          .select();

        if (error) throw error;

        _feedback.textContent = '\u2705 Signalement envoy\u00e9 — merci !';
        _feedback.style.color = '#198754';
        setTimeout(() => _modal.hide(), 1800);

      } catch (err) {
        console.error('[bdb-signalement] INSERT error:', err);
        _feedback.textContent = 'Le signalement n\'a pu aboutir — r\u00e9essaie dans un instant.';
        _feedback.style.color = '#dc3545';
        _submit.disabled = false;
      }
    });
  }

  // Lancement apres DOM pret
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initSignalement);
  } else {
    _initSignalement();
  }

})();
