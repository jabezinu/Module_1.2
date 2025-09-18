import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item_id: { type: Number, required: true, unique: true },
  sub_product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubProduct', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse_section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseSection', required: true },
  expiration_date: { type: Date, required: true }
});

const Item = mongoose.model('Item', itemSchema);

export default Item;