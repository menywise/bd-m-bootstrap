# CTX_HEADER_UNIVERSEL.md

```
VERSION  : 2.0.1
DATE     : 2026-03-21
STATUT   : CONTRAT — SHELL UNIVERSEL BDB (bdb-shell.js v1.4.0)
PORTÉE   : Tous les fichiers HTML de l'application BDB sans exception
NOYAU_REF: NOYAU_VERITE_V2_4_0
REMPLACE : v1.1.0 (pattern manuel header/offcanvas/auth — OBSOLÈTE)

TRACKER_STATUS     : migré
TRACKER_SHELL      : N/A
TRACKER_PALIER     : N/A
TRACKER_UPDATED    : 2026-03-21
TRACKER_VIOLATIONS : aucune_violation_active

NOTE TRACKER : Ce fichier est un document de contrat (pas un module applicatif).
  TRACKER_SHELL = N/A (ce document définit le shell — il n'en dépend pas).
  TRACKER_PALIER = N/A (pas de checklist premium applicable à un contrat).
  TRACKER_STATUS = migré (le contrat bdb-shell.js v1.4.0 est actif et validé).
  BDB Tracker doit traiter ce CTX comme référence de gouvernance,
  pas comme un module à migrer.

DELTA v2.0.0 → v2.0.1 :
  Ajout TRACKER_* adaptés + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
  BLOC 7 : SESSION_STATE.md ajouté comme fichier prioritaire d'ouverture.
  RÈGLE DE CLÔTURE : mise à jour TRACKER_* ajoutée.
```

> ⚠ RÈGLE ABSOLUE : Ce fichier documente le pattern bdb-shell.js v1.4.0.
> Le pattern v1.1.0 (header HTML statique + JS auth inline + offcanvas hardcodé)
> est OBSOLÈTE et ne doit jamais être reproduit.
> Source de vérité technique : CHANTIER_TECHNIQUE_V1_0_5 BLOCS B + E.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce document DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* adaptés + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
                   NOTE TRACKER ajoutée pour guider le BDB Tracker sur ce cas spécial.
RESTE À FAIRE    : Mettre à jour le tableau §11 (statut migration shell)
                   à chaque migration d'un module vers bdb-shell.js.
                   Modules ⏳ restants au 2026-03-16 :
                     fiches · transmissions · cours · installation · preferences · thesaurus
                   Note : fiches migré le 2026-03-20 — tableau §11 à corriger.
VIOLATIONS ACTIVES :
  Aucune violation sur ce document de contrat.
  ⚠ Tableau §11 non mis à jour depuis 2026-03-16 :
     fiches → ✅ migré (D-2026-03-20-T01) — à corriger dans §11.
VIOLATIONS RÉSOLUES :
  - v1.1.0 pattern manuel entièrement obsolète — remplacé par bdb-shell.js v1.4.0 (2026-03-16)
```

---

## 1 — PRINCIPE FONDAMENTAL

Depuis bdb-shell.js v1.4.0, **un module BDB ne contient plus de header, d'offcanvas
ni de logique d'auth**.

Un seul div dans `<main>` suffit :

```html
<div id="bdb-shell"
     data-module-title="[Nom du module]"
     data-module-icon="bi-[icon-bootstrap]">
</div>
```

bdb-shell.js injecte dans ce div :
- Le header sticky (hamburger + titre + avatar + menu utilisateur)
- L'offcanvas de navigation (généré dynamiquement depuis `app_groups` + `app_modules`)
- La vérification de session (redirect `login.html` si absent)
- L'exposition de `window.bdbUser` pour le module

**La navigation s'auto-génère.** Ajouter un module à BDB = `INSERT` dans `app_modules`.
Aucun fichier HTML à modifier.

---

## 2 — STRUCTURE HTML OBLIGATOIRE (tous modules)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>[Nom Module] — Bible de Bloc</title>

  <!-- 1. Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <!-- 2. Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet"/>
  <!-- 3. CDS tokens — REMPLACER @latest par tag de release avant déploiement OVH -->
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@latest/theme-base.css" rel="stylesheet"/>
  <!-- 4. CDS print -->
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@latest/theme-print.css" rel="stylesheet" media="print"/>
  <!-- 5. CDS overrides globaux -->
  <link href="../../css/cds-overrides.css" rel="stylesheet"/>
  <!-- 6. CSS module (un seul) -->
  <link href="../../css/[module]-ui.css" rel="stylesheet"/>
</head>

<body class="d-flex min-vh-100">
  <main class="d-flex flex-column flex-grow-1 main-content">

    <!-- SHELL — PREMIER ENFANT de <main> — obligatoire (INTERDIT-E1) -->
    <div id="bdb-shell"
         data-module-title="[Nom Module]"
         data-module-icon="bi-[icon]">
    </div>

    <!-- Contenu module -->
    <div class="container-fluid p-4 bg-light flex-grow-1">
      <!-- … contenu spécifique du module … -->
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
    // window.bdbUser est disponible ici (injecté par bdb-shell.js)
    await init();
  });
  </script>
</body>
</html>
```

---

## 3 — CHEMINS RELATIFS PAR PROFONDEUR

| Emplacement | Préfixe | Exemple |
|---|---|---|
| Racine (`index.html`, `login.html`) | `` (vide) | `js/supabase-client.js` |
| Module (`modules/[nom]/index.html`) | `../../` | `../../js/supabase-client.js` |
| Sous-page module (`modules/planning/dashboard.html`) | `../../` | `../../js/supabase-client.js` |

---

## 4 — CONTRAT window.bdbUser

Exposé par bdb-shell.js **avant** l'exécution du `DOMContentLoaded` du module.
Ne jamais faire de requête `profiles_directory` ou `user_roles` dans un module
pour obtenir ces informations — `window.bdbUser` est la source unique.

```javascript
window.bdbUser = {
  id       : 'uuid',       // auth.users.id
  email    : 'x@y.fr',
  prenom   : 'Manuel',
  nom      : 'Rohaut',
  initials : 'MR',
  role     : 'admin',      // 'admin' | 'member' | null
  isAdmin  : true
}
```

---

## 5 — INIT MODULE — PATTERN STANDARD

```javascript
document.addEventListener('DOMContentLoaded', async () => {

  // window.bdbUser déjà disponible — pas d'auth ici
  const { id, isAdmin } = window.bdbUser;

  // Guard admin (si module admin-only)
  if (!isAdmin) {
    location.href = '../../index.html';
    return;
  }

  // Logique métier du module
  await loadData();
});
```

Si la session est absente, bdb-shell.js redirige vers `login.html`
**avant** que le `DOMContentLoaded` du module ne s'exécute.
Le module ne gère jamais l'authentification.

---

## 6 — DATA-ATTRIBUTES bdb-shell

Le titre et l'icône du module dans le header sont paramètrés via `data-*` :

```html
<div id="bdb-shell"
     data-module-title="Arsenal"
     data-module-icon="bi-box-seam">
</div>
```

Référence des icônes : Bootstrap Icons 1.11.1 (https://icons.getbootstrap.com)

---

## 7 — NAVIGATION DYNAMIQUE (bdb-shell.js v1.4.0)

L'offcanvas de navigation est généré depuis les tables Supabase :

```
app_groups   → groupes de navigation (bloc · equipe · savoir · pilotage · espace_perso)
app_modules  → modules actifs par groupe (active=true · visible selon rôle)
```

Règle permanente (D-2026-03-16-T03) :
> Ajouter un module à BDB = `INSERT` dans `app_modules`. Zéro modification HTML.

Fallback : si Supabase est indisponible, bdb-shell.js injecte une navigation statique
de secours (définie dans bdb-shell.js — ne pas dupliquer dans les modules).

---

## 8 — INTERDIT-E1 — POSITION DE #bdb-shell

```
INTERDIT-E1 : #bdb-shell doit toujours être le PREMIER ENFANT de <main>.
              Jamais frère de <main> dans <body>.

MOTIF : body.d-flex crée une colonne flex horizontale.
        Si #bdb-shell est frère de <main>, il s'insère comme colonne parallèle
        → header injecté non sticky → layout cassé.

PATTERN FAUX :
  <body class="d-flex min-vh-100">
    <div id="bdb-shell" ...></div>   ← frère de main = FAUX
    <main>...</main>
  </body>

PATTERN CORRECT :
  <body class="d-flex min-vh-100">
    <main class="d-flex flex-column flex-grow-1">
      <div id="bdb-shell" ...></div> ← premier enfant de main = CORRECT
      <div class="container-fluid">...</div>
    </main>
  </body>
```

Référence : D-2026-03-15-T10 (JOURNAL_DECISIONS_V1_9_0)

---

## 9 — RÈGLES CSS OBLIGATOIRES

Ordre de chargement strict — identique sur tous les modules :

```
1. Bootstrap 5.3.2        (CDN jsdelivr — tag fixe)
2. Bootstrap Icons 1.11.1 (CDN jsdelivr — tag fixe)
3. theme-base.css         (CDN menywise/BDB — @latest dev · tag fixe prod)
4. theme-print.css        (CDN menywise/BDB — media="print")
5. css/cds-overrides.css  (local)
6. css/[module]-ui.css    (local — UN SEUL par module)
```

---

## 10 — VIOLATIONS INTERDITES

```
✗ Dupliquer le bloc HTML header dans un module (bdb-shell.js gère tout)
✗ Dupliquer le bloc JS auth dans un module (bdb-shell.js gère tout)
✗ Hardcoder l'offcanvas de navigation (généré dynamiquement depuis app_modules)
✗ Charger bdb-preview.js dans un module (chargé par bdb-shell.js)
✗ onclick="..." sur les boutons
✗ style="..." statiques dans le HTML
✗ Font Awesome (fa-*) — Bootstrap Icons uniquement
✗ #bdb-shell frère de <main> (INTERDIT-E1)
✗ Faire une requête profiles_directory ou user_roles pour obtenir l'utilisateur
  → window.bdbUser est la source unique (INTERDIT-B2)
✗ @latest sur les CDN BDB en production (INTERDIT-E)
```

---

## 11 — MODULES SHELL MIGRÉ (à mettre à jour à chaque migration)

| Module | Shell migré | style= | Référence |
|---|---|---|---|
| admin | ✅ | 8 à corriger | D-2026-03-15-T02 |
| anatomie | ✅ | 0 ✅ | D-2026-03-15-T09 |
| annuaire | ✅ | 0 ✅ | D-2026-03-16-T01 |
| arsenal | ✅ | 0 ✅ | D-2026-03-16-T02 |
| fiches | ✅ | 0 ✅ | D-2026-03-20-T01 |
| transmissions | ⏳ | 9 à corriger | — |
| cours | ⏳ | 13 à corriger | — |
| installation | ⏳ | 8 à corriger | — |
| preferences | ⏳ | 3 à corriger | — |
| thesaurus | ⏳ | 8 à corriger | — |

⚠ Ce tableau est la source de vérité visuelle du chantier shell.
Mettre à jour à chaque migration validée — ne pas attendre SESSION_STATE.md.

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : header_universel (document de contrat)
OBJECTIF SESSION    : [mise à jour contrat OU consultation]
FICHIERS IN SCOPE   : Ce fichier CTX uniquement
FICHIERS HORS SCOPE : Tous les modules applicatifs

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX_HEADER_UNIVERSEL v2.0.1

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md (ou version plus récente)
  [ ] Ce fichier CTX_HEADER_UNIVERSEL v2.0.1
```

---

## RÈGLE DE CLÔTURE

En fin de chaque session modifiant ce document :

1. Mettre à jour BLOC 0 (état courant)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour le tableau §11 si une migration shell a été effectuée
4. Inscrire dans JOURNAL_DECISIONS toute décision validée
5. Incrémenter VERSION de ce fichier

---

## HISTORIQUE

```
2026-03-09 — v1.0.0  Création. Pattern header/offcanvas/auth manuel statique.
2026-03-15 — v1.1.0  NOYAU_REF V2.1.0 ajouté. Contenu inchangé.
2026-03-16 — v2.0.0  RÉÉCRITURE COMPLÈTE. bdb-shell.js v1.4.0. Pattern v1.1.0 obsolète.
                      Navigation dynamique app_modules. INTERDIT-E1. Tableau migration.
2026-03-21 — v2.0.1  TRACKER_* adaptés (N/A pour SHELL et PALIER — document contrat).
                      BLOC 0 ajouté. BLOC 7 SESSION_STATE.md. RÈGLE DE CLÔTURE étendue.
                      §11 : fiches ✅ migré (D-2026-03-20-T01).
```
