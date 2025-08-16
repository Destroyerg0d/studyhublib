-- Fix ambiguous column reference in coupon validation
CREATE OR REPLACE FUNCTION public.validate_coupon(_coupon_code text, _user_id uuid, _order_type text, _amount numeric)
 RETURNS TABLE(valid boolean, coupon_id uuid, discount_amount numeric, final_amount numeric, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  _coupon RECORD;
  _calculated_discount NUMERIC;
  _user_usage_count INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO _coupon
  FROM public.coupons c
  WHERE c.code = _coupon_code AND c.active = true;
  
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
  
  -- Check user usage (one coupon per user per order type) - Fixed ambiguous column reference
  SELECT COUNT(*) INTO _user_usage_count
  FROM public.coupon_usage cu
  WHERE cu.coupon_id = _coupon.id AND cu.user_id = _user_id AND cu.order_type = _order_type;
  
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