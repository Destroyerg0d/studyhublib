-- Backfill profiles and roles for existing users without entries
INSERT INTO public.profiles (id, email, name, role, verified)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS name,
       CASE WHEN u.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN 'admin' ELSE 'student' END AS role,
       CASE WHEN u.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN TRUE ELSE FALSE END AS verified
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Ensure a role exists in user_roles for every user
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT u.id,
       CASE WHEN u.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN 'admin'::public.app_role ELSE 'student'::public.app_role END,
       u.id
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;