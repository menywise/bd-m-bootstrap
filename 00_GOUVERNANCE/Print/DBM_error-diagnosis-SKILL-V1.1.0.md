---
name: error-diagnosis-bdb
description: >
  Diagnostic des erreurs recurrentes BDB : Supabase, JS, CSS, RLS, CORS.
  Declencher des qu'une erreur est signalee ou observee : message d'erreur
  console, page blanche, donnees absentes, 401, 403, 406, CORS, null, undefined,
  RLS, infinite loop, module qui ne charge pas, icones absentes, layout casse,
  spinner infini, fetch qui echoue, token expire, session perdue. Declencher
  aussi sur : "ca ne marche plus", "erreur dans la console", "les donnees
  n'apparaissent pas", "acces refuse", "page blanche", "bug apres deploiement".
  Ce skill diagnostique avant de corriger — ne jamais modifier du code sans
  avoir identifie la cause racine.
---

# Skill — Error Diagnosis BDB

## Principe

**Diagnostiquer avant de corriger.**
Un symptome peut avoir plusieurs causes. Identifier la cause racine avant
de proposer du code.

Workflow : Symptome → Cause probable → Verification → Correction ciblée.

---

## 1. Erreurs Supabase

### HTTP 401 — Non authentifie

```
Cause A : anon key manquante ou incorrecte dans supabase-client.js
Cause B : token JWT expire — session perdue
Cause C : URL Supabase locale dans le code (127.0.0.1) en production
```

Verification :
```javascript
// Dans la console navigateur
console.log(window.bdb) // doit exister
const { data: { session } } = await window.bdb.auth.getSession()
console.log(session) // null = non connecte
```

Correction selon cause :
- A → verifier supabase-client.js (URL + anon key cloud)
- B → `window.bdb.auth.signInWithPassword(...)` ou rediriger login
- C → remplacer URL localhost par URL cloud

---

### HTTP 403 — Interdit (RLS)

```
Cause A : RLS active, policy manquante ou trop restrictive
Cause B : role utilisateur incorrect (admin attendu, membre recu)
Cause C : fonction bdb_is_admin() retourne false a tort
```

Verification :
```sql
-- Dans SQL Editor Supabase Dashboard
SELECT policyname, cmd, roles, qual
FROM pg_policies WHERE tablename = '[table]';

-- Tester la fonction admin
SELECT bdb_is_admin();
```

Correction :
- A → ajouter ou corriger la policy
- B → verifier `window.bdbUser.isAdmin` en console
- C → verifier la table `user_roles` pour cet utilisateur

---

### HTTP 406 — Not Acceptable

```
Cause : header Accept absent ou incorrect sur une requete Supabase REST
Cause BDB specifique : utilisation directe de fetch() au lieu du client Supabase
```

Correction : toujours passer par `window.bdb` (client Supabase), jamais `fetch()` direct.

---

### CORS

```
Cause A : URL Supabase incorrecte (locale vs cloud)
Cause B : domaine OVH non autorise dans Supabase Dashboard
```

Verification Supabase Dashboard :
`Settings → API → CORS allowed origins` → verifier que le domaine OVH est present.

---

### Donnees absentes (pas d'erreur console)

```
Cause A : RLS bloque silencieusement (retourne [] sans erreur)
Cause B : colonne filtree inexistante → requete retourne 0 lignes
Cause C : cache sessionStorage obsolete (thesaurus)
Cause D : migration SQL non executee sur cloud (executee sur local uniquement)
```

Verification :
```javascript
// Tester la requete directement en console
const { data, error } = await window.bdb.from('[table]').select('*').limit(5)
console.log(data, error)
```

Si `data = []` et `error = null` → RLS ou filtre.
Si `error` → voir code erreur.
Si `data` present mais pas affiche → bug JS dans le rendu DOM.

---

## 2. Erreurs JavaScript

### `Cannot read properties of null` / `undefined`

```
Cause A : element DOM cible avant DOMContentLoaded
Cause B : window.bdbUser non disponible (shell pas encore pret)
Cause C : donnee DB null non protegee (escHtml() sur null = OK, mais acces .prop sur null = crash)
```

Pattern de protection :
```javascript
// Attendre le shell
document.addEventListener('DOMContentLoaded', async () => {
  await window.bdbShellReady; // OBLIGATOIRE avant tout acces bdbUser
  const user = window.bdbUser;
  if (!user) return; // guard
});

// Proteger les acces proprietes
const nom = data?.chirurgien?.nom ?? 'Inconnu';
```

---

### Spinner infini (etat loading bloque)

```
Cause A : erreur JS non capturee dans le bloc async → finally absent
Cause B : promesse jamais resolue (await sur fonction qui ne retourne pas)
Cause C : evenement DOMContentLoaded jamais declenche (script charge avant DOM)
```

Pattern correct :
```javascript
async function loadData() {
  showLoading(); // etat 1
  try {
    const { data, error } = await window.bdb.from('...').select('*');
    if (error) throw error;
    if (!data.length) { showEmpty(); return; } // etat 2
    renderData(data); // etat 3
  } catch (err) {
    showError(err.message); // etat erreur
  }
}
```

---

### Ecouteurs dupliques (actions se declenchent 2x, 3x...)

```
Cause : addEventListener appele plusieurs fois sur le meme element
(typiquement dans une fonction de rendu appelee a chaque refresh)
```

Correction :
```javascript
// Option A : cloner le noeud pour supprimer les listeners
const btn = document.getElementById('monBtn');
const newBtn = btn.cloneNode(true);
btn.parentNode.replaceChild(newBtn, btn);
newBtn.addEventListener('click', handler);

// Option B : deleguer l'evenement sur le conteneur parent (pattern recommande)
document.getElementById('conteneur').addEventListener('click', (e) => {
  if (e.target.matches('[data-action="modifier"]')) { /* ... */ }
});
```

---

### `escHtml is not defined`

```
Cause : fonction escHtml() absente du fichier module
```

Correction : ajouter en haut du fichier JS module :
```javascript
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## 3. Erreurs CSS / visuel

### FOUC — Flash of Unstyled Content

```
Cause : CSS charge apres le rendu DOM initial
```

Verification : ordre de chargement dans `<head>` (voir cds-compliance).
Bootstrap 5.3.3 → theme-base V5 (CDN 63905396) → BI 1.11.1 → cds-overrides → module-ui.

### Icones Bootstrap carrees ou absentes

```
Cause A : lien CDN bootstrap-icons absent ou incorrect dans <head>
Cause B : version incorrecte (pas 1.11.1)
Cause C : nom de classe icone incorrect (bi-icon vs bi bi-icon)
```

Correction : toujours `class="bi bi-[nom]"` (deux classes).
CDN : `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css`

### Layout casse apres deploiement

```
Cause A : fichier CSS module non uploade
Cause B : fichier cds-overrides.css non uploade
Cause C : chemin relatif incorrect (../../css/ depuis modules/[module]/)
```

Verification : F12 → Network → filtrer CSS → verifier statut 200 sur chaque fichier.

---

## 4. Erreurs post-migration SQL

### Donnees inattendues apres UPDATE/INSERT

```
Cause A : ERREUR 13 — protocole_operatoire ecrase sur lignes avec protocole_id mappe
Cause B : encoding LATIN1 corrompu (import via PowerShell CP850)
Cause C : migration executee sur Supabase local au lieu du cloud
```

Verification ERREUR 13 :
```sql
SELECT COUNT(*) FROM thesaurus_interventions
WHERE protocole_id IS NOT NULL AND protocole_operatoire IS NULL;
-- Si > 0 : ERREUR 13 active
```

Restauration ERREUR 13 :
```sql
UPDATE thesaurus_interventions ti
SET protocole_operatoire = tp.libelle_cible
FROM thesaurus_protocoles tp
WHERE ti.protocole_id = tp.id
  AND ti.protocole_operatoire IS NULL;
```

---

## 5. Grille de triage rapide

| Symptome | Premier reflexe |
|---|---|
| Page blanche | F12 Console → premiere erreur JS |
| Donnees absentes, pas d'erreur | Tester requete en console direct |
| 401 | Verifier session + URL cloud |
| 403 | Verifier RLS + role utilisateur |
| CORS | Verifier domaine dans Supabase Dashboard |
| Spinner infini | Verifier bloc try/catch/finally |
| Actions 2x | Chercher addEventListener dans boucle de rendu |
| Layout casse | F12 Network → CSS 200 ? |
| Migration ko | Verifier cible : cloud vs local |

---

## FAB(3R) DU SKILL

| Dimension | Contenu |
|---|---|
| **Realite** | Skill V1.1.0 qui diagnostique les erreurs recurrentes BDB : Supabase (401/403/406/CORS/RLS silencieux), JS (null, spinner infini, listeners dupliques, escHtml), CSS (FOUC, icones, layout), post-migration (ERREUR 13, encoding). Grille de triage rapide 9 symptomes. |
| **Fonction** | Force le diagnostic AVANT la correction. Empeche Claude de modifier du code sans identifier la cause racine. Workflow : Symptome → Cause probable → Verification → Correction ciblee. |
| **Avantage** | vs correction reflexe — Claude corrige le symptome visible et cree une regression ailleurs. Ce skill force l identification de la cause racine (3-4 causes par symptome documentees). |
| **Benefice** | Le createur ne perd plus 2h sur un "bug" qui est un RLS silencieux. Chaque correction cible la cause, pas le symptome. |
| **Risque** | Nouveau type d erreur non documente dans le skill — Claude revient en mode correction reflexe. Mitigation : enrichir la grille apres chaque bug non couvert. |
| **Resultat** | Grille 9 symptomes operationnelle. ERREUR 13 detectee et restauree en < 5 min. 0 correction sans diagnostic depuis V1.0.0. |
| **Recommandation** | Conserver. Enrichir la grille au fil des sessions (pattern BUG-008+ a ajouter). |

---

## 7. Historique

```
2026-05-01 — V1.1.0
  Audit Niveau 0. Ajout section FAB(3R). Renommage DBM_.

V1.0.0 — Creation initiale.
```

---

## 6. Interactions avec les autres skills

| Situation | Skill |
|---|---|
| Bug detecte apres deploiement | `ftp-deploy-checklist` §5 causes recurrentes |
| Erreur liee a une migration SQL | `sql-migration-bdb` §rollback |
| Violation CDS dans le code corrige | `cds-compliance` |
| Re-audit apres correction | `recettage-bdb` |
