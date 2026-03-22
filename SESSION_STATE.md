# SESSION_STATE.md
# Généré automatiquement par BDB Tracker v3 — 21/03/2026 20:57
# LIRE EN PREMIER dans toute session Claude — remplace NOYAU + JOURNAL + CHANTIER_TECHNIQUE
# NE PAS MODIFIER MANUELLEMENT — sera écrasé au prochain scan
════════════════════════════════════════════════════════════

## ÉTAT TERRAIN RÉEL (scan disque)

Modules scannés      : 25
Conformes (0 viol.)  : 5
Avec violations      : 20
Shell non migré      : 3 (installation, preferences, thesaurus)
CTX manquants        : 0
Fichiers gouvernance : 2/4 présents

## PRIORITÉS — modules à traiter en premier

  installation     4 violation(s) : INTERDIT-E1, INTERDIT-B2, INTERDIT-B3, INTERDIT-C2
  preferences      4 violation(s) : INTERDIT-E1, INTERDIT-B2, INTERDIT-B3, INTERDIT-C2
  admin            3 violation(s) : INTERDIT-B2, INTERDIT-C2, INTERDIT-C6
  annuaire         3 violation(s) : INTERDIT-B2, INTERDIT-C2, INTERDIT-C6
  carnet-bord      3 violation(s) : INTERDIT-B2, INTERDIT-C2, INTERDIT-C6

## DELTA CTX vs TERRAIN

  ÉCART admin : CTX="migré" mais terrain KO (3 violation(s))
  ÉCART annuaire : CTX="migré" mais terrain KO (3 violation(s))
  ÉCART transmissions : CTX="migré" mais terrain KO (2 violation(s))

## SESSIONS RÉCENTES

  Aucune session enregistrée

## RÈGLES ABSOLUES BDB (CHANTIER_TECHNIQUE V1.0.6)

INTERDIT-E1  : #bdb-shell = PREMIER ENFANT de <main> — jamais frère
INTERDIT-A1  : URL Supabase uniquement dans supabase-client.js
INTERDIT-A3  : window.bdb = seul client Supabase
INTERDIT-B1  : Auth + offcanvas + header uniquement dans bdb-shell.js
INTERDIT-B2  : window.bdbUser = seul accès utilisateur (jamais requête SQL)
INTERDIT-B3  : Zéro initAuth() local dans un module
INTERDIT-C2  : Zéro style= statique dans HTML (→ classes CDS)
INTERDIT-C6  : escHtml() obligatoire sur tout innerHTML avec donnée DB
INTERDIT-17  : Overrides Bootstrap scopés au conteneur parent dans CSS module
C.9          : Toute async DOM = 3 états (loading/empty/error)
onclick=     : Interdit dans HTML — addEventListener uniquement

## CHAÎNE CSS OBLIGATOIRE

1. bootstrap@5.3.2
2. bootstrap-icons@1.11.1
3. theme-base.css (@latest BDB)
4. theme-print.css (@latest BDB, media=print)
5. ../../css/cds-overrides.css
6. ../../css/[module]-ui.css

## CONVENTION CTX — CHAMPS TRACKER_* (TEMPLATE V1.2.0)

Tout CTX produit ou modifié doit contenir ces champs dans l'en-tête :
  TRACKER_STATUS     : [à_faire | en_cours | migré | embryo | legacy]
  TRACKER_SHELL      : [oui | non]
  TRACKER_PALIER     : [0..7]
  TRACKER_VIOLATIONS : [liste des INTERDIT actifs, séparés par virgule]
  TRACKER_UPDATED    : [DATE]
Ces champs sont lus par BDB Tracker. Un CTX sans ces champs = dette documentaire.

## PROCHAINES SESSIONS PLANIFIÉES

N+1 : Onglet Navigation admin/ — CRUD app_groups + app_modules (après Q1–Q3)
N+2 : Migrer 6 modules Supabase : transmissions · cours · installation · preferences · thesaurus · carnet_bord
N+3 : Onglet Tableau de bord admin/ + corrections CSS Palier 2

## ARBITRAGES BLOQUANTS EN ATTENTE

A1  : Schéma Supabase planning → bloque Palier 5
A2  : Schéma Supabase disc + dork → bloque Palier 3
A3  : Schéma objectifs → bloque Palier 6
A4  : Schéma collab → bloque Palier 3
Q1/Q2/Q3 : Structure admin/ → bloque Session N+1

════════════════════════════════════════════════════════════
# FIN — BDB Tracker v3 — 21/03/2026 20:57