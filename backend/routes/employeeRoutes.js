import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getWarehouseEmployees
} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/', createEmployee);
router.get('/', getEmployees);
router.get('/warehouse/:warehouseId', getWarehouseEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;