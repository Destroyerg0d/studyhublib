-- Create test verification request for the user who submitted
INSERT INTO verification_requests (
  user_id, 
  aadhar_front_url, 
  aadhar_back_url, 
  status,
  created_at
) VALUES (
  'bba3fd29-6403-4d83-99d0-bb7fa3f4fef0', -- realdivyanshsingh@gmail.com user ID
  'https://yblkeicngnerkrtkolau.supabase.co/storage/v1/object/public/verification-docs/test_front_divyansh.jpg',
  'https://yblkeicngnerkrtkolau.supabase.co/storage/v1/object/public/verification-docs/test_back_divyansh.jpg',
  'pending',
  now()
);

-- Also update the user's profile with the submitted information
UPDATE profiles SET 
  phone = '+91 7380398812',
  address = '501/113, Kutubpur, Hasanganj',
  emergency_contact_name = 'Divyansh Singh',
  emergency_contact_phone = '+91 7380398812',
  emergency_contact_relation = 'Father'
WHERE id = 'bba3fd29-6403-4d83-99d0-bb7fa3f4fef0';