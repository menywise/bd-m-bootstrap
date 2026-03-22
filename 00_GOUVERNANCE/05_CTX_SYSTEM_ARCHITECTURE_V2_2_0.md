# CTX_SYSTEM_ARCHITECTURE.md

```
VERSION  : 2.2.0
DATE     : 2026-03-21
AUTEUR   : Manu + Claude
STATUT   : CANON — CONTRAT D'ARCHITECTURE SYSTÈME
PORTÉE   : Application BDB complète
NOYAU_REF: NOYAU_VERITE_V2_4_0
JOURNAL_REF: JOURNAL_DECISIONS_V1_13_0
TRACKER_STATUS     : migré
TRACKER_SHELL      : N/A
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS : Aucune — synchronisation complète 2026-03-21
TRACKER_UPDATED    : 2026-03-21
DELTA    : v2.1.0 → v2.2.0
           Ajout TRACKER_* + BLOC 0.
           JOURNAL_REF V1_9_0 → V1_13_0 (toutes occurrences).
           §4.1 COUCHE GOUVERNANCE : AUDIT_SECURITE_BDB_V1_0_0 ajouté.
           §4.2 SOCLE : @latest reclassé VIOLATION ACTIVE (plus tolérance Phase 4).
           §4.5 : état bdb-shell explicité pour tous les modules (migré ✅ / non migré ⚠).
           §7 MIGRATION : A3 carnet_bord soldé (D-2026-03-15-T12) · sessions
           sécurité 2026-03-20 ajoutées (T07, T08, T09).
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce document DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* + BLOC 0.
                   JOURNAL_REF corrigé V1_9_0 → V1_13_0 (toutes occurrences).
                   AUDIT_SECURITE_BDB_V1_0_0 ajouté à la couche gouvernance.
                   @latest reclassé VIOLATION ACTIVE dans §4.2 et §6.
                   §4.5 : état bdb-shell documenté pour tous les modules.
                   §7 : A3 carnet_bord soldé, sessions sécurité 2026-03-20 ajoutées.
RESTE À FAIRE    : Aucun — synchronisation à jour au 2026-03-21.
                   Prochain point de synchronisation : après sessions lot 2 CTX
                   (admin · cours · installation · objectifs_ide).
VIOLATIONS ACTIVES : Aucune sur ce document.
```

---

# 1 — RÔLE DU DOCUMENT

Ce document définit l'architecture système globale de BDB.

Il complète :

```
NOYAU_VERITE_V2_4_0              ← prime sur tout en cas de conflit
PERSONAS_BDB_V1_3_0              ← contrepoids opérationnel profil auteur DC
BIBLE_DE_BLOC_V1_0_3             ← référentiel métier bloc
CTX modules                      ← règles de chaque module
JOURNAL_DECISIONS_V1_13_0        ← décisions validées
```

Il sert à :

```
- décrire les couches du système
- définir les flux autorisés
- fixer les dépendances inter-modules
- empêcher les dérives architecturales
```

Ce document n'est pas narratif. C'est un contrat d'architecture.
Toute évolution structurelle doit être : proposée → arbitrée → versionnée → journalisée.

---

# 2 — NATURE DU SYSTÈME

BDB est une plateforme métier modulaire destinée au bloc opératoire Ortho-Neurochirurgie.

Elle combine :

```
- planification opératoire (planning)
- base de connaissance chirurgicale (fiches, arsenal, preferences, installation, anatomie)
- outils pédagogiques (cours, disc, paxis, thesaurus)
- outils organisationnels (collab, organisateur)
- outils de recherche (dork)
- administration (admin, annuaire, transmissions)
- présentation (mini-site)
```

Finalité unique, non négociable (NOYAU_VERITE BLOC 0) :
> "En quoi cela bénéficie-t-il au patient ?"

---

# 3 — PRINCIPES STRUCTURELS

## 3.1 Principe de modularité

Chaque fonctionnalité appartient à un module autonome.

Un module possède :

```
- un CTX local (00_GOUVERNANCE\)
- une interface HTML (modules/[module]/index.html)
- un CSS module (css/[module]-ui.css)
- un JS module (inline ou fichiers séparés selon le module)
- des tables Supabase propres ou cibles
```

Aucun module ne peut dépendre d'un autre module sans dépendance
explicitement documentée dans MODULE_DEPENDENCY_MAP_V1_2_0.md.

---

## 3.2 Principe de noyau documentaire

La vérité du système ne réside jamais dans la conversation.

Hiérarchie des sources autoritaires (ordre de priorité) :

```
1. NOYAU_VERITE_V2_4_0
2. JOURNAL_DECISIONS_V1_13_0
3. CTX_SYSTEM_ARCHITECTURE (ce fichier)
4. CTX_[MODULE].md local
```

En cas de conflit entre deux sources : la source de rang supérieur prime.
L'IA signale le conflit à Manu — ne jamais arbitrer seul.

---

## 3.3 Principe Supabase exclusif

Décision actée (D-2026-03-09, JOURNAL_DECISIONS_V1_13_0) :

```
Supabase = moteur de données unique
```

Conséquences :

```
- aucune nouvelle donnée métier en localStorage
- aucune source JSON persistante
- aucune base parallèle
- aucune dette n'est défendable — tout écart = VIOLATION ACTIVE à corriger
```

Exceptions temporaires (migration planifiée selon Roadmap §7) :

```
planning      ← localStorage — Phase 2 (chantier critique)
disc          ← localStorage — Phase 1
paxis         ← localStorage — Phase 1
collab        ← localStorage — Phase 1
organisateur  ← localStorage — Phase 1
dork          ← localStorage — Phase 1
thesaurus     ← DATA inline   — Phase 1 (assets SQL disponibles)
```

Données UI éphémères autorisées hors Supabase :

```
sessionStorage : bdb_preview_role · demo_mode
               · bdb_shell_app_groups · bdb_shell_app_modules (cache bdb-shell — D-2026-03-16-P5)
localStorage   : planning_custom_aliases (exception documentée D-2026-02-27)
```

---

## 3.4 Principe de voix utilisateur

Tout contenu visible par un utilisateur de BDB (libellés, messages d'état,
textes d'interface, pages du mini-site) doit être conforme à la
RÈGLE DE VOIX BDB définie dans PERSONAS_BDB_V1_3_0.

Ce principe compense les angles morts du profil auteur DC (NOYAU_VERITE BLOC 0).

Une IA travaillant sur tout contenu utilisateur doit charger
PERSONAS_BDB_V1_3_0 avant de produire quoi que ce soit.

---

# 4 — COUCHES DU SYSTÈME

BDB est organisé en 5 couches actives.

---

## 4.1 COUCHE GOUVERNANCE

Rôle : garantir la cohérence du système et compenser les biais structurels.

Contenu :

```
NOYAU_VERITE_V2_4_0              ← source unique de reprise
JOURNAL_DECISIONS_V1_13_0        ← décisions validées (append-only)
PERSONAS_BDB_V1_3_0              ← référentiel utilisateurs + règle de voix
BIBLE_DE_BLOC_V1_0_3             ← référentiel métier bloc
CTX_SYSTEM_ARCHITECTURE.md       ← ce fichier
CTX_[MODULE].md                  ← règles de chaque module
GUIDE_TRAVAIL_SESSION_V1_2_1.md  ← protocole d'entrée en session
MODULE_DEPENDENCY_MAP_V1_2_0.md  ← dépendances réelles inter-modules
SUPABASE_DATA_MODEL_V1_4_0.md    ← modèle de données global
CHANTIER_TECHNIQUE_V1_0_5.md     ← décisions techniques pérennes
AUDIT_SECURITE_BDB_V1_0_0.md     ← audit RLS + sécurité OVH (créé D-2026-03-20-T07)
```

Cette couche est non exécutable. Elle définit les règles.

---

## 4.2 COUCHE SOCLE TECHNIQUE

Rôle : infrastructure partagée par tous les modules.

Composants :

```
index.html             ← portail (point d'entrée post-auth)
login.html             ← authentification
reset-password.html
js/supabase-client.js  ← connexion unique (window.bdb + bdbRequireAuth + bdbToast)
js/bdb-shell.js v1.4.0 ← shell universel : header + offcanvas + auth + window.bdbUser
                          navigation dynamique depuis app_groups + app_modules
                          cache sessionStorage SANS TTL (D-2026-03-16-P5)
                          fallback statique si Supabase indisponible
js/bdb-preview.js      ← prévisualisation rôles admin (chargé par bdb-shell, pas par les modules)
js/config.js           ← supprimé du workflow normal (disaster recovery uniquement)
css/cds-overrides.css  ← overrides globaux partagés
Bootstrap 5.3.2        ← CDN jsdelivr (tag fixe — jamais @latest)
Bootstrap Icons 1.11.1 ← CDN jsdelivr
theme-base.css         ← CDN menywise/BDB — @latest = VIOLATION ACTIVE → tag fixe obligatoire
start-bdb.ps1          ← démarrage post-reboot Windows
```

Règles absolues :

```
- Ne jamais dupliquer URL Supabase ou clef anon hors supabase-client.js
- Ne jamais modifier supabase-client.js sans entrée JOURNAL
- @latest interdit sur tous les CDN BDB — VIOLATION ACTIVE (INTERDIT-01)
- config.js ne doit pas être chargé en dev normal (disaster recovery uniquement)
- bdb-preview.js est chargé par bdb-shell.js — ne pas le charger dans les modules
- bdb-shell.js est obligatoire sur TOUS les modules sans exception
```

---

## 4.3 COUCHE DONNÉES

Moteur : Supabase (local port 54321 · cloud ecpzrygzdugwwkqbsajn.supabase.co)

Tables transverses (colonne vertébrale relationnelle) :

```
profiles               ← authentification Supabase
profiles_directory     ← annuaire métier (approved ici, pas dans user_roles)
user_roles             ← rôles applicatifs (admin | member)
content_types          ← types de contenus
categories             ← catégories de contenu
tags                   ← tags transverses
tag_links              ← relation N:N tags ↔ contenus (DELETE restreint admin — D-2026-03-20-T09)
content_images         ← images associées aux contenus
content_relations      ← relations entre contenus (RLS fix D-2026-03-20-T09)
app_groups             ← groupes de navigation BDB (bloc · equipe · savoir · pilotage · espace_perso)
app_modules            ← modules actifs par groupe (source de la navigation dynamique)
                          RLS visibility côté serveur — D-2026-03-16-P6
error_404_logs         ← tracking liens cassés (créé D-2026-03-20-T08)
```

Règle app_modules (D-2026-03-16-T03) :
```
Ajouter un module à BDB = INSERT dans app_modules.
Aucun fichier HTML à modifier.
```

Erreur connue à ne pas corriger sans test DB :

```
Bug typo Lovable hérité : from('content-images') coexiste avec from('content_images')
dans certains modules. Ne pas "normaliser" sans vérifier les deux formes en base.
⚠ À résoudre avant Phase 4 (déploiement OVH). Ne pas déployer avec ce bug non résolu.
```

---

## 4.4 COUCHE SERVICES JS

Rôle : accès aux données depuis les modules.

État actuel :
Les modules accèdent directement à Supabase via `window.bdb.from()`
sans couche de service intermédiaire. C'est l'état réel du code terrain.

Les fichiers de services (auth-service.js, profiles-service.js, etc.)
sont une cible architecturale future, **pas encore créés**.
L'IA ne doit jamais décrire ces fichiers comme existants (NOYAU BLOC 3).

Pattern actuel autorisé :

```javascript
const DB = window.bdb  // alias documenté dans certains modules
const { data, error } = await DB.from('ma_table').select('...')
```

Alias autorisé : `const DB = window.bdb` (documenté dans certains modules).

---

## 4.5 COUCHE MODULES MÉTIER

Modules opérationnels (Supabase actif) :

```
planning      ← EXCEPTION : localStorage temporaire → Phase 2 · bdb-shell ⚠ non migré
annuaire      ← Supabase · bdb-shell ✅ migré (D-2026-03-16-T01)
transmissions ← Supabase · bdb-shell ⚠ non migré
admin         ← Supabase · bdb-shell ✅ migré
```

Modules référentiels (Supabase actif) :

```
fiches        ← Supabase · bdb-shell ⚠ non migré
anatomie      ← Supabase · bdb-shell ✅ migré
installation  ← Supabase · bdb-shell ⚠ non migré
arsenal       ← Supabase · bdb-shell ✅ migré (D-2026-03-16-T02)
preferences   ← Supabase · bdb-shell ⚠ non migré
cours         ← Supabase · bdb-shell ⚠ non migré
```

Modules cognitifs (migration Phase 1) :

```
disc          ← localStorage → Supabase Phase 1 · bdb-shell ⚠ non migré
paxis         ← localStorage → Supabase Phase 1 · bdb-shell ⚠ non migré
collab        ← localStorage → Supabase Phase 1 · bdb-shell ⚠ non migré
organisateur  ← localStorage → Supabase Phase 1 · bdb-shell ⚠ non migré
```

Modules analytiques / recherche (migration Phase 1) :

```
dork          ← localStorage → Supabase Phase 1 · bdb-shell ⚠ non migré
thesaurus     ← DATA inline  → Supabase Phase 1 (SQL disponible) · bdb-shell ⚠ non migré
```

Modules plateforme :

```
profile       ← Supabase (actif) · bdb-shell ⚠ non migré
mini-site     ← statique (zéro Supabase — intentionnel) · bdb-shell N/A
accueil       ← BRIQUE SUIVANTE
ged           ← BRIQUE SUIVANTE
carnet_bord   ← BRIQUE SUIVANTE (Supabase)
objectifs     ← BRIQUE SUIVANTE (Supabase)
```

**Règle** : tout module marqué ⚠ non migré = VIOLATION ACTIVE bdb-shell.
Aucune tolérance — migration bdb-shell obligatoire pour tous.

---

# 5 — FLUX DE DONNÉES AUTORISÉS

## 5.1 Flux standard

```
UI module
    ↓
window.bdb.from() — appel direct Supabase
    ↓
Supabase (cloud permanent — local = disaster recovery uniquement)
```

Aucun module ne doit écrire en localStorage hors exceptions documentées.

---

## 5.2 Flux pédagogique

```
cours
  ↓
carnet_bord   ← BRIQUE SUIVANTE
  ↓
objectifs     ← BRIQUE SUIVANTE
```

Objectif : suivi de progression professionnelle par agent.

---

## 5.3 Frontières métier critiques — non négociables

### SLOT ≠ INTERVENTION

```
Planning Engine  → manipule des SLOTS {salle + jour + créneau}
Module Fiches    → manipule des interventions chirurgicales (CCAM)
```

Ces deux objets ne s'agrègent pas. Modules indépendants. Ne jamais fusionner.

### SALLE ≠ COULOIR

```
Slots SALLE   → salles 05, 06, 07, 08
Slot COULOIR  → secteur distinct, logique propre
```

Métriques séparées. Agrégation interdite.

### CDS ≠ BDB

```
CDS → framework UI/technique (C:\DEV\CDS\)
BDB → application métier (C:\DEV\BIBLE_DE_BLOC\)
```

Les règles UI ne modifient pas les règles métier.
Confondre CDS et BDB = erreur grave (NOYAU BLOC 9).

### approved ≠ user_roles

```
profiles_directory.approved  ← colonne correcte (existence utilisateur validé)
user_roles                   ← rôle applicatif uniquement (admin | member)
```

Lire `approved` depuis `user_roles` = bug E9 (résolu 2026-03-12, ne pas réintroduire).

---

# 6 — RÈGLES CSS OBLIGATOIRES

Chaîne de chargement (ordre strict, tous modules) :

```
1. Bootstrap 5.3.2 (CDN jsdelivr — tag fixe)
2. Bootstrap Icons 1.11.1 (CDN jsdelivr)
3. theme-base.css (CDN menywise/BDB — tag fixe obligatoire — @latest = VIOLATION ACTIVE)
4. theme-print.css (CDN idem) — media="print"
5. css/cds-overrides.css (local)
6. css/[module]-ui.css (local) — un seul par module
```

Règles absolues :

```
INTERDIT-01 : @latest interdit sur tous les CDN — VIOLATION ACTIVE sans exception
INTERDIT-02 : CSS inline (style="...") interdit dans les fichiers HTML
INTERDIT-03 : Un seul fichier CSS par module — pas de CSS croisé
INTERDIT-04 : Toutes les règles matrice scopées à #matrixGrid
INTERDIT-17 : Tout override Bootstrap scopé à son conteneur parent
              Interdit : .form-select { ... }
              Correct  : #modalXxx .form-select { ... }
ANTI-PATTERN E8 : Ne pas réutiliser une classe Bootstrap native
                  pour un usage sémantique custom
```

Règle de validation CSS avant livraison :
Toute classe custom du CSS doit être présente dans le HTML statique
ou dans les templates JS dynamiques. Classe absente = CSS orphelin = supprimer.

---

# 7 — STRATÉGIE DE MIGRATION SUPABASE

Source : NOYAU_VERITE BLOC 10 + JOURNAL_DECISIONS_V1_13_0.

| Phase | Contenu | Statut |
|-------|---------|--------|
| Phase 0 | Nettoyage + fondation | EN COURS (0.1 et 0.2 faits, 0.3 reporté, 0.4 non commencé) |
| Phase 1 | thesaurus + disc + dork + collab + paxis + organisateur | PENDING — après arbitrages A2, A2-dork, A4 |
| Phase 2 | Migration planning → Supabase | PENDING — après arbitrage A1 (schéma) |
| Phase 3 | Refactoring JS + CDS final | PENDING — parallélisable Phase 2 |
| Phase 4 | Déploiement OVH | PENDING — après Phases 1+2+3 |

Ordre de migration Phase 1 :

```
organisateur → paxis → collab → disc → dork → thesaurus
```

Arbitrages bloquants (décision Manu requise) :

```
A1 : schéma planning Supabase      → bloque Phase 2
A2 : schéma disc Supabase          → session dédiée requise
A2-dork : schéma dork Supabase     → session dédiée requise
A3 : schéma carnet_bord            → SOLDÉ (D-2026-03-15-T12)
     schéma objectifs              → PENDING (partiellement soldé)
A4 : schéma collab                 → lire le code avant (arbitrage)
```

Décisions sécurité 2026-03-20 (impact architecture) :

```
D-2026-03-20-T07 : .htaccess OVH + pages erreur + robots.txt
D-2026-03-20-T08 : error_404_logs + page 404 premium (tracking liens cassés)
D-2026-03-20-T09 : Audit RLS complet — 4 tables fix deny-all + 3 arbitrages RLS
                   (transmissions SELECT · profiles_directory SELECT · tag_links DELETE)
```

Règles de migration (toutes phases) :

```
- Schéma validé par Manu AVANT toute ligne de code
- Script migration localStorage → Supabase validé avant exécution
- Recettage admin-test.html obligatoire avant livraison
- Résultat OK/FAIL/WARN consigné dans JOURNAL_DECISIONS
- RLS obligatoire sur données nominatives (planning, profiles)
```

---

# 8 — RÈGLES D'ÉVOLUTION

Toute évolution doit respecter la hiérarchie :

```
1. NOYAU_VERITE_V2_4_0
2. JOURNAL_DECISIONS_V1_13_0
3. CTX_SYSTEM_ARCHITECTURE (ce fichier)
4. CTX_[MODULE].md local
```

Si une modification impacte plusieurs modules :

```
STOP → mettre à jour MODULE_DEPENDENCY_MAP_V1_2_0 → puis continuer
```

Toute nouvelle dépendance inter-modules → entrée JOURNAL_DECISIONS obligatoire.
Aucune suppression de dépendance sans vérifier tous les consommateurs.

---

# 9 — OBJECTIF FINAL DU SYSTÈME

Finalité unique (NOYAU_VERITE BLOC 0) :

```
Améliorer la sécurité du patient
par la transmission du savoir opératoire
```

Le système est conçu depuis un profil DC (D=8, C=7).
Les angles morts de ce profil sont documentés dans NOYAU_VERITE BLOC 0.
PERSONAS_BDB_V1_3_0 est le contrepoids opérationnel.

Toute décision technique, architecturale ou documentaire est précédée de :
> "En quoi cela bénéficie-t-il au patient ?"

---

# HISTORIQUE

```
2026-03-09 — v1.0.0
  Création. Alignement NOYAU_VERITE + CTX modules + décision Supabase exclusif.

2026-03-15 — v2.0.0
  Réécriture complète. Corrections :
  - §4.4 : services fictifs supprimés (auth-service.js etc. n'existent pas)
  - §7 : stratégie migration alignée sur Roadmap Phase 0→4 (NOYAU BLOC 10)
  - Ajout §3.4 principe voix utilisateur + PERSONAS_BDB
  - Ajout couche gouvernance complète avec PERSONAS
  - Ajout frontière approved ≠ user_roles (bug E9)
  - Ajout arbitrages bloquants A1→A4

2026-03-16 — v2.1.0
  NOYAU_REF V2_4_0. JOURNAL_REF V1_9_0.
  §4.2 : bdb-shell.js v1.4.0 + navigation dynamique app_modules.
  §4.3 : app_groups + app_modules ajoutées aux tables transverses.
  §4.5 : statut bdb-shell migré : annuaire ✅ · arsenal ✅ · anatomie ✅ · admin ✅.

2026-03-21 — v2.2.0
  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
  JOURNAL_REF V1_9_0 → V1_13_0 (toutes occurrences — 3 semaines de décisions).
  §3.3 : sessionStorage bdb_shell_* ajouté (D-2026-03-16-P5). Règle "aucune dette
         défendable" inscrite.
  §4.1 : AUDIT_SECURITE_BDB_V1_0_0 ajouté à la couche gouvernance.
  §4.2 : @latest reclassé VIOLATION ACTIVE (plus tolérance Phase 4). Cache
         sessionStorage bdb-shell documenté (D-2026-03-16-P5).
  §4.3 : tag_links DELETE admin (D-2026-03-20-T09). content_relations RLS fix.
         error_404_logs ajouté. RLS visibility app_modules (D-2026-03-16-P6).
  §4.5 : état bdb-shell documenté pour TOUS les modules (migré ✅ / non migré ⚠).
         Règle : tout ⚠ = VIOLATION ACTIVE.
  §6 : @latest reclassé VIOLATION ACTIVE dans INTERDIT-01.
  §7 : A3 carnet_bord soldé (D-2026-03-15-T12). objectifs PENDING.
       Sessions sécurité 2026-03-20 ajoutées (T07, T08, T09).
```
