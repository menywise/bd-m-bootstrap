# ============================================================
# batch-anatomie-generator.ps1
# VERSION  : 1.0.0
# DATE     : 2026-04-13
# OBJECTIF : Generation batch 460 fiches anatomiques via Anthropic Batch API
# PREREQUIS: Lancer via batch-anatomie-generator.bat
#            .env a la racine avec SUPABASE_URL, ANON_KEY, ANTHROPIC_API_KEY
#            batch-anatomie-system-prompt.txt dans le meme dossier scripts/
# OUTPUT   : C:\DEV\BIBLE_DE_BLOC\_batch_anatomie\html\[id].html
#            C:\DEV\BIBLE_DE_BLOC\_batch_anatomie\harvest\[id].json
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

# --- CONFIG ---
$ROOT         = "C:\DEV\BIBLE_DE_BLOC"
$SCRIPTS_DIR  = Join-Path $ROOT "scripts"
$OUTPUT_DIR   = Join-Path $ROOT "_batch_anatomie"
$HTML_DIR     = Join-Path $OUTPUT_DIR "html"
$HARVEST_DIR  = Join-Path $OUTPUT_DIR "harvest"
$LOG_DIR      = Join-Path $OUTPUT_DIR "logs"
$BATCH_ID_FILE = Join-Path $OUTPUT_DIR "batch_id.txt"
$RESULTS_FILE  = Join-Path $OUTPUT_DIR "batch_results.jsonl"
$PROMPT_FILE   = Join-Path $SCRIPTS_DIR "batch-anatomie-system-prompt.txt"
$MODEL         = "claude-sonnet-4-6"
$MAX_TOKENS    = 6000
$POLL_INTERVAL = 60  # secondes entre chaque poll

# --- FILET 2 : try/catch ---
try {

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " BDB -- Batch Anatomie Generator v1.0.0" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# ETAPE 0 : Chargement .env
# ============================================================
Write-Host "[0/7] Chargement .env..." -ForegroundColor Yellow
$envPath = Join-Path $ROOT ".env"
if (-not (Test-Path $envPath)) {
    throw "Fichier .env introuvable : $envPath"
}
$envLines = [System.IO.File]::ReadAllLines($envPath, [System.Text.Encoding]::UTF8)
$envVars = @{}
foreach ($line in $envLines) {
    if ($line -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
        $envVars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}
$SUPABASE_URL = $envVars['SUPABASE_URL']
$ANON_KEY     = $envVars['ANON_KEY']
$API_KEY      = $envVars['ANTHROPIC_API_KEY']
if (-not $SUPABASE_URL -or -not $ANON_KEY -or -not $API_KEY) {
    throw "Variables manquantes dans .env : SUPABASE_URL, ANON_KEY, ANTHROPIC_API_KEY"
}
Write-Host "  OK - Variables chargees" -ForegroundColor Green

# ============================================================
# ETAPE 0b : Chargement prompt systeme
# ============================================================
if (-not (Test-Path $PROMPT_FILE)) {
    throw "Fichier prompt introuvable : $PROMPT_FILE"
}
$SYSTEM_PROMPT = [System.IO.File]::ReadAllText($PROMPT_FILE, [System.Text.Encoding]::UTF8)
Write-Host "  OK - Prompt systeme charge ($($SYSTEM_PROMPT.Length) chars)" -ForegroundColor Green

# ============================================================
# ETAPE 0c : Creation dossiers output
# ============================================================
@($OUTPUT_DIR, $HTML_DIR, $HARVEST_DIR, $LOG_DIR) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  Cree : $_" -ForegroundColor DarkGray
    }
}

# ============================================================
# ETAPE 1 : Fetch protocoles depuis Supabase
# ============================================================
Write-Host ""
Write-Host "[1/7] Fetch protocoles depuis Supabase..." -ForegroundColor Yellow

$sbHeaders = @{
    "apikey"        = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
}

$selectCols = "id,id_protocole,libelle_cible,zone_anat,cat_parent,specialite,pathologie,alertes,synonymes_recherche,definition_expert,pareto,codes_ccam"
$sbUrl = "$SUPABASE_URL/rest/v1/thesaurus_protocoles?select=$selectCols&limit=1000&order=id_protocole"

$protocolesRaw = Invoke-RestMethod -Uri $sbUrl -Headers $sbHeaders -Method GET
$protocoles = $protocolesRaw | Where-Object { $_.id_protocole -ne $null }

Write-Host "  OK - $($protocoles.Count) protocoles recuperes" -ForegroundColor Green

if ($protocoles.Count -eq 0) {
    throw "Aucun protocole recupere depuis Supabase"
}

# ============================================================
# ETAPE 2 : Fetch details CCAM pour les codes references
# ============================================================
Write-Host ""
Write-Host "[2/7] Fetch details CCAM..." -ForegroundColor Yellow

# Collecter tous les codes uniques
$allCodes = [System.Collections.Generic.HashSet[string]]::new()
foreach ($p in $protocoles) {
    if ($p.codes_ccam) {
        $p.codes_ccam -split '[,|]' | ForEach-Object {
            $code = $_.Trim()
            if ($code) { [void]$allCodes.Add($code) }
        }
    }
}

$ccamLookup = @{}
if ($allCodes.Count -gt 0) {
    $codeList = ($allCodes | ForEach-Object { $_ }) -join ','
    $ccamUrl = "$SUPABASE_URL/rest/v1/referentiel_ccam?select=code_ccam,libelle,chapitre_libelle,section&code_ccam=in.($codeList)&limit=2000"
    try {
        $ccamData = Invoke-RestMethod -Uri $ccamUrl -Headers $sbHeaders -Method GET
        foreach ($c in $ccamData) {
            $ccamLookup[$c.code_ccam] = $c
        }
        Write-Host "  OK - $($ccamLookup.Count) codes CCAM resolus (sur $($allCodes.Count) references)" -ForegroundColor Green
    } catch {
        Write-Host "  AVERT - Fetch CCAM echoue : $($_.Exception.Message)" -ForegroundColor DarkYellow
        Write-Host "  Continuer sans details CCAM" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  INFO - Aucun code CCAM reference" -ForegroundColor DarkGray
}

# ============================================================
# ETAPE 3 : Construction des 460 requetes batch
# ============================================================
Write-Host ""
Write-Host "[3/7] Construction des requetes batch ($($protocoles.Count) protocoles)..." -ForegroundColor Yellow

# Verifier si un batch est deja en cours (resume)
$existingBatchId = $null
if (Test-Path $BATCH_ID_FILE) {
    $existingBatchId = (Get-Content $BATCH_ID_FILE -Raw).Trim()
    if ($existingBatchId) {
        Write-Host ""
        Write-Host "  BATCH EXISTANT DETECTE : $existingBatchId" -ForegroundColor DarkYellow
        $resume = Read-Host "  Reprendre ce batch ? (O/N)"
        if ($resume -eq 'O' -or $resume -eq 'o') {
            Write-Host "  Reprise du batch en cours..." -ForegroundColor Yellow
        } else {
            $existingBatchId = $null
            Remove-Item $BATCH_ID_FILE -Force
            Write-Host "  Nouveau batch." -ForegroundColor DarkGray
        }
    }
}

$requests = @()

if (-not $existingBatchId) {
    foreach ($p in $protocoles) {
        # Construire la section CCAM
        $ccamSection = "Aucun code CCAM associe"
        if ($p.codes_ccam) {
            $codes = $p.codes_ccam -split '[,|]' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            if ($codes.Count -gt 0) {
                $ccamLines = $codes | ForEach-Object {
                    if ($ccamLookup.ContainsKey($_)) {
                        $c = $ccamLookup[$_]
                        $sec = if ($c.section) { " > $($c.section)" } else { "" }
                        "- $_ : $($c.libelle) ($($c.chapitre_libelle)$sec)"
                    } else {
                        "- $_ (libelle non resolu)"
                    }
                }
                $ccamSection = $ccamLines -join "`n"
            }
        }

        # Message utilisateur avec donnees protocole
        $userMsg = @"
Protocole source :
- Identifiant : $($p.id_protocole)
- Libelle : $($p.libelle_cible)
- Zone anatomique : $(if ($p.zone_anat) { $p.zone_anat } else { 'non precisee' })
- Categorie : $(if ($p.cat_parent) { $p.cat_parent } else { 'non precisee' })
- Specialite : $(if ($p.specialite) { $p.specialite } else { 'non precisee' })
- Frequence : $(if ($p.pareto) { $p.pareto } else { 'non precisee' })
- Pathologie traitee : $(if ($p.pathologie) { $p.pathologie } else { 'non precisee' })
- Alertes connues : $(if ($p.alertes) { $p.alertes } else { 'aucune' })
- Synonymes et jargon : $(if ($p.synonymes_recherche) { $p.synonymes_recherche } else { 'aucun' })
- Definition expert : $(if ($p.definition_expert) { $p.definition_expert } else { 'non renseignee' })

Codes CCAM associes :
$ccamSection
"@

        # Construire la requete batch
        $req = [PSCustomObject]@{
            custom_id = $p.id_protocole
            params    = [PSCustomObject]@{
                model      = $MODEL
                max_tokens = $MAX_TOKENS
                system     = @(
                    [PSCustomObject]@{
                        type         = "text"
                        text         = $SYSTEM_PROMPT
                        cache_control = [PSCustomObject]@{ type = "ephemeral" }
                    }
                )
                messages   = @(
                    [PSCustomObject]@{
                        role    = "user"
                        content = $userMsg
                    }
                )
            }
        }
        $requests += $req
    }

    Write-Host "  OK - $($requests.Count) requetes construites" -ForegroundColor Green
}

# ============================================================
# ETAPE 4 : Soumission du batch
# ============================================================
Write-Host ""
Write-Host "[4/7] Soumission du batch a Anthropic..." -ForegroundColor Yellow

$anthropicHeaders = @{
    "x-api-key"         = $API_KEY
    "anthropic-version" = "2023-06-01"
    "anthropic-beta"    = "message-batches-2024-09-24,prompt-caching-2024-07-31"
    "Content-Type"      = "application/json"
}

$batchId = $existingBatchId

if (-not $batchId) {
    $batchBody = [PSCustomObject]@{ requests = $requests }
    $batchBodyJson = $batchBody | ConvertTo-Json -Depth 20 -Compress

    # Ecrire le payload pour debug
    $payloadFile = Join-Path $LOG_DIR "batch_payload_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    [System.IO.File]::WriteAllText($payloadFile, $batchBodyJson, [System.Text.Encoding]::UTF8)
    Write-Host "  Payload sauvegarde : $payloadFile" -ForegroundColor DarkGray

    $batchResponse = Invoke-RestMethod `
        -Uri "https://api.anthropic.com/v1/messages/batches" `
        -Method POST `
        -Headers $anthropicHeaders `
        -Body $batchBodyJson

    $batchId = $batchResponse.id
    [System.IO.File]::WriteAllText($BATCH_ID_FILE, $batchId, [System.Text.Encoding]::ASCII)
    Write-Host "  OK - Batch soumis : $batchId" -ForegroundColor Green
    Write-Host "  Statut initial : $($batchResponse.processing_status)" -ForegroundColor DarkGray
    Write-Host "  Requetes : $($batchResponse.request_counts.processing) en cours" -ForegroundColor DarkGray
}

# ============================================================
# ETAPE 5 : Polling jusqu'a completion
# ============================================================
Write-Host ""
Write-Host "[5/7] Polling statut batch (toutes les ${POLL_INTERVAL}s)..." -ForegroundColor Yellow
Write-Host "  Batch ID : $batchId" -ForegroundColor DarkGray
Write-Host "  Duree estimee : 30-60 min pour 460 protocoles" -ForegroundColor DarkGray
Write-Host ""

$statusUrl = "https://api.anthropic.com/v1/messages/batches/$batchId"
$pollCount = 0

do {
    Start-Sleep -Seconds $POLL_INTERVAL
    $pollCount++

    $statusResp = Invoke-RestMethod `
        -Uri $statusUrl `
        -Method GET `
        -Headers $anthropicHeaders

    $status = $statusResp.processing_status
    $counts = $statusResp.request_counts

    $elapsed = $pollCount * $POLL_INTERVAL
    $elMin = [math]::Floor($elapsed / 60)
    $elSec = $elapsed % 60
    $timeStr = "${elMin}m${elSec}s"

    $pending   = if ($counts.processing) { $counts.processing } else { 0 }
    $succeeded = if ($counts.succeeded)  { $counts.succeeded  } else { 0 }
    $errored   = if ($counts.errored)    { $counts.errored    } else { 0 }

    Write-Host "  [${timeStr}] $status | Traite: $succeeded | En cours: $pending | Erreurs: $errored" -ForegroundColor DarkCyan

} while ($status -ne "ended")

Write-Host ""
Write-Host "  OK - Batch termine !" -ForegroundColor Green
Write-Host "  Succes: $($statusResp.request_counts.succeeded) | Erreurs: $($statusResp.request_counts.errored)" -ForegroundColor Green

# ============================================================
# ETAPE 6 : Telechargement des resultats (JSONL)
# ============================================================
Write-Host ""
Write-Host "[6/7] Telechargement des resultats..." -ForegroundColor Yellow

$resultsUrl = "https://api.anthropic.com/v1/messages/batches/$batchId/results"

# Telecharger le JSONL brut
$resultsResponse = Invoke-WebRequest `
    -Uri $resultsUrl `
    -Method GET `
    -Headers $anthropicHeaders

[System.IO.File]::WriteAllBytes($RESULTS_FILE, $resultsResponse.Content)
Write-Host "  OK - Resultats sauvegardes : $RESULTS_FILE" -ForegroundColor Green

# ============================================================
# ETAPE 7 : Parsing et ecriture des fichiers
# ============================================================
Write-Host ""
Write-Host "[7/7] Parsing et ecriture des fichiers..." -ForegroundColor Yellow

$lines = [System.IO.File]::ReadAllLines($RESULTS_FILE, [System.Text.Encoding]::UTF8)
$countOK      = 0
$countError   = 0
$countNoSep   = 0
$errorLog     = @()

foreach ($line in $lines) {
    if (-not $line.Trim()) { continue }

    try {
        $result = $line | ConvertFrom-Json
        $customId = $result.custom_id

        if ($result.result.type -ne "succeeded") {
            $countError++
            $errorLog += "$customId : $($result.result.error.type) - $($result.result.error.message)"
            continue
        }

        # Extraire le texte genere
        $text = $result.result.message.content[0].text

        # Parser les deux blocs
        $sep1 = "---JSON---"
        $sep2 = "<!--JSON-->"
        $sepUsed = $null

        if ($text.Contains($sep1)) { $sepUsed = $sep1 }
        elseif ($text.Contains($sep2)) { $sepUsed = $sep2 }

        if (-not $sepUsed) {
            # Pas de separateur - sauvegarder en HTML seulement
            $countNoSep++
            $htmlPath = Join-Path $HTML_DIR "$customId.html"
            [System.IO.File]::WriteAllText($htmlPath, $text, [System.Text.Encoding]::UTF8)
            $errorLog += "$customId : separateur absent - HTML sauvegarde, JSON harvest manquant"
            continue
        }

        $idx     = $text.IndexOf($sepUsed)
        $htmlPart = $text.Substring(0, $idx).Trim()
        $jsonPart = $text.Substring($idx + $sepUsed.Length).Trim()

        # Nettoyer les backticks markdown eventuels autour du JSON
        $jsonPart = $jsonPart -replace '(?s)^```json\s*', '' -replace '```\s*$', ''
        $jsonPart = $jsonPart.Trim()

        # Ecrire HTML
        $htmlPath = Join-Path $HTML_DIR "$customId.html"
        [System.IO.File]::WriteAllText($htmlPath, $htmlPart, [System.Text.Encoding]::UTF8)

        # Ecrire JSON harvest
        $jsonPath = Join-Path $HARVEST_DIR "$customId.json"
        [System.IO.File]::WriteAllText($jsonPath, $jsonPart, [System.Text.Encoding]::UTF8)

        $countOK++

        if ($countOK % 50 -eq 0) {
            Write-Host "  ... $countOK traites" -ForegroundColor DarkGray
        }

    } catch {
        $countError++
        $errorLog += "PARSE ERROR sur ligne : $($_.Exception.Message)"
    }
}

# Ecrire le log d'erreurs
if ($errorLog.Count -gt 0) {
    $errLogPath = Join-Path $LOG_DIR "errors_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    [System.IO.File]::WriteAllLines($errLogPath, $errorLog, [System.Text.Encoding]::UTF8)
    Write-Host "  Log erreurs : $errLogPath" -ForegroundColor DarkYellow
}

# ============================================================
# RAPPORT FINAL
# ============================================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " RAPPORT FINAL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Fiches OK (HTML + JSON) : $countOK" -ForegroundColor Green
Write-Host "  Fiches sans separateur  : $countNoSep" -ForegroundColor DarkYellow
Write-Host "  Erreurs API             : $countError" -ForegroundColor Red
Write-Host "  Output HTML             : $HTML_DIR" -ForegroundColor DarkGray
Write-Host "  Output Harvest          : $HARVEST_DIR" -ForegroundColor DarkGray
Write-Host "  Batch ID                : $batchId" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Prochaine etape : importer les HTML et JSON en base via le module admin Anatomie" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "!!! ERREUR !!!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $lineNum = $_.InvocationInfo.ScriptLineNumber
    if ($lineNum) {
        Write-Host "Ligne : $lineNum" -ForegroundColor Red
        Write-Host $_.InvocationInfo.Line.Trim() -ForegroundColor DarkRed
    }
}

# --- FILET 3 : Read-Host HORS try/catch ---
Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
