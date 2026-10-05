# ============================================================
# AUDIT-GOUVERNANCE.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-04
# OBJECTIF : Detecter doublons, deltas non appliques,
#            fichiers remplaces par atelier_*
# DELTA    : V1.0.0 -> V1.1.0
#            - INTERDIT-PS1 : trap + try/catch + Read-Host
#            - Header standardise avec OBJECTIF
# PREREQUIS: Lancer via audit-gouvernance.bat
# USAGE    : .\audit-gouvernance.bat
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
$gouvernance = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
$deltasDir = "$gouvernance\_deltas"

# --- FILET 2 : try/catch corps entier ---
try {

if (-not (Test-Path $gouvernance)) {
    throw "Dossier introuvable : $gouvernance"
}

Write-Host ""
Write-Host "=== AUDIT GOUVERNANCE BDB ===" -ForegroundColor Cyan
Write-Host "Dossier : $gouvernance" -ForegroundColor DarkGray
Write-Host ""

# --- 1. Inventaire ---
$tous = Get-ChildItem -Path $gouvernance -Filter "*.md" -Recurse -File |
    Where-Object { $_.DirectoryName -notlike "*\_deltas*" -and $_.DirectoryName -notlike "*\ARCHIVES*" }
Write-Host "Fichiers .md trouves : $($tous.Count)" -ForegroundColor White

# --- 2. Doublons de version ---
Write-Host ""
Write-Host "--- DOUBLONS DE VERSION ---" -ForegroundColor Yellow

$groupes = $tous | ForEach-Object {
    $base = $_.Name -replace '_V\d+_\d+_\d+\.md$', ''
    [PSCustomObject]@{ Base = $base; Fichier = $_.Name; FullName = $_.FullName }
} | Group-Object -Property Base | Where-Object { $_.Count -gt 1 }

if ($groupes.Count -eq 0) {
    Write-Host "  Aucun doublon detecte" -ForegroundColor Green
} else {
    foreach ($g in $groupes) {
        Write-Host "  $($g.Name) :" -ForegroundColor Yellow
        $tries = $g.Group | Sort-Object Fichier
        for ($i = 0; $i -lt $tries.Count; $i++) {
            if ($i -lt $tries.Count - 1) {
                Write-Host "    X  $($tries[$i].Fichier)  (ancien)" -ForegroundColor Red
            } else {
                Write-Host "    OK $($tries[$i].Fichier)  (garder)" -ForegroundColor Green
            }
        }
    }
}

# --- 3. Deltas et patches non appliques ---
Write-Host ""
Write-Host "--- DELTAS / PATCHES NON APPLIQUES ---" -ForegroundColor Magenta

$deltas_fichiers = $tous | Where-Object {
    $_.Name -match "DELTA|PATCH" -and $_.DirectoryName -notlike "*\_deltas*"
}

if ($deltas_fichiers.Count -eq 0) {
    Write-Host "  Aucun delta/patch en attente" -ForegroundColor Green
} else {
    foreach ($d in $deltas_fichiers) {
        Write-Host "  !  $($d.Name)" -ForegroundColor Magenta
        if ($d.Name -match "DATA_MODEL") {
            $cible = $tous | Where-Object { $_.Name -match "SUPABASE_DATA_MODEL" -and $_.Name -notmatch "DELTA" } | Select-Object -First 1
            if ($cible) { Write-Host "     Cible : $($cible.Name)" -ForegroundColor DarkGray }
        }
        if ($d.Name -match "PATCH.*SESSION.*(\d+)") {
            Write-Host "     Action : lire le contenu pour identifier les cibles" -ForegroundColor DarkGray
        }
    }
}

# --- 4. Fichiers remplaces par atelier_* ---
Write-Host ""
Write-Host "--- REMPLACES PAR ATELIER_* (a archiver) ---" -ForegroundColor Red

$remplaces_patterns = @(
    @{ Pattern = "JOURNAL_DECISIONS";  Raison = "atelier_decisions (107 lignes en base)" },
    @{ Pattern = "PROMPT_REPRISE";     Raison = "RPC atelier_prompt_reprise()" },
    @{ Pattern = "BACKLOG_SESSIONS";   Raison = "atelier_sessions (27 lignes en base)" }
)

$a_archiver = @()
foreach ($r in $remplaces_patterns) {
    $trouves = $tous | Where-Object { $_.Name -match $r.Pattern }
    foreach ($t in $trouves) {
        Write-Host "  X  $($t.Name)" -ForegroundColor Red
        Write-Host "     Remplace par : $($r.Raison)" -ForegroundColor DarkGray
        $a_archiver += $t
    }
}

if ($a_archiver.Count -eq 0) {
    Write-Host "  Aucun fichier a archiver" -ForegroundColor Green
}

# --- 5. Fichiers conserves ---
Write-Host ""
Write-Host "--- GARDER (references statiques) ---" -ForegroundColor Green

$noms_suppr = @()
$noms_suppr += ($deltas_fichiers | ForEach-Object { $_.Name })
$noms_suppr += ($a_archiver | ForEach-Object { $_.Name })
if ($groupes.Count -gt 0) {
    foreach ($g in $groupes) {
        $tries = $g.Group | Sort-Object Fichier
        for ($i = 0; $i -lt $tries.Count - 1; $i++) {
            $noms_suppr += $tries[$i].Fichier
        }
    }
}

$garder = $tous | Where-Object { $_.Name -notin $noms_suppr }
foreach ($f in ($garder | Sort-Object Name)) {
    Write-Host "  OK $($f.Name)" -ForegroundColor Green
}

# --- 6. Resume ---
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
$nbDoublons = 0
if ($groupes) {
    $nbDoublons = ($groupes | ForEach-Object { $_.Count - 1 } | Measure-Object -Sum).Sum
}
Write-Host "  Total fichiers   : $($tous.Count)" -ForegroundColor White
Write-Host "  Doublons         : $nbDoublons" -ForegroundColor Yellow
Write-Host "  Deltas/patches   : $($deltas_fichiers.Count)" -ForegroundColor Magenta
Write-Host "  A archiver       : $($a_archiver.Count)" -ForegroundColor Red
Write-Host "  Garder           : $($garder.Count)" -ForegroundColor Green
Write-Host ""

# --- 7. Archive existante ---
if (Test-Path $deltasDir) {
    $archives = Get-ChildItem -Path $deltasDir -Filter "*.md" -File
    Write-Host "  Deja archives    : $($archives.Count) fichier(s) dans _deltas\" -ForegroundColor DarkGray
} else {
    Write-Host "  Dossier _deltas\ : inexistant" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Ce script ne modifie rien. Utiliser Claude Code pour executer." -ForegroundColor DarkGray
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
