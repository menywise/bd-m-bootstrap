# 12 — CHARTE PREMIUM DBM V1.0.0

**Statut** : Normatif
**Date** : 2026-05-07 (session #115)
**Source d'inspiration** : Charte d'app DBM v3 (Claude Design, session #114)
**Portee** : 28 modules DB&M, 7 surfaces, agents IA et contributeurs humains
**Mots-cles** : RFC 2119 (DOIT, NE DOIT PAS, DEVRAIT, PEUT)

---

## 0. PORTEE

Cette charte vient en **complement** des documents fondateurs A0-A6 (cf. CLAUDE.md V2.2 §20). Elle ne remplace ni le Manifeste DBM V1.4, ni le Canon V1.0.6, ni les conventions techniques 10_ARCHITECTURE_REGLES_TECHNIQUES_V3. Elle ajoute :

- Une nomenclature **RFC 2119** pour les regles UI/UX (DOIT/NE DOIT PAS/DEVRAIT/PEUT).
- Un catalogue **A1-A15** d'anti-patterns visuels.
- Un contrat **Surface markers** pour identifier le type de page.
- Un contrat **data-zone** pour les zones canoniques.
- Un contrat **etats async** unifie via `bdbZoneState()`.
- Le pattern **bandeau Page Title** gradient 135 deg.
- Le pattern **CTA `.btn-universe`** teinte module.
- Le pattern **modale et offcanvas teintes module**.

**Deux composants V5 nouveaux** sont livres avec cette charte :

| Fichier | Role |
|---|---|
| `css/dbm-premium-components.css` | Composants additionnels charte premium |
| `js/bdb-zone-state.js` | Helper unifie etats async par zone |

Charge dans la chaine : Bootstrap 5.3.3 -> Bootstrap Icons 1.11.1 -> theme-base.css -> cds-overrides.css -> **dbm-premium-components.css** -> [module]-ui.css. Pour le JS : ... -> bdb-ui.js -> **bdb-zone-state.js** -> bdb-shell.js -> [module]-app.js.

---

## 1. CONVENTIONS DE LECTURE — RFC 2119

| Mot-cle | Sens | Equivalent BDB historique |
|---|---|---|
| **DOIT** | Regle non negociable. Une production qui la viole est rejetee. | INTERDIT-* |
| **NE DOIT PAS** | Interdiction absolue. | INTERDIT-* |
| **DEVRAIT** | Recommandation forte. Derogation a documenter. | CONV-* |
| **PEUT** | Option laissee a l'auteur. | (libre) |

Chaque regle porte un identifiant **R-X.Y** citable (X = section, Y = ordre). Les regles sont opposables en revue.

---

## 2. SURFACE MARKERS — IDENTIFIANT PAGE

### R-2.1 — DOIT

Tout fichier d'index porte en **premiere ligne apres `<!DOCTYPE>`** un commentaire HTML :

```html
<!-- DBM | Surface: [NOM] | Auth: [chaine] | Shell: [oui|non] -->
```

7 surfaces V5 + 1 cas special :

| Surface | Marker | Shell | Sidebar | Header | Auth |
|---|---|---|---|---|---|
| `MODULE`   | `Surface: MODULE`   | oui | oui | oui | oui |
| `ITEM`     | `Surface: ITEM`     | oui | oui | oui | oui |
| `PORTAIL`  | `Surface: PORTAIL`  | oui | non | reduit | oui |
| `ADMIN`    | `Surface: ADMIN`    | oui | oui | oui | oui (admin) |
| `PRINT`    | `Surface: PRINT`    | non | non | non | oui |
| `SITE`     | `Surface: SITE`     | non | non | specifique | non |
| `ATELIER`  | `Surface: ATELIER`  | oui | createur | oui | oui (createur) |
| `REDIRECT` | `Surface: REDIRECT` | non | non | non | non |

### R-2.2 — DOIT

`#bdb-shell` est le **premier enfant** de `#wrapper` (heritage INTERDIT-E1).

### R-2.3 — DOIT

Les variables couleur module sont declarees sur **`:root`** dans un `<style>` en fin de `<head>` :

```html
<style>
  :root {
    --module-color:        #93c5fd;        /* pastel — bandeau, accents */
    --module-color-strong: #1d4287;        /* CTA, focus, etat actif */
    --module-color-text:   #ffffff;        /* texte sur strong */
    --module-color-soft:   rgba(147,197,253,0.18); /* survols, tints */
  }
</style>
```

Source de la triplette : **`app_groups.color`** (5 groupes V5) **ou** palette HSL 28 modules (charte v3 Claude Design — non adoptee par defaut, voir §10). L'admin instance tranche.

### R-2.4 — DOIT

Attribut **`data-module-slug="[slug]"`** present sur `#bdb-shell`. Sert de cle pour shell, recherche transverse, navigation par groupe.

### R-2.5 — NE DOIT PAS

Aucun module ne redeclare le chrome global (`<header>` applicatif, `<aside class="app-sidebar">`, barre auth). Ces elements sont injectes par `bdb-shell.js`.

### R-2.6 — PEUT

Sous-navigation propre au module via `nav.module-subnav`, placee sous `#bdb-shell` avant `#wrapper_content`. Ne remplace jamais le shell global.

---

## 3. ZONES CANONIQUES — DATA-ZONE

### R-3.1 — DOIT

Toute page module contient au minimum `Page Title` et `Content` avec attribut `data-zone` :

```html
<section class="app-zone" data-zone="Page Title">...</section>
<section class="app-zone" data-zone="Content">...</section>
```

### R-3.2 — NE DOIT PAS

Aucune valeur `data-zone` hors liste suivante :

| `data-zone` | Role | Statut | Position |
|---|---|---|---|
| `Breadcrumb`     | Fil d'Ariane vers Accueil | DEVRAIT | 1 |
| `Page Title`     | Bandeau colore + h1 + sous-titre + CTA | DOIT | 2 |
| `KPIs`           | Indicateurs syntheses | PEUT | 3 |
| `Filters`        | Recherche + selects + reset | DEVRAIT | 4 |
| `Content`        | Card principale (table/cards) | DOIT | 5 |
| `Detail Section` | Bloc detail (Items / Offcanvas) | PEUT | — |
| `Alert`          | Bandeau avertissement metier | PEUT | — |
| `Drop Zone`      | Upload fichier | PEUT | — |
| `Data Card`      | Card avec tabs + table + pagination | PEUT | — |

### R-3.3 — DOIT

Le bandeau **Page Title** est un gradient **135 deg** entre `--module-color` et `--module-color-strong`, texte en `--module-color-text`, padding `1.5rem 1.75rem`, `border-radius: .5rem`, `box-shadow` discret. Implementation prete dans `dbm-premium-components.css`.

### R-3.4 — DOIT

Toute zone qui charge des donnees expose **4 etats DOM mutuellement exclusifs**. Deux conventions admises :

**Convention V5 (heritage)** — IDs prefixes :
```html
<section class="app-zone" data-zone="Content">
  <div id="myModuleLoading">spinner</div>
  <div id="myModuleEmpty" hidden>etat vide</div>
  <div id="myModuleError" hidden>etat erreur</div>
  <div id="myModuleContent" hidden>donnees</div>
</section>
<!-- Bascule via : bdbZoneState('myZone', 'loading', { prefix: 'myModule' }) -->
```

**Convention premium** — attributs data :
```html
<section class="app-zone" data-zone="Content">
  <div data-zone-state="loading">spinner</div>
  <div data-zone-state="empty" hidden>etat vide</div>
  <div data-zone-state="error" hidden>etat erreur</div>
  <div data-zone-state="content" hidden>donnees</div>
</section>
<!-- Bascule via : bdbZoneState(zoneEl, 'loading') -->
```

L'API `bdbZoneState()` ajoute automatiquement :
- `data-state="<state>"` sur la zone
- `aria-busy="true|false"` sur la zone
- `role="status"` (loading/empty), `role="alert"` (error) sur le sous-bloc actif
- `aria-live="polite"` (loading) ou `assertive` (error)

---

## 4. COMPOSANTS PREMIUM — DESCRIPTION

### R-4.1 — DOIT

Le **CTA principal** d'un module est `.btn-universe`. Hover/focus/active basculent vers `--module-color-strong` avec texte blanc. Implemente dans `dbm-premium-components.css`.

```html
<button class="btn btn-universe">
  <i class="bi bi-plus-lg"></i> Nouvelle entree
</button>
```

### R-4.2 — NE DOIT PAS

`.btn-primary` comme CTA principal d'un module (cf. anti-pattern A11). `.btn-primary` reste autorise pour les actions transverses non liees a un module.

### R-4.3 — DOIT

Les modales et offcanvas d'action metier ont un header teinte module via `.modal-header-module` ou `.offcanvas-header-module`.

```html
<div class="modal-header modal-header-module">
  <h5 class="modal-title">Editer le terme</h5>
  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
</div>
```

### R-4.4 — NE DOIT PAS

`filter: brightness()` sur les boutons colores (anti-pattern A15). Toujours bascule explicite vers strong.

---

## 5. ANTI-PATTERNS A1-A15

Catalogue d'erreurs frequentes a verifier en revue :

| Code | Erreur | Correction |
|---|---|---|
| **A1** | Container avec accent en bordure gauche flottant | Utiliser `.app-card[data-accent="module"]` |
| **A2** | Gradients aleatoires hors bandeau Page Title | Reserve au pattern R-3.3 |
| **A3** | Emoji dans l'UI | Bootstrap Icons exclusivement |
| **A4** | Couleurs hardcodees hors palette ou hors couleurs semantiques BS | Variables `--module-color*` ou `--bs-*` |
| **A5** | Plusieurs `<h1>` visibles simultanement | Un seul h1 visible (SPA multi-vues : OK dans DOM si commute) |
| **A6** | Inline `style="color:..."` ou `style="font-size:..."` sur texte courant | Utiliser classes CDS / utilitaires Bootstrap |
| **A7** | Reecriture du chrome global dans un module | Chrome injecte par `bdb-shell.js` uniquement |
| **A8** | Tables sans pagination au-dela de 25 lignes | Pagination obligatoire dans `.app-card-footer` |
| **A9** | Modales metier sans `.modal-header-module` | Toute modale d'action metier teintee |
| **A10** | Reference a feuille depreciee | Stack figee uniquement |
| **A11** | CTA principal en `.btn-primary` au lieu de `.btn-universe` | Voir R-4.1 |
| **A12** | Compteurs et stats inventes ("data slop") | Donnees DB ou marquees demo |
| **A13** | SVG decoratifs dessines a la main | Bootstrap Icons ou assets reels |
| **A14** | Teintage d'une page selon un univers | Seule la couleur du module actif compte |
| **A15** | `:hover` a base de `filter: brightness()` sur boutons colores | Bascule explicite vers `--module-color-strong` |

---

## 6. STACK FIGEE — RAPPELS

### R-6.1 — DOIT

Versions opposables :

| Dependance | Version | Statut |
|---|---|---|
| Bootstrap | `5.3.3` | DOIT |
| Bootstrap Icons | `1.11.1` | DOIT |
| Supabase JS | `@supabase/supabase-js@2` | DOIT |
| theme-base.css (CDN) | commit `@63905396` | DOIT |
| Quill | `quill@1.3.7` via cdnjs | PEUT (modules editeur riche) |

### R-6.2 — DOIT

Ordre de chargement CSS immuable :

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/menywise/BDB@63905396/.../theme-base.css">
<link rel="stylesheet" href="../../css/cds-overrides.css">
<link rel="stylesheet" href="../../css/dbm-premium-components.css">  <!-- nouveau -->
<link rel="stylesheet" href="../../css/[module]-ui.css">
```

### R-6.3 — DOIT

Ordre de chargement JS immuable :

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="../../js/supabase-client.js"></script>
<script src="../../js/bdb-ui.js"></script>
<script src="../../js/bdb-zone-state.js"></script>          <!-- nouveau -->
<script src="../../js/bdb-invite-guard.js"></script>
<script src="../../js/bdb-shell.js"></script>
<script src="[module]-app.js"></script>
```

---

## 7. TYPOGRAPHIE & VOIX

### R-7.1 — DOIT

Tutoiement systematique de l'utilisateur dans toute l'UI ("Ton planning", "Modifie ta fiche"). Vouvoiement reserve aux emails transactionnels et messages legaux.

### R-7.2 — DOIT

Apostrophe typographique courbe (`’`) dans l'UI, jamais droite (`'`). Guillemets francais `«&nbsp;»` pour citations.

### R-7.3 — DOIT

Format date francais long ("12 mai 2026"), court ("12/05/2026") ou relatif ("il y a 3 jours"). **Pas d'ISO en UI.**

### R-7.4 — DOIT

Nombres : separateur milliers = espace insecable, decimal = virgule (`1 250,50 €`). Devise apres le nombre.

### R-7.5 — DEVRAIT

Boutons : libelle `<= 3 mots`. Verbe explicite ("Supprimer", pas "OK").

### R-7.6 — NE DOIT PAS

Anglicisme la ou un terme francais usuel existe ("Enregistrer", "Annuler", "Filtrer"). Termes techniques metier (DMI, IBODE, CCAM) conserves.

---

## 8. ACCESSIBILITE WCAG AA

### R-8.1 — DOIT

Skip-link en premier element focusable :
```html
<a href="#main-content" class="skip-link">Aller au contenu</a>
```

### R-8.2 — DOIT

Hierarchie semantique : `<main id="main-content">` unique, `<nav>` avec `aria-label`, `<section>` avec heading.

### R-8.3 — DOIT

Tout element interactif a un libelle accessible. Boutons icone seuls : `aria-label` obligatoire.

### R-8.4 — DOIT

Focus visible : ne jamais supprimer `:focus-visible`, outline minimum 2px contrastant.

### R-8.5 — DOIT

Etats async : `aria-busy="true"` sur la zone en chargement, `role="status"` sur les messages, `role="alert"` sur les erreurs. **Pose automatiquement par `bdbZoneState()`**.

### R-8.6 — NE DOIT PAS

Aucune information transmise par la couleur seule. Toujours texte, icone ou libelle en complement.

---

## 9. ZONES DE ROLE — MARQUAGE VISUEL

Pattern issu de zones.html (Claude Design v3) : zones membre / admin / createur marquees visuellement.

```html
<!-- Zone admin (violet) -->
<div class="app-zone-admin">
  <span class="app-zone-badge app-zone-badge--admin">
    <i class="bi bi-shield-lock"></i> Admin
  </span>
  ...
</div>

<!-- Zone createur (orange) -->
<div class="app-zone-creator">
  <span class="app-zone-badge app-zone-badge--creator">
    <i class="bi bi-shield-fill"></i> Createur
  </span>
  ...
</div>
```

Couleurs definies dans `dbm-premium-components.css` (Section 8).

---

## 10. PALETTE COULEURS — STRATEGIE V5

### R-10.1 — DOIT

La triplette `--module-color`, `--module-color-strong`, `--module-color-text`, `--module-color-soft` est resolue selon **l'une des deux strategies** suivantes (l'admin instance tranche, decision documentee en `atelier_decisions`) :

**Strategie A — Couleur par groupe (V5 actuelle, D-2026-05-05-S117)**
5 couleurs, une par `app_groups.color`. Modules d'un meme groupe partagent la couleur. Simple a maintenir.

| Groupe | Pastel | Strong | Text |
|---|---|---|---|
| `bloc`         | `#93c5fd` | `#1d4287` | `#ffffff` |
| `equipe`       | `#86efac` | `#15803d` | `#ffffff` |
| `savoir`       | `#c4b5fd` | `#5a3a8a` | `#ffffff` |
| `pilotage`     | `#cbd5e1` | `#334155` | `#ffffff` |
| `espace_perso` | `#fdba74` | `#a8480c` | `#ffffff` |

**Strategie B — Couleur par module (charte v3 Claude Design, 28 modules)**
1 couleur par module, palette HSL reguliere, hue espace ~12,9 deg, saturation 60-65 %. Cf. fichier `_claude_design/Charte graphique v6.zip` -> `dbm/css/dbm-palette-v3.json`. Cosmetiquement plus differencie. **Non adopte par defaut V5.**

### R-10.2 — NE DOIT PAS

Generation a la volee de couleurs par les agents IA. Toujours puiser dans la table active (Strategie A ou B documentee).

### R-10.3 — DOIT

Les **univers / groupes ne portent pas de couleur dans l'UI** au sens "fond de page teinte par groupe" (anti-pattern A14). La couleur est portee par le **module actif**. La table `app_groups.color` definit la **source** de la couleur, pas son rayonnement spatial.

---

## 11. CHECKLIST DE REVUE — POST-PRODUCTION

A cocher pour chaque `index.html` en revue :

- [ ] Signature `<!-- DBM | Surface: ... -->` en premiere ligne apres `<!DOCTYPE>` (R-2.1)
- [ ] Chaine CSS R-6.2 intacte (6 liens dans l'ordre)
- [ ] Chaine JS R-6.3 intacte (avec `bdb-zone-state.js`)
- [ ] Squelette `#wrapper > #bdb-shell + #wrapper_content` (R-2.2)
- [ ] Variables `--module-color*` sur `:root` en fin de `<head>` (R-2.3)
- [ ] `data-module-slug="[slug]"` sur `#bdb-shell` (R-2.4)
- [ ] Au minimum `Page Title` + `Content` avec `data-zone` (R-3.1)
- [ ] Bandeau Page Title gradient 135 deg (R-3.3)
- [ ] 4 etats async (loading/empty/error/content) avec convention V5 ou data-zone-state (R-3.4)
- [ ] CTA principal = `.btn-universe`, jamais `.btn-primary` (R-4.1, R-4.2)
- [ ] Modales metier avec `.modal-header-module` (R-4.3)
- [ ] Aucun `filter: brightness()` sur boutons colores (R-4.4, A15)
- [ ] Aucun anti-pattern A1-A15 (§5)
- [ ] Tutoiement, apostrophe typographique, dates FR (R-7.1, R-7.2, R-7.3)
- [ ] Skip-link, aria-busy, role=status/alert (R-8.1, R-8.5)
- [ ] Aucun emoji (A3), aucun style inline color/font (A6)

---

## 12. AMENDEMENTS

Toute proposition d'amendement passe par **FAB(3R)** (skill `fab3r-bdb`) + INSERT `atelier_decisions` + INSERT/UPDATE `atelier_principes`. La charte est versionnee — toute modification incremente la version mineure (V1.0.0 -> V1.1.0).

**Migration source des regles** : `migrations/S126_charte_premium_v1.sql` (a executer apres validation Manu).

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-05-07 | 1.0.0 | Creation. Adoption ciblee de la Charte d'app DBM v3 (Claude Design, session #114). 12 regles P1+P2 retenues. Surface markers, RFC 2119, A1-A15, bandeau Page Title gradient, btn-universe, modal/offcanvas-header-module, bdbZoneState. Strategie palette : V5 5-groupes maintenue, Strategie B (28 modules) documentee mais non-adoptee. Reseves : pas de migration `bdb-* -> dbm-*` (FAB(3R) requis), pas de `theme-base.css -> dbm-theme.css local` (FAB(3R) requis). Session #115. |
