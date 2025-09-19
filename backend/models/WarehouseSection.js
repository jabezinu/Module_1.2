import mongoose from 'mongoose';

const warehouseSectionSchema = new mongoose.Schema({
  section_id: { type: Number, unique: true },
  name: { type: String, required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  section_type: { type: String, required: true },
  temperature_range: { type: String, required: true },
  is_available: { type: Boolean, default: true }
});

// Pre-save middleware to generate section_id if not provided
warehouseSectionSchema.pre('save', async function(next) {
  if (!this.section_id) {
    const lastSection = await this.constructor.findOne({}, {}, { sort: { 'section_id': -1 } });
    this.section_id = lastSection ? lastSection.section_id + 1 : 1;
  }
  next();
});

const WarehouseSection = mongoose.model('WarehouseSection', warehouseSectionSchema);

export default WarehouseSection;