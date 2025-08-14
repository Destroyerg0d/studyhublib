-- Fix security issue with payments table RLS policies
-- Remove the overly permissive service policy and replace with more secure ones

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Service can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Service can create payments for users" ON public.payments;
DROP POLICY IF EXISTS "Service can update payments for users" ON public.payments;

-- Create secure policies for edge functions to manage payments
-- This policy allows edge functions to insert payments for authenticated users only
CREATE POLICY "Authenticated service can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- This policy allows edge functions to update payments for the correct user only
CREATE POLICY "Authenticated service can update payments" 
ON public.payments 
FOR UPDATE 
USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Also fix the registration_forms table security issue
-- Drop the problematic email-based policy
DROP POLICY IF EXISTS "Users can view their own registration forms" ON public.registration_forms;

-- Create a more secure policy that requires authenticated user ID matching
CREATE POLICY "Users can view their own registration forms securely" 
ON public.registration_forms 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = registration_forms.email
  )
);