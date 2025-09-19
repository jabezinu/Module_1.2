import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item_id: { type: Number, required: true, unique: true },
  sub_product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProduct', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse_section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseSection', required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  expiration_date: { type: Date, required: true }
});

// Pre-save middleware to generate item_id if not provided
itemSchema.pre('save', async function(next) {
  if (!this.item_id) {
    const lastItem = await this.constructor.findOne({}, {}, { sort: { 'item_id': -1 } });
    this.item_id = lastItem ? lastItem.item_id + 1 : 1;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

export default Item;