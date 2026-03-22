# GUIDE_TRAVAIL_SESSION_BDB.md
```
VERSION   : 1.2.2
DATE      : 2026-03-22
AUTEUR    : Manu + Claude
STATUT    : DOCUMENT FORMATEUR — charger à chaque nouvelle session
RÔLE      : Protocole de travail anti-régression, anti-hallucination.
            Guide Manu vers un développement professionnel premium.
            Remplace le HOW_TO_SESSION_BDB pour la partie opérationnelle.
NOYAU_REF : NOYAU_VERITE_V2_4_0
COMPLÈTE  : CHANTIER_TECHNIQUE_V1_0_5
DELTA     : V1.2.1 → V1.2.2 (D-2026-03-22-CSS-01) :
            BLOC 1 : 4e ennemi ajouté — Hallucination CSS.
            BLOC 2 Étape 1 : CDS_REFERENCE.md ajouté (si CSS/HTML).
            BLOC 5 : IA-9 ajouté — vérification CDS_REFERENCE avant tout CSS.
            BLOC 6 : case □ CDS_REFERENCE consulté ajoutée.
            BLOC 9 : lignes CSS et HTML mises à jour.
```

---

## POURQUOI CE DOCUMENT EXISTE

Un an de développement a produit :
- 17 fichiers à reconstruire pour changer un lien dans le menu
- Des bugs redécouverts à chaque session
- Des règles appliquées dans une session, oubliées dans la suivante
- Des audits hebdomadaires pour retrouver ce qui a régressé

Ce document pose les règles permanentes qui empêchent cela.
Il est court. Il est opérationnel. Il ne se relit pas — il se suit.

---

## BLOC 1 — LES 4 ENNEMIS ET LEURS ANTIDOTES

| Ennemi | Cause | Antidote |
|---|---|---|
| **Hallucination** | L'IA invente ce qui manque | Fichiers autoritatifs chargés en premier |
| **Régression** | Une règle oubliée entre deux sessions | CHANTIER_TECHNIQUE chargé systématiquement |
| **Reconstruction** | Modifier 17 fichiers pour changer 1 ligne | bdb-shell.js — le PHP include de BDB |
| **Hallucination CSS** | L'IA réinvente des classes déjà définies | CDS_REFERENCE.md chargé avant tout CSS/HTML |

---

## BLOC 2 — OUVERTURE DE SESSION (protocole obligatoire)

### Étape 1 — Fournir ces fichiers dans cet ordre

```
1. NOYAU_VERITE_V2_4_0.md           ← prime sur tout
2. JOURNAL_DECISIONS_V[DERNIERE].md ← décisions validées
3. CHANTIER_TECHNIQUE_V1_0_5.md     ← architecture technique
4. CTX_[MODULE_EN_COURS].md         ← selon le périmètre
5. CDS_REFERENCE.md                 ← si session CSS ou HTML (OBLIGATOIRE)
```

Sans étape 1 et 3 : la session est invalide.
Sans étape 5 si la session touche au CSS ou HTML : hallucination CSS garantie.

### Étape 2 — Déclarer le périmètre

```
MODULE EN COURS    :
OBJECTIF SESSION   : (1 phrase — pas d'ambiguïté)
FICHIERS IN SCOPE  : (liste fermée)
FICHIERS HORS SCOPE: (explicite)
```

### Étape 3 — Vérifier le statut du chantier

Avant de coder : consulter BLOC G du CHANTIER_TECHNIQUE.
Les étapes 1 et 2 (bdb-shell.js + admin) sont validées.
La navigation BDB est désormais dynamique (app_groups + app_modules v1.4.0).
L'étape 3 (propagation bdb-shell aux 7 modules restants) est le prochain chantier actif.

---

## BLOC 3 — LES PALIERS DE MATURITÉ

BDB progresse par paliers. Chaque palier est un prérequis du suivant.

```
PALIER 0 — DOCUMENTÉ ✅
  ✅ NOYAU_VERITE V2.4.0
  ✅ JOURNAL_DECISIONS V1.9.0 (T01-T07 inscrits session 2026-03-16)
  ✅ CHANTIER_TECHNIQUE V1.0.3
  ✅ GUIDE_TRAVAIL_SESSION V1.2.0
  ✅ CTX_PEDAGOGIE V1.1.0
  ✅ Doctrine embryonnaires documentée (T07)
  ✅ bdb-shell.js v1.4.0 — navigation dynamique app_modules
  ✅ admin migré vers bdb-shell
  ✅ annuaire migré vers bdb-shell (T01)
  ✅ arsenal migré vers bdb-shell (T02)
  ✅ app_groups + app_modules créées et peuplées (T03)
  ✅ Portail index.html reconstruit dynamique (T03)
  ✅ GUIDE_INTEGRATION_MODULE V1.0.0
  ✅ ARCHITECTURE_ADMIN_BDB V1.0.0
  ✅ CDS_REFERENCE.md créé (D-2026-03-22-CSS-01)
  ✅ cds-overrides.css v1.6.0 (audit + corrections)

PALIER 1 — SHELL UNIFIÉ (en cours)
  ✅ js/bdb-shell.js v1.4.0 créé et testé
  ✅ Navigation dynamique depuis app_modules — modifier un lien = 1 UPDATE SQL
  ✅ Modules migrés : admin · anatomie · annuaire · arsenal
  ⏳ 7 autres modules Supabase à migrer :
     fiches · transmissions · cours · installation · preferences · thesaurus · carnet_bord
  → Critère de sortie : tous les modules Supabase sur bdb-shell

PALIER 2 — CSS PROPRE
  ⏳ Audit [module]-ui.css × 7 + corrections (BACKLOG #7)
  ⏳ Script Python remplacement HTML (BACKLOG #7)
  ⏳ btn-ghost, badge-fn-*, btn-xs scopés
  ⏳ config.js retiré de tous les modules
  → Critère de sortie : zéro style= statique, zéro violation INTERDIT-17 non documentée,
    zéro classe réinventée déjà dans CDS_REFERENCE.md

PALIER 3 — MODULES LEGACY PHASE 1
  ⏳ dork : FA→BI, onclick JS → addEventListener
  ⏳ disc : migration Supabase (arbitrage A2)
  ⏳ organisateur/paxis/collab : migration Supabase
  → Critère de sortie : 0 localStorage métier hors planning

PALIER 4 — THESAURUS CRUD COMPLET
  ⏳ 5 TODO câblés : update/insert/delete protocoles + import données
  → Critère de sortie : thesaurus 100% Supabase, 0 mock

PALIER 5 — PLANNING MIGRATION
  ⏳ Arbitrage A1 (schéma Supabase planning)
  ⏳ Migration localStorage → Supabase
  → Critère de sortie : 0 localStorage dans planning

PALIER 6 — BRIQUES SUIVANTES
  ⏳ pedagogie/ : session B (CDS compliance + assets JS)
  ⏳ carnet-bord/ → carnet_bord/ : migration + CTX
  ⏳ objectifs-ide/ → objectifs/ : migration + CTX
  ⏳ ged/ : créer from scratch statique
  ⏳ accueil/ : créer from scratch statique
  → Critère de sortie : tous les embryons ont leur CTX + option validée

PALIER 7 — PRODUCTION
  ⏳ @latest → tag fixe
  ⏳ Déploiement OVH
  → Critère de sortie : 100% modules Supabase, 0 dette CDS
```

**Règle absolue : ne pas sauter de palier.**
Créer un nouveau module avant que bdb-shell.js soit propagé = créer de la dette immédiatement.

---

## BLOC 4 — RÈGLES DU PRODUCTEUR (Manu)

Ces règles s'appliquent à chaque session.

```
R1 — Ne valider aucune règle en conversation.
     Écrire dans un fichier ou ce n'est pas valide.

R2 — Avant de demander "fait-moi ce module",
     vérifier que le palier requis est atteint.

R3 — Chaque session se ferme avec :
     - Les décisions produites inscrites dans JOURNAL_DECISIONS
     - Le palier courant mis à jour dans ce document (BLOC 3)

R4 — Si deux règles se contredisent :
     signaler → ne pas continuer → trancher → documenter.

R5 — Le zip de sources fourni à l'IA doit être la version TERRAIN.
     Pas une copie partielle. Pas un fichier isolé.
```

---

## BLOC 5 — RÈGLES DE L'IA (à appliquer systématiquement)

```
IA-1 — Avant tout code, lire les 4 documents d'ouverture de session.
        Ne pas produire une ligne sans les avoir.

IA-2 — Avant de créer un fichier HTML, vérifier :
        • bdb-shell.js existe-t-il ? (si non → ÉTAPE 1 d'abord)
        • Le CSS module existe-t-il ?
        • Le module est-il dans le scope déclaré ?

IA-3 — Avant de modifier un module existant :
        • Lire le CTX du module
        • Vérifier qu'aucun INTERDIT du CHANTIER_TECHNIQUE n'est violé
        • Lister les violations trouvées avant de les corriger

IA-4 — Toute violation CSS détectée = signalée AVANT le code.
        Pas de "j'ai corrigé au passage" sans notification.

IA-5 — Si une information manque → la déclarer manquante.
        Jamais inventer. Jamais compléter un silence.

IA-6 — Tout code produit doit respecter la chaîne HTML du CHANTIER_TECHNIQUE BLOC E.
        Pas d'exception sans entrée JOURNAL_DECISIONS.
        #bdb-shell = PREMIER ENFANT de <main> (INTERDIT-E1).

IA-7 — window.bdbUser est le seul point d'accès à l'utilisateur dans les modules.
        Jamais de requête profiles_directory ou user_roles dans un module.

IA-8 — Un module embryonnaire n'est jamais qualifié d'"orphelin" ou d'"égaré".
        Signaler → attendre décision Manu.

IA-9 — Avant d'écrire la moindre classe CSS dans un [module]-ui.css,
        consulter CDS_REFERENCE.md dans cet ordre :
          1. La classe existe dans theme-base.css ? → utiliser dans le HTML
          2. La classe existe dans cds-overrides.css ? → utiliser dans le HTML
          3. Bootstrap 5.3 la couvre ? → utiliser la classe BS dans le HTML
          4. Absent des 3 couches → créer .préfixe-* scopé #moduleApp
        Jamais recréer une classe déjà définie dans CDS_REFERENCE.md.
        Jamais de @keyframes sans préfixe [module]-.
```

---

## BLOC 6 — CHECKLIST DE LIVRAISON MODULE

Avant de considérer un module comme "prêt" :

```
□ CDS_REFERENCE.md consulté avant tout CSS (IA-9)
□ Chaîne CSS correcte (Bootstrap → BI → theme-base → theme-print → cds-overrides → module-ui)
□ bdb-shell.js chargé + <div id="bdb-shell" ...> PREMIER ENFANT de <main>
□ window.bdbUser utilisé (pas de requête auth locale)
□ Zéro onclick= dans le HTML
□ Zéro style= statique (seuls category.color et width:${pct}% tolérés)
□ Zéro Font Awesome
□ Un seul fichier CSS ([module]-ui.css)
□ Overrides Bootstrap dans [module]-ui.css scopés au conteneur parent
□ Zéro classe réinventée déjà dans CDS_REFERENCE.md
□ Zéro @keyframes sans préfixe [module]-
□ cds-thumbnail/cds-thumbnail-lg pour les images fixes
□ Lien retour portail fonctionnel (../../index.html)
□ Gestion erreur Supabase (cds-error-state ou cds-offline-banner)
□ Responsive vérifié (mobile + desktop)
□ CTX du module à jour dans 00_GOUVERNANCE/
□ Entrée JOURNAL_DECISIONS si décision prise
```

Si une case est vide → le module n'est pas prêt.

---

## BLOC 7 — PRIORITÉ ABSOLUE DES SESSIONS À VENIR

```
SESSION N+1 : Onglet "Navigation" dans admin/ — CRUD app_groups + app_modules
              (après arbitrages Q1-Q3 de ARCHITECTURE_ADMIN_BDB)
SESSION N+2 : Migrer les 7 modules Supabase restants vers bdb-shell
              fiches · transmissions · cours · installation · preferences · thesaurus · carnet_bord
SESSION N+3 : Onglet "Tableau de bord" admin/ + corrections CSS Palier 2
SESSION N+4 : pedagogie/ option B (CDS compliance + assets JS)
SESSION N+5 : dork correction CDS + disc arbitrage A2
SESSION N+6 : Thesaurus CRUD Supabase (5 TODO)
SESSION N+7 : Modules localStorage Phase 1 (arbitrage A2, A4)
```

Ces sessions sont dans cet ordre. L'ordre n'est pas négociable.
Chaque session commence par : "Je suis à SESSION N+X, voici les fichiers."

---

## BLOC 8 — QUESTIONS BLOQUANTES EN ATTENTE (arbitrage Manu)

| Réf | Question | Impact si non tranché |
|---|---|---|
| A1 | Schéma Supabase planning (tables, RLS) | Bloque migration planning (Palier 5) |
| A2 | Schéma Supabase disc | Bloque migration disc (Palier 3) |
| A2-dork | Schéma Supabase dork | Bloque migration dork (Palier 3) |
| A3 | Schéma objectifs / progression | objectifs PENDING (carnet_bord soldé) |
| A4 | Schéma collab (lire le code avant) | Bloque migration collab (Palier 3) |
| Q1 | Structure 4 onglets admin/ validée ? | Bloque SESSION N+1 |
| Q2 | "Simuler vue membre" : onglet Navigation ou bouton global ? | Bloque SESSION N+1 |
| Q3 | Qui peut modifier app_modules : admin technique uniquement ou cadres ? | RLS SESSION N+1 |

---

## BLOC 9 — DOCUMENTS À CHARGER SELON L'OBJECTIF SESSION

| Objectif | Documents à fournir |
|---|---|
| Migrer un module vers bdb-shell | NOYAU + JOURNAL + CHANTIER_TECHNIQUE + CTX_[module] + **CDS_REFERENCE** |
| Corriger CSS module | NOYAU + CHANTIER_TECHNIQUE + **CDS_REFERENCE** + [module]-ui.css |
| Écrire ou modifier du HTML | NOYAU + CHANTIER_TECHNIQUE + **CDS_REFERENCE** |
| Nouveau module from scratch | NOYAU + JOURNAL + CHANTIER_TECHNIQUE + **CDS_REFERENCE** + TEMPLATE_MODULE_BDB + CTX à créer |
| Audit Supabase / données | NOYAU + JOURNAL + SUPABASE_DATA_MODEL |
| Migration localStorage | NOYAU + JOURNAL + CHANTIER_TECHNIQUE + CTX_[module] + MODULE_DEPENDENCY_MAP |
| Module embryonnaire | NOYAU + JOURNAL + CHANTIER_TECHNIQUE + CTX embryonnaire existant |

---

## BLOC 10 — MODULES EMBRYONNAIRES (doctrine)

### Qu'est-ce qu'un module embryonnaire

Un module embryonnaire est un module BDB **réel** qui existe sous forme dégradée.

Causes possibles :
- Version complète perdue lors d'une session de migration (confusion CDS/BDB)
- Module jamais finalisé, resté au stade prototype
- Module Lovable non migré, existant dans l'ancien repo

**Il n'est ni un orphelin, ni une erreur, ni un fichier égaré.**
Il est en attente de sa session de migration.

### Règles absolues

```
E1 — Ne jamais archiver un module embryonnaire sans confirmation Manu.
E2 — Ne jamais qualifier un fichier de "embarqué par erreur" sans confirmation Manu.
E3 — Le doute bénéficie toujours au fichier : signaler, ne pas supprimer.
E4 — Tout module embryonnaire reçoit son CTX avant toute session de migration.
E5 — Un CTX embryonnaire documente : état dégradé réel + violations + option choisie.
```

### Modules embryonnaires connus (2026-03-15)

| Module | Dossier actuel | État | Option |
|---|---|---|---|
| pedagogie | modules/pedagogie/ | Prompt Factory v4.3 CDS | B — intégrer BDB admin |
| carnet_bord | modules/carnet-bord/ | Prototype HTML | À migrer → modules/carnet_bord/ |
| objectifs | modules/objectifs-ide/ | Prototype HTML | À migrer → modules/objectifs/ |
| ged | (absent) | À créer | Statique zéro Supabase |

**Note :** D'autres modules BDB peuvent avoir été perdus lors de sessions antérieures.
Un inventaire complet des survivants est à produire en session dédiée.

### Traitement en session

```
Avant de travailler sur un module embryonnaire :
1. Lire le fichier source tel qu'il existe — sans jugement
2. Documenter ce qu'il fait réellement (pas ce qu'il devrait faire)
3. Lister les violations CDS factuellement
4. Créer ou mettre à jour son CTX
5. Attendre la validation de Manu sur l'option (A/B/C)
6. Ne commencer le code qu'après l'option validée
```

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-15 | 1.0.0 | Création. Issu du bilan audit complet + retour Manu sur rôle formateur. 9 blocs. |
| 2026-03-15 | 1.1.0 | BLOC 3 : Palier 0 mis à jour (bdb-shell + admin validés), embryons ajoutés Palier 6. BLOC 5 : IA-6 INTERDIT-E1, IA-8 embryonnaires. BLOC 7 : sessions N+1 réajustées. BLOC 9 : ligne module embryonnaire ajoutée. BLOC 10 : doctrine modules embryonnaires (fusion ADDENDUM V1.1.0). NOYAU_REF V2.2.0. CHANTIER_REF V1.0.1. |
| 2026-03-16 | 1.2.0 | BLOC 2 étape 3 mise à jour (navigation dynamique). BLOC 3 : Palier 0 et 1 mis à jour (bdb-shell v1.4.0, 4 modules migrés, app_modules). BLOC 7 : sessions recalées (SESSION N+1 = onglet Navigation admin/). BLOC 8 : Q1-Q3 ajoutés. NOYAU_REF V2.4.0. CHANTIER_REF V1.0.3. |
| 2026-03-16 | 1.2.1 | Audit CTO. BLOC 2 Étape 1 : versions corrigées (NOYAU V2_4_0 · JOURNAL V1_9_0 · CHANTIER V1_0_5). |
| 2026-03-22 | 1.2.2 | D-2026-03-22-CSS-01. BLOC 1 : 4e ennemi Hallucination CSS. BLOC 2 : CDS_REFERENCE.md ajouté étape 5. BLOC 3 : Palier 0 + Palier 2 mis à jour. BLOC 5 : IA-9 vérification CDS_REFERENCE. BLOC 6 : 2 cases CSS ajoutées. BLOC 9 : CDS_REFERENCE ajouté sur 3 objectifs. |
