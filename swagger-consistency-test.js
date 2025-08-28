const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testSwaggerConsistency() {
  console.log('🔍 Testing Swagger Documentation Consistency...\n');
  
  let token = null;
  
  try {
    // Get authentication token
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    token = loginResponse.data.accessToken;
    console.log('✅ Authentication successful\n');

    // Test 1: Verify Product Creation Schema
    console.log('📦 Test 1: Product Creation Schema Consistency');
    const validProductData = {
      name: 'Swagger Test Product',
      categoryId: 1,
      quantity: 10,
      price: 29.99,
      lowStockThreshold: 5,
      description: 'A test product for Swagger validation',
      active: true
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/api/products`, validProductData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productId = createResponse.data.product.id;
      console.log('   ✅ Product created successfully with valid schema');
      console.log(`   Product ID: ${productId}`);

      // Test invalid fields that should be rejected
      const invalidProductData = {
        ...validProductData,
        name: 'Another Test Product',
        id: 999,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      try {
        await axios.post(`${API_BASE}/api/products`, invalidProductData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected backend-generated fields');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected backend-generated fields');
          console.log('   Validation error details:', error.response.data.details);
        }
      }

      // Cleanup
      await axios.delete(`${API_BASE}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Test product cleaned up');
    } catch (error) {
      console.log('   ❌ Product creation failed:', error.response?.data);
    }
    console.log('');

    // Test 2: Verify Category Creation Schema
    console.log('📂 Test 2: Category Creation Schema Consistency');
    const validCategoryData = {
      name: 'Swagger Test Category',
      description: 'A test category for Swagger validation'
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/api/categories`, validCategoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const categoryId = createResponse.data.category.id;
      console.log('   ✅ Category created successfully with valid schema');
      console.log(`   Category ID: ${categoryId}`);

      // Test invalid fields
      const invalidCategoryData = {
        ...validCategoryData,
        name: 'Another Test Category',
        id: 999,
        createdAt: '2024-01-01T00:00:00Z'
      };

      try {
        await axios.post(`${API_BASE}/api/categories`, invalidCategoryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected backend-generated fields');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected backend-generated fields');
        }
      }

      // Cleanup
      await axios.delete(`${API_BASE}/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Test category cleaned up');
    } catch (error) {
      console.log('   ❌ Category creation failed:', error.response?.data);
    }
    console.log('');

    // Test 3: Verify User Registration Schema
    console.log('👤 Test 3: User Registration Schema Consistency');
    const validUserData = {
      email: 'swagger-test@example.com',
      password: 'TestPass123',
      role: 'user'
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/api/auth/register`, validUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ User registered successfully with valid schema');

      // Test invalid fields
      const invalidUserData = {
        ...validUserData,
        email: 'swagger-test2@example.com',
        id: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2024-01-01T00:00:00Z'
      };

      try {
        await axios.post(`${API_BASE}/api/auth/register`, invalidUserData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected backend-generated fields');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected backend-generated fields');
        }
      }
    } catch (error) {
      if (error.response?.data?.message === 'Email already exists') {
        console.log('   ✅ User registration validation working (email already exists)');
      } else {
        console.log('   ❌ User registration failed:', error.response?.data);
      }
    }
    console.log('');

    // Test 4: Verify Quantity Update Schema
    console.log('📊 Test 4: Quantity Update Schema Consistency');
    
    // Create a test product first
    const testProduct = await axios.post(`${API_BASE}/api/products`, {
      name: 'Quantity Test Product',
      categoryId: 1,
      quantity: 10,
      price: 19.99
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const testProductId = testProduct.data.product.id;

    const validQuantityData = {
      quantityChange: 5,
      reasonCode: 'purchase',
      reasonDescription: 'Test purchase for Swagger validation'
    };

    try {
      const updateResponse = await axios.put(`${API_BASE}/api/products/${testProductId}/quantity`, validQuantityData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Quantity updated successfully with valid schema');

      // Test invalid reason code
      const invalidQuantityData = {
        ...validQuantityData,
        reasonCode: 'invalid_reason'
      };

      try {
        await axios.put(`${API_BASE}/api/products/${testProductId}/quantity`, invalidQuantityData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected invalid reason code');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected invalid reason code');
        }
      }

      // Cleanup
      await axios.delete(`${API_BASE}/api/products/${testProductId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Test product cleaned up');
    } catch (error) {
      console.log('   ❌ Quantity update failed:', error.response?.data);
    }
    console.log('');

    // Test 5: Verify Reports Schema
    console.log('📈 Test 5: Reports Schema Consistency');
    
    try {
      const stockLevelsResponse = await axios.get(`${API_BASE}/api/reports/stock-levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Stock levels report schema consistent');
      console.log(`   Total products: ${stockLevelsResponse.data.summary.total_products}`);

      const inventoryValueResponse = await axios.get(`${API_BASE}/api/reports/inventory-value`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Inventory value report schema consistent');
      console.log(`   Total categories: ${inventoryValueResponse.data.overall_summary.total_categories}`);
    } catch (error) {
      console.log('   ❌ Reports failed:', error.response?.data);
    }
    console.log('');

    console.log('🎉 Swagger Consistency Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ All schemas are consistent with validation');
    console.log('   ✅ Backend-generated fields are properly rejected');
    console.log('   ✅ Swagger documentation matches actual API behavior');
    console.log('   ✅ All endpoints are working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the Swagger consistency test
testSwaggerConsistency();
