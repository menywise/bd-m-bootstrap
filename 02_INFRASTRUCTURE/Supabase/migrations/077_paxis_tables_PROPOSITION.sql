-- ============================================================
-- MIGRATION 077_paxis_tables.sql
-- MODULE : paxis — Entretien structuré retours terrain
-- STATUT : PROPOSITION — NE PAS EXÉCUTER AVANT VALIDATION MANU
-- RÉFÉRENCE : CTX_PAXIS_V1_0_0 · D-2026-04-01-PAXIS-CDS
-- ============================================================

-- ============================================================
-- 1. TABLE paxis_questions (référentiel)
-- ============================================================
CREATE TABLE IF NOT EXISTS paxis_questions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code        text UNIQUE NOT NULL,
    type        text NOT NULL,
    text        text NOT NULL,
    roles       text[] NOT NULL DEFAULT '{}',
    depth       integer NOT NULL DEFAULT 1,
    position    integer NOT NULL DEFAULT 0,
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE paxis_questions IS 'Référentiel questions entretien PAXIS — 5 types, 6 rôles';

CREATE INDEX IF NOT EXISTS idx_paxis_questions_type
    ON paxis_questions (type);
CREATE INDEX IF NOT EXISTS idx_paxis_questions_active
    ON paxis_questions (is_active) WHERE is_active = true;

-- Trigger updated_at
CREATE TRIGGER set_paxis_questions_updated_at
    BEFORE UPDATE ON paxis_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. TABLE paxis_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS paxis_sessions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by    uuid NOT NULL REFERENCES auth.users(id),
    role          text NOT NULL,
    started_at    timestamptz NOT NULL DEFAULT now(),
    completed_at  timestamptz,
    iteration     integer NOT NULL DEFAULT 1,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE paxis_sessions IS 'Sessions entretien PAXIS — 1 session = 1 utilisateur';

CREATE INDEX IF NOT EXISTS idx_paxis_sessions_user
    ON paxis_sessions (created_by, created_at DESC);

CREATE TRIGGER set_paxis_sessions_updated_at
    BEFORE UPDATE ON paxis_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. TABLE paxis_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS paxis_responses (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          uuid NOT NULL REFERENCES paxis_sessions(id) ON DELETE CASCADE,
    question_id         uuid REFERENCES paxis_questions(id),
    question_text       text NOT NULL,
    question_type       text NOT NULL,
    response_text       text,
    status              text NOT NULL DEFAULT 'skipped',
    is_generated        boolean NOT NULL DEFAULT false,
    parent_response_id  uuid REFERENCES paxis_responses(id),
    depth               integer NOT NULL DEFAULT 1,
    position            integer NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE paxis_responses IS 'Réponses entretien PAXIS — initiales + générées (follow-up)';

CREATE INDEX IF NOT EXISTS idx_paxis_responses_session
    ON paxis_responses (session_id, position);

-- ============================================================
-- 4. RLS — paxis_questions
-- ============================================================
ALTER TABLE paxis_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY paxis_questions_member_read ON paxis_questions
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY paxis_questions_admin_write ON paxis_questions
    FOR ALL TO authenticated
    USING (public.bdb_is_admin())
    WITH CHECK (public.bdb_is_admin());

-- ============================================================
-- 5. RLS — paxis_sessions
-- ============================================================
ALTER TABLE paxis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY paxis_sessions_own_read ON paxis_sessions
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY paxis_sessions_own_insert ON paxis_sessions
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY paxis_sessions_own_update ON paxis_sessions
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY paxis_sessions_admin_read ON paxis_sessions
    FOR SELECT TO authenticated
    USING (public.bdb_is_admin());

-- ============================================================
-- 6. RLS — paxis_responses
-- ============================================================
ALTER TABLE paxis_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY paxis_responses_own_read ON paxis_responses
    FOR SELECT TO authenticated
    USING (session_id IN (
        SELECT id FROM paxis_sessions WHERE created_by = auth.uid()
    ));

CREATE POLICY paxis_responses_own_insert ON paxis_responses
    FOR INSERT TO authenticated
    WITH CHECK (session_id IN (
        SELECT id FROM paxis_sessions WHERE created_by = auth.uid()
    ));

CREATE POLICY paxis_responses_own_update ON paxis_responses
    FOR UPDATE TO authenticated
    USING (session_id IN (
        SELECT id FROM paxis_sessions WHERE created_by = auth.uid()
    ))
    WITH CHECK (session_id IN (
        SELECT id FROM paxis_sessions WHERE created_by = auth.uid()
    ));

CREATE POLICY paxis_responses_admin_read ON paxis_responses
    FOR SELECT TO authenticated
    USING (public.bdb_is_admin());

-- ============================================================
-- 7. SEED — 21 questions initiales
-- ============================================================

-- TYPE : exploration (5)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('EXP001', 'exploration', 'Comment se passe une journée type pour vous au bloc ?', ARRAY['responsable','chirurgien','ibode','preparateur','qualite'], 1, 1),
('EXP002', 'exploration', 'Qu''est-ce qui fonctionne bien dans l''organisation actuelle ?', ARRAY['chirurgien','ibode','qualite'], 1, 2),
('EXP003', 'exploration', 'Quels outils utilisez-vous au quotidien pour vous organiser ?', ARRAY['responsable','cadre','preparateur'], 1, 3),
('EXP004', 'exploration', 'Comment transmettez-vous les informations à vos collègues ?', ARRAY['ibode','cadre','preparateur'], 1, 4),
('EXP005', 'exploration', 'Si vous pouviez changer une seule chose dans votre quotidien, ce serait quoi ?', ARRAY['responsable','chirurgien','ibode','cadre','preparateur','qualite'], 1, 5);

-- ⚠ ATTENTION : les textes ci-dessus sont des PLACEHOLDERS.
-- Remplacer par les textes RÉELS extraits de INITIAL_QUESTIONS dans le JS
-- avant exécution. Utiliser le prompt Phase 0c ci-dessous pour extraire.

-- TYPE : clarification (3)
-- TYPE : tension (4)
-- TYPE : criticite (4)
-- TYPE : informel (5)
-- → À compléter avec extraction terrain (voir note ci-dessous)

-- ============================================================
-- NOTE IMPORTANTE
-- ============================================================
-- Les textes des 21 questions doivent être extraits du JS terrain.
-- Prompt Claude Code pour extraction :
--
-- sed -n '/const INITIAL_QUESTIONS/,/^[[:space:]]*\];/p' modules/paxis/index.html
--
-- Puis injecter les textes réels dans ce fichier avant exécution.
-- ============================================================
