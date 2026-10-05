# ============================================================
# audit-structure-bdb.ps1
# VERSION  : 1.1.0
# DATE     : 2026-04-25
# OBJECTIF : Garde-fou structurel BDB. Verifier que l'arborescence
#            est lisible sans ambiguite par humain ou IA.
#            Resultat binaire : PASS ou FAIL.
# DELTA    : V1.1.0 - GF-4 cherche src= (pas simple mention)
#            GF-5 exclut _trash_, back-office/, bernard/, _TEMPLATE_*
# PREREQUIS: Lancer via audit-structure-bdb.bat
# USAGE    : Avant chaque deploiement FTP
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

# --- Dossiers exclus de tous les scans ---
# Gouvernance, archives, trash, templates, back-office, bernard
# Ces dossiers ne sont pas deployes et ne polluent pas l'audit
function Test-Excluded($filePath) {
    $excluded = @(
        "*\node_modules\*",
        "*\_archives*",
        "*\00_GOUVERNANCE*",
        "*\_PROJET_CLAUDE*",
        "*\DATA_METIER*",
        "*\_deltas*",
        "*\_atelier*",
        "*\_trash_*",
        "*\back-office\*",
        "*\bernard\*",
        "*\outputs\*",
        "*\.min.js",
        "*\.min.css"
    )
    foreach ($pattern in $excluded) {
        if ($filePath -like $pattern) { return $true }
    }
    # Templates racine (_TEMPLATE_*)
    $name = Split-Path $filePath -Leaf
    if ($name -like "_TEMPLATE_*") { return $true }
    return $false
}

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== AUDIT STRUCTURE BDB V1.1.0 ===" -ForegroundColor Cyan
Write-Host "    Garde-fou anti-hallucination" -ForegroundColor Cyan
Write-Host ""

$violations = @()

# ---------------------------------------------------------------
# REGLE 1 : modules/site/ NE DOIT PAS EXISTER
# ---------------------------------------------------------------
Write-Host "[1/7] GF-1 : modules/site/ interdit..." -ForegroundColor Yellow
$forbidden = Join-Path $ROOT "modules\site"
if (Test-Path $forbidden) {
    $violations += "GF-1 FAIL : modules/site/ existe encore"
    Write-Host "  FAIL" -ForegroundColor Red
} else {
    Write-Host "  PASS" -ForegroundColor Green
}

# ---------------------------------------------------------------
# REGLE 2 : ZERO reference a modules/site/ dans le code
# ---------------------------------------------------------------
Write-Host "[2/7] GF-2 : Zero ref 'modules/site/' dans HTML/JS/CSS..." -ForegroundColor Yellow

$codeFiles = Get-ChildItem -Path $ROOT -Include "*.html","*.js","*.css" -Recurse -File | Where-Object {
    -not (Test-Excluded $_.FullName)
}

$phantoms = @()
if ($codeFiles.Count -gt 0) {
    $phantoms = Select-String -Path $codeFiles.FullName -Pattern "modules/site/" -SimpleMatch -ErrorAction SilentlyContinue
}
if ($phantoms -and $phantoms.Count -gt 0) {
    foreach ($p in $phantoms) {
        $short = $p.Path.Replace($ROOT, "")
        $line = $p.Line.Trim()
        if ($line.Length -gt 80) { $line = $line.Substring(0, 80) }
        $violations += "GF-2 FAIL : $short ligne $($p.LineNumber) -> $line"
    }
    Write-Host "  FAIL ($($phantoms.Count) ref)" -ForegroundColor Red
} else {
    Write-Host "  PASS" -ForegroundColor Green
}

# ---------------------------------------------------------------
# REGLE 3 : site/ EXISTE et contient des HTML
# ---------------------------------------------------------------
Write-Host "[3/7] GF-3 : site/ existe et non vide..." -ForegroundColor Yellow
$siteDir = Join-Path $ROOT "site"
if (-not (Test-Path $siteDir)) {
    $violations += "GF-3 FAIL : site/ n'existe pas"
    Write-Host "  FAIL" -ForegroundColor Red
} else {
    $siteHtmlCount = (Get-ChildItem -Path $siteDir -Filter "*.html" -File).Count
    if ($siteHtmlCount -eq 0) {
        $violations += "GF-3 FAIL : site/ est vide"
        Write-Host "  FAIL" -ForegroundColor Red
    } else {
        Write-Host "  PASS ($siteHtmlCount HTML)" -ForegroundColor Green
    }
}

# ---------------------------------------------------------------
# REGLE 4 : Aucun fichier dans site/ ne CHARGE bdb-shell.js
#            On cherche src="...bdb-shell..." pas un simple commentaire
# ---------------------------------------------------------------
Write-Host "[4/7] GF-4 : site/ = zero chargement bdb-shell.js..." -ForegroundColor Yellow
if (Test-Path $siteDir) {
    $siteHtmls = Get-ChildItem -Path $siteDir -Filter "*.html" -File | Where-Object {
        $_.Name -notlike "_TEMPLATE_*"
    }
    $shellLoaded = @()
    if ($siteHtmls.Count -gt 0) {
        # Chercher <script src="...bdb-shell..." (chargement reel)
        $shellLoaded = Select-String -Path $siteHtmls.FullName -Pattern 'src=.*bdb-shell' -ErrorAction SilentlyContinue
    }
    if ($shellLoaded -and $shellLoaded.Count -gt 0) {
        foreach ($s in $shellLoaded) {
            $violations += "GF-4 FAIL : $($s.Filename) charge bdb-shell.js (page publique !)"
        }
        Write-Host "  FAIL ($($shellLoaded.Count) fichier(s))" -ForegroundColor Red
    } else {
        Write-Host "  PASS" -ForegroundColor Green
    }
} else {
    Write-Host "  SKIP (site/ absent)" -ForegroundColor DarkGray
}

# ---------------------------------------------------------------
# REGLE 5 : Tous les HTML deployes ont une balise de surface GF-2
#            Exclut : _trash_, back-office/, bernard/, _TEMPLATE_*,
#            _dev/, 01_TEMPLATES/, _PROJET_CLAUDE/
# ---------------------------------------------------------------
Write-Host "[5/7] GF-5 : Balises de surface presentes..." -ForegroundColor Yellow
$missingTags = @()

$allProjectHtml = Get-ChildItem -Path $ROOT -Filter "*.html" -Recurse -File | Where-Object {
    -not (Test-Excluded $_.FullName) -and
    $_.FullName -notlike "*\_dev\*" -and
    $_.FullName -notlike "*\01_TEMPLATES\*" -and
    $_.FullName -notlike "*\02_INFRASTRUCTURE\*"
}

foreach ($f in $allProjectHtml) {
    $head = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($head -notmatch "BDB \| Surface:") {
        $short = $f.FullName.Replace($ROOT, "")
        $missingTags += $short
    }
}

if ($missingTags.Count -gt 0) {
    foreach ($m in $missingTags) {
        $violations += "GF-5 FAIL : $m sans balise de surface"
    }
    Write-Host "  FAIL ($($missingTags.Count) fichier(s))" -ForegroundColor Red
} else {
    Write-Host "  PASS" -ForegroundColor Green
}

# ---------------------------------------------------------------
# REGLE 6 : Aucun fichier dans modules/ sans bdb-shell
#            Exception : admin-*.html (standalone backend pattern)
# ---------------------------------------------------------------
Write-Host "[6/7] GF-6 : modules/ = tous avec bdb-shell..." -ForegroundColor Yellow
$modulesDir = Join-Path $ROOT "modules"
if (Test-Path $modulesDir) {
    $moduleHtmls = Get-ChildItem -Path $modulesDir -Filter "*.html" -Recurse -File | Where-Object {
        -not (Test-Excluded $_.FullName)
    }
    $noShellCount = 0
    foreach ($f in $moduleHtmls) {
        $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        if ($content -notmatch 'bdb-shell') {
            if ($f.Name -notmatch '^admin-') {
                $short = $f.FullName.Replace($ROOT, "")
                $violations += "GF-6 WARN : $short dans modules/ sans bdb-shell"
                $noShellCount++
            }
        }
    }
    if ($noShellCount -eq 0) {
        Write-Host "  PASS" -ForegroundColor Green
    } else {
        Write-Host "  WARN ($noShellCount fichier(s))" -ForegroundColor Yellow
    }
} else {
    Write-Host "  SKIP (modules/ absent)" -ForegroundColor DarkGray
}

# ---------------------------------------------------------------
# REGLE 7 : Zero chemin site/site/ nulle part
# ---------------------------------------------------------------
Write-Host "[7/7] GF-7 : Zero 'site/site/' dans le code..." -ForegroundColor Yellow
$doubleSite = @()
if ($codeFiles.Count -gt 0) {
    $doubleSite = Select-String -Path $codeFiles.FullName -Pattern "site/site/" -SimpleMatch -ErrorAction SilentlyContinue
}
if ($doubleSite -and $doubleSite.Count -gt 0) {
    foreach ($d in $doubleSite) {
        $short = $d.Path.Replace($ROOT, "")
        $violations += "GF-7 FAIL : $short ligne $($d.LineNumber) contient site/site/"
    }
    Write-Host "  FAIL ($($doubleSite.Count) ref)" -ForegroundColor Red
} else {
    Write-Host "  PASS" -ForegroundColor Green
}

# ---------------------------------------------------------------
# BILAN
# ---------------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

$failCount = ($violations | Where-Object { $_ -match "FAIL" }).Count
$warnCount = ($violations | Where-Object { $_ -match "WARN" }).Count

if ($violations.Count -eq 0) {
    Write-Host "  AUDIT STRUCTURE : PASS" -ForegroundColor Green
    Write-Host "  Zero violation. Deploiement autorise." -ForegroundColor Green
} else {
    if ($failCount -gt 0) {
        Write-Host "  AUDIT STRUCTURE : FAIL" -ForegroundColor Red
        Write-Host "  $failCount violation(s) bloquante(s)" -ForegroundColor Red
    }
    if ($warnCount -gt 0) {
        Write-Host "  $warnCount avertissement(s)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "  Detail :" -ForegroundColor White
    foreach ($v in $violations) {
        if ($v -match "FAIL") {
            Write-Host "  - $v" -ForegroundColor Red
        } else {
            Write-Host "  - $v" -ForegroundColor Yellow
        }
    }

    if ($failCount -gt 0) {
        Write-Host ""
        Write-Host "  DEPLOIEMENT INTERDIT tant que les FAIL ne sont pas corriges." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}

# --- FILET 3 : Read-Host HORS try/catch ---
Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
