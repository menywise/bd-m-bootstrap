# S#108 — Audit micro pages app/ BDB

## Date : 2026-04-26
## Périmètre : 12 fichiers HTML + 1 JS dans `C:\DEV\BIBLE_DE_BLOC\app\` (profondeur 1)
## Méthode : lecture intégrale + Test-Path automatisé sur chaque href/src relatif (69 liens vérifiés)
## Standards : chaîne CSS BLOC E (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides) ; chaîne JS shell (bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell) ; structure DOM (#wrapper → #bdb-shell → #wrapper_content → main#middle) ; balise GF-2 ; data-root-path à profondeur 1 = `"../"`

> **Contexte S#108** : ces 12 HTML + `recherche-app.js` ont été déplacés de la racine vers `app/`. La Phase 4 de la migration a mis à jour `data-root-path="./"` → `"../"`, les chemins `href="./css/..."` → `"../css/..."`, `src="js/..."` → `"../js/..."`, et les liens `href="index.html"` / `href="login.html"` → `"../index.html"` / `"../login.html"`.

---

## 1. aide.html

**Rôle** : Centre d'aide in-app — accordéon par thème (recherche, contribution, compte, technique).
**Audience** : membre authentifié (P1 prioritaire — novice qui bloque)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme (BS 5.3.3 → theme-base → BI 1.11.1 → cds-overrides)
**Chaîne JS** : conforme — bootstrap.bundle, supabase-js@2, `../js/supabase-client.js`, `../js/bdb-ui.js`, `../js/bdb-invite-guard.js`, `../js/bdb-shell.js`
**Structure DOM** : conforme — `#wrapper → #bdb-shell → #wrapper_content → main#middle`

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- `../js/supabase-client.js`, `../js/bdb-ui.js`, `../js/bdb-invite-guard.js`, `../js/bdb-shell.js` → tous EXISTENT
- `mailto:` (footer aide CTA) — N/A

**data-root-path** : `"../"` (L32) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 2. archivage.html

**Rôle** : Gestion des contenus archivés (`actif=false`) — admin uniquement, masquage réversible vs suppression irréversible.
**Audience** : admin uniquement (guard `isAdmin` JS)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour empty state
**Structure DOM** : conforme — guard `#guardNonAdmin` + `#adminContent`

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT
- `../index.html` (L47, bouton retour si non admin) → EXISTE

**data-root-path** : `"../"` (L34) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 3. changelog.html

**Rôle** : Notes de version BDB — historique des évolutions visibles par les membres (statique, MAJ par release).
**Audience** : membre authentifié (tous personas)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme + `<style>` inline scoped pour `.cl-entry`, `.cl-tag-*` (toléré : styles de présentation cosmétique)
**Chaîne JS** : conforme (chaîne shell standard)
**Structure DOM** : conforme

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT

**data-root-path** : `"../"` (L44) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 4. contact.html

**Rôle** : Page contact et support — publique, URL déclarée Play Store. Deux audiences : membres app + prospects établissements.
**Audience** : tout le monde (sans authentification)
**Utilise bdb-shell** : non (page publique)
**Template V5 utilisé** : aucun (page publique standalone)

**Chaîne CSS** : conforme + `<style>` inline scoped
**Chaîne JS** : minimal — bootstrap.bundle uniquement (pas de Supabase, page statique)
**Structure DOM** : standalone — `.contact-header` + `.contact-body` (pas de wrapper shell, cohérent avec "Shell: non")

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- `aide.html` (L77, co-localisé app/) → EXISTE
- `../site/audiences.html#direction` (L102) → EXISTE
- `../site/instances.html` (L116) → EXISTE
- `suppression-compte.html` (L133, co-localisé app/) → EXISTE
- `../politique-confidentialite.html` (L145) → EXISTE
- `../mentions-legales.html` (L146) → EXISTE
- `mailto:contact@bdb.app` (×3) — N/A

**data-root-path** : ABSENT — N/A (page publique sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : CONFORME

---

## 5. export.html

**Rôle** : Export données instance (CSV/JSON) — admin uniquement. Protocoles, fiches, glossaire, membres.
**Audience** : admin uniquement
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour boutons export
**Structure DOM** : conforme — guard `#guardNonAdmin` + `#adminContent`

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT
- `../index.html` (L44, bouton retour) → EXISTE

**data-root-path** : `"../"` (L32) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 6. impressions.html

**Rôle** : Préparation et impression de protocoles / fiches / listes (usage terrain — imprimer avant salle).
**Audience** : membre authentifié (Sabine, Olivia)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme + `<style>` inline pour règles `@media print` (justifié : page d'impression nécessite des règles print scopées)
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour `window.print()` et boutons
**Structure DOM** : conforme

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT

**data-root-path** : `"../"` (L39) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 7. notifications.html

**Rôle** : Centre de notifications in-app — empty state placeholder (table notifications non créée à ce jour).
**Audience** : membre authentifié
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour empty state + filtres passifs
**Structure DOM** : conforme

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT

**data-root-path** : `"../"` (L36) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 8. onboarding.html

**Rôle** : Premier accès — guide P1 (Isabelle, novice). Stepper 4 étapes : orientation → modules → chercher → contribuer.
**Audience** : membre authentifié (P1 — Isabelle, J+1)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme + `<style>` inline pour animations stepper (`.onb-step`, `.onb-dot`, `@keyframes fadeInUp`)
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour navigation stepper
**Structure DOM** : conforme

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT
- `../index.html` (L169, bouton "Aller au portail") → EXISTE
- JS — redirection : `../index.html` (L220, post-dismiss localStorage) → EXISTE

**data-root-path** : `"../"` (L60) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 9. parametres.html

**Rôle** : Paramètres de l'instance — admin uniquement. Configuration L2 (nom établissement, spécialité, modules, logo).
**Audience** : admin uniquement (guard `isAdmin` JS)
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme (chaîne shell standard) + script inline pour guard admin
**Structure DOM** : conforme — guard `#guardNonAdmin` + `#adminContent`

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- 4× scripts `../js/...` → tous EXISTENT
- `../index.html` (L51, bouton retour) → EXISTE
- `../modules/admin/index.html` (L115, L117, "Gérer les modules") → EXISTE

**data-root-path** : `"../"` (L36) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 10. recherche.html

**Rôle** : Page de recherche transverse (Fuse.js fuzzy search via `BdbSearch`).
**Audience** : membre authentifié
**Utilise bdb-shell** : oui
**Template V5 utilisé** : RACINE (devenu app/ post-S108) — module simple (1 HTML + 1 JS co-localisé)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + extensions :
- `../js/bdb-pwa.js` (L7, HEAD)
- bootstrap.bundle, supabase-js@2
- `../js/supabase-client.js`, `../js/bdb-ui.js`, `../js/bdb-invite-guard.js`, `../js/bdb-shell.js`
- `../js/bdb-search.js` (L57)
- `recherche-app.js` (L58, **co-localisé dans app/** — pas de préfixe `../`) ✓
**Structure DOM** : conforme — `#wrapper → #bdb-shell → #wrapper_content → main#middle → #searchContainer`

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- `../js/bdb-pwa.js`, `../js/supabase-client.js`, `../js/bdb-ui.js`, `../js/bdb-invite-guard.js`, `../js/bdb-shell.js`, `../js/bdb-search.js` → tous EXISTENT
- `recherche-app.js` (co-localisé app/) → EXISTE

**data-root-path** : `"../"` (L29) → CORRECT pour profondeur 1

**Balise GF-2** : `<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->` → CONFORME

**Verdict** : CONFORME

---

## 10b. recherche-app.js (vérification spéciale)

**Rôle** : Bootstrap minimal pour la page recherche — attend `bdbShellReady` puis appelle `BdbSearch.init()`.
**Contenu intégral (5 lignes)** :
```javascript
'use strict';
document.addEventListener('DOMContentLoaded', async function () {
  await window.bdbShellReady;
  await BdbSearch.init({ container: '#searchContainer' });
});
```

**Vérification chemins relatifs** :
- Aucun `import`, aucune `URL`, aucun `fetch` avec chemin relatif vers `../js/`, `../modules/`, `../css/`
- Le script utilise uniquement deux globals (`window.bdbShellReady`, `BdbSearch`) — donc aucune dépendance de chemin

**Verdict** : CONFORME (déplacement vers `app/` n'a aucun impact — le fichier ne contient aucun chemin)

---

## 11. sondage.html

**Rôle** : Sondage IBODE "Des Blocs & Moi" — formulaire 5 questions, public, anonyme. Insertion table `sondage_reponses` Supabase.
**Audience** : tout le monde (page publique landing dédiée IBODE)
**Utilise bdb-shell** : non (page publique standalone)
**Template V5 utilisé** : aucun (landing page indépendante avec design custom)

**Chaîne CSS** : conforme (BS 5.3.3, theme-base, BI 1.11.1, cds-overrides) + bloc `<style>` inline volumineux (~190 lignes) pour design hero/story/modules/survey scopé. Toléré pour landing dédiée mais pourrait être externalisé dans `css/sondage-ui.css`.
**Chaîne JS** : minimal — `../js/bdb-pwa.js` (L7) + bootstrap.bundle + supabase-js@2 (L424). Pas de `supabase-client.js` (initialise sa propre instance via `SUPABASE_URL`/`SUPABASE_ANON_KEY` dans `config.js`, conditionné via `try/catch`).
**Structure DOM** : standalone — `.hero` + `.story` + `.modules` + `.survey` + `#success-state`. Cohérent "Shell: non".

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- `../js/bdb-pwa.js` → EXISTE
- **`assets/icons/icon-192x192.png` (L246)** → CASSÉ — DOUBLE anomalie :
  1. Le fichier `icon-192x192.png` n'existe PAS dans `assets/icons/` (le fichier réel est `icon-192.png`). Erreur masquée par `onerror="this.style.display='none'"` — anomalie pré-S108.
  2. Le chemin relatif `assets/icons/...` depuis `app/` cherche `app/assets/icons/...` qui n'existe pas. Devrait être `../assets/icons/...` ou `/bdb/assets/icons/...` post-migration.

**data-root-path** : ABSENT — N/A (page publique sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` (anglais) au lieu de `Auth: aucune` (français) — incohérent avec contact.html et suppression-compte.html (toutes deux SITE-PUBLIC dans app/, utilisent `Auth: aucune`).

**Verdict** : 3 violations à corriger
**Violations** :
1. **L246** — `<img src="assets/icons/icon-192x192.png">` : chemin relatif obsolète post-S108 (cherche dans `app/assets/`). À corriger en `../assets/icons/...`.
2. **L246** — `icon-192x192.png` n'existe pas dans `assets/icons/` (anomalie pré-S108). Renommer en `icon-192.png` ou créer le fichier 192×192. L'erreur est silencieuse via `onerror`, mais le visiteur ne voit pas la photo d'Isabelle.
3. **L2** — Balise GF-2 utilise `Auth: none` au lieu de `Auth: aucune`. Incohérent avec les autres pages SITE-PUBLIC du projet.

---

## 12. suppression-compte.html

**Rôle** : Page de suppression de compte — publique et accessible sans auth (obligation Play Store Google 2023). Deux flux : connecté (Edge Function `delete-user`) et non-connecté (email).
**Audience** : tout le monde (déclarée fiche développeur Google Play)
**Utilise bdb-shell** : non (page publique avec détection session optionnelle)
**Template V5 utilisé** : aucun (page publique standalone)

**Chaîne CSS** : conforme + `<style>` inline scoped pour `.del-header`, `.del-body`, `.step-num`
**Chaîne JS** : minimal — bootstrap.bundle, supabase-js@2, `../js/supabase-client.js` (L181). Script inline pour vérification session + Edge Function `delete-user`.
**Structure DOM** : standalone — `.del-header` + `.del-body` avec `#flowConnected` + `#flowGuest`. Cohérent "Shell: non".

**Liens sortants** :
- `../css/cds-overrides.css` → EXISTE
- `../js/supabase-client.js` → EXISTE
- `../index.html` (L125, bouton "Annuler" flux connecté) → EXISTE
- `../login.html` (L162, bouton "Se connecter d'abord" flux guest) → EXISTE
- `../politique-confidentialite.html` (L173) → EXISTE
- `../mentions-legales.html` (L174) → EXISTE
- JS — redirection : `../login.html` (L223, post-signOut) → EXISTE
- `mailto:contact@bdb.app?subject=...` (×2) — N/A
- `https://ecpzrygzdugwwkqbsajn.supabase.co/functions/v1/delete-user` (L204, Edge Function) — externe, hors périmètre

**data-root-path** : ABSENT — N/A (page publique sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : CONFORME

---

## Récapitulatif

| Page | Rôle (court) | Shell | data-root-path | Liens (ok/total) | GF-2 | Verdict |
|---|---|---|---|---|---|---|
| aide.html | Centre d'aide | oui | `../` ✓ | 5/5 | OK | CONFORME |
| archivage.html | Archivage admin | oui | `../` ✓ | 6/6 | OK | CONFORME |
| changelog.html | Notes de version | oui | `../` ✓ | 5/5 | OK | CONFORME |
| contact.html | Contact public | non | N/A | 7/7 | OK | CONFORME |
| export.html | Export CSV admin | oui | `../` ✓ | 6/6 | OK | CONFORME |
| impressions.html | Impression terrain | oui | `../` ✓ | 5/5 | OK | CONFORME |
| notifications.html | Centre notifs | oui | `../` ✓ | 5/5 | OK | CONFORME |
| onboarding.html | Guide nouveau | oui | `../` ✓ | 6/6 | OK | CONFORME |
| parametres.html | Params instance admin | oui | `../` ✓ | 7/7 | OK | CONFORME |
| recherche.html | Recherche Fuse.js | oui | `../` ✓ | 8/8 | OK | CONFORME |
| sondage.html | Sondage IBODE public | non | N/A | 2/3 | **`Auth: none`** | 3 violations |
| suppression-compte.html | RGPD suppression | non | N/A | 6/6 | OK | CONFORME |
| recherche-app.js | Bootstrap recherche (5 lignes) | n/a | N/A | n/a (aucun chemin) | n/a | CONFORME |

### Statistiques finales

- **Total fichiers audités** : 13 (12 HTML + 1 JS)
- **Liens vérifiés** : 69 (68 valides, 1 cassé)
- **Pages CONFORMES** : 11 HTML + 1 JS = **12/13**
- **Pages avec violations** : **1** — `sondage.html` (3 violations distinctes)

### Détail unique violation : sondage.html

| Ligne | Problème | Correctif |
|---|---|---|
| L2 | GF-2 `Auth: none` (anglais) | → `Auth: aucune` (français, cohérent avec contact.html et suppression-compte.html) |
| L246 | `assets/icons/icon-192x192.png` cherché dans `app/assets/icons/` (n'existe pas post-S108) | → `../assets/icons/icon-192x192.png` ou chemin absolu `/bdb/assets/icons/...` |
| L246 (cumulé) | Le fichier `icon-192x192.png` n'existe PAS dans `assets/icons/` (anomalie pré-S108 masquée par `onerror`) | → Renommer en `icon-192.png` (présent) ou créer un fichier 192×192 réel pour la photo d'Isabelle P. |

### Conformité par catégorie

- **Chaîne CSS** : 13/13 conformes (BS 5.3.3 → theme-base → BI → cds-overrides) — tous fichiers OK, ordre BLOC E respecté.
- **Chaîne JS** :
  - Pages shell (9) : toutes conformes (chaîne shell standard 6 scripts).
  - Pages publiques (3) : conformes pour leur usage (pas de bdb-shell, scripts adaptés à la page).
  - recherche.html : OK avec 9 scripts (chaîne shell + bdb-pwa + bdb-search + recherche-app).
- **Structure DOM** :
  - Pages shell (9) : toutes conformes (#wrapper → #bdb-shell → #wrapper_content → main#middle).
  - Pages publiques (3) : structures standalone cohérentes.
- **data-root-path** :
  - Pages shell (9) : toutes à `"../"` (correct profondeur 1).
  - Pages publiques (3) : absent (cohérent — pas de bdb-shell).
- **Balise GF-2** : 12/13 conformes (sondage.html : `Auth: none` au lieu de `aucune`).
- **Migration S#108** : zéro régression — toutes les transformations Phase 4 ont été correctement appliquées (data-root-path, css/, js/, liens vers index.html / login.html / site/ / modules/).

### Notes complémentaires

1. **`recherche-app.js` co-localisé** : volontairement référencé sans préfixe `../` (`<script src="recherche-app.js">`) — exception documentée dans la spec S#108. Le fichier existe dans `app/` à côté de `recherche.html`. Conforme.
2. **Pas de chemins absolus `/bdb/`** dans `app/` : les pages utilisent toutes des chemins relatifs `../` post-migration. Cohérent.
3. **Anomalie pré-S108 isolée** : `sondage.html` L246 — le nom de fichier `icon-192x192.png` n'a probablement jamais existé (le naming standard est `icon-192.png`, présent). Erreur silencieuse via `onerror` → photo d'Isabelle invisible. À corriger pour l'expérience visiteur du sondage IBODE.
4. **`sondage.html` initialise son propre client Supabase** (L470-474) à partir de `SUPABASE_URL`/`SUPABASE_ANON_KEY` issus de `config.js` — exception explicite à `INTERDIT-A3` (page beta-testeur autonome, mode anon strict). Le code commente : `'[DBM] config.js absent ou incomplet — mode démo, envoi désactivé.'` — fail gracefully en local. Toléré pour ce cas spécifique de landing publique.

### Recommandations prioritaires

1. **CORRIGER** `sondage.html` L246 : chemin asset (`../assets/icons/...`) + nom de fichier réel (`icon-192.png`).
2. **CORRIGER** `sondage.html` L2 : `Auth: none` → `Auth: aucune`.
3. **CONSIDÉRER** externaliser le bloc `<style>` inline volumineux de `sondage.html` dans `css/sondage-ui.css` pour cohérence INTERDIT-C2 (mais toléré pour landing publique avec design isolé).
