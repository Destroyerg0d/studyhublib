-- First, update existing types to match the expected constraint
UPDATE public.timetable_slots 
SET type = CASE 
  WHEN type = 'day' THEN 'study'
  WHEN type = 'night' THEN 'study'
  ELSE type
END
WHERE type NOT IN ('opening', 'closing', 'break', 'study');

-- Now add the constraint to allow the proper types
ALTER TABLE public.timetable_slots
DROP CONSTRAINT IF EXISTS timetable_slots_type_check;

ALTER TABLE public.timetable_slots
ADD CONSTRAINT timetable_slots_type_check
CHECK (type IN ('opening', 'closing', 'break', 'study'));

-- Add function to normalize type case
CREATE OR REPLACE FUNCTION public.normalize_timetable_slot_type()
RETURNS trigger AS $$
BEGIN
  NEW.type := lower(NEW.type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Add trigger to normalize type
DROP TRIGGER IF EXISTS trg_normalize_timetable_slot_type ON public.timetable_slots;
CREATE TRIGGER trg_normalize_timetable_slot_type
BEFORE INSERT OR UPDATE ON public.timetable_slots
FOR EACH ROW EXECUTE FUNCTION public.normalize_timetable_slot_type();