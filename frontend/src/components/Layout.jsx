import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { admin, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊', permission: 'view_analytics' },
    { name: 'Warehouses', href: '/warehouses', icon: '🏭', permission: 'manage_warehouses' },
    { name: 'Employees', href: '/employees', icon: '👥', permission: 'manage_employees' },
    { name: 'Products', href: '/products', icon: '📦', permission: 'manage_inventory' },
    { name: 'Suppliers', href: '/suppliers', icon: '🚚', permission: 'manage_suppliers' },
    { name: 'Carriers', href: '/carriers', icon: '🚛', permission: 'manage_carriers' },
    { name: 'Shipments', href: '/shipments', icon: '📦', permission: 'manage_shipments' },
    // { name: 'Admins', href: '/admins', icon: '👑', permission: 'manage_admins' },
  ];

  const filteredNavigation = navigation.filter(item =>
    hasPermission(item.permission) || item.permission === 'view_analytics'
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Warehouse MS</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-300 hover:text-white">
            ✕
          </button>
        </div>
        <nav className="mt-8">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                location.pathname === item.href
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } transition-colors duration-200`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 bg-gray-800 border-t border-gray-700">
          <div className="text-sm text-gray-300 mb-2">
            Welcome, {admin?.first_name} {admin?.last_name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 mr-4">
            ☰
          </button>
          <h1 className="text-xl font-bold text-gray-900">Warehouse MS</h1>
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;