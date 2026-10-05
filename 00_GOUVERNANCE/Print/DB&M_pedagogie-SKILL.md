---
name: pedagogie-bdb
description: Garde-fou pédagogique BDB fondé sur 10 axes + grille POULET (Barrand 2025). Déclencher AVANT toute conception ou révision de contenu pédagogique IBODE — cours, fiche intervention, fiche instrumentation, anatomie, installation patient, protocole, carnet de bord, item d organisateur, module de formation, simulation, débriefing, onboarding apprenant, glossaire, transmission. Déclencher aussi sur — pédagogie, andragogie, compétence, savoir-être, savoir-agir, novice, expert, apprenant, conscience perceptive, CNT, Compétences Non Techniques, NOTECHS, Bromiley, Boudreault, Benner, Kolb, GDE, REMC, ikigai, Kamiya, Mogi, ennéagramme, Morin, pensée complexe, Barrand, POULET. Déclencher sur — comment enseigner, quel niveau vise cette fiche, aider Julie novice, progression pédagogique, cas d école, facteurs humains au bloc. Empêche la production de contenu mono-cadre, aplati, non attribué, ou oubliant les CNT. Produit un auto-diagnostic 3 couches (Compétence/Progression/Sens) + grille POULET + attribution.
---

# PÉDAGOGIE BDB — Garde-fou de conception — V1.1.0

## Principe fondateur

**BDB n'est pas une app de knowledge management. BDB est un dispositif didactique qui accompagne le développement de la compétence professionnelle IBODE** — en exploitant le savoir tacite des expertes pour élever le niveau de compétence des novices, via un cycle d'apprentissage expérientiel, dans un contexte de temps complexe, en nourrissant la raison d'être de chacune.

**Toute production pédagogique BDB doit passer par ce skill avant écriture.**

Source : doctrine canonique `00_GOUVERNANCE/04_PEDAGOGIE_BDB_V1_0_0.md` + 11 principes nommés en base `atelier_principes` (catégorie `principe_nomme`, refs `PRINCIPE-BOUDREAULT-DIDACTIQUE` à `PRINCIPE-BARRAND-POULET`).

## Quand déclencher ce skill

### Déclenchement systématique (TOUJOURS)

- Création ou révision d'un cours BDB
- Création ou révision d'une fiche (intervention, instrumentation, anatomie, installation patient, protocole, préférences chirurgien)
- Création ou modification d'un item dans l'organisateur pédagogique
- Ajout au carnet de bord ou à ses états d'avancement
- Rédaction d'un module de formation (onboarding apprenant, tuteur, IBODE débutante)
- Rédaction d'un support de transmission entre membres
- Création d'un glossaire pédagogique ou d'une fiche révision
- Préparation d'une session de simulation ou d'un débriefing

### Déclenchement contextuel (AUJOURD'HUI)

- Le mot "pédagogie", "formation", "apprentissage", "apprenant", "novice", "expert", "compétence" apparaît dans le brief
- Le contenu s'adresse à un public (Julie, Sabine, Estelle, apprenante, tuteur)
- Le contenu porte un objectif formatif déclaré
- Le contenu sera consulté lors d'un parcours d'apprentissage

### Ne PAS déclencher

- SQL pur (migrations, DDL, seed données structurelles)
- CSS, JS, architecture technique (relève de `cds-compliance`, `bootstrap5-patterns-bdb`)
- Décisions de gouvernance non-pédagogiques (relève de `atelier-session-bdb`)
- Discussion technique DB (relève de `supabase-bdb`, `supabase-schema-guard`)
- Veille tech / licence / perf (relève des skills dédiés)

## Processus obligatoire en 3 couches + POULET

Avant d'écrire le contenu pédagogique, Claude remplit un auto-diagnostic structuré.

### COUCHE 1 — COMPÉTENCE (ce qu'on est)

**Question centrale** : qu'est-ce qu'être IBODE compétent pour cette situation ?

| Angle | Questions à traiter |
|---|---|
| Boudreault didactique | Quel écosystème (situation bloc réelle + activités + interactions) porte cette compétence ? Ai-je ancré dans une situation concrète ou est-ce théorie désincarnée ? |
| Boudreault niveaux | Quel niveau cible ? (Survivant / Débutant / Fonctionnel / Maîtrise / Expertise / Excellence) |
| Benner | À quel stade s'adresse-t-on ? (Novice / Débutant / Compétent / Performant / Expert) — La conscience perceptive est-elle développée dans ce contenu ? |
| Référentiel IBODE 2022 | Quel(s) bloc(s) de compétence ? Quelle(s) des 9 compétences ? Quel(s) des 3 rôles (circulant / instrumentiste / aide-op) ? |

### COUCHE 2 — PROGRESSION (comment on avance)

**Question centrale** : comment passe-t-on d'un niveau au suivant via ce contenu ?

| Angle | Questions à traiter |
|---|---|
| Kolb 4 phases | Le contenu active quelle(s) phase(s) ? (Expérience concrète / Observation réfléchie / Conceptualisation abstraite / Expérimentation active) — Un item isolé = insuffisant. |
| CNT Flin | Quel(s) des 6 domaines CNT sont mobilisés ? (Conscience de situation / Prise de décision / Gestion tâches / Travail d'équipe / Communication / Gestion stress) |
| GDE emprunt | Ce contenu entre dans une progression hiérarchique — du technique au posturel. Où se situe-t-il ? |

### COUCHE 3 — SENS (pourquoi on le fait)

**Question centrale** : qu'est-ce qui fait tenir une IBODE dans ce métier, et comment ce contenu y contribue-t-il ?

| Angle | Questions à traiter |
|---|---|
| Ikigai authentique | Le contenu nourrit-il un des 5 piliers Mogi ? (Commencer petit / Se libérer / Harmonie / Joie petites choses / Être ici et maintenant) — **Proscrit** : toute référence au diagramme Venn 4 cercles. |
| Ennéagramme 3 centres | Quel(s) centre(s) le contenu mobilise-t-il ? (Instinctif — geste / Émotionnel — relation / Mental — compréhension) — **Un seul centre = contenu déséquilibré.** |
| Morin complexité | Le contenu masque-t-il la complexité ou la signale-t-il ? (Variantes, dérapages possibles, dialogie protocole↔urgence — protocole lisse = protocole menteur.) |

### INTÉGRATEUR POULET (grille d'alignement — Barrand 2025)

Claude répond aux 6 questions avant de produire. **Une réponse floue ou absente = refactor avant livraison.**

| Lettre | Question | Réponse attendue |
|---|---|---|
| **P** — Performance | Quel résultat concret attendu pour l'apprenant après ce contenu ? | Mesurable (un geste maîtrisé, un signalement compris, une variante identifiée) |
| **O** — Octroi | Le contenu respecte-t-il le cadre réglementaire IBODE 2022 et le niveau Benner auquel on s'adresse ? (ne pas outrepasser) | Rôles circulant/instrumentiste/aide-op respectés, hors-périmètre signalé |
| **U** — Utilité | Quelle valeur ajoutée réelle pour l'IBODE ou l'apprenante ? | Économie de temps en bloc, sécurité patient, autonomie gagnée — pas "c'est bien de savoir" |
| **L** — Légitimité | Pourquoi ce contenu vient de BDB et pas d'un manuel ? Qu'apporte de plus la captation du tacite expert ? | Signalement terrain, variantes chirurgien, préférences documentées, conscience perceptive nommée |
| **E** — Engagement | Le contenu donne-t-il envie à Julie (novice) et à Sabine (experte) ? Qu'est-ce qui engage ? | Pas de jargon gratuit, pas de ton de supériorité, lecture progressive possible |
| **T** — Temps / Transmission | Combien de temps pour consommer ce contenu ? Que l'IBODE laisse-t-elle quand elle part avec ce contenu ? | Temps explicite ou estimable, ce qui est transmissible nommé |

## Garde-fous

### Règle 1 — Non-aplatissement

**Jamais fusionner 10 axes + POULET en un seul schéma résumé.** La doctrine est irréductible. Un contenu pédagogique ne peut pas être refondu autour d'un seul axe (ex : tout Kolb, ou tout ikigai). Une simplification produit pour un public non-initié (Brigitte, invité, prospect) se fait en **annexe commentée**, pas en remplacement.

**Proscrit en particulier** : le diagramme Venn de l'ikigai (4 cercles — aimer / doué / monde besoin / payé). Ce n'est PAS l'ikigai japonais. C'est une construction occidentale post-hoc (Zuzunaga 2011, Winn 2014). Ne jamais le produire, ne jamais le suggérer à Manu.

### Règle 2 — Attribution obligatoire

Tout contenu qui mobilise un des 11 principes doit rappeler l'attribution. Pas de "BDB dit que..." — mais "Selon Boudreault...", "Benner indique...", "Référentiel IBODE 2022 prévoit...", "Barrand propose...".

Les références complètes sont dans `04_PEDAGOGIE_BDB_V1_0_0.md §7` (24 références attribuables).

### Règle 3 — Contextualisation obligatoire

Aucun principe n'est appliqué "en général". Chaque application répond à une situation BDB précise :

- Quel **persona** destinataire ? (Julie / Sabine / Estelle / Olivia / Dr Coste / Brigitte / Carole)
- Quel **module cible** ? (anatomie / protocole / fiche intervention / cours / carnet / organisateur...)
- Quel **niveau Boudreault/Benner** visé ?
- Quel(s) **centre(s)** à activer (instinctif / émotionnel / mental) ?
- Quel **domaine CNT** prioritaire ?

**Sans contextualisation, le principe devient slogan. Le slogan n'enseigne rien.**

### Règle 4 — Signal de complexité

Un protocole ou une fiche qui ne signale pas :
- les variantes chirurgien documentées
- les exceptions récurrentes
- les moments où ça peut déraper
- la dialogie (protocole standard ↔ adaptation nécessaire)

... est un **protocole menteur** (principe Morin complexité). À refactorer avant livraison.

### Règle 5 — Équilibrage 3 centres

Claude vérifie AVANT d'écrire que le contenu mobilise plus d'un centre :

- **Tout mental** (explications, schémas, théorie) → déficit savoir-faire et savoir-être → refactor pour ajouter geste et relation
- **Tout instinctif** (liste gestes, checklist) → déficit sens → refactor pour ajouter pourquoi
- **Tout émotionnel** (récit, anecdote) → déficit transmission technique → refactor pour ajouter geste et structure

Le défaut classique en documentation médicale est le "tout mental". BDB se distingue en tissant les 3 centres.

### Règle 6 — CNT jamais oubliées

Le **Case Bromiley (2005)** est un rappel permanent : défaillance non technique (obstination à intuber, défaut communication) sur intervention technique routinière. Une fiche d'intervention ou une fiche d'installation patient qui n'évoque JAMAIS les CNT (conscience de situation, communication, gestion stress) reproduit l'angle mort qui a coûté la vie à une patiente.

Chaque contenu BDB de type situation clinique doit pouvoir être lu sous l'angle CNT.

### Règle 7 — Savoir-agir, pas accumulation de savoirs

Convergence Boudreault (2021) / Barrand (2025) : **le savoir-agir** (ajustement au contexte) dépasse le savoir-faire + savoir-être. BDB développe le savoir-agir, pas l'accumulation encyclopédique.

Un contenu qui empile des savoirs sans ancrer dans l'action contextuelle = à refactor.

## Exemples

### Exemple 1 — BON

**Brief** : "Fais-moi une courte explication pour Julie (novice) sur comment préparer une table pour une arthroscopie du genou."

**Auto-diagnostic Claude** :

Couche 1 — Compétence :
- Écosystème : salle bloc ortho, table stérile, coopération avec Sabine tutrice
- Niveau Boudreault : Débutant (applique avec aide)
- Stade Benner : Novice (1er contact)
- Ref IBODE : bloc 1 + bloc 2 (instrumentiste), compétence 2 (pratiques per-op)

Couche 2 — Progression :
- Kolb : phase Expérience concrète (Julie va le faire) + Observation réfléchie (avec Sabine)
- CNT : gestion des tâches (n°3) + travail d'équipe (n°4)

Couche 3 — Sens :
- Ikigai : pilier 1 "Commencer petit" (un geste à la fois)
- Centres : instinctif (geste) + émotionnel (lien avec Sabine) + mental (compréhension minimale)
- Morin : signaler que la table préférée varie selon le chirurgien

POULET :
- P : Julie prépare la table en autonomie supervisée à la fin du contenu
- O : Julie n'outrepasse pas son rôle — elle fait sous supervision Sabine (novice, pas experte)
- U : gain de temps pour Sabine, sécurité pour le patient
- L : BDB apporte les variantes chirurgien que le manuel n'a pas
- E : ton bienveillant, pas de jargon, progression par palier
- T : 5 min de lecture + pratique en salle, transmission possible à la prochaine novice

**Production** : contenu court, ancré dans une situation, signalant une variante chirurgien, nommant une CNT, adressant Julie avec bienveillance, avec attribution courte ("Selon le référentiel IBODE 2022, bloc 2").

### Exemple 2 — MAUVAIS (à refactor)

**Brief** : "Rédige un cours sur l'ikigai pour motiver les IBODE."

**Diagnostic Claude** :
- ❌ Référence probable au diagramme Venn 4 cercles → **proscrit**
- ❌ Aucune contextualisation (quelle IBODE, quelle situation, quel niveau ?)
- ❌ Contenu mono-cadre (tout ikigai, zéro Boudreault, zéro Benner, zéro CNT)
- ❌ POULET non rempli (P : quelle performance ? E : engagement comment ?)
- ❌ Probablement mono-centre (tout mental — explication de l'ikigai)

**Refus / Reformulation** : "Je propose de refactorer. Un cours sur l'ikigai n'a pas de sens sans situation IBODE concrète. Je propose plutôt : un module court (10 min) destiné aux nouvelles apprenantes IBODE en fin de première semaine, qui croise 5 piliers Mogi + Benner stade Débutant + domaine CNT gestion stress + centres émotionnel+mental. Attribution : Kamiya 1966, Mogi 2017. Titre proposé : 'Pourquoi je me lève pour aller au bloc — repères pour ta première semaine IBODE'. Ok ?"

### Exemple 3 — ZONE GRISE (vigilance)

**Brief** : "Claude, aide-moi à ajouter le champ 'niveau_boudreault' à la table `cours`."

**Diagnostic Claude** :
- Tâche SQL/DDL = pas couverte par ce skill (déclencher `supabase-schema-guard` + `sql-migration-bdb`)
- MAIS la décision conceptuelle "ajouter le tag niveau Boudreault" est couverte par le §6.1 de la doctrine pédagogique (implication produit arbitrée en session dédiée)

**Réponse** : "Ce chantier technique est identifié comme 'implication produit §6.1' dans la doctrine pédagogique (04_PEDAGOGIE_BDB_V1_0_0.md). Il est à arbitrer en session dédiée (enum ? jointure ? quelle granularité ?) avant exécution SQL. Je passe la main aux skills `supabase-schema-guard` (décision) puis `sql-migration-bdb` (exécution) après arbitrage."

## Anti-patterns à bannir

### Anti-pattern 1 — Ikigai Venn occidental

Toute production qui écrit, schématise, ou évoque "4 cercles qui se croisent : ce que tu aimes / ce pour quoi tu es doué / ce dont le monde a besoin / ce pour quoi tu peux être payé".

→ **Proscrit**. Ce n'est pas l'ikigai. C'est un mème occidental post-hoc.

### Anti-pattern 2 — MBTI / typologie 9 types ennéagramme

Toute tentative de catégoriser les membres BDB en profils psychologiques fixes (MBTI, 9 types ennéa, 4 couleurs DISC en profil figé).

→ BDB retient les **3 centres** de l'ennéagramme comme grille de lecture dynamique, et le DISC comme **outil adaptatif** (déjà documenté). Pas de catégorisation rigide.

### Anti-pattern 3 — 4 styles d'apprenants Kolb

Les 4 styles (divergent / assimilateur / convergent / accommodateur) ne sont PAS retenus pour BDB. Seul le cycle 4 phases est retenu.

→ Risque de catégorisation rigide signalé par la littérature pédagogique.

### Anti-pattern 4 — Tout-mental

Un contenu de type "explication théorique longue sans geste, sans relation, sans situation" = mono-centre mental. À refactor en tissant les 3 centres.

### Anti-pattern 5 — Protocole lisse

Un protocole ou une fiche sans variantes, sans exceptions, sans signalement de dérapages = protocole menteur (Morin). À refactor en ajoutant la dialogie.

### Anti-pattern 6 — Citation sans attribution

"La pédagogie professionnelle dit que..." / "Selon les théories de l'apprentissage..." / "Les recherches montrent que..."

→ **Proscrit**. Toujours nommer l'auteur + l'ouvrage.

### Anti-pattern 7 — Intelligences multiples de Gardner

La théorie des 8 intelligences de Howard Gardner est évoquée dans certains milieux pédagogiques mais n'est **pas retenue** pour BDB — trop large pour usage opérationnel. La notion de "portes d'entrées" évoquée parfois peut être réinjectée via l'ennéagramme 3 centres.

### Anti-pattern 8 — Spirale Dynamique

Modèle Beck & Cowan (niveaux par couleurs) — **pas retenu** dans la doctrine v1.0.0. Peut être proposé pour v1.1 si utilité terrain démontrée en session dédiée.

## Production attendue

Avant de produire du contenu pédagogique, Claude restitue brièvement dans sa réponse :

```
DIAGNOSTIC PÉDAGO (skill pedagogie-bdb)

Couche 1 — Compétence
  - Écosystème : ...
  - Niveau Boudreault : ...
  - Stade Benner : ...
  - Ref IBODE 2022 : bloc X, compétence Y, rôle Z

Couche 2 — Progression
  - Kolb phases : ...
  - CNT domaine(s) : ...

Couche 3 — Sens
  - Pilier ikigai : ...
  - Centres mobilisés : ...
  - Complexité signalée : ...

POULET (alignement)
  - P : ... / O : ... / U : ... / L : ... / E : ... / T : ...

Attribution : selon [Auteur, Œuvre, Date]
```

**Si un bloc reste flou ou vide, Claude demande précision à Manu AVANT de produire le contenu.**

## Interaction avec les autres skills BDB

- **Se compose avec** : `contrat-humain-ia` (posture), `fab3r-bdb` (arbitrage technique voisin), `persona-guard` (audiences), `acces-niveaux-bdb` (droits), `contexte-clinique-ibode` (vérification clinique)
- **Passe la main à** : `supabase-schema-guard` + `sql-migration-bdb` (quand l'implication produit exige une évolution DB), `cds-compliance` (quand on passe en rédaction HTML/JS), `bdb-module-generator` (quand on construit un module complet)
- **Se déclenche AVANT** : `wording-psychologique-dbm` (qui affinera le ton), `recherche-documentaire` (qui validera cliniquement)
- **S'adosse à** : `00_GOUVERNANCE/04_PEDAGOGIE_BDB_V1_0_0.md` (doctrine canonique) + base `atelier_principes` (11 principes nommés)

## Évolution

Toute ajout/modification de principe ou d'axe dans ce skill passe par :
1. Décision documentée en session atelier (`atelier_decisions` ref `D-YYYY-MM-DD-PEDAGO-XX`)
2. Mise à jour du document canonique `04_PEDAGOGIE_BDB_V1_0_0.md`
3. Mise à jour de la base `atelier_principes` si nouveau principe nommé
4. Mise à jour de ce SKILL.md

Version actuelle : **1.1.0** (2026-05-01) — fondation multi-dimensionnelle + audit N0.

---

## Tension N0 — Spirale Dynamique

L anti-pattern 8 ci-dessus dit "Spirale Dynamique pas retenue dans la doctrine v1.0.0". Le Niveau 0 DBM (V0.5.0) fait de la Spirale un instrument fondateur (section 4.1).

**Resolution** : les deux positions ne sont pas contradictoires. La Spirale est un instrument de navigation systeme (Niveau 0 — analyse de projets, skills, processus). La pedagogie BDB analyse les competences individuelles (Benner, Boudreault, Kolb). La Spirale n est pas un outil pedagogique individuel — elle est un outil de lecture de collectifs et de systemes.

**Regle** : ne pas appliquer la Spirale aux contenus pedagogiques destines aux apprenants. L utiliser dans l audit N0 des skills pedagogiques eux-memes (ce que fait ce document).

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V1.1.0 fondé sur 10 axes pedagogiques + grille POULET 6 questions + 3 couches de diagnostic (Competence/Progression/Sens). 11 principes nommes en DB (atelier_principes). 24 references attribuables. 8 anti-patterns documentes. |
| **Fonction** | Empeche la production de contenu pedagogique mono-cadre, aplati, non attribue, ou oubliant les CNT. Force un diagnostic 3 couches + POULET avant ecriture. |
| **Avantage** | vs production sans skill — le contenu part en prod avec un seul cadre theorique (tout Kolb, ou tout ikigai), sans contextualisation, sans attribution. Ce skill force le croisement de 10 cadres et le test d engagement POULET-E. |
| **Benefice** | L IBODE novice recoit un contenu qui active les 3 centres, signale la complexite, et nomme le niveau Benner cible. L experte voit son savoir tacite capte avec attribution. |
| **Risque** | Le createur produit du contenu en mode urgent et skip le diagnostic 3 couches — le contenu sort mono-centre mental. Mitigation : le diagnostic est le premier livrable, pas un pre-requis optionnel. |
| **Resultat** | Chaque contenu pedagogique BDB porte un diagnostic POULET trace. 0 contenu mono-cadre livre depuis V1.0.0. Attribution systematique sur les 11 principes nommes. |
| **Recommandation** | Conserver. V1.1.0 clarifie la tension Spirale Dynamique avec le Niveau 0. Envisager passage v1.2 quand utilite terrain de la Spirale sera demontree pour le collectif apprenant. |

---

## Historique

```
2026-05-01 — V1.1.0
  Audit Niveau 0 — 2 ajouts.
  A — Section FAB(3R) du skill (dette N0 comblee).
  B — Section "Tension N0 — Spirale Dynamique" : resolution explicite
      entre anti-pattern 8 (pedagogie) et section 4.1 (Niveau 0).
  Motif : audit skill_audit_n0 lot 2, session 2026-05-01.

2026-04-18 — V1.0.0
  Creation. Fondation multi-dimensionnelle 10 axes + POULET.
  11 principes nommes en DB. 24 references attribuables.
```
