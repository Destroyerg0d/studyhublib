-- Insert test verification request for testing
INSERT INTO verification_requests (
  user_id, 
  aadhar_front_url, 
  aadhar_back_url, 
  status,
  created_at
) VALUES (
  '8ce9029c-d11c-4d8e-b380-66039ab45179', -- Using an existing user ID
  'https://yblkeicngnerkrtkolau.supabase.co/storage/v1/object/public/verification-docs/test_front.jpg',
  'https://yblkeicngnerkrtkolau.supabase.co/storage/v1/object/public/verification-docs/test_back.jpg',
  'pending',
  now()
);