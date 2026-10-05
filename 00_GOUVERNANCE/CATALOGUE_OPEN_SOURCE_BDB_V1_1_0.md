# CATALOGUE OPEN SOURCE BDB

```
VERSION  : 1.1.0
DATE     : 2026-04-06
SESSION  : #28
REGLE    : Toute integration -> verifier licence + ajouter dans bdb_dependencies.
           Licences autorisees : MIT, Apache 2.0, BSD-2, BSD-3, ISC, CC0.
           Licences interdites : GPL, AGPL, LGPL, CC-NC, proprietaire.
STACK    : Vanilla JS + Bootstrap 5.3.2 + Supabase. CDN uniquement. Zero build.
           Compatibilite cible : Chrome, Firefox, Edge, Safari iOS/macOS (2 dernieres versions).
CHANGES  : v1.1.0 — Ajout Section 7 PWA/offline. Ajout patterns VirtualScroll
           et Favoris offline (Section 3). Ajout RecoMedicales dans Section 4.
           Ecart hallucinations Perplexity (OpenOR, APHP OpScheduler, Parly2).
           Actions 11-15 ajoutees.
```

---

# 1 — LIBRAIRIES JS (CDN, zero build, licences permissives)

## TIER S — Transforme l'experience produit

| Librairie | Licence | CDN | Taille | Fonction | Principe Manifeste |
|---|---|---|---|---|---|
| **Driver.js** | MIT | jsdelivr | 5KB | Tours guides, highlights, onboarding | 7.5 Auto-explicatif |
| **Fuse.js** | Apache 2.0 | jsdelivr | 11KB | Recherche fuzzy client-side + accents FR (NFD) | 7.1 Transverse absolu |
| **Papa Parse** | MIT | jsdelivr | 16KB | Parse CSV cote client | 7.4 Import recurrent L2 |

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
| **Grid.js** | MIT | jsdelivr | 12KB | Tables avancees (tri, filtre, pagination, export) | Tous modules avec tableaux |
| **SortableJS** | MIT | jsdelivr | 10KB | Drag & drop listes | Admin, Cours, Carnet de bord |
| **Tippy.js** | MIT | jsdelivr | 10KB | Tooltips avances, popovers | Glossaire inline, aide contextuelle |
| **Notyf** | MIT | jsdelivr | 3KB | Toasts notifications + queue JS | Transverse (feedback actions) |
| **Shepherd.js** | MIT | jsdelivr | 25KB | Tours guides avances (multi-etapes complexes) | Alternative Driver.js si besoin |

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

## TIER B — Enrichit les exports et la donnee

| Librairie | Licence | CDN | Taille | Fonction | Persona cible |
|---|---|---|---|---|---|
| **jsPDF** | MIT | jsdelivr | 80KB | Export PDF client | Sophie, Brigitte |
| **SheetJS CE** | Apache 2.0 | jsdelivr | 90KB | Export/import Excel | Brigitte, import OPTIM |
| **Chart.js** | MIT | jsdelivr | 65KB | Graphiques | Analytics, reporting Brigitte |
| **Marked** | MIT | jsdelivr | 7KB | Markdown -> HTML | Doc embarquee, guide admin |
| **DOMPurify** | Apache 2.0 | jsdelivr | 12KB | Sanitize HTML | Securite XSS (Quill) |

## TIER C — Composants specialises

| Librairie | Licence | CDN | Taille | Fonction | Module cible |
|---|---|---|---|---|---|
| **Quill** | BSD | jsdelivr | 43KB | Editeur rich text | Fiches, cours, transmissions |
| **Flatpickr** | MIT | jsdelivr | 16KB | Date picker avance | Planning, filtres dates |
| **text-diff** | Apache 2.0 | jsdelivr | 8KB | Diff visuel entre 2 textes | Cycle de vie protocole (avant/apres) |
| **vanilla-wizard** | MIT | unpkg | 12KB | Stepper multi-etapes | Assistant import, config M1 |
| **sunorhc.timeline** | MIT | jsdelivr | 20KB | Timeline/historique | Cycle de vie document, historique tickets |
| **html2canvas** | MIT | jsdelivr | 40KB | Screenshot DOM -> image | Export visuel fiches |
| **Cropper.js** | MIT | jsdelivr | 35KB | Crop/rotate images | Photos materiel, anatomie |
| **GuideChimp** | Apache 2.0 | jsdelivr | 15KB | Tours + beacons + plugins | Alternative Driver.js extensible |

---

# 2 — DONNEES DE REFERENCE OPEN DATA (Seed L1)

## Directement exploitables

| Source | Contenu | Format | Licence | URL | Impact BDB |
|---|---|---|---|---|---|
| **SMT / SNOMED CT FR** | Terminologie chirurgicale francaise (hierarchies anatomie/procedures) | RF2 (CSV) | Gratuit usage sante | https://smt.esante.gouv.fr | Seed L1 glossaire universel + anatomie |
| **Gist abulte CCAM** | CCAM parsee | CSV/JSON/SQL | Domaine public | https://gist.github.com/abulte/f8610025219340f57af6d4fda647dbd6 | Completer referentiel_ccam (1 970 -> ~8 000) |
| **FMA** | Ontologie anatomique (75 000 classes) | OWL/CSV | BSD | http://si.washington.edu/projects/fma/ | Seed L1 table bdb_anatomie universelle |
| **Health Data Hub** | NGAP, SNDS, donnees publiques sante FR | CSV divers | Open data FR | https://health-data-hub.fr | Referentiels complementaires |
| **CIM-10 FR** | Classification maladies/pathologies | XML/CSV | OMS libre | https://smt.esante.gouv.fr | Seed L1 table bdb_pathologies |

## A surveiller (pas encore exploitable)

| Source | Contenu | Statut | URL |
|---|---|---|---|
| **EUDAMED** | Base DM/DMI europeenne | API progressive, incomplet | https://ec.europa.eu/tools/eudamed |
| **ANSM LPP** | Dispositifs medicaux FR | PDF, pas parse | ansm.sante.fr |

---

# 3 — PATTERNS ARCHITECTURAUX SUPABASE

## Multi-tenant (trou #2 multi-specialite / multi-etablissement)

```sql
-- Colonne tenant sur chaque table L2
ALTER TABLE thesaurus_protocoles ADD COLUMN tenant_id uuid;

-- Policy isolation
CREATE POLICY tenant_isolation ON thesaurus_protocoles
  USING (tenant_id = (auth.jwt()->'app_metadata'->>'tenant_id')::uuid);
```

Source : tomaszezula.com (MIT). Basejump (usebasejump.com) pour le pattern complet.

## Soft-delete (principe 7.3 masquer != detruire)

```sql
-- Colonne universelle
ALTER TABLE [table] ADD COLUMN deleted_at timestamptz;

-- Policy : les lignes supprimees sont invisibles
CREATE POLICY hide_deleted ON [table]
  USING (deleted_at IS NULL);

-- Admin voit tout (y compris masques)
CREATE POLICY admin_see_all ON [table]
  FOR SELECT USING (is_admin());
```

Pattern a appliquer transversalement (principe 7.1).

## Virtual scroll (listes 500-8 000 items, Safari-safe)

**Arbitrage** : pattern interne vanilla JS (pas de lib externe = pas d'entree
bdb_dependencies). Base CoreUI RAF + binary search offsets, adapte stack BDB.

```javascript
// Integrer dans js/bdb-virtual-scroll.js (composant partage)
// Source : pattern CoreUI virtual scroll (MIT, architecture etudiee)
// Adapte BDB : vanilla JS, Bootstrap 5.3.2, Safari iOS compatible

class BdbVirtualScroll {
  constructor(container, items, rowHeight = 56) {
    this.container = container;
    this.items     = items;
    this.rowHeight = rowHeight;
    this.visibleCount = Math.ceil(container.clientHeight / rowHeight) + 2;
    this._init();
  }

  _init() {
    this.scroller = document.createElement('div');
    this.scroller.style.height = (this.items.length * this.rowHeight) + 'px';
    this.container.appendChild(this.scroller);
    this.container.addEventListener('scroll', () => this._render());
    this._render();
  }

  _render() {
    const scrollTop  = this.container.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - 1);
    const endIndex   = Math.min(this.items.length, startIndex + this.visibleCount);
    const fragment   = document.createDocumentFragment();

    for (let i = startIndex; i < endIndex; i++) {
      const row = this._renderRow(this.items[i], i);
      row.style.position  = 'absolute';
      row.style.top       = (i * this.rowHeight) + 'px';
      row.style.width     = '100%';
      fragment.appendChild(row);
    }

    // Nettoyer et remplacer (RAF pour Safari)
    requestAnimationFrame(() => {
      this.scroller.innerHTML = '';
      this.scroller.appendChild(fragment);
    });
  }

  // Override dans le module hote
  _renderRow(item, index) {
    const div = document.createElement('div');
    div.className = 'bdb-vs-row';
    div.textContent = item.label || item;
    return div;
  }

  // Mise a jour donnees (ex : apres filtre Fuse.js)
  update(newItems) {
    this.items = newItems;
    this.scroller.style.height = (newItems.length * this.rowHeight) + 'px';
    this.container.scrollTop   = 0;
    this._render();
  }
}
```

**Points d'integration CDS** :
- [ ] escHtml() sur toute donnee DB dans _renderRow()
- [ ] Coupler avec Fuse.js : virtualScroll.update(fusejsResults)
- [ ] rowHeight a definir par module (56px standard, 80px si multiline)
- [ ] container doit avoir height fixe + overflow-y: auto
- [ ] Pas de conflit Bootstrap : positionnement absolu isole dans scroller

**Compatibilite** : requestAnimationFrame = support universel Chrome/Firefox/Edge/Safari iOS 7+.

## Favoris offline (localStorage -> Supabase sync)

**Arbitrage** : localStorage pour reactivite immediate (< 50 items, quota iOS ~5MB
largement suffisant). Sync Supabase au focus/reconnexion. Pas IndexedDB (overhead
inutile pour ce volume, API plus complexe, memes limites navigation privee Safari).

```javascript
// Pattern favoris - js/bdb-favoris.js (composant partage)
const BdbFavoris = {
  KEY: 'bdb_favoris_v1',

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },

  save(items) {
    try { localStorage.setItem(this.KEY, JSON.stringify(items)); }
    catch (e) { console.warn('BdbFavoris: quota depasse', e); }
  },

  toggle(id, label) {
    const items = this.load();
    const idx   = items.findIndex(f => f.id === id);
    if (idx >= 0) { items.splice(idx, 1); }
    else          { items.push({ id, label, ts: Date.now() }); }
    this.save(items);
    return idx < 0; // true = ajoute
  },

  // Sync vers Supabase (appeler au focus + reconnexion)
  async syncToCloud(supabaseClient, userId) {
    const local = this.load();
    if (!local.length) return;
    const { error } = await supabaseClient
      .from('user_favoris')
      .upsert(local.map(f => ({ ...f, user_id: userId })),
              { onConflict: 'id,user_id' });
    if (error) console.warn('BdbFavoris sync error', error);
  }
};

// Declenchement sync
window.addEventListener('focus', () => {
  if (window.bdbUser) BdbFavoris.syncToCloud(supabase, window.bdbUser.id);
});
```

**Prerequis schema** : table `user_favoris (id, user_id, label, ts)` a creer via
migration numerotee avant integration (voir skill sql-migration-bdb).

## Install unique (pas de migrations incrementales)

```bash
# Generer un install.sql depuis l'etat courant
pg_dump --schema-only --no-owner --no-acl \
  -f install_schema.sql $SUPABASE_DB_URL

pg_dump --data-only --table=referentiel_ccam --table=app_modules \
  --table=app_groups --table=fonctions_metier \
  -f install_seed_l1.sql $SUPABASE_DB_URL
```

Le jour de la vente : `install_schema.sql` + `install_seed_l1.sql` = installation complete.

---

# 4 — PROJETS A ETUDIER (inspiration architecture)

| Projet | Ce qu'on en tire | Licence | URL |
|---|---|---|---|
| **Outline** (wiki) | Structure pages/collections, permissions, recherche | BSL -> Apache 2.0 | github.com/outline/outline |
| **Basejump** (Supabase multi-tenant) | Pattern teams/invitations/RLS par account | MIT | usebasejump.com |
| **OHDSI KnowledgeBase** | Patterns thesaurus medical, vocabulaire standardise | Apache 2.0 | github.com/OHDSI/KnowledgeBase |
| **Volt Dashboard** | Admin panel Bootstrap 5 vanilla JS | MIT | github.com/themesberg/volt-bootstrap-5-dashboard |
| **AdminLTE 4** | Composants admin Bootstrap 5 | MIT | github.com/ColorlibHQ/AdminLTE |
| **RecoMedicales** (djibe) | Structure fiches validees experts, CIM-10/SNOMED | MIT | github.com/djibe/recommandations-web |
| **OpenClinic** (jact) | Architecture dossiers medicaux/chirurgie | GPL-2.0 (code non copiable, architecture etudiable) | github.com/jact/openclinic |
| **WordPress** (concept) | Hooks/actions, install wizard, plugin architecture | GPL (architecture etudiable uniquement) | wordpress.org |

**Note OpenClinic** : GPL-2.0 = code non copiable dans BDB. Valeur = etude de
l'architecture de gestion des protocoles de base, pas plus.

---

# 5 — HALLUCINATIONS ECARTEES (log anti-regression)

Ces references ont ete proposees par Perplexity et ecartees apres verification :

| Reference | Statut | Source presumee |
|---|---|---|
| APHP OpScheduler | Introuvable — n'existe pas sous ce nom | Hallucination Perplexity |
| Hopital Prive de Parly2 custom bloc ortho app | Introuvable — aucune app publique documentee | Hallucination Perplexity |
| Clinique du Sport Paris neurochirurgie protocols app | Introuvable | Hallucination Perplexity |
| OpenOR GitHub checklists chirurgicaux | Introuvable — repo inexistant | Hallucination Perplexity |
| SurgicalChecklist MIT iOS/Android | Introuvable — pas de repo verifiable | Hallucination Perplexity |

**Regle** : toute reference open-source doit avoir une URL GitHub verifiable
avec au moins 10 stars et un commit < 3 ans avant integration dans ce catalogue.

---

# 6 — TABLE bdb_dependencies (migration proposee)

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

Seed initial (librairies deja en place) :

```sql
INSERT INTO bdb_dependencies (name, version, licence, cdn_url, usage_desc, couche) VALUES
  ('Bootstrap', '5.3.2', 'MIT', 'cdn.jsdelivr.net/npm/bootstrap@5.3.2', 'Framework CSS', 1),
  ('Bootstrap Icons', '1.11.1', 'MIT', 'cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1', 'Icones', 1),
  ('Supabase JS', '2.x', 'MIT', 'cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'Client DB', 1),
  ('Quill', '1.3.7', 'BSD-3', 'cdn.jsdelivr.net/npm/quill@1.3.7', 'Editeur rich text', 1),
  ('Chart.js', '4.x', 'MIT', 'cdn.jsdelivr.net/npm/chart.js', 'Graphiques analytics', 1),
  ('DOMPurify', '3.0.6', 'Apache-2.0', 'cdn.jsdelivr.net/npm/dompurify@3.0.6', 'Sanitize HTML XSS', 1),
  ('Fuse.js', 'latest', 'Apache-2.0', 'cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js', 'Recherche fuzzy FR', 1),
  ('Notyf', 'latest', 'MIT', 'cdn.jsdelivr.net/npm/notyf/notyf.min.js', 'Toasts notifications', 1)
ON CONFLICT DO NOTHING;
```

---

# 7 — PWA / OFFLINE (pattern minimal, Safari iOS compatible)

## Arbitrages

| Question | Decision | Raison |
|---|---|---|
| Workbox vs SW manuel ? | SW manuel | Zero build, FTP statique, Workbox necessite npm |
| Push notifications ? | Hors scope v1 | Non supporte Safari iOS < 16.4, hors perimetre IBODE |
| Background Sync ? | Hors scope v1 | Support Safari iOS partiel et instable (2026) |
| IndexedDB vs localStorage ? | localStorage pour favoris (< 50 items) | Quota suffisant, API simple, sync Supabase au focus |
| Cache donnees Supabase ? | sessionStorage (session unique) | Pas de persistence inter-sessions souhaitee v1 |
| PWA installable ? | Oui — Web App Manifest minimal | "Ajouter a l'ecran" iOS/Android, zero contrainte |

## Web App Manifest (manifest.json)

```json
{
  "name": "BDB - Bible de Bloc",
  "short_name": "BDB",
  "description": "Protocoles chirurgicaux IBODE - Bloc ortho-neurochirurgie",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d6efd",
  "orientation": "any",
  "icons": [
    { "src": "/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Contraintes Apple specifiques** :
- Safari iOS exige `apple-touch-icon` dans le `<head>` en complement du manifest
- Pas de push notifications via manifest sur iOS (limitation Apple)
- `display: standalone` fonctionne iOS 11.3+ (Safari WebKit)
- Icones requises minimum : 192x192 + 512x512 PNG (pas SVG pour iOS)

```html
<!-- A ajouter dans le <head> de index.html -->
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="BDB">
<meta name="theme-color" content="#0d6efd">
```

## Service Worker minimal (cache-first assets, network-first Supabase)

```javascript
// sw.js — a la racine du projet (meme niveau que index.html)
// Pattern : cache-first pour assets statiques, network-first pour API

const CACHE_NAME = 'bdb-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/cds-overrides.css',
  '/js/bdb-shell.js',
  '/js/supabase-client.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js',
  'https://cdn.jsdelivr.net/npm/notyf/notyf.min.js',
  'https://cdn.jsdelivr.net/npm/notyf/notyf.min.css'
];

// Installation : pre-cache assets statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyer les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : strategie selon l'URL
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase et assets CDN externes -> network-first
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('jsdelivr.net')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets locaux -> cache-first
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return response;
        })
      )
  );
});
```

**Enregistrement dans index.html** :

```javascript
// A ajouter dans le <script> de fin de index.html
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.warn('SW non enregistre:', err));
  });
}
```

## Etapes de developpement PWA

| Etape | Action | Dependances | Effort |
|---|---|---|---|
| **1** | Creer les icones PNG (192, 180, 512) | Aucune | 30 min |
| **2** | Creer manifest.json et l'integrer dans index.html | Etape 1 | 15 min |
| **3** | Creer sw.js avec la liste STATIC_ASSETS finale | Arborescence stabilisee | 1h |
| **4** | Enregistrer le SW dans index.html | Etape 3 | 10 min |
| **5** | Tester "Ajouter a l'ecran" Safari iOS + Chrome Android | Etapes 1-4 | 30 min |
| **6** | Creer table user_favoris + migration SQL | skill sql-migration-bdb | 1h |
| **7** | Integrer BdbFavoris (Section 3) dans modules cibles | Etape 6 | 2h |
| **8** | Integrer BdbVirtualScroll dans module Thesaurus | skill bdb-shared-component | 3h |
| **9** | Tester Lighthouse mobile (cible 90+) | Etapes 1-8 | 1h |
| **10** | Mettre a jour STATIC_ASSETS a chaque nouveau module | Etape 3 | Continu |

**Prerequis bloquant etape 3** : arborescence des modules stabilisee.
Ne pas creer sw.js avant d'avoir la liste definitive des fichiers locaux.

---

# 8 — ACTIONS PRIORITAIRES (mis a jour v1.1.0)

| # | Action | Input | Output | Effort | Statut |
|---|---|---|---|---|---|
| **1** | Politique licences + table `bdb_dependencies` | Ce document | Migration SQL + convention | 30 min | A faire |
| **2** | Integrer Fuse.js transverse | Fuse.js CDN | Composant recherche dans bdb-shell | 2-3h | A faire |
| **3** | Integrer Driver.js onboarding | Driver.js CDN | Tours admin + user + novice | 3-5h | A faire |
| **4** | Assistant import CSV | Papa Parse + vanilla-wizard + Grid.js | Module import L2 dans admin | 5-8h | A faire |
| **5** | Etude architecture Basejump + Outline | Code source repos | Note architecture multi-tenant + wiki | 2h | A faire |
| **6** | Telecharger CCAM gist abulte | CSV/JSON | UPDATE referentiel_ccam (1 970 -> ~8 000) | 1-2h | A faire |
| **7** | Explorer SMT / SNOMED CT FR | RF2 dumps | Seed L1 glossaire + anatomie universels | 3-5h | A faire |
| **8** | Implementer soft-delete transverse | Pattern SQL | ALTER TABLE + policies sur toutes les tables L2 | 2-3h | A faire |
| **9** | Integrer text-diff | text-diff CDN | Comparaison versions protocole/fiche | 1-2h | A faire |
| **10** | Generer install.sql depuis etat courant | pg_dump | Script installation instance vierge | 1h | A faire |
| **11** | Creer icones PWA (192/180/512 PNG) | Logo BDB | assets/icons/ | 30 min | A faire |
| **12** | Creer manifest.json + integration index.html | Action 11 | PWA installable iOS/Android | 30 min | Apres 11 |
| **13** | Creer sw.js (cache-first/network-first) | Arbo stabilisee | Offline assets statiques | 1h | Apres 12 |
| **14** | Migration SQL table user_favoris | skill sql-migration-bdb | Schema favoris persistants | 1h | A faire |
| **15** | Composant BdbVirtualScroll | Pattern Section 3 | js/bdb-virtual-scroll.js | 2h | Apres arbo stable |

---

# HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-02 | 1.0.0 | Creation. Session #27. Catalogue initial : 20 librairies, 5 data sources, 4 patterns Supabase, 10 actions. |
| 2026-04-06 | 1.1.0 | Session #28. Ajout Section 5 (hallucinations ecartees), Section 7 (PWA/offline complet), patterns VirtualScroll et Favoris offline (Section 3), RecoMedicales + OpenClinic (Section 4). Actions 11-15 ajoutees. Fuse.js et Notyf ajoutes au seed bdb_dependencies. |
