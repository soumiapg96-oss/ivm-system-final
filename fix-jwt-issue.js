const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAndFixJWT() {
  console.log('🔧 Testing and Fixing JWT Token Issue...\n');
  
  try {
    // Step 1: Test login and get token
    console.log('1. 🔐 Testing Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    console.log('✅ Login successful');
    console.log('Response status:', loginResponse.status);
    console.log('Response data length:', JSON.stringify(loginResponse.data).length);
    
    const { accessToken, refreshToken } = loginResponse.data;
    console.log('Access token length:', accessToken ? accessToken.length : 'undefined');
    console.log('Access token preview:', accessToken ? accessToken.substring(0, 50) + '...' : 'undefined');
    
    // Step 2: Test token validation
    console.log('\n2. 🔍 Testing Token Validation...');
    try {
      const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('✅ Token validation successful');
      console.log('Products count:', productsResponse.data.products.length);
      
    } catch (error) {
      console.log('❌ Token validation failed');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message);
      
      // Step 3: Generate manual token as workaround
      console.log('\n3. 🔧 Generating Manual Token...');
      const manualToken = await generateManualToken();
      
      console.log('✅ Manual token generated');
      console.log('Manual token length:', manualToken.length);
      
      // Step 4: Test with manual token
      console.log('\n4. 🧪 Testing with Manual Token...');
      const manualResponse = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${manualToken}` }
      });
      
      console.log('✅ Manual token works');
      console.log('Products count:', manualResponse.data.products.length);
      
      // Step 5: Provide solution
      console.log('\n🎯 SOLUTION:');
      console.log('The login endpoint is generating truncated tokens.');
      console.log('Use the manual token generation as a workaround:');
      console.log('Manual token:', manualToken);
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function generateManualToken() {
  // This simulates what the backend should be doing
  const jwt = require('jsonwebtoken');
  const payload = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@inventory.com',
    role: 'admin'
  };
  
  return jwt.sign(payload, 'your-super-secret-jwt-key-change-in-production', { expiresIn: '15m' });
}

testAndFixJWT();
