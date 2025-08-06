# Verification Debug Guide

## Issue: No verification documents showing in admin panel

### Step 1: Check if the table exists
1. Go to your Supabase dashboard
2. Navigate to **Table Editor** > **verification_requests**
3. If the table doesn't exist, you need to run the migration

### Step 2: Check if the storage bucket exists
1. Go to your Supabase dashboard
2. Navigate to **Storage** > **Buckets**
3. Look for a bucket named `verification-docs`
4. If it doesn't exist, create it and make it public

### Step 3: Test the verification process
1. Open your application in the browser
2. Log in as a regular user (not admin)
3. Go to the verification page (`/dashboard/verification`)
4. Open browser console (F12)
5. Copy and paste the contents of `debug-verification.js` into the console
6. Press Enter to run the debug script
7. Check the console output for any errors

### Step 4: Test file upload
1. On the verification page, try uploading two test images
2. Fill in the form and submit
3. Check the browser console for detailed logs
4. Look for any error messages

### Step 5: Check admin panel
1. Log in as admin
2. Go to the verification management page (`/admin/verification`)
3. Open browser console
4. Check for any error messages in the console

### Common Issues and Solutions:

#### Issue 1: Table doesn't exist
**Solution:** Run the migration manually in Supabase SQL editor:
```sql
-- Create verification_requests table
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
```

#### Issue 2: Storage bucket doesn't exist
**Solution:** Create the bucket in Supabase dashboard:
1. Go to **Storage** > **Buckets**
2. Click **Create bucket**
3. Name: `verification-docs`
4. Make it **Public**
5. Create storage policies for the bucket

#### Issue 3: RLS (Row Level Security) blocking access
**Solution:** Check if RLS policies are correct:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'verification_requests';
```

#### Issue 4: No users have submitted verification requests
**Solution:** This is normal if no one has used the verification feature yet. Test it by:
1. Creating a test user account
2. Going through the verification process
3. Submitting test documents

### Debug Information to Collect:
1. Browser console logs from verification submission
2. Browser console logs from admin panel
3. Supabase dashboard logs
4. Any error messages displayed to users

### Next Steps:
1. Follow the steps above
2. Run the debug script
3. Check if any errors appear
4. Let me know what you find and I can help further
