import React, { useState, useEffect } from 'react';
import { carrierAPI } from '../services/api';

const Carriers = () => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_type: ''
  });

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const response = await carrierAPI.getCarriers();
      setCarriers(response.data);
    } catch (error) {
      console.error('Failed to fetch carriers:', error);
      setError('Failed to load carriers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCarrier) {
        await carrierAPI.updateCarrier(editingCarrier._id, formData);
      } else {
        await carrierAPI.createCarrier(formData);
      }
      fetchCarriers();
      setShowForm(false);
      setEditingCarrier(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save carrier:', error);
      setError('Failed to save carrier');
    }
  };

  const handleEdit = (carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      phone: carrier.phone,
      email: carrier.email,
      service_type: carrier.service_type
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this carrier?')) {
      try {
        await carrierAPI.deleteCarrier(id);
        fetchCarriers();
      } catch (error) {
        console.error('Failed to delete carrier:', error);
        setError('Failed to delete carrier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      service_type: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCarrier(null);
    resetForm();
  };

  const getServiceTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'ground':
      case 'truck':
        return '🚛';
      case 'air':
      case 'air freight':
        return '✈️';
      case 'sea':
      case 'ocean':
        return '🚢';
      case 'express':
        return '⚡';
      default:
        return '🚚';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Carrier Management</h1>
            <p className="text-cyan-100 text-lg">Manage your shipping partners</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 shadow-lg flex items-center"
          >
            <span className="mr-2">🚛</span>
            Add Carrier
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-md">
          <div className="text-red-800 font-medium">{error}</div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.service_type}
                    onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  >
                    <option value="">Select Service Type</option>
                    <option value="Ground">Ground</option>
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                    <option value="Express">Express</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingCarrier ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carriers.length > 0 ? (
          carriers.map((carrier) => (
            <div key={carrier._id} className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                    {getServiceTypeIcon(carrier.service_type)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {carrier.name}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {carrier.carrier_id}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Phone:</span> {carrier.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Email:</span> {carrier.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Service:</span> {carrier.service_type}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(carrier)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(carrier._id)}
                    className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-4xl mb-4">🚛</div>
            <div className="text-gray-500 text-lg">No carriers found</div>
            <div className="text-gray-400 text-sm mt-1">Add your first carrier to get started</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Carriers;