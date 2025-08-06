-- Make verification-docs bucket public for easier access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'verification-docs';

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'verification-docs' 
  AND is_admin()
);

-- Add debug logging to verification submission
CREATE OR REPLACE FUNCTION public.log_verification_submission()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'New verification request created: user_id=%, status=%', NEW.user_id, NEW.status;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER log_verification_trigger
  AFTER INSERT ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_verification_submission();