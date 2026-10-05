# BDB — Référentiel Back-Office
```
VERSION  : 1.1.0
DATE     : 2026-04-17
STATUT   : SOURCE DE VERITE — lire avant toute session back-office
AUTEUR   : Manu + Claude (sessions #89 + #90)
BASE     : V1.0.0 + audit 4 modules back office (atelier, conseil, admin, supervision)
DELTA    : V1.0.0 → V1.1.0
           §8 NOUVEAU : Kit harmonisé BDB back office (9 briques, 5 couches, 6 règles).
           §9 NOUVEAU : Ce qui est INTERDIT (classes, fichiers, patterns).
           §7 : priorité P0 ajoutée (suppression CSS *-ui.css, application du kit).
```

---

## 1 — LES 3 SURFACES BACK-OFFICE (réalité terrain)

### Surface A — Admin métier
```
URL      : modules/admin/index.html
Accès    : isAdmin (role = 'admin' en DB)
Qui      : Olivia, Sophie, Anne-Cécile
Rôle     : Gestion de l'instance — QUI et COMMENT
```

**Ce qu'il fait aujourd'hui :**
- Dashboard : compteurs globaux cross-modules (users, transmissions, tags, alertes)
- Utilisateurs : liste, approbation, rôle, fonction, chirurgien_id conditionnel
- Catégories : CRUD par module (content_types)
- Tags : CRUD, fusion, verrouillage, orphelins/doublons
- Classifications : matériel, zones anatomiques, zones stockage, étagères
- Modules : CRUD app_modules + app_groups (navigation)
- Onglet Modules métier : référentiel 22 modules, statuts

**Ce qu'il ne fait PAS :**
- Configuration spécifique d'un module (ex. : référentiels préférences)
- Audit infrastructure / conformité CDS
- CRUD tables système (pref_referentiels, fonctions_metier…)

**Tables propres :** aucune — opère sur tables transverses.

---

### Surface B — Supervision
```
URL      : modules/supervision/index.html
Accès    : isAdmin
Qui      : Manu principalement, Olivia si besoin
Rôle     : Pilotage infrastructure — observe et audite
```

**Ce qu'il fait :**
- État de santé de chaque module (shell, violations, CTX, palier)
- Audit conformité CDS (supervision_rules)
- Visualisation app_modules / app_groups — LECTURE SEULE
- Historique sessions de travail (supervision_sessions)
- Pipeline versionnement documentaire (mode local uniquement)

**Ce qu'il ne fait PAS :**
- CRUD app_modules/app_groups (→ admin/ depuis D-2026-03-30-T11)
- Gestion utilisateurs
- Configuration métier des modules

**Tables propres :** supervision_config · supervision_rules ·
                    supervision_rule_delta · supervision_sessions

**Statut actuel :** embryonnaire (3/5 premium checklist)

---

### Surface C — CreatorMyCRUD
```
URL      : atelier/atelier-tables-index.html  (hub sélecteur)
           atelier/atelier-tables-app-modules.html  (CRUD app_modules + app_groups)
Accès    : isCreator
Qui      : Manu uniquement
Rôle     : CRUD tables système — schéma navigation + référentiels
```

**Ce qu'il fait aujourd'hui :**
- Hub sélecteur avec KPIs (4 tables)
- CRUD complet app_modules (statut, visibilité, position, icône, groupe)
- CRUD complet app_groups (label, icône, couleur, position)

**Ce qui est prévu (disabled/soon dans le hub) :**
- fonctions_metier (fonctions-metier.html — à créer)
- pref_referentiels (pref-referentiels.html — à créer)

**Tables propres :** aucune — opère sur tables SOCLE.

---

## 2 — NAVIGATION ENTRE LES SURFACES

### Règle de navigation (à implémenter)

```
admin/ → supervision/ : lien "Supervision" dans admin si isAdmin
admin/ → atelier/tables/ : pas de lien — surface créateur séparée
supervision/ → admin/ : lien retour "Administration"
atelier/tables/ → atelier/ : breadcrumb "Tables → Atelier"
```

---

## 3 — PATTERN ADMIN PAR MODULE (arbitrage ouvert)

Le pattern admin.html par module crée 16+ fichiers à maintenir avec
shell/guard dupliqués et navigation éclatée.

Alternative plus sûre : **onglets dans admin/index.html organisés par module.**

→ Arbitrage requis : créer admin.html par module ou étendre admin/index.html ?
   À documenter en atelier_decisions avant toute production.

---

## 4 — HIÉRARCHIE D'ACCÈS COMPLÈTE

```
isDemo    (invite)  → Lecture seule app — aucune surface back-office
isMember  (membre)  → App complète — aucune surface back-office
isAdmin   (admin)   → Surface A (admin/) + Surface B (supervision/)
isCreator (creator) → Surface A + Surface B + Surface C (atelier/tables/)
```

Source DB : user_roles.role (enum : 'invite' / 'membre' / 'admin')
            profiles.is_creator (boolean)

---

## 5 — FICHIERS EXISTANTS PAR SURFACE

### Surface A — Admin métier
```
modules/admin/index.html         ✅ vierge v2 (S#90)
js/bdb-crud-helpers.js           ✅ (helpers CRUD partagés)
```

### Surface B — Supervision
```
modules/supervision/index.html   ✅ vierge v2 (S#90)
Tables DB : supervision_*        ✅ créées
```

### Surface C — CreatorMyCRUD
```
atelier/index.html                       ✅ vierge v2 (S#90)
conseil/index.html                       ✅ vierge v2 (S#90)
atelier/atelier-tables-index.html        ✅ corrigé S#89
atelier/atelier-tables-app-modules.html  ✅ corrigé S#89
À créer :
  atelier/atelier-tables-fonctions-metier.html
  atelier/atelier-tables-pref-referentiels.html
```

---

## 6 — CE QUI NE DOIT JAMAIS ARRIVER

```
- Un module JS qui recalcule isAdmin/isCreator lui-même
  → bdb-shell.js est la source unique via window.bdbUser

- Un admin.html qui lit profiles_directory ou user_roles pour le rôle
  → window.bdbUser.isAdmin est la source unique (sauf modules/admin/index.html
    qui est LE SEUL autorisé à lire user_roles directement pour le CRUD)

- CRUD sur app_modules/app_groups depuis supervision/
  → admin/ et atelier/tables/ uniquement

- Un fichier CreatorMyCRUD déployé dans un fork client
  → Surface C reste dans atelier/ — jamais dans modules/

- data-root-path incorrect selon la profondeur du fichier
  → atelier/ = "../"  |  modules/[x]/ = "../../"  |  racine = "./"
```

---

## 7 — PROCHAINES ACTIONS PRIORITAIRES

```
P0 — Appliquer le Kit harmonisé §8 dans les main#middle des 4 modules
     + supprimer les fichiers *-ui.css (§9)
     + bannir les classes .atl-*, .at-*, .conseil-*, .supv-*, .stat-card-*
     → Cohérence visuelle pour les IBODE néophytes.

P1 — Arbitrage : admin.html par module vs extension admin/index.html

P2 — Supervision : compléter les 2 items manquants (5/5 premium)

P3 — CreatorMyCRUD : créer atelier-tables-fonctions-metier.html
     + atelier-tables-pref-referentiels.html

P4 — Navigation : ajouter lien admin/ → supervision/ (isAdmin)
```

---

# 8 — KIT HARMONISÉ BDB BACK OFFICE — DOCTRINE TOUJOURS

## 8.0 — Principe fondateur

**Cohérence visuelle > exhaustivité.** Une IBODE qui passe d'un onglet Admin à
un onglet Supervision doit retrouver exactement les mêmes cadres. Seule la data change.

9 briques · 5 couches · 6 règles d'exclusion. Zéro fichier `*-ui.css`.

## 8.1 — Vue synoptique

| Couche | Brique | Obligatoire | Variantes |
|---|---|---|---|
| 1 — Structure | Page header | ✅ | Aucune |
| 1 — Structure | Alert bar | si besoin contextuel | info / warning / danger |
| 1 — Structure | Nav tabs | si page multi-sections | Aucune |
| 2 — Cadre | Card universelle | ✅ (unique cadre) | neutre · titrée · accent · danger |
| 3 — Grille | Row responsive | ✅ dès ≥ 2 cards | 2 cols / 3 cols / 4 cols |
| 4 — Contenu | KPI block | si compteur | Aucune |
| 4 — Contenu | Data table | si liste structurée | Aucune |
| 4 — Contenu | Toolbar filtres | si données filtrables | Aucune |
| 5 — État | State block C.9 | ✅ sur zone async | loading / empty / error / denied / auth |

## 8.2 — COUCHE 1 : Structure de page

### Brique 1 — Page header

```html
<div class="container-fluid py-4">

  <!-- ============================================================ -->
  <!-- PAGE HEADER — toujours premier bloc du container-fluid        -->
  <!-- ============================================================ -->
  <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
    <div>
      <h1 class="h3 fw-bold mb-1">
        <i class="bi bi-[ICON] me-2 text-primary"></i>[TITRE]
      </h1>
      <p class="text-muted mb-0">[SOUS-TITRE contextuel court]</p>
    </div>
    <div class="d-flex flex-wrap gap-2">
      <!-- Zone actions (boutons, badges, bandeaux) — optionnelle -->
    </div>
  </div>
```

### Brique 2 — Alert bar (optionnelle, sous le header)

```html
  <!-- ============================================================ -->
  <!-- ALERT BAR — bandeau contextuel (mode, warning, info)          -->
  <!-- ============================================================ -->
  <div class="alert alert-info d-flex align-items-center gap-2 mb-4" role="alert">
    <i class="bi bi-info-circle-fill flex-shrink-0"></i>
    <div>[Message contextuel]</div>
  </div>
```

Variantes : `alert-info` / `alert-warning` / `alert-danger` / `alert-success`.

### Brique 3 — Nav tabs (si page multi-sections)

```html
  <!-- ============================================================ -->
  <!-- NAV TABS — page multi-sections                                -->
  <!-- ============================================================ -->
  <ul class="nav nav-tabs mb-4" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#paneA" type="button" role="tab">
        <i class="bi bi-speedometer2 me-1"></i>Section A
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#paneB" type="button" role="tab">
        <i class="bi bi-people me-1"></i>Section B
      </button>
    </li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane fade show active" id="paneA" role="tabpanel">
      <!-- Contenu section A -->
    </div>
    <div class="tab-pane fade" id="paneB" role="tabpanel">
      <!-- Contenu section B -->
    </div>
  </div>
```

## 8.3 — COUCHE 2 : Card universelle (le seul cadre)

**Règle BO-03 : toute donnée structurée vit dans une card.** Jamais directement dans main.

### Card neutre

```html
<div class="card shadow-sm mb-4">
  <div class="card-body">
    <!-- Contenu -->
  </div>
</div>
```

### Card titrée (avec header)

```html
<div class="card shadow-sm mb-4">
  <div class="card-header fw-semibold">
    <i class="bi bi-[ICON] me-1"></i>[TITRE DE SECTION]
  </div>
  <div class="card-body">
    <!-- Contenu -->
  </div>
</div>
```

### Card accent (mise en avant doctrine/important)

```html
<div class="card shadow-sm border-start border-4 border-primary mb-4">
  <div class="card-body">
    <!-- Contenu mis en avant -->
  </div>
</div>
```

Variantes de bordure : `border-primary` / `border-warning` / `border-success` / `border-info`.

### Card danger (zone destructive)

```html
<div class="card shadow-sm border-danger mb-4">
  <div class="card-header text-danger fw-semibold bg-danger bg-opacity-10">
    <i class="bi bi-exclamation-triangle me-2"></i>Zone sensible
  </div>
  <div class="card-body">
    <!-- Actions irréversibles, confirmation obligatoire -->
  </div>
</div>
```

## 8.4 — COUCHE 3 : Grille responsive (unique)

**Règle BO-04 : une seule doctrine de grille.** Jamais de grid custom.

### Grid 2 colonnes

```html
<div class="row g-3 mb-4">
  <div class="col-12 col-md-6">
    <div class="card shadow-sm h-100"><div class="card-body">Col 1</div></div>
  </div>
  <div class="col-12 col-md-6">
    <div class="card shadow-sm h-100"><div class="card-body">Col 2</div></div>
  </div>
</div>
```

### Grid 3 colonnes

```html
<div class="row g-3 mb-4">
  <div class="col-12 col-md-6 col-lg-4">...</div>
  <div class="col-12 col-md-6 col-lg-4">...</div>
  <div class="col-12 col-md-6 col-lg-4">...</div>
</div>
```

### Grid 4 colonnes (KPI row typique)

```html
<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">...</div>
  <div class="col-6 col-md-3">...</div>
  <div class="col-6 col-md-3">...</div>
  <div class="col-6 col-md-3">...</div>
</div>
```

## 8.5 — COUCHE 4 : Contenus (toujours dans une card)

### Brique 6 — KPI block

```html
<div class="card shadow-sm h-100">
  <div class="card-body">
    <div class="d-flex align-items-center gap-2 mb-1">
      <i class="bi bi-[ICON] text-primary"></i>
      <div class="small text-muted text-uppercase fw-semibold">[Label]</div>
    </div>
    <div class="display-6 fw-bold">[Valeur]</div>
    <div class="small text-muted">[Sous-titre optionnel]</div>
  </div>
</div>
```

Variante couleur : remplacer `text-primary` (icône) par `text-success` / `text-warning` / `text-danger`.

### Brique 7 — Data table (dans une card)

```html
<div class="card shadow-sm mb-4">
  <div class="card-header fw-semibold">
    <i class="bi bi-table me-1"></i>[TITRE LISTE]
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Colonne 1</th>
            <th>Colonne 2</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Lignes -->
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### Brique 8 — Toolbar filtres (dans une card)

```html
<div class="card shadow-sm p-3 mb-3">
  <div class="row g-2 align-items-end">
    <div class="col-12 col-md">
      <label class="form-label small fw-semibold">Recherche</label>
      <input type="search" class="form-control" placeholder="Rechercher..."/>
    </div>
    <div class="col-6 col-md-3">
      <label class="form-label small fw-semibold">Filtre A</label>
      <select class="form-select">
        <option value="">Tous</option>
      </select>
    </div>
    <div class="col-6 col-md-3">
      <label class="form-label small fw-semibold">Filtre B</label>
      <select class="form-select">
        <option value="">Tous</option>
      </select>
    </div>
    <div class="col-12 col-md-auto">
      <button class="btn btn-primary w-100">
        <i class="bi bi-plus-lg me-1"></i>Nouveau
      </button>
    </div>
  </div>
</div>
```

## 8.6 — COUCHE 5 : States C.9 (obligatoire sur chaque zone async)

**Règle BO-06 : toute fonction async qui alimente le DOM couvre les 3 états minimum (loading / empty / error).**

### State : Loading (skeleton)

```html
<div class="card shadow-sm mb-4">
  <div class="card-body">
    <div class="placeholder-glow">
      <span class="placeholder col-8 mb-2"></span>
      <span class="placeholder col-5 mb-2"></span>
      <span class="placeholder col-7"></span>
    </div>
  </div>
</div>
```

### State : Empty

```html
<div class="card shadow-sm mb-4">
  <div class="card-body text-center py-5">
    <i class="bi bi-inbox display-4 text-muted d-block mb-3"></i>
    <p class="text-muted mb-0">Aucun élément à afficher.</p>
  </div>
</div>
```

### State : Error

```html
<div class="card shadow-sm border-danger mb-4">
  <div class="card-body text-center py-4">
    <i class="bi bi-exclamation-triangle display-4 text-danger d-block mb-3"></i>
    <p class="mb-3">Impossible de charger les données.</p>
    <button class="btn btn-outline-danger">
      <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
    </button>
  </div>
</div>
```

### State : Access denied (Atelier / Conseil)

```html
<div class="card shadow-sm border-danger">
  <div class="card-body text-center py-5">
    <i class="bi bi-shield-lock display-3 text-danger d-block mb-3"></i>
    <h2 class="h5 fw-bold mb-2">Accès réservé</h2>
    <p class="text-muted mb-0">Cet espace est réservé au créateur de l'instance.</p>
  </div>
</div>
```

### State : Auth required (overlay si data-login-mode="modal")

```html
<div class="card shadow-sm border-primary">
  <div class="card-body text-center py-5">
    <i class="bi bi-lock-fill display-3 text-primary d-block mb-3"></i>
    <h2 class="h5 fw-bold mb-2">Connexion requise</h2>
    <p class="text-muted mb-4">Connecte-toi puis reviens actualiser.</p>
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-primary">
        <i class="bi bi-box-arrow-in-right me-1"></i>Ouvrir la connexion
      </button>
      <button class="btn btn-outline-secondary">
        <i class="bi bi-arrow-clockwise me-1"></i>Actualiser
      </button>
    </div>
  </div>
</div>
```

## 8.7 — Les 6 règles d'exclusion mutuelle TOUJOURS

```
RÈGLE-BO-01 : Nav tabs présents → jamais de "section label" typo.
              Le tabs structure la page, pas besoin de titres de section flottants.

RÈGLE-BO-02 : Pas de nav tabs → structurer via card-header de chaque card,
              pas via divider typo flottant dans le main.

RÈGLE-BO-03 : KPI, Data table, Toolbar filtres, Quick links vivent TOUJOURS
              dans une card. Jamais directement dans main#middle.

RÈGLE-BO-04 : Une seule variante de grid : .row.g-3 + .col-responsive.
              Interdiction de créer des grids custom (conseil-grid-2, at-kpi-grid...).

RÈGLE-BO-05 : Un KPI = une card avec la structure standardisée §8.5.
              Jamais de "stat-card-value" ou autre classe custom.

RÈGLE-BO-06 : Une alert = un message contextuel temporaire.
              Pas un conteneur de données (→ utiliser une card titrée).
```

---

# 9 — CE QUI EST INTERDIT

## 9.1 — Classes CSS bannies (doivent disparaître du code)

```
Préfixes modules à supprimer :
  .atl-*          (atelier)
  .at-*           (atelier)
  .cs-*           (conseil)
  .conseil-*      (conseil)
  .supv-*         (supervision)
  .sup-*          (supervision)

Classes composants bannies :
  .stat-card-value · .stat-card-sub
  .danger-zone-card
  .atl-page · .atl-page-header · .atl-page-title · .atl-page-sub
  .atl-page-body · .atl-page-actions
  .atl-auth-overlay · .atl-auth-card · .atl-auth-icon · .atl-auth-actions
  .atl-state-center · .atl-state-icon
  .atl-section-lbl · .atl-alert-sm
  .at-banner · .at-banner-idle · .at-kpi-grid · .at-kpi-placeholder · .at-outils-grid
  .conseil-section-lbl · .conseil-card · .conseil-card-accent · .conseil-card-body
  .conseil-grid-2 · .conseil-grid-3 · .conseil-quick-links · .conseil-btn
  .supv-kpi-n · .supv-kpi-l

Couleurs custom bannies :
  .text-purple → remplacer par .text-primary (définir couleur back office
                 via override cds-overrides.css si nécessaire, règle globale scopée)
```

## 9.2 — Fichiers CSS à supprimer

```
atelier/atelier-base.css
atelier/atelier-ui.css
conseil/conseil-ui.css
modules/admin/admin-ui.css
modules/supervision/supervision-ui.css
```

**Règle** : si un besoin visuel n'est pas couvert par Bootstrap 5.3 + theme-base.css,
l'override global est dans `cds-overrides.css`, scopé si nécessaire.
Jamais de CSS module custom en back office.

## 9.3 — Patterns HTML interdits

```
INTERDIT-BO-H1 : <div class="container-fluid p-4 bg-light flex-grow-1">
                 → Remplacer par <div class="container-fluid py-4">
                   Le fond est piloté par bdb-shell v2.2.0 (data-shell-kind="backoffice").

INTERDIT-BO-H2 : style="..." statique dans les modules back office.
                 Exceptions documentées : largeur progressbar dynamique (style="width:80%").

INTERDIT-BO-H3 : IDs locaux préfixés module (#at-*, #cs-*, #supv-*).
                 → Utiliser IDs neutres (#pageLoading, #pageContent, #pageError).

INTERDIT-BO-H4 : Nav tabs ET section labels typographiques dans la même page.
                 Un des deux uniquement (règle BO-01).

INTERDIT-BO-H5 : Une card qui ne suit pas l'un des 4 modifiers documentés §8.3
                 (neutre / titrée / accent / danger).
```

## 9.4 — Patterns JS interdits (rappel)

```
INTERDIT-BO-J1 : Recherche du rôle directement en DB depuis un module back office.
                 → Lire window.bdbUser uniquement.

INTERDIT-BO-J2 : Recalcul de isAdmin / isCreator dans le module.
                 → bdb-shell.js est la source unique.

INTERDIT-BO-J3 : Chargement d'un CSS module *-ui.css.
                 → Chaîne CSS : Bootstrap → theme-base.css → Bootstrap Icons → cds-overrides.css.
```

---

## HISTORIQUE

```
2026-04-17 — V1.1.0  §8 NOUVEAU : Kit harmonisé BDB back office.
             9 briques, 5 couches, 6 règles d'exclusion mutuelle.
             §9 NOUVEAU : Ce qui est INTERDIT (classes, fichiers, patterns).
             Base audit 4 modules back office (S#90).

2026-04-15 — V1.0.0  Création. Session #89.
             Base : Surface Map V1.2.0 + CTX_ADMIN V2.2.0 +
             CTX_SUPERVISION V1.3.0 + 01_ACCES_NIVEAUX V1.0.0.
             Correction bug data-root-path CreatorMyCRUD (../ vs ../../).
             Arbitrage admin.html par module : posé en question ouverte.
```
