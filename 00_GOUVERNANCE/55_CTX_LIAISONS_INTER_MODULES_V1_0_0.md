# CTX_LIAISONS_INTER_MODULES.md

```
VERSION  : 1.0.0
DATE     : 2026-04-02
AUTEUR   : Manu + Claude
STATUT   : BRAINSTORM FORMALISÉ — à valider avant implémentation
PORTÉE   : Architecture des liaisons entre thesaurus_protocoles et les modules éditoriaux
SESSION  : Brainstorm UML — session sans code
DÉPEND   : DATA_MODEL V1_10_0 · CONVENTIONS V2_5_0 · CTX_GLOSSAIRE V2_0_0
```

---

## 1 — CONSTAT DE DÉPART

BDB est constitué de deux systèmes historiquement indépendants qui doivent
maintenant fonctionner ensemble :

```
SYSTÈME TERRAIN (données brutes, 20 ans)
  thesaurus_protocoles       ← hub de nommage · source de vérité
  thesaurus_interventions    ← 89 721 cas réels
  thesaurus_chirurgiens      ← 12 chirurgiens (actifs + retraités)
  thesaurus_panseuses        ← 142 agents

           ↕ PONT À FORMALISER (objet de ce document)

SYSTÈME MÉTIER (contenus rédigés, pédagogiques, opératoires)
  fiches_intervention        ← fiche picking matériel
  cours                      ← pédagogie équipe
  anatomie                   ← vue anatomique spécifique au protocole
  installation_patient       ← positionnement, décubitus
  preferences_chirurgien     ← variantes spécifiques chirurgien × protocole
  glossaire                  ← jargon, abréviations, éponymes, marques
```

`thesaurus_protocoles` est le **nœud central** — toute liaison entre les deux
systèmes passe par lui.

---

## 2 — ÉTAT DES LIAISONS EXISTANTES

### 2.1 — FK actives en base

```
thesaurus_chirurgiens ──FK──→ thesaurus_interventions (chirurgien_id)
thesaurus_panseuses   ──FK──→ thesaurus_interventions (panseuse_id)
thesaurus_interventions ──FK──→ thesaurus_protocoles  (protocole_id)
thesaurus_protocoles  ──FK──→ thesaurus_fiches_papier (protocole_id optionnel)
  ↑ migration 070 EN ATTENTE d'exécution
```

### 2.2 — FK prêtes, données vides

```
thesaurus_protocoles ──pont N:N──→ protocole_ccam ──→ ccam_ot_actes
  DDL exécuté · 0 lien rempli à ce jour
```

### 2.3 — Liaisons logiques hors FK (code uniquement)

```
glossaire.is_propagated ←→ thesaurus_protocoles.synonymes_recherche
  glossaire_propagate() écrit dans synonymes_recherche (APPEND pipe)
  glossaire_scan_orphelins() lit thesaurus_interventions.note
```

### 2.4 — Problème identifié : preferences_chirurgien

```
preferences_chirurgien.chirurgien_id = uuid NOT NULL
  → FK vers quelle table ? non documenté
  → thesaurus_chirurgiens(id) ou profiles(id) ? à clarifier

preferences_chirurgien.fiche_intervention_id
  → pointe vers fiches_intervention, PAS vers thesaurus_protocoles
  → pivot incorrect — le bon pivot est protocole_id
```

### 2.5 — Liaisons ABSENTES à créer

```
thesaurus_protocoles ──?──→ fiches_intervention
thesaurus_protocoles ──?──→ cours
thesaurus_protocoles ──?──→ anatomie
thesaurus_protocoles ──?──→ installation_patient
thesaurus_protocoles ──?──→ preferences_chirurgien (via protocole_id manquant)
```

---

## 3 — DÉCISIONS ARCHITECTURE

### 3.1 — Anatomie : liée au protocole, pas à la zone

DÉCIDÉ.

L'anatomie dans BDB n'est pas générique ("le genou") mais opératoire
("le genou vu depuis le plan ligamentaire médial pour un LCA").
Un protocole différent = une vue anatomique différente, même zone.

```
anatomie ──N:N──→ thesaurus_protocoles
```

Cardinalité N:N car une vue anatomique peut être partagée entre
protocoles proches (ex : plusieurs arthroscopies d'épaule partagent
la même vue gléno-humérale).

### 3.2 — Cours : N:N protocoles

DÉCIDÉ.

Un cours couvre plusieurs protocoles (ex : "Prothèses totales" couvre
PTH cimentée, non cimentée, reprise...).
Un protocole peut être couvert par plusieurs cours (initiation vs
approfondissement).

```
cours ──N:N──→ thesaurus_protocoles
```

### 3.3 — Fiches picking : cardinalité GELÉE

EN ATTENTE d'exploration des fiches papier existantes (417 fiches Word,
module rapprochement onglet 7 thésaurus).

Question ouverte : 1 fiche par protocole ? ou N fiches (une par chirurgien) ?
→ NE PAS créer de FK avant la fin de l'exploration.

### 3.4 — Installation patient : probablement N:N

NON DÉCIDÉ — à confirmer après exploration terrain.

L'installation est souvent partagée entre protocoles de même famille
(décubitus dorsal pour toutes les arthroscopies d'épaule).
Mais la voie d'abord (S3) peut discriminer.

### 3.5 — Préférences chirurgien : recentrer sur protocole_id

DÉCIDÉ.

Le triplet logique est : `chirurgien × protocole → préférences`.
La colonne `fiche_intervention_id` actuelle est le mauvais pivot.

```
preferences_chirurgien
  chirurgien_id → thesaurus_chirurgiens(id)   ← à confirmer FK formelle
  protocole_id  → thesaurus_protocoles(id)    ← à ajouter
  fiche_id      → fiches_intervention(id)     ← optionnel, garde
  preferences   jsonb
  is_global     boolean
```

### 3.6 — content_relations existante : NE PAS réutiliser

DÉCIDÉ.

`content_relations` utilise `source_type_id`/`target_type_id` (uuid → content_types).
`thesaurus_protocoles` n'est PAS dans `content_types` et ne doit pas y entrer
(système autonome, règle existante).

→ Nouvelle table dédiée `content_links`.

---

## 4 — TABLE PIVOT : content_links

```sql
content_links
  id           uuid PK DEFAULT gen_random_uuid()
  source_type  text NOT NULL
               -- 'cours' | 'fiche' | 'anatomie' | 'installation' | 'preferences'
  source_id    uuid NOT NULL
  target_type  text NOT NULL
               -- 'protocole' | 'fiche' | 'anatomie' | 'installation' | 'cours'
  target_id    uuid NOT NULL
  auto         boolean NOT NULL DEFAULT false
               -- true = suggéré par scan automatique, non encore validé
  validated_by uuid NULL FK → auth.users
               -- null = suggestion en attente | uuid = validé par cet utilisateur
  created_at   timestamptz NOT NULL DEFAULT now()
  updated_at   timestamptz NOT NULL DEFAULT now()

UNIQUE (source_type, source_id, target_type, target_id)
INDEX sur (target_type, target_id)  -- requête inverse : qui pointe vers ce protocole ?
INDEX sur (source_type, source_id)  -- requête directe : à quoi est lié ce cours ?
INDEX sur auto WHERE auto = true    -- file de suggestions en attente
```

RLS : SELECT member · INSERT/UPDATE/DELETE admin (ou auteur du contenu source)

---

## 5 — NIVEAUX DE CROSS-RÉFÉRENCE

Deux niveaux coexistent — pas de choix à faire, les deux s'appliquent
selon la densité de l'information à transmettre.

### Niveau 4 — Tooltip automatique (déjà implémenté)

Pour : définitions, noms d'instruments, abréviations, informations
traduisibles en une phrase.

```
BdbGlossaire.enrich(container)
  → détecte les termes connus → <abbr title="[définition]">TERME</abbr>
  → déjà actif sur les notes d'interventions
  → à étendre : corps des cours, fiches, anatomie
```

Pas de table supplémentaire. Le glossaire est la source.

### Niveau 2 — Lien structuré validé (à construire)

Pour : notions nécessitant un dessin, une image, ou plus qu'une phrase.
Lien vers une entité BDB complète (protocole, fiche, anatomie...).

```
content_links (table ci-dessus)
  → stocke la relation typée
  → permet la navigation bidirectionnelle
  → permet les requêtes "qui cite quoi"
```

---

## 6 — COMPOSANT UI : PANNEAU DE LIAISONS

Composant unique réutilisable, affiché en bas de chaque module éditorial
(cours, fiches, anatomie, installation).

### Comportement

```
Au chargement de la page :
  1. Charge les liaisons existantes depuis content_links (source_type + source_id)
  2. Lance en arrière-plan le scan du contenu (auto-détection)
  3. Retourne les suggestions (auto=true, validated_by=null)

Affichage :
  ┌─────────────────────────────────────────────────────┐
  │ 🔗 LIAISONS                                         │
  │                                                     │
  │ Protocoles    [🔍 Rechercher un protocole...]       │
  │  ● PTH cimentée (ACT-0001)               [×]       │
  │  ◌ PTH > REPRISE (ACT-0012) suggéré  [+] [×]       │
  │                                                     │
  │ Fiches        [🔍 Rechercher une fiche...]          │
  │  (vide) → [Créer la fiche picking PTH]              │
  │                                                     │
  │ Anatomie      [🔍 Rechercher...]                    │
  │  ● Hanche — compartiment acétabulaire    [×]       │
  │                                                     │
  │ Installation  [🔍 Rechercher...]                    │
  │  (vide)                                             │
  │                                                     │
  │ Glossaire     (auto — non éditables)                │
  │  ● PTH  ● ciment  ● cupule                         │
  └─────────────────────────────────────────────────────┘

Légende :
  ● = lien validé (validated_by != null)
  ◌ = suggestion auto en attente (auto=true, validated_by=null)
  [+] = valider la suggestion → UPDATE validated_by = current_user
  [×] = supprimer le lien
  [Créer] = raccourci vers le module cible pour créer l'entité manquante
```

### Initialisation JS

```js
BdbLiaisons.init({
  source_type : 'cours',           // type de l'entité courante
  source_id   : courseId,          // uuid de l'entité courante
  modules     : ['protocoles', 'fiches', 'anatomie', 'installation'],
  // glossaire = toujours auto via BdbGlossaire, hors liste manuelle
})
```

### Détection automatique

Moteur : même logique que `glossaire_scan_orphelins()` adapté au contenu éditorial.
Scanne `cours.contenu` (Quill HTML → texte brut) à la recherche de :
- `libelle_cible` de thesaurus_protocoles
- `synonymes_recherche` (pipe-separated)
- titres de fiches_intervention, anatomie, installation_patient

Match → `INSERT content_links (auto=true, validated_by=null)` si absent.

---

## 7 — ADMIN PREMIUM

⚠️ SESSION DÉDIÉE À PRÉVOIR

Chaque module éditorial disposera d'une vue admin permettant :
- Voir toutes les liaisons du module (tableau filtrable)
- Valider/rejeter les suggestions auto en masse
- Forcer des liaisons manuelles
- Voir les entités "orphelines" (sans aucune liaison)
- Voir les entités "manquantes" (protocole sans fiche, sans anatomie...)

Cette vue s'inscrit dans la refonte admin globale prévue (#3 ADMIN).

---

## 8 — SÉQUENCE D'IMPLÉMENTATION RECOMMANDÉE

```
ÉTAPE 0 — Prérequis (AVANT tout code)
  □ Finaliser exploration fiches papier (Q1 cardinalité fiche ↔ protocole)
  □ Clarifier preferences_chirurgien.chirurgien_id (FK vers quelle table ?)
  □ Documenter état réel Supabase post-finalisation aujourd'hui

ÉTAPE 1 — Table pivot
  □ Migration content_links (DDL + RLS + INDEX)
  □ Documenter dans DATA_MODEL

ÉTAPE 2 — Composant BdbLiaisons (lecture seule)
  □ Chargement des liaisons existantes
  □ Affichage par module avec select/search existant
  □ Ajout/suppression manuel

ÉTAPE 3 — Moteur de détection auto
  □ RPC scan_content_links(source_type, source_id, content text)
  □ Retourne suggestions (protocole_id, score, match_context)
  □ INSERT auto=true

ÉTAPE 4 — Panneau admin
  □ Session dédiée — périmètre à définir avec #3 ADMIN

ÉTAPE 5 — Enrichissement BdbGlossaire
  □ Étendre enrich() aux cours, fiches, anatomie (appel explicite au render)
```

---

## 9 — QUESTIONS OUVERTES (à résoudre en sessions futures)

| # | Question | Bloquante pour |
|---|---|---|
| Q1 | Cardinalité fiche ↔ protocole (1:1 ou N:N) | Étape 1 |
| Q2 | preferences_chirurgien.chirurgien_id → quelle table ? | Étape 1 |
| Q3 | Installation patient : N:N ou 1:N ? | Étape 1 |
| Q4 | Transclusion de blocs (niveau 3) : horizon ou hors scope V1 ? | Vision |
| Q5 | Périmètre exact admin premium liaisons | Étape 4 |

---

## HISTORIQUE

```
2026-04-02 — V1.0.0  Création. Brainstorm UML session Manu + Claude.
                      Décisions : anatomie liée au protocole · cours N:N ·
                      content_links nouvelle table · BdbLiaisons composant unique ·
                      deux niveaux (tooltip glossaire + lien structuré) ·
                      détection auto + suggestions + validation manuelle.
                      Q1 (fiches), Q2 (préférences), Q3 (installation) : gelées.
```
