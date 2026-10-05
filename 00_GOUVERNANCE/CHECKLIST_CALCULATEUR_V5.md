# CALCULATEUR ROI — CHECKLIST ANTI-RÉGRESSION V5

```
DATE       : 2026-04-26
USAGE      : Vérifier APRÈS production que rien n'a été perdu
RÈGLE      : Toute ligne cochée DOIT être présente dans le livrable.
             Une ligne manquante = régression = refus du livrable.
VALIDATION : Cross-validation par 2 IA (Gemini + Deepseek) sur 10 valeurs.
             3 ✅ confirmés, 6 ⚠️ ajustés, 1 ❌ recadré.
             Valeurs ci-dessous = consensus retenu.
```

---

## SECTION 1 — VOTRE BLOC (4 curseurs)

- [ ] Personnel bloc IDE+IBODE (5-60, défaut 30, source : DRH établissement)
- [ ] Interventions/an (1000-20000, **défaut 5 000**, source : DREES SAE 2023, moy. privée 4 800-5 400)
- [ ] Durée moy. en salle (30-180 min, **défaut 90**, source : ANAP indicateurs bloc, 90-110 min ortho avec installation)
- [ ] Coût analytique/min (10-40€, **défaut 15**, source : ATIH ENC 2022, fourchette 12-22€ privé)

## SECTION 2 — CE QUE VOUS PERDEZ (colonne gauche, 4 postes)

### Poste 1 : Cascade préparation per-opératoire
- [ ] 4 sous-curseurs :
  - % interventions lourdes (10-80%, défaut 40%)
  - Taux erreur picking (1-15%, **défaut 2,5%**, source : BMJ Quality & Safety 2-4%, label "estimation sectorielle")
  - Temps perdu par événement (15-90 min, défaut 45 min, source : retours CPias + No-Go SFAR)
  - Restérilisation par événement (50-300€, **défaut 150€**, source : SF2S ✅ confirmé 140-160€)
- [ ] Formule affichée : "N interv. lourdes × X% = Y événements × Z€"
- [ ] Sous-total affiché en rouge

### Poste 2 : Matériel perdu (dispositifs ouverts à tort)
- [ ] Curseur direct (0-500k, défaut 100k)
- [ ] Label : "Estimation établissement — ajustez selon vos données"
- [ ] Note : pas de source publiée, champ de saisie pour la DAF

### Poste 3 : Événements indésirables graves — poste "assurance"
- [ ] 2 sous-curseurs :
  - Fréquence/an (0-5, **défaut 0,3**, source : Relyens 2024 = 1,5/100 000 actes)
  - Coût moyen/événement (10k-200k, **défaut 34 000€**, source : Relyens 11,4M€ ÷ 339 = 33 600€)
- [ ] Formule affichée
- [ ] Note "partie émergée" : "Les sinistres déclarés aux assureurs ne représentent qu'une fraction des événements réels (ENEIS 3 : 1 EIG / 20 séjours). Ce poste fonctionne comme une assurance : le coût est faible tant que l'événement ne survient pas, mais quand il survient, l'impact est dévastateur — financièrement, psychologiquement et sur la cohésion de l'équipe pendant des mois."

### Poste 4 : Remplacement personnel
- [ ] 2 sous-curseurs :
  - Départs/an (0-10, défaut 2)
  - Coût/départ (20k-200k, **défaut 80 000€**, source : FHF ✅, Loi Rist, intérim 800-1100€/j)
- [ ] Formule affichée

### Total CNP
- [ ] Total affiché en gros, en rouge
- [ ] Bouton "÷2" (scénario pessimiste)

## SECTION 3 — CE QUE BDB PRODUIT (colonne droite)

### Gain 1 : Formation embarquée
- [ ] Calcul affiché : ETP × 52h × 45€/h
- [ ] Montant en vert
- [ ] Texte : "1h/semaine de formation implicite par agent, accessible sur smartphone"

### Gain 2 : Prévention cascade
- [ ] Texte qualitatif : "1€ investi en pré-op évite 30 à 75€ en per-op"
- [ ] Réduction documentée : "8 à 32% par optimisation des fiches seule (études publiées)"
- [ ] Note honnête : "BDB combine 15 modules. L'effet cumulé attendu est supérieur mais non documenté à ce stade."

### Gain 3 : Mise en service
- [ ] "Opérationnel sous **30 à 90 jours**" (PAS J1, PAS immédiat)
- [ ] Qualitatif : import données, paramétrage, formation référentes
- [ ] Honnêteté : "Dépend de la maturité des données terrain existantes"

### Gain 4 : Effets non financiers (qualitatif, pas chiffré)
- [ ] Réduction du stress équipe (moins d'imprévus per-op)
- [ ] Cohésion renforcée (savoir partagé, fin du "demande à Sabine")
- [ ] Attractivité employeur (outil moderne, formation structurée)
- [ ] Rayonnement établissement (early adopter, image innovante)

## SECTION 4 — INVESTISSEMENT (TCO)

- [ ] Licence slider (10k-500k, défaut 100k)
- [ ] Switch annuel / achat définitif
- [ ] Maintenance % (0-30%, défaut 15%, source : standard industrie logicielle 15-22%)
- [ ] Setup slider (0-100k, défaut 40k) — **versement N0 uniquement** (pas amorti dans le TCO récurrent)
- [ ] TCO N1+ affiché = licence + maintenance SANS setup
- [ ] N0 clairement séparé : "Année 0 : mise en service"

## SECTION 5 — VERDICT (projection 5 ans)

### Profils de montée en puissance (défaut réduction **10% année 1**, validé par consensus)
- [ ] 3 choix : Prudent / Normal / Ambitieux
- [ ] **Prudent** : 10% → 12% → 15% → 18% → 20% (fiches seules + adoption lente)
- [ ] **Normal** : 10% → 18% → 25% → 30% → 30% (fiches + modules progressifs)
- [ ] **Ambitieux** : 10% → 25% → 32% → 38% → 40% (adoption rapide, équipe engagée)
- [ ] Tous partent à 10% = plancher documenté (fiches opérationnelles < 90 jours)
- [ ] Note : "10% = réduction documentée pour l'optimisation des fiches seule (AORN 2024, pivot sécurisé)"

### Tableau projection
- [ ] 7 colonnes : N0, An 1, An 2, An 3, An 4, An 5, CUMUL
- [ ] Ligne TCO (setup en N0, licence+maint pour An 1-5)
- [ ] Ligne taux de réduction (selon profil choisi)
- [ ] Ligne pertes évitées (CNP × taux)
- [ ] Ligne formation (croissante : 50% → 70% → 80% → 100% → 100% du potentiel)
- [ ] Ligne bénéfice net (pertes évitées + formation − TCO)
- [ ] Colonne CUMUL 5 ans
- [ ] **Bénéfice net cumulé bien visible** (c'est LE chiffre que Françoise regarde)

### Indicateurs clés
- [ ] ROI cumulé 5 ans
- [ ] Risque par intervention (CNP total ÷ interventions)
- [ ] TCO par intervention (TCO annuel ÷ interventions)
- [ ] **Point de bascule** (année où le cumul net devient positif)

## SECTION 6 — CE QUE FRANÇOISE DOIT PERCEVOIR

```
Profil : 6w5 phobique · C/S · Bleu/Orange · VAKOG visuel analytique
Centre dominant : Mental (analyse, projection, anticipation du pire)
Métaprogramme : Loin de · Spécifique · Externe · Procédures · Différences
```

### Ce qui la rassure (à CONSERVER dans chaque itération)
- [ ] Chaque curseur est modifiable — elle contrôle les hypothèses
- [ ] Les sources sont citées et vérifiables — elle peut les checker
- [ ] L'année 1 est honnêtement négative — pas de promesse magique
- [ ] Le point de bascule est visible — elle sait QUAND ça bascule
- [ ] Les effets non financiers sont séparés des chiffres — pas de mélange

### Ce qui la fait basculer de "non" à "peut-être" (le Waouh C/S Bleu)
- [ ] Le cumul 5 ans est positif même en profil Prudent
- [ ] La charge de la preuve s'inverse : "pourquoi vos pertes seraient-elles INFÉRIEURES ?"
- [ ] L'analogie assurance sur les EIG : "vous payez déjà pour un risque rare mais dévastateur"
- [ ] Le coût par intervention (TCO ÷ interv) est dérisoire face au risque par intervention
- [ ] Les sources sont les MÊMES que celles qu'elle utilise (ATIH, Relyens, Loi Rist, FHF)

### Ce qui la fait basculer de "peut-être" à "je recommande" (le Waouh Orange)
- [ ] La projection montre que NE PAS agir coûte plus cher chaque année
- [ ] Le setup est un investissement année 0 (comme un équipement), pas une dépense récurrente
- [ ] BDB est un actif qui prend de la valeur (plus on l'utilise, plus il est complet)
- [ ] L'early adopter a un avantage compétitif régional (attractivité, réputation)
- [ ] La boucle vertueuse (formation → moins d'erreurs → moins de stress → moins de départs → moins d'intérim → plus de budget) est visible qualitativement

## SECTION 7 — MÉTHODOLOGIE ET SOURCES

- [ ] Coût minute bloc (ATIH ENC 2022 : 12-22€ privé, Raft 2015, ANAP)
- [ ] Taux erreur picking (BMJ Quality & Safety : 2-4%, label "estimation sectorielle")
- [ ] Restérilisation (SF2S, Académie Chirurgie 2018 Gagna/Ferreira : 140-160€)
- [ ] Consommables inutilisés (Medline 2026 : 40%, JAMA Surgery : 25%, Sanford Health : 45%)
- [ ] EIG coût (Relyens 2024 : 339 événements, 11,4M€, moy. ~34k€)
- [ ] EIG fréquence (Relyens : 1,5/100k actes — partie émergée. ENEIS 3 : 1/20 séjours)
- [ ] Turnover (FHF, Loi Rist n°2021-502, intérim 800-1100€/j)
- [ ] Réduction optimisation fiches (PMC 2021 : -8,38%, standardisation : -32%, AORN 2024, pivot logiciel réel : 5-12%)
- [ ] Tous les "Source :" en **gras souligné**
- [ ] Tous les acronymes avec `<abbr title="...">`
- [ ] Tous les acronymes avec commentaire `<!-- CC:ACRONYM -->`

## SECTION 8 — CDS COMPLIANCE

- [ ] Zéro `onclick=`
- [ ] Zéro `style=` (hors progressbar/honeypot)
- [ ] Zéro `console.log`
- [ ] Zéro `@latest`
- [ ] Zéro Google Fonts / Font Awesome
- [ ] Chaîne CSS : BS 5.3.3 → theme-base @63905396 → BI 1.11.1 → cds-overrides
- [ ] Chaîne JS : bootstrap.bundle → supabase@2 → supabase-client → bdb-ui → bdb-invite-guard → bdb-shell → atelier-nav → pricing-roi-app
- [ ] `#bdb-shell` premier enfant de `#wrapper`
- [ ] Guard `isCreator`
- [ ] `escHtml()` sur tout innerHTML avec donnée variable
- [ ] `addEventListener` (pas onclick=)
- [ ] Zéro acronyme nu dans le HTML ou le JS user-facing

---

## HISTORIQUE

```
2026-04-26 — V5.0
  Checklist initiale (63 points).
  Cross-validation 2 IA (Gemini + Deepseek).
  Durée 75→90, taux erreur 3→2,5%, EIG 36→34k€, profils réduits (10% base).
  Ajout section Françoise (profil Bernard N°003).
  Ajout gain 4 (effets non financiers qualitatifs).
  Ajout formation progressive (50%→100% sur 4 ans).
  Setup en N0 uniquement. Note "assurance" sur EIG.
  Total : 75 points de contrôle.
```
