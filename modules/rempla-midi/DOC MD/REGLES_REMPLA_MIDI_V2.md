# REMPLA MIDI — Document de référence
## Module de rotation des pauses repas — Bloc ortho-neuro

---

## 1. CONTEXTE

Un bloc opératoire fonctionne avec 4 salles (S05 à S08). Chaque salle nécessite 2 agents en permanence : un instrumentiste (stérile au champ) et un circulant (non stérile, logistique). À midi, ces agents doivent manger. Mais les interventions ne s'arrêtent pas. Le cadre de bloc organise chaque jour une rotation — le "petit train" — pour que tout le monde mange sans qu'aucun poste ne reste vacant.

Ce module automatise le calcul de cette rotation et fournit une timeline visuelle que le cadre ajuste par glisser-déposer.

---

## 2. PÉRIMÈTRE

| Paramètre | Valeur |
|---|---|
| Secteur | Ortho-neuro exclusivement |
| Salles | 05, 06, 07, 08 |
| Postes par salle | Instrumentiste + Circulant |
| Poste exceptionnel | Doublure (aide opératoire, formation ou renfort) |
| Personnel | IBODE / IDE de bloc |
| Créneau | Pause repas midi uniquement |
| Durée pause | 30 minutes, non fracturable, non cumulable |
| Fenêtre nominale | 12:00 → 13:00 (2 créneaux de 30 min) |
| Fenêtre dégradée max | 11:30 → 13:30 (4 créneaux de 30 min) |

---

## 3. VOCABULAIRE

### Postes

| Terme | Définition |
|---|---|
| Instrumentiste (instru) | Agent stérile au champ opératoire. Passe les instruments au chirurgien. Poste critique. Son remplacement en crise nécessite l'accord du chirurgien |
| Circulant (circu) | Agent non stérile en salle. Approvisionnement, traçabilité, communication. Poste critique |
| Panseur | Synonyme historique de circulant dans certains blocs |
| Doublure | 3e agent appelé en salle pour une intervention complexe. Pas de poste à couvrir. N'a pas besoin d'être remplacé. Mobilisable comme remplaçant en cas de tension |

### Lieux

| Terme | Définition |
|---|---|
| Salle | Salle d'opération identifiée (05, 06, 07, 08) |
| Couloir | Poste réel hors-salle avec mission de service et fiche de tâche. Existe avant et après la pause repas. Ce n'est pas une zone de décharge |
| Banc de touche | Fonction du module uniquement. Zone tampon pour les pions non affectés dans la timeline. N'existe pas sur le terrain |

### Personnes

| Terme | Définition |
|---|---|
| Cadre de bloc | Responsable de l'organisation quotidienne. Utilisateur principal du module |
| Chirurgien | Médecin opérateur. Ses préférences impactent les affectations en crise |
| IBODE | Infirmier(ère) de Bloc Opératoire Diplômé(e) d'État |
| IDE | Infirmier(ère) Diplômé(e) d'État, exerçant au bloc |

### Concepts

| Terme | Définition |
|---|---|
| Petit train | Rotation en cascade des agents pour la pause repas. Le remplaçant initial entre dans une salle et y reste. Le titulaire revenu de pause ne retourne pas à sa salle d'origine mais cascade vers la salle suivante |
| Cascade | Chaîne de remplacements successifs. Chaque salle ne voit qu'un seul changement de personnel par poste |
| Mouvement | Unité élémentaire du plan : 1 agent part manger, 1 remplaçant prend son poste, pendant 30 min |
| Pattern | Plan de rotation mémorisé et associé à une signature d'effectif. Réutilisable |
| Signature | Empreinte d'un effectif : nb couloirs, nb soir, nb matin, nb journée, nb 12h, nb salles occupées |
| Pause de salle | L'intervention s'arrête pour permettre les repas. Dernier recours absolu |

---

## 4. CATÉGORIES D'AGENTS

| Catégorie | Horaire | Mange dans le créneau ? | Rôle dans la rotation |
|---|---|---|---|
| Journée (J) | ~7h → 16h30 | Oui | Part manger. Revenu = remplaçant potentiel pour la cascade |
| 12h | ~7h → 19h | Oui | Identique à Journée pour le moteur |
| Matin (13h) | ~7h → 13h | Non (mange après, temps perso) | Ne mange pas. Libère son poste à 13h. Son poste DOIT être couvert. Contrainte dure : ne peut pas être placé au-delà de 13:00 |
| Soir | 12h → 19h30 | Non (a déjà mangé) | Remplaçant initial. Entre en salle à 12h et y reste |
| Couloir | Variable | Oui (par convention au 1er tour, 12:00, ou 11:30 si anticipation) | Variable d'ajustement principale. Mange d'abord, disponible comme remplaçant après. Peut aussi être affecté en salle directement si le cadre le décide |

### Le couloir en détail

Le couloir est le premier indicateur de confort ou de tension :
- 3 couloirs → très simple, quasi pas de chaîne
- 2 couloirs → confortable
- 1 couloir → standard
- 0 couloir → tendu à critique

Un agent couloir le matin peut être affecté en salle après sa pause (ex : remplacer un 13h qui part). Le couloir n'est pas prioritaire sur la salle — c'est un rôle, pas une contrainte d'affectation.

### La doublure en détail

Agent en salle comme aide opératoire (formation ou renfort sur intervention lourde). Pas de poste à couvrir. Si matin/13h : ne mange pas. Si journée/12h : mange librement sans remplacement. Mobilisable comme remplaçant en cas de tension (dégradé/crise) — perte d'aide opératoire signalée.

---

## 5. COMPÉTENCES — asymétrie fondamentale

Un instrumentiste sait circuler. Un circulant ne sait pas instrumenter.

| Compétence agent | Peut aller sur case instru | Peut aller sur case circu |
|---|---|---|
| instru: quotidien | Oui (routine) | Oui (un instru sait circuler) |
| instru: crise | Oui (dépannage, accord chirurgien requis) | Oui |
| instru: interdit | Non, jamais | Oui |

Niveaux :
- **Quotidien** : pleinement compétent, affectation normale
- **Crise** : dépannage si aucune alternative quotidien. Signalé, tracé. Accord chirurgien obligatoire pour le poste instru
- **Interdit** : jamais, même en crise. Le moteur ne propose jamais cette affectation

### Modèle crise — le chirurgien entre en jeu

En crise, la contrainte devient Poste × Chirurgien : quel chirurgien accepte cet agent en instru de manière exceptionnelle.

Un chirurgien peut aussi accepter ou refuser la pause de salle. C'est une donnée de configuration.

---

## 6. ÉTATS DE FONCTIONNEMENT

| État | Couleur UI | Fenêtre | Description |
|---|---|---|---|
| Confortable | Vert | 12:00 → 13:00 | Tous mangent dans la fenêtre nominale. ≥2 remplaçants initiaux. Sous-état de Quotidien |
| Quotidien | Bleu | 12:00 → 13:00 | Tous mangent dans la fenêtre nominale. Pool juste |
| Dégradé léger | Jaune | 12:00 → 13:30 | Extension fin seule nécessaire |
| Dégradé complet | Orange | 11:30 → 13:30 | Extension des deux côtés nécessaire |
| Crise | Rouge | Hors fenêtre | Affectations crise nécessaires. Agents sans pause au self possible |
| Bloqué | Gris | — | Pause de salle inévitable. Aucune solution avec l'effectif présent |

La dégradation est progressive : nominale d'abord, puis extension fin, puis extension complète.

---

## 7. CONTRAINTES DURES

| # | Règle |
|---|---|
| C1 | Aucun poste vacant pendant qu'une salle est occupée |
| C2 | Remplaçant niveau quotidien en nominal, niveau crise + accord chirurgien sinon |
| C3 | Tout agent J/12h/couloir doit avoir 30 min de pause au self |
| C4 | Agent 13h : libéré à 13h, poste couvert. Ne peut pas être placé au-delà de 13:00 |
| C5 | Chaque agent concerné mange exactement 1 fois |
| C6 | Doublure → son poste d'origine est vacant → couverture cascade |
| C7 | Toute affectation crise est tracée, justifiée, statistiquée |
| C8 | Toute pause de salle est tracée avec contexte complet |
| C9 | 0 couloir + 0 soir = pause de salle de facto → signalé immédiatement |

---

## 8. MOTEUR — 4 fonctions

### 8.1 Diagnostiquer

Dès la saisie de l'effectif, AVANT tout calcul de plan. Le moteur qualifie la situation.

Comptages :
- Postes à couvrir = salles occupées × 2
- Agents à nourrir = J + 12h + couloirs (selon catégorie horaire)
- Remplaçants disponibles à 12h = soir + couloirs (les couloirs mangent d'abord mais sont comptés en capacité car ils reviennent)
- Capacité plancher = remplaçants × créneaux
- Capacité réelle > plancher car les agents revenus de pause deviennent remplaçants

Qualification : voir §6 pour les seuils.

### 8.2 Calculer (mode auto)

Le moteur propose un plan de rotation. C'est un ordonnanceur glouton.

**Ordre des opérations :**

1. **Les couloirs mangent** au 1er tour (12:00, ou 11:30 si anticipation en mode tendu). Mouvement de type "libre" (pas de remplacement, pas de salle)
2. **Les soir entrent en salle** (1ère salle de la cascade). Ils y restent définitivement
3. **Couloirs revenus** (12:30) rejoignent le pool de remplaçants
4. **Cascade** : titulaires revenus du créneau précédent cascadent vers la salle suivante. Le moteur ne passe à la salle suivante que quand TOUS les postes de la salle courante sont couverts
5. **Agents 13h partent** à 13:00. Leur poste est couvert par un agent disponible (couloir revenu, titulaire cascadé)
6. **Relève** : après la cascade, les derniers titulaires revenus relèvent les remplaçants initiaux installés en salle pour qu'ils puissent manger (si applicable)

**Ordre de cascade** : par défaut S05 → S06 → S07 → S08. Le cadre ajuste toujours manuellement par drag&drop. Le moteur propose, le cadre décide. Critères humains non codables : prothèses en cours, interventions lourdes, chirurgien sensible.

**Préférences** : créneaux tôt/tard pris en compte si possible sans violer C1-C9. Non satisfaite = signalée, pas bloquante. Les 12h préfèrent manger au 2e service (après-midi longue).

### 8.3 Valider (mode manuel)

Le cadre saisit son plan. Le moteur vérifie C1-C9 et qualifie l'état résultant. Liste les violations, avertissements, affectations crise.

### 8.4 Apprendre (patterns)

Plan validé et exécuté → sauvegardé avec sa signature d'effectif. Configuration similaire → proposition automatique. Scoring : nb utilisations, taux quotidien vs dégradé vs crise. Pattern non utilisé depuis 6 mois → archivé.

---

## 9. CASCADE — invariants

| # | Invariant |
|---|---|
| I1 | Le remplaçant initial (soir) ne quitte jamais sa salle d'affectation |
| I2 | Le titulaire revenu de pause ne retourne pas à sa salle d'origine — il cascade vers la suivante |
| I3 | Chaque salle ne voit qu'un seul changement de personnel par poste |
| I4 | Aucun agent ne peut être en 2 salles simultanément |
| I5 | Un agent 13h ne peut pas être placé au-delà de 13:00 |
| I6 | La forme du train dépend de l'effectif du jour. Pas de modèle formel imposé |

---

## 10. VUE EFFECTIF — ce que le cadre saisit

### Cartes salles (S05-S08)

Chaque carte contient :
- Chirurgien affecté (dropdown)
- Instru + Circu (dropdown agents) + catégorie du jour (J / 12h / 13h). Seul 13h impacte le moteur (contrainte dure)
- Checkbox "Terminé" : programme fini → agents mangent puis couloir. Marquage manuel (R30)
- Bouton fermer : salle inactive, grisée, 0 besoin. Bouton rouvrir

### Groupes hors-salle

- **Couloir** : agents avec mission hors-salle. Mangent au 1er tour par convention
- **Soir** : agents déjà mangés, remplaçants initiaux
- **Doublures** : aide opératoire, mobilisables en tension
- **Autres**

### Contrôles

- Presets : 4 boutons visuels (Confortable / Quotidien / Tendu / Critique). Chargent l'effectif + calcul auto + affichent la timeline. Identifient des patterns réutilisables
- Journées sauvegardées : charge en 1 clic. Alimentent les presets
- Purge : reset complet pour nouvelle journée
- Bouton Diagnostic : qualification immédiate
- Bouton Calcul auto : plan complet + timeline

---

## 11. VUE TIMELINE — le petit train

### Axes

- **Y** : postes par salle (S05 I, S05 C, S06 I, S06 C, S07 I, S07 C, S08 I, S08 C) + zone Couloir + zone Banc
- **X** : créneaux de 30 min. 4 colonnes (11:30 · 12:00 · 12:30 · 13:00)

### Cases (le damier)

Les cases sont **neutres**. Distinction instru/circu subtile comme un échiquier (nuance très légère de fond, alternance). Aucun changement de couleur selon l'état du remplacement. Ce sont les pions qui portent l'information, pas les cases.

### Pions (les agents)

Chaque agent est un pion visuel, draggable. Taille identique partout (salle, couloir, banc).

| Attribut | Visuel |
|---|---|
| Instru | Couleur A (arbitraire, distincte, pas rouge, pas vert) |
| Circu | Couleur B (arbitraire, distincte de A, pas rouge, pas vert) |
| 13h | Badge "13h" sur le pion |
| Soir | Badge "soir" ou annotation |

**Rouge réservé** aux alertes et messages d'erreur. Jamais sur un pion ou une case fonctionnelle. Vert réservé à l'état "confortable/ok".

Les couleurs des pions seront transverses à toute l'app une fois la convention définie.

### Colonnes extra (11:30, 13:00)

- Taille réduite par défaut
- S'ouvrent au clic ou survol
- Le moteur ne les remplit pas en confortable/quotidien
- Le cadre y dépose des pions manuellement pour des raisons de service hors-module (réunion, changement de service, formation)

### Zone Couloir

Zone tampon **sans créneaux**. Contient les pions des agents au couloir. Empilés. Un couloir peut manger quand il veut s'il n'a pas d'affectation en salle.

### Zone Banc de touche

Zone tampon **sans créneaux**. Contient les pions non affectés. Empilés. Fonction du module uniquement.

### Salle fermée dans la timeline

Garde sa place (2 lignes I + C). Skeleton grisé. Même hauteur. L'habitude de lecture n'est pas perturbée.

### Salle programme terminé

Agents mangent puis apparaissent au couloir. Lignes en opacity réduite.

### Alertes

Affichées sous le tableau :
- Critique (rouge) : poste en salle non pourvu
- Avertissement (jaune) : agent qui n'a pas mangé en fin de plan
- Info (bleu) : agent non placé

---

## 12. DRAG & DROP — règles

### 2 refus totaux

| Action | Résultat | Feedback |
|---|---|---|
| Circu → case instru | **REFUS** | Indication visuelle d'interdiction + toast |
| 13h → créneau > 13:00 | **REFUS** | Indication visuelle d'interdiction + toast |

### Actions autorisées

| Action | Résultat |
|---|---|
| Instru → case circu | Autorisé (un instru sait circuler) |
| Agent → case occupée | Occupant **éjecté au banc**, agent prend la place |
| Agent → couloir | Agent va au couloir (poste terrain, peut être affecté en salle après) |
| Agent → banc | Agent mis en attente (pas affecté) |
| Agent couloir → salle | Agent affecté en salle (ex : remplacer un 13h) |
| Agent banc → salle | Agent réintégré |

### Feedback visuel

| État | Visuel |
|---|---|
| Survol case autorisée | Accentuation (pas rouge) |
| Survol case interdite | Indication d'interdiction (rouge = alerte, autorisé ici) |
| Pion en cours de drag | Opacity réduite à la source |
| Colonnes extra au survol | S'ouvrent à taille pleine |

---

## 13. FONCTIONNALITÉS COMPLÈTES

### Présentes dans le POC

- Configuration permanente : salles, agents, compétences, chirurgiens, paramètres
- Saisie de l'effectif du jour
- Diagnostic immédiat
- Calcul automatique du plan
- Timeline visuelle avec drag&drop
- Presets (4 configurations types)
- Journées sauvegardées
- Purge (nouvelle journée)
- Fermer/rouvrir une salle
- Programme terminé (marquage manuel)
- Chirurgien accepte/refuse pause de salle
- Règles auditables (affichées dans Config)
- Glossaire du module
- Conformité règles (pastilles visuelles)
- Vue agent : message individuel ("Tu manges à 12h, tu remplaces Marie S07 circu 12:30-13:00")

### Prévues après stabilisation

- Mode validation (cadre saisit son plan, moteur vérifie)
- Mode simulation (effectif fictif, rien persisté)
- Patterns / apprentissage (signature, matching, scoring)
- Statistiques et audit (par jour, semaine, mois)
- Historique archivé
- Transitions d'état en cours de journée (soir en retard, intervention qui déborde)
- Intégration DB&M (profiles, chirurgiens, RLS)
- Ordre de cascade configurable par drag&drop sur les labels de salle
- Chirurgien typeProgramme (léger/lourd) pour suggestion d'ordre

---

## 14. CAS LIMITES

| # | Cas | Comportement |
|---|---|---|
| L1 | Intervention déborde au-delà de 13h | Agent ne part pas → recalcul train |
| L2 | Agent soir en retard | Recalcul effectif réel. Possible bascule d'état |
| L3 | Doublure requise | Poste d'origine vacant → cascade couverture |
| L4 | 2 agents matin même salle | 2 postes libérés à 13h → 2 remplaçants simultanés |
| L5 | 0 couloir + 0 soir | Pause de salle inévitable. Signalé à la saisie |

---

## 15. RÈGLES AUDITABLES

Chaque règle est une affirmation sur laquelle le moteur se base. Si une règle est fausse ou contestée par l'équipe, le moteur doit être corrigé.

### Qui mange ?

- **R01** : Agent 13h ne mange pas dans le créneau. Il mange après sur son temps personnel
- **R02** : Agent soir ne mange pas (déjà mangé avant d'arriver)
- **R03** : Agent J ou 12h mange exactement 1 fois dans le créneau
- **R04** : Agent couloir mange par convention au 1er tour (12:00) ou anticipe à 11:30 si tendu
- **R05** : Doublure 13h ne mange pas. Autres doublures mangent librement sans remplacement

### Qui remplace ?

- **R06** : Les soir et les couloirs (après leur pause) sont les remplaçants. Le couloir est la variable d'ajustement principale
- **R07** : Un titulaire revenu de pause cascade vers la salle suivante — il ne retourne pas à sa salle d'origine
- **R08** : Un agent J ou 12h qui a mangé revient comme remplaçant pour la cascade
- **R09** : Une doublure peut être mobilisée comme remplaçante en cas de tension (dégradé/crise). Perte d'aide opératoire signalée
- **R10** : En confortable/quotidien, les doublures ne sont pas mobilisées

### Postes et compétences

- **R11** : Aucun poste (instru ou circu) ne peut rester vacant pendant qu'une salle est occupée
- **R12** : Remplacement instru en crise = accord du chirurgien de la salle obligatoire
- **R13** : Un instru peut circuler (asymétrie). Un circu ne peut pas instrumenter
- **R14** : Un agent interdit sur un poste ne peut jamais y être affecté, même en crise

### Créneaux et fenêtres

- **R15** : Pause = 30 minutes, non fracturable, non cumulable
- **R16** : Fenêtre nominale = 12:00-13:00 (configurable)
- **R17** : Dégradation progressive : d'abord extension fin seule (12:00-13:30), puis extension complète (11:30-13:30)
- **R18** : Le couloir anticipe sa pause à 11:30 si situation tendue, pour être disponible plus tôt

### Priorités et ordre

- **R19** : Les 12h préfèrent manger au 2e service (après-midi longue). Préférence, pas contrainte
- **R20** : Les préférences individuelles (tôt/tard) sont respectées quand possible sans violer C1-C9
- **R21** : Le moteur cherche un remplaçant quotidien d'abord, crise en dernier recours
- **R22** : Le moteur propose un ordre de cascade. Le cadre ajuste toujours manuellement

### Chirurgiens et pause de salle

- **R23** : Un chirurgien peut accepter ou refuser la pause de salle (donnée de configuration)
- **R24** : Si la pause de salle est inévitable et le chirurgien refuse, c'est une alerte bloquante
- **R25** : La pause de salle est le dernier recours. Elle n'est déclenchée que si aucune solution n'existe

### Programme et flux

- **R26** : Si un programme est marqué "terminé" par le cadre, l'équipe mange puis passe au couloir
- **R27** : Le remplaçant initial (soir) reste dans sa salle. C'est le titulaire revenu qui cascade
- **R28** : Conservation des postes : le nombre d'agents en salle reste stable
- **R29** : Salle programme terminé = exclue de la cascade
- **R30** : Fin de programme = marquage manuel par le cadre (pas de détection automatique)

### Contrainte 13h

- **R31** : Agent 13h ne peut pas être placé au-delà de 13:00. Refus total, pas une préférence
- **R32** : Le poste laissé par un 13h à 13:00 doit être couvert par un agent disponible

---

## 16. DONNÉES PERSISTANTES

| Donnée | Stockage POC | Cible |
|---|---|---|
| Journées sauvegardées | localStorage | Supabase |
| Chirurgien pause (accepte/refuse) | localStorage | Supabase |
| Compétences agents | Mémoire (démo) / Supabase (prod) | Supabase |
| Plans de rotation | — | Supabase (historique) |
| Patterns | — | Supabase |
| Statistiques | — | Supabase |
| Agents et chirurgiens | Référentiels DB&M | Supabase |

---

## 17. ARCHITECTURE TECHNIQUE

- Calcul côté client (vanilla JS)
- Pas de dépendance externe (pas de solver, pas de lib d'optimisation)
- Ordonnanceur glouton avec backtracking simple
- Toute la logique dans `rotation-engine.js` (logique pure, zéro DOM, zéro Supabase)
- UI dans `rempla-midi-app.js` (DOM, listeners, rendu)
- Styles dans `rempla-midi-ui.css`
- Structure dans `index.html`
- Stack : HTML/CSS/JS vanilla + Bootstrap 5.3.3 + Supabase cloud

---

## 18. SCÉNARIOS DE TEST

### S01 — Confortable (3 couloirs)

8 agents en salle (4 salles × I+C). 3 couloirs. 0 soir.
Diagnostic attendu : **Confortable**. Pas de chaîne. Chaque couloir tourne indépendamment.

### S02 — Quotidien (1 couloir + 2 soir)

8 agents en salle. 1 couloir. 2 soir.
Diagnostic attendu : **Quotidien**. Chaîne courte. Faisable en fenêtre nominale.

### S03 — Tendu (1 couloir, 0 soir)

8 agents en salle. 1 couloir. 0 soir.
Diagnostic attendu : **Tendu**. Chaîne longue. Dégradé probable.

### S04 — Critique (0 couloir, 1 soir)

8 agents en salle. 0 couloir. 1 soir.
Diagnostic attendu : **Critique**. Certains agents ne mangent probablement pas.

### S05 — Bloqué (0 couloir, 0 soir)

8 agents en salle. 0 couloir. 0 soir.
Diagnostic attendu : **Bloqué**. Pause de salle inévitable.

### S06 — Crise acceptée

Seul remplaçant instru disponible = niveau crise. Chirurgien accepte.
Vérification : affectation crise tracée et signalée.

### S07 — Crise refusée

Remplaçant crise refusé par le chirurgien. Autre remplaçant trouvé ou escalade.

### S08 — 2 agents matin même salle

2 postes libérés à 13h simultanément. 2 remplaçants nécessaires.

### S09 — Doublure

Agent appelé en doublure → son poste d'origine vacant → couverture cascade.

### S10 — Pattern reconnu

Signature d'effectif identique à un pattern existant → proposition automatique.

### S11 — Simulation

Retrait d'un couloir en simulation → comparaison avant/après. Rien persisté.

### S12 — Scénario Manu (3 salles, 2 couloirs, 1 soir)

3 salles ouvertes (S08 fermée). 6 agents en salle. 2 couloirs. 1 soir.
Diagnostic attendu : **Confortable**. Cascade sur 3 salles. Couloirs mangent au 1er tour. Relève en fin de cascade. 8/8 nourris.

---

## 19. HORS SCOPE

- Autres secteurs que ortho-neuro
- IADE, AS, brancardiers
- Gardes / astreintes / nuit
- Connexion OPTIM
- Capacité du self
- Détection automatique de fin de programme (marquage manuel uniquement)
