import express from 'express';
import {
  createSubProduct,
  getSubProducts,
  getSubProductById,
  updateSubProduct,
  deleteSubProduct
} from '../controllers/subProductController.js';

const router = express.Router();

router.post('/', createSubProduct);
router.get('/', getSubProducts);
router.get('/:id', getSubProductById);
router.put('/:id', updateSubProduct);
router.delete('/:id', deleteSubProduct);

export default router;