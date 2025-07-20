-- Create enum for food categories
CREATE TYPE public.food_category AS ENUM (
  'snacks',
  'beverages', 
  'meals',
  'desserts',
  'healthy'
);

-- Create canteen_items table
CREATE TABLE public.canteen_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category food_category NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  preparation_time INTEGER DEFAULT 0, -- in minutes
  ingredients TEXT[],
  nutritional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canteen_items ENABLE ROW LEVEL SECURITY;

-- Create policies for canteen_items
CREATE POLICY "Anyone can view available canteen items" 
ON public.canteen_items 
FOR SELECT 
USING (available = true OR is_admin());

CREATE POLICY "Admins can manage canteen items" 
ON public.canteen_items 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_canteen_items_updated_at
BEFORE UPDATE ON public.canteen_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.canteen_items (name, description, category, price, ingredients, preparation_time) VALUES
('Samosa', 'Crispy triangular pastry filled with spiced potatoes', 'snacks', 15.00, ARRAY['potato', 'peas', 'spices', 'flour'], 5),
('Tea', 'Hot masala tea with milk and spices', 'beverages', 10.00, ARRAY['tea leaves', 'milk', 'sugar', 'cardamom', 'ginger'], 3),
('Coffee', 'Fresh brewed coffee', 'beverages', 12.00, ARRAY['coffee beans', 'milk', 'sugar'], 3),
('Veg Sandwich', 'Grilled sandwich with fresh vegetables', 'snacks', 25.00, ARRAY['bread', 'tomato', 'cucumber', 'onion', 'butter'], 8),
('Poha', 'Flattened rice with vegetables and spices', 'meals', 20.00, ARRAY['flattened rice', 'onion', 'potato', 'peas', 'spices'], 10),
('Maggi', 'Instant noodles with vegetables', 'snacks', 18.00, ARRAY['noodles', 'vegetables', 'spices'], 7),
('Fresh Lime Water', 'Refreshing lime water with mint', 'beverages', 8.00, ARRAY['lime', 'water', 'sugar', 'mint'], 2),
('Fruit Salad', 'Fresh seasonal fruits', 'healthy', 30.00, ARRAY['apple', 'banana', 'orange', 'pomegranate'], 5);