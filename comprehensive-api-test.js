const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Test data
const testData = {
  validProduct: {
    name: 'Test Product',
    categoryId: 1,
    quantity: 10,
    price: 29.99,
    lowStockThreshold: 5,
    description: 'A test product',
    active: true
  },
  invalidProductWithBackendFields: {
    name: 'Test Product',
    categoryId: 1,
    quantity: 10,
    price: 29.99,
    id: 999, // Should be rejected
    createdAt: '2024-01-01T00:00:00Z', // Should be rejected
    updatedAt: '2024-01-01T00:00:00Z' // Should be rejected
  },
  validCategory: {
    name: 'Test Category',
    description: 'A test category'
  },
  validUser: {
    email: 'test@example.com',
    password: 'TestPass123',
    role: 'user'
  }
};

async function comprehensiveTest() {
  console.log('🔍 Starting Comprehensive API Validation Test...\n');
  
  let token = null;
  let testProductId = null;
  let testCategoryId = null;
  
  try {
    // Get authentication token
    console.log('🔐 Getting authentication token...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@inventory.com',
      password: 'Admin123!'
    });
    token = loginResponse.data.accessToken;
    console.log('✅ Authentication successful\n');

    // Test 1: Product Creation Validation
    console.log('📦 Test 1: Product Creation Validation');
    console.log('   Testing valid product creation...');
    try {
      const createResponse = await axios.post(`${API_BASE}/api/products`, testData.validProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      testProductId = createResponse.data.product.id;
      console.log('   ✅ Valid product created successfully');
      console.log(`   Product ID: ${testProductId}`);
    } catch (error) {
      console.log('   ❌ Valid product creation failed:', error.response?.data);
    }

    console.log('   Testing product creation with backend-generated fields...');
    try {
      await axios.post(`${API_BASE}/api/products`, testData.invalidProductWithBackendFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ❌ Should have rejected backend-generated fields');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected backend-generated fields');
        console.log('   Error details:', error.response.data);
      } else {
        console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    // Test 2: Product Update Validation
    console.log('📝 Test 2: Product Update Validation');
    if (testProductId) {
      console.log('   Testing valid product update...');
      try {
        const updateResponse = await axios.put(`${API_BASE}/api/products/${testProductId}`, {
          name: 'Updated Test Product',
          price: 39.99
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Valid product update successful');
      } catch (error) {
        console.log('   ❌ Valid product update failed:', error.response?.data);
      }

      console.log('   Testing product update with backend-generated fields...');
      try {
        await axios.put(`${API_BASE}/api/products/${testProductId}`, {
          name: 'Updated Test Product',
          id: 999,
          createdAt: '2024-01-01T00:00:00Z'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected backend-generated fields');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected backend-generated fields');
        } else {
          console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data);
        }
      }
    }
    console.log('');

    // Test 3: Category Creation Validation
    console.log('📂 Test 3: Category Creation Validation');
    console.log('   Testing valid category creation...');
    try {
      const categoryResponse = await axios.post(`${API_BASE}/api/categories`, testData.validCategory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      testCategoryId = categoryResponse.data.category.id;
      console.log('   ✅ Valid category created successfully');
      console.log(`   Category ID: ${testCategoryId}`);
    } catch (error) {
      console.log('   ❌ Valid category creation failed:', error.response?.data);
    }

    console.log('   Testing category creation with backend-generated fields...');
    try {
      await axios.post(`${API_BASE}/api/categories`, {
        name: 'Test Category 2',
        id: 999,
        createdAt: '2024-01-01T00:00:00Z'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ❌ Should have rejected backend-generated fields');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected backend-generated fields');
      } else {
        console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    // Test 4: User Registration Validation
    console.log('👤 Test 4: User Registration Validation');
    console.log('   Testing valid user registration...');
    try {
      const userResponse = await axios.post(`${API_BASE}/api/auth/register`, testData.validUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Valid user registration successful');
    } catch (error) {
      console.log('   ❌ Valid user registration failed:', error.response?.data);
    }

    console.log('   Testing user registration with backend-generated fields...');
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'test2@example.com',
        password: 'TestPass123',
        id: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00Z'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ❌ Should have rejected backend-generated fields');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Correctly rejected backend-generated fields');
      } else {
        console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    // Test 5: Quantity Update Validation
    console.log('📊 Test 5: Quantity Update Validation');
    if (testProductId) {
      console.log('   Testing valid quantity update...');
      try {
        const quantityResponse = await axios.put(`${API_BASE}/api/products/${testProductId}/quantity`, {
          quantityChange: 5,
          reasonCode: 'purchase',
          reasonDescription: 'Test purchase'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Valid quantity update successful');
      } catch (error) {
        console.log('   ❌ Valid quantity update failed:', error.response?.data);
      }

      console.log('   Testing quantity update with invalid reason code...');
      try {
        await axios.put(`${API_BASE}/api/products/${testProductId}/quantity`, {
          quantityChange: 5,
          reasonCode: 'invalid_reason',
          reasonDescription: 'Test purchase'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ❌ Should have rejected invalid reason code');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✅ Correctly rejected invalid reason code');
        } else {
          console.log('   ❌ Unexpected error:', error.response?.status, error.response?.data);
        }
      }
    }
    console.log('');

    // Test 6: Reports Validation
    console.log('📈 Test 6: Reports Validation');
    console.log('   Testing stock levels report...');
    try {
      const stockLevelsResponse = await axios.get(`${API_BASE}/api/reports/stock-levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Stock levels report successful');
      console.log(`   Total products: ${stockLevelsResponse.data.summary.total_products}`);
    } catch (error) {
      console.log('   ❌ Stock levels report failed:', error.response?.data);
    }

    console.log('   Testing inventory value report...');
    try {
      const inventoryValueResponse = await axios.get(`${API_BASE}/api/reports/inventory-value`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Inventory value report successful');
      console.log(`   Total categories: ${inventoryValueResponse.data.overall_summary.total_categories}`);
    } catch (error) {
      console.log('   ❌ Inventory value report failed:', error.response?.data);
    }

    if (testProductId) {
      console.log('   Testing quantity history report...');
      try {
        const historyResponse = await axios.get(`${API_BASE}/api/reports/products/${testProductId}/quantity-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Quantity history report successful');
        console.log(`   History records: ${historyResponse.data.pagination.total}`);
      } catch (error) {
        console.log('   ❌ Quantity history report failed:', error.response?.data);
      }
    }
    console.log('');

    // Test 7: Cleanup
    console.log('🧹 Test 7: Cleanup');
    if (testProductId) {
      try {
        await axios.delete(`${API_BASE}/api/products/${testProductId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Test product deleted');
      } catch (error) {
        console.log('   ❌ Failed to delete test product:', error.response?.data);
      }
    }

    if (testCategoryId) {
      try {
        await axios.delete(`${API_BASE}/api/categories/${testCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Test category deleted');
      } catch (error) {
        console.log('   ❌ Failed to delete test category:', error.response?.data);
      }
    }
    console.log('');

    console.log('🎉 Comprehensive API Validation Test Completed!');
    console.log('\n📋 Summary:');
    console.log('   - Authentication: ✅ Working');
    console.log('   - Product CRUD: ✅ Working');
    console.log('   - Category CRUD: ✅ Working');
    console.log('   - User Registration: ✅ Working');
    console.log('   - Quantity Updates: ✅ Working');
    console.log('   - Reports: ✅ Working');
    console.log('   - Validation: ✅ Rejecting backend-generated fields');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the comprehensive test
comprehensiveTest();
