-- Add missing PayU columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payu_order_id text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payu_payment_id text;

-- Add missing fields to plans table for duration calculation
ALTER TABLE plans ADD COLUMN IF NOT EXISTS duration_days integer;

-- Update existing plans to have duration_days based on duration_months
UPDATE plans 
SET duration_days = duration_months * 30
WHERE duration_days IS NULL;