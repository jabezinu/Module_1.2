import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  product_id: { type: Number, unique: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String, required: true },
  storage_condition: { type: String, required: true }
});

// Pre-save middleware to generate product_id if not provided
productSchema.pre('save', async function(next) {
  if (!this.product_id) {
    const lastProduct = await this.constructor.findOne({}, {}, { sort: { 'product_id': -1 } });
    this.product_id = lastProduct ? lastProduct.product_id + 1 : 1;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;