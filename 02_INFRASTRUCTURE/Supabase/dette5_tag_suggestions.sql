-- ============================================================
-- DETTE 5 — Table tag_suggestions (workflow proposition → validation admin)
-- Réf   : D-2026-03-20-T09 arbitrage 3 (tags = référentiel admin)
-- Date  : 2026-03-21
-- Cible : Supabase cloud — SQL Editor
-- ============================================================
-- Contexte : Les membres ne peuvent plus créer de tags directement.
--   Ils proposent un libellé → l'admin valide ou rejette.
--   Si validé, l'admin crée le tag dans la table tags manuellement
--   (ou un trigger futur le fait automatiquement).

CREATE TABLE IF NOT EXISTS tag_suggestions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_label text NOT NULL,
  proposed_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  reviewed_by    uuid REFERENCES auth.users(id),
  reviewed_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Index pour les requêtes admin (file d'attente pending)
CREATE INDEX idx_tag_suggestions_status ON tag_suggestions(status)
  WHERE status = 'pending';

ALTER TABLE tag_suggestions ENABLE ROW LEVEL SECURITY;

-- Membres authentifiés : proposer + voir ses propres propositions
CREATE POLICY tag_suggestions_member_insert ON tag_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY tag_suggestions_member_select ON tag_suggestions
  FOR SELECT TO authenticated
  USING (proposed_by = auth.uid() OR bdb_is_admin());

-- Admin : tout (valider, rejeter, supprimer)
CREATE POLICY tag_suggestions_admin_all ON tag_suggestions
  FOR ALL TO authenticated
  USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- ⚠ APRÈS EXÉCUTION :
-- SELECT tablename, policyname FROM pg_policies WHERE tablename = 'tag_suggestions';
-- → doit retourner 3 lignes (member_insert, member_select, admin_all)
--
-- DETTE UI FUTURE (hors scope cette session) :
--   - fiches : tag selector → bouton "Proposer ce tag" si terme introuvable
--   - admin  : onglet tags → file de validation pending
