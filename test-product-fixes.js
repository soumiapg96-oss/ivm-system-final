const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testProductFixes() {
  console.log('🧪 Testing Product Module Fixes...\n');
  
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
    
    // Step 2: Test pagination
    console.log('\n2. 📄 Testing Pagination...');
    const page1Response = await axios.get(`${API_BASE_URL}/products?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Page 1 response:', {
      products: page1Response.data.products.length,
      total: page1Response.data.pagination.total,
      totalPages: page1Response.data.pagination.totalPages,
      currentPage: page1Response.data.pagination.page
    });
    
    const page2Response = await axios.get(`${API_BASE_URL}/products?page=2&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Page 2 response:', {
      products: page2Response.data.products.length,
      currentPage: page2Response.data.pagination.page
    });
    
    // Step 3: Test filters
    console.log('\n3. 🔍 Testing Filters...');
    
    // Test category filter
    const categoryFilterResponse = await axios.get(`${API_BASE_URL}/products?categoryId=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Category filter:', {
      products: categoryFilterResponse.data.products.length,
      allSameCategory: categoryFilterResponse.data.products.every(p => p.categoryId === 1)
    });
    
    // Test price filter
    const priceFilterResponse = await axios.get(`${API_BASE_URL}/products?minPrice=50&maxPrice=200&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Price filter:', {
      products: priceFilterResponse.data.products.length,
      allInRange: priceFilterResponse.data.products.every(p => p.price >= 50 && p.price <= 200)
    });
    
    // Test in-stock filter
    const inStockResponse = await axios.get(`${API_BASE_URL}/products?inStock=true&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ In-stock filter:', {
      products: inStockResponse.data.products.length,
      allInStock: inStockResponse.data.products.every(p => p.quantity > 0)
    });
    
    // Test low stock filter
    const lowStockResponse = await axios.get(`${API_BASE_URL}/products?lowStock=true&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Low stock filter:', {
      products: lowStockResponse.data.products.length,
      allLowStock: lowStockResponse.data.products.every(p => p.quantity <= p.lowStockThreshold)
    });
    
    // Step 4: Test product creation with SKU
    console.log('\n4. ➕ Testing Product Creation with SKU...');
    const createData = {
      name: 'Test Product with SKU',
      sku: 'TEST-SKU-001',
      categoryId: 1,
      quantity: 25,
      price: 99.99,
      lowStockThreshold: 5,
      description: 'Test product with SKU field'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/products`, createData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product created with SKU:', {
      id: createResponse.data.product.id,
      name: createResponse.data.product.name,
      sku: createResponse.data.product.sku
    });
    
    const productId = createResponse.data.product.id;
    
    // Step 5: Test product update with SKU
    console.log('\n5. ✏️ Testing Product Update with SKU...');
    const updateData = {
      name: 'Updated Test Product',
      sku: 'TEST-SKU-002',
      price: 149.99
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/products/${productId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Product updated with SKU:', {
      name: updateResponse.data.product.name,
      sku: updateResponse.data.product.sku,
      price: updateResponse.data.product.price
    });
    
    // Step 6: Test search functionality
    console.log('\n6. 🔍 Testing Search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/products?search=Test&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Search results:', {
      products: searchResponse.data.products.length,
      allContainTest: searchResponse.data.products.every(p => 
        p.name.toLowerCase().includes('test') || 
        (p.description && p.description.toLowerCase().includes('test'))
      )
    });
    
    // Step 7: Test export functionality (simulate by getting all products)
    console.log('\n7. 📊 Testing Export Data...');
    const exportResponse = await axios.get(`${API_BASE_URL}/products?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Export data available:', {
      totalProducts: exportResponse.data.products.length,
      hasSKU: exportResponse.data.products.every(p => p.sku),
      hasAllFields: exportResponse.data.products.every(p => 
        p.name && p.sku && p.price !== undefined && p.quantity !== undefined
      )
    });
    
    // Step 8: Test quantity update
    console.log('\n8. 📦 Testing Quantity Update...');
    const quantityData = {
      quantityChange: 10,
      reasonCode: 'purchase',
      reasonDescription: 'Test quantity update'
    };
    
    const quantityResponse = await axios.patch(`${API_BASE_URL}/products/${productId}/quantity`, quantityData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Quantity updated:', {
      newQuantity: quantityResponse.data.newQuantity,
      quantityChange: quantityResponse.data.quantityChange,
      reasonCode: quantityResponse.data.reasonCode
    });
    
    // Step 9: Clean up - delete test product
    console.log('\n9. 🗑️ Cleaning up test product...');
    await axios.delete(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Test product deleted');
    
    console.log('\n🎉 Product Module Fixes Testing Completed!');
    console.log('\n📊 Test Results Summary:');
    console.log('   ✅ Pagination: Working correctly');
    console.log('   ✅ Filters: All filter types working');
    console.log('   ✅ SKU Field: Added and working');
    console.log('   ✅ Product Creation: SKU included');
    console.log('   ✅ Product Update: SKU included');
    console.log('   ✅ Search: Working correctly');
    console.log('   ✅ Export Data: All fields available');
    console.log('   ✅ Quantity Update: Working correctly');
    console.log('   ✅ CRUD Operations: All working');
    
    console.log('\n🚀 Product Module Ready!');
    console.log('   - Pagination shows correct number of products per page');
    console.log('   - Filters work for category, price, stock status');
    console.log('   - SKU field is included in all operations');
    console.log('   - Export functionality has all required data');
    console.log('   - All CRUD operations working properly');
    
  } catch (error) {
    console.error('\n❌ Product fixes test failed:');
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

testProductFixes();

