# PHILOSOPHIE PARTICIPATIVE DB&M

```
VERSION  : 1.0.0
DATE     : 2026-04-05
AUTEUR   : Manu + Claude — Session brainstorming
STATUT   : DOCTRINE — à charger avant toute proposition de feature participative,
           collaborative, éditoriale, ou de progression utilisateur.
RÈGLE    : Ce document prime sur toute intuition de Claude sur "comment
           fonctionne un système participatif classique".
           Si Claude propose quelque chose qui contredit ce document,
           c'est Claude qui a tort.
MANIFESTE_REF : MANIFESTE_BDB_V1_2_0
```

---

## AVERTISSEMENT DE LECTURE

Ce document ne fait pas de théorie.
Il traduit trois frameworks connus (holacracy, DISC, SCRUM) en règles
opérationnelles pour BDB — et uniquement ce qui s'applique à BDB.

Le reste de ces frameworks n'existe pas pour BDB.

---

## FONDEMENT — CE QUE BDB N'EST PAS

BDB n'est pas un outil de management.
BDB n'est pas un LMS avec scores.
BDB n'est pas un réseau social professionnel.
BDB n'est pas un outil de surveillance de l'activité des soignants.

BDB est un outil de transmission du savoir opératoire,
construit par des soignants, pour des soignants,
hors de toute hiérarchie institutionnelle.

Ce contexte rend les trois frameworks ci-dessous applicables
**exactement parce que BDB est hors de la chaîne de commandement**.

---

# BLOC 1 — HOLACRACY (H1→H5)

Les principes holacratiques s'appliquent à la **gouvernance de l'app**,
pas à la gouvernance de l'établissement hospitalier.
BDB ne remet pas en question la hiérarchie médicale.
Il crée un espace où elle ne s'applique pas.

## H1 — Rôles fonctionnels, pas grades

```
PRINCIPE : admin / modérateur / membre = rôles dans l'app.
           Ce ne sont pas des grades institutionnels.
IMPLICATION : La validation de contenu par un admin est une
              fonction technique, pas un acte d'autorité hiérarchique.
INTERDIT : Présenter l'admin comme "supérieur" au membre dans l'interface.
INTERDIT : Utiliser le vocabulaire institutionnel (cadre, direction, responsable)
           pour désigner les rôles applicatifs.
```

## H2 — Canal formel pour toute tension

```
PRINCIPE : Tout désaccord, erreur signalée, suggestion d'amélioration
           est un objet traçable dans l'app.
           Aucune tension ne se perd dans le silence.
VOCABULAIRE BDB : pas "tension holacratique" — dire "signalement" ou "suggestion".
IMPLICATION : Le module feedback/tickets est transverse (P1 Manifeste).
              Il s'applique à tous les modules, pas à certains seulement.
INTERDIT : Module sans canal de feedback.
```

## H3 — Accountability par contenu, pas par propriété

```
PRINCIPE : Chaque protocole, fiche, entrée glossaire a un rôle responsable
           (quelqu'un répond des questions). Personne ne "possède" le contenu.
IMPLICATION : Un contenu peut être modifié par un membre, validé par un modérateur,
              amélioré par un autre membre — sans que le créateur ait un droit de veto.
INTERDIT : Système de "propriétaire" de contenu qui bloque les modifications.
OBLIGATOIRE : Historique de version visible (qui a modifié, quand).
```

## H4 — Instances = cercles autonomes

```
PRINCIPE : Chaque instance BDB (Chénieux, La Marche, etc.) gouverne
           son contenu L2 de manière autonome.
           Elle ne dépend pas d'une instance "parente".
IMPLICATION : Le fork d'une instance n'hérite pas des règles éditoriales
              de l'instance source. Elle repart avec le L1 universel.
INTERDIT : Décision produit hardcodée pour une seule instance.
           (Conforme Manifeste P6 — instanciable)
```

## H5 — Les règles sont lisibles et contestables

```
PRINCIPE : Les règles qui régissent BDB (INTERDIT, OBLIGATOIRE, conventions)
           sont documentées et accessibles aux membres qui veulent comprendre.
IMPLICATION : Un membre peut ouvrir un signalement sur une règle
              qui lui semble incohérente. Manu arbitre.
INTERDIT : Règle cachée ou non documentée qui affecte l'expérience utilisateur.
```

---

# BLOC 2 — MANAGEMENT PAR LES COULEURS / DISC (C1→C5 + DISC-RÈGLE-01)

L'objectif n'est pas de "catégoriser" les utilisateurs.
L'objectif est que BDB s'adapte à son audience réelle,
pas à l'audience imaginée par un créateur de profil D.

## DISC-RÈGLE-01 — La forme, jamais le fond

```
RÈGLE ABSOLUE : DISC adapte la forme (ordre, densité, ton, présentation).
                DISC n'adapte JAMAIS le fond.
                Un protocole a un seul contenu validé.
                Il n'existe pas en version D et en version S.
MOTIF : Adapter le fond par profil crée des silos comportementaux
        et des risques de divergence de contenu clinique.
```

## C1 — Onboarding différencié

```
PRINCIPE : Julie (S/C) et Olivia (D/C) n'ont pas le même parcours d'entrée.
           Pas le même rythme, pas la même porte d'entrée, pas le même premier écran.
IMPLICATION : L'onboarding propose un chemin selon le profil déclaré
              (ou déduit du test DISC si complété).
INTERDIT : Onboarding unique calqué sur le profil du créateur (D).
```

## C2 — Lecture dans les deux sens

```
PRINCIPE : D = synthèse → détail (résultat d'abord, contexte ensuite).
           C = détail → synthèse (procédure d'abord, résumé ensuite).
           I = récit → info (contexte humain d'abord, données ensuite).
           S = contexte → action (situation d'abord, que faire ensuite).
IMPLICATION : Un même contenu peut être présenté dans un ordre différent
              selon le profil dominant.
LIMITE (voir DISC-RÈGLE-01) : même contenu, ordre différent.
              Jamais contenu différent selon le profil.
```

## C3 — Feedback adapté par profil

```
PRINCIPE : D = 1 clic binaire (utile / pas utile).
           C = formulaire structuré et nuancé.
           I = champ libre narratif.
           S = guidé, sécurisé, "pas de mauvaise réponse".
IMPLICATION : Le composant feedback transverse adapte son mode
              au profil DISC déclaré ou déduit.
```

## C4 — Notifications calibrées

```
PRINCIPE : D = zéro notification sauf critique.
           S = cadence régulière et rassurante.
           I = célébration des jalons collectifs.
           C = précision technique uniquement.
INTERDIT : Notification unique pour tous les profils.
INTERDIT : Notification qui crée de l'anxiété pour un profil S.
```

## C5 — Coloration dominante = mesure vivante

```
PRINCIPE : La couleur dominante de l'app n'est pas D (Manu).
           Elle se calcule sur la distribution réelle des users connectés.
           Elle évolue à chaque nouveau profil complété.
IMPLICATION : L'admin voit la distribution DISC agrégée (RPC disc_distribution).
              L'interface adapte ses priorités d'affichage à cette distribution.
INTERDIT : Figer la coloration dominante à la création de l'instance.
SQL REF   : RPC disc_distribution() — SECURITY DEFINER, zéro user_id exposé.
```

---

# BLOC 3 — SCRUM PAR SPRINT (S1→S5)

SCRUM pour BDB = Kanban solo, pas sprint d'équipe.
Pas de daily standup. Pas de planning poker.
Ce qui s'applique : le rythme itératif et les états explicites.

## S1 — Definition of Done par type de contenu

```
PRINCIPE : Chaque type de contenu a une définition de "complet".
           Un contenu sans DoD explicite ne peut pas être considéré complet.
IMPLÉMENTATION :
  - Protocole complet = Combo gagnant (MANIFESTE §7.7)
  - Fiche complète = à définir (session dédiée)
  - Entrée glossaire complète = terme + définition + catégorie + variantes
  - Cours complet = à définir (session dédiée)
```

## S2 — User stories comme format de spécification

```
PRINCIPE : Chaque CTX module reformule les fonctionnalités en :
           "Julie peut… / Olivia peut… / Admin peut…"
           Ces phrases sont les tests d'acceptance natifs.
IMPLICATION : Toute fonctionnalité sans user story ne peut pas être recettée.
```

## S3 — Indicateur de complétude (pas vélocité)

```
PRINCIPE : Combien de protocoles passent à "complet" par session ?
           Indicateur de santé du projet.
VOCABULAIRE BDB : pas "vélocité SCRUM" — dire "indicateur de complétude".
INTERDIT : Utiliser cet indicateur pour évaluer la performance d'un membre.
           C'est un indicateur produit, pas un indicateur RH.
```

## S4 — Kanban éditorial

```
PRINCIPE : Tout contenu créé par un membre suit un workflow d'états explicite.
ÉTATS :
  brouillon → soumis → en_révision → validé → publié → archivé
RÈGLES DE TRANSITION :
  - brouillon → soumis : action explicite du membre (pas automatique)
  - soumis → en_révision : admin ou modérateur expert du domaine
  - en_révision → validé : admin ou modérateur (validation technique)
  - validé → publié : admin uniquement
  - publié → archivé : admin uniquement (masquer ≠ détruire, MANIFESTE P3)
SQL IMPLICATION : Toute table de contenu éditorial inclut une colonne
                  statut TEXT CHECK ('brouillon','soumis','en_revision',
                  'valide','publie','archive') DEFAULT 'brouillon'.
```

## S5 — Rétrospective doctrine

```
PRINCIPE : Chaque clôture de session = opportunité de réviser une règle.
           Les INTERDIT ne sont pas éternels — ils se révisent par arbitrage.
IMPLICATION : Un INTERDIT peut devenir obsolète si le terrain change.
              Un OBLIGATOIRE peut devenir optionnel si l'usage le justifie.
PROCESSUS : Signalement → atelier_arbitrages → décision Manu → atelier_principes.
```

---

# BLOC 4 — PRINCIPES PARTICIPATIFS TRANSVERSES (P1→P7)

Ces principes sont issus de la doctrine BDB terrain.
Ils transcendent les trois frameworks ci-dessus.

## P1 — Démocratie participative

```
RÈGLE : 1 user = 1 vote par item. Immuable.
SQL   : UNIQUE(user_id, item_id) sur toute table de vote/sondage.
INTERDIT : Permettre plusieurs votes par user sur le même item.
INTERDIT : Vote pondéré par le rôle (admin ne vaut pas 2 voix).
MOTIF : L'égalité des voix est la base de la participation honnête.
        Plusieurs votes = triche + distorsion des statistiques.
```

## P2 — Wiki modéré (pas censuré)

```
RÈGLE : Tout membre peut créer et proposer du contenu.
        La publication est bloquée jusqu'à validation.
        La validation est une sécurité technique, pas un acte de censure.
RÔLES DE VALIDATION :
  - Admin : peut valider tout contenu
  - Modérateur : expert du domaine cible uniquement
INTERDIT : Admin qui bloque un contenu pour des raisons non techniques.
INTERDIT : Validation comme levier de pouvoir personnel.
```

## P3 — Progression Spirale Dynamique

```
RÈGLE : Le contenu BDB est structuré par niveaux Spirale (Beige → Vert).
        Chaque entrée de contenu a un niveau déclaré.
        La progression est ascendante : débutant → intermédiaire → expert.
IMPLICATION : Julie (Beige/Violet) accède au même contenu que Sabine (Orange/Vert)
              mais avec une présentation adaptée à son niveau de maturité.
SQL   : Colonne niveau_spirale TEXT (ou enum) sur les tables de contenu.
INTERDIT : Contenu expert imposé à un profil débutant sans palier intermédiaire.
```

## P4 — Anonymat garanti pour la progression personnelle

```
RÈGLE : Tout test (DISC, PAXIS, progression) est réalisable de manière anonyme.
        Les résultats individuels ne sont jamais exposés aux pairs.
IMPLICATION : Un membre peut suivre sa progression sans être jugé ni classé.
SQL   : Zéro user_id exposé dans les vues agrégées ou les dashboards membres.
        Les RPCs d'agrégation utilisent SECURITY DEFINER sans retourner user_id.
INTERDIT : Classement nominatif entre membres.
INTERDIT : "Voir qui a complété quoi" pour les pairs (visible admin uniquement,
           agrégé).
```

## P5 — Calibration collective itérative

```
RÈGLE : L'admin voit la distribution agrégée (niveaux, profils, complétude).
        Il ajuste les niveaux de contenu si la distribution le justifie.
        Ce calibrage est itératif — pas fixé à la création de l'instance.
EXEMPLE : Si 80% des membres sont classés "expert" sur un module,
          le module est sous-évalué. L'admin remonte les niveaux.
INTERDIT : Calibration basée sur le profil individuel d'un membre nommé.
STATUT   : Méthode de calibration à définir en itérations (pas figée V1.0.0).
```

## P6 — Reconnaissance sans classement

```
RÈGLE : Le niveau d'expertise d'un membre est visible pour lui-même.
        Il est visible pour l'admin (agrégé).
        Il n'est jamais un classement entre membres.
USAGE LÉGITIME : Savoir vers qui se tourner sur un domaine précis
                 (reconnaissance des experts = annuaire de compétences).
INTERDIT : Top 10 des membres les plus actifs.
INTERDIT : "X a complété Y protocoles cette semaine."
OBLIGATOIRE : La reconnaissance est fonctionnelle (je sais qui sait),
              jamais compétitive (je sais qui est meilleur).
```

## P7 — Admin = santé de l'app, pas contrôle des users

```
RÈGLE FONDATRICE : L'admin voit tout pour maintenir la santé de l'application.
                   Pas pour surveiller les utilisateurs.
LÉGITIMES (admin) :
  - Distribution DISC agrégée
  - Taux de complétude par module (anonyme)
  - Contenus en attente de validation
  - Erreurs SQL, liaisons cassées, orphelins
  - Calibration des niveaux
NON LÉGITIMES (admin) :
  - "Qui a lu tel protocole ?"
  - "Combien de fois X s'est connecté ?"
  - "X n'a pas complété son profil depuis N jours."
  - Tout nudge nominatif vers un membre spécifique.
```

---

# BLOC 5 — CHECKLIST CLAUDE AVANT TOUTE PROPOSITION PARTICIPATIVE

Avant de proposer une feature impliquant votes, sondages, progression,
feedback, collaboration éditoriale, ou notifications :

```
[ ] P1 — Est-ce que ça permet plusieurs votes/user/item ?        → STOP si oui
[ ] P2 — Est-ce que ça publie sans validation ?                  → STOP si oui
[ ] P4 — Est-ce que ça expose un individu à ses pairs ?          → STOP si oui
[ ] P6 — Est-ce que ça crée un classement nominatif ?            → STOP si oui
[ ] P7 — Est-ce que l'admin voit des données nominatives ?       → STOP si oui
[ ] DISC-R01 — Est-ce que ça crée deux versions de fond ?        → STOP si oui
[ ] S4 — Est-ce que le workflow éditorial est explicite ?        → OBLIGATOIRE
[ ] H3 — Est-ce que quelqu'un "possède" le contenu ?             → STOP si oui
```

Si un seul STOP est déclenché → signaler le conflit à Manu avant de proposer
une alternative.

---

# BLOC 6 — IMPLICATIONS SQL TRANSVERSES

Ces patterns s'appliquent à toute future table participative.
Ils ne créent pas de migration immédiate — ils définissent les contraintes
à respecter lors des créations futures.

```sql
-- PATTERN VOTE (P1)
-- Toute table de vote doit inclure :
UNIQUE (user_id, item_id)  -- 1 vote / user / item, immuable

-- PATTERN STATUT ÉDITORIAL (S4)
-- Toute table de contenu éditorial doit inclure :
statut TEXT NOT NULL DEFAULT 'brouillon'
  CHECK (statut IN ('brouillon','soumis','en_revision','valide','publie','archive'))

-- PATTERN AGRÉGATION ANONYME (P4)
-- Toute RPC de dashboard admin retourne des agrégats, jamais user_id :
-- SELECT disc_dominant, COUNT(*) FROM disc_conclusions GROUP BY disc_dominant
-- Jamais : SELECT user_id, disc_dominant FROM disc_conclusions

-- PATTERN NIVEAU SPIRALE (P3)
-- Toute table de contenu pédagogique inclut :
niveau_spirale TEXT CHECK (niveau_spirale IN (
  'beige','violet','rouge','bleu','orange','vert'
)) DEFAULT 'beige'
```

---

# BLOC 7 — CE QUE CE DOCUMENT NE COUVRE PAS

- Les modules existants déjà livrés → leurs CTX restent la référence
- La gouvernance institutionnelle de l'hôpital → hors scope BDB
- La méthode de calibration Spirale → à définir en itérations
- Les sprints de développement Manu → Kanban personnel, pas SCRUM formel
- La théorie complète de la holacratie, DISC ou SCRUM → non nécessaire

---

# HISTORIQUE

| Date | Version | Action |
|---|---|---|
| 2026-04-05 | 1.0.0 | Création. Session brainstorming Manu × Claude. Arbitrage Perplexity intégré. 7 principes P + 5 H + 5 C + 5 S + DISC-RÈGLE-01. |
| 2026-05-01 | — (renommage) | Préfixe aligné 00_ → 0000_ (étage 6 STRUCTURE_CIBLE). Nom projet aligné BDB → DB&M dans filename et titre principal. Motif : audit N0 gouvernance 2026-05-01, P2.4. |
