import express from 'express';
import {
  createCarrier,
  getCarriers,
  getCarrierById,
  updateCarrier,
  deleteCarrier
} from '../controllers/carrierController.js';

const router = express.Router();

router.post('/', createCarrier);
router.get('/', getCarriers);
router.get('/:id', getCarrierById);
router.put('/:id', updateCarrier);
router.delete('/:id', deleteCarrier);

export default router;