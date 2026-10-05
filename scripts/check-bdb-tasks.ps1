# ============================================================
# CHECK-BDB-TASKS.PS1
# VERSION  : 1.0.2
# DATE     : 2026-04-11
# OBJECTIF : Verifier l'etat des taches planifiees Windows BDB
# STATUT   : perenne
# DELTA    : V1.0.1 -> V1.0.2
#            - Code 267011 (SCHED_S_TASK_HAS_NOT_RUN) affiche
#              "Jamais execute" et non "ERREUR"
#            - BDB-Backup-Quotidien ajoute aux taches attendues
# PREREQUIS: Lancer via check-bdb-tasks.bat
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

# Code Windows Scheduler : tache jamais executee (pas une erreur)
$SCHED_S_TASK_HAS_NOT_RUN = 267011

try {

Write-Host ""
Write-Host "=== BDB TACHES PLANIFIEES ===" -ForegroundColor Cyan
Write-Host ""

$tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "BDB*" } | Sort-Object TaskName

if ($tasks.Count -eq 0) {
    Write-Host "  AUCUNE tache planifiee BDB trouvee." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Pour creer les taches : .\scripts\setup-bdb-tasks.bat" -ForegroundColor Gray
} else {
    Write-Host "  $($tasks.Count) tache(s) trouvee(s) :" -ForegroundColor Green
    Write-Host ""

    foreach ($task in $tasks) {
        $info = Get-ScheduledTaskInfo -TaskName $task.TaskName -ErrorAction SilentlyContinue

        if ($task.State -eq 'Ready') {
            $stateColor = 'Green'
        } elseif ($task.State -eq 'Running') {
            $stateColor = 'Cyan'
        } elseif ($task.State -eq 'Disabled') {
            $stateColor = 'Red'
        } else {
            $stateColor = 'Yellow'
        }

        Write-Host "  --- $($task.TaskName) ---" -ForegroundColor White
        Write-Host "  Etat         : " -NoNewline
        Write-Host "$($task.State)" -ForegroundColor $stateColor

        if ($info) {
            if ($info.LastRunTime -and $info.LastRunTime -gt [datetime]'1900-01-01') {
                $lastRun = $info.LastRunTime.ToString("yyyy-MM-dd HH:mm:ss")
            } else {
                $lastRun = "jamais"
            }

            if ($info.NextRunTime -and $info.NextRunTime -gt [datetime]'1900-01-01') {
                $nextRun = $info.NextRunTime.ToString("yyyy-MM-dd HH:mm:ss")
            } else {
                $nextRun = "---"
            }

            $resultCode = $info.LastTaskResult
            if ($resultCode -eq 0) {
                $lastRes = "OK (0)"
                $lastResColor = 'Green'
            } elseif ($resultCode -eq $SCHED_S_TASK_HAS_NOT_RUN) {
                $lastRes = "Jamais execute"
                $lastResColor = 'Gray'
            } else {
                $lastRes = "ERREUR ($resultCode)"
                $lastResColor = 'Red'
            }

            Write-Host "  Derniere exec: $lastRun"
            Write-Host "  Dernier code : " -NoNewline
            Write-Host $lastRes -ForegroundColor $lastResColor
            Write-Host "  Prochaine    : $nextRun"
        }

        if ($task.Triggers) {
            foreach ($t in $task.Triggers) {
                $cn = $t.CimClass.CimClassName
                if ($cn -eq "MSFT_TaskDailyTrigger") {
                    $heure = $t.StartBoundary.Substring(11, 5)
                    Write-Host "  Declencheur  : Quotidien a $heure"
                } elseif ($cn -eq "MSFT_TaskWeeklyTrigger") {
                    Write-Host "  Declencheur  : Hebdomadaire"
                } else {
                    Write-Host "  Declencheur  : $cn"
                }
            }
        }

        if ($task.Actions) {
            foreach ($a in $task.Actions) {
                Write-Host "  Commande     : $($a.Execute) $($a.Arguments)"
            }
        }

        Write-Host ""
    }
}

Write-Host "=== SEQUENCE MATINALE ATTENDUE ===" -ForegroundColor Cyan
Write-Host ""

$expected = @(
    @{ Name="BDB-Clean-Gouvernance"; Heure="09h00"; Role="Archive obsoletes + rotation _deltas" },
    @{ Name="BDB-Build-Cockpit";     Heure="09h05"; Role="Regenere atelier\cockpit.html"        },
    @{ Name="BDB-Sync-Claude";       Heure="09h10"; Role="Gouvernance vers _PROJET_CLAUDE"       },
    @{ Name="BDB-Backup-Quotidien";  Heure="10h00"; Role="Sauvegarde C:\DEV\SCRIPTS\bdb-backup.ps1" }
)

foreach ($e in $expected) {
    $exists = $tasks | Where-Object { $_.TaskName -eq $e.Name }
    if ($exists) {
        Write-Host "  [OK]     $($e.Heure)  $($e.Name)" -ForegroundColor Green
    } else {
        Write-Host "  [MANQUE] $($e.Heure)  $($e.Name)  ->  $($e.Role)" -ForegroundColor Red
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

Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
