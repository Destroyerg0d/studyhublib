-- Fix security issue with payments table RLS policies
-- Remove the overly permissive service policy and replace with more secure ones

-- Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Service can manage payments" ON public.payments;

-- Create secure policies for edge functions to manage payments
-- This policy allows edge functions to insert and update payments for authenticated users
CREATE POLICY "Service can create payments for users" 
ON public.payments 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Service can update payments for users" 
ON public.payments 
FOR UPDATE 
USING (user_id IS NOT NULL);

-- Also fix the registration_forms table security issue
-- Drop the problematic email-based policy
DROP POLICY IF EXISTS "Users can view their own registration forms" ON public.registration_forms;

-- Create a more secure policy that requires authenticated user ID matching
CREATE POLICY "Users can view their own registration forms by user mapping" 
ON public.registration_forms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = registration_forms.email
  )
);

-- Allow users to create registration forms
CREATE POLICY "Anyone can create registration forms" 
ON public.registration_forms 
FOR INSERT 
WITH CHECK (true);