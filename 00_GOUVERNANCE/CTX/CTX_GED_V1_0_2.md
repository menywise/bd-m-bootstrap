# CTX_GED — Contexte module GED
```
VERSION   : 1.0.2
DATE      : 2026-03-21
AUTEUR    : Manu + Claude
STATUT    : MODULE BDB À CRÉER — aucun fichier source existant — 5 questions ouvertes
NOYAU_REF : NOYAU_VERITE_V2_4_0
SOURCE    : Description Manu (2026-03-15) — aucun fichier auditable
DELTA v1.0.1 → v1.0.2 :
  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
  BLOC 7 : SESSION_STATE.md ajouté comme fichier prioritaire d'ouverture.

TRACKER_STATUS     : embryo
TRACKER_SHELL      : non
TRACKER_PALIER     : 0
TRACKER_VIOLATIONS : questions-ouvertes-Q1-Q5-non-arbitrées
TRACKER_UPDATED    : 2026-03-21
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRÈS NOYAU_VERITE et JOURNAL_DECISIONS.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## BLOC 0 — ÉTAT COURANT (mis à jour à chaque session)

```
DERNIÈRE SESSION : 2026-03-21
FAIT             : Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
RESTE À FAIRE    : Arbitrage Q1 → Q5 par Manu (session dédiée — BLOQUANT)
                   Aucun fichier HTML ou SQL avant Q1 et Q2 minimum répondus.
                   Après arbitrages : schéma Supabase + création depuis TEMPLATE_MODULE_BDB.html
VIOLATIONS ACTIVES :
  ⚠ questions-ouvertes-Q1-Q5 : 5 arbitrages requis avant toute création.
     Q1 — Hébergement documents : Supabase Storage ou URL externe ?
     Q2 — Qui peut déposer ? Admin uniquement ou tout membre ?
     Q3 — Catégorisation : par type, discipline ou les deux ?
     Q4 — Recherche : full-text titres/descriptions ou contenu PDF ?
     Q5 — Liens modules existants (arsenal, transmissions) ?
  ⚠ Format CTX pré-template V1.2.0 — structure BLOC 1-9 non encore appliquée.
     À migrer après arbitrages Q1-Q5 lors de la session de création.
VIOLATIONS RÉSOLUES :
  Aucune à ce stade.
```

---

## RÔLE

Gestion Électronique de Documents (GED) du bloc opératoire.

Permet de **savoir où sont les documents** et de **les trouver en permanence**.

Documents concernés (liste déclarée par Manu) :
- Fichiers tiers
- Modes d'emploi (matériel, équipements)
- Comptes rendus
- Tout document institutionnel ou opérationnel lié au bloc

---

## CE QUI EST CONNU

Uniquement la description fonctionnelle de Manu. Aucun fichier source à auditer.

### Besoin central
Localisation et accès rapide aux documents. Pas de création de documents dans BDB — consultation et référencement.

### Relation avec le module cours/
GED ≠ cours. Les cours contiennent des contenus pédagogiques structurés (protocoles, fiches intervention). La GED référence des documents institutionnels tiers (PDFs, fichiers externes).

---

## QUESTIONS OUVERTES — ARBITRAGE MANU REQUIS

```
⚠ Aucune création (HTML ou SQL) avant Q1 et Q2 minimum répondus.

Q1 — Les documents sont-ils hébergés dans Supabase Storage ou référencés par URL externe ?
     Option A : upload dans Supabase Storage → accès depuis BDB
     Option B : URL externe (intranet hôpital, serveur partagé) → BDB = index uniquement

Q2 — Qui peut déposer des documents ? Admin uniquement ou tout membre ?

Q3 — Catégorisation : par type (mode d'emploi, CR, protocole...) ou par discipline ou les deux ?

Q4 — Recherche full-text sur les titres/descriptions ou sur le contenu des PDF ?

Q5 — Lien avec modules existants ?
     Ex : un mode d'emploi d'instrument → lié à arsenal/ ?
     Un CR de réunion → lié à transmissions/ ?
```

---

## STACK CIBLE

Supabase.

Table minimale attendue : `ged_documents` (titre, type, url/storage_path, description, catégorie, auteur_id, created_at).

Schéma à définir après arbitrage Q1→Q5.

---

## NOYAU_VERITE — STATUT ACTUEL

Le module `ged/` est listé dans NOYAU_VERITE BLOC 6 comme BRIQUE SUIVANTE.

**Note :** la classification "statique" était provisoire avant que le périmètre soit défini.
Un module de GED avec upload et recherche nécessite Supabase.
À reconfirmer avec Manu après arbitrage Q1→Q5.

---

## AUTORISÉ

- Préparer le schéma Supabase une fois Q1→Q5 arbitrés
- Créer depuis TEMPLATE_MODULE_BDB.html v2.0.1 (GUIDE_INTEGRATION_MODULE_V1_0_1)

## INTERDIT

- Créer le moindre fichier HTML ou SQL sans réponse à Q1 et Q2 minimum
- Fusionner GED et cours/ — deux responsabilités distinctes
- Qualifier ce module de "statique" sans arbitrage Q1

---

## BLOC 7 — CHECKLIST D'OUVERTURE DE SESSION

```
MODULE EN COURS     : ged
OBJECTIF SESSION    : [arbitrage Q1-Q5 OU création post-arbitrage]
FICHIERS IN SCOPE   : à définir après arbitrages
FICHIERS HORS SCOPE : tous les modules existants

Fichiers à charger :
  [ ] SESSION_STATE.md  ← généré par BDB Tracker — charger EN PREMIER
  [ ] Ce fichier CTX_GED v1.0.2

Si SESSION_STATE.md absent → charger dans l'ordre :
  [ ] NOYAU_VERITE_V2_4_0.md
  [ ] JOURNAL_DECISIONS (dernière version)
  [ ] Ce fichier CTX_GED v1.0.2

⚠ Si Q1-Q5 non arbitrés → session limitée à la collecte des arbitrages.
  Ne pas créer de fichier sans validation Manu.
```

---

## HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-03-15 | 1.0.0 | Création depuis description Manu. Aucun fichier source. 5 questions ouvertes. |
| 2026-03-16 | 1.0.1 | NOYAU_REF V2_4_0. MODULE_DEPENDENCY_MAP_V1_2_0. Template v2.0.1. |
| 2026-03-21 | 1.0.2 | Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0. BLOC 7 SESSION_STATE.md. |
