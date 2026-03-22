# CTX_INSTALLATION.md
```
VERSION   : 2.1.0
DATE      : 2026-03-21
MODULE    : installation
STATUT    : OPÉRATIONNEL — données partielles · bdb-shell migré
NOYAU_REF : NOYAU_VERITE_V2_4_0
CHANTIER  : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF  : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF : bdb-shell.js v1.4.0
CSS_REF   : cds-overrides.css v1.5.0

TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 2
TRACKER_VIOLATIONS : données partielles (recette après seed.sql)
TRACKER_UPDATED    : 2026-03-21

DELTA v2.0.0 → v2.1.0 :
  Migration bdb-shell.js v1.4.0 complète.
  Suppression offcanvas + header + initAuth() + BDB Header universel (INTERDIT-B1/B2/B3).
  #bdb-shell premier enfant de <main> (INTERDIT-E1).
  escHtml() sur tous les innerHTML avec données DB — 21 appels (INTERDIT-C6).
  DOMPurify sur 2 Quill HTML (description + precautions) — XSS stocké corrigé.
  8 style= inline → classes CSS dans installation-ui.css (INTERDIT-C2).
  Chaîne JS corrigée : Bootstrap avant Supabase SDK (BLOC E).
  spinner-border → placeholder-glow pour états loading (C.9).
  États C.9 complets : loading/empty/error sur grille.
  Bouton admin déplacé dans toolbar filtres (pattern C.6 — INTERDIT-C4).
  Signed URLs réduites : 3600s → 900s (AUDIT S9).
  Terminologie APP_CDT → BDB.
  Bug B3 (initAuth innerHTML null) = RÉSOLU par suppression initAuth.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Migration bdb-shell complète.
                   escHtml 21 points d'injection sécurisés.
                   DOMPurify sur 2 Quill HTML (description + precautions).
                   8 style= inline → CSS.
                   Chaîne JS BLOC E corrigée.
                   spinner-border → placeholder-glow.
                   C.9 loading/empty/error complets.
                   Signed URLs 3600s → 900s.
                   Bug B3 résolu (initAuth supprimé).
                   APP_CDT → BDB.
RESTE À FAIRE    : Recette terrain avec données seed.sql,
                   INSERT app_modules pour ce module (si pas déjà fait),
                   Vérification responsive mobile terrain
VIOLATIONS ACTIVES :
  - Données partielles (recette après seed.sql et saisie terrain)
```

---

## BLOC 4 — CHECKLIST PREMIUM

```
[X] CDS conforme
      Zéro style= statique (sauf category.color — exception tolérée)
      Zéro onclick= inline
      CSS module scopé (.install-* — INTERDIT-17 OK)
      Chaîne CSS BLOC E respectée
      Chaîne JS BLOC E corrigée (Bootstrap avant Supabase)

[X] Documenté
      Ce fichier CTX à jour
      TRACKER_* mis à jour

[X] Résilient
      loadingState / emptyState / errorState présents
      placeholder-glow skeletons
      DOMPurify sur Quill HTML

[X] Navigable
      data-module-title et data-module-icon sur #bdb-shell

[ ] Responsive
      Testé desktop + mobile
```

**État actuel** : `[4/5]`

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct | Statut |
|---|---|---|---|
| Bloc auth dupliqué (offcanvas + header + initAuth) | 80L HTML + 40L JS | bdb-shell.js, window.bdbUser | ✅ Résolu 2026-03-21 |
| Bouton admin dans `#headerActions` via innerHTML | INTERDIT-C4 | Slot admin toolbar filtres (C.6) | ✅ Résolu 2026-03-21 |
| 8× style= inline dans template literals JS | INTERDIT-C2 | Classes CSS install-* | ✅ Résolu 2026-03-21 |
| Chaîne JS Supabase SDK avant Bootstrap JS | BLOC E inversé | Bootstrap JS d'abord | ✅ Résolu 2026-03-21 |
| innerHTML sans escHtml() sur données DB | XSS multiples | escHtml() 21 appels | ✅ Résolu 2026-03-21 |
| Quill HTML rendu sans sanitisation | XSS stocké (desc + prec) | DOMPurify.sanitize() | ✅ Résolu 2026-03-21 |
| spinner-border comme loading state | Obsolète | placeholder-glow skeleton | ✅ Résolu 2026-03-21 |
| #bdb-shell absent du DOM | INTERDIT-E1 | Premier enfant de `<main>` | ✅ Résolu 2026-03-21 |
| Signed URLs 3600s | AUDIT S9 | 900s | ✅ Résolu 2026-03-21 |
| Terminologie APP_CDT | Terme banni | BDB | ✅ Résolu 2026-03-21 |
| Bug B3 initAuth innerHTML null | initAuth ciblait ancien ID | initAuth supprimé | ✅ Résolu 2026-03-21 |
| modalViewLabel via innerHTML | XSS potentiel titre | textContent | ✅ Résolu 2026-03-21 |

---

## BLOC 8 — HISTORIQUE

| Date | Version | Action | Statut |
|------|---------|--------|--------|
| 2026-03-08 | 1.0.0 | Création initiale. | DRAFT |
| 2026-03-15 | 1.1.0 | NOYAU_REF V2.1.0. Bug B3 documenté. | DRAFT |
| 2026-03-16 | 1.2.0 | NOYAU_REF V2_4_0. Bug B3 note migration shell. | DRAFT |
| 2026-03-17 | 2.0.0 | Réécriture CTX TEMPLATE v2.0.0. Audit 880L. Checklist 0/5. | VALIDÉ |
| 2026-03-21 | 2.1.0 | Migration bdb-shell complète. escHtml 21pts. DOMPurify 2 Quill. 8 style=→CSS. Chaîne JS BLOC E. C.9. Signed URLs 900s. Bug B3 résolu. Checklist 4/5. | VALIDÉ |
