# CTX_DEMO — Mode démo invité BDB

```
VERSION     : 1.1.0
DATE        : 2026-04-08
AUTEUR      : Manu + Claude
STATUT      : IMPLÉMENTÉ — Session #15 terminée
PORTÉE      : js/bdb-demo.js · login.html · modules/site · 17 modules métier
              migrations/117_demo_account.sql · migrations/118_demo_tables.sql
```

---

## DELTA V1_0_0 → V1_1_0

L'architecture V1_0_0 (approche hybride RLS, email demo@bdb.local, rôle membre, seed_demo.sql)
a été remplacée en Session #15 par une approche distincte basée sur des tables shadow `demo_*`.

Changements majeurs :
- Email compte démo : `demo@bdb.local` → `demo@bdb.app`
- Rôle : `membre` → `invite`
- Architecture données : seed RLS user-scoped → 17 tables shadow `demo_*` SELECT public
- Détection isDemo : dans `bdb-shell.js` → dans `js/bdb-demo.js` (fichier dédié, IIFE)
- Modules localStorage : "vides acceptables" → couverts par demo_* tables
- Bannière demo : dans bdb-shell.js → dans bdb-demo.js (fixed bottom)

---

## 1 — OBJECTIF

Permettre à un visiteur externe de découvrir BDB sans compte, avec des données représentatives,
sans risque de pollution des données réelles.

Cas d'usage :
- Présentation à la direction (P6)
- Démonstration à un collègue sceptique (P4/P8)
- Évaluation par un prospect (autre bloc opératoire)
- Portfolio professionnel Manu

---

## 2 — ARCHITECTURE IMPLÉMENTÉE

### 2.1 Compte démo

```
Email    : demo@bdb.app
Password : demo-bdb-2026
Rôle     : invite (app_role = 'invite')
Approved : true (profiles_directory.approved = true)
```

Ce compte est créé manuellement dans Supabase Auth Dashboard (Invite user), puis
`migrations/117_demo_account.sql` est exécuté avec l'UUID réel substitué à `DEMO_USER_UUID`.

### 2.2 Tables shadow demo_*

17 tables `demo_*` créées dans `migrations/118_demo_tables.sql` :

| Table | Module | Colonnes clés |
|---|---|---|
| demo_fiches | fiches | titre, sous_titre, contenu, categorie |
| demo_thesaurus | thesaurus | id uuid, id_protocole text, intitule, specialite |
| demo_installation | installation | titre, description, position |
| demo_anatomie | anatomie | titre, description, region |
| demo_preferences | preferences | chirurgien_nom, materiel_favori, notes |
| demo_arsenal | arsenal | nom, description, reference, type_nom, zone_nom |
| demo_glossaire | glossaire | terme, definition, categorie |
| demo_cours | cours | titre, description, contenu, categorie |
| demo_objectifs | objectifs | titre, description, statut, priorite |
| demo_faq | faq | question, reponse, categorie |
| demo_transmissions | transmissions | title, content, auteur_nom |
| demo_collab | collab | titre, description, projet_titre (ideas only) |
| demo_paxis | paxis | question, reponse, contexte |
| demo_organisateur | organisateur | titre, type, parent_id |
| demo_carnet_bord | carnet-bord | titre, contenu, date_entree |
| demo_dork | dork | nom, role, specialite, outils |
| demo_annuaire | annuaire | user_id uuid, prenom, nom, role, service |

**RLS** : toutes les tables ont `SELECT USING (true)` — lecture publique, aucune écriture.
3 seed rows par table (données OR/IBODE réalistes, pas de Lorem ipsum).

### 2.3 Fichier bdb-demo.js

`js/bdb-demo.js` — IIFE, chargé après `bdb-shell.js` dans les 17 modules + login.html + site.

```
Expose :
  window.bdbIsDemo()       — true si email === 'demo@bdb.app'
  window.bdbEnterDemo()    — signInWithPassword + redirect index.html
  window.bdbDemoToast()    — toast "fonctionnalité réservée aux membres"

Comportements auto (si isDemo) :
  interceptDemoActions()   — capture phase : bloque data-action + form submit
  showDemoBanner()         — bandeau fixed bottom ambre (z-index:9998)
```

### 2.4 Point d'entrée

**login.html** : bouton `#btnDemo` déclenche `window.bdbEnterDemo()`
**site/index.html** : bouton `#btnSiteDemo` déclenche `window.bdbEnterDemo()`

---

## 3 — MODULES COUVERTS PAR LE MODE DÉMO

Tous les 17 modules listés ci-dessous chargent `bdb-demo.js` et incluent un
`loadDemoData()` ou check inline `if (window.bdbIsDemo && window.bdbIsDemo())`.

| Module | Fichier modifié | Stratégie |
|---|---|---|
| fiches | fiches-app.js | `loadDemoData()` avant `loadFiches()` |
| thesaurus | thesaurus-app.js | check dans `ThesApp.loadData()` |
| installation | installation-app.js | check inline dans `loadItems()` |
| anatomie | anatomie-app.js | check inline dans `loadItems()` |
| preferences | preferences-app.js | check + enrichit `_profile` depuis `chirurgien_nom` |
| arsenal | arsenal-app.js | renderer simplifié (sans FK type/zone) |
| glossaire | glossaire-app.js | check dans `loadEntries()` (IIFE) |
| cours | cours-app.js | check inline dans `loadItems()` |
| objectifs | objectifs/index.html | `loadDemoData()` inline script |
| faq | faq-app.js | check dans `loadData()` |
| transmissions | transmissions-app.js | `loadDemoData()` — columns title+content |
| collab | boite-a-idees.js | projet fictif hardcodé + `demo_collab` pour ideas |
| paxis | paxis/index.html | check avant `checkExistingSession()` |
| organisateur | organisateur-app.js | check dans `chargerListeParcours()` (IIFE) |
| carnet-bord | carnet-bord/index.html | `loadDemoData()` inline script |
| dork | dork.js | check dans `loadProfiles()` |
| annuaire | annuaire-app.js | check dans `loadMembers()` (DOMContentLoaded closure) |

**Exclus du mode démo** : admin, profile, disc, supervision, site, planning
(pages admin/infra/localStorage sans intérêt pour visiteur démo).

---

## 4 — MIGRATIONS

```
migrations/117_demo_account.sql  — profiles + user_roles + profiles_directory
                                   (placeholder DEMO_USER_UUID à substituer manuellement)
migrations/118_demo_tables.sql   — 17 tables demo_* + RLS + seed (3 rows chacune)
```

**Action manuelle requise avant déploiement :**
1. Créer `demo@bdb.app` dans Supabase Dashboard > Authentication > Invite user
2. Récupérer l'UUID généré
3. Remplacer `DEMO_USER_UUID` dans `migrations/117_demo_account.sql`
4. Exécuter `117_demo_account.sql` dans Supabase SQL Editor
5. Exécuter `migrations/118_demo_tables.sql` dans Supabase SQL Editor

---

## 5 — INTERDIT

```
INTERDIT-DEMO-01 : Ne jamais donner le rôle admin au compte démo
INTERDIT-DEMO-02 : Ne jamais afficher les données sensibles (RGPD) au visiteur démo
INTERDIT-DEMO-03 : Ne jamais modifier la RLS de production pour le mode démo
INTERDIT-DEMO-04 : Les tables demo_* n'ont pas de politique INSERT/UPDATE/DELETE
INTERDIT-DEMO-05 : bdb-demo.js ne doit pas modifier bdb-shell.js / supabase-client.js
```

Note : le mot de passe `demo-bdb-2026` est visible dans `bdb-demo.js` (DEMO_PASSWORD const).
Ce choix est délibéré pour la DX du projet — ce compte n'a accès qu'à des données publiques.

---

## 6 — MÉTRIQUES DE SUCCÈS

```
- Un visiteur peut naviguer dans tous les 17 modules en < 2 min
- Chaque module affiche 3 entrées réalistes (OR/IBODE context)
- Aucun bouton d'écriture n'est opérationnel
- La bannière démo est visible en permanence
- Le compte démo ne peut pas accéder aux modules admin/supervision
```

---
