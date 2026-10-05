# CTX_GLOSSAIRE — Cerveau linguistique BDB

```
VERSION     : 2.0.0
DATE        : 2026-03-31
AUTEUR      : Manu + Claude
STATUT      : VALIDÉ — prêt pour session Claude Code
PORTÉE      : Module glossaire (référentiel + découverte + tooltips cross-module)
DÉPENDANCES : bdb-glossaire-tooltip.js (chargé par bdb-shell sur toutes les pages)
DELTA       : V1.0.0 → V2.0.0
              Refonte complète. V1 = CRUD basique.
              V2 = moteur d'intelligence lexicale (découverte + propagation + tooltips).
              3 colonnes ajoutées à glossaire (variantes, categorie, is_propagated).
              3 RPC serveur (scan_notes, match_notes, propagate).
              Tooltip cross-module via JS partagé.
              Seed initial ~25 entrées (conventions + terrain).
```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente — y compris CTX_GLOSSAIRE_V1_0_0.

---

## BLOC 1 — LES 5 CHAMPS OBLIGATOIRES

```
ROLE        :
  Moteur d'intelligence lexicale chirurgicale de BDB.
  Triple fonction :
  1. Dictionnaire — définitions des abréviations, éponymes, termes métier
  2. Découverte — scan des 62 733 notes exploitables pour détecter termes orphelins
  3. Propagation — enrichit synonymes_recherche des protocoles thésaurus

PORTEE      :
  Tout terme chirurgical utilisé au bloc Ortho-Neurochirurgie de Chenieux.
  Abréviations (PTH, LCA, DIDT), éponymes (Matti-Russe, Weil, Latarjet),
  matériel spécifique (IGLOO, SFAX), pathologies (ressaut, botryomycome),
  codes anatomiques (L4L5, MTP, IPP), conventions bloc (AMBU, +/-).
  Hors périmètre : terminologie anesthésie pure, termes administratifs OPTIM.

AUTORISE    :
  Modifier modules/glossaire/index.html, glossaire-app.js, glossaire-ui.css.
  Créer js/bdb-glossaire-tooltip.js (JS partagé chargé par bdb-shell).
  Exécuter les RPC glossaire.
  Modifier synonymes_recherche via RPC glossaire_propagate (APPEND only).

INTERDIT    :
  - Toucher à bdb-shell.js, supabase-client.js, cds-overrides.css
  - Dupliquer le bloc auth (géré par bdb-shell.js)
  - Faire une requête profiles_directory ou user_roles
  - Écraser synonymes_recherche (APPEND only, jamais replace)
  - Supprimer une entrée glossaire référencée dans synonymes_recherche (GL-01)
  - Permettre aux membres de modifier les entrées validées (GL-02)
  - Créer des entrées glossaire sans vérification humaine (GL-03)
```

---

## BLOC 2 — ÉTAT COURANT

```
DERNIÈRE SESSION : 2026-03-31 (brainstorm architecture V2)
FAIT             : Audit terrain notes (62 733 exploitables, 8 mots moyens).
                   Découverte IGLOO (1339 occ.) et SFAX (1008 occ.).
                   Seed V0 constitué (~25 entrées).
                   Architecture 3 couches validée.
                   Migrations 076a/076b/076c prêtes.
RESTE À FAIRE    : Claude Code : HTML + JS + CSS module.
                   Claude Code : bdb-glossaire-tooltip.js.
                   Exécution migrations 076a→076c (SQL Editor).
                   app_modules status → active.
                   Scan notes premier run → enrichissement seed.
VIOLATIONS       : Aucune (module neuf).
```

---

## BLOC 3 — TABLES SUPABASE

### glossaire (existante + 3 colonnes ajoutées migration 076a)

```
id              uuid PK DEFAULT gen_random_uuid()
abbreviation    text NOT NULL UNIQUE              -- terme principal (FESF, IGLOO, Matti-Russe)
definition      text NOT NULL DEFAULT ''           -- définition complète
usage_notes     text DEFAULT ''                    -- contexte d'usage, préparation IBODE
created_by      uuid FK → auth.users
created_at      timestamptz NOT NULL DEFAULT now()
updated_at      timestamptz NOT NULL DEFAULT now()
--- AJOUTÉES V2 (migration 076a) ---
variantes       text NOT NULL DEFAULT ''           -- pipe-separated : botryo|botriomycome|botryomycose
categorie       text NOT NULL DEFAULT ''           -- ABREVIATION|EPONYME|PATHOLOGIE|MATERIEL|TECHNIQUE|ANATOMIE|CONVENTION
is_propagated   boolean NOT NULL DEFAULT false     -- synonymes_recherche déjà mis à jour ?
```

RLS : anon SELECT · authenticated SELECT · admin ALL (bdb_is_admin())
UNIQUE constraint sur `abbreviation` (ajouté 076a si absent).

### glossaire_suggestions (existante, inchangée)

```
id             uuid PK DEFAULT gen_random_uuid()
proposed_term  text NOT NULL
proposed_def   text NOT NULL DEFAULT ''
proposed_notes text
proposed_by    uuid NOT NULL FK → auth.users ON DELETE CASCADE
status         text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected'))
reviewed_by    uuid FK → auth.users
reviewed_at    timestamptz
admin_note     text
created_at     timestamptz NOT NULL DEFAULT now()
```

RLS : member INSERT (own) · member SELECT (own OR admin) · admin ALL (bdb_is_admin())

---

## BLOC 4 — RPC SERVEUR (migration 076c)

### glossaire_scan_orphelins(p_min_freq int DEFAULT 10)

Scanne les notes exploitables, extrait les mots fréquents, croise avec le glossaire.
Retourne les termes orphelins (fréquents mais non expliqués).

```
RETOURNE : TABLE (mot text, freq bigint)
STRATÉGIE : 62 733 notes × 8 mots = ~500K tokens.
            Tokenisation : upper + strip ponctuation + NFD.
            Filtre : ≥ p_min_freq occurrences, ≥ 3 caractères, hors stopwords FR.
            Croisement : NOT IN (glossaire.abbreviation UNION glossaire.variantes).
PERF : < 3s (volume gérable, pas de table cache nécessaire).
```

### glossaire_match_notes(p_term text, p_limit int DEFAULT 500)

Pour un terme donné → protocoles dont les notes contiennent ce terme.

```
RETOURNE : TABLE (protocole_id uuid, id_protocole text, libelle_cible text,
                  type text, specialite text, zone_anat text, frequence int,
                  match_count bigint, sample_notes text[])
STRATÉGIE : ILIKE '%' || p_term || '%' sur thesaurus_interventions.note.
            GROUP BY protocole via JOIN thesaurus_protocoles.
            5 sample_notes max par protocole (ARRAY_AGG[:5]).
```

### glossaire_propagate(p_glossaire_id uuid)

Propage une abréviation dans synonymes_recherche des protocoles concernés.

```
RETOURNE : int (nombre de protocoles mis à jour)
STRATÉGIE : 1. Récupère abbreviation + variantes du glossaire entry.
            2. Cherche protocoles dont les notes contiennent le terme.
            3. APPEND abbreviation à synonymes_recherche (pipe-separated).
            4. UPDATE glossaire SET is_propagated = true.
SÉCURITÉ : APPEND only — ne touche jamais au contenu existant de synonymes_recherche.
           Ne propage PAS si l'abréviation est déjà présente dans synonymes_recherche.
```

---

## BLOC 5 — INTERFACE (4 faces)

### Face A — Consultation (tous membres)

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 [Rechercher un terme, abréviation, éponyme...     ] │
│ Filtres : [Catégorie ▼] [Toutes]                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ FESF                              ABREVIATION       │ │
│ │ Fracture de l'Extrémité Supérieure du Fémur         │ │
│ │ Inclut fracture du col, pertrochantérienne...       │ │
│ │ Variantes : fracture col fémur                      │ │
│ │ 🔗 5 protocoles liés                                │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ IGLOO                              MATERIEL          │ │
│ │ Attelle de cryothérapie post-opératoire              │ │
│ │ Variantes : cryo-cuff, aircast cryo, manchon cryo   │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 25 termes · [💡 Proposer un terme]                      │
└─────────────────────────────────────────────────────────┘
```

Recherche client-side sur abbreviation + definition + usage_notes + variantes.
Tri alphabétique par défaut. Filtre par catégorie.

### Face B — Découverte (admin only)

```
┌─────────────────────────────────────────────────────────┐
│ 🔬 Scanner les notes d'interventions                    │
│ Seuil minimum : [10 ▼] occurrences  [🔍 Scanner]       │
├─────────────────────────────────────────────────────────┤
│ 62 733 notes scannées · 47 termes orphelins détectés    │
├─────────────────────────────────────────────────────────┤
│ CONSIGNES    14 198   [Voir notes] [+ Créer entrée]     │
│ GILET         1 691   [Voir notes] [+ Créer entrée]     │
│ IGLOO         1 339   [Voir notes] [+ Créer entrée]     │ ← déjà créé = badge ✓
│ WEIL          1 039   [Voir notes] [+ Créer entrée]     │
│ SFAX          1 008   [Voir notes] [+ Créer entrée]     │
│ ...                                                      │
├─────────────────────────────────────────────────────────┤
│ [Voir notes] → expand : protocoles contenant ce terme    │
│   ACT-0001 PTH (234 notes)                               │
│   ACT-0006 PETITE INTERVENTION (12 notes)                │
│   Échantillons : "PTH SFAX cimentée gauche..."           │
└─────────────────────────────────────────────────────────┘
```

Appelle RPC `glossaire_scan_orphelins()` au clic Scanner.
"Voir notes" appelle RPC `glossaire_match_notes(terme)`.
"Créer entrée" → pré-remplit le formulaire admin avec le terme.

### Face C — Propagation (admin only)

```
┌─────────────────────────────────────────────────────────┐
│ 📡 Entrées non propagées                                │
├─────────────────────────────────────────────────────────┤
│ ☐ FESF → 5 protocoles cibles  [Prévisualiser] [Propager]│
│ ☐ DIDT → 3 protocoles cibles  [Prévisualiser] [Propager]│
│ ☐ IGLOO → 8 protocoles cibles [Prévisualiser] [Propager]│
│ ─────────────────────────────────────────────────────── │
│ ✓ PTH — propagé le 2026-03-31 (12 protocoles)          │
│ ✓ PTG — propagé le 2026-03-31 (8 protocoles)           │
└─────────────────────────────────────────────────────────┘
```

"Prévisualiser" → liste des protocoles qui seront enrichis + preview du nouveau synonymes_recherche.
"Propager" → appelle RPC `glossaire_propagate(id)`.

### Face D — CRUD + Suggestions (admin + membres)

Admin : tableau CRUD complet (ajout/modif/suppression) avec les 3 nouvelles colonnes.
Membres : formulaire suggestion (terme + définition + notes) → glossaire_suggestions.
Admin : review file d'attente (approuver → INSERT glossaire / rejeter).

---

## BLOC 6 — TOOLTIP CROSS-MODULE

### Fichier : js/bdb-glossaire-tooltip.js

Module JS partagé chargé par bdb-shell sur toutes les pages.

```
var BdbGlossaire = {
  _entries: [],     // cache sessionStorage bdb_glos_entries
  _regex: null,     // RegExp compilée depuis tous les termes + variantes
  _ready: false,

  init()            // Fetch glossaire → cache → compile regex
  enrich(container) // Scan textNodes dans container → wrappe en <abbr>
  lookup(term)      // Retourne l'entrée glossaire pour un terme
}
```

### Stratégie d'enrichissement

**Hybride :**
- **Auto sur les notes** : le module thésaurus appelle `BdbGlossaire.enrich()` après chaque render de notes d'interventions (cellules note dans les tables, slide-over interventions CCAM)
- **Explicite ailleurs** : les autres modules (fiches, cours, transmissions) appellent manuellement `BdbGlossaire.enrich(container)` après render de contenu DB

### Règles d'enrichissement

```
1. Ne wrappe que les textNodes (pas les attributs, pas les inputs)
2. Ignore : <input>, <textarea>, <code>, <script>, <style>, <abbr>
3. Case-insensitive, word-boundary respectées (\b)
4. Double-enrichissement impossible (skip si parent = <abbr>)
5. Rendu : <abbr title="[définition]" class="bdb-glos-term">[TERME]</abbr>
6. CSS : underline dotted subtil, cursor help
```

### Intégration bdb-shell

```
<!-- Ajout dans bdb-shell.js après shellReady -->
<script src="../../js/bdb-glossaire-tooltip.js"></script>
```

⚠ **bdb-shell.js ne doit PAS être modifié directement.** Le script est ajouté dans le HTML de chaque module via la chaîne JS standard, OU chargé dynamiquement par bdb-shell si le mécanisme existe.

**Alternative sans toucher bdb-shell :** chaque module qui veut les tooltips ajoute le `<script>` dans son HTML et appelle `BdbGlossaire.init()` puis `BdbGlossaire.enrich()` explicitement.

**Arbitrage requis : mécanisme d'injection dans bdb-shell ou script par module ?**

---

## BLOC 10 — SPEC PRODUCTION (Claude Code — session #24)

### Fichiers à produire (4)

| Fichier | Description |
|---|---|
| `modules/glossaire/index.html` | HTML complet CDS — 4 onglets |
| `modules/glossaire/glossaire-app.js` | IIFE GlossApp — toute la logique |
| `modules/glossaire/glossaire-ui.css` | CSS co-localisé, préfixe `glos-` |
| `js/bdb-glossaire-tooltip.js` | Composant partagé IIFE BdbGlossaire |

### Chaîne JS

```
bootstrap.bundle → supabase-js@2 → supabase-client.js → bdb-shell.js → bdb-glossaire-tooltip.js → glossaire-app.js
```

### Onglets

| Onglet | Visibilité | ID |
|---|---|---|
| Glossaire | tous | tab-glossaire |
| Proposer | authentifiés | tab-proposer |
| Découverte | admin | tab-decouverte |
| Administration | admin | tab-admin-glos |

### Cache sessionStorage

- Clé `bdb_glos_entries` — purge après modification admin
- RPC scan/match/propagate : toujours live (pas de cache)

### Phase 0 audit terrain obligatoire

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'glossaire' ORDER BY ordinal_position;
SELECT proname FROM pg_proc WHERE proname LIKE 'glossaire_%';
SELECT COUNT(*) FROM glossaire;
SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('glossaire', 'glossaire_suggestions');
SELECT key, status FROM app_modules WHERE key = 'glossaire';
```

### Activation post-recettage

```sql
UPDATE app_modules
SET status = 'active', is_new = true, new_until = CURRENT_DATE + INTERVAL '30 days'
WHERE key = 'glossaire';
```

---

## BLOC 11 — DONNÉES TERRAIN (audit 2026-03-31)

```
Notes exploitables       : 62 733 (68.6% des 89 721)
Notes short              : 15 280 (17.0%)
Notes vides              : 11 576 (12.9%)
Notes encoding cassé     : 1 241 (1.4%)
Mots moyens par note OK  : 8
Mots max                 : 73
Mots distincts fréquents : estimé 3 000-5 000 (≥5 occurrences)
Top 3 fréquences         : CONSIGNES (14 198), LOMBAIRE (6 225), ARTHROSCOPIE (5 863)
Pépites identifiées      : IGLOO (1 339), SFAX (1 008), WEIL (1 039), RESSAUT (1 521)
Problèmes tokenisation   : ponctuation non strippée, accents variantes (PROTHESE/PROTHÈSE)
```

---
