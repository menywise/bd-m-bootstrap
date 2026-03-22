# sync-projet-claude.ps1

function Get-LatestVersioned {
    param([System.IO.FileInfo[]]$files)

    # Groupe par nom de base (sans _Vx_y_z.md et sans extension)
    $groups = @{}
    foreach ($f in $files) {
        # Extrait le nom de base en retirant le suffixe _Vx_y_z (optionnel)
        if ($f.BaseName -match '^(.+?)(_V\d+_\d+_?\d*)?$') {
            $base = $matches[1]
        } else {
            $base = $f.BaseName
        }
        if (-not $groups.ContainsKey($base)) { $groups[$base] = @() }
        $groups[$base] += $f
    }

    # Pour chaque groupe, retourne uniquement le fichier avec la version la plus haute
    $result = @()
    foreach ($base in $groups.Keys) {
        $group = $groups[$base]
        if ($group.Count -eq 1) {
            $result += $group[0]
        } else {
            # Trie par nom de fichier descending (V1_13 > V1_12 lexicographiquement)
            $latest = $group | Sort-Object Name -Descending | Select-Object -First 1
            $skipped = $group | Sort-Object Name -Descending | Select-Object -Skip 1
            foreach ($s in $skipped) {
                Write-Host "  SKIP   : $($s.Name)  (version inferieure)" -ForegroundColor DarkGray
            }
            $result += $latest
        }
    }
    return $result
}

try {

    $src    = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
    $srcCtx = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\CTX"
    $dst    = "C:\DEV\BIBLE_DE_BLOC\_PROJET_CLAUDE"

    Write-Host "  SRC      : $src"
    Write-Host "  SRC\\CTX : $srcCtx"
    Write-Host "  DST      : $dst"
    Write-Host ""

    if (-not (Test-Path $src)) { throw "Dossier source introuvable : $src" }

    # Vider la destination pour eviter les anciens fichiers renommes
    if (Test-Path $dst) {
        Remove-Item "$dst\*.md" -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Force -Path $dst | Out-Null

    $copied = 0

    # Racine 00_GOUVERNANCE
    $rootFiles = Get-ChildItem -Path $src -Filter "*.md" -File
    $rootFiles = Get-LatestVersioned $rootFiles
    foreach ($f in $rootFiles) {
        Copy-Item $f.FullName $dst -Force
        Write-Host "  OK     : $($f.Name)"
        $copied++
    }

    # Sous-dossier CTX\
    if (Test-Path $srcCtx) {
        $ctxFiles = Get-ChildItem -Path $srcCtx -Filter "*.md" -File
        $ctxFiles = Get-LatestVersioned $ctxFiles
        foreach ($f in $ctxFiles) {
            Copy-Item $f.FullName $dst -Force
            Write-Host "  OK/CTX : $($f.Name)"
            $copied++
        }
    } else {
        Write-Host "  INFO : dossier CTX absent, ignore"
    }

    Write-Host ""
    Write-Host "  $copied fichier(s) copies"
    Write-Host "  Destination : $dst"
    Write-Host ""
    Write-Host "  PRET - uploader _PROJET_CLAUDE dans Project Knowledge"

} catch {
    Write-Host ""
    Write-Host "  ERREUR : $_"
    Write-Host ""
}

Read-Host "Appuyer sur Entree pour fermer"
