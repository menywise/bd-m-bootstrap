# REMPLA MIDI — Document de référence V4
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
| Poste exceptionnel | Doublure (aide opératoire ou formation) |
| Personnel | IBODE / IDE de bloc |
| Créneau | Pause repas midi uniquement |
| Durée pause | 30 minutes, non fracturable, non cumulable |
| Fenêtre nominale | 12:00-13:00 (2 créneaux de 30 min) |
| Fenêtre dégradée max | 11:30-13:30 (4 créneaux de 30 min) |

---

## 3. VOCABULAIRE

### Postes

| Terme | Définition |
|---|---|
| Instrumentiste (instru) | Agent stérile au champ opératoire. Prépare et passe les instruments au chirurgien. Poste critique. Peut aussi tenir le poste circu et le couloir — c'est le pion le plus polyvalent |
| Circulant (circu) | Agent non stérile en salle. Approvisionnement, traçabilité, communication. Poste critique. Métier à part entière avec ses compétences propres. Peut tenir le couloir |
| Panseur | Synonyme historique de circulant |
| Doublure | 3e agent appelé en salle pour une intervention complexe, ou agent en cours de formation. Pas de poste titulaire à couvrir |

### Lieux

| Terme | Définition |
|---|---|
| Salle | Salle d'opération (05, 06, 07, 08). Fermée = absence ou vacances chirurgien, pas de personnel nécessaire |
| Couloir | Poste réel hors-salle avec mission de service et fiche de tâche. Existe le matin. Peut disparaître l'après-midi : la salle est prioritaire. Couloir vide = ok. Poste salle vide = ko |
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
| Petit train | Rotation en cascade. Le remplaçant initial devrait rester dans sa salle (limiter transmissions, habillage, perturbation). Le titulaire revenu ne devrait pas retourner à sa salle mais cascader. Ce sont des objectifs — la réalité dépend du programme opératoire |
| Cascade | Chaîne de remplacements. Chaque salle ne devrait subir qu'un seul changement par poste. Idéal visé par le moteur |
| Mouvement | Unité élémentaire du plan : 1 agent part manger, 1 remplaçant prend son poste, pendant 30 min |
| Pattern | Plan de rotation mémorisable et réutilisable. Quand un pattern revient, le moteur doit l'identifier |
| Signature | Empreinte d'un effectif : nb couloirs, nb soir, nb matin, nb journée, nb 12h, nb salles occupées |
| Fin de programme | Le programme finit, l'équipe mange avant fermeture du self sans remplacement |
| Pause de salle | L'intervention s'arrête pour permettre les repas. Dernier recours absolu |

---

## 4. CATÉGORIES D'AGENTS

| Catégorie | Horaire | Mange ? | Rôle rotation |
|---|---|---|---|
| Journée (J) | ~7h-16h30 | Oui | Part manger, revenu = remplaçant potentiel |
| 12h | ~7h-19h | Oui | Identique à J pour le moteur |
| Matin (13h) | ~7h-13h | Non | Libère poste à 13h. Interdit au-delà de 13:00 |
| Soir | 12h-19h30 | Non (déjà mangé) | Remplaçant initial. Arrive à 12h (PAS AVANT). Entre en salle et y reste. 1 à 4 agents |
| Couloir | Variable | Oui (1er tour) | Variable d'ajustement principale. Mange d'abord |

### Indicateurs de confort

Deux variables déterminent le confort de la rotation :
- **Couloirs** : 3 = très simple, 2 = confortable, 1 = standard, 0 = tendu
- **Soir** : 1 à 4 agents. Plus = pool de remplaçants large

### Couloir

Poste terrain avec mission de service hors-salle. Mange au 1er tour (12:00) ou anticipe à 11:30 si tendu. Après pause : disponible pour remplacement ou salle (ex : remplacer un 13h). Peut disparaître l'après-midi : la salle est prioritaire.

### Doublure

Aide opératoire (intervention complexe) ou agent en formation. Pas de poste titulaire. Si 13h : ne mange pas. Si J/12h : mange librement ou avec binôme. Mobilisable comme remplaçant en tension — perte d'aide opératoire signalée.

---

## 5. COMPÉTENCES

Deux métiers distincts. Un instru et un circu ne sont pas interchangeables.

| Profil | Poste instru | Poste circu | Couloir |
|---|---|---|---|
| Instru | Oui | Oui | Oui |
| Circu | Non | Oui | Oui |
| Circu toléré par chirurgien X | Crise (accord chirurgien X) | Oui | Oui |

**Crise** = situation où un circulant est mis exceptionnellement sur un poste instru. C'est le chirurgien qui accepte ou refuse, agent par agent. Ce n'est pas un attribut de l'agent, c'est une relation Agent × Chirurgien.

Un chirurgien peut aussi accepter ou refuser la pause de salle. C'est une donnée de configuration.

---

## 6. ÉTATS

| État | Couleur UI | Fenêtre | Description |
|---|---|---|---|
| Confortable | Vert | 12:00-13:00 | ≥2 remplaçants. Sous-état de Quotidien |
| Quotidien | Bleu | 12:00-13:00 | Pool juste |
| Dégradé léger | Jaune | 12:00-13:30 | Extension fin |
| Dégradé complet | Orange | 11:30-13:30 | Extension complète |
| Crise | Rouge | Hors fenêtre | Circu mis en instru |
| Bloqué | Gris | — | Pause de salle inévitable |

La dégradation est progressive : nominale d'abord, puis extension fin, puis extension complète. Chaque transition d'état est tracée. Statistiques obligatoires : nombre de jours par état, pauses de salle (durée, salle, contexte), affectations crise (agent, chirurgien, fréquence).

---

## 7. CONTRAINTES DURES (C1-C9)

- C1 : Aucun poste vacant pendant salle occupée
- C2 : Remplaçant instru quotidien en nominal. Circu toléré en crise + accord chirurgien
- C3 : Tout agent J/12h/couloir : 30 min de pause
- C4 : Agent 13h : libéré à 13h, poste couvert, interdit au-delà
- C5 : Chaque agent mange exactement 1 fois
- C6 : Doublure mobilisée = poste d'origine vacant = couverture cascade
- C7 : Affectation crise tracée et statistiquée
- C8 : Pause de salle tracée avec contexte
- C9 : 0 couloir + 0 soir = pause de salle, signalé immédiatement

---

## 8. MOTEUR — 4 fonctions

### 8.1 Diagnostiquer

Dès la saisie de l'effectif, AVANT tout calcul de plan. Le moteur qualifie la situation.

Comptages :
- Postes à couvrir = salles occupées × 2
- Agents à nourrir = J + 12h + couloirs (selon catégorie horaire)
- Remplaçants disponibles à 12h = soir + couloirs (les couloirs mangent d'abord mais reviennent)
- Capacité plancher = remplaçants × créneaux
- Capacité réelle > plancher car les agents revenus de pause deviennent remplaçants

### 8.2 Calculer (mode auto)

Ordonnanceur glouton. Ordre des opérations :

1. Couloirs mangent (12:00 ou 11:30 si tendu)
2. Soir entrent en salle à 12:00 (PAS AVANT) et y restent
3. Couloirs revenus rejoignent le pool
4. Cascade : titulaires revenus vers salle suivante. Ne pas avancer tant que la salle courante n'est pas couverte
5. Agents 13h partent à 13:00, postes couverts
6. Relève des remplaçants initiaux

Ordre cascade par défaut S05-S08. Le cadre ajuste toujours manuellement. Critères humains : prothèses, interventions lourdes, chirurgien sensible.

Préférences : tôt/tard pris en compte si possible sans violer C1-C9. Non satisfaite = signalée, pas bloquante. Les 12h préfèrent manger au 2e service.

### 8.3 Valider (futur)

Le cadre saisit son plan. Le moteur vérifie C1-C9 et qualifie l'état résultant.

### 8.4 Apprendre (futur)

Plans validés → sauvegardés avec signature. Patterns récurrents identifiés et proposés. Scoring : nb utilisations, taux quotidien vs dégradé vs crise. Pattern non utilisé depuis 6 mois → archivé.

---

## 9. CASCADE — objectifs et contraintes

| # | Nature | Règle |
|---|---|---|
| I1 | Objectif | Remplaçant initial devrait rester dans sa salle |
| I2 | Objectif | Titulaire revenu devrait cascader, pas retourner |
| I3 | Objectif | Chaque salle : un seul changement par poste |
| I4 | Contrainte | Aucun agent en 2 salles simultanément |
| I5 | Contrainte | Agent 13h interdit au-delà de 13:00 |
| I6 | Réalité | Forme du train = dépend du programme opératoire |

---

## 10. VUE EFFECTIF

### Cartes salles (S05-S08)

- Chirurgien affecté (dropdown)
- Instru + Circu (dropdown agents) + catégorie du jour (J / 12h / 13h). Seul 13h impacte le moteur
- Checkbox "Terminé" : programme fini → agents mangent avant fermeture self, pas de remplacement
- Bouton fermer : salle inactive (absence/vacances chirurgien), grisée, 0 besoin. Bouton rouvrir

### Groupes hors-salle

- **Couloir** : agents avec mission hors-salle. Mangent au 1er tour. Toggle 13h disponible
- **Soir** : agents déjà mangés, remplaçants initiaux (1 à 4 selon les jours)
- **Doublures** : aide opératoire ou formation. Toggle 13h disponible. Mobilisables en tension
- **Renforts extérieurs** : viscéral, intérimaire. Auto-incrémentés ("viscéral-1"). Toggle 13h

### Contrôles

- Presets : 4 boutons visuels (Confortable / Quotidien / Tendu / Critique). Chargent l'effectif + calcul auto + affichent la timeline
- Journées sauvegardées : charge en 1 clic. Alimentent les presets
- Purge : reset complet pour nouvelle journée
- Diagnostic : qualification immédiate
- Calcul auto : plan complet + timeline

---

## 11. VUE TIMELINE

### Structure

- Y : postes par salle (S05 I, S05 C, …, S08 C) + zone Couloir + zone Banc
- X : 4 créneaux (11:30 · 12:00 · 12:30 · 13:00)
- Colonnes extra (11:30, 13:00) réduites, s'ouvrent au survol
- Le moteur ne remplit pas les colonnes extra en confortable/quotidien
- Le cadre y dépose des pions manuellement pour des raisons de service hors-module

### Cases (le damier)

Cases neutres. Distinction instru/circu subtile comme un échiquier. Ce sont les pions qui portent l'information, pas les cases.

### Pions

Chaque agent = un pion draggable. Taille identique partout (salle, couloir, banc).

| Attribut | Visuel |
|---|---|
| Instru | Couleur A (pas rouge, pas vert — transverse app) |
| Circu | Couleur B (distincte de A, pas rouge, pas vert) |
| 13h | Badge "13h" — visuellement distinct (fond jaune, bordure orange) |
| Soir | Badge "soir" |
| Couloir | Badge "coul." |
| → Couloir (après cascade) | Badge "→coul." + bordure pointillée |

Rouge réservé aux alertes. Vert réservé à l'état ok. Jamais sur un pion fonctionnel.

### Format remplacement

Dans chaque cellule : Remplaçant (pion) + ▸ Titulaire (nom). Pas de "mange".

### Zones tampons

Couloir et Banc = bandes pleine largeur sous le tableau, empilées (pas côte à côte). Sans créneaux.

### Salle fermée

Garde sa place (2 lignes I + C). Skeleton grisé. Même hauteur.

### Salle programme terminé

Agents mangent puis apparaissent au couloir. Lignes en opacity réduite.

### Alertes (sous le tableau)

- Rouge : poste non pourvu
- Jaune : agent non nourri
- Bleu : agent non placé

### Vue agent

Message individuel par agent : "Tu manges à 12h, tu remplaces Marie S07 circu 12:30-13:00". Séparée instru / circu. Mêmes couleurs que le petit train.

---

## 12. DRAG & DROP

### 2 refus totaux

| Action | Résultat | Feedback |
|---|---|---|
| Circu → case instru | REFUS | Indication visuelle + toast |
| 13h → créneau ≥ 13:00 | REFUS | Indication visuelle + toast |

### Actions autorisées

| Action | Résultat |
|---|---|
| Instru → case circu | Autorisé (un instru sait circuler) |
| Agent → case occupée | Occupant éjecté au banc, agent prend la place |
| Agent → couloir | Agent va au couloir |
| Agent → banc | Agent mis en attente |
| Agent couloir → salle | Agent affecté en salle |
| Agent banc → salle | Agent réintégré |

### Feedback visuel

| État | Visuel |
|---|---|
| Survol case autorisée | Accentuation (pas rouge) |
| Survol case interdite | Indication d'interdiction |
| Pion en cours de drag | Opacity réduite à la source |
| Colonnes extra au survol | S'ouvrent à taille pleine |

---

## 13. FONCTIONNALITÉS

### Présentes dans le POC

- Configuration : salles, agents, compétences, chirurgiens, paramètres
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
- Renforts extérieurs (viscéral, intérimaire)
- Vue agent : message individuel

### Prévues après stabilisation

- Mode validation (cadre saisit son plan, moteur vérifie)
- Mode simulation (effectif fictif, rien persisté)
- Patterns / apprentissage (signature, matching, scoring)
- Statistiques et audit (par jour, semaine, mois)
- Historique archivé
- Transitions d'état en cours de journée
- Intégration DB&M
- Ordre de cascade configurable par drag&drop
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

## 15. RÈGLES AUDITABLES (R01-R32)

Chaque règle est une affirmation sur laquelle le moteur se base. Si une règle est fausse ou contestée par l'équipe, le moteur doit être corrigé.

### Qui mange ?
- R01 : 13h ne mange pas dans le créneau
- R02 : Soir ne mange pas
- R03 : J/12h mange 1 fois
- R04 : Couloir mange au 1er tour ou 11:30
- R05 : Doublure 13h ne mange pas. Autres mangent librement ou avec binôme

### Qui remplace ?
- R06 : Soir + couloirs (après pause) = remplaçants. Couloir = variable principale
- R07 : Titulaire revenu devrait cascader, pas retourner
- R08 : J/12h revenu = remplaçant potentiel
- R09 : Doublure mobilisable en tension
- R10 : Doublures non mobilisées en confortable

### Postes
- R11 : Aucun poste vacant
- R12 : Circu sur poste instru = crise = accord chirurgien
- R13 : Instru peut circuler. Circu ne peut pas instrumenter (sauf crise)
- R14 : Interdit = jamais affecté

### Créneaux
- R15 : 30 min non fracturable
- R16 : Nominale 12:00-13:00
- R17 : Dégradation progressive
- R18 : Couloir anticipe 11:30 si tendu

### Priorités
- R19 : 12h préfèrent 2e service
- R20 : Préférences respectées si possible
- R21 : Instru d'abord, circu crise en dernier recours
- R22 : Moteur propose, cadre ajuste

### Chirurgiens
- R23 : Accepte/refuse pause de salle
- R24 : Refus + inévitable = alerte bloquante
- R25 : Pause = dernier recours

### Programme et flux
- R26 : Programme terminé = mange avant fermeture self. Marquage manuel
- R27 : Remplaçant initial devrait rester. Titulaire cascade
- R28 : Couloir matin peut disparaître. Salle prioritaire
- R29 : Salle terminée = exclue de la cascade
- R30 : Fin programme = marquage manuel

### 13h
- R31 : 13h interdit au-delà de 13:00. Refus total
- R32 : Poste 13h doit être couvert

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

## 17. ARCHITECTURE

- rotation-engine.js : logique pure, zéro DOM, zéro Supabase
- rempla-midi-app.js : DOM, listeners, rendu
- rempla-midi-ui.css : styles
- index.html : structure
- Stack : vanilla JS + Bootstrap 5.3.3 + Supabase cloud
- Ordonnanceur glouton avec backtracking simple
- Temps de calcul < 1 seconde pour 4 salles / 20 agents

---

## 18. SCÉNARIOS DE TEST

- S01 : Confortable (3 couloirs, 0 soir). Pas de chaîne.
- S02 : Quotidien (1 couloir + 2 soir). Chaîne courte.
- S03 : Tendu (1 couloir, 0 soir). Chaîne longue. Dégradé probable.
- S04 : Critique (0 couloir, 1 soir). Certains ne mangent pas.
- S05 : Bloqué (0+0). Pause de salle inévitable.
- S06 : Crise acceptée (circu toléré en instru par chirurgien).
- S07 : Crise refusée. Escalade.
- S08 : 2× matin même salle. 2 remplaçants simultanés à 13h.
- S09 : Doublure. Poste d'origine vacant → cascade.
- S10 : Pattern reconnu. Proposition automatique.
- S11 : Simulation. Retrait couloir fictif. Rien persisté.
- S12 : Réel (3 salles, 2 couloirs, 1 soir). Tout le monde mange.

---

## 19. HORS SCOPE

- Autres secteurs que ortho-neuro
- IADE, AS, brancardiers
- Gardes / astreintes / nuit
- Connexion OPTIM
- Capacité du self
- Détection automatique de fin de programme
