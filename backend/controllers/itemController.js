import Item from '../models/Item.js';
import WarehouseSection from '../models/WarehouseSection.js';

export const createItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getItems = async (req, res) => {
  try {
    const { warehouse_id, section_id } = req.query;
    let query = {};
    if (warehouse_id) {
      const sections = await WarehouseSection.find({ warehouse_id });
      const sectionIds = sections.map(s => s._id);
      query.warehouse_section_id = { $in: sectionIds };
    }
    if (section_id) {
      query.warehouse_section_id = section_id;
    }
    const items = await Item.find(query).populate('sub_product_id supplier_id warehouse_section_id');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('sub_product_id supplier_id warehouse_section_id');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};