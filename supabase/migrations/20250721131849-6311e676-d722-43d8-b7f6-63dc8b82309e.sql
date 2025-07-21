-- Update seats table to support multiple time slots per seat
-- First, create an enum for time slots
CREATE TYPE time_slot_type AS ENUM ('full_day', 'morning', 'evening', 'night');

-- Create a new table for seat bookings with time slots
CREATE TABLE public.seat_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_number INTEGER NOT NULL,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  time_slot time_slot_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seat_number, time_slot, start_date, end_date),
  FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE
);

-- Enable RLS on seat_bookings
ALTER TABLE public.seat_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for seat_bookings
CREATE POLICY "Users can view their own seat bookings" 
ON public.seat_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own seat bookings" 
ON public.seat_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seat bookings" 
ON public.seat_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all seat bookings" 
ON public.seat_bookings 
FOR ALL 
USING (is_admin());

-- Update subscriptions table to remove seat_id since we'll track it in seat_bookings
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS seat_id;

-- Create trigger for automatic timestamp updates on seat_bookings
CREATE TRIGGER update_seat_bookings_updated_at
BEFORE UPDATE ON public.seat_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check seat availability for a specific time slot
CREATE OR REPLACE FUNCTION public.is_seat_available(
  _seat_number INTEGER,
  _time_slot time_slot_type,
  _start_date DATE,
  _end_date DATE,
  _exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT NOT EXISTS (
    SELECT 1 
    FROM public.seat_bookings 
    WHERE seat_number = _seat_number 
      AND time_slot = _time_slot 
      AND status = 'active'
      AND (
        (_start_date BETWEEN start_date AND end_date) OR
        (_end_date BETWEEN start_date AND end_date) OR
        (start_date BETWEEN _start_date AND _end_date) OR
        (end_date BETWEEN _start_date AND _end_date)
      )
      AND (_exclude_booking_id IS NULL OR id != _exclude_booking_id)
  );
$$;

-- Function to get user's active seat booking for a time slot
CREATE OR REPLACE FUNCTION public.get_user_seat_booking(
  _user_id UUID,
  _time_slot time_slot_type
)
RETURNS TABLE (
  booking_id UUID,
  seat_number INTEGER,
  start_date DATE,
  end_date DATE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id, seat_number, start_date, end_date
  FROM public.seat_bookings 
  WHERE user_id = _user_id 
    AND time_slot = _time_slot 
    AND status = 'active'
    AND CURRENT_DATE BETWEEN start_date AND end_date
  LIMIT 1;
$$;

-- Function to release expired seat bookings
CREATE OR REPLACE FUNCTION public.release_expired_seat_bookings()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.seat_bookings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND end_date < CURRENT_DATE;
  
  SELECT count(*)::INTEGER FROM public.seat_bookings 
  WHERE status = 'expired' AND updated_at = now()::date;
$$;