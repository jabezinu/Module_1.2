import Admin from '../models/Admin.js';
import Warehouse from '../models/Warehouse.js';

// Get All Admins
export const getAdmins = async (req, res) => {
  try {
    const { is_active, page = 1, limit = 10 } = req.query;

    // Build query - all admins with manage_admins permission can see all admins
    let query = {};
    if (is_active !== undefined) query.is_active = is_active === 'true';

    const skip = (page - 1) * limit;

    const admins = await Admin.find(query)
      .populate('assigned_warehouses', 'name location warehouse_id')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(query);

    res.json({
      admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAdmins: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      error: 'Admins retrieval failed',
      message: 'An error occurred while retrieving admins'
    });
  }
};

// Get Admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.admin;

    const admin = await Admin.findById(id)
      .populate('assigned_warehouses', 'name location warehouse_id')
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'The requested admin does not exist'
      });
    }

    // All admins with manage_admins permission can view other admins

    res.json({ admin });

  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({
      error: 'Admin retrieval failed',
      message: 'An error occurred while retrieving admin'
    });
  }
};

// Create Admin
export const createAdmin = async (req, res) => {
  try {
    const { first_name, last_name, email, password, permissions, assigned_warehouses } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        error: 'Creation failed',
        message: 'Email already exists'
      });
    }

    // Validate assigned warehouses
    if (assigned_warehouses && assigned_warehouses.length > 0) {
      const warehouseCount = await Warehouse.countDocuments({
        _id: { $in: assigned_warehouses }
      });

      if (warehouseCount !== assigned_warehouses.length) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'One or more assigned warehouses do not exist'
        });
      }
    }

    // Create new admin with default permissions if none provided
    const admin = new Admin({
      first_name,
      last_name,
      email,
      password,
      role: 'admin', // All admins have the same role
      permissions: permissions || ['view_analytics'], // Default permission
      assigned_warehouses: assigned_warehouses || []
    });

    await admin.save();

    // Populate assigned warehouses
    await admin.populate('assigned_warehouses', 'name location warehouse_id');

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        assigned_warehouses: admin.assigned_warehouses,
        is_active: admin.is_active,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: 'Admin creation failed',
      message: 'An error occurred while creating admin'
    });
  }
};

// Update Admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentAdmin = req.admin;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'The requested admin does not exist'
      });
    }

    // Allow self-updates for permissions (for initial setup)
    const isSelfUpdate = currentAdmin._id.toString() === id;
    const hasManageAdmins = currentAdmin.hasPermission('manage_admins');

    if (!isSelfUpdate && !hasManageAdmins) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You cannot update other admins'
      });
    }

    // Validate email uniqueness if being changed
    if (updates.email && updates.email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email: updates.email, _id: { $ne: id } });
      if (existingAdmin) {
        return res.status(400).json({
          error: 'Update failed',
          message: 'Email already exists'
        });
      }
    }

    // Validate assigned warehouses
    if (updates.assigned_warehouses) {
      const warehouseCount = await Warehouse.countDocuments({
        _id: { $in: updates.assigned_warehouses }
      });

      if (warehouseCount !== updates.assigned_warehouses.length) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'One or more assigned warehouses do not exist'
        });
      }
    }

    // Update admin (keep role as 'admin', only update permissions and other fields)
    const allowedUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      email: updates.email,
      permissions: updates.permissions,
      assigned_warehouses: updates.assigned_warehouses,
      is_active: updates.is_active
    };

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
      runValidators: true
    }).populate('assigned_warehouses', 'name location warehouse_id')
      .select('-password');

    res.json({
      message: 'Admin updated successfully',
      admin: {
        admin_id: updatedAdmin.admin_id,
        first_name: updatedAdmin.first_name,
        last_name: updatedAdmin.last_name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        permissions: updatedAdmin.permissions,
        assigned_warehouses: updatedAdmin.assigned_warehouses,
        is_active: updatedAdmin.is_active
      }
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      error: 'Admin update failed',
      message: 'An error occurred while updating admin'
    });
  }
};

// Delete Admin (Soft delete by deactivating)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdmin = req.admin;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'The requested admin does not exist'
      });
    }

    // Prevent self-deletion
    if (currentAdmin._id.toString() === id) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot delete your own account'
      });
    }

    // All admins with manage_admins permission can deactivate other admins

    // Soft delete by deactivating
    admin.is_active = false;
    await admin.save();

    res.json({
      message: 'Admin deactivated successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      error: 'Admin deletion failed',
      message: 'An error occurred while deleting admin'
    });
  }
};

// Activate/Deactivate Admin
export const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const currentAdmin = req.admin;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'The requested admin does not exist'
      });
    }

    // Prevent self-deactivation
    if (currentAdmin._id.toString() === id && !is_active) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot deactivate your own account'
      });
    }

    // All admins with manage_admins permission can toggle admin status

    admin.is_active = is_active;
    await admin.save();

    res.json({
      message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully`,
      admin: {
        admin_id: admin.admin_id,
        email: admin.email,
        is_active: admin.is_active
      }
    });

  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({
      error: 'Status update failed',
      message: 'An error occurred while updating admin status'
    });
  }
};

// Reset Admin Password (Super Admin only)
export const resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const currentAdmin = req.admin;

    // All admins with manage_admins permission can reset passwords

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'The requested admin does not exist'
      });
    }

    admin.password = new_password;
    await admin.save();

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while resetting password'
    });
  }
};

// Get Admin Statistics
export const getAdminStats = async (req, res) => {
  try {
    const currentAdmin = req.admin;

    // All admins with manage_admins permission can view stats
    let query = {};

    const stats = await Admin.aggregate([
      { $match: { ...query, is_active: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalAdmins = await Admin.countDocuments(query);
    const activeAdmins = await Admin.countDocuments({ ...query, is_active: true });

    res.json({
      stats,
      summary: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins: totalAdmins - activeAdmins
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      error: 'Statistics retrieval failed',
      message: 'An error occurred while retrieving admin statistics'
    });
  }
};