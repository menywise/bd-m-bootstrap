# S#109 — Cahier des charges BDB

```
VERSION  : 1.0.0
DATE     : 2026-04-27
AUTEUR   : Claude Code (Opus 4.7) — Session #109, Phase 2
SOURCES  : A1 Manifeste V1.2.0, A2 Canon V1.0.4, A3 Annexe V1.0.0,
           A4 Doctrine Terrain V1.2.0, A5 Philosophie Participative V1.0.0,
           B1 CLAUDE.md (état désaligné, à refondre Phase 3),
           B2 GPS S108_GPS_AUDIT_FICHIERS.md (177 promesses),
           B3 SOCLE_TERRAIN_PRICING V1.1.0 (CNP 900k–2,8M€/an),
           B4 5 audits micro S#108 (164 HTML conformes 99,4 %),
           Supabase atelier_principes (191 actifs), app_modules (26),
           atelier_decisions (451), 14 standards ancrés.
PORTÉE   : Décrire ce que BDB DOIT ÊTRE. Pas ce qu'il est aujourd'hui.
RÈGLE    : Ce document s'appuie sur Phase 1 (S109_AUDIT_ECART_CANON.md).
           Les écarts y sont identifiés. Ce CDC dit comment les combler.
CONTRAINTE : Lorsqu'un standard externe n'est pas confirmé, écrire le prompt
             Perplexity exact à exécuter, et marquer "recherche externe requise".
             Jamais inventer.
```

---

## §1 — VISION ET MISSION

**BDB est un système de transmission du savoir opératoire** pour les équipes de bloc opératoire. (Manifeste §1)

**Finalité unique** : améliorer la sécurité du patient par la transmission du savoir opératoire.

**Le pont standard ↔ terrain** : entre les standards internationaux (AORN, EORNA, WHO, CCAM, ATIH) et les pratiques locales hétérogènes (12+ intervenants, OPTIM approximatif, fiches papier, savoir oral disparaissant à chaque départ), BDB fait le pont. Il ne supprime pas le chaos terrain, il l'absorbe et restitue quelque chose d'utilisable. (Doctrine Terrain §7)

**Le coût de ne pas l'avoir (CNP)** : pour un bloc référence (30 ETP, 8 800 interv/an, ortho dominante), 893 000 € à 2 796 000 €/an répartis sur 6 postes (DMI, never events, turnover, picking, formation, gaspillage comportemental). À 200 k€/an, BDB représente moins de 2 % du coût de production du bloc et un ROI ≥ ×4,5. (Pricing §7)

**BDB intervient avant et après l'intervention. Jamais pendant.** (Manifeste §1)

**BDB ne remplace pas la formation académique, ne remplace pas l'oral, ne supplée pas une décision médicale, ne stocke aucune donnée patient, n'est pas opposable juridiquement.** (Manifeste §4 + pas-app.html)

---

## §2 — EXIGENCES FONCTIONNELLES PAR MODULE

> Convention : 26 modules selon `app_modules` en base. Inclus `site` (mini-site) et 3 modules en réserve (`recueil-situation`, `ged`, `pedagogie` — status `coming_soon`).
> Pour chaque module sans standard ancré, le prompt Perplexity exact à exécuter est indiqué — non exécuté dans ce livrable.

---

### MODULE 1 — `fiches` (Fiches d'intervention)

**STB ADRESSÉES** : STB-03 (information fragmentée sans sens global) ; transverse STB-05 (savoir tacite supposé universel).

**STANDARD DE RÉFÉRENCE** : AORN Guideline for Perioperative Documentation + WHO Surgical Safety Checklist 2009 + HAS Checklist sécurité bloc 2010. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : Optim (planning + saisie per-op, ne fait pas KM), Biblo.pro (fiches picking + photos, ne fait pas thésaurus/cours/CCAM/préférences). Différenciation BDB : pivot reliant picking ↔ protocoles ↔ variantes ↔ substitutions ↔ chirurgien.

**PROMESSES SITE CONCERNÉES** (≥30 promesses, dette n°1 du produit GFC-GPS-02) :
- "Tu tapes un mot. BDB trouve" / "La recherche est tolérante — 'S3' trouve 'Salle 3'"
- "Quand tu ne trouves pas, l'app propose trois options"
- "Les fiches sont validées par un groupe de référents"
- "Triple légitimité : validé officiel, expert reconnu, ou usage éprouvé"
- "L'historique des changements est visible" / "L'auteur est visible" / "Les modifications sont visibles"
- "Tu peux signaler une info douteuse avec un bouton contester"
- "L'équipe sait avant d'entrer en salle si c'est la première fois"
- "Certaines infos s'archivent automatiquement à l'échéance"
- "Infos permanentes créent versions à chaque modification"

**CONNEXIONS OBLIGATOIRES** (Combo gagnant DOCTRINE §4 — version 12 maillons) :
fiches ↔ thesaurus ↔ arsenal ↔ preferences ↔ installation ↔ cours ↔ transmissions ↔ interview (Paxis) ↔ disc ↔ glossaire ↔ historique versions ↔ remises en question.

**EXIGENCES FONCTIONNELLES** :
1. Recherche tolérante (Fuse.js + NFD) avec normalisation accents (source : `bdb-search.js`).
2. Triple légitimité visible : étiquette `validé officiel | expert reconnu | usage éprouvé` (source : `TRIPLE-LEGIT-01` en base — **à implémenter**).
3. Versionnage automatique avec auteur signé+daté (source : Manifeste §7.3 + DOCTRINE §3 archivage).
4. Bouton "Contester" présent sur toute fiche → ouvre `signalements` (source : promesse `fonctionnalites.html`).
5. Workflow éditorial 6 états (`brouillon → soumis → en_revision → valide → publie → archive` — source : Philosophie A5 §S4).
6. Niveau de complétude visible et honnête (statut_completude % par fiche — source : DOCTRINE §3 "le niveau est visible").
7. Suggestion 3 options en cas d'absence (source : promesse `fonctionnalites.html` n°5).
8. Archivage automatique pour infos à échéance + versionnage perpétuel pour infos permanentes.

**ÉTAT ACTUEL** : 5 lignes `fiches_intervention` en base. Module HTML mature (admin + index). Triple légitimité non implémentée. Workflow 6 états non implémenté.

**ÉCART** : volume contenu ↔ nb promesses (5 vs 30+) → DETTE n°1. Triple légitimité, workflow 6 états → DETTE structurelle.

---

### MODULE 2 — `transmissions` (Transmissions inter-équipes)

**STB ADRESSÉES** : STB-03 (information fragmentée), STB-06 (dépendance personnes clés).

**STANDARD DE RÉFÉRENCE** : SBAR / ISBAR (Situation–Background–Assessment–Recommendation), NHS Institute 2008, WHO Patient Safety 2007, recommandations HAS. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : SBAR cards papier dans la plupart des CHU. Aucune solution digitale spécifique bloc opératoire mature en France. (Recherche externe pour confirmer.)

**PROMESSES SITE CONCERNÉES** :
- "Tu écris une fois ce que tu sais, l'app répond après"
- "Ne jamais avoir à répéter ce que tu connais"
- "Les contributions spontanées peuvent être écrites une fois"

**CONNEXIONS OBLIGATOIRES** : transmissions ↔ fiches (signalement), transmissions ↔ disc (adapter ton selon profil destinataire), transmissions ↔ arsenal (matériel signalé).

**EXIGENCES FONCTIONNELLES** :
1. Format SBAR explicite : 4 champs structurés (S/B/A/R).
2. Possibilité de tagger fiche/protocole/matériel.
3. RLS active (audit S108 confirme).
4. Visibilité au choix : "nom" ou "équipe" (anonymat partiel — source : promesse n°20 `fonctionnalites.html`).
5. Composant transverse `bdb-feedback` réutilisable depuis tout module (Manifeste §7.1 transverse absolu).

**ÉTAT ACTUEL** : 3 lignes en base. Module HTML actif (admin + index). RLS active.

**ÉCART** : composant transverse à factoriser. Format SBAR explicite à confirmer (audit code Phase 3).

---

### MODULE 3 — `arsenal` (Matériel chirurgical)

**STB ADRESSÉES** : STB-01 (non-reconnaissance matérielle).

**STANDARD DE RÉFÉRENCE** : AORN Guideline for Cleaning Surgical Instruments + GS1 UDI (FDA UDI Rule 2013) + AORN Retained Surgical Items Prevention + EORNA Best Practice 2023. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : Easy WMS, G-STOCK (stocks/picking, pas de connaissance/formation). Différenciation BDB : pont matériel ↔ protocoles ↔ étagères ↔ packs.

**PROMESSES SITE CONCERNÉES** :
- "Le contexte réglementaire CCAM complet et intégré"
- "Bon matériel, au bon endroit, connu par tous"

**CONNEXIONS OBLIGATOIRES** : arsenal ↔ fiches (picking) ↔ thesaurus (codes CCAM) ↔ preferences (variantes) ↔ glossaire (synonymes matériel).

**EXIGENCES FONCTIONNELLES** :
1. Localisation physique (zones, étagères) — sources : 30 zones_stockage + 180 etageres en base.
2. Substitutions validées documentées (DOCTRINE §2 picking fluctuant).
3. Photos et synonymes pour chaque référence (STB-01 résolution).
4. Lien CCAM via `protocole_ccam` (350 lignes pont N:N).

**ÉTAT ACTUEL** : 707 références `materiel`, 13 types, 30 zones, 180 étagères, 8 292 codes CCAM. **Module mature.**

**ÉCART** : substitutions validées non systématiquement présentes — à auditer Phase 3.

---

### MODULE 4 — `glossaire` (Glossaire chirurgical)

**STB ADRESSÉES** : STB-04 (vocabulaire non partagé).

**STANDARD DE RÉFÉRENCE** : SNOMED CT + ATIH CCAM V82 + nomenclatures IBODE + OQLF terminologie chirurgicale. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : Confluence/Zendesk (wiki générique, pas de spécialisation chirurgie). Aucune solution glossaire chirurgical structurée FR.

**PROMESSES SITE CONCERNÉES** :
- "Termes du projet, méthodes, outils — expliqués simplement" (`glossaire.html`)
- "Vocabulaire chirurgical partagé — accès dès le premier jour" (`instances.html`)

**CONNEXIONS OBLIGATOIRES** : glossaire ↔ thesaurus (synonymes protocoles) ↔ arsenal (synonymes matériel) ↔ fiches (recherche).

**EXIGENCES FONCTIONNELLES** :
1. CRUD termes + catégories (audit S108 OK).
2. Suggestions par membre via `glossaire_suggestions` (table prête, 0 ligne — workflow validation à activer).
3. Exclusions documentées via `glossaire_exclusions` (374 lignes — flux d'apprentissage).
4. Candidats `glossaire_candidats` (160 lignes — pré-validation NLP).

**ÉTAT ACTUEL** : 567 termes. **Module mature.**

**ÉCART** : workflow validation suggestions à activer (P2 wiki modéré pas censuré).

---

### MODULE 5 — `thesaurus` (Thesaurus protocoles)

**STB ADRESSÉES** : STB-04 (vocabulaire), pivot du Combo gagnant.

**STANDARD DE RÉFÉRENCE** : Surgical procedure coding (CCAM, ICD-10-PCS, CPT). ATIH CCAM V82, 8 292 codes. ✅ ancré en base.

**PROMESSES SITE CONCERNÉES** :
- "Les mots-clés s'organisent seuls, synonymes gérés"
- "Le contexte réglementaire CCAM complet et intégré"

**CONNEXIONS OBLIGATOIRES** : thesaurus ↔ fiches (libellé canonique) ↔ arsenal (codes CCAM) ↔ preferences (variantes chirurgien) ↔ interventions terrain (89 653 lignes).

**EXIGENCES FONCTIONNELLES** :
1. Libellé canonique unique + synonymes (DOCTRINE §1 "Un synonyme n'est jamais une fiche à part entière").
2. Code CCAM vérifié ou vide (jamais faux — INTERDIT-CCAM-01..03 + ANTI-03).
3. Variantes chirurgien sur protocole racine (DOCTRINE §5 "1 protocole + delta par chirurgien").
4. Substitutions validées documentées.
5. Niveau de complétude visible (statut_completude %).

**ÉTAT ACTUEL** : 395 protocoles, 89 653 interventions historiques, 12 chirurgiens, 142 panseuses, 391 fiches papier rapprochées. **Module mature.**

**ÉCART** : qualité libellés / variantes à auditer Phase 3.

---

### MODULE 6 — `installation` (Installation patient)

**STB ADRESSÉES** : STB-03 (information fragmentée), STB-05 (savoir tacite).

**STANDARD DE RÉFÉRENCE** : AORN Guideline for Positioning the Patient + Prevention of Perioperative Pressure Injury + EORNA Best Practice 2023 §2.5. ✅ ancré en base.

**PROMESSES SITE CONCERNÉES** : zéro promesse explicite mais inclus dans périmètre (Manifeste §4).

**CONNEXIONS OBLIGATOIRES** : installation ↔ fiches (par voie d'abord) ↔ anatomie (positionnement par segment) ↔ preferences (variantes chirurgien) ↔ cours.

**EXIGENCES FONCTIONNELLES** :
1. Bibliothèque visuelle des positions (DV, DLG, DLD, etc.).
2. Risque de compression nerveuse documenté par position (AORN Pressure Injury).
3. Variantes par voie d'abord et chirurgien.

**ÉTAT ACTUEL** : 4 lignes en base. Module HTML actif.

**ÉCART** : volume très partiel — DETTE de contenu.

---

### MODULE 7 — `anatomie` (Anatomie)

**STB ADRESSÉES** : STB-05 (savoir tacite supposé universel).

**STANDARD DE RÉFÉRENCE** : Terminologia Anatomica (TA2, FIPAT/IFAA 2019, Thieme). ✅ ancré en base.

**PROMESSES SITE CONCERNÉES** : zéro promesse explicite mais inclus dans périmètre.

**CONNEXIONS OBLIGATOIRES** : anatomie ↔ installation (positionnement par segment) ↔ fiches (zone opérée) ↔ cours.

**EXIGENCES FONCTIONNELLES** :
1. Référentiel par zone anatomique (`zones_anatomiques` 36 lignes — base existante).
2. Liaison cours ↔ zone (`cours_zones_anatomiques` 23 lignes).
3. Nomenclature TA2 (latine standardisée).

**ÉTAT ACTUEL** : 1 ligne `anatomie` (squelettique). 36 zones + 23 liens cours.

**ÉCART** : contenu pédagogique très partiel — DETTE de contenu.

---

### MODULE 8 — `preferences` (Préférences chirurgien) ⭐

**STB ADRESSÉES** : STB-02 (préférences implicites non déclarées).

**STANDARD DE RÉFÉRENCE** : **AORN Surgeon Preference Cards** (AORN Journal 2024, Perioperative Standards). ✅ ancré en base. **Cas emblématique D-2026-04-26-GPS-02 : "Preference cards AORN réinventées sans le savoir"** — pourquoi le principe PONT-STANDARD-TERRAIN existe.

**SOLUTION EXISTANTE MARCHÉ** : preference cards papier dans tous les blocs. Solutions digitales américaines (epic, Cerner SurgiNet) — non disponibles en France pour les blocs autonomes.

**PROMESSES SITE CONCERNÉES** :
- "Les préférences du chirurgien ne sont jamais dites mais toujours attendues" (Canon §2 STB-02)
- "Vos préférences documentées, l'équipe sait" (`audiences.html`)

**CONNEXIONS OBLIGATOIRES** : preferences ↔ fiches (pivot chirurgien × protocole) ↔ arsenal (matériel préféré) ↔ thesaurus (variantes).

**EXIGENCES FONCTIONNELLES** :
1. Référentiels admin-configurables (`pref_referentiels` 91 lignes — pattern correct L2).
2. Saisie par chirurgien lui-même OU par IBODE (cas Dr A. peu à l'aise numérique — Canon §4).
3. Cas chirurgien retraité : anonymisation "Dr C. (retraité)" (DOCTRINE §9).
4. Mise à jour collégiale documentée (Pricing §6.3 : "réduit coût conso de 15 % sur une année").
5. Aucune fiche par chirurgien — delta sur protocole racine (DOCTRINE §5).

**ÉTAT ACTUEL** : 13 préférences en base + 91 référentiels. Module fonctionnel mais peu peuplé.

**ÉCART** : volume — DETTE de contenu. Le module qui justifie le levier économique n°1 (Pricing §6.3) doit être prioritaire.

---

### MODULE 9 — `planning` (Dashboard opératoire)

**STB ADRESSÉES** : STB-06 (dépendance personnes clés / cadre absent).

**STANDARD DE RÉFÉRENCE** : OR Scheduling / Block Scheduling Standards + ASA Guidelines for OR Management + NHS Theatre Utilisation. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : Optim, TimeWise, Torin — couvrent la planification. **BDB ne remplace pas Optim** (Manifeste §3). BDB consolide une vue dashboard par cadre/superviseur.

**PROMESSES SITE CONCERNÉES** : aucune promesse spécifique planning dans les 11 pages site auditées. **Promesse implicite via "Dashboard opératoire" du périmètre**.

**CONNEXIONS OBLIGATOIRES** : planning ↔ annuaire (membres) ↔ fiches (interventions) ↔ supervision.

**EXIGENCES FONCTIONNELLES** :
1. Affectations par semaine (`planning_semaines` 28 lignes, `planning_affectations` 2 382 lignes).
2. Membres équipe (`planning_membres` 36 lignes).
3. Vue admin et vue analytics multi-périodes.
4. Export PDF/impression.

**ÉTAT ACTUEL** : module mature avec 2 382 affectations, 16+ fichiers JS dédiés, 5 pages HTML (admin/analytics/export/index/planning).

**ÉCART** : architecture JS très fragmentée (16 fichiers) — à consolider Phase 3.

---

### MODULE 10 — `carnet_bord` (Carnet de bord)

**STB ADRESSÉES** : STB-06 (savoir part avec les gens), STB-07 (formation non alignée sur blocages réels).

**STANDARD DE RÉFÉRENCE** : Portfolio compétences IBODE (Arrêté 27 avril 2022 JORFTEXT000045696964) + EORNA Competency Assessment Framework 2023. ✅ ancré en base.

**STANDARDS COMPLÉMENTAIRES** :
- **Kolb cycle 4 phases** (en base `principe_nomme PRINCIPE-KOLB`) — à formaliser.
- **Benner novice-expert 5 stades** (en base `PRINCIPE-BENNER`) — à formaliser.
- **Boudreault grille 6 niveaux** (en base `PRINCIPE-BOUDREAULT-NIVEAUX`) — à formaliser.

**PROMESSES SITE CONCERNÉES** :
- "Chaque étape validée est tracée pour toi et ton cadre" (`vision.html`)

**CONNEXIONS OBLIGATOIRES** : carnet_bord ↔ objectifs ↔ cours ↔ disc (profil + adaptation).

**EXIGENCES FONCTIONNELLES** :
1. Catégories de progression (`carnet_categories` 3 lignes).
2. Items détaillés (`carnet_items` 58 lignes).
3. Progressions individuelles anonymisées au niveau pair (P4 anonymat — Philosophie A5).
4. Visibilité : membre (sa progression) + admin agrégé (jamais nominatif — INTERDIT-ADMIN-NOM).
5. Cycle Kolb 4 phases : EC (Expérience Concrète) → OR (Observation Réflexive) → CA (Conceptualisation Abstraite) → EA (Expérimentation Active).

**ÉTAT ACTUEL** : 3 catégories, 58 items, 2 progressions, livret encadrement (9), livret secteurs (6), livret items (49), livret progression (2). **Module structuré.**

**ÉCART** : Cycle Kolb 4 phases pas formellement implémenté. Boudreault niveaux non liés.

---

### MODULE 11 — `cours` (Cours topo)

**STB ADRESSÉES** : STB-07 (formation non alignée sur blocages réels), STB-05 (savoir tacite).

**STANDARD DE RÉFÉRENCE** : EORNA Common Core Curriculum for Perioperative Nursing (3rd ed. 2019, 60 ECTS min) + AORN Periop 101 + CCI CFPN/CNOR + Arrêté IBODE 27 avril 2022. ✅ ancré en base.

**SOLUTION EXISTANTE MARCHÉ** : Moodle, Dokeos (LMS génériques, pas de spécialisation bloc). AORN Periop 101 = référentiel américain non transposé en France.

**PROMESSES SITE CONCERNÉES** :
- "L'app accompagne la montée en compétence à ton rythme" (`vision.html`)
- "Tu progresses — infos clés accessibles quand tu en as besoin" (`audiences.html`)

**CONNEXIONS OBLIGATOIRES** : cours ↔ fiches (lien thématique) ↔ anatomie (zone) ↔ carnet_bord (progression) ↔ objectifs (référentiel compétence).

**EXIGENCES FONCTIONNELLES** :
1. Édition Quill (admin) avec rendu HTML sécurisé (INTERDIT-C6 + INTERDIT-QUILL-01).
2. Liaison zone anatomique (`cours_zones_anatomiques` 23 lignes).
3. Adaptation Andragogie (Knowles A3) : utile immédiatement, basé sur expérience adulte.
4. Chaque cours référence au moins une STB (Canon §2 "chaque cours BDB référence au moins une situation de blocage réelle").

**ÉTAT ACTUEL** : 3 cours en base. Module HTML mature (admin + index + edit + view).

**ÉCART** : 3 cours réels ↔ promesse "accompagnement complet" — DETTE de contenu majeure.

---

### MODULE 12 — `objectifs` (Intégration IDE)

**STB ADRESSÉES** : STB-07 (formation), STB-06 (savoir part).

**STANDARD DE RÉFÉRENCE** : CCI CFPN/CNOR Competency Framework (6 domaines) + EORNA Framework for Perioperative Nurse Competencies + Arrêté IBODE 2022 (9 compétences). ✅ ancré en base.

**STANDARDS COMPLÉMENTAIRES** : Benner 5 stades (`PRINCIPE-BENNER`).

**PROMESSES SITE CONCERNÉES** :
- "Les nouveaux s'intègrent plus vite" (transverse — `index.html`)

**CONNEXIONS OBLIGATOIRES** : objectifs ↔ carnet_bord (progression) ↔ encadrement (livret) ↔ secteurs.

**EXIGENCES FONCTIONNELLES** :
1. Critères évaluables (`objectifs_criteres` 39 lignes) liés aux 9 compétences IBODE 2022.
2. Évaluations chronologiques (`objectifs_evaluations` 5 lignes).
3. Encadrement (`livret_encadrement` 9, `livret_secteurs` 6, `livret_objectifs_items` 49, `livret_progression` 2).
4. Adaptation Benner : différencier novice / débutant avancé / compétent / performant / expert.

**ÉTAT ACTUEL** : structure complète (39 critères, 49 items, 9 encadrements). 5 évaluations enregistrées.

**ÉCART** : volume évaluations à monter. Stades Benner non formellement matérialisés en colonne.

---

### MODULE 13 — `disc` (Profils comportementaux)

**STB ADRESSÉES** : STB-06 (dépendance personnes clés).

**STANDARD DE RÉFÉRENCE** : DISC (Marston 1928 — `principe_nomme PRINCIPE-DISC` en base). **Pas de standard sectoriel application healthcare officiel — recherche externe requise.**

**PROMPT PERPLEXITY** :
```
"DISC assessment" healthcare team communication operating room standardized application
"Marston DISC" perioperative nursing OR "team behavior" surgical safety
"AORN team dynamics" OR "nursing communication style" digital tool
```

**SOLUTION EXISTANTE MARCHÉ** : recherche externe requise.

**PROMESSES SITE CONCERNÉES** : "Pas de classement individuel, pas de compteur visible" (`risques.html`) — couplé Philosophie A5 P6.

**CONNEXIONS OBLIGATOIRES** : disc ↔ profile (profil personnel) ↔ transmissions (adaptation forme) ↔ collab (collaboration adaptée).

**EXIGENCES FONCTIONNELLES** :
1. DISC-RÈGLE-01 : forme jamais le fond (Philosophie A5).
2. P4 anonymat : zéro user_id exposé entre pairs.
3. C5 distribution dynamique via RPC `disc_distribution()` SECURITY DEFINER.
4. 9 personas (`disc_personas`) + 28 savoir-être + 28 AT états + 21 méta-programmes.
5. Scénarios d'apprentissage (`disc_scenarios` 1 ligne, structure prête).

**ÉTAT ACTUEL** : 9 personas + 28 savoir-être + 28 AT + 21 méta + 1 scénario + 5 personnages + 3 scènes + 6 faits + détails (savoir-être, AT, VAKOG, recadrages, bascules, debriefs). **0 profils utilisateurs réels** (`disc_profils`/`disc_tests`/`disc_conclusions` vides). Module HTML mature.

**ÉCART** : pas d'utilisateur réel testé — DETTE d'usage. RPC `disc_distribution` à valider en code Phase 3.

---

### MODULE 14 — `interview` (PAXIS LOOP)

**STB ADRESSÉES** : STB-07 (formation non alignée sur blocages réels).

**STANDARD DE RÉFÉRENCE** : **recherche externe requise** — suspect Reflective Practice (Schön / Gibbs cycle) ou Critical Incident Technique (Flanagan).

**PROMPT PERPLEXITY** :
```
"reflective practice" perioperative nursing OR "post-operative debriefing" structured tool standard
"Schön reflective practitioner" OR "Gibbs reflective cycle" surgical OR healthcare
"critical incident technique" Flanagan perioperative
"AORN reflection" OR "EORNA professional reflection" framework
```

**SOLUTION EXISTANTE MARCHÉ** : recherche externe requise.

**PROMESSES SITE CONCERNÉES** : implicite via STB-07.

**CONNEXIONS OBLIGATOIRES** : interview ↔ recueil-situation (cas concrets) ↔ carnet_bord (progression) ↔ disc.

**EXIGENCES FONCTIONNELLES** :
1. 21 questions référentielles structurées (5 types × 6 rôles).
2. Sessions individuelles (`paxis_sessions` 1 ligne, structure prête).
3. Réponses initiales + générées en follow-up (`paxis_responses` 8).
4. Campagnes (`paxis_campaigns` 1 ligne).
5. Anonymat P4 — pas d'exposition pair.

**ÉTAT ACTUEL** : structure complète (21 questions, 1 campagne, 1 session, 8 réponses). Module HTML mature.

**ÉCART** : usage minimal — DETTE d'usage. Standard de référence à formaliser.

---

### MODULE 15 — `annuaire` (Annuaire équipe)

**STB ADRESSÉES** : aucune en base. **Module sans standard ancré.**

**STANDARD DE RÉFÉRENCE** : **recherche externe requise**.

**PROMPT PERPLEXITY** :
```
"surgical team directory" OR "perioperative staff roster" standards EORNA NHS digital
"hospital staff directory" healthcare RBAC competency profile
"perioperative team coordination" tool standardized
```

**PROMESSES SITE CONCERNÉES** : implicite (via "trombinoscope équipe", `audiences.html`).

**CONNEXIONS OBLIGATOIRES** : annuaire ↔ profile ↔ disc (profil) ↔ planning.

**EXIGENCES FONCTIONNELLES** :
1. Avatars + rôles + contacts (`profiles_directory` 34 lignes).
2. Anonymat partiel optionnel (P4).
3. Annuaire de compétences (P6 reconnaissance fonctionnelle pas compétitive) — qui sait quoi.

**ÉTAT ACTUEL** : 34 profils, 24 invitations en attente. Module HTML mature.

**ÉCART** : annuaire de compétences (P6) non implémenté.

---

### MODULE 16 — `boite-a-idees` (CollabKit)

**STB ADRESSÉES** : aucune en base. **Module sans standard ancré.**

**STANDARD DE RÉFÉRENCE** : **recherche externe requise**.

**PROMPT PERPLEXITY** :
```
"hospital staff suggestion system" OR "kaizen healthcare improvement"
"continuous improvement" perioperative OR "operating room idea management"
"collab tool" frontline staff suggestion validation workflow
```

**PROMESSES SITE CONCERNÉES** : transverse — H2 canal formel pour tension (Philosophie A5).

**CONNEXIONS OBLIGATOIRES** : boite-a-idees ↔ signalements ↔ admin (modération).

**EXIGENCES FONCTIONNELLES** :
1. Idées (`collab_ideas` 1 ligne), votes (`collab_votes` 0 lignes — UNIQUE user_id+item_id), catégories (`collab_categories` 4), projets (`collab_projects` 3).
2. P1 : 1 user = 1 vote / item.
3. Workflow brouillon → soumis → en_revision → publié.
4. Modération admin sans censure (P2 wiki modéré).

**ÉTAT ACTUEL** : structure prête, peu utilisée. Module HTML mature.

**ÉCART** : usage minimal. Workflow 6 états à confirmer en code.

---

### MODULE 17 — `veille-documentaire` (Dork Builder)

**STB ADRESSÉES** : STB-07.

**STANDARD DE RÉFÉRENCE** : Evidence-Based Practice (EBP) + Cochrane Perioperative Medicine + HAS Méthode + EORNA Research Committee. ✅ ancré en base.

**PROMESSES SITE CONCERNÉES** : aucune explicite — module L2 admin/expert.

**CONNEXIONS OBLIGATOIRES** : veille ↔ glossaire (termes pivots) ↔ thesaurus.

**EXIGENCES FONCTIONNELLES** :
1. Opérateurs Google Dork (`dork_operators` 17), filetypes (`dork_filetypes` 9), profils (`dork_profiles` 1), sources (`dork_sources` 3).
2. Mots-clés thématiques (`dork_keyword_groups` 8 + `dork_keywords` 370).
3. CHU France (`chu_france` 32) + écoles (`ecoles_sante_france` 92) + sources curatées (`chu_sources` 16) + templates (`chu_search_templates` 160).
4. Escalade gracieuse — pas de résultat n'est pas une impasse (`ESCALADE-01` en base).
5. Boîtes à outils Dunod (`bao_livres` 96, `bao_auteurs` 101, `bao_livre_auteur` 100).
6. Historique (`dork_history` 3).

**ÉTAT ACTUEL** : module très mature avec écosystème de données complet.

**ÉCART** : 4 pages admin (admin + admin-bao + admin-bao-deepseek + admin-sources-institutionnelles) — fragmentation à arbitrer Phase 3.

---

### MODULE 18 — `organisateur` (Parcours patient)

**STB ADRESSÉES** : STB-03.

**STANDARD DE RÉFÉRENCE** : WHO Surgical Safety Checklist + AORN Comprehensive Surgical Checklist + HAS Checklist 2010. ✅ ancré en base.

**PROMESSES SITE CONCERNÉES** : transverse Combo gagnant.

**CONNEXIONS OBLIGATOIRES** : organisateur ↔ fiches ↔ thesaurus ↔ planning.

**EXIGENCES FONCTIONNELLES** :
1. Parcours `organisateur_parcours` (5 lignes) — Base / Variante.
2. Étapes `organisateur_etapes` (78 lignes).
3. Brainstorm sessions (table prête, 0 ligne).
4. Commentaires + masques utilisateur (tables prêtes, 0 ligne).

**ÉTAT ACTUEL** : 5 parcours + 78 étapes. Module HTML actif.

**ÉCART** : sessions brainstorm + commentaires + masques non utilisés.

---

### MODULE 19 — `medacta-coste` (Implants spécifiques)

**STB ADRESSÉES** : non renseigné. Module **non listé dans `app_modules`** (recherche grep nécessaire).

**STANDARD DE RÉFÉRENCE** : aucun en base. **Module spécifique référent**.

**PROMESSES SITE CONCERNÉES** : implicite (jointures matériel-protocole).

**CONNEXIONS OBLIGATOIRES** : medacta-coste ↔ arsenal ↔ preferences ↔ thesaurus.

**EXIGENCES FONCTIONNELLES** :
1. Catalogue implants Medacta (référence chirurgien).
2. Jointures interventions (`medacta-coste-jointures.js` existe).
3. Analytics par référence.
4. Anonymisation côté UI — folder/JS encore nommés mais légitime puisque module spécifique référent (cf. CLAUDE.md futur Phase 3).

**ÉTAT ACTUEL** : 2 265 lignes `staging_medacta_coste`. Module HTML actif (sans page admin séparée).

**ÉCART** : pas d'admin standalone. Naming module porte le nom du chirurgien — choix éditorial à arbitrer Phase 3 (renommer `implants-medacta/` ?).

---

### MODULE 20 — `supervision` (Vue cadre)

**STB ADRESSÉES** : aucune en base. **Module sans standard ancré.**

**STANDARD DE RÉFÉRENCE** : **recherche externe requise**.

**PROMPT PERPLEXITY** :
```
"clinical supervision" perioperative nurse OR "OR supervisor role" Joint Commission NHS
"surgical floor manager" tool dashboard standardized
"perioperative team lead" responsibilities standards
```

**PROMESSES SITE CONCERNÉES** : implicite — vue cadre L2.

**CONNEXIONS OBLIGATOIRES** : supervision ↔ planning ↔ transmissions ↔ signalements.

**EXIGENCES FONCTIONNELLES** :
1. Tables `supervision_config`, `supervision_rules`, `supervision_rule_delta`, `supervision_sessions` — toutes vides.
2. Dashboard agrégé (P7 admin = santé app, jamais nominatif).
3. Détection des liaisons cassées, orphelins, contenus en attente validation.

**ÉTAT ACTUEL** : 1 fichier HTML + 1 487 lignes JS — mais 0 ligne de données. **Module en construction.**

**ÉCART** : module à concevoir réellement. Standard à identifier.

---

### MODULE 21 — `admin` (Hub administration)

**STB ADRESSÉES** : transverse.

**STANDARD DE RÉFÉRENCE** : aucun applicable (pas de standard métier sectoriel pour un hub admin).

**PROMESSES SITE CONCERNÉES** : aucune — module L2 admin invisible mini-site.

**CONNEXIONS OBLIGATOIRES** : admin ↔ tous les modules administrables.

**EXIGENCES FONCTIONNELLES** :
1. Hub d'accès aux 19 admins standalone (audit S108 confirmé).
2. Gestion utilisateurs + rôles (`profiles`, `user_roles`).
3. RGPD : 4 actions admin (suspendre / changer rôle / supprimer std / supprimer + droit oubli) — DOCTRINE §9.
4. P7 : dashboard santé app, jamais nominatif (INTERDIT-ADMIN-NOM).

**ÉTAT ACTUEL** : 1 fichier HTML + 2 277 lignes admin-app.js + admin-annuaire-app.js + admin-preferences-app.js. **Hub mature.**

**ÉCART** : 4 actions RGPD à auditer en code Phase 3.

---

### MODULE 22 — `profile` (Mon profil)

**STB ADRESSÉES** : aucune.

**STANDARD DE RÉFÉRENCE** : aucun applicable.

**PROMESSES SITE CONCERNÉES** : aucune explicite.

**CONNEXIONS OBLIGATOIRES** : profile ↔ disc ↔ annuaire ↔ avatars Storage.

**EXIGENCES FONCTIONNELLES** :
1. Édition profil personnel (avatar, infos, gants `gants` 20, casaques `casaques` 7).
2. Linking Google OAuth (Supabase auth.linkIdentity).
3. URL redirection dynamique (corrigé S109 P3).

**ÉTAT ACTUEL** : 1 fichier HTML + script inline. Module fonctionnel.

**ÉCART** : pas de fichier `profile-app.js` externalisé (script inline) — INTERDIT-JS-01 partiel.

---

### MODULE 23 — `faq` (FAQ & Aide)

**STB ADRESSÉES** : aucune en base. **Module sans standard ancré.**

**STANDARD DE RÉFÉRENCE** : aucun applicable (pas de standard FAQ métier).

**PROMESSES SITE CONCERNÉES** : "L'équipe prendra en compte ta question" (`faq.html`).

**CONNEXIONS OBLIGATOIRES** : faq ↔ tous les modules (rubrique par module_key).

**EXIGENCES FONCTIONNELLES** :
1. Table `site_faq` (33 entrées) — `show_in_site` mini-site, `show_in_module` app.
2. Catégorisation par module (`module_key`).
3. Interne (membres) + public (mini-site).

**ÉTAT ACTUEL** : 33 entrées FAQ. Module HTML mature.

**ÉCART** : aucun.

---

### MODULE 24 — `recueil-situation` (réservé) ⏸

**STB ADRESSÉES** : suspect STB-07 (formation non alignée).

**STANDARD DE RÉFÉRENCE** : **recherche externe requise**.

**PROMPT PERPLEXITY** :
```
"critical incident technique" Flanagan perioperative
"reporting and learning system" patient safety WHO HAS
"AORN incident reporting" OR "EORNA reflection" framework structured
```

**ÉTAT ACTUEL** : `coming_soon` en base. Page placeholder shell-only (audit S108 V2). `_RESERVE.md` + `CTX_PROJET.md` existants.

**ÉCART** : à concevoir Phase 2/3 — non implémenté.

---

### MODULE 25 — `ged` (réservé) ⏸

**STB ADRESSÉES** : non encore défini.

**STANDARD DE RÉFÉRENCE** : **recherche externe requise**.

**PROMPT PERPLEXITY** :
```
"hospital document management" ISO 15489 perioperative SOP
"surgical SOP repository" digital standardized
"electronic document management" healthcare regulatory
```

**ÉTAT ACTUEL** : `coming_soon`. Page placeholder. `_RESERVE.md`.

**ÉCART** : à concevoir.

---

### MODULE 26 — `pedagogie` (réservé) ⏸

**STB ADRESSÉES** : suspect STB-07.

**STANDARD DE RÉFÉRENCE** : **recherche externe requise** — suspect EORNA Common Core (déjà cours), AORN Periop 101.

**PROMPT PERPLEXITY** :
```
"perioperative nursing pedagogy" framework EORNA AORN
"surgical education" evidence-based instructional design
"clinical teaching" perioperative tool standardized
```

**ÉTAT ACTUEL** : `coming_soon`. Page placeholder. `_RESERVE.md`.

**ÉCART** : à concevoir.

---

## §3 — EXIGENCES TRANSVERSALES

> Tirées de Manifeste §7 + Canon §7 + Doctrine §8 + Philosophie A5.

### 3.1 — Combo gagnant (DOCTRINE §4 — version 12 maillons à adopter)

```
NOM LISIBLE → CCAM (vérifié ou vide) → PICKING (partiel OK) → VARIANTES CHIRURGIEN
→ SUBSTITUTIONS VALIDÉES → INTERVENTIONS TERRAIN → FICHES DE COURS → TRANSMISSIONS
→ PAXIS (situations bloquantes) → DISC (qui peut tenir sous pression)
→ ÉVOLUTIONS DOCUMENTÉES → REMISES EN QUESTION
```

**Règle** : un combo à 100 % > 100 protocoles à 50 % non liés.

**Décision Phase 2** : mettre à jour Manifeste §7.7 V1.2.0 → V1.3.0 pour aligner sur la version DOCTRINE 12 maillons.

### 3.2 — Transverse absolu (Manifeste §7.1)

Aucun mécanisme par module. Tickets, feedback, masquer/détruire, import, recherche, états vides, signalements — tout est transverse.

**Implémentation requise** : composant `bdb-feedback.js` chargeable par tout module via `<script>` standard, fournissant `bdbReportError(context, severity, message)` connecté à `signalements`.

### 3.3 — Masquer ≠ Détruire (Manifeste §7.3)

- **Masquer** (admin) : `actif = false`. Réversible. Données conservées.
- **Détruire** (dev seul) : DELETE. Irréversible.

**Règle SQL** : toute table métier inclut `actif BOOLEAN NOT NULL DEFAULT true` ou équivalent (`status TEXT` avec valeur 'archived').

### 3.4 — Auto-explicatif (Manifeste §7.5)

Chaque écran s'explique tout seul. États vides explicites (icône + message + bouton action). C.9 obligatoire.

### 3.5 — 3 États DOM (C.9)

Tout async DOM expose : loading (skeleton `.placeholder-glow`) / empty (icône + message) / error (`cdsShowGridError()`).

### 3.6 — escHtml() obligatoire (INTERDIT-C6)

Tout `innerHTML` qui rend du contenu DB passe par `escHtml()`. Exception : Quill HTML rendu intentionnellement (admin seulement).

### 3.7 — Guards d'accès

- `bdbGetSession()` / `bdbRequireAuth()` : appel **dans bdb-shell.js uniquement** (INTERDIT-B1, B3).
- `window.bdbUser.role` : `'admin' | 'membre' | 'invite'` — **jamais 'member'** (INTERDIT-B4).
- `bdb-invite-guard.js` intercepte mutations Supabase si `role==='invite'`.
- `isCreator` (atelier/conseil/createur) = guard distinct.

### 3.8 — Pattern admin maintenable

Hub `modules/admin/index.html` + 19 admins standalone `modules/[module]/admin.html`. Pas de mélange admin/membre dans `index.html`.

### 3.9 — Doctrine participative (Philosophie A5)

| Règle | Principe en base |
|---|---|
| 1 user = 1 vote / item | INTERDIT-VOTE-01 + UNIQUE(user_id,item_id) |
| Pas de scoring ni classement nominatif | INTERDIT-CLASSEMENT |
| Anonymat progression personnelle | RPC SECURITY DEFINER, jamais user_id agrégé |
| Admin = santé app, pas surveillance | INTERDIT-ADMIN-NOM |
| Wiki modéré pas censuré | flux validation, pas refus arbitraire |
| Rôles fonctionnels ≠ grades | INTERDIT-PHILO-H1 |
| Pas de propriétaire de contenu | INTERDIT-PHILO-H3 |
| Forme jamais le fond (DISC) | DISC-RÈGLE-01 |

### 3.10 — Workflow éditorial 6 états (Philosophie A5 §S4)

`brouillon → soumis → en_revision → valide → publie → archive`

**Pattern SQL prescrit non systématiquement appliqué** — à généraliser :
```sql
statut TEXT NOT NULL DEFAULT 'brouillon'
  CHECK (statut IN ('brouillon','soumis','en_revision','valide','publie','archive'))
```

### 3.11 — Niveau Spirale Dynamique (Philosophie A5 §P3)

**Pattern SQL prescrit non appliqué** — à intégrer :
```sql
niveau_spirale TEXT CHECK (niveau_spirale IN (
  'beige','violet','rouge','bleu','orange','vert'
)) DEFAULT 'beige'
```

### 3.12 — Triple légitimité (Pacte produit)

`TRIPLE-LEGIT-01` en base, **non implémenté en code** :
```sql
legitimite_type TEXT CHECK (legitimite_type IN (
  'valide_officiel','expert_reconnu','usage_eprouve'
)) DEFAULT 'usage_eprouve'
```

### 3.13 — Conseil des 5 (Pacte produit)

`CONSEIL-5-01` en base, **non implémenté**. 5 rôles : LIBRARIAN / ARCHITECT / SLICER / FIELD_OP / SKEPTIC. Promesse publique `risques.html` : "Aucune fonction ne passe sans validation du Conseil".

**Implémentation requise** :
- Table `conseil_decisions` (decision_id, role, position, justification, timestamp).
- Workflow : décision proposée → 5 challenges → arbitrage Manu → publication.
- Page `createur/conseil/` audit S108 atteste l'existence du shell HTML — backend manquant.

### 3.14 — Méthode d'arbitrage (Canon §6)

Toute décision technique passe par :
1. **ELI15** : expliquer comme à un collègue intelligent sans formation technique.
2. **Comprendre / Apprendre / Agir** (Boudreault/CRAIE) : avant d'agir, comprendre le contexte, apprendre.
3. **FAB(3R)** : Réalité / Fonction / Avantage / Bénéfice / Risque / Résultat / Recommandation.

`ANTI-01` en base : "ELI15 + FAB(3R) obligatoires avant toute livraison technique".

### 3.15 — 8 ANTI pour l'IA (Canon §8)

| Code | Règle |
|---|---|
| ANTI-01 | ELI15 + FAB(3R) avant livraison |
| ANTI-02 | Schéma DB → information_schema, jamais inventer |
| ANTI-03 | Code CCAM → referentiel_ccam, vide > faux |
| ANTI-04 | Nouveau module → STB associée vérifiée |
| ANTI-05 | Saisie → d'abord ce que Sabine verra en lecture |
| ANTI-06 | Acteur → bénéfice possible sans toucher BDB |
| ANTI-07 | Décision L3 → mécanisme explicite vers L1 |
| ANTI-08 | Contradiction TOUJOURS → ELI15+FAB(3R), pas refus |

### 3.16 — Wording empathique

- AT (Analyse Transactionnelle) — ton "Adulte" majoritaire, "Parent Nourricier" pour rassurer P1/P2.
- Hypnose conversationnelle — accroches (truismes), suggestions indirectes, recadrages doux.
- Pas de DC (Dominant-Conformist) brutal, sauf cible D explicite (cf. Brigitte cadre).
- Tutoiement P1/P2, vouvoiement P5/P6 (Brigitte directrice, P. directeur).

### 3.17 — Composants techniques obligatoires

| Composant | Rôle |
|---|---|
| `bdb-shell.js` | Auth + nav + profil — premier enfant de `<main>` (INTERDIT-E1) |
| `bdb-invite-guard.js` | Bloque mutations si role='invite' |
| `bdb-search.js` | `BdbSearch` Fuse.js + NFD |
| `bdb-toast.js` | `BdbToast` Notyf + aria-live |
| `bdb-ui.js` | Helpers UI partagés |
| `bdb-pwa.js` | Progressive Web App (déjà chargé sur site) |

**Ordre BLOC E (CSS)** : Bootstrap 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides.css → [module]-ui.css.

**Ordre chaîne JS** : bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → [module]-app.js.

---

## §4 — EXIGENCES D'INTÉGRATION MULTI-IA

### 4.1 — Claude amnésique (1 minute)

**Cible** : un Claude ouvrant le projet pour la première fois doit comprendre :
1. Ce que BDB est (Manifeste §1) en ≤ 2 lignes.
2. Ce qu'il n'est pas (Manifeste §4) en ≤ 5 lignes.
3. La méthode d'arbitrage (Canon §6) en ≤ 3 étapes.
4. Les 5 sources de vérité (Canon §10).
5. Où aller pour tout le reste.

**Solution Phase 3** : `CLAUDE.md` réécrit avec section "1 minute" en tête, références aux fondateurs A1-A5 dans la première moitié, et section "Pour aller plus loin" qui pointe vers les CTX modules.

### 4.2 — Prompt Perplexity générable

**Cible** : pour tout module sans standard ancré, le prompt Perplexity exact à exécuter doit être disponible (cf. §2 — pour 7 modules : disc, recueil-situation, boite-a-idees, interview, supervision, ged, pedagogie).

**Solution Phase 2** : ce CDC les liste. Phase 3 : pointer vers ce CDC depuis `CLAUDE.md`.

### 4.3 — Livrable Deepseek/Gemini intégrable

**Cible** : un livrable d'une autre IA peut être collé dans le projet sans casse.

**Solution** :
- Tout livrable d'IA externe entre dans `00_GOUVERNANCE/_deltas/` ou `00_GOUVERNANCE/draft_*.md` AVANT intégration.
- Vérification automatique (à créer) : grep INTERDIT-* sur le livrable + vérification syntaxe SQL si présent + check chaîne BLOC E si HTML.
- Décision d'intégration formalisée dans `atelier_decisions` avec ref `D-YYYY-MM-DD-INTEG-NN`.

### 4.4 — Code Ewan sans régression

**Cible** : un dev externe (Ewan) intègre une instance sans casser le L1.

**Solution** :
- Doc 3 (`Manifeste §9`) à compléter — actuellement DETTE ACTIVE.
- Conventions de code et schéma DB versionnés (déjà en place : 02_SUPABASE_DATA_MODEL_V1_24_0).
- Migration scripts (atelier_principes catégorie `tech` 9 lignes documente le pattern migrations).

### 4.5 — Auto-explicatif par fichier

**Cible** : chaque fichier porte le contexte de son existence.

**Patterns** :
- Balise GF-2 en ligne 1-2 : `<!-- BDB | Surface: X | Auth: Y | Shell: Z -->`.
- En-tête de commentaire pour tout `.md`/`.sql`/`.ps1` avec VERSION/DATE/AUTEUR/STATUT/RÈGLE.
- Commentaires "Pourquoi" dans le code pour les choix non triviaux (jamais "Quoi" ni "Comment" — déjà évident).

---

## §5 — EXIGENCES DE VÉRIFICATION

### 5.1 — Cockpit local (build-cockpit.ps1)

État : ✅ déjà existant, généré à `createur/atelier/cockpit.html`. Régénération manuelle ou planifiée.

**Évolution requise** : ajouter section "Conformité doctrine" qui liste :
- Nb modules sans standard ancré (objectif 0).
- Nb principes en base catégorie `garde_fou` non couverts en code (objectif 0).
- Nb promesses site sans module supportant (objectif 0).

### 5.2 — Check avant déploiement (check-before-ftp.ps1)

État : ✅ existant.

**Évolution requise** : grep INTERDIT-* automatique avant FTP. Détection `console.log`, `@latest`, `Auth: none`, double `id` HTML, hashes CDN non figés.

### 5.3 — Audit non-régression

**À mettre en place** :
- Sha256 des 5 fondateurs A1-A5 dans `MEMORY.md` ou `JOURNAL_DECISIONS`.
- Si modification non journalisée → alerte session suivante.
- Audit micro automatique mensuel (re-run S108 micro audits).

### 5.4 — Vérification liens inter-modules

**À mettre en place** :
- Pour chaque module en base, vérifier que ses connexions obligatoires (cf. §2) sont en code.
- Exemple : `fiches/index.html` doit charger `bdb-search.js` (recherche transverse) — grep automatique.

### 5.5 — Conformité pricing ↔ promesses ↔ code

**À mettre en place** :
- 6 postes CNP (Pricing §7) → 6 modules clés (fiches, transmissions, preferences, arsenal, cours, signalements).
- Pour chaque poste, vérifier que le module clé existe et fonctionne.
- Calculateur ROI (déjà livré) reflète le pricing actuel.

### 5.6 — Vérification doctrine ↔ base

**À mettre en place** :
- atelier_principes catégorie `source_verite` doit pointer vers tables existantes en base.
- VERITE-FONDATION → table `atelier_fondation` **n'existe pas** → soit créer la table, soit corriger le principe (Phase 2/3).

---

## §6 — DETTES IDENTIFIÉES (ordre de priorité)

| # | Dette | Source | Phase de résolution |
|---|---|---|---|
| **D1** | `S108_GPS_V1_0_0.md` orphelin (177 promesses × 24 modules × 14 standards × 13 dettes synthèse) | D-2026-04-26-GPS-04 | Phase 2 : recréer à partir de S108_GPS_AUDIT_FICHIERS.md |
| **D2** | `atelier_fondation` table inexistante mais référencée Canon §10 | A2 §10 vs base | Phase 2/3 : créer table OU corriger Canon V1.0.5 |
| **D3** | 12/26 modules sans standard ancré (PONT-STANDARD-TERRAIN incomplet) | GFC-PONT-01 + D-2026-04-26-GPS-06 | Phase 2 : 7 prompts Perplexity à exécuter |
| **D4** | `CLAUDE.md` désaligné des 5 fondateurs | Phase 1 §1A-1E | Phase 3 : réécriture intégrale |
| **D5** | Conseil des 5 promis publiquement, **0 implémentation** | CONSEIL-5-01 + risques.html | Phase 2 : table + workflow + page conseil/ |
| **D6** | Triple légitimité promise, **0 colonne `legitimite_type`** | TRIPLE-LEGIT-01 + fonctionnalites.html | Phase 2 : pattern SQL généralisé |
| **D7** | Métriques d'adoption promises, **0 dashboard visible** | METRIQUES-ADOPTION-01 + risques.html | Phase 2 : dashboard supervision/ |
| **D8** | Workflow éditorial 6 états prescrit, non systématique | Philosophie A5 §S4 | Phase 2 : pattern SQL à généraliser sur tables métier |
| **D9** | `niveau_spirale` prescrit, **0 colonne en base** | Philosophie A5 §P3 | Phase 2 : pattern SQL à intégrer |
| **D10** | Module `fiches` : 5 lignes vs 30+ promesses | GFC-GPS-02 | Phase post-CDC : remplissage contenu |
| **D11** | Module `cours` : 3 lignes vs promesse "accompagnement complet" | GPS | Phase post-CDC : remplissage contenu |
| **D12** | Module `installation` : 4 lignes — DETTE contenu | Audit base | Phase post-CDC : remplissage contenu |
| **D13** | Module `anatomie` : 1 ligne — DETTE contenu | Audit base | Phase post-CDC : remplissage contenu |
| **D14** | Doc 1 (utilisateur), Doc 2 (admin), Doc 3 (dev) — DETTE ACTIVE depuis avril 2026 | Manifeste §9 | Backlog continu |
| **D15** | 11 principes nommés en base (Barrand-POULET, Benner, CNA, CNP, Enneagramme-3C, Flin-CNT, GDE, Ikigai, Kolb, Morin, Référentiel-IBODE-2022) **non documentés au CANON V1.0.4** | A2 §1.3 vs base | Phase 2/3 : extension annexe ou Canon V1.0.5 |
| **D16** | Combo gagnant 6 (Manifeste) vs 12 (Doctrine) | A1 §7.7 vs A4 §4 | Phase 2 : Manifeste V1.3.0 |
| **D17** | Chaîne du chaos 8 (Manifeste) vs 12+ (Doctrine) | A1 §2bis vs A4 §1 | Phase 2 : Manifeste V1.3.0 |
| **D18** | 9 personas (CLAUDE.md) vs 11 (Manifeste §5) | B1 vs A1 | Phase 3 : aligner sur Manifeste |

---

## §7 — RECHERCHES EXTERNES PERPLEXITY À EXÉCUTER

> 7 prompts à exécuter par Manu hors session Claude Code. Résultats à injecter en Phase 2.5 / 3.

### Prompt 1 — disc application healthcare
```
"DISC assessment" healthcare team communication operating room standardized application
"Marston DISC" perioperative nursing OR "team behavior" surgical safety
"AORN team dynamics" OR "nursing communication style" digital tool
```

### Prompt 2 — recueil-situation / critical incidents
```
"critical incident technique" Flanagan perioperative
"reporting and learning system" patient safety WHO HAS
"AORN incident reporting" OR "EORNA reflection" framework structured
```

### Prompt 3 — boite-a-idees / kaizen healthcare
```
"hospital staff suggestion system" OR "kaizen healthcare improvement"
"continuous improvement" perioperative OR "operating room idea management"
"collab tool" frontline staff suggestion validation workflow
```

### Prompt 4 — interview / reflective practice
```
"reflective practice" perioperative nursing OR "post-operative debriefing" structured tool standard
"Schön reflective practitioner" OR "Gibbs reflective cycle" surgical OR healthcare
"AORN reflection" OR "EORNA professional reflection" framework
```

### Prompt 5 — annuaire / staff directory
```
"surgical team directory" OR "perioperative staff roster" standards EORNA NHS digital
"hospital staff directory" healthcare RBAC competency profile
"perioperative team coordination" tool standardized
```

### Prompt 6 — supervision / clinical supervision
```
"clinical supervision" perioperative nurse OR "OR supervisor role" Joint Commission NHS
"surgical floor manager" tool dashboard standardized
"perioperative team lead" responsibilities standards
```

### Prompt 7 — ged / hospital DMS
```
"hospital document management" ISO 15489 perioperative SOP
"surgical SOP repository" digital standardized
"electronic document management" healthcare regulatory
```

### Prompt 8 (bonus) — pedagogie / surgical education
```
"perioperative nursing pedagogy" framework EORNA AORN
"surgical education" evidence-based instructional design
"clinical teaching" perioperative tool standardized
```

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-27 | 1.0.0 | Création. Session #109 — Phase 2 CDC. 26 modules documentés (14 ancrés + 12 sans standard). 8 prompts Perplexity générés. 18 dettes priorisées. Aucun code modifié, aucun standard inventé. |
