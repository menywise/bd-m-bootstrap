# S#108 — Audit GPS — Inventaire fichiers

## Date : 2026-04-26

Audit READ-ONLY. Aucun fichier source modifié. Aucun code produit. Aucun SQL exécuté.
Périmètre : `site/` (mini-site public) + `modules/` (27 modules BDB).
Hors périmètre : `atelier/`, `conseil/` (mention unique pour `atelier/doctrine/admin.html`).

---

## 1. Promesses mini-site

### index.html — Accueil — Présentation BDB

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Tu n'as pas à tout savoir seul." | philosophie | global |
| 2 | "Ce que tu cherches est peut-être déjà là" | fonctionnalité | fiches |
| 3 | "Ce que tu sais mérite de rester après ton départ" | garantie | global |
| 4 | "C'est la mémoire de l'équipe — disponible, sans déranger" | philosophie | global |
| 5 | "Tu tapes un mot. BDB trouve" | fonctionnalité | fiches |
| 6 | "Ce que tu sais, tu l'écris une fois. L'app répond après" | fonctionnalité | transmissions |
| 7 | "Ce que l'équipe a construit ne part plus avec ceux qui partent" | garantie | global |
| 8 | "La réponse est là en 10 secondes — personne dérangé" | bénéfice | fiches |
| 9 | "Les nouveaux s'intègrent plus vite" | bénéfice | global |
| 10 | "Moins de frictions, plus de fluidité" | bénéfice | global |
| 11 | "Des équipes mieux préparées" | bénéfice | global |

### vision.html — Pourquoi Bible de Bloc existe

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Le savoir oral disparaît à chaque départ et recommence à zéro" | philosophie | global |
| 2 | "Les anciens s'épuisent à répéter. Les nouveaux n'osent plus demander" | philosophie | global |
| 3 | "Les questions simples trouvent réponse dans l'app" | fonctionnalité | fiches |
| 4 | "Les anciens gagnent du temps pour les vraies conversations" | bénéfice | global |
| 5 | "Les nouveaux gagnent l'autonomie de chercher avant de demander" | bénéfice | global |
| 6 | "On cherche — on trouve seul" | fonctionnalité | fiches |
| 7 | "Le savoir est dans l'app, signé, daté" | garantie | global |
| 8 | "Ce qu'il a écrit reste pour tout le monde" | garantie | global |
| 9 | "Ils répondent une fois. L'app gère après" | fonctionnalité | global |
| 10 | "L'app accompagne la montée en compétence à ton rythme" | fonctionnalité | cours |
| 11 | "Chaque étape validée est tracée pour toi et ton cadre" | fonctionnalité | carnet-bord |

### fonctionnalites.html — Ce que Bible de Bloc fait concrètement

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Tu tapes un mot. BDB cherche dans trois directions" | fonctionnalité | fiches |
| 2 | "La recherche est tolérante — 'S3' trouve 'Salle 3'" | fonctionnalité | fiches |
| 3 | "Les mots-clés s'organisent seuls, synonymes gérés" | fonctionnalité | thesaurus |
| 4 | "Tu n'as pas besoin du mot exact pour trouver" | fonctionnalité | fiches |
| 5 | "Quand tu ne trouves pas, l'app propose trois options" | fonctionnalité | fiches |
| 6 | "Les trous de documentation sont identifiés et signalés" | mécanisme | ? |
| 7 | "Les fiches sont validées par un groupe de référents" | garantie | fiches |
| 8 | "L'équipe sait avant d'entrer en salle si c'est la première fois" | bénéfice | fiches |
| 9 | "Contributions spontanées peuvent être écrites une fois" | fonctionnalité | transmissions |
| 10 | "Ne jamais avoir à répéter ce que tu connais" | bénéfice | transmissions |
| 11 | "BDB est conçu pour le téléphone, pas un bureau" | philosophie | global |
| 12 | "Tu cherches debout, en 5 secondes, sans déranger" | fonctionnalité | fiches |
| 13 | "Certaines infos s'archivent automatiquement à l'échéance" | mécanisme | fiches |
| 14 | "Infos permanentes créent versions à chaque modification" | mécanisme | fiches |
| 15 | "L'historique des changements est visible" | garantie | fiches |
| 16 | "La contribution d'origine reste attribuée" | garantie | fiches |
| 17 | "Triple légitimité : validé officiel, expert reconnu, ou usage éprouvé" | mécanisme | fiches |
| 18 | "Tout est tracé — on sait qui écrit quoi et quand" | garantie | global |
| 19 | "Tu peux signaler une info douteuse avec un bouton contester" | fonctionnalité | fiches |
| 20 | "Tu choisis ta visibilité — nom ou équipe" | fonctionnalité | global |
| 21 | "Pas de classement des contributions individuelles" | philosophie | global |
| 22 | "La version est visible — tu sais si c'est récent" | garantie | fiches |
| 23 | "L'auteur est visible — tu sais d'où ça vient" | garantie | fiches |
| 24 | "Les modifications sont visibles — tu vois l'évolution" | garantie | fiches |

### audiences.html — Pour qui ?

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Tu cherches seul — pas besoin de déranger quelqu'un" | bénéfice | fiches |
| 2 | "Personne ne juge — tu cherches discrètement à ton rythme" | garantie | global |
| 3 | "Tu progresses — infos clés accessibles quand tu en as besoin" | bénéfice | cours |
| 4 | "Écrire une fois ce que tu sais, l'app répond après" | fonctionnalité | transmissions |
| 5 | "Les questions simples trouvent réponse sans toi" | fonctionnalité | fiches |
| 6 | "Ton expertise est attribuée. Ton savoir survit à ton départ" | garantie | global |
| 7 | "Tu contribues quand tu veux. Une entrée utile > dix vides" | philosophie | global |
| 8 | "Moins de questions répétitives, moins d'impatiences" | bénéfice | global |
| 9 | "Le savoir ne part plus avec les individus" | garantie | global |
| 10 | "Les nouvelles arrivées s'intègrent plus vite" | bénéfice | global |
| 11 | "Ce que l'équipe a construit est consultable" | fonctionnalité | global |
| 12 | "Aucune donnée patient dans BDB" | garantie | global |
| 13 | "Aucun protocole médical opposable" | garantie | global |
| 14 | "Zéro coût IT, zéro données patient, zéro risque juridique" | garantie | global |
| 15 | "Les nouveaux trouvent l'info sans attendre" | bénéfice | fiches |
| 16 | "Le temps d'autonomie opérationnelle se réduit" | bénéfice | global |
| 17 | "Le départ d'un expert ne détruit plus son savoir" | garantie | global |
| 18 | "La continuité ne dépend plus des individus seuls" | garantie | global |
| 19 | "Réduction des tensions liées aux questions répétitives" | bénéfice | global |
| 20 | "L'IDE arrive mieux préparée" | bénéfice | fiches |
| 21 | "Moins d'interruptions pendant l'intervention" | bénéfice | global |
| 22 | "Vos préférences documentées, l'équipe sait" | fonctionnalité | fiches |
| 23 | "Fluidité opératoire — bon matériel, au bon endroit, connu par tous" | bénéfice | arsenal |

### adoption.html — Comment BDB s'installe dans une équipe

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "BDB n'est pas imposé" | philosophie | global |
| 2 | "Ceux qui trouvent utile l'utilisent. Les autres font leur choix" | philosophie | global |
| 3 | "Plus c'est utilisé, plus c'est utile" | fonctionnalité | global |
| 4 | "Chaque contribution enrichit l'app pour tout le monde" | philosophie | global |
| 5 | "La valeur doit être immédiate — 10 secondes" | philosophie | global |
| 6 | "Si tu n'as pas trouvé quelque chose d'utile, c'est l'app qui a un problème" | philosophie | global |
| 7 | "2 ou 3 personnes motivées créent les premières fiches essentielles" | mécanisme | fiches |
| 8 | "5 à 10 personnes respectées testent et en parlent" | mécanisme | global |
| 9 | "BDB devient normal quand on en parle dans les couloirs" | mécanisme | global |
| 10 | "Les nouveaux découvrent naturellement, ce qu'on sait ne disparaît plus" | bénéfice | global |
| 11 | "Les mêmes questions reviennent moins souvent" | bénéfice | global |
| 12 | "L'ambiance dans l'équipe s'améliore" | bénéfice | global |
| 13 | "On cherche avant de demander" | bénéfice | fiches |
| 14 | "Un chirurgien convaincu change tout pour une équipe" | bénéfice | global |

### instances.html — BDB en production

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "BDB est actuellement déployé dans un bloc opératoire réel" | bénéfice | global |
| 2 | "Chaque entrée = une question posée en moins à l'oral" | bénéfice | fiches |
| 3 | "Une recherche faite en autonomie, un doute levé avant salle" | bénéfice | fiches |
| 4 | "Le vocabulaire chirurgical partagé — accès dès le premier jour" | bénéfice | glossaire |
| 5 | "Les pratiques structurées ne dépendent plus d'un seul individu" | garantie | fiches |
| 6 | "Le contexte réglementaire CCAM complet et intégré" | fonctionnalité | arsenal |
| 7 | "BDB ne nécessite ni serveur propre ni équipe IT dédiée" | garantie | global |
| 8 | "Un déploiement complet se fait en moins d'un mois" | fonctionnalité | global |
| 9 | "Aucun serveur à provisionner" | garantie | global |
| 10 | "Zéro coût IT initial" | garantie | global |
| 11 | "Le programme opératoire est importé progressivement" | fonctionnalité | arsenal |
| 12 | "Pas de formation obligatoire — interface conçue pour être trouvable" | philosophie | global |
| 13 | "L'équipe accède sur ses propres appareils" | fonctionnalité | global |
| 14 | "BDB grandit avec les pratiques sans maintenance centralisée" | mécanisme | global |
| 15 | "Cohésion d'équipe renforcée, moins de tensions d'information" | bénéfice | global |
| 16 | "L'ancien s'épuise moins à transmettre à chaque nouveau" | bénéfice | global |
| 17 | "Un nouveau trouve repères sans monopoliser l'attention des autres" | bénéfice | global |
| 18 | "Le délai avant autonomie réelle se réduit significativement" | bénéfice | global |
| 19 | "Quand protocole accessible avant salle, oublis diminuent" | bénéfice | fiches |
| 20 | "Une équipe qui cherche moins improvise moins" | bénéfice | global |
| 21 | "Zéro donnée de santé nominative" | garantie | global |
| 22 | "Zéro infrastructure à maintenir" | garantie | global |
| 23 | "Fonctionne sur navigateur ou smartphone existant" | garantie | global |
| 24 | "Aucun serveur local, aucune installation poste par poste" | garantie | global |
| 25 | "Zéro coût de licence utilisateur" | garantie | global |
| 26 | "Accès ouvert à tout le bloc sans coût par tête" | garantie | global |
| 27 | "Zéro dépendance à un éditeur — données vous appartiennent" | garantie | global |
| 28 | "Export possible à tout moment" | garantie | global |

### risques.html — Ce qui pourrait mal tourner

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Identifier risques avant les subir" | philosophie | global |
| 2 | "Chaque risque listé a un garde-fou concret" | mécanisme | global |
| 3 | "Ce n'est pas de la précaution rhétorique — c'est réellement construit" | garantie | global |
| 4 | "BDB n'est pas imposé — sans pression, sans compte à rendre" | philosophie | global |
| 5 | "Distinguer utile immédiat de vision long terme" | mécanisme | global |
| 6 | "Tester avec ceux qui n'ont pas demandé à être testés" | mécanisme | global |
| 7 | "Tester avec quelqu'un vraiment nouveau — premier jour" | mécanisme | global |
| 8 | "Si ça bloque, c'est l'app qui a un problème" | philosophie | global |
| 9 | "Documenter aussi les non-réactions" | mécanisme | global |
| 10 | "Pas de classement individuel, pas de compteur visible" | philosophie | global |
| 11 | "Une entrée utile vaut mieux que dix entrées vides" | philosophie | global |
| 12 | "Mesurer changements de comportement, pas connexions" | mécanisme | global |
| 13 | "Les gens posent moins de questions répétitives" | bénéfice | global |
| 14 | "Conseil des 5 challenge chaque décision de conception" | mécanisme | global |
| 15 | "Aucune fonction ne passe sans validation du Conseil" | mécanisme | global |
| 16 | "LIBRARIAN vérifie cohérence avec ce qui existe" | mécanisme | global |
| 17 | "ARCHITECT valide faisabilité technique et cohérence" | mécanisme | global |
| 18 | "SLICER coupe ce qui n'est pas essentiel" | mécanisme | global |
| 19 | "FIELD_OP teste vraiment sur le terrain, pas au bureau" | mécanisme | global |
| 20 | "SKEPTIC cherche ce qui n'a pas été vu" | mécanisme | global |
| 21 | "Qu'est-ce que ça change en 10 secondes ?" | mécanisme | global |
| 22 | "Qui va en parler autour de lui ?" | mécanisme | global |
| 23 | "À quel moment précis sera-t-elle ouverte ?" | mécanisme | global |

### faq.html — Les questions qu'on se pose

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "L'équipe prendra en compte ta question" | garantie | global |

### glossaire.html — Lexique BDB

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Termes du projet, méthodes, outils — expliqués simplement" | fonctionnalité | glossaire |

### accessibilite.html — Accessibilité

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Bible de Bloc s'engage à rendre son app accessible" | garantie | global |
| 2 | "Conforme WCAG 2.1 niveau AA" | garantie | global |
| 3 | "Fonctionne sur smartphone, tablette, ordinateur" | garantie | global |
| 4 | "Accessible dans contextes quotidiens : bureau, pause, domicile" | garantie | global |
| 5 | "Partiellement conforme WCAG 2.1 AA (auto-évaluation)" | garantie | global |
| 6 | "Audit porte sur 32 règles UX en 9 catégories" | mécanisme | global |
| 7 | "Interaction : 6 règles conformes" | garantie | global |
| 8 | "Chargement/états : 3 règles conformes" | garantie | global |
| 9 | "Recherche/filtres : 3 règles conformes" | garantie | global |
| 10 | "Formulaires : 3 règles conformes" | garantie | global |
| 11 | "Mobile/tactile : 4 règles conformes" | garantie | global |
| 12 | "WCAG A : 7 règles conformes" | garantie | global |
| 13 | "WCAG AA : 4 règles partiellement conformes" | garantie | global |
| 14 | "Navigation : 1 règle conforme" | garantie | global |
| 15 | "Performance : 1 règle conforme" | garantie | global |
| 16 | "Contraste des bordures : correction planifiée" | mécanisme | global |
| 17 | "Reflow à 320px : certains écrans d'admin non optimisés" | mécanisme | global |
| 18 | "Chrome 90+, Safari 15+, Firefox 90+, Edge 90+" | garantie | global |
| 19 | "Chaque signalement sera pris en compte" | garantie | global |

### pas-app.html — Ce que BDB n'est pas

| # | Promesse (verbatim ou résumé fidèle ≤120 caractères) | Type | Module BDB supposé |
|---|---|---|---|
| 1 | "Les limites sont des choix réfléchis, pas des oublis" | philosophie | global |
| 2 | "Elles permettent à l'app de rester utile et sans risque" | philosophie | global |
| 3 | "Pas un outil d'urgence — pour temps libre, pas intervention" | philosophie | global |
| 4 | "Quand gants mis, l'app reste dans la poche" | philosophie | global |
| 5 | "Prépare — n'intervient pas à la place du professionnel" | garantie | global |
| 6 | "Zéro donnée patient" | garantie | global |
| 7 | "Zéro protocole médical opposable" | garantie | global |
| 8 | "Savoir opérationnel, pas responsabilité juridique" | garantie | global |
| 9 | "Pas de données sensibles, rien d'opposable" | garantie | global |
| 10 | "N'est pas imposé. Personne ne sait qui consulte quoi" | garantie | global |
| 11 | "Pas de classement, pas de métriques nominatives" | garantie | global |
| 12 | "Pas de rapport à la hiérarchie" | garantie | global |
| 13 | "Tu l'utilises si envie. Sans pression, sans compte à rendre" | philosophie | global |
| 14 | "Pas une encyclopédie — nombre limité de fiches essentielles" | philosophie | global |
| 15 | "Ce qui revient le plus souvent, coûte le plus à chercher" | fonctionnalité | fiches |
| 16 | "L'essentiel, pas l'exhaustif" | philosophie | global |
| 17 | "Une ressource opérationnelle, pas dictionnaire infini" | philosophie | global |
| 18 | "Ne règle pas problèmes relationnels" | philosophie | global |
| 19 | "Ne remplace pas conversation difficile" | philosophie | global |
| 20 | "Ne fait pas disparaître tensions existantes" | philosophie | global |
| 21 | "Un outil aide ceux qui veulent s'en servir" | philosophie | global |
| 22 | "Ne change pas ce qui relève des personnes" | philosophie | global |
| 23 | "Les conversations ne disparaissent pas" | philosophie | global |
| 24 | "Questions complexes, cas particuliers — restent entre humains" | philosophie | global |
| 25 | "Questions simples dans l'app, vraies conversations libérées" | fonctionnalité | fiches |
| 26 | "Ne cherche pas convaincre tout le monde" | philosophie | global |
| 27 | "Ceux n'en ayant besoin : système actuel fonctionne pour eux" | philosophie | global |
| 28 | "Ceux préférant oral : coexiste sans remplacer" | philosophie | global |
| 29 | "Contribuer est toujours un choix" | philosophie | global |
| 30 | "Chercher sans écrire est valide" | philosophie | global |
| 31 | "Simple — nombre raisonnable de fiches, pas base infinie" | garantie | global |
| 32 | "Sans risque juridique — aucune donnée sensible" | garantie | global |
| 33 | "Libre — aucune obligation, aucune surveillance" | garantie | global |
| 34 | "Complémentaire — en plus de ce qui existe" | garantie | global |

---

## 2. Inventaire modules

### admin
- Fichiers HTML : index.html
- Fichiers JS : admin-app.js, admin-annuaire-app.js, admin-preferences-app.js
- Fichiers CSS : (aucun)
- Admin existant : non (c'est un hub admin, pas un module métier)
- Lignes JS principales : admin-app.js = 2277 lignes

### anatomie
- Fichiers HTML : index.html, admin.html
- Fichiers JS : anatomie-app.js
- Fichiers CSS : anatomie-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : anatomie-app.js = 1061 lignes

### annuaire
- Fichiers HTML : index.html, admin.html
- Fichiers JS : annuaire-app.js, annuaire-admin.js
- Fichiers CSS : annuaire-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : annuaire-app.js = 741 lignes

### arsenal
- Fichiers HTML : index.html, admin.html
- Fichiers JS : arsenal-app.js
- Fichiers CSS : arsenal-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : arsenal-app.js = 892 lignes

### boite-a-idees
- Fichiers HTML : index.html, admin.html
- Fichiers JS : boite-a-idees.js
- Fichiers CSS : boite-a-idees-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : boite-a-idees.js = 982 lignes

### carnet-bord
- Fichiers HTML : index.html, admin.html
- Fichiers JS : (aucun fichier app.js dans le dossier — script inline dans index.html)
- Fichiers CSS : carnet-bord-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : n/a (script inline dans index.html)

### cours
- Fichiers HTML : index.html, admin.html, edit.html, view.html
- Fichiers JS : cours-app.js, view-app.js, edit-app.js
- Fichiers CSS : cours-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : cours-app.js = 537 lignes

### disc
- Fichiers HTML : index.html, admin.html
- Fichiers JS : disc-controller.js, disc-engine.js, disc-persona-store.js, disc-profil-service.js, disc-scenarios.js, disc-schema.js, disc-tests.js
- Fichiers CSS : disc-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : disc-controller.js = 881 lignes

### faq
- Fichiers HTML : index.html, admin.html
- Fichiers JS : faq-app.js, faq-admin.js
- Fichiers CSS : faq-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : faq-app.js = 360 lignes

### fiches
- Fichiers HTML : index.html, admin.html
- Fichiers JS : fiches-app.js, fiches-admin.js
- Fichiers CSS : fiches-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : fiches-app.js = 647 lignes

### ged
- Fichiers HTML : (aucun)
- Fichiers JS : (aucun)
- Fichiers CSS : (aucun)
- Admin existant : non
- Lignes JS principales : n/a (dossier vide ou non implémenté)

### glossaire
- Fichiers HTML : index.html, admin.html
- Fichiers JS : glossaire-app.js
- Fichiers CSS : glossaire-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : glossaire-app.js = 1418 lignes

### installation
- Fichiers HTML : index.html, admin.html
- Fichiers JS : installation-app.js
- Fichiers CSS : installation-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : installation-app.js = 703 lignes

### interview
- Fichiers HTML : index.html, admin.html
- Fichiers JS : interview-admin.js
- Fichiers CSS : interview-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : interview-admin.js = 807 lignes (pas d'app.js — fichier admin est principal)

### medacta-coste
- Fichiers HTML : index.html
- Fichiers JS : medacta-coste-app.js, medacta-coste-analytics.js, medacta-coste-jointures.js
- Fichiers CSS : medacta-coste-ui.css
- Admin existant : non
- Lignes JS principales : medacta-coste-app.js = 487 lignes

### objectifs
- Fichiers HTML : index.html, admin.html
- Fichiers JS : objectifs-app.js
- Fichiers CSS : objectifs-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : objectifs-app.js = 817 lignes

### organisateur
- Fichiers HTML : index.html, admin.html
- Fichiers JS : organisateur-app.js, organisateur-admin.js
- Fichiers CSS : organisateur-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : organisateur-app.js = 688 lignes

### pedagogie
- Fichiers HTML : (dossier inexistant)
- Fichiers JS : n/a
- Fichiers CSS : n/a
- Admin existant : non
- Lignes JS principales : n/a

### planning
- Fichiers HTML : index.html, admin.html, analytics.html, export.html, planning.html
- Fichiers JS : planning-core.js, planning-controller.js, planning-admin.js, planning-analytics.js, planning-availability.js, planning-batch-modals.js, planning-events.js, planning-export.js, planning-matrix.js, planning-members.js, planning-modal.js, planning-schema.js, planning-slot-editor.js, analytics-app.js, dashboard-app.js, export-controller.js
- Fichiers CSS : analytics-ui.css, dashboard-ui.css, planning-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : planning-controller.js = 655 lignes (planning-core.js = 129 lignes)

### preferences
- Fichiers HTML : index.html, admin.html
- Fichiers JS : preferences-app.js
- Fichiers CSS : preferences-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : preferences-app.js = 1086 lignes

### profile
- Fichiers HTML : index.html
- Fichiers JS : (aucun fichier JS dans le dossier — script inline dans index.html)
- Fichiers CSS : profile-ui.css
- Admin existant : non
- Lignes JS principales : n/a (script inline)

### recueil-situation
- Fichiers HTML : (dossier inexistant)
- Fichiers JS : n/a
- Fichiers CSS : n/a
- Admin existant : non
- Lignes JS principales : n/a

### supervision
- Fichiers HTML : index.html
- Fichiers JS : supervision-app.js
- Fichiers CSS : (aucun)
- Admin existant : non
- Lignes JS principales : supervision-app.js = 1487 lignes

### template
- Fichiers HTML : _TEMPLATE_MODULE_V5_0_1.html
- Fichiers JS : (aucun)
- Fichiers CSS : (aucun)
- Admin existant : non (squelette de référence)
- Lignes JS principales : n/a

### thesaurus
- Fichiers HTML : index.html, admin.html, rapprochement_fiches.html
- Fichiers JS : thesaurus-app.js, thesaurus-admin.js, thesaurus-analytics.js, thesaurus-ccam.js, thesaurus-rapprochement-data.js, thesaurus-rapprochement.js, thesaurus-recat.js
- Fichiers CSS : thesaurus-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : thesaurus-app.js = 648 lignes

### transmissions
- Fichiers HTML : index.html, admin.html
- Fichiers JS : transmissions-app.js, transmissions-admin.js
- Fichiers CSS : transmissions-ui.css
- Admin existant : oui (fichier=admin.html)
- Lignes JS principales : transmissions-app.js = 826 lignes

### veille-documentaire
- Fichiers HTML : index.html, admin.html, admin-bao.html, admin-bao-deepseek.html, admin-sources-institutionnelles.html
- Fichiers JS : veille-documentaire-app.js, veille-documentaire-admin.js, veille-documentaire-data.js, veille-documentaire-engine.js, veille-documentaire-render.js, veille-documentaire-state.js, admin-bao.js, admin-sources-institutionnelles.js, admin-bao-deepseek.js
- Fichiers CSS : veille-documentaire-ui.css
- Admin existant : oui (fichier=admin.html + 3 admins spécialisés)
- Lignes JS principales : veille-documentaire-app.js = 612 lignes

---

## 3. Pages admin existantes

| Fichier | Chemin complet | Module ciblé | Type |
|---|---|---|---|
| admin.html | modules/anatomie/admin.html | anatomie | standalone |
| admin.html | modules/annuaire/admin.html | annuaire | standalone |
| admin.html | modules/arsenal/admin.html | arsenal | standalone |
| admin.html | modules/boite-a-idees/admin.html | boite-a-idees | standalone |
| admin.html | modules/carnet-bord/admin.html | carnet-bord | standalone |
| admin.html | modules/cours/admin.html | cours | standalone |
| admin.html | modules/disc/admin.html | disc | standalone |
| admin.html | modules/faq/admin.html | faq | standalone |
| admin.html | modules/fiches/admin.html | fiches | standalone |
| admin.html | modules/glossaire/admin.html | glossaire | standalone |
| admin.html | modules/installation/admin.html | installation | standalone |
| admin.html | modules/interview/admin.html | interview | standalone |
| admin.html | modules/objectifs/admin.html | objectifs | standalone |
| admin.html | modules/organisateur/admin.html | organisateur | standalone |
| admin.html | modules/planning/admin.html | planning | standalone |
| admin.html | modules/preferences/admin.html | preferences | standalone |
| admin.html | modules/thesaurus/admin.html | thesaurus | standalone |
| admin.html | modules/transmissions/admin.html | transmissions | standalone |
| admin.html | modules/veille-documentaire/admin.html | veille-documentaire | standalone |
| admin-bao.html | modules/veille-documentaire/admin-bao.html | veille-documentaire | standalone (spécialisé) |
| admin-bao-deepseek.html | modules/veille-documentaire/admin-bao-deepseek.html | veille-documentaire | standalone (spécialisé) |
| admin-sources-institutionnelles.html | modules/veille-documentaire/admin-sources-institutionnelles.html | veille-documentaire | standalone (spécialisé) |
| index.html | modules/admin/index.html | (transverse) | hub |
| admin.html | atelier/doctrine/admin.html | (hors périmètre BDB) | standalone |

---

## 4. Statistiques

- Total pages mini-site lues : **11** (hors `_TEMPLATE_MINISITE_V5_0_1.html`)
- Total promesses extraites : **177**
  - index.html : 11
  - vision.html : 11
  - fonctionnalites.html : 24
  - audiences.html : 23
  - adoption.html : 14
  - instances.html : 28
  - risques.html : 23
  - faq.html : 1
  - glossaire.html : 1
  - accessibilite.html : 19
  - pas-app.html : 34
- Total modules inventoriés : **27**
- Modules avec admin (standalone) : **19 / 27**
- Modules sans admin : **admin** (hub transverse), **ged** (dossier vide), **medacta-coste**, **pedagogie** (dossier inexistant), **profile**, **recueil-situation** (dossier inexistant), **supervision**, **template** (squelette)

### Répartition par type de promesse

| Type | Approx. nombre |
|---|---|
| garantie | ~70 |
| philosophie | ~50 |
| fonctionnalité | ~25 |
| bénéfice | ~20 |
| mécanisme | ~12 |

(Comptage approximatif sur les 177 promesses extraites — à recompter précisément si exploitation analytique nécessaire.)

### Modules les plus promis dans le mini-site

- **fiches** : module dominant (recherche, validation, traçabilité, signalement)
- **transmissions** : "écrire une fois, l'app répond après"
- **arsenal** : matériel / CCAM / fluidité opératoire
- **glossaire** : vocabulaire chirurgical partagé
- **cours** : montée en compétence à son rythme
- **carnet-bord** : traçabilité étapes validées
- **thesaurus** : organisation des mots-clés / synonymes
- **global** (~110 promesses) : philosophie BDB transverse, garanties juridiques/données, mécaniques d'adoption

### Anomalies détectées

- **Dossiers manquants** : `modules/pedagogie/` et `modules/recueil-situation/` n'existent pas malgré présence dans la liste théorique des 25-27 modules.
- **Dossier vide** : `modules/ged/` existe mais ne contient ni HTML ni JS ni CSS.
- **Modules sans app.js externe** : `carnet-bord` et `profile` utilisent des scripts inline dans `index.html` (potentielle violation INTERDIT-C2 à vérifier).
- **veille-documentaire** : 4 pages admin distinctes (admin, admin-bao, admin-bao-deepseek, admin-sources-institutionnelles) — fragmentation à analyser.
- **Module `admin`** : hub transverse de 2277 lignes de JS (admin-app.js) — point de centralisation à documenter.
