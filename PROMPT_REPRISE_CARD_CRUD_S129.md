# PROMPT DE REPRISE — Session S129 : Composant card-CRUD (L3-L8)

> **Vivant tant que la doctrine card-CRUD n'est pas implémentée et migrée sur tous les modules.**
> Date création : 2026-05-09 fin S128
> Suppression : quand 28 modules conformes V5.1 + card-CRUD (audit 0 régression).

---

## 0. UTILISATION

Coller le bloc ci-dessous **au démarrage de la session S129**.

```
Je suis Manu (créateur DB&M, IBODE, dev solo Windows file://).
Tu es Claude AI dans le Carnet de Liaison V2.

═══════════════════════════════════════════════════════════════
PROTOCOLE DE DÉMARRAGE OBLIGATOIRE (Niveau 0 §13)
═══════════════════════════════════════════════════════════════
Avant toute action :
1. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\00000_DEBLOQUEZ_MOI.md
2. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\000000_NIVEAU_0_DBM_V0_5_0.md
3. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\0000_CARNET_LIAISON_DBM_V2.md
4. Lire C:\DEV\BIBLE_DE_BLOC\CLAUDE.md (V2.4)
5. Lire C:\DEV\BIBLE_DE_BLOC\PROMPT_REPRISE_CARD_CRUD_S129.md (ce fichier)
6. SELECT atelier_prompt_reprise() + count atelier_principes WHERE statut='active'
7. Vérifier doctrine card-CRUD inscrite : SELECT ref FROM atelier_principes WHERE ref LIKE 'CONV-CARD-%' OR ref='INTERDIT-CARD-HALLUCINATION-01' ORDER BY ref;
   → ATTENDU : 13 principes (CONV-CARD-01..13 + INTERDIT-CARD-HALLUCINATION-01)

═══════════════════════════════════════════════════════════════
DOCTRINE CARD-CRUD FIGÉE EN CLOUD (Session #128 — 2026-05-09)
═══════════════════════════════════════════════════════════════
Cascade rôles MANU (figée) :
  Créateur > Admin > Rédacteur > Membre > Invité > Suspendu
  (Banni à créer si demande explicite future)

Codification window.bdbUser :
  isCreator   = is_creator === true
  isAdmin     = role === 'admin' || is_creator
  isRedacteur = is_redacteur === true || isAdmin || isCreator
  isMember    = role !== 'invite'
  isDemo      = true (toujours)
  isSuspended = is_suspended === true (override sanction, S128 patch)

Inscrits cloud (atelier_*) :
  - D-2026-05-09-CARD-CRUD-DOCTRINE (decision mère, type=doctrine session=128)
  - CONV-CARD-05 anatomie 11 slots universels
  - CONV-CARD-06 Version B grille fiche col-md-6 col-xl-4
  - CONV-CARD-07 Version C grille dense col-md-4 col-xl-3
  - CONV-CARD-08 Version D grille KPI col-md-3
  - CONV-CARD-09 Version E pleine largeur form unique
  - CONV-CARD-10 matrice rôle x action
  - CONV-CARD-11 4 modales canoniques
  - CONV-CARD-12 18 verbes CRUD canoniques
  - CONV-CARD-13 cascade rôles 6 niveaux + isSuspended
  - INTERDIT-CARD-HALLUCINATION-01 (7 violations bloquantes)
  - ARB-CARD-CRUD-01 arbre décisionnel (statut=solde)

Préservés (NE PAS RÉINVENTER) :
  - CONV-CARD-01..04 styling couleur module via .module-card hérité
    (dbm-module-color.css §9, lignes 162-166)

═══════════════════════════════════════════════════════════════
PATCHES CODE DÉJÀ APPLIQUÉS (Session #128)
═══════════════════════════════════════════════════════════════
js/bdb-shell.js (1548→1555 lignes) :
  - L344 : SELECT enrichi avec is_suspended
  - L398-402 : isSuspended dans bdbUser principal (commentaires S128)
  - L414-415 : isSuspended dans bdbUser fallback
  Vérifier intégrité : grep "isSuspended" js/bdb-shell.js → 4 lignes attendues

sql/migration_20260509_210000_card_crud_doctrine.sql :
  - Fichier archive de la migration (référence)
  - Migration cloud appliquée via apply_migration

═══════════════════════════════════════════════════════════════
PLAN LIVRABLES RESTANTS L3-L8 (S129)
═══════════════════════════════════════════════════════════════

L3. Composant CSS .dbm-card-crud
  Fichier   : css/bdb-ui-kit.css (PAS dans liste protégée, déjà chaîne V5.1)
  Contenu   : anatomie 11 slots universels (CONV-CARD-05) + variants B/C/D/E
  Variables : utilise --module-color, --module-color-strong, --module-color-text, --module-color-soft
  Compat    : hérite CONV-CARD-01..04 (border-left + .module-card)
  Touch     : kebab ≥44x44px obligatoire
  Méthode   : Python heredoc bytes (pas Edit/Write classique)
  Audit     : wc -l ≥1100, NULL=0, file -i utf-8

L4. Composant JS factory render
  Fichier   : js/dbm-card.js (NOUVEAU, fin chaîne avant module-app.js)
  API       : 
    window.dbmCard.render(config)        → DOM element complet
    window.dbmCard.renderActions(item, user) → DOM kebab dropdown
    window.dbmCard.openModal(modalType, data) → modale CONV-CARD-11
  Verbes    : 18 figés CONV-CARD-12 avec libellés FR + icônes bi-* figées
  Matrice   : helper interne basé window.bdbUser cascade (CONV-CARD-10)
  Méthode   : Python heredoc bytes
  Audit     : 0 console.* prod, IIFE, escHtml() obligatoire

L5. Template démo card complet
  Fichier   : modules/template/_TEMPLATE_MODULE_V5_2_0.html (NOUVEAU)
  Contenu   : page démo affichant les 4 versions B/C/D/E avec 11 slots peuplés
            + exemples vides slots masqués [hidden]
            + matrice rôle x action visuelle (toggle preview admin/membre/invite)
            + modales 4 patterns ouvrables
  Méthode   : Python heredoc bytes
  Conserver : _TEMPLATE_MODULE_V5_0_1.html (référence historique)

L6. Skill acces-niveaux-bdb V1.1.0 → V1.2.0
  Fichier   : C:\Users\Utilisateur\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\a6cdbbc5-213c-45ce-b710-b2efa48ff1d1\cd284cbc-afa0-47bf-8d82-553ff2cbf29d/skills/acces-niveaux-bdb/SKILL.md
  Modif     : ajout cascade 6 niveaux + isRedacteur + isSuspended
            + matrice droits canon + lien CONV-CARD-13
  Versionning : V1.1.0 → V1.2.0 (date 2026-05-09)

L7. Documentation pattern (commentaires inline)
  Cible     : tous fichiers L3-L5 avec en-tête commenté incluant :
            - Référence CONV-CARD-XX
            - Liste slots utilisés/masqués
            - Cascade rôle utilisée
            - Date figement
  Convention : commentaire bloc /* ============ */ + ref atelier_principes

L8. Audit final 0 régression
  Vérifications :
    - 13 refs cloud présents (CONV-CARD-01..13 + INTERDIT-CARD-HALLUCINATION-01)
    - bdb-shell.js : isSuspended présent 4 fois
    - bdb-ui-kit.css : .dbm-card-crud + variants présents
    - dbm-card.js : factory render + 18 verbes figés
    - _TEMPLATE_MODULE_V5_2_0.html : 4 versions visibles
    - 0 régression sur modules existants (cours, transmissions, glossaire encore fonctionnels)
    - skill acces-niveaux-bdb V1.2.0 actif

═══════════════════════════════════════════════════════════════
RÈGLES STRICTES (héritées prompt V128)
═══════════════════════════════════════════════════════════════
R1. NE PAS faire d'Edit/Write multiples consécutifs sur fichier UTF-8 lourd.
    UNE SEULE écriture finale via Python heredoc bytes.
R2. Pour chaque écriture > 200 lignes :
    - wc -l ≥ taille attendue
    - tail -3 = fermeture cohérente
    - file -i = utf-8
    - NULL bytes = 0
R3. Doctrine cloud DÉJÀ TRANCHÉE → APPLIQUER, pas redébattre.
R4. Profil Manu = D direct.
    - Phrases courtes
    - Pas de "Ok Manu" sauf clôture nette
    - Pas de gaspillage tokens
    - Pas d'excuses, pas de complaisance
R5. INTERDIT-JS-01 strict : JS inline > 5 lignes = extraire.
R6. Doctrine modale CONV-CARD-11 : rounded-4 border-0 shadow-lg + modal-header-module
    + modal-dialog-centered + modal-fullscreen-md-down.
R7. CTA = btn-module / btn-module-outline. JAMAIS btn-primary/btn-warning text-white.
R8. Hallucination INTERDITE :
    - Vérifier schemas information_schema AVANT tout SQL
    - Lire SKILL.md pertinent AVANT toute proposition
    - Lire window.bdbUser source bdb-shell.js AVANT calcul rôle

═══════════════════════════════════════════════════════════════
TÂCHE IMMÉDIATE S129
═══════════════════════════════════════════════════════════════
Démarrer L3 : composant CSS .dbm-card-crud dans css/bdb-ui-kit.css
  - Lecture fin du fichier 915L pour ne rien casser
  - Append via Python bytes (pattern d'écriture sûr testé S128)
  - Attendre validation Manu après L3 avant L4
  - Pause de rappel impératifs avant chaque livrable (mode S128 validé)

═══════════════════════════════════════════════════════════════
MÉMOIRE AUTO À VÉRIFIER
═══════════════════════════════════════════════════════════════
C:\Users\Utilisateur\AppData\Roaming\Claude\local-agent-mode-sessions\
  cd284cbc-...\spaces\8f60a908-...\memory\MEMORY.md

Entrée critique persistante :
  "Doctrine card-CRUD DBM figée S128"
  → project_card_crud_doctrine_s128.md

═══════════════════════════════════════════════════════════════
CONTRAINTES SCHEMA CLOUD (acquis S128)
═══════════════════════════════════════════════════════════════
atelier_decisions.type IN ('decision','doctrine','plan','roadmap')
atelier_arbitrages.statut IN ('pending','solde','abandonne')
atelier_principes.marqueur valeurs vues : 'TOUJOURS' (pérenne)
enum app_role : 'admin' | 'redacteur' | 'membre' | 'invite' (4 valeurs)
profiles flags : is_creator, is_redacteur, is_suspended, is_dev (tous boolean NOT NULL default false)

═══════════════════════════════════════════════════════════════
AVANT DE PRODUIRE
═══════════════════════════════════════════════════════════════
- Confirme avoir lu les 4 fichiers gouvernance + ce prompt
- Confirme état cloud (>= 260 principes actifs attendus, dont 13 CARD)
- Pose la question type 0 : "qu'est-ce que je ne sais pas ?"
- Attends mon GO avant de produire L3
- Pas de raccourci, pas de rebrand, pas de réinvention.
```

---

## 1. CONTEXTE — Pourquoi cette session existe

Session #128 (cours migration V5.1 + doctrine card-CRUD) a livré :

- **L1** : patch `bdb-shell.js` (+isSuspended, cascade complète)
- **L2** : doctrine card-CRUD figée cloud (10 principes + 1 décision + 1 arbitrage)

**Reste 6 livrables** (~2h estimées) pour rendre la doctrine implémentée et migrable :

- **L3** : composant CSS partagé `.dbm-card-crud` 
- **L4** : composant JS factory `js/dbm-card.js`
- **L5** : template démo `_TEMPLATE_MODULE_V5_2_0.html` 4 versions live
- **L6** : skill `acces-niveaux-bdb` V1.1.0 → V1.2.0
- **L7** : documentation pattern (inline)
- **L8** : audit final cross-modules

---

## 2. POURQUOI STOP S128 ICI

- Doctrine inscrite cloud = acquis structurant pérenne (jamais à refaire)
- L3-L8 = production code, mérite session fraîche zéro risque tronquage cumulé
- Profil prudence Manu validé : qualité > vitesse

---

## 3. SUPPRESSION DE CE FICHIER

Quand audit L8 montre :
- 13 refs CARD cloud présents
- 4 fichiers L3-L5-L4-L6 livrés et stables
- 0 régression cross-modules constatée
- Migration progressive 28 modules en cours selon arbre décisionnel

→ Supprimer ce fichier ET la mémoire auto associée.

---

*Fin du prompt de reprise S129. Vivant jusqu'à audit final L8.*
