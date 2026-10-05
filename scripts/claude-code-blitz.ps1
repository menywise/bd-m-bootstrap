# ============================================================
# CLAUDE-CODE-BLITZ.PS1
# VERSION  : 1.0.0
# DATE     : 2026-04-04
# OBJECTIF : Lancer N fenetres Claude Code en parallele,
#            chacune avec un prompt different (un par module)
# PREREQUIS: Claude Code installe et dans le PATH.
#            Fichier blitz-prompts.txt dans scripts\.
#            Lancer via claude-code-blitz.bat
# USAGE    : .\claude-code-blitz.bat
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
$SCRIPTS_DIR = "$ROOT\scripts"
$PROMPTS_FILE = "$SCRIPTS_DIR\blitz-prompts.txt"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host ""
Write-Host "=== CLAUDE CODE BLITZ ===" -ForegroundColor Cyan
Write-Host ""

# --- Verifier Claude Code dans le PATH ---
$claudePath = Get-Command "claude" -ErrorAction SilentlyContinue
if (-not $claudePath) {
    Write-Host "  ERREUR : 'claude' introuvable dans le PATH" -ForegroundColor Red
    Write-Host "  Installer Claude Code : npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    throw "Claude Code non installe"
}
Write-Host "  Claude Code : $($claudePath.Source)" -ForegroundColor Green

# --- Verifier le fichier de prompts ---
if (-not (Test-Path $PROMPTS_FILE)) {
    Write-Host "  ERREUR : $PROMPTS_FILE introuvable" -ForegroundColor Red
    Write-Host "  Creer le fichier avec le format : NOM_MODULE | PROMPT" -ForegroundColor Yellow
    throw "Fichier blitz-prompts.txt introuvable"
}

# --- Charger les prompts actifs ---
$entries = @()
Get-Content $PROMPTS_FILE | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }

    $parts = $line.Split("|", 2)
    if ($parts.Count -lt 2) {
        Write-Host "  SKIP : ligne mal formee -> $line" -ForegroundColor DarkGray
        return
    }

    $moduleName = $parts[0].Trim()
    $prompt = $parts[1].Trim()
    $entries += [PSCustomObject]@{ Module = $moduleName; Prompt = $prompt }
}

if ($entries.Count -eq 0) {
    Write-Host "  Aucun prompt actif dans $PROMPTS_FILE" -ForegroundColor Yellow
    Write-Host "  Decommenter les lignes souhaitees (retirer le #)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=== RIEN A LANCER ===" -ForegroundColor Cyan
} else {
    Write-Host "  $($entries.Count) prompt(s) actif(s) :" -ForegroundColor Green
    Write-Host ""

    foreach ($e in $entries) {
        $truncated = $e.Prompt
        if ($truncated.Length -gt 80) { $truncated = $truncated.Substring(0, 77) + "..." }
        Write-Host "  [$($e.Module)]  $truncated" -ForegroundColor DarkGray
    }

    Write-Host ""
    $confirm = Read-Host "Lancer $($entries.Count) fenetre(s) Claude Code ? (O/N)"
    if ($confirm -ne "O" -and $confirm -ne "o") {
        Write-Host "  Annule." -ForegroundColor Yellow
    } else {
        Write-Host ""
        $launched = 0

        foreach ($e in $entries) {
            $title = "BLITZ - $($e.Module)"
            # Echapper les guillemets dans le prompt
            $safePrompt = $e.Prompt -replace '"', '\"'

            # Lancer une nouvelle fenetre cmd avec Claude Code
            $cmdArgs = "/k title $title && cd /d $ROOT && claude --dangerously-skip-permissions -p `"$safePrompt`""
            Start-Process "cmd.exe" -ArgumentList $cmdArgs

            Write-Host "  LANCE : $($e.Module)" -ForegroundColor Green
            $launched++

            # Delai entre les lancements (eviter surcharge)
            if ($launched -lt $entries.Count) {
                Start-Sleep -Seconds 2
            }
        }

        Write-Host ""
        Write-Host "  $launched fenetre(s) lancee(s)" -ForegroundColor Green
    }
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
