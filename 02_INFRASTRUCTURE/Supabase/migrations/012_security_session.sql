-- ============================================================
-- 012_security_session.sql
-- tag_suggestions · glossaire_suggestions · bucket MIME policy
-- Réf   : D-2026-03-21-S01 (D5) + DATA_MODEL §4
-- Statut: ⚠ tag_suggestions et bucket policy À VÉRIFIER
--         glossaire_suggestions ❓ incertain
-- ============================================================

-- ─── tag_suggestions ───

CREATE TABLE IF NOT EXISTS public.tag_suggestions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_label text NOT NULL,
  proposed_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    uuid REFERENCES auth.users(id),
  reviewed_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tag_suggestions_status
  ON public.tag_suggestions (status) WHERE status = 'pending';

ALTER TABLE public.tag_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tag_suggestions_member_insert ON public.tag_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY tag_suggestions_member_select ON public.tag_suggestions
  FOR SELECT TO authenticated
  USING (proposed_by = auth.uid() OR bdb_is_admin());

CREATE POLICY tag_suggestions_admin_all ON public.tag_suggestions
  FOR ALL TO authenticated
  USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- ─── glossaire_suggestions ───

CREATE TABLE IF NOT EXISTS public.glossaire_suggestions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_term  text NOT NULL,
  proposed_def   text NOT NULL DEFAULT '',
  proposed_notes text,
  proposed_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    uuid REFERENCES auth.users(id),
  reviewed_at    timestamptz,
  admin_note     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glossaire_suggestions_status
  ON public.glossaire_suggestions (status) WHERE status = 'pending';

ALTER TABLE public.glossaire_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY glossaire_sug_member_insert ON public.glossaire_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY glossaire_sug_member_select ON public.glossaire_suggestions
  FOR SELECT TO authenticated
  USING (proposed_by = auth.uid() OR bdb_is_admin());

CREATE POLICY glossaire_sug_admin_all ON public.glossaire_suggestions
  FOR ALL TO authenticated
  USING (bdb_is_admin())
  WITH CHECK (bdb_is_admin());

-- ─── Bucket Storage policy (MIME restriction) ───
-- ⚠ À EXÉCUTER MANUELLEMENT si pas déjà fait
-- Réf : dette3_bucket_storage_policy.sql (D-2026-03-21-S01 D3)

-- Vérifier d'abord : Dashboard > Storage > content-images > Public = OFF
-- Puis exécuter :
/*
CREATE POLICY "Restrict MIME types on content-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-images'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (
      LOWER(RIGHT(name, 4)) IN ('.jpg', '.png', '.gif', '.svg')
      OR LOWER(RIGHT(name, 5)) IN ('.jpeg', '.webp')
    )
  );
*/
