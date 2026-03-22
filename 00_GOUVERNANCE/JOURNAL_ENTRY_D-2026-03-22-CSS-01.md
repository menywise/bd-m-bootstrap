## D-2026-03-22-CSS-01 — Création CDS_REFERENCE.md + cds-overrides v1.6.0

```
DATE       : 2026-03-22
MODULE     : ALL — gouvernance CSS
DÉCISION   : Création CDS_REFERENCE.md — référentiel unique classes CSS BDB.
             Mise à jour cds-overrides.css v1.5.0 → v1.6.0 (corrections audit).

CONTEXTE :
  Cause racine des hallucinations CSS modules identifiée :
  3 couches CSS (theme-base.css CDN · cds-overrides.css · Bootstrap 5.3)
  sans référence unifiée consultable. Résultat : chaque session module
  réinvente des classes existantes (.avatar-sm, .skeleton, @keyframes shimmer...).

CDS_REFERENCE.md :
  Fichier unique dense listant toutes les classes disponibles par couche.
  Emplacement cible : 00_GOUVERNANCE/CDS_REFERENCE.md (à uploader dans Project Knowledge).
  Contenu : variables --ds-*, classes theme-base / cds-overrides / BS natif,
            table avatars unifiée, conflits connus, checklist pré-génération CSS,
            règles de nommage module.

cds-overrides.css v1.6.0 — corrections appliquées :
  RISQUE-01 : .card { animation } scopé → .cds-card-animated (était global sur toutes .card)
  DUP-01    : .header-sticky dupliqué fusionné (v1.0.0 @media + v1.2.0 global → 1 définition)
  DUP-02    : .cds-sync-dot supprimé → .bdb-sync-dot (version complète avec border-radius + bg)
  DUP-03    : flex-shrink:0 ajouté à .cds-avatar-lg (cohérence avec .cds-stat-icon)
  RISQUE-03 : object-fit:contain ajouté à .cds-lightbox-img-80
  INC-03    : .cds-toast créé comme classe pérenne, #toastInfo conservé compat
  BS-OPT-01 : opacity:.6 → .5 sur .cds-error-icon (aligné BS .opacity-50)
  DETTE     : --pe-* → --cds-* reporté Phase 3 (CSS-DETTE-01)

RÈGLE PERMANENTE :
  Toute IA générant du CSS ou HTML dans BDB charge CDS_REFERENCE.md
  AVANT d'écrire la moindre classe dans un [module]-ui.css.
  Ordre de vérification : theme-base → cds-overrides → Bootstrap → créer si absent.

IMPACT     : GUIDE_TRAVAIL_SESSION → V1.2.2 (BLOC 1, 2, 5, 6, 9)
             TEMPLATE_CTX_MODULE → V1.2.0 (BLOC 7)
             BACKLOG_SESSIONS → V2.4.0 (session #7 CSS audit + script Python)
             00_GOUVERNANCE/ : CDS_REFERENCE.md à ajouter
STATUT     : VALIDÉ — PERMANENT
```
