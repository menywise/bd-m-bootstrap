---
name: bdb-module-generator
description: >
  Generateur de fichiers module BDB (Bible de Bloc) conformes CDS.
  Declencher des qu'un utilisateur demande de creer, migrer ou reconstruire
  un module HTML, un fichier CSS module, ou un fichier JS module pour BDB.
  Declencher aussi sur : nouveau module, migration shell, refonte UI module,
  creation page BDB, scaffold module.
  Produit des fichiers complets (pas d'extraits) prets a deployer,
  respectant toutes les conventions CDS, INTERDIT, et patterns BDB.
  Toujours verifier le schema DB via project_knowledge_search sur
  04_SUPABASE_DATA_MODEL AVANT de generer du code Supabase.
---

# Skill — BDB Module Generator

## Role

Produire des fichiers **complets** (index.html, [module]-ui.css, [module].js)
pour l'application BDB. Chaque fichier livre = pret a deployer sans retouche.
Pas d'extraits, pas de "// reste du code ici".

## Sources de verite (project_knowledge_search OBLIGATOIRE)

- **04_SUPABASE_DATA_MODEL** — schema tables, colonnes, FK, RLS (AVANT tout SQL)
- **03_CDS_REFERENCE** — classes CSS existantes (AVANT toute classe custom)
- **02_CHANTIER_TECHNIQUE** — BLOCS B/C/D/E complets, patterns JS
- **09_MODULE_DEPENDENCY_MAP** — dependances inter-modules

---

## TEMPLATE HTML — Structure obligatoire (Smarty V5)

Tout module BDB = ce squelette exact. Aucune deviation.
Reference : _template-member-v5.html (session #89).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>[Nom Module] — Des Blocs &amp; Moi</title>

  <!-- 1. Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <!-- 2. Smarty V5 core (composants + layout — PAS de BS embarque) -->
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@63905396c73b061f336f8f5178d738627bca601c/theme-base.css" rel="stylesheet"/>
  <!-- 3. Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <!-- 4. CDS overrides (delta client — vide par defaut) -->
  <link href="../../css/cds-overrides.css" rel="stylesheet"/>
  <!-- 5. CSS module -->
  <link href="[module]-ui.css" rel="stylesheet"/>
</head>

<body>

  <div id="wrapper" class="d-flex align-items-stretch flex-column min-vh-100">

    <!-- PREMIER ENFANT de #wrapper — obligatoire (INTERDIT-E1) -->
    <div id="bdb-shell"
         data-module-title="[Nom Module]"
         data-module-icon="bi-[icon]"
         data-root-path="../../">
    </div>

    <div id="wrapper_content" class="d-flex flex-fill">
      <main id="middle" class="flex-fill">
        <div class="container-fluid p-3 p-md-4" id="[module]Main">

          <!-- Toolbar filtres -->
          <div class="row g-2 mb-4 align-items-end">
            <div class="col-12 col-md">
              <div class="position-relative">
                <i class="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                <input type="text" class="form-control cds-search-input"
                       id="searchInput" placeholder="Rechercher..."/>
              </div>
            </div>
            <!-- Slot admin — masque par defaut -->
            <div class="col-12 col-md-auto d-none" id="[module]ToolbarAdminSlot">
              <button class="btn btn-danger w-100" id="btnNew">
                <i class="bi bi-plus-lg me-1"></i>Nouveau
              </button>
            </div>
          </div>

          <!-- 3 etats UI -->
          <div id="loadingState">
            <div class="placeholder-glow p-3">
              <div class="placeholder col-8 rounded mb-3 fs-5"></div>
              <div class="placeholder col-5 rounded mb-2"></div>
              <div class="placeholder col-7 rounded mb-2"></div>
              <div class="placeholder col-4 rounded"></div>
            </div>
          </div>

          <div id="emptyState" class="d-none text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            <p>Aucun element pour le moment.</p>
          </div>

          <div id="errorState" class="d-none"></div>

          <!-- Grille donnees -->
          <div id="[module]List" class="row g-3 cds-card-animated d-none"></div>

        </div>
      </main>
    </div>

    <footer class="mt-auto py-3 border-top text-center text-muted bg-white">
      <small>&copy; 2026 <span class="app-nom"></span> —
      <span class="badge bg-light text-dark border">CDS Compliant</span></small>
    </footer>

  </div>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Supabase SDK — .js pas .min.js -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <!-- Socle BDB -->
  <script src="../../js/supabase-client.js"></script>
  <script src="../../js/bdb-ui.js"></script>
  <script src="../../js/bdb-invite-guard.js"></script>
  <script src="../../js/bdb-shell.js"></script>
  <!-- Module JS -->
  <script src="[module]-app.js"></script>
</body>
</html>
```

### Notes template

- `[module]` = nom court sans accent (ex: arsenal, fiches, thesaurus)
- `[Nom Module]` = libelle affiche (ex: Arsenal, Fiches d'Intervention)
- `[icon]` = nom Bootstrap Icon sans prefixe bi- (ex: box-seam, journal-text)
- CSS module : **co-localise** dans le meme dossier (`[module]-ui.css`)
- JS module : **co-localise** dans le meme dossier (`[module]-app.js`)
- Chemin socle : `../../js/` (modules vivent dans `modules/[module]/`)
- `data-root-path` obligatoire : `../../` pour modules, `../` pour atelier/conseil

---

## TEMPLATE JS — Pattern init obligatoire

```javascript
/* ================================================================
   [MODULE] — Des Blocs & Moi
   CDS Compliant | escHtml | 3 etats UI
   ================================================================ */

const DB = window.bdb;

const state = {
  items: [],
  isAdmin: false,
  // referentiels si necessaire :
  // categories: [], tags: [], contentTypeId: null
};

// --- Securite XSS ---
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Init depuis shell ---
function initFromShell() {
  const u = window.bdbUser;
  state.isAdmin = u.isAdmin;
  if (state.isAdmin) {
    document.getElementById('[module]ToolbarAdminSlot').classList.remove('d-none');
    document.getElementById('btnNew').addEventListener('click', openModal);
  }
}

// --- Referentiels (propagent erreur via throw) ---
async function loadReferentiels() {
  // Exemple :
  // const { data, error } = await DB.from('categories').select('*');
  // if (error) throw new Error('categories : ' + error.message);
  // state.categories = data || [];
}

// --- Chargement donnees ---
async function loadData() {
  const listEl   = document.getElementById('[module]List');
  const loadEl   = document.getElementById('loadingState');
  const emptyEl  = document.getElementById('emptyState');
  const errorEl  = document.getElementById('errorState');

  // Loading
  loadEl.classList.remove('d-none');
  listEl.classList.add('d-none');
  emptyEl.classList.add('d-none');
  errorEl.classList.add('d-none');

  const { data, error } = await DB.from('[table]')
    .select('*')
    .order('created_at', { ascending: false });

  loadEl.classList.add('d-none');

  // Error
  if (error) {
    errorEl.classList.remove('d-none');
    errorEl.innerHTML = `
      <div class="cds-error-state text-center py-5">
        <i class="bi bi-exclamation-triangle fs-1 text-danger d-block mb-2"></i>
        <p class="text-muted">${escHtml(error.message)}</p>
        <button class="btn btn-outline-primary btn-sm" id="btnRetry">
          <i class="bi bi-arrow-clockwise me-1"></i>Reessayer
        </button>
      </div>`;
    document.getElementById('btnRetry').addEventListener('click', loadData);
    return;
  }

  state.items = data || [];

  // Empty
  if (state.items.length === 0) {
    emptyEl.classList.remove('d-none');
    return;
  }

  // Success
  listEl.classList.remove('d-none');
  renderList();
}

// --- Rendu liste ---
function renderList() {
  const listEl = document.getElementById('[module]List');
  listEl.innerHTML = state.items.map(item => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">${escHtml(item.title)}</h6>
          <p class="text-muted cds-text-sm mb-0">${escHtml(item.description || '')}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Recherche ---
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    // Filtrer state.items et re-render
  });
}

// --- Modal (admin) ---
function openModal() {
  // Bootstrap modal via JS
}

// --- Toast ---
function showToast(message, type = 'info') {
  // Utiliser .cds-toast ou Bootstrap toast
}

// --- Point d'entree ---
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();
  try {
    await loadReferentiels();
  } catch (err) {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('errorState').classList.remove('d-none');
    document.getElementById('errorState').innerHTML = `
      <div class="cds-error-state text-center py-5">
        <i class="bi bi-exclamation-triangle fs-1 text-danger d-block mb-2"></i>
        <p class="text-muted">Impossible de charger les referentiels : ${escHtml(err.message)}</p>
        <button class="btn btn-outline-primary btn-sm" id="btnRetryRef">
          <i class="bi bi-arrow-clockwise me-1"></i>Reessayer
        </button>
      </div>`;
    document.getElementById('btnRetryRef').addEventListener('click', () => location.reload());
    return;
  }
  await loadData();
  initSearch();
});
```

---

## TEMPLATE CSS MODULE

```css
/* ================================================================
   [module]-ui.css — Des Blocs & Moi
   Toutes regles scopees a #[module]Main
   ================================================================ */

/* --- Cards module --- */
#[module]Main .[module]-card {
  /* regles specifiques */
}

/* --- Keyframes --- */
@keyframes [module]-fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## CHECKLIST PRE-LIVRAISON (audit automatique)

Avant de livrer un fichier, verifier TOUS ces points :

### HTML
- [ ] Chaine CSS V5 : BS 5.3.3 → theme-base V5 (CDN 63905396) → BI 1.11.1 → cds-overrides → module
- [ ] Chaine JS : bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → module
- [ ] `#bdb-shell` = premier enfant de `#wrapper` (INTERDIT-E1)
- [ ] `data-module-title`, `data-module-icon` et `data-root-path` renseignes
- [ ] Zero `onclick=` dans le HTML
- [ ] Zero `style=` statique (sauf couleur dynamique DB ou width progressbar)
- [ ] 3 etats UI presents : loadingState + emptyState + errorState
- [ ] Slot admin toolbar masque par defaut (`d-none`)
- [ ] `lang="fr"` sur `<html>`
- [ ] Footer avec `<span class="app-nom"></span>` (nom dynamique via bdb-shell)

### JS
- [ ] `escHtml()` present et applique sur TOUT innerHTML avec donnee DB
- [ ] `await window.bdbShellReady` en premier dans DOMContentLoaded
- [ ] `initFromShell()` appele apres bdbShellReady
- [ ] Referentiels dans try/catch avec cdsShowGridError
- [ ] loadData couvre 3 etats (loading/empty/error)
- [ ] Zero `console.log` (ou commente pour dev)
- [ ] Zero `localStorage` (sauf exception documentee)
- [ ] Zero `initAuth()` local (INTERDIT-B3)
- [ ] Zero requete profiles_directory/user_roles (INTERDIT-B2)
- [ ] `const DB = window.bdb` (pas de nouveau client — INTERDIT-A3)
- [ ] addEventListener uniquement (pas onclick inline)

### CSS
- [ ] Toutes regles scopees a `#[module]Main` (INTERDIT-17)
- [ ] Prefixe `[module]-` sur toute classe custom
- [ ] Keyframes prefixes `[module]-`
- [ ] Pas de regle globale (.card, .btn, body...)
- [ ] Classe deja dans BS/theme-base/cds-overrides ? → pas de doublon

### Supabase
- [ ] Tables et colonnes verifiees via project_knowledge_search
- [ ] Zero colonne inventee
- [ ] escHtml sur tout rendu de donnee DB

---

## REGLES DE GENERATION

1. **Fichiers complets** : un create_file par fichier. Jamais d'extrait.
2. **Co-localisation** : HTML + CSS + JS dans `modules/[module]/`
3. **Chemins relatifs** : socle = `../../js/`, css global = `../../css/`
4. **Module de reference** : `modules/fiches/index.html` (le plus complet)
5. **Avant tout SQL** : project_knowledge_search sur 04_SUPABASE_DATA_MODEL
6. **Avant toute classe CSS** : verifier 03_CDS_REFERENCE
7. **Audit post-generation** : grep violations (onclick=, style=, console.log, localStorage)
8. **Livraison** : tableau resume des fichiers + violations detectees

---

## ADAPTATIONS SELON TYPE DE MODULE

### Module Supabase (standard)
Template complet ci-dessus. Tables, CRUD, referentiels.

### Module statique (zero Supabase)
- Retirer `supabase-js@2` et `supabase-client.js` du HTML
- Retirer `const DB = window.bdb`
- Garder bdb-shell.js (auth + navigation obligatoires)
- Pas de 3 etats async (contenu statique)

### Module localStorage (Phase 1 migration)
- Garder supabase-client.js + bdb-shell.js (auth)
- localStorage = source de donnees temporaire
- Documenter la dette dans un commentaire header
- Pas de escHtml sur donnees localStorage locales (pas de vecteur XSS externe)

---

## FICHIERS PROTEGES — JAMAIS MODIFIER SANS ACCORD MANU

- `js/bdb-shell.js`
- `js/supabase-client.js`
- `css/cds-overrides.css`

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V2.1.0 qui genere des fichiers module complets (index.html + [module]-ui.css + [module]-app.js) conformes CDS Smarty V5. 413 lignes de templates, patterns et regles. Verification schema DB obligatoire avant generation. |
| **Fonction** | Produit des fichiers prets a deployer (pas d extraits, pas de "// reste du code ici"). Force la verification du schema DB via project_knowledge_search AVANT de generer du code Supabase. |
| **Avantage** | vs generation manuelle — chaque module necessiterait 2h de scaffold (chaine JS, chaine CSS, guards, 3 etats, escHtml, delegation). Ce skill genere le tout en 1 appel conforme. |
| **Benefice** | Le createur cree un module complet en quelques minutes. Le dev qui reprend trouve un template coherent avec tous les autres modules. |
| **Risque** | Template obsolete apres evolution CDS (ex : passage V5 → V6) — les modules generes sont non conformes au nouveau standard. Mitigation : le skill est versionne et mis a jour avec CDS. |
| **Resultat** | 16+ modules generes conformes. 0 module deploye sans chaine V5 complete depuis V2.0.0. |
| **Recommandation** | Conserver. Mettre a jour en synchronisation avec cds-compliance et bootstrap5-patterns. |

---

## Historique

```
2026-05-01 — v2.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

v2.0.0 — 2026-04-17 — Migration Smarty V5 (session #89).
          BS 5.3.2 → 5.3.3. CDN @latest → @63905396. theme-print supprime.
          #bdb-shell premier enfant #wrapper (pas <main>). INTERDIT-E1 V5.
          bdb-invite-guard.js + bdb-ui.js ajoutes chaine JS.
          Footer dynamique app-nom. data-root-path obligatoire.
```
