import mongoose from 'mongoose';

const warehouseSectionSchema = new mongoose.Schema({
  section_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  section_type: { type: String, required: true },
  temperature_range: { type: String, required: true },
  is_available: { type: Boolean, default: true }
});

const WarehouseSection = mongoose.model('WarehouseSection', warehouseSectionSchema);

export default WarehouseSection;