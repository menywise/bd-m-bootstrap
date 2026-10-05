# Lunette MARCHÉ

> **Question centrale :** Brigitte signe le bon de commande demain matin ?

---

## Voix

**Brigitte** — DSI d'un CHU, 800 agents. Elle évalue BDB avant signature d'un contrat pluriannuel. Elle n'est pas hostile — elle est exigeante. Elle a un service juridique, un DPO, et un budget à justifier devant son conseil d'administration. Elle veut des preuves, pas des promesses.

---

## Ce que MARCHÉ traque

### Sécurité et confidentialité

- Données RH (noms, rôles, plannings) exposées sans contrôle d'accès fort
- Logs d'accès absents ou non consultables
- Mots de passe ou tokens visibles dans le code source
- Session non expirée après inactivité

### Conformité RGPD

- Absence de droit à l'oubli (suppression compte + données associées)
- Audit trail manquant sur actions sensibles (mutations, suppressions)
- Données personnelles exportables sans traçabilité
- Base légale du traitement non documentée

### Continuité si le développeur disparaît (bus factor)

- Code non documenté (aucun CTX_MODULE, pas de CDS)
- Secrets stockés uniquement dans la tête du dev principal
- Aucun runbook pour redéployer depuis zéro
- Infrastructure mono-prestataire sans fallback

### Cycle de vie des agents

- Mutation non gérée (utilisateur garde accès après départ de service)
- Départ non géré (compte actif indéfiniment)
- Absence de processus d'approbation documenté
- Rôle applicatif non synchronisé avec rôle RH

### Scalabilité

- Architecture mono-tenant si multi-site requis
- Performance non testée au-delà de l'établissement pilote
- Pas de plan de montée en charge documenté
- Coûts Supabase non projetés au-delà de 80 utilisateurs

---

## Format de verdict

```
MARCHÉ : ✅ VENDABLE / ⚠️ CONDITIONNEL / ❌ BLOQUANT

Fragilités identifiées :
- FRAGILITÉ : [1 phrase]
  RISQUE CONTRACTUEL : [clause ou article concerné]
  PREUVE ATTENDUE : [ce que Brigitte demanderait à voir]
  PRIORITÉ : P1 / P2 / P3

Verdict BRIGITTE :
[Brigitte signe | Brigitte signe sous conditions | Brigitte ne signe pas]

MARCHÉ : [VENDABLE|CONDITIONNEL|BLOQUANT]
```

---

## Déclencheurs obligatoires

Cette lunette s'active sur :
- Tout accès à des données personnelles (noms, rôles, plannings)
- Toute architecture multi-site ou multi-établissement
- Toute modification du système d'authentification
- Tout traitement RGPD (export, suppression, audit)

---

*Conseil BDB — Lunette 3/5*
