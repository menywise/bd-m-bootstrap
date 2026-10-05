# MIGRATIONS SQL — Bible de Bloc

```
RÈGLE    : INTERDIT-SQL-01 — Tout SQL cloud = fichier .sql AVANT exécution.
DOSSIER  : 02_INFRASTRUCTURE/SUPABASE/migrations/
FORMAT   : NNN_description.sql (numérotation séquentielle 3 chiffres)
SOURCE   : AUDIT CONFORMITÉ CLOUD 2026-03-22 (information_schema)
VERSION  : 2.0.0 — corrigé après audit cloud
DATE     : 2026-03-22
```

## PROCÉDURE PERMANENTE

1. Écrire le SQL dans un fichier `NNN_description.sql`
2. Relecture + validation Manu
3. Exécuter dans le SQL Editor Supabase cloud
4. Vérifier le résultat (SELECT pour confirmer)
5. Entrée JOURNAL_DECISIONS obligatoire
6. Commit dans le repo

## STRUCTURE (18 fichiers — V2 post-audit)

| Fichier | Contenu | Statut |
|---|---|---|
| 000_baseline_functions.sql | is_admin() · is_approved() · bdb_is_admin() | ✅ |
| 001_baseline_users.sql | profiles (25 col) · profiles_directory (vue) · user_roles (enum app_role) | ✅ CORRIGÉ |
| 002_baseline_content.sql | content_types · categories · tags (enum tag_type) · tag_links · content_images · content_relations | ✅ CORRIGÉ |
| 003_baseline_metier.sql | fiches · anatomie · installation · cours · preferences · transmissions | ✅ CORRIGÉ |
| 004_baseline_materiel.sql | materiel · materiel_types · zones_anatomiques · zones_stockage · etageres | ✅ CORRIGÉ |
| 005_baseline_arsenal.sql | casaques · gants | ✅ |
| 006_baseline_glossaire.sql | glossaire | ✅ |
| 007_materiel_fk_columns.sql | ALTER materiel ADD 4 FK | ✅ |
| 008_app_navigation.sql | app_groups · app_modules + seed 21 modules | ✅ |
| 009_app_navigation_fix.sql | ALTER color + RLS visibility | ✅ |
| 010_error_404_logs.sql | error_404_logs + indexes + RLS | ✅ |
| 011_rls_audit_fix.sql | Traçabilité RLS fix 2026-03-20 | ✅ |
| 012_security_session.sql | tag_suggestions · glossaire_suggestions | ✅ CONFIRMÉ exécuté |
| 013_supervision.sql | 4 tables supervision_* + seed | ✅ |
| 014_livret.sql | 4 tables livret_* | ✅ |
| 015_objectifs.sql | 3 tables objectifs_* | ✅ |
| 016_data_fixes.sql | UPDATE tags is_locked · bucket policy | ⚠ partiel |
| 017_carnet_bord.sql | 3 tables carnet_* | ✅ AJOUTÉ |

## AUDIT CONFORMITÉ

Date : 2026-03-22
Méthode : information_schema.columns cloud → croisement migrations
Résultat : **18/18 fichiers conformes au cloud** après corrections V2

Découvertes majeures :
- profiles = 25 colonnes (pas 3)
- profiles_directory = VUE (pas une table)
- user_roles.role = enum `app_role` (valeur 'membre' pas 'member')
- tags = colonnes `label_display`/`label_normalized`/`is_locked` + enum `tag_type`
- content_images = `content_type_id`/`storage_path`/`position`/`is_dev`
- Pattern éditorial Lovable sur toutes les tables métier

## CONVENTION

- Chaque fichier est autonome et idempotent quand possible (IF NOT EXISTS)
- Les RLS sont incluses dans le même fichier que la table
- Les seeds sont inclus dans le même fichier que la table
- Commentaire en-tête : réf JOURNAL + date + source
- V2 = schéma cloud réel (V1 était basé sur DATA_MODEL périmé)
