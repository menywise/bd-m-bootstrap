# S#109 — Audit d'écart CANON / état actuel BDB

```
VERSION  : 1.0.0
DATE     : 2026-04-27
AUDITEUR : Claude Code (Opus 4.7) — Session #109
PORTÉE   : Documents fondateurs A1-A5 vs CLAUDE.md, code, base, mini-site
MÉTHODE  : Phase 0 lecture intégrale (5 fondateurs + GPS + Pricing + 5 audits S108
           + 11 pages site + 4 requêtes Supabase atelier_principes/app_modules
           /atelier_decisions + information_schema atelier_fondation)
PRODUIT  : Aucun code modifié. Aucun SQL UPDATE/INSERT exécuté. Lecture seule.
CONTRAINTE : Lorsque l'information manque, écrire "recherche externe requise"
             ou "à clarifier". Jamais combler par hallucination.
```

---

## 0. RÉSUMÉ EXÉCUTIF

| Écart | Sévérité | Impact | Phase 2/3 |
|---|---|---|---|
| `CLAUDE.md` ne mentionne aucun document fondateur (A2/A3/A4/A5) | **CRITIQUE** | Tout IA amnésique repart sans Canon ni Doctrine | Refonte Phase 3 |
| `CLAUDE.md` mentions techniques obsolètes (BS 5.3.2, V1_18_0, V1_0_9, V2_4_0) | **MAJEURE** | IA suit des règles caduques | Refonte Phase 3 |
| `atelier_fondation` référencé CANON §10 — n'existe pas en base | **MAJEURE** | Source de vérité orpheline | Acter/migrer |
| `S108_GPS_V1_0_0.md` référencé décision D-2026-04-26-GPS-04 — n'existe pas sur disque | **MAJEURE** | 177 promesses × 24 modules sans synthèse traçable | Recréer ou abandonner |
| 12/26 modules sans `standard_international` ancré | **MAJEURE** | PONT-STANDARD-TERRAIN incomplet (GFC-PONT-01) | Phase 2 §2 |
| Combo gagnant §7.7 (6 maillons) vs DOCTRINE §4 (12 maillons) | **MINEURE** | Divergence éditoriale | Réconcilier en Phase 2 |
| Chaîne du chaos Manifeste §2bis (8 maillons) vs DOCTRINE §1 (12+ maillons) | **MINEURE** | DOCTRINE TERRAIN est plus complète, à acter | Réconcilier en Phase 2 |
| `BLOC 0` mentionné dans CLAUDE.md, absent des 5 fondateurs | **MINEURE** | Vocabulaire orphelin | Supprimer Phase 3 |
| 9 personas (CLAUDE.md) vs 11 personas (Manifeste §5) | **MINEURE** | Décalage `31_PERSONAS_BDB_V1_4_0.md` à vérifier | Aligner Phase 3 |
| 4 modules sans admin séparé alors que vues admin promises | **MINEURE** | Voir détail §1B | Statuer Phase 2 |
| Conseil des 5, Triple légitimité, Métriques d'adoption : principes en base, **zéro implémentation visible** | **MAJEURE** | Promesses publiques `risques.html` non tenues | Phase 2 §3 |

---

## 1A — Documents fondateurs vs état actuel

### A1 — `000_MANIFESTE_BDB_V1_2_0.md`

| Section / Règle | Respecté code/base | Violé | Disparu | Preuve |
|---|---|---|---|---|
| §1 — BDB = SAVOIR pas ACTION (avant + après, jamais pendant) | ✅ | — | — | Aucun module ne propose de saisie per-op. `pas-app.html` L75-83 réaffirme "Quand les gants sont mis, l'app reste dans la poche". |
| §2bis — Chaîne du chaos (8 maillons) | ⚠ partiel | — | — | Doctrine Terrain §1 cite 12+ maillons — version plus riche. À harmoniser. |
| §3 — Positionnement marché (5 familles + trou) | ✅ | — | — | Repris dans `SOCLE_TERRAIN_PRICING §5.3`. |
| §4 — Périmètre définitif (fait / ne fait jamais) | ✅ | — | — | Repris dans `pas-app.html` 6 limites. |
| §5 — 11 personas réels nommés | ⚠ | — | — | `CLAUDE.md` actuel parle de "9 personas P0-P8" → décalage. `31_PERSONAS_BDB_V1_4_0.md` à confronter (non lu en Phase 0 — recherche complémentaire requise). |
| §6 — 3 couches L1/L2/L3 + préfixes (`atelier_*`, `cds_*`, `bdb_*`) | ✅ | — | — | Tables `atelier_principes` (191), `atelier_decisions` (451), `cds_config/rules/sessions`, `bdb_principes` (52), `bdb_dependencies` (10), `bdb_liaisons` (1) confirmés. |
| §7.1 — Transverse absolu (signalement, feedback) | ⚠ partiel | — | — | Tables `signalements` (1 ligne) + `collab_ideas` existent. **Aucun composant `bdb-feedback.js` global vérifié**. À tracer Phase 2. |
| §7.2 — Démo = Seed + Vitrine | ✅ | — | — | 17 tables `demo_*` confirmées (3 lignes chacune). |
| §7.3 — Masquer ≠ Détruire (`actif = false`) | ⚠ partiel | — | — | `app_modules.status` (`active`/`coming_soon`) implémente, mais convention non vérifiée sur toutes les tables métier. À auditer. |
| §7.4 — Import récurrent OPTIM | ⚠ partiel | — | — | `staging_interventions_ortho` (88 832 lignes) + `staging_medacta_coste` (2 265). Pas d'outil admin L2 généralisé. |
| §7.5 — Auto-explicatif | ⚠ | — | — | Modules réservés (ged/pedagogie/recueil-situation) ont placeholders mais le reste du contrat C.9 (3 états DOM) est une convention applicative non auditée systématiquement. |
| §7.6 — Instanciable | ✅ | — | — | Table `app_instance` (1 ligne) + L1 vs L2 séparé en base. |
| §7.7 — Combo gagnant (6 maillons : NOM→CCAM→PICKING→VARIANTES→SUBSTITUTIONS→INTERVENTIONS) | ⚠ | — | — | Combo défini Manifeste §7.7 = 6 maillons. DOCTRINE §4 l'élargit à 12 (cours, transmissions, Paxis, DISC, évolutions, remises en question). Divergence à arbitrer Phase 2. |
| §9 — Doc 1/2/3 = DETTE ACTIVE | ⚠ | — | — | Doc 4 (atelier_*) ✅. Doc 1/2/3 toujours en dette — aucune progression visible depuis avril 2026. |
| §10 — Hiérarchie : MANIFESTE > JOURNAL > CTX_SYSTEM > CTX_MODULE | ⚠ | **❌** | — | `CLAUDE.md` cite cette chaîne mais avec versions périmées (`V1_34_0`, `V1_0_9`, `V2_4_0`). Versions actuelles : `V1_24_0` data model, `V1_1_0` chantier technique, `V2_5_0` system architecture. |

**Verdict A1** : Manifeste **respecté en pratique** (l'app suit le périmètre) **mais mal référencé** dans CLAUDE.md. La hiérarchie §10 doit primer ; or `CLAUDE.md` ne cite pas du tout les principes TOUJOURS du CANON ni la Doctrine Terrain ni la Philosophie Participative — seulement Manifeste, Journal, Chantier, System Architecture.

---

### A2 — `0000_BIBLE_DE_BLOC_CANON_V1_0_4.md`

| Section / Règle | Respecté code/base | Violé | Disparu | Preuve |
|---|---|---|---|---|
| §0 — Distinction TOUJOURS / AUJOURD'HUI | — | — | **❌** dans CLAUDE.md | `CLAUDE.md` ne distingue jamais TOUJOURS/AUJOURD'HUI. La base atelier_principes utilise `marqueur` (TOUJOURS pour 100% des principes consultés) — donc base cohérente, doc opérationnel non. |
| §1 — La Promesse "bonne info / bonne personne / bon moment / bon endroit / niveau de détail" | ✅ | — | — | Reprise dans `index.html`, `vision.html`, `audiences.html`. |
| §1 — "Une promesse sans module = dette à documenter" | ⚠ | **❌** | — | 13 promesses non implémentées identifiées par GPS (D-2026-04-26-GPS-04) — aucune trace du fichier rapport `S108_GPS_V1_0_0.md` qui les listerait. |
| §2 — Chaîne du chaos | ✅ | — | — | Cohérent avec Manifeste §2bis (mais maillons légèrement plus courts). |
| §2 — 7 STB (situations de blocage terrain) | ✅ | — | — | 7 STB-01..07 + STB-BOUCLE-01 = **8 STB** en base `atelier_principes WHERE categorie='stb'`. ✓ |
| §2 — "Toute fonctionnalité BDB adresse au moins une STB" | ⚠ partiel | — | — | 14/26 modules ont `stb_associee` renseignée. **12 modules sans STB** : annuaire, recueil-situation, disc, boite-a-idees, interview, site, admin, profile, supervision, ged, pedagogie, faq. Voir §1C. |
| §1.3 — 9 principes nommés (Deming, Eisenhower, Knowles, DISC, SECI, Wenger, FAB(3R), ELI15, Boudreault/CRAIE) | ✅ | — | — | **21 `principe_nomme` en base** : les 9 du Canon + 11 supplémentaires non documentés au CANON V1.0.4 (Barrand-POULET, Benner, CNA, CNP, Enneagramme-3C, Flin-CNT, GDE-emprunt-structurel, Ikigai-authentique, Kolb, Morin-complexité, Référentiel-IBODE-2022). À acter Phase 2. |
| §6 — Méthode arbitrage ELI15 + Comprendre/Apprendre/Agir + FAB(3R) | — | **❌** dans CLAUDE.md | — | `CLAUDE.md` ne cite ni FAB(3R) ni ELI15 ni la méthode d'arbitrage. Pourtant ANTI-01 en base "ELI15 + FAB(3R) obligatoires" est `marqueur=TOUJOURS`. |
| §8 — 8 règles ANTI-01..ANTI-08 pour l'IA | ✅ base / **❌** CLAUDE.md | — | — | 8 ANTI en base (`categorie='anti_ia'`). `CLAUDE.md` cite ses propres `INTERDIT-A1..E1` mais omet les ANTI-01..08. |
| §9 — 5 types de fiches (intervention, picking, instrumentation, révision, préférences) | ✅ | — | — | 5 `fiche_type` en base. |
| §10 — Hiérarchie sources de vérité (Principes TOUJOURS > MANIFESTE > DOCTRINE > atelier_decisions > CTX_MODULE > Code) | ⚠ | — | — | 6 `source_verite` en base mais `VERITE-FONDATION` pointe vers `atelier_principes` (catégories stb/axe/user_story) **alors que CANON §10 cite `atelier_fondation`**. La table `atelier_fondation` **n'existe pas** (vérification `information_schema` Phase 0) → contradiction CANON ↔ base. |

**Verdict A2** : CANON globalement respecté en base (191 principes structurés sur 18 catégories) mais **CLAUDE.md ignore le CANON** — aucune référence aux STB, aux principes nommés, à la méthode d'arbitrage, à TOUJOURS/AUJOURD'HUI, aux ANTI-01..08. **C'est l'écart critique n°1 du projet.**

---

### A3 — `0000_BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md`

| Section / Règle | Respecté code/base | Violé | Disparu | Preuve |
|---|---|---|---|---|
| §1 ELI15 / §2 Boudreault / §3 Knowles / §4 FAB(3R) / §5 Personal MBA Kaufman / §6 Deming / §7 Eisenhower / §8 DISC / §9 SECI / §10 Wenger | ✅ base | — | — | 9 principes nommés couverts en base + 11 ajouts non encore explicités dans l'Annexe. |
| Audience (Brigitte, Carole, néophytes) | — | — | **❌ pratique** | L'Annexe est un document audience large mais **aucune trace de diffusion ou d'usage applicatif**. Pas de page mini-site qui le référence. À transformer Phase 2 : page `site/principes-fondateurs.html` ou rubrique FAQ ? |

**Verdict A3** : Annexe est un excellent matériel pédagogique **mal exploité**. Source à intégrer dans le mini-site (Phase 2) ou dans le module FAQ (catégorie "principes").

---

### A4 — `0000_CTX_DOCTRINE_TERRAIN_V1_2_0.md`

| Section / Règle | Respecté code/base | Violé | Disparu | Preuve |
|---|---|---|---|---|
| §1 — 4 types de programmes (ortho froid / trauma / neuro / septique) | ✅ partiel | — | — | `thesaurus_protocoles` couvre les 4 catégories. À confirmer la complétude par catégorie Phase 2. |
| §1 — Chaîne complète 12+ intervenants | ✅ doctrine / ⚠ Manifeste | — | — | Doctrine plus riche que Manifeste §2bis (8 maillons). À réconcilier. |
| §1 — Ce que Claude ne doit JAMAIS faire (matching auto, OPTIM=vérité, score similarité) | ✅ base / **❌** CLAUDE.md | — | — | INTERDIT-CCAM-01/02/03 en base + GFC-03 staging-only. CLAUDE.md ne cite pas ces interdictions. |
| §2 — Définition correcte d'un protocole BDB (contexte + niveau certitude) | ⚠ | — | — | `thesaurus_protocoles.statut_completude` est une convention émergente — colonne à confirmer en base (non vérifiée Phase 0). |
| §3 — "Une version imparfaite documentée > perfection inexistante" | ✅ | — | — | Confirmé par 395 protocoles dont la majorité est partielle. |
| §4 — Combo gagnant 12 maillons (élargi : + cours + transmissions + Paxis + DISC + évolutions + remises en question) | ⚠ | **❌** Manifeste §7.7 | — | Manifeste = 6 maillons, Doctrine = 12. À arbitrer Phase 2. |
| §5 — Variantes par chirurgien (1 racine + delta) | ✅ | — | — | `preferences_chirurgien` (13 lignes) + `pref_referentiels` (91 lignes) implémentent. |
| §8 — 8 règles pour Claude | ✅ base / **❌** CLAUDE.md | — | — | Repris dans `bernard_regles` (8 lignes) et `garde_fou` (10 lignes). CLAUDE.md ne les cite pas. |
| §9 — Propriété du contenu (établissement vs individu) | ⚠ | — | — | Doctrine définit 4 actions admin (suspendre / changer rôle / supprimer std / supprimer + droit oubli) → non auditées en code Phase 0. |
| §9 — Cas chirurgien retraité (anonymisation "Dr C. retraité") | ⚠ | — | — | `thesaurus_chirurgiens` (12 lignes) inclut "actifs + retraités" (commentaire table). Procédure d'anonymisation à auditer. |

**Verdict A4** : DOCTRINE TERRAIN est le document le plus opérationnel mais **CLAUDE.md ne le cite pas**. INTERDIT-CCAM-01..03, GFC-03, les 8 règles Claude — tout est en base mais absent du point d'entrée IA. Écart critique n°2.

---

### A5 — `PHILOSOPHIE_PARTICIPATIVE_BDB_V1_0_0.md`

| Section / Règle | Respecté code/base | Violé | Disparu | Preuve |
|---|---|---|---|---|
| H1 — Rôles fonctionnels ≠ grades | ✅ base / **❌** CLAUDE.md | — | — | `INTERDIT-PHILO-H1` en base. CLAUDE.md ne mentionne pas la philosophie. |
| H2 — Canal formel pour tension (signalement transverse) | ⚠ | — | — | Table `signalements` (1 ligne) + `collab_ideas` (1 ligne). Composant transverse à confirmer. |
| H3 — Accountability sans propriété | ✅ base | — | — | `INTERDIT-PHILO-H3` en base. À auditer en code Phase 2. |
| H4 — Instances = cercles autonomes | ✅ | — | — | `app_instance` + L1/L2 séparés. |
| H5 — Règles lisibles et contestables | ⚠ | — | — | Existence des INTERDIT en base ✓. **Aucune page applicative qui les expose au membre.** |
| C1-C5 + DISC-RÈGLE-01 | ⚠ | — | — | Module `disc/` actif (12 personas + 28 savoir-être). DISC-RÈGLE-01 (forme jamais le fond) non vérifiée systématiquement. C5 distribution dynamique : `disc_distribution` RPC à vérifier. |
| S1-S5 (Definition of Done, user stories, kanban éditorial 6 états) | ⚠ | — | — | `INTERDIT-VOTE-01` (1 vote/user/item) en base. Kanban éditorial 6 états (`brouillon/soumis/en_revision/valide/publie/archive`) **non systématiquement implémenté** — aucune table métier ne montre ces 6 états. |
| P1 — 1 user = 1 vote | ✅ | — | — | `INTERDIT-VOTE-01` + `collab_votes` (0 ligne, mais structure prête). |
| P2 — Wiki modéré pas censuré | ⚠ | — | — | `glossaire_suggestions`, `tag_suggestions`, `glossaire_candidats` existent mais flux validation à auditer. |
| P3 — Progression Spirale Dynamique (`niveau_spirale`) | — | — | **❌** | **Aucune colonne `niveau_spirale` en base** sur les tables auditées Phase 0. Pattern SQL prescrit en A5 §SQL non appliqué. |
| P4 — Anonymat garanti pour progression personnelle | ⚠ | — | — | `disc_distribution` RPC SECURITY DEFINER mentionnée — à vérifier. `INTERDIT-CLASSEMENT` en base ✓. |
| P5 — Calibration collective itérative | — | — | À définir | A5 lui-même dit "STATUT : Méthode de calibration à définir en itérations (pas figée V1.0.0)". OK. |
| P6 — Reconnaissance sans classement | ✅ base | — | — | `INTERDIT-CLASSEMENT` en base. Annuaire de compétences existe (`fonctions_metier` 16 lignes) mais "expert sur tel domaine" non implémenté. |
| P7 — Admin = santé app pas contrôle users | ✅ base | — | — | `INTERDIT-ADMIN-NOM` en base. À auditer en code Phase 2. |
| Checklist 8 STOP | — | — | **❌** | **Pas appliquée systématiquement.** Aucun pre-commit hook / check de session n'utilise cette checklist. |

**Verdict A5** : Philosophie participative **partiellement implémentée en base (12 INTERDIT + GFC associés) mais zéro mention dans CLAUDE.md, zéro page mini-site qui l'expose, zéro check automatique avant production. Écart critique n°3.**

---

## 1B — Promesses site vs Modules réels

Source : `S108_GPS_AUDIT_FICHIERS.md` (177 promesses extraites de 11 pages site).

### Promesses module-spécifiques (couplage direct)

| Module BDB | Nb promesses ciblées | État réel | Écart |
|---|---|---|---|
| **fiches** | ~30 promesses (recherche tolérante, validation, traçabilité, signalement, contestation, version visible, archivage auto, contributions spontanées) | 5 lignes en base `fiches_intervention`. Module HTML actif mais contenu très partiel. | **DETTE n°1** identifiée par GFC-GPS-02 en base : "5 entrées digitales pour 30+ promesses mini-site". |
| **transmissions** | 5 promesses ("écrire une fois, l'app répond après") | 3 lignes en `transmissions`. Module HTML actif. | Volume réel à comparer avec promesse "L'app gère après". |
| **arsenal** | 4 promesses (matériel, CCAM intégré, fluidité opératoire) | 707 lignes `materiel`, 350 `protocole_ccam`, 8292 `referentiel_ccam`. Module mature. | Cohérent avec promesse. |
| **glossaire** | 1 promesse (vocabulaire chirurgical partagé) | 567 lignes `glossaire`, 374 exclusions, 160 candidats. Module mature. | Cohérent. |
| **cours** | 3 promesses (montée en compétence à son rythme, accompagnement, autonomie) | 3 lignes `cours`. Module **très partiel**. | **DETTE** : 3 cours réels vs promesse "accompagnement complet". |
| **carnet-bord** | 2 promesses (étapes validées tracées, progression individuelle) | 3 catégories + 58 items + 2 progressions + 9 livret encadrement + 49 livret items + 2 livret progression. **Module structuré.** | Cohérent. |
| **thesaurus** | 1 promesse (mots-clés organisés, synonymes gérés) | 395 protocoles, 89 653 interventions, 12 chirurgiens, 142 panseuses. **Module mature.** | Cohérent. |
| **anatomie** | 0 promesse explicite mais référencé périmètre | 1 ligne `anatomie` + 36 zones + 23 cours_zones. Module **squelettique pour le contenu réel**. | À auditer Phase 2. |
| **preferences** | 1 promesse implicite ("préférences documentées") | 13 lignes + 91 référentiels. Module fonctionnel mais peu peuplé. | Cohérent. |

### Promesses "global" (~110 promesses transverses)

| Catégorie | Nb promesses | Module censé tenir | État |
|---|---|---|---|
| Mémoire institutionnelle ("savoir survit aux départs") | ~15 | Tous les modules | ✅ tenue par L1+L2+RLS |
| Adoption sans pression ("pas imposé, pas surveillé") | ~12 | Système global | ✅ pas de tracking nominatif (à auditer en code) |
| Garanties juridiques ("zéro donnée patient, zéro opposable") | ~10 | Architecture globale | ✅ par périmètre (Manifeste §4) |
| Garanties IT ("zéro serveur, zéro coût licence par tête") | ~8 | Hosting OVH | ✅ static FTP |
| Mécanismes d'adoption ("2-3 personnes motivées créent les 1ères fiches") | ~7 | Démo + onboarding | ⚠ 17 tables `demo_*` (3 lignes chaque) — seed minimal. Onboarding admin = DETTE Doc 2. |
| Accessibilité WCAG 2.1 AA | ~16 | Tous les modules | ⚠ "Partiellement conforme" déclaré dans `accessibilite.html`. Audit interne récent (4 règles AA partielles). |
| Conseil des 5 (LIBRARIAN/ARCHITECT/SLICER/FIELD_OP/SKEPTIC) | ~8 dans `risques.html` | **Aucun module visible** | **❌ DETTE** : `CONSEIL-5-01` en base mais aucune implémentation visible (table, page, workflow). Promesse "Aucune fonction ne passe sans validation du Conseil" → engagement public sans mécanisme. |
| Triple légitimité (validé officiel / expert reconnu / usage éprouvé) | ~3 dans `fonctionnalites.html` | **Aucun module visible** | **❌ DETTE** : `TRIPLE-LEGIT-01` en base mais aucune colonne `legitimite_type` détectée Phase 0. |
| Métriques d'adoption (vrais signaux vs faux signaux) | ~3 dans `risques.html` | **Aucun module visible** | **❌ DETTE** : `METRIQUES-ADOPTION-01` en base, pas de dashboard visible. |
| Escalade gracieuse (Dork) | 1 dans `risques.html` | `veille-documentaire` (Dork) | ✅ `ESCALADE-01` en base + module `dork_*` (17 ops + 9 filetypes + 370 keywords). |

### Promesses fonctionnalités spécifiques **non implémentées**

D'après décision D-2026-04-26-GPS-04 : **13 fonctionnalités promises non implémentées**. Le rapport synthétique `S108_GPS_V1_0_0.md` qui les listerait individuellement **n'existe pas sur disque** (dette de traçabilité majeure). À recréer Phase 2 sur base du `S108_GPS_AUDIT_FICHIERS.md` + croisement DB.

---

## 1C — Standards internationaux vs Modules

État `app_modules` (lecture seule Phase 0) :

### Modules avec ancrage standard (14/26)

| Module | `standard_international` | `source_standard` | `stb_associee` |
|---|---|---|---|
| planning | OR Scheduling / Block Scheduling Standards + ASA Guidelines for OR Management | ASA Committee on OR Management — NHS Theatre Utilisation | STB-06 |
| fiches | AORN Guideline for Perioperative Documentation + WHO Surgical Safety Checklist 2009 | AORN — WHO Safe Surgery Saves Lives — HAS Checklist 2010 | STB-03 |
| installation | AORN Guideline for Positioning the Patient + Prevention of Pressure Injury | AORN 2023:701-776 — EORNA Best Practice 2023 §2.5 | STB-03 |
| anatomie | Terminologia Anatomica (TA2, FIPAT/IFAA 2019) | Federative International Programme — Thieme 2019 | STB-05 |
| arsenal | AORN Cleaning Surgical Instruments + GS1 UDI + AORN Retained Surgical Items | AORN 2026 — FDA UDI Rule 2013 — EORNA 2023 | STB-01 |
| preferences | **Preference cards (Surgeon preference cards)** ⭐ | AORN Journal 2024 | STB-02 |
| carnet_bord | Portfolio compétences IBODE (Arrêté 2022) + EORNA Competency Assessment | Arrêté 27 avril 2022 JORFTEXT000045696964 — EORNA 2023 | STB-06 |
| transmissions | **SBAR / ISBAR** ⭐ | NHS Institute 2008 — WHO Patient Safety 2007 — HAS | STB-03 |
| objectifs | CCI CFPN/CNOR Competency Framework + EORNA Framework | CCI 2021 (6 domaines) — EORNA 2019 — Arrêté IBODE 2022 (9 compétences) | STB-07 |
| veille-documentaire | Evidence-Based Practice (EBP) + Cochrane Perioperative Medicine | Cochrane — HAS Méthode — EORNA Research Committee | STB-07 |
| organisateur | WHO Surgical Safety Checklist + AORN Comprehensive Surgical Checklist | WHO 2009 — AORN 2024 — HAS Checklist 2010 | STB-03 |
| cours | EORNA Common Core Curriculum (3rd ed. 2019) + AORN Periop 101 | EORNA 2019 (60 ECTS min) — CCI CFPN/CNOR — Arrêté IBODE 2022 | STB-07 |
| thesaurus | Surgical procedure coding (CCAM, ICD-10-PCS, CPT) | ATIH CCAM V82 (8292 codes) | STB-04 |
| glossaire | Surgical terminology standards (SNOMED CT, CCAM, nomenclatures IBODE) | ATIH CCAM V82 — SNOMED CT — OQLF | STB-04 |

### Modules sans ancrage (12/26) — recherche externe requise

| Module | Standard suspecté | Prompt Perplexity à exécuter |
|---|---|---|
| annuaire | EORNA Team Roles / NHS Workforce Frameworks / aucun à confirmer | `"surgical team directory" OR "perioperative staff roster" standards EORNA NHS digital tool` |
| recueil-situation | Critical Incident Reporting (Flanagan 1954) / Reporting & Learning Systems WHO | `"critical incident technique" Flanagan OR "reporting learning system" patient safety perioperative` |
| disc | DISC (Marston 1928) déjà en base `principe_nomme` mais standard application healthcare | `"DISC assessment" healthcare team communication operating room application standardized` |
| boite-a-idees | Suggestion box / continuous improvement Kaizen | `"hospital staff suggestion system" OR "kaizen healthcare improvement" idea management tool` |
| interview | Reflective practice (Schön / Gibbs cycle) / debrief WHO | `"reflective practice" perioperative nursing OR "post-operative debriefing" structured tool standard` |
| site | Mini-site institutionnel — pas de standard métier applicable | (aucun) |
| admin | Administration / RBAC standards — pas de standard métier sectoriel | (aucun) |
| profile | Profile self-service — pas de standard métier | (aucun) |
| supervision | Clinical supervision IOM/Joint Commission / NHS supervision frameworks | `"clinical supervision" perioperative nurse OR "OR supervisor role" standards Joint Commission NHS` |
| ged | Document Management standards ISO 15489 / hospital DM | `"hospital document management" ISO 15489 perioperative SOP system` |
| pedagogie | Surgical education frameworks AORN Periop 101 (déjà cité cours) / EORNA pédagogie | `"perioperative nursing pedagogy" OR "surgical education framework" EORNA AORN evidence-based` |
| faq | FAQ system — pas de standard métier | (aucun) |

**Verdict 1C** : 14/26 ancrés (54 %). Pour les 7 modules métier sans ancrage (recueil-situation, disc, boite-a-idees, interview, supervision, ged, pedagogie), **recherche externe Perplexity requise** avant Phase 2 §2.

### Standards déjà identifiés et non encore liés à un module

| Standard | Source | Module BDB qui devrait l'absorber |
|---|---|---|
| **NOTECHS / Flin & Maran (CNT)** | `principe_nomme` PRINCIPE-FLIN-CNT en base | À ancrer sur `cours/` ou `disc/` (compétences non techniques) |
| **Boudreault/CRAIE niveaux** | `principe_nomme` PRINCIPE-BOUDREAULT-NIVEAUX | À ancrer sur `carnet_bord/` ou `cours/` |
| **Benner novice-expert** | `principe_nomme` PRINCIPE-BENNER | À ancrer sur `objectifs/` ou `carnet_bord/` |
| **Kolb cycle 4 phases** | `principe_nomme` PRINCIPE-KOLB | À ancrer sur `carnet_bord/` |
| **Barrand POULET** | `principe_nomme` PRINCIPE-BARRAND-POULET | Grille d'alignement modules — méta-outil L3 |
| **Référentiel IBODE 2022** | `principe_nomme` PRINCIPE-REFERENTIEL-IBODE-2022 | Déjà ancré sur `cours/`, `objectifs/`, `carnet_bord/` |

---

## 1D — Sources de régression identifiées

Trous par lesquels le savoir s'échappe entre sessions :

1. **`CLAUDE.md` désynchronisé des fondateurs**
   Versions techniques périmées (BS 5.3.2, références gouvernance V1_18_0 / V1_0_9 / V2_4_0). Aucune mention TOUJOURS/AUJOURD'HUI, STB, principes nommés, philosophie participative, méthode FAB(3R)+ELI15.
   → Risque : un IA amnésique répète les erreurs déjà résolues, contredit la doctrine sans le savoir.

2. **Référence orpheline `S108_GPS_V1_0_0.md`**
   Décision base `D-2026-04-26-GPS-04` annonce ce livrable comme "livré" mais le fichier n'est pas sur disque.
   → Risque : 177 promesses × 24 modules × 14 standards × 13 dettes non implémentées sont perdus à la prochaine session compactée.

2bis. **Référence orpheline `atelier_fondation`** (CANON §10)
   La table n'existe pas en base — le contenu "fondation" a été migré dans `atelier_principes` (catégories `stb`, `axe`, `user_story`).
   → Risque : un IA suit la consigne CANON et cherche une table inexistante.

3. **Templates avec placeholder qui sont copiés sans correction**
   `template/_TEMPLATE_MODULE_V5_0_1.html` avait `id="middle" id="[module]App"` — corrigé S108. Mais le pattern de copier-coller des templates est lui-même une source de régression : chaque nouveau module hérite des défauts du template sans signal.
   → Mitigation possible : commentaire explicite "Lors de la copie : remplacer X par Y" (ajouté en S108 sur le template).

4. **Principes documentés en base mais absents du code**
   - `niveau_spirale` (Philosophie A5 §P3) : pattern SQL prescrit, **non appliqué** sur tables métier.
   - Workflow éditorial 6 états (Philosophie A5 §S4) : pattern SQL prescrit, **non systématique**.
   - `Conseil des 5` : `CONSEIL-5-01` en base, **zéro implémentation** (pas de table `conseil_decisions` ni workflow visible).
   - `Triple légitimité` : `TRIPLE-LEGIT-01` en base, **pas de colonne `legitimite_type`** détectée.
   - `Métriques adoption` : `METRIQUES-ADOPTION-01` en base, **pas de dashboard**.

5. **Documents fondateurs récemment réinjectés**
   Les 5 fichiers A1-A5 ont disparu du repo entre la session précédente et celle-ci (constat session #109). Cause non documentée. Risque : **silence de gouvernance** — un fichier fondateur peut disparaître sans alerte.
   → Mitigation possible : checksum SHA-256 dans `JOURNAL_DECISIONS` pour chaque fondateur et alerte si modification non journalisée.

6. **Mémoire Claude (auto-memory)**
   `MEMORY.md` du projet ne contient qu'une seule entrée (`project_journal_version.md`). Pas d'ancrage des principes TOUJOURS, des STB, des INTERDIT clés. Une nouvelle conversation Claude charge les rappels système et CLAUDE.md mais **pas les fondateurs**.
   → Mitigation : enrichir `MEMORY.md` avec un pointeur vers chaque fondateur (Phase 3).

7. **Commentaires dans le code qui contredisent l'audit**
   6 modules avaient des commentaires `<!-- TODO @latest avant déploiement OVH -->` alors que la CDN active utilisait déjà le commit hash figé (audit S108 puis correction P3). Le commentaire stale **désinformait**.
   → Pattern à généraliser : tout TODO doit être daté (`TODO 2026-XX-XX:`) et fermé en commit.

8. **Skills Claude vs base**
   Le système de mémoire Claude (skills, hooks, settings.json) peut contredire la base de doctrine sans alerte. Aucun mécanisme automatique ne vérifie la cohérence skills ↔ atelier_principes.
   → Hors scope micro-audit, mais à inscrire au backlog.

9. **Décisions non descendues en code (ANTI-07)**
   Décision `D-2026-04-26-GPS-06` : "10 modules mis à jour, 14/24 ancrés". 12 modules restants en dette. La décision est en base mais le code n'a pas suivi pour les 12.
   → ANTI-07 stipule "Décision L3 → vérifier qu'elle descend en L1 via mécanisme explicite". Mécanisme manquant.

---

## 1E — Hiérarchie des sources (CANON §10) — vérification fonctionnelle

| Niveau CANON §10 | État actuel | Fonctionnel ? |
|---|---|---|
| 1. Principes TOUJOURS de ce document | 191 principes en base, 100 % `marqueur=TOUJOURS` sur l'échantillon (8 STB, 8 ANTI, 5 fiche_type, 6 source_verite, 21 principe_nomme) | ✅ accessibles via SQL `atelier_principes WHERE statut='active'` |
| 2. MANIFESTE_BDB | Existe sur disque (`000_MANIFESTE_BDB_V1_2_0.md`) | ✅ |
| 3. CTX_DOCTRINE_TERRAIN | Existe sur disque (`0000_CTX_DOCTRINE_TERRAIN_V1_2_0.md`) | ✅ |
| 4. atelier_decisions | 451 lignes en base | ✅ |
| 5. CTX_[MODULE].md | Présents pour ~25 modules dans `00_GOUVERNANCE/4X_CTX_*.md` à `7X_CTX_*.md` | ✅ (à confirmer Phase 2 par grep exhaustif) |
| 6. Code déployé | Audité S#108 (164 HTML, conformité 99,4 %) | ✅ |

**Rupture détectée** : `atelier_fondation` (CANON §10 ligne 5) n'existe pas. Le `VERITE-FONDATION` en base remappe vers `atelier_principes` (catégories `stb`, `axe`, `user_story`). **CANON et base sont en contradiction silencieuse** — à corriger Phase 2 (mettre à jour le CANON V1.0.4 → V1.0.5 ou bien créer la table `atelier_fondation` selon arbitrage Manu).

**Rupture détectée** : `CLAUDE.md` ne cite pas la chaîne CANON §10. Sa propre chaîne est : Manifeste → Journal → Chantier Technique → System Architecture → CTX Module → Code (omet Principes TOUJOURS, omet DOCTRINE TERRAIN, omet atelier_decisions). **Hiérarchie de fait ≠ hiérarchie canonique.**

---

## 2. SYNTHÈSE OPÉRATIONNELLE

### Ce qui est ALIGNÉ
- Périmètre BDB : SAVOIR pas ACTION ✅ tenu par tous les modules
- Architecture L1/L2/L3 : ✅ tables conformes aux préfixes
- 8 STB en base : ✅ alignées CANON §2
- 191 principes structurés en 18 catégories : ✅ base disciplinée
- 14/26 modules avec standard ancré (PONT-STANDARD-TERRAIN appliqué)
- Code S108 conforme à 99,4 % (164 HTML audités, dernières violations P3 corrigées)
- Hiérarchie §10 fonctionnelle pour 5/6 niveaux

### Ce qui est DÉSALIGNÉ
- `CLAUDE.md` ignore CANON, ANNEXE, DOCTRINE TERRAIN, PHILOSOPHIE PARTICIPATIVE
- `atelier_fondation` orphelin
- `S108_GPS_V1_0_0.md` orphelin
- 12/26 modules sans standard ancré
- Conseil des 5 / Triple légitimité / Métriques adoption : principes en base, **zéro code**
- `niveau_spirale` et workflow éditorial 6 états : **patterns SQL prescrits non appliqués**
- Combo gagnant 6 (Manifeste) vs 12 (Doctrine) : **divergence éditoriale**
- 9 personas (CLAUDE.md) vs 11 (Manifeste) : **divergence factuelle**
- "BLOC 0" (CLAUDE.md) : **vocabulaire orphelin**

### Ce qui est PERDU ou EN DETTE
- 13 fonctionnalités promises non implémentées (D-2026-04-26-GPS-04) sans détail traçable
- Doc 1, Doc 2, Doc 3 (Manifeste §9) — toujours en DETTE ACTIVE depuis avril 2026
- Audit Conseil des 5 / Triple légitimité / Métriques adoption non programmé

---

## 3. RECOMMANDATIONS POUR PHASE 2 (CDC)

1. **§1 Vision/mission** : Réconcilier la chaîne du chaos (8 vs 12 maillons) en faveur de la version DOCTRINE (12 maillons), plus exhaustive et opérationnelle.
2. **§2 Combo gagnant** : Adopter la version DOCTRINE §4 (12 maillons) qui inclut cours/transmissions/Paxis/DISC/évolutions/remises en question. Mettre à jour Manifeste §7.7 → V1.3.0.
3. **§2 Modules** : 26 entités à documenter, pas 24, pas 25. Inclure `site` et `template` même s'ils ne sont pas des modules métier au sens strict.
4. **§2 Standards** : pour les 12 modules sans ancrage, lister le prompt Perplexity exact (cf. §1C ci-dessus). Ne pas inventer le standard.
5. **§3 Transverses** : ajouter explicitement Conseil des 5, Triple légitimité, Métriques adoption, niveau_spirale, workflow éditorial 6 états — les 5 patterns prescrits non implémentés.
6. **§5 Vérification** : prescrire un check automatique `atelier_principes (TOUJOURS) ↔ CLAUDE.md ↔ code` à chaque clôture de session.

## 4. RECOMMANDATIONS POUR PHASE 3 (CLAUDE.md)

1. **Réécrire l'ensemble** en partant des 5 fondateurs A1-A5, pas de la version actuelle.
2. **Citer la hiérarchie CANON §10** (Principes TOUJOURS > Manifeste > Doctrine Terrain > atelier_decisions > CTX_MODULE > Code) en remplacement de la hiérarchie partielle actuelle.
3. **Remplacer "9 personas P0-P8" par "11 personas réels"** (Manifeste §5).
4. **Supprimer "BLOC 0"** (terme orphelin).
5. **Corriger Bootstrap 5.3.2 → 5.3.3** (audit S108 confirme 5.3.3 partout).
6. **Mettre à jour les références gouvernance** : V1_24_0 (data model), V1_1_0 (chantier technique), V2_5_0 (system architecture), version actuelle journal à confirmer.
7. **Ajouter section "Méthode d'arbitrage"** : ELI15 + Comprendre/Apprendre/Agir + FAB(3R) (CANON §6).
8. **Ajouter section "8 ANTI pour l'IA"** (CANON §8) en miroir des INTERDIT actuels.
9. **Ajouter section "Philosophie participative"** : H1-H5 + C1-C5 + S1-S5 + DISC-RÈGLE-01 + checklist 8 STOP.
10. **Ajouter section "Pricing & CNP"** : référence `SOCLE_TERRAIN_PRICING_V1_1_0` — 200k€/an = ROI ×4,5 minimum sur 30 ETP / 8800 interv/an / CNP 900k€-2,8M€.

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-27 | 1.0.0 | Création. Session #109 — Phase 1 audit d'écart. Lecture intégrale A1-A5 + B1-B4 + Supabase Bloc C + 3 pages site Bloc D. 191 principes + 26 modules + 451 décisions + 14 standards ancrés croisés. Aucun code modifié. |
