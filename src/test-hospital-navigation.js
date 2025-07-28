// Diagnostic test for Hospital navigation and API issues
const axios = require('axios');

const API_CONFIG = {
  HOSPITAL_SERVICE: 'http://localhost:8080'
};

// Test the exact scenario when clicking Hospitals menu
async function testHospitalNavigation() {
  console.log('🔍 Hospital Navigation Diagnostic Test');
  console.log('=====================================');

  // 1. Check localStorage state (simulating what happens in browser)
  console.log('\n1. 📋 Checking Authentication State:');
  console.log('   - accessToken in localStorage: none (need to login)');
  console.log('   - user object in localStorage: none (need to login)');
  console.log('   - Required role for /hospitals route: ADMIN');

  // 2. Test API call without authentication
  console.log('\n2. 🔄 Testing Hospital API without auth token:');
  try {
    const testApi = axios.create({
      baseURL: API_CONFIG.HOSPITAL_SERVICE,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const response = await testApi.get('/api/hospitals');
    console.log('   ✅ API call succeeded without auth!');
    console.log('   - Status:', response.status);
    console.log('   - Data count:', response.data?.length || 'N/A');
    console.log('   - This means your backend allows unauthenticated access');

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ❌ API call failed: 401 Unauthorized');
      console.log('   - This is the expected behavior if auth is required');
      console.log('   - User needs to login first');
    } else if (error.response?.status === 403) {
      console.log('   ❌ API call failed: 403 Forbidden');
      console.log('   - User needs ADMIN role');
    } else {
      console.log('   ❌ API call failed:', error.message);
    }
  }

  // 3. Test with mock auth token
  console.log('\n3. 🔄 Testing Hospital API with mock auth token:');
  try {
    const authTestApi = axios.create({
      baseURL: API_CONFIG.HOSPITAL_SERVICE,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token-for-testing'
      },
      timeout: 30000
    });

    const response = await authTestApi.get('/api/hospitals');
    console.log('   ✅ API call with auth succeeded!');
    console.log('   - Status:', response.status);
    console.log('   - Data count:', response.data?.length || 'N/A');

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ❌ Mock token rejected (401 Unauthorized)');
      console.log('   - Backend requires valid JWT token');
    } else if (error.response?.status === 403) {
      console.log('   ❌ Insufficient permissions (403 Forbidden)');
      console.log('   - Token valid but user lacks ADMIN role');
    } else {
      console.log('   ❌ API call failed:', error.message);
    }
  }

  console.log('\n📋 Diagnosis Summary:');
  console.log('===================');
  console.log('Issue: Backend API not invoked when clicking Hospitals menu');
  console.log('\nPossible causes:');
  console.log('1. ❌ User not logged in (no accessToken in localStorage)');
  console.log('2. ❌ User lacks ADMIN role (route is protected)');
  console.log('3. ❌ Authentication token expired or invalid');
  console.log('4. ❌ Backend authentication middleware blocking requests');
  console.log('\nRecommended fixes:');
  console.log('1. 🔐 Login with an ADMIN user account');
  console.log('2. 🛡️ Verify user role permissions');
  console.log('3. 🔄 Check if token is properly stored after login');
  console.log('4. 📋 Enable browser dev tools to see network requests');
}

testHospitalNavigation().catch(console.error);
