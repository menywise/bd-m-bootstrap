# CTX_SUPERVISION.md

```
VERSION      : 1.3.0
DATE         : 2026-03-30
MODULE       : supervision
STATUT       : ACTIF — module créé, en cours de recettage


  Arbitrage D-2026-03-30-T11 :
    CRUD app_modules/app_groups transféré vers admin/.
    supervision/ conserve uniquement la lecture (lecture seule).
  PORTEE : CRUD app_modules/app_groups retiré — lecture seule désormais.
  BLOC 1 AUTORISE : écriture app_modules/app_groups retirée.
  BLOC 1 INTERDIT : CRUD app_modules/app_groups ajouté en interdit spécifique.
  BLOC 2 : Tables SOCLE "accessibles en écriture" → "accessibles en lecture seule".
  BLOC 5 : R8 mis à jour (exclusivité CRUD → lecture seule).
  BLOC 6 : anti-pattern CRUD supervision/ mis à jour.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE :
  Module de pilotage de l'infrastructure BDB — état de santé des modules,
  conformité aux règles CHANTIER, visualisation navigation (app_modules/app_groups)
  et historique des sessions de travail.
  Exclusivement accessible aux admins.
  Conçu pour être consulté par un admin d'établissement sans toucher au code.

PORTEE :
  Couvre :
    - Lecture de l'état réel de chaque module (shell, violations, CTX, palier)
    - Audit qualité fichier par fichier contre les règles CHANTIER actives
    - Visualisation app_modules + app_groups — LECTURE SEULE
      (CRUD → admin/ depuis D-2026-03-30-T11)
    - Historique et générateur de prompts de sessions de travail
    - Pipeline de versionnement documentaire :
      dépôt .md → parsing → delta → validation Manu → bascule Supabase
  Hors périmètre :
    - CRUD app_modules / app_groups → admin/ exclusivement (D-2026-03-30-T11)
    - Modification du code source des modules (hors scope définitif)
    - Gestion des utilisateurs (→ module admin/)
    - Déploiement OVH (→ procédure manuelle documentée)
    - Accès aux fichiers .md de gouvernance depuis OVH
      (les .md sont exclusivement locaux — OVH consomme uniquement Supabase)

AUTORISE :
  - Lire app_modules, app_groups (lecture seule — R8)
  - Lire et écrire supervision_config, supervision_rules,
    supervision_rule_delta, supervision_sessions
  - Lire des fichiers locaux via File System API (mode local uniquement)
  - Parser des fichiers .md de gouvernance côté client JS

INTERDIT :
  Interdits fixes (tous les modules) :
    - Toucher à bdb-shell.js, supabase-client.js, bdb-preview.js
    - Toucher à cds-overrides.css sans entree atelier_decisions
    - Dupliquer le bloc auth (INTERDIT-B1)
    - Requêtes profiles_directory ou user_roles (INTERDIT-B2)
    - Modifier les RLS sans entree atelier_decisions
    - Inventer une colonne absente de 02_SUPABASE_DATA_MODEL
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
      (tables SOCLE — supervision y accède en lecture via window.bdb mais ne les possède pas)
    - INSERT/UPDATE/DELETE sur app_modules ou app_groups depuis supervision/
      → admin/ exclusivement (D-2026-03-30-T11)

DEPENDANCES :
  Fixes :
    window.bdbUser     → bdb-shell.js v1.6.0
    window.bdb         → supabase-client.js
    cds-overrides.css  → v1.5.0
  Tables possédées par ce module (supervision_tables.sql) :
    supervision_config · supervision_rules
    supervision_rule_delta · supervision_sessions
  Tables SOCLE accessibles en lecture seule (non possédées) :
    app_modules · app_groups
    ⚠ Lecture seule depuis v1.3.0 — CRUD transféré vers admin/ (D-2026-03-30-T11).
    ⚠ Ne pas recréer ces tables. Ne pas inclure dans supervision_tables.sql.
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

### Tables SOCLE accessibles en lecture seule (non possédées)

```
app_modules  → dans SOCLE (section 15 02_SUPABASE_DATA_MODEL)
app_groups   → dans SOCLE (section 15 02_SUPABASE_DATA_MODEL)
Accès : window.bdb.from('app_modules').select() uniquement
RLS   : is_admin() — déjà en place (D-2026-03-16-P6)
⚠ Lecture seule depuis v1.3.0 (D-2026-03-30-T11) — CRUD → admin/.
⚠ Ne pas recréer ces tables. Ne pas les inclure dans supervision_tables.sql.
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
| **admin** | ✓ tout | ✓ tables propres uniquement | RLS + contrôle JS isAdmin |

⚠ app_modules/app_groups : SELECT admin ✓ · INSERT/UPDATE/DELETE → admin/ module uniquement.

---

## BLOC 4 — CHECKLIST PREMIUM

```
[x] CDS conforme
      Zéro style= statique ✅
      Zéro onclick= inline ✅
      CSS scopé #supervisionApp (INTERDIT-17) ✅
      Chaîne CSS BLOC E respectée ✅

[ ] Documenté
      CTX V1.3.0 à jour ✅
      TRACKER_* mis à jour ✅
      entree atelier_decisions D-2026-03-21-T01 ⏳

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

R8 — app_modules/app_groups : LECTURE SEULE
  Ce module lit app_modules et app_groups pour affichage et audit.
  CRUD (INSERT/UPDATE/DELETE) → admin/ exclusivement (D-2026-03-30-T11).
  Annule l'exclusivité CRUD de supervision/ (ex-R8 v1.2.0).
  Principe : admin/ gère QUI et COMMENT · supervision/ observe et audite.
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
| Recréer app_modules/app_groups dans supervision_tables.sql | Tables SOCLE — déjà existantes | window.bdb.from() SELECT uniquement |
| INSERT/UPDATE/DELETE app_modules dans supervision/ | CRUD interdit depuis D-2026-03-30-T11 | admin/ exclusivement |

---
