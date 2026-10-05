-- ============================================================
-- S121 — Cristallisation doctrine pre-audit v5
-- Date : 2026-05-06
-- Objet : 5 principes a documenter AVANT de lancer l audit qualite v5
-- Source : brainstorm 2026-05-06 + perte de trace doctrine pastel signalee par Manu
-- Methode : FAB(3R) complet pour eviter nouvelle perte de trace
-- ============================================================

-- Idempotence
DELETE FROM atelier_principes WHERE ref IN (
  'CONV-PALETTE-PASTEL-TOTALE-01',
  'INTERDIT-COULEUR-SATUREE-01',
  'CONV-BRANDING-DBM-01',
  'INTERDIT-BRANDING-BDB-SURFACE-01',
  'CONV-AUDIT-V5-16-FAMILLES-01'
);

-- ============================================================
-- BLOC 1 — Palette pastel totale (perte de trace)
-- ============================================================

INSERT INTO atelier_principes (ref, categorie, titre, description, marqueur, realite, fonction, avantage, benefice, risque, resultat, recommandation, source, date_figement) VALUES
('CONV-PALETTE-PASTEL-TOTALE-01','convention',
 'La totalite de l app DB&M utilise une palette pastel',
 'Tous les elements visuels de l application DB&M (boutons, alerts, badges, dropdowns, progress, tabs, modales, CTA, status, hover, focus) utilisent des tons pastels doux. Pas seulement les couleurs des 5 groupes (bloc, equipe, savoir, pilotage, espace_perso) mais aussi les couleurs systeme et les couleurs status. Doctrine documentee depuis plusieurs mois, perdue dans les migrations successives, redocumentee proprement.',
 'TOUJOURS',
 'Couleurs Bootstrap saturees (#0d6efd primary, #198754 success, #dc3545 danger, #ffc107 warning, #0dcaf0 info) creent une fatigue visuelle prolongee en bloc operatoire.',
 'Imposer une palette pastel uniforme sur l ensemble de l interface, pas seulement sur les couleurs de groupe.',
 'Confort visuel sur sessions longues, identite visuelle apaisante coherente avec usage hospitalier.',
 'L equipe utilise l app sans fatigue oculaire meme apres plusieurs heures, image professionnelle premium.',
 'Si oubli ou regression : alaternance de saturations cassant la coherence visuelle, fatigue oculaire, perte d image premium.',
 'Doctrine cristallisee S121 pour eviter nouvelle perte de trace. Audit v5 dimension F35 verifie cette regle sur tous les fichiers.',
 'Toute couleur visible utilise --module-color* OU une variante pastel definie dans dbm-theme.css ou bdb-ui-kit.css.',
 'Perte de trace signalee par Manu 2026-05-06 + brainstorm audit v5',
 '2026-05-06'),

('INTERDIT-COULEUR-SATUREE-01','interdit',
 'Couleurs Bootstrap saturees interdites en surface',
 'Les classes Bootstrap saturees (bg-primary, bg-success, bg-danger, bg-warning, bg-info, btn-primary, btn-success, btn-danger, btn-warning, btn-info) ne doivent JAMAIS apparaitre dans le rendu visible des modules DB&M, sauf exceptions limitees : btn-danger sur bouton de suppression dans modale de confirmation (signal danger universel), bg-danger / text-danger sur alertes d erreur (alert role).',
 'TOUJOURS',
 'Modules anciens contenaient btn-primary partout, modules migres v5 ont parfois conserve ces classes saturees.',
 'Eliminer toute couleur Bootstrap saturee de la surface utilisateur.',
 'Coherence pastel garantie, palette uniforme, identite visuelle preservee.',
 'Aucune surprise de couleur saturee dans aucun module, image premium uniforme.',
 'Si bypass : rupture visuelle dans modules concernes, alaternance saturee/pastel cassant la coherence.',
 'Substitution systematique : btn-primary -> btn-module, btn-success -> btn-module ou btn-success-pastel, btn-info -> btn-module-outline, btn-warning -> btn-module ou btn-secondary.',
 'Audit dimension F38 verifie absence des classes saturees. Exception : btn-danger sur confirmation suppression et alertes erreur.',
 'Cristallisation S121 + brainstorm audit v5',
 '2026-05-06'),

-- ============================================================
-- BLOC 2 — Branding DBM vs BDB
-- ============================================================

('CONV-BRANDING-DBM-01','convention',
 'Branding DB&M en surface utilisateur, BDB conserve en code uniquement',
 'Le nom "Des Blocs & Moi" (DB&M) est utilise dans toutes les surfaces utilisateur : titres de pages, balises h1, meta description, commentaires HTML visibles, textes editoriaux, copywriting, marketing. Le sigle "BDB" reste autorise uniquement dans le code technique non visible : prefixes de tables SQL (bdb_*), classes CSS techniques (bdb-shell, bdb-tabs), fichiers JS (bdb-shell.js, bdb-ui.js, bdb-invite-guard.js), variables JavaScript (window.bdb, window.bdbUser).',
 'TOUJOURS',
 'Le projet s appelait BDB jusqu a session #113. Les surfaces utilisateur citent encore "Bible de Bloc" ou "BDB" en titres et commentaires.',
 'Distinguer le nom marketing utilisateur (DB&M) du nom technique infrastructure (BDB).',
 'Image utilisateur unifiee DB&M sans confusion, infrastructure technique non cassee par renommage massif.',
 'Cohérence externe avec le mini-site marketing, infrastructure interne stable et previsible.',
 'Si tout substitue par DBM : casse des classes CSS et noms de fichiers existants. Si rien substitue : confusion utilisateur entre BDB et DB&M.',
 'Frontiere claire : surface utilisateur = DB&M strict. Code interne = BDB conserve.',
 'Toute creation de page utilise DB&M en surface. Toute creation de classe ou fichier peut conserver BDB en prefixe.',
 'Rappel Manu 2026-05-06 + cristallisation S121',
 '2026-05-06'),

('INTERDIT-BRANDING-BDB-SURFACE-01','interdit',
 'BDB et Bible de Bloc interdits en surface utilisateur',
 'Les chaines "Bible de Bloc" et "BDB" (en majuscules ou minuscules) sont interdites dans : balises title, meta description, balises h1 / h2 / h3, commentaires HTML visibles, textes affiches a l utilisateur, textes editoriaux du mini-site. Substitution obligatoire : "Bible de Bloc" -> "Des Blocs & Moi" et "BDB" -> "DBM" ou "Des Blocs & Moi" selon contexte. Le caractere & dans "Des Blocs & Moi" peut casser certaines URLs et chemins Windows : utiliser "&amp;" en HTML et "DBM" en URL/filesystem.',
 'TOUJOURS',
 'Apres premier audit fichiers racine 2026-05-06 : 23 occurrences "Bible de Bloc" dans 11 fichiers. Apres correction, "BDB" reste dans 4 titres ("En maintenance | BDB", etc.). Demande explicite Manu : eliminer tous les BDB en surface.',
 'Imposer la disparition complete de BDB et Bible de Bloc en surface utilisateur.',
 'Identite utilisateur DB&M absolue, aucune confusion sur le nom du produit.',
 'Migration de marque finalisee, mini-site coherent avec app, branding stable a long terme.',
 'Si bypass : confusion permanente sur le nom utilisateur du produit, image marketing fragile.',
 'Audit dimension F12 verifie absence de "Bible de Bloc" et "BDB" en surface utilisateur.',
 'Substitution systematique des occurrences detectees. Exception : prefixes techniques bdb_* / bdb-* / classe CSS bdb-shell.',
 'Cristallisation S121 + perte de trace doctrine 2026-05-06',
 '2026-05-06'),

-- ============================================================
-- BLOC 3 — Framework audit qualite v5
-- ============================================================

('CONV-AUDIT-V5-16-FAMILLES-01','convention',
 'Audit qualite migration v5 organise en 16 familles',
 'L audit qualite de la migration v5 vers DB&M est structure en 16 familles thematiques couvrant 120+ dimensions auditables. Familles : F1 Structure et chaine chargement, F2 HEAD et metadonnees, F3 Structure app-zone, F4 Toolbar et filtres, F5 Modales, F6 Couleurs et CSS, F7 JavaScript et runtime, F8 Console et reseau, F9 Permissions et roles, F10 Anonymisation et RGPD, F11 SEO et metadonnees publiques, F12 Liens et navigation, F13 Conformite Supabase DB-first, F14 Conformite documentation et doctrine, F15 Conformite skills locaux, F16 Anti-regression et anti-hallucination. Chaque dimension a un niveau de criticite P0 (bloquant) / P1 (majeur) / P2 (mineur) / P3 (cosmetique).',
 'TOUJOURS',
 'Migrations massives v5 ont introduit ecarts dispersés, perdus dans le bruit. Audit ad hoc sans structure incomplet.',
 'Standardiser une grille d audit reutilisable a chaque migration majeure.',
 'Audit complet et reproductible, comparaison entre runs successifs, pas de perte de trace.',
 'Qualite migration v5 mesurable et tracable, doctrine audit pereenne.',
 'Si pas standardise : audits ponctuels incomplets, regressions revenant en boucle.',
 'Outil L3 cree dans createur/audit-v5/ : runner Python + dashboard HTML + persistance cloud atelier_audit_v5_runs. Reutilisable pour migrations futures.',
 'Toute migration majeure (theme, structure, doctrine) DOIT passer l audit 16 familles avant cloture.',
 'Brainstorm Manu 2026-05-06',
 '2026-05-06');

-- ============================================================
-- TRACE DECISION
-- ============================================================

INSERT INTO atelier_decisions (ref, titre, description, statut, module_cible, session_num, type, tags)
VALUES (
  'D-2026-05-06-S121-01',
  'Cristallisation doctrine pre-audit v5 (5 principes)',
  'Insertion 5 principes dans atelier_principes pour fixer la doctrine AVANT lancement audit qualite migration v5 : palette pastel totale, branding DBM vs BDB, framework audit 16 familles. Methode FAB(3R) complete pour chaque principe. Source : perte de trace doctrine pastel + harmonisation BDB->DBM signalees par Manu 2026-05-06.',
  'active',
  'doctrine',
  121,
  'decision',
  ARRAY['doctrine','palette','pastel','branding','dbm','audit','v5']::text[]
)
ON CONFLICT (ref) DO UPDATE SET
  description = EXCLUDED.description;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT ref, categorie, titre
FROM atelier_principes
WHERE ref IN (
  'CONV-PALETTE-PASTEL-TOTALE-01',
  'INTERDIT-COULEUR-SATUREE-01',
  'CONV-BRANDING-DBM-01',
  'INTERDIT-BRANDING-BDB-SURFACE-01',
  'CONV-AUDIT-V5-16-FAMILLES-01'
)
ORDER BY ref;
