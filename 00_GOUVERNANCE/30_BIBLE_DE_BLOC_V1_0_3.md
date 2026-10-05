# BIBLE DE BLOC — Référentiel Unique
## Planning Engine · Ortho-Neurochirurgie

```
VERSION     : 1.0.3
DATE        : 2026-02-28
STATUT      : SOURCE DE VÉRITÉ MÉTIER
AUTEUR      : Manu Rohaut
REMPLACE    : v1.0.2
NOYAU_REF   : NOYAU_VERITE_V1.10.0
MAINTENANCE : Ce fichier documente le périmètre actuel uniquement.
              Il ne nie pas l'existence de ce qui est hors périmètre.
              Toute règle métier corrigée doit être mise à jour ici ET dans NOYAU_VERITE.
```

> PÉRIMÈTRE ACTUEL — Ce document traite exclusivement du secteur Ortho-Neurochirurgie,
> salles 05 à 08, du lundi au vendredi.
> D'autres secteurs, salles et créneaux existent dans le bloc réel.
> Ils seront traités dans les briques suivantes du projet.

---

## SOMMAIRE

1. [Le Bloc — Organisation physique](#1-le-bloc--organisation-physique)
2. [Les Créneaux Opératoires](#2-les-créneaux-opératoires)
3. [Les Acteurs du Bloc](#3-les-acteurs-du-bloc)
4. [Le Couloir — Secteur distinct](#4-le-couloir--secteur-distinct)
5. [Patterns Terrain Réels](#5-patterns-terrain-réels)
6. [Le SLOT — Unité d'Analyse Officielle](#6-le-slot--unité-danalyse-officielle)
7. [Les Flags Opératoires](#7-les-flags-opératoires)
8. [Les États des Slots](#8-les-états-des-slots)
9. [Règles de Saisie et Codes](#9-règles-de-saisie-et-codes)
10. [Anti-Patterns Documentés](#10-anti-patterns-documentés)
11. [Glossaire](#11-glossaire)

---

## 1. Le Bloc — Organisation Physique

### 1.1 Secteur concerné (périmètre actuel)

**Ortho-Neurochirurgie**

Salles opératoires traitées : **5 · 6 · 7 · 8**

D'autres secteurs existent dans le bloc réel (VISCÉRAL salles 01-04, URO/CARDIO/ENDO salles 09-11...).
Ils sont hors périmètre actuel — briques suivantes.

### 1.2 Semaine opératoire (périmètre actuel)

Les opérations programmées ont lieu du **lundi au vendredi**.
Les nuits et week-ends existent et ont leur propre logique de garde.
Ils sont hors périmètre actuel — briques suivantes.

```
Jours traités  : LUNDI · MARDI · MERCREDI · JEUDI · VENDREDI
Hors périmètre : SAMEDI · DIMANCHE · NUITS
```

### 1.3 Ce que représente une "journée"

Pour chaque salle, une journée est composée de **3 créneaux** : Matin, Après-midi, Soir.
Le Soir est structurellement différent (voir section 2).

Chaque salle peut être :
- **Ouverte** : une équipe chirurgicale est affectée
- **Fermée** : la salle n'est pas programmée ce créneau
- **Vide** : aucune donnée saisie (différent de fermée volontairement)

---

## 2. Les Créneaux Opératoires

### 2.1 MATIN

- Plage de chirurgie **programmée**
- Début de journée opératoire
- Personnel : chirurgien + INSTRU + PANSEUR affectés
- Flag possible : **Ouverture** (présence du personnel d'ouverture de salle)
- C'est le créneau **de référence** : AM et Soir s'y réfèrent souvent

### 2.2 APRÈS-MIDI (code : APREM)

- Plage de chirurgie **programmée** (suite du Matin)
- **Règle terrain majeure** : dans la grande majorité des cas, le chirurgien du Matin est le même l'Après-midi sur la même salle
- **Règle terrain majeure** : l'équipe IDE est souvent identique Matin / AM
- Le système propose un **checkbox "= Matin"** pour propager automatiquement
- Pas de flag Ouverture (personnel déjà en place)
- Pas de flag Viscéral sur les slots SALLE (le secteur Viscéral est un lieu distinct)

### 2.3 SOIR

> Le créneau Soir est **structurellement différent** des deux autres.
> Il représente la **plage d'urgences**, pas de la chirurgie programmée.
> Le programme bascule en gestion traumato, septique et non programmé ORTHO.

Caractéristiques du Soir :
- Pas de programmation chirurgicale habituelle
- **Typiquement 2 salles fermées** sur les 4 (mais ce n'est pas toujours les mêmes — variable)
- **2 chirurgiens de garde** présents sur les 2 salles restantes :
  - Le chirurgien **"queue de garde"** : celui de la veille qui termine sa garde
  - Le chirurgien **"entrant"** : celui du jour qui prend les nouvelles urgences
- Les IDEs Soir sont rarement identiques à ceux de l'AM (le "= AM" est rare mais possible)
- Pas de flag Ouverture
- Pas de flag Viscéral sur les slots SALLE (le secteur Viscéral est un lieu distinct)

### 2.4 Synthèse des créneaux

| Créneau | Type       | Chirurgien            | Flag Ouverture | Flag Viscéral SALLE |
|---------|------------|----------------------|----------------|---------------------|
| MATIN   | Programmé  | Affecté               | Oui            | Non                 |
| APREM   | Programmé  | Souvent = Matin       | Non            | Non                 |
| SOIR    | Urgences   | Garde (2 spécifiques) | Non            | Non                 |

Le flag Viscéral existe uniquement sur les slots COULOIR (voir section 7).

---

## 3. Les Acteurs du Bloc

### 3.1 Le Chirurgien

- **Un chirurgien par salle par créneau** (pas plusieurs)
- Identifié par son code CSV (clé unique dans `PlanningMembers`)
- Fonction : `medecin`
- Peut opérer sur plusieurs salles dans la semaine mais **pas simultanément** sur 2 salles au même créneau

**Règle de déduplication** : si le même chirurgien apparaît dans plusieurs atomes d'un même slot, il ne compte qu'**une seule fois** dans les métriques.

### 3.2 Les IDEs — Rôles INSTRU et PANSEUR

Chaque salle, à chaque créneau, nécessite **2 IDEs** :

| Rôle    | Signification        | Notes                                  |
|---------|---------------------|----------------------------------------|
| INSTRU  | Infirmier·e Instrumentiste | Directement au champ opératoire |
| PANSEUR | Infirmier·e Panseur  | Circule, gère le matériel hors champ   |

**Binôme INSTRU/PANSEUR** : ils fonctionnent par paire sur une même salle.
La saisie se fait toujours par salle : d'abord l'INSTRU, puis le PANSEUR de la même salle.

Fonction dans le référentiel : `infirmier`

### 3.3 Doublure

La doublure est un IDE **supplémentaire** présent sur un slot parce que la personne doublée est **en apprentissage**.

- Ce n'est pas un remplacement
- Ce n'est pas un renfort
- C'est un encadrement : la personne doublée est en situation d'apprentissage sur ce slot
- La doublure est un **facteur de complexité** (charge de travail réelle supérieure)
- Flag `doublure === 1` sur l'atome concerné

### 3.4 Ouverture

Personnel présent pour **préparer la salle** avant les interventions du Matin.

- Flag Ouverture = uniquement sur créneau MATIN
- Pas d'Ouverture sur APREM ou SOIR
- Peut être n'importe quel IDE ou personnel paramédical

---

## 4. Le Couloir — Secteur Distinct

Le Couloir est un **secteur de soutien logistique** du bloc.

Il est **distinct des salles numérotées**. Sa logique est différente :
- Pas de chirurgien
- Pas de binôme INSTRU/PANSEUR au sens des salles
- Personnel de soutien (aides-soignants, brancardiers, renforts)
- Flag **Viscéral** possible : renfort du COULOIR vers le secteur Viscéral

> Le flag Viscéral n'existe **que** sur les slots COULOIR. Jamais sur les slots SALLE.

---

## 5. Patterns Terrain Réels

Ces patterns sont issus de l'observation terrain. Ils ne sont pas des règles absolues mais des tendances documentées.

| Pattern | Fréquence | Notes |
|---------|-----------|-------|
| Chirurgien Matin = Chirurgien AM | Très fréquent | Case "= Matin" proposée |
| IDEs Matin = IDEs AM | Fréquent | Case "= Matin" proposée |
| IDEs AM = IDEs Soir | Rare | Case "= AM" disponible mais rare |
| 2 salles fermées au Soir | Quasi-systématique | Pas toujours les mêmes salles |
| Doublure concentrée sur Matin | Fréquent | Apprentissage en chirurgie programmée |

---

## 6. Le SLOT — Unité d'Analyse Officielle

### 6.1 Définition

> SLOT = { salle + jour + créneau }

C'est l'unité indivisible du Planning Engine. Tout ce qui se compte, s'analyse ou s'exporte repose sur le SLOT.

**Ne pas confondre SLOT et intervention chirurgicale :**
- Un SLOT peut contenir plusieurs interventions
- Une intervention peut s'étendre sur plusieurs slots
- Ces deux objets appartiennent à des modules différents et ne s'agrègent pas

### 6.2 Volume de slots (périmètre actuel)

| Type | Calcul | Total |
|------|--------|-------|
| Slots SALLE | 4 salles × 5 jours × 3 créneaux | 60 slots/semaine |
| Slots COULOIR | 1 couloir × 5 jours × 3 créneaux | 15 slots/semaine |
| **Total** | | **75 slots/semaine** |

### 6.3 L'Atome

Un atome = un enregistrement de saisie dans un slot.

Un slot peut contenir plusieurs atomes (plusieurs lignes de saisie pour la même {salle, jour, créneau}).

**L'atome n'est pas une intervention.** Compter les atomes comme des interventions est un anti-pattern documenté.

### 6.4 Représentation canonique de la salle

> SALLE canonique = `"05"` (string, padded 2 chiffres)

Fonction d'accès unique : `PlanningSchema.normalizeSalle(value) → "05"`

Comportement :
- `null` / `undefined` → throw
- Format non numérique → throw
- Sinon → `padStart(2, "0")`

Cette règle s'applique à tout le code : storage keys, clés composites, exports, comparaisons.

---

## 7. Les Flags Opératoires

### 7.1 Flag Ouverture

- Créneau : MATIN uniquement
- Signification : personnel présent pour l'ouverture de salle
- Pas applicable sur APREM ou SOIR

### 7.2 Flag Viscéral

- Secteur : COULOIR uniquement
- Signification : renfort du couloir vers le secteur Viscéral (salles 01-04)
- **Jamais sur un slot SALLE** — c'est un anti-pattern documenté

### 7.3 Flag Doublure

- Applicable sur tout créneau, toute salle
- `doublure === 1` sur l'atome
- Facteur de complexité : 1 point dans le calcul d'état du slot

---

## 8. Les États des Slots

### 8.1 Tableau des états

| Libellé         | Code interne      | Condition                                                          | Couleur      |
|-----------------|-------------------|--------------------------------------------------------------------|--------------|
| STABLE          | STABLE        | Slot opérant, aucun facteur de complexité                          | Vert         |
| FRAGILE         | FRAGILE       | Slot opérant, 1 facteur de complexité                              | Orange/Jaune |
| CRITIQUE        | CRITIQUE      | Slot non-opérant (IDE manquant) OU 2+ facteurs complexité          | Rouge        |
| FERMÉ NATUREL   | FERME_NATUREL | Salle volontairement non programmée                                | Gris foncé   |
| FERMÉ DÉGRADÉ   | FERME_DEGRADE | Salle fermée par manque de personnel                               | Gris hachuré |
| VIDE            | VIDE          | Aucune donnée saisie pour ce slot                                  | Gris clair   |

> VIDE n'est pas FERMÉ.
> FERMÉ NATUREL n'est pas FERMÉ DÉGRADÉ.
> Ces trois états ont des statistiques séparées.

### 8.2 Arbre de décision (Vn — calculé uniquement)

```
SLOT
├── salle_fermee_naturel = 1 ──────────────────────────────→ FERMÉ NATUREL
├── salle_fermee_degrade = 1 ──────────────────────────────→ FERMÉ DÉGRADÉ
├── chirurgien absent + IDE absent ────────────────────────→ VIDE
├── chirurgien présent
│   ├── INSTRU absent OU PANSEUR absent ───────────────────→ CRITIQUE (non-opérant)
│   └── INSTRU présent ET PANSEUR présent (OPÉRANT)
│       ├── 0 facteur de complexité ───────────────────────→ STABLE
│       ├── 1 facteur de complexité ───────────────────────→ FRAGILE
│       └── 2+ facteurs de complexité ─────────────────────→ CRITIQUE
```

### 8.3 Facteurs de complexité (Vn)

| Facteur             | Condition de détection                                   |
|---------------------|----------------------------------------------------------|
| INSTRU non qualifié | code INSTRU est `INTERIMAIRE` ou `ETUDIANT`              |
| Urgence (soir)      | `creneau === "SOIR"`                                     |
| Doublure présente   | `doublure === 1` sur au moins un atome du slot           |

Chaque facteur compte pour 1. Cumul → niveau de stabilité.

### 8.4 Principe Vn vs Vn+1

**Vn (actuel)** : Tous les états sont **calculés automatiquement** depuis les données brutes. Aucune intervention humaine dans la qualification des états.

**Vn+1 (futur)** : Un état "expert" pourra être attribué manuellement par le cadre de bloc. Il sera affiché **séparément** de l'état calculé. Aucune fusion automatique des deux n'est autorisée.

---

## 9. Règles de Saisie et Codes

### 9.1 Règle fondamentale des codes

> Tous les selects HTML utilisent les **codes CSV** dans `option.value`.
> L'affichage lisible est toujours géré par `PlanningMembers.display(code)`.
> Jamais de nom affiché en value d'un select.

### 9.2 Placeholders officiels

| Code         | Signification                           |
|--------------|-----------------------------------------|
| `INTERIMAIRE`| Personnel intérimaire (externe)         |
| `ETUDIANT`   | Étudiant en formation                   |

Ces deux codes sont valides dans le système et doivent être proposés dans les selects IDEs.

### 9.3 Règle d'exclusion cross-salles (slot editor)

Dans l'éditeur de slot unitaire : un IDE sélectionné dans une salle ne peut plus apparaître dans une autre salle pour le **même créneau** (exclusion dynamique au moment du clic).

Dans les modales batch : l'exclusion cross-salles est envisagée mais non activée en Vn — hook documenté pour Vn+1.

### 9.4 Propagation "= Matin"

- Disponible sur AM (systématiquement)
- Disponible sur Soir (rare, case à cocher)
- **Indépendant par ligne** : une salle peut propager, une autre non
- Si le select Matin change après propagation : le select propagé se met à jour en temps réel
- Si `= Matin` est coché et `Fermée` aussi : désactiver `= Matin` (mutuellement exclusifs)

### 9.5 Salles fermées au Soir

- Checkbox `Fermée` disponible colonne Soir des modales Chirurgiens et IDEs
- Les 2 salles fermées ne sont pas prévisibles (pas toujours les mêmes)
- Si `Fermée` : select Soir désactivé, `= Matin` décoché automatiquement

---

## 10. Anti-Patterns Documentés

Ces erreurs ont été rencontrées et doivent être évitées.

| Anti-pattern                                          | Erreur                                           | Correct                                          |
|-------------------------------------------------------|--------------------------------------------------|--------------------------------------------------|
| Compter les atomes comme des interventions            | 1 atome n'est pas 1 intervention                 | L'unité est le SLOT                              |
| Agréger COULOIR + SALLE ensemble                      | Logiques différentes, métriques différentes      | Analyser séparément                              |
| Compter un chirurgien par atome                       | Sur-représentation                               | Déduplication : 1 chir par slot                  |
| Utiliser `PlanningSchema.IDES` pour les codes display | Noms complets différents des codes CSV           | Toujours `PlanningMembers.display(code)`         |
| Qualifier INTERIMAIRE comme "mauvais"                 | C'est un fait structurel, pas un jugement        | Afficher comme tel, facteur de complexité neutre |
| Mettre un flag Viscéral sur un slot SALLE             | Le secteur Viscéral est un lieu distinct         | Flag Viscéral = COULOIR uniquement               |
| Confondre périmètre actuel et réalité du bloc         | D'autres salles et créneaux existent             | Distinguer ce qui est hors périmètre             |
| Confondre FERMÉ NATUREL et FERMÉ DÉGRADÉ             | Deux causes distinctes, stats séparées           | Deux états distincts                             |
| Confondre VIDE et FERMÉ                               | VIDE = pas de saisie, FERMÉ = décision           | Deux états distincts, deux couleurs différentes  |
| Qualifier un état sans données brutes                 | Interdit en Vn                                   | Calculer depuis les données, jamais estimer      |
| Confondre SLOT et intervention chirurgicale           | Un SLOT = {salle+jour+créneau}, une intervention = acte CCAM. Ces deux objets ne s'agrègent pas | Unités de modules distincts — ne jamais les fusionner |
| Compléter un silence informationnel                   | Si une donnée manque, l'inventer est une erreur grave | Déclarer la donnée manquante, ne jamais la fabriquer |
| CSS inline dans le markup HTML                        | Violation règle CDS                              | Classes Bootstrap / CDS uniquement              |
| onclick="..." dans les boutons                        | Violation règle CDS                              | addEventListener('click')                        |
| Utiliser Number(salle) pour les comparaisons         | Incohérence avec l'invariant canonique string    | PlanningSchema.normalizeSalle(salle)             |

---

## 11. Glossaire

| Terme            | Définition                                                                  |
|------------------|-----------------------------------------------------------------------------|
| **Bloc**         | Le bloc opératoire Ortho-Neurochirurgie (salles 5-6-7-8 + Couloir)         |
| **Créneau**      | L'une des 3 plages horaires : MATIN / APREM / SOIR                          |
| **SLOT**         | Unité indivisible = { salle, jour, créneau }                                |
| **Atome**        | Un enregistrement de saisie dans un slot                                    |
| **Chirurgien**   | Médecin opérateur affecté à un slot                                         |
| **INSTRU**       | IDE Instrumentiste, au champ opératoire                                     |
| **PANSEUR**      | IDE Panseur, rôle circulant                                                 |
| **Couloir**      | Secteur de soutien logistique du bloc, distinct des salles numérotées       |
| **Binôme**       | Paire INSTRU + PANSEUR d'une même salle au même créneau                     |
| **Doublure**     | IDE encadrant une personne en apprentissage sur un slot                     |
| **Ouverture**    | Personnel présent pour préparer la salle avant les interventions (Matin)    |
| **Viscéral**     | Renfort Couloir sur le secteur Viscéral (lieu distinct des salles ORTHO)    |
| **= Matin**      | Checkbox de propagation : copier la valeur Matin sur AM ou Soir             |
| **Queue de garde** | Chirurgien qui termine son tour de garde au créneau Soir                  |
| **STABLE**       | Slot opérant sans facteur de complexité                                     |
| **FRAGILE**      | Slot opérant avec 1 facteur de complexité                                   |
| **CRITIQUE**     | Slot non-opérant (IDE manquant) ou 2+ facteurs de complexité                |
| **FERMÉ NATUREL**| Salle volontairement non programmée                                         |
| **FERMÉ DÉGRADÉ**| Salle fermée par manque de personnel                                        |
| **VIDE**         | Aucune donnée saisie pour ce slot (différent de FERMÉ)                      |
| **Vn**           | Version actuelle : états uniquement calculés depuis les données brutes      |
| **Vn+1**         | Version future : introduction des états "expert" attribués manuellement     |
| **INTERIMAIRE**  | Placeholder officiel pour personnel intérimaire externe                     |
| **ETUDIANT**     | Placeholder officiel pour étudiant en formation                             |
| **Périmètre actuel** | Ce que le projet traite en ce moment (ORTHO, salles 05-08, lun-ven)    |
| **normalizeSalle** | Fonction canonique `PlanningSchema.normalizeSalle(v)` → string padded `"05"` |

---

## HISTORIQUE DES CORRECTIONS

| Date       | Version | Correction                                                                        |
|------------|---------|-----------------------------------------------------------------------------------|
| 2026-02-24 | 1.0.0   | Création. Consolidation sessions 2026-02-23 et 2026-02-24.                        |
| 2026-02-25 | 1.0.1   | E1 : suppression flag Viscéral sur slots SALLE — COULOIR uniquement. E2 : ajout distinction périmètre actuel / réalité bloc. Doublure : motif apprentissage explicité. FERMÉ NATUREL / FERMÉ DÉGRADÉ : deux états distincts. Contexte SOIR : bascule traumato/septique. |
| 2026-02-26 | 1.0.2   | Ajout NOYAU_REF en en-tête (v1.8.0). Ajout 2 anti-patterns : SLOT vs intervention chirurgicale, compléter un silence informationnel. |
| 2026-02-28 | 1.0.3   | NOYAU_REF mis à jour v1.8.0 → v1.10.0. Ajout §6.4 invariant salle canonique (string padded). Ajout anti-pattern Number(salle). Ajout normalizeSalle au glossaire. |
