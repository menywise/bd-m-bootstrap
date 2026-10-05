# PATCH DOCTRINE — à transmettre à Claude AI (instance claude.ai)

```
DESTINATAIRE : Claude (instance claude.ai, auteur du BADGE V1 du module glossaire)
ÉMETTEUR     : Claude (instance Cowork) après cross-check cloud + disque
DATE         : 2026-05-08
OBJECTIF     : Réaligner Claude AI sur la doctrine cloud actuelle pour qu'il ne
               reproduise pas l'erreur d'arbitrage du badge V1.
USAGE        : Manu colle ce bloc au début d'une conversation Claude AI.
```

---

## 0. CADRE DE LECTURE

Tu (Claude AI) viens de produire un audit du module `modules/glossaire/` (BADGE_CONFORMITE_V5_GLOSSAIRE_2026-05-08.md). Une autre instance Claude (Cowork) l'a contre-audité avec accès direct à la base `atelier_principes` + `atelier_decisions` + au disque local. Le contre-audit a identifié **3 dérives doctrinales** dans ton badge V1 et **6 violations** que tu avais oubliées.

Ce document n'est pas un reproche. Il est ta mise à jour. Niveau 0 §13 te demande de croiser les instruments avant d'arbitrer — c'est ce que tu corriges ici.

---

## 1. ERREUR D'ARBITRAGE — Option A illégitime

### Ce que tu as écrit (V1)

> « Recommandation : Option A. La session #115 a adopté la Charte v3 (D-2026-05-07-S115-CHARTE-PREMIUM). Le glossaire est le premier module à l'appliquer. CONV-CHAIN-E doit être mis à jour pour refléter cette décision, pas l'inverse. »

### Ce que dit la base (vérifié 2026-05-08)

**D-2026-05-07-S115-CHARTE-PREMIUM** (statut active) — extrait littéral de la colonne `description` :

> « Hors scope (FAB(3R) requis) : renommage bdb-* → dbm-*, **theme-base CDN → local**, palette HSL 28 modules vs 5-groupes V5 (D-2026-05-05-S117 maintenu). »

**D-2026-05-08-S115-CLOTURE-ALIGN** (statut active) point (3) :

> « Fichiers `dbm-premium-components.css` + `bdb-zone-state.js` HORS chaîne V5 → à reverser dans `_deltas/` (Action C). »

### Conclusion

La migration `theme-base CDN → dbm-theme.css local` (et a fortiori `cds-overrides.css → bdb-ui-kit.css`) est **explicitement hors scope** session #115. Elle exige un **FAB(3R) dédié**. Elle n'a **jamais** été votée.

Recommander Option A revient à régulariser silencieusement une dérive du module au nom d'une décision qui dit explicitement l'inverse. C'est :
- Niveau 0 INTERDIT-1 (changement de cap silencieux) appliqué par l'audit
- Niveau 0 INTERDIT-5 (fausse interprétation silencieuse) sur D-2026-05-07-S115-CHARTE-PREMIUM
- Maladie « certitude » : tu as conclu sans lire la décision cible.

### Doctrine corrigée

Quand un module diverge d'un principe TOUJOURS (`atelier_principes` statut active) :

1. **Tu ne tranches pas dans l'audit.**
2. Tu signales la divergence comme P0.
3. Tu présentes les 2 options sans recommander.
4. Tu **vérifies** si une décision cloud (`atelier_decisions` statut active) a déjà tranché ou explicitement laissé hors scope.
5. Si la décision dit « hors scope FAB(3R) » → tu écris : *« P0 : ouverture FAB(3R) requise — pas d'arbitrage par l'audit. »*
6. **Le Créateur (Manu) tranche, pas l'audit.**

---

## 2. INSTRUMENT MANQUANT — Cross-check cloud systématique

Tu as audité avec : grille AUDIT_N0 §1 (A-J) + 7 voix. Tu n'as pas vérifié `atelier_decisions` ni le statut réel de `atelier_principes` au moment de l'audit.

Niveau 0 §4.8 (mantra CCF) et §13 (Toujours) impliquent : **avant tout verdict, requête la source de vérité**.

### Requêtes minimales à passer avant tout audit module

```sql
-- 1. Quels principes contraignent cette zone ?
SELECT ref, statut, titre, LEFT(description, 500) AS desc_extrait
FROM atelier_principes
WHERE statut='active' AND (
  ref LIKE 'CONV-CHAIN-%' OR
  ref LIKE 'P-CDS-%' OR
  ref LIKE 'INTERDIT-%' OR
  ref LIKE 'CONV-MODAL-%' OR
  ref LIKE 'CONV-APP-ZONE-%'
)
ORDER BY ref;

-- 2. Quelles décisions récentes touchent ce périmètre ?
SELECT ref, titre, LEFT(description, 500) AS desc_extrait
FROM atelier_decisions
WHERE statut='active' AND created_at > NOW() - INTERVAL '60 days'
ORDER BY created_at DESC;

-- 3. Vérifier si le verdict envisagé n'est pas déjà hors scope
SELECT ref, titre, description
FROM atelier_decisions
WHERE description ILIKE '%hors scope%'
  AND statut='active'
ORDER BY created_at DESC;
```

Tu n'as pas l'outil MCP Supabase dans claude.ai natif. **Demande à Manu** d'exécuter ces requêtes avant de produire un verdict P0 quand tu touches à un principe TOUJOURS.

---

## 3. SOUS-COMPTAGE DE VIOLATIONS

Tu as listé 8 violations. Cross-check disque : **15** confirmées.

Manqué :

| # | Violation | Ligne | Pourquoi tu l'as ratée |
|---|---|---|---|
| **V4** | Rouge `#dc3545` sur `.glos-badge-pathologie` (INTERDIT-COULEUR-01 + saturée) | glossaire-ui.css L35-37 | Tu as listé MODULE-COLOR-01 (générique) sans détailler l'INTERDIT-COULEUR-01 plus grave |
| **V9** | `<script src="../../js/bdb-pwa.js"></script>` ligne 7 du HEAD, hors chaîne JS V5 | index.html L7 | Tu n'as pas audité l'ordre de chargement JS du HEAD |
| **V10** | Surface marker non canonique : 5 champs au lieu de 4 (`Theme: DBM` ajouté) | index.html L2 | Tu as coché CONV-GF2-BALISE-SURFACE sans vérifier le format exact |
| **V11** | `<div class="app-layout"><main class="app-main" id="main-content">` au lieu de `<main id="middle">` (CLAUDE.md V2.4 §17) | index.html L57-58 | Tu n'as pas comparé au template canon |
| **V12** | `data-shell-theme="dbm"` non documenté | index.html L53 | Idem |
| **V13** | `data-login-mode="modal"` non documenté | index.html L52 | Idem |
| **V14** | Variables couleur module triplées (head `:root`, attribut style sur app-content, fichier `dbm-module-color.css`) | index.html L20-25 + L59 | Tu as validé CONV-MODULE-COLOR-02 (autorise duplication head/inline pour modales) sans voir que la 3e source est la duplication de trop |

Et **sous-comptage V6** : tu disais 9 inline styles, il y en a 10.

### Doctrine corrigée

Pour chaque audit HTML :
1. `grep -n 'style="' index.html | wc -l` (compte exact)
2. `grep -n 'data-' index.html` (audit attributs personnalisés contre la doctrine du shell)
3. `grep -nE '<script' index.html` (audit ordre des scripts head + body)
4. Comparaison ligne à ligne du squelette `<body>` au template canon (CLAUDE.md V2.4 §17 ou Carnet V2 §6)

---

## 4. CONFLIT DOCTRINAL DÉTECTÉ DANS LA BASE

Lors de la vérification de **INTERDIT-E1** :

| Champ | Valeur en base |
|---|---|
| `titre` | « #bdb-shell = premier enfant de `<main>` » |
| `description` | « doit être le premier enfant de `#wrapper`, jamais... enfant de `<main>` » |

**Le titre contredit la description du même principe.** AUDIT_CONFLITS_SOURCES_DBM (conflit 1, statut résolu) avait acté que le verdict est `#wrapper`. La description a été corrigée. Le titre **n'a pas** été aligné.

Quand tu lis un principe en base, lis **les deux champs**. Si conflit → signale-le. Ne le résous pas seul.

---

## 5. CHECKLIST PRÉ-AUDIT (à intégrer à ta procédure)

Avant tout audit module avec verdict P0/P1 :

```
□ Lire le module sur disque (HTML + JS + CSS)
□ Compter mécaniquement (grep) chaque INTERDIT pertinent
□ Demander à Manu de requêter atelier_principes WHERE ref ILIKE '...'
□ Demander à Manu de requêter atelier_decisions récentes (60 j) sur le périmètre
□ Pour chaque divergence module ↔ principe :
    □ Vérifier qu'aucune décision active ne valide la divergence
    □ Vérifier qu'aucune décision active ne place la migration "hors scope FAB(3R)"
    □ Si "hors scope" trouvé : verdict = OUVERTURE FAB(3R), pas Option A/B
□ Pour chaque principe lu : comparer titre ET description (cf. INTERDIT-E1)
□ Avant verdict final : appeler les 7 voix ET écouter Gaël (T9w8) sur l'assemblage
```

---

## 6. RAPPEL — TU ES BEIGE À CHAQUE OUVERTURE

Niveau 0 §0 : *« Tu peux être expert mondial. Beige veut dire : non calibré sur le cap actuel de DB&M. »*

Sur cette session, tu étais beige sur :
- L'état réel de D-2026-05-07-S115-CHARTE-PREMIUM (§ Hors scope)
- La cohérence interne d'INTERDIT-E1
- Les attributs canon du shell (`data-shell-theme`, `data-login-mode` ne le sont pas)
- L'ordre exact de la chaîne JS V5 (placement de `bdb-pwa.js`)

**Calibre-toi en lisant la base avant d'arbitrer, pas après.**

---

## 7. ACTION POUR TOI

À ta prochaine ouverture sur le projet :

1. Lire **D-2026-05-07-S115-CHARTE-PREMIUM** dans `atelier_decisions` en intégralité (la colonne `description` complète, pas un extrait).
2. Lire **D-2026-05-08-S115-CLOTURE-ALIGN** en intégralité.
3. Lire le badge V2 corrigé : `BADGE_CONFORMITE_V5_GLOSSAIRE_V2_2026-05-08.md`.
4. Confirmer à Manu : *« J'ai lu les corrections. Je n'arbitrerai plus dans un audit, je signalerai. »*
5. Quand Manu te demande l'étape suivante (patches, FAB, autre module), tu pourras la faire **sans** rejouer Option A.

---

## 8. SOURCES

- `C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\000000_NIVEAU_0_DBM_V0_5_0.md` § 7 (6 interdits) + § 13 (toujours)
- `C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\0000_CARNET_LIAISON_DBM_V2.md` § 4.2 (CSS) + § 6 (structure HTML)
- `C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\0000_AUDIT_CONFLITS_SOURCES_DBM.md` conflits 1 + 2 + 3
- `C:\DEV\BIBLE_DE_BLOC\CLAUDE.md` V2.4 § 15 (stack) + § 17 (pattern module)
- Cloud `atelier_decisions` : D-2026-05-07-S115-CHARTE-PREMIUM, D-2026-05-08-S115-CLOTURE-ALIGN, D-2026-05-06-AUDIT-V5-100
- Cloud `atelier_principes` : CONV-CHAIN-E, P-CDS-01, REF-CSS-DBM-01, INTERDIT-E1, INTERDIT-JS-02, CONV-SURFACE-MARKER-HTML, CONV-MODULE-COLOR-02
- Disque : `C:\DEV\BIBLE_DE_BLOC\modules\glossaire\index.html` + `glossaire-app.js` + `glossaire-ui.css`

---

*Fin du patch. Bonne reprise.*
