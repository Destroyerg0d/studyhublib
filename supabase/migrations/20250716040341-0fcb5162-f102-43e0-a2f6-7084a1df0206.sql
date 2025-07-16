
-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create seats table
CREATE TABLE public.seats (
  id TEXT PRIMARY KEY,
  row_letter TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(row_letter, seat_number)
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('day', 'night', '24/7')),
  duration_months INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  seat_id TEXT REFERENCES public.seats(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'overdue', 'suspended', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_paid DECIMAL(10,2),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  aadhar_front_url TEXT,
  aadhar_back_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create timetable_slots table
CREATE TABLE public.timetable_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('day', 'night')),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create holidays table
CREATE TABLE public.holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'closed' CHECK (type IN ('closed', 'half-day')),
  recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- RLS Policies for seats
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (public.is_admin());

-- RLS Policies for plans
CREATE POLICY "Anyone can view active plans" ON public.plans 
  FOR SELECT USING (active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (public.is_admin());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

-- RLS Policies for verification_requests
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending verification requests" ON public.verification_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests
  FOR ALL USING (public.is_admin());

-- RLS Policies for timetable_slots
CREATE POLICY "Anyone can view timetable slots" ON public.timetable_slots FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage timetable slots" ON public.timetable_slots FOR ALL USING (public.is_admin());

-- RLS Policies for holidays
CREATE POLICY "Anyone can view holidays" ON public.holidays FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage holidays" ON public.holidays FOR ALL USING (public.is_admin());

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default seats
INSERT INTO public.seats (id, row_letter, seat_number) 
SELECT 
  chr(64 + row_num) || '-' || seat_num,
  chr(64 + row_num),
  seat_num
FROM 
  generate_series(1, 4) AS row_num,
  generate_series(1, 6) AS seat_num;

-- Insert default plans
INSERT INTO public.plans (name, type, duration_months, price, features) VALUES
('Day Time - 1 Month', 'day', 1, 1000.00, ARRAY['8 AM - 10 PM Access', 'Comfortable Seating', 'WiFi Access', 'Study Materials']),
('Day Time - 3 Months', 'day', 3, 2800.00, ARRAY['8 AM - 10 PM Access', 'Comfortable Seating', 'WiFi Access', 'Study Materials', '10% Discount']),
('Day Time - 6 Months', 'day', 6, 5200.00, ARRAY['8 AM - 10 PM Access', 'Comfortable Seating', 'WiFi Access', 'Study Materials', '15% Discount']),
('Night Time - 1 Month', 'night', 1, 1400.00, ARRAY['10 PM - 6 AM Access', 'Comfortable Seating', 'WiFi Access', 'Study Materials', 'Quiet Environment']),
('24/7 Access - 1 Month', '24/7', 1, 2000.00, ARRAY['24/7 Access', 'Comfortable Seating', 'WiFi Access', 'Study Materials', 'Premium Support']);

-- Insert default timetable slots
INSERT INTO public.timetable_slots (name, time, type, description) VALUES
('Morning Start', '08:00', 'day', 'Library opens for day session'),
('Peak Hours', '09:00', 'day', 'Peak study hours begin'),
('Lunch Break', '12:00', 'day', 'Lunch break period'),
('Afternoon Session', '13:00', 'day', 'Post-lunch session resumes'),
('Evening Peak', '18:00', 'day', 'Evening peak hours'),
('Day Close', '22:00', 'day', 'Day session ends'),
('Night Start', '22:00', 'night', 'Night session begins'),
('Quiet Hours', '00:00', 'night', 'Deep focus hours'),
('Deep Study', '03:00', 'night', 'Minimal activity period'),
('Night Close', '06:00', 'night', 'Night session ends');

-- Insert default holidays
INSERT INTO public.holidays (name, date, type, recurring) VALUES
('Christmas Day', '2024-12-25', 'closed', true),
('New Year''s Day', '2025-01-01', 'half-day', true),
('Republic Day', '2025-01-26', 'closed', true),
('Independence Day', '2025-08-15', 'closed', true);

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

-- Create storage policy for verification documents
CREATE POLICY "Users can upload their own verification docs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification docs" ON storage.objects
  FOR SELECT USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can manage all verification docs" ON storage.objects
  FOR ALL USING (bucket_id = 'verification-docs' AND public.is_admin());

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.holidays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;
