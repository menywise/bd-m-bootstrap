# CTX_[NOM_MODULE].md

```
VERSION   : 2.0.0
DATE      : 2026-04-25
MODULE    : [NOM_MODULE]
STATUT    : DRAFT → à valider par Manu avant première session
DELTA     : v1.2.0 → v2.0.0
            Suppression réfs mortes (NOYAU_VERITE, CDS_REFERENCE, DATA_MODEL_V12).
            Aligné sur workflow DB-first (atelier_principes = source principes).
            Aligné sur bdb-shell v2.5.0 + Smarty V5.
```

> ⚠ RÈGLE : Toute IA qui travaille sur ce module lit ce fichier
> APRÈS 10_ARCHITECTURE_REGLES_TECHNIQUES et 02_SUPABASE_DATA_MODEL.
> Ce fichier prime sur toute conversation précédente.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  [Ce que ce module fait — 1 phrase]

PORTEE      :
  [Ce que le module couvre + ce qui est hors périmètre]

AUTORISE    :
  [Ce que l'IA peut faire dans ce module]

INTERDIT    :
  TOUJOURS inclure ces interdits fixes :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-ui.js
  - Toucher à cds-overrides.css sans décision documentée
  - Dupliquer le bloc auth (bdb-shell.js gère)
  - Requêter profiles_directory ou user_roles (window.bdbUser = source unique)
  - Inventer une colonne — vérifier information_schema
  - Ajouter style= statique dans le HTML
  - Ajouter onclick= dans le HTML
  - console.log en production

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v2.5.0
    window.bdbApp      → fourni par bdb-shell.js v2.5.0
    window.bdb         → client Supabase (supabase-client.js)
    escHtml()          → fourni par bdb-ui.js
    bdbToast()         → fourni par bdb-ui.js
  Spécifiques à ce module :
    [Tables Supabase utilisées]
    [Modules BDB liés si applicable]
```

---

## BLOC 2 — TABLES SUPABASE

```
Table principale : [nom_table]
Colonnes clés    : [lister les colonnes métier — vérifier via information_schema]
RLS actives      : [lister les policies — vérifier via pg_policies]
État             : [Créée le DATE | Vérifiée le DATE]
```

**Règle** : avant tout SQL, vérifier le schéma réel :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '[nom_table]';
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE/DELETE | Note |
|---|---|---|---|
| **invite** (démo) | `published` uniquement | ✗ | Guard bdb-invite-guard.js + RLS |
| **membre** | `published` uniquement | Selon module | RLS |
| **admin** | tout | ✓ | RLS |

Côté UI : boutons admin en `class="d-none"`, retirés si `window.bdbUser.isAdmin`.

---

## BLOC 4 — CHECKLIST QUALITÉ

```
[ ] CDS conforme
      Zéro style= statique
      Zéro onclick= (addEventListener uniquement)
      CSS module scopé (INTERDIT-17)
      Chaîne de chargement respectée (voir 10_ARCHITECTURE §7)
      escHtml() sur tout innerHTML avec donnée DB

[ ] Documenté
      Ce fichier CTX à jour

[ ] Résilient (CONV-ASYNC-3ETATS)
      loading (skeleton) / empty (message) / error (toast + retry)
      Jamais de page blanche

[ ] Navigable
      data-module-title et data-module-icon sur #bdb-shell

[ ] Responsive
      Testé desktop + mobile
```

**État actuel** : `[0/5]`

**Violations actives** :

```
[Lister ici les violations connues]
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
[Règles propres à ce module — pas dans les principes généraux]

RÈGLE-[NOM]-01 :
  Description :
  Source      : [session / décision atelier_decisions ref]
  Impact      : [Ce qui casse si violée]
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur | Correct |
|---|---|---|
| `#bdb-shell` frère de `#wrapper` | Layout cassé — page blanche | `#bdb-shell` premier enfant de `#wrapper` (INTERDIT-E1) |
| Recréer escHtml() local | Doublon avec bdb-ui.js | Utiliser l'import bdb-ui.js |
| [À compléter au fil des sessions] | | |

---

## BLOC 7 — FICHIERS À CHARGER AVANT SESSION

```
1. 10_ARCHITECTURE_REGLES_TECHNIQUES (architecture + interdits)
2. 02_SUPABASE_DATA_MODEL (tables + enums + RPC)
3. Ce fichier CTX_[MODULE]
4. 02_BACK_OFFICE_REF (si module back-office)
5. 03_CATALOGUE_BS_SMARTY (si travail CSS/composants)
```

---

## HISTORIQUE

```
[DATE] — V1.0.0
  Création. Session #[N].
```
