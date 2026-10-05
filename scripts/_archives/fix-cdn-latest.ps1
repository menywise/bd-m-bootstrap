# ============================================================
# fix-cdn-latest.ps1
# VERSION  : 1.0.0
# DATE     : 2026-04-05
# OBJECTIF : Remplacer menywise/BDB@latest par menywise/BDB@v2.0.0
#            dans tous les fichiers HTML du projet BDB.
# PREREQUIS: Lancer via fix-cdn-latest.bat
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

$PATTERN_OLD = "menywise/BDB@latest"
$PATTERN_NEW = "menywise/BDB@v2.0.0"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== FIX CDN @latest -> @v2.0.0 ===" -ForegroundColor Cyan
Write-Host "Racine : $ROOT"
Write-Host "Avant  : $PATTERN_OLD"
Write-Host "Apres  : $PATTERN_NEW"
Write-Host ""

# --- ETAPE 1 : Scan ---
Write-Host "[1/4] Scan des fichiers HTML..." -ForegroundColor Yellow

$allHtml = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.git\\"
}

$matches = @()
foreach ($file in $allHtml) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    if ($content.Contains($PATTERN_OLD)) {
        $count = ([regex]::Matches($content, [regex]::Escape($PATTERN_OLD))).Count
        $matches += [PSCustomObject]@{ File = $file.FullName; Count = $count }
    }
}

Write-Host "  $($matches.Count) fichier(s) contenant @latest" -ForegroundColor Green

if ($matches.Count -eq 0) {
    Write-Host ""
    Write-Host "Rien a faire - aucun @latest detecte." -ForegroundColor Green
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
    exit 0
}

# --- ETAPE 2 : Afficher la liste ---
Write-Host ""
Write-Host "[2/4] Fichiers concernes :" -ForegroundColor Yellow
foreach ($m in $matches) {
    $rel = $m.File.Replace($ROOT + "\", "")
    Write-Host "  [$($m.Count)x]  $rel" -ForegroundColor White
}

# --- ETAPE 3 : Confirmation ---
Write-Host ""
Write-Host "[3/4] Confirmation" -ForegroundColor Yellow
$confirm = Read-Host "Remplacer dans ces $($matches.Count) fichiers ? (O/N)"
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "Abandon." -ForegroundColor DarkYellow
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
    exit 0
}

# --- ETAPE 4 : Remplacement ---
Write-Host ""
Write-Host "[4/4] Remplacement en cours..." -ForegroundColor Yellow

$replaced = 0
$errors = 0

foreach ($m in $matches) {
    try {
        $content = [System.IO.File]::ReadAllText($m.File, [System.Text.Encoding]::UTF8)
        $newContent = $content.Replace($PATTERN_OLD, $PATTERN_NEW)
        [System.IO.File]::WriteAllText($m.File, $newContent, (New-Object System.Text.UTF8Encoding $false))
        $rel = $m.File.Replace($ROOT + "\", "")
        Write-Host "  OK  $rel" -ForegroundColor Green
        $replaced++
    } catch {
        $rel = $m.File.Replace($ROOT + "\", "")
        Write-Host "  ERR $rel - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

# --- Rapport ---
Write-Host ""
Write-Host "=== RAPPORT ===" -ForegroundColor Cyan
Write-Host "  Fichiers modifies  : $replaced" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "  Erreurs            : $errors" -ForegroundColor Red
} else {
    Write-Host "  Erreurs            : 0" -ForegroundColor Green
}
Write-Host ""
Write-Host "Verification rapide :" -ForegroundColor Yellow
Write-Host "  grep -rln '@latest' modules/ --include='*.html'"
Write-Host "  Resultat attendu : aucune ligne"
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
