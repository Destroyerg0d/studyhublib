-- First, let's clean up existing plans and create new ones with proper timings
DELETE FROM plans;

-- Insert new plans with updated structure and pricing based on the image
-- Full Day (6 AM - 10 PM) - ₹1,000/month
INSERT INTO plans (name, type, price, duration_months, features, active) VALUES
('Full Day - 1 Month', 'full_day', 1000.00, 1, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment'], true),
('Full Day - 3 Months', 'full_day', 2800.00, 3, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹200'], true),
('Full Day - 6 Months', 'full_day', 5200.00, 6, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹800'], true),
('Full Day - 12 Months', 'full_day', 10000.00, 12, ARRAY['6 AM - 10 PM Access', '16 hours daily access', 'Individual study booth', 'WiFi & power outlets', 'Peaceful environment', 'Save ₹2,000'], true),

-- Morning Shift (6 AM - 3 PM) - ₹600/month
('Morning Shift - 1 Month', 'morning', 600.00, 1, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds'], true),
('Morning Shift - 3 Months', 'morning', 1700.00, 3, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds', 'Save ₹100'], true),
('Morning Shift - 6 Months', 'morning', 3200.00, 6, ARRAY['6 AM - 3 PM Access', '9 hours daily access', 'Morning focused hours', 'Individual study booth', 'WiFi & power outlets', 'Perfect for early birds', 'Save ₹400'], true),

-- Evening Shift (3 PM - 10 PM) - ₹600/month  
('Evening Shift - 1 Month', 'evening', 600.00, 1, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals'], true),
('Evening Shift - 3 Months', 'evening', 1700.00, 3, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals', 'Save ₹100'], true),
('Evening Shift - 6 Months', 'evening', 3200.00, 6, ARRAY['3 PM - 10 PM Access', '7 hours daily access', 'Evening focused hours', 'Individual study booth', 'WiFi & power outlets', 'Great for working professionals', 'Save ₹400'], true),

-- Full Shift (24 Hours) - ₹1,200/month
('Full Shift - 1 Month', 'full_shift', 1200.00, 1, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan'], true),
('Full Shift - 3 Months', 'full_shift', 3500.00, 3, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan', 'Save ₹100'], true),
('Full Shift - 6 Months', 'full_shift', 6500.00, 6, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan', 'Save ₹700'], true),
('Full Shift - 12 Months', 'full_shift', 12000.00, 12, ARRAY['24/7 Access', '24 hours daily access', 'Round the clock access', 'Individual study booth', 'WiFi & power outlets', 'Premium plan', 'Save ₹2,400'], true);