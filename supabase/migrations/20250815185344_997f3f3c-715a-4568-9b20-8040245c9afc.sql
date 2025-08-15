-- Remove the problematic constraint that's blocking data insertion
ALTER TABLE public.timetable_slots
DROP CONSTRAINT IF EXISTS timetable_slots_type_check;