import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseAPI, employeeAPI, sectionAPI, itemAPI } from '../services/api';

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [sections, setSections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    capacity_unit: 'metre cube',
    manager_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehousesResponse, sectionsResponse, employeesResponse, itemsResponse] = await Promise.all([
        warehouseAPI.getWarehouses(),
        sectionAPI.getSections(),
        employeeAPI.getEmployees(),
        itemAPI.getItems()
      ]);
      setWarehouses(warehousesResponse.data);
      setSections(sectionsResponse.data);
      setEmployees(employeesResponse.data);
      setItems(itemsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load warehouses data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehouseAPI.updateWarehouse(editingWarehouse._id, formData);
      } else {
        await warehouseAPI.createWarehouse(formData);
      }
      fetchData();
      setShowForm(false);
      setEditingWarehouse(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save warehouse:', error);
      setError('Failed to save warehouse');
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      size: warehouse.size,
      capacity_unit: warehouse.capacity_unit,
      manager_id: warehouse.manager_id?._id || warehouse.manager_id
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await warehouseAPI.deleteWarehouse(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete warehouse:', error);
        setError('Failed to delete warehouse');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      size: '',
      capacity_unit: 'metre cube',
      manager_id: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWarehouse(null);
    resetForm();
  };

  const getSectionsForWarehouse = (warehouseId) => {
    return sections.filter(section => section.warehouse_id._id === warehouseId);
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
        <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          Add Warehouse
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.length > 0 ? (
          warehouses.map((warehouse) => {
            const warehouseSections = getSectionsForWarehouse(warehouse._id);
            const warehouseItems = items.filter(item => item.warehouse_section_id?.warehouse_id._id === warehouse._id);
            return (
              <div
                key={warehouse._id}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/warehouses/${warehouse._id}`)}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">🏭</span>
                    <div className="text-right">
                      <div className="text-sm opacity-90">ID: {warehouse.warehouse_id}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-2">{warehouse.name}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">📍</span>
                      <span className="text-sm">{warehouse.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">📏</span>
                      <span className="text-sm">{warehouse.size} {warehouse.capacity_unit}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-lg mr-2">👤</span>
                      <span className="text-sm">{warehouse.manager_id?.first_name} {warehouse.manager_id?.last_name}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{warehouseSections.length}</div>
                      <div className="text-xs text-gray-500">Sections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{warehouseItems.length}</div>
                      <div className="text-xs text-gray-500">Items</div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Click to view details</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(warehouse);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(warehouse._id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white shadow rounded-lg p-12 text-center">
            <span className="text-6xl mb-4 block">🏭</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-500">Get started by adding your first warehouse</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity Unit</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.capacity_unit}
                    onChange={(e) => setFormData({...formData, capacity_unit: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warehouse Manager</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.manager_id}
                    onChange={(e) => setFormData({...formData, manager_id: e.target.value})}
                  >
                    <option value="">Select a Manager</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.first_name} {employee.last_name} (ID: {employee.employee_id}) - {employee.role}
                      </option>
                    ))}
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
                    {editingWarehouse ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Warehouses;