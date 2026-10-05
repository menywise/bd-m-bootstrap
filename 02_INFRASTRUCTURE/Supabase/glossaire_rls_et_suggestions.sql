-- ============================================================
-- glossaire_rls_et_suggestions.sql
-- DATE   : 2026-03-21
-- Réf    : Alignement sur pattern tag_suggestions (D-2026-03-21-S01)
-- Cible  : Supabase cloud — SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. RLS sur la table glossaire existante
--    (était ON mais 0 politique → deny-all implicite)
-- ──────────────────────────────────────────────────────────────

-- Lecture publique : tout le monde peut consulter le glossaire
CREATE POLICY glossaire_select_public ON glossaire
  FOR SELECT TO anon
  USING (true);

CREATE POLICY glossaire_select_member ON glossaire
  FOR SELECT TO authenticated
  USING (true);

-- Écriture : admin uniquement (via bdb_is_admin())
CREATE POLICY glossaire_admin_all ON glossaire
  FOR ALL TO authenticated
  USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- Vérification post-exécution :
-- SELECT policyname FROM pg_policies WHERE tablename = 'glossaire';
-- → doit retourner 3 lignes


-- ──────────────────────────────────────────────────────────────
-- 2. Table glossaire_suggestions
--    Workflow : membre propose → admin valide/rejette → si validé,
--    l'admin crée l'entrée dans glossaire manuellement
--    (ou trigger futur automatique)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS glossaire_suggestions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_term    text NOT NULL,                          -- terme, acronyme, abréviation
  proposed_def     text NOT NULL DEFAULT '',               -- définition proposée
  proposed_notes   text,                                   -- usage, contexte (optionnel)
  proposed_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected')),
  reviewed_by      uuid REFERENCES auth.users(id),
  reviewed_at      timestamptz,
  admin_note       text,                                   -- motif de rejet ou commentaire admin
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Index file d'attente admin
CREATE INDEX idx_glossaire_suggestions_status
  ON glossaire_suggestions(status)
  WHERE status = 'pending';

ALTER TABLE glossaire_suggestions ENABLE ROW LEVEL SECURITY;

-- Membres : proposer + voir ses propres soumissions
CREATE POLICY glossaire_sug_member_insert ON glossaire_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY glossaire_sug_member_select ON glossaire_suggestions
  FOR SELECT TO authenticated
  USING (proposed_by = auth.uid() OR bdb_is_admin());

-- Admin : tout (valider, rejeter, supprimer, modifier)
CREATE POLICY glossaire_sug_admin_all ON glossaire_suggestions
  FOR ALL TO authenticated
  USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- Vérification post-exécution :
-- SELECT policyname FROM pg_policies WHERE tablename = 'glossaire_suggestions';
-- → doit retourner 3 lignes (member_insert, member_select, admin_all)
