# IDENTITÉ DB&M — Doctrine identitaire tranchée

```
VERSION  : 0.4.0
DATE     : 2026-05-03
STATUT   : DOCTRINE VIVANTE — 4 champs identitaires tranchés en session #113
                              Sections annexes (promesses détaillées, recherches externes,
                              archives auditées) restent dans V0.3 jusqu'à intégration V0.5
RÈGLE    : un champ tranché ici prime sur tout ce qui le contredit dans Manifeste/Canon/
           Pédagogie/CLAUDE.md tant que ces fondateurs ne sont pas mis à jour
           (cascade prévue sessions suivantes).

DELTA    : V0.3.0 → V0.4.0 (session #113)
           4 champs [À TRANCHER] résolus :
             §1 MISSION    V0.6 — push → pull, matière structurée mise à disposition,
                                  3 versions (INTERNE / EXT-tu / EXT-vous)
             §2 VISION     V0.4 — 3 ans 100 k€ × 1 bloc / 10 ans 1 M€ × 10 blocs,
                                  4 versions (INTERNE 3+10 / EXTERNE 3+10)
             §3 VALEURS    V0.3 — architecture 3 niveaux (étiquette / effet vivant / interne),
                                  13 valeurs publiques + 4 mécanismes invisibles + 13 internes
             §4 5 POURQUOI V0.1 — chaîne 5 niveaux du symptôme à la racine,
                                  + variante narrative externe
           5 nouveaux principes en base + 2 dettes axe (cf. migration_20260503_120000_doctrine_session_113.sql).
           Audit 7 voix × ARE systématique : 7/7 VALIDE sur les 4 livrables.
           Recadrages Manu intégrés (3 corrections majeures) :
             - Caisse à outils 5 axes × 4 savoirs (pas 4 méthodes plates)
             - Profondeur 3 niveaux des valeurs (pas étiquettes plates)
             - Cercle vertueux GPS-01 retrouvé (référence canonique D-2026-04-26-GPS-01)

DELTA    : V0.2.0 → V0.3.0 (cf. V0.3 header — non recopié)
DELTA    : V0.1.0 → V0.2.0 (cf. V0.3 header — non recopié)

SOURCES  :
  A1   = 000_MANIFESTE_BDB_V1_3_0.md
  A2   = 0000_BIBLE_DE_BLOC_CANON_V1_0_5.md
  A3   = 0000_BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md
  A4   = 0000_CTX_DOCTRINE_TERRAIN_V1_2_0.md
  A5   = PHILOSOPHIE_PARTICIPATIVE_BDB_V1_0_0.md
  N0   = 000000_NIVEAU_0_DBM_V0_5_0.md
  PIT  = 0000000_PITCH_FONDATEUR_DBM_V1_0_0.md
  REF  = 000000_REFERENTIEL_AFFIRMATIONS_DBM_V2_0_0.md
  V7   = 000000_LES_7_VOIX_AUDIT_DBM_V1_0_0.md
  P    = 31_PERSONAS_BDB_V1_4_0.md
  D    = 04_PEDAGOGIE_BDB_V1_0_0.md
  SITE = site/index.html, vision.html, audiences.html, pas-app.html, fonctionnalites.html
  GPS  = S108_GPS_AUDIT_FICHIERS.md
  PRC  = 00_SOCLE_TERRAIN_PRICING_V1_1_0.md
  AP   = atelier_principes (cloud, 191 actifs + 5 nouveaux + 2 dettes)
  AD   = atelier_decisions (cloud, 451 + 4 doctrine V0.4)
  AS   = atelier_sessions (cloud, max #113)
  GPS01 = D-2026-04-26-GPS-01 (cercle vertueux pipeline 7 étapes + triangle sources/app/pricing)
```

---

## 1 — MISSION (ce que DB&M fait, pour qui, comment)

### 1.1 — Mission INTERNE (L3, entre Manu / Claude / Ewan / Bernard)

> **DB&M est une matière structurée du savoir opératoire, mise à disposition de qui veut s'en saisir. Sa structure interne est une caisse à outils croisée simultanément sur 5 axes (POURQUOI · QUOI · COMMENT · QUI · QUAND), pour permettre à chacun de bâtir ses 4 savoirs (savoir · savoir-faire · savoir-être · savoir-agir) à son poste et son contexte.**
>
> **Le choix d'instrument se fait selon l'axe activé : POURQUOI mobilise FAB(3R) (DB&M) + Boudreault ; QUOI mobilise MERE (DB&M) + Benner ; COMMENT mobilise DISC (Marston) + VAKOG (PNL) + AT (Berne) ; QUI mobilise Spirale (Beck-Cowan) + Ennéagramme personnalités (Riso-Hudson) + Ennéagramme processus (DB&M) + ARE (DB&M, dérivé 3 centres) ; QUAND mobilise Kolb + Nonaka SECI + Deming + POULET (Barrand).**
>
> **Outils d'intégration systémique mobilisés en transverse : Morin (pensée complexe), TRIPLE-LEGIT (DB&M), PONT-STANDARD-TERRAIN (DB&M), Bernard (DB&M), 7 voix d'audit (DB&M), Wenger (communauté de pratique), Knowles (andragogie), Métaprogrammes (PNL), ANTI/GFC/INTERDIT (DB&M).**
>
> **Aucun de ces instruments n'est nommé en surface utilisateur (INTERDIT-WORDING-METHODES-01). DB&M ne bâtit jamais le parcours professionnel à la place de l'apprenant — il apporte les pierres, l'apprenant édifie.**

### 1.2 — Mission EXTERNE individuelle (tu) — Tabs Nouveau / Ancien / Équipe-membres / Chirurgiens

> **DB&M est constitué pour t'apporter la bonne info, au bon moment, au bon niveau, à ton poste — pour que tu puisses bâtir ton parcours professionnel toi-même, pierre après pierre. DB&M apporte les pierres. C'est ton parcours, à ton rythme.**

### 1.3 — Mission EXTERNE collective (vous) — Tab Direction

> **DB&M est constitué pour apporter à votre équipe la bonne info, au bon moment, au bon niveau, à chaque poste — pour que chacun puisse bâtir son parcours et l'équipe construire sa mémoire collective, pierre après pierre. DB&M apporte les pierres. C'est l'équipe qui bâtit.**

### 1.4 — Statut

- **Tranchée** session #113 (2026-05-03)
- Audit 7 voix × ARE : **7/7 VALIDE** sur version externe individuelle (1 dette : option B retenue par dépit, métaphore architecte/pierres à reconsidérer — cf. AXE-DETTE-WORDING-MISSION-EXT-01)
- **Remplace** A1 §1 (« système de transmission du savoir opératoire »), D §0 (« dispositif didactique »), ARCH-CAN V0.4 §2.1 (« continuité du sens »)
- **Cascade en attente** : Manifeste V1.4 §1, Canon V1.0.6 §1, Pédagogie V1.1 §0, CLAUDE.md V2.2 §1

---

## 2 — VISION (où DB&M va, à 3 ans, à 10 ans)

### 2.1 — Vision INTERNE 3 ans (L3, opérationnelle, calage pricing 100 k€)

> **D'ici 3 ans, DB&M aura prouvé qu'il vaut 100 k€/an récurrent à un grand bloc, parce qu'il est stable, efficient, et que son maillage inter-modules est devenu indissociable du fonctionnement quotidien de l'équipe. Le cercle vertueux GPS-01 (fondation pont standard/terrain + triangle sources/app/pricing + pipeline 7 étapes + checklist 5 points) est implémenté et tourne en routine. La matière structurée a commencé à se manifester sur 2 surfaces autonomes : App Android (lead magnet IBODE solo) et premier KDP pivot à haute valeur SEO (anatomie ou glossaire bloc). La caisse à outils interne (5 axes × 4 savoirs × 3 familles d'instruments) reste invisible aux utilisateurs. Bernard + 7 voix d'audit + type 0 sont opérationnels à chaque session.**

### 2.2 — Vision INTERNE 10 ans (L3, aspirationnelle systémique, calage pricing 1 M€)

> **D'ici 10 ans, DB&M génère 1 M€/an récurrent (10 grands blocs × 100 k€/an de licence) parce que son adoption n'est plus à démontrer. Le cœur immuable (matière structurée du savoir opératoire) s'est manifesté sous N surfaces : instances B2B, apps Android modulaires, livres KDP par module/protocole/méthode, surfaces de méthode applicables hors bloc. Le contenu auto-régénère via le cercle vertueux GPS-01 : chaque surface alimente la matière commune, qui nourrit les autres surfaces. DB&M est devenu la référence française du PONT-STANDARD-TERRAIN pour la transmission IBODE. Une communauté nationale active porte la philosophie participative. Le projet sait nommer publiquement ce qu'il ne sait pas encore (type 0 institué).**

### 2.3 — Vision EXTERNE 3 ans (publique, mini-site)

> **D'ici 3 ans, DB&M sera l'outil que toute IBODE peut consulter — qu'elle travaille dans un bloc équipé, qu'elle travaille seule avec un compagnon de poche, ou qu'elle souhaite y contribuer à son rythme. Les blocs équipés y trouveront leur matière interconnectée. Les IBODE isolées y trouveront un compagnon de poche. Les chirurgiens qui le souhaitent y verseront leurs préférences. Personne ne sera laissé sur le bord du chemin parce que son équipe n'a pas encore franchi le pas.**

### 2.4 — Vision EXTERNE 10 ans (publique, aspirationnelle)

> **D'ici 10 ans, DB&M sera devenu l'évidence partagée du métier IBODE en France : sur écran d'équipe, dans la poche, sur l'étagère, dans la formation. Un contenu vivant, alimenté par tous, accessible à chacun — au bon besoin, au bon moment, au bon endroit, au bon niveau d'expertise, au bon approfondissement. Trouvable. Navigable. À ton rythme.**

### 2.5 — Statut

- **Tranchée** session #113 (2026-05-03)
- Audit 7 voix × ARE : **7/7 VALIDE** sur les 4 versions
- **Calage économique** : 100 k€/an/bloc (licence reproductible) — pas 1 M€ pour un seul bloc
- **Référence canonique cercle vertueux** : décision D-2026-04-26-GPS-01
- **Dette ouverte** : extension hors bloc (KDP/apps de méthodes hors univers chirurgical) à cadrer en brainstorming dédié — cf. AXE-DETTE-EXTENSION-HORS-BLOC-01
- **Cascade en attente** : Manifeste V1.4 §2, Pricing V1.2 (validation alignement pricing licence)

---

## 3 — VALEURS (architecture 3 niveaux)

> **Règle cardinale (AXE-VALEURS-3-NIVEAUX-01)** : les valeurs DB&M ne sont pas des étiquettes plates. Elles vivent simultanément sur 3 niveaux. Toute formulation/audit/révision doit être conçue ET LUE simultanément aux 3 niveaux, sous peine d'aplatir la profondeur.

### 3.1 — NIVEAU 1 : Valeurs publiques (mini-site, audience L1)

13 valeurs équilibrées ARE (A=5 · R=4 · E=4) :

| # | Valeur | A · R · E | Verbe d'action |
|---|---|---|---|
| 1 | Transmission | E | Le savoir circule, ne meurt pas |
| 2 | Terrain d'abord | A | Ancré dans le bloc réel |
| 3 | Connexion (combo gagnant) | R | Tout est lié, rien n'existe seul |
| 4 | Respect (pas scoring, pas flicage) | E | Reconnaît ta dignité |
| 5 | Affordance (signaux d'usage clairs) | A | Tu sais quoi faire en regardant |
| 6 | Efficience (résultat avec minimum d'effort) | A | 2 clics, 10 secondes, c'est trouvé |
| 7 | Périmètre tenu (zéro patient, zéro opposable, anonymat) | R | Promesse écrite = promesse tenue |
| 8 | Légèreté (pas pendant l'op) | A | Quand les gants sont mis, l'app reste dans la poche |
| 9 | Liberté préservée (pas imposé, contribuer = choix) | E | Tu décides, personne ne décide pour toi |
| 10 | Triple légitimité (validé · expert · usage) | R | Trois sources, pas une seule voix |
| 11 | Multi-canalité respectueuse (écran/poche/étagère/formation) | A | Chacun choisit son canal |
| 12 | Acteur de ton parcours | E | Pierre par pierre, à ton rythme |
| 13 | Savoir-agir (mobilisable au bon moment) | R | Pas savoir, savoir-faire OU savoir-agir |

### 3.2 — NIVEAU 2 : Effets vivants invisibles (4 mécanismes)

> Ce qui se passe en profondeur quand un utilisateur se sert de DB&M. Invisible nommément, palpable en effet. Aucun de ces mécanismes ne doit jamais être nommé en surface utilisateur (INTERDIT-WORDING-METHODES-01).

#### 3.2.A — Intégration ennéagramme (chaque profil progresse vers sa flèche d'intégration)

| Profil utilisateur | Type | Flèche | Ce que DB&M nourrit |
|---|---|---|---|
| Estelle (novice) | T6 → 9 | Confiance → Sérénité | Le système tient, je peux me concentrer au lieu de douter |
| Blanche (experte) | T1 → 7 | Intégrité → Légèreté | Mon savoir est juste ET partagé sans répétition épuisante |
| Constance (cadre) | T3 → 6 | Résultat → Confiance | L'équipe fait confiance parce que le système prouve |
| Dorian (direction) | T5 → 8 | Savoir → Action | J'ai compris, j'ai vérifié, j'achète |
| Fernand (chirurgien) | T8 → 2 | Protection → Transmission | Mes préférences servent l'équipe, pas seulement moi |
| Gaël (arbitre) | T9 → 3 | Harmonie → Résultat concret | Ce combo est complet, l'harmonie est devenue résultat |
| Aurèle (IA / nouveau) | T0 | Progression spirale | Quand je dis « nous » au lieu de « je », j'ai quitté le beige |

→ DB&M est **conçu** pour produire ces intégrations. Pas par magie : par la structure (matière reliée + caisse à outils invisible).

#### 3.2.B — Fluidification DISC (frictions interpersonnelles dissoutes)

| Friction terrain (avant DB&M) | Comment DB&M la dissout |
|---|---|
| Le D bouscule le S qui se replie | Le S consulte la fiche en autonomie. Le D n'a plus à imposer |
| Le C demande des preuves au I qui se sent jugé | Le I trouve la chaleur du wording, le C trouve la triple légitimité |
| Le S a besoin de continuité, le D bouscule | La fiche écrite assure la continuité que le D n'a pas à porter |
| Le I voudrait raconter, le C s'agace | Le I peut contribuer sans imposer, le C peut consulter sans subir |
| L'ancien parle direct, le novice n'ose plus | Le novice cherche seul, l'ancien est libéré du rôle de répétiteur |

→ DB&M agit comme **tampon DISC**. Chaque profil reçoit l'info dans sa langue sans subir celle des autres.

#### 3.2.C — Rupture du cycle toxique (PNL + AT)

Les 6 étapes du cycle (`vision.html`, STB-BOUCLE-01) :

```
1. Quelqu'un arrive (Enfant Adapté qui ne sait pas)
2. Il demande (transaction asymétrique)
3. L'autre répond — encore (Parent Normatif fatigué)
4. Il n'ose plus demander (Enfant Adapté silencieux, métaprogramme « Loin de » la honte)
5. Une erreur arrive (savoir manquant, lien non fait)
6. La tension monte (climat dégradé, turnover) → recommence
```

**Ce que DB&M coupe** :

| Étape | Action DB&M |
|---|---|
| 2 | Canal sans humain en face = pas de transaction asymétrique |
| 3 | L'ancien n'est plus l'unique dépôt, libère son énergie pour l'expertise |
| 4 | Le novice ose chercher (anonymat) — pas de jugement |
| 5 | Liens entre infos structurés (combo gagnant) — l'erreur de lien rendue improbable |
| 6 | Climat préservé → turnover réduit |

→ DB&M brise **STB-BOUCLE-01** par design.

#### 3.2.D — Construction du savoir-agir (Boudreault)

Distinction des 4 savoirs (CONV-SAVOIR-AGIR-01) :

| Savoir | Ce que c'est | Ce que DB&M apporte |
|---|---|---|
| **Savoir** | Connaissance déclarative | Anatomie + glossaire + définitions + CCAM |
| **Savoir-faire** | Capacité technique | Protocoles + fiches techniques + variantes + picking |
| **Savoir-être** | Posture relationnelle | DISC adaptatif invisible + wording AT |
| **Savoir-agir** | INTÉGRATION des 3 dans l'action en contexte | Matière interconnectée (combo gagnant) + 5 « bons » (besoin/moment/endroit/niveau/approfondissement) |

→ DB&M produit le **savoir-agir** en interconnectant les 3 autres. Sans connexions, on a un classeur. Avec connexions, on a un savoir-agir mobilisable.

### 3.3 — NIVEAU 3 : Valeurs internes (L3, ce qu'on garde au chaud)

13 valeurs (11 historiques V0.3 + 2 ajouts session #113) :

| # | Valeur | A · R · E | Source |
|---|---|---|---|
| 1 | Comprendre avant d'agir (Boudreault, Kolb) | R | Canon Annexe §2 + Pédagogie Axe 6 |
| 2 | Ne rien inventer qui existe (PONT-STANDARD-TERRAIN) | R | GFC-PONT-01 |
| 3 | Zéro hallucination — Vide > Faux | R | ANTI-01..08 |
| 4 | Le contenu appartient à l'institution | E | Doctrine §9 |
| 5 | Premium stable (conforme avant rempli) | A | GFC-GPS-01 |
| 6 | Délégation orchestrée (Manu chef d'orchestre) | A | GPS01 + BERNARD-01 |
| 7 | Honnêteté active sur l'inconnu | E | JURISP-BERNARD-GF-05 |
| 8 | Archivage = donnée, pas honte | R | Doctrine §3 |
| 9 | Itération honnête (60% > 100% imaginaire) | E | Affirmation #95 |
| 10 | **Profondeur invisible** (ce qui transpire compte autant que ce qui s'affiche) | E | Recadrage Manu session #113 |
| 11 | **L'écosystème humain est la matière première** (PNL · AT · DISC · ennéa · spirale lus en parallèle) | R | NIVEAU_0 §13 |
| 12 | **Recette secrète invisible** (méthodes jamais nommées en surface) | R | INTERDIT-WORDING-METHODES-01 |
| 13 | **Universalité méthodologique** (outils DB&M utiles hors bloc) | A | Vision 10 ans V0.4 |

**Équilibre ARE** : A = 3 · R = 6 · E = 4 → R prédominant (normal pour valeurs internes : rigueur, vérification, méthode).

### 3.4 — Statut

- **Tranchées** session #113 (2026-05-03)
- Audit 7 voix × ARE : **7/7 VALIDE** sur le système 3 niveaux
- **Recadrage Manu intégré** : initialement Claude a livré 11 valeurs publiques en mode étiquettes plates, perdant la profondeur. Architecture 3 niveaux acte que la profondeur compte autant que l'affichage.
- **Cascade en attente** : Manifeste V1.4 §3, Pédagogie V1.1 (intégration des 4 mécanismes invisibles)

---

## 4 — LES 5 POURQUOI (chaîne du symptôme à la racine)

### 4.1 — Méthode

Méthode Toyota appliquée. Remontée du symptôme observable terrain à la cause racine systémique. **Jamais formalisée auparavant** — état [À TRANCHER] depuis IDENTITE V0.3.

### 4.2 — Chaîne 5 niveaux (interne, jargon assumé)

| # | Question | Réponse |
|---|---|---|
| **1** | **Pourquoi DB&M existe ?** | Parce qu'à 7h45, des soignants compétents arrivent en salle sans savoir ce qui les attend. Chaque jour, chaque équipe, chaque bloc. Et chaque ignorance se paie en cascade : erreur, retard, tension, départ, never event. |
| **2** | **Pourquoi des soignants compétents arrivent-ils sans savoir ?** | Parce que le savoir opératoire vit dans les têtes — pas dans un système consultable. Quand l'experte est partie, le savoir est parti avec elle. Quand le chirurgien n'a pas dit, le savoir n'existe pas. Quand le novice n'ose plus demander, le savoir ne se transmet plus. |
| **3** | **Pourquoi le savoir vit-il dans les têtes ?** | Parce que la transmission orale exige énergie + temps + relation à chaque répétition — et que cette transaction épuise l'ancien, dévalorise le novice, et crée le cycle toxique des 6 étapes (arrive → demande → répond encore → n'ose plus → erreur → tension → recommence). Et parce que la chaîne des 12+ intervenants nomme chaque chose différemment — il n'existe pas de langue commune entre eux. |
| **4** | **Pourquoi n'y a-t-il pas de système commun ?** | Parce qu'aucun outil ne fait le pont entre **les standards** (référentiels officiels, protocoles validés, codes CCAM, recommandations sociétés savantes) et **la vraie vie de chaque bloc** (variantes chirurgien, picking réel, gestes du quotidien, situations bloquantes terrain). Le SIH gère l'administratif, OPTIM gère le programme — mais le savoir opératoire entre les deux est orphelin. |
| **5** | **Pourquoi ce pont n'existait-il pas ?** | Parce que le créer exige une conjonction rare : 20 ans de terrain IBODE pour reconnaître ce qui compte vraiment + une lecture systémique des standards internationaux + une discipline éditoriale invisible (caisse à outils croisés sur 5 axes × 4 savoirs) + un modèle économique qui finance la production sans imposer aux blocs sans moyens. La conjonction n'existait pas. **DB&M est cette conjonction.** |

### 4.3 — Variante externe narrative (mini-site, single-page sans jargon)

> **DB&M existe parce que chaque jour, à 7h45, des soignants compétents entrent en salle sans savoir ce qui les attend. Le savoir vit dans les têtes — quand quelqu'un part, il l'emporte. Quand quelqu'un n'ose plus demander, il s'éteint. Quand chacun nomme la même chose différemment, plus personne ne se comprend. Aucun outil ne reliait ce que les référentiels officiels disent et ce que chaque bloc fait vraiment. DB&M est ce pont, construit depuis l'intérieur.**

### 4.4 — Statut

- **Tranchée** session #113 (2026-05-03)
- Audit 7 voix × ARE : **7/7 VALIDE** (1 réserve : jargon SIH/OPTIM/CCAM en niveau #3-4 → version externe narrative dépouillée pour mini-site)
- **Cohérence vérifiée** avec mission V0.6, vision V0.4, valeurs V0.3, cycle toxique vision.html, cap immuable Niveau 0 §1, Doctrine Terrain chaîne 12+ intervenants, Pricing CNP 900 k€-2,8 M€, PONT-STANDARD-TERRAIN, caisse à outils invisible (5 axes × 4 savoirs).

---

## 5 — PROFIL PSYCHOLOGIQUE DE DB&M

> **Statut session #113** : non tranché — ce champ V0.3 §4 reste ouvert. Hypothèses présentées en V0.3 toujours valides. Recommandation D §9 Pédagogie : **ne pas attribuer de type ennéagramme à DB&M lui-même** (refus formel des 9 types pour le produit). Les outils s'appliquent aux utilisateurs, pas au produit.

### 5.1 — Ennéagramme

- **Refus formel des 9 types pour DB&M lui-même** (D §9 Pédagogie)
- **Centres mobilisés** : les 3 centres (instinctif, émotionnel, mental) sont mobilisés en équilibre par DB&M sur ses utilisateurs (cf. ARE)
- **Hypothèse non tranchée** : si attribution interne nécessaire, type avec ailes ou mélange — pas de type pur

### 5.2 — DISC

- **Hypothèse synthétisée non tranchée** : DB&M dominante **C/S au repos** (rigueur stable et rassurante), avec **I émergent** sur le wording (AT + hypnose conversationnelle), et **D minimal** assumé sur les INTERDIT (tranche mais n'impose pas)
- **DISC-RÈGLE-01** (A5 §C-RÈGLE-01) : DISC adapte la forme. DISC n'adapte JAMAIS le fond.

### 5.3 — Spirale Dynamique

- **Statut D §9** : Spirale non intégrée formellement à la doctrine pédagogique. Peut être intégrée en V1.1 si utilité terrain démontrée.
- **Hypothèse synthétisée non tranchée** : Vert avec ouverture Jaune (philosophie participative + combo gagnant systémique)
- **Bernard** : Jaune mûr — palier ultérieur que DB&M construit

### 5.4 — Persona DB&M

- **Prénom** : aucun — « Des Blocs & Moi / DBM » est l'identité de l'instance par défaut (table `app_instance`), pas du produit
- **Posture** : présente quand on a besoin, invisible quand on sait
- **Voix** : empathique, positive, hypnose conversationnelle, AT Adulte/Enfant Libre, tutoiement par défaut sauf tab Direction « vous » (CONV-UX-WORDING-01)
- **Ce qu'il refuse** : per-op, données patient, classement, surveillance, opposable juridique, être imposé, encyclopédie infinie

---

## 6 — COUCHES D'EXPRESSION (recopié de V0.3 §5 — non modifié session #113)

### 6.1 — L0 Fondation (intouchable, non public)

Ce qui ne change JAMAIS :

- Les 5 documents fondateurs A1-A5 (à protéger contre la régression)
- Les 36 INTERDIT techniques (`AP categorie='interdit'`)
- Les 191 + 5 nouveaux + 2 dettes principes actifs (`AP statut='active'`, 18 catégories actuelles)
- La hiérarchie des sources A2 §10 :
  ```
  1. Principes TOUJOURS (atelier_principes WHERE marqueur='TOUJOURS')
  2. MANIFESTE_BDB
  3. CTX_DOCTRINE_TERRAIN
  4. atelier_decisions
  5. CTX_[MODULE].md
  6. Code déployé
  ```
- Les 8 ANTI-01..08 (`AP categorie='anti_ia'`)
- Les 5 fiche_type (FICHE-INTERVENTION, PICKING, INSTRUMENTATION, REVISION, PREFERENCES)
- Les 8 STB (7 du Canon §2 + STB-BOUCLE-01)
- Le PONT-STANDARD-TERRAIN (GFC-PONT-01)
- La doctrine pédagogique D V1.0.0 (10 axes + POULET intégrateur)
- **Nouveau session #113** : INTERDIT-WORDING-METHODES-01, AXE-VALEURS-3-NIVEAUX-01, AXE-MULTI-SURFACES-01, AXE-CERCLE-VERTUEUX-01, CONV-SAVOIR-AGIR-01

### 6.2 — L1 Produit universel (visible par tous les utilisateurs authentifiés)

Ce que chaque IBODE voit et utilise :

- Les 26 modules métier (3 `coming_soon` : ged, pedagogie, recueil-situation)
- Le wording empathique (CONV-UX-WORDING-01)
- Le combo gagnant 12 maillons (A4 §4)
- Les 9 personas états vécus (P0-P8) que DB&M sert
- L'escalade gracieuse (`AP ESCALADE-01`)
- L'anonymat sur la progression personnelle (P4 Philosophie A5)
- Le bouton « Contester » sur fiche douteuse
- Triple légitimité visible (validé officiel / expert reconnu / usage éprouvé) — `AP TRIPLE-LEGIT-01`

### 6.3 — L2 Instance (visible par l'établissement)

Ce qui est spécifique à Chénieux, La Marche, future instance :

- Les chirurgiens nominatifs (`thesaurus_chirurgiens`) — admin authentifié
- Les préférences chirurgien (`preferences_chirurgien` + `pref_referentiels`)
- Le matériel avec marques et localisations (`materiel` + `etageres`)
- Le planning et affectations (`planning_affectations`)
- L'historique d'interventions (`thesaurus_interventions` 89 653)
- L'identité visuelle de l'instance (`app_instance`)
- Les 4 actions admin sur compte départ : suspendre / changer rôle / supprimer std / supprimer + droit oubli
- Les 5 niveaux d'accès : isDemo (Jaune) / isMember (NULL) / isAdmin (Bleu) / isCreator (Violet)

### 6.4 — L3 Créateur (visible par Manu, Claude, Ewan)

Ce qui pilote tout le reste :

- L'atelier (`atelier_*` 5 tables : decisions 455, sessions 113, arbitrages 11, principes 198, doctrine_nodes)
- Le conseil des 5 (`AP CONSEIL-5-01` LIBRARIAN/ARCHITECT/SLICER/FIELD_OP/SKEPTIC)
- Bernard (persona arbitrage 9w8 jaune intégré 3, 4 fiches en base, 8 règles `JURISP-BERNARD-*`)
- Les 7 voix d'audit (Aurèle/Blanche/Constance/Dorian/Estelle/Fernand/Gaël) — référentiel V1.0.0
- Les sessions / décisions / arbitrages
- Le cockpit local (`createur/atelier/cockpit.html`)
- Les audits S108 micro + S109 audit d'écart
- Les skills Claude / les prompts / la mémoire
- Les 14+ standards internationaux ancrés dans `app_modules`
- La triple lecture de validation : ELI15 → Comprendre/Apprendre/Agir → FAB(3R)
- **Nouveau session #113** : caisse à outils 5 axes × 4 savoirs × 3 familles, architecture 3 niveaux des valeurs, INTERDIT-WORDING-METHODES

---

## 7 — PROMESSES PAR COUCHE

> **Statut session #113** : non modifié. Liste détaillée des 177 promesses + tableaux promesses L1/L2/L3 → **voir V0.3 §6** (recopie intégrale différée à V0.5 quand cascade Manifeste/Canon/Pédagogie/CLAUDE.md sera faite).

**Référence rapide** :
- Public mini-site : 177 promesses dans `S108_GPS_AUDIT_FICHIERS.md`
- L1 Utilisateur : 9 promesses cœur dans V0.3 §6.2
- L2 Établissement : 9 promesses cœur dans V0.3 §6.3
- L3 Créateur : 8 promesses cœur dans V0.3 §6.4 + cette session ajoute « caisse à outils invisible × 5 axes × 4 savoirs garantie »

---

## 8 — DETTES OUVERTES (backlog actif)

| # | Dette | Trigger pour résorber |
|---|---|---|
| 1 | **Métaphore architecte/pierres** mission externe à reconsidérer (Estelle débloquée par dépit) — `AXE-DETTE-WORDING-MISSION-EXT-01` | Brainstorming wording dédié, après finalisation Manifeste V1.4 |
| 2 | **Extension hors bloc** (KDP/apps de méthodes) à formaliser — `AXE-DETTE-EXTENSION-HORS-BLOC-01` | Brainstorming stratégie produit dédié, pas avant 2026-Q4 |
| 3 | **Cascade fondateurs** Manifeste V1.4 / Canon V1.0.6 / Pédagogie V1.1 / CLAUDE.md V2.2 à aligner sur V0.4 | Sessions de cascade dédiées |
| 4 | **Triple légitimité** à expliciter (tooltip/glossaire pour Aurèle/Estelle) | Audit accessibilité mini-site |
| 5 | **Doctrine éditoriale Niveau 1 marketing** (lead magnet × pilier × micro-contenus) à formaliser | Quand on activera le cercle vertueux GPS-01 en production |
| 6 | **Doc 1/2/3 résorbée** (Doc 1 utilisateur, Doc 2 admin instance, Doc 3 dev instance) — DETTE depuis avril 2026 | À programmer après V1.4 fondateurs |
| 7 | **Profil psychologique DB&M** (§5) reste non tranché — décision (a) refus formel des 9 types ou (b) attribution interne | Brainstorming dédié (probablement jamais — D §9 prime) |
| 8 | **Mécanisme anti-régression** (checksum SHA-256 sur 5 fondateurs) | À implémenter en parallèle cascade fondateurs |
| 9 | **Conversations Claude.ai web** sont une source que je n'ai pas — règle « je n'ai pas trouvé ≠ ça n'existe pas » à intégrer dans skill `session-reprise-bdb` | À acter en mise à jour skill |

---

## 9 — ARCHIVES AUDITÉES ET HÉRITAGE

> **Statut session #113** : non modifié. Audit Bloc I (3 dossiers archives) effectué V0.3 → **voir V0.3 §9**.

Synthèse rapide V0.3 §9 :
- D:\DEV\BIBLE_DE_BLOC\_ARCHIVE (1041 fichiers, 695 MB)
- F:\02_PROJETS\_Blumedi (31 PDFs, 15 MB) — sources terrain primaires Bloc A référence
- F:\02_PROJETS\_Inter service (502 fichiers, 1988 MB) — cours DU IBODE Manu, hors BDB

4 vraies pépites identité retenues :
1. Ancien CANON V0.4 (févr. 2026) : 3ᵉ formulation de mission
2. ETUDE_FICHE_PROBLEMATIQUE : 12 STB brutes en 1ʳᵉ personne IBODE
3. PROMPT_EXTRACTION_REEL_BIBLE_DE_BLOC : posture méthodologique originelle
4. 31 PDFs Blumedi : sources terrain primaires Bloc A référence

---

## 10 — RECHERCHES EXTERNES À EXÉCUTER PAR MANU

> **Statut session #113** : non modifié. Liste des 7 prompts Perplexity/Qwen/Gemini → **voir V0.3 §8** (recopie intégrale différée à V0.5).

---

## HISTORIQUE

```
2026-05-03 — V0.4.0 (session #113)
  4 champs identitaires tranchés : mission V0.6, vision V0.4, valeurs V0.3, 5 pourquoi V0.1.
  Audit 7 voix × ARE systématique : 7/7 VALIDE sur 4 livrables.
  3 recadrages Manu intégrés (caisse à outils 5 axes × 4 savoirs ;
  profondeur 3 niveaux des valeurs ; cercle vertueux GPS-01 retrouvé).
  5 nouveaux principes en base + 2 dettes axe (cf. migration_20260503_120000).
  Sections annexes (promesses détaillées §7, archives §9, recherches §10) restent
  référencées vers V0.3 jusqu'à intégration en V0.5.
  Cascade fondateurs (Manifeste V1.4, Canon V1.0.6, Pédagogie V1.1, CLAUDE.md V2.2)
  programmée en sessions suivantes.

2026-04-28 — V0.3.0 (cf. V0.3 header — non recopié)
2026-XX-XX — V0.2.0 (cf. V0.3 header — non recopié)
2026-XX-XX — V0.1.0 (cf. V0.3 header — non recopié)
```
