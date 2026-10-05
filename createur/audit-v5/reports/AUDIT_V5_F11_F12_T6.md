# AUDIT V5 — Rapport Tranche T6 (F11 + F12)

**Run** : a5fd9c44-6f57-4046-b4f9-a3ed0579bb6e
**Date** : 2026-05-06T21:25:12.774465+00:00

| Total | OK | KO | NA | SKIP | P0 | P1 |
|---|---|---|---|---|---|---|
| 1323 | 541 | 128 | 360 | 294 | 1 | 30 |

## Famille F11

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F11-D01 | meta description (155 char max, persona-targeted) | P2 | 0 | **37** | 12 | 0 |
| F11-D02 | meta keywords pertinents (sans bourrage) | P3 | 0 | **11** | 38 | 0 |
| F11-D03 | meta robots (noindex sur modules auth) | P1 | 0 | **26** | 23 | 0 |
| F11-D04 | Open Graph tags (og:title, og:description, og:imag | P2 | 0 | **11** | 38 | 0 |
| F11-D05 | Twitter card tags | P3 | 0 | **11** | 38 | 0 |
| F11-D06 | Structured data JSON-LD (Article, Organization, FA | P3 | 0 | **11** | 38 | 0 |
| F11-D07 | Canonical URL | P2 | 0 | **11** | 38 | 0 |
| F11-D08 | Lang attribute correct (lang=fr) | P1 | 49 | **0** | 0 | 0 |
| F11-D09 | Title unique par page (pas de doublon) | P1 | 0 | **0** | 0 | 49 |
| F11-D10 | h1 unique par page | P2 | 48 | **1** | 0 | 0 |
| F11-D11 | Hierarchie h1 -> h2 -> h3 sans saut | P2 | 0 | **0** | 0 | 49 |
| F11-D12 | Alt text sur toutes les images | P2 | 49 | **0** | 0 | 0 |
| F11-D13 | Modules mode demo (glossaire/faq/cours/anatomie) o | P2 | 0 | **4** | 45 | 0 |
| F11-D14 | Modules demo : title format SEO bloc | P2 | 4 | **0** | 45 | 0 |
| F11-D15 | Modules demo : structured data Article/CourseEduca | P3 | 0 | **0** | 0 | 49 |
| F11-D16 | Modules demo : og:image cible (avatar persona) | P3 | 0 | **0** | 0 | 49 |
| F11-D17 | Modules demo : robots index,follow autorise | P1 | 0 | **4** | 45 | 0 |

## Famille F12

| Dim | Titre | Crit | OK | KO | NA | SKIP |
|---|---|---|---|---|---|---|
| F12-D01 | Tous les liens internes resolvent (filesystem) | P0 | 48 | **1** | 0 | 0 |
| F12-D02 | Pas de chemins absolus /bdb/... (cassent en local) | P1 | 49 | **0** | 0 | 0 |
| F12-D03 | Pas de chemins absolus /dbm/... non plus | P1 | 49 | **0** | 0 | 0 |
| F12-D04 | Aucun http:// (force https://) | P1 | 49 | **0** | 0 | 0 |
| F12-D05 | Liens externes ouvrent target=_blank rel=noopener | P2 | 49 | **0** | 0 | 0 |
| F12-D06 | Aucune URL ancien projet (lebloc.fr/bdb/) hardcode | P1 | 49 | **0** | 0 | 0 |
| F12-D07 | Redirections JS valides | P1 | 49 | **0** | 0 | 0 |
| F12-D08 | Email mailto valides | P3 | 49 | **0** | 0 | 0 |
| F12-D09 | Pas de liens morts vers fichiers supprimes | P0 | 0 | **0** | 0 | 49 |
| F12-D10 | Manifest PWA reference les bonnes routes | P1 | 0 | **0** | 0 | 49 |

## Top fichiers en violation T6
| Fichier | Nb KO | Detail |
|---|---|---|
| site/accessibilite.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/adoption.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/audiences.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/faq.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/fonctionnalites.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/glossaire.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/index.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/instances.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/pas-app.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/risques.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| site/vision.html | 6 | F11-D01(P2), F11-D02(P3), F11-D04(P2), F11-D05(P3), F11-D06(P3), F11-D07(P2) |
| modules/anatomie/index.html | 4 | F11-D01(P2), F11-D03(P1), F11-D13(P2), F11-D17(P1) |
| modules/cours/index.html | 4 | F11-D01(P2), F11-D03(P1), F11-D13(P2), F11-D17(P1) |
| modules/faq/index.html | 4 | F11-D01(P2), F11-D03(P1), F11-D13(P2), F11-D17(P1) |
| modules/glossaire/index.html | 4 | F11-D01(P2), F11-D03(P1), F11-D13(P2), F11-D17(P1) |
| modules/disc/index.html | 3 | F11-D01(P2), F11-D03(P1), F11-D10(P2) |
| modules/admin/index.html | 2 | F11-D01(P2), F11-D03(P1) |
| modules/annuaire/index.html | 2 | F11-D01(P2), F11-D03(P1) |
| modules/arsenal/index.html | 2 | F11-D01(P2), F11-D03(P1) |
| modules/boite-a-idees/index.html | 2 | F11-D01(P2), F11-D03(P1) |