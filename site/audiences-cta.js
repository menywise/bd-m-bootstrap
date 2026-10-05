/**
 * FILE     : audiences-cta.js v1.3.0
 * MODULE   : site/
 * DATE     : 2026-04-06
 * AUTEUR   : Manu + Claude
 * DESC     : CTA audiences.html — mini-CTA (4 tabs) + formulaire Direction.
 *            v1.3 : ton humain, messages contextuels, email secours anti-bot.
 */

(function () {
  'use strict';

  const DELAI_MS = 3000;
  const tsChargement = Date.now();

  // Email de contact secours — reconstruit en JS, invisible aux scrapers
  const MAIL_SECOURS = ['manuel.rohaut', 'gmail.com'].join('@');

  const MSG = {
    patiente    : 'Une petite seconde… le formulaire vient juste de s\'ouvrir !',
    miniVide    : 'Un email ou un numéro suffit — on ne mord pas ! 😊',
    miniErreur  : 'Oups, une connexion capricieuse… Réessayez dans un instant, ou écrivez-nous directement à ',
    dirManquant : 'Il manque quelques infos pour vous recontacter — les champs marqués * sont indispensables.',
    dirErreur   : 'Aïe, la connexion a fait des siennes. Pas d\'inquiétude — réessayez dans un instant ou écrivez-nous à ',
  };

  // ── Helpers communs ───────────────────────────────────────────────────────

  function honeypotDeclenche() {
    const el = document.getElementById('ctaHoneypot');
    return el && el.value.length > 0;
  }

  function tropRapide() {
    return Date.now() - tsChargement < DELAI_MS;
  }

  function msgErreurReseau(base) {
    return base + MAIL_SECOURS + ' 💌';
  }

  async function insererSignalement(description) {
    const { error } = await window.bdb
      .from('signalements')
      .insert({
        type         : 'contact',
        module_cible : 'site',
        description  : description,
        url_contexte : window.location.href,
        reporter_id  : null,
      })
      .select();
    if (error) throw error;
  }

  // ── Mini-CTA (tabs non-Direction) ─────────────────────────────────────────

  document.addEventListener('click', async function (e) {
    const btn = e.target.closest('.cta-mini-btn');
    if (!btn) return;

    const container = btn.closest('[data-cta-persona]');
    if (!container) return;

    const persona   = container.dataset.ctaPersona;
    const hook      = container.dataset.ctaHook || '';
    const input     = container.querySelector('.cta-mini-contact');
    const successEl = container.querySelector('.cta-mini-success');
    const errorEl   = container.querySelector('.cta-mini-error');
    const contact   = input ? input.value.trim() : '';

    if (input) input.classList.remove('is-invalid');
    errorEl.classList.add('d-none');
    errorEl.textContent = '';

    if (honeypotDeclenche()) return;

    if (tropRapide()) {
      errorEl.textContent = MSG.patiente;
      errorEl.classList.remove('d-none');
      return;
    }

    if (!contact) {
      if (input) { input.classList.add('is-invalid'); input.focus(); }
      errorEl.textContent = MSG.miniVide;
      errorEl.classList.remove('d-none');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>';

    try {
      await insererSignalement(
        ['Demande contact — ' + persona, 'Hook : ' + hook, 'Contact : ' + contact].join('\n')
      );
      if (input) input.classList.add('d-none');
      btn.classList.add('d-none');
      successEl.classList.remove('d-none');

    } catch (err) {
      console.error('[audiences-cta] mini-CTA :', err);
      errorEl.textContent = msgErreurReseau(MSG.miniErreur);
      errorEl.classList.remove('d-none');
      btn.disabled = false;
      btn.innerHTML = 'Être contacté';
    }
  });

  document.addEventListener('input', function (e) {
    if (!e.target.classList.contains('cta-mini-contact')) return;
    e.target.classList.remove('is-invalid');
    const container = e.target.closest('[data-cta-persona]');
    if (!container) return;
    const errorEl = container.querySelector('.cta-mini-error');
    if (errorEl) { errorEl.classList.add('d-none'); errorEl.textContent = ''; }
  });

  // ── Formulaire complet Direction ──────────────────────────────────────────

  const btnSend   = document.getElementById('btnCtaSend');
  const formEl    = document.getElementById('ctaForm');
  const successEl = document.getElementById('ctaSuccess');
  const errorEl   = document.getElementById('ctaError');

  const CHAMPS_DIRECTION = ['ctaNom', 'ctaPrenom', 'ctaEtablissement', 'ctaFonction', 'ctaContact'];

  function resetInvalid() {
    CHAMPS_DIRECTION.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
    });
    if (errorEl) { errorEl.classList.add('d-none'); errorEl.textContent = ''; }
  }

  function setLoading(loading) {
    if (!btnSend) return;
    btnSend.disabled = loading;
    btnSend.innerHTML = loading
      ? '<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours…'
      : '<i class="bi bi-send me-2"></i>Envoyer ma demande';
  }

  async function handleDirectionSend() {
    resetInvalid();

    if (honeypotDeclenche()) return;

    if (tropRapide()) {
      errorEl.textContent = MSG.patiente;
      errorEl.classList.remove('d-none');
      return;
    }

    const vals = {};
    let premierInvalide = null;
    CHAMPS_DIRECTION.forEach(id => {
      const el = document.getElementById(id);
      const v = el ? el.value.trim() : '';
      vals[id] = v;
      if (!v && el) {
        el.classList.add('is-invalid');
        if (!premierInvalide) premierInvalide = el;
      }
    });

    if (premierInvalide) {
      errorEl.textContent = MSG.dirManquant;
      errorEl.classList.remove('d-none');
      premierInvalide.focus();
      return;
    }

    setLoading(true);

    try {
      const lignes = [
        'Demande accès / démo — direction',
        'Nom : ' + vals.ctaNom + ' ' + vals.ctaPrenom,
        'Établissement : ' + vals.ctaEtablissement,
        'Fonction : ' + vals.ctaFonction,
        'Contact : ' + vals.ctaContact,
      ];
      const message = document.getElementById('ctaMessage').value.trim();
      if (message) lignes.push('Message : ' + message);

      await insererSignalement(lignes.join('\n'));

      formEl.classList.add('d-none');
      successEl.classList.remove('d-none');

    } catch (err) {
      console.error('[audiences-cta] direction :', err);
      errorEl.textContent = msgErreurReseau(MSG.dirErreur);
      errorEl.classList.remove('d-none');
    } finally {
      setLoading(false);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (btnSend) btnSend.addEventListener('click', handleDirectionSend);

    CHAMPS_DIRECTION.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { el.classList.remove('is-invalid'); });
    });
  });

})();
