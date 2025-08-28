# 🚀 Inventory Management System - Access Information

## ✅ Services Status
All services are running successfully with the following port mappings:

### 🌐 Web Services
- **API Server**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api-docs
- **Adminer (Database Management)**: http://localhost:8080

### 🗄️ Database
- **PostgreSQL**: localhost:5433 (internal: 5432)

## 📊 Available Endpoints

### 🔐 Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile

### 📦 Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Soft delete product (Admin only)
- `PUT /api/products/:id/quantity` - Update quantity with reason tracking (Admin only)
- `GET /api/products/:id/transactions` - Get product transaction history
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/out-of-stock` - Get out of stock products
- `GET /api/products/inventory/summary` - Get inventory summary

### 📂 Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### 📈 Reports
- `GET /api/reports/stock-levels` - Get comprehensive stock levels report
- `GET /api/reports/inventory-value` - Get inventory value report by category
- `GET /api/reports/products/:id/quantity-history` - Get quantity history for a product

### 👥 Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔑 Default Credentials
- **Email**: admin@inventory.com
- **Password**: Admin123!

## 🧪 Quick Test Commands

### Test API Health
```bash
curl http://localhost:3001/health
```

### Test Authentication
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"Admin123!"}'
```

### Test Stock Levels Report (requires token)
```bash
# First get token from login, then use it:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/reports/stock-levels
```

### Test Inventory Value Report (requires token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/reports/inventory-value
```

## 🗄️ Database Access via Adminer
1. Open http://localhost:8080 in your browser
2. Use these connection details:
   - **System**: PostgreSQL
   - **Server**: postgres
   - **Username**: inventory_user
   - **Password**: inventory_password
   - **Database**: inventory_db

## 📋 Sample Data
The system comes pre-loaded with:
- **10 Categories**: Electronics, Clothing, Books, Home & Garden, Sports, Automotive, Health & Beauty, Toys & Games, Office Supplies, Food & Beverages
- **50 Products**: Various items across all categories with different stock levels and prices
- **1 Admin User**: admin@inventory.com

## 🔧 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs api
docker-compose logs postgres
docker-compose logs adminer
```

### Restart Services
```bash
docker-compose restart
```

## 🚨 Troubleshooting

### Port Conflicts
If you encounter port conflicts, the services are configured to use:
- API: 3001 (instead of 3000)
- PostgreSQL: 5433 (instead of 5432)
- Adminer: 8080

### Authentication Issues
If login fails, check:
1. Database is running: `docker-compose ps`
2. Seed data is loaded: Check Adminer at http://localhost:8080
3. Password hash is correct in migrations/002_seed_data.sql

### Service Health
Check service status:
```bash
docker-compose ps
```

All services should show "Up (healthy)" status.

## 📚 Documentation
- **API Documentation**: http://localhost:3001/api-docs
- **Swagger UI**: Interactive API testing interface
- **Database Schema**: Check Adminer for table structures
- **Audit Trail**: All quantity changes are tracked in `quantity_history` table
