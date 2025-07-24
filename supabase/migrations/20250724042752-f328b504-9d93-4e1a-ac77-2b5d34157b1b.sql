-- Create coupons table for discount management
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  applicable_to TEXT NOT NULL DEFAULT 'all' CHECK (applicable_to IN ('all', 'subscriptions', 'canteen')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Admins can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (active = true AND valid_from <= now() AND valid_until >= now());

-- Create coupon_usage table to track usage
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('subscription', 'canteen')),
  order_id UUID NOT NULL,
  discount_amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- Enable RLS on coupon_usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for coupon_usage
CREATE POLICY "Admins can view all coupon usage" 
ON public.coupon_usage 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own coupon usage" 
ON public.coupon_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage coupon usage" 
ON public.coupon_usage 
FOR ALL 
USING (true);

-- Add coupon_id to payments table
ALTER TABLE public.payments 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN original_amount INTEGER,
ADD COLUMN discount_amount INTEGER DEFAULT 0;

-- Add coupon_id to canteen_orders table
ALTER TABLE public.canteen_orders 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN original_amount NUMERIC,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create trigger for automatic timestamp updates on coupons
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  _coupon_code TEXT,
  _user_id UUID,
  _order_type TEXT,
  _amount NUMERIC
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create indexes for better performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(active);
CREATE INDEX idx_coupon_usage_coupon_user ON public.coupon_usage(coupon_id, user_id);
CREATE INDEX idx_coupon_usage_user_order_type ON public.coupon_usage(user_id, order_type);