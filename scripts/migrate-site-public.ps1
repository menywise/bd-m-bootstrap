# ============================================================
# migrate-site-public.ps1
# VERSION  : 2.0.0
# DATE     : 2026-04-25
# OBJECTIF : Deplacer pages publiques modules/site/ vers site/
#            Corriger tous les liens. Supprimer modules/site/.
# TERRAIN  : modules/site/site/ N'EXISTE PAS.
#            Les fichiers sont directement dans modules/site/.
# PREREQUIS: Lancer via migrate-site-public.bat
# ATTENTION: Faire un backup USB AVANT (robocopy)
# ============================================================

# --- FILET 1 : trap global ---
trap {
    Write-Host ""
    Write-Host "!!! ERREUR FATALE !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host $_.InvocationInfo.Line.Trim() -ForegroundColor DarkRed
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

$ErrorActionPreference = "Stop"
$ROOT = "C:\DEV\BIBLE_DE_BLOC"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== MIGRATION SITE PUBLIC V2 ===" -ForegroundColor Cyan
Write-Host "    modules/site/ --> site/" -ForegroundColor Cyan
Write-Host ""

# --- VERIFICATION PRE-MIGRATION ---
Write-Host "[0/8] Verification pre-migration..." -ForegroundColor Yellow

$srcDir = Join-Path $ROOT "modules\site"
$destDir = Join-Path $ROOT "site"

if (-not (Test-Path $srcDir)) {
    Write-Host "  ERREUR: $srcDir n'existe pas !" -ForegroundColor Red
    throw "Dossier source introuvable"
}

# Verifier que modules/site/site/ N'EXISTE PAS (terrain confirme)
$ghostDir = Join-Path $srcDir "site"
if (Test-Path $ghostDir) {
    Write-Host "  ATTENTION: modules/site/site/ existe !" -ForegroundColor Red
    Write-Host "  Ce script attend les fichiers dans modules/site/ directement." -ForegroundColor Red
    throw "Structure inattendue -- verifier manuellement"
}

if (Test-Path $destDir) {
    Write-Host "  ERREUR: $destDir existe deja !" -ForegroundColor Red
    throw "Dossier destination deja present -- supprimer ou renommer avant"
}

$htmlFiles = Get-ChildItem -Path $srcDir -Filter "*.html" -File
$jsFiles = Get-ChildItem -Path $srcDir -Filter "*.js" -File
$cssFiles = Get-ChildItem -Path $srcDir -Filter "*.css" -File
$otherFiles = Get-ChildItem -Path $srcDir -File | Where-Object {
    $_.Extension -notin ".html",".js",".css"
}

Write-Host "  HTML     : $($htmlFiles.Count)" -ForegroundColor White
Write-Host "  JS       : $($jsFiles.Count)" -ForegroundColor White
Write-Host "  CSS      : $($cssFiles.Count)" -ForegroundColor White
Write-Host "  Autres   : $($otherFiles.Count)" -ForegroundColor White

foreach ($o in $otherFiles) {
    Write-Host "    $($o.Name)" -ForegroundColor DarkGray
}
Write-Host "  OK" -ForegroundColor Green

# --- CONFIRMATION ---
Write-Host ""
Write-Host "ATTENTION : Cette operation va :" -ForegroundColor Red
Write-Host "  1. Creer site/ a la racine" -ForegroundColor White
Write-Host "  2. Deplacer TOUS les fichiers de modules/site/" -ForegroundColor White
Write-Host "  3. Corriger les chemins relatifs (../../ -> ../)" -ForegroundColor White
Write-Host "  4. Corriger les references dans TOUT le projet" -ForegroundColor White
Write-Host "  5. Ajouter les balises de surface GF-2" -ForegroundColor White
Write-Host "  6. Supprimer modules/site/ entierement" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "As-tu fait ton backup USB ? Continuer ? (O/N)"
if ($confirm -ne "O") {
    Write-Host "Abandon." -ForegroundColor Yellow
    throw "Abandon utilisateur"
}

# --- ETAPE 1 : Creer site/ ---
Write-Host ""
Write-Host "[1/8] Creation de site/..." -ForegroundColor Yellow
New-Item -Path $destDir -ItemType Directory | Out-Null
Write-Host "  OK" -ForegroundColor Green

# --- ETAPE 2 : Deplacer TOUS les fichiers ---
Write-Host "[2/8] Deplacement fichiers..." -ForegroundColor Yellow
$allSrcFiles = Get-ChildItem -Path $srcDir -File
$moveCount = 0
foreach ($f in $allSrcFiles) {
    Move-Item -Path $f.FullName -Destination (Join-Path $destDir $f.Name)
    Write-Host "  $($f.Name)" -ForegroundColor White
    $moveCount++
}
Write-Host "  OK ($moveCount fichiers)" -ForegroundColor Green

# --- ETAPE 3 : Corriger chemins dans fichiers deplaces ---
# Fichiers etaient dans modules/site/ (profondeur 2 depuis racine)
# Maintenant dans site/ (profondeur 1)
# ../../X --> ../X
Write-Host "[3/8] Correction chemins dans fichiers deplaces..." -ForegroundColor Yellow
$siteHtmlFiles = Get-ChildItem -Path $destDir -Filter "*.html" -File
$fixCount = 0
foreach ($f in $siteHtmlFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # Chemins ../../ vers ../ (CSS, JS, images, pages racine)
    $content = $content -replace '\.\./\.\./css/', '../css/'
    $content = $content -replace '\.\./\.\./js/', '../js/'
    $content = $content -replace '\.\./\.\./img/', '../img/'
    $content = $content -replace '\.\./\.\./images/', '../images/'
    $content = $content -replace '\.\./\.\./login\.html', '../login.html'
    $content = $content -replace '\.\./\.\./index\.html', '../index.html'
    $content = $content -replace '\.\./\.\./offline\.html', '../offline.html'
    $content = $content -replace '\.\./\.\./favicon\.ico', '../favicon.ico'
    $content = $content -replace '\.\./\.\./manifest\.json', '../manifest.json'
    $content = $content -replace '\.\./\.\./sw\.js', '../sw.js'

    # Pages legales racine
    $content = $content -replace '\.\./\.\./mentions-legales\.html', '../mentions-legales.html'
    $content = $content -replace '\.\./\.\./politique-confidentialite\.html', '../politique-confidentialite.html'
    $content = $content -replace '\.\./\.\./suppression-compte\.html', '../suppression-compte.html'
    $content = $content -replace '\.\./\.\./contact\.html', '../contact.html'

    # Chemins modules : ../../modules/ --> ../modules/
    $content = $content -replace '\.\./\.\./modules/', '../modules/'

    # En-tete MODULE : modules/site/ --> site/
    $content = $content -replace 'MODULE\s*:\s*modules/site/', 'MODULE   : site/'

    # EXCEPTION-SHELL-SITE commentaire
    $content = $content -replace 'modules/site/', 'site/'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixCount++
        Write-Host "  Corrige : $($f.Name)" -ForegroundColor White
    }
}

# Corriger aussi les JS et CSS deplaces
$siteOtherFiles = Get-ChildItem -Path $destDir -Include "*.js","*.css" -File
foreach ($f in $siteOtherFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $original = $content
    $content = $content -replace '\.\./\.\./js/', '../js/'
    $content = $content -replace '\.\./\.\./css/', '../css/'
    $content = $content -replace 'MODULE\s*:\s*modules/site/', 'MODULE   : site/'
    $content = $content -replace 'modules/site/', 'site/'
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
        $fixCount++
        Write-Host "  Corrige : $($f.Name)" -ForegroundColor White
    }
}
Write-Host "  OK ($fixCount fichiers corriges)" -ForegroundColor Green

# --- ETAPE 4 : Corriger references dans TOUT le projet ---
Write-Host "[4/8] Correction references globales..." -ForegroundColor Yellow
$globalFixCount = 0

# Collecter fichiers a scanner
$scanPaths = @()
$scanPaths += Get-ChildItem -Path $ROOT -Filter "*.html" -File
$robotsPath = Join-Path $ROOT "robots.txt"
if (Test-Path $robotsPath) { $scanPaths += Get-Item $robotsPath }
$jsDir = Join-Path $ROOT "js"
if (Test-Path $jsDir) {
    $scanPaths += Get-ChildItem -Path $jsDir -Filter "*.js" -Recurse -File
}
$modulesDir = Join-Path $ROOT "modules"
$scanPaths += Get-ChildItem -Path $modulesDir -Include "*.html","*.js" -Recurse -File | Where-Object { $_.FullName -notlike "*modules\site\*" }
$atelierPath = Join-Path $ROOT "atelier"
if (Test-Path $atelierPath) {
    $scanPaths += Get-ChildItem -Path $atelierPath -Include "*.html","*.js" -Recurse -File
}
$conseilPath = Join-Path $ROOT "conseil"
if (Test-Path $conseilPath) {
    $scanPaths += Get-ChildItem -Path $conseilPath -Include "*.html","*.js" -Recurse -File
}
$scriptsDir = Join-Path $ROOT "scripts"
if (Test-Path $scriptsDir) {
    $scanPaths += Get-ChildItem -Path $scriptsDir -Filter "*.ps1" -File | Where-Object {
        $_.Name -ne "migrate-site-public.ps1" -and $_.Name -ne "audit-structure-bdb.ps1"
    }
}

foreach ($f in $scanPaths) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    # URLs absolues OVH : /bdb/modules/site/ --> /bdb/site/
    $content = $content -replace '/bdb/modules/site/', '/bdb/site/'

    # Chemins relatifs : modules/site/X --> site/X
    # Regex ciblee : guillemet ou apostrophe avant, puis nom de fichier
    $content = $content -replace '(["\x27])modules/site/([a-z\-_A-Z\.]+)', '$1site/$2'

    # Pattern sans guillemet (robots.txt Allow:)
    $content = $content -replace '(Allow:\s*)/bdb/modules/site/', '$1/bdb/site/'

    # Fantome modules/site/site/
    $content = $content -replace 'modules/site/site/', 'site/'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
        $globalFixCount++
        $short = $f.FullName.Replace($ROOT, "")
        Write-Host "  Corrige : $short" -ForegroundColor White
    }
}
Write-Host "  OK ($globalFixCount fichiers corriges)" -ForegroundColor Green

# --- ETAPE 5 : Balises de surface GF-2 ---
Write-Host "[5/8] Ajout balises de surface GF-2..." -ForegroundColor Yellow
$tagPublic = "<!-- BDB | Surface: SITE-PUBLIC | Auth: aucune | Shell: non -->"
$tagModule = "<!-- BDB | Surface: MODULE | Auth: bdb-shell.js | Shell: oui -->"
$tagSystem = "<!-- BDB | Surface: SYSTEME | Auth: aucune | Shell: non -->"
$tagApp    = "<!-- BDB | Surface: APP-TRANSVERSE | Auth: bdb-shell.js | Shell: oui -->"
$tagL3     = "<!-- BDB | Surface: L3-CREATEUR | Auth: isCreator | Shell: non -->"
$tagRoot   = "<!-- BDB | Surface: APP-RACINE | Auth: login/portail | Shell: non -->"

$tagCount = 0

# site/ = SITE-PUBLIC
if (Test-Path $destDir) {
    foreach ($f in (Get-ChildItem -Path $destDir -Filter "*.html" -File)) {
        $c = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagPublic"
            [System.IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# modules/ = MODULE
if (Test-Path $modulesDir) {
    foreach ($f in (Get-ChildItem -Path $modulesDir -Filter "*.html" -Recurse -File)) {
        $c = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagModule"
            [System.IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# Systeme
$systemPages = @("offline.html","maintenance.html","session-expiree.html","403.html","404.html")
foreach ($p in $systemPages) {
    $pp = Join-Path $ROOT $p
    if (Test-Path $pp) {
        $c = [System.IO.File]::ReadAllText($pp, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagSystem"
            [System.IO.File]::WriteAllText($pp, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# App transverses
$appPages = @("aide.html","onboarding.html","notifications.html","changelog.html",
              "parametres.html","export.html","impressions.html","archivage.html",
              "recherche.html","pending.html")
foreach ($p in $appPages) {
    $pp = Join-Path $ROOT $p
    if (Test-Path $pp) {
        $c = [System.IO.File]::ReadAllText($pp, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagApp"
            [System.IO.File]::WriteAllText($pp, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# Pages legales/publiques racine
$legalPages = @("mentions-legales.html","politique-confidentialite.html",
                "suppression-compte.html","contact.html")
foreach ($p in $legalPages) {
    $pp = Join-Path $ROOT $p
    if (Test-Path $pp) {
        $c = [System.IO.File]::ReadAllText($pp, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagPublic"
            [System.IO.File]::WriteAllText($pp, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# Login / index portail
foreach ($p in @("login.html","index.html")) {
    $pp = Join-Path $ROOT $p
    if (Test-Path $pp) {
        $c = [System.IO.File]::ReadAllText($pp, [System.Text.Encoding]::UTF8)
        if ($c -notmatch "BDB \| Surface:") {
            $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagRoot"
            [System.IO.File]::WriteAllText($pp, $c, [System.Text.Encoding]::UTF8)
            $tagCount++
        }
    }
}

# L3 atelier/ et conseil/
foreach ($dir in @($atelierPath, $conseilPath)) {
    if (Test-Path $dir) {
        foreach ($f in (Get-ChildItem -Path $dir -Filter "*.html" -Recurse -File)) {
            $c = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
            if ($c -notmatch "BDB \| Surface:") {
                $c = $c -replace '(<!DOCTYPE html>)', "`$1`n$tagL3"
                [System.IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
                $tagCount++
            }
        }
    }
}

Write-Host "  OK ($tagCount balises ajoutees)" -ForegroundColor Green

# --- ETAPE 6 : Supprimer modules/site/ ---
Write-Host "[6/8] Suppression modules/site/..." -ForegroundColor Yellow
$remaining = Get-ChildItem -Path $srcDir -Recurse -File -ErrorAction SilentlyContinue
if ($remaining -and $remaining.Count -gt 0) {
    Write-Host "  ATTENTION : $($remaining.Count) fichier(s) restant(s) :" -ForegroundColor Red
    foreach ($r in $remaining) {
        Write-Host "    $($r.Name)" -ForegroundColor Red
    }
    $confirmDel = Read-Host "  Supprimer quand meme ? (O/N)"
    if ($confirmDel -ne "O") {
        Write-Host "  modules/site/ conserve -- a nettoyer manuellement" -ForegroundColor Yellow
    } else {
        Remove-Item -Path $srcDir -Recurse -Force
        Write-Host "  OK (supprime)" -ForegroundColor Green
    }
} else {
    Remove-Item -Path $srcDir -Recurse -Force
    Write-Host "  OK (supprime)" -ForegroundColor Green
}

# --- ETAPE 7 : Verification post-migration ---
Write-Host "[7/8] Verification post-migration..." -ForegroundColor Yellow

$errors = @()

if (Test-Path $srcDir) {
    $errors += "modules/site/ existe encore"
}

if (-not (Test-Path $destDir)) {
    $errors += "site/ n'existe pas"
} else {
    $siteCount = (Get-ChildItem -Path $destDir -Filter "*.html" -File).Count
    if ($siteCount -eq 0) {
        $errors += "site/ est vide"
    } else {
        Write-Host "  site/ contient $siteCount HTML" -ForegroundColor White
    }
}

# Scanner les refs fantomes
$codeToScan = Get-ChildItem -Path $ROOT -Include "*.html","*.js" -Recurse -File | Where-Object {
    $_.FullName -notlike "*node_modules*" -and
    $_.FullName -notlike "*_archives*" -and
    $_.FullName -notlike "*00_GOUVERNANCE*" -and
    $_.FullName -notlike "*_PROJET_CLAUDE*" -and
    $_.FullName -notlike "*DATA_METIER*" -and
    $_.FullName -notlike "*_deltas*" -and
    $_.FullName -notlike "*_atelier*" -and
    $_.FullName -notlike "*outputs*" -and
    $_.Name -ne "migrate-site-public.ps1" -and
    $_.Name -ne "audit-structure-bdb.ps1"
}

if ($codeToScan.Count -gt 0) {
    $phantomRefs = Select-String -Path $codeToScan.FullName -Pattern "modules/site/" -SimpleMatch -ErrorAction SilentlyContinue
    if ($phantomRefs) {
        foreach ($ref in $phantomRefs) {
            $short = $ref.Path.Replace($ROOT, "")
            $errors += "Ref fantome : $short ligne $($ref.LineNumber)"
        }
    }
}

# --- ETAPE 8 : Rapport ---
Write-Host "[8/8] Rapport final..." -ForegroundColor Yellow

if ($errors.Count -eq 0) {
    Write-Host ""
    Write-Host "  === MIGRATION REUSSIE ===" -ForegroundColor Green
    Write-Host "  modules/site/ supprime" -ForegroundColor Green
    Write-Host "  site/ operationnel" -ForegroundColor Green
    Write-Host "  Zero reference fantome dans le code actif" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  === $($errors.Count) PROBLEME(S) ===" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "  - $e" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  Corriger avant deploiement !" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines actions :" -ForegroundColor Yellow
Write-Host "  1. Lancer audit-structure-bdb.bat" -ForegroundColor White
Write-Host "  2. Tester site/index.html en local" -ForegroundColor White
Write-Host "  3. Mettre a jour SURFACE_MAP V1.3.0" -ForegroundColor White
Write-Host "  4. Deployer via FTP" -ForegroundColor White
Write-Host ""
Write-Host "Documentation .md a corriger (non bloquant) :" -ForegroundColor Yellow
Write-Host "  - 00_GOUVERNANCE/*.md" -ForegroundColor White
Write-Host "  - _PROJET_CLAUDE/*.md" -ForegroundColor White
Write-Host "  - _atelier/*.md" -ForegroundColor White
Write-Host "  - atelier/AUDIT_*.md" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}

# --- FILET 3 : Read-Host HORS try/catch ---
Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
