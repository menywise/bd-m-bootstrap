---
name: migration-smarty-dbm
description: >
  Process TRANSITOIRE de migration des modules de Smarty V5 vers le theme
  Des Blocs & Moi (DBM). A ARCHIVER quand tous les modules sont migres.
  Declencher OBLIGATOIREMENT avant toute migration d'un fichier HTML module
  de l'ancien systeme (theme-base.css + cds-overrides.css + layout-admin)
  vers le nouveau (dbm-theme.css + app-layout + data-shell-theme="dbm").
  Declencher aussi sur : migration DBM, passer en DBM, convertir module,
  nouveau theme, theme-base vers dbm-theme, "migrer ce module",
  "appliquer le nouveau design", data-shell-theme, app-layout,
  "meme chose que glossaire", "comme le template-demo",
  Smarty V5, layout-admin, aside-sticky.
  Ce skill est VIVANT : la section RETEX s'enrichit a chaque module migre.
  Lire le RETEX AVANT de commencer une migration pour ne pas repeter une erreur connue.
---

# Migration Smarty V5 → Des Blocs & Moi (DBM)

> **Skill transitoire.** Ce skill existe le temps de la migration des ~25 modules
> de l'ancien theme Smarty V5 vers le theme DBM. Quand le dernier module est migre,
> archiver ce skill dans `_archives/skills/`.

Ce skill guide la migration d'un module de l'ancien theme Smarty V5
vers le theme Des Blocs & Moi (DBM). Il capitalise les erreurs
rencontrees pour ne jamais les reproduire.

**Perimetre** : transition CSS + HTML enveloppe. Pas de refonte fonctionnelle.
Le JS module et les IDs DOM ne changent pas.

**Regle cardinale** : lire la section RETEX en entier AVANT de toucher au HTML.

---

## PHASE 0 — DIAGNOSTIC PRE-MIGRATION

Avant de modifier quoi que ce soit, repondre a ces 4 questions :

1. **Quels fichiers CSS le module charge-t-il ?**
   Lister la chaine CSS du `<head>`. Identifier : theme-base.css, cds-overrides.css,
   bdb-ui-kit.css, [module]-ui.css.

2. **Le JS module reference-t-il des IDs DOM ?**
   `grep -oP 'getElementById\(["\x27]\K[^"\x27]+' modules/[module]/[module]-app.js | sort -u`
   → Tous ces IDs doivent survivre a la migration.

3. **Le JS genere-t-il du HTML dynamique avec des classes Bootstrap ?**
   `grep -n 'card-body\|card-header\|card-footer\|card ' modules/[module]/[module]-app.js`
   → Si oui, le bridge CSS `--bs-card-spacer-*` dans dbm-theme.css les couvre.
   Mais noter les classes trouvees pour verification post-migration.

4. **Le module a-t-il des inner cards Bootstrap (`<div class="card">`) dans le HTML ?**
   `grep -n 'class="card\b' modules/[module]/index.html`
   → Chacune doit etre convertie en `app-card`.

Produire un **BULLETIN PRE-MIGRATION** avec les reponses avant de continuer.

---

## PHASE 1 — CHAINE CSS (dans `<head>`)

### Supprimer
```html
<!-- SUPPRIMER ces lignes -->
<link href="https://cdn.jsdelivr.net/gh/menywise/BDB@63905396.../theme-base.css"/>
<link href="../../css/cds-overrides.css"/>
```

### Ajouter (a la place)
```html
<link href="../../css/dbm-theme.css" rel="stylesheet"/>
```

### Conserver (si le module les utilise)
```html
<link href="../../css/bdb-ui-kit.css" rel="stylesheet"/>  <!-- si bdb-tabs, bdb-card, bdb-tag -->
<link href="[module]-ui.css" rel="stylesheet"/>            <!-- toujours -->
```

### Ordre final obligatoire
```
1. bootstrap@5.3.3/dist/css/bootstrap.min.css
2. bootstrap-icons@1.11.1/font/bootstrap-icons.css
3. ../../css/dbm-theme.css
4. ../../css/bdb-ui-kit.css          (si necessaire)
5. [module]-ui.css
```

---

## PHASE 2 — ATTRIBUTS SHELL

### `<body>`
```html
<!-- AVANT -->
<body data-root-path="../../">

<!-- APRES -->
<body class="sidebar-closed" data-root-path="../../">
```
Supprimer toute classe Smarty V5 sur `<body>` (pas de `layout-admin`, `aside-sticky`).

### `#bdb-shell`
```html
<!-- AJOUTER data-shell-theme="dbm" -->
<div id="bdb-shell"
     data-module-title="[Titre Module]"
     data-module-icon="bi-[icon]"
     data-root-path="../../"
     data-login-mode="modal"
     data-shell-theme="dbm">
</div>
```
Supprimer `data-shell-kind="backoffice"` si present (inutile en mode DBM).

### `#wrapper`
```html
<!-- AVANT (supprimer les classes Smarty) -->
<div id="wrapper" class="d-flex align-items-stretch flex-column min-vh-100">

<!-- APRES -->
<div id="wrapper">
```

---

## PHASE 3 — ENVELOPPE HTML

C'est la phase critique. Ne pas adapter l'ancien markup — le REMPLACER
par le squelette DBM puis injecter le contenu existant dedans.

### Squelette DBM (copier tel quel)
```html
<div id="wrapper_content">
  <div class="app-layout">
    <main class="app-main" id="main-content">
      <div class="app-content">

        <!-- Breadcrumb -->
        <nav class="app-breadcrumb" aria-label="Fil d'Ariane">
          <a href="../../index.html">Accueil</a>
          <span class="app-breadcrumb-sep"><i class="bi bi-chevron-right"></i></span>
          <span>[Nom Module]</span>
        </nav>

        <!-- Titre page + action -->
        <div class="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
          <div>
            <h1 style="font-size:1.5rem;font-weight:700;margin:0">[Titre]</h1>
            <p style="font-size:.85rem;color:var(--app-text-muted);margin:.25rem 0 0">
              [Sous-titre]
            </p>
          </div>
          <!-- Bouton action (optionnel) -->
        </div>

        <!-- Contenu principal dans app-card -->
        <div class="app-card">
          <div class="app-card-header" style="padding-bottom:0">
            <!-- NAV TABS ici -->
          </div>
          <div class="app-card-body">
            <!-- CONTENU ici -->
          </div>
        </div>

      </div><!-- /app-content -->

      <footer class="app-footer">
        <span>&copy; 2026 <span class="app-nom"></span></span>
        <div class="d-flex gap-3">
          <a href="#">Aide</a>
          <a href="#">Accessibilite</a>
        </div>
      </footer>

    </main>
  </div><!-- /app-layout -->
</div><!-- /wrapper_content -->
```

### Regles d'injection du contenu
- **Tabs** → dans `app-card-header`
- **Tab-content** → dans `app-card-body`
- **Modales, toasts** → hors de `#wrapper`, avant les `<script>`
- **Footer** → remplacer l'ancien par `<footer class="app-footer">`
- **Ancien `<main id="middle">`** → supprimer, remplace par le squelette ci-dessus

---

## PHASE 4 — CONVERSION DES INNER CARDS

Pour chaque `<div class="card ...">` a l'interieur du contenu :

| Bootstrap (AVANT) | DBM (APRES) | Notes |
|---|---|---|
| `card` | `app-card` | Conserver les classes utilitaires (h-100, mb-3...) |
| `card border-0 shadow-sm` | `app-card` | shadow et border geres par app-card |
| `card-header` | `app-card-header` | Conserver bg-* si pertinent |
| `card-header bg-light` | `app-card-header` | bg-light inutile (app-card-header a son propre style) |
| `card-body` | `app-card-body` | Conserver p-0 si intentionnel |
| `card-footer` | `app-card-footer` | |
| `card border-warning` | `app-card` + `style="border-color:var(--bs-warning)"` | |

**POURQUOI** : `app-card` fournit `--bs-card-spacer-y/x` que Bootstrap `card-body`
attend de son parent. Sans ca, padding = 0 (bug BS 5.3.3 variables scopees).

**NE PAS TOUCHER** aux `bdb-card` generes par le JS — le bridge CSS dans
dbm-theme.css les couvre automatiquement.

---

## PHASE 5 — VERIFICATION DES INPUTS

Sur une meme ligne de formulaire, tous les inputs doivent utiliser le meme
suffixe de taille :

| Melange interdit | Correction |
|---|---|
| `form-control` + `form-select-sm` | `form-control-sm` + `form-select-sm` |
| `form-control-sm` + `form-select` | `form-control-sm` + `form-select-sm` |
| `btn-sm` + `form-control` (meme row) | `btn-sm` + `form-control-sm` |

Commande de detection :
```bash
grep -n 'form-control\b' modules/[module]/index.html | grep -v 'form-control-sm'
```
Verifier chaque occurrence : si elle cohabite avec un `-sm` sur la meme ligne, corriger.

---

## PHASE 6 — AUDIT POST-MIGRATION

### 6.1 Balance des tags
```bash
# Compter les ouvertures/fermetures
grep -o '<div' modules/[module]/index.html | wc -l
grep -o '</div>' modules/[module]/index.html | wc -l
# Les deux nombres doivent etre egaux
```

### 6.2 IDs preserves
Comparer la liste d'IDs du diagnostic (Phase 0) avec le HTML migre :
```bash
grep -oP 'id="[^"]+"' modules/[module]/index.html | sort -u > /tmp/ids_post.txt
diff /tmp/ids_pre.txt /tmp/ids_post.txt
```
Aucune suppression autorisee.

### 6.3 Classes interdites residuelles
```bash
grep -n 'layout-admin\|aside-sticky\|nav-deep\|#aside-main\|theme-base' modules/[module]/index.html
```
Zero resultat attendu.

### 6.4 Chaine JS inchangee
Verifier que l'ordre des scripts n'a pas bouge :
```
bootstrap.bundle.min.js → supabase-js@2 → supabase-client.js →
bdb-ui.js → bdb-invite-guard.js → bdb-shell.js → [module]-app.js
```

---

## PHASE 7 — ENRICHIR LE RETEX

**OBLIGATOIRE** apres chaque migration.
Ajouter une entree au tableau RETEX ci-dessous avec :
- Module migre
- Date
- Probleme(s) rencontre(s)
- Correctif applique
- Regle ajoutee (si nouvelle)

Le RETEX est la memoire vivante de ce skill. Claude DOIT le lire en entier
avant de commencer une migration et l'enrichir apres chaque migration.

---

## RETEX — JOURNAL DES MIGRATIONS

> **Lire ce tableau en entier AVANT de commencer une nouvelle migration.**
> Chaque ligne est un piege evite.

| # | Module | Date | Probleme | Correctif | Regle |
|---|--------|------|----------|-----------|-------|
| 1 | glossaire | 2026-05-02 | Enveloppe HTML : simple wrapping de l'ancien markup dans app-layout produit des elements flottants, onglets dans le vide, pas de breadcrumb | Ne pas adapter l'ancien — REMPLACER par le squelette DBM et injecter le contenu dedans | → PHASE 3 : squelette copie-colle |
| 2 | glossaire | 2026-05-02 | `form-control` (taille normale) cote a cote avec `form-select-sm` (petite taille) : hauteurs differentes sur la barre de recherche | Aligner tous les inputs d'une meme ligne sur le meme suffixe de taille (`-sm`) | → PHASE 5 |
| 3 | glossaire | 2026-05-02 | `card-body` sans parent `.card` = padding 0. Bootstrap 5.3.3 definit `--bs-card-spacer-y/x` sur `.card` ; `card-body` les utilise pour son padding. `bdb-card` et `app-card` ne sont pas `.card` → variables indefinies → padding 0 | Ajouter `--bs-card-spacer-y:1rem; --bs-card-spacer-x:1rem` sur `.app-card` et `.bdb-card` dans dbm-theme.css | → PHASE 4 + bridge CSS |
| 4 | glossaire | 2026-05-02 | `app-card` sans `display:flex; flex-direction:column; overflow:hidden` : les inner cards n'ont pas de structure, les header bg debordent du border-radius | Ajouter les proprietes structurelles a `.app-card` dans dbm-theme.css | → dbm-theme.css |
| 5 | glossaire | 2026-05-02 | Inner Bootstrap `card` converties en `app-card` : les visuels (border, shadow, radius) doivent etre coherents entre `bdb-card` (JS) et `app-card` (HTML) | Bridge CSS `.bdb-card` dans dbm-theme.css qui aligne sur les tokens `--app-*` | → dbm-theme.css bridge |

---

## CHECKLIST RAPIDE (a cocher mentalement)

```
[ ] RETEX lu en entier
[ ] Phase 0 : bulletin pre-migration produit
[ ] Phase 1 : chaine CSS swappee
[ ] Phase 2 : attributs shell ajoutes
[ ] Phase 3 : enveloppe HTML remplacee (pas adaptee)
[ ] Phase 4 : inner cards Bootstrap → app-card
[ ] Phase 5 : hauteurs inputs alignees
[ ] Phase 6 : audit post-migration (tags, IDs, classes, JS)
[ ] Phase 7 : RETEX enrichi
```
