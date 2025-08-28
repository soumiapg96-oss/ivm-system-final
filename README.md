# Inventory Management System API

A robust Node.js 18 + Express backend for a Simple Inventory Management System with PostgreSQL integration, JWT authentication, and comprehensive API documentation.

## Features

- **Node.js 18** with Express framework
- **PostgreSQL** database integration
- **JWT Authentication** with role-based access control
- **Swagger API Documentation** with interactive UI
- **Adminer** for database management
- **Docker & Docker Compose** for easy deployment
- **Rate limiting** and security middleware
- **Comprehensive validation** and error handling
- **Logging system** with file and console output

## Tech Stack

- **Backend**: Node.js 18, Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT, bcryptjs
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: express-validator, Joi
- **Security**: Helmet, CORS, Rate limiting
- **Containerization**: Docker, Docker Compose
- **Database Management**: Adminer

## Project Structure

```
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication controller
│   ├── productController.js # Product management
│   ├── categoryController.js # Category management
│   └── userController.js    # User management
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── validation.js       # Request validation
├── models/
│   ├── User.js             # User model
│   ├── Product.js          # Product model
│   └── Category.js         # Category model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── categories.js       # Category routes
│   └── users.js            # User routes
├── migrations/
│   ├── 001_create_tables.sql # Database schema
│   └── 002_seed_data.sql   # Initial data
├── utils/
│   └── logger.js           # Logging utility
├── tests/                  # Test files
├── logs/                   # Application logs
├── uploads/                # File uploads
├── server.js               # Main application file
├── package.json            # Dependencies and scripts
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Multi-service setup
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-api
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Access the services**
   - **API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api-docs
   - **Adminer (Database)**: http://localhost:8080

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up postgres -d
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - Get all products with advanced filtering (User+)
- `GET /api/products/:id` - Get product by ID (User+)
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Soft delete product (Admin only)
- `PUT /api/products/:id/quantity` - Update quantity with reason tracking (Admin only)
- `GET /api/products/:id/transactions` - Get product transaction history (User+)
- `GET /api/products/low-stock` - Get low stock products (User+)
- `GET /api/products/out-of-stock` - Get out of stock products (User+)
- `GET /api/products/inventory/summary` - Get inventory summary statistics (User+)

### Categories
- `GET /api/categories` - Get all categories (with pagination) (User+)
- `GET /api/categories/all` - Get all categories with product count (User+)
- `GET /api/categories/:id` - Get category by ID (User+)
- `POST /api/categories` - Create new category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Reports
- `GET /api/reports/stock-levels` - Get comprehensive stock levels report (User+)
- `GET /api/reports/inventory-value` - Get inventory value report by category (User+)
- `GET /api/reports/products/:id/quantity-history` - Get quantity history for a product (User+)

### Users (Admin Only)
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## User Roles

- **user**: Read-only access to products and categories
- **admin**: Full access, can manage products, categories, and users

## Database Schema

### Users Table
- `id` (UUID PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR - hashed)
- `role` (VARCHAR - user/admin)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Refresh Tokens Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (UUID - foreign key to users)
- `token` (VARCHAR UNIQUE)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### Categories Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR UNIQUE)
- `description` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Products Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `category_id` (INTEGER - foreign key)
- `quantity` (INTEGER)
- `price` (DECIMAL)
- `low_stock_threshold` (INTEGER)
- `description` (TEXT)
- `active` (BOOLEAN)
- `deleted_at` (TIMESTAMP - soft delete)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Product Transactions Table
- `id` (SERIAL PRIMARY KEY)
- `product_id` (INTEGER - foreign key)
- `quantity_change` (INTEGER)
- `reason_code` (VARCHAR - sale, purchase, adjustment, damage)
- `reason_description` (TEXT)
- `previous_quantity` (INTEGER)
- `new_quantity` (INTEGER)
- `created_by` (UUID - foreign key to users)
- `created_at` (TIMESTAMP)

### Quantity History Table (Audit Trail)
- `id` (SERIAL PRIMARY KEY)
- `product_id` (INTEGER - foreign key)
- `user_id` (UUID - foreign key to users)
- `change` (INTEGER)
- `reason` (VARCHAR)
- `previous_quantity` (INTEGER)
- `new_quantity` (INTEGER)
- `timestamp` (TIMESTAMP)

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=inventory_password
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
```

## Default Credentials

- **Admin User**: admin@inventory.com / Admin123!

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Try-it-out functionality

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Adding New Features

1. Create model in `models/` directory
2. Create controller in `controllers/` directory
3. Create routes in `routes/` directory
4. Add Swagger documentation
5. Update database schema if needed
6. Add tests

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention

## Monitoring and Logging

- Request logging with Morgan
- Application logs in `logs/` directory
- Health check endpoint at `/health`
- Docker health checks
- Error tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
