const jwt = require('jsonwebtoken');

// Middleware to check if user has permission to access a specific feature
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    try {
      // If user is admin, they have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // For regular users, check if they have the required permission
      const userPermissions = req.user.permissions || {};
      
      if (userPermissions[requiredPermission] === true) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: You don't have permission to access ${requiredPermission}`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
}

// Middleware to check if user has any of the required permissions
function checkAnyPermission(requiredPermissions) {
  return (req, res, next) => {
    try {
      // If user is admin, they have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // For regular users, check if they have any of the required permissions
      const userPermissions = req.user.permissions || {};
      
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions[permission] === true
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: You don't have the required permissions`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
}

// Middleware to check if user has all required permissions
function checkAllPermissions(requiredPermissions) {
  return (req, res, next) => {
    try {
      // If user is admin, they have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // For regular users, check if they have all required permissions
      const userPermissions = req.user.permissions || {};
      
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions[permission] === true
      );

      if (hasAllPermissions) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: You don't have all the required permissions`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
}

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions
}; 