import mongoose from 'mongoose';

const subProductSchema = new mongoose.Schema({
  sub_product_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  unit_size: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

const SubProduct = mongoose.model('SubProduct', subProductSchema);

export default SubProduct;