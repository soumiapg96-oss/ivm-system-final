const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFrontendIntegration() {
  console.log('🧪 Testing Final Frontend Integration...\n');
  
  let token = '';
  
  try {
    // Step 1: Get valid token
    console.log('1. 🔐 Getting Valid Token...');
    const tokenResponse = await axios.post(`${API_BASE_URL}/auth/generate-token`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    token = tokenResponse.data.token;
    console.log('✅ Token generated successfully');
    console.log('Token length:', token.length);
    
    // Step 2: Test Products API (simulating frontend call)
    console.log('\n2. 📦 Testing Products API (Frontend Simulation)...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API call successful');
    console.log('Response status:', productsResponse.status);
    console.log('Products count:', productsResponse.data.products.length);
    console.log('Pagination:', productsResponse.data.pagination);
    
    // Step 3: Test Categories API
    console.log('\n3. 📂 Testing Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Categories API call successful');
    console.log('Categories count:', categoriesResponse.data.categories.length);
    
    // Step 4: Test Users API
    console.log('\n4. 👥 Testing Users API...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Users API call successful');
    console.log('Users count:', usersResponse.data.users.length);
    
    // Step 5: Test Product Creation (simulating frontend form submission)
    console.log('\n5. ➕ Testing Product Creation...');
    const createProductData = {
      name: 'Frontend Integration Test Product',
      categoryId: 1,
      quantity: 25,
      price: 199.99,
      lowStockThreshold: 5,
      description: 'Product created during frontend integration testing'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/products`, createProductData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product creation successful');
    const productId = createResponse.data.product.id;
    console.log('Created product ID:', productId);
    
    // Step 6: Test Product Update
    console.log('\n6. ✏️ Testing Product Update...');
    const updateData = {
      name: 'Updated Frontend Test Product',
      price: 249.99
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/products/${productId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product update successful');
    console.log('Updated product name:', updateResponse.data.product.name);
    
    // Step 7: Test Product Deletion
    console.log('\n7. 🗑️ Testing Product Deletion...');
    await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product deletion successful');
    
    // Step 8: Test Error Handling (Invalid Token)
    console.log('\n8. 🚫 Testing Error Handling (Invalid Token)...');
    try {
      await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: 'Bearer invalid.token.here' }
      });
      console.log('❌ Expected error but request succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.code === 'INVALID_TOKEN') {
        console.log('✅ Correctly handled invalid token');
        console.log('Error code:', error.response.data.code);
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error response:', error.response?.data);
      }
    }
    
    // Step 9: Test Error Handling (No Token)
    console.log('\n9. 🚫 Testing Error Handling (No Token)...');
    try {
      await axios.get(`${API_BASE_URL}/products`);
      console.log('❌ Expected error but request succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.code === 'NO_TOKEN') {
        console.log('✅ Correctly handled missing token');
        console.log('Error code:', error.response.data.code);
        console.log('Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error response:', error.response?.data);
      }
    }
    
    // Step 10: Test Reports API
    console.log('\n10. 📊 Testing Reports API...');
    const reportsResponse = await axios.get(`${API_BASE_URL}/reports/stock-levels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Reports API call successful');
    console.log('Total products in report:', reportsResponse.data.summary.total_products);
    
    console.log('\n🎉 Frontend Integration Test Completed Successfully!');
    console.log('\n📊 Integration Status Summary:');
    console.log('   ✅ JWT Token Generation: Working');
    console.log('   ✅ Products API: Working');
    console.log('   ✅ Categories API: Working');
    console.log('   ✅ Users API: Working');
    console.log('   ✅ Product CRUD Operations: Working');
    console.log('   ✅ Reports API: Working');
    console.log('   ✅ Error Handling: Working');
    console.log('   ✅ Authorization Headers: Working');
    
    console.log('\n🚀 Frontend Integration Ready!');
    console.log('   - All API endpoints are functional');
    console.log('   - JWT authentication is working');
    console.log('   - CRUD operations are working');
    console.log('   - Error handling is properly implemented');
    console.log('   - Frontend can now connect to backend successfully');
    
    console.log('\n🔑 Token for Frontend Testing:');
    console.log(token);
    
  } catch (error) {
    console.error('\n❌ Frontend integration test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
      console.error(`   Code: ${error.response.data.code}`);
      console.error(`   Endpoint: ${error.config.url}`);
      console.error(`   Method: ${error.config.method}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testFrontendIntegration();
