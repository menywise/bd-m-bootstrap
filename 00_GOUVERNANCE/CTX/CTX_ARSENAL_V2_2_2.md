# CTX — MODULE ARSENAL

```
VERSION   : 2.2.2
DATE      : 2026-03-21
STATUT    : OPÉRATIONNEL — données partielles (gants/casaques/materiel à réimporter)
FICHIER   : modules/arsenal/index.html
CSS       : ../../css/arsenal-ui.css + ../../css/cds-overrides.css
SOURCES   : Liaison_agent_gpt_lovable_arsenal.md · prompt_agent_arsenal.md
            BIBLE_DE_BLOC_MASTER_V5.md · 01_SCHEMA_DONNEES_CLAUDE.md
NOYAU_REF : NOYAU_VERITE_V2_4_0
DELTA v2.2.1 → v2.2.2 :
  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.

TRACKER_STATUS     : en_cours
TRACKER_SHELL      : oui
TRACKER_PALIER     : 1
TRACKER_VIOLATIONS : aucune_détectée
TRACKER_UPDATED    : 2026-03-21
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0
RESTE À FAIRE    : Phase 1 données — réimport 3 tables :
                     materiel (711 lignes) : colonnes FK ajoutées
                     gants (20 lignes)     : erreur tags array
                     casaques (7 lignes)   : erreur tags array
                   Procédure : fix-csv-arrays.py → TRUNCATE CASCADE → import PGCLIENTENCODING=UTF8
                   Passage en format CTX BLOC 1-9 (prochaine session dédiée)
                   Phase 2 : tables futures (items, lames_scie, sutures, packs…)
VIOLATIONS ACTIVES :
  Aucune violation code détectée (absent des priorités SESSION_STATE 2026-03-21).
  ⚠ Format CTX pré-template V1.2.0 — structure BLOC 1-9 non encore appliquée.
     À migrer lors d'une session dédiée.
VIOLATIONS RÉSOLUES :
  - INTERDIT-E1 (bdb-shell hors main)  : migré — 2026-03-16 (D-2026-03-16-T02)
  - INTERDIT-C2 (style= statique)      : soldé — 2026-03-16 (D-2026-03-16-T02)
  - Race condition bdbShellReady       : corrigée — 2026-03-16 (v2.2.0)
  - Bug cRenforcee/cFormRenforcee      : corrigé — 2026-03-16 (v2.2.0)
```

---

## 1. ROLE

Référentiel du matériel chirurgical du bloc.
Permet de localiser le matériel (zone → armoire → étagère), consulter les références,
associer du matériel aux fiches d'intervention.

Objectif fondateur :
> "Où est-ce que tu vas poser la main pour l'attraper ?"

Un humain sans connaissance médicale doit pouvoir localiser physiquement
n'importe quel matériel, rapidement, sans ambiguïté.

## 2. PORTÉE

- Matériel : catalogue avec familles 4D, localisations, images
- Casaques : références par taille/type
- Gants : références par taille/marque
- Filtres par type de matériel, zone, étagère, tags, famille 4D, code OptimOPM
- Images associées (content_images)
- Suggestions de zone (inférence visible et traçable — jamais silencieuse)

## 3. TABLES SUPABASE

Tables actives :
```
materiel · materiel_types · etageres · casaques · gants
content_images · content_types · tags
zones_anatomiques · zones_stockage
```

Tables futures liées (Phase 2 — SUPABASE_DATA_MODEL_V1_4_0 §12) :
```
items · lames_scie · sutures · fabricants · zones_anatomiques
packs · packs_contenu
```

Note: requête `"content-images"` = bug typo Lovable hérité — ne pas corriger sans test DB.

## 4. ÉTAT DES DONNÉES — PHASE 1 PENDING

- `materiel` (711 lignes) : à réimporter (colonnes FK ajoutées)
- `gants` (20 lignes) : à réimporter (erreur tags array)
- `casaques` (7 lignes) : à réimporter (erreur tags array)

Procédure : `fix-csv-arrays.py` → `TRUNCATE CASCADE` → import avec `PGCLIENTENCODING=UTF8`

## 5. HIÉRARCHIE PHYSIQUE DE LOCALISATION (TTA 150 — 6 niveaux)

```
SEC (Secteur) → ZON (Zone) → SAL (Salle) → MBL (Mobilier) → CMP (Compartiment) → EMP (Emplacement)
```

Les seules colonnes de localisation physique dans le module : `Zone` · `Armoire` · `Étagère`
La colonne `Zone` est la source de vérité absolue. Aucune autre colonne ne peut l'écraser.

## 6. GOUVERNANCE DES DONNÉES — RÈGLES ABSOLUES

### Champs intangibles (ne jamais modifier, normaliser, fusionner)

- `Libellé` — clé métier externe
- `Libellé Nettoyé` — clé humaine physique
- `Famille` — valeur issue de l'export stérilisation

### Règle d'inférence — JAMAIS SILENCIEUSE

Toute suggestion de zone est autorisée. L'inférence silencieuse est interdite.

Formulation obligatoire :
```
🔎 Suggestion de zone : Hanche
📌 Justification : mot-clé détecté = "cotyle"
⚠️ Statut : À VALIDER PAR UN HUMAIN
```

Interdictions absolues :
- Écrire directement dans `Zone`
- Modifier une zone existante
- Appliquer un fallback automatique
- Masquer l'origine d'une suggestion

## 7. FAMILLES 4D

| Famille 4D | Description |
|-----------|-------------|
| DMI | Boîte implant labellisée |
| ANCILLAIRES | Boîte métallique chirurgien-spécifique |
| DM | Sachet ou blister individuel (consommable) |
| PACKS | Emballage multi-items stérile |
| PLIAGES | Papier bleu sous plastique |
| DOUBLES_SACHETS | Papier rose en casier |

## 8. BUG CONNU (hérité Lovable)

Deux formes coexistent : `from('content-images')` et `from('content_images')`.
Ne pas corriger : comportement hérité de Lovable, à tester sur la vraie DB avant de toucher.

## 9. ARCHITECTURE TECHNIQUE — POINTS CLÉS

```
Shell        : bdb-shell.js v1.4.0 — await window.bdbShellReady obligatoire avant tout accès
               à window.bdbUser (risque race condition sinon)
Auth         : window.bdbUser.isAdmin — jamais de requête user_roles locale
Admin slots  : arsenalAdminSlotMateriel / arsenalAdminSlotGants / arsenalAdminSlotCasaques
               Pattern C.6 — visibilité pilotée par updateAdminSlots() à chaque switchTab()
ID critiques : cRenforcee = select filtre toolbar (tab casaques)
               cFormRenforcee = checkbox form modal casaque
               NE PAS confondre — bug bloquant historique corrigé en v2.2.0
Images       : bucket "content-images" (tiret) — getSignedUrl() + syncImages()
               Max 3 images par item. Upload via setupUpload().
DB alias     : const DB = window.bdb — alias local, pas un second client (INTERDIT-A3 OK)
```

## 10. ANTI-HALLUCINATION

```
- Les données (711 lignes materiel) existent — elles sont à réimporter, pas absentes
- Ne pas conclure que les tables sont vides sans SELECT COUNT(*) direct
- Inférence de zone = toujours visible + justifiée + validée humain
  Jamais de modification silencieuse
- Les services JS (auth-service.js etc.) n'existent pas
- Ne pas "corriger" content-images sans test DB
- cRenforcee et cFormRenforcee sont deux éléments distincts — ne pas fusionner
- window.bdbShellReady DOIT être awaité avant window.bdbUser
- Tables futures (§3) = cibles Phase 2 — ne pas les référencer comme existantes
```

## 11. VOIX UTILISATEUR

Ce module est utilisé par P1 "Je ne sais pas" pour localiser du matériel.
C'est un cas d'usage critique : P1 est seul en salle, sans référent disponible.
Tout message d'état, placeholder, libellé de filtre doit être calibré P1/P2 :
phrases ≤ 12 mots, zéro jargon non défini.
Consulter PERSONAS_BDB_V1_3_0 avant toute modification éditoriale.

## 12. STACK TECHNIQUE

HTML/JS vanilla · Bootstrap 5.3.2 · Supabase JS via `window.bdb`
bdb-shell.js v1.4.0 migré ✅ (D-2026-03-16-T02)
Zéro localStorage. Zéro onclick. Zéro module ES.

## 13. AUTORISÉ

- Modifier filtres, affichage, pagination
- Ajouter colonnes depuis tables existantes
- Implémenter le filtrage par famille 4D et code OptimOPM
- Implémenter l'affichage de suggestions de zone (avec formulation obligatoire — §6)
- Implémenter le CRUD hiérarchique zone → armoire → étagère (avec traçabilité)

## 14. INTERDIT

- Modifier le schéma sans migration SQL
- "Corriger" le doublon content-images/content_images sans test DB
- CSS inline / JS inline
- Modifier les champs intangibles (Libellé, Libellé Nettoyé, Famille source)
- Écrire directement dans `Zone` sans validation humaine
- Import en masse non contrôlé (toujours par lots)
- Fusionner cRenforcee (filtre) et cFormRenforcee (form) — IDs distincts intentionnels

## 15. DÉPENDANCES

- `js/supabase-client.js` (window.bdb)
- `js/bdb-shell.js` v1.4.0 (window.bdbUser, window.bdbShellReady)
- `../../css/cds-overrides.css`
- `../../css/arsenal-ui.css`
- Module `fiches` (associations matériel ↔ interventions) — lecture seule depuis Arsenal

## HISTORIQUE

```
2026-03-08 — v1.0.0  Création initiale.
2026-03-12 — v2.0.0  Enrichissement Agent Arsenal + Bible V5/V7 + schéma données.
2026-03-15 — v2.1.0  NOYAU_REF V2.1.0. Anti-hallucination. Voix P1.
2026-03-16 — v2.2.0  Migration bdb-shell.js. Bug cRenforcee/cFormRenforcee corrigé.
                      bdbShellReady race condition corrigée. Pattern C.6 admin slots.
                      Corrections CDS (style=, ordre scripts). Dead code retiré.
                      NOYAU_REF V2.3.0.
2026-03-16 — v2.2.1  NOYAU_REF V2_4_0. PERSONAS underscore.
                      DATA_MODEL référence V1_4_0 (§3 tables futures).
2026-03-21 — v2.2.2  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
```
