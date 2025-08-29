const Category = require('../models/Category');

const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const result = await Category.findAll(parseInt(page), parseInt(limit), search);

    res.json({
      message: 'Categories retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      error: 'Failed to retrieve categories',
      message: error.message
    });
  }
};

const getAllCategoriesWithCount = async (req, res) => {
  try {
    const categories = await Category.getAllWithProductCount();

    res.json({
      message: 'Categories retrieved successfully',
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get all categories with count error:', error);
    res.status(500).json({
      error: 'Failed to retrieve categories',
      message: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(parseInt(id));

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category does not exist'
      });
    }

    res.json({
      message: 'Category retrieved successfully',
      category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve category',
      message: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : null
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.message === 'Category name already exists') {
      return res.status(400).json({
        error: 'Category creation failed',
        message: 'Category name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create category',
      message: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description) updateData.description = updateData.description.trim();

    const category = await Category.update(parseInt(id), updateData);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category does not exist'
      });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.message === 'Category name already exists') {
      return res.status(400).json({
        error: 'Category update failed',
        message: 'Category name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update category',
      message: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.delete(parseInt(id));

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: 'Category does not exist'
      });
    }

    res.json({
      message: 'Category deleted successfully',
      categoryId: category.id
    });
  } catch (error) {
    console.error('Delete category error:', error);
    
    if (error.message === 'Cannot delete category with existing products') {
      return res.status(400).json({
        error: 'Category deletion failed',
        message: 'Cannot delete category with existing products'
      });
    }
    
    res.status(500).json({
      error: 'Failed to delete category',
      message: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getAllCategoriesWithCount,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
