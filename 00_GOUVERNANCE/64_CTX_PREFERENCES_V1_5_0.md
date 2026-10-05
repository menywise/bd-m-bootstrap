# CTX — MODULE PREFERENCES

```
VERSION   : 1.5.0
DATE      : 2026-04-12
STATUT    : OPÉRATIONNEL V3 — PREF_SCHEMA V2 · 14 sections · pref_referentiels
FICHIER   : modules/preferences/index.html
JS        : modules/preferences/preferences-app.js
CSS       : modules/preferences/preferences-ui.css + ../../css/cds-overrides.css
ADMIN     : modules/admin/ → onglet Préférences → admin-preferences-app.js
SAISIE    : modules/preferences/saisie-invite.html (session collective — mode invité)
CSS_REF   : chaîne standard BDB (conforme)
TRACKER_STATUS     : opérationnel
TRACKER_SHELL      : oui
TRACKER_PALIER     : 3
TRACKER_VIOLATIONS : aucune violation active
TRACKER_UPDATED    : 2026-04-12
DELTA v1.4.0 → v1.5.0 :
  PREF_SCHEMA V2 complet (v:2, 14 catégories JSONB ouvert).
  Table pref_referentiels — listes L2 admin-configurables (migration 146).
  Colonnes scope : scope_level · scope_secteur · scope_type sur preferences_chirurgien.
  Colonne protocole_id uuid FK → thesaurus_protocoles (migration 143).
  14 sections accordion (installation · garrot · pulsavac · ampli · BE · ciment ·
    équipement · sutures · pansement · attelle · anapath · infiltration · notes · tags).
  Drag-and-drop sections (admin uniquement) — pattern identique organisateur-app.js.
  Scope 4 niveaux : global → secteur → type_chirurgie → protocole.
  Listes dynamiques chargées depuis pref_referentiels au init (loadReferentiels()).
  Fallback V1 : si v<2, description Quill affichée en lecture.
  saisie-invite.html : page autonome sans auth pour session collective terrain.
  Migration 145 : RLS anon temporaire — à révoquer post-session collective.
  admin-preferences-app.js : gestion admin co-localisée (brouillons · toutes · référentiels).
  admin/index.html : onglet Préférences ajouté, pattern admin-[module]-app.js établi.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.

---

## BLOC 0 — ÉTAT COURANT

```
DERNIÈRE SESSION : S#82 — 2026-04-12
FAIT :
  - PREF_SCHEMA V2 : 14 catégories JSONB (v:2), fallback V1 description
  - Table pref_referentiels (migration 146) : ~70 valeurs seed L1
  - Colonnes scope sur preferences_chirurgien (migration 143 + 146)
  - preferences-app.js V3 : chargement refs dynamique, buildSelects(), parsePref()
  - index.html V3 : accordion 14 sections, drag-and-drop admin, scope selector
  - preferences-ui.css V3 : classes acc-item, ipills, be-tabs, sut-row, drag, pref-view
  - saisie-invite.html : autonome /bdb/js/supabase-client.js, mode anon, écran succès
  - Migration 145 RLS anon (session collective) : anon_read_medecins + anon_insert_prefs_draft
  - admin-preferences-app.js : IIFE, 3 pills (brouillons / toutes / référentiels)
  - admin/index.html + admin-app.js : onglet Préférences, pattern fichier admin co-localisé

RESTE À FAIRE :
  - Exécuter migration 146 en SQL Editor Supabase (si pas encore fait)
  - ROLLBACK migration 145 post-session collective (2 DROP POLICY)
  - Valider brouillons session collective (admin Olivia → onglet Préférences)
  - Back-office admin pref_referentiels : réordonnancement par drag (session dédiée)
  - Liaison préférence ↔ transmission (session dédiée)

VIOLATIONS ACTIVES : aucune
```

---

## ROLE

Référentiel des préférences opératoires par chirurgien.
Documente les habitudes, exigences et préférences de chaque chirurgien
pour faciliter la préparation des salles et le travail des IBODEs.
Répond directement au blocage terrain STB-02 :
> Préférences chirurgien implicites, jamais formalisées.

---

## PORTÉE

- Liste des préférences par chirurgien (filtrables par chirurgien / portée)
- Scope 4 niveaux : global → par secteur → par type → par protocole
- Création / modification par chirurgien (ses propres prefs) ou admin (toutes)
- Brouillons (`is_dev=true`) invisibles aux membres — validation admin requise
- Deep-link entrant depuis annuaire : `?chirurgien=[id]`
- Consultation hors OR uniquement — jamais per-opératoire

---

## TABLES SUPABASE

```
preferences_chirurgien   — préférences par chirurgien (L2)
pref_referentiels        — listes configurables par admin (L2, migration 146)
profiles_directory       — chirurgiens (SELECT uniquement, via RLS)
thesaurus_protocoles     — protocoles liés (FK protocole_id)
tag_links · tags         — tags associés
```

---

## PREF_SCHEMA V2

```json
{
  "v": 2,
  "scope": { "level": "global|secteur|type|protocole", "secteur": null, "type": null },
  "installation": {
    "table": null, "decubitus": null, "position": [], "appuis": [],
    "gelose": false, "gelose_position": null, "gelose_taille": null
  },
  "garrot": { "present": false, "position": null, "pression_mmhg": null, "duree_min": null },
  "pulsavac": false,
  "ampli_brillance": { "present": false, "position": null, "pedale": false },
  "bistouri_electrique": {
    "present": false, "position": null, "modele": null,
    "coupe_w": 80, "coupe_mode": "Mixte",
    "coag_w": 80, "coag_mode": "Fulgurant",
    "bipolaire_present": false, "bipolaire_w": 15, "bipolaire_mode": "Automatique"
  },
  "ciment": { "present": false, "nom": null, "melangeur": null },
  "equipement_chirurgien": {
    "gants_1_taille": null, "gants_1_modele": null,
    "gants_2_present": false, "gants_2_taille": null, "gants_2_modele": null,
    "casaque_type": null, "casaque_taille": null, "casque": false
  },
  "fermeture": { "sutures": [], "agrafe": false, "agrafe_modele": null, "allergie": null },
  "pansement": { "present": false, "type": null },
  "attelle": { "present": false, "modele": null },
  "anapath": false,
  "infiltration": { "molecule": null, "dose": null, "timing": null },
  "notes": ""
}
```

Sutures — format objet dans le tableau `fermeture.sutures` :
```json
{ "plan": "Profond", "type": "Vicryl", "taille": "0", "mode": "Points séparés", "ref": "" }
```

Compatibilité : si `v < 2` → `parsePref()` retourne le schéma V2 vide ; `description` Quill affiché en lecture.

---

## CATÉGORIES pref_referentiels

| categorie | Usage |
|---|---|
| `table_op` | Table opératoire |
| `decubitus` | Décubitus |
| `position_install` | Position/installation (pills) |
| `appui` | Appuis (checkboxes) |
| `garrot_position` | Position garrot sur le membre |
| `pos_salle` | Position dans la salle (équipements) |
| `gelose_position` | Gélose — position |
| `gelose_taille` | Gélose — taille |
| `be_modele` | Bistouri — modèle |
| `be_mode_coupe` | Bistouri — mode coupe |
| `be_mode_coag` | Bistouri — mode coagulation |
| `be_mode_bipo` | Bistouri — mode bipolaire |
| `ciment_nom` | Ciment — nom commercial |
| `ciment_melangeur` | Ciment — mélangeur |
| `gants_modele` | Gants — modèle |
| `casaque_type` | Casaque — type |
| `agrafe_modele` | Agrafes — modèle |
| `pansement` | Pansement |
| `attelle` | Attelle |
| `secteur` | Secteur (scope) |
| `type_chirurgie` | Type de chirurgie (scope) |

---

## STACK TECHNIQUE

```
HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via window.bdb
bdb-shell.js v1.4.0 · DOMPurify 3.0.6 · Quill 1.3.7
Zéro localStorage · Zéro onclick · Zéro module ES
```

---

## FICHIERS

```
modules/preferences/
  index.html                  ← module membre (accordion 14 sections)
  preferences-app.js          ← JS V3 (loadReferentiels, parsePref, PREF_SCHEMA V2)
  preferences-ui.css          ← CSS V3 (drag, be-tabs, sut-row, ipills, pref-view)
  saisie-invite.html          ← session collective mode invité (anon)

modules/admin/
  index.html                  ← onglet Préférences ajouté
  admin-app.js                ← handler key==='preferences' → initPreferencesAdmin()
  admin-preferences-app.js    ← IIFE, 3 pills : brouillons / toutes / référentiels
```

---

## RBAC

| Rôle | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| anon | medecins actifs uniquement (session collective) | brouillons is_dev=true | — |
| membre | prefs publiées (is_dev=false) | ses propres | ses propres |
| admin | toutes | toutes | toutes |

RLS anon : migration 145 — temporaire, à révoquer post-session collective.

---

## ANTI-HALLUCINATION

```
- Ne jamais inventer une colonne sans vérifier information_schema
- pref_referentiels existe depuis migration 146
- protocole_id existe depuis migration 143
- scope_level · scope_secteur · scope_type existent depuis migration 146
- Les colonnes tags text[] et fiche_intervention_id sont présentes mais non utilisées en V3
- saisie-invite.html utilise /bdb/js/supabase-client.js (chemin absolu OVH)
- admin-preferences-app.js est un IIFE — pas de DOMContentLoaded propre
- window.initPreferencesAdmin est exposé globalement pour admin-app.js
```

---

## VOIX UTILISATEUR

Module consulté par IBODEs avant intervention — profil P1/P2.
Wording : phrases ≤ 12 mots, zéro formulation négative (CONV-UX-WORDING-01).
Messages d'erreur : "La connexion n'a pu aboutir — réessayez dans un instant."
Confirmation suppression : "Retirer définitivement cette préférence ?"

---

## AUTORISÉ

- Modifier filtres, affichage, ordre des sections
- Ajouter catégories dans pref_referentiels via admin
- Réordonner sections (drag-and-drop admin)
- Lier une préférence à un protocole via scope = protocole

## INTERDIT

- Modifier schéma preferences_chirurgien sans migration SQL
- CSS inline / JS inline (INTERDIT-C2 / INTERDIT-JS-01)
- Requêter profiles_directory pour l'auth (INTERDIT-B2)
- Qualifier ce module de "per-opératoire" — BDB est hors OR uniquement
- Laisser migration 145 RLS anon active en dehors des sessions collectives

---

## DÉPENDANCES

```
ACTIVES :
  js/supabase-client.js (window.bdb)
  js/bdb-shell.js v1.4.0 (window.bdbUser, window.bdbShellReady)
  js/bdb-invite-guard.js
  js/bdb-ui.js
  css/cds-overrides.css
  modules/preferences/preferences-ui.css
  DOMPurify 3.0.6 (CDN)
  Quill 1.3.7 (CDN)

MODULES LIÉS :
  thesaurus (deep-link protocole)
  annuaire (deep-link entrant ?chirurgien=[id])
  admin (gestion brouillons + référentiels)
```

---

## SESSIONS À PLANIFIER

```
- Back-office référentiels : réordonnancement drag-and-drop persisté (pref_referentiels.ordre)
- Liaison préférence ↔ transmission (pont inter-modules)
- Export PDF préférences chirurgien (format imprimable)
```

---

## BLOC 4 — CHECKLIST PREMIUM

```
[X] CDS conforme
      Zéro style= statique
      Zéro onclick= inline
      escHtml() sur tous les innerHTML DB (INTERDIT-C6)
      DOMPurify sur contenu Quill
      CSS module scopé (INTERDIT-17)
      Chaîne CSS BLOC E respectée

[X] Documenté
      CTX à jour (ce fichier)
      DATA_MODEL V1.21.0 mis à jour

[X] Résilient
      loadingState / emptyState / errorState (C.9) sur prefsList
      placeholder-glow skeletons

[X] Navigable
      data-module-title et data-module-icon sur #bdb-shell
      Deep-link ?chirurgien=[id] fonctionnel

[X] Responsive
      accordion mobile-first
      sut-row grid responsive
      saisie-invite.html testé mobile
```

**État actuel** : `[5/5]`

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Statut |
|---|---|
| Bloc auth dupliqué (offcanvas + initAuth) | ✅ Résolu v1.4.0 |
| style= inline | ✅ Résolu v1.4.0 |
| innerHTML sans escHtml() | ✅ Résolu v1.4.0 |
| Quill HTML sans DOMPurify | ✅ Résolu v1.4.0 |
| Listes hardcodées dans le HTML | ✅ Résolu v1.5.0 — pref_referentiels |
| PREF_SCHEMA V1 incomplet (gants/casaque only) | ✅ Résolu v1.5.0 — 14 sections |
| Pas de scope sur les préférences | ✅ Résolu v1.5.0 — 4 niveaux |
| Admin inline dans index.html | ✅ Résolu v1.5.0 — admin-preferences-app.js |

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-08 | 1.0.0 | Création initiale. | Manu + Claude |
| 2026-03-15 | 1.1.0 | Deep-link annuaire. STB-02. | Manu + Claude |
| 2026-03-16 | 1.2.0 | NOYAU_REF V2_4_0. PERSONAS underscore. | Manu + Claude |
| 2026-03-21 | 1.3.0 | TRACKER_* + BLOC 0. Correction bdb-shell. | Manu + Claude |
| 2026-03-21 | 1.4.0 | bdb-shell complet. escHtml 9pts. DOMPurify. C.9. | Manu + Claude |
| 2026-04-12 | 1.5.0 | V3 complet : PREF_SCHEMA V2, 14 sections, pref_referentiels (migration 146), scope 4 niveaux, drag-and-drop admin, saisie-invite.html, admin-preferences-app.js. S#82. | Manu + Claude |
