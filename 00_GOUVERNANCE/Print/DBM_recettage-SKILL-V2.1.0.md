---
name: recettage-bdb
description: >
  Recettage et verification qualite de tout livrable BDB. Declencher APRES
  toute production de fichier HTML, JS, CSS ou SQL. Declencher aussi sur :
  tester, verifier, recetter, bug, regression, post-production, audit, controle
  qualite, valider avant deploiement, livrer, pousser en prod, FTP, "le module
  est pret", "est-ce correct", "ca marche", "verifier le rendu", "tester sur
  mobile", "tester la connexion Supabase", "les donnees s'affichent", "le bouton
  ne marche pas", "spinner bloque", "page blanche apres deploiement". Empeche
  Claude de livrer du code avec des bugs recurrents. Complete cds-compliance
  (conformite statique) par une verification dynamique et fonctionnelle.
---

# Skill — Recettage BDB

## Principe

Claude Code dit "zero console error" mais rate les bugs logiques,
les donnees fausses, les regressions visuelles et les RLS silencieux.
Le recettage humain est irreplacable pour 5 categories que l'IA ne voit pas.

---

## 5 CATEGORIES DE BUGS INVISIBLES POUR CLAUDE CODE

| # | Categorie | Exemple reel | Pourquoi invisible |
|---|---|---|---|
| 1 | Donnees fausses | `actif !== false` inclut les null → chirurgiens retraites affiches | Logique JS correcte, resultat metier faux |
| 2 | RLS silencieux | `.update()` sans `.select()` → 0 rows affected, aucune erreur | Supabase retourne 200 OK |
| 3 | Regressions visuelles | Classes CSS manquantes → alignement casse | Pas d'erreur DOM |
| 4 | Bugs d'integration | addEventListener manquant → bouton non fonctionnel | Event jamais leve, pas d'erreur |
| 5 | Bugs de format | Pipe `|` vs virgule `,` dans les separateurs → split echoue | Donnees s'affichent mais tronquees |

---

## CHECKLIST POST-PRODUCTION (obligatoire)

Apres chaque livraison de fichier, Claude execute cette checklist mentalement
et signale tout risque a Manu.

### A — Verification CDS statique (Smarty V5)

```
[ ] Zero onclick= inline
[ ] Zero style= statique (hors exceptions dynamiques)
[ ] Zero console.log / console.warn / console.error
[ ] Zero Font Awesome, zero Flaticon (bi-* uniquement)
[ ] escHtml() sur tout innerHTML avec donnee DB
[ ] .select() sur tout .update() et .delete() Supabase
[ ] #bdb-shell premier enfant de #wrapper (INTERDIT-E1)
[ ] Chaine V5 respectee : BS 5.3.3 → theme-base (63905396) → BI 1.11.1 → cds-overrides → module
[ ] CDN = commit hash 63905396 (pas @latest, pas a75daa0)
[ ] Zero Google Fonts / Inter / Rubik (INTERDIT-CDS-03)
```

### B — Verification logique metier

```
[ ] Filtres booléens stricts (=== true, pas !== false)
[ ] Index 0-based vs 1-based (position images, rang CCAM)
[ ] Separateurs coherents (pipe | pour synonymes, virgule , pour tags)
[ ] UNIQUE constraints respectees (pas d'INSERT sans ON CONFLICT si risque)
[ ] Dates tronquees YYYY-MM si contexte RGPD thesaurus
[ ] Tri alphabetique verifie sur les listes affichees
```

### C — Verification RLS

```
[ ] Toute table ecrite a une policy INSERT/UPDATE/DELETE
[ ] .select() chaine sur CHAQUE write operation
[ ] Tester mentalement : que retourne cette requete pour un membre ? Pour un admin ?
[ ] Si RPC SECURITY DEFINER : zero user_id dans le resultat (si agrege)
```

### D — Verification integration

```
[ ] addEventListener present pour chaque bouton interactif
[ ] Modals : ID references dans le JS matchent le HTML
[ ] Offcanvas/panels : ID coherents entre HTML et JS
[ ] Imports/scripts : fichier JS declare dans le HTML AVANT utilisation
[ ] await window.bdbShellReady present si module utilise bdbUser
```

### E — Verification async/UI

```
[ ] 3 etats DOM geres (loading, empty, error) pour chaque fetch
[ ] Skeleton loaders ou spinner sur les chargements initiaux
[ ] Toast ou message utilisateur sur erreur (pas silence)
[ ] Pagination si plus de 20-50 elements affiches
[ ] Debounce sur les champs de recherche temps reel
```

---

## PATTERNS DE BUGS RECURRENTS — REFERENCE

### BUG-001 : actif !== false vs === true

```javascript
// FAUX — inclut null et undefined (retraites sans valeur explicite)
chirurgiens.filter(c => c.actif !== false)

// CORRECT — strict
chirurgiens.filter(c => c.actif === true)
```
Source : session thesaurus analytics, KPI "12 chirurgiens actifs" affichait 14.

### BUG-002 : .select() manquant = RLS silencieux

```javascript
// FAUX — RLS bloque, retourne 200 OK, 0 rows, aucune erreur
await window.bdb.from('table').update({ col: val }).eq('id', id)

// CORRECT — le .select() rend l'echec detectable
const { data, error } = await window.bdb
  .from('table').update({ col: val }).eq('id', id).select()
if (!data?.length) console.error('Update bloque par RLS')
```
Source : session thesaurus recat, DELETE silencieux 3 sessions.

### BUG-003 : position 0-based vs 1-based

```javascript
// FAUX — CHECK constraint position >= 1 rejette 0
images.forEach((img, i) => ({ ...img, position: i }))

// CORRECT
images.forEach((img, i) => ({ ...img, position: i + 1 }))
```
Source : session arsenal, images jamais sauvees (PATCH 400 silencieux).

### BUG-004 : addEventListener manquant

```javascript
// FAUX — bouton present dans le DOM mais jamais connecte
document.getElementById('btnCamera')  // existe
// ... mais addEventListener('click', ...) jamais appele

// CORRECT — connecter dans initFromShell() ou DOMContentLoaded
document.getElementById('btnCamera')
  .addEventListener('click', () => fileInput.click())
```
Source : session profile, bouton avatar non fonctionnel.

### BUG-005 : separateur pipe vs virgule

```javascript
// FAUX — synonymes_recherche utilise pipe mais split sur virgule
tags = data.synonymes_recherche.split(',')

// CORRECT — split sur les deux
tags = data.synonymes_recherche.split(/[,|]/)
```
Source : session thesaurus V2, tags affiches tronques.

### BUG-006 : window.bdb capture trop tot

```javascript
// FAUX — IIFE executee au parse, window.bdb pas encore defini
var MonModule = (function() {
  const db = window.bdb;  // undefined au moment du parse
  return { init() { db.from('table')... } }  // crash
})();

// CORRECT — getter lazy
var MonModule = (function() {
  function _db() { return window.bdb; }
  return { init() { _db().from('table')... } }
})();
```
Source : session bdb-media.js, crash au chargement.

### BUG-007 : Quill dans modal = hauteur 0

```javascript
// FAUX — Quill init dans un modal display:none → height collapse
const quill = new Quill('#editor', { theme: 'snow' });

// CORRECT — forcer la hauteur apres init
const quill = new Quill('#editor', { theme: 'snow' });
quill.root.style.height = 'auto';
quill.root.style.minHeight = '120px';
quill.container.style.height = 'auto';
quill.container.style.minHeight = '120px';
```
Source : session fiches/transmissions/cours, editeur invisible.

---

## CE QUE CE SKILL NE COUVRE PAS

- Conformite CDS statique detaillee → `cds-compliance`
- Generation de module → `bdb-module-generator`
- Verification schema DB → `supabase-bdb`
- Verification clinique → `contexte-clinique-ibode`

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V2.1.0 qui verifie la qualite de tout livrable HTML/JS/CSS/SQL. Checklist 5 sections (CDS statique, logique metier, RLS, integration, async/UI). 7 patterns de bugs recurrents documentes (BUG-001 a 007) avec code source et correction. |
| **Fonction** | Complete cds-compliance (conformite statique) par une verification dynamique et fonctionnelle. Detecte les 5 categories de bugs invisibles pour Claude Code (donnees fausses, RLS silencieux, regressions visuelles, bugs integration, bugs format). |
| **Avantage** | vs livraison sans recettage — Claude Code dit "zero console error" mais rate les bugs logiques. Ce skill traque les 5 categories que l IA ne voit pas. |
| **Benefice** | Le createur deploie en confiance. L IBODE novice ne voit jamais un spinner infini ou une donnee tronquee. Les bugs recurrents (BUG-001 a 007) ne reviennent plus. |
| **Risque** | Le createur skip le recettage sur un "petit patch" — le patch casse un listener existant (BUG-004). Mitigation : checklist mentale automatique apres chaque livraison de fichier. |
| **Resultat** | 7 BUG patterns documentes avec code source et correction. Checklist 5x couvrant 20+ points de verification. 0 BUG-002 (RLS silencieux) depuis l ajout du .select() obligatoire. |
| **Recommandation** | Conserver. Enrichir les BUG patterns au fil des sessions (008+). |

---

## Historique

```
2026-05-01 — v2.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

v2.0.0 — 2026-04-17 — Migration Smarty V5 (session #89).
          CDN hash a75daa0 → 63905396. theme-print retire de la checklist.
          #bdb-shell premier enfant #wrapper (pas <main>). INTERDIT-E1 V5.
          INTERDIT-CDS-03 (Google Fonts) ajoute a la checklist.
          Chaine V5 documentee dans section A.
```
