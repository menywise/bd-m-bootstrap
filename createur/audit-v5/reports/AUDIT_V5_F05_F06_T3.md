# AUDIT V5 — Rapport Tranche T3 (F05 + F06)

**Run** : 06f245d7-51b7-4c95-bd36-dc6236b08298
**Date** : 2026-05-06T21:24:12.685337+00:00

## Stats T3
| Statut | Nombre |
|---|---|
| OK | 370 | KO | 72 | NA | 244 | SKIP | 98 |
| Total | 784 |

**P0** : 0 | **P1** : 24 | **P2** : 36 | **P3** : 12

## Famille F05

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F05-D01 | modal-header-module sur toutes (hors lightbox bg-d | P1 | 17 | **0** | 32 | 0 |
| F05-D02 | modal-dialog-centered + modal-dialog-scrollable | P2 | 9 | **8** | 32 | 0 |
| F05-D03 | Largeur uniforme par module (modal-lg standard) | P2 | 13 | **4** | 32 | 0 |
| F05-D04 | Titre judicieux dans chaque modale | P2 | 15 | **2** | 32 | 0 |
| F05-D05 | btn-module sur CTA (jamais btn-primary) | P1 | 33 | **16** | 0 | 0 |
| F05-D06 | aria-labelledby + aria-hidden=true | P2 | 11 | **6** | 32 | 0 |
| F05-D07 | tabindex=-1 sur modales | P2 | 17 | **0** | 32 | 0 |
| F05-D08 | btn-close avec aria-label=Fermer | P3 | 8 | **12** | 29 | 0 |

## Famille F06

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F06-D01 | Aucun hex hardcode (#0d6efd, #198754, etc.) | P1 | 45 | **4** | 0 | 0 |
| F06-D02 | Variables --module-color* utilisees | P1 | 26 | **0** | 23 | 0 |
| F06-D03 | Aucun btn-danger hors signaux destruction/erreur | P1 | 48 | **1** | 0 | 0 |
| F06-D04 | Aucun btn-warning ou btn-info comme CTA module | P1 | 46 | **3** | 0 | 0 |
| F06-D05 | Toasts gardent status semantique universel | P1 | 0 | **0** | 0 | 49 |
| F06-D06 | Aucun style inline color/background hex hors gradi | P2 | 35 | **14** | 0 | 0 |
| F06-D07 | Aucune classe legacy cds-error-* / bdb-module-head | P2 | 47 | **2** | 0 | 0 |
| F06-D08 | Palette pastel totale (CONV-PALETTE-PASTEL-TOTALE- | P1 | 0 | **0** | 0 | 49 |

## Top fichiers en violation T3
| Fichier | Nb KO | Detail |
|---|---|---|
| modules/thesaurus/index.html | 6 | F05-D04(P2), F05-D06(P2), F05-D08(P3), F06-D01(P1), F06-D04(P1), F06-D06(P2) |
| modules/objectifs/index.html | 4 | F05-D02(P2), F05-D06(P2), F05-D08(P3), F06-D01(P1) |
| modules/glossaire/index.html | 4 | F05-D04(P2), F05-D06(P2), F05-D08(P3), F06-D06(P2) |
| modules/carnet-bord/index.html | 3 | F05-D02(P2), F06-D01(P1), F06-D03(P1) |
| modules/preferences/index.html | 3 | F05-D02(P2), F05-D06(P2), F05-D08(P3) |
| modules/transmissions/index.html | 3 | F05-D02(P2), F05-D06(P2), F05-D08(P3) |
| modules/veille-documentaire/index.html | 3 | F05-D02(P2), F05-D06(P2), F05-D08(P3) |
| modules/anatomie/index.html | 3 | F05-D03(P2), F05-D08(P3), F06-D06(P2) |
| modules/cours/index.html | 3 | F05-D03(P2), F05-D08(P3), F06-D06(P2) |
| modules/installation/index.html | 3 | F05-D03(P2), F05-D08(P3), F06-D06(P2) |
| modules/arsenal/index.html | 2 | F05-D02(P2), F06-D04(P1) |
| modules/boite-a-idees/index.html | 2 | F05-D02(P2), F05-D03(P2) |
| modules/disc/index.html | 2 | F05-D05(P1), F05-D08(P3) |
| modules/organisateur/index.html | 2 | F05-D05(P1), F06-D06(P2) |
| modules/profile/index.html | 2 | F05-D05(P1), F06-D04(P1) |
