# AUDIT V5 — Rapport Tranche T2 (F03 + F04)

**Run** : 9d5c12e1-073d-4f5f-8c97-3e134b22c45a
**Date** : 2026-05-06T21:23:31.014869+00:00
**Total** : 588

## Statistiques T2

| Statut | Nombre |
|---|---|
| OK | 129 |
| KO | 95 |
| NA | 289 |
| SKIP | 75 |

**P0** : 0 | **P1** : 72 | **P2** : 23 | **P3** : 0

## Famille F03

| Dimension | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F03-D01 | Ordre Breadcrumb -> Page Title -> Filters -> Conte | P1 | 13 | **13** | 23 | 0 |
| F03-D02 | Chaque zone enveloppee dans section.app-zone | P1 | 13 | **13** | 23 | 0 |
| F03-D03 | Bandeau Page Title pattern p-4 + linear-gradient | P1 | 13 | **13** | 23 | 0 |
| F03-D04 | data-module-color sur app-content + style inline 4 | P1 | 12 | **14** | 23 | 0 |
| F03-D05 | Footer hors app-content | P2 | 25 | **0** | 24 | 0 |
| F03-D06 | Modales hors wrapper (portal BS5) | P1 | 14 | **3** | 32 | 0 |

## Famille F04

| Dimension | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F04-D01 | Pattern input-group flex-grow + icone bi-search | P1 | 10 | **16** | 23 | 0 |
| F04-D02 | Selects largeur fixe 180px | P2 | 3 | **14** | 32 | 0 |
| F04-D03 | CTA principal largeur fixe 180px en btn-module | P2 | 17 | **9** | 23 | 0 |
| F04-D04 | btn-sm + form-control-sm + form-select-sm partout | P2 | 0 | **0** | 23 | 26 |
| F04-D05 | Slot admin avec d-none par defaut | P1 | 9 | **0** | 40 | 0 |
| F04-D06 | Toolbar responsive < 768px (stacking) | P3 | 0 | **0** | 0 | 49 |

## Top fichiers en violation T2

| Fichier | Nb KO | Dimensions |
|---|---|---|
| modules/boite-a-idees/index.html | 7 | F03-D01, F03-D02, F03-D03, F03-D04, F03-D06, F04-D01, F04-D02 |
| modules/carnet-bord/index.html | 7 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D02, F04-D03 |
| modules/objectifs/index.html | 7 | F03-D01, F03-D02, F03-D03, F03-D04, F03-D06, F04-D01, F04-D02 |
| modules/profile/index.html | 7 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D02, F04-D03 |
| modules/disc/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D02 |
| modules/interview/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D03 |
| modules/medacta-coste/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D02 |
| modules/planning/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D03 |
| modules/recueil-situation/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D03 |
| modules/veille-documentaire/index.html | 6 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D01, F04-D02 |
| modules/arsenal/index.html | 5 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D02 |
| modules/preferences/index.html | 5 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D02 |
| modules/transmissions/index.html | 5 | F03-D01, F03-D02, F03-D03, F03-D04, F04-D02 |
| modules/thesaurus/index.html | 2 | F03-D06, F04-D02 |
| modules/admin/index.html | 2 | F04-D01, F04-D03 |

## Synthese T2

Le scope T2 audite la structure visuelle des modules (app-zone) et le pattern de toolbar.

**Constats** :
- Les 13 modules migrés minimal n ont pas la structure app-zone (KO sur F03-D01 a D04).
- Les 13 modules migrés v5 complets (glossaire, anatomie, fiches...) sont conformes F03 majoritairement.
- Pattern toolbar (F04) suivi sur les modules ayant filtres (glossaire, fiches, thesaurus).

**Aucun P0 bloquant T2** : F03+F04 sont des dimensions de coherence visuelle, pas de blocage technique.