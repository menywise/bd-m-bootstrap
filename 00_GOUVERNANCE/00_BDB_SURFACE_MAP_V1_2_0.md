# BDB — Carte Macro des Surfaces HTML
**Version :** V1.2.0  
**Date :** 2026-04-13  
**Auteur :** Manu + Claude (session audit + production + correction liens)  
**Source :** Audit mini-site 2026-04-13 + pages-manquantes.zip + mémoire projet  
**Usage :** Brief de référence avant toute production de page. Mettre à jour à chaque livraison.  
**Delta V1.1.0 → V1.2.0 :**
- Audit liens cassés TERMINÉ — 23 fichiers audités, 5 cassures corrigées
- `contact.html` : doublon `site/site/` supprimé (#1 #2)
- `login.html` : listener Ctrl+Shift+A → `admin-bootstrap.html` supprimé (#3)
- `404.html` + `modules/profile/index.html` : `admin-memo.html` → `atelier/memo.html` (#4)
- `404.html` + `modules/profile/index.html` : `planning/dashboard.html` → `planning/index.html` (#5)
- Zéro lien cassé restant en périmètre ✅

---

## Légende

| Statut | Signification |
|---|---|
| ✅ | Livré, fonctionnel, déployé |
| ⚠ | Template vide / structure ok / contenu manquant |
| ❌ | Inexistant — à créer |
| 🔒 | Auth requise (bdb-shell.js) |
| 🌐 | Public (pas d'auth) |
| 📱 | Candidat application Android Play Store |
| 🏪 | Requis par le Play Store (obligation Google) |

---

## SURFACE 1 — Mini-site public `site/`

**Audience :** Prospects, Brigitte (Direction), Chirurgiens, grand public  
**Auth :** Aucune — 🌐 partout  
**Voix :** tu (P1-P5) / vous (P6-P7)  
**Storytelling :** vision → pas-app → audiences → fonctionnalites → risques → adoption → faq

| Fichier | Titre | Statut | Personas couverts | Liens entrants | Liens sortants | Gaps audit |
|---|---|---|---|---|---|---|
| `index.html` | Accueil | ✅ v4.0.0 | P1 P2 P3 P6 P7 | — | vision, audiences, instances | G1 : lien → instances manquant |
| `vision.html` | Vision | ✅ v4.0.0 | P2 P3 | index | pas-app | — |
| `pas-app.html` | Ce que ce n'est pas | ✅ v4.0.0 | P4 P5 P8 | vision, audiences | audiences | G6 : sous-lié |
| `fonctionnalites.html` | Ce que BDB fait | ✅ v4.0.0 | P3 P5 | audiences | risques | G3 G4 G5 |
| `audiences.html` | Pour qui | ✅ v5.2.0 | P1 P2 P3 P6 P7 | index | fonctionnalites, instances, pas-app | G6 |
| `risques.html` | Ce qui pourrait mal tourner | ✅ v4.0.0 | P5 P6 | fonctionnalites | adoption, instances | Nav : lien → instances manquant |
| `adoption.html` | Comment ça s'adopte | ✅ v4.0.0 | P5 P7 P8 | risques | faq | G7 |
| `faq.html` | Questions fréquentes | ✅ v5.0.0 | Tous | adoption | index | G9 : audit table site_faq |
| `instances.html` | Déploiements | ✅ v1.0.0 | P5 P6 | audiences, index (manquant) | adoption | G2 : ROI positif manquant |
| `glossaire.html` | Lexique | ✅ v1.1.0 | P1 P3 | nav | — | Données statiques JS — à brancher sur table `glossaire` Supabase |
| `accessibilite.html` | Accessibilité WCAG | ✅ — | WCAG | — | — | Non liée depuis le nav ni le footer |

### Gaps mini-site à corriger (audit 2026-04-13)

| # | Gap | Page | Action | Priorité |
|---|---|---|---|---|
| G1 | Lien index → instances manquant (P5 sceptique) | `index.html` | Ajouter lien "Voir les données réelles →" | 🔴 |
| G2 | instances.html liste ZÉROs mais pas ROI positif (P6) | `instances.html` | Section "Ce que ça change" — 3 bullets | 🔴 |
| G3 | Usage mobile rapide jamais affirmé positivement (P3) | `fonctionnalites.html` | 1 phrase "dans le couloir, en 5 secondes" | 🔴 |
| G4 | P2 ancien absent de fonctionnalites.html | `fonctionnalites.html` | 1 phrase dans "Transmissions libres" | 🟠 |
| G5 | P7 chirurgien absent de fonctionnalites.html | `fonctionnalites.html` | Développer "préférences chirurgien" | 🟠 |
| G6 | pas-app.html sous-liée depuis audiences | `audiences.html` | Ajouter lien depuis onglet Équipe | 🟠 |
| G7 | Chirurgien = influenceur non mentionné dans adoption | `adoption.html` | 1 phrase "un chirurgien convaincu change tout" | 🟠 |
| G8 | P-pharma absent (futur) | — | Profil card à planifier si intégration actée | 🔵 |
| G9 | FAQ : contenu dynamique, couverture persona inconnue | DB | Audit table `site_faq` | 🔵 |
| Nav | Lien risques → instances manquant | `risques.html` | 1 lien | 🟠 |
| Nav | accessibilite.html non liée | nav + footer | Ajouter lien | 🔵 |

---

## SURFACE 2 — Application web authentifiée `modules/`

**Audience :** Membres (Julie, Sabine, Olivia, Sophie, Dr COSTE…)  
**Auth :** bdb-shell.js obligatoire — 🔒 partout  
**Root path :** `../../` depuis `modules/[module]/`

### Modules L1 — Universels (déployés)

| Module | Fichier principal | Statut | Persona primaire | 📱 Android |
|---|---|---|---|---|
| Thésaurus | `modules/thesaurus/index.html` | ✅ | Sabine, Olivia | 📱 Candidat |
| Fiches intervention | `modules/fiches/index.html` | ✅ | Sabine, Julie | 📱 Candidat |
| Arsenal | `modules/arsenal/index.html` | ✅ | Sabine | — |
| Transmissions | `modules/transmissions/index.html` | ✅ | Sabine, Olivia | — |
| Cours | `modules/cours/index.html` | ✅ | Julie, Olivia | 📱 Candidat |
| Anatomie | `modules/anatomie/index.html` | ✅ | Julie | — |
| Installation patient | `modules/installation/index.html` | ✅ | Sabine | — |
| Préférences chirurgien | `modules/preferences/index.html` | ✅ | Dr COSTE, Sabine | — |
| Glossaire | `modules/glossaire/index.html` | ✅ | Julie, P1 | — |
| DISC | `modules/disc/index.html` | ✅ | Tous | — |
| Dork (recherche pro) | `modules/dork/index.html` | ✅ | Olivia, Sabine | — |
| PAXIS (signalements) | `modules/paxis/index.html` | ✅ | Sabine, Olivia | — |
| Annuaire | `modules/annuaire/index.html` | ✅ | Tous | — |
| Planning | `modules/planning/dashboard.html` | ✅ localStorage | Olivia | — |
| Profil utilisateur | `modules/profile/index.html` | ✅ | Tous | — |
| Administration | `modules/admin/index.html` | ✅ S#84 | Olivia (admin) | — |

### Modules L1 — Embryonnaires / En cours

| Module | Fichier principal | Statut | Blocage | Priorité backlog |
|---|---|---|---|---|
| Carnet de bord | `modules/carnet/index.html` | ⚠ Tables définies, UI absente | Session dédiée | #1 backlog |
| Organisateur | `modules/organisateur/index.html` | ⚠ Session #44 à faire | — | #8 backlog |
| Collab | `modules/collab/index.html` | ⚠ localStorage — migration Supabase pending | Migration localStorage | — |
| Supervision | `modules/supervision/index.html` | ⚠ Embryonnaire | — | — |
| Recherche globale | `recherche.html` (racine) | ⚠ Structure ok, `recherche-app.js` absent | — | — |

### Pages transverses app (racine ou modules/[module]/)

Ces pages ne sont pas des modules métier — elles sont des pages de service de l'app.

| Page | Fichier | Emplacement cible | Auth | Statut | Priorité |
|---|---|---|---|---|---|
| Aide / Documentation | `aide.html` | Racine | 🔒 | ✅ Livré 2026-04-13 | Haute |
| Onboarding premier accès | `onboarding.html` | Racine | 🔒 | ✅ Livré 2026-04-13 | Haute |
| Notifications | `notifications.html` | Racine | 🔒 | ✅ Structure livrée — table Supabase à créer | Haute |
| Changelog / Notes de version | `changelog.html` | Racine | 🔒 | ✅ Livré 2026-04-13 | Moyenne |
| Paramètres instance | `parametres.html` | Racine ou admin/ | 🔒 Admin | ✅ Structure livrée — attend `bdb_instance` | Moyenne |
| Export données | `export.html` | Racine ou admin/ | 🔒 Admin | ✅ Structure livrée — logique à brancher | Moyenne |
| Impressions | `impressions.html` | Racine | 🔒 | ✅ Livré 2026-04-13 | Basse |
| Archivage | `archivage.html` | Racine ou admin/ | 🔒 Admin | ✅ Structure livrée — RPC archive_list à créer | Basse |

---

## SURFACE 3 — Pages système (standalone, sans auth)

**Audience :** Tout utilisateur dans un état d'erreur / hors session  
**Auth :** Aucune — 🌐  
**Contrainte :** Fonctionnelles sans bdb-shell, sans Supabase

| Page | Fichier | Statut | Rôle |
|---|---|---|---|
| Hors ligne (PWA) | `offline.html` | ✅ 38 lignes | Service Worker — affiché si réseau absent |
| Maintenance | `maintenance.html` | ✅ Livré 2026-04-13 | Affiché si app en maintenance (sw.js ou redirect) |
| Session expirée | `session-expiree.html` | ✅ Livré 2026-04-13 | Redirect après auto-logout inactivité (30 min) — passe ?redirect= |
| Login | `login.html` | ✅ | Auth entry point — return URL implémenté |
| Portail / Index | `index.html` | ✅ | Landing auth ou redirect |
| Saisie invité | `saisie-invite.html` | ⚠ RLS anon à révoquer | Page collective sans auth — D-2026-04-12-11 |

---

## SURFACE 4 — Play Store / Applications Android

**Contexte :** Certains modules BDB sont candidats à devenir des applications Android autonomes sur le Play Store. Chaque app Play Store nécessite des pages légales publiques déclarées dans la fiche store.

### Modules candidats Android 📱

Géré en base via colonne `app_modules.android_candidate BOOLEAN DEFAULT false`.  
**Source de vérité = Supabase**, pas ce document.

| Module | Justification | Persona cible | Priorité |
|---|---|---|---|
| **Préférences chirurgien** | Premier déployé — valeur immédiate Dr COSTE | Dr COSTE, Sabine | 🥇 Premier |
| Thésaurus | Consultation offline, usage terrain fréquent | Sabine, Julie | — |
| Fiches intervention | Consultation rapide pré-op, mobile natif | Sabine | — |
| Cours | Formation continue, offline, progression | Julie | — |
| Recherche globale | App légère, usage couloir en 5 secondes | P3 terrain | — |

### Pages obligatoires Play Store 🏪

Ces pages **doivent exister à une URL publique stable** et être déclarées dans la fiche développeur Google Play.  
**Rythme :** produites au même rythme que le travail app — aucune app Android n'est déployable pour le moment.

| Page | URL cible | Statut | Obligation |
|---|---|---|---|
| Politique de confidentialité | `hashtag.manuelrohaut.fr/bdb/politique-confidentialite.html` | ✅ Livré 2026-04-13 | **Obligatoire** avant toute soumission |
| Suppression de compte | `hashtag.manuelrohaut.fr/bdb/suppression-compte.html` | ✅ Livré 2026-04-13 | **Obligatoire** depuis 2023 (politique Google) |
| Mentions légales | `mentions-legales.html` | ✅ Livré 2026-04-13 | Recommandé |
| Support / Contact | `contact.html` | ✅ Livré 2026-04-13 | **Obligatoire** — URL support dans la fiche store |

### Assets Play Store à produire (par app)

| Asset | Format | Notes |
|---|---|---|
| Icône app | 512×512 PNG | Fond plein, pas de transparence |
| Feature graphic | 1024×500 PNG | Bandeau affiché dans le store |
| Screenshots téléphone | Min 2, max 8 — 16:9 ou 9:16 | Vrai UI ou mockup |
| Screenshots tablette | Optionnel mais recommandé | |
| Description courte | 80 caractères max | Accroche store |
| Description longue | 4000 caractères max | Storytelling personas |
| Catégorie | Productivité et/ou Médical — test A/B à définir par app | À arbitrer avant soumission |
| Classification contenu | PEGI / IARC | Formulaire automatique Google |
| Email développeur | Visible publiquement dans la fiche | |

---

## SURFACE 5 — Atelier L3 `atelier/`

**Audience :** Manu + Claude exclusivement  
**Auth :** bdb-shell.js avec `data-login-mode="modal"` et `data-root-path="../../"`

| Fichier | Rôle | Statut |
|---|---|---|
| `atelier/index.html` | Portail atelier | ✅ |
| `atelier/session-ia.html` | Launcher sessions IA | ✅ S#43 |
| `atelier/diagnostic.html` | Diagnostic terrain | ✅ |
| `atelier/memo.html` | Mémo persistant | ✅ |
| `atelier/overview.html` | Vue d'ensemble | ✅ |
| `atelier/ccam.html` | Outil CCAM | ✅ |
| `atelier/compat.html` | Compatibilité | ✅ |
| `atelier/cds/` | Templates CDS (6 figées + 14 manquantes) | ⚠ S#60 |

---

## Récapitulatif global

| Surface | Total pages | ✅ Livrées | ⚠ Templates | ❌ À créer |
|---|---|---|---|---|
| Mini-site public | 11 | 11 | 0 | 0 |
| App — modules métier | 16 déployés + 5 embryon. | 16 | 5 | 0 |
| App — pages transverses | 8 | 8 | 0 | 0 |
| Pages système | 6 | 4 | 1 | 0 |
| Play Store légales | 4 | 4 | 0 | 0 |
| Play Store assets | N/A | 0 | 0 | ∞ par app |
| Atelier L3 | 7 + cds/ | 7 | 14 cds | 0 |
| **TOTAL pages HTML** | **52+** | **50** | **20 cds** | **0** |

---

## Arbres de liens à construire (storytelling inter-pages)

### Chemin Nouveau (P1 — Isabelle)
```
index.html → audiences.html#nouveau → onboarding.html → [module] → aide.html
```

### Chemin Terrain (P3 — Julie/Sabine)
```
index.html → fonctionnalites.html → audiences.html#equipe → [module thesaurus/fiches]
```

### Chemin Direction (P6 — Brigitte)
```
index.html → audiences.html#direction → instances.html → contact.html [CTA démo]
risques.html → instances.html [lien manquant G-Nav]
```

### Chemin Chirurgien (P7 — Dr COSTE)
```
index.html → audiences.html#chirurgiens → [module preferences]
fonctionnalites.html → audiences.html#chirurgiens [à renforcer G5]
```

### Chemin Sceptique (P5 — Carole)
```
index.html → instances.html [G1 — lien manquant]
adoption.html → risques.html → instances.html [G-Nav]
```

### Chemin Play Store
```
fiche store → politique-confidentialite.html [obligatoire]
fiche store → suppression-compte.html [obligatoire]
fiche store → contact.html [support URL obligatoire]
app Android → [module] → mentions-legales.html
```

---

## Prochaines actions par ordre de valeur

### ✅ Fait cette session
- Corrections G1→G7 mini-site (7 fichiers)
- Pages système : maintenance + session-expiree
- Pages transverses app : onboarding + aide + notifications
- Pages admin : changelog + parametres + export + impressions + archivage
- Pages Play Store : politique-confidentialite + suppression-compte + mentions-legales + contact
- Audit liens cassés — 5/5 corrigés ✅

### 🟠 Prochaines sessions
- Brancher `notifications.html` sur table Supabase (à créer)
- Brancher `parametres.html` sur table `bdb_instance` (S#76)
- Brancher `archivage.html` sur RPC `archive_list` (à créer)
- Compléter les 14 templates CDS manquants (`atelier/cds/`)
- Audit table `site_faq` (G9)
- Clôturer cette session en DB (`atelier_cloture_session`)

### 🔵 Play Store — au rythme du travail app
- Screenshots + descriptions par app candidate
- Ajouter colonne `android_candidate BOOLEAN DEFAULT false` sur `app_modules`

---

*Ce document est la source de vérité macro avant toute production de page.*  
*Emplacement local :* `C:\DEV\BIBLE_DE_BLOC\gouvernance\BDB_SURFACE_MAP_V1_2_0.md`  
*Emplacement projet Claude : uploader comme fichier de référence permanent (remplace V1.1.0).*  
*Mettre à jour à chaque livraison de page — version suivante : V1.3.0.*

> **Note :** `_atelier/` mentionné dans l'audit Claude Code ne correspond à aucun dossier existant dans l'arborescence BDB. Hallucination corrigée ici.
