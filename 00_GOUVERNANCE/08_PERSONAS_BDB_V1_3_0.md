# PERSONAS BDB — Cadrage de session
```
VERSION   : 1.3.0
DATE      : 2026-03-15
AUTEUR    : Manu + Claude
STATUT    : DOCUMENT DE CADRAGE — session de réécriture mini-site
RÔLE      : Référentiel personas lecteurs/utilisateurs BDB.
            Sert de base à la réécriture des 8 pages du mini-site
            ET aux attentes non négociables des CTX modules.
NOYAU_REF : NOYAU_VERITE_V2.1.0
DELTA v1.2.0 → v1.3.0 :
  Correction RÈGLE DE VOIX — précision "testé contre personas" :
    ajout définition opérationnelle (porte d'entrée < 3 secondes,
    sans vocabulaire bloquant, sans structure DC imposée à S/I/BEIGE).
  Correction section DETTE PROMESSES — ajout règle clôture session :
    lister en clôture les promesses nouvelles ou modifiées
    avec le CTX module cible impacté, consigner dans JOURNAL_DECISIONS.
  Ajout section CHARGEMENT EN SESSION : règle obligatoire de chargement
    de ce fichier pour toute session mini-site ou CTX module.
  Intégration arbitrages session audit DISC/Spirale/Biais 2026-03-15.
```

---

## AVERTISSEMENT DE LECTURE

Ces personas ne sont pas des individus réels.
Ce sont des **états vécus** — des moments dans la journée d'un professionnel
de bloc qui déclenchent un besoin que BDB peut ou ne peut pas satisfaire.

Un même individu peut traverser plusieurs personas dans la même journée.
Les outils DISC / Spirale / VAKOG sont **pour le rédacteur**, pas pour l'utilisateur.
L'utilisateur ne sait pas ce qu'est un vMème. Il sait ce qu'il ressent.

**Règle absolue** : chaque phrase du mini-site doit pouvoir être lue
par au moins un persona sans créer de rejet. Les phrases qui n'atteignent
personne sont à supprimer.

---

## CHARGEMENT EN SESSION

Ce fichier est **obligatoire** pour toute session portant sur :
- La réécriture d'une page du mini-site
- La création ou mise à jour d'un CTX module
- Tout contenu destiné aux utilisateurs de BDB (microtextes, libellés, messages)

Il doit être chargé **après** NOYAU_VERITE et JOURNAL_DECISIONS.

Une session qui produit du contenu utilisateur sans avoir chargé ce fichier
est invalide — le risque de biais DC non compensé est documenté dans NOYAU_VERITE BLOC 0.

---

## POPULATION SIMULÉE

Distribution DISC de l'audience cible :

| Profil | % | Ce qu'ils font avant d'adopter |
|---|---|---|
| S/C | 50% | Comprennent, vérifient, attendent la preuve |
| I | 35% | Ressentent, partagent, adoptent si ça résonne |
| D | 15% | Évaluent le ROI en 10 secondes, décident ou passent |

**Note** : Le D auditif orienté 1-to-1 est dans le hors-scope fonctionnel
(il n'utilisera pas l'app) mais peut être prescripteur ou frein.
Son bénéfice est indirect : ses collègues arrivent mieux préparés.

---

## PROGRESSION SPIRALE — ORDRE LOGIQUE

La progression dans le mini-site suit l'ordre naturel de la Spirale :

```
BEIGE → VIOLET → BLEU → ORANGE → VERT
```

Ce n'est pas un ordre de lecture imposé.
C'est l'ordre dans lequel les besoins humains s'empilent.
Un lecteur qui entre par VIOLET a déjà satisfait BEIGE.
Un lecteur qui entre par ORANGE a intégré VIOLET et BLEU.
La page d'accueil doit parler à BEIGE et VIOLET simultanément
pour ne perdre personne dès l'entrée.

---

## LES 9 PERSONAS

### Vue d'ensemble

| # | État | Spirale | DISC | Posture vis-à-vis de BDB |
|---|---|---|---|---|
| P0 | "Ça ne me concerne pas" | BLEU stable | S | Absent — pas de signal |
| P1 | "Je ne sais pas" | BEIGE→VIOLET | S | Cherche sans savoir quoi |
| P2 | "Je n'ose pas" | VIOLET→BLEU | S/C | Sait mais ne demande plus |
| P3 | "Je ne peux pas" | BLEU→ORANGE | C/S | Veut mais a abandonné |
| P4 | "Je n'ai pas le droit" | BLEU | C | S'autocensure |
| P5 | "Ça ne servira à rien" | ORANGE | D/C | Sceptique actif |
| P6 | "C'est pour qui ça ?" | BLEU/ORANGE | D/C | Décideur distant |
| P7 | "Je veux que ça marche" | VERT+ORANGE | I/S | Adopteur précoce |
| P8 | "Le savoir ne se documente pas" | ROUGE/VIOLET | D/S | Frein actif — terrain |

---

### PERSONA 0 — "Ça ne me concerne pas"

**Nom terrain** : Le Professionnel sans besoin identifié

**État vécu** :
Fait son travail, rentre chez lui. Aucune friction ressentie, aucune
question sans réponse identifiée. Pas de résistance active —
simplement absence totale de signal. Le système existant fonctionne
pour lui, ou il a appris à ne plus attendre mieux.

**Spirale** : BLEU stable — le présent est ordonné, prévisible, suffisant

**DISC** : S — confort dans la routine, aucun déclencheur externe

**VAKOG** : Non identifiable — pas en mode de recherche

**Peur** : Aucune peur visible. C'est précisément le problème.
Il ne souffre pas — donc BDB ne peut pas lui répondre à une douleur.

**Ce que BDB lui dit** : Rien directement. Il ne cherche pas.

**Sa valeur pour le projet** :
C'est le persona le plus nombreux et le plus invisible.
Les métriques réelles de succès de BDB = P0 convertis en P1, P2 ou P7.
Une métrique qui ne mesure que les utilisateurs actifs ignore P0
et sur-estime l'adoption réelle.
Documenter son existence évite d'optimiser pour des adopteurs
qui adopteraient de toute façon.

**Risque de sur-représentation dans les retours** :
Quand Manu teste le site auprès de ses collègues, ceux qui réagissent
positivement sont déjà dans les 20% actifs. P0 ne réagit pas —
il ne dira pas non plus pourquoi la présentation ne lui a pas été faite.
Les tests terrain doivent documenter aussi les non-réactions.
Voir NOYAU_VERITE BLOC 11 — Règles de validation terrain.

**Module BDB naturellement lié** : aucun par défaut.
Peut être atteint indirectement via P7 (l'adopteur crée l'occasion)
ou via P6 (le cadre crée le contexte institutionnel).

---

### PERSONA 1 — "Je ne sais pas"

**Nom terrain** : Le Nouveau J+1

**Contexte de grâce** :
Tout le monde lui pardonne. Il vient d'arriver.
Il ne connaît pas le jargon, pas le vocabulaire interne, pas la géographie
des locaux, pas les habitudes implicites de l'équipe, pas les noms,
pas les préférences des chirurgiens, pas où sont rangées les choses.
Il n'est pas censé savoir — et tout le monde le sait.
Ce contexte de grâce est temporaire. Il dure environ 3 à 4 mois.

**État vécu** :
Premier jour seul en salle. Pas de référent disponible.
L'information existe quelque part — dans la tête de quelqu'un,
dans un classeur, dans une habitude non écrite.
Il ne sait pas quoi chercher, ni où, ni si c'est normal de ne pas savoir.

**Spirale** : BEIGE (survie immédiate) → VIOLET (appartenance :
"est-ce que je fais partie de cette équipe ?")

**DISC** : S dominant — besoin de sécurité, de ne pas se tromper,
de ne pas être jugé

**VAKOG** : Kinesthésique dominant — ressent le malaise physiquement
avant de le formuler

**Peur** : Faire une erreur. Être jugé incompétent. Ne jamais trouver sa place.

**Ce que BDB lui dit** :
> "L'information est là. Tu n'as pas à demander pour trouver."

**Ce qu'il ne faut pas lui dire** :
- Des références théoriques (Rogers, TAM...)
- Des fonctionnalités avancées
- Quoi que ce soit sur "contribuer" — c'est beaucoup trop tôt

**Règle de voix spécifique** : voir section RÈGLE DE VOIX BDB — palier P1/P2.
Tout terme technique ou acronyme non défini dans le même écran est interdit.

**Module BDB naturellement lié** : thesaurus, fiches, recherche

---

### PERSONA 2 — "Je n'ose pas"

**Nom terrain** : L'IDE en apprentissage invisible

**Fin du contexte de grâce** :
Après 3 à 4 mois, le regard change.
Les mêmes questions que P1 posait avec indulgence deviennent
des marqueurs de compétence — ou d'incompétence.
Les collègues ne le disent pas toujours, mais ils le pensent.
Et P2 le sait. Il l'a capté avant qu'on le lui dise.
P2 n'a plus le droit à l'erreur de P1. Il entre dans la zone
des reproches silencieux, de la mauvaise ambiance diffuse,
du "il devrait savoir ça depuis le temps".

**État vécu** :
6 mois de poste. Il sait qu'il ne sait pas, mais il a appris que demander
coûte — un soupir, une impatience, un regard. Il gère seul, mal,
plutôt que d'exposer ses lacunes une fois de plus.
La dette sociale s'accumule dans les deux sens :
il n'ose plus, et l'équipe commence à s'impatienter sans le formuler.

**Spirale** : VIOLET (peur exclusion du groupe) → BLEU
(respecter les règles implicites du bloc)

**DISC** : S/C — évite le conflit, cherche la règle juste,
ne prend pas de risque inutile

**VAKOG** : Auditif — capte les intonations, les silences, les soupirs
mieux que personne. Un mot dit sur un mauvais ton reste des semaines.

**Peur** : Être vu comme incompétent. Déranger. Créer une dette relationnelle.

**Ce que BDB lui dit** :
> "Chercher dans l'app, ce n'est pas avouer qu'on ne sait pas.
> C'est ce que font les bons professionnels."

**Ce qu'il ne faut pas lui dire** :
- "Contribuez !" (trop tôt, trop exposant)
- Métriques nominatives, classements
- Quoi que ce soit sur la direction ou les chirurgiens

**Règle de voix spécifique** : voir section RÈGLE DE VOIX BDB — palier P1/P2.

**Module BDB naturellement lié** : transmissions, fiches, anonymat partiel

---

### PERSONA 3 — "Je ne peux pas"

**Nom terrain** : L'Ancien épuisé

**État vécu** :
15 ans de bloc. Il sait tout — ou presque. Il répond aux mêmes questions
depuis des années. Il a essayé de transmettre : les classeurs existent,
personne ne les ouvre. Il a arrêté d'essayer. Pas par mauvaise volonté.
Par lassitude.

**Spirale** : BLEU (a respecté les règles, attend que les autres fassent pareil)
→ ORANGE frustré (ses efforts ne produisent pas de résultats mesurables)

**DISC** : C/S — méticuleux, fiable, mais épuisé par l'absence de système

**VAKOG** : Visuel — a besoin de voir que ça fonctionne,
pas qu'on lui promette

**Peur** : Que son savoir parte avec lui sans laisser de trace.
Que personne ne reconnaisse ce qu'il a construit.

**Ce que BDB lui dit** :
> "Tu contribues une fois. L'app répond à ta place après."
> "Ton savoir reste après ton départ."

**Ce qu'il ne faut pas lui dire** :
- "Rejoignez la communauté !" (trop I-Jaune)
- Des processus complexes de validation
- Quoi que ce soit qui évoque P8 (risque de contamination narrative)

**Module BDB naturellement lié** :
transmissions, fiches validées, badges légitimité, versioning

---

### PERSONA 4 — "Je n'ai pas le droit"

**Nom terrain** : Le Professionnel sous contrainte institutionnelle

**État vécu** :
Il voudrait bien partager, documenter, améliorer. Mais il a intégré —
par expérience ou par ouï-dire — que "mettre par écrit" dans un hôpital
ou une clinique, c'est risqué. Responsabilité juridique, hiérarchie,
"pas dans les protocoles officiels". Il s'autocensure avant même d'essayer.

**Spirale** : BLEU dominant — l'autorité et les règles définissent
ce qui est permis

**DISC** : C dominant — besoin de savoir exactement ce qui est autorisé
avant d'agir

**VAKOG** : Auditif/Visuel — a besoin d'un cadre écrit explicite
pour se sentir couvert

**Peur** : Enfreindre une règle sans le savoir. Être tenu responsable.

**Ce que BDB lui dit** :
> "BDB ne contient pas de données patient.
> Pas de protocole médical opposable.
> Ce que tu partages, c'est du savoir opérationnel —
> pas de la responsabilité juridique."

**Ce qu'il ne faut pas lui dire** :
- Quoi que ce soit d'ambigu sur le "statut" des informations
- "Tout le monde peut lire" sans préciser les garde-fous
- Des promesses non documentées

**Module BDB naturellement lié** :
pas-app, triple légitimité, flag "Contester", historique

---

### PERSONA 5 — "Ça ne servira à rien"

**Nom terrain** : Le Sceptique pragmatique

**État vécu** :
Il a vu passer les outils "qui allaient tout changer". Le logiciel
de gestion qui n'est jamais mis à jour. La base de données abandonnée
après 3 mois. Le projet porté par un enthousiaste qui est parti
6 mois plus tard. Il n'est pas malveillant. Il a juste été déçu trop souvent.

**Spirale** : ORANGE — "prouve-moi que ça marche, je veux des chiffres,
pas des promesses"

**DISC** : D/C — exige des résultats mesurables et des données solides

**VAKOG** : Visuel — a besoin de voir fonctionner, pas d'entendre promettre

**Peur** : Investir du temps dans quelque chose qui sera abandonné.
Être le seul à jouer le jeu pendant que les autres regardent.

**Ce que BDB lui dit** :
> "Pas d'investissement lourd à justifier.
> Si ça ne marche pas, on arrête."
> "Le code source est simple. Si le mainteneur part,
> quelqu'un peut reprendre."

**Ce qu'il ne faut pas lui dire** :
- Des visions à long terme sans preuves immédiates
- Des références à d'autres projets similaires "qui ont marché ailleurs"
- De l'enthousiasme non fondé

**Module BDB naturellement lié** :
adoption (Rogers, métriques), FAQ objections, risques/garde-fous

---

### PERSONA 6 — "C'est pour qui ça ?"

**Nom terrain** : Le Cadre ou la Direction qui valide (ou bloque)

**État vécu** :
Il ne sera pas utilisateur quotidien. Mais il peut ouvrir la porte
ou la fermer. Il pense en termes de risque institutionnel, de cohérence
avec la politique qualité, et de ROI RH.
Il a 3 minutes pour se faire une opinion sur ce que c'est.

**Spirale** : BLEU/ORANGE — ordre institutionnel + résultats mesurables

**DISC** : D/C — décision rapide sur base de faits, pas d'émotions

**VAKOG** : Visuel — a besoin d'un document synthétique, pas d'une histoire

**Peur** : Valider quelque chose qui crée un risque juridique ou managérial.
Ou passer à côté d'un levier de performance RH.

**Ce que BDB lui dit** :
> "Zéro donnée patient. Zéro coût IT. Initiative terrain.
> Réduction mesurable du temps d'intégration."

**Ce qu'il ne faut pas lui dire** :
- Des histoires individuelles (il veut des chiffres et des cadres)
- Trop de profondeur sur les biais ou la psychologie
- Quoi que ce soit sur "l'équipe décide"

**Module BDB naturellement lié** :
audiences/direction, fonctionnalités/légitimité institutionnelle,
adoption/métriques

---

### PERSONA 7 — "Je veux que ça marche"

**Nom terrain** : L'Adopteur précoce volontaire

**État vécu** :
Il a compris le problème depuis longtemps. Il cherchait un outil,
pas une autre réunion. Il est prêt à contribuer, à convaincre ses collègues,
à investir du temps personnel s'il croit au projet.
C'est le persona le plus rare — et le plus précieux.

**Spirale** : VERT dominant (partage, collectif) avec ORANGE intégré
(résultats, efficacité)

**DISC** : I/S — relationnel, enthousiaste, fiable dans la durée

**VAKOG** : Kinesthésique/Visuel — a besoin de ressentir la cohérence
du projet avant de l'embarquer

**Peur** : Que le projet soit abandonné après son engagement.
Être seul à porter quelque chose que les autres n'ont pas adopté.

**Ce que BDB lui dit** :
> "Tu n'as pas à convaincre les sceptiques. Tu contribues.
> L'effet réseau fait le reste."

**Ce qu'il ne faut pas lui dire** :
- Que le succès dépend de lui
- Des métriques de contribution individuelles
- Des messages qui sur-responsabilisent

**Module BDB naturellement lié** :
adoption/noyau pédagogues, transmissions, parcours formation

---

### PERSONA 8 — "Le savoir ne se documente pas"

**Nom terrain** : L'Ancien de territoire

**Confirmation terrain** : Ce persona est confirmé par Manu depuis
l'observation directe. Il ne s'agit pas d'une hypothèse — il existe,
il est identifiable, il a un poids social réel dans l'équipe.

**État vécu** :
20 ans de bloc. Le savoir oral est sa valeur — pas une limite,
une identité. Écrire ce qu'il sait, c'est le trahir. Ou pire :
le rendre accessible à quelqu'un qui ne l'a pas mérité,
qui n'a pas "payé le prix" de l'expérience.

Il considère que documenter et former crée une génération
d'assistés incompétents. Que si c'est trop facile d'accès,
les nouveaux ne développeront pas le savoir-faire réel,
celui qui vient de l'erreur, de la répétition, du compagnonnage.

Il peut ne rien dire explicitement — mais son regard, ses silences,
ses commentaires à voix basse auprès des P1 et P2 ("t'as qu'à chercher
dans ton appli...") suffisent à décourager les indécis.

**Spirale** : ROUGE/VIOLET — légitimité par l'expérience vécue,
pas par la connaissance transmise. L'appartenance à la tribu se mérite.

**DISC** : D/S — autorité de terrain naturelle, résistance passive
ou active selon le contexte

**VAKOG** : Kinesthésique — le savoir se vit, pas se lit

**Peur** : Être rendu remplaçable. Que son savoir soit "volé" par un outil
que n'importe qui peut consulter sans avoir rien vécu.
Que la prochaine génération soit moins compétente — et que ce soit
en partie sa faute pour avoir facilité l'accès.

**Ce que BDB peut lui dire** (avec précaution) :
> "Ton nom est sur ce que tu as écrit."
> "Personne ne peut écrire ce que tu sais à ta place."

Sa porte d'entrée n'est pas l'utilité — c'est la **reconnaissance
de son irremplaçabilité**. BDB ne remplace pas son savoir.
Il en fait un monument signé.

**Ce qu'il ne faut jamais lui dire** :
- Que BDB facilite l'accès au savoir pour tous (c'est exactement sa peur)
- Que les nouveaux seront "aussi efficaces" grâce à l'app
- Quoi que ce soit sur l'autonomie des P1/P2

**Stratégie de neutralisation** :
P8 ne se convainc pas — il se contourne.

1. **Ne pas l'affronter** : Un débat sur la valeur de la documentation
   renforce sa position. Il a 20 ans d'arguments.

2. **Isoler son influence sur P1/P2** : Les P1/P2 qui croisent P8
   en début de parcours sont à risque. La meilleure protection
   est que BDB soit déjà dans leur main avant qu'ils rencontrent
   le discours de P8.

3. **Activer P7 en tampon** : Un P7 visible et respecté dans l'équipe
   réduit le poids social de P8. P7 n'attaque pas P8 — il incarne
   une alternative.

4. **Ne pas le compter dans les métriques d'adoption** :
   S'il n'adopte pas, ce n'est pas un échec. C'est documenté.
   Le hors-scope de pas-app.html existe en partie pour lui.

**Règle de test terrain spécifique** :
P8 ne doit pas être invité aux présentations initiales de BDB.
Son influence sur P1/P2 présents peut contaminer les non-adopteurs
potentiels avant que BDB soit dans leur main.
Voir NOYAU_VERITE BLOC 11.

**Module BDB naturellement lié** : aucun par l'usage.
Par la reconnaissance : badges légitimité, attribution auteur,
versioning avec nom visible.

---

## MAPPING PERSONAS × PAGES DU MINI-SITE

| Page | Persona primaire | Persona secondaire | Ce qui doit changer |
|---|---|---|---|
| index.html | P1 + P2 | P7 | Ouvrir sur BEIGE/VIOLET — reconnaissance avant promesse |
| vision.html | P3 | P2 | Réduire densité C-Bleu académique, humaniser sans vider |
| pas-app.html | P4 | P5 + P8 (neutralisation) | BLEU rassurant, nommer les hors-scope sans les inviter |
| audiences.html | P1→P7 par tab | P6 prioritaire sur Direction | Structure tabs = montage intelligent validé |
| fonctionnalites.html | P5 | P3 | Orange avant structure, preuves concrètes en tête |
| risques.html | P6 | P5 | Supprimer références académiques en prose |
| adoption.html | P7 | P5 | Vert renforcé, % Rogers en second plan |
| faq.html | P2 + P4 + P5 | P1 | Soupçon Beige sur réponses pratiques |

**Note sur audiences.html** : La structure par tabs est le montage
intelligent qui permet à chaque persona de trouver sa porte sans
que les autres soient perturbés. Le principe vaut pour toute page
où plusieurs personas coexistent légitimement.

---

## RÈGLE DE VOIX BDB

*Applicable à toutes les pages du mini-site ET aux microtextes
d'interface (messages d'état, libellés, boutons, messages vides).*

### Public et voix cible

| Dimension | Valeur |
|---|---|
| Public dominant | S/C 50% + I 35% |
| Voix cible | BLEU rassurant + VIOLET ancrage collectif |
| Registre | Tu (sauf tab Direction → vous) |

### Ce que "testé contre les personas" signifie

Avant toute livraison de contenu (page ou microtexte) :

1. Identifier le persona primaire de la page ou de l'écran
2. Vérifier que la **porte d'entrée s'ouvre en moins de 3 secondes**
   pour ce persona — titre, accroche ou premier élément visible
3. Vérifier l'**absence de vocabulaire bloquant** pour ce persona
   (voir lexique interdit ci-dessous)
4. Vérifier que la **structure d'information n'est pas DC imposée
   à un public S/I/BEIGE** — une liste de fonctionnalités exhaustive
   en tête d'une page P1 est un exemple de violation silencieuse

Ce test est rapide — 60 secondes par page. Il n'est pas optionnel.

### Lexique interdit (global)

- Jargon médical non défini dans un glossaire accessible dans la même session
- Acronymes non développés dans le même écran au premier usage
- Termes DC en contexte S/I/BEIGE : "optimal", "efficient", "ROI",
  "mesurable", "KPI", "scalable", "itérer"
- Références théoriques non demandées : "Rogers", "TAM", "vMème",
  "Wenger", "Karpman" — dans les pages utilisateurs uniquement
  (autorisé dans la documentation de gouvernance)

### Longueur de phrases par palier

| Palier | Longueur max | Contexte |
|---|---|---|
| P1 / P2 | ≤ 12 mots | Pages d'entrée, microtextes interface, messages d'état |
| P3 / P4 | ≤ 20 mots | Pages intermédiaires, explications fonctionnelles |
| P5 / P6 | ≤ 25 mots | Pages stratégiques, argumentaires |
| P7 | Sans contrainte stricte | Contenu riche, détaillé — P7 lit tout |

### Règle termes techniques P1/P2

Tout terme technique ou acronyme utilisé dans une page ou
un écran destiné à P1/P2 doit respecter l'une de ces deux conditions :

1. Il est défini dans le même écran, au premier usage, en ≤ 5 mots.
2. Il est absent — remplacé par sa définition fonctionnelle.

**Exemples :**
- "INSTRU" → interdit en P1/P2 sans définition. Dire "l'infirmier au champ"
- "Supabase" → interdit en P1/P2. Dire "la base de données de l'app"
- "localStorage" → interdit partout dans l'interface visible
- "triple légitimité" → autorisé si suivi de "(validé Direction,
  Expert, Utilisé)" dans le même écran

### Règle tu/vous

- **"tu"** : toutes les pages et tous les microtextes, par défaut
- **"vous"** : tab Direction dans audiences.html uniquement
- Jamais les deux dans le même écran pour le même lecteur

---

## DETTE PROMESSES MINI-SITE — APPROCHE PENDING

*Statut : architecture identifiée, implémentation non décidée.*

**Problème** : Chaque promesse faite dans le mini-site
(fonctionnalité, garantie, expérience utilisateur)
crée une attente dans les CTX des modules correspondants.
La gestion manuelle CTX par CTX est ingérable à l'échelle.

**Direction à explorer** : Table de référence centrale des promesses,
consultable par module. Chaque entrée = une promesse du mini-site
+ le(s) module(s) concerné(s) + le persona auquel elle s'adresse
+ son statut (existant / prévu / conditionnel).

Avantage : un CTX module consulte la table, pas le mini-site entier.
Format probable : table Supabase ou fichier MD structuré consultable.

**Ce qui est acté en attendant** :
Promesse mini-site déclarée = objectif à atteindre.
Un CTX module ne peut pas promettre moins que le mini-site.
Toute promesse mini-site non couverte par un CTX = dette documentée.

**Règle de clôture pour toute session de réécriture mini-site** :
À chaque session de réécriture d'une page, lister en clôture :
- Les promesses nouvelles ou modifiées dans la page
- Le CTX module cible impacté pour chaque promesse
- Consigner dans JOURNAL_DECISIONS avant fermeture de session

Une promesse non consignée = dette silencieuse non traçable.

**Arbitrage requis** : Manu — session dédiée à planifier Phase 3+.

---

## RÈGLE DE MONTAGE INTELLIGENT

> Le montage intelligent prime sur la règle qui fige.
>
> Une page peut avoir une entrée unique (quand le persona est clair)
> ou plusieurs entrées (tabs, sections, niveaux progressifs)
> quand la diversité des lecteurs le justifie.
>
> Le critère n'est pas la forme — c'est que chaque lecteur
> trouve sa porte sans voir le plan de l'immeuble.

---

## CE QUE CE DOCUMENT NE COUVRE PAS

- Le contenu mot à mot des pages → session dédiée de réécriture
- La hiérarchie visuelle → redesign CSS déjà livré en v3.0.0
- Les modules applicatifs → leurs CTX intégreront ces personas
  comme attentes non négociables
- La table de référence des promesses → PENDING (voir section dédiée)
- Le pitch complet de BDB → dette ouverte depuis SC-02

---

## SESSIONS CAPITALES — 2026-03-14

*(Décisions et recadrages majeurs conservés depuis v1.1.0.
Voir v1.1.0 pour le texte intégral de SC-01 à SC-10.)*

Synthèse des 10 sessions capitales :

| # | Titre court | Statut |
|---|---|---|
| SC-01 | Mini-site massivement C-Bleu — problème | Correction planifiée |
| SC-02 | "Bénéfice patient" = filtre IA, pas pitch humain | Pitch à co-construire |
| SC-03 | Outils DISC/Spirale pour le rédacteur, pas l'utilisateur | Intégré |
| SC-04 | Pas deux directions — un cylindre | Intégré |
| SC-05 | Centre commun ne s'impose pas — il émerge | Intégré |
| SC-06 | BDB ne demande pas de changer — s'adresse aux états vécus | Intégré |
| SC-07 | Hors-scope assumés — pyramide du changement = navigation | Intégré |
| SC-08 | Documentation = promesse = attente non négociable CTX | Intégré |
| SC-09 | Montage intelligent prime sur règle qui fige | Intégré |
| SC-10 | Never event = fracture humaine, pas indicateur qualité | Intégré |

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-14 | 1.0.0 | Création. 7 personas, mapping pages, règle d'or. |
| 2026-03-14 | 1.1.0 | Distinction P1/P2 affinée. Montage intelligent. SC-01→10. |
| 2026-03-14 | 1.2.0 | Ajout P0 et P8. Règle de voix BDB. Dette promesses PENDING. Intégration arbitrages Manu. |
| 2026-03-15 | 1.3.0 | Ajout section CHARGEMENT EN SESSION. Précision opérationnelle "testé contre personas" (60s, 3 critères). Règle clôture session réécriture dans DETTE PROMESSES. Référence croisée NOYAU BLOC 11 sur P0 et P8. |
