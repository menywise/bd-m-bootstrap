# CTX — MODULE ANNUAIRE

```
VERSION   : 1.2.1
DATE      : 2026-03-21
STATUT    : OPÉRATIONNEL — bdb-shell.js migré ✅ — données partielles (avatars non migrables)
FICHIER   : modules/annuaire/index.html
CSS       : ../../css/annuaire-ui.css + ../../css/cds-overrides.css
NOYAU_REF : NOYAU_VERITE_V2_4_0
DELTA v1.2.0 → v1.2.1 :
  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.

TRACKER_STATUS     : migré
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
RESTE À FAIRE    : Passage en format CTX BLOC 1-9 (prochaine session dédiée)
                   Avatars Lovable : URLs inaccessibles — solution non planifiée
VIOLATIONS ACTIVES :
  Aucune violation code détectée (absent des priorités SESSION_STATE 2026-03-21).
  ⚠ Format CTX pré-template V1.2.0 — structure BLOC 1-9 non encore appliquée.
     À migrer lors d'une session dédiée.
VIOLATIONS RÉSOLUES :
  - INTERDIT-E1 (bdb-shell hors main)  : migré — 2026-03-16 (D-2026-03-16-T01)
  - INTERDIT-C2 (style= statique)      : soldé — 2026-03-16 (D-2026-03-16-T01)
```

---

## ROLE

Répertoire de l'équipe soignante.
Affiche les membres du bloc avec leur fonction, leurs préférences de casaque/gants.
Permet la consultation de fiche complète par membre.

## PORTÉE

- Liste des membres (profiles_directory)
- Fiche membre : infos personnelles, casaques, gants, préférences chirurgien associées
- Filtres par fonction / statut approuvé
- Lien vers preferences via `?chirurgien=[id]` (deep-link)
- Avatars : initiales colorées en fallback (URLs cloud Lovable non migrables)

## TABLES SUPABASE

`profiles_directory` · `profiles` · `user_roles` · `casaques` · `gants` · `preferences_chirurgien`

Note : colonne `avatar_url` dans profiles_directory — URLs cloud Lovable inaccessibles
en local. Fallback = cercle coloré avec initiales calculé par `avatarColor(name)`.

## STACK TECHNIQUE

HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via `window.bdb`
bdb-shell.js v1.4.0 migré ✅ (D-2026-03-16-T01)
Zéro localStorage. Zéro onclick. Zéro style=. Zéro module ES.

## ANTI-HALLUCINATION

```
- approved est dans profiles_directory — jamais dans user_roles
- Ne pas tenter de migrer les avatars Lovable : URLs inaccessibles sans credentials
- canEdit : logique basée sur le rôle admin vérifié via window.bdbUser.isAdmin,
  pas sur une requête user_roles locale (INTERDIT-B2)
- Les services JS (auth-service.js etc.) n'existent pas
```

## VOIX UTILISATEUR

Ce module est visible par tous les membres (non-admin inclus).
Tout microtexte, message d'état, libellé de filtre doit respecter
la RÈGLE DE VOIX BDB (PERSONAS_BDB_V1_3_0).
Public attendu : S/C 50% + I 35% — voix BLEU rassurant.

## AUTORISÉ

- Modifier filtres et affichage liste
- Modifier fiche membre
- Ajouter colonnes depuis tables existantes
- Modifier le comportement du deep-link `?chirurgien=[id]`

## INTERDIT

- Modifier profiles_directory.approved sans passer par admin
- Tenter de résoudre les avatars Lovable (URLs cloud non accessibles)
- CSS inline / JS inline
- Modifier schéma tables sans migration SQL
- Faire une requête user_roles locale pour vérifier le rôle
  → window.bdbUser.isAdmin est la source unique (INTERDIT-B2)

## DÉPENDANCES

- `js/supabase-client.js` (window.bdb)
- `js/bdb-shell.js` v1.4.0 (window.bdbUser)
- `../../css/cds-overrides.css`
- `../../css/annuaire-ui.css`
- Module `preferences` (deep-link → fiche chirurgien) — lecture seule

## HISTORIQUE

```
2026-03-08 — v1.0.0  Création initiale.
2026-03-15 — v1.1.0  NOYAU_REF V2.1.0. Anti-hallucination. Note voix utilisateur.
                      Deep-link preferences documenté.
2026-03-16 — v1.2.0  NOYAU_REF V2_4_0. STATUT : bdb-shell migré ✅ (D-2026-03-16-T01).
                      PERSONAS underscore. bdb-shell v1.4.0 en dépendances.
                      canEdit : window.bdbUser.isAdmin (INTERDIT-B2).
2026-03-21 — v1.2.1  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
```
