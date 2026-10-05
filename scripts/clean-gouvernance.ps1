# ============================================================
# CLEAN-GOUVERNANCE.PS1
# VERSION  : 1.2.0
# DATE     : 2026-04-11
# OBJECTIF : Archiver les fichiers de gouvernance obsoletes
#            (anciennes versions remplacees par une version superieure)
#            Destination : 00_GOUVERNANCE\_deltas\
#            Rotation    : garder les 3 dernières versions par fichier
#                          supprimer le reste de _deltas\
# DELTA    : V1.1.0 -> V1.2.0
#            - Rotation _deltas\ : Keep-Last = 3 (configurable)
#            - Suppression permanente des versions au-dela de Keep-Last
# PREREQUIS: Sauvegarde quotidienne executee (BDB-Backup-Quotidien)
#            Lancer via clean-gouvernance.bat
# USAGE    : .\clean-gouvernance.bat
# ============================================================

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
$ROOT      = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
$ARCHIVE   = "$ROOT\_deltas"
$KEEP_LAST = 3   # Nombre de versions a conserver dans _deltas\ par fichier de base

# --- Fonction : score version numerique ---
function Get-VersionScore {
    param([string]$fileName)
    if ($fileName -match '_V(\d+)_(\d+)_?(\d*)') {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        $patch = if ($matches[3] -ne '') { [int]$matches[3] } else { 0 }
        return ($major * 10000) + ($minor * 100) + $patch
    }
    return 0
}

# --- FILET 2 : try/catch corps entier ---
try {

$LOG    = @()
$moved  = 0
$purged = 0

Write-Host ""
Write-Host "=== NETTOYAGE GOUVERNANCE ===" -ForegroundColor Cyan
Write-Host "  Source      : $ROOT" -ForegroundColor Gray
Write-Host "  Archive     : $ARCHIVE" -ForegroundColor Gray
Write-Host "  Rotation    : garder les $KEEP_LAST derniere(s) version(s) par fichier" -ForegroundColor Gray
Write-Host ""

# S'assurer que le dossier archive existe
if (-not (Test-Path $ARCHIVE)) {
    New-Item -ItemType Directory -Path $ARCHIVE -Force | Out-Null
    Write-Host "  Dossier _deltas cree" -ForegroundColor Yellow
}

# -------------------------------------------------------
# ETAPE 1 : Archiver les obsoletes de 00_GOUVERNANCE
# -------------------------------------------------------
Write-Host "[1/3] Archivage obsoletes depuis 00_GOUVERNANCE..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Path $ROOT -Filter "*.md" -File |
    Where-Object { $_.Name -match '_V\d+_\d+_?\d*\.md$' }

$groups = @{}
foreach ($f in $allFiles) {
    if ($f.Name -match '^(.+?)_V\d+') {
        $prefix = $Matches[1]
        if (-not $groups.ContainsKey($prefix)) { $groups[$prefix] = @() }
        $groups[$prefix] += $f
    }
}

foreach ($prefix in $groups.Keys | Sort-Object) {
    $files = $groups[$prefix] | Sort-Object { Get-VersionScore $_.Name } -Descending
    if ($files.Count -le 1) { continue }

    $keeper    = $files[0]
    $obsoletes = $files | Select-Object -Skip 1

    foreach ($old in $obsoletes) {
        $dest = Join-Path $ARCHIVE $old.Name
        if (Test-Path $dest) {
            Write-Host "  SKIP $($old.Name) (deja archive)" -ForegroundColor Gray
            continue
        }
        Move-Item -Path $old.FullName -Destination $dest
        Write-Host "  ARCHIVE $($old.Name)" -ForegroundColor DarkYellow
        Write-Host "          -> garde $($keeper.Name)" -ForegroundColor Green
        $LOG += "ARCHIVE : $($old.Name)"
        $moved++
    }
}

# Fichiers specifiquement obsoletes (liste manuelle)
$manualObsoletes = @(
    "NOYAU_VERITE_V2_4_0.md",
    "CTX_DISC_V2_4_0.md",
    "CTX_EXPORT_LOGICIEL_METIER_V1_1_0.md",
    "CTX_PAXIS_V2_0_0.md",
    "CTX_TEMPLATE_VIERGE_V1_1_0.md",
    "AUDIT_DATA_MODEL_V1_9_0.md",
    "AUDIT_CONFORMITE_CLOUD_V1_0_0.md",
    "AUDIT_RLS_CLOUD_V1_0_0.md",
    "PROMPT_REPRISE_BDB_V3_4_0.md",
    "PROMPT_REPRISE_BDB_V3_5_0.md",
    "11_GUIDE_TRAVAIL_SESSION_V1_3_0.md"
)

foreach ($name in $manualObsoletes) {
    $path = Join-Path $ROOT $name
    if (Test-Path $path) {
        $dest = Join-Path $ARCHIVE $name
        if (Test-Path $dest) {
            Write-Host "  SKIP $name (deja archive)" -ForegroundColor Gray
            continue
        }
        Move-Item -Path $path -Destination $dest
        Write-Host "  ARCHIVE $name (obsolete manuel)" -ForegroundColor DarkYellow
        $LOG += "ARCHIVE manuel : $name"
        $moved++
    }
}

Write-Host "  $moved fichier(s) archives" -ForegroundColor Green

# -------------------------------------------------------
# ETAPE 2 : Rotation _deltas\ — garder $KEEP_LAST versions
# -------------------------------------------------------
Write-Host ""
Write-Host "[2/3] Rotation _deltas\ (keep $KEEP_LAST)..." -ForegroundColor Yellow

$deltaFiles = Get-ChildItem -Path $ARCHIVE -Filter "*.md" -File |
    Where-Object { $_.Name -match '_V\d+_\d+_?\d*\.md$' }

$deltaGroups = @{}
foreach ($f in $deltaFiles) {
    if ($f.Name -match '^(.+?)_V\d+') {
        $prefix = $Matches[1]
        if (-not $deltaGroups.ContainsKey($prefix)) { $deltaGroups[$prefix] = @() }
        $deltaGroups[$prefix] += $f
    }
}

foreach ($prefix in $deltaGroups.Keys | Sort-Object) {
    $files = $deltaGroups[$prefix] | Sort-Object { Get-VersionScore $_.Name } -Descending
    if ($files.Count -le $KEEP_LAST) { continue }

    $toDelete = $files | Select-Object -Skip $KEEP_LAST
    foreach ($old in $toDelete) {
        Remove-Item $old.FullName -Force
        Write-Host "  PURGE $($old.Name)" -ForegroundColor Red
        $LOG += "PURGE : $($old.Name)"
        $purged++
    }
}

if ($purged -eq 0) {
    Write-Host "  Rien a purger" -ForegroundColor Gray
}

# -------------------------------------------------------
# ETAPE 3 : Resume
# -------------------------------------------------------
Write-Host ""
Write-Host "[3/3] Resume..." -ForegroundColor Yellow

$remaining = (Get-ChildItem -Path $ROOT -Filter "*.md" -File).Count
$inDeltas  = (Get-ChildItem -Path $ARCHIVE -Filter "*.md" -File -ErrorAction SilentlyContinue).Count

Write-Host ""
Write-Host "=== RESULTAT ===" -ForegroundColor Cyan
Write-Host "  Archives  : $moved fichier(s) deplaces vers _deltas\" -ForegroundColor DarkYellow
Write-Host "  Purges    : $purged fichier(s) supprimes de _deltas\ (rotation keep $KEEP_LAST)" -ForegroundColor Red
Write-Host "  Gouvernance : $remaining fichier(s) restants" -ForegroundColor Green
Write-Host "  _deltas\    : $inDeltas fichier(s)" -ForegroundColor Gray

if ($LOG.Count -gt 0) {
    Write-Host ""
    Write-Host "  Detail :" -ForegroundColor Gray
    foreach ($l in $LOG) { Write-Host "    $l" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
