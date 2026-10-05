# CDC Fonctionnel — POC Rotation Repas Bloc Ortho-Neuro
## Version 3.0

---

## 1. PÉRIMÈTRE

| Paramètre | Valeur |
|---|---|
| Secteur | Ortho-neuro exclusivement |
| Salles | 05, 06, 07, 08 |
| Postes par salle | Instrumentiste + Circulant |
| Poste exceptionnel | Doublure (rend indisponible le poste d'origine) |
| Personnel | IBODE / IDE de bloc |
| Rôles agents | Instru, Panseur (champ ajouté au profil agent DB&M) |
| Créneau | Pause repas midi uniquement |
| App | Standalone → intégration DB&M après stabilisation |
| Multi-utilisateurs | Oui |
| Référentiels | Agents et chirurgiens issus de DB&M |

---

## 2. CATÉGORIES D'AGENTS

| Catégorie | Horaire | Pause repas | Rôle rotation |
|---|---|---|---|
| **Matin** | ~7h → 13h | Aucune (mange après 13h, temps perso) | Libère son poste à 13h → doit être remplacé |
| **Journée** | ~7h → 16h30 | Doit manger dans le créneau | Part en pause + revenu = remplaçant potentiel |
| **12h** | ~7h → 19h | Doit manger dans le créneau | Part en pause + revenu = remplaçant potentiel |
| **Soir** | 12h → 19h30 | A déjà mangé | Remplaçant disponible dès 12h |
| **Couloir** | Peu importe | Selon sa catégorie horaire | Disponible immédiatement, pas affecté à une salle. Remplaçant prioritaire. |

### Agent couloir

Pas affecté à une salle. Variable d'ajustement principale du petit train.

- 1 couloir → config standard
- 2 couloirs → config confortable
- 3 couloirs → mode très simple, quasi pas de chaîne

Le nombre de couloirs est le premier indicateur de confort ou de tension.

Tout agent ayant mangé (ou n'ayant pas besoin de manger) est remplaçant potentiel dans son rôle. Un agent qui mange à 13h ou 13h30 est remplaçant AVANT sa propre pause.

Nombre typique d'agents soir : ~2 (configurable par pattern).

---

## 3. ÉTATS DE FONCTIONNEMENT

| État | Créneau pause | Description |
|---|---|---|
| **Quotidien** | 12h00 → 13h00 | Nominal. Tous mangent dans la fenêtre standard 60 min. |
| **Dégradé léger** | 11h30→13h00 ou 12h00→13h30 | Décalé d'un côté. Signalé. |
| **Dégradé complet** | 11h30 → 13h30 | Fenêtre élargie max 120 min. Signalé et tracé. |
| **Crise** | Hors fenêtre | Agent(s) ne peut pas aller au self. Ou pause de salle dans le programme op. |
| **Bloqué** | — | Aucune solution possible. Documenté et statistiqué. |

### Obligations du moteur par état

- **Dégradé** : signaler quel côté déborde et pourquoi.
- **Crise** : lister chaque agent impacté + raison. Si pause programme op → tracer salle, durée, contexte.
- **Bloqué** : documenter ce qui manque pour débloquer.

### Statistiques obligatoires par état

- Nombre de jours par état (quotidien / dégradé léger / dégradé complet / crise / bloqué)
- Pour crise : nombre de pauses programme op, durée cumulée, salles impactées, contexte
- Pour bloqué : fréquence, causes récurrentes
- Toute transition d'état tracée

---

## 4. MATRICE DE COMPÉTENCES

### 4.1 Modèle quotidien

La salle n'est pas un critère. Compétence = Poste × Niveau.

Niveaux :
- **Quotidien** : pleinement compétent, affectation normale
- **Crise** : dépannage uniquement si aucune alternative quotidien. Signalé.
- **Interdit** : jamais, même en crise

Exemple :

| Agent | Instru | Circu |
|---|---|---|
| Marie | Quotidien | Quotidien |
| Julie | Quotidien | Interdit |
| Isa | Crise | Quotidien |
| Thomas | Interdit | Quotidien |

### 4.2 Modèle crise — le chirurgien entre en jeu

En crise, la contrainte devient Poste × Chirurgien : quel chirurgien accepte cet agent en instru de manière exceptionnelle ?

| Agent | Poste | Chirurgien | Acceptation |
|---|---|---|---|
| Isa | Instru | Dr Dupont | ✅ |
| Isa | Instru | Dr Martin | ❌ |

Le refus total (un chirurgien refuse TOUS les remplaçants) n'existe pas. C'est une organisation humaine. Si détecté → alerte de configuration.

### 4.3 Source des données

- Chirurgiens : référentiel DB&M
- Agents : référentiel DB&M + champ rôle (instru / panseur)
- Préférences chirurgien × agent en crise : saisie spécifique à cette app

---

## 5. CONTRAINTES DURES

| # | Règle |
|---|---|
| C1 | Aucun poste vacant pendant salle occupée |
| C2 | Remplaçant niveau quotidien en nominal, niveau crise + accord chirurgien sinon |
| C3 | Tout agent (journée, 12h) doit avoir 30 min de pause au self |
| C4 | Agent matin : libéré à 13h, poste couvert |
| C5 | Chaque agent concerné passe exactement 1 fois au self |
| C6 | Doublure → poste d'origine vacant → couverture cascade |
| C7 | Affectation crise tracée, justifiée, statistiquée |
| C8 | Pause programme op tracée avec contexte complet |
| C9 | 0 couloir + 0 soir = pause de salle de facto → signalé immédiatement |

---

## 6. LE PETIT TRAIN

### 6.1 Pas de modèle formel imposé

La forme du train dépend de l'effectif du jour. Le couloir est l'acteur prioritaire.

### 6.2 Exemples de configurations

**Très simple (3 couloirs)** :
```
Couloir1 → remplace A → A mange → A revient
Couloir2 → remplace B → B mange → B revient
Couloir3 → remplace C → C mange → C revient
Pas de chaîne. Chaque couloir tourne indépendamment.
```

**Standard (1 couloir + soir)** :
```
Couloir1 → remplace A → A mange → A revient
Soir1 → remplace B → B mange → B revient
A (revenu) → remplace C → C mange → ...
```

**Tendue (1 couloir, 0 soir)** :
```
Couloir1 → remplace A → A mange → A revient
A → remplace B → B mange → B revient
B → remplace C → ...
Chaîne longue, risque dégradé/crise.
```

### 6.3 Alertes préventives (dès saisie effectif)

| Signal | Condition |
|---|---|
| ✅ Confortable | ≥ 2 couloirs + agents soir |
| ✅ Nominal | 1 couloir + agents soir suffisants |
| ⚠️ Tendu | 1 couloir, 0 ou 1 soir |
| 🔴 Critique | 0 couloir, ≤ 1 soir |
| ⛔ Pause de salle inévitable | Pas assez de remplaçants pour couvrir |

Le moteur qualifie la situation AVANT de calculer le plan.

---

## 7. FONCTIONNALITÉS

### 7.1 Configuration (permanente)

- Salles 05, 06, 07, 08 + postes par salle
- Agents : issus DB&M + rôle (instru/panseur) + niveau par poste (quotidien/crise/interdit)
- Chirurgiens : issus DB&M + préférences personnel en crise
- Paramètres : durée pause 30 min, créneau nominal, créneau dégradé max

### 7.2 Saisie du jour

- Effectif présent : qui, catégorie (matin/journée/12h/soir/couloir)
- Affectation initiale : agent → poste → salle
- Chirurgien par salle
- État salles : occupée / pause possible
- → Diagnostic immédiat du moteur

### 7.3 Mode automatique

- Calcul du plan optimal (C1→C9)
- Qualification de l'état résultant
- Détail de chaque créneau de 30 min
- Signalement des affectations crise + chirurgien
- Proposition de pattern connu si config reconnue

### 7.4 Mode validation

- Le cadre saisit son plan manuellement
- Vérification C1→C9
- Retour : conforme / dégradé (détail) / violation (détail)

### 7.5 Mode simulation

- Tester sans enregistrer
- Scénarios : retrait d'un couloir, refus chirurgien, ajout agent soir, etc.

### 7.6 Mémorisation de patterns

- Plan validé + satisfaisant → sauvegardé
- Pattern = {nb couloirs, nb soir, nb matin, nb journée, nb 12h, plan, état résultant}
- Config similaire → proposition automatique
- Scoring : nb utilisations, taux quotidien vs dégradé vs crise

### 7.7 Préférences agents (facultatif POC)

- Créneau préféré (tôt/tard)
- Pris en compte si possible sans violer C1→C9
- Non satisfaite = signalée, pas bloquante

### 7.8 Sorties visuelles

- **Timeline** : axe temps (11h30→13h30), lignes agents, blocs colorés par état
- **Vue salles** : 4 colonnes, instru/circu/chirurgien à chaque instant
- **Alertes** : violations, crise, affectations exceptionnelles
- **Vue agent** : message individuel ("Tu manges à 12h00, tu remplaces Marie salle 07 circu 12h30-13h00")
- **Dashboard stats** : tous indicateurs section 9

### 7.9 Historique & Audit

Chaque plan exécuté archivé : date, effectif, plan, état, anomalies.

---

## 8. CAS LIMITES

| # | Cas | Comportement |
|---|---|---|
| L1 | Intervention déborde au-delà de 13h | Salle occupée → agent ne part pas → recalcul train |
| L2 | Agent soir en retard | Recalcul effectif réel. Possible bascule d'état. |
| L3 | Doublure requise | Poste d'origine vacant → cascade couverture |
| L4 | 2 agents matin même salle | 2 postes libérés à 13h → 2 remplaçants simultanés |
| L5 | 0 couloir + 0 soir | Pause de salle inévitable. Signalé à la saisie. Tracé et statistiqué. |

---

## 9. STATISTIQUES ET AUDIT

Tout est statistiqué, audité, affichable.

| Indicateur | Granularité |
|---|---|
| Répartition états | Jour, semaine, mois |
| Pauses programme op | Salle, durée, cause, fréquence |
| Affectations crise | Agent, chirurgien, fréquence |
| Nombre couloirs/jour | Corrélation avec état |
| Nombre soir/jour | Corrélation avec état |
| Préférences satisfaites | Par agent |
| Patterns utilisés | Fréquence, taux succès |
| Temps moyen en dégradé | Tendance |

---

## 10. DONNÉES PERSISTANTES

| Donnée | Persistance | Modifiable par |
|---|---|---|
| Salles & postes | Permanente | Créateur, Admin |
| Agents & rôles | Permanente (ref DB&M) | Créateur, Admin |
| Chirurgiens & préférences | Permanente (ref DB&M) | Créateur, Admin |
| Paramètres créneau | Permanente | Créateur, Admin |
| Effectif du jour | Quotidienne | Créateur, Admin, Membres |
| Plans de rotation | Historique | Moteur, Créateur, Admin |
| Patterns identifiés | Permanente (scoring) | Moteur |
| Stats & audit | Historique | Moteur |

**Créateur** = plein droit sur tout, sans restriction.

---

## 11. HORS SCOPE POC

- Autres secteurs que ortho-neuro
- IADE, AS, brancardiers
- Gardes / astreintes / nuit
- Connexion OPTIM
- Capacité du self

Intégration DB&M = prévue après stabilisation, pas hors scope.
