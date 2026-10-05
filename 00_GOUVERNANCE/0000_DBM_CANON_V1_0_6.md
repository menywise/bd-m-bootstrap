# DB&M — CANON
```
VERSION  : 1.0.6
DATE     : 2026-05-03
BASE     : CANON V1.0.5 (Bible de Bloc) + cascade fondateurs session #114
STATUT   : FONDATION ONTOLOGIQUE
AUTEUR   : Manu + Claude
PRÉALABLE: Niveau 0 DB&M V0.5 (000000_NIVEAU_0_DBM_V0_5_0.md) à traverser AVANT
DELTA    : V1.0.5 → V1.0.6
           Renommage : BDB → DB&M en surface (préfixes techniques bdb_* conservés).
           §1 : promesse "5 bons" formalisée comme principe nommé PROMESSE-5-BONS
                 (bonne info / bonne personne / bon moment / bon endroit / bon niveau).
           §1 : référence GPS-01 (cercle vertueux mini-site ↔ app, D-2026-04-26-GPS-01).
           §8 : ajout INTERDIT-WORDING-METHODES-01 dans bloc règles IA
                 — méthodes pédagogiques jamais nommées en surface L1/L2.
           §10 : ajout Niveau 0 V0.5 au rang 0 (au-dessus du Manifeste).
           Source #1 mise à jour : Manifeste DB&M V1.4.
           Maladies adressées : amnésie (5 bons enfin formalisés) + certitude
                                (méthodes pédago restent en coulisses).
           Interdits Niveau 0 honorés : #1 (cap nommé), #4 (sources atelier_principes
                                        citées), #6 (renommage DB&M annoncé).

DELTA    : V1.0.4 → V1.0.5
           §10 : référence morte `atelier_fondation` (table supprimée migrations
                 147-150) remplacée par `atelier_principes` (catégories stb, axe,
                 user_story).
           Maladies corrigées : certitude + amnésie.
           Interdits résolus : #3 (régression silencieuse), #4 (hallucination
                               silencieuse).
           Motif : audit N0 gouvernance 2026-05-01.

DELTA    : V1.0.3 → V1.0.4
           §0 : typo "signal" → "signale" corrigée.
           §0 : "jamais de refus brutal" → formulation positive.
           §4.2 : attribution Boudreault/CRAIE ajoutée explicitement.
           §6 : "Comprendre, apprendre, agir" attribué Boudreault/CRAIE/UQAM.
           Annexe séparée : BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md.
```

---

## 0. COMMENT UTILISER CE DOCUMENT

Ce document distingue deux types de contenu.

**TOUJOURS** — vrai il y a un an, vrai aujourd'hui, vrai dans un an.
La fondation sur laquelle tout le reste repose.
Quand une proposition contredit un principe TOUJOURS :
lancer un brainstorming ELI15 + FAB(3R) pour comprendre, apprendre, et agir.

**AUJOURD'HUI** — ce qui fonctionne dans l'état actuel du projet.
À questionner dès que le terrain signale que ça freine plutôt que ça aide.

> **Préalable obligatoire — Niveau 0 DB&M V0.5**
>
> Ce Canon ne se lit pas en premier. Le Niveau 0 DB&M V0.5 (`000000_NIVEAU_0_DBM_V0_5_0.md`) est le sas universel qui calibre toute IA et tout humain abordant DB&M. Il porte les 6 interdits de navigation, la grille ARE, l'ennéagramme des processus, et les 3 maladies (amnésie / boulimie / certitude). Le Canon décline les principes opérationnels DANS ce cadre.

---

Pour toute IA travaillant sur ce projet :

Identifier si la règle concernée est TOUJOURS ou AUJOURD'HUI avant d'arbitrer.
Signaler toute ambiguïté avant de proposer une solution.
Utiliser ELI15 + FAB(3R) pour tout choix soumis à arbitrage.
Quand un principe AUJOURD'HUI freine le terrain : le signaler à Manu, pas le contourner.
Quand un principe TOUJOURS est contredit : brainstorming ELI15 + FAB(3R) — comprendre, apprendre, agir.

Ce document protège ce qui a été vrai depuis le premier jour.
Il laisse ouvert ce que DB&M n'a pas encore besoin de savoir.

> **Note V1.0.6 — renommage** : Bible de Bloc (BDB) devient Des Blocs & Moi (DB&M) en surface. Les préfixes techniques `bdb_*` (tables L1 transverses) restent inchangés — le code n'est pas un livre. Décision actée session #113 (D-2026-05-03-DOCTRINE-01 à 04).

---

## 1. CE QUE DB&M ACCOMPLIT

### La promesse — TOUJOURS — PROMESSE-5-BONS

> **La bonne information trouve la bonne personne,**
> **au bon moment, au bon endroit,**
> **avec le niveau de détail qu'elle est prête à recevoir.**

Cette promesse porte les **5 bons** — formalisés en V1.0.6 comme principe nommé `PROMESSE-5-BONS`. Chaque mot a été gagné sur le terrain :

**(1) La bonne information** — pertinente pour le rôle et le moment.
Pas exhaustive. Pas universelle. Pertinente pour celle qui en a besoin maintenant.

**(2) La bonne personne** — Sabine, Julie, Brigitte, Olivia ne reçoivent pas la même information de la même façon. DB&M ajuste qui voit quoi (cf. §3 couches L1/L2 + filtres acteur).

**(3) Au bon moment** — avant l'intervention, après l'intervention.
Pendant : DB&M enseigne comment préparer. Il ne remplace pas la préparation elle-même.

**(4) Au bon endroit** — téléphone en vestiaire, bureau, pause, domicile.
La salle d'opération n'est pas un contexte de lecture.

**(5) Avec le niveau attendu** — ce que Sabine comprend n'est pas ce que Julie comprend.
Ce que Julie comprend n'est pas ce que Brigitte comprend.
DB&M s'adapte. Il ne force pas.

> **PROMESSE-5-BONS — règle d'application** : toute fonctionnalité DB&M doit pouvoir répondre aux 5 bons. Une fonctionnalité qui sert un seul des 5 bons est suspecte. Une fonctionnalité qui en contredit un est en violation TOUJOURS.

---

### Ce que DB&M résout concrètement — TOUJOURS

**Pour le chirurgien** qui opère de la même façon depuis quinze ans :
son savoir tacite survit à chaque changement d'équipe.
Il cesse de répéter. L'équipe est prête. La salle tourne comme il l'attend.

**Pour l'infirmière arrivée la semaine dernière** :
elle accède au savoir de celles qui étaient là avant elle,
sans attendre des années d'immersion, sans devoir demander pour ne pas déranger.
Ce qui était oral devient consultable. Ce qui était dans la tête d'Estelle
est maintenant disponible pour Emma.

**Pour le patient** :
la qualité de préparation de l'équipe qui va l'opérer progresse
à chaque fiche complétée, à chaque préférence validée, à chaque terme clarifié.

---

### Lien CANON → Mini-site → App — AUJOURD'HUI — GPS-01

Les promesses de ce document se retrouvent dans le mini-site.
Les promesses du mini-site se retrouvent dans l'application.
Ce que Brigitte comprend en trente secondes doit être livrable par Sabine en salle.
**Une promesse sans module dans l'application est une dette à documenter.**

> **Référence GPS-01** (D-2026-04-26-GPS-01) : architecture GPS macro ↔ micro qui structure le passage des promesses Canon → mini-site → app. Cercle vertueux : la promesse Canon descend dans le mini-site, le mini-site engage la livraison app, l'app remonte des signaux qui enrichissent le Canon. Implémentation à finaliser (Vision V0.4 — interne 3 ans).

---

### Ce que DB&M n'est pas — TOUJOURS

- Un outil de décision médicale
- Un catalogue fournisseur
- Un outil de traçabilité per-opératoire
- Un logiciel de gestion hospitalière
- Une application de formation académique

---

## 2. POURQUOI DB&M EXISTE — LA RÉALITÉ DU TERRAIN

### La chaîne du chaos — TOUJOURS

Entre un symptôme patient et la salle d'opération :
**12 intervenants ou plus** nomment, codent, interprètent —
chacun selon son propre référentiel, sans transmettre à l'étape suivante.

```
Patient > Médecin traitant > Spécialiste > Imagerie/biologie
> Chirurgien consultation > Secrétaire > OPTIM > Cadre de bloc
> Pharmacie/stérilisation > IBODE préparation > Anesthésiste
> Chirurgien salle > Aide-op/instrumentiste > Chirurgien facturation
> DIM/PMSI > Stats
```

À chaque flèche : un libellé différent, une interprétation différente,
une décision prise et perdue. L'IBODE suivante repart de zéro.

**Le risque principal au bloc n'est pas l'absence de matériel.
C'est l'impossibilité de reconnaître, nommer ou localiser ce qui existe.**

La connaissance critique est fragmentée, humaine, distribuée —
et surtout orale, dans un milieu de professionnels peu à l'aise avec l'écrit numérique.
DB&M ne remplace pas l'oral. Il capte ce que l'oral ne peut pas préserver.

> Vue détaillée : `0000_CTX_DOCTRINE_TERRAIN_V1_2_0` §1 (chaîne 12+ documentée). Manifeste DB&M V1.4 §2bis (alignement réconciliation D17 clos).

---

### Les situations de blocage terrain — TOUJOURS

Toute fonctionnalité DB&M adresse au moins une de ces situations.
Une fonctionnalité qui n'en adresse aucune est superflue.

Ces situations ont été observées directement sur le terrain.
D'autres peuvent émerger. Un blocage non encore listé n'est pas invalide.

| Code | Ce qui se passe sur le terrain | Ce que DB&M rend possible |
|---|---|---|
| STB-01 | Le matériel est là mais personne ne le reconnaît : trois noms pour le même objet | Glossaire + Arsenal : équivalences, photos, localisation |
| STB-02 | Les préférences du chirurgien ne sont jamais dites mais toujours attendues | Module Préférences : saisies, validées, consultables |
| STB-03 | Les tâches arrivent découpées, sans lien avec ce qui se passe en salle | Liaisons inter-modules : le picking se connecte au protocole |
| STB-04 | Chaque acteur nomme les choses à sa façon. Personne ne parle le même langage | Thésaurus + synonymes : un terme conduit toujours au bon protocole |
| STB-05 | Ce qui est évident pour l'expert ne l'est pas pour la novice. Personne ne l'a dit | Cours + Fiches : les implicites deviennent consultables |
| STB-06 | Quand Estelle est absente, Emma ne sait pas. Le savoir part avec les gens | Le contenu survit aux départs. DB&M est la mémoire qui ne prend pas de congés |
| STB-07 | La formation existe mais elle ne prépare pas aux vrais blocages de salle | Chaque cours DB&M référence au moins une situation de blocage réelle |

---

### Les principes qui gouvernent DB&M sans avoir été nommés — TOUJOURS

Ces principes étaient actifs avant d'être nommés.
Les nommer les rend applicables consciemment.

| Principe | Auteur / Source | Ce qu'il fait dans DB&M |
|---|---|---|
| Roue de Deming (PDCA) | W. Edwards Deming | Signalement → correction → validation → publication : le cycle s'améliore à chaque tour |
| Matrice d'Eisenhower | Eisenhower / Covey | Un signalement urgent et important passe avant tout le reste |
| Andragogie | Malcolm Knowles | Les cours s'adressent à des adultes en activité, pas à des étudiants |
| DISC | W. M. Marston | La communication s'adapte au profil de la personne qui reçoit l'information |
| SECI — savoir tacite vers explicite | Nonaka & Takeuchi | Ce qui était dans la tête d'Estelle devient consultable par Emma |
| Communautés de pratique | Wenger / Lave | Les acteurs construisent ensemble un vocabulaire et un savoir partagés |
| FAB(3R) | DB&M / Manu + Claude | Tout choix technique ou fonctionnel est arbitré avec le même cadre |
| ELI15 | Usage commun | Toute explication complexe peut être comprise par un collègue sans formation technique |
| Comprendre, apprendre, agir | Henri Boudreault / CRAIE — UQAM | Face à une contradiction : comprendre l'enjeu, apprendre la solution, agir — pas rejeter |

> **Note V1.0.6 — INTERDIT-WORDING-METHODES-01** : ces auteurs et méthodes structurent DB&M en interne (L3) mais **ne sont jamais nommés en surface** (L1/L2). L'utilisateur ne lit jamais "module Boudreault" ou "section Knowles" — il lit ce que ces méthodes lui rendent possible. Voir §8.

---

### Ce que DB&M ne vise pas — TOUJOURS

DB&M ne vise pas l'exhaustivité. Il vise la réduction de la zone d'ignorance dangereuse.

> Permettre à quelqu'un qui sait qu'il ne sait pas
> de savoir où chercher, comment nommer, et à qui demander —
> sans prétendre décider à sa place.

Toute information présente dans DB&M répond à au moins une de ces questions :
Qu'est-ce que je dois faire ? Avec quoi ? Quand ? Où ?

---

## 3. COMMENT DB&M EST CONSTRUIT — LES 3 COUCHES

### Architecture — AUJOURD'HUI

```
L3 — Atelier  : l'usine. Gouvernance, décisions, conventions.
                Ne voyage jamais avec le produit.
                Tables atelier_*. Usage exclusif Manu × Claude.

L2 — Instance : le terrain de chaque établissement.
                Chirurgiens locaux, préférences, historique, équipe.
                Administré par Olivia, Sophie, Anne-Cécile.

L1 — Universel: ce qui est vrai dans tous les blocs.
                Protocoles, glossaire, cours, arsenal, fiches.
                Voyage avec chaque installation.
```

Schéma acteurs complet (avec pharmacie) : `flux_acteurs_preferences_v2_pharmacie.svg`

**TOUJOURS : les couches séparent les données. Elles ne séparent pas les personnes.**
Chaque acteur trouve ce dont il a besoin, signale ce qui manque,
contribue à ce qu'il sait — sans avoir besoin de connaître l'architecture.

**AUJOURD'HUI : les frontières exactes L1/L2 s'ajustent avec le terrain.**
Une préférence locale peut devenir un standard universel.
C'est une évolution prévue, pas un problème à éviter.

---

## 4. LES ACTEURS DU SYSTÈME

### Qui bénéficie de DB&M — AUJOURD'HUI

| Persona | Comment DB&M lui sert |
|---|---|
| Manu | Crée, décide, valide l'architecture — arbitre L3 |
| Ewan | Configure et adapte chaque instance |
| Brigitte | Prend la décision d'achat avec des arguments solides |
| Olivia / Sophie | Valident le contenu, administrent l'instance |
| Anne-Cécile | Admin La Marche — actions courtes, en autonomie |
| Sabine | Trouve ce dont elle a besoin avant d'entrer en salle |
| Julie | Accès au savoir de celles qui étaient là avant elle |
| Dr C. (à l'aise avec le numérique) | Saisit lui-même ses préférences |
| Dr A. (peu à l'aise avec le numérique) | Ses préférences entrent via Julie — il bénéficie sans toucher DB&M |
| Dr L. (très à cheval sur ses habitudes) | Fait confiance dès lors que ce qu'il voit correspond exactement à ce qu'il a validé |
| Carole (réfractaire) | Sera convaincue par l'expérience de Sabine — pas par une formation |
| Isabelle (qui veut bien mais ne sait pas) | Guidage étape par étape, langage terrain, zéro jargon |
| Pharmacie (C., M., L.) | Savent ce qui est substituable — leur place dans DB&M reste à construire |

### Ce qui ne change pas — TOUJOURS

Un nouvel acteur peut apparaître à tout moment.
La pharmacie n'était pas prévue — elle est là. D'autres viendront.
L'architecture accueille un nouveau rôle sans refonte.

DB&M produit de la valeur pour un acteur même s'il n'y touche jamais.
Dr A. bénéficie via Julie.
Carole bénéficie via Sabine.
Brigitte bénéficie via les résultats qu'Olivia lui présente.

---

## 5. QUI FAIT QUOI AVEC LES DONNÉES

### Proposer une donnée — TOUJOURS

Tout le monde, sans condition d'entrée.
Y compris un visiteur en mode découverte.
Toute proposition attend une validation avant d'être visible.

### Valider — AUJOURD'HUI

```
Contenu universel (L1) → Manu valide
Contenu d'instance (L2) → l'admin de l'instance valide
```

Si Manu devient un goulot, cette délégation sera documentée et transmise.

### Corriger — AUJOURD'HUI

```
Le créateur du contenu corrige dans son périmètre.
L'admin de l'instance corrige dans son instance.
Un membre dont la correction est autorisée peut corriger.
Un rôle spécifique dont c'est la responsabilité peut corriger.
```

Toute correction crée une nouvelle version. L'historique reste accessible.
Le chemin des micro-corrections (coquilles, accents) pourra être allégé — à décider.

### Signaler une erreur — TOUJOURS

Tout le monde, sans exception.
Un visiteur en mode découverte, un invité, un membre.
Le signalement est le seul flux qui ne connaît aucune restriction.

### Comment une information remonte jusqu'au créateur — AUJOURD'HUI

```
Signalement > admin instance (qui filtre)
Admin instance > collab_ideas (si le problème est récurrent)
collab_ideas > Manu (si c'est architectural)
```

L'admin instance est le filtre humain obligatoire entre le terrain et l'atelier.
Si les admins instance sont saturés, un relais sera défini — via décision documentée.

---

## 6. MÉTHODE D'ARBITRAGE — ELI15 + FAB(3R) — TOUJOURS

Tout choix technique, architectural ou fonctionnel passe par ce cadre
avant d'être soumis à arbitrage.

**Étape 1 — ELI15**
Expliquer le problème comme à un collègue intelligent qui n'a pas de formation technique.
Si on ne peut pas l'expliquer simplement, le problème n'est pas encore compris.

**Étape 2 — Comprendre, apprendre, agir**
Cycle pédagogique de Henri Boudreault / CRAIE (Université du Québec à Montréal).
Face à une situation nouvelle ou contradictoire :
comprendre le contexte réel avant d'agir,
apprendre ce que la situation révèle,
agir avec cette nouvelle compréhension.

**Étape 3 — FAB(3R)**

| Dimension | Ce qu'on attend |
|---|---|
| Réalité | Ce que c'est — concret, sans valorisation |
| Fonction | Ce que ça fait dans le contexte DB&M |
| Avantage | Ce que ça apporte par rapport à l'alternative |
| Bénéfice | Ce que ça change concrètement pour Manu, l'équipe, ou l'app |
| Risque | Acteur nommé + moment précis + conséquence métier concrète |
| Résultat | Ce qu'on peut voir, mesurer, constater — date ou chiffre si possible |
| Recommandation | Un choix tranché, argumenté, assumé |

**Risque bien formulé :**
Ewan réimporte le module → écrase la migration → perte des données L2 sans rollback possible.

**Résultat bien formulé :**
Chargement mesuré sous 200ms via DevTools — vérifiable à chaque déploiement.

**Recommandation bien formulée :**
Claude choisit et assume. "Ça dépend de vos besoins" sans suite n'est pas une recommandation.

---

## 7. LES PRINCIPES TECHNIQUES

```
TOUJOURS — USAGE
DB&M intervient avant et après l'intervention.
L'usage en salle n'est pas interdit — il est non conçu.
Si le terrain en exprime le besoin, c'est un nouveau besoin à documenter, pas une violation.

TOUJOURS — PROPRIÉTÉ
Le contenu appartient à l'établissement, pas à la personne qui l'a saisi.
Quand un membre quitte l'équipe : son nom disparaît du contenu. Le contenu reste.

TOUJOURS — TRANSVERSE
Tout mécanisme fondamental fonctionne de la même façon dans tous les modules.
Signalement, validation, versioning : même règle partout.

TOUJOURS — INSTANCE
Un protocole racine, adapté par chirurgien si nécessaire.
Jamais un protocole différent par chirurgien.

TOUJOURS — SIGNALEMENT
Le signalement est le seul flux sans restriction.
De l'invité au créateur.

AUJOURD'HUI — LECTURE
DB&M est d'abord une app de consultation.
"Que trouve Sabine à 7h45 ?" précède "comment saisit-on ?"
Ce rapport peut évoluer avec les usages réels.

AUJOURD'HUI — VALIDATION
La gouvernance d'une donnée est décidée à sa création.
Ce principe peut être assoupli si le goulot humain devient bloquant.

AUJOURD'HUI — ADOPTION
DB&M convainc par l'expérience des autres autour de soi — pas par la formation.
D'autres mécanismes d'adoption peuvent compléter ce chemin.
```

---

## 8. RÈGLES POUR L'IA

```
ANTI-01 : Toute proposition technique = ELI15 + FAB(3R) avant livraison.
ANTI-02 : Schéma DB → vérifier information_schema. Jamais inventer une colonne.
ANTI-03 : Code CCAM → vérifier referentiel_ccam. Laisser vide plutôt que risquer une erreur.
ANTI-04 : Nouveau module → vérifier qu'il adresse au moins une situation de blocage terrain.
ANTI-05 : Fonctionnalité de saisie → se demander d'abord ce que Sabine verra en lecture.
ANTI-06 : Tout acteur → vérifier qu'il peut bénéficier de DB&M sans y toucher directement.
ANTI-07 : Décision L3 → vérifier qu'elle descend en L1 via un mécanisme explicite.
ANTI-08 : Contradiction avec un principe TOUJOURS → ELI15 + FAB(3R), pas refus.
          Contradiction avec un principe AUJOURD'HUI → signaler + proposer l'évolution.
```

### INTERDIT-WORDING-METHODES-01 (V1.0.6 — TOUJOURS)

**Les méthodes pédagogiques, les auteurs, les frameworks théoriques qui structurent DB&M en interne (L3) ne sont JAMAIS nommés en surface (L1/L2).**

Surface L1/L2 (tout ce que voit Sabine, Julie, Brigitte, Olivia) = **ce que la méthode rend possible**.
Coulisses L3 (tables `atelier_principes` catégorie `principe_nomme`, skill `pedagogie-bdb`, ce Canon) = **les méthodes nommées et attribuées**.

**Exemples** :

| Surface (interdit) | Surface (correct) |
|---|---|
| "Module Boudreault" | "Module pour développer ton savoir-agir" |
| "Section Knowles andragogique" | "Cours pour adultes en exercice" |
| "Approche SECI Nonaka & Takeuchi" | "Comment ce que sait Estelle devient consultable par Emma" |
| "Grille POULET Barrand" | "Ce qui te manque pour passer au niveau suivant" |
| "Fiche Kolb 4 phases" | "Vivre, observer, comprendre, refaire" |

**Pourquoi** : DB&M s'adresse à des IBODE en activité, pas à des étudiantes en sciences de l'éducation. Nommer Boudreault en surface fait fuir Sabine (jargon académique) et Carole (réfractaire). Nommer ce que Boudreault rend possible engage les deux.

**Application** :
- Pages mini-site : zéro nom d'auteur académique.
- Tooltips, onglets, titres de modules : zéro nom de méthode.
- Documentation utilisateur : zéro framework cité.
- Documentation technique L3 (Canon, atelier_principes, skills) : attribution complète obligatoire.

**Source** : `INTERDIT-WORDING-METHODES-01` (atelier_principes, catégorie `interdit`, marqueur TOUJOURS).

---

## 9. ORGANISATION DES FICHES — TOUJOURS

L'intervention chirurgicale est l'unité centrale de DB&M.
Toute fiche s'y rattache.

| Type de fiche | Ce qu'elle fait |
|---|---|
| Fiche d'intervention | Le pivot. Sens opératoire global. Dépendances déclarées. |
| Fiche de picking | Le matériel. Localisations, packs, alternatives. |
| Fiche d'instrumentation | Le déroulement. Temps opératoires, enchaînement, repères. |
| Fiche de révision | Le savoir. Anatomie, physiologie, mécanismes. |
| Fiche de préférences chirurgien | Les habitudes. Individuelles, non normatives, validées. |

**Ce qui apparaît / ce qui se trouve — TOUJOURS**

Une fiche montre ce dont on a besoin maintenant.
Elle indique où trouver le reste — sans tout mettre au même endroit.

**Le registre sémantique — TOUJOURS**

Une intervention a une appellation de référence.
Toutes les autres façons de la nommer sont des synonymes.
Un synonyme n'est jamais une fiche à part entière.

---

## 10. OÙ TROUVER LA VÉRITÉ

| Question | Source de vérité |
|---|---|
| Comment naviguer DB&M | Niveau 0 DB&M V0.5 (sas universel) |
| Ce que DB&M est | Manifeste DB&M V1.4 (source #1) |
| Principes opérationnels | Ce document (CANON V1.0.6) |
| Décisions validées | atelier_decisions — base de données cloud |
| Règles d'un module | CTX du module — projet Claude |
| Schéma de la base de données | information_schema — cloud Supabase en direct |
| Réalité terrain immuable | atelier_principes (catégories stb, axe, user_story) — base de données cloud |
| Principes actifs | atelier_principes — base de données cloud |

> Note V1.0.5 — La table `atelier_fondation` référencée dans les versions précédentes a été supprimée lors des migrations 147-150. Les données fondatrices (STB, axes, user stories) sont désormais consolidées dans `atelier_principes` avec des catégories dédiées (`stb`, `axe`, `user_story`).

**Hiérarchie en cas de conflit (V1.0.6)** :

```
0. NIVEAU 0 DB&M V0.5 — sas universel, préalable obligatoire à toute lecture
1. MANIFESTE DB&M V1.4 — source de vérité #1, prime sur tout document opérationnel
2. Principes TOUJOURS de ce document (CANON V1.0.6) — déclinaison opérationnelle
3. CTX_DOCTRINE_TERRAIN V1.2.0 — réalité opératoire
4. Décisions actées (atelier_decisions)
5. Règles du module (CTX_[MODULE])
6. Code déployé sur le terrain
```

> **Arbitrage Créateur 2026-05-01** (rappel V1.0.5) : le Manifeste est la source de vérité #1 (sous le Niveau 0 ajouté en cascade V1.0.6). Le Canon décline les règles opérationnelles sous le Manifeste. En cas de conflit entre les deux, le Manifeste l'emporte.

> **Note V1.0.6 — Niveau 0 au rang 0** : le Niveau 0 DB&M V0.5 ne contredit ni le Manifeste ni le Canon. Il **conditionne leur lecture**. Un QUI qui lit le Canon sans avoir traversé le Niveau 0 produit du contenu plat ou dangereux. Un QUOI (document, module, skill) qui contredit le Niveau 0 est en échec audit ARE indépendamment de son contenu.

---

## 11. CE QUE CE DOCUMENT ACCEPTE

DB&M fonctionne dans un environnement humain, sous pression, avec des acteurs différents.

Un cas terrain qui ne rentre dans aucune case signale un angle mort à documenter.
Ce n'est pas une erreur du système — c'est une information sur ce que DB&M ne sait pas encore.

Un principe AUJOURD'HUI qui freine le terrain mérite d'être questionné, pas contourné.
Le contournement silencieux — retour au papier, à l'oral, à WhatsApp —
est le signal que DB&M a perdu la confiance de quelqu'un.

La confiance se construit lentement et se perd vite.
Une seule information fausse visible par Sabine peut convaincre Carole
que le système n'est pas fiable.
Toute fonctionnalité visible par Sabine est testée contre ce risque.

Ce document protège ce qui est vrai.
Il ne ferme pas ce que DB&M n'a pas encore besoin de définir.

---

## 12. DOCUMENT COMPLÉMENTAIRE

**BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md** (à renommer DBM_CANON_ANNEXE lors d'une session de toilettage dédiée)

Explique en français courant, avec exemples de salle d'opération, tous les principes cités dans ce document :
ELI15, Comprendre/Apprendre/Agir (Boudreault/CRAIE), Andragogie (Knowles), Personal MBA (Kaufman), Deming, Eisenhower, DISC (Marston), SECI (Nonaka & Takeuchi), Communautés de pratique (Wenger).

À lire en premier si l'un de ces termes est inconnu.
À transmettre à Brigitte, Carole, ou tout nouvel acteur du projet.

> **Cohérence INTERDIT-WORDING-METHODES-01** : l'annexe est un document **L3** (interne fabrique). Elle ne se transmet à Brigitte/Carole que dans un contexte d'éducation explicite — pas comme onboarding produit.

---

## HISTORIQUE

```
2026-05-03 — V1.0.6
  Cascade fondateurs session #114 — P1b.
  Renommage : BDB → DB&M en surface (préfixes techniques bdb_* conservés).
  §1 : promesse formalisée comme PROMESSE-5-BONS (5 bons : info / personne / moment / endroit / niveau).
  §1 : référence GPS-01 (D-2026-04-26-GPS-01) — cercle vertueux mini-site ↔ app.
  §2 : chaîne du chaos confirmée 12+ intervenants (alignement Doctrine + Manifeste V1.4).
  §8 : ajout INTERDIT-WORDING-METHODES-01 (méthodes pédago jamais nommées L1/L2).
  §10 : Niveau 0 DB&M V0.5 ajouté au rang 0 (au-dessus du Manifeste).
  Source #1 : Manifeste DB&M V1.4.
  Maladies adressées : amnésie (5 bons enfin nommés) + certitude (méthodes en coulisses).
  Interdits Niveau 0 honorés : #1, #4, #6.
  Sources : INTERDIT-WORDING-METHODES-01 + D-2026-04-26-GPS-01 + Manifeste DBM V1.4
            + 000000_NIVEAU_0_DBM_V0_5_0.md.

2026-05-01 — V1.0.5 (addendum)
  Arbitrage §10 : Canon reconnaît le Manifeste comme source #1.
  Canon = déclinaison opérationnelle sous le Manifeste.
  Décision Créateur 2026-05-01.

2026-05-01 — V1.0.5
  Audit Niveau 0 — 1 correctif.
  §10 : remplacement référence morte `atelier_fondation` (table supprimée migration 147-150)
        par `atelier_principes` (catégories stb, axe, user_story).
  Maladies corrigées : certitude + amnésie.
  Interdits résolus : #3 (régression silencieuse), #4 (hallucination silencieuse).
  Motif : audit N0 gouvernance 2026-05-01.

2026-04-12 — V1.0.4
  §0 : typo "signal" → "signale" corrigée.
  §0 : "jamais de refus brutal" → formulation positive.
  §4.2 : attribution Boudreault/CRAIE ajoutée explicitement.
  §6 : "Comprendre, apprendre, agir" attribué Boudreault/CRAIE/UQAM.
  Annexe séparée : BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md.
```

---

FIN DU CANON V1.0.6
