# AUDIT FRAMEWORK BDB — V1.0.0

**Date :** 2026-04-11  
**Auteur :** Manu + Claude  
**Statut :** RÉFÉRENCE ACTIVE  
**Révision suivante :** après première exécution complète sur modules/

---

## PRINCIPE FONDATEUR

Un code techniquement conforme peut être fonctionnellement absurde.  
Un code fonctionnellement cohérent peut être métier-inutile.  
Un code métier-utile peut être invisible parce que mal connecté.

**L'audit BDB est multi-couches. Aucune couche ne remplace une autre.**

---

## LES 5 COUCHES

| Couche | Nom | Question centrale | Détectable par |
|--------|-----|-------------------|----------------|
| **L0** | CDS Compliance | *Le code respecte-t-il les règles techniques BDB ?* | Script + Claude Code (lecture mécanique) |
| **L1** | UX Premium | *Les 32 règles UX sont-elles respectées ?* | Script (10/32) + Claude Code (22/32) |
| **L2** | Cohérence métier | *La feature a-t-elle un sens pour le bon persona, au bon moment ?* | Claude Code (lecture sémantique) |
| **L3** | Liaisons inter-modules | *Le module est-il isolé alors qu'il devrait être connecté ?* | Claude Code (lecture transversale) |
| **L4** | Pertinence produit | *Cette feature mérite-t-elle d'exister ?* | Arbitrage Manu uniquement |

---

## COUCHE L0 — CDS Compliance

### Question
Le code respecte-t-il les règles techniques définies dans le CDS (Chantier Technique) ?

### Ce qu'on contrôle

| Règle | Vérification | Outil |
|-------|-------------|-------|
| Chaîne CSS correcte (ordre, atelier-base si atelier) | Lecture HTML | Claude Code |
| INTERDIT-E1 : `#bdb-shell` dans `<main>` | grep | Claude Code |
| INTERDIT-C2 : zéro `<style>` inline | grep | Claude Code |
| INTERDIT-JS-01 : zéro `<script>` inline applicatif | grep | Claude Code |
| 3 états UI : loading / empty ou denied / content | Lecture HTML | Claude Code |
| `await window.bdbShellReady` avant tout accès DOM | Lecture JS | Claude Code |
| `escHtml()` sur tout `innerHTML` avec donnée DB | Lecture JS | Claude Code |
| CDN : versions figées (zéro @latest) | grep | `fix-cdn-latest.ps1` |
| `console.log` absent | grep | Claude Code |
| Chaîne JS : socle → shell → module | Lecture HTML | Claude Code |

### Format de sortie

Tableau de synthèse par fichier (colonnes : règle par règle + Statut global).  
Violations classées P1 (bloquant) / P2 (à corriger) / P3 (mineur).  
Exclusions intentionnelles documentées explicitement.

### Référence
Pattern établi : `AUDIT_ATELIER_V1_0_0.md` (2026-04-11, périmètre `atelier/`).

### Répétabilité
```
Claude Code — Phase 0 UNIQUEMENT
  Pour chaque fichier du périmètre :
    1. Lire le fichier
    2. Vérifier chaque règle L0
    3. Produire le tableau
  AUCUNE MODIFICATION en Phase 0
Phase 1 : corrections sur accord Manu
```

---

## COUCHE L1 — UX Premium

### Question
Les 32 règles UX définies dans le Standard C.10 (CHANTIER_TECHNIQUE) sont-elles respectées ?

### Ce qu'on contrôle

| Catégorie | Règles | Codes | Méthode |
|-----------|--------|-------|---------|
| Interaction | 6 | UX01–UX06 | grep + lecture |
| Chargement | 3 | UX07–UX09 | lecture |
| Recherche | 3 | UX10–UX12 | grep |
| Formulaires | 3 | UX13–UX15 | lecture |
| Mobile | 4 | UX16–UX19 | lecture |
| Accessibilité A | 7 | UX20–UX26 | lecture + grep |
| Accessibilité AA | 4 | UX27–UX30 | lecture |
| Navigation | 1 | UX31 | lecture |
| Performance | 1 | UX32 | lecture |

10 règles grep-ables → `audit-ux-premium.ps1 V1.2.0`  
22 règles nécessitent lecture sémantique → Claude Code

### Convention faux positifs
Marqueur inline `// UX06 : caller confirms` exclut la ligne du comptage.  
Ne jamais supprimer un marqueur sans arbitrage documenté.

### Format de sortie
Tableau par module : Règle | Statut | Fichier | Ligne | Commentaire.  
Faux positifs listés séparément.

### Répétabilité
```
1. Lancer audit-ux-premium.ps1 → rapport automatique (10 règles)
2. Claude Code : lire chaque module et vérifier les 22 règles manuelles
3. Consolider les deux rapports
```

---

## COUCHE L2 — Cohérence métier

### Question
La feature a-t-elle un sens pour le bon persona, au bon moment, dans le bon contexte d'usage ?

### Ce qu'on contrôle

| Axe | Exemples de défauts détectables |
|-----|--------------------------------|
| **Biais cognitif** | Label DISC visible pendant le test = influence la réponse |
| **Mauvais persona** | Feature admin dans une interface membre |
| **Mauvais contexte** | Information per-op dans une app pré/post-op uniquement |
| **Over-engineering** | Complexité sans persona identifiable (qui l'utilise vraiment ?) |
| **Wording incohérent** | Jargon technique masqué en prod mais visible dans les états d'erreur |
| **Empty state absurde** | "Aucune donnée" sans explication ni action pour Julie C. (novice) |
| **Confirmation manquante** | Action irréversible sans `Retirer définitivement ?` |
| **Doctrine terrain violée** | Information qui n'appartient pas à l'institution apparaît nominativement |

### Personas de référence pour le filtrage

| Persona | Usage principal | Ce qui doit marcher pour lui |
|---------|----------------|------------------------------|
| Julie C. (novice) | Apprendre, ne pas se noyer | States vides guidants, zéro jargon |
| Sabine D. (confirmée) | Trouver vite, préparer juste | Recherche efficace, pas de friction |
| Dr COSTE (chirurgien) | Ses prefs, ses protocoles, en 2 clics | Accès direct, zéro détour |
| Olivia H. (admin) | Configurer, gérer son équipe | CRUD clair, feedback actions |
| Brigitte (DSI) | Justifier, ROI, conformité | Lisibilité, pas de jargon dev |

### Format de sortie

```
Module : [nom]
Persona primaire : [qui]
Anomalie L2 : [description]
Priorité : P1 / P2 / P3
Recommandation : [action concrète]
Arbitrage requis : OUI / NON
```

### Répétabilité
```
Claude Code — Phase 0 lecture seule
  Pour chaque modules/[x]/index.html + js associé :
    1. Identifier le persona primaire du module
    2. Lire chaque feature et se demander : qui l'utilise ? quand ? est-ce cohérent ?
    3. Flaguer toute anomalie avec priorité et recommandation
  Livrable → atelier/AUDIT_L2_[PERIMETER]_V1_0_0.md
```

---

## COUCHE L3 — Liaisons inter-modules

### Question
Le module est-il isolé alors qu'il devrait être connecté à d'autres modules ?  
Inversement : recrée-t-il localement ce qui existe déjà ailleurs ?

### Ce qu'on contrôle

| Axe | Exemples |
|-----|----------|
| **Liaison manquante** | Fiche intervention sans lien vers arsenal, installation, préférences |
| **Duplication locale** | Module qui recrée sa propre recherche alors que le glossaire existe |
| **Entrée orpheline** | Module accessible uniquement via URL directe (non référencé dans shell) |
| **Sortie sans retour** | Navigation qui part mais ne revient pas (deep link sans breadcrumb) |
| **Dato incohérente** | Deux modules affichent des informations contradictoires sur la même entité |

### Référence
`03_MODULE_DEPENDENCY_MAP_V1_7_0.md` = source de vérité pour les dépendances déclarées.  
L'audit L3 compare l'état réel du code vs les dépendances documentées.

### Format de sortie
Tableau : Module source | Module cible attendu | Liaison présente | Type d'anomalie | Priorité.

### Répétabilité
```
Claude Code — lecture transversale
  1. Lire MODULE_DEPENDENCY_MAP
  2. Pour chaque module : vérifier les liaisons entrantes et sortantes dans le code
  3. Identifier les écarts (manquants / non-documentés / cassés)
  Livrable → atelier/AUDIT_L3_LIAISONS_V1_0_0.md
```

---

## COUCHE L4 — Pertinence produit

### Question
Cette feature mérite-t-elle d'exister dans BDB tel qu'il est aujourd'hui ?

### Ce qu'on contrôle

| Axe | Questions clés |
|-----|----------------|
| **Valeur réelle** | Quelle douleur terrain cette feature résout-elle concrètement ? |
| **Fréquence d'usage** | Combien de fois par semaine Sabine ou Julie l'utilisent-elles ? |
| **Coût de maintenance** | Si on la supprime, qu'est-ce qu'on perd vraiment ? |
| **Cohérence Manifeste** | Respecte-t-elle les 7 principes fondateurs ? |
| **Concurrence** | BIBLO le fait mieux/différemment ? BDB a-t-il une vraie proposition sur ce point ? |

### Règle absolue
**L4 ne peut pas être automatisé. Aucun script, aucun Claude Code.**  
Claude produit des faits et une recommandation. Manu tranche.  
La décision est inscrite dans `atelier_decisions` + JOURNAL_DECISIONS.

### Format de sortie
```
Feature : [description]
Module : [nom]
Fait 1 : [usage observé ou estimé]
Fait 2 : [coût de maintenance]
Fait 3 : [alternative existante si applicable]
Recommandation Claude : CONSERVER / SIMPLIFIER / SUPPRIMER
Arbitrage Manu : [décision + date]
```

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
L0 → L1 → L2 → L3 → L4

Règle : ne pas passer à la couche N+1 avant d'avoir traité les P1 de la couche N.
Exception : L3 et L4 peuvent être lancées en parallèle (lectures différentes).
```

**Pourquoi cet ordre ?**  
Un bug L0 peut masquer un problème L2. Corriger d'abord le code cassé évite  
de raisonner sur des features qui ne fonctionnent même pas techniquement.

---

## PÉRIMÈTRES DÉFINIS

| Périmètre | Contenu | Priorité |
|-----------|---------|----------|
| `atelier/` | Outils créateur | ✅ AUDIT_ATELIER_V1_0_0 — L0 DONE |
| `modules/disc/` | Module DISC | ⏳ prochain (exemple biais L2 identifié) |
| `modules/` complet | Tous les modules prod | ⏳ après pilote DISC |
| `modules/site/` | Mini-site | Spécifique — L1 éditorial, pas UX technique |
| `js/` + `css/` | Socle | L0 uniquement (pas de logique métier) |

---

## INSTANCES D'AUDIT PRODUITES

| Instance | Couche | Périmètre | Date | Fichier |
|----------|--------|-----------|------|---------|
| AUDIT_ATELIER_V1_0_0 | L0 | `atelier/` | 2026-04-11 | `AUDIT_ATELIER_V1_0_0.md` |

---

## RÈGLES DE MISE À JOUR

1. Toute nouvelle règle CDS → mise à jour couche L0 de ce document
2. Toute nouvelle règle UX Premium → mise à jour couche L1
3. Tout nouveau persona validé → mise à jour tableau L2
4. Tout audit produit → ajout dans le tableau Instances
5. Versionner ce document à chaque modification structurelle

---

## HISTORIQUE

| Date | Version | Action |
|------|---------|--------|
| 2026-04-11 | 1.0.0 | Création. 5 couches L0→L4. Pattern AUDIT_ATELIER comme référence L0. |
