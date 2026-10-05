# Glossaire — POC Rotation Repas Bloc

---

## TERMES MÉTIER

| Terme | Définition |
|---|---|
| **Bloc opératoire** | Ensemble des salles d'opération et zones associées (couloir, sas). |
| **Salle** | Une salle d'opération identifiée (05, 06, 07, 08 pour le POC). |
| **Secteur** | Regroupement fonctionnel de salles. POC = ortho-neuro. |
| **Instrumentiste (instru)** | Agent stérile au champ opératoire. Prépare et passe les instruments au chirurgien. Poste critique. |
| **Circulant(e) (circu)** | Agent non stérile en salle. Gère l'approvisionnement, la traçabilité, la communication. Poste critique. |
| **Panseur** | Synonyme historique de circulant dans certains blocs. Rôle identique. |
| **Doublure** | Poste exceptionnel : un 3e agent appelé au champ ou en salle pour une intervention complexe. Rend indisponible son poste d'origine. |
| **Couloir** | Agent non affecté à une salle. Disponible immédiatement pour remplacer n'importe quel poste dans sa compétence. Variable d'ajustement du petit train. |
| **IBODE** | Infirmier(ère) de Bloc Opératoire Diplômé(e) d'État. Formation spécialisée 2 ans post-IDE. |
| **IDE** | Infirmier(ère) Diplômé(e) d'État. Peut exercer au bloc sous conditions (mesures transitoires, faisant fonction). |
| **Chirurgien** | Médecin opérateur. Dans le POC : ses préférences de personnel impactent les affectations en crise. |
| **Cadre de bloc** | Responsable de l'organisation quotidienne. Utilisateur principal de l'app. |
| **Self** | Restaurant du personnel hospitalier. Créneau d'ouverture = contrainte externe de la fenêtre repas. |

---

## TERMES APPLICATION

| Terme | Définition |
|---|---|
| **Petit train** | Rotation en cascade des agents pour la pause repas. Agent A part → remplacé par B → B part → remplacé par C ou A revenu. |
| **Fenêtre repas** | Créneau pendant lequel les pauses sont organisées. Nominale : 12h-13h. Dégradée max : 11h30-13h30. |
| **Créneau** | Bloc de 30 minutes = unité élémentaire du petit train. |
| **Plan de rotation** | Séquence ordonnée de remplacements : qui remplace qui, quand, où. |
| **Pattern** | Plan de rotation mémorisé et associé à une signature d'effectif. Réutilisable quand la même config se présente. |
| **Signature (effectif)** | Empreinte d'un effectif : nb couloirs, nb soir, nb matin, nb journée, nb 12h, nb salles occupées. Sert à matcher les patterns. |
| **Mouvement** | Unité élémentaire du plan : 1 agent part manger, 1 remplaçant prend son poste, pendant 1 créneau de 30 min. |
| **Diagnostic** | Qualification immédiate de la situation dès la saisie de l'effectif, AVANT calcul du plan. |
| **Pause de salle** | Interruption du programme opératoire d'une salle pour permettre la rotation. Cas de crise. Toujours tracée. |

---

## ÉTATS

| État | Symbole | Signification |
|---|---|---|
| **Quotidien** | ✅ | Nominal. Fenêtre 12h-13h respectée. |
| **Dégradé léger** | ⚠️ | Fenêtre décalée d'un côté (11h30-13h ou 12h-13h30). |
| **Dégradé complet** | ⚠️⚠️ | Fenêtre élargie max (11h30-13h30). |
| **Crise** | 🔴 | Agent(s) sans pause au self OU pause de salle imposée. |
| **Bloqué** | ⛔ | Aucune solution possible avec l'effectif présent. |

---

## NIVEAUX DE COMPÉTENCE

| Niveau | Signification |
|---|---|
| **Quotidien** | L'agent est pleinement compétent. Affectation normale. |
| **Crise** | L'agent peut dépanner en l'absence d'alternative quotidien. Chaque utilisation est signalée, tracée, statistiquée. Soumis à l'accord du chirurgien pour le poste instru. |
| **Interdit** | Jamais. Même en crise. Le moteur ne propose jamais cette affectation. |

---

## CATÉGORIES D'AGENTS

| Catégorie | Horaire | Mange au self ? | Remplaçant ? |
|---|---|---|---|
| **Matin** | ~7h → 13h | Non (mange après 13h) | Non. Libère son poste à 13h. |
| **Journée** | ~7h → 16h30 | Oui | Oui (après avoir mangé, ou avant si mange tard) |
| **12h** | ~7h → 19h | Oui | Oui (après avoir mangé, ou avant si mange tard) |
| **Soir** | 12h → 19h30 | Non (a déjà mangé) | Oui dès 12h. Acteur clé. |
| **Couloir** | Variable | Selon catégorie horaire | Oui immédiatement. Acteur prioritaire. |

---

## DROITS

| Rôle | Description |
|---|---|
| **Créateur** | Plein droit sur tout. Sans restriction. |
| **Admin** | Gère la configuration, valide les plans, accède aux stats. |
| **Membre** | Saisit l'effectif, consulte les plans et sa vue agent. |
| **Invité** | Consultation seule. |
