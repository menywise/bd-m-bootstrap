# Architecture Niveaux d'Accès — BDB

```
VERSION  : 1.2.0
DATE     : 2026-04-25
STATUT   : CANON — SOURCE DE VÉRITÉ
PORTÉE   : bdb-shell.js · tous les modules · atelier/ · conseil/
DELTA    : V1.1.0 → V1.2.0
           Section 9 supprimée — tout y est implémenté (bdb-shell v2.5.0).
           window.bdbUser complet (isDemo, isMember, isAdmin, isCreator).
           window.bdbApp implémenté (table app_instance).
           Signaux visuels implémentés dans bdb-shell v2.3.0+.
           Anomalies C1-C4 soldées. C5 conservé.
```

---

## 1 — Hiérarchie des niveaux

```
isCreator → isAdmin → isMember → isDemo
```

Chaque niveau contient TOUS les droits des niveaux en dessous.

| Niveau | Propriété code | DB source | Signification |
|---|---|---|---|
| 0 | `isDemo` | `role = 'invite'` | Découverte — lecture seule |
| 1 | `isMember` | `role = 'membre'` | Usage professionnel — app complète |
| 2 | `isAdmin` | `role = 'admin'` | Back-office — CRUD métier |
| 3 | `isCreator` | `is_creator = true` | Gouvernance — doctrine + schéma |

**Règle d'implication (dans bdb-shell.js — jamais recalculé ailleurs) :**

```javascript
isDemo    = true                          // toujours
isMember  = role !== 'invite'
isAdmin   = role === 'admin' || is_creator === true
isCreator = is_creator === true
```

---

## 2 — Contrat window.bdbUser (bdb-shell v2.5.0)

```javascript
window.bdbUser = {
  id         : 'uuid',
  email      : 'x@y.fr',
  prenom     : 'Manuel',
  nom        : 'Rohaut',
  initials   : 'MR',
  avatar_url : null,
  fonction   : 'infirmier',
  role       : 'admin',      // enum DB FR : 'invite' | 'membre' | 'admin'
  isDemo     : true,
  isMember   : true,
  isAdmin    : true,
  isCreator  : false
}
```

⚠ `role` = enum PostgreSQL FR. Ne JAMAIS comparer à `'member'` (anglais).

---

## 3 — Contrat window.bdbApp (bdb-shell v2.5.0)

```javascript
window.bdbApp = {
  nom      : 'Des Blocs & Moi',
  nomCourt : 'DBM',
  couleur  : '#0d6efd',
  logo     : null
}
```

Source : table `app_instance` (1 ligne par déploiement).

---

## 4 — Signaux visuels

Injectés par **bdb-shell.js exclusivement**. Aucun module ne gère son propre signal.

| Niveau actif | Signal | Couleur | Position |
|---|---|---|---|
| isDemo | Bandeau "Mode Découverte" | Jaune `#ffc107` | Sous le header |
| isMember | Aucun | — | — |
| isAdmin | Badge "Admin" | Bleu `#0d6efd` | Header shell |
| isCreator | Badge "Créateur" | Violet `#6f42c1` | Header shell |

**Simulation de mode (Manu uniquement) :**
Bouton contextuel "Mode Découverte actif — Quitter".
Géré par `js/bdb-preview.js` — jamais par les modules.

---

## 5 — Guards de page

### isMember — aucun guard

Tout membre authentifié accède.

### isAdmin — slot masqué

```html
<div class="d-none" id="adminSlot">...</div>
<div class="d-none" id="adminSection">...</div>
```

```javascript
if (window.bdbUser.isAdmin) {
  document.getElementById('adminSlot').classList.remove('d-none');
  document.getElementById('adminSection').classList.remove('d-none');
}
```

### isCreator — guard complet

```html
<div id="guardDenied" class="d-none"><!-- Message accès refusé --></div>
<div id="creatorContent" class="d-none"><!-- Contenu créateur --></div>
```

```javascript
if (!window.bdbUser.isCreator) {
  document.getElementById('guardDenied').classList.remove('d-none');
  return;
}
document.getElementById('creatorContent').classList.remove('d-none');
```

---

## 6 — Surfaces L3 et déploiement OVH

| Surface | Dossier | OVH | Fork client |
|---|---|---|---|
| Atelier | `atelier/` | ✅ | ❌ |
| Conseil | `conseil/` | ✅ | ❌ |

Guard `is_creator = true` dans `profiles`. Vérifié par bdb-shell.

---

## 7 — Chaîne JS canonique (ordre strict)

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

Hash CDN theme-base.css : `@63905396c73b061f336f8f5178d738627bca601c` (complet, jamais tronqué, jamais `@latest`).

---

## 8 — Anomalies terrain

| Code | Anomalie | Statut |
|---|---|---|
| C1 | `supabase.min.js` → `supabase.js` | ✅ Soldé S#87 |
| C2 | Hash CDN tronqué → hash complet | ✅ Soldé S#89 |
| C3 | `bdb-invite-guard.js` absent | ✅ Soldé S#87 |
| C4 | Guard `isCreator` absent | ✅ Soldé S#86 |
| C5 | `style="z-index:9999"` dans `bdb-crud-helpers.js` | À corriger |

---

## HISTORIQUE

```
2026-04-25 — V1.2.0
  Suppression section 9 "ce qui n'existe pas encore" — tout implémenté.
  window.bdbUser complet (isDemo, isMember, isAdmin, isCreator).
  window.bdbApp implémenté (table app_instance).
  Signaux visuels implémentés (bdb-shell v2.3.0+).
  Chaîne JS ajout bdb-ui.js.
  Bump bdb-shell v1.9.1 → v2.5.0.

2026-04-17 — V1.1.0
  Création. Session #87 + #89.

2026-04-14 — V1.0.0
  Brainstorming complet. Hiérarchie 4 niveaux.
```
