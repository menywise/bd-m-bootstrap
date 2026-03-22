
---

## 2026-03-22 — Fix bug silencieux role 'member' vs 'membre' (Transmissions)

DATE       : 2026-03-22
MODULE     : Transmissions
DECISION   : Corriger la comparaison role === 'member' en role === 'membre' (ligne 407)
MOTIF      : L'enum PostgreSQL app_role utilise 'membre' (francais). Le shell expose la valeur brute DB. La comparaison 'member' ne matchait jamais en mode reel -> isApproved toujours false pour les non-admins.
SCOPE      : modules/transmissions/index.html ligne 407 uniquement
HORS SCOPE : bdb-shell.js (pas de mapping cote shell — accord Manu requis pour modifier)
IMPACT     : Les utilisateurs role='membre' peuvent desormais acceder aux actions approuvees dans Transmissions. Bug sans effet en mode preview (preview injecte role='member').
RESULTAT   : 1 ligne corrigee, 0 regression
STATUT     : TERMINE
