# PATTERN — Modales DB&M par niveaux de richesse

> Version 1.0 · 2026-05-08 · Session #128
> Doctrine cloud : `CONV-MODAL-RICHESSE-01` (TOUJOURS, atelier_principes)
> CSS support : `css/dbm-module-color.css` (classes `.modal-rich-*`)
> JS support : `js/bdb-modal-a11y.js` (a11y + blur empilées CONV-MODAL-09)

---

## RÈGLE DE CHOIX

**Avant toute modale, classer son niveau** selon la nature de l'interaction :

| Niveau | Quand l'utiliser | Largeur typique |
|---|---|---|
| **L1 — Light** | Confirmation, alerte, message court (≤ 2 phrases) | `modal-sm` ou `modal` (default) |
| **L2 — Standard** | CRUD basique : un seul groupe de champs liés (ex: signaler, proposer terme) | `modal-lg` |
| **L3 — Rich** | Multi-sections : profil complet, item avec mentors+ressources, configuration multi-aspects | `modal-lg` ou `modal-xl` |

**Si tu hésites entre L2 et L3** : compte les sections distinctes. ≥ 3 sections logiques = L3.

---

## NIVEAU 1 — LIGHT (confirm / alert)

**Cas d'usage** : confirmer une suppression, valider une action irréversible, afficher un message court.

**Pattern HTML** :

```html
<div class="modal fade" id="modalConfirmXxx" tabindex="-1" aria-labelledby="modalConfirmXxxLabel">
  <div class="modal-dialog modal-dialog-centered modal-fullscreen-md-down">
    <div class="modal-content rounded-4 border-0 shadow-lg">
      <div class="modal-header modal-header-module">
        <h5 class="modal-title" id="modalConfirmXxxLabel">
          <i class="bi bi-exclamation-triangle me-2"></i>Confirmer X
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <p class="mb-0">Phrase courte décrivant l'action.</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-light btn-sm" data-bs-dismiss="modal">Annuler</button>
        <button class="btn btn-danger btn-sm" id="btnConfirm">Supprimer</button>
      </div>
    </div>
  </div>
</div>
```

**Règles** :
- `modal-dialog` : `modal-dialog-centered modal-fullscreen-md-down` (pas de `modal-lg`, pas de scrollable)
- `modal-body` : 1-2 phrases max, pas de form
- `modal-footer` : 2 boutons → Annuler (`btn-light`) + CTA action (`btn-module` ou `btn-danger` si destructive)
- **Pas** de cards internes, pas de sections

**Exemples projet** : Annuaire `modalConfirmDelete`, Glossaire `modalGlosDelete` + `modalRejectSugg` + `modalViderPanier`.

---

## NIVEAU 2 — STANDARD (CRUD basique)

**Cas d'usage** : un formulaire avec 3-6 champs liés à un seul concept (ex: signaler un terme, proposer une suggestion, éditer une catégorie simple).

**Pattern HTML** :

```html
<div class="modal fade" id="modalXxx" tabindex="-1" aria-labelledby="modalXxxLabel">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down">
    <div class="modal-content rounded-4 border-0 shadow-lg">
      <div class="modal-header modal-header-module">
        <h5 class="modal-title" id="modalXxxLabel">
          <i class="bi bi-pencil-square me-2"></i>Titre action
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label form-label-sm fw-semibold">Champ 1 <span class="text-danger">*</span></label>
          <input type="text" class="form-control form-control-sm"/>
        </div>
        <div class="mb-3">
          <label class="form-label form-label-sm fw-semibold">Champ 2</label>
          <textarea class="form-control form-control-sm" rows="3"></textarea>
        </div>
        <!-- ... -->
      </div>
      <div class="modal-footer">
        <button class="btn btn-light btn-sm" data-bs-dismiss="modal">Annuler</button>
        <button class="btn btn-module btn-sm" id="btnSave">
          <i class="bi bi-check-lg me-1"></i>Enregistrer
        </button>
      </div>
    </div>
  </div>
</div>
```

**Règles** :
- `modal-dialog` : `modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down`
- Champs en colonne unique (sauf 2 champs côte à côte ponctuels via `<div class="row g-3">`)
- Footer : Annuler + CTA module

**Exemples projet** : Glossaire `modalSignalerTerme`, `modalGlosEdit`, `modalProposerTerme`.

---

## NIVEAU 3 — RICH (multi-sections)

**Cas d'usage** : édition complexe avec plusieurs aspects logiquement distincts (profil membre + équipement + secrétaires, item + mentors + ressources, progression + dates + notes).

**Pattern HTML** :

```html
<div class="modal fade" id="modalRich" tabindex="-1" aria-labelledby="modalRichLabel">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable modal-fullscreen-md-down">
    <div class="modal-content rounded-4 border-0 shadow-lg">
      <div class="modal-header modal-header-module">
        <h5 class="modal-title" id="modalRichLabel">
          <i class="bi bi-collection me-2"></i>Titre action
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
      </div>
      <div class="modal-body">

        <!-- Section 1 : wrapper card light -->
        <div class="modal-rich-section">
          <p class="modal-rich-label">
            <i class="bi bi-calendar3 me-1"></i>Dates de progression
          </p>
          <div class="modal-rich-row">
            <div>
              <label class="form-label form-label-sm fw-semibold">Date 1</label>
              <input type="date" class="form-control form-control-sm"/>
            </div>
            <div>
              <label class="form-label form-label-sm fw-semibold">Date 2</label>
              <input type="date" class="form-control form-control-sm"/>
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="modal-rich-section">
          <p class="modal-rich-label">
            <i class="bi bi-people me-1"></i>Mentors
          </p>
          <ul class="list-group list-group-flush">
            <!-- items dynamiques -->
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="modal-rich-section">
          <p class="modal-rich-label">
            <i class="bi bi-link-45deg me-1"></i>Ressources liées
          </p>
          <div id="resourcesList"><!-- dynamique --></div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-danger btn-sm me-auto" id="btnDelete"><i class="bi bi-trash3 me-1"></i>Supprimer</button>
        <button class="btn btn-light btn-sm" data-bs-dismiss="modal">Annuler</button>
        <button class="btn btn-module btn-sm" id="btnSave">
          <i class="bi bi-check-lg me-1"></i>Enregistrer
        </button>
      </div>
    </div>
  </div>
</div>
```

**Règles** :
- Chaque section enveloppée dans `.modal-rich-section` (card light pastel)
- Chaque section a un label `.modal-rich-label` (uppercase + icône + ton secondaire)
- Champs côte à côte via `.modal-rich-row` (grid 2 colonnes desktop, 1 colonne mobile)
- Footer 3 boutons possibles : Supprimer (gauche `me-auto`) + Annuler + CTA module

**Exemples projet** : Carnet de bord `modalProgression` + `modalAdminItem`, Annuaire `modalMembre`.

---

## CLASSES CSS DISPONIBLES (dbm-module-color.css)

| Classe | Effet |
|---|---|
| `.modal-rich-section` | Wrapper card pastel (bg-light + rounded + padding) |
| `.modal-rich-label` | Titre uppercase + icône + ton muted |
| `.modal-rich-divider` | Séparateur horizontal entre sections sans card |
| `.modal-rich-row` | Grid 2 cols desktop, 1 col mobile |
| `.modal-header-module` | Header coloré gradient module (CONV-MODAL-01) |
| `.modal--blurred-below` | Auto-appliquée par JS quand modale empilée par-dessus (CONV-MODAL-09) |

---

## CHECKLIST AVANT TOUTE NOUVELLE MODALE

- [ ] J'ai classé la modale en L1, L2 ou L3 ?
- [ ] Le `modal-dialog` a les bonnes classes pour son niveau ?
- [ ] Le `modal-content` a `rounded-4 border-0 shadow-lg` ?
- [ ] Le `modal-header` a `modal-header-module` ?
- [ ] Le CTA principal est `btn-module` (jamais `btn-primary`) ?
- [ ] Les sections L3 utilisent `.modal-rich-section` + `.modal-rich-label` ?
- [ ] Les boutons "Annuler" sont uniformes (`btn-light btn-sm`) ?
- [ ] Le bouton "Supprimer" a `me-auto` pour aller à gauche du footer ?

---

## ANTI-PATTERNS

- ❌ `modal-content` brut sans `rounded-4 border-0 shadow-lg` → modal triste sans relief
- ❌ `<div class="card border-0 bg-light rounded-3 p-3 mb-3">` partout → réinvente `.modal-rich-section`
- ❌ Inventer un nouveau format de label (font-size aléatoire, sans uppercase) → casse cohérence
- ❌ Niveau 3 forcé pour 2 champs → bruit visuel inutile, prendre L2
- ❌ `btn-primary` ou `btn-secondary` Bootstrap natif → casser couleur module

---

## HISTORIQUE

```
2026-05-08 — V1.0.0 (Session #128)
  Création doctrine 3 niveaux de richesse modale.
  Classes .modal-rich-* ajoutées dans dbm-module-color.css.
  Référencement cloud : CONV-MODAL-RICHESSE-01 (TOUJOURS).
  Référence : Carnet de bord modal Progression = exemple L3 réussi.
```
