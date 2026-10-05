# Référentiel Packs Consommables — BDB Data Métier

```
VERSION  : 1.0.0
DATE     : 2026-04-12
SOURCE   : CONTENU_pack-Grid_view.csv (archive Airtable — remplacée par ce fichier)
STATUT   : DONNÉES VALIDÉES MANU — import en attente schéma DB
AUTEUR   : Manu Rohaut
```

## Statut import

| Destination BDB | Statut | Détail |
|---|---|---|
| `materiel` (60 items uniques) | ⏳ Pas encore | Seed prêt dans ce fichier — types à créer |
| Table `pack_items` (compositions) | ⏳ Pas encore | DDL à décider (session dédiée) |
| Lien pack → `thesaurus_protocoles` | ⏳ Pas encore | Mapping pack → ACT-* à établir |
| **XRD items sécurité patient** | ✅ Préservé | Flag critique — ne jamais perdre |

## ⚠ Items XRD — Comptage obligatoire (sécurité patient)

Ces 5 items sont radio-opaques. Leur comptage avant fermeture est une obligation de sécurité.
Le flag `is_xrd = true` doit être préservé dans tout schéma futur.

| Item | Packs concernés |
|---|---|
| **COMPRESSE ABDOMINALE XRD** | PTH Voie Antérieure, PTG (Prothèse Totale Genou) |
| **COMPRESSE GAZE XRD** | Arthroscopie Cheville |
| **COMPRESSE NON-TISSÉE XRD** | PTG (Prothèse Totale Genou), Chirurgie Épaule (ciel ouvert), Hanche (PTH postéro-latérale) |
| **CRAYON DERMOGRAPHIQUE XRD** | Chirurgie Épaule (ciel ouvert) |
| **DRAIN DE REDON** | Hanche (PTH postéro-latérale) |

## Schéma futur attendu

```sql
-- Table packs_consommables
CREATE TABLE packs_consommables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,  -- ex: pth_anterieure
  label       text NOT NULL,
  protocole_id text,                 -- FK thesaurus_protocoles.id_protocole
  specialite  text,
  created_at  timestamptz DEFAULT now()
);

-- Table pack_items (composition)
CREATE TABLE pack_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id     uuid NOT NULL REFERENCES packs_consommables(id) ON DELETE CASCADE,
  materiel_id uuid REFERENCES materiel(id),
  item_label  text NOT NULL,          -- nom libre si materiel_id NULL
  quantite    integer NOT NULL DEFAULT 1,
  is_xrd      boolean NOT NULL DEFAULT false,  -- radio-opaque, comptage obligatoire
  volume      text,                   -- ex: "60cc", "1000 ml"
  position    smallint DEFAULT 0
);
```

## Mapping pack → protocole (à confirmer par Manu)

| Slug pack | Label | Protocole thésaurus probable |
|---|---|---|
| `arthroscopie_genou` | Arthroscopie Genou | Arthroscopie genou (ACT-*) — **à confirmer** |
| `hernie_discale` | Hernie Discale (Neuro) | Discectomie / hernie discale (ACT-*) — **à confirmer** |
| `pied_extremite` | Pied / Extrémité | Chirurgie pied et cheville (ACT-*) — **à confirmer** |
| `pth_anterieure` | PTH Voie Antérieure | PTH voie antérieure (ACT-*) — **à confirmer** |
| `ptg` | PTG | PTG (ACT-*) — **à confirmer** |
| `chirurgie_epaule` | Chirurgie Épaule ciel ouvert | Chirurgie épaule (ACT-*) — **à confirmer** |
| `main_extremite` | Main / Extrémité | Chirurgie main (ACT-*) — **à confirmer** |
| `arthro_cheville` | Arthroscopie Cheville | Arthroscopie cheville (ACT-*) — **à confirmer** |
| `arthroscopie_epaule` | Arthroscopie Épaule | Arthroscopie épaule (ACT-*) — **à confirmer** |
| `hanche` | Hanche PTH postéro-latérale | PTH voie postérieure / latérale (ACT-*) — **à confirmer** |

## Compositions par pack

### Arthroscopie Cheville

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP DE TABLE | 1 |  |  |
| CHAMP EXTRÉMITÉ | 1 |  |  |
| CHAMP FENDU | 1 |  |  |
| POCHE DE RECUEIL | 1 |  |  |
| BANDE ADHÉSIVE | 2 |  |  |
| JERSEY | 1 |  |  |
| TUBULURE IRRIGATION | 1 |  |  |
| TUYAU ASPIRATION | 2 |  |  |
| HOUSSE CAMÉRA | 1 |  |  |
| BANDE CRÊPE 10 CM | 1 |  |  |
| BADIGEON | 1 |  |  |
| MEPILEX BORDER POST‑OP | 2 |  |  |
| AIGUILLE 23G | 1 |  |  |
| LAME DE BISTOURI N°15 | 1 |  |  |
| SUTURE DAFILON | 1 |  |  |
| SERINGUE STANDARD 20cc | 1 |  |  |
| COMPRESSE GAZE XRD | 1 | traceur=XRD | ⚠ XRD |
| CUPULE | 2 | volume=120 ml |  |
| COMPRESSE NON-TISSÉE | 1 |  |  |
| BANDE OUATE 10 CM | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### Arthroscopie Épaule

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP ÉPAULE | 1 |  |  |
| PANSEMENT ABSORBANT | 1 |  |  |
| AIGUILLE 21G | 1 |  |  |
| SERINGUE STANDARD 20cc | 1 |  |  |
| LAME DE BISTOURI N°11 | 1 |  |  |
| TUBULURE IRRIGATION | 1 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| HOUSSE CAMÉRA | 1 |  |  |
| COMPRESSE NON-TISSÉE | 20 |  |  |
| JERSEY | 2 |  |  |
| TUYAU ASPIRATION | 2 |  |  |
| CUPULE | 2 | volume=120 ml |  |
| CHAMP DE TABLE | 1 |  |  |

### Arthroscopie Genou

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| BANDE ADHÉSIVE | 1 |  |  |
| CHAMP ARTHROSCOPIE | 1 |  |  |
| LAME DE BISTOURI N°11 | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| HOUSSE CAMÉRA | 1 |  |  |
| TUYAU ASPIRATION | 1 |  |  |
| BADIGEON | 1 |  |  |
| TUBULURE IRRIGATION | 1 |  |  |
| SERINGUE STANDARD 20cc | 1 |  |  |
| AIGUILLE 21G | 1 |  |  |
| JERSEY | 1 |  |  |
| COMPRESSE NON-TISSÉE | 10 |  |  |
| BANDE OUATE 15 CM | 1 |  |  |
| BANDE CRÊPE 15 CM | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### Chirurgie Épaule (ciel ouvert)

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP ADHÉSIF | 1 |  |  |
| CHAMP FENDU | 1 |  |  |
| AGRAFEUSE CUTANÉE | 1 |  |  |
| CANULE YANKAUER | 1 |  |  |
| SUTURE STERI-STRIP | 1 |  |  |
| CHAMP TROUÉ | 1 |  |  |
| BANDE ADHÉSIVE | 2 |  |  |
| PANSEMENT ABSORBANT | 1 |  |  |
| CRAYON DERMOGRAPHIQUE XRD | 1 | traceur=XRD | ⚠ XRD |
| ÉLECTRODE BISTOURI (LONGUE PIC) | 1 |  |  |
| LAME DE BISTOURI N°23 | 2 |  |  |
| COMPRESSE NON-TISSÉE XRD | 30 | traceur=XRD | ⚠ XRD |
| JERSEY | 2 |  |  |
| BOL | 1 | volume=1000 ml |  |
| COMPRESSE NON-TISSÉE | 10 |  |  |
| CUPULE | 1 | volume=120 ml |  |
| BISTOURI ÉLECTRIQUE | 1 |  |  |
| SERINGUE LAVAGE | 2 | vol=60cc |  |
| BADIGEON | 1 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 2 |  |  |
| TUYAU ASPIRATION | 1 |  |  |
| CHAMP DE TABLE | 2 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### Hanche (PTH postéro-latérale)

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP HANCHE | 1 |  |  |
| CHAMP FENDU | 1 |  |  |
| ESSUIE-MAINS | 4 |  |  |
| CHAMP ADHÉSIF | 2 |  |  |
| CANULE YANKAUER | 1 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| SUTURE STERI-STRIP | 2 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| BOL | 1 | volume=1000 ml |  |
| BOL | 1 | volume=500 ml |  |
| DRAIN DE REDON | 1 | traceur=XRD | ⚠ XRD |
| COUVRE POIGNÉE SCIALYTIQUE | 2 |  |  |
| COMPRESSE NON-TISSÉE XRD | 1 | traceur=XRD | ⚠ XRD |
| COMPRESSE NON-TISSÉE | 1 |  |  |
| BOÎTE À AIGUILLES | 1 |  |  |
| TUYAU ASPIRATION | 1 |  |  |
| LAME DE BISTOURI N°23 | 2 |  |  |
| AGRAFEUSE CUTANÉE | 1 |  |  |
| BADIGEON | 2 |  |  |
| BISTOURI ÉLECTRIQUE | 1 |  |  |
| SERINGUE LAVAGE | 2 | vol=60cc |  |
| JERSEY | 1 |  |  |
| PANSEMENT ABSORBANT | 1 |  |  |
| STOCKINETTE | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| HOUSSE MAYO | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### Hernie Discale (Neuro)

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP TROUÉ | 1 |  |  |
| MEPORE | 1 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| TUYAU ASPIRATION | 1 |  |  |
| COMPRESSE NON-TISSÉE | 20 |  |  |
| AGRAFEUSE CUTANÉE | 1 |  |  |
| SERINGUE STANDARD 20cc | 2 |  |  |
| AIGUILLE 19G | 1 |  |  |
| CATHÉTER IV 16G | 1 |  |  |
| LAME DE BISTOURI N°15 | 1 |  |  |
| SERINGUE STANDARD 5cc | 1 |  |  |
| LAME DE BISTOURI N°23 | 1 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 1 |  |  |
| BOL | 1 | volume=250 ml |  |
| CUPULE | 1 | volume=120 ml |  |
| CHAMP DE TABLE | 1 |  |  |

### Main / Extrémité

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP MAIN | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| LAME DE BISTOURI N°15 | 1 |  |  |
| SERINGUE STANDARD 20cc | 1 |  |  |
| BADIGEON | 1 |  |  |
| BANDE CRÊPE 10 CM | 1 |  |  |
| BANDE OUATE 10 CM | 1 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| COMPRESSE NON-TISSÉE | 10 |  |  |
| CUPULE | 2 | volume=60 ml |  |
| JERSEY | 1 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### Pied / Extrémité

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP EXTRÉMITÉ | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| SERINGUE STANDARD 20cc | 1 |  |  |
| LAME DE BISTOURI N°15 | 1 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| COMPRESSE NON-TISSÉE | 10 |  |  |
| CUPULE | 1 | volume=60 ml |  |
| BADIGEON | 1 |  |  |
| BANDE OUATE 10 CM | 1 |  |  |
| BANDE CRÊPE 10 CM | 1 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 1 |  |  |
| JERSEY | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |

### PTG (Prothèse Totale Genou)

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP ADHÉSIF | 1 |  |  |
| CHAMP FENDU | 1 |  |  |
| CHAMP FENDU | 1 |  |  |
| CANULE YANKAUER | 1 |  |  |
| CHAMP ADHÉSIF | 1 |  |  |
| CHAMP DE TABLE | 1 |  |  |
| ESSUIE-MAINS | 2 |  |  |
| BANDE ADHÉSIVE | 1 |  |  |
| BOÎTE À AIGUILLES | 1 |  |  |
| POCHE À BISTOURI | 1 |  |  |
| FIXE TUBE | 1 |  |  |
| PANSEMENT ABSORBANT | 1 |  |  |
| COMPRESSE ABDOMINALE XRD | 1 | traceur=XRD | ⚠ XRD |
| COMPRESSE NON-TISSÉE XRD | 1 | traceur=XRD | ⚠ XRD |
| TUYAU ASPIRATION | 1 |  |  |
| COMPRESSE NON-TISSÉE | 1 |  |  |
| CUPULE | 1 | volume=120 ml |  |
| BOL | 1 | volume=500 ml |  |
| BADIGEON | 2 |  |  |
| SUTURE STERI-STRIP | 2 |  |  |
| SERINGUE LAVAGE | 1 | vol=60cc |  |
| LAME DE BISTOURI N°23 | 1 |  |  |
| JERSEY | 1 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 2 |  |  |
| BISTOURI ÉLECTRIQUE | 1 |  |  |
| AGRAFEUSE CUTANÉE | 1 |  |  |
| BANDE CRÊPE 15 CM | 1 |  |  |
| BANDE OUATE 15 CM | 1 |  |  |

### PTH Voie Antérieure

| Item | Qté | Attributs | XRD |
|---|---|---|---|
| CHAMP DE TABLE | 1 |  |  |
| CHAMP HANCHE VA | 1 |  |  |
| CHAMP ADHÉSIF | 5 |  |  |
| BANDE ADHÉSIVE | 3 |  |  |
| POCHE À BISTOURI | 1 |  |  |
| HOUSSE MAYO | 1 |  |  |
| POCHE DE LUXATION | 1 |  |  |
| COMPRESSE ABDOMINALE XRD | 10 |  | ⚠ XRD |
| GRATTE-BISTOURI | 2 |  |  |
| AIGUILLE 18G | 1 |  |  |
| SERINGUE LAVAGE | 2 | vol=60cc |  |
| ÉLECTRODE BISTOURI (LONGUE PIC) | 1 |  |  |
| SUTURE VICRYL | 1 |  |  |
| BOÎTE À AIGUILLES | 1 |  |  |
| LAME DE BISTOURI N°23 | 2 |  |  |
| SUTURE VICRYL | 1 |  |  |
| SERINGUE LAVAGE | 2 | vol=60cc |  |
| FIXE TUBE | 1 |  |  |
| CANULE YANKAUER | 1 |  |  |
| JERSEY | 2 |  |  |
| TUYAU ASPIRATION | 1 |  |  |
| BOL | 1 | volume=1000 ml |  |
| COMPRESSE GAZE | 1 |  |  |
| BANDE CRÊPE 10 CM | 2 |  |  |
| COUVRE POIGNÉE SCIALYTIQUE | 2 |  |  |
| BISTOURI ÉLECTRIQUE | 1 |  |  |

## 60 items uniques — seed futur `materiel`

| Item | Volumes possibles | XRD | Catégorie probable |
|---|---|---|---|
| AGRAFEUSE CUTANÉE | — |  | Autre |
| AIGUILLE 18G | — |  | Injection |
| AIGUILLE 19G | — |  | Injection |
| AIGUILLE 21G | — |  | Injection |
| AIGUILLE 23G | — |  | Injection |
| BADIGEON | — |  | Autre |
| BANDE ADHÉSIVE | — |  | Contention / Pansement |
| BANDE CRÊPE 10 CM | — |  | Contention / Pansement |
| BANDE CRÊPE 15 CM | — |  | Contention / Pansement |
| BANDE OUATE 10 CM | — |  | Contention / Pansement |
| BANDE OUATE 15 CM | — |  | Contention / Pansement |
| BISTOURI ÉLECTRIQUE | — |  | Lame / Bistouri |
| BOL | 1000 ml, 250 ml, 500 ml |  | Contenant |
| BOÎTE À AIGUILLES | — |  | Injection |
| CANULE YANKAUER | — |  | Connectique |
| CATHÉTER IV 16G | — |  | Injection |
| CHAMP ADHÉSIF | — |  | Champ opératoire |
| CHAMP ARTHROSCOPIE | — |  | Champ opératoire |
| CHAMP DE TABLE | — |  | Champ opératoire |
| CHAMP EXTRÉMITÉ | — |  | Champ opératoire |
| CHAMP FENDU | — |  | Champ opératoire |
| CHAMP HANCHE | — |  | Champ opératoire |
| CHAMP HANCHE VA | — |  | Champ opératoire |
| CHAMP MAIN | — |  | Champ opératoire |
| CHAMP TROUÉ | — |  | Champ opératoire |
| CHAMP ÉPAULE | — |  | Champ opératoire |
| COMPRESSE ABDOMINALE XRD | — | ⚠ OUI | Compresse |
| COMPRESSE GAZE | — |  | Compresse |
| COMPRESSE GAZE XRD | — | ⚠ OUI | Compresse |
| COMPRESSE NON-TISSÉE | — |  | Compresse |
| COMPRESSE NON-TISSÉE XRD | — | ⚠ OUI | Compresse |
| COUVRE POIGNÉE SCIALYTIQUE | — |  | Protection stérile |
| CRAYON DERMOGRAPHIQUE XRD | — | ⚠ OUI | Autre |
| CUPULE | 120 ml, 60 ml |  | Contenant |
| DRAIN DE REDON | — | ⚠ OUI | Drainage |
| ESSUIE-MAINS | — |  | Autre |
| FIXE TUBE | — |  | Autre |
| GRATTE-BISTOURI | — |  | Lame / Bistouri |
| HOUSSE CAMÉRA | — |  | Protection stérile |
| HOUSSE MAYO | — |  | Protection stérile |
| JERSEY | — |  | Contention / Pansement |
| LAME DE BISTOURI N°11 | — |  | Lame / Bistouri |
| LAME DE BISTOURI N°15 | — |  | Lame / Bistouri |
| LAME DE BISTOURI N°23 | — |  | Lame / Bistouri |
| MEPILEX BORDER POST‑OP | — |  | Pansement |
| MEPORE | — |  | Pansement |
| PANSEMENT ABSORBANT | — |  | Pansement |
| POCHE DE LUXATION | — |  | Pansement |
| POCHE DE RECUEIL | — |  | Pansement |
| POCHE À BISTOURI | — |  | Lame / Bistouri |
| SERINGUE LAVAGE | 60cc |  | Injection |
| SERINGUE STANDARD 20cc | — |  | Injection |
| SERINGUE STANDARD 5cc | — |  | Injection |
| STOCKINETTE | — |  | Contention / Pansement |
| SUTURE DAFILON | — |  | Suture |
| SUTURE STERI-STRIP | — |  | Suture |
| SUTURE VICRYL | — |  | Suture |
| TUBULURE IRRIGATION | — |  | Connectique |
| TUYAU ASPIRATION | — |  | Connectique |
| ÉLECTRODE BISTOURI (LONGUE PIC) | — |  | Lame / Bistouri |