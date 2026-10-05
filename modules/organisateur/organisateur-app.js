/**
 * organisateur-app.js — v3.4.0
 * MODULE : ORGANISATEUR — Parcours Patient
 * Date : 2026-04-06 — Session #43
 *
 * Fix v3.4.0 :
 *   - Flèches ↑↓ disponibles en mode mémoriser pour tous les utilisateurs
 *   - actionsMemoriser = boutons de réordonnement etapesMelangees
 *   - Marque org-user-moved appliquée lors du réordonnement par flèches
 */

(() => {
  'use strict';

  const DB = window.bdb;
  if (!DB) { console.error('[organisateur] window.bdb absent'); return; }

  // ── État ─────────────────────────────────────────────────
  let tousLesParcours   = [];
  let parcoursActif     = null;
  let etapes            = [];
  let isAdmin           = false;
  let draggedIndex      = null;
  let touchStartY       = 0;
  let touchElement      = null;
  let modifCount        = 0;
  let masquesUser       = new Set();

  let modeMemoriser     = false;
  let etapesMelangees   = [];
  let etapesBouge       = new Set();
  let correctionEnCours = false;

  // ── Refs DOM ─────────────────────────────────────────────
  let listEl, badgeTotal, badgeModifs, toastInst, modalEditInst;


  // ── États async DOM ──────────────────────────────────────
  function setEtat(etat, msg) {
    document.getElementById('stateLoading')?.classList.toggle('d-none', etat !== 'loading');
    document.getElementById('stateEmpty')?.classList.toggle('d-none',   etat !== 'empty');
    document.getElementById('stateError')?.classList.toggle('d-none',   etat !== 'error');
    document.getElementById('stateContent')?.classList.toggle('d-none', etat !== 'ok');
    if (etat === 'error' && msg) {
      const el = document.getElementById('stateErrorMsg');
      if (el) el.textContent = msg;
    }
  }

  function showToast(msg) {
    const el = document.getElementById('toastMsg');
    if (el) el.textContent = msg;
    toastInst?.show();
  }

  function markModif() {
    modifCount++;
    badgeModifs.textContent = modifCount + ' modif.';
    badgeModifs.classList.remove('d-none');
  }

  // ── Flash éphémère (mode directif) ───────────────────────
  function flashEphemere(el) {
    if (!el || modeMemoriser) return;
    el.classList.remove('org-just-moved');
    void el.offsetWidth;
    el.classList.add('org-just-moved');
    el.addEventListener('animationend', () => el.classList.remove('org-just-moved'), { once: true });
  }

  // ── Marquer une étape "bougée" en mode mémoriser ─────────
  function marquerBouge(etape, etapeVoisine) {
    etapesBouge.add(etape.id);
    if (etapeVoisine) etapesBouge.add(etapeVoisine.id);
  }

  // ── Chargement liste parcours ─────────────────────────────
  async function chargerListeParcours() {
    if (window.bdbIsDemo && window.bdbIsDemo()) {
      const { data } = await window.bdb.from('demo_organisateur').select('*');
      tousLesParcours = (data || []).map(p => ({ id: p.id, titre: p.titre, type: p.type, parent_id: null }));
      construireSelectorParcours();
      return;
    }
    const { data, error } = await DB
      .from('organisateur_parcours')
      .select('id, titre, type, parent_id')
      .eq('statut', 'valide')
      .order('type')
      .order('titre');

    if (error) { console.error('[organisateur] chargerListeParcours:', error); return; }
    tousLesParcours = data || [];
    construireSelectorParcours();
  }

  function construireSelectorParcours() {
    const menu = document.getElementById('parcoursDropdownMenu');
    if (!menu) return;
    menu.innerHTML = '';

    const base      = tousLesParcours.filter(p => p.type === 'base');
    const variantes = tousLesParcours.filter(p => p.type === 'variante');

    if (base.length) {
      menu.appendChild(creerHeader('Parcours de base'));
      base.forEach(p => menu.appendChild(creerItemParcours(p)));
    }
    if (variantes.length) {
      const div = document.createElement('li');
      div.innerHTML = `<hr class="dropdown-divider">`;
      menu.appendChild(div);
      menu.appendChild(creerHeader('Variantes'));
      variantes.forEach(p => menu.appendChild(creerItemParcours(p)));
    }

    if (base.length && !parcoursActif) selectionnerParcours(base[0]);
  }

  function creerHeader(texte) {
    const li = document.createElement('li');
    li.innerHTML = `<h6 class="dropdown-header">${escHtml(texte)}</h6>`;
    return li;
  }

  function creerItemParcours(p) {
    const li    = document.createElement('li');
    const actif = parcoursActif?.id === p.id;
    const icone = p.type === 'base' ? 'bi-diagram-3' : 'bi-git';
    li.innerHTML = `
      <button class="dropdown-item d-flex align-items-center gap-2${actif ? ' active' : ''}"
              data-parcours-id="${escHtml(p.id)}">
        <i class="bi ${icone} text-muted"></i>
        ${escHtml(p.titre)}
        ${actif ? '<i class="bi bi-check ms-auto text-success"></i>' : ''}
      </button>`;
    li.querySelector('button').addEventListener('click', () => selectionnerParcours(p));
    return li;
  }

  async function selectionnerParcours(p) {
    if (parcoursActif?.id === p.id) return;
    parcoursActif = p;

    const label = document.getElementById('parcoursBtnLabel');
    if (label) label.textContent = p.titre;

    const badge = document.getElementById('parcoursBadgeType');
    if (badge) {
      badge.textContent = p.type === 'base' ? 'Base' : 'Variante';
      badge.className   = `badge ms-2 ${p.type === 'base' ? 'bg-primary' : 'bg-secondary'}`;
    }

    construireSelectorParcours();
    if (modeMemoriser) desactiverMemoriser();
    await chargerEtapes(p.id);
  }

  // ── Chargement étapes ─────────────────────────────────────
  async function chargerEtapes(id) {
    setEtat('loading');
    modifCount = 0;
    badgeModifs.classList.add('d-none');

    if (!isAdmin) {
      const { data: masques } = await DB
        .from('organisateur_masques_user')
        .select('etape_id');
      masquesUser = new Set((masques || []).map(m => m.etape_id));
    }

    let query = DB
      .from('organisateur_etapes')
      .select('id, titre, description, timing_label, ordre, visible, is_delta, created_by')
      .eq('parcours_id', id)
      .order('ordre');

    if (!isAdmin) query = query.eq('visible', true);

    const { data: rows, error } = await query;
    if (error) { setEtat('error', error.message); return; }

    etapes = isAdmin
      ? (rows || [])
      : (rows || []).filter(e => !masquesUser.has(e.id));

    if (etapes.length === 0) { setEtat('empty'); return; }
    setEtat('ok');
    render();
  }

  // ── Render ────────────────────────────────────────────────
  function render() {
    listEl.innerHTML = '';
    const source = modeMemoriser ? etapesMelangees : etapes;

    source.forEach((etape, index) => {
      const item = document.createElement('div');
      let classes = 'phase-item card shadow-sm p-3 d-flex flex-row align-items-center gap-3';
      if (!etape.visible && isAdmin && !modeMemoriser) classes += ' opacity-50';
      if (modeMemoriser) classes += etapesBouge.has(etape.id) ? ' org-user-moved' : ' org-shuffle-item';
      item.className = classes;

      const dragActif = (isAdmin && !modeMemoriser) || (modeMemoriser && !correctionEnCours);
      if (dragActif) { item.draggable = true; item.dataset.index = index; }

      const badgeMasquee = (!etape.visible && isAdmin && !modeMemoriser)
        ? `<span class="badge bg-secondary ms-2 fs-xsmall">masquée</span>` : '';
      const badgePerso = (etape.created_by && !isAdmin)
        ? `<span class="badge bg-info text-dark ms-2 fs-xsmall">ma note</span>` : '';
      const badgeDelta = (etape.is_delta && isAdmin && !modeMemoriser)
        ? `<span class="badge bg-warning text-dark ms-2 fs-xsmall">delta</span>` : '';

      const grip = dragActif
        ? `<i class="bi bi-grip-vertical org-grip" title="Glisser pour réordonner"></i>` : '';

      const timingHtml = etape.timing_label
        ? `<span class="badge bg-light text-dark border me-1">${escHtml(etape.timing_label)}</span>` : '';

      // ── Boutons mode directif (admin) ──
      const actionsAdmin = (isAdmin && !modeMemoriser) ? `
        <button class="btn btn-outline-secondary btn-sm btn-toggle-vis"
                title="${etape.visible ? 'Masquer' : 'Afficher'}">
          <i class="bi bi-eye${etape.visible ? '' : '-slash'}"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-up" title="Monter">
          <i class="bi bi-chevron-up"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-down" title="Descendre">
          <i class="bi bi-chevron-down"></i>
        </button>
        <button class="btn btn-outline-primary btn-sm btn-edit" title="Modifier">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm btn-del" title="Supprimer définitivement">
          <i class="bi bi-trash"></i>
        </button>
      ` : '';

      // ── Boutons mode mémoriser — flèches ↑↓ pour tous ──
      const actionsMemoriser = (modeMemoriser && !correctionEnCours) ? `
        <button class="btn btn-outline-secondary btn-sm btn-memo-up" title="Monter">
          <i class="bi bi-chevron-up"></i>
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-memo-down" title="Descendre">
          <i class="bi bi-chevron-down"></i>
        </button>
      ` : '';

      // ── Boutons membre (lecture) ──
      const actionsMembre = (!isAdmin && etape.created_by && !modeMemoriser) ? `
        <button class="btn btn-outline-success btn-sm btn-proposer" title="Proposer à l'équipe">
          <i class="bi bi-send"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm btn-del-perso" title="Supprimer ma note">
          <i class="bi bi-trash"></i>
        </button>
      ` : '';

      const actionsMasquer = (!isAdmin && !etape.created_by && !modeMemoriser) ? `
        <button class="btn btn-outline-secondary btn-sm btn-masquer" title="Masquer de ma vue">
          <i class="bi bi-eye-slash"></i>
        </button>
      ` : '';

      item.innerHTML = `
        ${grip}
        <span class="phase-num">${String(index + 1).padStart(2, '0')}</span>
        <div class="flex-grow-1">
          <div class="fw-semibold">${escHtml(etape.titre)}${badgeMasquee}${badgePerso}${badgeDelta}</div>
          <small class="text-muted">${timingHtml}${escHtml(etape.description || '')}</small>
        </div>
        <div class="d-flex gap-1 flex-wrap">
          ${actionsAdmin}${actionsMemoriser}${actionsMembre}${actionsMasquer}
        </div>
      `;

      // ── Listeners mode directif (admin) ──
      if (isAdmin && !modeMemoriser) {
        item.addEventListener('dragstart', () => { draggedIndex = index; item.classList.add('dragging'); });
        item.addEventListener('dragend',   () => item.classList.remove('dragging'));
        item.addEventListener('dragover',  e => e.preventDefault());
        item.addEventListener('drop', async e => {
          e.preventDefault();
          if (draggedIndex !== null && draggedIndex !== index) {
            const [moved] = etapes.splice(draggedIndex, 1);
            etapes.splice(index, 0, moved);
            markModif(); render();
            flashEphemere(listEl.querySelectorAll('.phase-item')[index]);
            await sauvegarderOrdre();
          }
          draggedIndex = null;
        });
        item.addEventListener('touchstart', handleTouchStart, { passive: true });
        item.addEventListener('touchmove',  handleTouchMove,  { passive: false });
        item.addEventListener('touchend',   handleTouchEnd);

        item.querySelector('.btn-toggle-vis')?.addEventListener('click', () => toggleVisible(index, etape));
        item.querySelector('.btn-up')?.addEventListener('click', async () => {
          if (index === 0) return;
          [etapes[index], etapes[index-1]] = [etapes[index-1], etapes[index]];
          markModif(); render();
          flashEphemere(listEl.querySelectorAll('.phase-item')[index-1]);
          await sauvegarderOrdre();
        });
        item.querySelector('.btn-down')?.addEventListener('click', async () => {
          if (index === etapes.length - 1) return;
          [etapes[index], etapes[index+1]] = [etapes[index+1], etapes[index]];
          markModif(); render();
          flashEphemere(listEl.querySelectorAll('.phase-item')[index+1]);
          await sauvegarderOrdre();
        });
        item.querySelector('.btn-edit')?.addEventListener('click', () => {
          document.getElementById('editId').value     = etape.id;
          document.getElementById('editTitle').value  = etape.titre;
          document.getElementById('editDesc').value   = etape.description || '';
          document.getElementById('editTiming').value = etape.timing_label || '';
          modalEditInst.show();
        });
        item.querySelector('.btn-del')?.addEventListener('click', () => supprimerAdmin(etape));
      }

      // ── Listeners mode mémoriser ──
      if (modeMemoriser && !correctionEnCours) {
        // Drag & drop
        item.addEventListener('dragstart', () => { draggedIndex = index; item.classList.add('dragging'); });
        item.addEventListener('dragend',   () => item.classList.remove('dragging'));
        item.addEventListener('dragover',  e => e.preventDefault());
        item.addEventListener('drop', e => {
          e.preventDefault();
          if (draggedIndex !== null && draggedIndex !== index) {
            const voisine = etapesMelangees[index];
            const [moved] = etapesMelangees.splice(draggedIndex, 1);
            etapesMelangees.splice(index, 0, moved);
            marquerBouge(moved, voisine);
            render();
          }
          draggedIndex = null;
        });

        // Flèches ↑↓ — disponibles pour tous en mode mémoriser
        item.querySelector('.btn-memo-up')?.addEventListener('click', () => {
          if (index === 0) return;
          const voisine = etapesMelangees[index - 1];
          [etapesMelangees[index], etapesMelangees[index-1]] = [etapesMelangees[index-1], etapesMelangees[index]];
          marquerBouge(etape, voisine);
          render();
        });
        item.querySelector('.btn-memo-down')?.addEventListener('click', () => {
          if (index === etapesMelangees.length - 1) return;
          const voisine = etapesMelangees[index + 1];
          [etapesMelangees[index], etapesMelangees[index+1]] = [etapesMelangees[index+1], etapesMelangees[index]];
          marquerBouge(etape, voisine);
          render();
        });

        // Touch
        item.addEventListener('touchstart', handleTouchStartMemo, { passive: true });
        item.addEventListener('touchmove',  handleTouchMove,       { passive: false });
        item.addEventListener('touchend',   handleTouchEndMemo);
      }

      // ── Listeners membre ──
      item.querySelector('.btn-masquer')?.addEventListener('click',   () => masquerEtape(etape.id));
      item.querySelector('.btn-del-perso')?.addEventListener('click', () => supprimerPerso(etape));
      item.querySelector('.btn-proposer')?.addEventListener('click',  () => proposerEquipe(etape));

      listEl.appendChild(item);
    });

    badgeTotal.textContent = (modeMemoriser ? etapesMelangees : etapes).length + ' étapes';
  }

  // ── CRUD Supabase ─────────────────────────────────────────

  async function sauvegarderOrdre() {
    const updates = etapes.map((e, i) =>
      DB.from('organisateur_etapes').update({ ordre: i }).eq('id', e.id).select('id')
    );
    const echec = (await Promise.all(updates)).find(r => r.error);
    if (echec) { console.error('[organisateur] ordre:', echec.error); showToast('Erreur sauvegarde ordre'); }
  }

  async function toggleVisible(index, etape) {
    const { error } = await DB.from('organisateur_etapes')
      .update({ visible: !etape.visible }).eq('id', etape.id).select('id');
    if (error) { console.error(error); showToast('Erreur'); return; }
    etapes[index].visible = !etape.visible;
    markModif(); render();
    showToast(etapes[index].visible ? 'Étape visible' : 'Étape masquée');
  }

  async function ajouterEtape(titre, description, timing_label) {
    if (!parcoursActif) return;
    const { data, error } = await DB.from('organisateur_etapes')
      .insert({
        parcours_id: parcoursActif.id, titre,
        description: description || null, timing_label: timing_label || null,
        ordre: etapes.length, visible: true,
        is_delta: !isAdmin,
        created_by: isAdmin ? null : (window.bdbUser?.id || null)
      })
      .select('id, titre, description, timing_label, ordre, visible, is_delta, created_by')
      .single();
    if (error) { console.error(error); showToast('Erreur ajout'); return; }
    etapes.push(data);
    markModif(); render();
    flashEphemere(listEl.querySelectorAll('.phase-item')[listEl.querySelectorAll('.phase-item').length - 1]);
    showToast('Étape ajoutée');
  }

  async function modifierEtape(id, titre, description, timing_label) {
    const { error } = await DB.from('organisateur_etapes')
      .update({ titre, description: description || null, timing_label: timing_label || null })
      .eq('id', id).select('id');
    if (error) { console.error(error); showToast('Erreur modification'); return; }
    const idx = etapes.findIndex(e => e.id === id);
    if (idx >= 0) { etapes[idx].titre = titre; etapes[idx].description = description; etapes[idx].timing_label = timing_label; }
    markModif(); render(); showToast('Étape modifiée');
  }

  async function supprimerAdmin(etape) {
    if (!confirm(`Retirer "${etape.titre}" définitivement ? Cette action concerne tous les utilisateurs et ne peut pas être annulée.`)) return;
    if (!confirm(`Retirer "${etape.titre}" — confirmer ?`)) return;
    const { error } = await DB.from('organisateur_etapes').delete().eq('id', etape.id).select('id');
    if (error) { console.error(error); showToast('Erreur suppression'); return; }
    etapes = etapes.filter(e => e.id !== etape.id);
    markModif(); render(); await sauvegarderOrdre();
    showToast('Étape supprimée');
  }

  async function supprimerPerso(etape) {
    if (!confirm(`Retirer ta note "${etape.titre}" définitivement ?`)) return;
    const { error } = await DB.from('organisateur_etapes').delete()
      .eq('id', etape.id).eq('created_by', window.bdbUser?.id).select('id');
    if (error) { console.error(error); showToast('Erreur'); return; }
    etapes = etapes.filter(e => e.id !== etape.id);
    markModif(); render(); showToast('Note supprimée');
  }

  async function masquerEtape(etapeId) {
    const { error } = await DB.from('organisateur_masques_user')
      .insert({ user_id: window.bdbUser?.id, etape_id: etapeId }).select('id');
    if (error) { console.error(error); showToast('Erreur masquage'); return; }
    masquesUser.add(etapeId);
    etapes = etapes.filter(e => e.id !== etapeId);
    render(); showToast('Étape masquée');
  }

  async function proposerEquipe(etape) {
    const { error } = await DB.from('collab_ideas').insert({
      project_id:    'bdb10700-0000-0000-0000-000000000001',
      content:       `Proposition : ${etape.titre}${etape.description ? '\n\n' + etape.description : ''}`,
      source_module: 'organisateur',
      source_ref:    etape.id,
      created_by:    window.bdbUser?.id
    }).select('id');
    if (error) { console.error(error); showToast('Erreur envoi'); return; }
    showToast('Proposition envoyée à l\'équipe ✓');
  }

  // ── Touch directif ────────────────────────────────────────
  function handleTouchStart(e)  { touchElement = this; touchStartY = e.touches[0].clientY; this.classList.add('dragging'); }
  function handleTouchMove(e)   { if (!touchElement) return; e.preventDefault(); touchElement.style.transform = `translateY(${e.touches[0].clientY - touchStartY}px)`; }
  function handleTouchEnd(e) {
    if (!touchElement) return;
    touchElement.classList.remove('dragging'); touchElement.style.transform = '';
    const steps = Math.round((e.changedTouches[0].clientY - touchStartY) / (touchElement.offsetHeight + 10));
    if (steps !== 0) {
      const cur = parseInt(touchElement.dataset.index);
      const nxt = Math.max(0, Math.min(etapes.length - 1, cur + steps));
      if (nxt !== cur) {
        const [m] = etapes.splice(cur, 1); etapes.splice(nxt, 0, m);
        markModif(); render(); flashEphemere(listEl.querySelectorAll('.phase-item')[nxt]); sauvegarderOrdre();
      }
    }
    touchElement = null;
  }

  // ── Touch mémoriser ───────────────────────────────────────
  function handleTouchStartMemo(e) { touchElement = this; touchStartY = e.touches[0].clientY; this.classList.add('dragging'); }
  function handleTouchEndMemo(e) {
    if (!touchElement) return;
    touchElement.classList.remove('dragging'); touchElement.style.transform = '';
    const steps = Math.round((e.changedTouches[0].clientY - touchStartY) / (touchElement.offsetHeight + 10));
    if (steps !== 0) {
      const cur = parseInt(touchElement.dataset.index);
      const nxt = Math.max(0, Math.min(etapesMelangees.length - 1, cur + steps));
      if (nxt !== cur) {
        const voisine = etapesMelangees[nxt];
        const [m] = etapesMelangees.splice(cur, 1); etapesMelangees.splice(nxt, 0, m);
        marquerBouge(m, voisine); render();
      }
    }
    touchElement = null;
  }

  // ── Mode Mémoriser ────────────────────────────────────────
  function activerMemoriser() {
    modeMemoriser = true; correctionEnCours = false;
    etapesMelangees = [...etapes].sort(() => Math.random() - 0.5);
    etapesBouge = new Set();
    document.getElementById('btnMemoriser').innerHTML = '<i class="bi bi-x-circle me-1"></i>Quitter';
    document.getElementById('org-memorise-banner')?.classList.add('active');
    document.getElementById('btnVoirSolution')?.classList.remove('d-none');
    document.getElementById('org-score-banner')?.classList.remove('active');
    document.querySelectorAll('.btn-admin-only').forEach(b => b.classList.add('d-none'));
    document.getElementById('btnToggleAdd')?.classList.add('d-none');
    document.getElementById('parcoursSelectorWrapper')?.classList.add('d-none');
    render();
  }

  function desactiverMemoriser() {
    modeMemoriser = false; correctionEnCours = false;
    etapesMelangees = []; etapesBouge = new Set();
    document.getElementById('btnMemoriser').innerHTML = '<i class="bi bi-shuffle me-1"></i>Mémoriser l\'ordre';
    document.getElementById('org-memorise-banner')?.classList.remove('active');
    document.getElementById('btnVoirSolution')?.classList.add('d-none');
    document.getElementById('org-score-banner')?.classList.remove('active');
    if (isAdmin) document.querySelectorAll('.btn-admin-only').forEach(b => b.classList.remove('d-none'));
    document.getElementById('btnToggleAdd')?.classList.remove('d-none');
    document.getElementById('parcoursSelectorWrapper')?.classList.remove('d-none');
    render();
  }

  // ── Correction séquentielle ───────────────────────────────
  function voirSolution() {
    if (correctionEnCours) return;
    correctionEnCours = true;
    render();

    const total = etapesMelangees.length;
    let score   = 0;
    const DELAI = 400;

    etapesMelangees.forEach((etape, posActuelle) => {
      const posCorrecte = etapes.findIndex(e => e.id === etape.id);
      const correct     = posActuelle === posCorrecte;
      if (correct) score++;

      setTimeout(() => {
        const item = listEl.querySelectorAll('.phase-item')[posActuelle];
        if (!item) return;
        item.classList.remove('org-shuffle-item', 'org-user-moved');
        item.classList.add(correct ? 'org-correct' : 'org-wrong');

        const numEl = item.querySelector('.phase-num');
        if (numEl) { numEl.style.visibility = 'visible'; numEl.textContent = String(posCorrecte + 1).padStart(2, '0'); }

        if (!correct) {
          const hint = document.createElement('div');
          hint.className = 'org-hint-position';
          hint.innerHTML = `<i class="bi bi-arrow-right me-1"></i>Position correcte : <strong>${String(posCorrecte + 1).padStart(2, '0')}</strong>`;
          item.querySelector('.flex-grow-1')?.appendChild(hint);
        }
      }, posActuelle * DELAI);
    });

    setTimeout(() => {
      const banner = document.getElementById('org-score-banner');
      if (!banner) return;
      const pct    = Math.round((score / total) * 100);
      const niveau = pct === 100 ? 'success' : pct >= 70 ? 'warning' : 'danger';
      const msg    = pct === 100 ? '🎉 Parcours parfait !' : pct >= 70 ? 'Bon travail — quelques étapes à revoir' : 'Continue à t\'entraîner !';
      banner.className = `org-score-banner active alert alert-${niveau}`;
      banner.innerHTML = `
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <strong class="fs-5">${score} / ${total} étapes bien placées</strong>
            <div class="small mt-1">${msg}</div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" id="btnRecommencer">
              <i class="bi bi-arrow-repeat me-1"></i>Recommencer
            </button>
            <button class="btn btn-sm btn-secondary" id="btnQuitterMemo">
              <i class="bi bi-x-circle me-1"></i>Quitter
            </button>
          </div>
        </div>`;
      document.getElementById('btnRecommencer')?.addEventListener('click', () => { desactiverMemoriser(); activerMemoriser(); });
      document.getElementById('btnQuitterMemo')?.addEventListener('click', desactiverMemoriser);
      document.getElementById('btnVoirSolution')?.classList.add('d-none');
    }, total * DELAI + 500);
  }

  // ── Export ────────────────────────────────────────────────
  function exportJSON() {
    const data = { version: '3.4.0', parcours: parcoursActif?.titre, date_export: new Date().toISOString(),
      total_etapes: etapes.length, etapes: etapes.map((e, i) => ({ ordre: i, titre: e.titre, description: e.description, timing_label: e.timing_label })) };
    document.getElementById('exportContent').value = JSON.stringify(data, null, 2);
    document.getElementById('exportBox').classList.add('active');
  }

  function exportMD() {
    let md = `# ${parcoursActif?.titre || 'PARCOURS PATIENT'} — Bible de Bloc\n\n`;
    md += `**Date export** : ${new Date().toLocaleDateString('fr-FR')} · **Total** : ${etapes.length} étapes\n\n---\n\n`;
    etapes.forEach((e, i) => {
      md += `## ${String(i+1).padStart(2,'0')}. ${e.titre}\n\n`;
      if (e.timing_label) md += `**Timing** : ${e.timing_label}\n\n`;
      if (e.description)  md += `${e.description}\n\n`;
      md += `---\n\n`;
    });
    document.getElementById('exportContent').value = md;
    document.getElementById('exportBox').classList.add('active');
  }

  // ── Init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    listEl        = document.getElementById('stateContent');
    badgeTotal    = document.getElementById('badgeTotal');
    badgeModifs   = document.getElementById('badgeModifs');
    toastInst     = new bootstrap.Toast(document.getElementById('toastInfo'));
    modalEditInst = new bootstrap.Modal(document.getElementById('modalEdit'));

    await new Promise(resolve => {
      if (window.bdbUser) { resolve(); return; }
      window.addEventListener('bdb:user-ready', resolve, { once: true });
      setTimeout(resolve, 3000);
    });

    isAdmin = window.bdbUser?.isAdmin === true;
    document.querySelectorAll('.btn-admin-only').forEach(b => b.classList.toggle('d-none', !isAdmin));

    await chargerListeParcours();

    document.getElementById('btnToggleAdd')?.addEventListener('click', () => {
      document.getElementById('addForm').classList.toggle('active');
      document.getElementById('newPhaseTitle').focus();
    });
    document.getElementById('btnCancelAdd')?.addEventListener('click', () =>
      document.getElementById('addForm').classList.remove('active'));
    document.getElementById('btnAddPhase')?.addEventListener('click', async () => {
      const titre  = document.getElementById('newPhaseTitle').value.trim();
      const desc   = document.getElementById('newPhaseDesc').value.trim();
      const timing = document.getElementById('newPhaseTiming').value.trim();
      if (!titre) { showToast('Le titre est obligatoire'); return; }
      await ajouterEtape(titre, desc, timing);
      ['newPhaseTitle','newPhaseDesc','newPhaseTiming'].forEach(id => { document.getElementById(id).value = ''; });
      document.getElementById('addForm').classList.remove('active');
    });

    document.getElementById('btnSaveEdit')?.addEventListener('click', async () => {
      const id     = document.getElementById('editId').value;
      const titre  = document.getElementById('editTitle').value.trim();
      const desc   = document.getElementById('editDesc').value.trim();
      const timing = document.getElementById('editTiming').value.trim();
      if (!titre) { showToast('Le titre est obligatoire'); return; }
      await modifierEtape(id, titre, desc, timing);
      modalEditInst.hide();
    });

    document.getElementById('btnMemoriser')?.addEventListener('click', () =>
      modeMemoriser ? desactiverMemoriser() : activerMemoriser());
    document.getElementById('btnVoirSolution')?.addEventListener('click', voirSolution);

    document.getElementById('btnExportJSON')?.addEventListener('click', exportJSON);
    document.getElementById('btnExportMD')?.addEventListener('click', exportMD);
    document.getElementById('btnCloseExport')?.addEventListener('click', () =>
      document.getElementById('exportBox').classList.remove('active'));
    document.getElementById('btnCopyExport')?.addEventListener('click', () => {
      const ta = document.getElementById('exportContent');
      ta.select();
      if (navigator.clipboard) { navigator.clipboard.writeText(ta.value).catch(() => document.execCommand('copy')); }
      else { document.execCommand('copy'); }
      showToast('Copié');
    });

    document.getElementById('fileImport')?.addEventListener('change', async e => {
      if (!isAdmin) { showToast('Import réservé à l\'administrateur'); return; }
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.etapes || !Array.isArray(data.etapes)) { showToast('Format JSON invalide'); return; }
          showToast('Import en cours…');
          for (const et of data.etapes) await ajouterEtape(et.titre, et.description, et.timing_label);
          showToast(`Import réussi — ${data.etapes.length} étapes`);
        } catch (err) { showToast('Erreur : ' + err.message); }
      };
      reader.readAsText(file); e.target.value = '';
    });

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
  });

})();
