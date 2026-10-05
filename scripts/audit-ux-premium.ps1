# ============================================================
# audit-ux-premium.ps1
# VERSION  : 1.2.0
# DATE     : 2026-04-05
# OBJECTIF : Audit UX Premium BDB - scanne les modules pour violations
# PREREQUIS: Lancer via audit-ux-premium.bat
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
$MODULES = "$ROOT\modules"
$SOCLE_JS = "$ROOT\js"
$SOCLE_CSS = "$ROOT\css"
$REPORT = "$ROOT\scripts\AUDIT_UX_PREMIUM_REPORT.txt"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== AUDIT UX PREMIUM BDB ===" -ForegroundColor Cyan
Write-Host "Racine : $ROOT" -ForegroundColor DarkGray
Write-Host ""

$violations = @()
$stats = @{}

# ============================================================
# HELPERS
# ============================================================
function Add-Violation($code, $file, $line, $detail) {
    $script:violations += [PSCustomObject]@{
        Code   = $code
        File   = $file -replace [regex]::Escape($ROOT), '.'
        Line   = $line
        Detail = $detail
    }
    if (-not $script:stats.ContainsKey($code)) { $script:stats[$code] = 0 }
    $script:stats[$code]++
}

function Get-StatCount($code) {
    if ($stats.ContainsKey($code)) { return $stats[$code] }
    return 0
}

function Write-StepResult($code) {
    $cnt = Get-StatCount $code
    if ($cnt -gt 0) {
        Write-Host "  $cnt violation(s)" -ForegroundColor Red
    } else {
        Write-Host "  0 violation(s)" -ForegroundColor Green
    }
}

# ============================================================
# COLLECTE FICHIERS
# ============================================================
$htmlFiles = @()
$htmlFiles += Get-ChildItem -Path $MODULES -Filter "*.html" -Recurse -File
$jsFiles = @()
$jsFiles += Get-ChildItem -Path $MODULES -Filter "*.js" -Recurse -File
$jsFiles += Get-ChildItem -Path $SOCLE_JS -Filter "*.js" -File -ErrorAction SilentlyContinue
$cssFiles = @()
$cssFiles += Get-ChildItem -Path $MODULES -Filter "*.css" -Recurse -File
$cssFiles += Get-ChildItem -Path $SOCLE_CSS -Filter "*.css" -File -ErrorAction SilentlyContinue

Write-Host "Fichiers : $($htmlFiles.Count) HTML, $($jsFiles.Count) JS, $($cssFiles.Count) CSS" -ForegroundColor DarkGray
Write-Host ""

# ============================================================
# ETAPE 1 : UX20 - aria-label boutons icon-only
# ============================================================
Write-Host "[1/10] UX20 - aria-label boutons icon-only..." -ForegroundColor Yellow

foreach ($f in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $lineNum = 0
    foreach ($rawLine in $content -split "`n") {
        $lineNum++
        if ($rawLine -match '<button[^>]*>\s*<i\s+class="bi-' -and $rawLine -notmatch 'aria-label') {
            Add-Violation "UX20" $f.FullName $lineNum "Bouton icon-only sans aria-label"
        }
        if ($rawLine -match '<a[^>]*>\s*<i\s+class="bi-' -and $rawLine -notmatch 'aria-label' -and $rawLine -notmatch '>.*[a-zA-Z]') {
            Add-Violation "UX20" $f.FullName $lineNum "Lien icon-only sans aria-label"
        }
    }
}
Write-StepResult "UX20"

# ============================================================
# ETAPE 2 : UX22 - lang="fr"
# ============================================================
Write-Host "[2/10] UX22 - lang=fr..." -ForegroundColor Yellow

foreach ($f in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match '<html' -and $content -notmatch 'lang="fr"') {
        Add-Violation "UX22" $f.FullName 1 "<html> sans lang=fr"
    }
}
$rootHtml = @("$ROOT\login.html", "$ROOT\reset-password.html", "$ROOT\index.html")
foreach ($path in $rootHtml) {
    if (Test-Path $path) {
        $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
        if ($content -match '<html' -and $content -notmatch 'lang="fr"') {
            Add-Violation "UX22" $path 1 "<html> sans lang=fr"
        }
    }
}
Write-StepResult "UX22"

# ============================================================
# ETAPE 3 : UX23 - Title unique
# ============================================================
Write-Host "[3/10] UX23 - <title> unique..." -ForegroundColor Yellow

$titles = @{}
foreach ($f in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    if ($content -match '<title>([^<]+)</title>') {
        $t = $Matches[1].Trim()
        $shortPath = $f.FullName -replace [regex]::Escape($ROOT), '.'
        if ($titles.ContainsKey($t)) {
            Add-Violation "UX23" $f.FullName 0 "Title duplique: $t (aussi dans $($titles[$t]))"
        }
        $titles[$t] = $shortPath
    } else {
        if ($content -match '<html') {
            Add-Violation "UX23" $f.FullName 0 "Pas de <title>"
        }
    }
}
Write-StepResult "UX23"

# ============================================================
# ETAPE 4 : UX25 - tabindex > 1
# ============================================================
Write-Host "[4/10] UX25 - tabindex logique..." -ForegroundColor Yellow

foreach ($f in $htmlFiles) {
    $lineNum = 0
    foreach ($rawLine in [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)) {
        $lineNum++
        if ($rawLine -match 'tabindex="([2-9]|[1-9]\d)') {
            Add-Violation "UX25" $f.FullName $lineNum "tabindex > 1 casse l'ordre de tab"
        }
    }
}
Write-StepResult "UX25"

# ============================================================
# ETAPE 5 : UX21 - outline: none sans remplacement
# ============================================================
Write-Host "[5/10] UX21 - outline:none..." -ForegroundColor Yellow

foreach ($f in $cssFiles) {
    $lineNum = 0
    foreach ($rawLine in [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)) {
        $lineNum++
        if ($rawLine -match 'outline\s*:\s*(none|0)\b' -and $rawLine -notmatch '^\s*/?\*' -and $rawLine -notmatch 'UX21') {
            Add-Violation "UX21" $f.FullName $lineNum "outline:none - verifier focus-visible"
        }
    }
}
Write-StepResult "UX21"

# ============================================================
# ETAPE 6 : UX18 - tables sans table-responsive
# ============================================================
Write-Host "[6/10] UX18 - tables responsives..." -ForegroundColor Yellow

foreach ($f in $htmlFiles) {
    $lines = [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '<table') {
            $found = $false
            $start = [Math]::Max(0, $i - 3)
            for ($j = $start; $j -le $i; $j++) {
                if ($lines[$j] -match 'table-responsive') { $found = $true; break }
            }
            if (-not $found) {
                Add-Violation "UX18" $f.FullName ($i + 1) "<table> sans table-responsive parent"
            }
        }
    }
}
Write-StepResult "UX18"

# ============================================================
# ETAPE 7 : UX32 - location.reload
# ============================================================
Write-Host "[7/10] UX32 - location.reload..." -ForegroundColor Yellow

foreach ($f in $jsFiles) {
    $lines = [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'location\.reload') {
            # Verifier si la ligne ou la ligne precedente contient un commentaire UX32
            $prevLine = ""
            if ($i -gt 0) { $prevLine = $lines[$i - 1] }
            if ($lines[$i] -notmatch 'UX32' -and $prevLine -notmatch 'UX32') {
                Add-Violation "UX32" $f.FullName ($i + 1) "location.reload() apres CRUD"
            }
        }
    }
}
Write-StepResult "UX32"

# ============================================================
# ETAPE 8 : UX27 - autocomplete sur login
# ============================================================
Write-Host "[8/10] UX27 - autocomplete login..." -ForegroundColor Yellow

$loginFiles = @("$ROOT\login.html", "$ROOT\reset-password.html")
foreach ($path in $loginFiles) {
    if (Test-Path $path) {
        $lineNum = 0
        foreach ($rawLine in [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)) {
            $lineNum++
            if ($rawLine -match 'type="(email|password)"' -and $rawLine -notmatch 'autocomplete') {
                Add-Violation "UX27" $path $lineNum "Input email/password sans autocomplete"
            }
        }
    }
}
Write-StepResult "UX27"

# ============================================================
# ETAPE 9 : UX12 - inputs recherche type=text au lieu de search
# ============================================================
Write-Host "[9/10] UX12 - type=search vs type=text..." -ForegroundColor Yellow

foreach ($f in $htmlFiles) {
    $lineNum = 0
    foreach ($rawLine in [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)) {
        $lineNum++
        if ($rawLine -match 'type="text"' -and $rawLine -match '(cherch|search|filtr|recherch)') {
            Add-Violation "UX12" $f.FullName $lineNum "Input recherche type=text -> migrer type=search"
        }
    }
}
Write-StepResult "UX12"

# ============================================================
# ETAPE 10 : UX06 - .delete() sans confirm
# ============================================================
Write-Host "[10/10] UX06 - delete sans confirm..." -ForegroundColor Yellow

foreach ($f in $jsFiles) {
    $lines = [System.IO.File]::ReadAllLines($f.FullName, [System.Text.Encoding]::UTF8)
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '\.delete\(\)') {
            $start = [Math]::Max(0, $i - 10)
            $context = ""
            for ($j = $start; $j -le $i; $j++) {
                $context += $lines[$j] + " "
            }
            if ($context -notmatch 'confirm\(' -and $context -notmatch 'Confirm' -and $context -notmatch 'modal' -and $context -notmatch 'UX06') {
                Add-Violation "UX06" $f.FullName ($i + 1) ".delete() sans confirmation visible"
            }
        }
    }
}
Write-StepResult "UX06"

# ============================================================
# RAPPORT
# ============================================================
Write-Host ""
Write-Host "=== SYNTHESE ===" -ForegroundColor Cyan

$totalViolations = $violations.Count
if ($totalViolations -eq 0) {
    Write-Host "Zero violation detectee (criteres grep-ables)" -ForegroundColor Green
} else {
    Write-Host "$totalViolations violation(s) totale(s)" -ForegroundColor Red
    Write-Host ""

    Write-Host "Par regle :" -ForegroundColor White
    foreach ($key in ($stats.Keys | Sort-Object)) {
        $count = $stats[$key]
        if ($count -gt 5) {
            Write-Host "  $key : $count" -ForegroundColor Red
        } elseif ($count -gt 0) {
            Write-Host "  $key : $count" -ForegroundColor Yellow
        } else {
            Write-Host "  $key : $count" -ForegroundColor Green
        }
    }
}

# Ecrire rapport fichier
$reportContent = @()
$reportContent += "AUDIT UX PREMIUM BDB -- $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$reportContent += "=" * 60
$reportContent += ""
$reportContent += "TOTAL VIOLATIONS : $totalViolations"
$reportContent += ""

if ($totalViolations -gt 0) {
    $reportContent += "PAR REGLE :"
    foreach ($key in ($stats.Keys | Sort-Object)) {
        $reportContent += "  $key : $($stats[$key])"
    }
    $reportContent += ""
    $reportContent += "DETAIL :"
    $reportContent += "-" * 60

    foreach ($v in ($violations | Sort-Object Code, File)) {
        $reportContent += "$($v.Code) | $($v.File):$($v.Line) | $($v.Detail)"
    }
}

$reportContent += ""
$reportContent += "REGLES NON AUDITEES (inspection manuelle requise) :"
$reportContent += "  UX01  Autofocus -- verifier visuellement"
$reportContent += "  UX02  Enter action -- verifier dans chaque module"
$reportContent += "  UX04  Feedback action -- verifier les handlers async"
$reportContent += "  UX05  Protection double-clic -- verifier btn.disabled"
$reportContent += "  UX07  Skeleton loaders -- verifier spinner-border vs placeholder-glow"
$reportContent += "  UX08  3 etats async -- verifier loadingState/emptyState/errorState"
$reportContent += "  UX09  Empty state guidant -- verifier contenu texte"
$reportContent += "  UX10  Filtre instantane -- verifier input vs change event"
$reportContent += "  UX11  Compteur resultats -- verifier presence compteur"
$reportContent += "  UX13  Required marques -- croiser avec DATA_MODEL"
$reportContent += "  UX14  Conservation donnees erreur -- verifier reset/hide"
$reportContent += "  UX15  Validation inline -- verifier is-invalid"
$reportContent += "  UX16  Cibles 44px -- verifier taille boutons"
$reportContent += "  UX17  Hover-only -- verifier :hover revelant du contenu"
$reportContent += "  UX19  Scroll H mobile -- tester viewport 390px"
$reportContent += "  UX24  Couleur seul vecteur -- audit visuel"
$reportContent += "  UX26  Labels descriptifs -- verifier label for="
$reportContent += "  UX28  Contraste 4.5:1 -- audit variables CSS"
$reportContent += "  UX29  role=status toasts -- verifier bdbToast"
$reportContent += "  UX30  Reflow 320px -- tester viewport"
$reportContent += "  UX31  Scroll to top -- verifier changement onglet"

[System.IO.File]::WriteAllLines($REPORT, $reportContent, [System.Text.Encoding]::UTF8)
Write-Host ""
$shortReport = $REPORT -replace [regex]::Escape($ROOT), '.'
Write-Host "Rapport ecrit : $shortReport" -ForegroundColor Green

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
