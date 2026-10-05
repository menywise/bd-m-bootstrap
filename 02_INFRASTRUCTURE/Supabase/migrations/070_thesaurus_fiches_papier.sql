-- ════════════════════════════════════════════════════════════════
-- Migration 070 — thesaurus_fiches_papier
-- Rapprochement fiches Word chirurgiens → protocoles Supabase
-- ════════════════════════════════════════════════════════════════

-- ── TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.thesaurus_fiches_papier (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chirurgien          text NOT NULL,
  nom_fichier         text NOT NULL,
  chemin_relatif      text NOT NULL DEFAULT '',
  protocole_id        uuid NULL REFERENCES public.thesaurus_protocoles(id),
  id_protocole_match  text NOT NULL DEFAULT '',
  libelle_cible_match text NOT NULL DEFAULT '',
  score               numeric(4,3) NOT NULL DEFAULT 0,
  via                 text NOT NULL DEFAULT 'libelle',
  statut              text NOT NULL DEFAULT 'A valider (fort)',
  notes               text NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── UNIQUE (chirurgien + nom_fichier) ─────────────────────────
-- Un fichier = une fiche = un enregistrement. Pas de doublons.
ALTER TABLE public.thesaurus_fiches_papier
  ADD CONSTRAINT uq_fiches_papier_chir_fichier
  UNIQUE (chirurgien, nom_fichier);

-- ── INDEX ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fiches_papier_protocole
  ON public.thesaurus_fiches_papier (protocole_id)
  WHERE protocole_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fiches_papier_statut
  ON public.thesaurus_fiches_papier (statut);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.thesaurus_fiches_papier ENABLE ROW LEVEL SECURITY;

-- SELECT : authenticated (lecture pour tous les membres connectés)
CREATE POLICY fiches_papier_select_auth
  ON public.thesaurus_fiches_papier
  FOR SELECT TO authenticated
  USING (true);

-- SELECT : anon (lecture publique pour consultation sans compte)
CREATE POLICY fiches_papier_select_anon
  ON public.thesaurus_fiches_papier
  FOR SELECT TO anon
  USING (true);

-- INSERT / UPDATE / DELETE : admin uniquement
CREATE POLICY fiches_papier_admin_all
  ON public.thesaurus_fiches_papier
  FOR ALL TO authenticated
  USING (public.bdb_is_admin())
  WITH CHECK (public.bdb_is_admin());

-- ── COMMENT ───────────────────────────────────────────────────
COMMENT ON TABLE public.thesaurus_fiches_papier IS
  'Rapprochement fiches Word papier chirurgiens ↔ protocoles thésaurus. '
  'Source : scan D:\DEV\BIBLE_DE_BLOC\_ARCHIVE\DATA\01_SALE_PAR_CHIRURGIEN. '
  'Migration 070 — 2026-03-29.';
