# CTX_OBJECTIFS_IDE — Contexte module Objectifs IDE

```
VERSION   : 1.2.0
DATE      : 2026-03-19
AUTEUR    : Manu + Claude
STATUT    : MODULE BDB EMBRYONNAIRE — migration Supabase requise
SOURCE    : index-objectifs-ide.html v1.0.0 (2026-01-20, 520 lignes)
            CTX_OBJECTIFS_IDE_V1_0_1.md
  - A1 SOLDÉ : numérotation S2-1 Tables · S2-2 Installation · S2-3 Sécurité ✅
  - A2 SOLDÉ : auto-évaluation IDE uniquement → colonnes validated_by/validated_at supprimées du schéma ✅
  - A3 SOLDÉ : semaines configurables → CRUD admin complet sur objectifs_semaines ✅
  - Schéma objectifs_evaluations épuré (suppression champs validation tuteur)
  - Section ARBITRAGES clôturée
  - Back-office admin : CRUD objectifs_semaines activé
```

---

## 1. RÔLE

Fiche d'objectifs d'intégration IDE bloc opératoire.

Permet d'évaluer la progression d'un IDE nouvel arrivant sur des critères
binaires (OUI / NON) organisés par **semaine** et **objectif thématique**.

**Tout le contenu (semaines, objectifs, critères) est configurable par l'administrateur
depuis le back-office. Aucune donnée métier n'est hardcodée dans le HTML ou le JS.**

---

## 2. NATURE DU MODULE

| Attribut | Valeur |
|---|---|
| Clé technique | `objectifs` |
| Chemin cible | `modules/objectifs/index.html` |
| Chemin actuel (embryon) | `modules/objectifs-ide/index.html` |
| Supabase | **OUI** — 3 tables (voir §5) |
| Authentification | Requise — `bdb-shell.js` |
| Groupe | `equipe` |
| Icône Bootstrap Icons | `bi-clipboard-check` |
| Couleur portail | `#0d6efd` |
| Visibility | `member` (évaluation) + admin (configuration) |

---

## 3. CONTENU MÉTIER COMPLET (extrait du HTML source)

> ⚠ ANOMALIE SOURCE : la Semaine 2 contient deux objectifs numérotés "N°2".
> Le premier traite des tables d'opération, le second de l'installation du patient.
> La numérotation correcte est documentée ci-dessous (N°1 · N°2 · N°3).
> À confirmer avec Manu avant le seed (arbitrage A1).

### Semaine 1 — 4 objectifs · 21 critères

---

**Objectif S1-1 : Organisation générale du Bloc Opératoire et respect des gestes d'hygiène et d'asepsie**

| # | Critère | Détail |
|---|---|---|
| 1 | Respecter une tenue de bloc conforme | |
| 2 | Charlotte ou autre coiffant | |
| 3 | Tenue propre chaque jour | |
| 4 | Absence de bijoux aux doigts | Boucles d'oreilles dans le coiffant |
| 5 | Lavage des mains avant l'entrée dans le bloc puis S.H.A. | |
| 6 | Port du masque chirurgical systématique en salle d'opération | |
| 7 | Sabots de bloc lavables | |
| 8 | Identification des différents locaux du Bloc Opératoire | Vestiaires, salles, SSPI... |
| 9 | Base d'asepsie | |

**Objectif S1-2 : Organisation spécifique**

| # | Critère | Détail |
|---|---|---|
| 1 | S'informer du planning opératoire général | |
| 2 | Repérer le rôle de chacun | |
| 3 | Repérer l'usage de l'ordinateur et les supports écrits existants au Bloc Opératoire | |

**Objectif S1-3 : Accueillir le patient**

| # | Critère | Détail |
|---|---|---|
| 1 | Vérifier l'identité du patient en concordance avec le dossier | NOM, Prénom, Date de naissance |
| 2 | Contrôler côté à opérer, préparation zone opératoire, absence dentier/lentilles, allergie, matériel prothétique, hygiène patient | Liste de contrôle pré-opératoire |
| 3 | Check-list | |
| 4 | Pour les mineurs : autorisation d'opérer des deux parents | |

**Objectif S1-4 : Être garant de la stérilité des D.M. et de l'hygiène en salle**

| # | Critère | Détail |
|---|---|---|
| 1 | Contrôler l'état stérile des instruments utilisés | Étiquette validité stérilité, plomb |
| 2 | Ouvrir stérilement des contenants | Boîtes ou sachets |
| 3 | Noter la traçabilité de la stérilité sur les documents prévus | |
| 4 | Connaître les principes de pré-désinfection des instruments souillés | |
| 5 | Trier et évacuer les DASRI et autres déchets | |

---

### Semaine 2 — 3 objectifs · 16 critères

---

**Objectif S2-1 : Savoir utiliser les tables d'opération**

| # | Critère | Détail |
|---|---|---|
| 1 | Mettre la table en charge | |
| 2 | Utiliser la télécommande | |
| 3 | Mise en proclive, déclive, roulis latéral, billot | |
| 4 | Installation d'appui-bras et cales latérales | |
| 5 | Appuis gynécologiques | |
| 6 | Rallonges de table MAQUET — Table ortho | |
| 7 | Table STERIS | |

**Objectif S2-2 : Connaître les principes d'installation du patient**

| # | Critère | Détail |
|---|---|---|
| 1 | Protéger les téguments | Coussins de la table, rond de tête |
| 2 | Couvrir le patient | Couverture chauffante |
| 3 | Installer les appareils de surveillance per-opératoire | Cardioscope et électrode, brassard à tension, saturomètre |
| 4 | Mettre le patient en position adéquate | DD, DL, position gynéco, demi-assis ±têtière, décubitus ventral, bouée, rond de tête |
| 5 | Connaissances des différentes procédures sur les installations | |
| 6 | Faire la détersion du site opératoire | |

**Objectif S2-3 : Assurer la sécurité du patient**

| # | Critère | Détail |
|---|---|---|
| 1 | Éviter les chutes | Velcro pour les membres, appuis latéraux |
| 2 | Éviter les risques de brûlures électriques | Mise en place d'une plaque neutre |
| 3 | Maîtriser le compte des textiles | |
| 4 | Acheminer les prélèvements anatomopathologiques et bactériologiques en assurant la traçabilité | |
| 5 | Connaître les procédures de prélèvement | |

---

### Synthèse du contenu

| Semaine | Objectifs | Critères |
|---|---|---|
| Semaine 1 | 4 | 21 |
| Semaine 2 | 3 | 16 |
| **Total** | **7** | **37** |

---

## 4. RELATION AVEC LES AUTRES MODULES

| Module | Nature | Sens |
|---|---|---|
| `accueil` | Grille d'intégration 1–6 mois (format livret, 3 statuts : A/ECA/NA) | Complémentaire — grains différents |
| `carnet_bord` | Compétences validées par discipline · évaluation long terme | carnet_bord consomme objectifs |
| `cours` | Référence compétences théoriques | objectifs → cours |
| `profiles_directory` | user_id IDE évalué | objectifs → auth |

**Distinction objectifs / accueil :**

| | `objectifs` | `accueil` |
|---|---|---|
| Horizon | Semaine 1 / Semaine 2 | 1 mois / 3–6 mois |
| Granularité | Critères binaires OUI/NON | Domaines thématiques A/ECA/NA |
| Format source | Fiche d'évaluation formative | Livret d'accueil institutionnel |
| Validateur | IDE lui-même OU tuteur (A2) | IDE lui-même |

> Ces deux modules coexistent. **Fusion interdite.**

---

## 5. SCHÉMA DE DONNÉES

### 5.1 `objectifs_semaines`

```sql
CREATE TABLE objectifs_semaines (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine_num   int  NOT NULL,              -- 1, 2, (extensible)
  label         text NOT NULL,              -- "1ère Semaine"
  description   text,
  position      int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
```

### 5.2 `objectifs_criteres`

```sql
CREATE TABLE objectifs_criteres (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine_id      uuid NOT NULL REFERENCES objectifs_semaines(id) ON DELETE CASCADE,
  objectif_num    int  NOT NULL,            -- N°1, N°2, N°3...
  objectif_label  text NOT NULL,            -- "Organisation générale du Bloc..."
  critere_num     int  NOT NULL,            -- 1, 2, 3...
  critere_label   text NOT NULL,            -- libellé du critère
  critere_detail  text,                     -- précision entre parenthèses (nullable)
  item_key        text NOT NULL UNIQUE,     -- clé stable pour objectifs_evaluations
                                            -- ex : 's1_obj1_c1'
  position        int  NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

> `item_key` doit être **stable et unique** — c'est la FK de `objectifs_evaluations`.
> Convention : `s{semaine_num}_obj{objectif_num}_c{critere_num}`
> Ne jamais modifier une `item_key` existante sans migrer `objectifs_evaluations`.

### 5.3 `objectifs_evaluations`

```sql
CREATE TABLE objectifs_evaluations (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_key       text NOT NULL REFERENCES objectifs_criteres(item_key),
  statut         text NOT NULL CHECK (statut IN ('oui', 'non')),
  -- A2 SOLDÉ : auto-évaluation IDE uniquement — pas de validation tuteur
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, item_key)
);
```

### 5.4 RLS

```
objectifs_semaines, objectifs_criteres :
  anon_read      : SELECT — lecture publique pour affichage
  member_read    : SELECT
  admin_read     : SELECT
  admin_write    : INSERT / UPDATE / DELETE  ← inclut CRUD semaines (A3 soldé)

objectifs_evaluations :
  member_own_read  : SELECT WHERE user_id = auth.uid()
  member_own_write : INSERT / UPDATE WHERE user_id = auth.uid()
  admin_read_all   : SELECT pour role = 'admin' (toutes évaluations)
  -- Pas de admin_write_validation (A2 soldé : auto-évaluation uniquement)
```

---

## 6. ÉTAT TECHNIQUE ACTUEL (embryon)

### 6.1 Fichiers existants

| Fichier | Lignes | Localisation actuelle |
|---|---|---|
| `index-objectifs-ide.html` | 520 | `modules/objectifs-ide/` (embryon) |

### 6.2 Violations CDS exhaustives

| Violation | Ligne(s) | Action requise |
|---|---|---|
| `onclick=` | 49 (`window.print()`) | → `addEventListener('click', () => window.print())` |
| `style=` inline · 21 occurrences | `width: 50px`, `width: 80px` (th de tableaux) | → classes CSS dans `objectifs-ui.css` |
| `<style>` dans `<head>` | 28–32 (CSS print) | → `objectifs-ui.css` |
| Pas de `cds-overrides.css` | absent | → ajouter |
| Pas de `bdb-shell.js` | absent | → brancher `bdb-shell.js v1.4.0` |
| `@latest` CDN BDB | 25–26 | → tag fixe en prod |
| Cellules statiques `bg-light` | tout le corps des tables | → interactivité OUI/NON + Supabase |
| Pas de `supabase-client.js` | absent | → ajouter |
| Numérotation S2 incohérente | deux "OBJECTIF N°2" | → corriger lors du seed (arbitrage A1) |
| Contenu hardcodé | tout le HTML | → charger depuis `objectifs_semaines` + `objectifs_criteres` |

### 6.3 Ce qui est conforme

- Bootstrap 5.3.2 ✅
- Bootstrap Icons 1.11.1 ✅
- Structure `table-responsive` ✅
- CSS print avec classes `no-print` / `page-break` ✅ (à migrer dans CSS module)

---

## 7. ARCHITECTURE MODULE CIBLE

### 7.1 Vue générale

```
index.html
├── bdb-shell (header + offcanvas nav)
├── Toolbar filtres
│   └── [Slot admin masqué] — bouton "Gérer les critères"
├── Semaine 1 (card)
│   ├── Objectif 1 (table interactive)
│   ├── Objectif 2
│   ├── Objectif 3
│   └── Objectif 4
├── Semaine 2 (card)
│   ├── Objectif 1
│   ├── Objectif 2
│   └── Objectif 3
└── Résumé progression (sticky footer ou bandeau)
```

### 7.2 Interactivité OUI / NON

Chaque cellule OUI / NON est un bouton toggle.

- Lecture initiale : `objectifs_evaluations` WHERE `user_id = bdbUser.id`
- Écriture : `upsert` sur `(user_id, item_key)` à chaque clic
- État visuel :
  - OUI coché → cellule `bg-success-subtle` + icône `bi-check-circle-fill`
  - NON coché → cellule `bg-danger-subtle` + icône `bi-x-circle-fill`
  - Non renseigné → cellule `bg-light` (état par défaut)

### 7.3 Résumé progression

Bandeau en haut de chaque semaine :
- `X / Y critères renseignés` · barre de progression Bootstrap `.progress`
- `X OUI · Y NON · Z à renseigner`

### 7.4 Back-office admin

Masqué si `!isAdmin`. Pattern C.6 (toolbar slot).

Fonctions :
- CRUD `objectifs_semaines` ← **actif (A3 soldé : configurables)**
- CRUD `objectifs_criteres` (par semaine / objectif)
- Vue lecture : progression de tous les membres (par IDE, par semaine, par critère)
- Pas de validation tuteur (A2 soldé : auto-évaluation uniquement)

### 7.5 Print

Comportement print conservé et amélioré :
- `@media print` dans `objectifs-ui.css` (plus de `<style>` inline)
- Masquer toolbar, bdb-shell, boutons toggle
- Imprimer les tableaux avec cases OUI/NON cochées si renseignées

---

## 8. ARBITRAGES — TOUS SOLDÉS ✅

| Ref | Question | Décision | Date |
|---|---|---|---|
| A1 | Numérotation Semaine 2 | S2-1 Tables · S2-2 Installation · S2-3 Sécurité ✅ | 2026-03-19 |
| A2 | Qui évalue | IDE s'auto-évalue uniquement — pas de validation tuteur ✅ | 2026-03-19 |
| A3 | Semaines configurables | Oui — CRUD admin complet sur objectifs_semaines ✅ | 2026-03-19 |

> Aucun arbitrage en attente. Le seed peut être généré.

---

## 9. ENTRÉE app_modules

```sql
INSERT INTO app_modules
  (key, label, description, icon, color, group_key, path,
   position, status, is_new, new_until, visibility)
VALUES (
  'objectifs',
  'Objectifs IDE',
  'Fiche d''évaluation semaine par semaine',
  'bi-clipboard-check',
  '#0d6efd',
  'equipe',
  'modules/objectifs/index.html',
  2,
  'coming_soon',
  false, NULL,
  'member'
);
```

> Passer en `status='active'` après A1-A3 tranchés + seed exécuté + checklist premium validée.

---

## 10. AUTORISÉ / INTERDIT

```
AUTORISÉ :
  - Lire et modifier le HTML embryon existant
  - Générer le seed.sql une fois A1-A3 tranchés
  - Créer les 3 tables via template SQL BDB
  - Réécrire index.html en chargeant depuis Supabase

INTERDIT :
  - Créer les tables avant A1 (numérotation semaine 2 à confirmer)
  - Fusionner objectifs et accueil — deux modules distincts
  - Fusionner objectifs et carnet_bord — deux modules distincts
  - Hardcoder des critères dans le HTML ou le JS après migration
  - Modifier une item_key existante dans objectifs_criteres
    sans migrer objectifs_evaluations simultanément
  - Qualifier le module comme "actif" avant la checklist premium
```

---

## 11. CHECKLIST PREMIUM (avant activation)

```
□ CDS CONFORME
  □ Zéro onclick= (print migré → addEventListener)
  □ Zéro style= statique (widths migré → objectifs-ui.css)
  □ Zéro <style> dans <head> (CSS print → objectifs-ui.css)
  □ cds-overrides.css chargé
  □ Chaîne CSS correcte : Bootstrap → BI → theme-base → theme-print → cds-overrides → objectifs-ui
  □ Audit visuel mobile 375px + desktop 1280px

□ DOCUMENTÉ
  □ CTX_OBJECTIFS_IDE_V1_1_0.md présent dans 00_GOUVERNANCE\
  □ entree atelier_decisions : création module
  □ SUPABASE_DATA_MODEL.md mis à jour : 3 nouvelles tables
  □ CHANTIER_TECHNIQUE F.3 mis à jour : objectifs → chemin modules/objectifs/

□ DONNÉES
  □ 3 tables créées via template SQL
  □ seed.sql exécuté (2 semaines + 7 objectifs + 37 critères)
  □ Numérotation S2 conforme : S2-1 Tables · S2-2 Installation · S2-3 Sécurité

□ RÉSILIENT
  □ Gestion erreur Supabase sur chaque fetch
  □ Message d'erreur actionnable ≤ 12 mots
  □ cds-error-state ou cds-offline-banner

□ NAVIGABLE
  □ #bdb-shell injecté et fonctionnel
  □ Lien retour portail accessible
  □ Titre correct dans le header

□ RESPONSIVE
  □ Mobile 375px : tableaux lisibles sans overflow
  □ Desktop 1280px : mise en page correcte
  □ Touch : cellules OUI/NON ≥ 44px de hauteur
```

---
