# CHECKLIST_DEPLOIEMENT_OVH.md
```
VERSION  : 1.0.0
DATE     : 2026-03-21
RÔLE     : Checklist à exécuter AVANT et APRÈS chaque déploiement FTP sur OVH.
           Réf : R6-HUM-01 (AUDIT_SECURITE_BDB_V1_0_0)
CONTEXTE : OVH mutualisé — Apache — pas de CI/CD — tout est manuel.
           Une erreur de déploiement = directory listing réactivé ou config.js exposé.
```

---

## AVANT LE TRANSFERT FTP

### Fichiers à vérifier (source locale)

```
□ bdb/.htaccess                    — PRÉSENT (racine BDB)
□ bdb/00_GOUVERNANCE/.htaccess     — PRÉSENT (Require all denied)
□ bdb/robots.txt                   — PRÉSENT (racine domaine)
□ bdb/403.html                     — PRÉSENT
□ bdb/404.html                     — PRÉSENT
```

### Fichiers à ne JAMAIS transférer

```
□ config.js                        — ABSENT du transfert (CRITIQUE — contient service_role si présent)
□ *.md                             — AUCUN fichier .md dans le FTP
□ *.sql                            — AUCUN fichier .sql dans le FTP
□ *.log / *.bak / *.txt            — AUCUN
□ 00_GOUVERNANCE/                  — le dossier ENTIER est bloqué par .htaccess, mais ne PAS pousser les fichiers internes
□ OLD_GOUVERNANCE/                 — idem
□ DATA_METIER/                     — idem
□ 01_TEMPLATES/                    — idem
□ 02_INFRASTRUCTURE/               — idem
□ SESSION_STATE.md                 — JAMAIS
□ bdb_tracker.html                 — JAMAIS
□ admin-test.html                  — JAMAIS
□ .git/                            — JAMAIS
```

### Modules : vérifier la version

```
□ Tous les modules transférés sont migrés bdb-shell (pas d'initAuth local)
□ Aucun module ne contient de requête directe profiles_directory ou user_roles
□ supabase-client.js pointe vers le cloud (pas localhost:54321)
```

---

## APRÈS LE TRANSFERT FTP

### Tests de vérification (6 URLs)

Remplacer `[DOMAINE]` par `hashtag.manuelrohaut.fr/bdb`

```
□ https://[DOMAINE]/modules/          → DOIT retourner 403 (pas de listing)
□ https://[DOMAINE]/00_GOUVERNANCE/   → DOIT retourner 403
□ https://[DOMAINE]/config.js         → DOIT retourner 403 ou 404
□ https://[DOMAINE]/NOYAU_VERITE.md   → DOIT retourner 403
□ https://[DOMAINE]/.git/HEAD         → DOIT retourner 403
□ https://[DOMAINE]/admin-test.html   → DOIT retourner 403
```

### Tests fonctionnels

```
□ Page login → se connecter → accès portail OK
□ Naviguer vers un module → données chargées
□ URL inexistante → page 404 premium affichée
□ Vérifier headers sécurité : curl -I https://[DOMAINE]/index.html
  → X-Frame-Options: DENY
  → X-Content-Type-Options: nosniff
  → Strict-Transport-Security présent
```

### Supabase (vérification post-déploiement)

```
□ supabase-client.js : clé anon uniquement (pas service_role)
□ RLS actives sur toutes les tables : SELECT count(*) FROM pg_policies;
□ Bucket content-images : Public = OFF
```

---

## SI QUELQUE CHOSE NE VA PAS

```
1. Directory listing visible     → .htaccess absent ou mal copié → re-transférer immédiatement
2. config.js accessible          → SUPPRIMER DU SERVEUR IMMÉDIATEMENT + régénérer les clés Supabase
3. Page 404 non premium          → 404.html absent ou .htaccess ErrorDocument manquant
4. Données non chargées          → supabase-client.js pointe vers localhost → corriger l'URL
5. Module affiche "initAuth"     → module non migré bdb-shell → retirer du FTP
```
