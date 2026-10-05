# AUDIT V5 — Rapport Tranche T5 (F09 + F10)

**Run** : 81cc74a7-8d69-4aa9-89a7-3d7d06289288
**Date** : 2026-05-06T21:24:56.341507+00:00

| Total | OK | KO | NA | SKIP | P0 | P1 |
|---|---|---|---|---|---|---|
| 392 | 95 | 3 | 49 | 245 | 3 | 0 |

## Famille F09

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F09-D01 | CTA principal bascule selon role | P1 | 0 | **0** | 0 | 49 |
| F09-D02 | window.bdbUser.permissions[mod] charge au login | P1 | 0 | **0** | 49 | 0 |
| F09-D03 | Modales edition reservees admin/redacteur publish= | P1 | 0 | **0** | 0 | 49 |
| F09-D04 | Modales proposition pour membre + redacteur publis | P1 | 0 | **0** | 0 | 49 |

## Famille F10

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F10-D01 | Aucun nom reel en surface non operationnelle (INTE | P0-RGPD | 47 | **2** | 0 | 0 |
| F10-D02 | app_modules.label anonymise (INTERDIT-PERSO-02) | P0-RGPD | 0 | **0** | 0 | 49 |
| F10-D03 | Vrais noms autorises uniquement L1/L2 connectes | P0-RGPD | 0 | **0** | 0 | 49 |
| F10-D04 | Aucun nom dossier filesystem (medacta-coste, etc.) | P0-RGPD | 48 | **1** | 0 | 0 |

## Top fichiers en violation T5
| Fichier | Nb KO | Detail |
|---|---|---|
| modules/medacta-coste/index.html | 2 | F10-D01(P0-RGPD), F10-D04(P0-RGPD) |
| modules/preferences/index.html | 1 | F10-D01(P0-RGPD) |