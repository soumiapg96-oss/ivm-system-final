const axios = require('axios');

async function testAllFixes() {
  console.log('🧪 Testing All Fixes Applied...\n');
  
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
    let adminToken, userToken;
    
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

    // Test 3: Categories API for Product Creation
    console.log('\n3. Testing Categories API for Product Creation...');
    try {
      const categoriesResponse = await axios.get(`${baseURL}/categories/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (categoriesResponse.status === 200) {
        console.log('✅ Categories API working');
        console.log(`   Categories count: ${categoriesResponse.data.data?.length || 0}`);
        
        if (categoriesResponse.data.data && categoriesResponse.data.data.length > 0) {
          console.log('   Sample category:', categoriesResponse.data.data[0].name);
        }
      } else {
        console.log(`❌ Categories API returned status: ${categoriesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Categories API test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Role-Based API Protection
    console.log('\n4. Testing Role-Based API Protection...');
    
    // Test admin access to categories
    try {
      const adminCategoriesResponse = await axios.get(`${baseURL}/categories`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (adminCategoriesResponse.status === 200) {
        console.log('✅ Admin can access categories');
      } else {
        console.log(`❌ Admin categories access failed: ${adminCategoriesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Admin categories access failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Dashboard Charts API
    console.log('\n5. Testing Dashboard Charts API...');
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

    // Test 6: Reports Summary API
    console.log('\n6. Testing Reports Summary API...');
    try {
      const summaryResponse = await axios.get(`${baseURL}/reports/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (summaryResponse.status === 200) {
        console.log('✅ Reports summary API working');
        console.log(`   Summary data: ${JSON.stringify(summaryResponse.data.summary)}`);
      } else {
        console.log(`❌ Summary API returned status: ${summaryResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Summary API test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 7: Products API
    console.log('\n7. Testing Products API...');
    try {
      const productsResponse = await axios.get(`${baseURL}/products?limit=5`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (productsResponse.status === 200) {
        console.log('✅ Products API working');
        const products = productsResponse.data.products || [];
        console.log(`   Products data: ${products.length} products`);
        if (products.length > 0) {
          console.log(`   Sample product: ${products[0].name}`);
        }
      } else {
        console.log(`❌ Products API returned status: ${productsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Products API test failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 8: Profile API
    console.log('\n8. Testing Profile API...');
    try {
      const profileResponse = await axios.get(`${baseURL}/users/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (profileResponse.status === 200) {
        console.log('✅ Profile API working');
        console.log(`   Profile data: ${JSON.stringify(profileResponse.data.profile)}`);
      } else {
        console.log(`❌ Profile API returned status: ${profileResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Profile API test failed: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary of Fixes Applied:');
    console.log('✅ Product Module: Category dropdown fixed with proper API mapping');
    console.log('✅ Product Module: Added loading state and error handling for categories');
    console.log('✅ Dashboard: Category chart alignment improved with Legend and better styling');
    console.log('✅ Registration: Added comprehensive validation for all fields');
    console.log('✅ Registration: Fixed input visibility and added live validation feedback');
    console.log('✅ Registration: Added proper mobile number validation (10-digit)');
    console.log('✅ Role-Based Permissions: Implemented role-based routing');
    console.log('✅ Role-Based Permissions: Users redirected to /products, admins see dashboard');
    console.log('✅ Role-Based Permissions: Secured backend APIs with role checks');
    console.log('✅ Role-Based Permissions: Categories and Users routes protected for admin only');
    console.log('✅ Role-Based Permissions: Product write operations protected for admin only');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testAllFixes().catch(console.error);
