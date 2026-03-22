# CTX_TEMPLATE_VIERGE.md
```
VERSION      : 1.0.0
DATE         : 2026-03-20
MODULE       : template-vierge
STATUT       : RÉFÉRENCE — template de départ pour tout nouveau module BDB
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0
CSS_REF      : cds-overrides.css v1.5.0

TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS :
TRACKER_UPDATED    : 2026-03-20
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-20
FAIT             : Création CTX. Tracker corrigé (faux positifs onclick= dans commentaires JS).
RESTE À FAIRE    : Remplacer spinner par skeleton (C.7). Mettre à jour refs v1.3.1 → v1.4.0 dans commentaires.
VIOLATIONS ACTIVES :
  - Aucune (0 error, 0 warning après correction tracker).
VIOLATIONS RÉSOLUES :
  - onclick= : faux positif — 2 occurrences dans commentaires JS, tracker corrigé 2026-03-20
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Template de départ pour tout nouveau module BDB.
  Copier dans modules/[nom-module]/index.html et remplacer 4 variables.
  Fournit la structure HTML, la chaîne CSS/JS, les 3 états UI,
  escHtml(), showToast(), et le squelette CRUD avec délégation.
  Accompagné de 6 fichiers theme-*.html (patterns visuels réutilisables).

PORTEE      :
  Structure HTML conforme CDS.
  Chaîne CSS BLOC E complète. Chaîne JS BLOC E complète.
  3 états UI (loading/empty/error). escHtml(). Toast.
  Pattern CRUD avec délégation (data-action).
  Hors périmètre : logique métier, modales, filtres, pagination.

AUTORISE    :
  Modifier modules/template-vierge/index.html (le template)
  Modifier les 6 fichiers theme-*.html (patterns visuels)
  Ajouter de nouveaux themes

INTERDIT    :
  Interdits fixes (tous les modules) :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Dupliquer le bloc auth (INTERDIT-B1)
  - Requêtes profiles_directory ou user_roles (INTERDIT-B2)
  - Ajouter style= statique (INTERDIT-C2)
  - Ajouter onclick= (délégation addEventListener uniquement)
  Interdits spécifiques :
  - Casser la compatibilité du template (les 4 variables doivent rester)
  - Ajouter une dépendance CDN non documentée dans CHANTIER BLOC D

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.5.0
  Spécifiques :
    Aucune table Supabase (template générique — variable ④ [NOM_TABLE])
    Aucun module BDB lié
```

---

## BLOC 2 — TABLE SUPABASE

```
Pas de table propre — le template utilise la variable ④ [NOM_TABLE].
Chaque module créé depuis ce template définit sa propre table.
```

---

## BLOC 3 — MATRICE D'ACCÈS

N/A — définie par chaque module instancié.

---

## BLOC 4 — CHECKLIST PREMIUM

```
[✅] CDS conforme
      ✅ Zéro onclick= réel (2 faux positifs commentaires JS — tracker corrigé)
      ✅ Zéro style= statique
      ✅ CSS chaîne BLOC E respectée
      ✅ JS chaîne BLOC E respectée
      ✅ escHtml() présent et utilisé dans render()
      ✅ INTERDIT-C6 conforme
      ⚠ Spinner dans loadingState au lieu de skeleton (C.7) — dette mineure

[✅] Documenté
      ✅ CTX v1.0.0 créé
      ✅ TRACKER_* présents

[✅] Résilient
      ✅ 3 états UI : #loadingState / #emptyState / #errorState
      ✅ showState() gère l'affichage exclusif
      ✅ showError() avec message + bouton Réessayer
      ✅ cds-offline-banner si Supabase hors service
      ✅ escHtml() sur toutes données dynamiques

[✅] Navigable
      ✅ #bdb-shell premier enfant de <main>
      ✅ data-module-title et data-module-icon

[⚠ ] Responsive
      ✅ Bootstrap grid
      ⚠ Non vérifié terrain
```

**État actuel** : `[4/5]` — responsive terrain non vérifié

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-TPL-01 : Les 4 variables (①②③④) doivent rester identifiables.
  Ne jamais remplacer les variables dans le template lui-même.
  Le template est la source — les modules instanciés sont les copies.

RÈGLE-TPL-02 : Les 6 themes sont des patterns visuels à copier, pas à modifier en place.
  Si un theme nécessite une évolution → créer un nouveau theme ou une v2.
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur | Correct | Statut |
|---|---|---|---|
| onclick= dans commentaires JS | Le tracker matche `onclick=` dans `//` commentaires | Tracker corrigé : strip `//` et `/* */` avant check | ✅ Résolu 2026-03-20 |
| Spinner au lieu de skeleton | `spinner-border` dans #loadingState | `.placeholder-glow` (C.7) | ⚠ Dette mineure |
| Refs shell v1.3.1 dans commentaires | Commentaires mentionnent v1.3.1 | Mettre à jour → v1.4.0 | ⚠ Dette mineure |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : template-vierge
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/template-vierge/index.html · modules/template-vierge/theme-*.html
FICHIERS HORS SCOPE : js/bdb-shell.js · js/supabase-client.js · css/cds-overrides.css

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker
  [ ] Ce fichier CTX_TEMPLATE_VIERGE
  [ ] Le(s) fichier(s) source du module

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS_V1_10_0.md
  [ ] CHANTIER_TECHNIQUE_V1_0_6.md
  [ ] Ce fichier CTX_TEMPLATE_VIERGE

Si un champ est vide → ne pas commencer.
```

---

## BLOC 8 — RÈGLE DE CLÔTURE (obligatoire)

En fin de chaque session sur ce module, l'IA DOIT :

```
1. Mettre à jour BLOC 0 (état courant — fait / reste / violations)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour BLOC 4 (checklist premium)
4. Inscrire dans JOURNAL_DECISIONS toute décision validée
5. Incrémenter VERSION de ce fichier
```

**Si une de ces étapes est omise → le prochain Claude travaille sur un CTX périmé.**
**Le tracker détectera l'écart et le signalera dans SESSION_STATE.md.**

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-20 | 1.0.0 | Création CTX depuis TEMPLATE_CTX_MODULE_V1_2_0. Audit : 0 violation réelle (2 faux positifs onclick= dans commentaires JS → tracker corrigé). Dettes mineures documentées (spinner, refs v1.3.1). | Manu + Claude |
