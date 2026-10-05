-- ============================================================
-- 008_app_navigation.sql
-- Tables navigation dynamique : app_groups · app_modules + seed
-- Réf   : DATA_MODEL §14 · D-2026-03-16-T03
-- Statut: ✅ exécuté sur cloud
-- ============================================================

-- app_groups
CREATE TABLE IF NOT EXISTS public.app_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  description text,
  icon        text,
  color       text NOT NULL DEFAULT '#6c757d',
  position    integer NOT NULL,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.app_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_groups_anon_select ON public.app_groups
  FOR SELECT TO anon USING (true);

CREATE POLICY app_groups_member_select ON public.app_groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY app_groups_admin_all ON public.app_groups
  FOR ALL TO authenticated USING (is_admin())
  WITH CHECK (is_admin());

-- app_modules
CREATE TABLE IF NOT EXISTS public.app_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  label       text NOT NULL,
  description text,
  icon        text,
  color       text NOT NULL DEFAULT '#6c757d',
  group_key   text REFERENCES public.app_groups(key),
  path        text NOT NULL,
  position    integer NOT NULL,
  status      text NOT NULL DEFAULT 'coming_soon',
  is_new      boolean NOT NULL DEFAULT false,
  new_until   date,
  visibility  text NOT NULL DEFAULT 'member',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;

-- ─── SEED app_groups ───

INSERT INTO public.app_groups (key, label, icon, color, position) VALUES
  ('bloc',        'Bloc Opératoire', 'bi-hospital',       '#0d6efd', 1),
  ('equipe',      'Équipe',          'bi-people',         '#198754', 2),
  ('savoir',      'Savoir',          'bi-book',           '#6610f2', 3),
  ('pilotage',    'Pilotage',        'bi-graph-up',       '#dc3545', 4),
  ('espace_perso','Espace Personnel', 'bi-person-circle', '#fd7e14', 5)
ON CONFLICT (key) DO NOTHING;

-- ─── SEED app_modules (21 modules) ───

INSERT INTO public.app_modules (key, label, icon, group_key, path, position, status, visibility) VALUES
  ('planning',       'Planning',              'bi-calendar3',       'bloc',        'modules/planning/',       1, 'active', 'member'),
  ('fiches',         'Fiches',                'bi-file-earmark-medical', 'bloc',   'modules/fiches/',         2, 'active', 'member'),
  ('arsenal',        'Arsenal',               'bi-box-seam',        'bloc',        'modules/arsenal/',        3, 'active', 'member'),
  ('transmissions',  'Transmissions',         'bi-chat-left-text',  'bloc',        'modules/transmissions/',  4, 'active', 'member'),
  ('installation',   'Installation Patient',  'bi-person-vcard',    'bloc',        'modules/installation/',   5, 'active', 'member'),
  ('annuaire',       'Annuaire',              'bi-person-lines-fill','equipe',     'modules/annuaire/',       1, 'active', 'member'),
  ('preferences',    'Préférences Chirurgien','bi-gear',            'equipe',      'modules/preferences/',    2, 'active', 'member'),
  ('administration', 'Administration',        'bi-shield-lock',     'equipe',      'modules/admin/',          3, 'active', 'admin'),
  ('profile',        'Mon Profil',            'bi-person',          'equipe',      'modules/profile/',        4, 'active', 'member'),
  ('cours',          'Cours',                 'bi-mortarboard',     'savoir',      'modules/cours/',          1, 'active', 'member'),
  ('anatomie',       'Anatomie',              'bi-body-text',       'savoir',      'modules/anatomie/',       2, 'active', 'member'),
  ('thesaurus',      'Thésaurus',             'bi-journal-text',    'savoir',      'modules/thesaurus/',      3, 'active', 'member'),
  ('disc',           'DISC',                  'bi-pie-chart',       'pilotage',    'modules/disc/',           1, 'active', 'member'),
  ('collab',         'CollabKit',             'bi-kanban',          'pilotage',    'modules/collab/',         2, 'active', 'member'),
  ('organisateur',   'Organisateur',          'bi-list-check',      'pilotage',    'modules/organisateur/',   3, 'active', 'member'),
  ('paxis',          'PAXIS',                 'bi-clipboard2-check','espace_perso','modules/paxis/',          1, 'active', 'member'),
  ('dork',           'DORK',                  'bi-search',          'espace_perso','modules/dork/',           2, 'active', 'admin'),
  ('carnet_bord',    'Carnet de Bord',        'bi-journal-bookmark','espace_perso','modules/carnet-bord/',    3, 'coming_soon', 'member'),
  ('ged',            'GED',                   'bi-folder2-open',    'savoir',      'modules/ged/',            4, 'coming_soon', 'member'),
  ('accueil',        'Accueil',               'bi-house-heart',     'espace_perso','modules/accueil/',        4, 'coming_soon', 'member'),
  ('supervision',    'Supervision',           'bi-binoculars',      'pilotage',    'modules/supervision/',   99, 'coming_soon', 'admin')
ON CONFLICT (key) DO NOTHING;
