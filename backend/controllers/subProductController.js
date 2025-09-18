import SubProduct from '../models/SubProduct.js';

export const createSubProduct = async (req, res) => {
  try {
    const subProduct = new SubProduct(req.body);
    await subProduct.save();
    res.status(201).json(subProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubProducts = async (req, res) => {
  try {
    const subProducts = await SubProduct.find().populate('product_id');
    res.json(subProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubProductById = async (req, res) => {
  try {
    const subProduct = await SubProduct.findById(req.params.id).populate('product_id');
    if (!subProduct) return res.status(404).json({ error: 'Sub-product not found' });
    res.json(subProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubProduct = async (req, res) => {
  try {
    const subProduct = await SubProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subProduct) return res.status(404).json({ error: 'Sub-product not found' });
    res.json(subProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSubProduct = async (req, res) => {
  try {
    const subProduct = await SubProduct.findByIdAndDelete(req.params.id);
    if (!subProduct) return res.status(404).json({ error: 'Sub-product not found' });
    res.json({ message: 'Sub-product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};