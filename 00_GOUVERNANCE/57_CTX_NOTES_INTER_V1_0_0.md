# CTX_NOTES_INTER — Notes & Rapprochement Protocoles ↔ Interventions

```
VERSION     : 1.0.0
DATE        : 2026-03-30
AUTEUR      : Manu + Claude
STATUT      : VALIDÉ — prêt pour sessions #18 + #19
PORTÉE      : Module thesaurus (recherche + modale + onglet standalone)
DÉPENDANCES : #17 CTX_PI (colonnes note_originale/reviewed ajoutées avant)
```

---

## 1 — CONTEXTE

### 1.1 Situation actuelle

`thesaurus_interventions` contient 89 721 lignes avec un champ `note` TEXT. Ce champ contient les libellés bruts saisis au bloc (source OPTIM). C'est la matière première de toute catégorisation.

Actuellement :
- Le champ `note` n'est **pas visible** dans l'interface thesaurus
- La recherche (onglet Consultation) ne cherche **pas** dans les notes
- La modale détail protocole n'affiche **pas** les interventions individuelles
- La navigation est **top-down uniquement** : protocole → fréquence globale
- Aucune navigation **bottom-up** : intervention → protocole

### 1.2 Objectif

Rendre les 89 721 notes visibles, cherchables, et navigables. Deux axes :
1. **Lecture** : voir les notes, chercher dedans, naviguer entre protocoles et interventions
2. **Détection** : identifier les rattachements douteux (note ≠ protocole)

---

## 2 — SESSION #18 — QUICK WIN (1h)

### 2.1 Périmètre

Ajouter `note` comme **8e champ de recherche** dans l'onglet Consultation du thesaurus.

### 2.2 Implémentation

Dans `thesaurus-app.js`, fonction `_applyFilters()` :

```javascript
// Ajouter 'note' au hay de recherche
const hay = [
  p.libelle_cible,
  p.synonymes_recherche,
  p.zone_anat,
  p.cat_parent,
  p.pathologie,
  p.codes_ccam,
  p.definition_expert,
  // NOUVEAU : notes des interventions associées
].join(' ').toLowerCase();
```

**Attention** : les notes sont dans `thesaurus_interventions`, pas dans `thesaurus_protocoles`. Deux approches :

| Approche | Avantage | Inconvénient |
|---|---|---|
| A — Pré-agréger les notes distinctes par protocole au chargement | Recherche instantanée | ~460 requêtes ou 1 RPC volumineuse |
| B — Recherche séparée dans interventions quand le filtre texte est actif | Pas de surcharge au chargement | Requête async à chaque frappe (debounce) |

**Recommandation** : Approche B avec debounce 500ms. Recherche `ilike` côté Supabase sur `note` filtré par les protocoles déjà affichés. Résultats fusionnés dans la liste.

### 2.3 UX

Dans le champ de recherche existant, ajouter un toggle :

```
[🔍 Rechercher] [☐ Inclure les notes]
```

Par défaut décoché (comportement actuel préservé). Quand coché, la recherche interroge aussi `thesaurus_interventions.note`.

### 2.4 Fichiers impactés

```
js/thesaurus-app.js  — _applyFilters() + toggle note
```

Pas de migration SQL. Pas de nouveau fichier.

---

## 3 — SESSION #19 — ONGLET INTERVENTIONS + NAVIGATION BIDIRECTIONNELLE

### 3.1 Périmètre

1. Onglet "Interventions" dans la modale détail protocole
2. Onglet standalone "Interventions" dans le thesaurus (tab 9)
3. Badge anomalie (rattachement douteux)

### 3.2 Modale détail protocole — onglet "Interventions"

Ajout d'un onglet dans la modale existante (après "Détails" et "Analytics") :

```
[Détails] [Analytics] [Interventions (1 247)]
```

Contenu : tableau lazy-loaded des interventions du protocole.

| Colonne | Source |
|---|---|
| Date | `date_intervention` (YYYY-MM) |
| Chirurgien | FK → `thesaurus_chirurgiens.nom` |
| Panseuse | FK → `thesaurus_panseuses.nom` |
| Note | `note` (tronquée 80 car, tooltip complète) |
| Qualité | Badge JS (même algo que CTX_PI §4.4) |
| Anomalie | Badge JS (voir §3.5) |

Pagination serveur : 20 lignes/page (`.range()`).
Filtre : chirurgien (select), année (select), recherche texte note.

**RGPD** : ne pas afficher date + protocole + chirurgien dans la même ligne.
Solution : la modale est déjà dans le contexte d'un protocole → ne pas répéter le libellé protocole dans le tableau. Afficher date + chirurgien est acceptable (pas de croisement triple).

### 3.3 Onglet standalone "Interventions" (tab 9)

Tableau brut des ~89 721 interventions. Admin-only (volume trop important pour un membre standard).

| Colonne | Source | Tri/Filtre |
|---|---|---|
| Date | `date_intervention` | Tri ↕ |
| Protocole | FK → `libelle_cible` | Filtre select (top 50 + recherche) |
| Chirurgien | FK → `nom` | Filtre select |
| Panseuse | FK → `nom` | Filtre select |
| Note | `note` (tronquée) | Recherche texte |
| Statut | `note_reviewed_at` | Filtre validé/non validé |
| Anomalie | Badge JS | Filtre oui/non |

Actions :
- Double-clic sur protocole → ouvre la modale protocole (navigation bottom-up)
- Clic sur intervention → modale détail intervention (note complète + diff originale si dispo)

Pagination serveur : 50 lignes/page.

### 3.4 Navigation bidirectionnelle

```
Protocole → [onglet Interventions] → liste des N interventions
Intervention → [double-clic protocole] → modale protocole détail
```

Le flux est circulaire : depuis un protocole on descend aux interventions, depuis une intervention on remonte au protocole.

### 3.5 Badge anomalie

Détection JS côté client : une intervention est "douteuse" si sa note ne partage **aucun mot significatif** avec le `libelle_cible` du protocole.

```javascript
function isAnomaly(note, libelle) {
  if (!note || note.length < 4) return false; // trop court = pas d'info
  const stopWords = new Set(['de','du','des','le','la','les','un','une','et','ou','par','pour','avec','dans','sur','en','a','au']);
  const noteWords = new Set(
    note.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  );
  const libelleWords = new Set(
    libelle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[\s>]+/).filter(w => w.length > 2 && !stopWords.has(w))
  );
  // Aucune intersection = anomalie
  return [...noteWords].every(w => !libelleWords.has(w));
}
```

Badge : 🔶 "Rattachement douteux" affiché en orange.

**Limite connue** : les synonymes ne sont pas pris en compte (PTH ≠ PROTHÈSE TOTALE DE HANCHE). Phase 2 éventuelle : enrichir avec `synonymes_recherche`.

### 3.6 Requête principale (onglet standalone)

```javascript
const { data, count, error } = await window.bdb
  .from('thesaurus_interventions')
  .select(`
    id, date_intervention, note, note_originale, note_reviewed_at,
    lateralite,
    protocole_id,
    thesaurus_protocoles(id, id_protocole, libelle_cible),
    thesaurus_chirurgiens(nom, prenom),
    thesaurus_panseuses(nom, prenom)
  `, { count: 'exact' })
  .order('date_intervention', { ascending: false })
  .range(offset, offset + 49)
  .select();
```

### 3.7 Performance

89 721 lignes → pagination serveur obligatoire. Jamais charger tout en mémoire.

Index recommandés (vérifier existence) :
```sql
CREATE INDEX IF NOT EXISTS idx_ti_protocole ON thesaurus_interventions(protocole_id);
CREATE INDEX IF NOT EXISTS idx_ti_chirurgien ON thesaurus_interventions(chirurgien_id);
CREATE INDEX IF NOT EXISTS idx_ti_date ON thesaurus_interventions(date_intervention DESC);
CREATE INDEX IF NOT EXISTS idx_ti_note_trgm ON thesaurus_interventions USING gin(note gin_trgm_ops);
```

L'index trigram (`gin_trgm_ops`) accélère les recherches `ILIKE '%mot%'` sur 89K lignes. Nécessite l'extension `pg_trgm` (activée par défaut sur Supabase).

---

## 4 — INTERDIT

```
INTERDIT-NI-01 : Ne JAMAIS charger les 89 721 lignes en mémoire — pagination serveur obligatoire
INTERDIT-NI-02 : Ne JAMAIS afficher date + protocole + chirurgien dans la même vue (RGPD)
INTERDIT-NI-03 : Ne JAMAIS modifier note_originale (réservé à CTX_PI workflow correction)
INTERDIT-NI-04 : Ne JAMAIS UPDATE protocole_operatoire (colonne LEGACY — ERREUR 13)
```

---

## 5 — ORDRE D'EXÉCUTION

```
1. Session #17 (CTX_PI)       → colonnes note_originale + reviewed ajoutées
2. Session #18 (quick win)    → note dans recherche Consultation
3. Session #19 (standalone)   → modale onglet + tab 9 + badge anomalie
```

#18 peut être fait indépendamment de #17 (pas besoin de note_originale pour la recherche).
#19 bénéficie de #17 (colonnes reviewed affichées dans le tableau).

---

## 6 — FICHIERS IMPACTÉS

### Session #18
```
js/thesaurus-app.js              — _applyFilters() + toggle recherche note
```

### Session #19
```
modules/thesaurus/index.html     — tab 9 + onglet modale
js/thesaurus-app.js              — ou nouveau fichier thesaurus-interventions.js
css/thesaurus-ui.css             — styles tab 9 + badge anomalie
migrations/07x_indexes.sql       — index trigram si absent
```

---
