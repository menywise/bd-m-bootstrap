# AUDIT NIVEAU 0 — Gouvernance DB&M
## V1.0.0 · 01 mai 2026

```
PERIMETRE  : 81 fichiers .md du dossier 00_GOUVERNANCE/ (recursif inclus _deltas/ et Print/)
METHODE    : Lecture des en-tetes systematique + lecture en profondeur des fondateurs
             + grep cible (BDB/DB&M, NOYAU_VERITE, atelier_fondation, JOURNAL_DECISIONS)
FRAMEWORK  : 000000_NIVEAU_0_DBM_V0_5_0.md (sections 3, 4.1, 4.2, 4.3, 7, 8)
AUDITEUR   : Claude (fork) — Session AUDIT_N0
RAPPEL     : Vide est correct. Faux est destructeur.
             Les notes ARE 1-5 sont indicatives, pas absolues.
             "Indeterminable" est un statut valide quand la lecture ne tranche pas.
```

---

## SYNTHESE EXECUTIVE

1. **Contamination systemique par references mortes.** 35 documents sur 81 (43 %) referencent encore `NOYAU_VERITE`, `JOURNAL_DECISIONS` ou `atelier_fondation` — trois entites supprimees ou inexistantes. Touche surtout les CTX modules (40-70) qui n'ont pas ete migres apres la decision D-2026-04-03-T01.

2. **Bascule de nom inachevee.** "BDB" / "Bible de Bloc" : 814 occurrences sur 83 fichiers. "DB&M" / "Des Blocs & Moi" : 24 occurrences sur 16 fichiers seulement. La bascule de nom decidee dans `app_instance` n'a quasi rien produit en gouvernance — seuls les 7 fichiers DBM tres recents et NIVEAU_0 utilisent le nouveau nom.

3. **Doublons de contenu non resorbes.** `12_SYSTEM_ARCHITECTURE V2.5.0` + `10_CHANTIER_TECHNIQUE V1.1.0` ont ete officiellement fusionnes dans `10_ARCHITECTURE_REGLES_TECHNIQUES V3.0.0` mais les deux sources continuent d'exister cote a cote. Idem `01_ACCES_NIVEAUX V1.1.0` (delta) vs V1.2.0. Risque amnesie/regression.

4. **Contradiction §10 fondateurs persistante.** Canon V1.0.4 §10 cite `atelier_fondation` (table inexistante) ; Manifeste V1.2.0 §10 cite `JOURNAL_DECISIONS` (fichier supprime) et `CTX_SYSTEM_ARCHITECTURE` (peri me). Hierarchie des sources de verite officielle = casse a deux endroits dans deux fondateurs simultanement. Documente comme dette dans `S109_AUDIT_ECART_CANON` mais jamais resolue.

5. **Etage 0 (identite) en construction depuis 4 versions.** `00000_IDENTITE_BDB_V0_1_0` (en realite V0.3.0 dans le contenu) + `000000_FONDATIONS_DBM_STRUCTURE_CIBLE` listent 11 actions a trancher par Manu — aucune tranchee. Les 5 Pourquoi, la mission, la vision sont decrits comme champs `[A TRANCHER]`. Etat semi-stable mais non finalise.

---

## 1 — FONDATEURS DBM RECENTS (apr-may 2026)

### `0000000_PITCH_FONDATEUR_DBM_V1_0_0.md`
- **A** Version 1.0.0 / 2026-04-30 / Pitch fondateur grand public, 3 audiences simultanees (terrain, business, technique).
- **B** sain
- **C** A=4 (texte fini, declenche pas de regle directe) · R=4 (sources tracees, remplace 3 formulations anterieures) · E=5 (incarne, Sabine/Julie/Brigitte concrets)
- **D** vert (consensus narratif)
- **E** Type 3 (resultat — produit un pitch)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune des 3
- **H** Cite Manifeste §1, Pedagogie §0, archive Canon V0.4. Termes : "Des Blocs & Moi" 1× / "BDB" 0× — sain DB&M.
- **I** n0_conforme
- **J** Aucune action.

### `000000_FONDATIONS_DBM_STRUCTURE_CIBLE.md`
- **A** Version non datee dans header / 2026-04-29 (filesystem) / Carte de la structure cible des etages 0-7 + 11 actions a trancher.
- **B** sain (en construction explicite)
- **C** A=5 (planning concret) · R=4 (cite l'existant et le manquant) · E=3 (clinique, pas chaleureux)
- **D** orange (planification, optimisation)
- **E** Type 3 (resultat) avec aile Type 1 (integrite)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune des 3
- **H** Cite quasi tous les fondateurs. Termes : "DB&M" 3× / "BDB" 1× — sain.
- **I** ameliorable
- **J** Ajouter version explicite dans le header. Tracker des 11 actions tranchees vs ouvertes.

### `000000_LES_7_VOIX_AUDIT_DBM_V1_0_0.md`
- **A** Version 1.0.0 / 2026-04-30 / 7 personas d'audit (Aurele, Blanche, Constance, Dorian, Estelle, Fernand, Gael) couvrant types ennea 0-9 via fleches.
- **B** sain
- **C** A=4 · R=5 (sourcage Riso/Hudson, Marston, Beck&Cowan implicite) · E=4 (chaque persona a une "question fatale")
- **D** jaune (integration multi-grille — ennea + DISC + spirale)
- **E** Type 5 (savoir partage incomplet — "premiere iteration")
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune des 3
- **H** Cite Niveau 0 §9 (Bernard chef de file). Termes : DB&M dominant.
- **I** n0_conforme
- **J** Aucune.

### `000000_NIVEAU_0_DBM_V0_5_0.md`
- **A** V0.5.0 / 2026-05-01 / Sas d'entree universel, framework de navigation (cap, ARE, spirale, ennea proc, MERE, FAB(3R), 6 interdits, 3 maladies, Bernard).
- **B** sain — c'est le framework lui-meme.
- **C** A=4 (les 6 interdits sont actionnables) · R=5 (chaque concept source : Beck&Cowan, Riso&Hudson, Marston, Bandler&Grinder, Berne, Knowles, Nonaka implicite) · E=5 (texte qui se traverse, pas qui se lit)
- **D** jaune (integration systemique)
- **E** Type 5 (savoir) integre en 8 (puissance — protege sans ecraser)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅ — c'est l'etalon.
- **G** Aucune des 3
- **H** Cite Bernard, type 0, PONT-STANDARD-TERRAIN (angle mort assume §14). Termes : DB&M exclusif.
- **I** n0_conforme — etalon de reference.
- **J** Aucune. Maintenir la porte ouverte type 0 §14 explicite.

### `000000_REFERENTIEL_AFFIRMATIONS_DBM_V2_0_0.md`
- **A** V2.0.0 / 2026-04-30 / 258 affirmations validees V/F en 19 lots, chaque affirmation enrichie voix valide / voix conteste / spirale / etat / orientation.
- **B** sain
- **C** A=3 (matiere brute pas regle directe) · R=5 (auto-controle par contestation systematique) · E=4 (voix incarnees)
- **D** jaune
- **E** Type 1 (integrite : V/F traces) integre en 7 (exploration des perspectives)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune des 3 — c'est meme l'antidote (la voix qui conteste = anti-certitude, anti-amnesie).
- **H** Reference les 7 voix, atelier_decisions implicitement, Niveau 0 §3 (etats). Termes : DB&M exclusif.
- **I** n0_conforme
- **J** Aucune.

### `00000_DEBLOQUEZ_MOI.md`
- **A** Version "0.2.0" annoncee dans `FONDATIONS_DBM_STRUCTURE_CIBLE` (header pas explicite) / 2026-04-28 / Premier geste IA — 3 maladies, logo, spirale, ennea proc, DISC, MERE, JAMAIS/TOUJOURS.
- **B** sain
- **C** A=5 (gestes concrets de demarrage) · R=4 (la spirale s'enseigne en se lisant) · E=5 (forme narrative, persona Sabine/Julie incarne)
- **D** vert (le "nous" Manu+Claude)
- **E** Type 5 (savoir) avec aile Type 6 (confiance)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite logo, spirale, ennea proc. Termes : DB&M dominant. 2 occurrences "BDB" residuelles.
- **I** n0_conforme
- **J** Forme version explicite dans header. Verifier que les 2 "BDB" restants ne sont pas des regressions.

### `00000_IDENTITE_BDB_V0_1_0.md`
- **A** Filename V0.1.0 mais header indique V0.3.0, 2026-04-28. Identite DB&M en construction — 5 Pourquoi, mission, vision, valeurs, profil DISC/spirale/centres.
- **B** contamine (incoherence filename vs header — signal d'amnesie de versionning).
- **C** A=2 (essentiellement [A TRANCHER]) · R=5 (audit archives, 4 pepites tracees, 12 sources) · E=3 (clinique)
- **D** orange (audit, structuration)
- **E** Type 4 (identite) — par construction.
- **F** 1✅ 2✅ 3✅ 4❌ (en realite V0.3.0 ; le filename V0.1.0 est une regression silencieuse) 5✅ 6✅
- **G** Amnesie partielle (filename incompatible avec header)
- **H** Cite tous les fondateurs A1-A5, archives D:\, F:\. "BDB" 101× / "DB&M" 4× — fortement contamine BDB malgre le DELTA cible DBM.
- **I** ameliorable (version trancher + renommer en `00000_IDENTITE_DBM_V0_3_0.md`)
- **J** Renommer fichier. Trancher les 11 actions [A TRANCHER]. Bascule "BDB" → "DB&M" dans le corps. Aligner header/filename.

---

## 2 — FONDATEURS HISTORIQUES BDB (avr 2026)

### `0000_BIBLE_DE_BLOC_CANON_V1_0_4.md`
- **A** V1.0.4 / 2026-04-12 / Fondation ontologique : promesse, 7 STB, principes TOUJOURS/AUJOURD'HUI, 8 ANTI, hierarchie sources §10.
- **B** contamine — §10 cite `atelier_fondation` (table inexistante depuis migration 147-150).
- **C** A=5 (regles operationnelles) · R=4 — moins le §10 casse · E=4 (Sabine/Julie)
- **D** bleu (procedures, conformite) avec touche jaune dans le ton
- **E** Type 1 (integrite) — par construction.
- **F** 1✅ 2✅ 3❌ (atelier_fondation = regression silencieuse §10) 4❌ (hallucination silencieuse §10) 5✅ 6✅
- **G** Certitude (cite une table inexistante avec assurance) + amnesie partielle (oubli de la migration 147-150)
- **H** Cite Annexe, atelier_decisions, atelier_principes, atelier_fondation (✗). "BDB" 37× / "DB&M" 0×.
- **I** ameliorable
- **J** Corriger §10 : retirer `atelier_fondation`, soit pointer vers `atelier_principes` (categories `stb`,`axe`,`user_story`), soit acter comme angle mort type 0 nomme. Ajouter dette §10 dans header. Optionnel : bascule "BDB" → "DB&M" si le Canon redevient "Canon DB&M".

### `0000_BIBLE_DE_BLOC_CANON_ANNEXE_V1_0_0.md`
- **A** V1.0.0 / 2026-04-12 / Annexe Canon : ELI15, Boudreault/CRAIE, Knowles, Kaufman, Deming, Eisenhower, DISC Marston, SECI Nonaka, Wenger.
- **B** sain (sources documentees, Gemini+Perplexity)
- **C** A=2 (pedagogique, pas operationnel direct) · R=5 (sources academiques tracees) · E=4 (exemples salle)
- **D** jaune (integration de multiples ecoles)
- **E** Type 5 (savoir transmissible)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite uniquement Canon. "BDB" 14× — coherent avec son public Brigitte/Carole.
- **I** n0_conforme — mais incomplet selon NIVEAU 0 (pas de MERE, pas d'enneagramme processus, pas de spirale).
- **J** Etendre avec MERE + ennea proc + spirale + AT + meta-programmes (action listee dans STRUCTURE_CIBLE etage 2).

### `0000_CTX_DOCTRINE_TERRAIN_V1_2_0.md`
- **A** V1.2.0 / 2026-04-07 / Realite bloc : 4 types programmes, chaine 12+ intervenants, combo gagnant 12 maillons, propriete contenu §9.
- **B** sain
- **C** A=4 (regles cliniques) · R=5 (terrain 20 ans Manu) · E=5 (texte qui sent le bloc)
- **D** jaune (integre humain/technique/clinique/organisationnel)
- **E** Type 5 (savoir tacite explicite)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite Manifeste §7.7. "BDB" 18× / "DB&M" 0×. Combo 12 maillons — Manifeste §7.7 dit 6 maillons → contradiction documentee dans CLAUDE.md mais non resolue ici.
- **I** ameliorable
- **J** Reconcilier 6/12 maillons avec Manifeste — soit bump Manifeste V1.3.0, soit doc explicite "Manifeste §7.7 = vue compacte, Doctrine §4 = vue detaillee".

### `000_MANIFESTE_BDB_V1_2_0.md`
- **A** V1.2.0 / 2026-04-03 / Manifeste produit : 1 phrase mission, 11 personas (§5), 3 couches (§6), principes produit (§7), §10 hierarchie sources.
- **B** contamine — §10 cite `JOURNAL_DECISIONS` (fichier supprime) et `CTX_SYSTEM_ARCHITECTURE` (renomme dans `12_SYSTEM_ARCHITECTURE V2.5.0` + fusionne).
- **C** A=5 · R=3 (§10 casse, contradiction Canon §10) · E=4
- **D** bleu (doctrine, "prime sur tout")
- **E** Type 1 (integrite) avec aile Type 8 (puissance — "prime sur tout")
- **F** 1✅ 2✅ 3❌ 4❌ 5✅ 6✅
- **G** Amnesie (oublie la migration JOURNAL_DECISIONS et CTX_SYSTEM_ARCHITECTURE)
- **H** Cite JOURNAL_DECISIONS (✗), CTX_SYSTEM_ARCHITECTURE (✗), CTX_DOCTRINE_TERRAIN. "BDB" 29× / "DB&M" 0×. Doc 1/2/3 dette active jamais resorbee (cf S109).
- **I** ameliorable (bump V1.3.0)
- **J** §10 : pointer vers `atelier_decisions` (DB) au lieu de `JOURNAL_DECISIONS`, vers `10_ARCHITECTURE_REGLES_TECHNIQUES V3.0.0` au lieu de `CTX_SYSTEM_ARCHITECTURE`. Resoudre contradiction §10 avec Canon §10 (une seule hierarchie). Reconcilier §7.7 (6 maillons) avec Doctrine §4 (12 maillons).

### `00_PHILOSOPHIE_PARTICIPATIVE_BDB_V1_0_0.md`
- **A** V1.0.0 / 2026-04-05 / Holacracy H1-H5, DISC C1-C5, SCRUM S1-S5, P1-P7 transverses, checklist 8 STOP.
- **B** sain
- **C** A=5 (regles immuables : 1 vote/item, pas de classement, pas de scoring) · R=5 · E=5 (parle a la novice, a l'experte, au chirurgien)
- **D** vert (participatif, hors hierarchie)
- **E** Type 9 (harmonie) avec aile Type 2 (service)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Reference Manifeste V1.2.0. "BDB" 21× / "DB&M" 0×. Listed dans STRUCTURE_CIBLE comme "a renommer en 0000_".
- **I** ameliorable (renommer en `0000_PHILOSOPHIE_PARTICIPATIVE_DBM_V1_0_0.md` selon STRUCTURE_CIBLE etage 6)
- **J** Renommer prefixe + bascule BDB → DB&M dans corps si V1.1.0.

### `00_BDB_SURFACE_MAP_V1_2_0.md`
- **A** V1.2.0 / 2026-04-25 / Carte des surfaces HTML (mini-site, modules, pages systeme), legende statuts, gaps audit.
- **B** sain (operationnel, audit recent)
- **C** A=5 (gaps numerotes G1-G9 actionnables) · R=4 · E=2 (technique pur)
- **D** orange (mesure, compteurs)
- **E** Type 3 (resultat)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite 11 pages site, 27 modules, atelier/, conseil/. "BDB" 5× — modere. Filename "BDB" deplace selon STRUCTURE_CIBLE.
- **I** ameliorable
- **J** Renommer en `00_DBM_SURFACE_MAP_V1_2_0.md` ou en `00_SURFACE_MAP_DBM_V1_2_0.md`. MAJ apres migration arborescence S108.

### `00_SOCLE_TERRAIN_PRICING_V1_1_0.md`
- **A** V1.1.0 / 2026-04-25 / 6 postes CNP, fourchette 900k-2,8M€/an, ROI ≥4,5×, sources Relyens/ONIAM/Academie/SF2S.
- **B** sain
- **C** A=4 (chiffres argumentaires actionnables Brigitte) · R=5 (sources tres tracees) · E=3 (chiffres)
- **D** orange (metriques, optimisation)
- **E** Type 3 (resultat) avec aile Type 5
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite sources externes uniquement, "Bloc A" anonymise. "BDB" 20×.
- **I** ameliorable (bascule nom)
- **J** Bump V1.2.0 avec terminologie DB&M.

### `31_PERSONAS_BDB_V1_4_0.md`
- **A** V1.4.0 / 2026-04-03 / Personas-etats vecus pour redacteur mini-site (NE PAS confondre avec personas Manifeste §5).
- **B** sain (avec avertissement explicite)
- **C** A=4 · R=5 · E=5 (incarne les voix)
- **D** vert (focalise audience)
- **E** Type 4 (identite) — distingue les voix.
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Reference Manifeste V1.1.0 (au lieu de V1.2.0 — leger desync). "BDB" 40×.
- **I** ameliorable
- **J** Bump MANIFESTE_REF V1.1.0 → V1.2.0. Renommer `31_PERSONAS_DBM_V1_5_0.md` ulterieurement.

---

## 3 — ARCHITECTURE & TECHNIQUE

### `01_ACCES_NIVEAUX_V1_2_0.md`
- **A** V1.2.0 / 2026-04-25 / Hierarchie isCreator > isAdmin > isMember > isDemo, contrats `window.bdbUser` et `window.bdbApp`.
- **B** sain
- **C** A=5 (specs operationnelles) · R=4 · E=2
- **D** bleu (procedures techniques)
- **E** Type 6 (confiance, fiabilite verifiable)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite `app_instance`, `bdb-shell.js`, `bdb-preview.js`. window.bdbApp = "Des Blocs & Moi" → DB&M present. "BDB" 1× (filename) / "DB&M" 1×.
- **I** n0_conforme
- **J** Aucune (V1.2.0 deja a jour).

### `02_BACK_OFFICE_REF_V1_1_0.md`
- **A** V1.1.0 / 2026-04-17 / 3 surfaces back-office (admin/conseil/atelier), kit harmonise, 6 regles, 9 briques, 5 couches.
- **B** sain
- **C** A=5 · R=4 · E=2
- **D** bleu
- **E** Type 6
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite Surface map, CTX_ADMIN, CTX_SUPERVISION. "BDB" 4×.
- **I** ameliorable
- **J** Aligner avec migration arborescence S108 si surfaces ont bouge.

### `02_SUPABASE_DATA_MODEL_V1_24_0.md`
- **A** V1.24.0 / 2026-04-25 / Schema DB cloud, 131 tables, regle d'or info_schema prime sur tout.
- **B** sain
- **C** A=5 · R=5 · E=2
- **D** bleu
- **E** Type 6 (confiance — la base est fiable)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Pointe info_schema en source de verite. "BDB" 2×.
- **I** n0_conforme
- **J** Aucune.

### `03_CATALOGUE_BS_SMARTY_V1_0_0.md`
- **A** V1.0.0 / 2026-04-17 / Catalogue Bootstrap 5.3.3 + Smarty V5, marquage [KIT]/[DISPONIBLE]/[INTERDIT BDB]/[SHELL].
- **B** sain
- **C** A=4 · R=4 · E=1 (encyclopedique)
- **D** bleu
- **E** Type 5 (savoir reference)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune (boulimie quasi — 22k+ caracteres — mais structure)
- **H** "BDB" 34×. Cite Smarty essentials.css.
- **I** n0_conforme
- **J** MAJ si CDS/BS evolue.

### `04_PEDAGOGIE_BDB_V1_0_0.md`
- **A** V1.0.0 / 2026-04-18 / 11 axes pedagogiques (Boudreault, Knowles, Kolb, Benner, Wenger, etc.) + integrateur POULET.
- **B** sain
- **C** A=4 · R=5 (11 sources academiques) · E=5
- **D** jaune (integration multi-cadres)
- **E** Type 5 (savoir multi-couches)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite atelier_principes (KNOWLES, DEMING, DISC, SECI, WENGER, EISENHOWER, BOUDREAULT, ELI15, FAB3R, CNA, CNP). "BDB" 38×.
- **I** n0_conforme
- **J** Bump nom projet a la prochaine revision.

### `10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0.md`
- **A** V3.0.0 / 2026-04-25 / FUSION CTX_SYSTEM_ARCHITECTURE V2.5.0 + CHANTIER_TECHNIQUE V1.1.0. Stack vanilla, hierarchie sources, INTERDITs.
- **B** sain (le doc qui devrait remplacer 10/12 historiques)
- **C** A=5 · R=4 · E=2
- **D** bleu/orange
- **E** Type 6 + Type 1
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Pointe info_schema, atelier_principes, atelier_decisions. Mentionne app_instance "Des Blocs & Moi". "BDB" 8× / "DB&M" 2×.
- **I** n0_conforme
- **J** Officialiser comme remplaçant de `10_CHANTIER_TECHNIQUE` et `12_SYSTEM_ARCHITECTURE` — supprimer les anciens (ou deplacer en `_deltas/`).

### `10_CHANTIER_TECHNIQUE_V1_1_0.md`
- **A** V1.1.0 / 2026-04-17 / Decisions architecture pre-fusion, 11 deltas listes.
- **B** **perime** (officiellement remplace par `10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0`).
- **C** A=4 · R=4 · E=2
- **D** bleu
- **E** Type 6
- **F** 1❌ (changement de cap silencieux : remplace mais pas archive) 2❌ (destruction silencieuse en cours) 3✅ 4✅ 5✅ 6✅
- **G** Amnesie (le doc ne sait pas qu'il est remplace)
- **H** "BDB" 22×. Cite `MANIFESTE_REF`.
- **I** remplacable / a_supprimer
- **J** Deplacer dans `_deltas/`.

### `12_SYSTEM_ARCHITECTURE_V2_5_0.md`
- **A** V2.5.0 / 2026-04-17 / Contrat architecture systeme, 5 couches actives, hierarchie documentaire.
- **B** **perime** (officiellement remplace par `10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0`).
- **C** A=4 · R=3 (cite NOYAU_VERITE supprime + JOURNAL_REF V1_34_0 inexistant + MODULE_DEPENDENCY_MAP_V1_7_0.md probablement absent) · E=2
- **D** bleu
- **E** Type 6
- **F** 1❌ 2❌ 3❌ 4❌ 5✅ 6✅
- **G** Amnesie + certitude
- **H** Cite NOYAU_VERITE supprime, MODULE_DEPENDENCY_MAP V1_7_0, JOURNAL_REF V1_34_0. "BDB" 25×.
- **I** remplacable / a_supprimer
- **J** Deplacer dans `_deltas/`. Referencer comme remplace par 10_ARCH V3.0.0.

### `13_AUDIT_SECURITE_V1_0_0.md`
- **A** V1.0.0 / 2026-03-20 / Modele de menace, OWASP applicable, RLS, chemins .htaccess.
- **B** sain
- **C** A=5 · R=5 · E=3
- **D** bleu
- **E** Type 8 (protection)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite Supabase, OWASP. "BDB" 8×.
- **I** n0_conforme
- **J** Aucune.

### `21_TEMPLATE_CTX_MODULE_V2_0_0.md`
- **A** V2.0.0 / 2026-04-25 / Template vierge module avec BLOC 1-7 + checklist qualite.
- **B** sain
- **C** A=5 · R=4 · E=2
- **D** bleu
- **E** Type 1 (integrite — gabarit normatif)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite 10_ARCHITECTURE et 02_SUPABASE_DATA_MODEL. "BDB" 1×. DELTA mentionne suppression refs mortes (NOYAU_VERITE, CDS_REFERENCE, DATA_MODEL_V12).
- **I** n0_conforme
- **J** Aucune.

### `83_CHECKLIST_DEPLOIEMENT_OVH.md`
- **A** V1.0.0 / 2026-03-21 / Checklist FTP avant/apres deploiement OVH. 
- **B** sain
- **C** A=5 · R=4 · E=3 (mentionne fatigue Manu)
- **D** bleu
- **E** Type 6 (fiabilite)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Reference R6-HUM-01 dans AUDIT_SECURITE. "BDB" 2×.
- **I** n0_conforme
- **J** Aucune.

### `ADMIN_BACK_OFFICE_PATTERN_V1_0_0.md`
- **A** V1.0.0 / 2026-04-16 / Pattern back-office unique (Smarty V5, P-CDS-01..05).
- **B** sain
- **C** A=5 · R=4 · E=2
- **D** bleu
- **E** Type 1 (integrite pattern)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** "BDB" 2×.
- **I** n0_conforme
- **J** Aucune.

### `CATALOGUE_OPEN_SOURCE_BDB_V1_1_0.md`
- **A** V1.1.0 / 2026-04-06 / Catalogue dependances open-source, regles licences (MIT/Apache OK, GPL interdit).
- **B** contamine leger — header dit "Bootstrap 5.3.2" alors que stack actuelle est 5.3.3 (cf 10_ARCHITECTURE_REGLES_TECHNIQUES V3.0.0).
- **C** A=4 · R=4 · E=2
- **D** bleu
- **E** Type 6
- **F** 1✅ 2✅ 3⚠ (BS 5.3.2 vs 5.3.3 = regression silencieuse minime) 4✅ 5✅ 6✅
- **G** Amnesie partielle
- **H** Cite Perplexity comme source ("Ecart hallucinations Perplexity — OpenOR, APHP OpScheduler, Parly2") — bonne pratique anti-certitude. "BDB" 9×.
- **I** ameliorable
- **J** Bump BS 5.3.2 → 5.3.3. Bump nom DB&M.

### `CHECKLIST_CALCULATEUR_V5.md`
- **A** Pas de version explicite (V5 dans nom) / 2026-04-26 / Checklist anti-regression calculateur ROI, valeurs validees Gemini+Deepseek.
- **B** sain
- **C** A=5 · R=5 (cross-validation 2 IA) · E=3
- **D** bleu
- **E** Type 6
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite Gemini, Deepseek. "BDB" 3×.
- **I** n0_conforme
- **J** Aucune.

### `DATA_METIER_PACKS_V1_0_0.md`
- **A** V1.0.0 / 2026-04-12 / Referentiel packs consommables (Airtable migre).
- **B** sain (donnees validees Manu)
- **C** A=3 (en attente import) · R=3 · E=1
- **D** beige (donnees brutes)
- **E** Type 5 (savoir source)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** "BDB" 2×.
- **I** n0_conforme
- **J** Importer en DB une fois schema ferme.

### `DATA_METIER_SUTURES_V1_0_0.md`
- Idem PACKS — V1.0.0 / 2026-04-12 / Referentiel sutures (Airtable). sain · A=3 R=3 E=1 · beige · Type 5 · 6 interdits ✅ · n0_conforme · "BDB" 2×.

### `GUIDE_MIGRATION_V5.md`
- **A** V2.0.0 (header) / 2026-04-25 / Guide migration V5 unifie.
- **B** sain
- **C** A=5 · R=4 · E=2
- **D** bleu
- **E** Type 1
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite STENCIL_BACKOFFICE_V5_MINIMAL.html, audit-v5-compliance.ps1, PROMPT_CC_MIGRATION_V5.md. "BDB" 5×.
- **I** n0_conforme
- **J** Aucune.

### `NIVEAU_0_DBM_V0_4_0.md`
- **A** V0.4.0 / 2026-04-30 / Iteration 3 du Niveau 0, **remplace par V0.5.0** dans `000000_NIVEAU_0_DBM_V0_5_0.md`.
- **B** **perime** (filename ne demarre pas par `000000_`, ne remonte pas en tete de tri Windows — mais V0.5.0 existe).
- **C** A=4 · R=4 · E=4
- **D** jaune
- **E** Type 5
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** "DB&M" 1× / "BDB" 0×.
- **I** remplacable / a_supprimer
- **J** Deplacer dans `_deltas/` ou supprimer.

---

## 4 — CTX MODULES (40 a 70)

Note generale : tous ces CTX hebergent une regle absolue "lit ce fichier APRES NOYAU_VERITE et JOURNAL_DECISIONS" — references mortes (NOYAU_VERITE supprime D-2026-04-03-T01, JOURNAL_DECISIONS jamais migre). Contamination systemique d'un meme pattern textuel hérité du TEMPLATE_CTX_MODULE V1.2.0 (perime). TEMPLATE V2.0.0 a corrige le pattern mais aucun CTX module n'a ete repasse au nouveau template.

### Format synthese pour les CTX modules

Chaque CTX module suit le meme pattern. Audit synthetique :

| Fichier | Version | Date | Etat | A/R/E | Spirale | Ennea | Verdict | Note specifique |
|---|---|---|---|---|---|---|---|---|
| 40_CTX_ADMIN | V2.2.0 | 2026-03-30 | sain | 5/4/2 | bleu | 6 | n0_conforme | DELTA detaille, regles claires |
| 41_CTX_ANATOMIE | V1.2.1 | 2026-03-21 | contamine | 3/3/2 | bleu | 6 | ameliorable | NOYAU_VERITE refs mortes |
| 42_CTX_ANNUAIRE | V1.2.1 | 2026-03-21 | contamine | 3/3/2 | bleu | 6 | ameliorable | idem |
| 43_CTX_ARSENAL | V2.2.2 | 2026-03-21 | contamine | 4/3/2 | bleu | 6 | ameliorable | + cite SOURCES historiques (BIBLE_DE_BLOC_MASTER_V5, 01_SCHEMA_DONNEES_CLAUDE) — refs mortes |
| 44_CTX_CARNET_BORD | V2.0.1 | 2026-03-21 | contamine | 4/3/2 | bleu | 6 | ameliorable | DATA_REF "ancienne convention V12 a renommer" — dette explicite non resolue |
| 45_CTX_BOITE_A_IDEES | V1.4.0 | 2026-03-21 | contamine | 4/3/2 | bleu | 7 | ameliorable | Titre "MODULE COLLAB" ≠ filename "BOITE_A_IDEES" — incoherence nom |
| 46_CTX_COURS | V2.1.0 | 2026-03-22 | contamine | 5/3/3 | bleu | 5 | ameliorable | Module pedagogique. NOYAU_VERITE refs mortes |
| 47_CTX_DEMO | V1.1.0 | 2026-04-08 | sain | 5/4/3 | bleu | 3 | n0_conforme | DELTA explicite V1_0_0 → V1_1_0 |
| 48_CTX_DISC | V3.1.0 | 2026-04-02 | contamine | 5/4/3 | bleu | 4 | ameliorable | "Module DISC" mais filename ok. Refs JOURNAL_DECISIONS |
| 49_CTX_VEILLE_DOCUMENTAIRE | V2.3.0 | 2026-03-21 | contamine | 4/3/2 | bleu | 7 | ameliorable | Titre "MODULE DORK" ≠ filename — incoherence |
| 50_CTX_FICHES | V3.1.1 | 2026-03-21 | contamine | 5/3/2 | bleu | 6 | ameliorable | NOYAU_VERITE/JOURNAL_DECISIONS |
| 51_CTX_GED | V1.0.2 | 2026-03-21 | contamine | 2/3/2 | bleu | 0 | ameliorable | Module a creer (zero fichier source) — type 0 explicite |
| 52_CTX_GLOSSAIRE | V2.0.0 | 2026-03-31 | sain | 5/4/3 | bleu | 5 | n0_conforme | Refonte V1→V2 explicite, pas de NOYAU_VERITE |
| 54_CTX_INSTALLATION | V2.1.0 | 2026-03-21 | contamine | 5/4/2 | bleu | 6 | ameliorable | Cite INTERDIT-B1/B2/B3/E1/C2/C6 — bonne pratique |
| 57_CTX_NOTES_INTER | V1.0.0 | 2026-03-30 | sain | 4/3/2 | bleu | 2 | n0_conforme | Cite #17 CTX_PI dependance |
| 58_CTX_OBJECTIFS_IDE | V1.2.0 | 2026-03-19 | contamine | 4/3/3 | bleu | 5 | ameliorable | A1/A2/A3 SOLDÉS — bon tracking |
| 59_CTX_ORGANISATEUR | V2.0.0 | 2026-03-21 | contamine | 5/4/2 | bleu | 6 | ameliorable | Reecriture V1→V2 standard TEMPLATE V1.2.0 |
| 60_CTX_INTERVIEW | V4.0.0 | 2026-04-02 | contamine | 5/4/2 | bleu | 6 | ameliorable | Titre "PAXIS" ≠ filename "INTERVIEW" — incoherence (Paxis = ancien nom) |
| 61_CTX_PEDAGOGIE | V1.2.2 | 2026-03-21 | contamine | 3/3/3 | bleu | 5 | ameliorable | Module embryonnaire |
| 62_CTX_PI | V1.0.0 | 2026-03-30 | sain | 4/3/2 | bleu | 7 | n0_conforme | Court, direct |
| 63_CTX_PLANNING | V1.5.0 | 2026-03-21 | contamine | 5/4/2 | rouge→bleu | 6 | ameliorable | "VIOLATION ACTIVE" / "DETTE TOTALE" — diagnostic franc |
| 64_CTX_PREFERENCES | V1.5.0 | 2026-04-12 | contamine | 5/4/2 | bleu | 6 | ameliorable | Header explicite `NOYAU_REF: NOYAU_VERITE_V2_4_0` — ref morte |
| 65_CTX_PROFILE | V1.0.0 | 2026-03-21 | contamine | 3/2/2 | bleu | 4 | ameliorable | Tres minimal, NOYAU_VERITE/JOURNAL_DECISIONS |
| 66_CTX_RECUEIL_SITUATION | V1.1.0 | 2026-03-21 | contamine | 3/3/2 | bleu | 6 | ameliorable | Q1→Q3 ouvertes bloquantes — dette tracee |
| 67_CTX_SITE | V1.0.0 | 2026-03-20 | contamine | 4/4/4 | bleu/vert | 4 | ameliorable | "renomme depuis CTX_MINI_SITE" — bon historique |
| 68_CTX_SUPERVISION | V1.3.0 | 2026-03-30 | contamine | 4/4/2 | bleu | 6 | ameliorable | Arbitrage D-2026-03-30-T11 explicite |
| 69_CTX_THESAURUS | V2.1.0 | 2026-03-23 | contamine | 5/4/3 | bleu | 6 | ameliorable | UX premium documente |
| 70_CTX_TRANSMISSIONS | V1.5.0 | 2026-03-22 | contamine | 5/4/2 | bleu | 6 | ameliorable | Bug B2 RESOLU — bonne pratique |

**6 INTERDITS pour TOUS les CTX modules contamines :**
1✅ 2✅ 3❌ (regression silencieuse : refs mortes NOYAU_VERITE/JOURNAL_DECISIONS) 4❌ (hallucination silencieuse : citent des fichiers inexistants comme s'ils existaient) 5✅ 6✅

**3 maladies pour TOUS les CTX modules contamines :** Amnesie principale (oubli de la decision D-2026-04-03-T01 NOYAU_VERITE → MANIFESTE_REF) + Certitude residuelle.

**Action transverse :** passer tous les CTX modules au TEMPLATE_CTX_MODULE V2.0.0 (qui a deja resorbe les refs mortes). C'est l'action P1 #1 de l'audit.

---

## 5 — AUDITS SESSIONS S108 / S109

### `S108_AUDIT_MICRO_APP.md`
- **A** Pas de header version / 2026-04-26 / Audit 12 HTML+1 JS du dossier `app/` (profondeur 1).
- **B** sain
- **C** A=4 (gaps numerotes) · R=5 (Test-Path automatise) · E=2
- **D** orange
- **E** Type 1
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** "BDB" 14× / "DB&M" 1×
- **I** n0_conforme
- **J** Conserver comme reference S108.

### `S108_AUDIT_MICRO_CREATEUR.md`
- 70 fichiers HTML createur/. Regression critique 13 pages profondeur 3 detectee. sain · A=4 R=5 E=2 · orange · Type 1 · 6 interdits ✅ · n0_conforme · BDB 6×.

### `S108_AUDIT_MICRO_MODULES.md`
- 54 HTML modules/. V2 corrige 24 faux positifs anonymisation. sain · A=4 R=5 E=2 · orange · Type 1 · 6 interdits ✅ · n0_conforme · BDB 9×.
- Note : doc V2 — la V1 ecrasee en place (delta visible dans contenu).

### `S108_AUDIT_MICRO_RACINE.md`
- 14 HTML racine. sain · A=4 R=5 E=2 · orange · Type 1 · 6 interdits ✅ · n0_conforme · BDB 16× / DB&M 1×.

### `S108_AUDIT_MICRO_SITE.md`
- 13 HTML mini-site public. sain · A=4 R=5 E=2 · orange · Type 1 · 6 interdits ✅ · n0_conforme · BDB 20×. Note "Auth: aucune" vs "Auth: none" = violation systemique tracee.

### `S108_GPS_AUDIT_FICHIERS.md`
- **A** Pas de version / 2026-04-26 / 177 promesses extraites de 11 pages site, READ-ONLY.
- **B** sain
- **C** A=3 (inventaire) · R=5 · E=2
- **D** orange
- **E** Type 5 (savoir reference)
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** "BDB" 32×.
- **I** n0_conforme
- **J** Aucune.

### `S108_MIGRATION_ARBORESCENCE.md`
- Specification de migration. sain · A=5 R=4 E=2 · orange · Type 1 · 6 interdits ✅ · n0_conforme · BDB 1×.

### `S109_AUDIT_ECART_CANON.md`
- **A** V1.0.0 / 2026-04-27 / Audit ecart fondateurs A1-A5 vs CLAUDE.md, code, base, mini-site.
- **B** sain
- **C** A=4 · R=5 (lecture integrale tres tracee) · E=3
- **D** jaune (integration multi-niveaux)
- **E** Type 1 (integrite) integre en 7
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite TOUT — Manifeste, Canon, Annexe, Doctrine, Philosophie, Pricing, atelier_*. "BDB" 12× / "DB&M" 0×.
- **I** n0_conforme — c'est l'audit qui a meme detecte le probleme atelier_fondation.
- **J** Aucune (doc d'audit fige).

### `S109_CDC_BDB.md`
- **A** V1.0.0 / 2026-04-27 / Cahier des charges synthese, 26 modules, 8 prompts Perplexity, 18 dettes.
- **B** sain
- **C** A=5 · R=5 · E=3
- **D** orange/jaune
- **E** Type 3 (resultat) avec aile Type 1
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite tous les fondateurs A1-A5 + GPS + Pricing + 5 audits S108 + DB. "BDB" 15× / "DB&M" 0×.
- **I** n0_conforme
- **J** Bump V1.1.0 vers DB&M ulterieurement.

---

## 6 — SKILLS (Print/)

Note : ces 7 fichiers sont des **skills Claude.ai** au format frontmatter `name`/`description`, pas des docs de gouvernance pure. Le Niveau 0 §11 traite explicitement ce statut hybride : "un skill peut etre sain, contamine, perime, orphelin, dangereux. Les 6 interdits s'appliquent."

### `Print/DB&M_pedagogie-SKILL.md`
- V1.1.0 (dans titre) / pas de date / Skill garde-fou pedagogique 10 axes + POULET. 
- Etat : sain (alignement 04_PEDAGOGIE V1.0.0). A=5 R=5 E=4. vert. Type 5 (savoir).
- 6 interdits ✅. Aucune maladie.
- "BDB" 24× / "DB&M" 1× — declenche sur termes BDB.
- Verdict : ameliorable (renommer slug `pedagogie-bdb` → `pedagogie-dbm` si bascule de nom).

### `Print/DBM_bootstrap5-patterns-SKILL-V2.1.0.md`
- V2.1.0 / Patterns BS 5.3.3 valides BDB. sain. A=5 R=5 E=2. bleu. Type 6.
- 6 interdits ✅. Aucune.
- "BDB" 18× / "DBM" 1×.
- n0_conforme.

### `Print/DBM_cds-compliance-SKILL-V2.1.0.md`
- V2.1.0 / Audit CDS code HTML/CSS/JS. sain. A=5 R=5 E=2. bleu. Type 1.
- 6 interdits ✅. Aucune.
- "BDB" 6× / "DBM" 1×.
- n0_conforme.

### `Print/DBM_error-diagnosis-SKILL-V1.1.0.md`
- V1.1.0 / Diagnostic erreurs Supabase/JS/CSS/RLS/CORS. sain. A=5 R=5 E=2. bleu. Type 6.
- 6 interdits ✅.
- "BDB" 4× / "DBM" 1×.
- n0_conforme.

### `Print/DBM_module-generator-SKILL-V2.1.0.md`
- V2.1.0 / Generateur fichiers module conformes CDS. sain. A=5 R=4 E=2. bleu. Type 3.
- 6 interdits ✅.
- "BDB" 9× / "DBM" 2×.
- n0_conforme.

### `Print/DBM_recettage-SKILL-V2.1.0.md`
- V2.1.0 / Recettage post-production. sain. A=5 R=5 E=2. bleu. Type 6.
- 6 interdits ✅.
- "BDB" 2× / "DBM" 1×.
- n0_conforme.

### `Print/DBM_veille-tech-SKILL-V1.1.0.md`
- V1.1.0 / Veille tech UX. sain. A=4 R=4 E=2. orange. Type 7 (exploration).
- 6 interdits ✅.
- "BDB" 14× / "DBM" 1×.
- n0_conforme — risque type 7 (explorer beaucoup, approfondir peu) attenue par usage cible.

---

## 7 — DELTAS (`_deltas/`)

Tous ces fichiers sont par convention **des versions anciennes archivees**. Leur etat par defaut = `perime`. Action attendue : conservation pour traçabilite, jamais reactivation.

| Fichier | Version | Etat | Verdict | Note |
|---|---|---|---|---|
| _deltas/01_ACCES_NIVEAUX_V1_1_0.md | V1.1.0 | perime | a_supprimer ou conserver tel quel | remplace par V1.2.0 |
| _deltas/02_BACK_OFFICE_REF_V1_0_0.md | V1.0.0 | perime | conservation passive | remplace par V1.1.0 |
| _deltas/02_SUPABASE_DATA_MODEL_V1_22_0.md | V1.22.0 | perime | conservation passive | remplace par V1.24.0 |
| _deltas/21_TEMPLATE_CTX_MODULE_V1_2_0.md | V1.2.0 | dangereux | a_supprimer | C'est ce template qui a sème "NOYAU_VERITE/JOURNAL_DECISIONS" dans tous les CTX modules. S'il reste accessible, il peut etre re-applique. Le rendre inerte. |
| _deltas/BDB_SURFACE_MAP_V1_0_0.md | V1.0.0 | perime | conservation passive | remplace par V1.2.0 |
| _deltas/BDB_SURFACE_MAP_V1_1_0.md | V1.1.0 | perime | conservation passive | remplace par V1.2.0 |

---

## 8 — DIVERS

### `bernard-persona-complet.md`
- **A** V1.0.0 / Skill bernard-bdb / Session #100 / Persona Bernard arbitre L3 Creator, ennea 9w8 integre en 3.
- **B** sain — coherent avec Niveau 0 §9 (Bernard).
- **C** A=3 (description persona) · R=4 · E=5 (Bernard incarne)
- **D** vert
- **E** Type 9 (harmonie) integre en 3 (resultat) — par construction du persona.
- **F** 1✅ 2✅ 3✅ 4✅ 5✅ 6✅
- **G** Aucune
- **H** Cite Niveau 0 §9 implicite. "BDB" 5×.
- **I** n0_conforme
- **J** Renommer `bernard-persona-DBM-complet.md` ulterieurement.

---

# SYNTHESE GLOBALE

## 1. Tableau recapitulatif (81 docs)

| Doc | Version | Etat | A/R/E | Spirale | Verdict |
|---|---|---|---|---|---|
| 0000000_PITCH_FONDATEUR_DBM | V1.0.0 | sain | 4/4/5 | vert | n0_conforme |
| 000000_FONDATIONS_DBM_STRUCTURE_CIBLE | n.d. | sain | 5/4/3 | orange | ameliorable |
| 000000_LES_7_VOIX_AUDIT_DBM | V1.0.0 | sain | 4/5/4 | jaune | n0_conforme |
| 000000_NIVEAU_0_DBM | V0.5.0 | sain | 4/5/5 | jaune | n0_conforme |
| 000000_REFERENTIEL_AFFIRMATIONS_DBM | V2.0.0 | sain | 3/5/4 | jaune | n0_conforme |
| 00000_DEBLOQUEZ_MOI | V0.2.0 | sain | 5/4/5 | vert | n0_conforme |
| 00000_IDENTITE_BDB | V0.3.0 (file V0.1.0) | contamine | 2/5/3 | orange | ameliorable |
| 0000_BIBLE_DE_BLOC_CANON_ANNEXE | V1.0.0 | sain | 2/5/4 | jaune | n0_conforme |
| 0000_BIBLE_DE_BLOC_CANON | V1.0.4 | contamine | 5/4/4 | bleu | ameliorable |
| 0000_CTX_DOCTRINE_TERRAIN | V1.2.0 | sain | 4/5/5 | jaune | ameliorable |
| 000_MANIFESTE_BDB | V1.2.0 | contamine | 5/3/4 | bleu | ameliorable |
| 00_BDB_SURFACE_MAP | V1.2.0 | sain | 5/4/2 | orange | ameliorable |
| 00_PHILOSOPHIE_PARTICIPATIVE_BDB | V1.0.0 | sain | 5/5/5 | vert | ameliorable |
| 00_SOCLE_TERRAIN_PRICING | V1.1.0 | sain | 4/5/3 | orange | ameliorable |
| 01_ACCES_NIVEAUX | V1.2.0 | sain | 5/4/2 | bleu | n0_conforme |
| 02_BACK_OFFICE_REF | V1.1.0 | sain | 5/4/2 | bleu | ameliorable |
| 02_SUPABASE_DATA_MODEL | V1.24.0 | sain | 5/5/2 | bleu | n0_conforme |
| 03_CATALOGUE_BS_SMARTY | V1.0.0 | sain | 4/4/1 | bleu | n0_conforme |
| 04_PEDAGOGIE_BDB | V1.0.0 | sain | 4/5/5 | jaune | n0_conforme |
| 10_ARCHITECTURE_REGLES_TECHNIQUES | V3.0.0 | sain | 5/4/2 | bleu | n0_conforme |
| 10_CHANTIER_TECHNIQUE | V1.1.0 | perime | 4/4/2 | bleu | remplacable |
| 12_SYSTEM_ARCHITECTURE | V2.5.0 | perime | 4/3/2 | bleu | remplacable |
| 13_AUDIT_SECURITE | V1.0.0 | sain | 5/5/3 | bleu | n0_conforme |
| 21_TEMPLATE_CTX_MODULE | V2.0.0 | sain | 5/4/2 | bleu | n0_conforme |
| 31_PERSONAS_BDB | V1.4.0 | sain | 4/5/5 | vert | ameliorable |
| 40_CTX_ADMIN | V2.2.0 | sain | 5/4/2 | bleu | n0_conforme |
| 41_CTX_ANATOMIE | V1.2.1 | contamine | 3/3/2 | bleu | ameliorable |
| 42_CTX_ANNUAIRE | V1.2.1 | contamine | 3/3/2 | bleu | ameliorable |
| 43_CTX_ARSENAL | V2.2.2 | contamine | 4/3/2 | bleu | ameliorable |
| 44_CTX_CARNET_BORD | V2.0.1 | contamine | 4/3/2 | bleu | ameliorable |
| 45_CTX_BOITE_A_IDEES | V1.4.0 | contamine | 4/3/2 | bleu | ameliorable |
| 46_CTX_COURS | V2.1.0 | contamine | 5/3/3 | bleu | ameliorable |
| 47_CTX_DEMO | V1.1.0 | sain | 5/4/3 | bleu | n0_conforme |
| 48_CTX_DISC | V3.1.0 | contamine | 5/4/3 | bleu | ameliorable |
| 49_CTX_VEILLE_DOCUMENTAIRE | V2.3.0 | contamine | 4/3/2 | bleu | ameliorable |
| 50_CTX_FICHES | V3.1.1 | contamine | 5/3/2 | bleu | ameliorable |
| 51_CTX_GED | V1.0.2 | contamine | 2/3/2 | bleu | ameliorable |
| 52_CTX_GLOSSAIRE | V2.0.0 | sain | 5/4/3 | bleu | n0_conforme |
| 54_CTX_INSTALLATION | V2.1.0 | contamine | 5/4/2 | bleu | ameliorable |
| 57_CTX_NOTES_INTER | V1.0.0 | sain | 4/3/2 | bleu | n0_conforme |
| 58_CTX_OBJECTIFS_IDE | V1.2.0 | contamine | 4/3/3 | bleu | ameliorable |
| 59_CTX_ORGANISATEUR | V2.0.0 | contamine | 5/4/2 | bleu | ameliorable |
| 60_CTX_INTERVIEW | V4.0.0 | contamine | 5/4/2 | bleu | ameliorable |
| 61_CTX_PEDAGOGIE | V1.2.2 | contamine | 3/3/3 | bleu | ameliorable |
| 62_CTX_PI | V1.0.0 | sain | 4/3/2 | bleu | n0_conforme |
| 63_CTX_PLANNING | V1.5.0 | contamine | 5/4/2 | rouge/bleu | ameliorable |
| 64_CTX_PREFERENCES | V1.5.0 | contamine | 5/4/2 | bleu | ameliorable |
| 65_CTX_PROFILE | V1.0.0 | contamine | 3/2/2 | bleu | ameliorable |
| 66_CTX_RECUEIL_SITUATION | V1.1.0 | contamine | 3/3/2 | bleu | ameliorable |
| 67_CTX_SITE | V1.0.0 | contamine | 4/4/4 | bleu/vert | ameliorable |
| 68_CTX_SUPERVISION | V1.3.0 | contamine | 4/4/2 | bleu | ameliorable |
| 69_CTX_THESAURUS | V2.1.0 | contamine | 5/4/3 | bleu | ameliorable |
| 70_CTX_TRANSMISSIONS | V1.5.0 | contamine | 5/4/2 | bleu | ameliorable |
| 83_CHECKLIST_DEPLOIEMENT_OVH | V1.0.0 | sain | 5/4/3 | bleu | n0_conforme |
| ADMIN_BACK_OFFICE_PATTERN | V1.0.0 | sain | 5/4/2 | bleu | n0_conforme |
| CATALOGUE_OPEN_SOURCE_BDB | V1.1.0 | contamine | 4/4/2 | bleu | ameliorable |
| CHECKLIST_CALCULATEUR_V5 | V5 | sain | 5/5/3 | bleu | n0_conforme |
| DATA_METIER_PACKS | V1.0.0 | sain | 3/3/1 | beige | n0_conforme |
| DATA_METIER_SUTURES | V1.0.0 | sain | 3/3/1 | beige | n0_conforme |
| GUIDE_MIGRATION_V5 | V2.0.0 | sain | 5/4/2 | bleu | n0_conforme |
| NIVEAU_0_DBM_V0_4_0 | V0.4.0 | perime | 4/4/4 | jaune | remplacable |
| Print/DB&M_pedagogie-SKILL | V1.1.0 | sain | 5/5/4 | vert | ameliorable |
| Print/DBM_bootstrap5-patterns-SKILL | V2.1.0 | sain | 5/5/2 | bleu | n0_conforme |
| Print/DBM_cds-compliance-SKILL | V2.1.0 | sain | 5/5/2 | bleu | n0_conforme |
| Print/DBM_error-diagnosis-SKILL | V1.1.0 | sain | 5/5/2 | bleu | n0_conforme |
| Print/DBM_module-generator-SKILL | V2.1.0 | sain | 5/4/2 | bleu | n0_conforme |
| Print/DBM_recettage-SKILL | V2.1.0 | sain | 5/5/2 | bleu | n0_conforme |
| Print/DBM_veille-tech-SKILL | V1.1.0 | sain | 4/4/2 | orange | n0_conforme |
| S108_AUDIT_MICRO_APP | n.d. | sain | 4/5/2 | orange | n0_conforme |
| S108_AUDIT_MICRO_CREATEUR | n.d. | sain | 4/5/2 | orange | n0_conforme |
| S108_AUDIT_MICRO_MODULES | V2 | sain | 4/5/2 | orange | n0_conforme |
| S108_AUDIT_MICRO_RACINE | n.d. | sain | 4/5/2 | orange | n0_conforme |
| S108_AUDIT_MICRO_SITE | n.d. | sain | 4/5/2 | orange | n0_conforme |
| S108_GPS_AUDIT_FICHIERS | n.d. | sain | 3/5/2 | orange | n0_conforme |
| S108_MIGRATION_ARBORESCENCE | n.d. | sain | 5/4/2 | orange | n0_conforme |
| S109_AUDIT_ECART_CANON | V1.0.0 | sain | 4/5/3 | jaune | n0_conforme |
| S109_CDC_BDB | V1.0.0 | sain | 5/5/3 | orange/jaune | n0_conforme |
| _deltas/01_ACCES_NIVEAUX_V1_1_0 | V1.1.0 | perime | n.a. | n.a. | a_supprimer |
| _deltas/02_BACK_OFFICE_REF_V1_0_0 | V1.0.0 | perime | n.a. | n.a. | conservation passive |
| _deltas/02_SUPABASE_DATA_MODEL_V1_22_0 | V1.22.0 | perime | n.a. | n.a. | conservation passive |
| _deltas/21_TEMPLATE_CTX_MODULE_V1_2_0 | V1.2.0 | dangereux | n.a. | n.a. | a_supprimer |
| _deltas/BDB_SURFACE_MAP_V1_0_0 | V1.0.0 | perime | n.a. | n.a. | conservation passive |
| _deltas/BDB_SURFACE_MAP_V1_1_0 | V1.1.0 | perime | n.a. | n.a. | conservation passive |
| bernard-persona-complet | V1.0.0 | sain | 3/4/5 | vert | n0_conforme |

**Repartition des etats** (sur 81 docs) :
- sain : 36
- contamine : 35
- perime : 9
- orphelin : 0
- dangereux : 1 (`_deltas/21_TEMPLATE_CTX_MODULE_V1_2_0` — peut reinjecter NOYAU_VERITE/JOURNAL_DECISIONS si reactive)

**Repartition des verdicts :**
- n0_conforme : 32
- ameliorable : 41
- a_refondre : 0
- remplacable : 7
- a_supprimer : 1

## 2. References croisees

**Cycle/chaines stables (saines)** :
- Niveau 0 V0.5.0 → cite Bernard, type 0, PONT-STANDARD-TERRAIN
- Pitch fondateur DBM → cite Manifeste, Pedagogie, Canon V0.4 archive
- IDENTITE_DBM → cite tous les fondateurs A1-A5 + Personas + Pedagogie + Pricing + S109
- Manifeste ↔ Canon ↔ Doctrine ↔ Philosophie : se referencent mutuellement (chaine fondatrice)
- 21_TEMPLATE_CTX_MODULE V2.0.0 → cite 10_ARCHITECTURE V3.0.0 + 02_SUPABASE V1.24.0 (chaine techno saine)

**References cassees** (35 docs) :
- 35 fichiers citent au moins un de : `NOYAU_VERITE`, `atelier_fondation`, `JOURNAL_DECISIONS`, `CTX_SYSTEM_ARCHITECTURE` (renomme).
- Canon V1.0.4 §10 → atelier_fondation (table inexistante)
- Manifeste V1.2.0 §10 → JOURNAL_DECISIONS + CTX_SYSTEM_ARCHITECTURE (fichiers/refs inexistants)
- 12_SYSTEM_ARCHITECTURE V2.5.0 → MODULE_DEPENDENCY_MAP_V1_7_0 (probablement absent), JOURNAL_REF V1_34_0 (inexistant)
- 43_CTX_ARSENAL → BIBLE_DE_BLOC_MASTER_V5 + 01_SCHEMA_DONNEES_CLAUDE (refs historiques mortes)

**Orphelins** : aucun a strictement parler (chaque doc est cite par au moins un autre, ou cite au moins un autre).

**Doublons / chaines a couper** :
- `12_SYSTEM_ARCHITECTURE_V2_5_0` + `10_CHANTIER_TECHNIQUE_V1_1_0` → fusionnes dans `10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0` mais coexistent.
- `NIVEAU_0_DBM_V0_4_0` + `000000_NIVEAU_0_DBM_V0_5_0` → V0.4.0 doit migrer vers `_deltas/`.
- `00000_IDENTITE_BDB_V0_1_0.md` (filename) vs V0.3.0 (header) → renomme attendu.

## 3. Termes perimes — chiffres globaux

| Terme | Occurrences | Fichiers concernes |
|---|---|---|
| "BDB" / "Bible de Bloc" | 814 | 83 fichiers (incluant .txt et .svg) |
| "DB&M" / "Des Blocs & Moi" / "DBM" | 24 | 16 fichiers |
| "NOYAU_VERITE" + "JOURNAL_DECISIONS" + "atelier_fondation" | n.c. | 35 fichiers |

**Diagnostic** : la bascule de nom DB&M est embryonnaire. Seuls les fichiers fondateurs DBM tres recents (000000_*, 0000000_PITCH, FONDATIONS_DBM, NIVEAU_0_DBM, REFERENTIEL_DBM, LES_7_VOIX_DBM) et les 7 skills Print/ utilisent regulierement le nouveau nom. Le reste de la gouvernance (74 fichiers / 91 %) reste en BDB.

## 4. Contradictions inter-docs

| # | Doc 1 | Doc 2 | Sujet | Severite |
|---|---|---|---|---|
| 1 | Canon §10 | Manifeste §10 | Hierarchie sources de verite (atelier_fondation vs JOURNAL_DECISIONS) | P1 |
| 2 | Manifeste §7.7 (6 maillons) | Doctrine §4 (12 maillons) | Combo gagnant | P2 — documente CLAUDE.md |
| 3 | 10_CHANTIER + 12_SYSTEM_ARCH | 10_ARCHITECTURE V3.0.0 | Doublon non archive | P2 |
| 4 | NIVEAU_0_DBM V0.4.0 | NIVEAU_0_DBM V0.5.0 | V0.4.0 non archivee | P3 |
| 5 | _deltas/21_TEMPLATE V1.2.0 | 21_TEMPLATE V2.0.0 | V1.2.0 (qui semait NOYAU_VERITE) reste accessible | P1 |
| 6 | Filename `00000_IDENTITE_BDB_V0_1_0` | Header V0.3.0 | Versioning incoherent | P2 |
| 7 | 35 CTX modules | TEMPLATE V2.0.0 | CTX modules toujours sur ancien template | P1 |
| 8 | 31_PERSONAS_BDB cite Manifeste V1.1.0 | Manifeste actuel V1.2.0 | Reference stale | P3 |
| 9 | CATALOGUE_OPEN_SOURCE BS 5.3.2 | 10_ARCH V3.0.0 BS 5.3.3 | Version BS desync | P3 |
| 10 | Personas Manifeste §5 (11) | Personas 31_BDB (etats redacteur) | Confusion possible — geree par `STATUT` explicite | (resolu) |

## 5. Documents manquants

Concepts du Niveau 0 V0.5.0 sans doc dedie :

1. **Bernard / 7 voix d'audit** — nommes Niveau 0 §9 et §14, document dedie "a venir". Existe partiel : `bernard-persona-complet.md` + `000000_LES_7_VOIX_AUDIT_DBM_V1_0_0.md`. **Statut : DEFINI partiel.** Manque une page d'orchestration entre Bernard et les 7 voix.
2. **Ennea processus DB&M** — 9 types nommes Niveau 0 §4.3, "premiere iteration ouverte aux corrections". Manque : doc dedie qui expose les 9 types avec exemples DBM. Type 0 documente.
3. **PONT-STANDARD-TERRAIN** — cite Niveau 0 §14 explicitement comme angle mort fige (V0.5.0). Mentionne Canon, Manifeste, Doctrine sans definition formelle. **Manque doc dedie.**
4. **GPS** (terme) — utilise dans S108_GPS_AUDIT_FICHIERS comme nom session. Pas defini formellement. Liste comme orphelin a definir dans `00000_DEBLOQUEZ_MOI`.
5. **CNP / CNA** — definitions Niveau 0 §5. Pricing utilise CNP. Pas de doc dedie. Implicit.
6. **Niveaux 1, 2, 3** — Niveau 0 §14 dit "pas encore construits". Confirmation : aucun document `NIVEAU_1_DBM_*` n'existe.
7. **Combo gagnant** — version 6 (Manifeste) vs 12 (Doctrine) — manque doc unique de reconciliation.
8. **0000_METHODES_DBM** — projete dans `STRUCTURE_CIBLE` etage 2 ("a creer ou fusionner avec Canon Annexe"). N'existe pas. Devrait reunir MERE + FAB(3R) + ennea proc + spirale + DISC + Kolb + Boudreault + SECI + Deming + POULET + Knowles.

## 6. Priorites P1 / P2 / P3

### P1 — Bloquant (a faire maintenant)

| # | Action | Doc concerne |
|---|---|---|
| P1.1 | Resoudre §10 Canon vs Manifeste — une seule hierarchie de sources de verite. Bump Canon V1.0.5 + Manifeste V1.3.0. | Canon, Manifeste |
| P1.2 | Migrer les 35 CTX modules vers TEMPLATE V2.0.0 (suppression NOYAU_VERITE/JOURNAL_DECISIONS). Faisable en sweep automatique. | 25 CTX modules + autres |
| P1.3 | Supprimer `_deltas/21_TEMPLATE_CTX_MODULE_V1_2_0.md` (etat dangereux : peut reinjecter refs mortes). | _deltas/ |
| P1.4 | Trancher Etage 0 (5 Pourquoi, mission, vision, profil DISC) — 11 actions de IDENTITE/STRUCTURE_CIBLE. | IDENTITE_BDB, STRUCTURE_CIBLE |

### P2 — Important (a faire bientot)

| # | Action | Doc concerne |
|---|---|---|
| P2.1 | Archiver `10_CHANTIER_TECHNIQUE V1.1.0` et `12_SYSTEM_ARCHITECTURE V2.5.0` dans `_deltas/` (officiellement remplaces par 10_ARCH V3.0.0). | 10_CHANTIER, 12_SYSTEM_ARCH |
| P2.2 | Reconcilier combo gagnant 6 vs 12 maillons. Bump Manifeste V1.3.0 ou doc reconcil dedie. | Manifeste, Doctrine |
| P2.3 | Renommer `00000_IDENTITE_BDB_V0_1_0.md` en `00000_IDENTITE_DBM_V0_3_0.md`. Aligner filename/header. | IDENTITE |
| P2.4 | Renommer `00_PHILOSOPHIE_PARTICIPATIVE_BDB_V1_0_0.md` en `0000_PHILOSOPHIE_PARTICIPATIVE_DBM_V1_0_0.md` selon STRUCTURE_CIBLE etage 6. | Philosophie |
| P2.5 | Creer `0000_METHODES_DBM` qui reunit MERE + FAB(3R) + ennea proc + spirale + DISC + Kolb + Boudreault + SECI + Deming + POULET + Knowles (etage 2 STRUCTURE_CIBLE). | nouveau doc |
| P2.6 | Definir PONT-STANDARD-TERRAIN dans Canon ou Doctrine. | Canon ou Doctrine |
| P2.7 | Auditer `MODULE_DEPENDENCY_MAP_V1_7_0` (cite par 12_SYSTEM_ARCH) — existe-t-il ? | a verifier |

### P3 — Cosmetique (a faire un jour)

| # | Action | Doc concerne |
|---|---|---|
| P3.1 | Bascule progressive "BDB" → "DB&M" dans tous les docs gouvernance (74 fichiers concernes). Sweep automatise possible avec garde-fou (preserver code, citations historiques explicites). | tous |
| P3.2 | Deplacer `NIVEAU_0_DBM_V0_4_0.md` dans `_deltas/`. | NIVEAU_0_V0_4_0 |
| P3.3 | Bump 31_PERSONAS_BDB MANIFESTE_REF V1.1.0 → V1.2.0. | 31_PERSONAS |
| P3.4 | Bump CATALOGUE_OPEN_SOURCE BS 5.3.2 → 5.3.3. | CATALOGUE |
| P3.5 | Renommer fichiers BDB → DBM (ex: `00_BDB_SURFACE_MAP` → `00_DBM_SURFACE_MAP`, `31_PERSONAS_BDB` → `31_PERSONAS_DBM`, `04_PEDAGOGIE_BDB` → `04_PEDAGOGIE_DBM`, `CATALOGUE_OPEN_SOURCE_BDB` → `CATALOGUE_OPEN_SOURCE_DBM`). | nombreux |
| P3.6 | Definir GPS, CNP, CNA, "combo gagnant" formellement. | DEBLOQUEZ_MOI ou METHODES_DBM |

---

# ANGLES MORTS DE CET AUDIT (TYPE 0)

Ce que cet audit n'a pas pu trancher avec certitude :

1. **Lecture en diagonale** : pour 6 docs > 30k caracteres (000000_NIVEAU_0_DBM_V0_5_0 lu integralement, mais 000000_REFERENTIEL_AFFIRMATIONS, 000000_LES_7_VOIX, 04_PEDAGOGIE_BDB, S109_AUDIT_ECART_CANON, S109_CDC_BDB, 0000_BIBLE_DE_BLOC_CANON_ANNEXE — lus en partie). Notes ARE indicatives.
2. **Notes ARE 1-5** : indicatives, pas absolues. Differents auditeurs donneraient des notes legerement differentes pour les memes docs. 
3. **Spirale** : appliquee au document, pas au projet entier. Un meme contenu peut etre lu beige (donnees brutes) ou jaune (integration) selon angle.
4. **Type ennea processus** : "premiere iteration ouverte aux corrections" — Niveau 0 §14. Mes attributions sont des hypotheses, pas des faits.
5. **MODULE_DEPENDENCY_MAP_V1_7_0.md** : cite par 12_SYSTEM_ARCHITECTURE — pas verifie son existence reelle (probablement absent).
6. **Existence de CC ulterieur de docs cites** : ARBORESCENCE_BDB.txt, audit_*.sql, flux_acteurs_preferences_v2_pharmacie.svg ont ete vus dans l'inventaire mais hors perimetre `.md`.
7. **Pas de lecture de `migration_v5/`** : sous-dossier non explore en detail.

**Vide est correct. Faux est destructeur.**

---

*Fin de l'audit Niveau 0 du 01 mai 2026.*
