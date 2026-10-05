# CREATOR_SPACE — Espace créateur BDB
```
VERSION  : 1.2.0
DATE     : 2026-04-11
AUTEUR   : Manu
STATUT   : SOURCE DE VÉRITÉ — charger quand une conversation touche à la navigation créateur
RÔLE     : Empêche Claude d'halluciner de nouveaux fichiers créateur.
           Toute proposition de nouveau fichier/outil créateur doit d'abord vérifier ce document.
LOCALISATION : C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\04_CREATOR_SPACE_V1_2_0.md
DELTA v1.0.0 → v1.1.0 : cockpit.html déplacé racine → atelier\ (cohérence espace créateur).
DELTA v1.1.0 → v1.2.0 : conseil\ ajouté (L3 local validation — 5 lunettes, Brigitte, Ewan).
```

---

## RÈGLE ABSOLUE

**Claude ne propose JAMAIS un nouveau fichier créateur sans avoir cherché dans ce document.**
Si l'outil existe → l'indiquer. Si l'outil manque → argumenter AVANT de créer.

---

## ARCHITECTURE CRÉATEUR — VUE D'ENSEMBLE

```
CRÉATEUR (Manu)
│
├── LOCAL UNIQUEMENT (jamais déployé sur OVH)
│   │
│   ├── conseil\                      ← Validation L3 — 5 lunettes, Brigitte, Ewan
│   │   ├── index.html                ← Hub double-clic (ouverture locale)
│   │   ├── DOCTRINE.md
│   │   ├── WORKFLOW.md               ← 6 étapes + anti-collision
│   │   ├── lunettes\                 ← Détail chaque lunette
│   │   ├── prompts\
│   │   │   ├── PERPLEXITY.md         ← Prompt Brigitte (lunette MARCHÉ)
│   │   │   └── GEMINI.md             ← Prompt Ewan (lunette ARCHITECTURE)
│   │   ├── templates\
│   │   │   ├── SOUMISSION.md
│   │   │   └── RAPPORT.md
│   │   ├── soumissions\              ← Livrables soumis
│   │   ├── verdicts\                 ← Rapports fragilités archivés
│   │   └── corrections\              ← Versions corrigées
│   │
│   └── scripts\                      ← Scripts PS1/BAT/PY ops
│
└── ONLINE — atelier\                 ← Hub créateur en ligne. Auth admin obligatoire.
    ├── index.html                    ← Portail L3 (liste tous les outils)
    ├── cockpit.html                  ← KPIs/scripts/gouvernance — LOCAL UNIQUEMENT
    ├── session-ia.html               ← Gouvernance sessions Claude
    ├── diagnostic.html               ← Tests Supabase / auth / schéma
    ├── schema-audit.html             ← information_schema vs DATA_MODEL
    ├── memo.html                     ← Antisèche + penses-bêtes Supabase
    ├── overview.html                 ← Vue dynamique modules / roadmap
    ├── compat.html                   ← Audit Safari/iOS
    └── ccam.html                     ← Validation codes CCAM
```

---

## CONSEIL\ — L3 VALIDATION LOCALE

**Chemin :** `C:\DEV\BIBLE_DE_BLOC\conseil\`
**Accès :** Double-clic `conseil\index.html` — local uniquement
**Déployé OVH :** JAMAIS
**Skill :** `conseil-bdb` (dans projet Claude AI)

### Rôle
Système de validation par 5 lunettes avant tout livrable significatif.
Simule les voix qui cassent ce qui est mal construit — avant que le terrain le fasse.

### Les 5 lunettes

| Lunette | Voix | Question | IA externe |
|---|---|---|---|
| TERRAIN | Sabine, Franck, Julie | Ça tient dans le chaos réel du bloc ? | — |
| ARCHITECTURE | Ewan (dev senior) | Ça tient sans moi dans 6 mois ? | **Gemini** |
| MARCHÉ | Brigitte (DSI CHU) | Brigitte signe demain matin ? | **Perplexity** |
| PHILOSOPHIE | Manifeste, Participatif | Ça respecte ce pour quoi BDB existe ? | — |
| CRÉATEUR | Manu (DISC D) | C'est premium, vérifié, non-complaisant ? | — |

### Workflow (résumé)
```
1. Auto-diagnostic Claude (5 lunettes)
2. Soumission externe si P1 → Perplexity (Brigitte) + Gemini (Ewan)
3. Rapport fragilités consolidé P1/P2/P3
4. Livrable V2 corrigé avec diff explicite
5. Archivage : conseil/verdicts/ + atelier_decisions
```

### Déclenchement obligatoire
- Migration SQL avec DDL (CREATE / ALTER / DROP)
- Nouveau module HTML
- Décision d'architecture (tables, triggers, RLS, flux auth)
- Tout livrable qui peut casser l'app si mal exécuté

---

## HUB CRÉATEUR ONLINE — ATELIER\

**URL :** `https://hashtag.manuelrohaut.fr/bdb/atelier/`
**Chemin local :** `C:\DEV\BIBLE_DE_BLOC\atelier\`
**Accès :** Auth Supabase obligatoire, rôle `admin`
**Déployé OVH :** OUI — sauf `cockpit.html`

### Outils disponibles (AT_OUTILS dans atelier-app.js)

| ID | Titre | Fichier | OVH | Rôle |
|---|---|---|---|---|
| session-ia | Session IA | `session-ia.html` | ✅ | Gouvernance sessions Claude |
| diagnostic | Diagnostic | `diagnostic.html` | ✅ | Tests Supabase / auth / schéma |
| schema-audit | Audit Schéma | `schema-audit.html` | ✅ | information_schema vs DATA_MODEL |
| memo | Mémo | `memo.html` | ✅ | Antisèche + penses-bêtes Supabase |
| overview | Overview | `overview.html` | ✅ | Vue dynamique modules / roadmap |
| compat | Compat | `compat.html` | ✅ | Audit Safari/iOS |
| ccam | CCAM | `ccam.html` | ✅ | Validation codes CCAM |
| cockpit | Cockpit | `cockpit.html` | ❌ LOCAL | Scripts, gouvernance, KPIs |
| conseil | Conseil | `../conseil/index.html` | ❌ LOCAL | 5 lunettes — validation livrable |

### cockpit.html — règles spécifiques
- Généré par `scripts\build-cockpit.ps1` → sortie `atelier\cockpit.html`
- Jamais déployé — exclure dans `check-before-ftp.ps1`
- Chemins relatifs générés : `../css/`, `../index.html`, `../modules/`

### Ajouter un outil atelier
Modifier uniquement `atelier/atelier-app.js` → tableau `AT_OUTILS`.
Statuts valides : `'beta'` | `'migration'` | `'local'`

---

## SCRIPTS — INVENTAIRE CANONIQUE

**Dossier :** `C:\DEV\BIBLE_DE_BLOC\scripts\`
**Règle :** 1 script PS1 = 1 lanceur BAT.

| Script | Rôle | Catégorie |
|---|---|---|
| `build-cockpit.ps1` + `.bat` | Génère `atelier\cockpit.html` | Gouvernance |
| `audit-gouvernance.ps1` + `.bat` | Détecte doublons, deltas non appliqués | Audit |
| `audit-racine.ps1` + `.bat` | Audite les fichiers à la racine | Audit |
| `audit-ux-premium.ps1` + `.bat` | Scanne violations UX Premium | Audit |
| `AUDIT_BDB_HTML_PATTERNS.ps1` + `.bat` | Patterns HTML non conformes | Audit |
| `check-before-ftp.ps1` + `.bat` | Vérification AVANT déploiement OVH | Deploy |
| `claude-code-blitz.ps1` + `.bat` | Lancer N fenêtres Claude Code en parallèle | Claude Code |
| `claude-launcher.hta` | Lanceur HTA natif Windows | Claude Code |
| `clean-gouvernance.ps1` + `.bat` | Archiver fichiers gouvernance obsolètes | Gouvernance |
| `compare-claude.ps1` + `.bat` | Comparer gouvernance locale vs _PROJET_CLAUDE | Sync |
| `fix-cdn-latest.ps1` + `.bat` | Remplacer @latest par hash figé | Fix |
| `fix-dev-paths.ps1` + `.bat` | Corriger chemins relatifs | Fix |
| `fix-ux-batch-a.ps1` + `.bat` | Corrections UX12 + UX27 + UX23 | Fix |
| `inject-auth-users.ps1` + `.bat` | Injection utilisateurs auth Supabase | Admin |
| `start-bdb.ps1` + `.bat` | Démarrage environnement BDB après reboot | Ops |
| `sync-projet-claude.ps1` + `.bat` | Synchronise 00_GOUVERNANCE → _PROJET_CLAUDE | Sync |
| `update-instances-stats.ps1` + `.bat` | Met à jour instances-stats.js | Deploy |

---

## CE QUI N'EXISTE PAS (ET NE DOIT PAS ÊTRE RECRÉÉ)

| Fichier / Dossier | Statut | Note |
|---|---|---|
| `_dev\` | **SUPPRIMÉ** | Ne pas recréer. Outils créateur = `atelier\` + `conseil\` |
| `admin-test.html` | **SUPPRIMÉ** | Remplacé par `atelier/diagnostic.html` |
| `admin-overview.html` | **SUPPRIMÉ** | Remplacé par `atelier/overview.html` |
| `admin-memo.html` | **SUPPRIMÉ** | Remplacé par `atelier/memo.html` |
| `sync-dashboard.html` | **JAMAIS CRÉÉ** | Hallucination. Sync = `compare-claude.ps1` |
| `cockpit.html` à la racine | **DÉPLACÉ** → `atelier\` | Ne pas recréer à la racine |

---

## DOSSIERS STRUCTURELS ATTENDUS

| Dossier | Rôle | Sur OVH |
|---|---|---|
| `00_GOUVERNANCE\` | Docs autoritaires .md | NON |
| `_PROJET_CLAUDE\` | Copie sync pour Claude AI project | NON |
| `atelier\` | Hub créateur online + outils locaux | OUI (sauf cockpit.html) |
| `conseil\` | Validation L3 — 5 lunettes | NON |
| `assets\` | Images, icônes | OUI |
| `css\` | CSS globaux | OUI |
| `js\` | Socle JS | OUI |
| `migrations\` | Fichiers .sql numérotés | NON |
| `modules\` | Un dossier par module | OUI |
| `scripts\` | Scripts PS1/BAT/PY ops | NON |
| `supabase\` | Config Supabase CLI | NON |

---

## RÈGLES DE NAVIGATION CRÉATEUR

1. **Valider un livrable avant exécution** → `conseil\index.html` (local)
2. **Envoyer à Perplexity (Brigitte)** → copier `conseil\prompts\PERPLEXITY.md` + soumission
3. **Envoyer à Gemini (Ewan)** → copier `conseil\prompts\GEMINI.md` + soumission
4. **Outils créateur online** → `atelier/` (OVH, auth admin)
5. **Cockpit local** → `atelier\cockpit.html` (généré par build-cockpit.bat)
6. **Sync gouvernance → Claude AI** → `scripts\sync-projet-claude.bat`
7. **Claude hallucine un fichier** → refuser, corriger avec ce document

---

## MODIFICATIONS PENDANTES (build-cockpit.ps1)

```powershell
$OUTPUT = "$ROOT\atelier\cockpit.html"   # ← était $ROOT\cockpit.html
```
Chemins relatifs à corriger : `css/` → `../css/` | `index.html` → `../index.html` | `modules/` → `../modules/`

`check-before-ftp.ps1` : ajouter `cockpit.html` en liste de blocage atelier.

---

## MISE À JOUR DE CE DOCUMENT

À chaque ajout/suppression d'outil atelier, script, ou dossier structurel.
