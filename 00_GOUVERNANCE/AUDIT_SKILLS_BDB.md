# AUDIT SKILLS BDB — Cross-linking & Optimisation

Date : 2026-04-03

## 1. Inventaire

| # | Skill | Lignes | Role |
|---|---|---|---|
| 1 | contexte-clinique-ibode | 234 | Garde-fou clinique ortho/neuro |
| 2 | terrain-decoder | 191 | Lecture sources terrain |
| 3 | combo-gagnant | 163 | Completude protocole |
| 4 | lexique-chirurgical-ccam | 224 | Nommage gestes + structure CCAM |
| 5 | thesaurus-ibode | 198 | Construction thesaurus + SQL |
| 6 | data-metier-router | 194 | Routage donnees metier |
| 7 | supabase-bdb | 127 | Garde-fou SQL |
| 8 | cds-compliance | 145 | Garde-fou HTML/CSS/JS |
| 9 | bdb-module-generator | 391 | Generateur modules |
| 10 | windows-ops-bdb | 253 | Ops Windows/FTP |
| 11 | recherche-documentaire | 313 | Recherche clinique (NOUVEAU V2) |

Non installes : migration-localstorage-supabase, gouvernance-session-bdb, admin-slot-bdb


## 2. PROBLEME 1 — Duplications massives

### terrain-decoder duplique contexte-clinique-ibode

| Contenu duplique | terrain-decoder | contexte-clinique-ibode |
|---|---|---|
| Chaine des intervenants (10+ roles) | Section complete "La chaine du chaos" | Section "La chaine des intervenants" |
| Types de programmes (4 types) | Tableau 4 types | Tableau 4 types (quasi identique) |
| DISC et profil apprenant | Section dediee | Section dediee |
| Ortho vs Neuro | Implicite dans les types | Section structurante complete |

**Impact** : ~60 lignes dupliquees. Si Manu met a jour un skill, l'autre diverge.

**Correction** : terrain-decoder doit REFERER a contexte-clinique-ibode pour ces sections, pas les dupliquer.


## 3. PROBLEME 2 — CCAM eclate sur 4 skills sans delegation claire

| Aspect CCAM | Skill actuel | Skill optimal |
|---|---|---|
| Structure du code (7 caracteres, lettres, voie d'abord) | lexique-chirurgical-ccam | lexique-chirurgical-ccam (INCHANGE) |
| Anti-fusion gestes (teno-, osteo-) | lexique-chirurgical-ccam | lexique-chirurgical-ccam (INCHANGE) |
| Validation format (4 lettres + 3 chiffres) | thesaurus-ibode | thesaurus-ibode (INCHANGE) |
| Recherche web code/libelle | AUCUN (dit "Perplexity") | **recherche-documentaire** |
| Cross-validation ATIH/ameli | AUCUN | **recherche-documentaire** |
| Champ codes_ccam dans combo | combo-gagnant | combo-gagnant → delegue a **recherche-documentaire** |

**Impact** : 3 skills mentionnent "Perplexity" comme outil de verification CCAM. Ce n'est plus un skill ni un outil BDB — c'est une dette.

**Correction** : Remplacer toute reference "Perplexity" par delegation a `recherche-documentaire`.


## 4. PROBLEME 3 — thesaurus-ibode n'a PAS de table d'interaction

Tous les skills cliniques ont une section "Interaction avec les autres skills" SAUF thesaurus-ibode.
C'est pourtant le skill le plus connecte (reference par 5 autres skills).

**Correction** : Ajouter table d'interaction a thesaurus-ibode.


## 5. PROBLEME 4 — recherche-documentaire inconnu des autres skills

Le nouveau skill n'est reference par AUCUN autre skill.

**Correction** : Ajouter une ligne dans la table d'interaction de :
- lexique-chirurgical-ccam (pour recherche CCAM en ligne)
- combo-gagnant (pour verification CCAM)
- thesaurus-ibode (pour sourcer definitions, anatomie, synonymes)
- contexte-clinique-ibode (pour sourcer positionnement, recommandations)
- data-metier-router (pour enrichissement depuis sources documentaires)
- terrain-decoder (pour valider ce que le terrain suggere)


## 6. PROBLEME 5 — References "Perplexity" obsoletes

| Skill | Occurrence |
|---|---|
| combo-gagnant | "verifie (Perplexity)" x2 |
| terrain-decoder | "Verification Perplexity obligatoire" x1 |
| thesaurus-ibode | Implicite (pas de source de verification CCAM definie) |

**Correction** : Remplacer par "verifie via skill recherche-documentaire" partout.


## 7. PLAN DE CORRECTIONS

### Batch 1 — Dedupliquer terrain-decoder (IMPACT: -40 lignes)
- Supprimer sections dupliquees (chaine chaos detaillee, types programmes, DISC)
- Remplacer par reference vers contexte-clinique-ibode
- Ajouter reference recherche-documentaire

### Batch 2 — Ajouter interaction tables manquantes
- thesaurus-ibode : ajouter table complete
- Tous les skills : ajouter ligne recherche-documentaire

### Batch 3 — Purger "Perplexity"
- combo-gagnant : remplacer x2
- terrain-decoder : remplacer x1

### Batch 4 — Verifier coherence cross-references
- Apres corrections, audit que chaque skill reference correctement ses voisins


## 8. MATRICE DE DELEGATION PROPOSEE

Qui fait quoi — regle de non-chevauchement :

| Responsabilite | Skill autorite | Les autres delegent |
|---|---|---|
| Nommer un geste chirurgical | lexique-chirurgical-ccam | thesaurus-ibode, combo-gagnant |
| Chercher/valider un code CCAM en ligne | recherche-documentaire | lexique, thesaurus, combo |
| Verifier ortho vs neuro | contexte-clinique-ibode | terrain-decoder, thesaurus, combo |
| Lire une source terrain | terrain-decoder | data-metier-router, thesaurus |
| Construire un protocole complet | combo-gagnant | thesaurus (creation) → combo (completude) |
| Inserer en base | thesaurus-ibode (SQL) + supabase-bdb (garde-fou) | — |
| Router une donnee entrante | data-metier-router | — (point d'entree) |
| Sourcer definitions/anatomie/recommandations | recherche-documentaire | tous les skills cliniques |
