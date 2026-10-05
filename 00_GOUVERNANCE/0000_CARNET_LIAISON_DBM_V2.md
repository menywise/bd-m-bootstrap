# CARNET DE LIAISON DB&M
## Protocole de communication inter-instances Claude
> Version 2.1 — 2026-05-10 (cascade alignement S129)
> Source de vérité : table `atelier_principes` (Supabase cloud ecpzrygzdugwwkqbsajn)
> Porteur : Manu (créateur, développeur solo)
> Garde-fou : `GARDE-FOU-CASCADE-EVOL-01` — toute évolution chaîne CSS/JS/pattern HTML déclenche MAJ obligatoire de ce fichier.

---

## 0. MODE D'EMPLOI

Ce carnet voyage avec Manu entre les instances Claude (AI, Design, Code, Cowork).
Chaque instance : LIT au démarrage → RESPECTE les périmètres → ENRICHIT section 8 en fin de session → NE CASSE PAS le travail des autres.

Préambule à coller au démarrage d'une session :
```
Voici le Carnet de Liaison DB&M V2.
Je suis dans Claude [AI|Design|Code|Cowork].
Lis les sections qui te concernent. Respecte les périmètres.
En fin de session, enrichis la section 8 (Journal).
```

---

## 1. IDENTITÉ PROJET

- **Nom public** : Des Blocs & Moi (DB&M) — CONV-BRANDING-DBM-01
- **Nom technique** : BDB (code, prefixes SQL/CSS/JS uniquement) — INTERDIT-BRANDING-BDB-SURFACE-01
- **Nature** : Application knowledge management pour le bloc opératoire
- **Public** : IBODE, IDE, cadres de bloc, chirurgiens
- **Philosophie** : Participative, terrain-first, holacratie fonctionnelle — INTERDIT-PHILO-H1
- **Module de référence** : `modules/glossaire/` — REF-MODULE-DBM-01

---

## 2. STACK TECHNIQUE (non négociable)

| Couche | Choix | Interdit |
|---|---|---|
| HTML | Vanilla, sémantique | React, Vue, Angular, tout framework front |
| CSS | Bootstrap 5.3.3 + Smarty V5 + CDS overrides | Tailwind, SASS build, CSS-in-JS |
| JS | Vanilla ES5/ES6, pas de modules ES | Node, npm, bundlers, TypeScript |
| Backend | Supabase cloud PostgreSQL + Auth + RLS | Serveur custom |
| Hébergement | FTP OVH fichiers statiques | CI/CD, Docker, Vercel |
| Éditeur | Notepad++ sous Windows | VS Code imposé |
| Icônes | Bootstrap Icons (bi-*) uniquement — CONV-ICONS | Font Awesome interdit |

---

## 3. PÉRIMÈTRES

### Claude Design — Directeur Artistique
**Autorité** : palettes, layouts, composants visuels, typographie, micro-interactions, hiérarchie visuelle
**Produit** : maquettes HTML/CSS, tokens design, palettes par module/univers
**Contraintes** (lire section 4 + 5) :
- Le shell est réel (`bdb-shell.js`) — pas de mock header
- Utiliser `<section class="app-zone" data-zone="...">` — CONV-APP-ZONE-02
- Préfixer les classes CSS avec le slug module — CONV-CARD-03
- Zéro `style=` inline — INTERDIT-C2
- Zéro `onclick=` — INTERDIT-B2 sens large
- Couleurs module = propres à chaque module (`app_modules.color`), pastel doux — jamais hardcodées — INTERDIT-MODULE-COLOR-01
- CTA principal = `btn-module` ou `btn-universe` — jamais `btn-primary` — INTERDIT-CTA-PRIMARY-MODULE-A11
- Balise surface obligatoire ligne 1 après DOCTYPE — CONV-SURFACE-MARKER-HTML
- Tables = pagination, jamais scroll vertical — INTERDIT-TABLE-SCROLL
- Wording = positif, hypnose conversationnelle, zéro négatif — CONV-UX-WORDING-01

### Claude AI — Architecte technique + Mémoire
**Autorité** : doctrine CDS, schéma Supabase, skills, conventions, logique métier, historique
**Produit** : code complet, migrations SQL, skills, documentation technique
**Contrainte** : absorber les livrables Design au lieu de faire du Bootstrap générique

### Claude Code — Exécutant
**Autorité** : implémentation fichiers, debug, tests, scripts PowerShell
**Contrainte** : ne jamais décider d'architecture/design sans validation AI ou Design

### Claude Cowork — Coordination
**Autorité** : documentation non-technique, synthèses, supports, rédaction
**Contrainte** : respecter vocabulaire section 7, wording CONV-UX-WORDING-01

---

## 4. RÈGLES CDS V5 — INTERDITS

Chaque code réf. est vérifiable : `SELECT * FROM atelier_principes WHERE ref = '...'`

### 4.1 HTML

| Ref | Interdit |
|---|---|
| INTERDIT-C2 | Zéro `style=` statique dans HTML. Exception : couleurs dynamiques DB, largeurs progressbar |
| INTERDIT-E1 | `#bdb-shell` = premier enfant de `#wrapper`, jamais de `<main>` (V5) |
| CONV-SURFACE-MARKER-HTML | Ligne 1 après DOCTYPE : `<!-- DBM | Surface: MODULE | Auth: ... | Shell: oui -->` |
| CONV-APP-ZONE-02 | Chaque zone dans `<section class="app-zone" data-zone="...">` |
| CONV-APP-ZONE-01 | Ordre fixe : Breadcrumb → Page Title → Filters → Content |
| CONV-APP-ZONE-05 | Modales hors conteneur app-content (avant `</body>`) |

### 4.2 CSS

| Ref | Règle |
|---|---|
| CONV-CHAIN-E | Ordre CSS V5.1 (FAB chaîne 2026-05-08, vérifié S129) : **Bootstrap 5.3.3 → Bootstrap Icons 1.11.1 → `css/dbm-theme.css` (LOCAL) → `css/bdb-ui-kit.css` → `css/dbm-module-color.css` → `[module]-ui.css`**. theme-base CDN **déprécié pour modules**. theme-print supprimé. cds-overrides.css **plus chargé par les modules V5.1** (vit encore sur ~50 pages V4 résiduelles, voir ARB-DETTE-V4-RESIDUELLE-01). |
| P-CDS-01 | theme-base.css (CDN menywise/BDB) **déprécié pour modules** depuis V5.1. Modules utilisent `css/dbm-theme.css` (local, source unique de vérité visuelle). Hash CDN historique encore valide pour pages V4 résiduelles : `@4faebd0280e559235fcbfaec2b24d407cebf0a95`. Jamais `@latest`. |
| P-CDS-02 | layout-dark.css INTERDIT — zéro thème sombre |
| REF-CSS-DBM-01 | `dbm-module-color.css` = source unique du pattern couleur module (12 sections) |
| REF-CSS-DBM-THEME | `css/dbm-theme.css` = système de design swappable, source unique de vérité visuelle. Préfixe `.app-*`. Ne dépend ni de Smarty V5, ni de theme-base.css, ni de cds-overrides.css. |
| INTERDIT-MODULE-COLOR-01 | Jamais hardcoder une couleur dans un module — tout via variables CSS |
| INTERDIT-COULEUR-01 | Rouge interdit dans la navigation modules |
| INTERDIT-COULEUR-02 | Toutes les couleurs modules = pastel doux |
| INTERDIT-COULEUR-SATUREE-01 | Classes Bootstrap saturées interdites en surface (sauf btn-danger suppression + alerts erreur) |
| INTERDIT-17 | Override Bootstrap scopé au conteneur parent obligatoire |
| INTERDIT-CSS-PLACEHOLDER | Ne jamais styler `::placeholder` dans un module CSS |
| INTERDIT-CSS-SCROLLBAR | Zéro `scrollbar-width:none` — utiliser `.cds-hide-scrollbar` |
| INTERDIT-CSS-SHIMMER | Zéro `@keyframes *-shimmer` local — utiliser `.cds-shimmer` |

### 4.3 JavaScript

| Ref | Règle |
|---|---|
| CONV-CHAIN-E | Ordre JS V5.1 : **Bootstrap bundle → `bdb-modal-a11y` → Supabase SDK → `supabase-client` → `bdb-ui` → `bdb-invite-guard` → `bdb-shell` → [socle partagés : bdb-search, bdb-media, bdb-demo, bdb-glossaire-tooltip, ...] → `[module]-app.js` → `bdb-pwa.js` (fin de chaîne)**. |
| P-CDS-04 | `bdb-ui.js` expose : `escHtml`, `bdbToast`, `bdbShowState`, `skeletonRows`, `cdsShowGridError`, `cdsShowOfflineBanner`, `debounce` — jamais les redéfinir (INTERDIT-JS-02) |
| INTERDIT-JS-01 | Zéro JS inline après migration shell — tout dans `[module]-app.js` |
| INTERDIT-JS-03 | Zéro fichier module dans `js/` racine — modules dans `modules/[slug]/` |
| INTERDIT-A1 | Zéro duplication URL/clé Supabase — un seul `supabase-client.js` |
| INTERDIT-A3 | Client Supabase unique : `window.bdb` |
| INTERDIT-B1 | Zéro auth dupliquée — tout dans `bdb-shell.js` |
| INTERDIT-B2 | Zéro requête `profiles_directory` ou `user_roles` dans un module — utiliser `window.bdbUser` |
| INTERDIT-B3 | Zéro `initAuth()` local — rôle via `window.bdbUser.isAdmin` |
| INTERDIT-C6 | `escHtml()` obligatoire sur tout `innerHTML` avec donnée DB |
| INTERDIT-D4 | `.select()` obligatoire sur `.update()` et `.delete()` Supabase |
| INTERDIT-D6 | Zéro `console.log` en production |
| INTERDIT-C5 | Optimistic Update : périmètre fermé uniquement (toggle binaire réversible) |

### 4.4 Boutons et navigation

| Ref | Règle |
|---|---|
| CONV-BTN-01 | CTA principal = `btn-module` (hérite couleur module) — jamais `btn-primary` |
| CONV-BTN-02 | Secondaire = `btn-module-outline` |
| INTERDIT-CTA-PRIMARY-MODULE-A11 | `.btn-universe` pour CTA module. `.btn-primary` = actions transverses uniquement |
| INTERDIT-HOVER-BRIGHTNESS-A15 | Jamais `filter:brightness()` sur boutons — bascule vers `--module-color-strong` |
| P-CDS-05 | Sous-navigation = `nav-pills` — jamais `nav-tabs` |
| INTERDIT-C4 | Bouton action primaire = toolbar uniquement — jamais dans header BDB |
| CONV-TOOLBAR-01→05 | Toolbar : recherche extensible gauche, selects 180px, CTA 180px droite, tout en `btn-sm` |

### 4.5 Tables

| Ref | Règle |
|---|---|
| INTERDIT-TABLE-SCROLL | Tables données = pagination, jamais scroll vertical. **Exception** : tables paramétrage ≤50 lignes avec contrôles interactifs |

### 4.6 Modales

| Ref | Règle |
|---|---|
| CONV-MODAL-01 | Bandeau coloré couleur module sur toutes les modales |
| CONV-MODAL-02 | Backdrop opacité 0.65 + flou 4px |
| CONV-MODAL-03 | Largeur uniforme entre modales d'un même module |
| CONV-MODAL-04 | `modal-dialog-centered` + `modal-dialog-scrollable` |
| CONV-MODAL-05 | CTA modales = `btn-module` |
| CONV-MODAL-06 | Titre judicieux obligatoire |
| CONV-MODAL-07 | Croix fermeture colorée au thème module |
| CONV-MODAL-08 | Variables CSS root dans HEAD obligatoire pour modales |

### 4.7 Wording

| Ref | Règle |
|---|---|
| CONV-UX-WORDING-01 | Empathique, positif, hypnose conversationnelle. Zéro "pas", "ne...pas", "sans", "jamais", "aucun", "impossible" en surface utilisateur. Boutons à la 1ère personne. Erreurs = rassurantes + action concrète. |

### 4.8 SQL / Supabase

| Ref | Règle |
|---|---|
| INTERDIT-SQL-01 | Fichier `.sql` sauvé sur disque AVANT toute exécution |
| CONV-SQL-IDEMPOTENT | Migrations idempotentes (`IF NOT EXISTS`, `ON CONFLICT`) |
| CONV-SQL-BATCH | Batch INSERT ~200 rows/statement, ~500 rows/file |
| CONV-SQL-STATUT-EDITORIAL | Contenu éditorial : 6 états (brouillon→publié→archivé) |
| INTERDIT-CCAM-01 | Zéro code CCAM sans vérification Perplexity ou Ameli |

---

## 5. SYSTÈME COULEUR MODULE

### 5.1 Principe (source : `app_modules.color`)

Chaque module possède **sa propre couleur** stockée dans `app_modules.color`. Le groupe (`app_groups`) structure la navigation du portail mais **ne cascade pas** sa couleur vers les modules enfants.

Exemples réels en base :

| Module | Groupe | Couleur module |
|---|---|---|
| planning | bloc | `#0d6efd` |
| medacta | bloc | `#6c757d` |
| annuaire | equipe | `#198754` |
| glossaire | savoir | `#6610f2` |
| admin | pilotage | `#dc3545` |
| disc | espace_perso | `#fd7e14` |

→ `rempla-midi` n'est pas encore dans `app_modules`. Sa couleur sera définie à l'INSERT.

### 5.2 Variables CSS (injectées par `dbm-module-color.css` — REF-CSS-DBM-01)

À partir de la couleur de base du module, `dbm-module-color.css` dérive 4 variables :

```
--module-color        → pastel de base
--module-color-strong → saturée pour hover/focus
--module-color-text   → sombre pour texte lisible
--module-color-soft   → transparente pour fonds
```

CONV-MODULE-COLOR-01 : injectées sur `app-content` via attribut `style` (exception INTERDIT-C2).
CONV-MODULE-COLOR-02 : dupliquées dans `:root` via `<style>` dans HEAD pour les modales.

### 5.3 Cascade couleur

- Titres h2-h4, `<strong>`, liens hors nav → `--module-color-strong` — CONV-FONT-MODULE-01
- CTA principal → `btn-module` / `btn-universe` — CONV-BTN-01
- Card principale → bordure gauche 3px — CONV-CARD-01
- Cards JS → `.{prefix}-card` hérite via section 9 de `dbm-module-color.css` — CONV-CARD-02
- Modales → bandeau couleur module — CONV-MODAL-01
- Toasts/alerts → couleurs status universelles (vert/jaune/rouge/bleu) — CONV-COLOR-STATUS-01

### 5.4 Rôle de Design

Design propose les **layouts, proportions, composants visuels et tokens de design**. La couleur effective du module est celle de `app_modules.color`, transformée par `dbm-module-color.css`. Si Design propose une couleur pour un nouveau module, elle sera enregistrée dans `app_modules.color` après validation Manu — mais toujours conforme CONV-PALETTE-PASTEL-TOTALE-01 et INTERDIT-COULEUR-02 (pastel doux).

### 5.5 Mise à jour 2026-05-08

CONV-COULEUR-MODULE-01 corrigée en base : "couleur module = propre à chaque module" (remplace l'ancienne règle "= celle du groupe").

---

## 6. STRUCTURE HTML DE RÉFÉRENCE V5.1 (vérifiée S129 contre 40+ modules réels)

> **Source matrice** : `modules/glossaire/index.html` (REF-MODULE-DBM-01).
> Tout module DOIT calquer cette structure exacte. Toute déviation = audit S129 pattern violé.

```html
<!DOCTYPE html>
<!-- CONV-SURFACE-MARKER-HTML : ligne 1 obligatoire après DOCTYPE -->
<!-- DBM | Surface: MODULE | Auth: bdb-shell.js | Shell: oui -->
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>[Nom Module] — Des Blocs &amp; Moi</title>

  <!-- Chaîne CSS V5.1 — CONV-CHAIN-E (FAB chaîne 2026-05-08, vérifié S129) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <link href="../../css/dbm-theme.css" rel="stylesheet"/>
  <link href="../../css/bdb-ui-kit.css" rel="stylesheet"/>
  <link href="../../css/dbm-module-color.css" rel="stylesheet"/>
  <link href="[module]-ui.css" rel="stylesheet"/>

  <!-- Variables couleur module dans :root pour modales — CONV-MODULE-COLOR-02 -->
  <style>
    :root {
      --module-color:        #c4b5fd;     /* pastel base — vient de app_modules.color */
      --module-color-strong: #a78bfa;     /* saturée hover/focus */
      --module-color-text:   #1e1b4b;     /* texte sombre lisible */
      --module-color-soft:   rgba(196,181,253,0.15);
    }
  </style>
</head>
<body class="sidebar-closed">

  <div id="wrapper">

    <!-- INTERDIT-E1 V5.1 : #bdb-shell premier enfant de #wrapper -->
    <div id="bdb-shell"
         data-module-title="[Nom Module]"
         data-module-icon="bi-[icon]"
         data-root-path="../../"
         data-login-mode="modal"
         data-shell-theme="dbm">
    </div>

    <div id="wrapper_content">
      <div class="app-layout">
        <main class="app-main" id="main-content">

          <!-- CONV-MODULE-COLOR-01 : variables couleur sur app-content -->
          <div class="app-content"
               data-module-color="[groupe]"
               style="--module-color:#c4b5fd;--module-color-strong:#a78bfa;--module-color-text:#1e1b4b;--module-color-soft:rgba(196,181,253,0.15)">

            <!-- CONV-APP-ZONE-01 : ordre fixe Breadcrumb → Page Title → Filters → Content -->
            <section class="app-zone" data-zone="Breadcrumb">...</section>
            <section class="app-zone" data-zone="Page Title">...</section>
            <section class="app-zone" data-zone="Filters">...</section>
            <section class="app-zone" data-zone="Content">...</section>

          </div><!-- /app-content -->

          <footer class="app-footer">
            <span>&copy; 2026 <span class="app-nom"></span></span>
          </footer>

        </main>
      </div><!-- /app-layout -->
    </div><!-- /wrapper_content -->

  </div><!-- /wrapper -->

  <!-- Modales hors #wrapper — CONV-APP-ZONE-05 -->
  <div class="modal fade" id="modal[Module]" tabindex="-1">...</div>

  <!-- Toast container hors #wrapper -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3">...</div>

  <!-- Chaîne JS V5.1 — CONV-CHAIN-E -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../../js/bdb-modal-a11y.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="../../js/supabase-client.js"></script>
  <script src="../../js/bdb-ui.js"></script>
  <script src="../../js/bdb-invite-guard.js"></script>
  <script src="../../js/bdb-shell.js"></script>
  <!-- Socle partagé optionnel : bdb-search, bdb-media, bdb-demo, bdb-glossaire-tooltip, etc. -->
  <script src="[module]-app.js"></script>
  <!-- PWA en fin de chaîne -->
  <script src="../../js/bdb-pwa.js"></script>

</body>
</html>
```

### Notes structure V5.1

- `id="middle"` **n'existe plus** depuis V5.1 (migration vers `<main class="app-main" id="main-content">`)
- `class="app-content"` est le **porteur des variables CSS couleur module** (CONV-MODULE-COLOR-01)
- `data-module-color="[groupe]"` = nom du groupe (`bloc`, `equipe`, `savoir`, `pilotage`, `espace_perso`)
- Couleur effective = pastel doux (CONV-COULEUR-MODULE-01), source = `app_modules.color`
- Hash CDN `theme-base` **n'apparaît plus** dans les modules V5.1
- `cds-overrides.css` **n'apparaît plus** dans les modules V5.1 (vit encore en pages V4 résiduelles)

---

## 7. VOCABULAIRE COMMUN

| Terme DB&M | Signification | Ne pas dire |
|---|---|---|
| Module | Page fonctionnelle autonome | "composant", "widget" |
| Shell | Barre chargée par `bdb-shell.js` | "header", "navbar", "mock header" |
| Socle | Fichiers JS/CSS partagés | "framework", "core" |
| CDS | Code Design System | (plus large que "design system") |
| Thésaurus | Table de référence métier | "dictionnaire", "lookup" |
| Portail | Page d'accueil modules | "dashboard", "home" |
| Membre | Inscrit dans `profiles` | "user", "compte" |
| Cadre | Admin fonctionnel | "admin" seul |
| Créateur | Manu = super-admin technique | "owner" |
| Surface | Type de page (MODULE, SITE, ADMIN...) | "template", "layout" |
| Univers | Groupe de modules (`app_groups`) | "catégorie" |

---

## 8. JOURNAL DES DÉCISIONS

> Chaque instance ajoute ici avant de rendre la main.

### 2026-05-08 — Claude AI — rempla-midi POC
- Source agents = `profiles_directory` WHERE `fonction='infirmier'` → **viole INTERDIT-B2** — exception à arbitrer par Manu ou pattern à créer (RPC/vue dédiée)
- Source chirurgiens = `profiles_directory` WHERE `fonction='medecin'` → même violation
- 3 rôles : Panseur, Instru, Panseur+crise
- Selects exclusifs inter-salles (pattern planning)
- Doublons prénoms : `known_as` prioritaire, sinon auto initiale nom
- Persistance Supabase : `rempla_agents_config` + `rempla_incompat`
- Module pas encore dans `app_modules` → groupe à décider (bloc ou équipe)

### 2026-05-08 — Claude Design — maquette rempla-midi
- Hero gradient + 4 KPIs
- Warm tones proposés (#faf7f2, #ebe7dc, #7a6e5b) → **à valider** si transversal ou module-specific
- Couleur sarcelle `#2f6e6c` proposée → **à enregistrer dans `app_modules.color`** si validée par Manu (conforme pastel ? à vérifier INTERDIT-COULEUR-02)
- Agents badges pastels par catégorie → pattern absorbé
- Tables config avec nom court bold + nom complet sous-texte → absorbé
- KPI strip grid → absorbé
- Timeline légende → absorbé

### 2026-05-08 — Carnet V1 disqualifié
7 erreurs majeures identifiées. V2 reconstruit depuis `atelier_principes` en base (130+ règles).

---

## 9. VIOLATIONS CONNUES À CORRIGER (module rempla-midi)

| Violation | Ref | Statut |
|---|---|---|
| SELECT profiles_directory dans le module | INTERDIT-B2 | **Ouvert** — créer RPC ou vue dédiée |
| Shell hors `#wrapper` (dans `<main>`) | INTERDIT-E1 | **Ouvert** — restructurer HTML |
| Couleurs hardcodées (#2f6e6c, #faf7f2...) | INTERDIT-MODULE-COLOR-01 | **Ouvert** — définir dans app_modules + variables dbm-module-color |
| btn-primary / btn-rm sur CTA | INTERDIT-CTA-PRIMARY-MODULE-A11 | **Ouvert** — btn-module / btn-universe |
| CDN hash `@63905396` dans les skills | P-CDS-01 | **Ouvert** — mettre à jour 2 skills |
| Module pas dans app_modules | — | **Ouvert** — INSERT après choix couleur |
| Table config scroll vertical | INTERDIT-TABLE-SCROLL | **Résolu** — exception config documentée |

## 10. CONFLITS RÉSOLUS (session 2026-05-08)

| Conflit | Verdict | Action base |
|---|---|---|
| Shell `#wrapper` vs `<main>` | `#wrapper` (V5.1) | INTERDIT-E1 mis à jour |
| CDN `@63905396` vs `@4faebd02` | `@4faebd02` (modules V4 et pages site uniquement) | P-CDS-01 mis à jour |
| Chaîne CSS V5.1 modules | BS 5.3.3 → Icons 1.11.1 → **dbm-theme.css local** → bdb-ui-kit.css → dbm-module-color.css → [module]-ui.css. theme-base CDN **déprécié pour modules**. theme-print supprimé. cds-overrides.css plus chargé. | CONV-CHAIN-E mis à jour |
| Couleur module = groupe vs propre | Propre à chaque module | CONV-COULEUR-MODULE-01 mis à jour |
| Tables scroll config | Exception ≤50 lignes avec contrôles interactifs | INTERDIT-TABLE-SCROLL mis à jour |
| Doctrine cloud vs docs aval (S129) | Cloud déjà aligné code, 5 docs aval périmées | ARB-DOCTRINE-V51-DESALIGNEMENT-01 soldé par D-2026-05-10-S129-CASCADE-ALIGN |
| Pages V4 résiduelles (50+ fichiers app/, atelier/) | À trancher | ARB-DETTE-V4-RESIDUELLE-01 (pending) |
| Pattern HTML V5.1 wrapper > shell + wrapper_content > app-layout > app-main > app-content > app-zone | Vérifié contre 40 modules réels | Section 6 réécrite S129 |

---

*Ce document appartient au projet DB&M. Mis à jour par Manu et chaque instance Claude.*
