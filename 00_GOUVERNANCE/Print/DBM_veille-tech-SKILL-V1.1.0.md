---
name: veille-tech-bdb
description: >
  Veille technologique et UX pour le developpement de BDB (Bible de Bloc).
  Declencher des qu'une recherche tech, UX ou code source est necessaire :
  patterns UX premium, benchmarks interfaces hospitaliers, micro-interactions,
  open-source a integrer, snippet a adapter, librairie candidate, animation CSS,
  icone libre, font libre, pattern formulaire, widget date, tableau interactif.
  Declencher aussi sur : "comment font les autres", "y a-t-il une lib pour ca",
  "meilleure pratique pour", "comment ameliorer ce composant", "code source libre
  pour", "existe-t-il un pattern", "benchmark UX", "inspiration UI", "comment
  font les apps medicales", "open-source compatible", "pas reinventer la roue",
  "trouver un exemple de", "adapter ce code", "sans framework", "prompt Perplexity
  UX", "prompt Gemini code". Produit une fiche veille et/ou un bloc code
  adapte stack BDB (vanilla JS + Bootstrap 5.3.3), avec verification licence.
---

# Skill — Veille Tech & UX BDB

## 1. Objectif

Fournir des **references tech et UX sourcees, filtrées stack, prêtes à adapter**
pour BDB. Deux modes :

- **Mode UX** — patterns, benchmarks, meilleures pratiques interfaces
- **Mode Code** — code source libre, librairies, snippets adaptables

Les deux modes peuvent se combiner sur une meme recherche.

---

## 2. Contrainte stack — FILTRE OBLIGATOIRE

Toute source ou code recupere DOIT etre compatible :

| Contrainte | Detail |
|---|---|
| Langage | Vanilla HTML / JS / CSS uniquement |
| Framework CSS | Bootstrap 5.3.3 (classes figees CDN) |
| Build tools | ZERO — pas de npm, webpack, vite, rollup |
| Frameworks JS | ZERO React / Vue / Svelte / Angular |
| Backend | Supabase JS CDN (`@supabase/supabase-js@2`) |
| Deploiement | FTP OVH — fichiers statiques uniquement |
| OS | Windows — chemins et scripts ASCII purs |

**Signal d'ecart** : si la source necessite `npm install`, `import from`, un
bundler ou un framework → la signaler mais l'ecarter du bloc code livrable.
Proposer l'equivalent vanilla ou l'alternative compatible.

---

## 3. Mode UX — Recherche patterns et benchmarks

### 3.1 Sources UX — 4 niveaux

**Niveau A — Referentiels**
Nielsen Norman Group (nngroup.com) | Material Design (m3.material.io) |
Apple HIG (developer.apple.com/design) | W3C WAI (w3.org/WAI) |
RGAA (accessibilite.numerique.gouv.fr) | WCAG (w3.org/TR/WCAG21) |
Smashing Magazine (smashingmagazine.com) | A List Apart (alistapart.com)

**Niveau B — UX medicale et hospitaliere**
ANAP (anap.fr) | HAS numerique (has-sante.fr) | eHealth Hub |
Nielsen UX Healthcare | HIMSS | Usability.gov

**Niveau C — References pratiques**
UX Collective (uxdesign.cc) | UX Planet | Muzli (muz.li) |
Dribbble (inspiration seulement) | Mobbin (mobbin.com) |
Pageflows (pageflows.com) | Scrnshts (scrnshts.club)

**Niveau D — Communautes**
dev.to | CSS-Tricks (css-tricks.com) | Codrops (tympanus.net/codrops) |
Bootstrap examples (getbootstrap.com/docs/5.3/examples)

**Regle** : toujours Niveau A en premier. Descendre si insuffisant.
**Priorite** : UX medicale / hospitaliere avant UX generique.

### 3.2 Protocole Mode UX

```
1. Cadrer : quel composant ? quel cas d'usage ? quel utilisateur BDB ?
2. Chercher referentiel (A) : WCAG / RGAA si accessibilite en jeu
3. Chercher benchmark hospitalier (B) si applicable
4. Chercher pattern generique (C) pour inspiration
5. Filtrer stack : compatible Bootstrap 5 vanilla ?
6. Livrer fiche UX
```

### 3.3 Livrable Mode UX

```markdown
# FICHE VEILLE UX BDB
Composant : [...] | Cas d'usage : [...] | Utilisateur : [Julie/Olivia/Manu]

## Benchmark (2-4 exemples concrets avec source)

## Pattern recommande
[Description + justification UX]

## Contraintes accessibilite (WCAG/RGAA)
[Niveau AA minimum — obligatoire app hospitaliere]

## Adaptation BDB
[Comment implementer avec Bootstrap 5.3.3 + vanilla JS]

## Sources
| Niveau | Source | Date | Pertinence |

## A eviter (anti-patterns detectes)
```

---

## 4. Mode Code — Recherche open-source et snippets

### 4.1 Sources Code — par priorite

**Tier 1 — Fiabilite maximale**
MDN Web Docs (developer.mozilla.org) | Can I Use (caniuse.com) |
Bootstrap 5 docs (getbootstrap.com) | Vanilla JS Toolkit (vanillajstoolkit.com) |
GitHub (github.com) — filtrer : stars > 100, activite < 2 ans |
CodePen (codepen.io) — verifier licence avant usage

**Tier 2 — Snippets et exemples**
CSS-Tricks (css-tricks.com) | Codrops | 30 seconds of code (30secondsofcode.org) |
html5up.net | Bootsnipp (bootsnipp.com) | Start Bootstrap (startbootstrap.com)

**Tier 3 — Agregateurs**
npm (npmjs.com) — verifier bundle standalone disponible |
jsDelivr (jsdelivr.com) — CDN compatible si lib sans build |
CDNJS (cdnjs.com) — meme critere

### 4.2 Verification licence — OBLIGATOIRE

Avant tout usage de code externe :

| Licence | Usage BDB | Condition |
|---|---|---|
| MIT | OK | Mentionner dans code (commentaire) |
| Apache 2.0 | OK | Idem |
| BSD 2/3 | OK | Idem |
| ISC | OK | Idem |
| GPL v2/v3 | ATTENTION | App interne OK, distribution non |
| LGPL | OK si lib non modifiee | Verifier cas |
| CC BY / CC BY-SA | OK pour assets | Credit auteur |
| CC0 | OK | Aucune contrainte |
| Proprietaire | NON | Ecarter |
| Pas de licence | NON | Ecarter — risque juridique |

**Regle** : si licence absente ou ambigue → ecarter + signaler + chercher alternative.

### 4.3 Protocole Mode Code

```
1. Cadrer : quelle fonction exacte ? quel input/output attendu ?
2. Verifier si Bootstrap 5 natif couvre deja le besoin
3. Chercher Tier 1 (MDN / vanilla JS)
4. Si lib externe : verifier licence + verifier CDN disponible
5. Verifier compatibilite navigateurs (Can I Use si CSS/API recente)
6. Adapter au pattern CDS BDB (voir section 5)
7. Livrer bloc code
```

### 4.4 Livrable Mode Code

````markdown
# FICHE CODE BDB
Fonction : [...] | Licence : [...] | Source : [URL]

## Code adapte stack BDB

```html
<!-- Source : [URL] — Licence : MIT — Adapte BDB par Claude -->
[code HTML/JS/CSS vanilla]
```

## Points d'integration CDS
- [ ] escHtml() sur donnees DB
- [ ] 3 etats async si fetch Supabase
- [ ] Classes CDS utilisees : [liste]
- [ ] Aucun conflit Bootstrap detecte

## Navigateurs (Can I Use)
[compatibilite si API CSS/JS non triviale]

## Limitations / points de vigilance
````

---

## 5. Adaptation CDS — regles de transformation

Quand un code externe est recupere, appliquer ces transformations :

| Source externe | Adaptation BDB |
|---|---|
| `class="btn btn-primary"` | Verifier conflit CDS overrides |
| Variables CSS `--bs-*` | OK si Bootstrap 5.3.3 |
| `innerHTML = data` | → `escHtml(data)` OBLIGATOIRE |
| `fetch(url).then(...)` | → pattern async 3 etats |
| `import { x } from 'y'` | → convertir en CDN ou vanilla |
| `npm install` | → chercher CDN jsDelivr/CDNJS |
| `addEventListener` | Verifier pas de doublon listeners |
| Couleurs hardcodees | → variables CSS CDS si possible |

---

## 6. Prompts externes — Perplexity et Gemini

Utiliser quand `web_search` est insuffisant, biaise ou trop restrictif.
Copier-coller le prompt adapte au cas.

### 6.1 Prompt UX Pattern

```
[PERPLEXITY / GEMINI]
Contexte : je developpe une application web hospitaliere en vanilla HTML/JS/CSS
avec Bootstrap 5.3.3. Pas de React, pas de build tools. Deploiement FTP statique.
Utilisateurs : infirmieres de bloc operatoire (IBODE).

Recherche : [DECRIRE LE COMPOSANT OU PATTERN UX]

Besoin :
1. Quelles sont les meilleures pratiques UX actuelles pour ce composant ?
2. Exemples d'applications medicales ou hospitaliers qui le font bien ?
3. Contraintes accessibilite WCAG AA specifiques a ce cas ?
4. Exemples de code vanilla JS ou Bootstrap 5 natif pour l'implementer ?

Sourcer chaque affirmation. Privilegier Nielsen Norman Group, W3C WAI, ANAP.
```

### 6.2 Prompt Code Source

```
[PERPLEXITY / GEMINI]
Contexte : stack vanilla HTML/JS/CSS + Bootstrap 5.3.3. Pas de npm, pas de
framework JS. CDN uniquement. Navigateurs modernes (Chrome/Firefox/Edge 2023+).

Recherche : [DECRIRE LA FONCTION TECHNIQUE RECHERCHEE]

Besoin :
1. Existe-t-il une solution Bootstrap 5 native (sans code custom) ?
2. Sinon, existe-t-il une librairie legere (< 20kb) disponible sur CDN jsDelivr,
   licence MIT ou Apache 2.0, compatible vanilla JS ?
3. Sinon, quel serait le code vanilla JS minimal pour implementer cette fonction ?
4. Donner l'URL source et la licence pour chaque proposition.

Privilegier la solution la plus legere et la moins dependante possible.
```

### 6.3 Prompt Benchmark Concurrents

```
[PERPLEXITY / GEMINI]
Je developpe une app de gestion de protocoles chirurgicaux pour infirmieres
de bloc operatoire (IBODE) en France.

Recherche : quelles applications similaires existent (gestion de protocoles
operatoires, knowledge base bloc, applications IBODE) ?
- Applications commerciales (Softway Medical, Blumedi, OPTIM, etc.)
- Applications open-source ou publiques
- Capture d'ecran ou demo disponibles ?

Pour chaque app : points forts UX, points faibles, patterns a retenir.
```

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V1.1.0 qui fournit des references tech et UX sourcees, filtrees stack BDB (vanilla JS + BS 5.3.3 + Supabase CDN). 2 modes (UX + Code), 4 niveaux sources UX, 3 tiers sources code, verification licence obligatoire, prompts Perplexity/Gemini prets a copier. |
| **Fonction** | Empeche Claude de proposer du code ou un pattern incompatible stack (npm, React, build tools). Filtre les sources par licence et par tier de fiabilite. Produit des fiches veille et/ou des blocs code adaptes. |
| **Avantage** | vs recherche web brute — Claude ramene du code React/Vue/npm inutilisable. Ce skill filtre a la source et adapte au pattern CDS. Economie de 30-60 min de tri par composant. |
| **Benefice** | Le createur integre du code externe en confiance (licence verifiee, stack compatible). Les patterns UX hospitaliers sont priorises sur le generique. |
| **Risque** | Source Tier 3 (npm) integree sans verification CDN standalone — le composant ne fonctionne pas en FTP statique. Mitigation : contrainte stack en section 2 = filtre obligatoire. |
| **Resultat** | 0 lib npm non-CDN integree depuis V1.0.0. Chaque code externe porte un commentaire source + licence. Chaque fiche veille suit le template structure. |
| **Recommandation** | Conserver. Ajouter une section benchmark apps hospitalières actualise (le prompt 6.3 est un debut). |

---

## 8. Historique

```
2026-05-01 — V1.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

V1.0.0 — Creation initiale.
```

---

## 9. Interactions avec les autres skills

| Situation | Skill |
|---|---|
| Code recupere implique une table Supabase | `supabase-bdb` |
| Composant a integrer dans un module | `cds-compliance` puis `bdb-module-generator` |
| Composant partage entre modules | `bdb-shared-component` |
| Terme chirurgical dans un composant UX | `contexte-clinique-ibode` |
| Post-integration : verifier conformite | `recettage-bdb` |
| Persona concerne par l'UX | `persona-guard` |
| Respect philosophie participative | `philosophie-participative-bdb` |
