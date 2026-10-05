# Spécification Moteur de Règles — POC Rotation Repas

---

## 1. RÔLE DU MOTEUR

Le moteur est le cerveau de l'application. Il fait 4 choses :

1. **Diagnostiquer** : dès la saisie de l'effectif, qualifier la situation (confortable → bloqué)
2. **Calculer** : proposer un plan de rotation optimal (mode auto)
3. **Vérifier** : valider un plan saisi manuellement (mode validation)
4. **Apprendre** : mémoriser les patterns qui fonctionnent

---

## 2. ENTRÉES DU MOTEUR

### 2.1 Données permanentes (config)

```
SALLES = [05, 06, 07, 08]
POSTES_PAR_SALLE = [instru, circu]
DUREE_PAUSE = 30  // minutes
CRENEAU_NOMINAL = { debut: "12:00", fin: "13:00" }
CRENEAU_DEGRADE_MAX = { debut: "11:30", fin: "13:30" }
```

### 2.2 Données agents (ref DB&M + compétences)

```
Agent {
  id
  nom
  role: instru | panseur       // champ DB&M
  competences: {
    instru: quotidien | crise | interdit
    circu: quotidien | crise | interdit
  }
  preferences_crise: [         // par chirurgien
    { chirurgien_id, poste, accepte: bool }
  ]
  preference_creneau: tôt | tard | indifférent  // facultatif
}
```

### 2.3 Données du jour (saisie)

```
EffectifJour {
  agents: [
    {
      agent_id,
      categorie: matin | journee | 12h | soir | couloir,
      affectation: { salle, poste },  // null si couloir
      chirurgien_salle: chirurgien_id  // pour la salle affectée
    }
  ]
  salles: [
    {
      id: 05|06|07|08,
      occupee: bool,
      pause_possible: bool,
      chirurgien_id
    }
  ]
}
```

---

## 3. PHASE 1 — DIAGNOSTIC IMMÉDIAT

Dès la saisie de l'effectif, le moteur calcule :

### 3.1 Comptages

```
nb_postes_a_couvrir = salles_occupees × 2
nb_agents_a_nourrir = count(journee) + count(12h) + count(couloir si catégorie ≠ soir)
nb_remplacants_dispo_12h = count(soir) + count(couloir)
nb_creneaux_nominal = (13:00 - 12:00) / 30 = 2
nb_creneaux_degrade = (13:30 - 11:30) / 30 = 4
capacite_nominale = nb_remplacants_dispo_12h × nb_creneaux_nominal
capacite_degradee = nb_remplacants_dispo_12h × nb_creneaux_degrade
```

Note : la capacité réelle est supérieure car les agents revenus de pause deviennent eux-mêmes remplaçants. Le calcul ci-dessus est le **plancher** (pire cas).

### 3.2 Diagnostic

```
SI nb_remplacants_dispo_12h == 0
  → ⛔ PAUSE DE SALLE INÉVITABLE

SI capacite_nominale >= nb_agents_a_nourrir
  ET aucun poste instru sans remplaçant quotidien
  → ✅ CONFORTABLE ou NOMINAL

SI capacite_nominale < nb_agents_a_nourrir
  ET capacite_degradee >= nb_agents_a_nourrir
  → ⚠️ TENDU (dégradé probable)

SI capacite_degradee < nb_agents_a_nourrir
  → 🔴 CRITIQUE (crise probable)

SI un poste instru n'a aucun remplaçant quotidien
  → vérifier remplaçants crise + accord chirurgien
  SI aucun → 🔴 CRITIQUE sur ce poste
```

### 3.3 Sortie diagnostic

```
Diagnostic {
  etat_prevu: confortable | nominal | tendu | critique | pause_salle
  nb_agents_a_nourrir
  nb_remplacants_12h
  capacite_nominale
  capacite_degradee
  alertes: [
    { type, message, severite }
  ]
  postes_a_risque: [
    { salle, poste, raison }
  ]
}
```

---

## 4. PHASE 2 — CALCUL DU PLAN (mode auto)

### 4.1 Algorithme principal

Le moteur construit la séquence de remplacements créneau par créneau (pas de 30 min).

**Priorités d'ordonnancement :**

1. Les agents matin (débauche 13h) ne mangent PAS mais leur poste doit être couvert à 13h → les remplacements de leurs postes sont planifiés en dernier créneau avant 13h
2. Les couloirs sont affectés en premier (disponibles immédiatement, pas de chaîne)
3. Les agents soir sont affectés ensuite
4. Les agents revenus de pause entrent dans le pool de remplaçants
5. Préférence "tôt" → premiers créneaux. Préférence "tard" → derniers créneaux. Si possible.

### 4.2 Pour chaque créneau de 30 min

```
POUR chaque creneau T dans [debut_fenetre, fin_fenetre] par pas de 30 min :

  1. Identifier les agents disponibles pour remplacer :
     - Couloirs non occupés
     - Agents soir non occupés
     - Agents revenus de pause
     - Agents matin/journée/12h non encore partis ET qui mangent tard

  2. Identifier les agents qui doivent partir manger :
     - Prioriser ceux avec préférence créneau
     - Prioriser ceux qui débauchent tôt (si applicable)
     - Respecter : pas 2 agents de la même salle simultanément (sauf si assez de remplaçants)

  3. Pour chaque départ en pause :
     - Trouver un remplaçant compétent (quotidien d'abord, crise en dernier recours)
     - Vérifier C1→C9
     - Affecter

  4. Si pas assez de remplaçants pour ce créneau :
     - Tenter d'élargir la fenêtre (dégradé)
     - Si déjà en dégradé max → signaler crise
```

### 4.3 Gestion des agents matin (13h)

Les agents matin ne mangent pas. Mais à 13h :
- Ils partent
- Leur poste DOIT être couvert par un remplaçant ou un agent déjà revenu de pause
- Le moteur planifie cette couverture comme un "remplacement de débauche" dans le dernier créneau

### 4.4 Gestion de la doublure

Si un agent est en doublure dans une salle :
- Son poste d'origine est vacant
- Le moteur traite ce poste comme un poste supplémentaire à couvrir
- Cascade : peut nécessiter un remplaçant supplémentaire

### 4.5 Sortie plan

```
Plan {
  creneaux: [
    {
      debut: "12:00",
      fin: "12:30",
      mouvements: [
        {
          agent_pause: agent_id,       // qui part manger
          poste_libere: { salle, poste },
          remplacant: agent_id,
          niveau_remplacement: quotidien | crise,
          chirurgien_concerne: chirurgien_id  // si crise instru
        }
      ]
    }
  ]
  etat_resultant: quotidien | degrade_leger | degrade_complet | crise | bloque
  debut_reel: "11:30" | "12:00"
  fin_reelle: "13:00" | "13:30"
  alertes: [ ... ]
  affectations_crise: [ { agent, poste, salle, chirurgien, justification } ]
  pauses_programme_op: [ { salle, duree, cause } ]  // si crise
  preferences_non_satisfaites: [ { agent, preference, raison } ]
}
```

---

## 5. PHASE 3 — VALIDATION (mode manuel)

Le cadre saisit son plan. Le moteur vérifie :

```
POUR chaque créneau du plan saisi :
  VÉRIFIER C1 : aucun poste vacant ?
  VÉRIFIER C2 : chaque remplaçant a le niveau requis ?
  VÉRIFIER C3 : si niveau crise → chirurgien accepte ?
  VÉRIFIER C4 : tout agent concerné a bien 30 min de pause ?
  VÉRIFIER C5 : agent matin couvert à 13h ?
  VÉRIFIER C6 : personne ne mange 2 fois / personne n'est oublié ?
  VÉRIFIER C7 : doublure → cascade couverte ?

QUALIFIER l'état résultant
LISTER les violations, avertissements, affectations crise
```

Sortie : même structure que le plan auto + liste de violations.

---

## 6. PHASE 4 — PATTERNS

### 6.1 Signature d'un pattern

Un pattern est identifié par sa **signature d'effectif** :

```
PatternSignature {
  nb_salles_occupees: int
  nb_couloirs: int
  nb_soir: int
  nb_matin: int
  nb_journee: int
  nb_12h: int
  // optionnel : distribution des compétences
}
```

### 6.2 Stockage

```
Pattern {
  id
  signature: PatternSignature
  plan: Plan
  etat_resultant
  nb_utilisations: int
  derniere_utilisation: date
  score_succes: float   // % de fois où l'état est resté quotidien/nominal
  cree_par: auto | cadre
  valide: bool
}
```

### 6.3 Matching

Quand un effectif est saisi :
1. Calculer la signature
2. Chercher les patterns avec signature identique ou proche
3. Proposer le pattern avec le meilleur score
4. Le cadre accepte, modifie, ou refuse

### 6.4 Apprentissage

- Plan validé et exécuté → incrémenter nb_utilisations
- Si l'état résultant réel correspond au prévu → augmenter score_succes
- Si dégradation → baisser score_succes
- Pattern jamais utilisé depuis 6 mois → archivé (pas supprimé)

---

## 7. MODE SIMULATION

Identique au mode auto MAIS :
- Aucune donnée persistée
- Le cadre peut modifier l'effectif fictif :
  - Ajouter/retirer un couloir
  - Ajouter/retirer un agent soir
  - Changer un refus chirurgien
  - Passer une salle en "pause possible"
- Le moteur recalcule instantanément
- Comparaison avant/après affichée

---

## 8. INDICATEURS DU MOTEUR

Questions auxquelles le moteur répond instantanément :

| # | Question | Source |
|---|---|---|
| I1 | Combien d'agents doivent manger ? | Comptage effectif |
| I2 | Combien de remplaçants à 12h ? | Couloirs + soir |
| I3 | Combien de créneaux disponibles ? | Fenêtre / 30 |
| I4 | Postes instru sans remplaçant quotidien ? | Matrice compétences |
| I5 | Chirurgiens qui restreignent les options crise ? | Préférences |
| I6 | État prévisible ? | Diagnostic |
| I7 | Pattern connu pour cette config ? | Base patterns |

---

## 9. GESTION DES TRANSITIONS D'ÉTAT

Le moteur doit gérer les changements en cours de journée :

```
SI salle passe de "occupée" à "pause possible"
  → recalculer : un poste en moins à couvrir
  → possible amélioration d'état (crise → dégradé)

SI agent soir arrive en retard
  → recalculer avec effectif réel
  → possible dégradation d'état

SI intervention déborde
  → agent ne peut pas partir → recalcul train
  → tracer l'impact
```

Chaque transition est loguée avec timestamp et cause.

---

## 10. CONTRAINTES TECHNIQUES

- Calcul côté client (vanilla JS) pour le POC
- Pas de dépendance externe (pas de solver, pas de lib d'optimisation)
- L'algorithme est un ordonnanceur glouton avec backtracking simple
- Temps de calcul < 1 seconde pour 4 salles / 20 agents
- Toute la logique dans un fichier JS isolé (rotation-engine.js) pour testabilité
