import Admin from '../models/Admin.js';
import Warehouse from '../models/Warehouse.js';

// Admin Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await Admin.findForAuth(email);

    if (!admin) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (admin.lock_until && admin.lock_until > Date.now()) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate token
    const token = admin.generateAuthToken();

    // Update last login
    admin.last_login = new Date();
    await admin.save();

    // Populate assigned warehouses
    await admin.populate('assigned_warehouses', 'name location');

    res.json({
      message: 'Login successful',
      admin: {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        assigned_warehouses: admin.assigned_warehouses,
        last_login: admin.last_login
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

// Admin Registration (Super Admin only)
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, permissions, assigned_warehouses } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Email already exists'
      });
    }

    // Validate assigned warehouses if provided
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

    // Create new admin
    const admin = new Admin({
      first_name,
      last_name,
      email,
      password,
      role: role || 'warehouse_admin',
      permissions: permissions || [],
      assigned_warehouses: assigned_warehouses || []
    });

    await admin.save();

    // Populate assigned warehouses
    await admin.populate('assigned_warehouses', 'name location');

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        assigned_warehouses: admin.assigned_warehouses
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

// Get Admin Profile
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId)
      .populate('assigned_warehouses', 'name location warehouse_id')
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin profile not found'
      });
    }

    res.json({
      admin: {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        assigned_warehouses: admin.assigned_warehouses,
        is_active: admin.is_active,
        last_login: admin.last_login,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'An error occurred while retrieving profile'
    });
  }
};

// Update Admin Profile
export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    const adminId = req.adminId;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingAdmin = await Admin.findOne({ email, _id: { $ne: adminId } });
      if (existingAdmin) {
        return res.status(400).json({
          error: 'Update failed',
          message: 'Email already exists'
        });
      }
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;

    const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
      new: true,
      runValidators: true
    }).populate('assigned_warehouses', 'name location warehouse_id')
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin profile not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      admin: {
        admin_id: admin.admin_id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        assigned_warehouses: admin.assigned_warehouses
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile'
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const adminId = req.adminId;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Current password and new password are required'
      });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found',
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(current_password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = new_password;
    await admin.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing password'
    });
  }
};

// Logout (client-side token removal, but we can log the event)
export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (checked by middleware)
    res.json({
      message: 'Token is valid',
      admin: {
        admin_id: req.admin.admin_id,
        first_name: req.admin.first_name,
        last_name: req.admin.last_name,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Token verification failed',
      message: 'An error occurred during token verification'
    });
  }
};