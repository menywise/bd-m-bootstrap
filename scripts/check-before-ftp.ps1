# ============================================================
# CHECK-BEFORE-FTP.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-04
# OBJECTIF : Verification AVANT deploiement FTP OVH
# DELTA    : V1.0.0 -> V1.1.0
#            - ASCII pur (accents et Unicode supprimes)
#            - INTERDIT-PS1 : trap + try/catch + Read-Host
# PREREQUIS: Lancer via check-before-ftp.bat
# USAGE    : .\check-before-ftp.bat
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
$root = "C:\DEV\BIBLE_DE_BLOC"

# --- FILET 2 : try/catch corps entier ---
try {

$errors = 0

Write-Host ""
Write-Host "=== CHECK PRE-DEPLOIEMENT OVH ===" -ForegroundColor Cyan
Write-Host ""

# --- Fichiers obligatoires ---
Write-Host "[1/4] Fichiers obligatoires..." -ForegroundColor Yellow
$required = @(".htaccess", "403.html", "404.html", "robots.txt")
foreach ($f in $required) {
    if (Test-Path "$root\$f") {
        Write-Host "  OK  $f" -ForegroundColor Green
    } else {
        Write-Host "  ERR $f ABSENT" -ForegroundColor Red
        $errors++
    }
}

# --- .htaccess gouvernance ---
if (Test-Path "$root\00_GOUVERNANCE\.htaccess") {
    Write-Host "  OK  00_GOUVERNANCE\.htaccess" -ForegroundColor Green
} else {
    Write-Host "  ERR 00_GOUVERNANCE\.htaccess ABSENT" -ForegroundColor Red
    $errors++
}

# --- Fichiers a NE PAS uploader ---
Write-Host ""
Write-Host "[2/4] Fichiers a ne PAS uploader..." -ForegroundColor Yellow
if (Test-Path "$root\js\config.js") {
    Write-Host "  !!  config.js existe -- NE PAS UPLOADER" -ForegroundColor Yellow
}

$md = (Get-ChildItem $root -Recurse -Filter "*.md" -File |
    Where-Object { $_.FullName -notlike "*_PROJET_CLAUDE*" -and $_.FullName -notlike "*node_modules*" }).Count
$sql = (Get-ChildItem $root -Recurse -Filter "*.sql" -File).Count
Write-Host "  !!  $md fichiers .md + $sql fichiers .sql -- NE PAS UPLOADER" -ForegroundColor Yellow

# --- Dossiers interdits sur FTP ---
Write-Host ""
Write-Host "[3/4] Dossiers interdits sur FTP..." -ForegroundColor Yellow
$interditsFTP = @("00_GOUVERNANCE", "01_TEMPLATES", "02_INFRASTRUCTURE", "DATA_METIER", "migrations", "scripts", "_dev", "_archives", "_deltas")
foreach ($d in $interditsFTP) {
    if (Test-Path "$root\$d") {
        Write-Host "  !!  $d\ existe -- NE PAS UPLOADER" -ForegroundColor DarkGray
    }
}

# --- Verifications manuelles ---
Write-Host ""
Write-Host "[4/4] Verifications manuelles apres upload :" -ForegroundColor Cyan
Write-Host "    1. https://hashtag.manuelrohaut.fr/bdb/modules/       -> 403" -ForegroundColor Gray
Write-Host "    2. https://hashtag.manuelrohaut.fr/bdb/00_GOUVERNANCE/ -> 403" -ForegroundColor Gray
Write-Host "    3. https://hashtag.manuelrohaut.fr/bdb/SESSION_STATE.md -> 403" -ForegroundColor Gray
Write-Host "    4. https://hashtag.manuelrohaut.fr/bdb/admin-test.html  -> 403" -ForegroundColor Gray
Write-Host "    5. https://hashtag.manuelrohaut.fr/bdb/site/    -> OK" -ForegroundColor Gray
Write-Host "    6. http://hashtag... (sans s)                           -> redirect https" -ForegroundColor Gray

# --- Resultat ---
Write-Host ""
if ($errors -eq 0) {
    Write-Host "  PRET POUR FTP -- 0 erreur bloquante" -ForegroundColor Green
} else {
    Write-Host "  $errors ERREUR(S) -- CORRIGER AVANT FTP" -ForegroundColor Red
}

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
