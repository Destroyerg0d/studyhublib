-- Create verification_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  aadhar_front_url TEXT,
  aadhar_back_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_requests
CREATE POLICY "Users can view their own verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" 
ON public.verification_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update all verification requests" 
ON public.verification_requests 
FOR UPDATE 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create verification-docs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for verification documents
CREATE POLICY IF NOT EXISTS "Users can upload their verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND is_admin()
);
