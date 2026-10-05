// =====================================================
// EXPORT CONTROLLER V2.0.0
// V2 : Supabase — bdbShellReady — 3 états — zéro console.error
// Dépendances : window.bdb, PlanningEngine, PlanningExport
// =====================================================

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }


  function toast(msg, kind) {
    const el = $('toastInfo');
    if (!el) return;
    const header = el.querySelector('.toast-header');
    const body   = el.querySelector('.toast-body');
    if (body) body.textContent = String(msg ?? '');
    if (header) {
      header.classList.remove('text-danger','text-success','text-warning');
      if (kind === 'danger')  header.classList.add('text-danger');
      if (kind === 'success') header.classList.add('text-success');
      if (kind === 'warning') header.classList.add('text-warning');
    }
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  // ------------------------------------------------------------------
  // Diagnostics — Liste les semaines en base (remplace listKeys localStorage)
  // ------------------------------------------------------------------

  async function listWeeks() {
    try {
      const weeks = await PlanningEngine.listWeeks();
      const out   = $('diagOut');
      if (!out) return;
      if (!weeks.length) {
        out.textContent = 'Aucune semaine en base.';
        return;
      }
      const lines = ['Semaines en base : ' + weeks.length, ''];
      for (const w of weeks) {
        lines.push(
          w.annee + '_' + String(w.semaine).padStart(2, '0') +
          '_planning_week — ' + w.statut
        );
      }
      out.textContent = lines.join('\n');
    } catch (err) {
      toast(err?.message || 'Erreur', 'danger');
    }
  }

  // ------------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', async () => {

    await window.bdbShellReady;

    // Export semaine CSV
    $('btnExportWeekCSV')?.addEventListener('click', async () => {
      try {
        const semaine = Number($('weekInput')?.value || 0);
        const annee   = Number($('yearInput')?.value  || 0);
        await PlanningExport.exportWeekCSV(semaine, annee);
        toast('Export CSV effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export CSV', 'danger'); }
    });

    // Export semaine JSON
    $('btnExportWeekJSON')?.addEventListener('click', async () => {
      try {
        const semaine = Number($('weekInput')?.value || 0);
        const annee   = Number($('yearInput')?.value  || 0);
        await PlanningExport.exportWeekJSON(semaine, annee);
        toast('Export JSON effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export JSON', 'danger'); }
    });

    // Export pack complet
    $('btnExportAllPack')?.addEventListener('click', async () => {
      try {
        await PlanningExport.exportAllPack();
        toast('Export pack effectué', 'success');
      } catch (err) { toast(err?.message || 'Erreur export pack', 'danger'); }
    });

    // Lister semaines
    $('btnListKeys')?.addEventListener('click', () => {
      listWeeks().catch(err => toast(err?.message || 'Erreur', 'danger'));
    });

    // Chargement initial
    await listWeeks();

  });

})();
