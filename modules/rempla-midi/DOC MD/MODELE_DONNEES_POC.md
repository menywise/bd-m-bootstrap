# Modèle de Données — POC Rotation Repas

---

## 1. VUE D'ENSEMBLE

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Agents     │────▶│ Compétences  │     │   Chirurgiens    │
│  (ref DB&M)  │     │  par poste   │     │   (ref DB&M)     │
└──────┬───────┘     └──────────────┘     └────────┬─────────┘
       │                                           │
       │         ┌─────────────────────┐           │
       └────────▶│ Préférences crise   │◀──────────┘
                 │ (agent × chirurgien)│
                 └─────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Effectif     │────▶│  Plan de     │────▶│   Historique     │
│  du jour     │     │  rotation    │     │   & Stats        │
└──────────────┘     └──────┬───────┘     └──────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Patterns   │
                     └──────────────┘
```

---

## 2. ENTITÉS

### 2.1 Salles

```
salles {
  id          TEXT PRIMARY KEY    -- '05', '06', '07', '08'
  nom         TEXT                -- 'Salle 05'
  secteur     TEXT DEFAULT 'ortho-neuro'
  active      BOOLEAN DEFAULT true
}
```

Seed POC : 4 lignes (05, 06, 07, 08).

### 2.2 Postes

```
postes {
  id          TEXT PRIMARY KEY    -- 'instru', 'circu'
  libelle     TEXT                -- 'Instrumentiste', 'Circulant(e)'
  critique    BOOLEAN DEFAULT true
}
```

Seed POC : 2 lignes.

### 2.3 Agents (extension DB&M)

Le profil agent DB&M reçoit un champ supplémentaire :

```
-- Ajout sur la table profiles existante DB&M
ALTER TABLE profiles ADD COLUMN role_bloc TEXT;
-- Valeurs : 'instru', 'panseur', 'polyvalent'
```

Pour le POC standalone (avant intégration DB&M) :

```
agents {
  id              UUID PRIMARY KEY
  nom             TEXT NOT NULL
  prenom          TEXT
  role_bloc       TEXT NOT NULL    -- 'instru' | 'panseur' | 'polyvalent'
  actif           BOOLEAN DEFAULT true
  preference_creneau TEXT          -- 'tot' | 'tard' | 'indifferent' | NULL
  created_at      TIMESTAMPTZ DEFAULT now()
}
```

### 2.4 Compétences agent

```
agent_competences {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  agent_id        UUID REFERENCES agents(id)
  poste_id        TEXT REFERENCES postes(id)    -- 'instru' | 'circu'
  niveau          TEXT NOT NULL                  -- 'quotidien' | 'crise' | 'interdit'
  UNIQUE(agent_id, poste_id)
}
```

### 2.5 Chirurgiens (ref DB&M)

Pour le POC standalone :

```
chirurgiens {
  id              UUID PRIMARY KEY
  nom             TEXT NOT NULL
  prenom          TEXT
  actif           BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ DEFAULT now()
}
```

### 2.6 Préférences crise (chirurgien × agent)

```
preferences_crise {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  chirurgien_id   UUID REFERENCES chirurgiens(id)
  agent_id        UUID REFERENCES agents(id)
  poste_id        TEXT REFERENCES postes(id)
  accepte         BOOLEAN NOT NULL
  commentaire     TEXT
  updated_at      TIMESTAMPTZ DEFAULT now()
  UNIQUE(chirurgien_id, agent_id, poste_id)
}
```

### 2.7 Paramètres

```
parametres {
  cle             TEXT PRIMARY KEY
  valeur          TEXT NOT NULL
  updated_at      TIMESTAMPTZ DEFAULT now()
}
```

Seed :
```
('duree_pause', '30')
('creneau_nominal_debut', '12:00')
('creneau_nominal_fin', '13:00')
('creneau_degrade_debut', '11:30')
('creneau_degrade_fin', '13:30')
```

---

## 3. DONNÉES QUOTIDIENNES

### 3.1 Effectif du jour

```
effectif_jour {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE NOT NULL
  agent_id        UUID REFERENCES agents(id)
  categorie       TEXT NOT NULL    -- 'matin' | 'journee' | '12h' | 'soir' | 'couloir'
  salle_id        TEXT REFERENCES salles(id)   -- NULL si couloir
  poste_id        TEXT REFERENCES postes(id)   -- NULL si couloir
  created_by      UUID
  created_at      TIMESTAMPTZ DEFAULT now()
  UNIQUE(date, agent_id)
}
```

### 3.2 Affectation chirurgien du jour

```
chirurgien_jour {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE NOT NULL
  salle_id        TEXT REFERENCES salles(id)
  chirurgien_id   UUID REFERENCES chirurgiens(id)
  created_at      TIMESTAMPTZ DEFAULT now()
  UNIQUE(date, salle_id)
}
```

### 3.3 État des salles du jour

```
salle_jour {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE NOT NULL
  salle_id        TEXT REFERENCES salles(id)
  occupee         BOOLEAN DEFAULT true
  pause_possible  BOOLEAN DEFAULT false
  updated_at      TIMESTAMPTZ DEFAULT now()
  UNIQUE(date, salle_id)
}
```

---

## 4. PLANS DE ROTATION

### 4.1 Plan

```
plans_rotation {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE NOT NULL
  mode            TEXT NOT NULL     -- 'auto' | 'manuel' | 'simulation'
  etat_resultant  TEXT NOT NULL     -- 'quotidien' | 'degrade_leger' | 'degrade_complet' | 'crise' | 'bloque'
  fenetre_debut   TIME NOT NULL
  fenetre_fin     TIME NOT NULL
  valide          BOOLEAN DEFAULT false
  created_by      UUID
  created_at      TIMESTAMPTZ DEFAULT now()
  validated_at    TIMESTAMPTZ
  notes           TEXT
}
```

### 4.2 Mouvements (détail du plan)

```
plan_mouvements {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  plan_id         UUID REFERENCES plans_rotation(id) ON DELETE CASCADE
  creneau_debut   TIME NOT NULL
  creneau_fin     TIME NOT NULL
  agent_pause_id  UUID REFERENCES agents(id)      -- qui part manger
  salle_id        TEXT REFERENCES salles(id)
  poste_id        TEXT REFERENCES postes(id)
  remplacant_id   UUID REFERENCES agents(id)      -- qui remplace
  niveau          TEXT NOT NULL                     -- 'quotidien' | 'crise'
  chirurgien_id   UUID REFERENCES chirurgiens(id)  -- si crise instru
  ordre           INT NOT NULL                      -- position dans la séquence
}
```

### 4.3 Alertes du plan

```
plan_alertes {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  plan_id         UUID REFERENCES plans_rotation(id) ON DELETE CASCADE
  severite        TEXT NOT NULL     -- 'info' | 'warning' | 'crise' | 'bloquant'
  type            TEXT NOT NULL     -- 'poste_vacant' | 'crise_utilisee' | 'pause_salle' | 'preference_non_satisfaite' | 'depassement_fenetre'
  message         TEXT NOT NULL
  salle_id        TEXT REFERENCES salles(id)
  agent_id        UUID REFERENCES agents(id)
  chirurgien_id   UUID REFERENCES chirurgiens(id)
}
```

---

## 5. PATTERNS

```
patterns {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  signature       JSONB NOT NULL
  -- signature = {
  --   nb_salles_occupees, nb_couloirs, nb_soir,
  --   nb_matin, nb_journee, nb_12h
  -- }
  plan_reference  JSONB NOT NULL   -- le plan complet sérialisé
  etat_resultant  TEXT NOT NULL
  nb_utilisations INT DEFAULT 1
  score_succes    FLOAT DEFAULT 1.0
  derniere_utilisation DATE
  cree_par        TEXT             -- 'auto' | 'cadre'
  actif           BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ DEFAULT now()
}
```

---

## 6. HISTORIQUE & STATS

### 6.1 Historique journalier (vue agrégée)

```
historique_jour {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE UNIQUE NOT NULL
  etat_final      TEXT NOT NULL
  nb_agents_nourris INT
  nb_affectations_crise INT DEFAULT 0
  nb_pauses_salle INT DEFAULT 0
  duree_pauses_salle_min INT DEFAULT 0
  nb_couloirs     INT
  nb_soir         INT
  pattern_id      UUID REFERENCES patterns(id)
  plan_id         UUID REFERENCES plans_rotation(id)
  notes           TEXT
  created_at      TIMESTAMPTZ DEFAULT now()
}
```

### 6.2 Détail pauses de salle (cas crise)

```
pauses_salle {
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  date            DATE NOT NULL
  salle_id        TEXT REFERENCES salles(id)
  debut           TIME
  fin             TIME
  duree_min       INT
  cause           TEXT             -- description libre du contexte
  plan_id         UUID REFERENCES plans_rotation(id)
  created_at      TIMESTAMPTZ DEFAULT now()
}
```

---

## 7. DROITS D'ACCÈS

| Rôle | Lecture | Saisie effectif | Valider plan | Config agents/chirurgiens | Config paramètres | Tout |
|---|---|---|---|---|---|---|
| **Créateur** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| **Membre** | ✅ | ✅ | — | — | — | — |
| **Invité** | ✅ (consultation) | — | — | — | — | — |

---

## 8. INDEX RECOMMANDÉS

```sql
CREATE INDEX idx_effectif_date ON effectif_jour(date);
CREATE INDEX idx_effectif_agent ON effectif_jour(agent_id);
CREATE INDEX idx_plans_date ON plans_rotation(date);
CREATE INDEX idx_mouvements_plan ON plan_mouvements(plan_id);
CREATE INDEX idx_alertes_plan ON plan_alertes(plan_id);
CREATE INDEX idx_historique_date ON historique_jour(date);
CREATE INDEX idx_patterns_signature ON patterns USING gin(signature);
CREATE INDEX idx_preferences_chirurgien ON preferences_crise(chirurgien_id);
CREATE INDEX idx_preferences_agent ON preferences_crise(agent_id);
```

---

## 9. NOTES D'INTÉGRATION DB&M

Quand le POC sera stabilisé :

- `agents` → remplacé par `profiles` DB&M + champ `role_bloc`
- `chirurgiens` → remplacé par la table chirurgiens DB&M existante
- Tables spécifiques (effectif_jour, plans_rotation, patterns, etc.) → restent propres à ce module
- RLS : alignée sur le modèle DB&M (app_instance, user_roles)
- Les préférences crise restent dans ce module (pas dans le profil chirurgien DB&M)
