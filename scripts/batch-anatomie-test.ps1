# ============================================================
# batch-anatomie-test.ps1
# VERSION  : 1.0.0
# DATE     : 2026-04-13
# STATUT   : ponctuel
# OBJECTIF : Test unitaire generation anatomie -- 1 protocole a la fois
#            Appel direct /v1/messages (pas batch) -- resultat immediat
# PREREQUIS: Lancer via batch-anatomie-test.bat
#            .env a la racine avec SUPABASE_URL, ANON_KEY, ANTHROPIC_API_KEY
#            batch-anatomie-system-prompt.txt dans scripts/
# OUTPUT   : C:\DEV\BIBLE_DE_BLOC\_batch_anatomie\test\html\[id].html
#            C:\DEV\BIBLE_DE_BLOC\_batch_anatomie\test\harvest\[id].json
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

# --- CONFIG ---
$ROOT        = "C:\DEV\BIBLE_DE_BLOC"
$SCRIPTS_DIR = Join-Path $ROOT "scripts"
$OUTPUT_DIR  = Join-Path $ROOT "_batch_anatomie\test"
$HTML_DIR    = Join-Path $OUTPUT_DIR "html"
$HARVEST_DIR = Join-Path $OUTPUT_DIR "harvest"
$PROMPT_FILE = Join-Path $SCRIPTS_DIR "batch-anatomie-system-prompt.txt"
$MODEL       = "claude-sonnet-4-6"
$MAX_TOKENS  = 6000

try {

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " BDB -- Batch Anatomie TEST v1.0.0" -ForegroundColor Cyan
Write-Host " Mode : 1 protocole a la fois, resultat immediat" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# ETAPE 0 : Chargement .env
# ============================================================
Write-Host "[0/3] Chargement .env..." -ForegroundColor Yellow

$envPath = Join-Path $ROOT ".env"
if (-not (Test-Path $envPath)) { throw "Fichier .env introuvable : $envPath" }

$envVars = @{}
foreach ($line in (Get-Content -Path $envPath -Encoding UTF8)) {
    $line = $line.Trim()
    if ($line -and $line -notmatch '^\s*#' -and $line -match '^([^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $val = $Matches[2].Trim().Trim('"').Trim("'")
        $envVars[$key] = $val
    }
}
Write-Host "  Cles trouvees : $($envVars.Keys -join ', ')" -ForegroundColor DarkGray

$SUPABASE_URL = $envVars['SUPABASE_URL']
$ANON_KEY     = $envVars['ANON_KEY']
$API_KEY      = $envVars['ANTHROPIC_API_KEY']

if (-not $SUPABASE_URL -or -not $ANON_KEY -or -not $API_KEY) {
    throw "Variables manquantes dans .env : SUPABASE_URL, ANON_KEY, ANTHROPIC_API_KEY"
}
Write-Host "  OK - Variables chargees" -ForegroundColor Green

# Chargement prompt systeme
if (-not (Test-Path $PROMPT_FILE)) { throw "Prompt introuvable : $PROMPT_FILE" }
$SYSTEM_PROMPT = [System.IO.File]::ReadAllText($PROMPT_FILE, [System.Text.Encoding]::UTF8)
Write-Host "  OK - Prompt systeme charge ($($SYSTEM_PROMPT.Length) chars)" -ForegroundColor Green

# Creation dossiers output
@($OUTPUT_DIR, $HTML_DIR, $HARVEST_DIR) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  Cree : $_" -ForegroundColor DarkGray
    }
}

# ============================================================
# ETAPE 1 : Fetch protocoles depuis Supabase
# ============================================================
Write-Host ""
Write-Host "[1/3] Fetch protocoles depuis Supabase..." -ForegroundColor Yellow

$sbHeaders = @{
    "apikey"        = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
}

$selectCols = "id,id_protocole,libelle_cible,zone_anat,cat_parent,specialite,pathologie,alertes,synonymes_recherche,definition_expert,pareto,codes_ccam"
$sbUrl = "$SUPABASE_URL/rest/v1/thesaurus_protocoles?select=$selectCols&limit=1000&order=id_protocole"

$protocoles = Invoke-RestMethod -Uri $sbUrl -Headers $sbHeaders -Method GET |
              Where-Object { $_.id_protocole -ne $null }

if ($protocoles.Count -eq 0) { throw "Aucun protocole recupere depuis Supabase" }

Write-Host "  OK - $($protocoles.Count) protocoles charges" -ForegroundColor Green

# Headers Anthropic
$anthropicHeaders = @{
    "x-api-key"         = $API_KEY
    "anthropic-version" = "2023-06-01"
    "Content-Type"      = "application/json"
}

# ============================================================
# ETAPE 2 : Boucle de selection et generation
# ============================================================
Write-Host ""
Write-Host "[2/3] Selection du protocole" -ForegroundColor Yellow
Write-Host "  Tapez un filtre pour rechercher (id ou mot du libelle)" -ForegroundColor DarkGray
Write-Host "  Exemples : GENOU  /  ACT-006  /  ARTHRO  /  EPAULE" -ForegroundColor DarkGray
Write-Host "  Tapez * pour afficher les 30 premiers" -ForegroundColor DarkGray

$continuer = $true

while ($continuer) {

    Write-Host ""
    $filtre = (Read-Host "Filtre").Trim().ToUpper()

    # Filtrer la liste
    if ($filtre -eq '*') {
        $resultats = $protocoles | Select-Object -First 30
    } else {
        $resultats = $protocoles | Where-Object {
            $_.id_protocole.ToUpper().Contains($filtre) -or
            $_.libelle_cible.ToUpper().Contains($filtre)
        } | Select-Object -First 30
    }

    if ($resultats.Count -eq 0) {
        Write-Host "  Aucun resultat pour '$filtre' -- reessayez" -ForegroundColor DarkYellow
        continue
    }

    # Afficher resultats numerotes
    Write-Host ""
    Write-Host "  --- Resultats ($($resultats.Count)) ---" -ForegroundColor DarkCyan
    $i = 1
    foreach ($r in $resultats) {
        Write-Host ("  {0,3}. {1}  {2}" -f $i, $r.id_protocole, $r.libelle_cible) -ForegroundColor White
        $i++
    }
    Write-Host ""

    # Choix du numero
    $choixStr = (Read-Host "Numero du protocole (0 = nouveau filtre)").Trim()
    $choixNum = 0
    if (-not [int]::TryParse($choixStr, [ref]$choixNum)) {
        Write-Host "  Entree invalide -- tapez un numero" -ForegroundColor DarkYellow
        continue
    }
    if ($choixNum -eq 0) { continue }
    if ($choixNum -lt 1 -or $choixNum -gt $resultats.Count) {
        Write-Host "  Numero hors plage (1-$($resultats.Count))" -ForegroundColor DarkYellow
        continue
    }

    # Protocole selectionne
    $p = $resultats[$choixNum - 1]

    # Verifier si deja traite
    $htmlExist    = Join-Path $HTML_DIR    "$($p.id_protocole).html"
    $harvestExist = Join-Path $HARVEST_DIR "$($p.id_protocole).json"
    if ((Test-Path $htmlExist) -and (Test-Path $harvestExist)) {
        Write-Host ""
        Write-Host "  Ce protocole a deja un resultat sauvegarde." -ForegroundColor DarkYellow
        $regen = (Read-Host "  Regenerer ? (O/N)").Trim().ToUpper()
        if ($regen -ne 'O') {
            Write-Host "  Passe au suivant." -ForegroundColor DarkGray
            goto_next_choice:
        }
    }

    # ============================================================
    # ETAPE 3 : Generation via /v1/messages
    # ============================================================
    Write-Host ""
    Write-Host "[3/3] Generation : $($p.id_protocole) -- $($p.libelle_cible)" -ForegroundColor Yellow

    # Fetch codes CCAM pour ce protocole uniquement
    $ccamSection = "Aucun code CCAM associe"
    if ($p.codes_ccam) {
        $codes = $p.codes_ccam -split '[,|]' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
        if ($codes.Count -gt 0) {
            $codeList = $codes -join ','
            $ccamUrl = "$SUPABASE_URL/rest/v1/referentiel_ccam?select=code_ccam,libelle,chapitre_libelle,section&code_ccam=in.($codeList)&limit=50"
            try {
                $ccamData = Invoke-RestMethod -Uri $ccamUrl -Headers $sbHeaders -Method GET
                $lookup = @{}
                foreach ($c in $ccamData) { $lookup[$c.code_ccam] = $c }
                $ccamLines = $codes | ForEach-Object {
                    if ($lookup.ContainsKey($_)) {
                        $c   = $lookup[$_]
                        $sec = if ($c.section) { " > $($c.section)" } else { "" }
                        "- $_ : $($c.libelle) ($($c.chapitre_libelle)$sec)"
                    } else {
                        "- $_ (libelle non resolu)"
                    }
                }
                $ccamSection = $ccamLines -join "`n"
                Write-Host "  CCAM : $($ccamData.Count) code(s) resolu(s)" -ForegroundColor DarkGray
            } catch {
                Write-Host "  AVERT - Fetch CCAM echoue : $($_.Exception.Message)" -ForegroundColor DarkYellow
            }
        }
    }

    # Construire le message utilisateur
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

    # Corps de la requete
    $body = [PSCustomObject]@{
        model      = $MODEL
        max_tokens = $MAX_TOKENS
        system     = @(
            [PSCustomObject]@{
                type = "text"
                text = $SYSTEM_PROMPT
            }
        )
        messages   = @(
            [PSCustomObject]@{
                role    = "user"
                content = $userMsg
            }
        )
    }

    $bodyJson = $body | ConvertTo-Json -Depth 20 -Compress

    Write-Host "  Appel API en cours..." -ForegroundColor DarkGray
    $tStart = Get-Date

    $response = Invoke-RestMethod `
        -Uri "https://api.anthropic.com/v1/messages" `
        -Method POST `
        -Headers $anthropicHeaders `
        -Body $bodyJson

    $elapsed = [math]::Round(((Get-Date) - $tStart).TotalSeconds, 1)
    Write-Host "  OK - Reponse recue en ${elapsed}s" -ForegroundColor Green

    # Tokens utilises
    $tokIn  = $response.usage.input_tokens
    $tokOut = $response.usage.output_tokens
    Write-Host "  Tokens : in=$tokIn / out=$tokOut" -ForegroundColor DarkGray

    # Extraire le texte
    $text = $response.content[0].text

    # Parser separateur
    $sep1    = "---JSON---"
    $sep2    = "<!--JSON-->"
    $sepUsed = $null
    if ($text.Contains($sep1)) { $sepUsed = $sep1 }
    elseif ($text.Contains($sep2)) { $sepUsed = $sep2 }

    if (-not $sepUsed) {
        Write-Host "  AVERT - Separateur absent dans la reponse" -ForegroundColor DarkYellow
        $rawPath = Join-Path $OUTPUT_DIR "$($p.id_protocole)_raw.txt"
        [System.IO.File]::WriteAllText($rawPath, $text, [System.Text.Encoding]::UTF8)
        Write-Host "  Texte brut sauvegarde : $rawPath" -ForegroundColor DarkYellow
    } else {
        $idx      = $text.IndexOf($sepUsed)
        $htmlPart = $text.Substring(0, $idx).Trim()
        $jsonPart = $text.Substring($idx + $sepUsed.Length).Trim()

        # Nettoyer backticks markdown
        $jsonPart = $jsonPart -replace '(?s)^```json\s*', '' -replace '```\s*$', ''
        $jsonPart = $jsonPart.Trim()

        # Valider JSON
        try {
            $parsed = $jsonPart | ConvertFrom-Json
            Write-Host "  JSON valide - buckets : installation=$($parsed.installation.Count) arsenal=$($parsed.arsenal.Count) fiches=$($parsed.fiches.Count) glossaire=$($parsed.glossaire.Count)" -ForegroundColor Green
        } catch {
            Write-Host "  AVERT - JSON invalide : $($_.Exception.Message)" -ForegroundColor DarkYellow
        }

        # Sauvegarder
        [System.IO.File]::WriteAllText($htmlExist, $htmlPart, [System.Text.Encoding]::UTF8)
        [System.IO.File]::WriteAllText($harvestExist, $jsonPart, [System.Text.Encoding]::UTF8)

        Write-Host ""
        Write-Host "  Fichiers sauvegardes :" -ForegroundColor Green
        Write-Host "    HTML    : $htmlExist" -ForegroundColor DarkGray
        Write-Host "    Harvest : $harvestExist" -ForegroundColor DarkGray
        Write-Host ""

        # Apercu HTML (50 premieres lignes)
        Write-Host "  --- APERCU HTML (debut) ---" -ForegroundColor DarkCyan
        $htmlLines = $htmlPart -split "`n" | Select-Object -First 12
        foreach ($l in $htmlLines) { Write-Host "  $l" -ForegroundColor Gray }
        Write-Host "  [...]" -ForegroundColor DarkGray

        # Apercu harvest
        Write-Host ""
        Write-Host "  --- APERCU HARVEST JSON ---" -ForegroundColor DarkCyan
        if ($parsed.synonymes_thesaurus.Count -gt 0) {
            Write-Host "  synonymes_thesaurus : $($parsed.synonymes_thesaurus -join ', ')" -ForegroundColor Gray
        }
        if ($parsed.alertes_thesaurus) {
            Write-Host "  alertes_thesaurus   : $($parsed.alertes_thesaurus)" -ForegroundColor Gray
        }
        if ($parsed.ambigus.Count -gt 0) {
            Write-Host "  ambigus             : $($parsed.ambigus.Count) element(s)" -ForegroundColor Gray
        }
        if ($parsed.orphelins.Count -gt 0) {
            Write-Host "  orphelins           : $($parsed.orphelins.Count) element(s)" -ForegroundColor Gray
        }
    }

    # Continuer ou quitter
    Write-Host ""
    $suite = (Read-Host "Tester un autre protocole ? (O/N)").Trim().ToUpper()
    if ($suite -ne 'O') {
        $continuer = $false
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Fin des tests" -ForegroundColor Cyan
Write-Host " Output : $OUTPUT_DIR" -ForegroundColor DarkGray
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

Write-Host ""
Read-Host "Appuie sur Entree pour fermer"
