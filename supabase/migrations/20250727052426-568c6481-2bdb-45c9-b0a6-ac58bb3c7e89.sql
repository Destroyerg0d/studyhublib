-- Make razorpay_order_id nullable for PayU payments
ALTER TABLE public.payments 
ALTER COLUMN razorpay_order_id DROP NOT NULL;