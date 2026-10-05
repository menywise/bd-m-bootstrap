/**
 * admin-bao.js — Administration catalogue BàO Dunod (Version Premium)
 * Pattern BDB : admin standalone (ISO-01→05).
 * Chargé par admin-bao.html uniquement.
 *
 * Dépendances globales :
 *   window.bdb          — Supabase client
 *   window.bdbUser      — utilisateur courant
 *   window.bdbShellReady — Promise shell prêt
 */

const DB = window.bdb;

// ── Utilitaires ──────────────────────────────────────────────

const _escEl = document.createElement('span');
function escHtml(s) { 
    if (!s && s !== 0) return '';
    _escEl.textContent = s; 
    return _escEl.innerHTML; 
}

function showState(prefix, state) {
    for (const s of ['Loading', 'Empty', 'Error', 'List', 'Content']) {
        const el = document.getElementById(prefix + s);
        if (el) el.classList.add('d-none');
    }
    const target = document.getElementById(prefix + state);
    if (target) target.classList.remove('d-none');
}

// ── Toast notification ───────────────────────────────────────
function showToast(message, success = true) {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${success ? 'bg-success' : 'bg-danger'} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${escHtml(message)}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>`;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// ── État local ───────────────────────────────────────────────

let allLivres = [];
let allAuteurs = [];
let modalLivreInstance = null;
let modalAuteurInstance = null;

// ── LIVRES (Vue Cartes Premium) ──────────────────────────────

async function loadLivres() {
    showState('livres', 'Loading');
    
    if (!DB) {
        showState('livres', 'Error');
        document.getElementById('livresError').innerHTML =
            `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Connexion à la base de données non disponible. Vérifiez que vous êtes bien connecté.</div>`;
        return;
    }
    
    try {
        const { data, error } = await DB.from('bao_livres')
            .select('*')
            .order('rubrique', { ascending: true })
            .order('nom', { ascending: true });

        if (error) throw error;
        
        if (!data || data.length === 0) {
            showState('livres', 'Empty');
            document.getElementById('badgeLivres').textContent = '0';
            return;
        }

        allLivres = data;
        document.getElementById('badgeLivres').textContent = data.length;
        populateRubriques(data);
        renderLivres(data);
        showState('livres', 'List');
        
    } catch (err) {
        showState('livres', 'Error');
        document.getElementById('livresError').innerHTML =
            `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Erreur : ${escHtml(err.message || err)}</div>`;
        console.error('loadLivres error:', err);
    }
}

function populateRubriques(livres) {
    const sel = document.getElementById('filterRubrique');
    if (!sel) return;
    const rubriques = [...new Set(livres.map(l => l.rubrique).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Toutes rubriques</option>' +
        rubriques.map(r => `<option value="${escHtml(r)}">${escHtml(r)}</option>`).join('');
}

function renderLivres(livres) {
    const grid = document.getElementById('livresGrid');
    if (!grid) return;
    
    const searchTerm = (document.getElementById('searchLivres')?.value || '').toLowerCase().trim();

    if (livres.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="bi bi-search fs-1 d-block mb-2"></i>
                <p>Aucun livre ne correspond à vos critères.</p>
            </div>`;
        return;
    }

    grid.innerHTML = livres.map(l => {
        // Logique pour le surlignage du sommaire (Action 4)
        let sommaireExtrait = '';
        if (searchTerm && searchTerm.length > 2 && l.sommaire_md) {
            const lignes = l.sommaire_md.split('\n');
            const matchLine = lignes.find(li => li.toLowerCase().includes(searchTerm));
            if (matchLine) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                const highlightedText = escHtml(matchLine.trim()).replace(regex, '<span class="search-highlight">$1</span>');
                sommaireExtrait = `<div class="sommaire-extrait mt-1">${highlightedText}</div>`;
            }
        }

        // Fallback : afficher la rubrique et l'année si pas d'extrait de sommaire
        const infoSubText = !sommaireExtrait 
            ? `<p class="card-text text-muted small mb-2">${escHtml(l.rubrique || 'Sans rubrique')} · ${l.annee || '—'}</p>` 
            : '';

        return `
            <div class="col" data-id="${l.id}">
                <div class="card livre-card h-100 shadow-sm">
                    <div class="cover-container">
                        ${l.cover_url
                            ? `<img src="${l.cover_url}" alt="Couverture de ${escHtml(l.titre || l.nom)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'><i class=\\'bi bi-image fs-1\\'></i><span class=\\'small\\'>Image indisponible</span></div>';">`
                            : `<div class="cover-placeholder"><i class="bi bi-image fs-1"></i><span class="small">Pas de couverture</span></div>`
                        }
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title mb-1 fw-bold" title="${escHtml(l.titre || l.nom)}">${escHtml(l.titre || l.nom)}</h6>
                        <p class="card-text text-muted small mb-2">${escHtml(l.auteurs_str || 'Auteur inconnu')}</p>
                        ${sommaireExtrait}
                        ${infoSubText}
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                            <span class="badge badge-etat-workflow ${escHtml(l.etat || '')}">${renderEtatLibelle(l.etat)}</span>
                            <div>
                                <button class="btn btn-sm btn-outline-primary" data-action="edit-livre" title="Modifier">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete-livre" title="Supprimer">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderEtatLibelle(etat) {
    const map = {
        '': '—',
        'a_acheter': '📚 À acheter',
        'commande': '📦 Commandé',
        'recu': '📖 Reçu',
        'lu': '✅ Lu',
        'indexe': '⭐ Indexé'
    };
    return map[etat] || escHtml(etat) || '—';
}

function filterLivres() {
    if (!allLivres.length) return;
    
    const q = (document.getElementById('searchLivres')?.value || '').toLowerCase().trim();
    const rub = document.getElementById('filterRubrique')?.value || '';
    const etat = document.getElementById('filterEtat')?.value || '';

    const filtered = allLivres.filter(l => {
        if (rub && l.rubrique !== rub) return false;
        if (etat && l.etat !== etat) return false;
        if (!q) return true;

        // Recherche full-text dans les champs principaux ET le sommaire
        return (l.nom || '').toLowerCase().includes(q) ||
               (l.titre || '').toLowerCase().includes(q) ||
               (l.auteurs_str || '').toLowerCase().includes(q) ||
               (l.isbn || '').toLowerCase().includes(q) ||
               (l.sommaire_md || '').toLowerCase().includes(q);
    });
    renderLivres(filtered);
}

// ── Modal livre ──────────────────────────────────────────────

function openLivreModal(livre) {
    if (!modalLivreInstance) {
        modalLivreInstance = new bootstrap.Modal(document.getElementById('modalLivre'));
    }
    
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
    
    if (!nom) {
        showToast('Le nom est obligatoire.', false);
        return;
    }

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

    try {
        let result;
        if (id) {
            payload.updated_at = new Date().toISOString();
            result = await DB.from('bao_livres').update(payload).eq('id', id).select();
        } else {
            result = await DB.from('bao_livres').insert(payload).select();
        }

        if (result.error) {
            showToast('Erreur : ' + result.error.message, false);
            return;
        }

        modalLivreInstance.hide();
        showToast(id ? 'Livre modifié avec succès.' : 'Livre ajouté avec succès.');
        await loadLivres();
        
    } catch (err) {
        showToast('Erreur : ' + (err.message || err), false);
        console.error('saveLivre error:', err);
    }
}

async function deleteLivre(id) {
    if (!confirm('Supprimer définitivement ce livre ? Cette action est irréversible.')) return;
    
    try {
        const { error } = await DB.from('bao_livres').delete().eq('id', id);
        if (error) {
            showToast('Erreur : ' + error.message, false);
            return;
        }
        showToast('Livre supprimé.');
        await loadLivres();
    } catch (err) {
        showToast('Erreur : ' + (err.message || err), false);
        console.error('deleteLivre error:', err);
    }
}

// ── AUTEURS ──────────────────────────────────────────────────

async function loadAuteurs() {
    showState('auteurs', 'Loading');
    
    if (!DB) {
        showState('auteurs', 'Error');
        document.getElementById('auteursError').innerHTML =
            `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Connexion à la base de données non disponible.</div>`;
        return;
    }
    
    try {
        const { data, error } = await DB.from('bao_auteurs')
            .select('*')
            .order('nom', { ascending: true });

        if (error) throw error;
        
        if (!data || data.length === 0) {
            showState('auteurs', 'Empty');
            document.getElementById('badgeAuteurs').textContent = '0';
            return;
        }

        allAuteurs = data;
        document.getElementById('badgeAuteurs').textContent = data.length;
        renderAuteurs(data);
        showState('auteurs', 'List');
        
    } catch (err) {
        showState('auteurs', 'Error');
        document.getElementById('auteursError').innerHTML =
            `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(err.message || err)}</div>`;
        console.error('loadAuteurs error:', err);
    }
}

function renderAuteurs(auteurs) {
    const body = document.getElementById('auteursBody');
    if (!body) return;
    
    const q = (document.getElementById('searchAuteurs')?.value || '').toLowerCase().trim();
    const filtered = q ? auteurs.filter(a => (a.nom || '').toLowerCase().includes(q)) : auteurs;
    
    if (filtered.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted py-4">
                    <i class="bi bi-search me-2"></i>Aucun auteur trouvé.
                </td>
            </tr>`;
        return;
    }
    
    body.innerHTML = filtered.map(a => `
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
    if (!modalAuteurInstance) {
        modalAuteurInstance = new bootstrap.Modal(document.getElementById('modalAuteur'));
    }
    
    document.getElementById('modalAuteurTitle').textContent = auteur ? "Modifier l'auteur" : "Ajouter un auteur";
    document.getElementById('auteurId').value = auteur?.id || '';
    document.getElementById('auteurNom').value = auteur?.nom || '';
    modalAuteurInstance.show();
}

async function saveAuteur() {
    const id = document.getElementById('auteurId').value;
    const nom = document.getElementById('auteurNom').value.trim();
    
    if (!nom) {
        showToast('Le nom est obligatoire.', false);
        return;
    }

    try {
        let result;
        if (id) {
            result = await DB.from('bao_auteurs').update({ nom }).eq('id', id).select();
        } else {
            result = await DB.from('bao_auteurs').insert({ nom }).select();
        }

        if (result.error) {
            showToast('Erreur : ' + result.error.message, false);
            return;
        }

        modalAuteurInstance.hide();
        showToast(id ? 'Auteur modifié.' : 'Auteur ajouté.');
        await loadAuteurs();
        
    } catch (err) {
        showToast('Erreur : ' + (err.message || err), false);
        console.error('saveAuteur error:', err);
    }
}

async function deleteAuteur(id) {
    if (!confirm("Supprimer cet auteur ? Les livres associés ne seront pas supprimés.")) return;
    
    try {
        const { error } = await DB.from('bao_auteurs').delete().eq('id', id);
        if (error) {
            showToast('Erreur : ' + error.message, false);
            return;
        }
        showToast('Auteur supprimé.');
        await loadAuteurs();
    } catch (err) {
        showToast('Erreur : ' + (err.message || err), false);
        console.error('deleteAuteur error:', err);
    }
}

// ── DASHBOARD Premium (Action 5) ─────────────────────────────

async function loadDashboard() {
    showState('dash', 'Loading');
    
    if (!DB) {
        document.getElementById('dashContent').innerHTML =
            `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Connexion à la base de données non disponible.</div>`;
        showState('dash', 'Content');
        return;
    }

    try {
        const [livresRes, auteursRes] = await Promise.all([
            DB.from('bao_livres').select('rubrique, etat, has_sommaire, prix_achat, cover_url, auteurs_str, etiquette, annee'),
            DB.from('bao_auteurs').select('id', { count: 'exact', head: true }),
        ]);

        if (livresRes.error) throw livresRes.error;

        const livres = livresRes.data || [];
        const nbAuteurs = auteursRes.count || 0;

        // KPI
        const nbTotal = livres.length;
        const nbSommaires = livres.filter(l => l.has_sommaire).length;
        const totalPrix = livres.reduce((s, l) => s + (parseFloat(l.prix_achat) || 0), 0);
        const nbAvecCouverture = livres.filter(l => l.cover_url && !l.cover_url.includes('200_QL40') && !l.cover_url.includes('200_.jpg')).length;
        const scoreCompletude = nbTotal ? Math.round((nbAvecCouverture / nbTotal) * 100) : 0;
        const nbLus = livres.filter(l => l.etat === 'lu' || l.etat === 'indexe').length;

        // Top Auteurs
        const authorCounts = {};
        livres.forEach(l => {
            if (!l.auteurs_str) return;
            l.auteurs_str.split(',').forEach(a => {
                const author = a.trim();
                if (author) authorCounts[author] = (authorCounts[author] || 0) + 1;
            });
        });
        const topAuteurs = Object.entries(authorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Pyramide des statuts
        const statusOrder = ['a_acheter', 'commande', 'recu', 'lu', 'indexe'];
        const statusLabels = {
            'a_acheter': '📚 À acheter',
            'commande': '📦 Commandé',
            'recu': '📖 Reçu',
            'lu': '✅ Lu',
            'indexe': '⭐ Indexé'
        };
        const statusCounts = {};
        statusOrder.forEach(s => { statusCounts[s] = 0; });
        livres.forEach(l => {
            if (statusCounts.hasOwnProperty(l.etat)) statusCounts[l.etat]++;
        });
        const maxStatus = Math.max(1, ...Object.values(statusCounts));

        // Par rubrique
        const parRubrique = {};
        livres.forEach(l => {
            const r = l.rubrique || 'Sans rubrique';
            parRubrique[r] = (parRubrique[r] || 0) + 1;
        });
        const topRubriques = Object.entries(parRubrique)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        const container = document.getElementById('dashContent');
        container.innerHTML = `
            <h4 class="mb-4"><i class="bi bi-gem me-2"></i>Vue d'ensemble du collectionneur</h4>

            <!-- KPI Cards -->
            <div class="row g-3 mb-4">
                <div class="col-6 col-xl-3">
                    <div class="card border-primary h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-collection fs-1 text-primary"></i>
                            <div class="fs-2 fw-bold text-primary">${nbTotal}</div>
                            <small class="text-muted">Ouvrages en collection</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-xl-3">
                    <div class="card border-success h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-list-check fs-1 text-success"></i>
                            <div class="fs-2 fw-bold text-success">${nbSommaires}</div>
                            <small class="text-muted">Sommaires indexés</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-xl-3">
                    <div class="card border-info h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-cash-stack fs-1 text-info"></i>
                            <div class="fs-2 fw-bold text-info">${totalPrix.toFixed(0)} €</div>
                            <small class="text-muted">Valeur estimée</small>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-xl-3">
                    <div class="card border-warning h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-star-fill fs-1 text-warning"></i>
                            <div class="fs-2 fw-bold text-warning">${scoreCompletude}%</div>
                            <small class="text-muted">Complétude (couvertures)</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3">
                <!-- Pyramide des statuts -->
                <div class="col-lg-8">
                    <div class="card h-100">
                        <div class="card-header"><i class="bi bi-bar-chart-steps me-2"></i>Pyramide des Statuts</div>
                        <div class="card-body">
                            ${statusOrder.map(s => `
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between small mb-1">
                                        <span>${statusLabels[s]}</span>
                                        <span class="fw-bold">${statusCounts[s]}</span>
                                    </div>
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar ${s === 'lu' ? 'bg-success' : s === 'indexe' ? 'bg-dark' : s === 'recu' ? 'bg-purple' : s === 'commande' ? 'bg-info' : 'bg-warning'}" 
                                             style="width: ${(statusCounts[s] / maxStatus) * 100}%">
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="mt-3 pt-2 border-top text-muted small">
                                <i class="bi bi-check-circle me-1"></i>${nbLus} livres lus ou indexés (${nbTotal ? Math.round((nbLus / nbTotal) * 100) : 0}% de la collection)
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Auteurs et Rubriques -->
                <div class="col-lg-4">
                    <!-- Top Auteurs -->
                    <div class="card mb-3">
                        <div class="card-header"><i class="bi bi-trophy me-2"></i>Top Auteurs</div>
                        <ul class="list-group list-group-flush">
                            ${topAuteurs.length ? topAuteurs.map(([auteur, count], i) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span><span class="badge bg-secondary me-2">#${i + 1}</span>${escHtml(auteur)}</span>
                                    <span class="badge bg-primary rounded-pill">${count}</span>
                                </li>
                            `).join('') : '<li class="list-group-item text-muted">Aucun auteur renseigné</li>'}
                        </ul>
                    </div>

                    <!-- Top Rubriques -->
                    <div class="card">
                        <div class="card-header"><i class="bi bi-bookmark me-2"></i>Par Rubrique</div>
                        <ul class="list-group list-group-flush">
                            ${topRubriques.map(([rubrique, count]) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span class="small">${escHtml(rubrique)}</span>
                                    <span class="badge bg-secondary rounded-pill">${count}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-3 text-muted small text-center">
                <i class="bi bi-people me-1"></i>${nbAuteurs} auteurs distincts enregistrés dans la base
            </div>
        `;
        
        showState('dash', 'Content');
        
    } catch (err) {
        document.getElementById('dashContent').innerHTML =
            `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${escHtml(err.message || err)}</div>`;
        showState('dash', 'Content');
        console.error('loadDashboard error:', err);
    }
}

// ── Export CSV ────────────────────────────────────────────────

function exportLivresCSV() {
    if (!allLivres.length) {
        showToast('Aucun livre à exporter.', false);
        return;
    }
    
    const headers = ['Nom', 'Titre', 'ISBN', 'Année', 'Pages', 'Rubrique', 'Éditeur', 'Auteurs', 'État', 'Sommaire', 'Prix'];
    const rows = [headers, ...allLivres.map(l => [
        l.nom || '',
        l.titre || '',
        l.isbn || '',
        l.annee || '',
        l.pages || '',
        l.rubrique || '',
        l.editeur || '',
        l.auteurs_str || '',
        l.etat || '',
        l.has_sommaire ? 'Oui' : 'Non',
        l.prix_achat || ''
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
    
    showToast('Export CSV terminé.');
}

// ── Délégation des événements ─────────────────────────────────

function initDelegation() {
    // Livres - grille de cartes
    const livresGrid = document.getElementById('livresGrid');
    if (livresGrid) {
        livresGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const card = btn.closest('[data-id]');
            if (!card) return;
            const id = card.dataset.id;
            const action = btn.dataset.action;

            if (action === 'edit-livre') {
                const livre = allLivres.find(l => l.id === id);
                if (livre) openLivreModal(livre);
            }
            if (action === 'delete-livre') await deleteLivre(id);
        });
    }

    // Auteurs - tableau
    const auteursBody = document.getElementById('auteursBody');
    if (auteursBody) {
        auteursBody.addEventListener('click', async (e) => {
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
    }

    // Boutons toolbar
    document.getElementById('btnAddLivre')?.addEventListener('click', () => openLivreModal(null));
    document.getElementById('btnAddAuteur')?.addEventListener('click', () => openAuteurModal(null));
    document.getElementById('btnSaveLivre')?.addEventListener('click', saveLivre);
    document.getElementById('btnSaveAuteur')?.addEventListener('click', saveAuteur);
    document.getElementById('btnExportLivres')?.addEventListener('click', exportLivresCSV);

    // Filtres
    document.getElementById('searchLivres')?.addEventListener('input', filterLivres);
    document.getElementById('filterRubrique')?.addEventListener('change', filterLivres);
    document.getElementById('filterEtat')?.addEventListener('change', filterLivres);
    document.getElementById('searchAuteurs')?.addEventListener('input', () => renderAuteurs(allAuteurs));
}

// ── Lazy load des onglets ─────────────────────────────────────

function initTabs() {
    let auteursLoaded = false;
    let dashLoaded = false;

    const tabAuteursBtn = document.getElementById('tab-auteurs-btn');
    const tabDashBtn = document.getElementById('tab-dash-btn');

    if (tabAuteursBtn) {
        tabAuteursBtn.addEventListener('shown.bs.tab', async () => {
            if (!auteursLoaded) { 
                await loadAuteurs(); 
                auteursLoaded = true; 
            }
        });
    }
    
    if (tabDashBtn) {
        tabDashBtn.addEventListener('shown.bs.tab', async () => {
            if (!dashLoaded) { 
                await loadDashboard(); 
                dashLoaded = true; 
            }
        });
    }
}

// ── Point d'entrée ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM chargé, attente de bdbShellReady...');
    
    try {
        // Attendre que le shell soit prêt
        if (window.bdbShellReady) {
            await window.bdbShellReady;
        }
        console.log('Shell prêt.');
    } catch (err) {
        console.warn('bdbShellReady error:', err);
    }

    // Vérifier l'utilisateur (si la propriété existe)
    if (window.bdbUser && !window.bdbUser.isCreator) {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '<div class="text-center py-5 text-muted"><i class="bi bi-shield-lock fs-1 d-block mb-3"></i><p>Accès réservé au créateur.</p></div>';
        }
        return;
    }

    // Initialiser les modales Bootstrap
    try {
        const modalLivreEl = document.getElementById('modalLivre');
        const modalAuteurEl = document.getElementById('modalAuteur');
        if (modalLivreEl) modalLivreInstance = new bootstrap.Modal(modalLivreEl);
        if (modalAuteurEl) modalAuteurInstance = new bootstrap.Modal(modalAuteurEl);
    } catch (err) {
        console.warn('Erreur initialisation modales:', err);
    }

    // Initialiser les événements et les onglets
    initDelegation();
    initTabs();
    
    // Charger les livres
    await loadLivres();
    
    console.log('Admin BàO initialisé avec succès.');
});