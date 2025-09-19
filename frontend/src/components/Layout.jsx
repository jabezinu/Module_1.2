import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { admin, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊', permission: 'view_analytics' },
    { name: 'Warehouses', href: '/warehouses', icon: '🏭', permission: 'manage_warehouses' },
    { name: 'Sections', href: '/warehouse-sections', icon: '🏗️', permission: 'manage_warehouses' },
    { name: 'Employees', href: '/employees', icon: '👥', permission: 'manage_employees' },
    { name: 'Products', href: '/products', icon: '📦', permission: 'manage_inventory' },
    { name: 'Sub-Products', href: '/sub-products', icon: '📦', permission: 'manage_inventory' },
    { name: 'Items', href: '/items', icon: '📦', permission: 'manage_inventory' },
    { name: 'Suppliers', href: '/suppliers', icon: '🚚', permission: 'manage_suppliers' },
    { name: 'Carriers', href: '/carriers', icon: '🚛', permission: 'manage_carriers' },
    { name: 'Shipments', href: '/shipments', icon: '📦', permission: 'manage_shipments' },
    { name: 'Admins', href: '/admins', icon: '👑', permission: 'manage_admins' },
  ];

  const filteredNavigation = navigation.filter(item =>
    hasPermission(item.permission) || item.permission === 'view_analytics'
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Warehouse MS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {admin?.first_name} {admin?.last_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Logout</span>
                    🚪
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;