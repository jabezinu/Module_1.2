import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getOverview();
      setOverview(response.data.overview);
      setRecentShipments(response.data.recentShipments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: 'Warehouses', value: overview?.warehouses || 0, icon: '🏭' },
    { name: 'Employees', value: overview?.employees || 0, icon: '👥' },
    { name: 'Products', value: overview?.products || 0, icon: '📦' },
    { name: 'Items', value: overview?.items || 0, icon: '📦' },
    { name: 'Suppliers', value: overview?.suppliers || 0, icon: '🚚' },
    { name: 'Carriers', value: overview?.carriers || 0, icon: '🚛' },
    { name: 'Shipments', value: overview?.shipments || 0, icon: '📦' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-indigo-100 text-lg">Welcome back! Here's your warehouse at a glance.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 shadow-lg"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.name} className="bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' :
                    index === 4 ? 'bg-pink-500' :
                    index === 5 ? 'bg-indigo-500' :
                    'bg-gray-500'
                  } text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate mb-1">
                      {stat.name}
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shipments */}
      <div className="bg-white shadow-2xl overflow-hidden rounded-2xl border border-gray-100">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center">
            <span className="mr-3">📦</span>
            Recent Shipments
          </h3>
          <p className="text-gray-600 mt-1">Latest shipment activities in your warehouse</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {recentShipments.length > 0 ? (
            recentShipments.map((shipment) => (
              <li key={shipment._id} className="px-8 py-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg shadow-md">
                        {shipment.shipment_type === 'supplier_to_warehouse' ? '📥' :
                        shipment.shipment_type === 'warehouse_to_customer' ? '📤' : '🔄'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        Shipment #{shipment.shipment_id}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <span className="capitalize">{shipment.shipment_type.replace(/_/g, ' ')}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {shipment.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(shipment.shipment_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(shipment.shipment_date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-8 py-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <div className="text-gray-500 text-lg">No recent shipments</div>
              <div className="text-gray-400 text-sm mt-1">Shipments will appear here once created</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;