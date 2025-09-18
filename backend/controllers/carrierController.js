import Carrier from '../models/Carrier.js';

export const createCarrier = async (req, res) => {
  try {
    const carrier = new Carrier(req.body);
    await carrier.save();
    res.status(201).json(carrier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCarriers = async (req, res) => {
  try {
    const carriers = await Carrier.find();
    res.json(carriers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCarrierById = async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) return res.status(404).json({ error: 'Carrier not found' });
    res.json(carrier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCarrier = async (req, res) => {
  try {
    const carrier = await Carrier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!carrier) return res.status(404).json({ error: 'Carrier not found' });
    res.json(carrier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCarrier = async (req, res) => {
  try {
    const carrier = await Carrier.findByIdAndDelete(req.params.id);
    if (!carrier) return res.status(404).json({ error: 'Carrier not found' });
    res.json({ message: 'Carrier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};