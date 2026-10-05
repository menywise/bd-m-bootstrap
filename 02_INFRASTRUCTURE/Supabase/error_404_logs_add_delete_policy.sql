-- Ajout politique DELETE admin sur error_404_logs
-- Manquante lors de la création initiale (D-2026-03-20-T08)

CREATE POLICY pol_404_delete_admin ON error_404_logs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Vérification :
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'error_404_logs';
-- → doit retourner 4 lignes dont pol_404_delete_admin (DELETE)
