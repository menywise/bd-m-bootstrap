# NOMMAGE_PROJET.md

```
VERSION  : 1.1.0
DATE     : 2026-03-22
AUTEUR   : Manu + Claude
STATUT   : CONTRAT — table de référence stable entre toutes les sessions
RÔLE     : Fixer la nomenclature des fichiers de gouvernance transverses.
           Toute IA qui travaille sur ce projet lit ce fichier et applique
           sans dériver, sans diverger entre sessions.
NOYAU_REF: NOYAU_VERITE_V2_4_0
DELTA    : V1.0.0 → V1.1.0 :
           03_CDS_REFERENCE_V1_0_0 ajouté (D-2026-03-22-CSS-01).
           Renumérotation 03→17 en cascade.
           Versions fichiers mises à jour (JOURNAL V1_17_0, GUIDE V1_2_2,
           TEMPLATE_CTX V1_2_0, BACKLOG V2_4_0, SUPABASE V1_6_0).
           Script sync PowerShell mis à jour.
```

> ⚠ RÈGLE ABSOLUE : Ce fichier est la source de vérité unique pour le nommage
> des fichiers de gouvernance transverses du projet Claude (Project Knowledge).
> En cas de doute sur un nom de fichier → consulter ce document.
> Ne jamais renommer un fichier sans mettre à jour ce document.

---

## 1 — RÈGLE DE NOMMAGE

```
FORMAT   : {PRÉFIXE}_{NOM_MÉTIER}_{VERSION}.md
PRÉFIXE  : Entier 2 chiffres (00, 01, 02...) — détermine l'ordre de chargement IA
NOM      : Nom métier en majuscules, underscores
VERSION  : V{MAJEUR}_{MINEUR}_{PATCH} — aligné sur la version réelle du fichier
EXEMPLE  : 00_NOYAU_VERITE_V2_4_0.md
```

**Règle de priorité** : un fichier de rang inférieur prime sur un fichier de rang supérieur
en cas de conflit. `00_` prime sur `01_` qui prime sur `02_`, etc.

---

## 2 — TABLE DE CORRESPONDANCE

### Niveau 0 — Socle absolu (prime sur tout)

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `00_` | `00_NOYAU_VERITE_V2_4_0.md` | Source unique de reprise — prime sur tout |
| `01_` | `01_JOURNAL_DECISIONS_V1_17_0.md` | Décisions validées Manu — append-only |

### Niveau 1 — Architecture & données (contrat système)

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `02_` | `02_CHANTIER_TECHNIQUE_V1_0_6.md` | Décisions d'architecture technique pérennes |
| `03_` | `03_CDS_REFERENCE_V1_0_0.md` | Classes CSS disponibles par couche — consulter avant tout CSS/HTML |
| `04_` | `04_SUPABASE_DATA_MODEL_V1_6_0.md` | Modèle de données global |
| `05_` | `05_CTX_SYSTEM_ARCHITECTURE_V2_2_0.md` | Contrat d'architecture système global |

### Niveau 2 — Référentiels métier & sécurité

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `06_` | `06_AUDIT_SECURITE_V1_0_0.md` | RLS, menaces, plan sécurité OVH |
| `07_` | `07_BIBLE_DE_BLOC_V1_0_3.md` | Référentiel métier bloc opératoire |
| `08_` | `08_PERSONAS_BDB_V1_3_0.md` | 9 personas + règle de voix + angles morts DC |

### Niveau 3 — Dépendances & contrats techniques

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `09_` | `09_MODULE_DEPENDENCY_MAP_V1_4_0.md` | Dépendances réelles inter-modules |
| `10_` | `10_STORAGE_KEYS_CONTRACT_V1_0_1.md` | Contrat clés localStorage Planning Engine |

### Niveau 4 — Guides opérationnels (comment travailler)

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `11_` | `11_GUIDE_TRAVAIL_SESSION_V1_2_2.md` | Protocole d'entrée en session — anti-régression |
| `12_` | `12_GUIDE_INTEGRATION_MODULE_V1_0_1.md` | Checklist création nouveau module BDB |
| `13_` | `13_TEMPLATE_CTX_MODULE_V1_2_0.md` | Template CTX module — base de tout nouveau CTX |

### Niveau 5 — Instances & backlog

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `14_` | `14_CTX_TEMPLATE_VIERGE_V1_0_0.md` | Instance template vierge — référence CDS |
| `15_` | `15_BACKLOG_SESSIONS_V2_4_0.md` | Suivi des sessions planifiées |

### Niveau 6 — Stratégie & optimisation

| Préfixe | Nom fichier dans le projet | Rôle |
|---------|---------------------------|------|
| `16_` | `16_PLAN_OPTIMISATION_WORKFLOW_V1_0_0.md` | Optimisation workflow sessions Claude |
| `17_` | `17_STRATEGIE_DELEGATION_V1_0_0.md` | Délégation tâches Claude / Qwen local |

### Méta (sans préfixe)

| Nom fichier | Rôle |
|-------------|------|
| `NOMMAGE_PROJET_V1_1_0.md` | Ce fichier — table de référence nommage |
| `CTX_[NOM_MODULE].md` | CTX module spécifique — chargé selon périmètre session |

---

## 3 — RÈGLES D'USAGE

```
R1 — Tout fichier ajouté au projet Claude reçoit son préfixe selon ce tableau.
     Ne jamais uploader un fichier sans préfixe.

R2 — Quand un fichier est mis à jour (nouvelle version) :
     Supprimer l'ancien du projet Claude → uploader le nouveau avec le préfixe conservé.
     Exemple : 11_GUIDE_TRAVAIL_SESSION_V1_2_1.md → 11_GUIDE_TRAVAIL_SESSION_V1_2_2.md

R3 — Ce fichier NOMMAGE_PROJET est lui-même dans le projet Claude sans préfixe.
     Il est la meta-référence du nommage.
     Nom dans le projet : NOMMAGE_PROJET_V1_1_0.md

R4 — Les CTX modules (CTX_ADMIN, CTX_FICHES, etc.) ne reçoivent PAS de préfixe.
     Ils sont chargés à la demande selon le périmètre session.

R5 — En cas de divergence entre deux sessions sur le nommage :
     Ce fichier fait autorité. Pas la conversation.

R6 — Quand un nouveau fichier de gouvernance transverse est créé,
     mettre à jour ce fichier ET le PATCH NOYAU BLOC 6 en même temps.
```

---

## 4 — PROCÉDURE SYNC LOCALE (sync-projet-claude.ps1)

Script à exécuter après chaque session modifiant un fichier de gouvernance.
Met à jour le dossier `_PROJET_CLAUDE\` avec les noms préfixés.

```powershell
$src = "C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE"
$dst = "C:\DEV\BIBLE_DE_BLOC\_PROJET_CLAUDE"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$map = @{
  "NOYAU_VERITE_V2_4_0.md"               = "00_NOYAU_VERITE_V2_4_0.md"
  "JOURNAL_DECISIONS_V1_17_0.md"         = "01_JOURNAL_DECISIONS_V1_17_0.md"
  "CHANTIER_TECHNIQUE_V1_0_6.md"         = "02_CHANTIER_TECHNIQUE_V1_0_6.md"
  "CDS_REFERENCE_V1_0_0.md"              = "03_CDS_REFERENCE_V1_0_0.md"
  "SUPABASE_DATA_MODEL_V1_6_0.md"        = "04_SUPABASE_DATA_MODEL_V1_6_0.md"
  "CTX_SYSTEM_ARCHITECTURE_V2_2_0.md"    = "05_CTX_SYSTEM_ARCHITECTURE_V2_2_0.md"
  "AUDIT_SECURITE_BDB_V1_0_0.md"         = "06_AUDIT_SECURITE_V1_0_0.md"
  "BIBLE_DE_BLOC_V1_0_3.md"              = "07_BIBLE_DE_BLOC_V1_0_3.md"
  "PERSONAS_BDB_V1_3_0.md"               = "08_PERSONAS_BDB_V1_3_0.md"
  "MODULE_DEPENDENCY_MAP_V1_4_0.md"      = "09_MODULE_DEPENDENCY_MAP_V1_4_0.md"
  "STORAGE_KEYS_CONTRACT_V1_0_1.md"      = "10_STORAGE_KEYS_CONTRACT_V1_0_1.md"
  "GUIDE_TRAVAIL_SESSION_V1_2_2.md"      = "11_GUIDE_TRAVAIL_SESSION_V1_2_2.md"
  "GUIDE_INTEGRATION_MODULE_V1_0_1.md"   = "12_GUIDE_INTEGRATION_MODULE_V1_0_1.md"
  "TEMPLATE_CTX_MODULE_V1_2_0.md"        = "13_TEMPLATE_CTX_MODULE_V1_2_0.md"
  "CTX_TEMPLATE_VIERGE.md"               = "14_CTX_TEMPLATE_VIERGE_V1_0_0.md"
  "BACKLOG_SESSIONS_V2_4_0.md"           = "15_BACKLOG_SESSIONS_V2_4_0.md"
  "PLAN_OPTIMISATION_WORKFLOW.md"        = "16_PLAN_OPTIMISATION_WORKFLOW_V1_0_0.md"
  "STRATEGIE_DELEGATION_CLAUDE_VS_QWEN.md" = "17_STRATEGIE_DELEGATION_V1_0_0.md"
  "NOMMAGE_PROJET_V1_1_0.md"             = "NOMMAGE_PROJET_V1_1_0.md"
}

$copied = 0
foreach ($entry in $map.GetEnumerator()) {
    $srcFile = Join-Path $src $entry.Key
    if (Test-Path $srcFile) {
        Copy-Item $srcFile (Join-Path $dst $entry.Value) -Force
        $copied++
        Write-Host "OK $($entry.Value)" -ForegroundColor Green
    } else {
        Write-Host "ABSENT : $($entry.Key)" -ForegroundColor Yellow
    }
}
Write-Host "`n$copied/$($map.Count) fichiers synchronises" -ForegroundColor Cyan
```

---

## 5 — HISTORIQUE

| Date | Version | Action |
|------|---------|--------|
| 2026-03-22 | 1.0.0 | Création. Table 16 fichiers. Script sync PowerShell. Règles R1-R5. |
| 2026-03-22 | 1.1.0 | Ajout 03_CDS_REFERENCE_V1_0_0. Renumérotation 03→17 en cascade. Versions fichiers corrigées. Règle R6 ajoutée. Script sync mis à jour. |
