-- Fix verification flow: ensure profiles are auto-created and storage uploads are permitted

-- 1) Create trigger to auto-create profile and role for new auth users
DO $$
BEGIN
  -- Drop existing trigger if present to avoid duplicates
  IF EXISTS (
    SELECT 1
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;

  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
END $$;

-- 2) Storage policies for verification documents (bucket: verification-docs)
-- Allow public read (bucket is public) and authenticated users to write within their own folder `${user_id}/...`
DO $$
BEGIN
  -- SELECT policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read verification docs'
  ) THEN
    DROP POLICY "Public can read verification docs" ON storage.objects;
  END IF;
  CREATE POLICY "Public can read verification docs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'verification-docs');

  -- INSERT policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload verification docs'
  ) THEN
    DROP POLICY "Users can upload verification docs" ON storage.objects;
  END IF;
  CREATE POLICY "Users can upload verification docs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

  -- UPDATE policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own verification docs'
  ) THEN
    DROP POLICY "Users can update own verification docs" ON storage.objects;
  END IF;
  CREATE POLICY "Users can update own verification docs"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
END $$;

-- 3) Optional: Log every new verification request
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'log_verification_request_insert'
  ) THEN
    DROP TRIGGER log_verification_request_insert ON public.verification_requests;
  END IF;

  CREATE TRIGGER log_verification_request_insert
  AFTER INSERT ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_verification_submission();
END $$;
