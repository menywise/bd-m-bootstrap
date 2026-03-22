# CTX — MODULE TRANSMISSIONS

```
VERSION   : 1.4.0
DATE      : 2026-03-21
STATUT    : MIGRÉ — bdb-shell branché · CDS conforme · B2 à résoudre · données à réimporter
FICHIER   : modules/transmissions/index.html
CSS       : ../../css/transmissions-ui.css + ../../css/cds-overrides.css
CSS_REF   : chaîne standard BDB (conforme v2.0.0)
NOYAU_REF : NOYAU_VERITE_V2_4_0
TRACKER_STATUS     : migré
TRACKER_SHELL      : oui
TRACKER_PALIER     : 3
TRACKER_VIOLATIONS : Bug B2 actif (GET /tags → 400), 4 lignes transmissions à réimporter
TRACKER_UPDATED    : 2026-03-21
DELTA v1.3.0 → v1.4.0 :
  Migration complète bdb-shell.js (A1-A6 résolus).
  Offcanvas + header hardcodés supprimés.
  initAuth() local + bloc BDB Header universel supprimés.
  window.bdbShellReady + window.bdbUser = sources uniques.
  Chaîne JS corrigée (Bootstrap avant Supabase — B1).
  Violations CDS corrigées (C1-C5) : style= inline → classes CSS.
  trans-avatar-circle ajouté à transmissions-ui.css.
  trans-img-preview complété (dimensions + object-fit).
  Sécurité : createSignedUrl 3600 → 900 (D1).
  Sécurité : DOMPurify CDN ajouté (D2).
  Sécurité : sanitizeHtml() homemade → DOMPurify.sanitize() (D3).
  UX : skeleton loader (remplace spinner-border — E1).
  UX : modale Bootstrap archive/delete (remplace confirm() natif — E2).
  UX : slot admin dans toolbar DOM, masqué par défaut (pattern C.6 — E3).
  escHtml() appliqué sur toutes les données DB injectées dans innerHTML.
  Bug B2 et réimport données : hors scope cette session — violations documentées.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Migration complète bdb-shell.js v1.3.1.
                   Suppression offcanvas + header hardcodés (A1/A2).
                   Ajout #bdb-shell premier enfant de <main> (A3).
                   bdb-shell.js ajouté à la chaîne JS (A4).
                   initAuth() local supprimé → window.bdbShellReady (A5).
                   Bloc BDB Header universel supprimé (A6).
                   Chaîne JS : Bootstrap avant Supabase (B1).
                   style= inline → classes CSS : trans-avatar-circle,
                     cds-clickable, trans-detail-img, trans-img-preview,
                     trans-img-remove (C1-C5).
                   transmissions-ui.css : ajout trans-avatar-circle,
                     dimensions trans-img-preview.
                   createSignedUrl : 3600 → 900 (D1).
                   DOMPurify CDN ajouté (D2).
                   sanitizeHtml() homemade → DOMPurify.sanitize() (D3).
                   Skeleton loader (E1). Modale Bootstrap confirm (E2).
                   Slot admin toolbar pattern C.6 (E3).
                   escHtml() sur toutes données DB → innerHTML.
                   Module qualifié : MIGRÉ.

RESTE À FAIRE    : Bug B2 — GET /tags → 400 (colonne type à vérifier cloud vs local)
                   Réimport 4 lignes transmissions (fix-csv-arrays.py)
                   INSERT app_modules pour ce module (navigation dynamique)
                   Vérification terrain : console Chrome — aucun 400 résiduel

VIOLATIONS ACTIVES :
  - Bug B2 : GET /rest/v1/tags?type=in.(...) → 400
    Cause probable : colonne `type` absente ou renommée dans tags (cloud).
    Investigation : SELECT column_name FROM information_schema.columns
                    WHERE table_name='tags' — comparer local vs cloud.
    Impact : sélecteur de tags inopérant en saisie de transmission.
  - 4 lignes transmissions non importées (erreur format array)
    Procédure : fix-csv-arrays.py → TRUNCATE CASCADE → réimport PGCLIENTENCODING=UTF8
```

---

## ROLE

Journal des transmissions du bloc opératoire.
Permet de saisir, consulter et partager les informations de passation entre équipes
(matin → après-midi → soir, garde → entrant).
Mémoire opérationnelle du bloc.

---

## PORTÉE

- Liste des transmissions avec filtres (statut, catégorie, type, priorité, recherche)
- Saisie d'une transmission : titre, contenu Quill, images (max 3), tags (max 5)
- Consultation détail : modal avec signed URLs, contenu sanitisé DOMPurify
- Archive / suppression douce (soft delete — restaurable admin)
- Statistiques live : actives, prioritaires, essentielles, archivées
- Slot admin dans toolbar (pattern C.6) — visible si isApproved

---

## TABLES SUPABASE

`transmissions` · `categories` · `content_images` · `content_types`
`profiles_directory` · `tag_links` · `tags`

---

## RLS — POLITIQUE SELECT ACTIVE (D-2026-03-20-T09)

Politique `transmissions_select_published` (remplace `transmissions_select_approved`) :

```sql
USING (
  (status = 'published' AND is_approved())
  OR user_id = auth.uid()
  OR is_admin()
)
```

Logique :
- `published` → visible par tout membre approuvé
- `draft` → visible par l'auteur uniquement + admin
- Admin voit tout

⚠ Dette future documentée (D-2026-03-20-T09) :
Version beta admin (local) qui ne pollue pas la prod — arbitrage session dédiée.

---

## CHECKLIST PREMIUM (post-session 2026-03-21)

```
[✅] CDS conforme
      Zéro style= statique (hors couleurs dynamiques Supabase D-2026-03-15-T04
        et valeurs fixes skeleton documentées)
      Zéro onclick= dans le HTML (addEventListener uniquement)
      Chaîne CSS dans l'ordre obligatoire (BLOC E)
      Chaîne JS dans l'ordre obligatoire (Bootstrap avant Supabase)
      bdb-shell.js branché — window.bdbUser source unique
      escHtml() sur toutes données DB injectées dans innerHTML
      DOMPurify.sanitize() sur contenu Quill

[✅] Documenté
      CTX v1.4.0 à jour — TRACKER_* renseignés

[✅] Résilient
      Skeleton loader dans loadTransmissions()
      cdsShowGridError() avec bouton Réessayer
      3 états UI présents (loading/skeleton · empty · error)

[✅] Navigable
      #bdb-shell premier enfant de <main>
      data-module-title="Transmissions" data-module-icon="bi-arrow-left-right"

[✅] Responsive
      Toolbar responsive (col-12 col-md-*)
      Cards responsive (flex, gap)
      À valider terrain : mobile touch

[⚠️] Bug B2 non résolu (tags → 400) — bloque sélecteur tags en saisie
[⚠️] 4 lignes transmissions manquantes
```

**État premium : 4/5 — non qualifiable "premium" avant résolution B2**

---

## STACK TECHNIQUE

HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via `window.bdb`
bdb-shell.js v1.3.1 · Quill 1.3.7 · DOMPurify 3.0.6
Zéro localStorage. Zéro onclick=. Zéro module ES.

---

## ANTI-HALLUCINATION

```
- Bug B2 : ne pas qualifier comme résolu sans vérification console Chrome (INTERDIT-18)
- Bug typo content-images/content_images : ne pas corriger sans test DB
- Les services JS (auth-service.js etc.) n'existent pas
- 4 lignes à réimporter — les données existent, elles ne sont pas perdues
- bdb-shell.js v1.3.1 est branché depuis la session 2026-03-21
  Ne PAS supposer qu'il est absent — il est présent
- La politique RLS SELECT a été modifiée en D-2026-03-20-T09 — ne pas appliquer l'ancienne
- confirm() natif a été remplacé par modale Bootstrap — ne pas le réintroduire
- sanitizeHtml() homemade a été supprimée — DOMPurify.sanitize() est la référence
```

---

## VOIX UTILISATEUR

Ce module est le plus utilisé au quotidien par P2 "Je n'ose pas".
Il est leur outil de communication implicite.
Tout microtexte, placeholder de saisie, message d'erreur doit être
calibré pour P2 — phrases ≤ 12 mots, ton rassurant, zéro jargon.
Consulter PERSONAS_BDB_V1_3_0 section P2 avant toute modification éditoriale.

---

## AUTORISÉ

- Modifier filtres, affichage, saisie
- Ajouter champs depuis tables existantes
- Investiguer Bug B2 (colonne type dans tags — comparer cloud vs local)
- Réimporter 4 lignes transmissions (fix-csv-arrays.py)
- INSERT app_modules pour navigation dynamique

## INTERDIT

- Modifier schéma `transmissions` sans migration SQL
- "Corriger" content-images/content_images sans test DB
- CSS inline / JS inline (style= / onclick=)
- Qualifier B2 comme résolu sans test en console Chrome live
- Réintroduire confirm() natif (remplacé par modale Bootstrap)
- Réintroduire sanitizeHtml() homemade (remplacée par DOMPurify)
- Appliquer l'ancienne politique RLS SELECT (remplacée — D-2026-03-20-T09)
- Qualifier ce module de "premium" avant résolution B2

---

## DÉPENDANCES

```
ACTIVES :
  js/supabase-client.js   → window.bdb (client Supabase)
  js/bdb-shell.js v1.3.1  → window.bdbUser, window.bdbShellReady,
                             offcanvas, header (branché 2026-03-21)
  ../../css/cds-overrides.css
  ../../css/transmissions-ui.css (v2.0.0 — trans-avatar-circle ajouté)
  CDN DOMPurify 3.0.6
  CDN Quill 1.3.7
  Portail index.html (stats live)

MANQUANTES (VIOLATIONS RÉSIDUELLES) :
  INSERT app_modules → navigation dynamique bdb-shell v1.4.0 (non bloquant en v1.3.1)
```

---

## HISTORIQUE

```
2026-03-08 — v1.0.0  Création initiale.
2026-03-15 — v1.1.0  NOYAU_REF V2.1.0. Bug B2 formalisé. Voix P2. Anti-hallucination.
2026-03-16 — v1.2.0  NOYAU_REF V2_4_0. PERSONAS underscore.
2026-03-21 — v1.3.0  Ajout TRACKER_* + BLOC 0. Correction angle mort bdb-shell.
                      Synchronisation RLS SELECT (D-2026-03-20-T09).
2026-03-21 — v1.4.0  Migration complète bdb-shell.js (A1-A6).
                      Corrections CDS (C1-C5), sécurité (D1-D3), UX (E1-E3).
                      transmissions-ui.css mis à jour (trans-avatar-circle,
                      trans-img-preview dimensions).
                      TRACKER_STATUS : à_faire → migré.
                      TRACKER_SHELL : non → oui.
                      TRACKER_PALIER : 1 → 3.
                      Violations résiduelles : B2 + réimport données.
```
