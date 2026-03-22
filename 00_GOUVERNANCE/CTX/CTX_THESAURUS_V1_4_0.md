# CTX — MODULE THESAURUS

```
VERSION  : 1.4.0
DATE     : 2026-03-21
STATUT   : OPÉRATIONNEL — MIGRATION SUPABASE VALIDÉE (Phase 1 — assets SQL disponibles, non exécutés)
FICHIER  : modules/thesaurus/index.html
CSS      : ../../css/thesaurus-ui.css (À CRÉER) + ../../css/cds-overrides.css
CSS_REF  : chaîne standard BDB (non conforme actuellement — bdb-shell absent, CSS module manquant)
NOYAU_REF: NOYAU_VERITE_V2_4_0
TRACKER_STATUS     : à_faire
TRACKER_SHELL      : non
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : bdb-shell absent, thesaurus-ui.css manquant, DATA const inline (70 361 lignes dans le HTML), migration SQL non exécutée (assets disponibles)
TRACKER_UPDATED    : 2026-03-21
DELTA v1.3.0 → v1.4.0 :
  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
  Correction angle mort documentaire : bdb-shell absent non documenté dans v1.3.0.
  bdb-shell ajouté aux VIOLATIONS ACTIVES, DÉPENDANCES et INTERDIT.
  DATA inline classée VIOLATION ACTIVE (non classifiée comme telle dans v1.3.0).
  thesaurus-ui.css manquant classé VIOLATION ACTIVE.
  CSS_REF ajouté à l'en-tête.
  Recadrage : bdb-shell obligatoire sur tous les modules sans exception.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* — mise à niveau TEMPLATE V1.2.0.
                   Correction angles morts : bdb-shell et DATA inline non classifiés
                   comme violations dans v1.3.0 — corrigé.
RESTE À FAIRE    : Créer thesaurus-ui.css,
                   brancher bdb-shell.js v1.4.0 (navigation dynamique app_modules),
                   exécuter migration SQL (thesaurus_schema.sql + thesaurus_interventions.sql
                   + thesaurus_protocoles.sql) dans 02_INFRASTRUCTURE\SUPABASE\,
                   remplacer DATA const inline par requêtes window.bdb.from(),
                   INSERT app_modules pour ce module
VIOLATIONS ACTIVES :
  - bdb-shell.js absent → brancher v1.4.0 (navigation dynamique app_modules) — obligatoire sans exception
  - thesaurus-ui.css manquant → créer css/thesaurus-ui.css (chaîne CDS incomplète)
  - DATA const inline (70 361 interventions embarquées dans le HTML) → migration Supabase Phase 1
  - Migration SQL non exécutée (assets disponibles dans 02_INFRASTRUCTURE\SUPABASE\)
    → thesaurus_schema.sql · thesaurus_interventions.sql · thesaurus_protocoles.sql
```

---

## ROLE

Référentiel statistique des protocoles opératoires du bloc Ortho-Neurochirurgie.
420 protocoles · 70 361 interventions · données 2006–2026.

Outil de recherche et de consultation — pas d'écriture utilisateur.

---

## PORTÉE

- Recherche dans 70 361 interventions par code CCAM, libellé, spécialité
- Consultation des 420 protocoles
- Filtres par spécialité, chirurgien
- Données figées validées terrain — ne jamais dégrader

---

## STACK TECHNIQUE ACTUELLE (dette — migration Phase 1 obligatoire)

HTML/JS vanilla · Bootstrap 5.3.2 · DATA const inline (embarquées dans le HTML)
Zéro module ES. Zéro localStorage.
DATA inline = dette d'architecture — 70 361 lignes dans le HTML = non conforme.

---

## MIGRATION SUPABASE — PHASE 1 (VALIDÉE — D-2026-03-13-001)

Assets SQL disponibles dans 02_INFRASTRUCTURE\SUPABASE\ :
- `thesaurus_schema.sql`
- `thesaurus_interventions.sql`
- `thesaurus_protocoles.sql`

Tables cibles :
```
thesaurus_interventions : id · code_ccam · libelle · specialite · protocole_id · ...
thesaurus_protocoles    : id · title · specialite · created_at
```

Procédure : appliquer les migrations SQL AVANT de toucher au code front.
Volume : 70 361 lignes interventions · 420 lignes protocoles.
Risque : MOYEN — données figées, pas d'écriture utilisateur.

Ordre migration Phase 1 : organisateur → paxis → collab → disc → dork → **thesaurus**

---

## ANTI-HALLUCINATION

```
- Les données thesaurus sont figées et validées terrain
  Ne jamais les modifier, normaliser ou dégrader
- Les 70 361 interventions sont dans une const inline dans le HTML actuel
  Après migration : dans Supabase (thesaurus_interventions)
- Ne pas créer de logique d'écriture utilisateur (module lecture seule)
- Les services JS (auth-service.js etc.) n'existent pas
- bdb-shell.js est absent de ce module — ne pas supposer qu'il est branché
```

---

## VOIX UTILISATEUR

Ce module est utilisé par P1 (recherche de nomenclature inconnue)
et P5 (vérification de données avant d'adopter BDB).
Résultats de recherche : libellés clairs, sans acronyme non défini.
Consulter PERSONAS_BDB_V1_3_0 pour tout nouveau contenu éditorial.

---

## AUTORISÉ

- Modifier filtres et affichage de recherche
- Appliquer la migration SQL (schéma + données)
- Créer thesaurus-ui.css
- Brancher bdb-shell.js v1.4.0 (navigation dynamique app_modules)

## INTERDIT

- Modifier les données terrain figées (70 361 interventions, 420 protocoles)
- Créer une logique d'écriture utilisateur sur ce module
- CSS inline
- Ajouter de nouveaux onclick=
- Supposer bdb-shell branché avant confirmation terrain
- Qualifier ce module de "premium" avant bdb-shell branché, CSS créé et migration exécutée

---

## DÉPENDANCES

```
ACTIVES :
- Bootstrap 5.3.2 (CDN jsdelivr)
- Bootstrap Icons 1.11.1 (CDN jsdelivr)
- ../../css/cds-overrides.css (local)

MANQUANTES (VIOLATIONS) :
- js/bdb-shell.js v1.4.0 → à brancher (navigation dynamique app_modules)
- ../../css/thesaurus-ui.css → à créer

CIBLES (post-migration Phase 1) :
- js/supabase-client.js (window.bdb) — requêtes thesaurus_interventions + thesaurus_protocoles
```

---

## HISTORIQUE

```
2026-03-13 — v1.1.0  Suppression clause "standalone délibéré". Migration validée D-001.
2026-03-15 — v1.2.0  NOYAU_REF V2.1.0. Anti-hallucination. État migration. Voix P1/P5.
2026-03-16 — v1.3.0  NOYAU_REF V2_4_0. PERSONAS underscore.
2026-03-21 — v1.4.0  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
                      Correction angle mort : bdb-shell absent non documenté (v1.3.0).
                      DATA inline classée VIOLATION ACTIVE (non classifiée dans v1.3.0).
                      thesaurus-ui.css manquant classé VIOLATION ACTIVE.
                      CSS_REF ajouté. Anti-hallucination : ligne bdb-shell ajoutée.
                      Recadrage : bdb-shell obligatoire sans exception.
```
