import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sectionAPI, warehouseAPI, itemAPI } from '../services/api';

const WarehouseSections = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [warehouses, setWarehouseds] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouseId || '');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    warehouse_id: warehouseId || '',
    section_type: '',
    temperature_range: '',
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsResponse, warehousesResponse, itemsResponse] = await Promise.all([
        selectedWarehouse ? warehouseAPI.getWarehouseSections(selectedWarehouse) : sectionAPI.getSections(),
        warehouseAPI.getWarehouses(),
        itemAPI.getItems(selectedWarehouse ? { warehouse_id: selectedWarehouse } : {})
      ]);

      setSections(sectionsResponse.data);
      setWarehouses(warehousesResponse.data);
      setItems(itemsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load warehouse sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await sectionAPI.updateSection(editingSection._id, formData);
      } else {
        await sectionAPI.createSection(formData);
      }
      fetchData();
      setShowForm(false);
      setEditingSection(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save section:', error);
      setError('Failed to save warehouse section');
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      warehouse_id: section.warehouse_id?._id || section.warehouse_id,
      section_type: section.section_type,
      temperature_range: section.temperature_range,
      is_available: section.is_available
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse section?')) {
      try {
        await sectionAPI.deleteSection(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete section:', error);
        setError('Failed to delete warehouse section');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      warehouse_id: selectedWarehouse || '',
      section_type: '',
      temperature_range: '',
      is_available: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSection(null);
    resetForm();
  };

  const handleWarehouseFilter = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    navigate(warehouseId ? `/warehouse-sections/${warehouseId}` : '/warehouse-sections');
  };

  const toggleSectionExpansion = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getItemsForSection = (sectionId) => {
    return items.filter(item => item.warehouse_section_id._id === sectionId);
  };

  const getSectionTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'refrigerated':
      case 'cold storage':
        return '❄️';
      case 'dry goods':
        return '📦';
      case 'bulk area':
        return '📦';
      case 'chemicals':
        return '⚗️';
      case 'electronics':
        return '🔌';
      default:
        return '🏭';
    }
  };

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Sections</h1>
          {selectedWarehouse && (
            <p className="text-sm text-gray-600 mt-1">
              Showing sections for: {warehouses.find(w => w._id === selectedWarehouse)?.name}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Section
          </button>
          <button
            onClick={() => navigate('/warehouses')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View Warehouses
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Warehouse Filter */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Warehouse:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => handleWarehouseFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(warehouse => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name} ({warehouse.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSection ? 'Edit Warehouse Section' : 'Add New Warehouse Section'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Cold Room A, Dry Goods Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warehouse</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} ({warehouse.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Type</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.section_type}
                    onChange={(e) => setFormData({...formData, section_type: e.target.value})}
                  >
                    <option value="">Select Type</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Dry Goods">Dry Goods</option>
                    <option value="Bulk Area">Bulk Area</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Electronics">Electronics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature Range</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.temperature_range}
                    onChange={(e) => setFormData({...formData, temperature_range: e.target.value})}
                    placeholder="e.g., 0–5°C, Room Temperature, -20°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                    />
                    Available for Use
                  </label>
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
                    {editingSection ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sections Hierarchy */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sections.length > 0 ? (
            sections.map((section) => {
              const sectionItems = getItemsForSection(section._id);
              const isExpanded = expandedSections.has(section._id);
              return (
                <li key={section._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleSectionExpansion(section._id)}
                          className="text-gray-400 hover:text-gray-600 mr-2"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        <span className="text-2xl">
                          {getSectionTypeIcon(section.section_type)}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {section.name} (ID: {section.section_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          Type: {section.section_type} • Temperature: {section.temperature_range} • {sectionItems.length} items
                        </div>
                        <div className="text-sm text-gray-500">
                          Warehouse: {section.warehouse_id?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(section.is_available)}`}>
                        {section.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(section)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(section._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 ml-8">
                      {sectionItems.length > 0 ? (
                        <ul className="space-y-2">
                          {sectionItems.map((item) => (
                            <li key={item._id} className="border-l-2 border-gray-200 pl-4">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">📦</span>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">
                                    Item ID: {item.item_id}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Sub-Product: {item.sub_product_id?.name || 'Unknown'} • Quantity: {item.quantity} • Supplier: {item.supplier_id?.name || 'Unknown'} • Expires: {new Date(item.expiration_date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 ml-4">No items in this section</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              {selectedWarehouse ? 'No sections found for this warehouse' : 'No warehouse sections found'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default WarehouseSections;