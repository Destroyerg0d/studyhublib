// Debug script to test verification functionality
// Run this in your browser console to test the verification process

console.log('=== VERIFICATION DEBUG SCRIPT ===');

// Test 1: Check if user is logged in
async function testUserAuth() {
  console.log('Testing user authentication...');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Auth error:', error);
    return false;
  }
  
  if (!user) {
    console.error('No user logged in');
    return false;
  }
  
  console.log('User logged in:', user.email);
  return true;
}

// Test 2: Check if verification_requests table exists
async function testVerificationTable() {
  console.log('Testing verification_requests table...');
  
  const { data, error } = await supabase
    .from('verification_requests')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Table access error:', error);
    return false;
  }
  
  console.log('Table exists and accessible');
  return true;
}

// Test 3: Check if verification-docs bucket exists
async function testStorageBucket() {
  console.log('Testing verification-docs bucket...');
  
  try {
    const { data, error } = await supabase.storage
      .from('verification-docs')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Bucket access error:', error);
      return false;
    }
    
    console.log('Bucket exists and accessible');
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

// Test 4: Check current verification requests
async function checkVerificationRequests() {
  console.log('Checking existing verification requests...');
  
  const { data, error } = await supabase
    .from('verification_requests')
    .select('*');
  
  if (error) {
    console.error('Query error:', error);
    return;
  }
  
  console.log('Current verification requests:', data);
  console.log('Number of requests:', data?.length || 0);
}

// Run all tests
async function runAllTests() {
  console.log('Running all verification tests...');
  
  const authOk = await testUserAuth();
  if (!authOk) {
    console.log('❌ Authentication failed');
    return;
  }
  
  const tableOk = await testVerificationTable();
  if (!tableOk) {
    console.log('❌ Table access failed');
    return;
  }
  
  const bucketOk = await testStorageBucket();
  if (!bucketOk) {
    console.log('❌ Storage bucket failed');
    return;
  }
  
  await checkVerificationRequests();
  
  console.log('✅ All tests completed');
}

// Run the tests
runAllTests();
