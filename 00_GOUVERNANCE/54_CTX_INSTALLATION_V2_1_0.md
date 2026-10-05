# CTX_INSTALLATION.md
```
VERSION   : 2.1.0
DATE      : 2026-03-21
MODULE    : installation
STATUT    : OPÉRATIONNEL — données partielles · bdb-shell migré


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
