# ============================================================
# AUDIT-V5-COMPLIANCE.PS1
# VERSION  : 1.2.0
# DATE     : 2026-04-25
# OBJECTIF : Auditer la conformite V5 de TOUS les fichiers HTML
#            d'un dossier BDB. Produit un rapport PASS/FAIL.
# DELTA v1.2.0 :
#   - Whitelist style= dynamiques (border-color, background-color,
#     color:, width:N%, width:auto, display:none, --custom-prop)
#   - Fix font-awesome : cible class="...fa-" au lieu de bare fa-[a-z]
#     (eliminait faux positifs sur regex hex /fA-F/)
# USAGE    : .\scripts\audit-v5-compliance.bat [dossier]
# ============================================================

trap {
    Write-Host ""
    Write-Host "!!! ERREUR FATALE !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host ""
    if ([Environment]::UserInteractive) {
        Read-Host "Appuie sur Entree pour fermer"
    }
    exit 1
}

$ErrorActionPreference = "Stop"
$ROOT = "C:\DEV\BIBLE_DE_BLOC"

try {

$TargetDir = $args[0]
if (-not $TargetDir) { $TargetDir = "." }
$FullTarget = Join-Path $ROOT $TargetDir
if (-not (Test-Path $FullTarget)) {
    Write-Host "ERREUR : dossier introuvable : $FullTarget" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== AUDIT V5 COMPLIANCE v1.2.0 ===" -ForegroundColor Cyan
Write-Host "  Cible  : $FullTarget" -ForegroundColor White
Write-Host "  Date   : $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor White
Write-Host ""

$htmlFiles = Get-ChildItem -Path $FullTarget -Recurse -Filter "*.html" |
    Where-Object { $_.FullName -notmatch '\\cds\\' -and $_.FullName -notmatch '\\_trash' }

if ($htmlFiles.Count -eq 0) {
    Write-Host "  Aucun fichier HTML trouve dans $FullTarget" -ForegroundColor Yellow
    exit 0
}

Write-Host "  $($htmlFiles.Count) fichiers HTML a auditer" -ForegroundColor White
Write-Host ""

$totalPass = 0
$totalFail = 0
$totalWarn = 0

foreach ($file in ($htmlFiles | Sort-Object FullName)) {
    $rel = $file.FullName.Replace($ROOT + "\", "")
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $fails = @()
    $warns = @()

    # --- CSS ---
    if ($content -notmatch 'bootstrap@5\.3\.3.*\.css') { $fails += "CSS:BS-5.3.3-absent" }
    if ($content -match 'bootstrap@5\.3\.2') { $fails += "CSS:BS-5.3.2-interdit" }
    if ($content -notmatch '@63905396') { $fails += "CSS:hash-V5-absent" }
    if ($content -match 'a75daa0') { $fails += "CSS:ancien-hash-a75daa0" }
    if ($content -notmatch 'bootstrap-icons@1\.11\.1') { $fails += "CSS:BI-1.11.1-absent" }
    if ($content -notmatch 'cds-overrides\.css') { $fails += "CSS:cds-overrides-absent" }
    if ($content -match 'theme-print\.css') { $fails += "CSS:theme-print-interdit" }
    if ($content -match 'atelier-base\.css') { $fails += "CSS:atelier-base-BANNI" }

    # --- JS (si shell present) ---
    $hasShell = $content -match 'bdb-shell\.js'
    if ($hasShell) {
        if ($content -notmatch 'bdb-ui\.js') { $fails += "JS:bdb-ui-absent" }
        if ($content -notmatch 'bdb-invite-guard\.js') { $fails += "JS:invite-guard-absent" }
        if ($content -notmatch 'supabase-client\.js') { $fails += "JS:supabase-client-absent" }
    }

    # --- DOM (si shell present) ---
    if ($hasShell) {
        if ($content -notmatch 'id="wrapper"') { $fails += "DOM:wrapper-absent" }
        if ($content -notmatch 'id="bdb-shell"') { $fails += "DOM:bdb-shell-absent" }
        if ($content -notmatch 'id="wrapper_content"') { $fails += "DOM:wrapper_content-absent" }
        if ($content -notmatch 'id="middle"') { $fails += "DOM:middle-absent" }
        if ($content -notmatch 'data-shell-kind=') { $fails += "DOM:shell-kind-absent" }
        if ($content -notmatch 'data-login-mode=') { $fails += "DOM:login-mode-absent" }
        if ($content -notmatch 'data-root-path=') { $fails += "DOM:root-path-absent" }
    }

    # --- CDS ---
    if ($content -match '<body[^>]+class=') { $fails += "CDS:body-avec-classes" }
    $onclickCount = ([regex]::Matches($content, 'onclick=')).Count
    if ($onclickCount -gt 0) { $fails += "CDS:onclick=$onclickCount" }

    # --- style= inline (whitelist dynamiques + honeypot) ---
    $styleMatches = [regex]::Matches($content, ' style="[^"]*"')
    $staticCount = 0
    foreach ($m in $styleMatches) {
        $val = $m.Value
        if ($val -match 'width:\s*\d+%') { continue }
        if ($val -match 'width:\s*0%') { continue }
        if ($val -match 'width:\s*auto') { continue }
        if ($val -match 'background:') { continue }
        if ($val -match 'background-color:') { continue }
        if ($val -match 'border-color:') { continue }
        if ($val -match '(?<!\w)color:') { continue }
        if ($val -match 'display:\s*none') { continue }
        if ($val -match '--[a-z]') { continue }             # CSS custom property dynamique
        $staticCount++
    }
    if ($staticCount -gt 0) { $fails += "CDS:style-inline=$staticCount" }

    # --- Classes bannies (fix v1.2.0 : cible class= pour font-awesome) ---
    if ($content -match 'class="[^"]*\batl-') { $fails += "CDS:classe-atl-bannie" }
    if ($content -match 'font-awesome') { $fails += "CDS:font-awesome-interdit" }
    if ($content -match 'class="[^"]*\bfa[srb]?\s') { $fails += "CDS:font-awesome-interdit" }
    if ($content -match 'class="[^"]*\bfa-[a-z]') { $fails += "CDS:font-awesome-interdit" }
    if ($content -match 'console\.log\(') { $warns += "CDS:console.log" }

    # --- Resultat ---
    if ($fails.Count -eq 0 -and $warns.Count -eq 0) {
        Write-Host "  PASS  $rel" -ForegroundColor Green
        $totalPass++
    } elseif ($fails.Count -eq 0) {
        Write-Host "  WARN  $rel  [$($warns -join ', ')]" -ForegroundColor Yellow
        $totalWarn++
    } else {
        Write-Host "  FAIL  $rel" -ForegroundColor Red
        foreach ($f in $fails) {
            Write-Host "        - $f" -ForegroundColor Red
        }
        foreach ($w in $warns) {
            Write-Host "        ~ $w" -ForegroundColor Yellow
        }
        $totalFail++
    }
}

# --- Fichiers orphelins ---
Write-Host ""
Write-Host "--- Fichiers orphelins ---" -ForegroundColor Cyan

$cssFiles = Get-ChildItem -Path $FullTarget -Recurse -Filter "*.css" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\cds\\' -and $_.FullName -notmatch '\\_trash' }

$allHtmlContent = ""
foreach ($h in $htmlFiles) {
    $allHtmlContent += (Get-Content $h.FullName -Raw -ErrorAction SilentlyContinue)
}

foreach ($css in $cssFiles) {
    $name = $css.Name
    if ($allHtmlContent -notmatch [regex]::Escape($name)) {
        $cssRel = $css.FullName.Replace($ROOT + "\", "")
        Write-Host "  ORPHELIN  $cssRel  (CSS jamais charge)" -ForegroundColor Yellow
    }
}

$docFiles = Get-ChildItem -Path $FullTarget -Recurse -Include "*.md","*.json" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\cds\\' -and $_.FullName -notmatch '\\_trash' -and $_.FullName -notmatch '\\00_GOUVERNANCE\\' }

foreach ($doc in $docFiles) {
    $docRel = $doc.FullName.Replace($ROOT + "\", "")
    Write-Host "  DOC       $docRel  (candidat nettoyage)" -ForegroundColor DarkGray
}

# --- Resume ---
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "  PASS : $totalPass" -ForegroundColor Green
Write-Host "  WARN : $totalWarn" -ForegroundColor Yellow
Write-Host "  FAIL : $totalFail" -ForegroundColor Red
Write-Host "  TOTAL: $($htmlFiles.Count) fichiers" -ForegroundColor White
Write-Host ""

if ($totalFail -eq 0) {
    Write-Host "  V5 CONFORME" -ForegroundColor Green
} else {
    Write-Host "  NON CONFORME -- $totalFail fichier(s) a corriger" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}

if ([Environment]::UserInteractive) {
    Write-Host ""
    Read-Host "Appuie sur Entree pour fermer"
}
