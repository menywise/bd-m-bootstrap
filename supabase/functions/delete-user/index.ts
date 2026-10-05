import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier que l'appelant est admin BDB
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Client avec le token de l'appelant (pour vérifier son rôle)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Client admin avec service_role (pour les opérations privilégiées)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Vérifier que l'appelant est admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: roleData } = await supabaseUser
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès refusé — admin requis' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Lire le body
    const { target_user_id, action, new_role } = await req.json()

    if (!target_user_id || !action) {
      return new Response(JSON.stringify({ error: 'target_user_id et action requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const validActions = ['suspend', 'reactivate', 'change-role', 'delete', 'delete-rgpd']
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ error: `Action invalide. Valeurs : ${validActions.join(', ')}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── SUSPEND : bloquer la connexion sans toucher aux données ──
    if (action === 'suspend') {
      await supabaseAdmin.auth.admin.updateUserById(target_user_id, { ban_duration: '87600h' })
      await supabaseAdmin.from('profiles_directory').update({ is_suspended: true }).eq('user_id', target_user_id).select()
      return new Response(JSON.stringify({ success: true, action, target_user_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── REACTIVATE : lever la suspension ──
    if (action === 'reactivate') {
      await supabaseAdmin.auth.admin.updateUserById(target_user_id, { ban_duration: 'none' })
      await supabaseAdmin.from('profiles_directory').update({ is_suspended: false }).eq('user_id', target_user_id).select()
      return new Response(JSON.stringify({ success: true, action, target_user_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── CHANGE-ROLE : modifier le rôle applicatif ──
    if (action === 'change-role') {
      const validRoles = ['admin', 'membre', 'invite']
      if (!new_role || !validRoles.includes(new_role)) {
        return new Response(JSON.stringify({ error: `new_role requis. Valeurs : ${validRoles.join(', ')}` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      await supabaseAdmin.from('user_roles').update({ role: new_role }).eq('user_id', target_user_id)
      return new Response(JSON.stringify({ success: true, action, target_user_id, new_role }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── DELETE STANDARD : données perso supprimées, contributions anonymisées ──
    if (action === 'delete') {
      // NULLIFY contributions métier
      const nullifyTables = [
        { table: 'cours', col: 'user_id' },
        { table: 'fiches_intervention', col: 'user_id' },
        { table: 'anatomie', col: 'user_id' },
        { table: 'materiel', col: 'user_id' },
        { table: 'installation_patient', col: 'user_id' },
        { table: 'glossaire', col: 'created_by' },
        { table: 'glossaire_candidats', col: 'created_by' },
        { table: 'collab_ideas', col: 'created_by' },
        { table: 'collab_projects', col: 'created_by' },
        { table: 'tags', col: 'created_by' },
        { table: 'signalements', col: 'reporter_id' },
        { table: 'planning_semaines', col: 'created_by' },
        { table: 'paxis_campaigns', col: 'created_by' },
        { table: 'paxis_sessions', col: 'created_by' },
        { table: 'site_faq', col: 'created_by' },
        { table: 'organisateur_etapes', col: 'created_by' },
        { table: 'organisateur_parcours', col: 'created_by' },
      ]
      for (const { table, col } of nullifyTables) {
        await supabaseAdmin.from(table).update({ [col]: null }).eq(col, target_user_id).select()
      }

      // DELETE données personnelles
      const deleteTables = [
        { table: 'transmissions', col: 'user_id' },
        { table: 'disc_profils', col: 'user_id' },
        { table: 'disc_tests', col: 'user_id' },
        { table: 'disc_conclusions', col: 'user_id' },
        { table: 'dork_profiles', col: 'user_id' },
        { table: 'dork_history', col: 'user_id' },
        { table: 'gants', col: 'user_id' },
        { table: 'casaques', col: 'user_id' },
        { table: 'collab_votes', col: 'user_id' },
        { table: 'carnet_progressions', col: 'user_id' },
        { table: 'livret_progression', col: 'user_id' },
        { table: 'organisateur_masques_user', col: 'user_id' },
        { table: 'organisateur_commentaires', col: 'user_id' },
        { table: 'error_404_logs', col: 'user_id' },
        { table: 'user_roles', col: 'user_id' },
        { table: 'profiles_directory', col: 'user_id' },
        { table: 'profiles', col: 'user_id' },
      ]
      for (const { table, col } of deleteTables) {
        await supabaseAdmin.from(table).delete().eq(col, target_user_id).select()
      }

      // Supprimer auth.users en dernier
      await supabaseAdmin.auth.admin.deleteUser(target_user_id)

      return new Response(JSON.stringify({ success: true, action, target_user_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── DELETE RGPD : tout supprimer y compris contributions ──
    if (action === 'delete-rgpd') {
      const allUserTables = [
        { table: 'transmissions', col: 'user_id' },
        { table: 'cours', col: 'user_id' },
        { table: 'fiches_intervention', col: 'user_id' },
        { table: 'anatomie', col: 'user_id' },
        { table: 'materiel', col: 'user_id' },
        { table: 'installation_patient', col: 'user_id' },
        { table: 'disc_profils', col: 'user_id' },
        { table: 'disc_tests', col: 'user_id' },
        { table: 'disc_conclusions', col: 'user_id' },
        { table: 'dork_profiles', col: 'user_id' },
        { table: 'dork_history', col: 'user_id' },
        { table: 'gants', col: 'user_id' },
        { table: 'casaques', col: 'user_id' },
        { table: 'collab_votes', col: 'user_id' },
        { table: 'carnet_progressions', col: 'user_id' },
        { table: 'livret_progression', col: 'user_id' },
        { table: 'organisateur_masques_user', col: 'user_id' },
        { table: 'organisateur_commentaires', col: 'user_id' },
        { table: 'error_404_logs', col: 'user_id' },
        { table: 'collab_ideas', col: 'created_by' },
        { table: 'collab_projects', col: 'created_by' },
        { table: 'glossaire', col: 'created_by' },
        { table: 'glossaire_candidats', col: 'created_by' },
        { table: 'tags', col: 'created_by' },
        { table: 'signalements', col: 'reporter_id' },
        { table: 'planning_semaines', col: 'created_by' },
        { table: 'paxis_campaigns', col: 'created_by' },
        { table: 'paxis_sessions', col: 'created_by' },
        { table: 'site_faq', col: 'created_by' },
        { table: 'organisateur_etapes', col: 'created_by' },
        { table: 'organisateur_parcours', col: 'created_by' },
        { table: 'user_roles', col: 'user_id' },
        { table: 'profiles_directory', col: 'user_id' },
        { table: 'profiles', col: 'user_id' },
      ]
      for (const { table, col } of allUserTables) {
        await supabaseAdmin.from(table).delete().eq(col, target_user_id).select()
      }
      await supabaseAdmin.auth.admin.deleteUser(target_user_id)

      return new Response(JSON.stringify({ success: true, action, target_user_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
