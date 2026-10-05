# CONVENTIONS DE NOMMAGE — THESAURUS_PROTOCOLES BDB

```
VERSION  : 2.5.0
DATE     : 2026-03-29
STATUT   : RÉFÉRENCE — à charger dans toute session thésaurus — FICHIER AUTONOME (V1.0.0 non requis)
SOURCES  : V2.4.0 + session 069 (migrations 069→069l)
DELTA    : R25 ajouté : immuabilité id_protocole (ACT- jamais réattribué).
           R26 ajouté : chéilectomie = synonyme hallux rigidus.
           R27 ajouté : MORSURE protocole unique (pas de déclinaison par animal).
           R28 ajouté : voie d'abord S2 (arthroscopie > geste vs ciel ouvert).
           §9quater C10 ajouté : HAUBANNAGE S2 (> COUDE, > ROTULE).
           §13.3 fusions session 069 (ongles, quadriceps, morsures).
           Recatégorisation batch PI : 1 277 → 367 (71%).
           6 protocoles créés (ACT-0482→0487).
           42 faux positifs hallux rigidus corrigés + ~60 égarés récupérés.
           Synonymes : 396/396 couverts.
           Protocoles : 393 → 396.
```

---

## 1 — CONVENTION S1 : ARTICLES CCAM

**Principe** : les intitulés BDB suivent la codification CCAM pour le bon usage des articles (`de`, `du`, `d'`).

**Règle** : toujours insérer la préposition `DE` entre le geste et la localisation anatomique.

**Casse** : MAJUSCULES intégrales sur `libelle_cible`. Les accents sont conservés (`ÉPAULE`, pas `EPAULE`).

| Pattern OPTIM (sale) | Pattern BDB (propre) | Règle |
|---|---|---|
| `SYNTHESE FRACTURE POIGNET` | `SYNTHÈSE DE FRACTURE DE POIGNET` | Ajouter `DE` entre geste et site |
| `SYNTHESE FRACTURE DU POIGNET` | `SYNTHÈSE DE FRACTURE DE POIGNET` | `DU` → `DE` (convention CCAM) |
| `SYNTHESE FRACTURE D'HUMERUS` | `SYNTHÈSE DE FRACTURE D'HUMÉRUS` | Ajouter `DE` après geste |
| `SYNTHESE FRACTURE CHEVILLE` | `SYNTHÈSE DE FRACTURE DE CHEVILLE` | Ajouter 2× `DE` |
| `SYNTHESE FRACTURE CLAVICULE` | `SYNTHÈSE DE FRACTURE DE CLAVICULE` | Idem |
| `SYNTHESE FRACTURE DOIGT` | `SYNTHÈSE DE FRACTURE DOIGT` | `DE` après geste |
| `SYNTHESE FRACTURE DU COUDE` | `SYNTHÈSE DE FRACTURE DU COUDE` | `DU` conservé ici (article contracté légitime) |
| `SYNTHESE FRACTURE DU FEMUR` | `SYNTHÈSE DE FRACTURE DU FÉMUR` | Idem |
| `SYNTHESE FRACTURE DU TROCHANTER` | `SYNTHÈSE DE FRACTURE DU TROCHANTER` | Idem |
| `EVACUATION D'HEMATOME` | `ÉVACUATION D'HÉMATOME` | `D'` correct (voyelle) + accents |

**Règle simplifiée** : après `SYNTHÈSE`, toujours `DE FRACTURE DE/DU/D'` — jamais `SYNTHÈSE FRACTURE` sans préposition.

**Cas des articles contractés** :
- `DE` devant consonne nue : `DE POIGNET`, `DE CHEVILLE`, `DE CLAVICULE`
- `DU` devant nom masculin avec article défini : `DU COUDE`, `DU FÉMUR`, `DU TROCHANTER`
- `D'` devant voyelle : `D'HUMÉRUS`, `D'ÉPAULE`, `D'HÉMATOME`, `D'ONGLE`
- `DE L'` devant nom avec article défini commençant par voyelle : `DE L'OMOPLATE`, `DE L'HALLUX`
- `DES` devant pluriel : `DES AILERONS ROTULIENS`, `DES 4 OS`

---

## 2 — CONVENTION S2 : HIÉRARCHIE AVEC SÉPARATEUR `>`

**Principe** : le séparateur `>` exprime la relation **geste principal → sous-geste**. Un protocole enfant hérite du picking matériel parent + ses spécificités propres.

**Format** : `GESTE PRINCIPAL > SOUS-GESTE`

### S2.1 — Patterns validés

| Pattern | Exemples |
|---|---|
| `ARTHROSCOPIE D'ÉPAULE > [GESTE]` | `> SUTURE DE LA COIFFE`, `> ACROMIOPLASTIE`, `> BANKART` |
| `PROTHÈSE TOTALE DE [ZONE] > [GESTE]` | `> LAVAGE`, `> LUXATION`, `> REPRISE`, `> ABLATION + SPACER` |
| `PROTHÈSE [TYPE] > [GESTE]` | `PROTHÈSE D'ÉPAULE > REPRISE`, `PROTHÈSE DE COUDE > ABLATION` |
| `[MATÉRIEL] > ABLATION` | `BROCHES > ABLATION`, `CLOU GAMMA > ABLATION`, `FIXATEUR EXTERNE > ABLATION` |
| `[MATÉRIEL] > REPRISE` | `CLOU GAMMA > REPRISE` |
| `X > PERCUTANÉ` | `HALLUX VALGUS > PERCUTANÉ`, `VIS > PERCUTANÉ` |
| `MORSURE > [ANIMAL]` | `MORSURE > CHAT`, `MORSURE > CHIEN` |
| `EXPLORATION DE PLAIE > [ZONE]` | `> MAIN & DOIGTS`, `> MEMBRE SUPÉRIEUR`, `> TENDON` |
| `ABLATION > [NATURE]` | `> CORPS ÉTRANGER`, `> TUMÉFACTION`, `> EXCROISSANCE OSSEUSE` |
| `[GESTE] DE TENDON > [LOCALISATION]` | `SUTURE DE TENDON > ACHILLE`, `PEIGNAGE DE TENDON > ROTULIEN` |
| `NEUROLYSE > NERF` | Neurolyse sans précision de nerf spécifique |

### S2.2 — Règles

- Le séparateur est ` > ` (espace avant et après)
- Le geste principal à gauche, le sous-geste à droite
- Un libellé SANS `>` est un protocole racine (autonome)
- Le signe `+` combine des gestes simultanés : `ACROMIOPLASTIE + SUTURE DE LA COIFFE`
- `cat_parent` utilise le même format `>` pour la classification hiérarchique

---

## 3 — CONVENTION S3 : BASE VIVANTE

**Principe** : les protocoles ne sont jamais figés. La base évolue avec la pratique.

**Règles** :
- Ne jamais considérer les protocoles existants comme définitifs
- Tout enrichissement part de la base existante et l'améliore — on ne repart jamais de zéro
- `LIBELLE_CIBLE` et `FREQUENCE` sont **sacrés** — non modifiables après création (sauf erreur avérée)
- Nouveaux protocoles = nouvel `id_protocole` (`ACT-NNNN`), jamais écrasement d'un existant

---

## 4 — VOIE D'ABORD = DIMENSION STRUCTURANTE

**Principe** : la voie d'abord (ciel ouvert, endoscopie, arthroscopie, percutané) est une dimension du protocole au même titre que la zone anatomique. 2 voies d'abord = 2 protocoles distincts.

**Impact** : installation salle différente, instrumentation différente, picking matériel différent.

**Exemples en base** :

| Protocole ciel ouvert | Protocole endoscopique/percutané |
|---|---|
| `CANAL CARPIEN` | `CANAL CARPIEN SOUS ENDOSCOPIE` |
| `HALLUX VALGUS` | `HALLUX VALGUS > PERCUTANÉ` |
| `LIBÉRATION DU NERF ULNAIRE AU COUDE` | `LIBÉRATION DU NERF ULNAIRE SOUS ENDOSCOPIE (FMS)` |

**Conventions suffixe** :
- `SOUS ENDOSCOPIE` ou `SOUS ENDOSCOPIE (FMS)` pour la voie endoscopique
- `> PERCUTANÉ` pour la voie percutanée (convention S2)
- `SOUS ARTHROSCOPIE` / `ARTHROSCOPIE D'...` pour la voie arthroscopique
- Pas de suffixe = ciel ouvert par défaut

---

## 4bis — CONVENTION S4 : LISIBILITÉ OPÉRATOIRE

### Principe fondateur

Le thésaurus n'est pas un code administratif CCAM. C'est un **outil de compréhension clinique** au service de l'équipe de bloc. Chaque libellé doit permettre à une infirmière — même nouvelle, même technophobe — de comprendre en le lisant :

1. **CE QU'ELLE FAIT** — le geste chirurgical
2. **POURQUOI** — la logique clinique (ténodèse ≠ ténotomie = ancre ou pas)
3. **CE QU'ELLE PRÉPARE** — le matériel induit par le geste
4. **CE QU'ELLE EXPLIQUE** — au patient qui demande ce qu'on va lui faire

**Conséquence** : on distingue des gestes même quand l'installation salle est identique, parce que la compréhension du geste et le picking matériel diffèrent. Le thésaurus sert de base pour les fiches de picking autant que pour les cours.

### S4.1 — Gestes cliniquement distincts = protocoles distincts

Les gestes suivants ne sont **jamais fusionnés**, même si l'installation est identique :

| Geste | Signification IBODE | Matériel spécifique |
|---|---|---|
| TÉNODÈSE | Fixation du tendon | Ancres, vis d'interférence |
| TÉNOTOMIE | Section simple du tendon | Pas d'ancre — shaver suffit |
| TÉNOLYSE | Libération/nettoyage du tendon | Pas d'ancre — instruments basiques |
| RÉINSERTION | Ré-attache du tendon arraché | Ancres, endobutton |
| SUTURE | Réparation du tendon | Fil, ancres |

### S4.2 — Mots-discriminants pour la recherche par préfixe

Les libellés utilisent des mots volontairement distincts pour que la saisie de quelques lettres oriente vers la bonne zone anatomique.

**Cas d'école — famille BICEPS :**

| Saisie | Mot-clé | Zone | Résultat |
|---|---|---|---|
| `bic` | — | Tout | 10 protocoles biceps |
| `bice` | BICEPS | Épaule (long biceps) | 8 protocoles |
| `bici` | BICIPITAL | Coude (tendon distal) | 2 protocoles |

Ce pattern s'applique à toute famille où une ambiguïté zone anatomique existe.

### S4.3 — Gestes associés fréquents

Quand un chirurgien associe systématiquement deux gestes (ex: acromioplastie + ténodèse), le libellé les combine avec `+` :

```
ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE + TÉNODÈSE DU LONG BICEPS
```

Le geste principal est à gauche du `+`, le geste associé à droite.

### S4.4 — Navigation par famille ("voir aussi")

Chaque protocole documente les protocoles liés dans `definition_expert` ou futur champ `protocoles_lies` pour permettre la navigation par famille. Un nouveau qui consulte une fiche doit pouvoir découvrir les variantes proches.

### S4.5 — Cas d'école validé : famille BICEPS (10 protocoles)

| ACT | Libellé S4 | Zone | Geste |
|---|---|---|---|
| ACT-0081 | ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE + TÉNODÈSE DU LONG BICEPS | Épaule arthro | Combiné |
| ACT-0108 | ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE + TÉNOTOMIE DU LONG BICEPS | Épaule arthro | Combiné |
| ACT-0122 | ARTHROSCOPIE D'ÉPAULE > TÉNODÈSE DU LONG BICEPS | Épaule arthro | Isolé |
| ACT-0143 | ARTHROSCOPIE D'ÉPAULE > RÉINSERTION DU LONG BICEPS | Épaule arthro | Isolé |
| ACT-0222 | ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE + TÉNODÈSE DU LONG BICEPS | Épaule arthro | Combiné coiffe |
| ACT-0376 | ARTHROSCOPIE D'ÉPAULE > RÉINSERTION SOUS-SCAPULAIRE + TÉNOTOMIE DU LONG BICEPS | Épaule arthro | Combiné coiffe |
| ACT-0109 | SUTURE DE TENDON > LONG BICEPS | Épaule ouvert | Isolé |
| ACT-0193 | TÉNOLYSE DU LONG BICEPS | Épaule ouvert | Isolé |
| ACT-0119 | RÉINSERTION DU TENDON BICIPITAL | Coude | Isolé |
| ACT-0279 | TÉNODÈSE DU TENDON BICIPITAL | Coude | Isolé |

---

## 5 — ACCENTS ET CASSE

**Règle** : MAJUSCULES intégrales avec accents français conservés.

| Incorrect | Correct |
|---|---|
| `EPAULE` | `ÉPAULE` |
| `PROTHESE D'EPAULE` | `PROTHÈSE D'ÉPAULE` |
| `ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE` |
| `REPRISE DE PROTHESE D'EPAULE` | `PROTHÈSE D'ÉPAULE > REPRISE` |
| `ONGLE INCARNE` | `ONGLE INCARNÉ` |
| `NEVROME DE MORTON` | `NÉVROME DE MORTON` |
| `HEMATOME` | `HÉMATOME` |
| `EVACUATION ABCES` | `ÉVACUATION D'ABCÈS` |
| `TENOLYSE` | `TÉNOLYSE` |
| `KYSTE MUCOIDE` | `KYSTE MUCOÏDE` |
| `PROTHESE TOTALE EPAULE` | `PROTHÈSE TOTALE D'ÉPAULE` |
| `NEURO CHIRURGIE` | `NEUROCHIRURGIE` |
| `TENOTOMIE` | `TÉNOTOMIE` |
| `CHANGEMENT DE FEMUR` | `CHANGEMENT DE FÉMUR` |
| `LIGAMENT POSTERIEUR` | `LIGAMENT POSTÉRIEUR` |
| `POUCE A RESSAUT` | `POUCE À RESSAUT` |

---

## 6 — ABRÉVIATIONS

**Règle** : `libelle_cible` est développé en toutes lettres. Les abréviations vont dans `synonymes_recherche`.

| Abréviation | Développé dans libelle_cible | Dans synonymes_recherche |
|---|---|---|
| `PTH` | `PROTHÈSE TOTALE DE HANCHE` | `PTH` |
| `PTG` | `PROTHÈSE TOTALE DE GENOU` | `PTG` |
| `PTE` | `PROTHÈSE TOTALE D'ÉPAULE` | `PTE` |
| `PIH` | `PROTHÈSE INTERMÉDIAIRE DE HANCHE` | `PIH` |
| `LCA` | `RECONSTRUCTION DU LIGAMENT CROISÉ ANTÉRIEUR` | `LCA` |
| `KJ` | `KENNETH JONES` | `KJ` |
| `FMS` | `(FMS)` conservé en suffixe | — |
| `PUC` | `PROTHÈSE UNI-COMPARTIMENTAIRE DU GENOU` | `PUC` |
| `THS` | Protocole obsolète conservé (archives) | `THS` |
| `AMBU` | Non utilisé dans libelle_cible | — |
| `HM_SIG` | Déchet — détruit à l'import | — |

**Principe** : un nouvel arrivant doit comprendre le libellé sans connaître les acronymes. Les acronymes permettent la recherche rapide.

---

## 7 — CONVENTION C1 : PROTHÈSES — GESTES ASSOCIÉS

**Principe** : distinguer le **diagnostic d'entrée** de l'**acte sur prothèse existante**.

### C1.1 — Fracture sur prothèse (diagnostic principal = fracture)
```
FRACTURE SUR PROTHÈSE TOTALE DE [ZONE]
```
Exemples :
- `FRACTURE SUR PROTHÈSE TOTALE DE HANCHE`
- `FRACTURE SUR PROTHÈSE TOTALE DE GENOU`

Logique : la fracture est l'entrée clinique. L'acte peut évoluer vers un changement de prothèse si celle-ci est atteinte.

### C1.2 — Geste sur prothèse existante (acte principal = geste)
```
PROTHÈSE TOTALE DE [ZONE] > [GESTE]
```
Exemples :
- `PROTHÈSE TOTALE DE HANCHE > LAVAGE`
- `PROTHÈSE TOTALE DE HANCHE > LUXATION`
- `PROTHÈSE TOTALE DE HANCHE > LUXATION SANGLANTE`
- `PROTHÈSE TOTALE DE HANCHE > REPRISE`
- `PROTHÈSE TOTALE DE GENOU > LAVAGE`
- `PROTHÈSE TOTALE DE GENOU > LUXATION`
- `PROTHÈSE TOTALE DE GENOU > REPRISE`
- `PROTHÈSE TOTALE DE GENOU > ABLATION + SPACER`
- `PROTHÈSE TOTALE DE GENOU > ABLATION + ARTHRODÈSE`
- `PROTHÈSE TOTALE D'ÉPAULE > LUXATION`
- `PROTHÈSE TOTALE D'ÉPAULE > ABLATION + SPACER`
- `PROTHÈSE D'ÉPAULE > REPRISE`
- `PROTHÈSE D'ÉPAULE > ABLATION`
- `PROTHÈSE DE COUDE > REPRISE`
- `PROTHÈSE DE COUDE > ABLATION`
- `PROTHÈSE DE COUDE > FRACTURE`

Logique : la prothèse existante est le contexte, le geste est l'acte réalisé.

---

## 8 — CONVENTION C2 : EXPLORATION DE PLAIE

**Principe** : classer par localisation anatomique principale.

| libelle_cible | Périmètre |
|---|---|
| `EXPLORATION DE PLAIE > MAIN & DOIGTS` | main, paume, doigt, pouce, index, annulaire, auriculaire, R1-R5, phalange |
| `EXPLORATION DE PLAIE > MEMBRE SUPÉRIEUR` | bras, avant-bras, poignet, coude, épaule, clavicule |
| `EXPLORATION DE PLAIE > MEMBRE INFÉRIEUR` | jambe, tibia, genou, cheville, pied, orteil |
| `EXPLORATION DE PLAIE > TENDON` | toute plaie avec section/atteinte tendineuse (extenseur, fléchisseur) |
| `EXPLORATION DE PLAIE` | plaie sans localisation identifiable |

**Synonymes obligatoires** : toutes les abréviations anatomiques courantes (R1-R5, O1-O5, M1-M5, P1-P3, IPP, IPD, MCP) dans `synonymes_recherche`.

---

## 9 — CONVENTION C3 : ABLATION — FAMILLE HIÉRARCHIQUE

**Principe** : distinguer 3 familles selon la nature de ce qui est retiré.

### C3.1 — Matériel chirurgical (non-anatomique → pattern `[MATÉRIEL] > ABLATION`)

Le matériel est le geste principal, ABLATION est le sous-geste.

| libelle_cible | Périmètre |
|---|---|
| `MATÉRIEL DE SYNTHÈSE > ABLATION` | vis, plaques, clous non spécifiés |
| `BROCHES > ABLATION` | broches génériques |
| `BROCHES DE POIGNET > ABLATION` | broches spécifiques poignet |
| `VIS > ABLATION` | vis génériques |
| `CLOU CENTRO-MÉDULLAIRE > ABLATION` | clou centromédullaire |
| `CLOU GAMMA > ABLATION` | clou gamma |
| `FIXATEUR EXTERNE > ABLATION` | fixateur externe |
| `AGRAFE DE BLOUNT > ABLATION` | agrafe de Blount |

### C3.2 — Tissus mous (anatomique → pattern `ABLATION > [NATURE]`)

ABLATION est le geste principal, la nature de la lésion est le sous-type.

| libelle_cible | Périmètre | synonymes_recherche |
|---|---|---|
| `ABLATION > TUMÉFACTION` | **Terme parapluie** : tumeur, lipome, nodule, kyste+lambeau, masse, boule, naevus | `tuméfaction\|tumeur\|lipome\|nodule\|kyste\|masse\|boule\|exérèse\|adipome\|naevus\|grain de beauté\|induration\|lambeau` |
| `ABLATION > CORPS ÉTRANGER` | Objet non-anatomique (vis, aiguille, verre, bois...) | `corps étranger\|CE\|extraction` |

**Arbitrage V2.4.0** : TUMEUR, LIPOME, NODULE, KYSTE+LAMBEAU fusionnés dans TUMÉFACTION. Distinction reportée aux fiches de picking et cours (modules futurs). Avec 400+ protocoles la distinction relève du bruit dans les libellés.

### C3.3 — Excroissance osseuse (anatomique → pattern `ABLATION > [NATURE]`)

| libelle_cible | Périmètre | synonymes_recherche |
|---|---|---|
| `ABLATION > EXCROISSANCE OSSEUSE` | Exostose, ostéophyte, bec osseux | `exostose\|ostéophyte\|excroissance osseuse\|bec osseux\|sous-unguéale\|pince gouge` |

### C3.4 — Gestes spécifiques (pas de pattern `>`)

| libelle_cible | Périmètre |
|---|---|
| `ABLATION D'ONGLE` | Geste spécifique (avulsion unguéale) |

### C3.5 — Calcification (SUPPRIMÉ — ventilé)

**Arbitrage V2.4.0** : `ABLATION DE CALCIFICATION` (ACT-0116) supprimé. Les interventions sont ventilées vers l'arthroscopie de la zone concernée (épaule → ACT-0092 ARTHROSCOPIE D'ÉPAULE > ABLATION DE CALCIFICATIONS). La calcification est un geste secondaire documenté dans les fiches de chaque arthroscopie, pas un protocole autonome.

### C3.6 — Prothèses (`PROTHÈSE > ABLATION`)

Voir convention C1.2. Le retrait de prothèse suit le pattern `PROTHÈSE [TYPE] > ABLATION`.

---

## 9bis — CONVENTION C8 : GESTES SUR TENDON — PATTERN HIÉRARCHIQUE

**Principe** : quand un geste sur tendon existe avec plusieurs localisations, le pattern est `[GESTE] DE TENDON > [LOCALISATION]`.

**Format** : `GESTE DE TENDON > LOCALISATION`

**Exemples validés :**

| ACT | libelle_cible | Geste | Localisation |
|---|---|---|---|
| ACT-0059 | `SUTURE DE TENDON` | Suture | Générique (sans précision) |
| ACT-0050 | `SUTURE DE TENDON > ACHILLE` | Suture | Tendon d'Achille |
| ACT-0160 | `SUTURE DE TENDON > ROTULIEN` | Suture | Tendon rotulien |
| ACT-0109 | `SUTURE DE TENDON > LONG BICEPS` | Suture | Long biceps (épaule) |
| ACT-0182 | `PEIGNAGE DE TENDON` | Peignage | Générique |
| ACT-0117 | `PEIGNAGE DE TENDON > ACHILLE` | Peignage | Tendon d'Achille |
| ACT-0235 | `PEIGNAGE DE TENDON > ROTULIEN` | Peignage | Tendon rotulien |

**Règles** :
- Le protocole générique (sans `>`) reste pour les cas sans précision de localisation
- Les protocoles spécifiques héritent du picking matériel générique + spécificités anatomiques
- `ALLONGEMENT DU TENDON D'ACHILLE` reste autonome (pas de pattern `>` — geste spécifique à Achille)
- Les gestes sur un tendon spécifique sans famille (ex: RÉINSERTION DU TENDON BICIPITAL) restent autonomes

---

## 9ter — CONVENTION C9 : REPRISE — PATTERN S2

**Principe** : les reprises de prothèses suivent le pattern `PROTHÈSE [TYPE] > REPRISE`.

**Format** : `[PROTOCOLE PARENT] > REPRISE`

### C9.1 — Reprises de prothèses (pattern S2 appliqué)

| ACT | libelle_cible |
|---|---|
| ACT-0085 | `PROTHÈSE TOTALE DE GENOU > REPRISE` |
| ACT-0037 | `PROTHÈSE TOTALE DE HANCHE > REPRISE` |
| ACT-0111 | `PROTHÈSE D'ÉPAULE > REPRISE` |
| ACT-0356 | `PROTHÈSE DE COUDE > REPRISE` |
| ACT-0395 | `BANKART > REPRISE` |

### C9.2 — Reprises de synthèse (pattern S2 avec correction libellé)

On ne reprend pas un poignet ou une jambe, mais une synthèse de fracture.

| ACT | libelle_cible |
|---|---|
| ACT-0478 | `SYNTHÈSE DE FRACTURE DE JAMBE > REPRISE` |
| ACT-0287 | `SYNTHÈSE DE FRACTURE DE POIGNET > REPRISE` |
| ACT-0269 | `SYNTHÈSE DE FRACTURE DE CHEVILLE > REPRISE` |
| ACT-0404 | `SYNTHÈSE DE FRACTURE DE CLAVICULE > REPRISE` |
| ACT-0314 | `SYNTHÈSE DE FRACTURE DE ROTULE > REPRISE` |

### C9.3 — Reprises de cicatrice (INCHANGÉ — pas de pattern S2)

On ne peut pas identifier ce qui précédait la cicatrice → le pattern `REPRISE DE...` est conservé.

| ACT | libelle_cible |
|---|---|
| ACT-0427 | `REPRISE DE CICATRICE` |
| ACT-0423 | `REPRISE DE CICATRICE DU RACHIS` |

### C9.4 — Autres reprises déjà en S2

| ACT | libelle_cible |
|---|---|
| ACT-0178 | `CANAL CARPIEN > REPRISE` |
| ACT-0172 | `HALLUX VALGUS > REPRISE` |
| ACT-0241 | `BUTÉE DE LATARJET > REPRISE` |
| ACT-0412 | `CLOU GAMMA > REPRISE` |
| ACT-0326 | `DUPUYTREN > REPRISE` |
| ACT-0391 | `LIGAMENTOPLASTIE DU GENOU > REPRISE` |
| ACT-0477 | `HERNIE DISCALE > REPRISE` |
| ACT-0316 | `ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE > REPRISE` |
| ACT-0425 | `RECONSTRUCTION DU LIGAMENT CROISÉ ANTÉRIEUR > REPRISE` |

---

## 9quater — CONVENTION C10 : HAUBANNAGE — PATTERN S2

**Format** : `HAUBANNAGE > [ZONE]`

Cerclage = synonyme de haubannage (même technique : fil métallique + broches).

| ACT | libelle_cible | synonymes_recherche |
|---|---|---|
| ACT-0113 | `HAUBANNAGE > COUDE` | `haubannage coude\|haubanage coude\|cerclage olécrâne` |
| ACT-0153 | `HAUBANNAGE > ROTULE` | `cerclage rotule\|haubannage rotule\|cerclage genou\|fil de cerclage` |

Ablation du haubannage → `MATÉRIEL DE SYNTHÈSE > ABLATION` (ACT-0016).

---

## 10 — CONVENTION C4 : MORSURES

**Principe** : protocole unique `MORSURE` (ACT-0430). L'animal (chat, chien, humaine) est une information de note, pas un discriminant opératoire (même installation, même matériel, même picking).

| libelle_cible | synonymes_recherche |
|---|---|
| `MORSURE` | `morsure\|morsure chat\|morsure chien\|plaie morsure\|morsure féline\|morsure canine\|morsure humaine\|morsure animal` |

**R27** : pas de déclinaison par espèce animale.

---

## 11 — CONVENTION C5 : SYNTHÈSE DE FRACTURE vs RÉDUCTION vs OSTÉOSYNTHÈSE

**Principe** : `SYNTHÈSE`, `RÉDUCTION`, `OSTÉOSYNTHÈSE` sont des **synonymes** dans le contexte BDB ortho. Tous mappent vers `SYNTHÈSE DE FRACTURE DE [ZONE]`.

**Rationale** : pour une IBODE, le picking matériel est identique quel que soit le terme utilisé par le chirurgien pour décrire le même acte.

**Exemples** :
- `REDUCTION FRACTURE HUMERUS` → `SYNTHÈSE DE FRACTURE D'HUMÉRUS`
- `OSTEOSYNTHESE RADIUS` → `SYNTHÈSE DE FRACTURE DE RADIUS`
- `SYNTHESE FRACTURE CHEVILLE` → `SYNTHÈSE DE FRACTURE DE CHEVILLE`

**Exception** : `RÉDUCTION ORTHOPÉDIQUE` (sans fixation chirurgicale) = protocole distinct `RÉDUCTION ORTHOPÉDIQUE`.

---

## 12 — CONVENTION C6 : PETITE INTERVENTION — PROTOCOLE DE DERNIER RECOURS

### 12.1 — Principe fondateur : zéro perte de savoir opératoire

Chaque ligne de `thesaurus_interventions` est un cas chirurgical réel — un patient en souffrance, un acte pratiqué, un matériel préparé, souvent dans l'urgence. Le thésaurus est la **mémoire collective du bloc opératoire** : base de formation pour les nouveaux arrivants, référentiel de préparation matériel pour panseurs et instrumentistes.

**Conséquence** : écraser, fusionner ou négliger une donnée = perdre un cas concret que l'équipe ne saura pas gérer quand il se reproduira. Plus un cas est rare, plus il a besoin d'être documenté — aucune mémoire humaine ne peut le retrouver.

Le thésaurus n'est pas un tableur statistique. C'est une **base de connaissance terrain** construite sur 20 ans de pratique chirurgicale réelle. Chaque entrée — même mal orthographiée, même cryptique — porte un savoir opératoire exploitable.

### 12.2 — Règle d'utilisation

`PETITE INTERVENTION` (ACT-0432) est un protocole de **dernier recours exclusif**. Il ne contient QUE les interventions véritablement inclassables après analyse humaine de la note. Il n'est PAS un fourre-tout pour les cas non analysés.

- Toute note contenant une information clinique exploitable DOIT être recatégorisée vers le protocole exact
- Le mapping automatique (regex) est un premier passage ; les cas ambigus exigent un **arbitrage humain** via l'interface de recatégorisation (onglet Thésaurus > Recatégorisation)
- Un cas classé PETITE INTERVENTION faute d'analyse est une **dette de qualité** — pas un état final acceptable
- Seules les lignes avec note vide ET aucun contexte exploitable = cas légitime de PETITE INTERVENTION

### 12.3 — Processus de recatégorisation

1. **Passe automatique** : regex sur `note` → catégorie suggérée (ABLATION_MATERIEL, SYNTHESE_FRACTURE…)
2. **Arbitrage humain** : interface CRUD onglet 7 Thésaurus — validation ou correction de chaque suggestion
3. **Enrichissement** : si aucun protocole existant ne correspond → création d'un nouveau protocole
4. **Résidu incompressible** : uniquement les notes sans aucun contenu clinique (`gauche`, `Opérée salle 5.`, `ch 1209`)

### 12.4 — Valeurs de note = bruit pur (non exploitables)

- `PETITE INTERVENTION ORTHO` seul
- `CH`, `AMBU`, `AMBULATOIRE` seuls
- `Coté GAUCHE/DROIT`, `CHIRURGIE A CIEL OUVERT`, `PROGRAMMEE` (sans autre info)
- `RACHI ANESTHESIE`, `BLOC PERI-NERVEUX`, `ANESTHESIE GENERALE/LOCALE/LOCOREGIONALE` (sans autre info)
- `Protocole vérification anesthésie OK`
- `Bilan fonctionnel`, `site veineux`, `ablation de site`
- Notes mono-mot sans valeur clinique : `gauche`, `droit`, `main`, `pied` (sans geste identifiable)

---

## 12bis — CONVENTION C7 : ÉPONYMES CHIRURGICAUX

**Principe** : les éponymes (noms de chirurgiens/techniques) ne figurent JAMAIS dans `libelle_cible` quand un nom descriptif français existe. Ils vont dans `synonymes_recherche`.

**Exceptions** : si l'éponyme est le seul nom usuel (aucun nom descriptif couramment utilisé), il reste dans `libelle_cible`.

| Éponyme terrain | libelle_cible BDB | synonymes_recherche | Règle |
|---|---|---|---|
| Matti-Russe | `PSEUDARTHROSE DE SCAPHOÏDE > GREFFE` | `Matti-Russe\|matti russe` | Nom descriptif existe → éponyme en synonyme |
| Latarjet | `BUTÉE DE LATARJET` | `Latarjet\|butee\|butee epaule` | Éponyme = seul nom usuel → conservé |
| Kenneth Jones | `KENNETH JONES` | `KJ` | Éponyme = seul nom usuel → conservé |
| Bankart | `ARTHROSCOPIE D'ÉPAULE > BANKART` | — | Éponyme = seul nom usuel → conservé |

**Règle de décision** : si le geste possède un nom descriptif en français utilisé en pratique courante, utiliser le nom descriptif. Si l'éponyme est le seul terme que l'équipe utilise, il reste dans libelle_cible.

---

## 13 — FUSIONS DE PROTOCOLES (mise à jour V2.4.0)

### 13.1 — Fusions historiques (sessions ≤ 067)

| Libellés OPTIM fusionnés | Protocole BDB unique | ACT |
|---|---|---|
| `PTH VA` + `PTH PAR VOIE ANTERIEURE` | `PROTHÈSE TOTALE DE HANCHE PAR VOIE ANTÉRIEURE` | ACT-0015 |
| `REPRISE DE PTH` + `REPRISE PTH` | `PROTHÈSE TOTALE DE HANCHE > REPRISE` | ACT-0037 |
| `REPRISE DE PTG` | `PROTHÈSE TOTALE DE GENOU > REPRISE` | ACT-0085 |
| `LCA` + `RECONSTRUCTION DU LCA` | `RECONSTRUCTION DU LIGAMENT CROISÉ ANTÉRIEUR` | ACT-0014 |
| `REDUCTION LUXATION PTH` | `PROTHÈSE TOTALE DE HANCHE > LUXATION` | ACT-0056 |
| `LAVAGE PTH` | `PROTHÈSE TOTALE DE HANCHE > LAVAGE` | ACT-0150 |
| `LAVAGE PTG` | `PROTHÈSE TOTALE DE GENOU > LAVAGE` | ACT-0197 |
| `FRACTURE DE FEMUR SUR PTH` | `FRACTURE SUR PROTHÈSE TOTALE DE HANCHE` | ACT-0177 |
| `FRACTURE DE FEMUR SUR PTG` | `FRACTURE SUR PROTHÈSE TOTALE DE GENOU` | ACT-0227 |
| `ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE` | ACT-0017 |
| `SUTURE COIFFE SOUS ARTHROSCOPIE` | `ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE` | ACT-0009 |
| `ACROMIOPLASTIE SOUS ARTHRO` | `ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE` | ACT-0027 |
| `ONGLE INCARNE` | `ONGLE INCARNÉ` | ACT-0029 |
| `REPRISE DE KJ` | `KENNETH JONES > REPRISE` | ACT-0445 |
| `LUXATION EPAULE` | `LUXATION D'ÉPAULE` | ACT-0070 |
| `LUXATION PTE` | `PROTHÈSE TOTALE D'ÉPAULE > LUXATION` | ACT-0212 |
| `BUTEE DE LATARGET` | `BUTÉE DE LATARJET` | ACT-0034 |
| `PETITE INTERVENTION ORTHO` + `A DEFINIR` + `NULL` | `PETITE INTERVENTION` | ACT-0432 |

### 13.2 — Fusions session 068 (2026-03-29 soir)

| Protocoles absorbés | Survivant | ACT |
|---|---|---|
| INFILTRATION ÉPAULE + HANCHE + PIED + DE GENOU | `INFILTRATION` | ACT-0233 |
| TENDON D'ACHILLE (298 interv) | `SUTURE DE TENDON > ACHILLE` | ACT-0050 |
| TENDON ROTULIEN (2 interv) | `SUTURE DE TENDON > ROTULIEN` | ACT-0160 |
| CHANGEMENT DE FÉMUR (12) + CHANGEMENT DE PROTHÈSE FÉMORALE (4) | `PROTHÈSE TOTALE DE GENOU > REPRISE` | ACT-0085 |
| SYNOVITE DU FLÉCHISSEUR (0) | `SYNOVITE DE TENDON FLÉCHISSEUR` | ACT-0454 |
| ABLATION > TUMEUR (64) + ABLATION DE LIPOME (179) + ABLATION DE NODULE (190) + EXÉRÈSE DE KYSTE + LAMBEAU (245) | `ABLATION > TUMÉFACTION` | ACT-0435 |
| ABLATION D'OSTÉOPHYTE (11) | `ABLATION > EXCROISSANCE OSSEUSE` | ACT-0079 |
| ABLATION DE CALCIFICATION (63) | Ventilé par zone arthroscopie | — |

### 13.3 — DELETE session 068 (0 intervention)

| ACT | Libellé | Raison |
|---|---|---|
| ACT-0331 | CHANGEMENT BOITIER ITREL | 0 interv, obsolète |

### 13.4 — Fusions session 069 (2026-03-29)

| Absorbé | Survivant | Nouveau libellé | Motif |
|---|---|---|---|
| ACT-0138 ABLATION D'ONGLE (57) | ACT-0029 | CHIRURGIE DE L'ONGLE | Même installation, même matériel |
| ACT-0120 RÉINSERTION TENDON QUADRICIPITAL (66) | ACT-0157 | SUTURE DE TENDON > QUADRICEPS | Famille SUTURE DE TENDON S2 |
| ACT-0431 MORSURE > CHIEN (65) | ACT-0430 | MORSURE | R27 — animal non discriminant |

### 13.5 — Créations session 069

| ACT | libelle_cible | Motif |
|---|---|---|
| ACT-0482 | PANSEMENT PAR THÉRAPIE À PRESSION NÉGATIVE (VAC) | Acte transversal, picking spécifique |
| ACT-0483 | CONFECTION DE PLÂTRE | Acte transversal, picking spécifique |
| ACT-0484 | ARTHRODÈSE SOUS-TALIENNE | NFQA015, distinct d'arthrodèse de cheville |
| ACT-0485 | HALLUX RIGIDUS > PERCUTANÉ | Chéilectomie percutanée, matériel différent (R26) |
| ACT-0486 | ARTHROSCOPIE D'ÉPAULE > RÉPARATION DU BOURRELET GLÉNOÏDIEN SUPÉRIEUR | SLAP, distinct de Bankart |
| ACT-0487 | ARTHROSCOPIE DU COUDE > ÉPICONDYLITE | Voie arthroscopique, distinct de ciel ouvert (R28) |

### 13.6 — Renommages session 069

| ACT | Avant | Après | Motif |
|---|---|---|---|
| ACT-0113 | HAUBANNAGE DE COUDE | HAUBANNAGE > COUDE | S2 (C10) |
| ACT-0153 | CERCLAGE DE ROTULE | HAUBANNAGE > ROTULE | S2 (C10) + cerclage = synonyme |
| ACT-0055 | HYGROMA DU COUDE | HYGROMA > COUDE | S2 |
| ACT-0105 | HYGROMA DU GENOU | HYGROMA > GENOU | S2 |

---

## 14 — RÈGLES DE MAPPING OPTIM → BDB (complet — règles 1→46)

### 14.1 — Transformations nommage (G2 — existants sous autre nom)

| # | Export OPTIM | libelle_cible BDB | Transformation |
|---|---|---|---|
| 1 | `ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE` | +D' +accent É |
| 2 | `SUTURE COIFFE SOUS ARTHROSCOPIE EPAULE` | `ARTHROSCOPIE D'ÉPAULE > SUTURE DE LA COIFFE` | Restructuration hiérarchique S2 |
| 3 | `ACROMIOPLASTIE ET SUTURE DE COIFFE SS ARTHRO` | `ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE + SUTURE DE LA COIFFE` | Restructuration S2 + expansion abréviation |
| 4 | `ACROMIOPLASTIE SOUS ARTHROSCOPIE` | `ARTHROSCOPIE D'ÉPAULE > ACROMIOPLASTIE` | Restructuration S2 |
| 5 | `REPRISE DE PROTHESE D'EPAULE` | `PROTHÈSE D'ÉPAULE > REPRISE` | Accent É + pattern S2 C9 |

### 14.2 — Pattern SYNTHÈSE DE FRACTURE (G1 — 7 protocoles)

| # | OPTIM | BDB | Transformation |
|---|---|---|---|
| 6 | `SYNTHESE FRACTURE POIGNET` | `SYNTHÈSE DE FRACTURE DE POIGNET` | +DE ×2 |
| 7 | `SYNTHESE FRACTURE CHEVILLE` | `SYNTHÈSE DE FRACTURE DE CHEVILLE` | +DE ×2 |
| 8 | `SYNTHESE FRACTURE CLAVICULE` | `SYNTHÈSE DE FRACTURE DE CLAVICULE` | +DE ×2 |
| 9 | `SYNTHESE FRACTURE DOIGT` | `SYNTHÈSE DE FRACTURE DE DOIGT` | +DE ×2 |
| 10 | `SYNTHESE FRACTURE DU COUDE` | `SYNTHÈSE DE FRACTURE DU COUDE` | +DE ×1 |
| 11 | `SYNTHESE FRACTURE DU FEMUR` | `SYNTHÈSE DE FRACTURE DU FÉMUR` | +DE ×1 |
| 12 | `SYNTHESE FRACTURE DU TROCHANTER` | `SYNTHÈSE DE FRACTURE DU TROCHANTER` | +DE ×1 |

### 14.3 — Expansion abréviations (G1 — 5 protocoles)

| # | OPTIM | BDB | Transformation |
|---|---|---|---|
| 13 | `REPRISE DE PTH` | `PROTHÈSE TOTALE DE HANCHE > REPRISE` | PTH développé + C9 |
| 14 | `REPRISE DE PTG` | `PROTHÈSE TOTALE DE GENOU > REPRISE` | PTG développé + C9 |
| 15 | `REPRISE DE LCA` | `RECONSTRUCTION DU LIGAMENT CROISÉ ANTÉRIEUR > REPRISE` | LCA développé + geste corrigé |
| 16 | `REDUCTION LUXATION PTH` | `PROTHÈSE TOTALE DE HANCHE > LUXATION` | PTH développé + convention C1.2 |
| 17 | `PTH VA` / `PTH PAR VOIE ANTERIEURE` | `PROTHÈSE TOTALE DE HANCHE PAR VOIE ANTÉRIEURE` | Fusion + développement |

### 14.4 — Corrections orthographiques (G1 — 3 protocoles)

| # | OPTIM | BDB | Transformation |
|---|---|---|---|
| 18 | `EVACUATION D'HEMATOME` | `ÉVACUATION D'HÉMATOME` | Accents É/Â |
| 19 | `REINSERTION TENDON EXTENSEUR` | `RÉINSERTION DE TENDON EXTENSEUR` | +DE (ACT-0126) |
| 20 | `LAVAGE PTG` | `PROTHÈSE TOTALE DE GENOU > LAVAGE` | PTG développé + convention C1.2 |

### 14.5 — Protocoles existants sous nom identique (G3)

| # | OPTIM = BDB | Note |
|---|---|---|
| 21 | `ABLATION D'ONGLE` | Fusionné dans CHIRURGIE DE L'ONGLE (ACT-0029) — session 069 |
| 22 | `SYNTHÈSE DE FRACTURE D'HUMÉRUS` | Match exact |
| 23 | `SPEEDBRIDGE DÉSEINSERTION RÉINSERTION DU TENDON D'ACHILLE` | Match exact |
| 24 | `SUTURE DE TENDON > ACHILLE` | Renommé session 068 |
| 25 | `HALLUX VALGUS` / `HALLUX VALGUS BILATÉRAL` / `HALLUX VALGUS > PERCUTANÉ` | Match exact ×3 variantes |

### 14.6 — Nouveaux protocoles (V1.0.0 — session 021d/022)

| # | Protocole | Source | Migration |
|---|---|---|---|
| 26 | `LIBÉRATION DU NERF ULNAIRE SOUS ENDOSCOPIE (FMS)` | Identifié G1 | 021d |
| 27 | `TRANSPOSITION DU NERF CUBITAL` | Identifié G1 | 021d |
| 28 | `LIBÉRATION DU NERF ULNAIRE AU COUDE` | Nouveau (ACT-0421) | 022 |
| 29 | `TRANSPOSITION ANTÉRIEURE DU NERF ULNAIRE AU COUDE` | Nouveau (ACT-0422) | 022 |
| **30** | **`PSEUDARTHROSE DE SCAPHOÏDE > GREFFE`** | **Nouveau (ACT-0481)** | **060** |

### 14.7 — Nettoyage import (appliqué avant matching)

| # | Règle | Exemple | Action |
|---|---|---|---|
| 30 | Retirer suffix nom chirurgien | `SYNTHESE FRACTURE...-DR ALAIN` | Strip `-DR ALAIN` |
| 31 | Retirer suffix variante chirurgien | `...VA- DR PICOULEAU` | Strip `VA- DR PICOULEAU` |
| 32 | Retirer suffix Dr générique | `...- Dr LAGARRIGUE` | Strip `- Dr LAGARRIGUE` |
| 33 | Détruire lignes HM_SIG | `HM_SIG_12345` | DELETE (codes produits OPTIM) |
| 34 | Trim espaces | ` CANAL CARPIEN ` | Trim |
| 35 | Normaliser accents | `EPAULE` → `ÉPAULE` | Accent |
| 36 | Tronquer dates RGPD | `2026-03-15` → `2026-03-01` | 1er du mois |
| 37 | Extraire latéralité de Notes | `gauche`, `droit`, `bilat` | → D/G/B |
| 38 | Tiret final | `SYNTHESE FRACTURE CHEVILLE -` | Strip tiret + TRIM |
| 39 | Espace résiduel fin | `PROTHESE TOTALE EPAULE ` | TRIM |
| 40 | Préfixe parasite | `Protocole chirurgical X` | Strip préfixe |
| 41 | Bruit note | `PETITE INTERVENTION ORTHO. Consignes Bloc :` | Strip préfixe note |
| 42 | Latéralité depuis anesthésie | `Coté GAUCHE` dans protocole_anesthesie | → lateralite = G |

---

## 15 — NETTOYAGE IMPORT (mise à jour)

| # | Règle | Exemple | Action |
|---|---|---|---|
| 30 | Retirer suffix nom chirurgien | `SYNTHESE FRACTURE...-DR ALAIN` | Strip `-DR ALAIN` |
| 31-32 | Retirer suffix Dr variantes | `...VA- DR PICOULEAU` | Strip patterns |
| 33 | Détruire lignes HM_SIG | `HM_SIG_12345` | DELETE |
| 34 | Trim espaces | ` CANAL CARPIEN ` | Trim |
| 35 | Normaliser accents | `EPAULE` → `ÉPAULE` | Accent |
| 36 | Tronquer dates RGPD | `2026-03-15` → `2026-03-01` | 1er du mois |
| 37 | Extraire latéralité de Notes | `gauche`, `droit`, `bilat` | → D/G/B |
| **38** | **Tiret final** | `SYNTHESE FRACTURE CHEVILLE -` | **Strip tiret + TRIM** |
| **39** | **Espace résiduel fin** | `PROTHESE TOTALE EPAULE ` | **TRIM** |
| **40** | **Préfixe parasite** | `Protocole chirurgical X` | **Strip préfixe** |
| **41** | **Bruit note** | `PETITE INTERVENTION ORTHO. Consignes Bloc :` | **Strip préfixe note** |
| **42** | **Latéralité depuis anesthésie** | `Coté GAUCHE` dans protocole_anesthesie | **→ lateralite = G** |

---

## 16 — SÉPARATEURS ET FORMAT DE CHAMPS TEXT

| Champ | Séparateur | Exemple |
|---|---|---|
| `synonymes_recherche` | pipe `\|` | `nerf cubital\|canal ulnaire\|épitrochlée\|PTH` |
| `alertes` | pipe `\|` | `Garrot pneumatique\|Position coude fléchi` |
| `codes_ccam` | virgule `,` si multiple | `AHPA022` (unique) ou `LFFA002,LFFA001` |
| `cat_parent` | `>` | `NERF PÉRIPHÉRIQUE > NERF ULNAIRE` |
| `libelles_sources_lies` | pipe `\|` | Libellés OPTIM source |

**Parsing JS** : `str.split(/[,|]/).map(s => s.trim()).filter(Boolean)` — compatible pipe ET virgule.

---

## 17 — RÈGLES ANTI-RÉGRESSION NOMMAGE

| # | Règle |
|---|---|
| R1 | Ne jamais modifier un `libelle_cible` existant sans décision Manu |
| R2 | Ne jamais modifier une `frequence` existante sans recalcul validé |
| R3 | Tout nouveau protocole = nouvel `id_protocole` (ACT-NNNN séquentiel) |
| R4 | Ne jamais créer de doublon libelle_cible (UNIQUE constraint en DB) |
| R5 | Accents français obligatoires (ÉPAULE, pas EPAULE) |
| R6 | Articles CCAM obligatoires (SYNTHÈSE **DE** FRACTURE **DE**...) |
| R7 | Voie d'abord différente = protocole distinct |
| R8 | Hiérarchie S2 (>) dans libelle_cible ET cat_parent |
| R9 | Séparateur synonymes = pipe `\|` (pas virgule seule) |
| R10 | Export CSV = 13 colonnes standardisées (thesaurus-app.js `_exportCSV`) |
| R11 | Abréviations interdites dans libelle_cible — toujours développées |
| R12 | PTH/PTG/PTE/PIH/LCA/KJ = synonymes_recherche uniquement |
| R13 | Convention C1 : fracture sur prothèse ≠ geste sur prothèse (2 patterns distincts) |
| R14 | SYNTHÈSE = RÉDUCTION = OSTÉOSYNTHÈSE (synonymes BDB ortho) |
| R15 | Gestes cliniquement distincts (ténodèse/ténotomie/ténolyse/réinsertion/suture) = protocoles distincts même si installation identique (S4) |
| R16 | Mots-discriminants par zone : BICEPS = épaule, BICIPITAL = coude (S4.2) |
| **R17** | **Survivant fusion = libellé conforme S1 (accents + articles), PAS le plus gros volume** |
| **R18** | **SOUS AG / SOUS ANESTHÉSIE GÉNÉRALE supprimé des libellés (information anesthésie, pas chirurgicale)** |
| **R19** | **NEUROCHIRURGIE en un seul mot (pas "NEURO CHIRURGIE") — harmonisé dans thesaurus_protocoles, thesaurus_chirurgiens, staging_interventions_ortho** |
| **R20** | **INFILTRATION = protocole unique générique (pas de déclinaison par zone)** |
| **R21** | **Calcification = geste secondaire — ventilé vers l'arthroscopie de la zone concernée, pas de protocole autonome** |
| **R22** | **TUMÉFACTION = terme parapluie pour tissus mous (tumeur, lipome, nodule, kyste) — distinction reportée aux fiches de picking** |
| **R23** | **EXCROISSANCE OSSEUSE = terme parapluie pour exostose + ostéophyte** |
| **R24** | **Pattern TENDON hiérarchique : GESTE DE TENDON > LOCALISATION quand plusieurs localisations existent (C8)** |
| **R25** | **`id_protocole` (ACT-XXXX) est immuable une fois attribué. Un ACT supprimé n'est jamais réattribué. Le compteur avance toujours (max + 1). Les trous documentent l'historique des fusions/suppressions.** |
| **R26** | **Chéilectomie = synonyme clinique d'émondage ostéophytes MTP hallux = HALLUX RIGIDUS (ACT-0088). Variante percutanée = HALLUX RIGIDUS > PERCUTANÉ (ACT-0485).** |
| **R27** | **MORSURE = protocole unique (ACT-0430). Pas de déclinaison par animal — même installation, même matériel, même picking.** |
| **R28** | **Voie d'abord arthroscopique vs ciel ouvert = S2 quand les 2 existent pour le même geste. Ex : ÉPICONDYLITE DU COUDE (ciel ouvert) vs ARTHROSCOPIE DU COUDE > ÉPICONDYLITE. Matériel, installation, colonne vidéo sont différents.** |
| **R29** | **Statuts rapprochement fiches papier (thesaurus_fiches_papier.statut) — 5 valeurs exhaustives : `A valider (fort)` (score ≥ 0.7), `A valider (faible)` (score < 0.7), `Rapproche` (décision humaine validée), `Sans correspondance` (fiche sans protocole BDB), `Hors scope` (fiche hors périmètre thésaurus ortho-neuro). Ces valeurs sont immuables — ne pas en créer d'autres.** |

---

## 18 — BACKLOG NOMMAGE

| # | Sujet | Priorité |
|---|---|---|
| 1 | Prothèse d'épaule inversée : détecter dans notes, distinguer de PTÉ standard | HAUTE |
| 2 | EXÉRÈSE DE KYSTE + LAMBEAU → fusionné dans ABLATION > TUMÉFACTION (V2.4.0) — vérifier cohérence fiches picking futures | BASSE |
| 3 | THS (ACT-0358) : protocole obsolète conservé pour archives (12 interv) | INFO |
| 4 | S6-ABBREV : protocoles abréviations restants à arbitrer | MOYENNE |
| **5** | **Scan systématique notes vs protocole mappé — faux positifs résiduels (méthode validée session 069)** | **CONTINUE** |
| **6** | **Enrichissement synonymes_recherche : 396/396 couverts, qualité variable (anciens riches, récents courts)** | **CONTINUE** |

---

## HISTORIQUE

```
2026-03-24 — v1.0.0  Création. Conventions S1→S3. 37 règles mapping 021d.
2026-03-25 — v2.0.0  Session mapping 80 444 interventions ortho.
                     Nouvelles conventions C1→C6 (prothèses, plaies, ablation, morsures, fractures, petite intervention).
                     Mise à jour fusions §13 (20+ nouvelles entrées).
                     Nouvelles règles mapping §14 (38→46).
                     Nouvelles règles nettoyage §15 (38→42).
                     Nouvelles règles anti-régression R11→R14.
                     Dernier ACT attribué : ACT-0471.
2026-03-25 — v2.1.0  §14 rendu autonome : règles 1→37 (V1.0.0) fusionnées avec 38→46.
                     Fichier autonome — V1.0.0 non requis en session.
2026-03-28 — v2.2.0  §12 C6 réécrit : principe fondateur zéro perte de savoir opératoire.
                     Processus recatégorisation 4 étapes (regex → arbitrage humain → enrichissement → résidu).
                     Interface CRUD onglet 6 Thésaurus documentée.
                     Notes bruit pur : ajout mono-mot sans valeur clinique.
                     §4bis S4 ajouté : lisibilité opératoire — gestes distincts, mots-discriminants,
                     gestes associés (+), navigation famille. Cas d'école biceps (10 protocoles).
                     Migration 066d : renommage 7 libellés biceps, suppression 2 doublons (ACT-0438/0442).
2026-03-29 — v2.3.0  Fusion fichier principal + fichier "à contrôler" → version unique.
                     §12bis C7 ajouté : éponymes chirurgicaux (Matti-Russe → synonyme, Latarjet → conservé).
                     §14.6 : ACT-0481 PSEUDARTHROSE DE SCAPHOÏDE > GREFFE (migration 060).
                     Dernier ACT attribué : ACT-0481.
2026-03-29 — v2.4.0  Session 068→068g : 15 protocoles nettoyés (408→393).
                     §2 S2 : patterns TENDON, PROTHÈSE > ABLATION documentés.
                     §9 C3 : ABLATION réécrit en 3 familles (matériel, tissus mous, excroissance osseuse).
                     §9bis C8 : pattern TENDON hiérarchique (GESTE DE TENDON > LOCALISATION).
                     §9ter C9 : REPRISE S2 pour prothèses (pas cicatrices/synthèses corrigées).
                     §13.2 : 8 fusions session 068 documentées.
                     §17 : règles R17→R24 ajoutées.
                     §18 : backlog nommage ajouté.
                     Harmonisation NEUROCHIRURGIE (R19). INFILTRATION unique (R20).
                     Calcification ventilée par zone (R21). TUMÉFACTION parapluie (R22).
                     Dernier ACT attribué : ACT-0481. Protocoles : 393.
2026-03-29 — v2.5.0  Session 069→069l : recatégorisation batch PETITE INTERVENTION.
                     1 277 PI → 367 restantes (71% reclassées par regex sur notes).
                     3 fusions : ongles (ACT-0138→0029), quadriceps (ACT-0120→0157), morsures (ACT-0431→0430).
                     6 créations : VAC (ACT-0482), PLÂTRE (ACT-0483), ARTHRODÈSE SOUS-TALIENNE (ACT-0484),
                     HALLUX RIGIDUS > PERCUTANÉ (ACT-0485),
                     ARTHROSCOPIE ÉPAULE > RÉPARATION BOURRELET GLÉNOÏDIEN SUPÉRIEUR (ACT-0486),
                     ARTHROSCOPIE DU COUDE > ÉPICONDYLITE (ACT-0487).
                     4 renommages S2 : HAUBANNAGE > COUDE/ROTULE, HYGROMA > COUDE/GENOU.
                     42 faux positifs hallux rigidus corrigés (HALLUX VALGUS → HALLUX RIGIDUS).
                     ~60 égarés récupérés (morsures, épicondylite, SLAP).
                     Synonymes : 0 protocole sans synonymes (396/396).
                     §9quater C10 : HAUBANNAGE S2. §13.4→13.6 : fusions/créations/renommages session 069.
                     §17 : règles R25→R28 ajoutées. §18 : backlog +2 items.
                     Dernier ACT attribué : ACT-0487. Protocoles : 396.
2026-03-30 — v2.5.1  §17 : règle R29 ajoutée — statuts rapprochement fiches papier
                     (thesaurus_fiches_papier.statut — 5 valeurs immuables).
                     Décision D-2026-03-30-042 (migration 070).
```
