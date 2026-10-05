# migrations/

Dossier des migrations SQL Supabase pour BDB.

## Convention

- Fichier : `migration_NNN_description.sql`
- Numerotation : sequence croissante (dernier = 172)
- Chaque fichier contient : entete (date, session, arbitrage), SQL, rollback
- Regle INTERDIT-SQL-01 : ecrire le .sql ICI avant execution cloud

## Contenu

La racine ne contient que les migrations **a executer** (en attente).
Toutes les migrations deja executees sont dans `_archive/`.

## _archive/

| Sous-dossier | Contenu | Nb fichiers |
|---|---|---|
| `_baseline` | Schema initial + thesaurus seeds (000-029) | 35 |
| `_batch_sexe` | UPDATE sexe en tranches (054-055) | 18 |
| `_batch_fusions` | Normalisation libelles (066-070) | 22 |
| `_batch_glossaire_chirurgie` | Import glossaire chirurgie (123-135) + zip | 14 |
| `_gouvernance` | Seeds gouvernance (079-085) | 8 |
| `_diagnostics` | Requetes d'audit ponctuelles (diag_*, scan_*) | 13 |
| `_outils` | Scripts Python, CSV rapprochement CCAM | 4 |
| `_sessions` | SQL d'ouverture/cloture session | 1 |
| `_misc` | Toutes les autres migrations executees (075-172) | 35 |

**Total archive** : 150 fichiers, ~25 Mo

## Supabase

Les migrations cloud sont trackees par UUID dans `supabase_migrations.schema_migrations`.
La numerotation locale (NNN) est un index de travail, pas un lien vers le tracker Supabase.
