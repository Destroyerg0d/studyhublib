-- Fix search_path for log_verification_submission function
CREATE OR REPLACE FUNCTION public.log_verification_submission()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RAISE NOTICE 'New verification request created: user_id=%, status=%', NEW.user_id, NEW.status;
  RETURN NEW;
END;
$$;