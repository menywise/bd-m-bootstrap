# AUDIT V5 — Rapport Tranche T9 (F16 Anti-regression)

**Run** : c54bf6c6-bd8f-4c62-9b99-377965c18403

| Total | OK | KO | SKIP |
|---|---|---|---|
| 490 | 49 | 0 | 441 |

## Synthese T9
- F16-D09 (Coherence labels FR) : 49/49 fichiers OK — aucun mix EN/FR.
- 9 dimensions sur 10 SKIP (cross-parsing JS/SQL pour F16-D01 a D08 et D10).

Ces dimensions necessitent un parser plus avance (lecture JS + cross-check SQL) pour detecter :
- Fonctions citees qui n existent pas
- Tables / colonnes / enums inventes
- IDs / classes references inexistants
- Event listeners sur elements absents