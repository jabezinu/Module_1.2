import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema({
  admin_id: { type: Number, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_warehouses',
      'manage_employees',
      'manage_inventory',
      'manage_shipments',
      'manage_suppliers',
      'manage_carriers',
      'view_analytics',
      'manage_admins',
      'system_settings',
      'full_access'
    ],
    default: ['view_analytics'] // Default permission for all admins
  }],
  assigned_warehouses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }],
  is_active: { type: Boolean, default: true },
  last_login: { type: Date },
  password_changed_at: { type: Date },
  login_attempts: { type: Number, default: 0 },
  lock_until: { type: Date }
}, {
  timestamps: true
});

// Index for efficient queries
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ is_active: 1 });

// Virtual for full name
adminSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.password_changed_at = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate admin_id
adminSchema.pre('save', async function(next) {
  if (!this.admin_id) {
    const lastAdmin = await this.constructor.findOne({}, {}, { sort: { 'admin_id': -1 } });
    this.admin_id = lastAdmin ? lastAdmin.admin_id + 1 : 1;
  }
  next();
});

// Instance methods
adminSchema.methods = {
  // Compare password
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  // Generate JWT token
  generateAuthToken: function() {
    const payload = {
      adminId: this._id,
      admin_id: this.admin_id,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    });
  },

  // Check if admin has specific permission
  hasPermission: function(permission) {
    // Full access permission grants all permissions
    if (this.permissions.includes('full_access')) return true;
    return this.permissions.includes(permission);
  },

  // Check if admin can access specific warehouse
  canAccessWarehouse: function(warehouseId) {
    if (this.role === 'super_admin') return true;
    return this.assigned_warehouses.some(id => id.toString() === warehouseId.toString());
  },

  // Increment login attempts
  incLoginAttempts: function() {
    if (this.lock_until && this.lock_until < Date.now()) {
      return this.updateOne({
        $unset: { lock_until: 1 },
        $set: { login_attempts: 1 }
      });
    }

    const updates = { $inc: { login_attempts: 1 } };

    if (this.login_attempts + 1 >= 5 && !this.lock_until) {
      updates.$set = {
        lock_until: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
      };
    }

    return this.updateOne(updates);
  },

  // Reset login attempts on successful login
  resetLoginAttempts: function() {
    return this.updateOne({
      $unset: { login_attempts: 1, lock_until: 1 },
      $set: { last_login: new Date() }
    });
  }
};

// Static methods
adminSchema.statics = {
  // Find admin for authentication
  findForAuth: function(email) {
    return this.findOne({ email, is_active: true });
  },

  // Get admins by role
  getByRole: function(role) {
    return this.find({ role, is_active: true }).select('-password');
  },

  // Get admin statistics
  getStats: function() {
    return this.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$is_active', 1, 0] } }
        }
      }
    ]);
  }
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;