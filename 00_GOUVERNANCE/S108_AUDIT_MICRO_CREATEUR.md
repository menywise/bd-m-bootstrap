# S#108 — Audit micro pages createur/ BDB

## Date : 2026-04-26
## Périmètre : 70 fichiers HTML dans `C:\DEV\BIBLE_DE_BLOC\createur\` (récursif, 4 niveaux de profondeur)
## Méthode : inventaire automatisé (data-root-path + GF-2 + shell + chaîne CSS/JS) + Test-Path sur 392 liens relatifs + grep anonymisation
## Standards : balise GF-2 `<!-- BDB | Surface: L3-CREATEUR | Auth: isCreator | Shell: backoffice -->` ; data-root-path = `../../` (prof 2) ou `../../../` (prof 3) ; chaîne shell standard quand shell présent

> **Régression critique détectée** : 13 pages shell de profondeur 3 (doctrine/lunettes/prompts/templates) ont leur `data-root-path` correctement migré vers `../../../` (Phase 4 Groupe B S#108) mais **leurs chemins `href`/`src` n'ont pas été migrés** — ils sont restés à `../../` (chemin profondeur 2, valide AVANT la migration sous `atelier/sous-dossier/` mais cassé MAINTENANT sous `createur/atelier/sous-dossier/`). 65 occurrences. **Cause** : l'audit Phase 4 S#108 a cherché des patterns `../../` à profondeur 3 et n'en a trouvé aucun (faux négatif lié à la regex utilisée), mais ces patterns existaient bel et bien.

---

## SECTION 1 — createur/atelier/ (profondeur 2, 15 fichiers HTML directs)

### atelier/argumentaire-kpi.html
**Rôle** : Argumentaire commercial — KPIs de vente
**Profondeur** : 2 ; **Utilise bdb-shell** : oui
**Chaîne CSS/JS** : conforme (chaîne shell standard, chemins `../../` corrects)
**data-root-path** : `../../` ✓
**Balise GF-2** : `Surface: L3-CREATEUR | Auth: isCreator | Shell: oui` (label `Shell: oui` au lieu de `Shell: backoffice` — cosmétique)
**Liens** : tous résolus
**Verdict** : CONFORME (anomalie GF-2 mineure)

### atelier/atelier-tables-app-modules.html, atelier-tables-index.html, ccam-validator.html, ccam.html, diagnostic.html, glossaire-feeder.html, index.html, memo.html, overview.html, pricing-roi.html, schema-audit.html, session-ia.html
**Rôle** : Pages outillage atelier (tables admin, validation CCAM, diagnostic, etc.)
**Profondeur** : 2 ; **Utilise bdb-shell** : oui (toutes)
**Chaîne CSS/JS** : conforme — chaîne shell standard (`../../css/cds-overrides.css`, `../../js/supabase-client.js`, `bdb-ui`, `bdb-invite-guard`, `bdb-shell`)
**data-root-path** : `../../` ✓ (toutes)
**Balise GF-2** : présente, `Shell: non` (incohérent avec présence réelle de `#bdb-shell` — anomalie cosmétique récurrente sur la valeur de Shell:, mais le shell fonctionne)
**Liens** : tous résolus

**Verdict** : 12 pages CONFORMES (anomalie cosmétique GF-2 `Shell: non` au lieu de `Shell: backoffice`)

### atelier/memo.html — VIOLATION ANONYMISATION
- Idem ci-dessus + **L641 contient "Dr COSTE" / "Dr Coste"** (nom propre identifiant)
- **Verdict** : 1 violation
- **Violation** : L641 — anonymiser "Dr COSTE" en "Dr X" ou nom générique fictif

### atelier/cockpit.html — page générée par script
**Rôle** : Cockpit de session (généré par `build-cockpit.ps1`)
**Profondeur** : 2 ; **Utilise bdb-shell** : non (page standalone custom)
**Balise GF-2** : présente, `Shell: non` ✓
**Liens** :
- `../css/cds-overrides.css` (L?) → **CASSÉ** : chemin profondeur 1 (`../`) au lieu de profondeur 2 (`../../`). Le générateur `build-cockpit.ps1` n'a pas été mis à jour post-S108.
- Liens vers `../../index.html`, `../../modules/thesaurus/index.html`, `../../modules/admin/index.html` (L312-314) → tous EXISTENT (corrigés en Phase 4 S#108)

**Verdict** : 1 violation
**Violation** : L? — `<link href="../css/cds-overrides.css">` doit être `../../css/cds-overrides.css`. Correctif structurel : mettre à jour `scripts/build-cockpit.ps1` pour générer le bon chemin.

---

## SECTION 2 — createur/atelier/cds/ (profondeur 3, 8 showcases CDS)

> Ces 8 fichiers sont des **showcases visuels de référence CDS**, pas des pages app actives. Ils utilisent des CDN absolus pour BS/theme-base/BI mais référencent des assets locaux fictifs (`[module]-ui.css`, `[module]-app.js`) servant de templates. Ces "liens cassés" sont **intentionnels et conformes au statut de showcase** — ils ne doivent PAS être considérés comme des violations.

| Fichier | data-root-path | Shell | GF-2 | Notes |
|---|---|---|---|---|
| `_TEMPLATE_SHOWCASE_V5_0_1.html` | absent | non | **absente** | Squelette template — GF-2 absente acceptable (squelette) |
| `index.html` | absent | non | présente | Index showcases — liens vers `template-vierge/[module]-app.js` etc. = placeholders |
| `theme-crud.html`, `theme-landing.html`, `theme-showcase.html`, `theme-wizard.html` | absent | oui (dans le DOM) | présente | 4 thèmes CDS — liens `../../js/...` placeholder fictifs |
| `theme-dashboard-print-paysage.html`, `theme-dashboard-print-portrait.html` | absent | non | présente | 2 thèmes print — assets minimaux |

**Verdict global cds/** : CONFORME (showcases — pas de pages app)

---

## SECTION 3 — createur/atelier/cds/pages-manquantes/ (profondeur 4, 14 fichiers)

> Showcases CDS représentant les anciennes pages racine pré-S108 (aide, archivage, changelog, contact, export, impressions, maintenance, mentions-legales, notifications, offline, onboarding, parametres, recherche, session-expiree). Ces fichiers sont des **prototypes statiques** sans interactivité réelle. Liens HTML vers `index.html` ou `js/...` sont des placeholders qui ne pointent vers rien — c'est le statut normal d'un showcase.

| Catégorie | Nombre | Liens "cassés" (intentionnels) |
|---|---|---|
| Showcases pages publiques | 14 | `href="index.html"` (placeholder), `recherche.html` charge `js/...` (placeholders) |

**Note spéciale** : `pages-manquantes/recherche.html` a `data-root-path="."` — anomalie pré-S108 (déjà signalée S108_AUDIT_GPS), pas modifiée par la migration. Conservée en l'état.

**Verdict global pages-manquantes/** : CONFORME (showcases statiques)

---

## SECTION 4 — createur/atelier/cds/pages-racine/ (profondeur 4, 6 fichiers)

> Showcases des pages racine système (403, 404, login, pending, reset-password, unauthorized). Les liens absolus `/bdb/...` ou relatifs `js/...` sont des placeholders showcase (pas des liens fonctionnels).

**Verdict global pages-racine/** : CONFORME (showcases)

---

## SECTION 5 — createur/atelier/cds/template-vierge/ (profondeur 4, 7 fichiers)

> Templates de référence vierges contenant des placeholders explicites (`[CSS_MODULE]`, `[module]-ui.css`, `[module]-app.js`). Ces "liens cassés" sont des marqueurs de remplacement visibles, intentionnels.

**Verdict global template-vierge/** : CONFORME (templates avec placeholders explicites)

---

## SECTION 6 — createur/atelier/doctrine/ (profondeur 3, 2 fichiers SHELL)

### doctrine/admin.html, doctrine/index.html
**Rôle** : Pages doctrine atelier (admin + index)
**Profondeur** : 3 ; **Utilise bdb-shell** : oui
**data-root-path** : `../../../` ✓ (correct pour profondeur 3, migré Phase 4 Groupe B)

**Chaîne CSS/JS** : **CASSÉE — RÉGRESSION S#108**
- `<link href="../../css/cds-overrides.css">` → CASSÉ (cherche `createur/atelier/css/...`). Devrait être `../../../css/cds-overrides.css`.
- `<script src="../../js/supabase-client.js">` → CASSÉ. Devrait être `../../../js/supabase-client.js`.
- Idem pour `bdb-ui.js`, `bdb-invite-guard.js`, `bdb-shell.js` (4 scripts × 2 fichiers = 8 occurrences)

**Verdict** : 2 fichiers × 5 violations chacun = **10 violations**
**Correctif** : remplacer `../../` → `../../../` dans les `<link>` et `<script>` des 2 fichiers.

---

## SECTION 7 — createur/conseil/ (profondeur 2, 6 fichiers SHELL)

### conseil/corrections.html, doctrine.html, index.html, soumissions.html, verdicts.html, workflow.html
**Rôle** : Pages d'outillage conseil (workflow, doctrine, soumissions, verdicts, corrections)
**Profondeur** : 2 ; **Utilise bdb-shell** : oui (toutes)
**Chaîne CSS/JS** : conforme — chaîne shell standard (`../../css/`, `../../js/...`)
**data-root-path** : `../../` ✓
**Balise GF-2** : présente, `Shell: non` (incohérent valeur Shell: mais shell fonctionnel)
**Liens** : tous résolus

**Verdict** : 6 pages CONFORMES (anomalie cosmétique GF-2 valeur `Shell:`)

---

## SECTION 8 — createur/conseil/lunettes/ (profondeur 3, 6 fichiers SHELL — RÉGRESSION)

### lunettes/architecture.html, createur.html, index.html, marche.html, philosophie.html, terrain.html
**Rôle** : 6 perspectives "lunettes" du conseil (architecture, créateur, marché, philosophie, terrain + index)
**Profondeur** : 3 ; **Utilise bdb-shell** : oui (toutes)
**data-root-path** : `../../../` ✓ (migré Phase 4 Groupe B)

**Chaîne CSS/JS** : **CASSÉE — RÉGRESSION S#108** (idem doctrine/)
- `<link href="../../css/cds-overrides.css">` → CASSÉ. Doit être `../../../css/cds-overrides.css`.
- 4 scripts JS shell (supabase-client, bdb-ui, bdb-invite-guard, bdb-shell) à `../../js/...` → tous CASSÉS. Doivent être `../../../js/...`.

**Verdict** : 6 fichiers × 5 violations = **30 violations**
**Correctif** : remplacer `../../` → `../../../` dans les `<link>` et `<script>` des 6 fichiers.

---

## SECTION 9 — createur/conseil/prompts/ (profondeur 3, 3 fichiers SHELL — RÉGRESSION)

### prompts/gemini.html, index.html, perplexity.html
**Rôle** : Prompts AI pour le conseil (Gemini, Perplexity + index)
**Profondeur** : 3 ; **Utilise bdb-shell** : oui
**data-root-path** : `../../../` ✓
**Chaîne CSS/JS** : **CASSÉE — RÉGRESSION S#108** (5 chemins par fichier à `../../` au lieu de `../../../`)

**Verdict** : 3 fichiers × 5 violations = **15 violations**
**Correctif** : remplacer `../../` → `../../../` dans les `<link>` et `<script>` des 3 fichiers.

---

## SECTION 10 — createur/conseil/templates/ (profondeur 3, 2 fichiers SHELL — RÉGRESSION)

### templates/rapport.html, soumission.html
**Rôle** : Templates rapport et soumission conseil
**Profondeur** : 3 ; **Utilise bdb-shell** : oui
**data-root-path** : `../../../` ✓
**Chaîne CSS/JS** : **CASSÉE — RÉGRESSION S#108**

**Verdict** : 2 fichiers × 5 violations = **10 violations**
**Correctif** : `../../` → `../../../`.

---

## SECTION 11 — createur/conseil/{corrections,soumissions,verdicts}/ (sous-dossiers vides)

> Ces 3 dossiers existent mais ne contiennent que `.gitkeep` ou rien. Ils sont structurels (réservés pour contenu futur). RAS à signaler.

---

## SECTION 12 — createur/bernard/ (profondeur 2, 1 fichier)

### bernard/bernard.html
**Rôle** : Page Bernard (dossier privé créateur)
**Profondeur** : 2 ; **Utilise bdb-shell** : oui
**data-root-path** : `../../` ✓
**Balise GF-2** : **ABSENTE**
**Chaîne CSS/JS** : conforme
**Liens** :
- `index.html` → **CASSÉ** : chemin sans préfixe cherche `bernard/index.html` qui n'existe pas. Probablement intention = portail BDB → corriger en `../../index.html`.

**Verdict** : 2 violations
**Violations** :
1. **L?** — `href="index.html"` cassé. Préciser intention : `../../index.html` (portail BDB) ou supprimer.
2. **L1-2** — Balise GF-2 absente. Ajouter `<!-- BDB | Surface: L3-CREATEUR | Auth: isCreator | Shell: backoffice -->`.

---

## SECTION 13 — createur/back-office/ (profondeur 2, 1 fichier)

### back-office/_TEMPLATE_BACKOFFICE_V5_0_1.html — VIOLATION ANONYMISATION
**Rôle** : Template backoffice de référence (V5.0.1)
**Profondeur** : 2 ; **Utilise bdb-shell** : oui
**data-root-path** : `../../` ✓
**Balise GF-2** : **ABSENTE**
**Chaîne CSS/JS** : conforme
**Anonymisation** : **NON-CONFORME** — "Chenieux" apparaît 3 fois (L356, L378, L400) dans des exemples illustrant des données d'instance.

**Verdict** : 4 violations
**Violations** :
1. **L1-2** — Balise GF-2 absente. Ajouter en tête.
2. **L356** — Mention "Chenieux" → anonymiser (ex: "Établissement de démo" ou "Instance X").
3. **L378** — Idem L356.
4. **L400** — Idem L356.

---

## Récapitulatif par sous-dossier

| Sous-dossier | Fichiers HTML | Verdict | Violations |
|---|---|---|---|
| `atelier/` (racine, prof 2) | 15 | 13 CONFORMES + 1 anonymisation (memo) + 1 lien cassé (cockpit) | 2 |
| `atelier/cds/` (prof 3, showcases) | 8 | CONFORME (showcases) | 0 |
| `atelier/cds/pages-manquantes/` (prof 4) | 14 | CONFORME (showcases) | 0 |
| `atelier/cds/pages-racine/` (prof 4) | 6 | CONFORME (showcases) | 0 |
| `atelier/cds/template-vierge/` (prof 4) | 7 | CONFORME (templates avec placeholders) | 0 |
| `atelier/doctrine/` (prof 3, shell) | 2 | **RÉGRESSION** chemins shell | 10 |
| `conseil/` (racine, prof 2) | 6 | CONFORMES | 0 |
| `conseil/lunettes/` (prof 3, shell) | 6 | **RÉGRESSION** chemins shell | 30 |
| `conseil/prompts/` (prof 3, shell) | 3 | **RÉGRESSION** chemins shell | 15 |
| `conseil/templates/` (prof 3, shell) | 2 | **RÉGRESSION** chemins shell | 10 |
| `bernard/` (prof 2) | 1 | 1 lien cassé + GF-2 absente | 2 |
| `back-office/` (prof 2) | 1 | 1 anonymisation + GF-2 absente | 4 |
| **TOTAL** | **70** | | **73 violations** |

### Statistiques finales

- **Total fichiers audités** : 70
- **Liens vérifiés (Test-Path)** : 392 — 253 valides + **139 cassés**
  - **Cassés sur showcases** (intentionnels) : 74 (placeholders, CDN absolus inexistants en local)
  - **Cassés sur pages shell réelles** (vraies violations) : **65**
- **Pages CONFORMES** : 56/70 (80%)
- **Pages avec violations** : 14/70 (20%)
- **Anonymisation** :
  - 3 occurrences "Chenieux" dans `back-office/_TEMPLATE_BACKOFFICE_V5_0_1.html`
  - 2 occurrences "Dr COSTE/Coste" dans `atelier/memo.html` L641
- **Liens inter-L3** (atelier ↔ conseil ↔ bernard) : 0 (aucun lien croisé entre dossiers L3)

### Régression critique S#108 — Détail consolidé

13 pages shell de profondeur 3 ont été partiellement migrées : `data-root-path` a été corrigé (Phase 4 Groupe B) mais les chemins `<link href="../../...">` et `<script src="../../...">` n'ont pas été touchés. Résultat : 65 chemins css/js cassés sur des pages réellement utilisées par les créateurs.

| Fichier | Chemins css/js à corriger |
|---|---|
| `atelier/doctrine/admin.html` | 1 css + 4 js = 5 |
| `atelier/doctrine/index.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/architecture.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/createur.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/index.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/marche.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/philosophie.html` | 1 css + 4 js = 5 |
| `conseil/lunettes/terrain.html` | 1 css + 4 js = 5 |
| `conseil/prompts/gemini.html` | 1 css + 4 js = 5 |
| `conseil/prompts/index.html` | 1 css + 4 js = 5 |
| `conseil/prompts/perplexity.html` | 1 css + 4 js = 5 |
| `conseil/templates/rapport.html` | 1 css + 4 js = 5 |
| `conseil/templates/soumission.html` | 1 css + 4 js = 5 |
| **TOTAL** | **65 chemins** |

**Correctif global** : pour ces 13 fichiers, remplacer mécaniquement `"../../css/` → `"../../../css/` et `"../../js/` → `"../../../js/`. Opération scriptable identique à la Phase 4 Groupe A de la migration originelle, mais d'un niveau supplémentaire.

### Anomalies cosmétiques systémiques (non bloquantes)

1. **Valeur `Shell:` dans GF-2** : 18 pages shell racine utilisent `Shell: non` au lieu de `Shell: backoffice` dans le commentaire d'en-tête, alors que le `<div id="bdb-shell">` est bien présent et fonctionnel. Incohérence documentaire systémique mais sans impact runtime.
2. **GF-2 absente** : 3 fichiers (`bernard/bernard.html`, `back-office/_TEMPLATE_BACKOFFICE_V5_0_1.html`, `atelier/cds/_TEMPLATE_SHOWCASE_V5_0_1.html`) n'ont pas de balise GF-2.
3. **`atelier/cds/pages-manquantes/recherche.html`** : `data-root-path="."` (anomalie pré-S108 conservée).

### Liens inter-L3

Aucun lien direct détecté entre `atelier/`, `conseil/`, `bernard/`, `back-office/`. Cohérent : chaque dossier L3 est autonome. La navigation inter-L3 passe par les liens sidebar de `bdb-shell.js` (corrigés en S#108 vers `createur/atelier/...` et `createur/conseil/...`).

### Recommandations prioritaires

1. **CRITIQUE — Corriger 13 fichiers shell prof 3** : remplacer `../../css/` → `../../../css/` et `../../js/` → `../../../js/`. Opération scriptable PowerShell ciblée (5 patterns × 13 fichiers = 65 remplacements). Sans ce correctif, ces pages sont totalement cassées (CSS et JS non chargés).
2. **Anonymisation** :
   - `back-office/_TEMPLATE_BACKOFFICE_V5_0_1.html` L356/378/400 : "Chenieux" → "Établissement Démo" ou similaire.
   - `atelier/memo.html` L641 : "Dr COSTE" → "Dr X" ou nom fictif.
3. **`bernard/bernard.html`** :
   - Corriger `href="index.html"` → `../../index.html` (probablement portail BDB).
   - Ajouter balise GF-2.
4. **`back-office/_TEMPLATE_BACKOFFICE_V5_0_1.html`** : ajouter balise GF-2.
5. **`atelier/cockpit.html`** L? : corriger `../css/cds-overrides.css` → `../../css/cds-overrides.css`. Mettre à jour `scripts/build-cockpit.ps1` pour générer le bon chemin à chaque build.
6. **Cosmétique** : aligner les balises GF-2 `Shell: non/oui` → `Shell: backoffice` sur les 18 pages shell concernées (cohérence documentaire).

### Note sur les showcases CDS

Les 35 fichiers de `atelier/cds/` (8) + `pages-manquantes/` (14) + `pages-racine/` (6) + `template-vierge/` (7) sont des **showcases visuels CDS** et **templates de référence**. Ils contiennent intentionnellement des placeholders (`[module]-ui.css`, `[CSS_MODULE]`, etc.) ou des chemins absolus OVH (`/bdb/...`) non fonctionnels en local. Conformément au prompt, ils ne sont pas considérés comme des pages app et leurs liens "cassés" ne sont pas comptés comme violations.
