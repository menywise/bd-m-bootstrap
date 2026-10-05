# ============================================================
# fix-ux-batch-a.ps1
# VERSION  : 1.0.0
# DATE     : 2026-04-05
# OBJECTIF : Corrections mecaniques UX12 + UX27 + UX23
# PREREQUIS: Lancer via fix-ux-batch-a.bat
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
$fixCount = 0

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== CORRECTIONS UX BATCH A ===" -ForegroundColor Cyan
Write-Host "Racine : $ROOT" -ForegroundColor DarkGray
Write-Host ""

# ============================================================
# BACKUP
# ============================================================
Write-Host "[0] Backup avant corrections..." -ForegroundColor Yellow
$backupDir = "$ROOT\_dev\backup_ux_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "  Backup dans : $backupDir" -ForegroundColor DarkGray

# ============================================================
# UX12 : type="text" -> type="search" sur inputs recherche/filtre
# ============================================================
Write-Host ""
Write-Host "[1/3] UX12 - type=text -> type=search..." -ForegroundColor Yellow

$ux12Files = @(
    "$ROOT\modules\admin\index.html"
    "$ROOT\modules\anatomie\index.html"
    "$ROOT\modules\arsenal\index.html"
    "$ROOT\modules\cours\index.html"
    "$ROOT\modules\disc\index.html"
    "$ROOT\modules\fiches\index.html"
    "$ROOT\modules\glossaire\index.html"
    "$ROOT\modules\installation\index.html"
    "$ROOT\modules\medacta-coste\index.html"
    "$ROOT\modules\preferences\index.html"
    "$ROOT\modules\site\glossaire.html"
    "$ROOT\modules\template-vierge\theme-crud.html"
    "$ROOT\modules\template-vierge\theme-showcase.html"
    "$ROOT\modules\thesaurus\index.html"
    "$ROOT\modules\thesaurus\rapprochement_fiches.html"
    "$ROOT\modules\transmissions\index.html"
    "$ROOT\modules\planning\test-members.html"
)

foreach ($path in $ux12Files) {
    if (-not (Test-Path $path)) {
        Write-Host "  SKIP (absent) : $($path -replace [regex]::Escape($ROOT), '.')" -ForegroundColor DarkGray
        continue
    }
    # Backup
    $rel = $path -replace [regex]::Escape($ROOT), ''
    $backupPath = "$backupDir$rel"
    $backupFolder = Split-Path $backupPath -Parent
    if (-not (Test-Path $backupFolder)) {
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
    }
    Copy-Item $path $backupPath -Force

    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content

    # Remplacer type="text" par type="search" UNIQUEMENT sur les lignes
    # contenant un mot-cle recherche/filtre
    $lines = $content -split "`n"
    $newLines = @()
    foreach ($line in $lines) {
        if ($line -match 'type="text"' -and $line -match '(cherch|search|filtr|recherch)') {
            $newLine = $line -replace 'type="text"', 'type="search"'
            $newLines += $newLine
        } else {
            $newLines += $line
        }
    }
    $newContent = $newLines -join "`n"

    if ($newContent -ne $original) {
        [System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
        $shortPath = $path -replace [regex]::Escape($ROOT), '.'
        Write-Host "  FIX : $shortPath" -ForegroundColor Green
        $fixCount++
    }
}

# ============================================================
# UX27 : autocomplete sur login/reset-password
# ============================================================
Write-Host ""
Write-Host "[2/3] UX27 - autocomplete login..." -ForegroundColor Yellow

$loginPath = "$ROOT\login.html"
if (Test-Path $loginPath) {
    Copy-Item $loginPath "$backupDir\login.html" -Force
    $content = [System.IO.File]::ReadAllText($loginPath, [System.Text.Encoding]::UTF8)

    # Ajouter autocomplete="email" sur type="email" sans autocomplete
    $lines = $content -split "`n"
    $newLines = @()
    foreach ($line in $lines) {
        if ($line -match 'type="email"' -and $line -notmatch 'autocomplete') {
            $newLine = $line -replace 'type="email"', 'type="email" autocomplete="email"'
            $newLines += $newLine
        } elseif ($line -match 'type="password"' -and $line -notmatch 'autocomplete') {
            # Detecter si c'est un champ new-password ou current-password
            # Si la ligne ou les 3 lignes avant contiennent "nouveau|new|confirm"
            # c'est un new-password, sinon current-password
            $idx = $newLines.Count
            $contextBefore = ""
            $start = [Math]::Max(0, $idx - 5)
            for ($j = $start; $j -lt $idx; $j++) {
                $contextBefore += $newLines[$j] + " "
            }
            $contextBefore += $line

            if ($contextBefore -match '(nouveau|new|confirm|Confirm|Nouveau|reset|Reset)') {
                $newLine = $line -replace 'type="password"', 'type="password" autocomplete="new-password"'
            } else {
                $newLine = $line -replace 'type="password"', 'type="password" autocomplete="current-password"'
            }
            $newLines += $newLine
        } else {
            $newLines += $line
        }
    }
    $newContent = $newLines -join "`n"
    [System.IO.File]::WriteAllText($loginPath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "  FIX : .\login.html" -ForegroundColor Green
    $fixCount++
}

$resetPath = "$ROOT\reset-password.html"
if (Test-Path $resetPath) {
    Copy-Item $resetPath "$backupDir\reset-password.html" -Force
    $content = [System.IO.File]::ReadAllText($resetPath, [System.Text.Encoding]::UTF8)

    $lines = $content -split "`n"
    $newLines = @()
    foreach ($line in $lines) {
        if ($line -match 'type="email"' -and $line -notmatch 'autocomplete') {
            $newLine = $line -replace 'type="email"', 'type="email" autocomplete="email"'
            $newLines += $newLine
        } elseif ($line -match 'type="password"' -and $line -notmatch 'autocomplete') {
            $newLine = $line -replace 'type="password"', 'type="password" autocomplete="new-password"'
            $newLines += $newLine
        } else {
            $newLines += $line
        }
    }
    $newContent = $newLines -join "`n"
    [System.IO.File]::WriteAllText($resetPath, $newContent, [System.Text.Encoding]::UTF8)
    Write-Host "  FIX : .\reset-password.html" -ForegroundColor Green
    $fixCount++
}

# ============================================================
# UX23 : Titres dupliques
# ============================================================
Write-Host ""
Write-Host "[3/3] UX23 - titres dupliques..." -ForegroundColor Yellow

# profile/index - Copie.html -> supprimer le fichier copie
$profilCopy = "$ROOT\modules\profile\index - Copie.html"
if (Test-Path $profilCopy) {
    Copy-Item $profilCopy "$backupDir\profile-index-copie.html" -Force
    Remove-Item $profilCopy -Force
    Write-Host "  DEL : .\modules\profile\index - Copie.html (fichier copie)" -ForegroundColor Red
    $fixCount++
}

# planning/analytics-2.html -> titre unique
$analytics2 = "$ROOT\modules\planning\analytics-2.html"
if (Test-Path $analytics2) {
    $backupFolder2 = "$backupDir\modules\planning"
    if (-not (Test-Path $backupFolder2)) {
        New-Item -ItemType Directory -Path $backupFolder2 -Force | Out-Null
    }
    Copy-Item $analytics2 "$backupFolder2\analytics-2.html" -Force
    $content = [System.IO.File]::ReadAllText($analytics2, [System.Text.Encoding]::UTF8)
    $content = $content -replace '<title>Analyse Multi-P.+?\| Planning Engine</title>', '<title>Analyse Multi-P&#233;riodes V2 | Planning Engine</title>'
    [System.IO.File]::WriteAllText($analytics2, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  FIX : .\modules\planning\analytics-2.html (titre unique)" -ForegroundColor Green
    $fixCount++
}

# planning/dashboard.html -> titre unique
$dashboard = "$ROOT\modules\planning\dashboard.html"
if (Test-Path $dashboard) {
    $backupFolder3 = "$backupDir\modules\planning"
    if (-not (Test-Path $backupFolder3)) {
        New-Item -ItemType Directory -Path $backupFolder3 -Force | Out-Null
    }
    Copy-Item $dashboard "$backupFolder3\dashboard.html" -Force
    $content = [System.IO.File]::ReadAllText($dashboard, [System.Text.Encoding]::UTF8)
    $content = $content -replace '<title>Dashboard \| Planning Engine</title>', '<title>Dashboard Legacy | Planning Engine</title>'
    [System.IO.File]::WriteAllText($dashboard, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  FIX : .\modules\planning\dashboard.html (titre unique)" -ForegroundColor Green
    $fixCount++
}

# ============================================================
# SYNTHESE
# ============================================================
Write-Host ""
Write-Host "=== SYNTHESE ===" -ForegroundColor Cyan
Write-Host "$fixCount fichier(s) corrige(s)" -ForegroundColor Green
Write-Host "Backup dans : $backupDir" -ForegroundColor DarkGray
Write-Host ""
Write-Host "ETAPE SUIVANTE : relancer audit-ux-premium.bat pour verifier" -ForegroundColor Yellow

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
