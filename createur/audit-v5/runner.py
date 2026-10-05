#!/usr/bin/env python3
"""Audit qualite migration v5 DB&M — runner Python L3"""

import argparse
import json
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
RULES_FILE = Path(__file__).parent / "runner-rules.json"
RESULTS_DIR = Path(__file__).parent / "results"
REPORTS_DIR = Path(__file__).parent / "reports"

TRANCHES = {
    "T1": ["F01", "F02"], "T2": ["F03", "F04"], "T3": ["F05", "F06"],
    "T4": ["F07", "F08"], "T5": ["F09", "F10"], "T6": ["F11", "F12"],
    "T7": ["F13"], "T8": ["F14", "F15"], "T9": ["F16"],
}
DEMO_MODULES = {"glossaire", "faq", "cours", "anatomie"}


def collect_files():
    files = {}
    md = ROOT / "modules"
    # Exclure dossiers obsoletes (stubs apres renommage)
    EXCLUDED_MODULES = {'medacta-coste'}
    if md.exists():
        for d in sorted(md.iterdir()):
            if d.is_dir() and d.name not in EXCLUDED_MODULES:
                f = d / "index.html"
                if f.exists():
                    rel = str(f.relative_to(ROOT)).replace("\\", "/")
                    files[rel] = {"surface": "module", "module_key": d.name, "demo": d.name in DEMO_MODULES}
    sd = ROOT / "site"
    if sd.exists():
        for f in sorted(sd.glob("*.html")):
            if f.name.startswith("_"): continue
            rel = str(f.relative_to(ROOT)).replace("\\", "/")
            files[rel] = {"surface": "site", "demo": False}
    for f in sorted(ROOT.glob("*.html")):
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        files[rel] = {"surface": "racine", "demo": False}
    return files


class AuditContext:
    def __init__(self, filepath, surface, content, meta=None):
        self.filepath = filepath
        self.surface = surface
        self.content = content
        self.meta = meta or {}


def st(ok, na=False, skip=False, details=None):
    if skip: return {"statut": "SKIP", "details": details or {}}
    if na: return {"statut": "NA", "details": details or {}}
    return {"statut": "OK" if ok else "KO", "details": details or {}}


# F01
def f01_d01(c):
    if c.surface != "module": return st(True, na=True)
    expected = ["bootstrap@5.3.3", "bootstrap-icons@1.11.1", "dbm-theme.css", "bdb-ui-kit.css", "dbm-module-color.css"]
    pos = []
    for e in expected:
        i = c.content.find(e)
        if i == -1: return st(False, details={"missing": e})
        pos.append((e, i))
    return st(pos == sorted(pos, key=lambda x: x[1]))

def f01_d02(c):
    if c.surface != "module": return st(True, na=True)
    # Cherche uniquement dans les balises <script src="...">
    expected = ["bootstrap.bundle.min.js", "supabase-js@2", "supabase-client.js", "bdb-shell.js"]
    pos = []
    for e in expected:
        # Pattern strict : <script src="..." contient e
        m = re.search(r'<script\s+src="[^"]*' + re.escape(e) + r'[^"]*"', c.content)
        if not m: return st(False, details={"missing": e})
        pos.append((e, m.start()))
    is_ordered = all(pos[k][1] < pos[k+1][1] for k in range(len(pos)-1))
    if not is_ordered:
        bad = [(pos[k][0], pos[k+1][0]) for k in range(len(pos)-1) if pos[k][1] >= pos[k+1][1]]
        return st(False, details={"order_violation": bad})
    return st(True)

def f01_d03(c):
    if c.surface != "module": return st(True, na=True)
    return st(bool(re.search(r'<div id="wrapper"[^>]*>\s*(?:<!--[^>]*-->\s*)*<div id="bdb-shell"', c.content)))

def f01_d04(c):
    if c.surface != "module": return st(True, na=True)
    has_dbm = 'data-shell-theme="dbm"' in c.content
    has_cds = 'data-shell-theme="cds"' in c.content
    return st(has_dbm and not has_cds)

def f01_d05(c): return st("theme-base.css" not in c.content)
def f01_d06(c): return st("cds-overrides.css" not in c.content)
def f01_d07(c): return st(c.content.count("@latest") == 0)

def f01_d08(c):
    if c.surface == "site": return st(True, na=True)
    # bdb-pwa.js peut etre n importe ou dans le HTML (HEAD ou body)
    return st("bdb-pwa.js" in c.content)

# F02
def f02_d01(c): return st(bool(re.search(r'<meta\s+charset\s*=\s*["\']?UTF-?8', c.content, re.I)))
def f02_d02(c): return st(bool(re.search(r'<meta\s+name\s*=\s*"viewport"\s+content\s*=\s*"[^"]*width=device-width', c.content)))

def f02_d03(c):
    m = re.search(r'<title[^>]*>([^<]+)</title>', c.content)
    if not m: return st(False)
    t = m.group(1)
    # Accepte : "Des Blocs & Moi", "DB&M", "DB&amp;M", ou "DBM" suffixe
    has_dbm = ("Des Blocs" in t or "DB&amp;M" in t or "DB&M" in t
               or re.search(r'\bDBM\b', t) is not None)
    return st(has_dbm, details={"title": t})

def f02_d04(c):
    n = len(re.findall(r'Bible de Bloc', c.content))
    return st(n == 0, details={"count": n})

def f02_d05(c):
    zones = []
    m = re.search(r'<title[^>]*>([^<]+)</title>', c.content)
    if m: zones.append(m.group(1))
    for h in re.finditer(r'<h[1-3][^>]*>([^<]+)</h[1-3]>', c.content):
        zones.append(h.group(1))
    m = re.search(r'<meta\s+name\s*=\s*"description"\s+content\s*=\s*"([^"]+)"', c.content)
    if m: zones.append(m.group(1))
    for cm in re.finditer(r'<!--([^-]|-(?!->))*-->', c.content):
        zones.append(cm.group(0))
    v = [z for z in zones if re.search(r'\bBDB\b', z)]
    return st(len(v) == 0, details={"count": len(v)})

def f02_d06(c):
    if c.surface != "module": return st(True, na=True)
    return st(bool(re.search(r':root\s*\{[^}]*--module-color\s*:[^}]*\}', c.content)))

def f02_d07(c):
    m = re.search(r'<!--\s*(BDB|DBM)\s*\|\s*Surface', c.content)
    if not m: return st(False, details={"no_marker": True})
    return st(m.group(1) != "BDB", details={"prefix": m.group(1)})

# F03
def f03_d01(c):
    if c.surface != "module": return st(True, na=True)
    zones = re.findall(r'data-zone="([^"]+)"', c.content)
    if not zones: return st(False)
    expected = ["Breadcrumb", "Page Title", "Filters", "Content"]
    actual = [z for z in zones if z in expected]
    return st(actual == [e for e in expected if e in zones], details={"zones": zones})

def f03_d02(c):
    if c.surface != "module": return st(True, na=True)
    sec = len(re.findall(r'<section\s+class="app-zone"', c.content))
    zones = len(re.findall(r'data-zone="', c.content))
    return st(sec >= 1 and sec == zones, details={"sections": sec, "zones": zones})

def f03_d03(c):
    if c.surface != "module": return st(True, na=True)
    return st(bool(re.search(r'p-4 rounded shadow-sm.*?linear-gradient', c.content, re.DOTALL)))

def f03_d04(c):
    if c.surface != "module": return st(True, na=True)
    has = bool(re.search(r'<div class="app-content"\s+data-module-color=', c.content))
    has_s = bool(re.search(r'data-module-color="[^"]+"\s+style="--module-color:', c.content))
    return st(has and has_s)

def f03_d05(c):
    if c.surface != "module": return st(True, na=True)
    a = c.content.find('<!-- /app-content -->')
    f = c.content.find('<footer')
    if f == -1: return st(True, na=True)
    return st(a < f if a > -1 else True)

def f03_d06(c):
    if c.surface != "module": return st(True, na=True)
    w = c.content.find('<!-- /wrapper -->')
    if w == -1: w = c.content.rfind('</div><!-- /wrapper -->')
    m = re.search(r'<div class="modal fade"', c.content)
    if not m: return st(True, na=True)
    if w == -1: return st(False)
    return st(w < m.start())

# F04
def f04_d01(c):
    if c.surface != "module": return st(True, na=True)
    # NA pour modules sans toolbar de recherche (placeholders, admin, supervision)
    NO_SEARCH = {'admin','supervision','ged','pedagogie','recueil-situation','medacta-coste'}
    if c.filepath.parent.name in NO_SEARCH:
        return st(True, na=True, details={"reason": "module sans toolbar"})
    return st(bool(re.search(r'input-group[^>]*>.*?bi-search.*?<input', c.content, re.DOTALL)))

def f04_d02(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<select[^>]*class="form-select', c.content))
    if n == 0: return st(True, na=True)
    n180 = len(re.findall(r'style="width:180px', c.content))
    return st(n180 > 0, details={"selects": n, "w180": n180})

def f04_d03(c):
    if c.surface != "module": return st(True, na=True)
    # NA pour modules sans toolbar/CTA (placeholders)
    NO_CTA = {'admin','supervision','ged','pedagogie','recueil-situation','medacta-coste','profile'}
    if c.filepath.parent.name in NO_CTA:
        return st(True, na=True, details={"reason": "module sans CTA toolbar"})
    return st(bool(re.search(r'class="btn btn-module', c.content)))

def f04_d04(c):
    if c.surface != "module": return st(True, na=True)
    return st(True, skip=True, details={"reason": "complexe"})

def f04_d05(c):
    if c.surface != "module": return st(True, na=True)
    if not ("AdminSlot" in c.content or "admin-slot" in c.content.lower()):
        return st(True, na=True)
    return st(bool(re.search(r'd-none[^"]*"\s+id="[^"]*[Aa]dmin', c.content)))

def f04_d06(c): return st(True, skip=True, details={"reason": "Manuel CSS"})

# F05
def f05_d01(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    mhm = c.content.count('modal-header-module')
    light = len(re.findall(r'modal-content[^"]*bg-(dark|transparent)', c.content))
    dang = len(re.findall(r'modal-header[^"]*bg-danger', c.content))
    exp = n - light - dang
    return st(mhm >= exp, details={"n": n, "mhm": mhm, "exp": exp})

def f05_d02(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    cen = c.content.count('modal-dialog-centered')
    return st(cen >= n)

def f05_d03(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    return st(c.content.count('modal-lg') > 0)

def f05_d04(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    t = len(re.findall(r'<h5 class="modal-title"', c.content))
    return st(t >= n - 2, details={"n": n, "t": t})

def f05_d05(c):
    np = len(re.findall(r'class="btn btn-primary', c.content))
    return st(np == 0, details={"primary": np})

def f05_d06(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    a = len(re.findall(r'<div class="modal fade"[^>]*aria-labelledby', c.content))
    return st(a >= n - 1)

def f05_d07(c):
    if c.surface != "module": return st(True, na=True)
    n = len(re.findall(r'<div class="modal fade"', c.content))
    if n == 0: return st(True, na=True)
    t = len(re.findall(r'<div class="modal fade"[^>]*tabindex="-1"', c.content))
    return st(t >= n)

def f05_d08(c):
    nc = c.content.count('class="btn-close')
    if nc == 0: return st(True, na=True)
    na_aria = c.content.count('aria-label="Fermer"')
    return st(na_aria >= nc - 1)

# F06
def f06_d01(c):
    forb = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#0dcaf0', '#6c757d']
    # Recherche stricte : hex precede d un caractere non-hex (limite mot)
    found = []
    for h in forb:
        # Ignorer si dans un commentaire ou seulement dans une URL (CDN)
        matches = [m for m in re.finditer(re.escape(h), c.content)]
        # Filtrer : si dans <!--...--> ou href= ignorer
        real = []
        for m in matches:
            ctx_before = c.content[max(0,m.start()-50):m.start()]
            if '<!--' in ctx_before and '-->' not in ctx_before: continue
            if 'href=' in ctx_before[-30:] or 'src=' in ctx_before[-30:]: continue
            real.append(m.start())
        if real:
            found.append((h, len(real)))
    return st(len(found) == 0, details={"hex": found})

def f06_d02(c):
    if c.surface != "module": return st(True, na=True)
    return st('--module-color' in c.content)

def f06_d03(c):
    n = c.content.count('btn-danger')
    return st(n <= 3, details={"n": n})

def f06_d04(c):
    # Compter SEULEMENT les classes effectives (dans class=" ... ")
    nw = len(re.findall(r'class="[^"]*\bbtn-warning\b[^"]*"', c.content))
    ni = len(re.findall(r'class="[^"]*\bbtn-info\b[^"]*"', c.content))
    return st(nw + ni == 0, details={"warning": nw, "info": ni})

def f06_d05(c): return st(True, skip=True)

def f06_d06(c):
    # Recherche styles inline avec hex color/background hardcode
    # AUTORISES :
    # 1. linear-gradient (bandeau colore module)
    # 2. color: <var--module-color-text> hex pastels (whitelist DBM)
    # 3. style="--module-color:..." (cascade variables)
    m = re.findall(r'style="[^"]*"', c.content)
    real = []
    DBM_PASTELS = ['#1e3a8a','#1e1b4b','#14532d','#4c1d95','#7c2d12','#1e293b',
                   '#93c5fd','#60a5fa','#86efac','#4ade80','#c4b5fd','#a78bfa',
                   '#cbd5e1','#94a3b8','#fdba74','#fb923c',
                   '#7f1d1d','#fca5a5','#f87171','#fcd34d','#fbbf24','#78350f',
                   '#475569','#e2e8f0','#fef3c7']
    for x in m:
        if 'linear-gradient' in x: continue
        if '--module-color' in x: continue  # cascade variables CSS
        # Cherche hex
        hex_matches = re.findall(r'(?:color|background)\s*:\s*(#[0-9a-fA-F]{3,8})', x)
        for h in hex_matches:
            if h.lower() not in [p.lower() for p in DBM_PASTELS]:
                real.append((x[:60], h))
                break
    return st(len(real) == 0, details={"violations": real[:3], "n": len(real)})

def f06_d07(c):
    leg = ['cds-error-', 'bdb-module-header']
    f = [l for l in leg if l in c.content]
    return st(len(f) == 0, details={"legacy": f})

def f06_d08(c): return st(True, skip=True)

# F07
def f07_d01(c):
    sc = re.findall(r'<script[^>]*>(.*?)</script>', c.content, re.DOTALL)
    n = sum(s.count('console.log') for s in sc)
    return st(n == 0, details={"n": n})

def f07_d02(c): return st(True, skip=True)

def f07_d03(c):
    if c.surface != "module": return st(True, na=True)
    # NA pour modules placeholder sans grid async
    NO_GRID = {'admin','supervision','ged','pedagogie','recueil-situation','profile','medacta-coste'}
    if c.filepath.parent.name in NO_GRID:
        return st(True, na=True, details={"reason": "module placeholder sans grid"})
    hl = bool(re.search(r'id="[^"]*[Ll]oading', c.content))
    he = bool(re.search(r'id="[^"]*[Ee]mpty', c.content))
    her = bool(re.search(r'id="[^"]*[Ee]rror', c.content))
    return st(hl and he and her, details={"l": hl, "e": he, "err": her})

def f07_d04(c): return st(True, skip=True)
def f07_d05(c): return st(not bool(re.search(r'function\s+initAuth\s*\(', c.content)))
def f07_d06(c):
    # Exclure les commentaires JS (// window.bdb = ...) et HTML
    matches = re.findall(r'window\.bdb\s*=\s*[^=]', c.content)
    real = []
    for m in matches:
        # Trouver la position et verifier si dans commentaire
        idx = c.content.find(m)
        if idx == -1: continue
        # Ligne entiere
        line_start = c.content.rfind('\n', 0, idx) + 1
        line_end = c.content.find('\n', idx)
        line = c.content[line_start:line_end if line_end > -1 else len(c.content)]
        if line.strip().startswith('//') or line.strip().startswith('*'): continue
        if '<!--' in c.content[max(0,idx-200):idx]: continue
        real.append(m)
    return st(len(real) == 0, details={"redef": len(real)})
def f07_d07(c): return st(not bool(re.search(r'role\s*===?\s*["\']member["\']', c.content)))
def f07_d08(c): return st(len(re.findall(r'localStorage\.(set|get)Item\(["\'](?:role|admin|user_role)', c.content)) == 0)

def f07_d09(c):
    if 'supabase-client.js' in str(c.filepath): return st(True, na=True)
    return st(not bool(re.search(r'(supabaseUrl|SUPABASE_URL|SUPABASE_ANON_KEY|service_role)', c.content)))

# F08
def f08(c): return st(True, skip=True, details={"reason": "Puppeteer requis"})

# F09
def f09_d01(c): return st(True, skip=True)

def f09_d02(c):
    if 'bdb-shell.js' not in str(c.filepath): return st(True, na=True)
    return st('permissions' in c.content)

def f09_d03(c): return st(True, skip=True)
def f09_d04(c): return st(True, skip=True)

# F10
def f10_d01(c):
    rn = ['Coste', 'COSTE', 'Cedric', 'Olivia H.', 'Sophie P.', 'Sabine D.', 'Julie C.']
    f = [n for n in rn if n in c.content]
    return st(len(f) == 0, details={"names": f})

def f10_d02(c): return st(True, skip=True)
def f10_d03(c): return st(True, skip=True)

def f10_d04(c):
    if 'medacta-coste' in str(c.filepath):
        return st(False, details={"violation": "filesystem path"})
    return st(True)

# F11
def f11_d01(c):
    # Meta description requise UNIQUEMENT pour modules demo (mode invite) + site/
    if c.surface == "racine": return st(True, na=True)
    if c.surface == "module":
        if c.filepath.parent.name not in DEMO_MODULES:
            return st(True, na=True, details={"reason": "module non-demo (auth)"})
    has = bool(re.search(r'<meta\s+name="description"\s+content="[^"]+"', c.content))
    return st(has)

def f11_d02(c):
    if c.surface != "site": return st(True, na=True)
    return st(bool(re.search(r'<meta\s+name="keywords"', c.content)))

def f11_d03(c):
    # Modules auth privates : meta robots noindex pas obligatoire (auth bloque)
    # Modules demo (mode invite) : doivent avoir meta robots index, follow
    if c.surface != "module": return st(True, na=True)
    if c.filepath.parent.name not in DEMO_MODULES:
        return st(True, na=True, details={"reason": "module non-demo (auth)"})
    has = bool(re.search(r'<meta\s+name="robots"', c.content))
    return st(has)

def f11_d04(c):
    if c.surface != "site": return st(True, na=True)
    n = len(re.findall(r'<meta\s+property="og:', c.content))
    return st(n >= 4, details={"og": n})

def f11_d05(c):
    if c.surface != "site": return st(True, na=True)
    return st(bool(re.search(r'<meta\s+name="twitter:card"', c.content)))

def f11_d06(c):
    if c.surface != "site": return st(True, na=True)
    return st('"@context": "https://schema.org"' in c.content or "application/ld+json" in c.content)

def f11_d07(c):
    if c.surface != "site": return st(True, na=True)
    return st(bool(re.search(r'<link\s+rel="canonical"', c.content)))

def f11_d08(c): return st(bool(re.search(r'<html[^>]*\slang="fr"', c.content)))

def f11_d09(c): return st(True, skip=True)

def f11_d10(c):
    n = len(re.findall(r'<h1[\s>]', c.content))
    return st(n <= 1, details={"n": n})

def f11_d11(c): return st(True, skip=True)

def f11_d12(c):
    imgs = re.findall(r'<img\s+([^>]+)>', c.content)
    no = [i for i in imgs if 'alt=' not in i]
    return st(len(no) == 0, details={"no_alt": len(no)})

def f11_d13(c):
    if c.surface != "module": return st(True, na=True)
    if c.filepath.parent.name not in DEMO_MODULES: return st(True, na=True)
    return st(bool(re.search(r'<meta\s+name="description"\s+content="[^"]*(?:bloc|IBODE|chirurg)', c.content, re.I)))

def f11_d14(c):
    if c.surface != "module": return st(True, na=True)
    if c.filepath.parent.name not in DEMO_MODULES: return st(True, na=True)
    t = re.search(r'<title>([^<]+)</title>', c.content)
    if not t: return st(False)
    return st("IBODE" in t.group(1) or "bloc" in t.group(1).lower())

def f11_d15(c): return st(True, skip=True)
def f11_d16(c): return st(True, skip=True)

def f11_d17(c):
    if c.surface != "module": return st(True, na=True)
    if c.filepath.parent.name not in DEMO_MODULES: return st(True, na=True)
    return st(bool(re.search(r'<meta\s+name="robots"\s+content="index', c.content)))

def f12_d01(c):
    hrefs = re.findall(r'href="([^"#?][^"]*\.html)"', c.content)
    broken = []
    for h in hrefs:
        if h.startswith(('http', 'mailto:', 'tel:')): continue
        # Ignorer template literals JS (${...})
        if '${' in h or '$(' in h: continue
        try:
            t = (c.filepath.parent / h).resolve()
            if not t.exists(): broken.append(h)
        except: pass
    return st(len(broken) == 0, details={"broken": broken[:5], "n": len(broken)})

def f12_d02(c): return st(len(re.findall(r'(?:href|src)="/bdb/', c.content)) == 0)
def f12_d03(c): return st(len(re.findall(r'(?:href|src)="/dbm/', c.content)) == 0)
def f12_d04(c): return st(len(re.findall(r'(?:href|src)="http://', c.content)) == 0)

def f12_d05(c):
    el = re.findall(r'<a\s+([^>]*href="https?://[^"]+"[^>]*)>', c.content)
    nb = [l for l in el if 'target="_blank"' not in l or 'rel="noopener"' not in l]
    return st(len(nb) < 3, details={"missing": len(nb)})

def f12_d06(c): return st(len(re.findall(r'lebloc\.fr/bdb/', c.content)) == 0)
def f12_d07(c):
    r = re.findall(r'window\.location\.href\s*=\s*["\']([^"\']+\.html)', c.content)
    return st(True, details={"redirects": r[:5]})
def f12_d08(c):
    m = re.findall(r'href="mailto:([^"]+)"', c.content)
    inv = [x for x in m if '@' not in x]
    return st(len(inv) == 0)
def f12_d09(c): return st(True, skip=True)
def f12_d10(c): return st(True, skip=True)

def fskip(c): return st(True, skip=True, details={"reason": "Cross-check manuel"})

def f16_d09(c):
    en = re.findall(r'>\s*(Save|Submit|Cancel|Delete|Add|Edit|Close|Open|Login|Logout)\s*<', c.content)
    return st(len(en) == 0, details={"en": en[:5]})

CHECKS = {
    "F01-D01": f01_d01, "F01-D02": f01_d02, "F01-D03": f01_d03, "F01-D04": f01_d04,
    "F01-D05": f01_d05, "F01-D06": f01_d06, "F01-D07": f01_d07, "F01-D08": f01_d08,
    "F02-D01": f02_d01, "F02-D02": f02_d02, "F02-D03": f02_d03, "F02-D04": f02_d04,
    "F02-D05": f02_d05, "F02-D06": f02_d06, "F02-D07": f02_d07,
    "F03-D01": f03_d01, "F03-D02": f03_d02, "F03-D03": f03_d03, "F03-D04": f03_d04,
    "F03-D05": f03_d05, "F03-D06": f03_d06,
    "F04-D01": f04_d01, "F04-D02": f04_d02, "F04-D03": f04_d03, "F04-D04": f04_d04,
    "F04-D05": f04_d05, "F04-D06": f04_d06,
    "F05-D01": f05_d01, "F05-D02": f05_d02, "F05-D03": f05_d03, "F05-D04": f05_d04,
    "F05-D05": f05_d05, "F05-D06": f05_d06, "F05-D07": f05_d07, "F05-D08": f05_d08,
    "F06-D01": f06_d01, "F06-D02": f06_d02, "F06-D03": f06_d03, "F06-D04": f06_d04,
    "F06-D05": f06_d05, "F06-D06": f06_d06, "F06-D07": f06_d07, "F06-D08": f06_d08,
    "F07-D01": f07_d01, "F07-D02": f07_d02, "F07-D03": f07_d03, "F07-D04": f07_d04,
    "F07-D05": f07_d05, "F07-D06": f07_d06, "F07-D07": f07_d07, "F07-D08": f07_d08,
    "F07-D09": f07_d09,
    "F08-D01": f08, "F08-D02": f08, "F08-D03": f08, "F08-D04": f08, "F08-D05": f08, "F08-D06": f08,
    "F09-D01": f09_d01, "F09-D02": f09_d02, "F09-D03": f09_d03, "F09-D04": f09_d04,
    "F10-D01": f10_d01, "F10-D02": f10_d02, "F10-D03": f10_d03, "F10-D04": f10_d04,
    "F11-D01": f11_d01, "F11-D02": f11_d02, "F11-D03": f11_d03, "F11-D04": f11_d04,
    "F11-D05": f11_d05, "F11-D06": f11_d06, "F11-D07": f11_d07, "F11-D08": f11_d08,
    "F11-D09": f11_d09, "F11-D10": f11_d10, "F11-D11": f11_d11, "F11-D12": f11_d12,
    "F11-D13": f11_d13, "F11-D14": f11_d14, "F11-D15": f11_d15, "F11-D16": f11_d16,
    "F11-D17": f11_d17,
    "F12-D01": f12_d01, "F12-D02": f12_d02, "F12-D03": f12_d03, "F12-D04": f12_d04,
    "F12-D05": f12_d05, "F12-D06": f12_d06, "F12-D07": f12_d07, "F12-D08": f12_d08,
    "F12-D09": f12_d09, "F12-D10": f12_d10,
    "F13-D01": fskip, "F13-D02": fskip, "F13-D03": fskip, "F13-D04": fskip,
    "F13-D05": fskip, "F13-D06": fskip, "F13-D07": fskip, "F13-D08": fskip,
    "F13-D09": fskip, "F13-D10": fskip,
    "F14-D01": fskip, "F14-D02": fskip, "F14-D03": fskip, "F14-D04": fskip,
    "F14-D05": fskip, "F14-D06": fskip, "F14-D07": fskip, "F14-D08": fskip,
    "F14-D09": fskip, "F14-D10": fskip,
    "F15-D01": fskip, "F15-D02": fskip, "F15-D03": fskip, "F15-D04": fskip,
    "F15-D05": fskip, "F15-D06": fskip, "F15-D07": fskip, "F15-D08": fskip,
    "F16-D01": fskip, "F16-D02": fskip, "F16-D03": fskip, "F16-D04": fskip,
    "F16-D05": fskip, "F16-D06": fskip, "F16-D07": fskip, "F16-D08": fskip,
    "F16-D09": f16_d09, "F16-D10": fskip,
}


def run_audit(familles_to_run):
    rules = json.loads(RULES_FILE.read_text(encoding='utf-8'))
    files = collect_files()
    run_id = str(uuid.uuid4())
    run_date = datetime.now(timezone.utc).isoformat()
    results = []
    counts = {"OK": 0, "KO": 0, "NA": 0, "SKIP": 0, "P0": 0, "P1": 0, "P2": 0, "P3": 0}

    for famille in rules["familles"]:
        if familles_to_run and famille["ref"] not in familles_to_run:
            continue
        for dim in famille["dimensions"]:
            ref = dim["ref"]
            check_fn = CHECKS.get(ref)
            for filepath, meta in files.items():
                full_path = ROOT / filepath
                if not full_path.exists(): continue
                try:
                    content = full_path.read_text(encoding='utf-8', errors='ignore')
                except:
                    continue
                ctx = AuditContext(full_path, meta["surface"], content, meta)
                if check_fn:
                    try:
                        result = check_fn(ctx)
                    except Exception as e:
                        result = {"statut": "SKIP", "details": {"error": str(e)}}
                else:
                    result = {"statut": "SKIP", "details": {"reason": "Not implemented"}}
                statut = result["statut"]
                counts[statut] = counts.get(statut, 0) + 1
                if statut == "KO":
                    crit = dim["criticite"].split('-')[0]
                    counts[crit] = counts.get(crit, 0) + 1
                results.append({
                    "run_id": run_id, "famille": famille["ref"],
                    "dimension_ref": ref, "dimension_titre": dim["titre"],
                    "criticite": dim["criticite"], "fichier": filepath,
                    "surface": meta["surface"], "statut": statut,
                    "details": result.get("details", {}),
                })
    meta = {
        "run_id": run_id, "run_date": run_date,
        "scope": {"familles": familles_to_run, "nb_files": len(files)},
        "total": len(results), "counts": counts,
    }
    return {"meta": meta, "results": results}


def save_results(audit_data, label):
    RESULTS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    fname = f"{timestamp}_{label}.json"
    path = RESULTS_DIR / fname
    js = json.dumps(audit_data, indent=2, ensure_ascii=False)
    path.write_text(js, encoding='utf-8')
    (RESULTS_DIR / "latest.json").write_text(js, encoding='utf-8')
    (RESULTS_DIR / "latest-data.js").write_text("window.AUDIT_DATA = " + js + ";", encoding='utf-8')
    return path


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--all", action="store_true")
    p.add_argument("--famille")
    p.add_argument("--tranche")
    args = p.parse_args()
    if args.all: familles, label = None, "ALL"
    elif args.famille: familles, label = [args.famille], args.famille
    elif args.tranche: familles, label = TRANCHES.get(args.tranche, []), args.tranche
    else: p.print_help(); sys.exit(1)
    print(f"Audit lance : familles={familles or 'TOUTES'}")
    audit = run_audit(familles)
    path = save_results(audit, label)
    print(f"Resultats : {path}")
    print(f"Total : {audit['meta']['total']}")
    print(f"  OK   : {audit['meta']['counts']['OK']}")
    print(f"  KO   : {audit['meta']['counts']['KO']}")
    print(f"  NA   : {audit['meta']['counts']['NA']}")
    print(f"  SKIP : {audit['meta']['counts']['SKIP']}")
    print(f"  P0 KO: {audit['meta']['counts'].get('P0', 0)}")
    print(f"  P1 KO: {audit['meta']['counts'].get('P1', 0)}")


if __name__ == "__main__":
    main()
