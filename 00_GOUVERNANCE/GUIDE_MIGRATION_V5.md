# GUIDE MIGRATION V5 — Reference unique
```
VERSION  : 2.0.0
DATE     : 2026-04-25
STATUT   : CANON — lire AVANT toute migration V5
ORIGINE  : Fusion CORPUS_V5_INVENTAIRE V1.3.0 (S#95)
           + retour experience atelier/ (S#96, 15 fichiers, 11 problemes)
           + conseil/ pilote S#89 + CC migration 97 fichiers
USAGE    : Claude.ai, Claude Code, Manu solo
OUTILS   : audit-v5-compliance.ps1 (scripts/)
           PROMPT_CC_MIGRATION_V5.md (00_GOUVERNANCE/)
           STENCIL_BACKOFFICE_V5_MINIMAL.html (00_GOUVERNANCE/migration_v5/)
```

---

## 1 — CHAINE CSS (ordre strict)

```html
<!-- 1. Bootstrap 5.3.3 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
<!-- 2. theme-base Smarty V5 (hash fige) -->
<link href="https://cdn.jsdelivr.net/gh/menywise/BDB@63905396c73b061f336f8f5178d738627bca601c/theme-base.css" rel="stylesheet"/>
<!-- 3. Bootstrap Icons 1.11.1 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
<!-- 4. cds-overrides (couche premium BDB) -->
<link href="[root-path]css/cds-overrides.css" rel="stylesheet"/>
<!-- 5. CSS module (optionnel, scope) -->
<link href="[module]-ui.css" rel="stylesheet"/>
```

Sources : CONV-CHAIN-E, CONV-CDN-FROZEN, CHANTIER_TECHNIQUE BLOC D/E.

### Violations connues et leur symptome

| Violation | Symptome visuel | Ref |
|---|---|---|
| BS 5.3.2 au lieu de 5.3.3 | Composants BS manquants (nav-underline, subtle colors) | P0-08 |
| Ancien hash @a75daa0 | Anciennes variables CSS, couleurs decalees | P0-07 |
| theme-print.css charge | Fichier supprime en V5, 404 silencieux | P0-01 |
| atelier-base.css charge | Classes .atl-* bannies, variables --atelier-* parasites | P1-03 |
| cds-overrides.css absent | Zero style premium .bo-*, overlay auth nu | P1-04 |
| CSS module *-ui.css en back-office | Interdit : conseil-ui, atelier-ui, admin-ui, supervision-ui | P1-03 |
| Ordre CSS inverse | theme-base ecrase BS au lieu de complementer | P0-01 |

---

## 2 — CHAINE JS (ordre strict)

```html
<!-- 1. Bootstrap bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- 2. Supabase JS -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<!-- 3. Client Supabase BDB -->
<script src="[root-path]js/supabase-client.js"></script>
<!-- 4. UI helpers (bdbToast, escHtml, bdbConfirm) -->
<script src="[root-path]js/bdb-ui.js"></script>
<!-- 5. Guard invite -->
<script src="[root-path]js/bdb-invite-guard.js"></script>
<!-- 6. Shell universel -->
<script src="[root-path]js/bdb-shell.js"></script>
<!-- 7. Nav module (si applicable) -->
<script src="[module]-nav.js"></script>
<!-- 8. App module -->
<script src="[module]-app.js"></script>
```

Sources : CONV-CHAIN-E, INTERDIT-B1/B2/B3, INTERDIT-JS-01.

### Violations connues

| Violation | Symptome | Ref |
|---|---|---|
| bdb-ui.js absent | bdbToast() undefined, escHtml() undefined, crash JS silencieux | P0-02 |
| JS socle absent (Supabase, shell) | Page standalone sans auth ni navigation | P0-02 |
| bdb-ui.js APRES module JS | Fonctions appelees avant definition | P0-02 |
| initAuth() local dans module | Auth dupliquee, conflit avec shell | P1-10 |
| profiles_directory/user_roles dans module | Requete directe interdite, utiliser window.bdbUser | P1-09 |
| Duplication URL/cle Supabase | Deux clients, conflit RLS | P1-08 |

---

## 3 — STRUCTURE DOM

```html
<body>
  <div id="wrapper" class="d-flex align-items-stretch flex-column min-vh-100">
    <div id="bdb-shell"
         data-module-title="[Titre page]"
         data-module-icon="bi-[icone]"
         data-root-path="[../|../../]"
         data-login-mode="modal"
         data-shell-kind="backoffice">
    </div>
    <div id="wrapper_content" class="d-flex flex-fill">
      <main id="middle" class="flex-fill">
        <div class="container-fluid p-3 p-md-4 p-lg-5">
          <!-- contenu -->
        </div>
      </main>
    </div>
    <footer class="mt-auto py-3 border-top text-center text-muted bg-white">
      <small>&copy; 2026 <span class="app-nom fw-semibold"></span> — [contexte]
        <span class="badge bg-light text-dark border ms-2">CDS Compliant</span>
      </small>
    </footer>
  </div>
  <!-- Modals BS5 hors #wrapper (seule exception autorisee) -->
</body>
```

### Attributs #bdb-shell

| Attribut | Valeur | Consequence si absent | Ref |
|---|---|---|---|
| data-shell-kind | backoffice (BO) ou front (modules membres) | .bo-* mortes, header non style | P0-05 |
| data-login-mode | modal | Redirect au lieu d'overlay | P0-05 |
| data-root-path | ../ ou ../../ selon profondeur | Liens sidebar/login casses | P0-06 |
| data-module-title | Texte affiche dans le header | BDB par defaut | — |
| data-module-icon | Classe BI dans le header | bi-grid par defaut | — |

### Calcul data-root-path

| Profondeur fichier | Valeur |
|---|---|
| atelier/*.html | ../ |
| atelier/doctrine/*.html | ../../ |
| modules/[x]/*.html | ../../ |
| conseil/*.html | ../ |
| conseil/[sous-dossier]/*.html | ../../ |
| Racine (login.html, 404.html) | ./ |

### 4 surfaces (convention S#95)

| Surface | Template canonique | Shell | Auth | Exemples |
|---|---|---|---|---|
| BACKOFFICE | _TEMPLATE_BACKOFFICE_V5_0_1.html | backoffice | isCreator ou isAdmin | atelier/, conseil/, admin/, supervision/ |
| MODULES | _TEMPLATE_MODULES_V5_0_1.html | front | isMember | modules/fiches/, modules/anatomie/ |
| SITE | _TEMPLATE_SITE_V5_0_1.html | non | none | site/ (public) |
| RACINE | _TEMPLATE_RACINE_V5_0_1.html | variable | variable | login, 404, 403, pending |

Regle cardinale : 1 template = 1 surface, jamais un role.
BACKOFFICE couvre L3 createur (atelier/conseil) ET L2 admin (admin/supervision).
Le guard JS (isCreator/isAdmin) fait le tri, pas le template.

### Pages SANS shell (site/, pages publiques)

site/ est le mini-site public. Pas de shell, pas d'auth, pas de Supabase.
Seule la chaine CSS V5 s'applique. Pas de #wrapper, pas de #bdb-shell, pas de chaine JS socle.
Commentaire Surface : <!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->

---

## 4 — CLASSES .bo-* (Kit Back Office)

Toutes scopees body.bdb-shell-backoffice dans cds-overrides.css v2.0.6.

### Classes structurelles (R8.1 a R8.7)

| Classe | Remplace | Usage |
|---|---|---|
| .bo-card | card shadow-sm | Tout conteneur de donnees |
| .bo-card.bo-accent-primary | border-start border-4 border-primary | Card avec accent gauche |
| .bo-card.bo-accent-success | idem success | |
| .bo-card.bo-accent-warning | idem warning | |
| .bo-card.bo-accent-danger | card border-danger | Zone destructive / acces refuse |
| .bo-card.bo-accent-info | idem info | |
| .bo-card.bo-accent-secondary | idem secondary | |
| .bo-header-tint | — | Card-header teinte leger |
| .bo-state-icon | fs-1 sur icone | Icone centree dimensionnee (empty/denied/error) |
| .bo-icon-badge | — | Badge icone 48px |
| .bo-icon-badge.bo-icon-sm | — | Badge icone 32px |
| .bo-icon-badge.bo-icon-lg | — | Badge icone 64px |
| .bo-hover | — | Card avec hover shadow |

### Classes utilitaires (R8.10 -- ajoutees v2.0.6)

| Classe | Remplace style= | Pattern |
|---|---|---|
| .bo-label-col | min-width:120px | Label flex dans lignes label/valeur |
| .bo-card-min | min-width:280px | Card flex-fill largeur minimum |
| .bo-th-xs | width:56px | Colonne th position |
| .bo-th-sm | width:80px | Colonne th visibilite |
| .bo-th-md | width:110px | Colonne th statut |
| .bo-th-lg | width:200px | Colonne th terme |
| .bo-th-xl | width:220px | Colonne th terme large |
| .bo-th-xxl | width:260px | Colonne th formulation |
| .bo-th-actions | width:88px | Colonne th actions |
| .bo-skel-row | height:2.4rem | Skeleton table row |
| .bo-skel-kpi | width:90px;height:56px | Skeleton KPI bloc |
| .bo-scroll-sm | max-height:240px;overflow-y:auto | Conteneur scrollable petit |
| .bo-scroll-md | max-height:420px;overflow-y:auto | Conteneur scrollable moyen |
| .bo-scroll-lg | max-height:480px;overflow-y:auto | Conteneur scrollable grand |
| .bo-progress-thin | height:5px | Progress bar mince |
| .bo-step-badge | width:1.5rem;height:1.5rem + flex center | Badge etape cercle |
| .bo-swatch | width:18px;height:18px | Pastille couleur inline |
| .bo-swatch-sm | width:10px;height:10px | Pastille couleur petite |
| .bo-color-input | width:48px | Input color picker |
| .bo-pre-scroll | max-height:240px;overflow-y:auto;white-space:pre-wrap | Pre/code scrollable |

### style= acceptes (incompressibles)

| Pattern | Raison |
|---|---|
| style="width:0%" sur progress bar | Valeur dynamique JS |
| style="background:[couleur]" sur swatch | Couleur DB dynamique |
| honeypot display:none | EXCEPTION-C2-HONEYPOT |

---

## 5 — TABLE DES REGLES P0/P1/P2

### P0 — Critiques (page cassee si viole)

| No | Regle | Source | Auditeur |
|---|---|---|---|
| P0-01 | Chaine CSS : 4 liens exacts dans ordre BS-theme-base@63905396-Icons-cds-overrides | CONV-CHAIN-E | regex |
| P0-02 | Chaine JS : 6 scripts exacts BS-Supabase-supabase-client-bdb-ui-bdb-invite-guard-bdb-shell | CONV-CHAIN-E | regex |
| P0-03 | #bdb-shell premier enfant de #wrapper | INTERDIT-E1 | parseDOM |
| P0-04 | #wrapper + #wrapper_content + main#middle presents | template | parseDOM |
| P0-05 | data-shell-kind + data-login-mode presents et corrects | BACK_OFFICE | regex |
| P0-06 | data-root-path correct selon profondeur | template | calcul |
| P0-07 | CDN hash = @63905396 uniquement | CONV-CDN-FROZEN | regex |
| P0-08 | Bootstrap 5.3.3 (pas 5.3.2) | CHANTIER_TECHNIQUE | regex |
| P0-09 | Contrat DOM-JS : getElementById du JS trouve id dans HTML | S#95 | grep croise |

### P1 — Violations doctrine

| No | Regle | Source | Auditeur |
|---|---|---|---|
| P1-01 | Zero classe bannie .atl-* .at-* .cs-* .conseil-* .supv-* | BACK_OFFICE | regex |
| P1-02 | Zero classe custom V4 (.stat-card-value, .danger-zone-card, etc.) | BACK_OFFICE | regex |
| P1-03 | Zero CSS module *-ui.css en back-office | BACK_OFFICE S9.2 | regex |
| P1-04 | cds-overrides.css charge | CDS | regex |
| P1-05 | Zero style= statique hors exceptions | INTERDIT-C2 | regex |
| P1-06 | Zero onclick= | INTERDIT-JS-01 | regex |
| P1-07 | Zero console.log/warn | INTERDIT-D6 | regex |
| P1-08 | Zero duplication client Supabase | INTERDIT-A1/A3 | regex |
| P1-09 | Zero profiles_directory/user_roles dans module | INTERDIT-B2 | regex |
| P1-10 | Zero initAuth() local | INTERDIT-B3 | regex |
| P1-11 | escHtml() sur tout innerHTML avec donnee DB | INTERDIT-C6 | regex |
| P1-12 | .select() apres .update()/.delete() | INTERDIT-D4 | regex |
| P1-13 | Bouton primaire dans toolbar uniquement | INTERDIT-C4 | parseDOM |
| P1-14 | Bootstrap Icons uniquement | CONV-ICONS | regex |
| P1-15 | 3 etats async : loading + empty + error | CONV-ASYNC-3ETATS | parseDOM |
| P1-16 | IDs prefixes par nom de module | S#95 | regex |
| P1-17 | Pas de scrollbar-width:none module | INTERDIT-CSS-SCROLLBAR | regex |
| P1-18 | Pas de @keyframes *-shimmer module | INTERDIT-CSS-SHIMMER | regex |
| P1-19 | Pas de ::placeholder dans CSS module | INTERDIT-CSS-PLACEHOLDER | regex |
| P1-20 | Footer avec app-nom + badge CDS | template | parseDOM |

### P2 — Cosmetique

| No | Regle | Source | Auditeur |
|---|---|---|---|
| P2-01 | Zero formulation negative visible | CONV-UX-WORDING-01 | humain |
| P2-02 | Boutons : 1ere personne ou infinitif | CONV-UX-WORDING-01 | humain |
| P2-03 | aria-label sur boutons icone-seule | accessibilite | parseDOM |
| P2-04 | Hierarchie H1/H2/H3 | accessibilite | parseDOM |
| P2-05 | lang="fr" sur html | accessibilite | regex |
| P2-06 | meta viewport present | template | regex |

---

## 6 — INTERDITS ABSOLUS (resume)

| Code | Interdit | Remplacement |
|---|---|---|
| style= statique | Dimension/couleur fixe en attribut | Classe .bo-* ou CSS scope |
| onclick= | Event handler inline | addEventListener |
| body class= | Classes sur body | Shell gere |
| atelier-base.css | Banni S9.2 | cds-overrides.css |
| theme-print.css | Supprime V5 | Rien |
| Hash @a75daa0 | Ancien CDN | @63905396 |
| BS 5.3.2 | Ancienne version | 5.3.3 |
| Font Awesome | fa-* fas far fab | Bootstrap Icons |
| console.log | Debug | Supprimer |
| Classes V4 | .atl-* .cs-* .conseil-* .supv-* | .bo-* ou BS natif |
| CSS *-ui.css en BO | Scope interdit | cds-overrides.css |
| initAuth() local | Auth dupliquee | window.bdbUser |
| profiles_directory dans module | Requete directe | window.bdbUser |
| Duplication Supabase | Deux createClient | window.bdb |
| innerHTML sans escHtml | XSS | escHtml(valeur) |
| .update()/.delete() sans .select() | RLS silencieux | .select() |

---

## 7 — TROUS DOCTRINAUX (statut 2026-04-25)

### Resolus

| No | Trou | Resolution |
|---|---|---|
| T-00 | Norme nommage templates | 4 surfaces, tranche S#95 |
| T-01 | Template createur dedie | NON, BACKOFFICE couvre tout, tranche S#95 |
| T-02 | IDs neutres vs prefixes | Prefixes gagnent, tranche S#95 |
| T-05 | Checklist migration | Ce document V2.0.0 |
| T-06 | Outil audit automatise | audit-v5-compliance.ps1 |
| T-10 | Version shell floue | v2.5.1 |

### Ouverts

| No | Trou | Detail |
|---|---|---|
| T-03 | Contrat DOM-JS | getElementById doit matcher id HTML. Creer INTERDIT-CONTRACT-01 ? |
| T-04 | Rien hors #wrapper | Seuls modals BS5 autorises hors #wrapper. Creer INTERDIT-E2 ? |
| T-07 | Skill migration-v5 | cds-compliance couvre creation neuve, pas refonte. |
| C-01 | Nav top vs nav-tabs | Inter-pages (conseil) vs intra-page (admin). Coexistent. |
| C-03 | Enum shell-kind | backoffice, front. Liste exhaustive non documentee. |

---

## 8 — SHELL V2.5.1 — PIEGE OVERLAY

body.bdb-shell-backoffice ajoute en Step 0 (avant check session) depuis v2.5.1.
Avant v2.5.1 : ajoute en Step 3 (apres session). Overlay auth en Bootstrap brut.
Verifier version shell avant migration.

---

## 9 — FICHIERS ORPHELINS

Nettoyer chaque dossier migre :
- CSS V4 (atelier-base, conseil-ui, conseil-base)
- Doc/audit ponctuels (.md .ps1 .json temporaires)
- Doublons (ex: "index - conseil.html")
- Scripts PS1 generant du V4 (build-cockpit.ps1 v1.1.0)

Regle : pas de link/script par un HTML = candidat suppression.
Exception : .md apparies a un HTML = conserver.

---

## 10 — SCRIPTS PS1 GENERATEURS

Tout PS1 generant du HTML = V5. Checklist :
Hash @63905396, BS 5.3.3, zero theme-print, zero atelier-base, commentaire Surface ligne 2.
Exemple : build-cockpit.ps1 v1.2.0.

---

## 11 — STATUT MIGRATION PAR DOSSIER

| Dossier | Fichiers | Statut | Date |
|---|---|---|---|
| atelier/ | 15 HTML | FAIT 15/15 PASS | 2026-04-25 |
| conseil/ | 17 HTML | FAIT 17/17 PASS | 2026-04-25 |
| bernard/ | 1 HTML | FAIT 1/1 PASS | 2026-04-25 |
| site/ | ~13 HTML | EN COURS (CC) | 2026-04-25 |
| modules/ | ~41 HTML | A FAIRE | |
| Racine | ~15 HTML | A FAIRE | |

---

## 12 — WORKFLOW MIGRATION

```
1. Lancer audit-v5-compliance.bat [DOSSIER]
2. Si 100% PASS -> rien a faire
3. Si FAIL -> PROMPT_CC_MIGRATION_V5.md dans CC avec [DOSSIER]
4. CC corrige -> relancer audit -> PASS
5. Recette visuelle navigateur
6. FTP OVH (css/ + js/ d'abord, puis HTML)
7. Dossier suivant
```

Parallelisable : 1 fenetre CC par dossier (modules/ : lots de 5-6 max).

---

## HISTORIQUE

```
2026-04-25 -- v2.0.0
  Fusion CORPUS_V5_INVENTAIRE V1.3.0 + GUIDE V1.0.0.
  35 regles (9 P0 + 20 P1 + 6 P2). 7 trous doctrinaux (6 resolus, 5 ouverts).
  4 surfaces. Convention nommage templates. Classes .bo-* R8.1-R8.10.
  Fix shell v2.5.1. Script audit PS1. Prompt CC. Statut par dossier.

2026-04-25 -- v1.0.0
  Creation initiale. Retour experience atelier/ (11 problemes).
```
