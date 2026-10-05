# ============================================================
# AUDIT_BDB_HTML_PATTERNS.ps1
# Audit des patterns HTML reels dans les modules BDB
# Sortie : audit-html-patterns.txt dans le meme dossier
# Usage  : AUDIT_BDB_HTML_PATTERNS.bat
# ASCII ONLY
# ============================================================

param(
    [string]$RootPath = "C:\DEV\BIBLE_DE_BLOC"
)

$output = [System.Collections.Generic.List[string]]::new()

$output.Add("=" * 70)
$output.Add("AUDIT PATTERNS HTML BDB - " + (Get-Date -Format "yyyy-MM-dd HH:mm"))
$output.Add("Racine : $RootPath")
$output.Add("=" * 70)

$htmlFiles = Get-ChildItem -Path $RootPath -Recurse -Filter "*.html" |
    Where-Object {
        $_.FullName -notmatch "\\node_modules\\" -and
        $_.FullName -notmatch "\\.git\\" -and
        $_.FullName -notmatch "\\CDS\\" -and
        $_.Name -notmatch "^theme-" -and
        $_.Name -notmatch "^TEMPLATE"
    } | Sort-Object FullName

$output.Add("")
$output.Add("Fichiers HTML trouves : " + $htmlFiles.Count)
$output.Add("-" * 70)

foreach ($file in $htmlFiles) {
    $rel     = $file.FullName.Replace($RootPath, "").TrimStart("\")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $output.Add("")
    $output.Add("*** $rel ***")

    # SHELL
    if ($content -match 'id="bdb-shell"') {
        $output.Add("  SHELL    : bdb-shell.js [OK]")
    } elseif ($content -match 'id="mainMenu"') {
        $output.Add("  SHELL    : offcanvas MANUEL [DEVIATION]")
    } else {
        $output.Add("  SHELL    : absent / standalone")
    }

    # MODULE TITLE
    if ($content -match 'data-module-title="([^"]*)"') {
        $output.Add("  MODULE   : " + $Matches[1])
    }

    # CDN
    if ($content -match "@latest") {
        $cnt = ([regex]::Matches($content, "@latest")).Count
        $output.Add("  CDN      : @latest PRESENT ($cnt) [VIOLATION]")
    } elseif ($content -match "a75daa0") {
        $output.Add("  CDN      : hash fixe [OK]")
    } else {
        $output.Add("  CDN      : hash absent")
    }

    # JS CHAIN
    $jsChain = [System.Collections.Generic.List[string]]::new()
    if ($content -match "supabase-client\.js") { $jsChain.Add("supabase-client") }
    if ($content -match "bdb-shell\.js")       { $jsChain.Add("bdb-shell") }
    if ($content -match "bdb-fonctions\.js")   { $jsChain.Add("bdb-fonctions") }
    if ($content -match "bdb-invite-guard")    { $jsChain.Add("invite-guard") }
    if ($content -match "utils\.js")           { $jsChain.Add("utils.js [SUPPRIME]") }
    if ($content -match "storage\.js")         { $jsChain.Add("storage.js [SUPPRIME]") }
    if ($jsChain.Count -eq 0) { $jsChain.Add("aucun") }
    $output.Add("  JS-CHAIN : " + ($jsChain -join " > "))

    # NAVIGATION
    $navTypes = [System.Collections.Generic.List[string]]::new()
    if ($content -match "nav-tabs")  { $navTypes.Add("nav-tabs") }
    if ($content -match "nav-pills") { $navTypes.Add("nav-pills") }
    if ($navTypes.Count -eq 0) { $navTypes.Add("aucune") }
    $output.Add("  NAV      : " + ($navTypes -join " + "))

    # BOUTON ADD
    $btnList = [System.Collections.Generic.List[string]]::new()
    if ($content -match "btn-primary.*btn-sm") { $btnList.Add("btn-primary OK") }
    if ($content -match "btn-danger.*btn-sm")  { $btnList.Add("btn-danger [COULEUR INCORRECTE]") }
    if ($content -match "ms-md-auto")          { $btnList.Add("ms-md-auto [toolbar OK]") }
    if ($btnList.Count -eq 0) { $btnList.Add("non detecte") }
    $output.Add("  BTN-ADD  : " + ($btnList -join " | "))

    # ACTIONS TABLEAU
    $actionList = [System.Collections.Generic.List[string]]::new()
    if ($content -match "btn-group btn-group-sm")  { $actionList.Add("btn-group [OK]") }
    if ($content -match 'data-action="edit"')      { $actionList.Add("data-action [OK]") }
    if ($content -match "onclick=") {
        $cnt = ([regex]::Matches($content, "onclick=")).Count
        $actionList.Add("onclick= ($cnt) [VIOLATION]")
    }
    if ($actionList.Count -eq 0) { $actionList.Add("non detecte") }
    $output.Add("  ACTIONS  : " + ($actionList -join " | "))

    # BADGES
    $badgeList = [System.Collections.Generic.List[string]]::new()
    if ($content -match "badge-soft-") {
        $cnt = ([regex]::Matches($content, "badge-soft-")).Count
        $badgeList.Add("badge-soft-* ($cnt) [custom]")
    }
    if ($content -match "bg-[a-z]+-subtle") {
        $cnt = ([regex]::Matches($content, "bg-[a-z]+-subtle")).Count
        $badgeList.Add("bg-*-subtle ($cnt) [BS5.3 OK]")
    }
    if ($badgeList.Count -eq 0) { $badgeList.Add("non detecte") }
    $output.Add("  BADGES   : " + ($badgeList -join " | "))

    # STYLE= INLINE
    $styleTotal = ([regex]::Matches($content, "style=")).Count
    $styleOk    = ([regex]::Matches($content, "style=.*OK")).Count
    $styleViol  = $styleTotal - $styleOk
    $output.Add("  STYLE=   : $styleTotal total / $styleOk justifies / $styleViol suspects")

    # ESCHTML
    if ($content -match "escHtml") {
        $cnt = ([regex]::Matches($content, "escHtml")).Count
        $output.Add("  ESCHTML  : $cnt [OK]")
    } elseif ($content -match "innerHTML") {
        $cnt = ([regex]::Matches($content, "innerHTML")).Count
        $output.Add("  ESCHTML  : absent / $cnt innerHTML [VERIFIER]")
    } else {
        $output.Add("  ESCHTML  : non applicable")
    }

    # RECHERCHE
    if ($content -match 'type="search"') {
        $output.Add("  SEARCH   : presente")
    } else {
        $output.Add("  SEARCH   : absente")
    }

    # CDS-OVERRIDES
    if ($content -match "cds-overrides\.css") {
        $output.Add("  OVERRIDES: present [OK]")
    } else {
        $output.Add("  OVERRIDES: ABSENT [DEVIATION]")
    }

    # INTERDIT-E1 : bdb-shell premier enfant de main
    if ($content -match 'id="bdb-shell"') {
        $mainIdx  = $content.IndexOf("<main")
        $shellIdx = $content.IndexOf('id="bdb-shell"')
        if ($mainIdx -ge 0 -and $shellIdx -gt $mainIdx) {
            $between = $content.Substring($mainIdx, $shellIdx - $mainIdx)
            $between = [regex]::Replace($between, "<!--.*?-->", "", "Singleline")
            $between = $between.Trim() -replace "\s+", " "
            if ($between -match "<[a-zA-Z][^/]") {
                $output.Add("  E1-CHECK : elements avant bdb-shell [VIOLATION INTERDIT-E1]")
            } else {
                $output.Add("  E1-CHECK : bdb-shell premier enfant [OK]")
            }
        }
    }
}

# SYNTHESE
$output.Add("")
$output.Add("=" * 70)
$output.Add("SYNTHESE")
$output.Add("=" * 70)

$totalFiles = $htmlFiles.Count

function Count-Pattern {
    param($files, $pattern)
    return ($files | Where-Object {
        $c = Get-Content $_.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        $c -and ($c -match $pattern)
    }).Count
}

$v_bdbshell = Count-Pattern $htmlFiles 'id="bdb-shell"'
$v_manual   = Count-Pattern $htmlFiles 'id="mainMenu"'
$v_overcss  = Count-Pattern $htmlFiles "cds-overrides\.css"
$v_hash     = Count-Pattern $htmlFiles "a75daa0"
$v_latest   = Count-Pattern $htmlFiles "@latest"
$v_utils    = Count-Pattern $htmlFiles "utils\.js|storage\.js"
$v_navtabs  = Count-Pattern $htmlFiles "nav-tabs"
$v_navpills = Count-Pattern $htmlFiles "nav-pills"
$v_search   = Count-Pattern $htmlFiles 'type="search"'
$v_btngroup = Count-Pattern $htmlFiles "btn-group btn-group-sm"
$v_badgesoft= Count-Pattern $htmlFiles "badge-soft-"
$v_subtle   = Count-Pattern $htmlFiles "bg-[a-z]+-subtle"
$v_eschtml  = Count-Pattern $htmlFiles "escHtml"
$v_onclick  = Count-Pattern $htmlFiles "onclick="

$output.Add("")
$output.Add("  Fichiers analyses         : $totalFiles")
$output.Add("")
$output.Add("  [ARCHITECTURE]")
$output.Add("  bdb-shell.js              : $v_bdbshell / $totalFiles")
$output.Add("  offcanvas manuel          : $v_manual   [deviations]")
$output.Add("  cds-overrides.css         : $v_overcss / $totalFiles")
$output.Add("")
$output.Add("  [CDN]")
$output.Add("  hash fixe a75daa0         : $v_hash / $totalFiles")
$output.Add("  @latest violation         : $v_latest   [VIOLATIONS]")
$output.Add("  utils/storage supprimes   : $v_utils    [VIOLATIONS]")
$output.Add("")
$output.Add("  [NAVIGATION]")
$output.Add("  nav-tabs                  : $v_navtabs")
$output.Add("  nav-pills                 : $v_navpills")
$output.Add("  type=search               : $v_search")
$output.Add("")
$output.Add("  [PATTERNS UI]")
$output.Add("  btn-group btn-group-sm    : $v_btngroup [cible CRUD]")
$output.Add("  badge-soft-* custom       : $v_badgesoft [a remplacer]")
$output.Add("  bg-*-subtle BS5.3         : $v_subtle")
$output.Add("  escHtml present           : $v_eschtml")
$output.Add("")
$output.Add("  [JS]")
$output.Add("  onclick= violations       : $v_onclick   [VIOLATIONS JS-01]")
$output.Add("")
$output.Add("=" * 70)
$output.Add("Rapport : " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$output.Add("=" * 70)

$reportPath = Join-Path (Split-Path $MyInvocation.MyCommand.Path) "audit-html-patterns.txt"
[System.IO.File]::WriteAllLines($reportPath, $output, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "[OK] Rapport : $reportPath" -ForegroundColor Green
Write-Host "     Fichiers : $totalFiles" -ForegroundColor Cyan
if ($v_latest  -gt 0) { Write-Host "     @latest violations : $v_latest" -ForegroundColor Red }
if ($v_onclick -gt 0) { Write-Host "     onclick= violations : $v_onclick" -ForegroundColor Red }
Write-Host ""
