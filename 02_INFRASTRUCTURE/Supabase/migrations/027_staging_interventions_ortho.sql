-- ============================================================
-- Migration 027 — Table staging import ortho Phase B
-- Date    : 2026-03-25
-- Objet   : Table temporaire pour import brut OPTIM 70K+ lignes
--           Colonnes text uniquement — nettoyage SQL en place
--           DROP apres validation + INSERT INTO thesaurus_interventions
-- ============================================================

-- Securite : ne pas executer sur la mauvaise base
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'thesaurus_protocoles'
  ) THEN
    RAISE EXCEPTION 'Table thesaurus_protocoles introuvable — mauvaise base ?';
  END IF;
END $$;

-- ============================================================
-- 1. CREATE staging table (colonnes brutes OPTIM)
-- ============================================================
DROP TABLE IF EXISTS staging_interventions_ortho;

CREATE TABLE staging_interventions_ortho (
  id                    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Colonnes brutes OPTIM (tout text, aucune FK)
  protocole_operatoire  text,           -- intitule OPTIM brut
  date_intervention     text,           -- format variable (sera tronque YYYY-MM)
  chirurgien            text,           -- NOM Prenom brut OPTIM
  duree_minutes         text,           -- text pour absorber valeurs sales
  panseuse              text,           -- NOM Prenom brut OPTIM
  lateralite            text,           -- GAUCHE/DROIT/BILATERAL/vide
  note                  text,           -- champ libre OPTIM
  specialite            text,           -- ORTHO / TRAUMATO / etc.

  -- Colonnes de mapping (remplies par les migrations de nettoyage)
  -- Nommage aligne sur thesaurus_interventions cible (V1.8.0 §19)
  protocole_id          uuid,           -- FK resolue apres mapping libelle → thesaurus_protocoles
  chirurgien_id         uuid,           -- FK resolue apres reconciliation → thesaurus_chirurgiens
  panseuse_id           uuid,           -- FK resolue apres reconciliation → thesaurus_panseuses
  date_clean            date,           -- date tronquee YYYY-MM-01

  -- Colonnes de controle qualite
  _status               text DEFAULT 'raw'
                        CHECK (_status IN ('raw','mapped','orphan','duplicate','ready','rejected')),
  _mapping_notes        text,           -- trace des transformations appliquees
  _row_hash             text            -- hash pour detection doublons
);

-- ============================================================
-- 2. INDEX de travail
-- ============================================================
CREATE INDEX idx_stg_ortho_status       ON staging_interventions_ortho (_status);
CREATE INDEX idx_stg_ortho_protocole    ON staging_interventions_ortho (protocole_operatoire);
CREATE INDEX idx_stg_ortho_protocole_id ON staging_interventions_ortho (protocole_id);
CREATE INDEX idx_stg_ortho_chirurgien   ON staging_interventions_ortho (chirurgien);
CREATE INDEX idx_stg_ortho_panseuse     ON staging_interventions_ortho (panseuse);
CREATE INDEX idx_stg_ortho_hash         ON staging_interventions_ortho (_row_hash);

-- ============================================================
-- 3. COMMENTAIRES
-- ============================================================
COMMENT ON TABLE staging_interventions_ortho IS
  'Staging import brut OPTIM ortho Phase B — 70K+ lignes — DROP apres validation';

COMMENT ON COLUMN staging_interventions_ortho._status IS
  'raw=import brut | mapped=id_protocole resolve | orphan=FK cassee | duplicate=doublon detecte | ready=pret INSERT | rejected=exclus';

COMMENT ON COLUMN staging_interventions_ortho._row_hash IS
  'md5(protocole_operatoire || date || chirurgien || duree) pour detection doublons';

-- ============================================================
-- 4. RLS desactive (table admin-only, pas exposee via API REST)
-- ============================================================
-- Pas de ALTER TABLE ENABLE ROW LEVEL SECURITY
-- Pas de policy — acces uniquement via SQL Editor / psql admin

-- ============================================================
-- 5. Controle post-creation
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'staging_interventions_ortho'
  ) THEN
    RAISE EXCEPTION 'staging_interventions_ortho non creee — echec migration 027';
  END IF;
  RAISE NOTICE '027 OK — staging_interventions_ortho creee (0 lignes)';
END $$;
