-- ══════════════════════════════════════════════════════════
-- error_404_logs — tracking liens cassés BDB
-- Emplacement : 02_INFRASTRUCTURE/SUPABASE/
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS error_404_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_url text NOT NULL,
  referrer      text,
  user_agent    text,
  user_id       uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

-- Index pour requêtes webmaster
CREATE INDEX IF NOT EXISTS idx_404_created ON error_404_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_404_url ON error_404_logs (requested_url);

-- RLS — tout le monde peut INSERT (y compris anon), seul admin peut SELECT
ALTER TABLE error_404_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_404_insert_anon ON error_404_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY pol_404_insert_auth ON error_404_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY pol_404_read_admin ON error_404_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ══════════════════════════════════════════════════════════
-- Requêtes webmaster utiles
-- ══════════════════════════════════════════════════════════

-- Top 20 URLs les plus demandées (liens cassés à corriger)
-- SELECT requested_url, COUNT(*) as hits, MAX(created_at) as last_hit
-- FROM error_404_logs
-- GROUP BY requested_url
-- ORDER BY hits DESC
-- LIMIT 20;

-- 404 avec referrer (liens internes cassés = priorité max)
-- SELECT requested_url, referrer, COUNT(*) as hits
-- FROM error_404_logs
-- WHERE referrer LIKE '%manuelrohaut.fr%'
-- GROUP BY requested_url, referrer
-- ORDER BY hits DESC;

-- 404 des 24 dernières heures
-- SELECT requested_url, referrer, created_at
-- FROM error_404_logs
-- WHERE created_at > now() - interval '24 hours'
-- ORDER BY created_at DESC;
