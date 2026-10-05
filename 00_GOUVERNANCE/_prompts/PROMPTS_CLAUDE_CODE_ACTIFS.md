# PROMPTS CLAUDE CODE — Actifs BDB

```
VERSION  : 1.0.0
DATE     : 2026-04-04
CONTENU  : 2 prompts Claude Code actifs, consolidés.
           PROMPT A = Glossaire V2 (session #24 🔄)
           PROMPT B = Rapprochement fiches (TODO #3)
PÉRIMÉ   : Quand les deux chantiers sont terminés.
```

---
---

# PROMPT A — Module Glossaire BDB V2 (session #24)

## Contexte

Tu travailles sur BDB (Bible de Bloc), une application hospitalière de gestion de bloc opératoire.
Stack : HTML/JS/CSS vanilla + Bootstrap 5.3.2 + Bootstrap Icons 1.11.1 + Supabase cloud.
Pas de React. Pas de Node. Pas de build tool.

**Le glossaire n'est PAS un dictionnaire passif.** C'est le **cerveau linguistique** de BDB :
1. **Dictionnaire** — définitions des abréviations, éponymes, termes métier
2. **Découverte** — scan des notes exploitables pour détecter termes orphelins
3. **Propagation** — enrichit synonymes_recherche des protocoles thésaurus
4. **Tooltips** — enrichit le texte affiché dans toute l'application avec `<abbr>`

## Référence architecture

**Lire CTX_GLOSSAIRE_V2_0_0.md AVANT de coder.** Il contient :
- Le schéma complet des tables (glossaire + glossaire_suggestions)
- Les 3 RPC serveur (scan_orphelins, match_notes, propagate)
- Les 4 faces de l'interface (Consultation, Découverte, Propagation, CRUD)
- L'architecture tooltip cross-module
- Le seed initial (~25 entrées)

## Phase 0 — Audit terrain (OBLIGATOIRE avant toute modification)

```bash
# 1. Vérifier colonnes V2 (variantes, categorie, is_propagated)
psql "$DATABASE_URL" -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'glossaire' ORDER BY ordinal_position;"

# 2. Vérifier les RPC existent
psql "$DATABASE_URL" -c "SELECT proname FROM pg_proc WHERE proname LIKE 'glossaire_%';"

# 3. Vérifier le seed
psql "$DATABASE_URL" -c "SELECT COUNT(*) AS total, COUNT(CASE WHEN categorie != '' THEN 1 END) AS avec_categorie FROM glossaire;"

# 4. Vérifier RLS
psql "$DATABASE_URL" -c "SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('glossaire', 'glossaire_suggestions');"

# 5. Vérifier index trigram
psql "$DATABASE_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename = 'thesaurus_interventions' AND indexname LIKE '%trgm%';"

# 6. Vérifier état app_modules
psql "$DATABASE_URL" -c "SELECT key, status, visibility, path FROM app_modules WHERE key = 'glossaire';"

# 7. Vérifier état HTML existant
cat modules/glossaire/index.html | head -30
wc -l modules/glossaire/index.html
```

**STOP si :** colonnes V2 absentes, RPC absentes, ou seed = 0.
→ Les migrations 076a/076b/076c doivent être exécutées dans SQL Editor AVANT cette session.

## Phase 1 — Fichiers à produire (4 fichiers)

### 1. modules/glossaire/index.html

HTML complet conforme CDS :

**Chaîne CSS :**
```
Bootstrap 5.3.2 → BI 1.11.1 → theme-base.css → theme-print.css → cds-overrides.css → glossaire-ui.css
```

**Shell :**
```html
<div id="bdb-shell" data-module-title="Glossaire Chirurgical" data-module-icon="bi-book"></div>
```

**Navigation — 4 onglets :**

| Onglet | Visibilité | ID | Icône |
|---|---|---|---|
| Glossaire | tous | tab-glossaire | bi-book |
| Proposer | tous (authenticated) | tab-proposer | bi-lightbulb |
| Découverte | admin (bdb-admin-only d-none) | tab-decouverte | bi-search-heart |
| Administration | admin (bdb-admin-only d-none) | tab-admin-glos | bi-gear |

**Onglet Glossaire (Face A) :**
- Barre de recherche (input text, debounce 300ms)
- Filtre catégorie (select : Toutes | ABREVIATION | EPONYME | PATHOLOGIE | MATERIEL | TECHNIQUE | ANATOMIE | CONVENTION)
- Liste de cards : abbreviation (h6 bold), définition (paragraphe), usage_notes (small muted), catégorie (badge), variantes (tags)
- Badge "X protocoles liés" calculé via synonymes_recherche match
- Compteur total footer
- Bouton "Proposer un terme" renvoie vers onglet Proposer

**Onglet Proposer (Face D — membres) :**
- Formulaire : terme (input required), définition (textarea required), notes (textarea optional)
- Bouton Submit → INSERT glossaire_suggestions
- Liste "Mes suggestions" (proposées par moi, status visible)
- 3 états : loading, empty, error

**Onglet Découverte (Face B — admin) :**
- Sélecteur seuil minimum (input number, default 10)
- Bouton "Scanner les notes" → appelle RPC glossaire_scan_orphelins
- Table résultats : mot | fréquence | [Voir notes] | [+ Créer entrée]
- "Voir notes" → expand inline, appelle RPC glossaire_match_notes → affiche protocoles + sample_notes
- "+ Créer entrée" → bascule vers admin avec formulaire pré-rempli
- 3 états : loading (spinner pendant scan, peut durer 2-3s), empty, error

**Onglet Administration (Face C+D — admin) :**
- 3 sous-pills : "Gestion glossaire" | "Suggestions" | "Propagation"
  
- **Pill Gestion :** tableau CRUD complet avec les 3 colonnes V2. Modale ajout/modification. Suppression avec confirmation. Colonnes : abbreviation | définition | catégorie | variantes | propagé? | actions.
  
- **Pill Suggestions :** file d'attente (status='pending'). Bouton Approuver → INSERT glossaire + UPDATE status='approved'. Bouton Rejeter → modale admin_note + UPDATE status='rejected'. Badge compteur pending dans le nav.
  
- **Pill Propagation :** liste des entrées glossaire avec is_propagated=false. Pour chaque : bouton "Prévisualiser" (appelle glossaire_match_notes pour compter les protocoles cibles). Bouton "Propager" → appelle glossaire_propagate, refresh. Historique des propagations (is_propagated=true) en bas.

**Toasts :** success, error, info (pattern standard BDB)

**Chaîne JS :**
```
bootstrap.bundle → supabase-js@2 → supabase-client.js → bdb-shell.js → bdb-glossaire-tooltip.js → glossaire-app.js
```

### 2. modules/glossaire/glossaire-app.js

IIFE `GlossApp` conforme CDS :

```javascript
var GlossApp = (function() {
  'use strict';
  return { init: init };
})();

document.addEventListener('DOMContentLoaded', async function() {
  await window.bdbShellReady;
  GlossApp.init(window.bdbUser.isAdmin);
});
```

**Fonctionnalités :**

1. **Chargement** : SELECT * FROM glossaire ORDER BY abbreviation → cache sessionStorage `bdb_glos_entries`
2. **Recherche Face A** : filtre client-side sur abbreviation + definition + usage_notes + variantes (insensible casse + accents)
3. **Affichage Face A** : cards rendues avec escHtml(), catégorie en badge couleur, variantes en tags
4. **Liens protocoles Face A** : pour chaque entrée, compte combien de protocoles ont cette abréviation dans synonymes_recherche
5. **Suggestion Face D** : INSERT glossaire_suggestions + .select() + toast + reset form
6. **Scan Face B** : appelle window.bdb.rpc('glossaire_scan_orphelins', {p_min_freq: N}) → affiche table
7. **Match Face B** : appelle window.bdb.rpc('glossaire_match_notes', {p_term: T}) → expand inline
8. **CRUD Face C** : modale ajout/modification avec tous les champs V2. DELETE avec confirmation. .select() obligatoire.
9. **Review Face C** : SELECT glossaire_suggestions WHERE status='pending'. Approve = INSERT glossaire + UPDATE status. Reject = UPDATE status + admin_note.
10. **Propagation Face C** : appelle window.bdb.rpc('glossaire_propagate', {p_glossaire_id: ID}) → refresh + toast

**Cache :**
- `sessionStorage` clé `bdb_glos_entries` (purge au reload admin après modification)
- Pas de cache pour les RPC scan/match (toujours live)

### 3. modules/glossaire/glossaire-ui.css

CSS co-localisé, préfixe `glos-`. Responsive mobile 375px. Cohérent design system BDB (cards shadow-sm, badges Bootstrap).

### 4. js/bdb-glossaire-tooltip.js

Module JS partagé (utilitaire global, pas un module glossaire).
Pattern IIFE `BdbGlossaire` avec 3 fonctions publiques : `init()`, `enrich(container)`, `lookup(term)`.
Placé dans `js/` (socle partagé — INTERDIT-JS-03 respecté).
Chaque module hôte l'inclut dans sa chaîne `<script>` AVANT son propre JS.

## Phase 2 — app_modules activation

```sql
SELECT status FROM app_modules WHERE key = 'glossaire';
-- Si coming_soon → activer :
UPDATE app_modules
SET status = 'active', is_new = true, new_until = CURRENT_DATE + INTERVAL '30 days'
WHERE key = 'glossaire';
```

## Phase 3 — Recettage

```bash
grep -rn "console\." modules/glossaire/ js/bdb-glossaire-tooltip.js
grep -rn "onclick=" modules/glossaire/
grep -rn 'style="' modules/glossaire/
grep -rn "Font Awesome\|fa-" modules/glossaire/
grep -rn "innerHTML" modules/glossaire/ | grep -v "escHtml"
grep -rn "\.insert\|\.update\|\.delete" modules/glossaire/ | grep -v "\.select"
```

## Fichiers de référence

- **CTX_GLOSSAIRE_V2_0_0.md** — architecture complète (LIRE EN PREMIER)
- **modules/thesaurus/thesaurus-ccam.js** — pattern IIFE + slide-over + RPC calls
- **modules/thesaurus/thesaurus-app.js** — pattern cache sessionStorage + 3 états DOM

---
---

# PROMPT B — Rapprochement fiches papier (TODO #3)

```
VERSION  : 2.0.0
DATE     : 2026-04-04
ORIGINE  : PROMPT_CLAUDECODE_RAPPROCHEMENT_FICHES_V1_1_0.md (V1.1.0, 2026-03-29)
REWRITE  : Aligné sur CTX_DOCTRINE_TERRAIN V1.1.0 — décision humaine, pas matching algo.
USAGE    : Claude Code sur le repo C:\DEV\BIBLE_DE_BLOC\
```

## Doctrine (CTX_DOCTRINE_TERRAIN V1.1.0)

L'outil de rapprochement est une **interface de décision humaine**.
Pas de score. Pas d'algorithme de matching. Pas de Levenshtein.
Manu voit la fiche, recherche en texte libre, sélectionne le protocole BDB.
Le lien est enregistré dans `thesaurus_fiches_papier.protocole_id`.

## État terrain (2026-04-04)

```sql
-- Fiches en base
SELECT COUNT(*) FROM thesaurus_fiches_papier;              -- 391
SELECT COUNT(*) FROM thesaurus_fiches_papier WHERE protocole_id IS NOT NULL;  -- liens existants
SELECT COUNT(DISTINCT chirurgien) FROM thesaurus_fiches_papier;               -- chirurgiens

-- Protocoles disponibles
SELECT COUNT(*) FROM thesaurus_protocoles;                  -- 395
SELECT MAX(id_protocole) FROM thesaurus_protocoles;         -- ACT-0487

-- Colonne nom_nettoye (migration 083)
SELECT nom_nettoye FROM thesaurus_fiches_papier LIMIT 5;
```

## Ce que l'outil doit faire

Reconstruire l'onglet 7 du thésaurus (thesaurus-rapprochement.js) comme interface de décision :

**Vue principale :**
- Tableau des 391 fiches depuis `thesaurus_fiches_papier`
- Colonnes : chirurgien | nom_nettoye | statut | protocole lié | actions
- Filtres : chirurgien (select), statut (select), recherche texte (sur nom_nettoye)
- Compteurs : total | rapprochées | sans correspondance | à valider

**Action "Lier" :**
- Manu clique "Lier" sur une fiche
- Input de recherche texte libre → SELECT thesaurus_protocoles WHERE libelle_cible ILIKE '%term%' OR synonymes_recherche ILIKE '%term%'
- Manu sélectionne → UPDATE thesaurus_fiches_papier SET protocole_id, statut='Rapproché'
- .select() obligatoire

**Action "Hors scope" :**
- Manu clique "Hors scope" → UPDATE statut='Hors scope'

**Action "Délier" :**
- Manu clique "Délier" → UPDATE protocole_id=NULL, statut='Sans correspondance'

**Pas de :**
- Score de similarité
- Matching algorithmique
- Levenshtein ou inclusion de tokens
- Statut automatique basé sur un score
- Pré-remplissage algorithmique

## Dictionnaire d'abréviations (référence)

Utile pour la recherche texte libre (expansion côté JS avant la requête) :

| Abréviation | Expansion |
|---|---|
| PTH | PROTHESE TOTALE HANCHE |
| PTG | PROTHESE TOTALE GENOU |
| PTE | PROTHESE TOTALE EPAULE |
| PIH | PROTHESE INTERMEDIAIRE HANCHE |
| LCA | LIGAMENT CROISE ANTERIEUR |
| KJ | KOENIG JUDET |
| DHS | VIS PLAQUE DHS |
| EMC | ENCLOUAGE CENTROMEDULLAIRE |
| ARTHRO | ARTHROSCOPIE |
| HV | HALLUX VALGUS |
| HR | HALLUX RIGIDUS |
| SCC | SYNDROME CANAL CARPIEN |
| SDC | SYNDROME DE QUERVAIN |
| DDB | DOIGT A RESSORT |
| RCR | REPARATION COIFFE ROTATEURS |

Application : quand Manu tape "PTH" dans la recherche, le JS expand en "PROTHESE TOTALE HANCHE" avant de requêter. Word boundary uniquement.

## Contraintes

```
□ Données depuis Supabase (thesaurus_fiches_papier + thesaurus_protocoles)
□ escHtml() sur tout innerHTML avec donnée DB
□ .select() sur tout .update()
□ 3 états DOM (loading/empty/error)
□ Zero onclick= / Zero console.log / Zero style=
□ Pattern IIFE co-localisé dans modules/thesaurus/thesaurus-rapprochement.js
□ Lazy init depuis thesaurus-app.js (onglet 7 admin-only)
```

---
---

# CONTRAINTES CDS COMMUNES

```
□ Zero onclick=       → addEventListener uniquement
□ Zero console.log    → supprimer avant livraison
□ Zero style= statique → sauf couleurs dynamiques DB
□ escHtml()           → sur tout innerHTML avec donnée DB
□ .select()           → sur tout .insert() / .update() / .delete() Supabase
□ #bdb-shell          → premier enfant de <main> (INTERDIT-E1)
□ Bootstrap Icons     → uniquement (zero Font Awesome)
□ 3 états DOM         → loading / empty / error
□ window.bdbShellReady → await en tête du DOMContentLoaded
□ window.bdb          → pour les requêtes Supabase
□ window.bdbUser.isAdmin → pour le slot admin
□ Fichiers complets   → pas d'extraits, pas de "..."
□ DATA_MODEL réf      → V1.16.0 (vérifier avant tout SQL)
```
