import React, { useState, useEffect } from 'react';
import { productAPI, subProductAPI, itemAPI, supplierAPI, sectionAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSubProductForm, setShowSubProductForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSubProduct, setEditingSubProduct] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSubProduct, setSelectedSubProduct] = useState('');
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [expandedSubProducts, setExpandedSubProducts] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    storage_condition: ''
  });
  const [subProductFormData, setSubProductFormData] = useState({
    name: '',
    unit_size: '',
    product_id: ''
  });
  const [itemFormData, setItemFormData] = useState({
    sub_product_id: '',
    supplier_id: '',
    warehouse_section_id: '',
    quantity: 0,
    expiration_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, subProductsRes, itemsRes, suppliersRes, sectionsRes] = await Promise.all([
        productAPI.getProducts(),
        subProductAPI.getSubProducts(),
        itemAPI.getItems(),
        supplierAPI.getSuppliers(),
        sectionAPI.getSections()
      ]);
      setProducts(productsRes.data);
      setSubProducts(subProductsRes.data);
      setItems(itemsRes.data);
      setSuppliers(suppliersRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load products data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct._id, formData);
      } else {
        await productAPI.createProduct(formData);
      }
      fetchData();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
      setError('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category,
      storage_condition: product.storage_condition
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      storage_condition: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const toggleProductExpansion = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getSubProductsForProduct = (productId) => {
    return subProducts.filter(sp => sp.product_id._id === productId);
  };

  const getItemsForSubProduct = (subProductId) => {
    return items.filter(item => item.sub_product_id._id === subProductId);
  };

  const toggleSubProductExpansion = (subProductId) => {
    const newExpanded = new Set(expandedSubProducts);
    if (newExpanded.has(subProductId)) {
      newExpanded.delete(subProductId);
    } else {
      newExpanded.add(subProductId);
    }
    setExpandedSubProducts(newExpanded);
  };

  const handleAddSubProduct = (productId) => {
    setSelectedProduct(productId);
    setSubProductFormData({
      name: '',
      unit_size: '',
      product_id: productId
    });
    setShowSubProductForm(true);
  };

  const handleEditSubProduct = (subProduct) => {
    setEditingSubProduct(subProduct);
    setSubProductFormData({
      name: subProduct.name,
      unit_size: subProduct.unit_size,
      product_id: subProduct.product_id._id
    });
    setShowSubProductForm(true);
  };

  const handleSubProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubProduct) {
        await subProductAPI.updateSubProduct(editingSubProduct._id, subProductFormData);
      } else {
        await subProductAPI.createSubProduct(subProductFormData);
      }
      fetchData();
      setShowSubProductForm(false);
      setEditingSubProduct(null);
      resetSubProductForm();
    } catch (error) {
      console.error('Failed to save sub-product:', error);
      setError('Failed to save sub-product');
    }
  };

  const handleDeleteSubProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-product?')) {
      try {
        await subProductAPI.deleteSubProduct(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete sub-product:', error);
        setError('Failed to delete sub-product');
      }
    }
  };

  const resetSubProductForm = () => {
    setSubProductFormData({
      name: '',
      unit_size: '',
      product_id: ''
    });
  };

  const handleSubProductCancel = () => {
    setShowSubProductForm(false);
    setEditingSubProduct(null);
    resetSubProductForm();
  };

  const handleAddItem = (subProductId) => {
    setSelectedSubProduct(subProductId);
    setItemFormData({
      sub_product_id: subProductId,
      supplier_id: '',
      warehouse_section_id: '',
      quantity: 0,
      expiration_date: ''
    });
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
    setShowItemForm(true);
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

  const resetItemForm = () => {
    setItemFormData({
      sub_product_id: '',
      supplier_id: '',
      warehouse_section_id: '',
      quantity: 0,
      expiration_date: ''
    });
  };

  const handleItemCancel = () => {
    setShowItemForm(false);
    setEditingItem(null);
    resetItemForm();
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Product Management</h1>
            <p className="text-purple-100 text-lg">Manage your inventory hierarchy</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200 shadow-lg flex items-center"
          >
            <span className="mr-2">📦</span>
            Add Product
          </button>
        </div>
      </div>

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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage Condition</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.storage_condition}
                    onChange={(e) => setFormData({...formData, storage_condition: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
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
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Product Form Modal */}
      {showSubProductForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSubProduct ? 'Edit Sub-Product' : 'Add New Sub-Product'}
              </h3>
              <form onSubmit={handleSubProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={subProductFormData.name}
                    onChange={(e) => setSubProductFormData({...subProductFormData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Size</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={subProductFormData.unit_size}
                    onChange={(e) => setSubProductFormData({...subProductFormData, unit_size: e.target.value})}
                    placeholder="e.g., 500ml, 1kg, 12-pack"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubProductCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingSubProduct ? 'Update' : 'Create'}
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
                  <label className="block text-sm font-medium text-gray-700">Warehouse Section</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={itemFormData.warehouse_section_id}
                    onChange={(e) => setItemFormData({...itemFormData, warehouse_section_id: e.target.value})}
                  >
                    <option value="">Select Warehouse Section</option>
                    {sections.map(section => (
                      <option key={section._id} value={section._id}>
                        {section.name} ({section.warehouse_id?.name})
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
                    onChange={(e) => setItemFormData({...itemFormData, quantity: parseInt(e.target.value) || 0})}
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
                    onClick={handleItemCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products Hierarchy */}
      <div className="space-y-6">
        {products.length > 0 ? (
          products.map((product) => {
            const productSubProducts = getSubProductsForProduct(product._id);
            const isExpanded = expandedProducts.has(product._id);
            return (
              <div key={product._id} className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <button
                        onClick={() => toggleProductExpansion(product._id)}
                        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mr-4 shadow-md"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mr-4">
                        📦
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <div className="text-sm text-gray-600 mb-2">
                          ID: {product.product_id} • SKU: {product.sku} • Category: {product.category}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Storage: {product.storage_condition}</span>
                          <span>•</span>
                          <span>{productSubProducts.length} sub-products</span>
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-600 mt-2 italic">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAddSubProduct(product._id)}
                        className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                      >
                        Add Sub-Product
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      {productSubProducts.length > 0 ? (
                        <div className="space-y-4">
                          {productSubProducts.map((subProduct) => {
                            const subProductItems = getItemsForSubProduct(subProduct._id);
                            const isSubProductExpanded = expandedSubProducts.has(subProduct._id);
                            return (
                              <div key={subProduct._id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-purple-500 ml-8">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <button
                                      onClick={() => toggleSubProductExpansion(subProduct._id)}
                                      className="w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-teal-600 transition-all duration-200 mr-3 shadow-sm"
                                    >
                                      {isSubProductExpanded ? '▼' : '▶'}
                                    </button>
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm shadow-md mr-3">
                                      📦
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                        {subProduct.name}
                                      </h4>
                                      <div className="text-sm text-gray-600">
                                        ID: {subProduct.sub_product_id} • Unit Size: {subProduct.unit_size} • {subProductItems.length} items
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleAddItem(subProduct._id)}
                                      className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                                    >
                                      Add Item
                                    </button>
                                    <button
                                      onClick={() => handleEditSubProduct(subProduct)}
                                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubProduct(subProduct._id)}
                                      className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                {isSubProductExpanded && subProductItems.length > 0 && (
                                  <div className="mt-4 ml-12 space-y-2">
                                    {subProductItems.map((item) => (
                                      <div key={item._id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                          <span className="font-medium">Item ID: {item.item_id}</span> • Quantity: {item.quantity} • Supplier: {item.supplier_id?.name || 'Unknown'} • Section: {item.warehouse_section_id?.name || 'Unknown'} • Expires: {new Date(item.expiration_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleEditItem(item)}
                                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-2xl mb-2">📦</div>
                          <div>No sub-products found</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <div className="text-gray-500 text-lg">No products found</div>
            <div className="text-gray-400 text-sm mt-1">Add your first product to get started</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;