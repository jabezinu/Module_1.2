import mongoose from 'mongoose';

const subProductSchema = new mongoose.Schema({
  sub_product_id: { type: Number, unique: true },
  name: { type: String, required: true },
  unit_size: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
});

// Pre-save middleware to generate sub_product_id if not provided
subProductSchema.pre('save', async function(next) {
  if (!this.sub_product_id) {
    const lastSubProduct = await this.constructor.findOne({}, {}, { sort: { 'sub_product_id': -1 } });
    this.sub_product_id = lastSubProduct ? lastSubProduct.sub_product_id + 1 : 1;
  }
  next();
});

const SubProduct = mongoose.model('SubProduct', subProductSchema);

export default SubProduct;