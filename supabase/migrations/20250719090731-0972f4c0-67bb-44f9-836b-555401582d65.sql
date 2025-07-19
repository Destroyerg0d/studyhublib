-- Create tuition locations table for admin management
CREATE TABLE public.tuition_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  rates jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tuition_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active tuition locations" 
ON public.tuition_locations 
FOR SELECT 
USING (active = true OR is_admin());

CREATE POLICY "Admins can manage tuition locations" 
ON public.tuition_locations 
FOR ALL 
USING (is_admin());

-- Insert default locations with rates
INSERT INTO public.tuition_locations (name, rates) VALUES 
('Khoda Colony', '{"lkg_ukg": 2500, "class_1_8": 3000, "class_8_10": 4500, "class_11_12": 6000}'),
('Indrapuram', '{"lkg_ukg": 4000, "class_1_8": 5000, "class_8_10": 6000, "class_11_12": 8000}'),
('Sector 62', '{"lkg_ukg": 3000, "class_1_8": 4000, "class_8_10": 5000, "class_11_12": 7000}'),
('Mayur Vihar Phase 3', '{"lkg_ukg": 3000, "class_1_8": 4000, "class_8_10": 5000, "class_11_12": 7000}');

-- Create trigger for updated_at
CREATE TRIGGER update_tuition_locations_updated_at
BEFORE UPDATE ON public.tuition_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();