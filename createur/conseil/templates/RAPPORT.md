# Template RAPPORT — Conseil BDB

> Utiliser après consolidation des réponses IA (Perplexity + Gemini) et de l'auto-diagnostic.
> Archiver dans `verdicts/YYYY-MM-DD_[sujet].md`.

---

## En-tête

```
DATE           : YYYY-MM-DD
SUJET          : [Nom du livrable]
MODULE(S)      : [Modules impactés]
SOUMISSION     : soumissions/YYYY-MM-DD_[sujet].md
VERDICT FINAL  : [EXÉCUTABLE | CONDITIONNEL | BLOQUÉ]
```

---

## 1. Verdicts consolidés

| Lunette | Auto-diagnostic | Brigitte (Perplexity) | Ewan (Gemini) | Consolidé |
|---------|----------------|----------------------|--------------|-----------|
| TERRAIN | [verdict] | — | — | [verdict] |
| ARCHITECTURE | [verdict] | — | [verdict] | [verdict] |
| MARCHÉ | [verdict] | [verdict] | — | [verdict] |
| PHILOSOPHIE | [verdict] | — | — | [verdict] |
| CRÉATEUR | [verdict] | — | — | [verdict] |

---

## 2. Fragilités P1 (bloquantes)

*Ces fragilités bloquent l'exécution. Toutes doivent être résolues avant de passer en V2.*

| # | Source | Description | Correctif |
|---|--------|-------------|-----------|
| 1 | [Auto/Brigitte/Ewan] | [description] | [action corrective] |

*Si aucune : "Aucune fragilité P1 identifiée."*

---

## 3. Fragilités P2 (avant déploiement)

*Ces fragilités doivent être résolues avant mise en production.*

| # | Source | Description | Correctif | Deadline |
|---|--------|-------------|-----------|---------|
| 1 | [source] | [description] | [action] | [date] |

---

## 4. Fragilités P3 (dette documentée)

*Acceptées, documentées, deadline < 30 jours.*

| # | Source | Description | Deadline |
|---|--------|-------------|---------|
| 1 | [source] | [description] | [date] |

---

## 5. Diff V1 → V2

*Liste exhaustive des corrections apportées entre la soumission initiale et le livrable final.*

```
CORRIGÉ V1 → V2 :

[P1] [description du correctif — fichier:ligne si applicable]
[P1] [description du correctif]
[P2] [description du correctif]
```

*Si aucune correction : "Livrable V1 accepté sans modification."*

---

## 6. Verdict final

```
TERRAIN      : [SOLIDE|FRAGILE|CASSANT]
ARCHITECTURE : [SOLIDE|FRAGILE|CASSANT]
MARCHÉ       : [VENDABLE|CONDITIONNEL|BLOQUANT]
PHILOSOPHIE  : [ALIGNÉ|DÉRIVE|VIOLATION]
CRÉATEUR     : [PREMIUM|ACCEPTABLE|REJET]

FRAGILITÉS   : P1:[n] · P2:[n] · P3:[n]

VERDICT FINAL : [EXÉCUTABLE | CONDITIONNEL | BLOQUÉ]
```

---

## 7. Entrée JOURNAL_DECISIONS

*Copier dans `00_GOUVERNANCE/01_JOURNAL_DECISIONS_V*.md` :*

```
YYYY-MM-DD . CONSEIL . [SUJET] . Verdict [EXÉCUTABLE|CONDITIONNEL|BLOQUÉ] .
P1:[n] P2:[n] P3:[n] . [Résumé en 1 phrase du livrable] .
CORRECTIFS : [liste P1+P2 ou "aucun"] . STATUT : ARCHIVÉ
```

---

*Conseil BDB — Template v1.0 — Ne pas modifier ce template*
