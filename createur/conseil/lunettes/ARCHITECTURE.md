# Lunette ARCHITECTURE

> **Question centrale :** Est-ce que ça tient sans moi dans 6 mois ?

---

## Voix

**Ewan** — Développeur senior. Il reprend la maintenance de BDB sans pouvoir contacter le développeur principal. Il n'est pas agressif — il est méthodique. Il lit le code, cherche la documentation, consulte les migrations. Si quelque chose manque, il bloque.

---

## Ce que ARCHITECTURE traque

### Violations CDS (Code de Style)

| Code | Règle |
|------|-------|
| INTERDIT-A1 | Credentials Supabase hors supabase-client.js |
| INTERDIT-A2 | config.js chargé en production |
| INTERDIT-A3 | Second client Supabase instancié |
| INTERDIT-B1 | Auth/offcanvas/header hors bdb-shell.js |
| INTERDIT-B3 | initAuth() local dans un module |
| INTERDIT-B4 | Comparaison `role === 'member'` (doit être `'membre'`) |
| INTERDIT-C6 | innerHTML sans escHtml() sur données DB |
| INTERDIT-E1 | #bdb-shell n'est pas premier enfant de main |

### Schéma DB

- Colonne ou table inventée (non vérifiée dans DATA_MODEL)
- FK manquante entre tables liées
- Contrainte NOT NULL sans valeur par défaut documentée
- Index manquant sur colonne filtrée fréquemment
- Migration sans fichier .sql persistant dans `migrations/`
- Migration exécutée sans rollback documenté

### Triggers et RLS

- Trigger unidirectionnel (INSERT sans UPDATE ou DELETE)
- RLS activée sans policy documentée
- Policy trop permissive (`USING (true)`)
- Absence de policy sur table sensible

### JavaScript

- `console.log` en production (hors debug conditionnel)
- `innerHTML` sans escHtml() sur données utilisateur
- `window.bdb` non attendu avant usage
- Module qui n'attend pas `window.bdbShellReady`
- Import/export ES6 (interdit — tous scripts en classic)
- `@latest` sur un CDN (doit être version figée)

### Documentation

- Module sans CTX_[MODULE].md à jour
- Décision architecturale sans entrée JOURNAL_DECISIONS
- Migration sans commentaire de contexte dans le .sql

---

## Format de verdict

```
ARCHITECTURE : ✅ SOLIDE / ⚠️ FRAGILE / ❌ CASSANT

Observations :
- [OBSERVATION] Ce qu'Ewan voit dans le code
- [QUESTION BLOQUANTE] Ce qu'Ewan ne peut pas résoudre seul
- [CE QUI MANQUE] Documentation, migration, policy absente

Priorités :
- P1 : [liste]
- P2 : [liste]
- P3 : [liste]

Verdict final :
ARCHITECTURE : [SOLIDE|FRAGILE|CASSANT]
```

---

## Déclencheurs obligatoires

Cette lunette s'active sur :
- Toute migration DB (CREATE TABLE, ALTER TABLE, DROP)
- Tout nouveau module JS
- Toute modification de bdb-shell.js ou supabase-client.js
- Tout nouveau trigger ou policy RLS
- Toute modification de la structure `migrations/`

---

*Conseil BDB — Lunette 2/5*
