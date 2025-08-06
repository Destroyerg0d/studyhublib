-- Create canteen orders table
CREATE TABLE public.canteen_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  estimated_time INTEGER, -- in minutes
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.canteen_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own canteen orders" ON public.canteen_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own canteen orders" ON public.canteen_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending canteen orders" ON public.canteen_orders
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all orders
CREATE POLICY "Admins can view all canteen orders" ON public.canteen_orders
  FOR SELECT USING (is_admin());

-- Admins can update all orders
CREATE POLICY "Admins can update all canteen orders" ON public.canteen_orders
  FOR UPDATE USING (is_admin());

-- Service can manage orders (for payment processing)
CREATE POLICY "Service can manage canteen orders" ON public.canteen_orders
  FOR ALL USING (true);

-- Create trigger to update updated_at column
CREATE TRIGGER update_canteen_orders_updated_at
  BEFORE UPDATE ON public.canteen_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_canteen_orders_user_id ON public.canteen_orders(user_id);
CREATE INDEX idx_canteen_orders_status ON public.canteen_orders(status);
CREATE INDEX idx_canteen_orders_payment_status ON public.canteen_orders(payment_status);
CREATE INDEX idx_canteen_orders_razorpay_order_id ON public.canteen_orders(razorpay_order_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('canteen_order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE canteen_order_seq START 1;