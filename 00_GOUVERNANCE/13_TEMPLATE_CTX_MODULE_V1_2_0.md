# CTX_[NOM_MODULE].md
```
VERSION   : 1.2.0
DATE      : 2026-03-22
MODULE    : [NOM_MODULE]
STATUT    : DRAFT → à valider par Manu avant première session
NOYAU_REF : NOYAU_VERITE_V2_4_0
CHANTIER  : CHANTIER_TECHNIQUE_V1_0_5
DATA_REF  : SUPABASE_DATA_MODEL_V12
SHELL_REF : bdb-shell.js v1.3.1
CSS_REF   : cds-overrides.css v1.6.0
CDS_REF   : CDS_REFERENCE.md v1.0.0
DELTA     : v1.1.0 → v1.2.0 (D-2026-03-22-CSS-01) :
            BLOC 7 : CDS_REFERENCE.md ajouté dans fichiers à charger.
            BLOC 4 : case CDS_REFERENCE consulté ajoutée dans checklist CDS conforme.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  [Ce que ce module fait — 1 phrase, pas d'ambiguïté]
  Exemple : "Référentiel des interventions chirurgicales.
             Consultation pour membres et mode démo.
             Création/modification pour admins."

PORTEE      :
  [Ce que le module couvre exactement + ce qui est hors périmètre]
  Exemple : "Interventions secteur ORTHO-NEURO.
             Hors périmètre actuel : VISCÉRAL, URO — briques suivantes."

AUTORISE    :
  [Ce que l'IA peut faire dans ce module]
  Exemple : "Modifier index.html, [nom-module]-ui.css,
             les requêtes Supabase, la logique métier JS."

INTERDIT    :
  [Ce que l'IA ne doit JAMAIS faire dans ce module]
  TOUJOURS inclure ces interdits fixes :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css (→ entrée JOURNAL_DECISIONS si changement nécessaire)
  - Dupliquer le bloc auth (géré par bdb-shell.js)
  - Faire une requête profiles_directory ou user_roles dans ce module
    (window.bdbUser est la source unique — fourni par bdb-shell.js)
  - Modifier les RLS sans entrée JOURNAL_DECISIONS
  - Inventer une colonne absente de SUPABASE_DATA_MODEL_V12
  - Ajouter style= statique dans le HTML
  - Ajouter onclick= dans le HTML
  - Recréer une classe CSS déjà définie dans CDS_REFERENCE.md
  - Nommer un @keyframes sans préfixe [module]-

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.3.1
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.6.0 (classes cds-*, bdb-*, badge-fn-*)
    CDS_REFERENCE.md   → consulter avant tout CSS ou HTML
  Spécifiques à ce module :
    [Lister les tables Supabase utilisées]
    [Lister les modules BDB liés si applicable]
```

---

## BLOC 2 — TABLE SUPABASE

```
Nom de table  : [nom_module]
Script SQL    : TEMPLATE_MODULE_BDB.sql v2.0.0 (appliqué le [DATE])
Colonnes clés : id · title · description · category_id · status
                created_by · created_at · updated_at
                + [COLONNES MÉTIER SPÉCIFIQUES]
RLS actives   : pol_[nom_module]_demo_read (anon, SELECT published)
                pol_[nom_module]_member_read (auth, SELECT published)
                pol_[nom_module]_admin_read_all (auth admin, SELECT all)
                pol_[nom_module]_admin_write (auth admin, ALL)
État Supabase : [À créer | Créée le DATE | Vérifiée le DATE]
```

### Règle E9 — anti-régression critique

```
⚠ approved → profiles_directory.approved  (JAMAIS user_roles)
⚠ role     → user_roles.role              (JAMAIS profiles_directory)
⚠ Le JS de ce module NE FAIT JAMAIS ces requêtes directement.
  window.bdbUser.isAdmin et window.bdbUser.role sont les sources uniques.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE/DELETE | Note |
|-----|--------|---------------------|------|
| **anon** (démo, non connecté) | `published` uniquement | ✗ | RLS policy 4 |
| **member** (connecté, rôle member) | `published` uniquement | ✗ | RLS policy 1 |
| **admin** | tout (draft/published/archived) | ✓ | RLS policies 2+3 |

**Côté UI** (bdb-shell.js fournit `window.bdbUser.isAdmin`) :
- Boutons d'action → `class="d-none"` par défaut, retirés si `isAdmin`
- Pas de redirect pour le mode démo — lecture seule silencieuse
- Mode preview admin (bdb-preview.js) → simuler vue member ou anon

---

## BLOC 4 — CHECKLIST PREMIUM

Source : NOYAU_VERITE_V2_4_0 BLOC 9 — 5 critères obligatoires.

```
[ ] CDS conforme
      CDS_REFERENCE.md consulté avant tout CSS ou HTML (IA-9)
      Zéro classe CSS réinventée déjà dans CDS_REFERENCE.md
      Zéro style= statique dans le HTML
      Zéro onclick= dans le HTML (addEventListener uniquement)
      CSS module scopé (INTERDIT-17)
      Tout @keyframes préfixé [module]-
      Chaîne de chargement BLOC E respectée
      Aucune règle dans cds-overrides.css ajoutée sans JOURNAL_DECISIONS

[ ] Documenté
      Ce fichier CTX à jour dans 00_GOUVERNANCE/

[ ] Résilient
      loadingState / emptyState / errorState implémentés
      cds-offline-banner affiché si Supabase hors service
      Jamais de page blanche

[ ] Navigable
      Lien retour portail dans l'offcanvas (fourni par bdb-shell.js)
      data-module-title et data-module-icon renseignés sur #bdb-shell

[ ] Responsive
      Testé desktop + mobile (touch)
      input-group empilé sous 576px (cds-overrides.css gère déjà)
```

**État actuel** : `[0/5]`

**Violations actives** :
```
[Lister ici les violations connues]
Exemples :
  ⚠ Shell non migré — bloc auth dupliqué (bdb-shell.js non encore chargé)
  ⚠ N occurrences de style= inline → classes CDS à appliquer
  ⚠ INTERDIT-17 : [règle CSS] non scopée dans [nom-module]-ui.css
  ⚠ Classe [X] réinventée — existe déjà dans CDS_REFERENCE.md couche [Y]
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
[Règles propres à ce module — ne figurent pas dans le NOYAU]

RÈGLE-[NOM]-01 :
  [Description]
  Source  : [Terrain / session du DATE / JOURNAL_DECISIONS réf]
  Impact  : [Ce qui casse si violée]

RÈGLE-[NOM]-02 :
  ...
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct |
|---|---|---|
| `#bdb-shell` frère de `<main>` dans `<body>` | Header injecté invisible — layout flex cassé | `#bdb-shell` premier enfant de `<main>` (INTERDIT-E1) |
| Recréer `.avatar-sm` dans le module | Doublon avec theme-base.css (32px) ou cds-overrides (36px) | Consulter CDS_REFERENCE.md — utiliser `.cds-avatar-sm` ou `.avatar-sm` selon contexte |
| `@keyframes shimmer` dans le module | Conflit avec annuaire-ui.css et theme-base.css | Nommer `@keyframes [module]-shimmer` |
| [À compléter au fil des sessions] | | |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
Déclarer avant de commencer :

MODULE EN COURS     : [NOM_MODULE]
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : [liste fermée]
FICHIERS HORS SCOPE : [liste fermée]

Fichiers à charger (dans l'ordre) :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS_V[DERNIERE].md
  [ ] Ce fichier CTX
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md   (si travail technique)
  [ ] SUPABASE_DATA_MODEL_V12.md     (si travail sur données)
  [ ] CDS_REFERENCE.md               (OBLIGATOIRE si travail CSS ou HTML)

Si un champ est vide → ne pas commencer.
Si CDS_REFERENCE.md absent et session CSS/HTML → hallucination CSS garantie → STOP.
```

---

## BLOC 8 — HISTORIQUE

| Date | Version | Action | Statut |
|------|---------|--------|--------|
| [DATE] | 1.0.0 | Création CTX depuis TEMPLATE | DRAFT |

---

## RÈGLE DE CLÔTURE

En fin de chaque session sur ce module :

1. Mettre à jour BLOC 8 (historique)
2. Mettre à jour BLOC 4 (état premium — violations résolues)
3. Mettre à jour BLOC 5 si nouvelle règle métier identifiée
4. Inscrire dans JOURNAL_DECISIONS toute décision validée
5. Incrémenter la VERSION de ce fichier si des blocs ont changé

**Ce qui n'est pas écrit dans un fichier est perdu.**
**La conversation n'est pas une source de vérité.**
