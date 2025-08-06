-- Create user roles table for secure role management
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create improved is_admin function using new role system
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT public.has_role(COALESCE(user_id, auth.uid()), 'admin'::public.app_role);
$function$;

-- Migrate existing admin users to new role system
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  id, 
  'admin'::public.app_role,
  id
FROM public.profiles 
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert student roles for non-admin users
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  id, 
  'student'::public.app_role,
  id
FROM public.profiles 
WHERE role = 'student'
ON CONFLICT (user_id, role) DO NOTHING;

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can modify roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix search_path vulnerabilities in existing functions
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('public.canteen_order_seq')::TEXT, 4, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_seat_available(_seat_number INTEGER, _time_slot time_slot_type, _start_date DATE, _end_date DATE, _exclude_booking_id UUID DEFAULT NULL::UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_seat_booking(_user_id UUID, _time_slot time_slot_type)
RETURNS TABLE(booking_id UUID, seat_number INTEGER, start_date DATE, end_date DATE)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT id, seat_number, start_date, end_date
  FROM public.seat_bookings 
  WHERE user_id = _user_id 
    AND time_slot = _time_slot 
    AND status = 'active'
    AND CURRENT_DATE BETWEEN start_date AND end_date
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.release_expired_seat_bookings()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  UPDATE public.seat_bookings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND end_date < CURRENT_DATE;
  
  SELECT count(*)::INTEGER FROM public.seat_bookings 
  WHERE status = 'expired' AND updated_at = now()::date;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
  
  -- Also create role entry
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email IN ('admin@studyhub.com', 'hossenbiddoth@gmail.com') THEN 'admin'::public.app_role
      ELSE 'student'::public.app_role
    END,
    NEW.id
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_coupon(_coupon_code TEXT, _user_id UUID, _order_type TEXT, _amount NUMERIC)
RETURNS TABLE(valid BOOLEAN, coupon_id UUID, discount_amount NUMERIC, final_amount NUMERIC, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _coupon RECORD;
  _calculated_discount NUMERIC;
  _user_usage_count INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO _coupon
  FROM public.coupons
  WHERE code = _coupon_code AND active = true;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Invalid coupon code';
    RETURN;
  END IF;
  
  -- Check validity period
  IF _coupon.valid_from > now() OR _coupon.valid_until < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Coupon has expired';
    RETURN;
  END IF;
  
  -- Check applicability
  IF _coupon.applicable_to != 'all' AND _coupon.applicable_to != _order_type THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Coupon not applicable for this order type';
    RETURN;
  END IF;
  
  -- Check minimum amount
  IF _amount < _coupon.min_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Order amount does not meet minimum requirement';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF _coupon.usage_limit IS NOT NULL AND _coupon.used_count >= _coupon.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Coupon usage limit exceeded';
    RETURN;
  END IF;
  
  -- Check user usage (one coupon per user per order type)
  SELECT COUNT(*) INTO _user_usage_count
  FROM public.coupon_usage
  WHERE coupon_id = _coupon.id AND user_id = _user_id AND order_type = _order_type;
  
  IF _user_usage_count > 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, 0::NUMERIC, _amount, 'Coupon already used';
    RETURN;
  END IF;
  
  -- Calculate discount
  IF _coupon.discount_type = 'percentage' THEN
    _calculated_discount := (_amount * _coupon.discount_value / 100);
  ELSE
    _calculated_discount := _coupon.discount_value;
  END IF;
  
  -- Apply maximum discount limit
  IF _coupon.max_discount IS NOT NULL AND _calculated_discount > _coupon.max_discount THEN
    _calculated_discount := _coupon.max_discount;
  END IF;
  
  -- Ensure discount doesn't exceed amount
  IF _calculated_discount > _amount THEN
    _calculated_discount := _amount;
  END IF;
  
  RETURN QUERY SELECT true, _coupon.id, _calculated_discount, (_amount - _calculated_discount), NULL::TEXT;
END;
$function$;

-- Remove the old role column from profiles table (will be handled by user_roles)
-- Note: We keep it for now for backward compatibility but mark it as deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use public.user_roles table instead';

-- Create trigger to ensure role consistency
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Keep profiles.role in sync with user_roles for backward compatibility
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET role = NEW.role::TEXT 
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles 
    SET role = NEW.role::TEXT 
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Set default role when last role is removed
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = OLD.user_id) THEN
      UPDATE public.profiles 
      SET role = 'student' 
      WHERE id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sync_profile_role_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role();