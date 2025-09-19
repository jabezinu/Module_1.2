import express from 'express';
import Admin from '../models/Admin.js';
import {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken
} from '../controllers/adminAuthController.js';

import {
  getDashboardOverview,
  getWarehouseAnalytics,
  getInventoryAnalytics,
  getShipmentAnalytics,
  getSystemHealth
} from '../controllers/adminDashboardController.js';

import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  resetAdminPassword,
  getAdminStats
} from '../controllers/adminUserController.js';

import {
  authenticateToken,
  authorizePermissions,
  requireManageAdmins,
  requireViewAnalytics,
  requireSystemSettings
} from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES (Public)
// ==========================================

// Admin login
router.post('/auth/login', login);

// Admin registration (requires manage_admins permission, except for initial setup)
router.post('/auth/register', (req, res, next) => {
  // Allow registration without auth if no admins exist (initial setup)
  Admin.countDocuments().then(count => {
    if (count === 0) {
      // No admins exist, allow registration without auth
      register(req, res, next);
    } else {
      // Admins exist, require manage_admins permission
      authenticateToken(req, res, () => {
        authorizePermissions('manage_admins')(req, res, () => {
          register(req, res, next);
        });
      });
    }
  }).catch(err => {
    res.status(500).json({ error: 'Server error', message: 'Unable to check admin count' });
  });
});

// Token verification
router.get('/auth/verify', authenticateToken, verifyToken);

// ==========================================
// PROFILE MANAGEMENT ROUTES (Authenticated)
// ==========================================

// Get admin profile
router.get('/profile', authenticateToken, getProfile);

// Update admin profile
router.put('/profile', authenticateToken, updateProfile);

// Change password
router.put('/profile/password', authenticateToken, changePassword);

// Logout
router.post('/auth/logout', authenticateToken, logout);

// ==========================================
// DASHBOARD ROUTES (Role-based access)
// ==========================================

// Dashboard overview
router.get('/dashboard/overview', authenticateToken, getDashboardOverview);

// Warehouse analytics
router.get('/dashboard/warehouses', authenticateToken, getWarehouseAnalytics);

// Inventory analytics
router.get('/dashboard/inventory', authenticateToken, getInventoryAnalytics);

// Shipment analytics
router.get('/dashboard/shipments', authenticateToken, getShipmentAnalytics);

// System health (requires system_settings permission)
router.get('/dashboard/health', authenticateToken, requireSystemSettings, getSystemHealth);

// ==========================================
// ADMIN USER MANAGEMENT ROUTES (Super Admin)
// ==========================================

// Get all admins
router.get('/users', authenticateToken, requireManageAdmins, getAdmins);

// Get admin by ID
router.get('/users/:id', authenticateToken, requireManageAdmins, getAdminById);

// Create new admin
router.post('/users', authenticateToken, requireManageAdmins, createAdmin);

// Update admin (allow self-updates)
router.put('/users/:id', authenticateToken, (req, res, next) => {
  // Allow self-updates without manage_admins permission
  if (req.params.id === req.adminId) {
    return updateAdmin(req, res, next);
  }
  // Require manage_admins for updating others
  authorizePermissions('manage_admins')(req, res, () => {
    updateAdmin(req, res, next);
  });
});

// Delete admin (soft delete)
router.delete('/users/:id', authenticateToken, requireManageAdmins, deleteAdmin);

// Toggle admin status (activate/deactivate)
router.patch('/users/:id/status', authenticateToken, requireManageAdmins, toggleAdminStatus);

// Reset admin password
router.patch('/users/:id/password', authenticateToken, requireManageAdmins, resetAdminPassword);

// Get admin statistics
router.get('/users/stats', authenticateToken, requireManageAdmins, getAdminStats);

// ==========================================
// PERMISSION-BASED ROUTES
// ==========================================

// Note: Specific routes above already include appropriate authentication and authorization
// Additional middleware can be added to specific routes as needed

export default router;