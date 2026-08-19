import { Router } from 'express';
import { getDashboardReports, getActivityLogs } from '../controllers/reportController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', verifyToken, requireRole('admin', 'manager', 'receptionist'), getDashboardReports);
router.get('/logs', verifyToken, requireRole('admin', 'manager'), getActivityLogs);

export default router;
