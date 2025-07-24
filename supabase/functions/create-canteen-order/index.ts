import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Razorpay from "https://esm.sh/razorpay@2.9.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  special_instructions?: string;
  coupon_code?: string;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid or expired token");
    }

    const user = userData.user;

    if (req.method === "POST") {
      // Create order
      const { items, total_amount, special_instructions, coupon_code }: CreateOrderRequest = await req.json();

      if (!items || items.length === 0) {
        throw new Error("No items in order");
      }

      if (!total_amount || total_amount <= 0) {
        throw new Error("Invalid total amount");
      }

      let finalAmount = total_amount
      let discountAmount = 0
      let couponId = null
      let originalAmount = total_amount

      // Validate coupon if provided
      if (coupon_code) {
        const { data: couponValidation, error: couponError } = await supabaseService
          .rpc('validate_coupon', {
            _coupon_code: coupon_code,
            _user_id: user.id,
            _order_type: 'canteen',
            _amount: total_amount
          });

        if (couponError) {
          throw new Error('Coupon validation failed: ' + couponError.message);
        }

        if (!couponValidation || couponValidation.length === 0) {
          throw new Error('Invalid coupon validation response');
        }

        const validation = couponValidation[0];
        
        if (!validation.valid) {
          throw new Error(validation.error_message || 'Invalid coupon code');
        }

        finalAmount = validation.final_amount;
        discountAmount = validation.discount_amount;
        couponId = validation.coupon_id;
      }

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: Deno.env.get("RAZORPAY_KEY_ID"),
        key_secret: Deno.env.get("RAZORPAY_KEY_SECRET"),
      });

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100), // Convert to paise
        currency: "INR",
        receipt: `canteen_${Date.now()}`,
        payment_capture: true,
        notes: {
          user_id: user.id,
          coupon_code: coupon_code || '',
          discount_amount: discountAmount.toString(),
        },
      });

      console.log("Razorpay order created:", razorpayOrder);

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabaseService
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error("Error generating order number:", orderNumberError);
        throw new Error("Failed to generate order number");
      }

      // Create order in database
      const { data: orderData, error: orderError } = await supabaseService
        .from("canteen_orders")
        .insert({
          user_id: user.id,
          order_number: orderNumberData,
          items: items,
          total_amount: finalAmount,
          original_amount: originalAmount,
          discount_amount: discountAmount,
          coupon_id: couponId,
          razorpay_order_id: razorpayOrder.id,
          special_instructions: special_instructions,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw new Error("Failed to create order");
      }

      console.log("Order created in database:", orderData);

      return new Response(
        JSON.stringify({
          success: true,
          order: orderData,
          razorpay_order: razorpayOrder,
          key_id: Deno.env.get("RAZORPAY_KEY_ID"),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (req.method === "PUT") {
      // Verify payment
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }: VerifyPaymentRequest = await req.json();

      // Verify payment signature
      const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      if (!keySecret) {
        throw new Error("Razorpay key secret not configured");
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const key = new TextEncoder().encode(keySecret);
      const data = new TextEncoder().encode(body);
      
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
      }

      // Update order in database
      const { data: updatedOrder, error: updateError } = await supabaseService
        .from("canteen_orders")
        .update({
          payment_status: 'paid',
          status: 'paid',
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          paid_at: new Date().toISOString(),
        })
        .eq('id', order_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw new Error("Failed to update order");
      }

      // Record coupon usage if coupon was applied
      if (updatedOrder.coupon_id) {
        await supabaseService.from('coupon_usage').insert({
          coupon_id: updatedOrder.coupon_id,
          user_id: user.id,
          order_type: 'canteen',
          order_id: updatedOrder.id,
          discount_amount: updatedOrder.discount_amount,
          original_amount: updatedOrder.original_amount,
          final_amount: updatedOrder.total_amount,
        });

        // Update coupon usage count
        await supabaseService
          .from('coupons')
          .update({ used_count: supabaseService.raw('used_count + 1') })
          .eq('id', updatedOrder.coupon_id);
      }

      console.log("Payment verified and order updated:", updatedOrder);

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  } catch (error: any) {
    console.error("Error in canteen order function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});