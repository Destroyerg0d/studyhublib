
-- Create registration_forms table to store form submissions
CREATE TABLE public.registration_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  preferred_study_time TEXT NOT NULL CHECK (preferred_study_time IN ('Morning(8-3)', 'Afternoon(3-10)', 'Fullday(8-10)')),
  special_requirements TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT true,
  registration_agreed BOOLEAN NOT NULL DEFAULT true,
  registration_experience TEXT,
  form_submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for registration_forms
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all registration forms"
  ON public.registration_forms
  FOR ALL
  USING (is_admin());

CREATE POLICY "Users can view their own registration forms"
  ON public.registration_forms
  FOR SELECT
  USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Create index for better performance
CREATE INDEX idx_registration_forms_email ON public.registration_forms(email);
CREATE INDEX idx_registration_forms_status ON public.registration_forms(status);
CREATE INDEX idx_registration_forms_submitted_at ON public.registration_forms(form_submitted_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_registration_forms_updated_at
    BEFORE UPDATE ON public.registration_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
