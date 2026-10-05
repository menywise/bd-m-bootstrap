# Audit Qualite Migration V5 — Outil L3

Outil createur (L3) pour auditer la conformite de la migration V5 vers DB&M.

**Localisation** : `createur/audit-v5/` (frere de `createur/atelier/` et `createur/conseil/`)
**Couche** : L3 — ne voyage jamais avec une instance vendue
**Persistance** : tables cloud `atelier_audit_v5_runs` et `atelier_audit_v5_run_meta`

---

## 16 familles d audit

| Famille | Theme | Dimensions | Outils |
|---|---|---|---|
| F01 | Structure et chaine chargement | 8 | regex chains CSS/JS |
| F02 | HEAD et metadonnees | 6 | regex meta |
| F03 | Structure app-zone | 6 | parser HTML |
| F04 | Toolbar et filtres | 6 | regex + structure |
| F05 | Modales | 8 | regex + parser |
| F06 | Couleurs et CSS | 7 | regex couleurs |
| F07 | JavaScript et runtime | 9 | regex JS |
| F08 | Console et reseau | 6 | manuel + Puppeteer optionnel |
| F09 | Permissions et roles | 4 | analyse JS + SQL |
| F10 | Anonymisation et RGPD | 4 | grep |
| F11 | SEO et metadonnees publiques | 17 | regex meta + parser |
| F12 | Liens et navigation | 10 | cross-fichier |
| F13 | Conformite Supabase DB-first | 10 | SQL queries |
| F14 | Conformite documentation et doctrine | 10 | doc cross-check |
| F15 | Conformite skills locaux | 8 | trace session |
| F16 | Anti-regression et anti-hallucination | 10 | parser cross-link |

**Total** : ~129 dimensions auditables sur **49 fichiers** (26 modules + 11 site/ + 12 racine).

---

## Doctrine pre-audit (S121)

5 principes cristallises avant lancement audit :

- `CONV-PALETTE-PASTEL-TOTALE-01` : toute l app utilise pastel
- `INTERDIT-COULEUR-SATUREE-01` : couleurs Bootstrap saturees interdites
- `CONV-BRANDING-DBM-01` : DB&M en surface, BDB en code uniquement
- `INTERDIT-BRANDING-BDB-SURFACE-01` : BDB / Bible de Bloc interdits en surface
- `CONV-AUDIT-V5-16-FAMILLES-01` : framework audit 16 familles

---

## Procedure d execution (par tranches)

Audit lance par paires de familles avec **PAUSE entre chaque tranche** + **rappel des criteres de la suivante**.

| Tranche | Familles | Methode |
|---|---|---|
| T1 | F01 + F02 | Auto Python regex |
| T2 | F03 + F04 | Auto Python parser |
| T3 | F05 + F06 | Auto Python + visuel |
| T4 | F07 + F08 | Auto Python + manuel reseau |
| T5 | F09 + F10 | Auto + SQL cross-check |
| T6 | F11 + F12 | Auto Python + cross-fichier |
| T7 | F13 | SQL queries |
| T8 | F14 + F15 | Doctrine cross-check |
| T9 | F16 | Auto Python + manuel |

---

## Politique de correction

| Niveau | Action |
|---|---|
| **P0 trivial** (1-3 lignes) | Correction immediate pendant audit |
| **P0 complexe** (refonte > 5 lignes) | Flag P0-DEFER pour action separee |
| **P1** | Flag uniquement (correction post-audit) |
| **P2-P3** | Flag uniquement (cosmétique, batchable) |

---

## Fichiers cles

- `index.html` : dashboard L3 (visualisation matrice fichier × dimension)
- `audit-v5-app.js` : JS dashboard (charge resultats SQL ou JSON)
- `audit-v5-ui.css` : styles dashboard
- `runner.py` : script Python d audit (a executer en local)
- `runner-rules.json` : regles d audit (1 fichier source de verite, 16 familles)
- `results/` : repertoire historique audits (JSON par run)
- `reports/` : rapports markdown (1 par famille)

---

## Lancement

```bash
# Audit complet 16 familles
cd C:\DEV\BIBLE_DE_BLOC\createur\audit-v5
python runner.py --all

# Audit famille seule
python runner.py --famille F01

# Audit tranche
python runner.py --tranche T1
```

Resultats sauvegardes dans `results/[run-id].json` + remontes en cloud `atelier_audit_v5_runs`.

---

## Mise a jour

Audit reutilisable apres chaque migration majeure. Mise a jour des regles dans `runner-rules.json` quand de nouveaux principes sont cristallises dans `atelier_principes`.

Date creation : 2026-05-06 (session post #117bis).
