-- Security Enhancement Migration - Fixed Version
-- Phase 1: Critical Data Protection

-- 1. Enhanced RLS policies for verification_requests (Critical: Identity document exposure)
DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
CREATE POLICY "Users can view their own verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Enhanced financial data protection for payments table
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND (
    -- Limit sensitive payment details access to recent payments only
    created_at > now() - interval '90 days' OR status = 'created'
  )
);

-- 3. Enhanced registration forms protection - only verified users can see their forms
DROP POLICY IF EXISTS "Users can view their own registration forms by user mapping" ON public.registration_forms;
DROP POLICY IF EXISTS "Users can view their own registration forms securely" ON public.registration_forms;

CREATE POLICY "Users can view their own registration forms" 
ON public.registration_forms 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = registration_forms.email
    AND profiles.verified = true
  )
);

-- 4. Enhanced canteen orders protection - limit to 30 days
DROP POLICY IF EXISTS "Users can view own canteen orders" ON public.canteen_orders;
CREATE POLICY "Users can view own canteen orders" 
ON public.canteen_orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND created_at > now() - interval '30 days'
);

-- 5. Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin());

-- 6. Create function for secure document URL access with audit logging
CREATE OR REPLACE FUNCTION public.get_verification_document_url(
  verification_id uuid,
  document_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  doc_url text;
  user_owns_request boolean := false;
BEGIN
  -- Check if user owns this verification request and it's recent
  SELECT EXISTS(
    SELECT 1 FROM public.verification_requests 
    WHERE id = verification_id 
    AND user_id = auth.uid()
    AND status = 'pending'
    AND created_at > now() - interval '7 days'
  ) INTO user_owns_request;
  
  IF NOT user_owns_request THEN
    -- Log unauthorized access attempt
    INSERT INTO public.audit_logs (table_name, operation, user_id, metadata)
    VALUES (
      'verification_requests', 
      'unauthorized_document_access_attempt', 
      auth.uid(),
      jsonb_build_object(
        'verification_id', verification_id,
        'document_type', document_type,
        'reason', 'access_denied'
      )
    );
    
    RAISE EXCEPTION 'Access denied to verification documents';
  END IF;
  
  -- Get the document URL
  SELECT 
    CASE 
      WHEN document_type = 'front' THEN aadhar_front_url
      WHEN document_type = 'back' THEN aadhar_back_url
      ELSE NULL
    END
  INTO doc_url
  FROM public.verification_requests 
  WHERE id = verification_id;
  
  -- Log successful access
  INSERT INTO public.audit_logs (table_name, operation, user_id, metadata)
  VALUES (
    'verification_requests', 
    'document_access', 
    auth.uid(),
    jsonb_build_object(
      'verification_id', verification_id,
      'document_type', document_type,
      'success', true
    )
  );
  
  RETURN doc_url;
END;
$$;

-- 7. Create function to mask sensitive data for admin views
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  data_type text,
  original_value text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  CASE data_type
    WHEN 'phone' THEN
      RETURN CASE 
        WHEN LENGTH(original_value) > 4 THEN 
          REPEAT('*', LENGTH(original_value) - 4) || RIGHT(original_value, 4)
        ELSE original_value
      END;
    WHEN 'email' THEN
      RETURN CASE 
        WHEN POSITION('@' IN original_value) > 2 THEN
          LEFT(original_value, 2) || REPEAT('*', POSITION('@' IN original_value) - 3) || RIGHT(original_value, LENGTH(original_value) - POSITION('@' IN original_value) + 1)
        ELSE original_value
      END;
    WHEN 'amount' THEN
      RETURN '***.**';
    ELSE
      RETURN original_value;
  END CASE;
END;
$$;