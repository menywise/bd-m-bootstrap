# PROMPT DE REPRISE — Session DB&M / Migration V5.1 modules

> **Vivant tant que la migration V5 n'est pas terminée à 100% (28 modules ≥ 85/100).**
> Date création : 2026-05-08 · Session #128
> Suppression dès que dashboard `badges-v5.html` montre 28/28 ≥ 85.

---

## 0. UTILISATION

Coller le bloc ci-dessous **au démarrage de chaque nouvelle session Claude AI** travaillant sur l'audit V5.1 des modules DB&M.

```
Je suis Manu (créateur DB&M, IBODE, dev solo Windows file://).
Tu es Claude AI dans le Carnet de Liaison V2.

═══════════════════════════════════════════════════════════════
PROTOCOLE DE DÉMARRAGE OBLIGATOIRE (Niveau 0 §13)
═══════════════════════════════════════════════════════════════
Avant toute action :
1. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\00000_DEBLOQUEZ_MOI.md
2. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\000000_NIVEAU_0_DBM_V0_5_0.md
3. Lire C:\DEV\BIBLE_DE_BLOC\00_GOUVERNANCE\0000_CARNET_LIAISON_DBM_V2.md
4. Lire C:\DEV\BIBLE_DE_BLOC\CLAUDE.md (V2.4)
5. SELECT atelier_prompt_reprise(); + count atelier_principes WHERE statut='active'

═══════════════════════════════════════════════════════════════
ÉTAT MODULES — Vague A équipe + premier savoir TERMINÉS
═══════════════════════════════════════════════════════════════
VERT (modules audités session #128) :
- glossaire   98/100 (étalon REF-MODULE-DBM-01)
- annuaire    97/100
- carnet-bord 98/100
- preferences 98/100
- transmissions 99/100
- faq         99/100
- rempla-midi 92/100 (statut draft POC, état instable, voir §INSTABLE)

À AUDITER (~21 modules restants) :
Vague B savoir : site → pedagogie → cours
Vague C bloc : installation → anatomie → arsenal → fiches → medacta
Vague D espace_perso : disc → interview → organisateur → boite-a-idees → objectifs → veille-documentaire
Vague E pilotage : profile → admin → supervision
Vague F lourds : thesaurus → ged → planning
Vague G specials : recueil-situation

Dashboard live : file:///C:/DEV/BIBLE_DE_BLOC/createur/atelier/badges-v5.html

═══════════════════════════════════════════════════════════════
BUG INSTABLE — rempla-midi/index.html
═══════════════════════════════════════════════════════════════
Symptôme : à chaque Edit/Write sur ce fichier (riche en accents UTF-8 — →—«»),
un linter secondaire tronque le fichier après écriture, supprimant la fin
(closure body/html, toast, scripts).

Cause probable : linter Notepad++ sync OU encodage UTF-16 résiduel converti
en mode bytes UTF-8 lors du save. NULL bytes apparaissent à chaque modification.

Si tu touches rempla-midi/index.html :
- VERIFIE en sortie : tail -5 doit montrer </body></html>
- VERIFIE le compteur de lignes attendu (~470-480)
- VERIFIE NULL bytes = 0 via python3 -c "print(open('f','rb').read().count(b'\\x00'))"
- Si tronqué : restaurer la fin via python heredoc en mode bytes (open('wb'))

═══════════════════════════════════════════════════════════════
RÈGLES STRICTES — STOPPER LE GASPILLAGE TOKENS / TRONCATURE
═══════════════════════════════════════════════════════════════

R1. NE PAS faire d'Edit/Write multiples consécutifs sur un même fichier
    riche en UTF-8. UNE SEULE écriture finale à partir d'une lecture mémoire.

R2. Pour chaque module audité, AVANT modifications :
    a) Lire le fichier en entier (Read sans offset/limit)
    b) Identifier TOUTES les violations en une passe
    c) Préparer le fichier corrigé EN MÉMOIRE
    d) Une seule Write finale avec le contenu complet

R3. Pour chaque écriture sur fichier > 200 lignes :
    Vérification post-écriture obligatoire :
    - wc -l ≥ taille attendue
    - tail -3 = fermeture cohérente
    - file -i = utf-8
    - NULL bytes = 0
    Si KO : restauration immédiate, pas de "ok Manu" prématuré.

R4. Pas de "audit final" qui dit "OK" si je n'ai pas vérifié :
    - tail du fichier
    - structure HTML fermée
    - couleur module appliquée (visuel par Manu)

R5. Pour les patches CSS hardcodés → variables module : utiliser sed Python
    en EXCLUANT la ligne de définition de variable (ne pas créer de cycle
    var(--x) inside x:value).

R6. Profil Manu = D direct.
    - Phrases courtes
    - Pas de "Ok Manu" sauf en clôture nette
    - Pas de gaspillage tokens
    - Pas d'excuses, pas de complaisance
    - Doctrine cloud déjà tranchée → APPLIQUER, pas redemander

R7. INTERDIT-JS-01 strict : JS inline > 5 lignes = extraire dans .js dédié.
    Toute extraction passe par python heredoc en mode bytes (cf §INSTABLE R3).

R8. Doctrine modale (CONV-MODAL-RICHESSE-01 + CONV-MODAL-09) :
    - L1 confirm : modal-dialog-centered + fullscreen-md-down + content rounded-4
    - L2 standard : + modal-lg + scrollable
    - L3 rich : + sections .modal-rich-section avec .modal-rich-label
    - Toujours modal-header-module
    - btn-close coloré + petit (déjà dans dbm-module-color.css)
    - Blur empilées via .modal--blurred-below auto-géré par bdb-modal-a11y.js

R9. CTA principal = btn-module (rempli) - JAMAIS btn-primary
    Secondaire = btn-module-outline
    Bouton admin depuis module = target="_blank" rel="noopener" + icône bi-box-arrow-up-right

R10. Lien admin depuis module membre OUVRE NOUVEL ONGLET (CONV-ADMIN-LINK-TARGET-01)

R11. INTERDIT-B2 amendé : exception pour annuaire, profile, admin, supervision,
     onboarding, preferences, transmissions (peuvent SELECT profiles_directory).

═══════════════════════════════════════════════════════════════
TÂCHE DE LA NOUVELLE SESSION
═══════════════════════════════════════════════════════════════
[TOI MANU TU PRÉCISES ICI : par exemple]
- Confirmer rempla-midi/index.html stable (recettage manuel)
- Si OK : module suivant = site (vague B)
- Si KO sur rempla-midi : diagnostiquer linter/encodage AVANT de toucher autre chose

═══════════════════════════════════════════════════════════════
MÉMOIRE AUTO À VÉRIFIER
═══════════════════════════════════════════════════════════════
C:\Users\Utilisateur\AppData\Roaming\Claude\local-agent-mode-sessions\
cd284cbc-...\spaces\8f60a908-...\memory\MEMORY.md

Règle critique persistante : "Migration v5 fonctionnelle AVANT toute autre modif"

═══════════════════════════════════════════════════════════════
AVANT DE PRODUIRE
═══════════════════════════════════════════════════════════════
- Confirme avoir lu les 4 fichiers gouvernance ci-dessus
- Confirme l'état cloud (260+ principes actifs attendus)
- Pose la question type 0 : "qu'est-ce que je ne sais pas ?"
- Attends mon GO avant de produire
- Pendant que tu réfléchis, liste ce que tu pourrais produire qui contrevient
  au cap "v5 fonctionnelle 100% à 85+/100"
```

---

## 1. CONTEXTE — Pourquoi ce prompt existe

Session #128 a démarré avec l'objectif : faire passer chaque module à VERT (≥85/100) un par un, recettage avant passage au suivant. **Vague A équipe a atteint 100% VERT** (4 modules), **FAQ démarrée vague B**, **rempla-midi (POC draft) traité en parallèle**.

### Causes du gaspillage à éviter

1. **Tronquage récurrent** des fichiers UTF-8 lors d'Edit/Write multiples consécutifs (rempla-midi a souffert au moins 4 fois). Linter secondaire (Notepad++ ? sync session ?) coupe la fin du fichier après chaque écriture.

2. **Cycles var(--x)** introduits par sed naïfs sur les couleurs hardcodées (ex : `--module-color-strong: var(--module-color-strong)` qui ne se résout pas).

3. **NULL bytes UTF-16** persistants malgré encoding utf-8 affiché par `file -i`. Apparaissent à chaque sauvegarde côté Notepad++ ou sync.

4. **Repassage doctrinal redondant** : redemander à Manu ce qui est déjà tranché en cloud (`atelier_principes` statut active). Doctrine cloud = autorité, pas Manu en direct.

5. **"Ok Manu" prématuré** : annoncer "module patché 99/100" sans avoir vérifié `tail` du fichier ni recetté visuellement.

---

## 2. DOCTRINE CLOUD APPLICABLE

Toutes ces conventions sont en `atelier_principes` statut active — elles s'**appliquent**, ne se redébattent pas :

| Réf | Sujet |
|---|---|
| `CONV-CHAIN-E` (V5.1) | Bootstrap 5.3.3 → Icons 1.11.1 → dbm-theme → bdb-ui-kit → dbm-module-color → [module]-ui |
| `P-CDS-01` | theme-base.css CDN @4faebd02 (déprécié pour modules V5.1) |
| `CONV-SURFACE-MARKER-HTML` | `<!-- DBM \| Surface: ... \| Auth: ... \| Shell: ... -->` (4 champs) |
| `INTERDIT-E1` (V5) | `#bdb-shell` premier enfant `#wrapper` |
| `INTERDIT-JS-01` | Zéro JS inline après migration shell |
| `INTERDIT-JS-02` | Zéro fonction dupliquée si socle existe (escHtml, bdbToast, etc.) |
| `INTERDIT-D6` | Zéro `console.*` en prod |
| `INTERDIT-COULEUR-01` | Rouge interdit sur surface module (sauf btn-danger destructif) |
| `INTERDIT-MODULE-COLOR-01` | Couleurs en variables CSS, jamais hardcoded inline |
| `CONV-BTN-01/02` | CTA principal = `btn-module`, secondaire = `btn-module-outline` |
| `CONV-MODAL-01..08` | Pattern modale (header-module, rounded-4 border-0 shadow-lg, dialog-centered+scrollable+fullscreen-md-down) |
| `CONV-MODAL-09` | Blur modale du dessous quand empilée |
| `CONV-MODAL-RICHESSE-01` | 3 niveaux L1/L2/L3 (cf. `00_GOUVERNANCE/PATTERNS/MODALES_RICHESSE_DBM.md`) |
| `CONV-ADMIN-LINK-TARGET-01` | Lien admin.html depuis module membre = nouvel onglet |
| `CONV-SHELL-THEME-01` | `data-shell-theme="dbm"` sur shell V5.1 |
| `CONV-SHELL-LOGIN-MODE-01` | `data-login-mode="modal"` pour modules découverte |
| `INTERDIT-B2` (amendé) | Exception modules profil-related |

---

## 3. CHECKLIST AUDIT MODULE — modèle reproductible

Pour chaque module à passer en VERT :

```
[ ] Lecture intégrale index.html (Read sans limit)
[ ] Lecture intégrale admin.html si existe
[ ] Lecture *.js (app + admin si séparé)
[ ] Lecture *.css module
[ ] Audit cloud : SELECT count(*) violations potentielles dans atelier_principes

[ ] Identifier violations :
    - Surface marker (4 champs canon ?)
    - Chaîne CSS V5.1 (admin souvent en V5 ancienne)
    - data-shell-theme="dbm" (souvent absent admin)
    - Wrapper .app-content[data-module-color] (cascade thème)
    - Variables :root pour modales
    - bdb-pwa.js fin de body (pas head)
    - bdb-modal-a11y.js + bdb-demo.js (souvent oubliés)
    - Toast pattern bdbToast (#toastMsg/#toastText)
    - JS inline (INTERDIT-JS-01) → extraire si > 5 lignes
    - Fonctions locales escHtml/showToast → supprimer (window.escHtml/bdbToast)
    - btn-primary → btn-module (CTA) ou btn-module-outline (secondaire)
    - text-primary décoratif → retirer
    - badge bg-danger/success/primary saturés → variantes -subtle
    - modal-content brut → rounded-4 border-0 shadow-lg
    - modal-header brut → modal-header-module
    - nav-tabs → bdb-tabs
    - href="admin.html" → target="_blank" rel="noopener" + icône externe
    - Inline styles → extraire en classes (sauf variables module L36)
    - Couleurs hardcodées CSS → variables module
    - Hash CDN @63905396 obsolète → retirer (V5.1 = pas de theme-base CDN)

[ ] Préparer le contenu complet en mémoire (pas de patch incrémental)
[ ] UNE Write par fichier
[ ] Vérification post-écriture :
    - wc -l (proche de la version originale ou plus si JS extrait)
    - tail -3 (fermeture cohérente)
    - file -i (utf-8)
    - python3 NULL bytes count (= 0)
    - grep audits (showToast, console, btn-primary, hash obsolète)

[ ] Calcul note (P0 −20 / P1 −10 / P2 −5 / P3 −2 / base 100)
[ ] Mise à jour dashboard badges-v5.html
[ ] Soumettre à Manu pour recettage
[ ] Attendre validation Manu avant module suivant
```

---

## 4. NOTES À LA SESSION

- **Si la session démarre sans contexte** → poser la question type 0 et lire les 4 fichiers gouvernance en premier.
- **Si Manu signale un bug** → ne pas patcher avant d'avoir compris la cause racine (cf. cas FAQ skeleton infini = chaîne JS tronquée + modale orpheline).
- **Si le linter tronque encore** → tester l'encoding source du fichier, peut-être convertir UTF-16 → UTF-8 stable avant tout Edit.

---

## 5. SUPPRESSION DE CE FICHIER

Quand le dashboard `createur/atelier/badges-v5.html` montre :
- 28 modules audités (status='active' confirmé en cloud)
- Tous ≥ 85/100
- 0 ROUGE, 0 GRIS

→ Supprimer ce fichier ET la mémoire auto associée. La migration V5.1 est terminée.

---

*Fin du prompt de reprise. Vivant tant que la migration V5 ≠ 100%.*
