import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Authenticate caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Authorization header required')
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) throw new Error('Invalid user token')

    // Ensure caller is admin
    const { data: isAdmin, error: roleErr } = await supabase.rpc('is_admin', { user_id: user.id })
    if (roleErr) throw new Error('Role check failed')
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    const body: DeleteUserRequest = await req.json()
    const targetUserId = body?.userId
    if (!targetUserId) throw new Error('userId is required')

    // Check active subscription for warning/response
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('status', 'active')
      .limit(1)

    const hadActiveSubscription = !!(activeSubs && activeSubs.length > 0)

    // Delete dependent data first (order matters for FKs)
    const deleteSteps = [
      () => supabase.from('seat_bookings').delete().eq('user_id', targetUserId),
      () => supabase.from('canteen_orders').delete().eq('user_id', targetUserId),
      () => supabase.from('payment_verifications').delete().eq('user_id', targetUserId),
      () => supabase.from('verification_requests').delete().eq('user_id', targetUserId),
      () => supabase.from('payments').delete().eq('user_id', targetUserId),
      () => supabase.from('subscriptions').delete().eq('user_id', targetUserId),
      () => supabase.from('coupon_usage').delete().eq('user_id', targetUserId),
      () => supabase.from('user_roles').delete().eq('user_id', targetUserId),
      () => supabase.from('profiles').delete().eq('id', targetUserId),
    ]

    for (const step of deleteSteps) {
      const { error } = await step()
      if (error) {
        console.error('Deletion step failed:', error)
        throw new Error(error.message)
      }
    }

    // Finally, delete the auth user
    const { error: delAuthErr } = await supabase.auth.admin.deleteUser(targetUserId)
    if (delAuthErr) {
      console.error('Auth user deletion failed:', delAuthErr)
      throw new Error('Failed to delete auth user')
    }

    return new Response(
      JSON.stringify({ success: true, hadActiveSubscription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
