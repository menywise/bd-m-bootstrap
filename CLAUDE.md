# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

**Bible de Bloc (BDB)** — Patient-centered surgical knowledge platform for operating room staff (Ortho-Neurochirurgie, Rooms 5-8). Every proposed change must answer: *"En quoi cela beneficie-t-il au patient ?"* (BLOC 0). If patient benefit is not obvious, flag it explicitly before proceeding.

**One application, one name.** The project is "Bible de Bloc" — no sub-naming (not APP_CDT, not PLANNING_ENGINE). Single entry point: `index.html`.

## Development Environment

**Active working directory:** `C:\DEV\BIBLE_DE_BLOC\` — never issue commands targeting Desktop, Downloads, or elsewhere.

**Start local dev server:**
```powershell
powershell -ExecutionPolicy Bypass -File start-bdb.ps1
# OR manually:
python -m http.server 5500
```
App runs at `http://localhost:5500`. No build step, no npm, no transpilation — pure static files.

**Supabase (local, disaster recovery only):**
```bash
supabase start   # starts local instance at http://127.0.0.1:54321
supabase db pull # sync cloud -> local
```
Local override via `js/config.js` (not versioned).

**Pre-deployment check:**
```powershell
powershell -ExecutionPolicy Bypass -File check-before-ftp.ps1
```

## Architecture

### Tech Stack
- **Frontend:** Vanilla JavaScript (ES6+ syntax: const/let, arrow functions, async/await, template literals — but NO ES6 modules, NO import/export, all scripts loaded via classic `<script>` tags)
- **CSS:** Bootstrap 5.3.2, Bootstrap Icons 1.11.1 (all CDN)
- **Design tokens:** `theme-base.css` + `theme-print.css` from CDN (`menywise/BDB @latest`)
- **Backend:** Supabase cloud (PostgreSQL + REST + Auth) at `https://ecpzrygzdugwwkqbsajn.supabase.co`
- **Deploy:** FTP to OVH (static files)
- **No build tools, no React, no Node runtime**

### Core Shared Files — PROTECTED (never modify without explicit approval)
| File | Role |
|------|------|
| `js/supabase-client.js` | Supabase singleton (`window.bdb`). Auth helpers: `bdbGetSession()`, `bdbRequireAuth()`, `bdbToast()`. **Only place credentials may exist.** |
| `js/bdb-shell.js` | Universal auth shell — session verification, nav injection, profile loading, auto-logout (30 min). Exposes `window.bdbUser` |
| `js/bdb-preview.js` | Admin preview mode (dynamically loaded, never import directly) |
| `css/cds-overrides.css` | Global CDS token overrides |

### Module Pattern
Every page loads scripts in this order (never change):
1. Bootstrap 5.3.2 CSS (CDN)
2. Bootstrap Icons CSS (CDN)
3. `theme-base.css` (CDN)
4. `theme-print.css` (CDN, media=print)
5. `css/cds-overrides.css` (local)
6. `css/[module]-ui.css` (local)
7. `@supabase/supabase-js` (CDN)
8. `js/supabase-client.js`
9. `js/bdb-shell.js`

`#bdb-shell` must be the **first child** of `<main>`. Module-specific JS follows.

### 25 Modules
Located in `modules/[module]/index.html`. Each has its own `css/[module]-ui.css`. Currently in **Phase 0** (shell migration + hardening). Status tracked in `SESSION_STATE.md` and `00_GOUVERNANCE/CTX/` files.

**Data persistence:**
- **Supabase (target):** All business data — transmissions, fiches, arsenal, admin, annuaire, etc.
- **localStorage (legacy, migration planned):** planning (Phase 2), disc, paxis, collab, organisateur, dork (Phase 1), thesaurus inline data (Phase 1)
- **sessionStorage (ephemeral):** `bdb_preview_role`, `bdb_shell_app_groups`, `bdb_shell_app_modules`

## Mandatory Rules (INTERDIT)

These are hard constraints from `00_GOUVERNANCE/02_CHANTIER_TECHNIQUE_V1_0_6.md`:

| Code | Rule |
|------|------|
| **INTERDIT-A1** | Supabase credentials ONLY in `js/supabase-client.js` |
| **INTERDIT-A3** | `window.bdb` is the unique Supabase client — never instantiate another |
| **INTERDIT-B1** | Auth + offcanvas + header ONLY in `bdb-shell.js` |
| **INTERDIT-B2** | `window.bdbUser` is sole user access — never direct SQL for user data |
| **INTERDIT-B3** | No local `initAuth()` in module files |
| **INTERDIT-C2** | No inline `style=` attributes — use CSS classes/CDS tokens |
| **INTERDIT-C6** | `escHtml()` is mandatory on all `innerHTML` that renders DB data |
| **INTERDIT-E1** | `#bdb-shell` must be FIRST CHILD of `<main>` |
| **INTERDIT-13** | All `docker exec psql` must include `-e PGCLIENTENCODING=UTF8` |
| **INTERDIT-17** | Bootstrap overrides must be scoped to parent container |
| **C.9** | All async DOM requires 3-state UI: loading / empty / error |

## Working Rules (Claude Code session)

| Rule | Detail |
|------|--------|
| **Rebuild from source** | Any TSX component from Lovable must be rebuilt as HTML/JS by reading existing source files FIRST — never reinvent without consulting them. |
| **SQL before execution** | All cloud SQL = write a `.sql` file FIRST, review, then execute. Never run raw SQL without a file. |
| **Complete files only** | Deliver full files, not excerpts. No `// ... rest unchanged`. One file = one deliverable. |
| **Post-production audit** | After every delivery, run grep to check for INTERDIT violations. |
| **ASCII-only for scripts** | Technical deliverables (.bat, .ps1, .md) = pure ASCII. No accents (use `e` not `e`), no emojis (use `[OK]` not checkmarks). |
| **Never invent schema** | Never guess a DB column or table — verify in `04_SUPABASE_DATA_MODEL_V1_6_0.md` first. |
| **Session end protocol** | Update impacted governance files. Propose JOURNAL_DECISIONS entries. Update BACKLOG_SESSIONS.md if planned session. |

## Active Migration: PocketBase

~90k surgical lines being migrated into PocketBase across three tables: INTERVENTIONS, PROTOCOLES, CHIRURGIENS. Data integrity and PRD documentation are critical. Be extremely vigilant about data persistence.

## Governance Documents (Authority Chain)

When in doubt, consult in this order:
1. `00_GOUVERNANCE/00_NOYAU_VERITE_V2_5_0.md` — Supreme source of truth
2. `00_GOUVERNANCE/01_JOURNAL_DECISIONS_V1_20_0.md` — Append-only decision log
3. `00_GOUVERNANCE/02_CHANTIER_TECHNIQUE_V1_0_6.md` — Technical rules
4. `00_GOUVERNANCE/05_CTX_SYSTEM_ARCHITECTURE_V2_2_0.md` — Architecture contract
5. `00_GOUVERNANCE/CTX/CTX_[MODULE].md` — Per-module contracts
6. Code itself (lowest authority)

**Session state:** Read `SESSION_STATE.md` first for current module compliance status and active violations.

**Decision log:** Any technical decision must be appended to `JOURNAL_DECISIONS_V1_20_0.md` (never amend past entries). Format: `DATE . MODULE . DECISION . MOTIF . SCOPE . HORS SCOPE . IMPACT . RESULTAT . STATUT`

## Key Data Model Notes

- User roles: `user_roles.role` (`admin` = full access)
- Approved users: `profiles_directory.approved`
- Navigation: `app_groups` + `app_modules` tables (dynamic menu)
- RLS policies active on: `glossaire`, `tag_links`, `transmissions`
- Canonical schema: `00_GOUVERNANCE/04_SUPABASE_DATA_MODEL_V1_6_0.md`

## Personas & UX

UI voice and content must be validated against 9 personas (P0-P8) defined in `00_GOUVERNANCE/08_PERSONAS_BDB_V1_3_0.md`. Key rule: every module entry must be accessible in under 3 seconds with no blocking vocabulary. Compensate for DC (Dominant-Conformist) author bias when writing UI text.

Avatars and pedagogical images are required UX elements, not optional.
