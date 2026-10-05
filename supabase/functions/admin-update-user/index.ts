// =============================================================
// Edge Function : admin-update-user
// Rôle : Toutes les opérations auth nécessitant service_role
// Auth : JWT de l'appelant vérifié + rôle admin requis
//
// Actions disponibles :
//   { action: 'create-user',    email, password, prenom, nom, fonction, role }
//   { action: 'update-email',   target_user_id, email }
//   { action: 'send-recovery',  target_user_id, email, redirect_to? }
//
// Déploiement : supabase functions deploy admin-update-user
// =============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Non autorisé — JWT manquant' }, 401)
    }

    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!
    const supabaseSvc  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Extraire l'UID depuis les claims JWT sans appel réseau
    // JWT Supabase = header.payload.signature — payload encodé en base64
    const token = authHeader.replace('Bearer ', '')
    let callerId: string | null = null
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      callerId = payload.sub || null
    } catch {
      return json({ error: 'Token invalide' }, 401)
    }
    if (!callerId) return json({ error: 'UID introuvable dans le token' }, 401)

    const adminClient = createClient(supabaseUrl, supabaseSvc, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .maybeSingle()
    if (roleRow?.role !== 'admin') {
      return json({ error: 'Accès refusé — rôle admin requis' }, 403)
    }

    let body: {
      action?: string
      target_user_id?: string
      email?: string
      password?: string
      prenom?: string
      nom?: string
      fonction?: string
      role?: string
      redirect_to?: string
    }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Corps de requête JSON invalide' }, 400)
    }

    const { action = 'update-email' } = body

    // ── ACTION : create-user ────────────────────────────────────────
    if (action === 'create-user') {
      const { email, password, prenom, nom, fonction, role } = body
      if (!email || !password || !prenom || !nom) {
        return json({ error: 'email, password, prenom, nom sont requis' }, 400)
      }
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { prenom, nom, full_name: `${prenom} ${nom}` },
      })
      if (createErr) return json({ error: createErr.message }, 400)
      const userId = created.user.id

      const { error: profErr } = await adminClient
        .from('profiles_directory')
        .upsert({ user_id: userId, email, prenom, nom, fonction: fonction || 'infirmier', approved: true }, { onConflict: 'user_id' })
      if (profErr) return json({ error: 'Compte créé mais profil échoué : ' + profErr.message }, 500)

      const { error: roleErr } = await adminClient
        .from('user_roles')
        .upsert({ user_id: userId, role: role || 'membre' }, { onConflict: 'user_id' })
      if (roleErr) return json({ error: 'Compte créé mais rôle échoué : ' + roleErr.message }, 500)

      return json({ success: true, user_id: userId })
    }

    // Actions suivantes nécessitent target_user_id
    const { target_user_id, email, redirect_to } = body
    if (!target_user_id) return json({ error: 'target_user_id est requis' }, 400)
    if (target_user_id === callerId) {
      return json({ error: 'Utilisez votre profil pour modifier votre propre compte' }, 400)
    }

    // ── ACTION : update-email ───────────────────────────────────────
    if (action === 'update-email') {
      if (!email) return json({ error: 'email est requis' }, 400)
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(target_user_id, { email })
      if (updateErr) return json({ error: updateErr.message }, 400)
      return json({ success: true })
    }

    // ── ACTION : send-recovery ──────────────────────────────────────
    if (action === 'send-recovery') {
      if (!email) return json({ error: 'email est requis' }, 400)
      const redirectTo = redirect_to || `${supabaseUrl}/bdb/reset-password.html`
      const { error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      })
      if (linkErr) return json({ error: linkErr.message }, 400)
      return json({ success: true })
    }

    // ── ACTION : create-and-invite ──────────────────────────────────
    // Cree le compte auth si inexistant, puis envoie le lien de premiere connexion
    if (action === 'create-and-invite') {
      if (!email) return json({ error: 'email est requis' }, 400)
      const { prenom, nom, fonction } = body
      const redirectTo = redirect_to || `${supabaseUrl}/bdb/reset-password.html`

      // Verifier si le compte auth existe deja
      const { data: existing, error: fetchErr } = await adminClient.auth.admin.getUserById(target_user_id)

      if (fetchErr || !existing?.user) {
        // Compte inexistant — le creer
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
        const password = Array.from(crypto.getRandomValues(new Uint8Array(20)))
          .map((b: number) => chars[b % chars.length]).join('')

        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            prenom: prenom || '',
            nom: nom || '',
            full_name: `${prenom || ''} ${nom || ''}`.trim(),
          },
        })
        if (createErr) return json({ error: createErr.message }, 400)

        const newUserId = created.user.id

        // Rattacher le profil au nouveau user_id
        await adminClient
          .from('profiles_directory')
          .upsert({
            user_id:  newUserId,
            email,
            prenom:   prenom || '',
            nom:      nom || '',
            fonction: fonction || 'infirmier',
            approved: true,
          }, { onConflict: 'user_id' })

        // Supprimer l'ancien profil orphelin si user_id different
        if (target_user_id !== newUserId) {
          await adminClient
            .from('profiles_directory')
            .delete()
            .eq('user_id', target_user_id)
        }
      }

      // Envoyer le lien (compte existant ou nouvellement cree)
      const { error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      })
      if (linkErr) return json({ error: linkErr.message }, 400)
      return json({ success: true })
    }

    return json({ error: `Action inconnue : ${action}` }, 400)

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur interne'
    return json({ error: msg }, 500)
  }
})
