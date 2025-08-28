const Joi = require('joi');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const { error } = req.validationResult;
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

/**
 * Validation schema for user registration
 */
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': 'Role must be either user or admin'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Validation schema for user login
 */
const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * Validation schema for refresh token
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

/**
 * Validation schema for product creation
 */
const productCreationSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name must not exceed 255 characters',
    'any.required': 'Product name is required'
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.integer': 'Category ID must be an integer',
    'number.positive': 'Category ID must be a positive number',
    'any.required': 'Category ID is required'
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be a non-negative number',
    'any.required': 'Quantity is required'
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'number.precision': 'Price must have at most 2 decimal places',
    'any.required': 'Price is required'
  }),
  lowStockThreshold: Joi.number().integer().min(0).default(10).messages({
    'number.integer': 'Low stock threshold must be an integer',
    'number.min': 'Low stock threshold must be a non-negative number'
  }),
  description: Joi.string().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  active: Joi.boolean().default(true).messages({
    'boolean.base': 'Active must be a boolean value'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Validation schema for product update
 */
const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional().messages({
    'string.min': 'Product name must be at least 2 characters',
    'string.max': 'Product name must not exceed 255 characters'
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.integer': 'Category ID must be an integer',
    'number.positive': 'Category ID must be a positive number'
  }),
  price: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Price must be a positive number',
    'number.precision': 'Price must have at most 2 decimal places'
  }),
  lowStockThreshold: Joi.number().integer().min(0).optional().messages({
    'number.integer': 'Low stock threshold must be an integer',
    'number.min': 'Low stock threshold must be a non-negative number'
  }),
  description: Joi.string().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  active: Joi.boolean().optional().messages({
    'boolean.base': 'Active must be a boolean value'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Validation schema for quantity update
 */
const quantityUpdateSchema = Joi.object({
  quantityChange: Joi.number().integer().not(0).required().messages({
    'number.integer': 'Quantity change must be an integer',
    'any.required': 'Quantity change is required',
    'number.base': 'Quantity change must be a number'
  }),
  reasonCode: Joi.string().valid('sale', 'purchase', 'adjustment', 'damage').required().messages({
    'any.only': 'Reason code must be one of: sale, purchase, adjustment, damage',
    'any.required': 'Reason code is required'
  }),
  reasonDescription: Joi.string().max(500).optional().messages({
    'string.max': 'Reason description must not exceed 500 characters'
  })
});

/**
 * Validation schema for category creation
 */
const categoryCreationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name must not exceed 100 characters',
    'any.required': 'Category name is required'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description must not exceed 500 characters'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Validation schema for category update
 */
const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name must not exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description must not exceed 500 characters'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Validation schema for pagination
 */
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be a positive number'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100'
  })
});

/**
 * Validation schema for product filters
 */
const productFiltersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.integer': 'Category ID must be an integer',
    'number.positive': 'Category ID must be a positive number'
  }),
  search: Joi.string().max(100).optional().messages({
    'string.max': 'Search term must not exceed 100 characters'
  }),
  active: Joi.boolean().optional().messages({
    'boolean.base': 'Active must be a boolean value'
  }),
  minPrice: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Minimum price must be a positive number',
    'number.precision': 'Price must have at most 2 decimal places'
  }),
  maxPrice: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Maximum price must be a positive number',
    'number.precision': 'Price must have at most 2 decimal places'
  }),
  inStock: Joi.boolean().optional().messages({
    'boolean.base': 'In stock must be a boolean value'
  }),
  lowStock: Joi.boolean().optional().messages({
    'boolean.base': 'Low stock must be a boolean value'
  })
});

/**
 * Validation schema for user update
 */
const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  role: Joi.string().valid('user', 'admin').optional().messages({
    'any.only': 'Role must be either user or admin'
  })
}).unknown(false); // Reject any unknown fields

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid input data',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

/**
 * Query validation middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid query parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration: validate(userRegistrationSchema),
  validateUserLogin: validate(userLoginSchema),
  validateRefreshToken: validate(refreshTokenSchema),
  validateProductCreation: validate(productCreationSchema),
  validateProductUpdate: validate(productUpdateSchema),
  validateQuantityUpdate: validate(quantityUpdateSchema),
  validateCategoryCreation: validate(categoryCreationSchema),
  validateCategoryUpdate: validate(categoryUpdateSchema),
  validatePagination: validateQuery(paginationSchema),
  validateProductFilters: validateQuery(productFiltersSchema),
  validateUserUpdate: validate(userUpdateSchema)
};
