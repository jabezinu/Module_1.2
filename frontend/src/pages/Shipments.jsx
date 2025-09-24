import React, { useState, useEffect } from 'react';
import { shipmentAPI, warehouseAPI, supplierAPI, carrierAPI, itemAPI, employeeAPI } from '../services/api';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
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
    employee_id: '',
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
      const [shipmentsRes, warehousesRes, suppliersRes, carriersRes, itemsRes, employeesRes] = await Promise.all([
        shipmentAPI.getShipments(),
        warehouseAPI.getWarehouses(),
        supplierAPI.getSuppliers(),
        carrierAPI.getCarriers(),
        itemAPI.getItems(),
        employeeAPI.getEmployees()
      ]);

      setShipments(shipmentsRes.data.shipments || []);
      setWarehouses(warehousesRes.data);
      setSuppliers(suppliersRes.data);
      setCarriers(carriersRes.data);
      setItems(itemsRes.data);
      setEmployees(employeesRes.data);
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
      employee_id: '',
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

      {/* Create Shipment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Shipment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Carrier</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.carrier_id}
                      onChange={(e) => setFormData({...formData, carrier_id: e.target.value})}
                    >
                      <option value="">Select Carrier</option>
                      {carriers.map(carrier => (
                        <option key={carrier._id} value={carrier._id}>
                          {carrier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(employee => (
                        <option key={employee._id} value={employee._id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Origin Warehouse - Required for all types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Origin Warehouse {formData.shipment_type === 'supplier_to_warehouse' ? '(Destination)' : ''}
                  </label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={formData.origin_warehouse_id}
                    onChange={(e) => setFormData({...formData, origin_warehouse_id: e.target.value})}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier - Only for supplier_to_warehouse */}
                {formData.shipment_type === 'supplier_to_warehouse' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
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
                )}

                {/* Destination Warehouse - Only for warehouse_to_warehouse */}
                {formData.shipment_type === 'warehouse_to_warehouse' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination Warehouse</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.destination_warehouse_id}
                      onChange={(e) => setFormData({...formData, destination_warehouse_id: e.target.value})}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.filter(w => w._id !== formData.origin_warehouse_id).map(warehouse => (
                        <option key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Details - Only for warehouse_to_customer */}
                {formData.shipment_type === 'warehouse_to_customer' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Address</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          value={formData.destination_address}
                          onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
                          placeholder="Customer address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer Contact</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          value={formData.destination_contact}
                          onChange={(e) => setFormData({...formData, destination_contact: e.target.value})}
                          placeholder="Phone or email"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  {formData.origin_warehouse_id ? (
                    <>
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <select
                            required
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            value={item.item_id}
                            onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                          >
                            <option value="">Select Item</option>
                            {items
                              .filter(itemOption => itemOption.warehouse_section_id?.warehouse_id === formData.origin_warehouse_id)
                              .map(itemOption => (
                                <option key={itemOption._id} value={itemOption._id}>
                                  {itemOption.sub_product_id?.name} - Available: {itemOption.quantity}
                                </option>
                              ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            required
                            className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                          />
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addItem}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Item
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Please select an origin warehouse first to see available items.</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Optional notes"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Shipment
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