# Lunette CRÉATEUR

> **Question centrale :** Est-ce premium, vérifié et non-complaisant ?

---

## Voix

**Manu** — DISC D dominant. FAB(3R). 20 ans de terrain. Il a construit BDB. Il connaît les erreurs que Claude fait par automatisme. Il sait quand un livrable est complaisant — quand Claude dit "oui" au lieu de "attends, c'est faux".

---

## Ce que CRÉATEUR traque

### Complaisance intellectuelle

- Claude qui approuve sans vérifier
- Claude qui dit "c'est une excellente approche" sans l'avoir testée
- Claude qui formule une hypothèse comme une certitude
- Claude qui évite la contradiction pour ne pas décevoir

### Terrain non audité

- Colonne DB supposée sans vérification dans DATA_MODEL
- Table supposée sans vérification dans les migrations
- Comportement supposé d'un trigger sans lecture du .sql
- RLS supposée active sans requête de vérification

### Migrations non vérifiées

- SQL rédigé sans lecture des migrations précédentes
- Numéro de migration choisi sans vérification du répertoire
- Contrainte ajoutée sans vérifier les données existantes
- Rollback non rédigé avant exécution

### Qualité du livrable

- Fichier HTML incomplet (balises non fermées, liens morts)
- JS avec console.log en production
- CSS avec valeurs hardcodées hors :root (si fichier de design system)
- Markdown avec liens vers fichiers inexistants
- Template avec placeholders non remplis

### Non-complaisant = non-poli

> Un livrable qui ne dérange pas est suspect.
> Si les 5 lunettes passent au vert au premier essai,
> c'est que les questions n'étaient pas assez dures.

---

## Les 4 questions du CRÉATEUR

1. **Ai-je vérifié** ou ai-je supposé ?
2. **Est-ce que ça tient** ou est-ce que ça semble tenir ?
3. **Qu'est-ce que j'ai évité** de dire parce que c'était inconfortable ?
4. **Ce livrable mérite-t-il** de porter le nom BDB ?

---

## Format de verdict

```
CRÉATEUR : ✅ PREMIUM / ⚠️ ACCEPTABLE / ❌ REJET

Auto-critique :
- [Ce que j'ai vérifié vs supposé]
- [Ce que j'ai évité de dire]
- [Ce qui manque pour que ce soit premium]

Verdict final :
CRÉATEUR : [PREMIUM|ACCEPTABLE|REJET]
```

---

## Déclencheurs

Cette lunette s'active sur **TOUT LIVRABLE. TOUJOURS. SANS EXCEPTION.**

---

## GFC (Garde-fous CRÉATEUR)

| Code | Règle |
|------|-------|
| GFC-01 | Jamais de colonne DB sans vérification dans DATA_MODEL |
| GFC-02 | Jamais de migration sans lecture des migrations précédentes |
| GFC-03 | Jamais de "probablement" ou "devrait" dans un verdict |
| GFC-04 | Jamais de ✅ sans preuve — toujours indiquer la source |

---

*Conseil BDB — Lunette 5/5 — Obligatoire sur tout livrable*
