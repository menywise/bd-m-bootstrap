/**
 * admin-bao.js — Administration catalogue BàO Dunod
 * Pattern BDB : admin standalone (ISO-01→05).
 * Chargé par admin-bao.html uniquement.
 *
 * Dépendances globales :
 *   window.bdb          — Supabase client
 *   window.bdbUser      — utilisateur courant
 *   window.bdbShellReady — Promise shell prêt
 *
 * Tables : bao_livres · bao_auteurs · bao_livre_auteur (lecture seule)
 * Approche A : auteurs_str (texte libre), N:M ignorée côté CRUD V1.
 */

const DB = window.bdb;

// ── Utilitaires ──────────────────────────────────────────────

const _escEl = document.createElement('span');
function escHtml(s) { _escEl.textContent = s ?? ''; return _escEl.innerHTML; }

function showState(prefix, state) {
  for (const s of ['Loading', 'Empty', 'Error', 'List', 'Content']) {
    const el = document.getElementById(prefix + s);
    if (el) el.classList.add('d-none');
  }
  const target = document.getElementById(prefix + state);
  if (target) target.classList.remove('d-none');
}

// ── État local ───────────────────────────────────────────────

let allLivres = [];
let allAuteurs = [];
let modalLivreInstance = null;
let modalAuteurInstance = null;

// ── LIVRES ───────────────────────────────────────────────────

async function loadLivres() {
  showState('livres', 'Loading');
  const { data, error } = await DB.from('bao_livres')
    .select('*')
    .order('rubrique', { ascending: true })
    .order('nom', { ascending: true });

  if (error) {
    showState('livres', 'Error');
    document.getElementById('livresError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    return;
  }
  if (!data?.length) { showState('livres', 'Empty'); return; }

  allLivres = data;
  document.getElementById('badgeLivres').textContent = data.length;
  populateRubriques(data);
  renderLivres(data);
  showState('livres', 'List');
}

function populateRubriques(livres) {
  const sel = document.getElementById('filterRubrique');
  const rubriques = [...new Set(livres.map(l => l.rubrique).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Toutes rubriques</option>' +
    rubriques.map(r => `<option value="${escHtml(r)}">${escHtml(r)}</option>`).join('');
}

function renderLivres(livres) {
  const body = document.getElementById('livresBody');
  body.innerHTML = livres.map(l => `
    <tr data-id="${l.id}">
      <td>
        <div class="fw-semibold">${escHtml(l.nom)}</div>
        ${l.titre ? `<small class="text-muted">${escHtml(l.titre)}</small>` : ''}
      </td>
      <td><span class="badge bg-light text-dark border">${escHtml(l.rubrique || '—')}</span></td>
      <td><small class="text-muted">${escHtml(l.auteurs_str || '—')}</small></td>
      <td class="text-center">${l.annee || '—'}</td>
      <td class="text-center">${l.has_sommaire ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-dash text-muted"></i>'}</td>
      <td>${renderEtat(l.etat)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-livre" title="Modifier">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-livre" title="Supprimer">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function renderEtat(etat) {
  const map = {
    a_acheter:  { cls: 'bg-warning-subtle text-warning-emphasis', label: 'À acheter' },
    commande:   { cls: 'bg-info-subtle text-info-emphasis', label: 'Commandé' },
    recu:       { cls: 'bg-primary-subtle text-primary-emphasis', label: 'Reçu' },
    lu:         { cls: 'bg-success-subtle text-success-emphasis', label: 'Lu' },
    indexe:     { cls: 'bg-dark-subtle text-dark-emphasis', label: 'Indexé' }
  };
  if (!etat) return '<span class="text-muted">—</span>';
  const m = map[etat] || { cls: 'bg-secondary-subtle text-secondary-emphasis', label: etat };
  return `<span class="badge ${m.cls}">${escHtml(m.label)}</span>`;
}

function filterLivres() {
  const q = document.getElementById('searchLivres').value.toLowerCase().trim();
  const rub = document.getElementById('filterRubrique').value;
  const filtered = allLivres.filter(l => {
    if (rub && l.rubrique !== rub) return false;
    if (!q) return true;
    return (l.nom || '').toLowerCase().includes(q) ||
           (l.titre || '').toLowerCase().includes(q) ||
           (l.auteurs_str || '').toLowerCase().includes(q) ||
           (l.isbn || '').toLowerCase().includes(q);
  });
  renderLivres(filtered);
}

// ── Modal livre ──────────────────────────────────────────────

function openLivreModal(livre) {
  document.getElementById('modalLivreTitle').textContent = livre ? 'Modifier le livre' : 'Ajouter un livre';
  document.getElementById('livreId').value = livre?.id || '';
  document.getElementById('livreNom').value = livre?.nom || '';
  document.getElementById('livreTitre').value = livre?.titre || '';
  document.getElementById('livreIsbn').value = livre?.isbn || '';
  document.getElementById('livreAnnee').value = livre?.annee || '';
  document.getElementById('livrePages').value = livre?.pages || '';
  document.getElementById('livreRubrique').value = livre?.rubrique || '';
  document.getElementById('livreEditeur').value = livre?.editeur || 'DUNOD';
  document.getElementById('livreAuteursStr').value = livre?.auteurs_str || '';
  document.getElementById('livreEtat').value = livre?.etat || '';
  document.getElementById('livreEtiquette').value = livre?.etiquette || '';
  document.getElementById('livrePrix').value = livre?.prix_achat || '';
  document.getElementById('livreAlerte').value = livre?.alerte || '';
  document.getElementById('livreCoverUrl').value = livre?.cover_url || '';
  document.getElementById('livreGoogleUrl').value = livre?.google_livre_url || '';
  document.getElementById('livreFeuilletageUrl').value = livre?.feuilletage_url || '';
  document.getElementById('livreZotero').value = livre?.zotero || '';
  document.getElementById('livreHasSommaire').checked = livre?.has_sommaire || false;
  document.getElementById('livreSommaireMd').value = livre?.sommaire_md || '';
  modalLivreInstance.show();
}

async function saveLivre() {
  const id = document.getElementById('livreId').value;
  const nom = document.getElementById('livreNom').value.trim();
  if (!nom) { bdbToast('Le nom est obligatoire.'); return; }

  const payload = {
    nom,
    titre: document.getElementById('livreTitre').value.trim() || null,
    isbn: document.getElementById('livreIsbn').value.trim() || null,
    annee: parseInt(document.getElementById('livreAnnee').value) || null,
    pages: parseInt(document.getElementById('livrePages').value) || null,
    rubrique: document.getElementById('livreRubrique').value.trim() || null,
    editeur: document.getElementById('livreEditeur').value.trim() || 'DUNOD',
    auteurs_str: document.getElementById('livreAuteursStr').value.trim() || null,
    etat: document.getElementById('livreEtat').value || null,
    etiquette: document.getElementById('livreEtiquette').value.trim() || null,
    prix_achat: parseFloat(document.getElementById('livrePrix').value) || null,
    alerte: document.getElementById('livreAlerte').value.trim() || null,
    cover_url: document.getElementById('livreCoverUrl').value.trim() || null,
    google_livre_url: document.getElementById('livreGoogleUrl').value.trim() || null,
    feuilletage_url: document.getElementById('livreFeuilletageUrl').value.trim() || null,
    zotero: document.getElementById('livreZotero').value.trim() || null,
    has_sommaire: document.getElementById('livreHasSommaire').checked,
    sommaire_md: document.getElementById('livreSommaireMd').value.trim() || null
  };

  let result;
  if (id) {
    payload.updated_at = new Date().toISOString();
    result = await DB.from('bao_livres').update(payload).eq('id', id).select();
  } else {
    result = await DB.from('bao_livres').insert(payload).select();
  }

  if (result.error) {
    bdbToast('Erreur : ' + result.error.message);
    return;
  }

  modalLivreInstance.hide();
  bdbToast(id ? 'Livre modifié.' : 'Livre ajouté.');
  await loadLivres();
}

async function deleteLivre(id) {
  if (!confirm('Supprimer ce livre et ses liaisons auteurs ?')) return;
  const { error } = await DB.from('bao_livres').delete().eq('id', id).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('Livre supprimé.');
  await loadLivres();
}

// ── AUTEURS ──────────────────────────────────────────────────

async function loadAuteurs() {
  showState('auteurs', 'Loading');
  const { data, error } = await DB.from('bao_auteurs')
    .select('*')
    .order('nom', { ascending: true });

  if (error) {
    showState('auteurs', 'Error');
    document.getElementById('auteursError').innerHTML =
      `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(error.message)}</div>`;
    return;
  }
  if (!data?.length) { showState('auteurs', 'Empty'); return; }

  allAuteurs = data;
  document.getElementById('badgeAuteurs').textContent = data.length;
  renderAuteurs(data);
  showState('auteurs', 'List');
}

function renderAuteurs(auteurs) {
  const q = (document.getElementById('searchAuteurs')?.value || '').toLowerCase().trim();
  const filtered = q ? auteurs.filter(a => a.nom.toLowerCase().includes(q)) : auteurs;
  document.getElementById('auteursBody').innerHTML = filtered.map(a => `
    <tr data-id="${a.id}">
      <td>${escHtml(a.nom)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-action="edit-auteur" title="Modifier">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-auteur" title="Supprimer">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openAuteurModal(auteur) {
  document.getElementById('modalAuteurTitle').textContent = auteur ? 'Modifier l\'auteur' : 'Ajouter un auteur';
  document.getElementById('auteurId').value = auteur?.id || '';
  document.getElementById('auteurNom').value = auteur?.nom || '';
  modalAuteurInstance.show();
}

async function saveAuteur() {
  const id = document.getElementById('auteurId').value;
  const nom = document.getElementById('auteurNom').value.trim();
  if (!nom) { bdbToast('Le nom est obligatoire.'); return; }

  let result;
  if (id) {
    result = await DB.from('bao_auteurs').update({ nom }).eq('id', id).select();
  } else {
    result = await DB.from('bao_auteurs').insert({ nom }).select();
  }

  if (result.error) {
    bdbToast('Erreur : ' + result.error.message);
    return;
  }

  modalAuteurInstance.hide();
  bdbToast(id ? 'Auteur modifié.' : 'Auteur ajouté.');
  await loadAuteurs();
}

async function deleteAuteur(id) {
  if (!confirm('Supprimer cet auteur ?')) return;
  const { error } = await DB.from('bao_auteurs').delete().eq('id', id).select();
  if (error) { bdbToast('Erreur : ' + error.message); return; }
  bdbToast('Auteur supprimé.');
  await loadAuteurs();
}

// ── DASHBOARD ────────────────────────────────────────────────

async function loadDashboard() {
  showState('dash', 'Loading');

  const [livresRes, auteursRes, liaisonsRes] = await Promise.all([
    DB.from('bao_livres').select('rubrique, etat, has_sommaire, prix_achat'),
    DB.from('bao_auteurs').select('id', { count: 'exact', head: true }),
    DB.from('bao_livre_auteur').select('livre_id', { count: 'exact', head: true })
  ]);

  if (livresRes.error) {
    document.getElementById('dashContent').innerHTML =
      `<div class="alert alert-danger">${escHtml(livresRes.error.message)}</div>`;
    showState('dash', 'Content');
    return;
  }

  const livres = livresRes.data || [];
  const nbAuteurs = auteursRes.count || 0;
  const nbLiaisons = liaisonsRes.count || 0;

  // KPI
  const nbLivres = livres.length;
  const nbSommaires = livres.filter(l => l.has_sommaire).length;
  const totalPrix = livres.reduce((s, l) => s + (parseFloat(l.prix_achat) || 0), 0);

  // Par rubrique
  const parRubrique = {};
  livres.forEach(l => {
    const r = l.rubrique || '(sans rubrique)';
    parRubrique[r] = (parRubrique[r] || 0) + 1;
  });

  // Par état
  const parEtat = {};
  livres.forEach(l => {
    const e = l.etat || '(non renseigné)';
    parEtat[e] = (parEtat[e] || 0) + 1;
  });

  const container = document.getElementById('dashContent');
  container.innerHTML = `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="fs-2 fw-bold text-primary">${nbLivres}</div>
            <small class="text-muted">Livres</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="fs-2 fw-bold text-success">${nbSommaires}</div>
            <small class="text-muted">Avec sommaire</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="fs-2 fw-bold text-info">${nbAuteurs}</div>
            <small class="text-muted">Auteurs</small>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <div class="fs-2 fw-bold text-warning">${totalPrix.toFixed(0)} €</div>
            <small class="text-muted">Total achats</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><i class="bi bi-bookmark me-2"></i>Par rubrique</div>
          <ul class="list-group list-group-flush">
            ${Object.entries(parRubrique).sort((a, b) => b[1] - a[1]).map(([r, n]) =>
              `<li class="list-group-item d-flex justify-content-between">${escHtml(r)}<span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">${n}</span></li>`
            ).join('')}
          </ul>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><i class="bi bi-flag me-2"></i>Par état</div>
          <ul class="list-group list-group-flush">
            ${Object.entries(parEtat).sort((a, b) => b[1] - a[1]).map(([e, n]) =>
              `<li class="list-group-item d-flex justify-content-between">${escHtml(e)}<span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">${n}</span></li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-3 text-muted small">
      <i class="bi bi-link-45deg me-1"></i>${nbLiaisons} liaisons auteur–livre (table N:M)
    </div>
  `;
  showState('dash', 'Content');
}

// ── Export CSV ────────────────────────────────────────────────

function exportLivresCSV() {
  const headers = ['Nom', 'Titre', 'ISBN', 'Année', 'Pages', 'Rubrique', 'Éditeur', 'Auteurs', 'État', 'Sommaire', 'Prix'];
  const rows = [headers, ...allLivres.map(l => [
    l.nom, l.titre || '', l.isbn || '', l.annee || '', l.pages || '',
    l.rubrique || '', l.editeur || '', l.auteurs_str || '',
    l.etat || '', l.has_sommaire ? 'Oui' : 'Non', l.prix_achat || ''
  ])];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bao_livres_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Délégation actions ───────────────────────────────────────

function initDelegation() {
  // Livres
  document.getElementById('livresBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    if (!tr) return;
    const id = tr.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit-livre') {
      const livre = allLivres.find(l => l.id === id);
      if (livre) openLivreModal(livre);
    }
    if (action === 'delete-livre') await deleteLivre(id);
  });

  // Auteurs
  document.getElementById('auteursBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const tr = btn.closest('[data-id]');
    if (!tr) return;
    const id = tr.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit-auteur') {
      const auteur = allAuteurs.find(a => a.id === id);
      if (auteur) openAuteurModal(auteur);
    }
    if (action === 'delete-auteur') await deleteAuteur(id);
  });

  // Boutons toolbar
  document.getElementById('btnAddLivre').addEventListener('click', () => openLivreModal(null));
  document.getElementById('btnAddAuteur').addEventListener('click', () => openAuteurModal(null));
  document.getElementById('btnSaveLivre').addEventListener('click', saveLivre);
  document.getElementById('btnSaveAuteur').addEventListener('click', saveAuteur);
  document.getElementById('btnExportLivres').addEventListener('click', exportLivresCSV);

  // Filtres
  document.getElementById('searchLivres').addEventListener('input', filterLivres);
  document.getElementById('filterRubrique').addEventListener('change', filterLivres);
  document.getElementById('searchAuteurs').addEventListener('input', () => renderAuteurs(allAuteurs));
}

// ── Lazy load onglets ────────────────────────────────────────

function initTabs() {
  let auteursLoaded = false;
  let dashLoaded = false;

  document.getElementById('tab-auteurs-btn').addEventListener('shown.bs.tab', async () => {
    if (!auteursLoaded) { await loadAuteurs(); auteursLoaded = true; }
  });
  document.getElementById('tab-dash-btn').addEventListener('shown.bs.tab', async () => {
    if (!dashLoaded) { await loadDashboard(); dashLoaded = true; }
  });
}

// ── Point d'entrée ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;

  // Guard créateur (tables L3)
  if (!window.bdbUser.isCreator) {
    document.querySelector('main').innerHTML =
      '<div class="text-center py-5 text-muted"><i class="bi bi-shield-lock fs-1 d-block mb-3"></i><p>Accès réservé au créateur.</p></div>';
    return;
  }

  // Init modales
  modalLivreInstance = new bootstrap.Modal(document.getElementById('modalLivre'));
  modalAuteurInstance = new bootstrap.Modal(document.getElementById('modalAuteur'));

  initDelegation();
  initTabs();
  await loadLivres();
});
