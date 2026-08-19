import { Router } from 'express';
import { getAllInvoices, createInvoice } from '../controllers/invoiceController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), getAllInvoices);
router.post('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), createInvoice);

export default router;
