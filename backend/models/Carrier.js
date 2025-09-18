import mongoose from 'mongoose';

const carrierSchema = new mongoose.Schema({
  carrier_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  service_type: { type: String, required: true }
});

const Carrier = mongoose.model('Carrier', carrierSchema);

export default Carrier;