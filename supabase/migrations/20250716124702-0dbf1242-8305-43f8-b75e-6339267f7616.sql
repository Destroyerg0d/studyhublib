
-- Create a table to store registration form data
CREATE TABLE public.registration_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Female', 'Male', 'Non-binary')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  preferred_study_time TEXT NOT NULL CHECK (preferred_study_time IN ('Morning(8-3)', 'Afternoon(3-10)', 'Fullday(8-10)')),
  special_requirements TEXT,
  registration_agreed BOOLEAN NOT NULL DEFAULT true,
  terms_accepted BOOLEAN NOT NULL DEFAULT true,
  registration_experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  form_submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for registration forms
CREATE POLICY "Admins can manage all registration forms" 
  ON public.registration_forms 
  FOR ALL 
  USING (is_admin());

CREATE POLICY "Users can view their own registration forms" 
  ON public.registration_forms 
  FOR SELECT 
  USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_registration_forms_updated_at 
  BEFORE UPDATE ON public.registration_forms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
