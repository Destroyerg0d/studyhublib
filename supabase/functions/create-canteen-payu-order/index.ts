import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
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
      // Create canteen order
      const requestData: CreateOrderRequest = await req.json()
      const { items, totalAmount, specialInstructions, coupon_code } = requestData

      console.log('Creating canteen PayU order for user:', user.id, 'amount:', totalAmount)

      // Validate coupon if provided
      let discountAmount = 0
      let finalAmount = totalAmount
      let couponId = null

      if (coupon_code) {
        const { data: couponData, error: couponError } = await supabase
          .rpc('validate_coupon', {
            _coupon_code: coupon_code,
            _user_id: user.id,
            _order_type: 'canteen',
            _amount: totalAmount
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

      // Generate unique transaction ID and order number
      const txnId = 'CANTEEN_TXN' + Date.now() + Math.random().toString(36).substr(2, 9)
      
      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number')

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to generate order number' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const orderNumber = orderNumberData

      // Get user profile for details
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user.id)
        .single()

      // Create canteen order record
      const { data: orderData, error: orderError } = await supabase
        .from('canteen_orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          items: items,
          total_amount: totalAmount,
          final_amount: finalAmount,
          coupon_id: couponId,
          discount_amount: discountAmount,
          special_instructions: specialInstructions,
          status: 'pending',
          payment_method: 'payu',
          payu_order_id: txnId
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating canteen order:', orderError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return PayU payment parameters
      return new Response(
        JSON.stringify({
          success: true,
          order: orderData,
          payu_params: {
            key: payuClientId,
            txnid: txnId,
            amount: finalAmount.toString(),
            productinfo: `Canteen Order ${orderNumber}`,
            firstname: profile?.name || 'Customer',
            email: profile?.email || user.email,
            phone: profile?.phone || '',
            udf1: user.id,
            udf2: orderData.id,
            udf3: 'canteen',
            surl: `${req.headers.get('origin')}/dashboard/canteen?status=success`,
            furl: `${req.headers.get('origin')}/dashboard/canteen?status=failure`
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (req.method === 'PUT') {
      // Verify PayU payment for canteen order
      const requestData: VerifyPaymentRequest = await req.json()
      const { payu_payment_id, payu_order_id, status } = requestData

      console.log('Verifying canteen PayU payment:', payu_payment_id, 'order:', payu_order_id, 'status:', status)

      // Update canteen order
      const { data: orderData, error: updateError } = await supabase
        .from('canteen_orders')
        .update({
          payu_payment_id: payu_payment_id,
          status: status === 'success' ? 'paid' : 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payu_order_id', payu_order_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating canteen order:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Payment verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (status === 'success' && orderData && orderData.coupon_id) {
        // Record coupon usage
        await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: orderData.coupon_id,
            user_id: user.id,
            order_type: 'canteen',
            used_at: new Date().toISOString()
          })

        await supabase
          .from('coupons')
          .update({ used_count: supabase.raw('used_count + 1') })
          .eq('id', orderData.coupon_id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          order: orderData
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
    console.error('Canteen PayU edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})