# Référentiel Sutures — BDB Data Métier

```
VERSION  : 1.0.0
DATE     : 2026-04-12
SOURCE   : Sutures-Grid_view.csv (archive Airtable — remplacée par ce fichier)
STATUT   : DONNÉES VALIDÉES MANU — import partiel effectué
AUTEUR   : Manu Rohaut
```

## Statut import

| Destination BDB | Statut | Détail |
|---|---|---|
| `glossaire` (équivalences + définitions) | ✅ SQL généré | 35 entrées — migration NEXT à exécuter |
| `materiel` (fiche technique complète) | ⏳ Pas encore | Colonnes aiguille/longueur/matière/structure absentes du schéma actuel |
| `cours` (contenu pédagogique) | ⏳ Pas encore | Colonnes "Usage Pédagogique" + "Info Technique" = source directe |
| Picking thésaurus | ⏳ Pas encore | Colonne "Spécialité" à croiser avec protocoles |

---

## Schéma futur attendu — table `materiel` extension sutures

Colonnes à ajouter (ou JSONB `proprietes`) :

```
ref_fournisseur    TEXT     -- ID source (ex: C0934429, J473H)
aiguille_type      TEXT     -- 3/8, 1/2, Droite, Sans
aiguille_taille    TEXT     -- 30mm TR, 21mm TR, 5.1mm RDE...
longueur_cm        NUMERIC  -- longueur en cm
matiere_famille    TEXT     -- Polyamide, Polyglactine 910, etc.
structure_type     TEXT     -- Monofilament Résorbable, Tressé Non-Résorbable, etc.
couleur            TEXT     -- Bleu, Violet, Vert, Noir, Incolore
specialites        TEXT[]   -- ORTHO, VASCULAIRE, PLASTIQUE...
usage_pedagogique  TEXT     -- usage IBODE
info_technique     TEXT     -- note technique
```

---

## Données complètes (source de vérité)

### Groupe 1 — Monofilament Non-Résorbable

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| C0934429 | DAFILON 1 | 3/8 30mm TR | 90 cm | Polyamide | Bleu | ORTHO | MONOSOF, ETHILON, NYLON |
| C0932873 | DAFILON 2/0 | 1/2 21mm TR | 90 cm | Polyamide | Bleu | ORTHO | FLEXOCR, ETHILON |
| C0935522 | DAFILON 2/0 (Aig 30mm) | 3/8 30mm TR | 90 cm | Polyamide | Bleu | ORTHO | ETHILON, MONOSOF |
| C0935107 | DAFILON 3/0 (Aig 16mm) | 3/8 16mm TR | 75 cm | Polyamide | Bleu | ORTHO, PLASTIQUE | ETHILON, MONOSOF |
| C0935328 | DAFILON 3/0 (Aig 24mm) | 3/8 24mm TR | 90 cm | Polyamide | Bleu | ORTHO | ETHILON, MONOSOF |
| 1665G | ETHILON NOIR 6/0 | 3/8 16mm TR | 45 cm | Polyamide | Noir | PLASTIQUE, URGENCES | DAFILON, NYLON |
| W2829 | ETHILON NOIR 9/0 | 3/8 5.1mm RDE | 13 cm | Polyamide | Noir | MAIN, NEURO | NYLON MICRO |
| 8833H | PROLENE 2/0 | 1/2 26mm RDE | 75 cm | Polypropylène | Bleu | ORTHO, VASCULAIRE | SURGIPRO |
| EH7694H | PROLENE 3/0 | 3/8 24mm TR | 75 cm | Polypropylène | Bleu | ORTHO, PLASTIQUE | SURGIPRO |
| F2806 | PROLENE 4/0 | 3/8 16mm TR | 7.5 cm | Polypropylène | Bleu | PLASTIQUE | SURGIPRO |
| 8870H | PROLENE 5/0 | 1/2 17mm RDE | 75 cm | Polypropylène | Bleu | VASCULAIRE | SURGIPRO |
| EH7474H | PROLENE 6/0 | 3/8 13mm TAPER | 75 cm | Polypropylène | Bleu | VASCULAIRE, NEURO | SURGIPRO |

### Groupe 2 — Tressé Non-Résorbable

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| F2517 | MERSILENE 3 | 1/2 26mm TR | 75 cm | Polyester | Vert | GYNECO, ORTHO | DAGROFIL, PREMICRON |
| C0026508 | PREMICRON 1 | Droite 51mm | 75 cm | Polyester | Vert | ORTHO | ETHIBOND |
| B0026399 | PREMICRON 5 | 1/2 48mm TR | 75 cm | Polyester | Vert | ORTHO LOURDE | FLEXIDE, ETHIBOND 5 |

### Groupe 3 — Monofilament Résorbable

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| W3200 | MONOCRYL 3/0 | 1/2 30mm | 70 cm | Poliglecaprone 25 | Incolore | ORTHO, PLASTIQUE | MONOSYN, CAPROSYN |
| C2023404 | MONOSYN 4/0 | 3/8 19mm TR | 70 cm | Glyconate | Incolore | PLASTIQUE | MONOCRYL, CAPROSYN |

### Groupe 4 — Monofilament Résorbable Lent (PDS)

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| Z311H | PDS II 3/0 | 1/2 22mm RPA | 70 cm | Polydioxanone | Violet | ORTHO, VISCERAL | MONOPLUS, MAXON |
| Z397H | PDS II 4/0 | 3/8 19mm TR | 70 cm | Polydioxanone | Violet | VASCULAIRE, ORTHO | MONOPLUS |
| FZ420E | PDS II 5/0 | 3/8 16mm TR | 70 cm | Polydioxanone | Violet | MAIN | MONOPLUS |

### Groupe 5 — Tressé Résorbable (VICRYL / POLYSORB)

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| J473H | VICRYL 0 | 1/2 36mm TR | 90 cm | Polyglactine 910 | Violet | POLYVALENT | POLYSORB (CL-927) |
| JV474 | VICRYL 1 | 1/2 37mm TR | 90 cm | Polyglactine 910 | Violet | ORTHO | POLYSORB |
| JV251 | VICRYL 2 | 1/2 22mm RDE | 75 cm | Polyglactine 910 | Violet | VISCERAL, ORTHO | POLYSORB |
| V1059H | VICRYL 2 (Aig 48mm) | 1/2 48mm TR | 90 cm | Polyglactine 910 | Violet | VISCERAL | POLYSORB |
| J459H | VICRYL 2/0 | 1/2 24mm TR | 75 cm | Polyglactine 910 | Violet | POLYVALENT | POLYSORB (SL) |
| J460H | VICRYL 3/0 | 1/2 24mm TR | 75 cm | Polyglactine 910 | Violet | POLYVALENT | POLYSORB (SL) |
| CL927 | POLYSORB 0 | 1/2 48mm TR | 90 cm | Lactomer | Violet | VISCERAL, ORTHO | VICRYL (J473H) |
| CL-833 | POLYSORB 2/0 | 1/2 40mm TR | 75 cm | Lactomer | Violet | ORTHO, VISCERAL | VICRYL (J459H) |
| SL-635 | POLYSORB 4/0 | 3/8 19mm TR | 75 cm | Lactomer | Violet | PLASTIQUE, ORTHO | VICRYL |
| GL-890 | POLYSORB 5/0 | 3/8 13mm TAPER | 75 cm | Lactomer | Violet | URO, PEDIATRIE | VICRYL |

### Groupe 6 — Résorption Rapide

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| VR2298 | VICRYL RAPIDE 3/0 | 3/8 19mm TR | 75 cm | Polyglactine Irradié | Incolore | PEDIATRIE, MAIN | VELOSORB, RAPID |
| VR2279 | VICRYL RAPIDE 4/0 | 3/8 17mm RDE | 75 cm | Polyglactine Irradié | Incolore | URO, PEDIATRIE | VELOSORB, RAPID |

### Groupe 7 — Spéciaux

| ID | Désignation | Aiguille | Long. | Matière | Couleur | Spécialité | Équivalences |
|---|---|---|---|---|---|---|---|
| SXPP1A445 | STRATAFIX 1 | 1/2 48mm TR | 60 cm | Polydioxanone Cranté | Incolore | ORTHO (GENOU) | V-LOC, QUILL |
| PS3203 | LAC VASCULAIRE | Sans | — | Silicone | Bleu | VASCULAIRE, NEURO | VESSEL LOOP |
| 81095633 | SURGICAL LOOP | Sans | 7.5 cm | Coton/Synthétique | Bleu | ORTHO | LACET |

---

## Notes pédagogiques complètes

| Désignation | Usage Pédagogique | Info Technique |
|---|---|---|
| DAFILON 1 | Peau zones tension (Genou/Hanche) | Glisse parfaite, retrait facile (Nylon) |
| DAFILON 2/0 | Suture cutanée standard | Aiguille 1/2 cercle (plus courbe) |
| DAFILON 2/0 (Aig 30mm) | Peau épaisse / Prise large | Aiguille triangulaire tranchante |
| DAFILON 3/0 (Aig 16mm) | Peau fine (Main, Pied) | Fil fin mais résistant |
| DAFILON 3/0 (Aig 24mm) | Peau standard | Aiguille moyenne standard |
| ETHILON NOIR 6/0 | Suture esthétique, Visage | Très peu réactionnel, fil "invisible" |
| ETHILON NOIR 9/0 | Microchirurgie, Nerfs | Usage sous microscope uniquement |
| MERSILENE 3 | Cerclage (Col), Ligature solide | Tressé : excellente tenue au nœud |
| MONOCRYL 3/0 | Surjet intradermique (Esthétique) | Résorption rapide (90-120j) |
| MONOSYN 4/0 | Surjet intradermique fin | Très souple, bonne glisse |
| PDS II 3/0 | Plan profond, Fascia, Capsule | Maintien > 6 semaines (Cicatrisation lente) |
| PDS II 4/0 | Suture vasculaire pédiatrique | Monobrin à résorption lente |
| PDS II 5/0 | Micro-suture, Tendon extenseur | Fil fin longue durée |
| POLYSORB 0 | Fermeture paroi musculaire (Adulte) | Tressé enduit (glisse améliorée) |
| POLYSORB 2/0 | Plan musculaire moyen | Résistance mi-temps : 21 jours |
| POLYSORB 4/0 | Sous-cutané fin | Aiguille courte |
| POLYSORB 5/0 | Pédiatrie, Muqueuse | Aiguille ronde (non traumatique) |
| PREMICRON 1 | Ténorraphie (Tendon d'Achille) | Aiguille Droite spécifique tendon |
| PREMICRON 5 | Réinsertion osseuse lourde | Fil très épais, irréversible |
| PROLENE 2/0 | Fixation Drain Redon | Inerte, glisse max, non thrombogène |
| PROLENE 3/0 | Suture cutanée (Surjet) | Pas d'adhérence aux tissus |
| PROLENE 4/0 | Peau fine | Monofilament pur |
| PROLENE 5/0 | Vasculaire, Fistule | Aiguille ronde vasculaire |
| PROLENE 6/0 | Vasculaire distal, Nerf | Extrêmement fin |
| STRATAFIX 1 | Fermeture Aponévrose sans nœud | Barbelé bidirectionnel |
| VICRYL 0 | Standard fermeture Aponévrose | La référence de base du bloc |
| VICRYL 1 | Fermeture Muscle fort (Cuisse) | Plus gros calibre standard |
| VICRYL 2 | Ligature profonde, Tissus mous | Aiguille ronde = ne coupe pas les tissus |
| VICRYL 2 (Aig 48mm) | Fermeture paroi abdominale | Aiguille large pour paroi |
| VICRYL 2/0 | Sous-cutané standard | Tressé standard |
| VICRYL 3/0 | Sous-cutané fin | Résistance 50% à 21 jours |
| VICRYL RAPIDE 3/0 | Peau enfant, Main | Chute des fils J+10 à J+14 |
| VICRYL RAPIDE 4/0 | Phimosis, Muqueuse | Aiguille ronde (trauma minime) |
| LAC VASCULAIRE | Identification (Nerf/Vaisseau) | Élastique, ne traumatise pas le nerf |
| SURGICAL LOOP | Traction franche | Non élastique |

---

## À faire quand le schéma `materiel` sera étendu

```sql
-- Requête de vérification préalable (quand les colonnes existeront)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'materiel'
  AND column_name IN ('ref_fournisseur','aiguille_type','longueur_cm','matiere_famille','structure_type');
-- Si toutes présentes → lancer import depuis ce fichier
```
