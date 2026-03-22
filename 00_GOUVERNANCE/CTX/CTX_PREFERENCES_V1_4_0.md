# CTX — MODULE PREFERENCES

```
VERSION   : 1.4.0
DATE      : 2026-03-21
STATUT    : OPÉRATIONNEL — données partielles (20 lignes à réimporter) · bdb-shell migré
FICHIER   : modules/preferences/index.html
CSS       : ../../css/preferences-ui.css + ../../css/cds-overrides.css
CSS_REF   : chaîne standard BDB (conforme)
NOYAU_REF : NOYAU_VERITE_V2_4_0
TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 2
TRACKER_VIOLATIONS : 20 lignes preferences_chirurgien à réimporter (erreur format array)
TRACKER_UPDATED    : 2026-03-21
DELTA v1.3.0 → v1.4.0 :
  Migration bdb-shell.js v1.4.0 complète.
  Suppression offcanvas + header + initAuth() manuels (INTERDIT-B1/B2/B3).
  #bdb-shell premier enfant de <main> (INTERDIT-E1).
  escHtml() sur tous les innerHTML avec données DB (INTERDIT-C6).
  DOMPurify sur Quill HTML (p.description) — XSS stocké corrigé.
  Zéro style= statique — 5 inline déplacés vers preferences-ui.css (INTERDIT-C2).
  spinner-border → placeholder-glow pour états loading (C.9).
  Bug double class= sur avatar corrigé.
  Terminologie APP_CDT → BDB.
  États C.9 complets : loading/empty/error sur prefsList.
  Bouton admin déplacé dans toolbar filtres (pattern C.6).
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Migration bdb-shell complète.
                   escHtml 9 points d'injection sécurisés.
                   DOMPurify sur Quill HTML.
                   5 style= inline → CSS.
                   spinner-border → placeholder-glow.
                   Bug double class= corrigé.
                   C.9 loading/empty/error complets.
                   APP_CDT → BDB.
RESTE À FAIRE    : Réimporter 20 lignes preferences_chirurgien (procédure fix-csv-arrays.py),
                   INSERT app_modules pour ce module (si pas déjà fait)
VIOLATIONS ACTIVES :
  - 20 lignes preferences_chirurgien non importées (erreur format : JSON array au lieu de PostgreSQL array)
    → procédure : fix-csv-arrays.py → TRUNCATE CASCADE → réimport avec PGCLIENTENCODING=UTF8
```

---

## ROLE

Référentiel des préférences opératoires par chirurgien.
Documente les habitudes, exigences et préférences de chaque chirurgien
pour faciliter la préparation des salles et le travail des IDEs.
Répond directement au blocage terrain STB-02 (NOYAU_VERITE BLOC 1) :
> Préférences chirurgien implicites jamais formalisées.

## PORTÉE

- Liste des préférences par chirurgien
- Filtres par chirurgien, tag, type d'intervention liée
- Liens vers fiches_intervention concernées
- Accès conditionné au rôle (window.bdbUser)
- Deep-link entrant depuis annuaire : `?chirurgien=[id]`

## TABLES SUPABASE

`preferences_chirurgien` · `fiches_intervention` · `profiles_directory`
`tag_links` · `tags`

## ÉTAT DES DONNÉES (2026-03-15)

Table `preferences_chirurgien` (20 lignes) : à réimporter.
Erreur import : tags en format JSON array au lieu de PostgreSQL array.
Procédure : `fix-csv-arrays.py` → `TRUNCATE CASCADE` → réimport avec `PGCLIENTENCODING=UTF8`.

## STACK TECHNIQUE

HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via `window.bdb`
bdb-shell.js v1.4.0 · DOMPurify 3.0.6 · Quill 1.3.7
Zéro localStorage. Zéro onclick. Zéro module ES.

## ANTI-HALLUCINATION

```
- 20 lignes à réimporter — les données existent, elles ne sont pas perdues
- Ne pas conclure que la table est vide sans SELECT COUNT(*) direct
- Les services JS (auth-service.js etc.) n'existent pas
- bdb-shell.js EST branché depuis v1.4.0
- user_roles n'est plus requêté dans ce module — window.bdbUser.isAdmin
```

## VOIX UTILISATEUR

Ce module est consulté par les IDEs avant une intervention — profil P1/P2 possible.
Tout microtexte et message d'état doit respecter la RÈGLE DE VOIX BDB
(PERSONAS_BDB_V1_3_0) — palier P1/P2, phrases ≤ 12 mots.

## AUTORISÉ

- Modifier filtres et affichage
- Ajouter champs depuis tables existantes
- Réimporter les données avec la procédure documentée

## INTERDIT

- Modifier schéma `preferences_chirurgien` sans migration SQL
- CSS inline / JS inline
- Requêter user_roles ou profiles_directory pour l'auth (INTERDIT-B2)
- Qualifier ce module de "premium" avant données réimportées

## DÉPENDANCES

```
ACTIVES :
- js/supabase-client.js (window.bdb)
- js/bdb-shell.js v1.4.0 (window.bdbUser, window.bdbShellReady)
- ../../css/cds-overrides.css
- ../../css/preferences-ui.css
- DOMPurify 3.0.6 (CDN)
- Quill 1.3.7 (CDN)
- Module fiches (interventions liées) — lecture seule
- Module annuaire (deep-link entrant ?chirurgien=[id])
```

---

## BLOC 4 — CHECKLIST PREMIUM

```
[X] CDS conforme
      Zéro style= statique
      Zéro onclick= inline
      CSS module scopé (INTERDIT-17)
      Chaîne CSS BLOC E respectée

[X] Documenté
      Ce fichier CTX à jour
      TRACKER_* mis à jour

[X] Résilient
      loadingState / emptyState / errorState présents
      placeholder-glow skeletons

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
| Bloc auth dupliqué (offcanvas + header + initAuth) | 80L HTML + 40L JS | Supprimer, bdb-shell.js, window.bdbUser | ✅ Résolu 2026-03-21 |
| `style="cursor:pointer"` sur les cards | INTERDIT-C2 | `.pref-card { cursor: pointer }` | ✅ Résolu 2026-03-21 |
| `style="font-size:0.6rem"` sur tags | INTERDIT-C2 | `.pref-tag-type` / `.pref-tag-remove` | ✅ Résolu 2026-03-21 |
| Double attribut `class=` sur avatar | Bug HTML | `.pref-chir-avatar` unique | ✅ Résolu 2026-03-21 |
| innerHTML sans escHtml() sur données DB | 9 points XSS | escHtml() obligatoire (INTERDIT-C6) | ✅ Résolu 2026-03-21 |
| Quill HTML rendu sans sanitisation | XSS stocké | DOMPurify.sanitize() | ✅ Résolu 2026-03-21 |
| spinner-border comme loading state | Obsolète | `.placeholder-glow` skeleton | ✅ Résolu 2026-03-21 |
| Terminologie APP_CDT | Terme banni | BDB | ✅ Résolu 2026-03-21 |

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-08 | 1.0.0 | Création initiale. | Manu + Claude |
| 2026-03-15 | 1.1.0 | NOYAU_REF V2.1.0. Deep-link annuaire. STB-02. | Manu + Claude |
| 2026-03-16 | 1.2.0 | NOYAU_REF V2_4_0. PERSONAS underscore. | Manu + Claude |
| 2026-03-21 | 1.3.0 | Ajout TRACKER_* + BLOC 0. Correction angle mort bdb-shell. | Manu + Claude |
| 2026-03-21 | 1.4.0 | Migration bdb-shell complète. escHtml 9pts. DOMPurify. 5 style= → CSS. C.9 complets. Checklist 4/5. | Manu + Claude |
