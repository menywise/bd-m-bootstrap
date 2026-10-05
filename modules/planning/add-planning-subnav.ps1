# add-planning-subnav.ps1 V1.0.0
# Insere la sous-navigation Planning dans planning.html, export.html, admin-aliases.html
# Methode : insertion par index de chaine apres le div#bdb-shell
# Usage : scripts\add-planning-subnav.bat

trap { Write-Error $_.Exception.Message; Read-Host "Erreur - Entree pour fermer"; exit 1 }

$BASE = "C:\DEV\BIBLE_DE_BLOC\modules\planning"

# Subnav par page (lien actif different)
$SUBNAVS = @{}

$SUBNAVS["planning.html"] = @'

  <!-- Sous-navigation Planning -->
  <nav class="bg-white border-bottom px-3 px-md-4 no-print" aria-label="Navigation Planning">
    <ul class="nav nav-tabs border-0 flex-nowrap" role="tablist">
      <li class="nav-item" role="presentation">
        <a href="index.html" class="nav-link"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
      </li>
      <li class="nav-item" role="presentation">
        <a href="analytics.html" class="nav-link"><i class="bi bi-graph-up me-1"></i>Analyses</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="planning.html" class="nav-link active" aria-current="page"><i class="bi bi-pencil-square me-1"></i>Saisie</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="export.html" class="nav-link"><i class="bi bi-download me-1"></i>Export</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="admin-aliases.html" class="nav-link"><i class="bi bi-people me-1"></i>Aliases</a>
      </li>
    </ul>
  </nav>
'@

$SUBNAVS["export.html"] = @'

  <!-- Sous-navigation Planning -->
  <nav class="bg-white border-bottom px-3 px-md-4 no-print" aria-label="Navigation Planning">
    <ul class="nav nav-tabs border-0 flex-nowrap" role="tablist">
      <li class="nav-item" role="presentation">
        <a href="index.html" class="nav-link"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
      </li>
      <li class="nav-item" role="presentation">
        <a href="analytics.html" class="nav-link"><i class="bi bi-graph-up me-1"></i>Analyses</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="planning.html" class="nav-link"><i class="bi bi-pencil-square me-1"></i>Saisie</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="export.html" class="nav-link active" aria-current="page"><i class="bi bi-download me-1"></i>Export</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="admin-aliases.html" class="nav-link"><i class="bi bi-people me-1"></i>Aliases</a>
      </li>
    </ul>
  </nav>
'@

$SUBNAVS["admin-aliases.html"] = @'

  <!-- Sous-navigation Planning -->
  <nav class="bg-white border-bottom px-3 px-md-4 no-print" aria-label="Navigation Planning">
    <ul class="nav nav-tabs border-0 flex-nowrap" role="tablist">
      <li class="nav-item" role="presentation">
        <a href="index.html" class="nav-link"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a>
      </li>
      <li class="nav-item" role="presentation">
        <a href="analytics.html" class="nav-link"><i class="bi bi-graph-up me-1"></i>Analyses</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="planning.html" class="nav-link"><i class="bi bi-pencil-square me-1"></i>Saisie</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="export.html" class="nav-link"><i class="bi bi-download me-1"></i>Export</a>
      </li>
      <li class="nav-item bdb-admin-only d-none" role="presentation">
        <a href="admin-aliases.html" class="nav-link active" aria-current="page"><i class="bi bi-people me-1"></i>Aliases</a>
      </li>
    </ul>
  </nav>
'@

foreach ($filename in $SUBNAVS.Keys) {
    $filepath = Join-Path $BASE $filename
    if (-not (Test-Path $filepath)) {
        Write-Warning "IGNORE — absent : $filename"
        continue
    }

    $content = Get-Content $filepath -Raw -Encoding UTF8

    if ($content.Contains('Sous-navigation Planning')) {
        Write-Host "SKIP — deja present : $filename"
        continue
    }

    $anchor = 'id="bdb-shell"'
    $pos = $content.IndexOf($anchor)
    if ($pos -lt 0) {
        Write-Warning "IGNORE — bdb-shell absent : $filename"
        continue
    }

    # Trouver le premier </div> apres le bdb-shell (tag vide, pas de contenu)
    $closeTag = '</div>'
    $closePos = $content.IndexOf($closeTag, $pos)
    if ($closePos -lt 0) {
        Write-Warning "ECHEC — </div> non trouve apres bdb-shell : $filename"
        continue
    }

    $insertAt  = $closePos + $closeTag.Length
    $newContent = $content.Substring(0, $insertAt) + $SUBNAVS[$filename] + $content.Substring($insertAt)

    [System.IO.File]::WriteAllText($filepath, $newContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "OK : $filename"
}

Write-Host ""
Write-Host "Termine. Verifier visuellement les 3 pages."
Read-Host "Entree pour fermer"
