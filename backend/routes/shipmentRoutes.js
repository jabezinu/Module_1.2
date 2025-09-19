import express from 'express';
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  getShipmentStats
} from '../controllers/shipmentController.js';

const router = express.Router();

// Create a new shipment
router.post('/', createShipment);

// Get all shipments with filtering and pagination
router.get('/', getShipments);

// Get shipment statistics
router.get('/stats', getShipmentStats);

// Get a specific shipment by ID
router.get('/:id', getShipmentById);

// Update a shipment
router.put('/:id', updateShipment);

// Update shipment status
router.patch('/:id/status', updateShipmentStatus);

// Delete a shipment
router.delete('/:id', deleteShipment);

export default router;