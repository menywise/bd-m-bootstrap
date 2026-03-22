# CTX_ORGANISATEUR.md
```
VERSION      : 2.0.0
DATE         : 2026-03-21
MODULE       : organisateur
STATUT       : OPÉRATIONNEL — shell migré — persistance Supabase manquante
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_5
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0
CSS_REF      : cds-overrides.css v1.5.0

TRACKER_STATUS     : en_cours
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : phases-hardcodees-JS,no-supabase-persistence,touch-terrain-non-confirmé,CDN-latest
TRACKER_UPDATED    : 2026-03-21

DELTA v1.3.0 → v2.0.0 :
  Réécriture complète au standard TEMPLATE V1.2.0 (BLOC 0-9).
  Audit code source index.html (428L) — v2.0.0 datée 2026-03-15.
  Correction CTX v1.3.x : bdb-shell.js DÉJÀ migré (pas legacy).
  Correction CTX v1.3.x : zéro localStorage — phases en mémoire JS uniquement.
  Correction CTX v1.3.x : zéro onclick= dans HTML — addEventListener partout.
  CSS déjà externalisé dans organisateur-ui.css.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Réécriture CTX complet TEMPLATE V1.2.0.
                   Audit code source 428L. Corrections CTX v1.3.x (shell déjà migré,
                   zéro localStorage, zéro onclick=).
RESTE À FAIRE    : Définir schéma Supabase parcours_phases (session dédiée)
                   Migrer DEFAULT_PHASES hardcodées → seed SQL
                   Implémenter persistance Supabase (phases par user_id ou shared)
                   Confirmer régression touch terrain (mobile réel — INTERDIT-18)
                   Remplacer @latest CDN → tag fixe avant prod (BLOC D.2)
VIOLATIONS ACTIVES :
  ⚠ phases-hardcodees-JS      : 14 phases dans DEFAULT_PHASES array JS —
                                 aucune persistance entre sessions, reset à chaque reload
  ⚠ no-supabase-persistence   : pas de table parcours_phases — données volatiles
  ⚠ touch-terrain-non-confirmé : handlers touch présents dans le code,
                                  statut terrain non validé (INTERDIT-18)
  ⚠ CDN-latest                : @latest sur theme-base.css et theme-print.css
                                  → tag fixe avant déploiement prod (BLOC D.2)
VIOLATIONS RÉSOLUES :
  - INTERDIT-B1/B2/B3 : auth supprimée, bdb-shell.js intégré — 2026-03-15 (v2.0.0)
  - INTERDIT-E1       : #bdb-shell premier enfant de <main> ✅
  - CSS externalisé   : organisateur-ui.css chargé ✅
  - Zéro onclick=     : addEventListener partout ✅
  - Zéro style=       : aucun style= statique dans HTML ou JS ✅
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Organisateur de phases du parcours patient au bloc opératoire.
  Permet de créer, ordonner par drag & drop (desktop + touch mobile),
  éditer et supprimer des phases.
  14 phases par défaut (parcours template — à adapter par établissement).
  Export JSON et Markdown. Import JSON.
  Aucun contenu admin-only : toute modification est en mémoire uniquement
  (reset au prochain chargement) jusqu'à migration Supabase.

PORTEE      :
  Phases du parcours patient de la préparation organisationnelle (J-1)
  au bio-nettoyage salle (après sortie patient).
  Hors périmètre : persistance inter-sessions (Supabase à implémenter).
  Hors périmètre : partage entre utilisateurs.
  Hors périmètre : lien avec Planning Engine (modules indépendants).

AUTORISE    :
  Modifier modules/organisateur/index.html
  Modifier css/organisateur-ui.css
  Implémenter la persistance Supabase (table parcours_phases)
  Corriger la régression touch après vérification terrain

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
  - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
  - Dupliquer le bloc auth (INTERDIT-B1) — bdb-shell.js gère tout
  - Faire une requête profiles_directory ou user_roles (INTERDIT-B2)
  - Ajouter style= statique dans le HTML (INTERDIT-C2)
  - Ajouter onclick= dans le HTML
  - Qualifier la régression touch comme résolue sans test mobile réel (INTERDIT-18)
  - Connecter au Planning Engine (modules indépendants)

DEPENDANCES :
  Fixes (tous les modules) :
    window.bdbUser     → fourni par bdb-shell.js v1.4.0
    window.bdb         → client Supabase (supabase-client.js)
    cds-overrides.css  → v1.5.0
  Spécifiques à ce module :
    Tables Supabase : parcours_phases (à créer — schéma à définir)
    CSS module       : ../../css/organisateur-ui.css
  Note : window.bdbUser non utilisé actuellement (pas de contenu admin-only).
         À utiliser après migration Supabase pour lier phases à user_id.
```

---

## BLOC 2 — TABLE SUPABASE

### parcours_phases (table cible — À CRÉER)

```
Statut : table non existante — schéma à définir lors d'une session dédiée.

Questions à arbitrer avant création :
  Q1 — Phases par utilisateur (chaque IDE son parcours) ou partagées (une version par établissement) ?
  Q2 — Versioning ? Un utilisateur peut-il avoir plusieurs versions du parcours ?
  Q3 — Ordre de migration prioritaire vs autres modules Phase 1 ?
       Rappel ordre actuel : organisateur → paxis → collab → disc → dork → thesaurus

Schéma minimal envisagé (à valider) :
  parcours_phases (
    id           uuid PK,
    user_id      uuid FK auth.users,        -- si par utilisateur
    titre        text NOT NULL,
    description  text,
    ordre        smallint NOT NULL DEFAULT 0,
    created_by   uuid FK auth.users,
    created_at   timestamptz,
    updated_at   timestamptz
  )

⚠ Ne pas créer la table avant arbitrage Q1.
```

### Données actuelles (hardcodées en JS)

```
DEFAULT_PHASES : 14 phases en tableau JS
  0. Préparation organisationnelle  (J-1 à H-2h)
  1. Accueil patient au bloc        (H-30min)
  2. Transfert table induction      (H-20min)
  3. Induction anesthésie           (H-10min)
  4. Transfert table opératoire     (H-5min)
  5. Installation opératoire        (H0)
  6. Préparation champ opératoire   (H+5min)
  7. Préparation table instrumentiste (H+10min)
  8. Checklist Time Out HAS         (H+15min — AVANT INCISION)
  9. Temps opératoire               (H+20min)
  10. Checklist Sign Out HAS        (Fin intervention)
  11. Pansement & immobilisation    (Après fermeture)
  12. Réveil & transfert SSPI       (Sortie salle)
  13. Bio-nettoyage salle           (Après sortie patient)

Source métier : parcours_patient_v1.md (template GoChénieux — à adapter par établissement).
⚠ Ces phases sont déclarées en JS comme TEMPLATE À ADAPTER.
  Elles ne représentent pas un protocole BDB validé.
```

### Règle E9

```
⚠ window.bdbUser.isAdmin — source unique après migration Supabase
⚠ Aucune requête user_roles ou profiles_directory dans ce module
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | Accès actuel | Accès cible (post-Supabase) |
|-----|-------------|----------------------------|
| **anon** | Redirect login (bdb-shell.js) | ✗ |
| **member** | ✓ Lecture + modification en mémoire | ✓ Ses propres phases persistées |
| **admin** | ✓ Identique member (pas de contenu admin-only) | ✓ Toutes phases + CRUD partagé |

**Note** : Pas de guard admin dans ce module — toute personne authentifiée peut utiliser l'organisateur.
Le module ne gère pas l'authentification (bdb-shell.js s'en charge).

---

## BLOC 4 — CHECKLIST PREMIUM

```
[✅] CDS conforme
      ✅ bdb-shell.js v1.4.0 intégré (migration 2026-03-15)
      ✅ #bdb-shell premier enfant de <main> (INTERDIT-E1)
      ✅ Zéro bloc auth dupliqué (INTERDIT-B1/B2/B3)
      ✅ Zéro onclick= dans le HTML — addEventListener partout
      ✅ Zéro style= statique dans HTML et JS
      ✅ CSS externalisé dans organisateur-ui.css (INTERDIT-17 ✅)
      ✅ Chaîne CSS BLOC E : Bootstrap → BI → theme-base → theme-print → cds-overrides → organisateur-ui
      ✅ Chaîne JS BLOC E : Bootstrap → Supabase SDK → supabase-client → bdb-shell
      ⚠ @latest CDN BDB → tag fixe avant prod (BLOC D.2)

[✅] Documenté
      Ce fichier CTX v2.0.0 dans 00_GOUVERNANCE/
      TRACKER_* mis à jour (2026-03-21)

[⚠ ] Résilient
      ✅ Toast notifications (succès, erreur)
      ✅ Confirmation avant reset (confirm() — acceptable)
      ✅ Validation titre obligatoire avant ajout/sauvegarde
      ⚠ Pas de loadingState / emptyState / errorState formels (C.9)
         Acceptable tant que pas de Supabase — à implémenter lors de la migration

[✅] Navigable
      ✅ bdb-shell.js injecte l'offcanvas dynamiquement
      ✅ data-module-title="Organisateur"
      ✅ data-module-icon="bi-diagram-3"

[⚠ ] Responsive
      ✅ Bootstrap grid et flex responsive
      ✅ Drag desktop (mouse events) fonctionnel
      ⚠ Touch mobile : handlers présents mais non confirmés terrain (INTERDIT-18)
```

**État actuel** : `[3/5]` — résilient C.9 et touch terrain à valider

**Violations actives** :
```
FONCTIONNEL :
  V1 — Phases hardcodées en JS — zéro persistance Supabase.
       Reset à chaque reload. Arbitrage Q1 requis avant implémentation.

MINEUR :
  V2 — @latest CDN BDB → tag fixe avant prod (BLOC D.2).
  V3 — Touch terrain non confirmé — INTERDIT-18.
  V4 — C.9 non implémenté formellement (acceptable pré-Supabase).
```

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
RÈGLE-ORG-01 : Phases sont un TEMPLATE établissement
  Les 14 phases DEFAULT sont déclarées comme template à adapter.
  Source : parcours_patient_v1.md (GoChénieux — validation théorique)
  Arbitrage final : Manu (expert métier terrain).
  Ne jamais présenter ces phases comme protocole BDB validé.
  Source  : commentaire index.html + parcours_patient_v1.md header
  Impact  : Si présenté comme validé → erreur métier potentielle

RÈGLE-ORG-02 : Persistance mémoire uniquement (pré-Supabase)
  Les modifications (ajout, suppression, réordonnancement) ne survivent pas
  au rechargement de la page. C'est un état délibéré documenté.
  Le bouton "Réinitialiser" restore DEFAULT_PHASES.
  Source  : code source — pas de localStorage, pas de Supabase
  Impact  : Si l'utilisateur recharge sans exporter → perte des modifications

RÈGLE-ORG-03 : Format export JSON
  Format versioned : { version, date_export, total_phases, phases: [{ordre, id, titre, description}] }
  Import : parser phases[] → mapper titre/description → remplace phases en mémoire.
  Source  : code source existant
  Impact  : Modifier le format sans versionner → import impossible des anciens exports

RÈGLE-ORG-04 : Drag & drop — deux implémentations
  Desktop : HTML5 Drag API (dragstart, dragend, dragover, drop).
  Mobile  : Touch events (handleTouchStart, handleTouchMove, handleTouchEnd).
  Les deux coexistent sur chaque item rendu. Ne pas supprimer l'un sans l'autre.
  Source  : code source existant
  Impact  : Si touch supprimé → drag mobile cassé

RÈGLE-ORG-05 : index comme identifiant de position
  Les items sont identifiés par leur index dans le tableau phases[].
  L'id est un entier (0-13 pour défaut, Date.now() pour ajouts).
  Après drag, l'index change — les boutons up/down utilisent l'index courant.
  Source  : code source existant
  Impact  : Si identification par id.old plutôt qu'index → mauvais item modifié
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur commise | Correct |
|---|---|---|
| Qualifier ce module de "legacy localStorage" | Le code n'utilise PAS localStorage — erreur CTX v1.3.x | Phases en mémoire JS uniquement (DEFAULT_PHASES) |
| Qualifier ce module de "shell non migré" | bdb-shell.js intégré depuis v2.0.0 (2026-03-15) | Shell ✅ migré — TRACKER_SHELL = oui |
| Qualifier "25 onclick=" | Erreur du CTX précédent — zéro onclick= dans le HTML | addEventListener partout ✅ |
| Persister les phases en localStorage | Régression volontairement évitée — cible = Supabase | Attendre arbitrage Q1 + migration Supabase |
| Modifier DEFAULT_PHASES hardcodé | Donne une fausse impression de persistance | Migrer vers seed SQL + table parcours_phases |
| Qualifier touch régression comme résolue | Non vérifié terrain | Console Chrome sur mobile réel (INTERDIT-18) |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : organisateur
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/organisateur/index.html · css/organisateur-ui.css
FICHIERS HORS SCOPE : js/bdb-shell.js · js/supabase-client.js · css/cds-overrides.css

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX v2.0.0

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS (dernière version)
  [ ] CHANTIER_TECHNIQUE_V1_0_5.md
  [ ] Ce fichier CTX v2.0.0

Si un champ est vide → ne pas commencer.
```

---

## BLOC 8 — RÈGLE DE CLÔTURE

En fin de chaque session sur ce module, l'IA DOIT :

```
1. Mettre à jour BLOC 0 (état courant — fait / reste / violations)
2. Mettre à jour les champs TRACKER_* dans l'en-tête
3. Mettre à jour BLOC 4 (checklist premium)
4. Mettre à jour BLOC 5 si nouvelle règle métier identifiée
5. Inscrire dans JOURNAL_DECISIONS toute décision validée
6. Incrémenter VERSION de ce fichier
```

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-07 | 1.0.0 | Création. Refonte CDS. | Manu + Claude |
| 2026-03-13 | 1.1.0 | Suppression clause "délibérément standalone". | Manu + Claude |
| 2026-03-15 | 1.2.0 | NOYAU_REF V2.1.0. Anti-hallucination. Touch à confirmer. Premier candidat migration Phase 1. | Manu + Claude |
| 2026-03-15 | (code) | Migration shell v2.0.0 : bdb-shell.js intégré, auth supprimée, CSS externalisé. | Manu + Claude |
| 2026-03-16 | 1.3.0 | NOYAU_REF V2_4_0. PERSONAS underscore. | Manu + Claude |
| 2026-03-21 | 1.3.1 | TRACKER_* + BLOC 0 — TEMPLATE V1.2.0 partiel (incorrect — legacy). | Claude |
| 2026-03-21 | 2.0.0 | Réécriture complète TEMPLATE V1.2.0 intégral. Audit code 428L. Corrections CTX v1.3.x. Shell confirmé migré. Zéro localStorage. Zéro onclick=. BLOC 0-9 complets. | Claude |
