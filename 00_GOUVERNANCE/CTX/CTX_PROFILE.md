# CTX_PROFILE.md
```
VERSION      : 1.0.0
DATE         : 2026-03-21
MODULE       : profile
STATUT       : ACTIF
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0

TRACKER_STATUS     : en_cours
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : INTERDIT-B2,INTERDIT-C2
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
FAIT             : Création CTX initial
RESTE À FAIRE    : Audit complet du module + correction violations
VIOLATIONS ACTIVES :
  - INTERDIT-B2 : requêtes profiles_directory directes probables
  - INTERDIT-C2 : style= statiques probables (audit terrain requis)
VIOLATIONS RÉSOLUES :
  (aucune)
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Module d'édition du profil utilisateur connecté (avatar, prénom, nom, infos).

PORTEE      :
  Couvre : affichage et édition du profil de l'utilisateur connecté uniquement.
  Hors périmètre : gestion des profils des autres utilisateurs (= admin/annuaire).

AUTORISE    :
  - Modifier le HTML/CSS du module pour conformité CDS
  - Corriger les violations INTERDIT

INTERDIT    :
  Interdits fixes (tous les modules) :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Dupliquer le bloc auth (INTERDIT-B1)
  - Requêtes profiles_directory ou user_roles (INTERDIT-B2 — window.bdbUser uniquement)
  - Modifier les RLS sans entrée JOURNAL_DECISIONS
  - Inventer une colonne absente de SUPABASE_DATA_MODEL_V1_4_0
  - Ajouter style= statique dans le HTML (INTERDIT-C2)
  - Ajouter onclick= dans le HTML (délégation addEventListener uniquement)
  Interdits spécifiques :
  - Ne jamais permettre l'édition du champ approved (admin uniquement)
  - Ne jamais permettre l'édition du champ role (admin uniquement via user_roles)

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.5.0
  Spécifiques :
    profiles_directory → lecture/écriture propre profil (user_id = auth.uid())
    Storage bucket     → avatar upload (content-images ou avatar dédié)
```

---

## BLOC 2 — TABLE SUPABASE

```
Nom de table  : profiles_directory
Colonnes clés : user_id · prenom · nom · email · fonction · service
                avatar_url · approved · created_at · updated_at
RLS actives   :
  profiles_directory_select_filtered (auth, SELECT : admin OR approved=true OR own)
  profiles_directory_insert_own      (auth, INSERT : user_id = auth.uid())
  profiles_directory_update_own      (auth, UPDATE : own OR admin)
  profiles_directory_delete_admin    (auth, DELETE : is_admin())
État Supabase : Active — RLS auditées 2026-03-20 (D-2026-03-20-T09)
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

| Qui | SELECT | INSERT/UPDATE | DELETE | Note |
|-----|--------|---------------|--------|------|
| **anon** | ✗ | ✗ | ✗ | Redirect login |
| **member** | Son propre profil | Son propre profil | ✗ | RLS user_id=uid() |
| **admin** | Tous | Tous | ✓ | Via admin/, pas ici |

---

## BLOC 4 — CHECKLIST PREMIUM

```
[ ] CDS conforme
      Zéro style= statique
      Zéro onclick= inline
      CSS module scopé (INTERDIT-17)
      Chaîne CSS BLOC E respectée

[ ] Documenté
      Ce fichier CTX à jour
      TRACKER_* mis à jour

[ ] Résilient
      loadingState / emptyState / errorState présents
      cds-offline-banner si Supabase hors service

[ ] Navigable
      data-module-title et data-module-icon sur #bdb-shell

[ ] Responsive
      Testé desktop + mobile
```

**État actuel** : `[0/5]` — audit terrain requis

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
- L'utilisateur ne peut modifier que son propre profil
- Le champ approved est en lecture seule (géré par admin)
- L'avatar est uploadé dans le bucket Supabase Storage
- renderProfileAvatar() est une fonction globale utilisée par bdb-shell.js
  → ne pas supprimer ni renommer sans entrée JOURNAL_DECISIONS
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur | Correct |
|---|---|---|
| Éditer approved | Le membre change son propre statut | RLS interdit, mais JS ne doit pas proposer le champ |
| Requête user_roles | Lire le rôle depuis la table | window.bdbUser.role |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : profile
OBJECTIF SESSION    : [à définir]
FICHIERS IN SCOPE   : modules/profile/index.html · css/profile-ui.css
FICHIERS HORS SCOPE : bdb-shell.js · supabase-client.js · admin/

Fichiers à charger :
  [ ] SESSION_STATE.md
  [ ] Ce fichier CTX
  [ ] modules/profile/index.html
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

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-21 | 1.0.0 | Création depuis TEMPLATE v1.2.0 | Manu + Claude |
