import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  warehouse_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  size: { type: Number, required: true },
  capacity_unit: { type: String, required: true },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;