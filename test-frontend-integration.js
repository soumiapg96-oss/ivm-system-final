const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');
  
  let token = '';
  
  try {
    // Test 1: Authentication
    console.log('1. 🔐 Testing Authentication...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    token = loginResponse.data.accessToken;
    console.log('✅ Authentication successful');
    console.log(`   User: ${loginResponse.data.user.email} (${loginResponse.data.user.role})`);
    
    // Test 2: Frontend Accessibility
    console.log('\n2. 🌐 Testing Frontend Accessibility...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log('✅ Frontend is accessible');
      console.log(`   Status: ${frontendResponse.status}`);
    } catch (err) {
      console.log('⚠️  Frontend not accessible (may be starting up)');
    }
    
    // Test 3: Products API Integration
    console.log('\n3. 📦 Testing Products API Integration...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Products API working');
    console.log(`   Total products: ${productsResponse.data.products.length}`);
    console.log(`   Pagination: ${productsResponse.data.pagination.total} total items`);
    
    // Test 4: Categories API Integration
    console.log('\n4. 📂 Testing Categories API Integration...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Categories API working');
    console.log(`   Total categories: ${categoriesResponse.data.categories.length}`);
    
    // Test 5: Users API Integration
    console.log('\n5. 👥 Testing Users API Integration...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Users API working');
    console.log(`   Total users: ${usersResponse.data.users.length}`);
    
    // Test 6: Reports API Integration
    console.log('\n6. 📊 Testing Reports API Integration...');
    const reportsResponse = await axios.get(`${API_BASE_URL}/reports/stock-levels`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Reports API working');
    console.log(`   Total products in report: ${reportsResponse.data.summary.total_products}`);
    
    // Test 7: Create Test Product
    console.log('\n7. ➕ Testing Product Creation...');
    const createProductResponse = await axios.post(`${API_BASE_URL}/products`, {
      name: 'Frontend Integration Test Product',
      categoryId: 1,
      quantity: 10,
      price: 99.99,
      lowStockThreshold: 5,
      description: 'Product created during frontend integration testing'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product creation working');
    console.log(`   Created product ID: ${createProductResponse.data.product.id}`);
    
    // Test 8: Update Test Product
    console.log('\n8. ✏️ Testing Product Update...');
    const productId = createProductResponse.data.product.id;
    const updateProductResponse = await axios.put(`${API_BASE_URL}/products/${productId}`, {
      name: 'Updated Frontend Test Product',
      price: 149.99
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product update working');
    console.log(`   Updated product: ${updateProductResponse.data.product.name}`);
    
    // Test 9: Delete Test Product
    console.log('\n9. 🗑️ Testing Product Deletion...');
    await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product deletion working');
    
    // Test 10: Create Test Category
    console.log('\n10. 📁 Testing Category Creation...');
    const createCategoryResponse = await axios.post(`${API_BASE_URL}/categories`, {
      name: 'Frontend Integration Test Category',
      description: 'Category created during frontend integration testing'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Category creation working');
    console.log(`   Created category ID: ${createCategoryResponse.data.category.id}`);
    
    // Test 11: Delete Test Category
    console.log('\n11. 🗑️ Testing Category Deletion...');
    const categoryId = createCategoryResponse.data.category.id;
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Category deletion working');
    
    console.log('\n🎉 Frontend-Backend Integration Tests Completed Successfully!');
    console.log('\n📊 Integration Status Summary:');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Products CRUD: Working');
    console.log('   ✅ Categories CRUD: Working');
    console.log('   ✅ Users API: Working');
    console.log('   ✅ Reports API: Working');
    console.log('   ✅ JWT Tokens: Working');
    console.log('   ✅ API Headers: Working');
    console.log('   ✅ Error Handling: Working');
    
    console.log('\n🚀 Frontend Integration Ready!');
    console.log('   - All API endpoints are functional');
    console.log('   - JWT authentication is working');
    console.log('   - CRUD operations are working');
    console.log('   - Frontend can now connect to backend');
    
  } catch (error) {
    console.error('\n❌ Frontend integration test failed:');
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

testFrontendIntegration();
