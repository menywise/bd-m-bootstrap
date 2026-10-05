# AUDIT CONFLITS INTER-SOURCES DB&M
> Date : 2026-05-08
> Sources croisées : Carnet V2 · Skills (cds-compliance, bdb-module-generator, acces-niveaux) · atelier_principes (Supabase) · Données réelles (app_modules, app_groups)

---

## CONFLIT 1 — Position du shell (#bdb-shell)
**Criticité : BLOQUANTE — toute instance qui se trompe = page blanche**

| Source | Dit |
|---|---|
| **Skill cds-compliance** (v2.0.0 — 2026-04-17) | `#bdb-shell = premier enfant de #wrapper` |
| **Skill bdb-module-generator** (template) | `#bdb-shell = premier enfant de #wrapper` |
| **atelier_principes INTERDIT-E1** | `#bdb-shell = premier enfant de <main>, jamais un sibling` |
| **Carnet V2** | Suit atelier_principes → `<main>` |

Le skill dit explicitement dans son changelog : *"#bdb-shell premier enfant #wrapper (pas <main>). INTERDIT-E1 V5."* → la règle a été **mise à jour dans les skills** lors de la migration V5, mais **pas dans atelier_principes**.

**→ Arbitrage Manu : `#wrapper` ou `<main>` ? Et mettre à jour la source perdante.**

---

## CONFLIT 2 — CDN hash theme-base.css
**Criticité : BLOQUANTE — mauvais hash = mauvais rendu**

| Source | Hash |
|---|---|
| **Skill cds-compliance** (v2.0.0) | `@63905396c73b061f336f8f5178d738627bca601c` |
| **Skill bdb-module-generator** (template) | `@63905396c73b061f336f8f5178d738627bca601c` |
| **atelier_principes P-CDS-01** | `@4faebd0280e559235fcbfaec2b24d407cebf0a95` |
| **Carnet V2** | Suit atelier_principes → `@4faebd02...` |

P-CDS-01 mentionne l'ancien hash `@a75daa03` comme obsolète mais ne mentionne pas `@63905396`. Les deux skills utilisent le même hash `@63905396`.

**→ Arbitrage Manu : quel hash est en production sur le FTP aujourd'hui ?**

---

## CONFLIT 3 — Ordre chaîne CSS (position Icons + theme-print)
**Criticité : HAUTE — ordre CSS affecte la cascade**

| Source | Ordre |
|---|---|
| **Skills** (cds-compliance + module-generator) | Bootstrap → theme-base → Icons → cds-overrides → module |
| **atelier_principes CONV-CHAIN-E** | Bootstrap → Icons → theme-base → theme-print → cds-overrides → module |

Deux différences :
1. **Icons** : avant ou après theme-base ?
2. **theme-print** : le skill dit *"supprimé de la chaîne"* (changelog v2.0.0), CONV-CHAIN-E l'inclut encore.

**→ Arbitrage Manu : quel ordre est en prod ? theme-print existe-t-il encore ?**

---

## CONFLIT 4 — dbm-module-color.css absent des skills
**Criticité : HAUTE — sans ce fichier, le pattern couleur module ne fonctionne pas**

| Source | Présent ? |
|---|---|
| **Skills** (cds-compliance + module-generator) | Absent de la chaîne CSS |
| **atelier_principes REF-CSS-DBM-01** | Décrit comme "source unique du pattern couleur module" en 12 sections |
| **Carnet V2** | Inclus en position 6 |

Le fichier `dbm-module-color.css` a été créé après la dernière mise à jour des skills.

**→ Action : mettre à jour les 2 skills pour inclure `dbm-module-color.css` en position 5 (avant le CSS module).**

---

## CONFLIT 5 — escHtml : définition locale vs socle
**Criticité : MOYENNE — code dupliqué, pas de casse fonctionnelle**

| Source | Dit |
|---|---|
| **Skill cds-compliance** | Fournit le code complet de `escHtml()` comme pattern à copier dans les modules |
| **atelier_principes P-CDS-04 + INTERDIT-JS-02** | `escHtml` est dans `bdb-ui.js` — interdit de le redéfinir |

Le skill donne l'impression qu'il faut copier la fonction localement. P-CDS-04 dit le contraire.

**→ Action : retirer la définition de `escHtml()` du skill. Garder uniquement la mention "fourni par bdb-ui.js".**

---

## CONFLIT 6 — Bouton CTA : btn-danger dans le template
**Criticité : HAUTE — violation visuelle + 3 règles**

| Source | Dit |
|---|---|
| **Skill bdb-module-generator** (ligne 83) | `<button class="btn btn-danger">Nouveau</button>` |
| **atelier_principes INTERDIT-COULEUR-01** | Rouge interdit dans la navigation des modules |
| **atelier_principes CONV-BTN-01** | CTA principal = `btn-module` |
| **atelier_principes INTERDIT-CTA-PRIMARY-MODULE-A11** | CTA = `.btn-universe`, jamais `.btn-primary` |

Le template du skill utilise `btn-danger` pour le bouton principal. Trois règles l'interdisent.

**→ Action : remplacer `btn-danger` par `btn-module` ou `btn-universe` dans le skill.**

---

## CONFLIT 7 — app-zone absentes du template skill
**Criticité : MOYENNE — structure non conforme mais fonctionnelle**

| Source | Dit |
|---|---|
| **Skills** (template module-generator) | Pas de `<section class="app-zone">` |
| **atelier_principes CONV-APP-ZONE-01/02** | Chaque zone dans `<section class="app-zone" data-zone="...">`, ordre fixe |

Le template skill a été écrit avant les conventions app-zone.

**→ Action : ajouter les sections app-zone dans le template du skill.**

---

## CONFLIT 8 — Surface marker absent du template skill
**Criticité : FAIBLE — cosmétique, mais auditée par scripts**

| Source | Dit |
|---|---|
| **Skills** (template module-generator) | Pas de commentaire surface après DOCTYPE |
| **atelier_principes CONV-SURFACE-MARKER-HTML** | Obligatoire : `<!-- DBM | Surface: MODULE | Auth: ... | Shell: oui -->` |

**→ Action : ajouter le marker dans le template du skill.**

---

## CONFLIT 9 — CONV-COULEUR-MODULE-01 : règle obsolète
**Criticité : HAUTE — induit en erreur toute instance qui la lit**

| Source | Dit |
|---|---|
| **atelier_principes CONV-COULEUR-MODULE-01** | "Couleur module = toujours celle de son groupe (app_groups.color)" |
| **Données réelles app_modules** | Chaque module a sa propre couleur (ex: medacta #6c757d ≠ bloc #93c5fd) |
| **Manu** (confirmé cette session) | Chaque module a sa propre palette, le groupe = navigation uniquement |

**→ Action : mettre à jour ou supprimer CONV-COULEUR-MODULE-01 dans atelier_principes.**

---

## CONFLIT 10 — INTERDIT-TABLE-SCROLL vs usage réel
**Criticité : À ARBITRER**

| Source | Dit |
|---|---|
| **atelier_principes INTERDIT-TABLE-SCROLL** | "Pagination obligatoire — jamais max-height + overflow-y — jamais sticky thead" |
| **Usage réel** | Plusieurs modules utilisent des tables scrollables pour les référentiels de configuration (petites tables de paramétrage, pas de données paginables) |

La règle est pertinente pour les tables de données (glossaire 2000 entrées → paginer). Mais pour une table config de 20 agents avec dropdowns par ligne, la pagination casse l'UX.

**→ Arbitrage Manu : exception pour les tables de configuration/paramétrage ?**

---

## RÉSUMÉ — STATUT

| # | Conflit | Verdict | Base mise à jour |
|---|---|---|---|
| 1 | Shell position | `#wrapper` (V5) | INTERDIT-E1 ✅ |
| 2 | CDN hash | `@4faebd02` (le plus récent) | P-CDS-01 ✅ |
| 3 | Chaîne CSS | BS → theme-base → Icons, theme-print supprimé | CONV-CHAIN-E ✅ |
| 4 | dbm-module-color absent skills | À ajouter dans les 2 skills | **À faire** |
| 5 | escHtml dans skill | Retirer la définition locale du skill | **À faire** |
| 6 | btn-danger dans template skill | Remplacer par btn-module | **À faire** |
| 7 | app-zone absentes template skill | Ajouter dans le template | **À faire** |
| 8 | Surface marker absent template skill | Ajouter dans le template | **À faire** |
| 9 | CONV-COULEUR-MODULE-01 obsolète | Corrigée : couleur par module | CONV-COULEUR-MODULE-01 ✅ |
| 10 | INTERDIT-TABLE-SCROLL trop strict | Exception config documentée | INTERDIT-TABLE-SCROLL ✅ |

**5/10 résolus en base. 5 restants = mise à jour des skills (action AI prochaine session).**
