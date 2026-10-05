# AUDIT V5 — Rapport Tranche T1 (F01 + F02)

**Run** : 2c446084-11e1-4308-a99a-0ce97d38d309
**Date** : 2026-05-06T21:22:37.621747+00:00
**Total dimensions** : 735

## Statistiques globales T1

| Statut | Nombre |
|---|---|
| OK | 428 |
| KO | 181 |
| NA | 126 |
| SKIP | 0 |

## Violations par criticite

| Criticite | Nombre KO |
|---|---|
| P0 bloquant | 49 |
| P1 majeur | 83 |
| P2 mineur | 0 |
| P3 cosmetique | 49 |

## Famille F01

| Dimension | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F01-D01 | Chaine CSS BLOC E ordre exact | P0 | 13 | **13** | 23 | 0 |
| F01-D02 | Chaine JS BLOC E ordre exact | P0 | 0 | **26** | 23 | 0 |
| F01-D03 | bdb-shell premier enfant de wrapper | P0 | 20 | **6** | 23 | 0 |
| F01-D04 | data-shell-theme=dbm | P1 | 13 | **13** | 23 | 0 |
| F01-D05 | Pas de theme-base.css legacy | P0 | 46 | **3** | 0 | 0 |
| F01-D06 | Pas de cds-overrides.css legacy | P0 | 48 | **1** | 0 | 0 |
| F01-D07 | Pas de @latest sur CDN | P0 | 49 | **0** | 0 | 0 |
| F01-D08 | bdb-pwa.js charge en HEAD | P1 | 31 | **7** | 11 | 0 |

## Famille F02

| Dimension | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F02-D01 | meta charset UTF-8 | P0 | 49 | **0** | 0 | 0 |
| F02-D02 | meta viewport responsive | P0 | 49 | **0** | 0 | 0 |
| F02-D03 | Title contient Des Blocs & Moi | P1 | 36 | **13** | 0 | 0 |
| F02-D04 | Aucun Bible de Bloc en surface | P1 | 48 | **1** | 0 | 0 |
| F02-D05 | Aucun BDB en surface (titres, h1, commentaires vis | P1 | 0 | **49** | 0 | 0 |
| F02-D06 | Bloc :root inline avec 4 variables couleur module | P1 | 26 | **0** | 23 | 0 |
| F02-D07 | Commentaire header surface DBM | P3 | 0 | **49** | 0 | 0 |

## Top fichiers en violation (T1)

| Fichier | Surface | Nb KO | Detail (ref criticite) |
|---|---|---|---|
| modules/disc/index.html | module | 8 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +3 |
| modules/arsenal/index.html | module | 7 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +2 |
| modules/carnet-bord/index.html | module | 7 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +2 |
| modules/interview/index.html | module | 7 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +2 |
| modules/objectifs/index.html | module | 7 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +2 |
| modules/transmissions/index.html | module | 7 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1) ... +2 |
| modules/boite-a-idees/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/medacta-coste/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/planning/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/preferences/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/profile/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/veille-documentaire/index.html | module | 6 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/thesaurus/index.html | module | 6 | F01-D02(P0), F01-D05(P0), F01-D06(P0), F02-D03(P1), F02-D05(P1) ... +1 |
| modules/recueil-situation/index.html | module | 5 | F01-D02(P0), F01-D04(P1), F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| modules/faq/index.html | module | 4 | F01-D01(P0), F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/ged/index.html | module | 4 | F01-D02(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| modules/pedagogie/index.html | module | 4 | F01-D02(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| maintenance.html | racine | 4 | F01-D05(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| session-expiree.html | racine | 4 | F01-D05(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| modules/admin/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/anatomie/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/annuaire/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/cours/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/fiches/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/glossaire/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/installation/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/organisateur/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| modules/supervision/index.html | module | 3 | F01-D02(P0), F02-D05(P1), F02-D07(P3) |
| mentions-legales.html | racine | 3 | F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| politique-confidentialite.html | racine | 3 | F01-D08(P1), F02-D05(P1), F02-D07(P3) |
| site/accessibilite.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/adoption.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/audiences.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/faq.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/fonctionnalites.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/glossaire.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/index.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/instances.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/pas-app.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/risques.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| site/vision.html | site | 2 | F02-D05(P1), F02-D07(P3) |
| 403.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| 404.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| index.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| login.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| offline.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| pending.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| reset-password.html | racine | 2 | F02-D05(P1), F02-D07(P3) |
| unauthorized.html | racine | 2 | F02-D05(P1), F02-D07(P3) |

## Plan correction P0 (bloquant)

**49 violations P0** detectees.

| Fichier | Dimension | Detail |
|---|---|---|
| modules/arsenal/index.html | F01-D01 | {} |
| modules/boite-a-idees/index.html | F01-D01 | {} |
| modules/carnet-bord/index.html | F01-D01 | {} |
| modules/disc/index.html | F01-D01 | {} |
| modules/faq/index.html | F01-D01 | {} |
| modules/interview/index.html | F01-D01 | {} |
| modules/medacta-coste/index.html | F01-D01 | {} |
| modules/objectifs/index.html | F01-D01 | {} |
| modules/planning/index.html | F01-D01 | {} |
| modules/preferences/index.html | F01-D01 | {} |
| modules/profile/index.html | F01-D01 | {} |
| modules/transmissions/index.html | F01-D01 | {} |
| modules/veille-documentaire/index.html | F01-D01 | {} |
| modules/admin/index.html | F01-D02 | {} |
| modules/anatomie/index.html | F01-D02 | {} |
| modules/annuaire/index.html | F01-D02 | {} |
| modules/arsenal/index.html | F01-D02 | {} |
| modules/boite-a-idees/index.html | F01-D02 | {} |
| modules/carnet-bord/index.html | F01-D02 | {} |
| modules/cours/index.html | F01-D02 | {} |
| modules/disc/index.html | F01-D02 | {} |
| modules/faq/index.html | F01-D02 | {} |
| modules/fiches/index.html | F01-D02 | {} |
| modules/ged/index.html | F01-D02 | {} |
| modules/glossaire/index.html | F01-D02 | {} |
| modules/installation/index.html | F01-D02 | {} |
| modules/interview/index.html | F01-D02 | {} |
| modules/medacta-coste/index.html | F01-D02 | {} |
| modules/objectifs/index.html | F01-D02 | {} |
| modules/organisateur/index.html | F01-D02 | {} |

## Synthese T1

Le scope T1 audite les fondamentaux structurels de chaque page : chaine de chargement CSS/JS et metadonnees du HEAD. 

**Constats principaux** :

- 13 modules migres en version minimale (chaine CSS DBM uniquement) ont des violations attendues sur F01 (chaine JS incomplete) et F02 (title encore non DB&M).
- Tous les fichiers ont la dimension F02-D05 en KO car le pattern de detection BDB en surface est tres strict (commentaire HTML inclus).
- Les fichiers racine et site/ ont generalement F01 conforme grace a la migration deja effectuee.

**Actions recommandees apres pause** :

1. P0 prioritaires : rétablir chaine JS sur les 13 modules migres minimal (F01-D02)
2. P1 majeurs : harmoniser titles vers DB&M sur les 13 modules + 4 racine restants (F02-D03)
3. Affiner regex F02-D05 pour exclure les variables/classes BDB legitimes