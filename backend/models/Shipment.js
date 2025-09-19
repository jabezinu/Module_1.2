import mongoose from 'mongoose';

const shipmentItemSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  shipment_id: { type: Number, unique: true },
  shipment_type: {
    type: String,
    enum: ['supplier_to_warehouse', 'warehouse_to_warehouse', 'warehouse_to_customer'],
    required: true,
    default: 'warehouse_to_customer'
  },
  items: [shipmentItemSchema],
  // Origin details
  origin_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  // Destination details
  destination_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  destination_address: { type: String },
  destination_contact: { type: String },
  // Common fields
  carrier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier', required: true },
  status: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shipment_date: { type: Date, default: Date.now },
  received_date: { type: Date }, // For inbound shipments
  estimated_delivery_date: { type: Date },
  actual_delivery_date: { type: Date },
  tracking_number: { type: String, unique: true, sparse: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  total_weight: { type: Number, default: 0 },
  total_volume: { type: Number, default: 0 },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: { type: String }
}, {
  timestamps: true
});

// Index for efficient queries
shipmentSchema.index({ status: 1, shipment_date: -1 });
shipmentSchema.index({ carrier_id: 1 });
shipmentSchema.index({ origin_warehouse_id: 1 });

// Pre-save middleware to generate shipment_id if not provided
shipmentSchema.pre('save', async function(next) {
  if (!this.shipment_id) {
    const lastShipment = await this.constructor.findOne({}, {}, { sort: { 'shipment_id': -1 } });
    this.shipment_id = lastShipment ? lastShipment.shipment_id + 1 : 1;
  }

  // Validation based on shipment type
  if (this.shipment_type === 'supplier_to_warehouse') {
    if (!this.supplier_id) {
      return next(new Error('supplier_id is required for supplier-to-warehouse shipments'));
    }
    if (!this.origin_warehouse_id) {
      return next(new Error('origin_warehouse_id is required for supplier-to-warehouse shipments'));
    }
  } else if (this.shipment_type === 'warehouse_to_warehouse') {
    if (!this.origin_warehouse_id) {
      return next(new Error('origin_warehouse_id is required for warehouse-to-warehouse shipments'));
    }
    if (!this.destination_warehouse_id) {
      return next(new Error('destination_warehouse_id is required for warehouse-to-warehouse shipments'));
    }
    if (this.origin_warehouse_id.toString() === this.destination_warehouse_id.toString()) {
      return next(new Error('Origin and destination warehouses cannot be the same'));
    }
  } else if (this.shipment_type === 'warehouse_to_customer') {
    if (!this.origin_warehouse_id) {
      return next(new Error('origin_warehouse_id is required for warehouse-to-customer shipments'));
    }
    if (!this.destination_address) {
      return next(new Error('destination_address is required for warehouse-to-customer shipments'));
    }
    if (!this.destination_contact) {
      return next(new Error('destination_contact is required for warehouse-to-customer shipments'));
    }
  }

  next();
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;