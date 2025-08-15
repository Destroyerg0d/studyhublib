-- Fix security issues with coupon_usage and canteen_orders tables
-- Remove overly permissive service policies and implement secure alternatives

-- Fix coupon_usage table
DROP POLICY IF EXISTS "Service can manage coupon usage" ON public.coupon_usage;

-- Create secure policies for coupon_usage
CREATE POLICY "Authenticated service can create coupon usage" 
ON public.coupon_usage 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated service can update coupon usage" 
ON public.coupon_usage 
FOR UPDATE 
USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Fix canteen_orders table  
DROP POLICY IF EXISTS "Service can manage canteen orders" ON public.canteen_orders;

-- Create secure policies for canteen_orders
CREATE POLICY "Authenticated service can create canteen orders" 
ON public.canteen_orders 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated service can update canteen orders" 
ON public.canteen_orders 
FOR UPDATE 
USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Fix registration_forms policy to be more secure
DROP POLICY IF EXISTS "Anyone can create registration forms" ON public.registration_forms;

-- Create a more secure registration policy
CREATE POLICY "Authenticated users can create registration forms" 
ON public.registration_forms 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  email IS NOT NULL AND 
  LENGTH(email) > 5
);