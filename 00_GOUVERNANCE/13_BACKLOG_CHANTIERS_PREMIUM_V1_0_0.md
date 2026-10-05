# 13 — BACKLOG CHANTIERS PREMIUM DBM V1.0.0

**Statut** : Operatoire
**Date** : 2026-05-07 (session #115)
**Source** : Brainstorming session #115 sur Charte d'app DBM v3 (Claude Design)
**Prerequis** : 12_CHARTE_PREMIUM_DBM_V1_0_0.md (doctrine adoptee), S126 execute en cloud
**Portee** : items differes / a etudier ulterieurement / FAB(3R) requis

---

## 0. STATUT POST-S115

**Adopte session #115** (cloud + fichiers) :
- 1 decision (D-2026-05-07-S115-CHARTE-PREMIUM)
- 4 principes : INTERDIT-HOVER-BRIGHTNESS-A15, INTERDIT-CTA-PRIMARY-MODULE-A11, CONV-SURFACE-MARKER-HTML, GARDE-FOU-RFC2119-DOCTRINE
- 1 doctrine MD : 12_CHARTE_PREMIUM_DBM_V1_0_0.md (RFC 2119, A1-A15, R-1 a R-10)
- 2 fichiers techniques : `css/dbm-premium-components.css`, `js/bdb-zone-state.js`
- 1 migration : `migrations/S126_charte_premium_v1.sql`

**Reste 4 chantiers majeurs + 3 secondaires** documentes ici.

---

## 1. CHANTIERS MAJEURS — FAB(3R) REQUIS

### 1.1 — Renommage `bdb-*.js` -> `dbm-*.js` (8 fichiers + 25 modules)

**Effort estime** : 16-24h
**Quand** : avant 1ere vente d instance externe
**Risque** : moyen — casse cache navigateurs, FTP delta, eventuels integrateurs externes

**Perimetre** :
- 8 fichiers JS racine : `bdb-shell.js`, `bdb-ui.js`, `bdb-invite-guard.js`, `bdb-search.js`, `bdb-toast.js`, `bdb-preview.js`, `bdb-pwa.js`, `bdb-media.js`, `bdb-zone-state.js`, `bdb-fonctions.js`, `bdb-glossaire-tooltip.js`, etc. (12 au total).
- Refs dans 25 modules `index.html` + cards `app-cards` + skills.
- Helpers exposes : `bdbToast`, `bdbShellReady`, `bdbUser`, `bdbZoneState` -> `dbmToast`, `dbmShellReady`, `dbmUser`, `dbmZoneState`.

**FAB(3R) a faire** :
- R1 : bdb-* prefix conserve depuis V1, marque "Bible de Bloc" remplacee par "Des Blocs & Moi" en session #113 mais fichiers techniques pas encore migres.
- F : nommage aligne sur la marque DB&M, coherence externe pour les acheteurs d instance.
- A : vs status quo : (1) coherence marketing-tech, (2) nettoyage dette terminologique, (3) skill-creator + cds-compliance peuvent grep par prefix `dbm-`.
- B : aucun fichier "BDB" ne remonte dans un audit visiteur d instance. Terminologie unifiee.
- R2 : casse FTP delta (tous les fichiers a republier), casse cache navigateur (force refresh utilisateurs), risque oublier une ref dans un ancien module.
- R3 : a faire en session dediee avec script PowerShell + audit grep exhaustif post-migration.
- Recommandation : Strategie 2 etapes : (1) creer alias `window.dbm = window.bdb` cote JS, dupliquer fichiers `dbm-*.js` qui sourcent les `bdb-*.js`, (2) migrer modules un par un, (3) supprimer `bdb-*.js` quand 0 reference restante.

**Cle de tracking** : `D-2026-XX-XX-S116-RENAME-BDB-DBM` (a creer en ouverture session dediee).

---

### 1.2 — Migration `theme-base.css` CDN figé -> `dbm-theme.css` local

**Effort estime** : 8-12h
**Quand** : si commit `@63905396` devient inaccessible (mort GitHub) OU si on veut autonomie complete
**Risque** : faible — fichier statique, pas de logique

**Perimetre** :
- Telecharger `theme-base.css` du commit `menywise/BDB@63905396`.
- Renommer en `css/dbm-theme.css` (local).
- Modifier la chaine BLOC E : remplacer le link CDN par `<link href="../../css/dbm-theme.css">`.
- Conserver eventuellement le commit comme fallback documente.

**FAB(3R) a faire** :
- R1 : V5 depend d un CDN GitHub (jsdelivr.net/gh/menywise/BDB@63905396) hors notre controle. Si menywise supprime le repo ou le commit, l app casse.
- F : telecharger une fois, heberger en local, rendre l app autonome en CSS.
- A : vs CDN : (1) zero dependance externe pour fonctionner offline, (2) versioning interne, (3) modifications possibles sans pousser sur menywise/BDB.
- B : robustesse production. L app continue de tourner meme si GitHub est en panne.
- R2 : perte du cache CDN partage (negligeable car cache navigateur local de toute facon).
- R3 : a faire en session dediee, 1 fichier a deplacer + 25 chaines BLOC E a corriger.
- Recommandation : prioritaire si commit @63905396 montre signe de fragilite. Sinon non urgent, faire en meme temps que 1.1.

**Cle de tracking** : `D-2026-XX-XX-SXXX-MIGRATE-THEME-LOCAL` (a creer).

---

### 1.3 — Adoption palette HSL 28 modules (Strategie B charte premium)

**Effort estime** : 12-16h
**Quand** : decision admin instance Chenieux/La Marche
**Risque** : eleve — casse identite visuelle existante par groupe

**Perimetre** :
- Remplacer `app_groups.color` (5 valeurs) par `app_modules.color_pastel/strong/text` (28 valeurs).
- Migrer DDL : ajouter 3 colonnes a `app_modules` ou table `app_module_palette` dediee.
- Source : `_claude_design/Charte graphique v6.zip` -> `dbm/css/dbm-palette-v3.json` (28 entrees validees AAA/AA).
- Mettre a jour `dbm-module-color.css` pour resoudre `--module-color*` depuis `app_modules.color_*` au lieu de `app_groups.color`.
- Audit visuel : capture avant/apres sur les 25 modules.

**FAB(3R) a faire** :
- R1 : V5 utilise 5 couleurs groupes (D-2026-05-05-S117). Charte v3 Claude Design propose 28 couleurs modules avec HSL regulier (hue espace ~12,9 deg). Differenciation visuelle module-par-module vs groupe-par-groupe.
- F : 28 modules ont chacun leur signature couleur unique vs 5 groupes ou 5-6 modules partagent la meme couleur.
- A : vs 5-groupes : (1) chaque module est immediatement reconnaissable a sa couleur, (2) palette mathematiquement validee AAA/AA, (3) extensibilite preparee (reserve-1, reserve-2). Vs 5-groupes : (1) plus de complexite a maintenir, (2) impossible de "changer la couleur du groupe bloc" globalement, (3) risque de fatigue visuelle si trop de teintes proches.
- B : (a) UX premium, l utilisateur sait dans quel module il est sans lire le titre. (b) Branding fort par module pour les fonctionnalites cles. (c) Fallback Strategie A possible si l admin instance prefere.
- R2 : (a) 25 modules a remigrate visuellement, (b) le sens "groupe" disparait de l UI (un groupe = 5 couleurs differentes, pas une), (c) si l admin instance n a pas le gout du detail, peut creer du desordre visuel.
- R3 : a faire si demande explicite (ex : Chenieux veut une "palette riche") OU dans la perspective de la vente d une instance qui veut se demarquer de l identite Chenieux.
- Recommandation : reste Strategie A par defaut V5. Strategie B documentee charte premium R-10.1, activable par admin instance via parametrage_modules section "palette".

**Cle de tracking** : `D-2026-XX-XX-SXXX-PALETTE-HSL-28` (a creer si demande).

---

### 1.4 — Audit retroactif 25 modules contre Charte Premium v1

**Effort estime** : 8h (audit) + 24h (corrections cumulees)
**Quand** : session de toilettage UX globale
**Risque** : faible — corrections cosmetiques, par lot

**Perimetre** :
- Audit automatise via skill `accessibility-audit-bdb` + `cds-compliance` enrichi A1-A15.
- Pour chaque module : ajouter surface marker, valider btn-universe sur CTA principal, ajouter modal-header-module sur modales metier, supprimer eventual filter:brightness, valider 4 etats async, ajouter aria-busy/role.
- Audit Claude Design deja fait sur 27 modules : 17/27 alignes, 10/27 a corriger ou migrer (cf. `_claude_design/dbm/audit-conformite.html`).
- Top violations actuelles : R-6.1 zones data-zone (13 modules), R-4.2 inline color/font (11 modules dont thesaurus 30 inline), R-4.1 h1 (11 modules), R-6.7 etats async (10 modules), A3 emoji (6 modules).

**FAB(3R) a faire** :
- R1 : V5 a 25 modules dont 13 sans `data-zone`, 11 avec inline styles, 6 avec emojis. Etat constate par audit Claude Design octobre 2026.
- F : pour chaque module : checklist charte premium §11 + grep INTERDIT-* + correction par lot.
- A : vs status quo : (1) coherence visuelle 25 modules, (2) catalogue A1-A15 actionnable en revue, (3) revue PR plus rapide grace au marker surface.
- B : qualite percue homogene sur toute l app. L utilisateur ne percoit plus de "vieux modules" vs "nouveaux modules".
- R2 : si audit non fait, derive lente — chaque nouveau module suit le pattern, mais les anciens restent "moisi". Erosion de la qualite premium.
- R3 : faire en 2 etapes : (1) audit automatise + rapport (4-8h), (2) corrections par lots de 5 modules par session (~5h par lot).
- Recommandation : prioriser 5 modules les plus visites en production (glossaire, fiches, transmissions, planning, arsenal selon stats reelles).

**Cle de tracking** : `D-2026-XX-XX-SXXX-AUDIT-RETRO-25` (a creer en ouverture session dediee).

---

## 2. CHANTIERS SECONDAIRES — A ETUDIER

### 2.1 — Slugs Claude Design hors doctrine V5

**Constat** : Charte v3 liste les slugs `medacta`, `boite-a-idees`, `interview`, `ged`, `faq`, `profile`, `pedagogie`, `recueil-situation`, `supervision`. Pas tous alignes CLAUDE.md V2.2.

**Conflits** :
- `medacta` : nom commercial laboratoire prothese. Conflit doctrine (pas de marque dans surface utilisateur). **Refuse session #115**.
- `supervision` : conflit doctrine philosophie-participative-bdb (pas de surveillance). **A clarifier**.
- `interview` : V5 utilise `paxis` (cf. CLAUDE.md V2.2 §5 STB-07). Probable confusion Claude Design.
- `boite-a-idees` : pas dans les 25 modules V5. Module a creer ou a renommer.

**Action** : prochain audit `app_modules` cloud + arbitrage Manu pour decider quel(s) slug(s) garder. Pas de FAB(3R) urgent.

---

### 2.2 — Polices Fraunces / Inter (Google Fonts)

**Constat** : Claude Design `dbm-theme.css` v2.1 utilise `"Inter"` (sans-serif) + `"Fraunces"` (display) avec import Google Fonts.

**Conflit** : V5 INTERDIT-A2 — pas de CDN/import distant non liste dans la stack figee.

**Decision session #115** : **REFUSE**. V5 utilise system fonts (`-apple-system`, `Segoe UI`, etc.).

**Reouverture possible** : si demande forte de typographie premium, etudier embed local via `@font-face` + fichiers `.woff2` heberges sur OVH. Pas urgent.

---

### 2.3 — Patterns ITEM dedies

**Constat** : Claude Design a produit `item.html` (508 lignes) avec patterns specifiques :
- Hero 2 colonnes (h1 + badges + actions a droite)
- Layout `col-lg-8` contenu + `col-lg-4` aside sticky
- `item-section` / `item-section-title` / `item-definition` / `item-field` / `item-variant-card` / `item-timeline` / `item-related-tag`

**Statut V5** : aucun module n a actuellement de pattern ITEM dedie standardise. Les fiches details existent mais avec patterns ad-hoc (modal, offcanvas, inline expand).

**Action** : a etudier si on cree une surface ITEM dediee (cf. CONV-SURFACE-MARKER-HTML §2 charte premium). Decision differee.

---

### 2.4 — Footer 2 etages (institutionnel + signature)

**Constat** : Claude Design `dbm-theme.css` v2.1 propose un footer 2 etages :
- Etage 1 : 4 colonnes editoriales sur fond creme, filet teinte univers
- Etage 2 : signature compacte avec status dot anime (vert good / orange degraded / rouge down)

**Statut V5** : footer existant minimal (`<footer class="app-footer">` simple).

**Action** : a etudier en session UX dediee, alignement avec mini-site DBM (2 etages = signature plus institutionnelle, statut systeme visible).

---

## 3. ITEMS REFUSES SESSION #115

| Item | Raison refus | Statut |
|---|---|---|
| Polices Google Fonts (Fraunces, Inter) | Viole INTERDIT-A2 V5 | Definitif sauf reouverture explicite |
| Slug `medacta` | Marque commerciale dans surface utilisateur | Definitif |
| Renommage `bdb-*.js` -> `dbm-*.js` immediat | Impact prod, casse cache | Differe a session FAB(3R) dediee |
| Palette HSL 28 modules par defaut | Conflit avec D-2026-05-05-S117 5-groupes | Differe a decision admin instance |
| `theme-base.css` CDN -> local immediat | CDN actuel fonctionne, non urgent | Differe a session FAB(3R) dediee |
| Migration vers `dbm-theme.css` Claude Design V2.1 | Conflit avec `theme-base.css` V5 + dbm-module-color.css existant | Re-evaluation lors session 1.2 |

---

## 4. DEPENDANCES ENTRE CHANTIERS

```
1.4 (Audit retro 25 modules) ──┐
                                ├──> peut commencer maintenant (depend 12_CHARTE_PREMIUM seul)
1.1 (Renommage bdb-* dbm-*) ────┘
                                
1.2 (theme-base CDN -> local) ──> faire en meme temps que 1.1 (memes fichiers HTML)

1.3 (Palette HSL 28 modules) ───> independant, sur demande admin instance

2.x (chantiers secondaires) ────> attendre arbitrage Manu (pas de presse)
```

---

## 5. PROCEDURE D OUVERTURE D UN CHANTIER

Pour activer un chantier de ce backlog :

1. **Ouvrir une session dediee** : `atelier_planifier_session(numero, scope, objectifs, fichiers, duree)`.
2. **Charger les skills pertinents** : selon le chantier — `cds-compliance`, `accessibility-audit-bdb`, `ftp-deploy-checklist`, `windows-ops-bdb`.
3. **Produire le FAB(3R) complet** : skill `fab3r-bdb` + INSERT `atelier_decisions`.
4. **Executer le chantier** : SQL prepare en `.sql` numerote SXXX, audit post, deploiement FTP.
5. **Cloturer la session** : `atelier_cloture_session()` + INSERT `atelier_principes` si nouveau garde-fou emerge.

---

## 6. CHANGELOG

| Date | Version | Action |
|---|---|---|
| 2026-05-07 | 1.0.0 | Creation. Backlog issu du brainstorming session #115 sur Charte v3 Claude Design. 4 chantiers majeurs (renommage, theme local, palette HSL, audit retro), 3 chantiers secondaires (slugs, polices, patterns ITEM, footer), 6 items refuses. Aucun chantier active a date. |
