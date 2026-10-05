# ============================================================
# START-BDB.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-04
# OBJECTIF : Demarrage environnement BDB apres reboot
#            Docker + Supabase local + HTTP server + Chrome
# DELTA    : V1.0.0 -> V1.1.0
#            - ASCII pur (accents et Unicode supprimes)
#            - INTERDIT-PS1 : trap + try/catch + Read-Host
# PREREQUIS: Docker Desktop demarre. Lancer via start-bdb.bat
# USAGE    : .\start-bdb.bat
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
$BDB_PATH        = "C:\DEV\BIBLE_DE_BLOC"
$HTTP_PORT       = 5500
$SUPABASE_API    = "http://127.0.0.1:54321"
$SUPABASE_STUDIO = "http://127.0.0.1:54323"
$CONTAINER       = "supabase_db_ohccnwyziljqtyrtepel"

# --- Fonctions utilitaires ---
function Show-OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Show-FAIL { param($msg) Write-Host "  [KO] $msg" -ForegroundColor Red }
function Show-INFO { param($msg) Write-Host "  [..] $msg" -ForegroundColor Cyan }

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== DEMARRAGE BDB ===" -ForegroundColor Cyan

# --- ETAPE 1 : Docker ---
Write-Host ""
Write-Host "[1/5] Docker..." -ForegroundColor Yellow
$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Show-OK "Docker Desktop demarre"
} else {
    Show-FAIL "Docker non disponible -- lancer Docker Desktop puis relancer"
    throw "Docker non disponible"
}

# --- ETAPE 2 : Supabase local ---
Write-Host ""
Write-Host "[2/5] Supabase local..." -ForegroundColor Yellow
$supabaseRunning = $false
try {
    $response = Invoke-WebRequest -Uri "$SUPABASE_API/health" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Show-OK "Supabase deja actif sur $SUPABASE_API"
        $supabaseRunning = $true
    }
} catch {
    Show-INFO "Supabase non actif -- demarrage en cours..."
}

if (-not $supabaseRunning) {
    Set-Location $BDB_PATH
    Show-INFO "supabase start (30-60s)..."
    supabase start
    if ($LASTEXITCODE -eq 0) {
        Show-OK "Supabase demarre"
    } else {
        Show-FAIL "Echec supabase start -- verifier les logs Docker"
        throw "Echec supabase start"
    }
}

# --- ETAPE 3 : Conteneur DB ---
Write-Host ""
Write-Host "[3/5] Conteneur DB..." -ForegroundColor Yellow
$containerStatus = docker inspect --format="{{.State.Status}}" $CONTAINER 2>&1
if ($containerStatus -eq "running") {
    Show-OK "Conteneur $CONTAINER -- running"
} else {
    Show-FAIL "Conteneur $CONTAINER -- etat : $containerStatus"
}

# --- ETAPE 4 : Serveur HTTP frontend ---
Write-Host ""
Write-Host "[4/5] Serveur HTTP frontend..." -ForegroundColor Yellow
$portUsed = Get-NetTCPConnection -LocalPort $HTTP_PORT -ErrorAction SilentlyContinue
if ($portUsed) {
    Show-OK "Port $HTTP_PORT deja en ecoute"
} else {
    Show-INFO "Demarrage serveur HTTP sur port $HTTP_PORT..."
    Start-Process -FilePath "python" `
        -ArgumentList "-m http.server $HTTP_PORT" `
        -WorkingDirectory $BDB_PATH `
        -WindowStyle Normal
    Start-Sleep -Seconds 2
    $portUsed = Get-NetTCPConnection -LocalPort $HTTP_PORT -ErrorAction SilentlyContinue
    if ($portUsed) {
        Show-OK "Serveur HTTP actif sur http://localhost:$HTTP_PORT"
    } else {
        Show-FAIL "Serveur HTTP non demarre -- verifier Python dans PATH"
    }
}

# --- ETAPE 5 : Chrome ---
Write-Host ""
Write-Host "[5/5] Ouverture navigateur..." -ForegroundColor Yellow
Start-Process "chrome.exe" "http://localhost:$HTTP_PORT"
Show-OK "Chrome ouvert"

# --- RESUME ---
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "  Frontend BDB     : http://localhost:$HTTP_PORT" -ForegroundColor Yellow
Write-Host "  Supabase Studio  : $SUPABASE_STUDIO" -ForegroundColor Yellow
Write-Host "  SQL Editor       : $SUPABASE_STUDIO/project/default/sql" -ForegroundColor Yellow
Write-Host "  API REST         : $SUPABASE_API/rest/v1/" -ForegroundColor Yellow
Write-Host "  Conteneur DB     : $CONTAINER" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Commande psql (encodage UTF8) :" -ForegroundColor Gray
Write-Host "  docker exec -e PGCLIENTENCODING=UTF8 $CONTAINER psql -U postgres -d postgres" -ForegroundColor Gray
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
