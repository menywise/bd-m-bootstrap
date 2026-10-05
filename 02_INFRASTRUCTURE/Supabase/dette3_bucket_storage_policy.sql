-- ============================================================
-- DETTE 3 — Storage policy MIME sur bucket content-images
-- Réf   : R2-STOR-03 (AUDIT_SECURITE_BDB_V1_0_0)
-- Date  : 2026-03-21
-- Cible : Supabase cloud — SQL Editor
-- ============================================================
-- AVANT EXÉCUTION :
--   1. Vérifier manuellement que le bucket est PRIVÉ :
--      Dashboard Supabase > Storage > content-images > Settings > Public = OFF
--   2. Exécuter ce script dans le SQL Editor

-- Restreindre les uploads aux formats image autorisés
CREATE POLICY bucket_upload_mime ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'content-images'
    AND (storage.extension(name)) IN ('jpg','jpeg','png','gif','webp')
  );

-- ⚠ APRÈS EXÉCUTION :
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- → doit contenir bucket_upload_mime
