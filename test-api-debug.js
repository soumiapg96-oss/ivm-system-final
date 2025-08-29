const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing API Issues...\n');
  
  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Test 2: Categories API
    console.log('\n2. Testing Categories API...');
    try {
      const categoriesResponse = await axios.get('http://localhost:3000/api/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Categories API Response:');
      console.log('   Status:', categoriesResponse.status);
      console.log('   Data structure:', Object.keys(categoriesResponse.data));
      console.log('   Categories count:', categoriesResponse.data.data?.length || 0);
      
      if (categoriesResponse.data.data && categoriesResponse.data.data.length > 0) {
        console.log('   Sample category:', categoriesResponse.data.data[0]);
      }
    } catch (error) {
      console.log('❌ Categories API Error:', error.response?.data || error.message);
    }
    
    // Test 3: Regular Categories API
    console.log('\n3. Testing Regular Categories API...');
    try {
      const regularCategoriesResponse = await axios.get('http://localhost:3000/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Regular Categories API Response:');
      console.log('   Status:', regularCategoriesResponse.status);
      console.log('   Data structure:', Object.keys(regularCategoriesResponse.data));
      console.log('   Categories count:', regularCategoriesResponse.data.categories?.length || 0);
      
      if (regularCategoriesResponse.data.categories && regularCategoriesResponse.data.categories.length > 0) {
        console.log('   Sample category:', regularCategoriesResponse.data.categories[0]);
      }
    } catch (error) {
      console.log('❌ Regular Categories API Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
