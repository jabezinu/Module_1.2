import React, { useState, useEffect } from 'react';
import { productAPI, subProductAPI, itemAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    storage_condition: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, subProductsRes, itemsRes] = await Promise.all([
        productAPI.getProducts(),
        subProductAPI.getSubProducts(),
        itemAPI.getItems()
      ]);
      setProducts(productsRes.data);
      setSubProducts(subProductsRes.data);
      setItems(itemsRes.data);
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
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Product
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

      {/* Products Hierarchy */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.length > 0 ? (
            products.map((product) => {
              const productSubProducts = getSubProductsForProduct(product._id);
              const isExpanded = expandedProducts.has(product._id);
              return (
                <li key={product._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleProductExpansion(product._id)}
                          className="text-gray-400 hover:text-gray-600 mr-2"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        <span className="text-2xl">📦</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name} (ID: {product.product_id})
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku} • Category: {product.category} • {productSubProducts.length} sub-products
                        </div>
                        <div className="text-sm text-gray-500">
                          Storage: {product.storage_condition}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 ml-8">
                      {productSubProducts.length > 0 ? (
                        <ul className="space-y-2">
                          {productSubProducts.map((subProduct) => {
                            const subProductItems = getItemsForSubProduct(subProduct._id);
                            return (
                              <li key={subProduct._id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center">
                                  <span className="text-lg mr-2">📦</span>
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {subProduct.name} (ID: {subProduct.sub_product_id})
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Unit Size: {subProduct.unit_size} • {subProductItems.length} items
                                    </div>
                                  </div>
                                </div>
                                {subProductItems.length > 0 && (
                                  <ul className="mt-2 ml-6 space-y-1">
                                    {subProductItems.map((item) => (
                                      <li key={item._id} className="flex items-center text-sm text-gray-600">
                                        <span className="mr-2">•</span>
                                        Item ID: {item.item_id} • Quantity: {item.quantity} • Supplier: {item.supplier_id?.name || 'Unknown'} • Section: {item.warehouse_section_id?.name || 'Unknown'} • Expires: {new Date(item.expiration_date).toLocaleDateString()}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 ml-4">No sub-products found</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              No products found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Products;