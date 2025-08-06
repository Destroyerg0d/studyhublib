
-- Add missing columns to timetable_slots table
ALTER TABLE public.timetable_slots 
ADD COLUMN end_time time without time zone,
ADD COLUMN plan_type text DEFAULT 'full_day',
ADD COLUMN date date DEFAULT CURRENT_DATE;

-- Update existing records with default values
UPDATE public.timetable_slots 
SET 
  end_time = (time::time + interval '1 hour')::time,
  plan_type = 'full_day',
  date = CURRENT_DATE
WHERE end_time IS NULL OR plan_type IS NULL OR date IS NULL;

-- Make the new columns NOT NULL after setting defaults
ALTER TABLE public.timetable_slots 
ALTER COLUMN end_time SET NOT NULL,
ALTER COLUMN plan_type SET NOT NULL,
ALTER COLUMN date SET NOT NULL;
