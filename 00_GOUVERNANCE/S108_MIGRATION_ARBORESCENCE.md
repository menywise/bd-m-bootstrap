# Migration arborescence BDB — Spécification

```
SESSION  : #108 (brainstorm post-GPS)
DATE     : 2026-04-26
STATUT   : PROPOSITION — à valider par Manu avant exécution
PRINCIPE : Aligner la profondeur de tous les dossiers contenant du HTML shell
           pour unifier data-root-path et éliminer les variations.
```

---

## 1. RÈGLE STRUCTURELLE

Tout fichier HTML utilisant bdb-shell vit à profondeur 2 ou à la racine.

| Profondeur | data-root-path | Qui vit là |
|---|---|---|
| 0 (racine) | `./` | Portail (index.html), auth (login.html), erreurs (403, 404), système (offline, maintenance) |
| 1 (`dossier/`) | `../` | site/ (public, sans shell) — PAS de pages shell à profondeur 1 |
| 2 (`dossier/sous-dossier/`) | `../../` | modules/[nom]/, createur/[nom]/, app/[nom ou fichier] |

Bénéfice : un seul template pour toutes les pages shell de profondeur 2. Un seul data-root-path. Un seul pattern de chaîne CSS/JS. Zéro variation.

---

## 2. CE QUI BOUGE

### 2.1 — Racine → app/ (pages transversales authentifiées)

Pages membre qui utilisent bdb-shell et ne sont pas des modules :

| Fichier actuel (racine) | Destination | Changement |
|---|---|---|
| aide.html | app/aide.html | data-root-path ./ → ../ |
| archivage.html | app/archivage.html | idem |
| changelog.html | app/changelog.html | idem |
| contact.html | app/contact.html | idem |
| export.html | app/export.html | idem |
| impressions.html | app/impressions.html | idem |
| notifications.html | app/notifications.html | idem |
| onboarding.html | app/onboarding.html | idem |
| parametres.html | app/parametres.html | idem |
| recherche.html + recherche-app.js | app/recherche.html + app/recherche-app.js | idem |
| sondage.html | app/sondage.html | idem |
| saisie-invite.html | app/saisie-invite.html | idem |
| suppression-compte.html | app/suppression-compte.html | idem |

**13 fichiers HTML + 1 JS.**

Pages qui RESTENT à la racine (système / auth / PWA) :
- index.html, login.html (portail + auth)
- 403.html, 404.html (erreurs .htaccess)
- maintenance.html, offline.html (PWA + maintenance)
- pending.html, reset-password.html, session-expiree.html, unauthorized.html (flux auth)
- mentions-legales.html, politique-confidentialite.html (légal — accessibles sans auth)
- manifest.json, sw.js, robots.txt, favicon.ico, .env, .htaccess, .ftpignore, .gitignore
- CLAUDE.md, CLAUDE_PROJECT_INVENTORY.txt, test-php-info.php
- _TEMPLATE_PORTAIL_V5_0_1.html, _TEMPLATE_RACINE_V5_0_1.html

### 2.2 — Racine → createur/ (L3 exclusivement)

| Dossier actuel | Destination | Changement root-path |
|---|---|---|
| atelier/ | createur/atelier/ | ../ → ../../ (aligne sur modules/) |
| conseil/ | createur/conseil/ | ../ → ../../ (aligne sur modules/) |
| bernard/ | createur/bernard/ | ../ → ../../ (aligne sur modules/) |
| back-office/ | createur/back-office/ | ../ → ../../ |

**~60 fichiers HTML répartis dans 4 dossiers.**

Ce qui change dans chaque fichier HTML : `data-root-path` passe de `../` à `../../`.
Ce qui change dans chaque lien CSS/JS relatif : toutes les URL vers `css/`, `js/`, `modules/` changent d'un niveau.

### 2.3 — Rien d'autre ne bouge

- site/ reste site/ (déjà en place)
- modules/ reste modules/ (tous les modules y compris admin et supervision)
- css/, js/ restent à la racine
- migrations/, scripts/, 00_GOUVERNANCE/, _PROJET_CLAUDE/, supabase/, assets/ ne bougent pas

---

## 3. CE QU'IL FAUT METTRE À JOUR APRÈS LES DÉPLACEMENTS

### 3.1 — Dans chaque fichier HTML déplacé

- `data-root-path` : mettre à jour selon la nouvelle profondeur
- Tous les `<link href="..."` et `<script src="..."` relatifs vers css/ et js/
- Les liens internes entre pages (ex: lien vers login.html depuis app/)

### 3.2 — Dans bdb-shell.js

Vérifier si des URLs sont construites à partir de `data-root-path`. Si oui, rien à changer (le path fait le travail). Si des chemins sont en dur → corriger.

### 3.3 — .htaccess racine (OVH)

Redirections 301 pour les anciennes URLs :
```
# Pages transversales → app/
RewriteRule ^aide\.html$ /bdb/app/aide.html [R=301,L]
RewriteRule ^changelog\.html$ /bdb/app/changelog.html [R=301,L]
# ... (13 règles)

# L3 créateur → createur/
RewriteRule ^atelier/(.*)$ /bdb/createur/atelier/$1 [R=301,L]
RewriteRule ^conseil/(.*)$ /bdb/createur/conseil/$1 [R=301,L]
RewriteRule ^bernard/(.*)$ /bdb/createur/bernard/$1 [R=301,L]
```

### 3.4 — Base de données

Vérifier si `app_modules.path` référence des chemins impactés. Si oui, UPDATE.

### 3.5 — Scripts existants

Vérifier dans les 32 scripts PS1 lesquels référencent des chemins atelier/, conseil/, bernard/ ou des fichiers racine déplacés.

### 3.6 — Sidebar bdb-shell.js

Si les liens sidebar vers atelier/conseil/bernard sont construits dynamiquement, vérifier la source du chemin.

---

## 4. ARBORESCENCE CIBLE

```
C:\DEV\BIBLE_DE_BLOC\
│
├── index.html                      ← Portail (profondeur 0)
├── login.html                      ← Auth
├── 403.html, 404.html              ← Erreurs
├── pending.html, unauthorized.html ← Flux auth
├── reset-password.html             ← Flux auth
├── session-expiree.html            ← Flux auth
├── maintenance.html, offline.html  ← Système / PWA
├── mentions-legales.html           ← Légal (public)
├── politique-confidentialite.html  ← Légal (public)
├── manifest.json, sw.js, robots.txt, favicon.ico
├── .env, .htaccess, .gitignore, .ftpignore
├── CLAUDE.md
├── _TEMPLATE_*.html                ← Templates référence
│
├── app/                            ← Pages transversales authentifiées (profondeur 1)
│   ├── aide.html
│   ├── archivage.html
│   ├── changelog.html
│   ├── contact.html
│   ├── export.html
│   ├── impressions.html
│   ├── notifications.html
│   ├── onboarding.html
│   ├── parametres.html
│   ├── recherche.html
│   ├── recherche-app.js
│   ├── sondage.html
│   ├── saisie-invite.html
│   └── suppression-compte.html
│
├── site/                           ← Mini-site public (ne bouge pas)
│
├── modules/                        ← Tous les modules (profondeur 2)
│   ├── admin/
│   ├── anatomie/
│   ├── annuaire/
│   ├── arsenal/
│   ├── boite-a-idees/
│   ├── carnet-bord/
│   ├── cours/
│   ├── disc/
│   ├── faq/
│   ├── fiches/
│   ├── ged/                        ← Réservé (vide, promesse GPS)
│   ├── glossaire/
│   ├── installation/
│   ├── interview/
│   ├── medacta-coste/
│   ├── objectifs/
│   ├── organisateur/
│   ├── pedagogie/                  ← Réservé (vide, promesse GPS)
│   ├── planning/
│   ├── preferences/
│   ├── profile/
│   ├── recueil-situation/          ← Réservé (promesse GPS)
│   ├── supervision/
│   ├── template/
│   ├── thesaurus/
│   ├── transmissions/
│   └── veille-documentaire/
│
├── createur/                       ← L3 — guard isCreator (profondeur 2)
│   ├── atelier/                    ← Même structure interne, root-path ../../
│   ├── conseil/
│   ├── bernard/
│   └── back-office/
│
├── css/                            ← Ne bouge pas
├── js/                             ← Ne bouge pas
├── migrations/                     ← Ne bouge pas
├── scripts/                        ← Ne bouge pas
├── 00_GOUVERNANCE/                 ← Ne bouge pas
├── _PROJET_CLAUDE/                 ← Ne bouge pas
├── supabase/                       ← Ne bouge pas
└── assets/                         ← Ne bouge pas
```

---

## 5. PROBLÈME OUVERT — Profondeur app/

Les pages dans app/ sont à profondeur 1. Or la règle dit "tout shell = profondeur 2".

Deux options :
- **Option A** : app/ reste à profondeur 1, data-root-path="../". Exception documentée — ces pages n'ont pas d'admin.html ni de -ui.css, ce sont des pages simples.
- **Option B** : on crée app/transversal/ pour forcer la profondeur 2 et aligner le root-path sur "../../". Mais un sous-dossier unique dans app/ est inutilement profond.

Mon choix : **Option A**. Les pages transversales sont simples (1 HTML, pas de JS propre sauf recherche). Pas besoin de les aligner sur le pattern module complet. L'exception est documentée et concerne un groupe fermé de fichiers.

---

## 6. VOLUME DE TRAVAIL

- **13 fichiers HTML** racine → app/ (mise à jour root-path + liens relatifs)
- **~60 fichiers HTML** dans atelier + conseil + bernard + back-office → createur/ (mise à jour root-path + liens relatifs)
- **1 .htaccess** : ~20 règles de redirection
- **0 nouveau script** — déplacements manuels ou via un script existant adapté
- Vérification des 32 scripts existants pour chemins impactés
- Vérification sidebar shell pour liens L3
