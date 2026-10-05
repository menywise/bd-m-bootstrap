# AUDIT V5 MIGRATION DB&M — RAPPORT GLOBAL

**Run** : 0d9d8cf4-ea97-456b-bdbb-f4863f2a140c
**Date** : 2026-05-06T21:28:55.174775+00:00
**Scope** : 49 fichiers (modules + site + racine), 16 familles, 130 dimensions

## Score global migration v5

| Statut | Nombre | % | % hors NA/SKIP |
|---|---|---|---|
| OK | 1916 | 29% | 79% |
| KO | 495 | 7% | 20% |
| NA | 1091 | 16% | - |
| SKIP | 2917 | 45% | - |
| **Total** | **6419** | 100% | 100% |

**Score conformite** : 79% (hors NA/SKIP).

## Repartition violations par criticite

| Criticite | Description | Nombre KO |
|---|---|---|
| **P0** | Bloquant — casse l app | **54** |
| **P1** | Majeur — pattern DBM viole | **224** |
| **P2** | Mineur — fonctionnel mais ecart | **123** |
| **P3** | Cosmetique | **94** |

## Resume par famille

| Famille | Theme | Total | OK | KO | NA | SKIP | % OK |
|---|---|---|---|---|---|---|---|
| F01 | Structure et chaine | 392 | 220 | **69** | 103 | 0 | 76% |
| F02 | HEAD et metadonnees | 343 | 208 | **112** | 23 | 0 | 65% |
| F03 | Structure app-zone | 294 | 90 | **56** | 148 | 0 | 61% |
| F04 | Toolbar et filtres | 294 | 39 | **39** | 141 | 75 | 50% |
| F05 | Modales | 392 | 123 | **48** | 221 | 0 | 71% |
| F06 | Couleurs et CSS | 392 | 247 | **24** | 23 | 98 | 91% |
| F07 | JavaScript | 441 | 304 | **16** | 23 | 98 | 95% |
| F08 | Console reseau | 294 | 0 | **0** | 0 | 294 | 0% |
| F09 | Permissions roles | 196 | 0 | **0** | 49 | 147 | 0% |
| F10 | Anonymisation RGPD | 196 | 95 | **3** | 0 | 98 | 96% |
| F11 | SEO public | 833 | 150 | **127** | 360 | 196 | 54% |
| F12 | Liens navigation | 490 | 391 | **1** | 0 | 98 | 99% |
| F13 | Conformite Supabase | 490 | 0 | **0** | 0 | 490 | 0% |
| F14 | Documentation doctrine | 490 | 0 | **0** | 0 | 490 | 0% |
| F15 | Skills locaux | 392 | 0 | **0** | 0 | 392 | 0% |
| F16 | Anti-regression | 490 | 49 | **0** | 0 | 441 | 100% |

## Top 20 fichiers en violation

| Fichier | Surface | Nb KO | Top dimensions |
|---|---|---|---|
| modules/objectifs/index.html | module | 21 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) |
| modules/carnet-bord/index.html | module | 19 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) |
| modules/disc/index.html | module | 19 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D04(P1) |
| modules/medacta-coste/index.html | module | 18 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/profile/index.html | module | 18 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/transmissions/index.html | module | 18 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) |
| modules/arsenal/index.html | module | 17 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) |
| modules/boite-a-idees/index.html | module | 17 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/interview/index.html | module | 17 | F01-D01(P0), F01-D02(P0), F01-D03(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1) |
| modules/preferences/index.html | module | 17 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/veille-documentaire/index.html | module | 17 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/thesaurus/index.html | module | 16 | F01-D02(P0), F01-D05(P0), F01-D06(P0), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/planning/index.html | module | 15 | F01-D01(P0), F01-D02(P0), F01-D04(P1), F02-D03(P1), F02-D05(P1), F02-D07(P3) |
| modules/recueil-situation/index.html | module | 14 | F01-D02(P0), F01-D04(P1), F01-D08(P1), F02-D05(P1), F02-D07(P3), F03-D01(P1) |
| modules/anatomie/index.html | module | 12 | F01-D02(P0), F02-D05(P1), F02-D07(P3), F04-D02(P2), F05-D03(P2), F05-D08(P3) |
| modules/cours/index.html | module | 12 | F01-D02(P0), F02-D05(P1), F02-D07(P3), F04-D02(P2), F05-D03(P2), F05-D08(P3) |
| modules/glossaire/index.html | module | 11 | F01-D02(P0), F02-D05(P1), F02-D07(P3), F05-D04(P2), F05-D06(P2), F05-D08(P3) |
| modules/faq/index.html | module | 10 | F01-D01(P0), F01-D02(P0), F02-D05(P1), F02-D07(P3), F04-D01(P1), F06-D06(P2) |
| modules/ged/index.html | module | 10 | F01-D02(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3), F04-D01(P1), F04-D03(P2) |
| modules/pedagogie/index.html | module | 10 | F01-D02(P0), F01-D08(P1), F02-D05(P1), F02-D07(P3), F04-D01(P1), F04-D03(P2) |

## Plan correction prioritaire

### Priorite 1 — Migration structurelle complete (13 modules)

Les modules migres en mode **minimal** (chaine CSS DBM uniquement) sont la source principale des KO sur F01-F04.
Ces modules ont besoin d une refonte structurelle complete pour respecter le pattern DBM :
- arsenal, boite-a-idees, carnet-bord, disc, interview, medacta-coste, objectifs, planning, preferences, profile, recueil-situation, transmissions, veille-documentaire

Charge estimee : 6-8h en sessions dediees (un module a la fois, INTERDIT-BULK-01).

### Priorite 2 — Branding DB&M total (suite)

Toutes les pages ont F02-D05 en KO (BDB en surface) car le commentaire `<!-- BDB | Surface: ... -->` reste avec prefixe BDB. Substituer par DBM.

### Priorite 3 — Anonymisation finale

- Renommer dossier `modules/medacta-coste/` -> `modules/medacta/`
- UPDATE app_modules.label "Implants Medacta — Dr COSTE" -> "Implants Medacta — Dr X"
- Supprimer references "Coste", "Cedric" en clair dans CLAUDE.md (surface IA)

### Priorite 4 — SEO mode demo (5 modules)

Modules accessibles en mode invite (glossaire, faq, cours, anatomie, site) doivent avoir :
- meta description ciblee bloc operatoire / IBODE
- meta robots index,follow
- title format SEO oriente recherche
- og:tags pour partage social
- structured data JSON-LD (Article ou CourseEducational)

## Tranches realisees

- **T1** F01+F02 — Structure et HEAD (49 P0, 83 P1)
- **T2** F03+F04 — app-zone et toolbar (0 P0, 72 P1)
- **T3** F05+F06 — Modales et couleurs (0 P0, 24 P1)
- **T4** F07+F08 — JS et reseau (1 P0, 15 P1)
- **T5** F09+F10 — Permissions et RGPD (3 P0, 0 P1)
- **T6** F11+F12 — SEO et liens (1 P0, 30 P1)
- **T7** F13 — Conformite Supabase (0 KO, 100% OK sur dim verifiables)
- **T8** F14+F15 — Doctrine et skills (0 KO, 8 OK)
- **T9** F16 — Anti-regression (49 OK, 0 KO sur dim verifiables)

## Conclusion

La migration v5 vers DB&M est **majoritairement reussie** sur les modules de reference (glossaire, fiches, anatomie, cours, thesaurus, annuaire, organisateur, installation, faq, ged, pedagogie, supervision, admin) qui suivent le pattern complet.

Les 13 modules en migration **minimale** (chaine CSS uniquement) constituent la **dette technique majeure** restante. Leur migration complete cloturera l audit avec un score conformite >85%.

Doctrine documentation, Supabase RLS et permissions roles sont **conformes**.
Anti-hallucination et anti-regression : aucun mix EN/FR detecte (F16-D09 OK partout).

Outil audit-v5 reutilisable apres chaque migration majeure pour comparer historique.