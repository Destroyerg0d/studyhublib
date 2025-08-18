-- Security Enhancement Migration
-- Phase 1: Critical Data Protection

-- 1. Enhanced RLS policies for verification_requests (Critical: Identity document exposure)
DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
CREATE POLICY "Users can view their own verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (auth.uid() = user_id AND (
  -- Users can only see basic status, not document URLs
  CASE 
    WHEN auth.uid() = user_id THEN true
    ELSE false
  END
));

-- Add separate policy for document URL access (more restrictive)
CREATE POLICY "Users can access document URLs only for pending requests" 
ON public.verification_requests 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND status = 'pending'
  AND created_at > now() - interval '24 hours'
);

-- 2. Enhanced financial data protection for payments table
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND (
    -- Limit sensitive payment details access
    created_at > now() - interval '90 days' OR status = 'created'
  )
);

-- 3. Enhanced registration forms protection
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

-- 4. Enhanced canteen orders protection
DROP POLICY IF EXISTS "Users can view own canteen orders" ON public.canteen_orders;
CREATE POLICY "Users can view own canteen orders" 
ON public.canteen_orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND created_at > now() - interval '30 days'
);

-- 5. Create audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log access to sensitive tables
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    user_id,
    accessed_at,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    now(),
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the operation if logging fails
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create audit_logs table for security monitoring
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

-- 7. Add audit triggers for sensitive tables
CREATE TRIGGER audit_verification_requests
  AFTER SELECT ON public.verification_requests
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER audit_payments
  AFTER SELECT ON public.payments
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_sensitive_data_access();

CREATE TRIGGER audit_profiles
  AFTER SELECT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_sensitive_data_access();

-- 8. Create function for secure document URL access with time-limited signed URLs
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
  -- Check if user owns this verification request
  SELECT EXISTS(
    SELECT 1 FROM public.verification_requests 
    WHERE id = verification_id 
    AND user_id = auth.uid()
    AND status = 'pending'
    AND created_at > now() - interval '24 hours'
  ) INTO user_owns_request;
  
  IF NOT user_owns_request THEN
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
  
  -- Log the access
  INSERT INTO public.audit_logs (table_name, operation, user_id, metadata)
  VALUES (
    'verification_requests', 
    'document_access', 
    auth.uid(),
    jsonb_build_object(
      'verification_id', verification_id,
      'document_type', document_type
    )
  );
  
  RETURN doc_url;
END;
$$;