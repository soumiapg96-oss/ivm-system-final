const request = require('supertest');
const app = require('../server');

describe('Reports Endpoints', () => {
  let adminToken;
  let userToken;
  let testProductId;

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

    // Get a test product ID from the existing products
    const productsResponse = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${userToken}`);
    testProductId = productsResponse.body.products[0].id;
  });

  describe('GET /api/reports/stock-levels', () => {
    it('should get comprehensive stock levels report', async () => {
      const response = await request(app)
        .get('/api/reports/stock-levels')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Stock levels report generated successfully');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('products');

      // Check summary structure
      expect(response.body.summary).toHaveProperty('total_products');
      expect(response.body.summary).toHaveProperty('out_of_stock');
      expect(response.body.summary).toHaveProperty('low_stock');
      expect(response.body.summary).toHaveProperty('in_stock');
      expect(response.body.summary).toHaveProperty('total_value');

      // Check products array
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.products.length).toBeGreaterThan(0);

      // Check product structure
      const product = response.body.products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category_name');
      expect(product).toHaveProperty('quantity');
      expect(product).toHaveProperty('low_stock_threshold');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('total_value');
      expect(product).toHaveProperty('stock_status');
      expect(['Out of Stock', 'Low Stock', 'In Stock']).toContain(product.stock_status);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/stock-levels')
        .expect(401);
    });
  });

  describe('GET /api/reports/inventory-value', () => {
    it('should get inventory value report by category', async () => {
      const response = await request(app)
        .get('/api/reports/inventory-value')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Inventory value report generated successfully');
      expect(response.body).toHaveProperty('overall_summary');
      expect(response.body).toHaveProperty('categories');

      // Check overall summary structure
      expect(response.body.overall_summary).toHaveProperty('total_categories');
      expect(response.body.overall_summary).toHaveProperty('total_products');
      expect(response.body.overall_summary).toHaveProperty('total_quantity');
      expect(response.body.overall_summary).toHaveProperty('total_value');
      expect(response.body.overall_summary).toHaveProperty('average_value_per_category');

      // Check categories array
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);

      // Check category structure
      const category = response.body.categories[0];
      expect(category).toHaveProperty('category_id');
      expect(category).toHaveProperty('category_name');
      expect(category).toHaveProperty('product_count');
      expect(category).toHaveProperty('total_quantity');
      expect(category).toHaveProperty('total_value');
      expect(category).toHaveProperty('average_price');
      expect(category).toHaveProperty('out_of_stock_count');
      expect(category).toHaveProperty('low_stock_count');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/inventory-value')
        .expect(401);
    });
  });

  describe('GET /api/reports/products/:id/quantity-history', () => {
    it('should get quantity history for a product', async () => {
      const response = await request(app)
        .get(`/api/reports/products/${testProductId}/quantity-history`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Quantity history retrieved successfully');
      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('pagination');

      // Check pagination structure
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');

      // Check history array
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('should get quantity history with pagination', async () => {
      const response = await request(app)
        .get(`/api/reports/products/${testProductId}/quantity-history?page=1&limit=5`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/reports/products/99999/quantity-history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get(`/api/reports/products/${testProductId}/quantity-history`)
        .expect(401);
    });
  });

  describe('Quantity History Integration', () => {
    it('should create quantity history when updating product quantity', async () => {
      // First, update a product quantity
      const quantityData = {
        quantityChange: 5,
        reasonCode: 'purchase',
        reasonDescription: 'Test purchase for audit trail'
      };

      await request(app)
        .put(`/api/products/${testProductId}/quantity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(quantityData)
        .expect(200);

      // Then check the quantity history
      const historyResponse = await request(app)
        .get(`/api/reports/products/${testProductId}/quantity-history`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(historyResponse.body.history.length).toBeGreaterThan(0);
      
      const latestRecord = historyResponse.body.history[0];
      expect(latestRecord).toHaveProperty('product_id', testProductId);
      expect(latestRecord).toHaveProperty('change', 5);
      expect(latestRecord).toHaveProperty('reason', 'purchase');
      expect(latestRecord).toHaveProperty('user_email');
      expect(latestRecord).toHaveProperty('timestamp');
    });
  });
});
