# BDB — Pattern Back-Office Unique
```
VERSION  : 1.0.0
DATE     : 2026-04-16
SESSION  : #89
STATUT   : CANON — SOURCE DE VÉRITÉ BACK-OFFICE
PORTÉE   : admin/ · supervision/ · atelier/ · tout futur module back-office
SOURCE   : Smarty Multipurpose v1.1.4 (essentials.css lignes 9906-9936)
           TEMPLATE_CDS_REFERENCE.html v3.0.0
           Principes DB : P-CDS-01 à P-CDS-05
```

---

## 1 — RÈGLE FONDAMENTALE

**CDS et Smarty ne font qu'un.**

Toute classe CSS utilisée dans un module back-office BDB doit exister dans :
1. Bootstrap 5.3.2
2. `essentials.css` (Smarty → `theme-base.css`)
3. `layout.css` (Smarty → `theme-base.css`)
4. `cds-overrides.css`

Jamais inventer. Jamais supposer. Jamais pifométrie.

---

## 2 — STRUCTURE HTML INVARIABLE

Le même squelette s'applique à **tous** les modules back-office sans exception.

```html
<!-- row unique : col-md-3 navigation + col-md-9 contenu -->
<div class="row">

  <!-- NAVIGATION VERTICALE — col-md-3 -->
  <div class="col-md-3 col-sm-3 nopadding">
    <ul class="nav nav-tabs nav-stacked">
      <li class="active">
        <a href="#domaine1" data-bs-toggle="tab">
          <i class="bi bi-[icon] me-2"></i>Domaine 1
        </a>
      </li>
      <li>
        <a href="#domaine2" data-bs-toggle="tab">
          <i class="bi bi-[icon] me-2"></i>Domaine 2
        </a>
      </li>
      <!-- autant de li que de domaines -->
    </ul>
  </div>

  <!-- CONTENU — col-md-9 -->
  <div class="col-md-9 col-sm-9 nopadding">
    <div class="tab-content tab-stacked">

      <div id="domaine1" class="tab-pane active">
        <!-- TOOLBAR (si actions disponibles) -->
        <div class="card border mb-3">
          <div class="card-body py-2 px-3">
            <div class="row g-2 align-items-center">
              <div class="col-12 col-md">
                <!-- filtres, recherche -->
              </div>
              <div class="col-12 col-md-auto ms-md-auto">
                <button class="btn btn-primary btn-sm" id="btnNew" type="button">
                  <i class="bi bi-plus-lg me-1"></i>Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SOUS-NAVIGATION (si catégories dans le domaine) -->
        <ul class="nav nav-pills gap-1 mb-3">
          <li class="nav-item">
            <button class="nav-link active" data-pill="cat1">Catégorie A</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-pill="cat2">Catégorie B</button>
          </li>
        </ul>

        <!-- 3 ÉTATS UI (Standard C.9) -->
        <div id="[domaine]Loading">
          <!-- skeletonRows() depuis bdb-ui.js -->
        </div>
        <div id="[domaine]Empty" class="d-none">
          <div class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 mb-2 d-block"></i>
            <div>Aucun élément.</div>
          </div>
        </div>
        <div id="[domaine]Error" class="d-none">
          <div class="alert alert-danger d-flex gap-2 align-items-center">
            <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
            <div>
              <span id="[domaine]ErrorMsg"></span>
              <button class="btn btn-sm btn-outline-danger ms-2"
                      id="btn[Domaine]Retry" type="button">Réessayer</button>
            </div>
          </div>
        </div>
        <div id="[domaine]Grid" class="d-none">
          <!-- tableau CRUD -->
        </div>

      </div><!-- /tab-pane domaine1 -->

    </div><!-- /tab-content tab-stacked -->
  </div><!-- /col-md-9 -->

</div><!-- /row -->
```

---

## 3 — RÈGLES IMMUABLES

### 3.1 Navigation principale — nav-tabs.nav-stacked
- Source : `essentials.css` Smarty lignes 9906-9922
- `col-md-3 col-sm-3 nopadding` → navigation à gauche
- `col-md-9 col-sm-9 nopadding` → contenu à droite
- **JAMAIS** de `nav-tabs` horizontaux pour le back-office
- `data-bs-toggle="tab"` (Bootstrap 5 — pas `data-toggle`)

### 3.2 Sous-navigation — nav-pills uniquement
- Source : ADMIN-PATTERN-01 / TEMPLATE_CDS_REFERENCE.html
- `ul.nav.nav-pills.gap-1` pour naviguer entre catégories d'un domaine
- **JAMAIS** de `nav-tabs` en sous-navigation

### 3.3 Bouton Ajouter — btn-primary uniquement
- Source : ADMIN-PATTERN-01 / INTERDIT-C4
- `btn-primary btn-sm` dans `col-auto ms-md-auto` de la toolbar card
- **JAMAIS** `btn-danger` pour Ajouter
- **JAMAIS** hors de la toolbar

### 3.4 Helpers — bdb-ui.js uniquement
- Source : INTERDIT-JS-02
- `escHtml()`, `bdbToast()`, `bdbShowState()`, `skeletonRows()` → bdb-ui.js
- **JAMAIS** réimplémenter localement dans une IIFE
- **JAMAIS** `const _esc = document.createElement('span')` dans un module

### 3.5 Thème — clair uniquement
- Source : P-CDS-02
- `layout-dark.css` INTERDIT
- Fond page : `bg-light` / `--ds-bg-page` (#f1f5f9)
- **JAMAIS** de fond sombre dans les modules

---

## 4 — STRUCTURE JS (IIFE)

```javascript
(function () {
  /* Pas de helpers locaux — utiliser bdb-ui.js */
  const DB = window.bdb;

  let _inited = false;

  window.init[Module]Admin = async function () {
    if (_inited) return;
    _inited = true;
    /* init listeners + load */
  };

  /* Navigation onglets */
  function initNav() {
    document.querySelectorAll('#[module]BackNav [data-bs-toggle="tab"]')
      .forEach(btn => btn.addEventListener('shown.bs.tab', e => {
        const target = e.target.getAttribute('href').replace('#', '');
        load[target]();
      }));
  }

  /* C.9 — 3 états */
  function showState(domaine, state, msg) {
    ['Loading','Empty','Error','Grid'].forEach(s =>
      document.getElementById(domaine + s)?.classList.add('d-none')
    );
    document.getElementById(domaine + state)?.classList.remove('d-none');
    if (state === 'Error' && msg)
      document.getElementById(domaine + 'ErrorMsg').textContent = msg;
  }

})();
```

---

## 5 — INTÉGRATION DANS index.html (admin)

Le back-office est **dans** l'app, pas séparé. Le shell est le même.
La rupture visuelle = badge isAdmin (bleu) ou isCreator (violet) injecté par bdb-shell.js.

```html
<!-- Dans le corps de la page admin/index.html -->
<div class="container-fluid p-3 p-md-4 bg-light flex-grow-1" id="adminApp">

  <!-- [optionnel] En-tête de section -->
  <div class="d-flex align-items-center gap-2 mb-3">
    <i class="bi bi-shield-check text-primary fs-5"></i>
    <h5 class="mb-0 fw-semibold">Administration</h5>
  </div>

  <!-- LAYOUT BACK-OFFICE -->
  <div class="row">
    <div class="col-md-3 col-sm-3 nopadding">
      <ul class="nav nav-tabs nav-stacked" id="adminBackNav">
        <!-- domaines -->
      </ul>
    </div>
    <div class="col-md-9 col-sm-9 nopadding">
      <div class="tab-content tab-stacked">
        <!-- contenus -->
      </div>
    </div>
  </div>

</div>
```

---

## 6 — CE QUI CHANGE PAR RAPPORT À L'EXISTANT

| Avant | Après |
|---|---|
| nav-tabs horizontaux (9 onglets) | nav-tabs.nav-stacked vertical (col-md-3) |
| helpers escHtml/toast réimplémentés | bdb-ui.js uniquement |
| btn-danger dans creator | btn-primary partout |
| nav-tabs pour sous-nav | nav-pills uniquement |
| structure différente par module | structure identique pour tous |

---

## 7 — PROPAGATION

Ordre de propagation une fois ce pattern validé :

1. `modules/admin/index.html` — refonte layout (session dédiée)
2. `modules/supervision/index.html` — même pattern
3. `atelier/atelier-tables-index.html` — même pattern
4. Tous les futurs modules back-office

**Règle** : une session = un module. Lire le fichier réel avant de toucher quoi que ce soit.

---

## HISTORIQUE

```
2026-04-16 — V1.0.0  Création. Session #89.
             Source : audit Smarty HTML.zip + TEMPLATE_CDS_REFERENCE.html v3.0.0.
             Principes DB insérés : P-CDS-01 à P-CDS-05.
             Pattern nav-tabs.nav-stacked sourcé depuis essentials.css lignes 9906-9922.
```
