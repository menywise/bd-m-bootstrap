# WORKFLOW — 6 Étapes + Anti-Collision

## Vue d'ensemble

```
SOUMISSION ──► AUTO-DIAGNOSTIC ──► IA EXTERNE ──► CONSOLIDATION ──► LIVRABLE V2 ──► ARCHIVAGE
   Étape 1          Étape 2           Étape 3         Étape 4          Étape 5        Étape 6
```

---

## Étape 1 — Rédaction de la soumission

**Qui :** Claude (session de travail BDB)
**Outil :** `templates/SOUMISSION.md`

1. Décrire le livrable en 3-5 phrases (quoi, pourquoi, périmètre)
2. Déclarer les zones de collision :
   - Tables DB touchées
   - Modules JS impactés
   - Sessions parallèles connues
   - Risque de collision temporelle
3. Remplir l'auto-diagnostic 5 lunettes (§ Étape 2)

---

## Étape 2 — Auto-diagnostic Claude (5 lunettes)

**Qui :** Claude, dans la soumission
**Durée estimée :** 5-10 min

Pour chaque lunette, Claude répond honnêtement :

| Lunette | Question | Réponse attendue |
|---------|----------|-----------------|
| TERRAIN | Le workflow tient-il avec des gants mouillés ? | ✅ / ⚠️ / ❌ + justification |
| ARCHITECTURE | Le code tient-il sans moi dans 6 mois ? | ✅ / ⚠️ / ❌ + justification |
| MARCHÉ | Brigitte signerait-elle ? | ✅ / ⚠️ / ❌ + justification |
| PHILOSOPHIE | Ça respecte ce pour quoi BDB existe ? | ✅ / ⚠️ / ❌ + justification |
| CRÉATEUR | C'est premium, vérifié, non-complaisant ? | ✅ / ⚠️ / ❌ + justification |

> **Règle d'honnêteté :** Si Claude met ✅ partout, le diagnostic est suspect.
> Un livrable honnête a au moins une ⚠️.

---

## Étape 3 — Analyse IA externe (optionnel mais recommandé)

**Qui :** Manu (ou délégué)
**Outils :** Perplexity + Gemini (voir `prompts/index.html`)

### Perplexity — Rôle Brigitte (lunette MARCHÉ)
1. Copier `prompts/PERPLEXITY.md` en entier
2. Coller dans Perplexity
3. Ajouter le contenu de la soumission
4. Récupérer le verdict Brigitte

### Gemini — Rôle Ewan (lunette ARCHITECTURE)
1. Copier `prompts/GEMINI.md` en entier
2. Coller dans Gemini
3. Ajouter le contenu de la soumission
4. Récupérer le verdict Ewan

---

## Étape 4 — Consolidation des fragilités

**Qui :** Claude (guidé par Manu)

1. Croiser les P1 de l'auto-diagnostic + Brigitte + Ewan
2. Classifier chaque fragilité :

| Priorité | Définition | Action |
|----------|------------|--------|
| **P1** | Bloquant — livrable non exécutable | Corriger avant tout |
| **P2** | Avant déploiement — risque identifié | Corriger dans la session |
| **P3** | Dette documentée — acceptable | Logger, deadline < 30 j |

3. Si P1 identifié → retour Étape 1 avec soumission V2

---

## Étape 5 — Livrable V2

**Qui :** Claude

- Produire le livrable corrigé
- Documenter explicitement le diff V1→V2 :
  ```
  CORRIGÉ V1→V2 :
  - [P1] Description du correctif
  - [P2] Description du correctif
  ```
- Le livrable V2 porte toutes les corrections P1 + P2

---

## Étape 6 — Archivage

**Qui :** Claude + Manu

1. Archiver le verdict dans `verdicts/YYYY-MM-DD_[sujet].md`
   - Utiliser `templates/RAPPORT.md`
2. Appender au `JOURNAL_DECISIONS` :
   ```
   DATE . CONSEIL . [sujet] . Verdict [SOLIDE|FRAGILE|BLOQUANT] . P1:[n] P2:[n] P3:[n]
   ```
3. Mettre à jour le `CHANTIER_TECHNIQUE` si fragilité structurelle détectée

---

## Anti-Collision

Toute soumission DOIT déclarer :

```markdown
## Anti-collision

- Tables DB touchées : [liste ou "aucune"]
- Modules JS impactés : [liste ou "aucun"]
- Sessions parallèles connues : [liste ou "aucune"]
- Risque temporel : si [X] s'exécute pendant que [Y] tourne → [conséquence]
```

> Un livrable sans déclaration anti-collision est une soumission incomplète.
> Elle ne passe pas en Étape 3.

---

## Règle de déclenchement

| Déclencheur | Lunettes obligatoires |
|-------------|----------------------|
| Nouveau workflow ou formulaire | TERRAIN + CRÉATEUR |
| Migration DB, nouveau module, trigger, RLS | ARCHITECTURE + CRÉATEUR |
| Données RH, multi-site, RGPD | MARCHÉ + CRÉATEUR |
| Classements, per-opératoire, surveillance | PHILOSOPHIE + CRÉATEUR |
| Tout livrable | CRÉATEUR (toujours) |

---

*Conseil BDB — L3 Atelier — Ne voyage jamais avec le produit*
