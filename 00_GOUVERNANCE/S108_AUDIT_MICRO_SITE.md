# S#108 — Audit micro pages site/ BDB

## Date : 2026-04-26
## Périmètre : 13 fichiers HTML — 12 dans `site/` (profondeur 1) + 1 dans `site/landing/` (profondeur 2)
## Méthode : lecture intégrale + Test-Path automatisé sur chaque href/src relatif + grep anonymisation
## Standards : chaîne CSS BLOC E (BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides) ; chaîne JS publique (bootstrap.bundle → supabase-js@2 → supabase-client → bdb-site-hydrate) ; balise GF-2 ; pages publiques sans bdb-shell

> **Convention de cohérence** : la balise GF-2 doit utiliser `Auth: aucune` (français) — convention établie pour les pages BDB et déjà appliquée aux pages SYSTEME (403, 404, maintenance, offline, session-expiree, unauthorized, pending — corrigé S#108) et SITE-PUBLIC (mentions-legales, politique-confidentialite, contact, suppression-compte). Les pages site/ utilisent `Auth: none` (anglais) = violation systémique récurrente à corriger.

---

## 1. _TEMPLATE_MINISITE_V5_0_1.html

**Rôle** : Template de référence pour les pages du mini-site public.
**Audience** : développeur — référence
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non (pages publiques)

**Chaîne CSS** :
- [x] BS 5.3.3
- [x] theme-base @63905396
- [x] BI 1.11.1
- [x] cds-overrides
- [x] CSS local : `site-ui.css` (placeholder commenté)
- Anomalies : aucune

**Chaîne JS** :
- [x] bootstrap.bundle
- [x] supabase-js@2
- [x] supabase-client
- [x] bdb-site-hydrate
- Anomalies : aucune

**Liens sortants** : N/A (template)
- `index.html` (L39, lien Accueil mini-site interne) → EXISTE
- `../login.html` (L69, lien Mon espace) → EXISTE

**Anonymisation** : **NON-CONFORME** — L184 contient "Dr COSTE" (nom propre identifiant dans une note de développement du template)

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 2 violations
**Violations** :
1. **L2** — Balise GF-2 `Auth: none` → doit être `Auth: aucune`.
2. **L184** — Mention "Dr COSTE" (nom propre identifiant) dans un commentaire de développement. À anonymiser en "Dr X" ou nom générique fictif.

---

## 2. accessibilite.html

**Rôle** : Déclaration WCAG 2.1 AA — page institutionnelle.
**Audience** : tout le monde (Brigitte direction prioritaire)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme (BS 5.3.3, theme-base, BI 1.11.1, cds-overrides, site-ui.css)
**Chaîne JS** : conforme (bootstrap.bundle, supabase-js@2, supabase-client, site-nav.js, bdb-site-hydrate)
**Structure DOM** : standalone, cohérent

**Liens sortants** :
- `../login.html` (L36, "Mon espace") → EXISTE
- `glossaire.html` (L292) → EXISTE
- `index.html` (L293, retour mini-site) → EXISTE

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 3. adoption.html

**Rôle** : Stratégie d'adoption (DISC/Spirale) — comment BDB s'installe.
**Audience** : P5 (sceptique ORANGE), P7 (adopteur VERT)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + tooltip init inline (L276)
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L41) → EXISTE
- `risques.html` → EXISTE
- `faq.html` → EXISTE

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 4. audiences.html

**Rôle** : Présentation par persona (5 profils) — montage intelligent par rôle.
**Audience** : P1 (nouveau), P3 (ancien), P6 (direction), P7 (chirurgiens)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme — chaîne unique post-S108 (le double chargement supabase-client, corrigé en S#108, n'existe plus). Inclut `audiences-cta.js` local.
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L33) → EXISTE
- `pas-app.html`, `fonctionnalites.html`, `instances.html` → tous EXISTENT

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 5. faq.html

**Rôle** : FAQ dynamique (contenu Supabase `site_faq`, `show_in_site=true`).
**Audience** : tout le monde
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme — chaîne unique post-S108 (double chargement supabase-client corrigé). Inclut `faq-site.js` local.
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L43) → EXISTE
- `adoption.html` → EXISTE
- `index.html` (L124, retour mini-site interne) → EXISTE

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 6. fonctionnalites.html

**Rôle** : Fonctionnalités (chercher, partager, protéger, retrouver).
**Audience** : P3 (ORANGE/BLEU), P5 (sceptique)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + tooltip init inline (L329)
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L38) → EXISTE
- `audiences.html`, `risques.html` → tous EXISTENT

**Anonymisation** : **À VÉRIFIER** — L73 contient "Dr Dupont, équipe du matin, référent matériel..." dans un libellé d'illustration UI. "Dupont" est un nom générique fictif (équivalent français de "Dr Smith"), donc acceptable comme exemple. Pas de mention d'établissement réel.

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 7. glossaire.html

**Rôle** : Lexique interactif (CRUD termes + catégories) — contenu dynamique JS.
**Audience** : tout le monde
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + bloc inline JS volumineux (CRUD complet L244-629) avec `escHtml()` pour protection XSS
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L47) → EXISTE
- `accessibilite.html` → EXISTE

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 8. index.html (mini-site)

**Rôle** : Accueil mini-site (héro + personas + CTA Vision).
**Audience** : P1, P2, tous prospects
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + `bdb-demo.js` (L320, démo interactif) + tooltip init inline
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L56) → EXISTE
- `vision.html`, `audiences.html`, `instances.html` → tous EXISTENT

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 9. instances.html

**Rôle** : Déploiements réels — stats RPC `site_instance_stats`, preuve sociale anonyme (mis à jour S#108).
**Audience** : P6 (direction), P5 (sceptique)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non (mais utilise `window.bdb` mode anon via `instances-app.js`)

**Chaîne CSS** : conforme
**Chaîne JS** : conforme — chaîne post-S108 v2.0.0 (`instances-stats.js` retiré, `instances-app.js` appelle RPC)
**Structure DOM** : standalone — carte instance HTML statique anonyme avec 6 spans hydratés (`stat-protocoles`, `stat-glossaire`, `stat-materiel`, `stat-interventions`, `stat-fiches`, `stat-ccam`)

**Liens sortants** :
- `../login.html` (L42) → EXISTE
- `risques.html`, `adoption.html`, `audiences.html#direction` → tous EXISTENT

**Anonymisation** : CONFORME (S#108) — les mentions "orthopédique" / "IBODE de terrain" L7-8 sont dans le **commentaire historique** documentant la migration (traçabilité intentionnelle, pas dans le contenu visible). Le contenu utilisateur est anonymisé : "un bloc opératoire" (L54), "professionnel de bloc opératoire" (L242).

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 10. pas-app.html

**Rôle** : Cadrage honnête — ce que BDB ne fait PAS (6 limites + hors-scope).
**Audience** : P4 (BLEU), P5 (ORANGE), P8 (neutralisation passive)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + tooltip init inline (L239)
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L38) → EXISTE
- `vision.html`, `audiences.html` → tous EXISTENT

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 11. risques.html

**Rôle** : Risques et garde-fous — Conseil des 5 + 3 questions critiques.
**Audience** : P5 (sceptique), P6 (décideur)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + tooltip init inline (L283)
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L40) → EXISTE
- `fonctionnalites.html`, `adoption.html`, `instances.html` (L265) → tous EXISTENT

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 12. vision.html

**Rôle** : Vision — pourquoi BDB existe, cycle toxique, parcours formation.
**Audience** : P2 (VIOLET/BLEU), P3 (BLEU/ORANGE)
**Profondeur** : 1 (site/)
**Utilise bdb-shell** : non

**Chaîne CSS** : conforme
**Chaîne JS** : conforme + tooltip init inline (L233)
**Structure DOM** : standalone

**Liens sortants** :
- `../login.html` (L41) → EXISTE
- `index.html` (L217, retour mini-site interne) → EXISTE
- `pas-app.html` → EXISTE

**Anonymisation** : CONFORME

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation
**Violations** :
1. **L? (balise GF-2)** — `Auth: none` → `Auth: aucune`

---

## 13. landing/saisie-invite.html

**Rôle** : Saisie préférences chirurgien (session collective, formulaire complet, mode anon).
**Audience** : équipe bloc (IDE, cadres) — saisie collaborative anonyme
**Profondeur** : 2 (site/landing/)
**Utilise bdb-shell** : non (mode anon `window.bdb` direct)

**Chaîne CSS** : conforme — chemins `../../css/cds-overrides.css` corrects pour profondeur 2 + bloc `<style>` inline volumineux (L12-191)
**Chaîne JS** : minimal mais inhabituel — `<script src="/bdb/js/supabase-client.js">` (L884, **chemin absolu OVH** au lieu de `../../js/`). Cohérent avec déploiement landing OVH mais fragile en dev local.
**Structure DOM** : standalone, formulaire long avec accordions

**Liens sortants** : aucun lien HTML interne (formulaire standalone). Aucun lien `../login.html` ou `../index.html` (intentionnel — page landing autonome, pas de retour app).

**Anonymisation** : CONFORME — les mentions "Orthopédie", "Traumatologie" (L243) et "Table orthopédique" (L296) sont du **vocabulaire métier dans des `<select>`/`<span>` fonctionnels** (catégorisation d'intervention), pas des mentions identifiantes d'établissement. Le préfixe `'Dr ' + nom` (L915) est dynamique JS pour afficher les médecins disponibles. Acceptable.

**Balise GF-2** : `<!-- BDB | Surface: SITE-PUBLIC | Auth: none | Shell: non -->` → **NON-CONFORME** : `Auth: none` au lieu de `Auth: aucune`

**Verdict** : 1 violation (+ 1 anomalie mineure de chemin JS absolu)
**Violations** :
1. **L2** — Balise GF-2 `Auth: none` → `Auth: aucune`.
2. **L884 (anomalie mineure)** — `<script src="/bdb/js/supabase-client.js">` utilise un chemin absolu OVH au lieu du chemin relatif profondeur 2 `../../js/supabase-client.js`. Fonctionne en prod OVH mais cassé en dev local. À uniformiser si la convention BDB est aux chemins relatifs.

---

## Récapitulatif

| Page | Rôle (court) | Profondeur | CSS | JS | Liens | Anonyme | GF-2 | Verdict |
|---|---|---|---|---|---|---|---|---|
| _TEMPLATE_MINISITE_V5_0_1.html | Template référence | 1 | ✓ | ✓ | ✓ | **Dr COSTE** | **`Auth: none`** | 2 violations |
| accessibilite.html | WCAG 2.1 AA | 1 | ✓ | ✓ | 3/3 | ✓ | **`Auth: none`** | 1 violation |
| adoption.html | Stratégie adoption | 1 | ✓ | ✓ | 3/3 | ✓ | **`Auth: none`** | 1 violation |
| audiences.html | 5 personas | 1 | ✓ | ✓ | 4/4 | ✓ | **`Auth: none`** | 1 violation |
| faq.html | FAQ dynamique | 1 | ✓ | ✓ | 3/3 | ✓ | **`Auth: none`** | 1 violation |
| fonctionnalites.html | Chercher/Partager | 1 | ✓ | ✓ | 3/3 | ✓ (Dupont = fictif) | **`Auth: none`** | 1 violation |
| glossaire.html | Lexique CRUD | 1 | ✓ | ✓ | 2/2 | ✓ | **`Auth: none`** | 1 violation |
| index.html | Accueil mini-site | 1 | ✓ | ✓ | 4/4 | ✓ | **`Auth: none`** | 1 violation |
| instances.html | Déploiements (S#108) | 1 | ✓ | ✓ | 4/4 | ✓ | **`Auth: none`** | 1 violation |
| pas-app.html | Cadrage limites | 1 | ✓ | ✓ | 3/3 | ✓ | **`Auth: none`** | 1 violation |
| risques.html | Risques/Garde-fous | 1 | ✓ | ✓ | 4/4 | ✓ | **`Auth: none`** | 1 violation |
| vision.html | Vision/Cycle | 1 | ✓ | ✓ | 3/3 | ✓ | **`Auth: none`** | 1 violation |
| landing/saisie-invite.html | Saisie chirurgien | 2 | ✓ | ✓* | N/A | ✓ | **`Auth: none`** | 1 violation (+ anomalie mineure) |

### Statistiques finales

- **Total fichiers audités** : 13
- **Liens vérifiés** : 36 liens internes — **36/36 EXISTENT** (zéro lien cassé)
- **Pages CONFORMES** : 0/13
- **Pages avec violations** : 13/13 — toutes ont `Auth: none` au lieu de `Auth: aucune`
  - **1 violation** : 11 pages (uniquement GF-2 `Auth: none`)
  - **2 violations** : 2 pages
    - `_TEMPLATE_MINISITE_V5_0_1.html` (GF-2 + "Dr COSTE")
    - `landing/saisie-invite.html` (GF-2 + chemin JS absolu)

### Anomalies systémiques

1. **`Auth: none` (anglais) au lieu de `Auth: aucune` (français)** — **13/13 fichiers**. Violation systémique récurrente déjà constatée et corrigée dans `pending.html` (S#108) et `app/sondage.html` (S#108). Convention BDB établie : `aucune` en français pour cohérence avec les autres pages du projet.

2. **Aucune anomalie CSS** : ordre BLOC E respecté partout (BS → theme-base → BI → cds-overrides + site-ui.css local).

3. **Aucune anomalie JS récurrente** : la chaîne publique standard est respectée (bootstrap.bundle → supabase-js@2 → supabase-client → bdb-site-hydrate). Les double-chargements de `supabase-client.js` détectés au S#108 dans `audiences.html` et `faq.html` ont été corrigés.

### Anonymisation — détail des occurrences

**Occurrences détectées par grep, classement** :

| Pattern | Fichier:Ligne | Statut |
|---|---|---|
| `orthop` | instances.html:7,8 | OK (commentaire historique S#108) |
| `orthop` | landing/saisie-invite.html:243 | OK (option `<select>` vocabulaire métier) |
| `orthop` | landing/saisie-invite.html:296 | OK (pill UI "Table orthopédique") |
| `IBODE de terrain` | instances.html:8 | OK (commentaire historique S#108) |
| `Dr ` | _TEMPLATE_MINISITE_V5_0_1.html:184 | **VIOLATION** : "Dr COSTE" nom propre identifiant |
| `Dr ` | fonctionnalites.html:73 | OK (Dr Dupont — nom fictif générique illustratif) |
| `Dr ` | landing/saisie-invite.html:915 | OK (préfixe JS dynamique avant nom de médecin) |
| `Chénieux`, `Limoges`, `Haute-Vienne` | (aucune) | OK — totalement absent post-S108 |
| `clinique de` | (aucune) | OK |
| `Docteur ` | (aucune) | OK |

**Conclusion anonymisation** : seule la mention "Dr COSTE" dans le **template** mini-site est une vraie violation. Les autres occurrences sont soit des commentaires historiques de traçabilité (instances.html), soit du vocabulaire métier fonctionnel (saisie-invite.html), soit un exemple générique fictif (fonctionnalites.html "Dr Dupont").

### Recommandations prioritaires

1. **CORRIGER les 13 balises GF-2** : `Auth: none` → `Auth: aucune` (violation systémique). Opération mécanique : un Edit par fichier.
2. **CORRIGER `_TEMPLATE_MINISITE_V5_0_1.html` L184** : remplacer "Dr COSTE" par "Dr X" ou un nom générique (ex: "Dr Dupont", cohérent avec `fonctionnalites.html`).
3. **CONSIDÉRER** `landing/saisie-invite.html` L884 : aligner sur `../../js/supabase-client.js` (chemin relatif profondeur 2) pour cohérence avec le reste du projet et fonctionnement en dev local. À noter : le chemin actuel `/bdb/js/...` fonctionne en prod OVH.

### Conformité globale

- **Liens** : 100% (36/36 résolvent vers fichiers existants)
- **Chaîne CSS** : 100% (13/13 conformes BLOC E)
- **Chaîne JS** : 100% (13/13 conformes — chaîne publique sans bdb-shell)
- **Structure DOM** : 100% (13/13 cohérentes pour pages publiques sans shell)
- **Anonymisation contenu visible** : 100% (le contenu visible utilisateur ne contient aucune mention identifiante)
- **Balise GF-2 (présence)** : 100% (13/13 présentes)
- **Balise GF-2 (valeur Auth)** : 0% (13/13 utilisent `none` au lieu de `aucune`)

### Notes complémentaires

1. **Les liens "Mon espace"** : 12 pages contiennent un bouton "Mon espace" pointant vers `../login.html` — TOUS résolvent correctement (vérifié Tâche 3 du même prompt). Aucun bug "Mon espace" cassé n'a été trouvé dans site/.

2. **Mentions historiques dans commentaires d'en-tête** : `instances.html` v2.0.0 documente explicitement la migration S#108 et mentionne les anciens textes anonymisés. C'est intentionnel pour la traçabilité du delta — pas une violation.

3. **`saisie-invite.html` chemin JS absolu** : choix de design pour landing OVH. Acceptable mais fragile en dev local. À documenter explicitement dans le code si conservé.
