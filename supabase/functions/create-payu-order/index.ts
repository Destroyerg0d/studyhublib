import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOrderRequest {
  plan_id: string;
  amount: number;
  currency?: string;
  coupon_code?: string;
}

interface VerifyPaymentRequest {
  payu_payment_id: string;
  payu_order_id: string;
  status: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      // Create PayU order
      const requestData: CreateOrderRequest = await req.json()
      const { plan_id, amount, currency = 'INR', coupon_code } = requestData

      console.log('Creating PayU order for user:', user.id, 'plan:', plan_id, 'amount:', amount)

      // Validate coupon if provided
      let discountAmount = 0
      let finalAmount = amount
      let couponId = null

      if (coupon_code) {
        const { data: couponData, error: couponError } = await supabase
          .rpc('validate_coupon', {
            _coupon_code: coupon_code,
            _user_id: user.id,
            _order_type: 'subscription',
            _amount: amount
          })

        if (couponError) {
          console.error('Coupon validation error:', couponError)
          return new Response(
            JSON.stringify({ success: false, error: 'Coupon validation failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (couponData && couponData.length > 0) {
          const coupon = couponData[0]
          if (!coupon.valid) {
            return new Response(
              JSON.stringify({ success: false, error: coupon.error_message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          discountAmount = coupon.discount_amount
          finalAmount = coupon.final_amount
          couponId = coupon.coupon_id
        }
      }

      // Get PayU credentials
      const payuClientId = Deno.env.get('PAYU_CLIENT_ID')
      const payuClientSecret = Deno.env.get('PAYU_CLIENT_SECRET')

      if (!payuClientId || !payuClientSecret) {
        console.error('PayU credentials not found')
        return new Response(
          JSON.stringify({ success: false, error: 'PayU credentials not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate unique transaction ID
      const txnId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9)

      // Get user profile for details
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user.id)
        .single()

      // Create payment record in database
      console.log('Creating payment record with:', {
        user_id: user.id,
        plan_id: plan_id,
        amount: Math.round(finalAmount),
        coupon_id: couponId,
        discount_amount: Math.round(discountAmount),
        payu_order_id: txnId
      })
      
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          plan_id: plan_id,
          amount: Math.round(finalAmount),
          coupon_id: couponId,
          discount_amount: Math.round(discountAmount),
          status: 'pending',
          payment_method: 'payu',
          payu_order_id: txnId,
          metadata: {
            user_id: user.id,
            plan_id: plan_id,
            coupon_code: coupon_code,
            original_amount: amount
          }
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating payment record:', paymentError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create payment record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate hash for PayU
      const hashString = [
        payuClientId,
        txnId,
        finalAmount.toString(),
        'StudyHub Plan Payment',
        profile?.name || 'Customer',
        profile?.email || user.email,
        user.id,
        plan_id,
        paymentData.id,
        '',
        '',
        payuClientSecret
      ].join('|')

      // Create SHA512 hash
      const encoder = new TextEncoder()
      const data = encoder.encode(hashString)
      const hashBuffer = await crypto.subtle.digest('SHA-512', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      console.log('Generated hash for PayU payment:', hash.substring(0, 20) + '...')

      // Return PayU payment parameters
      return new Response(
        JSON.stringify({
          success: true,
          payment_id: paymentData.id,
          payu_params: {
            key: payuClientId,
            txnid: txnId,
            amount: finalAmount.toString(),
            productinfo: 'StudyHub Plan Payment',
            firstname: profile?.name || 'Customer',
            email: profile?.email || user.email,
            phone: profile?.phone || '',
            udf1: user.id,
            udf2: plan_id,
            udf3: paymentData.id,
            surl: `${req.headers.get('origin')}/dashboard/fees?status=success`,
            furl: `${req.headers.get('origin')}/dashboard/fees?status=failure`,
            hash: hash
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (req.method === 'PUT') {
      // Verify PayU payment
      const requestData: VerifyPaymentRequest = await req.json()
      const { payu_payment_id, payu_order_id, status } = requestData

      console.log('Verifying PayU payment:', payu_payment_id, 'order:', payu_order_id, 'status:', status)

      // Update payment record
      const { data: paymentData, error: updateError } = await supabase
        .from('payments')
        .update({
          payu_payment_id: payu_payment_id,
          status: status === 'success' ? 'completed' : 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payu_order_id', payu_order_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating payment:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Payment verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (status === 'success' && paymentData) {
        // Record coupon usage if applicable
        if (paymentData.coupon_id) {
          await supabase
            .from('coupon_usage')
            .insert({
              coupon_id: paymentData.coupon_id,
              user_id: user.id,
              order_type: 'subscription',
              used_at: new Date().toISOString()
            })

          await supabase
            .from('coupons')
            .update({ used_count: supabase.raw('used_count + 1') })
            .eq('id', paymentData.coupon_id)
        }

        // Get plan details and update subscription
        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('id', paymentData.plan_id)
          .single()

        if (plan) {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + plan.duration_days)

          // Check if user has existing subscription
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

          if (existingSubscription) {
            // Extend existing subscription
            const currentEndDate = new Date(existingSubscription.end_date)
            const newEndDate = new Date(currentEndDate)
            newEndDate.setDate(newEndDate.getDate() + plan.duration_days)

            await supabase
              .from('subscriptions')
              .update({
                end_date: newEndDate.toISOString().split('T')[0],
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSubscription.id)
          } else {
            // Create new subscription
            await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan_id: plan.id,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: 'active'
              })
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment: paymentData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})