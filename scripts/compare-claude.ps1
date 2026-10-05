# ============================================================
# COMPARE-CLAUDE.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-04
# OBJECTIF : Comparer les fichiers gouvernance locaux
#            avec l'inventaire du projet Claude AI
# DELTA    : V1.0.0 -> V1.1.0
#            - CLAUDE_PROJECT_MANIFEST.txt -> CLAUDE_PROJECT_INVENTORY.txt
#            - INTERDIT-PS1 : trap + try/catch + Read-Host
# PREREQUIS: CLAUDE_PROJECT_INVENTORY.txt a la racine du projet
#            Lancer via compare-claude.bat
# USAGE    : .\compare-claude.bat
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
$GOV = "$ROOT\00_GOUVERNANCE"
$INVENTORY = "$ROOT\CLAUDE_PROJECT_INVENTORY.txt"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== COMPARAISON LOCAL vs PROJET CLAUDE ===" -ForegroundColor Cyan
Write-Host ""

# --- Verifier inventaire ---
if (-not (Test-Path $INVENTORY)) {
    Write-Host "  ERREUR : $INVENTORY introuvable" -ForegroundColor Red
    Write-Host "  Telecharger depuis la session Claude et placer a la racine du projet" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

# --- Charger l'inventaire ---
$claudeFiles = @{}
$deltas = @()
$obsoletes = @()

Get-Content $INVENTORY | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $parts = $line.Split("|")
    $name = $parts[0].Trim()
    $status = if ($parts.Count -gt 1) { $parts[1].Trim() } else { "CURRENT" }
    $note = if ($parts.Count -gt 2) { $parts[2].Trim() } else { "" }

    $claudeFiles[$name] = @{ Status = $status; Note = $note }

    if ($status -eq "DELTA") { $deltas += $name }
    if ($status -eq "OBSOLETE") { $obsoletes += $name }
}

# --- Lister les fichiers locaux ---
$localFiles = Get-ChildItem -Path $GOV -Filter "*.md" -File | Select-Object -ExpandProperty Name

# --- SECTION 1 : Fichiers dans Claude mais absents localement ---
Write-Host "[1] DANS CLAUDE, ABSENTS LOCALEMENT :" -ForegroundColor Yellow
$missing = 0
foreach ($name in $claudeFiles.Keys | Sort-Object) {
    $entry = $claudeFiles[$name]
    if ($entry.Status -eq "OBSOLETE") { continue }

    if ($name -notin $localFiles) {
        $suffix = ""
        if ($entry.Note) { $suffix = " ($($entry.Note))" }
        Write-Host "  MANQUANT : $name$suffix" -ForegroundColor Red
        $missing++
    }
}
if ($missing -eq 0) {
    Write-Host "  Aucun fichier manquant" -ForegroundColor Green
}

# --- SECTION 2 : Fichiers locaux absents du projet Claude ---
Write-Host ""
Write-Host "[2] LOCAUX, ABSENTS DU PROJET CLAUDE :" -ForegroundColor Yellow
$extra = 0
foreach ($name in $localFiles | Sort-Object) {
    if ($name -notin $claudeFiles.Keys) {
        Write-Host "  EXTRA : $name" -ForegroundColor Gray
        $extra++
    }
}
if ($extra -eq 0) {
    Write-Host "  Aucun fichier supplementaire" -ForegroundColor Green
} else {
    Write-Host "  -> $extra fichier(s) locaux non references dans Claude" -ForegroundColor Gray
}

# --- SECTION 3 : Fichiers obsoletes dans le projet Claude ---
Write-Host ""
Write-Host "[3] OBSOLETES DANS LE PROJET CLAUDE (a remplacer) :" -ForegroundColor Yellow
if ($obsoletes.Count -eq 0) {
    Write-Host "  Aucun" -ForegroundColor Green
} else {
    foreach ($name in $obsoletes | Sort-Object) {
        $note = $claudeFiles[$name].Note
        Write-Host "  OBSOLETE : $name" -ForegroundColor Red
        if ($note) { Write-Host "    -> $note" -ForegroundColor Gray }
    }
}

# --- SECTION 4 : Deltas non fusionnes ---
Write-Host ""
Write-Host "[4] DELTAS EN ATTENTE (non fusionnes) :" -ForegroundColor Yellow
if ($deltas.Count -eq 0) {
    Write-Host "  Aucun" -ForegroundColor Green
} else {
    foreach ($name in $deltas | Sort-Object) {
        $note = $claudeFiles[$name].Note
        Write-Host "  DELTA : $name" -ForegroundColor Magenta
        if ($note) { Write-Host "    -> $note" -ForegroundColor Gray }
    }
}

# --- RESUME ---
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
$cMissing = if ($missing -gt 0) { "Red" } else { "Green" }
$cExtra = if ($extra -gt 10) { "Yellow" } else { "Gray" }
$cObs = if ($obsoletes.Count -gt 0) { "Red" } else { "Green" }
$cDelta = if ($deltas.Count -gt 0) { "Magenta" } else { "Green" }
Write-Host "  Projet Claude : $($claudeFiles.Count) fichiers" -ForegroundColor Gray
Write-Host "  Local         : $($localFiles.Count) fichiers" -ForegroundColor Gray
Write-Host "  Manquants     : $missing" -ForegroundColor $cMissing
Write-Host "  Extra locaux  : $extra" -ForegroundColor $cExtra
Write-Host "  Obsoletes     : $($obsoletes.Count)" -ForegroundColor $cObs
Write-Host "  Deltas        : $($deltas.Count)" -ForegroundColor $cDelta
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
