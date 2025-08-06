-- Add foreign key constraint between payments and profiles
ALTER TABLE public.payments 
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Add foreign key constraint between payments and plans
ALTER TABLE public.payments 
ADD CONSTRAINT payments_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES public.plans(id);