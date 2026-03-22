# ══════════════════════════════════════════════════════════
# check-before-ftp.ps1
# Vérification AVANT déploiement FTP OVH
# Exécuter AVANT chaque upload FTP — 0 erreur = go
# ══════════════════════════════════════════════════════════

$root = "C:\DEV\BIBLE_DE_BLOC"
$errors = 0

Write-Host "`n  CHECK PRE-DEPLOIEMENT OVH`n" -ForegroundColor Cyan

# ── Fichiers obligatoires ──
$required = @(".htaccess", "403.html", "404.html", "robots.txt")
foreach ($f in $required) {
    if (Test-Path "$root\$f") {
        Write-Host "  OK  $f" -ForegroundColor Green
    } else {
        Write-Host "  ERR $f ABSENT" -ForegroundColor Red; $errors++
    }
}

# ── .htaccess gouvernance ──
if (Test-Path "$root\00_GOUVERNANCE\.htaccess") {
    Write-Host "  OK  00_GOUVERNANCE\.htaccess" -ForegroundColor Green
} else {
    Write-Host "  ERR 00_GOUVERNANCE\.htaccess ABSENT" -ForegroundColor Red; $errors++
}

# ── Fichiers à NE PAS uploader ──
Write-Host ""
if (Test-Path "$root\js\config.js") {
    Write-Host "  !!  config.js existe — NE PAS UPLOADER" -ForegroundColor Yellow
}

$md = (Get-ChildItem $root -Recurse -Filter "*.md" -File |
    Where-Object { $_.FullName -notlike "*_PROJET_CLAUDE*" -and $_.FullName -notlike "*node_modules*" }).Count
$sql = (Get-ChildItem $root -Recurse -Filter "*.sql" -File).Count
Write-Host "  !!  $md fichiers .md + $sql fichiers .sql — NE PAS UPLOADER" -ForegroundColor Yellow

# ── Vérifications manuelles ──
Write-Host ""
Write-Host "  Verifications manuelles apres upload :" -ForegroundColor Cyan
Write-Host "    1. https://hashtag.manuelrohaut.fr/bdb/modules/       → 403" -ForegroundColor Gray
Write-Host "    2. https://hashtag.manuelrohaut.fr/bdb/00_GOUVERNANCE/ → 403" -ForegroundColor Gray
Write-Host "    3. https://hashtag.manuelrohaut.fr/bdb/SESSION_STATE.md → 403" -ForegroundColor Gray
Write-Host "    4. https://hashtag.manuelrohaut.fr/bdb/admin-test.html  → 403" -ForegroundColor Gray
Write-Host "    5. https://hashtag.manuelrohaut.fr/bdb/modules/site/    → OK" -ForegroundColor Gray
Write-Host "    6. http://hashtag... (sans s)                           → redirect https" -ForegroundColor Gray

# ── Résultat ──
Write-Host ""
if ($errors -eq 0) {
    Write-Host "  PRET POUR FTP — 0 erreur bloquante" -ForegroundColor Green
} else {
    Write-Host "  $errors ERREUR(S) — CORRIGER AVANT FTP" -ForegroundColor Red
}
Write-Host ""
