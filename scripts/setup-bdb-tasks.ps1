# ============================================================
# SETUP-BDB-TASKS.PS1
# VERSION  : 1.1.0
# DATE     : 2026-04-11
# OBJECTIF : Creer ou mettre a jour les taches planifiees BDB
#            BDB-Clean-Gouvernance : 09h00 quotidien
#            BDB-Build-Cockpit     : 09h05 quotidien
#            BDB-Sync-Claude       : 09h10 quotidien
# DELTA    : V1.0.0 -> V1.1.0 : ajout BDB-Clean-Gouvernance 09h00
# PREREQUIS: Lancer en ADMINISTRATEUR via setup-bdb-tasks.bat
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

try {

$ROOT = "C:\DEV\BIBLE_DE_BLOC"

Write-Host ""
Write-Host "=== SETUP TACHES PLANIFIEES BDB ===" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "  ERREUR : droits ADMINISTRATEUR requis." -ForegroundColor Red
    Write-Host "  Clic droit sur setup-bdb-tasks.bat -> Executer en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
    exit 1
}

$taches = @(
    @{ Name="BDB-Clean-Gouvernance"; Heure="09:00"; Bat="$ROOT\scripts\clean-gouvernance.bat"; Desc="BDB - Archiver obsoletes gouvernance + rotation _deltas keep 3" },
    @{ Name="BDB-Build-Cockpit";     Heure="09:05"; Bat="$ROOT\scripts\build-cockpit.bat";     Desc="BDB - Regenere atelier\cockpit.html" },
    @{ Name="BDB-Sync-Claude";       Heure="09:10"; Bat="$ROOT\scripts\sync-projet-claude.bat";Desc="BDB - Synchronise 00_GOUVERNANCE vers _PROJET_CLAUDE" }
)

foreach ($t in $taches) {
    Write-Host "[---] $($t.Name) a $($t.Heure)..." -ForegroundColor Yellow

    if (-not (Test-Path $t.Bat)) {
        Write-Host "  SKIP : $($t.Bat) introuvable" -ForegroundColor Red
        continue
    }

    $existing = Get-ScheduledTask -TaskName $t.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Unregister-ScheduledTask -TaskName $t.Name -Confirm:$false
        Write-Host "  Ancienne tache supprimee" -ForegroundColor DarkGray
    }

    $trigger   = New-ScheduledTaskTrigger -Daily -At $t.Heure
    $action    = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$($t.Bat)`""
    $settings  = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

    Register-ScheduledTask -TaskName $t.Name -Trigger $trigger -Action $action -Settings $settings -Principal $principal -Description $t.Desc -Force | Out-Null
    Write-Host "  OK : $($t.Heure) quotidien" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== SEQUENCE MATINALE BDB ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  09h00  BDB-Clean-Gouvernance  -> archive obsoletes + purge _deltas (keep 3)" -ForegroundColor White
Write-Host "  09h05  BDB-Build-Cockpit      -> regenere atelier\cockpit.html" -ForegroundColor White
Write-Host "  09h10  BDB-Sync-Claude        -> _PROJET_CLAUDE pret pour upload Claude AI" -ForegroundColor White
Write-Host ""
Write-Host "  Verifier : check-bdb-tasks.bat" -ForegroundColor Gray
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
