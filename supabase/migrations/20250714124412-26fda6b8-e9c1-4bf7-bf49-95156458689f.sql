
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'student'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert admin user directly using Supabase auth (this will work better than manual insertion)
-- Note: The admin signup should be done through the application or Supabase dashboard
-- But for testing, we'll create a profile entry that can be updated when the admin signs up

-- Create admin profile that will be linked when admin@studyhub.com signs up
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find existing admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@studyhub.com';
    
    -- If admin user exists, create/update their profile
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, name, role, verified)
        VALUES (admin_user_id, 'admin@studyhub.com', 'Admin User', 'admin', true)
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            verified = true,
            name = 'Admin User';
    END IF;
END $$;
