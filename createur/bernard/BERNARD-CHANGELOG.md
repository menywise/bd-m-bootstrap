# BERNARD — Changelog

## V1.0.0 — 2026-04-24

**Session #100 — Migration 162 — Decision D-2026-04-23-BERNARD-01**

### Cree
- Identite Bernard : 9w8 mur integre en 3, centre instinctif, S/C + D/I, jaune Spirale
- Signature prise de parole : vu / action immediate / objectifs explicites
- Fiche Bernard V0.2 : 18 points (9 ennea + 4 DISC + 5 Spirale), 6 symboles cotation
- Tables DB : `bernard_lectures` + `bernard_lecture_cotations` (migration 162)
- RLS L3 Creator stricte (profiles.is_creator = true)
- FK souple : `persona_code → disc_personas(code) ON DELETE SET NULL`
- 8 regles JURISP-BERNARD en `atelier_principes` categorie `bernard_regles` (FAB3R complet)
  - 001 Polarisation BDB assumee
  - 002 Simulation iterable
  - 003 Mode questionnement
  - GF-01 Ratio engagement minimal 50%
  - GF-02 Hypothese plausible obligatoire
  - GF-03 Lecture avant passage de main
  - GF-04 Anti-questionnement recurrent
  - GF-05 Honnetete active
- Skill `bernard-bdb` V1.0.0 installe dans claude.ai
- Page browser `atelier/bernard.html` + `bernard-app.js` + `bernard-ui.css`
- Dossier local `BERNARD/` avec README, template fiche, arborescence

### Incident corrige
- Migration 162 V1 : hallucination `type='architecture'` → corrige `type='doctrine'` (ERR-IA-01)
- Migration 162 V1 : FK dures `session_num/decision_ref` → alignement convention BDB (references souples sans FK)

### Mode persistance
- B2 : persistance sur demande explicite (pas automatique)
