import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplier_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  contact_person: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true }
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;