import express from 'express';
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getWarehouseSections,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouseController.js';

const router = express.Router();

router.post('/', createWarehouse);
router.get('/', getWarehouses);
router.get('/:id', getWarehouseById);
router.get('/:id/sections', getWarehouseSections);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;