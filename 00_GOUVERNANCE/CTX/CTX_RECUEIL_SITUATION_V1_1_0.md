# CTX_STB — Contexte module STB (Situation de Travail Bloquante)
```
VERSION   : 1.1.0
DATE      : 2026-03-21
AUTEUR    : Manu + Claude
STATUT    : MODULE BDB EMBRYONNAIRE — migration Lovable → BDB en attente (Q1→Q3 à arbitrer)
NOYAU_REF : NOYAU_VERITE_V2_4_0
CSS_REF   : chaîne standard BDB (non conforme actuellement — module non migré)
SOURCE    : CTX_RECUEIL_SITUATION_BLOQUANTE.md (Lovable) + description Manu
TRACKER_STATUS     : embryo
TRACKER_SHELL      : non
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : Stack React/TS non migrée, Supabase Lovable cloud distinct (wpxguxyksdyeosddtvwr), design Tailwind/shadcn non conforme CDS, mot de passe admin hardcodé dans edge functions, bdb-shell absent
TRACKER_UPDATED    : 2026-03-21
DELTA v1.0.1 → v1.1.0 :
  Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
  Q4 soldée (D-2026-03-21) : accès membres connectés uniquement — auth BDB standard.
  Dossier cible fixé : modules/recueil-situation/ (D-2026-03-21).
  CSS_REF ajouté à l'en-tête.
  CTX_RECUEIL_SITUATION_BLOQUANTE.md : à archiver hors repo (credentials en clair).
  Q1→Q3 : toujours ouvertes — bloquent la migration.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* — mise à niveau TEMPLATE V1.2.0.
                   Q4 soldée : accès membres connectés uniquement (auth BDB standard).
                   Dossier cible fixé : modules/recueil-situation/
                   CTX_RECUEIL_SITUATION_BLOQUANTE.md signalé à archiver hors repo.
RESTE À FAIRE    : Arbitrages Q1, Q2, Q3 (bloquants — voir section dédiée),
                   créer stb_responses dans BDB Supabase (SQL),
                   reconstruire UI HTML/JS vanilla Bootstrap,
                   brancher bdb-shell.js v1.4.0 (auth standard — Q4 soldée),
                   INSERT app_modules (visibility=member, status=coming_soon),
                   archiver CTX_RECUEIL_SITUATION_BLOQUANTE.md hors repo
VIOLATIONS ACTIVES :
  - Stack React/TS non migrée → reconstruire en HTML/JS vanilla Bootstrap
  - Supabase Lovable cloud distinct (wpxguxyksdyeosddtvwr) → migrer vers BDB cloud
  - Design Tailwind/shadcn → remplacer par Bootstrap 5.3.2 + CDS
  - Mot de passe admin hardcodé dans edge functions Lovable → migrer vers window.bdbUser.isAdmin
  - bdb-shell.js absent → brancher v1.4.0 (auth standard — Q4 soldée)
```

---

## RÔLE

Recueil **anonyme** de situations de travail bloquantes au bloc opératoire.

Questionnaire en 4 étapes permettant aux professionnels de décrire :
- Leur fonction (rôle dans le bloc)
- La situation de travail rencontrée
- Le blocage rencontré
- Leur ressenti

Objectif : collecter des données terrain réelles pour alimenter la connaissance
des STB documentées dans NOYAU_VERITE BLOC 1 (STB-01 à STB-07).

**Accès : membres connectés uniquement (auth BDB standard — bdb-shell.js).**
Décision : D-2026-03-21-STB-Q4.

---

## CONTENU FONCTIONNEL (issu du CTX Lovable — à reproduire en BDB)

### Questionnaire 4 étapes
- Q1 : Fonction (6 choix + "Autre" libre : instrumentiste, panseur, etc.)
- Q2 : Situation de travail (textarea, min 10 chars)
- Q3 : Blocage rencontré (textarea, min 10 chars)
- Q4 : Ressenti (textarea libre) + bouton Soumettre

### Protections anti-bot (à arbitrer — voir Q3)
- Honeypot (champ invisible)
- Timing check (rejet si < 3s)
- Rate limiting par IP hashée (3/min, 10/h — non persisté)
- Validation contenu : anti-gibberish, anti-copier-coller entre champs

### Interface admin
- Export CSV/JSON des réponses
- Tableau de bord : comptage des réponses
- Option suppression après export

### Contrainte d'anonymat strict — NON NÉGOCIABLE
**Aucun** `created_at`, `user_id` ou IP stocké dans `stb_responses`.
L'authentification BDB (bdb-shell) identifie le membre pour l'accès —
elle ne trace pas l'auteur de la réponse. Ces deux niveaux sont strictement séparés.

---

## ÉTAT TECHNIQUE ACTUEL (Lovable — non migré)

- React + TypeScript + Tailwind + shadcn/ui
- Supabase Lovable cloud (projet `wpxguxyksdyeosddtvwr`) — distinct du BDB cloud
- Edge Functions Deno (`submit-response`, `export-responses`, `admin-stats`)
- URL publiée : https://stb3-manu.lovable.app (fonctionnelle — référence terrain)

---

## CE QUI N'EST PAS BDB COMPLIANT (violations à corriger en session migration)

| Élément Lovable | Cible BDB |
|---|---|
| React + TypeScript | HTML/JS vanilla |
| Tailwind + shadcn/ui | Bootstrap 5.3.2 + CDS |
| Supabase Lovable cloud | BDB cloud `ecpzrygzdugwwkqbsajn` |
| Edge Functions Deno | Logique JS client + RLS Supabase (à arbitrer Q1) |
| Mot de passe admin hardcodé | `window.bdbUser.isAdmin` (Q4 soldée → auth BDB standard) |
| Accès public anonyme | Membres connectés uniquement (Q4 soldée) |

---

## SCHÉMA SUPABASE CIBLE

Table `stb_responses` :

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid PK | auto |
| fonction | text | not null |
| situation_de_travail | text | min 10 chars |
| blocage_rencontre | text | min 10 chars |
| ressenti | text | nullable |

**Pas de** `created_at`, `user_id`, `ip` — anonymat strict maintenu même avec auth BDB.

RLS cibles :
```
INSERT → tout membre authentifié (is_approved())
SELECT → admin uniquement (is_admin())
DELETE → admin uniquement (is_admin())
```

---

## ARBITRAGES OUVERTS — BLOQUANTS AVANT MIGRATION

```
Q1 — Les Edge Functions Deno doivent-elles être reproduites ou
     remplacées par logique JS client + RLS Supabase ?
     (BDB n'utilise pas d'edge functions — recommandation : JS client + RLS)
     → Bloque l'architecture technique de submit-response

Q2 — L'export admin : protégé par mot de passe hardcodé (Lovable)
     ou migré vers window.bdbUser.isAdmin (BDB standard) ?
     Q4 soldée → auth BDB standard → recommandation : window.bdbUser.isAdmin
     → À confirmer explicitement par Manu avant de coder l'export

Q3 — Les protections anti-bot côté serveur (rate limiting, timing check)
     sont-elles à reproduire ou simplifiées en validation client seule ?
     (Sans edge functions : rate limiting serveur non disponible nativement)
     → Bloque le niveau de protection anti-abus
```

**Ne pas commencer la migration avant que Q1, Q2, Q3 soient arbitrés.**

---

## LIEN AVEC LE NOYAU_VERITE

Les 7 STB documentées dans NOYAU_VERITE BLOC 1 (STB-01 à STB-07) sont des situations
**figées issues de l'observation terrain**. Ce module permet de collecter de nouvelles
situations pour enrichir cette base. Il ne modifie pas les STB figées.

---

## AUTORISÉ

- Créer le schéma SQL `stb_responses` sur BDB Supabase cloud
- Reconstruire l'UI en HTML/JS vanilla Bootstrap après arbitrage Q1→Q3
- Brancher bdb-shell.js v1.4.0 (auth standard — Q4 soldée)
- Reprendre les validations anti-bot côté client

## INTERDIT

- Migrer le code React/TypeScript tel quel dans BDB
- Stocker `created_at`, `user_id` ou IP — anonymat non négociable
- Qualifier ce module de "terminé" avant Q1, Q2, Q3 arbitrés
- Utiliser le Supabase Lovable cloud (`wpxguxyksdyeosddtvwr`) dans BDB
- Reproduire le mot de passe admin hardcodé — utiliser window.bdbUser.isAdmin
- Conserver CTX_RECUEIL_SITUATION_BLOQUANTE.md dans un dossier versionné ou partageable

---

## DÉPENDANCES CIBLES (post-migration)

```
- js/bdb-shell.js v1.4.0 (auth standard — navigation dynamique app_modules)
- js/supabase-client.js (window.bdb — BDB cloud)
- ../../css/cds-overrides.css
- ../../css/recueil-situation-ui.css (à créer)
- Table stb_responses (à créer sur BDB Supabase cloud)
```

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-15 | 1.0.0 | Création. Issu CTX Lovable + description Manu. Module fonctionnel sur Lovable, non migré BDB. 4 questions ouvertes dont Q4 bloquante pour l'architecture. |
| 2026-03-16 | 1.0.1 | NOYAU_REF V2_4_0. |
| 2026-03-21 | 1.1.0 | Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0. Q4 soldée : membres connectés, auth BDB standard (D-2026-03-21-STB-Q4). Dossier cible fixé : modules/recueil-situation/. CSS_REF ajouté. CTX_RECUEIL_SITUATION_BLOQUANTE.md signalé à archiver hors repo (credentials en clair). Q1→Q3 maintenues ouvertes. |
