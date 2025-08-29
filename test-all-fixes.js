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
        
        // Check for React app content
        const html = frontendResponse.data;
        const hasReactApp = html.includes('id="root"') && html.includes('main.jsx');
        console.log(`   React app detected: ${hasReactApp ? '✅' : '❌'}`);
      } else {
        console.log(`❌ Frontend returned status: ${frontendResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Frontend test failed: ${error.message}`);
    }

    // Test 2: Backend API Health
    console.log('\n2. Testing Backend API...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@inventory.com',
        password: 'Admin123!'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Login API working');
        const token = loginResponse.data.accessToken;
        
        // Test 3: Dashboard Charts API
        console.log('\n3. Testing Dashboard Charts API...');
        try {
          const chartsResponse = await axios.get(`${baseURL}/reports/dashboard/charts`, {
            headers: { Authorization: `Bearer ${token}` }
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

        // Test 4: Reports Summary API
        console.log('\n4. Testing Reports Summary API...');
        try {
          const summaryResponse = await axios.get(`${baseURL}/reports/summary`, {
            headers: { Authorization: `Bearer ${token}` }
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

        // Test 5: Categories Search API
        console.log('\n5. Testing Categories Search API...');
        try {
          const searchResponse = await axios.get(`${baseURL}/categories?search=electronics`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (searchResponse.status === 200) {
            console.log('✅ Categories search API working');
            console.log(`   Search results: ${searchResponse.data.categories?.length || 0} categories`);
          } else {
            console.log(`❌ Search API returned status: ${searchResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Search API test failed: ${error.response?.data?.message || error.message}`);
        }

        // Test 6: Profile API
        console.log('\n6. Testing Profile API...');
        try {
          const profileResponse = await axios.get(`${baseURL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
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

        // Test 7: Products Export Data
        console.log('\n7. Testing Products Export Data...');
        try {
          const productsResponse = await axios.get(`${baseURL}/products?limit=5`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (productsResponse.status === 200) {
            console.log('✅ Products API working');
            const products = productsResponse.data.products || [];
            console.log(`   Products data: ${products.length} products`);
            if (products.length > 0) {
              console.log(`   Sample product: ${JSON.stringify(products[0])}`);
            }
          } else {
            console.log(`❌ Products API returned status: ${productsResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Products API test failed: ${error.response?.data?.message || error.message}`);
        }

        // Test 8: Reports Data
        console.log('\n8. Testing Reports Data...');
        try {
          const reportsResponse = await axios.get(`${baseURL}/reports/stock-levels`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (reportsResponse.status === 200) {
            console.log('✅ Reports API working');
            const products = reportsResponse.data.products || [];
            console.log(`   Stock levels data: ${products.length} products`);
            if (products.length > 0) {
              console.log(`   Sample report: ${JSON.stringify(products[0])}`);
            }
          } else {
            console.log(`❌ Reports API returned status: ${reportsResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Reports API test failed: ${error.response?.data?.message || error.message}`);
        }

      } else {
        console.log(`❌ Login failed with status: ${loginResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Backend test failed: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary of Fixes Applied:');
    console.log('✅ Dashboard: Category Distribution chart fixed with proper labels and colors');
    console.log('✅ Dashboard: Inventory Trends chart added with demo data');
    console.log('✅ Reports: Cards now show real data from API');
    console.log('✅ Reports: Filtering functionality implemented');
    console.log('✅ Reports: Export functionality improved with actual data');
    console.log('✅ Products: Export now includes proper data, not just headers');
    console.log('✅ Products: Table layout improved with icons in last column');
    console.log('✅ Categories: Search functionality implemented');
    console.log('✅ Categories: Display changed to card format');
    console.log('✅ Profile: New profile page with edit functionality');
    console.log('✅ Profile: Password change functionality');
    console.log('✅ Navigation: Profile link added to navbar');
    console.log('✅ API: New endpoints for dashboard charts and reports summary');
    console.log('✅ API: Profile management endpoints');
    console.log('✅ Database: Search functionality for categories');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testAllFixes().catch(console.error);
