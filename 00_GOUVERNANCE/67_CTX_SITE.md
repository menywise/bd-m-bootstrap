# CTX_SITE.md
```
VERSION      : 1.0.0
DATE         : 2026-03-20
MODULE       : site
STATUT       : OPÉRATIONNEL — réécriture éditoriale en attente


DELTA :
  Création CTX_SITE (renommé depuis CTX_MINI_SITE pour alignement tracker).
  Format TEMPLATE_CTX_MODULE V1.2.0. TRACKER_* ajoutés.
  Glossaire : escHtml() appliqué sur 9 points d'injection (INTERDIT-C6).
  9 fichiers HTML documentés (glossaire.html ajouté — absent du CTX_MINI_SITE).
  Contenu éditorial personas/voix conservé intégralement.
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE ÉDITORIALE : Toute session de réécriture éditoriale
> DOIT charger PERSONAS_BDB_V1_3_0 — sans ce fichier, session invalide.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Mini-site de présentation de l'application BDB.
  Point d'entrée pour les nouveaux arrivants, la direction, les utilisateurs potentiels.
  Accessible depuis le profil utilisateur ou une URL directe.
  Ce module est PROMOTIONNEL et PÉDAGOGIQUE — zéro Supabase, zéro auth.
  Objectif fondateur :
    "Permettre à n'importe quel professionnel du bloc, quel que soit son profil,
     de comprendre en moins de 3 secondes si BDB peut l'aider."

PORTEE      :
  9 fichiers HTML statiques — navigation inter-pages cohérente.
  Hors périmètre :
    - Connexion Supabase (intentionnellement statique)
    - localStorage (sauf glossaire CRUD client-side)
    - bdb-shell.js (module standalone, pas d'auth)

AUTORISE    :
  Modifier le contenu éditorial (textes, descriptions, exemples)
  Corriger les violations CSS inline résiduelles
  Réécrire les pages selon le mapping personas
  Ajouter escHtml() sur tout nouveau innerHTML dans glossaire.html
  Corriger @latest → tag fixe lors du déploiement Phase 4

INTERDIT    :
  - Créer de nouveaux fichiers HTML hors des 9 listés sans validation Manu
  - Connecter ce module à Supabase
  - CSS inline (style="...") — ne pas en ajouter
  - onclick= dans le HTML
  - Utiliser @latest en production
  - Écrire du contenu éditorial sans avoir chargé PERSONAS_BDB_V1_3_0
  - Qualifier une page comme "réécrite" sans test personas (voir §RÈGLE DE VOIX)

DEPENDANCES :
  Bootstrap 5.3.2 (CDN) · Bootstrap Icons 1.11.1 (CDN)
  theme-base.css / theme-print.css (CDN menywise/BDB — @latest → tag fixe Phase 4)
  site-ui.css v3.0.0 (CSS module scopé .site-module)
  PERSONAS_BDB_V1_3_0 (00_GOUVERNANCE/) ← dépendance éditoriale obligatoire
  Aucune dépendance interne BDB (module standalone)
```

---

## BLOC 2 — TABLE SUPABASE

```
N/A — module 100% statique. Zéro Supabase. Zéro localStorage (sauf glossaire CRUD client).
```

---

## BLOC 3 — MATRICE D'ACCÈS

N/A — pas d'auth. Accessible par tout navigateur.

---

## BLOC 4 — CHECKLIST PREMIUM

```
[✅] CDS conforme
      ✅ Zéro onclick= réel (9/9 fichiers)
      ✅ Zéro style= ajouté (5 résiduels à corriger — dette mineure)
      ✅ Chaîne CSS BLOC E respectée (9/9 fichiers)
      ✅ INTERDIT-17 : CSS scopé .site-module (site-ui.css)
      ✅ escHtml() dans glossaire.html (INTERDIT-C6)

[✅] Documenté
      ✅ CTX_SITE v1.0.0 créé — format TEMPLATE V1.2.0
      ✅ TRACKER_* présents
      ✅ Mapping personas × pages documenté

[✅] Résilient
      ✅ Module offline-capable (zéro dépendance serveur)
      ✅ Glossaire : empty state géré ("Aucun terme ne correspond")
      ✅ escHtml() sur toutes données CRUD glossaire
      N/A : pas d'async Supabase → C.9 non applicable

[✅] Navigable
      ✅ Navigation inter-pages cohérente (9 pages liées)
      ✅ Lien retour portail (../../index.html)
      N/A : pas de bdb-shell (module standalone)

[⚠ ] Responsive
      ✅ Bootstrap grid + site-ui.css responsive
      ⚠ Non vérifié terrain touch
```

**État actuel** : `[4/5]` — responsive terrain non vérifié

---

## BLOC 5 — PORTÉE : 9 FICHIERS HTML

| Fichier | Contenu | Persona primaire | escHtml | Lignes |
|---------|---------|-----------------|---------|--------|
| `index.html` | Hub accueil — présentation générale | P1 + P2 | N/A | 332 |
| `vision.html` | Paradigme, valeurs, raison d'être | P3 | N/A | 253 |
| `pas-app.html` | Limites volontaires — ce que BDB n'est pas | P4 | N/A | 257 |
| `audiences.html` | Bénéfices par profil (tabs) | P1→P7 par tab | N/A | 369 |
| `fonctionnalites.html` | Features : recherche, badges, cycle de vie | P5 | N/A | 330 |
| `risques.html` | Biais identifiés, garde-fous, Conseil des 5 | P6 | N/A | 294 |
| `adoption.html` | Courbe adoption, phases, métriques | P7 | N/A | 290 |
| `faq.html` | Questions fréquentes (accordion) | P2 + P4 + P5 | N/A | 355 |
| `glossaire.html` | Glossaire interactif + CRUD catégories/termes | P2 + P5 | ✅ 9 pts | 649 |

---

## BLOC 6 — ÉTAT ÉDITORIAL (issu CTX_MINI_SITE v2.0.1)

### Constat SC-01

Le mini-site v2.0.0 est **massivement C-Bleu**. Structurellement lisible par un profil DC
mais crée de la résistance chez les profils S/I/BEIGE (85% de l'audience cible).

Violations éditoriales actives :
- Phrases > 20 mots en zones P1/P2
- Termes DC en contexte S/I : "ROI", "métriques", "itérer", "scalable"
- Références théoriques non demandées : "Rogers" en texte courant
- Structure d'information analytique imposée là où une porte émotionnelle est attendue

### Mapping pages × personas

| Page | Persona primaire | Ce qui doit changer |
|------|-----------------|---------------------|
| index.html | P1 + P2 | Ouvrir sur BEIGE/VIOLET — reconnaissance avant promesse |
| vision.html | P3 | Réduire densité C-Bleu académique, humaniser |
| pas-app.html | P4 | BLEU rassurant, nommer hors-scope sans inviter |
| fonctionnalites.html | P5 | Orange avant structure, preuves concrètes en tête |
| risques.html | P6 | Supprimer références académiques en prose |
| adoption.html | P7 | Vert renforcé, % Rogers en second plan |
| faq.html | P2 + P4 + P5 | Soupçon Beige sur réponses pratiques |

### Règle de voix BDB

| Palier | Max mots/phrase | Contexte |
|--------|-----------------|---------|
| P1/P2 | ≤ 12 | index.html, accroche, microtextes |
| P3/P4 | ≤ 20 | vision.html, pas-app.html |
| P5/P6 | ≤ 25 | fonctionnalites.html, risques.html |
| P7 | Sans limite | adoption.html |

### Lexique interdit (pages utilisateurs)

```
"optimal", "efficient", "ROI", "KPI", "scalable", "itérer"
"Rogers", "TAM", "vMème", "Wenger", "Karpman" (sauf FAQ si demandé)
Jargon médical non défini dans le même écran.
Acronymes non développés au premier usage.
```

---

## NOTE : ANCIEN FICHIER CTX_MINI_SITE_V2_0_1.md

Ce fichier est remplacé par CTX_SITE.md. Le contenu éditorial (personas, mapping, règle de voix)
a été intégralement conservé dans les BLOCS 5 et 6 ci-dessus.
L'ancien fichier peut être archivé.
