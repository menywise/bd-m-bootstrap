-- ============================================================
-- S125 - Seed parametrage_modules section "permissions"
-- Date : 2026-05-07
-- Session : 119
-- Objet : 12 modules contributifs x 3 cles (peut_proposer / peut_publier
--         / peut_valider) = 36 entrees seed. Format JSONB {"role_min":...}.
--         Configurable ensuite par admin via modules/admin/.
-- Source : Decision Manu 2026-05-07 (matrice 10 modules + organisateur=membre
--          + thesaurus=admin + tout dans la meme session).
-- Hierarchie roles : invite < membre < redacteur < admin (+ is_creator flag).
-- ============================================================
-- ROLLBACK :
--   DELETE FROM parametrage_modules WHERE section='permissions';
--   DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-S119-01';
-- ============================================================

INSERT INTO parametrage_modules (module, section, cle, valeur, libelle, description, ordre) VALUES
-- glossaire
('glossaire','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer un terme','Role minimal pour soumettre un brouillon de terme glossaire.',10),
('glossaire','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un terme','Role minimal pour publier un terme directement (sans passage par draft).',20),
('glossaire','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon de terme en attente.',30),
-- faq
('faq','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer une Q/R','Role minimal pour soumettre un brouillon de question-reponse FAQ.',10),
('faq','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier une Q/R','Role minimal pour publier directement.',20),
('faq','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon Q/R.',30),
-- fiches
('fiches','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer une fiche','Role minimal pour soumettre un brouillon de fiche intervention.',10),
('fiches','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier une fiche','Role minimal pour publier directement.',20),
('fiches','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon de fiche.',30),
-- cours
('cours','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer un cours','Role minimal pour soumettre un brouillon de cours.',10),
('cours','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un cours','Role minimal pour publier directement.',20),
('cours','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon de cours.',30),
-- anatomie
('anatomie','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer un contenu','Role minimal pour soumettre un brouillon anatomie.',10),
('anatomie','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un contenu','Role minimal pour publier directement.',20),
('anatomie','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon anatomie.',30),
-- installation
('installation','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer une installation','Role minimal pour soumettre un brouillon de fiche installation.',10),
('installation','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier une installation','Role minimal pour publier directement.',20),
('installation','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon installation.',30),
-- arsenal
('arsenal','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer un materiel','Role minimal pour soumettre un brouillon arsenal.',10),
('arsenal','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un materiel','Role minimal pour publier directement.',20),
('arsenal','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon arsenal.',30),
-- veille-documentaire
('veille-documentaire','permissions','peut_proposer','{"role_min":"redacteur"}'::jsonb,'Proposer une source','Role minimal pour soumettre un brouillon de source documentaire.',10),
('veille-documentaire','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier une source','Role minimal pour publier directement.',20),
('veille-documentaire','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon source.',30),
-- organisateur
('organisateur','permissions','peut_proposer','{"role_min":"membre"}'::jsonb,'Proposer un parcours','Role minimal pour soumettre un brouillon de parcours organisateur.',10),
('organisateur','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un parcours','Role minimal pour publier un parcours direct.',20),
('organisateur','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon parcours.',30),
-- transmissions (chaque membre publie directement, pas de draft)
('transmissions','permissions','peut_proposer','{"role_min":"membre"}'::jsonb,'Proposer une transmission','Role minimal pour creer une transmission.',10),
('transmissions','permissions','peut_publier','{"role_min":"membre"}'::jsonb,'Publier une transmission','Role minimal pour publier directement (chaque membre transmet).',20),
('transmissions','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Moderer / archiver','Role minimal pour moderer ou archiver une transmission.',30),
-- boite-a-idees (chaque membre publie directement)
('boite-a-idees','permissions','peut_proposer','{"role_min":"membre"}'::jsonb,'Proposer une idee','Role minimal pour creer une idee.',10),
('boite-a-idees','permissions','peut_publier','{"role_min":"membre"}'::jsonb,'Publier une idee','Role minimal pour publier directement.',20),
('boite-a-idees','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Moderer','Role minimal pour moderer une idee.',30),
-- thesaurus (sensible : admin uniquement)
('thesaurus','permissions','peut_proposer','{"role_min":"admin"}'::jsonb,'Proposer un protocole','Role minimal pour soumettre un brouillon de protocole thesaurus.',10),
('thesaurus','permissions','peut_publier','{"role_min":"admin"}'::jsonb,'Publier un protocole','Role minimal pour publier un protocole.',20),
('thesaurus','permissions','peut_valider','{"role_min":"admin"}'::jsonb,'Valider un brouillon','Role minimal pour valider un brouillon protocole.',30)
ON CONFLICT (module, section, cle) DO UPDATE
  SET valeur = EXCLUDED.valeur,
      libelle = EXCLUDED.libelle,
      description = EXCLUDED.description,
      ordre = EXCLUDED.ordre,
      updated_at = now();

DELETE FROM atelier_decisions WHERE ref='D-2026-05-07-S119-01';

INSERT INTO atelier_decisions (
  ref, date, titre, description, type, session_num, tags, statut
) VALUES (
  'D-2026-05-07-S119-01',
  '2026-05-07',
  'Seed parametrage_modules permissions - 12 modules x 3 cles',
  'Migration S125 : INSERT 36 entrees parametrage_modules section=permissions, cles peut_proposer / peut_publier / peut_valider, valeur JSONB {"role_min":<role>}. 12 modules : glossaire faq fiches cours anatomie installation arsenal veille-documentaire (peut_proposer=redacteur, publier+valider=admin) ; organisateur (proposer=membre, autres=admin) ; transmissions + boite-a-idees (proposer+publier=membre, valider=admin pour moderation) ; thesaurus (tout=admin, sensible). Hierarchie : invite < membre < redacteur < admin (+ is_creator flag). Configurable ensuite par admin via modules/admin/. ON CONFLICT DO UPDATE pour idempotence.',
  'decision',
  119,
  ARRAY['parametrage','permissions','redacteur','workflow','seed','jsonb'],
  'active'
);
