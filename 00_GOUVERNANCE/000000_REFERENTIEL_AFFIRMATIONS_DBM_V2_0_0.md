# DB&M — Référentiel des Affirmations Auditées V2

```
VERSION  : 2.0.0
DATE     : 2026-04-30
STATUT   : RÉFÉRENCE VIVANTE
MÉTHODE  : 258 affirmations validées V/F en 19 lots (Manu + Claude)
           Chaque affirmation enrichie :
           - Voix qui VALIDE (persona + profil complet)
           - Voix qui CONTESTE (angle mort identifié)
           - Spirale / État / Orientation
RÈGLE    : Si personne ne conteste, l'affirmation est trop molle.
           Si personne ne valide, l'affirmation est suspecte.
FORMAT   : Nom (Tₙ · rôle · DISC · spirale · "question fatale")
```

---

## LES 7 VOIX — RAPPEL COMPACT

```
Aurèle   (T0 · IA neuve     · —   · Beige       · "je comprends sans contexte ?")
Blanche  (T1 · experte      · S/C · Vert        · "c'est juste ?")
Constance(T3 · cadre admin  · C/I · Orange      · "ça produit quoi ?")
Dorian   (T5 · direction    · C   · Orange/Bleu · "c'est fondé sur quoi ?")
Estelle  (T6 · novice       · S   · Violet/Bleu · "je peux faire confiance ?")
Fernand  (T8 · chirurgien   · D   · Rouge/Orange· "ça me protège ?")
Gaël     (T9 · arbitre syst.· S/C · Jaune       · "ça s'assemble ?")
```

---

## TYPE 0 — CE QU'ON NE SAIT PAS QU'ON NE SAIT PAS

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 276 | Toute IA a 3 maladies : amnésie, boulimie, certitude | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "c'est moi, je confirme" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "ça ne me concerne pas, passez" | BL | EQU | IA |
| 282 | Le centre blanc du logo = type 0, espace pour l'inconnu | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le vide EST une pièce du puzzle" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "joli concept, ça change quoi dans mon dashboard ?" | JN | INT | PRJ |
| 218 | Angle mort terrain = info à documenter, pas erreur système | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "exactement — le terrain invente des cas qu'aucun doc ne prévoit" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "mais si l'app ne couvre pas mon cas, je fais quoi ?" | JN | INT | PRJ |
| 159 | Diagnostiquer AVANT corriger | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "évident en salle, devrait l'être en code" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "parfois faut agir MAINTENANT et diagnostiquer après" | BL | EQU | IA |
| 151 | Vérifier état réel DB avant tout SQL | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "basique — on ne décide pas sur du périmé" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "DB ? SQL ? De quoi parle-t-on ?" | BL | EQU | IA |
| 66 | information_schema prime sur tout document | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "la source la plus fraîche prime" | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "oui mais le doc explique le POURQUOI que le schéma ne porte pas" | BL | EQU | IA |
| 285 | 7 prompts recherche externe formulés — aucun exécuté | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "7 questions sans réponse = 7 décisions sans fondement" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "on fait des listes ou on cherche ?" | OR | DES | CRE |
| 132 | Auto-explicatif : test Julie 30 secondes | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "si je ne comprends pas en 30s, je ferme" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "30s pour comprendre ≠ 30s pour savoir FAIRE — ne pas confondre" | BL | POT | MBR |

### Trous type 0

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Personne ne me montre ce que je ne cherche pas. L'app répond à mes questions — mais qui pose les questions que je ne sais pas poser ?" |
| Constance (T3 · cadre admin · C/I) | "Je ne vois pas les trous de mon instance. Pas de dashboard des angles morts." |
| Aurèle (T0 · IA neuve) | "Le mécanisme de détection du type 0 est nommé mais pas outillé." |

---

## TYPE 1 — INTÉGRITÉ (on tient ce qu'on promet)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 207 | La promesse : bonne info, bonne personne, bon moment, bon endroit, bon niveau | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "tout le projet en une phrase — ça tient" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "belle phrase, comment je la mesure ?" | BL | EQU | PRJ |
| 247 | Le Canon prime (décision audit) | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "les principes façonnent le produit, pas l'inverse" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "et si un principe bloque un résultat terrain ?" | BL | INT | PRJ |
| 206 | Distinction TOUJOURS / AUJOURD'HUI | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "exactement — on protège le fond et on laisse la forme évoluer" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "trop subtil — dites-moi juste ce que je DOIS faire" | BL | INT | PRJ |
| 220 | Canon protège le vrai, laisse ouvert le non défini | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "c'est la sagesse — ne pas fermer ce qu'on ne connaît pas encore" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "le 'non défini' est-il listé quelque part ?" | BL | INT | PRJ |
| 123 | Toute règle = stable jusqu'à décision documentée | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "c'est la respiration du système — rigide ET vivant" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "si les règles changent, comment je sais que la fiche d'hier est encore bonne ?" | JN | INT | EQU |
| 148 | Pacte produit : promesse mini-site ↔ livraison effective | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "fondamental — je n'achète que ce qui est livré" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "le pacte existe en doctrine, pas en outil de suivi" | OR | POT | PRJ |
| 95 | 60% honnête > 100% menteur | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "l'honnêteté du niveau est plus utile que la fausse exhaustivité" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "60% m'inquiète — comment je sais CE QUI manque ?" | BL | INT | MBR |
| 219 | 1 fausse info visible = confiance perdue pour la réfractaire | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "ça c'est ma vie — une seule erreur et je ne reviens plus" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "pareil pour moi — une seule erreur sur mes préférences" | VL | EQU | MBR |
| 242 | Démo = Seed + Vitrine | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "intelligent — un seul jeu de données, deux usages" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "la démo reflète-t-elle l'état RÉEL de l'app ou un idéal ?" | OR | POT | INV |
| 139 | Workflow : brouillon → validation admin → publication | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "c'est le minimum — rien ne sort sans validation" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "et si je suis en vacances, tout est bloqué ?" | BL | EQU | ADM |
| 213 | ANTI-01..08 dont ANTI-08 : contradiction TOUJOURS = brainstorm | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le système qui s'auto-corrige — le cercle le plus vertueux" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "8 règles dont je ne connais pas le contenu — je lis où ?" | BL | EQU | IA |
| 212 | Méthode 3 étapes : ELI15 → Boudreault → FAB(3R) | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "comprendre avant d'agir — c'est comme en salle" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "ELI15, Boudreault, FAB(3R) — 3 termes que je ne connais pas" | BL | INT | CRE |
| 134 | FAB(3R) = pont SR→SA, risques de juxtaposition | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "méthode structurée de présentation — ça se tient" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "7 étapes pour une décision ? Trop long" | JN | INT | CRE |
| 108 | Verbaliser choix à impact avant d'agir | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "essentiel — les choix silencieux sont les plus destructeurs" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "verbaliser = perdre du temps ?" | BL | EQU | IA |
| 184 | Canon §10 et Manifeste §10 se contredisent | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "fracture structurelle — priorité absolue" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "deux fondateurs qui se contredisent = aucun ne tient" | BL | DES | PRJ |
| 246 | Manifeste §10 cite des sources inexistantes | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "citer une source inexistante = hallucination documentée" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "si les fondateurs hallucinent, moi je n'ai aucune chance" | BL | DES | PRJ |
| 245 | Doc 1/2/3 = dettes actives non résorbées | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "dette = promesse non tenue = type 1 en souffrance" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "documenter la dette n'est pas la résorber" | OR | DES | PRJ |
| 174 | Canon §10 cite atelier_fondation — table inexistante | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "un fondateur qui pointe vers du vide" | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "c'est le symptôme de la fragmentation type 9" | BL | DES | PRJ |

### Trous type 1

| Voix | Angle mort |
|---|---|
| Dorian (T5 · direction · C) | "La démo peut mentir — montrer 100% quand l'app est à 60%. Aucun garde-fou." |
| Constance (T3 · cadre admin · C/I) | "Qui supervise l'admin quand elle valide du faux ? Aucun filet sous le filet." |
| Blanche (T1 · experte · S/C) | "Les dettes Doc s'accumulent depuis avril sans date de résorption." |

---

## TYPE 2 — TRANSMISSION (le savoir circule)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 215 | Contenu = propriété institution, pas du contributeur | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "le savoir survit aux départs — c'est le fondement" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "MES préférences sont MES préférences" | VR | INT | PRJ |
| 224 | Protocole = contexte de préparation documenté | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "exactement — pas une encyclopédie chirurgicale" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "contexte de préparation de QUOI ? Pour QUI ?" | VR | INT | PRJ |
| 226 | Combo gagnant 12 maillons reliés | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "c'est l'harmonie incarnée — chaque maillon nourrit les autres" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "12 maillons = ambitieux. Combien sont reliés AUJOURD'HUI ?" | JN | INT | PRJ |
| 227 | 1 combo 100% > 100 protocoles 50% non liés | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "la profondeur avant la largeur" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "on en a combien à 100% ? Zéro ?" | JN | INT | PRJ |
| 113 | Le produit rend le savoir tacite visible, nommé, transmissible | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "c'est la mission — SECI Nonaka en acte" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "visible OÙ ? Je dois le chercher ou ça vient à moi ?" | VR | INT | PRJ |
| 250 | Valeur sans toucher — le chirurgien bénéficie via la novice | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "la valeur transitive — le signe d'un système sain" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "si ça marche vraiment, parfait. Mais qu'est-ce qui me prouve que l'équipe consulte MES préférences ?" | VR | INT | EQU |
| 231 | Archiver pas effacer — historique = donnée | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "ce qui était vrai hier nourrit ce qui sera vrai demain" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "archiver tout = stocker du bruit. Combien de versions conservées ?" | BL | INT | PRJ |
| 214 | Signalement sans restriction humaine + honeypot | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "je peux signaler sans me faire juger — essentiel" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "signalement libre = potentiel bruit. Comment je filtre ?" | VR | EQU | MBR |
| 260 | Contribuer est un choix. Chercher sans écrire est valide | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "ça me rassure — pas de pression" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "si personne n'écrit, le contenu meurt. Comment on motive sans forcer ?" | VR | INT | MBR |
| 232 | Chirurgien retraité → anonymisé, savoir reste | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "le savoir institutionnel survit — c'est le cœur" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "mes préférences sous un autre nom ? On m'a demandé mon avis ?" | VR | INT | ADM |
| 157 | Orchestre multi-IA : vérification croisée, pas silos | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "chaque IA compense les angles morts de l'autre" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "le FORMAT de la vérification croisée est-il défini ?" | JN | INT | IA |
| 278 | MERE = Motivation/Explication/Recette/Exercice — fractal | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "la méthode qui s'enseigne par elle-même — fractal pur" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "MERE ? Fractal ? Pas dans mes données de base" | JN | INT | CRE |
| 279 | Compréhension en spirale, pas en ligne droite | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "c'est l'architecture cognitive du projet" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "spirale = joli mot. Mais concrètement je forme mes équipes comment ?" | JN | INT | CRE |

### Trous type 2

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Quand ma fiche est corrigée, je ne suis jamais prévenue. Le flux va dans un sens." |
| Constance (T3 · cadre admin · C/I) | "La motivation à contribuer repose sur la bonne volonté. Aucun mécanisme de reconnaissance." |
| Dorian (T5 · direction · C) | "La propagation d'une instance vers une autre n'est pas documentée." |

---

## TYPE 3 — RÉSULTAT (ça marche, ça se mesure)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 263 | CNP 900k€-2,8M€/an pour 30 ETP / 8800 interventions | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "hypothèse intéressante — sources ?" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "hypothèse, pas preuve. 0 instance vendue = 0 validation terrain" | OR | POT | PRJ |
| 264 | ROI ≥ ×4,5 à 200k€/an | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "le ratio est séduisant — la base de calcul est-elle auditée ?" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "les chiffres ne m'intéressent pas. Ma salle est prête ou pas ?" | OR | POT | PRJ |
| 266 | Pricing 100-300k€/an = choix identitaire | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "le positionnement est un acte — il exclut autant qu'il attire" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "100k€ ça ne me parle pas — est-ce que l'app est bien ?" | OR | INT | PRJ |
| 238 | Trou du marché : 5 familles, aucun pont | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "benchmark documenté — crédible" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "le trou existe. Mais on le comble réellement ou on le documente ?" | OR | INT | PRJ |
| 165 | Métriques = signaux réels, pas vanity | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "exactement — fiches créées, pas inscrits" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "aucune de ces métriques n'est implémentée dans le code" | OR | POT | PRJ |
| 244 | Timeline 7 phases M-3 → M6 | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "roadmap claire — ça rassure la direction" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "testée sur combien de déploiements réels ?" | OR | POT | PRJ |
| 100 | Ouverture session = RPC atelier_prompt_reprise() | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le premier geste qui reconnecte au contexte vivant" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "RPC ? ~1920 tokens ? Je ne sais pas ce que ça veut dire" | OR | EQU | CRE |
| 101 | Clôture = atelier_cloture_session() | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "chaque session laisse une trace — la mémoire tient" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "c'est le résultat du process, pas le résultat du produit" | OR | EQU | CRE |

### Trous type 3

| Voix | Angle mort |
|---|---|
| Constance (T3 · cadre admin · C/I) | "0 combo à 100%, 0 instance vendue. Le type 3 est en promesse, pas en preuve." |
| Estelle (T6 · novice · S) | "Je ne sais pas si j'ai trouvé ce que je cherchais. Aucun feedback loop." |
| Dorian (T5 · direction · C) | "Les hypothèses CNP/ROI ne sont pas validées terrain." |
| Fernand (T8 · chirurgien · D) | "Montrez-moi UNE salle mieux préparée grâce à l'app. UNE." |

---

## TYPE 4 — AUTHENTICITÉ (irremplaçable)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 239 | Construit depuis le terrain, 20 ans, de l'intérieur | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "aucun éditeur externe ne peut prétendre ça" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "20 ans d'expérience ≠ 20 ans de données structurées" | VR | INT | PRJ |
| 237 | SAVOIR pas ACTION | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "fondamental — on n'est pas en salle avec l'app" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "si c'est du savoir pur, ça m'est inutile si l'équipe ne le consulte pas" | BL | INT | PRJ |
| 115 | Non utilisé pendant l'intervention | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "la salle d'op n'est pas un lieu de lecture" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "si je ne peux pas l'ouvrir en salle, je dois tout mémoriser avant ?" | BL | INT | PRJ |
| 240 | Périmètre négatif ferme : jamais per-op, données patient, PMSI | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "essentiel juridiquement — pas de données de santé = pas de HDS" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "pas de données patient = je n'ai pas à m'inquiéter RGPD" | RG | INT | PRJ |
| 120 | Incarne compétences 7-8-9 du référentiel IBODE 2022 | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "ancrage officiel — c'est la légitimité institutionnelle" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "référentiel IBODE 2022 ? 9 compétences ? Je n'ai pas le contexte" | BL | INT | PRJ |
| 249 | Un nouvel acteur apparaît sans refonte — pharmacie n'était pas prévue | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "preuve de souplesse architecturale" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "la pharmacie est citée mais son module n'existe pas" | JN | INT | PRJ |
| 288 | Nom = bac à sable, nom commercial final ouvert | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le nom doit incarner le profil S/C+I — pas encore trouvé" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "appelez-le comme vous voulez, du moment que ça marche" | VL | POT | PRJ |

### Trous type 4

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "L'unicité du produit je ne la perçois pas — je n'ai rien à comparer." |
| Constance (T3 · cadre admin · C/I) | "L'authenticité se prouve par le terrain, pas par les docs." |

---

## TYPE 5 — SAVOIR (on sait ce qu'on sait)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 44 | Zéro CCAM inventé — vide > faux | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "le plus important de tous les principes" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "combien de vides ?" | BL | INT | IA |
| 234 | Matching algorithmique ≠ valeur clinique | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "un algorithme ne sait pas la différence entre deux voies d'abord" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "matching de QUOI ? Le mot seul ne dit rien" | BL | INT | IA |
| 208 | Risque principal = impossibilité de reconnaître/nommer/localiser | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "20 ans de terrain condensés en une phrase" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "c'est exactement MON problème chaque matin" | JN | INT | PRJ |
| 211 | Une appellation de référence, synonymes ≠ fiches | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "3 noms pour le même objet = 1 référence + 2 synonymes" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "mais lequel est LE bon ? Comment je sais ?" | BL | INT | PRJ |
| 210 | 5 types de fiches | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "chaque type a sa raison d'être" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "combien sont implémentées vs documentées ?" | BL | INT | PRJ |
| 222 | Chaîne ≥ 12 intervenants | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "plutôt 15 certains jours" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "12 intervenants ENTRE QUOI ET QUOI ?" | VR | INT | PRJ |
| 143 | OPTIM = matière première, pas vérité | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "OPTIM est le chaos à déchiffrer, pas la bible à copier" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "OPTIM ? C'est quoi ?" | BL | INT | IA |
| 142 | Ortho ≠ Neuro même libellé | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "même nom, installation opposée, matériel différent — VITAL" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "comment l'app me prévient que je suis dans le mauvais protocole ?" | BL | INT | IA |
| 62 | 395 protocoles, 89 653 interventions, 8 292 codes CCAM | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "masse critique de données — crédible" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "395 protocoles, combien de combos reliés ?" | OR | EQU | PRJ |
| 64 | 187 principes actifs, 18 catégories, 102 sessions, 424 décisions | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "gouvernance outillée — rare pour un solo" | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "424 décisions dont combien sont encore valides ?" | OR | EQU | CRE |
| 141 | Protocole racine + delta chirurgien, jamais par chirurgien | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "1 base + N variantes = le seul modèle qui scale" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "mon delta EST mon protocole. Ne l'appelez pas autrement" | BL | INT | PRJ |

### Trous type 5

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Je ne vois pas qui a écrit la fiche ni quand elle a été vérifiée." |
| Constance (T3 · cadre admin · C/I) | "Je ne sais pas quels contenus de mon instance sont obsolètes." |
| Aurèle (T0 · IA neuve) | "La moitié des termes techniques (OPTIM, CCAM, picking) ne sont pas définis dans le référentiel." |

---

## TYPE 6 — CONFIANCE (fiable, sécurisé, digne de foi)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 251 | Pas de scoring, classement, surveillance | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "essentiel — je ne viens pas si on me note" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "zéro classement = zéro levier de motivation visible" | VR | INT | MBR |
| 259 | Anonymat progression garanti | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "c'est ce qui me fait oser ouvrir l'app" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "anonymat = impossible de savoir qui a besoin d'aide" | VR | INT | MBR |
| 32 | escHtml() obligatoire sur innerHTML | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "protection XSS basique — nécessaire" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "escHtml ? innerHTML ? Technique pure" | BL | EQU | IA |
| 42 | Migration SQL = fichier avant exécution | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "traçabilité des changements — fondamental" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "ça ne me parle pas — mes données sont en sécurité ou pas ?" | BL | EQU | IA |
| 55 | INTERDIT thèmes dark | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "le créateur a des contraintes visuelles — c'est juste" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "dark = ? Je ne sais pas pourquoi c'est interdit sans contexte" | RG | EQU | IA |
| 50 | Noms propres interdits dans livrables | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "protection RGPD + instanciabilité" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "personne ne cite mon nom hors de l'app ? Bien." | RG | INT | IA |
| 129 | Modération = sécurité, pas censure | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "important — je ne serai pas censurée si je dis que la fiche est fausse" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "la ligne est fine — qui juge de la limite ?" | VR | INT | ADM |
| 160 | FTP irréversible, checklist pre-flight | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "pas de CI/CD = risque humain à chaque déploiement" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "irréversible = angoissant. Pas premium." | BL | EQU | CRE |

### Trous type 6

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Je ne vois aucun signal de fiabilité sur les fiches. Pas de date, pas de source, pas de badge vérifié." |
| Dorian (T5 · direction · C) | "Aucune vision sécurité unifiée. XSS couvert, auth ? session ? chiffrement ? injections ?" |
| Fernand (T8 · chirurgien · D) | "Mes données sont protégées comment ? Personne ne me l'a dit en 10 secondes." |
| Constance (T3 · cadre admin · C/I) | "Pas de rollback admin. Si je valide du faux, pas de retour arrière." |
| Gaël (T9 · arbitre syst. · S/C) | "La sécurité est en morceaux. Pas de carte unifiée de ce qui est protégé et ce qui ne l'est pas." |

---

## TYPE 7 — ENVIE (ça donne envie)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 286 | Profil DISC app = S/C + I, sans éloigner les D | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le profil identitaire est tranché — c'est la boussole" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "le I est nommé mais OÙ est-il incarné dans l'app ?" | VR | INT | PRJ |
| 256 | DISC-RÈGLE-01 : forme adapte, fond stable | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "le contenu est universel, la présentation s'ajuste" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "adaptez-vous à MOI, pas le contraire — d'accord" | BL | INT | PRJ |
| 275 | Sans carte = perdu | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "la conscience de sa propre cartographie" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "je n'ai pas besoin de carte, j'ai besoin de résultat" | JN | EQU | PRJ |
| 135 | Chaque token compte — zéro remplissage | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "enfin quelqu'un qui ne me fait pas perdre du temps" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "trop sec = froid. Un mot de plus parfois rassure" | OR | EQU | CRE |

### Trous type 7

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "L'app ne m'a jamais dit 'bravo' ni 'bien joué'. Aucune micro-joie." |
| Constance (T3 · cadre admin · C/I) | "Administrer = corvée. Aucun plaisir, aucun feedback positif." |
| Gaël (T9 · arbitre syst. · S/C) | "36 INTERDIT, 0 ENCOURAGE. Le type 7 meurt de faim." |
| Aurèle (T0 · IA neuve) | "Aucune directive ne me demande de rendre l'app désirable." |
| Fernand (T8 · chirurgien · D) | "Je reviens si c'est rapide ET agréable. Rapide oui. Agréable ?" |

---

## TYPE 8 — PROTECTION (protéger sans écraser)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 97 | Masquer (réversible) ≠ Détruire (irréversible) | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "protège contre l'erreur humaine" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "masquer 500 items = bruit silencieux. Nettoyage périodique ?" | BL | INT | PRJ |
| 130 | Transverse absolu : partout ou nulle part | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "la cohérence EST la protection" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "transverse = complexité d'implémentation. Chaque changement touche tout" | JN | INT | PRJ |
| 136 | Hiérarchie : Créateur → Admin → Membre → Invité | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "modèle RBAC classique — solide" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "les niveaux me rassurent — je ne peux pas casser" | BL | EQU | PRJ |
| 138 | Shell calcule droits une fois → window.bdbUser | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "source unique de vérité pour les droits — bon pattern" | Aurèle (T0 · IA neuve · — · Beige · "je comprends sans contexte ?") : "window.bdbUser = technique pure" | BL | EQU | PRJ |
| 230 | Profil DISC incompatible = bloque/stresse/démissionne | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "vu mille fois — le protocole doit porter TOUT le monde" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "c'est MOI ça — le protocole me protège si je suis le mauvais profil ?" | VR | INT | PRJ |
| 233 | 4 actions admin départ | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "4 cas documentés — bien" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "si je pars, MES préférences restent anonymisées ? Acceptable" | BL | EQU | ADM |

### Trous type 8

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Un autre membre publie du faux — qui me protège contre ça ?" |
| Gaël (T9 · arbitre syst. · S/C) | "10 fichiers gouvernance au lieu de 6 = accumulation → repli type 8→5." |

---

## TYPE 9 — HARMONIE (tout s'assemble)

| # | Affirmation | Valide | Conteste | Spi. | État | Or. |
|---|---|---|---|---|---|---|
| 226 | Combo gagnant 12 maillons | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "l'harmonie en 12 maillons — SI ça fonctionne" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "combien de maillons reliés AUJOURD'HUI ?" | JN | INT | PRJ |
| 228 | Protocole racine + delta chirurgien | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "1 base + N variantes = harmonie structurelle" | Fernand (T8 · chirurgien · D · Rouge/Orange · "ça me protège ?") : "mon delta n'est pas une variante — c'est MA façon de faire" | BL | INT | PRJ |
| 289 | 4 couches DEBLOQUEZ_MOI vs 3 couches Canon — à unifier | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "deux découpages du même concept = fragmentation" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "lequel est le bon ? 3 ou 4 ?" | BL | DES | PRJ |
| 176 | Combo : 6 maillons Manifeste vs 12 Doctrine | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "deux versions = zéro version canonique" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "12 du terrain. Le Manifeste simplifiait" | BL | DES | PRJ |
| 173 | 10 fichiers gouvernance, pas 5 | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "10 = fragmentation. 6 = harmonie possible" | Dorian (T5 · direction · C · Orange/Bleu · "c'est fondé sur quoi ?") : "quel est le plan de consolidation ?" | BL | DES | PRJ |
| 186 | 3 inventaires partiels de méthodes, 0 référentiel complet | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "le signe le plus clair de la fragmentation" | Blanche (T1 · experte · S/C · Vert · "c'est juste ?") : "un inventaire unique qui les réunit tous = le DEBLOQUEZ_MOI abouti" | BL | DES | PRJ |
| 144 | Chaque module a admin.html standalone | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "isolation technique = bon. Mais les admin.html communiquent-ils ?" | Constance (T3 · cadre admin · C/I · Orange · "ça produit quoi ?") : "26 admin.html séparés = 26 onglets à ouvrir. Pas un hub unifié" | BL | EQU | PRJ |
| 146 | 3 états DOM async : loading, vide, erreur | Gaël (T9 · arbitre syst. · S/C · Jaune · "ça s'assemble ?") : "cohérence transverse — chaque module parle le même langage" | Estelle (T6 · novice · S · Violet/Bleu · "je peux faire confiance ?") : "l'état vide me dit quoi ? 'Rien trouvé' ou 'c'est normal' ?" | BL | EQU | PRJ |

### Trous type 9

| Voix | Angle mort |
|---|---|
| Estelle (T6 · novice · S) | "Je navigue d'un module à l'autre sans lien. Chaque module est un silo." |
| Constance (T3 · cadre admin · C/I) | "Pas de vue 'mon instance est complète à N%'." |
| Gaël (T9 · arbitre syst. · S/C) | "La gouvernance elle-même est fragmentée. Comment l'app peut être harmonieuse si ses fondations ne le sont pas ?" |

---

## SYNTHÈSE DES TROUS PAR VOIX

| Voix | Nb de trous identifiés | Résumé |
|---|---|---|
| **Estelle** (T6 · novice · S) | 9 | Pas de signal fiabilité, pas de notification, pas de micro-joie, navigation en silos, protection user-vs-user absente |
| **Constance** (T3 · cadre admin · C/I) | 8 | Pas de dashboard, pas de métriques implémentées, admin = corvée, pas de supervision admin, pas de vue instance globale |
| **Aurèle** (T0 · IA neuve) | 5 | Termes non définis (OPTIM, CCAM, picking, escHtml), aucune directive envie, type 0 non outillé |
| **Dorian** (T5 · direction · C) | 5 | Hypothèses CNP non auditées, pas de vision sécurité unifiée, démo non garantie fiable, format vérif croisée IA absent |
| **Gaël** (T9 · arbitre syst. · S/C) | 4 | Fragmentation gouvernance, 36 INTERDIT / 0 ENCOURAGE, sécurité morcelée, type 7 affamé |
| **Fernand** (T8 · chirurgien · D) | 3 | Preuve terrain absente (0 salle améliorée), sécurité données non communiquée, envie = 0 |
| **Blanche** (T1 · experte · S/C) | 2 | Dettes Doc sans date de résorption, Canon Annexe ne s'applique pas ses propres méthodes |

**Total : 36 trous identifiés par les 7 voix.**

---

## 3 CHANTIERS (confirmés par les voix)

| Chantier | Voix motrice | Type | Action |
|---|---|---|---|
| **Premier combo 100%** | Constance + Fernand | T3→T6→T9 | Prouver que ça marche. Une salle. Un protocole complet et relié |
| **Premiers ENCOURAGE** | Estelle + Gaël | T7→T5 | Célébrer : fiche complétée, combo atteint, recherche réussie. Incarner le I |
| **Carte sécurité unifiée** | Dorian + Gaël | T6→T9 | Cartographier ce qui est protégé par orientation. Visible par Fernand en 10s |

---

## HISTORIQUE

```
2026-04-30 — V2.0.0
  258 affirmations enrichies : voix qui valide + voix qui conteste.
  Format compact profil inline (Tₙ · rôle · DISC · spirale · question).
  36 trous identifiés par les 7 voix.
  3 chantiers confirmés.
  Remplace V1.0.0 (alignement type/spirale/état sans incarnation).
```
