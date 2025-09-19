import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// JWT Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find admin and check if active
    const admin = await Admin.findById(decoded.adminId).select('-password');

    if (!admin) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Admin not found'
      });
    }

    if (!admin.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Check if account is locked
    if (admin.lock_until && admin.lock_until > Date.now()) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Attach admin to request
    req.admin = admin;
    req.adminId = admin._id;
    req.adminRole = admin.role;
    req.adminPermissions = admin.permissions;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your authentication token has expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid authentication token provided'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Permission-based Authorization Middleware
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    // Check if admin has any of the required permissions
    const hasPermission = requiredPermissions.some(permission =>
      req.admin.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
      });
    }

    next();
  };
};

// Warehouse Access Control Middleware
export const authorizeWarehouseAccess = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  // Super admin can access all warehouses
  if (req.admin.role === 'super_admin') {
    return next();
  }

  const warehouseId = req.params.id || req.params.warehouseId || req.body.warehouse_id || req.query.warehouse_id;

  if (!warehouseId) {
    return res.status(400).json({
      error: 'Warehouse ID required',
      message: 'Warehouse ID is required for this operation'
    });
  }

  // Check if admin has access to this warehouse
  const hasAccess = req.admin.assigned_warehouses.some(id =>
    id.toString() === warehouseId.toString()
  );

  if (!hasAccess) {
    return res.status(403).json({
      error: 'Warehouse access denied',
      message: 'You do not have permission to access this warehouse'
    });
  }

  next();
};

// Combined middleware for common use cases
export const requireAdminAuth = [authenticateToken];

export const requireManageAdmins = [authenticateToken, authorizePermissions('manage_admins')];

export const requireManageWarehouses = [authenticateToken, authorizePermissions('manage_warehouses')];

export const requireManageInventory = [authenticateToken, authorizePermissions('manage_inventory')];

export const requireManageShipments = [authenticateToken, authorizePermissions('manage_shipments')];

export const requireViewAnalytics = [authenticateToken, authorizePermissions('view_analytics')];

export const requireSystemSettings = [authenticateToken, authorizePermissions('system_settings')];

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const admin = await Admin.findById(decoded.adminId).select('-password');

      if (admin && admin.is_active) {
        req.admin = admin;
        req.adminId = admin._id;
        req.adminRole = admin.role;
        req.adminPermissions = admin.permissions;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};