# STRATÉGIE DE DÉLÉGATION — Claude Pro vs Qwen Local (La Forge)

```
VERSION  : 1.0.0
DATE     : 2026-03-18
AUTEUR   : Manu + Claude
STATUT   : OPÉRATIONNEL
RÔLE     : Définir QUAND et QUOI déléguer à Qwen pour économiser
           les tokens Claude Pro sans perte de qualité.
```

---

## PRINCIPE FONDATEUR

Chaque token Claude Pro consommé sur une tâche que Qwen peut exécuter
à qualité égale est un token gaspillé.

L'objectif n'est pas de remplacer Claude. C'est d'utiliser Claude
uniquement là où il apporte une valeur que Qwen ne peut pas fournir.

---

## PROFIL COMPARATIF

| Capacité | Claude Pro (Opus/Sonnet) | Qwen 14B (La Forge) |
|----------|:---:|:---:|
| Contexte | ~200K tokens | ~8K tokens |
| Mémoire inter-sessions | ✅ Projets + mémoire | ❌ Amnésie totale |
| Web search | ✅ | ❌ Offline |
| Création fichiers (docx, xlsx, pptx) | ✅ | ❌ |
| Exécution code | ✅ | ❌ |
| Multi-fichiers simultanés | ✅ | ❌ (1 extrait à la fois) |
| Qualité rédaction FR | Excellente | Très bonne |
| Qualité code HTML/CSS/JS | Excellente | Bonne (extraits < 150 lignes) |
| Qualité raisonnement complexe | Excellente | Correcte (décroche au-delà de 3 contraintes simultanées) |
| Coût | Tokens Pro (limités) | 0 € (électricité ~0,15 €/h) |
| Vitesse | ~30-60 tokens/s | ~15-25 tokens/s (RTX 5060) |
| Disponibilité | Dépend réseau + quota | 24/7 offline |

---

## ARBRE DE DÉCISION

```
La tâche nécessite...

├─ Web search ou données actualisées ?
│  └─ OUI → CLAUDE (Qwen est offline)
│
├─ Plus de 1 fichier en contexte simultané ?
│  └─ OUI → CLAUDE (Qwen perd le fil au-delà de ~3 000 mots d'input)
│
├─ Création de livrable formaté (docx, xlsx, pptx, pdf) ?
│  └─ OUI → CLAUDE (outils indisponibles sur Qwen)
│
├─ Session longue avec itération (> 5 échanges sur le même sujet) ?
│  └─ OUI → CLAUDE (Qwen sature son contexte en 4-5 tours)
│
├─ Cohérence cross-fichiers (NOYAU vs CTX vs JOURNAL) ?
│  └─ OUI → CLAUDE (nécessite plusieurs fichiers en mémoire)
│
├─ Raisonnement à > 3 contraintes simultanées ?
│  └─ OUI → CLAUDE (Qwen 14B décroche en complexité combinatoire)
│
├─ Architecture / décision structurante ?
│  └─ OUI → CLAUDE (besoin du contexte projet complet)
│
└─ Rien de ce qui précède ?
   └─ QWEN — économise tes tokens
```

---

## MATRICE DE DÉLÉGATION PAR TÂCHE

### ✅ QWEN — Déléguer systématiquement (coût zéro, qualité suffisante)

| Tâche | Espace Qwen | Condition de qualité |
|-------|-------------|---------------------|
| Rédiger UNE fiche Hawaï | RDS-LR-WRITER | Prompt calibré (cible + intérêts + ton + longueur) |
| Reformuler / réécrire un paragraphe | RDS-LR-WRITER | Coller le texte source + consigne précise |
| Générer 5-10 variantes de titres KDP | RDS-LR-WRITER | Donner le sujet + contraintes naming |
| Scorer UNE opportunité PLR | PLR-ANALYST | Fournir toutes les données dans le prompt |
| Vérifier les droits d'UN auteur | PLR-ANALYST | Fournir nom + dates + pays |
| Corriger UN bug CSS isolé | CDS-DEV | Coller le bloc CSS + description du bug |
| Écrire UNE fonction JS < 50 lignes | CDS-DEV | Spécification précise + contexte technique |
| Convertir un style inline → classe CSS | CDS-DEV | Coller le HTML + le CSS cible |
| Auditer UN fichier .md court (< 2 000 mots) | GOV-ENGINE | Coller le fichier + la question d'audit |
| Rédiger UNE entrée JOURNAL_DECISIONS | GOV-ENGINE | Fournir contexte + décision + impact |
| Traduire un texte court (< 500 mots) | Qwen brut | Langue source + cible + registre |
| Résumer un texte collé (< 2 000 mots) | Qwen brut | Consigne de longueur + angle |
| Générer des descriptions KDP (4e de couv) | RDS-LR-WRITER | Titre + cible + mots-clés |
| Brainstormer sur UN sujet délimité | Qwen brut | 1 question = 1 conversation |

### ⚠️ CLAUDE — Garder impérativement (valeur irremplaçable)

| Tâche | Pourquoi Claude | Ce que Qwen ne peut pas faire |
|-------|----------------|------------------------------|
| Architecture multi-fichiers | Besoin de 5-10 fichiers en contexte | Qwen ne tient qu'1 extrait |
| Audit cross-fichiers (NOYAU vs CTX) | Comparaison simultanée | Perd le contexte du 1er fichier |
| Refactoring CSS cross-modules | cds-overrides + module-ui + cascade | Trop de fichiers impliqués |
| Création module BDB complet | HTML + CSS + JS + intégration | Nécessite itération longue |
| Création livrables (docx, xlsx, pptx) | Outils fichiers | Qwen ne crée pas de fichiers |
| Session stratégique RDS-LR | Besoin NOYAU + CTX + JOURNAL | Contexte trop large pour 8K |
| Décision structurante (🔒 → JOURNAL) | Traçabilité + mémoire projet | Qwen oublie tout |
| Veille web (concurrence KDP, trends) | Web search | Qwen est 100% offline |
| Debugging complexe (cascade CSS, flux JS) | Raisonnement multi-couche | Qwen décroche à 3+ contraintes |
| Mise à jour NOYAU_VERITE | Cross-référence tous les blocs | Fichier trop long pour 8K |
| Génération de code > 150 lignes | Cohérence sur la longueur | Qwen perd le fil après ~100 lignes |

---

## WORKFLOW QUOTIDIEN RECOMMANDÉ

### Matin — Planification (CLAUDE, 1 session)
Ouvrir le projet Claude pertinent. Définir les tâches du jour.
Identifier lesquelles déléguer à Qwen.

### Journée — Exécution (QWEN, N sessions courtes)
Lancer les tâches unitaires sur les espaces Qwen.
1 tâche = 1 conversation = 1 résultat.
Collecter les outputs dans un dossier local.

### Soir — Consolidation (CLAUDE, 1 session)
Remonter les outputs Qwen dans le projet Claude.
Intégrer, arbitrer, versionner.
Mettre à jour JOURNAL_DECISIONS si décisions prises.

### Ratio cible
| Agent | % du temps de travail IA | Coût |
|-------|:---:|:---:|
| Qwen (La Forge) | 60-70% | 0 € |
| Claude Pro | 30-40% | Tokens Pro |

---

## RÈGLES ANTI-GASPILLAGE

1. **Ne jamais ouvrir Claude pour une tâche unitaire** que Qwen peut faire.
   → Reformuler un paragraphe ? Qwen. Générer des titres ? Qwen.

2. **Ne jamais coller un fichier entier sur Qwen** s'il dépasse 2 000 mots.
   → Extraire la section pertinente. Coller uniquement ce qui est nécessaire.

3. **Ne jamais itérer plus de 4-5 tours sur Qwen** sur le même sujet.
   → Le contexte sature. Ouvrir une nouvelle conversation ou passer sur Claude.

4. **Toujours fournir le contexte dans le prompt Qwen** — il ne sait rien.
   → Utiliser les blocs de reprise des CTX.

5. **Grouper les tâches Claude** en 1-2 sessions par jour plutôt que 10 sessions courtes.
   → Chaque session Claude consomme des tokens de setup (fichiers projet, mémoire).

6. **Qwen pour le brouillon, Claude pour la validation.**
   → Faire rédiger par Qwen, relire/ajuster sur Claude si nécessaire.

---

## ESTIMATION D'ÉCONOMIE

Hypothèse : 20 tâches IA par jour de travail.

| Sans stratégie | Avec stratégie |
|---|---|
| 20 tâches sur Claude Pro | 6-8 tâches Claude + 12-14 tâches Qwen |
| 100% tokens consommés | ~35% tokens consommés |

Économie estimée : **~60-65% des tokens Claude Pro** sur un jour de travail type.

---

## HISTORIQUE

| Date | Version | Action |
|------|---------|--------|
| 2026-03-18 | 1.0.0 | Création. Stratégie de délégation Claude vs Qwen. Arbre de décision. Matrice par tâche. Workflow quotidien. Règles anti-gaspillage. |
