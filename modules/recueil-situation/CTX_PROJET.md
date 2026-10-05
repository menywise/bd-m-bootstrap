# CTX — Projet Recueil Anonyme Bloc Opératoire

## 1. Vue d'ensemble

Application web de recueil anonyme de situations de travail bloquantes au bloc opératoire. Questionnaire en 4 étapes avec export admin sécurisé. **Anonymat strict** : aucun timestamp, IP ou identifiant utilisateur n'est stocké.

- **Stack** : React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Lovable Cloud (Supabase) — Edge Functions Deno
- **Supabase Project ID** : `wpxguxyksdyeosddtvwr`
- **URL publiée** : https://stb3-manu.lovable.app

---

## 2. Routes & Pages

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | `Index.tsx` → `Survey.tsx` | Formulaire public (4 questions) |
| `/admin/export` | `AdminExport.tsx` | Export CSV/JSON protégé par mot de passe |
| `/admin/status` | `AdminStatus.tsx` | Tableau de bord admin (comptage réponses) |

---

## 3. Base de données

### Table `public.survey_responses`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid (PK, auto) | Identifiant technique |
| `fonction` | text | Rôle sélectionné (instrumentiste, panseur, etc.) |
| `situation_de_travail` | text | Description de la situation (min 10 chars) |
| `blocage_rencontre` | text | Blocage décrit (min 10 chars) |
| `ressenti` | text | Ressenti libre |

**Pas de colonnes** `created_at`, `user_id`, `ip` → anonymat garanti.

---

## 4. Edge Functions (Deno)

### `submit-response`
- **Rôle** : Insertion anonyme d'une réponse
- **Protections anti-bot** :
  - Honeypot (champ invisible piège)
  - Timing check (rejet si < 3 secondes)
  - Rate limiting par IP hashée (3/min, 10/h) — en mémoire, non persisté
  - Validation contenu : min 10 chars, anti-gibberish (5+ chars répétés), anti-copier-coller entre champs
- **Auth** : Aucune (public), utilise `SUPABASE_SERVICE_ROLE_KEY` pour insérer

### `export-responses`
- **Rôle** : Export CSV ou JSON des réponses
- **Auth** : Mot de passe admin `&Anonyme87!` (hardcodé dans la fonction)
- **Options** :
  - `format` : `csv` (défaut) ou `json`
  - `deleteAfterExport` : boolean — supprime les données après téléchargement
- **CSV** : séparateur `;`, colonnes `Fonction;Situation_de_travail;Blocage_rencontre;Ressenti`
- Utilise `SUPABASE_SERVICE_ROLE_KEY` pour bypass RLS

### `admin-stats`
- **Rôle** : Comptage des réponses en base
- **Auth** : Même mot de passe admin `&Anonyme87!`
- Retourne `{ count: number }`

---

## 5. Composants Survey

```
Survey.tsx (orchestrateur)
├── SurveyIntro.tsx      — Intro + garanties
├── QuestionRole.tsx     — Q1 : Fonction (6 choix + "Autre" libre)
├── QuestionSituation.tsx — Q2 : Situation de travail (textarea)
├── QuestionBlockage.tsx — Q3 : Blocage rencontré (textarea)
├── QuestionRessenti.tsx — Q4 : Ressenti (textarea) + bouton Soumettre
├── SurveyComplete.tsx   — Confirmation + option "nouvelle réponse"
└── SurveyProgress.tsx   — Barre de progression (étape X/4)
```

### Protections côté client (Survey.tsx)
- Cooldown 20s entre soumissions (`lastSubmissionRef`)
- Honeypot invisible (`<input name="website">`)
- Timer de début (`startTimeRef`) envoyé au serveur

---

## 6. Design System

- **Palette** : Healthcare calme — fond bleu-gris clair, primaire teal `199 89% 35%`
- **Fonts** : Inter (body) + Source Serif 4 (titres)
- **Tokens CSS** dans `index.css` : `--background`, `--primary`, `--card`, `--muted`, etc.
- **Variantes de boutons custom** : `survey`, `surveyOption`, `surveyOptionSelected`, taille `xl`
- **Animations** : `fade-in`, `slide-in` (Tailwind keyframes)
- **Classes custom** : `shadow-card`, `shadow-soft`, `bg-gradient-hero`, `bg-survey-trust`

---

## 7. Secrets configurés

| Secret | Statut | Usage |
|--------|--------|-------|
| `LOVABLE_API_KEY` | ✅ Configuré | Lovable AI |
| `RESEND_API_KEY` | ❌ **Non ajouté** | Envoi email (à configurer) |

---

## 8. Fonctionnalité en cours : Envoi d'email via Resend

### Objectif
Envoyer automatiquement les données exportées par email à une adresse configurée après chaque export admin.

### État
- Le secret `RESEND_API_KEY` n'a **PAS encore été ajouté** au projet
- La fonction `send-export-email` n'existe **PAS encore**
- L'interface `AdminExport.tsx` n'a **PAS encore** le champ email

### Plan d'implémentation
1. Ajouter le secret `RESEND_API_KEY` via l'outil `add_secret`
2. Créer l'edge function `send-export-email/index.ts` :
   - Reçoit `{ password, format, email, content, filename }`
   - Vérifie le mot de passe admin
   - Envoie l'email via API Resend (`https://api.resend.com/emails`)
   - Pièce jointe : fichier CSV/JSON en base64
   - Expéditeur : `onboarding@resend.dev` (domaine par défaut Resend)
3. Modifier `AdminExport.tsx` :
   - Ajouter un champ email (optionnel)
   - Après export réussi, si email renseigné → appeler `send-export-email`
   - Toast de confirmation d'envoi

---

## 9. Fichiers à ne PAS modifier

- `src/integrations/supabase/client.ts` (auto-généré)
- `src/integrations/supabase/types.ts` (auto-généré)
- `supabase/config.toml` (auto-géré)
- `.env` (auto-géré)
- `supabase/migrations/` (en lecture seule)

---

## 10. Dépendances principales

- `react`, `react-dom`, `react-router-dom`
- `@tanstack/react-query`
- `@supabase/supabase-js`
- `tailwindcss`, `@radix-ui/*`, `lucide-react`
- `framer-motion` (si installé)
- `sonner` (toasts)

---

## 11. Notes de sécurité

- **Mot de passe admin** hardcodé dans les edge functions : `&Anonyme87!` — stocké côté serveur uniquement
- **RLS** : La table `survey_responses` utilise le `SERVICE_ROLE_KEY` dans les edge functions pour bypass RLS
- **Pas d'authentification utilisateur** — le questionnaire est public et anonyme
- **Anti-bot** : combinaison honeypot + timing + rate limiting + validation contenu
