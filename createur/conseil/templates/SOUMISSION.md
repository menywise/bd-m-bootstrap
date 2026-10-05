# Template SOUMISSION — Conseil BDB

> Copier ce fichier, renommer en `soumissions/YYYY-MM-DD_[sujet].md`, remplir chaque section.
> Ne pas laisser de placeholders non remplis dans la version finale.

---

## En-tête

```
DATE       : YYYY-MM-DD
SUJET      : [Nom court du livrable]
MODULE(S)  : [Modules impactés]
AUTEUR     : Claude (session guidée par Manu)
VERSION    : V1 (soumission initiale)
```

---

## 1. Description du livrable

*3-5 phrases : quoi, pourquoi, périmètre exact.*

[DÉCRIRE ICI]

---

## 2. Anti-collision

```
Tables DB touchées    : [liste ou "aucune"]
Modules JS impactés   : [liste ou "aucun"]
Sessions parallèles   : [sessions en cours ou "aucune"]
Risque temporel       : si [X] s'exécute pendant que [Y] tourne → [conséquence]
                        ou "aucun risque identifié"
```

---

## 3. Auto-diagnostic 5 lunettes

### Lunette TERRAIN
**Question :** Est-ce que ça tient dans le chaos réel du bloc ?

**Verdict :** ✅ SOLIDE / ⚠️ FRAGILE / ❌ CASSANT *(supprimer les non-applicables)*

**Justification :**
- [observation 1]
- [observation 2]

**Fragilités identifiées :**
- [P1/P2/P3] [description]

---

### Lunette ARCHITECTURE
**Question :** Est-ce que ça tient sans moi dans 6 mois ?

**Verdict :** ✅ SOLIDE / ⚠️ FRAGILE / ❌ CASSANT

**Justification :**
- [observation 1]
- [observation 2]

**Fragilités identifiées :**
- [P1/P2/P3] [description]

---

### Lunette MARCHÉ
**Question :** Brigitte signe le bon de commande demain matin ?

**Verdict :** ✅ VENDABLE / ⚠️ CONDITIONNEL / ❌ BLOQUANT

**Justification :**
- [observation 1]
- [observation 2]

**Fragilités identifiées :**
- [P1/P2/P3] [description]

---

### Lunette PHILOSOPHIE
**Question :** Est-ce que ça respecte ce pour quoi BDB existe ?

**Verdict :** ✅ ALIGNÉ / ⚠️ DÉRIVE / ❌ VIOLATION

**Justification :**
- [observation 1]
- [observation 2]

**Fragilités identifiées :**
- [P1/P2/P3] [description]

---

### Lunette CRÉATEUR
**Question :** Est-ce premium, vérifié et non-complaisant ?

**Verdict :** ✅ PREMIUM / ⚠️ ACCEPTABLE / ❌ REJET

**Ce que j'ai vérifié (sources) :**
- [item 1 — source : fichier/migration/requête]
- [item 2 — source : fichier/migration/requête]

**Ce que j'ai supposé sans vérifier :**
- [item 1]
- [item 2 ou "aucun — tout a été vérifié"]

**Fragilités identifiées :**
- [P1/P2/P3] [description]

---

## 4. Synthèse des fragilités

| Priorité | Lunette | Description |
|----------|---------|-------------|
| P1 | [lunette] | [description] |
| P2 | [lunette] | [description] |
| P3 | [lunette] | [description] |

*Si aucune fragilité : expliquer pourquoi (ce n'est pas une soumission vide — c'est une soumission honnête).*

---

## 5. Verdict global (pré-conseil)

```
TERRAIN      : [SOLIDE|FRAGILE|CASSANT]
ARCHITECTURE : [SOLIDE|FRAGILE|CASSANT]
MARCHÉ       : [VENDABLE|CONDITIONNEL|BLOQUANT]
PHILOSOPHIE  : [ALIGNÉ|DÉRIVE|VIOLATION]
CRÉATEUR     : [PREMIUM|ACCEPTABLE|REJET]

VERDICT GLOBAL : [EXÉCUTABLE | CONDITIONNEL | BLOQUÉ]
```

---

## 6. Livrables joints

*Liste des fichiers livrés avec cette soumission.*

- [ ] `[fichier 1]` — [description]
- [ ] `[fichier 2]` — [description]

---

*Conseil BDB — Template v1.0 — Ne pas modifier ce template*
