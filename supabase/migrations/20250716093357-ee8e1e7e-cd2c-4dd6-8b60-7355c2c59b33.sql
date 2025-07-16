
-- Drop all RLS policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create their own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can update their own pending verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;

DROP POLICY IF EXISTS "Users can view their own registration forms" ON public.registration_forms;
DROP POLICY IF EXISTS "Admins can manage all registration forms" ON public.registration_forms;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

DROP POLICY IF EXISTS "Anyone can view seats" ON public.seats;
DROP POLICY IF EXISTS "Admins can manage seats" ON public.seats;

DROP POLICY IF EXISTS "Anyone can view timetable slots" ON public.timetable_slots;
DROP POLICY IF EXISTS "Admins can manage timetable slots" ON public.timetable_slots;

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;

DROP POLICY IF EXISTS "Anyone can view holidays" ON public.holidays;
DROP POLICY IF EXISTS "Admins can manage holidays" ON public.holidays;

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the admin check function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Drop tables that depend on profiles
DROP TABLE IF EXISTS public.verification_requests CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.registration_forms CASCADE;

-- Update seats table to remove user reference
ALTER TABLE public.seats DROP COLUMN IF EXISTS assigned_user_id;

-- Drop the profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remove RLS from remaining tables and make them publicly accessible
ALTER TABLE public.seats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays DISABLE ROW LEVEL SECURITY;
