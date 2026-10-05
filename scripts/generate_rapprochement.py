# -*- coding: utf-8 -*-
"""
generate_rapprochement.py
Genere D:/DEV/BIBLE_DE_BLOC/_ARCHIVE/DATA/rapprochement_fiches.html
Etape 1 : scan filesystem docx/doc
Etape 2 : extraction protocoles depuis migrations SQL
Etape 3 : matching flou
Etape 4 : generation HTML autonome
"""

import os, re, json, unicodedata

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
SCAN_ROOT   = r"D:\DEV\BIBLE_DE_BLOC\_ARCHIVE\DATA\01_SALE_PAR_CHIRURGIEN"
OUTPUT_HTML = r"D:\DEV\BIBLE_DE_BLOC\_ARCHIVE\DATA\rapprochement_fiches.html"
MIG_DIR     = r"D:\DEV\BIBLE_DE_BLOC\02_INFRASTRUCTURE\Supabase\migrations"
MIG_DIR_C   = r"C:\DEV\BIBLE_DE_BLOC\migrations"

# ─────────────────────────────────────────
# ETAPE 1 : SCAN FILESYSTEM
# ─────────────────────────────────────────
print("[1] Scan filesystem...")
fiches = []
for chirurgien in os.listdir(SCAN_ROOT):
    chir_path = os.path.join(SCAN_ROOT, chirurgien)
    if not os.path.isdir(chir_path):
        continue
    for fname in os.listdir(chir_path):
        if fname.startswith("~"):
            continue
        if not (fname.lower().endswith(".docx") or fname.lower().endswith(".doc")):
            continue
        nom_fichier = os.path.splitext(fname)[0]
        chemin_relatif = os.path.join(chirurgien, fname)
        fiches.append({
            "chirurgien": chirurgien,
            "nom_fichier": nom_fichier,
            "chemin_relatif": chemin_relatif,
        })
print(f"   {len(fiches)} fichiers trouves")

# ─────────────────────────────────────────
# ETAPE 2 : EXTRACTION PROTOCOLES SQL
# ─────────────────────────────────────────
print("[2] Extraction protocoles depuis SQL...")

def read_sql(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read()
    except:
        try:
            with open(path, encoding="latin-1") as f:
                return f.read()
        except:
            return ""

# Parse INSERT INTO thesaurus_protocoles
def parse_inserts(sql_text):
    """Retourne dict id_protocole -> {fields}"""
    results = {}
    # Regex pour VALUES sur 1 ligne (format seed)
    # Capture les colonnes listees dans le INSERT
    blocks = re.findall(
        r"INSERT INTO (?:public\.)?thesaurus_protocoles\s*\(([^)]+)\)\s*VALUES\s*\((.+?)\)\s*;",
        sql_text, re.DOTALL | re.IGNORECASE
    )
    for cols_raw, vals_raw in blocks:
        cols = [c.strip() for c in cols_raw.split(",")]
        # Parse les valeurs SQL en respectant les quotes
        vals = parse_sql_values(vals_raw)
        if len(vals) != len(cols):
            continue
        row = dict(zip(cols, vals))
        pid = row.get("id_protocole", "")
        if pid:
            results[pid] = row
    return results

def parse_sql_values(raw):
    """Decoupe les valeurs SQL en liste de strings."""
    vals = []
    i = 0
    raw = raw.strip()
    while i < len(raw):
        if raw[i] == "'":
            # string SQL
            j = i + 1
            s = []
            while j < len(raw):
                if raw[j] == "'" and j+1 < len(raw) and raw[j+1] == "'":
                    s.append("'")
                    j += 2
                elif raw[j] == "'":
                    j += 1
                    break
                else:
                    s.append(raw[j])
                    j += 1
            vals.append("".join(s))
            i = j
            # skip comma + space
            while i < len(raw) and raw[i] in (", \n\r\t"):
                i += 1
        elif raw[i:i+4].upper() == "NULL":
            vals.append(None)
            i += 4
            while i < len(raw) and raw[i] in (", \n\r\t"):
                i += 1
        elif raw[i] in "0123456789-":
            j = i
            while j < len(raw) and raw[j] not in (",\n\r\t)"):
                j += 1
            vals.append(raw[i:j].strip())
            i = j
            while i < len(raw) and raw[i] in (", \n\r\t"):
                i += 1
        else:
            i += 1
    return vals

# Parse UPDATE SET libelle_cible ou synonymes_recherche
def parse_updates(sql_text):
    """Retourne dict id_protocole -> {updated fields}"""
    results = {}
    # Pattern UPDATE ... SET field1='val1', field2='val2' ... WHERE id_protocole = 'ACT-XXXX'
    blocks = re.findall(
        r"UPDATE\s+(?:public\.)?thesaurus_protocoles\s+SET\s+(.+?)\s+WHERE\s+id_protocole\s*=\s*'(ACT-\d+)'",
        sql_text, re.DOTALL | re.IGNORECASE
    )
    for set_clause, pid in blocks:
        updates = {}
        # Parse chaque key='value' dans SET
        for m in re.finditer(r"(\w+)\s*=\s*'((?:[^']|'')*)'", set_clause):
            updates[m.group(1)] = m.group(2).replace("''", "'")
        # NULL values
        for m in re.finditer(r"(\w+)\s*=\s*NULL", set_clause, re.IGNORECASE):
            updates[m.group(1)] = None
        if updates:
            results[pid] = updates
    return results

# Charger le seed initial
protocoles = {}
seed_file = os.path.join(MIG_DIR, "018_thesaurus_seed_protocoles.sql")
sql = read_sql(seed_file)
protocoles.update(parse_inserts(sql))
print(f"   Apres 018 seed : {len(protocoles)} protocoles")

# Enrichissement synonymes (019)
enrich_file = os.path.join(MIG_DIR, "019_thesaurus_enrichissement.sql")
updates = parse_updates(read_sql(enrich_file))
for pid, upd in updates.items():
    if pid in protocoles:
        protocoles[pid].update(upd)
print(f"   Apres 019 enrichissement : {len(protocoles)} protocoles")

# Nouveaux protocoles 022 (nerf ulnaire)
for fname in ["022_thesaurus_protocoles_nerf_ulnaire.sql"]:
    f = os.path.join(MIG_DIR, fname)
    inserts = parse_inserts(read_sql(f))
    for pid, row in inserts.items():
        if pid not in protocoles:
            protocoles[pid] = row
    upd_022 = parse_updates(read_sql(f))
    for pid, upd in upd_022.items():
        if pid in protocoles:
            protocoles[pid].update(upd)

# 023 normalisation libelles
for fname in ["023_thesaurus_normalisation_libelles.sql"]:
    f = os.path.join(MIG_DIR, fname)
    upd = parse_updates(read_sql(f))
    for pid, u in upd.items():
        if pid in protocoles:
            protocoles[pid].update(u)

# 025 neuro cicatrice + cle hd
for fname in ["025_thesaurus_protocoles_neuro_cicatrice_cle_hd.sql"]:
    f = os.path.join(MIG_DIR, fname)
    inserts = parse_inserts(read_sql(f))
    for pid, row in inserts.items():
        if pid not in protocoles:
            protocoles[pid] = row
    upd = parse_updates(read_sql(f))
    for pid, u in upd.items():
        if pid in protocoles:
            protocoles[pid].update(u)

# 026 recreation ACT-0207
for fname in ["026_thesaurus_recreer_ACT0207.sql"]:
    f = os.path.join(MIG_DIR, fname)
    inserts = parse_inserts(read_sql(f))
    for pid, row in inserts.items():
        protocoles[pid] = row

print(f"   Total apres 022/023/025/026 : {len(protocoles)} protocoles")

# Appliquer les migrations recentes depuis C:\DEV\BIBLE_DE_BLOC\migrations\
for fname in sorted(os.listdir(MIG_DIR_C)):
    if not fname.endswith(".sql"):
        continue
    f = os.path.join(MIG_DIR_C, fname)
    sql_c = read_sql(f)
    # INSERTs nouveaux
    new_inserts = parse_inserts(sql_c)
    for pid, row in new_inserts.items():
        if pid not in protocoles:
            protocoles[pid] = row
    # UPDATEs libelle + synonymes
    upd = parse_updates(sql_c)
    for pid, u in upd.items():
        if pid in protocoles:
            protocoles[pid].update(u)
    # DELETEs
    deletes = re.findall(r"DELETE FROM (?:public\.)?thesaurus_protocoles\s+WHERE\s+id_protocole\s*=\s*'(ACT-\d+)'", sql_c, re.IGNORECASE)
    for pid in deletes:
        protocoles.pop(pid, None)

print(f"   Total apres migrations recentes : {len(protocoles)} protocoles")

# Construire la liste finale
proto_list = []
for pid, row in protocoles.items():
    proto_list.append({
        "id_protocole"      : pid,
        "libelle_cible"     : row.get("libelle_cible", "") or "",
        "specialite"        : row.get("specialite", "") or "",
        "type"              : row.get("type", "") or "",
        "zone_anat"         : row.get("zone_anat", "") or "",
        "pareto"            : row.get("pareto", "") or "",
        "synonymes_recherche": row.get("synonymes_recherche", "") or "",
    })
proto_list.sort(key=lambda x: x["id_protocole"])
print(f"   {len(proto_list)} protocoles dans la liste finale")

# ─────────────────────────────────────────
# ETAPE 3 : MATCHING FLOU (Python)
# ─────────────────────────────────────────
print("[3] Matching flou...")

ABBREVS = {
    r"\bPTH\b": "PROTHESE TOTALE HANCHE",
    r"\bPTG\b": "PROTHESE TOTALE GENOU",
    r"\bPTE\b": "PROTHESE TOTALE EPAULE",
    r"\bPIH\b": "PROTHESE INTERMEDIAIRE HANCHE",
    r"\bLCA\b": "LIGAMENT CROISE ANTERIEUR",
    r"\bKJ\b":  "KOENIG JUDET",
    r"\bDHS\b": "VIS PLAQUE DHS",
    r"\bEMC\b": "ENCLOUAGE CENTROMEDULLAIRE",
    r"\bOSTEO\b": "OSTEOSYNTHESE",
    r"\bARTHRO\b": "ARTHROSCOPIE",
    r"\bK BROCHE\b": "EMBROCHAGE",
    r"\bHV\b":  "HALLUX VALGUS",
    r"\bHR\b":  "HALLUX RIGIDUS",
    r"\bSCC\b": "SYNDROME CANAL CARPIEN",
    r"\bSDC\b": "SYNDROME DE QUERVAIN",
    r"\bDDB\b": "DOIGT A RESSORT",
    r"\bRCR\b": "REPARATION COIFFE ROTATEURS",
}

def normalize(s):
    s = s.replace("_", " ").replace("-", " ").replace(".", " ")
    s = re.sub(r"\s+", " ", s).strip().upper()
    # Supprimer accents
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s

def expand_abbrevs(s):
    for pat, repl in ABBREVS.items():
        s = re.sub(pat, repl, s)
    return s

def levenshtein(a, b):
    if a == b:
        return 0
    la, lb = len(a), len(b)
    if la == 0: return lb
    if lb == 0: return la
    prev = list(range(lb + 1))
    for i, ca in enumerate(a):
        curr = [i + 1] + [0] * lb
        for j, cb in enumerate(b):
            curr[j+1] = min(prev[j+1]+1, curr[j]+1, prev[j] + (0 if ca==cb else 1))
        prev = curr
    return prev[lb]

def token_score(query_tokens, target_str):
    """Score basé sur le nombre de tokens query trouvés dans target."""
    if not query_tokens:
        return 0.0
    target_tokens = set(normalize(target_str).split())
    hits = sum(1 for t in query_tokens if t in target_tokens or
               any(tt.startswith(t) or t.startswith(tt) for tt in target_tokens if len(t) > 3 and len(tt) > 3))
    return hits / len(query_tokens)

def similarity(norm_query, target_str):
    norm_target = normalize(target_str)
    # Levenshtein normalise
    max_len = max(len(norm_query), len(norm_target), 1)
    lev = levenshtein(norm_query, norm_target)
    lev_score = 1.0 - lev / max_len
    # Token score
    q_tokens = [t for t in norm_query.split() if len(t) > 2]
    tok_score = token_score(q_tokens, norm_target)
    return max(lev_score, tok_score)

# Preparer les protocoles normalises
for p in proto_list:
    p["_norm_libelle"] = normalize(p["libelle_cible"])
    p["_norm_synonymes"] = [normalize(s.strip()) for s in re.split(r"[,|]", p["synonymes_recherche"]) if s.strip()]

NEURO_CHIR = {"LAGARRIGUE"}

def match_fiche(fiche):
    chir_upper = fiche["chirurgien"].upper()
    is_neuro_chir = any(n in chir_upper for n in NEURO_CHIR)

    nom = fiche["nom_fichier"]
    # Supprimer les initiales en fin (ex: " JA", " JL", " DR X")
    nom_clean = re.sub(r"\s+[A-Z]{1,3}\s*$", "", nom)
    norm_nom = normalize(nom_clean)
    norm_nom = expand_abbrevs(norm_nom)

    # Filtre specialite
    candidates = proto_list
    if is_neuro_chir:
        neuro_cands = [p for p in proto_list if "NEURO" in (p.get("specialite","") + p.get("type","")).upper()]
        candidates = neuro_cands if neuro_cands else proto_list
    else:
        candidates = [p for p in proto_list if "NEURO" not in (p.get("specialite","") + p.get("type","")).upper()]

    best_score = 0.0
    best_proto = None
    best_via = ""

    # Match exact id_protocole (pattern ACT-XXXX dans le nom)
    m = re.search(r"ACT-(\d+)", fiche["nom_fichier"], re.IGNORECASE)
    if m:
        pid = f"ACT-{m.group(1).zfill(4)}"
        for p in proto_list:
            if p["id_protocole"] == pid:
                return {**fiche, "match_proto": p, "score": 1.0, "statut": "Rapproche", "via": "id_exact", "notes": ""}
        # si non trouve dans liste apres deletes
        if pid:
            return {**fiche, "match_proto": None, "score": 0.0, "statut": "Sans correspondance", "via": "", "notes": f"id {pid} introuvable"}

    for p in candidates:
        # vs libelle_cible
        s1 = similarity(norm_nom, p["libelle_cible"])
        via = "libelle"
        best_s = s1

        # vs synonymes
        for syn in p["_norm_synonymes"]:
            s2 = similarity(norm_nom, syn)
            if s2 > best_s:
                best_s = s2
                via = "synonyme"

        if best_s > best_score:
            best_score = best_s
            best_proto = p
            best_via = via

    if best_score >= 0.8:
        statut = "A valider (fort)"
    elif best_score >= 0.5:
        statut = "A valider (faible)"
    else:
        statut = "Sans correspondance"

    return {**fiche, "match_proto": best_proto, "score": round(best_score, 3), "statut": statut, "via": best_via, "notes": ""}

results = [match_fiche(f) for f in fiches]
print(f"   {len(results)} fiches traitees")

# Stats
ct_fort    = sum(1 for r in results if r["statut"] == "A valider (fort)")
ct_faible  = sum(1 for r in results if r["statut"] == "A valider (faible)")
ct_rappr   = sum(1 for r in results if r["statut"] == "Rapproche")
ct_sans    = sum(1 for r in results if r["statut"] == "Sans correspondance")
print(f"   Fort:{ct_fort}  Faible:{ct_faible}  Rapproche:{ct_rappr}  Sans:{ct_sans}")

# ─────────────────────────────────────────
# ETAPE 4 : GENERATION HTML
# ─────────────────────────────────────────
print("[4] Generation HTML...")

def esc(s):
    if not s:
        return ""
    return (str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;"))

def build_row_js(r):
    mp = r.get("match_proto") or {}
    return {
        "chirurgien"       : r["chirurgien"],
        "nom_fichier"      : r["nom_fichier"],
        "chemin_relatif"   : r["chemin_relatif"],
        "id_protocole_match": mp.get("id_protocole", ""),
        "libelle_cible_match": mp.get("libelle_cible", ""),
        "via"              : r["via"],
        "score"            : r["score"],
        "statut"           : r["statut"],
        "notes"            : r["notes"],
    }

rows_js = [build_row_js(r) for r in results]
protos_js = [
    {k: v for k, v in p.items() if not k.startswith("_")}
    for p in proto_list
]

json_rows   = json.dumps(rows_js,   ensure_ascii=False)
json_protos = json.dumps(protos_js, ensure_ascii=False)

HTML = r"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rapprochement Fiches BDB</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
<style>
  body { font-size:0.85rem; }
  .sticky-top-bar { position:sticky; top:0; z-index:100; background:#fff; padding-bottom:4px; border-bottom:1px solid #dee2e6; }
  .table-sm td, .table-sm th { padding:0.25rem 0.4rem; }
  .badge { font-size:0.75rem; }
  #summary-table thead th { cursor:pointer; }
  #main-table thead th { cursor:pointer; user-select:none; }
  .sort-icon { font-size:0.7rem; }
  td[contenteditable] { background:#fffce8; min-width:80px; }
  .chir-row { cursor:pointer; }
  .chir-row:hover { background:#e8f0ff !important; }
  .chir-row.active { background:#d0e8ff !important; }
  .status-select { font-size:0.8rem; padding:1px 4px; border-radius:4px; }
</style>
</head>
<body>
<div class="container-fluid py-2">

<div class="sticky-top-bar">
  <div class="d-flex align-items-center gap-2 flex-wrap py-1">
    <strong class="me-2">Rapprochement Fiches BDB</strong>
    <select id="sel-chir" class="form-select form-select-sm" style="width:220px">
      <option value="">-- Tous chirurgiens --</option>
    </select>
    <select id="sel-statut" class="form-select form-select-sm" style="width:200px">
      <option value="">-- Tous statuts --</option>
      <option>A valider (fort)</option>
      <option>A valider (faible)</option>
      <option>Rapproche</option>
      <option>Sans correspondance</option>
      <option>Hors scope</option>
    </select>
    <input id="txt-search" type="text" class="form-control form-control-sm" placeholder="Recherche..." style="width:200px">
    <button class="btn btn-sm btn-outline-secondary" onclick="resetFiltres()">Reinitialiser</button>
    <button class="btn btn-sm btn-primary ms-auto" onclick="saveLS()"><i class="bi bi-save"></i> Sauvegarder</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="exportCSV()"><i class="bi bi-download"></i> Export CSV</button>
  </div>
  <div id="counters" class="d-flex gap-3 py-1 text-muted small"></div>
</div>

<h6 class="mt-2 mb-1">Synthese par chirurgien</h6>
<div style="max-height:260px; overflow-y:auto; margin-bottom:8px;">
<table id="summary-table" class="table table-sm table-striped table-hover">
  <thead class="table-dark sticky-top">
    <tr>
      <th>Chirurgien</th>
      <th class="text-end">Fiches</th>
      <th class="text-end">Rapprochees</th>
      <th class="text-end">Sans corresp.</th>
      <th class="text-end">A valider</th>
      <th class="text-end">Hors scope</th>
      <th class="text-end">% couverture</th>
    </tr>
  </thead>
  <tbody id="summary-body"></tbody>
</table>
</div>

<h6 class="mb-1">Tableau principal</h6>
<div style="overflow-x:auto;">
<table id="main-table" class="table table-sm table-striped table-hover">
  <thead class="table-secondary sticky-top">
    <tr>
      <th data-col="chirurgien">Chirurgien <span class="sort-icon"></span></th>
      <th data-col="nom_fichier">Nom fichier <span class="sort-icon"></span></th>
      <th data-col="libelle_cible_match">Protocole match <span class="sort-icon"></span></th>
      <th data-col="id_protocole_match">ID Protocole</th>
      <th data-col="score">Score <span class="sort-icon"></span></th>
      <th data-col="statut">Statut <span class="sort-icon"></span></th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody id="main-body"></tbody>
</table>
</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
// ── DATA ──────────────────────────────────────────────────────────
const ROWS_ORIG = """ + json_rows + r""";
const PROTOCOLES = """ + json_protos + r""";

// ── STATE ─────────────────────────────────────────────────────────
let rows = JSON.parse(JSON.stringify(ROWS_ORIG));
let filterChir = "";
let filterStatut = "";
let filterText = "";
let sortCol = "";
let sortDir = 1;
let activeChirRow = null;

const LS_KEY = "bdb_rapprochement_fiches";

// ── INIT ──────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  restoreLS();
  initChirSelect();
  bindEvents();
  render();
});

function escHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function initChirSelect() {
  const sel = document.getElementById("sel-chir");
  const chirs = [...new Set(rows.map(r => r.chirurgien))].sort();
  chirs.forEach(c => {
    const o = document.createElement("option");
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
}

function bindEvents() {
  document.getElementById("sel-chir").addEventListener("change", e => {
    filterChir = e.target.value;
    activeChirRow = null;
    document.querySelectorAll("#summary-body tr").forEach(r => r.classList.remove("active"));
    render();
  });
  document.getElementById("sel-statut").addEventListener("change", e => {
    filterStatut = e.target.value;
    render();
  });
  document.getElementById("txt-search").addEventListener("input", e => {
    filterText = e.target.value.toLowerCase();
    render();
  });
  document.querySelectorAll("#main-table thead th[data-col]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (sortCol === col) sortDir *= -1;
      else { sortCol = col; sortDir = 1; }
      document.querySelectorAll("#main-table thead th span.sort-icon").forEach(s => s.textContent = "");
      th.querySelector(".sort-icon").textContent = sortDir === 1 ? " ▲" : " ▼";
      render();
    });
  });
}

// ── FILTRAGE + TRI ────────────────────────────────────────────────
function filtered() {
  let list = rows;
  if (filterChir) list = list.filter(r => r.chirurgien === filterChir);
  if (filterStatut) list = list.filter(r => r.statut === filterStatut);
  if (filterText) {
    list = list.filter(r =>
      (r.nom_fichier||"").toLowerCase().includes(filterText) ||
      (r.libelle_cible_match||"").toLowerCase().includes(filterText) ||
      (r.id_protocole_match||"").toLowerCase().includes(filterText) ||
      (r.notes||"").toLowerCase().includes(filterText)
    );
  }
  if (sortCol) {
    list = [...list].sort((a,b) => {
      const av = (a[sortCol]||"").toString();
      const bv = (b[sortCol]||"").toString();
      return av.localeCompare(bv, "fr") * sortDir;
    });
  }
  return list;
}

// ── STATUT BADGE ─────────────────────────────────────────────────
function statutBadge(statut) {
  const map = {
    "Rapproche":          "bg-success",
    "A valider (fort)":   "bg-info text-dark",
    "A valider (faible)": "bg-warning text-dark",
    "Sans correspondance":"bg-danger",
    "Hors scope":         "bg-secondary",
  };
  return map[statut] || "bg-light text-dark";
}

// ── SCORE BADGE ──────────────────────────────────────────────────
function scoreBadge(score) {
  const pct = Math.round(score * 100);
  const cl = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning text-dark" : "bg-danger";
  return `<span class="badge ${cl}">${pct}%</span>`;
}

// ── RENDER MAIN TABLE ─────────────────────────────────────────────
function render() {
  const list = filtered();
  const tbody = document.getElementById("main-body");
  tbody.innerHTML = "";
  list.forEach((r, i) => {
    const idx = rows.indexOf(r);
    const via = r.via === "synonyme" ? ' <small class="text-muted">(via synonyme)</small>' : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escHtml(r.chirurgien)}</td>
      <td><span class="fw-semibold">${escHtml(r.nom_fichier)}</span><br>
          <small class="text-muted">${escHtml(r.chemin_relatif)}</small></td>
      <td>${escHtml(r.libelle_cible_match)}${via}</td>
      <td>
        <input type="text" class="form-control form-control-sm" style="min-width:100px"
          value="${escHtml(r.id_protocole_match)}"
          data-idx="${idx}"
          onchange="onIdChange(this)">
      </td>
      <td>${scoreBadge(r.score)}</td>
      <td>
        <select class="status-select form-select form-select-sm"
          data-idx="${idx}"
          onchange="onStatutChange(this)">
          ${["A valider (fort)","A valider (faible)","Rapproche","Sans correspondance","Hors scope"]
            .map(s => `<option${s===r.statut?" selected":""}>${escHtml(s)}</option>`).join("")}
        </select>
      </td>
      <td contenteditable="true" data-idx="${idx}" onblur="onNotesChange(this)">${escHtml(r.notes)}</td>
    `;
    tbody.appendChild(tr);
  });
  renderSummary();
  renderCounters(list.length);
}

function onStatutChange(el) {
  const idx = parseInt(el.dataset.idx);
  rows[idx].statut = el.value;
  renderSummary();
  renderCounters(filtered().length);
}

function onIdChange(el) {
  const idx = parseInt(el.dataset.idx);
  const val = el.value.trim().toUpperCase();
  rows[idx].id_protocole_match = val;
  // Chercher le libelle dans PROTOCOLES
  const found = PROTOCOLES.find(p => p.id_protocole === val);
  if (found) {
    rows[idx].libelle_cible_match = found.libelle_cible;
    rows[idx].statut = "Rapproche";
    rows[idx].score = 1.0;
  }
  render();
}

function onNotesChange(el) {
  const idx = parseInt(el.dataset.idx);
  rows[idx].notes = el.textContent;
}

// ── SUMMARY TABLE ─────────────────────────────────────────────────
function renderSummary() {
  const tbody = document.getElementById("summary-body");
  tbody.innerHTML = "";
  const chirs = [...new Set(rows.map(r => r.chirurgien))].sort();
  let totals = { fiches:0, rappr:0, sans:0, aval:0, hors:0 };

  chirs.forEach(chir => {
    const subset = rows.filter(r => r.chirurgien === chir);
    const fiches = subset.length;
    const rappr  = subset.filter(r => r.statut === "Rapproche").length;
    const sans   = subset.filter(r => r.statut === "Sans correspondance").length;
    const aval   = subset.filter(r => r.statut === "A valider (fort)" || r.statut === "A valider (faible)").length;
    const hors   = subset.filter(r => r.statut === "Hors scope").length;
    const pct    = fiches ? Math.round(rappr / fiches * 100) : 0;
    const pctCl  = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning text-dark" : "bg-danger";

    totals.fiches += fiches;
    totals.rappr  += rappr;
    totals.sans   += sans;
    totals.aval   += aval;
    totals.hors   += hors;

    const tr = document.createElement("tr");
    tr.className = "chir-row";
    if (filterChir === chir && activeChirRow !== null) tr.classList.add("active");
    tr.innerHTML = `
      <td>${escHtml(chir)}</td>
      <td class="text-end">${fiches}</td>
      <td class="text-end">${rappr}</td>
      <td class="text-end">${sans}</td>
      <td class="text-end">${aval}</td>
      <td class="text-end">${hors}</td>
      <td class="text-end"><span class="badge ${pctCl}">${pct}%</span></td>
    `;
    tr.addEventListener("click", () => {
      const sel = document.getElementById("sel-chir");
      if (filterChir === chir) {
        filterChir = "";
        sel.value = "";
        activeChirRow = null;
        document.querySelectorAll("#summary-body tr").forEach(r => r.classList.remove("active"));
      } else {
        filterChir = chir;
        sel.value = chir;
        activeChirRow = chir;
        document.querySelectorAll("#summary-body tr").forEach(r => r.classList.remove("active"));
        tr.classList.add("active");
      }
      render();
    });
    tbody.appendChild(tr);
  });

  // Ligne totals
  const totPct = totals.fiches ? Math.round(totals.rappr / totals.fiches * 100) : 0;
  const totCl  = totPct >= 80 ? "bg-success" : totPct >= 50 ? "bg-warning text-dark" : "bg-danger";
  const trTot  = document.createElement("tr");
  trTot.className = "fw-bold table-dark";
  trTot.innerHTML = `
    <td>TOTAL</td>
    <td class="text-end">${totals.fiches}</td>
    <td class="text-end">${totals.rappr}</td>
    <td class="text-end">${totals.sans}</td>
    <td class="text-end">${totals.aval}</td>
    <td class="text-end">${totals.hors}</td>
    <td class="text-end"><span class="badge ${totCl}">${totPct}%</span></td>
  `;
  tbody.appendChild(trTot);
}

// ── COUNTERS ──────────────────────────────────────────────────────
function renderCounters(total) {
  const rappr = rows.filter(r => r.statut === "Rapproche").length;
  const sans  = rows.filter(r => r.statut === "Sans correspondance").length;
  const aval  = rows.filter(r => r.statut.startsWith("A valider")).length;
  const hors  = rows.filter(r => r.statut === "Hors scope").length;
  document.getElementById("counters").innerHTML =
    `<span>Affichees : <strong>${total}</strong></span>` +
    ` | Total fiches : <strong>${rows.length}</strong>` +
    ` | <span class="text-success">Rapprochees : <strong>${rappr}</strong></span>` +
    ` | <span class="text-danger">Sans corresp. : <strong>${sans}</strong></span>` +
    ` | A valider : <strong>${aval}</strong>` +
    ` | Hors scope : <strong>${hors}</strong>`;
}

// ── FILTRES ───────────────────────────────────────────────────────
function resetFiltres() {
  filterChir = ""; filterStatut = ""; filterText = "";
  activeChirRow = null;
  document.getElementById("sel-chir").value = "";
  document.getElementById("sel-statut").value = "";
  document.getElementById("txt-search").value = "";
  document.querySelectorAll("#summary-body tr").forEach(r => r.classList.remove("active"));
  render();
}

// ── PERSISTANCE ───────────────────────────────────────────────────
function saveLS() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
    alert("Sauvegarde OK (" + rows.length + " fiches)");
  } catch(e) {
    alert("Erreur sauvegarde : " + e.message);
  }
}

function restoreLS() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length === ROWS_ORIG.length) {
      parsed.forEach((r, i) => {
        rows[i].statut = r.statut || rows[i].statut;
        rows[i].id_protocole_match = r.id_protocole_match || rows[i].id_protocole_match;
        rows[i].libelle_cible_match = r.libelle_cible_match || rows[i].libelle_cible_match;
        rows[i].notes = r.notes || "";
      });
    }
  } catch(e) {
    console.warn("RestoreLS error:", e);
  }
}

// ── EXPORT CSV ────────────────────────────────────────────────────
function exportCSV() {
  const list = filtered();
  const cols = ["chirurgien","nom_fichier","chemin_relatif","libelle_cible_match","id_protocole_match","score","statut","notes"];
  const header = cols.map(c => `"${c}"`).join(";");
  const lines = list.map(r =>
    cols.map(c => `"${String(r[c]||"").replace(/"/g,'""')}"`).join(";")
  );
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "rapprochement_fiches.csv";
  a.click();
  URL.revokeObjectURL(url);
}
</script>
</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(HTML)
print(f"[OK] Fichier genere : {OUTPUT_HTML}")
print(f"     {len(rows_js)} fiches | {len(proto_list)} protocoles")
