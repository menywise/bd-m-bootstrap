# CTX_DEMO — Mode démo invité BDB

```
VERSION     : 1.0.0
DATE        : 2026-03-30
AUTEUR      : Manu + Claude
STATUT      : VALIDÉ — prêt pour session #15
PORTÉE      : login.html · bdb-shell.js · seed_demo.sql · tous modules (lecture seule)
JOURNAL_REF : JOURNAL_DECISIONS_V1_31_0
BACKLOG_REF : Session #15 (PROMPT_MODE_DEMO_INVITÉ)
REMPLACE    : Session #8 SEED_DEMO (fusionnée)
```

---

## 1 — OBJECTIF

Permettre à un visiteur externe de découvrir BDB sans compte, avec des données représentatives, sans risque de pollution des données réelles.

Cas d'usage :
- Présentation à la direction (P6)
- Démonstration à un collègue sceptique (P4/P8)
- Évaluation par un prospect (autre bloc opératoire)
- Portfolio professionnel Manu

---

## 2 — ARCHITECTURE RETENUE

### 2.1 Approche hybride piloté par RLS

Pas de schema séparé. Pas de colonne `is_demo` partout. Un **compte Supabase dédié** dont les données sont naturellement isolées par la RLS `user_id = auth.uid()`.

```
Données référentielles (non sensibles)  → VRAIES DONNÉES en lecture seule
Données user-scoped (sensibles)          → SEED FICTIF lié au user_id démo
```

### 2.2 Compte démo

```
Email    : demo@bdb.local
Password : demo-bdb-2026
Rôle     : membre (app_role = 'membre')
Approved : true (profiles_directory.approved = true)
```

Ce compte est créé manuellement dans Supabase Auth Dashboard (pas via SQL — auth.users est protégé).

### 2.3 Données visibles par le visiteur démo

| Source | Données | Exemple | Maintenance |
|---|---|---|---|
| thesaurus_protocoles | 460 protocoles réels | PTH, LCA, HERNIE DISCALE… | Zéro |
| thesaurus_interventions | 89 721 interventions réelles | Fréquences, Pareto, analytics | Zéro |
| thesaurus_chirurgiens | 12 chirurgiens réels | Noms publics dans l'équipe | Zéro |
| thesaurus_panseuses | 142 panseuses réelles | Noms publics dans l'équipe | Zéro |
| categories | Catégories réelles | Toutes catégories actives | Zéro |
| materiel_types + zones | Référentiels réels | Types matériel, zones stockage | Zéro |
| app_groups + app_modules | Navigation réelle | Tous modules visibles | Zéro |
| profiles_directory | Annuaire réel (approved=true) | Noms équipe | Zéro |
| fiches_intervention | **SEED FICTIF** (5-10 fiches) | Fiches Lorem ipsum | Schema change |
| transmissions | **SEED FICTIF** (5-10 transmissions) | Transmissions Lorem ipsum | Schema change |
| cours | **SEED FICTIF** (3-5 cours) | Cours Lorem ipsum | Schema change |
| anatomie | **SEED FICTIF** (3-5 entrées) | Régions anatomiques fictives | Schema change |
| installation_patient | **SEED FICTIF** (3-5 entrées) | Installations fictives | Schema change |
| preferences_chirurgien | **SEED FICTIF** (2-3 entrées) | Préférences fictives | Schema change |

**Règle** : le seed fictif est petit (~60-80 lignes SQL total). Il ne change que si le schema d'une table user-scoped change.

### 2.4 Modules sans données user-scoped

Les modules cognitifs (disc, paxis, collab, organisateur, dork) utilisent localStorage → le visiteur démo verra ces modules vides. Acceptable : ces modules sont en Phase 1 migration.

---

## 3 — DÉTECTION ET MODE LECTURE SEULE

### 3.1 Détection dans bdb-shell.js

```javascript
// Après init window.bdbUser
window.bdbUser.isDemo = (window.bdbUser.email === 'demo@bdb.local');
```

### 3.2 Comportement lecture seule (côté JS uniquement)

Quand `window.bdbUser.isDemo === true` :

```
- Boutons INSERT/UPDATE/DELETE → disabled + tooltip "Mode démo — lecture seule"
- Boutons d'upload image → masqués
- Formulaires de création → masqués ou désactivés
- Navigation → complète (tous modules accessibles)
- Recherche → fonctionnelle
- Analytics thesaurus → fonctionnels (données réelles)
- Export CSV → autorisé (données non sensibles)
```

**IMPORTANT** : la protection est **JS-only**. La RLS Supabase protège les données des autres utilisateurs, mais le compte démo peut techniquement écrire ses propres données. Le JS empêche l'action, pas la possibilité technique.

### 3.3 Bannière démo

Header sticky : bandeau jaune discret sous le header bdb-shell :

```
🔍 Mode démonstration — Données réelles en lecture seule
   [Créer un compte →]
```

Le lien "Créer un compte" pointe vers `login.html` (formulaire inscription).

---

## 4 — POINT D'ENTRÉE : login.html

### 4.1 Bouton démo

Sous le formulaire de connexion existant :

```
──────── ou ────────
[Essayer en mode démo]
```

Action : `signInWithPassword('demo@bdb.local', 'demo-bdb-2026')` → redirect index.html.

### 4.2 Coexistence avec OAuth (#16)

Si OAuth est implémenté (#16), la zone login devient :

```
[Email + mot de passe]
──────── ou ────────
[Continuer avec Google]
[Continuer avec Apple]
──────── ou ────────
[Essayer en mode démo]
```

Le bouton démo est toujours en dernier (priorité basse visuellement).

---

## 5 — SEED SQL

### 5.1 Fichier

`migrations/seed_demo.sql` — exécutable en SQL Editor cloud.

### 5.2 Structure

```sql
-- seed_demo.sql
-- Données fictives pour le compte démo BDB
-- Prérequis : compte demo@bdb.local créé dans Supabase Auth Dashboard
-- Réexécutable : DELETE + INSERT (idempotent)

-- Variable : remplacer par l'UUID réel du compte démo après création
-- DO $$ DECLARE demo_uid uuid := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; $$

-- 1. Nettoyage (réexécution propre)
DELETE FROM fiches_intervention WHERE user_id = demo_uid;
DELETE FROM transmissions WHERE user_id = demo_uid;
DELETE FROM cours WHERE user_id = demo_uid;
DELETE FROM anatomie WHERE user_id = demo_uid;
DELETE FROM installation_patient WHERE user_id = demo_uid;
DELETE FROM preferences_chirurgien WHERE user_id = demo_uid;

-- 2. Fiches fictives (5-10)
-- 3. Transmissions fictives (5-10)
-- 4. Cours fictifs (3-5)
-- 5. Anatomie fictive (3-5)
-- 6. Installation patient fictive (3-5)
-- 7. Préférences chirurgien fictives (2-3)
```

Le contenu Lorem ipsum sera rédigé lors de la session #15. Il doit couvrir :
- Au moins 1 entrée avec image (pour tester l'affichage)
- Au moins 1 entrée avec tags
- Au moins 1 entrée avec rich text (Quill HTML)
- Des titres réalistes (pas "Test 1", "Test 2")

### 5.3 Re-seed

En cas de pollution : exécuter `seed_demo.sql` (DELETE WHERE user_id + INSERT). Durée < 30 secondes.

---

## 6 — PRÉREQUIS

| # | Prérequis | Statut | Impact |
|---|---|---|---|
| 1 | Compte demo@bdb.local créé dans Supabase Auth | À faire | Bloquant |
| 2 | profiles + profiles_directory peuplés pour ce user_id | À faire (trigger auto ?) | Bloquant |
| 3 | user_roles = membre pour ce user_id | À faire | Bloquant |
| 4 | bdb-shell.js détecte isDemo | À coder | Bloquant |
| 5 | Chaque module vérifie isDemo pour lecture seule | À coder | Module par module |
| 6 | seed_demo.sql rédigé et exécuté | À faire | Bloquant |
| 7 | Bouton "Essayer en mode démo" sur login.html | À coder | Bloquant |

### Idéalement après :
- #4 AUDIT_IMAGES (images corrigées → seed avec images fonctionnelles)
- #9 DATA_MODEL_AUDIT (schema fiable → seed aligné)

---

## 7 — INTERDIT

```
INTERDIT-DEMO-01 : Ne jamais stocker le mot de passe démo en JS (il est affiché sur login.html, pas hardcodé dans le code)
INTERDIT-DEMO-02 : Ne jamais donner le rôle admin au compte démo
INTERDIT-DEMO-03 : Ne jamais afficher les données sensibles (RGPD) au visiteur démo — la RLS existante suffit, ne pas la contourner
INTERDIT-DEMO-04 : Ne jamais modifier la RLS pour le mode démo — le JS gère la lecture seule, pas la DB
```

---

## 8 — MÉTRIQUES DE SUCCÈS

```
- Un visiteur peut naviguer dans tous les modules en < 2 min
- Le thesaurus affiche les vraies analytics (396+ protocoles, fréquences, Pareto)
- Les modules user-scoped affichent du contenu réaliste (pas de pages vides)
- Aucun bouton d'écriture n'est cliquable
- Le re-seed prend < 30 secondes
```

---

## HISTORIQUE

```
2026-03-30 — v1.0.0 — Création. Approche hybride RLS retenue. Remplace #8 SEED_DEMO.
```
