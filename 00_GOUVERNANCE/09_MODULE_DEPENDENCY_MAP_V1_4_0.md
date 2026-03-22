# MODULE_DEPENDENCY_MAP.md

```
VERSION  : 1.4.0
DATE     : 2026-03-21
AUTEUR   : Manu + Claude
STATUT   : CANON — CARTE DES DÉPENDANCES RÉELLES
PORTÉE   : Application BDB complète
SOURCE   : Audit terrain sessions 2026-02-26 → 2026-03-21
PATCH    : v1.3.0 → v1.4.0 (2026-03-21)
           - fiches : tag_suggestions ajoutée en dépendance (workflow proposer tag)
           - §3 : tag_suggestions — section nouvelle (transverse tags)
           - §3 : bdb-shell.js v1.5.0 (auto-logout D-2026-03-21-S01)
           - §4 : graphe mis à jour (tag_suggestions + bdb-shell v1.5.0)
         v1.2.0 → v1.3.0 (2026-03-21)
           - admin : app_groups + app_modules retirés (→ supervision/ exclusivement)
           - supervision : nouvelle entrée §2
           - §3 : app_modules/app_groups — écriture supervision/ exclusivement
           - §4 : graphe mis à jour (supervision ✅)
         v1.1.0 → v1.2.0 (2026-03-16)
           - SOCLE : bdb-shell.js v1.4.0 ajouté
           - bdb-preview.js : chargé dynamiquement par bdb-shell (pas en direct)
           - SHARED/bdb-members.js : marqué référence fantôme
```

---

## RÈGLE D'USAGE

Dépendances **réelles et vérifiées** — pas théoriques.
Toute dépendance observée dans le code terrain est documentée ici.
Toute nouvelle dépendance créée → inscrite ici avant livraison.

Interdiction :
- créer une dépendance entre deux modules sans l'inscrire ici
- supprimer une dépendance sans vérifier qu'aucun module ne la consomme encore

---

## 1 — SOCLE COMMUN (chargé par tous les modules)

| Fichier | Rôle | Chargé depuis |
|---|---|---|
| `bootstrap@5.3.2` | Framework CSS/JS UI | CDN jsdelivr |
| `bootstrap-icons@1.11.1` | Icônes | CDN jsdelivr |
| `theme-base.css` | Tokens CDS | CDN github menywise/BDB |
| `theme-print.css` | CDS print | CDN github menywise/BDB |
| `css/cds-overrides.css` | Overrides globaux CDS | Local |
| `@supabase/supabase-js@2` | SDK Supabase | CDN jsdelivr |
| `js/supabase-client.js` | Auth + connexion Supabase + `window.bdb` | Local |
| `js/bdb-shell.js` | Shell auth universel — offcanvas + header + `window.bdbUser` + auto-logout 30min (v1.5.0) | Local |
| `js/bdb-preview.js` | Prévisualisation rôles admin | Chargé **dynamiquement par bdb-shell.js** uniquement |

---

## 2 — DÉPENDANCES PAR MODULE

### Légende

- **Tables Supabase** : tables réellement lues ou écrites (ou cibles migration)
- **Dépend de (modules)** : autres modules BDB dont ce module dépend
- **Est consommé par** : modules qui lisent des données de ce module

---

### planning

| Champ | Valeur |
|---|---|
| Stack | localStorage + JSON snapshots (file://) — **cible Supabase Phase 2** |
| Dépend de (socle) | supabase-client.js · StorageKeyService |
| Tables Supabase | aucune — cibles Phase 2 : planning_slots · planning_affectations · planning_semaines (arbitrage A1 PENDING) |
| Dépend de (modules) | aucun |
| Est consommé par | aucun |
| Dette | localStorage source de vérité · 31 membres hardcodés (UUIDs) → aligner profiles_directory · **bdb-members.js SHARED/ = référence fantôme** (SHARED/ inexistant en BDB V2) · bdb-shell pas encore intégré (migration couplée Phase 2) |
| Fichiers clés | planning-schema.js · planning-controller.js · planning-matrix.js · storage-key-service.js |

---

### admin

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js · bdb-shell.js |
| Tables Supabase | categories · content_types · profiles_directory · tags · transmissions · user_roles · materiel_types · zones_anatomiques · zones_stockage · etageres |
| Tables HORS SCOPE | app_groups · app_modules → supervision/ exclusivement (D-2026-03-21-T01) |
| Dépend de (modules) | aucun |
| Est consommé par | aucun |
| Shell | ✅ migré (2026-03-15) |
| Bug résolu | E9 : approved lu depuis profiles_directory.approved (2026-03-12) |

---

### supervision

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js · bdb-shell.js |
| Tables possédées | supervision_config · supervision_rules · supervision_rule_delta · supervision_sessions |
| Tables SOCLE (CRUD exclusif) | **app_modules** · **app_groups** — seul module autorisé en écriture |
| Dépend de (modules) | aucun |
| Est consommé par | aucun |
| Shell | ✅ (création 2026-03-21) |
| Accès | admin uniquement — guard isAdmin + RLS bdb_is_admin() |
| Browser API | File System API (showDirectoryPicker) — mode local uniquement |
| Dettes | Responsive mobile non testé · status='active' à activer après checklist 5/5 |

---

### annuaire

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js · bdb-shell.js |
| Tables Supabase | profiles_directory · profiles · user_roles · casaques · gants · preferences_chirurgien |
| Dépend de (modules) | preferences (lien fiche chirurgien) |
| Est consommé par | aucun |
| Shell | ✅ migré · style= 0 ✅ (D-2026-03-16-T01) |
| Dette | avatars cloud Lovable non migrables — fallback initiales actif |

---

### arsenal

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js · bdb-shell.js |
| Tables Supabase | materiel · materiel_types · etageres · zones_stockage · zones_anatomiques · casaques · gants · content_images · tags |
| Dépend de (modules) | aucun |
| Est consommé par | fiches (références matériel) |
| Shell | ✅ migré · style= 0 ✅ (D-2026-03-16-T02) |
| Bugs résolus | cRenforcee (ID dupliqué select/checkbox) · bdbShellReady (isAdmin toujours false) |
| Dette | content_images : dette encodage historique · données partielles à recetter |

---

### fiches

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js · bdb-shell.js · DOMPurify@3.0.6 (CDN) |
| Tables Supabase | fiches_intervention · categories · content_images · content_types · profiles_directory · tag_links · tags · content_relations · **tag_suggestions** (write — bouton "Proposer ce tag" — FUTUR) |
| Dépend de (modules) | arsenal (matériel) · anatomie (zones) · installation (positions) · preferences (chirurgien) |
| Est consommé par | cours · installation |
| Shell | ✅ migré · style= 0 ✅ · escHtml ✅ · C.9 ✅ (D-2026-03-20-T01) |
| Frontière critique | SLOT (planning) ≠ intervention (fiches) — ne jamais fusionner |
| Note DOMPurify | `DOMPurify.sanitize(f.description)` obligatoire dans openFicheView() |

---

### preferences

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js |
| Tables Supabase | preferences_chirurgien · fiches_intervention · profiles_directory · tag_links · tags · user_roles |
| Dépend de (modules) | fiches · annuaire |
| Est consommé par | fiches · annuaire |
| Param URL | `?chirurgien=[id]` — deep link depuis annuaire |

---

### transmissions

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js |
| Tables Supabase | transmissions · categories · content_images · content_types · profiles_directory · tag_links · tags |
| Dépend de (modules) | aucun |
| Est consommé par | portail index.html (stats live) |
| Bug actif B2 | `GET /tags?type=in.(...)` → 400 — colonne type à vérifier en base |
| Dette DOMPurify | À appliquer (D2 session sécurité bloquée — fichier non fourni) |

---

### anatomie

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js |
| Tables Supabase | anatomie · zones_anatomiques · categories · content_images · content_types · profiles_directory · tag_links · tags · user_roles |
| Dépend de (modules) | aucun |
| Est consommé par | fiches · arsenal |
| Données | partielles — 1 ligne en base, à recetter |

---

### cours

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js |
| Tables Supabase | cours · categories · content_images · content_types · profiles_directory · tag_links · tags · user_roles |
| Dépend de (modules) | fiches (référence interventions) |
| Est consommé par | carnet_bord (BRIQUE SUIVANTE) · objectifs (BRIQUE SUIVANTE) |
| Données | 3 lignes en base · non recetté |
| Dette DOMPurify | À appliquer (D2 session sécurité bloquée — fichier non fourni) |

---

### installation

| Champ | Valeur |
|---|---|
| Stack | Supabase |
| Dépend de (socle) | supabase-client.js |
| Tables Supabase | installation_patient · fiches_intervention · content_relations · categories · content_images · content_types · profiles_directory · tag_links |
| Dépend de (modules) | fiches (content_relations) |
| Est consommé par | fiches |
| Bug actif B3 | initAuth cible ID ancien header → innerHTML null |

---

### disc

| Champ | Valeur |
|---|---|
| Stack | localStorage (`disc_*`) — **cible Supabase Phase 1** |
| Dépend de (socle) | aucun Supabase · **bdb-members.js SHARED/ = référence fantôme** |
| Tables Supabase | aucune — cible Phase 1 : disc_results (arbitrage A2 PENDING) |
| Dépend de (modules) | aucun |
| Est consommé par | aucun |
| Dette | 17 icônes Font Awesome · monofichier éclaté (9 fichiers) · bdb-shell absent |
| Fichiers clés | disc-schema.js · disc-engine.js · disc-storage.js · disc-controller.js |

---

### dork

| Champ | Valeur |
|---|---|
| Stack | localStorage (`dorkDashboard_*`) — **cible Supabase Phase 1** |
| Dépend de (socle) | supabase-client.js (cible) |
| Tables Supabase | aucune — cibles Phase 1 : dork_profiles · dork_sources · dork_history (arbitrage A2-dork PENDING) |
| Dépend de (modules) | aucun |
| Est consommé par | aucun |
| Accès | admin uniquement |
| Dette | Font Awesome → BI · onclick= → addEventListener · CSS intégré → dork-ui.css |
| Note | CTX v1.0.0 était une hallucination complète (D-2026-03-13-009) |

---

### collab

| Champ | Valeur |
|---|---|
| Stack | localStorage (`CK_*`) — **cible Supabase Phase 1** |
| Tables Supabase | aucune — cibles Phase 1 à définir (arbitrage A4 PENDING — lire code avant schéma) |
| Dette | ordre JS critique (context.js AVANT storage.js) · TDZ ContextManager · onclick= héritées |

---

### paxis

| Champ | Valeur |
|---|---|
| Stack | localStorage — **cible Supabase Phase 1** |
| Tables Supabase | aucune — cibles Phase 1 : sessions paxis par user_id |
| Dette | 25 onclick= · CSS intégré → paxis-ui.css |

---

### organisateur

| Champ | Valeur |
|---|---|
| Stack | localStorage — **cible Supabase Phase 1** |
| Tables Supabase | aucune — cibles Phase 1 : phases par user_id |
| Dette | régression touch mobile active · CSS intégré → organisateur-ui.css |
| Note | Premier candidat migration Phase 1 (dette CDS minimale) |

---

### thesaurus

| Champ | Valeur |
|---|---|
| Stack | DATA embarquées (const inline) — **cible Supabase Phase 1** |
| Tables Supabase | aucune — cibles : thesaurus_interventions · thesaurus_protocoles (SQL prêts) |
| Volume | 70 361 interventions · 420 protocoles · 2 spécialités · 10 chirurgiens |
| Migration | VALIDÉE — D-2026-03-13-001 |

---

### accueil / ged / carnet_bord / objectifs

| Module | Stack cible | Dépend de | Statut |
|---|---|---|---|
| accueil | statique (zéro Supabase) | portail | BRIQUE SUIVANTE |
| ged | statique (zéro Supabase) | portail · PDFs BLUMEDI | BRIQUE SUIVANTE |
| carnet_bord | Supabase | cours · profiles | BRIQUE SUIVANTE — tables à créer |
| objectifs | Supabase | cours · carnet_bord · profiles | BRIQUE SUIVANTE — tables à créer |

---

## 3 — DÉPENDANCES TRANSVERSES CRITIQUES

### bdb-shell.js (v1.5.0)

Consommé par : tous les modules Supabase actifs + tout nouveau module BDB
Rôle : shell auth universel — offcanvas · header · `window.bdbUser` · **auto-logout 30min** (v1.5.0)
Règle : `../../js/bdb-shell.js` · `#bdb-shell` = premier enfant de `<main>` (INTERDIT-E1)
Navigation : dynamique depuis `app_modules` (v1.4.0)

### app_modules / app_groups

Lus par : bdb-shell.js (navigation — lecture seule)
**Écrits par : supervision/ exclusivement** (D-2026-03-21-T01)
Règle : admin/ n'a PAS le droit d'écriture sur ces tables.

### tag_suggestions

Lue/écrite par : fiches (INSERT proposition membre) — UI FUTUR
Administrée par : admin/ (onglet tags — validation/rejet) — UI FUTUR
Relation : propose l'ajout dans `tags` — validation admin manuelle en v1

### bdb-preview.js

Consommé par : `index.html` (portail) via bdb-shell.js
Rôle : prévisualisation rôles admin (sessionStorage)
Règle : **chargé dynamiquement par bdb-shell.js** — ne pas inclure manuellement

### StorageKeyService

Consommé par : `planning`
Rôle : point d'accès unique clés localStorage semaines
Règle : aucun consommateur ne lit via préfixe legacy `planning_S`

### supabase-client.js

Consommé par : tous les modules Supabase
Rôle : connexion unique, `window.bdb`, `bdbRequireAuth`, `bdbToast`
Règle : jamais dupliquer URL ou clé anon (INTERDIT-A1)

### ~~bdb-members.js (SHARED/)~~ — RÉFÉRENCE FANTÔME

⚠ `SHARED/` n'existe pas dans BDB V2.
Consommateurs affectés : `planning` · `disc`
Action : résoudre lors de la migration Phase 1 (disc) et Phase 2 (planning)

---

## 4 — GRAPHE DE DÉPENDANCES (vue simplifiée)

```
SOCLE
  supabase-client.js ──────────────────────────────────────────┐
  bdb-shell.js (v1.5.0 — auto-logout) ────────────────────────┤ (tous les modules Supabase)
    └── bdb-preview.js (dynamique, admin only)                  │
                                                                 │
MODULES SUPABASE (shell ✅ = migré)                            │
  transmissions ────────────────────────────────               │     portail ──┘
  admin ✅ ──────────────────────────────────────              │     (index.html)
  supervision ✅ ──────────────────────── app_modules/app_groups (CRUD exclusif)
  annuaire ✅ ── preferences ──────────────                    │
  arsenal ✅ ──┐                                               │
               ├── fiches ──[tag_suggestions]── cours ────     │
  anatomie ✅ ─┤          └── installation                     │
                                                                 │
tags ──── tag_links ──── contenus                              │
      └── tag_suggestions (workflow proposer → valider)        │
                                                                 │
MODULES localStorage (→ migration Supabase)                    │
  planning  [⚠ bdb-members fantôme]                           │
  disc      [⚠ bdb-members fantôme]                           ─┘
  collab · paxis · organisateur · dork [admin only]

STANDALONE (→ migration Supabase)
  thesaurus
```

---

## 5 — RÈGLES D'ÉVOLUTION

1. Toute nouvelle dépendance → entrée JOURNAL_DECISIONS
2. Toute suppression → vérifier tous les consommateurs
3. Toute migration Supabase → mettre à jour "Tables Supabase" du module
4. Un module ne peut pas importer directement depuis un autre module

---

## HISTORIQUE

```
2026-03-09 — v1.0.0  Création. Audit terrain sessions 2026-02-26 → 2026-03-09.
2026-03-13 — v1.1.0  Correction hallucination dork. Suppression liens fantômes planning/dork.
                      thesaurus : arbitrage VALIDÉ. Graphe mis à jour.
2026-03-16 — v1.2.0  Audit CTO. bdb-shell.js v1.4.0 ajouté SOCLE.
                      bdb-preview.js : chargé par bdb-shell (pas en direct).
                      SHARED/bdb-members.js : référence fantôme.
                      annuaire ✅ · arsenal ✅. §3 réécrit. Graphe mis à jour.
2026-03-21 — v1.3.0  Arbitrage supervision/admin (D-2026-03-21-T01) :
                      admin : app_groups/app_modules retirés.
                      supervision : nouvelle entrée (shell ✅).
                      §3 : app_modules/app_groups — exclusivité écriture supervision/.
2026-03-21 — v1.4.0  fiches : tag_suggestions ajoutée (FUTUR — D-2026-03-21-S01).
                      fiches : DOMPurify@3.0.6 ajouté en dépendance socle.
                      transmissions + cours : dette DOMPurify documentée (bloqué session sécurité).
                      bdb-shell.js → v1.5.0 (auto-logout 30min — D-2026-03-21-S01).
                      §3 : section tag_suggestions ajoutée. Graphe mis à jour.
```
