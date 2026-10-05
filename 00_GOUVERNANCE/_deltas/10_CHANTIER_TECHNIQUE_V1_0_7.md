# CHANTIER TECHNIQUE BDB — Référentiel Architecture
```
VERSION  : 1.0.7
DATE     : 2026-04-03
AUTEUR   : Manu + Claude
STATUT   : SOURCE DE VÉRITÉ TECHNIQUE — à charger après MANIFESTE_BDB
RÔLE     : Décisions d'architecture technique pérennes.
           Élimine les hallucinations, régressions et ambiguïtés techniques.
           Ce document prime sur toute conversation précédente sur ces sujets.
MANIFESTE_REF : MANIFESTE_BDB_V1_1_0
DELTA    : Session 2026-03-20 — migration bdb-shell module fiches :
           BLOC C.5 : INTERDIT-C6 ajouté (escHtml obligatoire).
           BLOC C.9 : Standard Résilience Module (3 états UI + escHtml + throw init).
           BLOC F.1 : fiches migré shell ✅ + colonne Résilience ajoutée.
           BLOC H   : D-2026-03-20-T01 inscrit.
DELTA    : v1.0.6 → v1.0.7
           NOYAU_REF → MANIFESTE_REF (D-2026-04-03-T01).
```

---

## AVERTISSEMENT

Ce document contient des décisions techniques validées par Manu.
Toute IA qui produit du code contradictoire avec ce document produit une régression.
Toute règle non écrite ici n'est pas active.

---

## BLOC A — STRATÉGIE DE CONNEXION SUPABASE

### A.1 Décision validée

**Cloud Supabase = source de vérité permanente.**

Toutes les sessions de développement utilisent directement le cloud Supabase.
Il n'y a plus de switcher local/cloud en dev.

```
URL de référence : https://ecpzrygzdugwwkqbsajn.supabase.co
Clef anon        : (dans js/supabase-client.js — source unique, INTERDIT-A1)
```

### A.2 Rôle du Supabase local

Le Supabase local (`http://127.0.0.1:54321`) sert **uniquement** comme :
- Dump de sauvegarde périodique
- Environnement de test destructif (migrations risquées)
- Reprise immédiate en cas de crash cloud (disaster recovery)

Il n'est **pas** l'environnement de développement normal.

### A.3 Procédure de dump local (disaster recovery)

Effectuer régulièrement (hebdomadaire recommandé) :

```powershell
# Dump cloud → local (à exécuter depuis CMD Windows)
supabase db pull --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

En cas de crash cloud :
1. Démarrer Supabase local : `powershell -ExecutionPolicy Bypass -File start-bdb.ps1`
2. Modifier temporairement `js/supabase-client.js` → pointer vers local
3. Restaurer cloud dès que possible

### A.4 Conséquences sur le code

**`js/config.js` est supprimé du workflow.**

Toutes les pages chargent uniquement :
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="../../js/supabase-client.js"></script>
```

`config.js` reste présent sur le disque mais **n'est plus chargé** dans aucun module.
La surcharge locale n'est utile qu'en cas de disaster recovery — activer manuellement si besoin.

### A.5 Ce qui est INTERDIT

```
INTERDIT-A1 : Ne jamais dupliquer l'URL Supabase ou la clef anon dans un module.
              Un seul fichier : js/supabase-client.js
INTERDIT-A2 : Ne jamais charger config.js en production ou en développement normal.
INTERDIT-A3 : Ne jamais créer un deuxième client Supabase (window.bdb est unique).
```

---

## BLOC B — ARCHITECTURE AUTH ET SHELL UNIVERSEL

### B.1 Problème résolu

Chaque module contenait ~50 lignes HTML d'offcanvas + header + ~40 lignes JS d'auth,
copiées-collées dans 17 fichiers. Toute modification d'un lien ou d'un style nécessitait
17 fichiers à reconstruire. Cette dette est architecturalement inacceptable.

### B.2 Solution : `js/bdb-shell.js`

Un fichier JS unique gère :
1. La vérification de session (redirect login si absent)
2. Le chargement des données utilisateur (profil + rôle)
3. L'injection du HTML offcanvas + header dans chaque page
4. La gestion du logout
5. L'exposition de `window.bdbUser` pour les modules

**Chaque module ne contient plus qu'un seul div dans `<main>` :**

```html
<div id="bdb-shell"></div>
```

Et dans le `<head>` (après supabase-client.js) :
```html
<script src="../../js/bdb-shell.js"></script>
```

### B.3 Contrat `window.bdbUser`

Exposé par `bdb-shell.js` après init. **Disponible dès `DOMContentLoaded`.**

```javascript
window.bdbUser = {
  id       : 'uuid',           // auth.users.id
  email    : 'x@y.fr',
  prenom   : 'Manuel',
  nom      : 'Rohaut',
  initials : 'MR',
  role     : 'admin',          // 'admin' | 'member' | null
  isAdmin  : true
}
```

Chaque module accède à l'utilisateur via `window.bdbUser` — jamais via une requête SQL propre.

### B.4 Structure HTML produite par bdb-shell.js

Le shell injecte dans `#bdb-shell` :
- L'offcanvas de navigation (liste des modules + lien admin)
- Le header sticky (hamburger + titre module + avatar + menu utilisateur)

Le titre du module est paramétrable via `data-*` sur `#bdb-shell` :

```html
<div id="bdb-shell"
     data-module-title="Arsenal"
     data-module-icon="bi-box-seam">
</div>
```

### B.5 Initialisation dans chaque module

```javascript
// DOMContentLoaded déclenché APRÈS bdb-shell.js
document.addEventListener('DOMContentLoaded', async () => {
  // window.bdbUser est déjà disponible — pas de requête SQL ici
  const { id, isAdmin } = window.bdbUser;
  await loadData();
  // ...
});
```

Si la session est absente, `bdb-shell.js` redirige vers `login.html` avant que
le module n'exécute son `DOMContentLoaded`. Le module ne gère jamais l'auth.

### B.6 Ce qui est INTERDIT

```
INTERDIT-B1 : Ne jamais dupliquer le bloc auth dans un module HTML.
              Tout le code auth vit dans js/bdb-shell.js uniquement.
INTERDIT-B2 : Ne jamais faire de requête profiles_directory ou user_roles
              dans un module pour construire l'avatar ou vérifier le rôle.
              Utiliser window.bdbUser exclusivement.
INTERDIT-B3 : Ne jamais créer un initAuth() local dans un module.
              Si une vérification de rôle est nécessaire → if (window.bdbUser.isAdmin)
```

---

## BLOC C — RÈGLES CSS GLOBALES ET EXCEPTIONS DOCUMENTÉES

### C.1 Rappel INTERDIT-17

```
INTERDIT-17 : Ne jamais écrire un override Bootstrap sans le scoper à son conteneur parent.
```

### C.2 Exception légale : `cds-overrides.css` = scope global délibéré

Les règles suivantes dans `cds-overrides.css` violent formellement INTERDIT-17
mais sont **décisions de design validées** s'appliquant à toute l'application.

`cds-overrides.css` EST le scope global de BDB. Ces règles sont intentionnelles.

Elles sont listées ici une fois pour toutes. Toute modification → entrée JOURNAL_DECISIONS.

| Règle | Effet | Motif |
|---|---|---|
| `.btn { border-radius:8px; font-weight:500; font-size:.855rem }` | Unifie l'aspect de tous les boutons | Design token BDB |
| `.btn-sm { border-radius:7px; font-size:.8rem }` | idem petit format | Design token BDB |
| `.btn-outline-secondary` + hover | Couleur border et hover normalisés | Cohérence visuelle |
| `.modal-content` | Border-radius + shadow | Design modal BDB |
| `.modal-header` | Background surface-2 + padding | Design modal BDB |
| `.modal-title` | Font-weight 700 + size | Typographie modale |
| `.modal-body` | Padding 1.5rem | Espacement modal |
| `.modal-footer` | Background + padding + gap | Design modal BDB |
| `.modal-body .card` | Border-radius 10px + border | Cards dans modales |
| `.card { animation: fadeInUp }` | Animation entrée globale | UX feedback |
| `.modal.show .modal-dialog { animation }` | Animation ouverture modale | UX feedback |
| `.input-group` responsive | Stack sous 576px | Mobile-first |

**Ces règles sont documentées. Elles ne constituent plus des embryons toxiques.**

### C.3 Violations réelles à corriger dans les CSS modules

Ces règles violent INTERDIT-17 **sans justification** — elles sont module-spécifiques
et doivent être scopées.

| Fichier | Règle violante | Correction |
|---|---|---|
| `fiches-ui.css` | `.btn-ghost` / `.btn-ghost:hover` | ✅ Renommé `.fiche-btn-ghost` (2026-03-20) |
| `annuaire-ui.css` | `.badge-fn-medecin/cadre/infirmier/aide` | `.annuaire-card .badge-fn-*` |
| `thesaurus-ui.css` | `.btn-xs` | `#thesaurusContainer .btn-xs` |

### C.4 Règle `style=` inline

**Toléré uniquement pour :**
- Couleurs dynamiques de catégories : `category.color` (vient de la base, impossible à prédire)
- Largeurs de progress bars dynamiques : `style="width:${pct}%"`

**Interdit et à corriger** (remplacer par classe CDS) :

| Pattern actuel | Classe CDS à utiliser |
|---|---|
| `style="width:80px;height:60px;object-fit:cover"` | `class="cds-thumbnail rounded"` |
| `style="width:90px;height:70px;object-fit:cover"` | `class="cds-thumbnail-lg rounded"` |
| `style="width:20px;height:20px;font-size:0.65rem"` | `class="cds-img-remove-btn"` |
| `style="cursor:pointer"` | `class="cds-clickable"` |
| `style="font-size:0.6rem"` | `class="cds-text-micro"` |

Modules à corriger : `arsenal`, `fiches`, `transmissions`, `anatomie`, `cours`, `installation`.

### C.5 Ce qui est INTERDIT

```
INTERDIT-C1 : Ne jamais modifier une règle globale de cds-overrides.css
              sans entrée JOURNAL_DECISIONS.
INTERDIT-C2 : Ne jamais ajouter un style= statique dans un fichier HTML.
              Créer la classe dans le CSS module à la place.
INTERDIT-C3 : Ne jamais modifier une couleur de catégorie en CSS statique.
              Les couleurs de catégorie viennent de la base — elles restent en style=.
INTERDIT-C4 : Ne jamais injecter le bouton d'action primaire via innerHTML.
              Ne jamais le placer dans le header BDB.
              Ne jamais créer un div#headerActions ou équivalent hors toolbar.
              Référence : D-2026-03-15-T11 — voir C.6.
INTERDIT-C5 : Ne jamais appliquer le pattern Optimistic Update sur :
              les suppressions (DELETE), les INSERT avec FK multiples,
              les données critiques (fiches, référentiels), les actions
              impliquant plusieurs tables simultanément.
              Référence : D-2026-03-16-T07 — voir C.8.
INTERDIT-C6 : Ne jamais injecter via innerHTML une donnée provenant de Supabase
              ou de toute source externe sans passer par escHtml().
              Exceptions : contenu HTML Quill rendu volontairement (admin-only),
              chaînes statiques connues au moment du build.
              Référence : D-2026-03-20-T01 — voir C.9.
```

---

### C.6 Pattern bouton d'action primaire admin

Référence : D-2026-03-15-T11 (JOURNAL_DECISIONS)

**Règle** : Le bouton d'action primaire admin est **toujours** dans la toolbar filtres.
Présent dans le DOM dès le chargement. Activé par `initFromShell()` si `isAdmin`.

**Structure HTML obligatoire** (dernier enfant de la `.row` toolbar) :

```html
<!-- Slot admin — masqué par défaut, affiché par initFromShell() si isAdmin -->
<div class="col-12 col-md-auto d-none" id="[module]ToolbarAdminSlot">
  <button class="btn btn-danger w-100" id="btnNew">
    <i class="bi bi-plus-lg me-1"></i>[Libellé action]
  </button>
</div>
```

**Activation JS** (dans `initFromShell()`) :

```javascript
if (state.isAdmin) {
  document.getElementById('[module]ToolbarAdminSlot').classList.remove('d-none');
  document.getElementById('btnNew').addEventListener('click', () => openModal());
}
```

**Layout** :
- Desktop : `col-md-auto` — aligne à droite des filtres sur la même ligne
- Mobile `< 576px` : `col-12` — full-width, empilé sous les filtres

**Module de référence** : `modules/anatomie/index.html` (session 2026-03-15)

**Dette active** — modules à migrer :

| Module | Statut |
|---|---|
| anatomie | ✅ référence implémentée |
| arsenal  | ✅ migré 2026-03-16 (D-T02) |
| cours | ⏳ à migrer |
| fiches | ✅ migré 2026-03-20 (D-T01) |
| transmissions | ⏳ à migrer |
| installation | ⏳ à migrer |
| preferences | ⏳ à migrer |

---

### C.7 Standard UX Premium — Skeleton Loaders

Référence : D-2026-03-16-T06 (JOURNAL_DECISIONS)

**Règle** : Remplacer progressivement les spinners par des Skeleton Loaders
lors des appels asynchrones Supabase. Application module par module lors des refontes.

**Implémentation** : CSS pur — classes Bootstrap natives `.placeholder` `.placeholder-glow`.
Zéro librairie externe.

```html
<!-- Pattern skeleton BDB standard — remplace le contenu de #loadingState -->
<!-- Hauteurs via fs-* Bootstrap : fs-5 = titre, fs-6 = corps (défaut), fs-sm = micro -->
<div class="placeholder-glow p-3">
  <div class="placeholder col-8 rounded mb-3 fs-5"></div>
  <div class="placeholder col-5 rounded mb-2"></div>
  <div class="placeholder col-7 rounded mb-2"></div>
  <div class="placeholder col-4 rounded"></div>
</div>
```

**Périmètre** : Tous modules — itératif lors des migrations bdb-shell ou refontes.
Ne pas remplacer les spinners hors contexte de refonte.

---

### C.8 Pattern Optimistic Updates — actions rapides non destructrices

Référence : D-2026-03-16-T07 (JOURNAL_DECISIONS)

**Cas d'usage autorisés** (liste fermée — tout autre cas = décision Manu requise) :
- Cocher une phase de progression dans `carnet_bord` (D/A/S)
- Changer un statut toggle (actif/inactif) sur un item de référentiel
- Toute action binaire réversible sans impact sur d'autres enregistrements

**Pattern JS obligatoire** :

```javascript
async function optimisticUpdate(itemId, patch, renderFn) {
  const prev = { ...state.items[itemId] };   // 1. snapshot
  state.items[itemId] = { ...prev, ...patch }; // 2. UI immédiate
  renderFn(itemId);
  const { error } = await DB.from('table').update(patch).eq('id', itemId);
  if (error) {                               // 3. rollback si échec
    state.items[itemId] = prev;
    renderFn(itemId);
    showToast('Erreur — modification annulée.', 'error');
  }
}
```

**INTERDIT-C5** : Ne jamais appliquer sur DELETE, INSERT multi-tables,
données critiques, actions multi-tables. Voir C.5.

---

### C.9 Standard Résilience Module — Couverture États UI

Référence : D-2026-03-20-T01 (JOURNAL_DECISIONS)

**Principe** : Aucune fonction async qui alimente le DOM ne reste muette.
Toute requête Supabase a trois issues possibles (succès, vide, erreur).
Le code doit rendre compte des trois. Une erreur silencieuse est un bug.

**Contrat obligatoire — 3 états UI** :

Toute fonction async qui écrit dans le DOM DOIT couvrir :

| État | Quand | Rendu obligatoire |
|---|---|---|
| **loading** | Avant la réponse Supabase | Skeleton `.placeholder-glow` (C.7) |
| **empty** | data.length === 0, pas d'erreur | Message vide contextuel (icône + texte) |
| **error** | error !== null OU exception | `cdsShowGridError()` avec bouton Réessayer si applicable |

Exceptions :
- **Formulaires** (save, delete) : `showToast(error)` ou `fFormError` alert = suffisant.
- **Bouton save** : spinner inline autorisé (feedback action utilisateur, pas chargement données).

**Contrat obligatoire — escHtml()** :

Voir INTERDIT-C6 dans C.5. Fonction de référence (à copier dans chaque module) :

```javascript
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**Pattern init référentiels** :

Les fonctions de chargement de référentiels (content_types, categories, tags, etc.)
DOIVENT propager leurs erreurs via `throw`. Le `DOMContentLoaded` les intercepte
dans un `try/catch` centralisé.

```javascript
// Référentiel — propage l'erreur
async function loadCategories() {
  const { data, error } = await DB.from('categories').select('*');
  if (error) throw new Error('categories : ' + error.message);
  state.categories = data || [];
}

// Init — catch centralisé
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();
  try {
    await loadContentTypeIds();
    await Promise.all([loadCategories(), loadTags()]);
  } catch (err) {
    cdsShowGridError(
      document.getElementById('[module]List'),
      'Impossible de charger les référentiels : ' + err.message,
      () => location.reload()
    );
    return; // Stop — pas de loadData() si les référentiels sont cassés
  }
  await loadData();
});
```

Module de référence : `modules/fiches/index.html` (session 2026-03-20)

---

## BLOC D — RÈGLES CDN ET VERSIONNEMENT

### D.1 État actuel

`menywise/BDB@latest` est utilisé dans 18 modules. INTERDIT en production.

### D.2 Règle

| Environnement | CDN BDB | Action |
|---|---|---|
| Développement | `@latest` toléré provisoirement | Mettre à jour le tag avant déploiement |
| Production OVH | Tag fixe obligatoire : `@v2.0.0` | Remplacer @latest par le tag au moment du déploiement |

La mise à jour du tag CDN BDB en production est une action de release — décision Manu.

### D.3 Versions figées (ne jamais modifier sans entrée JOURNAL)

```
Bootstrap CSS : 5.3.2  (cdn.jsdelivr.net/npm/bootstrap@5.3.2)
Bootstrap JS  : 5.3.2  (cdn.jsdelivr.net/npm/bootstrap@5.3.2)
Bootstrap Icons : 1.11.1
Supabase JS   : @2 (version majeure — la mineure suit automatiquement)
```

---

## BLOC E — CHAÎNE DE CHARGEMENT HTML STANDARD

Ordre obligatoire dans chaque module HTML — immuable.

```html
<head>
  <!-- 1. Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <!-- 2. Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <!-- 3. CDS tokens — REMPLACER @latest par tag de release avant déploiement OVH (BLOC D.2) -->
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@latest/theme-base.css" rel="stylesheet"/>
  <!-- 4. CDS print — idem @latest -->
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@latest/theme-print.css" rel="stylesheet" media="print"/>
  <!-- 5. CDS overrides globaux -->
  <link href="../../css/cds-overrides.css" rel="stylesheet"/>
  <!-- 6. CSS module -->
  <link href="../../css/[module]-ui.css" rel="stylesheet"/>
</head>

<body class="d-flex min-vh-100">

  <!-- MAIN -->
  <main class="d-flex flex-column flex-grow-1 main-content">

    <!-- SHELL : PREMIER ENFANT de <main> — obligatoire (voir INTERDIT-E1) -->
    <div id="bdb-shell"
         data-module-title="[Nom Module]"
         data-module-icon="bi-[icon]">
    </div>

    <!-- Contenu module -->
    <div class="container-fluid p-4 bg-light flex-grow-1">
      <!-- Contenu -->
    </div>

    <footer class="mt-auto py-3 border-top text-center text-muted bg-white">
      <small>&copy; 2026 Bible de Bloc — Consensus Design System —
      <span class="badge bg-light text-dark border">CDS Compliant</span></small>
    </footer>

  </main>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Supabase SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <!-- Socle BDB -->
  <script src="../../js/supabase-client.js"></script>
  <script src="../../js/bdb-shell.js"></script>
  <!-- Code module -->
  <script>
  document.addEventListener('DOMContentLoaded', async () => {
    // window.bdbUser disponible ici
    await init();
  });
  </script>
</body>
```

### INTERDIT-E1 — Position de #bdb-shell

```
INTERDIT-E1 : #bdb-shell doit toujours être le PREMIER ENFANT de <main>.
              Jamais frère de <main> dans <body>.

MOTIF : body.d-flex crée une colonne flex horizontale.
        Si #bdb-shell est frère de <main>, il s'insère comme colonne parallèle
        → le header injecté n'est plus sticky dans le flux de main → layout cassé.
        Positionné comme premier enfant de main.d-flex.flex-column,
        le header sticky fonctionne dans l'axe vertical du module.

PATTERN FAUX :
  <body class="d-flex min-vh-100">
    <div id="bdb-shell" ...></div>   ← frère de main = FAUX
    <main class="d-flex flex-column flex-grow-1">
      ...
    </main>
  </body>

PATTERN CORRECT :
  <body class="d-flex min-vh-100">
    <main class="d-flex flex-column flex-grow-1">
      <div id="bdb-shell" ...></div> ← premier enfant de main = CORRECT
      <div class="container-fluid ...">...</div>
      <footer>...</footer>
    </main>
  </body>
```

Référence : D-2026-03-15-T10 (JOURNAL_DECISIONS)

---

## BLOC F — MODULES ACTIFS ET STATUT

### F.1 Modules Supabase — recettés

| Module | Dossier | CSS | Shell | style= | INTERDIT-17 | Résilience C.9 |
|---|---|---|---|---|---|---|
| admin | modules/admin/ | admin-ui.css | ✅ migré | 8 → corriger | ✅ | ⏳ à vérifier |
| annuaire | modules/annuaire/ | annuaire-ui.css | ✅ migré | 0 ✅ | ✅ | ⏳ à vérifier |
| arsenal | modules/arsenal/ | arsenal-ui.css | ✅ migré | 0 ✅ | ✅ | ⏳ à vérifier |
| fiches | modules/fiches/ | fiches-ui.css | ✅ migré | 0 ✅ | ✅ | ✅ escHtml + 3 états |
| transmissions | modules/transmissions/ | transmissions-ui.css | ⏳ à migrer | 9 → corriger | ✅ | ⏳ à migrer |
| cours | modules/cours/ | cours-ui.css | ⏳ à migrer | 13 → corriger | ✅ | ⏳ à migrer |
| anatomie | modules/anatomie/ | anatomie-ui.css | ✅ migré | 0 ✅ | ✅ | ⏳ à vérifier |
| installation | modules/installation/ | installation-ui.css | ⏳ à migrer | 8 → corriger | ✅ | ⏳ à migrer |
| preferences | modules/preferences/ | preferences-ui.css | ⏳ à migrer | 3 → corriger | ✅ | ⏳ à migrer |
| thesaurus | modules/thesaurus/ | thesaurus-ui.css | ✅ migré | 0 ✅ | ✅ | ✅ escHtml + 3 états |

### F.2 Modules localStorage — migration Phase 1/2

| Module | Dette CDS | Migration |
|---|---|---|
| planning | Faible (déjà structuré) | Phase 2 |
| disc | FA corrigé | Phase 1 |
| dork | FA + onclick en JS (13) | Phase 1 |
| collab | 4460L monofichier | Phase 1 |
| paxis | 1352L | Phase 1 |
| organisateur | Touch OK | Phase 1 |

### F.3 Modules BRIQUE SUIVANTE (à créer)

| Module | Dossier cible | Stack |
|---|---|---|
| accueil | modules/accueil/ | Statique (zéro Supabase) |
| ged | modules/ged/ | Statique |
| carnet_bord | modules/carnet_bord/ | Supabase |
| objectifs | modules/objectifs/ | Supabase |

### F.4 Modules embryonnaires

Ces modules sont des modules BDB réels en phase dégradée.
**Ils ne sont pas des orphelins. Ils ne sont pas des erreurs.**
Doctrine officielle : D-2026-03-15-T07 (JOURNAL_DECISIONS).

| Module | Dossier actuel | État | Option validée |
|---|---|---|---|
| pedagogie | modules/pedagogie/ | Prompt Factory v4.3 CDS | B — intégrer BDB comme outil admin (session dédiée) |
| carnet_bord | modules/carnet-bord/ | Prototype HTML | À migrer → modules/carnet_bord/ |
| objectifs | modules/objectifs-ide/ | Prototype HTML | À migrer → modules/objectifs/ |
| ged | (absent) | À créer | Statique zéro Supabase |

Règles absolues sur les modules embryonnaires :
```
E1 — Ne jamais archiver sans confirmation Manu.
E2 — Ne jamais qualifier de "orphelin" ou "embarqué par erreur" sans confirmation Manu.
E3 — Le doute bénéficie toujours au fichier : signaler, ne pas supprimer.
E4 — Tout module embryonnaire reçoit son CTX avant toute session de migration.
```

---

## BLOC G — ORDRE DE TRAVAIL OPÉRATIONNEL

### G.1 Chantier immédiat (avant toute nouvelle feature)

```
ÉTAPE 1 : Créer js/bdb-shell.js ✅ FAIT (v1.3.1 → v1.4.0)
          → v1.4.0 : _buildOffcanvas() async depuis app_modules
          → Fallback statique si Supabase indisponible
          → Navigation dynamique — ajouter un module = INSERT SQL (D-2026-03-16-T03)

ÉTAPE 2 : Migrer admin (module de référence) ✅ FAIT

ÉTAPE 3 : Propagation bdb-shell aux modules Supabase actifs ✅
          → annuaire ✅ (corrections CDS) · arsenal ✅ (migration + bugs) · fiches ✅ (migration shell + C.9)
          → thesaurus ✅ (CRUD Supabase + enrichissement 419/420 · 2026-03-23)
          → ÉTAPE 3 TERMINÉE — 25/25 modules migrés (2026-03-23)

ÉTAPE 3B : Externalisation JS ✅ FAIT (10 modules, commit 7f3599f, 2026-03-23)
           → annuaire · admin · arsenal · fiches · transmissions
           → cours · anatomie · installation · preferences · supervision
           → Triade co-localisée : index.html · [module]-ui.css · [module]-app.js

ÉTAPE 4 : Corrections CSS ⏳
          → fiches-ui : scoper .btn-ghost ✅ (renommé .fiche-btn-ghost, session 2026-03-20)
          → annuaire-ui : scoper .badge-fn-*
          → thesaurus-ui : scoper .btn-xs
          → Remplacer style= width:80px par cds-thumbnail (6 modules)

ÉTAPE 5 : Modules localStorage Phase 1 ⏳
          → dork : FA → BI, onclick JS → addEventListener
          → Autres selon roadmap Phase 1
```

### G.2 À ne pas faire avant l'étape 3

- Ne pas créer de nouveau module HTML sans bdb-shell.js
- Ne pas migrer de données Supabase avant que le shell soit stable
- Ne pas toucher au planning

---

## BLOC H — ENTRÉES JOURNAL_DECISIONS

Toutes les décisions T01-T07 (2026-03-16) sont inscrites dans JOURNAL_DECISIONS_V1_9_0.md.

| Réf | Décision | Statut |
|---|---|---|
| D-2026-03-15-T01 | Cloud Supabase = env permanent. Local = dump DR uniquement. config.js supprimé du workflow. | ✅ INSCRIT |
| D-2026-03-15-T02 | Création bdb-shell.js — shell auth universel. window.bdbUser contrat défini. | ✅ INSCRIT |
| D-2026-03-15-T03 | Exception INTERDIT-17 documentée pour cds-overrides.css — 12 règles globales. | ✅ INSCRIT |
| D-2026-03-15-T04 | Règle style= : toléré uniquement couleurs dynamiques DB + largeurs progressbar. | ✅ INSCRIT |
| D-2026-03-15-T05 | pedagogie/ CTX créé — arbitrage en attente (corrigé par T05-CORR). | ✅ INSCRIT |
| D-2026-03-15-T05-CORR | pedagogie/ = module BDB embryonnaire. Option B validée. | ✅ INSCRIT |
| D-2026-03-15-T06 | admin-memo.html documenté dans NOYAU BLOC 6. | ✅ INSCRIT |
| D-2026-03-15-T07 | Doctrine modules embryonnaires BDB officielle. | ✅ INSCRIT |
| D-2026-03-15-T08 | Dette pertes sessions précédentes reconnue. Règle permanente. | ✅ INSCRIT |
| D-2026-03-15-T09 | 01_TEMPLATES restructuré. 3 templates officiels créés. | ✅ INSCRIT |
| D-2026-03-15-T10 | Bug flex #bdb-shell — INTERDIT-E1. Pattern HTML corrigé. | ✅ INSCRIT |
| D-2026-03-15-T11 | Pattern bouton action primaire admin — toolbar filtres obligatoire. INTERDIT-C4. | ✅ INSCRIT |
| D-2026-03-15-T12 | Création module CARNET_BORD. CTX v1.0.0 validé. 3 tables Supabase. | ✅ INSCRIT |
| D-2026-03-16-T01 | Migration CDS module ANNUAIRE — corrections class= + style=. | ✅ INSCRIT |
| D-2026-03-16-T02 | Migration shell + bugs module ARSENAL — cRenforcee + bdbShellReady. | ✅ INSCRIT |
| D-2026-03-16-T03 | Menu navigation dynamique app_groups + app_modules. bdb-shell v1.4.0. | ✅ INSCRIT |
| D-2026-03-16-T04 | Patch bug SQL colonne color manquante dans app_modules. | ✅ INSCRIT |
| D-2026-03-16-T05 | Architecture administration BDB — 4 onglets admin/. Q1-Q3 en attente. | ✅ INSCRIT |
| D-2026-03-16-T06 | Standard UX Premium : Skeleton Loaders. Bootstrap .placeholder. | ✅ INSCRIT |
| D-2026-03-16-T07 | Pattern Optimistic Updates autorisé périmètre strict. INTERDIT-C5 créé. | ✅ INSCRIT |
| D-2026-03-20-T01 | Standard Résilience Module C.9. INTERDIT-C6 (escHtml). 3 états UI obligatoires. Migration shell fiches. | ✅ INSCRIT |

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-15 | 1.0.0 | Création. Issu audit complet sources-bdb.zip. 6 blocs : connexion, shell auth, CSS, CDN, chaîne HTML, roadmap. |
| 2026-03-15 | 1.0.1 | BLOC F.4 corrigé : pedagogie/ = embryonnaire BDB option B (pas orphelin). BLOC E : INTERDIT-E1 ajouté + chaîne HTML pattern corrigé (D-T10). BLOC H : décisions T01-T10 toutes soldées. NOYAU_REF mis à jour V2.2.0. |
| 2026-03-15 | 1.0.2 | BLOC C.6 ajouté : pattern bouton action primaire admin (toolbar filtres). INTERDIT-C4 ajouté. BLOC F.1 : anatomie migré shell ✅, style= 0. BLOC H : T11 + T12 ajoutés. JOURNAL_DECISIONS → V1.8.0. |
| 2026-03-16 | 1.0.3 | BLOC C.5 : INTERDIT-C5 ajouté. BLOC C.7 : Skeleton Loaders (D-T06). BLOC C.8 : Optimistic Updates (D-T07). BLOC F.1 : annuaire ✅ + arsenal ✅. BLOC G.1 : bdb-shell v1.4.0 navigation dynamique. BLOC H : T01-T07 (2026-03-16) inscrits. JOURNAL → V1.9.0. NOYAU_REF V2.4.0. |
| 2026-03-16 | 1.0.4 | Consolidation : deux états V1.0.3 conflictuels fusionnés en source unique. Base retenue : V1.0.3__1_ (NOYAU V2.4.0 · bdb-shell v1.4.0 · 7 décisions 03-16). Aucun contenu nouveau. |
| 2026-03-16 | 1.0.5 | Audit CTO. BLOC A.1 : clef anon supprimée (INTERDIT-A1). BLOC C.7 : style= → Bootstrap pur fs-* (INTERDIT-C2). BLOC E : commentaire @latest → rappel INTERDIT prod (BLOC D.2). |
| 2026-03-20 | 1.0.6 | Migration shell fiches ✅. BLOC C.5 : INTERDIT-C6 ajouté (escHtml). BLOC C.9 : Standard Résilience Module (3 états UI + escHtml + throw init). BLOC F.1 : fiches shell ✅ + style= 0 ✅ + INTERDIT-17 ✅ + Résilience ✅. Colonne Résilience C.9 ajoutée. BLOC C.3 : btn-ghost résolu. BLOC C.6 : fiches migré. BLOC G.1 : 6 restants. JOURNAL → V1.10.0. |
| 2026-04-03 | 1.0.7 | Session #28. NOYAU_REF → MANIFESTE_REF (MANIFESTE_BDB_V1_1_0). D-2026-04-03-T01. |
