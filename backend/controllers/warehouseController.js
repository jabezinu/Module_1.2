import Warehouse from '../models/Warehouse.js';
import WarehouseSection from '../models/WarehouseSection.js';

export const createWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().populate('manager_id');
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id).populate('manager_id');
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouseSections = async (req, res) => {
  try {
    const sections = await WarehouseSection.find({ warehouse_id: req.params.id });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(warehouse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};