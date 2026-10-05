-- ============================================================
-- MIGRATION 077_paxis_tables.sql
-- MODULE : paxis — Entretien structuré retours terrain
-- RÉFÉRENCE : CTX_PAXIS_V3_0_0 · D-2026-04-01-PAXIS-CDS
-- STATUT : PROPOSITION — NE PAS EXÉCUTER AVANT VALIDATION MANU
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
-- 7. SEED — 21 questions initiales (textes terrain)
-- ============================================================

-- EXPLORATION (5)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('EXP001', 'exploration', 'Comment se passe concrètement la préparation d''une intervention standard ?', ARRAY['responsable','chirurgien','ibode','preparateur'], 1, 1),
('EXP002', 'exploration', 'Qui fait quoi, réellement, lors de la phase de contrôle pré-opératoire ?', ARRAY['ibode','chirurgien','qualite'], 1, 2),
('EXP003', 'exploration', 'Quand les décisions d''ordonnancement sont-elles prises ? Par qui ?', ARRAY['responsable','cadre'], 1, 3),
('EXP004', 'exploration', 'Comment circule l''information entre la préparation et la salle d''opération ?', ARRAY['preparateur','ibode','cadre'], 1, 4),
('EXP005', 'exploration', 'Décrivez une journée type au bloc, depuis votre perspective.', ARRAY['responsable','chirurgien','ibode','preparateur','qualite','cadre'], 1, 5);

-- CLARIFICATION (3)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('CLA001', 'clarification', 'Que signifie "en général" quand vous décrivez une procédure ? Quelles sont les exceptions ?', ARRAY['responsable','chirurgien','ibode','preparateur','qualite','cadre'], 2, 1),
('CLA002', 'clarification', 'Dans quels cas précis cette règle s''applique-t-elle ? Et dans lesquels non ?', ARRAY['qualite','ibode','chirurgien'], 2, 2),
('CLA003', 'clarification', 'Qui décide vraiment quand il y a un doute sur le matériel ?', ARRAY['ibode','preparateur','chirurgien'], 2, 3);

-- TENSION (4)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('TEN001', 'tension', 'Que se passe-t-il quand le protocole standard est impossible à suivre ?', ARRAY['ibode','chirurgien','qualite'], 2, 1),
('TEN002', 'tension', 'Que faites-vous quand la règle officielle contredit la pratique efficace ?', ARRAY['chirurgien','ibode','responsable'], 2, 2),
('TEN003', 'tension', 'Qui compense quand un maillon de la chaîne ne fonctionne pas ?', ARRAY['cadre','ibode','preparateur'], 2, 3),
('TEN004', 'tension', 'Y a-t-il des situations où deux règles se contredisent ? Comment gérez-vous ?', ARRAY['qualite','ibode','responsable'], 2, 4);

-- CRITICITÉ (4)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('CRI001', 'criticite', 'Qu''est-ce qui serait inacceptable d''oublier lors d''une préparation ?', ARRAY['ibode','preparateur','chirurgien'], 1, 1),
('CRI002', 'criticite', 'Qu''est-ce qui a déjà posé un problème grave dans votre expérience ?', ARRAY['responsable','chirurgien','ibode','qualite'], 2, 2),
('CRI003', 'criticite', 'Qu''est-ce qui est toléré aujourd''hui malgré le risque que cela représente ?', ARRAY['qualite','responsable','cadre'], 3, 3),
('CRI004', 'criticite', 'Quel serait le pire scénario si un contrôle était manqué ?', ARRAY['qualite','ibode','chirurgien'], 2, 4);

-- INFORMEL (5)
INSERT INTO paxis_questions (code, type, text, roles, depth, position) VALUES
('INF001', 'informel', 'Qu''est-ce qui n''est jamais écrit mais que tout le monde sait ?', ARRAY['ibode','preparateur','chirurgien','cadre'], 2, 1),
('INF002', 'informel', 'Qui détient la mémoire du fonctionnement réel du bloc ?', ARRAY['cadre','responsable','ibode'], 2, 2),
('INF003', 'informel', 'Que se passe-t-il quand cette personne est absente ?', ARRAY['cadre','responsable','preparateur'], 3, 3),
('INF004', 'informel', 'Y a-t-il des "trucs" qui ne sont transmis qu''oralement ?', ARRAY['ibode','chirurgien','preparateur'], 2, 4),
('INF005', 'informel', 'Comment les nouveaux apprennent-ils ce qui n''est pas dans les procédures ?', ARRAY['cadre','ibode','responsable'], 2, 5);
