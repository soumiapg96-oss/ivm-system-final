const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management System API',
      version: '1.0.0',
      description: 'A simple inventory management system backend API'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ]
  },
  apis: ['./server.js']
};

// Manual Swagger specification since swagger-jsdoc is not working
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Inventory Management System API',
    version: '1.0.0',
    description: 'A simple inventory management system backend API'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'admin@inventory.com'
                  },
                  password: {
                    type: 'string',
                    example: 'Admin123!'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Login successful'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        email: {
                          type: 'string',
                          example: 'admin@inventory.com'
                        },
                        role: {
                          type: 'string',
                          example: 'admin'
                        }
                      }
                    },
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    expiresIn: {
                      type: 'integer',
                      example: 900
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Doe'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com'
                  },
                  password: {
                    type: 'string',
                    example: 'Password123!'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'User registered successfully'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '550e8400-e29b-41d4-a716-446655440001'
                        },
                        name: {
                          type: 'string',
                          example: 'John Doe'
                        },
                        email: {
                          type: 'string',
                          example: 'john@example.com'
                        },
                        role: {
                          type: 'string',
                          example: 'user'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '409': {
            description: 'User already exists'
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        tags: ['Authentication'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Logout successful'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Token refreshed successfully'
                    },
                    accessToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    refreshToken: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    expiresIn: {
                      type: 'integer',
                      example: 900
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid refresh token'
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'User profile retrieved successfully'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        name: {
                          type: 'string',
                          example: 'Admin User'
                        },
                        email: {
                          type: 'string',
                          example: 'admin@inventory.com'
                        },
                        role: {
                          type: 'string',
                          example: 'admin'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/auth/test': {
      get: {
        summary: 'Test endpoint',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Test successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Auth test endpoint working'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get all products with advanced filtering',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: {
              type: 'integer',
              default: 10
            }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search term for name or description',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category ID',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'minPrice',
            in: 'query',
            description: 'Minimum price filter',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'maxPrice',
            in: 'query',
            description: 'Maximum price filter',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'inStock',
            in: 'query',
            description: 'Filter by stock availability',
            schema: {
              type: 'boolean'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/PaginationInfo'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      },
      post: {
        summary: 'Create new product',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductCreate'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Product created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Product retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductResponse'
                }
              }
            }
          },
          '404': {
            description: 'Product not found'
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      },
      put: {
        summary: 'Update product',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Product updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'Product not found'
          }
        }
      },
      delete: {
        summary: 'Soft delete product',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Product deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Product deleted successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'Product not found'
          }
        }
      }
    },
    '/api/products/{id}/quantity': {
      put: {
        summary: 'Update quantity with reason tracking',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/QuantityUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Quantity updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/QuantityUpdateResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'Product not found'
          }
        }
      }
    },
    '/api/products/{id}/transactions': {
      get: {
        summary: 'Get product transaction history',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: {
              type: 'integer',
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Transaction history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string'
                          },
                          type: {
                            type: 'string',
                            enum: ['IN', 'OUT']
                          },
                          quantity: {
                            type: 'integer'
                          },
                          reason: {
                            type: 'string'
                          },
                          timestamp: {
                            type: 'string',
                            format: 'date-time'
                          }
                        }
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/PaginationInfo'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '404': {
            description: 'Product not found'
          }
        }
      }
    },
    '/api/products/low-stock': {
      get: {
        summary: 'Get low stock products',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'threshold',
            in: 'query',
            description: 'Low stock threshold',
            schema: {
              type: 'integer',
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Low stock products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/products/out-of-stock': {
      get: {
        summary: 'Get out of stock products',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Out of stock products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/products/inventory/summary': {
      get: {
        summary: 'Get inventory summary statistics',
        tags: ['Products'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Inventory summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalProducts: {
                      type: 'integer'
                    },
                    totalValue: {
                      type: 'number'
                    },
                    lowStockCount: {
                      type: 'integer'
                    },
                    outOfStockCount: {
                      type: 'integer'
                    },
                    categoriesCount: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/categories': {
      get: {
        summary: 'Get all categories with pagination',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: {
              type: 'integer',
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Categories retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Category'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/PaginationInfo'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      },
      post: {
        summary: 'Create new category',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryCreate'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Category created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          }
        }
      }
    },
    '/api/categories/all': {
      get: {
        summary: 'Get all categories with product count',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Categories with product count retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/CategoryWithCount'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/categories/{id}': {
      get: {
        summary: 'Get category by ID',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Category retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          '404': {
            description: 'Category not found'
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      },
      put: {
        summary: 'Update category',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Category updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'Category not found'
          }
        }
      },
      delete: {
        summary: 'Delete category',
        tags: ['Categories'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Category deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Category deleted successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'Category not found'
          }
        }
      }
    },
    '/api/reports/stock-levels': {
      get: {
        summary: 'Get comprehensive stock levels report',
        tags: ['Reports'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Stock levels report retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    report: {
                      type: 'object',
                      properties: {
                        totalProducts: {
                          type: 'integer'
                        },
                        inStock: {
                          type: 'integer'
                        },
                        lowStock: {
                          type: 'integer'
                        },
                        outOfStock: {
                          type: 'integer'
                        },
                        totalValue: {
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/reports/inventory-value': {
      get: {
        summary: 'Get inventory value report by category',
        tags: ['Reports'],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Inventory value report retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    report: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          categoryId: {
                            type: 'string'
                          },
                          categoryName: {
                            type: 'string'
                          },
                          totalValue: {
                            type: 'number'
                          },
                          productCount: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          }
        }
      }
    },
    '/api/reports/products/{id}/quantity-history': {
      get: {
        summary: 'Get quantity history for a product',
        tags: ['Reports'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Quantity history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    history: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          date: {
                            type: 'string',
                            format: 'date'
                          },
                          quantity: {
                            type: 'integer'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '404': {
            description: 'Product not found'
          }
        }
      }
    },
    '/api/users': {
      get: {
        summary: 'Get all users with pagination',
        tags: ['Users'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: {
              type: 'integer',
              default: 10
            }
          }
        ],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User'
                      }
                    },
                    pagination: {
                      $ref: '#/components/schemas/PaginationInfo'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'User not found'
          }
        }
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse'
                }
              }
            }
          },
          '400': {
            description: 'Validation error'
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'User not found'
          }
        }
      },
      delete: {
        summary: 'Delete user',
        tags: ['Users'],
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'User deleted successfully'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized'
          },
          '403': {
            description: 'Forbidden - Admin only'
          },
          '404': {
            description: 'User not found'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          }
        }
      },
      UserCreate: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          password: {
            type: 'string',
            example: 'Password123!'
          }
        }
      },
      UserUpdate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user'
          }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'User retrieved successfully'
          },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          name: {
            type: 'string',
            example: 'Laptop'
          },
          description: {
            type: 'string',
            example: 'High-performance laptop'
          },
          price: {
            type: 'number',
            example: 999.99
          },
          quantity: {
            type: 'integer',
            example: 50
          },
          categoryId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          category: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          }
        }
      },
      ProductCreate: {
        type: 'object',
        required: ['name', 'price', 'quantity', 'categoryId'],
        properties: {
          name: {
            type: 'string',
            example: 'Laptop'
          },
          description: {
            type: 'string',
            example: 'High-performance laptop'
          },
          price: {
            type: 'number',
            example: 999.99
          },
          quantity: {
            type: 'integer',
            example: 50
          },
          categoryId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001'
          }
        }
      },
      ProductUpdate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Laptop'
          },
          description: {
            type: 'string',
            example: 'High-performance laptop'
          },
          price: {
            type: 'number',
            example: 999.99
          },
          quantity: {
            type: 'integer',
            example: 50
          },
          categoryId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001'
          }
        }
      },
      ProductResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Product retrieved successfully'
          },
          product: {
            $ref: '#/components/schemas/Product'
          }
        }
      },
      QuantityUpdate: {
        type: 'object',
        required: ['quantity', 'reason'],
        properties: {
          quantity: {
            type: 'integer',
            example: 10
          },
          reason: {
            type: 'string',
            example: 'Restock from supplier'
          }
        }
      },
      QuantityUpdateResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Quantity updated successfully'
          },
          product: {
            $ref: '#/components/schemas/Product'
          },
          transaction: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              type: {
                type: 'string',
                enum: ['IN', 'OUT']
              },
              quantity: {
                type: 'integer'
              },
              reason: {
                type: 'string'
              },
              timestamp: {
                type: 'string',
                format: 'date-time'
              }
            }
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          name: {
            type: 'string',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          }
        }
      },
      CategoryCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories'
          }
        }
      },
      CategoryUpdate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories'
          }
        }
      },
      CategoryResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Category retrieved successfully'
          },
          category: {
            $ref: '#/components/schemas/Category'
          }
        }
      },
      CategoryWithCount: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440001'
          },
          name: {
            type: 'string',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            example: 'Electronic devices and accessories'
          },
          productCount: {
            type: 'integer',
            example: 25
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z'
          }
        }
      },
      PaginationInfo: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1
          },
          limit: {
            type: 'integer',
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          pages: {
            type: 'integer',
            example: 10
          },
          hasNext: {
            type: 'boolean',
            example: true
          },
          hasPrev: {
            type: 'boolean',
            example: false
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
};

// Swagger JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: 'http://localhost:3001/api-docs/swagger.json',
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Import routes
console.log('🔍 Importing routes...');

let authRoutes, productRoutes, categoryRoutes, userRoutes, reportsRoutes;

try {
  authRoutes = require('./routes/auth');
  productRoutes = require('./routes/products');
  categoryRoutes = require('./routes/categories');
  userRoutes = require('./routes/users');
  reportsRoutes = require('./routes/reports');
  
  console.log('✅ All routes imported successfully');
} catch (error) {
  console.error('❌ Error importing routes:', error);
  process.exit(1);
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@inventory.com"
 *               password:
 *                 type: string
 *                 example: "Admin123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     email:
 *                       type: string
 *                       example: "admin@inventory.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: integer
 *                   example: 900
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World! Inventory Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:3001/api-docs`);
  });
}

module.exports = app;
