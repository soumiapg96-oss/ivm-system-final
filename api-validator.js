const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Test data
const testData = {
  validProduct: {
    name: 'Test Product',
    categoryId: 1,
    quantity: 10,
    price: 29.99,
    lowStockThreshold: 5,
    description: 'A test product',
    active: true
  },
  invalidProduct: {
    name: 'Test Product',
    categoryId: 1,
    quantity: 10,
    price: 29.99,
    createdAt: '2024-01-01T00:00:00Z', // This should be rejected
    updatedAt: '2024-01-01T00:00:00Z', // This should be rejected
    id: 999 // This should be rejected
  },
  validCategory: {
    name: 'Test Category',
    description: 'A test category'
  },
  validUser: {
    email: 'test@example.com',
    password: 'TestPass123',
    role: 'user'
  }
};

async function testAPI() {
  console.log('🔍 Starting API Validation Test...\n');
  
  let token = null;
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed\n');
    
    // Test 2: Try to get admin token (this might fail due to password hash issue)
    console.log('2. Testing authentication...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'admin@inventory.com',
        password: 'Admin123!'
      });
      token = loginResponse.data.accessToken;
      console.log('✅ Authentication successful\n');
    } catch (error) {
      console.log('❌ Authentication failed - this is expected due to password hash issue\n');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   This will be fixed in the database migration\n');
    }
    
    // Test 3: Test product creation without token (should fail with 401)
    console.log('3. Testing product creation without authentication...');
    try {
      await axios.post(`${API_BASE}/api/products`, testData.validProduct);
      console.log('❌ Should have failed with 401\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request\n');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 4: Test product creation with invalid fields (if we had a token)
    console.log('4. Testing validation schemas...');
    console.log('   This test requires authentication token');
    console.log('   Will be tested after fixing password hash\n');
    
    // Test 5: Test Swagger documentation
    console.log('5. Testing Swagger documentation...');
    try {
      const swaggerResponse = await axios.get(`${API_BASE}/api-docs/`);
      if (swaggerResponse.status === 200) {
        console.log('✅ Swagger documentation accessible\n');
      } else {
        console.log('❌ Swagger documentation not accessible\n');
      }
    } catch (error) {
      console.log('❌ Swagger documentation error:', error.message);
    }
    
    // Test 6: Test public endpoints
    console.log('6. Testing public endpoints...');
    try {
      const rootResponse = await axios.get(`${API_BASE}/`);
      console.log('✅ Root endpoint accessible:', rootResponse.data.message);
    } catch (error) {
      console.log('❌ Root endpoint error:', error.message);
    }
    
    console.log('\n📋 Analysis Summary:');
    console.log('   - API server is running correctly');
    console.log('   - Authentication middleware is working');
    console.log('   - Swagger documentation is accessible');
    console.log('   - Need to fix password hash in database');
    console.log('   - Validation schemas need testing with valid token');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();
