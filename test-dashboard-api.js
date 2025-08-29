const axios = require('axios');

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API Calls...\n');
  
  try {
    // Get fresh token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful, token obtained');
    
    // Test 1: Inventory Summary
    console.log('\n1. Testing Inventory Summary API...');
    try {
      const summaryResponse = await axios.get('http://localhost:3000/api/products/inventory/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Inventory Summary Response:');
      console.log(JSON.stringify(summaryResponse.data, null, 2));
      
      const summary = summaryResponse.data.summary;
      console.log('\n📊 Summary Data:');
      console.log(`   Total Products: ${summary.total_products}`);
      console.log(`   Total Value: $${summary.total_value}`);
      console.log(`   Low Stock: ${summary.low_stock}`);
      console.log(`   Active Products: ${summary.active_products}`);
      
    } catch (error) {
      console.log('❌ Inventory Summary Error:', error.response?.data || error.message);
    }
    
    // Test 2: Categories API
    console.log('\n2. Testing Categories API...');
    try {
      const categoriesResponse = await axios.get('http://localhost:3000/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Categories Response:');
      console.log(`   Categories count: ${categoriesResponse.data.categories?.length || 0}`);
      console.log(`   Pagination: ${JSON.stringify(categoriesResponse.data.pagination)}`);
      
    } catch (error) {
      console.log('❌ Categories Error:', error.response?.data || error.message);
    }
    
    // Test 3: Categories with Product Count
    console.log('\n3. Testing Categories with Product Count...');
    try {
      const categoriesWithCountResponse = await axios.get('http://localhost:3000/api/categories/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Categories with Count Response:');
      console.log(`   Categories with count: ${categoriesWithCountResponse.data?.length || 0}`);
      
      if (categoriesWithCountResponse.data && categoriesWithCountResponse.data.length > 0) {
        console.log('\n📋 Sample Categories:');
        categoriesWithCountResponse.data.slice(0, 3).forEach(cat => {
          console.log(`   - ${cat.name}: ${cat.productCount || 0} products`);
        });
      }
      
    } catch (error) {
      console.log('❌ Categories with Count Error:', error.response?.data || error.message);
    }
    
    // Test 4: Check if endpoints exist
    console.log('\n4. Testing Endpoint Availability...');
    const endpoints = [
      '/api/products/inventory/summary',
      '/api/categories',
      '/api/categories/all'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 5000
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || 'Connection failed'}`);
      }
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
testDashboardAPI().catch(console.error);
