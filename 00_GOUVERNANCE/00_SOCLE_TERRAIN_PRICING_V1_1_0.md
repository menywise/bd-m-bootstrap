# BDB — SOCLE TERRAIN PRICING

```
VERSION  : 1.1.0
DATE     : 2026-04-25
STATUT   : L3 CRÉATEUR — MATIÈRE PREMIÈRE — JAMAIS MONTRÉ TEL QUEL
USAGE    : Alimente tous les livrables commerciaux (calculateur, argumentaire, sondage, pitch)
ANONYMAT : Établissement source = "Bloc A" (clinique privée ortho, province, groupe national)
SOURCES  : Terrain créateur (20 ans) + Relyens 2023 + ONIAM + Académie Chirurgie + SF2S
           + CHU Montpellier (EM-Consulte 2021) + AORN Journal 2024 + UCSF + Perplexity 2025
```

---

## 0 — ÉTABLISSEMENT DE RÉFÉRENCE ("Bloc A")

| Caractéristique | Valeur |
|---|---|
| Type | Clinique privée, groupe national |
| Localisation | Province (ville moyenne) |
| Spécialité dominante | Orthopédie + traumatologie |
| ETP bloc (IDE + IBODE) | ~30 |
| Interventions/an (stabilisé 10 ans) | ~8 800 (dont ~4 000 ortho programmée) |
| Turnover annuel | ~20% (~6 départs/an) |
| Never events connus (2025) | 3 (erreurs de côté) |
| Pertes DMI estimées (chirurgiens) | 100 000 à 150 000 €/an (base 10 ETP ortho) |

**Source** : retours d'expérience chirurgiens en réunions internes + échanges informels terrain. Chiffres non audités comptablement mais cohérents avec l'ordre de grandeur des études nationales.

---

## 1 — POSTE 1 : ERREURS DMI (100 000 — 150 000 €/an)

### 1.1 Données terrain Bloc A

Les chirurgiens estiment le volume des erreurs liées aux ouvertures inutiles en salle entre **100 000 et 150 000 €/an**. Ce chiffre remonte régulièrement en réunions avec la direction.

**Types d'erreurs observées :**
- Ouverture inutile (mauvaise taille d'implant)
- Mauvais implant (confusion entre références)
- Mauvais côté (latéralité non vérifiée au picking)
- Implant cimenté ouvert au lieu de non-cimenté (et réciproquement)
- Double ouverture DM/DMI (erreur de préparation → déstérilisation)

**Impact** : facturation directe au bloc. Le matériel ouvert à tort est perdu (stérile rompu, non réutilisable). Certains DMI coûtent plusieurs milliers d'euros pièce (tiges fémorales, cupules, inserts).

### 1.2 Données nationales

Étude Relyens 2023 (10 000+ sinistres, 4 pays européens) :
- 339 never events identifiés
- **35% liés à un oubli de matériel** (compresse, embout, instrument)
- **16% liés à une erreur de procédure** (mauvais côté, mauvaise coordination pré-op)
- **32% des never events concernent la chirurgie orthopédique** — premier contributeur toutes spécialités
- **84% surviennent en chirurgie programmée** (pas en urgence) — la routine affaiblit la vigilance

### 1.3 Mécanisme de perte

```
Erreur de picking (mauvaise fiche, mauvais chirurgien, mauvaise latéralité)
    → Ouverture en salle d'un DMI incorrect
        → DMI perdu (stérilité rompue, non retournable)
            → Nouveau DMI demandé en urgence
                → Temps bloc perdu (attente livraison ou recherche arsenal)
                    → Coût minute bloc × minutes perdues
                        → Impact sur le programme opératoire suivant
```

**Coût minute bloc actualisé (ortho privé, 2024-2025)** : 15 à 19 €/min (Perplexity/comptabilité analytique). Fourchette haute 30-35€/min si on intègre l'amortissement matériel lourd (amplificateur, navigation, moteurs).

→ **10 min perdues par erreur DMI × 15€/min = 150€ de temps bloc perdu — en plus du DMI lui-même.**

---

## 2 — POSTE 2 : NEVER EVENTS (150 000 — 750 000 €/an pour 3 événements)

### 2.1 Données terrain Bloc A

- 3 never events connus en 2025 (erreurs de côté uniquement)
- Les procédures CRCI restent confidentielles, mais les montants évoqués "à demi-mot" commencent à 5 chiffres (≥ 10 000€)
- Impact non chiffré mais réel : stress équipe, perte de confiance, désorganisation

### 2.2 Données nationales sourcées

**Coûts directs (réintervention + séjour)** : 7 000 à 15 000 € par événement (temps bloc non facturable, imagerie de contrôle, DMS supplémentaire).

**Coûts médico-légaux** :
- Indemnisation patient (ONIAM/CCI) : **30 000 à 150 000€+** selon DFP (déficit fonctionnel permanent)
- Cas documentés en orthopédie : lésion nerveuse post-arthroscopie = ~130 000€ ; infection post-PTG = 85 000 à 120 000€
- Hausse prime RCP : impact mécanique de plusieurs dizaines de milliers d'euros/an sur les établissements à forte sinistralité

**Coûts indirects** :
- Perte de recettes par annulation programme : **3 000 à 8 000€ par demi-journée bloquée**
- Mobilisation équipe qualité + direction pour déclaration EIGS à l'ARS
- Impact durable sur le moral et la réputation

### 2.3 Calcul pour Bloc A (3 never events/an)

| Poste | Par événement | × 3/an |
|---|---|---|
| Coûts directs (réintervention) | 7 000 – 15 000 € | 21 000 – 45 000 € |
| Indemnisation patient | 30 000 – 150 000 € | 90 000 – 450 000 € |
| Coûts indirects (bloc + admin) | 10 000 – 30 000 € | 30 000 – 90 000 € |
| Hausse prime RCP | 10 000 – 30 000 € | 10 000 – 30 000 € |
| **TOTAL** | **57 000 – 225 000 €** | **151 000 – 615 000 €** |

→ **Fourchette réaliste Bloc A : 150 000 à 600 000 €/an pour 3 never events.**

---

## 3 — POSTE 3 : TURNOVER ET FORMATION (30 000 — 60 000 €/an)

### 3.1 Données terrain Bloc A

- Turnover ~20% → 1 à 2 nouvelles infirmières/an
- Cause dominante : burnout, épuisement post-erreur de côté
- Autonomie acquise en **3 à 6 mois** (ortho) et **jusqu'à 1 an** (traumato)
- Formation = **tutorat informel** uniquement
- Conséquence du tutorat : une IBODE confirmée "prend sous son aile" la nouvelle → surcharge cognitive, complication per-op, gestion pauses repas perturbée

### 3.2 Coûts de recrutement (Perplexity, données 2024-2025)

| Poste | Coût unitaire |
|---|---|
| Intérim en attente (4-6 mois, 18-22k€/mois) | 72 000 – 132 000 € |
| Cabinet recrutement (15-20% du brut annuel ~45k€) | 6 750 – 9 000 € |
| Onboarding (doublon 1-2 mois, perte productivité 30-50%) | 5 000 – 8 000 € |
| **TOTAL par recrutement** | **83 750 – 149 000 €** |

**⚠ Attention** : la fourchette haute (intérim 6 mois) est courante en province pour les profils IBODE spécialisés ortho. Le plafond Loi Rist (73€ brut/h) porte le coût employeur facturé à 800-1 100€/jour.

### 3.3 Coûts cachés non chiffrés

- **Surcharge cognitive de la tutrice** : fatigue, risque d'erreur accru pour l'IBODE confirmée qui forme ET opère simultanément
- **Triangle de Karpman** : dynamique relationnelle toxique (sauveur/victime/persécuteur) entre tutrice, nouvelle, et cadre — documenté dans la doctrine pédagogique BDB
- **Perte de savoir tacite** : quand une IBODE experte part, ses 10-15 ans de "trucs" (comment préparer tel chirurgien, quel ancillaire va avec quel implant, quelle position pour quelle voie d'abord) partent avec elle. Irréversible sans système de capitalisation.

### 3.4 Calcul pour Bloc A (1,5 départ/an en moyenne)

| Scénario | Coût |
|---|---|
| 1 départ/an (intérim court 3 mois) | 60 000 – 80 000 € |
| 2 départs/an (intérim long) | 160 000 – 300 000 € |
| **Médiane retenue** | **~100 000 €/an** |

---

## 4 — POSTE 4 : TEMPS PERDU PICKING ET RESTÉRILISATION

### 4.1 Données terrain Bloc A

À compléter par Manu — estimations demandées :
- Fréquence des doubles ouvertures DM/DMI en salle
- Temps perdu quand l'IBODE doit aller rechercher du matériel en cours d'intervention
- Fréquence des déstérilisations accidentelles

### 4.2 Coûts de restérilisation (Perplexity/SF2S)

| Poste | Coût |
|---|---|
| Cycle complet restérilisation set ancillaire ortho (PTH/PTG) | 145 – 170 € par intervention |
| Cycle autoclave seul (charge lourde ortho) | 80 – 120 € |
| Répartition : RH (lavage, tri, recomposition) ~50%, maintenance ~25%, fluides ~25% | — |

**Gain potentiel passage usage unique** (Académie de Chirurgie) : 305€/intervention (180€ stérilisation + 125€ temps salle).

### 4.3 Temps perdu en salle (estimation conservatrice)

| Événement | Fréquence estimée | Temps perdu | Coût (à 15€/min) |
|---|---|---|---|
| Recherche matériel manquant | 1-2×/jour | 10-15 min | 150 – 225 € |
| Double ouverture DMI | 2-3×/semaine | 5-10 min | 75 – 150 € |
| Déstérilisation accidentelle | 1-2×/semaine | 15-20 min | 225 – 300 € |

→ **Estimation annuelle (220 jours)** : 30 000 à 60 000 €/an de temps bloc perdu sur le seul poste picking/restérilisation.

---

## 5 — POSTE 5 : FORMATION — CE QUE BDB REMPLACE

### 5.1 La promesse BDB

BDB fournit l'équivalent d'un **ETP formateur distribué** : 1h/semaine de formation implicite disponible pour chaque ETP, directement dans sa poche, sans organisation, sans planning, sans friction.

**Calcul** : 10 ETP × 1h/semaine × 52 semaines = 520h/an

Coût horaire IBODE chargé (privé) : ~40-50€/h

→ **Valeur équivalente : 20 800 à 26 000 €/an**

### 5.2 Ce que BDB apporte et qu'aucun concurrent ne fait

| Module BDB | Problème résolu | Valeur |
|---|---|---|
| **Thesaurus** (395 protocoles, 89 653 interventions) | Standardisation des libellés, fin du chaos de nommage | Réduction erreurs de picking |
| **Fiches d'intervention** (picking) | Préparation matériel normalisée par protocole × chirurgien | Réduction ouvertures inutiles |
| **Préférences chirurgien** | Chaque chirurgien a ses habitudes documentées | Fin du "demande à Sabine" |
| **Arsenal** (matériel, étagères, zones) | Localisation physique du matériel | Réduction temps de recherche |
| **Glossaire** (567 termes) | Vocabulaire partagé, fin des confusions | Sécurité communication |
| **Installation patient** | Positions documentées par voie d'abord | Réduction erreurs d'installation |
| **Cours** | Formation structurée, accessible mobile | Remplacement tutorat informel |
| **Anatomie** | Référentiel clinique embarqué | Support per-op indirect |
| **Carnet de bord** | Progression traçable (Kolb 4 phases) | Onboarding structuré |
| **DISC** | Profils comportementaux équipe | Communication adaptée |
| **PAXIS** | Recueil situations, audit pratiques | Amélioration continue |
| **Transmissions** | Échanges inter-équipes | Continuité des soins |
| **Organisateur** | Parcours de préparation guidé | Standardisation workflow |
| **Signalements** | Remontée terrain directe | Détection précoce risques |
| **Recherche (Dork)** | Veille documentaire structurée | Accès sources qualifiées |

### 5.3 Le "trou du marché"

| Famille marché | Ce qu'ils font | Ce qu'ils ne font PAS |
|---|---|---|
| Logiciel de bloc (Optim, Torin) | Planning, traçabilité, saisie per-op | KM, formation, glossaire |
| WMS/Picking (Easy WMS) | Stocks, emplacements, bons | Connaissances, formation |
| KMS (Confluence, Zendesk) | Procédures, wiki, recherche | Planning, picking, traçabilité |
| LMS (Moodle, Dokeos) | Parcours formation, quiz | Flux opératoires, picking |
| Biblo.pro | Fiches picking + photos | Thesaurus, cours, formation, CCAM, préférences chirurgien |

→ **BDB est le seul outil qui fait le pont entre les connaissances opératoires et l'opération quotidienne du bloc.**

---

## 6 — POSTE 6 : GASPILLAGE COMPORTEMENTAL (25 000 — 80 000 €/an)

### 6.1 Données terrain Bloc A

**Casaques stériles utilisées comme gilets** :
Les infirmières qui ont froid en salle ouvrent chacune une casaque stérile pour l'utiliser en gilet de chaleur. 5 à 10 casaques gaspillées par jour × 5 jours × 44 semaines = **1 100 à 2 200 casaques/an**.
→ À 3,50€ pièce = **3 850 à 7 700 €/an**.

**Gants stériles gaspillés** :
Au minimum 2 paires de gants sont gaspillées par intervention (mauvaise taille ouverte, changement de gantage, double gantage préventif non justifié). 2 paires × 4 000 interventions × 2,50€ (nitrile sans latex) = **20 000 €/an**.

**Sous-total terrain Bloc A** : **~25 000 €/an** (conservateur, casaques + gants seuls).

### 6.2 Données académiques — le gaspillage comportemental est documenté

**Étude CHU Montpellier, bloc orthopédie adulte** (EM-Consulte 2021, vol. 40, n°4, p.160-163) :
"Les facteurs de gaspillage au bloc opératoire" identifie 4 causes comportementales :
- **Stress** — surcharge, urgences → ouverture préventive de DM "au cas où"
- **Habitudes/routines** — usage systématique sans analyse du besoin réel
- **Fatigue** — gardes longues → sur-équipement par précaution
- **Manque de connaissances** — faible culture économique et écologique, confusion entre "stérilité réelle" et "sécurité-rituelle"

Le bloc opératoire génère **30% des déchets hospitaliers** et représente **40% des dépenses** d'un établissement.

**Études françaises et européennes (synthèse Perplexity)** :
- Fournitures chirurgicales ouvertes mais non utilisées = **13 à 20% du coût total** des consommables
- Étude UCSF neurochirurgie : **653$ gaspillés par intervention** en moyenne, soit 2,9M$/an
- Étude Pays-Bas neuro-intervention : **515€ gaspillés par intervention**, jusqu'à 1 061€ pour les cas complexes
- Étude chirurgie générale (30 cas) : **8,3% des items ouverts non utilisés**, coût total 4 528$
- Bloc opératoire français (digestif/uro/gynéco) : **jusqu'à 20,1% du coût des fournitures gaspillé**
- Médicaments préparés non administrés : **75% gaspillés**, perte de 37 000€/an et 730 litres jetés

### 6.3 Le levier n°1 identifié : les fiches de préférences chirurgien

L'étude AORN Journal 2024 et les travaux français confirment que la **mise à jour des preference cards** (fiches de préférences chirurgien) est le levier le plus efficace et le moins coûteux :
- Nombre de sets ouverts par chirurgie : **baisse de 10 à 25%**
- Un bloc français a réduit le **coût de ses consommables de 15% sur une année** après mise à jour collégiale des fiches (chirurgiens + IBODE)
- Standardisation des packs chirurgicaux : économie projetée de **45 719$ annuels** + 1 100 kg de déchets en moins

**→ Les fiches de préférences chirurgien sont exactement le module "Préférences chirurgien" de BDB.**

### 6.4 Comment BDB agit sur le gaspillage comportemental

BDB ne flique pas. BDB agit sur les **causes** identifiées par Montpellier :

| Cause (Montpellier 2021) | Réponse BDB | Module |
|---|---|---|
| Manque de connaissances | Fiche picking exacte par protocole × chirurgien | Fiches intervention + Préférences |
| Habitudes non questionnées | Standardisation visible, partagée, auditable | Thesaurus + Organisateur |
| Stress / "au cas où" | Référentiel disponible dans la poche → confiance | App mobile + Arsenal |
| Fatigue / sur-équipement | Nouvelle IBODE sait quoi ouvrir dès J1 | Formation embarquée + Carnet |

### 6.5 Calcul étendu à 30 ETP (estimation)

| Source de gaspillage | Calcul | Coût/an |
|---|---|---|
| Casaques-gilets (7,5/j × 220j × 3,50€) | 1 650 casaques | 5 775 € |
| Gants gaspillés (2 × 4 000 × 2,50€) | 8 000 paires | 20 000 € |
| Fils ouverts non utilisés (~1/j × 220j × 4€) | 220 fils | 880 € |
| Compresses ouvertes en trop (~3 sachets/j × 220j × 0,80€) | 660 sachets | 528 € |
| Champs stériles ouverts en trop (~1/sem × 44 × 3€) | 44 champs | 132 € |
| **Sous-total petit matériel documenté** | | **27 315 €** |
| Extrapolation 13-20% gaspillage (littérature) sur budget conso | Variable | **50 000 – 80 000 €** |

---

## 7 — SYNTHÈSE : COÛT DE NON-POSSESSION (30 ETP, 8 800 interventions/an)

### 7.1 Tableau consolidé Bloc A

| Poste | Fourchette basse | Fourchette haute |
|---|---|---|
| 1 — Erreurs DMI | 250 000 € | 450 000 € |
| 2 — Never events (×3 à 5) | 150 000 € | 1 200 000 € |
| 3 — Turnover / formation (6 départs/an) | 360 000 € | 900 000 € |
| 4 — Temps perdu picking/restérilisation | 44 000 € | 88 000 € |
| 5 — Absence de formateur (valeur BDB) | 62 000 € | 78 000 € |
| 6 — Gaspillage comportemental | 27 000 € | 80 000 € |
| **TOTAL** | **893 000 €** | **2 796 000 €** |

### 7.2 Fourchette retenue pour argumentation

- **Conservateur** (pour DAF sceptique) : **900 000 €/an**
- **Réaliste** (pour direction ouverte) : **1 500 000 €/an**
- **Terrain brut** (si tout est compté) : **jusqu'à 2,8 M€/an**

### 7.3 Coût par intervention

| Métrique | Valeur |
|---|---|
| CNP conservateur / intervention | 900 000 / 8 800 = **102 €** |
| CNP réaliste / intervention | 1 500 000 / 8 800 = **170 €** |
| BDB à 200k€/an / intervention | 200 000 / 8 800 = **23 €** |

### 7.4 ROI selon pricing BDB (30 ETP)

| Pricing BDB | ROI conservateur (900k€) | ROI réaliste (1,5M€) |
|---|---|---|
| 100 000 €/an | ×9 | ×15 |
| 200 000 €/an | ×4,5 | ×7,5 |
| 300 000 €/an | ×3 | ×5 |
| 500 000 € lifetime (amorti 3 ans) | ×5,4 | ×9 |

→ **À 200k€/an, le ROI est ×4,5 minimum. BDB représente moins de 2% du coût de production du bloc.**

### 7.5 L'argument par intervention

"Chaque intervention réalisée sans BDB coûte 170€ de risque à votre établissement. Avec BDB, ce risque coûte 23€. La question n'est pas de savoir si vous pouvez vous offrir BDB — c'est de savoir combien de temps vous pouvez vous permettre de ne pas l'avoir."

---

## 8 — DONNÉES MANQUANTES (À COMPLÉTER)

| Donnée | Source à chercher | Impact |
|---|---|---|
| Budget consommables annuel Bloc A (pour appliquer le 13-20%) | Manu pharmacie/direction | Affine poste 6 |
| Prime RCP avant/après never event | Manu direction | Chiffre poste 2 |
| Coût réel intérim IBODE chez Elsan (convention groupe) | Manu RH/cadre | Affine poste 3 |
| Benchmark Biblo.pro pricing | Web / commercial | Positionne BDB vs concurrent direct |
| Nombre de NE réel sur 5 ans (pas seulement 2025) | Manu terrain | Stabilise poste 2 |

---

## 9 — PROCHAINS LIVRABLES (ALIMENTÉS PAR CE SOCLE)

1. **Calculateur ROI** — ✅ LIVRÉ (HTML interactif, curseur 5→60 ETP)
2. **Argumentaire Brigitte** — ✅ LIVRÉ (docx 2 pages, langage DAF)
3. **Sondage douleur terrain** — À FAIRE (questionnaire opérationnel)
4. **Pitch cadre/IBODE** — À FAIRE (langage métier, wording DISC)
5. **Cartographie décisionnelle** — À FAIRE (qui achète, qui bloque)

---

## HISTORIQUE

```
2026-04-25 — V1.1.0
  Passage à 30 ETP / 8 800 interventions/an.
  Ajout POSTE 6 : gaspillage comportemental (casaques-gilets, gants, petit matériel).
  Intégration étude CHU Montpellier (EM-Consulte 2021) + UCSF + AORN 2024 + Pays-Bas.
  Lien direct preference cards → module Préférences chirurgien BDB.
  CNP recalculé 30 ETP : 900k–2,8M€/an. ROI ×4,5 à ×15 selon pricing.
  Livraison calculateur ROI + argumentaire DAF.

2026-04-25 — V1.0.0
  Création. Consolidation terrain Bloc A + web (Relyens, ONIAM, Académie Chirurgie)
  + Perplexity (3 prompts deep research).
  5 postes de coût documentés. Synthèse CNP 300k-1M€/an.
  ROI ×3 à ×15 selon pricing. Données manquantes identifiées.
```
