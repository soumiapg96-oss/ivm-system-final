// Test setup file
process.env.NODE_ENV = 'test';
process.env.PORT = 3002; // Use different port for testing
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 5433;
process.env.DB_NAME = 'inventory_db';
process.env.DB_USER = 'inventory_user';
process.env.DB_PASSWORD = 'inventory_password';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';

// Increase timeout for all tests
jest.setTimeout(30000);
