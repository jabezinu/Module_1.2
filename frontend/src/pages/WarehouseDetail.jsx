import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { warehouseAPI, sectionAPI, itemAPI, productAPI, subProductAPI, supplierAPI } from '../services/api';

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    warehouse_id: id,
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
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSectionItems, setShowSectionItems] = useState(false);

  useEffect(() => {
    fetchWarehouseData();
  }, [id]);

  const fetchWarehouseData = async () => {
    try {
      setLoading(true);
      const [warehouseResponse, sectionsResponse, itemsResponse, productsResponse, subProductsResponse, suppliersResponse] = await Promise.all([
        warehouseAPI.getWarehouseById(id),
        sectionAPI.getSections(),
        itemAPI.getItems({ warehouse_id: id }),
        productAPI.getProducts(),
        subProductAPI.getSubProducts(),
        supplierAPI.getSuppliers()
      ]);

      setWarehouse(warehouseResponse.data);
      setSections(sectionsResponse.data.filter(section => section.warehouse_id._id === id));
      setItems(itemsResponse.data);
      setProducts(productsResponse.data);
      setSubProducts(subProductsResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch (error) {
      console.error('Failed to fetch warehouse data:', error);
      setError('Failed to load warehouse details');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers for Sections
  const handleAddSection = () => {
    setSectionFormData({
      name: '',
      warehouse_id: id,
      section_type: '',
      temperature_range: '',
      is_available: true
    });
    setEditingSection(null);
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

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this warehouse section?')) {
      try {
        await sectionAPI.deleteSection(sectionId);
        fetchWarehouseData();
      } catch (error) {
        console.error('Failed to delete section:', error);
        setError('Failed to delete warehouse section');
      }
    }
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await sectionAPI.updateSection(editingSection._id, sectionFormData);
      } else {
        await sectionAPI.createSection(sectionFormData);
      }
      fetchWarehouseData();
      setShowSectionForm(false);
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to save section:', error);
      setError('Failed to save warehouse section');
    }
  };

  // CRUD Handlers for Items
  const handleAddItem = (sectionId) => {
    setItemFormData({
      sub_product_id: '',
      supplier_id: '',
      warehouse_section_id: sectionId,
      quantity: '',
      expiration_date: ''
    });
    setSelectedProduct('');
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      sub_product_id: item.sub_product_id._id,
      supplier_id: item.supplier_id._id,
      warehouse_section_id: item.warehouse_section_id._id,
      quantity: item.quantity,
      expiration_date: item.expiration_date.split('T')[0]
    });
    setSelectedProduct(item.sub_product_id.product_id._id);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemAPI.deleteItem(itemId);
        fetchWarehouseData();
      } catch (error) {
        console.error('Failed to delete item:', error);
        setError('Failed to delete item');
      }
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemAPI.updateItem(editingItem._id, itemFormData);
      } else {
        await itemAPI.createItem(itemFormData);
      }
      fetchWarehouseData();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
      setError('Failed to save item');
    }
  };

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    setItemFormData({...itemFormData, sub_product_id: ''});
  };

  const getFilteredSubProducts = () => {
    return subProducts.filter(sp => sp.product_id._id === selectedProduct);
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Warehouse not found</h2>
        <button
          onClick={() => navigate('/warehouses')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/warehouses')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          ← Back to Warehouses
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
      </div>

      {/* Warehouse Overview Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center">
            <span className="text-4xl mr-4">🏭</span>
            <div>
              <h2 className="text-2xl font-bold">{warehouse.name}</h2>
              <p className="text-blue-100">ID: {warehouse.warehouse_id}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{warehouse.size}</div>
              <div className="text-sm text-gray-500">{warehouse.capacity_unit}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sections.length}</div>
              <div className="text-sm text-gray-500">Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{items.length}</div>
              <div className="text-sm text-gray-500">Items</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">{warehouse.location}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manager</h3>
              <p className="text-gray-600">
                {warehouse.manager_id?.first_name} {warehouse.manager_id?.last_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sections</h2>
          <button
            onClick={handleAddSection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            Add Section
          </button>
        </div>
        {sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const sectionItems = items.filter(item => item.warehouse_section_id._id === section._id);
              return (
                <div key={section._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedSection(section); setShowSectionItems(true); }}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getSectionTypeIcon(section.section_type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                          <p className="text-sm text-gray-500">ID: {section.section_id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddItem(section._id); }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Add Item"
                        >
                          ➕
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditSection(section); }}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          title="Edit Section"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(section._id); }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Section"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {section.section_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Temperature:</span> {section.temperature_range}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Items:</span> {sectionItems.length}
                      </p>
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(section.is_available)}`}>
                          {section.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No sections found for this warehouse</p>
          </div>
        )}
      </div>

      {/* Items Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Items Overview</h2>
        {items.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Items ({items.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {items.slice(0, 10).map((item) => (
                <div key={item._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📦</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Item ID: {item.item_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.sub_product_id?.name || 'Unknown'} • Quantity: {item.quantity} • Supplier: {item.supplier_id?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Expires: {new Date(item.expiration_date).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          title="Edit Item"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 10 && (
              <div className="px-6 py-4 bg-gray-50 text-center">
                <p className="text-sm text-gray-500">And {items.length - 10} more items...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No items found in this warehouse</p>
          </div>
        )}
      </div>

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl transform transition-all duration-300 ease-out scale-100 opacity-100 animate-in fade-in-0 zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">🏭</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {editingSection ? 'Edit Section' : 'Add New Section'}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {editingSection ? 'Update section details' : 'Create a warehouse section'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSectionForm(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSectionSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Section Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({...sectionFormData, name: e.target.value})}
                      placeholder="e.g., Cold Room A, Dry Goods Section"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Section Type
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      value={sectionFormData.section_type}
                      onChange={(e) => setSectionFormData({...sectionFormData, section_type: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      <option value="Refrigerated">❄️ Refrigerated</option>
                      <option value="Cold Storage">🧊 Cold Storage</option>
                      <option value="Dry Goods">📦 Dry Goods</option>
                      <option value="Bulk Area">📦 Bulk Area</option>
                      <option value="Chemicals">⚗️ Chemicals</option>
                      <option value="Electronics">🔌 Electronics</option>
                      <option value="General">🏭 General</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Temperature Range
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      value={sectionFormData.temperature_range}
                      onChange={(e) => setSectionFormData({...sectionFormData, temperature_range: e.target.value})}
                    >
                      <option value="">Select Temperature Range</option>
                      <option value="Frozen Storage: -18°C to -25°C">🥶 Frozen Storage: -18°C to -25°C</option>
                      <option value="Refrigerated: 0°C to 5°C">❄️ Refrigerated: 0°C to 5°C</option>
                      <option value="Cool Storage: 5°C to 15°C">🌡️ Cool Storage: 5°C to 15°C</option>
                      <option value="Room Temperature: 15°C to 25°C">🌤️ Room Temperature: 15°C to 25°C</option>
                      <option value="Ambient: 20°C to 30°C">🌤️ Ambient: 20°C to 30°C</option>
                      <option value="Controlled Room Temperature: 20°C to 25°C">🌡️ Controlled Room Temperature: 20°C to 25°C</option>
                      <option value="Warm: 25°C to 35°C">🔥 Warm: 25°C to 35°C</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="is_available"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      checked={sectionFormData.is_available}
                      onChange={(e) => setSectionFormData({...sectionFormData, is_available: e.target.checked})}
                    />
                    <label htmlFor="is_available" className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Available for Use
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowSectionForm(false)}
                      className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {editingSection ? '✏️ Update Section' : '➕ Create Section'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl transform transition-all duration-300 ease-out scale-100 opacity-100 animate-in fade-in-0 zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">📦</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                      </h3>
                      <p className="text-green-100 text-sm">
                        {editingItem ? 'Update item details' : 'Add inventory to section'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowItemForm(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleItemSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Product Category
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      value={selectedProduct}
                      onChange={(e) => handleProductChange(e.target.value)}
                    >
                      <option value="">Select Product Category</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          📦 {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Specific Product
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      value={itemFormData.sub_product_id}
                      onChange={(e) => setItemFormData({...itemFormData, sub_product_id: e.target.value})}
                      disabled={!selectedProduct}
                    >
                      <option value="">Select Specific Product</option>
                      {getFilteredSubProducts().map(subProduct => (
                        <option key={subProduct._id} value={subProduct._id}>
                          🔸 {subProduct.name} ({subProduct.unit_size})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Supplier
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      value={itemFormData.supplier_id}
                      onChange={(e) => setItemFormData({...itemFormData, supplier_id: e.target.value})}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                          🏢 {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        value={itemFormData.quantity}
                        onChange={(e) => setItemFormData({...itemFormData, quantity: e.target.value})}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        Expires
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        value={itemFormData.expiration_date}
                        onChange={(e) => setItemFormData({...itemFormData, expiration_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowItemForm(false)}
                      className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {editingItem ? '✏️ Update Item' : '➕ Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Items Modal */}
      {showSectionItems && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl transform transition-all duration-300 ease-out scale-100 opacity-100 animate-in fade-in-0 zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl">{getSectionTypeIcon(selectedSection.section_type)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Items in {selectedSection.name}</h3>
                      <p className="text-blue-100 text-sm">Manage inventory for this section</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSectionItems(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Items ({items.filter(item => item.warehouse_section_id._id === selectedSection._id).length})</h4>
                  <button
                    onClick={() => handleAddItem(selectedSection._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    Add Item
                  </button>
                </div>
                {items.filter(item => item.warehouse_section_id._id === selectedSection._id).length > 0 ? (
                  <div className="space-y-4">
                    {items.filter(item => item.warehouse_section_id._id === selectedSection._id).map((item) => (
                      <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">📦</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.sub_product_id?.name || 'Unknown'} ({item.sub_product_id?.unit_size || ''})
                              </div>
                              <div className="text-sm text-gray-500">
                                Quantity: {item.quantity} • Supplier: {item.supplier_id?.name || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                              Expires: {new Date(item.expiration_date).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-yellow-600 hover:text-yellow-800 p-1"
                                title="Edit Item"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete Item"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No items in this section</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetail;