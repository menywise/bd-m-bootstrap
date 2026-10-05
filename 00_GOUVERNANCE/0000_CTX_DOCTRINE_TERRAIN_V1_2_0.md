# CTX_DOCTRINE_TERRAIN — Réalité du bloc opératoire

```
VERSION  : 1.2.0
DATE     : 2026-04-07
AUTEUR   : Manu (IBODE, 20 ans terrain) + Claude — Session #59
STATUT   : DOCTRINE — à charger avant toute session touchant aux protocoles,
           aux fiches, aux interventions, au picking, ou à la méthode BDB.
RÈGLE    : Ce document prime sur toute intuition de Claude sur "comment
           fonctionne un bloc opératoire" ou "ce que devrait être un protocole".
           Si Claude produit quelque chose qui contredit ce document,
           c'est Claude qui a tort.
DELTA    : v1.1.0 → v1.2.0
           Ajout section 9 — Propriété du contenu et gestion des départs.
```

---

# 1 — LA RÉALITÉ DU TERRAIN (NE PAS SIMPLIFIER)

## Les types de programmes (ne pas réduire à un seul cas)

BDB couvre l'ensemble du spectre opératoire :
- **Ortho programme froid** : intervention planifiée, délai possible, préparation anticipée
- **Traumatologie non septique** : urgence, délai court, imprévisibilité maximale
- **Neurochirurgie** : protocoles spécifiques, matériel distinct, positionnement critique
- **Septique** : contraintes contamination, circuit dédié, matériel largement jetable

Chaque type génère des contraintes différentes à chaque étape de la chaîne.

## Le chemin d'une intervention (chaîne complète)

Entre un symptôme patient et la salle d'opération, au moins 10 intervenants
nomment, codent, interprètent chacun selon leur propre référentiel.
À chaque étape, une décision est prise avec l'information disponible,
sans être transmise à l'étape suivante.

```
Patient (symptôme)
    ↓
Urgentiste OU médecin traitant
(diagnostic, premier codage, orientation)
    ↓
Chirurgien consultation
(indication opératoire, libellé médical)
    ↓
Secrétaire
(saisie programme OPTIM — libellé approximatif, inventé, ou abrégé)
    ↓
Cellule de régulation
(planification bloc, priorisation, affectation salle et créneau)
    ↓
Cadre de bloc
(organisation journée, attribution équipes)
    ↓
Aide-soignante du bloc
(lecture programme, picking avec ce qui est disponible ce jour-là)
    ↓
IBODE d'ouverture de salle
(prépare le matériel en salle + les options non incluses dans le picking)
    ↓
IBODE de salle / instrumentiste
(vérifie cohérence préparation / intervention réelle,
 s'adapte si écart entre programme et réalité)
    ↓
Panseur
(sert le matériel, doit courir partout si manque ou incohérence)
    ↓
Chirurgien salle
(geste réel — s'adapte à la réalité anatomique et physiologique,
 parfois très différent du programme initial)
    ↓
Apprenant ou intérimaire
(doit s'en sortir s'il est à côté de ses pompes —
 un profil DISC incompatible avec l'adaptation = rupture en salle)
    ↓
Chirurgien facturation
(cotation CCAM dans son coin — libellé encore différent)
    ↓
Gestion administrative
(correction papier/informatique, suivi système,
 mise à jour et optimisation de la base)
```

**À chaque étape : un libellé différent, une interprétation différente,
une décision non documentée. L'intervenant suivant repart de zéro dans le stress.**

Chaque intervenant fait de son mieux avec l'information disponible.
Aucun n'est en tort. Le système est structurellement chaotique.

C'est pour ça que BDB n'existait pas encore.
C'est pour ça qu'il ne pouvait pas être inventé par quelqu'un
qui ne vit pas ce chaos de l'intérieur.

---

## Ce que Claude ne doit JAMAIS faire

- Traiter les intitulés OPTIM comme une source de vérité
- Traiter les noms de fichiers papier comme une source de vérité
- Traiter les cotations CCAM existantes comme une source de vérité
- Proposer un "matching automatique" entre ces sources comme solution
- Confondre "aligner deux sources imparfaites" avec "faire du progrès"
- Penser qu'un "score de similarité" entre deux chaînes de caractères
  a une valeur clinique quelconque

---

## Ce que ces sources sont réellement

| Source | Ce qu'elle est | Ce qu'elle n'est pas |
|---|---|---|
| Fiches papier chirurgien | Preuve qu'un geste existe dans la pratique réelle | Définition du protocole |
| Intitulés OPTIM | Signal brut à déchiffrer | Nomenclature fiable |
| Notes OPTIM | Mine d'information cachée (matériel, côté, variante) | Standard clinique |
| Cotations CCAM actuelles | Indication approximative du geste facturé | Vérité médicale |
| 90 000 interventions | Fréquence et variantes terrain | Source de libellés |

**Matière première à déchiffrer. Jamais à copier.**

---

# 2 — CE QU'EST UN PROTOCOLE BDB

## Définition correcte

Un protocole BDB n'est **pas** une description clinique exhaustive d'un acte chirurgical.

C'est un **contexte de préparation documenté** avec un niveau de certitude connu,
qui permet à une IBODE — même novice — de savoir quoi préparer,
avec quelles variantes possibles, selon quel chirurgien.

## Structure d'un protocole complet

```
PROTHÈSE TOTALE DE HANCHE PAR VOIE ANTÉRIEURE
  ├── libelle_cible : propre, stable, conforme S1/S2/S4
  ├── codes_ccam   : NBCA010 (vérifié) — vide si incertain
  ├── picking      : ancillaire PTH, table orthopédique...
  │                  → partiel OK, statut_completude = 60%
  ├── variantes    : Dr Coste = sans ciment / Dr Louisia = ciment
  ├── substitutions validées : Fine chir acceptable si boite pied indispo
  ├── statut       : V2.1 — stable mais pas définitif
  └── CCAM         : mieux vaut vide que faux
```

## Les modules annexes sont partie intégrante du protocole

Un protocole BDB n'existe pas en isolation. Il est relié à :

| Module | Rôle dans le protocole |
|---|---|
| **Fiches de cours** | Formation des novices sur ce type d'intervention |
| **Transmissions** | Suivi matériel, savoir, signalements inter-équipes |
| **DISC** | Profils psychologiques de l'équipe — qui peut faire quoi dans le stress |
| **Collab** | Communication et coordination autour de l'intervention |
| **Paxis** | Recueil des situations bloquantes rencontrées en salle |
| **Glossaire** | Abréviations, termes chirurgien, marques matériel |
| **Arsenal** | Localisation réelle du matériel, substitutions connues |
| **Préférences chirurgien** | Delta documenté par chirurgien sur ce protocole |

Un protocole sans ces liens est utile mais incomplet.
La complétude se mesure sur l'ensemble de la chaîne, pas seulement sur le picking.

## Ce que "picking fluctuant" signifie

Le picking varie selon :
- Disponibilité matériel (casse, retrait marché, réassort)
- Voie d'abord choisie en salle
- Complexité découverte per-op
- Habitudes et préférences du chirurgien
- Matériel disponible ce jour-là

**BDB ne fixe pas le picking. BDB documente les variantes connues**
**et les substitutions validées terrain.**

La boite de pied → Fine chir n'est pas une erreur à cacher.
C'est une information à transmettre à la prochaine IBODE.

---

# 3 — LE MODÈLE D'ITÉRATION

## Principe fondamental

> Une version imparfaite documentée vaut infiniment mieux
> qu'une perfection qui n'existe pas encore.

| État | Valeur |
|---|---|
| Protocole à 100% | Idéal — rare au démarrage |
| Protocole à 60% | Utile immédiatement — Julie sait qu'il est incomplet |
| Protocole à 0% | Rien — l'IBODE improvise dans le stress |
| Protocole faux non identifié comme tel | **Dangereux** |

La clé : **le niveau de complétude est visible et honnête.**
Pas pour faire joli. Pour que Julie sache qu'elle doit appeler avant de picker.

## Comment l'itération fonctionne

Le schéma simplifié à 3 étapes est faux. En réalité, les causes d'itération
sont au moins 20 et leurs combinaisons sont exponentielles.

Exemples de déclencheurs d'itération :
- Une aide-soignante signale que la boite pied est toujours indisponible
- Un matériel est retiré du marché (substitution à documenter)
- Le Dr X change sa voie d'abord habituelle
- Un intérimaire bloque sur un terme que personne n'explique
- Une note OPTIM révèle une variante inconnue sur 200 interventions
- La cellule de régulation change l'attribution d'une salle
- Un panseur signale un manque récurrent en fin d'intervention
- Un profil DISC incompatible avec l'adaptation provoque une rupture en salle
- Un apprenant découvre une incohérence que les anciens avaient intégrée
- Un chirurgien retraité laisse ses préférences sans successeur documenté
- Un pack est reformulé par le fournisseur (contenu différent, même nom)
- Une situation bloquante Paxis révèle un angle mort du protocole
- ...

**Un profil DISC incompatible avec l'adaptation ne "s'adapte" pas —
il bloque, il stresse, il démissionne. Le protocole doit être suffisamment
explicite pour que même ce profil puisse s'en sortir.**

La V1 obsolète est **archivée, pas effacée**.
L'historique de l'itération est une donnée, pas une honte.
Ce qui était vrai hier devient la référence de comparaison pour demain.

## Ce qui déclenche une itération

- Une IBODE signale une information non documentée
- Un chirurgien change ses préférences
- Un matériel est retiré du marché
- Une note OPTIM révèle une variante inconnue
- Une fiche papier est mise à jour
- Un nouveau protocole absorbe des PI résiduelles

---

# 4 — LE COMBO GAGNANT

C'est l'unité de progrès de BDB. Pas un module. Pas une feature. Un protocole complet et lié.

Si autant de modules ont été développés, c'est précisément parce que
le combo est plus large qu'un simple protocole + CCAM.

```
NOM LISIBLE (libelle_cible BDB propre)
    ↕ lié
CODE CCAM (vérifié ou vide assumé)
    ↕ lié
FICHE PICKING (partielle OK, complétude visible)
    ↕ lié
VARIANTES CHIRURGIEN (préférences documentées)
    ↕ lié
SUBSTITUTIONS VALIDÉES (Fine chir si boite pied manque)
    ↕ lié
INTERVENTIONS TERRAIN (fréquence réelle, notes exploitées)
    ↕ lié
FICHES DE COURS (formation novices + intérimaires)
    ↕ lié
TRANSMISSIONS (suivi matériel, savoir, signalements)
    ↕ lié
PAXIS (situations bloquantes documentées)
    ↕ lié
DISC (qui dans l'équipe peut tenir ce rôle sous pression)
    ↕ lié
ÉVOLUTIONS DOCUMENTÉES (itérations archivées, pas effacées)
    ↕ lié
REMISES EN QUESTION (ce qui a changé et pourquoi)
```

**Quand un combo est atteint à n% :**
- Il est immédiatement utilisable
- Son niveau est visible
- Il tire vers le haut TOUS les éléments liés
- Il permet de reclasser des interventions qui étaient en PI
- Il forme les nouveaux arrivants sans que Manu soit dans la boucle
- Il transmet ce que les anciens savaient et n'ont jamais écrit

**Le premier combo à 100% est plus important**
**que 100 protocoles à 50% non liés.**

---

# 5 — VARIANTES PAR CHIRURGIEN

## Principe

Il n'y a PAS un protocole par chirurgien.
Il y a UN protocole avec des DELTA par chirurgien.

```
PTH PAR VOIE ANTÉRIEURE (protocole racine)
    ├── Dr Coste     : sans ciment, Amplitude, ancillaire X
    ├── Dr Louisia   : avec ciment, table standard, ancillaire Y
    └── Dr Fourastier: voie de Rottinger (variante voie d'abord)
```

Le protocole racine définit le contexte commun.
Le delta chirurgien documente ce qui diffère.

Si deux chirurgiens ont des différences si fondamentales que le contexte
de préparation est radicalement différent → deux protocoles distincts.
Sinon → un protocole + deltas.

---

# 6 — CE QUE BDB N'EST PAS

| Tentante confusion | Réalité |
|---|---|
| "Faisons matcher les fiches avec les protocoles automatiquement" | Les fiches confirment l'existence d'un geste, elles ne définissent pas le protocole |
| "Alignons nos libellés sur le CCAM" | CCAM = facturation administrative. BDB = préparation de salle. Langages différents |
| "Copions la structure OPTIM" | OPTIM est la source du problème, pas la solution |
| "Un protocole par chirurgien" | Delta par chirurgien sur protocole racine |
| "Corrigeons d'abord toutes les PI" | Un combo gagnant > 1000 PI résiduelles non liées |
| "Score de similarité = qualité du rapprochement" | Similarité textuelle ≠ pertinence clinique |

---

# 7 — LA CHAÎNE DE VALEUR RÉELLE

```
TERRAIN CHAOTIQUE
(OPTIM pourri, secrétaires qui inventent, fiches obsolètes,
 90 000 interventions hétérogènes, CCAM approximatifs)
        ↓  [signal à déchiffrer]
IBODE EXPERT (Manu, 20 ans de bloc)
        ↓  [décision clinique + méthode BDB]
PROTOCOLE BDB
(contexte de préparation documenté, niveau de complétude visible,
 variantes chirurgien, substitutions validées, CCAM vérifié ou vide)
        ↓  [propagation vers]
SECRÉTAIRE    IBODE JUNIOR    CHIRURGIEN    STATS    FUTURE INSTANCE
(nom propre)  (picking clair) (CCAM juste)  (clean)  (reproductible)
```

BDB est le pont entre le chaos terrain et la pratique professionnelle.
Il ne supprime pas le chaos. Il l'absorbe et restitue quelque chose d'utilisable.

---

# 8 — RÈGLES POUR CLAUDE

1. **Ne jamais proposer un "matching automatique" comme solution**
   Le matching algorithmique n'a pas de valeur clinique.

2. **Ne jamais traiter une source terrain comme une source de vérité**
   OPTIM, fiches papier, cotations CCAM actuelles = matière première.

3. **Toujours demander le niveau de complétude visé avant de coder**
   Un protocole à 60% documenté est un succès, pas un échec.

4. **Respecter l'itération**
   Ce qui était vrai hier peut être amélioré demain. L'archivage est une fonctionnalité.

5. **Un combo gagnant > des statistiques flatteuses**
   395 protocoles non liés valent moins qu'un seul protocole complet et utilisable.

6. **CCAM : vide est correct si incertain**
   Ne jamais proposer un code CCAM sans vérification Perplexity ou source officielle.

7. **Les variantes sont une richesse, pas des exceptions**
   Documenter que Dr Coste fait différemment de Dr Louisia = valeur ajoutée.

8. **Julie doit pouvoir comprendre**
   Si une novice ne peut pas lire le libellé et comprendre le contexte en 30 secondes,
   le protocole n'est pas assez lisible.

---

# 9 — PROPRIÉTÉ DU CONTENU ET GESTION DES DÉPARTS

## Doctrine fondamentale

> Le contenu métier BDB appartient à l'établissement, pas au contributeur.
>
> Un chirurgien n'est pas propriétaire d'une voie d'abord.
> Une IBODE n'est pas propriétaire d'un protocole qu'elle a rédigé.
> BDB est une mémoire institutionnelle, pas un portfolio individuel.
>
> Le contributeur est rédacteur, correcteur, force de proposition.
> L'admin est garant de la qualité et propriétaire fonctionnel du contenu.

## Ce qui appartient à l'individu (données personnelles)

Ces données sont liées à la personne et partent avec elle :

- Profil personnel (`profiles`, `profiles_directory`)
- Rôle applicatif (`user_roles`)
- Taille de gants, casaque, préférences d'équipement (`gants`, `casaques`)
- Résultats DISC, profil psychologique (`disc_profils`, `disc_tests`, `disc_conclusions`)
- Votes et participations personnelles (`collab_votes`)
- Transmissions — données opérationnelles liées à sa présence physique
- Historique de navigation (`dork_history`, `error_404_logs`)
- Progressions personnelles (`carnet_progressions`, `livret_progression`)

## Ce qui appartient à l'établissement (mémoire institutionnelle)

Ces données restent même si le contributeur part :

- Protocoles, fiches de cours, matériel, anatomie, installations patient
- Contributions éditoriales : glossaire, transmissions métier, collab_ideas
- **Préférences chirurgien** — savoir-faire opérationnel institutionnel,
  pas propriété du chirurgien (voir cas retraite ci-dessous)
- Toute donnée qui permet à une IBODE future de préparer une salle

## Cas chirurgien retraite — le cas emblématique

Quand un chirurgien part à la retraite, ses préférences opératoires
ne disparaissent pas avec lui. Elles documentent un savoir-faire
institutionnel critique pour le prochain patient porteur d'une pathologie connue.

```
Dr Coste part à la retraite
    ↓
Ses préférences PTH voie antérieure restent dans BDB
    ↓
Anonymisées → "Dr. C. (retraité)" ou "Chirurgien anonyme"
    ↓
Le nouveau chirurgien peut s'en inspirer ou créer son propre delta
    ↓
La mémoire institutionnelle est préservée
```

Le chirurgien ne possède pas la pathologie, ni la voie d'abord,
ni la technique opératoire. Il n'est pas un découvreur ou un inventeur.
Il est un praticien dont les habitudes documentées ont une valeur collective.

## Les 4 actions admin sur un compte

| Action | Déclencheur | Données perso | Contributions métier | Transmissions | Préférences chirurgien |
|---|---|---|---|---|---|
| **Suspendre** | Congé mat, arrêt longue durée | intactes | intactes | intactes | intactes |
| **Changer rôle** | Évolution interne (IBODE → cadre) | intactes | intactes | intactes | intactes |
| **Supprimer standard** | Départ définitif, mutation | DELETE | NULLIFY | DELETE | NULLIFY → anonymisé |
| **Supprimer + droit à l'oubli** | Demande explicite membre | DELETE | NULLIFY | DELETE | DELETE |

**Règle NULLIFY** : `created_by` / `user_id` → NULL. Le contenu reste,
l'auteur devient "Auteur inconnu" ou "Chirurgien anonyme" selon le contexte.

**Règle DELETE** : suppression physique des lignes + suppression `auth.users`.

## Ce que BDB ne fait PAS

- Pas de "droit à l'oubli" sur les contributions métier
  (une IBODE ne peut pas effacer un protocole qu'elle a rédigé)
- Pas de propriété individuelle sur les protocoles ou techniques
- Pas de blocage de contenu par un contributeur qui quitte l'établissement

---

# HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-03 | 1.0.0 | Création. Session #28. Synthèse de la compréhension acquise après des mois de terrain. |
| 2026-04-03 | 1.1.0 | Corrections Manu. Chaîne complète. Types programmes. Modules annexes. Itération réelle. Combo gagnant élargi. |
| 2026-04-07 | 1.2.0 | Session #59. Ajout section 9 — Propriété du contenu et gestion des départs. Doctrine établissement vs individu. 4 actions admin. Cas chirurgien retraite. |
