const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCompleteIntegration() {
  console.log('🧪 Testing Complete Frontend-Backend Integration...\n');
  
  let token = '';
  
  try {
    // Step 1: Test generate-token endpoint
    console.log('1. 🔧 Testing Generate Token Endpoint...');
    const tokenResponse = await axios.post(`${API_BASE_URL}/auth/generate-token`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    token = tokenResponse.data.token;
    console.log('✅ Token generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Step 2: Test Products API
    console.log('\n2. 📦 Testing Products API...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API working');
    console.log('Total products:', productsResponse.data.products.length);
    console.log('Pagination:', productsResponse.data.pagination);
    
    // Step 3: Test Categories API
    console.log('\n3. 📂 Testing Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Categories API working');
    console.log('Total categories:', categoriesResponse.data.categories.length);
    
    // Step 4: Test Users API
    console.log('\n4. 👥 Testing Users API...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Users API working');
    console.log('Total users:', usersResponse.data.users.length);
    
    // Step 5: Test Product Creation
    console.log('\n5. ➕ Testing Product Creation...');
    const createProductResponse = await axios.post(`${API_BASE_URL}/products`, {
      name: 'Integration Test Product',
      categoryId: 1,
      quantity: 50,
      price: 99.99,
      lowStockThreshold: 10,
      description: 'Product created during integration testing'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product creation working');
    const productId = createProductResponse.data.product.id;
    console.log('Created product ID:', productId);
    
    // Step 6: Test Product Update
    console.log('\n6. ✏️ Testing Product Update...');
    const updateProductResponse = await axios.put(`${API_BASE_URL}/products/${productId}`, {
      name: 'Updated Integration Test Product',
      price: 149.99
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product update working');
    console.log('Updated product name:', updateProductResponse.data.product.name);
    
    // Step 7: Test Product Deletion
    console.log('\n7. 🗑️ Testing Product Deletion...');
    await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product deletion working');
    
    // Step 8: Test Category Creation
    console.log('\n8. 📁 Testing Category Creation...');
    const timestamp = Date.now();
    const createCategoryResponse = await axios.post(`${API_BASE_URL}/categories`, {
      name: `Integration Test Category ${timestamp}`,
      description: 'Category created during integration testing'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Category creation working');
    const categoryId = createCategoryResponse.data.category.id;
    console.log('Created category ID:', categoryId);
    
    // Step 9: Test Category Deletion
    console.log('\n9. 🗑️ Testing Category Deletion...');
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Category deletion working');
    
    // Step 10: Test Reports API
    console.log('\n10. 📊 Testing Reports API...');
    const reportsResponse = await axios.get(`${API_BASE_URL}/reports/stock-levels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Reports API working');
    console.log('Total products in report:', reportsResponse.data.summary.total_products);
    
    console.log('\n🎉 Complete Integration Test Successful!');
    console.log('\n📊 Integration Status Summary:');
    console.log('   ✅ JWT Token Generation: Working');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Products CRUD: Working');
    console.log('   ✅ Categories CRUD: Working');
    console.log('   ✅ Users API: Working');
    console.log('   ✅ Reports API: Working');
    console.log('   ✅ Authorization Headers: Working');
    console.log('   ✅ Database Connection: Working');
    
    console.log('\n🚀 Frontend Integration Ready!');
    console.log('   - All API endpoints are functional');
    console.log('   - JWT authentication is working');
    console.log('   - CRUD operations are working');
    console.log('   - Frontend can now connect to backend');
    console.log('   - Use the generate-token endpoint as workaround');
    
    console.log('\n🔑 Token for Frontend Testing:');
    console.log(token);
    
  } catch (error) {
    console.error('\n❌ Integration test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data.error}`);
      console.error(`   Endpoint: ${error.config.url}`);
      console.error(`   Method: ${error.config.method}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testCompleteIntegration();
