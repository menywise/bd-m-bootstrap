# CTX — MODULE MINI-SITE

```
VERSION   : 2.0.1
DATE      : 2026-03-16
AUTEUR    : Manu + Claude
STATUT    : OPÉRATIONNEL — RÉÉCRITURE ÉDITORIALE EN ATTENTE
DOSSIER   : modules/site/
NOYAU_REF : NOYAU_VERITE_V2_4_0
PERSONAS  : PERSONAS_BDB_V1_3_0 — OBLIGATOIRE pour toute session sur ce module
DELTA v2.0.0 → v2.0.1 :
  NOYAU_REF V2.1.0 → V2_4_0.
  JOURNAL_REF V1.5.0 → V1_9_0 (section CHARGEMENT OBLIGATOIRE).
  PERSONAS convention underscore V1_3_0 (toutes occurrences).
```

---

## CHARGEMENT OBLIGATOIRE EN SESSION

Avant toute session de travail sur ce module, charger dans l'ordre :

```
1. NOYAU_VERITE_V2_4_0
2. JOURNAL_DECISIONS_V1_9_0
3. PERSONAS_BDB_V1_3_0    ← OBLIGATOIRE — sans ce fichier, session invalide
4. Ce fichier (CTX_MINI_SITE)
```

Une session qui produit du contenu éditorial sans PERSONAS_BDB_V1_3_0 = violation documentée.
Le risque : biais DC non compensé → texte structurellement illisible pour P1/P2/P3.

---

## 1. ROLE

Mini-site de présentation de l'application BDB.
Point d'entrée pour les nouveaux arrivants, la direction, les utilisateurs potentiels.
Accessible depuis le profil utilisateur ou une URL directe.

Ce module est **promotionnel et pédagogique** — il ne lit ni n'écrit de données Supabase.

Objectif fondateur :
> Permettre à n'importe quel professionnel du bloc, quel que soit son profil,
> de comprendre en moins de 3 secondes si BDB peut l'aider.

---

## 2. PORTÉE — 8 FICHIERS HTML

| Fichier | Contenu | Persona primaire | Version |
|---------|---------|-----------------|---------| 
| `index.html` | Hub accueil — présentation générale | P1 + P2 | v2.0.0 |
| `vision.html` | Paradigme, valeurs, raison d'être | P3 | v2.0.0 |
| `pas-app.html` | Limites volontaires — ce que BDB n'est pas | P4 | v2.0.0 |
| `audiences.html` | Bénéfices par profil (tabs) | P1→P7 par tab | v2.0.0 |
| `fonctionnalites.html` | Features : recherche, badges, cycle de vie | P5 | v2.0.0 |
| `risques.html` | Biais identifiés, garde-fous, Conseil des 5 | P6 | v2.0.0 |
| `adoption.html` | Courbe adoption, phases, métriques | P7 | v2.0.0 |
| `faq.html` | Questions fréquentes (accordion) | P2 + P4 + P5 | v2.0.0 |

---

## 3. ÉTAT ÉDITORIAL RÉEL (2026-03-15)

### Ce qui est connu

Le mini-site v2.0.0 est **massivement C-Bleu** (SC-01, session 2026-03-14).
Il est structurellement lisible par un profil DC mais crée de la résistance
chez les profils S/I/BEIGE qui représentent 85% de l'audience cible.

Violations éditoriales actives :
- Phrases > 20 mots en zones P1/P2
- Termes DC en contexte S/I : "ROI", "métriques", "itérer", "scalable"
- Références théoriques non demandées : "Rogers" en texte courant
- Structure d'information analytique imposée là où une porte émotionnelle est attendue
- 5 violations `style="..."` CSS inline résiduelles (adoption ×2, fonctionnalites ×2, risques ×1)

### Dette ouverte

- **SC-02** : Pitch BDB à co-construire — "bénéfice patient" = filtre IA, pas pitch humain.
  Le pitch humain n'existe pas encore sous forme rédigée.
- `guide_amelio_site.txt` v1.0.0 (2026-01-24) = projet antérieur distinct.
  À archiver — décision Manu requise.

### CDN

Le mini-site utilise `@latest` sur CDN menywise/BDB — violation INTERDIT-01.
Tag fixe à définir au moment du déploiement Phase 4.

---

## 4. PERSONAS — MAPPING × PAGES

Référence complète : PERSONAS_BDB_V1_3_0.

### Vue d'ensemble des 9 personas

| # | État | Spirale | DISC | Posture |
|---|------|---------|------|---------| 
| P0 | "Ça ne me concerne pas" | BLEU stable | S | Absent — pas de signal |
| P1 | "Je ne sais pas" | BEIGE→VIOLET | S | Cherche sans savoir quoi |
| P2 | "Je n'ose pas" | VIOLET→BLEU | S/C | Sait mais ne demande plus |
| P3 | "Je ne peux pas" | BLEU→ORANGE | C/S | Veut mais a abandonné |
| P4 | "Je n'ai pas le droit" | BLEU | C | S'autocensure |
| P5 | "Ça ne servira à rien" | ORANGE | D/C | Sceptique actif |
| P6 | "C'est pour qui ça ?" | BLEU/ORANGE | D/C | Décideur distant |
| P7 | "Je veux que ça marche" | VERT+ORANGE | I/S | Adopteur précoce |
| P8 | "Le savoir ne se documente pas" | ROUGE/VIOLET | D/S | Frein actif terrain |

### Mapping pages × personas

| Page | Persona primaire | Persona secondaire | Ce qui doit changer |
|------|-----------------|-------------------|---------------------|
| index.html | P1 + P2 | P7 | Ouvrir sur BEIGE/VIOLET — reconnaissance avant promesse |
| vision.html | P3 | P2 | Réduire densité C-Bleu académique, humaniser sans vider |
| pas-app.html | P4 | P5 + P8 (neutralisation) | BLEU rassurant, nommer les hors-scope sans les inviter |
| audiences.html | P1→P7 par tab | P6 Direction | Structure tabs = montage intelligent validé |
| fonctionnalites.html | P5 | P3 | Orange avant structure, preuves concrètes en tête |
| risques.html | P6 | P5 | Supprimer références académiques en prose |
| adoption.html | P7 | P5 | Vert renforcé, % Rogers en second plan |
| faq.html | P2 + P4 + P5 | P1 | Soupçon Beige sur réponses pratiques |

### Règle P8 (anti-contamination)

P8 "Le savoir ne se documente pas" ne doit pas être invité aux présentations initiales.
Son influence sur P1/P2 peut contaminer les non-adopteurs avant que BDB soit dans leur main.
Voir NOYAU_VERITE BLOC 11.

---

## 5. RÈGLE DE VOIX BDB

Applicable à toutes les pages de ce module.
Référence complète : PERSONAS_BDB_V1_3_0 section RÈGLE DE VOIX BDB.

### Résumé opérationnel

| Dimension | Valeur |
|-----------|--------|
| Public dominant | S/C 50% + I 35% |
| Voix cible | BLEU rassurant + VIOLET ancrage collectif |
| Registre | "tu" — sauf tab Direction audiences.html → "vous" |

### Longueur de phrases par palier

| Palier | Max | Contexte |
|--------|-----|---------|
| P1 / P2 | ≤ 12 mots | index.html, accroche, microtextes |
| P3 / P4 | ≤ 20 mots | vision.html, pas-app.html |
| P5 / P6 | ≤ 25 mots | fonctionnalites.html, risques.html |
| P7 | Sans limite | adoption.html — P7 lit tout |

### Lexique interdit dans les pages utilisateurs

```
- Jargon médical non défini dans le même écran
- Acronymes non développés au premier usage
- "optimal", "efficient", "ROI", "KPI", "scalable", "itérer"
- "Rogers", "TAM", "vMème", "Wenger", "Karpman" (sauf FAQ si demandé)
```

### Test "testé contre les personas" (60 secondes, obligatoire avant livraison)

1. Identifier le persona primaire de la page
2. Vérifier que la porte d'entrée s'ouvre en < 3 secondes pour ce persona
3. Vérifier l'absence de vocabulaire bloquant pour ce persona
4. Vérifier que la structure d'information n'est pas DC imposée à un public S/I/BEIGE

---

## 6. STACK TECHNIQUE

```
HTML5 vanilla · Bootstrap 5.3.2 · Bootstrap Icons 1.11.1
theme-base.css + theme-print.css (CDN menywise/BDB — @latest → tag fixe Phase 4)
Zéro Supabase. Zéro localStorage. Offline-capable.
CSS spécifique embarqué dans <style> de chaque fichier (standalone).
```

Raison du CSS embarqué : les fichiers sont offline-capable et standalone.
Ils n'ont pas accès aux fichiers CSS locaux du projet BDB.
Cette exception au principe "un CSS par module" est documentée et délibérée.

---

## 7. AUTORISÉ

- Modifier le contenu éditorial (textes, descriptions, exemples)
- Corriger les violations CSS inline résiduelles (adoption ×2, fonctionnalites ×2, risques ×1)
- Réécrire les pages selon le mapping personas (§4) et la règle de voix (§5)
- Mettre à jour les versions et dates des fichiers
- Corriger `@latest` → tag fixe lors du déploiement Phase 4

---

## 8. INTERDIT

- Créer de nouveaux fichiers HTML hors des 8 listés sans validation Manu
- Connecter ce module à Supabase (intentionnellement statique)
- Utiliser localStorage
- CSS inline (`style="..."`) — ne pas en ajouter
- Utiliser `@latest` en production
- Modifier la structure de navigation inter-pages sans validation
- Écrire du contenu éditorial sans avoir chargé PERSONAS_BDB_V1_3_0
- Qualifier une page comme "réécrite" sans test personas (§5)

---

## 9. RÈGLE DE CLÔTURE SESSION

À chaque session de réécriture d'une page de ce module :

1. Lister les **promesses** nouvelles ou modifiées dans la page
2. Identifier le **CTX module cible** impacté pour chaque promesse
3. Consigner dans **JOURNAL_DECISIONS** avant fermeture de session

Une promesse non consignée = dette silencieuse non traçable.

Format d'entrée JOURNAL minimum :

```
DATE       : [date]
MODULE     : mini-site → [CTX_MODULE impacté]
DÉCISION   : Promesse créée ou modifiée dans [page.html] :
             "[texte de la promesse]"
             CTX cible : [CTX_MODULE.md]
STATUT     : VALIDÉ
```

---

## 10. DÉPENDANCES

```
Bootstrap 5.3.2 (CDN jsdelivr)
Bootstrap Icons 1.11.1 (CDN jsdelivr)
theme-base.css / theme-print.css (CDN menywise/BDB — tag à fixer Phase 4)
PERSONAS_BDB_V1_3_0 (00_GOUVERNANCE\) ← dépendance éditoriale obligatoire
Aucune dépendance interne BDB (module standalone)
```

---

## HISTORIQUE

```
2026-03-14 — v1.0.0
  Création initiale. 8 pages, stack technique, autorisé/interdit.

2026-03-15 — v2.0.0
  Réécriture complète niveau audit.
  Intégration PERSONAS_BDB_V1_3_0 (9 personas, mapping, règle de voix).
  Ajout section CHARGEMENT OBLIGATOIRE EN SESSION.
  Ajout état éditorial réel (SC-01 C-Bleu, SC-02 pitch manquant).
  Ajout règle de clôture session (promesses → JOURNAL).
  Ajout test personas 60 secondes. Ajout règle P8 anti-contamination.
  NOYAU_REF V2.1.0.

2026-03-16 — v2.0.1
  NOYAU_REF V2_4_0. JOURNAL_REF V1_9_0. PERSONAS convention underscore V1_3_0.
```
