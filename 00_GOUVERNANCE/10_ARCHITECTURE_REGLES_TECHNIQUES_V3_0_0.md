# BDB — Architecture Système & Règles Techniques

```
VERSION  : 3.0.0
DATE     : 2026-04-25
STATUT   : CANON — CONTRAT D'ARCHITECTURE
PORTÉE   : Application BDB complète
FUSIONNE : CTX_SYSTEM_ARCHITECTURE V2.5.0 + CHANTIER_TECHNIQUE V1.1.0
PRINCIPE : Zéro référence à un fichier mort. Sources = DB live + docs projet.
```

---

## 1 — CE QU'EST BDB

BDB (Bible de Bloc) est une application de knowledge management pour blocs opératoires.
Elle transmet le savoir opératoire des IBODE expertes aux novices.

```
Stack         : HTML/JS/CSS vanilla + Bootstrap 5.3.3 + Supabase cloud
Déploiement   : FTP sur OVH mutualisé (hébergement statique, pas de backend)
Nom public    : "Des Blocs & Moi" (DBM) — piloté par table app_instance
Projet Supabase : ecpzrygzdugwwkqbsajn
URL prod      : https://hashtag.manuelrohaut.fr/bdb/
Dev local     : C:\DEV\BIBLE_DE_BLOC\
```

---

## 2 — SOURCES DE VÉRITÉ (hiérarchie)

```
1. information_schema          → schéma DB réel (prime sur tout document)
2. atelier_principes (DB)      → règles, interdits, conventions actives
3. atelier_decisions (DB)      → décisions validées (append-only, 424+)
4. Docs projet Claude .md      → architecture, doctrine, pédagogie
5. Code déployé (terrain)      → état réel des fichiers HTML/JS/CSS
```

La vérité ne réside JAMAIS dans une conversation IA. En cas de conflit entre
deux sources, le rang supérieur prime. Signaler le conflit au créateur.

---

## 3 — COUCHES DU SYSTÈME

### 3.1 — Couche L3 Gouvernance (Manu × IA)

Tables `atelier_*` et `bernard_*` en DB Supabase. Guard `is_creator = true`.
Dossiers `atelier/` et `conseil/` sur OVH, exclus des forks clients.
Sessions de travail pilotées par RPC `atelier_prompt_reprise()`.

### 3.2 — Couche Socle Technique (L1)

| Composant | Rôle | Version |
|---|---|---|
| `js/bdb-shell.js` | Shell universel : auth, header, sidebar, navigation dynamique, `window.bdbUser`, `window.bdbApp` | v2.5.0 |
| `js/supabase-client.js` | Connexion unique Supabase (`window.bdb`) | — |
| `js/bdb-ui.js` | Helpers UI : `bdbToast()`, `bdbConfirm()`, `escHtml()` | — |
| `js/bdb-invite-guard.js` | Intercept mutations si `role='invite'` | v1.0.0 |
| `js/bdb-preview.js` | Simulation de rôle (chargé par shell, pas par les modules) | — |
| `css/cds-overrides.css` | Couche premium delta (vidée S#89 — Smarty V5 = norme) | — |
| Bootstrap 5.3.3 | CDN jsdelivr (tag fixe) | 5.3.3 |
| Bootstrap Icons | CDN jsdelivr | 1.11.1 |
| theme-base.css | CDN menywise/BDB@63905396 — Smarty V5 custom (sans BS embarqué) | @63905396 |

### 3.3 — Couche Données (L1+L2)

Supabase cloud exclusif. 131 tables. Voir `02_SUPABASE_DATA_MODEL_V1_24_0.md`.

### 3.4 — Couche Modules Métier (L1+L2)

23 modules actifs (source : table `app_modules`). Chaque module = triade co-localisée :
`modules/[module]/index.html` + `[module]-ui.css` + `[module]-app.js`.

---

## 4 — CONTRAT `window.bdbUser`

Exposé par `bdb-shell.js` après init. Disponible via `await bdbShellReady`.

```javascript
window.bdbUser = {
  id        : 'uuid',
  email     : 'x@y.fr',
  prenom    : 'Manuel',
  nom       : 'Rohaut',
  initials  : 'MR',
  avatar_url: null,
  fonction  : 'infirmier',
  role      : 'admin',       // enum DB FR : 'invite' | 'membre' | 'admin'
  isDemo    : true,           // toujours true — tout le monde peut voir
  isMember  : true,           // role !== 'invite'
  isAdmin   : true,           // role === 'admin' || is_creator
  isCreator : false           // is_creator === true dans profiles
}
```

**Hiérarchie** : `isCreator → isAdmin → isMember → isDemo`
Chaque niveau contient TOUS les droits des niveaux en dessous.

⚠ `role` = enum PostgreSQL FR. Ne JAMAIS comparer à `'member'` (anglais).

## 5 — CONTRAT `window.bdbApp`

```javascript
window.bdbApp = {
  nom      : 'Des Blocs & Moi',
  nomCourt : 'DBM',
  couleur  : '#0d6efd',
  logo     : null
}
```

Source : table `app_instance` (1 ligne par déploiement).
Le code interne utilise `BDB` — jamais visible user.

---

## 6 — MODULES ACTIFS (source live : `app_modules`)

| Groupe | Modules |
|---|---|
| **Bloc Opératoire** | planning (admin), fiches, installation, anatomie, arsenal |
| **Équipe** | annuaire, preferences, carnet_bord, transmissions |
| **Savoir** | cours, thesaurus, glossaire, faq |
| **Pilotage** | admin (admin), profile, supervision (admin) |
| **Espace Personnel** | disc, objectifs, veille-documentaire (admin), boite-a-idees, interview, organisateur |

Ajouter un module = `INSERT INTO app_modules`. Aucun fichier HTML à modifier.

---

## 7 — CHAÎNE DE CHARGEMENT (ordre strict)

### CSS (dans `<head>`)

```html
<!-- 1. Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
<!-- 2. Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
<!-- 3. theme-base Smarty V5 (hash COMPLET, jamais @latest) -->
<link href="https://cdn.jsdelivr.net/gh/user/repo@63905396c73b061f336f8f5178d738627bca601c/theme-base.css" rel="stylesheet"/>
<!-- 4. cds-overrides (delta premium) -->
<link href="[root]css/cds-overrides.css" rel="stylesheet"/>
<!-- 5. CSS module (un seul par module) -->
<link href="[module]-ui.css" rel="stylesheet"/>
```

### JS (fin de `<body>`)

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="[root]js/supabase-client.js"></script>
<script src="[root]js/bdb-ui.js"></script>
<script src="[root]js/bdb-invite-guard.js"></script>
<script src="[root]js/bdb-shell.js"></script>
<script src="[module]-app.js"></script>
```

`[root]` selon profondeur : `modules/[module]/` → `../../` · `atelier/` → `../` · racine → `./`

---

## 8 — STRUCTURE HTML D'UN MODULE (template V5)

```html
<!DOCTYPE html>
<!-- BDB | Surface: MODULE | Auth: required | Shell: bdb-shell -->
<html lang="fr" data-bs-theme="light">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>[Module] — Des Blocs & Moi</title>
  <!-- Chaîne CSS §7 -->
</head>
<body>
  <div id="wrapper" class="d-flex align-items-stretch flex-column min-vh-100">
    <div id="bdb-shell"
         data-module-title="[Module]"
         data-module-icon="bi-[icon]"
         data-root-path="../../">
    </div>
    <div id="wrapper_content" class="flex-grow-1">
      <main id="middle">
        <div class="container-fluid p-3 p-md-4">
          <!-- Contenu module -->
        </div>
      </main>
    </div>
    <footer class="mt-auto py-3 border-top text-center text-muted bg-white">
      <small>&copy; 2026 <span class="app-nom"></span></small>
    </footer>
  </div>
  <!-- Chaîne JS §7 -->
</body>
</html>
```

**INTERDIT-E1** : `#bdb-shell` = premier enfant de `#wrapper`. Jamais frère. Sinon page blanche.

---

## 9 — ARBORESCENCE FICHIERS

```
/                           → pages système (login, offline, 404…)
site/                       → mini-site public (vision, audiences, faq…) — PAS d'auth
modules/[module]/           → modules authentifiés (triade HTML+CSS+JS)
js/                         → socle partagé (bdb-shell, supabase-client, bdb-ui…)
css/                        → cds-overrides.css
atelier/                    → L3 créateur (guard isCreator)
conseil/                    → L3 créateur (guard isCreator)
```

⚠ `modules/site/` N'EXISTE PAS. Le mini-site public est dans `site/` racine.
Toute référence à `modules/site/site/` est une hallucination historique.

---

## 10 — PRINCIPES D'ARCHITECTURE

### Supabase exclusif

Supabase = moteur de données unique. Aucune nouvelle donnée métier en localStorage.
Exceptions temporaires documentées : `planning` (localStorage, migration Phase 2 pending).

### Modularité

Chaque module est autonome. Un module ne dépend jamais d'un autre module
sans que ce soit documenté dans une décision (`atelier_decisions`).

### Flux de données

```
UI module → window.bdb.from('table') → Supabase cloud (RLS)
```

Pas de couche service intermédiaire. Accès direct Supabase via `window.bdb`.

### Frontières métier (non négociables)

```
SLOT ≠ INTERVENTION     → planning manipule des slots, fiches des interventions
SALLE ≠ COULOIR          → métriques séparées, agrégation interdite
approved ≠ user_roles    → approved = profiles, role = user_roles. Bug E9 si inversé.
CDS ≠ BDB               → CDS = framework UI, BDB = application métier
```

---

## 11 — INTERDITS TECHNIQUES (extrait — liste complète en DB `atelier_principes`)

### HTML

| Code | Interdit |
|---|---|
| INTERDIT-C2 | Zéro `style=` statique (sauf honeypot + progressbar) |
| INTERDIT-E1 | `#bdb-shell` = premier enfant de `#wrapper` |
| INTERDIT-C6 | `escHtml()` obligatoire sur tout `innerHTML` avec donnée DB |

### JS

| Code | Interdit |
|---|---|
| INTERDIT-B1 | Zéro auth dupliquée dans un module (bdb-shell gère) |
| INTERDIT-B2 | Zéro requête `profiles_directory` / `user_roles` dans un module |
| INTERDIT-B3 | Zéro `initAuth()` local |
| INTERDIT-D4 | `.select()` obligatoire sur `.update()` et `.delete()` |
| INTERDIT-D6 | Zéro `console.log` en production |
| INTERDIT-A1 | Zéro duplication URL/clé Supabase |
| INTERDIT-A3 | Client Supabase unique (`window.bdb`) |
| INTERDIT-JS-01 | Zéro inline JS — tout dans `[module]-app.js` |

### CSS

| Code | Interdit |
|---|---|
| INTERDIT-17 | Override Bootstrap scopé obligatoire (sauf cds-overrides.css) |
| INTERDIT-C1 | Zéro modification cds-overrides.css sans décision documentée |
| CONV-ICONS | Bootstrap Icons uniquement — zéro Font Awesome |
| CONV-CDN-FROZEN | Hash CDN figé `@63905396…` — jamais `@latest` |

### Fichiers protégés (accord créateur requis)

```
bdb-shell.js · supabase-client.js · cds-overrides.css · bdb-ui.js
```

---

## 12 — PATTERNS OBLIGATOIRES

### Async DOM — 3 états (CONV-ASYNC-3ETATS)

Toute opération async affichant des données couvre : loading (skeleton), empty (message), error (toast + retry).

### Contenu membre — workflow éditorial (RÈGLE-WORKFLOW-01)

`draft` → validation admin → `active`. Les admins bypas la queue.

### Guards d'accès

```javascript
// Admin — slot masqué
if (window.bdbUser.isAdmin) {
  document.getElementById('adminSlot').classList.remove('d-none');
}

// Créateur — guard complet (pages atelier/ conseil/)
if (!window.bdbUser.isCreator) {
  document.getElementById('guardDenied').classList.remove('d-none');
  return;
}
```

### Initialisation module

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await bdbShellReady;
  const { isAdmin } = window.bdbUser;
  // ... init module
});
```

---

## 13 — BACK OFFICE (3 surfaces)

| Surface | URL | Accès | Rôle |
|---|---|---|---|
| Admin métier | `modules/admin/index.html` | isAdmin | Gestion instance (users, tags, catégories, modules) |
| Supervision | `modules/supervision/index.html` | isAdmin | Audit infra, conformité CDS |
| Atelier/Conseil | `atelier/` + `conseil/` | isCreator | Gouvernance, doctrine, CRUD tables système |

Kit back office : voir `02_BACK_OFFICE_REF_V1_1_0.md` (9 briques, 5 couches, 6 règles).

---

## 14 — DÉMO INVITÉ

Compte `demo@bdb.app`, rôle `invite`. 17 tables `demo_*` en lecture seule.
Guard `bdb-invite-guard.js` intercepte toute mutation Supabase côté client.
RLS en défense en profondeur côté serveur.

---

## 15 — EDGE FUNCTION

| Fonction | Rôle | Flag |
|---|---|---|
| `delete-user` | Suppression compte | `--no-verify-jwt` (gère son propre auth) |

---

## 16 — PWA

`manifest.json` + `sw.js` v1.1.0 + `offline.html` + icons.
Installée Android. `favicon.ico` injecté dans 54 fichiers HTML.

---

## HISTORIQUE

```
2026-04-25 — V3.0.0
  Fusion CTX_SYSTEM_ARCHITECTURE V2.5.0 + CHANTIER_TECHNIQUE V1.1.0.
  Toutes références vérifiées live via Supabase MCP.
  Suppression : réfs JOURNAL_DECISIONS .md (mort), NOYAU_VERITE (mort),
    MODULE_DEPENDENCY_MAP (mort), PERSONAS .md (mort).
  MAJ : bdb-shell v1.6.0 → v2.5.0, BS 5.3.2 → 5.3.3,
    modules/site/ → site/ racine, window.bdbUser complet (isDemo/isMember).
  23 modules actifs (source live app_modules).
  Compact : 533+821 lignes → ~380 lignes.
```
