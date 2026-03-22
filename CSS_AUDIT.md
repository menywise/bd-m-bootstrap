# CSS AUDIT — Bible de Bloc
Date : 2026-03-22
Source vérité : `03_CDS_REFERENCE_V1_0_0.md` (theme-base v1.4 + cds-overrides v1.6.0 + Bootstrap 5.3.2)

---

## Synthese

| Métrique | Valeur |
|---|---|
| Fichiers audités | 27 |
| Sélecteurs analysés | ~950 (estimé, includes pseudo-classes/elements) |
| **DOUBLON** | 14 |
| **NON-SCOPE** | 152 |
| **CONFLIT** | 37 |
| **GLOBAL** | 43 |
| **OK** | ~704 |

> **Fichiers les plus critiques :** `admin-test-ui.css` (migration inline incomplète), `paxis-ui.css` (extraction Lovable non nettoyée), `disc-ui.css` (nombreuses classes sans préfixe), `planning-ui.css` (batch modals non scopées), `index-ui.css` (redéfinit des classes CDS shell).

---

## Detail par fichier

---

### css/planning-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#matrixGrid table td` | OK | Scopé ID |
| `#matrixGrid .bg-couloir/closed/opening/visceral` | OK | Scopés, classes métier figées |
| `#legacyTableCard tbody tr.row-*` | OK | Scopés ID |
| `.slot-line-ouverture` | NON-SCOPE | Pas de préfixe module — devrait être `.plan-slot-ouverture` |
| `.slot-line-doublure` | NON-SCOPE | Idem |
| `.slot-line-visceral` | NON-SCOPE | Idem |
| `#modalCloseSalles .modal-header` | CONFLIT | `.modal-header` appartient à cds-overrides — ne pas redéfinir dans un module |
| `#modalCloseSalles .modal-footer` | CONFLIT | Idem `.modal-footer` |
| `#modalCloseSalles .cs-legend-item` | NON-SCOPE | Préfixe `.cs-` ≠ préfixe module `.plan-` |
| `.cs-swatch-open` | NON-SCOPE | Global, sans scope, préfixe incorrect |
| `.cs-swatch-filled` | NON-SCOPE | Idem |
| `.cs-swatch-closed` | NON-SCOPE | Idem |
| `.cs-swatch-selected` | NON-SCOPE | Idem |
| `.card.border-primary-subtle .card-header` | GLOBAL | `.card` est une classe CDS — cible globale non scopée |
| `.doublure-block` | NON-SCOPE | Pas de préfixe module |
| `.bg-etudiant-subtle` | NON-SCOPE | Imite le pattern `.bg-*` Bootstrap sans scope |
| `.text-etudiant` | NON-SCOPE | Imite `.text-*` Bootstrap sans scope |
| `.batch-table th/td/.row-label` | NON-SCOPE | Pas de préfixe `.plan-` |
| `.col-am-inner/.col-am-check/.col-am-select` | NON-SCOPE | Pas de préfixe module (3 classes) |
| `.col-soir-inner/.col-soir-select` | NON-SCOPE | Idem (2 classes) |
| `.soir-fermee .col-soir-select` | NON-SCOPE | Idem |
| `.couloir-row-inner` | NON-SCOPE | Idem |
| `.visceral-check-label/.ouverture-check-label/.nuit-check-label` | NON-SCOPE | Idem (3 classes) |
| `.batch-section-header/.batch-section-sep` | NON-SCOPE | Idem (2 classes) |
| `.salle-group/.salle-group-header` | NON-SCOPE | Idem (2 classes) |
| `.salle-group-header .salle-badge` | NON-SCOPE | Idem |
| `.role-row-label/.role-row-label.instru/.panseur` | NON-SCOPE | Idem (3 classes) |
| `.ide-role-separator` | NON-SCOPE | Idem |
| `.batch-jour-saved` | NON-SCOPE | Idem |
| `.batch-creneau-ferme` | NON-SCOPE | Idem |
| `.batch-doublure-row td` | NON-SCOPE | Idem |
| `.batch-doublure-btn-row td` | NON-SCOPE | Idem |
| `.batch-btn-add-doublure` | NON-SCOPE | Idem |
| `.table-min-planning` | NON-SCOPE | Suffixe module ≠ préfixe — devrait être `.plan-table-min` |
| `.batch-th-note/.batch-th-role-label` | NON-SCOPE | Pas de préfixe module (2 classes) |

---

### css/admin-bootstrap-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.admin-bg` | OK | Préfixe module lisible |
| `.ab-card/.ab-icon-wrap/.ab-*` | OK | Préfixe `.ab-` cohérent (12 classes) |
| `.input-eye-wrap` | NON-SCOPE | Pas de préfixe module — dupliqué aussi dans login-ui.css |
| `.input-eye-wrap .form-control` | NON-SCOPE | Idem |
| `.btn-eye-sm` | NON-SCOPE | Pas de préfixe `.ab-` |
| `.env-btn.active` | NON-SCOPE | Pas de préfixe module |

---

### css/login-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.login-bg/.login-card/.login-icon-wrap` | OK | Préfixe `.login-` |
| `.login-tabs/.login-tabs .nav-link` | OK | Scopé à `.login-tabs` |
| `.login-card .form-label` | OK | Scopé à `.login-card` |
| `.input-eye-wrap` | NON-SCOPE | Pas de préfixe module — dupliqué dans admin-bootstrap-ui.css |
| `.input-eye-wrap .form-control` | NON-SCOPE | Idem |
| `.btn-eye` | NON-SCOPE | Pas de préfixe `.login-` |
| `.login-card .btn-primary` | CONFLIT | `.btn-primary` existe dans theme-base — valeurs surchargées dans scope |
| `.password-hint` | NON-SCOPE | Pas de préfixe module |
| `.btn-demo` | NON-SCOPE | Idem |
| `.alert-login` | NON-SCOPE | Idem |
| `.btn-forgot` | NON-SCOPE | Idem |
| `.btn-back` | NON-SCOPE | Idem |
| `.forgot-back` | NON-SCOPE | Idem |
| `.admin-hint` | OK | Classe utilitaire contextuelle acceptable |

---

### css/collab-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.collab-menu-btn/.collab-emoji-sm/.collab-emoji-lg` | OK | Préfixe `.collab-` |
| `.collab-col-rank/.collab-col-votes/.collab-col-pct/.collab-col-note` | OK | Idem |

---

### css/profile-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.profile-avatar` | OK | Préfixe `.profile-`, taille non dupliquée en CDS |
| `.profile-avatar-img` | OK | Idem |
| `.profile-avatar-edit-btn` | OK | Idem |

---

### css/admin-test-ui.css

> **Fichier critique** — contient une migration incomplète de `<style>` inline. La seconde moitié du fichier (~ligne 160+) est un bloc legacy non nettoyé avec de nombreuses règles globales et doublons.

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.diag-section-title/.diag-row/.diag-nav/...` (bloc 1) | OK | Préfixe `.diag-` |
| `@keyframes diagPulse/@keyframes diagSpin` (bloc 1) | OK | Préfixe module conforme |
| `.diag-spin/.diag-container` | OK | Préfixe module |
| `:root { --bg: ...; --surface: ...; }` | GLOBAL | Variables CSS définies globalement — doivent être scopées au conteneur |
| `* { box-sizing: border-box; margin: 0; padding: 0; }` | GLOBAL | Reset universel — écrase Bootstrap globalement |
| `body { background: ...; font-family: ...; }` | GLOBAL | Sélecteur natif non scopé |
| `.diag-layout` | DOUBLON | Défini 2× : `display:flex` (bloc 1) et `display:grid` (bloc legacy) — valeurs différentes |
| `.diag-nav` | DOUBLON | Défini 2× avec styles différents |
| `.diag-nav-section` | DOUBLON | Défini 2× |
| `.diag-nav-item` | DOUBLON | Défini 2× avec valeurs différentes |
| `.diag-main` | DOUBLON | Défini 2× |
| `.diag-panel` | DOUBLON | Défini 2× |
| `.diag-section-title` | DOUBLON | Défini 2× |
| `.diag-schema-table` | DOUBLON | Défini 2× |
| `.diag-col-ok/.diag-col-missing/.diag-col-extra` | DOUBLON | Chacun défini 2× (valeurs identiques) |
| `.diag-log` | DOUBLON | Défini 2× — backgrounds différents (`var(--bs-dark)` vs `#010409`) |
| `.diag-row` | DOUBLON | Défini 2× avec grid-template-columns différents |
| `.diag-topbar` | NON-SCOPE | Pas scopé au conteneur module |
| `.diag-topbar h1` | GLOBAL | Sélecteur `h1` dans classe non scopée |
| `.badge-env` | NON-SCOPE | Pas de préfixe `.diag-` |
| `.top-right` | NON-SCOPE | Nom générique sans préfixe module |
| `.btn-run/.btn-run:hover/.btn-run:disabled` | NON-SCOPE | Pas de préfixe module |
| `#globalStatus` | OK | ID scopé |
| `.nav-item.active` | GLOBAL | `.nav-item` est une classe Bootstrap — ciblée globalement |
| `.nav-dot.ok/.warn/.fail/.running` | NON-SCOPE | Pas de préfixe `.diag-` |
| `.progress-bar` | GLOBAL | Classe Bootstrap `.progress-bar` redéfinie globalement |
| `.progress-fill` | NON-SCOPE | Pas de préfixe module |
| `@keyframes pulse` | GLOBAL | Keyframe sans préfixe — conflict potentiel avec Bootstrap |
| `@keyframes spin` | GLOBAL | Idem — doublon de `diagSpin` déjà défini |
| `.panel.active` | GLOBAL | `.panel` sans scope — conflict avec `.site-module .panel` |
| `.diag-group/.diag-group-header` | NON-SCOPE | Dans bloc legacy, sans scope parent |
| `.test-detail.ok/.fail/.warn` | NON-SCOPE | Pas de préfixe `.diag-` |
| `.diag-badge-ok/.fail/.warn/.skip/.run` | NON-SCOPE | Dans bloc legacy sans scope |
| `.diag-summary/.diag-stat` | NON-SCOPE | Idem |
| `.diag-stat-ok/.fail/.warn` | NON-SCOPE | Idem |
| `.log-line.ok/.fail/.warn/.info/.head` | NON-SCOPE | Pas de préfixe module |

---

### css/organisateur-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.org-grip` | OK | Préfixe `.org-` |
| `.phase-item` | NON-SCOPE | Pas de préfixe `.org-` |
| `.phase-item.dragging/.phase-item:hover` | NON-SCOPE | Idem |
| `.phase-num` | NON-SCOPE | Idem |
| `.export-box/.export-box.active` | NON-SCOPE | Nom générique sans préfixe |
| `.add-phase-form/.add-phase-form.active` | NON-SCOPE | Idem |

---

### css/disc-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.disc-sidebar/.disc-nav-link/.disc-main/.disc-*` | OK | Préfixe `.disc-` cohérent (~25 classes) |
| `.vakog-badge-V/A/K/O/G` | OK | Préfixe `.vakog-` acceptable (module DISC) |
| `.pole-card` | CONFLIT | Existe dans theme-base CDS — `.pole-card` redéfini avec hover différent |
| `.pole-card:hover` | CONFLIT | Idem |
| `.persona-card/.persona-card:hover` | NON-SCOPE | Pas de préfixe `.disc-` |
| `.scenario-card/.scenario-card.selected` | NON-SCOPE | Idem |
| `.chip-at-base/.chip-at-stress` | NON-SCOPE | Préfixe `.chip-` ≠ préfixe module `.disc-` |
| `.chip-se/.chip-meta/.chip-vakog-primary` | NON-SCOPE | Idem (3 classes) |
| `.pos-pp/.pos-pm/.pos-mp/.pos-mm` | NON-SCOPE | Pas de préfixe `.disc-` (4 classes) |
| `.bascule-item/.debrief-item/.recadrage-item` | NON-SCOPE | Idem (3 classes) |
| `.perso-chip` | NON-SCOPE | Idem |
| `.export-textarea` | NON-SCOPE | Nom générique sans préfixe |
| `.test-option/.test-option.selected` | NON-SCOPE | Pas de préfixe `.disc-` |
| `.test-progress-bar` | NON-SCOPE | Idem |
| `.result-bar-D/.result-bar-I/.result-bar-S/.result-bar-C` | NON-SCOPE | Idem (4 classes) |
| `.result-bar-V/.result-bar-A/.result-bar-K` | NON-SCOPE | Idem (3 classes) |
| `.result-card-winner` | NON-SCOPE | Idem |
| `.preview-console` | NON-SCOPE | Nom générique sans préfixe |
| `.tag-input-container/.tag-item/.tag-input-field` | NON-SCOPE | Pas de préfixe module (3 classes) |
| `.filter-pill/.filter-pill.active-filter` | NON-SCOPE | Idem — dupliqué dans annuaire-ui comme `.filter-chip` |

---

### css/paxis-ui.css

> **Fichier critique** — extraction Lovable non nettoyée. La moitié du fichier est une migration de `<style>` embarqué.

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.paxis-role-card/.paxis-complete-icon/.paxis-badge-*` | OK | Préfixe `.paxis-` (4 classes) |
| `.paxis-section/.paxis-progress-fill` | OK | Idem |
| `:root { --paxis-bg: ...; }` | GLOBAL | Variables à `:root` — devraient être scopées (ex: `#paxisApp { --paxis-* }`) |
| `.hero-minimal` | NON-SCOPE | Pas de préfixe `.paxis-` |
| `.hero-minimal h1` | GLOBAL | Sélecteur `h1` dans classe non scopée |
| `.hero-minimal .lead` | NON-SCOPE | Idem |
| `.principes-list` | NON-SCOPE | Pas de préfixe module |
| `.principes-list li` | GLOBAL | Sélecteur `li` dans classe non scopée |
| `.question-card/.question-card.type-*` | NON-SCOPE | Pas de préfixe `.paxis-` (6 classes) |
| `.question-meta/.question-badge/.question-text` | NON-SCOPE | Idem (3 classes) |
| `.badge-exploration/.badge-clarification/.badge-tension` | NON-SCOPE | Idem (3 classes) |
| `.badge-criticite/.badge-informel` | NON-SCOPE | Idem |
| `.response-area/.response-options` | NON-SCOPE | Pas de préfixe module |
| `.response-options label` | GLOBAL | Sélecteur `label` dans classe non scopée |
| `.progress-bar-paxis .fill` | NON-SCOPE | `.fill` sans préfixe dans classe parente |
| `.history-item/.history-item.answered/.skipped` | NON-SCOPE | Pas de préfixe `.paxis-` (3 classes) |
| `.history-question/.history-response` | NON-SCOPE | Idem |
| `.export-preview` | NON-SCOPE | Nom générique sans préfixe |
| `.role-selector/.role-btn/.role-btn.active` | NON-SCOPE | Idem (3 classes) |
| `.nav-buttons` | NON-SCOPE | Très générique, pas de préfixe |
| `.stats-grid` | NON-SCOPE | Idem |
| `.stat-card/.stat-value/.stat-label` | NON-SCOPE | Pas de préfixe module (3 classes) |

---

### css/dork-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#dorkApp { --dk-* }` | OK | Variables scopées au conteneur |
| `#dorkApp .dk-col-sidebar/.dk-col-workspace` | OK | Scopé + préfixe |
| `.dk-sidebar-inner/.dk-section/.dk-*` (reste) | OK | Préfixe `.dk-` cohérent — non wrappés dans `#dorkApp` mais préfixe présent (~55 classes) |
| `@keyframes dk-blink/.dk-flash/.dk-toast-in` | OK | Préfixe keyframe conforme |
| `#modalProfile .form-control:focus` | OK | Scopé à ID modal |

---

### css/site-ui.css

> Note : toutes les règles sont scopées à `.site-module`. Les conflits sont des **overrides intentionnels** dans le scope du module.

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.site-module { --site-* }` | OK | Variables scopées au container |
| `.site-module .site-*` (stepper, hero, circle, etc.) | OK | Préfixe `.site-` dans scope (~15 classes) |
| `.site-module .panel/.panel-accent-*/.panel-limit/.panel-approach` | OK | Nouveau composant spécifique module |
| `.site-module .header-sticky` | CONFLIT | `.header-sticky` dans theme-base — valeurs différentes (même scopé) |
| `.site-module .doc-header-primary` | CONFLIT | `.doc-header-primary` dans theme-base — gradient différent |
| `.site-module .alert-danger/.alert-warning/.alert-success/.alert-secondary/.alert-info` | CONFLIT | Classes alert dans theme-base/CDS — couleurs différentes (5 classes) |
| `.site-module .progress` | CONFLIT | `.progress` Bootstrap — height et background redéfinis |
| `.site-module .progress-bar` | CONFLIT | `.progress-bar` Bootstrap — redéfini |
| `.site-module .nav-tabs/.nav-tabs .nav-link` | CONFLIT | Bootstrap nav-tabs — redéfinis (2 classes) |
| `.site-module .accordion-item/.accordion-button/.accordion-body` | CONFLIT | Bootstrap accordion — redéfinis (3 classes) |
| `.site-module .table/.table thead th/.table td` | CONFLIT | Bootstrap table — redéfinis (3 classes) |
| `.site-module .list-group-item` | CONFLIT | Bootstrap — redéfini |
| `.site-module .badge` | CONFLIT | Bootstrap/CDS — redéfini |
| `#adoptionBars .site-bar-w3/w14/w34/w16` | OK | Scopé ID + préfixe |

---

### css/thesaurus-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#thesaurusTabs` | OK | Scopé ID |
| `.thes-thead-sticky th` | GLOBAL | Sélecteur `th` (élément natif) dans classe scopée |
| `.thes-col-*` (6 classes) | OK | Préfixe `.thes-` |
| `.kpi-value` | NON-SCOPE | Pas de préfixe `.thes-` |
| `.kpi-label/.kpi-sub` | NON-SCOPE | Idem (2 classes) |
| `.thes-badge-ortho/.traumato/.septique/.neuro/.exclus` | OK | Préfixe conforme |
| `.thes-pareto-critique/.standard/.secondaire/.rare` | OK | Idem |
| `.thes-badge-sacred/.thes-badge-sacred-inline` | OK | Idem |
| `.thes-tag/.thes-source-item/.thes-heatmap-*` | OK | Idem |
| `.bar-track` | NON-SCOPE | Pas de préfixe `.thes-` |
| `.bar-fill` | NON-SCOPE | Idem |
| `.thes-drop-zone/.thes-import-log` | OK | Préfixe conforme |
| `.thes-ai-btn/.thes-admin-alert/.thes-quality-bar` | OK | Idem |
| `#editLibelleCible[readonly], etc.` | OK | Scopé IDs |

---

### css/admin-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#tabUsers .badge-membre/.badge-invite` | OK | Scopés, absents du CDS |
| `#tabUsers .badge-approved/.badge-pending` | OK | Scopés |
| `#tabUsers .badge-admin` | CONFLIT | `.badge-admin` dans CDS = "Rouge plein". Ici `#1e40af` (bleu) — valeurs différentes |
| `#adminApp .avatar-sm` | CONFLIT | `.avatar-sm` dans theme-base = 32×32px. Ici 36×36px — valeur différente |
| `#adminApp .skeleton` | CONFLIT | `.skeleton` dans theme-base — keyframe `shimmer` ≠ `skeleton-loading`. CDS note : "renommer `admin-shimmer`" |
| `@keyframes shimmer` | CONFLIT | Devrait être `@keyframes admin-shimmer` per CDS CONFLITS CONNUS |
| `#tabDashboard .stat-card-value/.stat-card-sub` | OK | Scopés |
| `#tabCategories .color-swatch` | OK | Scopé |
| `#modalCategorie .color-picker-btn.selected/.cat-preview-circle` | OK | Scopés |
| `#tabTags .tag-type-badge` | OK | Scopé |
| `#tabClassifications .zone-icon` | OK | Scopé |
| `#adminApp .danger-zone-card/.table-responsive-wrap` | OK | Scopés |
| `#adminApp .admin-col-check/.admin-col-action` | OK | Scopés + préfixe |
| `#modalCreateUser .avatar-upload-zone` | OK | Scopé |

---

### css/admin-memo-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.memo-body/.memo-section/.memo-*` (toutes) | OK | Préfixe `.memo-` cohérent, ~25 classes, zéro règle globale |

---

### css/overview-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.bdb-module-card` | CONFLIT | Même nom que dans `index-ui.css` avec styles différents — collision inter-fichiers |
| `.bdb-phase/.bdb-ano-card/.bdb-principe` | OK | Préfixe `.bdb-` |
| `.bdb-stat-num/.bdb-stat-lbl/.bdb-layer*/.bdb-sep` | OK | Idem |
| `.bdb-doc-card.doc-primary/.bdb-doc-title` | OK | Idem |
| `.badge-purple` | NON-SCOPE | Pas de préfixe `.bdb-` — devrait être `.bdb-badge-purple` |
| `.text-purple` | NON-SCOPE | Idem |
| `@media print { .bdb-module-header { display:none } }` | OK | Classe CDS visée en print dans scope intentionnel |
| `@media print { .btn-outline-secondary { display:none } }` | GLOBAL | Classe Bootstrap ciblée globalement en @media print |

---

### css/annuaire-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.annuaire-hero` | OK | Préfixe `.annuaire-` |
| `@keyframes shimmer` | NON-SCOPE | Devrait être `@keyframes ann-shimmer` — conflit avec admin-ui.css |
| `.skeleton-box` | NON-SCOPE | Pas de préfixe `.annuaire-` (`.skeleton` existe en CDS — nom voisin) |
| `.avatar-circle` (l.24, 68px) | NON-SCOPE | Pas de préfixe module — `.avatar` existe en CDS |
| `.avatar-circle` (l.115, 72px) | DOUBLON | Redéfini dans le même fichier — override 68px→72px |
| `.avatar-circle img` | GLOBAL | Sélecteur `img` dans classe non scopée |
| `.avatar-circle-lg/.avatar-circle-upload` | NON-SCOPE | Pas de préfixe `.annuaire-` |
| `.member-card/.member-card:hover/.member-card::before` | NON-SCOPE | Pas de préfixe module |
| `.member-card-anim` | NON-SCOPE | Idem |
| `@keyframes cardIn` | NON-SCOPE | Sans préfixe — doublon avec `index-ui.css` (même nom, même animation) |
| `.mc-medecin/.mc-cadre/.mc-infirmier/.mc-aide` | NON-SCOPE | Préfixe `.mc-` non documenté comme préfixe annuaire |
| `.filter-chip/.filter-chip.active` | NON-SCOPE | Pas de préfixe module — conflit de concept avec `.filter-pill` dans disc-ui |
| `.search-wrapper` | NON-SCOPE | Générique, pas de préfixe — `.cds-search-input` existe en CDS |
| `.search-icon` | NON-SCOPE | Idem |
| `.search-wrapper input` | GLOBAL | Sélecteur `input` dans classe non scopée |
| `.link-equipment` | NON-SCOPE | Pas de préfixe module |
| `.pref-item` | NON-SCOPE | Collision de nom avec `preferences-ui.css` (styles différents) |
| `.members-grid` | NON-SCOPE | Pas de préfixe module |
| `.annuaire-name-text/.annuaire-date-text/.annuaire-label-xs` | OK | Préfixe conforme |
| `.annuaire-detail-label/.annuaire-skeleton-*/.annuaire-avatar-remove-btn` | OK | Idem |

---

### css/anatomie-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.anat-card/.anat-icon-wrap/.anat-desc/.anat-card-menu` | OK | Préfixe `.anat-` |
| `.anat-card-accent/.anat-upload-zone/.anat-view-img/.anat-quill-editor` | OK | Idem |
| `#aQuill .ql-toolbar/#aQuill .ql-container` | OK | Scopé ID |
| `.ql-editor h2` | GLOBAL | Sélecteur `h2` dans classe Quill non scopée au module |
| `.ql-editor h3` | GLOBAL | Idem |

---

### css/index-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `:root { --bdb-header-h: 64px; --c-planning: ...; }` | GLOBAL | Variables définies globalement — devraient être dans `#indexApp` ou similaire |
| `body { background: #f0f4f8; font-family: ...; }` | GLOBAL | Sélecteur natif `body` |
| `.bdb-header/.bdb-logo-wrap/.bdb-hero/.bdb-content` | OK | Préfixe `.bdb-` |
| `.bdb-modules-grid/.bdb-module-card/.bdb-module-icon-wrap` | OK | Idem |
| `.bdb-module-card` | CONFLIT | Même nom dans overview-ui.css avec styles différents — collision inter-fichiers |
| `.badge-admin` | CONFLIT | `.badge-admin` dans CDS = "Rouge plein". Ici `background: #1a2332` (navy) |
| `.bdb-user-menu` | CONFLIT | Défini dans cds-overrides — redéfini ici avec position, border-radius, min-width différents |
| `.bdb-user-menu.open` | CONFLIT | Idem |
| `.bdb-user-menu-header/.bdb-user-menu-name/.bdb-user-menu-email` | CONFLIT | Idem (dans le scope de bdb-shell) (3 classes) |
| `.bdb-user-menu-item` | CONFLIT | `.bdb-user-menu-item` dans CDS — redéfini |
| `.bdb-menu-sep` | CONFLIT | `.bdb-menu-sep` dans CDS — redéfini |
| `.bdb-preview-submenu` | CONFLIT | `.bdb-preview-submenu` dans CDS — redéfini |
| `@keyframes cardIn` | NON-SCOPE | Sans préfixe — doublon avec annuaire-ui.css (même nom) |
| `@keyframes bdb-shimmer` | OK | Préfixe conforme |
| `.bdb-stat-pill/.bdb-stat-value/.bdb-stat-label/.bdb-stat-icon` | OK | Préfixe `.bdb-` |
| `.bdb-section-title/.bdb-footer/.bdb-skeleton` | OK | Idem |
| `.bdb-admin-section/.bdb-admin-grid/.bdb-admin-link` | OK | Idem |
| `.bdb-submenu-chevron/.bdb-preview-item` | OK | Idem |

---

### css/arsenal-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#arsenalMain .ars-card/.ars-card:hover` | OK | Scopé + préfixe |
| `.ars-upload-area/.ars-upload-area.ars-upload-active` | OK | Préfixe `.ars-` |
| `#arsenalMain #arsenalTabs .nav-link` | OK | Scopé |
| `.ars-badge-dmi/.ars-badge-ancillaires/.ars-badge-dm/.ars-badge-packs/.ars-badge-pliages/.ars-badge-doubles-sachets` | OK | Préfixe conforme |
| `#modalMateriel .ars-zone-suggestion` | OK | Scopé ID + préfixe |
| `#cdsOfflineBanner.cds-offline-banner` | OK | Classe CDS ciblée via ID — usage intentionnel conforme |

---

### css/carnet-bord-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#cbMain .cb-*` (toutes les classes) | OK | Scopé `#cbMain` + préfixe `.cb-` — ~30 classes, zéro violation |
| `#modalProgression .cb-*/#modalAdminCat .cb-*/#modalAdminItem .cb-*` | OK | Scopés modales + préfixe |

---

### css/cours-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.cours-card/.cours-card:hover` | OK | Préfixe `.cours-` |
| `.cours-icon-wrap/.cours-desc/.cours-card-menu` | OK | Idem |
| `.cours-upload-zone/.cours-view-thumb` | OK | Idem |
| `#cQuill .ql-toolbar/#cQuill .ql-container` | OK | Scopé ID |
| `.cours-view-content h2/.cours-view-content h3` | GLOBAL | Sélecteurs `h2/h3` dans classe non scopée module |
| `.cours-view-content ul/.cours-view-content ol` | GLOBAL | Sélecteurs `ul/ol` — idem |
| `.cours-view-content blockquote` | GLOBAL | Sélecteur `blockquote` — idem |

---

### css/objectifs-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#objectifsContainer .obj-*` (toutes) | OK | Scopé `#objectifsContainer` + préfixe `.obj-` — ~35 classes, zéro violation |

---

### css/fiches-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.fiche-card/.fiche-desc-preview/.fiche-cat-badge` | OK | Préfixe `.fiche-` |
| `.fiches-icon-wrap/.fiche-btn-ghost/.fiche-etape*` | OK | Idem |
| `.fiche-view-thumb/.fiche-upload-area/.fiche-tag-btn` | OK | Idem |
| `.fiches-quill-editor/.fiches-quill-editor .ql-editor` | OK | Scopé à classe module |
| `.fiche-view-description img` | GLOBAL | Sélecteur `img` dans classe non scopée au parent #fichesContainer |
| `.fiche-view-description h2/.fiche-view-description h3` | GLOBAL | Sélecteurs `h2/h3` — idem |

---

### css/supervision-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `#supervisionApp .supv-*` (toutes) | OK | Scopé `#supervisionApp` + préfixe `.supv-` — ~45 classes, zéro violation |
| `@keyframes supv-spin` | OK | Préfixe keyframe conforme |

---

### css/preferences-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.pref-card/.pref-desc/.pref-chir-avatar` | OK | Préfixe `.pref-` |
| `.pref-tag-type/.pref-tag-remove/.pref-menu-btn` | OK | Idem |
| `#pQuill .ql-toolbar/#pQuill .ql-container` | OK | Scopé ID |
| `.pref-view-description h2/.h3` | GLOBAL | Sélecteurs `h2/h3` dans classe non scopée |
| `.pref-view-description ul/.ol/.blockquote` | GLOBAL | Sélecteurs `ul/ol/blockquote` — idem (3) |

---

### css/installation-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.install-card/.install-card-accent/.install-icon-wrap/.install-desc` | OK | Préfixe `.install-` |
| `.install-precaution-badge/.install-card-menu` | OK | Idem |
| `.install-img-preview/.install-img-remove-btn/.install-view-thumb` | OK | Idem |
| `.install-tag-type/.install-tag-remove/.install-upload-zone` | OK | Idem |
| `.install-fiches-list/.install-fiche-item/.install-fiche-selected` | OK | Idem |
| `#iQuillDesc .ql-toolbar/#iQuillPrec .ql-container` | OK | Scopé ID |
| `.install-view-content h2/.h3` | GLOBAL | Sélecteurs `h2/h3` dans classe non scopée |
| `.install-view-content ul/.ol/.blockquote` | GLOBAL | Sélecteurs `ul/ol/blockquote` — idem (3) |

---

### css/transmissions-ui.css

| Sélecteur | Verdict | Détail |
|---|---|---|
| `.trans-card/.trans-upload-area/.trans-img-preview` | OK | Préfixe `.trans-` |
| `.trans-img-remove/.trans-avatar-circle/.trans-avatar-img/.trans-detail-img` | OK | Idem |
| `.trans-prose/.trans-prose p/.trans-prose ul/ol/strong/em` | OK | Scopé à `.trans-prose` (éléments natifs dans scope module) |
| `.ql-toolbar.ql-snow` | GLOBAL | Classes Quill ciblées globalement — sans scope `#transApp` ou similaire |
| `.ql-container.ql-snow` | GLOBAL | Idem |
| `.stat-icon` | NON-SCOPE | Pas de préfixe `.trans-` — `.cds-stat-icon` existe en CDS |
| `#modalLightbox .modal-content` | CONFLIT | `.modal-content` appartient à cds-overrides — ne pas redéfinir |
| `#modalLightbox .modal-dialog` | OK | Override Bootstrap scopé ID — acceptable |
| `.trans-card .dropdown` | OK | Scopé à `.trans-card` |

---

## Recapitulatif prioritaire

### Violations critiques à corriger en priorité

| Priorité | Fichier | Problème | Action |
|---|---|---|---|
| P1 | `admin-test-ui.css` | `:root`, `*`, `body`, `@keyframes pulse/spin`, `.progress-bar` globaux + 11 doublons | Supprimer le bloc legacy (l.160+), garder seulement le bloc 1 nettoyé |
| P1 | `index-ui.css` | Redéfinit `.bdb-user-menu`, `.bdb-menu-sep`, `.bdb-preview-submenu` (classes shell/CDS) | Supprimer les définitions — elles existent dans `cds-overrides.css` |
| P1 | `paxis-ui.css` | `:root` global, ~25 classes sans préfixe (migration Lovable) | Préfixer toutes les classes en `.paxis-*`, scoper `:root` |
| P2 | `admin-ui.css` | `.skeleton` et `.avatar-sm` conflictent avec CDS | Renommer en `admin-shimmer` et `.admin-avatar-sm` |
| P2 | `disc-ui.css` | `.pole-card` conflicte avec CDS theme-base | Renommer en `.disc-pole-card` |
| P2 | `index-ui.css` | `body {}`, `:root {}` globaux | Déplacer les variables dans un scope, éliminer `body` si redondant avec theme-base |
| P2 | `planning-ui.css` | ~35 classes batch/salle sans préfixe `.plan-` | Préfixer toutes en `.plan-*` |
| P3 | `annuaire-ui.css` | `.avatar-circle` dupliqué 2×, `@keyframes cardIn` sans préfixe | Dédupliquer, renommer en `ann-cardIn` |
| P3 | `cours/preferences/installation/fiches` | Sélecteurs `h2/h3/ul/ol/blockquote` dans classes non parentées | Acceptable pour rich text — documenter comme pattern autorisé |
| P3 | `login-ui.css` / `admin-bootstrap-ui.css` | `.input-eye-wrap` sans préfixe, dupliqué | Extraire vers CDS ou préfixer |
