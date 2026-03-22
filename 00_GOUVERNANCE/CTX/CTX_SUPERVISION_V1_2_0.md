# CTX_SUPERVISION.md

```
VERSION      : 1.2.0
DATE         : 2026-03-21
MODULE       : supervision
STATUT       : ACTIF — module créé, en cours de recettage
NOYAU_REF    : NOYAU_VERITE_V2_4_0
CHANTIER_REF : CHANTIER_TECHNIQUE_V1_0_6
DATA_REF     : SUPABASE_DATA_MODEL_V1_4_0
SHELL_REF    : bdb-shell.js v1.4.0

TRACKER_STATUS     : en_cours
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS :
TRACKER_UPDATED    : 2026-03-21
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

FAIT :
  - CTX V1.0.0 créé et validé
  - supervision_tables.sql exécuté (local + cloud) — 4 tables + RLS + seed
  - supervision_app_modules.sql exécuté — module en coming_soon dans app_modules
  - modules/supervision/index.html produit (4 onglets fonctionnels)
  - css/supervision-ui.css produit
  - Bugs corrigés :
      · Détection mode local/OVH — hostname vs showDirectoryPicker
      · input[type=file] position:absolute couvrant tout l'onglet conformité
      · loadSante() sans champ id — modale édition retournait undefined
      · Redirect bloquante en local dev pour l'admin
  - Hallucinations corrigées :
      · window.bdbToast() inexistant → showToast() Bootstrap natif autonome
      · isAdmin ?? true dangereux en mode preview → logique hostname sécurisée
  - Évolutions livrées :
      · Clic card Santé → modale config directe
      · Distinction visuelle admin (bleu) / member (vert)
  - Arbitrage A-ADMIN-SUPERV (D-2026-03-21-ADMIN-SUPERV) :
      · app_modules + app_groups → supervision/ exclusivement
      · PORTEE, BLOC 2, BLOC 5, BLOC 6 mis à jour en conséquence
  - CHANTIER_REF V1_0_6 confirmé existant (aligné avec template-vierge)

RESTE À FAIRE :
  - Recettage complet checklist premium BLOC 4
  - Test responsive mobile
  - Activer status='active' dans app_modules après checklist [5/5]
  - Entrée JOURNAL_DECISIONS D-2026-03-21-T01 (session création module)

VIOLATIONS ACTIVES : aucune

VIOLATIONS RÉSOLUES :
  - showToast() fantôme (window.bdbToast) : résolu 2026-03-21
  - isAdmin ?? true (risque mode preview) : résolu 2026-03-21
```

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE :
  Module de pilotage de l'infrastructure BDB — état de santé des modules,
  conformité aux règles CHANTIER, configuration navigation (app_modules/app_groups)
  et historique des sessions de travail.
  Exclusivement accessible aux admins.
  Conçu pour être configuré par un admin d'établissement sans toucher au code.

PORTEE :
  Couvre :
    - Lecture de l'état réel de chaque module (shell, violations, CTX, palier)
    - Audit qualité fichier par fichier contre les règles CHANTIER actives
    - CRUD app_modules + app_groups — EXCLUSIVITÉ DE CE MODULE
      (D-2026-03-21-ADMIN-SUPERV — admin/ n'a pas ce droit)
    - Historique et générateur de prompts de sessions de travail
    - Pipeline de versionnement documentaire :
      dépôt .md → parsing → delta → validation Manu → bascule Supabase
  Hors périmètre :
    - Modification du code source des modules (hors scope définitif)
    - Gestion des utilisateurs (→ module admin/)
    - Déploiement OVH (→ procédure manuelle documentée)
    - Accès aux fichiers .md de gouvernance depuis OVH
      (les .md sont exclusivement locaux — OVH consomme uniquement Supabase)

AUTORISE :
  - Lire et écrire app_modules, app_groups (EXCLUSIVITÉ — voir R8)
  - Lire et écrire supervision_config, supervision_rules,
    supervision_rule_delta, supervision_sessions
  - Lire des fichiers locaux via File System API (mode local uniquement)
  - Parser des fichiers .md de gouvernance côté client JS

INTERDIT :
  Interdits fixes (tous les modules) :
    - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
    - Toucher à cds-overrides.css sans entrée JOURNAL_DECISIONS
    - Dupliquer le bloc auth (INTERDIT-B1)
    - Requêtes profiles_directory ou user_roles (INTERDIT-B2)
    - Modifier les RLS sans entrée JOURNAL_DECISIONS
    - Inventer une colonne absente de SUPABASE_DATA_MODEL_V1_4_0
    - Ajouter style= statique dans le HTML (INTERDIT-C2)
    - Ajouter onclick= dans le HTML (addEventListener uniquement)
    - Tout innerHTML avec donnée DB sans escHtml() (INTERDIT-C6)
  Interdits spécifiques :
    - Stocker des fichiers .md de gouvernance sur OVH ou Supabase Storage
    - Basculer des règles sans validation explicite Manu
    - Permettre à un role=member d'accéder au module
    - Appeler window.bdbToast() — inexistant dans bdb-shell.js
    - Appeler cdsShowGridError() — non confirmé dans bdb-shell.js
    - Recréer les tables app_modules/app_groups sous supervision/
      (ces tables appartiennent au SOCLE — supervision y accède en écriture
      via window.bdb.from() mais ne les possède pas)

DEPENDANCES :
  Fixes :
    window.bdbUser     → bdb-shell.js v1.4.0
    window.bdb         → supabase-client.js
    cds-overrides.css  → v1.5.0
  Tables possédées par ce module (supervision_tables.sql) :
    supervision_config · supervision_rules
    supervision_rule_delta · supervision_sessions
  Tables SOCLE accessibles en lecture/écriture (non possédées) :
    app_modules · app_groups
    ⚠ Ces tables sont dans le SOCLE — ne jamais les recréer sous supervision/
  Browser API :
    File System API (showDirectoryPicker / showOpenFilePicker)
    → mode local uniquement — détection : window.location.hostname
```

---

## BLOC 2 — TABLES SUPABASE

### Tables possédées (supervision_tables.sql)

#### supervision_config
```
État : Créée + seed 7 lignes (2026-03-21)
RLS  : SELECT / ALL → is_admin() uniquement
```

#### supervision_rules
```
État : Créée + seed 19 règles CHANTIER V1.0.6 actives (2026-03-21)
RLS  : SELECT / ALL → is_admin() uniquement
```

#### supervision_rule_delta
```
État : Créée, vide (2026-03-21)
RLS  : SELECT / ALL → is_admin() uniquement
```

#### supervision_sessions
```
État : Créée, vide (2026-03-21)
RLS  : SELECT / ALL → is_admin() uniquement
```

### Tables SOCLE accessibles en écriture (non possédées)

```
app_modules  → dans SOCLE (section 14 SUPABASE_DATA_MODEL_V1_4_0)
app_groups   → dans SOCLE (section 14 SUPABASE_DATA_MODEL_V1_4_0)
Accès : window.bdb.from('app_modules') / window.bdb.from('app_groups')
RLS   : is_admin() — déjà en place (D-2026-03-16-P6)
⚠ Ne pas recréer ces tables. Ne pas les inclure dans supervision_tables.sql.
  Supervision y accède en écriture mais ne les possède pas.
```

### Règle E9
```
Ce module NE FAIT JAMAIS de requête profiles_directory ou user_roles.
window.bdbUser.isAdmin est la source unique de contrôle d'accès.
```

---

## BLOC 3 — MATRICE D'ACCÈS

| Qui | SELECT | INSERT/UPDATE/DELETE | Note |
|-----|--------|----------------------|------|
| **anon** | ✗ | ✗ | Redirigé login par bdb-shell |
| **member** | ✗ | ✗ | Invisible via RLS P6 + redirect JS |
| **admin** | ✓ tout | ✓ tout | RLS + contrôle JS isAdmin |

---

## BLOC 4 — CHECKLIST PREMIUM

```
[x] CDS conforme
      Zéro style= statique ✅
      Zéro onclick= inline ✅
      CSS scopé #supervisionApp (INTERDIT-17) ✅
      Chaîne CSS BLOC E respectée ✅

[ ] Documenté
      CTX V1.2.0 à jour ✅
      TRACKER_* mis à jour ✅
      Entrée JOURNAL_DECISIONS D-2026-03-21-T01 ⏳

[x] Résilient
      3 états UI C.9 présents ✅
      escHtml() sur tout innerHTML DB ✅
      Dégradation gracieuse mode OVH ✅
      showToast() Bootstrap natif autonome ✅

[x] Navigable
      data-module-title="Supervision" ✅
      data-module-icon="bi-shield-check" ✅

[ ] Responsive
      Desktop ✅ — Mobile ⏳
```

**État actuel** : `[3/5]`

---

## BLOC 5 — RÈGLES MÉTIER SPÉCIFIQUES

```
R1 — DEUX MODES
  Détection : hostname === 'localhost' | '127.0.0.1' | ''
  Local : File System API + parsing .md disponibles
  OVH   : Supabase uniquement — bandeau informatif

R2 — PIPELINE DOCUMENTAIRE VERSIONNÉ
  1. Dépôt .md via showOpenFilePicker()
  2. Parser JS extrait INTERDIT-* par regex
  3. Delta affiché vs règles actives
  4. Pending — règles actives inchangées
  5. Validation Manu → bascule Supabase
  Bloquant sans validation.

R3 — RÈGLES D'AUDIT JAMAIS HARDCODÉES
  Lues depuis supervision_rules WHERE is_active=true.
  Si vide → alerte explicite. Jamais de faux "conforme".

R4 — VISIBILITÉ app_modules
  Disque sans app_modules → "Non référencé"
  app_modules sans disque → "Fichier manquant"
  Jamais de conclusion silencieuse.

R5 — LOGIQUE isAdmin
  bdbUser défini + isAdmin=true  → accès
  bdbUser défini + isAdmin=false → redirect ../../index.html
  bdbUser undefined + localhost  → accès dev local
  bdbUser undefined + autre host → pas de redirect, pas admin

R6 — REVENDABILITÉ
  Zéro référence hardcodée établissement.
  Tout lu depuis app_groups + app_modules.

R7 — TOAST AUTONOME
  showToast() Bootstrap natif — pas de dépendance externe.
  window.bdbToast() inexistant — ne jamais appeler.
  cdsShowGridError() non confirmé — ne jamais appeler.

R8 — EXCLUSIVITÉ app_modules/app_groups
  Ce module est le seul point d'entrée CRUD pour app_modules et app_groups.
  admin/ n'a pas ce droit (D-2026-03-21-ADMIN-SUPERV).
  Toute session qui tente d'ajouter ce CRUD dans admin/ viole cet arbitrage.
  Principe : admin/ gère QUI · supervision/ gère COMMENT.
```

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

| Anti-pattern | Erreur | Correct |
|---|---|---|
| INTERDIT-* en dur dans le JS | Code figé | supervision_rules WHERE is_active=true |
| Conclure "inexistant" sur absence disque | Faux négatif | Croiser app_modules + disque |
| Parser .md sans delta | Régression silencieuse | Pipeline R2 bloquant |
| Module visible par member | Fuite d'information | isAdmin + RLS P6 |
| .md stockés sur OVH | Exposition gouvernance | .md locaux uniquement |
| window.bdbToast() | Fonction fantôme | showToast() interne |
| cdsShowGridError() | Non confirmé | États UI C.9 internes |
| showDirectoryPicker comme détecteur local | Présent partout dans Chrome | window.location.hostname |
| isAdmin ?? true | Laisse passer le mode preview | Logique R5 |
| Recréer app_modules/app_groups dans supervision_tables.sql | Tables SOCLE — déjà existantes | window.bdb.from() uniquement |
| CRUD app_modules dans admin/ | Chevauchement interdit | supervision/ exclusivement (R8) |

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : supervision
OBJECTIF SESSION    : [1 phrase factuelle]
FICHIERS IN SCOPE   : modules/supervision/index.html · css/supervision-ui.css
FICHIERS HORS SCOPE : bdb-shell.js · supabase-client.js · admin/ · tous autres modules

Fichiers à charger :
  [ ] SESSION_STATE.md
  [ ] CTX_SUPERVISION.md (ce fichier)
  [ ] modules/supervision/index.html

Si SESSION_STATE.md absent :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS_V1_13_0.md
  [ ] CHANTIER_TECHNIQUE_V1_0_6.md
  [ ] Ce fichier CTX
```

---

## BLOC 8 — RÈGLE DE CLÔTURE (obligatoire)

```
1. Mettre à jour BLOC 0
2. Mettre à jour TRACKER_*
3. Mettre à jour BLOC 4
4. Inscrire dans JOURNAL_DECISIONS
5. Incrémenter VERSION
```

---

## BLOC 9 — HISTORIQUE

| Date | Version | Action | Auteur |
|------|---------|--------|--------|
| 2026-03-21 | 1.0.0 | Création — architecture, 4 tables, 2 modes, pipeline documentaire | Manu + Claude |
| 2026-03-21 | 1.1.0 | Clôture session — module produit. Bugs + hallucinations corrigés. BLOC 4 : 3/5. Anti-patterns et règles R5/R7 ajoutés. | Manu + Claude |
| 2026-03-21 | 1.1.1 | JOURNAL_REF corrigé V1_14_0 → V1_13_0. TRACKER_VIOLATIONS : formulation narrative → vide. | Manu + Claude |
| 2026-03-21 | 1.2.0 | Arbitrage A-ADMIN-SUPERV : exclusivité CRUD app_modules/app_groups documentée. PORTEE, BLOC 2, BLOC 5 (R8), BLOC 6 mis à jour. Distinction tables possédées vs tables SOCLE accessibles. CHANTIER_REF V1_0_6 confirmé. | Manu + Claude |
