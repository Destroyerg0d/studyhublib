-- First, update existing invalid types to match the expected values
UPDATE public.timetable_slots 
SET type = CASE 
  WHEN type = 'day' THEN 'study'
  WHEN type = 'night' THEN 'study'
  ELSE type
END;

-- Now allow 'opening' and other valid types in timetable_slots
ALTER TABLE public.timetable_slots
DROP CONSTRAINT IF EXISTS timetable_slots_type_check;

ALTER TABLE public.timetable_slots
ADD CONSTRAINT timetable_slots_type_check
CHECK (type IN ('opening', 'closing', 'break', 'study'));

-- Optional: ensure type is lowercase to avoid future case issues
CREATE OR REPLACE FUNCTION public.normalize_timetable_slot_type()
RETURNS trigger AS $$
BEGIN
  NEW.type := lower(NEW.type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_normalize_timetable_slot_type ON public.timetable_slots;
CREATE TRIGGER trg_normalize_timetable_slot_type
BEFORE INSERT OR UPDATE ON public.timetable_slots
FOR EACH ROW EXECUTE FUNCTION public.normalize_timetable_slot_type();