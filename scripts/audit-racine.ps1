# ============================================================
# audit-racine.ps1
# VERSION  : 1.2.0
# DATE     : 2026-04-04
# OBJECTIF : Auditer les fichiers a la racine de BDB
# PREREQUIS: Lancer via audit-racine.bat (pas en double-clic)
# ============================================================

$ErrorActionPreference = "Stop"

try {

$ROOT = "C:\DEV\BIBLE_DE_BLOC"

if (-not (Test-Path $ROOT)) {
    Write-Host "ERREUR : $ROOT introuvable" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== AUDIT FICHIERS RACINE BDB ===" -ForegroundColor Cyan
Write-Host "Racine : $ROOT"
Write-Host ""

# --- Listes de reference ---
$expected = @(
    "index.html",
    "login.html",
    "reset-password.html",
    "robots.txt",
    ".htaccess",
    "start-bdb.ps1",
    "cockpit.html",
    "favicon.ico",
    "favicon.png",
    "favicon.svg"
)

$expectedDirs = @(
    "00_GOUVERNANCE",
    "01_TEMPLATES",
    "02_INFRASTRUCTURE",
    "css",
    "js",
    "modules",
    "migrations",
    "DATA_METIER",
    "scripts",
    "_archives",
    "_deltas"
)

$suspectExt = @(".md", ".sql", ".txt", ".log", ".csv", ".json", ".bak", ".old", ".tmp")

# --- Scan fichiers ---
Write-Host "[1/3] Scan fichiers..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path $ROOT -File -Force

$countOK = 0
$countSuspect = 0

Write-Host ""
Write-Host "--- FICHIERS ATTENDUS ---" -ForegroundColor Green

foreach ($f in $allFiles) {
    if ($expected -contains $f.Name) {
        $line = "  OK   " + $f.Name.PadRight(35) + $f.LastWriteTime.ToString("yyyy-MM-dd")
        Write-Host $line -ForegroundColor Green
        $countOK++
    }
}

if ($countOK -eq 0) {
    Write-Host "  (aucun trouve)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "--- FICHIERS A ARBITRER ---" -ForegroundColor Red

foreach ($f in $allFiles) {
    $n = $f.Name
    $e = $f.Extension.ToLower()

    if ($expected -contains $n) { continue }

    $cat = "INCONNU"
    if ($e -eq ".ps1" -and $n -ne "start-bdb.ps1") {
        $cat = "SCRIPT > deplacer scripts\"
    }
    elseif ($suspectExt -contains $e) {
        $cat = "SUSPECT > probablement obsolete"
    }
    elseif ($e -eq ".html") {
        $cat = "HTML ORPHELIN"
    }

    $sz = $f.Length
    if ($sz -lt 1024) {
        $sl = [string]$sz + " B"
    }
    elseif ($sz -lt 1048576) {
        $sl = [string][math]::Round($sz / 1024, 1) + " KB"
    }
    else {
        $sl = [string][math]::Round($sz / 1048576, 1) + " MB"
    }

    $line = "  >>>  " + $n.PadRight(35) + $sl.PadRight(12) + $f.LastWriteTime.ToString("yyyy-MM-dd") + "  " + $cat
    Write-Host $line -ForegroundColor Yellow
    $countSuspect++
}

if ($countSuspect -eq 0) {
    Write-Host "  (aucun - racine propre !)" -ForegroundColor Green
}

# --- Scan dossiers ---
Write-Host ""
Write-Host "[2/3] Scan dossiers..." -ForegroundColor Yellow
$allDirs = Get-ChildItem -Path $ROOT -Directory -Force

$countDirOK = 0
$countDirUnk = 0

Write-Host ""
Write-Host "--- DOSSIERS ATTENDUS ---" -ForegroundColor Green

foreach ($d in $allDirs) {
    $dn = $d.Name
    if (($expectedDirs -contains $dn) -or ($dn.StartsWith("."))) {
        $fc = (Get-ChildItem -Path $d.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
        $line = "  OK   " + ($dn + "\").PadRight(25) + ([string]$fc + " fich.").PadRight(15) + $d.LastWriteTime.ToString("yyyy-MM-dd")
        Write-Host $line -ForegroundColor Green
        $countDirOK++
    }
}

Write-Host ""
Write-Host "--- DOSSIERS INCONNUS ---" -ForegroundColor Red

foreach ($d in $allDirs) {
    $dn = $d.Name
    if (($expectedDirs -contains $dn) -or ($dn.StartsWith("."))) { continue }

    $fc = (Get-ChildItem -Path $d.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
    $line = "  >>>  " + ($dn + "\").PadRight(25) + ([string]$fc + " fich.").PadRight(15) + $d.LastWriteTime.ToString("yyyy-MM-dd")
    Write-Host $line -ForegroundColor Yellow
    $countDirUnk++
}

if ($countDirUnk -eq 0) {
    Write-Host "  (aucun)" -ForegroundColor Green
}

# --- Resume ---
Write-Host ""
Write-Host "[3/3] Resume" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "  Fichiers racine   : $($allFiles.Count)"
Write-Host "  Attendus          : $countOK" -ForegroundColor Green
Write-Host "  A arbitrer        : $countSuspect" -ForegroundColor Red
Write-Host "  Dossiers racine   : $($allDirs.Count)"
Write-Host "  Dossiers attendus : $countDirOK" -ForegroundColor Green
Write-Host "  Dossiers inconnus : $countDirUnk" -ForegroundColor Red
Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan
Write-Host "Lecture seule - rien modifie."

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}
