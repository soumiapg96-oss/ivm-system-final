const request = require('supertest');
const app = require('../../server');

describe('Inventory Management System API Integration Tests', () => {
  let adminToken;
  let userToken;

  // Test data
  const testData = {
    validProduct: {
      name: 'Integration Test Product',
      categoryId: 1,
      quantity: 10,
      price: 29.99,
      lowStockThreshold: 5,
      description: 'A product for integration testing',
      active: true
    },
    validCategory: {
      name: 'Integration Test Category',
      description: 'A category for integration testing'
    },
    validUser: {
      email: 'integration-test@example.com',
      password: 'TestPass123',
      role: 'user'
    },
    validQuantityUpdate: {
      quantityChange: 5,
      reasonCode: 'purchase',
      reasonDescription: 'Integration test purchase'
    }
  };

  beforeAll(async () => {
    // Get admin token for testing
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@inventory.com',
        password: 'Admin123!'
      });
    
    adminToken = adminResponse.body.accessToken;
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@inventory.com',
            password: 'Admin123!'
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', 'admin@inventory.com');
        expect(response.body.user).toHaveProperty('role', 'admin');
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@inventory.com',
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@inventory.com'
            // missing password
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');
      });
    });

    describe('POST /api/auth/register', () => {
      it('should register new user with valid data', async () => {
        // Use a unique email to avoid conflicts
        const uniqueEmail = `integration-test-${Date.now()}@example.com`;
        const userData = {
          ...testData.validUser,
          email: uniqueEmail
        };

        const response = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(userData)
          .expect(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', uniqueEmail);
        expect(response.body.user).toHaveProperty('role', testData.validUser.role);
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('createdAt');
        expect(response.body.user).toHaveProperty('updatedAt');
      });

      it('should reject backend-generated fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validUser,
            email: 'test2@example.com',
            id: '550e8400-e29b-41d4-a716-446655440002',
            createdAt: '2024-01-01T00:00:00Z'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({ field: 'id', message: '"id" is not allowed' })
        );
      });

      it('should reject duplicate email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validUser,
            email: 'admin@inventory.com' // existing email
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
      });

      it('should require admin access', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testData.validUser)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh token with valid refresh token', async () => {
        // First login to get refresh token
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@inventory.com',
            password: 'Admin123!'
          });

        const refreshToken = loginResponse.body.refreshToken;

        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      });

      it('should reject invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should get current user profile', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', 'admin@inventory.com');
        expect(response.body.user).toHaveProperty('role', 'admin');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Product Endpoints', () => {
    describe('POST /api/products', () => {
      it('should create product with valid data', async () => {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testData.validProduct)
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('product');
        expect(response.body.product).toHaveProperty('id');
        expect(response.body.product).toHaveProperty('name', testData.validProduct.name);
        expect(response.body.product).toHaveProperty('categoryId', testData.validProduct.categoryId);
        expect(response.body.product).toHaveProperty('quantity', testData.validProduct.quantity);
        expect(response.body.product).toHaveProperty('price', testData.validProduct.price);
        expect(response.body.product).toHaveProperty('createdAt');
        expect(response.body.product).toHaveProperty('updatedAt');
      });

      it('should reject backend-generated fields', async () => {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Another Test Product',
            id: 999,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({ field: 'id', message: '"id" is not allowed' })
        );
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Product'
            // missing required fields
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/products')
          .send(testData.validProduct)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/products', () => {
      it('should get products with pagination', async () => {
        const response = await request(app)
          .get('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination).toHaveProperty('page', 1);
        expect(response.body.pagination).toHaveProperty('limit', 5);
        expect(response.body.pagination).toHaveProperty('total');
        expect(response.body.pagination).toHaveProperty('totalPages');
        expect(Array.isArray(response.body.products)).toBe(true);
      });

      it('should filter by category', async () => {
        const response = await request(app)
          .get('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ categoryId: 1 })
          .expect(200);

        expect(response.body).toHaveProperty('products');
        expect(Array.isArray(response.body.products)).toBe(true);
      });

      it('should search by name', async () => {
        const response = await request(app)
          .get('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ search: 'Laptop' })
          .expect(200);

        expect(response.body).toHaveProperty('products');
        expect(Array.isArray(response.body.products)).toBe(true);
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/products')
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/products/:id', () => {
      it('should get product by ID', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Get Test Product'
          });

        const productId = createResponse.body.product.id;

        const response = await request(app)
          .get(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('product');
        expect(response.body.product).toHaveProperty('id', productId);
        expect(response.body.product).toHaveProperty('name');
        expect(response.body.product).toHaveProperty('categoryId');
        expect(response.body.product).toHaveProperty('quantity');
        expect(response.body.product).toHaveProperty('price');

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app)
          .get('/api/products/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('message');
      });
    });

    describe('PUT /api/products/:id', () => {
      it('should update product with valid data', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Update Test Product'
          });

        const productId = createResponse.body.product.id;

        const updateData = {
          name: 'Updated Integration Test Product',
          price: 39.99
        };

        const response = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('product');
        expect(response.body.product).toHaveProperty('name', updateData.name);
        expect(response.body.product).toHaveProperty('price', updateData.price);

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });

      it('should reject backend-generated fields', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Update Test Product 2'
          });

        const productId = createResponse.body.product.id;

        const response = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Update',
            id: 999,
            createdAt: '2024-01-01T00:00:00Z'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('PUT /api/products/:id/quantity', () => {
      it('should update quantity with valid data', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Quantity Test Product'
          });

        const productId = createResponse.body.product.id;

        const response = await request(app)
          .put(`/api/products/${productId}/quantity`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testData.validQuantityUpdate)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('product');
        expect(response.body.product).toHaveProperty('quantity');

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });

      it('should reject invalid reason code', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Quantity Test Product 2'
          });

        const productId = createResponse.body.product.id;

        const response = await request(app)
          .put(`/api/products/${productId}/quantity`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validQuantityUpdate,
            reasonCode: 'invalid_reason'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('DELETE /api/products/:id', () => {
      it('should soft delete product', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Delete Test Product'
          });

        const productId = createResponse.body.product.id;

        const response = await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
      });

      it('should not return deleted product in list', async () => {
        // First create a product
        const createResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validProduct,
            name: 'Delete Test Product 2'
          });

        const productId = createResponse.body.product.id;

        // Delete the product
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);

        // Check that it's not in the list
        const listResponse = await request(app)
          .get('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const deletedProduct = listResponse.body.products.find(p => p.id === productId);
        expect(deletedProduct).toBeUndefined();
      });
    });
  });

  describe('Category Endpoints', () => {
    describe('POST /api/categories', () => {
      it('should create category with valid data', async () => {
        const response = await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validCategory,
            name: 'Unique Test Category'
          })
          .expect(201);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('category');
        expect(response.body.category).toHaveProperty('id');
        expect(response.body.category).toHaveProperty('name', 'Unique Test Category');
        expect(response.body.category).toHaveProperty('description', testData.validCategory.description);
        expect(response.body.category).toHaveProperty('createdAt');
        expect(response.body.category).toHaveProperty('updatedAt');

        // Cleanup
        await request(app)
          .delete(`/api/categories/${response.body.category.id}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });

      it('should reject backend-generated fields', async () => {
        const response = await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validCategory,
            name: 'Another Test Category',
            id: 999,
            createdAt: '2024-01-01T00:00:00Z'
          })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Validation failed');
      });
    });

    describe('GET /api/categories', () => {
      it('should get categories with pagination', async () => {
        const response = await request(app)
          .get('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body).toHaveProperty('categories');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.categories)).toBe(true);
      });
    });

    describe('GET /api/categories/:id', () => {
      it('should get category by ID', async () => {
        // First create a category
        const createResponse = await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validCategory,
            name: 'Get Test Category'
          });

        const categoryId = createResponse.body.category.id;

        const response = await request(app)
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('category');
        expect(response.body.category).toHaveProperty('id', categoryId);
        expect(response.body.category).toHaveProperty('name');
        expect(response.body.category).toHaveProperty('description');

        // Cleanup
        await request(app)
          .delete(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('PUT /api/categories/:id', () => {
      it('should update category with valid data', async () => {
        // First create a category
        const createResponse = await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validCategory,
            name: 'Update Test Category'
          });

        const categoryId = createResponse.body.category.id;

        const updateData = {
          name: 'Updated Integration Test Category',
          description: 'Updated description'
        };

        const response = await request(app)
          .put(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('category');
        expect(response.body.category).toHaveProperty('name', updateData.name);
        expect(response.body.category).toHaveProperty('description', updateData.description);

        // Cleanup
        await request(app)
          .delete(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('DELETE /api/categories/:id', () => {
      it('should delete category', async () => {
        // First create a category
        const createResponse = await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validCategory,
            name: 'Delete Test Category'
          });

        const categoryId = createResponse.body.category.id;

        const response = await request(app)
          .delete(`/api/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('User Management Endpoints', () => {
    describe('GET /api/users', () => {
      it('should get users with pagination', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 5 })
          .expect(200);

        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.users)).toBe(true);
      });

      it('should require admin access', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/users/:id', () => {
      it('should get user by ID', async () => {
        // First create a user
        const createResponse = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validUser,
            email: 'get-test@example.com'
          });

        const userId = createResponse.body.user.id;

        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id', userId);
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('role');
        expect(response.body.user).not.toHaveProperty('password');

        // Cleanup
        await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should update user with valid data', async () => {
        // First create a user
        const createResponse = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validUser,
            email: 'update-test@example.com'
          });

        const userId = createResponse.body.user.id;

        const updateData = {
          email: 'updated-integration-test@example.com',
          role: 'admin'
        };

        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', updateData.email);
        expect(response.body.user).toHaveProperty('role', updateData.role);

        // Cleanup
        await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should delete user', async () => {
        // First create a user
        const createResponse = await request(app)
          .post('/api/auth/register')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            ...testData.validUser,
            email: 'delete-test@example.com'
          });

        const userId = createResponse.body.user.id;

        const response = await request(app)
          .delete(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('Reports Endpoints', () => {
    describe('GET /api/reports/stock-levels', () => {
      it('should get stock levels report', async () => {
        const response = await request(app)
          .get('/api/reports/stock-levels')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('summary');
        expect(response.body).toHaveProperty('products');
        expect(response.body.summary).toHaveProperty('total_products');
        expect(response.body.summary).toHaveProperty('out_of_stock');
        expect(response.body.summary).toHaveProperty('low_stock');
        expect(response.body.summary).toHaveProperty('in_stock');
        expect(response.body.summary).toHaveProperty('total_value');
        expect(Array.isArray(response.body.products)).toBe(true);
      });
    });

    describe('GET /api/reports/inventory-value', () => {
      it('should get inventory value report', async () => {
        const response = await request(app)
          .get('/api/reports/inventory-value')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('overall_summary');
        expect(response.body).toHaveProperty('categories');
        expect(response.body.overall_summary).toHaveProperty('total_categories');
        expect(response.body.overall_summary).toHaveProperty('total_products');
        expect(response.body.overall_summary).toHaveProperty('total_quantity');
        expect(response.body.overall_summary).toHaveProperty('total_value');
        expect(Array.isArray(response.body.categories)).toBe(true);
      });
    });

    describe('GET /api/reports/products/:id/quantity-history', () => {
      it('should get quantity history for product', async () => {
        // Create a test product first
        const productResponse = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'History Test Product',
            categoryId: 1,
            quantity: 10,
            price: 19.99
          });

        const productId = productResponse.body.product.id;

        // Update quantity to create history
        await request(app)
          .put(`/api/products/${productId}/quantity`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(testData.validQuantityUpdate);

        const response = await request(app)
          .get(`/api/reports/products/${productId}/quantity-history`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('history');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.history)).toBe(true);

        // Cleanup
        await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      });
    });
  });

  describe('Health and Public Endpoints', () => {
    describe('GET /', () => {
      it('should return API info', async () => {
        const response = await request(app)
          .get('/')
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('version');
      });
    });

    describe('GET /health', () => {
      it('should return health status', async () => {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
  });
});
