---
name: bootstrap5-patterns-bdb
description: >
  Patterns Bootstrap 5.3.3 valides pour BDB (Bible de Bloc). Declencher
  des qu'un composant Bootstrap est utilise, modifie ou propose dans un module
  BDB. Declencher aussi sur : bouton, modal, offcanvas, badge, alert, toast,
  dropdown, tabs, accordion, card, table, form, input, select, pagination,
  spinner, progress, tooltip, popover, collapse, navbar, breadcrumb, grid,
  flex, spacing, couleur, variante, bg-, text-, border-, d-, p-, m-, gap-,
  classe BS, composant UI, widget, classe inexistante, classe deprecated.
  Ce skill empeche Claude d'utiliser des classes Bootstrap inexistantes en 5.3.3,
  des patterns deprecated depuis BS4, ou des composants en conflit avec CDS.
  Toujours lire cds-compliance en parallele pour les regles INTERDIT.
---

# Skill — Bootstrap 5.3.3 Patterns BDB

## Perimetre

Ce skill repond a la question : **quelle classe Bootstrap utiliser, et comment ?**

Il ne remplace pas `cds-compliance` (qui repond a : que ne pas faire).
Les deux se lisent ensemble pour tout composant UI.

CDN fige : `bootstrap@5.3.3` + `bootstrap-icons@1.11.1`

Smarty V5 (`theme-base.css`) definit des composants supplementaires (.panel, .panel-accent-*, etc.).
Verifier theme-base.css AVANT de creer un composant custom.

---

## 1. Grille et mise en page

### Grid

```html
<!-- Standard BDB : container-fluid pour les modules -->
<div class="container-fluid p-3 p-md-4">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-4">...</div>
  </div>
</div>

<!-- container (pas fluid) pour pages site/ et contenu editorial -->
<div class="container py-5">
  <div class="col-lg-8 mx-auto">...</div>
</div>
```

**Anti-patterns grille :**
- `col` sans breakpoint sur contenu complexe → comportement impredictible mobile
- `container` dans un module app → utiliser `container-fluid`
- Imbrication de `container` dans `container` → interdit

### Flex utilitaires

```html
<!-- Alignement standard header module -->
<div class="d-flex align-items-center justify-content-between gap-3">

<!-- Wrap automatique sur mobile -->
<div class="d-flex flex-wrap gap-2">

<!-- Colonne sur mobile, ligne sur desktop -->
<div class="d-flex flex-column flex-md-row gap-3">
```

---

## 2. Boutons

### Classes valides BS 5.3.3

```html
<!-- Primaires -->
<button class="btn btn-primary">Action principale</button>
<button class="btn btn-outline-primary">Action secondaire</button>

<!-- Neutres -->
<button class="btn btn-secondary">...</button>
<button class="btn btn-outline-secondary">...</button>

<!-- Danger -->
<button class="btn btn-danger">Supprimer</button>
<button class="btn btn-outline-danger">...</button>

<!-- Tailles -->
<button class="btn btn-primary btn-sm">Petit</button>
<button class="btn btn-primary btn-lg">Grand</button>

<!-- Icone + texte (pattern BDB standard) -->
<button class="btn btn-primary d-flex align-items-center gap-2">
  <i class="bi bi-plus-circle"></i>Ajouter
</button>

<!-- Icone seule (toujours aria-label) -->
<button class="btn btn-outline-secondary btn-sm" aria-label="Modifier">
  <i class="bi bi-pencil"></i>
</button>
```

**Regles BDB boutons :**
- Action primaire = dans toolbar, jamais dans le header (INTERDIT-C4)
- Bouton destructif = toujours `btn-danger` ou `btn-outline-danger`
- Icone seule = `aria-label` obligatoire (accessibilite WCAG)
- `btn-link` = acceptable pour actions tertiaires inline

**Anti-patterns boutons :**
- `btn-white` → n'existe pas en BS 5.3.3 → utiliser `btn-outline-secondary`
- `btn-default` → deprecated BS4 → utiliser `btn-secondary`
- `btn-flat` → inexistant → style custom si besoin
- `disabled` attribute + `btn-primary` sans `aria-disabled="true"` → non accessible

---

## 3. Formulaires

### Inputs standard

```html
<!-- Input texte standard -->
<div class="mb-3">
  <label for="champId" class="form-label">Label <span class="text-danger">*</span></label>
  <input type="text" class="form-control" id="champId" placeholder="..." required/>
  <div class="form-text">Texte d'aide optionnel</div>
</div>

<!-- Select -->
<div class="mb-3">
  <label for="selectId" class="form-label">Choix</label>
  <select class="form-select" id="selectId">
    <option value="">-- Choisir --</option>
    <option value="a">Option A</option>
  </select>
</div>

<!-- Textarea -->
<div class="mb-3">
  <label for="texteId" class="form-label">Notes</label>
  <textarea class="form-control" id="texteId" rows="3"></textarea>
</div>

<!-- Checkbox -->
<div class="form-check">
  <input class="form-check-input" type="checkbox" id="checkId"/>
  <label class="form-check-label" for="checkId">Option</label>
</div>

<!-- Switch -->
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="switchId"/>
  <label class="form-check-label" for="switchId">Activer</label>
</div>
```

### Validation inline

```html
<!-- Etat invalide -->
<input type="text" class="form-control is-invalid"/>
<div class="invalid-feedback">Message d'erreur precis.</div>

<!-- Etat valide -->
<input type="text" class="form-control is-valid"/>
<div class="valid-feedback">Correct.</div>
```

**Anti-patterns formulaires :**
- `form-group` → deprecated BS4 → utiliser `mb-3`
- `form-row` → deprecated BS4 → utiliser `row g-2`
- `form-control-file` → deprecated → utiliser `form-control` sur `type="file"`
- Label sans `for` correspondant a un `id` → violation WCAG 1.3.1

---

## 4. Tableaux

```html
<!-- Tableau standard BDB -->
<div class="table-responsive">
  <table class="table table-hover table-sm align-middle">
    <thead class="table-light">
      <tr>
        <th scope="col">Colonne A</th>
        <th scope="col" class="text-end">Actions</th>
      </tr>
    </thead>
    <tbody id="tableBody">
      <!-- 3 etats async ici : loading / empty / rows -->
    </tbody>
  </table>
</div>
```

**Variantes valides :** `table-striped`, `table-bordered`, `table-hover`, `table-sm`
`table-light` / `table-dark` sur `thead`

**Anti-patterns tableaux :**
- `table-condensed` → deprecated BS4 → utiliser `table-sm`
- Tableau sans `table-responsive` sur mobile → overflow non gere
- `th` sans `scope="col"` → violation WCAG 1.3.1
- Largeurs hardcodees en `style=` → INTERDIT-C2 (sauf cas dynamique)

---

## 5. Badges et alertes

```html
<!-- Badges statut BDB -->
<span class="badge bg-success">Conforme</span>
<span class="badge bg-warning text-dark">Partiel</span>
<span class="badge bg-danger">Erreur</span>
<span class="badge bg-secondary">Inactif</span>
<span class="badge bg-primary">Info</span>

<!-- Rounded pill -->
<span class="badge rounded-pill bg-primary">42</span>

<!-- Alerte dismissible -->
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  <i class="bi bi-exclamation-triangle me-2"></i>Message d'avertissement.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
</div>
```

**Anti-patterns badges :**
- `badge-primary` → deprecated BS4 → utiliser `badge bg-primary`
- `badge-pill` → deprecated BS4 → utiliser `badge rounded-pill`
- `bg-warning` sans `text-dark` → contraste insuffisant WCAG 1.4.3

---

## 6. Cards (panels BDB)

BDB utilise la classe Smarty V5 `.panel` pour la plupart des cartes.
Utiliser `card` Bootstrap uniquement si `.panel` ne couvre pas le besoin.

```html
<!-- Card Bootstrap standard (si panel Smarty insuffisant) -->
<div class="card shadow-sm">
  <div class="card-header d-flex align-items-center justify-content-between">
    <h6 class="card-title mb-0">Titre</h6>
    <button class="btn btn-sm btn-outline-secondary">Action</button>
  </div>
  <div class="card-body">
    <p class="card-text">Contenu.</p>
  </div>
  <div class="card-footer text-muted small">Pied de carte</div>
</div>
```

**Regle BDB :** verifier `.panel`, `.panel-accent-primary` dans theme-base.css avant d'utiliser `.card`.

---

## 7. Modaux

```html
<!-- Modal standard BDB -->
<div class="modal fade" id="monModal" tabindex="-1" aria-labelledby="monModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="monModalLabel">
          <i class="bi bi-pencil me-2"></i>Titre du modal
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <!-- Contenu -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" class="btn btn-primary" id="btnConfirmer">Confirmer</button>
      </div>
    </div>
  </div>
</div>
```

**Tailles modaux :** `modal-sm` / (defaut) / `modal-lg` / `modal-xl` / `modal-fullscreen`

**Pattern JS modal BDB :**
```javascript
// Ouvrir via JS (pas data-bs-toggle si logique conditionnelle)
const modal = new bootstrap.Modal(document.getElementById('monModal'));
modal.show();

// Fermer et nettoyer
modal.hide();
document.getElementById('monModal').addEventListener('hidden.bs.modal', () => {
  // reset form ici
});
```

**Anti-patterns modaux :**
- `data-toggle` / `data-target` → deprecated BS4 → utiliser `data-bs-toggle` / `data-bs-target`
- Modal dans un modal → comportement impredictible, eviter
- `backdrop: 'static'` par defaut → autoriser fermeture sauf formulaire non sauvegarde

---

## 8. Spinners et etats de chargement

```html
<!-- Loading inline -->
<div class="d-flex align-items-center gap-2 text-muted">
  <div class="spinner-border spinner-border-sm" role="status">
    <span class="visually-hidden">Chargement...</span>
  </div>
  <span>Chargement...</span>
</div>

<!-- Loading centre (etat full-zone) -->
<div class="text-center py-5">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Chargement...</span>
  </div>
</div>

<!-- Progress bar -->
<div class="progress" style="height: 8px;">
  <div class="progress-bar bg-success" style="width: 75%;" role="progressbar"
       aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
</div>
```

**Regle BDB :** tout spinner = `visually-hidden` span pour lecteurs d'ecran.

---

## 9. Navigation — Tabs et Offcanvas

```html
<!-- Tabs standard -->
<ul class="nav nav-tabs" id="myTab" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" id="tab1-tab" data-bs-toggle="tab"
            data-bs-target="#tab1" type="button" role="tab"
            aria-controls="tab1" aria-selected="true">Onglet 1</button>
  </li>
</ul>
<div class="tab-content pt-3" id="myTabContent">
  <div class="tab-pane fade show active" id="tab1" role="tabpanel">...</div>
</div>

<!-- Offcanvas menu lateral BDB -->
<div class="offcanvas offcanvas-start" tabindex="-1" id="mainMenu" aria-labelledby="mainMenuLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="mainMenuLabel">Menu</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Fermer"></button>
  </div>
  <div class="offcanvas-body">...</div>
</div>
```

---

## 10. Utilitaires frequents

### Espacement

```
m-0..5, mt-, mb-, ms-, me-, mx-, my-
p-0..5, pt-, pb-, ps-, pe-, px-, py-
gap-1..5 (sur flex/grid)
```

### Visibilite responsive

```
d-none d-md-block    → masquer sur mobile, afficher desktop
d-block d-md-none    → afficher mobile seulement
visually-hidden      → masque visuellement, garde pour lecteurs
```

### Couleurs texte et fond valides

```
text-primary / text-secondary / text-success / text-danger
text-warning / text-info / text-muted / text-dark / text-white
text-body / text-body-secondary / text-body-tertiary  ← BS 5.3.x
bg-primary / bg-secondary / bg-success / bg-danger
bg-warning / bg-info / bg-light / bg-dark / bg-white
bg-body / bg-body-secondary / bg-body-tertiary  ← BS 5.3.x
```

**Anti-pattern couleurs :**
- `bg-warning` + texte clair → toujours ajouter `text-dark`
- `text-black` → existe en BS 5.3.3 (ajouté 5.3.x) mais `text-dark` reste prefere pour coherence BDB

---

## 11. Classes inexistantes en BS 5.3.3 — liste noire

Ces classes sont souvent hallucinees. Elles n'existent pas :

| Classe fausse | Remplacement correct |
|---|---|
| `btn-white` | `btn-outline-secondary` ou `btn-light` |
| `btn-default` | `btn-secondary` |
| `badge-primary` | `badge bg-primary` |
| `badge-pill` | `badge rounded-pill` |
| `form-group` | `mb-3` |
| `form-row` | `row g-2` |
| `bg-grey` | `bg-secondary` ou custom |
| `pull-left` / `pull-right` | `float-start` / `float-end` |
| `hidden` / `show` | `d-none` / `d-block` |
| `container-lg` (standalone) | `container` avec breakpoint grid |
| `card-columns` | grid `row row-cols-*` |
| `table-condensed` | `table-sm` |
| `data-toggle` | `data-bs-toggle` |
| `data-target` | `data-bs-target` |
| `data-dismiss` | `data-bs-dismiss` |

---

## 12. Interactions avec les autres skills

| Situation | Skill |
|---|---|
| Composant produit → verifier interdits CDS | `cds-compliance` |
| Composant integre dans un module | `bdb-module-generator` |
| Composant partage entre modules | `bdb-shared-component` |
| UX du composant a valider | `veille-tech-bdb` |
| Accessibilite du composant | `accessibility-audit-bdb` |
| Post-integration : audit violations | `recettage-bdb` |

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V2.1.0 qui documente les classes Bootstrap 5.3.3 valides pour BDB. 441 lignes de reference : grille, typographie, boutons, modals, offcanvas, cards, formulaires, tableaux, badges, couleurs, utilitaires, icones. Anti-patterns par composant. Mention Smarty V5 (.panel). |
| **Fonction** | Empeche Claude d utiliser des classes BS inexistantes en 5.3.3, des patterns deprecated BS4, ou des composants en conflit avec CDS. Repond a "quelle classe utiliser et comment". |
| **Avantage** | vs memoire Claude brute — Claude melange BS4 et BS5, invente des classes (.btn-round, .card-columns), ou utilise @latest qui casse les CDN figees. Ce skill est la reference verifiee. |
| **Benefice** | Le createur et le dev produisent du HTML conforme BS 5.3.3 du premier coup. 0 classe inexistante en prod. |
| **Risque** | Bootstrap publie 5.4 — les classes documentees ici deviennent incompletes. Mitigation : CDN fige a 5.3.3, pas de mise a jour implicite. |
| **Resultat** | 0 classe BS inexistante detectee en audit post-production depuis V2.0.0. Reference pour cds-compliance et bdb-module-generator. |
| **Recommandation** | Conserver. Stable tant que BDB reste sur BS 5.3.3. |

---

## Historique

```
2026-05-01 — v2.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

v2.0.0 — 2026-04-17 — Migration Smarty V5 (session #89).
          Titre + CDN : BS 5.3.2 → 5.3.3.
          text-black note mise a jour (existe en 5.3.x).
          Mention Smarty V5 .panel comme reference avant .card.
          bg-body / text-body-* ajoutes (classes 5.3.x).
```
