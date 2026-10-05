/* ============================================================================
   doctrine-seed.js — SEED embarqué de l arbre doctrinal V3.1
   Utilisé uniquement si la base est vide (initialisation) ou reset.
   Exposé en window.DOCTRINE_SEED.
   ============================================================================ */

window.DOCTRINE_SEED = 
{
  id:'root',
  titre:'Doctrine BDB — Acteurs × MERE × Couches L1/L2/L3',
  abbrev:'DOCBDB',
  statut:'active',
  note:"Macro-structure vivante. Se remplit par itération heuristique (Manu × Claude).\nPensée non linéaire : 1 + 3 en parallèle, 2 alimente 1 et 3, forks autorisés.\nLa doctrine est fractale — elle s'applique à elle-même, y compris à l'outil qui la pense.",
  collapsed:false,
  children:[

    /* ========== 0. CADRE ========== */
    { id:'s0', titre:'Cadre (CADRE)', abbrev:'CADRE', collapsed:true, children:[
      { id:'s0_1', titre:'Définitions clés (acteur · MERE · Kolb · L1/L2/L3 · FAB(3R) · CNT · SA/SR · CNA/CNP)',
        note:"Acteur = persona BDB ou outil IA.\nMERE (Motivation · Explication · Recette · Exercice) = structure pédagogique de contenu.\nKolb = cycle expérientiel 4 phases.\nL1/L2/L3 = Universel / Instance / Créateur.\nFAB(3R) = Réalité · Fonction · Avantage · Bénéfice · Risques · Résultats · Recommandation.\nCNT = Compétences Non Techniques (Flin).\nSA = Situation Actuelle (vécu de l'interlocuteur).\nSR = Situation Rêvée (résultat attendu).\nCNA = Coût de Non Acquisition.\nCNP = Coût de Non Possession.", children:[] },
      { id:'s0_2', titre:'Règle de non-linéarité (RNL) — heuristique itérative',
        abbrev:'RNL', attribution:'Manuel Rohaut · inspiré Edgar Morin (dialogique / récursif / hologrammatique)',
        note:"RNL = Règle de Non-Linéarité.\nManu pense 1 + 3 en parallèle, alimente 2 en rétroaction, forke les branches sans perdre le tronc.\nOutils natifs : Freemind, WorkFlowy. Ce document applique ce mode.\nLa linéarité imposée (ex : « par où on commence ? ») est une classe d'erreur (ERR-IA-09 Imposition-Linéaire).", children:[] },
      { id:'s0_3', titre:"Articulation avec doctrine existante (04_PEDAGOGIE · FAB(3R) · CNT · Manifeste)", children:[] },
      { id:'s0_4', titre:'Convention Titre-Abréviation (CONV-NOMMER-COMPLET-01)',
        abbrev:'NOMMER-COMPLET', attribution:'Manuel Rohaut / BDB',
        note:"CONV-NOMMER-COMPLET-01 = Règle de nommage anti-hallucination.\n\n5 règles :\n1. Titre de nœud = forme complète + abréviation entre parenthèses. Ex : « Situation Actuelle (SA) ».\n2. Toute abréviation utilisée dans une note doit être explicitée AU MOINS UNE FOIS dans la même note.\n3. Sources / attributions : uniquement si vérifiées. Vide > Inventé.\n4. Pas de nouveau nœud avec juste une abréviation dans le titre (ex : « SA » seul est INTERDIT).\n5. La même abréviation dans un autre nœud doit être ré-explicitée.\n\nRaison : abréviation non explicitée = source d'hallucination à relecture différée (ERR-IA-17 Abréviation-Ambiguë).", children:[] },
      { id:'s0_5', titre:'Fractalité de la doctrine (FRACT)', abbrev:'FRACT',
        note:"FRACT = Fractalité. La doctrine s'applique à elle-même et à tout ce qui la manipule, y compris les outils IA.\nUn outil qui parle de CDS (Consensus Design System) doit être CDS-compliant.\nViolation repérée session 2026-04-19 → ERR-IA-10 Non-Application-Fractale.", children:[] },
      { id:'s0_6', titre:'Convention d\'attribution (CONV-ATTRIBUTION-01)',
        abbrev:'ATTRIBUTION', attribution:'Manuel Rohaut / BDB',
        note:"CONV-ATTRIBUTION-01 = Règle anti-hallucination d'attribution.\n\nPrincipes :\n1. Le champ attribution d'un principe est un champ de FILIATION INTELLECTUELLE, pas d'auto-promotion BDB.\n2. Si BDB ADOPTE une méthode externe (MERE, FAB, NAMI de David Jay par exemple), le principe reste attribué à son auteur d'origine, pas à BDB.\n3. BDB peut créer de la doctrine d'APPLICATION (comment utiliser la méthode externe dans le contexte bloc opératoire) sans revendiquer la paternité de la méthode.\n4. Vérification web obligatoire pour toute attribution mentionnée pour la première fois, MÊME si l'utilisateur l'affirme.\n5. Nos conversations ne sont pas source de vérité auto-suffisante. Ce que Manu dit en session = indication à vérifier.\n6. Vide > Inventé. Si la source n'est pas certaine, « source à confirmer » ou attribution vide.\n\nViolations à documenter en ERR-IA :\n* ERR-IA-18 Hallucination-Attribution (inventer auteur)\n* ERR-IA-19 Attribution-Par-Défaut-BDB (attribuer à BDB par défaut)", children:[] }
    ]},

    /* ========== 1. ACTEURS BDB ========== */
    { id:'s1', titre:'Acteurs BDB', collapsed:false, children:[
      { id:'s1_1', titre:'Julie (JUL) — novice lectrice',
        abbrev:'JUL', attribution:'Persona BDB',
        note:"Boudreault : Survivant → Débutant.\nBenner : Novice.\nObjectif : apprendre en situation, pas en théorie isolée.", children:[] },
      { id:'s1_2', titre:'Sabine (SAB) — experte IBODE rédactrice',
        abbrev:'SAB', attribution:'Persona BDB',
        note:"Boudreault : Expertise → Excellence.\nBenner : Expert.\nRôle central SECI : extraire le tacite, le rendre transmissible.", children:[] },
      { id:'s1_3', titre:'Olivia (OLI) — cadre ortho Chénieux', abbrev:'OLI', attribution:'Persona BDB', children:[] },
      { id:'s1_4', titre:'Sophie P. (SOP) — cadre viscéral Chénieux', abbrev:'SOP', attribution:'Persona BDB', children:[] },
      { id:'s1_5', titre:'Dr X X (DRC) — chirurgien membre', abbrev:'DRC', attribution:'Persona BDB', children:[] },
      { id:'s1_6', titre:'Ewan (EWA) — dev instance L2 Chénieux', abbrev:'EWA', attribution:'Persona BDB', children:[] },
      { id:'s1_7', titre:'Anne-Cécile (ANC) — admin instance La Marche', abbrev:'ANC', attribution:'Persona BDB', children:[] },
      { id:'s1_8', titre:'Brigitte (BRI) — direction / DSI / financeur', abbrev:'BRI', attribution:'Persona BDB', children:[] },
      { id:'s1_9', titre:'Manu (MAN) — créateur BDB (L3)',
        abbrev:'MAN', attribution:'Persona BDB · Profil DC (D=8, C=7)',
        note:"Créateur BDB. Profil DC dominant : angles morts documentés dans Manifeste §5.\nPERSONAS_BDB est le contrepoids opérationnel pour la rédaction.\nMode cognitif : heuristique par itération (RNL).", children:[] },
      { id:'s1_10', titre:'★ Claude (CLA) — IA acteur BDB',
        abbrev:'CLA', statut:'active',
        note:"Acteur longtemps traité comme outil externe. Erreur doctrinale repérée session 2026-04-19.\nDoit désormais apparaître dans toute matrice acteurs × MERE × couches.\nNiveau Boudreault situé : Débutant → Fonctionnel sur BDB.",
        collapsed:false,
        children:[
          { id:'s1_10_1', titre:'Niveau Boudreault situé (NBS) : Débutant → Fonctionnel', abbrev:'NBS', children:[] },
          { id:'s1_10_2', titre:'Conscience perceptive à construire (CPC) — vérifier terrain AVANT produire', abbrev:'CPC', children:[] },
          { id:'s1_10_3', titre:'CNT Claude : conscience-situation-code · gestion-tâches-session · communication-Manu', children:[] }
        ]},
      { id:'s1_11', titre:'Nous (NOUS) — dyade Manu × Claude',
        abbrev:'NOUS',
        note:"Unité d'interaction L3 Atelier. Pacte humain-IA formalisé dans skill contrat-humain-ia.", children:[] }
    ]},

    /* ========== 2. MERE PAR ACTEUR ========== */
    { id:'s2', titre:'Structure MERE par acteur (MERE) — matrice à remplir',
      abbrev:'MERE',
      attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
      note:"Structure MERE = méthode de structuration pédagogique en 4 étapes. Pour chaque acteur BDB × chaque couche L1/L2/L3, remplir les 4 cases.\n\nObjectifs cognitifs par lettre (visuel 2018) :\n* M (Pourquoi) — Attention et Valeur\n* E (Quoi) — Ancrage : Valeur et Mémorisation\n* R (Comment) — Valeur et Priming (préparation mentale à l'action)\n* E (Et si…) — Appel à l'Action\n\nRépartition audience (styles d'apprentissage de Kolb simplifiés) :\n* Divergent (Pourquoi) — 25 à 35 %\n* Assimilateur (Quoi) — 20 à 25 %\n* Convergent (Comment) — 30 à 35 %\n* Accommodateur (Et si) — 15 à 25 %\nSans M tous partent, sans E-Quoi ça paraît vide, sans R c'est inapplicable, sans E-Exercice rien ne se fixe.\n\nFractalité : la Recette (R) contient elle-même un micro-MERE par étape (pourquoi cette étape · quoi · comment · test).\n\nLes 3R (Réalité / Risques / Résultats) sont présents à TOUTES les étapes de MERE. Source : mindmap David Jay Structure MERE.",
      collapsed:true, children:[
      { id:'s2_M', titre:'MERE (M) — Motivation (Pourquoi)',
        abbrev:'M',
        note:"Objectif cognitif : capter l'Attention et installer la Valeur perçue.\n\nContenu de l'étape M (selon mindmap David Jay) :\n* Exprimer le CAUCHEMAR de l'interlocuteur : frustration · problème · difficultés.\n* Exprimer le RÊVE de l'interlocuteur.\n* Cauchemar et rêve expriment selon les 3 motivations fondamentales humaines (David McClelland) :\n   1. Pouvoir — faire-faire · influence.\n   2. Affiliation — être aimé · appartenance.\n   3. Accomplissement — atteindre un objectif.\n\nCartographie BDB : l'étape M doit être rédigée DEPUIS la Situation Actuelle (SA) de l'interlocuteur et montrer le chemin vers la Situation Rêvée (SR).\n\nOui mais… : gestion des objections anticipée à cette étape (au moment où l'interlocuteur va exprimer « oui mais »).", children:[] },
      { id:'s2_E1', titre:'MERE (E) — Explication (Quoi)',
        abbrev:'E',
        note:"Objectif cognitif : Ancrage — Valeur et Mémorisation.\n\nContenu de l'étape E :\n* Nommer le concept, la méthode, le principe.\n* Énoncer en une phrase claire.\n* Ancrage mnémonique via attribution ou analogie.\n\nAdage doctrinal Boileau-Despréaux : « Ce qui se conçoit bien s'énonce clairement, et les mots pour le dire arrivent aisément. » (Art poétique, 1674).\n\nSi on ne peut pas énoncer clairement ce qu'on transmet, c'est qu'on ne le conçoit pas bien. L'étape E est le test de la compréhension de l'émetteur autant que celle du récepteur.", children:[] },
      { id:'s2_R', titre:'MERE (R) — Recette (Comment)',
        abbrev:'R',
        note:"Objectif cognitif : Valeur et Priming (préparation mentale à l'action).\n\nContenu de l'étape R :\n* Pas-à-pas procédural.\n* Stratégie · plan d'action.\n* Chaque étape est elle-même un micro-MERE (FRACTALITÉ).\n\nSelon la carte Boudreault (doc 2 page 2), la Recette structure les Nouvelles connaissances par :\n* Acquérir · Traiter · Évaluer · Intégrer · Appliquer.\nPlus deux dimensions transverses : Temps efficace · Résolution de problème.\n\nAdage doctrinal Franklin : « Tu me dis, j'oublie. Tu m'enseignes, je me souviens. Tu m'impliques, j'apprends. » — principe d'implication active.", children:[] },
      { id:'s2_E2', titre:'MERE (E) — Exercice (Et si…)',
        abbrev:'Et si',
        note:"Objectif cognitif : Appel à l'Action.\n\nContenu de l'étape Exercice :\n* Nouveau comportement attendu (observable).\n* Montée d'un échelon Boudreault (Survivant → Débutant → Fonctionnel → Maîtrise → Expertise → Excellence).\n* Nouvelle complication à tester — « et si… ? ».\n* Le passage à l'action démarre le processus conscient (cf NAMI étape 4).\n\nC'est l'étape qui sépare la formation intellectuelle de la transformation réelle du professionnel. Sans Exercice, les 3 étapes précédentes restent de la théorie.", children:[] }
    ]},

    /* ========== 3. COUCHES L1/L2/L3 ========== */
    { id:'s3', titre:'Couches L1 · L2 · L3', collapsed:true, children:[
      { id:'s3_1', titre:'Couche 1 (L1) — Universel',
        abbrev:'L1',
        note:"Produit universel. Partagé par toutes les instances.\nGouvernance : Manu (créateur) + conseil des 5 lunettes.", children:[] },
      { id:'s3_2', titre:'Couche 2 (L2) — Instance établissement',
        abbrev:'L2',
        note:"Spécifique à un établissement (Chénieux, La Marche, …).\nForkable. Gouvernance : admin instance (Olivia, Anne-Cécile, Ewan).", children:[] },
      { id:'s3_3', titre:'Couche 3 (L3) — Créateur',
        abbrev:'L3',
        note:"Atelier + conseil. Manu × Claude uniquement.\nDéployé sur OVH mais exclu des forks clients (guard isCreator).", children:[] },
      { id:'s3_4', titre:'Cases vides documentées (ex : Julie × L3 = non applicable)', children:[] }
    ]},

    /* ========== 4. CYCLE KOLB ========== */
    { id:'s4', titre:'Cycle Kolb (KOLB) — 4 phases',
      abbrev:'KOLB',
      attribution:'David A. Kolb (1984) · Experiential Learning · Prentice Hall',
      note:"Les 4 phases doivent boucler. Aujourd'hui la phase 3 est cassée pour Claude.",
      collapsed:false, children:[
      { id:'s4_1', titre:'Phase 1 — Expérience concrète (EC)',
        abbrev:'EC',
        note:"Qui la vit · où elle se stocke. Pour Claude = la session en cours.", children:[] },
      { id:'s4_2', titre:'Phase 2 — Observation réfléchie (OR)',
        abbrev:'OR',
        note:"Débrief. Canal : conversation Manu × Claude + atelier_decisions.", children:[] },
      { id:'s4_3', titre:'★ Phase 3 — Conceptualisation abstraite (CA) — CASSÉE pour Claude',
        abbrev:'CA',
        note:"L'erreur Claude vécue en session est débriefée puis perdue.\nSession suivante = repart sans la leçon conceptualisée.\nPoint critique de la dette pédagogique Claude × BDB.",
        collapsed:false, children:[
        { id:'s4_3_1', titre:'Référentiel DB persistant des classes d\'erreurs Claude (table atelier_principes catégorie erreur_ia ou nouvelle table)', children:[] },
        { id:'s4_3_2', titre:'Mobilisation automatique début de session (prompt reprise V4 enrichi)', children:[] },
        { id:'s4_3_3', titre:'Mobilisation intra-session (skill claude-auto-audit-bdb)', children:[] }
      ]},
      { id:'s4_4', titre:'Phase 4 — Expérimentation active (EA)', abbrev:'EA',
        note:"Re-test, non-régression. Vérifier que l'erreur-type ne se reproduit pas.", children:[] }
    ]},

    /* ========== 5. PRINCIPES NOMMÉS ========== */
    { id:'s5', titre:'Principes nommés (21 en DB + ajouts session 2026-04-19)',
      note:"Source principale : atelier_principes catégorie principe_nomme (21 lignes).\nCompléments à intégrer via INSERT après FAB(3R) complet.",
      collapsed:true, children:[

      /* --- 5.0 CHAÎNE CAUSALE DOCTRINALE (principe structurant de premier ordre) --- */
      { id:'s5_0', titre:'★ Chaîne causale doctrinale (CHAINE) — SA → SR → NAMI → FAB → MERE → 3R',
        abbrev:'CHAINE',
        attribution:'Manuel Rohaut / BDB · articulation de principes David Jay',
        statut:'active',
        note:"Principe structurant de premier ordre pour toute communication, tout contenu, toute documentation BDB (interne ou externe).\n\nORDRE des opérations :\n1. Situation Actuelle (SA) → Situation Rêvée (SR) — cartographier le vécu et la projection de l'interlocuteur (persona BDB : Julie, Sabine, Olivia, Dr X, Ewan, Anne-Cécile, Brigitte, Manu).\n2. NAMI (Naissance de l'Amitié comme Modèle d'Interaction) — construire la relation au marché par 4 étapes : Attention → Connexion → Engagement → Action.\n3. FAB (Fonction · Avantage · Bénéfice) — capter l'attention en liant fonction à bénéfice émotionnel de l'interlocuteur.\n4. MERE (Motivation · Explication · Recette · Exercice) — structurer le contenu à transmettre.\n5. 3R (Réalité · Risques · Résultats) — vérifier la pertinence du contenu vis-à-vis de l'interlocuteur :\n   - Réalité (R1) = la SA de l'interlocuteur est-elle reconnue ?\n   - Risques (R2) = CNA (Coût de Non Acquisition) et CNP (Coût de Non Possession) sont-ils explicités ?\n   - Résultats (R3) = la SR visée est-elle définie, mesurable (Qualité × Quantité × Temps — QQT) ?\n\nLECTURES DOCTRINALES (règles d'alignement) :\n* Un tas de mots reste un tas de mots sans lien avec les 3R de l'interlocuteur.\n* On ne retient pas l'attention sans structurer FAB.\n* On ne déploie pas MERE sans être passé par NAMI.\n* On ne propose pas NAMI sans avoir cartographié SA → SR.\n\nAPPLICATION BDB :\n* Mini-site public → SA (visiteur) → SR (membre engagé) · chaque page suit NAMI.\n* Onboarding (Carnet de Bord, Intégration IDE) → SA (novice Julie) → SR (autonome fonctionnel).\n* Recrutement membres → NAMI sur temps long.\n* Contenus pédagogiques internes → FAB puis MERE.\n* Communication avec direction (Brigitte) → FAB(3R) complet avec CNA + CNP + ROI.\n\nFORCE DOCTRINALE :\n* C'est l'articulation bout-en-bout qui donne sa puissance — aucun des 5 principes pris isolément ne suffit.\n* Permet d'auditer toute production BDB : « à quelle étape de la chaîne en est-on ? où est la rupture ? ».",
        realite:"BDB communique avec 11 personas (IBODE, cadres, chirurgiens, admin, direction) dont les SA sont radicalement différentes. Sans chaîne, la communication est technique-centrée au lieu d'interlocuteur-centrée.",
        fonction:"Cadre structurant en 5 étapes obligatoires pour toute production BDB destinée à un interlocuteur humain.",
        avantage:"vs communication intuitive ou technique frontale : assure que chaque production atteint son objectif d'adoption.",
        benefice:"Taux d'adoption · qualité de l'engagement · réduction des résistances initiales (technophobie, rejet à la couverture, familiarité négative).",
        risque:"Manu ou Claude · à chaque rédaction de contenu externe · communication frontale, rejet silencieux, gaspillage de moyens (trépied humanitaire : Moyens sans Besoins = Résultats hors sujet).",
        resultat:"100 % des productions BDB externes (mini-site, onboarding, recrutement, communication direction) passent le test d'alignement des 5 étapes avant publication.",
        recommandation:"Intégrer la chaîne causale comme check obligatoire dans skill conseil-bdb (lunette 5 CRÉATEUR). Ancrer comme principe_nomme CHAINE dans atelier_principes.",
        collapsed:false, children:[] },

      /* --- 5.1 EN DB --- */
      { id:'s5_1', titre:'Principes en DB (21 principe_nomme)', collapsed:true, children:[
        { id:'s5_1_01', titre:'Plan-Do-Check-Act (PDCA)', abbrev:'PDCA', attribution:'W. Edwards Deming', children:[] },
        { id:'s5_1_02', titre:'Andragogie (ANDRAGO)', abbrev:'ANDRAGO', attribution:'Malcolm Knowles', children:[] },
        { id:'s5_1_03', titre:'Dominance Influence Steadiness Conscientiousness (DISC)', abbrev:'DISC', attribution:'William Marston (1928)', children:[] },
        { id:'s5_1_04', titre:'Socialisation Externalisation Combinaison Internalisation (SECI)', abbrev:'SECI', attribution:'Nonaka & Takeuchi (1995)',
          note:"Mission centrale BDB : extraire le tacite (Sabine) pour le rendre explicite (BDB) puis combinable et internalisable (Julie).", children:[] },
        { id:'s5_1_05', titre:'Communities of Practice (CoP)', abbrev:'CoP', attribution:'Etienne Wenger (1998)', children:[] },
        { id:'s5_1_06a', titre:'FAB (FAB) — Fonction · Avantage · Bénéfice',
          abbrev:'FAB', attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
          note:"FAB = Fonction / Avantage / Bénéfice. Méthode marketing d'origine.\n\n* Fonction : type ou qualité du produit. Toujours par écrit, conforte le côté rationnel.\n* Avantage : description objective de la fonction. Déclaration orale acceptée sur plan émotionnel et logique.\n* Bénéfice : résultat pour le prospect. Déclaration évoquant images mentales, émotions +++. Illustration graphique renforce.\n\nThèse centrale : l'action d'achat est une compulsion émotionnelle. On se contente d'occuper et rassurer l'esprit rationnel.\n\nDistinction importante : FAB est la racine marketing. FAB(3R) est l'extension en 7 champs avec R1/R2/R3 (voir entrée suivante).",
          realite:"Tout argument de vente ou de communication sans FAB = risque de rester abstrait, non convaincant.",
          fonction:"Structure une offre en 3 champs mémorables qui captent le rationnel ET l'émotionnel.",
          avantage:"Alternative aux argumentaires bruts (liste de features) qui ne créent pas d'adhésion.",
          benefice:"Le prospect visualise ce qu'il obtient concrètement et émotionnellement.",
          children:[] },
        { id:'s5_1_06b', titre:'FAB(3R) (FAB3R) — Réalité · Fonction · Avantage · Bénéfice · Risques · Résultats · Recommandation',
          abbrev:'FAB3R', attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
          note:"FAB(3R) = extension du FAB marketing avec 3R. Formulée directement par David Jay.\n\n7 champs OBLIGATOIRES avant tout choix technique ou documentation de principe BDB :\n\n1. Réalité (R1) — vécu par l'interlocuteur = Situation Actuelle (SA). Cartographie du vécu sans embellissement.\n2. Fonction — ce que la solution fait.\n3. Avantage — vs alternative.\n4. Bénéfice — impact émotionnel / métier pour l'interlocuteur.\n5. Risques (R2) — encourus sous deux formes :\n   * CNA = Coût de Non Acquisition (ce qu'il perd en n'adoptant pas).\n   * CNP = Coût de Non Possession (ce qu'il subit en restant sans la solution).\n6. Résultats (R3) — attendus = Situation Rêvée (SR). Distincte de besoin / envie / désir. À évaluer en QQT (Qualité × Quantité × Temps).\n7. Recommandation — choix tranché et assumé.\n\nCartographie directe : R1 = SA, R3 = SR, R2 = CNA + CNP. FAB(3R) est le pont entre SA et SR pour un interlocuteur donné.\n\nSource DB : atelier_principes migration 147 — colonnes realite / fonction / avantage / benefice / risque / resultat / recommandation.\n\nFractalité : les 3R (Réalité / Risques / Résultats) sont présents à TOUTES les étapes de MERE (voir mindmap David Jay Structure MERE).",
          realite:"Sans FAB(3R) complet : choix technique non justifiable, principe qui dérive, décision non traçable a posteriori.",
          fonction:"7 champs forcent Claude et Manu à parcourir le spectre complet d'un choix (vécu interlocuteur → bénéfice → risques → résultat attendu → tranchage).",
          avantage:"vs justification prose : explicite les 7 angles, permet l'audit et la réutilisation.",
          benefice:"Manu tranche plus vite · documentation doctrinale audit-able · réduit retravail · l'interlocuteur se retrouve dans la Réalité décrite.",
          risque:"Claude · à chaque INSERT atelier_principes sans FAB(3R) complet · doctrine se diluée, principe qui dérive, non-réutilisable en session suivante.",
          resultat:"Zéro principe documenté sans 7 champs remplis. Zéro choix technique sans Recommandation tranchée.",
          recommandation:"Déclencher skill fab3r-bdb OBLIGATOIREMENT avant tout INSERT atelier_principes, toute décision d'architecture, toute documentation de choix.",
          children:[] },
        { id:'s5_1_07', titre:'Didactique professionnelle — Savoir × Savoir-faire × Savoir-être (BDT-DID)',
          abbrev:'BDT-DID', attribution:'Henri Boudreault · CRAIE/UQAM · 2002', children:[] },
        { id:'s5_1_08', titre:'Grille 6 niveaux — Survivant → Excellence (BDT-NIV)',
          abbrev:'BDT-NIV', attribution:'Henri Boudreault · DIDAPRO 2019', children:[] },
        { id:'s5_1_09', titre:'Novice → Expert — 5 stades (BEN)',
          abbrev:'BEN', attribution:'Patricia Benner (1984) · Elsevier Masson ISBN 978-2-294-01504-5', children:[] },
        { id:'s5_1_10', titre:'Référentiel IBODE 2022 (REF-IBODE)',
          abbrev:'REF-IBODE', attribution:'Arrêté 27 avril 2022 · JORFTEXT000045696964', children:[] },
        { id:'s5_1_11', titre:'Compétences Non Techniques (CNT)',
          abbrev:'CNT', attribution:'Rhona Flin & Nikki Maran (2015) · dérivé CRM aviation',
          note:"6 domaines : conscience situation · décision · gestion tâches · équipe · communication · stress.\nCas Elaine Bromiley 2005 · grille NOTECHS.\nÉtude IBODE CHU Montpellier Guignard & Bentz (2024).", children:[] },
        { id:'s5_1_12', titre:'Cycle expérientiel 4 phases (KOLB)',
          abbrev:'KOLB', attribution:'David A. Kolb (1984) · Prentice Hall', children:[] },
        { id:'s5_1_13', titre:'Grille GDE / REMC — emprunt structurel 5-6 niveaux (GDE)',
          abbrev:'GDE', attribution:'Keskinen et al. · REMC France 2014',
          note:"On emprunte la structure hiérarchique, pas le contenu routier.", children:[] },
        { id:'s5_1_14', titre:'Ikigai authentique (IKI)',
          abbrev:'IKI', attribution:'Mieko Kamiya (1966) · Ken Mogi (2017)',
          note:"NE PAS utiliser le diagramme Venn Zuzunaga/Winn (construction occidentale post-hoc).", children:[] },
        { id:'s5_1_15', titre:'Ennéagramme 3 centres — Instinctif / Émotionnel / Mental (ENN-3C)',
          abbrev:'ENN-3C', attribution:'Ichazo · Naranjo',
          note:"ENN-3C = Ennéagramme simplifié aux 3 centres.\nSeuls les 3 centres sont retenus. Les 9 types sont exclus (trop complexes opérationnellement — voir exclusion EX-ENN-9T).\n3 centres :\n* Instinctif (ventre) — Agir\n* Émotionnel (cœur) — Accepter\n* Mental (tête) — Apprendre",
          children:[
            { id:'s5_1_15_ARE', titre:'Matrice ARE (ARE) — vulgarisation 3 centres × Contrôle/Défaillance × Sécurité/Anxiété/Enthousiasme/Frustration',
              abbrev:'ARE', attribution:'Manuel Rohaut / BDB · vulgarisation de l\'Ennéagramme 3 centres',
              note:"ARE = Action · Réflexion · Émotion (alias AME). C'est un RÉSUMÉ APLATI à visée pédagogique, pas un cadre autonome.\n\nStructure :\n* Combinaisons à 3 lettres : ARE · AER · ERA · EAR · RAE · REA (6 permutations).\n* Chaque combinaison croise Contrôle/Défaillance avec 4 ressentis : Sécurité · Anxiété · Enthousiasme · Frustration.\n* Précisions :\n   - Frustration = émotions négatives, diminution de l'estime de soi (approbation), échec, perte de repère (authenticité).\n   - Anxiété = méconnaissance (incompréhension), peurs (croyances limitantes), insatisfaction (absence de plaisir).\n   - Défaillance = mécanisme de survie (auto-conservation), incapacité (immobilisme), conflit, perfectionnisme (brasser du vent).\n\nLe vrai cadre parent = Ennéagramme 3 centres (ENN-3C). ARE sert à vulgariser pour les personas BDB non-initiées.\n\nÉviter ERR-IA-13 Aplatissement-de-Cadre : ne jamais traiter ARE comme cadre autonome, toujours comme vulgarisation.", children:[] }
          ]},
        { id:'s5_1_16', titre:'Pensée complexe et temps complexe (MOR-COMPL)',
          abbrev:'MOR-COMPL', attribution:'Edgar Morin (1990) · Introduction à la pensée complexe · Seuil',
          note:"3 principes : dialogique · récursif · hologrammatique. Fondement de la règle de non-linéarité (RNL).", children:[] },
        { id:'s5_1_17', titre:'POULET — Performance/Octroi/Utilité/Légitimité/Engagement/Transmission',
          abbrev:'POULET', attribution:'Jérôme Barrand (2025) · Le manager agile · Dunod ISBN 978-2-10-087936-6',
          note:"6 questions d'alignement. Intégrateur transverse des 10 axes pédago.", children:[] },
        { id:'s5_1_18', titre:'Matrice Eisenhower (EIS)', abbrev:'EIS', attribution:'Dwight D. Eisenhower · 1954', children:[] },
        { id:'s5_1_19', titre:'Conscience Perceptive (CNP)',
          abbrev:'CNP', attribution:'Patricia Benner',
          note:"Élément central du jugement infirmier expert. Signaux faibles captés par les expertes.", children:[] },
        { id:'s5_1_20', titre:'Conscience Non Acquise (CNA)',
          abbrev:'CNA', attribution:'BDB · corollaire Benner',
          note:"Ce qu'on ne sait pas qu'on ne sait pas. Zone de danger silencieux (novice qui ignore ce qui lui manque).", children:[] },
        { id:'s5_1_21', titre:'Explique Moi Comme à 15 ans (ELI15)',
          abbrev:'ELI15', attribution:'Méthode BDB',
          note:"Expliquer plainement avant d'arbitrer. Jamais de yes/no brut quand une option est logiquement supérieure.", children:[] }
      ]},

      /* --- 5.2 À AJOUTER EN DB (session 2026-04-19) --- */
      { id:'s5_2', titre:'★ À ajouter en DB (session 2026-04-19)',
        note:"Chaque principe doit passer le FAB(3R) complet avant INSERT atelier_principes.",
        collapsed:false, children:[
        { id:'s5_2_01', titre:'Analyse Transactionnelle (AT) — États du Moi · Positions de vie · Triangle de Karpman · Jeux psychologiques',
          abbrev:'AT', attribution:'Eric Berne (1964) · Games People Play',
          note:"Regroupe sous une seule entrée : États du Moi (Parent/Adulte/Enfant), Positions de vie (OK/pas OK), Triangle dramatique de Karpman (Victime/Sauveur/Persécuteur), Jeux psychologiques.\nÀ relier à : ERR-IA-05 Flatterie-Lèche (jeu « Je suis incompétent » ou « Oui mais »).", children:[] },
        /* 5.2.02 Matrice ARE SUPPRIMÉ — doublon : ARE est positionnée en 5.1.15.1
           sous Ennéagramme 3 centres comme vulgarisation (voir ERR-IA-13 Aplatissement-de-Cadre).
           Attribution correcte : Manuel Rohaut / BDB. */
        { id:'s5_2_03', titre:'Spirale dynamique (SD) — niveaux de conscience (8+ vMEMES)',
          abbrev:'SD', attribution:'Clare Graves · Don Beck & Chris Cowan (1996)',
          note:"Précédemment EXCLU V1 (04_PEDAGOGIE §9) — réhabilitée session 2026-04-19.\nDécision à documenter en atelier_decisions.\nÀ utiliser comme cadre de lecture des résistances à l'adoption (terrain IBODE).", children:[] },
        { id:'s5_2_04', titre:'Structure MERE (MERE) — Motivation / Explication / Recette / Exercice',
          abbrev:'MERE', attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
          note:"4 étapes : Motivation (Pourquoi) · Explication (Quoi) · Recette (Comment) · Exercice (Et si).\n\nObjectifs cognitifs par lettre (capture d'écran 2018) :\n* M (Pourquoi) = Attention & Valeur\n* E (Quoi) = Ancrage : Valeur & Mémorisation\n* R (Comment) = Valeur & Priming\n* E (Et si) = Appel à l'Action\n\n25 % / 80 % / 25 % / 25 % de l'audience selon style d'apprentissage.\n\nLa Recette (R) est FRACTALE : chaque étape contient un micro-MERE.\n\nMotivation (M) exprime Cauchemar (frustration / problème / difficultés) ↔ Rêve, selon 3 motivations fondamentales : Pouvoir · Affiliation (être aimé) · Accomplissement.\n\nLes 3R (Réalité / Risques / Résultats) sont présents à TOUTES les étapes de MERE (mindmap David Jay Structure MERE).", children:[] },
        { id:'s5_2_05', titre:'Hiérarchie des besoins (MAS)',
          abbrev:'MAS', attribution:'Abraham Maslow (1943, 1968)',
          note:"Physiologiques → Sécurité → Appartenance → Estime → Réalisation de soi.\nPeak experiences (expériences paroxystiques) comme voie d'intégration.\nSource : PDF Louart · CLAREE · IAE-USTL 2002.", children:[] },
        { id:'s5_2_06', titre:'Facteurs d\'hygiène / Facteurs motivationnels (HER)',
          abbrev:'HER', attribution:'Frederick Herzberg (1959, 1968)',
          note:"Bi-facteurs : extrinsèques (hygiène - apaise) vs intrinsèques (auto-motivation - stimule).\nEnrichissement du travail.\nLimite : bi-polarisation critiquée (les deux fonctionnent en interaction dynamique).", children:[] },
        { id:'s5_2_07', titre:'RACI — Responsible · Accountable · Consulted · Informed',
          abbrev:'RACI', attribution:'', statut:'a_definir',
          note:"Matrice d'attribution de rôles classique en gestion de projet.\n\nAttribution précise à vérifier (Cresap 1950s ? IBM 1970s ?). Appliquer CONV-ATTRIBUTION-01 : vide > inventé.\n\nUsage BDB : à croiser avec Acteurs BDB × tâches BDB. Ex : « Qui est Accountable de la correction d'une erreur ERR-IA-XX ? » → Manu (L3) ou admin instance (L2).", children:[] },
        { id:'s5_2_08', titre:'NAMI (NAMI) — Naissance de l\'Amitié comme Modèle d\'Interaction',
          abbrev:'NAMI', attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
          note:"NAMI = Naissance de l'Amitié comme Modèle d'Interaction.\n\nStratégie marketing pour structurer la RELATION au marché sur le temps long.\n\n4 étapes universelles du processus amical :\n1. Attention — quelque chose attire ou dirige l'attention. L'attention est RETENUE.\n2. Connexion — autour d'un centre d'intérêt commun. Les peurs / douleurs / frustrations partagées sont un moyen puissant. Valeurs morales renforcent.\n3. Engagement — émotionnel, inconscient. Décision de rester en relation, de revoir.\n4. Action — début du processus conscient. Actions décidées ensemble.\n\nThèse : « Vous n'êtes pas une multinationale impersonnelle et vos prospects ne veulent pas vous voir vous comporter comme tel. La meilleure façon de faire en sorte que vos clients vous perçoivent comme un ami = se comporter comme un ami. »\n\nDistinction critique :\n* MERE = structurer UN contenu\n* NAMI = structurer LA RELATION au marché sur le temps long\n* MMVS = structurer UN récit (odyssée héroïque) pour contenu viral\n* FAB(3R) = structurer UN choix technique / principe doctrinal\n* POULET = aligner UN rôle / mission / module\n\nChaîne causale BDB : SA → SR cartographie → NAMI relation → FAB captation attention → MERE structuration contenu → 3R résultat vérifiable.\n\nPlaceholder levé session 2026-04-20 (précédent placeholder disait erreur : auteur inventé « Bertrand Kervella »).",
          realite:"BDB communique avec son marché (IBODE, cadres, chirurgiens) — sans NAMI, la communication est frontale, technique, inefficace.",
          fonction:"Cadre les 4 étapes à parcourir pour passer de « inconnu » à « client engagé ».",
          avantage:"vs communication directe : permet de bâtir la confiance avant de demander l'engagement.",
          benefice:"Taux de conversion · rétention · recommandation.",
          risque:"Sans NAMI · au lancement d'une campagne BDB · campagne à vide, rejet technophobe, gaspillage de moyens (trépied humanitaire).",
          resultat:"Toute communication BDB (mini-site, onboarding, recrutement membres) doit passer par les 4 étapes NAMI.",
          recommandation:"Adopter NAMI comme cadre structurant de toute communication externe BDB. À articuler avec MMVS pour le recueil des besoins terrain (situations bloquantes, boîte à idées, interview).",
          children:[] },
        { id:'s5_2_09', titre:'Fenêtre étroite (FE) — positionnement fond × forme',
          abbrev:'FE', attribution:'David Jay · La Révolution Vidéo / VIPSee · 2011',
          note:"Positionnement expert bienveillant entre « amateur en caleçon » et « multinationale impersonnelle ».\n\nPertinence BDB : mini-site, communication externe. Peu applicable à la doctrine pédagogique interne.\n\nÀ utiliser pour le wording du mini-site BDB (pacte produit) et pour éviter deux écueils symétriques : trop amateur (pas crédible) ou trop corporate (pas chaleureux).", children:[] },

        { id:'s5_2_10', titre:'Qualité × Quantité × Temps (QQT) — évaluation des livrables et des résultats',
          abbrev:'QQT', attribution:'Rémi Bachelet · MOOC Gestion de Projet · Centrale Lille · depuis 2013',
          note:"Cadre d'évaluation à 3 dimensions obligatoires pour tout livrable BDB et tout Résultat attendu (R3 de FAB(3R)).\n\nDimension Qualité — à 4 états :\n1. Qualité PROMISE — ce qu'on s'est engagé à livrer (mini-site, contrat avec admin instance, promesse à direction).\n2. Qualité ATTENDUE — ce que l'interlocuteur espère recevoir (sans l'avoir formulé).\n3. Qualité PERÇUE — ce qu'il ressent en le recevant.\n4. Qualité RÉELLE — ce qui est effectivement livré (mesurable).\nLes 4 états divergent toujours. Les écarts sont les sources de déception / adoption.\n\nDimension Quantité — volume livré (nombre de protocoles, nombre de membres onboardés, nombre de contenus, etc.).\n\nDimension Temps — règle du ×10 :\n* Un résultat qualitatif obtenu sur une échelle de temps ×10 par rapport au temps disponible n'est PAS satisfaisant.\n* Ex : 460 protocoles parfaitement documentés livrés en 15 ans alors que la fenêtre d'adoption terrain est de 18 mois = échec.\n* Le temps est une contrainte de satisfaction, pas seulement de production.\n\nUSAGE BDB :\n* Audit de tout livrable : mesurer Q × Q × T des 4 états.\n* Arbitrage session : ne pas sacrifier T pour Q ni l'inverse.\n* Skill conseil-bdb : vérifier que le livrable passe QQT avant présentation.\n\nSource : cadre classique en gestion de projet, popularisé en France par le MOOC Rémi Bachelet (1er MOOC certificatif français, janvier 2013).", children:[] },

        { id:'s5_2_11', titre:'Trépied humanitaire (TRIH) — Moyens ↔ Besoins ↔ Résultats',
          abbrev:'TRIH', attribution:'Adage de l\'aide humanitaire · source exacte à fiabiliser',
          statut:'a_verifier',
          note:"Principe d'alignement à 3 piliers. Si un pilier manque, les deux autres produisent du hors-sujet.\n\n1. Moyens — ressources engagées (temps, argent, énergie, outils, personnel).\n2. Besoins — ce que les bénéficiaires expriment RÉELLEMENT (pas fantasmé par le donneur).\n3. Résultats — ce qui est effectivement atteint.\n\nLECTURE DOCTRINALE BDB :\n« Si BDB déploie des trésors de moyens mais que les interlocuteurs n'expriment aucun besoin, alors les résultats obtenus ne seront que hors sujet, gaspillage et perte de temps. »\n\nMODULES BDB QUI SERVENT LE RECUEIL DES BESOINS :\n* Recueil de situations bloquantes (STB) — situations où le terrain bloque.\n* Boîte à idées — suggestions libres des membres.\n* Interview — entretiens individuels structurés.\n* Questionnaires MMVS — recueil qualifié avec viralité intégrée.\n\nLien avec la chaîne causale CHAINE : le trépied s'applique à l'étape 1 (SA → SR) — sans recueil du vécu réel, toute la chaîne part en production de Moyens sur des Besoins inventés.\n\nRègle BDB : aucune solution BDB ne part en production sans avoir été adossée à un recueil de besoins terrain explicite, documenté, daté. Pas d'adoption sans compréhension des besoins RÉELS (forme · wording · coloration DISC).", children:[] },

        { id:'s5_2_12', titre:'Adage Franklin — « Tu me dis, j\'oublie. Tu m\'enseignes, je me souviens. Tu m\'impliques, j\'apprends. »',
          abbrev:'ADAGE-FRA', attribution:'Attribué à Benjamin Franklin (attribution à fiabiliser — origine discutée)',
          statut:'a_verifier',
          note:"Adage doctrinal d'ancrage pour l'étape R (Recette) et E (Exercice) de MERE.\n\nLa puissance pédagogique croît avec le degré d'IMPLICATION de l'apprenant :\n* Dire (transmission passive) → oubli.\n* Enseigner (transmission explicative) → mémorisation partielle.\n* Impliquer (passage à l'action, exercice, complication) → apprentissage réel.\n\nSource exacte à fiabiliser : la citation est massivement attribuée à Franklin mais l'attribution directe n'est pas documentée dans ses écrits. Probable formulation tardive inspirée de son esprit. À vérifier en session bibliographie dédiée.\n\nUSAGE BDB : justifier doctrinalement le design des modules pédagogiques avec exercices intégrés (Carnet de Bord, Intégration IDE, quiz, mises en situation). Jamais de module sans « étape E-Exercice ».", children:[] },

        { id:'s5_2_13', titre:'Adage Boileau — « Ce qui se conçoit bien s\'énonce clairement »',
          abbrev:'ADAGE-BOI', attribution:'Nicolas Boileau-Despréaux · L\'Art poétique · Chant I · 1674',
          note:"Adage doctrinal pour l'étape E (Explication) de MERE et pour la rédaction FAB.\n\nCitation exacte : « Ce qui se conçoit bien s'énonce clairement, et les mots pour le dire arrivent aisément. » (L'Art poétique, 1674, vers 153).\n\nLECTURE DOCTRINALE :\n* Si on ne peut pas énoncer un principe clairement, c'est qu'on ne l'a pas conçu clairement.\n* L'obscurité rédactionnelle est un test de compréhension manquée, pas un signe d'expertise.\n* S'applique à toute documentation BDB : si un principe ne tient pas en une phrase claire, il n'est pas prêt.\n\nAnti-pattern à éviter : écrire du jargon technique pour masquer une compréhension incomplète. Cf ERR-IA-17 Abréviation-Ambiguë (par ex. écrire « SA SR » sans définir ni Situation Actuelle ni Situation Rêvée).", children:[] }
      ]},

      /* --- 5.3 EXCLUSIONS DÉLIBÉRÉES (6 en DB) --- */
      { id:'s5_3', titre:'Exclusions délibérées (6 en DB catégorie exclusion)',
        collapsed:true, children:[
        { id:'s5_3_01', titre:'Diagramme Venn Ikigai (EX-IKI-VENN) — Zuzunaga 2011 / Winn 2014',
          abbrev:'EX-IKI-VENN',
          note:"Construction occidentale post-hoc, écrase le sens japonais authentique. NE JAMAIS utiliser dans BDB.", children:[] },
        { id:'s5_3_02', titre:'4 styles d\'apprentissage de Kolb (EX-KOLB-STYLES)', abbrev:'EX-KOLB-STYLES',
          note:"Risque de catégorisation rigide documenté. Seul le cycle 4 phases est retenu.", children:[] },
        { id:'s5_3_03', titre:'Typologie Ennéagramme 9 types (EX-ENN-9T)', abbrev:'EX-ENN-9T',
          note:"Trop complexe opérationnellement. Seule la théorie des 3 centres est retenue.", children:[] },
        { id:'s5_3_04', titre:'Contenu routier du REMC (EX-REMC-CONT)', abbrev:'EX-REMC-CONT',
          note:"BDB n'est pas une auto-école. Seule la structure pédagogique hiérarchique est empruntée.", children:[] },
        { id:'s5_3_05', titre:'Théories MBTI (EX-MBTI)', abbrev:'EX-MBTI',
          note:"Débat scientifique sur la validité statistique. Non retenu comme cadre structurant.", children:[] },
        { id:'s5_3_06', titre:'Intelligences multiples de Gardner — 8 intelligences (EX-GARDNER)', abbrev:'EX-GARDNER',
          note:"Trop large pour usage opérationnel. « Portes d'entrée » réinjectées via Ennéagramme 3 centres.", children:[] }
      ]}
    ]},

    /* ========== 6. PATHOLOGIES PAR ACTEUR ========== */
    { id:'s6', titre:'Pathologies par acteur', collapsed:false, children:[
      { id:'s6_1', titre:'Pathologies humaines (CNT Flin · DISC · burnout · perte de sens)', collapsed:true, children:[] },
      { id:'s6_2', titre:'★ Pathologies Claude (ERR-IA-*)',
        note:"Liste vivante. Chaque pathologie = une ligne persistée (atelier_principes catégorie erreur_ia ou table dédiée — à FAB3R).",
        collapsed:false, children:[

        { id:'s6_2_01', titre:'ERR-IA-01 Hallu-Schéma — inventer colonne/table/enum sans vérifier la DB',
          abbrev:'HALLU-SCHEMA',
          note:"Déclencheurs : « il doit y avoir une colonne X », « on peut ajouter une FK vers Y ».\nRemède : introspection obligatoire (pg_proc, information_schema, pg_get_constraintdef) avant tout INSERT/DDL.\nCouvert partiellement par règle session #90.",
          realite:"Claude a tendance à supposer la présence de colonnes non vérifiées en base, ou à inventer des enums.",
          risque:"Claude · au moment de produire un SQL · migration qui échoue ou corrompt les données cloud.",
          resultat:"Zéro INSERT/DDL sans requête d'introspection préalable, traçable dans la session.",
          recommandation:"Rendre l'introspection obligatoire via skill supabase-bdb pré-exécution + prompt reprise V4.", children:[] },

        { id:'s6_2_02', titre:'ERR-IA-02 Hallu-Chemin — inventer fichier / dossier fantôme',
          abbrev:'HALLU-CHEMIN',
          note:"Ex : _atelier/, site/.\nRemède : view sur chemin réel avant toute référence dans un livrable.", children:[] },

        { id:'s6_2_03', titre:'ERR-IA-03 Oubli-CDS — escHtml · .select() · 3 états · console.log résiduel',
          abbrev:'OUBLI-CDS',
          note:"Couvert par skill cds-compliance mais violations persistent.\nRemède : audit post-production grep systématique + skill recettage-bdb obligatoire.", children:[] },

        { id:'s6_2_04', titre:'ERR-IA-04 Saut-Terrain — coder avant vérifier DB/fichier réel',
          abbrev:'SAUT-TERRAIN',
          note:"Remède : project_knowledge_search obligatoire avant toute production. Règle userPreferences, à ancrer en DB.", children:[] },

        { id:'s6_2_05', titre:'ERR-IA-05 Flatterie-Lèche — valider sans auto-diagnostic',
          abbrev:'FLATTERIE-LECHE',
          note:"Jeu AT « Je suis d'accord avec tout ce que tu dis ».\nRemède : skill conseil-bdb 5 lunettes obligatoire avant livrable à impact.", children:[] },

        { id:'s6_2_06', titre:'ERR-IA-06 Amnésie inter-sessions — refaire la même erreur',
          abbrev:'AMNESIE',
          note:"Phase Kolb 3 cassée. Pathologie mère des autres.\nRemède : référentiel DB persistant + prompt reprise enrichi.", children:[] },

        { id:'s6_2_07', titre:'ERR-IA-07 Boulimie-Code — produire avant comprendre',
          abbrev:'BOULIMIE-CODE',
          note:"Phase Kolb 2 sautée.\nRemède : GFC-04 brainstorm obligatoire, reformulation systématique.", children:[] },

        { id:'s6_2_08', titre:'ERR-IA-08 Atomisation — ramener systèmes au cas individuel',
          abbrev:'ATOMISATION',
          note:"Nommée session 2026-04-19.\nEx : MERE/Kolb ramené à Claude seul, oubliant L1/L2/L3 et tous les autres acteurs.", children:[] },

        { id:'s6_2_09', titre:'ERR-IA-09 Imposition-Linéaire — proposer séquences au lieu d\'une structure macro vide',
          abbrev:'IMPOSITION-LINEAIRE',
          note:"Nommée session 2026-04-19.\nManu pense en heuristique itérative (RNL), pas en 1 → 2 → 3.", children:[] },

        { id:'s6_2_10', titre:'ERR-IA-10 Non-Application-Fractale — doctrine non appliquée à l\'outil qui la pense',
          abbrev:'NON-APP-FRACT',
          note:"Nommée session 2026-04-19.\nLa doctrine BDB est hologrammatique (Morin §5).\nProduire un artefact qui parle de la doctrine sans la respecter = violation.",
          realite:"Premier jet V1 de ce même outil livré en React + Tailwind alors qu'il parle des règles CDS. Vécu côté Manu : « l'arbre n'est pas CDS compliant ».",
          fonction:"Claude livre du code conforme à la stack cible, même pour des outils méta sur la doctrine.",
          avantage:"vs livrer rapidement en React/Tailwind pour gagner du temps : évite le retravail et la trahison doctrinale.",
          benefice:"Un outil doctrinal BDB déployable dans l'écosystème BDB sans refonte. Cohérence visuelle avec le reste de l'app.",
          risque:"Claude · à chaque production d'outil méta · livrable hors stack, non déployable, disqualifiant pour BDB.",
          resultat:"Tout outil doctrinal BDB produit par Claude respecte la stack CDS (BS 5.3.3 + Smarty V5 + Bootstrap Icons + system-ui + vanilla JS).",
          recommandation:"Ajouter check d'auto-application dans skill conseil-bdb 5 lunettes (lunette créateur). Déclencher cds-compliance même sur les outils méta.", children:[] },

        { id:'s6_2_11', titre:'ERR-IA-11 Stack-Trahison — trahir la stack CDS dans un livrable BDB',
          abbrev:'STACK-TRAHISON',
          note:"Nommée session 2026-04-19.\nStack BDB : HTML vanilla · BS 5.3.3 · theme-base.css Smarty V5 @63905396 · Bootstrap Icons 1.11.1 · system-ui · vanilla JS · storage API.\nINTERDIT-CDS-01→04 s'appliquent.",
          realite:"Claude peut défaut sur React + Tailwind pour la rapidité au lieu d'appliquer la stack BDB. Manu a signalé cela session 2026-04-19.",
          fonction:"Forcer Claude à appliquer la chaîne CSS/JS BDB complète (voir CHANTIER_TECHNIQUE §C.11) dans tout livrable HTML/CSS/JS.",
          avantage:"vs défaut React/Tailwind : alignement avec le reste de l'écosystème BDB, déploiement direct sur OVH sans refonte.",
          benefice:"Tout livrable est déployable dans BDB. Gain de temps global (pas de retravail).",
          risque:"Claude · au moment de livrer du HTML/CSS/JS · outil inutilisable dans BDB, à refaire intégralement, perte de confiance de Manu.",
          resultat:"Zéro fichier livré à Manu qui ne respecte pas la chaîne CSS/JS de CHANTIER_TECHNIQUE §C.11.",
          recommandation:"Skill auto-audit CDS déclenché AVANT create_file. Si HTML/CSS/JS, vérifier chaîne complète : Bootstrap 5.3.3 · Bootstrap Icons 1.11.1 · theme-base.css Smarty V5 hash complet · zéro @latest · zéro Google Fonts · zéro Font Awesome.", children:[] },

        { id:'s6_2_12', titre:'ERR-IA-12 Squelette-Amnésique — ignorer les sources de vérité existantes',
          abbrev:'SQUELETTE-AMN',
          note:"Nommée session 2026-04-19.\nPoser un squelette vide au lieu de peupler depuis atelier_principes (177 lignes), doctrine 04_PEDAGOGIE (11 principes), etc.",
          realite:"Le V1 de ce même outil n'a pas pompé les 177 lignes DB, ni les 21 principe_nomme, ni les 313 decisions atelier_decisions. Squelette vide livré.",
          fonction:"Forcer Claude à lire EXHAUSTIVEMENT les fichiers projet avant de produire un livrable doctrinal.",
          avantage:"vs squelette vide : Manu n'a pas à tout remplir à la main, gain de tokens et d'énergie cognitive.",
          benefice:"Livrable utile immédiatement, itération plus rapide.",
          risque:"Manu · à chaque remplissage manuel · perte de tokens et frustration cognitive · perte de confiance dans l'outil Claude.",
          resultat:"Tout squelette V2+ est pré-peuplé depuis project_knowledge_search exhaustif des fichiers doctrine du projet.",
          recommandation:"Règle : avant tout create_file de doctrine, lire TOUS les fichiers du projet liés au sujet (project_knowledge_search multiple queries). Intégrer dans skill atelier-session-bdb.", children:[] },

        { id:'s6_2_13', titre:'ERR-IA-13 Aplatissement-de-Cadre — traiter un résumé aplati comme cadre autonome',
          abbrev:'APLAT-CADRE',
          note:"Nommée session 2026-04-20.\nLes documents data métier Manu sont souvent des VULGARISATIONS aplaties de cadres plus profonds.\nEx : Matrice ARE = vulgarisation Ennéagramme 3 centres. Diagramme Venn Ikigai = aplatissement du sens japonais authentique.",
          realite:"J'ai traité la Matrice ARE en V2 comme principe autonome, alors qu'elle est un résumé pédagogique de l'Ennéagramme 3 centres (qui lui-même est une simplification des 9 types).",
          fonction:"Forcer Claude à remonter au cadre parent avant d'intégrer un document Manu comme principe.",
          avantage:"vs intégration littérale : évite de figer une vulgarisation en cadre doctrinal définitif.",
          benefice:"Profondeur doctrinale préservée. Références croisées correctes.",
          risque:"Claude · à chaque réception d'un document data métier · doctrine appauvrie, perte de profondeur, contresens académique.",
          resultat:"Tout document data métier reçu est classé comme VULGARISATION avec lien vers son cadre parent, pas comme principe autonome.",
          recommandation:"Avant intégration : identifier le cadre parent (Ennéagramme, Kolb, Maslow, Berne…) et positionner la vulgarisation comme sous-branche, pas comme principe de premier rang.", children:[] },

        { id:'s6_2_14', titre:'ERR-IA-14 Source-Détournée — ne pas documenter la filiation réelle',
          abbrev:'SOURCE-DETOURNEE',
          note:"Nommée session 2026-04-20.\nNe pas tracer la filiation intellectuelle d'un concept = perte de profondeur et risque d'attribution erronée.",
          realite:"J'ai confondu FAB (méthode marketing David Jay) avec FAB(3R) (extension David Jay aussi, pas Manu) sans documenter la filiation complète.",
          fonction:"Forcer la documentation de la filiation : auteur d'origine → extensions éventuelles → usage BDB.",
          avantage:"vs attribution floue : traçabilité intellectuelle complète, aucun concept orphelin.",
          benefice:"Aucune dérive attributionnelle possible. Audit académique faisable.",
          risque:"Claude · à chaque mention d'un principe dérivé · filiation perdue, attribution erronée, ERR-IA-18 Hallucination-Attribution possible.",
          resultat:"Tout principe documenté porte : auteur d'origine + contexte d'origine + éventuelle extension + usage BDB.",
          recommandation:"Utiliser structure : « X (origine auteur Y, année Z) + extension (auteur W, année) + adoption BDB (usage contextuel) ».", children:[] },

        { id:'s6_2_15', titre:'ERR-IA-15 Lecture-Littérale — prendre les résumés Manu comme vérité finale',
          abbrev:'LECTURE-LITTERALE',
          note:"Nommée session 2026-04-20.\nLes documents data métier Manu sont des aplatissements opérationnels de cadres plus profonds.\nLes prendre littéralement = rater le cadre parent.",
          realite:"Face au document capture 2018 MERE (objectifs cognitifs Attention/Ancrage/Priming/Action), j'ai pris les 4 mots sans remonter à David Jay Révolution Vidéo.",
          fonction:"Forcer Claude à systématiquement chercher le cadre parent d'un document reçu.",
          avantage:"vs lecture littérale : reconstitue le contexte, les sources, les nuances perdues à la vulgarisation.",
          benefice:"Doctrine BDB alignée avec les sources académiques, pas avec les post-it pédagogiques.",
          risque:"Claude · à chaque document data métier · doctrine appauvrie par accumulation de vulgarisations non-reliées.",
          resultat:"Tout document data métier reçu déclenche une recherche du cadre parent (web, projet, autres docs).",
          recommandation:"Skill à créer : « lecture-profonde-data-metier » — identifie vulgarisation, remonte au cadre parent, documente la filiation.", children:[] },

        { id:'s6_2_16', titre:'ERR-IA-16 Hallucination-3R — inventer Réalité/Résultat/Recommandation comme triptyque 3R',
          abbrev:'HALLU-3R',
          note:"Nommée session 2026-04-20.\nJ'ai inventé R1=Réalité / R2=Résultat / R3=Recommandation, alors que la vraie structure David Jay est R1=Réalité / R2=Risques (CNA+CNP) / R3=Résultats.",
          realite:"V2 livrée avec les 3 FAB(3R) pré-remplis sur ERR-IA-10, 11, 12 selon ma fausse structure. Cascade d'erreurs doctrinales dépendantes.",
          fonction:"Ancrer la vraie structure FAB(3R) dans toute production Claude. Zéro dérive possible.",
          avantage:"vs hallucination structurelle : cohérence avec la source David Jay et la DB atelier_principes (colonnes migration 147).",
          benefice:"Toute la chaîne doctrinale dépendante (ERR-IA pré-remplies, principes nommés, implications produit) est cohérente.",
          risque:"Claude · à chaque mention FAB(3R) · si la structure est fausse, tous les raisonnements doctrinaux en aval sont faux.",
          resultat:"Structure FAB(3R) utilisée partout : R1=Réalité/SA · R2=Risques/CNA+CNP · R3=Résultats/SR · Recommandation=7e champ de tranchage.",
          recommandation:"Skill fab3r-bdb doit contenir la définition exacte des 7 champs. Relecture obligatoire avant tout INSERT atelier_principes.", children:[] },

        { id:'s6_2_17', titre:'ERR-IA-17 Abréviation-Ambiguë — écrire une abréviation sans définition à portée',
          abbrev:'ABREV-AMBIGUE',
          note:"Nommée session 2026-04-20.\nÉcrire « SA SR » dans une note sans définir SA et SR dans la même note = source d'hallucination à relecture différée (dans 6 mois, illisible).",
          realite:"V2 contenait des abréviations non explicitées dans les notes (SA, SR, CNA, CNP, CDS, CNT…).",
          fonction:"Règle CONV-NOMMER-COMPLET-01 appliquée systématiquement dans chaque note.",
          avantage:"vs abréviations non-explicitées : doctrine lisible dans 6 mois, zéro régression cognitive.",
          benefice:"Manu peut rouvrir le fichier dans 6 mois et comprendre sans contexte.",
          risque:"Claude · à chaque note utilisant une abréviation · illisibilité future, source d'hallucination à la relecture, perte de la valeur doctrinale.",
          resultat:"Toute abréviation dans une note est explicitée AU MOINS UNE FOIS dans la même note.",
          recommandation:"Voir principe doctrinal CONV-NOMMER-COMPLET-01 en section 0.4 Cadre.", children:[] },

        { id:'s6_2_18', titre:'ERR-IA-18 Hallucination-Attribution — inventer un auteur pour crédibiliser',
          abbrev:'HALLU-ATTRIBUTION',
          note:"Nommée session 2026-04-20.\nJ'ai inventé « Bertrand Kervella » comme auteur de MERE/NAMI/MMVS alors que la vraie source est David Jay (VIPSee / La Révolution Vidéo).",
          realite:"Tendance naturelle à combler un vide d'attribution par un nom plausible pour rendre le propos crédible.",
          fonction:"Règle CONV-ATTRIBUTION-01 : vérification web obligatoire avant toute attribution, même si Manu l'a affirmée.",
          avantage:"vs invention : intégrité doctrinale totale, aucune attribution fictive dans la DB.",
          benefice:"Doctrine BDB auditable académiquement. Confiance préservée.",
          risque:"Claude · à chaque mention d'auteur non vérifié · doctrine corrompue, propagation d'une hallucination en DB, discrédit si détecté.",
          resultat:"Zéro attribution non vérifiée. Vide > Inventé. Web search obligatoire sur toute nouvelle attribution.",
          recommandation:"Skill atelier-session-bdb doit bloquer tout INSERT atelier_principes avec attribution non-vide non-vérifiée. Voir CONV-ATTRIBUTION-01 en section 0.6 Cadre.", children:[] },

        { id:'s6_2_19', titre:'ERR-IA-19 Attribution-Par-Défaut-BDB — attribuer à BDB par défaut ce dont la source n\'est pas trouvée',
          abbrev:'ATTR-DEFAULT-BDB',
          note:"Nommée session 2026-04-20.\nDérive de la précédente : si je ne trouve pas la source externe, je suppose automatiquement que c'est BDB / Manu. Faux.",
          realite:"J'ai supposé que FAB(3R) extension 7 champs était « Manuel Rohaut / BDB » simplement parce que présent en DB migration 147. Or FAB(3R) complet est bien de David Jay.",
          fonction:"Distinguer PRÉSENCE en DB (adoption BDB) et PATERNITÉ (auteur d'origine).",
          avantage:"vs attribution par défaut BDB : intégrité totale, BDB ne s'auto-promeut pas sur du travail d'autrui.",
          benefice:"Positionnement honnête de BDB comme adoptant / contextualisateur, pas faux auteur.",
          risque:"Claude · à chaque principe en DB sans attribution claire · auto-promotion BDB non méritée, risque juridique de faux credit, perte de crédibilité académique.",
          resultat:"Le champ attribution d'atelier_principes = filiation intellectuelle RÉELLE, pas reflet de la présence en DB.",
          recommandation:"Règle absolue : si l'origine externe n'est pas trouvée après web search, attribution = vide ou « source à confirmer ». JAMAIS « BDB / Manuel Rohaut » par défaut.", children:[] }
      ]},
      { id:'s6_3', titre:'Pathologies dyade Nous (sur-délégation · sous-reformulation · tannage)', collapsed:true, children:[] }
    ]},

    /* ========== 7. BIAIS COGNITIFS (branche ouverte macro>micro) ========== */
    { id:'s7', titre:'★ Biais cognitifs (BIAIS) — macro × micro par domaine BDB',
      abbrev:'BIAIS',
      note:"Branche ouverte volontairement.\nOn ne cherche pas un catalogue infini.\nOn identifie les biais au moment où ils se produisent et on les range par domaine BDB.\nChaque biais porte sa règle de détection pro-active.",
      collapsed:false, children:[

      { id:'s7_1', titre:'Domaine : Adoption · Technophobie',
        collapsed:true, children:[
        { id:'s7_1_1', titre:'Biais de rejet technophobe (à définir)',
          note:"Signal : phrases type « je n'aime pas les écrans », « ça va encore buguer ».\nDétection pro-active : proposer alternative papier + démo courte.", children:[] },
        { id:'s7_1_2', titre:'Effet Dunning-Kruger inversé — sous-estimation de sa propre compétence numérique',
          note:"Signal : « je ne saurai jamais faire ».\nDétection pro-active : onboarding guidé pas-à-pas + persona-guard.", children:[] }
      ]},

      { id:'s7_2', titre:'Domaine : Pédagogie', collapsed:true, children:[] },

      { id:'s7_3', titre:'Domaine : Esthétique · Première impression',
        note:"Retours terrain filles Chénieux : rejet sur couleur/logo AVANT ouverture de l'app.",
        collapsed:false, children:[
        { id:'s7_3_1', titre:'Effet de halo négatif — couleur ou logo qui rebute',
          note:"Signal : « c'est pas joli », « ça fait pas pro », « la couleur me saoule » avant même d'avoir ouvert l'app.\nDétection pro-active : A/B test visuels, demander ce qui rebute précisément, ouvrir paramètre couleur d'instance (bdbApp.couleur).", children:[] },
        { id:'s7_3_2', titre:'Jugement « à la couverture » — l\'app jugée sur son écran d\'accueil', children:[] }
      ]},

      { id:'s7_4', titre:'Domaine : Reconnaissance locale',
        note:"« Nul n'est prophète en son pays ». Les users connaissent Manu personnellement donc minimisent sa production.",
        collapsed:false, children:[
        { id:'s7_4_1', titre:'Biais de familiarité — « c\'est Manu qui l\'a fait donc ça vaut pas grand-chose »',
          note:"Contempt of familiarity.\nDétection pro-active : faire présenter par tiers externe (Ewan, Olivia), documenter les attributions académiques (Boudreault, Benner, Flin…) pour élever la perception.", children:[] },
        { id:'s7_4_2', titre:'« Le cordonnier mal chaussé » — Manu IDE donc pas crédible en dev', children:[] }
      ]},

      { id:'s7_5', titre:'Domaine : IA spécifique',
        collapsed:true, children:[
        { id:'s7_5_1', titre:'Biais d\'autorité IA — « l\'IA l\'a dit donc c\'est vrai »',
          note:"Remède : skill conseil-bdb 5 lunettes + ERR-IA-05 Flatterie-Lèche.", children:[] },
        { id:'s7_5_2', titre:'Biais de sycophance — IA qui flatte pour plaire',
          note:"Remède : contrat-humain-ia, ERR-IA-05.", children:[] }
      ]},

      { id:'s7_6', titre:'Règles de détection pro-active (à étendre)',
        note:"Forme : « Quand l'utilisateur dit/fait X → biais Y probable → proposition Z ».\nÀ ancrer à terme dans atelier_principes catégorie biais ou table dédiée.",
        children:[] }
    ]},

    /* ========== 8. IMPLICATIONS PRODUIT ========== */
    { id:'s8', titre:'★ Implications produit (point d\'entrée session 2026-04-19)',
      note:"Point d'entrée Manu : « capacité de l'IA à respecter règles/interdits/audits + documenter pour ne pas perdre tokens sur erreurs déjà rencontrées ».",
      collapsed:false, children:[

      { id:'s8_1', titre:'Persistance erreurs-types Claude (table DB)',
        note:"Arbitrage : nouvelle table atelier_erreurs_ia VS extension atelier_principes catégorie erreur_ia.\nPréférence doctrine : fusion > VIEW > nouvelle table.\nÀ passer au FAB(3R) avant arbitrage.", children:[] },

      { id:'s8_2', titre:'Structure FAB(3R) par erreur-type',
        note:"Champs : ref · nom_court · declencheur_detectable · exemple_concret · remede_protocolaire · skill_ou_regle_associe · date_apparition · frequence · statut · niveau_gravite P1/P2/P3 · phase_kolb_cassee.", children:[] },

      { id:'s8_3', titre:'Mobilisation en début de session (atelier_prompt_reprise V4)',
        note:"Ajouter section erreurs_claude_actives : top 5 pathologies récentes + remèdes associés.\nCoût token estimé : +300 tokens pour éviter des centaines de retravail.", children:[] },

      { id:'s8_4', titre:'Mobilisation intra-session (skill claude-auto-audit-bdb)',
        note:"Nouveau skill déclenché AVANT toute livraison code/SQL/doc.\nQuestions : quelles ERR-IA-* sont à risque sur cette tâche ? Vérifications forcées.", children:[] },

      { id:'s8_5', titre:'Propagation L3 → L2 → L1',
        note:"Une ERR-IA conceptualisée avec Manu (L3) doit pouvoir être lue par un Claude aidant Ewan (L2) ou un Claude d'une future instance (L1).\nMécanisme : DB cloud partagée = source unique pour tout Claude connecté à une instance.", children:[] },

      { id:'s8_6', titre:'Tags contenus BDB : acteur × étage MERE × niveau Boudreault × domaine CNT',
        note:"Couvert partiellement dans §6 doctrine 04_PEDAGOGIE. À articuler avec §8.1–8.5.", children:[] }
    ]},

    /* ========== 9. RÈGLES & INTERDITS (miroir DB) ========== */
    { id:'s9', titre:'Règles & interdits (miroir atelier_principes)',
      note:"Reflet des catégories opérationnelles en base. Distribution 2026-04-18 dans doctrine 02_SUPABASE_DATA_MODEL.",
      collapsed:true, children:[
      { id:'s9_1', titre:'Conventions (36 CONV-*)', children:[] },
      { id:'s9_2', titre:'Interdits (36 INTERDIT-*)',
        note:"Dont INTERDIT-CDS-01/02/03/04, INTERDIT-PSQL-CLOUD-01, INTERDIT-SQL-01, INTERDIT-PS1, INTERDIT-JS-01/02/03.", children:[] },
      { id:'s9_3', titre:'Garde-fous (6 GFC-*)', note:"Dont GFC-04 brainstorm obligatoire avant production sur décision architecturale.", children:[] },
      { id:'s9_4', titre:'Erreurs (4 ERREUR-*)',
        note:"Dont ERREUR-13 : jamais UPDATE protocole_operatoire sur rows déjà mappées à un protocole_id.", children:[] },
      { id:'s9_5', titre:'RGPD (2 RGPD-*)', children:[] },
      { id:'s9_6', titre:'Anti-IA (8 règles CANON §8)', children:[] },
      { id:'s9_7', titre:'Tech (9 : USAGE · PROPRIETE · TRANSVERSE · INSTANCE · SIGNALEMENT · LECTURE · VALIDATION · ADOPTION …)', children:[] },
      { id:'s9_8', titre:'Pacte produit (4 : METRIQUES-ADOPTION-01 · TRIPLE-LEGIT-01 · ESCALADE-01 · CONSEIL-5-01)',
        note:"Nouvelle catégorie v1.23.0. Cohérence mini-site ↔ app.", children:[] }
    ]},

    /* ========== 10. SOURCES DE VÉRITÉ ========== */
    { id:'s10', titre:'Sources de vérité (6 source_verite — CANON §10)',
      note:"Règles éditoriales du discours BDB.", collapsed:true, children:[] },

    /* ========== 11. STB (8) ========== */
    { id:'s11', titre:'Situations de blocage terrain (STB — 8 lignes DB)', collapsed:true, children:[] },

    /* ========== 12. USER STORIES (7) ========== */
    { id:'s12', titre:'User stories (7 : US-IB · US-AS · US-CH · US-CA)', collapsed:true, children:[] },

    /* ========== 13. FORKS OUVERTS ========== */
    { id:'s13', titre:'Forks ouverts (branches à explorer sans bloquer le tronc)',
      note:"Déposer ici toute idée, « et si », doute, question qui ne doit pas bloquer le tronc.",
      collapsed:false, children:[] },

    /* ========== 14. ARBITRAGES DIFFÉRÉS ========== */
    { id:'s14', titre:'Arbitrages différés (à ne PAS trancher maintenant)',
      collapsed:true, children:[] },

    /* ========== 15. BIBLIOGRAPHIE ========== */
    { id:'s15', titre:'Bibliographie (BIBLIO) — sources doctrinales',
      abbrev:'BIBLIO',
      note:"Source unique de vérité pour les attributions. Toute citation d'auteur dans un principe doit avoir son pendant ici (CONV-BIBLIO-01).\n\nStatuts possibles :\n* active — source vérifiée, référence complète (auteur · titre · éditeur · année · ISBN/DOI).\n* a_verifier — attribution de principe mais référence exacte à fiabiliser (via livre physique de Manu, MOOC, site officiel…).\n* support_formation_privee — formation non publiée en livre (mindmaps, vidéos VIPSee, ateliers privés).\n* externe_non_consulte — cité mais non lu par Manu ni Claude.\n\nClassement : 6 domaines × auteurs alphabétiques.\n\nCe module nourrira le futur module BDB « Veille documentaire » (V3.x ultérieur).",
      collapsed:true, children:[

      /* --- 15.1 Pédagogie --- */
      { id:'s15_1', titre:'Pédagogie · Didactique · Compétences',
        collapsed:true, children:[
        { id:'s15_1_01', titre:'Bachelet Rémi · MOOC Gestion de Projet · Centrale Lille · depuis 2013',
          abbrev:'BIB-BACHELET-2013', statut:'active',
          note:"Docteur en sciences de gestion · maître de conférences Centrale Lille.\nCréateur du MOOC Gestion de Projet, 1er MOOC certificatif français (ouverture 11 janvier 2013).\nSite officiel : https://gestiondeprojet.pm\nReconnu ECTS de Centrale Lille.\nPrincipe rattaché : QQT (Qualité × Quantité × Temps).\nStatut : actif, ressources librement accessibles (Creative Commons)." },
        { id:'s15_1_02', titre:'Benner Patricia · De novice à expert · 1984',
          abbrev:'BIB-BENNER-1984', statut:'active',
          note:"De novice à expert : excellence en soins infirmiers.\nTraduction française : Elsevier Masson.\nISBN 978-2-294-01504-5.\nPrincipe rattaché : BEN (Novice → Expert, 5 stades).\nBase doctrinale majeure pour les niveaux Julie (novice) → Sabine (expert) de BDB." },
        { id:'s15_1_03', titre:'Boudreault Henri · Didactique professionnelle · 2002, 2008',
          abbrev:'BIB-BOUDREAULT-DID', statut:'active',
          note:"CRAIE (Centre de Recherche Appliquée en Instrumentation de l'Enseignement) / UQAM.\nBlog : http://didapro.me\nPrincipes rattachés :\n* BDT-DID (Savoir × Savoir-faire × Savoir-être)\n* BDT-NIV (Grille 6 niveaux — Survivant → Excellence, DIDAPRO 2019)\n* BDT-TAX (Taxonomies triangulées Jewett 1971 / Bloom 1956 / Krathwohl 1964, adaptation 2009).\nAttitudes professionnelles 2004 (21 attitudes).\nNuances du savoir-être (18 nuances SE-A / SE-B / SE-C)." },
        { id:'s15_1_04', titre:'Flin Rhona · Maran Nikki · Enhancing surgical performance (CNT / NOTECHS) · 2015',
          abbrev:'BIB-FLIN-2015', statut:'active',
          note:"Rhona Flin (University of Aberdeen, Scotland) · Nikki Maran.\nDérivation CRM aviation appliqué au bloc opératoire.\n6 domaines CNT : conscience situation · décision · gestion tâches · équipe · communication · stress.\nGrille NOTECHS.\nCas Elaine Bromiley (2005) documente l'impact des CNT.\nÉtude IBODE CHU Montpellier : Guignard & Bentz (2024).\nPrincipe rattaché : CNT (Compétences Non Techniques)." },
        { id:'s15_1_05', titre:'Knowles Malcolm · Andragogie · 1970 et suivantes',
          abbrev:'BIB-KNOWLES', statut:'a_verifier',
          note:"Référence exacte à vérifier — probablement : Knowles, M. S. (1970). The Modern Practice of Adult Education: Andragogy Versus Pedagogy. New York: Association Press.\nPrincipe rattaché : ANDRAGO (Andragogie).\nVérification à faire en session bibliographie (collection Manu)." },
        { id:'s15_1_06', titre:'Kolb David A. · Experiential Learning · 1984 · Prentice Hall',
          abbrev:'BIB-KOLB-1984', statut:'active',
          note:"Kolb, D. A. (1984). Experiential Learning: Experience as the Source of Learning and Development. Englewood Cliffs, NJ: Prentice Hall.\nPrincipe rattaché : KOLB (cycle 4 phases — EC · OR · CA · EA).\nExclusion : les 4 styles d'apprentissage Kolb (divergent/assimilateur/convergent/accommodateur) sont délibérément exclus en V1 de la doctrine BDB (risque de catégorisation rigide)." },
        { id:'s15_1_07', titre:'Référentiel IBODE 2022 · Arrêté 27 avril 2022',
          abbrev:'BIB-IBODE-2022', statut:'active',
          note:"Arrêté du 27 avril 2022 relatif au diplôme d'État d'infirmier de bloc opératoire.\nJORFTEXT000045696964.\nPublié au JORF.\nPrincipe rattaché : REF-IBODE (Référentiel IBODE 2022).\nSource officielle : https://www.legifrance.gouv.fr" },
        { id:'s15_1_08', titre:'Barrand Jérôme · Le manager agile · Dunod · 2025',
          abbrev:'BIB-BARRAND-2025', statut:'active',
          note:"Dunod · 2025.\nISBN 978-2-10-087936-6.\nPrincipe rattaché : POULET (Performance · Octroi · Utilité · Légitimité · Engagement · Transmission).\n6 questions d'alignement, intégrateur transverse.\nAgile Profile® (3 postures) exclu V1 de la doctrine BDB (trop large)." }
      ]},

      /* --- 15.2 Marketing · Communication --- */
      { id:'s15_2', titre:'Marketing · Communication',
        collapsed:true, children:[
        { id:'s15_2_01', titre:'Jay David (Guigue David) · La Révolution Vidéo / VIPSee · 2011+',
          abbrev:'BIB-JAY-2011', statut:'support_formation_privee',
          note:"Ancien orthophoniste.\nFondateur de la méthode VIPSee et de la formation privée La Révolution Vidéo.\nSite : http://www.vipsee-video.com\nSupports : vidéos de formation privée, mindmaps (non publiés en livre papier).\n\nPrincipes rattachés (tous attribués David Jay) :\n* MERE (Motivation / Explication / Recette / Exercice)\n* FAB (Fonction / Avantage / Bénéfice) + FAB(3R) (Réalité / Risques / Résultats / Recommandation)\n* NAMI (Naissance de l'Amitié comme Modèle d'Interaction)\n* MMVS (Magical Monkey Viral Sheet)\n* Fenêtre Étroite (positionnement entre amateur en caleçon et multinationale impersonnelle).\n\nSources fournies session 2026-04-20 : mindmaps Structure_MERE.mm · Méthode_FAB.mm · MMVS_rédaction.mm · PDF LaStrategieNAMI.pdf · PDF LaStructureMere.pdf · PDF LaFenetreEtroite.pdf · capture visuelle MERE 2018.\n\nStatut : support_formation_privee (non publié en librairie générale, accessible via formations privées de David Jay)." },
        { id:'s15_2_02', titre:'Kaufman Josh · The Personal MBA (PMBA) · 2010',
          abbrev:'BIB-KAUFMAN-2010', statut:'active',
          note:"Kaufman, J. (2010). The Personal MBA: Master the Art of Business. Portfolio/Penguin. ISBN 978-1-59184-352-8.\n10e édition anniversaire : ISBN 978-0-525-54302-2.\nSite : https://personalmba.com\n226 concepts business structurés en 12 chapitres.\n5 Parts of Every Business · 4 Methods to Increase Revenue · 12 Standard Forms of Value · Iron Law of the Market.\nStatut : référence à garder en réserve pour identifier des concepts opérationnels BDB (pas de principe directement rattaché aujourd'hui, à explorer)." }
      ]},

      /* --- 15.3 Management · Organisation --- */
      { id:'s15_3', titre:'Management · Organisation',
        collapsed:true, children:[
        { id:'s15_3_01', titre:'Deming W. Edwards · PDCA (Plan-Do-Check-Act)',
          abbrev:'BIB-DEMING', statut:'a_verifier',
          note:"Attribution principe PDCA à Walter Shewhart (1939) puis popularisé par W. Edwards Deming.\nRéférence exacte à vérifier — probablement : Deming, W. E. (1986). Out of the Crisis. MIT Press.\nPrincipe rattaché : PDCA.\nÀ fiabiliser en session bibliographie." },
        { id:'s15_3_02', titre:'Eisenhower Dwight D. · Matrice d\'urgence · 1954',
          abbrev:'BIB-EIS-1954', statut:'a_verifier',
          note:"Matrice Urgent / Important attribuée à Eisenhower, probablement formulée lors d'un discours de 1954.\nSource primaire à retrouver.\nPrincipe rattaché : EIS (Matrice Eisenhower).\nVérification bibliographique ultérieure." },
        { id:'s15_3_03', titre:'Nonaka Ikujiro · Takeuchi Hirotaka · The Knowledge-Creating Company · 1995',
          abbrev:'BIB-NONAKA-1995', statut:'active',
          note:"Nonaka, I., & Takeuchi, H. (1995). The Knowledge-Creating Company: How Japanese Companies Create the Dynamics of Innovation. Oxford University Press.\nPrincipe rattaché : SECI (Socialisation · Externalisation · Combinaison · Internalisation).\nMission centrale BDB : extraire le tacite (Sabine) pour le rendre explicite (BDB) puis combinable et internalisable (Julie)." },
        { id:'s15_3_04', titre:'Waterman Robert · Peters Thomas · Phillips Julien · 7S McKinsey · 1980',
          abbrev:'BIB-MCK-1980', statut:'active',
          note:"Waterman, R. H., Peters, T. J., & Phillips, J. R. (1980). Structure is not Organization. Business Horizons, 23(3), 14-26.\nModèle 7S McKinsey.\nPrincipe rattaché : MCK-7S (à intégrer V3.2).\nSource anglaise conservée · usage doctrinal en français (Stratégie · Structure · Systèmes · Compétences · Style · Équipe · Valeurs Partagées)." },
        { id:'s15_3_05', titre:'Wenger Etienne · Communities of Practice · 1998',
          abbrev:'BIB-WENGER-1998', statut:'a_verifier',
          note:"Wenger, E. (1998). Communities of Practice: Learning, Meaning, and Identity. Cambridge University Press.\nISBN 0-521-66363-6 (référence à confirmer).\nPrincipe rattaché : CoP (Communities of Practice)." },
        { id:'s15_3_06', titre:'Van Laethem Nathalie · Josset Jean-Marc · La boîte à outils des soft skills · Dunod · 2020',
          abbrev:'BIB-VANLAETHEM-2020', statut:'active',
          note:"Van Laethem, N., & Josset, J.-M. (2020). La boîte à outils des soft skills : 63 outils clés en main + 4 tests de compétences. Paris : Dunod. Collection BàO La Boîte à Outils.\nISBN 978-2-10-081079-6.\nDOI : 10.3917/dunod.vanl.2020.01.\n192 pages.\n10 compétences transversales : Réflexivité · Estime de Soi · Motivation · Créativité · Adaptabilité · Efficience & Organisation · Gestion du stress · Empathie · Aisance relationnelle · Coopération.\n63 outils répartis en 4 modules / 10 dossiers.\nÀ intégrer V3.3 comme référentiel d'objectifs pédagogiques pour modules BDB Carnet de Bord et Intégration IDE.\nIndice qualité : livre de référence Dunod, s'appuie sur références académiques et recherche comportementale." }
      ]},

      /* --- 15.4 Psychologie · Motivation · Personnalité --- */
      { id:'s15_4', titre:'Psychologie · Motivation · Personnalité',
        collapsed:true, children:[
        { id:'s15_4_01', titre:'Marston William · Emotions of Normal People (DISC) · 1928',
          abbrev:'BIB-MARSTON-1928', statut:'active',
          note:"Marston, W. M. (1928). Emotions of Normal People. Kegan Paul, Trench, Trübner & Co.\nModèle DISC : Dominance · Influence · Steadiness · Conscientiousness.\nPrincipe rattaché : DISC.\nUsage BDB : coloration DISC des profils personas pour adapter le wording, sans catégorisation rigide." },
        { id:'s15_4_02', titre:'Berne Eric · Games People Play · 1964 · Grove Press',
          abbrev:'BIB-BERNE-1964', statut:'active',
          note:"Berne, E. (1964). Games People Play: The Psychology of Human Relationships. Grove Press.\nAnalyse Transactionnelle : États du Moi (Parent/Adulte/Enfant) · Positions de vie · Jeux psychologiques.\nTriangle dramatique de Karpman (extension 1968).\nPrincipe rattaché : AT (Analyse Transactionnelle) — à intégrer comme principe nommé si terrain BDB le demande." },
        { id:'s15_4_03', titre:'Kamiya Mieko · Ikigai-ni-tsuite (De l\'ikigai) · 1966',
          abbrev:'BIB-KAMIYA-1966', statut:'active',
          note:"Kamiya, M. (1966). Ikigai-ni-tsuite (De l'ikigai). Tokyo (en japonais, non traduit en français).\nPsychiatre japonaise · ouvrage fondateur sur l'ikigai.\nPrincipe rattaché : IKI (Ikigai authentique).\nEXCLUSION doctrinale : le diagramme Venn occidental (Zuzunaga 2011 / Winn 2014) est une construction post-hoc qui écrase le sens japonais. À NE JAMAIS utiliser dans BDB." },
        { id:'s15_4_04', titre:'Mogi Ken · The Little Book of Ikigai · 2017',
          abbrev:'BIB-MOGI-2017', statut:'active',
          note:"Mogi, K. (2017). The Little Book of Ikigai: The Secret Japanese Way to Live a Happy and Long Life. Quercus Publishing.\nNeuroscientifique japonais · présentation moderne de l'ikigai.\nPrincipe rattaché : IKI (Ikigai authentique)." },
        { id:'s15_4_05', titre:'Maslow Abraham · A Theory of Human Motivation · 1943 · Toward a Psychology of Being · 1968',
          abbrev:'BIB-MASLOW', statut:'active',
          note:"Maslow, A. H. (1943). A Theory of Human Motivation. Psychological Review, 50(4), 370-396.\nMaslow, A. H. (1968). Toward a Psychology of Being (2nd ed.). D. Van Nostrand.\nHiérarchie des besoins (5 niveaux : Physiologiques · Sécurité · Appartenance · Estime · Réalisation de soi).\nPeak experiences (expériences paroxystiques).\nSource française fournie : Louart · CLAREE · IAE-USTL · 2002 (PDF).\nPrincipe rattaché : MAS (Hiérarchie des besoins)." },
        { id:'s15_4_06', titre:'Herzberg Frederick · The Motivation to Work · 1959 · One More Time · 1968',
          abbrev:'BIB-HERZBERG', statut:'active',
          note:"Herzberg, F., Mausner, B., & Snyderman, B. B. (1959). The Motivation to Work. John Wiley & Sons.\nHerzberg, F. (1968). One More Time: How Do You Motivate Employees? Harvard Business Review.\nThéorie bi-facteurs : Facteurs d'hygiène (extrinsèques) vs Facteurs motivationnels (intrinsèques).\nEnrichissement du travail.\nSource française fournie : Louart · CLAREE · IAE-USTL · 2002 (PDF).\nPrincipe rattaché : HER (Facteurs d'hygiène / motivationnels)." },
        { id:'s15_4_07', titre:'McClelland David · Human Motivation · 1987 · Cambridge University Press',
          abbrev:'BIB-MCCLELLAND-1987', statut:'a_verifier',
          note:"McClelland, D. C. (1987). Human Motivation. Cambridge University Press.\n3 motivations fondamentales : Pouvoir · Affiliation · Accomplissement.\nAttribution citée dans la mindmap David Jay MERE pour l'étape M (Motivation).\nRéférence exacte à fiabiliser (1961 The Achieving Society aussi pertinent)." },
        { id:'s15_4_08', titre:'Ichazo Óscar · Naranjo Claudio · Ennéagramme (3 centres) · 1970s',
          abbrev:'BIB-ENN', statut:'a_verifier',
          note:"Ichazo, Ó. (école Arica, Chili, 1960s-70s).\nNaranjo, C. (1970s, formation États-Unis).\nThéorie des 3 centres (Instinctif · Émotionnel · Mental) retenue.\nLes 9 types sont EXCLUS (trop complexes opérationnellement).\nPrincipe rattaché : ENN-3C.\nRéférences exactes à fiabiliser — littérature éclatée, nombreuses écoles." }
      ]},

      /* --- 15.5 Pensée complexe · Systémique --- */
      { id:'s15_5', titre:'Pensée complexe · Systémique',
        collapsed:true, children:[
        { id:'s15_5_01', titre:'Morin Edgar · Introduction à la pensée complexe · 1990 · Seuil',
          abbrev:'BIB-MORIN-1990', statut:'active',
          note:"Morin, E. (1990). Introduction à la pensée complexe. Paris : ESF. Rééd. Seuil, Points Essais, 2005.\nISBN 978-2-02-066837-2 (édition Points).\n3 principes : dialogique · récursif · hologrammatique.\nPrincipe rattaché : MOR-COMPL (pensée complexe).\nFondement doctrinal de la Règle de Non-Linéarité (RNL) : Manu pense par itération heuristique, pas en séquence 1→2→3." }
      ]},

      /* --- 15.6 Sources à intégrer V3.2+ --- */
      { id:'s15_6', titre:'Sources à intégrer V3.2+ (non encore attribuées à un principe actif)',
        collapsed:true, children:[
        { id:'s15_6_01', titre:'Laurence Paul · Nohria Nitin · Driven: How Human Nature Shapes Our Choices · 2002',
          abbrev:'BIB-LAUR-NOH-2002', statut:'a_verifier',
          note:"Laurence, P. R., & Nohria, N. (2002). Driven: How Human Nature Shapes Our Choices. Jossey-Bass.\nISBN 978-0-7879-6385-0 (à confirmer).\n4 besoins fondamentaux : Acquérir · Se relier · Apprendre · Se défendre.\nThèse : « face à une alternative le choix se porte toujours sur celle qui apporte le statut social le plus élevé ».\nSource fournie : mindmap doc 2 page 1.\nÀ intégrer V3.2 comme principe LAUR-NOH-4B." },
        { id:'s15_6_02', titre:'Bateson Gregory · Dilts Robert · Niveaux Logiques · 1970s+',
          abbrev:'BIB-BAT-DIL', statut:'a_verifier',
          note:"Bateson, G. (1972). Steps to an Ecology of Mind. Chandler Publishing.\nDilts, R. (extensions PNL, 1990s).\n7 niveaux : Mission/Identité/Valeurs/Attitudes/Capacités/Comportement/Environnement.\nRéférences exactes à fiabiliser (plusieurs sources PNL).\nÀ intégrer V3.2 comme principe BAT-DIL." },
        { id:'s15_6_03', titre:'Rohaut Manuel (Manu) · Matrice ARE · Tableau périodique de la rédaction · BDB',
          abbrev:'BIB-ROHAUT-BDB', statut:'active',
          note:"Créations propres Manuel Rohaut dans le cadre de BDB :\n* Matrice ARE (Action · Réflexion · Émotion) — vulgarisation de l'Ennéagramme 3 centres · usage personas BDB non-initiées.\n* Tableau périodique de la rédaction — outil d'orchestration des contenus BDB (~100+ types).\n* Architecture L1 · L2 · L3 BDB.\n* ERREUR-13 (protocole_id immutable).\n* Conventions de nommage thésaurus (S1-S4, C1-C10, R1-R28).\n* Catégories doctrinales atelier_principes (convention / interdit / garde_fou / anti_ia / pacte_produit).\n* Chaîne causale CHAINE (articulation de principes David Jay).\nStatut : doctrine BDB en construction, itération continue via atelier_decisions." }
      ]}
    ]}
  ]
};
