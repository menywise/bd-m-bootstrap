# CTX_PEDAGOGIE — Contexte module Pédagogie
```
VERSION   : 1.2.2
DATE      : 2026-03-21
AUTEUR    : Manu + Claude
STATUT    : MODULE BDB EMBRYONNAIRE — intégration BDB admin (option B validée)
DELTA     : v1.2.1 → v1.2.2
            Ajout TRACKER_* + BLOC 0 — TEMPLATE V1.2.0.
            Précision PRÉREQUIS SESSION B : bdb-shell v1.4.0 = navigation dynamique app_modules obligatoire.
```

> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.
> Un champ TRACKER_* non mis à jour = écart documenté dans SESSION_STATE.md.

---

## RÔLE

Outil de construction de prompts IA enrichis ("Prompt Factory v4.3").

---

## CE QUI EST VÉRIFIABLE (HTML seul — les 15 assets JS sont absents)

### Structure UI présente dans le HTML

- 3 modes : Auto / Guidé / Expert
- Panel gauche : intention, presets, DISC cible, sélection IA
- Panel droit : prévisualisation prompt enrichi + stats
- Panel historique latéral (25 entrées)
- Modal Settings : tabs Presets / Experts / Types tâche / DISC Keywords / onglet Import-Export
- Modal Orders : gestion mini-ordres

### Fonctionnalités dont la logique est inconnue

Les 15 fichiers JS sont absents du zip d'audit (`../assets/js/*.js`).
Toute description de comportement fonctionnel serait une hallucination.

```
INCONNU : logique de détection DISC
INCONNU : moteur d'enrichissement du prompt
INCONNU : persistance des données (stack réelle)
INCONNU : implémentation Export/Import
INCONNU : logique CRUD référentiels
```

**Règle : ne pas documenter ce qui est inconnu. Ne pas l'inventer.**

---

## STACK CIBLE (option B)

Supabase — aligné sur l'architecture BDB globale.

Les assets JS à reconstruire en session B cibleront Supabase.
Aucune persistance localStorage dans la version BDB finale.

---

## ÉTAT TECHNIQUE — VIOLATIONS CDS (vérifiables)

| Violation | Preuve dans le HTML | Action session B |
|---|---|---|
| Font Awesome 6.4.0 | `fas fa-*` partout | → Bootstrap Icons |
| onclick= réel | ligne 316 : `onclick="document.getElementById(...)"` | → addEventListener |
| style= inline statiques | `style="min-width:300px"`, `style="display:none"` | → classes CSS |
| Chaîne CSS non conforme | theme-base depuis `../../_SHARED/css/` (inexistant) | → chaîne standard BDB |
| 15 assets JS manquants | `../assets/js/*.js` introuvables | → reconstruire |
| bdb-shell absent | Aucun `<div id="bdb-shell">` | → brancher bdb-shell.js v1.4.0 |

---

## PRÉREQUIS SESSION B

1. bdb-shell.js v1.4.0 doit exister ✅ (disponible) — navigation dynamique depuis app_modules obligatoire
2. Module à insérer dans app_modules (INSERT SQL) avant activation
3. Manu fournit les assets JS originaux si disponibles (CDS, Lovable, sauvegarde)
4. Si assets introuvables : reconstruire depuis la structure HTML + intention déclarée
5. Arbitrage schéma Supabase requis avant toute création de table

---

## AUTORISÉ

- Lire et modifier le HTML
- Reconstruire les assets JS en session dédiée
- Migrer FA → Bootstrap Icons
- Brancher bdb-shell.js v1.4.0 (navigation dynamique app_modules)

## INTERDIT

- Décrire une fonctionnalité non vérifiable dans le HTML
- Créer des tables Supabase sans arbitrage sur le schéma
- Qualifier ce module de "terminé" avant session B complète
- Qualifier ce module d'"orphelin" ou d'"égaré"
- Toute persistance localStorage dans la version finale

---
