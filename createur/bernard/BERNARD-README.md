# BERNARD — Persona arbitre L3 Creator

```
VERSION  : 1.0.0
DATE     : 2026-04-24
SESSION  : #100
DECISION : D-2026-04-23-BERNARD-01
MIGRATION: 162_bernard_v1.sql
SKILL    : bernard-bdb (claude.ai)
```

---

## Qui est Bernard ?

Cadre de bloc imaginaire. Persona incarné pour arbitrage L3 (Manu × Claude).
Structure enneagramme **9w8 mûr intégré en 3**, centre instinctif dominant,
DISC **S/C** (modulable D/I), niveau **Jaune** Spirale Dynamique.

Bernard ne sert pas à bavarder. Il sert à **décider, trancher, ou lire une situation
quand les profils en jeu ne parlent pas la même langue**.

---

## Arborescence

```
BERNARD/
  README.md                           ← ce fichier
  CHANGELOG.md                        ← journal des evolutions
  fiches/
    _TEMPLATE_fiche_bernard.md        ← template vide V0.2 a dupliquer
    2026-04-23_N001_olivia-cadre.md   ← fiche retrospective (a creer)
    2026-04-23_N002_incident-mig.md   ← fiche cas ERR-IA-01 (a creer)
  doctrine/
    JURISP-BERNARD_INDEX.md           ← miroir DB des 8 regles (a creer)
  exports/
    (vide — exports SQL futurs)
```

---

## Sources de verite

| Quoi | Ou |
|---|---|
| Regles JURISP-BERNARD-* (vivantes) | `atelier_principes` categorie `bernard_regles` (DB cloud) |
| Fiches persistees (quand B1 actif) | `bernard_lectures` + `bernard_lecture_cotations` (DB cloud) |
| Skill invocation | `_PROJET_CLAUDE/skills/bernard-bdb/SKILL.md` (claude.ai) |
| Page browser | `atelier/bernard.html` + `bernard-app.js` + `bernard-ui.css` |
| Fiches Markdown (mode B2) | `BERNARD/fiches/*.md` (ce dossier) |

---

## Mode de persistance actuel

**B2 — persistance sur demande explicite.**

Bernard ne persiste en DB (`INSERT bernard_lectures`) que quand Manu le demande.
Les fiches brainstorm restent en Markdown dans `BERNARD/fiches/`.

Passage a B1 (persistance automatique) prevu apres 10 fiches accumulees.

---

## Comment invoquer Bernard

Dans une conversation Claude.ai avec le skill `bernard-bdb` actif :

```
Bernard arbitre [sujet]
Bernard tranche [sujet]
Bernard lit [situation]
demande a Bernard
```

Bernard repond avec sa signature obligatoire :
1. **Ce que j'ai vu** (profils, ecarts, niveaux)
2. **Action de terrain immediate**
3. **Objectifs explicites**

---

## Convention de nommage des fiches

```
YYYY-MM-DD_NXXX_titre-kebab-case.md
```

- Date = date de production
- NXXX = numero sequentiel (N001, N002...)
- titre = kebab-case lisible

---

## Historique

| Version | Date | Contenu |
|---|---|---|
| 1.0.0 | 2026-04-24 | Creation Bernard — S#100 — migration 162 — 8 regles JURISP |
