import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  warehouse_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  size: { type: Number, required: true },
  capacity_unit: { type: String, required: true, default: 'metre cube' },
  number_of_sections: { type: Number, default: 0 },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }
});

// Pre-save middleware to generate warehouse_id if not provided
warehouseSchema.pre('save', async function(next) {
  if (!this.warehouse_id) {
    const lastWarehouse = await this.constructor.findOne({}, {}, { sort: { 'warehouse_id': -1 } });
    this.warehouse_id = lastWarehouse ? lastWarehouse.warehouse_id + 1 : 1;
  }
  next();
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;