import React, { useState, useEffect } from 'react';
import { itemAPI, subProductAPI, supplierAPI, sectionAPI } from '../services/api';

const Items = () => {
  const [items, setItems] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
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
      const [itemsRes, subProductsRes, suppliersRes, sectionsRes] = await Promise.all([
        itemAPI.getItems(),
        subProductAPI.getSubProducts(),
        supplierAPI.getSuppliers(),
        sectionAPI.getSections()
      ]);

      setItems(itemsRes.data);
      setSubProducts(subProductsRes.data);
      setSuppliers(suppliersRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load items data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemAPI.updateItem(editingItem._id, formData);
      } else {
        await itemAPI.createItem(formData);
      }
      fetchData();
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save item:', error);
      setError('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      sub_product_id: item.sub_product_id._id,
      supplier_id: item.supplier_id._id,
      warehouse_section_id: item.warehouse_section_id._id,
      quantity: item.quantity,
      expiration_date: item.expiration_date.split('T')[0] // Format for date input
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
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

  const resetForm = () => {
    setFormData({
      sub_product_id: '',
      supplier_id: '',
      warehouse_section_id: '',
      quantity: 0,
      expiration_date: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Item
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
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub-Product</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sub_product_id}
                    onChange={(e) => setFormData({...formData, sub_product_id: e.target.value})}
                  >
                    <option value="">Select Sub-Product</option>
                    {subProducts.map(subProduct => (
                      <option key={subProduct._id} value={subProduct._id}>
                        {subProduct.name} (Product: {subProduct.product_id?.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
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
                    value={formData.warehouse_section_id}
                    onChange={(e) => setFormData({...formData, warehouse_section_id: e.target.value})}
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
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
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
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map((item) => (
              <li key={item._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Item ID: {item.item_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Sub-Product: {item.sub_product_id?.name || 'Unknown'} (Product: {item.sub_product_id?.product_id?.name || 'Unknown'})
                      </div>
                      <div className="text-sm text-gray-500">
                        Supplier: {item.supplier_id?.name || 'Unknown'} • Section: {item.warehouse_section_id?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Quantity: {item.quantity} • Expires: {new Date(item.expiration_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
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
              No items found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Items;