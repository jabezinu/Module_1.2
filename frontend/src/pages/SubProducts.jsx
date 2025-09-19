import React, { useState, useEffect } from 'react';
import { subProductAPI, productAPI } from '../services/api';

const SubProducts = () => {
  const [subProducts, setSubProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubProduct, setEditingSubProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    unit_size: '',
    product_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subProductsRes, productsRes] = await Promise.all([
        subProductAPI.getSubProducts(),
        productAPI.getProducts()
      ]);

      setSubProducts(subProductsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load sub-products data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubProduct) {
        await subProductAPI.updateSubProduct(editingSubProduct._id, formData);
      } else {
        await subProductAPI.createSubProduct(formData);
      }
      fetchData();
      setShowForm(false);
      setEditingSubProduct(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save sub-product:', error);
      setError('Failed to save sub-product');
    }
  };

  const handleEdit = (subProduct) => {
    setEditingSubProduct(subProduct);
    setFormData({
      name: subProduct.name,
      unit_size: subProduct.unit_size,
      product_id: subProduct.product_id._id
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
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

  const resetForm = () => {
    setFormData({
      name: '',
      unit_size: '',
      product_id: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubProduct(null);
    resetForm();
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
        <h1 className="text-2xl font-bold text-gray-900">Sub-Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Sub-Product
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
                {editingSubProduct ? 'Edit Sub-Product' : 'Add New Sub-Product'}
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
                  <label className="block text-sm font-medium text-gray-700">Unit Size</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.unit_size}
                    onChange={(e) => setFormData({...formData, unit_size: e.target.value})}
                    placeholder="e.g., 500g, 1L, 10kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} (SKU: {product.sku})
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
                    {editingSubProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {subProducts.length > 0 ? (
            subProducts.map((subProduct) => (
              <li key={subProduct._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subProduct.name} (ID: {subProduct.sub_product_id})
                      </div>
                      <div className="text-sm text-gray-500">
                        Unit Size: {subProduct.unit_size}
                      </div>
                      <div className="text-sm text-gray-500">
                        Product: {subProduct.product_id?.name || 'Unknown'} (SKU: {subProduct.product_id?.sku || 'Unknown'})
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subProduct)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subProduct._id)}
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
              No sub-products found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SubProducts;