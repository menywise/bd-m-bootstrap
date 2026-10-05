# CTX_GED — Contexte module GED
```
VERSION   : 1.0.2
DATE      : 2026-03-21
AUTEUR    : Manu + Claude
STATUT    : MODULE BDB À CRÉER — aucun fichier source existant — 5 questions ouvertes
SOURCE    : Description Manu (2026-03-15) — aucun fichier auditable
  Ajout TRACKER_* + BLOC 0 — mise à niveau TEMPLATE V1.2.0.
  BLOC 7 : SESSION_STATE.md ajouté comme fichier prioritaire d'ouverture.

```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

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

## atelier_principes — STATUT ACTUEL

Le module `ged/` est listé dans atelier_principes (Canon V1.0.5) comme BRIQUE SUIVANTE.

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
