# S#108 — Audit micro pages racine BDB

## Date : 2026-04-26
## Périmètre : 14 fichiers HTML à la racine de `C:\DEV\BIBLE_DE_BLOC\`
## Méthode : lecture intégrale + vérification existence des liens relatifs (Test-Path)
## Standards : chaîne CSS BLOC E (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides) ; chaîne JS shell (bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell) ; structure DOM (#wrapper → #bdb-shell → #wrapper_content → main#middle) ; balise GF-2 (`<!-- BDB | Surface: ... | Auth: ... | Shell: ... -->`)

> **Note importante post-S108** : depuis la migration arborescence S#108, les chemins `atelier/`, `conseil/`, `bernard/`, `back-office/`, `aide.html`, `archivage.html`, `changelog.html`, `contact.html`, `export.html`, `impressions.html`, `notifications.html`, `onboarding.html`, `parametres.html`, `recherche.html`, `sondage.html`, `saisie-invite.html`, `suppression-compte.html` ne sont PLUS à la racine. Le `.htaccess` Section 9 absorbe via redirections 301 — mais **en dev local (python http.server), ces liens sont cassés**.

---

## 1. _TEMPLATE_PORTAIL_V5_0_1.html

**Rôle** : Squelette de référence pour la page portail post-authentification (modèle de `index.html`).
**Audience** : développeur — référence
**Utilise bdb-shell** : oui (déclaré dans GF-2, body vide à compléter)
**Template V5 utilisé** : auto-déclaré PORTAIL

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a
- Anomalies : aucune

**Chaîne JS** :
- aucun script — body vide (skeleton documentation)
- Anomalies : aucune (squelette intentionnel, JS à générer en session dédiée)

**Structure DOM** :
- body vide (skeleton — `<!-- SKELETON — structure et contenu a generer en session dediee -->`)
- Anomalies : aucune (intentionnel)

**Liens sortants** (relatifs) :
- `./css/cds-overrides.css` → EXISTE

**Liens retour portail** :
- index.html : absent (squelette)
- login.html : absent (squelette)

**data-root-path** : absent (squelette) — N/A

**Balise GF-2** : `<!-- BDB | Surface: APP-RACINE | Auth: isMember | Shell: backoffice -->` → CONFORME

**Verdict** : CONFORME (squelette de référence)

---

## 2. _TEMPLATE_RACINE_V5_0_1.html

**Rôle** : Template de référence pour les pages racine app authentifiées avec bdb-shell.
**Audience** : développeur — référence
**Utilise bdb-shell** : oui (template avec `#bdb-shell`)
**Template V5 utilisé** : auto-déclaré RACINE (nommage du fichier)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a (placeholder commenté L18)
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L6, en HEAD)
- [x] bootstrap.bundle
- [x] supabase-js@2
- [x] supabase-client
- [x] bdb-ui
- [x] bdb-invite-guard
- [x] bdb-shell
- [ ] JS module : placeholder commenté L102
- Anomalies : aucune

**Structure DOM** :
- [x] #wrapper → #bdb-shell → #wrapper_content → main#middle ✓
- Anomalies : duplication d'attribut `id` sur `<main id="middle" id="[page]App">` (L45) — INVALIDE HTML5

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `js/supabase-client.js`, `js/bdb-ui.js`, `js/bdb-invite-guard.js`, `js/bdb-shell.js` → tous EXISTENT

**Liens retour portail** : absent (template)

**data-root-path** : `"./"` (L37) → CORRECT pour profondeur 0

**Balise GF-2** : **ABSENTE** → NON-CONFORME (le template n'a aucun commentaire `<!-- BDB | Surface ... -->` en tête de DOCTYPE)

**Verdict** : 3 violations à corriger
**Violations** :
1. **GF-2 absente** — aucune balise de surface en tête (pages référencées dans le template doivent l'avoir).
2. **id dupliqué** — L45 `<main id="middle" id="[page]App">` (deux `id` sur le même élément, invalide HTML).
3. **Doc obsolète post-S108** — les commentaires L24, L120-129 listent `aide.html`, `onboarding.html`, etc. à la racine, alors que ces pages ont été migrées vers `app/` lors de la session #108.

---

## 3. 403.html

**Rôle** : Page d'erreur 403 (Forbidden) servie par .htaccess.
**Audience** : tout le monde / robot
**Utilise bdb-shell** : non
**Template V5 utilisé** : RACINE (structure proche)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD) — utilité discutable sur page erreur statique
- [x] bootstrap.bundle (L69)
- [ ] supabase-js / supabase-client / bdb-shell : non (page statique sans auth)
- Anomalies : `bdb-pwa.js` chargé sans utilité fonctionnelle (non bloquant).

**Structure DOM** :
- [x] #wrapper → #wrapper_content → main#middle (sans #bdb-shell, cohérent avec "Shell: non")
- Anomalies : aucune

**Liens sortants** (relatifs et absolus internes) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `/bdb/index.html` (L28, L46) → EXISTE
- `/bdb/site/index.html` (L49) → EXISTE

**Liens retour portail** :
- index.html : `/bdb/index.html` → FONCTIONNE
- login.html : absent

**data-root-path** : ABSENT — N/A (page sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : CONFORME (anomalie mineure : bdb-pwa.js inutile sur page erreur, non bloquant)

---

## 4. 404.html

**Rôle** : Page d'erreur 404 (Not Found) avec plan de site adaptatif et tracking.
**Audience** : tout le monde (anonyme + membre + admin selon session)
**Utilise bdb-shell** : non (mais affiche éléments dynamiques selon session via Supabase)
**Template V5 utilisé** : RACINE (structure proche)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a (style inline pour `.e404-url-display`, `.e404-tracking`)
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L125)
- [x] supabase-js@2 (L126)
- [x] supabase-client (`/bdb/js/supabase-client.js`, L127, absolu OVH)
- [ ] bdb-ui / bdb-invite-guard / bdb-shell : non (cohérent : page erreur, pas d'auth obligatoire)
- Anomalies : aucune

**Structure DOM** :
- [x] #wrapper → header → #wrapper_content → main#middle
- Anomalies : pas de `#bdb-shell` (cohérent : Shell: non)

**Liens sortants** (relatifs et absolus internes) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `/bdb/index.html` (L32, L54, L151) → EXISTE
- `/bdb/site/index.html` (L77) → EXISTE
- `/bdb/site/fonctionnalites.html` (L78) → EXISTE
- `/bdb/site/faq.html` (L79) → EXISTE
- `/bdb/site/glossaire.html` (L80) → EXISTE
- `/bdb/login.html` (L81, L170) → EXISTE
- `/bdb/modules/admin/index.html` (L99, L166) → EXISTE
- **`/bdb/atelier/memo.html` (L100)** → CASSÉ (post-S108 : déplacé vers `/bdb/createur/atelier/memo.html` ; la 301 du .htaccess absorbe en prod, mais le lien direct devrait être mis à jour)
- `/bdb/modules/{planning,annuaire,fiches,transmissions,arsenal,preferences,cours,anatomie,installation,disc}/index.html` (L157-167) → tous EXISTENT
- JS dynamique : `/bdb/${m.path}` (L206, L222) — chemins venant de `app_modules.path`, valides

**Liens retour portail** :
- index.html : `/bdb/index.html` → FONCTIONNE
- login.html : `/bdb/login.html` → FONCTIONNE

**data-root-path** : ABSENT — N/A (sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 1 violation à corriger
**Violations** :
1. **L100** — `/bdb/atelier/memo.html` non migré vers `/bdb/createur/atelier/memo.html` post-S108 (cassé en dev local, redirect 301 en prod).

---

## 5. index.html

**Rôle** : Portail d'accueil après authentification — tableau de bord, modules, stats live, section admin.
**Audience** : membre authentifié (bascule selon rôle : admin / créateur / démo / preview)
**Utilise bdb-shell** : non (gère sa propre auth via `bdbRequireAuth()`, header custom)
**Template V5 utilisé** : PORTAIL (instance réelle du squelette _TEMPLATE_PORTAIL)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [x] CSS module : `css/index-ui.css` → EXISTE
- Anomalies : aucune (commentaire L16 indique "5." mais c'est numérotation cosmétique)

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L173)
- [x] supabase-js@2 (L174)
- [x] supabase-client (L175)
- [ ] bdb-ui : non chargé (utilise sa logique propre)
- [x] bdb-invite-guard (L176)
- [ ] bdb-shell : non (cohérent : "Shell: non" — portail gère son propre header)
- [x] bdb-signalement (L177), bdb-preview (L178)
- Anomalies : aucune

**Structure DOM** :
- header.bdb-header → section.bdb-hero → div.bdb-content → footer.bdb-footer (structure portail custom)
- Anomalies : pas de `#bdb-shell` (cohérent avec Shell: non du portail)

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `css/index-ui.css` → EXISTE
- `assets/icons/icon-180.png` (L21) → À VÉRIFIER MANUELLEMENT
- `index.html` (L32, logo) → EXISTE (auto-référence)
- `modules/profile/index.html` (L62) → EXISTE
- **`atelier/memo.html` (L66)** → CASSÉ (post-S108 : doit être `createur/atelier/memo.html`)
- **`conseil/index.html` (L69)** → CASSÉ (post-S108 : doit être `createur/conseil/index.html`)
- `login.html` (L535, L539, JS) → EXISTE
- JS dynamique : `m.path` venant de `app_modules` → chemins relatifs `modules/[key]/index.html` (vérifié contre la base au S108 : tous valides)

**Liens retour portail** :
- index.html : `index.html` (auto-référence logo) → FONCTIONNE
- login.html : `login.html` (JS post-logout) → FONCTIONNE

**data-root-path** : ABSENT — N/A (sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: APP-RACINE | Auth: login/portail | Shell: non -->` → CONFORME

**Verdict** : 2 violations à corriger
**Violations** :
1. **L66** — `href="atelier/memo.html"` doit être `createur/atelier/memo.html` post-S108 (lien créateur dans dropdown user — cassé en local, 301 en prod).
2. **L69** — `href="conseil/index.html"` doit être `createur/conseil/index.html` post-S108 (idem).

---

## 6. login.html

**Rôle** : Page d'authentification (connexion email/password + Google OAuth + inscription + reset password).
**Audience** : tout le monde (publique, point d'entrée auth)
**Utilise bdb-shell** : non (gère sa propre interface)
**Template V5 utilisé** : aucun (page auth standalone)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [x] CSS module : `css/login-ui.css` → EXISTE
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L178)
- [x] supabase-js@2 (L179)
- [x] supabase-client (L180)
- [ ] bdb-ui / bdb-invite-guard / bdb-shell : non (cohérent : auth standalone)
- [x] bdb-demo (L181), bdb-password-policy (L182), bdb-fonctions (L183)
- Anomalies : aucune

**Structure DOM** :
- div.card.login-card → card-body avec onglets (login / forgot / register) — structure standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `css/login-ui.css` → EXISTE
- `js/supabase-client.js`, `js/bdb-demo.js`, `js/bdb-password-policy.js`, `js/bdb-fonctions.js` → tous EXISTENT
- JS — redirections : `index.html` (L195, L199, L201, L444, L504), `pending.html` (L352), `reset-password.html` (L299, L340), `unauthorized.html` (L458, L461) → tous EXISTENT

**Liens retour portail** :
- index.html : `index.html` (JS post-login) → FONCTIONNE
- login.html : auto (page courante)

**data-root-path** : ABSENT — N/A (sans bdb-shell)

**Balise GF-2** : `<!-- BDB | Surface: APP-RACINE | Auth: login/portail | Shell: non -->` → CONFORME

**Verdict** : CONFORME

---

## 7. maintenance.html

**Rôle** : Page affichée pendant une maintenance planifiée — standalone, fonctionnelle sans réseau.
**Audience** : tout le monde
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page erreur minimaliste)

**Chaîne CSS** :
- [x] BS 5.3.3 (L23)
- [x] BI 1.11.1 (L24) — **AVANT theme-base : ordre incorrect**
- [x] theme-base @63905396 (L25)
- [x] cds-overrides (L26)
- [ ] CSS module : n/a
- Anomalies : **ordre BS → BI → theme-base au lieu de BS → theme-base → BI** (anomalie cosmétique : BI et theme-base sont indépendants ; pas d'effet visible mais non conforme à la chaîne BLOC E standard).

**Chaîne JS** :
- [x] bootstrap.bundle (L74)
- [ ] aucun autre (page standalone sans Supabase)
- Anomalies : aucune

**Structure DOM** :
- div.maintenance-card simple — structure standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `./css/cds-overrides.css` → EXISTE

**Liens retour portail** :
- index.html : absent (volontaire — bouton "Réessayer" reload)
- login.html : absent

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 1 anomalie cosmétique
**Violations** :
1. **L24-25** — Bootstrap Icons chargé avant theme-base.css (ordre BLOC E recommande BS → theme-base → BI). Anomalie cosmétique sans impact runtime.

---

## 8. mentions-legales.html

**Rôle** : Mentions légales — page publique stable (obligation LCEN + Play Store).
**Audience** : tout le monde
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page légale standalone)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a (style inline)
- Anomalies : aucune

**Chaîne JS** :
- [x] bootstrap.bundle (L139)
- [ ] aucun autre
- Anomalies : aucune

**Structure DOM** :
- div.legal-header → div.legal-body avec sections — structure légale standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `./css/cds-overrides.css` → EXISTE
- `politique-confidentialite.html` (L89, L133) → EXISTE
- **`suppression-compte.html` (L91, L134)** → CASSÉ (post-S108 : déplacé vers `app/suppression-compte.html` ; redirect 301 en prod, cassé en local)

**Liens retour portail** :
- index.html : absent (page légale)
- login.html : absent

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 2 violations à corriger
**Violations** :
1. **L91** — `href="suppression-compte.html"` doit être `app/suppression-compte.html` post-S108.
2. **L134** — `href="suppression-compte.html"` doit être `app/suppression-compte.html` post-S108.

---

## 9. offline.html

**Rôle** : Page affichée hors connexion (PWA service worker fallback).
**Audience** : tout le monde
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page erreur PWA)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L44)
- [ ] aucun autre
- Anomalies : aucune

**Structure DOM** :
- div.offline-wrap → container.offline-card — structure standalone
- Anomalies : aucune

**Liens sortants** (relatifs et absolus internes) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `/bdb/index.html` (L36) → EXISTE

**Liens retour portail** :
- index.html : `/bdb/index.html` → FONCTIONNE
- login.html : absent

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : CONFORME

---

## 10. pending.html

**Rôle** : Page d'attente après inscription — affiche le statut de validation admin.
**Audience** : utilisateur inscrit non-approuvé
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (réutilise login-ui.css pour cohérence visuelle)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [x] CSS module : `css/login-ui.css` → EXISTE
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L144)
- [x] supabase-js@2 (L145)
- [x] supabase-client (L146)
- [x] bdb-invite-guard (L147)
- [ ] bdb-ui / bdb-shell : non (cohérent : page d'attente standalone)
- Anomalies : aucune

**Structure DOM** :
- div.card.login-card → card-body avec stepper pending — structure standalone
- Anomalies : style block (L89-142) après le card body — devrait idéalement être dans login-ui.css mais tolérable.

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- `css/login-ui.css` → EXISTE
- `js/supabase-client.js`, `js/bdb-invite-guard.js` → tous EXISTENT
- JS — redirections : `login.html` (L154, L208), `index.html` (L190) → tous EXISTENT

**Liens retour portail** :
- index.html : `index.html` (JS post-approval) → FONCTIONNE
- login.html : `login.html` (JS post-logout) → FONCTIONNE

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune` (français) — incohérence avec les autres pages SYSTEME (403, 404, maintenance, offline, session-expiree, unauthorized utilisent toutes `Auth: aucune`).

**Verdict** : 1 violation à corriger
**Violations** :
1. **L2** — Balise GF-2 utilise `Auth: none` (anglais) au lieu de `Auth: aucune` (français). Incohérent avec les 6 autres pages SYSTEME.

---

## 11. politique-confidentialite.html

**Rôle** : Politique de confidentialité — page légale publique RGPD (obligation Play Store).
**Audience** : tout le monde
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page légale standalone, copie structurelle de mentions-legales.html)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a (style inline)
- Anomalies : aucune

**Chaîne JS** :
- [x] bootstrap.bundle (L221)
- [ ] aucun autre
- Anomalies : aucune

**Structure DOM** :
- div.legal-header → div.legal-body avec TOC + 8 sections — structure légale standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `./css/cds-overrides.css` → EXISTE
- **`suppression-compte.html` (L193, L216)** → CASSÉ (post-S108 : déplacé vers `app/suppression-compte.html`)
- `mentions-legales.html` (L215) → EXISTE
- Liens TOC ancres `#responsable`, `#donnees`, etc. → internes OK

**Liens retour portail** :
- index.html : absent (page légale)
- login.html : absent

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 2 violations à corriger
**Violations** :
1. **L193** — `href="suppression-compte.html"` doit être `app/suppression-compte.html` post-S108.
2. **L216** — `href="suppression-compte.html"` doit être `app/suppression-compte.html` post-S108.

---

## 12. reset-password.html

**Rôle** : Page de définition d'un nouveau mot de passe (post-reset email Supabase).
**Audience** : utilisateur avec token de recovery
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (réutilise login-ui.css)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [x] CSS module : `css/login-ui.css` → EXISTE
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD)
- [x] bootstrap.bundle (L84)
- [x] supabase-js@2 (L85)
- [x] supabase-client (L86)
- [x] bdb-password-policy (L87)
- [ ] bdb-ui / bdb-invite-guard / bdb-shell : non (cohérent : standalone post-reset)
- Anomalies : aucune

**Structure DOM** :
- div.card.login-card → card-body avec panelForm + panelTokenError — structure standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js`, `./css/cds-overrides.css`, `css/login-ui.css` → tous EXISTENT
- `js/supabase-client.js`, `js/bdb-password-policy.js` → tous EXISTENT
- `login.html` (L69, L75) → EXISTE
- JS — redirection : `index.html` (L198) → EXISTE

**Liens retour portail** :
- index.html : `index.html` (JS post-update) → FONCTIONNE
- login.html : `login.html` (boutons retour) → FONCTIONNE

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: APP-RACINE | Auth: login/portail | Shell: non -->` → CONFORME

**Verdict** : CONFORME

---

## 13. session-expiree.html

**Rôle** : Page affichée après auto-logout inactivité (30 min, R3-AUTH-03).
**Audience** : utilisateur dont la session vient d'expirer
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page erreur minimaliste)

**Chaîne CSS** :
- [x] BS 5.3.3 (L23)
- [x] BI 1.11.1 (L24) — **AVANT theme-base : ordre incorrect**
- [x] theme-base @63905396 (L25)
- [x] cds-overrides (L26)
- [ ] CSS module : n/a
- Anomalies : **ordre BS → BI → theme-base** (idem maintenance.html, anomalie cosmétique sans impact runtime).

**Chaîne JS** :
- [x] bootstrap.bundle (L70)
- [ ] aucun autre (page standalone)
- Anomalies : aucune

**Structure DOM** :
- div.expired-card simple — structure standalone
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `./css/cds-overrides.css` → EXISTE
- `login.html` (L59) → EXISTE
- `index.html` (L65) → EXISTE
- JS — redirection conditionnelle : `login.html?redirect=...` (L79) → FONCTIONNE

**Liens retour portail** :
- index.html : `index.html` (lien "revenir au portail") → FONCTIONNE
- login.html : `login.html` (bouton "Se reconnecter") → FONCTIONNE

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 1 anomalie cosmétique
**Violations** :
1. **L24-25** — Bootstrap Icons chargé avant theme-base.css (idem maintenance.html). Sans impact runtime.

---

## 14. unauthorized.html

**Rôle** : Page d'éjection après tentative OAuth Google non autorisée (intrus / email non lié).
**Audience** : utilisateur OAuth refusé
**Utilise bdb-shell** : non
**Template V5 utilisé** : aucun (page erreur standalone)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [ ] CSS module : n/a (style inline)
- Anomalies : aucune

**Chaîne JS** :
- [x] bdb-pwa.js (L7, HEAD) — utilité discutable sur page erreur
- [ ] bootstrap.bundle : ABSENT (composants Bootstrap non utilisés activement, mais théoriquement requis pour cohérence)
- [ ] aucun autre (script inline minimal pour basculer le contenu selon `?reason=`)
- Anomalies : `bdb-pwa.js` chargé sans utilité fonctionnelle ; bootstrap.bundle absent (sans impact car aucun composant interactif).

**Structure DOM** :
- div.card.unauth-card simple — structure standalone, contenu peuplé par JS selon `?reason=`
- Anomalies : aucune

**Liens sortants** (relatifs) :
- `js/bdb-pwa.js` → EXISTE
- `./css/cds-overrides.css` → EXISTE
- JS — redirections via `state.btnHref` :
  - `site/index.html` (L71) → EXISTE
  - `login.html` (L79) → EXISTE

**Liens retour portail** :
- index.html : absent (volontaire — éjection)
- login.html : `login.html` (cas `email-non-lie`) → FONCTIONNE

**data-root-path** : ABSENT — N/A

**Balise GF-2** : `<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->` → CONFORME

**Verdict** : 1 anomalie mineure
**Violations** :
1. **L7** — `<script src="js/bdb-pwa.js">` chargé sur une page erreur d'éjection — inutile, à retirer pour cohérence (autres pages erreur le chargent aussi : à uniformiser dans une session dédiée).

---

## Récapitulatif

| Page | Rôle (court) | Shell | V5 | Liens (ok/total) | GF-2 | Verdict |
|---|---|---|---|---|---|---|
| _TEMPLATE_PORTAIL_V5_0_1.html | Squelette portail | oui | PORTAIL | 1/1 | OK | CONFORME |
| _TEMPLATE_RACINE_V5_0_1.html | Template racine | oui | RACINE (auto) | 5/5 | **ABSENTE** | 3 violations |
| 403.html | Erreur Forbidden | non | (proche RACINE) | 4/4 | OK | CONFORME |
| 404.html | Erreur Not Found + plan | non | (proche RACINE) | 19/20 | OK | 1 violation |
| index.html | Portail tableau de bord | non | PORTAIL | 8/10 | OK | 2 violations |
| login.html | Authentification | non | aucun | 13/13 | OK | CONFORME |
| maintenance.html | Maintenance planifiée | non | aucun | 1/1 | OK | 1 anomalie cosmétique |
| mentions-legales.html | Mentions légales LCEN | non | aucun | 3/5 | OK | 2 violations |
| offline.html | PWA offline | non | aucun | 3/3 | OK | CONFORME |
| pending.html | Attente validation | non | aucun | 7/7 | **`Auth: none`** | 1 violation |
| politique-confidentialite.html | RGPD | non | aucun | 2/4 | OK | 2 violations |
| reset-password.html | Reset password | non | aucun | 8/8 | OK | CONFORME |
| session-expiree.html | Auto-logout 30min | non | aucun | 3/3 | OK | 1 anomalie cosmétique |
| unauthorized.html | Éjection OAuth | non | aucun | 4/4 | OK | 1 anomalie mineure |

### Statistiques finales

- **Total pages auditées** : 14
- **Pages CONFORMES** : 5 (_TEMPLATE_PORTAIL, 403, login, offline, reset-password)
- **Pages avec violations** : 9
  - **Critiques (liens cassés post-S108)** : 4 — index.html (×2), 404.html (×1), mentions-legales.html (×2), politique-confidentialite.html (×2)
  - **Anomalies cosmétiques (ordre CSS)** : 2 — maintenance.html, session-expiree.html
  - **Anomalies GF-2 / structure** : 3 — _TEMPLATE_RACINE (GF-2 absente + id dupliqué + doc obsolète), pending.html (`Auth: none`), unauthorized.html (bdb-pwa inutile)
- **Liens cassés totaux** : 7 occurrences — toutes liées à la migration S#108 (3 vers `atelier/conseil/`, 4 vers `suppression-compte.html`)

### Anomalies CSS récurrentes
- **2 fichiers** : ordre BLOC E non-conforme — Bootstrap Icons chargé avant theme-base.css (maintenance.html L24-25, session-expiree.html L24-25). Sans impact runtime.

### Anomalies JS récurrentes
- **bdb-pwa.js chargé en HEAD sur les pages erreur statiques** (403.html, 404.html, offline.html, pending.html, reset-password.html, unauthorized.html) — utilité discutable sur les pages d'erreur sans interaction PWA. À uniformiser : soit toutes le chargent (cohérence PWA pour cache offline), soit aucune.

### Liens cassés post-S108 — détail consolidé

| Page | Ligne | Lien actuel | Lien correct post-S108 |
|---|---|---|---|
| index.html | L66 | `atelier/memo.html` | `createur/atelier/memo.html` |
| index.html | L69 | `conseil/index.html` | `createur/conseil/index.html` |
| 404.html | L100 | `/bdb/atelier/memo.html` | `/bdb/createur/atelier/memo.html` |
| mentions-legales.html | L91 | `suppression-compte.html` | `app/suppression-compte.html` |
| mentions-legales.html | L134 | `suppression-compte.html` | `app/suppression-compte.html` |
| politique-confidentialite.html | L193 | `suppression-compte.html` | `app/suppression-compte.html` |
| politique-confidentialite.html | L216 | `suppression-compte.html` | `app/suppression-compte.html` |

> Tous ces liens fonctionnent en production OVH grâce aux redirections 301 du `.htaccess` Section 9 — mais sont **cassés en développement local** (python http.server) et constituent une dette technique : les liens devraient pointer directement vers les nouveaux chemins pour éviter une chaîne de redirections inutile et des erreurs en dev.

### Recommandations prioritaires

1. **CORRIGER** les 7 liens cassés post-S108 (édition simple de 4 fichiers : index.html, 404.html, mentions-legales.html, politique-confidentialite.html).
2. **CORRIGER** la balise GF-2 de pending.html (`Auth: none` → `Auth: aucune`).
3. **AJOUTER** la balise GF-2 dans `_TEMPLATE_RACINE_V5_0_1.html` et **CORRIGER** l'`id` dupliqué L45.
4. **METTRE À JOUR** la documentation obsolète dans `_TEMPLATE_RACINE_V5_0_1.html` (commentaires L24, L120-129) pour refléter la migration S#108 (pages dans `app/`).
5. **DÉCIDER** de la politique `bdb-pwa.js` sur pages erreur (uniformiser : tout ou rien).
6. **NORMALISER** l'ordre de la chaîne CSS dans maintenance.html et session-expiree.html (BS → theme-base → BI au lieu de BS → BI → theme-base).
