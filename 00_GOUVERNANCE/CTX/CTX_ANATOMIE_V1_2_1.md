# CTX — MODULE ANATOMIE

```
VERSION   : 1.2.1
DATE      : 2026-03-21
STATUT    : OPÉRATIONNEL — données partielles (1 ligne importée)
FICHIER   : modules/anatomie/index.html
CSS       : ../../css/anatomie-ui.css + ../../css/cds-overrides.css
NOYAU_REF : NOYAU_VERITE_V2_4_0
DELTA v1.2.0 → v1.2.1 :
  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.

TRACKER_STATUS     : en_cours
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : aucune_détectée
TRACKER_UPDATED    : 2026-03-21
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
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0
RESTE À FAIRE    : Réimport CSV table anatomie (PGCLIENTENCODING=UTF8)
                   Procédure : TRUNCATE anatomie CASCADE → réimport
                   Passage en format CTX BLOC 1-9 (prochaine session dédiée)
VIOLATIONS ACTIVES :
  Aucune violation code détectée (absent des priorités SESSION_STATE 2026-03-21).
  ⚠ Format CTX pré-template V1.2.0 — structure BLOC 1-9 non encore appliquée.
     À migrer lors d'une session dédiée.
VIOLATIONS RÉSOLUES :
  - bdb-shell.js v1.4.0 migré — 2026-03-15 (D-2026-03-15-T09)
```

---

## ROLE

Référentiel anatomique du bloc Ortho-Neurochirurgie.
Contenu pédagogique lié aux zones anatomiques opérées.
Associé aux fiches d'intervention via tags et catégories.

## PORTÉE

- Affichage des contenus anatomiques par zone
- Filtres par catégorie, tag, type de contenu
- Images associées (content_images)
- Lien vers fiches d'intervention concernées

## TABLES SUPABASE

`anatomie` · `categories` · `content_images` · `content_types` · `profiles_directory`
`tag_links` · `tags` · `user_roles`

## ÉTAT DES DONNÉES (2026-03-15)

Table `anatomie` : 1 ligne importée.
Import Phase 1 à finaliser : réimporter le CSV avec PGCLIENTENCODING=UTF8.
Procédure : `TRUNCATE anatomie CASCADE` → réimport avec PGCLIENTENCODING=UTF8.

## STACK TECHNIQUE

HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via `window.bdb`
bdb-shell.js v1.4.0 migré ✅ (D-2026-03-15-T09)
Zéro localStorage. Zéro onclick. Zéro module ES.

## ANTI-HALLUCINATION

```
- Table anatomie a 1 ligne réelle en base — données partielles, pas absentes
- Ne pas conclure que les données n'existent pas si COUNT semble faible
  (pg_stat_user_tables a un cache non fiable — vérifier SELECT COUNT(*) direct)
- Les services JS (auth-service.js etc.) n'existent pas
- Bug typo content-images/content_images : ne pas corriger sans test DB
```

## VOIX UTILISATEUR

Ce module est visible par les membres. Voix BLEU rassurant.
Consulter PERSONAS_BDB_V1_3_0 pour tout nouveau contenu éditorial.

## AUTORISÉ

- Modifier filtres et affichage
- Ajouter liens vers fiches_intervention
- Réimporter les données avec la procédure documentée

## INTERDIT

- Modifier le schéma de la table anatomie sans migration SQL
- CSS inline / JS inline
- "Corriger" content-images/content_images sans test DB

## DÉPENDANCES

- `js/supabase-client.js` (window.bdb)
- `js/bdb-shell.js` (window.bdbUser — via bdb-shell v1.4.0)
- `../../css/cds-overrides.css`
- `../../css/anatomie-ui.css`
- Module `fiches` (liens vers interventions) — lecture seule depuis anatomie

## HISTORIQUE

```
2026-03-08 — v1.0.0  Création initiale.
2026-03-15 — v1.1.0  NOYAU_REF V2.1.0. Anti-hallucination. Procédure réimport.
2026-03-16 — v1.2.0  NOYAU_REF V2_4_0. PERSONAS underscore. bdb-shell v1.4.0 noté.
2026-03-21 — v1.2.1  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
```
