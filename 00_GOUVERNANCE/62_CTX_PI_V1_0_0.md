# CTX_PI — Petites Interventions thesaurus

```
VERSION     : 1.0.0
DATE        : 2026-03-30
AUTEUR      : Manu + Claude
STATUT      : VALIDÉ — prêt pour session #17
PORTÉE      : Module thesaurus (onglet admin dédié) + migration SQL
DÉPENDANCES : Aucune — exécutable indépendamment
```

---

## 1 — CONTEXTE

### 1.1 Situation actuelle

`PETITE INTERVENTION` (ACT-0006) contenait initialement ~1 577 interventions non catégorisées. Après recatégorisation automatique (regex + arbitrage), il reste **~194 interventions** véritablement inclassables ou nécessitant un arbitrage humain.

Ces 194 lignes ont un champ `note` souvent dégradé :
- Accents manquants ou corrompus (encodage LATIN1 → UTF-8)
- Abréviations métier non documentées
- Fautes de frappe, inversions de lettres
- Notes mono-mot sans contexte clinique

### 1.2 Problème

La recatégorisation automatique a été "cassante" : certains gestes ont été rattachés à des protocoles par approximation regex, au détriment de la fidélité des notes. Il faut :
1. Corriger les notes brutes des 194 résiduels
2. Re-rattacher proprement vers le bon protocole
3. Auditer les rattachements douteux des passes automatiques précédentes

### 1.3 Référence

CONVENTIONS_NOMMAGE_THESAURUS V2.4.0, section 12 :
- `PETITE INTERVENTION` = dernier recours exclusif
- Toute note avec info clinique exploitable DOIT être recatégorisée
- Seules les notes sans contenu clinique = cas légitime de PI

---

## 2 — PÉRIMÈTRE

### 2.1 Périmètre principal (session #17)

Les **~194 interventions** rattachées à ACT-0006 dont la note contient potentiellement une information exploitable.

### 2.2 Périmètre étendu (post-session #17)

Les rattachements douteux des autres protocoles. Critère : interventions dont la `note` ne correspond pas au `libelle_cible` du protocole rattaché. Ce périmètre est traité dans #19 (badge anomalie).

### 2.3 Hors périmètre

- Création de nouveaux protocoles (si nécessaire lors du traitement, créer via le workflow existant CRUD thesaurus)
- Modification du schema `thesaurus_protocoles`
- Recatégorisation automatique (déjà faite — ici c'est l'arbitrage humain)

---

## 3 — SCHEMA SQL

### 3.1 Nouvelles colonnes sur `thesaurus_interventions`

Migration 071 (ou numéro suivant disponible) :

```sql
-- 071_thesaurus_note_audit.sql
ALTER TABLE thesaurus_interventions
  ADD COLUMN IF NOT EXISTS note_originale TEXT NULL;

ALTER TABLE thesaurus_interventions
  ADD COLUMN IF NOT EXISTS note_reviewed_at TIMESTAMPTZ NULL;

ALTER TABLE thesaurus_interventions
  ADD COLUMN IF NOT EXISTS note_reviewed_by UUID NULL
    REFERENCES auth.users(id);
```

### 3.2 Peuplement initial

```sql
-- Geler la note originale UNIQUEMENT pour les lignes non encore gelées
UPDATE thesaurus_interventions
SET note_originale = note
WHERE note_originale IS NULL
  AND note IS NOT NULL
  AND note != '';
```

### 3.3 Cycle de vie des colonnes

| Étape | `note` | `note_originale` | `note_reviewed_at` | `note_reviewed_by` |
|---|---|---|---|---|
| Import OPTIM | brute | copie identique | NULL | NULL |
| Correction admin | modifiée | intacte | NULL | NULL |
| Validation humaine | finale | intacte | now() | user_id |
| Purge (optionnel) | finale | → NULL | conservé | conservé |

**Règle** : `note_originale` est un filet de sécurité. Tant qu'une note n'a pas été validée par un humain (`note_reviewed_at IS NULL`), l'originale est intouchable. Après validation, la purge est optionnelle et réversible (on peut la reporter).

### 3.4 Pas de purge automatique

La purge (`UPDATE SET note_originale = NULL WHERE note_reviewed_at IS NOT NULL`) est une opération manuelle déclenchée par Manu quand le volume le justifie. Pas de trigger, pas de cron.

---

## 4 — INTERFACE

### 4.1 Emplacement

Onglet dédié dans le module thesaurus : **Tab 8 "Notes & PI"** (admin-only).

### 4.2 Vue principale

Tableau des interventions avec :

| Colonne | Source | Tri/Filtre |
|---|---|---|
| Date | `date_intervention` (YYYY-MM) | Tri ↕ |
| Chirurgien | FK `chirurgien_id` → nom | Filtre select |
| Protocole actuel | FK `protocole_id` → `libelle_cible` | Filtre select |
| Note brute | `note` | Recherche texte |
| Qualité | Calculée JS | Badge couleur |
| Statut | `note_reviewed_at` | Filtre : validé/non validé |

### 4.3 Filtres par défaut

À l'ouverture : **ACT-0006 uniquement** + **non validé** (note_reviewed_at IS NULL).

Filtres disponibles :
- "ACT-0006 uniquement" (défaut ON)
- "Tous les protocoles" (pour auditer les rattachements douteux)
- "Non validé" / "Validé" / "Tous"
- Recherche texte dans note

### 4.4 Score de qualité (JS côté client)

Badge calculé sur chaque note :

```javascript
function noteQuality(note) {
  if (!note || note.trim().length < 4) return 'empty';      // 🔴 Vide/inutile
  if (/[Ã©Ã¨Ã ]/.test(note)) return 'encoding';            // 🟠 Encodage corrompu
  if (/^\d+$/.test(note.trim())) return 'noise';             // 🟠 Chiffres seuls
  if (note.trim().split(/\s+/).length < 3) return 'short';  // 🟡 Très court
  return 'ok';                                                // 🟢 Exploitable
}
```

### 4.5 Actions par ligne

| Action | Effet | Disponible si |
|---|---|---|
| Corriger note | Modale : champ texte éditable + diff avec `note_originale` | Toujours |
| Re-rattacher | Select protocole (recherche autocomplete) → UPDATE `protocole_id` | Toujours |
| Valider | SET `note_reviewed_at = now()`, `note_reviewed_by = user_id` | Note corrigée ou confirmée |
| Voir original | Affiche `note_originale` en tooltip ou modale | `note_originale` non NULL |

### 4.6 Modale correction

```
┌─────────────────────────────────────┐
│ Correction note — Intervention #xxx │
├─────────────────────────────────────┤
│ Note originale : [texte grisé]      │
│ Note corrigée  : [_____________]    │
│                                     │
│ Protocole actuel : PETITE INTER...  │
│ Nouveau protocole : [autocomplete]  │
│                                     │
│ [Annuler]  [Valider et suivant →]   │
└─────────────────────────────────────┘
```

Le bouton "Valider et suivant" enchaîne automatiquement sur la ligne suivante non validée (workflow de chaîne).

### 4.7 Pagination

Côté serveur (`.range()` Supabase). 50 lignes par page. Le compteur total est affiché : "12/194 validées".

---

## 5 — REQUÊTES SUPABASE

### 5.1 Chargement tab PI

```javascript
const { data, error } = await window.bdb
  .from('thesaurus_interventions')
  .select(`
    id, date_intervention, note, note_originale, note_reviewed_at, note_reviewed_by,
    protocole_id,
    thesaurus_protocoles!inner(id, id_protocole, libelle_cible),
    thesaurus_chirurgiens(nom, prenom)
  `)
  .eq('protocole_id', PI_PROTOCOL_UUID)  // ACT-0006
  .is('note_reviewed_at', null)
  .order('date_intervention', { ascending: false })
  .range(0, 49)
  .select();
```

### 5.2 Correction note

```javascript
const { data, error } = await window.bdb
  .from('thesaurus_interventions')
  .update({
    note: correctedNote,
    protocole_id: newProtocoleId || existingProtocoleId,
    note_reviewed_at: new Date().toISOString(),
    note_reviewed_by: window.bdbUser.id
  })
  .eq('id', interventionId)
  .select();
```

---

## 6 — INTERDIT

```
INTERDIT-PI-01 : Ne JAMAIS modifier note_originale après peuplement initial
INTERDIT-PI-02 : Ne JAMAIS UPDATE protocole_operatoire (colonne LEGACY — ERREUR 13)
INTERDIT-PI-03 : Ne JAMAIS supprimer une intervention (même bruit pur — l'intervention a eu lieu)
INTERDIT-PI-04 : Ne JAMAIS afficher date + protocole + chirurgien simultanément (RGPD)
```

---
