# ============================================================
# SYNC-PROJET-CLAUDE.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-04
# OBJECTIF : Copier les fichiers gouvernance les plus recents
#            vers _PROJET_CLAUDE pour upload dans Claude AI
# DELTA    : V1.0.0 -> V1.1.0
#            - INTERDIT-PS1 : trap + try/catch + Read-Host
#            - Header standardise
#            - Fix tri version : numerique au lieu de lexicographique
# PREREQUIS: Lancer via sync-projet-claude.bat
# USAGE    : .\sync-projet-claude.bat
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

# --- Fonction : extraire version numerique pour tri ---
function Get-VersionScore {
    param([string]$fileName)
    # Extrait Vx_y_z et retourne un entier triable
    # V1_16_0 -> 1*10000 + 16*100 + 0 = 11600
    # V1_9_0  -> 1*10000 + 9*100  + 0 = 10900
    # V2_4_0  -> 2*10000 + 4*100  + 0 = 20400
    if ($fileName -match '_V(\d+)_(\d+)_?(\d*)') {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        $patch = if ($matches[3] -ne '') { [int]$matches[3] } else { 0 }
        return ($major * 10000) + ($minor * 100) + $patch
    }
    return 0
}

function Get-LatestVersioned {
    param([System.IO.FileInfo[]]$files)

    # Groupe par nom de base (sans _Vx_y_z.md)
    $groups = @{}
    foreach ($f in $files) {
        if ($f.BaseName -match '^(.+?)(_V\d+_\d+_?\d*)?$') {
            $base = $matches[1]
        } else {
            $base = $f.BaseName
        }
        if (-not $groups.ContainsKey($base)) { $groups[$base] = @() }
        $groups[$base] += $f
    }

    # Pour chaque groupe, retourne le fichier avec la version la plus haute
    $result = @()
    foreach ($base in $groups.Keys) {
        $group = $groups[$base]
        if ($group.Count -eq 1) {
            $result += $group[0]
        } else {
            # Tri numerique par score de version (pas lexicographique)
            $sorted = $group | Sort-Object { Get-VersionScore $_.Name } -Descending
            $latest = $sorted | Select-Object -First 1
            $skipped = $sorted | Select-Object -Skip 1
            foreach ($s in $skipped) {
                Write-Host "  SKIP   : $($s.Name)  (version inferieure)" -ForegroundColor DarkGray
            }
            $result += $latest
        }
    }
    return $result
}

# --- FILET 2 : try/catch corps entier ---
try {

$src    = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
$srcCtx = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\CTX"
$dst    = "C:\DEV\BIBLE_DE_BLOC\_PROJET_CLAUDE"

Write-Host ""
Write-Host "=== SYNC PROJET CLAUDE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  SRC      : $src"
Write-Host "  SRC\CTX  : $srcCtx"
Write-Host "  DST      : $dst"
Write-Host ""

if (-not (Test-Path $src)) { throw "Dossier source introuvable : $src" }

# Vider la destination pour eviter les anciens fichiers renommes
if (Test-Path $dst) {
    Remove-Item "$dst\*.md" -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$copied = 0

# --- Racine 00_GOUVERNANCE ---
Write-Host "[1/2] Racine 00_GOUVERNANCE..." -ForegroundColor Yellow
$rootFiles = Get-ChildItem -Path $src -Filter "*.md" -File
$rootFiles = Get-LatestVersioned $rootFiles
foreach ($f in $rootFiles) {
    Copy-Item $f.FullName $dst -Force
    Write-Host "  OK     : $($f.Name)" -ForegroundColor Green
    $copied++
}

# --- Sous-dossier CTX\ ---
Write-Host ""
Write-Host "[2/2] Sous-dossier CTX..." -ForegroundColor Yellow
if (Test-Path $srcCtx) {
    $ctxFiles = Get-ChildItem -Path $srcCtx -Filter "*.md" -File
    $ctxFiles = Get-LatestVersioned $ctxFiles
    foreach ($f in $ctxFiles) {
        Copy-Item $f.FullName $dst -Force
        Write-Host "  OK/CTX : $($f.Name)" -ForegroundColor Green
        $copied++
    }
} else {
    Write-Host "  INFO : dossier CTX absent, ignore" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "  $copied fichier(s) copies vers $dst" -ForegroundColor Gray
Write-Host ""
Write-Host "  PRET - uploader _PROJET_CLAUDE dans Project Knowledge" -ForegroundColor Green
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
