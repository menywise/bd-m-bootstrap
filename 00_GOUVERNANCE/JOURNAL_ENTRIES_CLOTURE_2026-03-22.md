---

## D-2026-03-22-RLS — Audit pg_policies cloud complet

```
DATE       : 2026-03-22
MODULE     : INFRASTRUCTURE — Supabase RLS
DÉCISION   : Audit exhaustif pg_policies cloud. 120 policies, 27 tables.

RÉSULTATS :
  - profiles : RLS activé, 0 policy = deny-all intentionnel (trigger auth.users SECURITY DEFINER)
  - profiles_directory : TABLE (pas une vue) — 4 policies confirmées par pg_policies
  - 6 divergences migrations vs cloud corrigées (001, 002, 003, 013)
  - 10 patterns RLS identifiés et documentés (A→J)

CORRECTIONS MIGRATIONS :
  001 : profiles deny-all + profiles_directory TABLE + user_roles 4 policies CRUD
  002 : categories/content_types/tags SELECT → is_approved() (était USING true)
  003 : fiches SELECT → is_approved() · transmissions INSERT → is_approved()
  013 : supervision → is_admin() rôle {public} (était bdb_is_admin {authenticated})

LIVRABLE   : AUDIT_RLS_CLOUD_V1_0_0.md
IMPACT     : 4 migrations corrigées (001, 002, 003, 013)
             SUPABASE_DATA_MODEL V1.7.0 §3 corrigé (profiles_directory = TABLE)
STATUT     : VALIDÉ
```

---

## D-2026-03-22-CSS — Déplacement CSS co-localisés

```
DATE       : 2026-03-22
MODULE     : ALL — architecture CSS
DÉCISION   : Chaque module a son CSS dans son propre dossier (co-localisation).
             21 fichiers CSS déplacés de css/ vers modules/[module]/
             29 liens HTML mis à jour (../../css/X-ui.css → X-ui.css)
             planning.zip résiduel supprimé

RESTENT DANS css/ : cds-overrides.css · index-ui.css · login-ui.css ·
  admin-bootstrap-ui.css · admin-memo-ui.css · admin-test-ui.css · overview-ui.css

COMMIT     : 30a7ffe
STATUT     : VALIDÉ
```

---

## D-2026-03-22-PROFILES — Correction profiles_directory = TABLE

```
DATE       : 2026-03-22
MODULE     : GOUVERNANCE — SUPABASE_DATA_MODEL
DÉCISION   : profiles_directory est une TABLE (pas une vue).
MOTIF      : pg_policies retourne 4 policies sur profiles_directory.
             PostgreSQL ne permet pas de RLS sur une vue.
             Le id nullable s'explique par l'absence de PK formelle.
IMPACT     : DATA_MODEL V1.7.0 §3 corrigé · Migration 001 V3 corrigée
STATUT     : VALIDÉ
```
