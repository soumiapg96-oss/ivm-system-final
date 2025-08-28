# Quick Test Examples - Backend Modules

## 🔑 Get Authentication Token

```bash
# Login and get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "Admin123!"
  }'

# Extract token (save to variable)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "Admin123!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
```

## 📦 Products Module Tests

### Get All Products
```bash
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Get Products with Search
```bash
curl -X GET "http://localhost:3001/api/products?search=laptop" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laptop",
    "categoryId": 1,
    "quantity": 10,
    "price": 999.99,
    "lowStockThreshold": 5,
    "description": "High-performance laptop for testing"
  }'
```

### Update Product
```bash
curl -X PUT http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "price": 1299.99
  }'
```

### Update Product Quantity
```bash
curl -X PATCH http://localhost:3001/api/products/1/quantity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5,
    "reason": "Stock adjustment"
  }'
```

### Get Low Stock Products
```bash
curl -X GET http://localhost:3001/api/products/low-stock \
  -H "Authorization: Bearer $TOKEN"
```

### Get Inventory Summary
```bash
curl -X GET http://localhost:3001/api/products/inventory/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Product
```bash
curl -X DELETE http://localhost:3001/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 📂 Categories Module Tests

### Get All Categories
```bash
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Get Categories with Product Count
```bash
curl -X GET http://localhost:3001/api/categories/all \
  -H "Authorization: Bearer $TOKEN"
```

### Create Category
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Category",
    "description": "Category for testing purposes"
  }'
```

### Update Category
```bash
curl -X PUT http://localhost:3001/api/categories/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category",
    "description": "Updated description"
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:3001/api/categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 👥 Users Module Tests (Admin Only)

### Get All Users
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Get User by ID
```bash
curl -X GET http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Reports Module Tests

### Get Stock Levels Report
```bash
curl -X GET http://localhost:3001/api/reports/stock-levels \
  -H "Authorization: Bearer $TOKEN"
```

### Get Inventory Value Report
```bash
curl -X GET http://localhost:3001/api/reports/inventory-value \
  -H "Authorization: Bearer $TOKEN"
```

### Get Product Quantity History
```bash
curl -X GET http://localhost:3001/api/reports/products/1/quantity-history \
  -H "Authorization: Bearer $TOKEN"
```

## 🔐 Authentication Tests

### Register New User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "role": "user"
  }'
```

### Get Current User Info
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

## 🧪 Complete Test Script

```bash
#!/bin/bash

# Get authentication token
echo "🔐 Getting authentication token..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "Admin123!"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    exit 1
fi

echo "✅ Token obtained successfully"

# Test Products API
echo -e "\n📦 Testing Products API..."
curl -s -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" | head -c 100

# Test Categories API
echo -e "\n📂 Testing Categories API..."
curl -s -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer $TOKEN" | head -c 100

# Test Users API
echo -e "\n👥 Testing Users API..."
curl -s -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" | head -c 100

# Test Reports API
echo -e "\n📊 Testing Reports API..."
curl -s -X GET http://localhost:3001/api/reports/stock-levels \
  -H "Authorization: Bearer $TOKEN" | head -c 100

echo -e "\n🎉 All tests completed!"
```

## 📋 Expected Responses

### Successful Product Response:
```json
{
  "message": "Products retrieved successfully",
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "categoryId": 1,
      "quantity": 15,
      "price": 999.99,
      "lowStockThreshold": 5,
      "description": "High-performance laptop",
      "active": true,
      "categoryName": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 58,
    "pages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Successful Category Response:
```json
{
  "message": "Categories retrieved successfully",
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "productCount": 50
    }
  ]
}
```

### Error Response:
```json
{
  "error": "Product not found",
  "message": "Product does not exist or has been deleted"
}
```

## 🚀 Quick Health Check

```bash
# Check API health
curl -X GET http://localhost:3001/health

# Check Swagger documentation
curl -X GET http://localhost:3001/api-docs

# Check database connection
docker exec inventory-api-test node -e "
const db = require('./config/database');
db.query('SELECT COUNT(*) FROM products WHERE deleted_at IS NULL')
  .then(result => { console.log('Database connected:', result.rows[0]); db.end(); })
  .catch(err => { console.error('Database error:', err); db.end(); });
"
```
