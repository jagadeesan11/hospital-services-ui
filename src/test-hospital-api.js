// Test script to verify hospitalApi connection
const axios = require('axios');

// Simulate the same configuration as your React app
const getEnvironmentConfig = () => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';

  switch (env) {
    default: // development
      return {
        HOSPITAL_SERVICE: process.env.REACT_APP_HOSPITAL_SERVICE_URL || 'http://localhost:8080',
      };
  }
};

const API_CONFIG = getEnvironmentConfig();

console.log('Testing Hospital API Configuration:');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Hospital Service URL:', API_CONFIG.HOSPITAL_SERVICE);

// Create the same axios instance as your hospitalApi
const testHospitalApi = axios.create({
  baseURL: API_CONFIG.HOSPITAL_SERVICE,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  },
  withCredentials: false,
  timeout: 30000
});

// Test basic connectivity
async function testConnection() {
  try {
    console.log('\n🔄 Testing basic connectivity...');

    // Try a simple GET request to check if server is running
    const response = await testHospitalApi.get('/api/hospitals');
    console.log('✅ Hospital API connection successful!');
    console.log('Response status:', response.status);
    console.log('Response data type:', typeof response.data);
    console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');

    return true;
  } catch (error) {
    console.log('❌ Hospital API connection failed:');

    if (error.code === 'ECONNREFUSED') {
      console.log('   - Server is not running on', API_CONFIG.HOSPITAL_SERVICE);
      console.log('   - Make sure your backend hospital service is started');
    } else if (error.response) {
      console.log('   - Server responded with status:', error.response.status);
      console.log('   - Response data:', error.response.data);
    } else if (error.request) {
      console.log('   - Request was made but no response received');
      console.log('   - Check if the URL is correct:', API_CONFIG.HOSPITAL_SERVICE);
    } else {
      console.log('   - Error:', error.message);
    }

    return false;
  }
}

// Test with authentication (if token exists)
async function testWithAuth() {
  try {
    console.log('\n🔄 Testing with authentication...');

    // Add a mock token for testing
    testHospitalApi.defaults.headers.Authorization = 'Bearer test-token';

    const response = await testHospitalApi.get('/api/hospitals');
    console.log('✅ Hospital API with auth successful!');
    console.log('Response status:', response.status);

    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️ Authentication required (401) - this is expected without a valid token');
      return 'auth-required';
    } else {
      console.log('❌ Hospital API with auth failed:', error.message);
      return false;
    }
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Hospital API Connection Test');
  console.log('================================');

  const basicResult = await testConnection();

  if (basicResult) {
    const authResult = await testWithAuth();

    console.log('\n📋 Test Summary:');
    console.log('- Basic connectivity: ✅ Working');
    console.log('- Authentication:', authResult === 'auth-required' ? '⚠️ Required (normal)' : authResult ? '✅ Working' : '❌ Failed');
  } else {
    console.log('\n📋 Test Summary:');
    console.log('- Basic connectivity: ❌ Failed');
    console.log('- Check if backend hospital service is running on:', API_CONFIG.HOSPITAL_SERVICE);
  }

  console.log('\n💡 Next steps:');
  console.log('1. Ensure your hospital service backend is running');
  console.log('2. Verify the service is accessible at:', API_CONFIG.HOSPITAL_SERVICE);
  console.log('3. Check that the /api/hospitals endpoint exists');
  console.log('4. Verify CORS configuration if running from different origins');
}

runTests().catch(console.error);
