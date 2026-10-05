# CATALOGUE OPEN SOURCE BDB

```
VERSION  : 1.0.0
DATE     : 2026-04-02
SESSION  : #27
RÈGLE    : Toute intégration → vérifier licence + ajouter dans bdb_dependencies.
           Licences autorisées : MIT, Apache 2.0, BSD-2, BSD-3, ISC, CC0.
           Licences interdites : GPL, AGPL, LGPL, CC-NC, propriétaire.
STACK    : Vanilla JS + Bootstrap 5.3.2 + Supabase. CDN uniquement. Zéro build.
```

---

# 1 — LIBRAIRIES JS (CDN, zéro build, licences permissives)

## TIER S — Transforme l'expérience produit

| Librairie | Licence | CDN | Taille | Fonction | Principe Manifeste |
|---|---|---|---|---|---|
| **Driver.js** | MIT | jsdelivr | 5KB | Tours guidés, highlights, onboarding | 7.5 Auto-explicatif |
| **Fuse.js** | Apache 2.0 | jsdelivr | 9KB | Recherche fuzzy client-side | 7.1 Transverse absolu |
| **Papa Parse** | MIT | jsdelivr | 16KB | Parse CSV côté client | 7.4 Import récurrent L2 |

URLs CDN :
```
https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js
https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css
https://cdn.jsdelivr.net/npm/fuse.js@latest/dist/fuse.min.js
https://cdn.jsdelivr.net/npm/papaparse@latest/papaparse.min.js
```

## TIER A — Professionnalise l'interface

| Librairie | Licence | CDN | Taille | Fonction | Module(s) cible |
|---|---|---|---|---|---|
| **Grid.js** | MIT | jsdelivr | 12KB | Tables avancées (tri, filtre, pagination, export) | Tous modules avec tableaux |
| **SortableJS** | MIT | jsdelivr | 10KB | Drag & drop listes | Admin, Cours, Carnet de bord |
| **Tippy.js** | MIT | jsdelivr | 10KB | Tooltips avancés, popovers | Glossaire inline, aide contextuelle |
| **Notyf** | MIT | jsdelivr | 3KB | Toasts notifications | Transverse (feedback actions) |
| **Shepherd.js** | MIT | jsdelivr | 25KB | Tours guidés avancés (multi-étapes complexes) | Alternative Driver.js si besoin |

URLs CDN :
```
https://cdn.jsdelivr.net/npm/gridjs@latest/dist/gridjs.umd.js
https://cdn.jsdelivr.net/npm/gridjs@latest/dist/theme/mermaid.min.css
https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js
https://cdn.jsdelivr.net/npm/tippy.js@latest/dist/tippy-bundle.umd.min.js
https://cdn.jsdelivr.net/npm/notyf@latest/notyf.min.js
https://cdn.jsdelivr.net/npm/notyf@latest/notyf.min.css
https://cdn.jsdelivr.net/npm/shepherd.js@latest/dist/js/shepherd.min.js
https://cdn.jsdelivr.net/npm/shepherd.js@latest/dist/css/shepherd.css
```

## TIER B — Enrichit les exports et la donnée

| Librairie | Licence | CDN | Taille | Fonction | Persona cible |
|---|---|---|---|---|---|
| **jsPDF** | MIT | jsdelivr | 80KB | Export PDF client | Sophie, Brigitte |
| **SheetJS CE** | Apache 2.0 | jsdelivr | 90KB | Export/import Excel | Brigitte, import OPTIM |
| **Chart.js** | MIT | jsdelivr | 65KB | Graphiques | Analytics, reporting Brigitte |
| **Marked** | MIT | jsdelivr | 7KB | Markdown → HTML | Doc embarquée, guide admin |
| **DOMPurify** | Apache 2.0 | jsdelivr | 12KB | Sanitize HTML | Sécurité XSS (Quill) |

## TIER C — Composants spécialisés

| Librairie | Licence | CDN | Taille | Fonction | Module cible |
|---|---|---|---|---|---|
| **Quill** | BSD | jsdelivr | 43KB | Éditeur rich text | Fiches, cours, transmissions |
| **Flatpickr** | MIT | jsdelivr | 16KB | Date picker avancé | Planning, filtres dates |
| **text-diff** | Apache 2.0 | jsdelivr | 8KB | Diff visuel entre 2 textes | Cycle de vie protocole (avant/après) |
| **vanilla-wizard** | MIT | unpkg | 12KB | Stepper multi-étapes | Assistant import, config M1 |
| **sunorhc.timeline** | MIT | jsdelivr | 20KB | Timeline/historique | Cycle de vie document, historique tickets |
| **html2canvas** | MIT | jsdelivr | 40KB | Screenshot DOM → image | Export visuel fiches |
| **Cropper.js** | MIT | jsdelivr | 35KB | Crop/rotate images | Photos matériel, anatomie |
| **GuideChimp** | Apache 2.0 | jsdelivr | 15KB | Tours + beacons + plugins | Alternative Driver.js extensible |

---

# 2 — DONNÉES DE RÉFÉRENCE OPEN DATA (Seed L1)

## Directement exploitables

| Source | Contenu | Format | Licence | URL | Impact BDB |
|---|---|---|---|---|---|
| **SMT / SNOMED CT FR** | Terminologie chirurgicale française (hiérarchies anatomie/procédures) | RF2 (CSV) | Gratuit usage santé | https://smt.esante.gouv.fr | Seed L1 glossaire universel + anatomie |
| **Gist abulte CCAM** | CCAM parsée | CSV/JSON/SQL | Domaine public | https://gist.github.com/abulte/f8610025219340f57af6d4fda647dbd6 | Compléter referentiel_ccam (1 970 → ~8 000) |
| **FMA** | Ontologie anatomique (75 000 classes) | OWL/CSV | BSD | http://si.washington.edu/projects/fma/ | Seed L1 table bdb_anatomie universelle |
| **Health Data Hub** | NGAP, SNDS, données publiques santé FR | CSV divers | Open data FR | https://health-data-hub.fr | Référentiels complémentaires |
| **CIM-10 FR** | Classification maladies/pathologies | XML/CSV | OMS libre | https://smt.esante.gouv.fr | Seed L1 table bdb_pathologies |

## À surveiller (pas encore exploitable)

| Source | Contenu | Statut | URL |
|---|---|---|---|
| **EUDAMED** | Base DM/DMI européenne | API progressive, incomplet | https://ec.europa.eu/tools/eudamed |
| **ANSM LPP** | Dispositifs médicaux FR | PDF, pas parsé | ansm.sante.fr |

---

# 3 — PATTERNS ARCHITECTURAUX SUPABASE

## Multi-tenant (trou #2 multi-spécialité / multi-établissement)

```sql
-- Colonne tenant sur chaque table L2
ALTER TABLE thesaurus_protocoles ADD COLUMN tenant_id uuid;

-- Policy isolation
CREATE POLICY tenant_isolation ON thesaurus_protocoles
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);
```

Source : tomaszezula.com (MIT). Basejump (usebasejump.com) pour le pattern complet.

## Soft-delete (principe 7.3 masquer ≠ détruire)

```sql
-- Colonne universelle
ALTER TABLE [table] ADD COLUMN deleted_at timestamptz;

-- Policy : les lignes supprimées sont invisibles
CREATE POLICY hide_deleted ON [table]
  USING (deleted_at IS NULL);

-- Admin voit tout (y compris masqués)
CREATE POLICY admin_see_all ON [table]
  FOR SELECT USING (is_admin());
```

Pattern à appliquer transversalement (principe 7.1).

## Install unique (pas de migrations incrémentales)

```bash
# Générer un install.sql depuis l'état courant
pg_dump --schema-only --no-owner --no-acl \
  -f install_schema.sql $SUPABASE_DB_URL

pg_dump --data-only --table=referentiel_ccam --table=app_modules \
  --table=app_groups --table=fonctions_metier \
  -f install_seed_l1.sql $SUPABASE_DB_URL
```

Le jour de la vente : `install_schema.sql` + `install_seed_l1.sql` = installation complète.

---

# 4 — PROJETS À ÉTUDIER (inspiration architecture)

| Projet | Ce qu'on en tire | Licence | URL |
|---|---|---|---|
| **Outline** (wiki) | Structure pages/collections, permissions, recherche | BSL → Apache 2.0 | github.com/outline/outline |
| **Basejump** (Supabase multi-tenant) | Pattern teams/invitations/RLS par account | MIT | usebasejump.com |
| **OHDSI KnowledgeBase** | Patterns thesaurus médical, vocabulaire standardisé | Apache 2.0 | github.com/OHDSI/KnowledgeBase |
| **Volt Dashboard** | Admin panel Bootstrap 5 vanilla JS | MIT | github.com/themesberg/volt-bootstrap-5-dashboard |
| **AdminLTE 4** | Composants admin Bootstrap 5 | MIT | github.com/ColorlibHQ/AdminLTE |
| **WordPress** (concept) | Hooks/actions, install wizard, Hello World seed, plugin architecture | GPL (code non copiable, architecture étudiable) | wordpress.org |

---

# 5 — ACTIONS PRIORITAIRES

| # | Action | Input | Output | Effort |
|---|---|---|---|---|
| **1** | Politique licences + table `bdb_dependencies` | Ce document | Migration SQL + convention | 30 min |
| **2** | Intégrer Fuse.js transverse | Fuse.js CDN | Composant recherche dans bdb-shell | 2-3h |
| **3** | Intégrer Driver.js onboarding | Driver.js CDN | Tours admin + user + novice | 3-5h |
| **4** | Assistant import CSV | Papa Parse + vanilla-wizard + Grid.js | Module import L2 dans admin | 5-8h |
| **5** | Étude architecture Basejump + Outline | Code source repos | Note d'architecture multi-tenant + wiki | 2h |
| **6** | Télécharger CCAM gist abulte | CSV/JSON | UPDATE referentiel_ccam (1 970 → ~8 000) | 1-2h |
| **7** | Explorer SMT / SNOMED CT FR | RF2 dumps | Seed L1 glossaire + anatomie universels | 3-5h |
| **8** | Implémenter soft-delete transverse | Pattern SQL | ALTER TABLE + policies sur toutes les tables L2 | 2-3h |
| **9** | Intégrer text-diff | text-diff CDN | Comparaison versions protocole/fiche | 1-2h |
| **10** | Générer install.sql depuis état courant | pg_dump | Script installation instance vierge | 1h |

---

# 6 — TABLE bdb_dependencies (migration proposée)

```sql
CREATE TABLE IF NOT EXISTS bdb_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  licence text NOT NULL
    CHECK (licence IN ('MIT', 'Apache-2.0', 'BSD-2', 'BSD-3', 'ISC', 'CC0')),
  cdn_url text NOT NULL,
  usage_desc text NOT NULL,
  couche smallint NOT NULL DEFAULT 1 CHECK (couche IN (1, 2, 3)),
  added_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

Seed initial (librairies déjà en place) :

```sql
INSERT INTO bdb_dependencies (name, version, licence, cdn_url, usage_desc, couche) VALUES
  ('Bootstrap', '5.3.2', 'MIT', 'cdn.jsdelivr.net/npm/bootstrap@5.3.2', 'Framework CSS', 1),
  ('Bootstrap Icons', '1.11.1', 'MIT', 'cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1', 'Icônes', 1),
  ('Supabase JS', '2.x', 'MIT', 'cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'Client DB', 1),
  ('Quill', '1.3.7', 'BSD-3', 'cdn.jsdelivr.net/npm/quill@1.3.7', 'Éditeur rich text', 1),
  ('Chart.js', '4.x', 'MIT', 'cdn.jsdelivr.net/npm/chart.js', 'Graphiques analytics', 1),
  ('DOMPurify', '3.0.6', 'Apache-2.0', 'cdn.jsdelivr.net/npm/dompurify@3.0.6', 'Sanitize HTML XSS', 1)
ON CONFLICT DO NOTHING;
```

---

# HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-02 | 1.0.0 | Création. Session #27. Catalogue initial : 20 librairies, 5 data sources, 4 patterns Supabase, 10 actions. |
