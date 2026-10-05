# ============================================================
# audit-hardcoded-racine.ps1 — BDB Root Files Audit
# Date   : 2026-04-16
# Usage  : Double-clic ou via bat launcher
# Périm. : Fichiers à la racine + js/ css/ (hors modules/ atelier/ conseil/)
# But    : Détecter données hardcodées incompatibles avec fork client
# ============================================================

trap {
    Write-Host "`nERREUR FATALE : $_" -ForegroundColor Red
    Read-Host "Appuyer sur Entrée pour fermer"
    exit 1
}

$ROOT = "C:\DEV\BIBLE_DE_BLOC"
$LOG  = "$ROOT\gouvernance\audit-hardcoded-$(Get-Date -Format 'yyyyMMdd-HHmm').txt"
$ERRORS = [System.Collections.Generic.List[string]]::new()
$WARNINGS = [System.Collections.Generic.List[string]]::new()
$INFOS = [System.Collections.Generic.List[string]]::new()

function Write-Section($title) {
    $line = "=" * 60
    Write-Host "`n$line" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "$line" -ForegroundColor Cyan
    Add-Content $LOG "`n$("=" * 60)`n  $title`n$("=" * 60)"
}

function Write-Hit($level, $file, $line, $content) {
    $short = $file.Replace($ROOT, ".")
    $msg = "[$level] $short : L$line → $content"
    if ($level -eq "ERREUR")  { $ERRORS.Add($msg);   Write-Host $msg -ForegroundColor Red }
    if ($level -eq "WARNING") { $WARNINGS.Add($msg); Write-Host $msg -ForegroundColor Yellow }
    if ($level -eq "INFO")    { $INFOS.Add($msg);    Write-Host $msg -ForegroundColor Gray }
    Add-Content $LOG $msg
}

# Périmètre : racine + js/ + css/ — exclure modules/ atelier/ conseil/ node_modules/
$TARGETS = @(
    Get-ChildItem "$ROOT\*.html" -File -ErrorAction SilentlyContinue
    Get-ChildItem "$ROOT\*.js"   -File -ErrorAction SilentlyContinue
    Get-ChildItem "$ROOT\js\*.js"  -File -ErrorAction SilentlyContinue
    Get-ChildItem "$ROOT\css\*.css" -File -ErrorAction SilentlyContinue
)

Add-Content $LOG "AUDIT HARDCODED DATA — BDB Racine"
Add-Content $LOG "Date : $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Add-Content $LOG "Racine : $ROOT"
Add-Content $LOG "Fichiers analysés : $($TARGETS.Count)"

# -------------------------------------------------------
# 1. NOMS D'INSTANCE VISIBLES (doivent venir de window.bdbApp)
# -------------------------------------------------------
Write-Section "1. Noms d'instance hardcodés"

$INSTANCE_PATTERNS = @{
    "Des Blocs & Moi"     = "ERREUR"
    "DBM"                  = "WARNING"   # peut être acronyme légitime
    "Bible de Bloc"        = "WARNING"   # identifiant technique — interne OK, UI non
    "Chénieux"             = "ERREUR"
    "Chenieux"             = "ERREUR"
    "La Marche"            = "ERREUR"
    "CHU Limoges"          = "ERREUR"
    "Blumedi"              = "ERREUR"
}

foreach ($file in $TARGETS) {
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pattern in $INSTANCE_PATTERNS.Keys) {
            if ($line -match [regex]::Escape($pattern)) {
                # Exclure les commentaires purs et les fichiers de config connus
                if ($line.Trim() -notmatch "^//|^#|^<!--" -or $pattern -eq "ERREUR") {
                    Write-Hit $INSTANCE_PATTERNS[$pattern] $file.FullName $lineNum $line.Trim()
                }
            }
        }
    }
}

# -------------------------------------------------------
# 2. SUPABASE CREDENTIALS HORS supabase-client.js
# -------------------------------------------------------
Write-Section "2. Credentials Supabase hors supabase-client.js"

$SUPABASE_PATTERNS = @(
    "ecpzrygzdugwwkqbsajn"
    "supabase.co"
    "eyJhbGciOiJIUzI"   # début typique clef JWT
    "service_role"
)

foreach ($file in $TARGETS) {
    if ($file.Name -eq "supabase-client.js") { continue }  # autorisé ici
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pattern in $SUPABASE_PATTERNS) {
            if ($line -match [regex]::Escape($pattern)) {
                Write-Hit "ERREUR" $file.FullName $lineNum $line.Trim()
            }
        }
    }
}

# -------------------------------------------------------
# 3. EMAILS ET CONTACTS HARDCODÉS
# -------------------------------------------------------
Write-Section "3. Emails / contacts hardcodés"

foreach ($file in $TARGETS) {
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        if ($line -match "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}") {
            # Exclure patterns légitimes
            if ($line -notmatch "invite@demo\.bdb|example@|user@|x@y\.fr|your@email") {
                Write-Hit "WARNING" $file.FullName $lineNum $line.Trim()
            }
        }
    }
}

# -------------------------------------------------------
# 4. URLS OVH / DOMAINE HARDCODÉES
# -------------------------------------------------------
Write-Section "4. URLs domaine hardcodées"

$URL_PATTERNS = @(
    "hashtag.manuelrohaut.fr"
    "manuelrohaut.fr"
    "ovh.net"
    "ftp."
)

foreach ($file in $TARGETS) {
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pattern in $URL_PATTERNS) {
            if ($line -match [regex]::Escape($pattern)) {
                Write-Hit "ERREUR" $file.FullName $lineNum $line.Trim()
            }
        }
    }
}

# -------------------------------------------------------
# 5. COULEURS ET BRANDING HARDCODÉS (hors cds-overrides)
# -------------------------------------------------------
Write-Section "5. Couleurs branding hardcodées (hors CSS theme)"

$COLOR_PATTERNS = @(
    "#0d6efd"   # couleur primaire instance — doit venir de CSS var ou app_instance
    "#6f42c1"   # violet créateur — OK dans bdb-shell uniquement
    "#ffc107"   # jaune demo — OK dans bdb-shell uniquement
)

foreach ($file in $TARGETS) {
    if ($file.Name -match "bdb-shell|cds-overrides|theme") { continue }
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pattern in $COLOR_PATTERNS) {
            if ($line -match [regex]::Escape($pattern)) {
                Write-Hit "INFO" $file.FullName $lineNum $line.Trim()
            }
        }
    }
}

# -------------------------------------------------------
# 6. VIOLATIONS CDS RACINE (hors modules/)
# -------------------------------------------------------
Write-Section "6. Violations CDS (racine js/ css/)"

$CDS_PATTERNS = @{
    "console\.log"             = "ERREUR"
    "localStorage\."           = "WARNING"
    "onclick="                 = "ERREUR"
    "@latest"                  = "ERREUR"
    "\.min\.js.*supabase"      = "ERREUR"   # doit être supabase.js pas .min.js
    "supabase\.min\.js"        = "ERREUR"
    "initAuth\(\)"             = "ERREUR"
    "user_roles.*select"       = "WARNING"  # doit passer par bdbUser
    "profiles_directory.*select" = "WARNING"
}

foreach ($file in $TARGETS) {
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        foreach ($pattern in $CDS_PATTERNS.Keys) {
            if ($line -match $pattern) {
                # Exclure commentaires
                if ($line.Trim() -notmatch "^//|^<!--") {
                    Write-Hit $CDS_PATTERNS[$pattern] $file.FullName $lineNum $line.Trim()
                }
            }
        }
    }
}

# -------------------------------------------------------
# 7. window.bdbApp / window.bdbUser MAL UTILISÉS
# -------------------------------------------------------
Write-Section "7. Usage incorrect window.bdb*"

foreach ($file in $TARGETS) {
    if ($file.Name -match "bdb-shell") { continue }
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        # window.bdbApp utilisé avant bdbShellReady
        if ($line -match "window\.bdbApp\." -and $line -notmatch "bdbShellReady|DOMContentLoaded") {
            Write-Hit "WARNING" $file.FullName $lineNum $line.Trim()
        }
        # Accès directs à role en anglais
        if ($line -match "role.*==.*'member'" -or $line -match "'member'.*role") {
            Write-Hit "ERREUR" $file.FullName $lineNum $line.Trim()
        }
    }
}

# -------------------------------------------------------
# RAPPORT FINAL
# -------------------------------------------------------
Write-Section "RÉSUMÉ"

$summary = @"
ERREURS  : $($ERRORS.Count)
WARNINGS : $($WARNINGS.Count)
INFOS    : $($INFOS.Count)

Fichiers analysés : $($TARGETS.Count)
Log complet       : $LOG
"@

Write-Host $summary -ForegroundColor White
Add-Content $LOG $summary

if ($ERRORS.Count -gt 0) {
    Write-Host "`nERREURS DÉTAILLÉES :" -ForegroundColor Red
    $ERRORS | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

Write-Host "`nAudit terminé. Log : $LOG" -ForegroundColor Green
Read-Host "`nAppuyer sur Entrée pour fermer"
