# ============================================================
# fix-dev-paths.ps1
# VERSION  : 1.0.0
# DATE     : 2026-04-04
# OBJECTIF : Auditer et corriger les chemins relatifs dans
#            _dev/ apres deplacement depuis la racine.
# PREREQUIS: Lancer via fix-dev-paths.bat
# ============================================================

$ErrorActionPreference = "Stop"

try {

$ROOT = "C:\DEV\BIBLE_DE_BLOC"
$DEV  = Join-Path $ROOT "_dev"

if (-not (Test-Path $DEV)) {
    Write-Host "ERREUR : $DEV introuvable" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== AUDIT CHEMINS _dev\ ===" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path $DEV -Filter "*.html" -File

if ($htmlFiles.Count -eq 0) {
    Write-Host "Aucun fichier HTML dans _dev\" -ForegroundColor DarkYellow
    exit 0
}

Write-Host "Fichiers trouves : $($htmlFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# --- Prefixes relatifs qui doivent etre corriges ---
# Depuis la racine, ces chemins etaient corrects.
# Depuis _dev/, il faut prefixer par ../
$prefixes = @(
    "css/",
    "js/",
    "modules/",
    "login.html",
    "index.html",
    "reset-password.html",
    "pending.html",
    "403.html",
    "404.html"
)

# --- Patterns a chercher (src= et href=) ---
# On cherche src="X" ou href="X" ou src='X' ou href='X'
# ou aussi src=X sans quotes (rare mais possible)

$totalFixes = 0
$fileReport = @()

foreach ($file in $htmlFiles) {
    Write-Host "--- $($file.Name) ---" -ForegroundColor Yellow

    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content
    $fixes = 0

    foreach ($prefix in $prefixes) {
        # Pattern: (src|href|action)="prefix  (pas deja ../)
        # On evite de doubler le ../ si deja present
        $patterns = @(
            @{ Find = "href=""$prefix";   Replace = "href=""../$prefix" },
            @{ Find = "href='$prefix";    Replace = "href='../$prefix" },
            @{ Find = "src=""$prefix";    Replace = "src=""../$prefix" },
            @{ Find = "src='$prefix";     Replace = "src='../$prefix" },
            @{ Find = "action=""$prefix"; Replace = "action=""../$prefix" }
        )

        foreach ($p in $patterns) {
            # Ne pas toucher si deja ../ devant
            $alreadyFixed = $p.Replace
            if ($content.Contains($p.Find) -and -not $content.Contains($alreadyFixed.Replace("=""../", "=""../../"))) {
                $count = ([regex]::Matches($content, [regex]::Escape($p.Find))).Count
                if ($count -gt 0) {
                    $content = $content.Replace($p.Find, $p.Replace)
                    Write-Host "  FIX  $($p.Find) -> $($p.Replace)  ($count occurrences)" -ForegroundColor Green
                    $fixes += $count
                }
            }
        }
    }

    # --- Aussi fixer les chemins dans les scripts inline ---
    # window.location.href = "login.html" etc.
    $jsPatterns = @(
        @{ Find = "= ""login.html";          Replace = "= ""../login.html" },
        @{ Find = "= 'login.html";           Replace = "= '../login.html" },
        @{ Find = "= ""index.html";          Replace = "= ""../index.html" },
        @{ Find = "= 'index.html";           Replace = "= '../index.html" },
        @{ Find = "= ""pending.html";        Replace = "= ""../pending.html" },
        @{ Find = "= 'pending.html";         Replace = "= '../pending.html" },
        @{ Find = "= ""reset-password.html";  Replace = "= ""../reset-password.html" },
        @{ Find = "= 'reset-password.html";   Replace = "= '../reset-password.html" }
    )

    foreach ($p in $jsPatterns) {
        if ($content.Contains($p.Find)) {
            $count = ([regex]::Matches($content, [regex]::Escape($p.Find))).Count
            $content = $content.Replace($p.Find, $p.Replace)
            Write-Host "  FIX  $($p.Find) -> $($p.Replace)  ($count)" -ForegroundColor Green
            $fixes += $count
        }
    }

    $totalFixes += $fixes

    if ($fixes -eq 0) {
        Write-Host "  Aucun chemin a corriger" -ForegroundColor DarkGray
    }

    $fileReport += [PSCustomObject]@{
        Fichier = $file.Name
        Fixes   = $fixes
        Changed = ($content -ne $original)
    }

    # --- Sauvegarder si modifie ---
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  SAUVEGARDE" -ForegroundColor Cyan
    }

    Write-Host ""
}

# --- Audit post-fix : lister les chemins relatifs restants ---
Write-Host "=== VERIFICATION POST-FIX ===" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    # Chercher tous les href/src qui ne commencent pas par http, //, #, ../, mailto, tel, javascript
    $matches = [regex]::Matches($content, '(?:href|src|action)=["\x27]([^"\x27#][^"\x27]*?)["\x27]')

    $suspicious = @()
    foreach ($m in $matches) {
        $path = $m.Groups[1].Value
        if ($path.StartsWith("http")) { continue }
        if ($path.StartsWith("//")) { continue }
        if ($path.StartsWith("../")) { continue }
        if ($path.StartsWith("data:")) { continue }
        if ($path.StartsWith("mailto:")) { continue }
        if ($path.StartsWith("javascript:")) { continue }
        if ($path.StartsWith("#")) { continue }
        $suspicious += $path
    }

    if ($suspicious.Count -gt 0) {
        Write-Host "  ATTENTION $($file.Name) - chemins non prefixes :" -ForegroundColor Red
        foreach ($s in $suspicious) {
            Write-Host "    $s" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  OK  $($file.Name) - tous les chemins sont corriges" -ForegroundColor Green
    }
}

# --- Resume ---
Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "  Fichiers traites : $($htmlFiles.Count)"
Write-Host "  Corrections      : $totalFixes"
Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Ligne : $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}
