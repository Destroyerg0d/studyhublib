-- First, remove the existing check constraint on type
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_type_check;

-- Add new check constraint that includes all plan types
ALTER TABLE plans ADD CONSTRAINT plans_type_check CHECK (type IN ('day', 'night', '24/7', 'morning', 'evening'));

-- Delete existing plans
DELETE FROM plans;

-- Insert new plans with updated structure and pricing based on the image
-- Full Day (6 AM - 10 PM) - ₹1,000/month
INSERT INTO plans (name, type, price, duration_months, features, active) VALUES
('Full Day - 1 Month', 'day', 1000.00, 1, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment'], true),
('Full Day - 3 Months', 'day', 2800.00, 3, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹200'], true),
('Full Day - 6 Months', 'day', 5200.00, 6, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹800'], true),
('Full Day - 12 Months', 'day', 10000.00, 12, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹2,000'], true),

-- Morning Shift (6 AM - 3 PM) - ₹600/month
('Morning Shift - 1 Month', 'morning', 600.00, 1, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds'], true),
('Morning Shift - 3 Months', 'morning', 1700.00, 3, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds', 'Save ₹100'], true),
('Morning Shift - 6 Months', 'morning', 3200.00, 6, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds', 'Save ₹400'], true),

-- Evening Shift (3 PM - 10 PM) - ₹600/month
('Evening Shift - 1 Month', 'evening', 600.00, 1, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals'], true),
('Evening Shift - 3 Months', 'evening', 1700.00, 3, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals', 'Save ₹100'], true),
('Evening Shift - 6 Months', 'evening', 3200.00, 6, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals', 'Save ₹400'], true),

-- Night Shift (10 PM - 6 AM) - ₹1,200/month
('Night Shift - 1 Month', 'night', 1200.00, 1, ARRAY['10 PM - 6 AM Access', '8 hours night access', 'Quiet study environment', 'Individual study booth', 'WiFi & power outlets', 'Perfect for night owls'], true),
('Night Shift - 3 Months', 'night', 3500.00, 3, ARRAY['10 PM - 6 AM Access', '8 hours night access', 'Quiet study environment', 'Individual study booth', 'WiFi & power outlets', 'Perfect for night owls', 'Save ₹100'], true),

-- Full Shift (24/7) - ₹2,000/month
('Full Shift - 1 Month', '24/7', 2000.00, 1, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan'], true),
('Full Shift - 3 Months', '24/7', 5700.00, 3, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan', 'Save ₹300'], true),
('Full Shift - 6 Months', '24/7', 11000.00, 6, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan', 'Save ₹1,000'], true);