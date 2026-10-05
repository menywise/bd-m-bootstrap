# SKILL : dbm-conformity-audit

## Declencheur

Declencher AVANT toute livraison de module migre vers DBM, APRES toute modification de fichier HTML/JS/CSS d'un module DBM, et sur demande explicite d'audit de conformite.

Declencher aussi sur : "audit DBM", "conformite DBM", "verifier le module", "migration DBM", "template demo", "app-icon-btn", "btn-xs", "est-ce conforme", "structure page", "zones DBM", "avant deploiement DBM", "checker le module", "comparaison template".

## Source de verite

**Fichier canonique** : `createur/atelier/template-module-demo.html`

Tout composant visible dans le template demo est le pattern attendu. Si le module utilise un pattern different, c'est un ecart a justifier ou corriger.

**Module de reference** : le glossaire (`modules/glossaire/`) — premier module migre, valide par Manu.

## Hierarchie de conformite

```
template-module-demo.html (source de verite absolue)
  > glossaire (reference d'implementation)
    > module cible (a auditer)
```

Si glossaire differe du template demo → le module cible doit suivre le template demo, pas le glossaire.

## Zones a auditer (dans cet ordre)

### Z1. Chaine CSS (head)

**Pattern attendu :**
```html
<link href="...bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
<link href="...bootstrap-icons@1.11.1/font/bootstrap-icons.css"/>
<link href="../../css/dbm-theme.css"/>
<link href="../../css/bdb-ui-kit.css"/>
<link href="[module]-ui.css"/>
```

**Interdit** : theme-base.css, cds-overrides.css, @latest, CDN non fige.

**Grep de verification** :
```bash
grep -n "theme-base\|cds-overrides\|@latest" modules/[module]/index.html
# Attendu : 0 resultats
```

### Z2. Shell (#bdb-shell)

**Pattern attendu :**
```html
<div id="bdb-shell"
     data-module-title="..."
     data-module-icon="bi-..."
     data-root-path="../../"
     data-login-mode="modal"
     data-shell-theme="dbm">
</div>
```

**Interdit** : `data-shell-kind` (reserve aux pages createur/atelier).

**Grep** :
```bash
grep -n "data-shell-kind" modules/[module]/index.html
# Attendu : 0 resultats
```

### Z3. Structure page

**Hierarchie attendue :**
```
body.sidebar-closed
  > #wrapper
    > #bdb-shell (INTERDIT-E1 : premier enfant)
    > #wrapper_content
      > .app-layout
        > main.app-main#main-content
          > .app-content
            > [contenu module]
          > /app-content
          > footer.app-footer
        > /main
      > /app-layout
    > /wrapper_content
  > /wrapper
  > modales (body-level)
  > scripts
```

**Verification div balance** :
```bash
grep -c "<div" modules/[module]/index.html
grep -c "</div>" modules/[module]/index.html
# Les deux nombres doivent etre egaux
```

### Z4. Breadcrumb

**Pattern :**
```html
<nav class="app-breadcrumb" aria-label="Fil d'Ariane">
  <a href="../../index.html">Accueil</a>
  <span class="app-breadcrumb-sep"><i class="bi bi-chevron-right"></i></span>
  <span>[Nom module]</span>
</nav>
```

### Z5. Page title (h1)

**Pattern :**
```html
<div class="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
  <div>
    <h1 style="font-size:1.5rem;font-weight:700;margin:0">[Titre]</h1>
    <p style="font-size:.85rem;color:var(--app-text-muted);margin:.25rem 0 0">[Sous-titre]</p>
  </div>
</div>
```

### Z6. Data Card (card principale avec tabs)

**Pattern :**
```html
<div class="app-card">
  <div class="app-card-header" style="padding-bottom:0">
    <ul class="nav bdb-tabs ...">...</ul>
  </div>
  <div class="app-card-body" style="padding:0">
    <div class="tab-content">
      <div class="tab-pane fade show active" ...>...</div>
    </div>
  </div>
</div>
```

**Regle critique** : `app-card-body` DOIT avoir `style="padding:0"` quand il contient un `tab-content`. Chaque tab-pane gere son propre padding.

### Z7. Filtres / Barre de recherche

**Pattern demo (dans tab-pane) :**
```html
<div class="[module]-search-bar px-3 py-3 mb-3">
  <div class="row g-2 align-items-end">
    <div class="col-12 col-md-5">
      <label class="form-label small fw-semibold text-muted mb-1">
        <i class="bi bi-search me-1"></i>Recherche
      </label>
      <div class="input-group input-group-sm">
        <input type="search" class="form-control" placeholder="..." autocomplete="off"/>
        <button class="btn btn-outline-secondary" type="button" aria-label="Effacer">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
    <!-- selects form-select form-select-sm -->
    <div class="col-6 col-md-1 d-flex align-items-end">
      <button class="btn btn-outline-secondary btn-sm w-100" type="button" title="Reset">
        <i class="bi bi-arrow-counterclockwise"></i>
      </button>
    </div>
  </div>
  <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
    <small class="text-muted"><span class="fw-semibold text-dark">[N]</span> resultat(s)</small>
  </div>
</div>
```

### Z8. Boutons d'action dans les tableaux

**REGLE FONDAMENTALE — 2 patterns exclusifs :**

| Contexte | Pattern | Source demo |
|---|---|---|
| Action icon-only dans cellule de tableau (voir, modifier, supprimer) | `<a class="app-icon-btn" title="..." role="button"><i class="bi bi-..."></i></a>` | L472-476 |
| Bouton avec texte (Lier, Delier, CSV, Exporter) | `<button class="btn btn-xs btn-outline-[color]" type="button">...</button>` | L246 |

**Wrapper pour cellule d'actions :**
```html
<td style="text-align:right">
  <div style="display:flex;gap:4px;justify-content:flex-end">
    <a class="app-icon-btn" title="Voir" role="button"><i class="bi bi-eye"></i></a>
    <a class="app-icon-btn" title="Modifier" role="button"><i class="bi bi-pencil"></i></a>
  </div>
</td>
```

**Variantes disponibles :**
- `app-icon-btn` : defaut (hover primary) — dbm-theme.css
- `app-icon-btn--danger` : hover rouge — dbm-theme.css
- `app-icon-btn--success` : hover vert — [module]-ui.css
- `app-icon-btn--warning` : hover amber — [module]-ui.css

**Grep de verification :**
```bash
# Chercher des btn-xs/btn-sm dans les cellules d'action ICON-ONLY
grep -n "btn btn-xs\|btn btn-sm" modules/[module]/*.js | grep -v "me-1\">.*[A-Za-z]" 
# Les resultats restants ne doivent contenir QUE des boutons avec texte visible
```

**Interdit** : `btn btn-xs btn-outline-*` pour un bouton icon-only dans un tableau.

### Z9. Tableaux

**Pattern :**
```html
<div class="table-responsive">
  <table class="app-table">
    <thead>
      <tr>
        <th>...</th>
        <th class="text-end">Actions</th>
      </tr>
    </thead>
    <tbody>...</tbody>
  </table>
</div>
```

**Regle** : la colonne Actions est TOUJOURS la derniere. Son label est toujours "Actions" (pas "Detail", pas "Action").

**Consistance** : si un module a N tableaux (ex: Consultation + Admin), l'ordre des colonnes communes DOIT etre identique.

**Interdit** : `position: sticky` sur `thead th`. Les tables ne scrollent JAMAIS verticalement — elles paginent. Sticky thead = inutile + non WCAG.

**Grep de verification :**
```bash
# G10. Sticky thead interdit sur tables
grep -rn "sticky\|thead-sticky\|table-sticky" modules/[module]/
# Attendu : 0 resultats
```

### Z10. Pagination

**Obligatoire** : toute table avec plus de N lignes DOIT paginer. Jamais de scroll vertical (`max-height` + `overflow-y`) sur un conteneur de table.

**2 patterns valides** (template demo montre les deux) :

1. **DBM natif** : `app-card-footer > app-pagination > button.app-page-btn`
2. **BS natif** : `ul.pagination.pagination-sm > li.page-item > button.page-link`

Choisir un et le garder dans tout le module. Ne pas mixer.

### Z11. 3 Etats DOM (C.9)

**Obligatoire pour toute zone async :**

```html
<!-- Loading -->
<div class="text-center text-muted py-4">
  <div class="spinner-border spinner-border-sm me-2" role="status"></div>Chargement...
</div>

<!-- Empty -->
<div class="app-empty">
  <i class="bi bi-inbox"></i>
  <p style="font-size:.85rem">Aucun resultat.</p>
</div>

<!-- Error -->
<div class="app-empty">
  <i class="bi bi-exclamation-triangle" style="color:var(--app-danger,#dc3545)"></i>
  <p style="color:var(--app-danger,#dc3545);font-size:.85rem">[message]</p>
  <button class="btn btn-sm btn-outline-danger"><i class="bi bi-arrow-clockwise me-1"></i>Reessayer</button>
</div>
```

### Z12. Footer

**Obligatoire dans main, apres app-content :**
```html
<footer class="app-footer">
  <small class="text-muted">&copy; 2026 <span class="app-nom"></span></small>
</footer>
```

### Z13. Chaine JS (scripts, ordre immuable)

```html
<script src="...bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="...@supabase/supabase-js@2/..."></script>
<script src="../../js/supabase-client.js"></script>
<script src="../../js/bdb-ui.js"></script>
<script src="../../js/bdb-invite-guard.js"></script>
<script src="../../js/bdb-shell.js"></script>
<script src="[module]-app.js"></script>
```

## Procedure d'audit

1. **Lire** template-module-demo.html (source de verite)
2. **Lire** le module cible (index.html + [module]-app.js + [module]-ui.css)
3. **Pour chaque zone Z1-Z13** : comparer, noter OK / ECART / N/A
4. **Produire le tableau de conformite** avec priorite (P1/P2/P3)
5. **Ne corriger QU'APRES** validation du tableau par Manu (sauf ecarts P1 evidents)

## Greps de verification rapide (copier-coller)

```bash
# G1. CSS interdites
grep -rn "theme-base\|cds-overrides\|@latest" modules/[module]/

# G2. Shell-kind interdit
grep -n "data-shell-kind" modules/[module]/index.html

# G3. Boutons icon-only non conformes dans JS
grep -n "btn btn-xs\|btn btn-sm" modules/[module]/*.js

# G4. innerHTML sans escHtml
grep -n "innerHTML.*+" modules/[module]/*.js | grep -v "escHtml\|_esc\|textContent"

# G5. console.log residuel
grep -n "console\.log" modules/[module]/*.js

# G6. Balance des div
echo "Ouvertures: $(grep -c '<div' modules/[module]/index.html)"
echo "Fermetures: $(grep -c '</div>' modules/[module]/index.html)"

# G7. Footer present
grep -n "app-footer" modules/[module]/index.html

# G8. padding:0 sur app-card-body contenant tab-content
grep -A1 "app-card-body" modules/[module]/index.html | head -4
```

### Z14. CSS Variables (couleurs)

**Regle** : tout [module]-ui.css DOIT utiliser des CSS variables pour les couleurs structurelles (bordures, fonds, textes). Les hex bruts sont reserves aux couleurs semantiques (badges type, pareto, rangs, terminal).

**Variables autorisees** (sources : dbm-theme.css + bdb-ui-kit.css) :
- Fonds : `var(--app-card-bg)`, `var(--bdb-bg)`, `var(--bdb-bg-alt)`, `var(--bs-secondary-bg)`
- Bordures : `var(--bdb-border)`, `var(--app-border)`, `var(--bs-border-color)`
- Texte : `var(--app-text)`, `var(--app-text-muted)`, `var(--bdb-text)`, `var(--bdb-text-light)`
- Primaire : `var(--bs-primary)`, `rgba(var(--bdb-primary-rgb),.[XX])`
- Subtles : `var(--bdb-blue-subtle)`, `var(--bdb-green-subtle)`, `var(--bdb-amber-subtle)`, `var(--bdb-cyan-subtle)`, `var(--bdb-purple-subtle)`
- Semantiques : `var(--bdb-purple)`, `var(--bdb-success)`, `var(--bdb-info-dark)`, `var(--bs-warning)`

**Grep de verification :**
```bash
# G9. Couleurs hex structurelles dans [module]-ui.css (hors badges semantiques)
grep -n "#[0-9a-fA-F]\{3,6\}" modules/[module]/[module]-ui.css | grep -v "badge\|pareto\|rank\|log-\|icon\.\|compare-col"
# Chaque resultat doit etre justifie (semantique) ou migre vers var(--)
```

## Anti-patterns (ne JAMAIS faire)

| Anti-pattern | Pattern correct |
|---|---|
| `<button class="btn btn-xs btn-outline-secondary"><i class="bi bi-eye"></i></button>` dans td | `<a class="app-icon-btn" title="Voir" role="button"><i class="bi bi-eye"></i></a>` |
| `app-card-body` avec padding par defaut contenant tab-content | `app-card-body style="padding:0"` |
| `data-shell-kind="backoffice"` sur un module | Supprimer — reserve createur/atelier |
| Colonnes dans un ordre different entre onglets du meme module | Ordre identique partout |
| Label "Detail" ou "Action" (singulier) pour la colonne actions | "Actions" (pluriel) |
| Mixer `app-icon-btn` et `btn btn-xs` pour le meme type de bouton dans un meme onglet | Un seul pattern par contexte |
| `background:#f8fafc` ou `color:#6c757d` dans un CSS module | `background:var(--bdb-bg)` / `color:var(--app-text-muted)` |
| `position:sticky` sur `thead th` ou `max-height` + `overflow-y` sur conteneur table | Pagination obligatoire — tables ne scrollent jamais |
| `thes-thead-sticky` ou `app-table-sticky` ou toute classe sticky thead | Supprimer — paginer a la place |
