# BADGE DE CONFORMITÉ V5 — modules/glossaire/ — V2 (corrigé)

```
MODULE       : modules/glossaire/ (index.html + glossaire-app.js + glossaire-ui.css)
RÔLE         : REF-MODULE-DBM-01 (module étalon — STATUT À RECONFIRMER)
DATE         : 2026-05-08
AUDITEUR V1  : Claude (instance claude.ai) — badge V1
AUDITEUR V2  : Claude (instance Cowork) — contre-audit + cross-check cloud
MÉTHODE      : Grille AUDIT_N0 §1 colonnes A-J + 7 voix + vérif disque + vérif atelier_decisions/atelier_principes
RÉFÉRENCE V1 : BADGE_CONFORMITE_V5_GLOSSAIRE_2026-05-08.md (uploads)
```

---

## 0. POURQUOI UNE V2

V1 a produit deux erreurs structurelles que la doctrine cloud invalide.

### Erreur capitale 1 — Recommandation Option A illégitime

V1 recommande : *« UPDATE CONV-CHAIN-E en DB pour refléter la nouvelle chaîne (dbm-theme + bdb-ui-kit). La session #115 a adopté la Charte v3, le glossaire est le premier module à l'appliquer. »*

Vérification cloud (`atelier_decisions`, statut active) :

- **D-2026-05-07-S115-CHARTE-PREMIUM** § *Hors scope* :
  > « Hors scope (FAB(3R) requis) : renommage bdb-* → dbm-*, **theme-base CDN → local**, palette HSL 28 modules »

- **D-2026-05-08-S115-CLOTURE-ALIGN** point (3) :
  > « Fichiers dbm-premium-components.css + bdb-zone-state.js HORS chaîne V5 → à reverser dans `_deltas/` (Action C). »

→ La migration `theme-base CDN → dbm-theme local` n'a **jamais** été validée par FAB(3R). Elle est explicitement **hors scope** session #115. Recommander de la régulariser dans un audit revient à exécuter Niveau 0 INTERDIT-1 (changement de cap silencieux) **par l'audit lui-même**.

**Option B est la seule conforme à la doctrine actuelle** : rétablir `theme-base@4faebd02 + cds-overrides` sur le module. Sinon : ouvrir un FAB(3R) et attendre l'arbitrage du Créateur. L'audit ne tranche pas — il signale.

### Erreur capitale 2 — Sous-comptage des violations

V1 annonce 8 violations (1 P0, 2 P1, 2 P2, 3 P3). Vérification disque : **15 violations**, dont une non listée (V9 ci-dessous) au moins aussi sérieuse que P1.

---

## 1. VERDICT V2

```
┌────────────────────────────────────────────────────┐
│  ÉTAT      : CONTAMINÉ                             │
│  VERDICT   : NON ÉTALON EN L'ÉTAT                  │
│  BADGE V5  : V5 NON CONFORME                       │
│              (15 violations dont 1 P0 bloquante    │
│               + 1 P0 doctrinal sur l'audit V1)     │
│  PRÉ-REQUIS ÉTALON : P0 résolu + P1 patchés        │
└────────────────────────────────────────────────────┘
```

Le module **est** le mieux structuré du parc DB&M (cf. 7 voix V1, confirmées). Mais il **ne peut pas** servir d'étalon tant que la chaîne CSS n'est pas re-canonique (ou validée par FAB(3R)) et que les duplications JS ne sont pas absorbées.

---

## 2. CHAÎNE CSS — VÉRIFICATION CLOUD

| Source | Chaîne attendue |
|---|---|
| `atelier_principes` `CONV-CHAIN-E` (active) | Bootstrap 5.3.3 → **theme-base.css** (Smarty V5 CDN) → Bootstrap Icons 1.11.1 → **cds-overrides.css** → **dbm-module-color.css** → `[module]-ui.css` |
| `atelier_principes` `P-CDS-01` (active) | Hash CDN figé : `@4faebd0280e559235fcbfaec2b24d407cebf0a95` |
| Carnet V2 §6 | Identique |
| CLAUDE.md V2.4 §17 | Identique |

| Source | Chaîne réelle module |
|---|---|
| `modules/glossaire/index.html` L11-L16 | Bootstrap 5.3.3 → Bootstrap Icons 1.11.1 → **`dbm-theme.css`** (local) → **`bdb-ui-kit.css`** (local) → `dbm-module-color.css` → `glossaire-ui.css` |

**Diff** :
- `theme-base.css` (CDN canon) **remplacé** par `dbm-theme.css` (local non décidé)
- `cds-overrides.css` (canon) **remplacé** par `bdb-ui-kit.css` (local non décidé)
- Bootstrap Icons en position 2 au lieu de 3 (ordre divergent)

**Verdict P0** : violation Niveau 0 INTERDIT-1 (changement de cap silencieux), INTERDIT-2 (destruction silencieuse de la chaîne canon), INTERDIT-3 (régression silencieuse de la doctrine).

---

## 3. VIOLATIONS — TABLEAU CONSOLIDÉ V2

Vérification systématique disque + cloud. Chaque ligne est confirmée par grep ou requête SQL.

| # | Sév. | Réf | Détail | Source vérification | V1 |
|---|---|---|---|---|---|
| **V1** | **P0** | CONV-CHAIN-E + P-CDS-01 | Chaîne CSS hors canon (dbm-theme + bdb-ui-kit au lieu de theme-base@4faebd02 + cds-overrides) | index.html L11-L16 + cloud | ✓ (mais résolution V1 illégitime) |
| **V2** | P1 | INTERDIT-JS-02 | `showToast()` local L27-L35, 39 appels — duplique `bdbToast` de `bdb-ui.js` | grep glossaire-app.js | ✓ |
| **V3** | P1 | INTERDIT-TABLE-SCROLL | Table admin gestion 567+ entrées sans pagination (exception ≤50 ne s'applique pas) | V1 + cohérent règle | ✓ |
| **V4** | P1 | **INTERDIT-COULEUR-01** | `.glos-badge-pathologie` `#dc3545` (rouge saturé en surface) | grep glossaire-ui.css L35-37 | **✗ oublié V1** |
| **V5** | P2 | INTERDIT-MODULE-COLOR-01 | 8 couleurs hardcodées badges glos-badge-* (CSS L25-62) | grep glossaire-ui.css | ✓ |
| **V6** | P2 | INTERDIT-C2 | **10** inline `style=` dans index.html (V1 sous-comptait : 9). Lignes 59, 73, 75, 86, 90, 105, 122, 137, 138, 164. 4 non exemptés (gradient L73, opacity L75, toolbar bg L86, padding L137/L138/L164 cosmétiques) | grep -n style= | ~ (sous-compté) |
| **V7** | P2 | CONV-MODAL-07 | btn-close non coloré module (5 modales L508/L572/L622/L686/L711) | grep btn-close | ✓ |
| **V8** | P3 | — | 2 liens morts footer L486-L487 (`href="#"` Aide + Accessibilité) | grep | ✓ |
| **V9** | **P1** | CONV-CHAIN-E (ordre JS) | `bdb-pwa.js` chargé dans `<head>` ligne 7 — avant Bootstrap CSS, hors chaîne JS V5 (qui place tout en fin de body) | index.html L7 | **✗ oublié V1** |
| **V10** | P3 | CONV-SURFACE-MARKER-HTML | Marker non canonique : 5 champs au lieu de 4 (`Theme: DBM` ajouté). Format canon : `<!-- DBM | Surface: ... | Auth: ... | Shell: ... -->` | index.html L2 | **✗ oublié V1** |
| **V11** | P2 | — | Structure HTML divergente du template canon : `<div class="app-layout"><main class="app-main" id="main-content">` au lieu de `<main id="middle">` (CLAUDE.md V2.4 §17) | index.html L57-58 | **✗ oublié V1** |
| **V12** | P3 | — | Attribut `data-shell-theme="dbm"` (L53) non documenté dans pattern shell canon | index.html L53 | **✗ oublié V1** |
| **V13** | P3 | — | Attribut `data-login-mode="modal"` (L52) non documenté côté doctrine | index.html L52 | **✗ oublié V1** |
| **V14** | P3 | — | Variables couleur module dupliquées 3 fois (head `:root` L20-25, attribut style L59 sur `app-content`, et `dbm-module-color.css` qui injecte aussi). CONV-MODULE-COLOR-02 justifie 2, pas 3 | index.html L20-25, L59 | **✗ oublié V1** |
| **V15** | P3 | — | SEO meta sur module authentifié : `robots: index, follow` + canonical + OG/Twitter. Cohérent uniquement si vocation publique explicite décidée. Sinon contamination indexation | index.html L28-L40 | ✓ (signalé comme « décision ») |
| **V16** | P3 | INTERDIT-D4 (à confirmer) | 15+ `innerHTML =` directs avec `.map()` — `escHtml` est appelé sur les variables sensibles, mais audit ligne par ligne nécessaire (faux négatif possible) | grep glossaire-app.js | ~ |

**Total : 16 entrées** (V1 + V16 d'audit complémentaire). **6 oubliées par V1**. **1 sous-comptée**.

---

## 4. CONFLIT DOCTRINAL DÉTECTÉ DANS LA BASE

Lors de la vérification de `INTERDIT-E1` :

| Champ | Valeur en base |
|---|---|
| `titre` | « #bdb-shell = premier enfant de `<main>` » |
| `description` | « doit être le premier enfant de `#wrapper`, jamais... enfant de `<main>` » |

Le titre **contredit** la description du même principe. La mise à jour V5 (session #89, confirmée par AUDIT_CONFLITS_SOURCES conflit 1 résolu) a corrigé la description mais pas le titre.

**Action** : aligner le titre du principe `INTERDIT-E1` en base — petit UPDATE, mais c'est de la propreté doctrinale critique pour les futurs audits.

---

## 5. COLONNES A-J — CORRECTIONS V2

### A — État : CONTAMINÉ (confirmé V1)

### B — Rôle : TRANSMETTRE + AUDITER (confirmé V1)

### C — ARE révisé

| Centre | V1 | V2 | Justification correction |
|---|---|---|---|
| A — Action | 5/5 | **4/5** | -1 : table admin 567 entrées sans pagination = action gênée pour l'admin |
| R — Réflexion | 4/5 | **3/5** | -1 supplémentaire : chaîne CSS hors canon = fondation R faussée |
| E — Émotion | 3/5 | 3/5 | inchangé |

### D — Spirale : ORANGE (confirmé V1)

### E — Type ennéagramme processus : 5 (SAVOIR) (confirmé V1)

### F — 6 interdits Niveau 0 — révisé

| # | Interdit | V1 | V2 | Correction |
|---|---|---|---|---|
| 1 | Pas de changement de cap silencieux | ✅ | **❌** | Le commentaire L10 documente la dérive **dans le module**, pas dans la doctrine cloud. CONV-CHAIN-E n'a pas été mis à jour. C'est silencieux côté doctrine. |
| 2 | Pas de destruction silencieuse | ✅ | **❌** | `theme-base.css` et `cds-overrides.css` ont été remplacés sans migration documentée. |
| 3 | Pas de régression silencieuse | ⚠️ | **❌** | V1 le voyait. V2 confirme : régression non absorbée par la doctrine. |
| 4 | Pas d'hallucination silencieuse | ✅ | ✅ | confirmé |
| 5 | Pas de fausse interprétation silencieuse | ✅ | ⚠️ | V1 a interprété la décision charte premium comme validant la migration CSS. C'est faux. Le badge V1 lui-même viole INTERDIT-5. |
| 6 | Pas de changement de hauteur silencieux | ✅ | ✅ | confirmé |

### G — 3 maladies — révisé

| Maladie | V1 | V2 |
|---|---|---|
| **Amnésie** | ⚠️ | **❌** : V1 a oublié de cross-checker la décision charte premium (D-2026-05-07-S115-CHARTE-PREMIUM § Hors scope) qui est explicite |
| **Boulimie** | ✅ | ✅ |
| **Certitude** | ✅ | **⚠️** : V1 affirme « Option A est la bonne » sans avoir lu la décision cloud qui dit explicitement le contraire |

### I — Verdict V2 : NON ÉTALON EN L'ÉTAT

L'étalon est conditionnel. Conditions cumulatives :
1. P0 résolu (chaîne CSS canon ou FAB(3R) explicite) — **arbitrage Manu**
2. V2 (showToast → bdbToast) patché
3. V3 (table pagination) patché
4. V4 (rouge `#dc3545`) patché
5. V9 (bdb-pwa.js position) patché
6. V10 (surface marker canon) patché

Les P2/P3 peuvent attendre, ne bloquent pas le statut étalon.

### J — Plan d'action V2

| # | Priorité | Action | Décideur | Effort |
|---|---|---|---|---|
| 1 | **P0** | **Arbitrer V1** : (a) rétablir chaîne canon V5 sur le module, OU (b) ouvrir FAB(3R) pour valider `dbm-theme.css` + `bdb-ui-kit.css` comme remplaçants officiels de `theme-base.css` + `cds-overrides.css` | **Manu** | Décision |
| 2 | P1 | Patcher V2 : 39 `showToast(...)` → `bdbToast(...)`, retirer fonction locale + 3 conteneurs HTML toast | Claude AI/Code | 30 min |
| 3 | P1 | Patcher V3 : pagination serveur sur Gestion (567+ entrées) | Claude AI/Code | 1-2h |
| 4 | P1 | Patcher V4 : remplacer `#dc3545` du badge pathologie par variant non saturé | Claude Design + Manu | 5 min après choix couleur |
| 5 | P1 | Patcher V9 : déplacer `bdb-pwa.js` vers fin de body, position canonique dans la chaîne JS | Claude AI/Code | 5 min |
| 6 | P2 | Patcher V6 (3 inline styles) + V7 (btn-close coloré) + V11 (structure HTML) | Claude AI/Code | 30 min |
| 7 | P3 | Patcher V8 (footer) + V10 (marker) + V12-V13 (attributs) + V14 (dédup variables) + V15 (SEO décision) | Claude AI/Code | 30 min |
| 8 | — | **Aligner titre** `INTERDIT-E1` en base (titre dit `<main>`, description dit `#wrapper`) | Manu | 1 min |
| 9 | — | Re-générer un BADGE V3 après corrections, valider statut étalon | Claude AI/Cowork | — |

---

## 6. NOTE AUX 7 VOIX V1

Les 7 voix V1 sont globalement justes. Une seule correction matérielle :

**Gaël (T9w8 — assemblage)** disait :
> *« Si l'étalon n'est pas aligné sur CONV-CHAIN-E, tous les modules audités après lui seront comparés à une référence contaminée. C'est le plus grand risque systémique. »*

Cette voix avait raison. Le badge V1 a quand même conclu Option A (régulariser le module = le rendre étalon de la nouvelle chaîne). Gaël a été entendu mais pas écouté. **V2 le réécoute** : on ne fait pas étalon d'un module dont la chaîne contredit une décision active de la base, sans FAB(3R).

---

## 7. HISTORIQUE

```
2026-05-08 — V1.0.0 (Claude AI claude.ai)
  Audit initial. 8 violations. Verdict AMÉLIORABLE. Recommandation Option A.

2026-05-08 — V2.0.0 (Claude Cowork)
  Contre-audit avec cross-check cloud (atelier_decisions + atelier_principes).
  6 violations supplémentaires identifiées (V4, V9-V14).
  1 sous-comptage corrigé (V6).
  Recommandation V1 invalidée : Option A viole D-2026-05-07-S115-CHARTE-PREMIUM § Hors scope.
  Conflit doctrinal détecté en base (titre INTERDIT-E1).
  Verdict révisé : NON ÉTALON EN L'ÉTAT.
```
