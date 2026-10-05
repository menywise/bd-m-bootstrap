# CTX — MODULE THESAURUS

```
VERSION  : 2.1.0
DATE     : 2026-03-23
STATUT   : OPÉRATIONNEL — MIGRATION COMPLÈTE + UX PREMIUM
FICHIER  : modules/thesaurus/index.html
JS       : modules/thesaurus/thesaurus-app.js (V4 — 1426 lignes)
CSS      : modules/thesaurus/thesaurus-ui.css (V2.3 — 244 lignes)
  UX premium : modale restructurée 4 sections, définition expert typographiée,
  proposition_nouvel_acte_label affiché, recherche étendue 7 champs,
  export CSV 13 colonnes, skeleton loaders chirurgiens,
  cache indicator + purge admin dans footer statique,
  placeholder synonymes corrigé (| ou ,).
  Fix ACT-0360 enrichi depuis CSV V4 (HD + DIAM → LFFA002).
  24 orphelins CSV évalués → écartés (tous rares, freq < 50).
  16 CCAM manquants documentés → reportés (cosmétique).
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.

---

## ROLE

Référentiel statistique des protocoles opératoires du bloc Ortho-Neurochirurgie.
420 protocoles · 70 361 interventions · données 2006–2025.

Outil de recherche, consultation et administration (admin uniquement pour CRUD).

---

## PORTÉE

- Recherche étendue (7 champs : libellé, synonymes, pathologie, CCAM, définition, sources, proposition)
- Consultation 420 protocoles (6 onglets)
- Modale détail premium : 4 sections (Identification / Classification / Recherche / Sources) + Définition expert typographiée
- CRUD admin protocoles (Supabase réel)
- Import CSV interventions/protocoles (Supabase réel, batch 500)
- Analyse chirurgiens (solo + comparaison, skeleton loaders)
- Heatmap type × zone, croisements dynamiques, temporel
- Export CSV enrichi (13 colonnes)
- Cache sessionStorage avec indicateur footer + purge admin

---

## STACK TECHNIQUE

```
HTML/JS vanilla · Bootstrap 5.3.2 · Chart.js 4.4.0
Supabase cloud : thesaurus_protocoles + thesaurus_interventions
RPC : thesaurus_distinct_chirurgiens() + thesaurus_distinct_annees()
Cache sessionStorage : bdb_thes_* (protocoles, chirurgiens, années, interv par chirurgien)
Zéro module ES. Zéro localStorage.
```

---

## TABLES SUPABASE

```
thesaurus_protocoles    (420 lignes) — DDL 018, seed 018, enrichissement 019, fix 020
  id, id_protocole (UNIQUE), libelle_cible, pathologie, type, zone_anat,
  cat_parent, specialite, frequence, pareto, alertes, synonymes_recherche,
  codes_ccam, proposition_nouvel_acte_label, definition_expert,
  libelles_sources_lies, created_at, updated_at
  RLS : SELECT is_approved() · INSERT/UPDATE/DELETE is_admin()

thesaurus_interventions (70 361 lignes) — DDL 018, seed 018
  id, chirurgien, date_intervention, protocole_operatoire, specialite, created_at
  RLS : SELECT is_approved() · INSERT/DELETE is_admin()

RPC : thesaurus_distinct_chirurgiens() · thesaurus_distinct_annees()
  SECURITY DEFINER · GRANT authenticated
```

---

## DONNÉES ENRICHIES

### Migration 019 — CSV V4 (420/420 protocoles)

Source : `THESAURUS_V4_INTEGRAL.csv` (443 lignes, 18 colonnes).
Jointure par LIBELLE_CIBLE normalisé → 420/420 matchés. Zéro token IA.

| Champ Supabase | Couverture |
|---|---|
| pathologie | 420/420 (100%) |
| definition_expert | 420/420 (100%) |
| synonymes_recherche | 420/420 (100%) |
| codes_ccam | 403/420 (96%) |
| libelles_sources_lies | 411/420 (98%) |
| proposition_nouvel_acte_label | 420/420 (100%) |

Séparateur synonymes : pipe `|` (compatible via `split(/[,|]/)`).

### Migration 020 — Fix ACT-0360

ACT-0360 "HERNIE DISCALE + DIAM" enrichi depuis CSV V4 ("HD + DIAM") : codes_ccam = LFFA002.

### Éléments documentés non traités

- ACT-0006 "PETITE INTERVENTION" (freq 2838) : fourre-tout intentionnel, pas de CCAM. Chantier futur = éclater.
- 16 protocoles rares (freq 2-3) sans CCAM : reporté, impact cosmétique.
- 24 protocoles CSV V4 orphelins (absents seed 018) : écartés (tous rares, freq < 50).

---

## ANTI-HALLUCINATION

```
- LIBELLE_CIBLE et FREQUENCE sont SACRÉS — non modifiables après création
- CRUD admin = Supabase réel (pas local)
- Import CSV = Supabase réel (DELETE ALL + batch INSERT)
- Cache sessionStorage → purge nécessaire après UPDATE SQL direct
- Séparateur synonymes = pipe | (split /[,|]/)
- ACT-0006 = fourre-tout, pas un vrai protocole
- bdb-shell.js est branché et fonctionnel
- Les services JS (auth-service.js etc.) n'existent pas
```

---

## AUTORISÉ / INTERDIT

AUTORISÉ : CRUD admin · Import CSV · Enrichissement IA · Modifier thesaurus-app.js et thesaurus-ui.css

INTERDIT : Modifier LIBELLE_CIBLE/FREQUENCE · style= statique · onclick= · Modifier bdb-shell.js/supabase-client.js/cds-overrides.css sans accord

---

## DÉPENDANCES

```
ACTIVES : Bootstrap 5.3.2 · Bootstrap Icons 1.11.1 · Chart.js 4.4.0
          js/supabase-client.js · js/bdb-shell.js v1.5.0
          thesaurus-ui.css (co-localisé) · css/cds-overrides.css
SUPABASE : thesaurus_protocoles · thesaurus_interventions · 2 RPC
```

---

## MIGRATIONS SQL

```
018_thesaurus_schema.sql        — DDL + RLS + INDEX
018_thesaurus_seed_protocoles   — 420 lignes
018_thesaurus_seed_interventions — 70 361 lignes
018b_thesaurus_rpc.sql          — 2 fonctions DISTINCT
019_thesaurus_enrichissement    — 420 UPDATE (CSV V4 → 6 champs)
020_thesaurus_fix_ccam          — ACT-0360 enrichi + template 16 CCAM
```

---

---

## SPEC PRODUCTION — Rapprochement fiches papier (TODO #3)

**Interface de décision humaine — pas d'algorithme.**

### Fichier cible

`modules/thesaurus/thesaurus-rapprochement.js` — IIFE co-localisé, lazy init depuis `thesaurus-app.js` (onglet 7 admin-only).

### Vue principale

Tableau des 391 fiches `thesaurus_fiches_papier` :
- Colonnes : chirurgien · nom_nettoye · statut · protocole lié · actions
- Filtres : chirurgien (select) · statut (select) · recherche texte (nom_nettoye)
- Compteurs : total · rapprochées · sans correspondance · à valider

### Actions

| Action | Comportement |
|---|---|
| Lier | Input texte libre → SELECT protocoles ILIKE → sélection Manu → UPDATE protocole_id + statut='Rapproché' |
| Hors scope | UPDATE statut='Hors scope' |
| Délier | UPDATE protocole_id=NULL, statut='Sans correspondance' |

### Dictionnaire abréviations (expansion avant requête)

```javascript
const ABBREV = {
  'PTH': 'PROTHESE TOTALE HANCHE', 'PTG': 'PROTHESE TOTALE GENOU',
  'PTE': 'PROTHESE TOTALE EPAULE', 'PIH': 'PROTHESE INTERMEDIAIRE HANCHE',
  'LCA': 'LIGAMENT CROISE ANTERIEUR', 'KJ': 'KOENIG JUDET',
  'DHS': 'VIS PLAQUE DHS', 'EMC': 'ENCLOUAGE CENTROMEDULLAIRE',
  'ARTHRO': 'ARTHROSCOPIE', 'HV': 'HALLUX VALGUS', 'HR': 'HALLUX RIGIDUS',
  'SCC': 'SYNDROME CANAL CARPIEN', 'SDC': 'SYNDROME DE QUERVAIN',
  'DDB': 'DOIGT A RESSORT', 'RCR': 'REPARATION COIFFE ROTATEURS'
};
```

Application : word boundary uniquement. Manu tape "PTH" → expand → requête.

### Règles absolues

- Zéro score de similarité · zéro Levenshtein · zéro pré-remplissage algorithmique
- `.select()` obligatoire sur tout `.update()`
- `escHtml()` sur tout `innerHTML` avec donnée DB
- 3 états DOM (loading / empty / error)
