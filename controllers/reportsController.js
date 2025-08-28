const Product = require('../models/Product');

const getStockLevelsReport = async (req, res) => {
  try {
    const stockLevels = await Product.getStockLevelsReport();
    
    // Calculate summary statistics
    const summary = {
      total_products: stockLevels.length,
      out_of_stock: stockLevels.filter(p => p.stock_status === 'Out of Stock').length,
      low_stock: stockLevels.filter(p => p.stock_status === 'Low Stock').length,
      in_stock: stockLevels.filter(p => p.stock_status === 'In Stock').length,
      total_value: stockLevels.reduce((sum, p) => sum + parseFloat(p.total_value || 0), 0)
    };

    res.json({
      message: 'Stock levels report generated successfully',
      summary,
      products: stockLevels
    });
  } catch (error) {
    console.error('Get stock levels report error:', error);
    res.status(500).json({
      error: 'Failed to generate stock levels report',
      message: error.message
    });
  }
};

const getInventoryValueReport = async (req, res) => {
  try {
    const inventoryByCategory = await Product.getInventoryValueByCategory();
    
    // Calculate overall summary
    const overallSummary = {
      total_categories: inventoryByCategory.length,
      total_products: inventoryByCategory.reduce((sum, c) => sum + parseInt(c.product_count || 0), 0),
      total_quantity: inventoryByCategory.reduce((sum, c) => sum + parseInt(c.total_quantity || 0), 0),
      total_value: inventoryByCategory.reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0),
      average_value_per_category: inventoryByCategory.length > 0 
        ? inventoryByCategory.reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0) / inventoryByCategory.length 
        : 0
    };

    res.json({
      message: 'Inventory value report generated successfully',
      overall_summary: overallSummary,
      categories: inventoryByCategory
    });
  } catch (error) {
    console.error('Get inventory value report error:', error);
    res.status(500).json({
      error: 'Failed to generate inventory value report',
      message: error.message
    });
  }
};

const getQuantityHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await Product.getQuantityHistory(parseInt(id), parseInt(page), parseInt(limit));

    res.json({
      message: 'Quantity history retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get quantity history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve quantity history',
      message: error.message
    });
  }
};

module.exports = {
  getStockLevelsReport,
  getInventoryValueReport,
  getQuantityHistory
};
