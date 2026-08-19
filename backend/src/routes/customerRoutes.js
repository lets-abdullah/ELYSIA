import { Router } from 'express';
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerPayment,
  deleteCustomer
} from '../controllers/customerController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), getAllCustomers);
router.post('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), createCustomer);
router.put('/:id/payment', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateCustomerPayment);
router.put('/:id', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateCustomer);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), deleteCustomer);

export default router;
