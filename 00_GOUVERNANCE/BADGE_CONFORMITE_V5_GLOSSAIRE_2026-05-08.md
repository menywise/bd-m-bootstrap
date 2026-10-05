# BADGE DE CONFORMITÉ V5 — modules/glossaire/

```
MODULE   : modules/glossaire/ (index.html + glossaire-app.js + glossaire-ui.css)
RÔLE     : REF-MODULE-DBM-01 (module étalon)
DATE     : 2026-05-08
AUDITEUR : Claude (Carnet de Liaison V2 — instance claude.ai)
MÉTHODE  : Grille AUDIT_N0 §1 colonnes A-J + 7 voix
```

---

## VERDICT

```
┌─────────────────────────────────────────────┐
│  ÉTAT      : CONTAMINÉ                      │
│  VERDICT   : AMÉLIORABLE                    │
│  BADGE V5  : ⚠️  V5 QUASI-CONFORME          │
│             (8 violations, dont 1 bloquante) │
└─────────────────────────────────────────────┘
```

**Pas "sain" parce que** : la chaîne CSS diverge du canon CONV-CHAIN-E (principe TOUJOURS).
**Pas "à refondre" parce que** : la structure est exemplaire — c'est le module le mieux construit du parc.

---

## COLONNES A-J

### A — État : CONTAMINÉ

Le module fonctionne. Il n'est pas cassé, pas périmé, pas dangereux.
Mais il porte une contamination documentaire : sa chaîne CSS ne correspond plus au canon CONV-CHAIN-E inscrit en base (marqueur TOUJOURS).

### B — Rôle : TRANSMETTRE + AUDITER

Face A = consultation glossaire (transmettre). Face B = découverte termes (auditer). Face C = administration (exécuter). Face D = proposer termes (participer). Rôle complet, bien segmenté.

### C — ARE

| Centre | Score | Note |
|---|---|---|
| **A — Action** | 5/5 | CRUD complet, signalement, proposition, découverte, propagation, pagination, cache, debounce, 3 états async sur TOUTES les sections (glossaire, découverte, admin gestion, suggestions, propagation, panier, mes props). Exemplaire. |
| **R — Réflexion** | 4/5 | escHtml systématique sur innerHTML DB, .select() sur tous update/delete, IIFE, délégation d'événements, pas de console.log, sessionStorage (pas localStorage). -1 : showToast local au lieu de bdbToast (INTERDIT-JS-02). |
| **E — Émotion** | 3/5 | Empty states contextuels (icône + message adapté au filtre actif). Bouton Signaler distinct de Proposer. Mais : aucune micro-joie (pas de "bravo", pas de feedback positif), wordings fonctionnels sans chaleur, aucun badge triple légitimité. |

### D — Spirale : ORANGE

Performance, métriques (KPI admin), résultat mesurable. Le module est orange sain — il produit, il mesure, il administre. Il ne cherche pas le consensus (vert) ni la vision système (jaune) — c'est un outil.

### E — Type ennéagramme processus : 5 (SAVOIR)

Le glossaire est un condensé de savoir chirurgical structuré. Type 5 pur — il accumule, classe, transmet le vocabulaire. Risque type 5 : repli dans l'accumulation sans connexion au terrain (propagation = antidote partiel).

### F — 6 interdits

| # | Interdit | Statut | Détail |
|---|---|---|---|
| 1 | Pas de changement de cap silencieux | ✅ | Le commentaire L10 documente le changement CSS ("pas theme-base, pas cds-overrides"). Pas silencieux. |
| 2 | Pas de destruction silencieuse | ✅ | Aucune suppression sans confirmation (modale dédiée). |
| 3 | Pas de régression silencieuse | ⚠️ | La chaîne CSS a régressé par rapport à CONV-CHAIN-E sans mise à jour du principe en base. Régression documentée en commentaire HTML mais pas en doctrine. |
| 4 | Pas d'hallucination silencieuse | ✅ | escHtml partout. Pas de colonne inventée. |
| 5 | Pas de fausse interprétation silencieuse | ✅ | Les labels sont clairs. Signaler ≠ Proposer. |
| 6 | Pas de changement de hauteur silencieux | ✅ | Le module reste L1/L2. Admin visible uniquement pour admins. |

### G — 3 maladies

| Maladie | Statut | Détail |
|---|---|---|
| **Amnésie** | ⚠️ | CONV-CHAIN-E en DB dit theme-base@CDN + cds-overrides. Le module utilise dbm-theme + bdb-ui-kit. Quelqu'un a oublié de mettre à jour le principe — ou le module a oublié le principe. |
| **Boulimie** | ✅ | 1699 lignes JS, mais bien structuré en sections (Face A/B/C/D). Pas de volume gratuit. |
| **Certitude** | ✅ | Les sources sont vérifiées (.select() sur chaque mutation). Pas de code CCAM inventé. |

### H — Cohérence inter-documents

| Référence | Cohérent | Détail |
|---|---|---|
| CONV-CHAIN-E (chaîne CSS) | ❌ | Chaîne réelle ≠ principe en base. C'est LA contamination. |
| CONV-APP-ZONE-01 à 05 | ✅ | 4 zones dans l'ordre, footer hors app-content, modales hors wrapper. |
| CONV-BTN-01/02/03 | ✅ | btn-module, btn-module-outline utilisés. |
| CONV-MODAL-01 à 08 | ⚠️ | Modal-header-module présent. Centered+scrollable. Mais btn-close non coloré module (CONV-MODAL-07 non appliqué). |
| CONV-TOOLBAR-01 à 05 | ✅ | Pattern toolbar uniforme : recherche flex-grow + selects 180px + CTA 180px. |
| CONV-SIGNAL-01 | ✅ | Signaler et Proposer sont deux modales distinctes. |
| CONV-GF2-BALISE-SURFACE | ✅ | Surface marker L2 conforme. |
| INTERDIT-E1 | ✅ | bdb-shell premier enfant de wrapper. |
| INTERDIT-B1/B2/B3 | ✅ | Zéro auth dupliquée. |
| INTERDIT-C6 | ✅ | escHtml sur tous les innerHTML DB. |
| INTERDIT-D4 | ✅ | .select() sur tous les update/delete. |
| INTERDIT-D6 | ✅ | Zéro console.log. |
| INTERDIT-JS-01 | ✅ | JS externalisé dans glossaire-app.js. |
| INTERDIT-JS-02 | ❌ | showToast() locale (L27-35) réimplémente bdbToast de bdb-ui.js. |
| INTERDIT-JS-03 | ✅ | Fichier dans modules/glossaire/, pas dans js/. |
| INTERDIT-C2 | ⚠️ | 9 inline style= dont 3 non-exemptés (L73 gradient, L75 opacity, L86 toolbar). |
| INTERDIT-MODULE-COLOR-01 | ⚠️ | 8 couleurs de badge en dur dans CSS (glos-badge-*). |
| CONV-ICONS | ✅ | Bootstrap Icons uniquement. |
| GFC-A11Y-MODAL-01 | ✅ | bdb-modal-a11y.js chargé après bootstrap.bundle. |
| INTERDIT-BRANDING-BDB-SURFACE-01 | ✅ | "DBM" et "Des Blocs & Moi" partout. Zéro "BDB" en surface. |
| INTERDIT-TABLE-SCROLL | ⚠️ | Table admin CRUD sans pagination (567+ entrées). |

### I — Verdict : AMÉLIORABLE

Le fond est excellent. La structure est la meilleure du parc. Les corrections sont ciblées et faisables.

### J — Actions prioritaires

| # | Priorité | Violation | Action | Effort |
|---|---|---|---|---|
| 1 | **P0** | Chaîne CSS ≠ CONV-CHAIN-E | **ARBITRAGE REQUIS** : soit mettre à jour CONV-CHAIN-E en DB (dbm-theme + bdb-ui-kit remplacent theme-base@CDN + cds-overrides), soit réaligner le module sur l'ancienne chaîne. Le principe TOUJOURS en base est en contradiction avec l'étalon. | Décision |
| 2 | **P1** | INTERDIT-JS-02 : showToast() locale | Remplacer les 39 appels showToast() par bdbToast() de bdb-ui.js. Supprimer la fonction locale et les 3 conteneurs toast HTML. | 30 min |
| 3 | **P1** | Table admin sans pagination | Ajouter pagination serveur sur l'onglet Gestion (567+ entrées = perf + INTERDIT-TABLE-SCROLL). | 1-2h |
| 4 | **P2** | INTERDIT-C2 : 3 inline style= | Extraire L73 (gradient), L75 (opacity), L86 (toolbar) dans glossaire-ui.css. | 15 min |
| 5 | **P2** | CONV-MODAL-07 : btn-close non coloré | Ajouter le filtre CSS sur btn-close dans modal-header-module (cf. dbm-module-color.css). | 5 min |
| 6 | **P3** | 8 couleurs hardcodées badges | Migrer glos-badge-* vers variables CSS ou utiliser les semantic tokens du design system. | 30 min |
| 7 | **P3** | 2 liens morts footer | `<a href="#">Aide</a>` et `<a href="#">Accessibilité</a>` → pointer vers pages réelles ou supprimer. | 5 min |
| 8 | **P3** | SEO meta sur page authentifiée | `robots: index, follow` + canonical + OG/Twitter sur un module derrière bdb-shell. Décision : le glossaire a-t-il vocation à être indexé ? Si oui, confirmer. Si non, retirer les meta. | Décision |

---

## 7 VOIX

### Aurèle (T0 — "Est-ce que je comprends sans contexte ?")

> Le titre "Glossaire chirurgical" est immédiatement compréhensible. L'empty state "Aucun terme trouvé" me guide. La barre de recherche est évidente. **Je comprends cette page sans lire autre chose.**

Réserve : l'onglet "Propagation" dans l'admin — le mot n'est pas auto-explicatif pour une IA neuve. Mais c'est admin-only, donc acceptable.

### Blanche (T1w2 — "Est-ce que c'est JUSTE ?")

> Le contenu est protégé par escHtml. La distinction Signaler ≠ Proposer est juste (CONV-SIGNAL-01). Les badges catégorie sont sémantiquement corrects. **C'est juste.**

Réserve : la table admin sans pagination — avec 567 entrées, l'experte qui audite le glossaire charge tout d'un coup. Ce n'est pas juste pour elle ni pour le navigateur.

### Constance (T3 — "Qu'est-ce que ça PRODUIT ?")

> L'onglet Administration produit : KPI, gestion CRUD, suggestions, propagation. Le badge de suggestions en attente est visible. **Ça produit du mesurable.**

Réserve : pas de compteur "termes ajoutés ce mois", pas de courbe de croissance. L'admin voit l'état mais pas la tendance.

### Dorian (T5w6 — "Sur quoi c'est FONDÉ ?")

> Le cache sessionStorage est fondé. Le debounce 300ms est raisonnable. Les .select() sur mutations sont conformes. **Les fondations techniques sont solides.**

Réserve : showToast() réimplémente une fonction existante dans bdb-ui.js. Duplication = source de divergence future. Et la chaîne CSS "dbm-theme.css" n'est documentée nulle part en tant que canon.

### Estelle (T6 — "Est-ce que je peux FAIRE CONFIANCE ?")

> Le bouton Signaler est accessible sur chaque carte. Ma suggestion me montre son statut (En attente / Approuvé / Rejeté). L'empty state me dit quoi faire. **Je peux faire confiance à cette page.**

Réserve : aucune indication de fiabilité sur les termes eux-mêmes. Qui a validé cette définition ? Depuis quand ? Combien de personnes l'ont consultée ? Triple légitimité absente.

### Fernand (T8 — "Est-ce que ça me PROTÈGE ?")

> Recherche rapide (client-side, cache). 2 clics pour trouver un terme. Le filtre catégorie isole ce dont j'ai besoin. **C'est rapide, ça me protège.**

Réserve : pas de lien vers le protocole ou le picking depuis un terme. Le glossaire est isolé — je dois chercher ailleurs si je veux voir le matériel associé.

### Gaël (T9w8 — "Est-ce que ça S'ASSEMBLE ?")

> La propagation vers les autres modules est intégrée (onglet dédié). Le composant bdb-glossaire-tooltip enrichit les autres modules depuis le glossaire. **Le module s'assemble avec le reste.**

Réserve : la chaîne CSS diverge du canon. Si l'étalon (REF-MODULE-DBM-01) n'est pas aligné sur CONV-CHAIN-E, tous les modules audités après lui seront comparés à une référence contaminée. **C'est le plus grand risque systémique de cet audit.**

---

## SYNTHÈSE POUR DÉCISION

Le module glossaire est le module le mieux construit du parc DB&M. Structure exemplaire, escHtml partout, 3 états async complets, délégation d'événements, IIFE, séparation Signaler/Proposer, propagation cross-module.

**La seule question bloquante est P0** : la chaîne CSS. Deux options exclusives :

| Option | Action | Conséquence |
|---|---|---|
| **A — Le module a raison** | UPDATE CONV-CHAIN-E en DB pour refléter la nouvelle chaîne (dbm-theme + bdb-ui-kit). Documenter la décision. | Tous les 27 autres modules devront migrer vers cette chaîne. |
| **B — Le principe a raison** | Réaligner le module sur theme-base@CDN + cds-overrides. | Le module perd le bénéfice de dbm-theme.css (Charte v3). |

**Recommandation** : Option A. La session #115 a adopté la Charte v3 (D-2026-05-07-S115-CHARTE-PREMIUM). Le glossaire est le premier module à l'appliquer. CONV-CHAIN-E doit être mis à jour pour refléter cette décision, pas l'inverse.

Une fois P0 arbitré, les 7 violations restantes (P1 × 2, P2 × 2, P3 × 3) sont traitables en une session de 2-3h max.

---

## HISTORIQUE

```
2026-05-08 — V1.0.0
  Audit initial grille AUDIT_N0 §1 (A-J) + 7 voix.
  8 violations identifiées (1 P0, 2 P1, 2 P2, 3 P3).
  Verdict : AMÉLIORABLE.
  État : CONTAMINÉ (chaîne CSS divergente).
```
