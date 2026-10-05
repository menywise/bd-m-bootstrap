# CTX_SYSTEM_ARCHITECTURE.md

```
VERSION  : 2.4.0
DATE     : 2026-04-03
AUTEUR   : Manu + Claude
STATUT   : CANON — CONTRAT D'ARCHITECTURE SYSTÈME
PORTÉE   : Application BDB complète
MANIFESTE_REF: MANIFESTE_BDB_V1_1_0
JOURNAL_REF: JOURNAL_DECISIONS_V1_34_0
TRACKER_STATUS     : migré
TRACKER_SHELL      : Palier 1 FERMÉ — 25/25 modules
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : Aucune — synchronisation complète 2026-03-29
TRACKER_UPDATED    : 2026-04-03
DELTA    : v2.3.0 → v2.4.0
           MANIFESTE_REF : remplace NOYAU_REF (D-2026-04-03-T01).
           §1 : hiérarchie documentaire mise à jour.
           §3.2 : hiérarchie sources autoritaires mise à jour.
           §4 : modèle "5 couches actives" clarifié — distinct du modèle L1/L2/L3 Manifeste §6.
                §4.1 liste gouvernance mise à jour (NOYAU_VERITE supprimé, MANIFESTE ajouté).
           §8 + §9 : références NOYAU_VERITE mises à jour.
           JOURNAL_REF V1_26_0 → V1_34_0.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce document DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-04-03
FAIT             : Phase B staging TERMINÉE (migrations 027→065, 89 721 interventions).
                   Palier 1 FERMÉ — 25/25 modules sous bdb-shell v1.5.0.
                   CSS soldé — 420 corrections, 21 CSS co-localisés.
                   Thesaurus V2 complet — 460 protocoles, dernier ACT-0481.
                   8 skills Claude Project reconstruits (D-2026-03-29-T01).
                   CONVENTIONS_NOMMAGE V2.5.0 (S1→S4, C1→C7, R1→R28).
                   JOURNAL_DECISIONS V1_34_0.
                   Session #27 : MANIFESTE_BDB V1.0.0 fondateur.
                   Session #28 : Audit documentation — MANIFESTE_BDB V1.1.0.
RESTE À FAIRE    : Recatégoriser ~1 577 PETITE INTERVENTION (notes exploitables).
                   Créer ~25 protocoles NEURO (ACT-0482+).
                   Arbitrages schéma : A1 planning, A2 disc, A2-dork, A4 collab.
                   Doc 3 repo Ewan (migration documentation technique).
                   32_CONVENTIONS → bdb_principes (Olivia/Sophie autonomes).
                   30_BIBLE_DE_BLOC : extraire contenu L1 universel.
VIOLATIONS ACTIVES : @latest CDN BDB (INTERDIT-01 — Phase 4).
```

---

# 1 — RÔLE DU DOCUMENT

Ce document définit l'architecture système globale de BDB.

Il complète :

```
MANIFESTE_BDB_V1_1_0             ← prime sur tout en cas de conflit
PERSONAS_BDB_V1_3_0              ← règle de voix mini-site (rédacteur uniquement)
CTX modules                      ← règles de chaque module
JOURNAL_DECISIONS_V1_34_0        ← décisions validées
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

Finalité unique, non négociable (MANIFESTE_BDB §1) :
> "Améliorer la sécurité du patient par la transmission du savoir opératoire."

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
explicitement documentée dans MODULE_DEPENDENCY_MAP_V1_7_0.md.

---

## 3.2 Principe de noyau documentaire

La vérité du système ne réside jamais dans la conversation.

Hiérarchie des sources autoritaires (ordre de priorité) :

```
1. MANIFESTE_BDB_V1_1_0
2. JOURNAL_DECISIONS_V1_34_0
3. CTX_SYSTEM_ARCHITECTURE (ce fichier)
4. CTX_[MODULE].md local
```

En cas de conflit entre deux sources : la source de rang supérieur prime.
L'IA signale le conflit à Manu — ne jamais arbitrer seul.

---

## 3.3 Principe Supabase exclusif

Décision actée (D-2026-03-09, JOURNAL_DECISIONS_V1_34_0) :

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
thesaurus     ← Supabase (CRUD + enrichi 019/020) · bdb-shell ✅ migré
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

Ce principe compense les angles morts du profil auteur DC (MANIFESTE_BDB §5).

Une IA travaillant sur tout contenu utilisateur doit charger
PERSONAS_BDB_V1_3_0 avant de produire quoi que ce soit.

---

# 4 — COUCHES DU SYSTÈME

BDB est organisé en **5 couches techniques**. Ce modèle décrit la stack système.

> ⚠ NE PAS CONFONDRE avec les 3 couches produit du MANIFESTE_BDB §6 (L1/L2/L3).
> Ces deux modèles sont orthogonaux : les couches techniques décrivent COMMENT le système
> est construit ; les couches produit décrivent QUI est propriétaire de quoi.

---

## 4.1 COUCHE GOUVERNANCE (L3 Atelier)

Rôle : garantir la cohérence du système et compenser les biais structurels.

Contenu :

```
MANIFESTE_BDB_V1_1_0             ← prime sur tout en cas de conflit
JOURNAL_DECISIONS_V1_34_0        ← décisions validées (append-only)
PERSONAS_BDB_V1_3_0              ← règle de voix mini-site (rédacteur uniquement)
CTX_SYSTEM_ARCHITECTURE.md       ← ce fichier
CTX_[MODULE].md                  ← règles de chaque module
MODULE_DEPENDENCY_MAP_V1_7_0.md  ← dépendances réelles inter-modules
SUPABASE_DATA_MODEL_V1_13_0.md   ← modèle de données global
CHANTIER_TECHNIQUE_V1_0_7.md     ← décisions techniques pérennes
AUDIT_SECURITE_BDB_V1_0_0.md     ← audit RLS + sécurité OVH (créé D-2026-03-20-T07)
```

Cette couche est non exécutable. Elle définit les règles.
Elle appartient à la couche L3 (Atelier) du Manifeste — elle ne voyage pas avec le produit.

---

## 4.2 COUCHE SOCLE TECHNIQUE (L1 Produit)

Rôle : infrastructure partagée par tous les modules.

Composants :

```
index.html             ← portail (point d'entrée post-auth)
login.html             ← authentification
reset-password.html
js/supabase-client.js  ← connexion unique (window.bdb + bdbRequireAuth + bdbToast)
js/bdb-shell.js v1.6.0 ← shell universel : header + offcanvas + auth + window.bdbUser
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

## 4.3 COUCHE DONNÉES (L1 + L2)

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
L'IA ne doit jamais décrire ces fichiers comme existants.

Pattern actuel autorisé :

```javascript
const DB = window.bdb  // alias documenté dans certains modules
const { data, error } = await DB.from('ma_table').select('...')
```

Alias autorisé : `const DB = window.bdb` (documenté dans certains modules).

---

## 4.5 COUCHE MODULES MÉTIER (L1 + L2)

**Palier 1 FERMÉ** — 25/25 modules sous bdb-shell v1.5.0 (JOURNAL V1_25_0).

Modules opérationnels (Supabase actif) :

```
planning      ← EXCEPTION : localStorage temporaire → Phase 2 · bdb-shell ✅
annuaire      ← Supabase · bdb-shell ✅
transmissions ← Supabase · bdb-shell ✅
admin         ← Supabase · bdb-shell ✅
supervision   ← Supabase · bdb-shell ✅
```

Modules référentiels (Supabase actif) :

```
fiches        ← Supabase · bdb-shell ✅ · escHtml ✅ · C.9 ✅
anatomie      ← Supabase · bdb-shell ✅
installation  ← Supabase · bdb-shell ✅
arsenal       ← Supabase · bdb-shell ✅
preferences   ← Supabase · bdb-shell ✅
cours         ← Supabase · bdb-shell ✅
thesaurus     ← Supabase · bdb-shell ✅ · CRUD enrichi (018→065)
```

Modules cognitifs (migration Phase 1 — schéma EN ATTENTE) :

```
disc          ← localStorage → Supabase Phase 1 · bdb-shell ✅
paxis         ← localStorage → Supabase Phase 1 · bdb-shell ✅
collab        ← localStorage → Supabase Phase 1 · bdb-shell ✅
organisateur  ← localStorage → Supabase Phase 1 · bdb-shell ✅
```

Modules analytiques / recherche :

```
dork          ← localStorage → Supabase Phase 1 · bdb-shell ✅
```

Modules plateforme :

```
profile       ← Supabase · bdb-shell ✅
mini-site     ← statique (zéro Supabase — intentionnel) · bdb-shell ✅
accueil       ← BRIQUE SUIVANTE · bdb-shell ✅
ged           ← BRIQUE SUIVANTE · bdb-shell ✅
carnet_bord   ← Supabase · bdb-shell ✅
objectifs     ← Supabase · bdb-shell ✅
pedagogie     ← embryonnaire option B · bdb-shell ✅
glossaire     ← Supabase · bdb-shell ✅
template-vierge ← template CDS · bdb-shell ✅
```

Aucune VIOLATION ACTIVE bdb-shell restante.

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

Source : MANIFESTE_BDB §8 + JOURNAL_DECISIONS_V1_34_0.

| Phase | Contenu | Statut |
|-------|---------|--------|
| Phase 0 | Nettoyage + fondation | ✅ TERMINÉ |
| Phase B | Pipeline staging → thesaurus_interventions | ✅ TERMINÉ (migrations 027→065, 89 721 lignes) |
| Phase 1 | disc + dork + collab + paxis + organisateur → Supabase | EN ATTENTE — arbitrages A2, A2-dork, A4 |
| Phase 2 | Migration planning → Supabase | EN ATTENTE — arbitrage A1 (schéma) |
| Phase 3 | Refactoring JS + CDS final (--pe-* → --cds-*) | EN ATTENTE — parallélisable Phase 2 |
| Phase 4 | Déploiement OVH | EN ATTENTE — après Phases 1+2+3 |

Thesaurus — état final :

```
thesaurus_protocoles      = 460 lignes (dernier ACT-0481)
thesaurus_interventions   = 89 721 lignes (2006→2026, ortho+neuro)
thesaurus_chirurgiens     = 12 (10 actifs + 2 retraités)
thesaurus_panseuses       = 142 (119 créées Phase B + 22 existantes + 1 fusionné)
Migrations                = 018→081 (DDL + seeds + enrichissement + Phase B complète)
Conventions nommage       = V2.5.0 (S1→S4, C1→C7, R1→R28)
PETITE INTERVENTION       = 1 577 lignes résiduel (1.8%) — recatégorisation en cours
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
1. MANIFESTE_BDB_V1_1_0
2. JOURNAL_DECISIONS_V1_34_0
3. CTX_SYSTEM_ARCHITECTURE (ce fichier)
4. CTX_[MODULE].md local
```

Si une modification impacte plusieurs modules :

```
STOP → mettre à jour MODULE_DEPENDENCY_MAP_V1_7_0 → puis continuer
```

Toute nouvelle dépendance inter-modules → entrée JOURNAL_DECISIONS obligatoire.
Aucune suppression de dépendance sans vérifier tous les consommateurs.

---

# 9 — OBJECTIF FINAL DU SYSTÈME

Finalité unique (MANIFESTE_BDB §1) :

```
Améliorer la sécurité du patient
par la transmission du savoir opératoire
```

Le système est conçu depuis un profil DC (D=8, C=7).
Les angles morts de ce profil sont documentés dans MANIFESTE_BDB §5.
PERSONAS_BDB_V1_3_0 est le contrepoids opérationnel pour la rédaction.

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
  - §7 : stratégie migration alignée sur Roadmap Phase 0→4
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
  Ajout TRACKER_* + BLOC 0. JOURNAL_REF V1_9_0 → V1_13_0.
  §3.3 : sessionStorage bdb_shell_*. §4.1 : AUDIT_SECURITE ajouté.
  §4.2 : @latest reclassé VIOLATION ACTIVE. §4.3 : tag_links, content_relations, error_404_logs.
  §4.5 : état bdb-shell complet. §6 : @latest VIOLATION ACTIVE INTERDIT-01.

2026-03-29 — v2.3.0
  JOURNAL_REF V1_13_0 → V1_26_0.
  BLOC 0 : Phase B TERMINÉE. Palier 1 FERMÉ (25/25 modules).
  §4.5 : supervision, pedagogie, glossaire, template-vierge ajoutés.
  §7 : Thesaurus état final (ACT-0481, 142 panseuses, conventions V2.3.0).

2026-04-03 — v2.4.0
  Session #28 — audit documentation Manifeste.
  MANIFESTE_REF remplace NOYAU_REF (D-2026-04-03-T01).
  §4 : clarification modèle 5 couches techniques ≠ modèle L1/L2/L3 produit.
  §4.1 : liste gouvernance mise à jour (NOYAU_VERITE → MANIFESTE, versions actualisées).
  §4.2 : bdb-shell.js v1.6.0. Migrations 027→081.
  JOURNAL_REF V1_26_0 → V1_34_0. TRACKER_UPDATED mis à jour.
```
