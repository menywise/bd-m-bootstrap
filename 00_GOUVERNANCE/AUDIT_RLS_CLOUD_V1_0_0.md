# AUDIT RLS — pg_policies cloud 2026-03-22

```
VERSION  : 1.0.0
DATE     : 2026-03-22
SOURCE   : pg_policies WHERE schemaname='public' — cloud ecpzrygzdugwwkqbsajn
TOTAL    : 120 policies · 27 tables
```

---

## RÉSUMÉ

| Catégorie | Nombre |
|---|---|
| Tables avec RLS conformes | 26 |
| Tables RLS activé mais 0 policy (deny-all) | 1 (profiles) |
| Tables sans RLS dans pg_policies | 0 |
| Divergences migrations vs cloud | 6 |

---

## DÉCOUVERTE CRITIQUE

### profiles : RLS activé, zéro policy = deny-all

```
relrowsecurity = true
pg_policies    = 0 ligne
```

**Explication :** `profiles` est alimenté par un trigger sur `auth.users` (SECURITY DEFINER = bypass RLS). Aucun module JS ne fait `.from('profiles')` directement — tout passe par `profiles_directory`. Le deny-all est intentionnel : la table n'est pas exposée via l'API REST.

**Action :** documenter dans DATA_MODEL. Pas de correction nécessaire.

### profiles_directory : TABLE (pas une vue)

**Correction de l'audit colonnes du 2026-03-22 :** `profiles_directory` est bien une TABLE, pas une vue. La preuve : pg_policies retourne 4 policies dessus. Le `id` nullable dans information_schema s'explique par l'absence de contrainte NOT NULL sur cette colonne.

**Action :** corriger migration 001 — revenir à CREATE TABLE.

---

## DIVERGENCES MIGRATIONS vs CLOUD

| # | Table | Policy | Migration dit | Cloud dit | Sévérité |
|---|---|---|---|---|---|
| D1 | categories | SELECT | `USING (true)` | `is_approved()` | HAUTE — migration trop ouverte |
| D2 | content_types | SELECT | `USING (true)` | `is_approved()` | HAUTE — migration trop ouverte |
| D3 | tags | SELECT | `USING (true)` | `is_approved()` | HAUTE — migration trop ouverte |
| D4 | fiches_intervention | SELECT | status+user_id+admin | `is_approved()` | MOYENNE — migration plus complexe |
| D5 | transmissions | INSERT | `auth.uid() IS NOT NULL` | `is_approved()` | HAUTE — migration trop ouverte |
| D6 | supervision_* | ALL | `bdb_is_admin()` | `is_admin()` | BASSE — helpers équivalents |

### Détail D1-D3 : catégories/content_types/tags SELECT

Les migrations utilisaient `USING (true)` (lecture publique). Le cloud utilise `is_approved()` — seuls les membres approuvés voient les référentiels. Cohérent avec l'AUDIT_SECURITE : pas de lecture anon sur les données métier.

### Détail D4 : fiches_intervention SELECT

Migration : `(status='published' AND is_approved()) OR user_id=uid() OR is_admin()`
Cloud : `is_approved()` (plus simple)

Le cloud ne filtre pas par status ni par auteur pour le SELECT — tout membre approuvé voit toutes les fiches. La logique de filtrage status est probablement côté JS.

### Détail D5 : transmissions INSERT

Migration : `auth.uid() IS NOT NULL` (tout utilisateur authentifié)
Cloud : `is_approved()` (seuls les membres approuvés)

Plus restrictif côté cloud — un utilisateur non approuvé ne peut pas créer de transmission.

### Détail D6 : supervision helpers

Migration : `bdb_is_admin()`. Cloud : `is_admin()`. Les deux fonctions font la même chose (SELECT FROM user_roles WHERE role='admin'). Pas d'impact fonctionnel, juste une incohérence de nommage. Le cloud utilise `is_admin()` avec rôle `{public}`.

---

## PATTERN RLS STANDARD (confirmé cloud)

### Pattern A — Tables métier éditorial (11 tables)

```
anatomie · casaques · categories · content_types · cours ·
etageres · fiches_intervention · gants · installation_patient ·
materiel · materiel_types · preferences_chirurgien · tags ·
zones_anatomiques · zones_stockage
```

```
SELECT  authenticated  is_approved()
INSERT  authenticated  is_admin()
UPDATE  authenticated  is_admin() / is_admin()
DELETE  authenticated  is_admin()
```

### Pattern B — Tables contenu transversal (3 tables)

```
content_images · content_relations · tag_links
```

```
SELECT  authenticated  is_approved()
INSERT  authenticated  is_approved() (content_images, tag_links) / is_admin() (content_relations)
UPDATE  authenticated  is_admin()
DELETE  authenticated  is_admin()
```

### Pattern C — Navigation (2 tables)

```
app_groups · app_modules
```

```
SELECT  anon           is_visible/status+visibility
SELECT  authenticated  is_visible / visibility+bdb_is_admin()
ALL     authenticated  bdb_is_admin()
```

### Pattern D — Données personnelles (3 tables)

```
carnet_progressions · livret_progression · objectifs_evaluations
```

```
SELECT  authenticated  user_id=auth.uid()
INSERT  authenticated  user_id=auth.uid()
UPDATE  authenticated  user_id=auth.uid()
ALL     authenticated  admin (lecture croisée)
```

### Pattern E — Référentiels lecture publique (7 tables)

```
carnet_categories · carnet_items · livret_encadrement ·
livret_objectifs_items · livret_secteurs · objectifs_criteres · objectifs_semaines
```

```
SELECT  anon           is_active/is_visible (filtré)
SELECT  authenticated  true (tout)
ALL     authenticated  admin inline EXISTS
```

### Pattern F — Infrastructure (1 table)

```
error_404_logs
```

```
INSERT  anon+auth      true (tout le monde peut logger)
SELECT  authenticated  admin
DELETE  authenticated  admin
```

### Pattern G — Supervision (4 tables)

```
supervision_config · supervision_rules · supervision_rule_delta · supervision_sessions
```

```
SELECT  {public}  is_admin()
ALL     {public}  is_admin()
```

### Pattern H — Suggestions workflow (2 tables)

```
tag_suggestions · glossaire_suggestions
```

```
INSERT  authenticated  proposed_by=auth.uid()
SELECT  authenticated  own OR bdb_is_admin()
ALL     authenticated  bdb_is_admin()
```

### Pattern I — Annuaire (1 table)

```
profiles_directory
```

```
SELECT  authenticated  is_admin() OR approved OR user_id=uid()
INSERT  authenticated  user_id=auth.uid()
UPDATE  authenticated  user_id=uid() OR is_admin()
DELETE  authenticated  is_admin()
```

### Pattern J — Rôles (1 table)

```
user_roles
```

```
SELECT  authenticated  true
INSERT  authenticated  is_admin()
UPDATE  authenticated  is_admin()
DELETE  authenticated  is_admin()
```

### Absent — profiles

```
RLS activé, 0 policy = deny-all intentionnel
Alimenté par trigger auth.users SECURITY DEFINER
```

---

## TABLES MANQUANTES DANS pg_policies

| Table attendue | Résultat | Explication |
|---|---|---|
| profiles | 0 policy | deny-all intentionnel (trigger SECURITY DEFINER) |

Toutes les autres 32 tables du cloud (33 tables - profiles_directory qui est probablement table sans PK formelle) ont des policies RLS actives.

---

## CORRECTIONS À APPLIQUER AUX MIGRATIONS

### Migration 001 — profiles_directory

Revenir à CREATE TABLE (pas CREATE VIEW). Ajouter les 4 policies cloud :
- `profiles_directory_select_filtered` : is_admin() OR approved OR user_id=uid()
- `profiles_directory_insert_own` : user_id=auth.uid()
- `profiles_directory_update_own` : user_id=uid() OR is_admin()
- `profiles_directory_delete_admin` : is_admin()

Ajouter note : profiles = deny-all intentionnel, pas de policy nécessaire.

### Migration 002 — categories/content_types/tags SELECT

Remplacer `USING (true)` par `USING (is_approved())`.

### Migration 003 — fiches SELECT + transmissions INSERT

fiches : remplacer le filtre complexe par `is_approved()`.
transmissions INSERT : remplacer `auth.uid() IS NOT NULL` par `is_approved()`.

### Migration 013 — supervision

Remplacer `bdb_is_admin()` par `is_admin()` et rôle `{authenticated}` par `{public}`.
