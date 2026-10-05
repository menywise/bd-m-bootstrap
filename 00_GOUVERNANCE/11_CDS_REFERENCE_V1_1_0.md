# CDS_REFERENCE.md — Référentiel Classes CSS BDB
```
VERSION  : 1.1.0
DATE     : 2026-04-10
AUTEUR   : Claude + Manu
RÔLE     : Source de vérité unique pour toute IA générant du CSS ou HTML dans BDB.
           Charger ce fichier AVANT d'écrire la moindre classe dans un module.
SOURCES  : theme-base.css v1.4 (CDN) · cds-overrides.css v1.7.0 · Bootstrap 5.3.2
RÈGLE    : Si la classe existe ici → l'utiliser. Ne jamais la recréer dans [module]-ui.css.
CHANGELOG:
  v1.1.0 (2026-04-10) — Ajout COUCHE 2 : placeholder global, .cds-shimmer, .cds-hide-scrollbar
                         Nettoyage annuaire-ui + index-ui (ann-shimmer / bdb-shimmer supprimés)
                         Mise à jour section CONFLITS CONNUS
```

---

## RÈGLE D'OR

```
Avant d'écrire une règle CSS dans [module]-ui.css, chercher ici.
Si trouvé → utiliser la classe existante dans le HTML.
Si absent → créer dans [module]-ui.css avec préfixe [module]-* et scope #[module]App.
Jamais de règle globale non scopée dans un fichier module.
```

---

## COUCHE 1 — theme-base.css (CDN menywise/BDB@latest)

> Ces classes sont disponibles dès que `theme-base.css` est chargé.
> Variables : `--ds-*`

### Variables CSS disponibles

| Variable | Valeur | Usage |
|---|---|---|
| `--ds-primary` | `#60a5fa` | Bleu principal |
| `--ds-primary-hover` | `#3b82f6` | Bleu hover |
| `--ds-success` | `#34d399` | Vert |
| `--ds-warning` | `#fbbf24` | Jaune |
| `--ds-danger` | `#f87171` | Rouge |
| `--ds-info` | `#38bdf8` | Cyan |
| `--ds-secondary` | `#94a3b8` | Gris |
| `--ds-bg-page` | `#f1f5f9` | Fond page |
| `--ds-bg-card` | `#ffffff` | Fond carte |
| `--ds-bg-input` | `#f8fafc` | Fond input |
| `--ds-bg-dark` | `#1e293b` | Fond sombre |
| `--ds-text` | `#334155` | Texte principal |
| `--ds-text-muted` | `#64748b` | Texte secondaire |
| `--ds-border` | `#e2e8f0` | Bordure légère |
| `--ds-border-strong` | `#cbd5e1` | Bordure forte |
| `--ds-radius` | `8px` | Border-radius standard |
| `--ds-radius-lg` | `12px` | Border-radius large |
| `--ds-radius-sm` | `4px` | Border-radius petit |
| `--ds-shadow` | `0 1px 3px...` | Ombre légère |
| `--ds-shadow-hover` | `0 4px 12px...` | Ombre hover |
| `--ds-shadow-lg` | `0 10px 25px...` | Ombre grande |
| `--ds-transition` | `0.2s ease` | Transition standard |

### Layout

| Classe | Comportement |
|---|---|
| `.sidebar` | Sidebar fixe 260px fond sombre |
| `.main-content` | Zone principale flex column flex-grow-1 |
| `.header-sticky` | Header sticky top:0 avec backdrop-filter |
| `.ms-sidebar` | margin-left:260px pour contenu avec sidebar |
| `.layout-2col` | Grid 2fr/1fr responsive → 1col sous 900px |

### Cards

| Classe | Comportement |
|---|---|
| `.card` | Fond blanc, shadow, border-radius, hover translateY(-3px) |
| `.card-static` | `.card` sans hover animation |
| `.card-header` | Fond #f8fafc, border-bottom |
| `.pole-card` | border-top 4px `--ds-primary` · variantes `.success .warning .danger .info` |
| `.layer-card` | border-left 4px `--ds-primary` · mêmes variantes |
| `.room-card` | min-height:150px, border-left secondaire |
| `.card-surgeon` | cursor pointer, hover translateY + border primary |

### En-têtes de section (card-header gradient)

| Classe | Couleur |
|---|---|
| `.doc-header-primary` | Gradient bleu (ou fond blanc selon contexte) |
| `.doc-header-success` | Gradient vert |
| `.doc-header-warning` | Gradient jaune |
| `.doc-header-danger` | Gradient rouge |
| `.doc-header-info` | Gradient cyan |

### Boutons

| Classe | Comportement |
|---|---|
| `.btn-fiche` | Bouton liste texte gauche, fond page |
| `.btn-crud` | Bouton compact 0.35/0.6rem |
| `.btn-primary` | Fond `--ds-primary` |
| `.btn-cancel` | Fond rouge pâle |
| `.btn-confirm` | Fond vert |
| `.btn-duplicate` | Fond indigo |
| `.btn-secondary-soft` | Fond page, bordure, texte muted |
| `.btn-sm-icon` | Padding ultra-compact icône |

### Badges & Statuts

| Classe | Couleur |
|---|---|
| `.badge-soft-primary` | `#dbeafe / #1e40af` |
| `.badge-soft-success` | `#d1fae5 / #065f46` |
| `.badge-soft-warning` | `#fef3c7 / #92400e` |
| `.badge-soft-danger` | `#fee2e2 / #b91c1c` |
| `.badge-soft-info` | `#e0f2fe / #0369a1` |
| `.badge-soft-secondary` | `#e2e8f0 / #334155` |
| `.badge-valid` | Vert pâle, taille 0.7rem |
| `.badge-admin` | Rouge plein, uppercase |
| `.status-dot` | Point 10px · `.available .maintenance .broken` |
| `.sync-indicator` | Point 10px · `.sync-connected .sync-pending .sync-error` (avec glow) |
| `.pole-badge` | Point 12px inline |

### Avatars ⚠️ COUCHE THEME-BASE

| Classe | Taille |
|---|---|
| `.avatar` | Base : rounded-circle, bg primary, color white |
| `.avatar-sm` | 32×32px, font 0.75rem |
| `.avatar-md` | 40×40px, font 0.875rem |
| `.avatar-lg` | 48×48px, font 1rem |

> ⚠️ Ces classes sont de `theme-base.css`. Les `.cds-avatar-*` de `cds-overrides.css`
> ont des dimensions différentes (voir Couche 2). Ne pas mélanger.

### Skeleton (theme-base)

| Classe | Comportement |
|---|---|
| `.skeleton` | Gradient shimmer animé (keyframe `skeleton-loading`) |
| `.placeholder-circle` | Cercle 40×40 pour skeleton Bootstrap |

> ⚠️ Préférer `.placeholder-glow` Bootstrap (D-2026-03-16-T06).
> `.skeleton` theme-base = héritage, ne pas recréer.
> Pour un shimmer custom dans un module → utiliser `.cds-shimmer` (Couche 2).

### Composants interactifs

| Classe | Comportement |
|---|---|
| `.chip` | Badge cliquable arrondi · `.active` état actif |
| `.icon-ctx` | Icône contextuelle 22px cercle · `.icon-ctx-info/warning/danger` |
| `.nav-tabs-card` | Onglets style carte |
| `.table-crud` | Table stylée avec th uppercase |
| `.table-mobile` | Table responsive card-style mobile |
| `.mobile-scroll` | overflow-x auto touch |
| `.section-divider` | Séparateur tirets uppercase |
| `.search-container` | Position relative pour autocomplete |
| `.suggestion-item` | Item dropdown autocomplete |

### Images

| Classe | Comportement |
|---|---|
| `.img-placeholder` | Zone dashed avec icône |
| `.placeholder-img` | Miniature 50×50 gris |
| `.equip-photo-thumb` | Photo 50×50 object-fit cover |
| `.equip-photo-large` | Photo max-height 300px |
| `.img-secure` | Image sécurisée avec fallback fond |

### Alertes (override theme-base)

`.alert-warning`, `.alert-info`, `.alert-danger`, `.alert-success` — couleurs pastel WCAG.

---

## COUCHE 2 — cds-overrides.css v1.7.0

> Ces classes complètent theme-base pour BDB spécifiquement.
> Variables : `--pe-*` (fallback Bootstrap — dette CSS-DETTE-01 → migration `--cds-*` Phase 3)

### Formulaires — Placeholders ⭐ NOUVEAU v1.1.0

> Règle globale appliquée à tous les `.form-control`, `.form-select` et `textarea`.
> Ne jamais redéfinir dans un module.

```css
/* Comportement : placeholder grisé + italique → distingue valeur saisie vs suggestion */
.form-control::placeholder,
.form-select::placeholder,
textarea.form-control::placeholder {
  color: #adb5bd;
  font-style: italic;
  opacity: 1;
}
```

### Modales (override global — D-2026-03-15-T03)

`.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`, `.modal-body .card` — stylisés CDS.
Ne jamais redéfinir dans un module.

### Toast

| Classe | Usage |
|---|---|
| `.cds-toast` | Toast standard BDB (remplace `#toastInfo` — INC-03) |
| `#toastInfo` | Compat legacy — préférer `.cds-toast` |

### Animations

| Classe | Usage |
|---|---|
| `.cds-card-animated` | Container → `.card` enfants animés fadeInUp |
| `.cds-list-animated` | Container → `>*` enfants animés fadeInUp |

> Ajouter sur le container de grille Supabase, jamais sur `.card` directement.

### Shimmer centralisé ⭐ NOUVEAU v1.1.0

> Remplace `@keyframes ann-shimmer` (annuaire-ui.css) et `@keyframes bdb-shimmer` (index-ui.css).
> Ces deux keyframes ont été supprimés des modules lors de la consolidation CSS 2026-04-10.

| Classe | Usage |
|---|---|
| `.cds-shimmer` | Animation shimmer générique — squelette de chargement custom |

```css
/* Utilisation : ajouter .cds-shimmer sur l'élément à animer */
/* Ne pas recréer de @keyframes shimmer dans un module */
@keyframes cds-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.cds-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: cds-shimmer 1.5s infinite;
}
```

> ⚠️ Pour du skeleton Bootstrap natif → préférer `.placeholder-glow` (Couche 3).
> `.cds-shimmer` = cas où le rendu custom est nécessaire (gradient spécifique).

### Scrollbar masquée ⭐ NOUVEAU v1.1.0

> Remplace les règles scrollbar dupliquées dans faq-ui.css et thesaurus-ui.css.

| Classe | Usage |
|---|---|
| `.cds-hide-scrollbar` | Masque la scrollbar (scroll fonctionnel, scrollbar invisible) |

```css
.cds-hide-scrollbar {
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE/Edge legacy */
}
.cds-hide-scrollbar::-webkit-scrollbar {
  display: none;               /* Chrome/Safari */
}
```

> Ajouter la classe dans le HTML sur le conteneur scrollable — ne pas recréer en CSS module.

### Avatars BDB ⚠️ DIFFÉRENTS DE THEME-BASE

| Classe | Taille | Contexte |
|---|---|---|
| `.cds-avatar-xs` | 28×28 | Avatar liste générique |
| `.cds-avatar-sm` | 36×36 + cursor pointer | Avatar clickable |
| `.cds-avatar-md` | 40×40 | Avatar profil |
| `.cds-avatar-lg` | 44×44 + flex-shrink:0 | Avatar grand format |
| `.cds-stat-icon` | 44×44 + flex-shrink:0 | Icône statistique |
| `.bdb-avatar-btn` | 34×34 | Bouton avatar header shell |
| `.bdb-avatar-xs` | 26×26 | Avatar offcanvas footer shell |

### Images

| Classe | Usage |
|---|---|
| `.cds-thumbnail` | 80×60 object-fit cover |
| `.cds-thumbnail-lg` | 90×70 object-fit cover |
| `.cds-img-remove-btn` | 20×20 bouton suppression overlay |
| `.cds-lightbox-img` | max-height 90vh contain |
| `.cds-lightbox-img-80` | max-height 80vh contain |

### Z-index

| Classe | Valeur |
|---|---|
| `.cds-z-10` | 10 |
| `.cds-modal-l2` | 1060 |
| `.cds-modal-l3` | 1070 |

### Typographie

| Classe | Taille |
|---|---|
| `.cds-text-micro` | 0.6rem |
| `.cds-text-xxs` | 0.65rem |
| `.cds-text-xs` | 0.7rem |
| `.cds-text-sm` | 0.8rem (≠ BS .small = 0.875em) |
| `.cds-label-section` | 0.68rem + letter-spacing |

### Utilitaires

| Classe | Usage |
|---|---|
| `.cds-clickable` | cursor: pointer |
| `.cds-search-input` | padding-left: 2.25rem (icône positionnée) |
| `.cds-max-280` | max-width: 280px |
| `.badge-count` | Badge numérique monospace |

### Erreurs Supabase

| Classe | Usage |
|---|---|
| `.cds-error-state` | Bloc erreur centré avec icône |
| `.cds-offline-banner` | Bannière fixe top:56px · `.show` pour activer |

### Header BDB (bdb-shell.js)

| Classe | Usage |
|---|---|
| `.bdb-offcanvas` | Offcanvas fond #1e2330 |
| `.bdb-offcanvas-sub` | Texte sous-titre offcanvas |
| `.bdb-nav-link` | Lien nav offcanvas · `.active` |
| `.bdb-module-header` | Header module 56px |
| `.bdb-module-header-icon` | Icône header couleur primary |
| `.bdb-module-header-title` | Titre header font-weight 600 |
| `.bdb-menu-btn` | Bouton hamburger |
| `.bdb-sync-dot` | Point vert 8px · remplacer couleur avec `.bg-danger` etc |
| `.bdb-user-menu` | Dropdown user · `.open` pour afficher |
| `.bdb-user-menu-item` | Item menu · `.danger` pour rouge |
| `.bdb-menu-sep` | Séparateur 1px |
| `.bdb-avatar-img` | Image dans bouton avatar |
| `.bdb-avatar-btn--photo` | Bouton avatar mode photo (fond transparent) |
| `.bdb-preview-submenu` | Sous-menu prévisualisation admin |

### Boutons étendus

| Classe | Usage |
|---|---|
| `.btn-ghost` | Bouton transparent discret (actions tableau) |
| `.btn-xs` | Taille bouton inférieure à `.btn-sm` |

### Badges métier

| Classe | Couleur |
|---|---|
| `.badge-fn-medecin` | `#dbeafe / #1d4ed8` |
| `.badge-fn-cadre` | `#ede9fe / #7c3aed` |
| `.badge-fn-infirmier` | `#dcfce7 / #15803d` |
| `.badge-fn-aide` | `#ffedd5 / #c2410c` |

---

## COUCHE 3 — Bootstrap 5.3.2 natif (à préférer quand disponible)

> Toujours vérifier Bootstrap avant de créer une classe CDS.

| Besoin | Classe BS |
|---|---|
| Texte tronqué ellipsis | `.text-truncate` |
| Flex shrink 0 | `.flex-shrink-0` |
| Overflow hidden | `.overflow-hidden` |
| Cursor pointer | ❌ pas de classe BS — utiliser `.cds-clickable` |
| Table responsive | `.table-responsive` |
| Skeleton / loading | `.placeholder .placeholder-glow` |
| Rounded circle | `.rounded-circle` |
| Object fit cover | `.object-fit-cover` (BS 5.3+) |
| Object fit contain | `.object-fit-contain` (BS 5.3+) |
| Gap utilitaires | `.gap-1` à `.gap-5` |
| Stack vertical | `.vstack` |
| Stack horizontal | `.hstack` |
| Position relative | `.position-relative` |
| Position absolute | `.position-absolute` |
| Visually hidden | `.visually-hidden` |
| Opacity 25/50/75 | `.opacity-25 .opacity-50 .opacity-75` |
| Border dashed | ❌ pas de classe BS — inline acceptable |
| Responsive display | `.d-none .d-md-block` etc. |

---

## CONFLITS CONNUS ET RÉSOLUTIONS

| Conflit | Cause | Résolution |
|---|---|---|
| `.avatar-sm` (theme-base 32px) vs `.cds-avatar-sm` (cds-overrides 36px) | Deux couches, dimensions différentes | **BDB shell** → `.bdb-avatar-*` · **modules génériques** → `.cds-avatar-*` · **hors BDB** → `.avatar-*` theme-base |
| `.skeleton` (theme-base) vs `.cds-shimmer` (cds-overrides) | Deux animations shimmer, noms distincts | `.skeleton` = héritage theme-base uniquement · `.cds-shimmer` = shimmer custom BDB · Ne pas mixer |
| `@keyframes ann-shimmer` / `bdb-shimmer` (SUPPRIMÉS 2026-04-10) | Étaient dupliqués dans annuaire-ui + index-ui | Fusionnés dans `@keyframes cds-shimmer` — toute référence résiduelle = bug à corriger |
| `.card:hover` (theme-base translateY-3px) vs `.ars-card:hover` (module) | Double hover si classe combinée | Normal — le module peut override sur sa propre classe scopée |
| `.modal-content` (theme-base) vs cds-overrides | cds-overrides est plus spécifique | cds-overrides prime — ne pas redéfinir dans les modules |
| Règles scrollbar dans faq-ui / thesaurus-ui (SUPPRIMÉES 2026-04-10) | Étaient dupliquées | Remplacées par `.cds-hide-scrollbar` — toute règle scrollbar résiduelle en module = violation |

---

## RÈGLES DE NOMMAGE MODULE

```
Classe nouvelle dans un module → TOUJOURS :
  1. Préfixe du module : .ars-*, .cb-*, .anat-*, .ann-*, .cours-*...
  2. Scopée au conteneur parent : #arsenalMain .ars-card { }
  3. Jamais de règle globale (.card, .btn, body...) dans [module]-ui.css

Keyframe dans un module :
  @keyframes [module]-[nom] { }
  Exemple : @keyframes ars-pulse, @keyframes cb-fadeIn
  ⚠️ JAMAIS @keyframes shimmer ou @keyframes *-shimmer → utiliser .cds-shimmer

Variable CSS dans un module :
  Utiliser --ds-* et --bs-* existantes.
  Si valeur custom locale → --[module]-[nom] dans le scope du module.
```

---

## CHECKLIST PRÉ-GÉNÉRATION CSS MODULE

```
Avant d'écrire la première règle d'un [module]-ui.css :

[ ] La classe existe dans theme-base.css ?       → utiliser telle quelle
[ ] La classe existe dans cds-overrides.css ?    → utiliser telle quelle
[ ] Bootstrap 5.3 la couvre ?                    → classe BS dans le HTML
[ ] Keyframe nouveau ?                           → préfixe [module]-
[ ] Keyframe shimmer ?                           → NE PAS créer → utiliser .cds-shimmer
[ ] Règle globale non scopée ?                   → INTERDIT-17, scopée #[module]App
[ ] style= inline dans le HTML ?                 → INTERDIT-C2, créer classe CDS ou module
[ ] onclick= dans le HTML ?                      → INTERDIT, addEventListener uniquement
[ ] Scrollbar à masquer ?                        → NE PAS créer → utiliser .cds-hide-scrollbar
[ ] Placeholder à styler ?                       → NE PAS créer → global via cds-overrides
```

---

## EXCEPTION AUTORISEE — Rich Text (Quill)

Les modules utilisant un editeur Quill (cours, preferences, installation, fiches,
transmissions, anatomie) PEUVENT cibler des elements natifs (h2, h3, ul, ol,
blockquote, img, p) a l'interieur de leur classe de contenu :

```css
.cours-view-content h2 { }
.pref-view-description h3 { }
.fiche-view-description img { }
.trans-prose p { }
```

Convention : toujours utiliser la classe module comme parent scope.
Jamais de selecteur nu (h2 {}, img {}) dans un fichier module.
