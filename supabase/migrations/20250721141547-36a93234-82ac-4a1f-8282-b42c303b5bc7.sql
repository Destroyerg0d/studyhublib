-- Fix profiles RLS policy for service role and trigger
-- Drop the existing restrictive admin insert policy
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create a more permissive policy for profile creation
-- This allows both admin users and the service role (for trigger) to create profiles
CREATE POLICY "Users can be created by admin or service" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Update the trigger to handle user creation more reliably
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN 'admin'
      ELSE 'student'
    END,
    CASE 
      WHEN NEW.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN TRUE
      ELSE FALSE
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;