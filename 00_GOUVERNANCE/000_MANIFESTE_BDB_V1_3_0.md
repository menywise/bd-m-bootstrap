# MANIFESTE BDB

```
VERSION  : 1.3.0
DATE     : 2026-05-01
AUTEUR   : Manu + Claude — Session #27 (fondation) · Session #28 (amendements + doctrine terrain)
                          · Audit N0 2026-05-01 (correctifs §10 + §7.7)
STATUT   : FONDATEUR — Ce document prime sur tout autre en cas de conflit.
PORTÉE   : Définit ce que BDB est, ce qu'il fait, ce qu'il ne fait pas,
           pour qui il existe, et comment il se comporte.
RÈGLE    : Toute décision technique, architecturale ou fonctionnelle
           est précédée de : "Est-ce cohérent avec le Manifeste ?"
DELTA    : v1.2.0 → v1.3.0
           §10 : remplacement des références mortes
                 - JOURNAL_DECISIONS (fichier supprimé) → atelier_decisions (table Supabase)
                 - CTX_SYSTEM_ARCHITECTURE (renommé/fusionné) → 10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0
                 + signalement divergence d'ordre avec Canon V1.0.5 §10 [A ARBITRER PAR MANU]
           §7.7 : réconciliation combo gagnant — note ajoutée pointant la vue détaillée
                  (12 maillons) de CTX_DOCTRINE_TERRAIN V1.2.0 §4. Les deux vues sont
                  complémentaires : la vue Manifeste (6) est un sous-ensemble compact
                  des 6 premiers maillons de la vue Doctrine (12).
           Maladies corrigées : amnésie. Interdits résolus : #3, #4. Motif : audit N0.
DELTA    : v1.0.0 → v1.1.0
           §9  : Doc 1/2 passent à DETTE ACTIVE. Doc 3 passe à DETTE ACTIVE.
                 Doc 4 confirmé ✅ (tables atelier_* opérationnelles).
           §10 : Ajout — Règle de référence unique (D-2026-04-03-T01).
           §2bis ajouté : réalité opératoire + chaîne du chaos.
           §7.7 ajouté : combo gagnant + variantes chirurgien.
```

---

# 1 — CE QUE BDB EST

Bible de Bloc est un système de transmission du savoir opératoire
pour les équipes de bloc opératoire.

**Finalité unique :** améliorer la sécurité du patient par la transmission
du savoir opératoire.

BDB intervient **avant** et **après** l'intervention. Jamais pendant.

**Avant** : tout savoir pour préparer juste. Protocole, matériel, installation,
préférences chirurgien, anatomie, glossaire. L'IBODE qui ouvre BDB la veille
ou le matin SAIT ce qui l'attend en salle.

**Après** : tout transmettre pour améliorer demain. Transmissions, retours terrain,
signalements, enrichissement des fiches, formation des novices. Ce qui s'est passé
en salle nourrit le savoir collectif.

**Jamais pendant** : pas de check-list à cocher en salle, pas de saisie per-op,
pas de traçabilité temps réel. BDB ENSEIGNE comment faire une check-list.
Il n'EST PAS la check-list.

---

# 2 — PRINCIPE FONDAMENTAL

**BDB = SAVOIR, PAS ACTION.**

| BDB fait | BDB ne fait pas |
|---|---|
| Expliquer ce qu'est une check-list pré-op | Remplacer la check-list en salle |
| Montrer comment installer un patient en DV | Être ouvert quand on installe le patient |
| Documenter quel matériel préparer | Scanner le matériel en salle |
| Former une novice à la préparation d'une PTH | Guider pas à pas pendant la PTH |
| Capitaliser les leçons après l'intervention | Enregistrer ce qui se passe pendant |

---

# 2bis — RÉALITÉ OPÉRATOIRE

## La chaîne du chaos

Entre un symptôme patient et la salle d'opération, une dizaine d'intervenants
nomment, codent, interprètent chacun selon leur propre référentiel.
À chaque étape, une décision est prise sans être transmise à l'étape suivante.

```
Patient → Urgentiste → Chirurgien consultation → Secrétaire OPTIM
→ Cadre de bloc → IBODE préparation → Chirurgien salle
→ Chirurgien facturation → Stats
```

À chaque flèche : un libellé différent, une interprétation différente,
une décision non documentée. L'IBODE suivante repart de zéro dans le stress.

C'est précisément pour ça que BDB n'existait pas encore.

## Ce qu'un protocole BDB est réellement

Un protocole BDB n'est **pas** une description clinique exhaustive d'un acte.
C'est un **contexte de préparation documenté** avec un niveau de certitude connu.

Il permet à une IBODE — même novice — de savoir quoi préparer,
avec quelles variantes possibles, selon quel chirurgien,
et quelles substitutions sont validées si le matériel prévu manque.

Le picking est fluctuant par nature (disponibilité matériel, voie d'abord,
complexité découverte, préférences chirurgien). BDB documente les variantes
connues — il ne fige pas une vérité impossible à figer.

## Les sources terrain sont de la matière première

| Source | Ce qu'elle est | Ce qu'elle n'est pas |
|---|---|---|
| Fiches papier chirurgien | Preuve qu'un geste existe en pratique | Définition du protocole |
| Intitulés OPTIM | Signal brut à déchiffrer | Nomenclature fiable |
| Notes OPTIM | Information cachée exploitable | Standard clinique |
| Cotations CCAM actuelles | Indication approximative | Vérité médicale |
| 90 000 interventions | Fréquence et variantes terrain | Source de libellés |

Matière première à déchiffrer. Jamais à copier.

## Le modèle d'itération

Une version imparfaite documentée vaut infiniment mieux qu'une perfection
qui n'existe pas encore. Un protocole à 60% est utile immédiatement —
à condition que son niveau de complétude soit visible et honnête.

La version obsolète est archivée, pas effacée.
L'historique de l'itération est une donnée, pas une honte.

Référence complète : CTX_DOCTRINE_TERRAIN_V1_0_0.md

---

# 3 — POSITIONNEMENT MARCHÉ

BDB occupe un espace qu'aucun logiciel existant ne couvre.

Les solutions du marché se répartissent en 5 familles :

| Famille | Exemples | Ce qu'ils font | Ce qu'ils ne font pas |
|---|---|---|---|
| Logiciel de bloc | Optim, TimeWise, Torin | Planning salles, traçabilité DM/DMI, saisie en salle | Knowledge Management, formation, glossaire |
| WMS / Picking | Easy WMS, G-STOCK | Stocks, emplacements, bons de picking | Connaissances, formation, gestion d'équipe bloc |
| Knowledge Management | Confluence, Zendesk | Procédures, glossaire, wiki, recherche | Planning bloc, picking, traçabilité |
| LMS / Formation | Moodle, Dokeos | Parcours formation, compétences, quiz | Flux opératoires, picking, planning |
| Tickets / Incidents | Zendesk, outils SIH | Signalements, analyse, plans d'action | Connaissances structurées, picking, planning |

**Le trou du marché :** aucun outil ne fait le pont entre les connaissances
opératoires et l'opération quotidienne du bloc. BDB est ce pont.

**Ce qui rend BDB unique :** construit par une IBODE, depuis le terrain,
avec 20 ans de données réelles, pour ceux qui préparent et transmettent.

**La phrase de Brigitte :** "Le SIH sait QUI est opéré QUAND. BDB sait
COMMENT on opère et COMMENT on transmet ce savoir."

---

# 4 — PÉRIMÈTRE DÉFINITIF

## Ce que BDB fait

**Connaissances opératoires (cœur produit) :**
Thesaurus des protocoles, glossaire chirurgical, anatomie, installation patient.

**Documentation procédures :**
Fiches d'intervention (picking), transmissions.

**Préparation matérielle :**
Arsenal (matériel, étagères, zones de stockage), préférences chirurgien.

**Formation et intégration :**
Cours, DISC (profils psychologiques), Paxis (recueil de situations),
carnet de bord (progression).

**Gestion d'équipe :**
Annuaire, profils, planning.

**Outils support :**
Recherche/veille (Dork), collaboration (Collab), documents de service (GED),
feedback/tickets (transverse), import/export données.

## Ce que BDB ne fait pas et ne fera jamais

| Exclu | Raison | Qui le fait |
|---|---|---|
| Saisie en salle per-op | Stérile, mains occupées | OPTIM, SIH |
| Traçabilité DM/DMI temps réel | Per-op, codes-barres en salle | SIH |
| Dossier patient | Données de santé nominatives | SIH (Orbis, DxCare) |
| Facturation / codage PMSI | Flux administratif | SIH |
| Prescription médicale | Acte médical | SIH |
| Gestion des lits / brancardage | Flux logistique patient | SIH |

---

# 5 — LES PERSONAS

Personnes réelles. Pas de persona fictif.

| Persona | Nom | Rôle | Besoin principal |
|---|---|---|---|
| Créateur | Manu | IBODE, construit BDB | Construire, décider, vendre |
| Outil fabrication | Claude | IA | Contexte pour ne pas casser |
| Dev instance | Ewan | Développeur Chénieux | Code propre, doc technique, conventions |
| Admin instance | Olivia H. | Cadre de bloc Ortho Chénieux (membre) | Configurer, importer, gérer son équipe |
| Admin instance | Sophie P. | Cadre de bloc Viscéral Chénieux | Idem Olivia, autre spécialité |
| IBODE utilisatrice | Sabine D. | IBODE confirmée (membre) | Trouver vite, préparer juste |
| Novice | Julie C. | Infirmière arrivante (membre) | Apprendre, comprendre, ne pas se noyer |
| Chirurgien | Dr COSTE Cédric | Chirurgien (membre) | Ses prefs, ses protocoles, en 2 clics |
| Admin externe | Anne-Cécile | Admin La Marche (autre établissement) | Idem Olivia, sans connaître Chénieux |
| Invité / Prospect | *(anonyme)* | Découvre BDB | Comprendre, essayer, comparer |
| Direction / DSI | Brigitte | Financeur, décideur | Justifier l'achat, conformité, ROI |

> Note : 31_PERSONAS_BDB_V1_3_0 complète cette table avec les états vécus
> et les règles de voix pour la rédaction du mini-site. Usage : rédacteur uniquement.

---

# 6 — LES TROIS COUCHES

Chaque table, chaque donnée, chaque document appartient à une couche.

**Couche L1 — Produit (voyage avec chaque instance)**

Ce qui est vrai pour tout bloc opératoire. Le moteur, le shell, le CDS,
les référentiels universels (CCAM, glossaire, anatomie, méthode DISC),
le seed d'installation, le mode démo.

Tout module a au moins une face L1 (consultation utilisateur).

**Couche L2 — Instance (propre à chaque établissement × spécialité)**

Les données terrain. Chirurgiens locaux, protocoles locaux, fiches locales,
historique d'interventions, équipe, préférences.

Tout module a au moins une face L2 (administration, configuration).

**Couche L3 — Atelier (ne voyage JAMAIS avec le produit)**

L'usine de fabrication. Journal des décisions, sessions backlog,
arbitrages, conventions de code, skills Claude, migrations historiques.

Aucun utilisateur, admin ou dev d'instance ne voit la couche L3.

**Convention de préfixes pour les tables :**

| Préfixe | Couche | Exemple |
|---|---|---|
| *(aucun)* | L1/L2 produit | profiles, thesaurus_protocoles, disc_profils |
| `bdb_` | L1 transverse | bdb_principes (règles cliniques universelles) |
| `cds_` | Framework technique | cds_config, cds_rules, cds_rule_delta, cds_sessions |
| `atelier_` | Fabrique Manu×Claude | atelier_decisions, atelier_sessions, atelier_arbitrages, atelier_principes |

**Jour de la vente :**
```sql
DROP TABLE atelier_* CASCADE;
-- Les tables cds_* restent optionnelles (mode debug dev).
-- Les tables sans préfixe et bdb_* partent avec l'instance.
```

---

# 7 — PRINCIPES PRODUIT

## 7.1 Transverse absolu

Plus aucun mécanisme "par module". Si un pattern existe, il existe partout
de la même façon. Tickets, feedback, masquer/détruire, import, recherche,
états vides — tout est transverse.

## 7.2 Démo = Seed + Vitrine

Les mêmes données servent à installer une instance vierge ET à convaincre
un prospect. Un "Hello World" chirurgical que Sophie explore le jour
de l'install et que Brigitte parcourt avant l'achat.

## 7.3 Masquer ≠ Détruire

Deux niveaux universels :
- **Masquer** (admin : Olivia, Sophie) : `actif = false`. Ne s'affiche plus.
  Réversible. Les données restent.
- **Détruire** (dev : Ewan) : DELETE. Irréversible.

## 7.4 Import récurrent, pas archéologique

L'import OPTIM n'est pas un événement unique. C'est un besoin récurrent
(annuel minimum). Le pipeline de nettoyage doit être un outil admin L2,
pas un exploit technique L3. Sophie doit pouvoir importer sans Manu ni Ewan.

## 7.5 Auto-explicatif

Chaque écran, chaque état vide, chaque module s'explique tout seul.
Julie ouvre un module vide → elle comprend quoi faire.
Anne-Cécile installe BDB → elle est guidée en 30 minutes.
Personne n'appelle Manu.

## 7.6 Instanciable

BDB est un produit, pas un projet personnel. Chaque instance
(spécialité × établissement) est autonome. "BDB Ortho Chénieux",
"BDB Viscéral Chénieux", "BDB Ortho La Marche" sont des instances
indépendantes du même produit.


## 7.7 Combo gagnant

L'unité de progrès de BDB. Un protocole complet et lié — vue compacte :

```
NOM LISIBLE → CODE CCAM (ou vide assumé) → PICKING (partiel OK, complétude visible)
→ VARIANTES CHIRURGIEN → SUBSTITUTIONS VALIDÉES → INTERVENTIONS TERRAIN LIÉES
```

Un combo à 100% tire vers le haut tous les éléments liés.
Il est plus important que 100 protocoles à 50% non liés.

Variantes par chirurgien : un protocole racine + delta par chirurgien.
Jamais un protocole par chirurgien.

> **Note de réconciliation V1.3.0** — Cette section présente la vue compacte
> (6 maillons) du combo gagnant. La vue détaillée (12 maillons) est documentée
> dans CTX_DOCTRINE_TERRAIN V1.2.0 §4 — elle ajoute aux 6 maillons ci-dessus :
> FICHES DE COURS · TRANSMISSIONS · PAXIS · DISC · ÉVOLUTIONS DOCUMENTÉES ·
> REMISES EN QUESTION.
>
> Les deux vues sont complémentaires, pas contradictoires : la vue Manifeste
> est le sous-ensemble compact (libellé → matériel → variantes → terrain)
> que Brigitte/Olivia comprennent en 30 secondes ; la vue Doctrine est la
> chaîne complète qui dit ce qu'un combo "à 100%" implique réellement.
>
> En cas d'usage opérationnel (rédaction, audit de complétude, formation
> Julie), la **vue Doctrine 12 maillons prime**. La vue Manifeste sert de
> pitch et de mémoire courte.

---

# 8 — TIMELINE D'UNE INTERVENTION

| Phase | Quand | BDB ? | Modules concernés |
|---|---|---|---|
| M-3 Découverte | Prospect | ✅ Démo | Mini-site, mode démo |
| M-2 Évaluation | Prospect + Direction | ✅ Démo | Mode démo, documentation |
| M-1 Décision | Direction (Brigitte) | ✅ Documentation | Business case, conformité |
| M0 Installation | Dev (Ewan) | ✅ Seed L1 | Script install, premier admin |
| M1 Configuration | Admin (Olivia) | ✅ | Admin, config établissement |
| M2 Import | Admin (Olivia) | ✅ | Assistant import OPTIM |
| M3 Rédaction | Admin + IBODE | ✅ | Fiches, cours, glossaire |
| M4 Exploitation | Tous | ✅ | Tous les modules |
| M5 Maintenance | Dev (Ewan) | ✅ | Mises à jour, corrections |
| M6 Disaster recovery | Dev (Ewan) | ✅ | Restauration backup SQL |

---

# 9 — NIVEAUX DE DOCUMENTATION

| Doc | Audience | Vit où | Statut |
|---|---|---|---|
| Doc 1 — Utilisateur | Sabine, Julie, Dr COSTE | DANS l'app (aide contextuelle, tooltips, états vides) | ❌ DETTE ACTIVE |
| Doc 2 — Admin instance | Olivia, Sophie, Anne-Cécile | DANS l'app (onglets admin, guide démarrage) | ❌ DETTE ACTIVE |
| Doc 3 — Dev instance | Ewan | Repo / wiki technique (CDS, schéma DB, conventions) | ⚠ DETTE ACTIVE — migration planifiée session #28 |
| Doc 4 — Atelier | Manu × Claude | Tables atelier_* + skills Claude | ✅ opérationnel depuis session #27 |

---

# 10 — RÈGLE DE RÉFÉRENCE UNIQUE

**Ce document remplace NOYAU_VERITE comme référence fondatrice.**

Toute mention de `NOYAU_VERITE_V2_4_0` ou de toute version antérieure
dans un document de gouvernance est caduque depuis le Manifeste V1.0.0.

Ordre de priorité en cas de conflit :
```
1. MANIFESTE_BDB (ce fichier) — prime sur tout
2. atelier_decisions — décisions validées (table Supabase, append-only)
3. 10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0 — architecture système + règles techniques
4. CTX_[MODULE].md — règles de chaque module
```

> **Note V1.3.0 — références mortes corrigées :**
> - `JOURNAL_DECISIONS` (fichier supprimé) → `atelier_decisions` (table Supabase
>   où les décisions sont désormais persistées en append-only).
> - `CTX_SYSTEM_ARCHITECTURE` (renommé en 12_SYSTEM_ARCHITECTURE V2.5.0,
>   puis fusionné avec 10_CHANTIER_TECHNIQUE V1.1.0) → `10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0`.

> **Arbitrage 2026-05-01 (Créateur) :** le Manifeste est la source de vérité #1.
> Le Canon décline les règles opérationnelles sous le Manifeste.
> En cas de conflit entre les deux, le Manifeste l'emporte.

Les mentions historiques dans les HISTORIQUE de chaque document
sont conservées à titre de traçabilité — elles ne constituent pas
une référence active.

---

# QUESTIONS OUVERTES

Parkées. Vivront à mesure de l'avancée des travaux.

| Question | Impact | Quand |
|---|---|---|
| Multi-spécialité : une instance avec filtrage ou plusieurs instances ? | Architecture base | Quand Sophie Viscéral sera pilote |
| Seed L1 thesaurus : quels protocoles universels dans l'install ? | Expérience premier lancement | Quand le fork Chénieux sera testé |
| Portail premier lancement : parcours guidé ou doc statique ? | Expérience Olivia/Anne-Cécile | Session dédiée UX portail |
| Système de tickets/feedback : architecture transverse | Nouvelle table + composant | Session dédiée |
| Signalement REX terrain (matériel, formation, protocole) | Lié aux tickets | Avec les tickets |
| Indicateurs qualité / reporting Brigitte | Dashboard direction | Quand les données seront stables |
| Import/export générique inter-établissements | Portabilité | Quand multi-établissement sera réel |
| Cycle de vie du savoir (naissance → obsolescence) | Formaliser le pattern masquer/détruire | Transverse, itératif |

---

# HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-02 | 1.0.0 | Création. Session #27. Brainstorm Manu × Claude : doctrine, couches, personas, positionnement marché, périmètre, principes produit. |
| 2026-04-03 | 1.1.0 | Session #28. §9 Dette Active. §10 référence unique. Note §5. |
| 2026-04-03 | 1.2.0 | Session #28. §9 : Doc 1/2/3 passent à DETTE ACTIVE. §10 ajouté : règle de référence unique, NOYAU_VERITE caduc. §2bis réalité opératoire. §7.7 combo gagnant. Réf CTX_DOCTRINE_TERRAIN. |
| 2026-05-01 | 1.3.0 | Audit Niveau 0 — 3 correctifs. A — §10 : remplacement référence morte JOURNAL_DECISIONS (fichier supprimé) par atelier_decisions (table Supabase). B — §10 : remplacement référence morte CTX_SYSTEM_ARCHITECTURE (renommé/fusionné) par 10_ARCHITECTURE_REGLES_TECHNIQUES_V3_0_0. C — §7.7 : réconciliation combo gagnant — note ajoutée pointant la vue détaillée 12 maillons de CTX_DOCTRINE_TERRAIN V1.2.0 §4 ; les deux vues sont complémentaires (vue compacte 6 = sous-ensemble des 12). Maladies corrigées : amnésie. Interdits résolus : #3 (régression silencieuse), #4 (hallucination silencieuse). Cohérence §10 vérifiée avec Canon V1.0.5 — divergence d'ordre relatif signalée [A ARBITRER]. Motif : audit N0 gouvernance 2026-05-01. |
| 2026-05-01 | 1.3.0 (addendum) | Arbitrage §10 : Manifeste confirmé source #1. Canon = déclinaison opérationnelle. Décision Créateur. Marqueur [A ARBITRER] résolu. Question correspondante retirée de QUESTIONS OUVERTES. |
