# CATALOGUE KIT BO V5 — CLASSES .bo-* DISPONIBLES

```
SOURCE  : cds-overrides.css v2.0.5 (63905396 — commit figé)
DATE    : 2026-04-19
OBJET   : Liste exhaustive des classes Kit BO + mappings de migration
          pour classes custom (ccam, memo, sia…) vers BO + Bootstrap natif.
```

## Classes globales (scope body racine)

| classe | usage |
|---|---|
| `.bo-accent-primary` | Bordure gauche + header tint primary (appliqué sur `.bo-card` ou sur `.card`) |
| `.bo-accent-secondary` | Idem secondary |
| `.bo-accent-success` | Idem success |
| `.bo-accent-danger` | Idem danger (bordure rouge, utilisée pour erreur/denied) |
| `.bo-accent-warning` | Idem warning |
| `.bo-accent-info` | Idem info |
| `.bo-header-tint` | Fond card-header teinté en couleur primaire (utilisé sur `.card-header`) |
| `.bo-hover` | Ombre hover (utilisé sur `.bo-card`) |
| `.bo-avatar-sm` | Petit avatar (modifier) |
| `.bo-avatar-lg` | Grand avatar (modifier) |
| `.bo-avatar-grad-1..6` | 6 gradients d'avatar |
| `.bo-icon-sm` | Petite icône (modifier) |
| `.bo-icon-lg` | Grande icône (modifier) |

## Classes scopées (requièrent body.bdb-shell-backoffice)

**Important** : ces classes ne fonctionnent QUE si `data-shell-kind="backoffice"`
est sur `#bdb-shell` (le shell ajoute la classe `bdb-shell-backoffice` au `<body>`).

| classe | usage type |
|---|---|
| `.bo-auth-overlay` | Overlay fullscreen auth required (position fixed, inset 0) |
| `.bo-avatar` | Avatar circulaire (utilisateur, contributeur) |
| `.bo-card` | Card avec ombre premium + radius — **remplace Bootstrap .card par défaut** |
| `.bo-icon-badge` | Badge carré avec icône centrée (utilisé dans KPIs) |
| `.bo-kpi-label` | Label KPI (small, uppercase, muted) |
| `.bo-kpi-value` | Valeur KPI (h3, fw-bold) |
| `.bo-kpi-trend` | Tendance KPI (small, avec icône) |
| `.bo-state-icon` | Icône d'état (rond, background subtle, utilisé dans empty/error/denied/auth) |
| `.bo-table` | Table avec styles premium (utilisé sur `.table`) |
| `.bo-tabs` | Onglets avec styles premium (utilisé sur `.nav`) |

## Mappings migration — T-02 Option B

Quand un JS génère du HTML avec des classes custom (`.pill`, `.card-orphelin`,
`.cand-label`, `.cr`, `.ccam-val-num`…), il faut migrer le `innerHTML` du JS
vers ces équivalents Kit BO / Bootstrap natif.

### Cas ccam-validator-app.js

| AVANT (custom) | APRÈS (Kit BO + BS natif) |
|---|---|
| `<div class="card card-orphelin">` | `<div class="card bo-card mb-2">` |
| `<div class="card card-orphelin has-cand">` | `<div class="card bo-card bo-accent-success mb-2">` |
| `<div class="card card-orphelin no-cand">` | `<div class="card bo-card bo-accent-danger mb-2">` |
| `<div class="card card-orphelin has-sel">` | `<div class="card bo-card bo-accent-primary mb-2">` |
| `<label class="cand-label">` | `<label class="d-flex gap-2 align-items-start p-2 border rounded">` |
| `<label class="cand-label selected">` | `<label class="d-flex gap-2 align-items-start p-2 border border-success rounded bg-success-subtle">` |
| `<label class="cand-label none-label">` | `<label class="d-flex gap-2 align-items-start p-2 border rounded text-muted bg-light">` |
| `<input class="cr">` | `<input class="form-check-input flex-shrink-0 mt-1">` |
| `<span class="pill">` | `<span class="badge text-bg-light border">` |
| `<span class="pill match">` | `<span class="badge text-bg-success">` |
| `<span class="ccam-val-num">#42</span>` | `<span class="small fw-bold text-muted">#42</span>` |

### Cas générique (autres modules)

| Pattern custom commun | Remplacement |
|---|---|
| `<div class="xxx-state-center">` (wrapper flex centré) | `<div class="card bo-card"><div class="card-body text-center py-5">` |
| `<i class="xxx-state-icon">` | Utiliser `.bo-state-icon` + classe couleur `bg-*-subtle text-*` |
| `<div class="xxx-auth-overlay">` (custom fullscreen) | `<div class="bo-auth-overlay">` avec `.card.bo-card.bo-accent-primary` à l'intérieur |
| `<button class="xxx-btn-primary">` | `<button class="btn btn-primary">` (Bootstrap natif suffit) |
| `<div class="xxx-toolbar">` (sticky top) | `<div class="card bo-card mb-4">` + toolbar interne en `.card-body` |
| Couleurs variables custom (`--xxx-accent`) | Utilitaires BS (`text-primary`, `text-success`, `border-warning`…) |

## Classes BANNIES (§9.1 rappel)

| classe | pourquoi bannie |
|---|---|
| `.at-*`, `.atl-*` | Préfixes ancien atelier (avant V3) |
| `.cs-*`, `.conseil-*` | Préfixes ancien conseil (avant V3) |
| `.supv-*`, `.sup-*` | Préfixes ancien supervision |
| `.text-purple` | Couleur hardcodée obsolète — utiliser `.text-primary` |
| `.stat-card-value`, `.danger-zone-card` | Classes custom non documentées |
| Tout `*-ui.css` custom | T-02 Option B — banni en back-office |

## Règle cardinale T-02 (rappel)

> Zéro CSS module custom en back-office. Les classes utilisées par le JS en
> innerHTML doivent être **migrées** vers Kit BO + Bootstrap natif **dans la
> même session** que le HTML. Un JS qui produit `<div class="card-orphelin">`
> doit être refondu en `<div class="card bo-card bo-accent-...">`.

## Règle cardinale S#95 IDs préfixés (rappel)

> IDs HTML obligatoirement préfixés par le nom court du module :
> - `cv-*` pour ccam-validator
> - `ccam-*` pour ccam
> - `memo-*` pour memo
> - `ov-*` pour overview
> - `diag-*` pour diagnostic
> - `sa-*` pour schema-audit
> - `sia-*` pour session-ia
> - `gf-*` pour glossaire-feeder
> - `at-*` pour atelier portail (index.html)
> - `cs-*` pour conseil (usage conseil-app.js existant)
>
> Seuls `#wrapper`, `#wrapper_content`, `#middle`, `#bdb-shell` sont réservés
> (structure shell) et ne suivent pas la règle de préfixe.
