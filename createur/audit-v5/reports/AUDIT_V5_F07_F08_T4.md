# AUDIT V5 — Rapport Tranche T4 (F07 + F08)

**Run** : 53ee910a-6108-42ce-bc86-cfa686e3e123
**Date** : 2026-05-06T21:24:37.622297+00:00

| Total | OK | KO | NA | SKIP | P0 | P1 |
|---|---|---|---|---|---|---|
| 735 | 304 | 16 | 23 | 392 | 1 | 15 |

## Famille F07

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F07-D01 | Aucun console.log en prod (INTERDIT-D6) | P1 | 49 | **0** | 0 | 0 |
| F07-D02 | escHtml() obligatoire sur innerHTML avec donnee DB | P0 | 0 | **0** | 0 | 49 |
| F07-D03 | 3 etats async loading/empty/error (C.9) | P1 | 11 | **15** | 23 | 0 |
| F07-D04 | cdsShowGridError() utilise sur erreurs fetch | P2 | 0 | **0** | 0 | 49 |
| F07-D05 | Aucun initAuth() local (INTERDIT-B3) | P0 | 49 | **0** | 0 | 0 |
| F07-D06 | Aucune redefinition window.bdb (INTERDIT-A3) | P0 | 48 | **1** | 0 | 0 |
| F07-D07 | Comparaison role en FR : membre pas member (INTERD | P1 | 49 | **0** | 0 | 0 |
| F07-D08 | Aucun localStorage role/admin (INTERDIT-B2) | P0 | 49 | **0** | 0 | 0 |
| F07-D09 | Aucun credential hors supabase-client.js (INTERDIT | P0 | 49 | **0** | 0 | 0 |

## Famille F08

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F08-D01 | Aucune erreur 4xx / 5xx au chargement | P0 | 0 | **0** | 0 | 49 |
| F08-D02 | Aucune erreur JS console au chargement | P0 | 0 | **0** | 0 | 49 |
| F08-D03 | Aucun warning aria-hidden focus (a11y BS5) | P2 | 0 | **0** | 0 | 49 |
| F08-D04 | Aucun warning CORS / RLS 401-403 | P0 | 0 | **0** | 0 | 49 |
| F08-D05 | Tous les fetch finissent en succes (200) | P1 | 0 | **0** | 0 | 49 |
| F08-D06 | Aucune ressource bloquee (CSP, mixed content) | P1 | 0 | **0** | 0 | 49 |

## Top fichiers en violation T4
| Fichier | Nb KO | Detail |
|---|---|---|
| modules/admin/index.html | 1 | F07-D03(P1) |
| modules/anatomie/index.html | 1 | F07-D03(P1) |
| modules/annuaire/index.html | 1 | F07-D03(P1) |
| modules/arsenal/index.html | 1 | F07-D03(P1) |
| modules/cours/index.html | 1 | F07-D03(P1) |
| modules/ged/index.html | 1 | F07-D03(P1) |
| modules/interview/index.html | 1 | F07-D03(P1) |
| modules/medacta-coste/index.html | 1 | F07-D03(P1) |
| modules/objectifs/index.html | 1 | F07-D03(P1) |
| modules/pedagogie/index.html | 1 | F07-D03(P1) |
| modules/planning/index.html | 1 | F07-D03(P1) |
| modules/profile/index.html | 1 | F07-D03(P1) |
| modules/recueil-situation/index.html | 1 | F07-D03(P1) |
| modules/supervision/index.html | 1 | F07-D03(P1) |
| modules/transmissions/index.html | 1 | F07-D03(P1) |