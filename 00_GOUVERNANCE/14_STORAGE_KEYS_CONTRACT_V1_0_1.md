# STORAGE KEYS CONTRACT
## Contrat officiel des clés localStorage — Planning Engine

```
VERSION  : 1.0.1
DATE     : 2026-03-01
AUTEUR   : Manu + Claude
STATUT   : CONTRAT ACTIF
NOYAU_REF: NOYAU_VERITE_V1.12.0
REMPLACE : STORAGE_KEYS_CONTRACT v1.0.0 (terrain 2026-02-26)
```

---

## RÈGLE FONDAMENTALE

Toute lecture ou écriture d'une clé semaine dans localStorage
passe OBLIGATOIREMENT par StorageKeyService.
Aucun consommateur ne construit ou ne lit une clé manuellement.

---

## FORMAT OFFICIEL

### Clé semaine

YYYY_WW_planning_week

Composants :
- YYYY : année ISO 4 chiffres
- WW   : numéro de semaine ISO padded 2 chiffres
- planning_week : suffixe fixe

Exemples valides :
- 2026_05_planning_week
- 2025_52_planning_week
- 2026_01_planning_week

Formats interdits (legacy — ne jamais recréer) :
- planning_S05_2026
- S5_2026
- planning_week_2026_5
- Tout préfixe "planning_" seul
- Format "planning_S{week}_{year}"
- Filtrage via startsWith("planning_")
- Couplage à un préfixe hardcodé

---

## API — StorageKeyService

Fichier : FRONT/services/storage-key-service.js

Méthode           | Signature              | Description
makeWeekKey       | (year, week) → string  | Construit la clé canonique
isWeekKey         | (key) → boolean        | Vérifie si une clé est valide
parseWeekKey      | (key) → {year, week}   | Extrait année et semaine
listWeekKeys      | () → string[]          | Liste toutes les clés semaine

Règle : makeWeekKey et parseWeekKey sont les deux points d'accès uniques.
Aucun regex /S(\d+)_(\d+)/ ou "planning_S" dans le code consommateur.

---

## EXCEPTION DOCUMENTÉE

Clé                      | Module               | Accès          | Statut
planning_custom_aliases  | planning-members.js  | localStorage   | EXCEPTION VALIDÉE

Motif : préférences UI locales (correction OCR). Ne participe à aucune clé composite,
aucun export, aucune analyse. CDS_Storage n'apporte aucune valeur.

Toute nouvelle clé doit passer par CDS_Storage et être documentée ici.

---

## MIGRATION LEGACY

Règle : toute migration doit être idempotente, non destructive, journalisée.
Suppression des anciennes clés : validée par Manu avant exécution.

Les snapshots JSON produits avant la session 2026-02-26 contiennent salle en format legacy.
Correction requise avant import : salle: 5 → salle: "05".
Les semaines S01 à S05 2025 ont été corrigées (session 2026-02-27).
Les semaines S06+ sont canoniques (produites via createAffectation()).

---

## CONSOMMATEURS CONFORMES (audit 2026-02-27)

Fichier                                    | Statut
planning-schema.js (getWeekKey)            | Conforme
planning-analytics.js                      | Conforme
planning-export.js                         | Conforme
export-controller.js                       | Conforme
storage-key-service.js                     | Source canonique
dashboard.html                             | Corrigé (2026-02-27)
planning-modal-lab.html                    | Corrigé (2026-02-27)
cds-storage.js / migrateLegacyPlanningKeys | Légitime — gestion migration legacy

---

## HISTORIQUE

DATE        | VERSION | ACTION
2026-02-26  | 1.0.0   | Création. Format YYYY_WW_planning_week. StorageKeyService défini.
2026-02-27  | —       | Exception planning_custom_aliases. Audit consommateurs soldé. (intégré en v1.0.0 terrain)
2026-03-01  | 1.0.1   | Fusion version terrain + version session. Ajout tableau consommateurs. NOYAU_REF v1.12.0.
