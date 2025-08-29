const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await User.findAll(parseInt(page), parseInt(limit));

    res.json({
      message: 'Users retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.json({
      message: 'User retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trim string fields
    if (updateData.email) updateData.email = updateData.email.trim();

    const user = await User.update(id, updateData);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.delete(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Delete all refresh tokens for this user
    await User.deleteAllRefreshTokens(id);

    res.json({
      message: 'User deleted successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role } = req.body;
    
    const userData = {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      password,
      role: role || 'user'
    };

    const user = await User.create(userData);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(400).json({
        error: 'User creation failed',
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      profile: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { first_name, last_name, email, phone } = req.body;

    const updateData = {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim(),
      phone: phone?.trim()
    };

    const user = await User.update(userId, updateData);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(400).json({
        error: 'Profile update failed',
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Current password and new password are required'
      });
    }

    const result = await User.changePassword(userId, currentPassword, newPassword);

    if (!result) {
      return res.status(400).json({
        error: 'Password change failed',
        message: 'Current password is incorrect'
      });
    }

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword
};
