import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Razorpay from 'https://esm.sh/razorpay@2.9.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateOrderRequest {
  plan_id: string
  amount: number
  currency?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    if (req.method === 'POST') {
      const { plan_id, amount, currency = 'INR' }: CreateOrderRequest = await req.json()

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
        key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
      })

      // Create Razorpay order
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `order_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_id,
        },
      }

      const razorpayOrder = await razorpay.orders.create(options)

      // Store payment record in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          razorpay_order_id: razorpayOrder.id,
          plan_id,
          amount: amount * 100, // Store in paise
          currency,
          status: 'created',
          metadata: { razorpay_order: razorpayOrder },
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Payment insert error:', paymentError)
        throw new Error('Failed to create payment record')
      }

      return new Response(
        JSON.stringify({
          success: true,
          order: razorpayOrder,
          payment_id: payment.id,
          key_id: Deno.env.get('RAZORPAY_KEY_ID')!, // Include the key for frontend
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Handle payment verification
    if (req.method === 'PUT') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

      // Verify payment signature
      const razorpay = new Razorpay({
        key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
        key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
      })

      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSignature = razorpay.utils.generateSignature(
        body,
        Deno.env.get('RAZORPAY_KEY_SECRET')!
      )

      if (expectedSignature !== razorpay_signature) {
        throw new Error('Invalid payment signature')
      }

      // Update payment record
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        throw new Error('Failed to update payment record')
      }

      // Create or update subscription
      if (payment.plan_id) {
        const { data: plan } = await supabase
          .from('plans')
          .select('duration_months')
          .eq('id', payment.plan_id)
          .single()

        if (plan) {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + plan.duration_months)

          await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_id: payment.plan_id,
            payment_id: payment.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            amount_paid: payment.amount / 100, // Convert back to rupees
            payment_date: payment.paid_at,
            status: 'active',
          })
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})