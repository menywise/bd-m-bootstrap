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
| Banc de touche | Fonction du module. Zone tampon pour les pions non affectés. N'existe pas sur le terrain |

### Concepts

| Terme | Définition |
|---|---|
| Petit train | Rotation en cascade. Le remplaçant initial devrait rester dans sa salle (limiter transmissions, habillage, perturbation). Le titulaire revenu ne devrait pas retourner à sa salle mais cascader. Ce sont des objectifs — la réalité dépend du programme opératoire |
| Cascade | Chaîne de remplacements. Chaque salle ne devrait subir qu'un seul changement par poste. Idéal visé par le moteur |
| Pattern | Plan de rotation mémorisable et réutilisable. Quand un pattern revient, le moteur doit l'identifier |
| Fin de programme | Le programme finit, l'équipe mange avant fermeture du self sans remplacement |
| Pause de salle | L'intervention s'arrête pour permettre les repas. Dernier recours absolu |

---

## 4. CATÉGORIES D'AGENTS

| Catégorie | Horaire | Mange ? | Rôle rotation |
|---|---|---|---|
| Journée (J) | ~7h-16h30 | Oui | Part manger, revenu = remplaçant potentiel |
| 12h | ~7h-19h | Oui | Identique à J pour le moteur |
| Matin (13h) | ~7h-13h | Non | Libère poste à 13h. Interdit au-delà de 13:00 |
| Soir | 12h-19h30 | Non (déjà mangé) | Remplaçant initial. Entre en salle et y reste. 1 à 4 agents |
| Couloir | Variable | Oui (1er tour) | Variable d'ajustement principale. Mange d'abord |

### Indicateurs de confort

- **Couloirs** : 3 = très simple, 2 = confortable, 1 = standard, 0 = tendu
- **Soir** : 1 à 4 agents. Plus = pool de remplaçants large

### Couloir

Poste terrain. Mange au 1er tour (12:00) ou anticipe à 11:30 si tendu. Après pause : disponible pour remplacement ou salle. Peut disparaître l'après-midi.

### Doublure

Aide opératoire ou formation. Pas de poste titulaire. Si 13h : ne mange pas. Si J/12h : mange librement ou avec binôme. Mobilisable en tension.

---

## 5. COMPÉTENCES

Deux métiers distincts. Un instru et un circu ne sont pas interchangeables.

| Profil | Poste instru | Poste circu | Couloir |
|---|---|---|---|
| Instru | Oui | Oui | Oui |
| Circu | Non | Oui | Oui |
| Circu toléré par chirurgien X | Crise (accord chirurgien X) | Oui | Oui |

**Crise** = situation où un circulant est mis exceptionnellement sur un poste instru. C'est le chirurgien qui accepte ou refuse, agent par agent. Ce n'est pas un attribut de l'agent, c'est une relation Agent x Chirurgien.

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

## 8. MOTEUR

### Diagnostiquer (avant calcul)

Comptage postes, agents à nourrir, remplaçants, capacité. Qualification état.

### Calculer (mode auto)

1. Couloirs mangent (12:00 ou 11:30 si tendu)
2. Soir entrent en salle et y restent
3. Couloirs revenus rejoignent le pool
4. Cascade : titulaires revenus vers salle suivante
5. Agents 13h partent, postes couverts
6. Relève des remplaçants initiaux

Ordre cascade par défaut S05-S08. Cadre ajuste manuellement.

### Valider (futur)

Cadre saisit son plan, moteur vérifie C1-C9.

### Apprendre (futur)

Patterns mémorisés, signatures, scoring.

---

## 9. CASCADE — objectifs et contraintes

| # | Nature | Règle |
|---|---|---|
| I1 | Objectif | Remplaçant initial devrait rester dans sa salle |
| I2 | Objectif | Titulaire revenu devrait cascader |
| I3 | Objectif | Chaque salle : un seul changement par poste |
| I4 | Contrainte | Aucun agent en 2 salles simultanément |
| I5 | Contrainte | Agent 13h interdit au-delà de 13:00 |
| I6 | Réalité | Forme du train = dépend du programme opératoire |

---

## 10. VUE EFFECTIF

Cartes salles : chirurgien + instru + circu + catégorie (J/12h/13h) + terminé + fermer.
Groupes : couloir, soir (1-4), doublures.
Contrôles : presets, journées sauvegardées, purge.

---

## 11. VUE TIMELINE

### Structure

- Y : postes par salle + zone Couloir + zone Banc
- X : 4 créneaux (11:30, 12:00, 12:30, 13:00)
- Cases neutres (damier subtil instru/circu)
- Colonnes extra (11:30, 13:00) réduites, s'ouvrent au survol

### Pions

Chaque agent = un pion draggable. Taille identique partout.

| Attribut | Visuel |
|---|---|
| Instru | Couleur A (pas rouge, pas vert) |
| Circu | Couleur B (distincte de A) |
| 13h | Badge "13h" |
| Soir | Badge "soir" |

Rouge = alertes uniquement. Vert = état ok uniquement.

### Zones tampons

Couloir et Banc = zones sans créneaux. Pions empilés.

### Alertes (sous le tableau)

- Rouge : poste non pourvu
- Jaune : agent non nourri
- Bleu : agent non placé

---

## 12. DRAG & DROP

### 2 refus totaux

- Circu vers case instru = REFUS
- 13h vers créneau > 13:00 = REFUS

### Autorisé

- Instru vers case circu = OK
- Agent vers case occupée = occupant éjecté au banc
- Agent vers couloir ou banc = déplacé
- Agent couloir/banc vers salle = affecté

---

## 13. RÈGLES AUDITABLES (R01-R32)

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

## 14. SCÉNARIOS DE TEST

- S01 : Confortable (3 couloirs)
- S02 : Quotidien (1 couloir + 2 soir)
- S03 : Tendu (1 couloir, 0 soir)
- S04 : Critique (0 couloir, 1 soir)
- S05 : Bloqué (0+0)
- S06 : Crise acceptée (circu toléré en instru par chirurgien)
- S07 : Crise refusée
- S08 : 2x matin même salle
- S09 : Doublure
- S10 : Pattern reconnu
- S11 : Simulation
- S12 : Réel (3 salles, 2 couloirs, 1 soir)

---

## 15. ARCHITECTURE

- rotation-engine.js : logique pure, zéro DOM
- rempla-midi-app.js : DOM, listeners, rendu
- rempla-midi-ui.css : styles
- index.html : structure
- Stack : vanilla JS + Bootstrap 5.3.3 + Supabase

---

## 16. HORS SCOPE

Autres secteurs, IADE/AS/brancardiers, gardes/nuit, OPTIM, capacité self, détection auto fin programme.
