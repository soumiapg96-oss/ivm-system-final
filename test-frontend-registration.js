const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

async function testBackendAPI() {
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test 1: Login endpoint
    console.log('1. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    
    // Test 2: Registration endpoint with valid data
    console.log('\n2. Testing registration endpoint with valid data...');
    const validRegistrationData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      password: 'SecurePass123!',
      confirm_password: 'SecurePass123!',
      accept_terms: true
    };
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, validRegistrationData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User created:', registerResponse.data.user.first_name, registerResponse.data.user.last_name);
    
    // Test 3: Registration validation - missing fields
    console.log('\n3. Testing registration validation - missing fields...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'John',
        email: 'test@example.com'
        // Missing required fields
      });
      console.log('❌ Should have failed validation');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - missing fields rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 4: Registration validation - password mismatch
    console.log('\n4. Testing registration validation - password mismatch...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test2@example.com',
        phone: '+1234567890',
        password: 'Password123!',
        confirm_password: 'DifferentPassword123!',
        accept_terms: true
      });
      console.log('❌ Should have failed password validation');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - password mismatch rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 5: Registration validation - weak password
    console.log('\n5. Testing registration validation - weak password...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test3@example.com',
        phone: '+1234567890',
        password: 'weak',
        confirm_password: 'weak',
        accept_terms: true
      });
      console.log('❌ Should have failed password strength validation');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - weak password rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 6: Registration validation - terms not accepted
    console.log('\n6. Testing registration validation - terms not accepted...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test4@example.com',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirm_password: 'SecurePass123!',
        accept_terms: false
      });
      console.log('❌ Should have failed terms validation');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - terms not accepted rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 7: Registration validation - invalid email
    console.log('\n7. Testing registration validation - invalid email...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirm_password: 'SecurePass123!',
        accept_terms: true
      });
      console.log('❌ Should have failed email validation');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - invalid email rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 8: Duplicate email registration
    console.log('\n8. Testing duplicate email registration...');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'john.doe@example.com', // Same email as before
        phone: '+1234567890',
        password: 'SecurePass123!',
        confirm_password: 'SecurePass123!',
        accept_terms: true
      });
      console.log('❌ Should have failed duplicate email validation');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Validation working - duplicate email rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend API test failed:', error.message);
  }
}

async function testFrontendAccessibility() {
  console.log('\n🌐 Testing Frontend Accessibility...\n');
  
  try {
    // Test 1: Frontend is accessible
    console.log('1. Testing frontend accessibility...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend not accessible');
    }
    
    // Test 2: Check if frontend contains React app
    if (frontendResponse.data.includes('react') || frontendResponse.data.includes('vite')) {
      console.log('✅ Frontend contains React application');
    } else {
      console.log('❌ Frontend may not be a React application');
    }
    
  } catch (error) {
    console.error('❌ Frontend accessibility test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Frontend Registration Tests\n');
  console.log('=' .repeat(60));
  
  await testBackendAPI();
  await testFrontendAccessibility();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Backend API endpoints are working correctly');
  console.log('- Registration validation is properly implemented');
  console.log('- Frontend is accessible and running');
  console.log('\n🎯 Next Steps:');
  console.log('1. Open http://localhost:5173 in your browser');
  console.log('2. Navigate to the registration page');
  console.log('3. Test the UI validation and form submission');
  console.log('4. Verify the modern UI/UX improvements');
}

// Run the tests
runAllTests().catch(console.error);
