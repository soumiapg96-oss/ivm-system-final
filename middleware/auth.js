const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token with enhanced error handling
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Access token has expired. Please refresh your token or login again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid.',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(401).json({ 
        error: 'Token verification failed',
        message: 'Token verification failed.',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'User not authenticated' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'Insufficient permissions' 
    });
  }

  next();
};

/**
 * Middleware to check if user has read-only access (user role)
 */
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'User not authenticated' 
    });
  }

  // Both admin and user roles have read access
  if (!['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Insufficient permissions' 
    });
  }

  next();
};

/**
 * Middleware to check if user has write access (admin role only)
 */
const requireWriteAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'User not authenticated' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Write access required',
      message: 'Only administrators can perform this action' 
    });
  }

  next();
};

/**
 * Middleware to check if user has a specific role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated' 
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: `${role} access required`,
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

/**
 * Middleware to handle token refresh
 */
const handleTokenRefresh = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Check if refresh token is provided
      const refreshToken = req.headers['x-refresh-token'];
      if (refreshToken) {
        try {
          // Verify refresh token
          const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
          
          // Generate new access token
          const newAccessToken = jwt.sign(
            { 
              userId: refreshDecoded.id || refreshDecoded.userId, 
              email: refreshDecoded.email, 
              role: refreshDecoded.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
          );

          // Set new token in response header
          res.setHeader('X-New-Access-Token', newAccessToken);
          
          // Continue with the request using the new token
          req.user = {
            userId: refreshDecoded.id || refreshDecoded.userId,
            email: refreshDecoded.email,
            role: refreshDecoded.role
          };
          next();
        } catch (refreshError) {
          return res.status(401).json({ 
            error: 'Refresh token invalid',
            message: 'Refresh token is invalid or expired. Please login again.',
            code: 'REFRESH_TOKEN_INVALID'
          });
        }
      } else {
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Access token has expired. Please refresh your token or login again.',
          code: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt
        });
      }
    } else {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid.',
        code: 'INVALID_TOKEN'
      });
    }
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireUser,
  requireWriteAccess,
  requireRole,
  handleTokenRefresh
};
