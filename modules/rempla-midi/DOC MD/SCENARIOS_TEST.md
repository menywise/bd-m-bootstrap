# Scénarios de Test — POC Rotation Repas

---

## OBJECTIF

Chaque scénario est un cas concret à soumettre au moteur. Il valide le diagnostic, le calcul, et la qualification d'état. Ces scénarios servent aussi de base de recette.

---

## S01 — CONFORTABLE (3 couloirs)

### Effectif
| Agent | Catégorie | Salle | Poste | Compétences |
|---|---|---|---|---|
| Marie | Journée | 05 | Instru | instru:quotidien, circu:quotidien |
| Julie | Journée | 05 | Circu | instru:interdit, circu:quotidien |
| Léa | Journée | 06 | Instru | instru:quotidien, circu:crise |
| Thomas | Journée | 06 | Circu | instru:interdit, circu:quotidien |
| Sophie | 12h | 07 | Instru | instru:quotidien, circu:quotidien |
| Paul | 12h | 07 | Circu | instru:crise, circu:quotidien |
| Nadia | Matin | 08 | Instru | instru:quotidien, circu:interdit |
| Karim | Matin | 08 | Circu | instru:interdit, circu:quotidien |
| **Couloir1** | Couloir (journée) | — | — | instru:quotidien, circu:quotidien |
| **Couloir2** | Couloir (journée) | — | — | instru:quotidien, circu:quotidien |
| **Couloir3** | Couloir (12h) | — | — | instru:crise, circu:quotidien |

### Diagnostic attendu
- ✅ **Confortable**
- 6 agents à nourrir (Marie, Julie, Léa, Thomas, Couloir1, Couloir2) + Sophie, Paul, Couloir3
- Nadia et Karim = matin, pas de pause, postes à couvrir à 13h
- 3 couloirs = pas de chaîne nécessaire

### Plan attendu (exemple)
```
12:00-12:30  Couloir1 → salle 05 instru | Marie mange
12:00-12:30  Couloir2 → salle 05 circu  | Julie mange
12:00-12:30  Couloir3 → salle 06 circu  | Thomas mange
12:30-13:00  Couloir1 → salle 06 instru | Léa mange
12:30-13:00  Couloir2 → salle 07 instru | Sophie mange
12:30-13:00  Couloir3 → salle 07 circu  | Paul mange
13:00-       Couloir1 → salle 08 instru | remplace Nadia (débauche)
13:00-       Couloir2 → salle 08 circu  | remplace Karim (débauche)
Couloirs mangent après (journée/12h)
```

### État : QUOTIDIEN ✅
Aucune affectation crise. Tout le monde dans la fenêtre 12h-13h.

---

## S02 — NOMINAL (1 couloir + 2 soir)

### Effectif
Mêmes agents en salle. Mais :
- 1 seul couloir (Couloir1, journée)
- 2 agents soir (Soir1, Soir2) arrivant à 12h
- Soir1 : instru:quotidien, circu:quotidien
- Soir2 : instru:crise, circu:quotidien

### Diagnostic attendu
- ✅ **Nominal**
- 3 remplaçants à 12h (Couloir1 + Soir1 + Soir2) × 2 créneaux = 6 pauses possibles
- 6 agents journée/12h à nourrir + 3 couloirs/remplaçants à nourrir si applicable
- Faisable en fenêtre nominale avec chaîne courte

---

## S03 — TENDU (1 couloir, 0 soir)

### Effectif
8 agents en salle (mêmes que S01) + 1 couloir. 0 agent soir.

### Diagnostic attendu
- ⚠️ **Tendu**
- 1 remplaçant à 12h × 2 créneaux = 2 pauses directes
- Besoin de chaîne longue : chaque agent revenu remplace le suivant
- Probable dégradé (fenêtre élargie nécessaire)

### Vérification clé
Le moteur doit construire une chaîne :
```
Couloir1 → A mange → A revient → A remplace B → B mange → B revient → ...
```
Et vérifier que la chaîne tient dans la fenêtre dégradée (11h30-13h30 max).

---

## S04 — CRITIQUE (0 couloir, 1 soir)

### Effectif
8 agents en salle. 0 couloir. 1 agent soir.

### Diagnostic attendu
- 🔴 **Critique**
- 1 seul remplaçant
- Chaîne très longue, quasi certainement hors fenêtre dégradée
- Probable : certains agents ne mangent pas au self → CRISE

### Vérification clé
Le moteur signale dès la saisie : "Crise prévisible. 1 remplaçant pour 8 postes."

---

## S05 — PAUSE DE SALLE (0 couloir, 0 soir)

### Effectif
8 agents en salle. 0 couloir. 0 soir.

### Diagnostic attendu
- ⛔ **Pause de salle inévitable**
- Aucun remplaçant externe
- Seule option : une salle fait une pause → libère ses agents qui deviennent remplaçants
- Le moteur documente quelle salle, combien de temps

---

## S06 — AFFECTATION CRISE (chirurgien restrictif)

### Effectif
- Salle 07 : instru = Sophie, chirurgien = Dr Martin
- Sophie doit manger
- Seul remplaçant dispo pour instru = Isa (niveau crise)
- Dr Martin a une préférence crise : Isa → ✅ acceptée

### Vérification clé
- Le moteur affecte Isa en instru salle 07
- Signale : "Affectation crise — Isa instru salle 07 (Dr Martin)"
- L'alerte est tracée et comptabilisée

---

## S07 — AFFECTATION CRISE REFUSÉE

### Effectif
- Même que S06, mais Dr Martin → Isa : ❌ refusé
- Autre remplaçant possible : Couloir3 (instru:crise)
- Dr Martin → Couloir3 : ✅ accepté

### Vérification clé
- Le moteur ne tente PAS Isa (refus chirurgien)
- Affecte Couloir3
- Si Couloir3 non dispo non plus → escalade en crise

---

## S08 — AGENTS MATIN MÊME SALLE

### Effectif
- Salle 08 : Nadia (matin, instru) + Karim (matin, circu)
- Les 2 partent à 13h
- Il faut 2 remplaçants simultanés sur salle 08 à 13h

### Vérification clé
- Le moteur planifie 2 remplaçants libres à 13h pour salle 08
- Si pas assez → alerte : "Salle 08 : 2 postes libérés simultanément à 13h, besoin de 2 remplaçants"

---

## S09 — INTERVENTION QUI DÉBORDE

### Contexte
Plan calculé. Créneau 12:30 : Marie doit manger.
À 12:25, salle 05 passe de "pause possible" à "occupée" (intervention non terminée).

### Vérification clé
- Recalcul du plan
- Marie ne part pas → son créneau est décalé
- Cascade sur les créneaux suivants
- Le moteur requalifie l'état si nécessaire

---

## S10 — DOUBLURE

### Contexte
Salle 06 a besoin d'une doublure (3e agent au champ).
Léa (salle 06, instru) reste. Thomas (salle 06, circu) reste.
Sophie (salle 07, instru) est appelée en doublure salle 06.

### Vérification clé
- Salle 07 perd Sophie (instru) → poste vacant
- Le moteur doit couvrir instru salle 07 EN PLUS des pauses repas
- Si pas de remplaçant instru quotidien pour salle 07 → escalade crise
- La cascade est tracée : "Doublure Sophie salle 06 → instru salle 07 vacant → [remplaçant] affecté"

---

## S11 — PATTERN RECONNU

### Contexte
L'effectif du jour a la signature : {salles:4, couloirs:2, soir:1, matin:2, journee:4, 12h:2}
Un pattern existant correspond exactement avec score_succes = 0.9

### Vérification clé
- Le moteur propose : "Configuration reconnue. Plan du [date] disponible (succès 90%). Appliquer ?"
- Le cadre peut accepter, modifier ou refuser
- Si accepté → nb_utilisations + 1

---

## S12 — SIMULATION "RETRAIT COULOIR"

### Contexte
Effectif réel : 2 couloirs, 1 soir → diagnostic CONFORTABLE.
Le cadre simule : "Que se passe-t-il si je retire Couloir2 ?"

### Vérification clé
- Recalcul avec 1 couloir, 1 soir → diagnostic NOMINAL ou TENDU
- Comparaison affichée : avant (confortable) vs après (tendu)
- Aucune donnée persistée

---

## MATRICE DE COUVERTURE

| Scénario | Diagnostic | Calcul auto | Validation | Pattern | Simulation | Crise | Doublure | Débauche 13h |
|---|---|---|---|---|---|---|---|---|
| S01 | ✅ | ✅ | — | — | — | — | — | ✅ |
| S02 | ✅ | ✅ | — | — | — | — | — | ✅ |
| S03 | ✅ | ✅ | — | — | — | — | — | ✅ |
| S04 | ✅ | ✅ | — | — | — | — | — | — |
| S05 | ✅ | ✅ | — | — | — | — | — | — |
| S06 | — | ✅ | — | — | — | ✅ | — | — |
| S07 | — | ✅ | — | — | — | ✅ | — | — |
| S08 | ✅ | ✅ | — | — | — | — | — | ✅ |
| S09 | — | ✅ | — | — | — | — | — | — |
| S10 | — | ✅ | — | — | — | ✅ | ✅ | — |
| S11 | — | — | — | ✅ | — | — | — | — |
| S12 | — | — | — | — | ✅ | — | — | — |
