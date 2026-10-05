# PLAN D'OPTIMISATION WORKFLOW BDB
```
VERSION : 1.0.0
DATE    : 2026-03-21
```

---

## 1. PROJET CLAUDE — Restructuration

### 1.1 Fichiers à REMPLACER (supprimer l'ancien + ajouter le nouveau)

| Supprimer du projet | Ajouter au projet |
|---|---|
| JOURNAL_DECISIONS_V1_9_0.md | JOURNAL_DECISIONS_V1_12_0.md |
| CHANTIER_TECHNIQUE_V1_0_5.md | CHANTIER_TECHNIQUE_V1_0_6.md |

### 1.2 Fichiers à AJOUTER

| Fichier | Taille | Rôle |
|---|---|---|
| AUDIT_SECURITE_BDB_V1_0_0.md | ~12K | RLS, menaces, plan sécurité |
| TEMPLATE_CTX_MODULE_V1_2_0.md | ~3K | Convention TRACKER_* |
| CTX_FICHES_V3_1_0.md | ~12K | Module référence C.9 |
| CTX_SITE.md | ~8K | Mini-site + personas mapping |
| CTX_TEMPLATE_VIERGE.md | ~5K | Template module |
| BACKLOG_SESSIONS.md | ~2K | Suivi prompts à exécuter |

### 1.3 Fichiers à GARDER tels quels

NOYAU_VERITE_V2_4_0.md · SUPABASE_DATA_MODEL_V1_4_0.md ·
CTX_SYSTEM_ARCHITECTURE_V2_1_0.md · PERSONAS_BDB_V1_3_0.md ·
BIBLE_DE_BLOC_V1_0_3.md · GUIDE_TRAVAIL_SESSION_V1_2_1.md ·
GUIDE_INTEGRATION_MODULE_V1_0_1.md · MODULE_DEPENDENCY_MAP_V1_2_0.md ·
JOURNAL_APPEND_P5_P6.md

### 1.4 Résultat cible : 17 fichiers dans le projet

L'avantage : `project_knowledge_search` fouille dedans automatiquement.
Plus besoin de joindre 8 fichiers par session.

### 1.5 Ajouter les CTX au fur et à mesure

Chaque fois qu'un CTX est créé ou mis à jour → l'ajouter au projet.
Objectif : tous les CTX dans le projet = zéro fichier à joindre sauf le code source.

---

## 2. PROMPTS ALLÉGÉS — Nouvelle convention

### Avant (50 lignes + 8 fichiers joints)

```
SESSION BDB — Migration bdb-shell : fiches
FICHIERS À JOINDRE :
  1. NOYAU_VERITE_V2_4_0.md
  2. JOURNAL_DECISIONS_V1_12_0.md
  3. CHANTIER_TECHNIQUE_V1_0_6.md
  4. CTX_FICHES_V3_1_0.md
  5. modules/fiches/index.html
  ... etc
```

### Après (3 lignes + 1 fichier joint)

```
SESSION BDB — Migration bdb-shell : transmissions
Joindre : modules/transmissions/index.html
```

C'est tout. Le projet contient le JOURNAL, le CHANTIER, le CTX.
Claude les cherche via project_knowledge_search quand il en a besoin.

### Convention prompt allégé

```
SESSION BDB — [OBJECTIF] : [MODULE]
Joindre : [seulement les fichiers source à modifier]
Contexte spécifique : [si nécessaire, 1-2 lignes max]
```

### Fichiers à joindre = UNIQUEMENT le code source terrain

- index.html du module
- CSS du module
- Fichiers JS spécifiques (si existants)
- Nouveaux CTX non encore dans le projet

Tout le reste est dans le projet.

---

## 3. ARCHITECTURE WINDOWS — Optimisations

### 3.1 Structure disque actuelle (confirmée)

```
C:\DEV\BIBLE_DE_BLOC\
├── 00_GOUVERNANCE\          ← docs de gouvernance
├── 01_TEMPLATES\            ← templates HTML/SQL/CTX
├── 02_INFRASTRUCTURE\       ← Supabase, scripts
│   └── SUPABASE\
│       └── migrations\      ← À CRÉER (Phase 0 session admin)
├── css\                     ← CSS modules
├── js\                      ← JS socle
├── modules\                 ← 24 modules
├── login.html
├── index.html               ← portail
├── 403.html / 404.html      ← pages erreur
├── SESSION_STATE.md          ← généré par tracker
└── bdb_tracker.html          ← outil audit
```

### 3.2 Créer un script de sync rapide

Fichier : `C:\DEV\BIBLE_DE_BLOC\sync-projet-claude.ps1`

```powershell
# Sync automatique des fichiers gouvernance vers le dossier
# que tu uploades dans le projet Claude.
# Exécuter après chaque session qui modifie un fichier de gouvernance.

$src = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
$dst = "C:\DEV\BIBLE_DE_BLOC\_PROJET_CLAUDE"

# Créer le dossier cible s'il n'existe pas
New-Item -ItemType Directory -Force -Path $dst | Out-Null

# Liste des fichiers à synchroniser
$files = @(
    "NOYAU_VERITE_V2_4_0.md",
    "JOURNAL_DECISIONS_V1_12_0.md",
    "CHANTIER_TECHNIQUE_V1_0_6.md",
    "SUPABASE_DATA_MODEL_V1_4_0.md",
    "CTX_SYSTEM_ARCHITECTURE_V2_1_0.md",
    "PERSONAS_BDB_V1_3_0.md",
    "BIBLE_DE_BLOC_V1_0_3.md",
    "GUIDE_TRAVAIL_SESSION_V1_2_1.md",
    "GUIDE_INTEGRATION_MODULE_V1_0_1.md",
    "MODULE_DEPENDENCY_MAP_V1_2_0.md",
    "JOURNAL_APPEND_P5_P6.md",
    "AUDIT_SECURITE_BDB_V1_0_0.md",
    "TEMPLATE_CTX_MODULE_V1_2_0.md",
    "CTX_FICHES_V3_1_0.md",
    "CTX_SITE.md",
    "CTX_TEMPLATE_VIERGE.md",
    "BACKLOG_SESSIONS.md"
)

$copied = 0
foreach ($f in $files) {
    $srcFile = Join-Path $src $f
    if (Test-Path $srcFile) {
        Copy-Item $srcFile $dst -Force
        $copied++
    } else {
        Write-Host "⚠ ABSENT : $f" -ForegroundColor Yellow
    }
}
Write-Host "✅ $copied/$($files.Count) fichiers synchronisés vers _PROJET_CLAUDE\" -ForegroundColor Green
Write-Host "→ Uploader le contenu de _PROJET_CLAUDE\ dans les Project Knowledge de Claude" -ForegroundColor Cyan
```

### 3.3 Script de vérification pré-FTP (OVH)

Fichier : `C:\DEV\BIBLE_DE_BLOC\check-before-ftp.ps1`

```powershell
# Vérification avant déploiement FTP OVH
# Exécuter AVANT chaque upload FTP

$root = "C:\DEV\BIBLE_DE_BLOC"
$errors = 0

Write-Host "`n═══ CHECK PRÉ-DÉPLOIEMENT OVH ═══`n" -ForegroundColor Cyan

# .htaccess présent ?
if (Test-Path "$root\.htaccess") {
    Write-Host "✅ .htaccess racine présent" -ForegroundColor Green
} else {
    Write-Host "❌ .htaccess racine ABSENT" -ForegroundColor Red; $errors++
}

# .htaccess gouvernance ?
if (Test-Path "$root\00_GOUVERNANCE\.htaccess") {
    Write-Host "✅ .htaccess 00_GOUVERNANCE présent" -ForegroundColor Green
} else {
    Write-Host "❌ .htaccess 00_GOUVERNANCE ABSENT" -ForegroundColor Red; $errors++
}

# config.js ne doit PAS être dans le FTP
if (Test-Path "$root\js\config.js") {
    Write-Host "⚠ config.js existe sur disque — NE PAS UPLOADER sur OVH" -ForegroundColor Yellow
}

# Fichiers .md/.sql ne doivent pas être uploadés
$dangereux = Get-ChildItem $root -Recurse -Include *.md,*.sql -File |
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*_PROJET_CLAUDE*" }
Write-Host "`n⚠ $($dangereux.Count) fichiers .md/.sql sur disque — NE PAS UPLOADER" -ForegroundColor Yellow

# 403.html et 404.html
foreach ($f in @("403.html", "404.html")) {
    if (Test-Path "$root\$f") {
        Write-Host "✅ $f présent" -ForegroundColor Green
    } else {
        Write-Host "❌ $f ABSENT" -ForegroundColor Red; $errors++
    }
}

# robots.txt (racine domaine — pas dans bdb/)
Write-Host "`n⚠ Vérifier manuellement : robots.txt à la RACINE du domaine OVH (pas dans bdb/)" -ForegroundColor Yellow

if ($errors -eq 0) {
    Write-Host "`n✅ Prêt pour FTP — 0 erreur bloquante" -ForegroundColor Green
} else {
    Write-Host "`n❌ $errors erreur(s) — CORRIGER AVANT FTP" -ForegroundColor Red
}
```

---

## 4. PROFIL CLAUDE — Personnalisation recommandée

Tes préférences actuelles dans Claude :

```
Pas de formule de politesse.
Phrases courtes autant que possible pour limiter le gaspillage de token.
Mon profil DISC = D (précis et direct)
Par exemple, réponds simplement "Ok Manu" quand tu es en attente d'une suite ou que je te demande de ne rien faire
```

### Ajouts recommandés (Settings > Profile > User Preferences)

```
Pas de formule de politesse.
Phrases courtes. Zéro gaspillage de token.
Profil DISC = D (précis, direct, orienté résultat).
Répondre "Ok Manu" quand en attente ou si je demande de ne rien faire.

Contexte professionnel :
  Développeur solo. Projet BDB (Bible de Bloc) — app hospitalière.
  Stack : HTML/JS/CSS vanilla + Bootstrap 5.3.2 + Supabase cloud.
  Windows uniquement. Éditeur local. FTP OVH pour prod.
  Pas de React. Pas de Node. Pas de build tool.

Conventions de travail :
  Toujours chercher dans le projet (project_knowledge_search) AVANT de répondre.
  Ne jamais inventer un schéma DB ou une colonne — vérifier dans SUPABASE_DATA_MODEL.
  Ne jamais modifier bdb-shell.js, supabase-client.js, cds-overrides.css sans accord explicite.
  Terme APP_CDT = BANNI. Application = BDB. Framework = CDS.
  escHtml() obligatoire sur tout innerHTML avec donnée DB.
  Toute async DOM = 3 états (loading/empty/error).
  Tout SQL cloud = fichier .sql AVANT exécution.

Format de livraison :
  Fichiers complets (pas d'extraits). Un fichier = un create_file.
  Audit post-production systématique (grep violations).
  Résumé des modifications en tableau à la fin.

En clôture de session :
  Mettre à jour les fichiers de gouvernance impactés.
  Proposer les entrées JOURNAL_DECISIONS.
  Mettre à jour BACKLOG_SESSIONS.md si session planifiée.
```

---

## 5. TIPS WORKFLOW EXPERT

### 5.1 Une conversation = un objectif

Ne pas empiler migration + sécurité + audit + admin dans la même conversation.
Le contexte sature → régressions. Cette session était une exception (productive mais longue).

Règle : si le prompt fait plus de 20 lignes → c'est une session complète, pas un ajout.

### 5.2 Joindre le minimum, chercher le maximum

Avec le projet à jour, la seule chose à joindre est le fichier source à modifier.
Claude cherche le CTX, le CHANTIER, le JOURNAL via project_knowledge_search.

Si Claude dit "je n'ai pas l'information" → répondre "cherche dans le projet".

### 5.3 Versionner les fichiers de gouvernance localement

Après chaque session productive :
1. Exécuter `sync-projet-claude.ps1`
2. Dans Claude.ai → Project Settings → remplacer les fichiers périmés
3. Supprimer les anciennes versions du projet

### 5.4 Le tracker comme point d'entrée

Workflow quotidien :
1. Ouvrir `bdb_tracker.html` → scanner
2. Regarder les violations
3. Ouvrir une conversation Claude avec le module à corriger
4. Le tracker écrit SESSION_STATE.md → joinable si besoin

### 5.5 Nommer les conversations

```
BDB — Migration shell transmissions
BDB — Sécurité auto-logout
BDB — Admin Phase 0 migrations SQL
```

Pas : "Aide avec mon projet" ou "Session 47".
Les noms permettent de retrouver le contexte dans l'historique.

### 5.6 Le profil Claude persiste, les projets persistent, les conversations non

Prioriser :
- Profil (userPreferences) → toujours actif, zéro token
- Projet (knowledge) → cherché à la demande, coût faible
- Fichiers joints → dernier recours, coût élevé
- Conversation longue → éviter, contexte se dégrade

---

## 6. ACTIONS IMMÉDIATES — CHECKLIST

```
□ 1. Mettre à jour le profil Claude (copier §4 ci-dessus)
□ 2. Dans le projet Claude :
     □ Supprimer JOURNAL_DECISIONS_V1_9_0.md
     □ Supprimer CHANTIER_TECHNIQUE_V1_0_5.md
     □ Ajouter JOURNAL_DECISIONS_V1_12_0.md
     □ Ajouter CHANTIER_TECHNIQUE_V1_0_6.md
     □ Ajouter AUDIT_SECURITE_BDB_V1_0_0.md
     □ Ajouter TEMPLATE_CTX_MODULE_V1_2_0.md
     □ Ajouter CTX_FICHES_V3_1_0.md
     □ Ajouter CTX_SITE.md
     □ Ajouter CTX_TEMPLATE_VIERGE.md
     □ Ajouter BACKLOG_SESSIONS.md
□ 3. Créer C:\DEV\BIBLE_DE_BLOC\_PROJET_CLAUDE\ (dossier local miroir)
□ 4. Créer sync-projet-claude.ps1
□ 5. Créer check-before-ftp.ps1
□ 6. Réécrire les 3 prompts en version allégée (voir §2)
□ 7. Nommer cette conversation : "BDB — Optimisation workflow 2026-03-21"
```
