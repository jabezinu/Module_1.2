`import WarehouseSection from '../models/WarehouseSection.js';
import Warehouse from '../models/Warehouse.js';

export const createSection = async (req, res) => {
  try {
    const section = new WarehouseSection(req.body);
    await section.save();
    // Increment number_of_sections in the warehouse
    await Warehouse.findByIdAndUpdate(section.warehouse_id, { $inc: { number_of_sections: 1 } });
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSections = async (req, res) => {
  try {
    const sections = await WarehouseSection.find().populate('warehouse_id');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const section = await WarehouseSection.findById(req.params.id).populate('warehouse_id');
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const section = await WarehouseSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const section = await WarehouseSection.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    // Decrement number_of_sections in the warehouse
    await Warehouse.findByIdAndUpdate(section.warehouse_id, { $inc: { number_of_sections: -1 } });
    res.json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};