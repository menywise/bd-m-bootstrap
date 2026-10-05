/**
 * bdb-password-policy.js — Politique de mot de passe BDB
 * 
 * Usage :
 *   import via <script src="../../js/bdb-password-policy.js"></script>
 *   AVANT le script du module (login.js, reset-password.js)
 * 
 * API exposée sur window :
 *   window.bdbPasswordPolicy.validate(password)  → { valid, rules[] }
 *   window.bdbPasswordPolicy.renderFeedback(containerEl, password)
 *   window.bdbPasswordPolicy.isWeakPasswordError(error) → boolean
 * 
 * Référence : R3-AUTH-01 durcie — JOURNAL_DECISIONS
 */
(function () {
  'use strict';

  /* ── Règles ── */
  const RULES = [
    { key: 'length',    label: '8 caractères minimum',       test: (p) => p.length >= 8 },
    { key: 'uppercase', label: '1 lettre majuscule',         test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: '1 lettre minuscule',         test: (p) => /[a-z]/.test(p) },
    { key: 'digit',     label: '1 chiffre',                  test: (p) => /\d/.test(p) },
    { key: 'special',   label: '1 caractère spécial',        test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(p) }
  ];

  /**
   * Valide un mot de passe contre la politique BDB.
   * @param {string} password
   * @returns {{ valid: boolean, rules: Array<{ key: string, label: string, passed: boolean }> }}
   */
  function validate(password) {
    const pwd = password || '';
    const results = RULES.map(function (r) {
      return { key: r.key, label: r.label, passed: r.test(pwd) };
    });
    return {
      valid: results.every(function (r) { return r.passed; }),
      rules: results
    };
  }

  /**
   * Rendu visuel du feedback dans un conteneur Bootstrap.
   * Crée ou met à jour la checklist dans containerEl.
   * @param {HTMLElement} containerEl — div cible (ex: #passwordFeedback)
   * @param {string} password
   */
  function renderFeedback(containerEl, password) {
    if (!containerEl) return;
    var result = validate(password);

    var html = '<div class="small mt-2">';
    html += '<div class="fw-semibold mb-1 text-body-secondary">Exigences du mot de passe :</div>';
    result.rules.forEach(function (r) {
      var icon = r.passed ? 'bi-check-circle-fill' : 'bi-x-circle';
      var cls  = r.passed ? 'text-success' : 'text-danger';
      html += '<div class="' + cls + '">';
      html += '<i class="bi ' + icon + ' me-1"></i>';
      html += r.label;
      html += '</div>';
    });
    html += '</div>';

    containerEl.innerHTML = html;
  }

  /**
   * Détecte si une erreur Supabase est un WeakPasswordError.
   * Compatible SDK v2 : error.code === 'weak_password'
   * ou message contient 'weak' + 'password'.
   * @param {object} error — objet erreur Supabase Auth
   * @returns {boolean}
   */
  function isWeakPasswordError(error) {
    if (!error) return false;
    if (error.code === 'weak_password') return true;
    var msg = (error.message || '').toLowerCase();
    return msg.indexOf('weak') !== -1 && msg.indexOf('password') !== -1;
  }

  /* ── Exposition globale ── */
  window.bdbPasswordPolicy = {
    validate: validate,
    renderFeedback: renderFeedback,
    isWeakPasswordError: isWeakPasswordError
  };
})();
