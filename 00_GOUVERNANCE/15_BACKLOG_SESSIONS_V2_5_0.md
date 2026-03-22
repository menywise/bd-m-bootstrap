# BACKLOG_SESSIONS.md
```
VERSION  : 2.5.0
DATE     : 2026-03-22
RÔLE     : Suivi d'avancement des sessions planifiées.
           Chaque session = une ligne. Mis à jour EN CLÔTURE de chaque session.
           Les prompts détaillés sont dans le projet Claude (Project Knowledge).
           En conversation, écrire : "Exécuter session #N du BACKLOG"
           + joindre UNIQUEMENT les fichiers source à modifier.
RÈGLE    : Toute IA qui exécute une session de ce backlog :
           1. Cherche ce fichier via project_knowledge_search("BACKLOG_SESSIONS")
           2. Cherche le prompt détaillé via project_knowledge_search("[NOM_PROMPT]")
           3. Met à jour la ligne correspondante en clôture
DELTA    : V2.3.0 → V2.4.0 (D-2026-03-22-CSS-01) :
           Session #7 remplacée par AUDIT_CSS_MODULES.
           V2.4.0 → V2.5.0 (fusion) :
           Session #2 statut restauré ⚠ PARTIEL (régressé dans V2.4.0).
           Session #8 SEED_DEMO réintégrée (perdue dans V2.4.0).
           Session #9 DATA_MODEL_AUDIT réintégrée (perdue dans V2.4.0).
           Ordre recommandé et dépendances complétés.
```

---

## SESSIONS À EXÉCUTER

| # | Prompt (dans le projet) | Statut | Fichiers à joindre | Détail avancement | MAJ |
|---|---|---|---|---|---|
| 1 | PROMPT_CLAUDE_CTX_COMPLEXES.md | ✅ FAIT | — | 25/25 CTX TRACKER_*. CTX_PROFILE créé. CTX_SITE récupéré. | 2026-03-21 |
| 2 | PROMPT_SESSION_SECURITE.md | ⚠ PARTIEL | js/bdb-shell.js · modules/fiches/index.html · modules/transmissions/index.html · modules/cours/index.html | D1 auto-logout FAIT. D2 DOMPurify FAIT (fiches+cours+transmissions). D4 signed URLs FAIT (fiches+cours+transmissions). Reste : grep D4/D6 autres modules + SQL D3+D5 manuels + vérif bucket. | 2026-03-22 |
| 3 | PROMPT_SESSION_ADMIN_SUPERVISION.md | ⏳ À FAIRE | modules/admin/index.html · css/admin-ui.css | Phase 0 SQL prioritaire, puis Phases 1-4 | — |
| 4 | (à créer) PROMPT_AUDIT_IMAGES.md | ⏳ À FAIRE | Tous modules avec content_images (fiches, transmissions, anatomie, installation, arsenal, preferences, cours) | syncImages 409 + position check + audit getSignedUrls | — |
| 5 | (à créer) PROMPT_SUPPORT_FICHIERS_COURS.md | ❌ BLOQUÉ | cours/index.html · nouvelle table · CTX_COURS · CTX_GED | Support PDF/fichiers cours — table dédiée, lien GED. Arbitrage schéma requis. | — |
| 6 | (à créer) PROMPT_EXTERNALISATION_JS.md | ⏳ À FAIRE | Tous modules (par lot) | Externalisation JS inline → [module].js + socle partagé (bdb-utils/media/tags). Arborescence co-localisée. D-2026-03-22-ARCHI-01. | — |
| 7 | (à créer) PROMPT_AUDIT_CSS_MODULES.md | ⏳ À FAIRE | Tous [module]-ui.css + CDS_REFERENCE.md | Audit 7 CSS modules restants (annuaire, anatomie, arsenal, carnet-bord, admin-bootstrap, admin-memo, admin-test). Table remplacements. Script Python remplacement HTML. D-2026-03-22-CSS-01. | — |
| 8 | (à créer) PROMPT_SEED_DEMO.md | ⏳ À FAIRE | seed.sql | Jeu de données démo complet (Lorem ipsum) — couvre tous les cas visuels de chaque module. Mode démo invité. | — |
| 9 | (à créer) PROMPT_DATA_MODEL_AUDIT.md | ⏳ À FAIRE | SUPABASE_DATA_MODEL | Corriger colonnes fausses : tags.locked→is_locked, content_images (content_type_id/storage_path/position/is_dev). Audit complet terrain vs doc. | — |

### Légende

```
⏳ À FAIRE    — pas commencé
🔄 EN COURS   — session ouverte, pas terminée
✅ FAIT        — toutes les phases complétées
⚠ PARTIEL     — certaines phases faites, reste documenté
❌ BLOQUÉ      — en attente d'arbitrage ou dépendance
```

### Ordre recommandé

```
#2 SECURITE              — 15 min  — reste : grep D4/D6 autres modules + SQL D3/D5 manuels + vérif bucket
#3 ADMIN_SUPERVISION     — 2-3h   — Phase 0 (migrations SQL) prioritaire, puis Phases 1-4
#4 AUDIT_IMAGES          — 1-2h   — syncImages fix multi-modules + audit getSignedUrls
#5 SUPPORT_FICHIERS      — bloqué — arbitrage schéma table fichiers + lien GED
#6 EXTERNALISATION_JS    — 3-5h   — post-Palier 1 — socle partagé + migration module par module
#7 AUDIT_CSS_MODULES     — 2-3h   — CDS_REFERENCE.md en entrée · 7 CSS audités · script Python livré
#8 SEED_DEMO             — 2-3h   — jeu données complet Lorem ipsum tous modules
#9 DATA_MODEL_AUDIT      — 1h     — audit terrain vs doc SUPABASE_DATA_MODEL
```

### Dépendances

```
#2 → indépendant (reste = grep + SQL manuels)
#2 dette DOMPurify → s'applique aussi aux modules migrés en #3 Phase 2
#3 Phase 0 (migrations SQL) → indépendant, peut être fait en premier si priorité
#3 Phase 2 (Q1-Q3) → bloque Phase 3
#4 → indépendant (fix technique pur — applicable après #2)
#5 → bloqué par arbitrage schéma Manu (table content_files ou content_attachments)
#6 → bloqué par Palier 1 terminé (tous modules sur bdb-shell) + #4 fait (syncImages propre avant extraction)
#7 → indépendant · livrable = CSS corrigés + script Python · à exécuter avant #6
#8 → idéalement après #4 (images corrigées) + #9 (DATA_MODEL fiable)
#9 → indépendant (documentation pure)
```

---

## COMMENT OUVRIR UNE SESSION

```
Étape 1 : Nouvelle conversation Claude (dans ce projet)
Étape 2 : Écrire "Exécuter session #N du BACKLOG"
Étape 3 : Joindre UNIQUEMENT les fichiers source listés dans "Fichiers à joindre"
Étape 4 : Claude cherche le BACKLOG + le prompt détaillé dans le projet → exécute
```

Tout le contexte (JOURNAL, CHANTIER, CTX, AUDIT...) est dans le projet.
Ne PAS joindre les fichiers de gouvernance — Claude les cherche tout seul.

---

## HISTORIQUE DES SESSIONS EXÉCUTÉES

| Date | # | Résultat | JOURNAL réf |
|------|---|----------|------------|
| 2026-03-21 | 1 | ✅ 25 CTX TRACKER_* + CTX_PROFILE + CTX_SITE | D-2026-03-21-CTX-TRACKER |
| 2026-03-21 | 2 | ⚠ PARTIEL — D1/D2-fiches/D3/D4-fiches/D5/D6 partiels. Cours+transmissions bloqués (upload écrasé). | D-2026-03-21-S01 |
| 2026-03-22 | — | Hors backlog : hardening cours (escHtml + C.9 + fix syncImages) + hardening transmissions (Bug B2 résolu + images + C.9). Bug images multi-modules identifié. +3 sessions backlog (#4 #5 #6). Arbitrage archi JS co-localisée (D-2026-03-22-ARCHI-01). Tags is_locked=false (33 lignes). DATA_MODEL dettes identifiées (tags.is_locked + content_images colonnes). Seed démo complète à planifier. | D-2026-03-22-COURS-01 + ARCHI-01 + TRANS-01 |
| 2026-03-22 | — | Hors backlog : audit cds-overrides.css → v1.6.0. Création CDS_REFERENCE.md. Mise à jour gouvernance (GUIDE V1.2.2, TEMPLATE_CTX V1.2.0, BACKLOG V2.4.0). Session #7 ajoutée. | D-2026-03-22-CSS-01 |

---

## RÈGLE DE CLÔTURE (exécutée par Claude)

```
1. Mettre à jour la ligne # dans le tableau (Statut + Détail + MAJ)
2. Ajouter une ligne dans HISTORIQUE
3. Proposer le fichier BACKLOG_SESSIONS.md mis à jour
4. Rappeler à Manu de l'uploader dans le projet Claude
```

---

## SESSION PLANIFIEE — Modules poids lourds (post-80% app)

DATE CREATION : 2026-03-22
PRIORITE      : BASSE — apres que 80% des modules soient conformes CDS + Supabase
PREREQUIS     : Modules modeles fonctionnels (annuaire, arsenal, fiches, admin, transmissions)

### Planning (session dediee)
- Supprimer doublon index.html/dashboard.html
- Reconstruire index.html conforme template CDS (1 header, bdb-shell.js)
- Verifier data JSON (data/*.json) presentes sur disque
- Migration Supabase bloquee par arbitrage A1 (decision Manu)
- 11 fichiers HTML a auditer, 0 Supabase, 0 bdb-shell

### Thesaurus (session dediee)
- A evaluer quand les modules modeles seront stables

### Autres modules localStorage (disc, paxis, collab, organisateur, dork)
- Migration localStorage -> Supabase Phase 1
- Utiliser les modules conformes comme gabarit
