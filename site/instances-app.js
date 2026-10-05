/**
 * FILE     : instances-app.js v2.0.0
 * MODULE   : site/
 * DATE     : 2026-04-26
 * AUTEUR   : Manu + Claude
 * SESSION  : #108
 * DESC     : Hydratation des compteurs publics depuis la RPC site_instance_stats.
 *            Page publique (sans bdb-shell) — utilise window.bdb (mode anon).
 *            Échec silencieux : les valeurs par défaut "—" du HTML restent affichées.
 */

(function () {
  'use strict';

  function fmt(n) {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  function fmtDate(d) {
    if (!d) return '—';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    try {
      if (!window.bdb) return;
      var res = await window.bdb.rpc('site_instance_stats');
      if (res.error) throw res.error;
      var data = res.data;
      if (!data) return;

      setText('stat-protocoles',      fmt(data.protocoles));
      setText('stat-protocoles-2',    fmt(data.protocoles));
      setText('stat-glossaire',       fmt(data.glossaire));
      setText('stat-glossaire-2',     fmt(data.glossaire));
      setText('stat-materiel',        fmt(data.materiel));
      setText('stat-interventions',   fmt(data.interventions));
      setText('stat-interventions-2', fmt(data.interventions));
      setText('stat-fiches',          fmt(data.fiches_papier));
      setText('stat-ccam',            fmt(data.ccam_lies));
      setText('stat-maj',             fmtDate(data.maj));
    } catch (_) {
      /* Silencieux : valeurs "—" du HTML restent affichées */
    }
  });

}());
