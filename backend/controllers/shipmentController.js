import mongoose from 'mongoose';
import Shipment from '../models/Shipment.js';
import Item from '../models/Item.js';
import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';

export const createShipment = async (req, res) => {
  try {
    const shipment = new Shipment(req.body);

    // Validation based on shipment type
    if (shipment.shipment_type === 'warehouse_to_customer') {
      // Validate that all items exist and belong to the origin warehouse
      for (const shipmentItem of shipment.items) {
        const item = await Item.findById(shipmentItem.item_id).populate('warehouse_section_id');
        if (!item) {
          return res.status(400).json({ error: `Item ${shipmentItem.item_id} not found` });
        }
        if (item.warehouse_section_id.warehouse_id.toString() !== shipment.origin_warehouse_id.toString()) {
          return res.status(400).json({ error: `Item ${shipmentItem.item_id} does not belong to the origin warehouse` });
        }
      }
    } else if (shipment.shipment_type === 'warehouse_to_warehouse') {
      // Validate that all items exist and belong to the origin warehouse
      for (const shipmentItem of shipment.items) {
        const item = await Item.findById(shipmentItem.item_id).populate('warehouse_section_id');
        if (!item) {
          return res.status(400).json({ error: `Item ${shipmentItem.item_id} not found` });
        }
        if (item.warehouse_section_id.warehouse_id.toString() !== shipment.origin_warehouse_id.toString()) {
          return res.status(400).json({ error: `Item ${shipmentItem.item_id} does not belong to the origin warehouse` });
        }
      }
      // Validate destination warehouse exists
      const destWarehouse = await Warehouse.findById(shipment.destination_warehouse_id);
      if (!destWarehouse) {
        return res.status(400).json({ error: `Destination warehouse ${shipment.destination_warehouse_id} not found` });
      }
    } else if (shipment.shipment_type === 'supplier_to_warehouse') {
      // For supplier-to-warehouse shipments, validate supplier exists
      if (shipment.supplier_id) {
        const supplier = await Supplier.findById(shipment.supplier_id);
        if (!supplier) {
          return res.status(400).json({ error: `Supplier ${shipment.supplier_id} not found` });
        }
      }
      // Validate destination warehouse exists
      const destWarehouse = await Warehouse.findById(shipment.origin_warehouse_id);
      if (!destWarehouse) {
        return res.status(400).json({ error: `Destination warehouse ${shipment.origin_warehouse_id} not found` });
      }
    }

    await shipment.save();

    // Populate based on shipment type
    const populateFields = [
      { path: 'items.item_id', populate: { path: 'sub_product_id supplier_id warehouse_section_id' } },
      'origin_warehouse_id',
      'carrier_id',
      'employee_id'
    ];

    if (shipment.shipment_type === 'supplier_to_warehouse') {
      populateFields.push('supplier_id');
    } else if (shipment.shipment_type === 'warehouse_to_warehouse') {
      populateFields.push('destination_warehouse_id');
    }

    await shipment.populate(populateFields);

    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getShipments = async (req, res) => {
  try {
    const {
      warehouse_id,
      destination_warehouse_id,
      carrier_id,
      supplier_id,
      status,
      priority,
      shipment_type,
      start_date,
      end_date,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    if (warehouse_id) query.origin_warehouse_id = warehouse_id;
    if (destination_warehouse_id) query.destination_warehouse_id = destination_warehouse_id;
    if (carrier_id) query.carrier_id = carrier_id;
    if (supplier_id) query.supplier_id = supplier_id;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (shipment_type) query.shipment_type = shipment_type;

    if (start_date || end_date) {
      query.shipment_date = {};
      if (start_date) query.shipment_date.$gte = new Date(start_date);
      if (end_date) query.shipment_date.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(query)
      .populate([
        { path: 'items.item_id', populate: { path: 'sub_product_id supplier_id warehouse_section_id' } },
        'origin_warehouse_id',
        'destination_warehouse_id',
        'carrier_id',
        'employee_id',
        'supplier_id'
      ])
      .sort({ shipment_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shipment.countDocuments(query);

    res.json({
      shipments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalShipments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate([
        { path: 'items.item_id', populate: { path: 'sub_product_id supplier_id warehouse_section_id' } },
        'origin_warehouse_id',
        'destination_warehouse_id',
        'carrier_id',
        'employee_id',
        'supplier_id'
      ]);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    await shipment.populate([
      { path: 'items.item_id', populate: { path: 'sub_product_id supplier_id warehouse_section_id' } },
      'origin_warehouse_id',
      'destination_warehouse_id',
      'carrier_id',
      'employee_id',
      'supplier_id'
    ]);

    res.json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_transit', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };

    // Set delivery dates when status becomes delivered
    if (status === 'delivered') {
      updateData.actual_delivery_date = new Date();

      // For inbound shipments (supplier_to_warehouse), also set received_date
      const existingShipment = await Shipment.findById(req.params.id);
      if (existingShipment && existingShipment.shipment_type === 'supplier_to_warehouse') {
        updateData.received_date = new Date();
      }
    }

    const shipment = await Shipment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    await shipment.populate([
      { path: 'items.item_id', populate: { path: 'sub_product_id supplier_id warehouse_section_id' } },
      'origin_warehouse_id',
      'destination_warehouse_id',
      'carrier_id',
      'employee_id',
      'supplier_id'
    ]);

    res.json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    // Only allow deletion of pending shipments
    if (shipment.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete shipment that is already in transit or delivered' });
    }

    await Shipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShipmentStats = async (req, res) => {
  try {
    const { warehouse_id, start_date, end_date } = req.query;

    let matchQuery = {};
    if (warehouse_id) matchQuery.origin_warehouse_id = mongoose.Types.ObjectId(warehouse_id);
    if (start_date || end_date) {
      matchQuery.shipment_date = {};
      if (start_date) matchQuery.shipment_date.$gte = new Date(start_date);
      if (end_date) matchQuery.shipment_date.$lte = new Date(end_date);
    }

    const stats = await Shipment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};