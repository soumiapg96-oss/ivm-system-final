const axios = require('axios');

async function testFrontendFunctionality() {
  console.log('🧪 Testing Frontend Functionality...\n');
  
  try {
    // Test 1: Frontend accessibility
    console.log('1. Testing frontend accessibility...');
    const frontendResponse = await axios.get('http://localhost:5173');
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log('❌ Frontend not accessible');
      return;
    }
    
    // Test 2: Login page accessibility
    console.log('\n2. Testing login page...');
    const loginPageResponse = await axios.get('http://localhost:5173/login');
    if (loginPageResponse.status === 200) {
      console.log('✅ Login page is accessible');
    } else {
      console.log('❌ Login page not accessible');
    }
    
    // Test 3: Registration page accessibility
    console.log('\n3. Testing registration page...');
    const registerPageResponse = await axios.get('http://localhost:5173/register');
    if (registerPageResponse.status === 200) {
      console.log('✅ Registration page is accessible');
    } else {
      console.log('❌ Registration page not accessible');
    }
    
    // Test 4: Backend API connectivity
    console.log('\n4. Testing backend API connectivity...');
    const apiResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    if (apiResponse.status === 200) {
      console.log('✅ Backend API is working');
    } else {
      console.log('❌ Backend API not working');
    }
    
    // Test 5: Registration API with new fields
    console.log('\n5. Testing registration API with new fields...');
    const registrationData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      phone: '+1234567890',
      password: 'TestPass123!',
      confirm_password: 'TestPass123!',
      accept_terms: true
    };
    
    const registerResponse = await axios.post('http://localhost:3000/api/auth/register', registrationData);
    if (registerResponse.status === 201) {
      console.log('✅ Registration API with new fields is working');
      console.log(`   User created: ${registerResponse.data.user.first_name} ${registerResponse.data.user.last_name}`);
    } else {
      console.log('❌ Registration API not working');
    }
    
    // Test 6: Check for specific UI elements in HTML
    console.log('\n6. Checking for UI elements in registration page...');
    const registerPageHTML = registerPageResponse.data;
    
    const uiElements = [
      { name: 'First Name Input', selector: 'name="first_name"' },
      { name: 'Last Name Input', selector: 'name="last_name"' },
      { name: 'Email Input', selector: 'name="email"' },
      { name: 'Phone Input', selector: 'name="phone"' },
      { name: 'Password Input', selector: 'name="password"' },
      { name: 'Confirm Password Input', selector: 'name="confirm_password"' },
      { name: 'Terms Checkbox', selector: 'name="accept_terms"' },
      { name: 'Submit Button', selector: 'type="submit"' }
    ];
    
    let allElementsFound = true;
    uiElements.forEach(({ name, selector }) => {
      if (registerPageHTML.includes(selector)) {
        console.log(`✅ ${name} found`);
      } else {
        console.log(`❌ ${name} not found`);
        allElementsFound = false;
      }
    });
    
    if (allElementsFound) {
      console.log('\n✅ All UI elements are present in the registration page');
    } else {
      console.log('\n❌ Some UI elements are missing from the registration page');
    }
    
    // Test 7: Check for modern UI classes
    console.log('\n7. Checking for modern UI classes...');
    const modernUIClasses = [
      'bg-gradient-to-br',
      'shadow-xl',
      'rounded-lg',
      'text-blue-600',
      'hover:bg-blue-700'
    ];
    
    let modernUIFound = true;
    modernUIClasses.forEach(className => {
      if (registerPageHTML.includes(className)) {
        console.log(`✅ Modern UI class "${className}" found`);
      } else {
        console.log(`❌ Modern UI class "${className}" not found`);
        modernUIFound = false;
      }
    });
    
    if (modernUIFound) {
      console.log('\n✅ Modern UI styling is applied');
    } else {
      console.log('\n❌ Modern UI styling is missing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFrontendFunctionality().catch(console.error);
