# CTX — MODULE PLANNING ENGINE

```
VERSION  : 1.5.0
DATE     : 2026-03-21
STATUT   : OPÉRATIONNEL — MIGRATION SUPABASE EN ATTENTE (Phase 2 — chantier critique)
FICHIER  : modules/planning/planning.html (+ analytics.html, analytics-2.html, dashboard.html, export.html)
CSS      : css/planning-ui.css + css/cds-overrides.css
           ATTENTION : chemin relatif "css/" depuis modules/planning/ = ../../css/ (à vérifier terrain)
CSS_REF  : chaîne standard BDB (non conforme actuellement — bdb-shell absent, @latest CDN dev)
NOYAU_REF: NOYAU_VERITE_V2_4_0
TRACKER_STATUS     : legacy
TRACKER_SHELL      : non
TRACKER_PALIER     : 5
TRACKER_VIOLATIONS : localStorage source de vérité, bdb-shell absent, @latest CDN (dev), 31 membres hardcodés dans planning-schema.js, arbitrage A1 bloquant migration Supabase
TRACKER_UPDATED    : 2026-03-21
DELTA v1.4.0 → v1.5.0 :
  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
  Recadrage : bdb-shell obligatoire sur tous les modules sans exception.
  @latest CDN classé en VIOLATION ACTIVE (plus une tolérance documentée).
  31 membres hardcodés classés en VIOLATION ACTIVE.
  localStorage = dette totale à éliminer — aucune dette n'est défendable.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* — mise à niveau TEMPLATE V1.2.0.
                   Recadrage : bdb-shell obligatoire sans exception, @latest et membres
                   hardcodés reclassés en VIOLATIONS ACTIVES, localStorage = dette totale.
RESTE À FAIRE    : Arbitrage A1 (schéma Supabase — bloquant),
                   migration localStorage → Supabase (tables planning_weeks/slots/atoms/aliases),
                   brancher bdb-shell.js v1.4.0 (navigation dynamique app_modules),
                   remplacer 31 membres hardcodés par lecture profiles_directory,
                   fixer tag CDN BDB (@latest → tag fixe),
                   INSERT app_modules pour ce module
VIOLATIONS ACTIVES :
  - localStorage source de vérité (CDS_Storage + StorageKeyService) → migration Supabase Phase 2
  - bdb-shell.js absent → brancher v1.4.0 (navigation dynamique app_modules) — obligatoire sans exception
  - @latest sur CDN BDB (theme-base, theme-print) → tag fixe obligatoire (INTERDIT NOYAU)
  - 31 membres hardcodés (UUIDs) dans planning-schema.js → remplacer par profiles_directory
  - Arbitrage A1 non soldé → bloque toute la migration Phase 2
```

---

## ROLE

Moteur de planification hebdomadaire du secteur Ortho-Neurochirurgie.
Saisie, visualisation et analyse des affectations IDE et chirurgiens
sur les slots {salle + jour + créneau} des salles 05-08, lundi-vendredi.
Calcul automatique des états de slots (STABLE/FRAGILE/CRITIQUE/FERMÉ/VIDE).

## PORTÉE

Secteur : ORTHO-NEUROCHIRURGIE · Salles : 05, 06, 07, 08 · Couloir inclus
Jours : lundi–vendredi · Créneaux : MATIN / APREM / SOIR
60 slots SALLE + 15 slots COULOIR = 75 slots/semaine
Données : localStorage via CDS_Storage + StorageKeyService (JSON semaines) — **dette totale à éliminer**
Environnement : Windows · Chrome · file:// · CDN actif en conditions normales

## STACK TECHNIQUE ACTUELLE (legacy — migration Phase 2 obligatoire)

HTML/JS vanilla · Bootstrap 5.3.2 · localStorage (CDS_Storage + StorageKeyService)
Zéro module ES. Séparation stricte core/ → services/ → ui/
La persistance localStorage est une dette totale. Migration Supabase = Phase 2 — non négociable.

## MIGRATION SUPABASE — PHASE 2 (CHANTIER CRITIQUE)

Prérequis bloquants (arbitrage A1 — décision Manu requise) :
- Schéma Supabase complet (tables, RLS, semaines, membres) — voir A1 dans PLAN_ACTIONS_V2
- Script de migration localStorage → Supabase validé
- Session dédiée obligatoire — jamais en parallèle d'un autre module

Tables cibles :
```
planning_weeks      : id · year · week · created_at
planning_slots      : id · week_id · salle · jour · creneau · flags
planning_atoms      : id · slot_id · role · personnel_code · doublure
planning_aliases    : id · user_id · code · alias  (localStorage autorisé — UI locale uniquement)
```

Périmètre de migration :
1. Remplacer CDS_Storage par `DB.from()` dans planning-engine.js
2. Remplacer storage-key-service.js par des queries Supabase
3. Conserver planning-schema.js (énumérations métier) — supprimer MEMBRES hardcodés
4. MEMBRES → charger depuis profiles_directory au démarrage
5. RLS obligatoire (données RH nominatives)
6. Brancher bdb-shell.js v1.4.0 — navigation dynamique app_modules
7. INSERT dans app_modules avant activation

**Ne pas commencer Phase 2 sans arbitrage A1 complet.**

## INVARIANTS TECHNIQUES CRITIQUES

```
- Salle canonique : string padded "05" — via PlanningSchema.normalizeSalle(value)
- Format clé semaine : {YYYY}_{WW}_planning_week — via StorageKeyService
- Jamais Number(salle) — toujours normalizeSalle()
- Exception localStorage documentée : planning_custom_aliases (D-2026-02-27)
  → unique tolérance localStorage résiduelle post-migration (UI locale)
```

## RÈGLES MÉTIER (voir NOYAU_VERITE + BIBLE_DE_BLOC)

```
- 1 chirurgien max par slot SALLE
- INSTRU + PANSEUR requis pour slot opérant
- Flag OUVERTURE : MATIN uniquement
- Flag VISCÉRAL : COULOIR uniquement — JAMAIS sur slot SALLE
- Flag DOUBLURE : SALLE uniquement
- Facteurs de complexité : INSTRU=INTERIMAIRE/ETUDIANT · créneau SOIR · doublure présente
- SLOT ≠ intervention chirurgicale (modules distincts — jamais fusionner)
```

## ANTI-HALLUCINATION

```
- SLOT = {salle + jour + créneau} — PAS une intervention chirurgicale
- Flag VISCÉRAL n'existe pas sur les slots SALLE — COULOIR uniquement
- FERMÉ NATUREL ≠ FERMÉ DÉGRADÉ — deux états distincts, stats séparées
- VIDE ≠ FERMÉ — deux états distincts
- Salle canonique = "05" (string) — jamais 5 ou "5"
- Ne jamais qualifier un état de slot sans données brutes
- Les 31 membres hardcodés dans planning-schema.js sont une VIOLATION ACTIVE —
  à remplacer par profiles_directory lors de la migration Phase 2
- Le "module analytique planning" décrit dans CTX_DORK v1.0.0 n'existe pas
  (D-2026-03-13-009-b) — les stats sont dans dashboard.html + analytics.html
- Ne pas coder la migration Supabase avant arbitrage A1
- SHARED/bdb-members.js n'existe pas en BDB V2 — ne pas tenter de le charger
  (dossier SHARED/ supprimé — référence fantôme héritée Lovable)
```

## VOIX UTILISATEUR

Ce module est utilisé principalement par les cadres de bloc (P6/admin).
Microtextes et messages d'état : voix pragmatique, efficace, sans jargon superflu.
Consulter PERSONAS_BDB_V1_3_0 pour tout nouveau contenu visible.

## AUTORISÉ

- Lire/écrire les semaines de planning (localStorage uniquement jusqu'à migration — dette documentée)
- Corriger des bugs identifiés dans JOURNAL_DECISIONS
- Calculer états SLOT depuis données brutes
- Préparer le schéma Supabase (documentation uniquement, pas de code avant A1)

## INTERDIT

- Étendre aux salles hors 05-08 / jours hors lun-ven
- Modifier format storage sans contrat StorageKeyService
- `Number(salle)` — utiliser normalizeSalle()
- Flag VISCÉRAL sur slot SALLE
- Fusionner métriques COULOIR et SALLE
- Fusionner FERMÉ NATUREL et FERMÉ DÉGRADÉ
- CSS inline / JS inline
- Coder la migration Supabase avant arbitrage A1
- Tenter de charger SHARED/bdb-members.js (dossier inexistant — référence fantôme)
- Qualifier @latest CDN comme "tolérance dev" — c'est une VIOLATION à corriger
- Qualifier les 31 membres hardcodés comme "source temporaire acceptable" — c'est une VIOLATION ACTIVE

## DÉPENDANCES

```
ACTIVES :
- Bootstrap 5.3.2 (CDN jsdelivr)
- Bootstrap Icons 1.11.1 (CDN jsdelivr)
- theme-base.css · theme-print.css (CDN menywise/BDB — @latest = VIOLATION → tag fixe requis)
- ../../css/cds-overrides.css (local)
- ../../css/planning-ui.css (local)
- planning-schema.js  ← 31 membres hardcodés (UUIDs) = VIOLATION ACTIVE → profiles_directory Phase 2

CIBLE (post-migration) :
- js/bdb-shell.js v1.4.0 (navigation dynamique app_modules)
- profiles_directory (membres)
- tables planning_weeks · planning_slots · planning_atoms

SUPPRIMÉE (v1.4.0) :
- SHARED/bdb-members.js ← dossier SHARED/ inexistant en BDB V2 — référence fantôme héritée Lovable
```

## HISTORIQUE

```
2026-02-26 — v1.0.0  Création. Invariants salle canonique.
2026-03-13 — v1.2.0  Clarification migration Supabase Phase 2. Conflit CTX_SYSTEM_ARCHITECTURE résolu.
2026-03-15 — v1.3.0  NOYAU_REF V2.1.0. Anti-hallucination complète. Arbitrage A1. Voix utilisateur.
2026-03-16 — v1.4.0  NOYAU_REF V2_4_0. SHARED/bdb-members.js supprimé (référence fantôme).
                      ANTI-HALLUCINATION + INTERDIT : règle bdb-members ajoutée.
2026-03-21 — v1.5.0  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
                      Recadrage : bdb-shell obligatoire sans exception (tous modules).
                      @latest CDN reclassé VIOLATION ACTIVE (plus tolérance dev).
                      31 membres hardcodés reclassés VIOLATION ACTIVE.
                      localStorage = dette totale non défendable.
                      INTERDIT : deux règles ajoutées (@latest, membres hardcodés).
```
