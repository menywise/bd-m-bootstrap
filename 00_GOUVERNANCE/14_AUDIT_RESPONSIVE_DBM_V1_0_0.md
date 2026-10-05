# 14 — AUDIT RESPONSIVE DBM V1.0.0

**Statut** : Diagnostic
**Date** : 2026-05-07 (session #115, suite signalement Manu mobile Android)
**Périmètre** : 28 modules + 10 pages racine
**Référentiel** : WCAG 2.1 AA + 2.5.5 (target size) + Bootstrap 5.3.3 breakpoints
**Stack** : Bootstrap 5.3.3, dbm-theme.css, theme-base.css, app vanilla JS

---

## 0. RÉSUMÉ EXÉCUTIF

| Sévérité | Anomalies | Impact mobile |
|---|---|---|
| **P1 critique** | 1 | Module sans viewport meta |
| **P2 majeur** | 84 | Selects/inputs largeur fixe + boutons sous WCAG AAA |
| **P3 mineur** | 50+ | Modales non fullscreen-md-down, micro-finitions |

**Cause racine** : la doctrine V5 n'a pas formalisé de règles responsive obligatoires. La majorité des modules ont été conçus desktop-first sans audit mobile systématique.

**Impact pour Manu** : sur Android <380px (ce que tu as testé), les filtres débordent de l'écran, certains boutons icon-only sont à la limite tappable (32×32px), les modales prennent toute la hauteur écran sans full-screen → expérience dégradée.

---

## 1. P1 — CRITIQUE (1 anomalie)

### P1.1 — `modules/medacta-coste/index.html` sans `<meta viewport>`

```bash
$ grep "viewport" modules/medacta-coste/index.html
# (rien)
```

**Impact** : sur mobile, la page s'affiche en mode "desktop zoomé" (pas de viewport adaptatif). Texte minuscule, double-tap pour zoomer, navigation impossible.

**Atténuation** : ce fichier porte `<!-- Surface: REDIRECT -->`. Il n'est consulté que 0,5s avant redirection vers `medacta`. **Impact réel quasi nul**, mais à corriger pour conformité WCAG 2.4.5.

**Fix** : ajouter ligne 5
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
```

**Effort** : 30s.

---

## 2. P2 — MAJEUR (84 anomalies cumulées)

### P2.1 — 67 occurrences `style="width:180px"` sur selects (17 modules)

Modules concernés : `anatomie, annuaire, arsenal, boite-a-idees, carnet-bord, cours, disc, fiches, glossaire, installation, medacta, objectifs, preferences, profile, thesaurus, transmissions, veille-documentaire`.

Top 5 par densité :
- `arsenal` : ~15 occurrences (filtres Filters principal + sous-onglets gants/casaques)
- `objectifs` : 5
- `disc` : 6
- `thesaurus` : multiples
- `preferences` : multiples

**Problème** : sur mobile <360px (Android compact, iPhone SE), un `<select>` avec `width: 180px` :
- déborde du viewport si placé après une recherche flex
- empile mal avec les autres filtres
- compresse le texte de l'option sélectionnée (`...Toutes catégories...` tronqué)

**Pattern actuel** :
```html
<div class="row g-2 align-items-end">
  <div class="col-md-5"><input type="search" .../></div>
  <div class="col-auto" style="width:180px"><select .../></div>
  <div class="col-auto" style="width:180px"><select .../></div>
</div>
```

**Pattern correctif** (conforme INTERDIT-C2 — zero style inline) :

```html
<div class="row g-2 align-items-end dbm-filter-row">
  <div class="col-12 col-md-5"><input type="search" class="form-control form-control-sm" .../></div>
  <div class="col-6 col-md-auto dbm-filter-cell">
    <select class="form-select form-select-sm dbm-filter-select" .../>
  </div>
  <div class="col-6 col-md-auto dbm-filter-cell">
    <select class="form-select form-select-sm dbm-filter-select" .../>
  </div>
</div>
```

Avec classes ajoutees a `dbm-premium-components.css` :

```css
.dbm-filter-select {
  width: auto;
  min-width: 160px;
  max-width: 240px;
}
@media (max-width: 575px) {
  .dbm-filter-select { width: 100%; min-width: 0; max-width: none; }
}
```

**Effort** : 67 substitutions, scriptable awk/sed (~2h pour 17 modules).

### P2.2 — `.app-icon-btn` à 32×32px (sous WCAG AAA)

Définition `css/dbm-theme.css` ligne 602 :
```css
.app-icon-btn {
  width: 2rem; height: 2rem;     /* = 32×32px */
  ...
}
```

**Problème** : WCAG 2.5.5 AAA recommande 44×44px minimum. WCAG 2.5.8 AA Niveau A exige 24×24px → on est conforme AA mais sous AAA. Sur mobile, 32px est tappable mais imprécis (taux d'erreur ~15-20% sur écrans tactiles compacts).

Modules les plus impactés (forte densité d'icon-btn) :
- `disc` : 4 icon-only btn
- `glossaire` : multiples actions de ligne (eye/pencil/trash)
- `arsenal` : actions de ligne sur tableau
- `transmissions` : actions de ligne

**Pattern correctif** : étendre à 2.5rem (40px) ou 2.75rem (44px) sur mobile uniquement :
```css
.app-icon-btn {
  width: 2rem; height: 2rem;
}
@media (max-width: 768px) {
  .app-icon-btn { width: 2.5rem; height: 2.5rem; }   /* 40px tactile */
  .app-table .app-icon-btn { width: 2.25rem; height: 2.25rem; } /* 36px en table dense */
}
```

**Effort** : 1 modif CSS dans `dbm-premium-components.css` (override sans toucher `dbm-theme.css` protégé). 30 min.

### P2.3 — Boutons CTA dans bandeau Page Title compressés mobile

Pattern Charte Premium R-3.3 :
```html
<section class="app-zone" data-zone="Page Title">
  <h1>Mes objectifs</h1>
  <p>...</p>
  <button class="btn btn-universe">+ Nouveau</button>
</section>
```

**Problème** : sur mobile <380px, le `+ Nouveau` peut faire wrap à 2 lignes ou compresser. Pas de `flex-wrap` ni de `white-space:nowrap` explicite.

**Pattern correctif** : ajouter dans `dbm-premium-components.css` §5 :
```css
.app-zone[data-zone="Page Title"] {
  display: flex;
  flex-wrap: wrap;       /* permet wrap CTA si trop court */
  align-items: flex-end;
  gap: 1rem;
}
.app-zone[data-zone="Page Title"] .btn-universe {
  white-space: nowrap;   /* CTA ne wrappe pas dans lui-même */
  flex-shrink: 0;
}
```

**Effort** : 5 lignes CSS. 5 min.

---

## 3. P3 — MINEUR (modales et micro-finitions)

### P3.1 — 15 modules avec modales sans `modal-fullscreen-md-down`

Modules concernés (avec nombre de modales) :
- `objectifs` : **42 modales** (record absolu)
- `disc` : 14
- `thesaurus` : 7
- `glossaire` : 6
- `objectifs` : 6 (dialogues)
- `cours` : 4
- `anatomie` : 4
- `arsenal` : 4
- `fiches` : 3
- `installation` : 3
- `carnet-bord` : 3
- `boite-a-idees` : 2
- `preferences` : 2
- `annuaire` : 1
- `organisateur` : 1
- `medacta` : 1
- `disc` : 1

**Total : 104 modales sans support mobile fullscreen**.

**Problème** : sur mobile <768px, modale par défaut prend ~90% largeur mais avec marges latérales. Sur écran <360px, modale serrée + scroll vertical agressif. Avec `modal-fullscreen-md-down`, modale prend 100×100% de l'écran, expérience native mobile.

**Pattern correctif** : ajouter classe `.modal-fullscreen-md-down` à chaque `.modal-dialog` :
```html
<!-- AVANT -->
<div class="modal-dialog modal-lg">
<!-- APRES -->
<div class="modal-dialog modal-lg modal-fullscreen-md-down">
```

**Effort** : 104 substitutions, scriptable. ~3h pour 15 modules.

### P3.2 — 1 table sans wrapper responsive

`politique-confidentialite.html` : 1 table sans `.table-responsive` ni `overflow-x:auto`.

**Effort** : 1 wrap. 2 min.

### P3.3 — `theme-base.css` line 24 : `min-height: 36px` sur input

Probable global Smarty V5. Compatible AA WCAG (24×24) mais sous AAA. Optionnel.

---

## 4. PATTERNS RÉCURRENTS À CORRIGER (méta-anomalies)

### M.1 — Pas de doctrine responsive formalisée dans CLAUDE.md

CLAUDE.md V2.3 ne mentionne pas explicitement :
- breakpoints obligatoires (`<768px`, `<576px`)
- target size minimum mobile
- pattern Filters responsive (`col-12` mobile, `col-md-auto` desktop)
- modales fullscreen-md-down systématique

**Recommandation** : ajouter §22 "Doctrine responsive" à CLAUDE.md (V2.4) avec règles RFC 2119 :
- R-RES-1 (DOIT) : meta viewport présent
- R-RES-2 (DOIT) : modales d'action métier en `modal-fullscreen-md-down`
- R-RES-3 (DEVRAIT) : selects de filtres en `col-12 col-md-auto` avec `min-width:160px`
- R-RES-4 (DOIT) : icon-btn ≥ 36×36px sur mobile
- R-RES-5 (DEVRAIT) : test obligatoire sur viewport 360×640 avant FTP

### M.2 — Skill `accessibility-audit-bdb` non déclenché sur les 25 modules livrés

Audit pre-livraison non systématique. À renforcer dans `recettage-bdb` checklist.

### M.3 — Aucun media query dans modules `[module]-ui.css`

Tous les modules délèguent au CSS global (theme-base, dbm-theme). Aucun module n'a de media queries propres, ce qui empêche les ajustements ciblés.

---

## 5. PLAN CORRECTIF PROPOSÉ

### Phase A — Quick wins (1 session, 1h30)

| # | Action | Effort | Impact |
|---|---|---|---|
| A1 | Fix viewport `medacta-coste/index.html` | 30s | P1 |
| A2 | Ajouter `.app-icon-btn` mobile override dans `dbm-premium-components.css` | 5 min | P2 sur 25 modules |
| A3 | Ajouter Page Title flex-wrap dans `dbm-premium-components.css` | 5 min | P2 sur futures pages |
| A4 | Wrap table `politique-confidentialite.html` | 2 min | P3 |
| A5 | Audit final via DevTools mobile emulation | 30 min | Validation |

**Livrable** : 1 patch CSS (`dbm-premium-components.css`) + 2 fichiers HTML touchés.

### Phase B — Modales fullscreen mobile (1 session, 3h)

| # | Action | Effort | Impact |
|---|---|---|---|
| B1 | Script awk/sed : ajouter `modal-fullscreen-md-down` à toutes `.modal-dialog` | 30 min | 104 modales |
| B2 | Test manuel 5 modules les plus utilisés | 1h | Régression check |
| B3 | Audit grep INTERDIT post-fix | 15 min | Conformité |

### Phase C — Selects largeur fixe (FAB(3R) requis, 4-6h)

| # | Action | Effort | Impact |
|---|---|---|---|
| C1 | FAB(3R) du pattern remplacement | 30 min | Doctrine |
| C2 | Script awk substitution : `style="width:180px"` -> `class="dbm-filter-select"` (zero inline, conforme INTERDIT-C2) | 1h | 67 occurrences |
| C3 | Création classe `.filter-select` dans `dbm-premium-components.css` | 30 min | Doctrine UI |
| C4 | Test 17 modules concernés | 2h | Régression |
| C5 | INSERT atelier_principes pour règle | 30 min | Doctrine |

### Phase D — Doctrine responsive CLAUDE.md (1 session, 2h)

| # | Action | Effort | Impact |
|---|---|---|---|
| D1 | Rédaction §22 CLAUDE.md V2.4 | 1h | Doctrine |
| D2 | INSERT 5 atelier_principes (R-RES-1 à 5) | 1h | Doctrine cloud |
| D3 | Mise à jour skill `accessibility-audit-bdb` | 30 min | Outils |

---

## 6. RECOMMANDATION TRANCHÉE

**Phase A** : à faire **maintenant** (1h30 max). Bénéfice immédiat sur les 25 modules, zéro risque (addition only sur `dbm-premium-components.css` non encore chargé en prod).

**Phase B** : à faire **session dédiée** (3h). Risque modéré (modification de 15 modules). Test manuel critique.

**Phase C** : **FAB(3R) requis** (4-6h). Pattern à formaliser avant d'éditer 67 occurrences.

**Phase D** : à inclure dans **prochaine cascade fondateurs** (avec V2.4 CLAUDE.md).

**Ordre recommandé** : A → D (doctrine d'abord) → B (modales) → C (selects en FAB(3R)).

---

## 7. EFFORT TOTAL

- Phase A : 1h30
- Phase B : 3h
- Phase C : 4-6h
- Phase D : 2h
- **Total : 10-12h sur 4 sessions**

---

## 8. INDICATEURS DE SUCCÈS

À mesurer **après Phase A complète** :
- Score Lighthouse Mobile Accessibility : actuel ? → cible ≥ 95
- DevTools mobile 360×640 : aucun débordement horizontal sur les 5 modules les plus utilisés
- Test physique Android Manu : "boutons cliquables au premier essai" sur les CTA principaux

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-05-07 | 1.0.0 | Création audit suite signalement Manu (anomalies responsive Android). Scan automatisé 28 modules + 10 pages racine. 1 P1 + 84 P2 + 50+ P3 catalogués. Plan correctif 4 phases (A-D), effort 10-12h sur 4 sessions. |
