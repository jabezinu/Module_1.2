// Script to create initial admin user
import fetch from 'node-fetch';

const createAdmin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@warehouse.com',
        password: 'admin123',
        permissions: ['full_access']
      })
    });

    const data = await response.json();
    console.log('Admin creation response:', data);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();