# CTX_EXPORT_LOGICIEL_METIER — Grille de lecture des exports CSV bruts

```
VERSION  : 1.2.0
DATE     : 2026-03-24
STATUT   : RÉFÉRENCE — à charger dans toute session d'analyse thésaurus
PORTÉE   : Exports XLS/CSV du logiciel métier bloc opératoire (ortho + neuro)
AUTEUR   : Manu (terrain) + Claude (rédaction)
PÉRIMÉ   : Jamais — document vivant, versionné à chaque découverte
DELTA    : v1.2.0 — Consolidation session complète 2026-03-24 :
           Concordance panseuses (22 profils arbitrés Manu).
           Arbitrages protocoles G1/G2/G3 (25/25 résolus).
           Déminage ACT-0006 PETITE INTERVENTION (80% reclassable).
           Stratégies S1 (CCAM), S2 (hiérarchie >), S3 (base vivante).
           Voie d'abord = dimension structurante.
           Notes = mine d'or confirmée (matériel, allergies, installation).
           Corrections : renforts viscéral = futurs comptes BDB.
           Profils encadrement (MAUSSET cadre, PARRE encadrement).
```

---

## 1 — CONTEXTE FONDAMENTAL

Le logiciel métier du bloc opératoire (OPTIM) produit des exports tabulaires couvrant **20 ans de saisies humaines** (2006→2026). Ces saisies ont été effectuées par des dizaines de personnes différentes (secrétaires, panseuses, IDE) **sans aucun référentiel normalisé, sans contrainte de saisie, sans cohérence imposée**.

Le résultat brut pour le seul périmètre ortho/neuro : **plus de 90 000 libellés d'interventions distincts**.

Un travail de nettoyage de 12 mois a permis de regrouper 70 361 interventions sous 420 protocoles dans Supabase. Ce regroupement a été **trop agressif par endroits** — des informations utiles ont été sacrifiées pour atteindre une base fonctionnelle. Le travail d'audit de complétude vise à **récupérer ce qui a été perdu sans casser ce qui fonctionne**.

**Règle absolue : tout enrichissement part de la base existante (420 protocoles / 70 361 interventions) et l'améliore. On ne repart jamais de zéro.**

---

## 2 — COLONNES DE L'EXPORT — GRILLE DE LECTURE

### 2.1 — Chirurgien ⚠️ CONNUE MAIS INCOMPLÈTE

Présente dans `thesaurus_interventions.chirurgien`.

**Piège majeur : les chirurgiens retraités ont été éliminés lors du premier nettoyage.** Le travail de délestage initial s'est concentré sur les 9 chirurgiens actifs ortho. Mais l'export brut contient tous les chirurgiens sur 20 ans, y compris ceux partis à la retraite (Dr FOURASTIER, Dr VAQUIER, et potentiellement d'autres).

**10 chirurgiens identifiés sur l'export 2026 :** 9 ortho actifs + LAGARRIGUE Jean-François (neuro, compte BDB existant, seul neurochirurgien du secteur).

**Règle : les interventions des chirurgiens retraités doivent survivre dans la base.** Même si un chirurgien est parti, ses interventions passées alimentent les cahiers de chirurgiens. C'est d'autant plus critique pour les interventions rares qui ne possèdent plus de mémoire humaine vivante dans l'équipe actuelle. **BDB doit être cette mémoire.**

**Stratégie :**
- Répertorier tous les chirurgiens présents dans l'export brut (actifs + retraités)
- Conserver les interventions des retraités avec le même niveau de détail
- Marquer les chirurgiens retraités comme inactifs (flag `actif = false`, `retirement_date`)
- Arbitrage Manu au cas par cas si un chirurgien inconnu apparaît

---

### 2.2 — Spécialité ✅ CONNUE

Déjà dans `thesaurus_interventions.specialite`.
Deux valeurs périmètre BDB V1 : ORTHOPEDIE, NEURO CHIRURGIE.
Fiable.

---

### 2.3 — Date de l'intervention ⚠️ CONNUE MAIS SENSIBLE RGPD

**INTERDIT ABSOLU — RÈGLE RGPD BDB :**

> **Ne JAMAIS afficher simultanément une date précise + un protocole opératoire + un chirurgien.**

Cette combinaison reconstitue une donnée médicale tacite et sensible, même si toutes les données patients ont été anonymisées.

**Stratégie de troncature obligatoire :**
- Les dates ne sont manipulées qu'au format **MM/YYYY** ou **YYYY-MM** — jamais plus précis
- Les jours et horaires d'intervention **doivent être détruits dès la première manipulation**
- Aucune colonne `jour`, `date_complete`, `heure` ne doit jamais exister dans Supabase BDB
- Le format de stockage en base = `YYYY-MM` (text) ou au maximum `date` tronquée au 1er du mois

**Cette règle est non négociable et permanente.**

---

### 2.4 — Protocole Opératoire ⚠️ CONNUE MAIS DANGEREUSE

Déjà dans `thesaurus_interventions.protocole` et `thesaurus_protocoles`.
**C'est LA colonne qui a causé 12 mois de souffrance.**

Pièges documentés :
- 90 000+ libellés bruts → regroupés en 420 protocoles
- Le regroupement actuel est **fonctionnel mais bancal et provisoire**
- Le protocole fourre-tout **ACT-0006 "PETITE INTERVENTION"** (freq 2838) = poubelle des secrétaires

**Désalignement systémique identifié :** OPTIM exporte `SYNTHESE FRACTURE DE...` là où la base BDB stocke `SYNTHESE DE FRACTURE DE...`. Pattern identique sur 7 protocoles. La convention BDB suit la codification CCAM (S1).

**Nettoyage automatique requis à l'import :** retirer les noms de chirurgiens en suffix (`-DR ALAIN`, `VA- DR PICOULEAU`, `- Dr LAGARRIGUE`). 181/894 lignes impactées sur l'export 2026.

**INTERDIT : ne jamais considérer les 420 protocoles comme définitifs. Toujours vérifier, jamais écraser.**

---

### 2.5 — Côté à opérer 🆕 CRITIQUE MAIS VICIEUSE

**Valeur métier : très haute.** La latéralité impacte :
- **Le picking matériel** — instruments latéralisés, implants spécifiques côté
- **L'installation patient** — décubitus dorsal, ventral, latéral du bon côté
- **Les cours et rappels BDB** — tout le contenu pédagogique lié au positionnement

**Confirmé sur export 2026 : colonne 100% vide.** Zéro valeur sur 894 lignes.

**Latéralité récupérable à 91%** via croisement :
- Via Notes : 783/894 (88%) — source principale
- Via Protocole anesthésie : 240/894 (27%) — `Coté DROIT`, `Coté GAUCHE`
- Via colonne dédiée : 0/894 (0%) — inutilisable

---

### 2.6 — Durée protocoles 🆕 EXPLOITABLE

Durée opératoire en **minutes** (confirmé OPTIM).

**Découverte : la durée est un attribut du protocole, pas de l'intervention unitaire.** Toutes les PTG = 110min, tous les canaux carpiens = 20min. C'est une valeur de référence par protocole, pas une mesure réelle par acte.

Médiane globale = 60min. Plage = 0-200min.

---

### 2.7 — Panseuse (saisie) 🆕 TROMPEUSE — CONCORDANCE ARBITRÉE

**22 panseuses identifiées sur l'export 2026.** Concordance arbitrée par Manu le 2026-03-24.

**Répartition :**

| Catégorie | Nombre | Compte BDB | Détail |
|---|---|---|---|
| Équipe fixe ortho | 15 | OUI | Noyau dur + réguliers |
| Renforts viscéral | 6 | NON (v1 ortho) | Comptes prévus dans versions futures |
| Cadre/encadrement en dépannage | 1 | OUI | MAUSSET Estelle — cadre, pas vocation salle |

**Profils arbitrés (15 comptes BDB) :**

| Nom | Profil | Rôle | Note |
|---|---|---|---|
| NICOLAS Carole | IDE | panseur | |
| LEPROUX Carole | IDE | panseur | |
| ROHAUT Manuel | IDE | panseur | **Admin BDB** |
| COMPAIN Julie | IDE | panseur | |
| FREDAIGUE Cynthia | IBODE | instru | |
| PAQUIER Marion | IDE | panseur | |
| CARRIER Eléonore | IDE | instru | |
| DELONG Isabelle | IDE | instru | |
| THUILLIER Emma | IDE | instru | |
| NORMAND Carine | IDE | instru | |
| MAILLET Valérie | IBODE | instru | |
| MERIC DE BELLEFON Quentin | IDE | instru | |
| BUENO Sophie | IDE | instru | |
| DUGOT Sabine | IBODE | instru | |
| PARRE Franck | IBODE | instru | Encadrement, 35+ ans de maison |

**Renforts viscéral (6 sans compte v1) :**
BARRY Ophélie (IDE panseur) · ROBY Marie-Hélène (IDE panseur) · CLUZAUD Pierre-Alexis (IDE instru) · TONDUSSON Jeanne (IDE instru) · ROCHE Corinne (IDE panseur) · UNIA Manon (IDE panseur)

**Cadre :** MAUSSET Estelle (IDE panseur, compte BDB, cadre — dépannage uniquement)

**Pièges documentés (inchangés depuis v1.1.0) :**
- Changements de nom (mariage/divorce) sur 20 ans
- Ne jamais fusionner automatiquement sur le nom seul
- Renforts viscéral = futurs comptes BDB (pas hors-scope, juste pas dans v1 ortho)
- Réconciliation manuelle obligatoire (validation Manu)

**Rappel : instru est panseur mais la réciproque n'est pas vraie.** Un instru (instrumentiste) travaille au champ opératoire. Un panseur circule et gère le matériel hors champ. L'IBODE est le diplôme spécialisé bloc ; l'IDE est le diplôme généraliste.

---

### 2.8 — Prothèses 🆕 LEURRE, IGNORER

Inutilisable en l'état. Contenu trop bruité.

**Décision Manu : ignorée pour cette passe d'analyse.**

**INTERDIT : ne jamais tenter d'exploiter cette colonne sans accord explicite de Manu.**

---

### 2.9 — Protocole anesthésie 🆕 TAMPON PROVISOIRE

Hors périmètre BDB. Exploitable uniquement en croisement pour la latéralité.

Valeurs identifiées : `PROGRAMMEE` (232×), `Coté DROIT` (148×), `Coté GAUCHE` (92×), `Protocole vérification anesthésie OK` (128×), `CHIRURGIE A CIEL OUVERT` (103×), `ANESTHESIE GENERALE` (15×), `RACHI ANESTHESIE`, `BLOC PERI-NERVEUX`.

**Détruire après extraction des informations utiles. Ne jamais persister en base.**

---

### 2.10 — Note 🆕 MINE D'OR — CONFIRMÉE

**Analyse complète sur 894 lignes (hors 35 déchets HM_SIG = codes produits OPTIM, détruits) :**

| Donnée enfouie | Occurrences | % | Impact BDB |
|---|---|---|---|
| Latéralité | 749 | 91% | Thésaurus + installation + cours |
| Matériel/implant nommé | 103 | 13% | **Picking / cahiers chirurgiens** |
| Hospitalisation (sortie J+n) | 70 | 9% | Organisation bloc |
| Allergies | 35 | 4% | **Sécurité patient** |
| Ambulatoire (AMBU) | 28 | 3% | Organisation bloc |
| Technique / voie d'abord | 27 | 3% | Classification protocoles |
| Installation patient | 1 | 0.1% | Rare mais précieux |

**Matériel/implant :** les Notes `ABLATION MATERIEL DE SYNTHESE` contiennent fabricant + référence exacte (`plaque Synthes`, `plaque Newclip`, `vis SBI Autofix diam 6.5`, `plaque Variax`, `plaque Stryker`). Directement exploitable pour la table `items` et les cahiers de picking.

**Allergies :** 35 Notes mentionnent des allergies (pénicilline, amoxicilline, latex). Info critique sécurité.

---

## 3 — DÉMINAGE ACT-0006 "PETITE INTERVENTION"

**41 lignes analysées sur l'export 2026. Résultat :**

| Catégorie | Nb | Reclassable | Exemples |
|---|---|---|---|
| Septique / lavage | 7 | ✅ | plaie, abcès, nécrose, sepsis |
| Tendon | 5 | ✅ | Achille, extenseurs, transfert LFH |
| Synthèse / fracture | 4 | ✅ | olécrane, col fémur, radius |
| Ablation (fixateur, vis, endobouton) | 4 | ✅ | matériel divers |
| Calcaneoplastie | 2 | ✅ | dont 1 sous arthroscopie |
| Nerf | 2 | ✅ | ulnaire coude |
| Autres (kyste, arthrodèse, ongle, coccyx, suture, ligament) | 9 | ✅ | gestes isolés |
| Inclassables | 5 | ⚠️ | 4/5 reclassables manuellement |
| Déchets HM_SIG | 3 | ❌ | codes produits, info perdue |

**Score : 33/41 reclassables automatiquement (80%), 5 manuellement, 3 déchets.**

La Note est la clé pour éclater ACT-0006 vers les vrais protocoles.

---

## 4 — STRATÉGIES DE NOMMAGE (arbitrées Manu 2026-03-24)

### S1 — Convention CCAM pour les articles

Les intitulés BDB doivent se rapprocher de la codification CCAM. En particulier le bon usage des articles : `SYNTHESE DE FRACTURE DE POIGNET` (pas `SYNTHESE FRACTURE DU POIGNET`).

### S2 — Hiérarchie avec séparateur `>`

Étendre le pattern épaule à d'autres protocoles parents :

```
ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE
ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE
PROTHESE TOTALE DE GENOU > LAVAGE
PROTHESE TOTALE DE GENOU > REPRISE
PROTHESE TOTALE DE GENOU > PONCTION
...
```

Le séparateur `>` exprime la relation geste principal → sous-geste. Un protocole enfant hérite du picking parent + ses spécificités.

### S3 — La base est vivante

Les protocoles (tendons d'Achille, LCA, lavages, etc.) sont amenés à évoluer. Ne jamais considérer la base comme figée.

---

## 5 — VOIE D'ABORD = DIMENSION STRUCTURANTE

**Découverte session 2026-03-24.** La voie d'abord (ciel ouvert, endoscopie, arthroscopie, percutané) est une dimension du protocole au même titre que la zone anatomique ou la spécialité.

Elle impacte :
- L'installation de salle (besoin colonne arthro/endo)
- L'installation de l'équipe
- Le picking matériel

**Exemples :**
- `CANAL CARPIEN` (ciel ouvert) ≠ `CANAL CARPIEN SOUS ENDOSCOPIE` → 2 protocoles distincts
- `LIBERATION DU NERF ULNAIRE` (ciel ouvert) ≠ `LIBERATION DU NERF ULNAIRE SOUS ENDOSCOPIE (FMS)` → 2 protocoles distincts
- `HALLUX VALGUS` ≠ `HALLUX VALGUS EN PER-CUTANE` → 2 protocoles distincts

---

## 6 — MATRICE DE CROISEMENT

```
                          Côté    Durée   Panseuse  Prothèses  Anesth   Note
                          opéré   proto   (saisie)             ésie
Enrichir protocoles        —       —        —         ❌        ⚠️       ✅✅✅
Latéralité réelle          ✅⚠️    —        —         —         ✅       ✅
Durée par protocole        —       ✅       —         —         —        —
Traçabilité saisie         —       —        ✅⚠️      —         —        —
Picking / DMI              —       —        —         ❌        —        ✅⚠️
Déminer ACT-0006           —       —        —         —         ⚠️       ✅✅✅
Installation patient       ✅⚠️    —        —         —         ✅       ✅
Cours / pédagogie          ✅⚠️    ✅       —         —         —        ✅
Mémoire interv. rares      —       ✅       —         —         —        ✅✅✅
Voie d'abord               —       —        —         —         ✅       ✅
Allergies                  —       —        —         —         —        ✅
```

---

## 7 — ARBITRAGES PROTOCOLES (session 2026-03-24)

### Groupe 3 — Existants en base (3)

`ABLATION D'ONGLE` · `SYNTHESE DE FRACTURE D'HUMERUS` · `SPEEDBRIDGE DÉSEINSERTION RÉINSERTION DU TENDON D'ACHILLE` → tous présents en base Supabase.

### Groupe 2 — Existants sous autre nom (5)

| Export OPTIM | Protocole réel en base |
|---|---|
| `ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE` |
| `SUTURE COIFFE SOUS ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE` |
| `ACROMIOPLASTIE ET SUTURE DE COIFFE SS ARTHRO` | `ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE + SUTURE DE LA COIFFE` |
| `ACROMIOPLASTIE SOUS ARTHROSCOPIE` | `ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE` |
| `REPRISE DE PROTHESE D'EPAULE` | `REPRISE DE PROTHESE D'ÉPAULE` |

### Groupe 1 — Variantes de nommage (17)

15 match confirmés + 2 nouveaux protocoles :

| # | Décision | Détail |
|---|---|---|
| 1-7 | ✅ match | SYNTHESE FRACTURE × 7 (pattern "DE" manquant) |
| 8 | ✅ match | REPRISE DE PTH → ACT-0037 |
| 9 | ✅ match | REPRISE DE PTG → ACT-0085 |
| 10 | ✅ match | REPRISE DE LCA → ACT-0014 |
| 11 | ✅ match | REDUCTION LUXATION PTH → ACT-0056 |
| 12 | ✅ match | EVACUATION D'HEMATOME → ACT-0409 (DB à corriger → D'HEMATOME) |
| 13 | 🆕 nouveau | LIBERATION NERF ULNAIRE (ciel ouvert) ≠ sous endoscopie |
| 14 | 🆕 nouveau | TRANSPOSITION NERF ULNAIRE ≠ cubital (2 nerfs, 2 pickings) |
| 15 | ✅ match | REINSERTION TENDON EXTENSEUR → ACT-0126 |
| 16 | ✅ match | LAVAGE PTG → LAVAGE PROTHESE TOTALE DE GENOU (existant) |
| 17 | ✅ match | SUTURE TENDON D'ACHILLE (existant en base) |

**Fusion confirmée :** `PTH VA` + `PTH PAR VOIE ANTERIEURE` → `PROTHESE TOTALE DE HANCHE PAR VOIE ANTERIEURE`

---

## 8 — RÈGLES D'IMPORT — ANTI-RÉGRESSIONS

| # | Règle | Pourquoi |
|---|---|---|
| R1 | Ne jamais écraser les 420 protocoles existants | 12 mois de travail |
| R2 | Ne jamais exploiter "Prothèses" sans accord Manu | Leurre documenté |
| R3 | Ne jamais créer de compte BDB depuis "Panseuse (saisie)" automatiquement | Réconciliation Manu obligatoire |
| R4 | Ne jamais prendre "Côté à opérer" seul pour la latéralité | Colonne 100% vide, croiser Note + Anesthésie |
| R5 | Ne jamais jeter la colonne "Note" sans analyse | Mine d'or confirmée |
| R6 | "Protocole anesthésie" = tampon provisoire, jamais persisté | Hors périmètre BDB sauf croisements |
| R7 | Toute réconciliation panseuse → profil BDB = validation Manu | Zéro automatisme sur les identités |
| R8 | Chaque import enrichit la base existante, ne la remplace pas | Zéro régression |
| R9 | **INTERDIT RGPD : ne JAMAIS afficher date précise + protocole + chirurgien** | Reconstitution donnée médicale |
| R10 | **Dates tronquées YYYY-MM — jours et horaires détruits immédiatement** | RGPD |
| R11 | **Conserver les interventions des chirurgiens retraités** | Mémoire interventions rares |
| R12 | **Ne jamais qualifier "Chirurgien" de fiable sans vérifier les retraités** | Export brut ≠ périmètre actif |
| R13 | **Renforts viscéral = futurs comptes BDB, pas hors-scope** | Prévu dans versions post-v1 ortho |
| R14 | **Nettoyage noms chirurgiens en suffix obligatoire à l'import** | `-DR ALAIN`, `VA- DR PICOULEAU`, etc. |
| R15 | **HM_SIG = déchets, détruire à l'import** | Codes produits OPTIM sans valeur |

---

## 9 — PLAN D'ATTAQUE

**Phase A — Calibrage (fichiers 2026, petit volume) ✅ FAIT**
1. ✅ Import ortho 2026 (823 lignes) + neuro 2026 (71 lignes)
2. ✅ Troncature RGPD dates → YYYY-MM
3. ✅ Caractérisation 10 colonnes (taux remplissage, formats, valeurs)
4. ✅ Confrontation 100 protocoles export vs 373 en base → 25 non matchés résolus
5. ✅ Concordance 22 panseuses arbitrée Manu
6. ✅ Déminage ACT-0006 (33/41 reclassables)
7. ✅ Mining Notes (matériel 13%, allergies 4%, latéralité 91%)

**Phase B — Historique (volume complet) → PROCHAINE**
8. Importer progressivement par année ou par tranche
9. Appliquer les mêmes analyses à grande échelle
10. Enrichir la base Supabase de façon incrémentale
11. Intégrer les interventions des chirurgiens retraités

**Phase C — Réconciliation identités panseuses**
12. Étendre la concordance aux 20 ans d'historique (nouveaux noms, changements)
13. Établir la table de correspondance complète (validation Manu)

**Phase D — Exploitation transverse**
14. Croisement Côté × Note × Anesthésie → latéralité fiable
15. Extraction matériel/implants des Notes → table items
16. Extraction allergies → sécurité
17. Impact sur modules : installation patient, cours, fiches

---

## 10 — HISTORIQUE DES VERSIONS

| Version | Date | Modification |
|---|---|---|
| 1.0.0 | 2026-03-24 | Création. 10 colonnes documentées. Matrice croisement. Règles anti-régression. |
| 1.1.0 | 2026-03-24 | Corrections Manu : chirurgiens retraités, RGPD dates, latéralité installations, durée minutes. |
| 1.2.0 | 2026-03-24 | Consolidation session complète. Concordance 22 panseuses arbitrée. Arbitrages G1/G2/G3 (25 résolus). Déminage ACT-0006 (80%). Stratégies S1/S2/S3. Voie d'abord = dimension structurante. Notes confirmées mine d'or. 15 règles anti-régression. Phase A calibrage = FAIT. |
