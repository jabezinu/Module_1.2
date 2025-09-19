import React, { useState, useEffect } from 'react';
import { shipmentAPI, warehouseAPI, supplierAPI, carrierAPI, itemAPI } from '../services/api';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    shipment_type: '',
    warehouse_id: ''
  });

  const [formData, setFormData] = useState({
    shipment_type: 'warehouse_to_customer',
    origin_warehouse_id: '',
    destination_warehouse_id: '',
    supplier_id: '',
    destination_address: '',
    destination_contact: '',
    carrier_id: '',
    items: [{ item_id: '', quantity: 1 }],
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, warehousesRes, suppliersRes, carriersRes, itemsRes] = await Promise.all([
        shipmentAPI.getShipments(),
        warehouseAPI.getWarehouses(),
        supplierAPI.getSuppliers(),
        carrierAPI.getCarriers(),
        itemAPI.getItems()
      ]);

      setShipments(shipmentsRes.data.shipments || []);
      setWarehouses(warehousesRes.data);
      setSuppliers(suppliersRes.data);
      setCarriers(carriersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load shipments data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.shipment_type) params.shipment_type = filters.shipment_type;
      if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id;

      const response = await shipmentAPI.getShipments(params);
      setShipments(response.data.shipments || []);
    } catch (error) {
      console.error('Failed to filter shipments:', error);
      setError('Failed to filter shipments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await shipmentAPI.createShipment(formData);
      fetchData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create shipment:', error);
      setError('Failed to create shipment');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await shipmentAPI.updateShipmentStatus(id, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update shipment status:', error);
      setError('Failed to update shipment status');
    }
  };

  const resetForm = () => {
    setFormData({
      shipment_type: 'warehouse_to_customer',
      origin_warehouse_id: '',
      destination_warehouse_id: '',
      supplier_id: '',
      destination_address: '',
      destination_contact: '',
      carrier_id: '',
      items: [{ item_id: '', quantity: 1 }],
      priority: 'medium',
      notes: ''
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShipmentTypeIcon = (type) => {
    switch (type) {
      case 'supplier_to_warehouse': return '📥';
      case 'warehouse_to_warehouse': return '🔄';
      case 'warehouse_to_customer': return '📤';
      default: return '📦';
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
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Shipment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            name="shipment_type"
            value={filters.shipment_type}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="supplier_to_warehouse">Supplier to Warehouse</option>
            <option value="warehouse_to_warehouse">Warehouse to Warehouse</option>
            <option value="warehouse_to_customer">Warehouse to Customer</option>
          </select>
          <select
            name="warehouse_id"
            value={filters.warehouse_id}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(warehouse => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {shipments.length > 0 ? (
            shipments.map((shipment) => (
              <li key={shipment._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getShipmentTypeIcon(shipment.shipment_type)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Shipment #{shipment.shipment_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shipment.shipment_type.replace(/_/g, ' ')} • {shipment.items?.length || 0} items
                      </div>
                      <div className="text-sm text-gray-500">
                        {shipment.origin_warehouse_id?.name} → {
                          shipment.shipment_type === 'warehouse_to_customer'
                            ? 'Customer'
                            : shipment.destination_warehouse_id?.name || shipment.supplier_id?.name
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                    {shipment.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(shipment._id, 'in_transit')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Start Transit
                      </button>
                    )}
                    {shipment.status === 'in_transit' && (
                      <button
                        onClick={() => handleStatusUpdate(shipment._id, 'delivered')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              No shipments found
            </li>
          )}
        </ul>
      </div>

      {/* Create Shipment Modal - Simplified for brevity */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-96 overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Shipment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipment Type</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={formData.shipment_type}
                    onChange={(e) => setFormData({...formData, shipment_type: e.target.value})}
                  >
                    <option value="warehouse_to_customer">Warehouse to Customer</option>
                    <option value="warehouse_to_warehouse">Warehouse to Warehouse</option>
                    <option value="supplier_to_warehouse">Supplier to Warehouse</option>
                  </select>
                </div>
                {/* Add more form fields as needed */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create
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

export default Shipments;