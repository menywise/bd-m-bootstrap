# Journal des décisions — Bible de Bloc

```
VERSION  : 1.35.0
DATE     : 2026-04-08
STATUT   : ACTIF — append-only
PRÉCÉDENT: JOURNAL_DECISIONS_V1_20_0.md (sessions 01-14, dernière entrée D-2026-03-23-INFRA-01)
```

> Format : DATE . MODULE . DÉCISION . MOTIF . SCOPE . HORS SCOPE . IMPACT . RÉSULTAT . STATUT

---

## D-2026-04-08-DEMO-01 — Mode Démo Invité (Session #15)

```
DATE       : 2026-04-08
MODULE     : SOCLE + 17 modules métier
DÉCISION   : Implémentation complète du mode démo invité (Session #15).
             Architecture retenue : tables shadow demo_* (SELECT public) + bdb-demo.js dédié.
             Compte : demo@bdb.app · rôle invite · mot de passe demo-bdb-2026.
             17 tables demo_* créées via migration 118 (3 seed rows chacune, OR/IBODE).
             js/bdb-demo.js : IIFE, interceptDemoActions(), showDemoBanner(),
             window.bdbIsDemo(), window.bdbEnterDemo(), window.bdbDemoToast().
MOTIF      : Permettre à un visiteur externe de découvrir BDB sans compte et sans
             risque de pollution des données réelles. Cas : direction, prospection,
             portfolio Manu. Architecture V1_0_0 (hybride RLS + seed_demo.sql)
             remplacée car insuffisante pour modules localStorage (collab, dork,
             organisateur, paxis, carnet-bord, objectifs).
SCOPE      : migrations/117_demo_account.sql (nouveau)
             migrations/118_demo_tables.sql (nouveau — 30 585 octets)
             js/bdb-demo.js (nouveau — 4 678 octets)
             login.html (btnDemo → bdbEnterDemo())
             modules/site/index.html (btnSiteDemo + bdb-demo.js)
             17 modules HTML (bdb-demo.js injecté après bdb-shell.js)
             17 modules JS/HTML (loadDemoData() ou check inline bdbIsDemo)
             00_GOUVERNANCE/47_CTX_DEMO_V1_1_0.md (CTX mis à jour)
HORS SCOPE : bdb-shell.js, supabase-client.js, cds-overrides.css (protégés)
             Modules admin, profile, disc, supervision, planning (exclus démo)
             Exécution cloud des migrations 117+118 (action manuelle requise)
IMPACT     : 17 modules affichent 3 entrées réalistes en mode invite.
             Aucune écriture possible (interceptDemoActions + RLS no-write).
             Bannière fixe bas de page visible en permanence.
             CTX_DEMO V1_0_0 remplacé par V1_1_0.
RÉSULTAT   : Phase 7 (vérification) passée. Migrations prêtes pour déploiement.
             Point d'attention : container ID objectifsContent à vérifier.
             Action manuelle : créer demo@bdb.app + exécuter migrations 117+118.
STATUT     : TERMINÉ (déploiement cloud en attente)
```

---

---

DATE       : 2026-04-12
MODULE     : ADMIN / TRANSVERSAL
DECISION   : Architecture admin backend BDB V1.0.0 — admin.html dédiés par module
MOTIF      : Transformer modules/admin/ en véritable backend équivalent wp-admin.
             Chaque module métier reçoit admin.html dédié + [module]-admin.js
             co-localisé. Isolation totale de index.html (RÈGLES-ISO-01 à 05).
             Annule et remplace le pattern admin-slot-bdb (slot embedded dans
             index.html). Phase 0 audit (CC-A01/A02/A03) : 0 violation active dans
             admin/index.html + admin-app.js. 0/24 modules ont un admin.html.
SCOPE      : modules/admin/index.html (onglet "Modules métier" + 2 stat-cards)
             modules/admin/admin-app.js (loadModulesMetier() + Promise.all étendu)
             Lot A→D : 17 modules à créer (fiches, thesaurus, transmissions,
             glossaire, arsenal, preferences, cours, annuaire, dork, disc,
             installation, anatomie, carnet-bord, objectifs, collab, faq, paxis)
             Lot E bloqué : organisateur (parcours_phases), planning (Phase 2)
HORS SCOPE : index.html de chaque module (inchangés)
             medacta, site : arbitrage gouvernance dédiée
             ged, recueil-situation : dossiers vides — hors scope
             paxis : session dédiée (extraction section admin → admin.html)
IMPACT     : admin/index.html devient hub central de navigation vers chaque admin.html.
             Dashboard enrichi : tag_suggestions pending + error_404_logs 24h.
             Guard isAdmin dans chaque [module]-admin.js (redirection index.html).
             Template admin.html + template [module]-admin.js standardisés.
RÉSULTAT   : CC-F02 + CC-F03 TERMINÉS (Phase 1 Fondation).
             Checklist post-prod : 0 console.log, 0 style= non justifié,
             escHtml() sur toutes données DB, _metiersLoaded guard présent.
STATUT     : EN COURS — Lot A-01 (thesaurus) = prochaine session
