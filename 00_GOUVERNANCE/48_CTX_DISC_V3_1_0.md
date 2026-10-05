# CTX — MODULE DISC

```
VERSION  : 3.1.0
DATE     : 2026-04-02
STATUT   : OPÉRATIONNEL — SUPABASE MULTI-USER ✅
FICHIER  : modules/disc/index.html
CSS      : modules/disc/disc-ui.css
NOTE     : CTX_DISC_ENGINE.md et personna_disc_doc.md absorbés ici (V2.0.0).
           Ne pas recréer ces fichiers séparément.

```

> ⚠ RÈGLE ABSOLUE : Toute IA qui ouvre une session sur ce module
> lit ce fichier APRES le Manifeste DB&M et le Canon V1.0.5.
> Ce fichier prime sur toute conversation précédente.
>
> ⚠ RÈGLE TRACKER : Les champs TRACKER_* sont lus par BDB Tracker.
> Toute IA qui modifie ce module DOIT mettre à jour ces champs en clôture de session.

---

## BLOC 1 — RÔLE ET PORTÉE

### Rôle

Moteur de profiling psycho-pédagogique multi-user pour équipes soignantes.
Chaque membre passe les tests DISC (12 questions) et VAKOG (10 questions),
obtient sa conclusion personnalisée, et découvre les 4 profils DISC
avec complémentarités/tensions — le tout anonymisé.

L'admin exploite les tendances agrégées de l'équipe pour adapter
les contenus BDB, les prompts, et la pédagogie par profil dominant.

### Portée

```
IN SCOPE :
  Tests DISC + VAKOG par membre (sauvegarde Supabase)
  Profil personnel (disc_profils, 1 ligne/user)
  Historique passations (disc_tests)
  Conclusions individuelles (disc_conclusions + forces + vigilances)
  Compatibilités inter-profils (disc_compatibilites, 16 paires)
  Distribution agrégée anonyme (RPC disc_distribution())
  Personas fictifs (admin-only, outil pédagogique)
  Scénarios pédagogiques (admin-only, architecture évolutive)
  Export IA (prompts auto-enrichis par tendances équipe v3.0)

HORS SCOPE :
  Données nominatives exposées aux membres
  Croisement avec données RH réelles
  Spirale Dynamique / Ennéagramme approfondi (futur)
```

---

## BLOC 2 — SCHÉMA SUPABASE

> Migration 078 exécutée ✅. 21 tables + 1 RPC.
> DDL : inchangé par rapport à V3.0.0 BLOC 2 (le DDL était correct, seul le compteur dans les headings était erroné).
> Compteur corrigé : 21 tables (14 Part A + 7 Part B), pas 19.

### Décisions structurantes (arbitrage A2 — à ne jamais remettre en question sans Manu)

```
- Zéro jsonb : toutes les données structurées en tables relationnelles
- UUID PK partout (pas de code TEXT comme PK)
- scene_code TEXT pour l'affichage ('S1', 'S2'…) — PK reste UUID
- Sandbox supprimée — RLS standard (pas de colonne sandbox)
- Données fictives seed → supprimables via l'admin après usage
```

### Seed personas fictifs (migration 078_disc_seed.sql)

Ces 7 personas sont les données initiales du module. Si re-seed nécessaire :

```
ROHAUT_M    · DISC=D · rôle créateur
SARTOUT_F   · DISC=I
HAMSA_O     · DISC=S
MERIC_Q     · DISC=C
MARCHAND_C  · DISC=D
DA_COSTA    · DISC=S
THUILLIER_E · DISC=C
```

Scénario seed : SC_001 "Encadrement sous rumeur" (3 scènes).

⚠ **Données fictives — ne jamais croiser avec données RH réelles.**

---

## BLOC 3 — MATRICE D'ACCÈS UX PREMIUM

> Inchangée par rapport à V3.0.0 BLOC 3. Implémentée ✅.

---

## BLOC 4 — CHECKLIST PREMIUM

```
[✅] CDS conforme
      ✅ bdb-shell migré
      ✅ Zéro onclick= (15/15 critères recettage)
      ✅ Zéro FA
      ✅ Zéro console.log
      ✅ escHtml() défini et utilisé (68 appels controller)
      ✅ disc-ui.css scopé
      ✅ Chaîne BLOC E ✅ (CDN @a75daa0)
      ✅ Modals reconstruits
      ✅ .select() sur tous writes
      ✅ 3 états DOM (loading/error/ready)
      ✅ disc-storage.js supprimé

[✅] Documenté
      ✅ CTX V3.1.0

[✅] Résilient
      ✅ 3 états async DOM (loading/error/ready)
      ✅ escHtml() sur toutes données dynamiques
      ✅ try/catch centralisé init
      ✅ Erreurs writes → toast info (pas crash)

[✅] Navigable
      ✅ #bdb-shell premier enfant de <main>
      ✅ data-module-title + data-module-icon
      ✅ 11 vues nav sidebar

[⚠] Responsive
      ⚠ Non recetté terrain mobile
```

**État actuel** : `[4.5/5]` — responsive terrain non vérifié

---

## BLOC 5 — RÈGLES MÉTIER

> Inchangées par rapport à V3.0.0 (DISC-01 → DISC-07). Toutes implémentées.

---

## BLOC 6 — ANTI-PATTERNS LOCAUX

> Inchangés par rapport à V3.0.0.

---

## BLOC 11 — VOIX UTILISATEUR

> Inchangé par rapport à V3.0.0.

---
