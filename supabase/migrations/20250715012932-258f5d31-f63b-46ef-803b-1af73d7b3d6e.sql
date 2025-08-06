
-- Update the user profile to make hossenbiddoth@gmail.com an admin
UPDATE public.profiles 
SET role = 'admin', verified = true, updated_at = now()
WHERE email = 'hossenbiddoth@gmail.com';

-- If the profile doesn't exist yet, we'll need to insert it when they first sign up
-- The trigger will handle profile creation, but we can also prepare an upsert just in case
INSERT INTO public.profiles (id, email, name, role, verified)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', 'Admin User'),
    'admin',
    true
FROM auth.users au
WHERE au.email = 'hossenbiddoth@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    verified = true,
    updated_at = now();
