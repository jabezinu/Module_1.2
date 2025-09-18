import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  product_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String, required: true },
  storage_condition: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

export default Product;