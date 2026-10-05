# AUDIT DATA_MODEL — Terrain vs Documentation V1.9.0

```
DATE    : 2026-03-30
SOURCE  : information_schema.columns cloud (49 tables, requête live)
COMPARE : SUPABASE_DATA_MODEL_V1_9_0.md (projet Claude)
```

---

## 1 — ÉCARTS CRITIQUES (doc ≠ terrain)

### 1.1 thesaurus_interventions — Section 9 DROP EXÉCUTÉ

Doc V1.9.0 liste 11 colonnes (dont 3 LEGACY : chirurgien, protocole_operatoire, specialite).
Terrain : **8 colonnes** (LEGACY supprimées) + **3 colonnes migration 072** (note_originale, note_reviewed_at, note_reviewed_by).

**Action** : mettre à jour section 19 — supprimer les 3 LEGACY, ajouter les 3 audit.

Colonnes terrain actuelles (11) :
```
id, date_intervention, created_at, protocole_id, chirurgien_id,
panseuse_id, lateralite, note, note_originale, note_reviewed_at, note_reviewed_by
```

### 1.2 profiles — 27 colonnes (doc dit 25)

Colonnes terrain absentes du doc :
- `chirurgien_id` — FK probable vers thesaurus_chirurgiens (lien profil ↔ chirurgien thesaurus)
- `secretaires_list` — doublon de `secretaires` ? À vérifier usage

**Action** : documenter les 2 colonnes manquantes.

### 1.3 profiles_directory — 27 colonnes, idem profiles

Même écart : `chirurgien_id` non documenté.

**Action** : aligner sur profiles.

---

## 2 — TABLES NON DOCUMENTÉES (existent en base, absentes du DATA_MODEL)

| Table | Colonnes | Probable origine |
|---|---|---|
| `fonctions_metier` | 11 (id, code, label, categorie, parent, icon, color, position, is_active, created_at, updated_at) | Référentiel métier annuaire/profiles |
| `glossaire` | 7 (id, abbreviation, definition, usage_notes, created_by, created_at, updated_at) | Module glossaire |
| `glossaire_suggestions` | 10 (id, proposed_term, proposed_def, proposed_notes, proposed_by, status, reviewed_by, reviewed_at, admin_note, created_at) | Workflow suggestion glossaire |
| `tag_suggestions` | 7 (id, proposed_label, proposed_by, status, reviewed_by, reviewed_at, created_at) | Workflow suggestion tags (D5 sécurité) |
| `thesaurus_fiches_papier` | 13 (id, chirurgien, nom_fichier, chemin_relatif, protocole_id, id_protocole_match, libelle_cible_match, score, via, statut, notes, created_at, updated_at) | Migration 070 — rapprochement Word ↔ Supabase |
| `staging_medacta_coste` | 10 (id, Date utilisation, Nom chirurgien, Nom Produit, Réf fabricant, Fabricant, Catégorie, Code Commande, Note, imported_at) | Import CSV Medacta implants Dr. COSTE |

**Action** : ajouter une section par table dans DATA_MODEL V1.10.0.

---

## 3 — TABLES DOCUMENTÉES MAIS INCOMPLÈTES DANS LE DOC

### 3.1 livret_* (4 tables, section 17 embryonnaire)

Le doc mentionne le livret mais ne détaille pas les colonnes terrain :

| Table | Cols terrain |
|---|---|
| `livret_encadrement` | 10 : id, profile_id, nom_local, prenom_local, telephone, role_label, position, is_visible, created_at, updated_at |
| `livret_objectifs_items` | 12 : id, terme, domaine_key, domaine_label, domaine_icone, item_key, item_label, item_detail, position, is_active, created_at, updated_at |
| `livret_progression` | 5 : id, user_id, item_key, statut, updated_at |
| `livret_secteurs` | 14 : id, code, label, salles, qualif_salles, effectif, description, actes, couleur_hex, icone_bi, position, is_visible, created_at, updated_at |

**Action** : réécrire section 17 avec les colonnes réelles.

---

## 4 — CONFIRMATIONS (doc = terrain, aucun écart)

| Table | Cols | Statut |
|---|---|---|
| anatomie | 11 | ✅ |
| app_groups | 10 | ✅ |
| app_modules | 15 | ✅ |
| carnet_categories | 9 | ✅ |
| carnet_items | 12 | ✅ |
| carnet_progressions | 11 | ✅ |
| casaques | 18 | ✅ |
| categories | 8 | ✅ |
| content_images | 7 | ✅ |
| content_relations | 9 | ✅ |
| content_types | 8 | ✅ |
| cours | 13 | ✅ |
| error_404_logs | 6 | ✅ |
| etageres | 6 | ✅ |
| fiches_intervention | 13 | ✅ |
| gants | 20 | ✅ |
| installation_patient | 12 | ✅ |
| materiel | 18 | ✅ |
| materiel_types | 8 | ✅ |
| objectifs_criteres | 12 | ✅ |
| objectifs_evaluations | 5 | ✅ |
| objectifs_semaines | 8 | ✅ |
| preferences_chirurgien | 12 | ✅ |
| staging_interventions_ortho | 19 | ✅ |
| supervision_config | 8 | ✅ |
| supervision_rule_delta | 12 | ✅ |
| supervision_rules | 9 | ✅ |
| supervision_sessions | 9 | ✅ |
| tag_links | 5 | ✅ |
| tags | 8 | ✅ |
| thesaurus_chirurgiens | 8 | ✅ |
| thesaurus_panseuses | 10 | ✅ |
| thesaurus_protocoles | 19 | ✅ |
| transmissions | 13 | ✅ (note: uses title/content, not titre/contenu — intentionnel Lovable) |
| user_roles | 4 | ✅ |
| zones_anatomiques | 8 | ✅ |
| zones_stockage | 7 | ✅ |

---

## 5 — RÉSUMÉ POUR DATA_MODEL V1.10.0

| Action | Priorité | Effort |
|---|---|---|
| Supprimer 3 LEGACY thesaurus_interventions + ajouter 3 audit | HAUTE | 5 min |
| Documenter chirurgien_id sur profiles + profiles_directory | HAUTE | 5 min |
| Ajouter section glossaire (2 tables) | MOYENNE | 10 min |
| Ajouter section tag_suggestions | MOYENNE | 5 min |
| Ajouter section fonctions_metier | MOYENNE | 5 min |
| Ajouter section thesaurus_fiches_papier | MOYENNE | 5 min |
| Ajouter section staging_medacta_coste | BASSE | 5 min |
| Réécrire section 17 livret (4 tables colonnes réelles) | MOYENNE | 15 min |
| Compteur tables : 33 → 49 | INFO | 1 min |
| Compteur migrations : 65+ → 072 | INFO | 1 min |

**Total effort V1.10.0 : ~1h de rédaction doc.**
