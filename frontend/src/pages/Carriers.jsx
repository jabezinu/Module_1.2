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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Carriers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Carrier
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
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

      {/* Carriers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {carriers.length > 0 ? (
            carriers.map((carrier) => (
              <li key={carrier._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getServiceTypeIcon(carrier.service_type)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {carrier.name} (ID: {carrier.carrier_id})
                      </div>
                      <div className="text-sm text-gray-500">
                        Phone: {carrier.phone} • Email: {carrier.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Service Type: {carrier.service_type}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(carrier)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(carrier._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              No carriers found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Carriers;