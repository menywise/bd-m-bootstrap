# ================================================================
# inject-auth-users.ps1
# Role  : Cree les comptes auth.users pour tous les profils orphelins
#         de profiles_directory + envoie le lien de premiere connexion
# Usage : lancer inject-auth-users.bat depuis C:\DEV\BIBLE_DE_BLOC\
# ================================================================

$ErrorActionPreference = 'Continue'

# ── 1. Charger .env ─────────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
    Write-Host "ERREUR : .env introuvable dans $PSScriptRoot" -ForegroundColor Red
    exit 1
}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.+)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
    }
}

$SUPABASE_URL    = [System.Environment]::GetEnvironmentVariable('SUPABASE_URL')
$SERVICE_KEY     = [System.Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY')
$REDIRECT_TO     = 'https://hashtag.manuelrohaut.fr/bdb/reset-password.html'

if (-not $SUPABASE_URL -or -not $SERVICE_KEY) {
    Write-Host "ERREUR : SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env" -ForegroundColor Red
    exit 1
}

$HEADERS_SVC = @{
    'apikey'        = $SERVICE_KEY
    'Authorization' = "Bearer $SERVICE_KEY"
    'Content-Type'  = 'application/json'
}

Write-Host ""
Write-Host "=== INJECTION AUTH.USERS — BDB ===" -ForegroundColor Cyan
Write-Host "Projet : $SUPABASE_URL"
Write-Host ""

# ── 2. Lire tous les profils profiles_directory ─────────────────
Write-Host "Lecture des profils..." -ForegroundColor Yellow
$profilesUrl = "$SUPABASE_URL/rest/v1/profiles_directory?select=user_id,email,prenom,nom,fonction&limit=1000"
$profiles = Invoke-RestMethod -Uri $profilesUrl -Headers $HEADERS_SVC -Method Get
Write-Host "  $($profiles.Count) profils trouves"

# ── 3. Lire les comptes auth.users existants ────────────────────
Write-Host "Lecture des comptes auth..." -ForegroundColor Yellow
$authUsers = @()
$page = 1
do {
    $authUrl = "$SUPABASE_URL/auth/v1/admin/users?page=$page&per_page=1000"
    $res = Invoke-RestMethod -Uri $authUrl -Headers $HEADERS_SVC -Method Get
    $batch = if ($res.users) { $res.users } else { $res }
    $authUsers += $batch
    $page++
} while ($batch.Count -eq 1000)

$authIds = @($authUsers | ForEach-Object { $_.id })
Write-Host "  $($authUsers.Count) comptes auth existants"

# ── 4. Trouver les orphelins ────────────────────────────────────
$orphans = $profiles | Where-Object {
    $_.user_id -notin $authIds -and $_.email -and $_.email -ne ''
}
Write-Host ""
Write-Host "  $($orphans.Count) profils orphelins a traiter" -ForegroundColor Cyan
Write-Host ""

if ($orphans.Count -eq 0) {
    Write-Host "Rien a faire — tous les profils ont un compte auth." -ForegroundColor Green
    exit 0
}

# ── 5. Generateur de mot de passe temporaire ────────────────────
function New-TempPassword {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
    -join ((1..20) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

# ── 6. Traiter chaque orphelin ──────────────────────────────────
$ok    = 0
$fails = @()

foreach ($p in $orphans) {
    $label = "$($p.prenom) $($p.nom) <$($p.email)>"
    Write-Host "Traitement : $label" -ForegroundColor White

    # a. Creer le compte auth
    $createBody = @{
        email          = $p.email
        password       = New-TempPassword
        email_confirm  = $true
        user_metadata  = @{
            prenom    = $p.prenom
            nom       = $p.nom
            full_name = "$($p.prenom) $($p.nom)"
        }
    } | ConvertTo-Json -Compress

    $created = $null
    $createRes = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users" `
        -Headers $HEADERS_SVC -Method Post -Body $createBody
    $userId = $createRes.id

    if (-not $userId) {
        Write-Host "  ECHEC creation auth : $($createRes | ConvertTo-Json -Compress)" -ForegroundColor Red
        $fails += $label
        continue
    }
    Write-Host "  auth cree : $userId" -ForegroundColor Green

    # b. Mettre a jour profiles_directory avec le bon user_id si different
    if ($p.user_id -ne $userId) {
        $patchBody = @{ user_id = $userId } | ConvertTo-Json -Compress
        $patchUrl  = "$SUPABASE_URL/rest/v1/profiles_directory?user_id=eq.$($p.user_id)"
        Invoke-RestMethod -Uri $patchUrl -Headers $HEADERS_SVC -Method Patch -Body $patchBody | Out-Null
        Write-Host "  profil rattache au nouvel auth user_id" -ForegroundColor Gray
    }

    # c. Envoyer le lien de premiere connexion
    $linkBody = @{
        type        = 'recovery'
        email       = $p.email
        options     = @{ redirectTo = $REDIRECT_TO }
    } | ConvertTo-Json -Compress

    $linkRes = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/generate_link" `
        -Headers $HEADERS_SVC -Method Post -Body $linkBody

    if ($linkRes.action_link) {
        Write-Host "  lien envoye a $($p.email)" -ForegroundColor Green
    } else {
        Write-Host "  AVERTISSEMENT lien non envoye : $($linkRes | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    }

    $ok++
    Write-Host ""
}

# ── 7. Rapport ──────────────────────────────────────────────────
Write-Host "=== RAPPORT ===" -ForegroundColor Cyan
Write-Host "  Succes  : $ok"
Write-Host "  Echecs  : $($fails.Count)"
if ($fails.Count -gt 0) {
    Write-Host ""
    Write-Host "Profils en echec :" -ForegroundColor Red
    $fails | ForEach-Object { Write-Host "  - $_" }
}
Write-Host ""
