# JOURNAL DES DÉCISIONS — Bible de Bloc

```
STATUT   : APPEND-ONLY
RÈGLE    : Une entrée par décision. Jamais modifier une entrée existante.
           Toute décision non écrite ici est perdue à la prochaine session.
VERSION  : 1.19.0 — 2026-03-22
FUSION   : V1.13.0 (base)
           + D-2026-03-21-S01 (Session Sécurité dettes D1-D6)
           + D-2026-03-21-T01 (Module supervision)
           + D-2026-03-21-CLEANUP (Nettoyage fichiers racine)
           + D-2026-03-21-PREF (Migration shell preferences)
           + D-2026-03-21-INST (Migration shell installation)
           + D-2026-03-21-QUILL (Fix Quill-in-modal 6 modules)
           + D-2026-03-22-COURS-01 (Hardening cours escHtml + C.9 + fix images)
           + D-2026-03-22-ARCHI-01 (Externalisation JS + arborescence co-localisée)
           + D-2026-03-22-TRANS-01 (Hardening transmissions + fix B2 tags)
           + D-2026-03-22-CSS-01 (CDS_REFERENCE.md créé + cds-overrides v1.6.0)
ALLÈGEMENT : Entrées Lovable/migration initiale réduites (migration derrière nous).
             Entrées Planning Engine 02-26/27 compressées (contrats techniques actifs conservés).
             Entrées 03-08 multiples fusionnées en blocs.
             Entrées gouvernance 03-15-001→007 fusionnées.
             Entrées doublons/soldés purgées.
```

---

## FORMAT D'ENTRÉE

```
DATE       :
MODULE     :
DÉCISION   :
MOTIF      :
SCOPE      : (ce qui est inclus)
HORS SCOPE : (ce qui est explicitement exclu)
IMPACT     : (autres modules ou fichiers impactés)
RÉSULTAT ATTENDU :
STATUT     : VALIDÉ / EN ATTENTE / À ARBITRER
```

---

## [BLOC PLANNING ENGINE — 2026-02-26/27] Contrats techniques fondateurs

```
STATUT : VALIDÉ — résumé consolidé (détails archivés dans V1.13.0)

Décisions actives à retenir pour la Phase 2 (migration planning → Supabase) :

1. INVARIANT SALLE : canonique = string padded 2 chiffres ("05").
   Fonction : PlanningSchema.normalizeSalle(value) — null/non-numérique → throw.
   Jamais Number(salle) dans le code.

2. StorageKeyService : toute lecture/écriture de clé semaine passe par ce service.
   Fichier : FRONT/services/storage-key-service.js
   Exception documentée : localStorage aliases dans planning-members.js (préférences UI locales).

3. Snapshots JSON S01-S05 (2025) corrigés : salle integer → string "05".

4. SHARED/ créé : bdb-members.js commun à planning + disc.
   Règle : ressource commune multi-modules → préfixe bdb-. Module seul → préfixe module-.

5. Correction données legacy + audit V1.1.0 soldé (tous points traités).
   Fallback offline planning.html : 11 variables --pe-* mappées Bootstrap 5.3 natif.
```

---

## [BLOC FONDATION STACK — 2026-03-06/09] Décisions structurantes initiales

```
STATUT : VALIDÉ — résumé consolidé (migration Lovable totalement derrière nous)

Décisions actives à retenir :

1. Stack cible validée : HTML/JS vanilla + Bootstrap 5.3.2 + Supabase cloud.
   Pas de React. Pas de Node. Pas de build tool.

2. INTERDIT-13 : Tout appel psql via docker exec DOIT inclure -e PGCLIENTENCODING=UTF8.
   INTERDIT-14 : Jamais Get-Content PowerShell pour lire des CSV UTF-8.
   INTERDIT-15 : Toute transformation CSV → Python avec open(..., 'rb').

3. Supabase cloud = moteur de données unique.
   Exceptions temporaires (migration planifiée) :
     planning      : localStorage — migration Supabase Phase 2
     disc          : localStorage — Phase 1 arbitrage A2
     dork          : localStorage — Phase 1 arbitrage A2-dork
     collab/paxis/organisateur : localStorage — Phase 1
     thesaurus     : DATA inline — Phase 1

4. Ordre de migration : vague 1 organisateur → paxis → collab | vague 2 disc | vague 3 planning → dork → thesaurus.

5. INTERDIT-17 : Override Bootstrap scopé à son conteneur parent.
   INTERDIT-16 : Jamais livrer HTML BDB dont UI/UX < TSX Lovable remplacé.

6. admin/ : bug approved lu depuis user_roles → corrigé (menuAvatar neutralisé).
   CollabKit : JS inline obligatoire — ordre context → storage → categories → projects → crud → crud_ui_helpers → report → exports → app.
   DISC : monofichier éclaté en 9 fichiers (core/ services/ ui/).
   Dossier SHARED/ créé (02_INFRASTRUCTURE/SHARED/).
```

---

## [BLOC GOUVERNANCE DOCUMENTAIRE — 2026-03-13/15] Sessions structurantes

```
STATUT : VALIDÉ — résumé consolidé

Décisions actives :

1. Roadmap 5 phases validée (D-2026-03-13) :
   Phase 0 : Nettoyage + fondation
   Phase 1 : thesaurus + carnet_bord + objectifs + collab + disc/dork + organisateur/paxis
   Phase 2 : Migration planning → Supabase (chantier critique)
   Phase 3 : Refactoring JS + CDS final
   Phase 4 : Déploiement OVH

2. Documentation prioritaire sur tout code (D-2026-03-13-004) — PERMANENT.

3. Phase 0.1/0.2 faites (orphelins archivés, config.js créé).
   Phase 0.3 reportée (arbitrages disc/dork — sessions dédiées requises).

4. Hallucination CTX_DORK v1.0.0 documentée et corrigée.
   DORK = constructeur requêtes Google Dork. Zéro lien Planning Engine.
   MODULE_DEPENDENCY_MAP v1.1.0 : 3 dépendances hallucinées supprimées.

5. Patch 7 CTX : clauses "INTERDIT Supabase" / "standalone délibéré" purgées.
   CTX_SYSTEM_ARCHITECTURE §3.3 prime sur CTX modules antérieurs.

6. Note profil auteur DC (D=8, C=7) ajoutée NOYAU BLOC 0.
   PERSONAS_BDB V1.3.0 : P0 "Ça ne me concerne pas" + P8 "Le savoir ne se documente pas" ajoutés.
   Règle de voix BDB + section chargement en session ajoutées.
   BLOC 11 NOYAU : règles de validation terrain.

7. Prévisualisation rôles admin (bdb-preview.js) : sessionStorage 'bdb_preview_role'
   (values : 'member' | 'anonymous' | null).
```

---

## D-2026-03-13-001 — Thesaurus → Supabase CRUD complet

```
DATE       : 2026-03-13
MODULE     : thesaurus
DÉCISION   : Migration thésaurus → Supabase.
TABLES     : thesaurus_interventions · thesaurus_protocoles
VOLUME     : 70 361 interventions · 420 protocoles · 2 spécialités · 10 chirurgiens
IMPACT     : Appliquer thesaurus_schema.sql + data SQL avant de toucher au front.
STATUT     : VALIDÉ — session dédiée à planifier
```

---

## D-2026-03-13-002 — disc/dork → persistance Supabase

```
DATE       : 2026-03-13
MODULE     : disc · dork
DÉCISION   : disc et dork persisteront par utilisateur dans Supabase.
IMPACT     : Schéma à arbitrer. Ne pas coder avant arbitrages A2 / A2-dork.
STATUT     : VALIDÉ — schémas EN ATTENTE
```

---

## D-2026-03-13-006 — Planning = chantier critique Phase 2

```
DATE       : 2026-03-13
MODULE     : planning
DÉCISION   : Chantier critique Phase 2, après stabilisation tous autres modules.
             Schéma Supabase à arbitrer par Manu AVANT toute ligne de code.
IMPACT     : planning-schema.js contient 31 membres hardcodés avec UUIDs —
             à aligner avec profiles_directory lors de la migration.
STATUT     : VALIDÉ — arbitrage schéma A1 EN ATTENTE
```

---

## D-2026-03-15-T01 — Connexion Supabase : cloud permanent, local = DR uniquement

```
DATE       : 2026-03-15
MODULE     : ALL — infrastructure
DÉCISION   : Cloud Supabase = environnement permanent dev ET prod.
             Supabase local = dump disaster recovery uniquement.
             config.js n'est plus chargé dans aucun module HTML.
SCOPE      : js/supabase-client.js = seul point de configuration Supabase.
             config.js reste sur disque — activation manuelle DR uniquement.
IMPACT     : Supprimer <script src="../../js/config.js"> de tous les modules.
STATUT     : VALIDÉ
```

---

## D-2026-03-15-T02 — Création bdb-shell.js : shell auth universel

```
DATE       : 2026-03-15
MODULE     : ALL — socle JS
DÉCISION   : js/bdb-shell.js créé — remplace ~90 lignes dupliquées par module.
CONTRAT    : Vérifie session · charge profiles_directory + user_roles (1 seule fois) ·
             expose window.bdbUser = { id, email, prenom, nom, initials, avatar_url, role, isAdmin } ·
             injecte offcanvas + header dans <div id="bdb-shell"> ·
             paramétrage via data-module-title / data-module-icon ·
             gère mode preview (bdb-preview.js)
HORS SCOPE : planning (localStorage), modules non-auth
STATUT     : VALIDÉ — v1.4.0 actif (navigation dynamique)
```

---

## D-2026-03-15-T03 — Exception INTERDIT-17 : cds-overrides.css = scope global délibéré

```
DATE       : 2026-03-15
MODULE     : ALL — architecture CSS
DÉCISION   : 12 règles dans cds-overrides.css exemptées de INTERDIT-17 (décisions design global).
             Figées. Toute modification = entrée JOURNAL_DECISIONS.
RÈGLES : .btn · .btn-sm · .btn-outline-secondary+hover · .modal-content ·
         .modal-header · .modal-title · .modal-body · .modal-footer ·
         .modal-body .card · .card animation · .modal.show animation · .input-group responsive
STATUT     : VALIDÉ
```

---

## D-2026-03-15-T04 — Règle style= : exceptions documentées

```
DATE       : 2026-03-15
MODULE     : ALL — CSS
DÉCISION   : style= inline toléré UNIQUEMENT pour :
             1. Couleurs dynamiques catégories DB (category.color)
             2. Largeurs progress bars dynamiques (style="width:${pct}%")
PATTERNS À CORRIGER (arsenal, fiches, transmissions, anatomie, cours, installation) :
  width:80px;height:60px → cds-thumbnail rounded
  width:90px;height:70px → cds-thumbnail-lg rounded
  width:20px;height:20px;font-size:0.65rem → cds-img-remove-btn
  cursor:pointer → cds-clickable
  font-size:0.6rem → cds-text-micro
STATUT     : VALIDÉ — correction ÉTAPE 4 chantier
```

---

## D-2026-03-15-T05-CORR — pedagogie/ = module BDB embryonnaire (correction T05)

```
DATE       : 2026-03-15
MODULE     : pedagogie
DÉCISION   : pedagogie/ = module BDB réel embryonnaire. Option B validée (intégration BDB admin).
             Pas un "outil CDS égaré". Version BDB perdue lors de sessions précédentes.
LEÇON      : Ne jamais qualifier un fichier d'"erreur"/"égaré" sans confirmation Manu.
STATUT     : CORRIGÉ — CTX v1.1.0
```

---

## D-2026-03-15-T07 — Doctrine modules embryonnaires BDB

```
DATE       : 2026-03-15
MODULE     : ALL — gouvernance
DÉCISION   : Catégorie officielle MODULES EMBRYONNAIRES BDB créée.
RÈGLES :
  1. Pas d'archivage sans décision Manu.
  2. CTX créé AVANT toute session de migration.
  3. CTX documente état dégradé réel + violations + option choisie.
  4. L'IA ne qualifie jamais un embryon d'"erreur" ou d'"égaré".
MODULES :
  pedagogie/ : option B — intégration BDB admin
  ged/       : embryon statique — à créer
  carnet-bord/ : embryon prototype — migrer → carnet_bord/
  objectifs-ide/ : embryon prototype — migrer → objectifs/
RÈGLE PERMANENTE : le doute bénéficie toujours au fichier — signaler, ne pas supprimer.
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-15-T08 — Règle anti-destruction fichiers modules

```
DATE       : 2026-03-15
MODULE     : ALL — gouvernance
DÉCISION   : L'IA ne détruit/écrase/renomme aucun fichier module sans confirmation Manu + entrée JOURNAL.
             Des modules ont été détruits par sessions précédentes (confusion CDS/BDB).
             Doute → signaler, ne pas supprimer.
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-15-T09 — 01_TEMPLATES : templates officiels module BDB

```
DATE       : 2026-03-15
MODULE     : ALL — gouvernance / 01_TEMPLATES
DÉCISION   : 3 templates officiels créés (remplacent tout ce qui précède) :
  TEMPLATE_MODULE_BDB.html  v2.0.0 — template HTML (4 variables)
  TEMPLATE_MODULE_BDB.sql   v2.0.0 — table + 4 RLS standard (1 variable)
  TEMPLATE_CTX_MODULE.md    v2.0.0 — CTX pré-structuré 8 blocs
RÈGLE : Tout nouveau module BDB commence depuis ces 3 fichiers. Jamais de mémoire.
STATUT     : VALIDÉ
```

---

## D-2026-03-15-T10 — Bug flex #bdb-shell : premier enfant de main obligatoire

```
DATE       : 2026-03-15
MODULE     : ALL — architecture HTML
DÉCISION   : #bdb-shell = PREMIER ENFANT de <main>. Jamais frère de <main>.
MOTIF      : body.d-flex colonne flex horizontale → si frère de main : header non sticky.
INTERDIT-E1 créé dans CHANTIER_TECHNIQUE BLOC E.
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-15-T11 — Pattern bouton action primaire admin : toolbar filtres

```
DATE       : 2026-03-15
MODULE     : ALL — modules avec toolbar
DÉCISION   : Bouton action primaire admin TOUJOURS dans la toolbar filtres.
             Slot statique d-none, activé par initFromShell() si isAdmin.
PATTERN :
  <div class="col-12 col-md-auto d-none" id="[module]ToolbarAdminSlot">
    <button class="btn btn-danger w-100" id="btnNew">...</button>
  </div>
INTERDIT-C4 créé. Module référence : anatomie/.
DETTE : cours · transmissions · installation · preferences ⏳
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-15-T12 — Création module CARNET_BORD : CTX v1.0.0 validé

```
DATE       : 2026-03-15
MODULE     : carnet_bord
DÉCISION   : Module carnet_bord actif. CTX v1.0.0 validé. Arbitrages A1→A5 + Q1→Q3 soldés.
TABLES :
  carnet_categories · carnet_items · carnet_progressions (UNIQUE user_id+item_id)
RLS : member SELECT/WRITE WHERE user_id=auth.uid() · admin ALL.
     Aucune lecture croisée entre membres — philosophie permanente.
HORS SCOPE V1 : QCM, gamification, vote pair, URL partage, rappels.
IMPACT : SUPABASE_DATA_MODEL → V13 (3 tables). CTX_CARNET_BORD.md v1.0.0 créé.
STATUT     : VALIDÉ
```

---

## D-2026-03-16-T01 — Migration CDS module ANNUAIRE

```
DATE       : 2026-03-16
MODULE     : annuaire
DÉCISION   : Corrections CDS (module déjà migré shell).
             5 attributs class= dupliqués corrigés. style="cursor:pointer" retiré.
IMPACT     : CHANTIER F.1 — annuaire style= 0 ✅
STATUT     : VALIDÉ
```

---

## D-2026-03-16-T02 — Migration shell module ARSENAL

```
DATE       : 2026-03-16
MODULE     : arsenal
DÉCISION   : Migration complète bdb-shell.js + corrections CDS + bugs.
CORRECTIONS CLÉS :
  - Offcanvas/header/initAuth() supprimés (INTERDIT-B1/B2/B3)
  - #bdb-shell premier enfant main (INTERDIT-E1)
  - await window.bdbShellReady ajouté
  - Pattern C.6 : 3 admin slots toolbar (Materiel/Gants/Casaques)
  - style= thumbnails → cds-thumbnail/cds-img-remove-btn
BUGS CORRIGÉS :
  - ID dupliqué cRenforcee (select filtre vs checkbox form) → cFormRenforcee
  - isAdmin toujours false → await bdbShellReady manquant
IMPACT     : CHANTIER F.1 — arsenal shell ✅ style= 0 ✅
STATUT     : VALIDÉ
```

---

## D-2026-03-16-T03 — Menu navigation dynamique : app_groups + app_modules

```
DATE       : 2026-03-16
MODULE     : SOCLE — bdb-shell.js + portail index.html
DÉCISION   : Navigation BDB → dynamique depuis Supabase (app_groups + app_modules).
ARCHITECTURE :
  5 groupes : bloc · equipe · savoir · pilotage · espace_perso
  20 modules initiaux (18 active · 2 coming_soon)
  Badge Nouveau : is_new + new_until
  Fallback statique si Supabase indisponible
  Filtre visibility admin côté client (RLS garantit côté serveur — D-P6)
RÈGLE PERMANENTE : ajouter un module = INSERT dans app_modules. Zéro code.
IMPACT : bdb-shell.js → v1.4.0 · index.html reconstruit · GUIDE_INTEGRATION_MODULE créé
STATUT     : VALIDÉ
```

---

## D-2026-03-16-T04 — Bug SQL : colonne color manquante dans app_modules

```
DATE       : 2026-03-16
MODULE     : app_modules
DÉCISION   : ALTER TABLE app_modules ADD COLUMN color text NOT NULL DEFAULT '#6c757d'.
             UPDATE par group_key (5 couleurs). Fichier : fix_app_modules_color.sql.
STATUT     : VALIDÉ
```

---

## D-2026-03-16-T05 — Architecture administration BDB

```
DATE       : 2026-03-16
MODULE     : admin/
DÉCISION   : modules/admin/ = surface admin globale unique. Structure cible 4 onglets :
  [existant] Utilisateurs (profiles_directory + user_roles)
  [à créer]  Navigation (app_groups + app_modules CRUD)
  [à créer]  Contenu global (categories + tags + content_types)
  [à créer]  Tableau de bord (santé app, alertes, compteurs)
ARBITRAGES EN ATTENTE : Q1 (4 onglets validés ?), Q2 (simuler vue membre), Q3 (qui modifie app_modules)
SÉQUENCE : SESSION N+1 onglet Navigation → SESSION N+2 Tableau de bord → SESSION N+3 Contenu global
STATUT     : VALIDÉ — arbitrages Q1-Q3 en attente
```

---

## D-2026-03-16-T06 — Standard UX Premium : Skeleton Loaders

```
DATE       : 2026-03-16
MODULE     : ALL
DÉCISION   : Remplacer progressivement spinners par Skeleton Loaders (Bootstrap .placeholder).
             CSS pur, zéro librairie. Application module par module lors des refontes.
PATTERN :
  <div class="placeholder-glow">
    <div class="placeholder col-8 rounded mb-2"></div>
    ...
  </div>
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-16-T07 — Pattern Optimistic Updates (périmètre strict)

```
DATE       : 2026-03-16
MODULE     : ALL
DÉCISION   : Pattern Optimistic Update autorisé sur périmètre fermé :
             cocher phase progression carnet_bord · toggle statut · action binaire réversible sans FK.
INTERDIT-C5 : Jamais sur DELETE, INSERT multi-tables, données critiques, actions multi-tables.
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-16-P5 — Cache sessionStorage app_modules

```
DATE       : 2026-03-16
MODULE     : bdb-shell.js
DÉCISION   : Cache sessionStorage SANS TTL pour app_groups + app_modules.
             Clés : bdb_shell_app_groups · bdb_shell_app_modules
             Invalidation manuelle : sessionStorage.removeItem(clé) après INSERT admin.
IMPACT     : bdb-shell.js → v1.4.1
STATUT     : VALIDÉ
```

---

## D-2026-03-16-P6 — RLS app_modules : filtrage visibility côté serveur

```
DATE       : 2026-03-16
MODULE     : Supabase — app_modules + app_groups
DÉCISION   : RLS filtre sur visibility + rôle. Helper bdb_is_admin() SECURITY DEFINER créé.
             anon → visibility='all' + active
             authenticated → visibility IN ('member','all') OR (admin AND bdb_is_admin())
             écriture → is_admin() uniquement
Fichier SQL : rls_app_modules_visibility_P6.sql
STATUT     : VALIDÉ — SQL à exécuter sur cloud
```

---

## D-2026-03-20-T01 — Standard Résilience Module (C.9) + INTERDIT-C6 + Migration shell fiches

```
DATE       : 2026-03-20
MODULE     : ALL (standard) + fiches (migration)
DÉCISION   : Standard C.9 + INTERDIT-C6 créés. Migration fiches vers bdb-shell.

STANDARD C.9 — 3 règles non négociables :
  1. Toute async DOM → 3 états (loading skeleton / empty / error cdsShowGridError)
  2. escHtml() sur tout innerHTML avec donnée DB (INTERDIT-C6)
  3. Référentiels init → throw + catch centralisé DOMContentLoaded

INTERDIT-C6 : Jamais innerHTML sur donnée Supabase sans escHtml().
  Exceptions : HTML Quill admin-only · chaînes statiques build.

MIGRATION FICHES :
  Offcanvas/header/initAuth() supprimés. Pattern C.6. 10 style= → CDS.
  .btn-ghost → .fiche-btn-ghost. escHtml() sur 15 points injection.
  4 spinners → skeletons. 3 référentiels → throw + catch centralisé.

IMPACT     : CHANTIER_TECHNIQUE → V1.0.6 · CTX_FICHES → V3.1.0
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T03 — Corrections tracker BDB v3

```
DATE       : 2026-03-20
MODULE     : bdb_tracker.html
DÉCISION   : 10 corrections : marqueurs CDS réels (placeholder-glow, cds-error-state),
             emptyState ajouté (C.9 = 3 états), INTERDIT-C6 → error, INTERDIT-B1 ajouté,
             strip commentaires JS (faux positifs onclick), versions gouvernance mises à jour,
             fiches retiré de N+2, règles SESSION_STATE étendues, prompts enrichis.
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T04 — CTX_MINI_SITE → CTX_SITE (renommage convention tracker)

```
DATE       : 2026-03-20
MODULE     : site
DÉCISION   : Renommage CTX_MINI_SITE_V2_0_1.md → CTX_SITE.md.
             Tracker cherche CTX_[NOM_DOSSIER].md → dossier = site/.
             Contenu intégralement conservé. Format TEMPLATE_CTX V1.2.0.
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T05 — CTX_TEMPLATE_VIERGE créé

```
DATE       : 2026-03-20
MODULE     : template-vierge
DÉCISION   : CTX_TEMPLATE_VIERGE.md créé. 0 violation réelle.
             Dettes mineures : spinner au lieu de skeleton (C.7), commentaires v1.3.1.
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T06 — escHtml glossaire.html

```
DATE       : 2026-03-20
MODULE     : site — glossaire.html
DÉCISION   : escHtml() ajouté sur 9 points d'injection innerHTML (CRUD catégories + termes).
             renderTerme · renderFilters · renderCatsList · render (lettre)
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T07 — Sécurisation OVH

```
DATE       : 2026-03-20
MODULE     : infrastructure OVH
DÉCISION   : Sécurisation déploiement OVH Apache.
FICHIERS :
  bdb/.htaccess : HTTPS forcé · Options -Indexes · blocage .md/.sql/.txt/.log/.bak ·
                  headers sécurité (CSP, HSTS, X-Frame-Options, etc.) · gzip
  bdb/00_GOUVERNANCE/.htaccess : Require all denied
  bdb/403.html · bdb/404.html · robots.txt
10 VECTEURS COUVERTS : directory listing, fichiers gouvernance, fichiers cachés,
  admin-test.html, dossiers internes, clickjacking/MIME/XSS, HTTP non chiffré,
  hotlinking, indexation Google, SESSION_STATE.md
NOTE : clé anon Supabase lisible par design. Vraie protection = RLS.
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T08 — Table error_404_logs + page 404 premium

```
DATE       : 2026-03-20
MODULE     : infrastructure + 404.html
DÉCISION   : Table error_404_logs (uuid, requested_url, referrer, user_agent, user_id, created_at).
             RLS : INSERT anon+auth · SELECT admin only.
             Page 404 : 3 niveaux (invité/membre/admin), suggestions contextuelles 14 patterns,
             tracking automatique, progressive enhancement (fonctionne sans JS).
STATUT     : VALIDÉ
```

---

## D-2026-03-20-T09 — Audit sécurité Supabase RLS : 3 arbitrages + fix 4 tables

```
DATE       : 2026-03-20
MODULE     : Supabase RLS
DÉCISION   : Audit complet pg_policies. 4 tables deny-all débloquées.
             etageres (180L) · zones_stockage (30L) · materiel_types (4L) · content_relations (4L)
             → SELECT is_approved() + CRUD is_admin()

ARBITRAGE 1 — transmissions SELECT :
  published → tout approved. Draft → auteur + admin.
  USING ((status='published' AND is_approved()) OR user_id=uid() OR is_admin())

ARBITRAGE 2 — profiles_directory SELECT :
  membres : approved=true OU own profile. Admin : tout.
  USING (is_admin() OR approved=true OR user_id=uid())

ARBITRAGE 3 — content_images INSERT : is_approved() (membres contribuent).
              tag_links DELETE : is_admin() (référentiel contrôlé).
DETTE : table tag_suggestions (workflow proposition → validation admin) — voir T-S01.

IMPACT : AUDIT_SECURITE_BDB → V1.0.0 · SUPABASE_DATA_MODEL → réviser section RLS
STATUT     : VALIDÉ — SQL exécuté sur cloud
```

---

## D-2026-03-21-CTX-TRACKER — Mise à niveau TRACKER_* CTX complexes (lot 1)

```
DATE       : 2026-03-21
MODULE     : GOUVERNANCE — CTX modules
DÉCISION   : Mise à niveau TRACKER_* sur 3 CTX (lot 1).
MODULES    : pedagogie · planning · preferences
VERSIONS : CTX_PEDAGOGIE v1.2.1→v1.2.2 · CTX_PLANNING v1.4.0→v1.5.0 · CTX_PREFERENCES v1.2.0→v1.3.0

RECADRAGES APPLIQUÉS (règle Manu 2026-03-21) :
  - bdb-shell obligatoire sur TOUS les modules sans exception (planning inclus)
  - @latest CDN reclassé VIOLATION ACTIVE sur planning
  - 31 membres hardcodés reclassés VIOLATION ACTIVE sur planning
  - localStorage = dette totale — aucune tolérance documentée
  - Aucune dette "acceptable" — tout écart = VIOLATION ACTIVE

HORS SESSION : CTX_RECUEIL_SITUATION_BLOQUANTE (module Lovable React/TS) — session dédiée.
LOT 2 : CTX_ADMIN · CTX_COURS · CTX_INSTALLATION · CTX_OBJECTIFS_IDE — session suivante.
STATUT     : VALIDÉ
```

---

## D-2026-03-21-S01 — Session Sécurité : corrections dettes D1-D6

```
DATE       : 2026-03-21
MODULE     : SOCLE (bdb-shell.js · fiches · tag_suggestions · OVH)

DETTE 1 — AUTO-LOGOUT 30 MIN (R3-AUTH-03 · S6) :
  bdb-shell.js v1.4.0 → v1.5.0
  _initIdleLogout() : timer 30 min, warning 5 min avant (bannière .bdb-idle-warn).
  Reset sur : click, keydown, scroll, touchstart, mousemove, focus.
  Logout : signOut() + redirect login.html. CSS injecté inline par JS.

DETTE 2 — DOMPURIFY SUR QUILL HTML (R4-XSS-01 · S7) :
  CDN : cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js
  Position : après Quill, avant supabase-client.js
  Fiches : DOMPurify.sanitize(f.description) dans openFicheView() — FAIT
  Cours / Transmissions : BLOQUÉ (fichiers non fournis)

DETTE 3 — BUCKET CONTENT-IMAGES PRIVÉ (R2-STOR-01/03 · S2) :
  Dashboard > Storage > Public = OFF (à faire manuellement).
  SQL : dette3_bucket_storage_policy.sql (MIME restriction INSERT).
  Statut : À EXÉCUTER MANUELLEMENT.

DETTE 4 — SIGNED URL 900s (R2-STOR-04 · S9) :
  Fiches : createSignedUrl(path, 900) — FAIT
  Cours/transmissions/arsenal/anatomie/installation : non audités

DETTE 5 — TABLE TAG_SUGGESTIONS (arbitrage 3 D-2026-03-20-T09) :
  SQL : dette5_tag_suggestions.sql — table + 3 RLS (member_insert, member_select, admin_all).
  UI future : bouton "Proposer ce tag" fiches + file validation admin — session dédiée.
  Statut : SQL À EXÉCUTER MANUELLEMENT.

DETTE 6 — AUDIT CONSOLE.LOG (S13) :
  bdb-shell.js : 4 console.warn techniques, 0 donnée nominative → CLEAN
  fiches : 0 console.log → CLEAN. Autres modules : non audités.

LIVRABLE : CHECKLIST_DEPLOIEMENT_OVH.md v1.0.0 créée.

SCOPE      : js/bdb-shell.js · modules/fiches/index.html · 2 fichiers SQL · 1 checklist
HORS SCOPE : cours · transmissions · arsenal · anatomie · installation (fichiers non fournis)
             UI tag_suggestions (session dédiée)

IMPACT     : bdb-shell.js → v1.5.0 · AUDIT_SECURITE_BDB → V1.1.0 (D1/D2-fiches/D3/D4-fiches/D5/D6 partiels)
             SUPABASE_DATA_MODEL → tag_suggestions à ajouter après exécution SQL
STATUT     : ⚠ PARTIEL — D2/D4 cours+transmissions bloqués
```

---

## D-2026-03-21-T01 — Création module supervision

```
DATE       : 2026-03-21
MODULE     : supervision (nouveau)
DÉCISION   : Module BDB pilotage application — revendable, zéro code pour l'admin.
             Protégé bdb-shell.js + RLS is_admin() uniquement.
             Deux modes : local (File System API + parsing .md) / OVH (Supabase only).
             Fichiers .md de gouvernance = exclusivement locaux, jamais OVH.
             Règles d'audit lues depuis supervision_rules (jamais hardcodées).

TABLES : supervision_config · supervision_rules · supervision_rule_delta · supervision_sessions
RLS : is_admin() SELECT + ALL sur 4 tables.
SEED : 19 règles · 7 versions config.

LIVRABLES :
  CTX_SUPERVISION.md V1.1.0
  supervision_tables.sql + supervision_app_modules.sql
  modules/supervision/index.html (4 onglets : Santé / Conformité / Configuration / Sessions)
  css/supervision-ui.css (100% scopé #supervisionApp)

BUGS CORRIGÉS :
  window.bdbToast() inexistant → showToast() Bootstrap Toast natif
  isAdmin ?? true risque preview → logique hostname stricte
  input[type=file] couvrant l'onglet → corrigé
  loadSante() sans champ id → modale undefined corrigé
  Redirect bloquante admin en local dev → corrigé

DETTES : Responsive mobile non testé · status='active' à activer après checklist 5/5.

IMPACT : app_modules +1 (supervision · coming_soon · admin · pilotage)
         Supabase : 4 tables supervision_*
         JOURNAL → V1.14.0 · CTX_SUPERVISION → V1.1.0
STATUT     : VALIDÉ
```

---

## D-2026-03-21-CLEANUP — Nettoyage fichiers racine remplacés par supervision/

```
DATE       : 2026-03-21
MODULE     : RACINE — fichiers obsolètes
DÉCISION   : Suppression des fichiers racine dont les fonctions sont intégrées
             dans modules/supervision/index.html.
SUPPRIMÉS  : admin-test.html · bdb_tracker.html · bdb_launcher.html
             bdb_manager.html · admin-overview.html · SESSION_STATE.md
             css/overview-ui.css
CONSERVÉS  : admin-bootstrap.html · admin-memo.html (usage dev Manu)
MOTIF      : Fonctions intégrées dans modules/supervision/index.html.
             Doublons fonctionnels confirmés — suppression sans risque.
STATUT     : VALIDÉ
```

---

## D-2026-03-21-PREF — Migration bdb-shell module preferences

```
DATE       : 2026-03-21
MODULE     : preferences
DÉCISION   : Migration complète bdb-shell.js + corrections CDS.
SCOPE      : modules/preferences/index.html · css/preferences-ui.css
CORRECTIONS: 10 violations corrigées :
             E1 (shell premier enfant main)
             B1/B2/B3 (auth/offcanvas/header dupliqués supprimés)
             C2 × 5 (style= inline remplacés classes CDS)
             C4 (slot admin toolbar)
             C6 × 9 (escHtml sur injections innerHTML)
             XSS DOMPurify ajouté
             Spinner → skeleton loader
             APP_CDT (await bdbShellReady)
IMPACT     : CTX_PREFERENCES V1.3.0 → V1.4.0
             TRACKER_STATUS = migré · TRACKER_SHELL = oui · Checklist 4/5
STATUT     : VALIDÉ
```

---

## D-2026-03-21-INST — Migration bdb-shell module installation

```
DATE       : 2026-03-21
MODULE     : installation
DÉCISION   : Migration complète bdb-shell.js + corrections CDS + sécurité.
SCOPE      : modules/installation/index.html · css/installation-ui.css
CORRECTIONS: 12 violations corrigées :
             E1 (shell premier enfant main)
             B1/B2/B3 (auth/offcanvas/header dupliqués supprimés)
             C2 × 8 (style= inline remplacés classes CDS)
             C4 (slot admin toolbar)
             C6 × 21 (escHtml sur injections innerHTML)
             XSS DOMPurify × 2
             BLOC E chaîne JS réordonnée
             S9 signed URLs 900s (D-2026-03-21-S01 D4)
             Spinner → skeleton loader
             Bug B3 (bdbShellReady manquant)
IMPACT     : CTX_INSTALLATION V2.0.0 → V2.1.0
             TRACKER_STATUS = migré · TRACKER_SHELL = oui · Checklist 4/5
STATUT     : VALIDÉ
```

---

## D-2026-03-21-QUILL — Fix Quill-in-modal sur 6 modules

```
DATE       : 2026-03-21
MODULE     : ALL — modules avec éditeur Quill en modale
DÉCISION   : Correction bug Quill collapse dans modal display:none.
BUG        : .ql-editor height:100% s'effondre quand la modale est cachée (display:none).
FIX        : height:auto + minHeight:120px appliqués sur .ql-editor et .ql-container
             via JS post-init (après instanciation Quill, à l'ouverture de la modale).
SCOPE      : anatomie · cours · fiches · installation · preferences · transmissions
ORIGIN     : Bug pré-existant non déclaré — identifié lors des migrations 03-21.
RÈGLE      : Tout nouveau module intégrant Quill dans une modale applique ce fix dès l'init.
STATUT     : VALIDÉ — PERMANENT
```

---

## D-2026-03-22-COURS-01 — Hardening cours/index.html (escHtml + C.9 + fix images)

```
DATE       : 2026-03-22
MODULE     : cours
DÉCISION   : 3 corrections appliquées sur modules/cours/index.html :

1. INTERDIT-C6 — escHtml() ajoutée (12 points d'injection) :
   titre, description, category.label, tags, tag label_display,
   tag type, niveau fallback. Fonction escHtml() déclarée localement.

2. C.9 — throw + catch centralisé :
   loadContentTypeAndCategories() et loadTags() throw on error.
   DOMContentLoaded init → try/catch → cdsShowGridError + return.

3. Bug images — syncImages refactorisé :
   - Position 0-indexed → 1-based (CHECK constraint content_images_position_check)
   - Delete all + re-insert all (élimine 409 Conflict sur unicité position)

SCOPE      : modules/cours/index.html (814 lignes)
HORS SCOPE : cours-ui.css (inchangé) · bdb-shell.js · supabase-client.js

BUGS IDENTIFIÉS MULTI-MODULES :
  - syncImages position 0-indexed + 409 Conflict : confirmé sur fiches,
    probablement tous modules avec content_images.
  - SUPABASE_DATA_MODEL_V1_4_0 content_images : colonnes documentées fausses
    (doc : content_type/url/caption | terrain : content_type_id/storage_path/position/is_dev)
    → mise à jour DATA_MODEL requise.

IMPACT     : CTX_COURS → V2.1.0 · JOURNAL → V1.17.0
             BACKLOG +2 sessions : audit images multi-modules + support PDF/fichiers cours
STATUT     : VALIDÉ
```

---

## D-2026-03-22-ARCHI-01 — Externalisation JS + arborescence module co-localisée

```
DATE       : 2026-03-22
MODULE     : ALL — architecture JS/CSS
DÉCISION   : Double refactoring validé par Manu :

A) EXTERNALISATION JS — fin du monolithique index.html
   Chaque module externalise son JS métier inline vers un fichier [module].js dédié.
   Le HTML ne contient plus que la structure, les modales et les toasts.
   Les fonctions utilitaires dupliquées entre modules sont extraites
   dans des fichiers socle partagés (js/).

B) ARBORESCENCE CO-LOCALISÉE (Option B)
   Le CSS et le JS spécifiques à un module vivent dans le dossier du module.
   Le dossier js/ et css/ racine ne contiennent que le socle partagé.
   Workflow cible : "zip modules/cours/ et on commence".

ARBORESCENCE CIBLE :
  js/                          ← SOCLE PARTAGÉ uniquement
    bdb-shell.js               (existant — auth + nav + header)
    supabase-client.js         (existant — connexion Supabase)
    bdb-preview.js             (existant — preview rôles)
    bdb-utils.js               (NEW — escHtml, showToast, cdsShowGridError, renderGridSkeleton)
    bdb-media.js               (NEW — getSignedUrls, syncImages, renderImagePreviews, handleImageFiles)
    bdb-tags.js                (NEW — loadTags, syncTags, renderTagSelector)
  css/                         ← SOCLE PARTAGÉ uniquement
    cds-overrides.css          (existant)
  modules/[module]/
    index.html                 (HTML pur + <script src="[module].js">)
    [module].js                (JS métier spécifique)
    [module]-ui.css            (CSS métier spécifique)

FICHIERS SOCLE PARTAGÉS — MISSIONS :
  bdb-utils.js :
    escHtml(s)                  — échappement XSS (INTERDIT-C6)
    showToast(msg, type)        — notification Bootstrap Toast
    cdsShowGridError(el, msg, retryFn) — état erreur grille CDS
    renderGridSkeleton(count)   — skeleton loading grille
  bdb-media.js :
    getSignedUrls(bucket, paths, ttl) — URLs signées storage
    syncImages(db, bucket, contentTypeId, recordId, formImages) — sync images DB
    renderImagePreviews(container, images, onRemove) — preview upload
    handleImageFiles(files, max, currentCount) — validation fichiers upload
  bdb-tags.js :
    loadTags(db, types)         — chargement référentiel tags
    syncTags(db, recordId, contentType, tagIds) — sync tags DB
    renderTagSelector(container, allTags, selectedIds, opts) — UI sélecteur tags

CHAÎNE JS BLOC E MISE À JOUR :
  1. Bootstrap JS (CDN)
  2. Supabase JS (CDN)
  3. [Quill/DOMPurify si nécessaire] (CDN)
  4. ../../js/supabase-client.js
  5. ../../js/bdb-utils.js
  6. ../../js/bdb-media.js          (si images)
  7. ../../js/bdb-tags.js           (si tags)
  8. ../../js/bdb-shell.js          (toujours dernier du socle)
  9. [module].js                    (chemin local — pas ../../)

CHAÎNE CSS BLOC E MISE À JOUR :
  1-4. Bootstrap + BI + theme-base + theme-print (CDN — inchangé)
  5.   ../../css/cds-overrides.css   (socle partagé — inchangé)
  6.   [module]-ui.css               (chemin local — plus ../../css/)

PRÉREQUIS :
  - Palier 1 terminé (tous modules sur bdb-shell) — ne pas créer 2 patterns
  - Serveur HTTP local (start-bdb.ps1) — file:// abandonné pour le dev
  - Session dédiée documentée et arbitrée

CONTRAINTES :
  - Pas de bundler/build tool
  - Pas de ES modules (import/export) — scripts classiques <script src>
  - Pas de Node/npm
  - Chaque fichier = 1 <script> dans le HTML
  - FTP OVH : ce qui est uploadé = ce qui tourne
  - Migration module par module (pas de big bang)

MIGRATION PAR MODULE (4 étapes) :
  1. Déplacer css/[module]-ui.css → modules/[module]/[module]-ui.css
  2. Extraire <script> inline → modules/[module]/[module].js
  3. Remplacer les fonctions dupliquées par appels aux fichiers socle
  4. Mettre à jour <link> et <script src> dans index.html

INTERDITS :
  - INTERDIT-JS-01 : Plus aucun JS métier inline dans index.html après migration
  - INTERDIT-JS-02 : Jamais de fonction dupliquée si elle existe dans un fichier socle
  - INTERDIT-JS-03 : Jamais de fichier module dans js/ ou css/ racine (socle uniquement)

SCOPE      : Architecture cible — aucun fichier modifié dans cette décision
HORS SCOPE : Exécution (session dédiée post-Palier 1)

IMPACT     : CHANTIER_TECHNIQUE → section BLOC E à mettre à jour
             GUIDE_INTEGRATION_MODULE → chaîne JS/CSS à réviser
             TEMPLATE_MODULE_BDB → à mettre à jour
             Tous les CTX modules → chemin CSS/JS à mettre à jour post-migration
STATUT     : VALIDÉ — exécution post-Palier 1
```

---

## D-2026-03-22-TRANS-01 — Hardening transmissions + résolution Bug B2 tags

```
DATE       : 2026-03-22
MODULE     : transmissions
DÉCISION   : 6 corrections appliquées sur transmissions/index.html + transmissions-ui.css :

1. Bug B2 RÉSOLU — 3 causes empilées :
   a) Colonne `locked` inexistante → corrigé en `is_locked` (code)
   b) 33 tags avec is_locked=true → UPDATE tags SET is_locked=false (données)
   c) syncTags silencieux → diagnostic console.warn ajouté

2. Bug images — position 1-based :
   - uploadImageFile : position = state.formImages.length + 1
   - saveTransmission UPDATE path : delete-all/re-insert-all (fix 409 Conflict)
   - saveTransmission INSERT path : position idx + 1

3. C.9 — throw + catch centralisé :
   - loadContentTypeId() et loadCategories() → throw on error
   - loadTags() → console.warn + return (pas throw — Bug B2 ne doit pas crasher le module)
   - DOMContentLoaded init → try/catch → cdsShowGridError + return

4. CSS — APP_CDT → BDB dans commentaire transmissions-ui.css

5. CSS — trans-avatar-img manquant ajouté (40x40px object-fit cover)

6. CSS — trans-img-preview renforcé (min-width/max-width/max-height)

DONNÉES CORRIGÉES :
  UPDATE tags SET is_locked = false;   — 33 lignes (héritage Lovable)

DATA_MODEL DETTES IDENTIFIÉES :
  - tags : doc dit `locked`, terrain dit `is_locked`
  - content_images : doc dit content_type/url/caption, terrain dit content_type_id/storage_path/position/is_dev
  → mise à jour SUPABASE_DATA_MODEL requise (session dédiée)

SCOPE      : modules/transmissions/index.html · css/transmissions-ui.css
HORS SCOPE : bdb-shell.js · supabase-client.js · schéma Supabase (sauf UPDATE données)

IMPACT     : CTX_TRANSMISSIONS → V1.5.0 · JOURNAL → V1.18.0
             Bug B2 = RÉSOLU (ne bloque plus la qualification premium)
STATUT     : VALIDÉ
```

---

## D-2026-03-22-CSS-01 — Création CDS_REFERENCE.md + cds-overrides v1.6.0

```
DATE       : 2026-03-22
MODULE     : ALL — gouvernance CSS
DÉCISION   : Création CDS_REFERENCE.md — référentiel unique classes CSS BDB.
             Mise à jour cds-overrides.css v1.5.0 → v1.6.0 (corrections audit).

CONTEXTE :
  Cause racine des hallucinations CSS modules identifiée :
  3 couches CSS (theme-base.css CDN · cds-overrides.css · Bootstrap 5.3)
  sans référence unifiée consultable. Résultat : chaque session module
  réinvente des classes existantes (.avatar-sm, .skeleton, @keyframes shimmer...).

CDS_REFERENCE.md :
  Fichier unique dense listant toutes les classes disponibles par couche.
  Emplacement cible : 00_GOUVERNANCE/CDS_REFERENCE.md (à uploader dans Project Knowledge).
  Contenu : variables --ds-*, classes theme-base / cds-overrides / BS natif,
            table avatars unifiée, conflits connus, checklist pré-génération CSS,
            règles de nommage module.

cds-overrides.css v1.6.0 — corrections appliquées :
  RISQUE-01 : .card { animation } scopé → .cds-card-animated (était global sur toutes .card)
  DUP-01    : .header-sticky dupliqué fusionné (v1.0.0 @media + v1.2.0 global → 1 définition)
  DUP-02    : .cds-sync-dot supprimé → .bdb-sync-dot (version complète avec border-radius + bg)
  DUP-03    : flex-shrink:0 ajouté à .cds-avatar-lg (cohérence avec .cds-stat-icon)
  RISQUE-03 : object-fit:contain ajouté à .cds-lightbox-img-80
  INC-03    : .cds-toast créé comme classe pérenne, #toastInfo conservé compat
  BS-OPT-01 : opacity:.6 → .5 sur .cds-error-icon (aligné BS .opacity-50)
  DETTE     : --pe-* → --cds-* reporté Phase 3 (CSS-DETTE-01)

RÈGLE PERMANENTE :
  Toute IA générant du CSS ou HTML dans BDB charge CDS_REFERENCE.md
  AVANT d'écrire la moindre classe dans un [module]-ui.css.
  Ordre de vérification : theme-base → cds-overrides → Bootstrap → créer si absent.

IMPACT     : GUIDE_TRAVAIL_SESSION → V1.2.2 (BLOC 1, 2, 5, 6, 9)
             TEMPLATE_CTX_MODULE → V1.2.0 (BLOC 7)
             BACKLOG_SESSIONS → V2.5.0 (session #7 CSS audit + script Python)
             00_GOUVERNANCE/ : CDS_REFERENCE.md à ajouter
STATUT     : VALIDÉ — PERMANENT
```

---

## 2026-03-22 — Nettoyage CSS complet

DATE       : 2026-03-22
MODULE     : CSS / CDS
DECISION   : Nettoyage CSS — 420 corrections sur 950 selecteurs audites
MOTIF      : Doublons CDS, classes non-scopees, :root/body/* globaux, keyframes sans prefixe, style inline
SCOPE      : P1 (admin-test, index, paxis), P2 (admin, disc, planning), P3 (annuaire, login, admin-bootstrap), dashboard inline externalise
HORS SCOPE : Deplacement CSS dans dossiers modules (session suivante)
IMPACT     : 20 fichiers modifies (CSS + HTML + JS), .cds-eye-wrap promu dans CDS, exception Quill documentee, dashboard-ui.css cree, planning 35 classes prefixees plan-*, INTERDIT-17 corrige sur .card.border-primary-subtle
RESULTAT   : 0 violation P1, 0 violation P2, 0 violation P3
STATUT     : TERMINE — reste deplacement CSS dans modules/

---

## 2026-03-22 — Strategie modules poids lourds

DATE       : 2026-03-22
MODULE     : Planning / Thesaurus / Modules localStorage
DECISION   : Reporter la correction des modules poids lourds apres stabilisation de 80% de l'app
MOTIF      : Les modules conformes (annuaire, arsenal, fiches, admin, transmissions) serviront de gabarit pour corriger les modules complexes. Corriger planning en aveugle = perte de tokens et risque de casse.
SCOPE      : Planning (11 HTML, 0 Supabase, doublon index/dashboard), Thesaurus, modules localStorage
HORS SCOPE : Arbitrage A1 Supabase planning (decision Manu distincte)
IMPACT     : Sessions dediees par module lourd, utilisant les modules propres comme reference
RESULTAT   : Backlog mis a jour
STATUT     : PLANIFIE
