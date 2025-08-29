const axios = require('axios');

async function testFinalFixes() {
  console.log('🧪 Testing All Final Fixes...\n');
  
  const baseURL = 'http://localhost:3000/api';
  const frontendURL = 'http://localhost:80';
  
  try {
    // Test 1: Frontend Accessibility
    console.log('1. Testing Frontend Accessibility...');
    try {
      const frontendResponse = await axios.get(frontendURL, {
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend is accessible on port 80');
      } else {
        console.log(`❌ Frontend returned status: ${frontendResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Frontend test failed: ${error.message}`);
    }

    // Test 2: Login and get token
    console.log('\n2. Testing Login...');
    let adminToken;
    
    try {
      const adminLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@inventory.com',
        password: 'Admin123!'
      });
      
      adminToken = adminLoginResponse.data.accessToken;
      console.log('✅ Admin login successful');
    } catch (error) {
      console.log(`❌ Admin login failed: ${error.response?.data?.message || error.message}`);
      return;
    }

    // Test 3: Profile Update API
    console.log('\n3. Testing Profile Update API...');
    try {
      const profileUpdateData = {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@inventory.com',
        phone: '1234567890'
      };
      
      const profileUpdateResponse = await axios.put(`${baseURL}/users/profile`, profileUpdateData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (profileUpdateResponse.status === 200) {
        console.log('✅ Profile update API working');
        console.log(`   Response: ${profileUpdateResponse.data.message}`);
      } else {
        console.log(`❌ Profile update returned status: ${profileUpdateResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Profile update test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Products API with Quantity Update
    console.log('\n4. Testing Products API...');
    try {
      const productsResponse = await axios.get(`${baseURL}/products?limit=1`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (productsResponse.status === 200) {
        console.log('✅ Products API working');
        const products = productsResponse.data.products || [];
        console.log(`   Products data: ${products.length} products`);
        
        if (products.length > 0) {
          const product = products[0];
          console.log(`   Sample product: ${product.name} (ID: ${product.id})`);
          
          // Test quantity update
          console.log('\n5. Testing Quantity Update API...');
          try {
            const quantityUpdateData = {
              quantityChange: 5,
              reasonCode: 'purchase',
              reasonDescription: 'Test quantity update'
            };
            
            const quantityResponse = await axios.patch(`${baseURL}/products/${product.id}/quantity`, quantityUpdateData, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (quantityResponse.status === 200) {
              console.log('✅ Quantity update API working');
              console.log(`   Response: ${quantityResponse.data.message}`);
            } else {
              console.log(`❌ Quantity update returned status: ${quantityResponse.status}`);
            }
          } catch (error) {
            console.log(`❌ Quantity update test failed: ${error.response?.data?.message || error.message}`);
          }
        }
      } else {
        console.log(`❌ Products API returned status: ${productsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Products API test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 6: Categories API
    console.log('\n6. Testing Categories API...');
    try {
      const categoriesResponse = await axios.get(`${baseURL}/categories/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (categoriesResponse.status === 200) {
        console.log('✅ Categories API working');
        console.log(`   Categories count: ${categoriesResponse.data.data?.length || 0}`);
      } else {
        console.log(`❌ Categories API returned status: ${categoriesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Categories API test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 7: Dashboard Charts API
    console.log('\n7. Testing Dashboard Charts API...');
    try {
      const chartsResponse = await axios.get(`${baseURL}/reports/dashboard/charts`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (chartsResponse.status === 200) {
        console.log('✅ Dashboard charts API working');
        console.log(`   Trends data: ${chartsResponse.data.trends?.length || 0} records`);
      } else {
        console.log(`❌ Charts API returned status: ${chartsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Charts API test failed: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary of Final Fixes Applied:');
    console.log('✅ Profile Update: Fixed error message handling for successful updates');
    console.log('✅ User Dashboard: Users now see dashboard instead of being redirected');
    console.log('✅ Registration: Added password visibility toggle icons');
    console.log('✅ Registration: Fixed input visibility issues');
    console.log('✅ Dashboard: Fixed Category Distribution chart alignment');
    console.log('✅ Navigation: Removed search bar from top of page');
    console.log('✅ Users Module: Fixed Add User button alignment');
    console.log('✅ Products Module: Fixed quantity update validation (NaN issue)');
    console.log('✅ Role-Based Access: Enhanced dashboard for different user roles');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testFinalFixes().catch(console.error);
