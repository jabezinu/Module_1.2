import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  getProductSubProducts,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/sub-products', getProductSubProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;