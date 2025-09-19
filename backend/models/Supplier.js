import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplier_id: { type: Number, unique: true },
  name: { type: String, required: true },
  contact_person: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true }
});

// Pre-save middleware to generate supplier_id if not provided
supplierSchema.pre('save', async function(next) {
  if (!this.supplier_id) {
    const lastSupplier = await this.constructor.findOne({}, {}, { sort: { 'supplier_id': -1 } });
    this.supplier_id = lastSupplier ? lastSupplier.supplier_id + 1 : 1;
  }
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;