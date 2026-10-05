---
name: cds-compliance
description: >
  Audit et generation de code HTML, CSS ou JS pour BDB (Bible de Bloc).
  Declencher AVANT toute creation ou modification de fichier HTML, CSS ou JS.
  Declencher aussi sur : "je cree un module", "nouveau fichier HTML", "modifier
  le JS", "ajouter un composant", "corriger le CSS", "nouveau bouton", "nouveau
  formulaire", "onclick", "innerHTML", "localStorage", "CDN", "@latest",
  "console.log", "style inline", "bdb-shell", "supabase-client", "cds-overrides",
  "INTERDIT", "escHtml", "3 etats", "window.bdb", "window.bdbUser", "addEventListener",
  "data-bs-toggle", "bdb-shell.js". Couvre : chaine de chargement, interdits
  B1-B3/C1-C6/E1/JS-01-03, regles CSS scoping, nommage module, CDN versions figees.
  Ne PAS declencher pour du SQL pur ou du contenu redactionnel.
---

# Skill — CDS-Compliance (BDB) — Smarty V5

## Sources de verite

Pour le detail complet, utiliser `project_knowledge_search` avec ces fichiers :
- **02_CHANTIER_TECHNIQUE** — BLOCS B/C/D/E/G complets (V1.1.0+ = V5)
- **03_CDS_REFERENCE** — classes CSS existantes (theme-base + cds-overrides)
- **05_CTX_SYSTEM_ARCHITECTURE** — flux autorises, couches, principes
- **09_MODULE_DEPENDENCY_MAP** — dependances inter-modules

---

## BLOC 0 — EN-TÊTE OBLIGATOIRE POUR TOUT PROMPT CLAUDE CODE

**Ce bloc doit être inclus au début de TOUT prompt Claude Code de production.**
Sans ce bloc, Claude Code produit sans connaître les règles → violations garanties.

```
AVANT TOUTE MODIFICATION — RÈGLES CDS NON NÉGOCIABLES :

CSS :
- Zéro style= statique → créer la classe dans [module]-ui.css
- [module]-ui.css = règles spécifiques au module uniquement
- cds-overrides.css = vidé (Smarty V5 = norme) — NE JAMAIS TOUCHER sans accord Manu
- Nouvelle classe : préfixe [module]-* (ex: .sup-th, .ars-card)
- Si la règle existe dans Bootstrap 5.3.3 → utiliser la classe BS, pas une classe custom
- Si la règle existe dans theme-base.css (Smarty V5) → utiliser la classe existante
- INTERDIT-CDS-01 : ne jamais contredire theme-base.css dans cds-overrides sans JOURNAL
- INTERDIT-CDS-03 : zéro Inter, Rubik, Google Fonts — font = system-ui natif
- INTERDIT-CDS-04 : zéro Flaticon, zéro Font Awesome — Bootstrap Icons uniquement

JS :
- Zéro onclick= → addEventListener + data-action sur l'élément
- Zéro innerHTML sans escHtml() sur toute donnée venant de Supabase ou de l'utilisateur
- Zéro console.log en production
- Zéro duplication de fonction si elle existe dans le socle (bdb-ui, bdb-media, bdb-fonctions)

CDN :
- Versions figées uniquement : Bootstrap 5.3.3, BI 1.11.1, Supabase @2
- theme-base.css CDN : menywise/BDB@63905396c73b061f336f8f5178d738627bca601c
- Zéro @latest

Toute ligne produite qui viole ces règles doit être corrigée AVANT de livrer.
Une violation non corrigée = fichier refusé.
```

---

## Chaine de chargement HTML — Smarty V5 (BLOC E — ordre strict)

```html
<head>
  <!-- 1 --> <link bootstrap@5.3.3 CSS>
  <!-- 2 --> <link theme-base.css CDN menywise/BDB@63905396 (Smarty V5 — sans BS embarque)>
  <!-- 3 --> <link bootstrap-icons@1.11.1>
  <!-- 4 --> <link css/cds-overrides.css (delta client — vide par defaut)>
  <!-- 5 --> <link [module]-ui.css>
</head>
<body>
  <div id="wrapper" class="d-flex align-items-stretch flex-column min-vh-100">
    <!-- PREMIER ENFANT de #wrapper = #bdb-shell (INTERDIT-E1) -->
    <div id="bdb-shell" data-module-title="..." data-module-icon="bi-..." data-root-path="../../"></div>
    <div id="wrapper_content" class="d-flex flex-fill">
      <main id="middle" class="flex-fill">
        <div class="container-fluid p-3 p-md-4">...</div>
      </main>
    </div>
    <footer>...</footer>
  </div>
  <!-- JS : bootstrap.bundle → supabase-js@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → module -->
</body>
```

---

## Interdits NON NEGOCIABLES

### Auth (BLOC B)
- **INTERDIT-B1** : zero code auth dans un module HTML — tout dans bdb-shell.js
- **INTERDIT-B2** : zero requete profiles_directory/user_roles dans un module — utiliser `window.bdbUser`
- **INTERDIT-B3** : zero `initAuth()` local — role = `window.bdbUser.isAdmin`

### CSS (BLOC C)
- **INTERDIT-17** : tout override Bootstrap scope a son conteneur `#[module]Main`
- **INTERDIT-C1** : zero modif cds-overrides.css sans entree JOURNAL_DECISIONS
- **INTERDIT-C2** : zero `style=` statique dans HTML (sauf couleurs dynamiques DB + width progressbar + honeypot)
- **INTERDIT-C3** : couleurs categorie = toujours `style=` dynamique (viennent de la base)
- **INTERDIT-C4** : bouton action primaire = toujours dans la toolbar filtres, jamais dans le header
- **INTERDIT-C5** : zero Optimistic Update sur DELETE, INSERT FK multiples, donnees critiques
- **INTERDIT-C6** : `escHtml()` obligatoire sur tout innerHTML avec donnee DB
- **INTERDIT-CSS-PLACEHOLDER** : ne jamais styler ::placeholder dans un module CSS — global dans cds-overrides
- **INTERDIT-CSS-SCROLLBAR** : masquage scrollbar = classe `.cds-hide-scrollbar` uniquement
- **INTERDIT-CSS-SHIMMER** : tout shimmer = `.cds-shimmer` — zero @keyframes *-shimmer dans un module

### Smarty V5 (BLOC C.11)
- **INTERDIT-CDS-01** : ne jamais contredire theme-base.css dans cds-overrides sans JOURNAL
- **INTERDIT-CDS-02** : ne jamais embarquer Bootstrap dans theme-base.css (BS = CDN separe)
- **INTERDIT-CDS-03** : zero Inter, Rubik, Google Fonts — font = system-ui natif (defaut BS)
- **INTERDIT-CDS-04** : zero Flaticon, zero Font Awesome — Bootstrap Icons uniquement

### Structure (BLOC E)
- **INTERDIT-E1** : `#bdb-shell` = premier enfant de `#wrapper`, jamais frere de `#wrapper`

### JS
- **JS-01** : zero JS inline apres migration (tout dans fichier module)
- **JS-02** : zero fonction dupliquee si elle existe dans le socle
- **JS-03** : zero fichier module dans `js/` racine — tout dans `modules/[module]/`
- Zero `onclick=` inline — `addEventListener` uniquement
- Zero `console.log` en production
- Zero `localStorage` dans modules Supabase (sauf exceptions documentees)
- Bootstrap Icons uniquement (zero Font Awesome, zero Flaticon)

### CDN
- **INTERDIT-01** : `@latest` interdit sur tous les CDN
- Versions figees : Bootstrap 5.3.3, BI 1.11.1, Supabase @2
- CDN theme : `menywise/BDB@63905396c73b061f336f8f5178d738627bca601c`
- Exception acceptee : `@supabase/supabase-js@2` (majeure figee, mineure flottante)

---

## Regle CSS scoping — [module]-ui.css vs cds-overrides.css vs theme-base.css

| Règle | Va dans | Raison |
|---|---|---|
| S'applique à 1 seul module | `[module]-ui.css` | Scopée, pas globale |
| S'applique à tous les modules | `theme-base.css` (Smarty V5) | Norme CDS — vidé cds-overrides |
| Existe déjà dans Bootstrap 5.3.3 | Classe BS dans le HTML | Ne pas recréer |
| Existe déjà dans theme-base.css | Classe existante dans le HTML | Ne pas dupliquer |
| Exception delta client non Smarty | `cds-overrides.css` + JOURNAL | Cas rare — accord Manu |

**Test rapide :** "Est-ce que cette règle doit s'appliquer partout dans BDB ?"
- Oui → theme-base.css (recompilation SCSS) ou cds-overrides (accord Manu + JOURNAL)
- Non → [module]-ui.css

---

## Patterns JS obligatoires

### escHtml()
```javascript
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### 3 etats async DOM
Toute operation async qui met a jour le DOM = 3 etats : loading / empty / error.

### Init standard
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady;
  initFromShell();
  try {
    await loadReferentiels();
  } catch (err) {
    cdsShowGridError(container, 'Erreur referentiels : ' + err.message, () => location.reload());
    return;
  }
  await loadData();
});
```

### Contrat auth
- `window.bdb` = client Supabase (via supabase-client.js)
- `window.bdbGetSession()` = session auth
- `window.bdbUser` = { id, email, name, isAdmin, isMember, isDemo, isCreator, ... }
- `window.bdbShellReady` = Promise resolue quand shell pret

---

## Checklist pre-generation (a executer avant chaque fichier livre)

```
[ ] Zéro style= statique hors exceptions documentées
[ ] Zéro onclick= — addEventListener + data-action
[ ] Zéro innerHTML sans escHtml() sur donnée DB
[ ] Zéro console.log
[ ] Zéro @latest CDN
[ ] Zéro fonction dupliquée du socle
[ ] Classe CSS → [module]-ui.css si spécifique, theme-base si globale
[ ] Bootstrap 5.3.3 couvre → classe BS, pas custom
[ ] theme-base.css couvre → classe existante, pas dupliquée
[ ] #bdb-shell = premier enfant de #wrapper (INTERDIT-E1)
[ ] Chaîne de chargement V5 respectée (pas de theme-print)
[ ] Zéro Google Fonts, Inter, Rubik (INTERDIT-CDS-03)
[ ] Zéro Font Awesome, Flaticon (INTERDIT-CDS-04)
```

---

## Fichiers proteges (modification interdite sans accord Manu)

- `js/bdb-shell.js`
- `js/supabase-client.js`
- `css/cds-overrides.css`

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V2.1.0 qui audite et genere du code HTML/CSS/JS conforme CDS. Chaine de chargement Smarty V5 (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides → module). Interdits B1-B3/C1-C6/E1/JS-01-03. Fichiers proteges. BLOC 0 pour Claude Code. |
| **Fonction** | Empeche Claude de produire du code non conforme CDS : onclick inline, style inline, console.log, @latest, CSS-in-JS, Google Fonts, Font Awesome. Force la chaine de chargement V5. |
| **Avantage** | vs production sans skill — Claude reintroduit des onclick=, du console.log, des classes inventees, @latest sur les CDN. Ce skill bloque ces 12+ violations recurrentes. |
| **Benefice** | Le createur deploie du code conforme du premier coup. Le dev qui reprend le module trouve une chaine JS/CSS coherente et documentee. |
| **Risque** | Nouveau INTERDIT non documente dans le skill — Claude continue a produire le pattern interdit. Mitigation : enrichir le skill apres chaque violation detectee. |
| **Resultat** | 12+ INTERDIT documentes. Chaine V5 stable. 3 fichiers proteges identifies. BLOC 0 Claude Code operationnel. |
| **Recommandation** | Conserver. Pilier technique. Enrichir au fil des violations detectees. |

---

## Historique

```
2026-05-01 — v2.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

v2.0.0 — 2026-04-17 — Migration Smarty V5 (session #89).
          BS 5.3.2 → 5.3.3. CDN @63905396. theme-print supprime de la chaine.
          #bdb-shell premier enfant #wrapper (pas <main>). INTERDIT-E1 V5.
          INTERDIT-CDS-01→04 ajoutes (doctrine Smarty V5 BLOC C.11).
          cds-overrides.css = vide par defaut (Smarty V5 = norme).
          bdb-invite-guard.js + bdb-ui.js dans chaine JS.
          window.bdbUser enrichi (isMember, isDemo, isCreator).
```
