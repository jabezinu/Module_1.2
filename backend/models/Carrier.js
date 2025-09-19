import mongoose from 'mongoose';

const carrierSchema = new mongoose.Schema({
  carrier_id: { type: Number, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  service_type: { type: String, required: true }
});

// Pre-save middleware to generate carrier_id if not provided
carrierSchema.pre('save', async function(next) {
  if (!this.carrier_id) {
    const lastCarrier = await this.constructor.findOne({}, {}, { sort: { 'carrier_id': -1 } });
    this.carrier_id = lastCarrier ? lastCarrier.carrier_id + 1 : 1;
  }
  next();
});

const Carrier = mongoose.model('Carrier', carrierSchema);

export default Carrier;