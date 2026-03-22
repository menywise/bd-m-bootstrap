# GUIDE_INTEGRATION_MODULE.md

```
VERSION   : 1.0.1
DATE      : 2026-03-16
AUTEUR    : Manu + Claude
STATUT    : RÉFÉRENCE — à charger pour toute session créant un nouveau module
RÔLE      : Checklist complète et séquence d'intégration d'un nouveau module BDB.
            Remplace les instructions dispersées dans NOYAU, CHANTIER et HOW_TO.
RÉFÉRENCE : D-2026-03-16-T03 (app_modules + portail dynamique)
            D-2026-03-15-T09 (templates officiels)
            D-2026-03-15-T11 (pattern C.6 — bouton admin toolbar)
DELTA     : ÉTAPE 2 : TEMPLATE_MODULE_BDB.html corrigé v2.0.0 → v2.0.1 (INTERDIT-E1).
```

---

## PRINCIPE

Depuis la v1.4.0 de `bdb-shell.js`, ajouter un module à BDB est une opération
en 4 étapes. **Zéro modification du code applicatif existant.**

```
ÉTAPE 1 — SQL     : table métier + RLS
ÉTAPE 2 — Code    : index.html + CSS module
ÉTAPE 3 — Seed    : entrée dans app_modules (+ app_groups si nouveau groupe)
ÉTAPE 4 — Tests   : checklist premium
```

Le portail et le menu de navigation se mettent à jour automatiquement dès
l'insertion dans `app_modules`. Aucun fichier HTML à modifier.

---

## ÉTAPE 1 — SQL (table métier + RLS)

### 1.1 Utiliser le template officiel

```
Source  : 01_TEMPLATES\TEMPLATE_MODULE_BDB.sql v2.0.0
Action  : Copier → remplacer [nom_module] → exécuter dans Supabase SQL Editor
```

Le template crée automatiquement :
- La table avec `id uuid PK`, `created_by`, `created_at`, `updated_at`
- Le trigger `updated_at`
- 4 RLS standard : anon_read · member_read · admin_read · admin_write

### 1.2 RLS custom si nécessaire

Si le module a des règles de confidentialité spécifiques (ex : carnet_bord,
où un membre ne lit que ses propres données) → documenter dans le CTX avant
d'écrire les politiques. Ne jamais écrire de RLS de mémoire.

### 1.3 Commande d'exécution (Windows)

```cmd
docker exec -e PGCLIENTENCODING=UTF8 supabase_db_ohccnwyziljqtyrtepel ^
  psql -U postgres -d postgres -f C:\chemin\vers\migration.sql
```

---

## ÉTAPE 2 — Code (index.html + CSS)

### 2.1 Utiliser le template HTML officiel

```
Source      : 01_TEMPLATES\TEMPLATE_MODULE_BDB.html v2.0.1
Destination : modules\[nom_module]\index.html
Variables   : TITRE · ICON · CSS · NOM_TABLE (4 à remplacer)
```

**Ne jamais reconstruire la chaîne HTML de mémoire.**
Le template contient la chaîne de chargement correcte (BLOC E).

### 2.2 Créer le CSS module

```
Fichier     : css\[nom_module]-ui.css
Règle       : Uniquement ce que Bootstrap 5.3 ne couvre pas nativement
Scope       : Tout override Bootstrap doit être scopé au conteneur parent (INTERDIT-17)
```

### 2.3 Checklist code obligatoire

```
□ Chaîne CSS : Bootstrap → BI → theme-base → theme-print → cds-overrides → [module]-ui
□ #bdb-shell PREMIER ENFANT de <main> (INTERDIT-E1)
□ data-module-title et data-module-icon renseignés sur #bdb-shell
□ await window.bdbShellReady en tête du DOMContentLoaded
□ state.isAdmin = window.bdbUser?.isAdmin ?? false
□ Zéro onclick= dans le HTML
□ Zéro style= statique (sauf couleurs dynamiques DB et largeurs progressbar)
□ Zéro Font Awesome — Bootstrap Icons uniquement
□ Un seul fichier CSS module
□ Bouton admin dans la toolbar filtres (pattern C.6 — INTERDIT-C4)
□ Gestion d'erreur Supabase (cds-error-state ou cds-offline-banner)
□ Lien retour portail fonctionnel via offcanvas (injecté par bdb-shell)
```

---

## ÉTAPE 3 — Seed app_modules

C'est l'unique opération qui rend le module visible dans le portail et le menu.

### 3.1 Insertion minimale

```sql
INSERT INTO app_modules
  (key, label, description, icon, color, group_key, path,
   position, status, is_new, new_until, visibility)
VALUES (
  '[nom_module]',                              -- clé technique stable
  '[Libellé affiché]',                         -- ≤ 30 caractères
  '[Description courte pour le portail]',      -- ≤ 12 mots
  'bi-[icon-bootstrap]',                       -- icône Bootstrap Icons
  '#[couleur_hex]',                            -- couleur de la card portail
  '[group_key]',                               -- clé d'un groupe existant dans app_groups
  'modules/[nom_module]/index.html',           -- chemin depuis la racine BDB
  [position],                                  -- entier — ordre dans le groupe
  'coming_soon',                               -- toujours commencer en coming_soon
  false, NULL,
  'member'                                     -- 'member' | 'admin' | 'all'
);
```

**Règle :** toujours démarrer en `status='coming_soon'`. Basculer en `'active'`
uniquement après validation de la checklist premium (ÉTAPE 4).

### 3.2 Activation

```sql
-- Quand le module est prêt et validé :
UPDATE app_modules SET status = 'active' WHERE key = '[nom_module]';

-- Optionnel : badge Nouveau (visible 30 jours par exemple)
UPDATE app_modules SET is_new = true, new_until = CURRENT_DATE + INTERVAL '30 days'
WHERE key = '[nom_module]';
```

### 3.3 Nouveau groupe (si besoin)

```sql
INSERT INTO app_groups (key, label, description, icon, color, position, is_visible)
VALUES (
  '[group_key]',
  '[Libellé groupe]',
  '[Description courte]',
  'bi-[icon]',
  '#[couleur_hex]',
  [position],   -- après les 5 groupes existants
  true
);
```

---

## ÉTAPE 4 — Checklist premium

Un module est **premium** quand il satisfait les 5 critères suivants.
Ne passer en `status='active'` qu'après validation de toute la liste.

```
□ CDS CONFORME
  □ Zéro violation CSS (inline, onclick, scope, chaîne de chargement)
  □ Audit visuel mobile + desktop effectué (INTERDIT-16)
  □ Zéro style= statique — seules couleurs dynamiques DB tolérées

□ DOCUMENTÉ
  □ CTX_[NOM_MODULE].md créé dans 00_GOUVERNANCE\
  □ Entrée JOURNAL_DECISIONS pour la création du module
  □ SUPABASE_DATA_MODEL.md mis à jour si nouvelles tables

□ RÉSILIENT
  □ Gestion explicite des erreurs Supabase (jamais de page blanche)
  □ Message d'erreur actionnable pour l'utilisateur (≤ 12 mots)
  □ cds-error-state ou cds-offline-banner utilisé

□ NAVIGABLE
  □ #bdb-shell injecté et fonctionnel
  □ Lien retour portail accessible depuis l'offcanvas
  □ Titre de module correct dans le header

□ RESPONSIVE
  □ Mobile 375px : lisible, cliquable, pas d'overflow horizontal
  □ Desktop 1280px : mise en page correcte
  □ Touch : zones cliquables ≥ 44px
```

---

## RÉFÉRENCE — Groupes existants

| key | Label | Couleur | Position |
|---|---|---|---|
| `bloc` | Bloc Opératoire | `#0d6efd` | 1 |
| `equipe` | Équipe | `#198754` | 2 |
| `savoir` | Savoir | `#6610f2` | 3 |
| `pilotage` | Pilotage | `#dc3545` | 4 |
| `espace_perso` | Espace Personnel | `#fd7e14` | 5 |

---

## RÉFÉRENCE — Valeurs autorisées

| Champ | Valeurs |
|---|---|
| `status` | `active` · `coming_soon` · `maintenance` |
| `visibility` | `member` · `admin` · `all` |
| `icon` | Toute classe `bi-*` valide Bootstrap Icons 1.11.1 |

---

## CE QUE CE GUIDE NE COUVRE PAS

- Le contenu métier du module → dans son CTX local
- Les règles CDS détaillées → dans CHANTIER_TECHNIQUE
- Les arbitrages de schéma → toujours Manu, jamais l'IA
- La suppression d'un module → toujours Manu, après audit

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-16 | 1.0.0 | Création. Menu dynamique app_modules v2 (D-2026-03-16-T03). |
| 2026-03-16 | 1.0.1 | Audit CTO. ÉTAPE 2 : TEMPLATE_MODULE_BDB.html v2.0.0 → v2.0.1 (D-2026-03-15-T10, INTERDIT-E1). |
