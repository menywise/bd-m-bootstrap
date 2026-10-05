# BDB — Catalogue exhaustif Bootstrap 5.3.3 + Smarty V5
```
VERSION  : 1.0.0
DATE     : 2026-04-17
STATUT   : RÉFÉRENCE ENCYCLOPÉDIQUE — pas une doctrine
AUTEUR   : Manu + Claude (session #90)
RÔLE     : Référencer ce que Bootstrap 5.3.3 et theme-base.css Smarty V5 offrent.
           Chaque entrée est marquée selon son statut dans BDB back office.
           Itérer à chaque découverte de manque.
```

---

## LÉGENDE

| Marqueur | Signification |
|---|---|
| `[KIT]` | Dans le kit harmonisé back office (doctrine §8) — à utiliser |
| `[DISPONIBLE]` | Disponible mais hors kit — usage ponctuel autorisé avec justification |
| `[INTERDIT BDB]` | Jamais utilisé dans BDB — incompatible avec la doctrine ou le contexte métier |
| `[SHELL]` | Utilisé uniquement par bdb-shell.js — ne pas réutiliser dans les modules |

---

# 1 — COMPOSANTS BOOTSTRAP 5.3.3

## 1.1 — Alerts `[KIT]`

Bandeau contextuel court à l'échelle de la page.

```html
<div class="alert alert-info" role="alert">...</div>
<div class="alert alert-warning" role="alert">...</div>
<div class="alert alert-danger" role="alert">...</div>
<div class="alert alert-success" role="alert">...</div>
<div class="alert alert-secondary" role="alert">...</div>
```

**BDB back office** : kit §8.2 brique 2 (alert bar). Jamais pour contenir des données.

## 1.2 — Badges `[KIT]`

Pour statuts, compteurs, étiquettes.

```html
<span class="badge text-bg-primary">admin</span>
<span class="badge text-bg-secondary">membre</span>
<span class="badge text-bg-success">approuvé</span>
<span class="badge text-bg-warning">en attente</span>
<span class="badge text-bg-danger">rejeté</span>
<span class="badge rounded-pill text-bg-info">info</span>
```

**BDB back office** : statuts DB (rôle, approbation, workflow).
**Règle** : préférer `text-bg-*` à `bg-*` pour garantir contraste WCAG AA.

## 1.3 — Breadcrumbs `[DISPONIBLE]`

```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Admin</a></li>
    <li class="breadcrumb-item active" aria-current="page">Tags</li>
  </ol>
</nav>
```

**BDB back office** : usage ponctuel pour sous-pages profondes (ex. atelier/tables/app-modules/edit).

## 1.4 — Buttons `[KIT]`

```html
<button class="btn btn-primary">Primaire</button>
<button class="btn btn-secondary">Secondaire</button>
<button class="btn btn-success">Succès</button>
<button class="btn btn-warning">Avertissement</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-light">Clair</button>
<button class="btn btn-dark">Sombre</button>
<button class="btn btn-link">Lien</button>

<!-- Outline -->
<button class="btn btn-outline-primary">...</button>
<button class="btn btn-outline-danger">...</button>

<!-- Tailles -->
<button class="btn btn-primary btn-sm">Petit</button>
<button class="btn btn-primary btn-lg">Grand</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Inactif</button>

<!-- Full width -->
<button class="btn btn-primary w-100">Pleine largeur</button>
```

**BDB back office** : primary (action principale), outline-secondary (action secondaire), outline-danger (action destructive).

## 1.5 — Button group `[DISPONIBLE]`

```html
<div class="btn-group" role="group">
  <button class="btn btn-outline-primary active">Jour</button>
  <button class="btn btn-outline-primary">Semaine</button>
  <button class="btn btn-outline-primary">Mois</button>
</div>
```

**BDB back office** : filtres segmentés (ex. période affichée).

## 1.6 — Cards `[KIT pilier]`

LE seul conteneur back office. 4 modifiers documentés §8.3.

```html
<!-- Neutre -->
<div class="card shadow-sm">
  <div class="card-body">...</div>
</div>

<!-- Titrée -->
<div class="card shadow-sm">
  <div class="card-header">Titre</div>
  <div class="card-body">...</div>
  <div class="card-footer">Footer optionnel</div>
</div>

<!-- Accent -->
<div class="card shadow-sm border-start border-4 border-primary">
  <div class="card-body">...</div>
</div>

<!-- Danger -->
<div class="card shadow-sm border-danger">
  <div class="card-header text-danger bg-danger bg-opacity-10">Zone sensible</div>
  <div class="card-body">...</div>
</div>
```

**BDB back office** : obligatoire pour toute donnée structurée (RÈGLE-BO-03).

## 1.7 — Carousel `[INTERDIT BDB]`

Non pertinent en contexte back office infirmière. Distrait.

## 1.8 — Close button `[KIT]`

```html
<button type="button" class="btn-close" aria-label="Close"></button>
```

**BDB back office** : modals, toasts, alerts dismissibles.

## 1.9 — Collapse `[DISPONIBLE]`

```html
<button class="btn btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#collapseExample">
  Afficher / Masquer
</button>
<div class="collapse" id="collapseExample">
  <div class="card card-body">Contenu repliable</div>
</div>
```

**BDB back office** : sections optionnelles longues (ex. détails avancés d'une fiche).

## 1.10 — Dropdowns `[KIT]`

```html
<div class="dropdown">
  <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
    Actions
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Éditer</a></li>
    <li><a class="dropdown-item" href="#">Dupliquer</a></li>
    <li><hr class="dropdown-divider"/></li>
    <li><a class="dropdown-item text-danger" href="#">Supprimer</a></li>
  </ul>
</div>
```

**BDB back office** : menu contextuel par ligne de table (actions multiples).
**Note** : le menu avatar bdb-shell n'utilise PAS Bootstrap dropdown (pattern custom `.bdb-user-menu` — incompatible sous-menu imbriqué).

## 1.11 — List group `[DISPONIBLE]`

```html
<ul class="list-group">
  <li class="list-group-item">Élément 1</li>
  <li class="list-group-item active">Élément actif</li>
  <li class="list-group-item disabled">Élément inactif</li>
</ul>

<!-- Flush (sans bordure externe) -->
<ul class="list-group list-group-flush">...</ul>
```

**BDB back office** : listes simples (noms, items) — préférer `data table` pour listes complexes avec colonnes.

## 1.12 — Modal `[KIT]`

```html
<div class="modal fade" id="exampleModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Titre</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">...</div>
      <div class="modal-footer">
        <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
        <button class="btn btn-primary">Valider</button>
      </div>
    </div>
  </div>
</div>
```

**BDB back office** : CRUD (nouveau, édition), confirmations destructives.
**Tailles** : `modal-sm` · `modal-lg` · `modal-xl` · `modal-dialog-scrollable` · `modal-fullscreen`.

## 1.13 — Nav / Tabs `[KIT]`

```html
<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item">
    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab1">Onglet 1</button>
  </li>
  <li class="nav-item">
    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab2">Onglet 2</button>
  </li>
</ul>

<div class="tab-content">
  <div class="tab-pane fade show active" id="tab1">...</div>
  <div class="tab-pane fade" id="tab2">...</div>
</div>

<!-- Variante pills -->
<ul class="nav nav-pills">...</ul>

<!-- Variante underline (BS 5.3+) -->
<ul class="nav nav-underline">...</ul>
```

**BDB back office** : `nav-tabs` uniquement (pas `nav-pills`). RÈGLE-BO-01.

## 1.14 — Navbar `[SHELL]`

Géré par bdb-shell.js. Ne pas utiliser dans les modules.

## 1.15 — Offcanvas `[SHELL]`

Géré par bdb-shell.js (sidebar aside-start). Ne pas réutiliser dans les modules.

## 1.16 — Pagination `[DISPONIBLE]`

```html
<nav aria-label="Page navigation">
  <ul class="pagination">
    <li class="page-item disabled"><span class="page-link">Précédent</span></li>
    <li class="page-item active"><span class="page-link">1</span></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">Suivant</a></li>
  </ul>
</nav>
```

**BDB back office** : tables volumineuses (>50 lignes). Préférer `range` Supabase côté backend.

## 1.17 — Placeholders `[KIT]`

Skeleton loaders — state LOADING.

```html
<div class="placeholder-glow">
  <span class="placeholder col-8"></span>
  <span class="placeholder col-4"></span>
</div>

<!-- Skeleton card complète -->
<div class="card placeholder-glow">
  <div class="card-body">
    <h5 class="card-title placeholder col-6"></h5>
    <p class="card-text">
      <span class="placeholder col-7"></span>
      <span class="placeholder col-4"></span>
    </p>
  </div>
</div>
```

**BDB back office** : kit §8.6 state loading. Préférer à `.spinner-border` sur chargements longs.

## 1.18 — Popovers `[DISPONIBLE]`

Tooltip étendu avec titre + corps. Nécessite init JS.

```html
<button class="btn btn-secondary"
        data-bs-toggle="popover"
        data-bs-title="Titre"
        data-bs-content="Contenu">Hover</button>
```

**BDB back office** : aide contextuelle ponctuelle — préférer tooltip pour raccourcir.

## 1.19 — Progress `[DISPONIBLE]`

```html
<div class="progress" role="progressbar" aria-label="Example">
  <div class="progress-bar" style="width:75%"></div>
</div>

<!-- Variantes -->
<div class="progress">
  <div class="progress-bar bg-success" style="width:60%"></div>
</div>

<!-- Animée striée -->
<div class="progress">
  <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:50%"></div>
</div>
```

**BDB back office** : avancement batch, import OPTIM, upload fichier.
**Note** : seule exception `style="width:x%"` autorisée (INTERDIT-C2).

## 1.20 — Scrollspy `[INTERDIT BDB]`

Non pertinent — les pages back office sont découpées en onglets, pas en sections longues scrollées.

## 1.21 — Spinners `[KIT]`

```html
<div class="spinner-border text-primary" role="status">
  <span class="visually-hidden">Chargement...</span>
</div>

<!-- Petit -->
<div class="spinner-border spinner-border-sm"></div>

<!-- Grow variant -->
<div class="spinner-grow text-primary"></div>
```

**BDB back office** : actions courtes (bouton submit). Pour chargement de données, préférer `placeholder` skeleton.

## 1.22 — Toasts `[KIT]`

Notifications transientes. Géré par `bdb-toast.js` (bdb-ui.js).

```javascript
bdbToast('Enregistré avec succès', 'success');
bdbToast('Erreur de chargement', 'error');
bdbToast('Attention', 'warning');
bdbToast('Info', 'info');
```

**BDB back office** : feedback d'action utilisateur (sauvegarde, suppression, erreur ponctuelle).

## 1.23 — Tooltips `[DISPONIBLE]`

Nécessite init JS.

```html
<button class="btn btn-secondary"
        data-bs-toggle="tooltip"
        data-bs-title="Aide contextuelle">?</button>
```

**BDB back office** : aide rapide sur icône ou bouton aux libellés courts.

---

# 2 — FORMULAIRES BOOTSTRAP 5.3.3

## 2.1 — Form controls `[KIT]`

```html
<div class="mb-3">
  <label for="inpName" class="form-label">Nom</label>
  <input type="text" class="form-control" id="inpName" placeholder="Saisir..."/>
  <div class="form-text">Texte d'aide.</div>
</div>

<!-- Tailles -->
<input class="form-control form-control-sm"/>
<input class="form-control form-control-lg"/>

<!-- Disabled / Readonly -->
<input class="form-control" disabled/>
<input class="form-control" readonly/>

<!-- Textarea -->
<textarea class="form-control" rows="3"></textarea>
```

## 2.2 — Select `[KIT]`

```html
<select class="form-select">
  <option value="">Choisir...</option>
  <option value="1">Option 1</option>
</select>

<!-- Multi -->
<select class="form-select" multiple>...</select>

<!-- Tailles -->
<select class="form-select form-select-sm">...</select>
```

## 2.3 — Checks / Switches / Radios `[KIT]`

```html
<!-- Check -->
<div class="form-check">
  <input class="form-check-input" type="checkbox" id="chk1"/>
  <label class="form-check-label" for="chk1">Libellé</label>
</div>

<!-- Switch -->
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="sw1"/>
  <label class="form-check-label" for="sw1">Actif</label>
</div>

<!-- Radio group -->
<div class="form-check">
  <input class="form-check-input" type="radio" name="r1" id="r1a"/>
  <label class="form-check-label" for="r1a">Option A</label>
</div>
<div class="form-check">
  <input class="form-check-input" type="radio" name="r1" id="r1b"/>
  <label class="form-check-label" for="r1b">Option B</label>
</div>

<!-- Inline -->
<div class="form-check form-check-inline">...</div>
```

## 2.4 — Range `[DISPONIBLE]`

```html
<input type="range" class="form-range" min="0" max="100" step="5"/>
```

**BDB back office** : rare — préférer input number ou select pour valeurs discrètes.

## 2.5 — Input group `[KIT]`

```html
<div class="input-group">
  <span class="input-group-text"><i class="bi bi-search"></i></span>
  <input type="search" class="form-control" placeholder="Rechercher..."/>
</div>

<div class="input-group">
  <input type="text" class="form-control"/>
  <button class="btn btn-outline-secondary">Valider</button>
</div>

<div class="input-group">
  <input type="number" class="form-control"/>
  <span class="input-group-text">€</span>
</div>
```

## 2.6 — Floating labels `[DISPONIBLE]`

```html
<div class="form-floating mb-3">
  <input type="email" class="form-control" id="flEmail" placeholder="name@example.com"/>
  <label for="flEmail">Email</label>
</div>
```

**BDB back office** : formulaires courts et élégants (login, modal simple). Pas pour formulaires complexes.

## 2.7 — Validation `[KIT]`

```html
<!-- Succès -->
<input class="form-control is-valid"/>
<div class="valid-feedback">Parfait !</div>

<!-- Erreur -->
<input class="form-control is-invalid"/>
<div class="invalid-feedback">Champ requis.</div>
```

---

# 3 — UTILITIES BOOTSTRAP 5.3.3

## 3.1 — Spacing `[KIT]`

```
m-{0-5|auto} : margin all sides
mt-{} mb-{} ms-{} me-{} mx-{} my-{} : margins directionnelles
p-{0-5} : padding all sides
pt-{} pb-{} ps-{} pe-{} px-{} py-{} : padding directionnel
gap-{0-5} : gap entre éléments flex/grid
```

Breakpoints : `mt-md-3`, `p-lg-4`, etc.

## 3.2 — Sizing `[KIT]`

```
w-{25|50|75|100|auto} : width en %
h-{25|50|75|100|auto} : height en %
mw-100 · mh-100       : max-width/height 100%
vw-100 · vh-100       : viewport width/height 100%
```

## 3.3 — Colors `[KIT]`

```
text-{primary|secondary|success|warning|danger|info|light|dark|body|muted|white}
text-{primary-emphasis|secondary-emphasis} (BS 5.3+)
bg-{primary|secondary|...|white|transparent}
bg-{primary-subtle|success-subtle|...} (BS 5.3+)
border-{primary|secondary|...}
```

## 3.4 — Flex `[KIT]`

```
d-flex · d-inline-flex
flex-row · flex-column · flex-row-reverse · flex-wrap · flex-nowrap
justify-content-{start|end|center|between|around|evenly}
align-items-{start|end|center|baseline|stretch}
align-self-{start|end|center|baseline|stretch}
flex-grow-{0|1} · flex-shrink-{0|1}
flex-fill : prend tout l'espace disponible
```

## 3.5 — Grid `[KIT]`

```
.container · .container-fluid · .container-{sm|md|lg|xl|xxl}
.row · .row-cols-{1-6} · .row-cols-md-{1-6}
.col · .col-{1-12} · .col-auto
.col-md-{1-12} · .col-lg-{1-12} · .col-xl-{1-12}
.g-{0-5} · .gx-{0-5} · .gy-{0-5} (gutters)
.offset-{md|lg}-{1-11}
.order-{first|last|0-5}
```

**BDB back office** : unique doctrine `.row.g-3` + `.col-12.col-md-6.col-lg-{3|4|6}`.

## 3.6 — Text `[KIT]`

```
text-{start|end|center} · text-{md-start|md-end|md-center}
text-{lowercase|uppercase|capitalize}
text-break · text-wrap · text-nowrap · text-truncate
fw-{light|normal|medium|semibold|bold|bolder}
fs-{1-6}
lh-{1|sm|base|lg}
font-monospace
```

## 3.7 — Display `[KIT]`

```
d-none · d-block · d-inline · d-inline-block · d-flex · d-grid · d-table
d-{sm|md|lg|xl}-none · d-md-block · d-lg-flex
```

## 3.8 — Borders `[KIT]`

```
border · border-{0-5}
border-{top|end|bottom|start|top-0|...}
border-{primary|...|danger}
border-{1-5} (épaisseur BS 5.3+)
rounded · rounded-{0|1|2|3|4|5|circle|pill}
rounded-{top|end|bottom|start}
shadow · shadow-sm · shadow-lg · shadow-none
```

## 3.9 — Position `[KIT]`

```
position-{static|relative|absolute|fixed|sticky}
top-{0|50|100} · start-{0|50|100} · end-{0|50|100} · bottom-{0|50|100}
translate-middle · translate-middle-x · translate-middle-y
```

## 3.10 — Overflow `[KIT]`

```
overflow-{auto|hidden|scroll|visible}
overflow-x-{auto|hidden|scroll|visible} (BS 5.3+)
```

## 3.11 — Visibility / Opacity `[KIT]`

```
visible · invisible
opacity-{0|25|50|75|100}
```

## 3.12 — ARIA / Accessibilité `[KIT]`

```
visually-hidden · visually-hidden-focusable
```

---

# 4 — BOOTSTRAP ICONS 1.11.1

Catalogue complet : https://icons.getbootstrap.com/

Usage :
```html
<i class="bi bi-check-circle"></i>
<i class="bi bi-pencil me-1"></i>Éditer
<i class="bi bi-trash text-danger"></i>
```

**BDB back office** : icônes récurrentes :

| Usage | Icône |
|---|---|
| Dashboard / vue d'ensemble | `bi-speedometer2` |
| Utilisateurs | `bi-people` · `bi-person-lines-fill` |
| Recherche | `bi-search` |
| Édition | `bi-pencil` · `bi-pencil-square` |
| Suppression | `bi-trash` |
| Ajout | `bi-plus-lg` · `bi-plus-circle` |
| Validation | `bi-check-lg` · `bi-check-circle` |
| Avertissement | `bi-exclamation-triangle` |
| Erreur | `bi-x-circle` · `bi-x-octagon` |
| Info | `bi-info-circle` |
| Admin | `bi-shield-lock` · `bi-shield-check` |
| Créateur | `bi-tools` (atelier) · `bi-eyeglasses` (conseil) |
| Supervision | `bi-binoculars` · `bi-activity` |
| Tags | `bi-tags` · `bi-tag` |
| Catégories | `bi-folder` · `bi-diagram-3` |
| Tables | `bi-table` · `bi-grid-3x3-gap` |
| Date | `bi-calendar` · `bi-calendar-event` |
| Téléchargement | `bi-download` · `bi-upload` |
| Connexion | `bi-box-arrow-in-right` |
| Déconnexion | `bi-box-arrow-right` |
| Actualiser | `bi-arrow-clockwise` |
| Paramètres | `bi-gear` · `bi-sliders` |
| Notifications | `bi-bell` · `bi-bell-fill` |
| Graphique | `bi-graph-up` · `bi-bar-chart` |
| État vide | `bi-inbox` · `bi-folder2-open` |

---

# 5 — CLASSES SMARTY V5 (theme-base.css)

theme-base.css @63905396 compilé BDB contient ~945 sélecteurs. Catalogue partiel
— à enrichir par audit complet à la prochaine session.

## 5.1 — Layout shell `[SHELL]`

```
#wrapper · #wrapper_content · #middle
aside.aside-start · aside.js-aside-show
.btn-sidebar-toggle
.nav-title · .nav-item.active (overrides injectés par shell v2.2.0)
.bdb-user-menu · .bdb-user-menu-item · .bdb-user-menu-header
.bdb-preview-trigger · .bdb-preview-subitem
```

**Règle** : ces classes sont injectées/stylées par bdb-shell.js. Ne pas les redéfinir dans les modules.

## 5.2 — Couleurs thème (CSS vars)

```
--bs-primary        : couleur principale
--bs-primary-rgb    : version RGB (utilisée pour rgba)
--bs-secondary      : couleur secondaire
--bs-body-bg        : fond du body
--bs-body-color     : couleur de texte par défaut
--bs-border-color   : couleur de bordure
```

**BDB back office** : `data-shell-kind="backoffice"` sur body ajuste le fond header violet pâle #faf5ff et la sidebar violet nuit #1e1b2e via CSS injecté par shell v2.2.0.

## 5.3 — Classes Smarty identifiées `[DISPONIBLE]`

À auditer exhaustivement à la prochaine session. Marqueurs connus :
```
.app-nom            : injecté par bdb-shell.js — nom de l'instance
.loading-spinner    : spinner layout Smarty
.page-title         : alternative à h1/h3 (à vérifier cohérence)
```

---

# 6 — CLASSES BDB CUSTOM (js/bdb-ui.js)

Helpers injectés en runtime :

```
bdbToast(msg, type)        : toast notification
bdbConfirm(opts)           : modal de confirmation
bdbShellReady              : promesse résolue quand shell chargé
window.bdbUser             : contrat utilisateur (isDemo/isMember/isAdmin/isCreator)
window.bdbApp              : contrat app (nom/nomCourt/couleur/logo)
```

**BDB back office** : à utiliser en priorité pour les actions standard.

---

# 7 — TABLEAU DE CORRESPONDANCE RAPIDE

Quand tu as un besoin fréquent, va chercher ici avant de créer du CSS custom.

| Besoin | Solution kit | Alternative hors kit |
|---|---|---|
| Afficher un compteur | KPI block §8.5 (card + display-6) | — |
| Lister des users/items | Data table §8.5 (card + table-hover) | list-group (simple) |
| Filtrer une liste | Toolbar filtres §8.5 | input-group (si un seul champ) |
| Structurer en onglets | Nav tabs §8.2 | accordion (rare) |
| Mettre en garde | Alert bar §8.2 ou card danger §8.3 | badge text-bg-warning (inline) |
| Zone destructive | Card danger §8.3 | modal confirmation |
| Mise en avant doctrine | Card accent §8.3 | blockquote (rare) |
| Afficher du loading | Placeholder §8.6 | spinner-border (bouton) |
| État vide | Card empty §8.6 | alert-secondary inline |
| Notification transient | `bdbToast()` | alert dismissible (persistant) |
| Confirmation avant action | `bdbConfirm()` | modal BS natif |
| Recherche instantanée | input-group + form-control type=search | — |
| Statut d'un user | badge text-bg-{success/warning/danger} | text-{success/...} (texte seul) |
| Action sur ligne table | btn-sm btn-outline-secondary (dans `<td class="text-end">`) | dropdown actions |

---

# 8 — CE QUI MANQUE ET DEVRA ÊTRE AJOUTÉ

Placeholder pour itérations futures.

```
V1.1.0 candidats :
- Audit exhaustif theme-base.css @63905396 (945 sélecteurs classés)
- Patterns Smarty V5 html_admin sources locales (accessibles Claude Code)
- Micro-interactions (hover states card, transitions nav-tabs)
- Composants date-picker / time-picker (absents BS natif)
- Composants autocomplete / typeahead (absents BS natif)
- Composants file-upload drag & drop avancé
- Composants tree-view (hiérarchies)
- Charts / graphs (Chart.js en fallback disponible — voir artifacts support BDB)
```

---

## HISTORIQUE

```
2026-04-17 — V1.0.0  Création. Session #90.
             Catalogue Bootstrap 5.3.3 complet par familles.
             Marquage [KIT] / [DISPONIBLE] / [INTERDIT BDB] / [SHELL].
             Tableau correspondance besoin → classe.
             Placeholder §8 pour itérations (theme-base.css audit complet à faire).
```
