const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categoryId, 
      search, 
      active, 
      minPrice, 
      maxPrice, 
      inStock, 
      lowStock 
    } = req.query;
    
    const filters = {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      active: active !== undefined ? active === 'true' : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
      lowStock: lowStock !== undefined ? lowStock === 'true' : undefined
    };
    
    const result = await Product.findAll(parseInt(page), parseInt(limit), filters);

    res.json({
      message: 'Products retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      error: 'Failed to retrieve products',
      message: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(parseInt(id));

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or has been deleted'
      });
    }

    res.json({
      message: 'Product retrieved successfully',
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve product',
      message: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, sku, categoryId, quantity, price, lowStockThreshold, description, active } = req.body;
    
    const productData = {
      name,
      sku,
      categoryId: parseInt(categoryId),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      description,
      active: active !== undefined ? active : true
    };

    const product = await Product.create(productData);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.message === 'Category does not exist') {
      return res.status(400).json({
        error: 'Product creation failed',
        message: 'Category does not exist'
      });
    }
    
    if (error.message === 'SKU already exists') {
      return res.status(400).json({
        error: 'Product creation failed',
        message: 'SKU already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert numeric fields
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.lowStockThreshold) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);

    const product = await Product.update(parseInt(id), updateData);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or has been deleted'
      });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.message === 'Category does not exist') {
      return res.status(400).json({
        error: 'Product update failed',
        message: 'Category does not exist'
      });
    }
    
    if (error.message === 'SKU already exists') {
      return res.status(400).json({
        error: 'Product update failed',
        message: 'SKU already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.softDelete(parseInt(id));

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or has already been deleted'
      });
    }

    res.json({
      message: 'Product deleted successfully',
      productId: product.id
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, reasonCode, reasonDescription } = req.body;
    const userId = req.user.id;

    const result = await Product.updateQuantity(
      parseInt(id), 
      parseInt(quantityChange), 
      reasonCode, 
      reasonDescription, 
      userId
    );

    // Get the updated product to return in response
    const updatedProduct = await Product.findById(parseInt(id));

    res.json({
      message: 'Product quantity updated successfully',
      product: updatedProduct,
      productId: result.id,
      newQuantity: result.quantity,
      quantityChange,
      reasonCode
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or has been deleted'
      });
    }
    
    if (error.message === 'Insufficient stock') {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: 'Cannot reduce quantity below zero'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update product quantity',
      message: error.message
    });
  }
};

const getProductTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await Product.getTransactions(parseInt(id), parseInt(page), parseInt(limit));

    res.json({
      message: 'Product transactions retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get product transactions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve product transactions',
      message: error.message
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const { threshold } = req.query;
    const products = await Product.getLowStock(threshold ? parseInt(threshold) : null);

    res.json({
      message: 'Low stock products retrieved successfully',
      threshold: threshold ? parseInt(threshold) : 'default',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      error: 'Failed to retrieve low stock products',
      message: error.message
    });
  }
};

const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.getOutOfStock();

    res.json({
      message: 'Out of stock products retrieved successfully',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get out of stock products error:', error);
    res.status(500).json({
      error: 'Failed to retrieve out of stock products',
      message: error.message
    });
  }
};

const getInventorySummary = async (req, res) => {
  try {
    const summary = await Product.getInventorySummary();

    res.json({
      message: 'Inventory summary retrieved successfully',
      summary
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve inventory summary',
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateQuantity,
  getProductTransactions,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventorySummary
};
