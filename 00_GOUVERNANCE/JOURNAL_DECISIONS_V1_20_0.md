
---

## 2026-03-22 — Fix bug silencieux role 'member' vs 'membre' (Transmissions)

DATE       : 2026-03-22
MODULE     : Transmissions
DECISION   : Corriger la comparaison role === 'member' en role === 'membre' (ligne 407)
MOTIF      : L'enum PostgreSQL app_role utilise 'membre' (francais). Le shell expose la valeur brute DB. La comparaison 'member' ne matchait jamais en mode reel -> isApproved toujours false pour les non-admins.
SCOPE      : modules/transmissions/index.html ligne 407 uniquement
HORS SCOPE : bdb-shell.js (pas de mapping cote shell — accord Manu requis pour modifier)
IMPACT     : Les utilisateurs role='membre' peuvent desormais acceder aux actions approuvees dans Transmissions. Bug sans effet en mode preview (preview injecte role='member').
RESULTAT   : 1 ligne corrigee, 0 regression
STATUT     : TERMINE

---

## D-2026-03-22-T01 — Migration Supabase module thesaurus
```
DATE       : 2026-03-22
MODULE     : thesaurus
DÉCISION   : Migration complète bdb-shell.js + création tables Supabase.
TABLES     : thesaurus_protocoles (420 lignes) + thesaurus_interventions (70 361 lignes)
MIGRATION  : 018_thesaurus_schema.sql (DDL + RLS + 7 index + UNIQUE id_protocole)
             018b_thesaurus_rpc.sql (2 fonctions SECURITY DEFINER)
RLS        : 7 policies — is_approved() SELECT, is_admin() INSERT/UPDATE/DELETE
FONCTIONS  : thesaurus_distinct_chirurgiens() · thesaurus_distinct_annees()
INDEX      : chirurgien · protocole_operatoire · date_intervention · specialite · type · zone_anat · frequence DESC
JS EXTERNALISÉ : thesaurus-app.js (1195 lignes) — zéro JS inline dans index.html (932 lignes)
CACHE      : sessionStorage bdb_thes_* (protocoles 420, chirurgiens 10, années 20, interv par chirurgien ~7000)
             Invalidation : bouton admin "Purge cache" + ThesCache.clear() auto après import
CORRECTIONS CDS :
  - Auth/offcanvas/nav hardcodés supprimés (INTERDIT-B1/B2/B3)
  - #bdb-shell premier enfant main (INTERDIT-E1)
  - escHtml() sur tout innerHTML avec donnée DB (INTERDIT-C6)
  - style="display:none!important" supprimé
  - style="color:#7c3aed" → classe .thes-ai-icon
  - theme-base.css/theme-print.css → CDN (fichiers absents en local)
  - .from('protocoles') → .from('thesaurus_protocoles') (nom table corrigé)
  - Données MOCK 420 protocoles inline supprimées
  - id="editZone" dupliqué corrigé
  - analyse.html legacy PocketBase supprimé
DONNÉES    : 70 361 interventions réelles terrain 2006-2025, 10 chirurgiens, 2 spécialités
             Intégrité vérifiée : 0 null, plage complète, DISTINCT confirmé
PALIER 1   : FERMÉ — 25/25 modules sous bdb-shell.js
STATUT     : VALIDÉ
```

---

## D-2026-03-22-T02 — UX premium onglet Chirurgiens (CDC US-1.1/1.2/1.4)
```
DATE       : 2026-03-22
MODULE     : thesaurus (onglet Chirurgiens)
DÉCISION   : Refonte complète UX analyse solo + comparaison chirurgiens.
COUVERTURE CDC :
  US-1.1 Activité globale → courbe annuelle line chart (yearMap agrégé)
  US-1.2 Top Pareto       → tableau rang médaille (gold/silver/bronze) + barre % part
                             + colonne % cumulé + courbe combo bar+line seuil 80%
  US-1.4 Interventions rares → table scrollable ≤3 occurrences + badge compteur
NOUVEAUX COMPOSANTS ANALYSE SOLO :
  - 4 KPI cards avec icônes colorées (interventions, protocoles distincts, mois actif, diversité vs 420)
  - Courbe activité annuelle (Chart.js line)
  - Doughnut types avec légende pointStyle
  - Barres zones anatomiques colorées par type
NOUVEAUX COMPOSANTS COMPARAISON :
  - Header VS graphique (bleu A / vert B)
  - Métriques côte-à-côte centrées (total, distincts, communs, diversité)
  - Radar chart profil types superposé
  - Exclusifs triés par volume + badge compteur total
CSS AJOUTÉ : ~60 lignes (thes-chir-kpi-grid, thes-chir-kpi-card, thes-pareto-rank gold/silver/bronze,
             thes-pct-bar, thes-zone-bar-*, thes-compare-header/vs/name/metric-row, thes-section-title,
             thes-loading-block)
ARCHITECTURE REQUÊTES :
  - Fetch complet chirurgien 1 fois (cache sessionStorage)
  - Filtre année = local (_filterByAnnee) → zéro requête supplémentaire
  - 2nd analyse même chirurgien = instantané (cache hit)
STATUT     : VALIDÉ
```

---

## D-2026-03-22-T03 — Analyse DATA_METIER thesaurus (6 fichiers)
```
DATE       : 2026-03-22
MODULE     : thesaurus (gouvernance)
DÉCISION   : 6 fichiers DATA_METIER analysés et classés. Tous conservés.
FICHIERS   :
  _REGLES_THESAURUS_CONSOLIDEES.md (236L) → référence permanente (règles F1-F3, C1-C3, Q1-Q4)
  _REFERENTIEL_zones_operatoires.md (306L) → référence permanente (13 zones V13 + algorithme)
  _contexte_AI_THESAURUS.md (496L) → contexte projet (structure données, méthodologie MeSH)
  _dashboard_cdc_complet.md (1423L) → CDC produit (15+ user stories, 4 personas, 30% couvert)
  _miniordre_synonyme.md (708L) → spec Phase 3+ (moteur IA synonymes, dépend base CCAM externe)
  _etape_suivante_GUIDE_REFERENCE_MeSH.md (1292L) → guide méthodologique (pas exécutable)
BACKLOG CDC RESTANT :
  US-2.1 Benchmark cadre (vue multi-chirurgiens) — BASSE
  US-3.1 Parcours IBODE (lien carnet_bord) — dépend tables carnet
  US-4.1 Prépa matérielle brancardier (croisement fiches) — MOYEN
  US-5.1 Fiche protocole enrichie (modale premium) — HAUTE → session T2
  Q1-Q4 Contrôles qualité admin — MOYENNE → session T3
STATUT     : VALIDÉ — aucun fichier supprimé, aucun déplacé
```
