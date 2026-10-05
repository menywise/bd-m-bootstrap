# update-instances-stats.ps1 v1.1.0
# Recupere les stats BDB via atelier_prompt_reprise() et recrit instances-stats.js
# SECURITE : utilise SERVICE_ROLE_KEY depuis .env -- jamais deploye sur FTP

# Chemin du .env (racine projet)
$EnvPath = Join-Path $PSScriptRoot "..\.env"

# Chemin de sortie
$OutPath = Join-Path $PSScriptRoot "..\modules\site\instances-stats.js"

# --- Lecture .env ---
if (-not (Test-Path $EnvPath)) {
  Write-Host "[ERREUR] .env introuvable : $EnvPath"
  exit 1
}

$SupabaseUrl = ""
$ServiceKey  = ""

Get-Content $EnvPath | ForEach-Object {
  $line = $_.Trim()
  if ($line -match "^SUPABASE_URL=(.+)$")              { $SupabaseUrl = $Matches[1].Trim() }
  if ($line -match "^SUPABASE_SERVICE_ROLE_KEY=(.+)$") { $ServiceKey  = $Matches[1].Trim() }
}

if (-not $SupabaseUrl -or -not $ServiceKey) {
  Write-Host "[ERREUR] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY absent du .env"
  exit 1
}

Write-Host "[INFO] Appel RPC atelier_prompt_reprise()..."

$Headers = @{
  "apikey"        = $ServiceKey
  "Authorization" = "Bearer $ServiceKey"
  "Content-Type"  = "application/json"
}

$RpcUrl = "$SupabaseUrl/rest/v1/rpc/atelier_prompt_reprise"

# Invoke-WebRequest pour recuperer le JSON brut (evite la deserialization auto)
$Response = Invoke-WebRequest -Uri $RpcUrl -Method POST -Headers $Headers -Body "{}" -ContentType "application/json"

if (-not $Response -or $Response.StatusCode -ne 200) {
  Write-Host "[ERREUR] RPC echec HTTP $($Response.StatusCode)"
  exit 1
}

# Parser le JSON brut
$Json = $Response.Content | ConvertFrom-Json

# La RPC retourne l'objet directement : { terrain: {...}, stats: {...}, ... }
$Terrain = $Json.terrain

Write-Host "[DEBUG] protocoles    = $($Terrain.protocoles)"
Write-Host "[DEBUG] chirurgiens   = $($Terrain.chirurgiens_actifs)"
Write-Host "[DEBUG] interventions = $($Terrain.interventions)"
Write-Host "[DEBUG] fiches_papier = $($Terrain.fiches_papier)"
Write-Host "[DEBUG] glossaire     = $($Terrain.glossaire)"

$Protocoles    = [int]$Terrain.protocoles
$Chirurgiens   = [int]$Terrain.chirurgiens_actifs
$Interventions = [int]$Terrain.interventions
$Fiches        = [int]$Terrain.fiches_papier
$Glossaire     = [int]$Terrain.glossaire

if ($Protocoles -eq 0 -and $Chirurgiens -eq 0) {
  Write-Host "[ERREUR] Stats toutes a 0 -- JSON brut (500 premiers chars) :"
  Write-Host $Response.Content.Substring(0, [Math]::Min(500, $Response.Content.Length))
  exit 1
}

Write-Host "[INFO] Protocoles    : $Protocoles"
Write-Host "[INFO] Chirurgiens   : $Chirurgiens"
Write-Host "[INFO] Interventions : $Interventions"
Write-Host "[INFO] Fiches        : $Fiches"
Write-Host "[INFO] Glossaire     : $Glossaire"

$DateMaj = (Get-Date -Format "yyyy-MM-dd")

# --- Generation instances-stats.js ---
$Js = @"
/**
 * FILE     : instances-stats.js
 * MODULE   : modules/site/
 * AUTEUR   : Genere par scripts/update-instances-stats.ps1
 * MAJ      : $DateMaj
 * DESC     : Stats statiques BDB -- NE PAS MODIFIER MANUELLEMENT.
 */

window.BDB_STATS = {
  protocoles    : $Protocoles,
  chirurgiens   : $Chirurgiens,
  interventions : $Interventions,
  fiches        : $Fiches,
  glossaire     : $Glossaire,
  derniereMaj   : "$DateMaj",
  instances     : [
    {
      id           : "chenieux-ortho",
      nom          : "BDB Ortho \u2014 Ch\u00e9nieux",
      etablissement: "Clinique Ch\u00e9nieux, Limoges",
      specialite   : "Orthop\u00e9die & Traumatologie",
      statut       : "actif",
      depuis       : "2026"
    }
  ]
};
"@

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($OutPath, $Js, $Utf8NoBom)

Write-Host "[OK] instances-stats.js recrit : $OutPath"
