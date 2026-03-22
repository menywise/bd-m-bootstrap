# ============================================================
#  START-BDB.PS1 — Démarrage environnement BDB après reboot
#  Version : 1.0.0 — 2026-03-12
#  Usage   : Clic droit > Exécuter avec PowerShell
#            OU depuis CMD : powershell -ExecutionPolicy Bypass -File start-bdb.ps1
# ============================================================

$BDB_PATH     = "C:\DEV\BIBLE_DE_BLOC"
$HTTP_PORT    = 5500
$SUPABASE_API    = "http://127.0.0.1:54321"
$SUPABASE_STUDIO = "http://127.0.0.1:54323"

# ── Couleurs console ─────────────────────────────────────────
function OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function FAIL { param($msg) Write-Host "  [KO] $msg" -ForegroundColor Red }
function INFO { param($msg) Write-Host "  [..] $msg" -ForegroundColor Cyan }
function HEAD { param($msg) Write-Host "`n$msg" -ForegroundColor White }

# ── ÉTAPE 1 — Vérifier Docker ────────────────────────────────
HEAD "=== ÉTAPE 1 — Docker ==="
try {
    $dockerStatus = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        OK "Docker Desktop est démarré"
    } else {
        FAIL "Docker non disponible — lancer Docker Desktop manuellement puis relancer ce script"
        Read-Host "`nAppuyer sur Entrée pour quitter"
        exit 1
    }
} catch {
    FAIL "Docker introuvable dans le PATH"
    Read-Host "`nAppuyer sur Entrée pour quitter"
    exit 1
}

# ── ÉTAPE 2 — Supabase start ─────────────────────────────────
HEAD "=== ÉTAPE 2 — Supabase local ==="
INFO "Vérification de l'état Supabase..."

$supabaseRunning = $false
try {
    $response = Invoke-WebRequest -Uri "$SUPABASE_API/health" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        OK "Supabase déjà actif sur $SUPABASE_API"
        $supabaseRunning = $true
    }
} catch {
    INFO "Supabase non actif — démarrage en cours..."
}

if (-not $supabaseRunning) {
    Set-Location $BDB_PATH
    INFO "supabase start (peut prendre 30-60s)..."
    supabase start
    if ($LASTEXITCODE -eq 0) {
        OK "Supabase démarré"
    } else {
        FAIL "Échec supabase start — vérifier les logs Docker"
        Read-Host "`nAppuyer sur Entrée pour quitter"
        exit 1
    }
}

# ── ÉTAPE 3 — Vérifier conteneur DB ─────────────────────────
HEAD "=== ÉTAPE 3 — Conteneur DB ==="
$container = "supabase_db_ohccnwyziljqtyrtepel"
$containerStatus = docker inspect --format="{{.State.Status}}" $container 2>&1
if ($containerStatus -eq "running") {
    OK "Conteneur $container — running"
} else {
    FAIL "Conteneur $container — état : $containerStatus"
}

# ── ÉTAPE 4 — Serveur HTTP frontend ──────────────────────────
HEAD "=== ÉTAPE 4 — Serveur HTTP frontend ==="

# Vérifier si port déjà utilisé
$portUsed = Get-NetTCPConnection -LocalPort $HTTP_PORT -ErrorAction SilentlyContinue
if ($portUsed) {
    OK "Port $HTTP_PORT déjà en écoute — serveur HTTP probablement actif"
} else {
    INFO "Démarrage serveur HTTP sur port $HTTP_PORT..."
    Start-Process -FilePath "python" `
        -ArgumentList "-m http.server $HTTP_PORT" `
        -WorkingDirectory $BDB_PATH `
        -WindowStyle Normal
    Start-Sleep -Seconds 2
    $portUsed = Get-NetTCPConnection -LocalPort $HTTP_PORT -ErrorAction SilentlyContinue
    if ($portUsed) {
        OK "Serveur HTTP actif sur http://localhost:$HTTP_PORT"
    } else {
        FAIL "Serveur HTTP non démarré — vérifier que Python est dans le PATH"
    }
}

# ── ÉTAPE 5 — Ouvrir Chrome ──────────────────────────────────
HEAD "=== ÉTAPE 5 — Ouverture navigateur ==="
INFO "Ouverture de http://localhost:$HTTP_PORT dans Chrome..."
Start-Process "chrome.exe" "http://localhost:$HTTP_PORT"

# ── RÉSUMÉ ───────────────────────────────────────────────────
HEAD "=== RÉSUMÉ ==="
Write-Host ""
Write-Host "  Frontend BDB     : http://localhost:$HTTP_PORT" -ForegroundColor Yellow
Write-Host "  Supabase Studio  : $SUPABASE_STUDIO" -ForegroundColor Yellow
Write-Host "  SQL Editor       : $SUPABASE_STUDIO/project/default/sql" -ForegroundColor Yellow
Write-Host "  API REST         : $SUPABASE_API/rest/v1/" -ForegroundColor Yellow
Write-Host "  Conteneur DB     : $container" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Commande psql (avec encodage UTF8) :" -ForegroundColor Gray
Write-Host "  docker exec -e PGCLIENTENCODING=UTF8 $container psql -U postgres -d postgres" -ForegroundColor Gray
Write-Host ""

Read-Host "Appuyer sur Entrée pour fermer"
