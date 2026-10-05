# ============================================================
# BUILD-COCKPIT.PS1
# VERSION  : 1.2.0
# DATE     : 2026-04-25
# OBJECTIF : Generer cockpit.html depuis l'etat reel du filesystem
#            Scanne scripts\, 00_GOUVERNANCE\, detecte versions
# DELTA    : V1.1.0 -> V1.2.0
#            - Chaine CSS V5 : BS 5.3.3, hash @63905396, zéro theme-print
#            - Suppression atelier-base.css (BANNI §9.2)
#            - Commentaire BDB Surface en tete du HTML genere
# PREREQUIS: Lancer via build-cockpit.bat
#            Ou en tache planifiee post-backup (09h05)
# USAGE    : .\build-cockpit.bat
# ============================================================

# --- FILET 1 : trap global ---
trap {
    Write-Host ""
    Write-Host "!!! ERREUR FATALE !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host $_.InvocationInfo.Line.Trim() -ForegroundColor DarkRed
    Write-Host ""
    if ([Environment]::UserInteractive) {
        Read-Host "Appuie sur Entree pour fermer"
    }
    exit 1
}

$ErrorActionPreference = "Stop"
$ROOT = "C:\DEV\BIBLE_DE_BLOC"
$SCRIPTS_DIR = "$ROOT\scripts"
$GOV_DIR = "$ROOT\00_GOUVERNANCE"
$OUTPUT = "$ROOT\createur\atelier\cockpit.html"

# --- FILET 2 : try/catch corps entier ---
try {

Write-Host "=== BUILD COCKPIT ===" -ForegroundColor Cyan

# --- 1. Scanner les scripts PS1 ---
$scripts = @()
if (Test-Path $SCRIPTS_DIR) {
    Get-ChildItem "$SCRIPTS_DIR\*.ps1" | Where-Object { $_.Name -ne "build-cockpit.ps1" } | ForEach-Object {
        $name = $_.Name
        $desc = ""
        $icon = "bi-file-code"
        $color = "secondary"
        # Lire le header pour trouver OBJECTIF
        $lines = Get-Content $_.FullName -TotalCount 15 -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match '^\s*#\s*OBJECTIF\s*:\s*(.+)$') {
                $desc = $Matches[1].Trim()
                break
            }
        }
        if (-not $desc) {
            # Fallback : premiere ligne de commentaire non vide apres le header
            foreach ($line in $lines) {
                if ($line -match '^\s*#\s+[A-Z]' -and $line -notmatch '={3,}' -and $line -notmatch 'VERSION|DATE|USAGE|PREREQUIS') {
                    $desc = ($line -replace '^\s*#\s*', '').Trim()
                    break
                }
            }
        }
        if (-not $desc) { $desc = "Script PowerShell" }
        # Icones par convention de nom
        if ($name -like '*start*') { $icon = "bi-play-circle"; $color = "success" }
        elseif ($name -like '*check*' -or $name -like '*audit*') { $icon = "bi-shield-check"; $color = "warning" }
        elseif ($name -like '*sync*') { $icon = "bi-cloud-arrow-up"; $color = "info" }
        elseif ($name -like '*clean*') { $icon = "bi-archive"; $color = "danger" }
        elseif ($name -like '*compare*') { $icon = "bi-arrow-left-right"; $color = "primary" }
        elseif ($name -like '*build*') { $icon = "bi-hammer"; $color = "primary" }
        elseif ($name -like '*deploy*' -or $name -like '*ftp*') { $icon = "bi-upload"; $color = "success" }
        elseif ($name -like '*claude*' -or $name -like '*blitz*') { $icon = "bi-terminal"; $color = "info" }
        $scripts += [PSCustomObject]@{ Name=$name; Desc=$desc; Icon=$icon; Color=$color }
    }
}
Write-Host "  $($scripts.Count) scripts detectes" -ForegroundColor Green

# --- 2. Scanner les fichiers gouvernance ---
$govFiles = @()
$versionGroups = @{}
if (Test-Path $GOV_DIR) {
    Get-ChildItem "$GOV_DIR\*.md" -File | ForEach-Object {
        $name = $_.Name
        $date = $_.LastWriteTime.ToString("dd/MM HH:mm")
        $version = ""
        $prefix = ""
        $status = "ok"
        $note = ""

        if ($name -match '^(.+?)_V(\d+)_(\d+)_(\d+)\.md$') {
            $prefix = $Matches[1]
            $version = "V$($Matches[2]).$($Matches[3]).$($Matches[4])"
            if (-not $versionGroups.ContainsKey($prefix)) {
                $versionGroups[$prefix] = @()
            }
            $versionGroups[$prefix] += [PSCustomObject]@{ Name=$name; Version=$version; Date=$date; Major=[int]$Matches[2]; Minor=[int]$Matches[3]; Patch=[int]$Matches[4] }
        }
        elseif ($name -match 'DELTA|PATCH|PROMPT_REPRISE|PROMPT_CLAUDE') {
            $status = "delta"
            $note = "Delta / Patch"
            $govFiles += [PSCustomObject]@{ Name=$name; Version=""; Date=$date; Status=$status; Note=$note }
        }
        else {
            $govFiles += [PSCustomObject]@{ Name=$name; Version=""; Date=$date; Status="ok"; Note="" }
        }
    }
}

# Determiner courant vs obsolete dans chaque groupe
foreach ($prefix in $versionGroups.Keys) {
    $sorted = $versionGroups[$prefix] | Sort-Object Major, Minor, Patch -Descending
    $latest = $sorted[0]
    $govFiles += [PSCustomObject]@{ Name=$latest.Name; Version=$latest.Version; Date=$latest.Date; Status="ok"; Note="Courant" }
    if ($sorted.Count -gt 1) {
        $sorted | Select-Object -Skip 1 | ForEach-Object {
            $govFiles += [PSCustomObject]@{ Name=$_.Name; Version=$_.Version; Date=$_.Date; Status="obsolete"; Note="Remplace par $($latest.Name)" }
        }
    }
}
$govFiles = $govFiles | Sort-Object Name

$nbOk = ($govFiles | Where-Object { $_.Status -eq "ok" }).Count
$nbObs = ($govFiles | Where-Object { $_.Status -eq "obsolete" }).Count
$nbDelta = ($govFiles | Where-Object { $_.Status -eq "delta" }).Count
Write-Host "  $($govFiles.Count) fichiers gouvernance ($nbOk courants, $nbObs obsoletes, $nbDelta deltas)" -ForegroundColor Green

# --- 3. Scanner les migrations ---
$migCount = 0
$lastMig = ""
if (Test-Path "$ROOT\migrations") {
    $migs = Get-ChildItem "$ROOT\migrations\*.sql" | Sort-Object Name
    $migCount = $migs.Count
    if ($migs.Count -gt 0) { $lastMig = $migs[-1].Name }
}

# --- 3b. Scanner l'arborescence (top-level) ---
$arboHtml = ""
$topDirs = Get-ChildItem $ROOT -Directory | Where-Object { $_.Name -notmatch '^\.' } | Sort-Object Name
foreach ($d in $topDirs) {
    $childCount = (Get-ChildItem $d.FullName -File -ErrorAction SilentlyContinue).Count
    $subDirs = (Get-ChildItem $d.FullName -Directory -ErrorAction SilentlyContinue).Count
    $info = ""
    if ($childCount -gt 0 -or $subDirs -gt 0) { $info = "($childCount fichiers, $subDirs sous-dossiers)" }
    $arboHtml += "              <tr><td><i class=`"bi bi-folder text-warning me-1`"></i> $($d.Name)\</td><td class=`"text-muted`">$info</td></tr>`n"
}
# Fichiers racine importants (exclure _dev\)
$rootImportFiles = Get-ChildItem $ROOT -File | Where-Object { $_.Extension -in '.html','.ps1','.txt','.json','.md' } | Sort-Object Name
foreach ($f in $rootImportFiles) {
    $arboHtml += "              <tr><td><i class=`"bi bi-file-earmark text-secondary me-1`"></i> $($f.Name)</td><td class=`"text-muted`">$('{0:N0}' -f ($f.Length / 1KB)) KB</td></tr>`n"
}

# --- 3c. Lire le memo (fichier cockpit-memo.txt) ---
$memoHtml = ""
$memoPath = "$SCRIPTS_DIR\cockpit-memo.txt"
if (Test-Path $memoPath) {
    $memoLines = Get-Content $memoPath -ErrorAction SilentlyContinue
    foreach ($line in $memoLines) {
        $line = $line.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { continue }
        $memoHtml += "            <p class=`"mb-1`">$line</p>`n"
    }
} else {
    $memoHtml = "            <p class=`"mb-1 text-muted`"><em>Creer scripts\cockpit-memo.txt pour afficher le memo terrain</em></p>`n"
}


# --- 4. Generer le HTML ---
$now = Get-Date -Format "dd/MM/yyyy HH:mm"

$scriptsHtml = ""
foreach ($s in $scripts) {
    $scriptsHtml += @"
      <div class="col-md-4">
        <div class="tool-card">
          <div class="d-flex align-items-start gap-3">
            <div class="tool-icon bg-$($s.Color) bg-opacity-10 text-$($s.Color)"><i class="$($s.Icon)"></i></div>
            <div>
              <h6>$($s.Name)</h6>
              <p>$($s.Desc)</p>
              <div class="cmd-block">.\scripts\$($s.Name)</div>
            </div>
          </div>
        </div>
      </div>
"@
}

$govRowsHtml = ""
foreach ($g in $govFiles) {
    $dotClass = "status-ok"
    $label = $g.Note
    if ($g.Status -eq "obsolete") { $dotClass = "status-err"; if (-not $label) { $label = "Obsolete" } }
    elseif ($g.Status -eq "delta") { $dotClass = "status-warn"; if (-not $label) { $label = "Delta" } }
    else { if (-not $label) { $label = "" } }
    $govRowsHtml += "              <tr><td>$($g.Name)</td><td>$($g.Version)</td><td>$($g.Date)</td><td><span class=`"status-dot $dotClass`"></span> $label</td></tr>`n"
}

$html = @"
<!DOCTYPE html>
<!-- BDB | Surface: L3-CREATEUR | Auth: isCreator | Shell: non -->
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Poste de pilotage</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/gh/menywise/BDB@63905396c73b061f336f8f5178d738627bca601c/theme-base.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <link href="../../css/cds-overrides.css" rel="stylesheet">
  <link href="cockpit-ui.css" rel="stylesheet">
</head>
<body>

  <div class="cockpit-header">
    <div class="d-flex align-items-center gap-3">
      <i class="bi bi-speedometer2 fs-3 text-info"></i>
      <div>
        <h1>Poste de pilotage <span class="app-nom"></span></h1>
        <small>Genere le $now -- ne pas deployer sur OVH</small>
      </div>
      <div class="ms-auto d-flex align-items-center gap-2">
        <span class="version-tag">Migrations $migCount fichiers</span>
        <span class="version-tag">Gouvernance $($govFiles.Count) fichiers</span>
      </div>
    </div>
  </div>

  <div class="container-fluid p-4">

    <!-- KPIs -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-2">
        <div class="tool-card text-center">
          <div class="kpi-num">$($scripts.Count)</div>
          <div class="kpi-label">Scripts</div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div class="tool-card text-center">
          <div class="kpi-num">$nbOk</div>
          <div class="kpi-label">Fichiers courants</div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div class="tool-card text-center">
          <div class="kpi-num text-danger">$nbObs</div>
          <div class="kpi-label">Obsoletes</div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div class="tool-card text-center">
          <div class="kpi-num text-warning">$nbDelta</div>
          <div class="kpi-label">Deltas en attente</div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div class="tool-card text-center">
          <div class="kpi-num">$migCount</div>
          <div class="kpi-label">Migrations SQL</div>
        </div>
      </div>
    </div>

    <!-- CLAUDE CODE -->
    <div class="row g-2 mb-4">
      <div class="col-12 col-md-6">
        <div class="link-card link-card-claude py-2">
          <i class="bi bi-terminal-fill fs-5"></i>
          <div class="ck-text-sm">
            <strong>Claude Code</strong> &mdash; lanceur : <code>scripts\claude-launcher.hta</code>
          </div>
        </div>
      </div>
    </div>

    <!-- SCRIPTS -->
    <div class="section-title"><i class="bi bi-terminal me-1"></i> Scripts disponibles</div>
    <div class="row g-3 mb-4">
$scriptsHtml
    </div>

    <!-- ACCES RAPIDES -->
    <div class="section-title"><i class="bi bi-link-45deg me-1"></i> Acces rapides</div>
    <div class="row g-2 mb-4">
      <div class="col-6 col-md-3"><a href="http://localhost:5500" class="link-card" target="_blank"><i class="bi bi-globe"></i> <span class="app-nom"></span> local (5500)</a></div>
      <div class="col-6 col-md-3"><a href="http://127.0.0.1:54323/project/default/sql" class="link-card" target="_blank"><i class="bi bi-database"></i> SQL Editor</a></div>
      <div class="col-6 col-md-3"><a href="http://127.0.0.1:54323" class="link-card" target="_blank"><i class="bi bi-layout-wtf"></i> Supabase Studio</a></div>
      <div class="col-6 col-md-3"><a href="https://claude.ai" class="link-card" target="_blank"><i class="bi bi-chat-dots"></i> Claude AI</a></div>
      <div class="col-6 col-md-3"><a href="https://supabase.com/dashboard" class="link-card" target="_blank"><i class="bi bi-cloud"></i> Supabase Cloud</a></div>
      <div class="col-6 col-md-3"><a href="../../index.html" class="link-card"><i class="bi bi-house"></i> Portail <span class="app-nom"></span></a></div>
      <div class="col-6 col-md-3"><a href="../../modules/thesaurus/index.html" class="link-card"><i class="bi bi-book"></i> Thesaurus</a></div>
      <div class="col-6 col-md-3"><a href="../../modules/admin/index.html" class="link-card"><i class="bi bi-gear"></i> Admin</a></div>
    </div>

    <!-- GOUVERNANCE -->
    <div class="section-title"><i class="bi bi-file-earmark-text me-1"></i> Fichiers gouvernance</div>
    <div class="tool-card p-0 mb-4">
      <div class="table-responsive">
        <table class="table gov-table mb-0">
          <thead class="table-light">
            <tr><th>Fichier</th><th>Version</th><th>Modifie</th><th>Etat</th></tr>
          </thead>
          <tbody>
$govRowsHtml
          </tbody>
        </table>
      </div>
    </div>
"@

# --- Partie 2 : Memo + Arborescence ---
$html += @"

    <!-- MEMO + ARBORESCENCE -->
    <div class="row g-4 mb-4">
      <div class="col-lg-5">
        <div class="section-title"><i class="bi bi-info-circle me-1"></i> Memo terrain</div>
        <div class="tool-card">
          <div class="ck-text-sm">
$memoHtml
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="section-title"><i class="bi bi-folder me-1"></i> Arborescence projet</div>
        <div class="tool-card p-0">
          <div class="table-responsive">
            <table class="table gov-table mb-0">
              <thead class="table-light">
                <tr><th>Element</th><th>Detail</th></tr>
              </thead>
              <tbody>
$arboHtml
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
"@

# --- Partie 3 : Footer ---
$html += @"

  </div>

  <footer class="py-3 border-top text-center bg-white">
    <small class="text-muted">&copy; 2026 Bible de Bloc -- Poste de pilotage local --
    <span class="badge bg-light text-dark border">NE PAS DEPLOYER</span>
    -- Regenerer : <code>.\scripts\build-cockpit.ps1</code></small>
  </footer>

</body>
</html>
"@

# --- 5. Ecrire le fichier ---
[System.IO.File]::WriteAllText($OUTPUT, $html, [System.Text.UTF8Encoding]::new($false))

Write-Host "  $OUTPUT genere" -ForegroundColor Green
Write-Host "=== TERMINE ===" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}

# --- FILET 3 : Read-Host HORS try/catch (interactif seulement) ---
if ([Environment]::UserInteractive) {
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
}
