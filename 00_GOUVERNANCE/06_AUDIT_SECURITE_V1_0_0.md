# AUDIT SÉCURITÉ PREMIUM — Bible de Bloc
```
VERSION  : 1.0.0
DATE     : 2026-03-20
AUTEUR   : Claude (expert) + Manu (décideur)
CONTEXTE : Application hospitalière interne — données métier sensibles.
           Stack : HTML/JS/CSS statique · Supabase cloud · Apache OVH mutualisé.
           Pas de backend Node/PHP. Pas de WAF. Pas de VPS.
```

---

## MODÈLE DE MENACE BDB

BDB n'est pas une app grand public. C'est un outil interne hospitalier.
Les menaces réalistes ne sont pas les mêmes que pour un SaaS.

### Qui attaque ?

| Acteur | Probabilité | Motivation | Capacité |
|---|---|---|---|
| **Employé curieux** | HAUTE | Voir ce que font les autres, tester les limites | Navigateur + DevTools |
| **Script kiddie externe** | MOYENNE | Scanner automatique, bots | Outils automatisés (Shodan, Nikto) |
| **Erreur humaine (Manu)** | HAUTE | Déployer le mauvais fichier, oublier un .htaccess | FTP + fatigue |
| **IA mal guidée (Claude)** | HAUTE | Régression sécurité dans un module migré | Code généré sans audit |
| **Attaquant ciblé** | FAIBLE | Données patient (mais BDB n'en a pas directement) | Compétences avancées |

### Qu'est-ce qui a de la valeur ?

| Donnée | Sensibilité | Où elle vit |
|---|---|---|
| Comptes utilisateurs (email, rôle) | ÉLEVÉE | Supabase auth + profiles_directory |
| Fiches d'intervention | MÉTIER | Supabase fiches_intervention |
| Transmissions (contenu patient indirect) | ÉLEVÉE | Supabase transmissions |
| Préférences chirurgien | MÉTIER | Supabase preferences_chirurgien |
| Clé anon Supabase | MOYENNE | js/supabase-client.js (client-side) |
| Structure DB complète | ÉLEVÉE | Fichiers .sql + SUPABASE_DATA_MODEL.md |
| Gouvernance projet (.md) | FAIBLE | 00_GOUVERNANCE/ |

---

## COUCHE 1 — SUPABASE (la vraie forteresse)

C'est la couche la plus critique. Tout le reste est cosmétique si les RLS sont bonnes.

### 1.1 État actuel des RLS

| Table | RLS activé | Politiques | Verdict |
|---|---|---|---|
| profiles_directory | ? | ? | ⚠ **À AUDITER** |
| user_roles | ? | ? | ⚠ **À AUDITER** |
| fiches_intervention | ? | pol_fiches_member_read, pol_fiches_admin_* | ⚠ **Vérifier** |
| transmissions | ? | ? | ⚠ **À AUDITER — contenu sensible** |
| categories | ? | ? | ⚠ Probable lecture publique OK |
| content_images | ? | ? | ⚠ **À AUDITER** |
| app_modules | ✅ | P6 (visibility filtering) | ✅ OK si exécuté |
| error_404_logs | ✅ | INSERT all, SELECT admin | ✅ OK |
| carnet_progressions | — | Prévu : user_id = auth.uid() | ⏳ Table pas encore créée |

**PROBLÈME MAJEUR** : Je n'ai aucune visibilité sur les RLS réellement actives en cloud.
Le SUPABASE_DATA_MODEL documente des RLS *cibles*, pas nécessairement *exécutées*.

**ACTION REQUISE — PRIORITÉ 1** :

```sql
-- Exécuter dans SQL Editor Supabase cloud
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Ce résultat = la vérité. Tout le reste est de la documentation.

### 1.2 Risques RLS identifiés

| Risque | Impact | Probabilité |
|---|---|---|
| Table sans RLS activé | Toutes les données lisibles par anon via API REST | CRITIQUE |
| RLS activé mais aucune politique | Zéro accès (même admin) → module cassé | ÉLEVÉ |
| SELECT trop permissif sur transmissions | Membre voit les transmissions de tous | ÉLEVÉ |
| INSERT sans contrôle user_id | Membre peut créer des données au nom d'un autre | MOYEN |
| DELETE sans restriction | Membre supprime les données d'un autre | CRITIQUE si pas protégé |

### 1.3 Recommandations RLS

```
R1-RLS-01 : Exécuter l'audit pg_policies (ci-dessus) → documenter l'état réel
R1-RLS-02 : Vérifier que CHAQUE table a ALTER TABLE ... ENABLE ROW LEVEL SECURITY
R1-RLS-03 : Transmissions — user_id = auth.uid() obligatoire en SELECT membre
R1-RLS-04 : Fiches — INSERT/UPDATE → user_id = auth.uid() sur auteur
R1-RLS-05 : content_images — pas d'accès anon au bucket "content-images"
R1-RLS-06 : profiles_directory — membre ne voit que les profils approved=true
R1-RLS-07 : Produire un fichier AUDIT_RLS_RÉEL.md avec le dump pg_policies
```

---

## COUCHE 2 — STORAGE SUPABASE (bucket content-images)

### 2.1 Risques

| Risque | Impact |
|---|---|
| Bucket public | Toute image accessible sans auth via URL directe |
| Pas de validation type MIME côté serveur | Upload de fichiers malveillants (.html, .svg avec XSS) |
| Pas de limite taille côté serveur | Upload de fichiers volumineux → saturation storage |
| Signed URLs trop longues (3600s) | URL partageable pendant 1h |

### 2.2 Recommandations

```
R2-STOR-01 : Vérifier que le bucket "content-images" est PRIVÉ (pas public)
             → Dashboard Supabase > Storage > content-images > Settings
R2-STOR-02 : Politique storage : auth users seulement (pas anon)
R2-STOR-03 : Ajouter validation MIME côté JS (déjà fait dans uploadImage — file.type.startsWith('image/'))
             MAIS ajouter aussi une storage policy côté Supabase :
             CREATE POLICY bucket_upload ON storage.objects FOR INSERT
             WITH CHECK (bucket_id = 'content-images' AND (storage.extension(name)) IN ('jpg','jpeg','png','gif','webp'));
R2-STOR-04 : Réduire durée signed URL de 3600s à 900s (15 min suffisent pour affichage)
```

---

## COUCHE 3 — AUTHENTIFICATION

### 3.1 État actuel

```
- Auth gérée par Supabase (email/password)
- Session stockée par Supabase JS SDK (localStorage)
- bdb-shell.js vérifie getSession() → redirect login si absent
- window.bdbUser exposé après init
- Pas de MFA
- Pas de politique de mot de passe connue
- Pas de rate limiting sur login (géré par Supabase)
```

### 3.2 Risques

| Risque | Impact | Probabilité |
|---|---|---|
| Mot de passe faible | Accès non autorisé | MOYENNE (réseau interne) |
| Pas de MFA | Compromission si mot de passe fuité | FAIBLE (interne) |
| Session qui n'expire pas | Accès persistant sur poste partagé | ÉLEVÉE |
| Pas de logout automatique | Session ouverte indéfiniment sur tablette bloc | ÉLEVÉE |

### 3.3 Recommandations

```
R3-AUTH-01 : Configurer Supabase Auth > Settings > Password minimum length = 8
R3-AUTH-02 : Activer le refresh token expiry (par défaut 1 semaine — réduire à 24h)
             → Supabase Dashboard > Auth > Settings > JWT expiry
R3-AUTH-03 : Implémenter un auto-logout après 30 min d'inactivité
             → Timer JS dans bdb-shell.js : reset à chaque interaction,
               signOut() + redirect login à l'expiration.
             Contexte hospitalier : postes partagés, tablettes communautaires.
R3-AUTH-04 : Sur login.html — message d'erreur générique
             "Identifiants incorrects" (jamais "email inconnu" / "mot de passe incorrect")
R3-AUTH-05 : Documenter la procédure de reset password
             (existe probablement via reset-password.html — vérifier qu'elle fonctionne)
```

---

## COUCHE 4 — CODE CLIENT (JS)

### 4.1 Surface d'attaque

Tout le JS est lisible. C'est par design (app statique). La sécurité ne peut JAMAIS reposer sur du JS client. Seule Supabase RLS protège.

### 4.2 Risques documentés et traités

| Risque | Statut | Référence |
|---|---|---|
| XSS via innerHTML | ✅ TRAITÉ | INTERDIT-C6, escHtml() — fiches fait, glossaire fait |
| onclick= inline | ✅ TRAITÉ | Tracker vérifie, addEventListener obligatoire |
| style= statique | ✅ TRAITÉ | Tracker vérifie, INTERDIT-C2 |
| Requête auth dans les modules | ✅ TRAITÉ | INTERDIT-B2, window.bdbUser |

### 4.3 Risques non encore traités

| Risque | Impact | Action |
|---|---|---|
| **escHtml() absent dans 6+ modules non migrés** | XSS dans chaque module | Appliquer C.9/C6 à chaque migration shell |
| **Pas de validation d'input côté client** | Données malformées en DB | Ajouter validation longueur/format avant INSERT |
| **console.log avec données sensibles** | Fuite info dans DevTools | Audit grep console.log sur tous les modules |
| **Quill HTML non sanitisé** | XSS stocké via description HTML | Sanitiser à la lecture (DOMPurify) ou à l'écriture |
| **Pas de CSRF protection** | Supabase gère via JWT — OK | Aucune action (Supabase protège nativement) |

### 4.4 Recommandation critique — Quill / HTML stocké

```
R4-XSS-01 : Le contenu Quill (f.description) est du HTML stocké en base,
            rendu via innerHTML SANS échappement (volontaire — c'est du rich text).
            
            Risque : un admin injecte du JS malveillant dans une fiche.
            Impact : tout membre qui consulte la fiche exécute le JS.
            
            Solution : DOMPurify côté lecture.
            
            <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
            
            // Au lieu de :
            body.innerHTML = f.description;
            // Faire :
            body.innerHTML = DOMPurify.sanitize(f.description);
            
            À appliquer dans : fiches (openFicheView), transmissions, cours.
            Coût : 1 ligne par module + 1 CDN.
            Impact : zéro sur le rendu visuel (DOMPurify préserve le HTML sûr).
```

---

## COUCHE 5 — INFRASTRUCTURE OVH (traité partiellement)

### 5.1 Fait (session 2026-03-20 — T07)

```
✅ Directory listing bloqué (Options -Indexes)
✅ Fichiers .md/.sql/.txt/.log bloqués
✅ Headers sécurité (CSP, HSTS, X-Frame, etc.)
✅ HTTPS forcé
✅ Hotlinking bloqué
✅ Dossiers internes bloqués
✅ robots.txt
✅ Pages erreur 403/404 CDS
```

### 5.2 Reste à faire

| Action | Priorité | Difficulté |
|---|---|---|
| **Tester les 6 URLs de vérification** | HAUTE | 5 min |
| Vérifier que config.js n'est pas accessible | HAUTE | 1 min |
| Vérifier que supabase-client.js est accessible (nécessaire) | INFO | 1 min |
| Surveiller les logs 404 (après déploiement error_404_logs) | MOYENNE | Hebdomadaire |

---

## COUCHE 6 — ERREURS HUMAINES (la vraie menace)

### 6.1 Scénarios réalistes

| Scénario | Probabilité | Impact |
|---|---|---|
| Oublier de copier .htaccess lors d'un redéploiement FTP | HAUTE | Directory listing réactivé |
| Pousser config.js avec service_role key sur OVH | CRITIQUE | Accès total DB |
| Déployer un module non migré (avec initAuth local) | HAUTE | Requêtes profiles_directory exposées |
| Oublier d'exécuter un fichier .sql de RLS | HAUTE | Table sans protection |
| Supprimer un CTX et perdre le contexte sécurité | MOYENNE | Régression à la prochaine session |

### 6.2 Recommandations anti-erreur humaine

```
R6-HUM-01 : CHECKLIST DÉPLOIEMENT OVH (fichier à créer — exécuter avant chaque FTP)
            □ .htaccess racine présent
            □ .htaccess 00_GOUVERNANCE présent
            □ config.js ABSENT du FTP (vérifier 2 fois)
            □ Aucun fichier .md/.sql dans le FTP
            □ robots.txt à la racine du domaine
            □ Test 6 URLs de vérification
            □ Test login → accès module → données OK
            □ Test 404 → page premium visible

R6-HUM-02 : FICHIER .ftpignore (liste des fichiers à ne JAMAIS uploader)
            00_GOUVERNANCE/
            01_TEMPLATES/
            02_INFRASTRUCTURE/
            OLD_GOUVERNANCE/
            DATA_METIER/
            *.md
            *.sql
            config.js
            SESSION_STATE.md
            bdb_tracker.html
            admin-test.html
            .git/

R6-HUM-03 : Le tracker DEVRAIT vérifier la présence de .htaccess dans un scan
            (évolution future — scan OVH via FTP ou curl)
```

---

## COUCHE 7 — RÉGRESSION IA (Claude)

### 7.1 Risques

| Risque | Déjà couvert | Comment |
|---|---|---|
| Générer du code sans escHtml | ✅ | INTERDIT-C6 + tracker |
| Générer un initAuth local | ✅ | INTERDIT-B3 + tracker |
| Oublier RLS sur une nouvelle table | ❌ | **Pas de check automatique** |
| Inventer une colonne DB | ✅ | Règle INTERDIT dans CTX |
| Générer du code avec onclick= | ✅ | Tracker vérifie |
| Oublier await bdbShellReady | ❌ | **Pas de check automatique** |

### 7.2 Recommandation

```
R7-IA-01 : Ajouter dans TEMPLATE_MODULE_BDB.sql un commentaire bloquant :
           -- ⚠ APRÈS EXÉCUTION : vérifier avec
           -- SELECT tablename, policyname FROM pg_policies WHERE tablename = '[NOM]';
           -- Si 0 ligne → RLS NON ACTIVES → STOP

R7-IA-02 : Ajouter dans le tracker un check : si un module fait .from('table'),
           vérifier que la table est dans SUPABASE_DATA_MODEL
           (évolution future — nécessite parsing JS cross-référencé)
```

---

## PLAN D'ACTION — PAR PRIORITÉ

### IMMÉDIAT (avant prochain déploiement OVH)

| # | Action | Effort | Qui |
|---|---|---|---|
| S1 | Exécuter audit pg_policies sur cloud | 5 min | Manu |
| S2 | Vérifier bucket content-images = privé | 2 min | Manu |
| S3 | Tester 6 URLs .htaccess post-déploiement | 5 min | Manu |
| S4 | Vérifier config.js NON accessible via HTTPS | 1 min | Manu |

### COURT TERME (1-2 sessions)

| # | Action | Effort | Qui |
|---|---|---|---|
| S5 | Documenter AUDIT_RLS_RÉEL.md depuis dump pg_policies | 30 min | Session dédiée |
| S6 | Auto-logout 30 min dans bdb-shell.js | 30 min | Session dédiée |
| S7 | DOMPurify sur Quill HTML (fiches, transmissions, cours) | 15 min/module | Chaque migration |
| S8 | Créer CHECKLIST_DEPLOIEMENT_OVH.md | 15 min | Session dédiée |
| S9 | Réduire signed URL de 3600s à 900s | 5 min | Chaque module |

### MOYEN TERME (Phase 4)

| # | Action | Effort | Qui |
|---|---|---|---|
| S10 | Résoudre bug content-images / content_images avant déploiement | 1h | Session dédiée |
| S11 | Remplacer @latest par tag fixe sur CDN BDB | 15 min | Release |
| S12 | Storage policy MIME sur bucket content-images | 10 min | SQL |
| S13 | Audit console.log données sensibles sur tous modules | 30 min | Grep |

---

## CE QUI N'EST PAS FAISABLE (OVH mutualisé)

```
- WAF (Web Application Firewall) → nécessite Cloudflare ou VPS
- Rate limiting HTTP → nécessite mod_ratelimit (pas dispo OVH mutualisé)
- Fail2ban → nécessite accès SSH root
- Logs d'accès Apache personnalisés → limité sur mutualisé
- IP whitelisting → possible en .htaccess mais inadapté (réseau hospitalier = IP dynamique)
- Certificat SSL custom → Let's Encrypt auto géré par OVH
```

Si un jour BDB justifie un VPS (10€/mois OVH), les 3 premiers deviennent possibles.

---

## RÉSUMÉ — SCORE SÉCURITÉ BDB

| Couche | Score | Commentaire |
|---|---|---|
| Supabase RLS | ⚠ **INCONNU** | Audit pg_policies requis avant tout jugement |
| Storage bucket | ⚠ **À VÉRIFIER** | Public vs privé = 1 clic de différence |
| Auth | 🟡 MOYEN | Fonctionne mais pas d'auto-logout ni MFA |
| Code client (XSS) | 🟢 BON | escHtml systématisé, tracker vérifie, C.9 actif |
| OVH .htaccess | 🟢 BON | 10 vecteurs couverts (si déployé) |
| Anti-erreur humaine | 🟡 MOYEN | Pas de checklist déploiement formalisée |
| Anti-régression IA | 🟢 BON | Tracker + INTERDIT + C.9 + C6 |

**La priorité absolue est S1** : l'audit pg_policies. Sans ça, tout le reste est du théâtre.
