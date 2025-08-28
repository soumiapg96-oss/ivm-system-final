const request = require('supertest');
const app = require('../server');

describe('Products Endpoints', () => {
  let adminToken;
  let userToken;
  let testProductId;
  let testCategoryId;

  beforeAll(async () => {
    // Login as admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@inventory.com',
        password: 'Admin123!'
      });
    adminToken = adminResponse.body.accessToken;

    // Create a test user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'user@test.com',
        password: 'UserPass123',
        role: 'user'
      });
    userToken = userResponse.body.accessToken;

    // Create a test category
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category',
        description: 'Test category for products'
      });
    testCategoryId = categoryResponse.body.category.id;
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully (admin only)', async () => {
      const productData = {
        name: 'Test Product',
        categoryId: testCategoryId,
        quantity: 50,
        price: 29.99,
        lowStockThreshold: 10,
        description: 'A test product',
        active: true
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Product created successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe(productData.name);
      expect(response.body.product.categoryId).toBe(testCategoryId);
      expect(response.body.product.quantity).toBe(productData.quantity);
      expect(response.body.product.price).toBe(productData.price);
      expect(response.body.product.lowStockThreshold).toBe(productData.lowStockThreshold);
      expect(response.body.product.active).toBe(productData.active);

      testProductId = response.body.product.id;
    });

    it('should return 403 for non-admin users', async () => {
      const productData = {
        name: 'Test Product 2',
        categoryId: testCategoryId,
        quantity: 25,
        price: 19.99
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);
    });

    it('should return 400 for invalid category ID', async () => {
      const productData = {
        name: 'Test Product',
        categoryId: 99999,
        quantity: 50,
        price: 29.99
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${testCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.products.every(p => p.categoryId === testCategoryId)).toBe(true);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Test')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.products.some(p => p.name.includes('Test'))).toBe(true);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/products?active=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.products.every(p => p.active === true)).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=20&maxPrice=30')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.products.every(p => p.price >= 20 && p.price <= 30)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.id).toBe(testProductId);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product successfully (admin only)', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 39.99,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product updated successfully');
      expect(response.body.product.name).toBe(updateData.name);
      expect(response.body.product.price).toBe(updateData.price);
      expect(response.body.product.description).toBe(updateData.description);
    });

    it('should return 403 for non-admin users', async () => {
      const updateData = { name: 'Unauthorized Update' };

      await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('PUT /api/products/:id/quantity', () => {
    it('should update quantity with sale reason', async () => {
      const quantityData = {
        quantityChange: -5,
        reasonCode: 'sale',
        reasonDescription: 'Sold 5 units'
      };

      const response = await request(app)
        .put(`/api/products/${testProductId}/quantity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quantityData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product quantity updated successfully');
      expect(response.body).toHaveProperty('quantityChange', -5);
      expect(response.body).toHaveProperty('reasonCode', 'sale');
    });

    it('should update quantity with purchase reason', async () => {
      const quantityData = {
        quantityChange: 10,
        reasonCode: 'purchase',
        reasonDescription: 'Purchased 10 units'
      };

      const response = await request(app)
        .put(`/api/products/${testProductId}/quantity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quantityData)
        .expect(200);

      expect(response.body).toHaveProperty('quantityChange', 10);
      expect(response.body).toHaveProperty('reasonCode', 'purchase');
    });

    it('should return 400 for insufficient stock', async () => {
      const quantityData = {
        quantityChange: -1000,
        reasonCode: 'sale',
        reasonDescription: 'Attempt to sell more than available'
      };

      await request(app)
        .put(`/api/products/${testProductId}/quantity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quantityData)
        .expect(400);
    });

    it('should return 400 for invalid reason code', async () => {
      const quantityData = {
        quantityChange: 5,
        reasonCode: 'invalid',
        reasonDescription: 'Invalid reason'
      };

      await request(app)
        .put(`/api/products/${testProductId}/quantity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quantityData)
        .expect(400);
    });
  });

  describe('GET /api/products/:id/transactions', () => {
    it('should get product transaction history', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}/transactions`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.transactions)).toBe(true);
      expect(response.body.transactions.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/low-stock', () => {
    it('should get low stock products', async () => {
      const response = await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('GET /api/products/out-of-stock', () => {
    it('should get out of stock products', async () => {
      const response = await request(app)
        .get('/api/products/out-of-stock')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('GET /api/products/inventory/summary', () => {
    it('should get inventory summary', async () => {
      const response = await request(app)
        .get('/api/products/inventory/summary')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('total_products');
      expect(response.body.summary).toHaveProperty('out_of_stock');
      expect(response.body.summary).toHaveProperty('low_stock');
      expect(response.body.summary).toHaveProperty('active_products');
      expect(response.body.summary).toHaveProperty('total_value');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft delete product (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product deleted successfully');
      expect(response.body).toHaveProperty('productId', testProductId);
    });

    it('should return 403 for non-admin users', async () => {
      await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should not return deleted product in list', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const deletedProduct = response.body.products.find(p => p.id === testProductId);
      expect(deletedProduct).toBeUndefined();
    });
  });
});
