// Script to update admin with full access permissions
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import 'dotenv/config';

const updateAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin and update permissions
    const admin = await Admin.findOne({ email: 'super@admin.com' });

    if (!admin) {
      console.log('Admin not found');
      return;
    }

    admin.permissions = ['full_access'];
    await admin.save();

    console.log('Admin updated successfully with full access permissions');
    console.log('Admin:', {
      admin_id: admin.admin_id,
      email: admin.email,
      permissions: admin.permissions
    });

  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateAdmin();