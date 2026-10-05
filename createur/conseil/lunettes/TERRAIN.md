# Lunette TERRAIN

> **Question centrale :** Est-ce que ça tient dans le chaos réel du bloc ?

---

## Voix

**Sabine D.** — Cadre de bloc, 15 ans d'expérience. Gère les plannings, les urgences, les tensions d'équipe. Elle n'a pas le temps de chercher un bouton.

**Franck** — IBODE 35 ans. Connaît les protocoles par cœur. Réfractaire aux outils qui "expliquent" ce qu'il sait déjà. Il veut de l'efficacité, pas de la pédagogie.

**Julie C.** — Novice J+1. Première semaine en bloc. Elle ne connaît pas les acronymes, les rôles, les protocoles. Elle lit tout. Elle a besoin que chaque mot soit défini.

**Les 31 membres P0→P8** — De l'externe J+1 (P0) à l'IBODE 20 ans (P8). Un livrable qui ne passe pas pour P0 et P8 simultanément a un problème de conception.

---

## Ce que TERRAIN traque

### Workflows impossibles
- Action qui requiert 3 étapes là où 1 suffirait
- Bouton introuvable sans instructions préalables
- Écran qui demande une info que l'utilisateur n'a pas sous la main
- Navigation qui oblige à quitter le contexte en cours

### Gants mouillés
- Zone de clic trop petite (< 44px touch target)
- Texte trop petit pour être lu avec une visière
- Formulaire long sur mobile sans raccourcis
- Scroll infini sans ancre

### États P0→P8 sans réponse
- Message d'erreur incompréhensible pour Julie (P0)
- Message condescendant pour Franck (P8)
- État vide sans action proposée
- Chargement sans feedback visible

### Vocabulaire non défini
- Acronyme technique non explicité au premier usage
- Terme métier supposé connu mais non défini dans le glossaire
- Bouton dont le label est ambigu selon le rôle

### Cas de mutation (Franck)
- Données personnelles qui suivent le mauvais utilisateur après mutation
- Rôle applicatif qui ne correspond plus au rôle terrain
- Historique perdu après changement de service

---

## Format de verdict

```
TERRAIN : ✅ SOLIDE / ⚠️ FRAGILE / ❌ CASSANT

Observations :
- [Observation 1 — voix concernée — priorité P1/P2/P3]
- [Observation 2 — voix concernée — priorité P1/P2/P3]

Questions bloquantes :
- [Question que Sabine/Franck/Julie poserait]

Verdict final :
TERRAIN : [SOLIDE|FRAGILE|CASSANT]
```

---

## Déclencheurs obligatoires

Cette lunette s'active sur :
- Tout nouveau formulaire ou workflow
- Tout changement de navigation ou d'UX
- Tout nouveau rôle ou permission applicative
- Toute modification de l'écran principal d'un module

---

*Conseil BDB — Lunette 1/5*
