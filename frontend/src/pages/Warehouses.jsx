import React, { useState, useEffect } from 'react';
import { warehouseAPI, employeeAPI, sectionAPI, itemAPI, productAPI, subProductAPI, supplierAPI } from '../services/api';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [sections, setSections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [expandedWarehouses, setExpandedWarehouses] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    capacity_unit: 'metre cube',
    manager_id: ''
  });
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    warehouse_id: '',
    section_type: '',
    temperature_range: '',
    is_available: true
  });
  const [itemFormData, setItemFormData] = useState({
    sub_product_id: '',
    supplier_id: '',
    warehouse_section_id: '',
    quantity: '',
    expiration_date: ''
  });
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehousesResponse, sectionsResponse, employeesResponse, itemsResponse, productsResponse, subProductsResponse, suppliersResponse] = await Promise.all([
        warehouseAPI.getWarehouses(),
        sectionAPI.getSections(),
        employeeAPI.getEmployees(),
        itemAPI.getItems(),
        productAPI.getProducts(),
        subProductAPI.getSubProducts(),
        supplierAPI.getSuppliers()
      ]);
      setWarehouses(warehousesResponse.data);
      setSections(sectionsResponse.data);
      setEmployees(employeesResponse.data);
      setItems(itemsResponse.data);
      setProducts(productsResponse.data);
      setSubProducts(subProductsResponse.data);
      setSuppliers(suppliersResponse.data);
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

  const toggleWarehouseExpansion = (warehouseId) => {
    const newExpanded = new Set(expandedWarehouses);
    if (newExpanded.has(warehouseId)) {
      newExpanded.delete(warehouseId);
    } else {
      newExpanded.add(warehouseId);
    }
    setExpandedWarehouses(newExpanded);
  };

  const getSectionsForWarehouse = (warehouseId) => {
    return sections.filter(section => section.warehouse_id._id === warehouseId);
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

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemAPI.updateItem(editingItem._id, itemFormData);
      } else {
        await itemAPI.createItem(itemFormData);
      }
      fetchData();
      setShowItemForm(false);
      setEditingItem(null);
      resetItemForm();
    } catch (error) {
      console.error('Failed to save item:', error);
      setError('Failed to save item');
    }
  };

  const resetItemForm = () => {
    setItemFormData({
      sub_product_id: '',
      supplier_id: '',
      warehouse_section_id: '',
      quantity: '',
      expiration_date: ''
    });
    setSelectedProduct('');
    setEditingItem(null);
  };

  const getFilteredSubProducts = () => {
    return subProducts.filter(sp => sp.product_id._id === selectedProduct);
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    setItemFormData({...itemFormData, sub_product_id: ''});
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      sub_product_id: item.sub_product_id._id,
      supplier_id: item.supplier_id._id,
      warehouse_section_id: item.warehouse_section_id._id,
      quantity: item.quantity,
      expiration_date: item.expiration_date.split('T')[0] // format for date input
    });
    setSelectedProduct(item.sub_product_id.product_id._id);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemAPI.deleteItem(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete item:', error);
        setError('Failed to delete item');
      }
    }
  };

  const handleAddSection = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    setSectionFormData({
      name: '',
      warehouse_id: warehouseId,
      section_type: '',
      temperature_range: '',
      is_available: true
    });
    setShowSectionForm(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      warehouse_id: section.warehouse_id._id,
      section_type: section.section_type,
      temperature_range: section.temperature_range,
      is_available: section.is_available
    });
    setShowSectionForm(true);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await sectionAPI.updateSection(editingSection._id, sectionFormData);
      } else {
        await sectionAPI.createSection(sectionFormData);
      }
      fetchData();
      setShowSectionForm(false);
      setEditingSection(null);
      resetSectionForm();
    } catch (error) {
      console.error('Failed to save section:', error);
      setError('Failed to save warehouse section');
    }
  };

  const handleDeleteSection = async (id) => {
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

  const resetSectionForm = () => {
    setSectionFormData({
      name: '',
      warehouse_id: '',
      section_type: '',
      temperature_range: '',
      is_available: true
    });
  };

  const handleSectionCancel = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    resetSectionForm();
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
        <h1 className="text-2xl font-bold text-gray-900">Warehouses & Sections</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Warehouse
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

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSection ? 'Edit Warehouse Section' : 'Add New Warehouse Section'}
              </h3>
              <form onSubmit={handleSectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={sectionFormData.name}
                    onChange={(e) => setSectionFormData({...sectionFormData, name: e.target.value})}
                    placeholder="e.g., Cold Room A, Dry Goods Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Type</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={sectionFormData.section_type}
                    onChange={(e) => setSectionFormData({...sectionFormData, section_type: e.target.value})}
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
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={sectionFormData.temperature_range}
                    onChange={(e) => setSectionFormData({...sectionFormData, temperature_range: e.target.value})}
                  >
                    <option value="">Select Temperature Range</option>
                    <option value="Frozen Storage: -18°C to -25°C">Frozen Storage: -18°C to -25°C</option>
                    <option value="Refrigerated: 0°C to 5°C">Refrigerated: 0°C to 5°C</option>
                    <option value="Cool Storage: 5°C to 15°C">Cool Storage: 5°C to 15°C</option>
                    <option value="Room Temperature: 15°C to 25°C">Room Temperature: 15°C to 25°C</option>
                    <option value="Ambient: 20°C to 30°C">Ambient: 20°C to 30°C</option>
                    <option value="Controlled Room Temperature: 20°C to 25°C">Controlled Room Temperature: 20°C to 25°C</option>
                    <option value="Warm: 25°C to 35°C">Warm: 25°C to 35°C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={sectionFormData.is_available}
                      onChange={(e) => setSectionFormData({...sectionFormData, is_available: e.target.checked})}
                      defaultChecked={true}
                    />
                    Available for Use
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSectionCancel}
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

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub-Product</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={itemFormData.sub_product_id}
                    onChange={(e) => setItemFormData({...itemFormData, sub_product_id: e.target.value})}
                    disabled={!selectedProduct}
                  >
                    <option value="">Select Sub-Product</option>
                    {getFilteredSubProducts().map(subProduct => (
                      <option key={subProduct._id} value={subProduct._id}>
                        {subProduct.name} ({subProduct.unit_size})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={itemFormData.supplier_id}
                    onChange={(e) => setItemFormData({...itemFormData, supplier_id: e.target.value})}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({...itemFormData, quantity: e.target.value})}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={itemFormData.expiration_date}
                    onChange={(e) => setItemFormData({...itemFormData, expiration_date: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      resetItemForm();
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Warehouses & Sections Hierarchy */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {warehouses.length > 0 ? (
            warehouses.map((warehouse) => {
              const warehouseSections = getSectionsForWarehouse(warehouse._id);
              const isExpanded = expandedWarehouses.has(warehouse._id);
              return (
                <li key={warehouse._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleWarehouseExpansion(warehouse._id)}
                          className="text-gray-400 hover:text-gray-600 mr-2"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        <span className="text-2xl">🏭</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {warehouse.name} (ID: {warehouse.warehouse_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          {warehouse.location} • {warehouse.size} {warehouse.capacity_unit} • {warehouseSections.length} sections
                        </div>
                        <div className="text-sm text-gray-500">
                          Manager: {warehouse.manager_id?.first_name} {warehouse.manager_id?.last_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddSection(warehouse._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Section
                      </button>
                      <button
                        onClick={() => handleEdit(warehouse)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(warehouse._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 ml-8">
                      {warehouseSections.length > 0 ? (
                        <ul className="space-y-2">
                          {warehouseSections.map((section) => {
                            const sectionItems = getItemsForSection(section._id);
                            const isSectionExpanded = expandedSections.has(section._id);
                            return (
                              <li key={section._id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <div className="flex-shrink-0">
                                      <button
                                        onClick={() => toggleSectionExpansion(section._id)}
                                        className="text-gray-400 hover:text-gray-600 mr-2"
                                      >
                                        {isSectionExpanded ? '▼' : '▶'}
                                      </button>
                                      <span className="text-lg mr-2">
                                        {getSectionTypeIcon(section.section_type)}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-800">
                                        {section.name} (ID: {section.section_id})
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Type: {section.section_type} • Temperature: {section.temperature_range} • {sectionItems.length} items
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(section.is_available)}`}>
                                      {section.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setItemFormData({...itemFormData, warehouse_section_id: section._id});
                                          setShowItemForm(true);
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                      >
                                        Add Item
                                      </button>
                                      <button
                                        onClick={() => handleEditSection(section)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSection(section._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {isSectionExpanded && (
                                  <div className="mt-4 ml-8">
                                    {sectionItems.length > 0 ? (
                                      <ul className="space-y-2">
                                        {sectionItems.map((item) => (
                                          <li key={item._id} className="border-l-2 border-gray-200 pl-4">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center flex-1">
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
                                              <div className="flex space-x-2">
                                                <button
                                                  onClick={() => handleEditItem(item)}
                                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteItem(item._id)}
                                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                >
                                                  Delete
                                                </button>
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
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 ml-4">No sections found for this warehouse</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              No warehouses found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Warehouses;