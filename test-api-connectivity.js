const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing API Connectivity...\n');
  
  let token = '';
  
  try {
    // Test 1: Authentication
    console.log('1. Testing Authentication...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    token = loginResponse.data.accessToken;
    console.log('✅ Authentication successful');
    console.log(`   User: ${loginResponse.data.user.email} (${loginResponse.data.user.role})`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    // Test 2: Products API
    console.log('\n2. Testing Products API...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API working');
    console.log(`   Total products: ${productsResponse.data.products.length}`);
    console.log(`   Pagination: ${productsResponse.data.pagination.total} total items`);
    
    // Test 3: Categories API
    console.log('\n3. Testing Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Categories API working');
    console.log(`   Total categories: ${categoriesResponse.data.categories.length}`);
    
    // Test 4: Reports API
    console.log('\n4. Testing Reports API...');
    const reportsResponse = await axios.get(`${API_BASE_URL}/reports/stock-levels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Reports API working');
    console.log(`   Total products in report: ${reportsResponse.data.summary.total_products}`);
    console.log(`   Total value: $${reportsResponse.data.summary.total_value.toFixed(2)}`);
    
    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Products API: Working');
    console.log('   ✅ Categories API: Working');
    console.log('   ✅ Reports API: Working');
    console.log('   ✅ JWT Token: Valid');
    console.log('   ✅ Database Connection: Active');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
      console.error(`   Endpoint: ${error.config.url}`);
      console.error(`   Headers: ${JSON.stringify(error.config.headers)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testAPI();
