import csv, json, re

INPUT  = r'C:\DEV\BIBLE_DE_BLOC\02_INFRASTRUCTURE\SUPABASE\fiches_intervention_export.csv'
OUTPUT = r'C:\DEV\BIBLE_DE_BLOC\02_INFRASTRUCTURE\SUPABASE\fiches_intervention_insert.sql'

# UUID Lovable → UUID local cloud (même substitution que transmissions)
OLD_USER = 'b7a60787-9848-4e77-9ca2-d05f02c29d0b'
NEW_USER = 'e2cc531f-8629-4053-8de0-9c27e8c8ea90'

def fix_encoding(s):
    """Répare le double-encodage UTF-8 Windows."""
    try:
        return s.encode('latin-1').decode('utf-8')
    except Exception:
        return s

def pg_escape(s):
    """Échappe pour SQL dollar-quoting — on utilise E'' avec échappement."""
    if s is None or s == '':
        return 'NULL'
    s = fix_encoding(s)
    s = s.replace("'", "''")
    return f"'{s}'"

def pg_uuid(s):
    if not s or s.strip() == '':
        return 'NULL'
    s = s.strip()
    if s == OLD_USER:
        s = NEW_USER
    return f"'{s}'"

def pg_bool(s):
    return 'TRUE' if s.strip().lower() in ('t','true','1') else 'FALSE'

def pg_array(s):
    """Convertit {tag1,tag2} en SQL array literal."""
    if not s or s.strip() in ('', '{}'):
        return "'{}'::text[]"
    s = fix_encoding(s)
    return f"'{s}'::text[]"

def pg_jsonb(s):
    if not s or s.strip() == '':
        return 'NULL'
    s = fix_encoding(s)
    s = s.replace("'", "''")
    return f"'{s}'::jsonb"

def pg_int(s):
    if not s or s.strip() == '':
        return 'NULL'
    return s.strip()

rows = []
with open(INPUT, 'r', encoding='utf-8-sig', errors='replace') as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

lines = []
lines.append('-- fiches_intervention : import cloud')
lines.append('-- Généré par fix_fiches_export.py')
lines.append('-- user_id Lovable → e2cc531f (user local cloud)')
lines.append('')
lines.append('INSERT INTO fiches_intervention')
lines.append('  (id, user_id, category_id, titre, description, etapes, duree_estimee, tags, status, created_at, updated_at, last_modified_by, is_dev)')
lines.append('VALUES')

vals = []
for r in rows:
    v = (
        f"  ({pg_uuid(r['id'])}, "
        f"{pg_uuid(r['user_id'])}, "
        f"{pg_uuid(r['category_id'])}, "
        f"{pg_escape(r['titre'])}, "
        f"{pg_escape(r['description'])}, "
        f"{pg_jsonb(r['etapes'])}, "
        f"{pg_int(r['duree_estimee'])}, "
        f"{pg_array(r['tags'])}, "
        f"{pg_escape(r['status'])}, "
        f"{pg_escape(r['created_at'])}, "
        f"{pg_escape(r['updated_at'])}, "
        f"{pg_uuid(r['last_modified_by'])}, "
        f"{pg_bool(r['is_dev'])})"
    )
    vals.append(v)

lines.append(',\n'.join(vals) + ';')
lines.append('')
lines.append('-- Vérification')
lines.append('SELECT COUNT(*) FROM fiches_intervention;')

sql = '\n'.join(lines)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"OK — {len(rows)} lignes générées")
print(f"Fichier : {OUTPUT}")
