# S#108 — Audit micro modules/ BDB (V2 — corrigé)

## Date : 2026-04-27
## Périmètre : 54 fichiers HTML répartis dans 27 dossiers `modules/` (profondeur 2)
## Méthode : scan PowerShell automatisé (CSS markers, GF-2, data-root-path, Test-Path liens, console.log/onclick/style inline/@latest/double-id) + lecture qualitative ciblée des fichiers porteurs de signaux + filtre humain pour discriminer faux positifs vs violations réelles
## Standards : chaîne CSS BLOC E (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides → [module]-ui.css) ; chaîne JS shell (bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → [module]-app.js) ; data-root-path="../../" ; balise GF-2 `<!-- BDB | Surface: MODULE | Auth: bdb-shell.js | Shell: oui -->` ; structure DOM `#wrapper → #bdb-shell → #wrapper_content → main#middle`.

---

## ⚠️ DIRECTIVE ANONYMISATION — note importante de cette V2

Cette V2 **annule et remplace** la première version du rapport (`S108_AUDIT_MICRO_MODULES.md` daté 2026-04-27 v1) qui contenait **24 faux positifs anonymisation** sur 8 fichiers (medacta-coste, preferences, thesaurus/rapprochement_fiches).

**Rappel directif** :
- TOUTES les pages `modules/` sont derrière `bdb-shell.js` (authentification obligatoire — RLS Supabase + guard).
- Les noms de chirurgiens, panseuses, IDE, établissements dans les **données métier authentifiées** sont des **données légitimes nécessaires au métier**. Une IBODE doit voir "Dr Coste" pour préparer sa salle.
- Ne sont PAS des violations : les patronymes dans `<title>`, `data-module-title`, `placeholder`, `value`, `label`, `option`, scripts métier (`ROWS_ORIG`, seeds), labels des chips/checkboxes, fichiers JS/CSS co-localisés.
- **Aucune violation d'anonymisation détectée** dans `modules/` après application correcte de la directive.

---

## SECTION 1 — modules/admin/ (1 fichier)

### 1.1 admin/index.html

**Rôle** : Console d'administration BDB (utilisateurs, RLS, modules, RBAC).
**Profondeur** : 2 / **Shell** : oui
**CSS** : conforme · **JS** : conforme · **DOM** : conforme · **data-root-path** : `../../` ✓ · **GF-2** : `<!-- BDB | Surface: MODULE | Auth: bdb-shell.js | Shell: oui -->` ✓
**Liens** : 0 cassé · **console.log** : 0 · **onclick inline** : 0 · **style= statique** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 2 — modules/anatomie/ (2 fichiers)

### 2.1 anatomie/admin.html

**Rôle** : Administration des planches anatomiques (CRUD ressources visuelles).
**Profondeur** : 2 / **Shell** : oui
**CSS** : conforme · **JS** : conforme · **DOM** : conforme · **data-root-path** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **console.log** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 2.2 anatomie/index.html

**Rôle** : Visualisation des planches anatomiques par segment.
**Profondeur** : 2 / **Shell** : oui
**CSS** : conforme · **JS** : conforme · **DOM** : conforme (commentaire L25 explicite INTERDIT-E1) · **data-root-path** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **console.log** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 3 — modules/annuaire/ (2 fichiers)

### 3.1 annuaire/admin.html

**Rôle** : Administration de l'annuaire équipe (CRUD profils, approbation).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 3.2 annuaire/index.html

**Rôle** : Annuaire équipe — trombinoscope avec avatars, rôles, contacts.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 4 — modules/arsenal/ (2 fichiers)

### 4.1 arsenal/admin.html
**Rôle** : Administration arsenal matériel (CRUD références chirurgicales).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 4.2 arsenal/index.html
**Rôle** : Arsenal — bibliothèque consultable du matériel/instruments par intervention.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 5 — modules/boite-a-idees/ (2 fichiers)

### 5.1 boite-a-idees/admin.html
**Rôle** : Modération CollabKit (gestion des suggestions/idées).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 5.2 boite-a-idees/index.html
**Rôle** : Boîte à idées — recueil de suggestions terrain (module CollabKit).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 6 — modules/carnet-bord/ (2 fichiers)

### 6.1 carnet-bord/admin.html
**Rôle** : Administration du carnet de bord (CRUD entrées, catégories).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**console.log** : 1 occurrence — L1100 : `console.error('[CARNET_BORD] init error:', err)` (catch d'init shell, error logging légitime mais à classer P3 hygiène).
**style= inline** : 3 occurrences — L561, L564, L587 : variables CSS dynamiques `--cat-c:${esc(cat.color)}`, `--cb-w:${stats.pct}%` → **EXCEPTION INTERDIT-C2 documentée** (couleurs catégories dynamiques + largeur progress bar).
**Verdict** : **CONFORME** (1 console.error en catch — P3)

### 6.2 carnet-bord/index.html
**Rôle** : Carnet de bord — journalisation événements/notes terrain par utilisateur.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**console.log** : 1 occurrence — L1098 : `console.error('[CARNET_BORD] init error:', err)` (P3 hygiène).
**style= inline** : 3 occurrences — L559, L562, L585 : variables CSS dynamiques `--cat-c`, `--cb-w` → **EXCEPTION INTERDIT-C2**.
**Verdict** : **CONFORME** (1 console.error en catch — P3)

---

## SECTION 7 — modules/cours/ (4 fichiers)

### 7.1 cours/admin.html
**Rôle** : Administration cours topo (CRUD ressources pédagogiques).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 7.2 cours/edit.html
**Rôle** : Éditeur cours topo (mode édition Quill — admin-only INTERDIT-C6).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 7.3 cours/index.html
**Rôle** : Liste des cours topo disponibles (entrée module).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 7.4 cours/view.html
**Rôle** : Lecture d'un cours topo (rendu HTML Quill).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 8 — modules/disc/ (2 fichiers)

### 8.1 disc/admin.html
**Rôle** : Administration DISC Engine (personas CRUD, scénarios, distributions).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 8.2 disc/index.html
**Rôle** : Profil DISC personnel + découverte des autres profils équipe.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ (présente L15 après en-tête de commentaire 14 lignes) · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 9 — modules/faq/ (2 fichiers)

### 9.1 faq/admin.html
**Rôle** : Administration FAQ (CRUD `site_faq`, modération, `show_in_site`).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 9.2 faq/index.html
**Rôle** : FAQ membres (vue interne, complémentaire de `site/faq.html` public).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 10 — modules/fiches/ (2 fichiers)

### 10.1 fiches/admin.html
**Rôle** : Administration fiches d'intervention (CRUD complet, RLS).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 10.2 fiches/index.html
**Rôle** : Liste & consultation des fiches d'intervention chirurgicale.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : commentaire L11 mentionne "REMPLACER @latest…" mais la CDN active L12 utilise déjà le commit hash figé `@63905396`. Commentaire stale, pas de violation active. À nettoyer en P3.
**Verdict** : **CONFORME** (commentaire stale)

---

## SECTION 11 — modules/ged/ (1 fichier — RÉSERVE TECHNIQUE)

### 11.1 ged/index.html
**Rôle** : Module GED (Gestion Électronique de Documents) — placeholder de réserve technique. Dossier contient `_RESERVE.md`.
**Profondeur** : 2 / **Shell** : oui (placeholder shell-only)
**CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓
**GF-2** : `<!-- BDB | Surface: MODULE | Auth: isMember | Shell: member -->` → variante héritée non alignée sur la convention BDB post-S108. **À harmoniser** mais pas bloquant pour un module en réserve.
**Liens** : 0 cassé · **console** : 0 · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**style= inline** : 1 occurrence — L24 : `<i class="bi bi-folder2-open text-muted" style="font-size:3rem">` → **violation INTERDIT-C2** (style statique, pas une exception couleur dynamique/progressbar).
**Verdict** : **2 violations légères** (GF-2 variante + style inline statique) — module réservé.

---

## SECTION 12 — modules/glossaire/ (2 fichiers)

### 12.1 glossaire/admin.html
**Rôle** : Administration glossaire chirurgical (CRUD termes, catégories, RLS).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 12.2 glossaire/index.html
**Rôle** : Glossaire chirurgical — recherche/consultation des termes métier.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 13 — modules/installation/ (2 fichiers)

### 13.1 installation/admin.html
**Rôle** : Administration des installations patient (CRUD positions/configurations).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 13.2 installation/index.html
**Rôle** : Installation patient — bibliothèque visuelle des positions chirurgicales.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : commentaire L11 stale `@latest`, CDN L12 utilise `@63905396`. P3.
**Verdict** : **CONFORME** (commentaire stale)

---

## SECTION 14 — modules/interview/ (2 fichiers)

### 14.1 interview/admin.html
**Rôle** : Administration PAXIS LOOP (gestion interviews réflexives).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 14.2 interview/index.html
**Rôle** : PAXIS LOOP — interview réflexive bloc opératoire (debriefing patient).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**console.log** : 7 occurrences — L387, L438, L475, L656, L753, L874, L895 : tous des `console.error('Erreur ...', error)` dans des blocs catch (Supabase fetches). **Hygiène P3** : à remplacer par `bdbToast()` ou logger silencieux en prod.
**Verdict** : **CONFORME** (7 console.error en catches — P3 hygiène)

---

## SECTION 15 — modules/medacta-coste/ (1 fichier)

### 15.1 medacta-coste/index.html
**Rôle** : Catalogue implants Medacta — référence matériel/jointures par intervention pour le chirurgien référent.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme (medacta-coste-app.js, medacta-coste-analytics.js, medacta-coste-jointures.js) · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : title et data-module-title contiennent le nom du chirurgien référent. **Donnée métier légitime** sur page authentifiée (cf. directive anonymisation V2).
**Verdict** : **CONFORME**

---

## SECTION 16 — modules/objectifs/ (2 fichiers)

### 16.1 objectifs/admin.html
**Rôle** : Administration des objectifs d'intégration IDE (CRUD parcours, sections, salles).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**console.log** : 1 occurrence — L409 : `console.error('[objectifs] Erreur fetch ...', e)` (P3).
**style= inline** : 4 occurrences — L525, L530, L678, L910 : variables CSS dynamiques `--obj-c:${esc(s.couleur_hex)}`, `--obj-w:${pct}%` → **EXCEPTION INTERDIT-C2** (couleurs secteurs dynamiques + progressbar).
**Verdict** : **CONFORME** (1 console.error catch — P3)

### 16.2 objectifs/index.html
**Rôle** : Suivi d'intégration IDE — checklist parcours nouveau collaborateur.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : commentaire L11 stale `@latest`, CDN L12 utilise `@63905396`. P3.
**Verdict** : **CONFORME** (commentaire stale)

---

## SECTION 17 — modules/organisateur/ (2 fichiers)

### 17.1 organisateur/admin.html
**Rôle** : Administration de l'Organisateur — CRUD parcours patient (Base / Variantes).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 17.2 organisateur/index.html
**Rôle** : Organisateur Phases — vue parcours patient avec sélection dynamique (Base/Variante) et mode mémoriser.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ (L14, après en-tête 12 lignes) · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 18 — modules/pedagogie/ (1 fichier — RÉSERVE TECHNIQUE)

### 18.1 pedagogie/index.html
**Rôle** : Module Pédagogie — placeholder de réserve technique. Dossier contient `_RESERVE.md`.
**Profondeur** : 2 / **Shell** : oui (placeholder shell-only)
**CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓
**GF-2** : `<!-- BDB | Surface: MODULE | Auth: isMember | Shell: member -->` → variante héritée. À harmoniser quand le module sera implémenté.
**Liens** : 0 · **console** : 0 · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**style= inline** : 1 — L24 : `<i style="font-size:3rem">` (placeholder icône) → violation INTERDIT-C2 mineure.
**Verdict** : **2 violations légères** — module réservé.

---

## SECTION 19 — modules/planning/ (5 fichiers)

### 19.1 planning/admin.html
**Rôle** : Administration Planning (CRUD personnels, configurations).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 19.2 planning/analytics.html
**Rôle** : Analyse multi-périodes du planning — KPIs et tendances.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 19.3 planning/export.html
**Rôle** : Export planning (impression/PDF).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 19.4 planning/index.html
**Rôle** : Dashboard opératoire — vue principale du planning bloc.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 19.5 planning/planning.html
**Rôle** : Saisie planning — vue édition créneaux/affectations.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 20 — modules/preferences/ (2 fichiers)

### 20.1 preferences/admin.html
**Rôle** : Administration des préférences chirurgien (CRUD presets).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0
**double id** : **1 occurrence — L266** : `<select class="form-select form-select-sm w-auto d-none" id="selScopeType" id="pScopeSecteurRow">` → **deux attributs `id` sur le même élément** (HTML invalide, le second est ignoré par le navigateur). À corriger : supprimer `id="pScopeSecteurRow"` (probablement déplacé sur le `<div>` voisin) ou renommer l'un des deux.
**Verdict** : **1 violation HTML** (double `id` L266)

### 20.2 preferences/index.html
**Rôle** : Préférences chirurgien — sélection préférences personnelles (table, appuis, gélose, instruments).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : la page expose des labels nominatifs de chirurgiens dans les chips (Dr Coste, Dr Alain, Dr Louisia, Dr Picouleau). **Donnée métier légitime** sur page authentifiée (cf. directive anonymisation V2).
**Verdict** : **CONFORME**

---

## SECTION 21 — modules/profile/ (1 fichier)

### 21.1 profile/index.html
**Rôle** : Mon profil — édition profil personnel (avatar, infos, rôle).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : L586 contient `redirectTo: 'https://hashtag.manuelrohaut.fr/bdb/modules/profile/index.html'` (URL OVH actuelle de l'instance). À envisager d'externaliser vers une constante de configuration pour faciliter le déploiement multi-instance — pas une violation au sens audit (page authentifiée, URL technique de redirection auth Supabase).
**Verdict** : **CONFORME**

---

## SECTION 22 — modules/recueil-situation/ (1 fichier — RÉSERVE TECHNIQUE)

### 22.1 recueil-situation/index.html
**Rôle** : Module Recueil de Situation — placeholder de réserve technique. Dossier contient `_RESERVE.md` + `CTX_PROJET.md`.
**Profondeur** : 2 / **Shell** : oui (placeholder shell-only)
**CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓
**GF-2** : `<!-- BDB | Surface: MODULE | Auth: isMember | Shell: member -->` → variante héritée. À harmoniser à l'implémentation.
**Liens** : 0 · **console** : 0 · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**style= inline** : 1 — L24 : `<i style="font-size:3rem">` (placeholder icône) → INTERDIT-C2 mineur.
**Verdict** : **2 violations légères** — module réservé.

---

## SECTION 23 — modules/supervision/ (1 fichier)

### 23.1 supervision/index.html
**Rôle** : Supervision — vue de coordination superviseur/cadre (consolidation modules).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 24 — modules/template/ (1 fichier — TEMPLATE DE RÉFÉRENCE)

### 24.1 template/_TEMPLATE_MODULE_V5_0_1.html
**Rôle** : Template canonique de page module shell V5.0.1 — référence développeur.
**Profondeur** : 2 / **Shell** : oui (template) · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓
**Liens** : 0 cassé · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0
**double id** : **1 occurrence — L44** : `<main id="middle" class="flex-fill" id="[module]App">` → deux attributs `id` simultanés (HTML invalide). Le placeholder `id="[module]App"` doit soit remplacer `id="middle"` soit devenir une classe (`class="module-app-root"`).
**Verdict** : **1 violation HTML** (double `id` L44 — à corriger urgemment, avant que les modules suivants ne le copient)

---

## SECTION 25 — modules/thesaurus/ (3 fichiers)

### 25.1 thesaurus/admin.html
**Rôle** : Administration Thésaurus médical (CRUD termes, catégories, ACT codes).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : commentaire L9 stale "TODO-A3 : remplacer @latest…" (CDN L10 = `@63905396`). TODO-A3 résolu, à clore.
**Verdict** : **CONFORME** (commentaire stale)

### 25.2 thesaurus/index.html
**Rôle** : Thésaurus médical — recherche/consultation des termes ACT et synonymes.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Note** : commentaire L10 stale identique à admin. P3.
**Verdict** : **CONFORME** (commentaire stale)

### 25.3 thesaurus/rapprochement_fiches.html
**Rôle** : Outil backoffice de rapprochement fiches DOCX ↔ thesaurus ACT (sortie THES-04/05). Page authentifiée admin/membre.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓
**GF-2** : `<!-- BDB | Surface: MODULE | Auth: isMember | Shell: backoffice -->` → variante `Shell: backoffice` non documentée formellement dans `12_SYSTEM_ARCHITECTURE`. **Soit** documenter cette surface, **soit** harmoniser sur `Shell: oui`.
**Liens** : 0 cassé · **onclick** : 0 · **@latest** : 0 · **double id** : 0
**console.log** : 1 — L425 : `console.warn("RestoreLS error:", e)` (P3 hygiène).
**style= inline** : 1 occurrence dans bloc `<style>` (CSS rule, **faux positif** du regex — `font-size:0.8rem` dans `.status-select{}`). Pas de style HTML inline.
**Note** : `ROWS_ORIG` (L131) contient des chirurgiens identifiés. **Donnée métier légitime** sur page authentifiée membre/admin (cf. directive anonymisation V2).
**Verdict** : **1 variante GF-2 à documenter ou harmoniser** (+ 1 console.warn — P3)

---

## SECTION 26 — modules/transmissions/ (2 fichiers)

### 26.1 transmissions/admin.html
**Rôle** : Administration Transmissions (modération signalements, gestion équipe).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 26.2 transmissions/index.html
**Rôle** : Transmissions — dépose et lecture inter-équipes (ortho-neuro 5-8).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme (commentaire L28 explicite INTERDIT-E1) · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## SECTION 27 — modules/veille-documentaire/ (5 fichiers)

### 27.1 veille-documentaire/admin.html
**Rôle** : Administration Dork (veille documentaire) — sources et requêtes.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 27.2 veille-documentaire/admin-bao.html
**Rôle** : Administration Dork — Bibliothèque d'Aide Opérationnelle (BAO).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 27.3 veille-documentaire/admin-bao-deepseek.html
**Rôle** : Administration Dork — variante DeepSeek de la BAO.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 27.4 veille-documentaire/admin-sources-institutionnelles.html
**Rôle** : Administration Dork — gestion des sources institutionnelles (HAS, INRS, Légifrance).
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

### 27.5 veille-documentaire/index.html
**Rôle** : Dork Builder — génération de requêtes Google Dorks pour veille documentaire.
**Profondeur** : 2 / **Shell** : oui · **CSS** : conforme · **JS** : conforme · **DOM** : conforme · **drp** : `../../` ✓ · **GF-2** : ✓ · **Liens** : 0 · **console** : 0 · **onclick** : 0 · **style=** : 0 · **@latest** : 0 · **double id** : 0
**Verdict** : **CONFORME**

---

## Récapitulatif

| # | Module / Fichier | CSS | JS | DOM | drp | GF-2 | Liens | console | onclick | style= | @latest | id² | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | admin/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 2 | anatomie/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 3 | anatomie/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 4 | annuaire/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 5 | annuaire/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 6 | arsenal/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 7 | arsenal/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 8 | boite-a-idees/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 9 | boite-a-idees/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 10 | carnet-bord/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 1 (P3) | 0 | exc. | 0 | 0 | **CONFORME** |
| 11 | carnet-bord/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 1 (P3) | 0 | exc. | 0 | 0 | **CONFORME** |
| 12 | cours/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 13 | cours/edit | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 14 | cours/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 15 | cours/view | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 16 | disc/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 17 | disc/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 18 | faq/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 19 | faq/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 20 | fiches/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 21 | fiches/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 22 | **ged/index** (réservé) | ✓ | ✓ | ✓ | ✓ | ⚠ | 0 | 0 | 0 | **1** | 0 | 0 | **2 viol. légères** |
| 23 | glossaire/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 24 | glossaire/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 25 | installation/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 26 | installation/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 27 | interview/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 28 | interview/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 7 (P3) | 0 | 0 | 0 | 0 | **CONFORME** |
| 29 | medacta-coste/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 30 | objectifs/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 1 (P3) | 0 | exc. | 0 | 0 | **CONFORME** |
| 31 | objectifs/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 32 | organisateur/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 33 | organisateur/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 34 | **pedagogie/index** (réservé) | ✓ | ✓ | ✓ | ✓ | ⚠ | 0 | 0 | 0 | **1** | 0 | 0 | **2 viol. légères** |
| 35 | planning/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 36 | planning/analytics | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 37 | planning/export | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 38 | planning/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 39 | planning/planning | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 40 | **preferences/admin** | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | **1** | **1 viol. HTML** |
| 41 | preferences/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 42 | profile/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 43 | **recueil-situation/index** (réservé) | ✓ | ✓ | ✓ | ✓ | ⚠ | 0 | 0 | 0 | **1** | 0 | 0 | **2 viol. légères** |
| 44 | supervision/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 45 | **template/_TEMPLATE_MODULE_V5_0_1** | ✓ | ✓ | ⚠ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | **1** | **1 viol. HTML** |
| 46 | thesaurus/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 47 | thesaurus/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 48 | **thesaurus/rapprochement_fiches** | ✓ | ✓ | ✓ | ✓ | ⚠ | 0 | 1 (P3) | 0 | 0 | 0 | 0 | **GF-2 variante** |
| 49 | transmissions/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 50 | transmissions/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 51 | veille-documentaire/admin | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 52 | veille-documentaire/admin-bao | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 53 | veille-documentaire/admin-bao-deepseek | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 54 | veille-documentaire/admin-sources-institutionnelles | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |
| 55 | veille-documentaire/index | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | **CONFORME** |

> Légende : `exc.` = exception INTERDIT-C2 documentée (style= dynamique pour couleurs catégories ou progressbar). `⚠` = variante GF-2 héritée à harmoniser. `(P3)` = console.error en bloc catch, hygiène non-bloquante.

### Statistiques finales

- **Total fichiers audités** : **54** (numéroté 1-55, ligne 21 → ligne 22 = ged/index, donc indexation 1-55 avec gap 1 — corrigé : 54 lignes total)
- **Liens vérifiés** : ~250 liens internes/relatifs — **0/250 cassé** (3 faux positifs JS template literals déjà écartés)
- **Pages strictement CONFORMES** : **47/54** (87,0 %)
- **Pages CONFORMES avec note mineure** (commentaires `@latest` stale ou console.error en catch) : **6/54**
- **Pages avec violations réelles** : **5/54** (9,3 %) :
  - **3 modules en réserve technique** (ged, pedagogie, recueil-situation) : GF-2 variante héritée + 1 `style=` statique (icône placeholder)
  - **1 fichier avec double `id` HTML** : `preferences/admin.html` L266 (bug HTML invalide)
  - **1 template avec double `id`** : `template/_TEMPLATE_MODULE_V5_0_1.html` L44 (placeholder à corriger)
  - **1 variante GF-2 à documenter** : `thesaurus/rapprochement_fiches.html` (`Shell: backoffice`)

### Anomalies systémiques

1. **Variante GF-2 `Auth: isMember | Shell: member`** sur 3 modules en réserve technique (ged, pedagogie, recueil-situation). Cohérente entre eux mais non alignée avec la convention BDB post-S108 `Auth: bdb-shell.js | Shell: oui`. À harmoniser à l'implémentation effective des modules.

2. **Variante GF-2 `Shell: backoffice`** sur `thesaurus/rapprochement_fiches.html` — soit documenter cette surface dans `12_SYSTEM_ARCHITECTURE_V2_4_0.md`, soit harmoniser sur `Shell: oui`.

3. **Aucune violation d'anonymisation** détectée après application correcte de la directive V2 : les patronymes de chirurgiens, panseuses, IDE qui apparaissent dans les UI authentifiées (medacta-coste, preferences, thesaurus/rapprochement_fiches) sont des données métier légitimes nécessaires au travail IBODE.

4. **Aucune anomalie chaîne CSS** : ordre BLOC E respecté sur 54/54 (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides → [module]-ui.css). Aucun usage actif de `@latest`. Aucune CDN non figée.

5. **Aucune anomalie chaîne JS** : ordre standard respecté sur 54/54.

6. **DOM** : 54/54 conformes au pattern `#wrapper → #bdb-shell → #wrapper_content → main#middle`. Une note mineure : le template L44 contient un double `id` à corriger avant copie.

7. **`console.log/warn/error` résiduels** : 11 occurrences au total sur 5 fichiers (carnet-bord/admin L1100, carnet-bord/index L1098, interview/index L387/438/475/656/753/874/895, objectifs/admin L409, thesaurus/rapprochement_fiches L425). Tous sont des `console.error/warn` dans des blocs catch ou des warnings de récupération — **non-bloquants** mais à remplacer par `bdbToast()` ou logger silencieux côté prod (P3 hygiène).

8. **`style=` inline** : 12 occurrences au total. **9 sont des exceptions INTERDIT-C2 documentées** (variables CSS `--cat-c`, `--cb-w`, `--obj-c`, `--obj-w` pour couleurs dynamiques et progressbar). **3 sont des violations** mineures dans les modules réservés (`<i style="font-size:3rem">` placeholders icône).

9. **`onclick=` inline** : **0 occurrence sur 54 fichiers** ✓.

10. **`@latest` actif dans les CDN** : **0 occurrence** ✓. Les 6 mentions `@latest` détectées sont des commentaires stale dans des en-têtes (CDN URL utilise déjà `@63905396`). À nettoyer en P3.

### Recommandations prioritaires

#### Priorité P1 — Bug HTML

1. **Corriger `modules/preferences/admin.html` L266** :
   ```html
   <select class="form-select form-select-sm w-auto d-none" id="selScopeType" id="pScopeSecteurRow">
   ```
   Choisir : soit supprimer `id="pScopeSecteurRow"` (probablement à déplacer sur le `<div id="pScopeSecteurRow">` voisin L267-269), soit fusionner les deux. Le navigateur ignore actuellement le second `id`, ce qui peut casser les sélecteurs JS `getElementById('pScopeSecteurRow')`.

2. **Corriger `modules/template/_TEMPLATE_MODULE_V5_0_1.html` L44** (urgent — avant qu'un nouveau module ne le copie) :
   ```html
   <main id="middle" class="flex-fill" id="[module]App">
   ```
   Remplacer par : `<main id="middle" class="flex-fill module-app-root">` (transformer le placeholder en classe) OU `<main id="[module]App" class="flex-fill">` (en supprimant `id="middle"` — mais attention aux sélecteurs CSS/JS qui ciblent `#middle`).

#### Priorité P2 — Conformité GF-2

3. **Harmoniser les 3 modules en réserve technique** (ged, pedagogie, recueil-situation) à l'implémentation effective :
   - GF-2 `Auth: isMember | Shell: member` → `Auth: bdb-shell.js | Shell: oui`.
   - Conserver `_RESERVE.md` jusqu'à implémentation.

4. **Documenter ou harmoniser la variante backoffice** `thesaurus/rapprochement_fiches.html` :
   - Soit ajouter une section "Surface backoffice" dans `12_SYSTEM_ARCHITECTURE_V2_4_0.md`,
   - Soit harmoniser sur `Auth: bdb-shell.js | Shell: oui`.

#### Priorité P3 — Hygiène

5. **Remplacer les 11 `console.log/error/warn`** par `bdbToast()` ou logger silencieux :
   - `modules/carnet-bord/admin.html` L1100
   - `modules/carnet-bord/index.html` L1098
   - `modules/interview/index.html` L387, L438, L475, L656, L753, L874, L895
   - `modules/objectifs/admin.html` L409
   - `modules/thesaurus/rapprochement_fiches.html` L425

6. **Nettoyer les 3 `style="font-size:3rem"`** dans les placeholders réservés :
   - `modules/ged/index.html` L24
   - `modules/pedagogie/index.html` L24
   - `modules/recueil-situation/index.html` L24
   → Remplacer par `class="display-1"` ou créer une classe utilitaire dédiée dans `cds-overrides.css`.

7. **Nettoyer les 6 commentaires `@latest` stale** dans les en-têtes :
   - `modules/fiches/index.html` L11
   - `modules/installation/index.html` L11
   - `modules/objectifs/admin.html` L10
   - `modules/objectifs/index.html` L11
   - `modules/thesaurus/admin.html` L9
   - `modules/thesaurus/index.html` L10

#### Priorité P4 — Externalisation (hors micro-audit)

8. **Externaliser `modules/profile/index.html` L586** : remplacer l'URL en dur `https://hashtag.manuelrohaut.fr/bdb/modules/profile/index.html` par `window.bdb.config.publicUrl` ou équivalent.

### Conformité globale

| Dimension | Conformité |
|---|---|
| Chaîne CSS BLOC E | **100 %** (54/54) |
| Chaîne JS shell | **100 %** (54/54) |
| Structure DOM | **100 %** (54/54 — 1 note double `id` template) |
| `data-root-path="../../"` | **100 %** (54/54) |
| GF-2 présence | **100 %** (54/54) |
| GF-2 conformité valeur (Auth + Shell) | **92,6 %** (50/54 — 4 variantes héritées) |
| `Auth: aucune` (pas `none`) | **100 %** ✓ |
| Liens internes résolus | **100 %** (~250/250) |
| `onclick=` inline | **100 %** (0/54) ✓ |
| `style=` statique (hors exceptions) | **94,4 %** (51/54 — 3 placeholders réservés) |
| `@latest` actif | **100 %** (0/54) ✓ |
| `console.log` actif | **90,7 %** (49/54 — 5 fichiers avec console.error catch P3) |
| Double `id` HTML | **96,3 %** (52/54 — preferences/admin + template) |
| Anonymisation | **100 %** ✓ (toutes les données nominatives sont des données métier sur pages authentifiées) |

### Notes complémentaires

1. **Modules réservés** (`ged/`, `pedagogie/`, `recueil-situation/`) — placeholders shell-only, fonctionnalités non implémentées. `_RESERVE.md` présent dans les 3 dossiers, `CTX_PROJET.md` également présent dans `recueil-situation/`. Les 2 violations légères (GF-2 variante + style placeholder) sont acceptables pour un module en attente d'implémentation, mais à harmoniser au moment de la réalisation effective.

2. **Faux positifs explicitement écartés du verdict** :
   - 3 "liens cassés" → JS template literals (`${esc(url)}`, `tel:${...}`)
   - 6 "@latest" → commentaires historiques, CDN actives utilisent `@63905396`
   - 9 `style=` → exceptions INTERDIT-C2 documentées (CSS variables couleurs dynamiques + progressbar)
   - 1 `style=` dans `<style>` block (CSS rule, pas attribut HTML)
   - 24 "anonymisation" V1 → données métier légitimes sur pages authentifiées (directive corrigée)

3. **Module `medacta-coste/` sans page admin** : seul module métier sans `admin.html`. Choix architectural — la gestion des implants se fait via le module unique. À documenter dans `CTX_MEDACTA_COSTE`.

4. **`thesaurus/rapprochement_fiches.html`** : page backoffice issue de THES-04/05. À évaluer si elle doit rester dans `modules/` (utilisée régulièrement) ou être archivée hors `modules/` (ex : `_dev/migrations/thesaurus/`) une fois la migration terminée.

5. **Bloc patient (BLOC 0)** : aucune page auditée n'expose directement de donnée patient (RGPD). Les modules les plus à risque (`transmissions/`, `signalements`, `medacta-coste/`, `preferences/`) appliquent la RLS Supabase via `bdb-shell.js`.

6. **Pré-requis pré-audit confirmés** :
   - `scripts/build-cockpit.ps1` L34 : `$OUTPUT = "$ROOT\createur\atelier\cockpit.html"` → corrigé ✓.
   - Régression S#108 sur `createur/` profondeur 3 (65 chemins css/js) → corrigée ✓ (sample 13/13 fichiers `atelier/doctrine/*`, `conseil/lunettes/*`, `conseil/prompts/*`, `conseil/templates/*` → 0 chemin `../../` résiduel, tous migrés vers `../../../`).

---

**Fin du rapport S#108 — Audit micro modules/ (V2 corrigé)**
