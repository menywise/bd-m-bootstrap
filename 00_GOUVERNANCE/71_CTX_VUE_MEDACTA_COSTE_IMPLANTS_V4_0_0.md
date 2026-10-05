# CTX_VUE_MEDACTA_COSTE_IMPLANTS

```
VERSION  : 4.0.0
DATE     : 2026-03-27
STATUT   : RÉFÉRENCE — VIEW V4 validée, JS à mettre à jour
PORTÉE   : staging uniquement — hors modules BDB production
AUTEUR   : Manu + Claude
PÉRIMÈTRE: Dr COSTE Cédric | Fabricant MEDACTA | 2023-2026
RGPD     : Vue analytique interne — ne pas exposer publiquement
DELTA    : V3.0.0 → V4.0.0
           VIEW V4 produite et validée (step7b_vue_medacta_v4.sql).
           Jointure timestamp exact → données individuelles.
           Taxonomie composants complète et validée.
           Règles doublons finalisées.
           7 doublons identifiés et qualifiés chirurgicalement.
           JS V4 à produire.
```

---

## 1 — CLÉ DE JOINTURE V4 (individuelle)

### 1.1 — Principe

```sql
TO_TIMESTAMP(m."Date utilisation", 'MM/DD/YY HH24:MI')
= TO_TIMESTAMP(o.date_intervention, 'MM/DD/YY HH24:MI')
```

Jointure 1:1 garantie. COSTE peut faire plusieurs PTG le même jour
(ex: 9:09 et 11:30) → l'heure les distingue.

### 1.2 — Données individuelles résultantes

| Colonne | Source | V3 | V4 |
|---|---|---|---|
| `panseuse` | OPTIM | STRING_AGG cohorte | **Individuelle** |
| `sexe` | OPTIM | distribution cohorte | **Individuel** |
| `lateralite_optim` | OPTIM | agrégée | **Individuelle** |
| `duree_minutes` | OPTIM | absent | **Individuelle** |
| `note_optim` | OPTIM | absent | **Individuelle** |
| `protocole_optim` | OPTIM | absent | **Individuel** |

### 1.3 — Principe RGPD maintenu

L'anonymisation porte sur l'identité du patient.
`date + heure + chirurgien + protocole + lateralite` = clés métier légitimes.
Pas de ré-identification possible.

---

## 2 — RÈGLES CIMENT (définitives)

| Condition dans `"Nom Produit"` | Classification |
|---|---|
| Contient `cimentee`, `cimenté`, `cimented` | **CIMENTÉ** |
| Contient `SS CIMENT` | **NON CIMENTÉ** |
| Aucune mention | **NON CIMENTÉ** (absence = sans ciment) |

**`ciment_global` par code commande :**
- `TOUT CIMENTÉ` : fémur ET embase cimentés
- `TOUT NON CIMENTÉ` : fémur ET embase non cimentés
- `MIXTE` : fémur et embase de statut différent (cas le plus fréquent)

**Distribution validée (PTG primaires) :**

| Statut | F | H |
|---|---|---|
| MIXTE | 131 | 141 |
| TOUT NON CIMENTÉ | 103 | 104 |
| TOUT CIMENTÉ | 17 | 5 |

---

## 3 — TAXONOMIE DES COMPOSANTS

### 3.1 — Familles et détection

| Famille | Pattern `"Nom Produit"` | Exclue des stats |
|---|---|---|
| `FEMUR` | `femur` ou `fémur` (ilike) | Non |
| `EMBASE` | `embase` (ilike) | Non |
| `INSERT` | `insert` (ilike) | Non |
| `TIGE` | `tige` (ilike) | Non |
| `ROTULE` | `rotule` (ilike) | Non |
| `ALLERGIE` | `AMS` ou `allergi` (ilike) | Non |
| `LAME_SCIE` | `lame de scie` (ilike) | **Oui — consommable** |
| `HINGE` | `HINGE` (ilike) | Segment Reprise séparé |
| `AUTRE` | Aucun pattern | Non |

### 3.2 — Segmentation HINGE = Reprise

Tout `code_commande` contenant ≥ 1 ligne `HINGE` → `est_reprise = TRUE`.

**Volumes validés :**
- PTG primaires : **501**
- PTG reprises : **16**

Les deux segments sont **strictement séparés** dans toutes les analyses.

### 3.3 — Tailles

**Fémur / Embase** (morphologie osseuse) :

| Pattern | Exemple | Résultat |
|---|---|---|
| `T.(N)` standard | `T.3D`, `T.4G` | `T.3`, `T.4` |
| `T.(N+)` offset | `T.3+D`, `T.4+G` | `T.3+`, `T.4+` |
| Taille intermédiaire libellé | `T.3/4R` | Extrait via `taille_intermediaire` |
| Taille intermédiaire ref | `T3I4R` | Extrait via `taille_intermediaire` |

**Distribution fémur validée (PTG primaires) — cohérence anatomique confirmée :**

| Taille | Profil |
|---|---|
| T.1 → T.3+ | Quasi exclusivement **F** |
| T.4 | Frontière — équilibré F/H |
| T.4+ → T.6+ | Quasi exclusivement **H** |

**Insert** (épaisseur fonctionnelle) :

| Pattern | Exemple | Résultat |
|---|---|---|
| `T.(N)HT.(N)` | `T.3HT.11` | taille=`T.3`, épaisseur=`11mm` |
| `T.(N)-(N)mm` | `T.3-12mm` (E-Cross) | taille=`T.3`, épaisseur=`12mm` |

Épaisseurs : 10, 11, 12, 13, 14, 17mm.

**Taille intermédiaire embase** (fémur ≠ tibia) :

| Pattern libellé | Pattern ref | Format normalisé |
|---|---|---|
| `T.3/4` | `T3I4` | `F:3/T:4` |
| `T.4/3` | `T4I3` | `F:4/T:3` |

Distribution validée : 77 × `F:3/T:4`, 3 × `F:4/T:3`.

**Tige** : `Ø(N)mm L(N)mm` — ex: `Ø11mm L65mm`

**Rotule** : `T.(N)` — ex: `T.3`

---

## 4 — DÉTECTION DOUBLONS

### 4.1 — Règles d'exclusion (doublons légitimes)

| Exclusion | Pattern | Raison |
|---|---|---|
| Cales standard | `ref_fabricant ~ 'TW$\|DW$'` | Se posent en paires |
| Cales GMK REV tibiales | `ref_fabricant ~ '^02\.09\..*TA'` | Cales de révision normales |
| Familles hors scope | `LAME_SCIE`, `ROTULE`, `ALLERGIE` | Consommables ou composants non concernés |

### 4.2 — 7 doublons identifiés et qualifiés

| Date | Implant en double | Reprise | Verdict chirurgical |
|---|---|---|---|
| 2023-11-22 | Embase T.5D + Tige Ø11 | Non | Embase reposée — changement taille per-op |
| 2023-12-15 | Tige Ø11 L65 | Non | Tige reposée — instabilité per-op |
| 2024-02-13 | Tige Ø14 L65 | **Oui** | Tige reposée en reprise |
| 2024-02-28 | Tige Ø11 L65 | **Oui** | Tige reposée en reprise |
| 2025-06-13 | Tige Ø11 + lat=B | Non | Doublon tige + erreur saisie latéralité |
| 2025-09-24 | Insert E-Cross T.3-12mm | Non | Insert reposé — épaisseur inadaptée per-op |
| 2025-09-26 | Insert E-Cross T.5-13mm | Non | Insert reposé — épaisseur inadaptée per-op |

---

## 5 — NORMALISATION PANSEUSES

Fusionnées sous `INTERIMAIRE` dans la VIEW :
- `%INTERIMAIRE%` (IBODE INTERIMAIRE, IDE INTERIMAIRE)
- `ARNAUD Sandrine`

---

## 6 — COLONNES DE LA VIEW V4

| Colonne | Type | Description |
|---|---|---|
| `code_commande` | TEXT | Clé intervention Medacta |
| `timestamp_intervention` | TIMESTAMPTZ | Date + heure exacte |
| `date_intervention_mois` | DATE | YYYY-MM-01 (pour regroupements) |
| `chirurgien_medacta` | TEXT | `COSTE Cédric` |
| `fabricant` | TEXT | `MEDACTA` |
| `est_reprise` | BOOLEAN | TRUE si HINGE présent |
| `lateralite` | TEXT | D/G/B/NC depuis refs Medacta |
| `panseuse` | TEXT | Individuelle depuis OPTIM |
| `sexe` | TEXT | Individuel depuis OPTIM |
| `lateralite_optim` | TEXT | Confirmée depuis OPTIM |
| `duree_minutes` | TEXT | Durée individuelle OPTIM |
| `protocole_optim` | TEXT | Protocole OPTIM |
| `protocole_anesthesie` | TEXT | Anesthésie OPTIM |
| `note_optim` | TEXT | Note OPTIM |
| `nb_implants` | BIGINT | Hors lames de scie |
| `taille_femur` | TEXT | `T.N` ou `T.N+` |
| `taille_embase` | TEXT | `T.N` ou `T.N+` |
| `taille_insert` | TEXT | `T.N` |
| `epaisseur_insert` | TEXT | `Nmm` |
| `taille_intermediaire` | TEXT | `F:N/T:N` |
| `spec_tige` | TEXT | `ØNmm LNmm` |
| `taille_rotule` | TEXT | `T.N` |
| `a_tige` | BOOLEAN | |
| `a_rotule` | BOOLEAN | |
| `a_allergie` | BOOLEAN | |
| `a_doublon` | BOOLEAN | Signal per-op |
| `ciment_femur` | TEXT | CIMENTÉ / NON CIMENTÉ |
| `ciment_embase` | TEXT | CIMENTÉ / NON CIMENTÉ |
| `ciment_global` | TEXT | TOUT CIMENTÉ / MIXTE / TOUT NON CIMENTÉ |
| `pattern_combinaison` | TEXT | Clé normalisée combinaison posée |
| `detail_implants` | TEXT | Liste `\n`-séparée REF — Libellé |
| `categories` | TEXT | `\|`-séparées |
| `refs_fabricant` | TEXT | `\|`-séparées |
| `qualite_jointure` | TEXT | MATCH / SANS_MATCH |

---

## 7 — AXES ANALYTIQUES V4 (JS à produire)

### Tab Implants & Tailles
- Segmentation PTG primaires / Reprises (HINGE) — sélecteur
- Chart tailles fémur × **4 séries** : F+D, F+G, H+D, H+G
- Chart tailles insert (épaisseur mm) × sexe × côté
- Chart tailles embase × sexe × côté
- Chart ciment (MIXTE / TOUT NC / TOUT C) × sexe
- Tiges : fréquence × diamètre × longueur
- Rotule : fréquence × taille × sexe
- Composant allergie : fréquence × sexe
- Doublons : liste + évolution temporelle
- Top patterns combinaisons × sexe × côté

### Tab Équipe
- Source : `panseuse` individuelle depuis VIEW V4
- Ranking panseuses PTG primaires
- Évolution nb panseuses par intervention (tendance)
- `INTERIMAIRE` fusionné

### Tab Patients
- Sexe individuel (plus de distribution cohorte)
- Latéralité × Sexe
- Durée moyenne par taille fémur

### Tab Jointures
- Qualité : MATCH / SANS_MATCH uniquement
- Liste doublons avec verdict chirurgical

---

## 8 — FICHIERS SQL

| Fichier | Action | Statut |
|---|---|---|
| `step1_update_medacta_chirurgien.sql` | Normalise `Nom chirurgien` | ✅ |
| `step4_update_lateralite_2026.sql` | UPDATE lateralite 2026 | ✅ |
| `step5_update_lateralite_typos.sql` | UPDATE lateralite typos | ✅ |
| `step6_vue_medacta_v3.sql` | VIEW V3 — remplacée | ⚠️ |
| `step7b_vue_medacta_v4.sql` | **VIEW V4 — version courante** | ✅ Active |

---

## 9 — MODULE APPLICATIF

**Chemin :** `modules/medacta-coste/`

| Fichier | État |
|---|---|
| `index.html` | ⚠️ À mettre à jour (nouveaux tabs + colonnes V4) |
| `medacta-coste-app.js` | ⚠️ À mettre à jour (colonnes V4) |
| `medacta-coste-analytics.js` | ⚠️ À réécrire (nouvelles analyses V4) |
| `medacta-coste-jointures.js` | ⚠️ À mettre à jour (MATCH/SANS_MATCH) |
| `medacta-coste-ui.css` | ✅ Compatible |

---

## 10 — HISTORIQUE

| Version | Date | Modification |
|---|---|---|
| 1.0.0 | 2026-03-27 | VIEW V1 jointure date seule. |
| 2.0.0 | 2026-03-27 | VIEW V3 jointure mois+côté. Enrichissement lateralite. |
| 3.0.0 | 2026-03-27 | CTX V4 défini. Clé timestamp individuelle découverte. |
| 4.0.0 | 2026-03-27 | VIEW V4 validée. 517 MATCH. 501 PTG / 16 Reprises. 7 doublons qualifiés. Taxonomie complète. JS à produire. |
